//! ═══════════════════════════════════════════════════════════════
//!   TITANE∞ v14 — LIB CONFIGURATION
//!   Unified backend architecture with progressive activation
//! ═══════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════
// CORE MODULES (Always Active)
// ═══════════════════════════════════════════════════════════════

pub mod core;
pub mod shared; // ✅ Shared types and utilities
pub mod types; // ✅ Type definitions
pub mod utils; // ✅ Utilities (AppResult, AppError) // ✅ Core system (SingularityEngine v14)

// ═══════════════════════════════════════════════════════════════
// BACKEND MODE SELECTION
// ═══════════════════════════════════════════════════════════════

// MOCK MODE (default for frontend-only development)
#[cfg(feature = "mock")]
pub mod mock_commands; // ✅ Mock commands for frontend development

// FULL MODE (production backend with real implementations)
// TODO Phase 3-7: Réactiver après migration v14 complète
#[cfg(all(not(feature = "mock"), feature = "full"))]
#[allow(dead_code)]
pub mod commands; // ⏳ DISABLED: Needs v14 migration (depends on non-existent modules)

#[cfg(all(not(feature = "mock"), feature = "full"))]
#[allow(dead_code)]
pub mod api; // ⏳ DISABLED: Depends on commands/ migration

#[cfg(all(not(feature = "mock"), feature = "full"))]
#[allow(dead_code)]
pub mod compat; // ⏳ DISABLED: Will be activated with full backend

// ═══════════════════════════════════════════════════════════════
// PRODUCTION MODULES (Active in both modes)
// ═══════════════════════════════════════════════════════════════

pub mod ai; // ✅ v∞.C AI module with analyze_file
pub mod control_panel_commands; // ✅ v19.1.0 Control Panel commands
pub mod harmonia_engine;
pub mod memory_compactor; // ✅ v14 Phase 4: Memory Compactor
pub mod memory_persistence; // ✅ v∞.C Memory persistence + classification
pub mod secure_commands; // ✅ v∞ Secure commands with permissions
pub mod security; // ✅ v∞ Super-Prompts H, J, K, L
pub mod system_state; // ✅ v∞.A MinimalState structure
pub mod time; // ✅ v∞ Super-Prompt N (Time-Travel + Backups)
pub mod time_commands; // ✅ v∞ Time-Travel commands for TimeNavigator
pub mod updates; // ✅ v∞ Super-Prompt L (Update Engine) // ✅ v14 Phase 5: Harmonia Engine (CPU Monitoring)

// ═══════════════════════════════════════════════════════════════
// PHASES 5-10 MODULES (Super-Prompts P-U)
// ═══════════════════════════════════════════════════════════════
pub mod cluster; // ✅ Phase 5: Node-Cluster (Super-Prompt P)
pub mod creation; // ✅ Phase 8: Mode Création (Super-Prompt S)
pub mod evolution;
pub mod hypervision; // ✅ Phase 7: HyperVision (Super-Prompt R)
pub mod introspection; // ✅ Phase 9: Introspection (Super-Prompt T)
pub mod knowledge; // ✅ Phase 6: Knowledge Fusion (Super-Prompt Q) // ✅ Phase 10: Auto-Évolution (Super-Prompt U)

// ═══════════════════════════════════════════════════════════════
// PHASES V-Ω MODULES (Super-Prompts V-Ω) — TITANE∞ v∞ ULTIMATE
// ═══════════════════════════════════════════════════════════════
pub mod cognitive_learning; // ✅ Phase W: Auto-Apprentissage Cognitif
pub mod hyper_evolution; // ✅ Phase V: HyperEvolution Engine
pub mod meta_creation; // ✅ Phase Y: Méta-Création
pub mod neuro_symbolic; // ✅ Phase X: NeuroSymbolic Fusion
pub mod self_repair; // ✅ Phase Z: Auto-Réparation Totale
pub mod singularity; // ✅ Phase Ω: Singularity Engine

// ═══════════════════════════════════════════════════════════════
// LEGACY MODULES (Progressively migrating to v14)
// ═══════════════════════════════════════════════════════════════

// Memory system (v12 stable, will sync with v14 MemoryModule)
#[allow(dead_code)]
pub mod memory; // ⏳ v12 Memory (encryption, storage) - migrating to v14

// Module engines (v12, will be replaced by core::modules in v14)
#[cfg(all(not(feature = "mock"), feature = "full"))]
#[allow(dead_code)]
pub mod modules; // ⏳ v12 modules (Helios, Nexus, etc.) - use core::legacy adapters

// Audio/TTS/ASR (v12 stable, will integrate with v14 voice system)
#[cfg(all(not(feature = "mock"), feature = "full"))]
#[allow(dead_code)]
pub mod audio; // ⏳ v12 Audio (recorder, VAD, ASR)
#[cfg(all(not(feature = "mock"), feature = "full"))]
#[allow(dead_code)]
pub mod tts; // ⏳ v12 TTS (local + online)

// Advanced engines (v12, will integrate with v14 SingularityEngine)
#[cfg(all(not(feature = "mock"), feature = "full"))]
#[allow(dead_code)]
pub mod engine; // ⏳ v12 Engines (ExpFusion, MetaMode) - migrating to v14

#[cfg(all(not(feature = "mock"), feature = "full"))]
#[allow(dead_code)]
pub mod overdrive; // ⏳ v16 Overdrive (Chat, Voice, Auto-Heal) - conflicts with mock_commands

// Cognitive system (v12, will use v14 cognitive modules)
#[cfg(all(not(feature = "mock"), feature = "full"))]
#[allow(dead_code)]
pub mod cognitive; // ⏳ v12 Cognitive (KevinState) - migrating to v14

// System persona (v12, will integrate with v14 identity system)
#[cfg(all(not(feature = "mock"), feature = "full"))]
#[allow(dead_code)]
pub mod system; // ⏳ v12 System (Persona) - migrating to v14

// DevTools (v12, will use v14 monitoring)
#[cfg(all(not(feature = "mock"), feature = "full"))]
#[allow(dead_code)]
pub mod devtools; // ⏳ v12 DevTools - migrating to v14

// Old singularity state (deprecated, use core::state::SingularityState)
#[cfg(all(not(feature = "mock"), feature = "full"))]
#[allow(dead_code)]
pub mod singularity_state; // ❌ DEPRECATED: Use core::state::SingularityState (conflicts with mock)

// Services (v12, need audit)
#[cfg(all(not(feature = "mock"), feature = "full"))]
#[allow(dead_code)]
pub mod services; // ⏳ v12 Services - need audit

// ═══════════════════════════════════════════════════════════════
// RE-EXPORTS
// ═══════════════════════════════════════════════════════════════

pub use core::{EngineHealth, EngineMetrics, SingularityEngine, SingularityState};
pub use utils::{AppError, AppResult};

// Shared types for Tauri state management
// TODO Phase 2-3: Redefine TitaneCore for v14 or use SingularityEngine directly
// pub use shared::types::TitaneCore;
