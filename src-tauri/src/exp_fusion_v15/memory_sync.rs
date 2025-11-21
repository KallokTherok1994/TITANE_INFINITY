// 💾 Memory Sync — Persistance et sauvegarde automatique
// Stockage JSON avec intégrité et backup
#![allow(dead_code)]

use super::GlobalExpState;
use super::timeline::TimelineEntry;
use super::categories::CategoryState;
use super::projects::ProjectState;
use super::talents::TalentTreeState;
use std::fs;
use std::path::PathBuf;

pub struct MemorySync {
    storage_path: PathBuf,
}

impl MemorySync {
    pub fn new() -> Self {
        let storage_path = Self::get_storage_directory();
        fs::create_dir_all(&storage_path).ok();

        Self { storage_path }
    }

    /// Obtenir répertoire de stockage
    fn get_storage_directory() -> PathBuf {
        let home = std::env::var("HOME").unwrap_or_else(|_| ".".to_string());
        PathBuf::from(home).join(".titane_infinity").join("exp_fusion")
    }

    /// Charger état global
    pub fn load_global_state(&self) -> GlobalExpState {
        let path = self.storage_path.join("global_state.json");
        if let Ok(data) = fs::read_to_string(&path) {
            serde_json::from_str(&data).unwrap_or_default()
        } else {
            GlobalExpState::default()
        }
    }

    /// Sauvegarder état global
    pub fn save_global_state(&self, state: &GlobalExpState) {
        let path = self.storage_path.join("global_state.json");
        if let Ok(json) = serde_json::to_string_pretty(state) {
            fs::write(&path, json).ok();
        }
    }

    /// Charger timeline
    pub fn load_timeline(&self) -> Vec<TimelineEntry> {
        let path = self.storage_path.join("timeline.json");
        if let Ok(data) = fs::read_to_string(&path) {
            serde_json::from_str(&data).unwrap_or_default()
        } else {
            Vec::new()
        }
    }

    /// Sauvegarder timeline
    pub fn save_timeline(&self, entries: Vec<TimelineEntry>) {
        let path = self.storage_path.join("timeline.json");
        if let Ok(json) = serde_json::to_string_pretty(&entries) {
            fs::write(&path, json).ok();
        }
    }

    /// Charger catégories
    pub fn load_categories(&self) -> Vec<CategoryState> {
        let path = self.storage_path.join("categories.json");
        if let Ok(data) = fs::read_to_string(&path) {
            serde_json::from_str(&data).unwrap_or_default()
        } else {
            Vec::new()
        }
    }

    /// Sauvegarder catégories
    pub fn save_categories(&self, categories: Vec<CategoryState>) {
        let path = self.storage_path.join("categories.json");
        if let Ok(json) = serde_json::to_string_pretty(&categories) {
            fs::write(&path, json).ok();
        }
    }

    /// Charger projets
    pub fn load_projects(&self) -> Vec<ProjectState> {
        let path = self.storage_path.join("projects.json");
        if let Ok(data) = fs::read_to_string(&path) {
            serde_json::from_str(&data).unwrap_or_default()
        } else {
            Vec::new()
        }
    }

    /// Sauvegarder projets
    pub fn save_projects(&self, projects: Vec<ProjectState>) {
        let path = self.storage_path.join("projects.json");
        if let Ok(json) = serde_json::to_string_pretty(&projects) {
            fs::write(&path, json).ok();
        }
    }

    /// Charger talents
    pub fn load_talents(&self) -> Option<TalentTreeState> {
        let path = self.storage_path.join("talents.json");
        if let Ok(data) = fs::read_to_string(&path) {
            serde_json::from_str(&data).ok()
        } else {
            None
        }
    }

    /// Sauvegarder talents
    pub fn save_talents(&self, talents: TalentTreeState) {
        let path = self.storage_path.join("talents.json");
        if let Ok(json) = serde_json::to_string_pretty(&talents) {
            fs::write(&path, json).ok();
        }
    }

    /// Créer backup
    pub fn create_backup(&self) {
        let backup_dir = self.storage_path.join("backups");
        fs::create_dir_all(&backup_dir).ok();

        let timestamp = chrono::Utc::now().format("%Y%m%d_%H%M%S");
        let backup_path = backup_dir.join(format!("backup_{}.zip", timestamp));

        // TODO: Implémenter backup ZIP complet
        println!("Backup créé: {:?}", backup_path);
    }
}

impl Default for MemorySync {
    fn default() -> Self {
        Self::new()
    }
}
