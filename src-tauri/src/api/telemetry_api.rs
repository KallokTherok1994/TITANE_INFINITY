/**
 * Ring 3: Tauri Command Layer
 * Reads production CSV at /tmp/titane_production_week1.csv
 * Parses metrics + applies thresholds
 * Returns ProductionHealthSummary
 */

use serde::{Deserialize, Serialize};
use std::fs;
use std::path::Path;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ProductionHealthSample {
    pub timestamp: String,
    pub rss_initial_mb: f64,
    pub rss_current_mb: f64,
    pub vsz_mb: Option<f64>,
    pub cpu_percent: Option<f64>,
    pub session_count: Option<u32>,
    pub crash_count: Option<u32>,
    pub failover_count: Option<u32>,
    pub event_loop_lag_ms: Option<f64>,
    pub provider_timeouts_per_hour: Option<f64>,
    pub error_count: Option<u32>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ProductionHealthSummary {
    pub status: String,
    pub window_start_iso: String,
    pub window_end_iso: String,
    pub initial_rss_mb: f64,
    pub growth_mb: f64,
    pub growth_percent: f64,
    pub last_sample: ProductionHealthSample,
    pub samples_collected: usize,
    pub notes: Option<String>,
}

const CSV_PATH: &str = "/tmp/titane_production_week1.csv";
const MAX_CSV_SIZE: usize = 2 * 1024 * 1024;

const THRESHOLD_GREEN_MAX_MB: f64 = 213.0;
const THRESHOLD_RED_MIN_MB: f64 = 240.0;

#[tauri::command]
pub async fn read_production_week1_csv() -> Result<ProductionHealthSummary, String> {
    let csv_path = Path::new(CSV_PATH);

    if !csv_path.exists() {
        return Ok(ProductionHealthSummary {
            status: "UNKNOWN".to_string(),
            window_start_iso: chrono::Utc::now().to_rfc3339(),
            window_end_iso: chrono::Utc::now().to_rfc3339(),
            initial_rss_mb: 0.0,
            growth_mb: 0.0,
            growth_percent: 0.0,
            last_sample: ProductionHealthSample {
                timestamp: chrono::Utc::now().to_rfc3339(),
                rss_initial_mb: 0.0,
                rss_current_mb: 0.0,
                vsz_mb: None,
                cpu_percent: None,
                session_count: None,
                crash_count: None,
                failover_count: None,
                event_loop_lag_ms: None,
                provider_timeouts_per_hour: None,
                error_count: None,
            },
            samples_collected: 0,
            notes: Some("Waiting for observation data...".to_string()),
        });
    }

    let content = fs::read_to_string(csv_path)
        .map_err(|e| format!("Failed to read CSV: {}", e))?;

    if content.len() > MAX_CSV_SIZE {
        return Err("CSV file too large".to_string());
    }

    parse_and_summarize(&content)
}

fn parse_and_summarize(csv: &str) -> Result<ProductionHealthSummary, String> {
    let mut lines = csv.lines();
    let _header = lines.next();

    let data_lines: Vec<&str> = lines
        .filter(|line| !line.trim().is_empty())
        .collect();

    if data_lines.is_empty() {
        return Err("CSV is empty".to_string());
    }

    if data_lines.len() < 2 {
        return Ok(ProductionHealthSummary {
            status: "UNKNOWN".to_string(),
            window_start_iso: chrono::Utc::now().to_rfc3339(),
            window_end_iso: chrono::Utc::now().to_rfc3339(),
            initial_rss_mb: 0.0,
            growth_mb: 0.0,
            growth_percent: 0.0,
            last_sample: ProductionHealthSample {
                timestamp: chrono::Utc::now().to_rfc3339(),
                rss_initial_mb: 0.0,
                rss_current_mb: 0.0,
                vsz_mb: None,
                cpu_percent: None,
                session_count: None,
                crash_count: None,
                failover_count: None,
                event_loop_lag_ms: None,
                provider_timeouts_per_hour: None,
                error_count: None,
            },
            samples_collected: 0,
            notes: Some("No data samples yet".to_string()),
        });
    }

    let first_data_line = data_lines[0];
    let last_data_line = data_lines[data_lines.len() - 1];

    let first_sample = parse_csv_line(first_data_line)?;
    let last_sample = parse_csv_line(last_data_line)?;

    let initial_rss = first_sample.rss_initial_mb;
    let current_rss = last_sample.rss_current_mb;
    let growth_mb = current_rss - initial_rss;
    let growth_percent = if initial_rss > 0.0 {
        (growth_mb / initial_rss) * 100.0
    } else {
        0.0
    };

    let status = compute_status(current_rss, growth_percent);

    Ok(ProductionHealthSummary {
        status: status.to_string(),
        window_start_iso: first_sample.timestamp.clone(),
        window_end_iso: last_sample.timestamp.clone(),
        initial_rss_mb: initial_rss,
        growth_mb,
        growth_percent,
        last_sample: last_sample.clone(),
        samples_collected: data_lines.len(),
        notes: None,
    })
}

fn parse_csv_line(line: &str) -> Result<ProductionHealthSample, String> {
    let parts: Vec<&str> = line.split(',').collect();

    if parts.len() < 3 {
        return Err(format!("Invalid CSV line: {}", line));
    }

    let timestamp = parts[0].to_string();
    let rss_mb = parts[2].parse::<f64>().unwrap_or(0.0);
    let vsz_mb = parts.get(3).and_then(|s| s.parse::<f64>().ok());
    let cpu_percent = parts.get(4).and_then(|s| s.parse::<f64>().ok());
    let session_count = parts.get(5).and_then(|s| s.parse::<u32>().ok());
    let crash_count = parts.get(6).and_then(|s| s.parse::<u32>().ok());
    let failover_count = parts.get(7).and_then(|s| s.parse::<u32>().ok());
    let event_loop_lag_ms = parts.get(8).and_then(|s| s.parse::<f64>().ok());
    let provider_timeouts_per_hour = parts.get(9).and_then(|s| s.parse::<f64>().ok());
    let error_count = parts.get(10).and_then(|s| s.parse::<u32>().ok());

    Ok(ProductionHealthSample {
        timestamp,
        rss_initial_mb: rss_mb,
        rss_current_mb: rss_mb,
        vsz_mb,
        cpu_percent,
        session_count,
        crash_count,
        failover_count,
        event_loop_lag_ms,
        provider_timeouts_per_hour,
        error_count,
    })
}

fn compute_status(rss_mb: f64, growth_percent: f64) -> &'static str {
    if rss_mb >= THRESHOLD_RED_MIN_MB {
        "RED"
    } else if rss_mb >= THRESHOLD_GREEN_MAX_MB || growth_percent >= 22.0 {
        "YELLOW"
    } else {
        "GREEN"
    }
}
