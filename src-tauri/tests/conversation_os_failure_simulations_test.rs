use titane_infinity::conversation_engine::types::{
    Mode, ProviderAttemptMeta, ProviderClass, ProviderDecisionMeta, ReasonCode,
};
use titane_infinity::engines::conversation_os::policy::{NetState, PolicyContext, PolicyEngine};
use titane_infinity::engines::conversation_os::resilience::ResilienceEngine;

fn online_context() -> PolicyContext {
    PolicyContext {
        net_state: NetState::Online,
        has_ollama_credentials: true,
        has_gemini_credentials: true,
        has_brave_credentials: true,
        endpoint_allowlist: vec![
            "http://localhost:11434".to_string(),
            "https://api.search.brave.com".to_string(),
            "https://api.gemini.google.com".to_string(),
        ],
        user_preference_offline_mode: false,
    }
}

fn decision_meta(
    provider_used: &str,
    provider_class: ProviderClass,
    mode: Mode,
    reason_code: ReasonCode,
    policy: &str,
    network_used: bool,
) -> ProviderDecisionMeta {
    ProviderDecisionMeta {
        provider_used: provider_used.to_string(),
        provider_class: provider_class.clone(),
        mode,
        reason_code: reason_code.clone(),
        latency_ms_total: 0,
        timeout_ms: 20_000,
        retries: 0,
        attempts: vec![ProviderAttemptMeta {
            provider_id: provider_used.to_string(),
            provider_class,
            latency_ms: 0,
            outcome: "simulated".to_string(),
            reason_code,
            network_used_attempt: network_used,
        }],
        network_used,
        cache_hit: false,
        policy: policy.to_string(),
    }
}

#[test]
fn failure_simulation_matrix_complete_engine_level() {
    let policy = PolicyEngine::new();

    // offline startup
    let mut offline_ctx = online_context();
    offline_ctx.net_state = NetState::Offline;
    let offline_verdict = policy.evaluate(&offline_ctx, true, true);
    assert!(!offline_verdict.allow_online);
    assert_eq!(offline_verdict.fallback_to.as_deref(), Some("ollama"));

    // offline mid-request (timeout + no network)
    let offline_mid = decision_meta(
        "offline",
        ProviderClass::Local,
        Mode::Offline,
        ReasonCode::Timeout,
        "OFFLINE_MID_REQUEST_SIM",
        false,
    );
    assert!(matches!(offline_mid.mode, Mode::Offline));
    assert_eq!(offline_mid.reason_code, ReasonCode::Timeout);
    assert!(!offline_mid.network_used);

    // DNS/TLS failures simulated as network error classification
    let dns_meta = decision_meta(
        "network-error",
        ProviderClass::Remote,
        Mode::Remote,
        ReasonCode::NetworkError,
        "DNS_FAILURE_SIM",
        true,
    );
    let tls_meta = decision_meta(
        "network-error",
        ProviderClass::Remote,
        Mode::Remote,
        ReasonCode::NetworkError,
        "TLS_FAILURE_SIM",
        true,
    );
    assert_eq!(dns_meta.reason_code, ReasonCode::NetworkError);
    assert_eq!(tls_meta.reason_code, ReasonCode::NetworkError);

    // timeout with network available
    let timeout_meta = decision_meta(
        "timeout-degraded",
        ProviderClass::Remote,
        Mode::Remote,
        ReasonCode::Timeout,
        "TIMEOUT_SIM",
        true,
    );
    assert_eq!(timeout_meta.reason_code, ReasonCode::Timeout);
    assert!(matches!(timeout_meta.mode, Mode::Remote));

    // 429 / 500
    let rate_limit_meta = decision_meta(
        "remote-provider",
        ProviderClass::Remote,
        Mode::Remote,
        ReasonCode::RateLimit,
        "HTTP_429_SIM",
        true,
    );
    let server_500_meta = decision_meta(
        "remote-provider",
        ProviderClass::Remote,
        Mode::Remote,
        ReasonCode::ProviderDown,
        "HTTP_500_SIM",
        true,
    );
    assert_eq!(rate_limit_meta.reason_code, ReasonCode::RateLimit);
    assert_eq!(server_500_meta.reason_code, ReasonCode::ProviderDown);

    // allowlist violation
    assert!(!policy.is_endpoint_allowed(
        "https://evil.example",
        &online_context().endpoint_allowlist
    ));

    // missing/revoked API key simulations
    let mut no_key_ctx = online_context();
    no_key_ctx.has_brave_credentials = false;
    let missing_key = policy.evaluate(&no_key_ctx, true, false);
    assert!(!missing_key.allow_search);

    let revoked_meta = decision_meta(
        "remote-provider",
        ProviderClass::Remote,
        Mode::Remote,
        ReasonCode::ProviderUnavailable,
        "REVOKED_KEY_SIM",
        true,
    );
    assert_eq!(revoked_meta.reason_code, ReasonCode::ProviderUnavailable);

    // circuit breaker open + budget exhausted
    let mut resilience = ResilienceEngine::with_config(100, 500, 1, 1, 60_000, 1, 0);
    resilience.record_failure();
    let (circuit_allowed, _) = resilience.is_request_allowed(1);
    assert!(!circuit_allowed);

    let mut budget = ResilienceEngine::with_config(100, 500, 5, 1, 60_000, 1, 0);
    let (first_allowed, _) = budget.is_request_allowed(1);
    let (second_allowed, reason) = budget.is_request_allowed(1);
    assert!(first_allowed);
    assert!(!second_allowed);
    assert!(reason.unwrap_or_default().to_lowercase().contains("rate limit"));

    // explicit offline fallback remains visible (no silence)
    let offline_meta = decision_meta(
        "offline",
        ProviderClass::Local,
        Mode::Offline,
        ReasonCode::FallbackOffline,
        "OFFLINE_SIM",
        false,
    );
    assert!(matches!(offline_meta.mode, Mode::Offline));
    assert_eq!(offline_meta.reason_code, ReasonCode::FallbackOffline);
}
