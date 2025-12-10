#![allow(unused_imports)]
#![allow(dead_code)]
// ═══════════════════════════════════════════════════════════════
//   AGENT CORE — Base Agent Definition
//   Définition de l'agent cognitif TITANE∞
// ═══════════════════════════════════════════════════════════════

use crate::agents::{AgentContract, AgentRole, Capability, CapabilitySet};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tokio::sync::RwLock;
use uuid::Uuid;

/// Identifiant unique d'agent
#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub struct AgentId(pub String);

impl AgentId {
    pub fn new() -> Self {
        Self(Uuid::new_v4().to_string())
    }

    pub fn from_string(s: String) -> Self {
        Self(s)
    }
}

impl Default for AgentId {
    fn default() -> Self {
        Self::new()
    }
}

/// État d'un agent
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum AgentState {
    /// Agent initialisé mais pas démarré
    Initialized,
    /// Agent en cours d'exécution
    Running,
    /// Agent en pause
    Paused,
    /// Agent en erreur
    Error,
    /// Agent arrêté proprement
    Stopped,
    /// Agent tué (dépassement limites)
    Killed,
}

/// Erreurs agent
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum AgentError {
    /// Erreur d'initialisation
    InitializationError(String),
    /// Erreur d'exécution
    ExecutionError(String),
    /// Violation de contrat
    ContractViolation(String),
    /// Violation de sandbox
    SandboxViolation(String),
    /// Timeout
    Timeout(String),
    /// Capacité manquante
    MissingCapability(String),
    /// Erreur de communication
    CommunicationError(String),
}

impl std::fmt::Display for AgentError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::InitializationError(e) => write!(f, "Initialization error: {}", e),
            Self::ExecutionError(e) => write!(f, "Execution error: {}", e),
            Self::ContractViolation(e) => write!(f, "Contract violation: {}", e),
            Self::SandboxViolation(e) => write!(f, "Sandbox violation: {}", e),
            Self::Timeout(e) => write!(f, "Timeout: {}", e),
            Self::MissingCapability(e) => write!(f, "Missing capability: {}", e),
            Self::CommunicationError(e) => write!(f, "Communication error: {}", e),
        }
    }
}

impl std::error::Error for AgentError {}

/// Métriques d'un agent
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AgentMetrics {
    /// Nombre de tâches exécutées
    pub tasks_executed: u64,
    /// Nombre de succès
    pub tasks_succeeded: u64,
    /// Nombre d'échecs
    pub tasks_failed: u64,
    /// Temps total d'exécution (ms)
    pub total_execution_time_ms: u128,
    /// Nombre de messages envoyés
    pub messages_sent: u64,
    /// Nombre de messages reçus
    pub messages_received: u64,
    /// Utilisation mémoire (bytes)
    pub memory_usage_bytes: usize,
    /// Dernière activité (timestamp)
    pub last_activity_timestamp: i64,
}

impl Default for AgentMetrics {
    fn default() -> Self {
        Self {
            tasks_executed: 0,
            tasks_succeeded: 0,
            tasks_failed: 0,
            total_execution_time_ms: 0,
            messages_sent: 0,
            messages_received: 0,
            memory_usage_bytes: 0,
            last_activity_timestamp: chrono::Utc::now().timestamp(),
        }
    }
}

/// Agent TITANE∞ — Cellule cognitive spécialisée
#[derive(Clone)]
pub struct Agent {
    /// Identifiant unique
    pub id: AgentId,
    /// Rôle de l'agent
    pub role: AgentRole,
    /// Capacités autorisées
    pub capabilities: CapabilitySet,
    /// Contrat de l'agent
    pub contract: AgentContract,
    /// État actuel
    pub state: Arc<RwLock<AgentState>>,
    /// Métriques
    pub metrics: Arc<RwLock<AgentMetrics>>,
    /// Timestamp de création
    pub created_at: i64,
    /// Timestamp de dernière modification
    pub updated_at: Arc<RwLock<i64>>,
}

impl Agent {
    /// Créer un nouvel agent
    pub fn new(role: AgentRole, capabilities: CapabilitySet, contract: AgentContract) -> Self {
        let now = chrono::Utc::now().timestamp();
        Self {
            id: AgentId::new(),
            role,
            capabilities,
            contract,
            state: Arc::new(RwLock::new(AgentState::Initialized)),
            metrics: Arc::new(RwLock::new(AgentMetrics::default())),
            created_at: now,
            updated_at: Arc::new(RwLock::new(now)),
        }
    }

    /// Créer avec ID spécifique (pour restauration)
    pub fn with_id(
        id: AgentId,
        role: AgentRole,
        capabilities: CapabilitySet,
        contract: AgentContract,
    ) -> Self {
        let now = chrono::Utc::now().timestamp();
        Self {
            id,
            role,
            capabilities,
            contract,
            state: Arc::new(RwLock::new(AgentState::Initialized)),
            metrics: Arc::new(RwLock::new(AgentMetrics::default())),
            created_at: now,
            updated_at: Arc::new(RwLock::new(now)),
        }
    }

    /// Obtenir l'état actuel
    pub async fn get_state(&self) -> AgentState {
        *self.state.read().await
    }

    /// Changer l'état
    pub async fn set_state(&self, new_state: AgentState) {
        let mut state = self.state.write().await;
        *state = new_state;
        self.update_timestamp().await;
    }

    /// Vérifier si l'agent a une capacité
    pub fn has_capability(&self, capability: &Capability) -> bool {
        self.capabilities.has(capability)
    }

    /// Vérifier si l'agent peut exécuter une action
    pub async fn can_execute(
        &self,
        required_capabilities: &[Capability],
    ) -> Result<(), AgentError> {
        // Vérifier l'état
        let state = self.get_state().await;
        if state != AgentState::Running && state != AgentState::Initialized {
            return Err(AgentError::ExecutionError(format!(
                "Agent is in {:?} state",
                state
            )));
        }

        // Vérifier les capacités
        for cap in required_capabilities {
            if !self.has_capability(cap) {
                return Err(AgentError::MissingCapability(format!(
                    "Agent lacks capability: {:?}",
                    cap
                )));
            }
        }

        Ok(())
    }

    /// Démarrer l'agent
    pub async fn start(&self) -> Result<(), AgentError> {
        let mut state = self.state.write().await;
        if *state != AgentState::Initialized && *state != AgentState::Paused {
            return Err(AgentError::ExecutionError(format!(
                "Cannot start agent in {:?} state",
                *state
            )));
        }
        *state = AgentState::Running;
        self.update_timestamp().await;
        log::info!("🤖 Agent {} ({:?}) started", self.id.0, self.role);
        Ok(())
    }

    /// Arrêter l'agent
    pub async fn stop(&self) -> Result<(), AgentError> {
        let mut state = self.state.write().await;
        *state = AgentState::Stopped;
        self.update_timestamp().await;
        log::info!("🛑 Agent {} stopped", self.id.0);
        Ok(())
    }

    /// Mettre en pause l'agent
    pub async fn pause(&self) -> Result<(), AgentError> {
        let mut state = self.state.write().await;
        if *state != AgentState::Running {
            return Err(AgentError::ExecutionError(format!(
                "Cannot pause agent in {:?} state",
                *state
            )));
        }
        *state = AgentState::Paused;
        self.update_timestamp().await;
        Ok(())
    }

    /// Marquer une erreur
    pub async fn set_error(&self) {
        let mut state = self.state.write().await;
        *state = AgentState::Error;
        self.update_timestamp().await;
    }

    /// Tuer l'agent (violation sandbox)
    pub async fn kill(&self) {
        let mut state = self.state.write().await;
        *state = AgentState::Killed;
        self.update_timestamp().await;
        log::warn!("☠️ Agent {} killed", self.id.0);
    }

    /// Incrémenter les métriques
    pub async fn record_task_execution(&self, success: bool, duration_ms: u128) {
        let mut metrics = self.metrics.write().await;
        metrics.tasks_executed += 1;
        if success {
            metrics.tasks_succeeded += 1;
        } else {
            metrics.tasks_failed += 1;
        }
        metrics.total_execution_time_ms += duration_ms;
        metrics.last_activity_timestamp = chrono::Utc::now().timestamp();
    }

    /// Enregistrer un message envoyé
    pub async fn record_message_sent(&self) {
        let mut metrics = self.metrics.write().await;
        metrics.messages_sent += 1;
        metrics.last_activity_timestamp = chrono::Utc::now().timestamp();
    }

    /// Enregistrer un message reçu
    pub async fn record_message_received(&self) {
        let mut metrics = self.metrics.write().await;
        metrics.messages_received += 1;
        metrics.last_activity_timestamp = chrono::Utc::now().timestamp();
    }

    /// Obtenir les métriques
    pub async fn get_metrics(&self) -> AgentMetrics {
        self.metrics.read().await.clone()
    }

    /// Mettre à jour le timestamp
    async fn update_timestamp(&self) {
        let mut updated = self.updated_at.write().await;
        *updated = chrono::Utc::now().timestamp();
    }

    /// Obtenir l'âge de l'agent (secondes)
    pub fn age_seconds(&self) -> i64 {
        chrono::Utc::now().timestamp() - self.created_at
    }

    /// Calculer le taux de succès
    pub async fn success_rate(&self) -> f32 {
        let metrics = self.metrics.read().await;
        if metrics.tasks_executed == 0 {
            return 1.0;
        }
        metrics.tasks_succeeded as f32 / metrics.tasks_executed as f32
    }
}

// Implémentation Debug manuelle (évite les locks dans le debug)
impl std::fmt::Debug for Agent {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("Agent")
            .field("id", &self.id)
            .field("role", &self.role)
            .field("capabilities", &self.capabilities)
            .field("created_at", &self.created_at)
            .finish()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::agents::{AgentContract, AgentRole, Capability, CapabilitySet};

    fn create_test_agent() -> Agent {
        let role = AgentRole::Observer;
        let mut capabilities = CapabilitySet::new();
        capabilities.add(Capability::MemoryRead);
        let contract = AgentContract::default_for_role(&role);
        Agent::new(role, capabilities, contract)
    }

    #[tokio::test]
    async fn test_agent_creation() {
        let agent = create_test_agent();
        assert_eq!(agent.get_state().await, AgentState::Initialized);
        assert_eq!(agent.role, AgentRole::Observer);
    }

    #[tokio::test]
    async fn test_agent_start_stop() {
        let agent = create_test_agent();
        assert!(agent.start().await.is_ok());
        assert_eq!(agent.get_state().await, AgentState::Running);

        assert!(agent.stop().await.is_ok());
        assert_eq!(agent.get_state().await, AgentState::Stopped);
    }

    #[tokio::test]
    async fn test_agent_capabilities() {
        let agent = create_test_agent();
        assert!(agent.has_capability(&Capability::MemoryRead));
        assert!(!agent.has_capability(&Capability::MemoryWrite));
    }

    #[tokio::test]
    async fn test_agent_metrics() {
        let agent = create_test_agent();
        agent.record_task_execution(true, 100).await;
        agent.record_task_execution(false, 50).await;

        let metrics = agent.get_metrics().await;
        assert_eq!(metrics.tasks_executed, 2);
        assert_eq!(metrics.tasks_succeeded, 1);
        assert_eq!(metrics.tasks_failed, 1);
        assert_eq!(metrics.total_execution_time_ms, 150);
    }

    #[tokio::test]
    async fn test_agent_success_rate() {
        let agent = create_test_agent();
        agent.record_task_execution(true, 100).await;
        agent.record_task_execution(true, 100).await;
        agent.record_task_execution(false, 100).await;

        let rate = agent.success_rate().await;
        assert!((rate - 0.666).abs() < 0.01);
    }

    #[tokio::test]
    async fn test_agent_pause_resume() {
        let agent = create_test_agent();
        agent.start().await.unwrap();

        assert!(agent.pause().await.is_ok());
        assert_eq!(agent.get_state().await, AgentState::Paused);

        assert!(agent.start().await.is_ok());
        assert_eq!(agent.get_state().await, AgentState::Running);
    }
}
