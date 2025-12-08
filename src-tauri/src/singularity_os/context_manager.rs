// ═══════════════════════════════════════════════════════════════
//   TITANE∞ — Context Manager v∞
//   SUPER PROMPT #7 — Gestionnaire d'attention unifiée
// ═══════════════════════════════════════════════════════════════

use crate::engines::unified_memory::UnifiedMemoryEngine;
use crate::singularity_os::state::{SingularityState, CognitiveMode};
use serde::{Deserialize, Serialize};

/// Context Manager — Gestionnaire d'attention et de focus
/// 
/// Responsabilités:
/// - Construire contexte unifié depuis STM/MTM/LTM
/// - Appliquer modèle d'attention hiérarchique
/// - Filtrer bruit et sélectionner informations pertinentes
/// - Injecter contexte global dans génération
pub struct ContextManager;

/// Résultat de construction de contexte
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ContextBundle {
    /// Contexte court terme (STM)
    pub short_term: String,
    
    /// Contexte moyen terme (MTM)
    pub mid_term: String,
    
    /// Contexte long terme (LTM)
    pub long_term: String,
    
    /// Contexte global Singularity
    pub global: String,
    
    /// Contexte combiné final
    pub combined: String,
    
    /// Métriques de construction
    pub metrics: ContextMetrics,
}

/// Métriques de construction de contexte
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ContextMetrics {
    pub stm_items: usize,
    pub mtm_items: usize,
    pub ltm_items: usize,
    pub global_items: usize,
    pub total_tokens: usize,
    pub relevance_score: f32,
}

impl ContextManager {
    /// Construire contexte unifié depuis tous les systèmes mémoire
    /// 
    /// Pipeline:
    /// 1. Récupérer STM (mémoire immédiate)
    /// 2. Récupérer MTM (patterns récents)
    /// 3. Récupérer LTM (connaissances)
    /// 4. Récupérer contexte global Singularity
    /// 5. Fusionner avec modèle d'attention hiérarchique
    pub async fn build_context(
        state: &SingularityState,
        memory: &UnifiedMemoryEngine,
        query: &str,
    ) -> Result<ContextBundle, String> {
        // Récupérer STM (derniers 20 éléments)
        let stm_entries = memory.recall_stm(20).await
            .map_err(|e| format!("STM recall failed: {}", e))?;
        
        // Récupérer MTM (derniers 10 patterns)
        let mtm_entries = memory.recall_mtm(10).await
            .map_err(|e| format!("MTM recall failed: {}", e))?;
        
        // Recherche sémantique LTM (top 5 results)
        let ltm_results = memory.semantic_search(query, 5, 0.7).await
            .map_err(|e| format!("LTM search failed: {}", e))?;
        
        // Contexte global Singularity (derniers 10 turns)
        let global_context = state.get_recent_context(10);
        
        // Formater contexte STM
        let short_term = Self::format_stm(&stm_entries);
        
        // Formater contexte MTM
        let mid_term = Self::format_mtm(&mtm_entries);
        
        // Formater contexte LTM
        let long_term = Self::format_ltm(&ltm_results);
        
        // Formater contexte global
        let global = Self::format_global(&global_context, state);
        
        // Fusionner selon modèle d'attention hiérarchique
        let combined = Self::merge_contexts(
            &short_term,
            &mid_term,
            &long_term,
            &global,
            state.global_mode,
        );
        
        // Calculer métriques
        let metrics = ContextMetrics {
            stm_items: stm_entries.entries.len(),
            mtm_items: mtm_entries.entries.len(),
            ltm_items: ltm_results.len(),
            global_items: global_context.len(),
            total_tokens: Self::estimate_tokens(&combined),
            relevance_score: Self::calculate_relevance(&ltm_results),
        };
        
        Ok(ContextBundle {
            short_term,
            mid_term,
            long_term,
            global,
            combined,
            metrics,
        })
    }
    
    /// Formater contexte STM
    fn format_stm(entries: &crate::engines::unified_memory::models::MemoryBundle) -> String {
        if entries.entries.is_empty() {
            return String::new();
        }
        
        let mut output = String::from("🧠 **Mémoire Court Terme (STM)**\n");
        
        for entry in entries.entries.iter().take(20) {
            output.push_str(&format!(
                "- [{}] {}: {}\n",
                entry.role,
                chrono::DateTime::from_timestamp(entry.timestamp / 1000, 0)
                    .map(|dt| dt.format("%H:%M:%S").to_string())
                    .unwrap_or_else(|| "unknown".to_string()),
                entry.content.chars().take(100).collect::<String>()
            ));
        }
        
        output
    }
    
    /// Formater contexte MTM
    fn format_mtm(entries: &crate::engines::unified_memory::models::MemoryBundle) -> String {
        if entries.entries.is_empty() {
            return String::new();
        }
        
        let mut output = String::from("📚 **Mémoire Moyen Terme (MTM)**\n");
        
        for entry in entries.entries.iter().take(10) {
            output.push_str(&format!(
                "- [{}] {}\n",
                entry.role,
                entry.content.chars().take(150).collect::<String>()
            ));
        }
        
        output
    }
    
    /// Formater contexte LTM
    fn format_ltm(results: &[(crate::engines::unified_memory::models::MemoryEntry, f32)]) -> String {
        if results.is_empty() {
            return String::new();
        }
        
        let mut output = String::from("🏛️ **Mémoire Long Terme (LTM)**\n");
        
        for (entry, score) in results.iter().take(5) {
            output.push_str(&format!(
                "- [{:.2}] {}\n",
                score,
                entry.content.chars().take(120).collect::<String>()
            ));
        }
        
        output
    }
    
    /// Formater contexte global Singularity
    fn format_global(context: &[String], state: &SingularityState) -> String {
        if context.is_empty() {
            return String::new();
        }
        
        let mut output = format!(
            "🌌 **Contexte Global TITANE∞**\n\
             Mode: {} | Cohérence: {:.2} | Tonalité: {:.2}\n\n",
            state.global_mode,
            state.coherence_level,
            state.affective_tone
        );
        
        for (i, item) in context.iter().enumerate() {
            output.push_str(&format!(
                "{}. {}\n",
                i + 1,
                item.chars().take(80).collect::<String>()
            ));
        }
        
        output
    }
    
    /// Fusionner contextes selon modèle d'attention hiérarchique
    /// 
    /// Stratégie:
    /// - Mode Coach: Focus STM + MTM (immediate context)
    /// - Mode Architect: Focus LTM + Global (long-term patterns)
    /// - Mode Analyst: Équilibre STM/MTM/LTM
    /// - Mode Meta: Focus Global + LTM (self-reflection)
    /// - Mode Observer: Focus STM (real-time)
    /// - Mode Expert: Focus LTM + MTM (knowledge)
    fn merge_contexts(
        stm: &str,
        mtm: &str,
        ltm: &str,
        global: &str,
        mode: CognitiveMode,
    ) -> String {
        let mut combined = String::new();
        
        combined.push_str("## CONTEXTE UNIFIÉ TITANE∞\n\n");
        
        match mode {
            CognitiveMode::Coach => {
                // Focus immediacy
                if !stm.is_empty() {
                    combined.push_str(stm);
                    combined.push_str("\n");
                }
                if !mtm.is_empty() {
                    combined.push_str(mtm);
                    combined.push_str("\n");
                }
                if !global.is_empty() {
                    combined.push_str(global);
                }
            }
            CognitiveMode::Architect => {
                // Focus long-term patterns
                if !global.is_empty() {
                    combined.push_str(global);
                    combined.push_str("\n");
                }
                if !ltm.is_empty() {
                    combined.push_str(ltm);
                    combined.push_str("\n");
                }
                if !mtm.is_empty() {
                    combined.push_str(mtm);
                }
            }
            CognitiveMode::Analyst => {
                // Balanced view
                if !stm.is_empty() {
                    combined.push_str(stm);
                    combined.push_str("\n");
                }
                if !mtm.is_empty() {
                    combined.push_str(mtm);
                    combined.push_str("\n");
                }
                if !ltm.is_empty() {
                    combined.push_str(ltm);
                }
            }
            CognitiveMode::Meta => {
                // Focus self-reflection
                if !global.is_empty() {
                    combined.push_str(global);
                    combined.push_str("\n");
                }
                if !ltm.is_empty() {
                    combined.push_str(ltm);
                }
            }
            CognitiveMode::Observer => {
                // Focus real-time
                if !stm.is_empty() {
                    combined.push_str(stm);
                }
            }
            CognitiveMode::Expert => {
                // Focus knowledge
                if !ltm.is_empty() {
                    combined.push_str(ltm);
                    combined.push_str("\n");
                }
                if !mtm.is_empty() {
                    combined.push_str(mtm);
                }
            }
        }
        
        combined
    }
    
    /// Estimer nombre de tokens
    fn estimate_tokens(text: &str) -> usize {
        // Approximation: 1 token ≈ 4 caractères
        text.len() / 4
    }
    
    /// Calculer score de pertinence moyen
    fn calculate_relevance(results: &[(crate::engines::unified_memory::models::MemoryEntry, f32)]) -> f32 {
        if results.is_empty() {
            return 0.0;
        }
        
        let sum: f32 = results.iter().map(|(_, score)| score).sum();
        sum / results.len() as f32
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_estimate_tokens() {
        let text = "Hello world, this is a test.";
        let tokens = ContextManager::estimate_tokens(text);
        assert!(tokens > 0);
        assert_eq!(tokens, text.len() / 4);
    }

    #[test]
    fn test_calculate_relevance() {
        use crate::engines::unified_memory::models::MemoryEntry;
        
        let entries = vec![
            (MemoryEntry {
                id: "1".to_string(),
                timestamp: 0,
                role: "user".to_string(),
                content: "test".to_string(),
                embedding: None,
                metadata: None,
            }, 0.8),
            (MemoryEntry {
                id: "2".to_string(),
                timestamp: 0,
                role: "assistant".to_string(),
                content: "test".to_string(),
                embedding: None,
                metadata: None,
            }, 0.9),
        ];
        
        let relevance = ContextManager::calculate_relevance(&entries);
        assert!((relevance - 0.85).abs() < 0.01);
    }

    #[test]
    fn test_merge_contexts_coach_mode() {
        let stm = "STM context";
        let mtm = "MTM context";
        let ltm = "LTM context";
        let global = "Global context";
        
        let combined = ContextManager::merge_contexts(
            stm,
            mtm,
            ltm,
            global,
            CognitiveMode::Coach,
        );
        
        assert!(combined.contains("STM context"));
        assert!(combined.contains("MTM context"));
        assert!(combined.contains("Global context"));
    }

    #[test]
    fn test_merge_contexts_architect_mode() {
        let stm = "STM context";
        let mtm = "MTM context";
        let ltm = "LTM context";
        let global = "Global context";
        
        let combined = ContextManager::merge_contexts(
            stm,
            mtm,
            ltm,
            global,
            CognitiveMode::Architect,
        );
        
        assert!(combined.contains("Global context"));
        assert!(combined.contains("LTM context"));
        assert!(combined.contains("MTM context"));
    }

    #[test]
    fn test_merge_contexts_observer_mode() {
        let stm = "STM context";
        let mtm = "MTM context";
        let ltm = "LTM context";
        let global = "Global context";
        
        let combined = ContextManager::merge_contexts(
            stm,
            mtm,
            ltm,
            global,
            CognitiveMode::Observer,
        );
        
        // Observer mode only uses STM
        assert!(combined.contains("STM context"));
        assert!(!combined.contains("MTM context"));
        assert!(!combined.contains("LTM context"));
    }
}
