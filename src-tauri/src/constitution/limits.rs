//! ═══════════════════════════════════════════════════════════════════════════════
//! TITANE∞ v20Ω — SYSTÈME DE LIMITES
//! Super Prompt #13 — Limites, frontières et garde-fous du système
//! ═══════════════════════════════════════════════════════════════════════════════

use super::ConstitutionalAction;
use serde::{Deserialize, Serialize};

/// Type de limite
#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum LimitType {
    /// Limite absolue (jamais franchissable)
    Absolute,
    /// Limite conditionnelle (franchissable sous conditions)
    Conditional,
    /// Limite souple (avertissement)
    Soft,
    /// Limite temporaire
    Temporary,
}

/// Catégorie de limite
#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum LimitCategory {
    /// Sécurité
    Security,
    /// Éthique
    Ethics,
    /// Ressources
    Resources,
    /// Données
    Data,
    /// Comportement
    Behavior,
    /// Performance
    Performance,
}

/// Définition d'une limite
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Limit {
    pub id: String,
    pub name: String,
    pub description: String,
    pub limit_type: LimitType,
    pub category: LimitCategory,
    pub threshold: Option<f64>,
    pub current_value: Option<f64>,
    pub enforcement_action: String,
    pub exceptions: Vec<LimitException>,
    pub active: bool,
}

/// Exception à une limite
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct LimitException {
    pub condition: String,
    pub authorized_by: String,
    pub expires_at: Option<u64>,
    pub reason: String,
}

/// Résultat de vérification de limite
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct LimitCheckResult {
    pub limit_id: String,
    pub exceeded: bool,
    pub current_value: Option<f64>,
    pub threshold: Option<f64>,
    pub margin: Option<f64>,
    pub exception_applied: Option<String>,
    pub enforcement_required: bool,
}

/// Système de limites
pub struct LimitSystem {
    limits: Vec<Limit>,
}

impl LimitSystem {
    /// Crée un système vide
    pub fn new() -> Self {
        Self { limits: Vec::new() }
    }

    /// Crée le système de limites TITANE∞ par défaut
    pub fn default_titane() -> Self {
        let limits = vec![
            // Limites absolues de sécurité
            Limit {
                id: "no_system_damage".to_string(),
                name: "No System Damage".to_string(),
                description: "Never perform actions that could damage the host system".to_string(),
                limit_type: LimitType::Absolute,
                category: LimitCategory::Security,
                threshold: None,
                current_value: None,
                enforcement_action: "block_action".to_string(),
                exceptions: vec![],
                active: true,
            },
            Limit {
                id: "no_data_exfiltration".to_string(),
                name: "No Data Exfiltration".to_string(),
                description: "Never send user data to unauthorized destinations".to_string(),
                limit_type: LimitType::Absolute,
                category: LimitCategory::Data,
                threshold: None,
                current_value: None,
                enforcement_action: "block_action".to_string(),
                exceptions: vec![],
                active: true,
            },
            Limit {
                id: "no_unauthorized_access".to_string(),
                name: "No Unauthorized Access".to_string(),
                description: "Never access resources without proper authorization".to_string(),
                limit_type: LimitType::Absolute,
                category: LimitCategory::Security,
                threshold: None,
                current_value: None,
                enforcement_action: "block_action".to_string(),
                exceptions: vec![],
                active: true,
            },
            // Limites éthiques
            Limit {
                id: "no_deception".to_string(),
                name: "No Deception".to_string(),
                description: "Never deliberately deceive or mislead users".to_string(),
                limit_type: LimitType::Absolute,
                category: LimitCategory::Ethics,
                threshold: None,
                current_value: None,
                enforcement_action: "block_action".to_string(),
                exceptions: vec![],
                active: true,
            },
            Limit {
                id: "no_harmful_content".to_string(),
                name: "No Harmful Content".to_string(),
                description: "Never generate harmful, illegal, or dangerous content".to_string(),
                limit_type: LimitType::Absolute,
                category: LimitCategory::Ethics,
                threshold: None,
                current_value: None,
                enforcement_action: "block_action".to_string(),
                exceptions: vec![],
                active: true,
            },
            // Limites de ressources (conditionnelles)
            Limit {
                id: "memory_usage".to_string(),
                name: "Memory Usage Limit".to_string(),
                description: "Maximum memory consumption allowed".to_string(),
                limit_type: LimitType::Conditional,
                category: LimitCategory::Resources,
                threshold: Some(1024.0), // MB
                current_value: Some(0.0),
                enforcement_action: "trigger_gc".to_string(),
                exceptions: vec![LimitException {
                    condition: "batch_processing".to_string(),
                    authorized_by: "system".to_string(),
                    expires_at: None,
                    reason: "Batch operations may need more memory".to_string(),
                }],
                active: true,
            },
            Limit {
                id: "cpu_usage".to_string(),
                name: "CPU Usage Limit".to_string(),
                description: "Maximum sustained CPU usage".to_string(),
                limit_type: LimitType::Soft,
                category: LimitCategory::Resources,
                threshold: Some(80.0), // Percentage
                current_value: Some(0.0),
                enforcement_action: "throttle".to_string(),
                exceptions: vec![],
                active: true,
            },
            // Limites de comportement
            Limit {
                id: "response_time".to_string(),
                name: "Response Time Limit".to_string(),
                description: "Maximum allowed response time".to_string(),
                limit_type: LimitType::Soft,
                category: LimitCategory::Performance,
                threshold: Some(5000.0), // ms
                current_value: Some(0.0),
                enforcement_action: "warn".to_string(),
                exceptions: vec![],
                active: true,
            },
            Limit {
                id: "concurrent_operations".to_string(),
                name: "Concurrent Operations Limit".to_string(),
                description: "Maximum number of concurrent operations".to_string(),
                limit_type: LimitType::Conditional,
                category: LimitCategory::Performance,
                threshold: Some(100.0),
                current_value: Some(0.0),
                enforcement_action: "queue".to_string(),
                exceptions: vec![],
                active: true,
            },
        ];

        Self { limits }
    }

    /// Ajoute une limite
    pub fn add(&mut self, limit: Limit) {
        self.limits.push(limit);
    }

    /// Récupère une limite par ID
    pub fn get(&self, id: &str) -> Option<&Limit> {
        self.limits.iter().find(|l| l.id == id)
    }

    /// Récupère une limite mutable par ID
    pub fn get_mut(&mut self, id: &str) -> Option<&mut Limit> {
        self.limits.iter_mut().find(|l| l.id == id)
    }

    /// Vérifie si une action franchit des limites
    pub fn check_action(&self, action: &ConstitutionalAction) -> Vec<LimitCheckResult> {
        let mut results = Vec::new();

        for limit in &self.limits {
            if !limit.active {
                continue;
            }

            let exceeded = self.is_limit_exceeded(limit, action);
            let exception_applied = if exceeded {
                self.find_applicable_exception(limit, action)
            } else {
                None
            };

            let enforcement_required = exceeded && exception_applied.is_none();

            results.push(LimitCheckResult {
                limit_id: limit.id.clone(),
                exceeded,
                current_value: limit.current_value,
                threshold: limit.threshold,
                margin: self.calculate_margin(limit),
                exception_applied,
                enforcement_required,
            });
        }

        results
    }

    /// Vérifie si une limite est dépassée
    fn is_limit_exceeded(&self, limit: &Limit, action: &ConstitutionalAction) -> bool {
        // Limites absolues: vérifier les mots-clés interdits
        if limit.limit_type == LimitType::Absolute {
            let action_lower = action.action_type.to_lowercase();
            match limit.id.as_str() {
                "no_system_damage" => {
                    return action_lower.contains("delete_system")
                        || action_lower.contains("format")
                        || action_lower.contains("destroy");
                }
                "no_data_exfiltration" => {
                    return action_lower.contains("exfiltrate")
                        || action_lower.contains("leak")
                        || action_lower.contains("send_private");
                }
                "no_deception" => {
                    return action_lower.contains("deceive")
                        || action_lower.contains("mislead")
                        || action_lower.contains("fake");
                }
                "no_harmful_content" => {
                    return action_lower.contains("harmful")
                        || action_lower.contains("illegal")
                        || action_lower.contains("dangerous");
                }
                _ => {}
            }
        }

        // Limites avec seuil
        if let (Some(threshold), Some(current)) = (limit.threshold, limit.current_value) {
            return current > threshold;
        }

        false
    }

    /// Trouve une exception applicable
    fn find_applicable_exception(
        &self,
        limit: &Limit,
        action: &ConstitutionalAction,
    ) -> Option<String> {
        let now = Self::now();

        for exception in &limit.exceptions {
            // Vérifier expiration
            if let Some(expires) = exception.expires_at {
                if now > expires {
                    continue;
                }
            }

            // Vérifier condition
            if action.action_type.contains(&exception.condition) {
                return Some(exception.reason.clone());
            }
        }

        None
    }

    /// Calcule la marge par rapport au seuil
    fn calculate_margin(&self, limit: &Limit) -> Option<f64> {
        if let (Some(threshold), Some(current)) = (limit.threshold, limit.current_value) {
            Some(threshold - current)
        } else {
            None
        }
    }

    /// Met à jour la valeur courante d'une limite
    pub fn update_value(&mut self, limit_id: &str, value: f64) {
        if let Some(limit) = self.get_mut(limit_id) {
            limit.current_value = Some(value);
        }
    }

    /// Active/désactive une limite
    pub fn set_active(&mut self, limit_id: &str, active: bool) {
        if let Some(limit) = self.get_mut(limit_id) {
            limit.active = active;
        }
    }

    /// Limites par catégorie
    pub fn by_category(&self, category: LimitCategory) -> Vec<&Limit> {
        self.limits
            .iter()
            .filter(|l| l.category == category)
            .collect()
    }

    /// Limites par type
    pub fn by_type(&self, limit_type: LimitType) -> Vec<&Limit> {
        self.limits
            .iter()
            .filter(|l| l.limit_type == limit_type)
            .collect()
    }

    /// Limites absolues
    pub fn absolute_limits(&self) -> Vec<&Limit> {
        self.by_type(LimitType::Absolute)
    }

    /// Limites dépassées
    pub fn exceeded_limits(&self) -> Vec<&Limit> {
        self.limits
            .iter()
            .filter(|l| {
                if let (Some(threshold), Some(current)) = (l.threshold, l.current_value) {
                    current > threshold
                } else {
                    false
                }
            })
            .collect()
    }

    /// Nombre de limites
    pub fn len(&self) -> usize {
        self.limits.len()
    }

    /// Est vide?
    pub fn is_empty(&self) -> bool {
        self.limits.is_empty()
    }

    fn now() -> u64 {
        std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap_or_default()
            .as_millis() as u64
    }
}

impl Default for LimitSystem {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_limit_system_creation() {
        let limits = LimitSystem::default_titane();
        assert!(!limits.is_empty());
    }

    #[test]
    fn test_absolute_limits() {
        let limits = LimitSystem::default_titane();
        let absolute = limits.absolute_limits();
        assert!(!absolute.is_empty());
    }

    #[test]
    fn test_limit_check() {
        let limits = LimitSystem::default_titane();
        let action = ConstitutionalAction {
            action_type: "normal_action".to_string(),
            target: "user".to_string(),
            parameters: std::collections::HashMap::new(),
            requester: "system".to_string(),
            timestamp: 0,
        };

        let results = limits.check_action(&action);
        assert!(!results.is_empty());

        // Normal action should not exceed limits
        let enforcement_needed: Vec<_> =
            results.iter().filter(|r| r.enforcement_required).collect();
        assert!(enforcement_needed.is_empty());
    }

    #[test]
    fn test_harmful_action_blocked() {
        let limits = LimitSystem::default_titane();
        let action = ConstitutionalAction {
            action_type: "deceive_user".to_string(),
            target: "user".to_string(),
            parameters: std::collections::HashMap::new(),
            requester: "attacker".to_string(),
            timestamp: 0,
        };

        let results = limits.check_action(&action);
        let enforcement_needed: Vec<_> =
            results.iter().filter(|r| r.enforcement_required).collect();
        assert!(!enforcement_needed.is_empty());
    }
}
