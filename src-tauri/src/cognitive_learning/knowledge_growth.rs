/**
 * TITANE∞ v∞ - Knowledge Growth Engine
 * Extension et consolidation des connaissances
 */
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct KnowledgeMetrics {
    pub total_knowledge_units: usize,
    pub growth_rate: f32,
    pub consolidation_level: f32,
    pub domains_covered: usize,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GrowthReport {
    pub timestamp: u64,
    pub metrics: KnowledgeMetrics,
    pub recent_growth: Vec<String>,
}

pub struct KnowledgeGrowthEngine {
    knowledge_units: Vec<String>,
    domains: Vec<String>,
}

impl Default for KnowledgeGrowthEngine {
    fn default() -> Self {
        Self::new()
    }
}

impl KnowledgeGrowthEngine {
    pub fn new() -> Self {
        Self {
            knowledge_units: Vec::new(),
            domains: vec![
                "Architecture".to_string(),
                "UI/UX".to_string(),
                "Backend".to_string(),
                "AI".to_string(),
                "Design System".to_string(),
            ],
        }
    }

    pub async fn grow(&mut self, new_knowledge: Vec<String>) -> GrowthReport {
        let timestamp = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_secs();

        let previous_count = self.knowledge_units.len();
        self.knowledge_units.extend(new_knowledge.clone());

        let growth_rate = if previous_count > 0 {
            (new_knowledge.len() as f32 / previous_count as f32) * 100.0
        } else {
            100.0
        };

        let consolidation_level = self.calculate_consolidation();

        let metrics = KnowledgeMetrics {
            total_knowledge_units: self.knowledge_units.len(),
            growth_rate,
            consolidation_level,
            domains_covered: self.domains.len(),
        };

        GrowthReport {
            timestamp,
            metrics,
            recent_growth: new_knowledge,
        }
    }

    fn calculate_consolidation(&self) -> f32 {
        if self.knowledge_units.is_empty() {
            return 0.0;
        }
        // Simule niveau de consolidation basé sur taille
        (self.knowledge_units.len() as f32 / 1000.0).min(1.0) * 100.0
    }
}

#[tauri::command]
pub async fn cognitive_grow_knowledge(new_knowledge: Vec<String>) -> Result<GrowthReport, String> {
    let mut engine = KnowledgeGrowthEngine::new();
    Ok(engine.grow(new_knowledge).await)
}
