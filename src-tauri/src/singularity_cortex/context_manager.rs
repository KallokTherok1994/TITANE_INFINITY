// ═══════════════════════════════════════════════════════════════
//   TITANE∞ — Context Manager v∞
//   Gestionnaire d'attention unifiée
// ═══════════════════════════════════════════════════════════════

use crate::engines::unified_memory::UnifiedMemoryEngine;
use crate::singularity_cortex::state::{CognitiveMode, SingularityState};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ContextBundle {
    pub short_term: String,
    pub mid_term: String,
    pub long_term: String,
    pub global: String,
    pub combined: String,
    pub metrics: ContextMetrics,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ContextMetrics {
    pub stm_items: usize,
    pub mtm_items: usize,
    pub ltm_items: usize,
    pub global_items: usize,
    pub total_tokens: usize,
    pub relevance_score: f32,
}

pub struct ContextManager;

impl ContextManager {
    pub async fn build_context(
        state: &SingularityState,
        memory: &mut UnifiedMemoryEngine,
        query: &str,
    ) -> Result<ContextBundle, String> {
        // Recall all memories (STM + MTM + LTM)
        let bundle = memory
            .recall(query, 10)
            .await
            .map_err(|e| format!("Memory recall failed: {}", e))?;

        let global_context = state.get_recent_context(10);

        let short_term = Self::format_entries(&bundle.stm, "STM");
        let mid_term = Self::format_entries(&bundle.mtm, "MTM");
        let long_term = Self::format_entries(&bundle.ltm, "LTM");
        let global = Self::format_global(&global_context, state);

        let combined = Self::merge_contexts(
            &short_term,
            &mid_term,
            &long_term,
            &global,
            state.global_mode,
        );

        let metrics = ContextMetrics {
            stm_items: bundle.stm.len(),
            mtm_items: bundle.mtm.len(),
            ltm_items: bundle.ltm.len(),
            global_items: global_context.len(),
            total_tokens: Self::estimate_tokens(&combined),
            relevance_score: 0.8,
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

    fn format_entries(
        entries: &[crate::engines::unified_memory::models::MemoryEntry],
        label: &str,
    ) -> String {
        if entries.is_empty() {
            return String::new();
        }

        let emoji = match label {
            "STM" => "🧠",
            "MTM" => "📚",
            "LTM" => "🏛️",
            _ => "📝",
        };

        let mut output = format!("{} **Mémoire {} **\n", emoji, label);
        for entry in entries.iter().take(10) {
            output.push_str(&format!(
                "- [{}] {}\n",
                entry.role,
                entry.content.chars().take(100).collect::<String>()
            ));
        }
        output
    }

    fn format_global(context: &[String], state: &SingularityState) -> String {
        if context.is_empty() {
            return String::new();
        }

        format!(
            "🌌 **Contexte Global TITANE∞**\nMode: {} | Cohérence: {:.2} | Tonalité: {:.2}\n\n{}\n",
            state.global_mode,
            state.coherence_level,
            state.affective_tone,
            context
                .iter()
                .enumerate()
                .map(|(i, item)| format!(
                    "{}. {}",
                    i + 1,
                    item.chars().take(80).collect::<String>()
                ))
                .collect::<Vec<_>>()
                .join("\n")
        )
    }

    fn merge_contexts(
        stm: &str,
        mtm: &str,
        ltm: &str,
        global: &str,
        mode: CognitiveMode,
    ) -> String {
        let mut combined = String::from("## CONTEXTE UNIFIÉ TITANE∞\n\n");

        match mode {
            CognitiveMode::Coach => {
                if !stm.is_empty() {
                    combined.push_str(stm);
                    combined.push('\n');
                }
                if !mtm.is_empty() {
                    combined.push_str(mtm);
                    combined.push('\n');
                }
                if !global.is_empty() {
                    combined.push_str(global);
                }
            }
            CognitiveMode::Architect => {
                if !global.is_empty() {
                    combined.push_str(global);
                    combined.push('\n');
                }
                if !ltm.is_empty() {
                    combined.push_str(ltm);
                    combined.push('\n');
                }
                if !mtm.is_empty() {
                    combined.push_str(mtm);
                }
            }
            CognitiveMode::Analyst => {
                if !stm.is_empty() {
                    combined.push_str(stm);
                    combined.push('\n');
                }
                if !mtm.is_empty() {
                    combined.push_str(mtm);
                    combined.push('\n');
                }
                if !ltm.is_empty() {
                    combined.push_str(ltm);
                }
            }
            CognitiveMode::Meta => {
                if !global.is_empty() {
                    combined.push_str(global);
                    combined.push('\n');
                }
                if !ltm.is_empty() {
                    combined.push_str(ltm);
                }
            }
            CognitiveMode::Observer => {
                if !stm.is_empty() {
                    combined.push_str(stm);
                }
            }
            CognitiveMode::Expert => {
                if !ltm.is_empty() {
                    combined.push_str(ltm);
                    combined.push('\n');
                }
                if !mtm.is_empty() {
                    combined.push_str(mtm);
                }
            }
        }

        combined
    }

    fn estimate_tokens(text: &str) -> usize {
        text.len() / 4
    }
}
