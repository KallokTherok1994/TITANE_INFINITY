// TITANE∞ v8.0 - System Modules
// Exports all system modules

// ✅ MODULES ESSENTIELS FONCTIONNELS
pub mod adaptive_engine;
pub mod harmonia;
pub mod helios;
pub mod memory;
pub mod nexus;
pub mod self_heal;
pub mod sentinel;
pub mod watchdog;

// ⚠️ MODULES TEMPORAIREMENT DÉSACTIVÉS - Correction en cours v11.0
// pub mod memory_v2;
// pub mod resonance;
// pub mod cortex;
// pub mod senses;
// pub mod ans;
// pub mod swarm;
// pub mod field;
// pub mod continuum;
// pub mod cortex_sync;
// pub mod kernel;
// pub mod secureflow;
// pub mod lowflow;
// pub mod stability;
// pub mod integrity;
// pub mod balance;
// pub mod pulse;
// pub mod flowsync;
// pub mod harmonic;
// pub mod deepsense;
// pub mod deepalignment;
// pub mod vitalcore;
// pub mod neurofield;
// pub mod neuromesh;
// pub mod coremesh;
// pub mod metacortex;
// pub mod governor;
// pub mod conscience;
// pub mod adaptive;
// pub mod evolution;
// pub mod sentient;
// pub mod harmonic_brain;
// pub mod meta_integration;
// pub mod architecture;
// pub mod central_governor;
// pub mod executive_flow;
// pub mod strategic_intelligence;
// pub mod intention;
// pub mod action_potential;

// ⚠️ AUTRES MODULES DÉSACTIVÉS v11.0
// pub mod dashboard;
// pub mod self_healing_v2;
// pub mod energetic;
// pub mod resonance_v2;
// pub mod meaning;
// pub mod identity;
// pub mod self_alignment;
// pub mod taskflow;
// pub mod mission;
// pub mod adaptive_intelligence;
// pub mod autonomic_evolution;
// pub mod vitality;
// pub mod harmonic_flow;
// pub mod inner_dynamics;
// pub mod dse;
// pub mod hao;
// pub mod scm;
// pub mod paefe;
// pub mod isce;
// pub mod gpmae;
// pub mod mmce;
// pub mod msie;
// pub mod ifdwe;
// pub mod iaee;
// pub mod seile;
// pub mod iscie;
// pub mod ghre;
// pub mod imore;
// pub mod idcm;
// pub mod iisse;
// pub mod stie;
// ═══════════════════════════════════════════════════════════════════════════════
// FINAL EVOLUTION LAYER — Modules #80-84 (v8.1.3)
// pub mod septfe;  // MODULE #80 — SELF-EVOLUTION PATHWAY & TRAJECTORY FORMATION ENGINE (SEPTFE)
// pub mod mesare;  // MODULE #81 — META-EVOLUTION SCORE & ASCENSION READINESS ENGINE (MESARE)
// pub mod geoe;    // MODULE #82 — GLOBAL EVOLUTION ORCHESTRATION ENGINE (GEOE)
// pub mod vefpe;   // MODULE #83 — VISIONARY EVOLUTION & FUTURE-PROJECTION ENGINE (VEFPE)
// pub mod iedcae;  // MODULE #84 — INTERNAL ECOSYSTEM DYNAMICS & CONTEXTUAL AWARENESS ENGINE (IEDCAE)

// ⚠️ DÉSACTIVÉ v11.0 - Les modules utilisent maintenant leurs propres méthodes .tick() et .health()
// Le trait ModuleTrait n'est plus nécessaire car chaque module implémente directement ses méthodes
// impl ModuleTrait for helios::HeliosState {
//     fn tick(&mut self) -> TitaneResult<()> {
//         helios::tick(self)
//     }
//     fn health(&self) -> ModuleHealth {
//         helios::health(self)
//     }
// }
// impl ModuleTrait for nexus::NexusState {
//     fn tick(&mut self) -> TitaneResult<()> {
//         nexus::tick(self)
//     }
//     fn health(&self) -> ModuleHealth {
//         nexus::health(self)
//     }
// }
// impl ModuleTrait for harmonia::HarmoniaState {
//     fn tick(&mut self) -> TitaneResult<()> {
//         harmonia::tick(self)
//     }
//     fn health(&self) -> ModuleHealth {
//         harmonia::health(self)
//     }
// }
// impl ModuleTrait for sentinel::SentinelState {
//     fn tick(&mut self) -> TitaneResult<()> {
//         sentinel::tick(self)
//     }
//     fn health(&self) -> ModuleHealth {
//         sentinel::health(self)
//     }
// }
// impl ModuleTrait for watchdog::WatchdogState {
//     fn tick(&mut self) -> TitaneResult<()> {
//         watchdog::tick(self)
//     }
//     fn health(&self) -> ModuleHealth {
//         watchdog::health(self)
//     }
// }
// impl ModuleTrait for self_heal::SelfHealState {
//     fn tick(&mut self) -> TitaneResult<()> {
//         self_heal::tick(self)
//     }
//     fn health(&self) -> ModuleHealth {
//         self_heal::health(self)
//     }
// }
// impl ModuleTrait for adaptive_engine::AdaptiveEngineState {
//     fn tick(&mut self) -> TitaneResult<()> {
//         adaptive_engine::tick(self)
//     }
//     fn health(&self) -> ModuleHealth {
//         adaptive_engine::health(self)
//     }
// }
// impl ModuleTrait for memory::MemoryState {
//     fn tick(&mut self) -> TitaneResult<()> {
//         memory::tick(self)
//     }
//     fn health(&self) -> ModuleHealth {
//         memory::health(self)
//     }
// }
// ⚠️ DÉSACTIVÉ v11.0 - memory_v2 module disabled
// impl ModuleTrait for memory_v2::MemoryModule {
//     fn tick(&mut self) -> TitaneResult<()> {
//         self.tick()
//     }
//     fn health(&self) -> ModuleHealth {
//         ModuleHealth {
//             module_name: "MemoryV2".to_string(),
//             status: "active".to_string(),
//             uptime: 0,
//             last_error: None,
//         }
//     }
// }
// Modules used directly in main.rs - no pub use needed (already imported as system::module_name)
