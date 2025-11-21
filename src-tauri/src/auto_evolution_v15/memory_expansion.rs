// 🧠 Memory Expansion — Expansion et consolidation de la mémoire
// Persistance sécurisée des apprentissages

use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MemoryEntry {
    pub key: String,
    pub value: String,
    pub category: MemoryCategory,
    pub importance: f32,
    pub last_accessed: String,
    pub access_count: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum MemoryCategory {
    Pattern,
    Context,
    Preference,
    Learning,
    Adjustment,
}

pub struct MemoryExpander {
    memories: HashMap<String, MemoryEntry>,
}

impl MemoryExpander {
    pub fn new() -> Self {
        Self {
            memories: HashMap::new(),
        }
    }

    /// Sauvegarder une mémoire
    pub fn store(&mut self, key: String, value: String, category: MemoryCategory, importance: f32) {
        let entry = MemoryEntry {
            key: key.clone(),
            value,
            category,
            importance,
            last_accessed: chrono::Utc::now().to_rfc3339(),
            access_count: 1,
        };

        self.memories.insert(key, entry);
    }

    /// Récupérer une mémoire
    pub fn recall(&mut self, key: &str) -> Option<String> {
        if let Some(entry) = self.memories.get_mut(key) {
            entry.access_count += 1;
            entry.last_accessed = chrono::Utc::now().to_rfc3339();
            Some(entry.value.clone())
        } else {
            None
        }
    }

    /// Consolider l'apprentissage (renforcer mémoires importantes)
    pub fn consolidate_learning(&mut self) {
        for entry in self.memories.values_mut() {
            if entry.access_count > 10 {
                entry.importance = (entry.importance * 1.1).min(1.0);
            }
        }

        // Nettoyer mémoires faibles et anciennes
        self.memories.retain(|_, entry| {
            entry.importance > 0.1 || entry.access_count > 5
        });
    }

    /// Obtenir statistiques mémoire
    pub fn get_memory_stats(&self) -> (usize, f32) {
        let count = self.memories.len();
        let avg_importance = if count > 0 {
            self.memories.values().map(|e| e.importance).sum::<f32>() / count as f32
        } else {
            0.0
        };

        (count, avg_importance)
    }
}

impl Default for MemoryExpander {
    fn default() -> Self {
        Self::new()
    }
}
