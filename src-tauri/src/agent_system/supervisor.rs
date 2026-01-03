//! ═══════════════════════════════════════════════════════════════════════════════
//! TITANE∞ v20Ω — AGENT SUPERVISOR
//! Super Prompt #19 — Supervision et orchestration des agents
//! ═══════════════════════════════════════════════════════════════════════════════

use super::agent::{Agent, AgentId, AgentState};
use super::{AgentSystemError, AgentTask, TaskResult, TaskStatus};
use serde::{Deserialize, Serialize};
use tokio::sync::RwLock;

/// Stratégie de supervision
#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub enum SupervisionStrategy {
    /// Supervision passive (monitoring uniquement)
    Passive,
    /// Supervision active (intervention si nécessaire)
    Active,
    /// Supervision stricte (validation de chaque action)
    Strict,
    /// Auto-supervision (l'agent se supervise lui-même)
    SelfSupervised,
}

impl Default for SupervisionStrategy {
    fn default() -> Self {
        Self::Active
    }
}

/// Configuration de supervision
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct SupervisionConfig {
    pub strategy: SupervisionStrategy,
    pub max_retries: u32,
    pub timeout_ms: u64,
    pub health_check_interval_ms: u64,
    pub auto_restart: bool,
}

impl Default for SupervisionConfig {
    fn default() -> Self {
        Self {
            strategy: SupervisionStrategy::Active,
            max_retries: 100,                // AUGMENTÉ: 3 → 100 (x33)
            timeout_ms: 600000,              // AUGMENTÉ: 60s → 600s (10 min)
            health_check_interval_ms: 30000, // AUGMENTÉ: 5s → 30s
            auto_restart: true,
        }
    }
}

/// Événement de supervision
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct SupervisionEvent {
    pub timestamp: u64,
    pub agent_id: AgentId,
    pub event_type: SupervisionEventType,
    pub message: String,
}

/// Type d'événement de supervision
#[derive(Clone, Debug, Serialize, Deserialize)]
pub enum SupervisionEventType {
    AgentStarted,
    AgentStopped,
    AgentRestarted,
    TaskAssigned,
    TaskCompleted,
    TaskFailed,
    TaskTimeout,
    HealthCheckPassed,
    HealthCheckFailed,
    ErrorDetected,
    InterventionRequired,
}

/// Superviseur d'agents
pub struct Supervisor {
    config: SupervisionConfig,
    running: RwLock<bool>,
    events: RwLock<Vec<SupervisionEvent>>,
    agent_health: RwLock<std::collections::HashMap<AgentId, AgentHealth>>,
}

impl Supervisor {
    pub fn new(config: SupervisionConfig) -> Self {
        Self {
            config,
            running: RwLock::new(false),
            events: RwLock::new(Vec::new()),
            agent_health: RwLock::new(std::collections::HashMap::new()),
        }
    }

    /// Démarre le superviseur
    pub async fn start(&self) {
        *self.running.write().await = true;
    }

    /// Arrête le superviseur
    pub async fn stop(&self) {
        *self.running.write().await = false;
    }

    /// Exécute une tâche via un agent
    pub async fn execute_task(
        &self,
        agent: &Agent,
        task: &AgentTask,
    ) -> Result<TaskResult, AgentSystemError> {
        let start = std::time::Instant::now();

        // Émettre événement
        self.emit_event(SupervisionEvent {
            timestamp: Self::now(),
            agent_id: agent.id.clone(),
            event_type: SupervisionEventType::TaskAssigned,
            message: format!("Task {} assigned", task.id),
        })
        .await;

        // Exécuter avec retry
        let mut attempts = 0;
        let mut last_error = None;

        while attempts <= self.config.max_retries {
            attempts += 1;

            match self.execute_with_timeout(agent, task).await {
                Ok(result) => {
                    self.emit_event(SupervisionEvent {
                        timestamp: Self::now(),
                        agent_id: agent.id.clone(),
                        event_type: SupervisionEventType::TaskCompleted,
                        message: format!("Task {} completed", task.id),
                    })
                    .await;

                    return Ok(result);
                }
                Err(e) => {
                    last_error = Some(e.clone());

                    if attempts <= self.config.max_retries {
                        self.emit_event(SupervisionEvent {
                            timestamp: Self::now(),
                            agent_id: agent.id.clone(),
                            event_type: SupervisionEventType::TaskFailed,
                            message: format!(
                                "Task {} failed (attempt {}), retrying...",
                                task.id, attempts
                            ),
                        })
                        .await;

                        // Attendre avant retry
                        tokio::time::sleep(tokio::time::Duration::from_millis(
                            1000 * attempts as u64,
                        ))
                        .await;
                    }
                }
            }
        }

        // Échec final
        self.emit_event(SupervisionEvent {
            timestamp: Self::now(),
            agent_id: agent.id.clone(),
            event_type: SupervisionEventType::TaskFailed,
            message: format!("Task {} failed after {} attempts", task.id, attempts),
        })
        .await;

        let error_msg = last_error.as_ref().map(|e| e.to_string());
        Ok(TaskResult {
            task_id: task.id.clone(),
            agent_id: agent.id.clone(),
            status: TaskStatus::Failed,
            output: serde_json::json!({ "error": error_msg }),
            duration_ms: start.elapsed().as_millis() as u64,
            errors: vec![error_msg.unwrap_or_default()],
        })
    }

    /// Exécute avec timeout
    async fn execute_with_timeout(
        &self,
        agent: &Agent,
        task: &AgentTask,
    ) -> Result<TaskResult, AgentSystemError> {
        let timeout = task.timeout_ms.min(self.config.timeout_ms);
        let start = std::time::Instant::now();

        // Simulation d'exécution (dans la vraie implémentation, ici on appellerait le vrai agent)
        let result = tokio::time::timeout(
            tokio::time::Duration::from_millis(timeout),
            self.simulate_execution(agent, task),
        )
        .await;

        match result {
            Ok(res) => res,
            Err(_) => {
                self.emit_event(SupervisionEvent {
                    timestamp: Self::now(),
                    agent_id: agent.id.clone(),
                    event_type: SupervisionEventType::TaskTimeout,
                    message: format!("Task {} timed out", task.id),
                })
                .await;

                Ok(TaskResult {
                    task_id: task.id.clone(),
                    agent_id: agent.id.clone(),
                    status: TaskStatus::Timeout,
                    output: serde_json::json!({}),
                    duration_ms: start.elapsed().as_millis() as u64,
                    errors: vec!["Task timeout".to_string()],
                })
            }
        }
    }

    /// Simule l'exécution d'une tâche
    async fn simulate_execution(
        &self,
        agent: &Agent,
        task: &AgentTask,
    ) -> Result<TaskResult, AgentSystemError> {
        // Dans une vraie implémentation, ici on exécuterait la logique de l'agent
        let start = std::time::Instant::now();

        // Simulation
        tokio::time::sleep(tokio::time::Duration::from_millis(100)).await;

        Ok(TaskResult {
            task_id: task.id.clone(),
            agent_id: agent.id.clone(),
            status: TaskStatus::Success,
            output: serde_json::json!({
                "message": format!("Task executed by {}", agent.name),
                "type": format!("{:?}", task.task_type),
            }),
            duration_ms: start.elapsed().as_millis() as u64,
            errors: vec![],
        })
    }

    /// Vérifie la santé d'un agent
    pub async fn check_health(&self, agent: &Agent) -> AgentHealth {
        let health = AgentHealth {
            agent_id: agent.id.clone(),
            is_healthy: agent.state != AgentState::Error && agent.state != AgentState::Terminated,
            last_check: Self::now(),
            performance_score: agent.performance_score,
            error_count: agent.tasks_failed as u32,
            consecutive_errors: 0, // Would need tracking
        };

        // Stocker la santé
        let mut agent_health = self.agent_health.write().await;
        agent_health.insert(agent.id.clone(), health.clone());

        // Émettre événement
        self.emit_event(SupervisionEvent {
            timestamp: Self::now(),
            agent_id: agent.id.clone(),
            event_type: if health.is_healthy {
                SupervisionEventType::HealthCheckPassed
            } else {
                SupervisionEventType::HealthCheckFailed
            },
            message: format!(
                "Health check: {}",
                if health.is_healthy {
                    "passed"
                } else {
                    "failed"
                }
            ),
        })
        .await;

        health
    }

    /// Récupère les événements récents
    pub async fn recent_events(&self, count: usize) -> Vec<SupervisionEvent> {
        let events = self.events.read().await;
        events.iter().rev().take(count).cloned().collect()
    }

    /// Émet un événement
    async fn emit_event(&self, event: SupervisionEvent) {
        let mut events = self.events.write().await;
        events.push(event);

        // Limiter la taille
        if events.len() > 1000 {
            events.remove(0);
        }
    }

    fn now() -> u64 {
        std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap_or_default()
            .as_millis() as u64
    }
}

impl Default for Supervisor {
    fn default() -> Self {
        Self::new(SupervisionConfig::default())
    }
}

/// Santé d'un agent
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct AgentHealth {
    pub agent_id: AgentId,
    pub is_healthy: bool,
    pub last_check: u64,
    pub performance_score: f32,
    pub error_count: u32,
    pub consecutive_errors: u32,
}

#[cfg(test)]
mod tests {
    use super::super::agent::AgentType;
    use super::*;

    #[tokio::test]
    async fn test_supervisor() {
        let supervisor = Supervisor::default();
        supervisor.start().await;

        let agent = Agent::new(AgentType::Researcher, "Test Agent");
        let health = supervisor.check_health(&agent).await;
        assert!(health.is_healthy);
    }
}
