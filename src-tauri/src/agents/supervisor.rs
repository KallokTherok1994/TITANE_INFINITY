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

// ═══════════════════════════════════════════════════════════════════════════
// TESTS UNITAIRES
// ═══════════════════════════════════════════════════════════════════════════

#[cfg(test)]
mod tests {
    use super::*;

    // ─────────────────────────────────────────────────────────────────────
    // Tests SupervisorStats
    // ─────────────────────────────────────────────────────────────────────

    #[test]
    fn test_supervisor_stats_default() {
        let stats = SupervisorStats {
            total_monitored: 0,
            healthy_agents: 0,
            unhealthy_agents: 0,
            restarts_performed: 0,
        };
        assert_eq!(stats.total_monitored, 0);
        assert_eq!(stats.healthy_agents, 0);
    }

    #[test]
    fn test_supervisor_stats_with_values() {
        let stats = SupervisorStats {
            total_monitored: 10,
            healthy_agents: 8,
            unhealthy_agents: 2,
            restarts_performed: 5,
        };
        assert_eq!(stats.total_monitored, 10);
        assert_eq!(stats.healthy_agents, 8);
        assert_eq!(stats.unhealthy_agents, 2);
        assert_eq!(stats.restarts_performed, 5);
    }

    #[test]
    fn test_supervisor_stats_debug() {
        let stats = SupervisorStats {
            total_monitored: 5,
            healthy_agents: 4,
            unhealthy_agents: 1,
            restarts_performed: 2,
        };
        let debug_str = format!("{:?}", stats);
        assert!(debug_str.contains("SupervisorStats"));
        assert!(debug_str.contains("total_monitored"));
    }

    #[test]
    fn test_supervisor_stats_clone() {
        let stats = SupervisorStats {
            total_monitored: 10,
            healthy_agents: 7,
            unhealthy_agents: 3,
            restarts_performed: 1,
        };
        let cloned = stats.clone();
        assert_eq!(cloned.total_monitored, stats.total_monitored);
        assert_eq!(cloned.healthy_agents, stats.healthy_agents);
    }

    #[test]
    fn test_supervisor_stats_serialize() {
        let stats = SupervisorStats {
            total_monitored: 5,
            healthy_agents: 4,
            unhealthy_agents: 1,
            restarts_performed: 0,
        };
        let json = serde_json::to_string(&stats).unwrap();
        assert!(json.contains("\"total_monitored\":5"));
        assert!(json.contains("\"healthy_agents\":4"));
    }

    #[test]
    fn test_supervisor_stats_deserialize() {
        let json = r#"{"total_monitored":10,"healthy_agents":8,"unhealthy_agents":2,"restarts_performed":3}"#;
        let stats: SupervisorStats = serde_json::from_str(json).unwrap();
        assert_eq!(stats.total_monitored, 10);
        assert_eq!(stats.healthy_agents, 8);
        assert_eq!(stats.unhealthy_agents, 2);
        assert_eq!(stats.restarts_performed, 3);
    }

    #[test]
    fn test_supervisor_stats_roundtrip() {
        let stats = SupervisorStats {
            total_monitored: 15,
            healthy_agents: 12,
            unhealthy_agents: 3,
            restarts_performed: 7,
        };
        let json = serde_json::to_string(&stats).unwrap();
        let restored: SupervisorStats = serde_json::from_str(&json).unwrap();
        assert_eq!(restored.total_monitored, 15);
        assert_eq!(restored.restarts_performed, 7);
    }

    // ─────────────────────────────────────────────────────────────────────
    // Tests AgentHealth
    // ─────────────────────────────────────────────────────────────────────

    #[test]
    fn test_agent_health_healthy() {
        let health = AgentHealth {
            agent_id: AgentId::new("agent1"),
            is_healthy: true,
            last_check: 1234567890,
            success_rate: 0.95,
        };
        assert!(health.is_healthy);
        assert_eq!(health.success_rate, 0.95);
    }

    #[test]
    fn test_agent_health_unhealthy() {
        let health = AgentHealth {
            agent_id: AgentId::new("agent1"),
            is_healthy: false,
            last_check: 1234567890,
            success_rate: 0.3,
        };
        assert!(!health.is_healthy);
        assert_eq!(health.success_rate, 0.3);
    }

    #[test]
    fn test_agent_health_debug() {
        let health = AgentHealth {
            agent_id: AgentId::new("agent1"),
            is_healthy: true,
            last_check: 1234567890,
            success_rate: 0.8,
        };
        let debug_str = format!("{:?}", health);
        assert!(debug_str.contains("AgentHealth"));
        assert!(debug_str.contains("agent1"));
    }

    #[test]
    fn test_agent_health_clone() {
        let health = AgentHealth {
            agent_id: AgentId::new("agent1"),
            is_healthy: true,
            last_check: 1234567890,
            success_rate: 0.9,
        };
        let cloned = health.clone();
        assert_eq!(cloned.agent_id.as_str(), "agent1");
        assert_eq!(cloned.is_healthy, health.is_healthy);
    }

    #[test]
    fn test_agent_health_serialize() {
        let health = AgentHealth {
            agent_id: AgentId::new("agent1"),
            is_healthy: true,
            last_check: 1234567890,
            success_rate: 0.85,
        };
        let json = serde_json::to_string(&health).unwrap();
        assert!(json.contains("agent1"));
        assert!(json.contains("\"is_healthy\":true"));
    }

    #[test]
    fn test_agent_health_deserialize() {
        let json = r#"{"agent_id":"test_agent","is_healthy":false,"last_check":999,"success_rate":0.4}"#;
        let health: AgentHealth = serde_json::from_str(json).unwrap();
        assert_eq!(health.agent_id.as_str(), "test_agent");
        assert!(!health.is_healthy);
        assert_eq!(health.success_rate, 0.4);
    }

    #[test]
    fn test_agent_health_zero_success_rate() {
        let health = AgentHealth {
            agent_id: AgentId::new("failing_agent"),
            is_healthy: false,
            last_check: 0,
            success_rate: 0.0,
        };
        assert_eq!(health.success_rate, 0.0);
    }

    #[test]
    fn test_agent_health_perfect_success_rate() {
        let health = AgentHealth {
            agent_id: AgentId::new("perfect_agent"),
            is_healthy: true,
            last_check: 1000,
            success_rate: 1.0,
        };
        assert_eq!(health.success_rate, 1.0);
    }

    // ─────────────────────────────────────────────────────────────────────
    // Tests AgentSupervisor création
    // ─────────────────────────────────────────────────────────────────────

    #[tokio::test]
    async fn test_agent_supervisor_new() {
        let registry = Arc::new(AgentRegistry::new(100));
        let supervisor = AgentSupervisor::new(registry, 1000, true);
        let _ = supervisor;
    }

    #[tokio::test]
    async fn test_agent_supervisor_new_no_auto_restart() {
        let registry = Arc::new(AgentRegistry::new(100));
        let supervisor = AgentSupervisor::new(registry, 500, false);
        assert!(!supervisor.auto_restart);
    }

    #[tokio::test]
    async fn test_agent_supervisor_new_with_interval() {
        let registry = Arc::new(AgentRegistry::new(100));
        let supervisor = AgentSupervisor::new(registry, 5000, true);
        assert_eq!(supervisor.check_interval_ms, 5000);
    }

    // ─────────────────────────────────────────────────────────────────────
    // Tests AgentSupervisor monitor
    // ─────────────────────────────────────────────────────────────────────

    #[tokio::test]
    async fn test_monitor_all_empty() {
        let registry = Arc::new(AgentRegistry::new(100));
        let supervisor = AgentSupervisor::new(registry, 1000, true);
        let healths = supervisor.monitor_all().await;
        assert!(healths.is_empty());
    }

    #[tokio::test]
    async fn test_monitor_all_with_agents() {
        let registry = Arc::new(AgentRegistry::new(100));

        use crate::agents::{Agent, AgentRole};
        let agent = Agent::new(AgentId::new("agent1"), AgentRole::Executor);
        registry.register(agent).await.unwrap();

        let supervisor = AgentSupervisor::new(registry, 1000, true);
        let healths = supervisor.monitor_all().await;
        assert_eq!(healths.len(), 1);
    }

    #[tokio::test]
    async fn test_check_health() {
        let registry = Arc::new(AgentRegistry::new(100));

        use crate::agents::{Agent, AgentRole};
        let agent = Agent::new(AgentId::new("agent1"), AgentRole::Executor);

        let supervisor = AgentSupervisor::new(registry, 1000, true);
        let health = supervisor.check_health(&agent).await;

        assert_eq!(health.agent_id.as_str(), "agent1");
    }

    // ─────────────────────────────────────────────────────────────────────
    // Tests AgentSupervisor stats
    // ─────────────────────────────────────────────────────────────────────

    #[tokio::test]
    async fn test_stats_empty() {
        let registry = Arc::new(AgentRegistry::new(100));
        let supervisor = AgentSupervisor::new(registry, 1000, true);
        let stats = supervisor.stats().await;

        assert_eq!(stats.total_monitored, 0);
        assert_eq!(stats.healthy_agents, 0);
        assert_eq!(stats.unhealthy_agents, 0);
        assert_eq!(stats.restarts_performed, 0);
    }

    #[tokio::test]
    async fn test_stats_with_agents() {
        let registry = Arc::new(AgentRegistry::new(100));

        use crate::agents::{Agent, AgentRole};
        for i in 0..3 {
            let agent = Agent::new(AgentId::new(&format!("agent{}", i)), AgentRole::Executor);
            registry.register(agent).await.unwrap();
        }

        let supervisor = AgentSupervisor::new(registry, 1000, true);
        let stats = supervisor.stats().await;

        assert_eq!(stats.total_monitored, 3);
    }

    #[tokio::test]
    async fn test_stats_consistency() {
        let registry = Arc::new(AgentRegistry::new(100));
        let supervisor = AgentSupervisor::new(registry, 1000, true);
        let stats = supervisor.stats().await;

        // healthy + unhealthy = total
        assert_eq!(stats.healthy_agents + stats.unhealthy_agents, stats.total_monitored);
    }
}
