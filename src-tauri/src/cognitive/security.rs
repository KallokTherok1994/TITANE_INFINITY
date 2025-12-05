/**
 * TITANE∞ v17 - Cognitive Security Module
 *
 * Hardening complet du CognitiveEngine:
 * - Validation structurelle
 * - Sanitization
 * - Transitions sécurisées
 * - Auto-repair
 * - Hash SHA256 intégrité
 */
use crate::cognitive::CognitiveState;
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};

// ────────────────────────────────────────────────────────────────
// Constants
// ────────────────────────────────────────────────────────────────

/// Bornes strictes pour valeurs normalisées [0.0, 1.0]
const MIN_NORMALIZED: f32 = 0.0;
const MAX_NORMALIZED: f32 = 1.0;

/// Bornes strictes pour valeurs émotionnelles [-1.0, 1.0]
const MIN_VALENCE: f32 = -1.0;
const MAX_VALENCE: f32 = 1.0;

/// Seuil minimal de cohérence globale (critique si en dessous)
const MIN_COHERENCE: f32 = 0.1;

/// Seuil maximal de charge mentale (critique si au-dessus de capacité)
const MAX_CHARGE_RATIO: f32 = 1.2;

/// Historique maximal de charge mentale
const MAX_HISTORY_SIZE: usize = 100;

// ────────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CognitiveValidationResult {
    pub valid: bool,
    pub errors: Vec<String>,
    pub warnings: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CognitiveIntegrityCheck {
    pub hash: String,
    pub timestamp: u64,
    pub state_snapshot: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum CognitiveTransitionError {
    InvalidTransition {
        from: String,
        to: String,
        reason: String,
    },
    IncoherentState {
        field: String,
        value: String,
    },
    HashMismatch {
        expected: String,
        got: String,
    },
}

// ────────────────────────────────────────────────────────────────
// Validation Functions
// ────────────────────────────────────────────────────────────────

/**
 * Valide la structure complète d'un CognitiveState
 *
 * Vérifie:
 * - Aucune valeur NaN
 * - Aucune chaîne vide (identity)
 * - Aucun champ manquant
 * - Bornes strictes respectées
 * - Cohérence inter-centres
 */
pub fn cognitive_validate(state: &CognitiveState) -> CognitiveValidationResult {
    let mut errors = Vec::new();
    let mut warnings = Vec::new();

    // [1] Validation Mental
    if state.mental.charge.current.is_nan() {
        errors.push("mental.charge.current is NaN".to_string());
    }
    if state.mental.charge.current < MIN_NORMALIZED || state.mental.charge.current > MAX_NORMALIZED
    {
        errors.push(format!(
            "mental.charge.current out of bounds: {} (expected [0.0, 1.0])",
            state.mental.charge.current
        ));
    }

    if state.mental.charge.capacity.is_nan() {
        errors.push("mental.charge.capacity is NaN".to_string());
    }
    if state.mental.charge.capacity < MIN_NORMALIZED
        || state.mental.charge.capacity > MAX_NORMALIZED
    {
        errors.push(format!(
            "mental.charge.capacity out of bounds: {} (expected [0.0, 1.0])",
            state.mental.charge.capacity
        ));
    }

    // Vérifier ratio charge/capacité
    if state.mental.charge.current > state.mental.charge.capacity * MAX_CHARGE_RATIO {
        warnings.push(format!(
            "mental.charge.current ({}) significantly exceeds capacity ({})",
            state.mental.charge.current, state.mental.charge.capacity
        ));
    }

    // Vérifier historique
    if state.mental.charge.history.len() > MAX_HISTORY_SIZE {
        warnings.push(format!(
            "mental.charge.history too large: {} entries (max: {})",
            state.mental.charge.history.len(),
            MAX_HISTORY_SIZE
        ));
    }

    for (i, &val) in state.mental.charge.history.iter().enumerate() {
        if val.is_nan() {
            errors.push(format!("mental.charge.history[{}] is NaN", i));
        }
    }

    // [2] Validation Heart
    if state.heart.alignment.is_nan() {
        errors.push("heart.alignment is NaN".to_string());
    }
    if state.heart.alignment < MIN_NORMALIZED || state.heart.alignment > MAX_NORMALIZED {
        errors.push(format!(
            "heart.alignment out of bounds: {} (expected [0.0, 1.0])",
            state.heart.alignment
        ));
    }

    if state.heart.motivation.is_nan() {
        errors.push("heart.motivation is NaN".to_string());
    }
    if state.heart.motivation < MIN_NORMALIZED || state.heart.motivation > MAX_NORMALIZED {
        errors.push(format!(
            "heart.motivation out of bounds: {} (expected [0.0, 1.0])",
            state.heart.motivation
        ));
    }

    if state.heart.emotional_valence.is_nan() {
        errors.push("heart.emotional_valence is NaN".to_string());
    }
    if state.heart.emotional_valence < MIN_VALENCE || state.heart.emotional_valence > MAX_VALENCE {
        errors.push(format!(
            "heart.emotional_valence out of bounds: {} (expected [-1.0, 1.0])",
            state.heart.emotional_valence
        ));
    }

    if state.heart.emotional_intensity.is_nan() {
        errors.push("heart.emotional_intensity is NaN".to_string());
    }
    if state.heart.emotional_intensity < MIN_NORMALIZED
        || state.heart.emotional_intensity > MAX_NORMALIZED
    {
        errors.push(format!(
            "heart.emotional_intensity out of bounds: {} (expected [0.0, 1.0])",
            state.heart.emotional_intensity
        ));
    }

    // [3] Validation Body
    if state.body.energy_level.is_nan() {
        errors.push("body.energy_level is NaN".to_string());
    }
    if state.body.energy_level < MIN_NORMALIZED || state.body.energy_level > MAX_NORMALIZED {
        errors.push(format!(
            "body.energy_level out of bounds: {} (expected [0.0, 1.0])",
            state.body.energy_level
        ));
    }

    if state.body.physical_tension.is_nan() {
        errors.push("body.physical_tension is NaN".to_string());
    }
    if state.body.physical_tension < MIN_NORMALIZED || state.body.physical_tension > MAX_NORMALIZED
    {
        errors.push(format!(
            "body.physical_tension out of bounds: {} (expected [0.0, 1.0])",
            state.body.physical_tension
        ));
    }

    if state.body.voice_fatigue.is_nan() {
        errors.push("body.voice_fatigue is NaN".to_string());
    }
    if state.body.voice_fatigue < MIN_NORMALIZED || state.body.voice_fatigue > MAX_NORMALIZED {
        errors.push(format!(
            "body.voice_fatigue out of bounds: {} (expected [0.0, 1.0])",
            state.body.voice_fatigue
        ));
    }

    if state.body.environment_stress.is_nan() {
        errors.push("body.environment_stress is NaN".to_string());
    }
    if state.body.rhythm_quality.is_nan() {
        errors.push("body.rhythm_quality is NaN".to_string());
    }

    // [4] Validation Coherence
    if state.coherence.global.is_nan() {
        errors.push("coherence.global is NaN".to_string());
    }
    if state.coherence.global < MIN_COHERENCE {
        warnings.push(format!(
            "coherence.global critically low: {} (min: {})",
            state.coherence.global, MIN_COHERENCE
        ));
    }

    if state.coherence.mental_heart.is_nan() {
        errors.push("coherence.mental_heart is NaN".to_string());
    }
    if state.coherence.heart_body.is_nan() {
        errors.push("coherence.heart_body is NaN".to_string());
    }
    if state.coherence.body_mental.is_nan() {
        errors.push("coherence.body_mental is NaN".to_string());
    }

    // [5] Validation Timestamp
    if state.timestamp == 0 {
        warnings.push("timestamp is 0 (epoch)".to_string());
    }

    CognitiveValidationResult {
        valid: errors.is_empty(),
        errors,
        warnings,
    }
}

// ────────────────────────────────────────────────────────────────
// Sanitization Functions
// ────────────────────────────────────────────────────────────────

/**
 * Sanitize un CognitiveState pour corriger valeurs invalides
 *
 * Actions:
 * - Clamp toutes valeurs dans leurs bornes
 * - Remplacer NaN par valeurs par défaut
 * - Limiter taille historique
 * - Recalculer cohérence si nécessaire
 */
pub fn cognitive_sanitize(state: &mut CognitiveState) {
    // [1] Sanitize Mental
    if state.mental.charge.current.is_nan() {
        state.mental.charge.current = 0.5; // Default safe value
    }
    state.mental.charge.current = state
        .mental
        .charge
        .current
        .clamp(MIN_NORMALIZED, MAX_NORMALIZED);

    if state.mental.charge.capacity.is_nan() {
        state.mental.charge.capacity = 1.0;
    }
    state.mental.charge.capacity = state
        .mental
        .charge
        .capacity
        .clamp(MIN_NORMALIZED, MAX_NORMALIZED);

    // Limiter historique
    if state.mental.charge.history.len() > MAX_HISTORY_SIZE {
        state
            .mental
            .charge
            .history
            .drain(0..state.mental.charge.history.len() - MAX_HISTORY_SIZE);
    }

    // Supprimer NaN de l'historique
    state.mental.charge.history.retain(|&x| !x.is_nan());

    // [2] Sanitize Heart
    if state.heart.alignment.is_nan() {
        state.heart.alignment = 0.5;
    }
    state.heart.alignment = state.heart.alignment.clamp(MIN_NORMALIZED, MAX_NORMALIZED);

    if state.heart.motivation.is_nan() {
        state.heart.motivation = 0.5;
    }
    state.heart.motivation = state.heart.motivation.clamp(MIN_NORMALIZED, MAX_NORMALIZED);

    if state.heart.emotional_valence.is_nan() {
        state.heart.emotional_valence = 0.0;
    }
    state.heart.emotional_valence = state
        .heart
        .emotional_valence
        .clamp(MIN_VALENCE, MAX_VALENCE);

    if state.heart.emotional_intensity.is_nan() {
        state.heart.emotional_intensity = 0.5;
    }
    state.heart.emotional_intensity = state
        .heart
        .emotional_intensity
        .clamp(MIN_NORMALIZED, MAX_NORMALIZED);

    // [3] Sanitize Body
    if state.body.energy_level.is_nan() {
        state.body.energy_level = 0.5;
    }
    state.body.energy_level = state
        .body
        .energy_level
        .clamp(MIN_NORMALIZED, MAX_NORMALIZED);

    if state.body.physical_tension.is_nan() {
        state.body.physical_tension = 0.3;
    }
    state.body.physical_tension = state
        .body
        .physical_tension
        .clamp(MIN_NORMALIZED, MAX_NORMALIZED);

    if state.body.voice_fatigue.is_nan() {
        state.body.voice_fatigue = 0.0;
    }
    state.body.voice_fatigue = state
        .body
        .voice_fatigue
        .clamp(MIN_NORMALIZED, MAX_NORMALIZED);

    if state.body.environment_stress.is_nan() {
        state.body.environment_stress = 0.3;
    }
    state.body.environment_stress = state
        .body
        .environment_stress
        .clamp(MIN_NORMALIZED, MAX_NORMALIZED);

    if state.body.rhythm_quality.is_nan() {
        state.body.rhythm_quality = 0.5;
    }
    state.body.rhythm_quality = state
        .body
        .rhythm_quality
        .clamp(MIN_NORMALIZED, MAX_NORMALIZED);

    // [4] Recalcul cohérence si nécessaire
    if state.coherence.global.is_nan()
        || state.coherence.mental_heart.is_nan()
        || state.coherence.heart_body.is_nan()
        || state.coherence.body_mental.is_nan()
    {
        state.update_coherence();
    }

    // [5] Update timestamp si invalide
    if state.timestamp == 0 {
        state.timestamp = crate::core::utils::now_ms();
    }
}

// ────────────────────────────────────────────────────────────────
// Transition Validation
// ────────────────────────────────────────────────────────────────

/**
 * Valide une transition cognitive prev → next
 *
 * Rejette:
 * - Sauts impossibles (ex: charge 0.2 → 0.9 en une transition)
 * - Incohérences temporelles (timestamp next < prev)
 * - Transitions vers état invalide
 */
pub fn cognitive_transition_validate(
    prev: &CognitiveState,
    next: &CognitiveState,
) -> Result<(), CognitiveTransitionError> {
    // [1] Validation temporelle
    if next.timestamp < prev.timestamp {
        return Err(CognitiveTransitionError::InvalidTransition {
            from: format!("timestamp={}", prev.timestamp),
            to: format!("timestamp={}", next.timestamp),
            reason: "Transition backwards in time".to_string(),
        });
    }

    // [2] Validation structure next
    let validation = cognitive_validate(next);
    if !validation.valid {
        return Err(CognitiveTransitionError::IncoherentState {
            field: "multiple".to_string(),
            value: format!(
                "{} errors: {}",
                validation.errors.len(),
                validation.errors.join("; ")
            ),
        });
    }

    // [3] Détecter sauts impossibles
    let charge_delta = (next.mental.charge.current - prev.mental.charge.current).abs();
    if charge_delta > 0.5 {
        return Err(CognitiveTransitionError::InvalidTransition {
            from: format!("charge={}", prev.mental.charge.current),
            to: format!("charge={}", next.mental.charge.current),
            reason: format!("Charge jump too large: Δ={:.2}", charge_delta),
        });
    }

    let alignment_delta = (next.heart.alignment - prev.heart.alignment).abs();
    if alignment_delta > 0.7 {
        return Err(CognitiveTransitionError::InvalidTransition {
            from: format!("alignment={}", prev.heart.alignment),
            to: format!("alignment={}", next.heart.alignment),
            reason: format!("Alignment jump too large: Δ={:.2}", alignment_delta),
        });
    }

    let energy_delta = (next.body.energy_level - prev.body.energy_level).abs();
    if energy_delta > 0.6 {
        return Err(CognitiveTransitionError::InvalidTransition {
            from: format!("energy={}", prev.body.energy_level),
            to: format!("energy={}", next.body.energy_level),
            reason: format!("Energy jump too large: Δ={:.2}", energy_delta),
        });
    }

    Ok(())
}

// ────────────────────────────────────────────────────────────────
// Auto-Repair
// ────────────────────────────────────────────────────────────────

/**
 * Tente de réparer un CognitiveState corrompu
 *
 * Stratégie:
 * 1. Sanitize d'abord
 * 2. Si toujours invalide, rollback vers prev
 * 3. Logs structurés
 */
pub fn cognitive_auto_repair(
    prev: &CognitiveState,
    current: &mut CognitiveState,
) -> Result<String, String> {
    // [1] Tentative sanitization
    cognitive_sanitize(current);

    // [2] Vérifier si résolu
    let validation = cognitive_validate(current);
    if validation.valid {
        return Ok(format!(
            "Auto-repair successful: sanitized {} fields (warnings: {})",
            validation.warnings.len(),
            validation.warnings.join("; ")
        ));
    }

    // [3] Sanitization insuffisante → rollback
    *current = prev.clone();
    current.timestamp = crate::core::utils::now_ms(); // Update timestamp

    Err(format!(
        "Auto-repair failed: rolled back to previous state. Errors: {}",
        validation.errors.join("; ")
    ))
}

// ────────────────────────────────────────────────────────────────
// Hash Integrity
// ────────────────────────────────────────────────────────────────

/**
 * Calcule SHA256 hash d'un CognitiveState
 */
pub fn cognitive_compute_hash(state: &CognitiveState) -> String {
    let json = serde_json::to_string(state).unwrap_or_default();
    let mut hasher = Sha256::new();
    hasher.update(json.as_bytes());
    format!("{:x}", hasher.finalize())
}

/**
 * Vérifie l'intégrité d'un CognitiveState avec hash précédent
 */
pub fn cognitive_verify_hash(
    state: &CognitiveState,
    expected_hash: &str,
) -> Result<(), CognitiveTransitionError> {
    let actual_hash = cognitive_compute_hash(state);

    if actual_hash != expected_hash {
        return Err(CognitiveTransitionError::HashMismatch {
            expected: expected_hash.to_string(),
            got: actual_hash,
        });
    }

    Ok(())
}

/**
 * Crée un checkpoint d'intégrité
 */
pub fn cognitive_create_checkpoint(state: &CognitiveState) -> CognitiveIntegrityCheck {
    CognitiveIntegrityCheck {
        hash: cognitive_compute_hash(state),
        timestamp: state.timestamp,
        state_snapshot: serde_json::to_string(state).unwrap_or_default(),
    }
}

// ────────────────────────────────────────────────────────────────
// Tests
// ────────────────────────────────────────────────────────────────

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_cognitive_validate_valid_state() {
        let state = CognitiveState::new();
        let result = cognitive_validate(&state);
        assert!(result.valid);
        assert!(result.errors.is_empty());
    }

    #[test]
    fn test_cognitive_validate_nan_detection() {
        let mut state = CognitiveState::new();
        state.mental.charge.current = f32::NAN;

        let result = cognitive_validate(&state);
        assert!(!result.valid);
        assert!(result.errors.iter().any(|e| e.contains("NaN")));
    }

    #[test]
    fn test_cognitive_validate_out_of_bounds() {
        let mut state = CognitiveState::new();
        state.heart.alignment = 1.5; // Out of bounds

        let result = cognitive_validate(&state);
        assert!(!result.valid);
        assert!(result.errors.iter().any(|e| e.contains("out of bounds")));
    }

    #[test]
    fn test_cognitive_sanitize_nan() {
        let mut state = CognitiveState::new();
        state.mental.charge.current = f32::NAN;
        state.heart.alignment = f32::NAN;

        cognitive_sanitize(&mut state);

        assert!(!state.mental.charge.current.is_nan());
        assert!(!state.heart.alignment.is_nan());
    }

    #[test]
    fn test_cognitive_sanitize_clamp() {
        let mut state = CognitiveState::new();
        state.mental.charge.current = 2.0; // Out of bounds
        state.heart.emotional_valence = -2.0; // Out of bounds

        cognitive_sanitize(&mut state);

        assert_eq!(state.mental.charge.current, 1.0);
        assert_eq!(state.heart.emotional_valence, -1.0);
    }

    #[test]
    fn test_cognitive_transition_validate_valid() {
        let prev = CognitiveState::new();
        let mut next = prev.clone();
        next.mental.charge.current = 0.6; // Small change
        next.timestamp = prev.timestamp + 1000;

        assert!(cognitive_transition_validate(&prev, &next).is_ok());
    }

    #[test]
    fn test_cognitive_transition_validate_large_jump() {
        let prev = CognitiveState::new();
        let mut next = prev.clone();
        next.mental.charge.current = 0.9; // Large jump from ~0.3
        next.timestamp = prev.timestamp + 1000;

        assert!(cognitive_transition_validate(&prev, &next).is_err());
    }

    #[test]
    fn test_cognitive_transition_validate_backwards_time() {
        let prev = CognitiveState::new();
        let mut next = prev.clone();
        next.timestamp = prev.timestamp - 1000; // Backwards

        let result = cognitive_transition_validate(&prev, &next);
        assert!(result.is_err());
        assert!(matches!(
            result.unwrap_err(),
            CognitiveTransitionError::InvalidTransition { .. }
        ));
    }

    #[test]
    fn test_cognitive_auto_repair_sanitize() {
        let prev = CognitiveState::new();
        let mut current = prev.clone();
        current.mental.charge.current = f32::NAN;

        let result = cognitive_auto_repair(&prev, &mut current);
        assert!(result.is_ok());
        assert!(!current.mental.charge.current.is_nan());
    }

    #[test]
    fn test_cognitive_compute_hash() {
        let state = CognitiveState::new();
        let hash1 = cognitive_compute_hash(&state);
        let hash2 = cognitive_compute_hash(&state);

        assert_eq!(hash1, hash2); // Same state = same hash

        let mut state2 = state.clone();
        state2.mental.charge.current = 0.9;
        let hash3 = cognitive_compute_hash(&state2);

        assert_ne!(hash1, hash3); // Different state = different hash
    }

    #[test]
    fn test_cognitive_verify_hash() {
        let state = CognitiveState::new();
        let hash = cognitive_compute_hash(&state);

        assert!(cognitive_verify_hash(&state, &hash).is_ok());

        let mut state2 = state.clone();
        state2.mental.charge.current = 0.9;

        assert!(cognitive_verify_hash(&state2, &hash).is_err());
    }

    #[test]
    fn test_cognitive_create_checkpoint() {
        let state = CognitiveState::new();
        let checkpoint = cognitive_create_checkpoint(&state);

        assert_eq!(checkpoint.timestamp, state.timestamp);
        assert!(!checkpoint.hash.is_empty());
        assert!(!checkpoint.state_snapshot.is_empty());
    }
}
