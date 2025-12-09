//! ═══════════════════════════════════════════════════════════════════════════════
//! TITANE∞ v20Ω — AGENT LIFECYCLE
//! Super Prompt #19 — Gestion du cycle de vie des agents
//! ═══════════════════════════════════════════════════════════════════════════════

use serde::{Deserialize, Serialize};
use tokio::sync::RwLock;
use std::collections::HashMap;
use super::agent::AgentId;

/// État du cycle de vie
#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub enum LifecycleState {
    /// Créé mais non démarré
    Created,
    /// En cours d'initialisation
    Initializing,
    /// Prêt à fonctionner
    Running,
    /// En pause
    Paused,
    /// En cours d'arrêt
    Stopping,
    /// Arrêté
    Stopped,
    /// Redémarrage
    Restarting,
    /// Erreur
    Error,
}

/// Événement de cycle de vie
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct LifecycleEvent {
    pub timestamp: u64,
    pub agent_id: AgentId,
    pub previous_state: LifecycleState,
    pub new_state: LifecycleState,
    pub reason: String,
}

/// Entrée de cycle de vie
#[derive(Clone, Debug)]
struct LifecycleEntry {
    state: LifecycleState,
    started_at: u64,
    state_changed_at: u64,
    events: Vec<LifecycleEvent>,
    restart_count: u32,
}

impl Default for LifecycleEntry {
    fn default() -> Self {
        let now = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap_or_default()
            .as_millis() as u64;

        Self {
            state: LifecycleState::Created,
            started_at: now,
            state_changed_at: now,
            events: Vec::new(),
            restart_count: 0,
        }
    }
}

/// Gestionnaire de cycle de vie des agents
pub struct AgentLifecycle {
    entries: RwLock<HashMap<AgentId, LifecycleEntry>>,
    config: LifecycleConfig,
}

impl AgentLifecycle {
    pub fn new() -> Self {
        Self {
            entries: RwLock::new(HashMap::new()),
            config: LifecycleConfig::default(),
        }
    }

    /// Démarre un agent
    pub async fn start_agent(&self, agent_id: &AgentId) {
        let mut entries = self.entries.write().await;
        let now = Self::now();

        let entry = entries.entry(agent_id.clone()).or_default();

        let previous = entry.state;
        entry.state = LifecycleState::Initializing;
        entry.state_changed_at = now;

        entry.events.push(LifecycleEvent {
            timestamp: now,
            agent_id: agent_id.clone(),
            previous_state: previous,
            new_state: LifecycleState::Initializing,
            reason: "Agent starting".to_string(),
        });

        // Transition immédiate vers Running (simulation)
        entry.state = LifecycleState::Running;
        entry.events.push(LifecycleEvent {
            timestamp: now,
            agent_id: agent_id.clone(),
            previous_state: LifecycleState::Initializing,
            new_state: LifecycleState::Running,
            reason: "Initialization complete".to_string(),
        });
    }

    /// Arrête un agent
    pub async fn stop_agent(&self, agent_id: &AgentId) {
        let mut entries = self.entries.write().await;
        let now = Self::now();

        if let Some(entry) = entries.get_mut(agent_id) {
            let previous = entry.state;
            entry.state = LifecycleState::Stopping;
            entry.state_changed_at = now;

            entry.events.push(LifecycleEvent {
                timestamp: now,
                agent_id: agent_id.clone(),
                previous_state: previous,
                new_state: LifecycleState::Stopping,
                reason: "Agent stopping".to_string(),
            });

            // Transition vers Stopped
            entry.state = LifecycleState::Stopped;
            entry.events.push(LifecycleEvent {
                timestamp: now,
                agent_id: agent_id.clone(),
                previous_state: LifecycleState::Stopping,
                new_state: LifecycleState::Stopped,
                reason: "Agent stopped".to_string(),
            });
        }
    }

    /// Met en pause un agent
    pub async fn pause_agent(&self, agent_id: &AgentId) {
        self.transition_state(
            agent_id,
            LifecycleState::Paused,
            "Agent paused",
        ).await;
    }

    /// Reprend un agent
    pub async fn resume_agent(&self, agent_id: &AgentId) {
        self.transition_state(
            agent_id,
            LifecycleState::Running,
            "Agent resumed",
        ).await;
    }

    /// Redémarre un agent
    pub async fn restart_agent(&self, agent_id: &AgentId) {
        let mut entries = self.entries.write().await;
        let now = Self::now();

        if let Some(entry) = entries.get_mut(agent_id) {
            let previous = entry.state;
            entry.state = LifecycleState::Restarting;
            entry.restart_count += 1;

            entry.events.push(LifecycleEvent {
                timestamp: now,
                agent_id: agent_id.clone(),
                previous_state: previous,
                new_state: LifecycleState::Restarting,
                reason: format!("Restart #{}", entry.restart_count),
            });

            // Transition vers Running
            entry.state = LifecycleState::Running;
            entry.events.push(LifecycleEvent {
                timestamp: now,
                agent_id: agent_id.clone(),
                previous_state: LifecycleState::Restarting,
                new_state: LifecycleState::Running,
                reason: "Restart complete".to_string(),
            });
        }
    }

    /// Marque un agent en erreur
    pub async fn mark_error(&self, agent_id: &AgentId, reason: &str) {
        self.transition_state(
            agent_id,
            LifecycleState::Error,
            reason,
        ).await;
    }

    /// Transition d'état générique
    async fn transition_state(&self, agent_id: &AgentId, new_state: LifecycleState, reason: &str) {
        let mut entries = self.entries.write().await;
        let now = Self::now();

        if let Some(entry) = entries.get_mut(agent_id) {
            let previous = entry.state;
            entry.state = new_state;
            entry.state_changed_at = now;

            entry.events.push(LifecycleEvent {
                timestamp: now,
                agent_id: agent_id.clone(),
                previous_state: previous,
                new_state,
                reason: reason.to_string(),
            });
        }
    }

    /// Récupère l'état d'un agent
    pub async fn get_state(&self, agent_id: &AgentId) -> Option<LifecycleState> {
        let entries = self.entries.read().await;
        entries.get(agent_id).map(|e| e.state)
    }

    /// Récupère les événements d'un agent
    pub async fn get_events(&self, agent_id: &AgentId) -> Vec<LifecycleEvent> {
        let entries = self.entries.read().await;
        entries.get(agent_id)
            .map(|e| e.events.clone())
            .unwrap_or_default()
    }

    /// Récupère le nombre de redémarrages
    pub async fn restart_count(&self, agent_id: &AgentId) -> u32 {
        let entries = self.entries.read().await;
        entries.get(agent_id)
            .map(|e| e.restart_count)
            .unwrap_or(0)
    }

    /// Récupère le temps depuis le démarrage
    pub async fn uptime_ms(&self, agent_id: &AgentId) -> Option<u64> {
        let entries = self.entries.read().await;
        entries.get(agent_id).map(|e| Self::now() - e.started_at)
    }

    /// Vérifie si un agent est en cours d'exécution
    pub async fn is_running(&self, agent_id: &AgentId) -> bool {
        matches!(self.get_state(agent_id).await, Some(LifecycleState::Running))
    }

    /// Liste les agents par état
    pub async fn agents_by_state(&self, state: LifecycleState) -> Vec<AgentId> {
        let entries = self.entries.read().await;
        entries.iter()
            .filter(|(_, e)| e.state == state)
            .map(|(id, _)| id.clone())
            .collect()
    }

    fn now() -> u64 {
        std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap_or_default()
            .as_millis() as u64
    }
}

impl Default for AgentLifecycle {
    fn default() -> Self {
        Self::new()
    }
}

/// Configuration du cycle de vie
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct LifecycleConfig {
    pub max_restarts: u32,
    pub restart_delay_ms: u64,
    pub initialization_timeout_ms: u64,
    pub shutdown_timeout_ms: u64,
}

impl Default for LifecycleConfig {
    fn default() -> Self {
        Self {
            max_restarts: 5,
            restart_delay_ms: 1000,
            initialization_timeout_ms: 30000,
            shutdown_timeout_ms: 10000,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_lifecycle() {
        let lifecycle = AgentLifecycle::new();
        let agent_id = "test_agent".to_string();

        lifecycle.start_agent(&agent_id).await;
        assert!(lifecycle.is_running(&agent_id).await);

        lifecycle.pause_agent(&agent_id).await;
        assert_eq!(lifecycle.get_state(&agent_id).await, Some(LifecycleState::Paused));

        lifecycle.resume_agent(&agent_id).await;
        assert!(lifecycle.is_running(&agent_id).await);

        lifecycle.stop_agent(&agent_id).await;
        assert_eq!(lifecycle.get_state(&agent_id).await, Some(LifecycleState::Stopped));
    }
}
