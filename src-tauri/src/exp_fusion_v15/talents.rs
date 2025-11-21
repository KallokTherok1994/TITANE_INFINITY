// 🌳 Talent Tree — Arbre de talents professionnel à 6 branches
// Déblocage automatique basé sur l'usage et l'XP, influence Auto-Evolution

use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use super::categories::CategoryManager;

/// Branche de talents
#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum TalentBranch {
    Clarity,        // Clarté Cognitive
    Structure,      // Structure & Organisation
    Analysis,       // Analyse & Cohérence
    Creation,       // Création & Expression
    Emotion,        // Perception Émotionnelle
    Adaptation,     // Adaptation & Auto-Évolution
}

impl TalentBranch {
    pub fn all() -> Vec<TalentBranch> {
        vec![
            TalentBranch::Clarity,
            TalentBranch::Structure,
            TalentBranch::Analysis,
            TalentBranch::Creation,
            TalentBranch::Emotion,
            TalentBranch::Adaptation,
        ]
    }

    pub fn icon(&self) -> &str {
        match self {
            TalentBranch::Clarity => "💎",
            TalentBranch::Structure => "🏗️",
            TalentBranch::Analysis => "🔍",
            TalentBranch::Creation => "✨",
            TalentBranch::Emotion => "💫",
            TalentBranch::Adaptation => "🔄",
        }
    }

    pub fn color(&self) -> &str {
        match self {
            TalentBranch::Clarity => "#3b82f6",      // Saphir
            TalentBranch::Structure => "#10b981",    // Émeraude
            TalentBranch::Analysis => "#8b5cf6",     // Améthyste
            TalentBranch::Creation => "#f59e0b",     // Ambre
            TalentBranch::Emotion => "#ec4899",      // Rose
            TalentBranch::Adaptation => "#06b6d4",   // Cyan
        }
    }

    pub fn talents(&self) -> Vec<Talent> {
        match self {
            TalentBranch::Clarity => vec![
                Talent::new(1, "Synthèse Efficace", "Réduction du bruit cognitif de 15%", 200),
                Talent::new(2, "Clarté Avancée", "Précision analytique +20%", 500),
                Talent::new(3, "Vision Globale", "Compréhension holistique +25%", 1000),
                Talent::new(4, "Maître de Clarté", "Clarté maximale en toute circonstance", 2000),
            ],
            TalentBranch::Structure => vec![
                Talent::new(1, "Organisation de Base", "Hiérarchie +15%", 200),
                Talent::new(2, "Structure Dynamique", "Adaptation structurelle +20%", 500),
                Talent::new(3, "Architecture Avancée", "Structuration complexe +25%", 1000),
                Talent::new(4, "Architecte Maître", "Structure optimale automatique", 2000),
            ],
            TalentBranch::Analysis => vec![
                Talent::new(1, "Détection de Patterns", "Reconnaissance patterns +15%", 200),
                Talent::new(2, "Analyse Cohérente", "Détection incohérences +20%", 500),
                Talent::new(3, "Logique Profonde", "Raisonnement complexe +25%", 1000),
                Talent::new(4, "Analyste Ultime", "Analyse parfaite multi-niveaux", 2000),
            ],
            TalentBranch::Creation => vec![
                Talent::new(1, "Expression Claire", "Formulation professionnelle +15%", 200),
                Talent::new(2, "Création Conceptuelle", "Innovation conceptuelle +20%", 500),
                Talent::new(3, "Narration Avancée", "Storytelling technique +25%", 1000),
                Talent::new(4, "Créateur Maître", "Expression optimale automatique", 2000),
            ],
            TalentBranch::Emotion => vec![
                Talent::new(1, "Lecture Émotionnelle", "Détection états +15%", 200),
                Talent::new(2, "Calibration Fine", "Ajustement ton +20%", 500),
                Talent::new(3, "Empathie Technique", "Résonance émotionnelle +25%", 1000),
                Talent::new(4, "Maître Émotionnel", "Calibration émotionnelle parfaite", 2000),
            ],
            TalentBranch::Adaptation => vec![
                Talent::new(1, "Ajustement Rapide", "Vitesse adaptation +15%", 200),
                Talent::new(2, "Évolution Continue", "Auto-amélioration +20%", 500),
                Talent::new(3, "Adaptation Profonde", "Transformation structurelle +25%", 1000),
                Talent::new(4, "Auto-Évolution Ultime", "Évolution autonome parfaite", 2000),
            ],
        }
    }
}

/// Talent individuel
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Talent {
    pub tier: u32,
    pub name: String,
    pub description: String,
    pub unlock_exp: u64,
    pub unlocked: bool,
    pub effects: Vec<TalentEffect>,
}

impl Talent {
    fn new(tier: u32, name: &str, description: &str, unlock_exp: u64) -> Self {
        Self {
            tier,
            name: name.to_string(),
            description: description.to_string(),
            unlock_exp,
            unlocked: false,
            effects: Self::generate_effects(name),
        }
    }

    fn generate_effects(name: &str) -> Vec<TalentEffect> {
        // Effets sur Auto-Evolution basés sur le nom
        let mut effects = Vec::new();

        if name.contains("Clarté") || name.contains("Synthèse") {
            effects.push(TalentEffect::ClarityBoost(0.15));
        }
        if name.contains("Structure") || name.contains("Organisation") {
            effects.push(TalentEffect::StructureBonus(0.15));
        }
        if name.contains("Analyse") || name.contains("Logique") {
            effects.push(TalentEffect::AnalysisDepth(0.20));
        }
        if name.contains("Création") || name.contains("Expression") {
            effects.push(TalentEffect::CreativityBoost(0.15));
        }
        if name.contains("Émotionnel") || name.contains("Empathie") {
            effects.push(TalentEffect::EmotionalSensitivity(0.15));
        }
        if name.contains("Adaptation") || name.contains("Évolution") {
            effects.push(TalentEffect::AdaptationSpeed(0.20));
        }

        effects
    }
}

/// Effet d'un talent sur le système
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum TalentEffect {
    ClarityBoost(f32),           // +15% clarté
    StructureBonus(f32),         // +15% structure
    AnalysisDepth(f32),          // +20% profondeur analyse
    CreativityBoost(f32),        // +15% créativité
    EmotionalSensitivity(f32),   // +15% sensibilité émotionnelle
    AdaptationSpeed(f32),        // +20% vitesse adaptation
}

/// État complet de l'arbre
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TalentTreeState {
    pub branches: HashMap<String, BranchState>,
    pub total_unlocked: usize,
    pub total_talents: usize,
    pub global_effects: Vec<TalentEffect>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BranchState {
    pub branch: String,
    pub icon: String,
    pub color: String,
    pub talents: Vec<Talent>,
    pub unlocked_count: usize,
}

pub struct TalentTree {
    branches: HashMap<String, Vec<Talent>>,
}

impl TalentTree {
    pub fn new() -> Self {
        let mut branches = HashMap::new();

        // Initialiser toutes les branches
        for branch in TalentBranch::all() {
            let name = format!("{:?}", branch);
            branches.insert(name, branch.talents());
        }

        Self { branches }
    }

    /// Mettre à jour depuis XP et catégories
    pub fn update_from_exp(&mut self, total_exp: u64, categories: &CategoryManager) {
        // Collecter les talents à débloquer sans borrow simultané
        let mut to_unlock: Vec<(String, usize)> = Vec::new();

        for (branch_name, talents) in &self.branches {
            for (idx, talent) in talents.iter().enumerate() {
                if !talent.unlocked && total_exp >= talent.unlock_exp
                    && self.should_unlock(branch_name, talent, categories) {
                        to_unlock.push((branch_name.clone(), idx));
                    }
            }
        }

        // Appliquer les déblocages
        for (branch_name, idx) in to_unlock {
            if let Some(talents) = self.branches.get_mut(&branch_name) {
                if let Some(talent) = talents.get_mut(idx) {
                    talent.unlocked = true;
                }
            }
        }
    }

    /// Vérifier si talent doit être débloqué
    fn should_unlock(&self, branch_name: &str, talent: &Talent, categories: &CategoryManager) -> bool {
        // Logique: catégorie pertinente doit avoir au moins 50% de l'XP requis
        let required_category_exp = talent.unlock_exp / 2;

        let category_name = match branch_name {
            "Clarity" => "Cognition",
            "Structure" => "Structure",
            "Analysis" => "Models",
            "Creation" => "Projects",
            "Emotion" => "Emotion",
            "Adaptation" => "Methods",
            _ => "Cognition",
        };

        if let Some(cat_state) = categories.get(category_name) {
            cat_state.total_exp >= required_category_exp
        } else {
            false
        }
    }

    /// Obtenir état complet
    pub fn get_state(&self) -> TalentTreeState {
        let mut branch_states = HashMap::new();
        let mut total_unlocked = 0;
        let mut total_talents = 0;
        let mut global_effects = Vec::new();

        let all_branches = TalentBranch::all();

        for (name, talents) in &self.branches {
            let branch = all_branches
                .iter()
                .find(|b| format!("{:?}", b) == *name)
                .unwrap();

            let unlocked_count = talents.iter().filter(|t| t.unlocked).count();
            total_unlocked += unlocked_count;
            total_talents += talents.len();

            // Collecter effets globaux
            for talent in talents {
                if talent.unlocked {
                    global_effects.extend(talent.effects.clone());
                }
            }

            branch_states.insert(
                name.clone(),
                BranchState {
                    branch: name.clone(),
                    icon: branch.icon().to_string(),
                    color: branch.color().to_string(),
                    talents: talents.clone(),
                    unlocked_count,
                },
            );
        }

        TalentTreeState {
            branches: branch_states,
            total_unlocked,
            total_talents,
            global_effects,
        }
    }
}

impl Default for TalentTree {
    fn default() -> Self {
        Self::new()
    }
}
