// ═══════════════════════════════════════════════════════════════
// TITANE∞ — META-ENERGY ENGINE vΩ (Super Prompt #20)
// V32 Phase 9 — Homéostasie, Énergie Cognitive, Fatigue, Récupération
// ═══════════════════════════════════════════════════════════════

pub mod config;
pub mod energy_model;
pub mod fatigue_engine;
pub mod recovery_engine;
pub mod load_balancer;
pub mod homeostasis;
pub mod predictor;
pub mod commands;

pub use config::MetaEnergyConfig;
pub use energy_model::{EnergyState, EnergySnapshot};
pub use fatigue_engine::{FatigueLevel, FatigueEngine};
pub use recovery_engine::{RecoveryPlan, RecoveryEngine};
pub use load_balancer::{LoadBalance, LoadBalancer};
pub use homeostasis::{HomeostasisController, HomeoBalance};
pub use predictor::{EnergyPredictor, EnergyForecast};
pub use commands::MetaEnergyState;
