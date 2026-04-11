// TITANE∞ v30.0.0 - Memory Bridge
use crate::core::modules::unified_memory::{MemoryItem, MemoryType, UnifiedMemory};
use serde_json::{json, Value};
use std::collections::HashSet;

pub struct MemoryBridge {
    default_importance: f32,
    recall_limit: usize,
}

impl MemoryBridge {
    pub fn new() -> Self {
        Self {
            default_importance: 0.86,
            recall_limit: 6,
        }
    }

    pub fn store_numeric_twin_state(
        &self,
        memory: &mut UnifiedMemory,
        scope: &str,
        fusion_score: f32,
        trend: &str,
        phase: &str,
        sync_score: f32,
        owner_themes: &[&str],
        details: Value,
    ) -> Result<String, String> {
        self.ensure_memory_ready(memory)?;

        let scope_token = Self::normalize_token(scope);
        let phase_token = Self::normalize_token(phase);
        let trend_token = Self::normalize_token(trend);

        let mut tags = vec![
            "twins".to_string(),
            "numeric_twin".to_string(),
            "symbiose".to_string(),
            "kevin_thibault".to_string(),
            scope_token.clone(),
            phase_token.clone(),
            trend_token.clone(),
        ];

        for theme in owner_themes {
            let normalized = Self::normalize_token(theme);
            if !normalized.is_empty() {
                tags.push(normalized);
            }
        }

        tags.sort();
        tags.dedup();

        let record = json!({
            "kind": "twins_memory_snapshot",
            "owner": "Kevin Thibault",
            "scope": scope,
            "fusionScore": fusion_score,
            "trend": trend,
            "phase": phase,
            "syncScore": sync_score,
            "ownerThemes": owner_themes,
            "details": details,
        });

        let content = format!(
            "TWIN_MEMORY_SNAPSHOT\nowner=Kevin Thibault\nscope={scope}\nfusion_score={fusion_score:.2}\ntrend={trend}\nphase={phase}\nsync_score={sync_score:.2}\nowner_themes={}\nrecord={} ",
            owner_themes.join(", "),
            serde_json::to_string_pretty(&record)
                .map_err(|error| format!("Failed to serialize twin memory record: {error}"))?
        );

        let memory_type = if scope_token.contains("phase")
            || scope_token.contains("evolution")
            || scope_token.contains("validation")
        {
            MemoryType::Event
        } else {
            MemoryType::Knowledge
        };

        let importance = fusion_score
            .max(sync_score)
            .max(self.default_importance)
            .clamp(0.0, 0.98);

        memory
            .store(content, memory_type, importance, tags)
            .map_err(|error| format!("Failed to store twin memory snapshot: {error}"))
    }

    pub fn recall_twin_memories(
        &self,
        memory: &mut UnifiedMemory,
        query: &str,
        limit: usize,
    ) -> Result<Vec<MemoryItem>, String> {
        self.ensure_memory_ready(memory)?;

        let effective_limit = if limit == 0 {
            self.recall_limit
        } else {
            limit.min(12)
        };

        let mut query_tokens = vec![
            "twins".to_string(),
            "symbiose".to_string(),
            "kevin".to_string(),
        ];
        query_tokens.extend(
            query
                .split_whitespace()
                .map(Self::normalize_token)
                .filter(|token| !token.is_empty()),
        );

        let mut seen_ids = HashSet::new();
        let mut collected = Vec::new();

        for token in query_tokens {
            for item in memory.recall(&token, effective_limit * 2) {
                if Self::is_twin_memory(&item) && seen_ids.insert(item.id.clone()) {
                    collected.push(item);
                    if collected.len() >= effective_limit {
                        return Ok(collected);
                    }
                }
            }
        }

        Ok(collected)
    }

    fn ensure_memory_ready(&self, memory: &mut UnifiedMemory) -> Result<(), String> {
        memory
            .init()
            .map_err(|error| format!("Failed to initialize UnifiedMemory for TWINS: {error}"))
    }

    fn is_twin_memory(item: &MemoryItem) -> bool {
        item.content.contains("TWIN_MEMORY_SNAPSHOT")
            || item.tags.iter().any(|tag| {
                matches!(
                    tag.as_str(),
                    "twins" | "numeric_twin" | "symbiose" | "kevin_thibault"
                )
            })
    }

    fn normalize_token(value: &str) -> String {
        let mut output = String::new();

        for ch in value.trim().chars() {
            if ch.is_alphanumeric() {
                output.push(ch.to_ascii_lowercase());
            } else if (ch.is_whitespace() || ch == '-' || ch == '_') && !output.ends_with('-') {
                output.push('-');
            }
        }

        output.trim_matches('-').to_string()
    }
}

impl Default for MemoryBridge {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    #[test]
    fn stores_and_recalls_numeric_twin_memories() {
        let mut memory = UnifiedMemory::new();
        let bridge = MemoryBridge::new();

        let store_result = bridge.store_numeric_twin_state(
            &mut memory,
            "phase_transition",
            0.91,
            "Improving",
            "Symbiosis",
            0.88,
            &["kevin", "symbiose", "authenticité"],
            json!({
                "owner": "Kevin Thibault",
                "reflectionAxis": "clarté intérieure"
            }),
        );

        assert!(
            store_result.is_ok(),
            "store should succeed once implemented"
        );

        let recalled = bridge
            .recall_twin_memories(&mut memory, "Kevin symbiose clarté", 5)
            .expect("recall should succeed once implemented");

        assert!(
            !recalled.is_empty(),
            "stored twin memory should be recallable"
        );
        assert!(
            recalled[0].content.contains("Kevin Thibault"),
            "recalled content should preserve owner context"
        );
    }
}
