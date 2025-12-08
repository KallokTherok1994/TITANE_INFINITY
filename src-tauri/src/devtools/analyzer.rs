// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v20.1 — ANALYZER ENGINE
//   DevTools OS — Cognitive audit and structural analysis
//   Super Prompt #9: Coherence, risks, stability, recommendations
// ═══════════════════════════════════════════════════════════════

use serde::{Deserialize, Serialize};
use std::collections::HashMap;

use super::debugger::DebuggerStats;
use super::memory_inspector::MemorySystemStats;

/// Analysis report from the Analyzer Engine
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AnalyzerReport {
    /// Timestamp of the analysis
    pub timestamp: i64,
    /// Warning messages (issues detected)
    pub warnings: Vec<AnalyzerWarning>,
    /// Suggestions for improvement
    pub suggestions: Vec<AnalyzerSuggestion>,
    /// Overall risk score (0.0 = safe, 1.0 = critical)
    pub risk_score: f32,
    /// Stability score (0.0 = unstable, 1.0 = stable)
    pub stability_score: f32,
    /// Coherence score (0.0 = incoherent, 1.0 = coherent)
    pub coherence_score: f32,
    /// Performance score (0.0 = poor, 1.0 = excellent)
    pub performance_score: f32,
    /// Detailed metrics
    pub metrics: AnalyzerMetrics,
    /// Analysis duration in milliseconds
    pub analysis_duration_ms: u128,
}

/// A warning from the analyzer
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AnalyzerWarning {
    /// Warning category
    pub category: WarningCategory,
    /// Severity level
    pub severity: Severity,
    /// Warning message
    pub message: String,
    /// Affected component
    pub component: String,
    /// Possible impact
    pub impact: String,
    /// Recommended action
    pub action: Option<String>,
}

/// Warning categories
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum WarningCategory {
    /// Performance issue
    Performance,
    /// Memory concern
    Memory,
    /// Coherence/consistency issue
    Coherence,
    /// Pipeline anomaly
    Pipeline,
    /// State mutation problem
    StateMutation,
    /// Error rate concern
    ErrorRate,
    /// Resource exhaustion risk
    Resource,
    /// Configuration issue
    Configuration,
}

/// Severity levels
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Ord, PartialOrd, Eq)]
pub enum Severity {
    Info,
    Low,
    Medium,
    High,
    Critical,
}

/// A suggestion from the analyzer
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AnalyzerSuggestion {
    /// Suggestion category
    pub category: SuggestionCategory,
    /// Priority level (higher = more important)
    pub priority: u8,
    /// Suggestion message
    pub message: String,
    /// Expected improvement
    pub expected_improvement: String,
    /// Effort required
    pub effort: Effort,
}

/// Suggestion categories
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum SuggestionCategory {
    /// Performance optimization
    Performance,
    /// Memory optimization
    Memory,
    /// Code quality
    CodeQuality,
    /// Architecture
    Architecture,
    /// Configuration
    Configuration,
    /// Monitoring
    Monitoring,
}

/// Effort level for suggestions
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum Effort {
    Trivial,
    Low,
    Medium,
    High,
}

/// Detailed metrics from analysis
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AnalyzerMetrics {
    /// Average engine latency in ms
    pub avg_engine_latency_ms: f64,
    /// P95 engine latency in ms
    pub p95_engine_latency_ms: f64,
    /// Error rate (0.0 - 1.0)
    pub error_rate: f32,
    /// Memory utilization (0.0 - 1.0)
    pub memory_utilization: f32,
    /// Cognitive density (messages per hour)
    pub cognitive_density: f32,
    /// Repetition score (0.0 = no repetition, 1.0 = high repetition)
    pub repetition_score: f32,
    /// Tonal consistency score (0.0 - 1.0)
    pub tonal_consistency: f32,
    /// Chronological consistency score (0.0 - 1.0)
    pub chronological_consistency: f32,
    /// Engine-specific metrics
    pub engine_metrics: HashMap<String, EngineMetricsSummary>,
}

/// Summary metrics for a specific engine
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EngineMetricsSummary {
    /// Total invocations
    pub invocations: usize,
    /// Error count
    pub errors: usize,
    /// Average duration ms
    pub avg_duration_ms: f64,
    /// Max duration ms
    pub max_duration_ms: u128,
}

/// System metrics input for analysis
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SystemMetricsInput {
    /// CPU usage percentage
    pub cpu_pct: f32,
    /// RAM usage in MB
    pub ram_mb: f32,
    /// Total latency in ms
    pub latency_ms: u128,
    /// Time to first token in ms
    pub ttft_ms: u128,
    /// Engine-specific timings
    pub engine_timings: HashMap<String, u128>,
    /// Coherence score from Singularity
    pub coherence_score: f32,
    /// Stability score from Singularity
    pub singularity_stability: f32,
}

/// Analyzer Engine for DevTools OS
///
/// Performs cognitive and structural analysis of TITANE∞ system,
/// detecting anomalies, computing risk scores, and providing
/// actionable recommendations.
pub struct AnalyzerEngine {
    /// Analysis configuration
    config: AnalyzerConfig,
}

/// Configuration for the analyzer
#[derive(Debug, Clone)]
pub struct AnalyzerConfig {
    /// Threshold for high latency warning (ms)
    pub high_latency_threshold_ms: u128,
    /// Threshold for critical latency warning (ms)
    pub critical_latency_threshold_ms: u128,
    /// Threshold for high error rate
    pub high_error_rate_threshold: f32,
    /// Threshold for low coherence
    pub low_coherence_threshold: f32,
    /// Threshold for high memory utilization
    pub high_memory_utilization_threshold: f32,
}

impl Default for AnalyzerConfig {
    fn default() -> Self {
        Self {
            high_latency_threshold_ms: 300,
            critical_latency_threshold_ms: 1000,
            high_error_rate_threshold: 0.05,
            low_coherence_threshold: 0.7,
            high_memory_utilization_threshold: 0.85,
        }
    }
}

impl AnalyzerEngine {
    /// Create a new AnalyzerEngine with default configuration
    pub fn new() -> Self {
        Self {
            config: AnalyzerConfig::default(),
        }
    }

    /// Create a new AnalyzerEngine with custom configuration
    pub fn with_config(config: AnalyzerConfig) -> Self {
        Self { config }
    }

    /// Perform full system analysis
    pub async fn analyze(
        &self,
        debugger_stats: &DebuggerStats,
        memory_stats: &MemorySystemStats,
        system_metrics: Option<&SystemMetricsInput>,
    ) -> AnalyzerReport {
        let start = std::time::Instant::now();
        let timestamp = chrono::Utc::now().timestamp_millis();

        let mut warnings = Vec::new();
        let mut suggestions = Vec::new();

        // Analyze debugger stats
        self.analyze_debugger_stats(debugger_stats, &mut warnings, &mut suggestions);

        // Analyze memory stats
        self.analyze_memory_stats(memory_stats, &mut warnings, &mut suggestions);

        // Analyze system metrics if available
        if let Some(metrics) = system_metrics {
            self.analyze_system_metrics(metrics, &mut warnings, &mut suggestions);
        }

        // Calculate scores
        let risk_score = self.calculate_risk_score(&warnings);
        let stability_score = self.calculate_stability_score(debugger_stats, &warnings);
        let coherence_score = system_metrics
            .map(|m| m.coherence_score)
            .unwrap_or(0.8);
        let performance_score = self.calculate_performance_score(debugger_stats, system_metrics);

        // Generate metrics
        let metrics = self.generate_metrics(debugger_stats, memory_stats, system_metrics);

        // Sort warnings by severity (critical first)
        warnings.sort_by(|a, b| b.severity.cmp(&a.severity));

        // Sort suggestions by priority
        suggestions.sort_by(|a, b| b.priority.cmp(&a.priority));

        AnalyzerReport {
            timestamp,
            warnings,
            suggestions,
            risk_score,
            stability_score,
            coherence_score,
            performance_score,
            metrics,
            analysis_duration_ms: start.elapsed().as_millis(),
        }
    }

    /// Analyze debugger statistics
    fn analyze_debugger_stats(
        &self,
        stats: &DebuggerStats,
        warnings: &mut Vec<AnalyzerWarning>,
        suggestions: &mut Vec<AnalyzerSuggestion>,
    ) {
        // Check error rate
        if stats.total_events > 0 {
            let error_rate = stats.error_count as f32 / stats.total_events as f32;

            if error_rate > self.config.high_error_rate_threshold {
                warnings.push(AnalyzerWarning {
                    category: WarningCategory::ErrorRate,
                    severity: Severity::High,
                    message: format!(
                        "High error rate detected: {:.1}%",
                        error_rate * 100.0
                    ),
                    component: "Pipeline".to_string(),
                    impact: "User experience degradation, potential data loss".to_string(),
                    action: Some("Review error logs and fix root causes".to_string()),
                });
            }
        }

        // Check for slow engines
        if stats.max_duration_ms > self.config.critical_latency_threshold_ms {
            warnings.push(AnalyzerWarning {
                category: WarningCategory::Performance,
                severity: Severity::Critical,
                message: format!(
                    "Critical latency: {} took {}ms",
                    stats.slowest_engine, stats.max_duration_ms
                ),
                component: stats.slowest_engine.clone(),
                impact: "Severe user experience impact, timeout risk".to_string(),
                action: Some("Profile and optimize the slow engine".to_string()),
            });
        } else if stats.max_duration_ms > self.config.high_latency_threshold_ms {
            warnings.push(AnalyzerWarning {
                category: WarningCategory::Performance,
                severity: Severity::Medium,
                message: format!(
                    "High latency: {} took {}ms",
                    stats.slowest_engine, stats.max_duration_ms
                ),
                component: stats.slowest_engine.clone(),
                impact: "Noticeable delay in responses".to_string(),
                action: Some("Consider caching or parallelization".to_string()),
            });
        }

        // Suggestions based on stats
        if stats.avg_duration_ms > 100 {
            suggestions.push(AnalyzerSuggestion {
                category: SuggestionCategory::Performance,
                priority: 7,
                message: "Average engine duration exceeds 100ms".to_string(),
                expected_improvement: "30-50% latency reduction".to_string(),
                effort: Effort::Medium,
            });
        }
    }

    /// Analyze memory statistics
    fn analyze_memory_stats(
        &self,
        stats: &MemorySystemStats,
        warnings: &mut Vec<AnalyzerWarning>,
        suggestions: &mut Vec<AnalyzerSuggestion>,
    ) {
        // Check STM utilization (assuming 100 capacity)
        let stm_utilization = stats.stm.total_entries as f32 / 100.0;
        if stm_utilization > self.config.high_memory_utilization_threshold {
            warnings.push(AnalyzerWarning {
                category: WarningCategory::Memory,
                severity: Severity::Medium,
                message: format!(
                    "STM near capacity: {:.0}% utilized",
                    stm_utilization * 100.0
                ),
                component: "UnifiedMemory.STM".to_string(),
                impact: "Older memories may be evicted prematurely".to_string(),
                action: Some("Trigger consolidation or increase STM capacity".to_string()),
            });
        }

        // Check for missing embeddings
        if stats.embeddings_count == 0 && stats.total_entries > 10 {
            suggestions.push(AnalyzerSuggestion {
                category: SuggestionCategory::Memory,
                priority: 5,
                message: "No embeddings found - semantic search unavailable".to_string(),
                expected_improvement: "Enable semantic memory search".to_string(),
                effort: Effort::Medium,
            });
        }

        // Check for unindexed LTM
        if stats.indexed_count < stats.ltm.total_entries && stats.ltm.total_entries > 0 {
            let unindexed_pct =
                ((stats.ltm.total_entries - stats.indexed_count) as f32 / stats.ltm.total_entries as f32) * 100.0;

            if unindexed_pct > 20.0 {
                warnings.push(AnalyzerWarning {
                    category: WarningCategory::Memory,
                    severity: Severity::Low,
                    message: format!("{:.0}% of LTM entries are not indexed", unindexed_pct),
                    component: "UnifiedMemory.LTM".to_string(),
                    impact: "Some long-term memories may not be searchable".to_string(),
                    action: Some("Run index rebuild".to_string()),
                });
            }
        }
    }

    /// Analyze system metrics
    fn analyze_system_metrics(
        &self,
        metrics: &SystemMetricsInput,
        warnings: &mut Vec<AnalyzerWarning>,
        suggestions: &mut Vec<AnalyzerSuggestion>,
    ) {
        // Check CPU usage
        if metrics.cpu_pct > 80.0 {
            warnings.push(AnalyzerWarning {
                category: WarningCategory::Resource,
                severity: Severity::High,
                message: format!("High CPU usage: {:.1}%", metrics.cpu_pct),
                component: "System".to_string(),
                impact: "May cause slowdowns and thermal throttling".to_string(),
                action: Some("Reduce concurrent operations or optimize hot paths".to_string()),
            });
        }

        // Check coherence
        if metrics.coherence_score < self.config.low_coherence_threshold {
            warnings.push(AnalyzerWarning {
                category: WarningCategory::Coherence,
                severity: Severity::Medium,
                message: format!(
                    "Low coherence score: {:.2}",
                    metrics.coherence_score
                ),
                component: "SingularityState".to_string(),
                impact: "Response quality may be inconsistent".to_string(),
                action: Some("Review conversation context and state synchronization".to_string()),
            });
        }

        // Check TTFT
        if metrics.ttft_ms > 200 {
            suggestions.push(AnalyzerSuggestion {
                category: SuggestionCategory::Performance,
                priority: 8,
                message: format!("Time to first token is {}ms (target: <200ms)", metrics.ttft_ms),
                expected_improvement: "Faster perceived response time".to_string(),
                effort: Effort::Medium,
            });
        }
    }

    /// Calculate risk score from warnings
    fn calculate_risk_score(&self, warnings: &[AnalyzerWarning]) -> f32 {
        let mut score = 0.0;

        for warning in warnings {
            score += match warning.severity {
                Severity::Critical => 0.4,
                Severity::High => 0.2,
                Severity::Medium => 0.1,
                Severity::Low => 0.05,
                Severity::Info => 0.01,
            };
        }

        score.min(1.0)
    }

    /// Calculate stability score
    fn calculate_stability_score(
        &self,
        stats: &DebuggerStats,
        warnings: &[AnalyzerWarning],
    ) -> f32 {
        let mut score = 1.0;

        // Deduct for errors
        if stats.total_events > 0 {
            let error_rate = stats.error_count as f32 / stats.total_events as f32;
            score -= error_rate * 0.5;
        }

        // Deduct for critical warnings
        let critical_count = warnings
            .iter()
            .filter(|w| w.severity == Severity::Critical)
            .count();
        score -= critical_count as f32 * 0.2;

        score.max(0.0)
    }

    /// Calculate performance score
    fn calculate_performance_score(
        &self,
        stats: &DebuggerStats,
        system_metrics: Option<&SystemMetricsInput>,
    ) -> f32 {
        let mut score = 1.0;

        // Deduct for high latency
        if stats.avg_duration_ms > 100 {
            score -= 0.2;
        }
        if stats.max_duration_ms > 500 {
            score -= 0.2;
        }

        // Consider system metrics
        if let Some(metrics) = system_metrics {
            if metrics.latency_ms > 300 {
                score -= 0.2;
            }
            if metrics.cpu_pct > 70.0 {
                score -= 0.1;
            }
        }

        score.max(0.0)
    }

    /// Generate detailed metrics
    fn generate_metrics(
        &self,
        debugger_stats: &DebuggerStats,
        memory_stats: &MemorySystemStats,
        system_metrics: Option<&SystemMetricsInput>,
    ) -> AnalyzerMetrics {
        let memory_utilization = if memory_stats.total_entries > 0 {
            (memory_stats.stm.total_entries as f32 / 100.0).min(1.0)
        } else {
            0.0
        };

        let error_rate = if debugger_stats.total_events > 0 {
            debugger_stats.error_count as f32 / debugger_stats.total_events as f32
        } else {
            0.0
        };

        let mut engine_metrics = HashMap::new();
        for (engine, count) in &debugger_stats.events_by_engine {
            engine_metrics.insert(
                engine.clone(),
                EngineMetricsSummary {
                    invocations: *count,
                    errors: 0, // Would need more detailed stats
                    avg_duration_ms: debugger_stats.avg_duration_ms as f64,
                    max_duration_ms: debugger_stats.max_duration_ms,
                },
            );
        }

        AnalyzerMetrics {
            avg_engine_latency_ms: debugger_stats.avg_duration_ms as f64,
            p95_engine_latency_ms: debugger_stats.max_duration_ms as f64 * 0.95,
            error_rate,
            memory_utilization,
            cognitive_density: 0.0, // Would need conversation history
            repetition_score: 0.0,  // Would need conversation analysis
            tonal_consistency: system_metrics
                .map(|m| m.coherence_score)
                .unwrap_or(1.0),
            chronological_consistency: 1.0, // Would need timeline analysis
            engine_metrics,
        }
    }
}

impl Default for AnalyzerEngine {
    fn default() -> Self {
        Self::new()
    }
}

// ═══════════════════════════════════════════════════════════════
// TESTS
// ═══════════════════════════════════════════════════════════════

#[cfg(test)]
mod tests {
    use super::*;

    fn create_mock_debugger_stats() -> DebuggerStats {
        let mut events_by_engine = HashMap::new();
        events_by_engine.insert("TestEngine".to_string(), 10);

        DebuggerStats {
            session_start: 0,
            total_events: 100,
            error_count: 2,
            events_by_engine,
            avg_duration_ms: 50,
            max_duration_ms: 200,
            slowest_engine: "TestEngine".to_string(),
        }
    }

    fn create_mock_memory_stats() -> MemorySystemStats {
        use super::super::memory_inspector::{LayerStats, MemoryLayer};

        MemorySystemStats {
            stm: LayerStats {
                layer: MemoryLayer::STM,
                total_entries: 50,
                total_size_bytes: 5000,
                avg_importance: 0.5,
                oldest_entry_age_ms: 0,
                newest_entry_age_ms: 0,
                top_tags: Vec::new(),
            },
            mtm: LayerStats {
                layer: MemoryLayer::MTM,
                total_entries: 100,
                total_size_bytes: 10000,
                avg_importance: 0.7,
                oldest_entry_age_ms: 0,
                newest_entry_age_ms: 0,
                top_tags: Vec::new(),
            },
            ltm: LayerStats {
                layer: MemoryLayer::LTM,
                total_entries: 500,
                total_size_bytes: 50000,
                avg_importance: 0.8,
                oldest_entry_age_ms: 0,
                newest_entry_age_ms: 0,
                top_tags: Vec::new(),
            },
            total_entries: 650,
            total_size_bytes: 65000,
            embeddings_count: 100,
            indexed_count: 480,
        }
    }

    #[tokio::test]
    async fn test_analyzer_basic() {
        let analyzer = AnalyzerEngine::new();
        let debugger_stats = create_mock_debugger_stats();
        let memory_stats = create_mock_memory_stats();

        let report = analyzer.analyze(&debugger_stats, &memory_stats, None).await;

        assert!(report.risk_score >= 0.0);
        assert!(report.risk_score <= 1.0);
        assert!(report.stability_score >= 0.0);
        assert!(report.stability_score <= 1.0);
    }

    #[tokio::test]
    async fn test_analyzer_with_high_errors() {
        let analyzer = AnalyzerEngine::new();
        let mut debugger_stats = create_mock_debugger_stats();
        debugger_stats.error_count = 20; // 20% error rate
        let memory_stats = create_mock_memory_stats();

        let report = analyzer.analyze(&debugger_stats, &memory_stats, None).await;

        // Should have error rate warning
        assert!(report.warnings.iter().any(|w| w.category == WarningCategory::ErrorRate));
        assert!(report.risk_score > 0.0);
    }

    #[tokio::test]
    async fn test_analyzer_with_slow_engine() {
        let analyzer = AnalyzerEngine::new();
        let mut debugger_stats = create_mock_debugger_stats();
        debugger_stats.max_duration_ms = 1500; // Critical latency
        let memory_stats = create_mock_memory_stats();

        let report = analyzer.analyze(&debugger_stats, &memory_stats, None).await;

        // Should have critical latency warning
        assert!(report.warnings.iter().any(|w|
            w.category == WarningCategory::Performance && w.severity == Severity::Critical
        ));
    }

    #[test]
    fn test_severity_ordering() {
        assert!(Severity::Critical > Severity::High);
        assert!(Severity::High > Severity::Medium);
        assert!(Severity::Medium > Severity::Low);
        assert!(Severity::Low > Severity::Info);
    }
}
