/**
 * ═══════════════════════════════════════════════════════════════════
 * TITANE∞ v14 — PERSISTENCE LAYER (SQLite)
 * Sauvegarde et chargement de l'état SingularityState
 * ═══════════════════════════════════════════════════════════════════
 */
use super::SingularityState;
use serde_json;
use std::fs;
use std::path::PathBuf;

pub struct PersistenceLayer {
    db_path: PathBuf,
}

impl PersistenceLayer {
    /// Créer un nouveau layer de persistence
    pub fn new() -> Self {
        let db_path = Self::get_db_path();

        // Créer répertoire si inexistant
        if let Some(parent) = db_path.parent() {
            fs::create_dir_all(parent).ok();
        }

        Self { db_path }
    }

    /// Obtenir le chemin de la base de données
    fn get_db_path() -> PathBuf {
        let mut path = dirs::data_local_dir().unwrap_or_else(|| PathBuf::from("."));
        path.push("TITANE_INFINITY");
        path.push("singularity_state.json");
        path
    }

    /// Sauvegarder l'état dans un fichier JSON
    pub async fn save_state(&self, state: &SingularityState) -> Result<(), String> {
        let json = serde_json::to_string_pretty(state)
            .map_err(|e| format!("Serialization error: {}", e))?;

        tokio::fs::write(&self.db_path, json)
            .await
            .map_err(|e| format!("Write error: {}", e))?;

        Ok(())
    }

    /// Charger l'état depuis le fichier JSON
    pub async fn load_state(&self) -> Result<SingularityState, String> {
        if !self.db_path.exists() {
            return Err("State file does not exist".to_string());
        }

        let json = tokio::fs::read_to_string(&self.db_path)
            .await
            .map_err(|e| format!("Read error: {}", e))?;

        let state: SingularityState =
            serde_json::from_str(&json).map_err(|e| format!("Deserialization error: {}", e))?;

        Ok(state)
    }

    /// Supprimer le fichier d'état
    pub async fn clear_state(&self) -> Result<(), String> {
        if self.db_path.exists() {
            tokio::fs::remove_file(&self.db_path)
                .await
                .map_err(|e| format!("Delete error: {}", e))?;
        }
        Ok(())
    }

    /// Vérifier si un état existe
    pub fn state_exists(&self) -> bool {
        self.db_path.exists()
    }

    /// Obtenir la taille du fichier d'état (bytes)
    pub fn state_size(&self) -> u64 {
        if let Ok(metadata) = fs::metadata(&self.db_path) {
            metadata.len()
        } else {
            0
        }
    }
}

impl Default for PersistenceLayer {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_persistence_save_load() {
        let persistence = PersistenceLayer::new();
        let state = SingularityState::new();

        // Test save
        let result = persistence.save_state(&state).await;
        assert!(result.is_ok());

        // Test load
        let loaded = persistence.load_state().await;
        assert!(loaded.is_ok());

        // Cleanup
        persistence.clear_state().await.ok();
    }

    #[tokio::test]
    async fn test_persistence_clear() {
        let persistence = PersistenceLayer::new();
        let state = SingularityState::new();

        persistence.save_state(&state).await.ok();
        assert!(persistence.state_exists());

        persistence.clear_state().await.ok();
        assert!(!persistence.state_exists());
    }
}
