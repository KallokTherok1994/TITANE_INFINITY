// Copyright (C) 2024 Soan Kabirou KPADE
// SPDX-License-Identifier: MIT OR Apache-2.0

//! Modèle de priorités multi-dimensionnelles pour le scheduler cognitif

use serde::{Deserialize, Serialize};

use super::task_queue::{TaskPriority, TaskType};

/// Priorité cognitive multi-dimensionnelle
#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
pub struct CognitivePriority {
    pub base_priority: TaskPriority,
    pub urgency: f32,     // 0.0-1.0
    pub cost: f32,        // 0.0-1.0 (énergétique #20)
    pub criticality: f32, // 0.0-1.0
    pub task_type: TaskType,
}

impl CognitivePriority {
    pub fn new(base_priority: TaskPriority, task_type: TaskType) -> Self {
        Self {
            base_priority,
            urgency: 0.5,
            cost: 0.5,
            criticality: 0.5,
            task_type,
        }
    }

    /// Calcule le score final
    pub fn score(&self) -> PriorityScore {
        let base_score = match self.base_priority {
            TaskPriority::Realtime => 1000.0,
            TaskPriority::High => 100.0,
            TaskPriority::Normal => 10.0,
            TaskPriority::Background => 1.0,
        };

        // Facteurs multiplicateurs
        let urgency_factor = 1.0 + self.urgency;
        let criticality_factor = 1.0 + self.criticality * 0.5;
        let cost_penalty = 1.0 - (self.cost * 0.3); // Coût élevé = pénalité

        // Type de tâche (Kernel & Security > OMEGA > Memory > Agents)
        let type_factor = match self.task_type {
            TaskType::Kernel => 2.0,
            TaskType::Engine => 1.5,
            TaskType::Memory => 1.3,
            TaskType::Multimodal => 1.2,
            TaskType::Agent => 1.0,
            TaskType::AgiCore => 1.1,
            TaskType::Api => 0.9,
            TaskType::Background => 0.5,
        };

        let final_score =
            base_score * urgency_factor * criticality_factor * cost_penalty * type_factor;

        PriorityScore(final_score)
    }
}

/// Score de priorité (plus élevé = plus prioritaire)
#[derive(Debug, Clone, Copy, PartialEq, PartialOrd, Serialize, Deserialize)]
pub struct PriorityScore(pub f32);

impl PriorityScore {
    pub fn value(&self) -> f32 {
        self.0
    }
}

/// Modèle de calcul de priorités
pub struct PriorityModel {
    // Pondérations configurables
    pub urgency_weight: f32,
    pub cost_weight: f32,
    pub criticality_weight: f32,
}

impl Default for PriorityModel {
    fn default() -> Self {
        Self {
            urgency_weight: 1.0,
            cost_weight: 0.3,
            criticality_weight: 0.5,
        }
    }
}

impl PriorityModel {
    /// Calcule la priorité pour une tâche
    pub fn calculate(&self, priority: &CognitivePriority) -> PriorityScore {
        priority.score()
    }

    /// Boost de priorité pour tâches affamées (starvation prevention)
    pub fn apply_starvation_boost(&self, score: PriorityScore, age_seconds: f32) -> PriorityScore {
        // Boost linéaire après 30s
        let boost = if age_seconds > 30.0 {
            (age_seconds - 30.0) * 0.1
        } else {
            0.0
        };

        PriorityScore(score.0 + boost)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_priority_score_realtime() {
        let prio = CognitivePriority::new(TaskPriority::Realtime, TaskType::Kernel);
        let score = prio.score();
        assert!(score.0 > 1000.0); // Realtime + Kernel = très haut
    }

    #[test]
    fn test_priority_score_background() {
        let prio = CognitivePriority::new(TaskPriority::Background, TaskType::Background);
        let score = prio.score();
        assert!(score.0 < 10.0); // Background = très bas
    }

    #[test]
    fn test_urgency_boost() {
        let mut prio = CognitivePriority::new(TaskPriority::Normal, TaskType::Engine);
        prio.urgency = 1.0; // Max urgence

        let score = prio.score();
        assert!(score.0 > 20.0); // Boost d'urgence
    }

    #[test]
    fn test_cost_penalty() {
        let mut prio = CognitivePriority::new(TaskPriority::Normal, TaskType::Engine);
        prio.cost = 1.0; // Coût max

        let score = prio.score();

        let mut prio_low_cost = CognitivePriority::new(TaskPriority::Normal, TaskType::Engine);
        prio_low_cost.cost = 0.0;

        let score_low_cost = prio_low_cost.score();

        assert!(score.0 < score_low_cost.0); // Coût élevé = score réduit
    }

    #[test]
    fn test_starvation_boost() {
        let model = PriorityModel::default();
        let score = PriorityScore(10.0);

        let boosted = model.apply_starvation_boost(score, 60.0); // 60s
        assert!(boosted.0 > score.0); // Boost appliqué
    }

    #[test]
    fn test_task_type_ordering() {
        let kernel_prio = CognitivePriority::new(TaskPriority::Normal, TaskType::Kernel);
        let agent_prio = CognitivePriority::new(TaskPriority::Normal, TaskType::Agent);

        assert!(kernel_prio.score().0 > agent_prio.score().0); // Kernel > Agent
    }
}
