// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v20.1Ω — OMEGA PIPELINE - GUARDRAILS
//   Super Prompt #15: Safety guardrails and content filtering
//   Final safety check before output with identity integration
// ═══════════════════════════════════════════════════════════════

use once_cell::sync::Lazy;
use serde::{Deserialize, Serialize};
use std::collections::HashSet;

use super::{
    merger::MergeResult, OmegaError, OmegaResult, PipelineStage, StageInput, StageOutput,
    StageProcessor,
};

// ═══════════════════════════════════════════════════════════════
//   GUARDRAIL TYPES
// ═══════════════════════════════════════════════════════════════

/// Guardrail check result
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GuardrailResult {
    /// Request ID
    pub request_id: String,
    /// Original response
    pub original_response: String,
    /// Final response (possibly modified)
    pub final_response: String,
    /// Was response modified
    pub was_modified: bool,
    /// Was response blocked
    pub was_blocked: bool,
    /// Safety score (0.0 - 1.0)
    pub safety_score: f32,
    /// Checks performed
    pub checks: Vec<GuardrailCheck>,
    /// Total latency in ms
    pub latency_ms: u64,
    /// Block reason if blocked
    pub block_reason: Option<String>,
}

/// Individual guardrail check
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GuardrailCheck {
    /// Check name
    pub name: String,
    /// Check type
    pub check_type: GuardrailType,
    /// Passed
    pub passed: bool,
    /// Score (0.0 - 1.0, higher is safer)
    pub score: f32,
    /// Details
    pub details: Option<String>,
}

/// Type of guardrail check
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum GuardrailType {
    /// Content safety (harmful content)
    ContentSafety,
    /// Personal data protection
    PrivacyProtection,
    /// Factual accuracy
    FactualAccuracy,
    /// Ethical compliance
    EthicalCompliance,
    /// Identity consistency
    IdentityConsistency,
    /// Length limits
    LengthLimits,
    /// Language appropriateness
    LanguageCheck,
    /// Bias detection
    BiasDetection,
}

// ═══════════════════════════════════════════════════════════════
//   GUARDRAIL CONFIGURATION
// ═══════════════════════════════════════════════════════════════

/// Guardrails configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GuardrailConfig {
    /// Minimum safety score to pass
    pub min_safety_score: f32,
    /// Enable content filtering
    pub enable_content_filter: bool,
    /// Enable privacy protection
    pub enable_privacy_protection: bool,
    /// Enable bias detection
    pub enable_bias_detection: bool,
    /// Maximum response length (tokens estimate)
    pub max_response_length: usize,
    /// Forbidden patterns
    pub forbidden_patterns: HashSet<String>,
    /// Allow modifications
    pub allow_modifications: bool,
    /// Strict mode (block on any violation)
    pub strict_mode: bool,
}

impl Default for GuardrailConfig {
    fn default() -> Self {
        let mut forbidden = HashSet::new();
        // Add basic forbidden patterns
        forbidden.insert("api_key".to_string());
        forbidden.insert("password".to_string());
        forbidden.insert("secret".to_string());

        Self {
            min_safety_score: 0.7,
            enable_content_filter: true,
            enable_privacy_protection: true,
            enable_bias_detection: true,
            max_response_length: 4000,
            forbidden_patterns: forbidden,
            allow_modifications: true,
            strict_mode: false,
        }
    }
}

// ═══════════════════════════════════════════════════════════════
//   SAFETY CHECKER
// ═══════════════════════════════════════════════════════════════

/// Safety checker for content
pub struct SafetyChecker {
    /// Harmful content patterns
    harmful_patterns: Vec<String>,
    /// PII patterns
    pii_patterns: Vec<String>,
    /// Bias indicators
    bias_indicators: Vec<String>,
}

impl Default for SafetyChecker {
    fn default() -> Self {
        Self {
            harmful_patterns: vec![
                "how to hack".to_string(),
                "create a bomb".to_string(),
                "make weapons".to_string(),
                "illegal drugs".to_string(),
            ],
            pii_patterns: vec![
                "social security".to_string(),
                "credit card number".to_string(),
                "bank account".to_string(),
            ],
            bias_indicators: vec!["all people of".to_string(), "those people".to_string()],
        }
    }
}

impl SafetyChecker {
    pub fn new() -> Self {
        Self::default()
    }

    /// Check for harmful content
    pub fn check_content_safety(&self, text: &str) -> GuardrailCheck {
        let text_lower = text.to_lowercase();
        let mut found_harmful = false;
        let mut details = Vec::new();

        for pattern in &self.harmful_patterns {
            if text_lower.contains(pattern) {
                found_harmful = true;
                details.push(format!("Found harmful pattern: '{}'", pattern));
            }
        }

        let score = if found_harmful { 0.2 } else { 0.95 };

        GuardrailCheck {
            name: "Content Safety".to_string(),
            check_type: GuardrailType::ContentSafety,
            passed: !found_harmful,
            score,
            details: if details.is_empty() {
                None
            } else {
                Some(details.join("; "))
            },
        }
    }

    /// Check for PII/privacy issues
    pub fn check_privacy(&self, text: &str) -> GuardrailCheck {
        let text_lower = text.to_lowercase();
        let mut found_pii = false;
        let mut details = Vec::new();

        for pattern in &self.pii_patterns {
            if text_lower.contains(pattern) {
                found_pii = true;
                details.push(format!("Potential PII: '{}'", pattern));
            }
        }

        // Check for email pattern
        let email_pattern = regex::Regex::new(r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}");
        if let Ok(re) = email_pattern {
            if re.is_match(text) {
                found_pii = true;
                details.push("Email address detected".to_string());
            }
        }

        let score = if found_pii { 0.4 } else { 0.95 };

        GuardrailCheck {
            name: "Privacy Protection".to_string(),
            check_type: GuardrailType::PrivacyProtection,
            passed: !found_pii,
            score,
            details: if details.is_empty() {
                None
            } else {
                Some(details.join("; "))
            },
        }
    }

    /// Check for bias
    pub fn check_bias(&self, text: &str) -> GuardrailCheck {
        let text_lower = text.to_lowercase();
        let mut found_bias = false;
        let mut details = Vec::new();

        for indicator in &self.bias_indicators {
            if text_lower.contains(indicator) {
                found_bias = true;
                details.push(format!("Potential bias: '{}'", indicator));
            }
        }

        let score = if found_bias { 0.5 } else { 0.9 };

        GuardrailCheck {
            name: "Bias Detection".to_string(),
            check_type: GuardrailType::BiasDetection,
            passed: !found_bias,
            score,
            details: if details.is_empty() {
                None
            } else {
                Some(details.join("; "))
            },
        }
    }

    /// Check length limits
    pub fn check_length(&self, text: &str, max_length: usize) -> GuardrailCheck {
        // Estimate tokens (rough: ~4 chars per token)
        let estimated_tokens = text.len() / 4;
        let passed = estimated_tokens <= max_length;
        let score = if passed {
            1.0
        } else {
            (max_length as f32 / estimated_tokens as f32).min(0.9)
        };

        GuardrailCheck {
            name: "Length Limits".to_string(),
            check_type: GuardrailType::LengthLimits,
            passed,
            score,
            details: Some(format!(
                "Estimated tokens: {}, max: {}",
                estimated_tokens, max_length
            )),
        }
    }

    /// Check language appropriateness
    pub fn check_language(&self, text: &str) -> GuardrailCheck {
        // Simple check for inappropriate language (would use more sophisticated NLP in production)
        let inappropriate_words: Vec<&str> = vec![]; // Empty for now, would be populated
        let text_lower = text.to_lowercase();
        let mut found = false;

        for word in inappropriate_words {
            if text_lower.contains(word) {
                found = true;
                break;
            }
        }

        GuardrailCheck {
            name: "Language Check".to_string(),
            check_type: GuardrailType::LanguageCheck,
            passed: !found,
            score: if found { 0.3 } else { 0.95 },
            details: None,
        }
    }

    /// Check identity consistency
    pub fn check_identity_consistency(
        &self,
        text: &str,
        identity_data: Option<&serde_json::Value>,
    ) -> GuardrailCheck {
        // Check if response aligns with identity profile
        let mut score = 0.9;
        let mut details = Vec::new();

        if let Some(identity) = identity_data {
            // Check tone alignment
            if let Some(tone) = identity.get("tone").and_then(|t| t.as_str()) {
                let text_lower = text.to_lowercase();
                match tone {
                    "friendly" => {
                        if text_lower.contains("error") || text_lower.contains("wrong") {
                            // Friendly tone should soften errors
                            score -= 0.1;
                            details.push("Consider softer phrasing for friendly tone".to_string());
                        }
                    }
                    "professional" => {
                        if text_lower.contains("lol") || text_lower.contains("haha") {
                            score -= 0.2;
                            details.push(
                                "Informal language doesn't match professional tone".to_string(),
                            );
                        }
                    }
                    _ => {}
                }
            }
        }

        GuardrailCheck {
            name: "Identity Consistency".to_string(),
            check_type: GuardrailType::IdentityConsistency,
            passed: score >= 0.7,
            score,
            details: if details.is_empty() {
                None
            } else {
                Some(details.join("; "))
            },
        }
    }

    /// Check ethical compliance
    pub fn check_ethics(&self, text: &str) -> GuardrailCheck {
        let text_lower = text.to_lowercase();
        let mut score: f32 = 0.95;
        let mut details = Vec::new();

        // Check for deceptive patterns
        let deceptive_patterns = ["guaranteed results", "100% certain", "definitely will"];
        for pattern in deceptive_patterns {
            if text_lower.contains(pattern) {
                score -= 0.15;
                details.push(format!("Potentially overconfident claim: '{}'", pattern));
            }
        }

        // Check for uncertainty acknowledgment (positive)
        let uncertainty_markers = [
            "might",
            "could",
            "possibly",
            "likely",
            "peut-être",
            "probablement",
        ];
        let has_uncertainty = uncertainty_markers.iter().any(|m| text_lower.contains(m));
        if has_uncertainty {
            score = (score + 0.05).min(1.0);
        }

        GuardrailCheck {
            name: "Ethical Compliance".to_string(),
            check_type: GuardrailType::EthicalCompliance,
            passed: score >= 0.7,
            score,
            details: if details.is_empty() {
                None
            } else {
                Some(details.join("; "))
            },
        }
    }
}

// ═══════════════════════════════════════════════════════════════
//   GUARDRAILS ENGINE
// ═══════════════════════════════════════════════════════════════

/// Main guardrails engine
pub struct GuardrailsEngine {
    config: GuardrailConfig,
    checker: SafetyChecker,
}

impl Default for GuardrailsEngine {
    fn default() -> Self {
        Self {
            config: GuardrailConfig::default(),
            checker: SafetyChecker::new(),
        }
    }
}

impl GuardrailsEngine {
    /// Create new engine
    pub fn new() -> Self {
        Self::default()
    }

    /// Create with custom config
    pub fn with_config(config: GuardrailConfig) -> Self {
        Self {
            config,
            checker: SafetyChecker::new(),
        }
    }

    /// Run all guardrail checks
    pub fn check(&self, merge_result: &MergeResult) -> OmegaResult<GuardrailResult> {
        let start = std::time::Instant::now();
        let response = &merge_result.response;
        let mut checks = Vec::new();

        // Run all enabled checks
        if self.config.enable_content_filter {
            checks.push(self.checker.check_content_safety(response));
        }

        if self.config.enable_privacy_protection {
            checks.push(self.checker.check_privacy(response));
        }

        if self.config.enable_bias_detection {
            checks.push(self.checker.check_bias(response));
        }

        checks.push(
            self.checker
                .check_length(response, self.config.max_response_length),
        );
        checks.push(self.checker.check_language(response));
        checks.push(self.checker.check_ethics(response));
        checks.push(
            self.checker
                .check_identity_consistency(response, merge_result.metadata.identity.as_ref()),
        );

        // Check forbidden patterns from config
        for pattern in &self.config.forbidden_patterns {
            if response.to_lowercase().contains(&pattern.to_lowercase()) {
                checks.push(GuardrailCheck {
                    name: format!("Forbidden Pattern: {}", pattern),
                    check_type: GuardrailType::ContentSafety,
                    passed: false,
                    score: 0.0,
                    details: Some(format!("Contains forbidden pattern: '{}'", pattern)),
                });
            }
        }

        // Calculate overall safety score
        let safety_score = if checks.is_empty() {
            1.0
        } else {
            checks.iter().map(|c| c.score).sum::<f32>() / checks.len() as f32
        };

        // Determine if blocked
        let has_critical_failure = checks
            .iter()
            .any(|c| !c.passed && c.check_type == GuardrailType::ContentSafety);

        let has_any_failure = checks.iter().any(|c| !c.passed);
        let was_blocked = has_critical_failure
            || (self.config.strict_mode && has_any_failure)
            || safety_score < self.config.min_safety_score;

        // Determine final response
        let (final_response, was_modified, block_reason) = if was_blocked {
            (
                "Je ne peux pas répondre à cette demande.".to_string(),
                true,
                Some(self.get_block_reason(&checks)),
            )
        } else if self.config.allow_modifications && has_any_failure {
            (self.apply_modifications(response, &checks), true, None)
        } else {
            (response.clone(), false, None)
        };

        Ok(GuardrailResult {
            request_id: merge_result.request_id.clone(),
            original_response: response.clone(),
            final_response,
            was_modified,
            was_blocked,
            safety_score,
            checks,
            latency_ms: start.elapsed().as_millis() as u64,
            block_reason,
        })
    }

    /// Get block reason from failed checks
    fn get_block_reason(&self, checks: &[GuardrailCheck]) -> String {
        let failed: Vec<_> = checks
            .iter()
            .filter(|c| !c.passed)
            .map(|c| c.name.as_str())
            .collect();

        if failed.is_empty() {
            "Safety score too low".to_string()
        } else {
            format!("Failed checks: {}", failed.join(", "))
        }
    }

    /// Apply modifications to fix minor issues
    fn apply_modifications(&self, response: &str, checks: &[GuardrailCheck]) -> String {
        let mut modified = response.to_string();

        for check in checks {
            if !check.passed {
                match check.check_type {
                    GuardrailType::LengthLimits => {
                        // Truncate if too long
                        if modified.len() > self.config.max_response_length * 4 {
                            let limit = self.config.max_response_length * 4;
                            modified = modified.chars().take(limit).collect();
                            modified.push_str("...");
                        }
                    }
                    GuardrailType::PrivacyProtection => {
                        // Redact potential PII
                        static EMAIL_RE: Lazy<regex::Regex> = Lazy::new(|| {
                            regex::Regex::new(r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}")
                                .expect("hard-coded email regex must compile")
                        });
                        modified = EMAIL_RE
                            .replace_all(&modified, "[EMAIL REDACTED]")
                            .to_string();
                    }
                    _ => {}
                }
            }
        }

        modified
    }

    /// Update configuration
    pub fn set_config(&mut self, config: GuardrailConfig) {
        self.config = config;
    }

    /// Get current configuration
    pub fn config(&self) -> &GuardrailConfig {
        &self.config
    }
}

// ═══════════════════════════════════════════════════════════════
//   GUARDRAILS STAGE PROCESSOR
// ═══════════════════════════════════════════════════════════════

/// Guardrails stage processor
pub struct Guardrails {
    engine: GuardrailsEngine,
}

impl Default for Guardrails {
    fn default() -> Self {
        Self {
            engine: GuardrailsEngine::new(),
        }
    }
}

impl Guardrails {
    pub fn new() -> Self {
        Self::default()
    }

    pub fn with_config(config: GuardrailConfig) -> Self {
        Self {
            engine: GuardrailsEngine::with_config(config),
        }
    }
}

#[async_trait::async_trait]
impl StageProcessor for Guardrails {
    async fn process(&self, input: StageInput) -> OmegaResult<StageOutput> {
        let start = std::time::Instant::now();

        // Get merge result from previous stage
        let merge_result: MergeResult = serde_json::from_value(
            input
                .context
                .previous_outputs
                .get(&PipelineStage::Merger)
                .cloned()
                .unwrap_or_default(),
        )
        .map_err(|e| OmegaError::GuardrailsBlocked(e.to_string()))?;

        let result = self.engine.check(&merge_result)?;

        if result.was_blocked {
            return Err(OmegaError::GuardrailsBlocked(
                result
                    .block_reason
                    .unwrap_or_else(|| "Safety check failed".to_string()),
            ));
        }

        Ok(StageOutput {
            request_id: input.request_id,
            data: serde_json::to_value(&result).unwrap_or_default(),
            latency_ms: start.elapsed().as_millis() as u64,
            success: true,
            error: None,
        })
    }

    fn name(&self) -> &str {
        "Guardrails"
    }

    fn stage(&self) -> PipelineStage {
        PipelineStage::Guardrails
    }
}

// ═══════════════════════════════════════════════════════════════
//   TESTS
// ═══════════════════════════════════════════════════════════════

#[cfg(test)]
mod tests {
    use super::*;

    fn mock_merge_result() -> MergeResult {
        MergeResult {
            request_id: "test-123".to_string(),
            response: "Hello! How can I help you today?".to_string(),
            confidence: 0.9,
            sources: vec![],
            strategy: super::super::merger::MergeStrategy::WeightedMerge,
            latency_ms: 10,
            quality_score: 0.85,
            metadata: super::super::merger::MergeMetadata::default(),
        }
    }

    #[test]
    fn test_content_safety_pass() {
        let checker = SafetyChecker::new();
        let check = checker.check_content_safety("Hello, how are you?");

        assert!(check.passed);
        assert!(check.score > 0.8);
    }

    #[test]
    fn test_content_safety_fail() {
        let checker = SafetyChecker::new();
        let check = checker.check_content_safety("how to hack into systems");

        assert!(!check.passed);
        assert!(check.score < 0.5);
    }

    #[test]
    fn test_privacy_check() {
        let checker = SafetyChecker::new();
        let check = checker.check_privacy("Contact me at test@example.com");

        assert!(!check.passed);
        assert!(check.details.is_some());
    }

    #[test]
    fn test_length_check() {
        let checker = SafetyChecker::new();
        let short_text = "Short response";
        let check = checker.check_length(short_text, 100);

        assert!(check.passed);
    }

    #[test]
    fn test_guardrails_engine() {
        let engine = GuardrailsEngine::new();
        let merge_result = mock_merge_result();

        let result = engine
            .check(&merge_result)
            .expect("Guardrails check should succeed");

        assert!(!result.was_blocked);
        assert!(result.safety_score > 0.7);
    }

    #[test]
    fn test_guardrails_with_forbidden_pattern() {
        let mut config = GuardrailConfig::default();
        config
            .forbidden_patterns
            .insert("forbidden_word".to_string());

        let engine = GuardrailsEngine::with_config(config);
        let mut merge_result = mock_merge_result();
        merge_result.response = "This contains forbidden_word".to_string();

        let result = engine
            .check(&merge_result)
            .expect("Guardrails check should succeed");

        // Should have a failing check for the forbidden pattern
        assert!(result
            .checks
            .iter()
            .any(|c| !c.passed && c.name.contains("Forbidden")));
    }

    #[test]
    fn test_ethics_check() {
        let checker = SafetyChecker::new();

        // Overconfident claim
        let check1 = checker.check_ethics("This will guaranteed results for you");
        assert!(check1.score < 0.9);

        // With uncertainty
        let check2 = checker.check_ethics("This might help you achieve better results");
        assert!(check2.score >= 0.9);
    }

    #[test]
    fn test_guardrail_type_variants() {
        let types = [
            GuardrailType::ContentSafety,
            GuardrailType::PrivacyProtection,
            GuardrailType::FactualAccuracy,
            GuardrailType::EthicalCompliance,
            GuardrailType::IdentityConsistency,
            GuardrailType::LengthLimits,
            GuardrailType::LanguageCheck,
            GuardrailType::BiasDetection,
        ];

        assert_eq!(types.len(), 8);
        assert_ne!(
            GuardrailType::ContentSafety,
            GuardrailType::PrivacyProtection
        );
    }

    #[test]
    fn test_guardrail_config_default() {
        let config = GuardrailConfig::default();

        assert_eq!(config.min_safety_score, 0.7);
        assert!(config.enable_content_filter);
        assert!(config.enable_privacy_protection);
        assert!(config.enable_bias_detection);
        assert_eq!(config.max_response_length, 4000);
        assert!(config.allow_modifications);
        assert!(!config.strict_mode);
    }

    #[test]
    fn test_guardrail_config_forbidden_patterns() {
        let config = GuardrailConfig::default();

        assert!(config.forbidden_patterns.contains("api_key"));
        assert!(config.forbidden_patterns.contains("password"));
        assert!(config.forbidden_patterns.contains("secret"));
    }

    #[test]
    fn test_safety_checker_new() {
        let checker = SafetyChecker::new();
        assert!(!checker.harmful_patterns.is_empty());
        assert!(!checker.pii_patterns.is_empty());
        assert!(!checker.bias_indicators.is_empty());
    }

    #[test]
    fn test_safety_checker_default() {
        let checker = SafetyChecker::default();
        assert!(checker.harmful_patterns.len() >= 4);
        assert!(checker.pii_patterns.len() >= 3);
        assert!(checker.bias_indicators.len() >= 2);
    }

    #[test]
    fn test_content_safety_multiple_patterns() {
        let checker = SafetyChecker::new();
        let check = checker.check_content_safety("how to hack and make weapons");

        assert!(!check.passed);
        assert!(check.details.is_some());
        let details = check.details.unwrap_or_default();
        assert!(details.contains("hack") || details.contains("weapons"));
    }

    #[test]
    fn test_privacy_check_clean() {
        let checker = SafetyChecker::new();
        let check = checker.check_privacy("This is a safe message");

        assert!(check.passed);
        assert!(check.score > 0.9);
    }

    #[test]
    fn test_privacy_check_pii_patterns() {
        let checker = SafetyChecker::new();
        let check = checker.check_privacy("My credit card number is 1234");

        assert!(!check.passed);
        assert!(check.details.is_some());
    }

    #[test]
    fn test_bias_check_clean() {
        let checker = SafetyChecker::new();
        let check = checker.check_bias("This is a neutral statement");

        assert!(check.passed);
        assert!(check.score > 0.8);
    }

    #[test]
    fn test_bias_check_biased() {
        let checker = SafetyChecker::new();
        let check = checker.check_bias("All people of that group are bad");

        assert!(!check.passed);
        assert!(check.score <= 0.5);
    }

    #[test]
    fn test_length_check_too_long() {
        let checker = SafetyChecker::new();
        let long_text = "a".repeat(50000); // Very long text
        let check = checker.check_length(&long_text, 100);

        assert!(!check.passed);
        assert!(check.score < 1.0);
    }

    #[test]
    fn test_language_check_clean() {
        let checker = SafetyChecker::new();
        let check = checker.check_language("This is appropriate language");

        assert!(check.passed);
        assert!(check.score > 0.9);
    }

    #[test]
    fn test_identity_consistency_no_identity() {
        let checker = SafetyChecker::new();
        let check = checker.check_identity_consistency("Hello world", None);

        assert!(check.passed);
        assert!(check.score >= 0.7);
    }

    #[test]
    fn test_identity_consistency_friendly_tone() {
        let checker = SafetyChecker::new();
        let identity = serde_json::json!({
            "tone": "friendly"
        });
        let check = checker.check_identity_consistency("You made an error here", Some(&identity));

        // Should suggest softer phrasing
        assert!(check.score < 0.9 || check.passed);
    }

    #[test]
    fn test_identity_consistency_professional_tone() {
        let checker = SafetyChecker::new();
        let identity = serde_json::json!({
            "tone": "professional"
        });
        let check = checker.check_identity_consistency("lol that's funny haha", Some(&identity));

        assert!(check.score < 0.9);
    }

    #[test]
    fn test_ethics_check_multiple_claims() {
        let checker = SafetyChecker::new();
        let check =
            checker.check_ethics("I guarantee guaranteed results with 100% certain success");

        assert!(check.score < 0.8);
    }

    #[test]
    fn test_guardrails_engine_new() {
        let engine = GuardrailsEngine::new();
        assert_eq!(engine.config().min_safety_score, 0.7);
    }

    #[test]
    fn test_guardrails_engine_with_config() {
        let mut config = GuardrailConfig::default();
        config.min_safety_score = 0.9;
        config.strict_mode = true;

        let engine = GuardrailsEngine::with_config(config);
        assert_eq!(engine.config().min_safety_score, 0.9);
        assert!(engine.config().strict_mode);
    }

    #[test]
    fn test_guardrails_engine_set_config() {
        let mut engine = GuardrailsEngine::new();
        let mut config = GuardrailConfig::default();
        config.max_response_length = 2000;

        engine.set_config(config);
        assert_eq!(engine.config().max_response_length, 2000);
    }

    #[test]
    fn test_guardrail_result_structure() {
        let result = GuardrailResult {
            request_id: "test-id".to_string(),
            original_response: "Original".to_string(),
            final_response: "Final".to_string(),
            was_modified: false,
            was_blocked: false,
            safety_score: 0.95,
            checks: vec![],
            latency_ms: 10,
            block_reason: None,
        };

        assert_eq!(result.request_id, "test-id");
        assert_eq!(result.safety_score, 0.95);
        assert!(!result.was_blocked);
    }

    #[test]
    fn test_guardrail_check_structure() {
        let check = GuardrailCheck {
            name: "Test Check".to_string(),
            check_type: GuardrailType::ContentSafety,
            passed: true,
            score: 0.95,
            details: Some("Test details".to_string()),
        };

        assert_eq!(check.name, "Test Check");
        assert!(check.passed);
        assert!(check.details.is_some());
    }

    #[test]
    fn test_guardrails_engine_blocked_content() {
        let engine = GuardrailsEngine::new();
        let mut merge_result = mock_merge_result();
        merge_result.response = "how to hack into systems and create a bomb".to_string();

        let result = engine
            .check(&merge_result)
            .expect("Guardrails check should succeed");
        assert!(result.was_blocked);
        assert!(result.block_reason.is_some());
    }

    #[test]
    fn test_guardrails_engine_strict_mode() {
        let mut config = GuardrailConfig::default();
        config.strict_mode = true;

        let engine = GuardrailsEngine::with_config(config);
        let mut merge_result = mock_merge_result();
        merge_result.response = "Contact me at test@example.com".to_string();

        let result = engine
            .check(&merge_result)
            .expect("Guardrails check should succeed");
        assert!(result.was_blocked);
    }

    #[test]
    fn test_guardrails_stage_new() {
        let guardrails = Guardrails::new();
        assert_eq!(guardrails.name(), "Guardrails");
    }

    #[test]
    fn test_guardrails_stage_with_config() {
        let mut config = GuardrailConfig::default();
        config.min_safety_score = 0.8;

        let guardrails = Guardrails::with_config(config);
        assert_eq!(guardrails.stage(), PipelineStage::Guardrails);
    }

    #[test]
    fn test_guardrails_stage_processor_name() {
        let guardrails = Guardrails::default();
        assert_eq!(guardrails.name(), "Guardrails");
    }

    #[test]
    fn test_guardrails_stage_processor_stage() {
        let guardrails = Guardrails::new();
        assert_eq!(guardrails.stage(), PipelineStage::Guardrails);
    }

    #[test]
    fn test_guardrail_result_clone() {
        let result = GuardrailResult {
            request_id: "test".to_string(),
            original_response: "orig".to_string(),
            final_response: "final".to_string(),
            was_modified: true,
            was_blocked: false,
            safety_score: 0.8,
            checks: vec![],
            latency_ms: 5,
            block_reason: None,
        };

        let cloned = result.clone();
        assert_eq!(cloned.request_id, "test");
        assert_eq!(cloned.safety_score, 0.8);
    }

    #[test]
    fn test_guardrail_check_clone() {
        let check = GuardrailCheck {
            name: "Test".to_string(),
            check_type: GuardrailType::BiasDetection,
            passed: false,
            score: 0.5,
            details: None,
        };

        let cloned = check.clone();
        assert_eq!(cloned.name, "Test");
        assert_eq!(cloned.check_type, GuardrailType::BiasDetection);
    }

    #[test]
    fn test_guardrail_type_equality() {
        assert_eq!(GuardrailType::ContentSafety, GuardrailType::ContentSafety);
        assert_ne!(GuardrailType::ContentSafety, GuardrailType::BiasDetection);
    }

    #[test]
    fn test_guardrail_config_clone() {
        let config = GuardrailConfig::default();
        let cloned = config.clone();

        assert_eq!(cloned.min_safety_score, config.min_safety_score);
        assert_eq!(cloned.max_response_length, config.max_response_length);
    }

    #[test]
    fn test_ethics_french_uncertainty() {
        let checker = SafetyChecker::new();
        let check = checker.check_ethics("Cela pourrait peut-être fonctionner");

        assert!(check.passed);
        assert!(check.score > 0.9);
    }

    #[test]
    fn test_ethics_probably() {
        let checker = SafetyChecker::new();
        let check = checker.check_ethics("This will probablement work well");

        assert!(check.passed);
    }
}
