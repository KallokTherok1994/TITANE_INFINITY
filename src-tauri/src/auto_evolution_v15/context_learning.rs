// 🔮 Context Learning — Analyse contextuelle avancée
// Cycles, énergie, état émotionnel, logique décisionnelle, détection prédictive

use serde::{Deserialize, Serialize};
use std::collections::VecDeque;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ContextSnapshot {
    pub timestamp: String,
    pub emotional_state: f32,
    pub cognitive_load: f32,
    pub energy_level: f32,
    pub clarity_level: f32,
    pub stress_level: f32,
    pub context_label: String,
}

pub struct ContextAnalyzer {
    history: VecDeque<ContextSnapshot>,
    max_history: usize,
}

impl ContextAnalyzer {
    pub fn new() -> Self {
        Self {
            history: VecDeque::new(),
            max_history: 100, // Garder les 100 dernières observations
        }
    }

    /// Analyser le contexte actuel et le sauvegarder
    pub fn analyze_context(&mut self, metrics: &super::KevinMetrics) -> String {
        let snapshot = ContextSnapshot {
            timestamp: chrono::Utc::now().to_rfc3339(),
            emotional_state: metrics.emotional_state,
            cognitive_load: metrics.cognitive_load,
            energy_level: metrics.energy_level,
            clarity_level: metrics.clarity_level,
            stress_level: metrics.stress_level,
            context_label: self.label_context(metrics),
        };

        self.history.push_back(snapshot.clone());

        if self.history.len() > self.max_history {
            self.history.pop_front();
        }

        snapshot.context_label
    }

    fn label_context(&self, metrics: &super::KevinMetrics) -> String {
        // Contexte émotionnel
        if metrics.stress_level > 0.7 {
            return "stress-élevé".to_string();
        }

        if metrics.emotional_state < -0.5 {
            return "phase-difficile".to_string();
        }

        // Contexte cognitif
        if metrics.cognitive_load > 0.8 {
            return "surcharge-cognitive".to_string();
        }

        if metrics.clarity_level < 0.3 {
            return "confusion".to_string();
        }

        // Contexte énergétique
        if metrics.energy_level < 0.3 {
            return "épuisement".to_string();
        }

        if metrics.energy_level > 0.8 && metrics.clarity_level > 0.7 {
            return "état-optimal".to_string();
        }

        // Contexte créatif
        if metrics.creativity_level > 0.7 {
            return "inspiration".to_string();
        }

        // Contexte de focus
        if metrics.focus_level > 0.8 {
            return "hyper-focus".to_string();
        }

        "état-normal".to_string()
    }

    /// Détecter les cycles (tendances sur les dernières observations)
    pub fn detect_cycles(&self) -> Vec<String> {
        let mut cycles = Vec::new();

        if self.history.len() < 10 {
            return cycles;
        }

        let recent: Vec<&ContextSnapshot> = self.history.iter().rev().take(10).collect();

        // Détecter tendance énergie
        let energy_trend = self.calculate_trend(&recent, |s| s.energy_level);
        if energy_trend < -0.2 {
            cycles.push("⚠️ Énergie en baisse continue".to_string());
        } else if energy_trend > 0.2 {
            cycles.push("📈 Énergie en hausse".to_string());
        }

        // Détecter tendance stress
        let stress_trend = self.calculate_trend(&recent, |s| s.stress_level);
        if stress_trend > 0.2 {
            cycles.push("⚠️ Stress en hausse — Pause recommandée".to_string());
        }

        // Détecter tendance clarté
        let clarity_trend = self.calculate_trend(&recent, |s| s.clarity_level);
        if clarity_trend < -0.2 {
            cycles.push("🌫️ Clarté en baisse — Mode Coach recommandé".to_string());
        }

        cycles
    }

    fn calculate_trend<F>(&self, snapshots: &[&ContextSnapshot], extractor: F) -> f32
    where
        F: Fn(&ContextSnapshot) -> f32,
    {
        if snapshots.len() < 2 {
            return 0.0;
        }

        let first = extractor(snapshots.last().unwrap());
        let last = extractor(snapshots.first().unwrap());

        last - first
    }

    /// Prédire l'état futur (simple extrapolation)
    pub fn predict_future_state(&self) -> Option<String> {
        let cycles = self.detect_cycles();

        if cycles.iter().any(|c| c.contains("Stress en hausse")) {
            return Some("🔮 Prédiction : Risque de surcharge dans 10-15min".to_string());
        }

        if cycles.iter().any(|c| c.contains("Énergie en baisse")) {
            return Some("🔮 Prédiction : Baisse d'énergie imminente — Repos conseillé".to_string());
        }

        None
    }

    /// Obtenir l'historique récent
    pub fn get_recent_history(&self, count: usize) -> Vec<ContextSnapshot> {
        self.history.iter().rev().take(count).cloned().collect()
    }
}

impl Default for ContextAnalyzer {
    fn default() -> Self {
        Self::new()
    }
}
