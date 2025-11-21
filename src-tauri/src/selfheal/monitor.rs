#![allow(dead_code)]
// ╔══════════════════════════════════════════════════════════════════════════════╗
// ║                       SYSTEM MONITOR v13                                     ║
// ║              Surveillance continue des modules TITANE∞                       ║
// ╚══════════════════════════════════════════════════════════════════════════════╝

use super::{HealthStatus, IssueType, SystemIncident};
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::RwLock;
use std::time::{Duration, Instant};

/// Surveillance système
pub struct SystemMonitor {
    health_status: Arc<RwLock<HealthStatus>>,
    module_health: Arc<RwLock<HashMap<String, ModuleHealth>>>,
    incidents: Arc<RwLock<Vec<SystemIncident>>>,
    monitoring_active: Arc<RwLock<bool>>,
}

#[derive(Debug, Clone)]
struct ModuleHealth {
    name: String,
    status: HealthStatus,
    last_check: Instant,
    response_time_ms: u64,
    error_count: u32,
}

impl SystemMonitor {
    /// Crée un nouveau moniteur
    pub fn new() -> Self {
        Self {
            health_status: Arc::new(RwLock::new(HealthStatus::Healthy)),
            module_health: Arc::new(RwLock::new(HashMap::new())),
            incidents: Arc::new(RwLock::new(Vec::new())),
            monitoring_active: Arc::new(RwLock::new(false)),
        }
    }

    /// Démarre la surveillance continue
    pub async fn start_monitoring(&self) {
        let mut active = self.monitoring_active.write().await;
        *active = true;

        // Initialiser les modules à surveiller
        let modules = vec![
            "ASR", "TTS", "Ollama", "Gemini", "Memory", 
            "Duplex", "Wakeword", "Emotion", "Interruptibility"
        ];

        let mut health_map = self.module_health.write().await;
        for module in modules {
            health_map.insert(
                module.to_string(),
                ModuleHealth {
                    name: module.to_string(),
                    status: HealthStatus::Healthy,
                    last_check: Instant::now(),
                    response_time_ms: 0,
                    error_count: 0,
                },
            );
        }
    }

    /// Vérifie la santé d'un module spécifique
    pub async fn check_module_health(&self, module_name: &str) -> Result<HealthStatus, String> {
        let health_map = self.module_health.read().await;
        
        match health_map.get(module_name) {
            Some(health) => Ok(health.status.clone()),
            None => Err(format!("Module {} not monitored", module_name)),
        }
    }

    /// Enregistre une erreur de module
    pub async fn report_module_error(&self, module_name: &str, _error_msg: &str) {
        let mut health_map = self.module_health.write().await;
        
        if let Some(health) = health_map.get_mut(module_name) {
            health.error_count += 1;
            health.last_check = Instant::now();

            // Dégrader le statut selon le nombre d'erreurs
            health.status = match health.error_count {
                1..=2 => HealthStatus::Degraded,
                3..=5 => HealthStatus::Critical,
                _ => HealthStatus::Critical,
            };

            // Créer un incident si critique
            if matches!(health.status, HealthStatus::Critical) {
                let issue_type = Self::error_to_issue_type(module_name);
                let incident = SystemIncident::new(issue_type);
                
                let mut incidents = self.incidents.write().await;
                incidents.push(incident);
            }
        }

        // Mettre à jour le statut global
        self.update_global_health().await;
    }

    /// Enregistre une récupération de module
    pub async fn report_module_recovery(&self, module_name: &str) {
        let mut health_map = self.module_health.write().await;
        
        if let Some(health) = health_map.get_mut(module_name) {
            health.status = HealthStatus::Healthy;
            health.error_count = 0;
            health.last_check = Instant::now();
        }

        self.update_global_health().await;
    }

    /// Met à jour le statut de santé global
    async fn update_global_health(&self) {
        let health_map = self.module_health.read().await;
        
        let critical_count = health_map.values()
            .filter(|h| matches!(h.status, HealthStatus::Critical))
            .count();

        let degraded_count = health_map.values()
            .filter(|h| matches!(h.status, HealthStatus::Degraded))
            .count();

        let mut global_status = self.health_status.write().await;
        *global_status = if critical_count > 0 {
            HealthStatus::Critical
        } else if degraded_count > 0 {
            HealthStatus::Degraded
        } else {
            HealthStatus::Healthy
        };
    }

    /// Convertit un nom de module en type d'issue
    fn error_to_issue_type(module_name: &str) -> IssueType {
        match module_name {
            "ASR" => IssueType::ASRCrash,
            "TTS" => IssueType::TTSFailure,
            "Ollama" => IssueType::OllamaFrozen,
            "Gemini" => IssueType::GeminiTimeout,
            "Memory" => IssueType::MemoryCorruption,
            "Duplex" => IssueType::DuplexDesync,
            _ => IssueType::CPUOverload,
        }
    }

    /// Obtient le statut global
    pub async fn get_global_status(&self) -> HealthStatus {
        self.health_status.read().await.clone()
    }

    /// Obtient tous les incidents
    pub async fn get_incidents(&self) -> Vec<SystemIncident> {
        self.incidents.read().await.clone()
    }

    /// Nettoie les anciens incidents (> 1 heure)
    pub async fn cleanup_old_incidents(&self) {
        let mut incidents = self.incidents.write().await;
        let cutoff = Instant::now() - Duration::from_secs(3600);
        
        incidents.retain(|i| i.detected_at > cutoff);
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_monitor_creation() {
        let monitor = SystemMonitor::new();
        let status = monitor.get_global_status().await;
        assert_eq!(status, HealthStatus::Healthy);
    }

    #[tokio::test]
    async fn test_start_monitoring() {
        let monitor = SystemMonitor::new();
        monitor.start_monitoring().await;
        
        let health_map = monitor.module_health.read().await;
        assert!(health_map.contains_key("ASR"));
        assert!(health_map.contains_key("TTS"));
    }

    #[tokio::test]
    async fn test_error_reporting() {
        let monitor = SystemMonitor::new();
        monitor.start_monitoring().await;
        
        monitor.report_module_error("ASR", "Test error").await;
        
        let status = monitor.check_module_health("ASR").await.unwrap();
        assert_eq!(status, HealthStatus::Degraded);
    }

    #[tokio::test]
    async fn test_recovery_reporting() {
        let monitor = SystemMonitor::new();
        monitor.start_monitoring().await;
        
        monitor.report_module_error("ASR", "Error").await;
        monitor.report_module_recovery("ASR").await;
        
        let status = monitor.check_module_health("ASR").await.unwrap();
        assert_eq!(status, HealthStatus::Healthy);
    }
}
