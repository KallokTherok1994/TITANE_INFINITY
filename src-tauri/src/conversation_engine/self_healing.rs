/**
 * ═══════════════════════════════════════════════════════════════════
 * TITANE∞ v∞ — SELF-HEALING CONVERSATION
 * Système d'auto-réparation conversationnelle
 * ═══════════════════════════════════════════════════════════════════
 */
use std::collections::HashMap;

use super::types::*;
use super::ConversationEngineError;

/// Système d'auto-réparation
pub struct SelfHealingConversation {
    /// Conversations déjà vues (anti-double-submit immédiat)
    ///
    /// NOTE: une conversation_id est censée être réutilisée sur plusieurs tours.
    /// On ne doit donc pas la considérer comme "déjà traitée" de façon permanente.
    ///
    /// On stocke plutôt le dernier timestamp (en secondes) pour détecter uniquement
    /// les doublons rapprochés (ex: double click / double event).
    seen_conversations: HashMap<String, u64>,

    /// Compteur d'anomalies par type
    anomaly_counts: HashMap<AnomalyType, usize>,

    /// Dernier scan
    last_scan: u64,
}

impl SelfHealingConversation {
    pub fn new() -> Self {
        Self {
            seen_conversations: HashMap::new(),
            last_scan: current_timestamp(),
            anomaly_counts: HashMap::new(),
        }
    }

    /// Vérifier l'état d'une conversation
    pub async fn verify_state(
        &mut self,
        conversation_id: &str,
    ) -> Result<(), ConversationEngineError> {
        // Vérifier double-render immédiat (double submit)
        if self.is_duplicate_conversation(conversation_id) {
            log::warn!(
                "[SelfHealing] Duplicate conversation detected: {}",
                conversation_id
            );
            return Err(ConversationEngineError::ProcessingError(
                "Duplicate conversation".to_string(),
            ));
        }

        self.seen_conversations
            .insert(conversation_id.to_string(), current_timestamp());
        Ok(())
    }

    /// Scanner et réparer
    pub async fn scan_and_repair(
        &mut self,
    ) -> Result<ConversationHealthReport, ConversationEngineError> {
        let mut anomalies = Vec::new();
        let mut repairs = Vec::new();

        // Vérifier taille du cache
        if self.seen_conversations.len() > 1000 {
            anomalies.push(Anomaly {
                anomaly_type: AnomalyType::MessageLoss,
                severity: 0.3,
                description: "Cache trop grand".to_string(),
            });

            // Nettoyer
            self.seen_conversations.clear();
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
        const DUPLICATE_WINDOW_SECS: u64 = 2;
        match self.seen_conversations.get(conversation_id) {
            None => false,
            Some(last_seen) => {
                let now = current_timestamp();
                now.saturating_sub(*last_seen) <= DUPLICATE_WINDOW_SECS
            }
        }
    }

    /// Enregistrer une anomalie
    pub fn record_anomaly(&mut self, anomaly_type: AnomalyType) {
        let count = self.anomaly_counts.get(&anomaly_type).copied().unwrap_or(0);
        self.anomaly_counts.insert(anomaly_type, count + 1);
    }

    /// Obtenir statistiques
    pub fn stats(&self) -> SelfHealingStats {
        SelfHealingStats {
            total_processed: self.seen_conversations.len(),
            total_anomalies: self.anomaly_counts.values().sum(),
            last_scan: self.last_scan,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct SelfHealingStats {
    pub total_processed: usize,
    pub total_anomalies: usize,
    pub last_scan: u64,
}

fn current_timestamp() -> u64 {
    crate::core::utils::now_ms() / 1000
}

// ═══════════════════════════════════════════════════════════════════════════
// TESTS UNITAIRES
// ═══════════════════════════════════════════════════════════════════════════

#[cfg(test)]
mod tests {
    use super::*;

    // ─────────────────────────────────────────────────────────────────────
    // Tests SelfHealingStats
    // ─────────────────────────────────────────────────────────────────────

    #[test]
    fn test_self_healing_stats_new() {
        let stats = SelfHealingStats {
            total_processed: 0,
            total_anomalies: 0,
            last_scan: 0,
        };
        assert_eq!(stats.total_processed, 0);
        assert_eq!(stats.total_anomalies, 0);
        assert_eq!(stats.last_scan, 0);
    }

    #[test]
    fn test_self_healing_stats_with_values() {
        let stats = SelfHealingStats {
            total_processed: 100,
            total_anomalies: 5,
            last_scan: 1234567890,
        };
        assert_eq!(stats.total_processed, 100);
        assert_eq!(stats.total_anomalies, 5);
        assert_eq!(stats.last_scan, 1234567890);
    }

    #[test]
    fn test_self_healing_stats_debug() {
        let stats = SelfHealingStats {
            total_processed: 42,
            total_anomalies: 3,
            last_scan: 999,
        };
        let debug_str = format!("{:?}", stats);
        assert!(debug_str.contains("42"));
        assert!(debug_str.contains("3"));
        assert!(debug_str.contains("999"));
    }

    #[test]
    fn test_self_healing_stats_clone() {
        let stats = SelfHealingStats {
            total_processed: 50,
            total_anomalies: 2,
            last_scan: 12345,
        };
        let cloned = stats.clone();
        assert_eq!(stats, cloned);
    }

    #[test]
    fn test_self_healing_stats_eq() {
        let stats1 = SelfHealingStats {
            total_processed: 10,
            total_anomalies: 1,
            last_scan: 100,
        };
        let stats2 = SelfHealingStats {
            total_processed: 10,
            total_anomalies: 1,
            last_scan: 100,
        };
        assert_eq!(stats1, stats2);
    }

    #[test]
    fn test_self_healing_stats_ne() {
        let stats1 = SelfHealingStats {
            total_processed: 10,
            total_anomalies: 1,
            last_scan: 100,
        };
        let stats2 = SelfHealingStats {
            total_processed: 20,
            total_anomalies: 1,
            last_scan: 100,
        };
        assert_ne!(stats1, stats2);
    }

    #[test]
    fn test_self_healing_stats_max_values() {
        let stats = SelfHealingStats {
            total_processed: usize::MAX,
            total_anomalies: usize::MAX,
            last_scan: u64::MAX,
        };
        assert_eq!(stats.total_processed, usize::MAX);
        assert_eq!(stats.total_anomalies, usize::MAX);
        assert_eq!(stats.last_scan, u64::MAX);
    }

    #[tokio::test]
    async fn test_verify_state_blocks_immediate_duplicate() {
        let mut healing = SelfHealingConversation::new();

        let conv_id = "conv-dup";
        healing
            .seen_conversations
            .insert(conv_id.to_string(), current_timestamp());

        let result = healing.verify_state(conv_id).await;
        assert!(result.is_err());
    }

    #[tokio::test]
    async fn test_verify_state_allows_reuse_after_window() {
        let mut healing = SelfHealingConversation::new();

        let conv_id = "conv-ok";
        healing
            .seen_conversations
            .insert(conv_id.to_string(), current_timestamp().saturating_sub(10));

        let result = healing.verify_state(conv_id).await;
        assert!(result.is_ok());
    }

    // ─────────────────────────────────────────────────────────────────────
    // Tests SelfHealingConversation création
    // ─────────────────────────────────────────────────────────────────────

    #[test]
    fn test_self_healing_conversation_new() {
        let healing = SelfHealingConversation::new();
        let stats = healing.stats();
        assert_eq!(stats.total_processed, 0);
        assert_eq!(stats.total_anomalies, 0);
        assert!(stats.last_scan > 0); // Devrait être timestamp actuel
    }

    #[test]
    fn test_self_healing_initial_state() {
        let healing = SelfHealingConversation::new();
        let stats = healing.stats();
        // État initial propre
        assert_eq!(stats.total_processed, 0);
        assert_eq!(stats.total_anomalies, 0);
    }

    // ─────────────────────────────────────────────────────────────────────
    // Tests SelfHealingConversation verify_state
    // ─────────────────────────────────────────────────────────────────────

    #[tokio::test]
    async fn test_verify_state_first_call() {
        let mut healing = SelfHealingConversation::new();
        let result = healing.verify_state("conv-1").await;
        assert!(result.is_ok());

        let stats = healing.stats();
        assert_eq!(stats.total_processed, 1);
    }

    #[tokio::test]
    async fn test_verify_state_duplicate() {
        let mut healing = SelfHealingConversation::new();

        // Premier appel OK
        let result1 = healing.verify_state("conv-1").await;
        assert!(result1.is_ok());

        // Deuxième appel avec même ID = erreur
        let result2 = healing.verify_state("conv-1").await;
        assert!(result2.is_err());
    }

    #[tokio::test]
    async fn test_verify_state_different_ids() {
        let mut healing = SelfHealingConversation::new();

        let result1 = healing.verify_state("conv-1").await;
        let result2 = healing.verify_state("conv-2").await;
        let result3 = healing.verify_state("conv-3").await;

        assert!(result1.is_ok());
        assert!(result2.is_ok());
        assert!(result3.is_ok());

        let stats = healing.stats();
        assert_eq!(stats.total_processed, 3);
    }

    #[tokio::test]
    async fn test_verify_state_empty_id() {
        let mut healing = SelfHealingConversation::new();
        let result = healing.verify_state("").await;
        assert!(result.is_ok());
    }

    #[tokio::test]
    async fn test_verify_state_unicode_id() {
        let mut healing = SelfHealingConversation::new();
        let result = healing.verify_state("conv-émojis-🎉").await;
        assert!(result.is_ok());
    }

    #[tokio::test]
    async fn test_verify_state_many_conversations() {
        let mut healing = SelfHealingConversation::new();

        for i in 0..100 {
            let id = format!("conv-{}", i);
            let result = healing.verify_state(&id).await;
            assert!(result.is_ok());
        }

        let stats = healing.stats();
        assert_eq!(stats.total_processed, 100);
    }

    // ─────────────────────────────────────────────────────────────────────
    // Tests SelfHealingConversation record_anomaly
    // ─────────────────────────────────────────────────────────────────────

    #[test]
    fn test_record_anomaly_message_loss() {
        let mut healing = SelfHealingConversation::new();
        healing.record_anomaly(AnomalyType::MessageLoss);

        let stats = healing.stats();
        assert_eq!(stats.total_anomalies, 1);
    }

    #[test]
    fn test_record_anomaly_state_drift() {
        let mut healing = SelfHealingConversation::new();
        healing.record_anomaly(AnomalyType::StateDrift);

        let stats = healing.stats();
        assert_eq!(stats.total_anomalies, 1);
    }

    #[test]
    fn test_record_anomaly_memory_corruption() {
        let mut healing = SelfHealingConversation::new();
        healing.record_anomaly(AnomalyType::MemoryCorruption);

        let stats = healing.stats();
        assert_eq!(stats.total_anomalies, 1);
    }

    #[test]
    fn test_record_anomaly_sync_failure() {
        let mut healing = SelfHealingConversation::new();
        healing.record_anomaly(AnomalyType::SyncFailure);

        let stats = healing.stats();
        assert_eq!(stats.total_anomalies, 1);
    }

    #[test]
    fn test_record_multiple_same_anomaly() {
        let mut healing = SelfHealingConversation::new();
        healing.record_anomaly(AnomalyType::MessageLoss);
        healing.record_anomaly(AnomalyType::MessageLoss);
        healing.record_anomaly(AnomalyType::MessageLoss);

        let stats = healing.stats();
        assert_eq!(stats.total_anomalies, 3);
    }

    #[test]
    fn test_record_multiple_different_anomalies() {
        let mut healing = SelfHealingConversation::new();
        healing.record_anomaly(AnomalyType::MessageLoss);
        healing.record_anomaly(AnomalyType::StateDrift);
        healing.record_anomaly(AnomalyType::MemoryCorruption);
        healing.record_anomaly(AnomalyType::SyncFailure);

        let stats = healing.stats();
        assert_eq!(stats.total_anomalies, 4);
    }

    // ─────────────────────────────────────────────────────────────────────
    // Tests SelfHealingConversation scan_and_repair
    // ─────────────────────────────────────────────────────────────────────

    #[tokio::test]
    async fn test_scan_and_repair_healthy() {
        let mut healing = SelfHealingConversation::new();
        let report = healing.scan_and_repair().await;

        assert!(report.is_ok());
        let report = report.expect("scan_and_repair should succeed for a clean state");
        assert!(matches!(report.status, HealthStatus::Healthy));
        assert!(report.anomalies_detected.is_empty());
    }

    #[tokio::test]
    async fn test_scan_and_repair_updates_timestamp() {
        let mut healing = SelfHealingConversation::new();
        let before = healing.stats().last_scan;

        // Petit délai pour s'assurer que le timestamp change
        tokio::time::sleep(tokio::time::Duration::from_millis(10)).await;

        let _report = healing.scan_and_repair().await;
        let after = healing.stats().last_scan;

        assert!(after >= before);
    }

    #[tokio::test]
    async fn test_scan_and_repair_coherence_score() {
        let mut healing = SelfHealingConversation::new();
        let report = healing
            .scan_and_repair()
            .await
            .expect("scan_and_repair should succeed");

        assert_eq!(report.coherence_score, 0.95);
    }

    // ─────────────────────────────────────────────────────────────────────
    // Tests SelfHealingConversation stats
    // ─────────────────────────────────────────────────────────────────────

    #[test]
    fn test_stats_initial() {
        let healing = SelfHealingConversation::new();
        let stats = healing.stats();

        assert_eq!(stats.total_processed, 0);
        assert_eq!(stats.total_anomalies, 0);
        assert!(stats.last_scan > 0);
    }

    #[tokio::test]
    async fn test_stats_after_verify() {
        let mut healing = SelfHealingConversation::new();
        healing
            .verify_state("conv-1")
            .await
            .expect("verify_state should succeed for first conversation");
        healing
            .verify_state("conv-2")
            .await
            .expect("verify_state should succeed for second conversation");

        let stats = healing.stats();
        assert_eq!(stats.total_processed, 2);
    }

    #[test]
    fn test_stats_after_anomaly() {
        let mut healing = SelfHealingConversation::new();
        healing.record_anomaly(AnomalyType::MessageLoss);
        healing.record_anomaly(AnomalyType::StateDrift);

        let stats = healing.stats();
        assert_eq!(stats.total_anomalies, 2);
    }

    // ─────────────────────────────────────────────────────────────────────
    // Tests current_timestamp
    // ─────────────────────────────────────────────────────────────────────

    #[test]
    fn test_current_timestamp_reasonable() {
        let ts = current_timestamp();
        // Le timestamp devrait être après 2020 (1577836800)
        assert!(ts > 1577836800);
    }

    #[test]
    fn test_current_timestamp_increasing() {
        let ts1 = current_timestamp();
        let ts2 = current_timestamp();
        // Les timestamps devraient être non-décroissants
        assert!(ts2 >= ts1);
    }

    // ─────────────────────────────────────────────────────────────────────
    // Tests d'intégration
    // ─────────────────────────────────────────────────────────────────────

    #[tokio::test]
    async fn test_full_workflow() {
        let mut healing = SelfHealingConversation::new();

        // Vérifier quelques conversations
        healing
            .verify_state("conv-1")
            .await
            .expect("verify_state should succeed for conv-1");
        healing
            .verify_state("conv-2")
            .await
            .expect("verify_state should succeed for conv-2");

        // Enregistrer des anomalies
        healing.record_anomaly(AnomalyType::MessageLoss);

        // Scanner
        let report = healing
            .scan_and_repair()
            .await
            .expect("scan_and_repair should succeed");

        // Vérifier stats
        let stats = healing.stats();
        assert_eq!(stats.total_processed, 2);
        assert_eq!(stats.total_anomalies, 1);
        assert!(matches!(report.status, HealthStatus::Healthy));
    }

    #[tokio::test]
    async fn test_duplicate_detection_workflow() {
        let mut healing = SelfHealingConversation::new();

        // Premier appel OK
        assert!(healing.verify_state("important-conv").await.is_ok());

        // Deuxième appel = erreur (duplicate)
        let err = healing.verify_state("important-conv").await;
        assert!(err.is_err());

        // Mais un ID différent fonctionne
        assert!(healing.verify_state("important-conv-2").await.is_ok());
    }

    #[tokio::test]
    async fn test_multiple_scans() {
        let mut healing = SelfHealingConversation::new();

        for _ in 0..5 {
            let report = healing.scan_and_repair().await;
            assert!(report.is_ok());
        }
    }

    #[test]
    fn test_anomaly_counting_by_type() {
        let mut healing = SelfHealingConversation::new();

        // Enregistrer plusieurs anomalies de différents types
        for _ in 0..3 {
            healing.record_anomaly(AnomalyType::MessageLoss);
        }
        for _ in 0..2 {
            healing.record_anomaly(AnomalyType::StateDrift);
        }
        healing.record_anomaly(AnomalyType::SyncFailure);

        let stats = healing.stats();
        assert_eq!(stats.total_anomalies, 6);
    }

    #[tokio::test]
    async fn test_large_scale_verification() {
        let mut healing = SelfHealingConversation::new();

        // Vérifier 500 conversations
        for i in 0..500 {
            let id = format!("large-conv-{}", i);
            healing
                .verify_state(&id)
                .await
                .expect("verify_state should succeed for unique conversation IDs");
        }

        let stats = healing.stats();
        assert_eq!(stats.total_processed, 500);
    }
}
