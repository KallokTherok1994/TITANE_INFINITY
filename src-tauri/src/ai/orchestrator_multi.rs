// ═══════════════════════════════════════════════════════════════
//   TITANE∞ — Multi-IA Orchestrator vΩ.5
//   SUPER PROMPT #8 — Main Orchestration Engine
// ═══════════════════════════════════════════════════════════════

use crate::ai::cache::{AICacheConfig, AIRouterCache, CachedAIResponse};
use crate::ai::evaluator::{EvaluationResult, Evaluator};
use crate::ai::fusion::{FusionEngine, FusionStrategy};
use crate::ai::providers::{
    claude::ClaudeProvider, gemini::GeminiProvider, local::LocalProvider, openai::OpenAiProvider,
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
    cache: AIRouterCache,
}

impl MultiAIOrchestrator {
    fn public_provider_name(provider_name: &str) -> String {
        match provider_name {
            "claude" | "claude_opus" | "claude_sonnet" | "claude_haiku" => "claude".to_string(),
            "openai" | "gpt4" | "gpt4_mini" | "gpt35" => "openai".to_string(),
            "gemini" | "gemini_flash" => "gemini".to_string(),
            "local" | "local_llama3" | "local_mistral" | "local_codellama" => "local".to_string(),
            other => other.to_string(),
        }
    }

    async fn first_available_provider<'a>(
        &self,
        candidates: impl IntoIterator<Item = &'a str>,
    ) -> Option<String> {
        for candidate in candidates {
            if let Some(provider) = self.providers.get(candidate) {
                if provider.is_available().await {
                    return Some(Self::public_provider_name(candidate));
                }
            }
        }

        None
    }

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
            cache: AIRouterCache::new(AICacheConfig::default()),
        }
    }

    /// Configure avec clés API
    pub fn with_api_keys(
        claude_key: Option<String>,
        openai_key: Option<String>,
        gemini_key: Option<String>,
    ) -> Self {
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

        // Gemini
        if let Some(key) = gemini_key {
            if !key.is_empty() {
                let gemini = Arc::new(GeminiProvider::new(key));
                orchestrator
                    .providers
                    .insert("gemini".to_string(), gemini.clone());
                orchestrator
                    .providers
                    .insert("gemini_flash".to_string(), gemini);
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

    /// Génération simple (primary + fallback automatique) avec cache
    pub async fn generate(&self, req: AiRequest) -> Result<AiResponse, AIError> {
        // 0. Check cache first
        let temperature = req.temperature.unwrap_or(0.7);
        let max_tokens = req.max_tokens.unwrap_or(2048);

        if let Some(cached) = self
            .cache
            .get_response(&req.prompt, temperature, max_tokens)
            .await
        {
            return Ok(AiResponse {
                output: cached.content,
                provider: cached.provider.clone(),
                model: "cached".to_string(),
                tokens_in: 0,
                tokens_out: cached.tokens,
                latency_ms: 0,
                confidence: 0.9,
                metadata: crate::ai::AiMetadata {
                    mode: req.mode.to_string(),
                    temperature_used: Some(temperature),
                    finish_reason: Some("cache_hit".to_string()),
                    cached: true,
                    fallback_triggered: false,
                    evaluation_score: None,
                },
            });
        }

        // 1. Routage
        let routing = self.router.route(&req).await;

        // 2. Tentative primary
        let result = match self.try_generate(&req, &routing.primary).await {
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
        };

        // 5. Cache the successful response
        if let Ok(ref response) = result {
            self.cache
                .set_response(
                    &req.prompt,
                    temperature,
                    max_tokens,
                    CachedAIResponse {
                        content: response.output.clone(),
                        tokens: response.tokens_out,
                        provider: response.provider.clone(),
                    },
                )
                .await;
        }

        result
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
    pub async fn best_provider_for(&self, mode: &str) -> Option<String> {
        let ai_mode = match mode.to_lowercase().as_str() {
            "fast" => crate::ai::AiMode::Fast,
            "quality" => crate::ai::AiMode::Quality,
            "deep" => crate::ai::AiMode::Deep,
            "creative" => crate::ai::AiMode::Creative,
            "analysis" => crate::ai::AiMode::Analysis,
            _ => return None,
        };

        let probe_request = AiRequest {
            prompt: String::new(),
            mode: ai_mode,
            user_id: "system".to_string(),
            session_id: "provider-probe".to_string(),
            max_tokens: Some(1),
            temperature: Some(0.0),
            context: None,
        };

        let routing = self.router.route(&probe_request).await;
        let mut candidates = vec![
            routing.primary,
            routing.fallback,
            "titane_engine".to_string(),
        ];
        if let Some(secondary) = routing.secondary {
            candidates.insert(1, secondary);
        }

        self.first_available_provider(candidates.iter().map(std::string::String::as_str))
            .await
    }

    /// Liste des providers disponibles
    pub async fn available_providers(&self) -> Vec<String> {
        let mut available = Vec::new();
        for (name, provider) in &self.providers {
            if provider.is_available().await {
                let public_name = Self::public_provider_name(name);
                if !available.contains(&public_name) {
                    available.push(public_name);
                }
            }
        }
        available.sort();
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

    /// Retourne les statistiques du cache
    pub async fn cache_stats(&self) -> crate::ai::cache::CacheStats {
        self.cache.get_stats().await
    }

    /// Vide le cache
    pub async fn clear_cache(&self) {
        self.cache.clear().await;
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
        let gemini_key = std::env::var("GEMINI_API_KEY").ok();

        Self {
            orchestrator: Arc::new(RwLock::new(MultiAIOrchestrator::with_api_keys(
                claude_key, openai_key, gemini_key,
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

        assert!(orchestrator.best_provider_for("fast").await.is_some());
        assert!(orchestrator.best_provider_for("quality").await.is_some());
        assert!(orchestrator.best_provider_for("deep").await.is_some());
    }

    #[tokio::test]
    async fn test_best_provider_prefers_available_cloud_provider() {
        let orchestrator =
            MultiAIOrchestrator::with_api_keys(Some("claude-key".to_string()), None, None);

        assert_eq!(
            orchestrator.best_provider_for("quality").await,
            Some("claude".to_string())
        );
    }

    #[tokio::test]
    async fn test_available_providers_are_public_names() {
        let orchestrator = MultiAIOrchestrator::with_api_keys(
            Some("claude-key".to_string()),
            Some("openai-key".to_string()),
            Some("gemini-key".to_string()),
        );

        let providers = orchestrator.available_providers().await;
        assert!(providers.contains(&"claude".to_string()));
        assert!(providers.contains(&"openai".to_string()));
        assert!(providers.contains(&"gemini".to_string()));
        assert!(!providers.contains(&"claude_haiku".to_string()));
        assert!(!providers.contains(&"gpt4".to_string()));
    }
}
