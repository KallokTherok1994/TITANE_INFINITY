// ═══════════════════════════════════════════════════════════════════════════
//   TITANE∞ vΩ∞ — OPERATIONAL TWIN
//   Sous-moteur opérationnel - workflow, méthodes, stratégie Kevin
// ═══════════════════════════════════════════════════════════════════════════

#![allow(dead_code)]

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// Twin opérationnel - assimile le workflow Kevin
pub struct OperationalTwin {
    /// Workflows observés
    workflows: Vec<ObservedWorkflow>,
    /// Méthodes préférées
    preferred_methods: HashMap<String, Method>,
    /// Stratégies appliquées
    strategies: Vec<AppliedStrategy>,
    /// Profil opérationnel
    operational_profile: OperationalProfile,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ObservedWorkflow {
    pub name: String,
    pub steps: Vec<WorkflowStep>,
    pub domain: String,
    pub effectiveness: f32,
    pub observations_count: u32,
    pub last_observed: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WorkflowStep {
    pub action: String,
    pub typical_duration: Option<u32>, // secondes
    pub requires_focus: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Method {
    pub name: String,
    pub description: String,
    pub contexts: Vec<String>,
    pub success_rate: f32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppliedStrategy {
    pub strategy_type: StrategyType,
    pub context: String,
    pub outcome: StrategyOutcome,
    pub timestamp: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum StrategyType {
    /// Minimalisme stratégique
    StrategicMinimalism,
    /// Focus sur l'impact
    ImpactFocus,
    /// Élimination du superflu
    SuperfluousElimination,
    /// Croissance organique
    OrganicGrowth,
    /// Structuration en couches
    LayeredStructuring,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum StrategyOutcome {
    Success,
    PartialSuccess,
    Learning,
    Failure,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OperationalProfile {
    /// Style divergence → connexion → structuration
    pub divergence_connection_structuration: f32,
    /// Niveau de minimalisme
    pub minimalism_level: f32,
    /// Orientation impact réel
    pub real_impact_orientation: f32,
    /// Efficacité naturelle
    pub natural_efficiency: f32,
    /// Rigueur + douceur
    pub rigor_with_gentleness: f32,
}

impl Default for OperationalProfile {
    fn default() -> Self {
        Self {
            divergence_connection_structuration: 0.90,
            minimalism_level: 0.85,
            real_impact_orientation: 0.92,
            natural_efficiency: 0.88,
            rigor_with_gentleness: 0.85,
        }
    }
}

impl OperationalTwin {
    pub fn new() -> Self {
        let mut methods = HashMap::new();

        // Méthodes par défaut Kevin
        methods.insert(
            "diverge_connect_structure".to_string(),
            Method {
                name: "Divergence → Connexion → Structuration".to_string(),
                description:
                    "Exploration libre, puis connexion des idées, puis structuration finale"
                        .to_string(),
                contexts: vec!["création".to_string(), "architecture".to_string()],
                success_rate: 0.92,
            },
        );

        methods.insert(
            "minimal_viable".to_string(),
            Method {
                name: "Minimum Viable".to_string(),
                description: "Commencer avec le minimum fonctionnel, itérer ensuite".to_string(),
                contexts: vec!["développement".to_string(), "prototype".to_string()],
                success_rate: 0.88,
            },
        );

        methods.insert(
            "priority_meaning".to_string(),
            Method {
                name: "Priorité au sens".to_string(),
                description: "Toujours s'assurer que le sens est clair avant l'action".to_string(),
                contexts: vec!["décision".to_string(), "communication".to_string()],
                success_rate: 0.95,
            },
        );

        Self {
            workflows: Vec::new(),
            preferred_methods: methods,
            strategies: Vec::new(),
            operational_profile: OperationalProfile::default(),
        }
    }

    /// Observe un workflow
    pub fn observe_workflow(
        &mut self,
        name: &str,
        steps: Vec<WorkflowStep>,
        domain: &str,
        effectiveness: f32,
    ) {
        if let Some(existing) = self.workflows.iter_mut().find(|w| w.name == name) {
            existing.observations_count += 1;
            existing.effectiveness = (existing.effectiveness + effectiveness) / 2.0;
            existing.last_observed = Utc::now();
        } else {
            self.workflows.push(ObservedWorkflow {
                name: name.to_string(),
                steps,
                domain: domain.to_string(),
                effectiveness,
                observations_count: 1,
                last_observed: Utc::now(),
            });
        }
    }

    /// Enregistre une stratégie appliquée
    pub fn record_strategy(
        &mut self,
        strategy_type: StrategyType,
        context: &str,
        outcome: StrategyOutcome,
    ) {
        self.strategies.push(AppliedStrategy {
            strategy_type,
            context: context.to_string(),
            outcome,
            timestamp: Utc::now(),
        });

        self.update_profile();
    }

    /// Met à jour le profil opérationnel
    fn update_profile(&mut self) {
        if self.strategies.is_empty() {
            return;
        }

        let recent: Vec<&AppliedStrategy> = self.strategies.iter().rev().take(30).collect();

        let success_count = recent
            .iter()
            .filter(|s| s.outcome == StrategyOutcome::Success)
            .count();

        let minimalism_count = recent
            .iter()
            .filter(|s| s.strategy_type == StrategyType::StrategicMinimalism)
            .count();

        // Ajuster profil
        self.operational_profile.natural_efficiency = success_count as f32 / recent.len() as f32;

        if minimalism_count > 0 {
            self.operational_profile.minimalism_level =
                (self.operational_profile.minimalism_level + 0.02).min(1.0);
        }
    }

    /// Recommande un workflow pour un contexte
    pub fn recommend_workflow(&self, domain: &str) -> Option<&ObservedWorkflow> {
        // FIX: Handle NaN values safely to prevent panic
        self.workflows
            .iter()
            .filter(|w| w.domain == domain)
            .max_by(|a, b| a.effectiveness.partial_cmp(&b.effectiveness).unwrap_or(std::cmp::Ordering::Equal))
    }

    /// Obtient une méthode
    pub fn get_method(&self, name: &str) -> Option<&Method> {
        self.preferred_methods.get(name)
    }

    /// Obtient le profil opérationnel
    pub fn get_profile(&self) -> &OperationalProfile {
        &self.operational_profile
    }
}

impl Default for OperationalTwin {
    fn default() -> Self {
        Self::new()
    }
}
