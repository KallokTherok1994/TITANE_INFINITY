/**
 * Ring 3: Tauri Command Layer
 * Reads production CSV from temp dir (titane_production_week1.csv)
 * Parses metrics + applies thresholds
 * Returns ProductionHealthSummary
 */
use serde::{Deserialize, Serialize};
use std::fs;

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

const CSV_FILENAME: &str = "titane_production_week1.csv";
const MAX_CSV_SIZE: usize = 2 * 1024 * 1024;

const THRESHOLD_GREEN_MAX_MB: f64 = 213.0;
const THRESHOLD_RED_MIN_MB: f64 = 240.0;

fn csv_path() -> std::path::PathBuf {
    std::env::temp_dir().join(CSV_FILENAME)
}

#[tauri::command]
pub async fn read_production_week1_csv() -> Result<ProductionHealthSummary, String> {
    let path = csv_path();

    if !path.exists() {
        return Err(format!(
            "SOURCE_UNAVAILABLE: {} absent — aucune collecte de télémétrie active",
            path.display()
        ));
    }

    let content = fs::read_to_string(&path).map_err(|e| format!("Failed to read CSV: {}", e))?;

    if content.len() > MAX_CSV_SIZE {
        return Err("CSV file too large".to_string());
    }

    parse_and_summarize(&content)
}

fn parse_and_summarize(csv: &str) -> Result<ProductionHealthSummary, String> {
    // Strip UTF-8 BOM if present
    let csv = csv.strip_prefix('\u{feff}').unwrap_or(csv);

    let mut lines = csv.lines();
    let header_line = lines.next();

    // Detect delimiter mismatch: if header exists but uses ';' instead of ','
    if let Some(header) = header_line {
        let comma_count = header.matches(',').count();
        let semicolon_count = header.matches(';').count();
        if semicolon_count > comma_count && comma_count == 0 {
            return Err(format!(
                "SCHEMA_DRIFT: délimiteur inattendu ';' détecté dans l'en-tête CSV. Attendu: ','. En-tête: {}",
                &header[..header.len().min(120)]
            ));
        }
    }

    let data_lines: Vec<&str> = lines
        .filter(|line| !line.trim().is_empty() && !line.starts_with('#'))
        .collect();

    if data_lines.is_empty() {
        return Err("SOURCE_EMPTY: CSV sans données — en attente de collecte".to_string());
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
        return Err(format!(
            "PARSER_ERROR: ligne CSV invalide ({} colonnes, minimum 3 requis): {}",
            parts.len(),
            &line[..line.len().min(120)]
        ));
    }

    let timestamp = parts[0].trim().to_string();
    let rss_initial_mb = parts[1].trim().parse::<f64>().map_err(|e| {
        format!(
            "PARSER_ERROR: colonne rss_initial_mb (index 1) non numérique '{}': {}",
            parts[1].trim(),
            e
        )
    })?;
    let rss_current_mb = parts[2].trim().parse::<f64>().map_err(|e| {
        format!(
            "PARSER_ERROR: colonne rss_current_mb (index 2) non numérique '{}': {}",
            parts[2].trim(),
            e
        )
    })?;
    let vsz_mb = parts.get(3).and_then(|s| s.trim().parse::<f64>().ok());
    let cpu_percent = parts.get(4).and_then(|s| s.trim().parse::<f64>().ok());
    let session_count = parts.get(5).and_then(|s| s.trim().parse::<u32>().ok());
    let crash_count = parts.get(6).and_then(|s| s.trim().parse::<u32>().ok());
    let failover_count = parts.get(7).and_then(|s| s.trim().parse::<u32>().ok());
    let event_loop_lag_ms = parts.get(8).and_then(|s| s.trim().parse::<f64>().ok());
    let provider_timeouts_per_hour = parts.get(9).and_then(|s| s.trim().parse::<f64>().ok());
    let error_count = parts.get(10).and_then(|s| s.trim().parse::<u32>().ok());

    Ok(ProductionHealthSample {
        timestamp,
        rss_initial_mb,
        rss_current_mb,
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

#[cfg(test)]
mod tests {
    use super::*;

    fn make_line(timestamp: &str, rss_init: f64, rss_cur: f64) -> String {
        format!("{},{},{}", timestamp, rss_init, rss_cur)
    }

    // ─── parse_csv_line ────────────────────────────────────────────────────

    #[test]
    fn test_parse_valid_line() {
        let line = "2026-01-01T00:00:00Z,180.0,192.0,250.0,12.5,3,0,0,2.1,0.0,0";
        let sample = parse_csv_line(line).expect("should parse valid line");
        assert_eq!(sample.timestamp, "2026-01-01T00:00:00Z");
        assert!((sample.rss_initial_mb - 180.0).abs() < 0.01);
        assert!((sample.rss_current_mb - 192.0).abs() < 0.01);
        assert_eq!(sample.vsz_mb, Some(250.0));
        assert_eq!(sample.session_count, Some(3));
    }

    #[test]
    fn test_parse_minimal_line_three_columns() {
        let line = make_line("2026-01-01T00:00:00Z", 180.0, 190.0);
        let sample = parse_csv_line(&line).expect("should parse with 3 columns");
        assert!((sample.rss_initial_mb - 180.0).abs() < 0.01);
        assert!((sample.rss_current_mb - 190.0).abs() < 0.01);
        assert!(sample.vsz_mb.is_none());
    }

    #[test]
    fn test_parse_too_few_columns_returns_parser_error() {
        let err = parse_csv_line("2026-01-01T00:00:00Z,180.0").unwrap_err();
        assert!(
            err.starts_with("PARSER_ERROR"),
            "expected PARSER_ERROR prefix, got: {}",
            err
        );
    }

    #[test]
    fn test_parse_non_numeric_rss_returns_parser_error() {
        let err = parse_csv_line("2026-01-01T00:00:00Z,abc,192.0").unwrap_err();
        assert!(
            err.starts_with("PARSER_ERROR"),
            "expected PARSER_ERROR, got: {}",
            err
        );
    }

    #[test]
    fn test_parse_with_whitespace_trimmed() {
        let line = " 2026-01-01T00:00:00Z , 180.0 , 192.0 ";
        let sample = parse_csv_line(line).expect("should trim whitespace");
        assert!((sample.rss_initial_mb - 180.0).abs() < 0.01);
    }

    // ─── parse_and_summarize ──────────────────────────────────────────────

    #[test]
    fn test_summarize_valid_csv() {
        let csv = "timestamp,rss_initial_mb,rss_current_mb\n\
                   2026-01-01T00:00:00Z,180.0,185.0\n\
                   2026-01-02T00:00:00Z,180.0,192.0\n";
        let summary = parse_and_summarize(csv).expect("should summarize valid CSV");
        assert_eq!(summary.samples_collected, 2);
        assert!((summary.initial_rss_mb - 180.0).abs() < 0.01);
        assert!((summary.growth_mb - 12.0).abs() < 0.01);
        assert_eq!(summary.status, "GREEN");
    }

    #[test]
    fn test_summarize_empty_csv_returns_source_empty() {
        let csv = "timestamp,rss_initial_mb,rss_current_mb\n";
        let err = parse_and_summarize(csv).unwrap_err();
        assert!(
            err.starts_with("SOURCE_EMPTY"),
            "expected SOURCE_EMPTY, got: {}",
            err
        );
    }

    #[test]
    fn test_summarize_bom_stripped() {
        let csv = "\u{feff}timestamp,rss_initial_mb,rss_current_mb\n\
                   2026-01-01T00:00:00Z,180.0,192.0\n";
        let summary = parse_and_summarize(csv).expect("BOM should be stripped");
        assert_eq!(summary.samples_collected, 1);
    }

    #[test]
    fn test_summarize_semicolon_delimiter_returns_schema_drift() {
        let csv = "timestamp;rss_initial_mb;rss_current_mb\n\
                   2026-01-01T00:00:00Z;180.0;192.0\n";
        let err = parse_and_summarize(csv).unwrap_err();
        assert!(
            err.starts_with("SCHEMA_DRIFT"),
            "expected SCHEMA_DRIFT, got: {}",
            err
        );
    }

    #[test]
    fn test_summarize_comment_lines_ignored() {
        let csv = "timestamp,rss_initial_mb,rss_current_mb\n\
                   # this is a comment\n\
                   2026-01-01T00:00:00Z,180.0,192.0\n";
        let summary = parse_and_summarize(csv).expect("comment lines should be ignored");
        assert_eq!(summary.samples_collected, 1);
    }

    #[test]
    fn test_summarize_blank_lines_ignored() {
        let csv = "timestamp,rss_initial_mb,rss_current_mb\n\
                   \n\
                   2026-01-01T00:00:00Z,180.0,192.0\n\
                   \n";
        let summary = parse_and_summarize(csv).expect("blank lines should be ignored");
        assert_eq!(summary.samples_collected, 1);
    }

    #[test]
    fn test_compute_status_green() {
        assert_eq!(compute_status(200.0, 10.0), "GREEN");
    }

    #[test]
    fn test_compute_status_yellow_by_rss() {
        assert_eq!(compute_status(220.0, 5.0), "YELLOW");
    }

    #[test]
    fn test_compute_status_yellow_by_growth() {
        assert_eq!(compute_status(200.0, 25.0), "YELLOW");
    }

    #[test]
    fn test_compute_status_red() {
        assert_eq!(compute_status(250.0, 5.0), "RED");
    }
}
