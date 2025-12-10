//! ═══════════════════════════════════════════════════════════════════════════════
//! TITANE∞ v∞.MPE — PERSISTENCE COMMANDS
//! Commandes Tauri pour la persistence 100% SAVE
//! ═══════════════════════════════════════════════════════════════════════════════

use crate::core::SingularityState;
use crate::persistence::{IntegrityReport, PersistenceStatus, TitanEvent, PERSISTENCE_ENGINE};
use serde::{Deserialize, Serialize};

/// DTO pour événement frontend
///
/// Accepte les champs optionnels pour rétro-compatibilité
/// Les valeurs par défaut sont appliquées dans titan_persist_event
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TitanEventDto {
    pub module: String,
    pub event_type: String,
    pub payload: serde_json::Value,
    pub metadata: Option<std::collections::HashMap<String, serde_json::Value>>,
    /// Version du schéma (optionnel, défaut: CURRENT_SCHEMA_VERSION)
    #[serde(default)]
    pub schema_version: Option<u32>,
    /// Origine de l'événement (optionnel, défaut: "user")
    #[serde(default)]
    pub origin: Option<String>,
}

/// DTO pour le status de persistence
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PersistenceStatusDto {
    pub events_persisted: u64,
    pub snapshots_created: u64,
    pub last_event: Option<u64>,
    pub last_snapshot: Option<u64>,
    pub last_integrity_check: Option<u64>,
    pub integrity_ok: bool,
    pub dirty: bool,
    pub journal_size_bytes: u64,
}

impl From<&PersistenceStatus> for PersistenceStatusDto {
    fn from(status: &PersistenceStatus) -> Self {
        Self {
            events_persisted: status.events_persisted,
            snapshots_created: status.snapshots_created,
            last_event: status.last_event,
            last_snapshot: status.last_snapshot,
            last_integrity_check: status.last_integrity_check,
            integrity_ok: status.integrity_ok,
            dirty: status.dirty,
            journal_size_bytes: status.journal_size_bytes,
        }
    }
}

/// Initialiser le moteur de persistence
#[tauri::command]
pub async fn titan_persistence_init() -> Result<(), String> {
    let mut engine = PERSISTENCE_ENGINE.write().await;
    engine.initialize().await.map_err(|e| e.to_string())
}

/// Persister un événement
#[tauri::command]
pub async fn titan_persist_event(event: TitanEventDto) -> Result<(), String> {
    use crate::persistence::EventOrigin;

    // Convertir l'origine string en enum
    let origin = match event.origin.as_deref() {
        Some("user") | None => EventOrigin::User,
        Some("engine") => EventOrigin::Engine,
        Some("self_heal") => EventOrigin::SelfHeal,
        Some("system") => EventOrigin::System,
        Some("migration") => EventOrigin::Migration,
        Some(other) => {
            log::warn!(
                "[titan_persist_event] Origine inconnue '{}', utilisation de 'user'",
                other
            );
            EventOrigin::User
        }
    };

    let titan_event =
        TitanEvent::with_origin(&event.module, &event.event_type, event.payload, origin);

    let mut engine = PERSISTENCE_ENGINE.write().await;
    engine
        .persist_event(titan_event)
        .await
        .map_err(|e| e.to_string())
}

/// Forcer un snapshot avec état fourni
#[tauri::command]
pub async fn titan_force_snapshot(state_json: String) -> Result<(), String> {
    // Désérialiser l'état reçu du frontend
    let state: SingularityState =
        serde_json::from_str(&state_json).map_err(|e| format!("JSON parse error: {}", e))?;

    let mut engine = PERSISTENCE_ENGINE.write().await;
    engine
        .force_snapshot(&state)
        .await
        .map_err(|e| e.to_string())
}

/// Obtenir le status de persistence
#[tauri::command]
pub async fn titan_get_persistence_status() -> Result<PersistenceStatusDto, String> {
    let engine = PERSISTENCE_ENGINE.read().await;
    Ok(PersistenceStatusDto::from(engine.get_status()))
}

/// Vérifier l'intégrité
#[tauri::command]
pub async fn titan_check_integrity() -> Result<IntegrityReport, String> {
    let mut engine = PERSISTENCE_ENGINE.write().await;
    engine.check_integrity().await.map_err(|e| e.to_string())
}

/// Compacter le journal
#[tauri::command]
pub async fn titan_compact_journal() -> Result<crate::persistence::CompactionReport, String> {
    let mut engine = PERSISTENCE_ENGINE.write().await;
    engine.compact_journal().await.map_err(|e| e.to_string())
}

/// Charger l'état le plus récent
#[tauri::command]
pub async fn titan_load_state() -> Result<Option<SingularityState>, String> {
    let engine = PERSISTENCE_ENGINE.read().await;
    engine.load_latest_state().await.map_err(|e| e.to_string())
}

/// Récupérer les événements depuis un timestamp
#[tauri::command]
pub async fn titan_get_events_since(timestamp: u64) -> Result<Vec<TitanEvent>, String> {
    let engine = PERSISTENCE_ENGINE.read().await;
    engine
        .get_events_since(timestamp)
        .await
        .map_err(|e| e.to_string())
}

/// Lister les snapshots disponibles
#[tauri::command]
pub async fn titan_list_snapshots() -> Result<Vec<crate::persistence::SnapshotInfo>, String> {
    let engine = PERSISTENCE_ENGINE.read().await;
    engine.list_snapshots().await.map_err(|e| e.to_string())
}

/// Récupérer l'état depuis snapshot + events (recovery)
#[tauri::command]
pub async fn titan_recover_state() -> Result<Option<SingularityState>, String> {
    let engine = PERSISTENCE_ENGINE.read().await;
    engine.recover_state().await.map_err(|e| e.to_string())
}

/// Vérifier l'intégrité complète
#[tauri::command]
pub async fn titan_verify_integrity() -> Result<IntegrityReport, String> {
    let mut engine = PERSISTENCE_ENGINE.write().await;
    engine.check_integrity().await.map_err(|e| e.to_string())
}

/// Shutdown propre
#[tauri::command]
pub async fn titan_persistence_shutdown() -> Result<(), String> {
    let mut engine = PERSISTENCE_ENGINE.write().await;
    engine.shutdown().await.map_err(|e| e.to_string())
}

// ═══════════════════════════════════════════════════════════════════════════════
// v∞.MPE-2 COMMANDS — Migrations, Compression, Backup
// ═══════════════════════════════════════════════════════════════════════════════

/// Migrer l'état vers la version actuelle du schéma
#[tauri::command]
pub async fn titan_migrate_state(state_json: String) -> Result<MigrationReportDto, String> {
    use super::migrations::MigrationEngine;

    let mut state: serde_json::Value =
        serde_json::from_str(&state_json).map_err(|e| format!("JSON parse error: {}", e))?;

    let mut engine = MigrationEngine::new();
    let report = engine
        .migrate_to_current(&mut state)
        .map_err(|e| e.to_string())?;

    Ok(MigrationReportDto {
        from_version: report.from_version,
        to_version: report.to_version,
        steps_applied: report.steps_applied.len() as u32,
        duration_ms: report.duration_ms,
        success: report.success,
        migrated_state: serde_json::to_string(&state).ok(),
    })
}

/// DTO pour le rapport de migration
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct MigrationReportDto {
    pub from_version: u32,
    pub to_version: u32,
    pub steps_applied: u32,
    pub duration_ms: u64,
    pub success: bool,
    pub migrated_state: Option<String>,
}

/// Obtenir la version actuelle du schéma
#[tauri::command]
pub fn titan_get_schema_version() -> u32 {
    super::migrations::CURRENT_SCHEMA_VERSION
}

/// Exporter les données vers une archive
#[tauri::command]
pub async fn titan_export_data(
    path: String,
    description: Option<String>,
) -> Result<ExportReportDto, String> {
    use super::backup::BackupEngine;

    let mut engine = BackupEngine::new();
    let report = engine
        .export(std::path::Path::new(&path), description)
        .await
        .map_err(|e| e.to_string())?;

    Ok(ExportReportDto {
        success: report.success,
        archive_path: report.archive_path,
        files_exported: report.files_exported,
        total_size_bytes: report.total_size_bytes,
        compressed_size_bytes: report.compressed_size_bytes,
        duration_ms: report.duration_ms,
    })
}

/// DTO pour le rapport d'export
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct ExportReportDto {
    pub success: bool,
    pub archive_path: String,
    pub files_exported: u32,
    pub total_size_bytes: u64,
    pub compressed_size_bytes: u64,
    pub duration_ms: u64,
}

/// Valider une archive avant import
#[tauri::command]
pub async fn titan_validate_archive(path: String) -> Result<ArchiveValidationDto, String> {
    use super::backup::BackupEngine;

    let engine = BackupEngine::new();
    let validation = engine
        .validate_archive(std::path::Path::new(&path))
        .await
        .map_err(|e| e.to_string())?;

    Ok(ArchiveValidationDto {
        is_valid: validation.is_valid,
        compatible_version: validation.compatible_version,
        compatible_schema: validation.compatible_schema,
        integrity_ok: validation.integrity_ok,
        errors: validation.errors,
        warnings: validation.warnings,
        schema_version: validation.metadata.as_ref().map(|m| m.schema_version),
        created_at: validation.metadata.as_ref().map(|m| m.created_at),
    })
}

/// DTO pour la validation d'archive
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct ArchiveValidationDto {
    pub is_valid: bool,
    pub compatible_version: bool,
    pub compatible_schema: bool,
    pub integrity_ok: bool,
    pub errors: Vec<String>,
    pub warnings: Vec<String>,
    pub schema_version: Option<u32>,
    pub created_at: Option<u64>,
}

/// Importer une archive
#[tauri::command]
pub async fn titan_import_data(path: String, mode: String) -> Result<ImportReportDto, String> {
    use super::backup::{BackupEngine, ImportMode};

    let import_mode = match mode.as_str() {
        "replace" => ImportMode::Replace,
        "merge" => ImportMode::Merge,
        _ => return Err("Mode invalide: 'replace' ou 'merge'".to_string()),
    };

    let mut engine = BackupEngine::new();
    let report = engine
        .import(std::path::Path::new(&path), import_mode)
        .await
        .map_err(|e| e.to_string())?;

    Ok(ImportReportDto {
        success: report.success,
        mode,
        files_imported: report.files_imported,
        events_imported: report.events_imported,
        snapshots_imported: report.snapshots_imported,
        schema_version: report.schema_version,
        duration_ms: report.duration_ms,
        errors: report.errors,
        warnings: report.warnings,
    })
}

/// DTO pour le rapport d'import
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct ImportReportDto {
    pub success: bool,
    pub mode: String,
    pub files_imported: u32,
    pub events_imported: u64,
    pub snapshots_imported: u32,
    pub schema_version: u32,
    pub duration_ms: u64,
    pub errors: Vec<String>,
    pub warnings: Vec<String>,
}

// ═══════════════════════════════════════════════════════════════════════════════
// v∞.MPE-3 COMMANDS — Memory Health, Self-Healing, Invariants
// ═══════════════════════════════════════════════════════════════════════════════

/// Obtenir l'état de santé de la mémoire
#[tauri::command]
pub async fn titan_get_memory_health() -> Result<MemoryHealthDto, String> {
    use super::memory_health::MEMORY_HEALTH_ENGINE;

    let mut engine = MEMORY_HEALTH_ENGINE.write().await;
    let health = engine.diagnose().await;

    Ok(MemoryHealthDto {
        schema_version: health.schema_version,
        current_version: health.current_version,
        db_integrity_ok: health.db_integrity_ok,
        last_integrity_check: health.last_integrity_check,
        last_snapshot_at: health.last_snapshot_at,
        last_compaction_at: health.last_compaction_at,
        event_log_size_bytes: health.event_log_size_bytes,
        event_count: health.event_count,
        snapshot_count: health.snapshot_count,
        estimated_recovery_time_ms: health.estimated_recovery_time_ms,
        last_backup_at: health.last_backup_at,
        issues: health
            .issues
            .iter()
            .map(|i| HealthIssueDto {
                id: i.id.clone(),
                severity: format!("{:?}", i.severity),
                category: format!("{:?}", i.category),
                message: i.message.clone(),
                auto_fixable: i.auto_fixable,
            })
            .collect(),
        health_score: health.health_score,
        recommendations: health
            .recommendations
            .iter()
            .map(|r| RecommendationDto {
                id: r.id.clone(),
                priority: r.priority,
                message: r.message.clone(),
                action: r.action.clone(),
                command: r.command.clone(),
            })
            .collect(),
    })
}

/// DTO pour la santé mémoire
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct MemoryHealthDto {
    pub schema_version: u32,
    pub current_version: u32,
    pub db_integrity_ok: bool,
    pub last_integrity_check: Option<u64>,
    pub last_snapshot_at: Option<u64>,
    pub last_compaction_at: Option<u64>,
    pub event_log_size_bytes: u64,
    pub event_count: u64,
    pub snapshot_count: u32,
    pub estimated_recovery_time_ms: Option<u64>,
    pub last_backup_at: Option<u64>,
    pub issues: Vec<HealthIssueDto>,
    pub health_score: u8,
    pub recommendations: Vec<RecommendationDto>,
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct HealthIssueDto {
    pub id: String,
    pub severity: String,
    pub category: String,
    pub message: String,
    pub auto_fixable: bool,
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct RecommendationDto {
    pub id: String,
    pub priority: u8,
    pub message: String,
    pub action: String,
    pub command: Option<String>,
}

/// Lancer le Self-Healing automatique
#[tauri::command]
pub async fn titan_run_self_healing() -> Result<SelfHealingReportDto, String> {
    use super::memory_health::MEMORY_HEALTH_ENGINE;

    let mut engine = MEMORY_HEALTH_ENGINE.write().await;
    let report = engine.auto_heal().await;

    Ok(SelfHealingReportDto {
        timestamp: report.timestamp,
        issues_fixed: report.issues_fixed,
        issues_remaining: report.issues_remaining,
        duration_ms: report.duration_ms,
        success: report.success,
        actions: report
            .actions
            .iter()
            .map(|a| HealingActionDto {
                action_type: a.action_type.clone(),
                description: a.description.clone(),
                success: a.success,
                details: a.details.clone(),
            })
            .collect(),
    })
}

/// DTO pour le rapport de Self-Healing
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct SelfHealingReportDto {
    pub timestamp: u64,
    pub issues_fixed: u32,
    pub issues_remaining: u32,
    pub duration_ms: u64,
    pub success: bool,
    pub actions: Vec<HealingActionDto>,
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct HealingActionDto {
    pub action_type: String,
    pub description: String,
    pub success: bool,
    pub details: Option<String>,
}

/// Valider les invariants d'un état
#[tauri::command]
pub fn titan_validate_invariants(
    state_json: String,
    strict: bool,
) -> Result<ValidationResultDto, String> {
    use super::invariants::{assert_singularity_state_invariants, ValidationMode};

    let state: serde_json::Value =
        serde_json::from_str(&state_json).map_err(|e| format!("JSON parse error: {}", e))?;

    let mode = if strict {
        ValidationMode::Strict
    } else {
        ValidationMode::Lenient
    };
    let result = assert_singularity_state_invariants(&state, mode);

    Ok(ValidationResultDto {
        is_valid: result.is_valid,
        errors: result.errors.iter().map(|e| e.to_string()).collect(),
        warnings: result.warnings,
        fields_checked: result.fields_checked,
        duration_ms: result.duration_ms,
    })
}

/// DTO pour le résultat de validation
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct ValidationResultDto {
    pub is_valid: bool,
    pub errors: Vec<String>,
    pub warnings: Vec<String>,
    pub fields_checked: u32,
    pub duration_ms: u64,
}

/// Reset un module spécifique (maintenance avancée)
#[tauri::command]
pub async fn titan_reset_module(module: String) -> Result<String, String> {
    // TODO: Implémenter le reset par module
    log::warn!("[titan_reset_module] Reset du module '{}' demandé", module);
    Err(format!("Reset du module '{}' non implémenté", module))
}

/// Dump complet de l'état (debug uniquement)
#[tauri::command]
pub async fn titan_dump_raw_state() -> Result<String, String> {
    let engine = PERSISTENCE_ENGINE.read().await;
    match engine.load_latest_state().await {
        Ok(Some(state)) => serde_json::to_string_pretty(&state).map_err(|e| e.to_string()),
        Ok(None) => Ok("{}".to_string()),
        Err(e) => Err(e.to_string()),
    }
}

/// Full integrity check (DB + invariants + simulation recovery)
#[tauri::command]
pub async fn titan_run_full_integrity_check() -> Result<FullIntegrityReportDto, String> {
    use super::memory_health::MEMORY_HEALTH_ENGINE;

    // 1. Check DB integrity
    let mut persistence = PERSISTENCE_ENGINE.write().await;
    let db_report = persistence
        .check_integrity()
        .await
        .map_err(|e| e.to_string())?;

    // 2. Check memory health
    let mut health_engine = MEMORY_HEALTH_ENGINE.write().await;
    let health = health_engine.diagnose().await;

    // 3. Simuler recovery
    let recovery_ok = persistence.load_latest_state().await.is_ok();

    Ok(FullIntegrityReportDto {
        database_ok: db_report.is_valid,
        health_score: health.health_score,
        recovery_ok,
        issues_count: health.issues.len() as u32,
        timestamp: chrono::Utc::now().timestamp_millis() as u64,
    })
}

/// DTO pour le rapport d'intégrité complet
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct FullIntegrityReportDto {
    pub database_ok: bool,
    pub health_score: u8,
    pub recovery_ok: bool,
    pub issues_count: u32,
    pub timestamp: u64,
}

// ═══════════════════════════════════════════════════════════════════════════════
// MEMORY DOCTOR COMMANDS (v∞.MPE-Ω)
// ═══════════════════════════════════════════════════════════════════════════════

/// Diagnostic complet du système de mémoire
#[tauri::command]
pub async fn titan_memory_doctor_diagnose() -> Result<super::memory_doctor::DoctorReport, String> {
    let mut doctor = super::memory_doctor::MemoryDoctor::new();
    Ok(doctor.diagnose().await)
}

/// Obtenir un résumé textuel du diagnostic
#[tauri::command]
pub async fn titan_memory_doctor_summary() -> Result<String, String> {
    let mut doctor = super::memory_doctor::MemoryDoctor::new();
    let report = doctor.diagnose().await;
    Ok(super::memory_doctor::MemoryDoctor::generate_summary(
        &report,
    ))
}

/// Lancer le Self-Healing via Memory Doctor
#[tauri::command]
pub async fn titan_memory_doctor_heal() -> Result<super::memory_health::SelfHealingReport, String> {
    let mut doctor = super::memory_doctor::MemoryDoctor::new();
    Ok(doctor.heal().await)
}

/// Compacter le journal via Memory Doctor
#[tauri::command]
pub async fn titan_memory_doctor_compact() -> Result<super::types::CompactionReport, String> {
    let doctor = super::memory_doctor::MemoryDoctor::new();
    doctor.compact().await
}

/// Exporter un backup via Memory Doctor
#[tauri::command]
pub async fn titan_memory_doctor_export(path: String, description: String) -> Result<(), String> {
    let mut doctor = super::memory_doctor::MemoryDoctor::new();
    doctor.export(&path, &description).await
}
