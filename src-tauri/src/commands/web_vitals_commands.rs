// ═══════════════════════════════════════════════════════════════
// TITANE∞ — WEB VITALS REPORT COMMAND
// Reçoit les métriques Web Vitals du frontend via IPC sécurisé
// ═══════════════════════════════════════════════════════════════

use chrono::Utc;
use serde::{Deserialize, Serialize};
use std::fs::OpenOptions;
use std::io::Write;
use tauri::command;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WebVitalsMetrics {
    pub lcp: f64,
    pub cls: f64,
    pub fcp: f64,
    pub ttfb: f64,
    pub inp: f64,
    pub timestamp: i64,
    pub url: String,
    pub user_agent: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WebVitalsReportArgs {
    pub metrics: WebVitalsMetrics,
}

#[command]
pub async fn web_vitals_report(args: WebVitalsReportArgs) -> Result<String, String> {
    // Validation simple (peut être enrichie)
    if args.metrics.lcp < 0.0 || args.metrics.cls < 0.0 {
        return Err("Invalid metrics values".into());
    }
    // Log dans un fichier dédié (append)
    let log_path = "data/web_vitals_report.jsonl";
    let entry = serde_json::to_string(&args.metrics).map_err(|e| e.to_string())?;
    let mut file = OpenOptions::new()
        .create(true)
        .append(true)
        .open(log_path)
        .map_err(|e| format!("Failed to open log: {}", e))?;
    writeln!(file, "{}", entry).map_err(|e| format!("Failed to write log: {}", e))?;
    Ok(format!(
        "WebVitals report reçu à {}",
        Utc::now().to_rfc3339()
    ))
}
