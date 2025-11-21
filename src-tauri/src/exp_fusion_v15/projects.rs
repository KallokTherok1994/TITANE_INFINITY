// 🚀 Projects — Suivi par projet avec analyse détaillée
// Chaque projet a son propre XP, catégories, et progression
#![allow(dead_code)]

use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// État d'un projet
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProjectState {
    pub name: String,
    pub icon: String,
    pub total_exp: u64,
    pub level: u32,
    pub exp_to_next_level: u64,
    pub exp_current_level: u64,
    pub progress: f32,
    pub categories: HashMap<String, u64>, // XP par catégorie dans ce projet
    pub knowledge_count: usize,
    pub created_at: String,
    pub last_updated: String,
}

pub struct ProjectManager {
    projects: HashMap<String, ProjectState>,
}

impl ProjectManager {
    pub fn new() -> Self {
        Self {
            projects: HashMap::new(),
        }
    }

    /// Ajouter XP à un projet
    pub fn add_exp(&mut self, project_name: &str, amount: u64, category: &str) {
        let project = self.projects.entry(project_name.to_string()).or_insert_with(|| {
            ProjectState {
                name: project_name.to_string(),
                icon: Self::auto_select_icon(project_name),
                total_exp: 0,
                level: 1,
                exp_to_next_level: 100,
                exp_current_level: 0,
                progress: 0.0,
                categories: HashMap::new(),
                knowledge_count: 0,
                created_at: chrono::Utc::now().to_rfc3339(),
                last_updated: chrono::Utc::now().to_rfc3339(),
            }
        });

        // Ajouter XP global
        project.total_exp += amount;
        project.exp_current_level += amount;
        project.knowledge_count += 1;
        project.last_updated = chrono::Utc::now().to_rfc3339();

        // Ajouter à la catégorie
        *project.categories.entry(category.to_string()).or_insert(0) += amount;

        // Niveau up
        while project.exp_current_level >= project.exp_to_next_level {
            project.exp_current_level -= project.exp_to_next_level;
            project.level += 1;
            project.exp_to_next_level = Self::calculate_exp_for_level(project.level);
        }

        // Progression
        project.progress = project.exp_current_level as f32 / project.exp_to_next_level as f32;
    }

    /// Calculer XP pour niveau
    fn calculate_exp_for_level(level: u32) -> u64 {
        (100.0 * (level as f32).powf(1.5)) as u64
    }

    /// Auto-sélection icône
    fn auto_select_icon(name: &str) -> String {
        let lower = name.to_lowercase();
        
        if lower.contains("frontend") || lower.contains("ui") {
            "🎨"
        } else if lower.contains("backend") || lower.contains("api") {
            "⚙️"
        } else if lower.contains("ai") || lower.contains("intelligence") {
            "🧠"
        } else if lower.contains("data") || lower.contains("base") {
            "💾"
        } else if lower.contains("security") || lower.contains("auth") {
            "🔐"
        } else if lower.contains("doc") || lower.contains("wiki") {
            "📚"
        } else if lower.contains("test") || lower.contains("quality") {
            "✅"
        } else if lower.contains("deploy") || lower.contains("devops") {
            "🚀"
        } else {
            "📦"
        }.to_string()
    }

    /// Obtenir tous les projets
    pub fn get_all(&self) -> Vec<ProjectState> {
        let mut list: Vec<_> = self.projects.values().cloned().collect();
        list.sort_by(|a, b| b.total_exp.cmp(&a.total_exp));
        list
    }

    /// Obtenir projet par nom
    pub fn get(&self, name: &str) -> Option<ProjectState> {
        self.projects.get(name).cloned()
    }

    /// Obtenir projets récents (N derniers)
    pub fn get_recent(&self, limit: usize) -> Vec<ProjectState> {
        let mut list = self.get_all();
        list.sort_by(|a, b| b.last_updated.cmp(&a.last_updated));
        list.into_iter().take(limit).collect()
    }

    /// Statistiques globales
    pub fn get_stats(&self) -> ProjectStats {
        ProjectStats {
            total_projects: self.projects.len(),
            total_exp: self.projects.values().map(|p| p.total_exp).sum(),
            avg_level: if self.projects.is_empty() {
                0.0
            } else {
                self.projects.values().map(|p| p.level as f32).sum::<f32>()
                    / self.projects.len() as f32
            },
            most_active: self
                .projects
                .values()
                .max_by_key(|p| p.knowledge_count)
                .map(|p| p.name.clone()),
        }
    }
}

impl Default for ProjectManager {
    fn default() -> Self {
        Self::new()
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProjectStats {
    pub total_projects: usize,
    pub total_exp: u64,
    pub avg_level: f32,
    pub most_active: Option<String>,
}
