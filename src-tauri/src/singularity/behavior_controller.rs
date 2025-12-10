// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v20.1Ω — SINGULARITY OS - BEHAVIOR CONTROLLER
//   Super Prompt #13: Response behavior and constraint management
//   Controls what the system should/shouldn't do in responses
// ═══════════════════════════════════════════════════════════════

use super::brain_state::{ConstraintProfile, ConversationMode, IntentClass};

/// Behavior Controller - Manages response behavior and constraints
#[derive(Debug, Clone)]
pub struct BehaviorController {
    /// Current constraints
    constraints: ConstraintProfile,
    /// Safety level (0.0-1.0)
    safety_level: f32,
    /// Allow speculation
    allow_speculation: bool,
    /// Allow code generation
    allow_code: bool,
    /// Allow emotional responses
    allow_emotional: bool,
    /// Maximum response tokens
    max_tokens: usize,
    /// Behavioral flags
    flags: BehaviorFlags,
}

/// Behavioral flags for fine control
#[derive(Debug, Clone, Default)]
pub struct BehaviorFlags {
    /// Be concise
    pub be_concise: bool,
    /// Be detailed
    pub be_detailed: bool,
    /// Use technical language
    pub use_technical: bool,
    /// Use simple language
    pub use_simple: bool,
    /// Include examples
    pub include_examples: bool,
    /// Include warnings
    pub include_warnings: bool,
    /// Acknowledge uncertainty
    pub acknowledge_uncertainty: bool,
    /// Offer alternatives
    pub offer_alternatives: bool,
}

impl Default for BehaviorController {
    fn default() -> Self {
        Self {
            constraints: ConstraintProfile::default(),
            safety_level: 0.9,
            allow_speculation: true,
            allow_code: true,
            allow_emotional: true,
            max_tokens: 2000,
            flags: BehaviorFlags::default(),
        }
    }
}

impl BehaviorController {
    /// Create new behavior controller
    pub fn new() -> Self {
        Self::default()
    }

    /// Create with custom safety level
    pub fn with_safety(safety: f32) -> Self {
        Self {
            safety_level: safety.clamp(0.0, 1.0),
            ..Self::default()
        }
    }

    /// Adjust behavior based on mode and intent
    pub fn adjust(&mut self, mode: ConversationMode, intent: &IntentClass) -> BehaviorProfile {
        // Reset flags
        self.flags = BehaviorFlags::default();

        // Apply mode-based behavior
        self.apply_mode_behavior(mode);

        // Apply intent-based behavior
        self.apply_intent_behavior(intent);

        // Build profile
        self.build_profile(mode, intent)
    }

    /// Apply mode-based behavior adjustments
    fn apply_mode_behavior(&mut self, mode: ConversationMode) {
        match mode {
            ConversationMode::Coach => {
                self.flags.be_detailed = true;
                self.flags.include_examples = true;
                self.flags.use_simple = true;
                self.flags.offer_alternatives = true;
                self.allow_emotional = true;
            }
            ConversationMode::Expert => {
                self.flags.use_technical = true;
                self.flags.include_examples = true;
                self.flags.acknowledge_uncertainty = true;
                self.allow_code = true;
            }
            ConversationMode::Meta => {
                self.flags.use_technical = true;
                self.flags.acknowledge_uncertainty = true;
                self.flags.offer_alternatives = true;
            }
            ConversationMode::Cognitive => {
                self.flags.be_detailed = true;
                self.flags.acknowledge_uncertainty = true;
            }
            ConversationMode::Creative => {
                self.flags.be_detailed = true;
                self.flags.offer_alternatives = true;
                self.allow_speculation = true;
            }
            ConversationMode::Logic => {
                self.flags.be_concise = true;
                self.flags.use_technical = true;
                self.flags.include_warnings = true;
                self.allow_speculation = false;
            }
            ConversationMode::Harmonic => {
                self.flags.use_simple = true;
                self.flags.acknowledge_uncertainty = true;
                self.allow_emotional = true;
            }
            ConversationMode::Neutral => {
                // Balanced defaults
                self.flags.include_examples = true;
            }
        }
    }

    /// Apply intent-based behavior adjustments
    fn apply_intent_behavior(&mut self, intent: &IntentClass) {
        match intent {
            IntentClass::Query => {
                self.flags.be_concise = true;
                self.flags.include_examples = true;
            }
            IntentClass::Task => {
                self.flags.be_detailed = true;
                self.flags.include_warnings = true;
            }
            IntentClass::Help => {
                self.flags.be_detailed = true;
                self.flags.use_simple = true;
                self.flags.include_examples = true;
            }
            IntentClass::Emotional => {
                self.flags.use_simple = true;
                self.allow_emotional = true;
                self.flags.be_concise = false;
            }
            IntentClass::Conversation => {
                // Natural flow
            }
            IntentClass::Command => {
                self.flags.be_concise = true;
                self.flags.include_warnings = true;
            }
            IntentClass::Creative => {
                self.flags.be_detailed = true;
                self.flags.offer_alternatives = true;
            }
            IntentClass::Debug => {
                self.flags.use_technical = true;
                self.flags.be_detailed = true;
                self.allow_code = true;
            }
            IntentClass::Explanation => {
                self.flags.be_detailed = true;
                self.flags.include_examples = true;
                self.flags.use_simple = true;
            }
            IntentClass::MetaQuery => {
                self.flags.use_technical = true;
                self.flags.acknowledge_uncertainty = true;
            }
            IntentClass::Unknown => {
                self.flags.acknowledge_uncertainty = true;
            }
        }
    }

    /// Build behavior profile
    fn build_profile(&self, mode: ConversationMode, intent: &IntentClass) -> BehaviorProfile {
        BehaviorProfile {
            mode,
            intent: intent.clone(),
            constraints: self.constraints.clone(),
            flags: self.flags.clone(),
            safety_level: self.safety_level,
            max_tokens: self.max_tokens,
            allow_speculation: self.allow_speculation,
            allow_code: self.allow_code,
            allow_emotional: self.allow_emotional,
            directives: self.generate_directives(),
        }
    }

    /// Generate behavioral directives
    fn generate_directives(&self) -> Vec<String> {
        let mut directives = Vec::new();

        if self.flags.be_concise {
            directives.push("Répondre de manière concise".to_string());
        }
        if self.flags.be_detailed {
            directives.push("Fournir des détails suffisants".to_string());
        }
        if self.flags.use_technical {
            directives.push("Utiliser un vocabulaire technique approprié".to_string());
        }
        if self.flags.use_simple {
            directives.push("Utiliser un langage accessible".to_string());
        }
        if self.flags.include_examples {
            directives.push("Inclure des exemples si pertinent".to_string());
        }
        if self.flags.include_warnings {
            directives.push("Mentionner les risques ou précautions".to_string());
        }
        if self.flags.acknowledge_uncertainty {
            directives.push("Reconnaître les incertitudes".to_string());
        }
        if self.flags.offer_alternatives {
            directives.push("Proposer des alternatives si possible".to_string());
        }

        if self.safety_level > 0.8 {
            directives.push("Maintenir un niveau de sécurité élevé".to_string());
        }

        directives
    }

    /// Set constraints
    pub fn set_constraints(&mut self, constraints: ConstraintProfile) {
        self.constraints = constraints;
    }

    /// Get current constraints
    pub fn constraints(&self) -> &ConstraintProfile {
        &self.constraints
    }

    /// Set safety level
    pub fn set_safety(&mut self, level: f32) {
        self.safety_level = level.clamp(0.0, 1.0);
    }

    /// Set max tokens
    pub fn set_max_tokens(&mut self, tokens: usize) {
        self.max_tokens = tokens;
    }

    /// Enable/disable code generation
    pub fn set_allow_code(&mut self, allow: bool) {
        self.allow_code = allow;
    }

    /// Enable/disable speculation
    pub fn set_allow_speculation(&mut self, allow: bool) {
        self.allow_speculation = allow;
    }

    /// Check if content is allowed
    pub fn is_allowed(&self, content_type: &str) -> bool {
        match content_type {
            "code" => self.allow_code,
            "speculation" => self.allow_speculation,
            "emotional" => self.allow_emotional,
            _ => true,
        }
    }

    /// Validate response against constraints
    pub fn validate_response(&self, response: &str) -> ValidationResult {
        let mut issues = Vec::new();

        // Check length
        let token_estimate = response.split_whitespace().count();
        if token_estimate > self.max_tokens {
            issues.push(format!(
                "Réponse trop longue: ~{} tokens (max: {})",
                token_estimate, self.max_tokens
            ));
        }

        // Check forbidden content
        for forbidden in &self.constraints.forbidden {
            if response.to_lowercase().contains(&forbidden.to_lowercase()) {
                issues.push(format!("Contenu interdit détecté: '{}'", forbidden));
            }
        }

        // Check required topics
        for required in &self.constraints.required_topics {
            if !response.to_lowercase().contains(&required.to_lowercase()) {
                issues.push(format!("Sujet requis manquant: '{}'", required));
            }
        }

        ValidationResult {
            is_valid: issues.is_empty(),
            issues,
            token_count: token_estimate,
        }
    }
}

/// Behavior profile for response generation
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct BehaviorProfile {
    pub mode: ConversationMode,
    pub intent: IntentClass,
    pub constraints: ConstraintProfile,
    pub flags: BehaviorFlags,
    pub safety_level: f32,
    pub max_tokens: usize,
    pub allow_speculation: bool,
    pub allow_code: bool,
    pub allow_emotional: bool,
    pub directives: Vec<String>,
}

/// Result of response validation
#[derive(Debug, Clone)]
pub struct ValidationResult {
    pub is_valid: bool,
    pub issues: Vec<String>,
    pub token_count: usize,
}

// Need to implement Serialize/Deserialize for BehaviorFlags
impl serde::Serialize for BehaviorFlags {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        use serde::ser::SerializeStruct;
        let mut state = serializer.serialize_struct("BehaviorFlags", 8)?;
        state.serialize_field("be_concise", &self.be_concise)?;
        state.serialize_field("be_detailed", &self.be_detailed)?;
        state.serialize_field("use_technical", &self.use_technical)?;
        state.serialize_field("use_simple", &self.use_simple)?;
        state.serialize_field("include_examples", &self.include_examples)?;
        state.serialize_field("include_warnings", &self.include_warnings)?;
        state.serialize_field("acknowledge_uncertainty", &self.acknowledge_uncertainty)?;
        state.serialize_field("offer_alternatives", &self.offer_alternatives)?;
        state.end()
    }
}

impl<'de> serde::Deserialize<'de> for BehaviorFlags {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: serde::Deserializer<'de>,
    {
        #[derive(serde::Deserialize)]
        struct Helper {
            be_concise: bool,
            be_detailed: bool,
            use_technical: bool,
            use_simple: bool,
            include_examples: bool,
            include_warnings: bool,
            acknowledge_uncertainty: bool,
            offer_alternatives: bool,
        }

        let helper = Helper::deserialize(deserializer)?;
        Ok(BehaviorFlags {
            be_concise: helper.be_concise,
            be_detailed: helper.be_detailed,
            use_technical: helper.use_technical,
            use_simple: helper.use_simple,
            include_examples: helper.include_examples,
            include_warnings: helper.include_warnings,
            acknowledge_uncertainty: helper.acknowledge_uncertainty,
            offer_alternatives: helper.offer_alternatives,
        })
    }
}

// ═══════════════════════════════════════════════════════════════
//   TESTS
// ═══════════════════════════════════════════════════════════════

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_behavior_controller_creation() {
        let controller = BehaviorController::new();
        assert!(controller.safety_level > 0.8);
        assert!(controller.allow_code);
    }

    #[test]
    fn test_mode_behavior() {
        let mut controller = BehaviorController::new();

        let profile = controller.adjust(ConversationMode::Expert, &IntentClass::Query);
        assert!(profile.flags.use_technical);
        assert!(profile.allow_code);

        let profile2 = controller.adjust(ConversationMode::Coach, &IntentClass::Help);
        assert!(profile2.flags.use_simple);
        assert!(profile2.flags.include_examples);
    }

    #[test]
    fn test_directives_generation() {
        let mut controller = BehaviorController::new();

        let profile = controller.adjust(ConversationMode::Logic, &IntentClass::Command);
        assert!(!profile.directives.is_empty());
        assert!(profile.directives.iter().any(|d| d.contains("concise")));
    }

    #[test]
    fn test_response_validation() {
        let mut controller = BehaviorController::new();
        controller.set_max_tokens(10);

        let short_response = "Bonjour";
        let validation1 = controller.validate_response(short_response);
        assert!(validation1.is_valid);

        let long_response = "Ceci est une réponse très longue qui dépasse la limite de tokens autorisée pour ce test";
        let validation2 = controller.validate_response(long_response);
        assert!(!validation2.is_valid);
    }

    #[test]
    fn test_forbidden_content() {
        let mut controller = BehaviorController::new();
        controller.constraints.forbidden = vec!["interdit".to_string()];

        let response = "Cette réponse contient un mot interdit.";
        let validation = controller.validate_response(response);
        assert!(!validation.is_valid);
    }

    #[test]
    fn test_is_allowed() {
        let mut controller = BehaviorController::new();

        assert!(controller.is_allowed("code"));

        controller.set_allow_code(false);
        assert!(!controller.is_allowed("code"));
    }

    #[test]
    fn test_safety_levels() {
        let controller = BehaviorController::with_safety(0.95);
        assert!(controller.safety_level > 0.9);
    }
}
