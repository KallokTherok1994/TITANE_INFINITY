#![allow(unused_imports)]
#![allow(dead_code)]
// Agent Supervisor - Health Monitoring
use crate::agents::{Agent, AgentError, AgentId, AgentRegistry, AgentState};
use serde::{Deserialize, Serialize};
use std::sync::Arc;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SupervisorStats {
    pub total_monitored: usize,
    pub healthy_agents: usize,
    pub unhealthy_agents: usize,
    pub restarts_performed: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AgentHealth {
    pub agent_id: AgentId,
    pub is_healthy: bool,
    pub last_check: i64,
    pub success_rate: f32,
}

pub struct AgentSupervisor {
    registry: Arc<AgentRegistry>,
    check_interval_ms: u64,
    auto_restart: bool,
    restarts_performed: Arc<tokio::sync::RwLock<u32>>,
}

impl AgentSupervisor {
    pub fn new(registry: Arc<AgentRegistry>, check_interval_ms: u64, auto_restart: bool) -> Self {
        Self {
            registry,
            check_interval_ms,
            auto_restart,
            restarts_performed: Arc::new(tokio::sync::RwLock::new(0)),
        }
    }

    pub async fn check_health(&self, agent: &Agent) -> AgentHealth {
        let state = agent.get_state().await;
        let success_rate = agent.success_rate().await;
        let is_healthy =
            matches!(state, AgentState::Running | AgentState::Initialized) && success_rate > 0.5;

        AgentHealth {
            agent_id: agent.id.clone(),
            is_healthy,
            last_check: chrono::Utc::now().timestamp(),
            success_rate,
        }
    }

    pub async fn monitor_all(&self) -> Vec<AgentHealth> {
        let agents = self.registry.get_all().await;
        let mut healths = Vec::new();
        for agent in agents {
            healths.push(self.check_health(&agent).await);
        }
        healths
    }

    pub async fn stats(&self) -> SupervisorStats {
        let healths = self.monitor_all().await;
        let healthy = healths.iter().filter(|h| h.is_healthy).count();
        SupervisorStats {
            total_monitored: healths.len(),
            healthy_agents: healthy,
            unhealthy_agents: healths.len() - healthy,
            restarts_performed: *self.restarts_performed.read().await,
        }
    }
}
