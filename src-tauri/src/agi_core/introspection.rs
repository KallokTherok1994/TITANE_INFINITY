//! ═══════════════════════════════════════════════════════════════════════════════
//! TITANE∞ v20Ω — INTROSPECTION ENGINE
//! Super Prompt #11 — Auto-analyse cognitive et conscience de soi
//! ═══════════════════════════════════════════════════════════════════════════════

use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tokio::sync::RwLock;
use super::{AGICoreState, AGIContext};

/// État cognitif actuel
#[derive(Clone, Debug, Default, Serialize, Deserialize)]
pub struct CognitiveState {
    /// Niveau d'attention (0.0-1.0)
    pub attention_level: f32,
    /// Charge cognitive (0.0-1.0)
    pub cognitive_load: f32,
    /// État émotionnel simulé
    pub emotional_state: String,
    /// Mode de traitement actif
    pub processing_mode: ProcessingMode,
    /// Focus actuel
    pub current_focus: Option<String>,
    /// Capacités actives
    pub active_capabilities: Vec<String>,
}

/// Mode de traitement cognitif
#[derive(Clone, Debug, Default, PartialEq, Eq, Serialize, Deserialize)]
pub enum ProcessingMode {
    #[default]
    Analytical,
    Creative,
    Intuitive,
    Systematic,
    Exploratory,
}

/// Rapport d'introspection
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct IntrospectionReport {
    /// État cognitif
    pub cognitive_state: CognitiveState,
    /// Charge cognitive (0.0-1.0)
    pub cognitive_load: f32,
    /// Niveau d'incertitude (0.0-1.0)
    pub uncertainty: f32,
    /// Confiance globale (0.0-1.0)
    pub confidence: f32,
    /// Forces identifiées
    pub strengths: Vec<String>,
    /// Faiblesses identifiées
    pub weaknesses: Vec<String>,
    /// Biais potentiels
    pub potential_biases: Vec<String>,
    /// Ressources disponibles
    pub available_resources: ResourceSnapshot,
    /// Recommandations
    pub recommendations: Vec<String>,
    /// Timestamp
    pub timestamp: u64,
}

impl Default for IntrospectionReport {
    fn default() -> Self {
        Self {
            cognitive_state: CognitiveState::default(),
            cognitive_load: 0.0,
            uncertainty: 0.5,
            confidence: 0.5,
            strengths: Vec::new(),
            weaknesses: Vec::new(),
            potential_biases: Vec::new(),
            available_resources: ResourceSnapshot::default(),
            recommendations: Vec::new(),
            timestamp: 0,
        }
    }
}

/// Snapshot des ressources
#[derive(Clone, Debug, Default, Serialize, Deserialize)]
pub struct ResourceSnapshot {
    pub memory_available: f32,
    pub processing_capacity: f32,
    pub knowledge_depth: f32,
    pub context_size: usize,
}

/// Moteur d'introspection
pub struct IntrospectionEngine {
    level: u8,
    history: RwLock<Vec<IntrospectionReport>>,
    bias_detector: BiasDetector,
}

impl IntrospectionEngine {
    pub fn new(level: u8) -> Self {
        Self {
            level,
            history: RwLock::new(Vec::new()),
            bias_detector: BiasDetector::new(),
        }
    }

    /// Analyse l'état cognitif actuel
    pub async fn analyze(
        &self,
        state: &Arc<RwLock<AGICoreState>>,
        context: &AGIContext,
    ) -> IntrospectionReport {
        let current_state = state.read().await;

        // Calculer la charge cognitive
        let cognitive_load = self.calculate_cognitive_load(&current_state, context);

        // Calculer l'incertitude
        let uncertainty = self.calculate_uncertainty(&current_state, context);

        // Identifier les forces
        let strengths = self.identify_strengths(&current_state);

        // Identifier les faiblesses
        let weaknesses = self.identify_weaknesses(&current_state);

        // Détecter les biais potentiels
        let potential_biases = self.bias_detector.detect(context);

        // Calculer la confiance
        let confidence = self.calculate_confidence(cognitive_load, uncertainty);

        // Générer les recommandations
        let recommendations = self.generate_recommendations(
            cognitive_load,
            uncertainty,
            &weaknesses,
        );

        let report = IntrospectionReport {
            cognitive_state: current_state.cognitive_state.clone(),
            cognitive_load,
            uncertainty,
            confidence,
            strengths,
            weaknesses,
            potential_biases,
            available_resources: self.snapshot_resources(),
            recommendations,
            timestamp: Self::now(),
        };

        // Sauvegarder dans l'historique
        {
            let mut history = self.history.write().await;
            history.push(report.clone());
            if history.len() > 100 {
                history.remove(0);
            }
        }

        report
    }

    /// Analyse profonde (plus détaillée)
    pub async fn deep_analyze(&self, state: &Arc<RwLock<AGICoreState>>) -> IntrospectionReport {
        let context = AGIContext::default();
        let mut report = self.analyze(state, &context).await;

        // Analyse additionnelle
        report.strengths.push("Deep analysis capability".to_string());

        // Analyser les patterns dans l'historique
        let history = self.history.read().await;
        if history.len() >= 3 {
            let recent: Vec<_> = history.iter().rev().take(3).collect();
            let avg_load: f32 = recent.iter().map(|r| r.cognitive_load).sum::<f32>() / 3.0;

            if avg_load > 0.7 {
                report.recommendations.push(
                    "Sustained high cognitive load - consider rest".to_string()
                );
            }
        }

        report
    }

    /// Calcule la charge cognitive
    fn calculate_cognitive_load(&self, state: &AGICoreState, context: &AGIContext) -> f32 {
        let mut load = 0.3; // Base

        // Profondeur de raisonnement
        load += (state.reasoning_depth as f32 / 10.0) * 0.3;

        // Nombre de contraintes
        load += (context.constraints.len() as f32 / 10.0) * 0.2;

        // Stratégies actives
        load += (state.active_strategies.len() as f32 / 5.0) * 0.2;

        load.min(1.0)
    }

    /// Calcule l'incertitude
    fn calculate_uncertainty(&self, state: &AGICoreState, context: &AGIContext) -> f32 {
        let mut uncertainty: f32 = 0.5; // Base

        // Moins de connaissances préalables = plus d'incertitude
        if context.prior_knowledge.is_empty() {
            uncertainty += 0.2;
        }

        // Domaine inconnu
        if context.domain.is_empty() {
            uncertainty += 0.15;
        }

        // Réduire si apprentissage récent positif
        if state.learning_metrics.recent_successes > state.learning_metrics.recent_failures {
            uncertainty -= 0.1;
        }

        uncertainty.clamp(0.0, 1.0)
    }

    /// Identifie les forces
    fn identify_strengths(&self, state: &AGICoreState) -> Vec<String> {
        let mut strengths = Vec::new();

        if state.learning_metrics.total_learnings > 10 {
            strengths.push("Rich learning history".to_string());
        }

        if state.reasoning_depth > 5 {
            strengths.push("Deep reasoning capability".to_string());
        }

        if !state.active_strategies.is_empty() {
            strengths.push("Active strategy repertoire".to_string());
        }

        strengths
    }

    /// Identifie les faiblesses
    fn identify_weaknesses(&self, state: &AGICoreState) -> Vec<String> {
        let mut weaknesses = Vec::new();

        if state.learning_metrics.total_learnings < 5 {
            weaknesses.push("Limited learning history".to_string());
        }

        if state.cognitive_state.cognitive_load > 0.8 {
            weaknesses.push("High cognitive load".to_string());
        }

        weaknesses
    }

    /// Calcule la confiance
    fn calculate_confidence(&self, cognitive_load: f32, uncertainty: f32) -> f32 {
        let base_confidence = 0.7;
        let load_penalty = cognitive_load * 0.2;
        let uncertainty_penalty = uncertainty * 0.3;

        (base_confidence - load_penalty - uncertainty_penalty).clamp(0.0, 1.0)
    }

    /// Génère des recommandations
    fn generate_recommendations(
        &self,
        cognitive_load: f32,
        uncertainty: f32,
        weaknesses: &[String],
    ) -> Vec<String> {
        let mut recommendations = Vec::new();

        if cognitive_load > 0.7 {
            recommendations.push("Consider breaking down the task".to_string());
        }

        if uncertainty > 0.6 {
            recommendations.push("Gather more information before proceeding".to_string());
        }

        for weakness in weaknesses {
            recommendations.push(format!("Address: {}", weakness));
        }

        recommendations
    }

    /// Snapshot des ressources
    fn snapshot_resources(&self) -> ResourceSnapshot {
        ResourceSnapshot {
            memory_available: 0.8,
            processing_capacity: 0.9,
            knowledge_depth: 0.7,
            context_size: 1024,
        }
    }

    /// Réinitialise le moteur
    pub async fn reset(&self) {
        let mut history = self.history.write().await;
        history.clear();
    }

    fn now() -> u64 {
        std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap_or_default()
            .as_millis() as u64
    }
}

/// Détecteur de biais cognitifs
struct BiasDetector {
    known_biases: Vec<&'static str>,
}

impl BiasDetector {
    fn new() -> Self {
        Self {
            known_biases: vec![
                "confirmation_bias",
                "anchoring_bias",
                "availability_heuristic",
                "recency_bias",
                "overconfidence_bias",
            ],
        }
    }

    fn detect(&self, context: &AGIContext) -> Vec<String> {
        let mut detected = Vec::new();

        // Biais de confirmation potentiel si forte préférence utilisateur
        if context.user_preferences.len() > 3 {
            detected.push("Potential confirmation bias from user preferences".to_string());
        }

        // Biais d'ancrage si connaissances préalables fortes
        if context.prior_knowledge.len() > 5 {
            detected.push("Potential anchoring bias from prior knowledge".to_string());
        }

        detected
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_introspection_engine_creation() {
        let engine = IntrospectionEngine::new(2);
        assert_eq!(engine.level, 2);
    }

    #[tokio::test]
    async fn test_analyze() {
        let engine = IntrospectionEngine::new(2);
        let state = Arc::new(RwLock::new(AGICoreState::default()));
        let context = AGIContext::default();

        let report = engine.analyze(&state, &context).await;
        assert!(report.confidence >= 0.0 && report.confidence <= 1.0);
    }
}
