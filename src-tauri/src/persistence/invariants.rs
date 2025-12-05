//! ═══════════════════════════════════════════════════════════════════════════════
//! TITANE∞ v∞.MPE-3 — INVARIANTS ENGINE
//! Validation des invariants et garde-fous pour la mémoire TITANE
//! © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
//! ═══════════════════════════════════════════════════════════════════════════════

use serde::{Deserialize, Serialize};
use serde_json::Value;
use super::migrations::CURRENT_SCHEMA_VERSION;
use super::types::TitanEvent;

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

/// Erreur d'invariant
#[derive(Debug, Clone, Serialize, Deserialize, thiserror::Error)]
pub enum InvariantError {
    #[error("Champ manquant: {field}")]
    MissingField { field: String },

    #[error("Type invalide pour {field}: attendu {expected}, trouvé {found}")]
    InvalidType {
        field: String,
        expected: String,
        found: String,
    },

    #[error("Valeur hors limites pour {field}: {value} (min: {min}, max: {max})")]
    OutOfRange {
        field: String,
        value: String,
        min: String,
        max: String,
    },

    #[error("ID dupliqué: {id} dans {collection}")]
    DuplicateId { id: String, collection: String },

    #[error("Date incohérente: {field} = {value} ({reason})")]
    InconsistentDate {
        field: String,
        value: u64,
        reason: String,
    },

    #[error("Relation brisée: {from} → {to}")]
    BrokenRelation { from: String, to: String },

    #[error("Intégrité compromise: {message}")]
    IntegrityViolation { message: String },

    #[error("État incohérent: {message}")]
    InconsistentState { message: String },
}

/// Résultat de validation
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ValidationResult {
    /// Valide
    pub is_valid: bool,
    /// Erreurs trouvées
    pub errors: Vec<InvariantError>,
    /// Warnings (non bloquants)
    pub warnings: Vec<String>,
    /// Champs validés
    pub fields_checked: u32,
    /// Durée en ms
    pub duration_ms: u64,
}

/// Mode de validation
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ValidationMode {
    /// Strict: toute violation = erreur
    Strict,
    /// Lenient: certaines violations = warnings
    Lenient,
    /// Recovery: tenter de réparer
    Recovery,
}

// ═══════════════════════════════════════════════════════════════════════════════
// INVARIANT DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════════════

/// Type de fonction d'auto-réparation
type AutoFixFn = fn(&mut Value) -> Result<(), InvariantError>;

/// Définition d'un invariant
pub struct InvariantDef {
    pub name: &'static str,
    pub description: &'static str,
    pub check: fn(&Value) -> Result<(), InvariantError>,
    pub auto_fix: Option<AutoFixFn>,
}

// ═══════════════════════════════════════════════════════════════════════════════
// SINGULARITY STATE INVARIANTS
// ═══════════════════════════════════════════════════════════════════════════════

/// Vérifier les invariants du SingularityState
pub fn assert_singularity_state_invariants(
    state_json: &Value,
    mode: ValidationMode,
) -> ValidationResult {
    let start = std::time::Instant::now();
    let mut errors = Vec::new();
    let mut warnings = Vec::new();
    let mut fields_checked = 0;

    // 1. schema_version doit être présent et valide
    fields_checked += 1;
    match state_json.get("schema_version") {
        Some(v) => {
            if let Some(version) = v.as_u64() {
                if version > CURRENT_SCHEMA_VERSION as u64 {
                    let err = InvariantError::OutOfRange {
                        field: "schema_version".to_string(),
                        value: version.to_string(),
                        min: "1".to_string(),
                        max: CURRENT_SCHEMA_VERSION.to_string(),
                    };
                    if mode == ValidationMode::Strict {
                        errors.push(err);
                    } else {
                        warnings.push(format!("schema_version {} > actuel {}", version, CURRENT_SCHEMA_VERSION));
                    }
                }
            } else {
                errors.push(InvariantError::InvalidType {
                    field: "schema_version".to_string(),
                    expected: "number".to_string(),
                    found: value_type_name(v),
                });
            }
        }
        None => {
            if mode == ValidationMode::Strict {
                errors.push(InvariantError::MissingField {
                    field: "schema_version".to_string(),
                });
            } else {
                warnings.push("schema_version absent (assume v1)".to_string());
            }
        }
    }

    // 2. timestamp doit être présent et raisonnable
    fields_checked += 1;
    if let Some(ts) = state_json.get("timestamp") {
        if let Some(timestamp) = ts.as_u64() {
            let now = chrono::Utc::now().timestamp_millis() as u64;
            let one_year_ago = now.saturating_sub(365 * 24 * 60 * 60 * 1000);
            let one_day_future = now + (24 * 60 * 60 * 1000);

            if timestamp < one_year_ago {
                warnings.push(format!("timestamp trop ancien: {} (> 1 an)", timestamp));
            }
            if timestamp > one_day_future {
                errors.push(InvariantError::InconsistentDate {
                    field: "timestamp".to_string(),
                    value: timestamp,
                    reason: "Dans le futur".to_string(),
                });
            }
        } else {
            errors.push(InvariantError::InvalidType {
                field: "timestamp".to_string(),
                expected: "number".to_string(),
                found: value_type_name(ts),
            });
        }
    } else {
        errors.push(InvariantError::MissingField {
            field: "timestamp".to_string(),
        });
    }

    // 3. Vérifier les layers obligatoires
    for layer in &["physical", "cognitive", "symbolic", "adaptive", "meta"] {
        fields_checked += 1;
        if let Some(layer_data) = state_json.get(*layer) {
            if !layer_data.is_object() {
                errors.push(InvariantError::InvalidType {
                    field: layer.to_string(),
                    expected: "object".to_string(),
                    found: value_type_name(layer_data),
                });
            }
        } else {
            errors.push(InvariantError::MissingField {
                field: layer.to_string(),
            });
        }
    }

    // 4. Vérifier signature (si présente, doit être non vide)
    fields_checked += 1;
    if let Some(sig) = state_json.get("signature") {
        if let Some(s) = sig.as_str() {
            if s.is_empty() {
                warnings.push("signature vide".to_string());
            }
        } else {
            errors.push(InvariantError::InvalidType {
                field: "signature".to_string(),
                expected: "string".to_string(),
                found: value_type_name(sig),
            });
        }
    }

    // 5. Vérifier cohérence des dates internes
    fields_checked += 1;
    if let (Some(created), Some(migrated)) = (
        state_json.get("created_at").and_then(|v| v.as_u64()),
        state_json.get("last_migrated_at").and_then(|v| v.as_u64()),
    ) {
        if migrated < created {
            errors.push(InvariantError::InconsistentDate {
                field: "last_migrated_at".to_string(),
                value: migrated,
                reason: format!("Antérieur à created_at ({})", created),
            });
        }
    }

    ValidationResult {
        is_valid: errors.is_empty(),
        errors,
        warnings,
        fields_checked,
        duration_ms: start.elapsed().as_millis() as u64,
    }
}

/// Vérifier les invariants d'un événement
pub fn assert_event_invariants(event: &TitanEvent) -> Result<(), InvariantError> {
    // 1. ID non vide
    if event.id.is_empty() {
        return Err(InvariantError::MissingField {
            field: "id".to_string(),
        });
    }

    // 2. Timestamp valide
    let now = chrono::Utc::now().timestamp_millis() as u64;
    let one_year_ago = now.saturating_sub(365 * 24 * 60 * 60 * 1000);

    if event.timestamp < one_year_ago {
        return Err(InvariantError::InconsistentDate {
            field: "timestamp".to_string(),
            value: event.timestamp,
            reason: "Trop ancien (> 1 an)".to_string(),
        });
    }

    if event.timestamp > now + (60 * 1000) {
        // 1 minute de tolérance
        return Err(InvariantError::InconsistentDate {
            field: "timestamp".to_string(),
            value: event.timestamp,
            reason: "Dans le futur".to_string(),
        });
    }

    // 3. Module non vide
    if event.module.is_empty() {
        return Err(InvariantError::MissingField {
            field: "module".to_string(),
        });
    }

    // 4. Event type non vide
    if event.event_type.is_empty() {
        return Err(InvariantError::MissingField {
            field: "event_type".to_string(),
        });
    }

    Ok(())
}

/// Vérifier les invariants du MemoryHealth
pub fn assert_memory_health_invariants(
    health: &super::memory_health::MemoryHealth,
) -> Result<(), InvariantError> {
    // 1. current_version doit être CURRENT_SCHEMA_VERSION
    if health.current_version != CURRENT_SCHEMA_VERSION {
        return Err(InvariantError::InconsistentState {
            message: format!(
                "current_version ({}) != CURRENT_SCHEMA_VERSION ({})",
                health.current_version, CURRENT_SCHEMA_VERSION
            ),
        });
    }

    // 2. schema_version <= current_version
    if health.schema_version > health.current_version {
        return Err(InvariantError::InconsistentState {
            message: format!(
                "schema_version ({}) > current_version ({})",
                health.schema_version, health.current_version
            ),
        });
    }

    // 3. health_score dans [0, 100]
    if health.health_score > 100 {
        return Err(InvariantError::OutOfRange {
            field: "health_score".to_string(),
            value: health.health_score.to_string(),
            min: "0".to_string(),
            max: "100".to_string(),
        });
    }

    Ok(())
}

// ═══════════════════════════════════════════════════════════════════════════════
// VALIDATION ENGINE
// ═══════════════════════════════════════════════════════════════════════════════

/// Moteur de validation des invariants
pub struct InvariantsEngine {
    mode: ValidationMode,
    history: Vec<ValidationResult>,
}

impl InvariantsEngine {
    pub fn new(mode: ValidationMode) -> Self {
        Self {
            mode,
            history: Vec::new(),
        }
    }

    /// Valider un état JSON
    pub fn validate_state(&mut self, state_json: &Value) -> ValidationResult {
        let result = assert_singularity_state_invariants(state_json, self.mode);
        self.history.push(result.clone());

        if !result.is_valid {
            log::warn!(
                "[Invariants] ⚠️ {} erreurs détectées, {} warnings",
                result.errors.len(),
                result.warnings.len()
            );
        }

        result
    }

    /// Valider un événement
    pub fn validate_event(&self, event: &TitanEvent) -> Result<(), InvariantError> {
        assert_event_invariants(event)
    }

    /// Valider et réparer si possible
    pub fn validate_and_repair(&mut self, state_json: &mut Value) -> ValidationResult {
        let mut result = self.validate_state(state_json);

        if !result.is_valid && self.mode == ValidationMode::Recovery {
            // Tenter de réparer les erreurs
            let mut repaired = 0;

            for error in &result.errors {
                if let Ok(()) = self.try_repair(state_json, error) {
                    repaired += 1;
                }
            }

            if repaired > 0 {
                log::info!("[Invariants] 🔧 {} erreurs réparées", repaired);
                // Re-valider
                result = assert_singularity_state_invariants(state_json, self.mode);
            }
        }

        result
    }

    /// Tenter de réparer une erreur
    #[allow(clippy::single_match)]
    fn try_repair(&self, state_json: &mut Value, error: &InvariantError) -> Result<(), ()> {
        if let InvariantError::MissingField { field } = error {
            if let Some(obj) = state_json.as_object_mut() {
                match field.as_str() {
                    "schema_version" => {
                        obj.insert("schema_version".to_string(), Value::Number(1.into()));
                        return Ok(());
                    }
                    "timestamp" => {
                        let now = chrono::Utc::now().timestamp_millis() as u64;
                        obj.insert("timestamp".to_string(), Value::Number(now.into()));
                        return Ok(());
                    }
                    "signature" => {
                        let sig = format!("TITANE-{}", uuid::Uuid::new_v4());
                        obj.insert("signature".to_string(), Value::String(sig));
                        return Ok(());
                    }
                    "physical" | "cognitive" | "symbolic" | "adaptive" | "meta" => {
                        obj.insert(field.clone(), Value::Object(serde_json::Map::new()));
                        return Ok(());
                    }
                    _ => {}
                }
            }
        }
        Err(())
    }

    /// Obtenir l'historique des validations
    pub fn history(&self) -> &[ValidationResult] {
        &self.history
    }

    /// Définir le mode de validation
    pub fn set_mode(&mut self, mode: ValidationMode) {
        self.mode = mode;
    }
}

impl Default for InvariantsEngine {
    fn default() -> Self {
        Self::new(ValidationMode::Lenient)
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

/// Obtenir le nom du type d'une valeur JSON
fn value_type_name(v: &Value) -> String {
    match v {
        Value::Null => "null".to_string(),
        Value::Bool(_) => "boolean".to_string(),
        Value::Number(_) => "number".to_string(),
        Value::String(_) => "string".to_string(),
        Value::Array(_) => "array".to_string(),
        Value::Object(_) => "object".to_string(),
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
    fn test_valid_state() {
        let state = json!({
            "schema_version": 1,
            "timestamp": chrono::Utc::now().timestamp_millis() as u64,
            "signature": "TITANE-test",
            "physical": {},
            "cognitive": {},
            "symbolic": {},
            "adaptive": {},
            "meta": {}
        });

        let result = assert_singularity_state_invariants(&state, ValidationMode::Strict);
        assert!(result.is_valid, "Erreurs: {:?}", result.errors);
    }

    #[test]
    fn test_missing_layers() {
        let state = json!({
            "schema_version": 1,
            "timestamp": chrono::Utc::now().timestamp_millis() as u64
        });

        let result = assert_singularity_state_invariants(&state, ValidationMode::Strict);
        assert!(!result.is_valid);
        assert!(result.errors.len() >= 5); // 5 layers manquants
    }

    #[test]
    fn test_future_timestamp() {
        let future = chrono::Utc::now().timestamp_millis() as u64 + (2 * 24 * 60 * 60 * 1000);
        let state = json!({
            "schema_version": 1,
            "timestamp": future,
            "physical": {},
            "cognitive": {},
            "symbolic": {},
            "adaptive": {},
            "meta": {}
        });

        let result = assert_singularity_state_invariants(&state, ValidationMode::Strict);
        assert!(!result.is_valid);
        assert!(result.errors.iter().any(|e| matches!(e, InvariantError::InconsistentDate { .. })));
    }

    #[test]
    fn test_event_invariants() {
        let valid_event = TitanEvent::new("xp", "add", json!({"amount": 100}));
        assert!(assert_event_invariants(&valid_event).is_ok());

        let invalid_event = TitanEvent {
            id: "".to_string(), // ID vide
            timestamp: chrono::Utc::now().timestamp_millis() as u64,
            schema_version: 1,
            origin: crate::persistence::types::EventOrigin::System,
            module: "test".to_string(),
            event_type: "test".to_string(),
            payload: json!({}),
            metadata: None,
        };
        assert!(assert_event_invariants(&invalid_event).is_err());
    }

    #[test]
    fn test_repair_missing_fields() {
        let mut engine = InvariantsEngine::new(ValidationMode::Recovery);
        let mut state = json!({
            "physical": {},
            "cognitive": {},
            "symbolic": {},
            "adaptive": {},
            "meta": {}
        });

        let _result = engine.validate_and_repair(&mut state);

        // Après réparation, devrait être valide
        assert!(state.get("schema_version").is_some());
        assert!(state.get("timestamp").is_some());
    }
}
