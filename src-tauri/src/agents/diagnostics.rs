#![allow(unused_imports)]
#![allow(dead_code)]
// Agent Diagnostics & Events
use crate::agents::{Agent, AgentId, agent::AgentMetrics};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum AgentEvent {
    AgentStarted { id: AgentId, role: String, timestamp: i64 },
    AgentStopped { id: AgentId, reason: String, timestamp: i64 },
    TaskExecuted { id: AgentId, success: bool, duration_ms: u128, timestamp: i64 },
    MessageSent { from: AgentId, to: AgentId, timestamp: i64 },
    HealthCheckFailed { id: AgentId, reason: String, timestamp: i64 },
    ContractViolation { id: AgentId, violation: String, timestamp: i64 },
}

pub struct AgentDiagnostics {
    events: tokio::sync::RwLock<Vec<AgentEvent>>,
    max_events: usize,
}

impl AgentDiagnostics {
    pub fn new(max_events: usize) -> Self {
        Self {
            events: tokio::sync::RwLock::new(Vec::new()),
            max_events,
        }
    }

    pub async fn record(&self, event: AgentEvent) {
        let mut events = self.events.write().await;
        events.push(event);
        if events.len() > self.max_events {
            events.remove(0);
        }
    }

    pub async fn get_recent(&self, count: usize) -> Vec<AgentEvent> {
        let events = self.events.read().await;
        events.iter().rev().take(count).cloned().collect()
    }

    pub async fn get_all(&self) -> Vec<AgentEvent> {
        self.events.read().await.clone()
    }

    pub async fn clear(&self) {
        self.events.write().await.clear();
    }
}

impl Default for AgentDiagnostics {
    fn default() -> Self {
        Self::new(1000)
    }
}
