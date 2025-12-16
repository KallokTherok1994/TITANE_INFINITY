/**
 * 🎤 Audio Input - Capture continue streaming pour full duplex
 * Ne se coupe jamais, même pendant output
 */
use std::sync::{Arc, Mutex};
use std::sync::atomic::{AtomicBool, Ordering};
use tokio::sync::mpsc;

pub struct AudioInput {
    is_active: Arc<AtomicBool>,
    sample_rate: u32,
    chunk_size: usize,
    audio_tx: mpsc::Sender<AudioChunk>,
}

#[derive(Debug, Clone)]
pub struct AudioChunk {
    pub samples: Vec<f32>,
    pub timestamp: i64,
    pub energy: f32,
    pub has_voice: bool,
}

impl AudioInput {
    pub fn new(sample_rate: u32, audio_tx: mpsc::Sender<AudioChunk>) -> Self {
        Self {
            is_active: Arc::new(AtomicBool::new(false)),
            sample_rate,
            chunk_size: (sample_rate as f32 * 0.1) as usize, // 100ms chunks
            audio_tx,
        }
    }

    /// Démarrer capture continue
    pub async fn start(&self) -> Result<(), String> {
        if self.is_active.load(Ordering::Relaxed) {
            return Ok(());
        }

        self.is_active.store(true, Ordering::Relaxed);
        println!("[AudioInput] Capture continue démarrée ({}Hz, {}ms chunks)", 
            self.sample_rate, (self.chunk_size as f32 / self.sample_rate as f32 * 1000.0) as u32);

        let is_active = Arc::clone(&self.is_active);
        let audio_tx = self.audio_tx.clone();
        let chunk_size = self.chunk_size;

        tokio::spawn(async move {
            while is_active.load(Ordering::Relaxed) {
                // Implementation: Real-time audio capture with cpal
                // - Library: cpal = "0.15" (cross-platform audio I/O)
                // - Device: let device = host.default_input_device()?;
                // - Config: StreamConfig {channels: 1, sample_rate: 16000, buffer_size: chunk_size}
                // - Stream: device.build_input_stream(config, move |data, _| { process_audio(data) }, err_fn)?;
                // - Processing: Convert f32 samples to i16 PCM, send via audio_tx channel
                // - Alternative: Use portaudio-rs for more control over latency/buffer size
                // - Performance: ~5-10ms latency with optimized buffer size
                let chunk = Self::capture_mock_chunk(chunk_size).await;
                
                if let Err(e) = audio_tx.send(chunk).await {
                    eprintln!("[AudioInput] Chunk send error: {}", e);
                    break;
                }
                
                tokio::time::sleep(tokio::time::Duration::from_millis(50)).await;
            }
            println!("[AudioInput] Capture arrêtée");
        });

        Ok(())
    }

    /// Arrêter capture
    pub fn stop(&self) {
        self.is_active.store(false, Ordering::Relaxed);
    }

    /// Est actif?
    pub fn is_active(&self) -> bool {
        self.is_active.load(Ordering::Relaxed)
    }

    // ===== MOCK =====
    
    async fn capture_mock_chunk(size: usize) -> AudioChunk {
        use rand::Rng;
        let mut rng = rand::thread_rng();
        
        // Simuler audio avec bruit + voix occasionnelle
        let samples: Vec<f32> = (0..size)
            .map(|_| rng.gen_range(-0.1..0.1))
            .collect();
        
        let energy = Self::calculate_energy(&samples);
        let has_voice = energy > 0.02;
        
        AudioChunk {
            samples,
            timestamp: chrono::Utc::now().timestamp_millis(),
            energy,
            has_voice,
        }
    }

    fn calculate_energy(samples: &[f32]) -> f32 {
        let sum: f32 = samples.iter().map(|&s| s * s).sum();
        (sum / samples.len() as f32).sqrt()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_audio_input_start_stop() {
        let (tx, _rx) = mpsc::channel(10);
        let input = AudioInput::new(16000, tx);
        
        assert!(!input.is_active());
        
        input.start().await.unwrap();
        assert!(input.is_active());
        
        tokio::time::sleep(tokio::time::Duration::from_millis(200)).await;
        
        input.stop();
        assert!(!input.is_active());
    }
}
