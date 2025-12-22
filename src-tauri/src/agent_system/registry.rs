//! ═══════════════════════════════════════════════════════════════════════════════
//! TITANE∞ v20Ω — AGENT REGISTRY
//! Super Prompt #19 — Registre des agents
//! ═══════════════════════════════════════════════════════════════════════════════

use super::agent::{Agent, AgentId, AgentState, AgentType};
use super::capabilities::Capability;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use tokio::sync::RwLock;

/// Requête de recherche d'agents
#[derive(Clone, Debug, Default)]
pub struct RegistryQuery {
    pub agent_type: Option<AgentType>,
    pub state: Option<AgentState>,
    pub capability: Option<Capability>,
    pub min_performance: Option<f32>,
    pub name_contains: Option<String>,
    pub limit: Option<usize>,
}

impl RegistryQuery {
    pub fn new() -> Self {
        Self::default()
    }

    pub fn with_type(mut self, agent_type: AgentType) -> Self {
        self.agent_type = Some(agent_type);
        self
    }

    pub fn with_state(mut self, state: AgentState) -> Self {
        self.state = Some(state);
        self
    }

    pub fn with_capability(mut self, capability: Capability) -> Self {
        self.capability = Some(capability);
        self
    }

    pub fn with_min_performance(mut self, min: f32) -> Self {
        self.min_performance = Some(min);
        self
    }

    pub fn with_name(mut self, name: &str) -> Self {
        self.name_contains = Some(name.to_string());
        self
    }

    pub fn limit(mut self, limit: usize) -> Self {
        self.limit = Some(limit);
        self
    }
}

/// Registre des agents
pub struct AgentRegistry {
    agents: RwLock<HashMap<AgentId, Agent>>,
    stats: RwLock<RegistryStats>,
}

impl AgentRegistry {
    pub fn new() -> Self {
        Self {
            agents: RwLock::new(HashMap::new()),
            stats: RwLock::new(RegistryStats::default()),
        }
    }

    /// Enregistre un agent
    pub async fn register(&self, agent: Agent) {
        let mut agents = self.agents.write().await;
        let id = agent.id.clone();
        agents.insert(id, agent);

        let mut stats = self.stats.write().await;
        stats.total_registered += 1;
    }

    /// Récupère un agent par ID
    pub async fn get(&self, id: &AgentId) -> Option<Agent> {
        let agents = self.agents.read().await;
        agents.get(id).cloned()
    }

    /// Met à jour un agent
    pub async fn update(&self, agent: Agent) {
        let mut agents = self.agents.write().await;
        agents.insert(agent.id.clone(), agent);
    }

    /// Désactive un agent
    pub async fn deactivate(&self, id: &AgentId) {
        let mut agents = self.agents.write().await;
        if let Some(agent) = agents.get_mut(id) {
            agent.state = AgentState::Terminated;
        }
    }

    /// Supprime un agent
    pub async fn remove(&self, id: &AgentId) -> Option<Agent> {
        let mut agents = self.agents.write().await;
        agents.remove(id)
    }

    /// Liste tous les agents
    pub async fn all_agents(&self) -> Vec<Agent> {
        let agents = self.agents.read().await;
        agents.values().cloned().collect()
    }

    /// Liste tous les IDs
    pub async fn all_agent_ids(&self) -> Vec<AgentId> {
        let agents = self.agents.read().await;
        agents.keys().cloned().collect()
    }

    /// Liste les agents disponibles
    pub async fn available_agents(&self) -> Vec<Agent> {
        let agents = self.agents.read().await;
        agents
            .values()
            .filter(|a| a.is_available())
            .cloned()
            .collect()
    }

    /// Liste les agents par type
    pub async fn by_type(&self, agent_type: AgentType) -> Vec<Agent> {
        let agents = self.agents.read().await;
        agents
            .values()
            .filter(|a| a.agent_type == agent_type)
            .cloned()
            .collect()
    }

    /// Liste les agents par état
    pub async fn by_state(&self, state: AgentState) -> Vec<Agent> {
        let agents = self.agents.read().await;
        agents
            .values()
            .filter(|a| a.state == state)
            .cloned()
            .collect()
    }

    /// Liste les agents avec une capacité
    pub async fn with_capability(&self, capability: Capability) -> Vec<Agent> {
        let agents = self.agents.read().await;
        agents
            .values()
            .filter(|a| a.capabilities.has(&capability))
            .cloned()
            .collect()
    }

    /// Recherche avec requête
    pub async fn search(&self, query: &RegistryQuery) -> Vec<Agent> {
        let agents = self.agents.read().await;

        let mut results: Vec<_> = agents
            .values()
            .filter(|a| {
                // Filtre par type
                if let Some(ref t) = query.agent_type {
                    if &a.agent_type != t {
                        return false;
                    }
                }

                // Filtre par état
                if let Some(ref s) = query.state {
                    if &a.state != s {
                        return false;
                    }
                }

                // Filtre par capacité
                if let Some(ref c) = query.capability {
                    if !a.capabilities.has(c) {
                        return false;
                    }
                }

                // Filtre par performance
                if let Some(min) = query.min_performance {
                    if a.performance_score < min {
                        return false;
                    }
                }

                // Filtre par nom
                if let Some(ref name) = query.name_contains {
                    if !a.name.to_lowercase().contains(&name.to_lowercase()) {
                        return false;
                    }
                }

                true
            })
            .cloned()
            .collect();

        // Appliquer la limite
        if let Some(limit) = query.limit {
            results.truncate(limit);
        }

        results
    }

    /// Nombre d'agents
    pub async fn count(&self) -> usize {
        let agents = self.agents.read().await;
        agents.len()
    }

    /// Nombre d'agents actifs
    pub async fn active_count(&self) -> usize {
        let agents = self.agents.read().await;
        agents
            .values()
            .filter(|a| a.state == AgentState::Ready || a.state == AgentState::Busy)
            .count()
    }

    /// Statistiques du registre
    pub async fn stats(&self) -> RegistryStats {
        let agents = self.agents.read().await;
        let base_stats = self.stats.read().await.clone();

        let by_type: HashMap<String, usize> = agents.values().fold(HashMap::new(), |mut acc, a| {
            let key = format!("{:?}", a.agent_type);
            *acc.entry(key).or_insert(0) += 1;
            acc
        });

        let by_state: HashMap<String, usize> =
            agents.values().fold(HashMap::new(), |mut acc, a| {
                let key = format!("{:?}", a.state);
                *acc.entry(key).or_insert(0) += 1;
                acc
            });

        RegistryStats {
            total_registered: base_stats.total_registered,
            current_count: agents.len(),
            agents_by_type: by_type,
            agents_by_state: by_state,
            average_performance: if agents.is_empty() {
                0.0
            } else {
                agents.values().map(|a| a.performance_score).sum::<f32>() / agents.len() as f32
            },
        }
    }
}

impl Default for AgentRegistry {
    fn default() -> Self {
        Self::new()
    }
}

/// Statistiques du registre
#[derive(Clone, Debug, Default, Serialize, Deserialize)]
pub struct RegistryStats {
    pub total_registered: u64,
    pub current_count: usize,
    pub agents_by_type: HashMap<String, usize>,
    pub agents_by_state: HashMap<String, usize>,
    pub average_performance: f32,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_registry() {
        let registry = AgentRegistry::new();

        let agent = Agent::new(AgentType::Researcher, "Test Agent");
        registry.register(agent.clone()).await;

        let retrieved = registry.get(&agent.id).await;
        assert!(retrieved.is_some());
        assert_eq!(
            retrieved
                .expect("L'agent doit être récupérable après register")
                .name,
            "Test Agent"
        );
    }

    #[tokio::test]
    async fn test_registry_query() {
        let registry = AgentRegistry::new();

        registry
            .register(Agent::new(AgentType::Researcher, "Researcher 1"))
            .await;
        registry
            .register(Agent::new(AgentType::Creator, "Creator 1"))
            .await;
        registry
            .register(Agent::new(AgentType::Researcher, "Researcher 2"))
            .await;

        let query = RegistryQuery::new().with_type(AgentType::Researcher);
        let results = registry.search(&query).await;

        assert_eq!(results.len(), 2);
    }
}
