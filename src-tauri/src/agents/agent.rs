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

    // ─────────────────────────────────────────────────────────────────────
    // Tests AgentId
    // ─────────────────────────────────────────────────────────────────────

    #[test]
    fn test_agent_id_new() {
        let id1 = AgentId::new();
        let id2 = AgentId::new();
        assert_ne!(id1.0, id2.0); // UUIDs should be unique
    }

    #[test]
    fn test_agent_id_from_string() {
        let id = AgentId::from_string("test-agent".to_string());
        assert_eq!(id.0, "test-agent");
    }

    #[test]
    fn test_agent_id_default() {
        let id = AgentId::default();
        assert!(!id.0.is_empty());
    }

    #[test]
    fn test_agent_id_clone() {
        let id = AgentId::from_string("clone-test".to_string());
        let cloned = id.clone();
        assert_eq!(id.0, cloned.0);
    }

    #[test]
    fn test_agent_id_eq() {
        let id1 = AgentId::from_string("same".to_string());
        let id2 = AgentId::from_string("same".to_string());
        assert_eq!(id1, id2);
    }

    #[test]
    fn test_agent_id_ne() {
        let id1 = AgentId::from_string("one".to_string());
        let id2 = AgentId::from_string("two".to_string());
        assert_ne!(id1, id2);
    }

    #[test]
    fn test_agent_id_debug() {
        let id = AgentId::from_string("debug-test".to_string());
        let debug_str = format!("{:?}", id);
        assert!(debug_str.contains("debug-test"));
    }

    #[test]
    fn test_agent_id_serialize() {
        let id = AgentId::from_string("serialize-test".to_string());
        let json = serde_json::to_string(&id).unwrap();
        assert!(json.contains("serialize-test"));
    }

    #[test]
    fn test_agent_id_deserialize() {
        let json = r#""my-agent-id""#;
        let id: AgentId = serde_json::from_str(json).unwrap();
        assert_eq!(id.0, "my-agent-id");
    }

    #[test]
    fn test_agent_id_hash() {
        use std::collections::HashSet;
        let mut set = HashSet::new();
        set.insert(AgentId::from_string("a".to_string()));
        set.insert(AgentId::from_string("b".to_string()));
        set.insert(AgentId::from_string("a".to_string())); // duplicate
        assert_eq!(set.len(), 2);
    }

    // ─────────────────────────────────────────────────────────────────────
    // Tests AgentState
    // ─────────────────────────────────────────────────────────────────────

    #[test]
    fn test_agent_state_initialized() {
        let state = AgentState::Initialized;
        assert!(matches!(state, AgentState::Initialized));
    }

    #[test]
    fn test_agent_state_running() {
        let state = AgentState::Running;
        assert!(matches!(state, AgentState::Running));
    }

    #[test]
    fn test_agent_state_paused() {
        let state = AgentState::Paused;
        assert!(matches!(state, AgentState::Paused));
    }

    #[test]
    fn test_agent_state_error() {
        let state = AgentState::Error;
        assert!(matches!(state, AgentState::Error));
    }

    #[test]
    fn test_agent_state_stopped() {
        let state = AgentState::Stopped;
        assert!(matches!(state, AgentState::Stopped));
    }

    #[test]
    fn test_agent_state_killed() {
        let state = AgentState::Killed;
        assert!(matches!(state, AgentState::Killed));
    }

    #[test]
    fn test_agent_state_clone() {
        let state = AgentState::Running;
        let cloned = state.clone();
        assert_eq!(state, cloned);
    }

    #[test]
    fn test_agent_state_copy() {
        let state = AgentState::Paused;
        let copied: AgentState = state;
        assert_eq!(state, copied);
    }

    #[test]
    fn test_agent_state_debug() {
        let state = AgentState::Running;
        let debug_str = format!("{:?}", state);
        assert!(debug_str.contains("Running"));
    }

    #[test]
    fn test_agent_state_serialize() {
        let state = AgentState::Error;
        let json = serde_json::to_string(&state).unwrap();
        assert!(json.contains("Error"));
    }

    #[test]
    fn test_agent_state_deserialize() {
        let json = r#""Killed""#;
        let state: AgentState = serde_json::from_str(json).unwrap();
        assert_eq!(state, AgentState::Killed);
    }

    // ─────────────────────────────────────────────────────────────────────
    // Tests AgentError
    // ─────────────────────────────────────────────────────────────────────

    #[test]
    fn test_agent_error_initialization() {
        let err = AgentError::InitializationError("init failed".to_string());
        assert!(matches!(err, AgentError::InitializationError(_)));
    }

    #[test]
    fn test_agent_error_execution() {
        let err = AgentError::ExecutionError("exec failed".to_string());
        assert!(matches!(err, AgentError::ExecutionError(_)));
    }

    #[test]
    fn test_agent_error_contract_violation() {
        let err = AgentError::ContractViolation("breach".to_string());
        assert!(matches!(err, AgentError::ContractViolation(_)));
    }

    #[test]
    fn test_agent_error_sandbox_violation() {
        let err = AgentError::SandboxViolation("memory".to_string());
        assert!(matches!(err, AgentError::SandboxViolation(_)));
    }

    #[test]
    fn test_agent_error_timeout() {
        let err = AgentError::Timeout("30s".to_string());
        assert!(matches!(err, AgentError::Timeout(_)));
    }

    #[test]
    fn test_agent_error_missing_capability() {
        let err = AgentError::MissingCapability("network".to_string());
        assert!(matches!(err, AgentError::MissingCapability(_)));
    }

    #[test]
    fn test_agent_error_communication() {
        let err = AgentError::CommunicationError("channel closed".to_string());
        assert!(matches!(err, AgentError::CommunicationError(_)));
    }

    #[test]
    fn test_agent_error_display() {
        let err = AgentError::InitializationError("test".to_string());
        let display = format!("{}", err);
        assert!(display.contains("Initialization error"));
        assert!(display.contains("test"));
    }

    #[test]
    fn test_agent_error_display_all_variants() {
        let errors = vec![
            AgentError::InitializationError("a".to_string()),
            AgentError::ExecutionError("b".to_string()),
            AgentError::ContractViolation("c".to_string()),
            AgentError::SandboxViolation("d".to_string()),
            AgentError::Timeout("e".to_string()),
            AgentError::MissingCapability("f".to_string()),
            AgentError::CommunicationError("g".to_string()),
        ];
        for err in errors {
            let _ = format!("{}", err);
        }
    }

    #[test]
    fn test_agent_error_clone() {
        let err = AgentError::Timeout("clone test".to_string());
        let cloned = err.clone();
        assert!(matches!(cloned, AgentError::Timeout(_)));
    }

    #[test]
    fn test_agent_error_debug() {
        let err = AgentError::ExecutionError("debug".to_string());
        let debug_str = format!("{:?}", err);
        assert!(debug_str.contains("ExecutionError"));
    }

    #[test]
    fn test_agent_error_serialize() {
        let err = AgentError::ContractViolation("breach".to_string());
        let json = serde_json::to_string(&err).unwrap();
        assert!(json.contains("ContractViolation"));
    }

    #[test]
    fn test_agent_error_deserialize() {
        let json = r#"{"Timeout":"expired"}"#;
        let err: AgentError = serde_json::from_str(json).unwrap();
        assert!(matches!(err, AgentError::Timeout(_)));
    }

    // ─────────────────────────────────────────────────────────────────────
    // Tests AgentMetrics
    // ─────────────────────────────────────────────────────────────────────

    #[test]
    fn test_agent_metrics_default() {
        let metrics = AgentMetrics::default();
        assert_eq!(metrics.tasks_executed, 0);
        assert_eq!(metrics.tasks_succeeded, 0);
        assert_eq!(metrics.tasks_failed, 0);
        assert_eq!(metrics.total_execution_time_ms, 0);
        assert_eq!(metrics.messages_sent, 0);
        assert_eq!(metrics.messages_received, 0);
    }

    #[test]
    fn test_agent_metrics_custom() {
        let metrics = AgentMetrics {
            tasks_executed: 100,
            tasks_succeeded: 90,
            tasks_failed: 10,
            total_execution_time_ms: 5000,
            messages_sent: 50,
            messages_received: 45,
            memory_usage_bytes: 1024,
            last_activity_timestamp: 12345,
        };
        assert_eq!(metrics.tasks_executed, 100);
        assert_eq!(metrics.tasks_succeeded, 90);
    }

    #[test]
    fn test_agent_metrics_clone() {
        let metrics = AgentMetrics::default();
        let cloned = metrics.clone();
        assert_eq!(cloned.tasks_executed, metrics.tasks_executed);
    }

    #[test]
    fn test_agent_metrics_debug() {
        let metrics = AgentMetrics::default();
        let debug_str = format!("{:?}", metrics);
        assert!(debug_str.contains("AgentMetrics"));
    }

    #[test]
    fn test_agent_metrics_serialize() {
        let metrics = AgentMetrics::default();
        let json = serde_json::to_string(&metrics).unwrap();
        assert!(json.contains("tasks_executed"));
    }

    #[test]
    fn test_agent_metrics_deserialize() {
        let json = r#"{"tasks_executed":5,"tasks_succeeded":4,"tasks_failed":1,"total_execution_time_ms":100,"messages_sent":2,"messages_received":3,"memory_usage_bytes":512,"last_activity_timestamp":0}"#;
        let metrics: AgentMetrics = serde_json::from_str(json).unwrap();
        assert_eq!(metrics.tasks_executed, 5);
        assert_eq!(metrics.tasks_succeeded, 4);
    }

    // ─────────────────────────────────────────────────────────────────────
    // Tests Agent core (existing + new)
    // ─────────────────────────────────────────────────────────────────────

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

    #[tokio::test]
    async fn test_agent_with_id() {
        let custom_id = AgentId::from_string("custom-agent".to_string());
        let role = AgentRole::Executor;
        let capabilities = CapabilitySet::new();
        let contract = AgentContract::default_for_role(&role);
        let agent = Agent::with_id(custom_id.clone(), role, capabilities, contract);
        assert_eq!(agent.id.0, "custom-agent");
    }

    #[tokio::test]
    async fn test_agent_set_state() {
        let agent = create_test_agent();
        agent.set_state(AgentState::Running).await;
        assert_eq!(agent.get_state().await, AgentState::Running);
    }

    #[tokio::test]
    async fn test_agent_set_error() {
        let agent = create_test_agent();
        agent.set_error().await;
        assert_eq!(agent.get_state().await, AgentState::Error);
    }

    #[tokio::test]
    async fn test_agent_kill() {
        let agent = create_test_agent();
        agent.kill().await;
        assert_eq!(agent.get_state().await, AgentState::Killed);
    }

    #[tokio::test]
    async fn test_agent_record_message_sent() {
        let agent = create_test_agent();
        agent.record_message_sent().await;
        agent.record_message_sent().await;
        let metrics = agent.get_metrics().await;
        assert_eq!(metrics.messages_sent, 2);
    }

    #[tokio::test]
    async fn test_agent_record_message_received() {
        let agent = create_test_agent();
        agent.record_message_received().await;
        let metrics = agent.get_metrics().await;
        assert_eq!(metrics.messages_received, 1);
    }

    #[tokio::test]
    async fn test_agent_success_rate_no_tasks() {
        let agent = create_test_agent();
        let rate = agent.success_rate().await;
        assert_eq!(rate, 1.0); // Default to 100% when no tasks
    }

    #[tokio::test]
    async fn test_agent_can_execute_initialized() {
        let agent = create_test_agent();
        let result = agent.can_execute(&[Capability::MemoryRead]).await;
        assert!(result.is_ok());
    }

    #[tokio::test]
    async fn test_agent_can_execute_missing_capability() {
        let agent = create_test_agent();
        let result = agent.can_execute(&[Capability::NetworkAccess]).await;
        assert!(result.is_err());
    }

    #[tokio::test]
    async fn test_agent_can_execute_stopped() {
        let agent = create_test_agent();
        agent.stop().await.unwrap();
        let result = agent.can_execute(&[Capability::MemoryRead]).await;
        assert!(result.is_err());
    }

    #[tokio::test]
    async fn test_agent_pause_when_not_running() {
        let agent = create_test_agent();
        // Agent is Initialized, not Running
        let result = agent.pause().await;
        assert!(result.is_err());
    }

    #[tokio::test]
    async fn test_agent_start_when_stopped() {
        let agent = create_test_agent();
        agent.stop().await.unwrap();
        let result = agent.start().await;
        assert!(result.is_err());
    }

    #[test]
    fn test_agent_age_seconds() {
        let agent = create_test_agent();
        let age = agent.age_seconds();
        assert!(age >= 0);
    }

    #[test]
    fn test_agent_debug() {
        let agent = create_test_agent();
        let debug_str = format!("{:?}", agent);
        assert!(debug_str.contains("Agent"));
        assert!(debug_str.contains("role"));
    }
}
