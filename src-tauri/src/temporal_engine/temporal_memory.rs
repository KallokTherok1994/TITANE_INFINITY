//! ═══════════════════════════════════════════════════════════════════════════════
//! TITANE∞ v20Ω — TEMPORAL MEMORY
//! Super Prompt #18 — Mémoire temporelle et traces
//! ═══════════════════════════════════════════════════════════════════════════════

use serde::{Deserialize, Serialize};
use std::collections::VecDeque;
use tokio::sync::RwLock;

/// Configuration de la mémoire temporelle
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct TemporalMemoryConfig {
    pub max_traces: usize,
    pub decay_rate: f32,
    pub consolidation_threshold: f32,
    pub min_significance: f32,
}

impl Default for TemporalMemoryConfig {
    fn default() -> Self {
        Self {
            max_traces: 10000,
            decay_rate: 0.01,
            consolidation_threshold: 0.7,
            min_significance: 0.1,
        }
    }
}

/// Trace temporelle
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct TemporalTrace {
    pub id: String,
    pub timestamp_ms: u64,
    pub event_type: String,
    pub context: String,
    pub data: serde_json::Value,
    pub significance: f32,
    pub decay: MemoryDecay,
    pub consolidated: bool,
    pub access_count: u32,
    pub last_access_ms: u64,
}

impl TemporalTrace {
    pub fn new(event_type: &str, context: &str, data: serde_json::Value) -> Self {
        let now = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap_or_default()
            .as_millis() as u64;

        Self {
            id: uuid::Uuid::new_v4().to_string(),
            timestamp_ms: now,
            event_type: event_type.to_string(),
            context: context.to_string(),
            data,
            significance: 0.5,
            decay: MemoryDecay::default(),
            consolidated: false,
            access_count: 0,
            last_access_ms: now,
        }
    }

    /// Calcule la force actuelle de la trace
    pub fn current_strength(&self) -> f32 {
        let now = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap_or_default()
            .as_millis() as u64;

        let age_ms = now.saturating_sub(self.timestamp_ms);
        let decay_factor = self.decay.calculate(age_ms);
        let access_bonus = (self.access_count as f32 * 0.05).min(0.3);
        let recency_bonus = if now.saturating_sub(self.last_access_ms) < 3600000 { 0.1 } else { 0.0 };

        (self.significance * decay_factor + access_bonus + recency_bonus).min(1.0)
    }
}

/// Modèle de décroissance mémorielle
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct MemoryDecay {
    pub model: DecayModel,
    pub half_life_ms: u64,
    pub min_retention: f32,
}

impl Default for MemoryDecay {
    fn default() -> Self {
        Self {
            model: DecayModel::Exponential,
            half_life_ms: 86400000, // 1 jour
            min_retention: 0.1,
        }
    }
}

impl MemoryDecay {
    /// Calcule le facteur de rétention pour un âge donné
    pub fn calculate(&self, age_ms: u64) -> f32 {
        match self.model {
            DecayModel::Exponential => {
                let decay = (-0.693 * age_ms as f64 / self.half_life_ms as f64).exp();
                decay.max(self.min_retention as f64) as f32
            }
            DecayModel::PowerLaw => {
                let t = age_ms as f64 / self.half_life_ms as f64 + 1.0;
                let decay = t.powf(-0.5);
                decay.max(self.min_retention as f64) as f32
            }
            DecayModel::Stepwise => {
                let steps = age_ms / self.half_life_ms;
                let decay = 0.5_f32.powi(steps as i32);
                decay.max(self.min_retention)
            }
        }
    }
}

/// Modèle de décroissance
#[derive(Clone, Copy, Debug, Default, PartialEq, Eq, Serialize, Deserialize)]
pub enum DecayModel {
    #[default]
    Exponential,
    PowerLaw,
    Stepwise,
}

/// Mémoire temporelle
pub struct TemporalMemory {
    config: TemporalMemoryConfig,
    traces: RwLock<VecDeque<TemporalTrace>>,
    consolidated: RwLock<Vec<ConsolidatedMemory>>,
    stats: RwLock<MemoryStats>,
}

impl TemporalMemory {
    pub fn new(config: TemporalMemoryConfig) -> Self {
        Self {
            config,
            traces: RwLock::new(VecDeque::new()),
            consolidated: RwLock::new(Vec::new()),
            stats: RwLock::new(MemoryStats::default()),
        }
    }

    /// Enregistre une nouvelle trace
    pub async fn record(&self, trace: TemporalTrace) {
        let mut traces = self.traces.write().await;

        // Éviter les doublons
        if traces.iter().any(|t| t.id == trace.id) {
            return;
        }

        traces.push_back(trace);

        // Limiter la taille
        while traces.len() > self.config.max_traces {
            traces.pop_front();
        }

        // Mettre à jour les stats
        let mut stats = self.stats.write().await;
        stats.total_recorded += 1;
    }

    /// Récupère une trace par ID
    pub async fn get(&self, id: &str) -> Option<TemporalTrace> {
        let mut traces = self.traces.write().await;

        if let Some(trace) = traces.iter_mut().find(|t| t.id == id) {
            trace.access_count += 1;
            trace.last_access_ms = Self::now();
            Some(trace.clone())
        } else {
            None
        }
    }

    /// Recherche des traces par type d'événement
    pub async fn search_by_type(&self, event_type: &str) -> Vec<TemporalTrace> {
        let traces = self.traces.read().await;
        traces.iter()
            .filter(|t| t.event_type == event_type)
            .cloned()
            .collect()
    }

    /// Recherche des traces dans une fenêtre temporelle
    pub async fn search_by_time(&self, start_ms: u64, end_ms: u64) -> Vec<TemporalTrace> {
        let traces = self.traces.read().await;
        traces.iter()
            .filter(|t| t.timestamp_ms >= start_ms && t.timestamp_ms <= end_ms)
            .cloned()
            .collect()
    }

    /// Recherche des traces récentes
    pub async fn recent(&self, count: usize) -> Vec<TemporalTrace> {
        let traces = self.traces.read().await;
        traces.iter()
            .rev()
            .take(count)
            .cloned()
            .collect()
    }

    /// Recherche des traces significatives
    pub async fn significant(&self, threshold: f32) -> Vec<TemporalTrace> {
        let traces = self.traces.read().await;
        traces.iter()
            .filter(|t| t.current_strength() >= threshold)
            .cloned()
            .collect()
    }

    /// Consolide les traces anciennes
    pub async fn consolidate(&self) {
        let mut traces = self.traces.write().await;
        let mut consolidated = self.consolidated.write().await;

        // Identifier les traces à consolider
        let to_consolidate: Vec<_> = traces.iter()
            .filter(|t| !t.consolidated && t.current_strength() >= self.config.consolidation_threshold)
            .cloned()
            .collect();

        if to_consolidate.is_empty() {
            return;
        }

        // Créer une mémoire consolidée
        let memory = ConsolidatedMemory {
            id: uuid::Uuid::new_v4().to_string(),
            created_at: Self::now(),
            source_traces: to_consolidate.iter().map(|t| t.id.clone()).collect(),
            summary: format!("Consolidated {} traces", to_consolidate.len()),
            patterns: self.extract_patterns(&to_consolidate),
            significance: to_consolidate.iter().map(|t| t.significance).sum::<f32>() / to_consolidate.len() as f32,
        };

        consolidated.push(memory);

        // Marquer les traces comme consolidées
        for trace in traces.iter_mut() {
            if to_consolidate.iter().any(|t| t.id == trace.id) {
                trace.consolidated = true;
            }
        }

        let mut stats = self.stats.write().await;
        stats.consolidations += 1;
    }

    /// Nettoie les traces faibles
    pub async fn cleanup(&self) {
        let mut traces = self.traces.write().await;

        let before_count = traces.len();
        traces.retain(|t| t.current_strength() >= self.config.min_significance);
        let removed = before_count - traces.len();

        let mut stats = self.stats.write().await;
        stats.cleaned_up += removed as u64;
    }

    /// Extrait des patterns des traces
    fn extract_patterns(&self, traces: &[TemporalTrace]) -> Vec<Pattern> {
        let mut patterns = Vec::new();

        // Pattern de fréquence par type d'événement
        let mut type_counts: std::collections::HashMap<String, u32> = std::collections::HashMap::new();
        for trace in traces {
            *type_counts.entry(trace.event_type.clone()).or_insert(0) += 1;
        }

        for (event_type, count) in type_counts {
            if count >= 3 {
                patterns.push(Pattern {
                    pattern_type: "frequency".to_string(),
                    description: format!("{} occurred {} times", event_type, count),
                    confidence: (count as f32 / traces.len() as f32).min(1.0),
                });
            }
        }

        patterns
    }

    /// Statistiques de la mémoire
    pub async fn stats(&self) -> MemoryStats {
        let traces = self.traces.read().await;
        let consolidated = self.consolidated.read().await;
        let stats = self.stats.read().await;

        MemoryStats {
            total_traces: traces.len(),
            consolidated_memories: consolidated.len(),
            average_strength: traces.iter().map(|t| t.current_strength()).sum::<f32>()
                / traces.len().max(1) as f32,
            total_recorded: stats.total_recorded,
            consolidations: stats.consolidations,
            cleaned_up: stats.cleaned_up,
        }
    }

    fn now() -> u64 {
        std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap_or_default()
            .as_millis() as u64
    }
}

impl Default for TemporalMemory {
    fn default() -> Self {
        Self::new(TemporalMemoryConfig::default())
    }
}

/// Mémoire consolidée
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct ConsolidatedMemory {
    pub id: String,
    pub created_at: u64,
    pub source_traces: Vec<String>,
    pub summary: String,
    pub patterns: Vec<Pattern>,
    pub significance: f32,
}

/// Pattern extrait
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Pattern {
    pub pattern_type: String,
    pub description: String,
    pub confidence: f32,
}

/// Statistiques de la mémoire
#[derive(Clone, Debug, Default, Serialize, Deserialize)]
pub struct MemoryStats {
    pub total_traces: usize,
    pub consolidated_memories: usize,
    pub average_strength: f32,
    pub total_recorded: u64,
    pub consolidations: u64,
    pub cleaned_up: u64,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_memory_decay() {
        let decay = MemoryDecay::default();
        let factor = decay.calculate(0);
        assert!((factor - 1.0).abs() < 0.01);
    }

    #[tokio::test]
    async fn test_temporal_memory() {
        let memory = TemporalMemory::default();
        let trace = TemporalTrace::new("test", "context", serde_json::json!({}));
        memory.record(trace).await;

        let stats = memory.stats().await;
        assert_eq!(stats.total_recorded, 1);
    }
}
