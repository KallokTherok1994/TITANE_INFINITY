//! ═══════════════════════════════════════════════════════════════════════════════
//! TITANE∞ v20Ω — AGENT CAPABILITIES
//! Super Prompt #19 — Capacités des agents
//! ═══════════════════════════════════════════════════════════════════════════════

use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// Capacité d'un agent
#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum Capability {
    // Recherche & Extraction
    WebSearch,
    DocumentAnalysis,
    DataExtraction,
    ImageRecognition,

    // Génération
    TextGeneration,
    CodeGeneration,
    ImageDescription,
    Summarization,

    // Analyse
    DataAnalysis,
    PatternRecognition,
    SentimentAnalysis,
    TrendAnalysis,

    // Communication
    NaturalLanguage,
    Translation,
    Formatting,

    // Planning & Coordination
    TaskPlanning,
    ResourceAllocation,
    PriorityManagement,
    Scheduling,

    // Sécurité
    ThreatDetection,
    AccessControl,
    AuditLogging,
    Encryption,

    // Système
    SystemMonitoring,
    ErrorRecovery,
    PerformanceOptimization,
    CacheManagement,

    // Spécialisées
    MathComputation,
    LogicalReasoning,
    CreativeProblemSolving,
    DecisionMaking,
}

impl Capability {
    /// Description de la capacité
    pub fn description(&self) -> &str {
        match self {
            Self::WebSearch => "Search and retrieve information from the web",
            Self::DocumentAnalysis => "Analyze and extract information from documents",
            Self::DataExtraction => "Extract structured data from various sources",
            Self::ImageRecognition => "Recognize and describe visual content",
            Self::TextGeneration => "Generate natural language text",
            Self::CodeGeneration => "Generate source code",
            Self::ImageDescription => "Describe images in detail",
            Self::Summarization => "Summarize long content",
            Self::DataAnalysis => "Analyze datasets and find insights",
            Self::PatternRecognition => "Identify patterns in data",
            Self::SentimentAnalysis => "Analyze emotional tone",
            Self::TrendAnalysis => "Identify and analyze trends",
            Self::NaturalLanguage => "Process and understand natural language",
            Self::Translation => "Translate between languages",
            Self::Formatting => "Format content for various outputs",
            Self::TaskPlanning => "Plan and organize tasks",
            Self::ResourceAllocation => "Allocate resources efficiently",
            Self::PriorityManagement => "Manage priorities",
            Self::Scheduling => "Schedule activities and events",
            Self::ThreatDetection => "Detect security threats",
            Self::AccessControl => "Manage access control",
            Self::AuditLogging => "Log and audit activities",
            Self::Encryption => "Encrypt and decrypt data",
            Self::SystemMonitoring => "Monitor system health",
            Self::ErrorRecovery => "Recover from errors",
            Self::PerformanceOptimization => "Optimize performance",
            Self::CacheManagement => "Manage caching systems",
            Self::MathComputation => "Perform mathematical computations",
            Self::LogicalReasoning => "Apply logical reasoning",
            Self::CreativeProblemSolving => "Solve problems creatively",
            Self::DecisionMaking => "Make informed decisions",
        }
    }

    /// Catégorie de la capacité
    pub fn category(&self) -> CapabilityCategory {
        match self {
            Self::WebSearch
            | Self::DocumentAnalysis
            | Self::DataExtraction
            | Self::ImageRecognition => CapabilityCategory::Research,
            Self::TextGeneration
            | Self::CodeGeneration
            | Self::ImageDescription
            | Self::Summarization => CapabilityCategory::Generation,
            Self::DataAnalysis
            | Self::PatternRecognition
            | Self::SentimentAnalysis
            | Self::TrendAnalysis => CapabilityCategory::Analysis,
            Self::NaturalLanguage | Self::Translation | Self::Formatting => {
                CapabilityCategory::Communication
            }
            Self::TaskPlanning
            | Self::ResourceAllocation
            | Self::PriorityManagement
            | Self::Scheduling => CapabilityCategory::Planning,
            Self::ThreatDetection | Self::AccessControl | Self::AuditLogging | Self::Encryption => {
                CapabilityCategory::Security
            }
            Self::SystemMonitoring
            | Self::ErrorRecovery
            | Self::PerformanceOptimization
            | Self::CacheManagement => CapabilityCategory::System,
            Self::MathComputation
            | Self::LogicalReasoning
            | Self::CreativeProblemSolving
            | Self::DecisionMaking => CapabilityCategory::Cognitive,
        }
    }
}

/// Catégorie de capacité
#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum CapabilityCategory {
    Research,
    Generation,
    Analysis,
    Communication,
    Planning,
    Security,
    System,
    Cognitive,
}

/// Niveau de capacité
#[derive(Clone, Copy, Debug, PartialEq, Eq, Ord, PartialOrd, Serialize, Deserialize)]
pub enum CapabilityLevel {
    Basic = 1,
    Intermediate = 2,
    Advanced = 3,
    Expert = 4,
    Master = 5,
}

impl Default for CapabilityLevel {
    fn default() -> Self {
        Self::Intermediate
    }
}

/// Entrée de capacité avec niveau
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct CapabilityEntry {
    pub capability: Capability,
    pub level: CapabilityLevel,
    pub enabled: bool,
}

/// Ensemble de capacités
#[derive(Clone, Debug, Default, Serialize, Deserialize)]
pub struct CapabilitySet {
    capabilities: HashMap<Capability, CapabilityEntry>,
}

impl CapabilitySet {
    pub fn new() -> Self {
        Self::default()
    }

    /// Crée depuis un vecteur
    pub fn from_vec(caps: Vec<Capability>) -> Self {
        let mut set = Self::new();
        for cap in caps {
            set.add(cap);
        }
        set
    }

    /// Ajoute une capacité
    pub fn add(&mut self, capability: Capability) {
        self.capabilities.insert(
            capability,
            CapabilityEntry {
                capability,
                level: CapabilityLevel::default(),
                enabled: true,
            },
        );
    }

    /// Ajoute une capacité avec niveau
    pub fn add_with_level(&mut self, capability: Capability, level: CapabilityLevel) {
        self.capabilities.insert(
            capability,
            CapabilityEntry {
                capability,
                level,
                enabled: true,
            },
        );
    }

    /// Supprime une capacité
    pub fn remove(&mut self, capability: &Capability) {
        self.capabilities.remove(capability);
    }

    /// Vérifie si une capacité est présente
    pub fn has(&self, capability: &Capability) -> bool {
        self.capabilities
            .get(capability)
            .map_or(false, |e| e.enabled)
    }

    /// Récupère le niveau d'une capacité
    pub fn level_of(&self, capability: &Capability) -> Option<CapabilityLevel> {
        self.capabilities.get(capability).map(|e| e.level)
    }

    /// Active/désactive une capacité
    pub fn set_enabled(&mut self, capability: &Capability, enabled: bool) {
        if let Some(entry) = self.capabilities.get_mut(capability) {
            entry.enabled = enabled;
        }
    }

    /// Met à jour le niveau
    pub fn set_level(&mut self, capability: &Capability, level: CapabilityLevel) {
        if let Some(entry) = self.capabilities.get_mut(capability) {
            entry.level = level;
        }
    }

    /// Liste toutes les capacités
    pub fn all(&self) -> Vec<Capability> {
        self.capabilities.keys().cloned().collect()
    }

    /// Liste les capacités actives
    pub fn active(&self) -> Vec<Capability> {
        self.capabilities
            .iter()
            .filter(|(_, e)| e.enabled)
            .map(|(c, _)| *c)
            .collect()
    }

    /// Liste les capacités par catégorie
    pub fn by_category(&self, category: CapabilityCategory) -> Vec<Capability> {
        self.capabilities
            .keys()
            .filter(|c| c.category() == category)
            .cloned()
            .collect()
    }

    /// Nombre de capacités
    pub fn len(&self) -> usize {
        self.capabilities.len()
    }

    /// Est vide?
    pub fn is_empty(&self) -> bool {
        self.capabilities.is_empty()
    }

    /// Score total des capacités
    pub fn total_score(&self) -> u32 {
        self.capabilities
            .values()
            .filter(|e| e.enabled)
            .map(|e| e.level as u32)
            .sum()
    }

    /// Fusionne avec un autre ensemble
    pub fn merge(&mut self, other: &CapabilitySet) {
        for (cap, entry) in &other.capabilities {
            if !self.capabilities.contains_key(cap) {
                self.capabilities.insert(*cap, entry.clone());
            } else {
                // Garder le niveau le plus élevé
                if let Some(existing) = self.capabilities.get_mut(cap) {
                    if entry.level > existing.level {
                        existing.level = entry.level;
                    }
                }
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_capability_set() {
        let mut set = CapabilitySet::new();
        set.add(Capability::WebSearch);
        set.add_with_level(Capability::DataAnalysis, CapabilityLevel::Advanced);

        assert!(set.has(&Capability::WebSearch));
        assert!(set.has(&Capability::DataAnalysis));
        assert!(!set.has(&Capability::CodeGeneration));

        assert_eq!(
            set.level_of(&Capability::DataAnalysis),
            Some(CapabilityLevel::Advanced)
        );
    }

    #[test]
    fn test_capability_category() {
        assert_eq!(
            Capability::WebSearch.category(),
            CapabilityCategory::Research
        );
        assert_eq!(
            Capability::ThreatDetection.category(),
            CapabilityCategory::Security
        );
    }
}
