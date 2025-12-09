// ═══════════════════════════════════════════════════════════════
//   OMEGA EVENTS — Tauri Event Emission
//   SUPER PROMPT #8: DevTools integration via events
// ═══════════════════════════════════════════════════════════════

use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Manager};

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
    pub fn emit_step(&self, request_id: String, stage: String, engine: String, duration_ms: u64, success: bool) {
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
    pub fn emit_self_healing(&self, request_id: String, incident_id: String, action: String, success: bool) {
        self.emit(OmegaEvent::SelfHealing {
            request_id,
            incident_id,
            action,
            success,
        });
    }
    
    /// Emit pipeline complete
    pub fn emit_complete(&self, request_id: String, total_duration_ms: u64, engines_executed: usize, success: bool) {
        self.emit(OmegaEvent::Complete {
            request_id,
            total_duration_ms,
            engines_executed,
            success,
        });
    }
    
    /// Emit memory promotion
    pub fn emit_memory_promotion(&self, memory_id: String, from_tier: String, to_tier: String, reason: String) {
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
    fn test_event_serialization() {
        let event = OmegaEvent::Started {
            request_id: "test-123".to_string(),
            timestamp: 1234567890,
            input_type: "text".to_string(),
        };
        
        let json = serde_json::to_string(&event).unwrap();
        assert!(json.contains("Started"));
        assert!(json.contains("test-123"));
    }
}
