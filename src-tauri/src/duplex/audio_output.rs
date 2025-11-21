/**
 * 🔊 Audio Output - Sortie TTS streaming avec atténuation intelligente
 * Réduit volume si humain parle, coupe si interruption
 */

use std::sync::{Arc, Mutex};
use std::sync::atomic::{AtomicBool, AtomicU8, Ordering};
use tokio::sync::mpsc;

pub struct AudioOutput {
    is_playing: Arc<AtomicBool>,
    volume: Arc<AtomicU8>, // 0-100
    audio_rx: Arc<Mutex<mpsc::Receiver<OutputChunk>>>,
    interrupt_flag: Arc<AtomicBool>,
}

#[derive(Debug, Clone)]
pub struct OutputChunk {
    pub samples: Vec<f32>,
    pub timestamp: i64,
    pub is_final: bool,
}

impl AudioOutput {
    pub fn new(audio_rx: mpsc::Receiver<OutputChunk>) -> Self {
        Self {
            is_playing: Arc::new(AtomicBool::new(false)),
            volume: Arc::new(AtomicU8::new(100)),
            audio_rx: Arc::new(Mutex::new(audio_rx)),
            interrupt_flag: Arc::new(AtomicBool::new(false)),
        }
    }

    /// Démarrer lecture
    pub async fn start(&self) -> Result<(), String> {
        if self.is_playing.load(Ordering::Relaxed) {
            return Ok(());
        }

        self.is_playing.store(true, Ordering::Relaxed);
        println!("[AudioOutput] Lecture démarrée");

        let is_playing = Arc::clone(&self.is_playing);
        let volume = Arc::clone(&self.volume);
        let audio_rx = Arc::clone(&self.audio_rx);
        let interrupt_flag = Arc::clone(&self.interrupt_flag);

        tokio::spawn(async move {
            let mut rx = audio_rx.lock().unwrap();
            
            while is_playing.load(Ordering::Relaxed) {
                // Vérifier interruption
                if interrupt_flag.load(Ordering::Relaxed) {
                    println!("[AudioOutput] Interruption détectée - arrêt lecture");
                    Self::stop_playback();
                    interrupt_flag.store(false, Ordering::Relaxed);
                    continue;
                }

                // Recevoir chunk audio
                match rx.recv().await {
                    Some(chunk) => {
                        let current_volume = volume.load(Ordering::Relaxed) as f32 / 100.0;
                        Self::play_chunk(&chunk, current_volume).await;
                        
                        if chunk.is_final {
                            println!("[AudioOutput] Lecture terminée");
                        }
                    }
                    None => {
                        break;
                    }
                }
            }
            
            println!("[AudioOutput] Lecture arrêtée");
        });

        Ok(())
    }

    /// Arrêter lecture
    pub fn stop(&self) {
        self.is_playing.store(false, Ordering::Relaxed);
    }

    /// Est en lecture?
    pub fn is_playing(&self) -> bool {
        self.is_playing.load(Ordering::Relaxed)
    }

    /// Ajuster volume (0-100)
    pub fn set_volume(&self, volume: u8) {
        self.volume.store(volume.min(100), Ordering::Relaxed);
        println!("[AudioOutput] Volume ajusté: {}%", volume.min(100));
    }

    /// Obtenir volume actuel
    pub fn get_volume(&self) -> u8 {
        self.volume.load(Ordering::Relaxed)
    }

    /// Atténuer automatiquement (pour duplex)
    pub fn attenuate(&self, factor: f32) {
        let current = self.volume.load(Ordering::Relaxed) as f32;
        let new_volume = (current * factor).clamp(0.0, 100.0) as u8;
        self.volume.store(new_volume, Ordering::Relaxed);
    }

    /// Déclencher interruption
    pub fn interrupt(&self) {
        self.interrupt_flag.store(true, Ordering::Relaxed);
    }

    // ===== PLAYBACK =====

    async fn play_chunk(chunk: &OutputChunk, volume: f32) {
        // TODO: Remplacer par vrai audio output (cpal/portaudio)
        // Simuler lecture
        let duration_ms = (chunk.samples.len() as f32 / 16000.0 * 1000.0) as u64;
        tokio::time::sleep(tokio::time::Duration::from_millis(duration_ms)).await;
    }

    fn stop_playback() {
        // TODO: Arrêter immédiatement le playback hardware
        println!("[AudioOutput] Playback immédiatement arrêté");
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_audio_output_volume() {
        let (_tx, rx) = mpsc::channel(10);
        let output = AudioOutput::new(rx);
        
        assert_eq!(output.get_volume(), 100);
        
        output.set_volume(50);
        assert_eq!(output.get_volume(), 50);
        
        output.set_volume(150); // Over limit
        assert_eq!(output.get_volume(), 100);
    }

    #[tokio::test]
    async fn test_audio_output_interrupt() {
        let (_tx, rx) = mpsc::channel(10);
        let output = AudioOutput::new(rx);
        
        assert!(!output.interrupt_flag.load(Ordering::Relaxed));
        
        output.interrupt();
        assert!(output.interrupt_flag.load(Ordering::Relaxed));
    }
}
