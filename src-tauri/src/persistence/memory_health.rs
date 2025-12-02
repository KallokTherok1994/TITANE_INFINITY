//! ═══════════════════════════════════════════════════════════════════════════════
//! TITANE∞ v∞.MPE-2/3 — MEMORY HEALTH ENGINE
//! Tableau de bord santé mémoire + Self-Healing intégré
//! © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
//! ═══════════════════════════════════════════════════════════════════════════════

use serde::{Deserialize, Serialize};
use super::migrations::CURRENT_SCHEMA_VERSION;

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

/// État de santé de la mémoire
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MemoryHealth {
    /// Version du schéma dans l'état
    pub schema_version: u32,
    /// Version courante attendue
    pub current_version: u32,
    /// Intégrité DB OK
    pub db_integrity_ok: bool,
    /// Dernier check d'intégrité
    pub last_integrity_check: Option<u64>,
    /// Dernier snapshot
    pub last_snapshot_at: Option<u64>,
    /// Dernière compaction
    pub last_compaction_at: Option<u64>,
    /// Dernière compression cognitive
    pub last_compression_at: Option<u64>,
    /// Taille du journal en bytes
    pub event_log_size_bytes: u64,
    /// Nombre d'événements
    pub event_count: u64,
    /// Nombre de snapshots
    pub snapshot_count: u32,
    /// Temps estimé de recovery en ms
    pub estimated_recovery_time_ms: Option<u64>,
    /// Dernière sauvegarde/export
    pub last_backup_at: Option<u64>,
    /// Problèmes détectés
    pub issues: Vec<HealthIssue>,
    /// Score de santé global (0-100)
    pub health_score: u8,
    /// Recommandations
    pub recommendations: Vec<Recommendation>,
}

/// Problème de santé détecté
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HealthIssue {
    /// ID unique
    pub id: String,
    /// Niveau de sévérité
    pub severity: IssueSeverity,
    /// Catégorie
    pub category: IssueCategory,
    /// Message
    pub message: String,
    /// Détails techniques
    pub details: Option<String>,
    /// Timestamp de détection
    pub detected_at: u64,
    /// Corrigeable automatiquement
    pub auto_fixable: bool,
    /// Commande de correction
    pub fix_command: Option<String>,
}

/// Sévérité d'un problème
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum IssueSeverity {
    /// Information
    Info,
    /// Attention requise
    Warning,
    /// Critique - action requise
    Critical,
}

/// Catégorie de problème
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum IssueCategory {
    /// Intégrité des données
    Integrity,
    /// Performance
    Performance,
    /// Espace disque
    Storage,
    /// Schéma/Migration
    Schema,
    /// Sauvegarde
    Backup,
    /// Self-Healing
    SelfHealing,
}

/// Recommandation
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Recommendation {
    /// ID
    pub id: String,
    /// Priorité (1-5)
    pub priority: u8,
    /// Message
    pub message: String,
    /// Action suggérée
    pub action: String,
    /// Commande Tauri correspondante
    pub command: Option<String>,
}

/// Rapport de Self-Healing
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SelfHealingReport {
    /// Timestamp
    pub timestamp: u64,
    /// Actions effectuées
    pub actions: Vec<HealingAction>,
    /// Problèmes résolus
    pub issues_fixed: u32,
    /// Problèmes non résolus
    pub issues_remaining: u32,
    /// Durée totale en ms
    pub duration_ms: u64,
    /// Succès
    pub success: bool,
}

/// Action de Self-Healing
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HealingAction {
    /// Type d'action
    pub action_type: String,
    /// Description
    pub description: String,
    /// Succès
    pub success: bool,
    /// Détails
    pub details: Option<String>,
}

// ═══════════════════════════════════════════════════════════════════════════════
// MEMORY HEALTH ENGINE
// ═══════════════════════════════════════════════════════════════════════════════

/// Moteur de santé mémoire
pub struct MemoryHealthEngine {
    /// Dernier rapport de santé
    last_health: Option<MemoryHealth>,
    /// Historique des Self-Healing
    healing_history: Vec<SelfHealingReport>,
    /// Seuils configurables
    thresholds: HealthThresholds,
}

/// Seuils de santé
#[derive(Debug, Clone)]
pub struct HealthThresholds {
    /// Taille max du journal avant warning (bytes)
    pub max_journal_size_warning: u64,
    /// Taille max du journal avant critique (bytes)
    pub max_journal_size_critical: u64,
    /// Nombre max d'events avant compaction
    pub max_events_before_compaction: u64,
    /// Délai max depuis dernier snapshot (ms)
    pub max_snapshot_age_ms: u64,
    /// Délai max depuis dernier backup (ms)
    pub max_backup_age_ms: u64,
    /// Temps recovery max acceptable (ms)
    pub max_recovery_time_ms: u64,
}

impl Default for HealthThresholds {
    fn default() -> Self {
        Self {
            max_journal_size_warning: 10 * 1024 * 1024,     // 10 MB
            max_journal_size_critical: 50 * 1024 * 1024,    // 50 MB
            max_events_before_compaction: 5000,
            max_snapshot_age_ms: 30 * 60 * 1000,            // 30 minutes
            max_backup_age_ms: 7 * 24 * 60 * 60 * 1000,     // 7 jours
            max_recovery_time_ms: 5000,                      // 5 secondes
        }
    }
}

impl MemoryHealthEngine {
    pub fn new() -> Self {
        Self {
            last_health: None,
            healing_history: Vec::new(),
            thresholds: HealthThresholds::default(),
        }
    }

    pub fn with_thresholds(thresholds: HealthThresholds) -> Self {
        Self {
            last_health: None,
            healing_history: Vec::new(),
            thresholds,
        }
    }

    /// Effectuer un diagnostic complet
    pub async fn diagnose(&mut self) -> MemoryHealth {
        let now = chrono::Utc::now().timestamp_millis() as u64;
        let mut issues = Vec::new();
        let mut recommendations = Vec::new();

        // Récupérer les infos depuis le moteur de persistence
        let persistence = super::PERSISTENCE_ENGINE.read().await;
        let status = persistence.get_status();

        let schema_version = 1; // TODO: récupérer depuis l'état
        let needs_migration = schema_version < CURRENT_SCHEMA_VERSION;

        // Vérifier la migration
        if needs_migration {
            issues.push(HealthIssue {
                id: uuid::Uuid::new_v4().to_string(),
                severity: IssueSeverity::Warning,
                category: IssueCategory::Schema,
                message: format!("Migration requise: v{} → v{}", schema_version, CURRENT_SCHEMA_VERSION),
                details: Some("L'état utilise un schéma ancien".to_string()),
                detected_at: now,
                auto_fixable: true,
                fix_command: Some("titan_migrate_state".to_string()),
            });
        }

        // Vérifier l'intégrité
        if !status.integrity_ok {
            issues.push(HealthIssue {
                id: uuid::Uuid::new_v4().to_string(),
                severity: IssueSeverity::Critical,
                category: IssueCategory::Integrity,
                message: "Intégrité de la base compromise".to_string(),
                details: None,
                detected_at: now,
                auto_fixable: true,
                fix_command: Some("titan_repair_integrity".to_string()),
            });
        }

        // Vérifier la taille du journal
        if status.journal_size_bytes > self.thresholds.max_journal_size_critical {
            issues.push(HealthIssue {
                id: uuid::Uuid::new_v4().to_string(),
                severity: IssueSeverity::Critical,
                category: IssueCategory::Storage,
                message: format!(
                    "Journal trop volumineux: {} MB",
                    status.journal_size_bytes / 1024 / 1024
                ),
                details: Some("Risque de performances dégradées".to_string()),
                detected_at: now,
                auto_fixable: true,
                fix_command: Some("titan_compact_journal".to_string()),
            });
        } else if status.journal_size_bytes > self.thresholds.max_journal_size_warning {
            issues.push(HealthIssue {
                id: uuid::Uuid::new_v4().to_string(),
                severity: IssueSeverity::Warning,
                category: IssueCategory::Storage,
                message: format!(
                    "Journal volumineux: {} MB",
                    status.journal_size_bytes / 1024 / 1024
                ),
                details: None,
                detected_at: now,
                auto_fixable: true,
                fix_command: Some("titan_compact_journal".to_string()),
            });
        }

        // Vérifier le nombre d'events
        if status.events_pending_compaction > self.thresholds.max_events_before_compaction {
            recommendations.push(Recommendation {
                id: uuid::Uuid::new_v4().to_string(),
                priority: 2,
                message: format!(
                    "{} événements en attente de compaction",
                    status.events_pending_compaction
                ),
                action: "Lancer une compaction du journal".to_string(),
                command: Some("titan_compact_journal".to_string()),
            });
        }

        // Vérifier l'âge du dernier snapshot
        if let Some(last_snapshot) = status.last_snapshot {
            let age = now.saturating_sub(last_snapshot);
            if age > self.thresholds.max_snapshot_age_ms {
                recommendations.push(Recommendation {
                    id: uuid::Uuid::new_v4().to_string(),
                    priority: 3,
                    message: format!(
                        "Dernier snapshot il y a {} minutes",
                        age / 60000
                    ),
                    action: "Créer un nouveau snapshot".to_string(),
                    command: Some("titan_force_snapshot".to_string()),
                });
            }
        } else {
            recommendations.push(Recommendation {
                id: uuid::Uuid::new_v4().to_string(),
                priority: 1,
                message: "Aucun snapshot créé".to_string(),
                action: "Créer un snapshot initial".to_string(),
                command: Some("titan_force_snapshot".to_string()),
            });
        }

        // Calculer le score de santé
        let health_score = self.calculate_health_score(&issues);

        // Estimer le temps de recovery
        let estimated_recovery_time_ms = Some(
            (status.events_persisted as u64).saturating_mul(10) // ~10ms par event
        );

        let health = MemoryHealth {
            schema_version,
            current_version: CURRENT_SCHEMA_VERSION,
            db_integrity_ok: status.integrity_ok,
            last_integrity_check: status.last_integrity_check,
            last_snapshot_at: status.last_snapshot,
            last_compaction_at: status.last_compaction,
            last_compression_at: None, // TODO: intégrer
            event_log_size_bytes: status.journal_size_bytes,
            event_count: status.events_persisted,
            snapshot_count: status.snapshots_created as u32,
            estimated_recovery_time_ms,
            last_backup_at: None, // TODO: intégrer avec BackupEngine
            issues,
            health_score,
            recommendations,
        };

        self.last_health = Some(health.clone());

        log::info!(
            "[MemoryHealth] 🩺 Diagnostic: score={}, {} problèmes, {} recommandations",
            health.health_score,
            health.issues.len(),
            health.recommendations.len()
        );

        health
    }

    /// Lancer le Self-Healing automatique
    pub async fn auto_heal(&mut self) -> SelfHealingReport {
        let start = std::time::Instant::now();
        let now = chrono::Utc::now().timestamp_millis() as u64;

        let mut actions = Vec::new();
        let mut issues_fixed = 0;
        let mut issues_remaining = 0;

        // Récupérer le dernier diagnostic
        let health = if let Some(h) = &self.last_health {
            h.clone()
        } else {
            self.diagnose().await
        };

        // Traiter les problèmes auto-fixables
        for issue in &health.issues {
            if issue.auto_fixable {
                if let Some(cmd) = &issue.fix_command {
                    let result = self.execute_fix(cmd).await;
                    let success = result.is_ok();
                    let details = result.err();
                    actions.push(HealingAction {
                        action_type: cmd.clone(),
                        description: issue.message.clone(),
                        success,
                        details,
                    });

                    if success {
                        issues_fixed += 1;
                    } else {
                        issues_remaining += 1;
                    }
                }
            } else {
                issues_remaining += 1;
            }
        }

        let report = SelfHealingReport {
            timestamp: now,
            actions,
            issues_fixed,
            issues_remaining,
            duration_ms: start.elapsed().as_millis() as u64,
            success: issues_remaining == 0,
        };

        self.healing_history.push(report.clone());

        log::info!(
            "[MemoryHealth] 🩹 Self-Healing: {} corrigés, {} restants, {}ms",
            issues_fixed,
            issues_remaining,
            report.duration_ms
        );

        report
    }

    /// Exécuter une commande de correction et tracer via TitanEvent
    async fn execute_fix(&self, command: &str) -> Result<(), String> {
        use super::types::{TitanEvent, EventOrigin};

        let start = std::time::Instant::now();
        let result = self.execute_fix_internal(command).await;
        let duration_ms = start.elapsed().as_millis() as u64;

        // Tracer l'action de self-heal via un TitanEvent
        let event = TitanEvent::with_origin(
            "self_heal",
            if result.is_ok() { "fix_success" } else { "fix_failed" },
            serde_json::json!({
                "command": command,
                "success": result.is_ok(),
                "error": result.as_ref().err(),
                "duration_ms": duration_ms,
                "timestamp": chrono::Utc::now().timestamp_millis()
            }),
            EventOrigin::SelfHeal,
        );

        // Persister l'événement (ne pas bloquer en cas d'erreur)
        let mut engine = super::PERSISTENCE_ENGINE.write().await;
        if let Err(e) = engine.persist_event(event).await {
            log::warn!("[MemoryHealth] Impossible de tracer l'action self_heal: {}", e);
        }

        result
    }

    /// Exécution interne de la correction
    async fn execute_fix_internal(&self, command: &str) -> Result<(), String> {
        match command {
            "titan_compact_journal" => {
                let mut engine = super::PERSISTENCE_ENGINE.write().await;
                engine.compact_journal().await.map(|_| ()).map_err(|e| e.to_string())
            }
            "titan_force_snapshot" => {
                // Note: nécessite l'état actuel du frontend
                log::warn!("[MemoryHealth] force_snapshot nécessite l'état frontend");
                Err("Snapshot nécessite l'état frontend".to_string())
            }
            "titan_repair_integrity" => {
                let mut engine = super::PERSISTENCE_ENGINE.write().await;
                engine.check_integrity().await.map(|_| ()).map_err(|e| e.to_string())
            }
            "titan_migrate_state" => {
                // TODO: implémenter via MigrationEngine
                log::warn!("[MemoryHealth] Migration non implémentée en auto-heal");
                Err("Migration manuelle requise".to_string())
            }
            _ => Err(format!("Commande inconnue: {}", command)),
        }
    }

    /// Calculer le score de santé (0-100)
    fn calculate_health_score(&self, issues: &[HealthIssue]) -> u8 {
        let mut score = 100u8;

        for issue in issues {
            match issue.severity {
                IssueSeverity::Critical => score = score.saturating_sub(30),
                IssueSeverity::Warning => score = score.saturating_sub(10),
                IssueSeverity::Info => score = score.saturating_sub(2),
            }
        }

        score
    }

    /// Obtenir le dernier rapport de santé
    pub fn last_health(&self) -> Option<&MemoryHealth> {
        self.last_health.as_ref()
    }

    /// Obtenir l'historique des Self-Healing
    pub fn healing_history(&self) -> &[SelfHealingReport] {
        &self.healing_history
    }

    /// Vérifier si Self-Healing est recommandé
    pub fn needs_healing(&self) -> bool {
        self.last_health
            .as_ref()
            .map(|h| h.issues.iter().any(|i| i.auto_fixable))
            .unwrap_or(false)
    }
}

impl Default for MemoryHealthEngine {
    fn default() -> Self {
        Self::new()
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// GLOBAL INSTANCE
// ═══════════════════════════════════════════════════════════════════════════════

use once_cell::sync::Lazy;
use std::sync::Arc;
use tokio::sync::RwLock;

/// Instance globale du MemoryHealthEngine
pub static MEMORY_HEALTH_ENGINE: Lazy<Arc<RwLock<MemoryHealthEngine>>> = Lazy::new(|| {
    Arc::new(RwLock::new(MemoryHealthEngine::new()))
});

// ═══════════════════════════════════════════════════════════════════════════════
// TESTS
// ═══════════════════════════════════════════════════════════════════════════════

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_health_score_calculation() {
        let engine = MemoryHealthEngine::new();

        // Pas de problèmes = 100
        let score = engine.calculate_health_score(&[]);
        assert_eq!(score, 100);

        // Un problème critique
        let issues = vec![HealthIssue {
            id: "test".to_string(),
            severity: IssueSeverity::Critical,
            category: IssueCategory::Integrity,
            message: "Test".to_string(),
            details: None,
            detected_at: 0,
            auto_fixable: false,
            fix_command: None,
        }];
        let score = engine.calculate_health_score(&issues);
        assert_eq!(score, 70);
    }

    #[test]
    fn test_needs_healing() {
        let mut engine = MemoryHealthEngine::new();

        // Sans diagnostic, pas de healing nécessaire
        assert!(!engine.needs_healing());

        // Avec des problèmes auto-fixables
        engine.last_health = Some(MemoryHealth {
            schema_version: 1,
            current_version: 2,
            db_integrity_ok: true,
            last_integrity_check: None,
            last_snapshot_at: None,
            last_compaction_at: None,
            last_compression_at: None,
            event_log_size_bytes: 0,
            event_count: 0,
            snapshot_count: 0,
            estimated_recovery_time_ms: None,
            last_backup_at: None,
            issues: vec![HealthIssue {
                id: "test".to_string(),
                severity: IssueSeverity::Warning,
                category: IssueCategory::Schema,
                message: "Migration requise".to_string(),
                details: None,
                detected_at: 0,
                auto_fixable: true,
                fix_command: Some("titan_migrate_state".to_string()),
            }],
            health_score: 90,
            recommendations: vec![],
        });

        assert!(engine.needs_healing());
    }
}
