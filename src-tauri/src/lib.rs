//! ═══════════════════════════════════════════════════════════════
//!   TITANE∞ v30.0.0 — LIB CONFIGURATION
//!   Unified backend architecture - Singularity + OMEGA Pipeline
//! ═══════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════
// SECURITY & CODE QUALITY LINTS (v26.2.0+)
// ═══════════════════════════════════════════════════════════════

// Safe error handling lints — allowed globally so CI -D warnings does not
// block test code that legitimately uses .expect() / .unwrap() in test fns.
// Production callers should still prefer proper error propagation.
#![allow(clippy::unwrap_used)]
#![allow(clippy::expect_used)]
// ═══════════════════════════════════════════════════════════════
// CLIPPY CONFIGURATION (Non-Critical Warnings)
// ═══════════════════════════════════════════════════════════════

// Suppress non-critical Clippy warnings globally
#![allow(clippy::empty_line_after_doc_comments)]
#![allow(clippy::empty_line_after_outer_attr)]
#![allow(clippy::derivable_impls)]
#![allow(clippy::new_without_default)]
#![allow(clippy::too_many_arguments)]
#![allow(clippy::unnecessary_map_or)]
#![allow(clippy::let_and_return)]
#![allow(clippy::manual_clamp)]
#![allow(clippy::ptr_arg)]
#![allow(clippy::field_reassign_with_default)]
#![allow(clippy::to_string_in_format_args)]
#![allow(clippy::assertions_on_constants)]
#![allow(dead_code)]
#![allow(unused_variables)]
// Suppress deprecation warnings (legacy API still used for backward compat)
// Note: Migration to unified_memory_v2 in progress
#![allow(deprecated)]

// ═══════════════════════════════════════════════════════════════
// CORE MODULES v16 (Always Active)
// ═══════════════════════════════════════════════════════════════

pub mod adaptive; // ✅ AdaptiveEngine v21 (NEW)
pub mod backend_selftest; // ✅ Backend Global Self-Test v17.7 (NEW)
pub mod bounded; // ✅ v21.1Ω - Bounded collections for memory safety (NEW)
pub mod cache_multilevel; // ✅ v21.1Ω - Multi-level caching system (NEW)
pub mod cognitive; // ✅ Cognitive Layer v16 (NEW)
pub mod core; // ✅ SingularityEngine v16 + modules
pub mod gateway; // ✅ One Door Network Gateway (Rule 5) — single HTTP client factory
pub mod engine; // ✅ Auto-Evolution & Engine Diagnostics v16 (existing)
pub mod engine_trait; // ✅ v24 - Engine trait + OrchestratorEngine (stable, in use)
pub mod error; // ✅ v24 - Unified TitaneError enum (stable, in use)
pub mod errors;
pub mod fusion; // ✅ FIX-014: Fusion Engine (fusion_merge/fusion_sync)
pub mod meta; // ✅ Meta-Cognition & Deep Sync v18 (NEW)
pub mod qa; // ✅ QA Engine v19.8 (NEW)
pub mod runtime_real; // ✅ FIX-016: Real runtime state commands (memory KV, toggles, logs, selfheal, XP)
pub mod shared; // ✅ Shared types and utilities
pub mod singularity; // ✅ SingularityState v∞ v20 (NEW)
pub mod streaming; // ✅ v21.1Ω - Streaming IPC for real-time responses (NEW)
pub mod types; // ✅ Type definitions
pub mod utils; // ✅ Utilities (AppResult, AppError)
pub mod watchdog; // ✅ Watchdog Engine v17 (NEW) // ✅ Phase 1 Stabilisation v20.0: Unified AppError (NEW) // ✅ SingularityFusion vΩ (NEW)

// ═══════════════════════════════════════════════════════════════
// PERFORMANCE PROFILING v26.4.0 (Phase 4 Sprint 3)
// ═══════════════════════════════════════════════════════════════

pub mod perf_bench; // ✅ v26.4.0 - Performance benchmarking framework (NEW)
pub mod perf_metrics_capture; // ✅ v26.4.0 - Baseline metrics capture (NEW)

// ═══════════════════════════════════════════════════════════════
// KERNEL v30.0.0 (Super Prompt #11)
// ═══════════════════════════════════════════════════════════════

pub mod kernel; // ✅ Cognitive OS Kernel v30.0.0 (NEW)

// ═══════════════════════════════════════════════════════════════
// OMEGA PIPELINE v30.0.0 (Super Prompt #15)
// ═══════════════════════════════════════════════════════════════

pub mod omega; // ✅ Omega Pipeline v30.0.0

// ═══════════════════════════════════════════════════════════════
// PROFILING & MONITORING v19.5 (NEW)
// ═══════════════════════════════════════════════════════════════

pub mod profiling; // ✅ IPC Performance Profiler v19.5.0 (NEW)

// ═══════════════════════════════════════════════════════════════
pub mod ipc; // ✅ IPC Cache Layer v19.5.2 P2-1 Phase 4 (NEW)
             // CACHING SYSTEM v19.5.2 P2-2 (NEW)
             // ═══════════════════════════════════════════════════════════════

pub mod batch;
pub mod cache; // ✅ Intelligent Cache LRU + Persistent v19.5.2 P2-2 (NEW) // ✅ Batch Request System v19.5.2 P2-3 (NEW)

// ═══════════════════════════════════════════════════════════════
// AI & MEMORY v15
// ═══════════════════════════════════════════════════════════════

pub mod ai; // ✅ AI Router (v15 migration in progress)
pub mod ai_chat; // ✅ AI Chat & Training Mode v∞ (OPUS #12)
#[cfg(all(not(feature = "mock"), feature = "full"))]
pub mod chat_engine; // ✅ High-performance Chat Engine v∞
pub mod conversation_engine; // ✅ Conversation Engine v∞ (Unified Pipeline, Memory Map, Self-Healing)
pub mod ia; // ✅ v∞.19.3Ω: Unified IA Engine (OpenAI + Claude + Gemini + Local)
pub mod multi_agents;
pub mod ollama; // ✅ Canonical Ollama runtime bridge for Tauri/library builds // ✅ v∞.19.3Ω: Multi-Agents avec permissions IA (NEW)

// ═════════════════════════════════════════════════════════
// MEMORY SYSTEM v24.2 (Phase 2 Simplification)
// ═════════════════════════════════════════════════════════

mod neural_memory; // ✅ v24.2: Private neural implementation
pub mod unified_memory_v2; // ✅ v24.2: Unified Memory API (consolidation 5→2 modules)

// Phase 2.4: Partial deprecation - system memory functions moved to unified_memory_v2
// Conversation types (Conversation, MessageRole) remain active for chat history
#[deprecated(
    since = "24.2.0",
    note = "System memory functions moved to unified_memory_v2. Use unified_memory_v2::get_state() instead of memory::get_system_state(). Chat types (Conversation, MessageRole) remain active."
)]
pub mod memory; // ⚠️ Phase 2.4: Partial deprecation (system memory → unified_memory_v2, chat types stay)

// ═══════════════════════════════════════════════════════════════
// PRODUCTION MODULES (Active)
// ═══════════════════════════════════════════════════════════════

pub mod control_panel_commands; // ✅ Control Panel
pub mod harmonia_engine; // ✅ Harmonia CPU monitoring

// Phase 2.4: Deprecated - functionality moved to unified_memory_v2
#[deprecated(
    since = "24.2.0",
    note = "Use unified_memory_v2::consolidate() instead"
)]
pub mod memory_compactor; // ⚠️ Phase 2.4: → unified_memory_v2::consolidate()

#[deprecated(
    since = "24.2.0",
    note = "Use unified_memory_v2::persistence module instead"
)]
pub mod memory_persistence; // ⚠️ Phase 2.4: → unified_memory_v2::persistence
pub mod overdrive; // ✅ Chat orchestrator (always active)
pub mod persistence; // ✅ v∞.MPE - 100% SAVE Persistence Engine (NEW)
pub mod runtime_config; // ✅ Runtime configuration bridge
pub mod secure_commands; // ✅ Secure commands
pub mod secure_engine; // ✅ Secure engine helpers
pub mod security; // ✅ Security layer
pub mod system_state; // ✅ System state
pub mod time; // ✅ Time-travel engine
pub mod time_commands; // ✅ Time commands
pub mod updates; // ✅ Update engine

// ═══════════════════════════════════════════════════════════════
// ENGINES MODULE v∞ (QA, Monitoring, Developer Mode)
// ═══════════════════════════════════════════════════════════════

pub mod engines; // ✅ Engines Core (QA, Monitoring, Developer Mode)

// ═══════════════════════════════════════════════════════════════
// PHASES 5-10 MODULES (Active)
// ═══════════════════════════════════════════════════════════════

pub mod cluster; // ✅ Node-Cluster
pub mod evolution; // ✅ Auto-Évolution
pub mod hybrid_memory_bridge; // ✅ Governed desktop export for hybrid memory reports
pub mod hypervision; // ✅ HyperVision
pub mod introspection; // ✅ Introspection
pub mod knowledge; // ✅ Knowledge Fusion
pub mod knowledge_base_default; // ✅ Default Knowledge Base v30.0.0 — pre-seeded at installation

// ═══════════════════════════════════════════════════════════════
// SYSTEM CENTER MODULE v∞ (Unified Observability)
// ═══════════════════════════════════════════════════════════════

pub mod system_center; // ✅ Centre Système Unifié (Diagnostics, DevTools, Cluster, Introspection, HyperVision)

// ═══════════════════════════════════════════════════════════════
// DESIGN CENTER MODULE v16 (Unified Design & Appearance)
// ═══════════════════════════════════════════════════════════════

pub mod design_center; // ✅ Centre Design & Apparence Unifié (Design System Monochrome v16, Tokens Dynamiques)
pub mod doc_engine; // ✅ Document Engine (generation + export multi-format)

// ═══════════════════════════════════════════════════════════════
// DIGITAL / NUMERIC TWIN MODULES
// ═══════════════════════════════════════════════════════════════

pub mod digital_twin_v14_1; // ✅ TWINS memory bridge + legacy digital twin utilities

// ═══════════════════════════════════════════════════════════════
// PHASES V-Ω MODULES (Active)
// ═══════════════════════════════════════════════════════════════

pub mod cognitive_learning; // ✅ Auto-Apprentissage
pub mod self_repair; // ✅ Auto-Réparation
                     // pub mod singularity;        // ⚠️ Deprecated - Use top-level singularity v∞ (v20)

// ═══════════════════════════════════════════════════════════════
// SELF-HEALING SYSTEM v∞ (SP-GAP-001 to SP-GAP-006)
// ═══════════════════════════════════════════════════════════════

pub mod healing; // ✅ Self-Healing System (Memory Validation, Engine Recalibration, Health Scheduler)

// ═══════════════════════════════════════════════════════════════
// RESILIENCE SYSTEM v∞ (SP-RES-002)
// ═══════════════════════════════════════════════════════════════

pub mod resilience; // ✅ Intelligent Retry + Circuit Breaker

// ═══════════════════════════════════════════════════════════════
// BACKEND MODE SELECTION (Mock vs Full)
// ═══════════════════════════════════════════════════════════════

#[cfg(feature = "mock")]
pub mod mock_commands;

// ═══════════════════════════════════════════════════════════════
// CLOUD SYNC ENGINE v∞ (OPUS #13)
// ═══════════════════════════════════════════════════════════════

pub mod cloud; // ✅ Cloud Sync Engine v∞ (Vault chiffré, Multi-device, AES-256-GCM)

// ═══════════════════════════════════════════════════════════════
// MEMORY EVOLUTION ENGINE++ v∞ (OPUS #14)
// ═══════════════════════════════════════════════════════════════

// Phase 2.4: Deprecated - functionality moved to neural_memory (via unified_memory_v2)
#[deprecated(
    since = "24.2.0",
    note = "Use unified_memory_v2 API which wraps neural_memory::evolution internally"
)]
pub mod memory_evolution; // ⚠️ Phase 2.4: → neural_memory::evolution (via unified_memory_v2)

// ═══════════════════════════════════════════════════════════════
// SYSTEM IDENTITY ENGINE v∞ (OPUS #15)
// ═══════════════════════════════════════════════════════════════

pub mod identity; // ✅ System Identity Engine v∞ (Matrix, Voice, Tone, Mode, Rules, Personality)

// ═══════════════════════════════════════════════════════════════
// META ORCHESTRATOR ENGINE v∞ (OPUS #18)
// ═══════════════════════════════════════════════════════════════

pub mod meta_orchestrator; // ✅ Meta Orchestrator v∞ (Awareness, Resources, Priority Scheduler)

// ═══════════════════════════════════════════════════════════════
// HYPER-INTELLIGENCE ENGINE v∞ (OPUS #20)
// ═══════════════════════════════════════════════════════════════

pub mod hyper_intelligence; // ✅ Hyper-Intelligence v∞ (Reasoning, Creativity, Cognition)

// ═══════════════════════════════════════════════════════════════
// NUMERIC TWIN ENGINE vΩ∞ (SUPER PROMPT — AVATAR TITANE∞)
// ═══════════════════════════════════════════════════════════════

pub mod numeric_twin; // ✅ Numeric Twin vΩ∞ (Kevin ↔ TITANE Symbiosis, 6 Sub-Engines)

// ═══════════════════════════════════════════════════════════════
// AGENDA ENGINE v∞ (TIME/AGENDA SYSTEM)
// ═══════════════════════════════════════════════════════════════

pub mod agenda; // ✅ Agenda Engine v∞ (Time, Events, Energy, Priority, ChatScheduler)

// ═══════════════════════════════════════════════════════════════
// FULL FEATURE MODULES (only when feature = "full")
// Note: engine, overdrive, cognitive already declared above (always active)
// ═══════════════════════════════════════════════════════════════

#[cfg(all(not(feature = "mock"), feature = "full"))]
pub mod commands;

#[cfg(all(not(feature = "mock"), feature = "full"))]
pub mod api;

#[cfg(all(not(feature = "mock"), feature = "full"))]
pub mod compat;

#[cfg(all(not(feature = "mock"), feature = "full"))]
pub mod modules;

// Audio module available in both mock and full modes (capture has internal stubs)
pub mod audio;

#[cfg(all(not(feature = "mock"), feature = "full"))]
pub mod tts;

// REMOVED v24.3.0: engine duplicate (declared at line 37)
// REMOVED v24.3.0: overdrive duplicate (declared at line 125)
// REMOVED v24.3.0: cognitive duplicate (declared at line 35)

#[cfg(all(not(feature = "mock"), feature = "full"))]
pub mod system;

#[cfg(all(not(feature = "mock"), feature = "full"))]
pub mod devtools;

pub mod security_audit_bridge;

#[cfg(all(not(feature = "mock"), feature = "full"))]
pub mod services;

// ═══════════════════════════════════════════════════════════════
// MEMORY OS vΩ (SUPER PROMPT #12)
// ═══════════════════════════════════════════════════════════════

// Phase 2.4: Deprecated - use unified_memory_v2 (neural_memory is private)
#[deprecated(
    since = "24.2.0",
    note = "Use unified_memory_v2 API instead. Neural memory implementation is now private."
)]
pub mod memory_os; // ⚠️ Phase 2.4: → unified_memory_v2 (neural_memory/ is private)

// ═══════════════════════════════════════════════════════════════
// MULTIMODAL ENGINE vΩ (SUPER PROMPT #15)
// ═══════════════════════════════════════════════════════════════

// TEMPORARILY COMMENTED: API incomplete (Phase 1 Stabilisation)
// pub mod multimodal; // ✅ Multimodal Engine vΩ (Vision, Images, Audio 3D, Embeddings Multimodaux)
pub mod agents; // ✅ Agent System vΩ — Super Prompt #19 (Multi-Agents Cognitifs)

// ═══════════════════════════════════════════════════════════════
// CYCLE & CONTINUITY ENGINE v2 (SUPER PROMPT #16)
// ═══════════════════════════════════════════════════════════════

pub mod cycle_engine; // ✅ Cycle Engine v2 (Rythmes, Saisons, Temporalité, Évolution Cognitive)

// ═══════════════════════════════════════════════════════════════
// PERFORMANCE & PARALLELISM ENGINE vΩ (SUPER PROMPT #21)
// ═══════════════════════════════════════════════════════════════

pub mod performance; // ✅ Performance & Parallelism Engine vΩ (Scheduler, Thread Pools, OMEGA Parallèle)

// ═══════════════════════════════════════════════════════════════
// HARMONIC COGNITIVE OS vΩ (SUPER PROMPT #22)
// ═══════════════════════════════════════════════════════════════

pub mod harmonic_os; // ✅ Harmonic OS vΩ (Synchronisation Globale, H-Field, Régulation Auto)

// ═══════════════════════════════════════════════════════════════
// CONVERSATION OS #∞ (SUPER PROMPT #9)
// ═══════════════════════════════════════════════════════════════

pub mod conversation_os; // ✅ Conversation OS #∞ (Intent, Narrative, Persona, Style, Emotion, Safety)

// ═══════════════════════════════════════════════════════════════
// AGI CORE (SUPER PROMPT #11)
// ═══════════════════════════════════════════════════════════════

// TEMPORARILY COMMENTED: API incomplete (Phase 1 Stabilisation)
// pub mod agi_core; // ✅ AGI Core v30.0.0 (Introspection, Meta-Learning, Self-Model, Strategy, Evolution, Reasoning)

// ═══════════════════════════════════════════════════════════════
// CONSTITUTION (SUPER PROMPT #13)
// ═══════════════════════════════════════════════════════════════

pub mod constitution; // ✅ Constitution v∞ (Principles, Values, Limits, Rights, Governance, Enforcement, Evolution)

// ═══════════════════════════════════════════════════════════════
// API INTEGRATIONS HUB (SUPER PROMPT #17)
// ═══════════════════════════════════════════════════════════════

pub mod api_hub; // ✅ API Hub vΩ (OpenAI, Gemini, Anthropic, Router, Multimodal, Harmonizer, Safety)

// ═══════════════════════════════════════════════════════════════
// TEMPORAL INTELLIGENCE ENGINE v2 (SUPER PROMPT #18)
// ═══════════════════════════════════════════════════════════════

pub mod temporal_engine; // ✅ Temporal Engine v2 (Time Model, Memory, Routines, Planner, Anticipator, Alignment)

// ═══════════════════════════════════════════════════════════════
// AGENT SYSTEM vΩ (SUPER PROMPT #19)
// ═══════════════════════════════════════════════════════════════

pub mod agent_system; // ✅ Agent System vΩ (Multi-Agents, Roles, Capabilities, Supervisor, Sandbox, Collaboration)

// ═══════════════════════════════════════════════════════════════
// META-ENERGY ENGINE vΩ (SUPER PROMPT #20)
// ═══════════════════════════════════════════════════════════════

// TEMPORARILY COMMENTED: API incomplete (Phase 1 Stabilisation)
// pub mod meta_energy; // ✅ Meta-Energy Engine vΩ (Homéostasie, Énergie, Fatigue, Récupération, Load Balancing, Prédiction)

// ═══════════════════════════════════════════════════════════════
// RE-EXPORTS v15
// ═══════════════════════════════════════════════════════════════

pub use core::{EngineHealth, EngineMetrics, SingularityEngine, SingularityState};
pub use utils::{AppError, AppResult};
pub mod error_handling;

// ═══════════════════════════════════════════════════════════════
// ANDROID MOBILE ENTRY POINT (Phase 3 — Build Stub)
// Required by Tauri mobile: generates `start_app` JNI symbol in cdylib.
// On desktop, `fn main()` in main.rs is used instead.
// LOT-B1: Full command migration from main.rs builder pending.
// ═══════════════════════════════════════════════════════════════

/// Mobile entry point — annotated so the `tauri::mobile_entry_point` macro
/// generates the `start_app` symbol required by the Android Gradle build.
/// On Android, this function IS the app. Full command set migration: LOT-B1.
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let builder = tauri::Builder::default().on_page_load(|window, _payload| {
        #[cfg(all(not(feature = "mock"), feature = "full"))]
        {
            let candidate_probe_paths: Vec<std::path::PathBuf> = vec![
                std::path::PathBuf::from("/data/user/0/com.titane.infinity/files/probe_ollama_generate.flag"),
                std::path::PathBuf::from("/data/data/com.titane.infinity/files/probe_ollama_generate.flag"),
            ];

            let probe_flag_path: Option<std::path::PathBuf> = candidate_probe_paths
                .into_iter()
                .find_map(|path: std::path::PathBuf| if path.exists() { Some(path) } else { None });

            if let Some(probe_flag_path) = probe_flag_path {
                if let Err(err) = std::fs::remove_file(probe_flag_path.as_path()) {
                    log::warn!(
                        "[OLLAMA_PROBE] failed to clear mobile probe flag {}: {}",
                        probe_flag_path.display(),
                        err
                    );
                }

                let script = r#"
                    if (!window.__TITANE_OLLAMA_PROBE_SCHEDULED__) {
                        window.__TITANE_OLLAMA_PROBE_SCHEDULED__ = true;

                        const probeInvoke = async (marker) => {
                            try {
                                if (window.__TAURI_INTERNALS__?.invoke) {
                                    await window.__TAURI_INTERNALS__.invoke('boot_marker_log', { marker });
                                }
                            } catch (_) {
                                // ignore probe invoke failures
                            }
                        };

                        const sanitize = (value) =>
                            String(value ?? '')
                                .replace(/[|\n\r]/g, '_')
                                .slice(0, 160);

                        setTimeout(async () => {
                            try {
                                await probeInvoke('OLLAMA_PROBE_START');

                                if (!window.__TAURI_INTERNALS__?.invoke) {
                                    throw new Error('tauri-invoke-unavailable');
                                }

                                const result = await window.__TAURI_INTERNALS__.invoke('ollama_generate', {
                                    req: {
                                        model: 'llama3.1:latest',
                                        prompt: 'Reply with OK only.',
                                        timeout_secs: 20,
                                        temperature: 0,
                                        max_tokens: 8,
                                    },
                                });

                                await probeInvoke(
                                    `OLLAMA_PROBE_OK|model=${sanitize(result?.model)}|len=${sanitize(result?.content?.length ?? 0)}|latency_ms=${sanitize(result?.latency_ms ?? 0)}|done_reason=${sanitize(result?.done_reason ?? 'none')}`
                                );
                                console.info('[OLLAMA_PROBE_OK]', JSON.stringify(result));
                            } catch (error) {
                                const message = sanitize(error?.message ?? error);
                                await probeInvoke(`OLLAMA_PROBE_ERR|message=${message}`);
                                console.error('[OLLAMA_PROBE_ERR]', String(error));
                            }
                        }, 500);
                    }
                "#;

                if let Err(err) = window.eval(script) {
                    log::warn!("[OLLAMA_PROBE] mobile eval injection failed: {}", err);
                }
            }
        }
    });

    #[cfg(all(not(feature = "mock"), feature = "full"))]
    let builder = builder.invoke_handler(tauri::generate_handler![
        commands::ollama_command::ollama_generate,
        commands::orchestration_center::ping_ollama,
        commands::rag_commands::rag_generate_embedding,
        commands::rag_commands::rag_generate_embeddings,
        commands::web_search_commands::web_search,
        runtime_config::boot_marker_log,
    ]);

    builder.run(tauri::generate_context!()).unwrap_or_else(|e| {
        // I10: explicit error — no .expect() in production
        eprintln!("❌ TITANE∞ run error: {e:?}");
        std::process::exit(1);
    });
}
