// ═══════════════════════════════════════════════════════════════
// TITANE∞ — META-ENERGY ENGINE vΩ (Super Prompt #20)
// V32 Phase 9 — Homéostasie, Énergie Cognitive, Fatigue, Récupération
// ═══════════════════════════════════════════════════════════════

pub mod commands;
pub mod config;
pub mod energy_model;
pub mod fatigue_engine;
pub mod homeostasis;
pub mod load_balancer;
pub mod predictor;
pub mod recovery_engine;

pub use commands::MetaEnergyState;
pub use config::MetaEnergyConfig;
pub use energy_model::{EnergySnapshot, EnergyState};
pub use fatigue_engine::{FatigueEngine, FatigueLevel};
pub use homeostasis::{HomeoBalance, HomeostasisController};
pub use load_balancer::{LoadBalance, LoadBalancer};
pub use predictor::{EnergyForecast, EnergyPredictor};
pub use recovery_engine::{RecoveryEngine, RecoveryPlan};
