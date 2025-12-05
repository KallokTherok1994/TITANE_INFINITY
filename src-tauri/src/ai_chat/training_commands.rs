/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * TITANE∞ — AI TRAINING COMMANDS
 * Commandes Tauri pour le mode d'entraînement IA
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * ⚠️ KEVIN-ONLY: Ces commandes nécessitent une vérification Kevin
 */

use super::training_engine::{
    FeedbackType, LearnedPattern, PatternCategory, TrainingMode, TrainingSession, TrainingState,
    TrainingStats, AI_TRAINING_ENGINE,
};

/// Vérifier le code Kevin
#[tauri::command]
pub fn training_verify_kevin(code: String) -> Result<bool, String> {
    let mut engine = AI_TRAINING_ENGINE
        .write()
        .map_err(|e| format!("Lock poisoned: {}", e))?;
    Ok(engine.verify_kevin_code(&code))
}

/// Activer le mode d'entraînement
#[tauri::command]
pub fn training_enable(mode: String) -> Result<(), String> {
    let training_mode = match mode.to_lowercase().as_str() {
        "passive" => TrainingMode::Passive,
        "active" => TrainingMode::Active,
        "intensive" => TrainingMode::Intensive,
        _ => TrainingMode::Disabled,
    };

    let mut engine = AI_TRAINING_ENGINE
        .write()
        .map_err(|e| format!("Lock poisoned: {}", e))?;
    engine.enable(training_mode)
}

/// Désactiver le mode d'entraînement
#[tauri::command]
pub fn training_disable() -> Result<(), String> {
    let mut engine = AI_TRAINING_ENGINE
        .write()
        .map_err(|e| format!("Lock poisoned: {}", e))?;
    engine.disable();
    Ok(())
}

/// Obtenir l'état actuel
#[tauri::command]
pub fn training_get_state() -> Result<TrainingState, String> {
    let engine = AI_TRAINING_ENGINE
        .read()
        .map_err(|e| format!("Lock poisoned: {}", e))?;
    Ok(engine.get_state().clone())
}

/// Obtenir les statistiques
#[tauri::command]
pub fn training_get_stats() -> Result<TrainingStats, String> {
    let engine = AI_TRAINING_ENGINE
        .read()
        .map_err(|e| format!("Lock poisoned: {}", e))?;
    Ok(engine.get_stats().clone())
}

/// Enregistrer un feedback
#[tauri::command]
pub fn training_record_feedback(
    conversation_id: String,
    original_prompt: String,
    original_response: String,
    feedback_type: String,
    correction: Option<String>,
    note: Option<String>,
) -> Result<String, String> {
    let fb_type = match feedback_type.to_lowercase().as_str() {
        "approved" => FeedbackType::Approved,
        "corrected" => FeedbackType::Corrected,
        "rejected" => FeedbackType::Rejected,
        "clarification" => FeedbackType::Clarification,
        "style" | "style_preference" => FeedbackType::StylePreference,
        _ => return Err("Invalid feedback type".to_string()),
    };

    let mut engine = AI_TRAINING_ENGINE
        .write()
        .map_err(|e| format!("Lock poisoned: {}", e))?;
    engine.record_feedback(
        &conversation_id,
        &original_prompt,
        &original_response,
        fb_type,
        correction,
        note,
    )
}

/// Apprendre un pattern manuellement
#[tauri::command]
pub fn training_learn_pattern(
    category: String,
    input_pattern: String,
    output_pattern: String,
    tags: Vec<String>,
) -> Result<String, String> {
    let cat = match category.to_lowercase().as_str() {
        "style" => PatternCategory::Style,
        "tone" => PatternCategory::Tone,
        "detail" | "detail_level" => PatternCategory::DetailLevel,
        "technical" | "technical_domain" => PatternCategory::TechnicalDomain,
        "personalization" => PatternCategory::Personalization,
        "error" | "error_handling" => PatternCategory::ErrorHandling,
        "clarification" => PatternCategory::Clarification,
        "creativity" => PatternCategory::Creativity,
        _ => PatternCategory::Style,
    };

    let mut engine = AI_TRAINING_ENGINE
        .write()
        .map_err(|e| format!("Lock poisoned: {}", e))?;
    engine.learn_pattern(cat, &input_pattern, &output_pattern, tags)
}

/// Chercher des patterns correspondants
#[tauri::command]
pub fn training_find_patterns(input: String, limit: usize) -> Result<Vec<LearnedPattern>, String> {
    let engine = AI_TRAINING_ENGINE
        .read()
        .map_err(|e| format!("Lock poisoned: {}", e))?;
    Ok(engine.find_matching_patterns(&input, limit)
        .into_iter()
        .cloned()
        .collect())
}

/// Démarrer une session d'entraînement
#[tauri::command]
pub fn training_start_session() -> Result<String, String> {
    let mut engine = AI_TRAINING_ENGINE
        .write()
        .map_err(|e| format!("Lock poisoned: {}", e))?;
    engine.start_training_session()
}

/// Traiter les feedbacks en attente
#[tauri::command]
pub fn training_process_feedbacks(session_id: String) -> Result<u32, String> {
    let mut engine = AI_TRAINING_ENGINE
        .write()
        .map_err(|e| format!("Lock poisoned: {}", e))?;
    engine.process_pending_feedbacks(&session_id)
}

/// Terminer une session
#[tauri::command]
pub fn training_end_session(session_id: String) -> Result<TrainingSession, String> {
    let mut engine = AI_TRAINING_ENGINE
        .write()
        .map_err(|e| format!("Lock poisoned: {}", e))?;
    engine.end_training_session(&session_id)
}

/// Exporter les patterns
#[tauri::command]
pub fn training_export_patterns() -> Result<Vec<LearnedPattern>, String> {
    let engine = AI_TRAINING_ENGINE
        .read()
        .map_err(|e| format!("Lock poisoned: {}", e))?;
    Ok(engine.export_patterns())
}

/// Importer des patterns
#[tauri::command]
pub fn training_import_patterns(patterns: Vec<LearnedPattern>) -> Result<u32, String> {
    let mut engine = AI_TRAINING_ENGINE
        .write()
        .map_err(|e| format!("Lock poisoned: {}", e))?;
    engine.import_patterns(patterns)
}

/// Nettoyer les vieux patterns
#[tauri::command]
pub fn training_prune_patterns(max_age_days: u64) -> Result<u32, String> {
    let mut engine = AI_TRAINING_ENGINE
        .write()
        .map_err(|e| format!("Lock poisoned: {}", e))?;
    Ok(engine.prune_old_patterns(max_age_days))
}

/// Générer un rapport
#[tauri::command]
pub fn training_generate_report() -> Result<String, String> {
    let engine = AI_TRAINING_ENGINE
        .read()
        .map_err(|e| format!("Lock poisoned: {}", e))?;
    Ok(engine.generate_report())
}
