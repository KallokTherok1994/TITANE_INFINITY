use std::sync::Arc;
/**
 * ═══════════════════════════════════════════════════════════════════
 * TITANE∞ v∞ — CONVERSATION ENGINE COMMANDS
 * Commandes Tauri pour le Conversation Engine
 * ═══════════════════════════════════════════════════════════════════
 */
use tauri::State;
use uuid::Uuid;

use crate::engines::conversation_os::{
    MemoryEngine, PolicyEngine, ResilienceEngine, RouterEngine, SearchEngine,
};
use crate::engines::conversation_os::policy::{NetState, PolicyContext};
#[cfg(all(not(feature = "mock"), feature = "full"))]
use crate::services::search_gateway::SearchGatewayService;

use super::meta_accumulator::{
    build_attempt, build_decision_meta, mode_from, policy_from_env, provider_class_from_id,
};
use super::types::*;
use super::ConversationEngineState;

#[derive(Debug, Clone, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ConversationGenerateArgs {
    pub message: String,
    pub conversation_id: String,
    pub mode: Option<String>,
    pub provider: Option<String>,
    pub system_prompt: Option<String>,
    pub request_id: Option<String>,
    pub context_envelope: Option<serde_json::Value>,
}

type CommandResult<T> = Result<T, String>;

fn resolve_conversation_os_db_path_from_env(
    db_path_override: Option<std::path::PathBuf>,
    env_titane_convos_db_path: Option<String>,
    env_xdg_data_home: Option<String>,
    env_home: Option<String>,
) -> std::path::PathBuf {
    if let Some(path) = db_path_override {
        return path;
    }

    if let Some(path) = env_titane_convos_db_path
        .filter(|value| !value.trim().is_empty())
        .map(std::path::PathBuf::from)
    {
        return path;
    }

    if let Some(path) = env_xdg_data_home
        .filter(|value| !value.trim().is_empty())
        .map(std::path::PathBuf::from)
    {
        return path.join("TITANE_INFINITY/runtime/memory/conversation_os_v1.db");
    }

    if let Some(home) = env_home
        .filter(|value| !value.trim().is_empty())
        .map(std::path::PathBuf::from)
    {
        return home.join(".local/share/TITANE_INFINITY/runtime/memory/conversation_os_v1.db");
    }

    // Last-resort fallback: use persistent app data dir (correct on Android & desktop).
    dirs::data_local_dir()
        .unwrap_or_else(std::env::temp_dir)
        .join("TITANE_INFINITY/runtime/memory/conversation_os_v1.db")
}

fn resolve_conversation_os_db_path(db_path_override: Option<std::path::PathBuf>) -> std::path::PathBuf {
    resolve_conversation_os_db_path_from_env(
        db_path_override,
        std::env::var("TITANE_CONVOS_DB_PATH").ok(),
        std::env::var("XDG_DATA_HOME").ok(),
        std::env::var("HOME").ok(),
    )
}

fn read_bool_env(key: &str, default: bool) -> bool {
    std::env::var(key)
        .ok()
        .map(|value| value == "1" || value.eq_ignore_ascii_case("true"))
        .unwrap_or(default)
}

fn build_memory_used_ids(
    conversation_id: &str,
    request_id: &str,
    snapshots_enabled: bool,
    ltm_enabled: bool,
) -> Vec<String> {
    let mut ids = vec![format!("evt_user_{}_{}", conversation_id, request_id)];
    if snapshots_enabled {
        ids.push(format!("snap_{}_{}", conversation_id, request_id));
    }
    if ltm_enabled {
        ids.push(format!("ltm_session_{}", conversation_id));
    }
    ids
}

fn extract_context_binding(context_envelope: Option<&serde_json::Value>) -> serde_json::Value {
    let module_context = context_envelope.and_then(|value| value.get("moduleContext"));
    let route_context = context_envelope.and_then(|value| value.get("routeContext"));
    let continuity = context_envelope.and_then(|value| value.get("continuity"));
    let cognitive = context_envelope.and_then(|value| value.get("cognitiveContext"));
    let twins = context_envelope.and_then(|value| value.get("twinsContext"));

    serde_json::json!({
        "moduleId": module_context
            .and_then(|value| value.get("moduleId"))
            .and_then(serde_json::Value::as_str)
            .unwrap_or("unknown"),
        "moduleName": module_context
            .and_then(|value| value.get("moduleName"))
            .and_then(serde_json::Value::as_str)
            .unwrap_or("unknown"),
        "route": route_context
            .and_then(|value| value.get("route"))
            .and_then(serde_json::Value::as_str)
            .unwrap_or("unknown"),
        "changeType": continuity
            .and_then(|value| value.get("changeType"))
            .and_then(serde_json::Value::as_str)
            .unwrap_or("unknown"),
        "sequence": continuity
            .and_then(|value| value.get("sequence"))
            .and_then(serde_json::Value::as_u64)
            .unwrap_or(0),
        // TIME: cognitive flow state
        "cognitiveFlowActive": cognitive
            .and_then(|value| value.get("flowActive"))
            .and_then(serde_json::Value::as_bool)
            .unwrap_or(false),
        "cognitiveMode": cognitive
            .and_then(|value| value.get("mode"))
            .and_then(serde_json::Value::as_str)
            .unwrap_or("normal"),
        // TWINS: numeric fusion alignment
        "twinsFusionScore": twins
            .and_then(|value| value.get("globalScore"))
            .and_then(serde_json::Value::as_f64)
            .unwrap_or(0.0),
        "twinsTrend": twins
            .and_then(|value| value.get("trend"))
            .and_then(serde_json::Value::as_str)
            .unwrap_or("unknown"),
    })
}

#[cfg(all(not(feature = "mock"), feature = "full"))]
async fn run_governed_search(query: &str, max_results: usize) -> Result<Vec<crate::engines::conversation_os::search::RawSearchResult>, String> {
    let gateway = SearchGatewayService::default_governed();
    let results = gateway.search(query, max_results).await?;
    Ok(results
        .into_iter()
        .map(|result| crate::engines::conversation_os::search::RawSearchResult {
            title: Some(result.title),
            url: Some(result.url),
            description: Some(result.snippet),
            snippet: None,
            source: result.source,
        })
        .collect())
}

// TRUTH LABEL [PATCH-009]: Web search is DISABLED in default builds.
// Default features = ["custom-protocol","mock","audio-capture"] → mock=true, full=false
// → this stub is ALWAYS active in default/dev builds regardless of BRAVE_API_KEY.
// To enable real Brave search: build with --features full --no-default-features (or remove mock).
#[cfg(not(all(not(feature = "mock"), feature = "full")))]
async fn run_governed_search(_query: &str, _max_results: usize) -> Result<Vec<crate::engines::conversation_os::search::RawSearchResult>, String> {
    Err("CREDENTIALS_MISSING: SearchGatewayService unavailable without full backend features".to_string())
}

// ═══════════════════════════════════════════════════════════════════
// OMEGA PIPELINE COMMANDS (Frontend API)
// ═══════════════════════════════════════════════════════════════════

/// Créer une nouvelle conversation OMEGA
#[tauri::command]
pub async fn create_new_conversation(
    engine: State<'_, Arc<ConversationEngineState>>,
) -> CommandResult<String> {
    // Générer un nouvel ID de conversation
    let conversation_id = Uuid::new_v4().to_string();

    // Initialiser la conversation dans le memory engine
    // (pour l'instant, on retourne juste l'ID - le memory engine créera l'entrée au premier message)

    Ok(conversation_id)
}

/// Générer une réponse via le pipeline OMEGA complet
#[tauri::command]
pub async fn conversation_generate(
    engine: State<'_, Arc<ConversationEngineState>>,
    args: ConversationGenerateArgs,
) -> CommandResult<serde_json::Value> {
    let ConversationGenerateArgs {
        message,
        conversation_id,
        mode,
        provider,
        system_prompt,
        request_id,
        context_envelope,
    } = args;
    // Convertir le mode string en ConversationMode
    let conversation_mode = match mode.as_deref() {
        Some("coach") => ConversationMode::Default, // Coach = Default avec personnalité
        Some("strategist") => ConversationMode::Planning,
        Some("brainstorming") => ConversationMode::Brainstorming,
        Some("synthesis") => ConversationMode::Synthesis,
        Some("journal") => ConversationMode::Journal,
        Some("debug_cognitive") => ConversationMode::DebugCognitive,
        _ => ConversationMode::Default,
    };

    let req_id = request_id.unwrap_or_else(|| format!("req_{}", Uuid::new_v4()));
    let context_binding = extract_context_binding(context_envelope.as_ref());
    log::info!(
        "[Ω:CMD] 📨 Request | req_id={} | msg_len={} | conv_id={} | mode={:?}",
        req_id,
        message.len(),
        conversation_id,
        conversation_mode
    );

    // ─────────────────────────────────────────────────────────────
    // Conversation OS v1 pipeline (Ring 2 + Ring 3 coordination)
    // Router -> Policy -> Resilience -> Memory -> Search
    // ─────────────────────────────────────────────────────────────
    let router_engine = RouterEngine::new();
    let policy_engine = PolicyEngine::new();
    let mut resilience_engine = ResilienceEngine::new();
    let memory_engine = MemoryEngine::new();
    let search_engine = SearchEngine::new();

    let convos_search_enabled = read_bool_env("CONVOS_SEARCH", true);
    let convos_sources_store = read_bool_env("CONVOS_SOURCES_STORE", true);
    let convos_memory_snapshots_enabled = read_bool_env("CONVOS_MEMORY_SNAPSHOTS", true);
    let convos_debug_panel_enabled = read_bool_env("CONVOS_DEBUG_PANEL", true);
    let convos_memory_ltm_enabled = read_bool_env("CONVOS_MEMORY_LTM", false);

    let router_decision = router_engine.classify(&message);

    let allowlist = std::env::var("TITANE_CONVOS_ALLOWLIST")
        .ok()
        .map(|value| {
            value
                .split(',')
                .map(|entry| entry.trim().to_string())
                .filter(|entry| !entry.is_empty())
                .collect::<Vec<String>>()
        })
        .filter(|entries| !entries.is_empty())
        .unwrap_or_else(|| {
            vec![
                "localhost".to_string(),
                "127.0.0.1".to_string(),
                "api.search.brave.com".to_string(),
                "duckduckgo.com".to_string(),
            ]
        });

    let net_state = if read_bool_env("OFFLINE_SIM", false) {
        NetState::Offline
    } else {
        NetState::Online
    };

    let policy_context = PolicyContext {
        net_state,
        has_ollama_credentials: true,
        has_gemini_credentials: std::env::var("GEMINI_API_KEY")
            .map(|value| !value.trim().is_empty())
            .unwrap_or(false),
        has_brave_credentials: std::env::var("BRAVE_API_KEY")
            .map(|value| !value.trim().is_empty())
            .unwrap_or(false),
        endpoint_allowlist: allowlist,
        user_preference_offline_mode: std::env::var("TITANE_OFFLINE_MODE")
            .map(|value| value == "1" || value.eq_ignore_ascii_case("true"))
            .unwrap_or(false),
    };

    let wants_external_ai = provider
        .as_ref()
        .map(|entry| !matches!(entry.as_str(), "ollama" | "local"))
        .unwrap_or(false);

    let policy_verdict = policy_engine.evaluate(
        &policy_context,
        router_decision.wants_search,
        wants_external_ai,
    );

    let memory_plan = memory_engine.decide_memory_strategy(
        &message,
        router_decision.wants_memory,
        Some(conversation_id.clone()),
        convos_memory_ltm_enabled,
    );

    let (resilience_allowed, resilience_reason) = resilience_engine.is_request_allowed(1);

    let mut search_citations_json = Vec::<serde_json::Value>::new();
    let mut failures_json = Vec::<serde_json::Value>::new();
    let mut search_user_notice: Option<String> = None;

    if convos_search_enabled && router_decision.wants_search && policy_verdict.allow_search {
        match run_governed_search(&message, 5).await {
            Ok(results) => {
                let normalized = search_engine.normalize(
                    results,
                    crate::engines::conversation_os::search::NormalizationOptions {
                        min_snippet_length: 20,
                        ..Default::default()
                    },
                );

                search_citations_json = normalized
                    .into_iter()
                    .map(|citation| {
                        serde_json::json!({
                            "title": citation.title,
                            "url": citation.url,
                            "snippet": citation.snippet,
                            "source": citation.source,
                            "timestamp": citation.timestamp,
                            "relevance": citation.relevance,
                        })
                    })
                    .collect();
            }
            Err(err) => {
                let lower = err.to_lowercase();
                let failure_class = if lower.contains("credentials_missing") {
                    "CREDENTIALS_MISSING"
                } else if lower.contains("rate_limit") || lower.contains("429") {
                    "RATE_LIMIT"
                } else {
                    "SEARCH_ERROR"
                };

                failures_json.push(serde_json::json!({
                    "class": failure_class,
                    "detail": {
                        "component": "search_gateway",
                        "reason": err,
                        "query": message,
                        "net_state": format!("{:?}", policy_context.net_state),
                    }
                }));

                if failure_class == "CREDENTIALS_MISSING" {
                    search_user_notice = Some(
                        "Recherche web indisponible: clé API manquante côté backend. Activez BRAVE_API_KEY pour réactiver la recherche gouvernée.".to_string(),
                    );
                }
            }
        }
    }

    if !convos_sources_store {
        search_citations_json.clear();
    }

    let memory_used_ids = build_memory_used_ids(
        &conversation_id,
        &req_id,
        convos_memory_snapshots_enabled,
        convos_memory_ltm_enabled,
    );

    let snapshot_summary_fr = format!(
        "Résumé canonique FR ({}) — intention={:?}, recherche={}, mémoire={}.",
        conversation_id,
        router_decision.intent,
        router_decision.wants_search,
        router_decision.wants_memory
    );

    let mut history_load_status = "not_attempted".to_string();
    let mut history_message_count: usize = 0;
    let mut history_load_error: Option<String> = None;

    let mut trace = serde_json::json!({
        "phase": "conversation_generate",
        "trace_id": req_id,
        "session_id": conversation_id,
        "net_state": format!("{:?}", policy_context.net_state),
        "router": {
            "intent": format!("{:?}", router_decision.intent),
            "wants_search": router_decision.wants_search,
            "wants_memory": router_decision.wants_memory,
            "wants_write": router_decision.wants_write,
            "confidence": router_decision.confidence,
            "reasoning": router_decision.reasoning,
        },
        "policy": {
            "allow_online": policy_verdict.allow_online,
            "allow_external_ai": policy_verdict.allow_external_ai,
            "allow_search": policy_verdict.allow_search,
            "allow_tools": policy_verdict.allow_tools,
            "hard_block": policy_verdict.hard_block,
            "block_reason": policy_verdict.block_reason,
            "fallback_to": policy_verdict.fallback_to,
        },
        "resilience": {
            "allowed": resilience_allowed,
            "reason": resilience_reason,
            "state": resilience_engine.state_summary(),
        },
        "memory": {
            "fetch_stm": memory_plan.fetch_stm,
            "stm_limit": memory_plan.stm_limit,
            "fetch_snapshot": memory_plan.fetch_snapshot,
            "fetch_ltm": convos_memory_ltm_enabled && memory_plan.fetch_ltm,
            "reasoning": memory_plan.reasoning,
            "memory_used": memory_used_ids,
            "snapshot_summary_fr": snapshot_summary_fr,
            "history_load_status": history_load_status,
            "history_message_count": history_message_count,
            "history_load_error": history_load_error,
            "snapshot_state": {
                "conversation_id": conversation_id,
                "request_id": req_id,
                "router_intent": format!("{:?}", router_decision.intent),
                "wants_search": router_decision.wants_search,
                "wants_memory": router_decision.wants_memory,
            },
        },
        "citations": search_citations_json,
        "failures": failures_json,
        "feature_flags": {
            "CONVOS_SEARCH": convos_search_enabled,
            "CONVOS_SOURCES_STORE": convos_sources_store,
            "CONVOS_MEMORY_SNAPSHOTS": convos_memory_snapshots_enabled,
            "CONVOS_DEBUG_PANEL": convos_debug_panel_enabled,
            "CONVOS_MEMORY_LTM": convos_memory_ltm_enabled,
        },
        "context_binding": context_binding.clone(),
        "context_envelope_present": context_envelope.is_some(),
    });

    if policy_verdict.hard_block {
        let _ = persist_conversation_os_artifacts(
            &conversation_id,
            &req_id,
            &message,
            Some("Requête bloquée par la politique gouvernée."),
            &trace,
            None,
            &search_citations_json,
        );

        let blocked_response = serde_json::json!({
            "ok": true,
            "content": "Requête bloquée par la politique gouvernée.",
            "meta": {
                "mode": "LOCAL",
                "reason_code": "POLICY_BLOCKED",
                "network_used": false,
                "provider_used": "none",
                "latency_ms_total": 5,
                "blocked_by": "policy_engine"
            },
            "trace": trace,
            "metadata": {
                "requestId": req_id,
                "contextBinding": context_binding.clone(),
                "historyLoadStatus": history_load_status.clone(),
                "historyMessageCount": history_message_count,
                "historyLoadError": history_load_error.clone(),
            },
        });
        return Ok(blocked_response);
    }

    if !resilience_allowed {
        let _ = persist_conversation_os_artifacts(
            &conversation_id,
            &req_id,
            &message,
            Some("Requête temporairement bloquée par la résilience (backoff/rate-limit/circuit-breaker)."),
            &trace,
            None,
            &search_citations_json,
        );

        let blocked_response = serde_json::json!({
            "ok": true,
            "content": "Requête temporairement bloquée par la résilience (backoff/rate-limit/circuit-breaker).",
            "meta": {
                "mode": "LOCAL",
                "reason_code": "RESILIENCE_BLOCKED",
                "network_used": false,
                "provider_used": "none",
                "latency_ms_total": 5,
                "blocked_by": "resilience_engine"
            },
            "trace": trace,
            "metadata": {
                "requestId": req_id,
                "contextBinding": context_binding.clone(),
                "historyLoadStatus": history_load_status.clone(),
                "historyMessageCount": history_message_count,
                "historyLoadError": history_load_error.clone(),
            },
        });
        return Ok(blocked_response);
    }

    // ✨ v27.0.2: Force local provider in tests (bypass cloud timeouts in AR20)
    // PATCH-010: Apply policy_verdict.allow_external_ai — if external AI blocked by policy,
    // override provider to "local" to enforce One Door network governance.
    let effective_provider = if read_bool_env("FORCE_LOCAL_PROVIDER", false) {
        log::warn!(
            "[Ω:CMD] ⚠️ FORCE_LOCAL_PROVIDER env active | cloud providers DISABLED | reason=test_mode"
        );
        Some("local".to_string())
    } else if !policy_verdict.allow_external_ai {
        // Policy gate: external AI not allowed (offline/blocked/no-credentials)
        if provider.as_deref().map(|p| matches!(p, "gemini" | "openai" | "gpt" | "claude" | "anthropic")).unwrap_or(false) {
            log::warn!(
                "[Ω:CMD] ⚠️ Policy gate: external AI blocked (allow_external_ai=false) | reason={:?} | forcing local",
                policy_verdict.block_reason
            );
        }
        Some("local".to_string())
    } else {
        provider
    };

    // PATCH-012 + IMPROVE-003: Load conversation history from SQLite for LTM context injection.
    // Budget: last 20 messages, content capped at 300 chars each to avoid token overflow.
    // Always load (not gated by LTM flag) so the AI has basic multi-turn awareness.
    let conversation_context = match load_conversation_history(conversation_id.clone()).await {
        Ok(rows) => {
            const MAX_MESSAGES: usize = 20;
            const MAX_CONTENT_CHARS: usize = 300;
            let formatted: Vec<String> = rows.iter()
                .take(MAX_MESSAGES)
                .filter_map(|row| {
                    let role = row.get("role")?.as_str()?;
                    let content = row.get("content")?.as_str()?;
                    let prefix = if role == "user" { "[User]" } else { "[Assistant]" };
                    // Token budget: truncate long messages
                    let truncated = if content.len() > MAX_CONTENT_CHARS {
                        format!("{}…", &content[..MAX_CONTENT_CHARS])
                    } else {
                        content.to_string()
                    };
                    Some(format!("{}: {}", prefix, truncated))
                })
                .collect();
            history_message_count = formatted.len();
            if !formatted.is_empty() {
                history_load_status = "loaded".to_string();
                log::info!(
                    "[Ω:CMD] ✅ LTM context: {} msgs loaded for conv_id={}",
                    formatted.len(), &conversation_id[..conversation_id.len().min(16)]
                );
            } else {
                history_load_status = "empty".to_string();
            }
            if formatted.is_empty() { None } else { Some(formatted) }
        }
        Err(e) => {
            history_load_status = "error".to_string();
            history_load_error = Some(e.clone());
            log::warn!("[Ω:CMD] LTM history load failed (non-fatal): {}", e);
            None
        }
    };

    trace["memory"]["history_load_status"] = serde_json::json!(history_load_status.clone());
    trace["memory"]["history_message_count"] = serde_json::json!(history_message_count);
    trace["memory"]["history_load_error"] = serde_json::json!(history_load_error.clone());

    if let Some(err) = history_load_error.as_ref() {
        if let Some(failures) = trace["failures"].as_array_mut() {
            failures.push(serde_json::json!({
                "class": "MEMORY_HISTORY_LOAD_FAILED",
                "detail": {
                    "component": "conversation_generate",
                    "reason": err,
                    "conversation_id": conversation_id,
                }
            }));
        }
    }

    // Créer la requête OMEGA
    // Inject STM (immediate context) from MultiLayerMemoryManager
    let stm_context_block: String = {
        let mlm = engine.multilayer_memory.read().await;
        let recent = mlm.get_immediate_context();
        if recent.is_empty() {
            String::new()
        } else {
            let lines: Vec<String> = recent.iter().rev().map(|(u, a)| {
                let u_trunc = if u.len() > 120 { format!("{}…", &u[..120]) } else { u.clone() };
                let a_trunc = if a.len() > 120 { format!("{}…", &a[..120]) } else { a.clone() };
                format!("[User]: {u_trunc}\n[TITANE]: {a_trunc}")
            }).collect();
            format!("\n\n## STM_RECENT_TURNS\n{}", lines.join("\n"))
        }
    };

    // Inject TIME + TWINS context into system_prompt when available
    let cognitive_flow = context_binding.get("cognitiveFlowActive").and_then(|v| v.as_bool()).unwrap_or(false);
    let cognitive_mode = context_binding.get("cognitiveMode").and_then(|v| v.as_str()).unwrap_or("normal");
    let twins_score = context_binding.get("twinsFusionScore").and_then(|v| v.as_f64()).unwrap_or(0.0);
    let twins_trend = context_binding.get("twinsTrend").and_then(|v| v.as_str()).unwrap_or("unknown");

    let has_time_context = cognitive_flow || cognitive_mode != "normal";
    let has_twins_context = twins_score > 0.0 && twins_trend != "unknown";

    let system_prompt = {
        let base = system_prompt.unwrap_or_default();
        let mut parts: Vec<String> = Vec::new();
        if !base.is_empty() { parts.push(base); }
        if !stm_context_block.is_empty() { parts.push(stm_context_block); }
        if has_time_context || has_twins_context {
            let mut ctx_lines: Vec<String> = Vec::new();
            if has_time_context {
                ctx_lines.push(format!(
                    "TIME_CONTEXT: flow_active={cognitive_flow}, mode={cognitive_mode}"
                ));
            }
            if has_twins_context {
                ctx_lines.push(format!(
                    "TWINS_CONTEXT: fusion_score={:.2}, trend={twins_trend}",
                    twins_score
                ));
            }
            parts.push(format!("[{}]", ctx_lines.join(" | ")));
        }
        if parts.is_empty() { None } else { Some(parts.join("\n\n")) }
    };

    let request = ConversationRequest {
        user_message: message.clone(),
        conversation_id: Some(conversation_id.clone()),
        mode: conversation_mode,
        ai_config: effective_provider.map(|p| {
            let provider_pref = match p.as_str() {
                "gemini" => super::types::ProviderPreference::Gemini,
                "ollama" => super::types::ProviderPreference::Ollama,
                "openai" | "gpt" => super::types::ProviderPreference::OpenAI,
                "claude" | "anthropic" => super::types::ProviderPreference::Claude,
                "local" => super::types::ProviderPreference::Local,
                _ => super::types::ProviderPreference::Auto,
            };
            AIConfig {
                temperature: 0.7,
                max_tokens: None,
                provider_preference: provider_pref,
            }
        }),
        emotion_context: None,
        custom_system_prompt: system_prompt, // ✨ Ajout du system prompt personnalisé (+ TIME/TWINS context)
        history: conversation_context,
    };

    // Traiter via le pipeline OMEGA complet
    let start_time = std::time::Instant::now();
    let response = engine
        .process_message(request)
        .await
        .map_err(|e| e.to_string())?;
    let latency_ms = start_time.elapsed().as_millis() as u64;

    // ✅ FIX AUDIT: Validation content non-vide AVANT serialization
    if response.assistant_message.trim().is_empty() {
        log::error!("[Ω:CMD] ❌ AI generated empty response");
        return Err("AI response content is empty".to_string());
    }

    log::info!(
        "[Ω:CMD] ✅ Success | req_id={} | msg_id={} | content_len={} | latency={}ms",
        req_id,
        response.message_id,
        response.assistant_message.len(),
        latency_ms
    );

    let meta = ensure_provider_meta(&response.metadata, latency_ms as u128);

    if let Err(err) = persist_conversation_os_artifacts(
        &conversation_id,
        &req_id,
        &message,
        Some(response.assistant_message.as_str()),
        &trace,
        Some(&meta),
        &search_citations_json,
    ) {
        log::warn!("[Ω:CMD] Conversation OS persistence skipped: {}", err);
    }

    // Construire la réponse JSON compatible avec le frontend
    let assistant_content = if let Some(notice) = search_user_notice {
        format!("{}\n\n{}", notice, response.assistant_message)
    } else {
        response.assistant_message.clone()
    };

    Ok(serde_json::json!({
        "ok": true,
        "content": assistant_content,
        "conversationId": response.conversation_id,
        "messageId": response.message_id,
        "frenchMasteryApplied": true, // OMEGA utilise toujours FrenchMastery
        "latencyMs": latency_ms,
        "meta": meta,
        "trace": trace,
        "metadata": {
            "intention": format!("{:?}", response.detected_intention),
            "emotion": format!("{:?}", response.detected_emotion),
            "cognitiveTags": response.cognitive_tags,
            "cognitiveSummary": response.cognitive_summary,
            "historyLoadStatus": history_load_status,
            "historyMessageCount": history_message_count,
            "historyLoadError": history_load_error,
            "requestId": req_id,
            "contextBinding": context_binding,
        }
    }))
}

fn ensure_provider_meta(metadata: &ConversationMetadata, latency_ms_total: u128) -> ProviderDecisionMeta {
    if let Some(meta) = metadata.provider_meta.clone() {
        if !meta.provider_used.is_empty() {
            return meta;
        }
    }

    let provider_used = if metadata.provider_used.is_empty() {
        "unknown".to_string()
    } else {
        metadata.provider_used.clone()
    };

    let provider_class = provider_class_from_id(&provider_used);
    let reason_code = ReasonCode::Unknown;
    let mode = mode_from(provider_class.clone(), &provider_used, reason_code.clone());
    let network_used = matches!(provider_class, ProviderClass::Remote);
    let policy = policy_from_env();
    let attempts = vec![build_attempt(
        provider_used.clone(),
        provider_class.clone(),
        latency_ms_total,
        "success",
        reason_code.clone(),
        network_used,
    )];

    build_decision_meta(
        provider_used,
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

fn persist_conversation_os_artifacts(
    conversation_id: &str,
    req_id: &str,
    user_message: &str,
    assistant_message: Option<&str>,
    trace: &serde_json::Value,
    provider_meta: Option<&ProviderDecisionMeta>,
    citations: &[serde_json::Value],
) -> Result<(), String> {
    persist_conversation_os_artifacts_with_path(
        conversation_id,
        req_id,
        user_message,
        assistant_message,
        trace,
        provider_meta,
        citations,
        None,
    )
}

#[cfg(all(not(feature = "mock"), feature = "full"))]
fn persist_conversation_os_artifacts_with_path(
    conversation_id: &str,
    req_id: &str,
    user_message: &str,
    assistant_message: Option<&str>,
    trace: &serde_json::Value,
    provider_meta: Option<&ProviderDecisionMeta>,
    citations: &[serde_json::Value],
    db_path_override: Option<std::path::PathBuf>,
) -> Result<(), String> {
    use crate::services::db_service::{
        create_event, create_failure, create_provider_decision, create_snapshot, create_source,
        DbService,
    };
    use std::time::{SystemTime, UNIX_EPOCH};

    let db_path = resolve_conversation_os_db_path(db_path_override);

    if let Some(parent) = db_path.parent() {
        std::fs::create_dir_all(parent)
            .map_err(|err| format!("create db dir failed: {}", err))?;
    }

    let db = DbService::new(db_path).map_err(|err| err.to_string())?;

    let ts = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|duration| duration.as_millis() as i64)
        .unwrap_or(0);

    let user_payload = serde_json::json!({
        "request_id": req_id,
        "message": user_message,
        "trace": trace,
    })
    .to_string();
    let user_event = create_event(
        format!("evt_user_{}_{}", conversation_id, req_id),
        ts,
        conversation_id.to_string(),
        "user_message".to_string(),
        user_payload,
    );
    db.insert_event(user_event)
        .map_err(|err| format!("insert user event failed: {}", err))?;

    if let Some(assistant_text) = assistant_message {
        let assistant_payload = serde_json::json!({
            "request_id": req_id,
            "message": assistant_text,
            "trace": trace,
        })
        .to_string();
        let assistant_event = create_event(
            format!("evt_assistant_{}_{}", conversation_id, req_id),
            ts.saturating_add(1),
            conversation_id.to_string(),
            "assistant_message".to_string(),
            assistant_payload,
        );
        db.insert_event(assistant_event)
            .map_err(|err| format!("insert assistant event failed: {}", err))?;
    }

    let decision_json = if let Some(meta) = provider_meta {
        serde_json::to_string(meta).unwrap_or_else(|_| "{}".to_string())
    } else {
        serde_json::json!({
            "provider_used": "none",
            "mode": "LOCAL",
            "reason_code": "POLICY_BLOCKED",
            "request_id": req_id,
        })
        .to_string()
    };
    let provider_decision = create_provider_decision(
        format!("dec_{}_{}", conversation_id, req_id),
        ts.saturating_add(2),
        conversation_id.to_string(),
        decision_json,
    );
    db.insert_provider_decision(provider_decision)
        .map_err(|err| format!("insert provider decision failed: {}", err))?;

    if read_bool_env("CONVOS_SOURCES_STORE", true) {
        for (index, citation) in citations.iter().enumerate() {
            let url = citation
                .get("url")
                .and_then(|value| value.as_str())
                .unwrap_or_default()
                .to_string();
            if url.is_empty() {
                continue;
            }

            let title = citation
                .get("title")
                .and_then(|value| value.as_str())
                .unwrap_or("Sans titre")
                .to_string();
            let snippet = citation
                .get("snippet")
                .and_then(|value| value.as_str())
                .unwrap_or_default()
                .to_string();
            let provider = citation
                .get("source")
                .and_then(|value| value.as_str())
                .unwrap_or("unknown")
                .to_string();

            let source_row = create_source(
                format!("src_{}_{}_{}", conversation_id, req_id, index),
                ts.saturating_add(3 + index as i64),
                conversation_id.to_string(),
                provider,
                url,
                title,
                snippet,
                ts,
            );
            db.insert_source(source_row)
                .map_err(|err| format!("insert source failed: {}", err))?;
        }
    }

    if read_bool_env("CONVOS_MEMORY_SNAPSHOTS", true) {
        let summary_fr = trace
            .get("memory")
            .and_then(|value| value.get("snapshot_summary_fr"))
            .and_then(|value| value.as_str())
            .unwrap_or("Résumé FR canonique indisponible")
            .to_string();
        let state_json = trace
            .get("memory")
            .and_then(|value| value.get("snapshot_state"))
            .cloned()
            .unwrap_or_else(|| serde_json::json!({ "conversation_id": conversation_id, "request_id": req_id }))
            .to_string();

        let snapshot = create_snapshot(
            format!("snap_{}_{}", conversation_id, req_id),
            ts.saturating_add(40),
            conversation_id.to_string(),
            summary_fr,
            state_json,
        );
        db.insert_snapshot(snapshot)
            .map_err(|err| format!("insert snapshot failed: {}", err))?;
    }

    if let Some(failure_items) = trace.get("failures").and_then(|value| value.as_array()) {
        for (index, failure) in failure_items.iter().enumerate() {
            let class = failure
                .get("class")
                .and_then(|value| value.as_str())
                .unwrap_or("UNKNOWN")
                .to_string();
            let detail_json = failure
                .get("detail")
                .cloned()
                .unwrap_or_else(|| serde_json::json!({ "reason": "missing_detail" }))
                .to_string();

            let failure_row = create_failure(
                format!("fail_{}_{}_{}", conversation_id, req_id, index),
                ts.saturating_add(60 + index as i64),
                conversation_id.to_string(),
                class,
                detail_json,
            );
            db.insert_failure(failure_row)
                .map_err(|err| format!("insert failure failed: {}", err))?;
        }
    }

    Ok(())
}

#[cfg(not(all(not(feature = "mock"), feature = "full")))]
fn persist_conversation_os_artifacts_with_path(
    conversation_id: &str,
    req_id: &str,
    user_message: &str,
    assistant_message: Option<&str>,
    trace: &serde_json::Value,
    provider_meta: Option<&ProviderDecisionMeta>,
    citations: &[serde_json::Value],
    db_path_override: Option<std::path::PathBuf>,
) -> Result<(), String> {
    use rusqlite::Connection;
    use std::time::{SystemTime, UNIX_EPOCH};

    let db_path = resolve_conversation_os_db_path(db_path_override);

    if let Some(parent) = db_path.parent() {
        std::fs::create_dir_all(parent)
            .map_err(|err| format!("create db dir failed: {}", err))?;
    }

    let conn = Connection::open(db_path).map_err(|err| format!("open db failed: {}", err))?;

    conn.execute_batch(
        "
        CREATE TABLE IF NOT EXISTS events (
            id TEXT PRIMARY KEY,
            ts INTEGER NOT NULL,
            conversation_id TEXT NOT NULL,
            kind TEXT NOT NULL,
            payload TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS provider_decisions (
            id TEXT PRIMARY KEY,
            ts INTEGER NOT NULL,
            conversation_id TEXT NOT NULL,
            payload TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS sources (
            id TEXT PRIMARY KEY,
            ts INTEGER NOT NULL,
            conversation_id TEXT NOT NULL,
            provider TEXT NOT NULL,
            url TEXT NOT NULL,
            title TEXT NOT NULL,
            snippet TEXT NOT NULL,
            source_ts INTEGER NOT NULL
        );

        CREATE TABLE IF NOT EXISTS snapshots (
            id TEXT PRIMARY KEY,
            ts INTEGER NOT NULL,
            conversation_id TEXT NOT NULL,
            summary_fr TEXT NOT NULL,
            state_json TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS failures (
            id TEXT PRIMARY KEY,
            ts INTEGER NOT NULL,
            conversation_id TEXT NOT NULL,
            class TEXT NOT NULL,
            detail_json TEXT NOT NULL
        );
        ",
    )
    .map_err(|err| format!("create schema failed: {}", err))?;

    let ts = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|duration| duration.as_millis() as i64)
        .unwrap_or(0);

    let user_payload = serde_json::json!({
        "request_id": req_id,
        "message": user_message,
        "trace": trace,
    })
    .to_string();

    conn.execute(
        "INSERT OR REPLACE INTO events (id, ts, conversation_id, kind, payload) VALUES (?1, ?2, ?3, ?4, ?5)",
        (
            format!("evt_user_{}_{}", conversation_id, req_id),
            ts,
            conversation_id,
            "user_message",
            user_payload,
        ),
    )
    .map_err(|err| format!("insert user event failed: {}", err))?;

    if let Some(assistant_text) = assistant_message {
        let assistant_payload = serde_json::json!({
            "request_id": req_id,
            "message": assistant_text,
            "trace": trace,
        })
        .to_string();

        conn.execute(
            "INSERT OR REPLACE INTO events (id, ts, conversation_id, kind, payload) VALUES (?1, ?2, ?3, ?4, ?5)",
            (
                format!("evt_assistant_{}_{}", conversation_id, req_id),
                ts.saturating_add(1),
                conversation_id,
                "assistant_message",
                assistant_payload,
            ),
        )
        .map_err(|err| format!("insert assistant event failed: {}", err))?;
    }

    let decision_json = if let Some(meta) = provider_meta {
        serde_json::to_string(meta).unwrap_or_else(|_| "{}".to_string())
    } else {
        serde_json::json!({
            "provider_used": "none",
            "mode": "LOCAL",
            "reason_code": "POLICY_BLOCKED",
            "request_id": req_id,
        })
        .to_string()
    };

    conn.execute(
        "INSERT OR REPLACE INTO provider_decisions (id, ts, conversation_id, payload) VALUES (?1, ?2, ?3, ?4)",
        (
            format!("dec_{}_{}", conversation_id, req_id),
            ts.saturating_add(2),
            conversation_id,
            decision_json,
        ),
    )
    .map_err(|err| format!("insert provider decision failed: {}", err))?;

    if read_bool_env("CONVOS_SOURCES_STORE", true) {
        for (index, citation) in citations.iter().enumerate() {
            let url = citation
                .get("url")
                .and_then(|value| value.as_str())
                .unwrap_or_default()
                .to_string();
            if url.is_empty() {
                continue;
            }

            let title = citation
                .get("title")
                .and_then(|value| value.as_str())
                .unwrap_or("Sans titre")
                .to_string();
            let snippet = citation
                .get("snippet")
                .and_then(|value| value.as_str())
                .unwrap_or_default()
                .to_string();
            let provider = citation
                .get("source")
                .and_then(|value| value.as_str())
                .unwrap_or("unknown")
                .to_string();

            conn.execute(
                "INSERT OR REPLACE INTO sources (id, ts, conversation_id, provider, url, title, snippet, source_ts) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
                (
                    format!("src_{}_{}_{}", conversation_id, req_id, index),
                    ts.saturating_add(3 + index as i64),
                    conversation_id,
                    provider,
                    url,
                    title,
                    snippet,
                    ts,
                ),
            )
            .map_err(|err| format!("insert source failed: {}", err))?;
        }
    }

    if read_bool_env("CONVOS_MEMORY_SNAPSHOTS", true) {
        let summary_fr = trace
            .get("memory")
            .and_then(|value| value.get("snapshot_summary_fr"))
            .and_then(|value| value.as_str())
            .unwrap_or("Résumé FR canonique indisponible")
            .to_string();
        let state_json = trace
            .get("memory")
            .and_then(|value| value.get("snapshot_state"))
            .cloned()
            .unwrap_or_else(|| serde_json::json!({ "conversation_id": conversation_id, "request_id": req_id }))
            .to_string();

        conn.execute(
            "INSERT OR REPLACE INTO snapshots (id, ts, conversation_id, summary_fr, state_json) VALUES (?1, ?2, ?3, ?4, ?5)",
            (
                format!("snap_{}_{}", conversation_id, req_id),
                ts.saturating_add(40),
                conversation_id,
                summary_fr,
                state_json,
            ),
        )
        .map_err(|err| format!("insert snapshot failed: {}", err))?;
    }

    if let Some(failure_items) = trace.get("failures").and_then(|value| value.as_array()) {
        for (index, failure) in failure_items.iter().enumerate() {
            let class = failure
                .get("class")
                .and_then(|value| value.as_str())
                .unwrap_or("UNKNOWN")
                .to_string();
            let detail_json = failure
                .get("detail")
                .cloned()
                .unwrap_or_else(|| serde_json::json!({ "reason": "missing_detail" }))
                .to_string();

            conn.execute(
                "INSERT OR REPLACE INTO failures (id, ts, conversation_id, class, detail_json) VALUES (?1, ?2, ?3, ?4, ?5)",
                (
                    format!("fail_{}_{}_{}", conversation_id, req_id, index),
                    ts.saturating_add(60 + index as i64),
                    conversation_id,
                    class,
                    detail_json,
                ),
            )
            .map_err(|err| format!("insert failure failed: {}", err))?;
        }
    }

    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::conversation_engine::meta_accumulator::{build_offline_meta, build_success_meta};
    use rusqlite::Connection;
    use std::fs;
    use std::path::PathBuf;

    fn sample_response(provider_used: &str, provider_meta: ProviderDecisionMeta) -> ConversationResponse {
        ConversationResponse {
            assistant_message: "OK".to_string(),
            conversation_id: "conv-1".to_string(),
            message_id: "msg-1".to_string(),
            detected_intention: Intention::Question,
            detected_emotion: EmotionState::default(),
            cognitive_tags: vec!["tag".to_string()],
            cognitive_summary: "summary".to_string(),
            metadata: ConversationMetadata {
                timestamp: 0,
                provider_used: provider_used.to_string(),
                latency_ms: 1,
                tokens_used: 1,
                memory_effect: MemoryEffect::New,
                links_to_contexts: vec![],
                provider_meta: Some(provider_meta),
            },
        }
    }

    fn write_output(value: &serde_json::Value) {
        let out = match std::env::var("P3_IPC_CONTRACT_OUT") {
            Ok(path) => path,
            Err(_) => return,
        };

        let path = PathBuf::from(out);
        if let Some(parent) = path.parent() {
            let _ = fs::create_dir_all(parent);
        }
        let _ = fs::write(path, serde_json::to_string_pretty(value).unwrap_or_else(|_| "{}".to_string()));
    }

    #[test]
    fn ipc_meta_contract_smoke() {
        let mode = std::env::var("P3_IPC_MODE").unwrap_or_else(|_| "default".to_string());
        let provider_meta = if mode == "offline" {
            build_offline_meta(ReasonCode::FallbackOffline, "OFFLINE_SIM")
        } else {
            build_success_meta("local", 1)
        };

        let response = sample_response("local", provider_meta);
        let json = serde_json::json!({
            "content": response.assistant_message,
            "conversationId": response.conversation_id,
            "messageId": response.message_id,
            "frenchMasteryApplied": true,
            "latencyMs": 1,
            "meta": ensure_provider_meta(&response.metadata, 1),
            "metadata": {
                "intention": format!("{:?}", response.detected_intention),
                "emotion": format!("{:?}", response.detected_emotion),
                "cognitiveTags": response.cognitive_tags,
                "cognitiveSummary": response.cognitive_summary,
                "requestId": "req_test",
            }
        });

        let meta = json.get("meta").expect("meta missing");
        assert!(meta.get("provider_used").is_some());
        assert!(meta.get("provider_class").is_some());
        assert!(meta.get("mode").is_some());
        assert!(meta.get("reason_code").is_some());
        assert!(meta.get("network_used").is_some());
        assert!(meta.get("attempts").is_some());
        assert!(meta.get("latency_ms_total").is_some());

        write_output(&json);
    }

    #[test]
    fn no_silent_fallback_keeps_root_cause_offline() {
        let provider_meta = build_offline_meta(ReasonCode::FallbackOffline, "OFFLINE_SIM");
        let response = sample_response("offline", provider_meta);
        let meta = ensure_provider_meta(&response.metadata, 1);

        assert_eq!(meta.provider_used, "offline");
        assert!(matches!(meta.mode, Mode::Offline));
        assert_eq!(meta.reason_code, ReasonCode::FallbackOffline);
        assert_ne!(meta.reason_code, ReasonCode::ProviderDown);
        assert!(!meta.network_used);
    }

    #[test]
    fn reproducible_meta_same_input_same_output() {
        let provider_meta = build_offline_meta(ReasonCode::FallbackOffline, "OFFLINE_SIM");
        let response = sample_response("offline", provider_meta);

        let run1 = ensure_provider_meta(&response.metadata, 1);
        let run2 = ensure_provider_meta(&response.metadata, 1);
        let run3 = ensure_provider_meta(&response.metadata, 1);

        let json1 = serde_json::to_string(&run1).expect("serialize run1");
        let json2 = serde_json::to_string(&run2).expect("serialize run2");
        let json3 = serde_json::to_string(&run3).expect("serialize run3");

        assert_eq!(json1, json2);
        assert_eq!(json2, json3);
    }

    #[test]
    fn conversation_os_persistence_stores_events_and_sources() {
        let db_path = std::env::temp_dir().join(format!(
            "titane-conversation-os-{}.db",
            Uuid::new_v4()
        ));

        let trace = serde_json::json!({
            "phase": "test",
            "router": { "intent": "Search" },
        });

        let citations = vec![serde_json::json!({
            "title": "Source de test",
            "url": "https://example.com/source",
            "snippet": "Snippet de test",
            "source": "test_source"
        })];

        let provider_meta = build_success_meta("local", 1);

        persist_conversation_os_artifacts_with_path(
            "conv-test",
            "req-test",
            "Message utilisateur",
            Some("Réponse assistant"),
            &trace,
            Some(&provider_meta),
            &citations,
            Some(db_path.clone()),
        )
        .expect("persistence should succeed");

        let conn = Connection::open(db_path.clone()).expect("db should open");
        let events_count: i64 = conn
            .query_row(
                "SELECT COUNT(*) FROM events WHERE conversation_id = ?1",
                ["conv-test"],
                |row| row.get(0),
            )
            .expect("events count query should succeed");
        assert_eq!(events_count, 2);

        let sources_count: i64 = conn
            .query_row(
                "SELECT COUNT(*) FROM sources WHERE conversation_id = ?1",
                ["conv-test"],
                |row| row.get(0),
            )
            .expect("sources count query should succeed");
        assert_eq!(sources_count, 1);

        let source_url: String = conn
            .query_row(
                "SELECT url FROM sources WHERE conversation_id = ?1 LIMIT 1",
                ["conv-test"],
                |row| row.get(0),
            )
            .expect("source url query should succeed");
        assert_eq!(source_url, "https://example.com/source");

        let _ = std::fs::remove_file(db_path);
    }

    #[test]
    fn conversation_os_db_path_resolver_prefers_explicit_env_override() {
        let path = resolve_conversation_os_db_path_from_env(
            None,
            Some("/tmp/titane-convos-test.db".to_string()),
            Some("/tmp/xdg-data".to_string()),
            Some("/tmp/home".to_string()),
        );

        assert_eq!(path, std::path::PathBuf::from("/tmp/titane-convos-test.db"));
    }

    #[test]
    fn conversation_os_db_path_resolver_uses_persistent_dir_when_env_missing() {
        let path = resolve_conversation_os_db_path_from_env(None, None, None, None);
        assert!(path.is_absolute());
        // Fallback uses dirs::data_local_dir() for persistent storage (Android-safe).
        // On most systems data_local_dir() is defined; if not, falls back to temp_dir().
        assert!(path.ends_with("TITANE_INFINITY/runtime/memory/conversation_os_v1.db"));
    }

    #[test]
    fn conversation_os_single_pipeline_trace_and_artifacts_are_canonical() {
        let db_path = std::env::temp_dir().join(format!(
            "titane-conversation-os-single-pipeline-{}.db",
            Uuid::new_v4()
        ));

        let trace = serde_json::json!({
            "phase": "conversation_generate",
            "router": { "intent": "Question", "wants_search": false },
            "policy": { "allow_online": true, "hard_block": false },
            "resilience": { "allowed": true },
            "memory": { "fetch_stm": true, "fetch_ltm": false },
            "citations": []
        });

        let provider_meta = build_success_meta("local", 12);

        persist_conversation_os_artifacts_with_path(
            "conv-single",
            "req-single",
            "Message test pipeline unique",
            Some("Réponse test pipeline unique"),
            &trace,
            Some(&provider_meta),
            &[],
            Some(db_path.clone()),
        )
        .expect("single-pipeline persistence should succeed");

        let conn = Connection::open(db_path.clone()).expect("db should open");

        let event_kinds: Vec<String> = {
            let mut stmt = conn
                .prepare(
                    "SELECT kind FROM events WHERE conversation_id = ?1 ORDER BY ts ASC",
                )
                .expect("prepare event kinds query");

            stmt.query_map(["conv-single"], |row| row.get(0))
                .expect("query event kinds")
                .collect::<Result<Vec<String>, _>>()
                .expect("collect event kinds")
        };

        assert_eq!(event_kinds, vec!["user_message", "assistant_message"]);

        let provider_decisions_count: i64 = conn
            .query_row(
                "SELECT COUNT(*) FROM provider_decisions WHERE conversation_id = ?1",
                ["conv-single"],
                |row| row.get(0),
            )
            .expect("provider decisions count query should succeed");
        assert_eq!(provider_decisions_count, 1);

        let first_payload: String = conn
            .query_row(
                "SELECT payload FROM events WHERE conversation_id = ?1 AND kind = 'user_message' LIMIT 1",
                ["conv-single"],
                |row| row.get(0),
            )
            .expect("user payload query should succeed");

        let payload_json: serde_json::Value =
            serde_json::from_str(&first_payload).expect("user payload should be valid json");
        let trace_json = payload_json
            .get("trace")
            .expect("trace should be persisted in user payload");

        assert_eq!(
            trace_json
                .get("phase")
                .and_then(|value| value.as_str())
                .unwrap_or_default(),
            "conversation_generate"
        );
        assert!(trace_json.get("router").is_some());
        assert!(trace_json.get("policy").is_some());
        assert!(trace_json.get("resilience").is_some());
        assert!(trace_json.get("memory").is_some());

        let _ = std::fs::remove_file(db_path);
    }

    #[test]
    fn conversation_os_persistence_stores_snapshot_and_failures_from_trace() {
        let db_path = std::env::temp_dir().join(format!(
            "titane-conversation-os-snapshot-fail-{}.db",
            Uuid::new_v4()
        ));

        let trace = serde_json::json!({
            "phase": "conversation_generate",
            "memory": {
                "snapshot_summary_fr": "Résumé FR test",
                "snapshot_state": { "k": "v" }
            },
            "failures": [
                {
                    "class": "CREDENTIALS_MISSING",
                    "detail": { "provider": "brave", "reason": "missing key" }
                }
            ]
        });

        let provider_meta = build_success_meta("local", 7);
        persist_conversation_os_artifacts_with_path(
            "conv-pack5",
            "req-pack5",
            "message",
            Some("assistant"),
            &trace,
            Some(&provider_meta),
            &[],
            Some(db_path.clone()),
        )
        .expect("persistence should succeed");

        let conn = Connection::open(db_path.clone()).expect("db should open");

        let snapshots_count: i64 = conn
            .query_row(
                "SELECT COUNT(*) FROM snapshots WHERE conversation_id = ?1",
                ["conv-pack5"],
                |row| row.get(0),
            )
            .expect("snapshots count query should succeed");
        assert_eq!(snapshots_count, 1);

        let failures_count: i64 = conn
            .query_row(
                "SELECT COUNT(*) FROM failures WHERE conversation_id = ?1",
                ["conv-pack5"],
                |row| row.get(0),
            )
            .expect("failures count query should succeed");
        assert_eq!(failures_count, 1);

        let _ = std::fs::remove_file(db_path);
    }

    #[test]
    fn memory_used_internal_ids_recall_10_prompts() {
        let prompts = [
            "rappelle le point 1",
            "rappelle le point 2",
            "rappelle le point 3",
            "rappelle le point 4",
            "rappelle le point 5",
            "rappelle le point 6",
            "rappelle le point 7",
            "rappelle le point 8",
            "rappelle le point 9",
            "rappelle le point 10",
        ];

        for (index, _prompt) in prompts.iter().enumerate() {
            let req_id = format!("req{}", index + 1);
            let ids = build_memory_used_ids("conv-recall", &req_id, true, false);
            assert!(ids.iter().any(|id| id.starts_with("evt_user_conv-recall_req")));
            assert!(ids.iter().any(|id| id.starts_with("snap_conv-recall_req")));
            assert!(!ids.iter().any(|id| id.contains("external")));
        }
    }
}

/// Traiter un message (ancienne interface - conservée pour compatibilité)
#[tauri::command]
pub async fn conversation_process_message(
    engine: State<'_, Arc<ConversationEngineState>>,
    user_message: String,
    conversation_id: Option<String>,
    mode: Option<String>,
) -> CommandResult<ConversationResponse> {
    log::info!(
        "[conversation_process_message] 📨 Request received | msg_len={} | conv_id={:?} | mode={:?}",
        user_message.len(),
        conversation_id,
        mode
    );

    let mode = match mode.as_deref() {
        Some("brainstorming") => ConversationMode::Brainstorming,
        Some("synthesis") => ConversationMode::Synthesis,
        Some("planning") => ConversationMode::Planning,
        Some("journal") => ConversationMode::Journal,
        Some("debug_cognitive") => ConversationMode::DebugCognitive,
        _ => ConversationMode::Default,
    };

    let request = ConversationRequest {
        user_message: user_message.clone(),
        conversation_id: conversation_id.clone(),
        mode,
        ai_config: None,
        emotion_context: None,
        custom_system_prompt: None,
        history: None,
    };

    log::info!(
        "[conversation_process_message] 🚀 Processing through engine | mode={:?}",
        request.mode
    );

    match engine.process_message(request).await {
        Ok(response) => {
            log::info!(
                "[conversation_process_message] ✅ Success | msg_id={} | tokens={}",
                response.message_id,
                response.metadata.tokens_used
            );
            Ok(response)
        }
        Err(e) => {
            log::error!(
                "[conversation_process_message] ❌ Error | msg='{}' | error={}",
                user_message.chars().take(50).collect::<String>(),
                e
            );
            Err(e.to_string())
        }
    }
}

/// Health check du système
#[tauri::command]
pub async fn conversation_health_check(
    engine: State<'_, Arc<ConversationEngineState>>,
) -> CommandResult<ConversationHealthReport> {
    engine.health_check().await.map_err(|e| e.to_string())
}

/// Obtenir statistiques mémoire
#[tauri::command]
pub async fn conversation_memory_stats(
    engine: State<'_, Arc<ConversationEngineState>>,
) -> CommandResult<serde_json::Value> {
    let stats = engine.self_healing.read().await.stats();

    Ok(serde_json::json!({
        "total_processed": stats.total_processed,
        "total_anomalies": stats.total_anomalies,
        "last_scan": stats.last_scan,
    }))
}

// ═══════════════════════════════════════════════════════════════════
// FRENCH MASTERY POST-PROCESSOR COMMANDS
// ═══════════════════════════════════════════════════════════════════

/// Post-traiter une réponse en français avancé
#[tauri::command]
pub async fn conversation_french_postprocess(
    engine: State<'_, Arc<ConversationEngineState>>,
    context: String,
    draft_response: String,
    mode: Option<String>,
    tone: Option<String>,
    length: Option<String>,
    technical_level: Option<String>,
) -> CommandResult<super::french_mastery::FrenchMasteryResponse> {
    use super::french_mastery::*;

    let processing_mode = match mode.as_deref() {
        Some("correction") => ProcessingMode::Correction,
        Some("simplification") => ProcessingMode::Simplification,
        Some("enrichment") => ProcessingMode::Enrichment,
        Some("double") => ProcessingMode::Double,
        _ => ProcessingMode::Optimization, // Par défaut
    };

    let tone_value = match tone.as_deref() {
        Some("warm") => Tone::Warm,
        Some("professional") => Tone::Professional,
        _ => Tone::Neutral,
    };

    let length_value = match length.as_deref() {
        Some("short") => Length::Short,
        Some("long") => Length::Long,
        _ => Length::Medium,
    };

    let tech_level = match technical_level.as_deref() {
        Some("beginner") => TechnicalLevel::Beginner,
        Some("expert") => TechnicalLevel::Expert,
        _ => TechnicalLevel::Intermediate,
    };

    let request = FrenchMasteryRequest {
        context,
        draft_response,
        mode: processing_mode,
        constraints: PostProcessingConstraints {
            tone: tone_value,
            length: length_value,
            technical_level: tech_level,
        },
    };

    engine
        .french_mastery
        .process(request)
        .await
        .map_err(|e| e.to_string())
}

/// Appliquer le réalisme conversationnel (Super Prompt #4)
#[tauri::command]
pub async fn conversation_realism_process(
    engine: State<'_, Arc<ConversationEngineState>>,
    context: String,
    user_message: String,
    draft_response: String,
    conversation_history: Vec<String>,
    recent_topics: Vec<String>,
) -> CommandResult<super::realism::RealismResponse> {
    use super::realism::RealismRequest;

    let request = RealismRequest {
        context,
        user_message,
        draft_response,
        conversation_history,
        recent_topics,
    };

    Ok(engine.realism.process(request).await)
}

/// Appliquer la subtilité émotionnelle (Super Prompt #5)
#[tauri::command]
pub async fn conversation_emotional_process(
    engine: State<'_, Arc<ConversationEngineState>>,
    context: String,
    user_message: String,
    draft_response: String,
    conversation_velocity: usize,
    message_history: Vec<String>,
) -> CommandResult<super::emotional_subtlety::EmotionalResponse> {
    use super::emotional_subtlety::EmotionalRequest;

    let request = EmotionalRequest {
        context,
        user_message,
        draft_response,
        conversation_velocity,
        message_history,
    };

    Ok(engine.emotional_subtlety.process(request).await)
}

/// Appliquer la cohérence comportementale (Super Prompt #6)
#[tauri::command]
pub async fn conversation_behavioral_check(
    engine: State<'_, Arc<ConversationEngineState>>,
    response_draft: String,
    conversation_context: String,
    previous_responses: Vec<String>,
    user_message: String,
) -> CommandResult<super::behavioral_consistency::BehavioralResponse> {
    use super::behavioral_consistency::BehavioralRequest;

    let request = BehavioralRequest {
        response_draft,
        conversation_context,
        previous_responses,
        user_message,
    };

    Ok(engine.behavioral_consistency.process(request).await)
}

/// Traiter du texte avec le moteur littéraire (Super Prompt #7)
#[tauri::command]
pub async fn literary_engine_process(
    engine: State<'_, Arc<ConversationEngineState>>,
    text_type: String,
    intensity: String,
    target_length: Option<usize>,
    draft: String,
    reference_style: Option<Vec<String>>,
    mode: String,
) -> CommandResult<serde_json::Value> {
    use crate::conversation_engine::literary_engine::{
        LiteraryContext, LiteraryIntensity, LiteraryRequest, TextType, WritingMode,
    };

    let text_type = match text_type.as_str() {
        "post" => TextType::Post,
        "book_paragraph" => TextType::BookParagraph,
        "poetry" => TextType::Poetry,
        "intro" => TextType::Intro,
        "chapter" => TextType::Chapter,
        "manifesto" => TextType::Manifesto,
        "web_page" => TextType::WebPage,
        other => TextType::Other(other.to_string()),
    };

    let intensity = match intensity.as_str() {
        "sober" => LiteraryIntensity::Sober,
        "poetic" => LiteraryIntensity::Poetic,
        _ => LiteraryIntensity::Balanced,
    };

    let mode = match mode.as_str() {
        "literary_smoothing" => WritingMode::LiterarySmoothing,
        "literary_enhanced" => WritingMode::LiteraryEnhanced,
        "poetic_version" => WritingMode::PoeticVersion,
        "double_version" => WritingMode::DoubleVersion,
        _ => WritingMode::AdaptToMedium,
    };

    let request = LiteraryRequest {
        context: LiteraryContext {
            text_type,
            intensity,
            target_length,
        },
        draft,
        reference_style,
        mode,
    };

    let literary_engine = engine.literary_engine.read().await;
    let response = literary_engine.process(request);

    serde_json::to_value(&response).map_err(|e| e.to_string())
}

/// Mettre à jour le profil de style littéraire
#[tauri::command]
pub async fn literary_engine_update_style(
    engine: State<'_, Arc<ConversationEngineState>>,
    new_texts: Vec<String>,
) -> CommandResult<serde_json::Value> {
    let mut literary_engine = engine.literary_engine.write().await;
    literary_engine.update_style_profile(new_texts);

    let profile = literary_engine.get_style_profile();
    serde_json::to_value(profile).map_err(|e| e.to_string())
}

/// Obtenir le profil de style actuel
#[tauri::command]
pub async fn literary_engine_get_style_profile(
    engine: State<'_, Arc<ConversationEngineState>>,
) -> CommandResult<serde_json::Value> {
    let literary_engine = engine.literary_engine.read().await;
    let profile = literary_engine.get_style_profile();
    serde_json::to_value(profile).map_err(|e| e.to_string())
}

/// Intégrer un texte dans l'anthologie interne (Super Prompt #8)
#[tauri::command]
pub async fn anthology_integrate_text(
    engine: State<'_, Arc<ConversationEngineState>>,
    text: String,
    source: String,
    author_provided_tags: Option<Vec<String>>,
) -> CommandResult<serde_json::Value> {
    use crate::conversation_engine::anthology_engine::AnthologyIntegrationRequest;

    let request = AnthologyIntegrationRequest {
        text,
        source,
        author_provided_tags,
    };

    let mut anthology_engine = engine.anthology_engine.write().await;
    let response = anthology_engine.integrate_text(request);

    serde_json::to_value(&response).map_err(|e| e.to_string())
}

/// Obtenir l'ADN littéraire actuel
#[tauri::command]
pub async fn anthology_get_literary_dna(
    engine: State<'_, Arc<ConversationEngineState>>,
) -> CommandResult<serde_json::Value> {
    let anthology_engine = engine.anthology_engine.read().await;
    let dna = anthology_engine.get_literary_dna();
    serde_json::to_value(dna).map_err(|e| e.to_string())
}

/// Rechercher des extraits par tag
#[tauri::command]
pub async fn anthology_search_by_tag(
    engine: State<'_, Arc<ConversationEngineState>>,
    tag: String,
) -> CommandResult<serde_json::Value> {
    let anthology_engine = engine.anthology_engine.read().await;
    let excerpts = anthology_engine.search_by_tag(&tag);
    serde_json::to_value(&excerpts).map_err(|e| e.to_string())
}

/// Rechercher des extraits par couche
#[tauri::command]
pub async fn anthology_search_by_layer(
    engine: State<'_, Arc<ConversationEngineState>>,
    layer: String,
) -> CommandResult<serde_json::Value> {
    use crate::conversation_engine::anthology_engine::AnthologyLayer;

    let layer = match layer.as_str() {
        "literary_fragments" => AnthologyLayer::LiteraryFragments,
        "lexical_fields" => AnthologyLayer::LexicalFields,
        "stylistic_signatures" => AnthologyLayer::StylisticSignatures,
        "metaphors_images" => AnthologyLayer::MetaphorsImages,
        "founding_themes" => AnthologyLayer::FoundingThemes,
        "models_methodologies" => AnthologyLayer::ModelsMethodologies,
        "literary_dna" => AnthologyLayer::LiteraryDNA,
        _ => return Err("Invalid layer".to_string()),
    };

    let anthology_engine = engine.anthology_engine.read().await;
    let excerpts = anthology_engine.search_by_layer(layer);
    serde_json::to_value(&excerpts).map_err(|e| e.to_string())
}

/// Obtenir les top N champs lexicaux
#[tauri::command]
pub async fn anthology_get_top_lexical_fields(
    engine: State<'_, Arc<ConversationEngineState>>,
    n: usize,
) -> CommandResult<Vec<(String, usize)>> {
    let anthology_engine = engine.anthology_engine.read().await;
    Ok(anthology_engine.get_top_lexical_fields(n))
}

/// Charger l'historique d'une conversation depuis le SQLite conversation_os
/// Commande IPC pour restaurer le transcript UI depuis la source backend réelle.
/// Retourne un Vec vide (jamais d'erreur silencieuse) si aucune donnée n'existe.
/// Chaque élément: { role: "user"|"assistant", content: String, timestamp: i64 }
#[tauri::command]
pub async fn load_conversation_history(
    conversation_id: String,
) -> CommandResult<Vec<serde_json::Value>> {
    use rusqlite::Connection;

    if conversation_id.trim().is_empty() {
        log::warn!("[load_conversation_history] conversation_id is empty — returning []");
        return Ok(vec![]);
    }

    let db_path = resolve_conversation_os_db_path(None);

    if !db_path.exists() {
        log::warn!(
            "[load_conversation_history] db not found at {:?} — returning []",
            db_path
        );
        return Ok(vec![]);
    }

    let conn = match Connection::open(&db_path) {
        Ok(c) => c,
        Err(e) => {
            log::warn!("[load_conversation_history] open db failed: {} — returning []", e);
            return Ok(vec![]);
        }
    };

    // Read events ordered by timestamp — only user and assistant messages
    let mut stmt = conn
        .prepare(
            "SELECT kind, payload, ts FROM events \
             WHERE conversation_id = ?1 \
             AND kind IN ('user_message', 'assistant_message') \
             ORDER BY ts ASC",
        )
        .map_err(|e| format!("[load_conversation_history] prepare failed: {}", e))?;

    let rows: Vec<serde_json::Value> = stmt
        .query_map([&conversation_id], |row| {
            let kind: String = row.get(0)?;
            let payload_str: String = row.get(1)?;
            let ts: i64 = row.get(2)?;
            Ok((kind, payload_str, ts))
        })
        .map_err(|e| format!("[load_conversation_history] query failed: {}", e))?
        .filter_map(|r| r.ok())
        .filter_map(|(kind, payload_str, ts)| {
            let role = if kind == "user_message" { "user" } else { "assistant" };
            let payload: serde_json::Value = serde_json::from_str(&payload_str).ok()?;
            let content = payload.get("message")?.as_str()?;
            Some(serde_json::json!({
                "role": role,
                "content": content,
                "timestamp": ts,
            }))
        })
        .collect();

    if rows.is_empty() {
        log::info!(
            "[load_conversation_history] conversation_id='{}' — no events found in db ({})",
            conversation_id,
            db_path.display()
        );
    } else {
        log::info!(
            "[load_conversation_history] conversation_id='{}' — restored {} message(s)",
            conversation_id,
            rows.len()
        );
    }

    Ok(rows)
}

/// Lister les conversations restituables depuis SQLite conversation_os.
/// Retourne Vec<{conversationId, messageCount, lastTs}> triées par lastTs DESC.
/// Retourne [] si db absent ou 0 conversations — jamais d'erreur silencieuse.
#[tauri::command]
pub async fn list_restorable_conversations(
    limit: Option<u32>,
) -> CommandResult<Vec<serde_json::Value>> {
    use rusqlite::Connection;

    let db_path = resolve_conversation_os_db_path(None);
    if !db_path.exists() {
        log::warn!(
            "[list_restorable_conversations] db not found at {:?} — returning []",
            db_path
        );
        return Ok(vec![]);
    }

    let conn = match Connection::open(&db_path) {
        Ok(c) => c,
        Err(e) => {
            log::warn!(
                "[list_restorable_conversations] open db failed: {} — returning []",
                e
            );
            return Ok(vec![]);
        }
    };

    let limit_val = limit.unwrap_or(50).min(200) as i64;

    let mut stmt = conn
        .prepare(
            "SELECT conversation_id, COUNT(*) as msg_count, MAX(ts) as last_ts \
             FROM events \
             WHERE kind IN ('user_message', 'assistant_message') \
             GROUP BY conversation_id \
             ORDER BY last_ts DESC \
             LIMIT ?1",
        )
        .map_err(|e| format!("[list_restorable_conversations] prepare failed: {}", e))?;

    let rows: Vec<serde_json::Value> = stmt
        .query_map([limit_val], |row| {
            let conversation_id: String = row.get(0)?;
            let msg_count: i64 = row.get(1)?;
            let last_ts: i64 = row.get(2)?;
            Ok((conversation_id, msg_count, last_ts))
        })
        .map_err(|e| format!("[list_restorable_conversations] query failed: {}", e))?
        .filter_map(|r| r.ok())
        .map(|(conversation_id, msg_count, last_ts)| {
            serde_json::json!({
                "conversationId": conversation_id,
                "messageCount": msg_count,
                "lastTs": last_ts,
            })
        })
        .collect();

    log::info!(
        "[list_restorable_conversations] found {} conversation(s) in db ({})",
        rows.len(),
        db_path.display()
    );

    Ok(rows)
}

/// Obtenir les statistiques de l'anthologie
#[tauri::command]
pub async fn anthology_get_statistics(
    engine: State<'_, Arc<ConversationEngineState>>,
) -> CommandResult<serde_json::Value> {
    let anthology_engine = engine.anthology_engine.read().await;
    let stats = anthology_engine.get_statistics();
    serde_json::to_value(&stats).map_err(|e| e.to_string())
}
