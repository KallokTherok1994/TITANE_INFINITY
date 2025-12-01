//! ═══════════════════════════════════════════════════════════════════════════════
//! TITANE∞ v∞.MPE — SNAPSHOT MANAGER
//! Gestion des snapshots (état complet périodique)
//! ═══════════════════════════════════════════════════════════════════════════════

use super::types::Snapshot;

/// Intervalle entre snapshots automatiques (30 minutes)
pub const SNAPSHOT_INTERVAL_MS: u64 = 30 * 60 * 1000;

/// Nombre maximum de snapshots à conserver
const MAX_SNAPSHOTS: usize = 10;

/// Gestionnaire de snapshots
pub struct SnapshotManager {
    /// Historique des snapshots (métadonnées)
    snapshots: Vec<SnapshotMeta>,
    /// Dernier snapshot timestamp
    last_snapshot_time: Option<u64>,
    /// Nombre total de snapshots créés
    total_snapshots: u64,
}

/// Métadonnées d'un snapshot
#[derive(Debug, Clone)]
pub struct SnapshotMeta {
    pub id: String,
    pub timestamp: u64,
    pub schema_version: u32,
    pub size_bytes: u64,
    pub checksum: String,
}

impl SnapshotManager {
    pub fn new() -> Self {
        Self {
            snapshots: Vec::with_capacity(MAX_SNAPSHOTS),
            last_snapshot_time: None,
            total_snapshots: 0,
        }
    }

    /// Enregistrer un nouveau snapshot
    pub fn record_snapshot(&mut self, snapshot: &Snapshot) {
        let meta = SnapshotMeta {
            id: snapshot.id.clone(),
            timestamp: snapshot.timestamp,
            schema_version: snapshot.schema_version,
            size_bytes: snapshot.state_blob.len() as u64,
            checksum: snapshot.checksum.clone(),
        };

        // Rotation si trop de snapshots
        if self.snapshots.len() >= MAX_SNAPSHOTS {
            self.snapshots.remove(0);
        }

        self.snapshots.push(meta);
        self.last_snapshot_time = Some(snapshot.timestamp);
        self.total_snapshots += 1;
    }

    /// Vérifier si un snapshot est nécessaire
    pub fn needs_snapshot(&self) -> bool {
        match self.last_snapshot_time {
            Some(last) => {
                let now = chrono::Utc::now().timestamp_millis() as u64;
                now - last >= SNAPSHOT_INTERVAL_MS
            }
            None => true, // Jamais de snapshot
        }
    }

    /// Obtenir le dernier snapshot timestamp
    pub fn last_snapshot_time(&self) -> Option<u64> {
        self.last_snapshot_time
    }

    /// Obtenir l'historique des snapshots
    pub fn history(&self) -> &[SnapshotMeta] {
        &self.snapshots
    }

    /// Obtenir le nombre total de snapshots créés
    pub fn total_count(&self) -> u64 {
        self.total_snapshots
    }

    /// Temps estimé avant prochain snapshot (ms)
    pub fn time_until_next_snapshot(&self) -> u64 {
        match self.last_snapshot_time {
            Some(last) => {
                let now = chrono::Utc::now().timestamp_millis() as u64;
                let elapsed = now.saturating_sub(last);
                SNAPSHOT_INTERVAL_MS.saturating_sub(elapsed)
            }
            None => 0, // Snapshot immédiat requis
        }
    }
}

impl Default for SnapshotManager {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_snapshot_manager_new() {
        let manager = SnapshotManager::new();
        assert!(manager.needs_snapshot()); // Premier snapshot requis
        assert_eq!(manager.total_count(), 0);
    }

    #[test]
    fn test_snapshot_manager_record() {
        let mut manager = SnapshotManager::new();

        let snapshot = Snapshot {
            id: "test-1".to_string(),
            schema_version: 1,
            timestamp: chrono::Utc::now().timestamp_millis() as u64,
            state_blob: vec![1, 2, 3],
            checksum: "abc123".to_string(),
        };

        manager.record_snapshot(&snapshot);

        assert_eq!(manager.total_count(), 1);
        assert!(!manager.needs_snapshot()); // Plus besoin immédiatement
        assert_eq!(manager.history().len(), 1);
    }

    #[test]
    fn test_snapshot_manager_rotation() {
        let mut manager = SnapshotManager::new();

        // Ajouter plus que la limite
        for i in 0..15 {
            let snapshot = Snapshot {
                id: format!("test-{}", i),
                schema_version: 1,
                timestamp: i as u64,
                state_blob: vec![],
                checksum: format!("checksum-{}", i),
            };
            manager.record_snapshot(&snapshot);
        }

        // Doit garder seulement MAX_SNAPSHOTS
        assert!(manager.history().len() <= MAX_SNAPSHOTS);
        assert_eq!(manager.total_count(), 15);
    }
}
