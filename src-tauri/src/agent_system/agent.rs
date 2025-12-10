//! ═══════════════════════════════════════════════════════════════════════════════
//! TITANE∞ v20Ω — AGENT CORE
//! Super Prompt #19 — Définition de base d'un agent
//! ═══════════════════════════════════════════════════════════════════════════════

use super::capabilities::{Capability, CapabilitySet};
use super::roles::Role;
use super::TaskType;
use serde::{Deserialize, Serialize};

/// Identifiant unique d'agent
pub type AgentId = String;

/// Type d'agent
#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum AgentType {
    /// Agent de recherche
    Researcher,
    /// Agent créatif
    Creator,
    /// Agent d'analyse
    Analyst,
    /// Agent de coordination
    Coordinator,
    /// Agent de sécurité
    Guardian,
    /// Agent de communication
    Communicator,
    /// Agent de maintenance
    Maintainer,
    /// Agent généraliste
    Generalist,
    /// Agent custom
    Custom(u32),
}

impl AgentType {
    /// Vérifie si ce type d'agent est adapté pour un type de tâche
    pub fn suitable_for(&self, task_type: &TaskType) -> bool {
        match (self, task_type) {
            (Self::Researcher, TaskType::Research) => true,
            (Self::Creator, TaskType::Creation) => true,
            (Self::Analyst, TaskType::Analysis) => true,
            (Self::Coordinator, TaskType::Coordination) => true,
            (Self::Guardian, TaskType::Security) => true,
            (Self::Communicator, TaskType::Communication) => true,
            (Self::Maintainer, TaskType::Maintenance) => true,
            (Self::Generalist, _) => true, // Generalist peut tout faire
            _ => false,
        }
    }

    /// Retourne les capacités par défaut pour ce type
    pub fn default_capabilities(&self) -> Vec<Capability> {
        match self {
            Self::Researcher => vec![
                Capability::WebSearch,
                Capability::DocumentAnalysis,
                Capability::DataExtraction,
            ],
            Self::Creator => vec![
                Capability::TextGeneration,
                Capability::CodeGeneration,
                Capability::ImageDescription,
            ],
            Self::Analyst => vec![
                Capability::DataAnalysis,
                Capability::PatternRecognition,
                Capability::Summarization,
            ],
            Self::Coordinator => vec![
                Capability::TaskPlanning,
                Capability::ResourceAllocation,
                Capability::PriorityManagement,
            ],
            Self::Guardian => vec![
                Capability::ThreatDetection,
                Capability::AccessControl,
                Capability::AuditLogging,
            ],
            Self::Communicator => vec![
                Capability::NaturalLanguage,
                Capability::Translation,
                Capability::SentimentAnalysis,
            ],
            Self::Maintainer => vec![
                Capability::SystemMonitoring,
                Capability::ErrorRecovery,
                Capability::PerformanceOptimization,
            ],
            Self::Generalist => vec![
                Capability::NaturalLanguage,
                Capability::TaskPlanning,
                Capability::DataAnalysis,
            ],
            Self::Custom(_) => vec![],
        }
    }
}

impl std::fmt::Display for AgentType {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::Researcher => write!(f, "Researcher"),
            Self::Creator => write!(f, "Creator"),
            Self::Analyst => write!(f, "Analyst"),
            Self::Coordinator => write!(f, "Coordinator"),
            Self::Guardian => write!(f, "Guardian"),
            Self::Communicator => write!(f, "Communicator"),
            Self::Maintainer => write!(f, "Maintainer"),
            Self::Generalist => write!(f, "Generalist"),
            Self::Custom(id) => write!(f, "Custom({})", id),
        }
    }
}

/// État d'un agent
#[derive(Clone, Copy, Debug, Default, PartialEq, Eq, Serialize, Deserialize)]
pub enum AgentState {
    /// Inactif (non démarré)
    #[default]
    Inactive,
    /// Prêt à recevoir des tâches
    Ready,
    /// Occupé avec une tâche
    Busy,
    /// En attente (de données, d'autres agents, etc.)
    Waiting,
    /// En pause
    Paused,
    /// En erreur
    Error,
    /// Terminé
    Terminated,
}

/// Agent
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Agent {
    pub id: AgentId,
    pub name: String,
    pub description: String,
    pub agent_type: AgentType,
    pub state: AgentState,
    pub roles: Vec<Role>,
    pub capabilities: CapabilitySet,
    pub created_at: u64,
    pub last_active_at: u64,
    pub tasks_completed: u64,
    pub tasks_failed: u64,
    pub performance_score: f32,
    pub priority: u8,
    pub metadata: std::collections::HashMap<String, String>,
}

impl Agent {
    /// Crée un nouvel agent
    pub fn new(agent_type: AgentType, name: &str) -> Self {
        let now = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap_or_default()
            .as_millis() as u64;

        let default_caps = agent_type.default_capabilities();

        Self {
            id: format!("agent_{}", uuid::Uuid::new_v4()),
            name: name.to_string(),
            description: String::new(),
            agent_type,
            state: AgentState::Inactive,
            roles: Vec::new(),
            capabilities: CapabilitySet::from_vec(default_caps),
            created_at: now,
            last_active_at: now,
            tasks_completed: 0,
            tasks_failed: 0,
            performance_score: 0.5,
            priority: 5,
            metadata: std::collections::HashMap::new(),
        }
    }

    /// Crée un agent avec un ID spécifique
    pub fn with_id(mut self, id: &str) -> Self {
        self.id = id.to_string();
        self
    }

    /// Ajoute une description
    pub fn with_description(mut self, description: &str) -> Self {
        self.description = description.to_string();
        self
    }

    /// Ajoute des rôles
    pub fn with_roles(mut self, roles: Vec<Role>) -> Self {
        self.roles = roles;
        self
    }

    /// Ajoute des capacités
    pub fn with_capabilities(mut self, caps: Vec<Capability>) -> Self {
        for cap in caps {
            self.capabilities.add(cap);
        }
        self
    }

    /// Vérifie si l'agent est disponible
    pub fn is_available(&self) -> bool {
        matches!(self.state, AgentState::Ready)
    }

    /// Vérifie si l'agent a une capacité
    pub fn has_capability(&self, cap: &Capability) -> bool {
        self.capabilities.has(cap)
    }

    /// Met à jour le temps d'activité
    pub fn touch(&mut self) {
        self.last_active_at = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap_or_default()
            .as_millis() as u64;
    }

    /// Enregistre une tâche complétée
    pub fn record_success(&mut self) {
        self.tasks_completed += 1;
        self.update_performance_score(true);
        self.touch();
    }

    /// Enregistre une tâche échouée
    pub fn record_failure(&mut self) {
        self.tasks_failed += 1;
        self.update_performance_score(false);
        self.touch();
    }

    /// Met à jour le score de performance
    fn update_performance_score(&mut self, success: bool) {
        let total = self.tasks_completed + self.tasks_failed;
        if total == 0 {
            return;
        }

        // Moyenne mobile exponentielle
        let alpha = 0.1;
        let outcome = if success { 1.0 } else { 0.0 };
        self.performance_score = alpha * outcome + (1.0 - alpha) * self.performance_score;
    }

    /// Calcule l'âge de l'agent en ms
    pub fn age_ms(&self) -> u64 {
        let now = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap_or_default()
            .as_millis() as u64;
        now.saturating_sub(self.created_at)
    }

    /// Calcule le temps d'inactivité en ms
    pub fn idle_time_ms(&self) -> u64 {
        let now = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap_or_default()
            .as_millis() as u64;
        now.saturating_sub(self.last_active_at)
    }
}

/// Builder pour Agent
pub struct AgentBuilder {
    agent: Agent,
}

impl AgentBuilder {
    pub fn new(agent_type: AgentType) -> Self {
        Self {
            agent: Agent::new(agent_type, "Unnamed Agent"),
        }
    }

    pub fn name(mut self, name: &str) -> Self {
        self.agent.name = name.to_string();
        self
    }

    pub fn description(mut self, desc: &str) -> Self {
        self.agent.description = desc.to_string();
        self
    }

    pub fn id(mut self, id: &str) -> Self {
        self.agent.id = id.to_string();
        self
    }

    pub fn capability(mut self, cap: Capability) -> Self {
        self.agent.capabilities.add(cap);
        self
    }

    pub fn role(mut self, role: Role) -> Self {
        self.agent.roles.push(role);
        self
    }

    pub fn priority(mut self, priority: u8) -> Self {
        self.agent.priority = priority;
        self
    }

    pub fn build(self) -> Agent {
        self.agent
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_agent_creation() {
        let agent = Agent::new(AgentType::Researcher, "Test Researcher");
        assert_eq!(agent.agent_type, AgentType::Researcher);
        assert_eq!(agent.state, AgentState::Inactive);
    }

    #[test]
    fn test_agent_builder() {
        let agent = AgentBuilder::new(AgentType::Creator)
            .name("Creative Agent")
            .description("A creative agent")
            .priority(8)
            .build();

        assert_eq!(agent.name, "Creative Agent");
        assert_eq!(agent.priority, 8);
    }

    #[test]
    fn test_agent_type_suitability() {
        assert!(AgentType::Researcher.suitable_for(&super::super::TaskType::Research));
        assert!(!AgentType::Researcher.suitable_for(&super::super::TaskType::Security));
        assert!(AgentType::Generalist.suitable_for(&super::super::TaskType::Security));
    }
}
