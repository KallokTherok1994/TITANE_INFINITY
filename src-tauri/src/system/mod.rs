//! ═══════════════════════════════════════════════════════════════════════════════
//! TITANE∞ v20Ω — SYSTEM HEALTH & SELF-HEALING ENGINE vΩ
//! Super Prompt #4 + #17 — Monitoring Total • Auto-Healing • Sécurité • Résilience
//! ═══════════════════════════════════════════════════════════════════════════════

pub mod anomaly_detector;
pub mod healing_executor;
pub mod metrics_collector;
pub mod predictor;
pub mod repair_actions;
pub mod security_engine;
pub mod self_heal;
pub mod system_health;

pub use anomaly_detector::{AnomalyDetector, AnomalyLevel};
pub use healing_executor::{HealingExecutor, HealingState, SafeModeConfig};
pub use metrics_collector::MetricsCollector;
pub use predictor::{AnomalyPrediction, AnomalyPredictor, TrendDirection};
pub use repair_actions::{RepairAction, RepairResult};
pub use security_engine::SecurityEngine;
pub use self_heal::SelfHealEngine;
pub use system_health::{SystemHealth, SystemHealthEngine};
