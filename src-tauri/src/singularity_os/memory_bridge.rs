// ═══════════════════════════════════════════════════════════════
//   TITANE∞ — Memory Bridge v∞
//   SUPER PROMPT #7 — Pont entre Singularity et Unified Memory
// ═══════════════════════════════════════════════════════════════

use crate::engines::unified_memory::UnifiedMemoryEngine;
use crate::singularity_os::state::SingularityState;
use serde::{Deserialize, Serialize};

/// Memory Bridge — Synchronisation mémoire Singularity ↔ UnifiedMemory
/// 
/// Responsabilités:
/// - Synchroniser état Singularity avec système mémoire unifié
/// - Filtrer bruit et évaluer pertinence
/// - Maintenir vue cohérente de la mémoire conversationnelle
/// - Gérer promotion automatique STM → MTM → LTM
pub struct MemoryBridge;

/// Résultat de synchronisation mémoire
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SyncResult {
    /// Nombre d'items synchronisés
    pub items_synced: usize,
    
    /// Nombre d'items filtrés (bruit)
    pub items_filtered: usize,
    
    /// Score de pertinence moyen
    pub avg_relevance: f32,
    
    /// Durée de synchronisation (ms)
    pub duration_ms: u64,
    
    /// Statut
    pub status: SyncStatus,
}

/// Statut de synchronisation
#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq)]
pub enum SyncStatus {
    Success,
    PartialSuccess,
    Failed,
}

/// Configuration de filtrage mémoire
#[derive(Debug, Clone)]
pub struct MemoryFilter {
    /// Seuil de pertinence minimum (0.0-1.0)
    pub min_relevance: f32,
    
    /// Longueur minimale de contenu
    pub min_content_length: usize,
    
    /// Filtrer messages système
    pub filter_system: bool,
    
    /// Filtrer messages vides
    pub filter_empty: bool,
}

impl Default for MemoryFilter {
    fn default() -> Self {
        Self {
            min_relevance: 0.3,
            min_content_length: 5,
            filter_system: false,
            filter_empty: true,
        }
    }
}

impl MemoryBridge {
    /// Synchroniser contexte Singularity vers Unified Memory
    /// 
    /// Pipeline:
    /// 1. Récupérer contexte récent Singularity
    /// 2. Filtrer bruit et évaluer pertinence
    /// 3. Stocker dans Unified Memory (STM)
    /// 4. Mettre à jour métriques
    pub async fn sync_to_memory(
        state: &mut SingularityState,
        memory: &UnifiedMemoryEngine,
        filter: &MemoryFilter,
    ) -> Result<SyncResult, String> {
        let start = std::time::Instant::now();
        
        // Récupérer contexte récent (derniers 20 items)
        let recent_context = state.get_recent_context(20);
        
        let mut items_synced = 0;
        let mut items_filtered = 0;
        let mut relevance_scores = Vec::new();
        
        for (idx, content) in recent_context.iter().enumerate() {
            // Évaluer pertinence
            let relevance = Self::evaluate_relevance(content, state);
            relevance_scores.push(relevance);
            
            // Filtrer selon critères
            if Self::should_filter(content, relevance, filter) {
                items_filtered += 1;
                continue;
            }
            
            // Stocker dans Unified Memory (STM)
            let role = if idx % 2 == 0 { "user" } else { "assistant" };
            
            memory.store(role, content, None)
                .await
                .map_err(|e| format!("Memory store failed: {}", e))?;
            
            items_synced += 1;
        }
        
        let duration_ms = start.elapsed().as_millis() as u64;
        
        let avg_relevance = if relevance_scores.is_empty() {
            0.0
        } else {
            relevance_scores.iter().sum::<f32>() / relevance_scores.len() as f32
        };
        
        let status = if items_synced > 0 {
            if items_filtered > items_synced {
                SyncStatus::PartialSuccess
            } else {
                SyncStatus::Success
            }
        } else {
            SyncStatus::Failed
        };
        
        Ok(SyncResult {
            items_synced,
            items_filtered,
            avg_relevance,
            duration_ms,
            status,
        })
    }
    
    /// Synchroniser depuis Unified Memory vers Singularity
    /// 
    /// Pipeline:
    /// 1. Récupérer mémoire récente (STM + MTM)
    /// 2. Enrichir contexte Singularity
    /// 3. Mettre à jour métriques
    pub async fn sync_from_memory(
        state: &mut SingularityState,
        memory: &UnifiedMemoryEngine,
    ) -> Result<SyncResult, String> {
        let start = std::time::Instant::now();
        
        // Récupérer STM (derniers 10 items)
        let stm = memory.recall_stm(10).await
            .map_err(|e| format!("STM recall failed: {}", e))?;
        
        let mut items_synced = 0;
        
        // Enrichir contexte Singularity
        for entry in stm.entries.iter() {
            let summary = format!(
                "[{}] {}",
                entry.role,
                entry.content.chars().take(100).collect::<String>()
            );
            
            // Ajouter au contexte Singularity si pas déjà présent
            if !state.long_context.iter().any(|c| c.contains(&entry.content[..20.min(entry.content.len())])) {
                state.push_context(summary);
                items_synced += 1;
            }
        }
        
        let duration_ms = start.elapsed().as_millis() as u64;
        
        Ok(SyncResult {
            items_synced,
            items_filtered: 0,
            avg_relevance: 1.0,
            duration_ms,
            status: if items_synced > 0 { SyncStatus::Success } else { SyncStatus::PartialSuccess },
        })
    }
    
    /// Évaluer pertinence d'un élément mémoire
    /// 
    /// Critères:
    /// - Longueur du contenu
    /// - Diversité lexicale
    /// - Cohérence avec état global
    fn evaluate_relevance(content: &str, state: &SingularityState) -> f32 {
        let mut score = 0.0;
        
        // Critère 1: Longueur (0.3)
        let length_score = (content.len() as f32 / 200.0).min(1.0);
        score += length_score * 0.3;
        
        // Critère 2: Diversité lexicale (0.4)
        let words: Vec<&str> = content.split_whitespace().collect();
        let unique_words: std::collections::HashSet<&str> = words.iter().copied().collect();
        let diversity = if words.is_empty() {
            0.0
        } else {
            unique_words.len() as f32 / words.len() as f32
        };
        score += diversity * 0.4;
        
        // Critère 3: Cohérence avec tonalité globale (0.3)
        let has_positive = content.to_lowercase().contains("bon")
            || content.to_lowercase().contains("bien")
            || content.to_lowercase().contains("excellent");
        let has_negative = content.to_lowercase().contains("erreur")
            || content.to_lowercase().contains("problème")
            || content.to_lowercase().contains("échec");
        
        let tone_match = if state.affective_tone > 0.0 && has_positive {
            1.0
        } else if state.affective_tone < 0.0 && has_negative {
            1.0
        } else if state.affective_tone.abs() < 0.1 {
            0.8
        } else {
            0.5
        };
        
        score += tone_match * 0.3;
        
        score.clamp(0.0, 1.0)
    }
    
    /// Déterminer si un élément doit être filtré
    fn should_filter(
        content: &str,
        relevance: f32,
        filter: &MemoryFilter,
    ) -> bool {
        // Filtre 1: Contenu vide
        if filter.filter_empty && content.trim().is_empty() {
            return true;
        }
        
        // Filtre 2: Longueur minimale
        if content.len() < filter.min_content_length {
            return true;
        }
        
        // Filtre 3: Pertinence minimale
        if relevance < filter.min_relevance {
            return true;
        }
        
        // Filtre 4: Messages système
        if filter.filter_system && content.to_lowercase().starts_with("system:") {
            return true;
        }
        
        false
    }
    
    /// Maintenance périodique: Promouvoir mémoires importantes
    /// 
    /// Force la promotion STM → MTM → LTM pour items critiques
    pub async fn promote_important_memories(
        memory: &UnifiedMemoryEngine,
    ) -> Result<usize, String> {
        // Récupérer STM
        let stm = memory.recall_stm(50).await
            .map_err(|e| format!("STM recall failed: {}", e))?;
        
        let mut promoted = 0;
        
        // Identifier mémoires importantes (longueur > 200 chars)
        for entry in stm.entries.iter() {
            if entry.content.len() > 200 {
                // La promotion automatique se fera lors du prochain tick
                promoted += 1;
            }
        }
        
        // Forcer un tick pour déclencher promotion
        memory.tick().await
            .map_err(|e| format!("Memory tick failed: {}", e))?;
        
        Ok(promoted)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_evaluate_relevance() {
        let state = SingularityState::new();
        
        let good_content = "Voici un contenu assez long et varié avec beaucoup de mots différents.";
        let score = MemoryBridge::evaluate_relevance(good_content, &state);
        assert!(score > 0.5);
        
        let poor_content = "a a a";
        let score = MemoryBridge::evaluate_relevance(poor_content, &state);
        assert!(score < 0.5);
    }

    #[test]
    fn test_should_filter_empty() {
        let filter = MemoryFilter::default();
        
        assert!(MemoryBridge::should_filter("", 0.5, &filter));
        assert!(MemoryBridge::should_filter("   ", 0.5, &filter));
        assert!(!MemoryBridge::should_filter("Valid content", 0.5, &filter));
    }

    #[test]
    fn test_should_filter_short() {
        let filter = MemoryFilter {
            min_content_length: 10,
            ..Default::default()
        };
        
        assert!(MemoryBridge::should_filter("abc", 0.5, &filter));
        assert!(!MemoryBridge::should_filter("Valid long content", 0.5, &filter));
    }

    #[test]
    fn test_should_filter_relevance() {
        let filter = MemoryFilter {
            min_relevance: 0.7,
            ..Default::default()
        };
        
        assert!(MemoryBridge::should_filter("Valid content", 0.5, &filter));
        assert!(!MemoryBridge::should_filter("Valid content", 0.8, &filter));
    }

    #[test]
    fn test_should_filter_system() {
        let filter = MemoryFilter {
            filter_system: true,
            ..Default::default()
        };
        
        assert!(MemoryBridge::should_filter("System: message", 0.8, &filter));
        assert!(!MemoryBridge::should_filter("User: message", 0.8, &filter));
    }

    #[test]
    fn test_sync_status() {
        let result = SyncResult {
            items_synced: 10,
            items_filtered: 2,
            avg_relevance: 0.8,
            duration_ms: 50,
            status: SyncStatus::Success,
        };
        
        assert_eq!(result.status, SyncStatus::Success);
        assert_eq!(result.items_synced, 10);
    }
}
