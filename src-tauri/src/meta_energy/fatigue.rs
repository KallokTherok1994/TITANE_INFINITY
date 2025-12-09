//! ═══════════════════════════════════════════════════════════════════════════════
//! TITANE∞ v20Ω — FATIGUE TRACKING
//! Super Prompt #20 — Suivi et gestion de la fatigue cognitive
//! ═══════════════════════════════════════════════════════════════════════════════

use serde::{Deserialize, Serialize};
use tokio::sync::RwLock;
use std::collections::{HashMap, VecDeque};
use super::energy_model::EnergyDimension;

/// Source de fatigue
#[derive(Clone, Debug, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum FatigueSource {
    /// Charge cognitive prolongée
    CognitiveLoad,
    /// Répétition de tâches
    TaskRepetition,
    /// Manque de variété
    LackOfVariety,
    /// Surcharge d'information
    InformationOverload,
    /// Pression temporelle
    TimePressure,
    /// Erreurs répétées
    RepeatedErrors,
    /// Interruptions fréquentes
    FrequentInterruptions,
    /// Manque de récupération
    InsufficientRecovery,
    /// Complexité élevée
    HighComplexity,
    /// Durée de session
    SessionDuration,
}

/// Niveau de fatigue
#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub enum FatigueLevel {
    /// Fraîcheur totale
    Fresh,
    /// Légère fatigue
    Mild,
    /// Fatigue modérée
    Moderate,
    /// Fatigue significative
    Significant,
    /// Fatigue sévère
    Severe,
    /// Épuisement
    Exhausted,
}

impl FatigueLevel {
    pub fn from_value(value: f32) -> Self {
        match value {
            v if v < 0.15 => Self::Fresh,
            v if v < 0.30 => Self::Mild,
            v if v < 0.50 => Self::Moderate,
            v if v < 0.70 => Self::Significant,
            v if v < 0.85 => Self::Severe,
            _ => Self::Exhausted,
        }
    }

    pub fn to_value(&self) -> f32 {
        match self {
            Self::Fresh => 0.05,
            Self::Mild => 0.22,
            Self::Moderate => 0.40,
            Self::Significant => 0.60,
            Self::Severe => 0.78,
            Self::Exhausted => 0.95,
        }
    }

    pub fn description(&self) -> &'static str {
        match self {
            Self::Fresh => "Fully refreshed and ready",
            Self::Mild => "Slightly tired but functional",
            Self::Moderate => "Noticeably fatigued",
            Self::Significant => "Performance impacted",
            Self::Severe => "Strongly recommend rest",
            Self::Exhausted => "Critical - rest required",
        }
    }
}

/// Événement de fatigue
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct FatigueEvent {
    pub timestamp: u64,
    pub source: FatigueSource,
    pub impact: f32,
    pub dimension: Option<EnergyDimension>,
    pub context: String,
}

/// État de fatigue par dimension
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct DimensionFatigue {
    pub dimension: EnergyDimension,
    pub current_level: f32,
    pub peak_level: f32,
    pub accumulated: f32,
    pub last_rest: u64,
    pub recovery_rate: f32,
}

impl DimensionFatigue {
    pub fn new(dimension: EnergyDimension) -> Self {
        Self {
            dimension,
            current_level: 0.0,
            peak_level: 0.0,
            accumulated: 0.0,
            last_rest: Self::now(),
            recovery_rate: 0.01,
        }
    }

    /// Ajoute de la fatigue
    pub fn add(&mut self, amount: f32) {
        self.current_level = (self.current_level + amount).min(1.0);
        self.accumulated += amount;

        if self.current_level > self.peak_level {
            self.peak_level = self.current_level;
        }
    }

    /// Récupération naturelle
    pub fn recover(&mut self, duration_ms: u64) {
        let recovery = self.recovery_rate * (duration_ms as f32 / 60000.0);
        self.current_level = (self.current_level - recovery).max(0.0);
        self.last_rest = Self::now();
    }

    /// Réinitialise après un repos complet
    pub fn reset(&mut self) {
        self.current_level = 0.0;
        self.peak_level = 0.0;
        self.last_rest = Self::now();
    }

    fn now() -> u64 {
        std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap_or_default()
            .as_millis() as u64
    }
}

/// Gestionnaire de fatigue
pub struct FatigueTracker {
    dimensions: RwLock<HashMap<EnergyDimension, DimensionFatigue>>,
    events: RwLock<VecDeque<FatigueEvent>>,
    max_events: usize,
    global_fatigue: RwLock<f32>,
    session_start: u64,
    config: FatigueConfig,
}

impl FatigueTracker {
    pub fn new() -> Self {
        let mut dimensions = HashMap::new();
        for dim in [
            EnergyDimension::Cognitive,
            EnergyDimension::Creative,
            EnergyDimension::Social,
            EnergyDimension::Executive,
            EnergyDimension::Memory,
            EnergyDimension::Sensory,
            EnergyDimension::Physical,
        ] {
            dimensions.insert(dim, DimensionFatigue::new(dim));
        }

        Self {
            dimensions: RwLock::new(dimensions),
            events: RwLock::new(VecDeque::new()),
            max_events: 1000,
            global_fatigue: RwLock::new(0.0),
            session_start: Self::now(),
            config: FatigueConfig::default(),
        }
    }

    /// Enregistre un événement de fatigue
    pub async fn record(&self, source: FatigueSource, impact: f32, dimension: Option<EnergyDimension>) {
        let event = FatigueEvent {
            timestamp: Self::now(),
            source: source.clone(),
            impact,
            dimension,
            context: String::new(),
        };

        // Ajouter l'événement
        let mut events = self.events.write().await;
        events.push_back(event);
        while events.len() > self.max_events {
            events.pop_front();
        }
        drop(events);

        // Appliquer l'impact
        if let Some(dim) = dimension {
            let mut dimensions = self.dimensions.write().await;
            if let Some(df) = dimensions.get_mut(&dim) {
                df.add(impact);
            }
        }

        // Mettre à jour la fatigue globale
        self.update_global().await;
    }

    /// Calcule l'impact d'une source de fatigue
    pub fn calculate_impact(&self, source: &FatigueSource, intensity: f32) -> f32 {
        let base_impact = match source {
            FatigueSource::CognitiveLoad => 0.08,
            FatigueSource::TaskRepetition => 0.05,
            FatigueSource::LackOfVariety => 0.04,
            FatigueSource::InformationOverload => 0.10,
            FatigueSource::TimePressure => 0.07,
            FatigueSource::RepeatedErrors => 0.12,
            FatigueSource::FrequentInterruptions => 0.06,
            FatigueSource::InsufficientRecovery => 0.15,
            FatigueSource::HighComplexity => 0.09,
            FatigueSource::SessionDuration => 0.03,
        };

        base_impact * intensity
    }

    /// Met à jour la fatigue globale
    async fn update_global(&self) {
        let dimensions = self.dimensions.read().await;

        let total: f32 = dimensions.values()
            .map(|df| df.current_level * self.config.dimension_weights.get(&df.dimension).unwrap_or(&1.0))
            .sum();

        let count = dimensions.len() as f32;
        let avg = total / count;

        // Facteur de durée de session
        let session_duration = Self::now() - self.session_start;
        let duration_factor = (session_duration as f32 / (4.0 * 3600.0 * 1000.0)).min(0.3); // Max +0.3 après 4h

        *self.global_fatigue.write().await = (avg + duration_factor).min(1.0);
    }

    /// Applique une récupération
    pub async fn apply_recovery(&self, dimension: Option<EnergyDimension>, duration_ms: u64) {
        let mut dimensions = self.dimensions.write().await;

        match dimension {
            Some(dim) => {
                if let Some(df) = dimensions.get_mut(&dim) {
                    df.recover(duration_ms);
                }
            }
            None => {
                for df in dimensions.values_mut() {
                    df.recover(duration_ms);
                }
            }
        }

        drop(dimensions);
        self.update_global().await;
    }

    /// Réinitialise la fatigue (après un repos complet)
    pub async fn reset(&self) {
        let mut dimensions = self.dimensions.write().await;
        for df in dimensions.values_mut() {
            df.reset();
        }
        drop(dimensions);

        *self.global_fatigue.write().await = 0.0;
    }

    /// Obtient le niveau de fatigue global
    pub async fn global_level(&self) -> f32 {
        *self.global_fatigue.read().await
    }

    /// Obtient le niveau de fatigue d'une dimension
    pub async fn dimension_level(&self, dimension: EnergyDimension) -> f32 {
        let dimensions = self.dimensions.read().await;
        dimensions.get(&dimension)
            .map(|df| df.current_level)
            .unwrap_or(0.0)
    }

    /// Obtient l'état de fatigue complet
    pub async fn get_state(&self) -> FatigueState {
        let global = *self.global_fatigue.read().await;
        let dimensions = self.dimensions.read().await;

        let dimension_levels: HashMap<EnergyDimension, f32> = dimensions.iter()
            .map(|(k, v)| (*k, v.current_level))
            .collect();

        let most_fatigued = dimensions.values()
            .max_by(|a, b| a.current_level.partial_cmp(&b.current_level).unwrap_or(std::cmp::Ordering::Equal))
            .map(|df| df.dimension);

        FatigueState {
            global_level: global,
            level: FatigueLevel::from_value(global),
            dimension_levels,
            most_fatigued,
            session_duration_ms: Self::now() - self.session_start,
            needs_rest: global > 0.7,
        }
    }

    /// Analyse les patterns de fatigue
    pub async fn analyze_patterns(&self) -> Vec<FatiguePattern> {
        let events = self.events.read().await;
        let mut patterns = Vec::new();

        // Compter par source
        let mut source_counts: HashMap<FatigueSource, u32> = HashMap::new();
        for event in events.iter() {
            *source_counts.entry(event.source.clone()).or_insert(0) += 1;
        }

        // Identifier les sources principales
        for (source, count) in source_counts {
            if count >= 5 {
                patterns.push(FatiguePattern {
                    pattern_type: "frequent_source".to_string(),
                    source: Some(source.clone()),
                    frequency: count,
                    recommendation: self.get_recommendation(&source),
                });
            }
        }

        patterns
    }

    /// Recommandation pour une source de fatigue
    fn get_recommendation(&self, source: &FatigueSource) -> String {
        match source {
            FatigueSource::CognitiveLoad => "Simplifier les tâches ou faire des pauses régulières".to_string(),
            FatigueSource::TaskRepetition => "Varier les types de tâches".to_string(),
            FatigueSource::LackOfVariety => "Introduire de nouvelles activités".to_string(),
            FatigueSource::InformationOverload => "Filtrer l'information, traiter par lots".to_string(),
            FatigueSource::TimePressure => "Revoir les délais ou prioriser".to_string(),
            FatigueSource::RepeatedErrors => "Analyser les causes, ajuster l'approche".to_string(),
            FatigueSource::FrequentInterruptions => "Créer des périodes de focus protégées".to_string(),
            FatigueSource::InsufficientRecovery => "Planifier des temps de repos".to_string(),
            FatigueSource::HighComplexity => "Décomposer en sous-tâches plus simples".to_string(),
            FatigueSource::SessionDuration => "Faire des pauses régulières".to_string(),
        }
    }

    /// Événements récents
    pub async fn recent_events(&self, count: usize) -> Vec<FatigueEvent> {
        let events = self.events.read().await;
        events.iter().rev().take(count).cloned().collect()
    }

    fn now() -> u64 {
        std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap_or_default()
            .as_millis() as u64
    }
}

impl Default for FatigueTracker {
    fn default() -> Self {
        Self::new()
    }
}

/// Configuration de la fatigue
#[derive(Clone, Debug)]
pub struct FatigueConfig {
    pub dimension_weights: HashMap<EnergyDimension, f32>,
    pub recovery_rate_base: f32,
    pub session_fatigue_rate: f32,
}

impl Default for FatigueConfig {
    fn default() -> Self {
        let mut weights = HashMap::new();
        weights.insert(EnergyDimension::Cognitive, 1.2);
        weights.insert(EnergyDimension::Creative, 1.1);
        weights.insert(EnergyDimension::Social, 0.9);
        weights.insert(EnergyDimension::Executive, 1.0);
        weights.insert(EnergyDimension::Memory, 1.0);
        weights.insert(EnergyDimension::Sensory, 0.8);
        weights.insert(EnergyDimension::Physical, 0.9);

        Self {
            dimension_weights: weights,
            recovery_rate_base: 0.01,
            session_fatigue_rate: 0.001,
        }
    }
}

/// État de fatigue complet
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct FatigueState {
    pub global_level: f32,
    pub level: FatigueLevel,
    pub dimension_levels: HashMap<EnergyDimension, f32>,
    pub most_fatigued: Option<EnergyDimension>,
    pub session_duration_ms: u64,
    pub needs_rest: bool,
}

/// Pattern de fatigue détecté
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct FatiguePattern {
    pub pattern_type: String,
    pub source: Option<FatigueSource>,
    pub frequency: u32,
    pub recommendation: String,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_fatigue_level() {
        assert_eq!(FatigueLevel::from_value(0.0), FatigueLevel::Fresh);
        assert_eq!(FatigueLevel::from_value(0.5), FatigueLevel::Moderate);
        assert_eq!(FatigueLevel::from_value(0.95), FatigueLevel::Exhausted);
    }

    #[tokio::test]
    async fn test_fatigue_tracker() {
        let tracker = FatigueTracker::new();
        tracker.record(FatigueSource::CognitiveLoad, 0.2, Some(EnergyDimension::Cognitive)).await;

        let level = tracker.dimension_level(EnergyDimension::Cognitive).await;
        assert!(level > 0.0);
    }
}
