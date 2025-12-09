//! ═══════════════════════════════════════════════════════════════════════════════
//! TITANE∞ vΩ — TASK DISTRIBUTOR
//! Super Prompt #20 — Distribution intelligente de charge cognitive
//! ═══════════════════════════════════════════════════════════════════════════════

use serde::{Deserialize, Serialize};
use std::collections::{HashMap, VecDeque};
use tokio::sync::RwLock;

/// Priorité de tâche
#[derive(Clone, Copy, Debug, PartialEq, Eq, PartialOrd, Ord, Serialize, Deserialize)]
pub enum TaskPriority {
    Critical = 4,
    High = 3,
    Normal = 2,
    Low = 1,
    Background = 0,
}

/// Tâche cognitive à distribuer
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct CognitiveTask {
    pub id: String,
    pub task_type: String,
    pub priority: TaskPriority,
    pub energy_cost: f32,
    pub agent_affinity: Option<String>,
    pub deadline_ms: Option<u64>,
    pub can_defer: bool,
    pub can_split: bool,
}

/// Agent disponible
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct AgentCapacity {
    pub agent_id: String,
    pub available_energy: f32,
    pub current_load: f32,
    pub max_load: f32,
    pub specialization: Vec<String>,
    pub fatigue_level: f32,
}

impl AgentCapacity {
    pub fn can_accept(&self, task: &CognitiveTask) -> bool {
        // Vérifier capacité énergétique
        if self.available_energy < task.energy_cost {
            return false;
        }

        // Vérifier charge actuelle
        let new_load = self.current_load + task.energy_cost;
        if new_load > self.max_load {
            return false;
        }

        // Vérifier fatigue
        if self.fatigue_level > 0.8 && task.priority != TaskPriority::Critical {
            return false;
        }

        true
    }

    pub fn affinity_score(&self, task: &CognitiveTask) -> f32 {
        if let Some(preferred) = &task.agent_affinity {
            if self.agent_id == *preferred {
                return 1.0;
            }
        }

        // Score basé sur spécialisation
        let specialization_match = self.specialization.iter()
            .any(|s| task.task_type.contains(s));

        if specialization_match {
            0.8
        } else {
            0.3
        }
    }
}

/// Décision de distribution
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct DistributionDecision {
    pub task_id: String,
    pub assigned_agent: Option<String>,
    pub action: DistributionAction,
    pub reason: String,
}

/// Action de distribution
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub enum DistributionAction {
    Assign,
    Defer,
    Queue,
    Reject,
    Split,
}

/// Distributeur de tâches
pub struct TaskDistributor {
    pending_tasks: RwLock<VecDeque<CognitiveTask>>,
    agent_registry: RwLock<HashMap<String, AgentCapacity>>,
    deferred_tasks: RwLock<Vec<CognitiveTask>>,
}

impl TaskDistributor {
    pub fn new() -> Self {
        Self {
            pending_tasks: RwLock::new(VecDeque::new()),
            agent_registry: RwLock::new(HashMap::new()),
            deferred_tasks: RwLock::new(Vec::new()),
        }
    }

    /// Enregistrer agent
    pub async fn register_agent(&self, agent: AgentCapacity) {
        let mut registry = self.agent_registry.write().await;
        registry.insert(agent.agent_id.clone(), agent);
    }

    /// Soumettre tâche
    pub async fn submit_task(&self, task: CognitiveTask) {
        let mut pending = self.pending_tasks.write().await;
        
        // Insertion triée par priorité
        let insert_pos = pending.iter()
            .position(|t| t.priority < task.priority)
            .unwrap_or(pending.len());
        
        pending.insert(insert_pos, task);
    }

    /// Distribuer tâches en attente
    pub async fn distribute(&self) -> Vec<DistributionDecision> {
        let mut decisions = Vec::new();
        let mut pending = self.pending_tasks.write().await;
        let registry = self.agent_registry.read().await;

        let tasks_to_process: Vec<CognitiveTask> = pending.drain(..).collect();

        for task in tasks_to_process {
            let decision = self.find_best_agent(&task, &registry).await;
            
            match decision.action {
                DistributionAction::Defer | DistributionAction::Queue => {
                    pending.push_back(task);
                }
                DistributionAction::Reject => {
                    // Task rejeté, log
                }
                _ => {}
            }

            decisions.push(decision);
        }

        decisions
    }

    /// Trouver meilleur agent pour tâche
    async fn find_best_agent(
        &self,
        task: &CognitiveTask,
        registry: &HashMap<String, AgentCapacity>,
    ) -> DistributionDecision {
        if registry.is_empty() {
            return DistributionDecision {
                task_id: task.id.clone(),
                assigned_agent: None,
                action: DistributionAction::Queue,
                reason: "No agents available".to_string(),
            };
        }

        // Filtrer agents capables
        let mut candidates: Vec<(&String, &AgentCapacity, f32)> = registry.iter()
            .filter(|(_, agent)| agent.can_accept(task))
            .map(|(id, agent)| {
                let score = agent.affinity_score(task)
                    * (1.0 - agent.fatigue_level)
                    * (1.0 - agent.current_load / agent.max_load);
                (id, agent, score)
            })
            .collect();

        if candidates.is_empty() {
            // Aucun agent capable
            if task.can_defer {
                return DistributionDecision {
                    task_id: task.id.clone(),
                    assigned_agent: None,
                    action: DistributionAction::Defer,
                    reason: "All agents at capacity, deferring".to_string(),
                };
            } else {
                return DistributionDecision {
                    task_id: task.id.clone(),
                    assigned_agent: None,
                    action: DistributionAction::Queue,
                    reason: "Waiting for agent capacity".to_string(),
                };
            }
        }

        // Trier par score décroissant
        candidates.sort_by(|a, b| b.2.partial_cmp(&a.2).unwrap_or(std::cmp::Ordering::Equal));

        // Phase 1 Stabilisation: Gérer cas où aucun candidat disponible
        let (best_agent_id, _, _) = match candidates.first() {
            Some(candidate) => candidate,
            None => {
                return DistributionDecision {
                    task_id: task.id.clone(),
                    assigned_agent: None,
                    action: DistributionAction::Queue,
                    reason: "No available agents".to_string(),
                };
            }
        };

        DistributionDecision {
            task_id: task.id.clone(),
            assigned_agent: Some((*best_agent_id).clone()),
            action: DistributionAction::Assign,
            reason: format!("Best agent: {}", best_agent_id),
        }
    }

    /// Obtenir statistiques
    pub async fn get_stats(&self) -> DistributorStats {
        let pending = self.pending_tasks.read().await;
        let deferred = self.deferred_tasks.read().await;
        let registry = self.agent_registry.read().await;

        DistributorStats {
            pending_tasks: pending.len(),
            deferred_tasks: deferred.len(),
            active_agents: registry.len(),
            total_agent_capacity: registry.values().map(|a| a.max_load).sum(),
            used_agent_capacity: registry.values().map(|a| a.current_load).sum(),
        }
    }

    /// Mettre à jour capacité agent
    pub async fn update_agent_capacity(&self, agent_id: &str, capacity: AgentCapacity) {
        let mut registry = self.agent_registry.write().await;
        registry.insert(agent_id.to_string(), capacity);
    }
}

/// Statistiques distributeur
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct DistributorStats {
    pub pending_tasks: usize,
    pub deferred_tasks: usize,
    pub active_agents: usize,
    pub total_agent_capacity: f32,
    pub used_agent_capacity: f32,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_distributor_creation() {
        let distributor = TaskDistributor::new();
        let stats = distributor.get_stats().await;
        
        assert_eq!(stats.pending_tasks, 0);
        assert_eq!(stats.active_agents, 0);
    }

    #[tokio::test]
    async fn test_agent_registration() {
        let distributor = TaskDistributor::new();
        
        let agent = AgentCapacity {
            agent_id: "agent_1".to_string(),
            available_energy: 100.0,
            current_load: 0.0,
            max_load: 100.0,
            specialization: vec!["reasoning".to_string()],
            fatigue_level: 0.0,
        };

        distributor.register_agent(agent).await;

        let stats = distributor.get_stats().await;
        assert_eq!(stats.active_agents, 1);
    }

    #[tokio::test]
    async fn test_task_submission() {
        let distributor = TaskDistributor::new();

        let task = CognitiveTask {
            id: "task_1".to_string(),
            task_type: "reasoning".to_string(),
            priority: TaskPriority::Normal,
            energy_cost: 10.0,
            agent_affinity: None,
            deadline_ms: None,
            can_defer: false,
            can_split: false,
        };

        distributor.submit_task(task).await;

        let stats = distributor.get_stats().await;
        assert_eq!(stats.pending_tasks, 1);
    }

    #[tokio::test]
    async fn test_task_distribution() {
        let distributor = TaskDistributor::new();

        // Register agent
        let agent = AgentCapacity {
            agent_id: "agent_1".to_string(),
            available_energy: 100.0,
            current_load: 0.0,
            max_load: 100.0,
            specialization: vec!["reasoning".to_string()],
            fatigue_level: 0.0,
        };
        distributor.register_agent(agent).await;

        // Submit task
        let task = CognitiveTask {
            id: "task_1".to_string(),
            task_type: "reasoning".to_string(),
            priority: TaskPriority::High,
            energy_cost: 10.0,
            agent_affinity: None,
            deadline_ms: None,
            can_defer: false,
            can_split: false,
        };
        distributor.submit_task(task).await;

        // Distribute
        let decisions = distributor.distribute().await;

        assert_eq!(decisions.len(), 1);
        assert_eq!(decisions[0].action, DistributionAction::Assign);
        assert_eq!(decisions[0].assigned_agent, Some("agent_1".to_string()));
    }

    #[tokio::test]
    async fn test_priority_ordering() {
        let distributor = TaskDistributor::new();

        // Submit low priority first
        distributor.submit_task(CognitiveTask {
            id: "task_low".to_string(),
            task_type: "test".to_string(),
            priority: TaskPriority::Low,
            energy_cost: 5.0,
            agent_affinity: None,
            deadline_ms: None,
            can_defer: true,
            can_split: false,
        }).await;

        // Submit high priority
        distributor.submit_task(CognitiveTask {
            id: "task_high".to_string(),
            task_type: "test".to_string(),
            priority: TaskPriority::Critical,
            energy_cost: 5.0,
            agent_affinity: None,
            deadline_ms: None,
            can_defer: false,
            can_split: false,
        }).await;

        // High priority should be first
        let pending = distributor.pending_tasks.read().await;
        assert!(!pending.is_empty(), "Pending tasks should not be empty");
        assert_eq!(pending.front().expect("First task should exist").id, "task_high");
    }
}
