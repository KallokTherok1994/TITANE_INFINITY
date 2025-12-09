//! ═══════════════════════════════════════════════════════════════════════════════
//! TITANE∞ v20Ω — COST MODEL
//! Super Prompt #20 — Modèle de coûts cognitifs
//! ═══════════════════════════════════════════════════════════════════════════════

use serde::{Deserialize, Serialize};
use tokio::sync::RwLock;
use std::collections::HashMap;
use super::energy_model::EnergyDimension;

/// Coût d'une opération
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct OperationCost {
    pub operation: String,
    pub base_cost: f32,
    pub dimension_costs: HashMap<EnergyDimension, f32>,
    pub fatigue_impact: f32,
    pub complexity_factor: f32,
}

impl OperationCost {
    pub fn total_cost(&self) -> f32 {
        self.base_cost * self.complexity_factor
    }
}

/// Estimation de coût
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct CostEstimate {
    pub operation: String,
    pub total_cost: f32,
    pub dimension_breakdown: HashMap<String, f32>,
    pub fatigue_impact: f32,
    pub confidence: f32,
}

/// Type d'opération
#[derive(Clone, Debug, PartialEq, Eq, Hash)]
pub enum OperationType {
    /// Traitement de texte
    TextProcessing,
    /// Génération de texte
    TextGeneration,
    /// Analyse de données
    DataAnalysis,
    /// Raisonnement
    Reasoning,
    /// Recherche
    Search,
    /// Mémoire
    MemoryAccess,
    /// Communication
    Communication,
    /// Coordination
    Coordination,
    /// Créativité
    Creative,
    /// Inconnu
    Unknown,
}

impl OperationType {
    fn from_operation_name(name: &str) -> Self {
        let lower = name.to_lowercase();

        if lower.contains("text") || lower.contains("parse") || lower.contains("process") {
            Self::TextProcessing
        } else if lower.contains("generate") || lower.contains("write") || lower.contains("create") {
            Self::TextGeneration
        } else if lower.contains("analyze") || lower.contains("data") || lower.contains("stats") {
            Self::DataAnalysis
        } else if lower.contains("reason") || lower.contains("think") || lower.contains("decide") {
            Self::Reasoning
        } else if lower.contains("search") || lower.contains("find") || lower.contains("query") {
            Self::Search
        } else if lower.contains("memory") || lower.contains("recall") || lower.contains("store") {
            Self::MemoryAccess
        } else if lower.contains("communicate") || lower.contains("message") || lower.contains("notify") {
            Self::Communication
        } else if lower.contains("coordinate") || lower.contains("plan") || lower.contains("schedule") {
            Self::Coordination
        } else if lower.contains("creative") || lower.contains("imagine") || lower.contains("innovate") {
            Self::Creative
        } else {
            Self::Unknown
        }
    }
}

/// Modèle de coûts
pub struct CostModel {
    costs: RwLock<HashMap<OperationType, OperationCost>>,
    calibrated: RwLock<bool>,
    history: RwLock<Vec<CostRecord>>,
}

#[derive(Clone, Debug)]
struct CostRecord {
    operation_type: OperationType,
    estimated_cost: f32,
    actual_cost: f32,
    timestamp: u64,
}

impl CostModel {
    pub fn new() -> Self {
        Self {
            costs: RwLock::new(HashMap::new()),
            calibrated: RwLock::new(false),
            history: RwLock::new(Vec::new()),
        }
    }

    /// Calibre le modèle
    pub async fn calibrate(&self) {
        let mut costs = self.costs.write().await;

        // Définir les coûts par défaut
        costs.insert(OperationType::TextProcessing, OperationCost {
            operation: "text_processing".to_string(),
            base_cost: 0.05,
            dimension_costs: hashmap! {
                EnergyDimension::Cognitive => 0.03,
                EnergyDimension::Memory => 0.02,
            },
            fatigue_impact: 0.02,
            complexity_factor: 1.0,
        });

        costs.insert(OperationType::TextGeneration, OperationCost {
            operation: "text_generation".to_string(),
            base_cost: 0.15,
            dimension_costs: hashmap! {
                EnergyDimension::Creative => 0.08,
                EnergyDimension::Cognitive => 0.05,
                EnergyDimension::Memory => 0.02,
            },
            fatigue_impact: 0.08,
            complexity_factor: 1.0,
        });

        costs.insert(OperationType::DataAnalysis, OperationCost {
            operation: "data_analysis".to_string(),
            base_cost: 0.12,
            dimension_costs: hashmap! {
                EnergyDimension::Cognitive => 0.08,
                EnergyDimension::Memory => 0.04,
            },
            fatigue_impact: 0.06,
            complexity_factor: 1.0,
        });

        costs.insert(OperationType::Reasoning, OperationCost {
            operation: "reasoning".to_string(),
            base_cost: 0.20,
            dimension_costs: hashmap! {
                EnergyDimension::Cognitive => 0.12,
                EnergyDimension::Executive => 0.05,
                EnergyDimension::Memory => 0.03,
            },
            fatigue_impact: 0.10,
            complexity_factor: 1.0,
        });

        costs.insert(OperationType::Search, OperationCost {
            operation: "search".to_string(),
            base_cost: 0.08,
            dimension_costs: hashmap! {
                EnergyDimension::Memory => 0.05,
                EnergyDimension::Cognitive => 0.03,
            },
            fatigue_impact: 0.03,
            complexity_factor: 1.0,
        });

        costs.insert(OperationType::MemoryAccess, OperationCost {
            operation: "memory_access".to_string(),
            base_cost: 0.03,
            dimension_costs: hashmap! {
                EnergyDimension::Memory => 0.03,
            },
            fatigue_impact: 0.01,
            complexity_factor: 1.0,
        });

        costs.insert(OperationType::Communication, OperationCost {
            operation: "communication".to_string(),
            base_cost: 0.06,
            dimension_costs: hashmap! {
                EnergyDimension::Social => 0.04,
                EnergyDimension::Cognitive => 0.02,
            },
            fatigue_impact: 0.03,
            complexity_factor: 1.0,
        });

        costs.insert(OperationType::Coordination, OperationCost {
            operation: "coordination".to_string(),
            base_cost: 0.10,
            dimension_costs: hashmap! {
                EnergyDimension::Executive => 0.06,
                EnergyDimension::Social => 0.04,
            },
            fatigue_impact: 0.05,
            complexity_factor: 1.0,
        });

        costs.insert(OperationType::Creative, OperationCost {
            operation: "creative".to_string(),
            base_cost: 0.18,
            dimension_costs: hashmap! {
                EnergyDimension::Creative => 0.12,
                EnergyDimension::Cognitive => 0.06,
            },
            fatigue_impact: 0.08,
            complexity_factor: 1.0,
        });

        costs.insert(OperationType::Unknown, OperationCost {
            operation: "unknown".to_string(),
            base_cost: 0.10,
            dimension_costs: hashmap! {
                EnergyDimension::Cognitive => 0.05,
                EnergyDimension::Physical => 0.05,
            },
            fatigue_impact: 0.05,
            complexity_factor: 1.0,
        });

        *self.calibrated.write().await = true;
    }

    /// Estime le coût d'une opération
    pub async fn estimate(&self, operation: &str) -> CostEstimate {
        let op_type = OperationType::from_operation_name(operation);
        let costs = self.costs.read().await;

        let cost = costs.get(&op_type)
            .or_else(|| costs.get(&OperationType::Unknown))
            .cloned()
            .unwrap_or(OperationCost {
                operation: operation.to_string(),
                base_cost: 0.10,
                dimension_costs: HashMap::new(),
                fatigue_impact: 0.05,
                complexity_factor: 1.0,
            });

        let dimension_breakdown: HashMap<String, f32> = cost.dimension_costs.iter()
            .map(|(k, v)| (format!("{:?}", k), *v))
            .collect();

        CostEstimate {
            operation: operation.to_string(),
            total_cost: cost.total_cost(),
            dimension_breakdown,
            fatigue_impact: cost.fatigue_impact,
            confidence: if *self.calibrated.read().await { 0.8 } else { 0.5 },
        }
    }

    /// Enregistre un coût réel pour améliorer les estimations
    pub async fn record_actual(&self, operation: &str, actual_cost: f32) {
        let op_type = OperationType::from_operation_name(operation);
        let estimate = self.estimate(operation).await;

        let mut history = self.history.write().await;
        history.push(CostRecord {
            operation_type: op_type,
            estimated_cost: estimate.total_cost,
            actual_cost,
            timestamp: Self::now(),
        });

        // Limiter l'historique
        if history.len() > 1000 {
            history.remove(0);
        }
    }

    /// Calcule la précision du modèle
    pub async fn accuracy(&self) -> f32 {
        let history = self.history.read().await;

        if history.is_empty() {
            return 0.0;
        }

        let total_error: f32 = history.iter()
            .map(|r| (r.estimated_cost - r.actual_cost).abs())
            .sum();

        let avg_error = total_error / history.len() as f32;

        // Convertir en score de précision (0 erreur = 1.0, erreur moyenne de 0.5 = 0.0)
        (1.0 - avg_error * 2.0).max(0.0)
    }

    fn now() -> u64 {
        std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap_or_default()
            .as_millis() as u64
    }
}

impl Default for CostModel {
    fn default() -> Self {
        Self::new()
    }
}

/// Macro helper pour créer des HashMap
macro_rules! hashmap {
    ($( $key: expr => $val: expr ),*$(,)?) => {{
        let mut map = ::std::collections::HashMap::new();
        $( map.insert($key, $val); )*
        map
    }}
}
use hashmap;

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_cost_model() {
        let model = CostModel::new();
        model.calibrate().await;

        let estimate = model.estimate("text_processing").await;
        assert!(estimate.total_cost > 0.0);
    }

    #[tokio::test]
    async fn test_operation_type_detection() {
        assert_eq!(
            OperationType::from_operation_name("generate_text"),
            OperationType::TextGeneration
        );
        assert_eq!(
            OperationType::from_operation_name("analyze_data"),
            OperationType::DataAnalysis
        );
    }
}
