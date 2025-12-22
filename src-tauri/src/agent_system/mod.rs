//! ═══════════════════════════════════════════════════════════════════════════════
//! TITANE∞ v20Ω — AGENT SYSTEM vΩ
//! Super Prompt #19 — Multi-Agent Orchestration System
//! ═══════════════════════════════════════════════════════════════════════════════
//!
//! Ce module implémente un système multi-agents avec:
//! - Agents spécialisés (Researcher, Creator, Analyst, etc.)
//! - Rôles et capacités
//! - Collaboration inter-agents
//! - Supervision et orchestration
//! - Sandboxing et sécurité

pub mod agent;
pub mod capabilities;
pub mod collaboration;
pub mod communication;
pub mod config;
pub mod diagnostics;
pub mod lifecycle;
pub mod registry;
pub mod roles;
pub mod sandbox;
pub mod supervisor;

pub use agent::{Agent, AgentId, AgentState, AgentType};
pub use capabilities::{Capability, CapabilityLevel, CapabilitySet};
pub use collaboration::{Collaboration, CollaborationMode, CollaborationResult};
pub use communication::{Message, MessageBus, MessagePriority};
pub use config::AgentSystemConfig;
pub use diagnostics::AgentDiagnostics;
pub use lifecycle::{AgentLifecycle, LifecycleEvent, LifecycleState};
pub use registry::{AgentRegistry, RegistryQuery};
pub use roles::{Permission, Role, RoleDefinition};
pub use sandbox::{Sandbox, SandboxConfig, SandboxViolation};
pub use supervisor::{SupervisionEvent, SupervisionStrategy, Supervisor};

use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::RwLock;

/// Version du système d'agents
pub const AGENT_SYSTEM_VERSION: &str = "vΩ.1.0";

/// État global du système d'agents
#[derive(Clone, Debug, Default, Serialize, Deserialize)]
pub struct AgentSystemState {
    pub total_agents: usize,
    pub active_agents: usize,
    pub idle_agents: usize,
    pub tasks_completed: u64,
    pub collaborations_active: usize,
    pub average_response_time_ms: f64,
    pub system_load: f32,
}

/// Système d'orchestration multi-agents
pub struct AgentSystem {
    config: AgentSystemConfig,
    state: Arc<RwLock<AgentSystemState>>,
    registry: AgentRegistry,
    supervisor: Supervisor,
    message_bus: MessageBus,
    sandbox: Sandbox,
    lifecycle: AgentLifecycle,
    diagnostics: AgentDiagnostics,
}

impl AgentSystem {
    /// Crée un nouveau système d'agents
    pub fn new(config: AgentSystemConfig) -> Self {
        Self {
            config: config.clone(),
            state: Arc::new(RwLock::new(AgentSystemState::default())),
            registry: AgentRegistry::new(),
            supervisor: Supervisor::new(config.supervision_config.clone()),
            message_bus: MessageBus::new(config.message_bus_size),
            sandbox: Sandbox::new(config.sandbox_config.clone()),
            lifecycle: AgentLifecycle::new(),
            diagnostics: AgentDiagnostics::new(),
        }
    }

    /// Initialise le système
    pub async fn initialize(&mut self) -> Result<(), AgentSystemError> {
        // Créer les agents par défaut
        self.create_default_agents().await?;

        // Démarrer le supervisor
        self.supervisor.start().await;

        // Démarrer le bus de messages
        self.message_bus.start().await;

        self.diagnostics
            .emit("system_initialized", "Agent System initialized")
            .await;

        Ok(())
    }

    /// Crée les agents par défaut
    async fn create_default_agents(&mut self) -> Result<(), AgentSystemError> {
        let default_agents = vec![
            Agent::new(AgentType::Researcher, "Primary Researcher"),
            Agent::new(AgentType::Creator, "Creative Agent"),
            Agent::new(AgentType::Analyst, "Data Analyst"),
            Agent::new(AgentType::Coordinator, "Task Coordinator"),
            Agent::new(AgentType::Guardian, "Security Guardian"),
        ];

        for agent in default_agents {
            self.register_agent(agent).await?;
        }

        Ok(())
    }

    /// Enregistre un nouvel agent
    pub async fn register_agent(&mut self, agent: Agent) -> Result<AgentId, AgentSystemError> {
        // Valider l'agent
        self.sandbox.validate_agent(&agent)?;

        // Assigner un ID
        let id = agent.id.clone();

        // Enregistrer dans le registre
        self.registry.register(agent.clone()).await;

        // Démarrer le cycle de vie
        self.lifecycle.start_agent(&id).await;

        // Mettre à jour l'état
        let mut state = self.state.write().await;
        state.total_agents += 1;
        state.idle_agents += 1;

        self.diagnostics
            .emit(
                "agent_registered",
                &format!("Agent {} registered: {}", id, agent.name),
            )
            .await;

        Ok(id)
    }

    /// Désactive un agent
    pub async fn deactivate_agent(&mut self, id: &AgentId) -> Result<(), AgentSystemError> {
        self.lifecycle.stop_agent(id).await;
        self.registry.deactivate(id).await;

        let mut state = self.state.write().await;
        state.active_agents = state.active_agents.saturating_sub(1);

        Ok(())
    }

    /// Exécute une tâche via le système d'agents
    pub async fn execute_task(&self, task: AgentTask) -> Result<TaskResult, AgentSystemError> {
        let start = std::time::Instant::now();

        // 1. Trouver le meilleur agent pour la tâche
        let agent_id = self.find_best_agent(&task).await?;

        // 2. Vérifier les permissions via le sandbox
        self.sandbox.check_task_permissions(&task, &agent_id)?;

        // 3. Assigner la tâche
        let agent = self
            .registry
            .get(&agent_id)
            .await
            .ok_or(AgentSystemError::AgentNotFound(agent_id.clone()))?;

        // 4. Exécuter via le supervisor
        let result = self.supervisor.execute_task(&agent, &task).await?;

        // 5. Mettre à jour les stats
        let mut state = self.state.write().await;
        state.tasks_completed += 1;
        let duration = start.elapsed().as_millis() as f64;
        state.average_response_time_ms =
            (state.average_response_time_ms * (state.tasks_completed - 1) as f64 + duration)
                / state.tasks_completed as f64;

        self.diagnostics
            .emit(
                "task_completed",
                &format!("Task completed by {}: {:?}", agent_id, result.status),
            )
            .await;

        Ok(result)
    }

    /// Démarre une collaboration entre agents
    pub async fn start_collaboration(
        &self,
        mode: CollaborationMode,
        agent_ids: Vec<AgentId>,
        objective: &str,
    ) -> Result<CollaborationResult, AgentSystemError> {
        // Vérifier que tous les agents existent
        for id in &agent_ids {
            if self.registry.get(id).await.is_none() {
                return Err(AgentSystemError::AgentNotFound(id.clone()));
            }
        }

        // Créer la collaboration
        let collaboration = Collaboration::new(mode, agent_ids.clone(), objective);

        // Exécuter la collaboration
        let result = collaboration
            .execute(&self.registry, &self.message_bus)
            .await?;

        // Mettre à jour l'état
        let mut state = self.state.write().await;
        state.collaborations_active = state.collaborations_active.saturating_sub(1);

        Ok(result)
    }

    /// Trouve le meilleur agent pour une tâche
    async fn find_best_agent(&self, task: &AgentTask) -> Result<AgentId, AgentSystemError> {
        let agents = self.registry.available_agents().await;

        if agents.is_empty() {
            return Err(AgentSystemError::NoAvailableAgent);
        }

        // Scorer les agents
        let mut best_score = 0.0;
        let mut best_agent = agents[0].id.clone();

        for agent in &agents {
            let score = self.score_agent_for_task(agent, task);
            if score > best_score {
                best_score = score;
                best_agent = agent.id.clone();
            }
        }

        Ok(best_agent)
    }

    /// Score un agent pour une tâche
    fn score_agent_for_task(&self, agent: &Agent, task: &AgentTask) -> f32 {
        let mut score = 0.0;

        // Bonus si le type d'agent correspond
        if agent.agent_type.suitable_for(&task.task_type) {
            score += 50.0;
        }

        // Bonus pour les capacités
        for cap in &task.required_capabilities {
            if agent.capabilities.has(cap) {
                score += 10.0;
            }
        }

        // Malus si l'agent est occupé
        if agent.state == AgentState::Busy {
            score -= 30.0;
        }

        // Bonus pour la performance passée
        score += agent.performance_score * 20.0;

        score.max(0.0)
    }

    /// Envoie un message à un agent
    pub async fn send_message(
        &self,
        from: &AgentId,
        to: &AgentId,
        content: &str,
        priority: MessagePriority,
    ) -> Result<(), AgentSystemError> {
        let message = Message::new(from.clone(), to.clone(), content, priority);
        self.message_bus.send(message).await;
        Ok(())
    }

    /// Broadcast un message à tous les agents
    pub async fn broadcast(&self, from: &AgentId, content: &str) -> Result<(), AgentSystemError> {
        let agents = self.registry.all_agent_ids().await;
        for to in agents {
            if &to != from {
                self.send_message(from, &to, content, MessagePriority::Normal)
                    .await?;
            }
        }
        Ok(())
    }

    /// Récupère l'état du système
    pub async fn get_state(&self) -> AgentSystemState {
        self.state.read().await.clone()
    }

    /// Récupère tous les agents
    pub async fn get_agents(&self) -> Vec<Agent> {
        self.registry.all_agents().await
    }

    /// Récupère un agent par ID
    pub async fn get_agent(&self, id: &AgentId) -> Option<Agent> {
        self.registry.get(id).await
    }

    /// Récupère les agents par type
    pub async fn get_agents_by_type(&self, agent_type: AgentType) -> Vec<Agent> {
        self.registry.by_type(agent_type).await
    }

    /// Récupère les diagnostics
    pub async fn get_diagnostics(&self) -> AgentDiagnostics {
        self.diagnostics.clone()
    }
}

impl Default for AgentSystem {
    fn default() -> Self {
        Self::new(AgentSystemConfig::default())
    }
}

/// Tâche pour un agent
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct AgentTask {
    pub id: String,
    pub task_type: TaskType,
    pub description: String,
    pub input: serde_json::Value,
    pub required_capabilities: Vec<Capability>,
    pub priority: TaskPriority,
    pub timeout_ms: u64,
    pub metadata: HashMap<String, String>,
}

impl AgentTask {
    pub fn new(task_type: TaskType, description: &str) -> Self {
        Self {
            id: uuid::Uuid::new_v4().to_string(),
            task_type,
            description: description.to_string(),
            input: serde_json::json!({}),
            required_capabilities: Vec::new(),
            priority: TaskPriority::Normal,
            timeout_ms: 75000, // ✨ v26.2.1: Increased from 60s to 75s (cloud-aligned)
            metadata: HashMap::new(),
        }
    }
}

/// Type de tâche
#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum TaskType {
    Research,
    Analysis,
    Creation,
    Review,
    Communication,
    Coordination,
    Security,
    Maintenance,
}

/// Priorité de tâche
#[derive(Clone, Copy, Debug, PartialEq, Eq, Ord, PartialOrd, Serialize, Deserialize)]
pub enum TaskPriority {
    Low,
    Normal,
    High,
    Urgent,
    Critical,
}

impl Default for TaskPriority {
    fn default() -> Self {
        Self::Normal
    }
}

/// Résultat d'une tâche
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct TaskResult {
    pub task_id: String,
    pub agent_id: AgentId,
    pub status: TaskStatus,
    pub output: serde_json::Value,
    pub duration_ms: u64,
    pub errors: Vec<String>,
}

/// Statut d'une tâche
#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub enum TaskStatus {
    Success,
    PartialSuccess,
    Failed,
    Timeout,
    Cancelled,
}

/// Erreur du système d'agents
#[derive(Debug, Clone)]
pub enum AgentSystemError {
    AgentNotFound(AgentId),
    NoAvailableAgent,
    PermissionDenied(String),
    SandboxViolation(String),
    TaskFailed(String),
    CollaborationFailed(String),
    CommunicationError(String),
    ConfigurationError(String),
}

impl std::fmt::Display for AgentSystemError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::AgentNotFound(id) => write!(f, "Agent not found: {}", id),
            Self::NoAvailableAgent => write!(f, "No available agent"),
            Self::PermissionDenied(msg) => write!(f, "Permission denied: {}", msg),
            Self::SandboxViolation(msg) => write!(f, "Sandbox violation: {}", msg),
            Self::TaskFailed(msg) => write!(f, "Task failed: {}", msg),
            Self::CollaborationFailed(msg) => write!(f, "Collaboration failed: {}", msg),
            Self::CommunicationError(msg) => write!(f, "Communication error: {}", msg),
            Self::ConfigurationError(msg) => write!(f, "Configuration error: {}", msg),
        }
    }
}

impl std::error::Error for AgentSystemError {}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_agent_system_creation() {
        let system = AgentSystem::default();
        assert_eq!(system.config.name, "default");
    }

    #[tokio::test]
    async fn test_agent_system_state() {
        let system = AgentSystem::default();
        let state = system.get_state().await;
        assert_eq!(state.total_agents, 0);
    }
}
