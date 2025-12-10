//! ═══════════════════════════════════════════════════════════════════════════════
//! TITANE∞ v20Ω — CONVERSATION DIAGNOSTICS
//! Super Prompt #9 — Diagnostics et événements du Conversation OS
//! ═══════════════════════════════════════════════════════════════════════════════

use super::intent::{IntentType, UserIntent};
use super::safety::SafetyCheck;
use serde::{Deserialize, Serialize};
use std::collections::VecDeque;
use tokio::sync::RwLock;

/// Événement conversationnel
#[derive(Clone, Debug, Serialize, Deserialize)]
pub enum ConversationEvent {
    /// Intention détectée
    IntentDetected(UserIntent),
    /// Pipeline routé
    PipelineRouted(usize),
    /// Émotion analysée
    EmotionAnalyzed { tone: String, intensity: f32 },
    /// Narrative mis à jour
    NarrativeUpdated { depth: u32, coherence: f32 },
    /// Sécurité déclenchée
    SafetyTriggered(SafetyCheck),
    /// Style appliqué
    StyleApplied { transformations: Vec<String> },
    /// Traitement terminé
    ProcessingComplete {
        duration_ms: u64,
        intent: IntentType,
    },
    /// Erreur
    Error { stage: String, message: String },
    /// Avertissement
    Warning { message: String },
    /// Persona changé
    PersonaChanged { from: String, to: String },
    /// Conversation réinitialisée
    ConversationReset,
}

/// Entrée de diagnostic
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct DiagnosticEntry {
    pub event: ConversationEvent,
    pub timestamp: u64,
    pub session_id: Option<String>,
}

/// Statistiques de diagnostic
#[derive(Clone, Debug, Default, Serialize, Deserialize)]
pub struct DiagnosticStats {
    pub total_events: u64,
    pub errors_count: u64,
    pub warnings_count: u64,
    pub avg_processing_time_ms: f64,
    pub intents_distribution: std::collections::HashMap<String, u64>,
    pub safety_triggers: u64,
}

/// Moteur de diagnostics
pub struct ConversationDiagnostics {
    /// Historique des événements
    history: RwLock<VecDeque<DiagnosticEntry>>,
    /// Taille maximale de l'historique
    max_history: usize,
    /// Statistiques
    stats: RwLock<DiagnosticStats>,
    /// Activer les diagnostics
    enabled: bool,
}

impl ConversationDiagnostics {
    pub fn new() -> Self {
        Self {
            history: RwLock::new(VecDeque::with_capacity(500)),
            max_history: 500,
            stats: RwLock::new(DiagnosticStats::default()),
            enabled: true,
        }
    }

    /// Émet un événement de diagnostic
    pub async fn emit(&self, event: ConversationEvent) {
        if !self.enabled {
            return;
        }

        let entry = DiagnosticEntry {
            event: event.clone(),
            timestamp: Self::now(),
            session_id: None,
        };

        // Ajouter à l'historique
        {
            let mut history = self.history.write().await;
            history.push_back(entry);
            while history.len() > self.max_history {
                history.pop_front();
            }
        }

        // Mettre à jour les statistiques
        self.update_stats(&event).await;

        // Log si c'est une erreur ou warning
        match &event {
            ConversationEvent::Error { stage, message } => {
                log::error!("[CONV_OS] Error in {}: {}", stage, message);
            }
            ConversationEvent::Warning { message } => {
                log::warn!("[CONV_OS] {}", message);
            }
            ConversationEvent::SafetyTriggered(check) => {
                log::warn!("[CONV_OS] Safety triggered: {}", check.reason);
            }
            _ => {
                log::debug!("[CONV_OS] Event: {:?}", event);
            }
        }
    }

    /// Met à jour les statistiques
    async fn update_stats(&self, event: &ConversationEvent) {
        let mut stats = self.stats.write().await;
        stats.total_events += 1;

        match event {
            ConversationEvent::Error { .. } => {
                stats.errors_count += 1;
            }
            ConversationEvent::Warning { .. } => {
                stats.warnings_count += 1;
            }
            ConversationEvent::SafetyTriggered(_) => {
                stats.safety_triggers += 1;
            }
            ConversationEvent::IntentDetected(intent) => {
                let intent_key = format!("{:?}", intent.intent_type);
                *stats.intents_distribution.entry(intent_key).or_insert(0) += 1;
            }
            ConversationEvent::ProcessingComplete { duration_ms, .. } => {
                // Mise à jour moyenne mobile
                let n = stats.total_events as f64;
                stats.avg_processing_time_ms =
                    (stats.avg_processing_time_ms * (n - 1.0) + *duration_ms as f64) / n;
            }
            _ => {}
        }
    }

    /// Récupère les événements récents
    pub async fn get_recent(&self, limit: usize) -> Vec<ConversationEvent> {
        let history = self.history.read().await;
        history
            .iter()
            .rev()
            .take(limit)
            .map(|e| e.event.clone())
            .collect()
    }

    /// Récupère l'historique complet
    pub async fn get_history(&self) -> Vec<DiagnosticEntry> {
        self.history.read().await.iter().cloned().collect()
    }

    /// Récupère les statistiques
    pub async fn get_stats(&self) -> DiagnosticStats {
        self.stats.read().await.clone()
    }

    /// Filtre les événements par type
    pub async fn filter_by_type(&self, event_type: &str) -> Vec<DiagnosticEntry> {
        let history = self.history.read().await;
        history
            .iter()
            .filter(|e| self.matches_type(&e.event, event_type))
            .cloned()
            .collect()
    }

    /// Vérifie si un événement correspond au type recherché
    fn matches_type(&self, event: &ConversationEvent, event_type: &str) -> bool {
        match (event, event_type) {
            (ConversationEvent::IntentDetected(_), "intent") => true,
            (ConversationEvent::Error { .. }, "error") => true,
            (ConversationEvent::Warning { .. }, "warning") => true,
            (ConversationEvent::SafetyTriggered(_), "safety") => true,
            (ConversationEvent::ProcessingComplete { .. }, "complete") => true,
            _ => false,
        }
    }

    /// Récupère les erreurs récentes
    pub async fn get_errors(&self, limit: usize) -> Vec<DiagnosticEntry> {
        let history = self.history.read().await;
        history
            .iter()
            .filter(|e| matches!(e.event, ConversationEvent::Error { .. }))
            .rev()
            .take(limit)
            .cloned()
            .collect()
    }

    /// Vide l'historique
    pub async fn clear_history(&self) {
        let mut history = self.history.write().await;
        history.clear();
    }

    /// Réinitialise les statistiques
    pub async fn reset_stats(&self) {
        let mut stats = self.stats.write().await;
        *stats = DiagnosticStats::default();
    }

    /// Active/désactive les diagnostics
    pub fn set_enabled(&mut self, enabled: bool) {
        self.enabled = enabled;
    }

    /// Vérifie si les diagnostics sont actifs
    pub fn is_enabled(&self) -> bool {
        self.enabled
    }

    /// Génère un rapport de santé
    pub async fn health_report(&self) -> HealthReport {
        let stats = self.stats.read().await;

        let error_rate = if stats.total_events > 0 {
            stats.errors_count as f64 / stats.total_events as f64
        } else {
            0.0
        };

        let status = if error_rate > 0.1 {
            HealthStatus::Critical
        } else if error_rate > 0.05 {
            HealthStatus::Warning
        } else {
            HealthStatus::Healthy
        };

        HealthReport {
            status,
            total_events: stats.total_events,
            error_rate,
            avg_latency_ms: stats.avg_processing_time_ms,
            safety_triggers: stats.safety_triggers,
            top_intents: self.get_top_intents(&stats, 5),
        }
    }

    /// Récupère les intentions les plus fréquentes
    fn get_top_intents(&self, stats: &DiagnosticStats, limit: usize) -> Vec<(String, u64)> {
        let mut intents: Vec<_> = stats
            .intents_distribution
            .iter()
            .map(|(k, v)| (k.clone(), *v))
            .collect();
        intents.sort_by(|a, b| b.1.cmp(&a.1));
        intents.truncate(limit);
        intents
    }

    fn now() -> u64 {
        std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap_or_default()
            .as_millis() as u64
    }
}

/// Rapport de santé
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct HealthReport {
    pub status: HealthStatus,
    pub total_events: u64,
    pub error_rate: f64,
    pub avg_latency_ms: f64,
    pub safety_triggers: u64,
    pub top_intents: Vec<(String, u64)>,
}

/// Statut de santé
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub enum HealthStatus {
    Healthy,
    Warning,
    Critical,
}

impl Default for ConversationDiagnostics {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_emit_event() {
        let diag = ConversationDiagnostics::new();

        diag.emit(ConversationEvent::Warning {
            message: "Test warning".to_string(),
        })
        .await;

        let recent = diag.get_recent(10).await;
        assert_eq!(recent.len(), 1);
    }

    #[tokio::test]
    async fn test_stats_update() {
        let diag = ConversationDiagnostics::new();

        diag.emit(ConversationEvent::Error {
            stage: "test".to_string(),
            message: "error".to_string(),
        })
        .await;

        let stats = diag.get_stats().await;
        assert_eq!(stats.errors_count, 1);
    }

    #[tokio::test]
    async fn test_health_report() {
        let diag = ConversationDiagnostics::new();

        // Émettre quelques événements normaux
        for _ in 0..10 {
            diag.emit(ConversationEvent::ProcessingComplete {
                duration_ms: 100,
                intent: IntentType::Question,
            })
            .await;
        }

        let report = diag.health_report().await;
        assert_eq!(report.status, HealthStatus::Healthy);
    }

    #[tokio::test]
    async fn test_filter_by_type() {
        let diag = ConversationDiagnostics::new();

        diag.emit(ConversationEvent::Error {
            stage: "test".to_string(),
            message: "error".to_string(),
        })
        .await;

        diag.emit(ConversationEvent::Warning {
            message: "warning".to_string(),
        })
        .await;

        let errors = diag.filter_by_type("error").await;
        assert_eq!(errors.len(), 1);
    }
}
