// ═══════════════════════════════════════════════════════════════
//   Monitoring — Telemetry Export
//   OpenTelemetry, Prometheus, JSON export
// ═══════════════════════════════════════════════════════════════

use serde::{Deserialize, Serialize};
use std::collections::VecDeque;

/// Telemetry event (from devtools/telemetry.rs)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TelemetryEvent {
    pub timestamp: chrono::DateTime<chrono::Utc>,
    pub event_type: String,
    pub payload: serde_json::Value,
}

/// Telemetry exporter managing event collection and export
pub struct TelemetryExporter {
    events: VecDeque<TelemetryEvent>,
    max_events: usize,
}

impl TelemetryExporter {
    pub fn new() -> Self {
        Self {
            events: VecDeque::new(),
            max_events: 1000,
        }
    }

    /// Record telemetry event
    pub fn record_event(&mut self, event_type: String, payload: serde_json::Value) {
        let event = TelemetryEvent {
            timestamp: chrono::Utc::now(),
            event_type,
            payload,
        };

        self.events.push_back(event);

        // Trim to max_events
        if self.events.len() > self.max_events {
            self.events.pop_front();
        }
    }

    /// Get recent events
    pub fn get_recent_events(&self, count: usize) -> Vec<TelemetryEvent> {
        self.events
            .iter()
            .rev()
            .take(count)
            .cloned()
            .collect()
    }

    /// Export all events as JSON
    pub fn export_json(&self) -> Result<String, serde_json::Error> {
        serde_json::to_string(&self.events)
    }

    /// Export for OpenTelemetry (placeholder)
    pub fn export_opentelemetry(&self) -> Result<String, String> {
        // TODO: Implement OpenTelemetry export format
        Ok(format!("OpenTelemetry export: {} events", self.events.len()))
    }

    /// Export for Prometheus (placeholder)
    pub fn export_prometheus(&self) -> Result<String, String> {
        // TODO: Implement Prometheus metrics format
        Ok(format!("# HELP titane_events_total Total telemetry events\n# TYPE titane_events_total counter\ntitane_events_total {}\n", self.events.len()))
    }

    /// Clear all events
    pub fn clear(&mut self) {
        self.events.clear();
    }
}

impl Default for TelemetryExporter {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_telemetry_exporter_new() {
        let exporter = TelemetryExporter::new();
        assert_eq!(exporter.events.len(), 0);
        assert_eq!(exporter.max_events, 1000);
    }

    #[test]
    fn test_record_event() {
        let mut exporter = TelemetryExporter::new();

        exporter.record_event(
            "test_event".to_string(),
            serde_json::json!({"key": "value"}),
        );

        assert_eq!(exporter.events.len(), 1);
        assert_eq!(exporter.events[0].event_type, "test_event");
    }

    #[test]
    fn test_get_recent_events() {
        let mut exporter = TelemetryExporter::new();

        exporter.record_event("event1".to_string(), serde_json::json!({}));
        exporter.record_event("event2".to_string(), serde_json::json!({}));
        exporter.record_event("event3".to_string(), serde_json::json!({}));

        let recent = exporter.get_recent_events(2);
        assert_eq!(recent.len(), 2);
        // Should return in reverse order (most recent first)
        assert_eq!(recent[0].event_type, "event3");
        assert_eq!(recent[1].event_type, "event2");
    }

    #[test]
    fn test_max_events_limit() {
        let mut exporter = TelemetryExporter::new();
        exporter.max_events = 5;

        // Add more than max_events
        for i in 0..10 {
            exporter.record_event(format!("event{}", i), serde_json::json!({}));
        }

        assert_eq!(exporter.events.len(), 5);
        // Should keep only the most recent 5
        assert_eq!(exporter.events[4].event_type, "event9");
    }

    #[test]
    fn test_export_json() {
        let mut exporter = TelemetryExporter::new();

        exporter.record_event("test".to_string(), serde_json::json!({"data": 123}));

        let json = exporter.export_json().unwrap();
        assert!(json.contains("test"));
        assert!(json.contains("data"));
    }

    #[test]
    fn test_export_prometheus() {
        let mut exporter = TelemetryExporter::new();

        exporter.record_event("event1".to_string(), serde_json::json!({}));
        exporter.record_event("event2".to_string(), serde_json::json!({}));

        let prometheus = exporter.export_prometheus().unwrap();
        assert!(prometheus.contains("titane_events_total 2"));
    }

    #[test]
    fn test_clear() {
        let mut exporter = TelemetryExporter::new();

        exporter.record_event("test".to_string(), serde_json::json!({}));
        assert_eq!(exporter.events.len(), 1);

        exporter.clear();
        assert_eq!(exporter.events.len(), 0);
    }
}
