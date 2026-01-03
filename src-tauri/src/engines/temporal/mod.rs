//! TITANE∞ v20Ω — Temporal Engine
//! Moteur de gestion temporelle et undo/redo

mod snapshot_manager;
mod temporal_diff;
mod temporal_state;
mod timeline;

pub use snapshot_manager::*;
pub use temporal_diff::*;
pub use temporal_state::*;
pub use timeline::*;

use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tokio::sync::RwLock;

/// Configuration du moteur temporel
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct TemporalConfig {
    /// Nombre maximum de snapshots
    pub max_snapshots: usize,
    /// Intervalle automatique de snapshot (ms), 0 = désactivé
    pub auto_snapshot_interval: u64,
    /// Activer la compression des snapshots
    pub enable_compression: bool,
    /// Nombre maximum de branches
    pub max_branches: usize,
    /// Durée de rétention (ms)
    pub retention_duration: u64,
}

impl Default for TemporalConfig {
    fn default() -> Self {
        Self {
            max_snapshots: 100,
            auto_snapshot_interval: 0,
            enable_compression: true,
            max_branches: 10,
            retention_duration: 3600000, // 1 heure
        }
    }
}

/// Résultat d'une opération temporelle
#[derive(Clone, Debug, Serialize, Deserialize)]
pub enum TemporalResult {
    Success { snapshot_id: String },
    Undone { to_snapshot: String },
    Redone { to_snapshot: String },
    BranchCreated { branch_id: String },
    Error { message: String },
}

/// Moteur temporel principal
pub struct TemporalEngine {
    config: TemporalConfig,
    snapshot_manager: Arc<RwLock<SnapshotManager>>,
    timeline: Arc<RwLock<Timeline>>,
    current_position: Arc<RwLock<usize>>,
    branches: Arc<RwLock<Vec<String>>>,
    active_branch: Arc<RwLock<String>>,
}

impl TemporalEngine {
    /// Crée un nouveau moteur temporel
    pub fn new(config: TemporalConfig) -> Self {
        Self {
            config: config.clone(),
            snapshot_manager: Arc::new(RwLock::new(SnapshotManager::new(config.max_snapshots))),
            timeline: Arc::new(RwLock::new(Timeline::new())),
            current_position: Arc::new(RwLock::new(0)),
            branches: Arc::new(RwLock::new(vec!["main".to_string()])),
            active_branch: Arc::new(RwLock::new("main".to_string())),
        }
    }

    /// Capture un snapshot de l'état actuel
    pub async fn snapshot<T: Serialize + for<'de> Deserialize<'de> + Clone>(
        &self,
        state: &T,
        label: Option<String>,
    ) -> TemporalResult {
        let mut manager = self.snapshot_manager.write().await;
        let mut timeline = self.timeline.write().await;
        let mut position = self.current_position.write().await;
        let branch = self.active_branch.read().await;

        // Sérialiser l'état
        let serialized = match serde_json::to_string(state) {
            Ok(s) => s,
            Err(e) => {
                return TemporalResult::Error {
                    message: e.to_string(),
                }
            }
        };

        // Créer le snapshot
        let snapshot = StateSnapshot {
            id: generate_snapshot_id(),
            timestamp: current_timestamp(),
            label,
            data: serialized,
            branch: branch.clone(),
            parent_id: manager.get_current_id(),
            metadata: std::collections::HashMap::new(),
        };

        let snapshot_id = snapshot.id.clone();

        // Si on n'est pas à la fin de la timeline, créer une nouvelle branche ou tronquer
        if *position < timeline.len().saturating_sub(1) {
            // Tronquer la timeline à la position actuelle
            timeline.truncate(*position + 1);
        }

        // Ajouter le snapshot
        manager.add(snapshot.clone());
        timeline.push(snapshot_id.clone());
        *position = timeline.len() - 1;

        // Nettoyer les anciens snapshots si nécessaire.
        // IMPORTANT: ne pas await en tenant des verrous, sinon deadlock.
        let cutoff = current_timestamp().saturating_sub(self.config.retention_duration);
        manager.remove_older_than(cutoff);

        TemporalResult::Success { snapshot_id }
    }

    /// Annule la dernière action (undo)
    pub async fn undo<T: Serialize + for<'de> Deserialize<'de> + Clone>(&self) -> Option<T> {
        let manager = self.snapshot_manager.read().await;
        let timeline = self.timeline.read().await;
        let mut position = self.current_position.write().await;

        if *position == 0 {
            return None;
        }

        *position -= 1;
        let snapshot_id = &timeline[*position];

        if let Some(snapshot) = manager.get(snapshot_id) {
            serde_json::from_str(&snapshot.data).ok()
        } else {
            None
        }
    }

    /// Refait l'action annulée (redo)
    pub async fn redo<T: Serialize + for<'de> Deserialize<'de> + Clone>(&self) -> Option<T> {
        let manager = self.snapshot_manager.read().await;
        let timeline = self.timeline.read().await;
        let mut position = self.current_position.write().await;

        if *position >= timeline.len().saturating_sub(1) {
            return None;
        }

        *position += 1;
        let snapshot_id = &timeline[*position];

        if let Some(snapshot) = manager.get(snapshot_id) {
            serde_json::from_str(&snapshot.data).ok()
        } else {
            None
        }
    }

    /// Saute à un snapshot spécifique
    pub async fn jump_to<T: Serialize + for<'de> Deserialize<'de> + Clone>(
        &self,
        snapshot_id: &str,
    ) -> Option<T> {
        let manager = self.snapshot_manager.read().await;
        let timeline = self.timeline.read().await;
        let mut position = self.current_position.write().await;

        // Trouver la position dans la timeline
        if let Some(pos) = timeline.iter().position(|id| id == snapshot_id) {
            *position = pos;

            if let Some(snapshot) = manager.get(snapshot_id) {
                match serde_json::from_str(&snapshot.data) {
                    Ok(state) => return Some(state),
                    Err(_) => return None,
                }
            }
        }

        None
    }

    /// Crée une nouvelle branche à partir de la position actuelle
    pub async fn create_branch(&self, name: String) -> TemporalResult {
        let mut branches = self.branches.write().await;

        if branches.len() >= self.config.max_branches {
            return TemporalResult::Error {
                message: "Maximum branches reached".to_string(),
            };
        }

        if branches.contains(&name) {
            return TemporalResult::Error {
                message: format!("Branch '{}' already exists", name),
            };
        }

        branches.push(name.clone());

        // Changer vers la nouvelle branche
        let mut active = self.active_branch.write().await;
        *active = name.clone();

        TemporalResult::BranchCreated { branch_id: name }
    }

    /// Change de branche
    pub async fn switch_branch(&self, name: &str) -> Result<(), String> {
        let branches = self.branches.read().await;

        if !branches.contains(&name.to_string()) {
            return Err(format!("Branch '{}' not found", name));
        }

        let mut active = self.active_branch.write().await;
        *active = name.to_string();

        Ok(())
    }

    /// Vérifie si undo est possible
    pub async fn can_undo(&self) -> bool {
        let position = self.current_position.read().await;
        *position > 0
    }

    /// Vérifie si redo est possible
    pub async fn can_redo(&self) -> bool {
        let position = self.current_position.read().await;
        let timeline = self.timeline.read().await;
        *position < timeline.len().saturating_sub(1)
    }

    /// Retourne l'historique des snapshots
    pub async fn get_history(&self) -> Vec<SnapshotInfo> {
        let manager = self.snapshot_manager.read().await;
        let timeline = self.timeline.read().await;
        let position = self.current_position.read().await;

        timeline
            .iter()
            .enumerate()
            .filter_map(|(idx, id)| {
                manager.get(id).map(|s| SnapshotInfo {
                    id: s.id.clone(),
                    timestamp: s.timestamp,
                    label: s.label.clone(),
                    branch: s.branch.clone(),
                    is_current: idx == *position,
                })
            })
            .collect()
    }

    /// Retourne la branche active
    pub async fn get_active_branch(&self) -> String {
        self.active_branch.read().await.clone()
    }

    /// Retourne toutes les branches
    pub async fn get_branches(&self) -> Vec<String> {
        self.branches.read().await.clone()
    }

    /// Retourne les statistiques
    pub async fn get_stats(&self) -> TemporalStats {
        let manager = self.snapshot_manager.read().await;
        let timeline = self.timeline.read().await;
        let position = self.current_position.read().await;
        let branches = self.branches.read().await;

        TemporalStats {
            total_snapshots: manager.len(),
            timeline_length: timeline.len(),
            current_position: *position,
            branch_count: branches.len(),
            can_undo: *position > 0,
            can_redo: *position < timeline.len().saturating_sub(1),
        }
    }

    /// Efface tout l'historique
    pub async fn clear(&self) {
        let mut manager = self.snapshot_manager.write().await;
        let mut timeline = self.timeline.write().await;
        let mut position = self.current_position.write().await;
        let mut branches = self.branches.write().await;
        let mut active = self.active_branch.write().await;

        manager.clear();
        timeline.clear();
        *position = 0;
        branches.clear();
        branches.push("main".to_string());
        *active = "main".to_string();
    }
}

/// Information sur un snapshot
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct SnapshotInfo {
    pub id: String,
    pub timestamp: u64,
    pub label: Option<String>,
    pub branch: String,
    pub is_current: bool,
}

/// Statistiques du moteur temporel
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct TemporalStats {
    pub total_snapshots: usize,
    pub timeline_length: usize,
    pub current_position: usize,
    pub branch_count: usize,
    pub can_undo: bool,
    pub can_redo: bool,
}

/// Génère un ID de snapshot
fn generate_snapshot_id() -> String {
    use std::time::{Duration, SystemTime, UNIX_EPOCH};

    let nanos = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_else(|_| Duration::from_secs(0))
        .as_nanos();

    format!("snap-{:x}", nanos)
}

/// Retourne le timestamp actuel
fn current_timestamp() -> u64 {
    crate::core::utils::now_ms()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[derive(Clone, Debug, Serialize, Deserialize, PartialEq)]
    struct TestState {
        value: i32,
        name: String,
    }

    #[tokio::test]
    async fn test_temporal_engine() {
        let engine = TemporalEngine::new(TemporalConfig::default());

        let state1 = TestState {
            value: 1,
            name: "first".to_string(),
        };

        // Premier snapshot
        let result = engine.snapshot(&state1, Some("Initial".to_string())).await;
        assert!(matches!(result, TemporalResult::Success { .. }));

        // Deuxième snapshot
        let state2 = TestState {
            value: 2,
            name: "second".to_string(),
        };
        engine.snapshot(&state2, None).await;

        // Undo
        let undone: Option<TestState> = engine.undo().await;
        assert!(undone.is_some());
        assert_eq!(undone.expect("undo should restore previous state").value, 1);

        // Redo
        let redone: Option<TestState> = engine.redo().await;
        assert!(redone.is_some());
        assert_eq!(redone.expect("redo should restore newer state").value, 2);
    }

    #[tokio::test]
    async fn test_branches() {
        let engine = TemporalEngine::new(TemporalConfig::default());

        let state = TestState {
            value: 1,
            name: "test".to_string(),
        };

        engine.snapshot(&state, None).await;

        // Créer une branche
        let result = engine.create_branch("feature".to_string()).await;
        assert!(matches!(result, TemporalResult::BranchCreated { .. }));

        let branches = engine.get_branches().await;
        assert_eq!(branches.len(), 2);
        assert!(branches.contains(&"feature".to_string()));
    }

    #[tokio::test]
    async fn test_stats() {
        let engine = TemporalEngine::new(TemporalConfig::default());

        let state = TestState {
            value: 1,
            name: "test".to_string(),
        };

        engine.snapshot(&state, None).await;
        engine.snapshot(&state, None).await;

        let stats = engine.get_stats().await;
        assert_eq!(stats.total_snapshots, 2);
        assert!(stats.can_undo);
        assert!(!stats.can_redo);
    }
}
