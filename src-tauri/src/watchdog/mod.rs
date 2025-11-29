pub mod alerts;
pub mod commands;
pub mod fixer;
/**
 * TITANE∞ v17 - Watchdog Engine Module
 *
 * Moteur de surveillance et auto-réparation du système cognitif
 */
pub mod scanner;
pub mod selftest;

pub use alerts::{AlertLevel, WatchdogAlert};
pub use commands::*;
pub use fixer::{FixAction, FixResult, WatchdogFixer};
pub use scanner::{AnomalyType, ScanResult, WatchdogScanner};
pub use selftest::{watchdog_selftest, WatchdogSelfTestResult};
