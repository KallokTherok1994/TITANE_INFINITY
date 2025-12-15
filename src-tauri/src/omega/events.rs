// ═══════════════════════════════════════════════════════════════
//   OMEGA EVENTS — Tauri Event Emission
//   SUPER PROMPT #8: DevTools integration via events
// ═══════════════════════════════════════════════════════════════

use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Emitter};

/// OMEGA Event Types
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type")]
pub enum OmegaEvent {
    /// Pipeline started
    Started {
        request_id: String,
        timestamp: u64,
        input_type: String,
    },

    /// Pipeline step completed
    Step {
        request_id: String,
        stage: String,
        engine: String,
        duration_ms: u64,
        success: bool,
    },

    /// Memory context loaded
    MemoryLoaded {
        request_id: String,
        stm_count: usize,
        mtm_count: usize,
        ltm_count: usize,
        vector_count: usize,
        duration_ms: u64,
    },

    /// Engine warning
    Warning {
        request_id: String,
        engine: String,
        message: String,
    },

    /// Engine error
    Error {
        request_id: String,
        engine: String,
        error: String,
        recoverable: bool,
    },

    /// Self-healing triggered
    SelfHealing {
        request_id: String,
        incident_id: String,
        action: String,
        success: bool,
    },

    /// Pipeline completed
    Complete {
        request_id: String,
        total_duration_ms: u64,
        engines_executed: usize,
        success: bool,
    },

    /// Memory promotion
    MemoryPromotion {
        memory_id: String,
        from_tier: String,
        to_tier: String,
        reason: String,
    },
}

/// Event Emitter
pub struct OmegaEventEmitter {
    app_handle: AppHandle,
}

impl OmegaEventEmitter {
    pub fn new(app_handle: AppHandle) -> Self {
        Self { app_handle }
    }

    /// Emit event
    pub fn emit(&self, event: OmegaEvent) {
        if let Err(e) = self.app_handle.emit("omega_event", &event) {
            log::warn!("Failed to emit OMEGA event: {:?}", e);
        }
    }

    /// Emit pipeline started
    pub fn emit_started(&self, request_id: String, input_type: String) {
        self.emit(OmegaEvent::Started {
            request_id,
            timestamp: chrono::Utc::now().timestamp() as u64,
            input_type,
        });
    }

    /// Emit pipeline step
    pub fn emit_step(
        &self,
        request_id: String,
        stage: String,
        engine: String,
        duration_ms: u64,
        success: bool,
    ) {
        self.emit(OmegaEvent::Step {
            request_id,
            stage,
            engine,
            duration_ms,
            success,
        });
    }

    /// Emit memory loaded
    pub fn emit_memory_loaded(
        &self,
        request_id: String,
        stm_count: usize,
        mtm_count: usize,
        ltm_count: usize,
        vector_count: usize,
        duration_ms: u64,
    ) {
        self.emit(OmegaEvent::MemoryLoaded {
            request_id,
            stm_count,
            mtm_count,
            ltm_count,
            vector_count,
            duration_ms,
        });
    }

    /// Emit warning
    pub fn emit_warning(&self, request_id: String, engine: String, message: String) {
        self.emit(OmegaEvent::Warning {
            request_id,
            engine,
            message,
        });
    }

    /// Emit error
    pub fn emit_error(&self, request_id: String, engine: String, error: String, recoverable: bool) {
        self.emit(OmegaEvent::Error {
            request_id,
            engine,
            error,
            recoverable,
        });
    }

    /// Emit self-healing
    pub fn emit_self_healing(
        &self,
        request_id: String,
        incident_id: String,
        action: String,
        success: bool,
    ) {
        self.emit(OmegaEvent::SelfHealing {
            request_id,
            incident_id,
            action,
            success,
        });
    }

    /// Emit pipeline complete
    pub fn emit_complete(
        &self,
        request_id: String,
        total_duration_ms: u64,
        engines_executed: usize,
        success: bool,
    ) {
        self.emit(OmegaEvent::Complete {
            request_id,
            total_duration_ms,
            engines_executed,
            success,
        });
    }

    /// Emit memory promotion
    pub fn emit_memory_promotion(
        &self,
        memory_id: String,
        from_tier: String,
        to_tier: String,
        reason: String,
    ) {
        self.emit(OmegaEvent::MemoryPromotion {
            memory_id,
            from_tier,
            to_tier,
            reason,
        });
    }
}

/// Subscribe to OMEGA events (Rust side)
#[allow(dead_code)]
pub struct OmegaEventSubscriber {
    // TODO: Implement event subscriber pattern
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_event_serialization() -> Result<(), serde_json::Error> {
        let event = OmegaEvent::Started {
            request_id: "test-123".to_string(),
            timestamp: 1234567890,
            input_type: "text".to_string(),
        };

        let json = serde_json::to_string(&event)?;
        assert!(json.contains("Started"));
        assert!(json.contains("test-123"));
        Ok(())
    }

    #[test]
    fn test_started_event() {
        let event = OmegaEvent::Started {
            request_id: "req-001".to_string(),
            timestamp: 1700000000,
            input_type: "voice".to_string(),
        };

        if let OmegaEvent::Started {
            request_id,
            timestamp,
            input_type,
        } = event
        {
            assert_eq!(request_id, "req-001");
            assert_eq!(timestamp, 1700000000);
            assert_eq!(input_type, "voice");
        } else {
            panic!("Wrong event type");
        }
    }

    #[test]
    fn test_step_event() -> Result<(), serde_json::Error> {
        let event = OmegaEvent::Step {
            request_id: "req-002".to_string(),
            stage: "Router".to_string(),
            engine: "IntentClassifier".to_string(),
            duration_ms: 150,
            success: true,
        };

        let json = serde_json::to_string(&event)?;
        assert!(json.contains("Step"));
        assert!(json.contains("Router"));
        assert!(json.contains("IntentClassifier"));
        Ok(())
    }

    #[test]
    fn test_step_event_failure() {
        let event = OmegaEvent::Step {
            request_id: "req-003".to_string(),
            stage: "Executor".to_string(),
            engine: "TaskExecutor".to_string(),
            duration_ms: 500,
            success: false,
        };

        if let OmegaEvent::Step { success, .. } = event {
            assert!(!success);
        }
    }

    #[test]
    fn test_memory_loaded_event() {
        let event = OmegaEvent::MemoryLoaded {
            request_id: "req-004".to_string(),
            stm_count: 10,
            mtm_count: 50,
            ltm_count: 200,
            vector_count: 1000,
            duration_ms: 45,
        };

        if let OmegaEvent::MemoryLoaded {
            stm_count,
            mtm_count,
            ltm_count,
            vector_count,
            ..
        } = event
        {
            assert_eq!(stm_count, 10);
            assert_eq!(mtm_count, 50);
            assert_eq!(ltm_count, 200);
            assert_eq!(vector_count, 1000);
        }
    }

    #[test]
    fn test_warning_event() -> Result<(), serde_json::Error> {
        let event = OmegaEvent::Warning {
            request_id: "req-005".to_string(),
            engine: "MemoryEngine".to_string(),
            message: "High memory usage detected".to_string(),
        };

        let json = serde_json::to_string(&event)?;
        assert!(json.contains("Warning"));
        assert!(json.contains("High memory usage"));
        Ok(())
    }

    #[test]
    fn test_error_event_recoverable() {
        let event = OmegaEvent::Error {
            request_id: "req-006".to_string(),
            engine: "APIHub".to_string(),
            error: "Connection timeout".to_string(),
            recoverable: true,
        };

        if let OmegaEvent::Error { recoverable, .. } = event {
            assert!(recoverable);
        }
    }

    #[test]
    fn test_error_event_non_recoverable() {
        let event = OmegaEvent::Error {
            request_id: "req-007".to_string(),
            engine: "Kernel".to_string(),
            error: "Critical failure".to_string(),
            recoverable: false,
        };

        if let OmegaEvent::Error {
            error, recoverable, ..
        } = event
        {
            assert!(!recoverable);
            assert_eq!(error, "Critical failure");
        }
    }

    #[test]
    fn test_self_healing_event_success() -> Result<(), serde_json::Error> {
        let event = OmegaEvent::SelfHealing {
            request_id: "req-008".to_string(),
            incident_id: "incident-001".to_string(),
            action: "restart_service".to_string(),
            success: true,
        };

        let json = serde_json::to_string(&event)?;
        assert!(json.contains("SelfHealing"));
        assert!(json.contains("incident-001"));
        assert!(json.contains("restart_service"));
        Ok(())
    }

    #[test]
    fn test_self_healing_event_failure() {
        let event = OmegaEvent::SelfHealing {
            request_id: "req-009".to_string(),
            incident_id: "incident-002".to_string(),
            action: "memory_cleanup".to_string(),
            success: false,
        };

        if let OmegaEvent::SelfHealing {
            success, action, ..
        } = event
        {
            assert!(!success);
            assert_eq!(action, "memory_cleanup");
        }
    }

    #[test]
    fn test_complete_event_success() {
        let event = OmegaEvent::Complete {
            request_id: "req-010".to_string(),
            total_duration_ms: 2500,
            engines_executed: 5,
            success: true,
        };

        if let OmegaEvent::Complete {
            total_duration_ms,
            engines_executed,
            success,
            ..
        } = event
        {
            assert_eq!(total_duration_ms, 2500);
            assert_eq!(engines_executed, 5);
            assert!(success);
        }
    }

    #[test]
    fn test_complete_event_failure() -> Result<(), serde_json::Error> {
        let event = OmegaEvent::Complete {
            request_id: "req-011".to_string(),
            total_duration_ms: 800,
            engines_executed: 2,
            success: false,
        };

        let json = serde_json::to_string(&event)?;
        assert!(json.contains("Complete"));
        assert!(json.contains("false"));
        Ok(())
    }

    #[test]
    fn test_memory_promotion_event() {
        let event = OmegaEvent::MemoryPromotion {
            memory_id: "mem-001".to_string(),
            from_tier: "STM".to_string(),
            to_tier: "MTM".to_string(),
            reason: "High relevance score".to_string(),
        };

        if let OmegaEvent::MemoryPromotion {
            from_tier, to_tier, ..
        } = event
        {
            assert_eq!(from_tier, "STM");
            assert_eq!(to_tier, "MTM");
        }
    }

    #[test]
    fn test_memory_promotion_ltm() -> Result<(), serde_json::Error> {
        let event = OmegaEvent::MemoryPromotion {
            memory_id: "mem-002".to_string(),
            from_tier: "MTM".to_string(),
            to_tier: "LTM".to_string(),
            reason: "Repeated access pattern".to_string(),
        };

        let json = serde_json::to_string(&event)?;
        assert!(json.contains("MemoryPromotion"));
        assert!(json.contains("MTM"));
        assert!(json.contains("LTM"));
        Ok(())
    }

    #[test]
    fn test_event_clone() {
        let event = OmegaEvent::Started {
            request_id: "clone-test".to_string(),
            timestamp: 123456,
            input_type: "text".to_string(),
        };

        let cloned = event.clone();
        if let OmegaEvent::Started { request_id, .. } = cloned {
            assert_eq!(request_id, "clone-test");
        }
    }

    #[test]
    fn test_event_debug() {
        let event = OmegaEvent::Warning {
            request_id: "debug-test".to_string(),
            engine: "TestEngine".to_string(),
            message: "Debug message".to_string(),
        };

        let debug_str = format!("{:?}", event);
        assert!(debug_str.contains("Warning"));
        assert!(debug_str.contains("debug-test"));
    }

    #[test]
    fn test_all_event_types_serializable() {
        let events = vec![
            OmegaEvent::Started {
                request_id: "1".to_string(),
                timestamp: 0,
                input_type: "t".to_string(),
            },
            OmegaEvent::Step {
                request_id: "2".to_string(),
                stage: "s".to_string(),
                engine: "e".to_string(),
                duration_ms: 0,
                success: true,
            },
            OmegaEvent::MemoryLoaded {
                request_id: "3".to_string(),
                stm_count: 0,
                mtm_count: 0,
                ltm_count: 0,
                vector_count: 0,
                duration_ms: 0,
            },
            OmegaEvent::Warning {
                request_id: "4".to_string(),
                engine: "e".to_string(),
                message: "m".to_string(),
            },
            OmegaEvent::Error {
                request_id: "5".to_string(),
                engine: "e".to_string(),
                error: "e".to_string(),
                recoverable: false,
            },
            OmegaEvent::SelfHealing {
                request_id: "6".to_string(),
                incident_id: "i".to_string(),
                action: "a".to_string(),
                success: true,
            },
            OmegaEvent::Complete {
                request_id: "7".to_string(),
                total_duration_ms: 0,
                engines_executed: 0,
                success: true,
            },
            OmegaEvent::MemoryPromotion {
                memory_id: "8".to_string(),
                from_tier: "f".to_string(),
                to_tier: "t".to_string(),
                reason: "r".to_string(),
            },
        ];

        for event in events {
            let result = serde_json::to_string(&event);
            assert!(result.is_ok());
        }
    }

    #[test]
    fn test_event_deserialization() -> Result<(), serde_json::Error> {
        let json = r#"{"type":"Started","request_id":"test","timestamp":123,"input_type":"text"}"#;
        let event: OmegaEvent = serde_json::from_str(json)?;

        if let OmegaEvent::Started { request_id, .. } = event {
            assert_eq!(request_id, "test");
        } else {
            panic!("Wrong event type after deserialization");
        }
        Ok(())
    }

    #[test]
    fn test_step_event_deserialization() -> Result<(), serde_json::Error> {
        let json = r#"{"type":"Step","request_id":"r","stage":"s","engine":"e","duration_ms":100,"success":false}"#;
        let event: OmegaEvent = serde_json::from_str(json)?;

        if let OmegaEvent::Step {
            duration_ms,
            success,
            ..
        } = event
        {
            assert_eq!(duration_ms, 100);
            assert!(!success);
        }
        Ok(())
    }

    #[test]
    fn test_memory_loaded_zero_counts() -> Result<(), serde_json::Error> {
        let event = OmegaEvent::MemoryLoaded {
            request_id: "empty".to_string(),
            stm_count: 0,
            mtm_count: 0,
            ltm_count: 0,
            vector_count: 0,
            duration_ms: 1,
        };

        let json = serde_json::to_string(&event)?;
        assert!(json.contains("\"stm_count\":0"));
        Ok(())
    }

    #[test]
    fn test_complete_event_zero_engines() {
        let event = OmegaEvent::Complete {
            request_id: "empty-pipeline".to_string(),
            total_duration_ms: 0,
            engines_executed: 0,
            success: false,
        };

        if let OmegaEvent::Complete {
            engines_executed, ..
        } = event
        {
            assert_eq!(engines_executed, 0);
        }
    }
}
