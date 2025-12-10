//! ═══════════════════════════════════════════════════════════════════════════════
//! TITANE∞ v20Ω — LONG TERM ALIGNMENT
//! Super Prompt #18 — Alignement et objectifs long terme
//! ═══════════════════════════════════════════════════════════════════════════════

use super::planner::PlanningHorizon;
use super::time_model::TemporalContext;
use serde::{Deserialize, Serialize};
use tokio::sync::RwLock;

/// Score d'alignement
#[derive(Clone, Debug, Default, Serialize, Deserialize)]
pub struct AlignmentScore {
    pub score: f32,
    pub breakdown: AlignmentBreakdown,
    pub calculated_at: u64,
    pub trend: AlignmentTrend,
}

/// Décomposition du score d'alignement
#[derive(Clone, Debug, Default, Serialize, Deserialize)]
pub struct AlignmentBreakdown {
    pub goal_progress: f32,
    pub milestone_completion: f32,
    pub consistency: f32,
    pub direction_alignment: f32,
    pub value_alignment: f32,
}

/// Tendance d'alignement
#[derive(Clone, Copy, Debug, Default, PartialEq, Eq, Serialize, Deserialize)]
pub enum AlignmentTrend {
    StronglyImproving,
    Improving,
    #[default]
    Stable,
    Declining,
    StronglyDeclining,
}

/// Objectif long terme
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Goal {
    pub id: String,
    pub title: String,
    pub description: String,
    pub category: GoalCategory,
    pub horizon: PlanningHorizon,
    pub priority: u8,
    pub created_at: u64,
    pub target_date: Option<u64>,
    pub progress: f32,
    pub status: GoalStatus,
    pub milestones: Vec<Milestone>,
    pub values_aligned: Vec<String>,
    pub success_criteria: Vec<String>,
    pub reflection_notes: Vec<String>,
}

impl Goal {
    pub fn new(id: &str, title: &str, category: GoalCategory) -> Self {
        Self {
            id: id.to_string(),
            title: title.to_string(),
            description: String::new(),
            category,
            horizon: PlanningHorizon::ThisYear,
            priority: 5,
            created_at: Self::now(),
            target_date: None,
            progress: 0.0,
            status: GoalStatus::Active,
            milestones: Vec::new(),
            values_aligned: Vec::new(),
            success_criteria: Vec::new(),
            reflection_notes: Vec::new(),
        }
    }

    /// Calcule la progression basée sur les milestones
    pub fn calculate_progress(&mut self) {
        if self.milestones.is_empty() {
            return;
        }

        let completed = self.milestones.iter().filter(|m| m.completed).count();

        self.progress = completed as f32 / self.milestones.len() as f32;
    }

    fn now() -> u64 {
        std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap_or_default()
            .as_millis() as u64
    }
}

/// Catégorie d'objectif
#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum GoalCategory {
    Personal,
    Professional,
    Health,
    Learning,
    Financial,
    Relationships,
    Creative,
    Contribution,
}

/// Statut d'objectif
#[derive(Clone, Copy, Debug, Default, PartialEq, Eq, Serialize, Deserialize)]
pub enum GoalStatus {
    #[default]
    Active,
    Paused,
    Completed,
    Abandoned,
    Reviewing,
}

/// Milestone
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Milestone {
    pub id: String,
    pub goal_id: String,
    pub title: String,
    pub description: String,
    pub due_date: Option<u64>,
    pub completed: bool,
    pub completed_at: Option<u64>,
    pub evidence: Vec<String>,
    pub order: u8,
}

impl Milestone {
    pub fn new(id: &str, goal_id: &str, title: &str, order: u8) -> Self {
        Self {
            id: id.to_string(),
            goal_id: goal_id.to_string(),
            title: title.to_string(),
            description: String::new(),
            due_date: None,
            completed: false,
            completed_at: None,
            evidence: Vec::new(),
            order,
        }
    }
}

/// Aligneur long terme
pub struct LongTermAligner {
    goals: RwLock<Vec<Goal>>,
    alignment_history: RwLock<Vec<AlignmentScore>>,
    core_values: RwLock<Vec<CoreValue>>,
}

impl LongTermAligner {
    pub fn new() -> Self {
        Self {
            goals: RwLock::new(Vec::new()),
            alignment_history: RwLock::new(Vec::new()),
            core_values: RwLock::new(Self::default_values()),
        }
    }

    fn default_values() -> Vec<CoreValue> {
        vec![
            CoreValue {
                id: "growth".to_string(),
                name: "Continuous Growth".to_string(),
                description: "Always learning and improving".to_string(),
                weight: 0.9,
            },
            CoreValue {
                id: "authenticity".to_string(),
                name: "Authenticity".to_string(),
                description: "Being true to oneself".to_string(),
                weight: 0.85,
            },
            CoreValue {
                id: "impact".to_string(),
                name: "Positive Impact".to_string(),
                description: "Making a difference".to_string(),
                weight: 0.8,
            },
            CoreValue {
                id: "balance".to_string(),
                name: "Life Balance".to_string(),
                description: "Harmony between life domains".to_string(),
                weight: 0.75,
            },
            CoreValue {
                id: "excellence".to_string(),
                name: "Excellence".to_string(),
                description: "Striving for quality".to_string(),
                weight: 0.7,
            },
        ]
    }

    /// Ajoute un objectif
    pub async fn add_goal(&self, goal: Goal) {
        let mut goals = self.goals.write().await;
        goals.push(goal);
    }

    /// Récupère un objectif
    pub async fn get_goal(&self, id: &str) -> Option<Goal> {
        let goals = self.goals.read().await;
        goals.iter().find(|g| g.id == id).cloned()
    }

    /// Met à jour la progression d'un objectif
    pub async fn update_goal_progress(&self, id: &str, progress: f32) -> bool {
        let mut goals = self.goals.write().await;
        if let Some(goal) = goals.iter_mut().find(|g| g.id == id) {
            goal.progress = progress.clamp(0.0, 1.0);

            if goal.progress >= 1.0 {
                goal.status = GoalStatus::Completed;
            }

            true
        } else {
            false
        }
    }

    /// Complete un milestone
    pub async fn complete_milestone(&self, goal_id: &str, milestone_id: &str) -> bool {
        let mut goals = self.goals.write().await;

        if let Some(goal) = goals.iter_mut().find(|g| g.id == goal_id) {
            if let Some(milestone) = goal.milestones.iter_mut().find(|m| m.id == milestone_id) {
                milestone.completed = true;
                milestone.completed_at = Some(Self::now());

                // Recalculer la progression
                goal.calculate_progress();
                return true;
            }
        }

        false
    }

    /// Vérifie l'alignement global
    pub async fn check_alignment(&self, context: &TemporalContext) -> AlignmentScore {
        let goals = self.goals.read().await;
        let values = self.core_values.read().await;

        // Calculer les différentes composantes
        let goal_progress = self.calculate_goal_progress(&goals);
        let milestone_completion = self.calculate_milestone_completion(&goals);
        let consistency = self.calculate_consistency(&goals, context);
        let direction_alignment = self.calculate_direction_alignment(&goals);
        let value_alignment = self.calculate_value_alignment(&goals, &values);

        let overall = (goal_progress * 0.3)
            + (milestone_completion * 0.2)
            + (consistency * 0.2)
            + (direction_alignment * 0.15)
            + (value_alignment * 0.15);

        let score = AlignmentScore {
            score: overall,
            breakdown: AlignmentBreakdown {
                goal_progress,
                milestone_completion,
                consistency,
                direction_alignment,
                value_alignment,
            },
            calculated_at: context.now.timestamp_ms,
            trend: self.calculate_trend(overall).await,
        };

        // Sauvegarder dans l'historique
        let mut history = self.alignment_history.write().await;
        history.push(score.clone());

        // Limiter l'historique
        if history.len() > 100 {
            history.remove(0);
        }

        score
    }

    fn calculate_goal_progress(&self, goals: &[Goal]) -> f32 {
        let active_goals: Vec<_> = goals
            .iter()
            .filter(|g| g.status == GoalStatus::Active)
            .collect();

        if active_goals.is_empty() {
            return 0.5; // Neutral if no goals
        }

        let total_progress: f32 = active_goals
            .iter()
            .map(|g| g.progress * (g.priority as f32 / 10.0))
            .sum();

        let total_weight: f32 = active_goals.iter().map(|g| g.priority as f32 / 10.0).sum();

        (total_progress / total_weight).clamp(0.0, 1.0)
    }

    fn calculate_milestone_completion(&self, goals: &[Goal]) -> f32 {
        let all_milestones: Vec<_> = goals
            .iter()
            .filter(|g| g.status == GoalStatus::Active)
            .flat_map(|g| &g.milestones)
            .collect();

        if all_milestones.is_empty() {
            return 0.5;
        }

        let completed = all_milestones.iter().filter(|m| m.completed).count();
        completed as f32 / all_milestones.len() as f32
    }

    fn calculate_consistency(&self, goals: &[Goal], _context: &TemporalContext) -> f32 {
        // Vérifier la distribution des objectifs par catégorie
        let categories: std::collections::HashSet<_> = goals.iter().map(|g| g.category).collect();

        // Plus de diversité = meilleure consistance
        let diversity = categories.len() as f32 / 8.0; // 8 catégories possibles

        // Vérifier l'équilibre des priorités
        let priority_sum: u32 = goals.iter().map(|g| g.priority as u32).sum();
        let avg_priority = if goals.is_empty() {
            5.0
        } else {
            priority_sum as f32 / goals.len() as f32
        };
        let priority_balance = 1.0 - (avg_priority - 5.0).abs() / 5.0;

        (diversity * 0.5 + priority_balance * 0.5).clamp(0.0, 1.0)
    }

    fn calculate_direction_alignment(&self, goals: &[Goal]) -> f32 {
        // Vérifier que les objectifs ont une direction claire (target_date, milestones)
        let goals_with_direction: Vec<_> = goals
            .iter()
            .filter(|g| g.status == GoalStatus::Active)
            .filter(|g| g.target_date.is_some() || !g.milestones.is_empty())
            .collect();

        if goals.is_empty() {
            return 0.5;
        }

        goals_with_direction.len() as f32 / goals.len() as f32
    }

    fn calculate_value_alignment(&self, goals: &[Goal], values: &[CoreValue]) -> f32 {
        if goals.is_empty() || values.is_empty() {
            return 0.5;
        }

        // Vérifier combien d'objectifs sont alignés avec les valeurs
        let mut alignment_score = 0.0;
        let mut total_weight = 0.0;

        for goal in goals.iter().filter(|g| g.status == GoalStatus::Active) {
            for value in values {
                if goal.values_aligned.contains(&value.id) {
                    alignment_score += value.weight;
                }
                total_weight += value.weight;
            }
        }

        if total_weight > 0.0 {
            (alignment_score / total_weight).clamp(0.0, 1.0)
        } else {
            0.5
        }
    }

    async fn calculate_trend(&self, current_score: f32) -> AlignmentTrend {
        let history = self.alignment_history.read().await;

        if history.len() < 3 {
            return AlignmentTrend::Stable;
        }

        // Calculer la moyenne des 5 derniers scores
        let recent: Vec<f32> = history.iter().rev().take(5).map(|s| s.score).collect();

        let avg_recent: f32 = recent.iter().sum::<f32>() / recent.len() as f32;
        let diff = current_score - avg_recent;

        match diff {
            d if d > 0.1 => AlignmentTrend::StronglyImproving,
            d if d > 0.03 => AlignmentTrend::Improving,
            d if d < -0.1 => AlignmentTrend::StronglyDeclining,
            d if d < -0.03 => AlignmentTrend::Declining,
            _ => AlignmentTrend::Stable,
        }
    }

    /// Récupère tous les objectifs actifs
    pub async fn active_goals(&self) -> Vec<Goal> {
        let goals = self.goals.read().await;
        goals
            .iter()
            .filter(|g| g.status == GoalStatus::Active)
            .cloned()
            .collect()
    }

    /// Récupère les objectifs par horizon
    pub async fn goals_by_horizon(&self, horizon: PlanningHorizon) -> Vec<Goal> {
        let goals = self.goals.read().await;
        goals
            .iter()
            .filter(|g| g.horizon == horizon && g.status == GoalStatus::Active)
            .cloned()
            .collect()
    }

    /// Récupère l'historique d'alignement
    pub async fn alignment_history(&self) -> Vec<AlignmentScore> {
        self.alignment_history.read().await.clone()
    }

    fn now() -> u64 {
        std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap_or_default()
            .as_millis() as u64
    }
}

impl Default for LongTermAligner {
    fn default() -> Self {
        Self::new()
    }
}

/// Valeur fondamentale
#[derive(Clone, Debug, Serialize, Deserialize)]
struct CoreValue {
    id: String,
    name: String,
    description: String,
    weight: f32,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_goal_creation() {
        let goal = Goal::new("test_goal", "Test Goal", GoalCategory::Personal);
        assert_eq!(goal.status, GoalStatus::Active);
        assert_eq!(goal.progress, 0.0);
    }

    #[tokio::test]
    async fn test_aligner() {
        let aligner = LongTermAligner::new();
        let goals = aligner.active_goals().await;
        assert!(goals.is_empty());
    }
}
