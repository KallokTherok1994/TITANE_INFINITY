//! ═══════════════════════════════════════════════════════════════════════════════
//! TITANE∞ v20Ω — STRATEGY OPTIMIZER
//! Super Prompt #11 — Sélection et optimisation de stratégies
//! ═══════════════════════════════════════════════════════════════════════════════

use serde::{Deserialize, Serialize};
use tokio::sync::RwLock;
use super::introspection::IntrospectionReport;
use super::reasoning::ReasoningChain;
use super::abstraction::Concept;

/// Stratégie
#[derive(Clone, Debug, Default, Serialize, Deserialize)]
pub struct Strategy {
    pub id: String,
    pub name: String,
    pub description: String,
    pub approach: String,
    pub domain: String,
    pub steps: Vec<StrategyStep>,
    pub confidence: f32,
    pub estimated_cost: f32,
    pub estimated_time_ms: u64,
    pub prerequisites: Vec<String>,
}

/// Étape de stratégie
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct StrategyStep {
    pub order: u32,
    pub action: String,
    pub description: String,
    pub required_capability: Option<String>,
    pub fallback: Option<String>,
}

/// Score de stratégie
#[derive(Clone, Debug, Default, Serialize, Deserialize)]
pub struct StrategyScore {
    pub strategy_id: String,
    pub overall_score: f32,
    pub effectiveness: f32,
    pub efficiency: f32,
    pub reliability: f32,
    pub adaptability: f32,
}

/// Optimiseur de stratégies
pub struct StrategyOptimizer {
    strategies: RwLock<Vec<Strategy>>,
    history: RwLock<Vec<StrategyExecution>>,
}

/// Historique d'exécution de stratégie
#[derive(Clone, Debug, Serialize, Deserialize)]
struct StrategyExecution {
    strategy_id: String,
    success: bool,
    duration_ms: u64,
    confidence_achieved: f32,
    timestamp: u64,
}

impl StrategyOptimizer {
    pub fn new() -> Self {
        let strategies = vec![
            Strategy {
                id: "analytical".to_string(),
                name: "Analytical Strategy".to_string(),
                description: "Break down problem into components".to_string(),
                approach: "analytical".to_string(),
                domain: "general".to_string(),
                steps: vec![
                    StrategyStep {
                        order: 1,
                        action: "decompose".to_string(),
                        description: "Decompose problem into subproblems".to_string(),
                        required_capability: Some("reasoning".to_string()),
                        fallback: None,
                    },
                    StrategyStep {
                        order: 2,
                        action: "analyze".to_string(),
                        description: "Analyze each component".to_string(),
                        required_capability: Some("reasoning".to_string()),
                        fallback: None,
                    },
                    StrategyStep {
                        order: 3,
                        action: "synthesize".to_string(),
                        description: "Combine solutions".to_string(),
                        required_capability: Some("reasoning".to_string()),
                        fallback: None,
                    },
                ],
                confidence: 0.8,
                estimated_cost: 0.5,
                estimated_time_ms: 500,
                prerequisites: Vec::new(),
            },
            Strategy {
                id: "creative".to_string(),
                name: "Creative Strategy".to_string(),
                description: "Generate novel approaches".to_string(),
                approach: "creative".to_string(),
                domain: "general".to_string(),
                steps: vec![
                    StrategyStep {
                        order: 1,
                        action: "brainstorm".to_string(),
                        description: "Generate multiple ideas".to_string(),
                        required_capability: None,
                        fallback: None,
                    },
                    StrategyStep {
                        order: 2,
                        action: "evaluate".to_string(),
                        description: "Evaluate feasibility".to_string(),
                        required_capability: Some("reasoning".to_string()),
                        fallback: None,
                    },
                    StrategyStep {
                        order: 3,
                        action: "refine".to_string(),
                        description: "Refine best idea".to_string(),
                        required_capability: None,
                        fallback: None,
                    },
                ],
                confidence: 0.7,
                estimated_cost: 0.6,
                estimated_time_ms: 700,
                prerequisites: Vec::new(),
            },
            Strategy {
                id: "systematic".to_string(),
                name: "Systematic Strategy".to_string(),
                description: "Follow structured methodology".to_string(),
                approach: "systematic".to_string(),
                domain: "general".to_string(),
                steps: vec![
                    StrategyStep {
                        order: 1,
                        action: "define".to_string(),
                        description: "Define problem clearly".to_string(),
                        required_capability: Some("language_understanding".to_string()),
                        fallback: None,
                    },
                    StrategyStep {
                        order: 2,
                        action: "research".to_string(),
                        description: "Gather relevant information".to_string(),
                        required_capability: Some("memory_management".to_string()),
                        fallback: None,
                    },
                    StrategyStep {
                        order: 3,
                        action: "implement".to_string(),
                        description: "Apply solution methodically".to_string(),
                        required_capability: None,
                        fallback: None,
                    },
                ],
                confidence: 0.85,
                estimated_cost: 0.7,
                estimated_time_ms: 800,
                prerequisites: Vec::new(),
            },
            Strategy {
                id: "analogical".to_string(),
                name: "Analogical Strategy".to_string(),
                description: "Use analogies from similar problems".to_string(),
                approach: "analogical".to_string(),
                domain: "general".to_string(),
                steps: vec![
                    StrategyStep {
                        order: 1,
                        action: "recall".to_string(),
                        description: "Find similar past problems".to_string(),
                        required_capability: Some("memory_management".to_string()),
                        fallback: None,
                    },
                    StrategyStep {
                        order: 2,
                        action: "map".to_string(),
                        description: "Map solution to current problem".to_string(),
                        required_capability: Some("reasoning".to_string()),
                        fallback: None,
                    },
                    StrategyStep {
                        order: 3,
                        action: "adapt".to_string(),
                        description: "Adapt solution as needed".to_string(),
                        required_capability: None,
                        fallback: None,
                    },
                ],
                confidence: 0.75,
                estimated_cost: 0.4,
                estimated_time_ms: 400,
                prerequisites: Vec::new(),
            },
        ];

        Self {
            strategies: RwLock::new(strategies),
            history: RwLock::new(Vec::new()),
        }
    }

    /// Sélectionne la meilleure stratégie
    pub async fn select(
        &self,
        introspection: &IntrospectionReport,
        reasoning: &ReasoningChain,
        concepts: &[Concept],
    ) -> Strategy {
        let strategies = self.strategies.read().await;
        let history = self.history.read().await;

        let mut best_strategy = strategies.first().cloned().unwrap_or_default();
        let mut best_score = 0.0f32;

        for strategy in strategies.iter() {
            let score = self.score_strategy(strategy, introspection, reasoning, concepts, &history);

            if score > best_score {
                best_score = score;
                best_strategy = strategy.clone();
            }
        }

        best_strategy
    }

    /// Score une stratégie
    fn score_strategy(
        &self,
        strategy: &Strategy,
        introspection: &IntrospectionReport,
        reasoning: &ReasoningChain,
        concepts: &[Concept],
        history: &[StrategyExecution],
    ) -> f32 {
        let mut score = strategy.confidence;

        // Ajuster selon la charge cognitive
        if introspection.cognitive_load > 0.7 && strategy.approach == "creative" {
            score -= 0.1; // Éviter créativité sous haute charge
        }

        // Ajuster selon l'incertitude
        if introspection.uncertainty > 0.6 && strategy.approach == "systematic" {
            score += 0.1; // Favoriser systématique sous incertitude
        }

        // Ajuster selon la profondeur de raisonnement
        if reasoning.depth > 5 && strategy.approach == "analytical" {
            score += 0.05;
        }

        // Ajuster selon les concepts
        if concepts.iter().any(|c| c.level == super::abstraction::AbstractionLevel::High) {
            if strategy.approach == "analogical" {
                score += 0.1;
            }
        }

        // Ajuster selon l'historique
        let recent_executions: Vec<_> = history.iter()
            .filter(|e| e.strategy_id == strategy.id)
            .rev()
            .take(5)
            .collect();

        if !recent_executions.is_empty() {
            let success_rate: f32 = recent_executions.iter()
                .map(|e| if e.success { 1.0 } else { 0.0 })
                .sum::<f32>() / recent_executions.len() as f32;

            score = score * 0.7 + success_rate * 0.3;
        }

        score.clamp(0.0, 1.0)
    }

    /// Enregistre l'exécution d'une stratégie
    pub async fn record_execution(
        &self,
        strategy_id: &str,
        success: bool,
        duration_ms: u64,
        confidence: f32,
    ) {
        let mut history = self.history.write().await;

        history.push(StrategyExecution {
            strategy_id: strategy_id.to_string(),
            success,
            duration_ms,
            confidence_achieved: confidence,
            timestamp: Self::now(),
        });

        // Garder seulement les 1000 dernières exécutions
        if history.len() > 1000 {
            history.remove(0);
        }
    }

    /// Score une stratégie (version publique)
    pub async fn score(&self, strategy: &Strategy) -> StrategyScore {
        let history = self.history.read().await;

        let executions: Vec<_> = history.iter()
            .filter(|e| e.strategy_id == strategy.id)
            .collect();

        let (success_count, total_duration) = executions.iter().fold((0u32, 0u64), |(sc, td), e| {
            (sc + if e.success { 1 } else { 0 }, td + e.duration_ms)
        });

        let effectiveness = if executions.is_empty() {
            strategy.confidence
        } else {
            success_count as f32 / executions.len() as f32
        };

        let efficiency = if executions.is_empty() {
            0.5
        } else {
            let avg_duration = total_duration as f32 / executions.len() as f32;
            (1.0 - (avg_duration / 1000.0)).max(0.0)
        };

        StrategyScore {
            strategy_id: strategy.id.clone(),
            overall_score: (effectiveness + efficiency) / 2.0,
            effectiveness,
            efficiency,
            reliability: strategy.confidence,
            adaptability: 0.7,
        }
    }

    /// Récupère toutes les stratégies
    pub async fn get_all(&self) -> Vec<Strategy> {
        self.strategies.read().await.clone()
    }

    /// Ajoute une nouvelle stratégie
    pub async fn add_strategy(&self, strategy: Strategy) {
        let mut strategies = self.strategies.write().await;
        strategies.push(strategy);
    }

    fn now() -> u64 {
        std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap_or_default()
            .as_millis() as u64
    }
}

impl Default for StrategyOptimizer {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_strategy_optimizer_creation() {
        let optimizer = StrategyOptimizer::new();
        let strategies = optimizer.get_all().await;
        assert!(!strategies.is_empty());
    }

    #[tokio::test]
    async fn test_select_strategy() {
        let optimizer = StrategyOptimizer::new();
        let introspection = IntrospectionReport::default();
        let reasoning = ReasoningChain::default();
        let concepts = Vec::new();

        let strategy = optimizer.select(&introspection, &reasoning, &concepts).await;
        assert!(!strategy.id.is_empty());
    }

    #[tokio::test]
    async fn test_record_execution() {
        let optimizer = StrategyOptimizer::new();
        optimizer.record_execution("analytical", true, 100, 0.9).await;

        let strategies = optimizer.get_all().await;
        let analytical = strategies.iter().find(|s| s.id == "analytical").unwrap();
        let score = optimizer.score(analytical).await;

        assert!(score.effectiveness > 0.0);
    }
}
