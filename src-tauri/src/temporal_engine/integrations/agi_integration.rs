//! ═══════════════════════════════════════════════════════════════════════════════
//! TEMPORAL ENGINE ↔ AGI SUBSYSTEM INTEGRATION
//! ═══════════════════════════════════════════════════════════════════════════════

use crate::temporal_engine::{TemporalContext, PlanningHorizon};
use serde::{Deserialize, Serialize};

/// Bridge entre Temporal Engine et AGI Subsystem
pub struct TemporalAgiBridge;

impl TemporalAgiBridge {
    /// Obtient les ajustements AGI selon le contexte temporel
    pub fn get_agi_adjustments(context: &TemporalContext) -> AgiTemporalAdjustments {
        let hour = context.now.hour;
        let season = &context.now.season;

        AgiTemporalAdjustments {
            meta_learning_intensity: Self::calculate_meta_learning_intensity(hour),
            goal_tracking_horizon: Self::determine_goal_horizon(context),
            exploration_vs_exploitation: Self::calculate_exploration_ratio(hour),
            heuristic_adaptation_rate: Self::calculate_adaptation_rate(season),
            self_reflection_depth: Self::calculate_reflection_depth(hour),
            strategy_reevaluation_frequency: Self::calculate_reevaluation_frequency(hour),
            long_term_alignment_weight: Self::calculate_alignment_weight(context),
        }
    }

    /// Intensité de meta-learning
    fn calculate_meta_learning_intensity(hour: u8) -> f32 {
        match hour {
            2..=4 => 1.0,     // Night: maximum meta-learning
            10..=11 => 0.6,   // Peak: moderate
            12..=13 => 0.3,   // Midday: low
            _ => 0.5,
        }
    }

    /// Horizon de tracking des objectifs
    fn determine_goal_horizon(context: &TemporalContext) -> PlanningHorizon {
        let hour = context.now.hour;
        
        match hour {
            6..=9 => PlanningHorizon::Today,
            10..=16 => PlanningHorizon::ThisWeek,
            17..=21 => PlanningHorizon::ThisMonth,
            22..=23 | 0..=5 => PlanningHorizon::LongTerm,
            _ => PlanningHorizon::ThisWeek,
        }
    }

    /// Ratio exploration vs exploitation
    fn calculate_exploration_ratio(hour: u8) -> f32 {
        match hour {
            10..=11 => 0.3,   // Peak: exploit (30% explore)
            2..=4 => 0.7,     // Night: explore (70% explore)
            _ => 0.5,         // Balanced
        }
    }

    /// Taux d'adaptation heuristiques (saisonnier)
    fn calculate_adaptation_rate(season: &crate::temporal_engine::time_model::Season) -> f32 {
        use crate::temporal_engine::time_model::Season;
        match season {
            Season::Spring => 0.8,  // High adaptation
            Season::Summer => 0.5,  // Stable
            Season::Autumn => 0.6,  // Moderate
            Season::Winter => 0.3,  // Conservative
        }
    }

    /// Profondeur de réflexion
    fn calculate_reflection_depth(hour: u8) -> usize {
        match hour {
            2..=4 => 5,       // Night: deep
            10..=11 => 3,     // Peak: moderate
            _ => 2,           // Shallow
        }
    }

    /// Fréquence de réévaluation stratégies (heures)
    fn calculate_reevaluation_frequency(hour: u8) -> f32 {
        match hour {
            2..=4 => 1.0,     // Night: every hour
            10..=16 => 6.0,   // Day: every 6 hours
            _ => 3.0,
        }
    }

    /// Poids alignement long-terme
    fn calculate_alignment_weight(context: &TemporalContext) -> f32 {
        let hour = context.now.hour;
        
        match hour {
            2..=4 => 0.9,     // Night: high long-term focus
            10..=16 => 0.4,   // Day: short-term focus
            _ => 0.6,
        }
    }

    /// Suggère la stratégie de tuning des heuristiques
    pub fn suggest_heuristic_tuning(context: &TemporalContext) -> HeuristicTuningStrategy {
        let hour = context.now.hour;
        let season = &context.now.season;

        use crate::temporal_engine::time_model::Season;
        
        let focus = match (season, hour) {
            (Season::Spring, _) => TuningFocus::Exploration,
            (Season::Summer, 10..=16) => TuningFocus::Performance,
            (Season::Autumn, _) => TuningFocus::Consolidation,
            (Season::Winter, _) => TuningFocus::Stability,
            (_, 2..=4) => TuningFocus::Learning,
            (_, _) => TuningFocus::Balanced,
        };

        let adjustments = match focus {
            TuningFocus::Exploration => vec![
                HeuristicAdjustment::IncreaseExploration(0.3),
                HeuristicAdjustment::LowerConfidenceThresholds(0.2),
            ],
            TuningFocus::Performance => vec![
                HeuristicAdjustment::FavorProvenStrategies,
                HeuristicAdjustment::ReduceLatency,
            ],
            TuningFocus::Consolidation => vec![
                HeuristicAdjustment::IntegrateLearnings,
                HeuristicAdjustment::PruneUnusedStrategies,
            ],
            TuningFocus::Stability => vec![
                HeuristicAdjustment::LockCoreHeuristics,
                HeuristicAdjustment::MinimalChanges,
            ],
            TuningFocus::Learning => vec![
                HeuristicAdjustment::DeepReflection,
                HeuristicAdjustment::CrossContextLearning,
            ],
            TuningFocus::Balanced => vec![],
        };

        HeuristicTuningStrategy { focus, adjustments }
    }

    /// Détermine quand faire l'alignement long-terme
    pub fn should_perform_alignment(context: &TemporalContext) -> AlignmentRecommendation {
        let hour = context.now.hour;

        let priority = match hour {
            2..=4 => AlignmentPriority::Critical,
            0..=1 | 5..=6 => AlignmentPriority::High,
            _ => AlignmentPriority::Low,
        };

        let operations = if priority != AlignmentPriority::Low {
            vec![
                AlignmentOperation::VerifyGoalConsistency,
                AlignmentOperation::UpdateLongTermObjectives,
                AlignmentOperation::ReconcileConflicts,
            ]
        } else {
            vec![]
        };

        AlignmentRecommendation {
            should_run: priority != AlignmentPriority::Low,
            priority,
            operations,
        }
    }

    /// Suggère les objectifs selon l'horizon temporel
    pub fn suggest_goal_focus(horizon: &PlanningHorizon) -> Vec<GoalCategory> {
        match horizon {
            PlanningHorizon::Today => vec![
                GoalCategory::ImmediateTasks,
                GoalCategory::UserRequests,
            ],
            PlanningHorizon::ThisWeek => vec![
                GoalCategory::Projects,
                GoalCategory::ShortTermGoals,
            ],
            PlanningHorizon::ThisMonth => vec![
                GoalCategory::StrategicInitiatives,
                GoalCategory::SkillDevelopment,
            ],
            PlanningHorizon::ThisQuarter => vec![
                GoalCategory::SystemImprovement,
                GoalCategory::CapabilityExpansion,
            ],
            PlanningHorizon::ThisYear => vec![
                GoalCategory::LongTermVision,
                GoalCategory::FundamentalResearch,
            ],
            PlanningHorizon::LongTerm => vec![
                GoalCategory::ExistentialAlignment,
                GoalCategory::ValueRefinement,
            ],
        }
    }
}

/// Ajustements temporels pour AGI
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct AgiTemporalAdjustments {
    pub meta_learning_intensity: f32,
    pub goal_tracking_horizon: PlanningHorizon,
    pub exploration_vs_exploitation: f32,
    pub heuristic_adaptation_rate: f32,
    pub self_reflection_depth: usize,
    pub strategy_reevaluation_frequency: f32,
    pub long_term_alignment_weight: f32,
}

/// Stratégie de tuning heuristiques
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct HeuristicTuningStrategy {
    pub focus: TuningFocus,
    pub adjustments: Vec<HeuristicAdjustment>,
}

/// Focus du tuning
#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub enum TuningFocus {
    Exploration,
    Performance,
    Consolidation,
    Stability,
    Learning,
    Balanced,
}

/// Ajustements heuristiques
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub enum HeuristicAdjustment {
    IncreaseExploration(f32),
    LowerConfidenceThresholds(f32),
    FavorProvenStrategies,
    ReduceLatency,
    IntegrateLearnings,
    PruneUnusedStrategies,
    LockCoreHeuristics,
    MinimalChanges,
    DeepReflection,
    CrossContextLearning,
}

/// Priorité alignement
#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub enum AlignmentPriority {
    Low,
    High,
    Critical,
}

/// Opérations d'alignement
#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub enum AlignmentOperation {
    VerifyGoalConsistency,
    UpdateLongTermObjectives,
    ReconcileConflicts,
}

/// Recommandation d'alignement
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct AlignmentRecommendation {
    pub should_run: bool,
    pub priority: AlignmentPriority,
    pub operations: Vec<AlignmentOperation>,
}

/// Catégories d'objectifs
#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub enum GoalCategory {
    ImmediateTasks,
    UserRequests,
    Projects,
    ShortTermGoals,
    StrategicInitiatives,
    SkillDevelopment,
    SystemImprovement,
    CapabilityExpansion,
    LongTermVision,
    FundamentalResearch,
    ExistentialAlignment,
    ValueRefinement,
}
