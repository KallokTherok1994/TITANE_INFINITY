// TITANE∞ v16 - Analysis Engine
// Intelligent scanning and anomaly detection

use serde::{Deserialize, Serialize};

/// Analysis result v16
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AnalysisResult {
    pub anomalies_detected: u32,
    pub patterns_found: Vec<String>,
    pub confidence_score: f32,
    pub timestamp: u64,
}

/// Analysis Engine v16 - Pattern detection and scanning
pub struct AnalysisEngine {
    scan_count: u64,
}

impl AnalysisEngine {
    pub fn new() -> Self {
        log::info!("[Analysis v16] Initializing AnalysisEngine");
        Self { scan_count: 0 }
    }

    /// Scan system for patterns and anomalies
    pub fn scan(&mut self, data: &str) -> AnalysisResult {
        self.scan_count += 1;

        log::debug!(
            "[Analysis v16] Scan #{}: {} bytes",
            self.scan_count,
            data.len()
        );

        // Detect patterns (simplified)
        let mut patterns = vec![];
        if data.contains("error") || data.contains("ERROR") {
            patterns.push("error_pattern".to_string());
        }
        if data.contains("warning") || data.contains("WARNING") {
            patterns.push("warning_pattern".to_string());
        }

        let anomalies = patterns.len() as u32;
        let confidence = if anomalies == 0 { 0.95 } else { 0.75 };

        AnalysisResult {
            anomalies_detected: anomalies,
            patterns_found: patterns,
            confidence_score: confidence,
            timestamp: std::time::SystemTime::now()
                .duration_since(std::time::SystemTime::UNIX_EPOCH)
                .map(|d| d.as_secs())
                .unwrap_or(0), // Fallback to epoch if system time is invalid
        }
    }

    /// Get scan count
    pub fn scan_count(&self) -> u64 {
        self.scan_count
    }
}

impl Default for AnalysisEngine {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_analysis_engine_new() {
        let engine = AnalysisEngine::new();
        assert_eq!(engine.scan_count(), 0);
    }

    #[test]
    fn test_analysis_engine_default() {
        let engine = AnalysisEngine::default();
        assert_eq!(engine.scan_count(), 0);
    }

    #[test]
    fn test_scan_increments_count() {
        let mut engine = AnalysisEngine::new();
        engine.scan("test data");
        assert_eq!(engine.scan_count(), 1);

        engine.scan("more data");
        assert_eq!(engine.scan_count(), 2);
    }

    #[test]
    fn test_scan_detects_error_pattern() {
        let mut engine = AnalysisEngine::new();
        let result = engine.scan("This has an error in it");

        assert_eq!(result.anomalies_detected, 1);
        assert!(result.patterns_found.contains(&"error_pattern".to_string()));
    }

    #[test]
    fn test_scan_detects_warning_pattern() {
        let mut engine = AnalysisEngine::new();
        let result = engine.scan("This has a warning");

        assert_eq!(result.anomalies_detected, 1);
        assert!(result.patterns_found.contains(&"warning_pattern".to_string()));
    }

    #[test]
    fn test_scan_detects_both_patterns() {
        let mut engine = AnalysisEngine::new();
        let result = engine.scan("error and warning together");

        assert_eq!(result.anomalies_detected, 2);
        assert!(result.patterns_found.contains(&"error_pattern".to_string()));
        assert!(result.patterns_found.contains(&"warning_pattern".to_string()));
    }

    #[test]
    fn test_scan_no_patterns() {
        let mut engine = AnalysisEngine::new();
        let result = engine.scan("clean data without issues");

        assert_eq!(result.anomalies_detected, 0);
        assert!(result.patterns_found.is_empty());
        assert_eq!(result.confidence_score, 0.95);
    }

    #[test]
    fn test_scan_confidence_with_anomalies() {
        let mut engine = AnalysisEngine::new();
        let result = engine.scan("error detected");

        assert_eq!(result.confidence_score, 0.75);
    }

    #[test]
    fn test_scan_uppercase_error() {
        let mut engine = AnalysisEngine::new();
        let result = engine.scan("ERROR: something happened");

        assert!(result.patterns_found.contains(&"error_pattern".to_string()));
    }

    #[test]
    fn test_scan_uppercase_warning() {
        let mut engine = AnalysisEngine::new();
        let result = engine.scan("WARNING: something");

        assert!(result.patterns_found.contains(&"warning_pattern".to_string()));
    }

    #[test]
    fn test_scan_empty_string() {
        let mut engine = AnalysisEngine::new();
        let result = engine.scan("");

        assert_eq!(result.anomalies_detected, 0);
        assert!(result.patterns_found.is_empty());
    }

    #[test]
    fn test_analysis_result_debug() {
        let result = AnalysisResult {
            anomalies_detected: 1,
            patterns_found: vec!["test".to_string()],
            confidence_score: 0.9,
            timestamp: 12345,
        };
        let debug_str = format!("{:?}", result);
        assert!(debug_str.contains("AnalysisResult"));
    }

    #[test]
    fn test_analysis_result_clone() {
        let result = AnalysisResult {
            anomalies_detected: 2,
            patterns_found: vec!["a".to_string(), "b".to_string()],
            confidence_score: 0.8,
            timestamp: 99999,
        };
        let cloned = result.clone();
        assert_eq!(cloned.anomalies_detected, 2);
        assert_eq!(cloned.patterns_found.len(), 2);
    }

    #[test]
    fn test_analysis_result_serialization() {
        let result = AnalysisResult {
            anomalies_detected: 3,
            patterns_found: vec!["pattern1".to_string()],
            confidence_score: 0.85,
            timestamp: 1234567890,
        };
        let json = serde_json::to_string(&result).unwrap();
        let restored: AnalysisResult = serde_json::from_str(&json).unwrap();
        assert_eq!(restored.anomalies_detected, 3);
        assert_eq!(restored.confidence_score, 0.85);
    }

    #[test]
    fn test_scan_timestamp_is_set() {
        let mut engine = AnalysisEngine::new();
        let result = engine.scan("test");

        // Timestamp should be > 0 (since UNIX epoch)
        assert!(result.timestamp > 0);
    }

    #[test]
    fn test_multiple_scans_independent() {
        let mut engine = AnalysisEngine::new();

        let result1 = engine.scan("error");
        let result2 = engine.scan("clean");

        assert_eq!(result1.anomalies_detected, 1);
        assert_eq!(result2.anomalies_detected, 0);
    }
}
