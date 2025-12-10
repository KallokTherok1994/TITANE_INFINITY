// ═══════════════════════════════════════════════════════════════
//   TITANE∞ — Multi-IA API Tauri
//   SUPER PROMPT #8 — Frontend Integration Commands
// ═══════════════════════════════════════════════════════════════

use crate::ai::evaluator::EvaluationResult;
use crate::ai::fusion::FusionStrategy;
use crate::ai::orchestrator_multi::OrchestratorState;
use crate::ai::{AiMode, AiRequest, AiResponse};
use serde::{Deserialize, Serialize};
use tauri::State;

// ═══════════════════════════════════════════════════════════════
// COMMANDES TAURI
// ═══════════════════════════════════════════════════════════════

/// Génération IA simple avec fallback automatique
#[tauri::command]
pub async fn multi_ai_generate(
    prompt: String,
    mode: String,
    user_id: String,
    session_id: String,
    max_tokens: Option<u32>,
    temperature: Option<f32>,
    state: State<'_, OrchestratorState>,
) -> Result<AiResponse, String> {
    let ai_mode = parse_mode(&mode)?;

    let request = AiRequest {
        prompt,
        mode: ai_mode,
        user_id,
        session_id,
        max_tokens,
        temperature,
        context: None,
    };

    let orchestrator = state.orchestrator.read().await;
    orchestrator
        .generate(request)
        .await
        .map_err(|e| e.to_string())
}

/// Génération duale (2 providers en parallèle)
#[tauri::command]
pub async fn multi_ai_generate_dual(
    prompt: String,
    mode: String,
    user_id: String,
    session_id: String,
    state: State<'_, OrchestratorState>,
) -> Result<DualResponse, String> {
    let ai_mode = parse_mode(&mode)?;

    let request = AiRequest {
        prompt,
        mode: ai_mode,
        user_id,
        session_id,
        max_tokens: None,
        temperature: None,
        context: None,
    };

    let orchestrator = state.orchestrator.read().await;
    let (primary, secondary) = orchestrator
        .generate_dual(request)
        .await
        .map_err(|e| e.to_string())?;

    Ok(DualResponse { primary, secondary })
}

/// Génération avec fusion intelligente
#[tauri::command]
pub async fn multi_ai_generate_fused(
    prompt: String,
    mode: String,
    user_id: String,
    session_id: String,
    fusion_strategy: Option<String>,
    state: State<'_, OrchestratorState>,
) -> Result<AiResponse, String> {
    let ai_mode = parse_mode(&mode)?;

    let request = AiRequest {
        prompt,
        mode: ai_mode,
        user_id,
        session_id,
        max_tokens: None,
        temperature: None,
        context: None,
    };

    // Configurer stratégie de fusion si fournie
    if let Some(strategy) = fusion_strategy {
        let mut orchestrator = state.orchestrator.write().await;
        orchestrator.set_fusion_strategy(parse_fusion_strategy(&strategy)?);
    }

    let orchestrator = state.orchestrator.read().await;
    orchestrator
        .generate_fused(request)
        .await
        .map_err(|e| e.to_string())
}

/// Liste des providers disponibles
#[tauri::command]
pub async fn multi_ai_providers(
    state: State<'_, OrchestratorState>,
) -> Result<Vec<String>, String> {
    let orchestrator = state.orchestrator.read().await;
    Ok(orchestrator.available_providers().await)
}

/// Meilleur provider pour un mode donné
#[tauri::command]
pub async fn multi_ai_best_provider(
    mode: String,
    state: State<'_, OrchestratorState>,
) -> Result<Option<String>, String> {
    let orchestrator = state.orchestrator.read().await;
    Ok(orchestrator.best_provider_for(&mode))
}

/// Évalue une réponse IA
#[tauri::command]
pub async fn multi_ai_evaluate(
    prompt: String,
    response: AiResponse,
    mode: String,
    state: State<'_, OrchestratorState>,
) -> Result<EvaluationResult, String> {
    let ai_mode = parse_mode(&mode)?;

    let request = AiRequest {
        prompt,
        mode: ai_mode,
        user_id: "eval".to_string(),
        session_id: "eval".to_string(),
        max_tokens: None,
        temperature: None,
        context: None,
    };

    let orchestrator = state.orchestrator.read().await;
    Ok(orchestrator.evaluate_response(&request, &response))
}

/// Configure fallback automatique
#[tauri::command]
pub async fn multi_ai_set_fallback(
    enabled: bool,
    state: State<'_, OrchestratorState>,
) -> Result<(), String> {
    let mut orchestrator = state.orchestrator.write().await;
    orchestrator.set_fallback_enabled(enabled);
    Ok(())
}

/// Configure les clés API (runtime)
#[tauri::command]
pub async fn multi_ai_configure_keys(
    claude_key: Option<String>,
    openai_key: Option<String>,
    state: State<'_, OrchestratorState>,
) -> Result<(), String> {
    use crate::ai::orchestrator_multi::MultiAIOrchestrator;

    let new_orchestrator = MultiAIOrchestrator::with_api_keys(claude_key, openai_key);

    let mut current = state.orchestrator.write().await;
    *current = new_orchestrator;

    Ok(())
}

// ═══════════════════════════════════════════════════════════════
// TYPES HELPER
// ═══════════════════════════════════════════════════════════════

#[derive(Debug, Serialize, Deserialize)]
pub struct DualResponse {
    pub primary: AiResponse,
    pub secondary: Option<AiResponse>,
}

// ═══════════════════════════════════════════════════════════════
// UTILS
// ═══════════════════════════════════════════════════════════════

fn parse_mode(mode: &str) -> Result<AiMode, String> {
    match mode.to_lowercase().as_str() {
        "fast" => Ok(AiMode::Fast),
        "quality" => Ok(AiMode::Quality),
        "deep" => Ok(AiMode::Deep),
        "creative" => Ok(AiMode::Creative),
        "analysis" => Ok(AiMode::Analysis),
        _ => Err(format!("Mode invalide: {}", mode)),
    }
}

fn parse_fusion_strategy(strategy: &str) -> Result<FusionStrategy, String> {
    match strategy.to_lowercase().as_str() {
        "best_only" | "best" => Ok(FusionStrategy::BestOnly),
        "combine" => Ok(FusionStrategy::Combine),
        "enrich" | "enrich_primary" => Ok(FusionStrategy::EnrichPrimary),
        "weighted" | "weighted_average" => Ok(FusionStrategy::WeightedAverage),
        _ => Err(format!("Stratégie invalide: {}", strategy)),
    }
}

// ═══════════════════════════════════════════════════════════════
// TESTS
// ═══════════════════════════════════════════════════════════════

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_mode() {
        assert!(matches!(parse_mode("fast"), Ok(AiMode::Fast)));
        assert!(matches!(parse_mode("QUALITY"), Ok(AiMode::Quality)));
        assert!(matches!(parse_mode("Deep"), Ok(AiMode::Deep)));
        assert!(parse_mode("invalid").is_err());
    }

    #[test]
    fn test_parse_fusion_strategy() {
        assert!(matches!(
            parse_fusion_strategy("best"),
            Ok(FusionStrategy::BestOnly)
        ));
        assert!(matches!(
            parse_fusion_strategy("combine"),
            Ok(FusionStrategy::Combine)
        ));
        assert!(parse_fusion_strategy("invalid").is_err());
    }
}
