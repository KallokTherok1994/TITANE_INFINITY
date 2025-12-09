//! ═══════════════════════════════════════════════════════════════════════════════
//! TITANE∞ v20Ω — SYSTEM HEALTH & SELF-HEALING ENGINE vΩ
//! Super Prompt #4 + #17 — Monitoring Total • Auto-Healing • Sécurité • Résilience
//! ═══════════════════════════════════════════════════════════════════════════════

pub mod system_health;
pub mod self_heal;
pub mod anomaly_detector;
pub mod metrics_collector;
pub mod repair_actions;
pub mod security_engine;
pub mod predictor;
pub mod healing_executor;

pub use system_health::{SystemHealth, SystemHealthEngine};
pub use self_heal::SelfHealEngine;
pub use anomaly_detector::{AnomalyDetector, AnomalyLevel};
pub use metrics_collector::MetricsCollector;
pub use repair_actions::{RepairAction, RepairResult};
pub use security_engine::SecurityEngine;
pub use predictor::{AnomalyPredictor, AnomalyPrediction, TrendDirection};
pub use healing_executor::{HealingExecutor, HealingState, SafeModeConfig};
