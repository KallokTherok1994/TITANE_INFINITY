// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v20Ω — COGNITIVE PRIORITIES
//   Task prioritization for cognitive workload distribution
//   Super Prompt #11 — Phase 3
// ═══════════════════════════════════════════════════════════════

use serde::{Deserialize, Serialize};

/// Cognitive task priority levels
///
/// Priorities determine execution order in the scheduler:
/// - Critical: Security, errors, watchdog (immediate)
/// - High: Reflection, memory, coherence (< 100ms)
/// - Normal: Style, behavior, adaptation (< 500ms)
/// - Background: Indexation, cleaning, analytics (best-effort)
#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Serialize, Deserialize, Hash)]
pub enum CognitivePriority {
    /// Critical operations (security, errors, watchdog)
    /// Target: immediate execution
    Critical = 4,

    /// High-priority cognitive operations (reflection, memory)
    /// Target: < 100ms latency
    High = 3,

    /// Normal cognitive operations (style, behavior)
    /// Target: < 500ms latency
    Normal = 2,

    /// Background operations (indexation, cleaning)
    /// Target: best-effort
    Background = 1,
}

impl CognitivePriority {
    /// Get timeout for this priority level in seconds
    pub fn timeout_secs(&self) -> u64 {
        match self {
            CognitivePriority::Critical => 2,
            CognitivePriority::High => 4,
            CognitivePriority::Normal => 6,
            CognitivePriority::Background => 10,
        }
    }

    /// Get maximum execution duration in milliseconds
    pub fn max_duration_ms(&self) -> u64 {
        match self {
            CognitivePriority::Critical => 50,
            CognitivePriority::High => 200,
            CognitivePriority::Normal => 500,
            CognitivePriority::Background => 2000,
        }
    }

    /// Check if this priority should preempt the other
    pub fn should_preempt(&self, other: &CognitivePriority) -> bool {
        *self > *other
    }

    /// Get priority from engine name (heuristic)
    pub fn from_engine_name(engine: &str) -> Self {
        match engine.to_lowercase().as_str() {
            // Critical
            "security" | "sentinel" | "watchdog" | "error_handler" => CognitivePriority::Critical,

            // High
            "reflection" | "memory" | "coherence" | "singularity" => CognitivePriority::High,

            // Normal (default for most engines)
            "style" | "behavior" | "emotion" | "adaptation" | "literary" => {
                CognitivePriority::Normal
            }

            // Background
            "indexer" | "compactor" | "analytics" | "telemetry" => CognitivePriority::Background,

            // Default
            _ => CognitivePriority::Normal,
        }
    }

    /// Get all priorities in order
    pub fn all() -> Vec<Self> {
        vec![
            CognitivePriority::Critical,
            CognitivePriority::High,
            CognitivePriority::Normal,
            CognitivePriority::Background,
        ]
    }

    /// Get display name
    pub fn name(&self) -> &'static str {
        match self {
            CognitivePriority::Critical => "Critical",
            CognitivePriority::High => "High",
            CognitivePriority::Normal => "Normal",
            CognitivePriority::Background => "Background",
        }
    }
}

impl std::fmt::Display for CognitivePriority {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}", self.name())
    }
}

impl Default for CognitivePriority {
    fn default() -> Self {
        CognitivePriority::Normal
    }
}

// ═══════════════════════════════════════════════════════════════
// TESTS
// ═══════════════════════════════════════════════════════════════

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_priority_ordering() {
        assert!(CognitivePriority::Critical > CognitivePriority::High);
        assert!(CognitivePriority::High > CognitivePriority::Normal);
        assert!(CognitivePriority::Normal > CognitivePriority::Background);
    }

    #[test]
    fn test_priority_timeouts() {
        assert_eq!(CognitivePriority::Critical.timeout_secs(), 2);
        assert_eq!(CognitivePriority::High.timeout_secs(), 4);
        assert_eq!(CognitivePriority::Normal.timeout_secs(), 6);
        assert_eq!(CognitivePriority::Background.timeout_secs(), 10);
    }

    #[test]
    fn test_from_engine_name() {
        assert_eq!(
            CognitivePriority::from_engine_name("Security"),
            CognitivePriority::Critical
        );
        assert_eq!(
            CognitivePriority::from_engine_name("reflection"),
            CognitivePriority::High
        );
        assert_eq!(
            CognitivePriority::from_engine_name("Style"),
            CognitivePriority::Normal
        );
        assert_eq!(
            CognitivePriority::from_engine_name("indexer"),
            CognitivePriority::Background
        );
    }

    #[test]
    fn test_should_preempt() {
        assert!(CognitivePriority::Critical.should_preempt(&CognitivePriority::High));
        assert!(CognitivePriority::High.should_preempt(&CognitivePriority::Normal));
        assert!(!CognitivePriority::Normal.should_preempt(&CognitivePriority::High));
    }

    #[test]
    fn test_max_duration() {
        assert!(CognitivePriority::Critical.max_duration_ms() < 100);
        assert!(CognitivePriority::High.max_duration_ms() <= 200);
        assert!(CognitivePriority::Normal.max_duration_ms() <= 500);
    }
}
