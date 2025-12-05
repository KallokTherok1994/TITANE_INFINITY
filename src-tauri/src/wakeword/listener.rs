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
                // TODO: Intégrer vrai audio capture ici
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
        // TODO: Remplacer par:
        // - Silero VAD + keyword spotting
        // - Porcupine wake word engine
        // - Whisper tiny pour hotword detection
        
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
        
        listener.start().await.unwrap();
        assert!(listener.is_listening());
        
        listener.stop();
        assert!(!listener.is_listening());
    }

    #[tokio::test]
    async fn test_wakeword_sensitivity() {
        let (tx, _rx) = mpsc::channel(10);
        let mut listener = WakewordListener::new(tx);
        
        listener.set_sensitivity(0.9);
        // Sensitivity devrait être 0.9
        
        listener.set_sensitivity(1.5); // Out of bounds
        // Devrait être clampé à 1.0
    }
}
