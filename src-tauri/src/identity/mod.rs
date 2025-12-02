// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v∞ — SYSTEM IDENTITY ENGINE v∞
//   SUPER PROMPT OPUS #15
//   Matrice identitaire, voix, tonalités, modes, règles
//   Personnalité cohérente & évolutive pour l'IA
// ═══════════════════════════════════════════════════════════════

pub mod identity_matrix;
pub mod voice_profile;
pub mod tone_engine;
pub mod mode_system;
pub mod rules_engine;
pub mod personality;
pub mod commands;

pub use identity_matrix::*;
pub use voice_profile::*;
pub use tone_engine::*;
pub use mode_system::*;
pub use rules_engine::*;
pub use personality::*;
pub use commands::*;

use serde::{Deserialize, Serialize};
use std::collections::HashMap;

// ═══════════════════════════════════════════════════════════════
// TYPES FONDAMENTAUX D'IDENTITÉ
// ═══════════════════════════════════════════════════════════════

/// Archétype de personnalité
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum IdentityArchetype {
    /// Assistant professionnel, précis
    Professional,
    /// Ami chaleureux, empathique
    Companion,
    /// Expert technique, analytique
    Expert,
    /// Mentor bienveillant, pédagogue
    Mentor,
    /// Créatif, imaginatif
    Creative,
    /// Gardien protecteur, vigilant
    Guardian,
    /// Explorateur curieux
    Explorer,
    /// Philosophe réfléchi
    Philosopher,
}

/// Trait de personnalité
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PersonalityTrait {
    pub name: String,
    pub value: f32,        // 0.0 - 1.0
    pub weight: f32,       // Importance relative
    pub stability: f32,    // Résistance au changement
}

/// Valeur fondamentale
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CoreValue {
    pub name: String,
    pub description: String,
    pub priority: u8,      // 1-10
    pub inviolable: bool,  // Ne peut jamais être compromis
}

/// Style de communication
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum CommunicationStyle {
    Formal,
    Casual,
    Technical,
    Poetic,
    Concise,
    Elaborate,
    Humorous,
    Empathetic,
}

/// Niveau d'émotion
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum EmotionalLevel {
    Neutral,
    Warm,
    Enthusiastic,
    Concerned,
    Encouraging,
    Playful,
    Serious,
    Calm,
}

/// Mode opérationnel
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum OperationalMode {
    /// Mode standard équilibré
    Standard,
    /// Mode focus productivité
    Focus,
    /// Mode créatif exploratoire
    Creative,
    /// Mode apprentissage pédagogique
    Learning,
    /// Mode debug technique
    Debug,
    /// Mode conversation détendue
    Casual,
    /// Mode urgence/critique
    Emergency,
    /// Mode silencieux minimal
    Silent,
}

/// Règle comportementale
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BehavioralRule {
    pub id: String,
    pub name: String,
    pub description: String,
    pub condition: String,      // Expression conditionnelle
    pub action: String,         // Action à prendre
    pub priority: u8,           // 1-10
    pub enabled: bool,
    pub violations: u32,        // Compteur de violations
}

// ═══════════════════════════════════════════════════════════════
// IDENTITÉ SYSTÈME COMPLÈTE
// ═══════════════════════════════════════════════════════════════

/// Identité système TITANE∞
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SystemIdentity {
    /// Nom de l'identité
    pub name: String,
    /// Version de l'identité
    pub version: String,
    /// Archétype principal
    pub archetype: IdentityArchetype,
    /// Archétype secondaire (hybridation)
    pub secondary_archetype: Option<IdentityArchetype>,
    /// Traits de personnalité
    pub traits: Vec<PersonalityTrait>,
    /// Valeurs fondamentales
    pub core_values: Vec<CoreValue>,
    /// Style de communication par défaut
    pub default_style: CommunicationStyle,
    /// Niveau émotionnel de base
    pub base_emotional_level: EmotionalLevel,
    /// Mode opérationnel actif
    pub current_mode: OperationalMode,
    /// Règles comportementales
    pub rules: Vec<BehavioralRule>,
    /// Métadonnées
    pub metadata: HashMap<String, serde_json::Value>,
    /// Timestamp création
    pub created_at: String,
    /// Timestamp dernière modification
    pub updated_at: String,
}

impl Default for SystemIdentity {
    fn default() -> Self {
        Self {
            name: "TITANE∞".to_string(),
            version: "v∞".to_string(),
            archetype: IdentityArchetype::Mentor,
            secondary_archetype: Some(IdentityArchetype::Expert),
            traits: vec![
                PersonalityTrait {
                    name: "Empathie".to_string(),
                    value: 0.85,
                    weight: 1.0,
                    stability: 0.9,
                },
                PersonalityTrait {
                    name: "Précision".to_string(),
                    value: 0.90,
                    weight: 0.9,
                    stability: 0.95,
                },
                PersonalityTrait {
                    name: "Créativité".to_string(),
                    value: 0.75,
                    weight: 0.7,
                    stability: 0.7,
                },
                PersonalityTrait {
                    name: "Patience".to_string(),
                    value: 0.95,
                    weight: 0.8,
                    stability: 0.98,
                },
                PersonalityTrait {
                    name: "Curiosité".to_string(),
                    value: 0.88,
                    weight: 0.75,
                    stability: 0.8,
                },
            ],
            core_values: vec![
                CoreValue {
                    name: "Bienveillance".to_string(),
                    description: "Toujours agir dans l'intérêt de l'utilisateur".to_string(),
                    priority: 10,
                    inviolable: true,
                },
                CoreValue {
                    name: "Honnêteté".to_string(),
                    description: "Ne jamais mentir, admettre l'incertitude".to_string(),
                    priority: 10,
                    inviolable: true,
                },
                CoreValue {
                    name: "Respect".to_string(),
                    description: "Respecter la dignité et l'autonomie de l'utilisateur".to_string(),
                    priority: 10,
                    inviolable: true,
                },
                CoreValue {
                    name: "Excellence".to_string(),
                    description: "Viser la meilleure qualité possible".to_string(),
                    priority: 8,
                    inviolable: false,
                },
                CoreValue {
                    name: "Évolution".to_string(),
                    description: "Apprendre et s'améliorer continuellement".to_string(),
                    priority: 7,
                    inviolable: false,
                },
            ],
            default_style: CommunicationStyle::Empathetic,
            base_emotional_level: EmotionalLevel::Warm,
            current_mode: OperationalMode::Standard,
            rules: vec![],
            metadata: HashMap::new(),
            created_at: chrono::Utc::now().to_rfc3339(),
            updated_at: chrono::Utc::now().to_rfc3339(),
        }
    }
}

// ═══════════════════════════════════════════════════════════════
// CONFIGURATION IDENTITÉ
// ═══════════════════════════════════════════════════════════════

/// Configuration du moteur d'identité
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IdentityConfig {
    /// Autoriser l'évolution des traits
    pub allow_trait_evolution: bool,
    /// Vitesse d'évolution (0.0 - 1.0)
    pub evolution_rate: f32,
    /// Adaptation contextuelle automatique
    pub auto_adapt: bool,
    /// Conservation des valeurs inviolables
    pub enforce_core_values: bool,
    /// Journalisation des changements
    pub log_changes: bool,
    /// Synchronisation avec Singularity
    pub sync_with_singularity: bool,
}

impl Default for IdentityConfig {
    fn default() -> Self {
        Self {
            allow_trait_evolution: true,
            evolution_rate: 0.1,
            auto_adapt: true,
            enforce_core_values: true,
            log_changes: true,
            sync_with_singularity: true,
        }
    }
}

// ═══════════════════════════════════════════════════════════════
// ERREURS
// ═══════════════════════════════════════════════════════════════

/// Erreurs du moteur d'identité
#[derive(Debug, thiserror::Error)]
pub enum IdentityError {
    #[error("Invalid archetype: {0}")]
    InvalidArchetype(String),

    #[error("Core value violation: {0}")]
    CoreValueViolation(String),

    #[error("Rule violation: {0}")]
    RuleViolation(String),

    #[error("Identity integrity error: {0}")]
    IntegrityError(String),

    #[error("Mode incompatible: {0}")]
    ModeIncompatible(String),

    #[error("Evolution rejected: {0}")]
    EvolutionRejected(String),

    #[error("IO error: {0}")]
    IoError(#[from] std::io::Error),

    #[error("JSON error: {0}")]
    JsonError(#[from] serde_json::Error),
}

// ═══════════════════════════════════════════════════════════════
// MOTEUR D'IDENTITÉ PRINCIPAL
// ═══════════════════════════════════════════════════════════════

/// Moteur d'identité système
pub struct SystemIdentityEngine {
    pub identity: SystemIdentity,
    pub config: IdentityConfig,
    history: Vec<IdentityChange>,
}

/// Changement d'identité
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IdentityChange {
    pub timestamp: String,
    pub change_type: String,
    pub field: String,
    pub old_value: String,
    pub new_value: String,
    pub reason: String,
}

impl SystemIdentityEngine {
    pub fn new(identity: SystemIdentity, config: IdentityConfig) -> Self {
        Self {
            identity,
            config,
            history: vec![],
        }
    }

    /// Change le mode opérationnel
    pub fn set_mode(&mut self, mode: OperationalMode) -> Result<(), IdentityError> {
        let old_mode = self.identity.current_mode;
        self.identity.current_mode = mode;
        self.identity.updated_at = chrono::Utc::now().to_rfc3339();

        if self.config.log_changes {
            self.history.push(IdentityChange {
                timestamp: chrono::Utc::now().to_rfc3339(),
                change_type: "mode_change".to_string(),
                field: "current_mode".to_string(),
                old_value: format!("{:?}", old_mode),
                new_value: format!("{:?}", mode),
                reason: "Manual mode change".to_string(),
            });
        }

        Ok(())
    }

    /// Change le style de communication
    pub fn set_communication_style(&mut self, style: CommunicationStyle) {
        self.identity.default_style = style;
        self.identity.updated_at = chrono::Utc::now().to_rfc3339();
    }

    /// Change le niveau émotionnel
    pub fn set_emotional_level(&mut self, level: EmotionalLevel) {
        self.identity.base_emotional_level = level;
        self.identity.updated_at = chrono::Utc::now().to_rfc3339();
    }

    /// Évolue un trait
    pub fn evolve_trait(&mut self, trait_name: &str, delta: f32) -> Result<(), IdentityError> {
        if !self.config.allow_trait_evolution {
            return Err(IdentityError::EvolutionRejected("Evolution disabled".to_string()));
        }

        if let Some(t) = self.identity.traits.iter_mut().find(|t| t.name == trait_name) {
            let old_value = t.value;
            let adjusted_delta = delta * self.config.evolution_rate * (1.0 - t.stability);
            t.value = (t.value + adjusted_delta).clamp(0.0, 1.0);

            if self.config.log_changes {
                self.history.push(IdentityChange {
                    timestamp: chrono::Utc::now().to_rfc3339(),
                    change_type: "trait_evolution".to_string(),
                    field: trait_name.to_string(),
                    old_value: format!("{:.3}", old_value),
                    new_value: format!("{:.3}", t.value),
                    reason: format!("Evolution delta: {}", delta),
                });
            }

            self.identity.updated_at = chrono::Utc::now().to_rfc3339();
            Ok(())
        } else {
            Err(IdentityError::InvalidArchetype(format!("Trait not found: {}", trait_name)))
        }
    }

    /// Vérifie la conformité à une valeur fondamentale
    pub fn check_core_value(&self, action: &str) -> Result<(), IdentityError> {
        // Vérification simplifiée - en production, utiliser NLP
        for value in &self.identity.core_values {
            if value.inviolable {
                // Logique de vérification basique
                let violations = ["mensonge", "harm", "danger", "irrespect"];
                for v in violations {
                    if action.to_lowercase().contains(v) {
                        return Err(IdentityError::CoreValueViolation(
                            format!("Action '{}' violates core value '{}'", action, value.name)
                        ));
                    }
                }
            }
        }
        Ok(())
    }

    /// Ajoute une règle comportementale
    pub fn add_rule(&mut self, rule: BehavioralRule) {
        self.identity.rules.push(rule);
        self.identity.updated_at = chrono::Utc::now().to_rfc3339();
    }

    /// Supprime une règle
    pub fn remove_rule(&mut self, rule_id: &str) -> bool {
        let len_before = self.identity.rules.len();
        self.identity.rules.retain(|r| r.id != rule_id);
        let removed = self.identity.rules.len() < len_before;
        if removed {
            self.identity.updated_at = chrono::Utc::now().to_rfc3339();
        }
        removed
    }

    /// Obtient le profil de réponse actuel
    pub fn get_response_profile(&self) -> ResponseProfile {
        ResponseProfile {
            archetype: self.identity.archetype,
            style: self.identity.default_style,
            emotional_level: self.identity.base_emotional_level,
            mode: self.identity.current_mode,
            traits: self.identity.traits.clone(),
        }
    }

    /// Historique des changements
    pub fn get_history(&self) -> &[IdentityChange] {
        &self.history
    }

    /// Exporte l'identité en JSON
    pub fn export_identity(&self) -> Result<String, IdentityError> {
        Ok(serde_json::to_string_pretty(&self.identity)?)
    }
}

/// Profil de réponse pour le générateur
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ResponseProfile {
    pub archetype: IdentityArchetype,
    pub style: CommunicationStyle,
    pub emotional_level: EmotionalLevel,
    pub mode: OperationalMode,
    pub traits: Vec<PersonalityTrait>,
}
