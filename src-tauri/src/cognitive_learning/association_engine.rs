/**
 * TITANE∞ v∞ - Association Engine
 * Crée des liens entre concepts (réseau neuronal)
 */
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Association {
    pub concept_a: String,
    pub concept_b: String,
    pub strength: f32,
    pub frequency: usize,
    pub last_reinforced: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AssociationReport {
    pub total_associations: usize,
    pub strongest_links: Vec<Association>,
    pub network_density: f32,
}

pub struct AssociationEngine {
    associations: HashMap<(String, String), Association>,
}

impl Default for AssociationEngine {
    fn default() -> Self {
        Self::new()
    }
}

impl AssociationEngine {
    pub fn new() -> Self {
        Self {
            associations: HashMap::new(),
        }
    }

    pub fn create_association(&mut self, concept_a: String, concept_b: String) {
        let key = if concept_a < concept_b {
            (concept_a.clone(), concept_b.clone())
        } else {
            (concept_b.clone(), concept_a.clone())
        };

        let timestamp = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .map(|d| d.as_secs())
            .unwrap_or_else(|_| crate::core::utils::now_ms() / 1000);

        if let Some(assoc) = self.associations.get_mut(&key) {
            assoc.frequency += 1;
            assoc.strength = (assoc.strength + 0.1).min(1.0);
            assoc.last_reinforced = timestamp;
        } else {
            self.associations.insert(
                key,
                Association {
                    concept_a,
                    concept_b,
                    strength: 0.3,
                    frequency: 1,
                    last_reinforced: timestamp,
                },
            );
        }
    }

    pub fn get_strongest(&self, limit: usize) -> Vec<Association> {
        let mut assocs: Vec<Association> = self.associations.values().cloned().collect();
        // FIX: Handle NaN values safely to prevent panic
        assocs.sort_by(|a, b| {
            b.strength
                .partial_cmp(&a.strength)
                .unwrap_or(std::cmp::Ordering::Equal)
        });
        assocs.into_iter().take(limit).collect()
    }

    pub fn get_report(&self) -> AssociationReport {
        let strongest = self.get_strongest(10);
        let network_density = if !self.associations.is_empty() {
            self.associations.values().map(|a| a.strength).sum::<f32>()
                / self.associations.len() as f32
        } else {
            0.0
        };

        AssociationReport {
            total_associations: self.associations.len(),
            strongest_links: strongest,
            network_density,
        }
    }
}

#[tauri::command]
pub async fn cognitive_create_association(
    concept_a: String,
    concept_b: String,
) -> Result<String, String> {
    let mut engine = AssociationEngine::new();
    engine.create_association(concept_a, concept_b);
    Ok("Association created".to_string())
}

#[tauri::command]
pub async fn cognitive_get_associations() -> Result<AssociationReport, String> {
    let engine = AssociationEngine::new();
    Ok(engine.get_report())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_association_engine_new() {
        let engine = AssociationEngine::new();
        assert!(engine.associations.is_empty());
    }

    #[test]
    fn test_association_engine_default() {
        let engine = AssociationEngine::default();
        assert!(engine.associations.is_empty());
    }

    #[test]
    fn test_create_association() {
        let mut engine = AssociationEngine::new();
        engine.create_association("cat".to_string(), "animal".to_string());

        assert_eq!(engine.associations.len(), 1);
    }

    #[test]
    fn test_association_ordering() {
        let mut engine = AssociationEngine::new();

        // Create in both orders - should be same association
        engine.create_association("b".to_string(), "a".to_string());
        engine.create_association("a".to_string(), "b".to_string());

        // Should only have 1 association, reinforced
        assert_eq!(engine.associations.len(), 1);

        // Should have frequency 2
        let assoc = engine
            .associations
            .values()
            .next()
            .expect("association should exist after creation");
        assert_eq!(assoc.frequency, 2);
    }

    #[test]
    fn test_association_reinforcement() {
        let mut engine = AssociationEngine::new();

        // Create initial association
        engine.create_association("x".to_string(), "y".to_string());
        let initial_strength = engine
            .associations
            .values()
            .next()
            .expect("association should exist after initial creation")
            .strength;

        // Reinforce
        engine.create_association("x".to_string(), "y".to_string());
        let reinforced_strength = engine
            .associations
            .values()
            .next()
            .expect("association should exist after reinforcement")
            .strength;

        assert!(reinforced_strength > initial_strength);
    }

    #[test]
    fn test_association_strength_capped() {
        let mut engine = AssociationEngine::new();

        // Create and reinforce many times
        for _ in 0..100 {
            engine.create_association("a".to_string(), "b".to_string());
        }

        let strength = engine
            .associations
            .values()
            .next()
            .expect("association should exist after repeated creation")
            .strength;
        assert!(strength <= 1.0);
    }

    #[test]
    fn test_get_strongest_empty() {
        let engine = AssociationEngine::new();
        let strongest = engine.get_strongest(5);
        assert!(strongest.is_empty());
    }

    #[test]
    fn test_get_strongest_limit() {
        let mut engine = AssociationEngine::new();

        for i in 0..10 {
            engine.create_association(format!("concept{}", i), "base".to_string());
        }

        let strongest = engine.get_strongest(3);
        assert_eq!(strongest.len(), 3);
    }

    #[test]
    fn test_get_strongest_sorting() {
        let mut engine = AssociationEngine::new();

        // Create with different reinforcement levels
        engine.create_association("weak".to_string(), "base".to_string());

        for _ in 0..5 {
            engine.create_association("strong".to_string(), "base".to_string());
        }

        let strongest = engine.get_strongest(10);

        // Strong should be first
        assert!(strongest[0].concept_a == "strong" || strongest[0].concept_b == "strong");
    }

    #[test]
    fn test_get_report_empty() {
        let engine = AssociationEngine::new();
        let report = engine.get_report();

        assert_eq!(report.total_associations, 0);
        assert!(report.strongest_links.is_empty());
        assert_eq!(report.network_density, 0.0);
    }

    #[test]
    fn test_get_report_with_data() {
        let mut engine = AssociationEngine::new();

        engine.create_association("a".to_string(), "b".to_string());
        engine.create_association("c".to_string(), "d".to_string());

        let report = engine.get_report();

        assert_eq!(report.total_associations, 2);
        assert!(report.network_density > 0.0);
    }

    #[test]
    fn test_association_debug() {
        let assoc = Association {
            concept_a: "test".to_string(),
            concept_b: "test2".to_string(),
            strength: 0.5,
            frequency: 3,
            last_reinforced: 12345,
        };
        let debug_str = format!("{:?}", assoc);
        assert!(debug_str.contains("Association"));
    }

    #[test]
    fn test_association_clone() {
        let assoc = Association {
            concept_a: "x".to_string(),
            concept_b: "y".to_string(),
            strength: 0.7,
            frequency: 5,
            last_reinforced: 99999,
        };
        let cloned = assoc.clone();
        assert_eq!(cloned.strength, 0.7);
        assert_eq!(cloned.frequency, 5);
    }

    #[test]
    fn test_association_serialization() {
        let assoc = Association {
            concept_a: "alpha".to_string(),
            concept_b: "beta".to_string(),
            strength: 0.85,
            frequency: 10,
            last_reinforced: 1234567890,
        };
        let json = serde_json::to_string(&assoc).expect("Association should serialize to JSON");
        let restored: Association =
            serde_json::from_str(&json).expect("Association should deserialize from JSON");
        assert_eq!(restored.concept_a, "alpha");
        assert_eq!(restored.strength, 0.85);
    }

    #[test]
    fn test_association_report_debug() {
        let report = AssociationReport {
            total_associations: 5,
            strongest_links: vec![],
            network_density: 0.6,
        };
        let debug_str = format!("{:?}", report);
        assert!(debug_str.contains("AssociationReport"));
    }

    #[test]
    fn test_association_report_clone() {
        let report = AssociationReport {
            total_associations: 10,
            strongest_links: vec![],
            network_density: 0.75,
        };
        let cloned = report.clone();
        assert_eq!(cloned.total_associations, 10);
    }

    #[test]
    fn test_association_report_serialization() {
        let report = AssociationReport {
            total_associations: 15,
            strongest_links: vec![Association {
                concept_a: "a".to_string(),
                concept_b: "b".to_string(),
                strength: 0.9,
                frequency: 20,
                last_reinforced: 111,
            }],
            network_density: 0.8,
        };
        let json =
            serde_json::to_string(&report).expect("AssociationReport should serialize to JSON");
        let restored: AssociationReport =
            serde_json::from_str(&json).expect("AssociationReport should deserialize from JSON");
        assert_eq!(restored.total_associations, 15);
        assert_eq!(restored.strongest_links.len(), 1);
    }

    #[tokio::test]
    async fn test_tauri_command_create() {
        let result =
            cognitive_create_association("concept1".to_string(), "concept2".to_string()).await;
        assert!(result.is_ok());
    }

    #[tokio::test]
    async fn test_tauri_command_get() {
        let result = cognitive_get_associations().await;
        assert!(result.is_ok());
        let report = result.expect("cognitive_get_associations should succeed");
        assert_eq!(report.total_associations, 0);
    }
}
