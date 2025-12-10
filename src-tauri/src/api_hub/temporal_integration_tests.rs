//! ═══════════════════════════════════════════════════════════════════════════════
//! TESTS D'INTÉGRATION — API Hub Temporal Intelligence
//! ═══════════════════════════════════════════════════════════════════════════════

#[cfg(test)]
mod integration_tests {
    use crate::api_hub::{
        provider_registry::ProviderRegistry,
        router::APIRouter,
        temporal_adapter::TemporalApiAdapter,
        temporal_cache::TemporalCache,
        temporal_circuit_breaker::{CircuitState, TemporalCircuitBreaker},
        temporal_rate_limiter::TemporalRateLimiter,
        APIRequest, Modality, ModelChoiceStrategy, Provider, RequestContent,
    };
    use std::sync::Arc;

    /// Test flux complet: rate limiter → cache → router
    #[tokio::test]
    async fn test_complete_temporal_flow() {
        // Setup
        let temporal_adapter = Arc::new(TemporalApiAdapter::new());
        let rate_limiter = TemporalRateLimiter::new("flow_provider".to_string(), 1000, 60, temporal_adapter.clone());
        let cache: TemporalCache<String> = TemporalCache::new(100, temporal_adapter.clone());

        // 1. Vérifier rate limit
        let permit = rate_limiter.acquire_permit().await;
        assert!(permit.is_ok(), "Should acquire permit");

        // 2. Tester cache miss puis hit
        let key = "test_key";
        let cached_value = cache.get(key).await;
        assert!(cached_value.is_none(), "Cache should be empty");

        cache
            .set(
                key.to_string(),
                "cached_response".to_string(),
                "/test".to_string(),
            )
            .await;

        let cached_value = cache.get(key).await;
        assert_eq!(
            cached_value,
            Some("cached_response".to_string()),
            "Should retrieve cached value"
        );

        // 3. Vérifier stats
        let cache_stats = cache.get_stats().await;
        assert_eq!(cache_stats.total_entries, 1);
        assert_eq!(cache_stats.total_hits, 1);
    }

    /// Test circuit breaker avec échecs puis récupération
    #[tokio::test]
    async fn test_circuit_breaker_flow() {
        let temporal_adapter = Arc::new(TemporalApiAdapter::new());
        let breaker = TemporalCircuitBreaker::new("/api/chat".to_string(), temporal_adapter);

        // État initial: Closed
        assert_eq!(breaker.get_state().await, CircuitState::Closed);

        // Simuler succès
        breaker.record_success().await;
        assert_eq!(breaker.get_state().await, CircuitState::Closed);

        // Simuler échecs multiples
        for _ in 0..8 {
            breaker.record_failure().await;
        }

        // Circuit devrait être Open
        assert_eq!(breaker.get_state().await, CircuitState::Open);

        // Tentative de requête devrait échouer
        let result = breaker.allow_request().await;
        assert!(
            result.is_err(),
            "Should reject requests when circuit is open"
        );
    }

    /// Test router avec adaptation temporelle
    #[tokio::test]
    async fn test_router_temporal_adaptation() {
        let temporal_adapter = Arc::new(TemporalApiAdapter::new());
        let router = APIRouter::new().with_temporal_adapter(temporal_adapter.clone());

        let mut registry = ProviderRegistry::new();
        registry.register_provider(
            Provider::OpenAI,
            crate::api_hub::provider_registry::ProviderProfile::openai_default(),
        );
        registry.register_provider(
            Provider::Anthropic,
            crate::api_hub::provider_registry::ProviderProfile::anthropic_default(),
        );

        let request = APIRequest {
            id: "test_1".to_string(),
            modality: Modality::Text,
            content: RequestContent::Text("Hello world".to_string()),
            preferred_provider: None,
            strategy: ModelChoiceStrategy::Balanced,
            max_tokens: None,
            temperature: None,
            timeout_ms: None,
            metadata: std::collections::HashMap::new(),
        };

        let decision = router.route(&request, &registry).await;

        // Vérifier qu'une décision est prise
        assert!(!decision.reason.is_empty(), "Should have routing reason");
        assert!(decision.confidence > 0.0, "Should have confidence score");
    }

    /// Test rate limiter adaptatif: limite change selon temporalité
    #[tokio::test]
    async fn test_adaptive_rate_limiting() {
        let temporal_adapter = Arc::new(TemporalApiAdapter::new());
        let rate_limiter = TemporalRateLimiter::new("test_provider".to_string(), 100, 60, temporal_adapter.clone());

        // Acquérir plusieurs permits
        for i in 0..5 {
            let result = rate_limiter.acquire_permit().await;
            assert!(result.is_ok(), "Permit {} should succeed", i);
        }

        let stats = rate_limiter.get_stats().await;
        assert_eq!(stats.minute_count, 5);
    }

    /// Test cache avec TTL adaptatif
    #[tokio::test]
    async fn test_adaptive_cache_ttl() {
        let temporal_adapter = Arc::new(TemporalApiAdapter::new());
        let cache: TemporalCache<String> = TemporalCache::new(50, temporal_adapter.clone());

        // Stocker valeur pour endpoint chat (TTL court)
        cache
            .set(
                "chat_key".to_string(),
                "chat_response".to_string(),
                "/chat".to_string(),
            )
            .await;

        // Stocker valeur pour endpoint embedding (TTL long)
        cache
            .set(
                "embed_key".to_string(),
                "embed_response".to_string(),
                "/embedding".to_string(),
            )
            .await;

        // Vérifier que les deux sont présentes
        assert!(cache.get("chat_key").await.is_some());
        assert!(cache.get("embed_key").await.is_some());

        let stats = cache.get_stats().await;
        assert_eq!(stats.total_entries, 2);
    }

    /// Test provider suggestion selon temporalité
    #[tokio::test]
    async fn test_temporal_provider_suggestion() {
        let temporal_adapter = Arc::new(TemporalApiAdapter::new());

        let suggestion = temporal_adapter.suggest_provider(Modality::Text).await;

        assert!(
            !suggestion.reason.is_empty(),
            "Should have suggestion reason"
        );

        // Vérifier que primary provider est défini
        match suggestion.primary {
            Provider::OpenAI | Provider::Anthropic | Provider::Gemini => {
                // OK
            }
            _ => panic!("Invalid primary provider"),
        }
    }

    /// Test complet: requête → rate limit → cache check → circuit breaker → router
    #[tokio::test]
    async fn test_full_api_request_pipeline() {
        // Setup infrastructure temporelle
        let temporal_adapter = Arc::new(TemporalApiAdapter::new());
        let rate_limiter = TemporalRateLimiter::new("api_provider".to_string(), 1000, 60, temporal_adapter.clone());
        let cache: TemporalCache<String> = TemporalCache::new(100, temporal_adapter.clone());
        let breaker =
            TemporalCircuitBreaker::new("/api/chat".to_string(), temporal_adapter.clone());
        let router = APIRouter::new().with_temporal_adapter(temporal_adapter.clone());

        // 1. Vérifier rate limit
        assert!(
            rate_limiter.acquire_permit().await.is_ok(),
            "Rate limit should allow"
        );

        // 2. Vérifier circuit breaker
        assert!(
            breaker.allow_request().await.is_ok(),
            "Circuit should be closed"
        );

        // 3. Check cache (miss)
        let cache_result = cache.get("request_123").await;
        assert!(cache_result.is_none(), "Cache should miss");

        // 4. Route requête
        let mut registry = ProviderRegistry::new();
        registry.register_provider(
            Provider::OpenAI,
            crate::api_hub::provider_registry::ProviderProfile::openai_default(),
        );

        let request = APIRequest {
            id: "request_123".to_string(),
            modality: Modality::Text,
            content: RequestContent::Text("Test".to_string()),
            preferred_provider: None,
            strategy: ModelChoiceStrategy::Balanced,
            max_tokens: None,
            temperature: None,
            timeout_ms: None,
            metadata: std::collections::HashMap::new(),
        };

        let decision = router.route(&request, &registry).await;
        assert_eq!(decision.provider, Provider::OpenAI);

        // 5. Stocker résultat en cache
        cache
            .set(
                "request_123".to_string(),
                "response".to_string(),
                "/chat".to_string(),
            )
            .await;

        // 6. Vérifier cache hit
        let cached = cache.get("request_123").await;
        assert_eq!(cached, Some("response".to_string()));

        // 7. Enregistrer succès
        breaker.record_success().await;
        assert_eq!(breaker.get_state().await, CircuitState::Closed);
    }
}
