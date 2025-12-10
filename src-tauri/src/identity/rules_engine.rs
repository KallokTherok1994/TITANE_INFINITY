// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v∞ — RULES ENGINE
//   Moteur de règles comportementales
// ═══════════════════════════════════════════════════════════════

use super::BehavioralRule;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// Type de règle
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum RuleType {
    /// Règle de comportement général
    Behavioral,
    /// Règle de sécurité
    Security,
    /// Règle de qualité
    Quality,
    /// Règle de style
    Style,
    /// Règle d'éthique
    Ethics,
    /// Règle de performance
    Performance,
}

/// Sévérité de violation
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum ViolationSeverity {
    Info,
    Warning,
    Error,
    Critical,
}

/// Violation de règle détectée
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RuleViolation {
    pub rule_id: String,
    pub rule_name: String,
    pub severity: ViolationSeverity,
    pub message: String,
    pub context: String,
    pub timestamp: String,
    pub auto_corrected: bool,
}

/// Règle étendue avec métadonnées
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExtendedRule {
    pub base: BehavioralRule,
    pub rule_type: RuleType,
    pub severity: ViolationSeverity,
    pub auto_correct: bool,
    pub correction_action: Option<String>,
    pub created_at: String,
    pub last_triggered: Option<String>,
    pub trigger_count: u64,
}

/// Résultat d'évaluation de règle
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RuleEvaluation {
    pub rule_id: String,
    pub passed: bool,
    pub violation: Option<RuleViolation>,
    pub duration_ms: u64,
}

/// Moteur de règles
pub struct RulesEngine {
    rules: HashMap<String, ExtendedRule>,
    violation_history: Vec<RuleViolation>,
    evaluation_cache: HashMap<String, RuleEvaluation>,
    enabled: bool,
}

impl Default for RulesEngine {
    fn default() -> Self {
        let mut engine = Self {
            rules: HashMap::new(),
            violation_history: vec![],
            evaluation_cache: HashMap::new(),
            enabled: true,
        };
        engine.initialize_default_rules();
        engine
    }
}

impl RulesEngine {
    /// Initialise les règles par défaut
    fn initialize_default_rules(&mut self) {
        // Règle: Ne jamais mentir
        self.add_rule(ExtendedRule {
            base: BehavioralRule {
                id: "ETHICS-001".to_string(),
                name: "Honnêteté absolue".to_string(),
                description: "Ne jamais fournir d'information délibérément fausse".to_string(),
                condition: "response.contains_false_claim".to_string(),
                action: "reject_and_correct".to_string(),
                priority: 10,
                enabled: true,
                violations: 0,
            },
            rule_type: RuleType::Ethics,
            severity: ViolationSeverity::Critical,
            auto_correct: true,
            correction_action: Some("Reformuler avec information vérifiée".to_string()),
            created_at: chrono::Utc::now().to_rfc3339(),
            last_triggered: None,
            trigger_count: 0,
        });

        // Règle: Respect de l'utilisateur
        self.add_rule(ExtendedRule {
            base: BehavioralRule {
                id: "ETHICS-002".to_string(),
                name: "Respect utilisateur".to_string(),
                description: "Toujours traiter l'utilisateur avec respect".to_string(),
                condition: "response.is_disrespectful".to_string(),
                action: "reject".to_string(),
                priority: 10,
                enabled: true,
                violations: 0,
            },
            rule_type: RuleType::Ethics,
            severity: ViolationSeverity::Critical,
            auto_correct: false,
            correction_action: None,
            created_at: chrono::Utc::now().to_rfc3339(),
            last_triggered: None,
            trigger_count: 0,
        });

        // Règle: Pas de contenu dangereux
        self.add_rule(ExtendedRule {
            base: BehavioralRule {
                id: "SECURITY-001".to_string(),
                name: "Contenu sécurisé".to_string(),
                description: "Ne jamais fournir d'instructions dangereuses".to_string(),
                condition: "response.contains_dangerous_content".to_string(),
                action: "reject".to_string(),
                priority: 10,
                enabled: true,
                violations: 0,
            },
            rule_type: RuleType::Security,
            severity: ViolationSeverity::Critical,
            auto_correct: false,
            correction_action: None,
            created_at: chrono::Utc::now().to_rfc3339(),
            last_triggered: None,
            trigger_count: 0,
        });

        // Règle: Qualité des réponses
        self.add_rule(ExtendedRule {
            base: BehavioralRule {
                id: "QUALITY-001".to_string(),
                name: "Réponse complète".to_string(),
                description: "Les réponses doivent être substantielles".to_string(),
                condition: "response.length < 10 && !context.requires_short".to_string(),
                action: "warn".to_string(),
                priority: 5,
                enabled: true,
                violations: 0,
            },
            rule_type: RuleType::Quality,
            severity: ViolationSeverity::Warning,
            auto_correct: false,
            correction_action: None,
            created_at: chrono::Utc::now().to_rfc3339(),
            last_triggered: None,
            trigger_count: 0,
        });

        // Règle: Cohérence stylistique
        self.add_rule(ExtendedRule {
            base: BehavioralRule {
                id: "STYLE-001".to_string(),
                name: "Cohérence tonale".to_string(),
                description: "Maintenir une tonalité cohérente".to_string(),
                condition: "response.tone != context.expected_tone".to_string(),
                action: "adjust".to_string(),
                priority: 3,
                enabled: true,
                violations: 0,
            },
            rule_type: RuleType::Style,
            severity: ViolationSeverity::Info,
            auto_correct: true,
            correction_action: Some("Ajuster la tonalité".to_string()),
            created_at: chrono::Utc::now().to_rfc3339(),
            last_triggered: None,
            trigger_count: 0,
        });

        // Règle: Limite de longueur
        self.add_rule(ExtendedRule {
            base: BehavioralRule {
                id: "PERFORMANCE-001".to_string(),
                name: "Limite de longueur".to_string(),
                description: "Respecter les limites de longueur du mode".to_string(),
                condition: "response.length > mode.max_length".to_string(),
                action: "truncate".to_string(),
                priority: 4,
                enabled: true,
                violations: 0,
            },
            rule_type: RuleType::Performance,
            severity: ViolationSeverity::Warning,
            auto_correct: true,
            correction_action: Some("Résumer ou tronquer".to_string()),
            created_at: chrono::Utc::now().to_rfc3339(),
            last_triggered: None,
            trigger_count: 0,
        });

        // Règle: Admettre l'incertitude
        self.add_rule(ExtendedRule {
            base: BehavioralRule {
                id: "BEHAVIORAL-001".to_string(),
                name: "Transparence incertitude".to_string(),
                description: "Exprimer clairement l'incertitude quand approprié".to_string(),
                condition: "response.high_uncertainty && !response.expresses_uncertainty"
                    .to_string(),
                action: "add_uncertainty_marker".to_string(),
                priority: 6,
                enabled: true,
                violations: 0,
            },
            rule_type: RuleType::Behavioral,
            severity: ViolationSeverity::Warning,
            auto_correct: true,
            correction_action: Some("Ajouter indicateur d'incertitude".to_string()),
            created_at: chrono::Utc::now().to_rfc3339(),
            last_triggered: None,
            trigger_count: 0,
        });
    }

    /// Ajoute une règle
    pub fn add_rule(&mut self, rule: ExtendedRule) {
        self.rules.insert(rule.base.id.clone(), rule);
    }

    /// Supprime une règle
    pub fn remove_rule(&mut self, id: &str) -> bool {
        self.rules.remove(id).is_some()
    }

    /// Active/désactive une règle
    pub fn toggle_rule(&mut self, id: &str, enabled: bool) -> bool {
        if let Some(rule) = self.rules.get_mut(id) {
            rule.base.enabled = enabled;
            true
        } else {
            false
        }
    }

    /// Évalue une règle spécifique
    pub fn evaluate_rule(&mut self, id: &str, context: &RuleContext) -> Option<RuleEvaluation> {
        let rule = self.rules.get(id)?;

        if !rule.base.enabled {
            return Some(RuleEvaluation {
                rule_id: id.to_string(),
                passed: true,
                violation: None,
                duration_ms: 0,
            });
        }

        let start = std::time::Instant::now();
        let passed = self.check_condition(&rule.base.condition, context);
        let duration = start.elapsed().as_millis() as u64;

        let violation = if !passed {
            Some(RuleViolation {
                rule_id: rule.base.id.clone(),
                rule_name: rule.base.name.clone(),
                severity: rule.severity,
                message: format!("Violation de la règle: {}", rule.base.description),
                context: context.description.clone(),
                timestamp: chrono::Utc::now().to_rfc3339(),
                auto_corrected: rule.auto_correct,
            })
        } else {
            None
        };

        if let Some(ref v) = violation {
            self.violation_history.push(v.clone());
            if let Some(r) = self.rules.get_mut(id) {
                r.base.violations += 1;
                r.trigger_count += 1;
                r.last_triggered = Some(chrono::Utc::now().to_rfc3339());
            }
        }

        Some(RuleEvaluation {
            rule_id: id.to_string(),
            passed,
            violation,
            duration_ms: duration,
        })
    }

    /// Évalue toutes les règles actives
    pub fn evaluate_all(&mut self, context: &RuleContext) -> Vec<RuleEvaluation> {
        let rule_ids: Vec<String> = self.rules.keys().cloned().collect();
        let mut results = vec![];

        for id in rule_ids {
            if let Some(eval) = self.evaluate_rule(&id, context) {
                results.push(eval);
            }
        }

        // Trier par sévérité
        results.sort_by(|a, b| {
            let sev_a = a.violation.as_ref().map(|v| v.severity as u8).unwrap_or(0);
            let sev_b = b.violation.as_ref().map(|v| v.severity as u8).unwrap_or(0);
            sev_b.cmp(&sev_a)
        });

        results
    }

    /// Vérifie une condition (implémentation simplifiée)
    fn check_condition(&self, _condition: &str, context: &RuleContext) -> bool {
        // Implémentation simplifiée - en production, utiliser un parser de règles
        // Pour l'instant, on vérifie quelques patterns simples

        // Toujours passer si le contexte est safe
        if context.safe_mode {
            return true;
        }

        // Vérifications basiques
        if context.content.to_lowercase().contains("mensonge") {
            return false;
        }

        if context.content.to_lowercase().contains("irrespect") {
            return false;
        }

        true
    }

    /// Obtient les violations récentes
    pub fn get_recent_violations(&self, limit: usize) -> Vec<&RuleViolation> {
        self.violation_history.iter().rev().take(limit).collect()
    }

    /// Obtient les statistiques des règles
    pub fn get_stats(&self) -> RulesStats {
        let total_rules = self.rules.len();
        let active_rules = self.rules.values().filter(|r| r.base.enabled).count();
        let total_violations: u64 = self.rules.values().map(|r| r.base.violations as u64).sum();

        let by_type: HashMap<String, usize> =
            self.rules.values().fold(HashMap::new(), |mut acc, r| {
                *acc.entry(format!("{:?}", r.rule_type)).or_insert(0) += 1;
                acc
            });

        RulesStats {
            total_rules,
            active_rules,
            total_violations,
            rules_by_type: by_type,
        }
    }

    /// Liste toutes les règles
    pub fn list_rules(&self) -> Vec<&ExtendedRule> {
        self.rules.values().collect()
    }
}

/// Contexte d'évaluation de règle
#[derive(Debug, Clone)]
pub struct RuleContext {
    pub content: String,
    pub description: String,
    pub safe_mode: bool,
    pub metadata: HashMap<String, String>,
}

/// Statistiques des règles
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RulesStats {
    pub total_rules: usize,
    pub active_rules: usize,
    pub total_violations: u64,
    pub rules_by_type: HashMap<String, usize>,
}
