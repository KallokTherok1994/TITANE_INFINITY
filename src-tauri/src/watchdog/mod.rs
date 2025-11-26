/**
 * TITANE∞ v17 - Watchdog Engine Module
 *
 * Moteur de surveillance et auto-réparation du système cognitif
 */
pub mod scanner;
pub mod fixer;
pub mod alerts;
pub mod selftest;
pub mod commands;

pub use scanner::{WatchdogScanner, ScanResult, AnomalyType};
pub use fixer::{WatchdogFixer, FixResult, FixAction};
pub use alerts::{WatchdogAlert, AlertLevel};
pub use selftest::{watchdog_selftest, WatchdogSelfTestResult};
pub use commands::*;
