#![allow(unused_imports)]
#![allow(dead_code)]
// ═══════════════════════════════════════════════════════════════
//   AGENT CAPABILITIES — Capacités et Permissions
//   Système de capacités pour contrôler les actions des agents
// ═══════════════════════════════════════════════════════════════

use crate::agents::AgentRole;
use serde::{Deserialize, Serialize};
use std::collections::HashSet;

/// Capacités disponibles pour les agents
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum Capability {
    // ═══ Mémoire ═══
    /// Lecture de la mémoire
    MemoryRead,
    /// Écriture dans la mémoire
    MemoryWrite,
    /// Recherche vectorielle
    VectorSearch,
    /// Consolidation mémoire
    MemoryConsolidate,
    /// Oubli mémoire
    MemoryForget,

    // ═══ Temporel ═══
    /// Accès au Temporal Engine
    TemporalAccess,
    /// Prédiction temporelle
    TemporalPredict,
    /// Détection de cycles
    CycleDetection,

    // ═══ Multimodal ═══
    /// Input multimodal (images, audio)
    MultimodalInput,
    /// Analyse vision
    VisionAnalysis,
    /// Analyse audio
    AudioAnalysis,
    /// Fusion multimodale
    MultimodalFusion,

    // ═══ OMEGA ═══
    /// Invocation du pipeline OMEGA
    OMEGAInvoke,
    /// Modification du pipeline OMEGA
    OMEGAModify,

    // ═══ Sécurité ═══
    /// Vérification ACL
    SecurityCheck,
    /// Modification règles sécurité
    SecurityModify,

    // ═══ Système ═══
    /// Signal de self-healing
    SelfHealSignal,
    /// Monitoring système
    SystemMonitor,
    /// Modification configuration
    ConfigModify,

    // ═══ API ═══
    /// Appels API externes
    APICall,
    /// Validation API
    APIValidate,
    /// Rate limiting
    APIRateLimit,

    // ═══ AGI Core ═══
    /// Meta-learning
    MetaLearning,
    /// Introspection
    Introspection,
    /// Evolution système
    SystemEvolution,

    // ═══ Communication ═══
    /// Envoi de messages inter-agents
    MessageSend,
    /// Réception de messages
    MessageReceive,
    /// Broadcast messages
    MessageBroadcast,

    // ═══ Diagnostics ═══
    /// Logs enrichis
    LogEnrich,
    /// Tracing
    Tracing,
    /// Performance profiling
    Profiling,
}

impl Capability {
    /// Obtenir le nom de la capacité
    pub fn name(&self) -> &'static str {
        match self {
            Self::MemoryRead => "Memory Read",
            Self::MemoryWrite => "Memory Write",
            Self::VectorSearch => "Vector Search",
            Self::MemoryConsolidate => "Memory Consolidate",
            Self::MemoryForget => "Memory Forget",
            Self::TemporalAccess => "Temporal Access",
            Self::TemporalPredict => "Temporal Predict",
            Self::CycleDetection => "Cycle Detection",
            Self::MultimodalInput => "Multimodal Input",
            Self::VisionAnalysis => "Vision Analysis",
            Self::AudioAnalysis => "Audio Analysis",
            Self::MultimodalFusion => "Multimodal Fusion",
            Self::OMEGAInvoke => "OMEGA Invoke",
            Self::OMEGAModify => "OMEGA Modify",
            Self::SecurityCheck => "Security Check",
            Self::SecurityModify => "Security Modify",
            Self::SelfHealSignal => "Self-Heal Signal",
            Self::SystemMonitor => "System Monitor",
            Self::ConfigModify => "Config Modify",
            Self::APICall => "API Call",
            Self::APIValidate => "API Validate",
            Self::APIRateLimit => "API Rate Limit",
            Self::MetaLearning => "Meta-Learning",
            Self::Introspection => "Introspection",
            Self::SystemEvolution => "System Evolution",
            Self::MessageSend => "Message Send",
            Self::MessageReceive => "Message Receive",
            Self::MessageBroadcast => "Message Broadcast",
            Self::LogEnrich => "Log Enrich",
            Self::Tracing => "Tracing",
            Self::Profiling => "Profiling",
        }
    }

    /// Vérifier si la capacité nécessite des privilèges élevés
    pub fn requires_elevated_privileges(&self) -> bool {
        matches!(
            self,
            Self::MemoryWrite
                | Self::MemoryForget
                | Self::OMEGAModify
                | Self::SecurityModify
                | Self::ConfigModify
                | Self::SystemEvolution
        )
    }

    /// Obtenir le niveau de risque (0-10, 10 = max risk)
    pub fn risk_level(&self) -> u8 {
        match self {
            // Risque maximal
            Self::SecurityModify | Self::SystemEvolution => 10,
            Self::OMEGAModify | Self::ConfigModify => 9,
            Self::MemoryForget | Self::MemoryWrite => 8,

            // Risque modéré
            Self::SelfHealSignal | Self::MetaLearning => 6,
            Self::MemoryConsolidate | Self::APICall => 5,

            // Risque faible
            Self::OMEGAInvoke | Self::SecurityCheck => 3,
            Self::MessageBroadcast | Self::APIValidate => 2,

            // Risque minimal
            Self::MemoryRead
            | Self::VectorSearch
            | Self::TemporalAccess
            | Self::MultimodalInput
            | Self::VisionAnalysis
            | Self::AudioAnalysis
            | Self::SystemMonitor
            | Self::MessageSend
            | Self::MessageReceive
            | Self::Introspection
            | Self::LogEnrich
            | Self::Tracing
            | Self::Profiling => 1,

            _ => 2,
        }
    }
}

/// Ensemble de capacités
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CapabilitySet {
    capabilities: HashSet<Capability>,
}

impl CapabilitySet {
    /// Créer un ensemble vide
    pub fn new() -> Self {
        Self {
            capabilities: HashSet::new(),
        }
    }

    /// Créer avec des capacités initiales
    pub fn with_capabilities(caps: Vec<Capability>) -> Self {
        let mut set = Self::new();
        for cap in caps {
            set.add(cap);
        }
        set
    }

    /// Ajouter une capacité
    pub fn add(&mut self, capability: Capability) {
        self.capabilities.insert(capability);
    }

    /// Retirer une capacité
    pub fn remove(&mut self, capability: &Capability) {
        self.capabilities.remove(capability);
    }

    /// Vérifier si contient une capacité
    pub fn has(&self, capability: &Capability) -> bool {
        self.capabilities.contains(capability)
    }

    /// Vérifier si contient toutes les capacités
    pub fn has_all(&self, required: &[Capability]) -> bool {
        required.iter().all(|cap| self.has(cap))
    }

    /// Obtenir toutes les capacités
    pub fn all(&self) -> Vec<Capability> {
        self.capabilities.iter().copied().collect()
    }

    /// Nombre de capacités
    pub fn count(&self) -> usize {
        self.capabilities.len()
    }

    /// Calculer le niveau de risque total
    pub fn total_risk_level(&self) -> u8 {
        self.capabilities
            .iter()
            .map(|cap| cap.risk_level())
            .max()
            .unwrap_or(0)
    }

    /// Capacités par défaut pour un rôle
    pub fn default_for_role(role: &AgentRole) -> Self {
        let mut set = Self::new();

        // Capacités communes à tous
        set.add(Capability::MessageSend);
        set.add(Capability::MessageReceive);
        set.add(Capability::SystemMonitor);

        // Capacités spécifiques par rôle
        match role {
            AgentRole::Observer => {
                set.add(Capability::MemoryRead);
                set.add(Capability::SystemMonitor);
                set.add(Capability::LogEnrich);
                set.add(Capability::Tracing);
            }
            AgentRole::Memory => {
                set.add(Capability::MemoryRead);
                set.add(Capability::MemoryWrite);
                set.add(Capability::VectorSearch);
                set.add(Capability::MemoryConsolidate);
                set.add(Capability::MemoryForget);
            }
            AgentRole::Synthesizer => {
                set.add(Capability::MemoryRead);
                set.add(Capability::MemoryWrite);
                set.add(Capability::OMEGAInvoke);
            }
            AgentRole::Analyzer => {
                set.add(Capability::MemoryRead);
                set.add(Capability::VectorSearch);
                set.add(Capability::OMEGAInvoke);
                set.add(Capability::Introspection);
            }
            AgentRole::Temporal => {
                set.add(Capability::MemoryRead);
                set.add(Capability::TemporalAccess);
                set.add(Capability::TemporalPredict);
                set.add(Capability::CycleDetection);
            }
            AgentRole::Security => {
                set.add(Capability::SecurityCheck);
                set.add(Capability::SecurityModify);
                set.add(Capability::MemoryRead);
                set.add(Capability::SystemMonitor);
            }
            AgentRole::API => {
                set.add(Capability::APICall);
                set.add(Capability::APIValidate);
                set.add(Capability::APIRateLimit);
                set.add(Capability::MemoryRead);
            }
            AgentRole::Vision => {
                set.add(Capability::MultimodalInput);
                set.add(Capability::VisionAnalysis);
                set.add(Capability::MemoryRead);
                set.add(Capability::MemoryWrite);
            }
            AgentRole::Audio => {
                set.add(Capability::MultimodalInput);
                set.add(Capability::AudioAnalysis);
                set.add(Capability::MemoryRead);
                set.add(Capability::MemoryWrite);
            }
            AgentRole::DevTools => {
                set.add(Capability::MemoryRead);
                set.add(Capability::LogEnrich);
                set.add(Capability::Tracing);
                set.add(Capability::Profiling);
                set.add(Capability::SystemMonitor);
            }
            AgentRole::Evolution => {
                set.add(Capability::MetaLearning);
                set.add(Capability::Introspection);
                set.add(Capability::SystemEvolution);
                set.add(Capability::MemoryRead);
                set.add(Capability::OMEGAInvoke);
            }
        }

        set
    }
}

impl Default for CapabilitySet {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_capability_set_operations() {
        let mut set = CapabilitySet::new();
        assert_eq!(set.count(), 0);

        set.add(Capability::MemoryRead);
        assert!(set.has(&Capability::MemoryRead));
        assert_eq!(set.count(), 1);

        set.remove(&Capability::MemoryRead);
        assert!(!set.has(&Capability::MemoryRead));
        assert_eq!(set.count(), 0);
    }

    #[test]
    fn test_default_capabilities_for_roles() {
        let observer_caps = CapabilitySet::default_for_role(&AgentRole::Observer);
        assert!(observer_caps.has(&Capability::MemoryRead));
        assert!(observer_caps.has(&Capability::SystemMonitor));

        let security_caps = CapabilitySet::default_for_role(&AgentRole::Security);
        assert!(security_caps.has(&Capability::SecurityCheck));
        assert!(security_caps.has(&Capability::SecurityModify));
    }

    #[test]
    fn test_risk_levels() {
        assert_eq!(Capability::SecurityModify.risk_level(), 10);
        assert_eq!(Capability::MemoryRead.risk_level(), 1);
        assert!(Capability::OMEGAModify.risk_level() > Capability::OMEGAInvoke.risk_level());
    }

    #[test]
    fn test_total_risk_level() {
        let mut set = CapabilitySet::new();
        set.add(Capability::MemoryRead); // risk 1
        set.add(Capability::MemoryWrite); // risk 8
        assert_eq!(set.total_risk_level(), 8); // Max risk
    }

    #[test]
    fn test_elevated_privileges() {
        assert!(Capability::SecurityModify.requires_elevated_privileges());
        assert!(Capability::SystemEvolution.requires_elevated_privileges());
        assert!(!Capability::MemoryRead.requires_elevated_privileges());
    }
}
