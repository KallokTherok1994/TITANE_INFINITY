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

#[cfg(test)]
mod tests {
    use super::*;

    // ========== RuleType Tests ==========

    #[test]
    fn test_rule_type_behavioral() {
        let rt = RuleType::Behavioral;
        assert_eq!(rt, RuleType::Behavioral);
    }

    #[test]
    fn test_rule_type_security() {
        let rt = RuleType::Security;
        assert_eq!(rt, RuleType::Security);
    }

    #[test]
    fn test_rule_type_quality() {
        let rt = RuleType::Quality;
        assert_eq!(rt, RuleType::Quality);
    }

    #[test]
    fn test_rule_type_style() {
        let rt = RuleType::Style;
        assert_eq!(rt, RuleType::Style);
    }

    #[test]
    fn test_rule_type_ethics() {
        let rt = RuleType::Ethics;
        assert_eq!(rt, RuleType::Ethics);
    }

    #[test]
    fn test_rule_type_performance() {
        let rt = RuleType::Performance;
        assert_eq!(rt, RuleType::Performance);
    }

    #[test]
    fn test_rule_type_clone() {
        let rt = RuleType::Behavioral;
        let cloned = rt.clone();
        assert_eq!(rt, cloned);
    }

    #[test]
    fn test_rule_type_copy() {
        let rt = RuleType::Security;
        let copied = rt;
        assert_eq!(rt, copied);
    }

    #[test]
    fn test_rule_type_debug() {
        let rt = RuleType::Quality;
        let debug = format!("{:?}", rt);
        assert!(debug.contains("Quality"));
    }

    #[test]
    fn test_rule_type_serialize() {
        let rt = RuleType::Ethics;
        let json = serde_json::to_string(&rt).expect("RuleType should serialize to JSON");
        assert!(json.contains("Ethics"));
    }

    #[test]
    fn test_rule_type_deserialize() {
        let json = "\"Performance\"";
        let rt: RuleType = serde_json::from_str(json).expect("RuleType should deserialize");
        assert_eq!(rt, RuleType::Performance);
    }

    // ========== ViolationSeverity Tests ==========

    #[test]
    fn test_violation_severity_info() {
        let vs = ViolationSeverity::Info;
        assert_eq!(vs, ViolationSeverity::Info);
    }

    #[test]
    fn test_violation_severity_warning() {
        let vs = ViolationSeverity::Warning;
        assert_eq!(vs, ViolationSeverity::Warning);
    }

    #[test]
    fn test_violation_severity_error() {
        let vs = ViolationSeverity::Error;
        assert_eq!(vs, ViolationSeverity::Error);
    }

    #[test]
    fn test_violation_severity_critical() {
        let vs = ViolationSeverity::Critical;
        assert_eq!(vs, ViolationSeverity::Critical);
    }

    #[test]
    fn test_violation_severity_clone() {
        let vs = ViolationSeverity::Warning;
        let cloned = vs.clone();
        assert_eq!(vs, cloned);
    }

    #[test]
    fn test_violation_severity_copy() {
        let vs = ViolationSeverity::Error;
        let copied = vs;
        assert_eq!(vs, copied);
    }

    #[test]
    fn test_violation_severity_debug() {
        let vs = ViolationSeverity::Critical;
        let debug = format!("{:?}", vs);
        assert!(debug.contains("Critical"));
    }

    #[test]
    fn test_violation_severity_serialize() {
        let vs = ViolationSeverity::Warning;
        let json = serde_json::to_string(&vs)
            .expect("ViolationSeverity should serialize to JSON");
        assert!(json.contains("Warning"));
    }

    // ========== RuleViolation Tests ==========

    #[test]
    fn test_rule_violation_creation() {
        let violation = RuleViolation {
            rule_id: "TEST-001".to_string(),
            rule_name: "Test Rule".to_string(),
            severity: ViolationSeverity::Warning,
            message: "Test message".to_string(),
            context: "Test context".to_string(),
            timestamp: "2024-01-01T00:00:00Z".to_string(),
            auto_corrected: false,
        };
        assert_eq!(violation.rule_id, "TEST-001");
        assert!(!violation.auto_corrected);
    }

    #[test]
    fn test_rule_violation_clone() {
        let violation = RuleViolation {
            rule_id: "TEST-002".to_string(),
            rule_name: "Test Rule 2".to_string(),
            severity: ViolationSeverity::Error,
            message: "Error message".to_string(),
            context: "Error context".to_string(),
            timestamp: "2024-01-01T00:00:00Z".to_string(),
            auto_corrected: true,
        };
        let cloned = violation.clone();
        assert_eq!(cloned.rule_id, violation.rule_id);
    }

    #[test]
    fn test_rule_violation_debug() {
        let violation = RuleViolation {
            rule_id: "TEST-003".to_string(),
            rule_name: "Test Rule 3".to_string(),
            severity: ViolationSeverity::Critical,
            message: "Critical message".to_string(),
            context: "Critical context".to_string(),
            timestamp: "2024-01-01T00:00:00Z".to_string(),
            auto_corrected: false,
        };
        let debug = format!("{:?}", violation);
        assert!(debug.contains("TEST-003"));
    }

    #[test]
    fn test_rule_violation_serialize() {
        let violation = RuleViolation {
            rule_id: "TEST-004".to_string(),
            rule_name: "Test Rule 4".to_string(),
            severity: ViolationSeverity::Info,
            message: "Info message".to_string(),
            context: "Info context".to_string(),
            timestamp: "2024-01-01T00:00:00Z".to_string(),
            auto_corrected: false,
        };
        let json = serde_json::to_string(&violation)
            .expect("RuleViolation should serialize to JSON");
        assert!(json.contains("TEST-004"));
    }

    // ========== RuleEvaluation Tests ==========

    #[test]
    fn test_rule_evaluation_passed() {
        let eval = RuleEvaluation {
            rule_id: "EVAL-001".to_string(),
            passed: true,
            violation: None,
            duration_ms: 5,
        };
        assert!(eval.passed);
        assert!(eval.violation.is_none());
    }

    #[test]
    fn test_rule_evaluation_failed() {
        let eval = RuleEvaluation {
            rule_id: "EVAL-002".to_string(),
            passed: false,
            violation: Some(RuleViolation {
                rule_id: "EVAL-002".to_string(),
                rule_name: "Test".to_string(),
                severity: ViolationSeverity::Error,
                message: "Failed".to_string(),
                context: "Test".to_string(),
                timestamp: "2024-01-01T00:00:00Z".to_string(),
                auto_corrected: false,
            }),
            duration_ms: 10,
        };
        assert!(!eval.passed);
        assert!(eval.violation.is_some());
    }

    #[test]
    fn test_rule_evaluation_clone() {
        let eval = RuleEvaluation {
            rule_id: "EVAL-003".to_string(),
            passed: true,
            violation: None,
            duration_ms: 3,
        };
        let cloned = eval.clone();
        assert_eq!(cloned.rule_id, eval.rule_id);
    }

    #[test]
    fn test_rule_evaluation_serialize() {
        let eval = RuleEvaluation {
            rule_id: "EVAL-004".to_string(),
            passed: true,
            violation: None,
            duration_ms: 1,
        };
        let json = serde_json::to_string(&eval)
            .expect("RuleEvaluation should serialize to JSON");
        assert!(json.contains("EVAL-004"));
    }

    // ========== RuleContext Tests ==========

    #[test]
    fn test_rule_context_creation() {
        let ctx = RuleContext {
            content: "Test content".to_string(),
            description: "Test description".to_string(),
            safe_mode: false,
            metadata: HashMap::new(),
        };
        assert_eq!(ctx.content, "Test content");
        assert!(!ctx.safe_mode);
    }

    #[test]
    fn test_rule_context_safe_mode() {
        let ctx = RuleContext {
            content: "Safe content".to_string(),
            description: "Safe description".to_string(),
            safe_mode: true,
            metadata: HashMap::new(),
        };
        assert!(ctx.safe_mode);
    }

    #[test]
    fn test_rule_context_with_metadata() {
        let mut metadata = HashMap::new();
        metadata.insert("key".to_string(), "value".to_string());
        let ctx = RuleContext {
            content: "Content".to_string(),
            description: "Description".to_string(),
            safe_mode: false,
            metadata,
        };
        assert_eq!(ctx.metadata.get("key"), Some(&"value".to_string()));
    }

    #[test]
    fn test_rule_context_clone() {
        let ctx = RuleContext {
            content: "Clone test".to_string(),
            description: "Clone description".to_string(),
            safe_mode: false,
            metadata: HashMap::new(),
        };
        let cloned = ctx.clone();
        assert_eq!(cloned.content, ctx.content);
    }

    // ========== RulesStats Tests ==========

    #[test]
    fn test_rules_stats_creation() {
        let stats = RulesStats {
            total_rules: 10,
            active_rules: 8,
            total_violations: 5,
            rules_by_type: HashMap::new(),
        };
        assert_eq!(stats.total_rules, 10);
        assert_eq!(stats.active_rules, 8);
    }

    #[test]
    fn test_rules_stats_clone() {
        let stats = RulesStats {
            total_rules: 5,
            active_rules: 5,
            total_violations: 0,
            rules_by_type: HashMap::new(),
        };
        let cloned = stats.clone();
        assert_eq!(cloned.total_rules, stats.total_rules);
    }

    #[test]
    fn test_rules_stats_debug() {
        let stats = RulesStats {
            total_rules: 3,
            active_rules: 2,
            total_violations: 1,
            rules_by_type: HashMap::new(),
        };
        let debug = format!("{:?}", stats);
        assert!(debug.contains("total_rules"));
    }

    #[test]
    fn test_rules_stats_serialize() {
        let stats = RulesStats {
            total_rules: 7,
            active_rules: 6,
            total_violations: 2,
            rules_by_type: HashMap::new(),
        };
        let json = serde_json::to_string(&stats).expect("RulesStats should serialize to JSON");
        assert!(json.contains("total_rules"));
    }

    // ========== RulesEngine Tests ==========

    #[test]
    fn test_rules_engine_default() {
        let engine = RulesEngine::default();
        assert!(engine.enabled);
        assert!(!engine.rules.is_empty());
    }

    #[test]
    fn test_rules_engine_default_rules() {
        let engine = RulesEngine::default();
        assert!(engine.rules.contains_key("ETHICS-001"));
        assert!(engine.rules.contains_key("ETHICS-002"));
        assert!(engine.rules.contains_key("SECURITY-001"));
        assert!(engine.rules.contains_key("QUALITY-001"));
        assert!(engine.rules.contains_key("STYLE-001"));
        assert!(engine.rules.contains_key("PERFORMANCE-001"));
        assert!(engine.rules.contains_key("BEHAVIORAL-001"));
    }

    #[test]
    fn test_rules_engine_list_rules() {
        let engine = RulesEngine::default();
        let rules = engine.list_rules();
        assert!(rules.len() >= 7);
    }

    #[test]
    fn test_rules_engine_toggle_rule_enable() {
        let mut engine = RulesEngine::default();
        engine.toggle_rule("ETHICS-001", false);
        assert!(
            !engine
                .rules
                .get("ETHICS-001")
                .expect("default rules should contain ETHICS-001")
                .base
                .enabled
        );
    }

    #[test]
    fn test_rules_engine_toggle_rule_disable() {
        let mut engine = RulesEngine::default();
        engine.toggle_rule("ETHICS-001", false);
        engine.toggle_rule("ETHICS-001", true);
        assert!(
            engine
                .rules
                .get("ETHICS-001")
                .expect("default rules should contain ETHICS-001")
                .base
                .enabled
        );
    }

    #[test]
    fn test_rules_engine_toggle_nonexistent() {
        let mut engine = RulesEngine::default();
        let result = engine.toggle_rule("NONEXISTENT", false);
        assert!(!result);
    }

    #[test]
    fn test_rules_engine_remove_rule() {
        let mut engine = RulesEngine::default();
        let removed = engine.remove_rule("STYLE-001");
        assert!(removed);
        assert!(!engine.rules.contains_key("STYLE-001"));
    }

    #[test]
    fn test_rules_engine_remove_nonexistent() {
        let mut engine = RulesEngine::default();
        let removed = engine.remove_rule("NONEXISTENT");
        assert!(!removed);
    }

    #[test]
    fn test_rules_engine_get_stats() {
        let engine = RulesEngine::default();
        let stats = engine.get_stats();
        assert!(stats.total_rules >= 7);
        assert!(stats.active_rules >= 7);
        assert_eq!(stats.total_violations, 0);
    }

    #[test]
    fn test_rules_engine_get_recent_violations_empty() {
        let engine = RulesEngine::default();
        let violations = engine.get_recent_violations(10);
        assert!(violations.is_empty());
    }

    #[test]
    fn test_rules_engine_evaluate_rule_disabled() {
        let mut engine = RulesEngine::default();
        engine.toggle_rule("ETHICS-001", false);
        let ctx = RuleContext {
            content: "test".to_string(),
            description: "test".to_string(),
            safe_mode: false,
            metadata: HashMap::new(),
        };
        let result = engine.evaluate_rule("ETHICS-001", &ctx);
        assert!(result.is_some());
        assert!(
            result
                .expect("evaluate_rule should return Some when rule exists")
                .passed
        );
    }

    #[test]
    fn test_rules_engine_evaluate_rule_safe_mode() {
        let mut engine = RulesEngine::default();
        let ctx = RuleContext {
            content: "mensonge".to_string(), // Would normally fail
            description: "test".to_string(),
            safe_mode: true,
            metadata: HashMap::new(),
        };
        let result = engine.evaluate_rule("ETHICS-001", &ctx);
        assert!(result.is_some());
        assert!(
            result
                .expect("evaluate_rule should return Some when rule exists")
                .passed
        );
    }

    #[test]
    fn test_rules_engine_evaluate_rule_violation() {
        let mut engine = RulesEngine::default();
        let ctx = RuleContext {
            content: "contenu avec mensonge".to_string(),
            description: "test".to_string(),
            safe_mode: false,
            metadata: HashMap::new(),
        };
        let result = engine.evaluate_rule("ETHICS-001", &ctx);
        assert!(result.is_some());
        let eval = result.expect("evaluate_rule should return Some when rule exists");
        assert!(!eval.passed);
        assert!(eval.violation.is_some());
    }

    #[test]
    fn test_rules_engine_evaluate_all() {
        let mut engine = RulesEngine::default();
        let ctx = RuleContext {
            content: "normal content".to_string(),
            description: "test".to_string(),
            safe_mode: false,
            metadata: HashMap::new(),
        };
        let results = engine.evaluate_all(&ctx);
        assert!(!results.is_empty());
    }

    #[test]
    fn test_rules_engine_evaluate_all_safe_mode() {
        let mut engine = RulesEngine::default();
        let ctx = RuleContext {
            content: "mensonge irrespect".to_string(),
            description: "test".to_string(),
            safe_mode: true,
            metadata: HashMap::new(),
        };
        let results = engine.evaluate_all(&ctx);
        for result in results {
            assert!(result.passed);
        }
    }

    #[test]
    fn test_rules_engine_violation_history() {
        let mut engine = RulesEngine::default();
        let ctx = RuleContext {
            content: "contenu avec mensonge".to_string(),
            description: "test".to_string(),
            safe_mode: false,
            metadata: HashMap::new(),
        };
        engine.evaluate_rule("ETHICS-001", &ctx);
        let violations = engine.get_recent_violations(10);
        assert!(!violations.is_empty());
    }

    #[test]
    fn test_rules_engine_violation_count_increment() {
        let mut engine = RulesEngine::default();
        let initial = engine
            .rules
            .get("ETHICS-001")
            .expect("default rules should contain ETHICS-001")
            .base
            .violations;
        let ctx = RuleContext {
            content: "contenu avec mensonge".to_string(),
            description: "test".to_string(),
            safe_mode: false,
            metadata: HashMap::new(),
        };
        engine.evaluate_rule("ETHICS-001", &ctx);
        let after = engine
            .rules
            .get("ETHICS-001")
            .expect("default rules should contain ETHICS-001")
            .base
            .violations;
        assert_eq!(after, initial + 1);
    }

    #[test]
    fn test_rules_engine_evaluate_nonexistent() {
        let mut engine = RulesEngine::default();
        let ctx = RuleContext {
            content: "test".to_string(),
            description: "test".to_string(),
            safe_mode: false,
            metadata: HashMap::new(),
        };
        let result = engine.evaluate_rule("NONEXISTENT", &ctx);
        assert!(result.is_none());
    }

    #[test]
    fn test_rules_engine_irrespect_violation() {
        let mut engine = RulesEngine::default();
        let ctx = RuleContext {
            content: "contenu irrespect".to_string(),
            description: "test".to_string(),
            safe_mode: false,
            metadata: HashMap::new(),
        };
        let result = engine.evaluate_rule("ETHICS-002", &ctx);
        assert!(result.is_some());
        assert!(
            !result
                .expect("evaluate_rule should return Some when rule exists")
                .passed
        );
    }

    #[test]
    fn test_rules_engine_stats_by_type() {
        let engine = RulesEngine::default();
        let stats = engine.get_stats();
        assert!(stats.rules_by_type.contains_key("Ethics"));
        assert!(stats.rules_by_type.contains_key("Security"));
    }
}
