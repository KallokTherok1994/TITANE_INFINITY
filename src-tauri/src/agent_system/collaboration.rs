//! ═══════════════════════════════════════════════════════════════════════════════
//! TITANE∞ v20Ω — AGENT COLLABORATION
//! Super Prompt #19 — Collaboration inter-agents
//! ═══════════════════════════════════════════════════════════════════════════════

use super::agent::AgentId;
use super::communication::MessageBus;
use super::registry::AgentRegistry;
use super::AgentSystemError;
use serde::{Deserialize, Serialize};

/// Mode de collaboration
#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub enum CollaborationMode {
    /// Séquentiel: agents travaillent l'un après l'autre
    Sequential,
    /// Parallèle: agents travaillent simultanément
    Parallel,
    /// Pipeline: sortie d'un agent = entrée du suivant
    Pipeline,
    /// Vote: consensus entre agents
    Voting,
    /// Hiérarchique: un agent coordonne les autres
    Hierarchical,
    /// Peer-to-peer: agents communiquent directement
    PeerToPeer,
}

/// Collaboration entre agents
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Collaboration {
    pub id: String,
    pub mode: CollaborationMode,
    pub participants: Vec<AgentId>,
    pub objective: String,
    pub created_at: u64,
    pub status: CollaborationStatus,
    pub results: Vec<CollaborationContribution>,
}

impl Collaboration {
    pub fn new(mode: CollaborationMode, participants: Vec<AgentId>, objective: &str) -> Self {
        Self {
            id: uuid::Uuid::new_v4().to_string(),
            mode,
            participants,
            objective: objective.to_string(),
            created_at: Self::now(),
            status: CollaborationStatus::Pending,
            results: Vec::new(),
        }
    }

    /// Exécute la collaboration
    pub async fn execute(
        mut self,
        registry: &AgentRegistry,
        message_bus: &MessageBus,
    ) -> Result<CollaborationResult, AgentSystemError> {
        self.status = CollaborationStatus::Active;

        let result = match self.mode {
            CollaborationMode::Sequential => self.execute_sequential(registry, message_bus).await,
            CollaborationMode::Parallel => self.execute_parallel(registry, message_bus).await,
            CollaborationMode::Pipeline => self.execute_pipeline(registry, message_bus).await,
            CollaborationMode::Voting => self.execute_voting(registry, message_bus).await,
            CollaborationMode::Hierarchical => {
                self.execute_hierarchical(registry, message_bus).await
            }
            CollaborationMode::PeerToPeer => self.execute_p2p(registry, message_bus).await,
        };

        self.status = if result.is_ok() {
            CollaborationStatus::Completed
        } else {
            CollaborationStatus::Failed
        };

        result
    }

    async fn execute_sequential(
        &mut self,
        registry: &AgentRegistry,
        _message_bus: &MessageBus,
    ) -> Result<CollaborationResult, AgentSystemError> {
        let mut outputs = Vec::new();

        for agent_id in &self.participants {
            let agent = registry
                .get(agent_id)
                .await
                .ok_or(AgentSystemError::AgentNotFound(agent_id.clone()))?;

            // Simulation d'exécution
            let contribution = CollaborationContribution {
                agent_id: agent_id.clone(),
                output: serde_json::json!({
                    "message": format!("Sequential contribution from {}", agent.name),
                }),
                timestamp: Self::now(),
            };

            self.results.push(contribution.clone());
            outputs.push(contribution.output);
        }

        Ok(CollaborationResult {
            collaboration_id: self.id.clone(),
            mode: self.mode,
            success: true,
            final_output: serde_json::json!({ "outputs": outputs }),
            contributions: self.results.clone(),
            duration_ms: Self::now() - self.created_at,
        })
    }

    async fn execute_parallel(
        &mut self,
        registry: &AgentRegistry,
        _message_bus: &MessageBus,
    ) -> Result<CollaborationResult, AgentSystemError> {
        let mut handles = Vec::new();

        for agent_id in &self.participants {
            let agent_id = agent_id.clone();
            let agent_opt = registry.get(&agent_id).await;

            handles.push(tokio::spawn(async move {
                if let Some(agent) = agent_opt {
                    // Simulation parallèle
                    tokio::time::sleep(tokio::time::Duration::from_millis(50)).await;
                    Some(CollaborationContribution {
                        agent_id: agent_id.clone(),
                        output: serde_json::json!({
                            "message": format!("Parallel contribution from {}", agent.name),
                        }),
                        timestamp: std::time::SystemTime::now()
                            .duration_since(std::time::UNIX_EPOCH)
                            .unwrap_or_default()
                            .as_millis() as u64,
                    })
                } else {
                    None
                }
            }));
        }

        // Collecter les résultats
        for handle in handles {
            if let Ok(Some(contribution)) = handle.await {
                self.results.push(contribution);
            }
        }

        Ok(CollaborationResult {
            collaboration_id: self.id.clone(),
            mode: self.mode,
            success: true,
            final_output: serde_json::json!({
                "contributions": self.results.len(),
            }),
            contributions: self.results.clone(),
            duration_ms: Self::now() - self.created_at,
        })
    }

    async fn execute_pipeline(
        &mut self,
        registry: &AgentRegistry,
        _message_bus: &MessageBus,
    ) -> Result<CollaborationResult, AgentSystemError> {
        let mut current_output = serde_json::json!({ "initial": self.objective });

        for agent_id in &self.participants {
            let agent = registry
                .get(agent_id)
                .await
                .ok_or(AgentSystemError::AgentNotFound(agent_id.clone()))?;

            // Transformer la sortie
            current_output = serde_json::json!({
                "processed_by": agent.name,
                "input": current_output,
                "output": format!("Transformed by {}", agent.name),
            });

            self.results.push(CollaborationContribution {
                agent_id: agent_id.clone(),
                output: current_output.clone(),
                timestamp: Self::now(),
            });
        }

        Ok(CollaborationResult {
            collaboration_id: self.id.clone(),
            mode: self.mode,
            success: true,
            final_output: current_output,
            contributions: self.results.clone(),
            duration_ms: Self::now() - self.created_at,
        })
    }

    async fn execute_voting(
        &mut self,
        registry: &AgentRegistry,
        _message_bus: &MessageBus,
    ) -> Result<CollaborationResult, AgentSystemError> {
        let mut votes: std::collections::HashMap<String, u32> = std::collections::HashMap::new();

        for agent_id in &self.participants {
            let agent = registry
                .get(agent_id)
                .await
                .ok_or(AgentSystemError::AgentNotFound(agent_id.clone()))?;

            // Simulation de vote
            let vote = format!("option_{}", (agent.performance_score * 3.0) as u32 % 3);
            *votes.entry(vote.clone()).or_insert(0) += 1;

            self.results.push(CollaborationContribution {
                agent_id: agent_id.clone(),
                output: serde_json::json!({ "vote": vote }),
                timestamp: Self::now(),
            });
        }

        // Trouver le gagnant
        let winner = votes
            .iter()
            .max_by_key(|(_, count)| *count)
            .map(|(option, _)| option.clone())
            .unwrap_or_default();

        Ok(CollaborationResult {
            collaboration_id: self.id.clone(),
            mode: self.mode,
            success: true,
            final_output: serde_json::json!({
                "winner": winner,
                "votes": votes,
            }),
            contributions: self.results.clone(),
            duration_ms: Self::now() - self.created_at,
        })
    }

    async fn execute_hierarchical(
        &mut self,
        registry: &AgentRegistry,
        _message_bus: &MessageBus,
    ) -> Result<CollaborationResult, AgentSystemError> {
        if self.participants.is_empty() {
            return Err(AgentSystemError::CollaborationFailed(
                "No participants".to_string(),
            ));
        }

        let coordinator_id = &self.participants[0];
        let coordinator = registry
            .get(coordinator_id)
            .await
            .ok_or(AgentSystemError::AgentNotFound(coordinator_id.clone()))?;

        // Coordinateur distribue le travail
        let mut subordinate_results = Vec::new();

        for worker_id in self.participants.iter().skip(1) {
            let worker = registry
                .get(worker_id)
                .await
                .ok_or(AgentSystemError::AgentNotFound(worker_id.clone()))?;

            let contribution = CollaborationContribution {
                agent_id: worker_id.clone(),
                output: serde_json::json!({
                    "work": format!("Work done by {}", worker.name),
                    "coordinator": coordinator.name,
                }),
                timestamp: Self::now(),
            };

            subordinate_results.push(contribution.output.clone());
            self.results.push(contribution);
        }

        // Coordinateur synthétise
        let synthesis = CollaborationContribution {
            agent_id: coordinator_id.clone(),
            output: serde_json::json!({
                "synthesis": format!("Synthesized by {}", coordinator.name),
                "subordinate_count": subordinate_results.len(),
            }),
            timestamp: Self::now(),
        };
        self.results.push(synthesis.clone());

        Ok(CollaborationResult {
            collaboration_id: self.id.clone(),
            mode: self.mode,
            success: true,
            final_output: synthesis.output,
            contributions: self.results.clone(),
            duration_ms: Self::now() - self.created_at,
        })
    }

    async fn execute_p2p(
        &mut self,
        registry: &AgentRegistry,
        _message_bus: &MessageBus,
    ) -> Result<CollaborationResult, AgentSystemError> {
        // Chaque agent communique avec les autres
        let mut interactions = Vec::new();

        for i in 0..self.participants.len() {
            for j in (i + 1)..self.participants.len() {
                let agent_a = registry.get(&self.participants[i]).await;
                let agent_b = registry.get(&self.participants[j]).await;

                if let (Some(a), Some(b)) = (agent_a, agent_b) {
                    interactions.push(serde_json::json!({
                        "from": a.name,
                        "to": b.name,
                        "message": format!("{} <-> {}", a.name, b.name),
                    }));
                }
            }
        }

        Ok(CollaborationResult {
            collaboration_id: self.id.clone(),
            mode: self.mode,
            success: true,
            final_output: serde_json::json!({
                "interactions": interactions,
                "total_exchanges": interactions.len(),
            }),
            contributions: self.results.clone(),
            duration_ms: Self::now() - self.created_at,
        })
    }

    fn now() -> u64 {
        std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap_or_default()
            .as_millis() as u64
    }
}

/// Statut de collaboration
#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub enum CollaborationStatus {
    Pending,
    Active,
    Completed,
    Failed,
    Cancelled,
}

/// Contribution d'un agent
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct CollaborationContribution {
    pub agent_id: AgentId,
    pub output: serde_json::Value,
    pub timestamp: u64,
}

/// Résultat de collaboration
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct CollaborationResult {
    pub collaboration_id: String,
    pub mode: CollaborationMode,
    pub success: bool,
    pub final_output: serde_json::Value,
    pub contributions: Vec<CollaborationContribution>,
    pub duration_ms: u64,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_collaboration_creation() {
        let collab = Collaboration::new(
            CollaborationMode::Sequential,
            vec!["agent1".to_string(), "agent2".to_string()],
            "Test objective",
        );

        assert_eq!(collab.mode, CollaborationMode::Sequential);
        assert_eq!(collab.participants.len(), 2);
    }
}
