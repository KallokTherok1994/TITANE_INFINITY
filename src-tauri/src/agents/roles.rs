#![allow(unused_imports)]
#![allow(dead_code)]
// ═══════════════════════════════════════════════════════════════
//   AGENT ROLES — Rôles Spécialisés des Agents
//   Définition des 11 rôles d'agents cognitifs TITANE∞
// ═══════════════════════════════════════════════════════════════

use serde::{Deserialize, Serialize};

/// Rôles des agents TITANE∞
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum AgentRole {
    /// Agent Observateur — Surveillance système, logs, dérives
    Observer,
    /// Agent Mémoire — Curation mémoire STM/MTM/LTM
    Memory,
    /// Agent Synthèse — Structure, résume, organise
    Synthesizer,
    /// Agent Analyse — Raisonnement spécialisé profond
    Analyzer,
    /// Agent Temporel — Cycles, prédictions, modélisation temporelle
    Temporal,
    /// Agent Sécurité — Vérification permissions, ACL, règles
    Security,
    /// Agent API — Gestion API Hub, pré-analyse, validation
    API,
    /// Agent Vision — Perception images, analyse multimodale visuelle
    Vision,
    /// Agent Audio — Analyse spectrale 3D, perception audio
    Audio,
    /// Agent DevTools — Instrumentation, logs enrichis, diagnostics
    DevTools,
    /// Agent Evolution — Meta-learning, micro-améliorations avec AGI Core
    Evolution,
}

impl AgentRole {
    /// Obtenir la description du rôle
    pub fn descriptor(&self) -> RoleDescriptor {
        match self {
            Self::Observer => RoleDescriptor {
                role: *self,
                name: "Agent Observateur",
                description: "Surveille le système, détecte les dérives, collecte les métriques et signale les anomalies",
                primary_capability: "Monitoring",
                secondary_capabilities: vec!["Logging", "Drift Detection", "Alerting"],
            },
            Self::Memory => RoleDescriptor {
                role: *self,
                name: "Agent Mémoire",
                description: "Gère la curation de la mémoire, optimise STM/MTM/LTM, consolide et oublie",
                primary_capability: "Memory Curation",
                secondary_capabilities: vec!["Consolidation", "Forgetting", "Search Optimization"],
            },
            Self::Synthesizer => RoleDescriptor {
                role: *self,
                name: "Agent Synthèse",
                description: "Structure les idées, résume les informations, organise les connaissances",
                primary_capability: "Synthesis",
                secondary_capabilities: vec!["Summarization", "Structuring", "Organization"],
            },
            Self::Analyzer => RoleDescriptor {
                role: *self,
                name: "Agent Analyse",
                description: "Effectue du raisonnement profond spécialisé, analyse complexe sur demande",
                primary_capability: "Deep Reasoning",
                secondary_capabilities: vec!["Pattern Detection", "Causal Analysis", "Inference"],
            },
            Self::Temporal => RoleDescriptor {
                role: *self,
                name: "Agent Temporel",
                description: "Travaille sur les cycles, prédictions, modélisation temporelle et anticipation",
                primary_capability: "Temporal Modeling",
                secondary_capabilities: vec!["Prediction", "Cycle Detection", "Future Simulation"],
            },
            Self::Security => RoleDescriptor {
                role: *self,
                name: "Agent Sécurité",
                description: "Vérifie les permissions, applique les ACL, assure la conformité aux règles",
                primary_capability: "Security Enforcement",
                secondary_capabilities: vec!["ACL Verification", "Rule Checking", "Threat Detection"],
            },
            Self::API => RoleDescriptor {
                role: *self,
                name: "Agent API",
                description: "Gère l'API Hub, pré-analyse les requêtes, valide les endpoints",
                primary_capability: "API Management",
                secondary_capabilities: vec!["Request Validation", "Rate Limiting", "Routing"],
            },
            Self::Vision => RoleDescriptor {
                role: *self,
                name: "Agent Vision",
                description: "Perception images, analyse multimodale visuelle, reconnaissance patterns visuels",
                primary_capability: "Visual Perception",
                secondary_capabilities: vec!["Image Analysis", "Object Recognition", "Visual Search"],
            },
            Self::Audio => RoleDescriptor {
                role: *self,
                name: "Agent Audio",
                description: "Analyse spectrale 3D, perception audio, traitement signal sonore",
                primary_capability: "Audio Perception",
                secondary_capabilities: vec!["Spectrum Analysis", "Spatial Audio", "Sound Recognition"],
            },
            Self::DevTools => RoleDescriptor {
                role: *self,
                name: "Agent DevTools",
                description: "Instrumentation système, logs enrichis, diagnostics développeur",
                primary_capability: "Developer Instrumentation",
                secondary_capabilities: vec!["Log Enrichment", "Tracing", "Performance Profiling"],
            },
            Self::Evolution => RoleDescriptor {
                role: *self,
                name: "Agent Evolution",
                description: "Meta-learning, micro-améliorations système avec AGI Core, adaptation continue",
                primary_capability: "Meta-Learning",
                secondary_capabilities: vec!["Self-Improvement", "Adaptation", "Strategy Optimization"],
            },
        }
    }

    /// Obtenir le nom court
    pub fn short_name(&self) -> &'static str {
        match self {
            Self::Observer => "Observer",
            Self::Memory => "Memory",
            Self::Synthesizer => "Synthesizer",
            Self::Analyzer => "Analyzer",
            Self::Temporal => "Temporal",
            Self::Security => "Security",
            Self::API => "API",
            Self::Vision => "Vision",
            Self::Audio => "Audio",
            Self::DevTools => "DevTools",
            Self::Evolution => "Evolution",
        }
    }

    /// Obtenir l'emoji représentatif
    pub fn emoji(&self) -> &'static str {
        match self {
            Self::Observer => "👁️",
            Self::Memory => "🧠",
            Self::Synthesizer => "📝",
            Self::Analyzer => "🔬",
            Self::Temporal => "⏰",
            Self::Security => "🔒",
            Self::API => "🔌",
            Self::Vision => "👀",
            Self::Audio => "🎵",
            Self::DevTools => "🛠️",
            Self::Evolution => "🧬",
        }
    }

    /// Vérifier si le rôle nécessite des privilèges élevés
    pub fn requires_elevated_privileges(&self) -> bool {
        matches!(self, Self::Security | Self::Evolution | Self::Memory)
    }

    /// Obtenir la priorité d'exécution (0 = plus haute)
    pub fn execution_priority(&self) -> u8 {
        match self {
            Self::Security => 0,    // Sécurité = priorité max
            Self::Observer => 1,    // Observation = haute priorité
            Self::Memory => 2,      // Mémoire = haute priorité
            Self::Temporal => 3,    // Temporel = priorité moyenne-haute
            Self::Analyzer => 4,    // Analyse = priorité moyenne
            Self::Synthesizer => 5, // Synthèse = priorité moyenne
            Self::Vision => 6,      // Vision = priorité moyenne-basse
            Self::Audio => 6,       // Audio = priorité moyenne-basse
            Self::API => 7,         // API = priorité basse
            Self::DevTools => 8,    // DevTools = priorité basse
            Self::Evolution => 9,   // Evolution = priorité la plus basse (background)
        }
    }

    /// Obtenir tous les rôles disponibles
    pub fn all() -> Vec<AgentRole> {
        vec![
            Self::Observer,
            Self::Memory,
            Self::Synthesizer,
            Self::Analyzer,
            Self::Temporal,
            Self::Security,
            Self::API,
            Self::Vision,
            Self::Audio,
            Self::DevTools,
            Self::Evolution,
        ]
    }
}

/// Descripteur détaillé d'un rôle
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RoleDescriptor {
    pub role: AgentRole,
    pub name: &'static str,
    pub description: &'static str,
    pub primary_capability: &'static str,
    pub secondary_capabilities: Vec<&'static str>,
}

impl RoleDescriptor {
    /// Obtenir la description complète formatée
    pub fn full_description(&self) -> String {
        format!(
            "{} {} — {}\nCapacité principale: {}\nCapacités secondaires: {}",
            self.role.emoji(),
            self.name,
            self.description,
            self.primary_capability,
            self.secondary_capabilities.join(", ")
        )
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_all_roles_have_descriptors() {
        for role in AgentRole::all() {
            let descriptor = role.descriptor();
            assert!(!descriptor.name.is_empty());
            assert!(!descriptor.description.is_empty());
            assert!(!descriptor.primary_capability.is_empty());
        }
    }

    #[test]
    fn test_role_priorities() {
        assert_eq!(AgentRole::Security.execution_priority(), 0);
        assert!(
            AgentRole::Observer.execution_priority() < AgentRole::Evolution.execution_priority()
        );
    }

    #[test]
    fn test_elevated_privileges() {
        assert!(AgentRole::Security.requires_elevated_privileges());
        assert!(AgentRole::Evolution.requires_elevated_privileges());
        assert!(!AgentRole::DevTools.requires_elevated_privileges());
    }

    #[test]
    fn test_role_emojis() {
        for role in AgentRole::all() {
            assert!(!role.emoji().is_empty());
        }
    }
}
