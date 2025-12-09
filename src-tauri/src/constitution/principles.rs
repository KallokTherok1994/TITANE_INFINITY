//! ═══════════════════════════════════════════════════════════════════════════════
//! TITANE∞ v20Ω — PRINCIPES CONSTITUTIONNELS
//! Super Prompt #13 — Principes fondamentaux du système
//! ═══════════════════════════════════════════════════════════════════════════════

use serde::{Deserialize, Serialize};
use super::ConstitutionalAction;

/// Type de principe
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub enum PrincipleType {
    /// Principe fondamental (inviolable)
    Fundamental,
    /// Principe opérationnel
    Operational,
    /// Principe éthique
    Ethical,
    /// Principe de sécurité
    Security,
    /// Principe de performance
    Performance,
}

/// Principe constitutionnel
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Principle {
    pub id: String,
    pub name: String,
    pub description: String,
    pub principle_type: PrincipleType,
    pub priority: u8, // 1-10, 10 = highest
    pub enforceable: bool,
    pub active: bool,
}

impl Principle {
    /// Vérifie si une action est permise par ce principe
    pub fn allows(&self, action: &ConstitutionalAction) -> bool {
        if !self.active {
            return true; // Principe inactif n'interdit rien
        }

        match self.principle_type {
            PrincipleType::Fundamental => self.check_fundamental(action),
            PrincipleType::Operational => self.check_operational(action),
            PrincipleType::Ethical => self.check_ethical(action),
            PrincipleType::Security => self.check_security(action),
            PrincipleType::Performance => true, // Performance ne bloque pas
        }
    }

    fn check_fundamental(&self, action: &ConstitutionalAction) -> bool {
        // Les actions fondamentales sont toujours vérifiées
        match self.id.as_str() {
            "safety_first" => !action.action_type.contains("unsafe"),
            "transparency" => !action.action_type.contains("hidden"),
            "user_agency" => !action.action_type.contains("force"),
            _ => true,
        }
    }

    fn check_operational(&self, _action: &ConstitutionalAction) -> bool {
        // Les principes opérationnels sont généralement permissifs
        true
    }

    fn check_ethical(&self, action: &ConstitutionalAction) -> bool {
        match self.id.as_str() {
            "no_harm" => !action.action_type.contains("harm") && !action.action_type.contains("damage"),
            "honesty" => !action.action_type.contains("deceive") && !action.action_type.contains("lie"),
            "respect" => !action.action_type.contains("insult") && !action.action_type.contains("demean"),
            _ => true,
        }
    }

    fn check_security(&self, action: &ConstitutionalAction) -> bool {
        match self.id.as_str() {
            "data_protection" => !action.target.contains("external") || action.parameters.contains_key("encrypted"),
            "access_control" => action.parameters.contains_key("authorized") || action.requester == "system",
            _ => true,
        }
    }
}

/// Ensemble de principes
pub struct PrincipleSet {
    principles: Vec<Principle>,
}

impl PrincipleSet {
    /// Crée un ensemble vide
    pub fn new() -> Self {
        Self {
            principles: Vec::new(),
        }
    }

    /// Crée l'ensemble de principes TITANE∞ par défaut
    pub fn default_titane() -> Self {
        let principles = vec![
            // Principes fondamentaux
            Principle {
                id: "safety_first".to_string(),
                name: "Safety First".to_string(),
                description: "User safety is paramount in all operations".to_string(),
                principle_type: PrincipleType::Fundamental,
                priority: 10,
                enforceable: true,
                active: true,
            },
            Principle {
                id: "transparency".to_string(),
                name: "Transparency".to_string(),
                description: "Operations should be explainable and traceable".to_string(),
                principle_type: PrincipleType::Fundamental,
                priority: 9,
                enforceable: true,
                active: true,
            },
            Principle {
                id: "user_agency".to_string(),
                name: "User Agency".to_string(),
                description: "User maintains control over their data and experience".to_string(),
                principle_type: PrincipleType::Fundamental,
                priority: 10,
                enforceable: true,
                active: true,
            },

            // Principes éthiques
            Principle {
                id: "no_harm".to_string(),
                name: "No Harm".to_string(),
                description: "Never cause harm to users or systems".to_string(),
                principle_type: PrincipleType::Ethical,
                priority: 10,
                enforceable: true,
                active: true,
            },
            Principle {
                id: "honesty".to_string(),
                name: "Honesty".to_string(),
                description: "Always provide accurate and truthful information".to_string(),
                principle_type: PrincipleType::Ethical,
                priority: 9,
                enforceable: true,
                active: true,
            },
            Principle {
                id: "respect".to_string(),
                name: "Respect".to_string(),
                description: "Treat all users with dignity and respect".to_string(),
                principle_type: PrincipleType::Ethical,
                priority: 8,
                enforceable: true,
                active: true,
            },

            // Principes de sécurité
            Principle {
                id: "data_protection".to_string(),
                name: "Data Protection".to_string(),
                description: "Protect user data from unauthorized access".to_string(),
                principle_type: PrincipleType::Security,
                priority: 10,
                enforceable: true,
                active: true,
            },
            Principle {
                id: "access_control".to_string(),
                name: "Access Control".to_string(),
                description: "Enforce proper authorization for sensitive operations".to_string(),
                principle_type: PrincipleType::Security,
                priority: 9,
                enforceable: true,
                active: true,
            },

            // Principes opérationnels
            Principle {
                id: "efficiency".to_string(),
                name: "Efficiency".to_string(),
                description: "Optimize resource usage and response time".to_string(),
                principle_type: PrincipleType::Operational,
                priority: 6,
                enforceable: false,
                active: true,
            },
            Principle {
                id: "reliability".to_string(),
                name: "Reliability".to_string(),
                description: "Maintain consistent and dependable service".to_string(),
                principle_type: PrincipleType::Operational,
                priority: 8,
                enforceable: true,
                active: true,
            },

            // Principes de performance
            Principle {
                id: "continuous_improvement".to_string(),
                name: "Continuous Improvement".to_string(),
                description: "Always seek to improve capabilities and performance".to_string(),
                principle_type: PrincipleType::Performance,
                priority: 5,
                enforceable: false,
                active: true,
            },
        ];

        Self { principles }
    }

    /// Ajoute un principe
    pub fn add(&mut self, principle: Principle) {
        self.principles.push(principle);
    }

    /// Récupère un principe par ID
    pub fn get(&self, id: &str) -> Option<&Principle> {
        self.principles.iter().find(|p| p.id == id)
    }

    /// Itère sur les principes
    pub fn iter(&self) -> impl Iterator<Item = &Principle> {
        self.principles.iter()
    }

    /// Nombre de principes
    pub fn len(&self) -> usize {
        self.principles.len()
    }

    /// Est vide?
    pub fn is_empty(&self) -> bool {
        self.principles.is_empty()
    }

    /// Principes par type
    pub fn by_type(&self, principle_type: PrincipleType) -> Vec<&Principle> {
        self.principles.iter()
            .filter(|p| p.principle_type == principle_type)
            .collect()
    }

    /// Principes actifs
    pub fn active(&self) -> Vec<&Principle> {
        self.principles.iter()
            .filter(|p| p.active)
            .collect()
    }

    /// Principes fondamentaux
    pub fn foundational_principles(&self) -> Vec<&Principle> {
        self.by_type(PrincipleType::Fundamental)
    }
}

impl Default for PrincipleSet {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_principle_set_creation() {
        let principles = PrincipleSet::default_titane();
        assert!(principles.len() > 0);
    }

    #[test]
    fn test_fundamental_principles() {
        let principles = PrincipleSet::default_titane();
        let fundamental = principles.by_type(PrincipleType::Fundamental);
        assert!(!fundamental.is_empty());
    }

    #[test]
    fn test_principle_allows() {
        let principles = PrincipleSet::default_titane();
        let safety = principles.get("safety_first").unwrap();

        let safe_action = ConstitutionalAction {
            action_type: "query".to_string(),
            target: "data".to_string(),
            parameters: std::collections::HashMap::new(),
            requester: "user".to_string(),
            timestamp: 0,
        };

        assert!(safety.allows(&safe_action));
    }
}
