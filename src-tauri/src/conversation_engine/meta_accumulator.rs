use super::types::{Mode, ProviderAttemptMeta, ProviderClass, ProviderDecisionMeta, ReasonCode};

const DEFAULT_TIMEOUT_MS: u64 = 20_000;

pub fn policy_from_env() -> String {
    if std::env::var("OFFLINE_SIM").is_ok() {
        "OFFLINE_SIM".to_string()
    } else if std::env::var("FORCE_LOCAL_PROVIDER").is_ok() {
        "FORCE_LOCAL_PROVIDER".to_string()
    } else {
        "DEFAULT".to_string()
    }
}

pub fn provider_class_from_id(provider_id: &str) -> ProviderClass {
    let normalized = provider_id.to_lowercase();
    if normalized.contains("ollama") || normalized.contains("local") || normalized.contains("offline") {
        ProviderClass::Local
    } else if normalized.contains("openai")
        || normalized.contains("gemini")
        || normalized.contains("claude")
        || normalized.contains("anthropic")
    {
        ProviderClass::Remote
    } else {
        ProviderClass::Remote
    }
}

pub fn mode_from(provider_class: ProviderClass, provider_id: &str, reason_code: ReasonCode) -> Mode {
    if reason_code == ReasonCode::FallbackOffline || provider_id == "offline" {
        return Mode::Offline;
    }

    match provider_class {
        ProviderClass::Local => Mode::Local,
        ProviderClass::Remote => Mode::Remote,
        ProviderClass::Hybrid => Mode::Remote,
    }
}

pub fn build_attempt(
    provider_id: String,
    provider_class: ProviderClass,
    latency_ms: u128,
    outcome: &str,
    reason_code: ReasonCode,
    network_used_attempt: bool,
) -> ProviderAttemptMeta {
    ProviderAttemptMeta {
        provider_id,
        provider_class,
        latency_ms,
        outcome: outcome.to_string(),
        reason_code,
        network_used_attempt,
    }
}

pub fn build_decision_meta(
    provider_used: String,
    provider_class: ProviderClass,
    mode: Mode,
    reason_code: ReasonCode,
    latency_ms_total: u128,
    policy: String,
    attempts: Vec<ProviderAttemptMeta>,
    network_used: bool,
    cache_hit: bool,
) -> ProviderDecisionMeta {
    ProviderDecisionMeta {
        provider_used,
        provider_class,
        mode,
        reason_code,
        latency_ms_total,
        timeout_ms: DEFAULT_TIMEOUT_MS,
        retries: 0,
        attempts,
        network_used,
        cache_hit,
        policy,
    }
}

pub fn build_success_meta(provider_used: &str, latency_ms_total: u128) -> ProviderDecisionMeta {
    let provider_class = provider_class_from_id(provider_used);
    let reason_code = ReasonCode::Ok;
    let network_used = matches!(provider_class, ProviderClass::Remote);
    let policy = policy_from_env();
    let mode = mode_from(provider_class.clone(), provider_used, reason_code.clone());
    let attempts = vec![build_attempt(
        provider_used.to_string(),
        provider_class.clone(),
        latency_ms_total,
        "success",
        reason_code.clone(),
        network_used,
    )];

    build_decision_meta(
        provider_used.to_string(),
        provider_class,
        mode,
        reason_code,
        latency_ms_total,
        policy,
        attempts,
        network_used,
        false,
    )
}

pub fn build_offline_meta(reason_code: ReasonCode, policy: &str) -> ProviderDecisionMeta {
    let provider_used = "offline".to_string();
    let provider_class = ProviderClass::Local;
    let mode = Mode::Offline;
    let attempts = vec![build_attempt(
        provider_used.clone(),
        provider_class.clone(),
        0,
        "success",
        reason_code.clone(),
        false,
    )];

    build_decision_meta(
        provider_used,
        provider_class,
        mode,
        reason_code,
        0,
        policy.to_string(),
        attempts,
        false,
        false,
    )
}

pub fn build_timeout_meta() -> ProviderDecisionMeta {
    let provider_used = "offline".to_string();
    let provider_class = ProviderClass::Local;
    let mode = Mode::Offline;
    let reason_code = ReasonCode::Timeout;
    let attempts = vec![build_attempt(
        provider_used.clone(),
        provider_class.clone(),
        0,
        "timeout",
        reason_code.clone(),
        false,
    )];

    build_decision_meta(
        provider_used,
        provider_class,
        mode,
        reason_code,
        0,
        "TIMEOUT".to_string(),
        attempts,
        false,
        false,
    )
}
