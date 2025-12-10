//! TITANE∞ v20Ω — Snapshot Manager
//! Gestionnaire de snapshots avec LRU cache

use super::StateSnapshot;
use std::collections::{HashMap, VecDeque};

/// Gestionnaire de snapshots
#[derive(Debug)]
pub struct SnapshotManager {
    /// Snapshots stockés
    snapshots: HashMap<String, StateSnapshot>,
    /// Ordre d'accès (LRU)
    access_order: VecDeque<String>,
    /// Capacité maximale
    max_capacity: usize,
    /// ID du snapshot courant
    current_id: Option<String>,
}

impl SnapshotManager {
    /// Crée un nouveau gestionnaire
    pub fn new(max_capacity: usize) -> Self {
        Self {
            snapshots: HashMap::with_capacity(max_capacity),
            access_order: VecDeque::with_capacity(max_capacity),
            max_capacity,
            current_id: None,
        }
    }

    /// Ajoute un snapshot
    pub fn add(&mut self, snapshot: StateSnapshot) {
        let id = snapshot.id.clone();

        // Éviction si capacité atteinte
        while self.snapshots.len() >= self.max_capacity {
            self.evict_oldest();
        }

        // Ajouter le snapshot
        self.snapshots.insert(id.clone(), snapshot);
        self.access_order.push_back(id.clone());
        self.current_id = Some(id);
    }

    /// Récupère un snapshot par ID
    pub fn get(&self, id: &str) -> Option<&StateSnapshot> {
        self.snapshots.get(id)
    }

    /// Récupère un snapshot et met à jour l'ordre d'accès
    pub fn get_and_touch(&mut self, id: &str) -> Option<&StateSnapshot> {
        if self.snapshots.contains_key(id) {
            // Mettre à jour l'ordre d'accès
            self.access_order.retain(|i| i != id);
            self.access_order.push_back(id.to_string());
            self.snapshots.get(id)
        } else {
            None
        }
    }

    /// Supprime un snapshot
    pub fn remove(&mut self, id: &str) -> Option<StateSnapshot> {
        self.access_order.retain(|i| i != id);

        if self.current_id.as_deref() == Some(id) {
            self.current_id = self.access_order.back().cloned();
        }

        self.snapshots.remove(id)
    }

    /// Évince le snapshot le plus ancien
    fn evict_oldest(&mut self) {
        if let Some(oldest_id) = self.access_order.pop_front() {
            self.snapshots.remove(&oldest_id);
        }
    }

    /// Retourne l'ID du snapshot courant
    pub fn get_current_id(&self) -> Option<String> {
        self.current_id.clone()
    }

    /// Définit l'ID du snapshot courant
    pub fn set_current_id(&mut self, id: Option<String>) {
        self.current_id = id;
    }

    /// Retourne le snapshot courant
    pub fn get_current(&self) -> Option<&StateSnapshot> {
        self.current_id
            .as_ref()
            .and_then(|id| self.snapshots.get(id))
    }

    /// Vérifie si un snapshot existe
    pub fn contains(&self, id: &str) -> bool {
        self.snapshots.contains_key(id)
    }

    /// Retourne le nombre de snapshots
    pub fn len(&self) -> usize {
        self.snapshots.len()
    }

    /// Vérifie si le gestionnaire est vide
    pub fn is_empty(&self) -> bool {
        self.snapshots.is_empty()
    }

    /// Retourne la capacité restante
    pub fn remaining_capacity(&self) -> usize {
        self.max_capacity.saturating_sub(self.snapshots.len())
    }

    /// Supprime les snapshots plus anciens qu'un timestamp
    pub fn remove_older_than(&mut self, cutoff_timestamp: u64) {
        let ids_to_remove: Vec<String> = self
            .snapshots
            .iter()
            .filter(|(_, s)| s.timestamp < cutoff_timestamp)
            .map(|(id, _)| id.clone())
            .collect();

        for id in ids_to_remove {
            self.remove(&id);
        }
    }

    /// Retourne les IDs des snapshots d'une branche
    pub fn get_branch_snapshots(&self, branch: &str) -> Vec<String> {
        self.snapshots
            .iter()
            .filter(|(_, s)| s.branch == branch)
            .map(|(id, _)| id.clone())
            .collect()
    }

    /// Retourne tous les IDs
    pub fn all_ids(&self) -> Vec<String> {
        self.snapshots.keys().cloned().collect()
    }

    /// Retourne la taille totale estimée
    pub fn total_size(&self) -> usize {
        self.snapshots.values().map(|s| s.size()).sum()
    }

    /// Compacte les données (supprime les trous dans l'ordre d'accès)
    pub fn compact(&mut self) {
        self.access_order
            .retain(|id| self.snapshots.contains_key(id));
    }

    /// Efface tous les snapshots
    pub fn clear(&mut self) {
        self.snapshots.clear();
        self.access_order.clear();
        self.current_id = None;
    }

    /// Retourne les statistiques
    pub fn stats(&self) -> SnapshotManagerStats {
        SnapshotManagerStats {
            count: self.snapshots.len(),
            max_capacity: self.max_capacity,
            total_size: self.total_size(),
            oldest_timestamp: self.snapshots.values().map(|s| s.timestamp).min(),
            newest_timestamp: self.snapshots.values().map(|s| s.timestamp).max(),
        }
    }
}

/// Statistiques du gestionnaire
#[derive(Debug, Clone)]
pub struct SnapshotManagerStats {
    pub count: usize,
    pub max_capacity: usize,
    pub total_size: usize,
    pub oldest_timestamp: Option<u64>,
    pub newest_timestamp: Option<u64>,
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::collections::HashMap;

    fn create_snapshot(id: &str, timestamp: u64) -> StateSnapshot {
        StateSnapshot {
            id: id.to_string(),
            timestamp,
            label: None,
            data: "test".to_string(),
            branch: "main".to_string(),
            parent_id: None,
            metadata: HashMap::new(),
        }
    }

    #[test]
    fn test_snapshot_manager() {
        let mut manager = SnapshotManager::new(3);

        manager.add(create_snapshot("snap-1", 1000));
        manager.add(create_snapshot("snap-2", 2000));
        manager.add(create_snapshot("snap-3", 3000));

        assert_eq!(manager.len(), 3);
        assert!(manager.contains("snap-1"));

        // Ajouter un 4ème devrait évincer le premier
        manager.add(create_snapshot("snap-4", 4000));
        assert_eq!(manager.len(), 3);
        assert!(!manager.contains("snap-1"));
    }

    #[test]
    fn test_remove_older_than() {
        let mut manager = SnapshotManager::new(10);

        manager.add(create_snapshot("old", 1000));
        manager.add(create_snapshot("mid", 2000));
        manager.add(create_snapshot("new", 3000));

        manager.remove_older_than(2500);

        assert_eq!(manager.len(), 1);
        assert!(manager.contains("new"));
    }

    #[test]
    fn test_lru_access() {
        let mut manager = SnapshotManager::new(3);

        manager.add(create_snapshot("snap-1", 1000));
        manager.add(create_snapshot("snap-2", 2000));
        manager.add(create_snapshot("snap-3", 3000));

        // Accéder à snap-1 pour le rendre récent
        manager.get_and_touch("snap-1");

        // Ajouter un nouveau devrait évincer snap-2 (pas snap-1)
        manager.add(create_snapshot("snap-4", 4000));

        assert!(manager.contains("snap-1"));
        assert!(!manager.contains("snap-2"));
    }
}
