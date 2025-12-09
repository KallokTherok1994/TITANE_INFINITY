//! ═══════════════════════════════════════════════════════════════════════════════
//! TITANE∞ v20Ω — META-LEARNING ENGINE
//! Super Prompt #11 — Apprentissage sur l'apprentissage, adaptation de stratégies
//! ═══════════════════════════════════════════════════════════════════════════════

use serde::{Deserialize, Serialize};
use tokio::sync::RwLock;
use super::introspection::IntrospectionReport;
use super::strategy::Strategy;

/// Stratégie d'apprentissage
#[derive(Clone, Debug, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum LearningStrategy {
    /// Apprentissage par renforcement
    Reinforcement,
    /// Apprentissage par imitation
    Imitation,
    /// Apprentissage par exploration
    Exploration,
    /// Apprentissage par analogie
    Analogy,
    /// Apprentissage par abstraction
    Abstraction,
    /// Apprentissage par décomposition
    Decomposition,
    /// Apprentissage adaptatif
    Adaptive,
}

impl Default for LearningStrategy {
    fn default() -> Self {
        Self::Adaptive
    }
}

/// Métriques d'apprentissage
#[derive(Clone, Debug, Default, Serialize, Deserialize)]
pub struct LearningMetrics {
    /// Total d'apprentissages
    pub total_learnings: u64,
    /// Succès récents
    pub recent_successes: u32,
    /// Échecs récents
    pub recent_failures: u32,
    /// Taux de rétention
    pub retention_rate: f32,
    /// Vitesse d'apprentissage
    pub learning_rate: f32,
    /// Transfert de connaissances
    pub transfer_effectiveness: f32,
    /// Adaptabilité
    pub adaptability_score: f32,
}

/// Entrée d'apprentissage
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct LearningEntry {
    pub id: String,
    pub strategy_used: LearningStrategy,
    pub domain: String,
    pub success: bool,
    pub confidence_before: f32,
    pub confidence_after: f32,
    pub lessons: Vec<String>,
    pub timestamp: u64,
}

/// Moteur de meta-learning
pub struct MetaLearningEngine {
    state: RwLock<MetaLearningState>,
    strategy_scores: RwLock<StrategyScores>,
}

/// État interne du meta-learning
struct MetaLearningState {
    current_strategy: LearningStrategy,
    metrics: LearningMetrics,
    history: Vec<LearningEntry>,
    domain_expertise: std::collections::HashMap<String, f32>,
}

impl Default for MetaLearningState {
    fn default() -> Self {
        Self {
            current_strategy: LearningStrategy::Adaptive,
            metrics: LearningMetrics::default(),
            history: Vec::new(),
            domain_expertise: std::collections::HashMap::new(),
        }
    }
}

/// Scores par stratégie
struct StrategyScores {
    scores: std::collections::HashMap<LearningStrategy, f32>,
}

impl Default for StrategyScores {
    fn default() -> Self {
        let mut scores = std::collections::HashMap::new();
        scores.insert(LearningStrategy::Reinforcement, 0.5);
        scores.insert(LearningStrategy::Imitation, 0.5);
        scores.insert(LearningStrategy::Exploration, 0.5);
        scores.insert(LearningStrategy::Analogy, 0.5);
        scores.insert(LearningStrategy::Abstraction, 0.5);
        scores.insert(LearningStrategy::Decomposition, 0.5);
        scores.insert(LearningStrategy::Adaptive, 0.6);

        Self { scores }
    }
}

impl MetaLearningEngine {
    pub fn new() -> Self {
        Self {
            state: RwLock::new(MetaLearningState::default()),
            strategy_scores: RwLock::new(StrategyScores::default()),
        }
    }

    /// Met à jour le meta-learning avec une nouvelle expérience
    pub async fn update(&self, introspection: &IntrospectionReport, strategy: &Strategy) {
        let mut state = self.state.write().await;

        // Créer une entrée d'apprentissage
        let entry = LearningEntry {
            id: uuid::Uuid::new_v4().to_string(),
            strategy_used: self.infer_learning_strategy(strategy),
            domain: strategy.domain.clone(),
            success: introspection.confidence > 0.6,
            confidence_before: introspection.uncertainty,
            confidence_after: introspection.confidence,
            lessons: introspection.recommendations.clone(),
            timestamp: Self::now(),
        };

        // Mettre à jour les métriques
        state.metrics.total_learnings += 1;
        if entry.success {
            state.metrics.recent_successes += 1;
        } else {
            state.metrics.recent_failures += 1;
        }

        // Calculer le taux d'apprentissage
        let improvement = entry.confidence_after - entry.confidence_before;
        state.metrics.learning_rate = (state.metrics.learning_rate + improvement) / 2.0;

        // Mettre à jour l'expertise du domaine
        let current_expertise = state.domain_expertise
            .get(&entry.domain)
            .copied()
            .unwrap_or(0.0);
        let new_expertise = if entry.success {
            (current_expertise + 0.1).min(1.0)
        } else {
            (current_expertise - 0.05).max(0.0)
        };
        state.domain_expertise.insert(entry.domain.clone(), new_expertise);

        // Ajouter à l'historique
        state.history.push(entry);
        if state.history.len() > 1000 {
            state.history.remove(0);
        }

        // Mettre à jour les scores de stratégie
        self.update_strategy_scores(strategy, introspection.confidence).await;
    }

    /// Infère la stratégie d'apprentissage utilisée
    fn infer_learning_strategy(&self, strategy: &Strategy) -> LearningStrategy {
        match strategy.approach.as_str() {
            "analytical" => LearningStrategy::Decomposition,
            "creative" => LearningStrategy::Exploration,
            "systematic" => LearningStrategy::Reinforcement,
            "analogical" => LearningStrategy::Analogy,
            _ => LearningStrategy::Adaptive,
        }
    }

    /// Met à jour les scores de stratégie
    async fn update_strategy_scores(&self, strategy: &Strategy, confidence: f32) {
        let mut scores = self.strategy_scores.write().await;
        let learning_strategy = self.infer_learning_strategy(strategy);

        if let Some(score) = scores.scores.get_mut(&learning_strategy) {
            // Ajustement basé sur la confiance
            if confidence > 0.7 {
                *score = (*score + 0.05).min(1.0);
            } else if confidence < 0.4 {
                *score = (*score - 0.03).max(0.0);
            }
        }
    }

    /// Sélectionne la meilleure stratégie d'apprentissage
    pub async fn select_best_strategy(&self, domain: &str) -> LearningStrategy {
        let state = self.state.read().await;
        let scores = self.strategy_scores.read().await;

        // Vérifier l'expertise du domaine
        let domain_expertise = state.domain_expertise.get(domain).copied().unwrap_or(0.0);

        if domain_expertise < 0.3 {
            // Domaine peu connu: exploration
            return LearningStrategy::Exploration;
        }

        if domain_expertise > 0.7 {
            // Domaine bien connu: abstraction
            return LearningStrategy::Abstraction;
        }

        // Sélectionner la stratégie avec le meilleur score
        scores.scores.iter()
            .max_by(|a, b| a.1.partial_cmp(b.1).unwrap_or(std::cmp::Ordering::Equal))
            .map(|(strategy, _)| strategy.clone())
            .unwrap_or(LearningStrategy::Adaptive)
    }

    /// Récupère les métriques
    pub async fn get_metrics(&self) -> LearningMetrics {
        let state = self.state.read().await;
        state.metrics.clone()
    }

    /// Récupère l'expertise par domaine
    pub async fn get_domain_expertise(&self, domain: &str) -> f32 {
        let state = self.state.read().await;
        state.domain_expertise.get(domain).copied().unwrap_or(0.0)
    }

    /// Récupère l'historique récent
    pub async fn get_recent_history(&self, limit: usize) -> Vec<LearningEntry> {
        let state = self.state.read().await;
        state.history.iter().rev().take(limit).cloned().collect()
    }

    /// Réinitialise le moteur
    pub async fn reset(&self) {
        let mut state = self.state.write().await;
        *state = MetaLearningState::default();
    }

    fn now() -> u64 {
        std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap_or_default()
            .as_millis() as u64
    }
}

impl Default for MetaLearningEngine {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_meta_learning_creation() {
        let engine = MetaLearningEngine::new();
        let metrics = engine.get_metrics().await;
        assert_eq!(metrics.total_learnings, 0);
    }

    #[tokio::test]
    async fn test_select_best_strategy() {
        let engine = MetaLearningEngine::new();
        let strategy = engine.select_best_strategy("unknown_domain").await;
        assert_eq!(strategy, LearningStrategy::Exploration);
    }

    #[tokio::test]
    async fn test_domain_expertise() {
        let engine = MetaLearningEngine::new();
        let expertise = engine.get_domain_expertise("rust").await;
        assert_eq!(expertise, 0.0); // No prior expertise
    }
}
