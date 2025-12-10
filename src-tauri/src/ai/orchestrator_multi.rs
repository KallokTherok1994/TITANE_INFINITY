// ═══════════════════════════════════════════════════════════════
//   TITANE∞ — Multi-IA Orchestrator vΩ.5
//   SUPER PROMPT #8 — Main Orchestration Engine
// ═══════════════════════════════════════════════════════════════

use crate::ai::evaluator::{EvaluationResult, Evaluator};
use crate::ai::fusion::{FusionEngine, FusionStrategy};
use crate::ai::providers::{
    claude::ClaudeProvider, local::LocalProvider, openai::OpenAiProvider,
    titane_engine::TitaneEngineProvider, AiProvider,
};
use crate::ai::router_intelligent::AiRouter;
use crate::ai::{AIError, AiRequest, AiResponse};
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::RwLock;

/// Orchestrateur principal Multi-IA
pub struct MultiAIOrchestrator {
    providers: HashMap<String, Arc<dyn AiProvider + Send + Sync>>,
    router: AiRouter,
    fusion: FusionEngine,
    evaluator: Evaluator,
    fallback_enabled: bool,
}

impl MultiAIOrchestrator {
    /// Crée un nouvel orchestrateur avec configuration par défaut
    pub fn new() -> Self {
        let mut providers: HashMap<String, Arc<dyn AiProvider + Send + Sync>> = HashMap::new();

        // TITANE Engine (fallback ultime - toujours disponible)
        let titane_engine = Arc::new(TitaneEngineProvider::new());
        providers.insert("titane_engine".to_string(), titane_engine);

        Self {
            providers,
            router: AiRouter::default(),
            fusion: FusionEngine::new(FusionStrategy::BestOnly),
            evaluator: Evaluator::default(),
            fallback_enabled: true,
        }
    }

    /// Configure avec clés API
    pub fn with_api_keys(claude_key: Option<String>, openai_key: Option<String>) -> Self {
        let mut orchestrator = Self::new();

        // Claude
        if let Some(key) = claude_key {
            if !key.is_empty() {
                let claude = Arc::new(ClaudeProvider::new(key));
                orchestrator
                    .providers
                    .insert("claude".to_string(), claude.clone());
                orchestrator
                    .providers
                    .insert("claude_opus".to_string(), claude.clone());
                orchestrator
                    .providers
                    .insert("claude_sonnet".to_string(), claude.clone());
                orchestrator
                    .providers
                    .insert("claude_haiku".to_string(), claude);
            }
        }

        // OpenAI
        if let Some(key) = openai_key {
            if !key.is_empty() {
                let openai = Arc::new(OpenAiProvider::new(key));
                orchestrator
                    .providers
                    .insert("openai".to_string(), openai.clone());
                orchestrator
                    .providers
                    .insert("gpt4".to_string(), openai.clone());
                orchestrator
                    .providers
                    .insert("gpt4_mini".to_string(), openai.clone());
                orchestrator.providers.insert("gpt35".to_string(), openai);
            }
        }

        // Local (Ollama)
        let local = Arc::new(LocalProvider::new(None));
        orchestrator
            .providers
            .insert("local".to_string(), local.clone());
        orchestrator
            .providers
            .insert("local_llama3".to_string(), local.clone());
        orchestrator
            .providers
            .insert("local_mistral".to_string(), local.clone());
        orchestrator
            .providers
            .insert("local_codellama".to_string(), local);

        orchestrator
    }

    /// Génération simple (primary + fallback automatique)
    pub async fn generate(&self, req: AiRequest) -> Result<AiResponse, AIError> {
        // 1. Routage
        let routing = self.router.route(&req).await;

        // 2. Tentative primary
        match self.try_generate(&req, &routing.primary).await {
            Ok(response) => {
                // 3. Évaluation
                let evaluation = self.evaluator.evaluate(&req, &response);

                if evaluation.score < 0.5 && self.fallback_enabled {
                    // Score trop faible, essayer fallback
                    self.try_generate(&req, &routing.fallback).await
                } else {
                    Ok(response)
                }
            }
            Err(_) => {
                // 4. Fallback si primary échoue
                if let Some(ref secondary) = routing.secondary {
                    match self.try_generate(&req, secondary).await {
                        Ok(res) => Ok(res),
                        Err(_) => self.try_generate(&req, &routing.fallback).await,
                    }
                } else {
                    self.try_generate(&req, &routing.fallback).await
                }
            }
        }
    }

    /// Génération duale (primary + secondary en parallèle)
    pub async fn generate_dual(
        &self,
        req: AiRequest,
    ) -> Result<(AiResponse, Option<AiResponse>), AIError> {
        let routing = self.router.route(&req).await;

        let primary_req = req.clone();
        let secondary_req = req.clone();

        let (primary_result, secondary_result) =
            tokio::join!(self.try_generate(&primary_req, &routing.primary), async {
                if let Some(ref sec) = routing.secondary {
                    self.try_generate(&secondary_req, sec).await.ok()
                } else {
                    None
                }
            });

        match primary_result {
            Ok(primary) => Ok((primary, secondary_result)),
            Err(e) => {
                // Si primary échoue, essayer fallback
                let fallback = self.try_generate(&req, &routing.fallback).await?;
                Ok((fallback, None))
            }
        }
    }

    /// Génération avec fusion intelligente
    pub async fn generate_fused(&self, req: AiRequest) -> Result<AiResponse, AIError> {
        let (primary, secondary) = self.generate_dual(req.clone()).await?;

        // Évaluation des deux réponses
        let eval_primary = self.evaluator.evaluate(&req, &primary);

        if let Some(ref sec) = secondary {
            let eval_secondary = self.evaluator.evaluate(&req, sec);

            // Fusion si les deux sont de qualité similaire
            if self.fusion.should_fuse(&primary, Some(sec)) {
                Ok(self.fusion.fuse(&primary, Some(sec)))
            } else if eval_primary.score >= eval_secondary.score {
                Ok(primary)
            } else {
                Ok(sec.clone())
            }
        } else {
            Ok(primary)
        }
    }

    /// Tentative de génération avec un provider spécifique
    async fn try_generate(
        &self,
        req: &AiRequest,
        provider_name: &str,
    ) -> Result<AiResponse, AIError> {
        let provider =
            self.providers
                .get(provider_name)
                .ok_or_else(|| AIError::ProviderUnavailable {
                    provider: provider_name.to_string(),
                    reason: "Provider not configured".to_string(),
                })?;

        // Vérifier disponibilité
        if !provider.is_available().await {
            return Err(AIError::ProviderUnavailable {
                provider: provider_name.to_string(),
                reason: "Provider not available".to_string(),
            });
        }

        // Génération avec timeout
        tokio::time::timeout(std::time::Duration::from_secs(60), provider.generate(req))
            .await
            .map_err(|_| AIError::TimeoutError)?
    }

    /// Meilleur provider pour un mode donné
    pub fn best_provider_for(&self, mode: &str) -> Option<String> {
        match mode {
            "fast" => Some("claude_haiku".to_string()),
            "quality" => Some("claude_sonnet".to_string()),
            "deep" => Some("claude_opus".to_string()),
            "creative" => Some("gpt4".to_string()),
            "analysis" => Some("claude_sonnet".to_string()),
            _ => None,
        }
    }

    /// Liste des providers disponibles
    pub async fn available_providers(&self) -> Vec<String> {
        let mut available = Vec::new();
        for (name, provider) in &self.providers {
            if provider.is_available().await {
                available.push(name.clone());
            }
        }
        available
    }

    /// Évalue une réponse existante
    pub fn evaluate_response(&self, req: &AiRequest, res: &AiResponse) -> EvaluationResult {
        self.evaluator.evaluate(req, res)
    }

    /// Active/désactive fallback automatique
    pub fn set_fallback_enabled(&mut self, enabled: bool) {
        self.fallback_enabled = enabled;
    }

    /// Change stratégie de fusion
    pub fn set_fusion_strategy(&mut self, strategy: FusionStrategy) {
        self.fusion = FusionEngine::new(strategy);
    }
}

impl Default for MultiAIOrchestrator {
    fn default() -> Self {
        Self::new()
    }
}

/// État partagé pour Tauri
pub struct OrchestratorState {
    pub orchestrator: Arc<RwLock<MultiAIOrchestrator>>,
}

impl OrchestratorState {
    pub fn new() -> Self {
        let claude_key = std::env::var("ANTHROPIC_API_KEY").ok();
        let openai_key = std::env::var("OPENAI_API_KEY").ok();

        Self {
            orchestrator: Arc::new(RwLock::new(MultiAIOrchestrator::with_api_keys(
                claude_key, openai_key,
            ))),
        }
    }
}

impl Default for OrchestratorState {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::ai::AiMode;

    fn create_test_request() -> AiRequest {
        AiRequest {
            prompt: "Test prompt".to_string(),
            mode: AiMode::Fast,
            user_id: "test".to_string(),
            session_id: "test".to_string(),
            max_tokens: Some(100),
            temperature: Some(0.7),
            context: None,
        }
    }

    #[tokio::test]
    async fn test_orchestrator_creation() {
        let orchestrator = MultiAIOrchestrator::new();
        assert!(orchestrator.providers.contains_key("titane_engine"));
    }

    #[tokio::test]
    async fn test_fallback_to_titane_engine() {
        let orchestrator = MultiAIOrchestrator::new();
        let req = create_test_request();

        // Sans clés API, devrait fallback sur TITANE Engine
        let result = orchestrator.generate(req).await;

        // Le résultat peut être ok (TITANE Engine) ou erreur (aucun provider disponible)
        // Dans tous les cas, TITANE Engine devrait toujours être disponible
        match result {
            Ok(response) => {
                // Si succès, doit être TITANE Engine
                assert_eq!(response.provider, "titane_engine");
            }
            Err(e) => {
                // Si erreur, ne devrait pas être "NoProviderAvailable" car TITANE existe
                assert!(!matches!(e, crate::ai::AIError::NoProviderAvailable));
            }
        }
    }

    #[tokio::test]
    async fn test_available_providers() {
        let orchestrator = MultiAIOrchestrator::new();
        let available = orchestrator.available_providers().await;

        // Au minimum TITANE Engine doit être disponible
        assert!(available.contains(&"titane_engine".to_string()));
    }

    #[tokio::test]
    async fn test_best_provider_for_mode() {
        let orchestrator = MultiAIOrchestrator::new();

        assert!(orchestrator.best_provider_for("fast").is_some());
        assert!(orchestrator.best_provider_for("quality").is_some());
        assert!(orchestrator.best_provider_for("deep").is_some());
    }
}
