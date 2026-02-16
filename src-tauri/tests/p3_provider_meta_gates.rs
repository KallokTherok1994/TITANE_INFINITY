use std::fs;
use std::path::PathBuf;
use std::sync::{Arc, Mutex, OnceLock};
use std::time::{Duration, SystemTime, UNIX_EPOCH};

use tokio::sync::RwLock;

use titane_infinity::ai::router::AIRouter;
use titane_infinity::conversation_engine::{ConversationEngineState, ConversationRequest};
use titane_infinity::conversation_engine::types::{
    AIConfig, Mode, ProviderDecisionMeta, ProviderPreference, ReasonCode,
};
use titane_infinity::singularity::singularity_state::SingularityState;

static TEST_LOCK: OnceLock<Mutex<()>> = OnceLock::new();

fn test_lock() -> std::sync::MutexGuard<'static, ()> {
    TEST_LOCK
        .get_or_init(|| Mutex::new(()))
        .lock()
        .expect("test lock poisoned")
}

struct EnvGuard {
    key: &'static str,
    prev: Option<String>,
}

impl EnvGuard {
    fn set(key: &'static str, value: &str) -> Self {
        let prev = std::env::var(key).ok();
        std::env::set_var(key, value);
        Self { key, prev }
    }
}

impl Drop for EnvGuard {
    fn drop(&mut self) {
        if let Some(prev) = &self.prev {
            std::env::set_var(self.key, prev);
        } else {
            std::env::remove_var(self.key);
        }
    }
}

fn unique_storage_dir() -> PathBuf {
    let nanos = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_else(|_| Duration::from_secs(0))
        .as_nanos();
    let dir = std::env::temp_dir().join(format!("titane_p3_6_{nanos}"));
    let _ = fs::create_dir_all(&dir);
    dir
}

fn build_engine() -> ConversationEngineState {
    let storage_dir = unique_storage_dir();
    let password = "p3-test-passphrase".to_string();
    let ai_router = Arc::new(RwLock::new(AIRouter::new(None, Some("gemma2:2b".to_string()))));
    let singularity_state = Arc::new(RwLock::new(SingularityState::default()));

    ConversationEngineState::new(storage_dir, password, ai_router, singularity_state)
        .expect("ConversationEngineState init failed")
}

async fn run_request(engine: &ConversationEngineState, message: &str, preference: ProviderPreference) {
    let request = ConversationRequest {
        user_message: message.to_string(),
        conversation_id: None,
        mode: titane_infinity::conversation_engine::types::ConversationMode::Default,
        ai_config: Some(AIConfig {
            temperature: 0.2,
            max_tokens: Some(64),
            provider_preference: preference,
        }),
        emotion_context: None,
        custom_system_prompt: None,
    };

    let response = engine
        .process_message(request)
        .await
        .expect("process_message failed");

    let meta = response
        .metadata
        .provider_meta
        .expect("provider_meta missing");
    assert_meta(&meta);
}

fn assert_meta(meta: &ProviderDecisionMeta) {
    assert!(!meta.provider_used.is_empty(), "provider_used empty");
    assert!(matches!(meta.provider_class, titane_infinity::conversation_engine::types::ProviderClass::Local
        | titane_infinity::conversation_engine::types::ProviderClass::Remote
        | titane_infinity::conversation_engine::types::ProviderClass::Hybrid));
    assert!(matches!(meta.mode, Mode::Local | Mode::Remote | Mode::Offline | Mode::Cached | Mode::Error));
    assert!(matches!(meta.reason_code,
        ReasonCode::Ok
        | ReasonCode::PolicyLocalOnly
        | ReasonCode::PolicyRemoteAllowed
        | ReasonCode::AllowlistDenied
        | ReasonCode::ProviderDown
        | ReasonCode::Timeout
        | ReasonCode::RateLimit
        | ReasonCode::InvalidConfig
        | ReasonCode::NetworkError
        | ReasonCode::FallbackOffline
        | ReasonCode::CacheHit
        | ReasonCode::CacheMiss
        | ReasonCode::SerializationDropped
        | ReasonCode::ProviderUnavailable
        | ReasonCode::ToolRequired
        | ReasonCode::ToolDenied
        | ReasonCode::Unknown
    ));
    assert!(meta.attempts.len() >= 1, "attempts empty");
}

#[tokio::test]
async fn test_p3_ar20_meta_x3() {
    let _lock = test_lock();
    let _offline = EnvGuard::set("OFFLINE_SIM", "1");

    for run in 1..=3 {
        let engine = build_engine();
        for idx in 1..=20 {
            let msg = format!("P3-6 AR20 {run}/3 msg {idx}/20");
            run_request(&engine, &msg, ProviderPreference::Local).await;
        }
    }
}

#[tokio::test]
async fn test_p3_offline5_offlinesim_x3() {
    let _lock = test_lock();
    let _offline = EnvGuard::set("OFFLINE_SIM", "1");

    for run in 1..=3 {
        let engine = build_engine();
        for idx in 1..=5 {
            let msg = format!("P3-6 OFFLINE5 {run}/3 msg {idx}/5");
            let request = ConversationRequest {
                user_message: msg,
                conversation_id: None,
                mode: titane_infinity::conversation_engine::types::ConversationMode::Default,
                ai_config: Some(AIConfig {
                    temperature: 0.2,
                    max_tokens: Some(32),
                    provider_preference: ProviderPreference::Local,
                }),
                emotion_context: None,
                custom_system_prompt: None,
            };

            let response = engine
                .process_message(request)
                .await
                .expect("process_message failed");
            let meta = response
                .metadata
                .provider_meta
                .expect("provider_meta missing");

            assert_meta(&meta);
            assert!(matches!(meta.mode, Mode::Offline), "mode not OFFLINE");
            assert!(matches!(meta.reason_code, ReasonCode::FallbackOffline));
            assert!(!meta.network_used, "network_used should be false in OFFLINE_SIM");
        }
    }
}

#[tokio::test]
async fn test_p3_stability_burst_x3() {
    let _lock = test_lock();
    let _offline = EnvGuard::set("OFFLINE_SIM", "1");

    for run in 1..=3 {
        let engine = build_engine();
        for idx in 1..=30 {
            let msg = format!("P3-6 STABILITY {run}/3 msg {idx}/30");
            let request = ConversationRequest {
                user_message: msg,
                conversation_id: None,
                mode: titane_infinity::conversation_engine::types::ConversationMode::Default,
                ai_config: Some(AIConfig {
                    temperature: 0.2,
                    max_tokens: Some(64),
                    provider_preference: ProviderPreference::Local,
                }),
                emotion_context: None,
                custom_system_prompt: None,
            };

            let response = tokio::time::timeout(
                Duration::from_secs(10),
                engine.process_message(request),
            )
            .await
            .expect("process_message timeout")
            .expect("process_message failed");

            let meta = response
                .metadata
                .provider_meta
                .expect("provider_meta missing");
            assert_meta(&meta);
        }
    }
}

#[tokio::test]
async fn test_p3_determinism_signature_x3() {
    let _lock = test_lock();
    let _offline = EnvGuard::set("OFFLINE_SIM", "1");

    let engine = build_engine();
    let mut signature = None;

    for _ in 0..3 {
        let request = ConversationRequest {
            user_message: "P3-6 DETERMINISM".to_string(),
            conversation_id: None,
            mode: titane_infinity::conversation_engine::types::ConversationMode::Default,
            ai_config: Some(AIConfig {
                temperature: 0.2,
                max_tokens: Some(32),
                provider_preference: ProviderPreference::Local,
            }),
            emotion_context: None,
            custom_system_prompt: None,
        };

        let response = engine
            .process_message(request)
            .await
            .expect("process_message failed");
        let meta = response
            .metadata
            .provider_meta
            .expect("provider_meta missing");

        assert_meta(&meta);
        let current = (
            meta.provider_used.clone(),
            format!("{:?}", meta.provider_class),
            format!("{:?}", meta.mode),
            format!("{:?}", meta.reason_code),
        );

        if let Some(expected) = &signature {
            assert_eq!(expected, &current, "meta signature mismatch");
        } else {
            signature = Some(current);
        }
    }
}
