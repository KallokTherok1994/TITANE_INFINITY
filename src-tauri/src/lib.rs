//! ═══════════════════════════════════════════════════════════════
//!   TITANE∞ v16 — LIB CONFIGURATION
//!   Unified backend architecture - v15 Core + v16 Cognitive
//! ═══════════════════════════════════════════════════════════════

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

// ═══════════════════════════════════════════════════════════════
// CORE MODULES v16 (Always Active)
// ═══════════════════════════════════════════════════════════════

pub mod adaptive; // ✅ AdaptiveEngine v21 (NEW)
pub mod avatar; // ✅ ImmersiveAvatarEngine v23 (NEW)
pub mod backend_selftest; // ✅ Backend Global Self-Test v17.7 (NEW)
pub mod cognitive; // ✅ Cognitive Layer v16 (NEW)
pub mod core; // ✅ SingularityEngine v16 + modules
pub mod engine; // ✅ Auto-Evolution & Engine Diagnostics v16 (existing)
pub mod engine_trait; // ✅ v24 - Engine trait + OrchestratorEngine (TODO #13)
pub mod error; // ✅ v24 - Unified TitaneError enum (TODO #12)
pub mod meta; // ✅ Meta-Cognition & Deep Sync v18 (NEW)
pub mod narrative; // ✅ NarrativeEngine v22 (NEW)
pub mod qa; // ✅ QA Engine v19.8 (NEW)
pub mod shared; // ✅ Shared types and utilities
pub mod singularity; // ✅ SingularityState v∞ v20 (NEW)
pub mod singularity_fusion;
pub mod types; // ✅ Type definitions
pub mod utils; // ✅ Utilities (AppResult, AppError)
pub mod watchdog; // ✅ Watchdog Engine v17 (NEW) // ✅ SingularityFusion vΩ (NEW)

// ═══════════════════════════════════════════════════════════════
// AI & MEMORY v15
// ═══════════════════════════════════════════════════════════════

pub mod ai; // ✅ AI Router (v15 migration in progress)
pub mod ai_chat; // ✅ AI Chat & Training Mode v∞ (OPUS #12)
#[cfg(all(not(feature = "mock"), feature = "full"))]
pub mod chat_engine; // ✅ High-performance Chat Engine v∞
pub mod conversation_engine; // ✅ Conversation Engine v∞ (Unified Pipeline, Memory Map, Self-Healing)
pub mod ia; // ✅ v∞.19.3Ω: Unified IA Engine (OpenAI + Claude + Gemini + Local)
pub mod memory; // ✅ Memory Storage v15
pub mod multi_agents; // ✅ v∞.19.3Ω: Multi-Agents avec permissions IA (NEW)

// ═══════════════════════════════════════════════════════════════
// PRODUCTION MODULES (Active)
// ═══════════════════════════════════════════════════════════════

pub mod control_panel_commands; // ✅ Control Panel
pub mod harmonia_engine; // ✅ Harmonia CPU monitoring
pub mod memory_compactor; // ✅ Memory compaction
pub mod memory_persistence; // ✅ Memory persistence
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
pub mod creation; // ✅ Mode Création
pub mod evolution; // ✅ Auto-Évolution
pub mod hypervision; // ✅ HyperVision
pub mod introspection; // ✅ Introspection
pub mod knowledge; // ✅ Knowledge Fusion

// ═══════════════════════════════════════════════════════════════
// SYSTEM CENTER MODULE v∞ (Unified Observability)
// ═══════════════════════════════════════════════════════════════

pub mod system_center; // ✅ Centre Système Unifié (Diagnostics, DevTools, Cluster, Introspection, HyperVision)

// ═══════════════════════════════════════════════════════════════
// DESIGN CENTER MODULE v16 (Unified Design & Appearance)
// ═══════════════════════════════════════════════════════════════

pub mod design_center; // ✅ Centre Design & Apparence Unifié (Design System Monochrome v16, Tokens Dynamiques)

// ═══════════════════════════════════════════════════════════════
// PHASES V-Ω MODULES (Active)
// ═══════════════════════════════════════════════════════════════

pub mod cognitive_learning; // ✅ Auto-Apprentissage
pub mod hyper_evolution; // ✅ HyperEvolution
pub mod meta_creation; // ✅ Méta-Création
pub mod neuro_symbolic; // ✅ NeuroSymbolic
pub mod self_repair; // ✅ Auto-Réparation
                     // pub mod singularity;        // ⚠️ Deprecated - Use top-level singularity v∞ (v20)

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

pub mod memory_evolution; // ✅ Memory Evolution Engine++ v∞ (Parser, Synthesizer, Clusterer, Vectorizer, Compressor, Patterns, Stability, Growth)

// ═══════════════════════════════════════════════════════════════
// SYSTEM IDENTITY ENGINE v∞ (OPUS #15)
// ═══════════════════════════════════════════════════════════════

pub mod identity; // ✅ System Identity Engine v∞ (Matrix, Voice, Tone, Mode, Rules, Personality)

// ═══════════════════════════════════════════════════════════════
// META ORCHESTRATOR ENGINE v∞ (OPUS #18)
// ═══════════════════════════════════════════════════════════════

pub mod meta_orchestrator; // ✅ Meta Orchestrator v∞ (Awareness, Resources, Priority Scheduler)

// ═══════════════════════════════════════════════════════════════
// REALITY RENDERING LAYER v∞ (OPUS #19)
// ═══════════════════════════════════════════════════════════════

pub mod reality_renderer; // ✅ Reality Renderer v∞ (Scene, Physics, Lighting, Spatial)

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

#[cfg(all(not(feature = "mock"), feature = "full"))]
pub mod commands;

#[cfg(all(not(feature = "mock"), feature = "full"))]
pub mod api;

#[cfg(all(not(feature = "mock"), feature = "full"))]
pub mod compat;

#[cfg(all(not(feature = "mock"), feature = "full"))]
pub mod modules;

#[cfg(all(not(feature = "mock"), feature = "full"))]
pub mod audio;

#[cfg(all(not(feature = "mock"), feature = "full"))]
pub mod tts;

#[cfg(all(not(feature = "mock"), feature = "full"))]
pub mod engine;

#[cfg(all(not(feature = "mock"), feature = "full"))]
pub mod overdrive;

#[cfg(all(not(feature = "mock"), feature = "full"))]
pub mod cognitive;

#[cfg(all(not(feature = "mock"), feature = "full"))]
pub mod system;

#[cfg(all(not(feature = "mock"), feature = "full"))]
pub mod devtools;

#[cfg(all(not(feature = "mock"), feature = "full"))]
pub mod services;

// ═══════════════════════════════════════════════════════════════
// RE-EXPORTS v15
// ═══════════════════════════════════════════════════════════════

pub use core::{EngineHealth, EngineMetrics, SingularityEngine, SingularityState};
pub use utils::{AppError, AppResult};
