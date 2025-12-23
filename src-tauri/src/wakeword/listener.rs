/**
 * 🎯 Wakeword Listener - Écoute passive continue pour détecter "TITANE"
 * Ultra-léger, <200ms latence, zéro envoi réseau
 */
use std::sync::{Arc, Mutex};
use std::sync::atomic::{AtomicBool, Ordering};
use tokio::sync::mpsc;

pub struct WakewordListener {
    is_listening: Arc<AtomicBool>,
    is_active: Arc<AtomicBool>,
    trigger_tx: mpsc::Sender<WakewordTrigger>,
    sensitivity: f32,
}

#[derive(Debug, Clone)]
pub struct WakewordTrigger {
    pub keyword: String,
    pub confidence: f32,
    pub timestamp: i64,
    pub audio_sample: Vec<f32>,
}

impl WakewordListener {
    pub fn new(trigger_tx: mpsc::Sender<WakewordTrigger>) -> Self {
        Self {
            is_listening: Arc::new(AtomicBool::new(false)),
            is_active: Arc::new(AtomicBool::new(false)),
            trigger_tx,
            sensitivity: 0.7, // 70% confidence minimum
        }
    }

    /// Démarrer l'écoute passive
    pub async fn start(&self) -> Result<(), String> {
        if self.is_listening.load(Ordering::Relaxed) {
            return Ok(());
        }

        self.is_listening.store(true, Ordering::Relaxed);
        
        println!("[Wakeword] Écoute passive activée - Attendant 'TITANE'...");
        
        let is_listening = Arc::clone(&self.is_listening);
        let is_active = Arc::clone(&self.is_active);
        let trigger_tx = self.trigger_tx.clone();
        let sensitivity = self.sensitivity;

        tokio::spawn(async move {
            // Simuler l'écoute audio continue (remplacer par vrai audio input)
            while is_listening.load(Ordering::Relaxed) {
                // Implementation: Real audio capture integration
                // - Library: cpal crate for cross-platform audio input
                // - Device: Select default input device with cpal::default_host().default_input_device()
                // - Config: StreamConfig {channels: 1, sample_rate: 16000, buffer_size: 512}
                // - Buffer: Capture 512 samples (~32ms) per callback
                // - Processing: Convert samples to f32 in [-1.0, 1.0] range
                // - Thread safety: Use crossbeam::channel to send audio chunks to detection thread
                // - Error handling: Reconnect on device disconnect, fallback to mock on error
                // let audio_buffer = capture_audio_chunk().await;
                
                // Simuler détection hotword (remplacer par vrai engine)
                let detected = Self::detect_wakeword_mock(sensitivity).await;
                
                if let Some(trigger) = detected {
                    println!("[Wakeword] ✅ DÉTECTÉ: '{}' (confidence: {:.2}%)", 
                        trigger.keyword, trigger.confidence * 100.0);
                    
                    is_active.store(true, Ordering::Relaxed);
                    
                    if let Err(e) = trigger_tx.send(trigger).await {
                        eprintln!("[Wakeword] Erreur envoi trigger: {}", e);
                    }
                }
                
                tokio::time::sleep(tokio::time::Duration::from_millis(100)).await;
            }
        });

        Ok(())
    }

    /// Arrêter l'écoute
    pub fn stop(&self) {
        self.is_listening.store(false, Ordering::Relaxed);
        self.is_active.store(false, Ordering::Relaxed);
        println!("[Wakeword] Écoute passive désactivée");
    }

    /// Vérifier si en écoute
    pub fn is_listening(&self) -> bool {
        self.is_listening.load(Ordering::Relaxed)
    }

    /// Vérifier si wakeword activé
    pub fn is_active(&self) -> bool {
        self.is_active.load(Ordering::Relaxed)
    }

    /// Réinitialiser l'état actif
    pub fn reset_active(&self) {
        self.is_active.store(false, Ordering::Relaxed);
    }

    /// Ajuster la sensibilité (0.0 - 1.0)
    pub fn set_sensitivity(&mut self, sensitivity: f32) {
        self.sensitivity = sensitivity.clamp(0.0, 1.0);
        println!("[Wakeword] Sensibilité ajustée: {:.0}%", self.sensitivity * 100.0);
    }

    // ===== MOCK - À remplacer par vrai moteur =====
    
    async fn detect_wakeword_mock(sensitivity: f32) -> Option<WakewordTrigger> {
        // Simuler détection aléatoire pour tests
        // Implementation: Replace with production-grade wakeword engines
        // - Option 1 (Silero VAD): Voice Activity Detection + keyword spotting
        //   * VAD: silero-vad-rs crate for speech detection (95%+ accuracy)
        //   * Keyword: Custom LSTM model trained on "TITANE" samples
        // - Option 2 (Porcupine): Picovoice porcupine-rs for wake word engine
        //   * Keywords: Pre-trained "JARVIS" or custom "TITANE" model
        //   * Latency: <100ms detection, ~5% false positive rate
        // - Option 3 (Whisper tiny): OpenAI whisper.cpp for hotword detection
        //   * Model: tiny.en (39MB) or base.en (74MB) for low latency
        //   * Accuracy: 98%+ but higher CPU usage (not ideal for continuous listening)
        // - Hybrid approach: Silero VAD (lightweight) → Porcupine (accurate) pipeline
        
        use rand::Rng;
        let mut rng = rand::thread_rng();
        
        // 1% chance de détecter le mot (pour simulation)
        if rng.gen_bool(0.01) {
            Some(WakewordTrigger {
                keyword: "TITANE".to_string(),
                confidence: rng.gen_range(sensitivity..1.0),
                timestamp: chrono::Utc::now().timestamp_millis(),
                audio_sample: vec![0.0; 1600], // 100ms @ 16kHz
            })
        } else {
            None
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_wakeword_listener_start_stop() {
        let (tx, _rx) = mpsc::channel(10);
        let listener = WakewordListener::new(tx);

        assert!(!listener.is_listening());

        listener
            .start()
            .await
            .expect("listener start should succeed");
        assert!(listener.is_listening());

        listener.stop();
        assert!(!listener.is_listening());
    }

    #[tokio::test]
    async fn test_wakeword_sensitivity() {
        let (tx, _rx) = mpsc::channel(10);
        let mut listener = WakewordListener::new(tx);

        listener.set_sensitivity(0.9);
        assert_eq!(listener.sensitivity, 0.9);

        listener.set_sensitivity(1.5); // Out of bounds
        assert_eq!(listener.sensitivity, 1.0); // Clamped

        listener.set_sensitivity(-0.5); // Negative
        assert_eq!(listener.sensitivity, 0.0); // Clamped to 0
    }

    #[tokio::test]
    async fn test_listener_initial_state() {
        let (tx, _rx) = mpsc::channel(10);
        let listener = WakewordListener::new(tx);

        assert!(!listener.is_listening());
        assert!(!listener.is_active());
        assert_eq!(listener.sensitivity, 0.7); // Default
    }

    #[tokio::test]
    async fn test_reset_active() {
        let (tx, _rx) = mpsc::channel(10);
        let listener = WakewordListener::new(tx);

        // Manually set active (simulating detection)
        listener.is_active.store(true, Ordering::Relaxed);
        assert!(listener.is_active());

        listener.reset_active();
        assert!(!listener.is_active());
    }

    #[tokio::test]
    async fn test_double_start() {
        let (tx, _rx) = mpsc::channel(10);
        let listener = WakewordListener::new(tx);

        // First start
        listener
            .start()
            .await
            .expect("listener start should succeed");
        assert!(listener.is_listening());

        // Second start should be OK (idempotent)
        let result = listener.start().await;
        assert!(result.is_ok());

        listener.stop();
    }

    #[tokio::test]
    async fn test_stop_clears_active() {
        let (tx, _rx) = mpsc::channel(10);
        let listener = WakewordListener::new(tx);

        listener
            .start()
            .await
            .expect("listener start should succeed");
        listener.is_active.store(true, Ordering::Relaxed);

        listener.stop();

        assert!(!listener.is_listening());
        assert!(!listener.is_active());
    }

    #[test]
    fn test_wakeword_trigger_structure() {
        let trigger = WakewordTrigger {
            keyword: "TITANE".to_string(),
            confidence: 0.85,
            timestamp: 1234567890,
            audio_sample: vec![0.1, 0.2, 0.3],
        };

        assert_eq!(trigger.keyword, "TITANE");
        assert_eq!(trigger.confidence, 0.85);
        assert_eq!(trigger.timestamp, 1234567890);
        assert_eq!(trigger.audio_sample.len(), 3);
    }

    #[test]
    fn test_wakeword_trigger_clone() {
        let trigger = WakewordTrigger {
            keyword: "TITANE".to_string(),
            confidence: 0.9,
            timestamp: 1000,
            audio_sample: vec![0.5; 100],
        };

        let cloned = trigger.clone();
        assert_eq!(cloned.keyword, trigger.keyword);
        assert_eq!(cloned.confidence, trigger.confidence);
        assert_eq!(cloned.audio_sample.len(), trigger.audio_sample.len());
    }

    #[tokio::test]
    async fn test_sensitivity_boundaries() {
        let (tx, _rx) = mpsc::channel(10);
        let mut listener = WakewordListener::new(tx);

        // Test exact boundaries
        listener.set_sensitivity(0.0);
        assert_eq!(listener.sensitivity, 0.0);

        listener.set_sensitivity(1.0);
        assert_eq!(listener.sensitivity, 1.0);

        listener.set_sensitivity(0.5);
        assert_eq!(listener.sensitivity, 0.5);
    }
}
