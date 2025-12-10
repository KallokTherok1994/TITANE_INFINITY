// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v20.1 — LIVE DEBUGGER ENGINE
//   DevTools OS — Real-time engine event tracking
//   Super Prompt #9: Non-intrusive pipeline observation
// ═══════════════════════════════════════════════════════════════

use serde::{Deserialize, Serialize};
use std::collections::VecDeque;
use std::sync::Arc;
use tokio::sync::RwLock;

/// Maximum events stored in debugger history
const MAX_EVENTS: usize = 1000;

/// A single debugger event capturing engine execution
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DebuggerEvent {
    /// Unix timestamp in milliseconds
    pub timestamp: i64,
    /// Name of the engine that generated this event
    pub engine: String,
    /// Duration of the operation in milliseconds
    pub duration_ms: u128,
    /// Event type (start, end, error, checkpoint)
    pub event_type: DebugEventType,
    /// Human-readable details
    pub details: String,
    /// Optional structured metadata
    pub metadata: Option<DebugMetadata>,
}

/// Type of debug event
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum DebugEventType {
    /// Engine started processing
    Start,
    /// Engine finished processing
    End,
    /// Error occurred during processing
    Error,
    /// Intermediate checkpoint/milestone
    Checkpoint,
    /// State mutation recorded
    StateMutation,
    /// Memory operation (read/write)
    MemoryOp,
    /// AI provider call
    AICall,
    /// IPC communication
    IPCEvent,
}

/// Structured metadata for debug events
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DebugMetadata {
    /// Input size in bytes (if applicable)
    pub input_size: Option<usize>,
    /// Output size in bytes (if applicable)
    pub output_size: Option<usize>,
    /// Memory usage delta
    pub memory_delta_kb: Option<i64>,
    /// Associated conversation ID
    pub conversation_id: Option<String>,
    /// Associated message ID
    pub message_id: Option<String>,
    /// Provider name (for AI calls)
    pub provider: Option<String>,
    /// Error message (if event_type is Error)
    pub error: Option<String>,
    /// Custom key-value pairs
    pub custom: Option<std::collections::HashMap<String, String>>,
}

impl Default for DebugMetadata {
    fn default() -> Self {
        Self {
            input_size: None,
            output_size: None,
            memory_delta_kb: None,
            conversation_id: None,
            message_id: None,
            provider: None,
            error: None,
            custom: None,
        }
    }
}

/// Live Debugger Engine for TITANE∞ DevTools OS
///
/// Non-blocking, thread-safe event recorder that captures
/// engine execution events without impacting pipeline performance.
pub struct LiveDebugger {
    /// Event buffer with bounded capacity
    events: Arc<RwLock<VecDeque<DebuggerEvent>>>,
    /// Whether debugging is enabled
    enabled: Arc<RwLock<bool>>,
    /// Session start timestamp
    session_start: i64,
}

impl LiveDebugger {
    /// Create a new LiveDebugger instance
    pub fn new() -> Self {
        Self {
            events: Arc::new(RwLock::new(VecDeque::with_capacity(MAX_EVENTS))),
            enabled: Arc::new(RwLock::new(true)),
            session_start: chrono::Utc::now().timestamp_millis(),
        }
    }

    /// Record a debug event
    ///
    /// This is the primary method for engines to report their execution.
    /// It's designed to be fast and non-blocking.
    pub async fn record(&self, engine: &str, duration_ms: u128, details: impl Into<String>) {
        if !*self.enabled.read().await {
            return;
        }

        let event = DebuggerEvent {
            timestamp: chrono::Utc::now().timestamp_millis(),
            engine: engine.to_string(),
            duration_ms,
            event_type: DebugEventType::End,
            details: details.into(),
            metadata: None,
        };

        self.add_event(event).await;
    }

    /// Record an event with full metadata
    pub async fn record_full(
        &self,
        engine: &str,
        duration_ms: u128,
        event_type: DebugEventType,
        details: impl Into<String>,
        metadata: Option<DebugMetadata>,
    ) {
        if !*self.enabled.read().await {
            return;
        }

        let event = DebuggerEvent {
            timestamp: chrono::Utc::now().timestamp_millis(),
            engine: engine.to_string(),
            duration_ms,
            event_type,
            details: details.into(),
            metadata,
        };

        self.add_event(event).await;
    }

    /// Record pipeline stage start
    pub async fn record_start(&self, engine: &str, details: impl Into<String>) {
        self.record_full(engine, 0, DebugEventType::Start, details, None)
            .await;
    }

    /// Record an error event
    pub async fn record_error(&self, engine: &str, error: &str, duration_ms: u128) {
        let metadata = DebugMetadata {
            error: Some(error.to_string()),
            ..Default::default()
        };

        self.record_full(
            engine,
            duration_ms,
            DebugEventType::Error,
            format!("Error: {}", error),
            Some(metadata),
        )
        .await;
    }

    /// Record an AI provider call
    pub async fn record_ai_call(
        &self,
        provider: &str,
        duration_ms: u128,
        input_tokens: usize,
        output_tokens: usize,
    ) {
        let metadata = DebugMetadata {
            provider: Some(provider.to_string()),
            input_size: Some(input_tokens),
            output_size: Some(output_tokens),
            ..Default::default()
        };

        self.record_full(
            "AIRouter",
            duration_ms,
            DebugEventType::AICall,
            format!(
                "Provider: {} | In: {} tokens | Out: {} tokens",
                provider, input_tokens, output_tokens
            ),
            Some(metadata),
        )
        .await;
    }

    /// Record a memory operation
    pub async fn record_memory_op(
        &self,
        operation: &str,
        layer: &str,
        duration_ms: u128,
        items_affected: usize,
    ) {
        let mut custom = std::collections::HashMap::new();
        custom.insert("operation".to_string(), operation.to_string());
        custom.insert("layer".to_string(), layer.to_string());
        custom.insert("items".to_string(), items_affected.to_string());

        let metadata = DebugMetadata {
            custom: Some(custom),
            ..Default::default()
        };

        self.record_full(
            "UnifiedMemory",
            duration_ms,
            DebugEventType::MemoryOp,
            format!("{} on {} ({} items)", operation, layer, items_affected),
            Some(metadata),
        )
        .await;
    }

    /// Add event to buffer with capacity management
    async fn add_event(&self, event: DebuggerEvent) {
        let mut events = self.events.write().await;

        if events.len() >= MAX_EVENTS {
            events.pop_front();
        }

        events.push_back(event);
    }

    /// Get the last N events
    pub async fn last(&self, n: usize) -> Vec<DebuggerEvent> {
        let events = self.events.read().await;
        let count = n.min(events.len());
        events.iter().rev().take(count).cloned().collect()
    }

    /// Get all events
    pub async fn all(&self) -> Vec<DebuggerEvent> {
        let events = self.events.read().await;
        events.iter().cloned().collect()
    }

    /// Get events filtered by engine name
    pub async fn by_engine(&self, engine: &str) -> Vec<DebuggerEvent> {
        let events = self.events.read().await;
        events
            .iter()
            .filter(|e| e.engine == engine)
            .cloned()
            .collect()
    }

    /// Get events filtered by event type
    pub async fn by_type(&self, event_type: DebugEventType) -> Vec<DebuggerEvent> {
        let events = self.events.read().await;
        events
            .iter()
            .filter(|e| e.event_type == event_type)
            .cloned()
            .collect()
    }

    /// Get events since a timestamp
    pub async fn since(&self, timestamp: i64) -> Vec<DebuggerEvent> {
        let events = self.events.read().await;
        events
            .iter()
            .filter(|e| e.timestamp >= timestamp)
            .cloned()
            .collect()
    }

    /// Get error events only
    pub async fn errors(&self) -> Vec<DebuggerEvent> {
        self.by_type(DebugEventType::Error).await
    }

    /// Clear all events
    pub async fn clear(&self) {
        let mut events = self.events.write().await;
        events.clear();
    }

    /// Enable debugging
    pub async fn enable(&self) {
        let mut enabled = self.enabled.write().await;
        *enabled = true;
    }

    /// Disable debugging
    pub async fn disable(&self) {
        let mut enabled = self.enabled.write().await;
        *enabled = false;
    }

    /// Check if debugging is enabled
    pub async fn is_enabled(&self) -> bool {
        *self.enabled.read().await
    }

    /// Get session statistics
    pub async fn stats(&self) -> DebuggerStats {
        let events = self.events.read().await;

        let total_events = events.len();
        let error_count = events
            .iter()
            .filter(|e| e.event_type == DebugEventType::Error)
            .count();

        let mut events_by_engine: std::collections::HashMap<String, usize> =
            std::collections::HashMap::new();
        let mut total_duration_ms: u128 = 0;
        let mut max_duration_ms: u128 = 0;
        let mut slowest_engine = String::new();

        for event in events.iter() {
            *events_by_engine.entry(event.engine.clone()).or_insert(0) += 1;
            total_duration_ms += event.duration_ms;

            if event.duration_ms > max_duration_ms {
                max_duration_ms = event.duration_ms;
                slowest_engine = event.engine.clone();
            }
        }

        let avg_duration_ms = if total_events > 0 {
            total_duration_ms / total_events as u128
        } else {
            0
        };

        DebuggerStats {
            session_start: self.session_start,
            total_events,
            error_count,
            events_by_engine,
            avg_duration_ms,
            max_duration_ms,
            slowest_engine,
        }
    }
}

impl Default for LiveDebugger {
    fn default() -> Self {
        Self::new()
    }
}

/// Statistics about the debugger session
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DebuggerStats {
    /// Session start timestamp
    pub session_start: i64,
    /// Total events recorded
    pub total_events: usize,
    /// Number of error events
    pub error_count: usize,
    /// Events grouped by engine
    pub events_by_engine: std::collections::HashMap<String, usize>,
    /// Average event duration
    pub avg_duration_ms: u128,
    /// Maximum event duration
    pub max_duration_ms: u128,
    /// Engine with slowest event
    pub slowest_engine: String,
}

// ═══════════════════════════════════════════════════════════════
// TESTS
// ═══════════════════════════════════════════════════════════════

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_debugger_record() {
        let dbg = LiveDebugger::new();

        dbg.record("TestEngine", 10, "Test event").await;

        let events = dbg.last(1).await;
        assert_eq!(events.len(), 1);
        assert_eq!(events[0].engine, "TestEngine");
        assert_eq!(events[0].duration_ms, 10);
    }

    #[tokio::test]
    async fn test_debugger_capacity() {
        let dbg = LiveDebugger::new();

        // Add more than MAX_EVENTS
        for i in 0..1100 {
            dbg.record("TestEngine", i as u128, format!("Event {}", i))
                .await;
        }

        let events = dbg.all().await;
        assert_eq!(events.len(), MAX_EVENTS);
    }

    #[tokio::test]
    async fn test_debugger_filter_by_engine() {
        let dbg = LiveDebugger::new();

        dbg.record("EngineA", 10, "A1").await;
        dbg.record("EngineB", 20, "B1").await;
        dbg.record("EngineA", 30, "A2").await;

        let engine_a_events = dbg.by_engine("EngineA").await;
        assert_eq!(engine_a_events.len(), 2);
    }

    #[tokio::test]
    async fn test_debugger_error_recording() {
        let dbg = LiveDebugger::new();

        dbg.record_error("TestEngine", "Something went wrong", 50)
            .await;

        let errors = dbg.errors().await;
        assert_eq!(errors.len(), 1);
        assert_eq!(errors[0].event_type, DebugEventType::Error);
    }

    #[tokio::test]
    async fn test_debugger_stats() {
        let dbg = LiveDebugger::new();

        dbg.record("EngineA", 10, "A1").await;
        dbg.record("EngineB", 100, "B1").await;
        dbg.record("EngineA", 20, "A2").await;

        let stats = dbg.stats().await;
        assert_eq!(stats.total_events, 3);
        assert_eq!(stats.max_duration_ms, 100);
        assert_eq!(stats.slowest_engine, "EngineB");
    }

    #[tokio::test]
    async fn test_debugger_enable_disable() {
        let dbg = LiveDebugger::new();

        dbg.record("Test", 10, "Event 1").await;

        dbg.disable().await;
        dbg.record("Test", 20, "Event 2").await; // Should not be recorded

        let events = dbg.all().await;
        assert_eq!(events.len(), 1);

        dbg.enable().await;
        dbg.record("Test", 30, "Event 3").await;

        let events = dbg.all().await;
        assert_eq!(events.len(), 2);
    }

    #[tokio::test]
    async fn test_debugger_clear() {
        let dbg = LiveDebugger::new();

        dbg.record("Test", 10, "Event").await;
        assert_eq!(dbg.all().await.len(), 1);

        dbg.clear().await;
        assert_eq!(dbg.all().await.len(), 0);
    }
}
