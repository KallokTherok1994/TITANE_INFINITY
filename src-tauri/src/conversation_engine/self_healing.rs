/**
 * ═══════════════════════════════════════════════════════════════════
 * TITANE∞ v∞ — SELF-HEALING CONVERSATION
 * Système d'auto-réparation conversationnelle
 * ═══════════════════════════════════════════════════════════════════
 */
use std::collections::{HashMap, HashSet};
use std::time::{SystemTime, UNIX_EPOCH};

use super::types::*;
use super::ConversationEngineError;

/// Système d'auto-réparation
pub struct SelfHealingConversation {
    /// IDs de messages traités (anti-duplication)
    processed_messages: HashSet<String>,

    /// Compteur d'anomalies par type
    anomaly_counts: HashMap<AnomalyType, usize>,

    /// Dernier scan
    last_scan: u64,
}

impl SelfHealingConversation {
    pub fn new() -> Self {
        Self {
            processed_messages: HashSet::new(),
            last_scan: current_timestamp(),
            anomaly_counts: HashMap::new(),
        }
    }

    /// Vérifier l'état d'une conversation
    pub async fn verify_state(
        &mut self,
        conversation_id: &str,
    ) -> Result<(), ConversationEngineError> {
        // Vérifier double-render
        if self.is_duplicate_conversation(conversation_id) {
            log::warn!(
                "[SelfHealing] Duplicate conversation detected: {}",
                conversation_id
            );
            return Err(ConversationEngineError::ProcessingError(
                "Duplicate conversation".to_string(),
            ));
        }

        self.processed_messages.insert(conversation_id.to_string());
        Ok(())
    }

    /// Scanner et réparer
    pub async fn scan_and_repair(
        &mut self,
    ) -> Result<ConversationHealthReport, ConversationEngineError> {
        let mut anomalies = Vec::new();
        let mut repairs = Vec::new();

        // Vérifier taille du cache
        if self.processed_messages.len() > 1000 {
            anomalies.push(Anomaly {
                anomaly_type: AnomalyType::MessageLoss,
                severity: 0.3,
                description: "Cache trop grand".to_string(),
            });

            // Nettoyer
            self.processed_messages.clear();
            repairs.push(Repair {
                repair_type: "cache_cleanup".to_string(),
                success: true,
                details: "Cache nettoyé".to_string(),
            });
        }

        // Mettre à jour timestamp
        self.last_scan = current_timestamp();

        let status = if anomalies.is_empty() {
            HealthStatus::Healthy
        } else if anomalies.iter().any(|a| a.severity > 0.7) {
            HealthStatus::Critical
        } else {
            HealthStatus::Warning
        };

        Ok(ConversationHealthReport {
            status,
            anomalies_detected: anomalies,
            repairs_applied: repairs,
            coherence_score: 0.95,
        })
    }

    /// Vérifier si conversation est dupliquée
    fn is_duplicate_conversation(&self, conversation_id: &str) -> bool {
        self.processed_messages.contains(conversation_id)
    }

    /// Enregistrer une anomalie
    pub fn record_anomaly(&mut self, anomaly_type: AnomalyType) {
        let count = self.anomaly_counts.get(&anomaly_type).unwrap_or(&0);
        self.anomaly_counts.insert(anomaly_type, count + 1);
    }

    /// Obtenir statistiques
    pub fn stats(&self) -> SelfHealingStats {
        SelfHealingStats {
            total_processed: self.processed_messages.len(),
            total_anomalies: self.anomaly_counts.values().sum(),
            last_scan: self.last_scan,
        }
    }
}

#[derive(Debug, Clone)]
pub struct SelfHealingStats {
    pub total_processed: usize,
    pub total_anomalies: usize,
    pub last_scan: u64,
}

fn current_timestamp() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_secs()
}
