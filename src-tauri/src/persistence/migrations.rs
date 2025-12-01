//! ═══════════════════════════════════════════════════════════════════════════════
//! TITANE∞ v∞.MPE-2 — SCHEMA MIGRATIONS ENGINE
//! Pipeline de migrations versionnées pour SingularityState
//! © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
//! ═══════════════════════════════════════════════════════════════════════════════

use serde::{Deserialize, Serialize};
use serde_json::Value;

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════

/// Version actuelle du schéma SingularityState
pub const CURRENT_SCHEMA_VERSION: u32 = 2;

/// Version minimum supportée pour migration
pub const MIN_SUPPORTED_VERSION: u32 = 1;

// ═══════════════════════════════════════════════════════════════════════════════
// ERROR TYPES
// ═══════════════════════════════════════════════════════════════════════════════

/// Erreurs de migration
#[derive(Debug, Clone, Serialize, Deserialize, thiserror::Error)]
pub enum MigrationError {
    #[error("Version inconnue: {0}")]
    UnknownVersion(u32),

    #[error("Version trop ancienne: {version} < {min_supported}")]
    VersionTooOld { version: u32, min_supported: u32 },

    #[error("Migration impossible de v{from} vers v{to}: {reason}")]
    MigrationFailed { from: u32, to: u32, reason: String },

    #[error("Champ manquant requis: {0}")]
    MissingRequiredField(String),

    #[error("Type invalide pour champ {field}: attendu {expected}")]
    InvalidFieldType { field: String, expected: String },

    #[error("Erreur de sérialisation: {0}")]
    SerializationError(String),

    #[error("Invariant violé: {0}")]
    InvariantViolation(String),
}

// ═══════════════════════════════════════════════════════════════════════════════
// MIGRATION REPORT
// ═══════════════════════════════════════════════════════════════════════════════

/// Rapport de migration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MigrationReport {
    /// Version de départ
    pub from_version: u32,
    /// Version finale
    pub to_version: u32,
    /// Migrations appliquées
    pub steps_applied: Vec<MigrationStep>,
    /// Durée totale en ms
    pub duration_ms: u64,
    /// Succès
    pub success: bool,
    /// Erreurs
    pub errors: Vec<String>,
    /// Warnings
    pub warnings: Vec<String>,
    /// Timestamp
    pub timestamp: u64,
}

/// Étape de migration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MigrationStep {
    pub from: u32,
    pub to: u32,
    pub description: String,
    pub fields_added: Vec<String>,
    pub fields_removed: Vec<String>,
    pub fields_renamed: Vec<(String, String)>,
    pub duration_ms: u64,
}

// ═══════════════════════════════════════════════════════════════════════════════
// MIGRATION ENGINE
// ═══════════════════════════════════════════════════════════════════════════════

/// Moteur de migration
pub struct MigrationEngine {
    /// Historique des migrations
    history: Vec<MigrationReport>,
}

impl MigrationEngine {
    pub fn new() -> Self {
        Self {
            history: Vec::new(),
        }
    }

    /// Migrer un état JSON vers la version actuelle
    pub fn migrate_to_current(&mut self, state_json: &mut Value) -> Result<MigrationReport, MigrationError> {
        let start = std::time::Instant::now();

        // Extraire la version actuelle
        let current_version = self.extract_version(state_json)?;

        if current_version > CURRENT_SCHEMA_VERSION {
            return Err(MigrationError::MigrationFailed {
                from: current_version,
                to: CURRENT_SCHEMA_VERSION,
                reason: format!("Version {} plus récente que la version supportée {}", current_version, CURRENT_SCHEMA_VERSION),
            });
        }

        if current_version < MIN_SUPPORTED_VERSION {
            return Err(MigrationError::VersionTooOld {
                version: current_version,
                min_supported: MIN_SUPPORTED_VERSION,
            });
        }

        let mut report = MigrationReport {
            from_version: current_version,
            to_version: CURRENT_SCHEMA_VERSION,
            steps_applied: Vec::new(),
            duration_ms: 0,
            success: false,
            errors: Vec::new(),
            warnings: Vec::new(),
            timestamp: chrono::Utc::now().timestamp_millis() as u64,
        };

        // Appliquer les migrations étape par étape
        let mut version = current_version;
        while version < CURRENT_SCHEMA_VERSION {
            let step_start = std::time::Instant::now();
            let step = self.migrate_one_step(state_json, version)?;

            let mut step_record = step;
            step_record.duration_ms = step_start.elapsed().as_millis() as u64;
            report.steps_applied.push(step_record);

            version += 1;
        }

        // Mettre à jour la version dans l'état
        self.set_version(state_json, CURRENT_SCHEMA_VERSION);

        report.duration_ms = start.elapsed().as_millis() as u64;
        report.success = true;

        self.history.push(report.clone());

        log::info!(
            "[MigrationEngine] ✅ Migration v{} → v{} en {}ms ({} étapes)",
            current_version,
            CURRENT_SCHEMA_VERSION,
            report.duration_ms,
            report.steps_applied.len()
        );

        Ok(report)
    }

    /// Extraire la version du schéma depuis l'état JSON
    fn extract_version(&self, state_json: &Value) -> Result<u32, MigrationError> {
        // Chercher schema_version dans plusieurs emplacements possibles
        if let Some(version) = state_json.get("schema_version").and_then(|v| v.as_u64()) {
            return Ok(version as u32);
        }

        // Chercher dans meta
        if let Some(meta) = state_json.get("meta") {
            if let Some(version) = meta.get("schema_version").and_then(|v| v.as_u64()) {
                return Ok(version as u32);
            }
        }

        // Version par défaut si non trouvée (v1)
        log::warn!("[MigrationEngine] schema_version non trouvé, assume v1");
        Ok(1)
    }

    /// Définir la version dans l'état
    fn set_version(&self, state_json: &mut Value, version: u32) {
        if let Some(obj) = state_json.as_object_mut() {
            obj.insert("schema_version".to_string(), Value::Number(version.into()));
        }
    }

    /// Appliquer une étape de migration
    fn migrate_one_step(&self, state_json: &mut Value, from_version: u32) -> Result<MigrationStep, MigrationError> {
        match from_version {
            1 => self.migrate_v1_to_v2(state_json),
            _ => Err(MigrationError::UnknownVersion(from_version)),
        }
    }

    /// Migration v1 → v2
    /// Ajouts: schema_version explicite, created_at, last_migrated_at
    fn migrate_v1_to_v2(&self, state_json: &mut Value) -> Result<MigrationStep, MigrationError> {
        let step = MigrationStep {
            from: 1,
            to: 2,
            description: "Ajout schema_version, timestamps création/migration".to_string(),
            fields_added: vec![
                "schema_version".to_string(),
                "created_at".to_string(),
                "last_migrated_at".to_string(),
            ],
            fields_removed: Vec::new(),
            fields_renamed: Vec::new(),
            duration_ms: 0,
        };

        let obj = state_json.as_object_mut().ok_or_else(|| {
            MigrationError::InvalidFieldType {
                field: "root".to_string(),
                expected: "object".to_string(),
            }
        })?;

        let now = chrono::Utc::now().timestamp_millis() as u64;

        // Ajouter schema_version
        obj.insert("schema_version".to_string(), Value::Number(2.into()));

        // Ajouter created_at si absent
        if !obj.contains_key("created_at") {
            // Utiliser timestamp existant comme fallback
            let created = obj.get("timestamp")
                .and_then(|v| v.as_u64())
                .unwrap_or(now);
            obj.insert("created_at".to_string(), Value::Number(created.into()));
        }

        // Ajouter last_migrated_at
        obj.insert("last_migrated_at".to_string(), Value::Number(now.into()));

        log::info!("[MigrationEngine] 📦 v1 → v2: Ajouté schema_version + timestamps");

        Ok(step)
    }

    /// Obtenir l'historique des migrations
    pub fn history(&self) -> &[MigrationReport] {
        &self.history
    }

    /// Vérifier si migration nécessaire
    pub fn needs_migration(&self, state_json: &Value) -> Result<bool, MigrationError> {
        let version = self.extract_version(state_json)?;
        Ok(version < CURRENT_SCHEMA_VERSION)
    }
}

impl Default for MigrationEngine {
    fn default() -> Self {
        Self::new()
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// TESTS
// ═══════════════════════════════════════════════════════════════════════════════

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    #[test]
    fn test_extract_version_explicit() {
        let engine = MigrationEngine::new();
        let state = json!({
            "schema_version": 2,
            "timestamp": 1234567890
        });
        assert_eq!(engine.extract_version(&state).unwrap(), 2);
    }

    #[test]
    fn test_extract_version_default() {
        let engine = MigrationEngine::new();
        let state = json!({
            "timestamp": 1234567890
        });
        // Sans schema_version, doit retourner 1
        assert_eq!(engine.extract_version(&state).unwrap(), 1);
    }

    #[test]
    fn test_migrate_v1_to_v2() {
        let mut engine = MigrationEngine::new();
        let mut state = json!({
            "timestamp": 1234567890,
            "physical": {},
            "cognitive": {}
        });

        let report = engine.migrate_to_current(&mut state).unwrap();

        assert!(report.success);
        assert_eq!(report.from_version, 1);
        assert_eq!(report.to_version, 2);
        assert_eq!(state.get("schema_version").unwrap().as_u64().unwrap(), 2);
        assert!(state.get("created_at").is_some());
        assert!(state.get("last_migrated_at").is_some());
    }

    #[test]
    fn test_no_migration_needed() {
        let engine = MigrationEngine::new();
        let state = json!({
            "schema_version": CURRENT_SCHEMA_VERSION,
            "timestamp": 1234567890
        });
        assert!(!engine.needs_migration(&state).unwrap());
    }

    #[test]
    fn test_migration_needed() {
        let engine = MigrationEngine::new();
        let state = json!({
            "schema_version": 1,
            "timestamp": 1234567890
        });
        assert!(engine.needs_migration(&state).unwrap());
    }
}
