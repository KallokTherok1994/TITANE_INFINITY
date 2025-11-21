// 🗂️ Categories — Classification intelligente des connaissances
// 9 catégories professionnelles avec tracking et niveaux

use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// Catégories de connaissance TITANE∞
#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum Category {
    Identity,        // Compréhension de soi
    Cognition,       // Processus mentaux
    Emotion,         // États émotionnels
    Structure,       // Organisation et hiérarchie
    Organization,    // Planification et gestion
    Models,          // Modèles et patterns
    Memory,          // Stockage et recall
    Projects,        // Initiatives et réalisations
    Methods,         // Approches et techniques
}

impl Category {
    pub fn all() -> Vec<Category> {
        vec![
            Category::Identity,
            Category::Cognition,
            Category::Emotion,
            Category::Structure,
            Category::Organization,
            Category::Models,
            Category::Memory,
            Category::Projects,
            Category::Methods,
        ]
    }

    pub fn icon(&self) -> &str {
        match self {
            Category::Identity => "🎯",
            Category::Cognition => "🧠",
            Category::Emotion => "💫",
            Category::Structure => "🏗️",
            Category::Organization => "📊",
            Category::Models => "🔷",
            Category::Memory => "💾",
            Category::Projects => "🚀",
            Category::Methods => "⚙️",
        }
    }

    pub fn color(&self) -> &str {
        match self {
            Category::Identity => "#e11d48",      // Rubis
            Category::Cognition => "#3b82f6",     // Saphir
            Category::Emotion => "#8b5cf6",       // Améthyste
            Category::Structure => "#10b981",     // Émeraude
            Category::Organization => "#f59e0b",  // Ambre
            Category::Models => "#06b6d4",        // Cyan
            Category::Memory => "#ec4899",        // Rose
            Category::Projects => "#8b5cf6",      // Violet
            Category::Methods => "#6366f1",       // Indigo
        }
    }

    pub fn from_str(s: &str) -> Self {
        match s.to_lowercase().as_str() {
            "identity" => Category::Identity,
            "cognition" => Category::Cognition,
            "emotion" => Category::Emotion,
            "structure" => Category::Structure,
            "organization" => Category::Organization,
            "models" => Category::Models,
            "memory" => Category::Memory,
            "projects" => Category::Projects,
            "methods" => Category::Methods,
            _ => Category::Cognition, // Default
        }
    }
}

/// État d'une catégorie
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CategoryState {
    pub category: String,
    pub icon: String,
    pub color: String,
    pub total_exp: u64,
    pub level: u32,
    pub exp_to_next_level: u64,
    pub exp_current_level: u64,
    pub progress: f32,
    pub knowledge_count: usize,
}

pub struct CategoryManager {
    categories: HashMap<String, CategoryState>,
}

impl CategoryManager {
    pub fn new() -> Self {
        let mut categories = HashMap::new();

        // Initialiser toutes les catégories
        for cat in Category::all() {
            let name = format!("{:?}", cat);
            categories.insert(
                name.clone(),
                CategoryState {
                    category: name,
                    icon: cat.icon().to_string(),
                    color: cat.color().to_string(),
                    total_exp: 0,
                    level: 1,
                    exp_to_next_level: 100,
                    exp_current_level: 0,
                    progress: 0.0,
                    knowledge_count: 0,
                },
            );
        }

        Self { categories }
    }

    /// Ajouter XP à une catégorie
    pub fn add_exp(&mut self, category_name: &str, amount: u64) {
        let cat = Category::from_str(category_name);
        let name = format!("{:?}", cat);

        if let Some(state) = self.categories.get_mut(&name) {
            state.total_exp += amount;
            state.exp_current_level += amount;
            state.knowledge_count += 1;

            // Niveau up
            while state.exp_current_level >= state.exp_to_next_level {
                state.exp_current_level -= state.exp_to_next_level;
                state.level += 1;
                state.exp_to_next_level = Self::calculate_exp_for_level(state.level);
            }

            // Progression
            state.progress = state.exp_current_level as f32 / state.exp_to_next_level as f32;
        }
    }

    /// Calculer XP pour niveau
    fn calculate_exp_for_level(level: u32) -> u64 {
        (100.0 * (level as f32).powf(1.5)) as u64
    }

    /// Obtenir toutes les catégories
    pub fn get_all(&self) -> Vec<CategoryState> {
        let mut list: Vec<_> = self.categories.values().cloned().collect();
        list.sort_by(|a, b| b.total_exp.cmp(&a.total_exp));
        list
    }

    /// Obtenir catégorie par nom
    pub fn get(&self, name: &str) -> Option<CategoryState> {
        let cat = Category::from_str(name);
        let name = format!("{:?}", cat);
        self.categories.get(&name).cloned()
    }
}

impl Default for CategoryManager {
    fn default() -> Self {
        Self::new()
    }
}
