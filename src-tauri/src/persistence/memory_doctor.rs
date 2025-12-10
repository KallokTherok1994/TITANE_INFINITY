use chrono::Utc;
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * TITANE∞ v∞.MPE-Ω — TITAN MEMORY DOCTOR
 * Outil de diagnostic, réparation et maintenance du système de mémoire
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * ═══════════════════════════════════════════════════════════════════════════════
 */
use serde::{Deserialize, Serialize};
use std::path::PathBuf;

use super::{
    backup::BackupEngine,
    invariants::{InvariantsEngine, ValidationMode},
    memory_health::{IssueSeverity, MemoryHealth, MemoryHealthEngine, SelfHealingReport},
    migrations::{MigrationEngine, CURRENT_SCHEMA_VERSION},
    types::CompactionReport,
    PERSISTENCE_ENGINE,
};

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

/// Rapport complet du Memory Doctor
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DoctorReport {
    /// Timestamp du diagnostic
    pub timestamp: u64,
    /// Durée du diagnostic en ms
    pub duration_ms: u64,

    // État général
    pub overall_status: DoctorStatus,
    pub score: u8, // 0-100

    // Composants
    pub health: Option<MemoryHealth>,
    pub validation: Option<ValidationSummary>,
    pub storage: StorageReport,
    pub schema: SchemaReport,
    pub backups: BackupReport,

    // Recommandations
    pub critical_issues: Vec<DoctorIssue>,
    pub warnings: Vec<DoctorIssue>,
    pub suggestions: Vec<String>,

    // Actions disponibles
    pub available_actions: Vec<DoctorAction>,
}

/// Statut global du doctor
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum DoctorStatus {
    Healthy,
    NeedsAttention,
    Critical,
    Unknown,
}

/// Issue détectée par le doctor
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DoctorIssue {
    pub id: String,
    pub category: String,
    pub severity: String,
    pub message: String,
    pub auto_fixable: bool,
    pub fix_action: Option<String>,
}

/// Action disponible
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DoctorAction {
    pub id: String,
    pub name: String,
    pub description: String,
    pub command: String,
    pub risk_level: String,
}

/// Résumé de validation
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ValidationSummary {
    pub is_valid: bool,
    pub errors_count: usize,
    pub warnings_count: usize,
    pub repaired_count: usize,
}

/// Rapport de stockage
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StorageReport {
    pub data_dir_exists: bool,
    pub data_dir_path: String,
    pub total_size_bytes: u64,
    pub journal_size_bytes: u64,
    pub snapshots_size_bytes: u64,
    pub backups_size_bytes: u64,
    pub snapshots_count: usize,
    pub events_count: usize,
}

/// Rapport de schéma
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SchemaReport {
    pub current_version: u32,
    pub state_version: u32,
    pub needs_migration: bool,
    pub migration_path: Vec<u32>,
}

/// Rapport de backups
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BackupReport {
    pub backup_dir_exists: bool,
    pub backup_count: usize,
    pub last_backup_at: Option<u64>,
    pub oldest_backup_at: Option<u64>,
    pub total_backup_size_bytes: u64,
    pub days_since_last_backup: Option<u32>,
}

// ═══════════════════════════════════════════════════════════════════════════════
// MEMORY DOCTOR ENGINE
// ═══════════════════════════════════════════════════════════════════════════════

/// Moteur du Memory Doctor
pub struct MemoryDoctor {
    health_engine: MemoryHealthEngine,
    invariants_engine: InvariantsEngine,
    migration_engine: MigrationEngine,
    backup_engine: BackupEngine,
}

impl Default for MemoryDoctor {
    fn default() -> Self {
        Self::new()
    }
}

impl MemoryDoctor {
    pub fn new() -> Self {
        Self {
            health_engine: MemoryHealthEngine::new(),
            invariants_engine: InvariantsEngine::new(ValidationMode::Lenient),
            migration_engine: MigrationEngine::new(),
            backup_engine: BackupEngine::new(),
        }
    }

    /// Diagnostic complet du système de mémoire
    pub async fn diagnose(&mut self) -> DoctorReport {
        let start = std::time::Instant::now();
        let timestamp = Utc::now().timestamp_millis() as u64;

        log::info!("[MemoryDoctor] 🩺 Démarrage du diagnostic complet...");

        // 1. Récupérer l'état de santé
        let health = Some(self.health_engine.diagnose().await);

        // 2. Récupérer le rapport de stockage
        let storage = self.analyze_storage().await;

        // 3. Vérifier le schéma
        let schema = self.analyze_schema().await;

        // 4. Vérifier les backups
        let backups = self.analyze_backups().await;

        // 5. Valider les invariants (si état disponible)
        let validation = self.validate_state().await;

        // 6. Collecter les issues
        let (critical_issues, warnings) = self.collect_issues(&health, &storage, &schema, &backups);

        // 7. Calculer le score
        let score = self.calculate_score(&health, &critical_issues, &warnings);

        // 8. Déterminer le statut
        let overall_status = if !critical_issues.is_empty() {
            DoctorStatus::Critical
        } else if !warnings.is_empty() {
            DoctorStatus::NeedsAttention
        } else if score >= 80 {
            DoctorStatus::Healthy
        } else {
            DoctorStatus::NeedsAttention
        };

        // 9. Générer les suggestions
        let suggestions = self.generate_suggestions(&health, &storage, &schema, &backups);

        // 10. Lister les actions disponibles
        let available_actions = self.get_available_actions(&critical_issues, &warnings);

        let duration_ms = start.elapsed().as_millis() as u64;

        log::info!(
            "[MemoryDoctor] ✅ Diagnostic terminé en {}ms - Score: {}/100 - Status: {:?}",
            duration_ms,
            score,
            overall_status
        );

        DoctorReport {
            timestamp,
            duration_ms,
            overall_status,
            score,
            health,
            validation,
            storage,
            schema,
            backups,
            critical_issues,
            warnings,
            suggestions,
            available_actions,
        }
    }

    /// Analyser le stockage
    async fn analyze_storage(&self) -> StorageReport {
        let data_dir = dirs::data_dir()
            .unwrap_or_else(|| PathBuf::from("."))
            .join("titane_infinity");

        let data_dir_exists = data_dir.exists();
        let data_dir_path = data_dir.to_string_lossy().to_string();

        let mut total_size_bytes = 0u64;
        let mut journal_size_bytes = 0u64;
        let mut snapshots_size_bytes = 0u64;
        let mut backups_size_bytes = 0u64;
        let mut snapshots_count = 0usize;
        let mut events_count = 0usize;

        if data_dir_exists {
            // Journal
            let journal_path = data_dir.join("event_log.json");
            if journal_path.exists() {
                if let Ok(meta) = std::fs::metadata(&journal_path) {
                    journal_size_bytes = meta.len();
                    total_size_bytes += journal_size_bytes;

                    // Compter les événements
                    if let Ok(content) = std::fs::read_to_string(&journal_path) {
                        events_count = content.matches("\"id\":").count();
                    }
                }
            }

            // Snapshots
            let snapshots_dir = data_dir.join("snapshots");
            if snapshots_dir.exists() {
                if let Ok(entries) = std::fs::read_dir(&snapshots_dir) {
                    for entry in entries.flatten() {
                        if let Ok(meta) = entry.metadata() {
                            snapshots_size_bytes += meta.len();
                            snapshots_count += 1;
                        }
                    }
                }
                total_size_bytes += snapshots_size_bytes;
            }

            // Backups
            let backup_dir = dirs::document_dir()
                .unwrap_or_else(|| PathBuf::from("."))
                .join("TITANE_INFINITY_Backups");
            if backup_dir.exists() {
                if let Ok(entries) = std::fs::read_dir(&backup_dir) {
                    for entry in entries.flatten() {
                        if let Ok(meta) = entry.metadata() {
                            backups_size_bytes += meta.len();
                        }
                    }
                }
            }
        }

        StorageReport {
            data_dir_exists,
            data_dir_path,
            total_size_bytes,
            journal_size_bytes,
            snapshots_size_bytes,
            backups_size_bytes,
            snapshots_count,
            events_count,
        }
    }

    /// Analyser le schéma
    async fn analyze_schema(&self) -> SchemaReport {
        let current_version = CURRENT_SCHEMA_VERSION;

        // Essayer de charger l'état pour obtenir sa version
        let engine = PERSISTENCE_ENGINE.read().await;
        let state_version = if let Ok(Some(_state)) = engine.load_latest_state().await {
            // TODO: Ajouter schema_version dans SingularityState
            // Pour l'instant, on considère que si l'état existe, il est à la version 1
            1
        } else {
            1
        };

        let needs_migration = state_version < current_version;

        // Calculer le chemin de migration
        let migration_path: Vec<u32> = if needs_migration {
            ((state_version + 1)..=current_version).collect()
        } else {
            vec![]
        };

        SchemaReport {
            current_version,
            state_version,
            needs_migration,
            migration_path,
        }
    }

    /// Analyser les backups
    async fn analyze_backups(&self) -> BackupReport {
        let backup_dir = dirs::document_dir()
            .unwrap_or_else(|| PathBuf::from("."))
            .join("TITANE_INFINITY_Backups");

        let backup_dir_exists = backup_dir.exists();
        let mut backup_count = 0usize;
        let mut last_backup_at: Option<u64> = None;
        let mut oldest_backup_at: Option<u64> = None;
        let mut total_backup_size_bytes = 0u64;

        if backup_dir_exists {
            if let Ok(entries) = std::fs::read_dir(&backup_dir) {
                for entry in entries.flatten() {
                    if let Ok(meta) = entry.metadata() {
                        backup_count += 1;
                        total_backup_size_bytes += meta.len();

                        if let Ok(modified) = meta.modified() {
                            let ts = modified
                                .duration_since(std::time::UNIX_EPOCH)
                                .unwrap_or_default()
                                .as_millis() as u64;

                            if last_backup_at.map_or(true, |last| ts > last) {
                                last_backup_at = Some(ts);
                            }
                            if oldest_backup_at.map_or(true, |oldest| ts < oldest) {
                                oldest_backup_at = Some(ts);
                            }
                        }
                    }
                }
            }
        }

        let days_since_last_backup = last_backup_at.map(|ts| {
            let now = Utc::now().timestamp_millis() as u64;
            ((now - ts) / (24 * 60 * 60 * 1000)) as u32
        });

        BackupReport {
            backup_dir_exists,
            backup_count,
            last_backup_at,
            oldest_backup_at,
            total_backup_size_bytes,
            days_since_last_backup,
        }
    }

    /// Valider l'état
    async fn validate_state(&mut self) -> Option<ValidationSummary> {
        let engine = PERSISTENCE_ENGINE.read().await;

        if let Ok(Some(state)) = engine.load_latest_state().await {
            let state_json = serde_json::to_value(&state).ok()?;
            let result = self.invariants_engine.validate_state(&state_json);

            Some(ValidationSummary {
                is_valid: result.is_valid,
                errors_count: result.errors.len(),
                warnings_count: result.warnings.len(),
                repaired_count: 0,
            })
        } else {
            None
        }
    }

    /// Collecter les issues
    fn collect_issues(
        &self,
        health: &Option<MemoryHealth>,
        storage: &StorageReport,
        schema: &SchemaReport,
        backups: &BackupReport,
    ) -> (Vec<DoctorIssue>, Vec<DoctorIssue>) {
        let mut critical = Vec::new();
        let mut warnings = Vec::new();

        // Issues de santé
        if let Some(h) = health {
            for issue in &h.issues {
                let doctor_issue = DoctorIssue {
                    id: issue.id.clone(),
                    category: format!("{:?}", issue.category),
                    severity: format!("{:?}", issue.severity),
                    message: issue.message.clone(),
                    auto_fixable: issue.fix_command.is_some(),
                    fix_action: issue.fix_command.clone(),
                };

                if issue.severity == IssueSeverity::Critical {
                    critical.push(doctor_issue);
                } else {
                    warnings.push(doctor_issue);
                }
            }
        }

        // Issues de stockage
        if !storage.data_dir_exists {
            critical.push(DoctorIssue {
                id: "storage_no_data_dir".to_string(),
                category: "storage".to_string(),
                severity: "critical".to_string(),
                message: "Répertoire de données introuvable".to_string(),
                auto_fixable: true,
                fix_action: Some("titan_persistence_init".to_string()),
            });
        }

        if storage.journal_size_bytes > 50 * 1024 * 1024 {
            critical.push(DoctorIssue {
                id: "storage_journal_huge".to_string(),
                category: "storage".to_string(),
                severity: "critical".to_string(),
                message: format!(
                    "Journal trop volumineux: {}MB",
                    storage.journal_size_bytes / 1024 / 1024
                ),
                auto_fixable: true,
                fix_action: Some("titan_compact_journal".to_string()),
            });
        } else if storage.journal_size_bytes > 10 * 1024 * 1024 {
            warnings.push(DoctorIssue {
                id: "storage_journal_large".to_string(),
                category: "storage".to_string(),
                severity: "warning".to_string(),
                message: format!(
                    "Journal volumineux: {}MB",
                    storage.journal_size_bytes / 1024 / 1024
                ),
                auto_fixable: true,
                fix_action: Some("titan_compact_journal".to_string()),
            });
        }

        // Issues de schéma
        if schema.needs_migration {
            warnings.push(DoctorIssue {
                id: "schema_needs_migration".to_string(),
                category: "schema".to_string(),
                severity: "warning".to_string(),
                message: format!(
                    "Migration requise: v{} → v{}",
                    schema.state_version, schema.current_version
                ),
                auto_fixable: true,
                fix_action: Some("titan_migrate_state".to_string()),
            });
        }

        // Issues de backup
        if !backups.backup_dir_exists || backups.backup_count == 0 {
            warnings.push(DoctorIssue {
                id: "backup_none".to_string(),
                category: "backup".to_string(),
                severity: "warning".to_string(),
                message: "Aucun backup trouvé".to_string(),
                auto_fixable: true,
                fix_action: Some("titan_export_data".to_string()),
            });
        } else if let Some(days) = backups.days_since_last_backup {
            if days > 7 {
                warnings.push(DoctorIssue {
                    id: "backup_old".to_string(),
                    category: "backup".to_string(),
                    severity: "warning".to_string(),
                    message: format!("Dernier backup il y a {} jours", days),
                    auto_fixable: true,
                    fix_action: Some("titan_export_data".to_string()),
                });
            }
        }

        (critical, warnings)
    }

    /// Calculer le score de santé
    fn calculate_score(
        &self,
        health: &Option<MemoryHealth>,
        critical: &[DoctorIssue],
        warnings: &[DoctorIssue],
    ) -> u8 {
        let mut score = 100u8;

        // Score de base depuis MemoryHealth
        if let Some(h) = health {
            score = h.health_score;
        }

        // Pénalités
        score = score.saturating_sub((critical.len() * 20) as u8);
        score = score.saturating_sub((warnings.len() * 5) as u8);

        score
    }

    /// Générer des suggestions
    fn generate_suggestions(
        &self,
        health: &Option<MemoryHealth>,
        storage: &StorageReport,
        schema: &SchemaReport,
        backups: &BackupReport,
    ) -> Vec<String> {
        let mut suggestions = Vec::new();

        // Suggestions de santé
        if let Some(h) = health {
            for rec in &h.recommendations {
                suggestions.push(rec.message.clone());
            }
        }

        // Suggestions de stockage
        if storage.events_count > 5000 {
            suggestions.push(format!(
                "Compacter le journal ({} événements) pour améliorer les performances",
                storage.events_count
            ));
        }

        if storage.snapshots_count < 3 {
            suggestions.push("Créer plus de snapshots pour une meilleure récupération".to_string());
        }

        // Suggestions de schéma
        if schema.needs_migration {
            suggestions.push(format!(
                "Migrer le schéma vers v{} pour bénéficier des nouvelles fonctionnalités",
                schema.current_version
            ));
        }

        // Suggestions de backup
        if backups.backup_count == 0 {
            suggestions.push("Créer un premier backup pour sécuriser vos données".to_string());
        } else if backups.backup_count < 3 {
            suggestions.push("Maintenir au moins 3 backups pour la redondance".to_string());
        }

        suggestions
    }

    /// Obtenir les actions disponibles
    fn get_available_actions(
        &self,
        critical: &[DoctorIssue],
        warnings: &[DoctorIssue],
    ) -> Vec<DoctorAction> {
        let mut actions = vec![
            DoctorAction {
                id: "heal".to_string(),
                name: "Self-Healing".to_string(),
                description: "Lancer l'auto-réparation complète".to_string(),
                command: "titan_run_self_healing".to_string(),
                risk_level: "low".to_string(),
            },
            DoctorAction {
                id: "compact".to_string(),
                name: "Compacter Journal".to_string(),
                description: "Compacter le journal d'événements".to_string(),
                command: "titan_compact_journal".to_string(),
                risk_level: "low".to_string(),
            },
            DoctorAction {
                id: "snapshot".to_string(),
                name: "Créer Snapshot".to_string(),
                description: "Créer un snapshot immédiat".to_string(),
                command: "titan_force_snapshot".to_string(),
                risk_level: "low".to_string(),
            },
            DoctorAction {
                id: "export".to_string(),
                name: "Exporter Backup".to_string(),
                description: "Exporter une archive de backup".to_string(),
                command: "titan_export_data".to_string(),
                risk_level: "low".to_string(),
            },
            DoctorAction {
                id: "migrate".to_string(),
                name: "Migrer Schéma".to_string(),
                description: "Migrer vers la dernière version du schéma".to_string(),
                command: "titan_migrate_state".to_string(),
                risk_level: "medium".to_string(),
            },
            DoctorAction {
                id: "integrity".to_string(),
                name: "Vérifier Intégrité".to_string(),
                description: "Lancer une vérification d'intégrité complète".to_string(),
                command: "titan_run_full_integrity_check".to_string(),
                risk_level: "low".to_string(),
            },
        ];

        // Ajouter les actions spécifiques aux issues
        for issue in critical.iter().chain(warnings.iter()) {
            if let Some(fix_cmd) = &issue.fix_action {
                if !actions.iter().any(|a| &a.command == fix_cmd) {
                    actions.push(DoctorAction {
                        id: format!("fix_{}", issue.id),
                        name: format!("Fix: {}", issue.id),
                        description: issue.message.clone(),
                        command: fix_cmd.clone(),
                        risk_level: if issue.severity == "critical" {
                            "medium"
                        } else {
                            "low"
                        }
                        .to_string(),
                    });
                }
            }
        }

        actions
    }

    /// Exécuter le Self-Healing
    pub async fn heal(&mut self) -> SelfHealingReport {
        log::info!("[MemoryDoctor] 🔧 Lancement du Self-Healing...");
        self.health_engine.auto_heal().await
    }

    /// Compacter le journal
    pub async fn compact(&self) -> Result<CompactionReport, String> {
        log::info!("[MemoryDoctor] 🗜️ Compaction du journal...");

        let mut engine = PERSISTENCE_ENGINE.write().await;
        engine.compact_journal().await.map_err(|e| e.to_string())
    }

    /// Exporter un backup
    pub async fn export(&mut self, path: &str, description: &str) -> Result<(), String> {
        log::info!("[MemoryDoctor] 💾 Export vers {}...", path);

        use std::path::Path;
        let path_buf = Path::new(path);
        let desc = if description.is_empty() {
            None
        } else {
            Some(description.to_string())
        };

        self.backup_engine
            .export(path_buf, desc)
            .await
            .map(|_| ())
            .map_err(|e| e.to_string())
    }

    /// Générer un résumé textuel
    pub fn generate_summary(report: &DoctorReport) -> String {
        let mut lines = vec![
            "╔══════════════════════════════════════════════════════════════════════╗".to_string(),
            "║           🩺 TITAN MEMORY DOCTOR — RAPPORT                           ║".to_string(),
            "╠══════════════════════════════════════════════════════════════════════╣".to_string(),
        ];

        let status_emoji = match report.overall_status {
            DoctorStatus::Healthy => "✅",
            DoctorStatus::NeedsAttention => "⚠️",
            DoctorStatus::Critical => "🔴",
            DoctorStatus::Unknown => "❓",
        };

        lines.push(format!(
            "║  Status: {} {:?}   Score: {}/100                          ║",
            status_emoji, report.overall_status, report.score
        ));
        lines.push(format!(
            "║  Durée: {}ms                                                     ║",
            report.duration_ms
        ));
        lines.push(
            "╠══════════════════════════════════════════════════════════════════════╣".to_string(),
        );

        // Storage
        lines.push(
            "║  📦 STOCKAGE                                                         ║".to_string(),
        );
        lines.push(format!(
            "║    Journal: {} événements ({} KB)                              ║",
            report.storage.events_count,
            report.storage.journal_size_bytes / 1024
        ));
        lines.push(format!(
            "║    Snapshots: {} ({} KB)                                        ║",
            report.storage.snapshots_count,
            report.storage.snapshots_size_bytes / 1024
        ));

        // Schema
        lines.push(
            "║  📐 SCHÉMA                                                           ║".to_string(),
        );
        lines.push(format!(
            "║    Version: v{} → v{} {}                                    ║",
            report.schema.state_version,
            report.schema.current_version,
            if report.schema.needs_migration {
                "(migration requise)"
            } else {
                "✓"
            }
        ));

        // Issues
        if !report.critical_issues.is_empty() || !report.warnings.is_empty() {
            lines.push(
                "║  ⚠️  PROBLÈMES                                                       ║"
                    .to_string(),
            );
            for issue in &report.critical_issues {
                lines.push(format!(
                    "║    🔴 {}: {}                                ║",
                    issue.category, issue.message
                ));
            }
            for issue in &report.warnings {
                lines.push(format!(
                    "║    ⚠️  {}: {}                                ║",
                    issue.category, issue.message
                ));
            }
        }

        // Suggestions
        if !report.suggestions.is_empty() {
            lines.push(
                "║  💡 SUGGESTIONS                                                      ║"
                    .to_string(),
            );
            for (i, sug) in report.suggestions.iter().take(3).enumerate() {
                lines.push(format!(
                    "║    {}. {}                                    ║",
                    i + 1,
                    sug
                ));
            }
        }

        lines.push(
            "╚══════════════════════════════════════════════════════════════════════╝".to_string(),
        );

        lines.join("\n")
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// TESTS
// ═══════════════════════════════════════════════════════════════════════════════

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_doctor_creation() {
        let _doctor = MemoryDoctor::new();
        // Doctor created successfully
        assert!(true);
    }

    #[test]
    fn test_summary_generation() {
        let report = DoctorReport {
            timestamp: 0,
            duration_ms: 100,
            overall_status: DoctorStatus::Healthy,
            score: 95,
            health: None,
            validation: None,
            storage: StorageReport {
                data_dir_exists: true,
                data_dir_path: "/data".to_string(),
                total_size_bytes: 1024,
                journal_size_bytes: 512,
                snapshots_size_bytes: 256,
                backups_size_bytes: 128,
                snapshots_count: 5,
                events_count: 100,
            },
            schema: SchemaReport {
                current_version: 2,
                state_version: 2,
                needs_migration: false,
                migration_path: vec![],
            },
            backups: BackupReport {
                backup_dir_exists: true,
                backup_count: 3,
                last_backup_at: Some(0),
                oldest_backup_at: Some(0),
                total_backup_size_bytes: 1024,
                days_since_last_backup: Some(1),
            },
            critical_issues: vec![],
            warnings: vec![],
            suggestions: vec!["Test suggestion".to_string()],
            available_actions: vec![],
        };

        let summary = MemoryDoctor::generate_summary(&report);
        assert!(summary.contains("TITAN MEMORY DOCTOR"));
        assert!(summary.contains("95/100"));
    }
}
