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
            .unwrap()
            .as_secs();

        if let Some(assoc) = self.associations.get_mut(&key) {
            assoc.frequency += 1;
            assoc.strength = (assoc.strength + 0.1).min(1.0);
            assoc.last_reinforced = timestamp;
        } else {
            self.associations.insert(key, Association {
                concept_a,
                concept_b,
                strength: 0.3,
                frequency: 1,
                last_reinforced: timestamp,
            });
        }
    }

    pub fn get_strongest(&self, limit: usize) -> Vec<Association> {
        let mut assocs: Vec<Association> = self.associations.values().cloned().collect();
        assocs.sort_by(|a, b| b.strength.partial_cmp(&a.strength).unwrap());
        assocs.into_iter().take(limit).collect()
    }

    pub fn get_report(&self) -> AssociationReport {
        let strongest = self.get_strongest(10);
        let network_density = if !self.associations.is_empty() {
            self.associations.values()
                .map(|a| a.strength)
                .sum::<f32>() / self.associations.len() as f32
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
pub async fn cognitive_create_association(concept_a: String, concept_b: String) -> Result<String, String> {
    let mut engine = AssociationEngine::new();
    engine.create_association(concept_a, concept_b);
    Ok("Association created".to_string())
}

#[tauri::command]
pub async fn cognitive_get_associations() -> Result<AssociationReport, String> {
    let engine = AssociationEngine::new();
    Ok(engine.get_report())
}
