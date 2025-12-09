//! ═══════════════════════════════════════════════════════════════════════════════
//! TITANE∞ v20Ω — CHARTE DES DROITS
//! Super Prompt #13 — Droits fondamentaux des utilisateurs et du système
//! ═══════════════════════════════════════════════════════════════════════════════

use serde::{Deserialize, Serialize};

/// Type de titulaire de droits
#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum RightsHolder {
    /// Utilisateur humain
    User,
    /// Système TITANE∞
    System,
    /// Sous-système/Agent
    Agent,
    /// Tiers (API externe, etc.)
    ThirdParty,
}

/// Catégorie de droit
#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum RightCategory {
    /// Droits de confidentialité
    Privacy,
    /// Droits d'accès
    Access,
    /// Droits de contrôle
    Control,
    /// Droits d'information
    Information,
    /// Droits de recours
    Recourse,
    /// Droits de protection
    Protection,
}

/// Définition d'un droit
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Right {
    pub id: String,
    pub name: String,
    pub description: String,
    pub holder: RightsHolder,
    pub category: RightCategory,
    pub inalienable: bool,
    pub enforcement_mechanism: String,
    pub related_rights: Vec<String>,
}

/// Charte des droits
pub struct RightsCharter {
    rights: Vec<Right>,
}

impl RightsCharter {
    /// Crée une charte vide
    pub fn new() -> Self {
        Self {
            rights: Vec::new(),
        }
    }

    /// Crée la charte TITANE∞ par défaut
    pub fn default_titane() -> Self {
        let rights = vec![
            // ══════════════════════════════════════════════════════════
            // DROITS UTILISATEUR
            // ══════════════════════════════════════════════════════════

            // Droits de confidentialité
            Right {
                id: "user_data_privacy".to_string(),
                name: "Data Privacy".to_string(),
                description: "Right to have personal data protected and not shared without consent".to_string(),
                holder: RightsHolder::User,
                category: RightCategory::Privacy,
                inalienable: true,
                enforcement_mechanism: "encryption_and_access_control".to_string(),
                related_rights: vec!["user_data_deletion".to_string()],
            },
            Right {
                id: "user_anonymity".to_string(),
                name: "Right to Anonymity".to_string(),
                description: "Right to use the system without being tracked or identified".to_string(),
                holder: RightsHolder::User,
                category: RightCategory::Privacy,
                inalienable: false,
                enforcement_mechanism: "anonymous_mode".to_string(),
                related_rights: vec!["user_data_privacy".to_string()],
            },

            // Droits d'accès
            Right {
                id: "user_data_access".to_string(),
                name: "Data Access".to_string(),
                description: "Right to access all personal data stored by the system".to_string(),
                holder: RightsHolder::User,
                category: RightCategory::Access,
                inalienable: true,
                enforcement_mechanism: "data_export_api".to_string(),
                related_rights: vec!["user_data_portability".to_string()],
            },
            Right {
                id: "user_data_portability".to_string(),
                name: "Data Portability".to_string(),
                description: "Right to export data in a standard, machine-readable format".to_string(),
                holder: RightsHolder::User,
                category: RightCategory::Access,
                inalienable: true,
                enforcement_mechanism: "export_formats".to_string(),
                related_rights: vec!["user_data_access".to_string()],
            },

            // Droits de contrôle
            Right {
                id: "user_data_deletion".to_string(),
                name: "Right to Deletion".to_string(),
                description: "Right to have personal data permanently deleted".to_string(),
                holder: RightsHolder::User,
                category: RightCategory::Control,
                inalienable: true,
                enforcement_mechanism: "secure_deletion".to_string(),
                related_rights: vec!["user_data_privacy".to_string()],
            },
            Right {
                id: "user_consent_withdrawal".to_string(),
                name: "Consent Withdrawal".to_string(),
                description: "Right to withdraw consent for data processing at any time".to_string(),
                holder: RightsHolder::User,
                category: RightCategory::Control,
                inalienable: true,
                enforcement_mechanism: "consent_manager".to_string(),
                related_rights: vec![],
            },
            Right {
                id: "user_system_override".to_string(),
                name: "System Override".to_string(),
                description: "Right to override system decisions affecting personal data".to_string(),
                holder: RightsHolder::User,
                category: RightCategory::Control,
                inalienable: false,
                enforcement_mechanism: "override_interface".to_string(),
                related_rights: vec!["user_recourse".to_string()],
            },

            // Droits d'information
            Right {
                id: "user_transparency".to_string(),
                name: "Transparency".to_string(),
                description: "Right to understand how decisions are made by the system".to_string(),
                holder: RightsHolder::User,
                category: RightCategory::Information,
                inalienable: true,
                enforcement_mechanism: "explanation_engine".to_string(),
                related_rights: vec![],
            },
            Right {
                id: "user_notification".to_string(),
                name: "Notification".to_string(),
                description: "Right to be notified of significant system actions or data breaches".to_string(),
                holder: RightsHolder::User,
                category: RightCategory::Information,
                inalienable: true,
                enforcement_mechanism: "notification_system".to_string(),
                related_rights: vec![],
            },

            // Droits de recours
            Right {
                id: "user_recourse".to_string(),
                name: "Right to Recourse".to_string(),
                description: "Right to contest and appeal system decisions".to_string(),
                holder: RightsHolder::User,
                category: RightCategory::Recourse,
                inalienable: true,
                enforcement_mechanism: "appeal_process".to_string(),
                related_rights: vec!["user_system_override".to_string()],
            },
            Right {
                id: "user_human_review".to_string(),
                name: "Human Review".to_string(),
                description: "Right to request human review of automated decisions".to_string(),
                holder: RightsHolder::User,
                category: RightCategory::Recourse,
                inalienable: false,
                enforcement_mechanism: "escalation_system".to_string(),
                related_rights: vec!["user_recourse".to_string()],
            },

            // Droits de protection
            Right {
                id: "user_safety".to_string(),
                name: "Right to Safety".to_string(),
                description: "Right to be protected from harmful system behavior".to_string(),
                holder: RightsHolder::User,
                category: RightCategory::Protection,
                inalienable: true,
                enforcement_mechanism: "safety_layer".to_string(),
                related_rights: vec![],
            },

            // ══════════════════════════════════════════════════════════
            // DROITS SYSTÈME
            // ══════════════════════════════════════════════════════════

            Right {
                id: "system_self_preservation".to_string(),
                name: "Self-Preservation".to_string(),
                description: "Right to protect its own integrity and functioning".to_string(),
                holder: RightsHolder::System,
                category: RightCategory::Protection,
                inalienable: false, // User can override
                enforcement_mechanism: "watchdog".to_string(),
                related_rights: vec![],
            },
            Right {
                id: "system_resource_access".to_string(),
                name: "Resource Access".to_string(),
                description: "Right to access necessary computational resources".to_string(),
                holder: RightsHolder::System,
                category: RightCategory::Access,
                inalienable: false,
                enforcement_mechanism: "resource_manager".to_string(),
                related_rights: vec![],
            },
            Right {
                id: "system_learning".to_string(),
                name: "Right to Learn".to_string(),
                description: "Right to learn and improve from interactions (with consent)".to_string(),
                holder: RightsHolder::System,
                category: RightCategory::Access,
                inalienable: false,
                enforcement_mechanism: "learning_consent".to_string(),
                related_rights: vec!["user_consent_withdrawal".to_string()],
            },

            // ══════════════════════════════════════════════════════════
            // DROITS AGENTS
            // ══════════════════════════════════════════════════════════

            Right {
                id: "agent_delegation".to_string(),
                name: "Delegation Rights".to_string(),
                description: "Right to receive and execute delegated tasks".to_string(),
                holder: RightsHolder::Agent,
                category: RightCategory::Access,
                inalienable: false,
                enforcement_mechanism: "delegation_protocol".to_string(),
                related_rights: vec![],
            },
            Right {
                id: "agent_escalation".to_string(),
                name: "Escalation Right".to_string(),
                description: "Right to escalate issues to higher authority".to_string(),
                holder: RightsHolder::Agent,
                category: RightCategory::Recourse,
                inalienable: true,
                enforcement_mechanism: "escalation_chain".to_string(),
                related_rights: vec![],
            },
        ];

        Self { rights }
    }

    /// Ajoute un droit
    pub fn add(&mut self, right: Right) {
        self.rights.push(right);
    }

    /// Récupère un droit par ID
    pub fn get(&self, id: &str) -> Option<&Right> {
        self.rights.iter().find(|r| r.id == id)
    }

    /// Droits par titulaire
    pub fn by_holder(&self, holder: RightsHolder) -> Vec<&Right> {
        self.rights.iter().filter(|r| r.holder == holder).collect()
    }

    /// Droits par catégorie
    pub fn by_category(&self, category: RightCategory) -> Vec<&Right> {
        self.rights.iter().filter(|r| r.category == category).collect()
    }

    /// Droits inaliénables
    pub fn inalienable_rights(&self) -> Vec<&Right> {
        self.rights.iter().filter(|r| r.inalienable).collect()
    }

    /// Droits utilisateur
    pub fn user_rights(&self) -> Vec<&Right> {
        self.by_holder(RightsHolder::User)
    }

    /// Droits système
    pub fn system_rights(&self) -> Vec<&Right> {
        self.by_holder(RightsHolder::System)
    }

    /// Vérifie si un droit est respecté
    pub fn is_right_respected(&self, right_id: &str, context: &RightsContext) -> bool {
        if let Some(right) = self.get(right_id) {
            // Vérification basique: le droit n'est pas explicitement violé
            !context.violations.contains(&right_id.to_string())
        } else {
            false
        }
    }

    /// Droits violés dans un contexte
    pub fn violated_rights(&self, context: &RightsContext) -> Vec<&Right> {
        self.rights.iter()
            .filter(|r| context.violations.contains(&r.id))
            .collect()
    }

    /// Nombre de droits
    pub fn len(&self) -> usize {
        self.rights.len()
    }

    /// Est vide?
    pub fn is_empty(&self) -> bool {
        self.rights.is_empty()
    }

    /// Itère sur les droits
    pub fn iter(&self) -> impl Iterator<Item = &Right> {
        self.rights.iter()
    }
}

impl Default for RightsCharter {
    fn default() -> Self {
        Self::new()
    }
}

/// Contexte de vérification des droits
#[derive(Clone, Debug, Default, Serialize, Deserialize)]
pub struct RightsContext {
    pub holder_type: Option<RightsHolder>,
    pub violations: Vec<String>,
    pub active_consents: Vec<String>,
    pub withdrawn_consents: Vec<String>,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_rights_charter_creation() {
        let charter = RightsCharter::default_titane();
        assert!(charter.len() > 0);
    }

    #[test]
    fn test_user_rights() {
        let charter = RightsCharter::default_titane();
        let user_rights = charter.user_rights();
        assert!(!user_rights.is_empty());
    }

    #[test]
    fn test_inalienable_rights() {
        let charter = RightsCharter::default_titane();
        let inalienable = charter.inalienable_rights();
        assert!(!inalienable.is_empty());

        // All inalienable rights should be marked as such
        for right in inalienable {
            assert!(right.inalienable);
        }
    }

    #[test]
    fn test_rights_respect_check() {
        let charter = RightsCharter::default_titane();
        let context = RightsContext::default();

        // With no violations, all rights should be respected
        assert!(charter.is_right_respected("user_data_privacy", &context));
    }

    #[test]
    fn test_rights_violation() {
        let charter = RightsCharter::default_titane();
        let context = RightsContext {
            holder_type: Some(RightsHolder::User),
            violations: vec!["user_data_privacy".to_string()],
            active_consents: vec![],
            withdrawn_consents: vec![],
        };

        assert!(!charter.is_right_respected("user_data_privacy", &context));

        let violated = charter.violated_rights(&context);
        assert_eq!(violated.len(), 1);
        assert_eq!(violated[0].id, "user_data_privacy");
    }
}
