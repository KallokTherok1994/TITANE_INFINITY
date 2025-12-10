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

#[cfg(test)]
mod tests {
    use super::*;

    // ─────────────────────────────────────────────────────────────
    // KnowledgeMetrics Tests
    // ─────────────────────────────────────────────────────────────

    #[test]
    fn test_knowledge_metrics_creation() {
        let metrics = KnowledgeMetrics {
            total_knowledge_units: 100,
            growth_rate: 15.5,
            consolidation_level: 75.0,
            domains_covered: 5,
        };
        assert_eq!(metrics.total_knowledge_units, 100);
        assert_eq!(metrics.domains_covered, 5);
    }

    #[test]
    fn test_knowledge_metrics_clone() {
        let metrics = KnowledgeMetrics {
            total_knowledge_units: 50,
            growth_rate: 10.0,
            consolidation_level: 50.0,
            domains_covered: 3,
        };
        let cloned = metrics.clone();
        assert_eq!(cloned.growth_rate, 10.0);
    }

    #[test]
    fn test_knowledge_metrics_debug() {
        let metrics = KnowledgeMetrics {
            total_knowledge_units: 0,
            growth_rate: 0.0,
            consolidation_level: 0.0,
            domains_covered: 0,
        };
        let debug_str = format!("{:?}", metrics);
        assert!(debug_str.contains("KnowledgeMetrics"));
    }

    #[test]
    fn test_knowledge_metrics_serialization() {
        let metrics = KnowledgeMetrics {
            total_knowledge_units: 200,
            growth_rate: 25.5,
            consolidation_level: 80.0,
            domains_covered: 4,
        };
        let json = serde_json::to_string(&metrics).unwrap();
        let restored: KnowledgeMetrics = serde_json::from_str(&json).unwrap();
        assert_eq!(restored.total_knowledge_units, 200);
        assert_eq!(restored.consolidation_level, 80.0);
    }

    // ─────────────────────────────────────────────────────────────
    // GrowthReport Tests
    // ─────────────────────────────────────────────────────────────

    #[test]
    fn test_growth_report_creation() {
        let metrics = KnowledgeMetrics {
            total_knowledge_units: 10,
            growth_rate: 5.0,
            consolidation_level: 10.0,
            domains_covered: 2,
        };
        let report = GrowthReport {
            timestamp: 12345,
            metrics,
            recent_growth: vec!["concept1".to_string()],
        };
        assert_eq!(report.timestamp, 12345);
        assert_eq!(report.recent_growth.len(), 1);
    }

    #[test]
    fn test_growth_report_clone() {
        let metrics = KnowledgeMetrics {
            total_knowledge_units: 5,
            growth_rate: 2.0,
            consolidation_level: 5.0,
            domains_covered: 1,
        };
        let report = GrowthReport {
            timestamp: 100,
            metrics,
            recent_growth: vec!["a".to_string(), "b".to_string()],
        };
        let cloned = report.clone();
        assert_eq!(cloned.recent_growth.len(), 2);
    }

    #[test]
    fn test_growth_report_debug() {
        let metrics = KnowledgeMetrics {
            total_knowledge_units: 0,
            growth_rate: 0.0,
            consolidation_level: 0.0,
            domains_covered: 0,
        };
        let report = GrowthReport {
            timestamp: 0,
            metrics,
            recent_growth: vec![],
        };
        let debug_str = format!("{:?}", report);
        assert!(debug_str.contains("GrowthReport"));
    }

    #[test]
    fn test_growth_report_serialization() {
        let metrics = KnowledgeMetrics {
            total_knowledge_units: 30,
            growth_rate: 12.0,
            consolidation_level: 30.0,
            domains_covered: 3,
        };
        let report = GrowthReport {
            timestamp: 999,
            metrics,
            recent_growth: vec!["test".to_string()],
        };
        let json = serde_json::to_string(&report).unwrap();
        let restored: GrowthReport = serde_json::from_str(&json).unwrap();
        assert_eq!(restored.timestamp, 999);
    }

    // ─────────────────────────────────────────────────────────────
    // KnowledgeGrowthEngine Tests
    // ─────────────────────────────────────────────────────────────

    #[test]
    fn test_knowledge_engine_new() {
        let engine = KnowledgeGrowthEngine::new();
        assert!(engine.knowledge_units.is_empty());
        assert_eq!(engine.domains.len(), 5);
    }

    #[test]
    fn test_knowledge_engine_default() {
        let engine = KnowledgeGrowthEngine::default();
        assert!(engine.knowledge_units.is_empty());
        assert!(engine.domains.contains(&"AI".to_string()));
    }

    #[test]
    fn test_knowledge_engine_domains() {
        let engine = KnowledgeGrowthEngine::new();
        assert!(engine.domains.contains(&"Architecture".to_string()));
        assert!(engine.domains.contains(&"UI/UX".to_string()));
        assert!(engine.domains.contains(&"Backend".to_string()));
        assert!(engine.domains.contains(&"AI".to_string()));
        assert!(engine.domains.contains(&"Design System".to_string()));
    }

    #[tokio::test]
    async fn test_knowledge_engine_grow_empty() {
        let mut engine = KnowledgeGrowthEngine::new();
        let report = engine.grow(vec![]).await;

        assert_eq!(report.metrics.total_knowledge_units, 0);
        assert!(report.recent_growth.is_empty());
    }

    #[tokio::test]
    async fn test_knowledge_engine_grow_single() {
        let mut engine = KnowledgeGrowthEngine::new();
        let report = engine.grow(vec!["New concept".to_string()]).await;

        assert_eq!(report.metrics.total_knowledge_units, 1);
        assert_eq!(report.recent_growth.len(), 1);
        assert_eq!(report.metrics.growth_rate, 100.0);
    }

    #[tokio::test]
    async fn test_knowledge_engine_grow_multiple() {
        let mut engine = KnowledgeGrowthEngine::new();
        let knowledge = vec![
            "Concept A".to_string(),
            "Concept B".to_string(),
            "Concept C".to_string(),
        ];
        let report = engine.grow(knowledge).await;

        assert_eq!(report.metrics.total_knowledge_units, 3);
        assert_eq!(report.recent_growth.len(), 3);
    }

    #[tokio::test]
    async fn test_knowledge_engine_grow_sequential() {
        let mut engine = KnowledgeGrowthEngine::new();

        // First growth
        engine.grow(vec!["A".to_string(), "B".to_string()]).await;

        // Second growth
        let report = engine.grow(vec!["C".to_string()]).await;

        assert_eq!(report.metrics.total_knowledge_units, 3);
        // Growth rate = 1/2 * 100 = 50%
        assert_eq!(report.metrics.growth_rate, 50.0);
    }

    #[tokio::test]
    async fn test_knowledge_engine_consolidation_empty() {
        let engine = KnowledgeGrowthEngine::new();
        let consolidation = engine.calculate_consolidation();
        assert_eq!(consolidation, 0.0);
    }

    #[tokio::test]
    async fn test_knowledge_engine_consolidation_small() {
        let mut engine = KnowledgeGrowthEngine::new();
        engine.grow(vec!["A".to_string(); 100]).await;
        let consolidation = engine.calculate_consolidation();
        // 100/1000 * 100 = 10.0
        assert_eq!(consolidation, 10.0);
    }

    #[tokio::test]
    async fn test_knowledge_engine_consolidation_max() {
        let mut engine = KnowledgeGrowthEngine::new();
        engine.grow(vec!["A".to_string(); 2000]).await;
        let consolidation = engine.calculate_consolidation();
        // Capped at 100.0
        assert_eq!(consolidation, 100.0);
    }

    #[tokio::test]
    async fn test_knowledge_engine_timestamp() {
        let mut engine = KnowledgeGrowthEngine::new();
        let report = engine.grow(vec!["test".to_string()]).await;
        assert!(report.timestamp > 0);
    }

    // ─────────────────────────────────────────────────────────────
    // Tauri Command Tests
    // ─────────────────────────────────────────────────────────────

    #[tokio::test]
    async fn test_tauri_cognitive_grow_knowledge() {
        let result = cognitive_grow_knowledge(vec!["test".to_string()]).await;
        assert!(result.is_ok());
        let report = result.unwrap();
        assert_eq!(report.metrics.total_knowledge_units, 1);
    }

    #[tokio::test]
    async fn test_tauri_cognitive_grow_knowledge_empty() {
        let result = cognitive_grow_knowledge(vec![]).await;
        assert!(result.is_ok());
        let report = result.unwrap();
        assert_eq!(report.metrics.total_knowledge_units, 0);
    }
}
