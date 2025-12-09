#![allow(unused_imports)]
#![allow(dead_code)]
// ═══════════════════════════════════════════════════════════════
//   AGENT REGISTRY — Catalogue des Agents
//   Gestion du cycle de vie et catalogue des agents actifs
// ═══════════════════════════════════════════════════════════════

use crate::agents::{Agent, AgentId, AgentRole, AgentState, AgentError};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::RwLock;

/// Statistiques du registre
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RegistryStats {
    /// Nombre total d'agents enregistrés
    pub total_agents: usize,
    /// Agents en cours d'exécution
    pub running_agents: usize,
    /// Agents en pause
    pub paused_agents: usize,
    /// Agents en erreur
    pub error_agents: usize,
    /// Agents arrêtés
    pub stopped_agents: usize,
    /// Distribution par rôle
    pub agents_by_role: HashMap<String, usize>,
}

/// Registre des agents TITANE∞
pub struct AgentRegistry {
    /// Catalogue des agents (ID → Agent)
    agents: Arc<RwLock<HashMap<AgentId, Agent>>>,
    /// Index par rôle (Role → Vec<AgentId>)
    role_index: Arc<RwLock<HashMap<AgentRole, Vec<AgentId>>>>,
    /// Capacité maximale
    max_agents: usize,
}

impl AgentRegistry {
    /// Créer un nouveau registre
    pub fn new(max_agents: usize) -> Self {
        Self {
            agents: Arc::new(RwLock::new(HashMap::new())),
            role_index: Arc::new(RwLock::new(HashMap::new())),
            max_agents,
        }
    }

    /// Enregistrer un agent
    pub async fn register(&self, agent: Agent) -> Result<AgentId, AgentError> {
        let mut agents = self.agents.write().await;

        if agents.len() >= self.max_agents {
            return Err(AgentError::InitializationError(
                format!("Registry at capacity: {}/{}", agents.len(), self.max_agents)
            ));
        }

        let id = agent.id.clone();
        let role = agent.role;
        agents.insert(id.clone(), agent);

        let mut role_index = self.role_index.write().await;
        role_index.entry(role).or_insert_with(Vec::new).push(id.clone());

        log::info!("🤖 Agent {} ({:?}) registered", id.0, role);
        Ok(id)
    }

    /// Désenregistrer un agent
    pub async fn unregister(&self, id: &AgentId) -> Result<(), AgentError> {
        let mut agents = self.agents.write().await;
        if let Some(agent) = agents.remove(id) {
            let mut role_index = self.role_index.write().await;
            if let Some(ids) = role_index.get_mut(&agent.role) {
                ids.retain(|x| x != id);
            }
            log::info!("🛑 Agent {} unregistered", id.0);
            Ok(())
        } else {
            Err(AgentError::ExecutionError(format!("Agent {} not found", id.0)))
        }
    }

    /// Obtenir un agent par ID
    pub async fn get(&self, id: &AgentId) -> Option<Agent> {
        self.agents.read().await.get(id).cloned()
    }

    /// Obtenir tous les agents
    pub async fn get_all(&self) -> Vec<Agent> {
        self.agents.read().await.values().cloned().collect()
    }

    /// Obtenir les agents par rôle
    pub async fn get_by_role(&self, role: &AgentRole) -> Vec<Agent> {
        let agents = self.agents.read().await;
        let role_index = self.role_index.read().await;
        if let Some(ids) = role_index.get(role) {
            ids.iter().filter_map(|id| agents.get(id).cloned()).collect()
        } else {
            Vec::new()
        }
    }

    /// Compter les agents
    pub async fn count(&self) -> usize {
        self.agents.read().await.len()
    }

    /// Obtenir les statistiques
    pub async fn stats(&self) -> RegistryStats {
        let agents = self.agents.read().await;
        let mut running = 0;
        let mut paused = 0;
        let mut error = 0;
        let mut stopped = 0;
        let mut by_role: HashMap<String, usize> = HashMap::new();

        for agent in agents.values() {
            match agent.get_state().await {
                AgentState::Running => running += 1,
                AgentState::Paused => paused += 1,
                AgentState::Error => error += 1,
                AgentState::Stopped | AgentState::Killed => stopped += 1,
                _ => {}
            }
            *by_role.entry(agent.role.short_name().to_string()).or_insert(0) += 1;
        }

        RegistryStats {
            total_agents: agents.len(),
            running_agents: running,
            paused_agents: paused,
            error_agents: error,
            stopped_agents: stopped,
            agents_by_role: by_role,
        }
    }

    /// Nettoyer les agents morts
    pub async fn cleanup_dead_agents(&self) -> usize {
        let mut agents = self.agents.write().await;
        let mut role_index = self.role_index.write().await;
        let initial_count = agents.len();
        let mut to_remove = Vec::new();

        for (id, agent) in agents.iter() {
            let state = agent.get_state().await;
            if matches!(state, AgentState::Stopped | AgentState::Killed) {
                to_remove.push((id.clone(), agent.role));
            }
        }

        for (id, role) in to_remove {
            agents.remove(&id);
            if let Some(ids) = role_index.get_mut(&role) {
                ids.retain(|x| x != &id);
            }
        }

        initial_count - agents.len()
    }
}

impl Default for AgentRegistry {
    fn default() -> Self {
        Self::new(50)
    }
}
