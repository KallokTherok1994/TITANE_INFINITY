//! Healing Recovery Module
//! Handles system recovery operations

use log::info;

/// Recovery manager for healing system
pub struct RecoveryManager {
    enabled: bool,
    recovery_count: u32,
    max_retries: u32,
}

impl RecoveryManager {
    pub fn new() -> Self {
        info!("RecoveryManager initialized");
        Self {
            enabled: true,
            recovery_count: 0,
            max_retries: 3,
        }
    }

    pub fn is_enabled(&self) -> bool {
        self.enabled
    }

    pub fn enable(&mut self) {
        self.enabled = true;
    }

    pub fn disable(&mut self) {
        self.enabled = false;
    }

    pub fn recovery_count(&self) -> u32 {
        self.recovery_count
    }

    pub fn max_retries(&self) -> u32 {
        self.max_retries
    }

    pub fn set_max_retries(&mut self, max: u32) {
        self.max_retries = max;
    }

    pub async fn recover(&mut self) -> Result<(), String> {
        if !self.enabled {
            return Err("Recovery disabled".to_string());
        }
        self.recovery_count += 1;
        info!(
            "Recovery operation executed (count: {})",
            self.recovery_count
        );
        Ok(())
    }

    pub fn reset_count(&mut self) {
        self.recovery_count = 0;
    }

    pub fn can_retry(&self) -> bool {
        self.recovery_count < self.max_retries
    }
}

impl Default for RecoveryManager {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_recovery_manager_new() {
        let manager = RecoveryManager::new();
        assert!(manager.is_enabled());
        assert_eq!(manager.recovery_count(), 0);
        assert_eq!(manager.max_retries(), 3);
    }

    #[test]
    fn test_recovery_manager_default() {
        let manager = RecoveryManager::default();
        assert!(manager.is_enabled());
    }

    #[test]
    fn test_enable_disable() {
        let mut manager = RecoveryManager::new();
        assert!(manager.is_enabled());

        manager.disable();
        assert!(!manager.is_enabled());

        manager.enable();
        assert!(manager.is_enabled());
    }

    #[tokio::test]
    async fn test_recover_success() {
        let mut manager = RecoveryManager::new();
        let result = manager.recover().await;

        assert!(result.is_ok());
        assert_eq!(manager.recovery_count(), 1);
    }

    #[tokio::test]
    async fn test_recover_disabled() {
        let mut manager = RecoveryManager::new();
        manager.disable();

        let result = manager.recover().await;
        assert!(result.is_err());
        assert_eq!(result.unwrap_err(), "Recovery disabled");
    }

    #[tokio::test]
    async fn test_recover_increments_count() {
        let mut manager = RecoveryManager::new();

        for i in 1..=5 {
            let _ = manager.recover().await;
            assert_eq!(manager.recovery_count(), i);
        }
    }

    #[test]
    fn test_reset_count() {
        let mut manager = RecoveryManager::new();
        manager.recovery_count = 5;
        manager.reset_count();
        assert_eq!(manager.recovery_count(), 0);
    }

    #[test]
    fn test_can_retry() {
        let mut manager = RecoveryManager::new();
        assert!(manager.can_retry());

        manager.recovery_count = 3;
        assert!(!manager.can_retry());
    }

    #[test]
    fn test_set_max_retries() {
        let mut manager = RecoveryManager::new();
        manager.set_max_retries(10);
        assert_eq!(manager.max_retries(), 10);
    }

    #[test]
    fn test_can_retry_with_custom_max() {
        let mut manager = RecoveryManager::new();
        manager.set_max_retries(5);
        manager.recovery_count = 4;
        assert!(manager.can_retry());

        manager.recovery_count = 5;
        assert!(!manager.can_retry());
    }
}
