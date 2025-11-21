#![allow(dead_code)]
// ╔══════════════════════════════════════════════════════════════════════════════╗
// ║                  COMPRESSION COGNITIVE v13                                   ║
// ║          Mémoire longue durée intelligente et hiérarchisée                   ║
// ╚══════════════════════════════════════════════════════════════════════════════╝

pub mod compressor;

// Modules à implémenter (templates disponibles dans TITANE_V13_INTEGRATION_GUIDE.md)
// pub mod hierarchy;
// pub mod indexer;
// pub mod consolidator;
// pub mod forgetfulness;

// pub use hierarchy::MemoryHierarchy;
// pub use indexer::MemoryIndexer;
// pub use consolidator::MemoryConsolidator;
// pub use forgetfulness::SelectiveForgetfulness;

use serde::{Deserialize, Serialize};
use std::time::{Duration, SystemTime};

/// Niveau de mémoire
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum MemoryLevel {
    /// Court terme (< 1 heure)
    ShortTerm,
    /// Moyen terme (1 heure - 24 heures)
    MediumTerm,
    /// Long terme (> 24 heures)
    LongTerm,
    /// Méta-résumé (synthèse globale)
    MetaSummary,
}

/// Entrée mémoire compressée
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MemoryEntry {
    /// ID unique
    pub id: String,
    /// Contenu original (optionnel si compressé)
    pub original_content: Option<String>,
    /// Contenu compressé
    pub compressed_content: String,
    /// Résumé ultra-court
    pub summary: String,
    /// Tags/indices de rappel
    pub recall_indices: Vec<String>,
    /// Niveau de mémoire
    pub level: MemoryLevel,
    /// Importance (0.0 - 1.0)
    pub importance: f32,
    /// Fréquence d'accès
    pub access_count: u32,
    /// Dernier accès
    pub last_accessed: SystemTime,
    /// Date de création
    pub created_at: SystemTime,
    /// Liens vers autres entrées
    pub links: Vec<String>,
}

/// Statistiques de compression
#[derive(Debug, Clone, Default)]
pub struct CompressionStats {
    pub total_entries: usize,
    pub original_size_bytes: usize,
    pub compressed_size_bytes: usize,
    pub compression_ratio: f32,
    pub avg_importance: f32,
}

impl MemoryEntry {
    /// Crée une nouvelle entrée
    pub fn new(content: String, importance: f32) -> Self {
        let id = uuid::Uuid::new_v4().to_string();
        let now = SystemTime::now();

        Self {
            id,
            original_content: Some(content.clone()),
            compressed_content: content.clone(),
            summary: String::new(),
            recall_indices: Vec::new(),
            level: MemoryLevel::ShortTerm,
            importance: importance.clamp(0.0, 1.0),
            access_count: 0,
            last_accessed: now,
            created_at: now,
            links: Vec::new(),
        }
    }

    /// Marque comme accédé
    pub fn mark_accessed(&mut self) {
        self.access_count += 1;
        self.last_accessed = SystemTime::now();
    }

    /// Calcule l'âge de l'entrée
    pub fn age(&self) -> Duration {
        SystemTime::now()
            .duration_since(self.created_at)
            .unwrap_or(Duration::from_secs(0))
    }

    /// Devrait être promu au niveau supérieur ?
    pub fn should_promote(&self) -> bool {
        let age = self.age();
        let access_freq = self.access_count as f32 / age.as_secs() as f32;

        match self.level {
            MemoryLevel::ShortTerm => {
                age > Duration::from_secs(3600) && // > 1 heure
                (self.importance > 0.5 || access_freq > 0.01)
            }
            MemoryLevel::MediumTerm => {
                age > Duration::from_secs(86400) && // > 24 heures
                (self.importance > 0.7 || access_freq > 0.001)
            }
            MemoryLevel::LongTerm => false, // Ne peut pas être promu plus haut
            MemoryLevel::MetaSummary => false,
        }
    }

    /// Devrait être élagué ?
    pub fn should_forget(&self) -> bool {
        let age = self.age();
        let access_freq = self.access_count as f32 / age.as_secs().max(1) as f32;

        // Critères d'oubli
        match self.level {
            MemoryLevel::ShortTerm => {
                age > Duration::from_secs(7200) && // > 2 heures
                self.importance < 0.3 &&
                access_freq < 0.0001
            }
            MemoryLevel::MediumTerm => {
                age > Duration::from_secs(172800) && // > 48 heures
                self.importance < 0.4 &&
                self.access_count < 2
            }
            MemoryLevel::LongTerm => {
                age > Duration::from_secs(2592000) && // > 30 jours
                self.importance < 0.3 &&
                self.access_count == 0
            }
            MemoryLevel::MetaSummary => false, // Ne jamais oublier les méta-résumés
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_memory_entry_creation() {
        let entry = MemoryEntry::new("test content".to_string(), 0.5);
        assert_eq!(entry.level, MemoryLevel::ShortTerm);
        assert_eq!(entry.importance, 0.5);
        assert_eq!(entry.access_count, 0);
    }

    #[test]
    fn test_importance_clamping() {
        let entry = MemoryEntry::new("test".to_string(), 1.5);
        assert_eq!(entry.importance, 1.0);

        let entry2 = MemoryEntry::new("test".to_string(), -0.5);
        assert_eq!(entry2.importance, 0.0);
    }

    #[test]
    fn test_mark_accessed() {
        let mut entry = MemoryEntry::new("test".to_string(), 0.5);
        assert_eq!(entry.access_count, 0);

        entry.mark_accessed();
        assert_eq!(entry.access_count, 1);

        entry.mark_accessed();
        assert_eq!(entry.access_count, 2);
    }
}
