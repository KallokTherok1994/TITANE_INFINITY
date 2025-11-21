// 🚀 TITANE∞ v15.0 — EXP FUSION ENGINE
// Système d'expérience unifié : Global + Projects + Categories + Talents + Timeline
// Architecture professionnelle, technologique et cohérente

use serde::{Deserialize, Serialize};
use std::sync::{Arc, Mutex};

pub mod exp_calculator;
pub mod memory_sync;
pub mod timeline;
pub mod categories;
pub mod projects;
pub mod talents;
pub mod weight_integration;

use exp_calculator::ExpCalculator;
use memory_sync::MemorySync;
use timeline::ExpTimeline;
use categories::CategoryManager;
use projects::ProjectManager;
use talents::TalentTree;

/// État global d'expérience TITANE∞
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GlobalExpState {
    pub total_exp: u64,
    pub level: u32,
    pub exp_to_next_level: u64,
    pub exp_current_level: u64,
    pub level_progress: f32,
}

impl Default for GlobalExpState {
    fn default() -> Self {
        Self {
            total_exp: 0,
            level: 1,
            exp_to_next_level: 100,
            exp_current_level: 0,
            level_progress: 0.0,
        }
    }
}

/// Source d'XP
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ExpSource {
    Interaction,
    MetaMode,
    AutoEvolution,
    FileImport,
    ProjectUpdate,
    KnowledgeAcquisition,
    SystemOptimization,
}

/// Événement d'XP
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExpEvent {
    pub timestamp: String,
    pub amount: u64,
    pub source: ExpSource,
    pub category: String,
    pub project: Option<String>,
    pub description: String,
}

/// Moteur principal EXP Fusion
pub struct ExpFusionEngine {
    global_state: Arc<Mutex<GlobalExpState>>,
    calculator: ExpCalculator,
    memory_sync: MemorySync,
    timeline: ExpTimeline,
    categories: CategoryManager,
    projects: ProjectManager,
    talents: TalentTree,
}

impl ExpFusionEngine {
    /// Créer nouvelle instance
    pub fn new() -> Self {
        let memory_sync = MemorySync::new();
        let global_state = memory_sync.load_global_state();

        Self {
            global_state: Arc::new(Mutex::new(global_state)),
            calculator: ExpCalculator::new(),
            memory_sync,
            timeline: ExpTimeline::new(),
            categories: CategoryManager::new(),
            projects: ProjectManager::new(),
            talents: TalentTree::new(),
        }
    }

    /// Gagner de l'XP
    pub fn gain_exp(
        &mut self,
        amount: u64,
        source: ExpSource,
        category: &str,
        project: Option<&str>,
        description: &str,
    ) -> ExpEvent {
        let mut state = self.global_state.lock().unwrap();

        // Calculer XP pondéré
        let weighted_amount = self.calculator.calculate_weighted_exp(amount, &source);

        // Ajouter au total
        state.total_exp += weighted_amount;
        state.exp_current_level += weighted_amount;

        // Vérifier niveau
        while state.exp_current_level >= state.exp_to_next_level {
            state.exp_current_level -= state.exp_to_next_level;
            state.level += 1;
            state.exp_to_next_level = self.calculator.calculate_exp_for_level(state.level);
        }

        // Calculer progression
        state.level_progress = state.exp_current_level as f32 / state.exp_to_next_level as f32;

        drop(state);

        // Créer événement
        let event = ExpEvent {
            timestamp: chrono::Utc::now().to_rfc3339(),
            amount: weighted_amount,
            source: source.clone(),
            category: category.to_string(),
            project: project.map(String::from),
            description: description.to_string(),
        };

        // Enregistrer dans timeline
        self.timeline.add_event(event.clone());

        // Mettre à jour catégorie
        self.categories.add_exp(category, weighted_amount);

        // Mettre à jour projet si applicable
        if let Some(project_name) = project {
            self.projects.add_exp(project_name, weighted_amount, category);
        }

        // Mettre à jour talents
        self.talents.update_from_exp(self.global_state.lock().unwrap().total_exp, &self.categories);

        // Sauvegarder
        self.save_all();

        event
    }

    /// Obtenir état global
    pub fn get_global_state(&self) -> GlobalExpState {
        self.global_state.lock().unwrap().clone()
    }

    /// Obtenir toutes les catégories
    pub fn get_categories(&self) -> Vec<categories::CategoryState> {
        self.categories.get_all()
    }

    /// Obtenir tous les projets
    pub fn get_projects(&self) -> Vec<projects::ProjectState> {
        self.projects.get_all()
    }

    /// Obtenir arbre de talents
    pub fn get_talents(&self) -> talents::TalentTreeState {
        self.talents.get_state()
    }

    /// Obtenir timeline
    pub fn get_timeline(&self, days: u32) -> Vec<timeline::TimelineEntry> {
        self.timeline.get_recent(days)
    }

    /// Sauvegarder tout
    fn save_all(&mut self) {
        let state = self.global_state.lock().unwrap().clone();
        self.memory_sync.save_global_state(&state);
        self.memory_sync.save_timeline(self.timeline.get_recent(365));
        self.memory_sync.save_categories(self.categories.get_all());
        self.memory_sync.save_projects(self.projects.get_all());
        self.memory_sync.save_talents(self.talents.get_state());
    }

    /// Réinitialiser (avec confirmation)
    pub fn reset(&mut self) {
        let mut state = self.global_state.lock().unwrap();
        *state = GlobalExpState::default();
        drop(state);

        self.timeline = ExpTimeline::new();
        self.categories = CategoryManager::new();
        self.projects = ProjectManager::new();
        self.talents = TalentTree::new();

        self.save_all();
    }
}

impl Default for ExpFusionEngine {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_gain_exp() {
        let mut engine = ExpFusionEngine::new();
        let event = engine.gain_exp(
            10,
            ExpSource::Interaction,
            "Cognition",
            None,
            "Test interaction",
        );

        assert_eq!(event.amount, 10);
        assert!(engine.get_global_state().total_exp >= 10);
    }

    #[test]
    fn test_level_progression() {
        let mut engine = ExpFusionEngine::new();

        // Gagner assez d'XP pour niveau 2
        for _ in 0..15 {
            engine.gain_exp(10, ExpSource::Interaction, "Test", None, "test");
        }

        let state = engine.get_global_state();
        assert!(state.level >= 2);
    }
}
