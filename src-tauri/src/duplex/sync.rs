/**
 * ⚡ Duplex Sync - Synchronisation entrée/sortie full duplex
 * Gère interruptions, atténuation automatique, coordination pipelines
 */

use std::sync::{Arc, Mutex};
use std::sync::atomic::{AtomicBool, Ordering};

pub struct DuplexSync {
    is_user_speaking: Arc<AtomicBool>,
    is_ai_speaking: Arc<AtomicBool>,
    should_interrupt: Arc<AtomicBool>,
    attenuation_level: Arc<Mutex<f32>>,
}

impl DuplexSync {
    pub fn new() -> Self {
        Self {
            is_user_speaking: Arc::new(AtomicBool::new(false)),
            is_ai_speaking: Arc::new(AtomicBool::new(false)),
            should_interrupt: Arc::new(AtomicBool::new(false)),
            attenuation_level: Arc::new(Mutex::new(1.0)),
        }
    }

    /// Notifier: utilisateur commence à parler
    pub fn user_started_speaking(&self) {
        self.is_user_speaking.store(true, Ordering::Relaxed);
        
        // Si IA parle, déclencher atténuation/interruption
        if self.is_ai_speaking.load(Ordering::Relaxed) {
            self.should_interrupt.store(true, Ordering::Relaxed);
            self.set_attenuation(0.2); // Réduire à 20%
            println!("[DuplexSync] User parle → IA atténuée/interrompue");
        }
    }

    /// Notifier: utilisateur arrête de parler
    pub fn user_stopped_speaking(&self) {
        self.is_user_speaking.store(false, Ordering::Relaxed);
        
        // Restaurer volume IA si elle parle toujours
        if self.is_ai_speaking.load(Ordering::Relaxed) {
            self.set_attenuation(1.0);
            self.should_interrupt.store(false, Ordering::Relaxed);
        }
    }

    /// Notifier: IA commence à parler
    pub fn ai_started_speaking(&self) {
        self.is_ai_speaking.store(true, Ordering::Relaxed);
        
        // Si user parle déjà, atténuer immédiatement
        if self.is_user_speaking.load(Ordering::Relaxed) {
            self.set_attenuation(0.2);
        }
    }

    /// Notifier: IA arrête de parler
    pub fn ai_stopped_speaking(&self) {
        self.is_ai_speaking.store(false, Ordering::Relaxed);
        self.set_attenuation(1.0);
        self.should_interrupt.store(false, Ordering::Relaxed);
    }

    /// Vérifier si utilisateur parle
    pub fn is_user_speaking(&self) -> bool {
        self.is_user_speaking.load(Ordering::Relaxed)
    }

    /// Vérifier si IA parle
    pub fn is_ai_speaking(&self) -> bool {
        self.is_ai_speaking.load(Ordering::Relaxed)
    }

    /// Vérifier si interruption nécessaire
    pub fn should_interrupt(&self) -> bool {
        self.should_interrupt.load(Ordering::Relaxed)
    }

    /// Obtenir niveau atténuation (0.0-1.0)
    pub fn get_attenuation(&self) -> f32 {
        *self.attenuation_level.lock().unwrap()
    }

    /// Définir niveau atténuation
    fn set_attenuation(&self, level: f32) {
        let clamped = level.clamp(0.0, 1.0);
        *self.attenuation_level.lock().unwrap() = clamped;
    }

    /// Réinitialiser l'état
    pub fn reset(&self) {
        self.is_user_speaking.store(false, Ordering::Relaxed);
        self.is_ai_speaking.store(false, Ordering::Relaxed);
        self.should_interrupt.store(false, Ordering::Relaxed);
        self.set_attenuation(1.0);
    }

    /// Obtenir état complet (pour debug/UI)
    pub fn get_state(&self) -> DuplexState {
        DuplexState {
            user_speaking: self.is_user_speaking(),
            ai_speaking: self.is_ai_speaking(),
            should_interrupt: self.should_interrupt(),
            attenuation: self.get_attenuation(),
        }
    }
}

#[derive(Debug, Clone)]
pub struct DuplexState {
    pub user_speaking: bool,
    pub ai_speaking: bool,
    pub should_interrupt: bool,
    pub attenuation: f32,
}

impl Default for DuplexSync {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_duplex_sync_creation() {
        let sync = DuplexSync::new();
        assert!(!sync.is_user_speaking());
        assert!(!sync.is_ai_speaking());
        assert!(!sync.should_interrupt());
        assert_eq!(sync.get_attenuation(), 1.0);
    }

    #[test]
    fn test_user_speaking_interrupts_ai() {
        let sync = DuplexSync::new();
        
        sync.ai_started_speaking();
        assert!(sync.is_ai_speaking());
        
        sync.user_started_speaking();
        assert!(sync.is_user_speaking());
        assert!(sync.should_interrupt());
        assert_eq!(sync.get_attenuation(), 0.2);
    }

    #[test]
    fn test_attenuation_restore() {
        let sync = DuplexSync::new();
        
        sync.ai_started_speaking();
        sync.user_started_speaking();
        assert_eq!(sync.get_attenuation(), 0.2);
        
        sync.user_stopped_speaking();
        assert_eq!(sync.get_attenuation(), 1.0);
    }

    #[test]
    fn test_reset() {
        let sync = DuplexSync::new();
        
        sync.user_started_speaking();
        sync.ai_started_speaking();
        
        sync.reset();
        
        assert!(!sync.is_user_speaking());
        assert!(!sync.is_ai_speaking());
        assert_eq!(sync.get_attenuation(), 1.0);
    }
}
