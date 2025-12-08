//! TITANE∞ v20Ω — Temporal State
//! Structures d'état pour le système temporel

use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// Snapshot d'un état
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct StateSnapshot {
    /// Identifiant unique
    pub id: String,
    /// Timestamp de création
    pub timestamp: u64,
    /// Label optionnel
    pub label: Option<String>,
    /// Données sérialisées
    pub data: String,
    /// Branche
    pub branch: String,
    /// ID du parent
    pub parent_id: Option<String>,
    /// Métadonnées additionnelles
    pub metadata: HashMap<String, String>,
}

impl StateSnapshot {
    /// Crée un nouveau snapshot
    pub fn new(
        id: String,
        data: String,
        branch: String,
        parent_id: Option<String>,
    ) -> Self {
        Self {
            id,
            timestamp: current_timestamp(),
            label: None,
            data,
            branch,
            parent_id,
            metadata: HashMap::new(),
        }
    }

    /// Ajoute un label
    pub fn with_label(mut self, label: String) -> Self {
        self.label = Some(label);
        self
    }

    /// Ajoute une métadonnée
    pub fn with_metadata(mut self, key: String, value: String) -> Self {
        self.metadata.insert(key, value);
        self
    }

    /// Calcule la taille approximative
    pub fn size(&self) -> usize {
        self.id.len()
            + self.data.len()
            + self.branch.len()
            + self.label.as_ref().map(|l| l.len()).unwrap_or(0)
            + self.parent_id.as_ref().map(|p| p.len()).unwrap_or(0)
    }

    /// Vérifie si le snapshot est récent
    pub fn is_recent(&self, max_age_ms: u64) -> bool {
        current_timestamp() - self.timestamp < max_age_ms
    }
}

/// État temporel complet
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct TemporalState {
    /// Snapshots indexés par ID
    pub snapshots: HashMap<String, StateSnapshot>,
    /// Timeline principale
    pub timeline: Vec<String>,
    /// Position actuelle
    pub position: usize,
    /// Branches disponibles
    pub branches: Vec<BranchInfo>,
    /// Branche active
    pub active_branch: String,
}

impl Default for TemporalState {
    fn default() -> Self {
        Self {
            snapshots: HashMap::new(),
            timeline: Vec::new(),
            position: 0,
            branches: vec![BranchInfo::new("main".to_string())],
            active_branch: "main".to_string(),
        }
    }
}

impl TemporalState {
    /// Crée un nouvel état temporel
    pub fn new() -> Self {
        Self::default()
    }

    /// Ajoute un snapshot
    pub fn add_snapshot(&mut self, snapshot: StateSnapshot) {
        let id = snapshot.id.clone();
        self.snapshots.insert(id.clone(), snapshot);
        self.timeline.push(id);
        self.position = self.timeline.len() - 1;
    }

    /// Récupère un snapshot par ID
    pub fn get_snapshot(&self, id: &str) -> Option<&StateSnapshot> {
        self.snapshots.get(id)
    }

    /// Récupère le snapshot actuel
    pub fn current_snapshot(&self) -> Option<&StateSnapshot> {
        self.timeline.get(self.position).and_then(|id| self.snapshots.get(id))
    }

    /// Vérifie si undo est possible
    pub fn can_undo(&self) -> bool {
        self.position > 0
    }

    /// Vérifie si redo est possible
    pub fn can_redo(&self) -> bool {
        self.position < self.timeline.len().saturating_sub(1)
    }

    /// Effectue un undo
    pub fn undo(&mut self) -> Option<&StateSnapshot> {
        if self.can_undo() {
            self.position -= 1;
            self.current_snapshot()
        } else {
            None
        }
    }

    /// Effectue un redo
    pub fn redo(&mut self) -> Option<&StateSnapshot> {
        if self.can_redo() {
            self.position += 1;
            self.current_snapshot()
        } else {
            None
        }
    }

    /// Saute à une position
    pub fn jump_to(&mut self, position: usize) -> Option<&StateSnapshot> {
        if position < self.timeline.len() {
            self.position = position;
            self.current_snapshot()
        } else {
            None
        }
    }

    /// Retourne le nombre de snapshots
    pub fn len(&self) -> usize {
        self.snapshots.len()
    }

    /// Vérifie si l'état est vide
    pub fn is_empty(&self) -> bool {
        self.snapshots.is_empty()
    }
}

/// Information sur une branche
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct BranchInfo {
    /// Nom de la branche
    pub name: String,
    /// Timestamp de création
    pub created_at: u64,
    /// ID du snapshot de base
    pub base_snapshot_id: Option<String>,
    /// Nombre de commits
    pub commit_count: usize,
}

impl BranchInfo {
    /// Crée une nouvelle branche
    pub fn new(name: String) -> Self {
        Self {
            name,
            created_at: current_timestamp(),
            base_snapshot_id: None,
            commit_count: 0,
        }
    }

    /// Crée une branche à partir d'un snapshot
    pub fn from_snapshot(name: String, snapshot_id: String) -> Self {
        Self {
            name,
            created_at: current_timestamp(),
            base_snapshot_id: Some(snapshot_id),
            commit_count: 0,
        }
    }

    /// Incrémente le compteur de commits
    pub fn increment_commits(&mut self) {
        self.commit_count += 1;
    }
}

/// Résumé de l'état temporel
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct TemporalSummary {
    pub total_snapshots: usize,
    pub timeline_length: usize,
    pub current_position: usize,
    pub active_branch: String,
    pub branch_count: usize,
    pub oldest_snapshot: Option<u64>,
    pub newest_snapshot: Option<u64>,
    pub total_size: usize,
}

impl From<&TemporalState> for TemporalSummary {
    fn from(state: &TemporalState) -> Self {
        let timestamps: Vec<u64> = state.snapshots.values().map(|s| s.timestamp).collect();
        let total_size: usize = state.snapshots.values().map(|s| s.size()).sum();

        Self {
            total_snapshots: state.snapshots.len(),
            timeline_length: state.timeline.len(),
            current_position: state.position,
            active_branch: state.active_branch.clone(),
            branch_count: state.branches.len(),
            oldest_snapshot: timestamps.iter().min().copied(),
            newest_snapshot: timestamps.iter().max().copied(),
            total_size,
        }
    }
}

/// Retourne le timestamp actuel en millisecondes
fn current_timestamp() -> u64 {
    use std::time::{SystemTime, UNIX_EPOCH};
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_millis() as u64
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_state_snapshot() {
        let snapshot = StateSnapshot::new(
            "snap-1".to_string(),
            r#"{"value": 42}"#.to_string(),
            "main".to_string(),
            None,
        )
        .with_label("Test snapshot".to_string());

        assert_eq!(snapshot.label, Some("Test snapshot".to_string()));
        assert!(snapshot.size() > 0);
    }

    #[test]
    fn test_temporal_state() {
        let mut state = TemporalState::new();

        // Ajouter des snapshots
        state.add_snapshot(StateSnapshot::new(
            "snap-1".to_string(),
            "data1".to_string(),
            "main".to_string(),
            None,
        ));

        state.add_snapshot(StateSnapshot::new(
            "snap-2".to_string(),
            "data2".to_string(),
            "main".to_string(),
            Some("snap-1".to_string()),
        ));

        assert_eq!(state.len(), 2);
        assert!(state.can_undo());
        assert!(!state.can_redo());

        // Undo
        let snapshot = state.undo();
        assert!(snapshot.is_some());
        assert!(state.can_redo());
    }
}
