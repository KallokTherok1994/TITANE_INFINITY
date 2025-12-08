//! ═══════════════════════════════════════════════════════════════════════════════
//! TITANE∞ v20Ω — SYSTEM HEALTH & SELF-HEALING ENGINE vΩ
//! Super Prompt #17 — Monitoring Total • Auto-Healing • Sécurité • Résilience
//! ═══════════════════════════════════════════════════════════════════════════════

pub mod system_health;
pub mod self_heal;
pub mod anomaly_detector;
pub mod metrics_collector;
pub mod repair_actions;
pub mod security_engine;

pub use system_health::{SystemHealth, SystemHealthEngine};
pub use self_heal::SelfHealEngine;
pub use anomaly_detector::AnomalyDetector;
pub use metrics_collector::MetricsCollector;
pub use repair_actions::RepairAction;
pub use security_engine::SecurityEngine;
