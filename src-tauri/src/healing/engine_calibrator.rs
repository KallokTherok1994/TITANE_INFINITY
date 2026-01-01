//! ═══════════════════════════════════════════════════════════════
//!   SP-GAP-002: Engine Drift Detection & Auto-Recalibration
//!   Monitors engine performance and automatically recalibrates
//! ═══════════════════════════════════════════════════════════════

use parking_lot::RwLock;
use serde::{Deserialize, Serialize};
use std::collections::VecDeque;
use std::sync::atomic::{AtomicU64, Ordering};
use std::sync::Arc;
use std::time::{Duration, Instant, SystemTime, UNIX_EPOCH};

/// Engine calibration configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CalibratorConfig {
    pub sample_window_size: usize,
    pub drift_threshold_percent: f32,
    pub auto_calibrate: bool,
    pub calibration_cooldown_ms: u64,
    pub baseline_samples: usize,
}

impl Default for CalibratorConfig {
    fn default() -> Self {
        Self {
            sample_window_size: 100,
            drift_threshold_percent: 15.0,
            auto_calibrate: true,
            calibration_cooldown_ms: 30000,
            baseline_samples: 20,
        }
    }
}

/// Performance sample for an engine
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PerformanceSample {
    pub timestamp: u64,
    pub latency_ms: f64,
    pub throughput: f64,
    pub error_rate: f32,
    pub memory_usage_mb: f64,
}

/// Engine baseline performance metrics
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EngineBaseline {
    pub engine_id: String,
    pub avg_latency_ms: f64,
    pub avg_throughput: f64,
    pub avg_error_rate: f32,
    pub avg_memory_mb: f64,
    pub std_dev_latency: f64,
    pub established_at: u64,
    pub sample_count: usize,
}

/// Drift detection result
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DriftReport {
    pub engine_id: String,
    pub is_drifting: bool,
    pub drift_metrics: DriftMetrics,
    pub recommendation: DriftRecommendation,
    pub timestamp: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DriftMetrics {
    pub latency_drift_percent: f32,
    pub throughput_drift_percent: f32,
    pub error_rate_drift: f32,
    pub memory_drift_percent: f32,
    pub overall_drift_score: f32,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum DriftRecommendation {
    NoAction,
    MonitorClosely,
    SoftRecalibrate,
    HardRecalibrate,
    RestartEngine,
    AlertOperator,
}

/// Calibration action result
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CalibrationResult {
    pub engine_id: String,
    pub action_taken: CalibrationAction,
    pub success: bool,
    pub before_metrics: Option<DriftMetrics>,
    pub after_metrics: Option<DriftMetrics>,
    pub duration_ms: u64,
    pub timestamp: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum CalibrationAction {
    None,
    ResetCaches,
    OptimizeBuffers,
    RebalanceLoad,
    RestartWorkers,
    FullRecalibration,
}

/// Engine Drift Detector and Calibrator
pub struct EngineCalibrator {
    baselines: Arc<RwLock<std::collections::HashMap<String, EngineBaseline>>>,
    samples: Arc<RwLock<std::collections::HashMap<String, VecDeque<PerformanceSample>>>>,
    config: CalibratorConfig,
    last_calibration: Arc<RwLock<std::collections::HashMap<String, Instant>>>,
    stats: CalibratorStats,
}

#[derive(Debug, Default)]
pub struct CalibratorStats {
    pub samples_collected: AtomicU64,
    pub drift_detections: AtomicU64,
    pub calibrations_performed: AtomicU64,
    pub calibrations_successful: AtomicU64,
}

impl EngineCalibrator {
    pub fn new(config: CalibratorConfig) -> Self {
        Self {
            baselines: Arc::new(RwLock::new(std::collections::HashMap::new())),
            samples: Arc::new(RwLock::new(std::collections::HashMap::new())),
            config,
            last_calibration: Arc::new(RwLock::new(std::collections::HashMap::new())),
            stats: CalibratorStats::default(),
        }
    }

    /// Record a performance sample for an engine
    pub fn record_sample(&self, engine_id: &str, sample: PerformanceSample) {
        let should_establish_baseline = {
            let mut samples = self.samples.write();
            let engine_samples = samples.entry(engine_id.to_string()).or_default();

            engine_samples.push_back(sample);

            // Maintain window size
            while engine_samples.len() > self.config.sample_window_size {
                engine_samples.pop_front();
            }

            self.stats.samples_collected.fetch_add(1, Ordering::Relaxed);

            engine_samples.len() >= self.config.baseline_samples
        };

        // Establish baseline if we have enough samples.
        // IMPORTANT: we must not hold the samples write-lock when calling establish_baseline,
        // because establish_baseline reads samples and would deadlock.
        if should_establish_baseline {
            let baselines = self.baselines.read();
            if !baselines.contains_key(engine_id) {
                drop(baselines);
                self.establish_baseline(engine_id);
            }
        }
    }

    /// Establish baseline from recent samples
    fn establish_baseline(&self, engine_id: &str) {
        let samples = self.samples.read();
        if let Some(engine_samples) = samples.get(engine_id) {
            if engine_samples.len() < self.config.baseline_samples {
                return;
            }

            let recent: Vec<_> = engine_samples
                .iter()
                .take(self.config.baseline_samples)
                .collect();

            let avg_latency =
                recent.iter().map(|s| s.latency_ms).sum::<f64>() / recent.len() as f64;
            let avg_throughput =
                recent.iter().map(|s| s.throughput).sum::<f64>() / recent.len() as f64;
            let avg_error_rate =
                recent.iter().map(|s| s.error_rate).sum::<f32>() / recent.len() as f32;
            let avg_memory =
                recent.iter().map(|s| s.memory_usage_mb).sum::<f64>() / recent.len() as f64;

            // Calculate std dev for latency
            let variance = recent
                .iter()
                .map(|s| (s.latency_ms - avg_latency).powi(2))
                .sum::<f64>()
                / recent.len() as f64;
            let std_dev = variance.sqrt();

            let baseline = EngineBaseline {
                engine_id: engine_id.to_string(),
                avg_latency_ms: avg_latency,
                avg_throughput,
                avg_error_rate,
                avg_memory_mb: avg_memory,
                std_dev_latency: std_dev,
                established_at: SystemTime::now()
                    .duration_since(UNIX_EPOCH)
                    .unwrap_or_default()
                    .as_secs(),
                sample_count: recent.len(),
            };

            drop(samples);
            self.baselines
                .write()
                .insert(engine_id.to_string(), baseline);
        }
    }

    /// Detect drift for an engine
    pub fn detect_drift(&self, engine_id: &str) -> Option<DriftReport> {
        let baselines = self.baselines.read();
        let baseline = baselines.get(engine_id)?;

        let samples = self.samples.read();
        let engine_samples = samples.get(engine_id)?;

        if engine_samples.len() < 5 {
            return None;
        }

        // Calculate current averages from recent samples
        let recent: Vec<_> = engine_samples.iter().rev().take(10).collect();
        let current_latency =
            recent.iter().map(|s| s.latency_ms).sum::<f64>() / recent.len() as f64;
        let current_throughput =
            recent.iter().map(|s| s.throughput).sum::<f64>() / recent.len() as f64;
        let current_error_rate =
            recent.iter().map(|s| s.error_rate).sum::<f32>() / recent.len() as f32;
        let current_memory =
            recent.iter().map(|s| s.memory_usage_mb).sum::<f64>() / recent.len() as f64;

        // Calculate drift percentages
        let latency_drift =
            ((current_latency - baseline.avg_latency_ms) / baseline.avg_latency_ms * 100.0) as f32;
        let throughput_drift = ((baseline.avg_throughput - current_throughput)
            / baseline.avg_throughput
            * 100.0) as f32;
        let error_drift = current_error_rate - baseline.avg_error_rate;
        let memory_drift =
            ((current_memory - baseline.avg_memory_mb) / baseline.avg_memory_mb * 100.0) as f32;

        // Overall drift score (weighted average)
        let overall = (latency_drift.abs() * 0.4
            + throughput_drift.abs() * 0.3
            + error_drift.abs() * 100.0 * 0.2
            + memory_drift.abs() * 0.1)
            .max(0.0);

        let is_drifting = overall > self.config.drift_threshold_percent;

        if is_drifting {
            self.stats.drift_detections.fetch_add(1, Ordering::Relaxed);
        }

        let recommendation = if overall < 5.0 {
            DriftRecommendation::NoAction
        } else if overall < 10.0 {
            DriftRecommendation::MonitorClosely
        } else if overall < 20.0 {
            DriftRecommendation::SoftRecalibrate
        } else if overall < 40.0 {
            DriftRecommendation::HardRecalibrate
        } else if overall < 60.0 {
            DriftRecommendation::RestartEngine
        } else {
            DriftRecommendation::AlertOperator
        };

        Some(DriftReport {
            engine_id: engine_id.to_string(),
            is_drifting,
            drift_metrics: DriftMetrics {
                latency_drift_percent: latency_drift,
                throughput_drift_percent: throughput_drift,
                error_rate_drift: error_drift,
                memory_drift_percent: memory_drift,
                overall_drift_score: overall,
            },
            recommendation,
            timestamp: SystemTime::now()
                .duration_since(UNIX_EPOCH)
                .unwrap_or_default()
                .as_secs(),
        })
    }

    /// Perform calibration for an engine
    pub fn calibrate(&self, engine_id: &str) -> CalibrationResult {
        let start = Instant::now();

        // Check cooldown
        {
            let last_cal = self.last_calibration.read();
            if let Some(last) = last_cal.get(engine_id) {
                if last.elapsed() < Duration::from_millis(self.config.calibration_cooldown_ms) {
                    return CalibrationResult {
                        engine_id: engine_id.to_string(),
                        action_taken: CalibrationAction::None,
                        success: false,
                        before_metrics: None,
                        after_metrics: None,
                        duration_ms: start.elapsed().as_millis() as u64,
                        timestamp: SystemTime::now()
                            .duration_since(UNIX_EPOCH)
                            .unwrap_or_default()
                            .as_secs(),
                    };
                }
            }
        }

        let before = self.detect_drift(engine_id).map(|r| r.drift_metrics);

        // Perform calibration (reset baseline)
        self.establish_baseline(engine_id);

        self.stats
            .calibrations_performed
            .fetch_add(1, Ordering::Relaxed);
        self.stats
            .calibrations_successful
            .fetch_add(1, Ordering::Relaxed);

        // Update last calibration time
        self.last_calibration
            .write()
            .insert(engine_id.to_string(), Instant::now());

        CalibrationResult {
            engine_id: engine_id.to_string(),
            action_taken: CalibrationAction::FullRecalibration,
            success: true,
            before_metrics: before,
            after_metrics: None,
            duration_ms: start.elapsed().as_millis() as u64,
            timestamp: SystemTime::now()
                .duration_since(UNIX_EPOCH)
                .unwrap_or_default()
                .as_secs(),
        }
    }

    /// Get calibrator statistics
    pub fn stats(&self) -> CalibratorStatsSnapshot {
        CalibratorStatsSnapshot {
            samples_collected: self.stats.samples_collected.load(Ordering::Relaxed),
            drift_detections: self.stats.drift_detections.load(Ordering::Relaxed),
            calibrations_performed: self.stats.calibrations_performed.load(Ordering::Relaxed),
            calibrations_successful: self.stats.calibrations_successful.load(Ordering::Relaxed),
            tracked_engines: self.baselines.read().len(),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CalibratorStatsSnapshot {
    pub samples_collected: u64,
    pub drift_detections: u64,
    pub calibrations_performed: u64,
    pub calibrations_successful: u64,
    pub tracked_engines: usize,
}

#[cfg(test)]
mod tests {
    use super::*;

    // ─────────────────────────────────────────────────────────────
    // CalibratorConfig Tests
    // ─────────────────────────────────────────────────────────────

    #[test]
    fn test_calibrator_config_default() {
        let config = CalibratorConfig::default();
        assert_eq!(config.sample_window_size, 100);
        assert_eq!(config.drift_threshold_percent, 15.0);
        assert!(config.auto_calibrate);
        assert_eq!(config.calibration_cooldown_ms, 30000);
        assert_eq!(config.baseline_samples, 20);
    }

    #[test]
    fn test_calibrator_config_clone() {
        let config = CalibratorConfig::default();
        let cloned = config.clone();
        assert_eq!(config.sample_window_size, cloned.sample_window_size);
        assert_eq!(
            config.drift_threshold_percent,
            cloned.drift_threshold_percent
        );
    }

    #[test]
    fn test_calibrator_config_debug() {
        let config = CalibratorConfig::default();
        let debug = format!("{:?}", config);
        assert!(debug.contains("CalibratorConfig"));
    }

    #[test]
    fn test_calibrator_config_serialization() {
        let config = CalibratorConfig::default();
        let json = serde_json::to_string(&config)
            .expect("CalibratorConfig should serialize to JSON");
        let restored: CalibratorConfig = serde_json::from_str(&json)
            .expect("CalibratorConfig should deserialize from JSON");
        assert_eq!(config.sample_window_size, restored.sample_window_size);
    }

    #[test]
    fn test_calibrator_config_custom() {
        let config = CalibratorConfig {
            sample_window_size: 50,
            drift_threshold_percent: 10.0,
            auto_calibrate: false,
            calibration_cooldown_ms: 60000,
            baseline_samples: 10,
        };
        assert_eq!(config.sample_window_size, 50);
        assert!(!config.auto_calibrate);
    }

    // ─────────────────────────────────────────────────────────────
    // PerformanceSample Tests
    // ─────────────────────────────────────────────────────────────

    #[test]
    fn test_performance_sample_creation() {
        let sample = PerformanceSample {
            timestamp: 12345,
            latency_ms: 10.5,
            throughput: 100.0,
            error_rate: 0.01,
            memory_usage_mb: 256.0,
        };
        assert_eq!(sample.timestamp, 12345);
        assert_eq!(sample.latency_ms, 10.5);
    }

    #[test]
    fn test_performance_sample_clone() {
        let sample = PerformanceSample {
            timestamp: 1000,
            latency_ms: 5.0,
            throughput: 50.0,
            error_rate: 0.0,
            memory_usage_mb: 100.0,
        };
        let cloned = sample.clone();
        assert_eq!(sample.timestamp, cloned.timestamp);
        assert_eq!(sample.latency_ms, cloned.latency_ms);
    }

    #[test]
    fn test_performance_sample_debug() {
        let sample = PerformanceSample {
            timestamp: 0,
            latency_ms: 1.0,
            throughput: 1.0,
            error_rate: 0.0,
            memory_usage_mb: 1.0,
        };
        let debug = format!("{:?}", sample);
        assert!(debug.contains("PerformanceSample"));
    }

    #[test]
    fn test_performance_sample_serialization() {
        let sample = PerformanceSample {
            timestamp: 9999,
            latency_ms: 15.0,
            throughput: 200.0,
            error_rate: 0.05,
            memory_usage_mb: 512.0,
        };
        let json = serde_json::to_string(&sample)
            .expect("PerformanceSample should serialize to JSON");
        let restored: PerformanceSample = serde_json::from_str(&json)
            .expect("PerformanceSample should deserialize from JSON");
        assert_eq!(sample.timestamp, restored.timestamp);
        assert_eq!(sample.latency_ms, restored.latency_ms);
    }

    // ─────────────────────────────────────────────────────────────
    // EngineBaseline Tests
    // ─────────────────────────────────────────────────────────────

    #[test]
    fn test_engine_baseline_creation() {
        let baseline = EngineBaseline {
            engine_id: "test_engine".to_string(),
            avg_latency_ms: 10.0,
            avg_throughput: 100.0,
            avg_error_rate: 0.01,
            avg_memory_mb: 256.0,
            std_dev_latency: 2.0,
            established_at: 12345,
            sample_count: 20,
        };
        assert_eq!(baseline.engine_id, "test_engine");
        assert_eq!(baseline.sample_count, 20);
    }

    #[test]
    fn test_engine_baseline_clone() {
        let baseline = EngineBaseline {
            engine_id: "clone_test".to_string(),
            avg_latency_ms: 5.0,
            avg_throughput: 50.0,
            avg_error_rate: 0.0,
            avg_memory_mb: 128.0,
            std_dev_latency: 1.0,
            established_at: 1000,
            sample_count: 10,
        };
        let cloned = baseline.clone();
        assert_eq!(baseline.engine_id, cloned.engine_id);
    }

    #[test]
    fn test_engine_baseline_serialization() {
        let baseline = EngineBaseline {
            engine_id: "serial_engine".to_string(),
            avg_latency_ms: 8.0,
            avg_throughput: 80.0,
            avg_error_rate: 0.02,
            avg_memory_mb: 200.0,
            std_dev_latency: 1.5,
            established_at: 5000,
            sample_count: 15,
        };
        let json = serde_json::to_string(&baseline)
            .expect("EngineBaseline should serialize to JSON");
        let restored: EngineBaseline = serde_json::from_str(&json)
            .expect("EngineBaseline should deserialize from JSON");
        assert_eq!(baseline.engine_id, restored.engine_id);
    }

    // ─────────────────────────────────────────────────────────────
    // DriftMetrics Tests
    // ─────────────────────────────────────────────────────────────

    #[test]
    fn test_drift_metrics_creation() {
        let metrics = DriftMetrics {
            latency_drift_percent: 5.0,
            throughput_drift_percent: -3.0,
            error_rate_drift: 0.01,
            memory_drift_percent: 10.0,
            overall_drift_score: 4.5,
        };
        assert_eq!(metrics.latency_drift_percent, 5.0);
        assert_eq!(metrics.overall_drift_score, 4.5);
    }

    #[test]
    fn test_drift_metrics_clone() {
        let metrics = DriftMetrics {
            latency_drift_percent: 1.0,
            throughput_drift_percent: 2.0,
            error_rate_drift: 0.0,
            memory_drift_percent: 3.0,
            overall_drift_score: 1.5,
        };
        let cloned = metrics.clone();
        assert_eq!(metrics.overall_drift_score, cloned.overall_drift_score);
    }

    // ─────────────────────────────────────────────────────────────
    // DriftRecommendation Tests
    // ─────────────────────────────────────────────────────────────

    #[test]
    fn test_drift_recommendation_equality() {
        assert_eq!(DriftRecommendation::NoAction, DriftRecommendation::NoAction);
        assert_ne!(
            DriftRecommendation::NoAction,
            DriftRecommendation::MonitorClosely
        );
    }

    #[test]
    fn test_drift_recommendation_all_variants() {
        let variants = [DriftRecommendation::NoAction,
            DriftRecommendation::MonitorClosely,
            DriftRecommendation::SoftRecalibrate,
            DriftRecommendation::HardRecalibrate,
            DriftRecommendation::RestartEngine,
            DriftRecommendation::AlertOperator];
        assert_eq!(variants.len(), 6);
    }

    #[test]
    fn test_drift_recommendation_serialization() {
        let rec = DriftRecommendation::SoftRecalibrate;
        let json = serde_json::to_string(&rec)
            .expect("DriftRecommendation should serialize to JSON");
        let restored: DriftRecommendation = serde_json::from_str(&json)
            .expect("DriftRecommendation should deserialize from JSON");
        assert_eq!(rec, restored);
    }

    // ─────────────────────────────────────────────────────────────
    // CalibrationAction Tests
    // ─────────────────────────────────────────────────────────────

    #[test]
    fn test_calibration_action_equality() {
        assert_eq!(CalibrationAction::None, CalibrationAction::None);
        assert_ne!(CalibrationAction::None, CalibrationAction::ResetCaches);
    }

    #[test]
    fn test_calibration_action_all_variants() {
        let variants = [CalibrationAction::None,
            CalibrationAction::ResetCaches,
            CalibrationAction::OptimizeBuffers,
            CalibrationAction::RebalanceLoad,
            CalibrationAction::RestartWorkers,
            CalibrationAction::FullRecalibration];
        assert_eq!(variants.len(), 6);
    }

    #[test]
    fn test_calibration_action_serialization() {
        let action = CalibrationAction::FullRecalibration;
        let json = serde_json::to_string(&action)
            .expect("CalibrationAction should serialize to JSON");
        let restored: CalibrationAction = serde_json::from_str(&json)
            .expect("CalibrationAction should deserialize from JSON");
        assert_eq!(action, restored);
    }

    // ─────────────────────────────────────────────────────────────
    // EngineCalibrator Tests
    // ─────────────────────────────────────────────────────────────

    #[test]
    fn test_record_samples() {
        let calibrator = EngineCalibrator::new(CalibratorConfig::default());

        for i in 0..25 {
            calibrator.record_sample(
                "test_engine",
                PerformanceSample {
                    timestamp: i,
                    latency_ms: 10.0 + (i as f64 * 0.1),
                    throughput: 100.0,
                    error_rate: 0.01,
                    memory_usage_mb: 50.0,
                },
            );
        }

        let stats = calibrator.stats();
        assert_eq!(stats.samples_collected, 25);
        assert_eq!(stats.tracked_engines, 1);
    }

    #[test]
    fn test_engine_calibrator_new() {
        let calibrator = EngineCalibrator::new(CalibratorConfig::default());
        let stats = calibrator.stats();
        assert_eq!(stats.samples_collected, 0);
        assert_eq!(stats.tracked_engines, 0);
    }

    #[test]
    fn test_record_samples_window_size() {
        let config = CalibratorConfig {
            sample_window_size: 10,
            ..CalibratorConfig::default()
        };
        let calibrator = EngineCalibrator::new(config);

        for i in 0..20 {
            calibrator.record_sample(
                "test_engine",
                PerformanceSample {
                    timestamp: i,
                    latency_ms: 10.0,
                    throughput: 100.0,
                    error_rate: 0.01,
                    memory_usage_mb: 50.0,
                },
            );
        }

        let stats = calibrator.stats();
        assert_eq!(stats.samples_collected, 20);
    }

    #[test]
    fn test_multiple_engines() {
        let calibrator = EngineCalibrator::new(CalibratorConfig::default());

        for i in 0..25 {
            calibrator.record_sample(
                "engine1",
                PerformanceSample {
                    timestamp: i,
                    latency_ms: 10.0,
                    throughput: 100.0,
                    error_rate: 0.01,
                    memory_usage_mb: 50.0,
                },
            );
            calibrator.record_sample(
                "engine2",
                PerformanceSample {
                    timestamp: i,
                    latency_ms: 15.0,
                    throughput: 80.0,
                    error_rate: 0.02,
                    memory_usage_mb: 60.0,
                },
            );
        }

        let stats = calibrator.stats();
        assert_eq!(stats.samples_collected, 50);
        assert_eq!(stats.tracked_engines, 2);
    }

    #[test]
    fn test_detect_drift_no_baseline() {
        let calibrator = EngineCalibrator::new(CalibratorConfig::default());
        let result = calibrator.detect_drift("nonexistent");
        assert!(result.is_none());
    }

    #[test]
    fn test_detect_drift_not_enough_samples() {
        let calibrator = EngineCalibrator::new(CalibratorConfig::default());

        for i in 0..3 {
            calibrator.record_sample(
                "test_engine",
                PerformanceSample {
                    timestamp: i,
                    latency_ms: 10.0,
                    throughput: 100.0,
                    error_rate: 0.01,
                    memory_usage_mb: 50.0,
                },
            );
        }

        let result = calibrator.detect_drift("test_engine");
        assert!(result.is_none());
    }

    #[test]
    fn test_detect_drift_stable() {
        let calibrator = EngineCalibrator::new(CalibratorConfig::default());

        // Create stable samples
        for i in 0..30 {
            calibrator.record_sample(
                "stable_engine",
                PerformanceSample {
                    timestamp: i,
                    latency_ms: 10.0,
                    throughput: 100.0,
                    error_rate: 0.01,
                    memory_usage_mb: 50.0,
                },
            );
        }

        let result = calibrator.detect_drift("stable_engine");
        assert!(result.is_some());
        let report = result.expect("drift report should be present");
        assert!(!report.is_drifting);
        assert_eq!(report.recommendation, DriftRecommendation::NoAction);
    }

    #[test]
    fn test_calibrate_engine() {
        let calibrator = EngineCalibrator::new(CalibratorConfig {
            calibration_cooldown_ms: 0, // No cooldown for test
            ..CalibratorConfig::default()
        });

        for i in 0..25 {
            calibrator.record_sample(
                "calibrate_engine",
                PerformanceSample {
                    timestamp: i,
                    latency_ms: 10.0,
                    throughput: 100.0,
                    error_rate: 0.01,
                    memory_usage_mb: 50.0,
                },
            );
        }

        let result = calibrator.calibrate("calibrate_engine");
        assert!(result.success);
        assert_eq!(result.action_taken, CalibrationAction::FullRecalibration);
    }

    #[test]
    fn test_calibrate_cooldown() {
        let calibrator = EngineCalibrator::new(CalibratorConfig::default());

        for i in 0..25 {
            calibrator.record_sample(
                "cooldown_engine",
                PerformanceSample {
                    timestamp: i,
                    latency_ms: 10.0,
                    throughput: 100.0,
                    error_rate: 0.01,
                    memory_usage_mb: 50.0,
                },
            );
        }

        // First calibration
        let result1 = calibrator.calibrate("cooldown_engine");
        assert!(result1.success);

        // Second calibration should be blocked by cooldown
        let result2 = calibrator.calibrate("cooldown_engine");
        assert!(!result2.success);
        assert_eq!(result2.action_taken, CalibrationAction::None);
    }

    #[test]
    fn test_stats_snapshot() {
        let calibrator = EngineCalibrator::new(CalibratorConfig::default());
        let stats = calibrator.stats();

        assert_eq!(stats.samples_collected, 0);
        assert_eq!(stats.drift_detections, 0);
        assert_eq!(stats.calibrations_performed, 0);
        assert_eq!(stats.calibrations_successful, 0);
        assert_eq!(stats.tracked_engines, 0);
    }

    #[test]
    fn test_stats_snapshot_serialization() {
        let stats = CalibratorStatsSnapshot {
            samples_collected: 100,
            drift_detections: 5,
            calibrations_performed: 2,
            calibrations_successful: 2,
            tracked_engines: 3,
        };
        let json = serde_json::to_string(&stats)
            .expect("CalibratorStatsSnapshot should serialize to JSON");
        let restored: CalibratorStatsSnapshot = serde_json::from_str(&json)
            .expect("CalibratorStatsSnapshot should deserialize from JSON");
        assert_eq!(stats.samples_collected, restored.samples_collected);
    }

    #[test]
    fn test_calibration_result_serialization() {
        let result = CalibrationResult {
            engine_id: "test".to_string(),
            action_taken: CalibrationAction::ResetCaches,
            success: true,
            before_metrics: None,
            after_metrics: None,
            duration_ms: 50,
            timestamp: 12345,
        };
        let json = serde_json::to_string(&result)
            .expect("CalibrationResult should serialize to JSON");
        let restored: CalibrationResult = serde_json::from_str(&json)
            .expect("CalibrationResult should deserialize from JSON");
        assert_eq!(result.engine_id, restored.engine_id);
    }

    #[test]
    fn test_drift_report_serialization() {
        let report = DriftReport {
            engine_id: "drift_engine".to_string(),
            is_drifting: true,
            drift_metrics: DriftMetrics {
                latency_drift_percent: 20.0,
                throughput_drift_percent: -15.0,
                error_rate_drift: 0.05,
                memory_drift_percent: 25.0,
                overall_drift_score: 18.0,
            },
            recommendation: DriftRecommendation::SoftRecalibrate,
            timestamp: 99999,
        };
        let json = serde_json::to_string(&report)
            .expect("DriftReport should serialize to JSON");
        let restored: DriftReport = serde_json::from_str(&json)
            .expect("DriftReport should deserialize from JSON");
        assert_eq!(report.engine_id, restored.engine_id);
        assert_eq!(report.is_drifting, restored.is_drifting);
    }
}
