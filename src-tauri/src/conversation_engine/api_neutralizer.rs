/**
 * ═══════════════════════════════════════════════════════════════════
 * TITANE∞ v∞ — API NEUTRALIZER
 * Neutralisation et reconstruction des réponses API externes
 * ═══════════════════════════════════════════════════════════════════
 */
use crate::ai::AIResponse;

/// Neutraliseur d'API
pub struct ApiNeutralizer {
    // Configuration de neutralisation
}

impl ApiNeutralizer {
    pub fn new() -> Self {
        Self {}
    }

    /// Neutraliser une réponse API externe
    pub fn neutralize(&self, response: AIResponse) -> NeutralizedResponse {
        // Capturer les données brutes
        let raw_data = serde_json::to_value(&response).ok();

        // Rebuild internally
        NeutralizedResponse {
            content: response.content,
            provider: format!("{:?}", response.provider),
            tokens_used: 0, // Implementation: Extract token count from response metadata
            // - Field: response.metadata.get("tokens") or response.usage.total_tokens
            // - Gemini: response.usage_metadata.total_token_count
            // - OpenAI: response.usage.total_tokens (prompt + completion)
            // - Ollama: response.eval_count + response.prompt_eval_count
            // - Fallback: Estimate from content.len() / 4 (rough approximation)
            // - Parse: metadata.get("tokens").and_then(|v| v.as_u64()).unwrap_or(0)
            raw_data,
        }
    }

    /// Valider une réponse neutralisée
    pub fn validate(&self, response: &NeutralizedResponse) -> ValidationResult {
        let mut issues = Vec::new();

        if response.content.is_empty() {
            issues.push("Contenu vide".to_string());
        }

        if response.content.len() < 10 {
            issues.push("Contenu trop court".to_string());
        }

        ValidationResult {
            is_valid: issues.is_empty(),
            issues,
        }
    }
}

/// Réponse neutralisée
#[derive(Debug, Clone)]
pub struct NeutralizedResponse {
    pub content: String,
    pub provider: String,
    pub tokens_used: usize,
    pub raw_data: Option<serde_json::Value>,
}

/// Résultat de validation
#[derive(Debug, Clone)]
pub struct ValidationResult {
    pub is_valid: bool,
    pub issues: Vec<String>,
}

// ═══════════════════════════════════════════════════════════════════════════
// TESTS UNITAIRES
// ═══════════════════════════════════════════════════════════════════════════

#[cfg(test)]
mod tests {
    use super::*;

    // ─────────────────────────────────────────────────────────────────────
    // Tests ApiNeutralizer
    // ─────────────────────────────────────────────────────────────────────

    #[test]
    fn test_api_neutralizer_new() {
        let neutralizer = ApiNeutralizer::new();
        // Vérifier que l'instance est créée
        let _ = neutralizer;
    }

    #[test]
    fn test_api_neutralizer_validate_empty_content() {
        let neutralizer = ApiNeutralizer::new();
        let response = NeutralizedResponse {
            content: String::new(),
            provider: "test".to_string(),
            tokens_used: 0,
            raw_data: None,
        };
        let result = neutralizer.validate(&response);
        assert!(!result.is_valid);
        assert!(result.issues.contains(&"Contenu vide".to_string()));
        assert!(result.issues.contains(&"Contenu trop court".to_string()));
    }

    #[test]
    fn test_api_neutralizer_validate_short_content() {
        let neutralizer = ApiNeutralizer::new();
        let response = NeutralizedResponse {
            content: "court".to_string(),
            provider: "test".to_string(),
            tokens_used: 0,
            raw_data: None,
        };
        let result = neutralizer.validate(&response);
        assert!(!result.is_valid);
        assert!(result.issues.contains(&"Contenu trop court".to_string()));
    }

    #[test]
    fn test_api_neutralizer_validate_valid_content() {
        let neutralizer = ApiNeutralizer::new();
        let response = NeutralizedResponse {
            content: "Ceci est un contenu suffisamment long pour être valide.".to_string(),
            provider: "test".to_string(),
            tokens_used: 100,
            raw_data: None,
        };
        let result = neutralizer.validate(&response);
        assert!(result.is_valid);
        assert!(result.issues.is_empty());
    }

    #[test]
    fn test_api_neutralizer_validate_exactly_10_chars() {
        let neutralizer = ApiNeutralizer::new();
        let response = NeutralizedResponse {
            content: "1234567890".to_string(), // Exactement 10 caractères
            provider: "test".to_string(),
            tokens_used: 0,
            raw_data: None,
        };
        let result = neutralizer.validate(&response);
        assert!(result.is_valid);
        assert!(result.issues.is_empty());
    }

    #[test]
    fn test_api_neutralizer_validate_9_chars() {
        let neutralizer = ApiNeutralizer::new();
        let response = NeutralizedResponse {
            content: "123456789".to_string(), // 9 caractères
            provider: "test".to_string(),
            tokens_used: 0,
            raw_data: None,
        };
        let result = neutralizer.validate(&response);
        assert!(!result.is_valid);
        assert!(result.issues.contains(&"Contenu trop court".to_string()));
    }

    // ─────────────────────────────────────────────────────────────────────
    // Tests NeutralizedResponse
    // ─────────────────────────────────────────────────────────────────────

    #[test]
    fn test_neutralized_response_new() {
        let response = NeutralizedResponse {
            content: "test content".to_string(),
            provider: "TestProvider".to_string(),
            tokens_used: 42,
            raw_data: None,
        };
        assert_eq!(response.content, "test content");
        assert_eq!(response.provider, "TestProvider");
        assert_eq!(response.tokens_used, 42);
        assert!(response.raw_data.is_none());
    }

    #[test]
    fn test_neutralized_response_with_raw_data() {
        let raw = serde_json::json!({"key": "value"});
        let response = NeutralizedResponse {
            content: "test".to_string(),
            provider: "Provider".to_string(),
            tokens_used: 10,
            raw_data: Some(raw.clone()),
        };
        assert!(response.raw_data.is_some());
        assert_eq!(
            response.raw_data.expect("raw data should be present")["key"],
            "value"
        );
    }

    #[test]
    fn test_neutralized_response_debug() {
        let response = NeutralizedResponse {
            content: "debug test".to_string(),
            provider: "Debug".to_string(),
            tokens_used: 0,
            raw_data: None,
        };
        let debug_str = format!("{:?}", response);
        assert!(debug_str.contains("debug test"));
        assert!(debug_str.contains("Debug"));
    }

    #[test]
    fn test_neutralized_response_clone() {
        let response = NeutralizedResponse {
            content: "original".to_string(),
            provider: "Provider".to_string(),
            tokens_used: 50,
            raw_data: Some(serde_json::json!({"test": true})),
        };
        let cloned = response.clone();
        assert_eq!(cloned.content, response.content);
        assert_eq!(cloned.provider, response.provider);
        assert_eq!(cloned.tokens_used, response.tokens_used);
        assert_eq!(cloned.raw_data, response.raw_data);
    }

    #[test]
    fn test_neutralized_response_empty_content() {
        let response = NeutralizedResponse {
            content: String::new(),
            provider: String::new(),
            tokens_used: 0,
            raw_data: None,
        };
        assert!(response.content.is_empty());
        assert!(response.provider.is_empty());
    }

    #[test]
    fn test_neutralized_response_unicode_content() {
        let response = NeutralizedResponse {
            content: "Réponse avec émojis 🎉 et accents éàü".to_string(),
            provider: "Français".to_string(),
            tokens_used: 100,
            raw_data: None,
        };
        assert!(response.content.contains("🎉"));
        assert!(response.content.contains("é"));
    }

    #[test]
    fn test_neutralized_response_large_tokens() {
        let response = NeutralizedResponse {
            content: "test".to_string(),
            provider: "test".to_string(),
            tokens_used: usize::MAX,
            raw_data: None,
        };
        assert_eq!(response.tokens_used, usize::MAX);
    }

    #[test]
    fn test_neutralized_response_complex_raw_data() {
        let raw = serde_json::json!({
            "nested": {
                "array": [1, 2, 3],
                "object": {"key": "value"}
            },
            "number": 42,
            "boolean": true
        });
        let response = NeutralizedResponse {
            content: "test".to_string(),
            provider: "test".to_string(),
            tokens_used: 0,
            raw_data: Some(raw),
        };
        let data = response
            .raw_data
            .expect("raw data should remain available for complex payload");
        assert_eq!(data["nested"]["array"][0], 1);
        assert_eq!(data["number"], 42);
        assert_eq!(data["boolean"], true);
    }

    // ─────────────────────────────────────────────────────────────────────
    // Tests ValidationResult
    // ─────────────────────────────────────────────────────────────────────

    #[test]
    fn test_validation_result_valid() {
        let result = ValidationResult {
            is_valid: true,
            issues: Vec::new(),
        };
        assert!(result.is_valid);
        assert!(result.issues.is_empty());
    }

    #[test]
    fn test_validation_result_invalid() {
        let result = ValidationResult {
            is_valid: false,
            issues: vec!["Issue 1".to_string(), "Issue 2".to_string()],
        };
        assert!(!result.is_valid);
        assert_eq!(result.issues.len(), 2);
    }

    #[test]
    fn test_validation_result_debug() {
        let result = ValidationResult {
            is_valid: true,
            issues: vec!["test issue".to_string()],
        };
        let debug_str = format!("{:?}", result);
        assert!(debug_str.contains("is_valid"));
        assert!(debug_str.contains("issues"));
    }

    #[test]
    fn test_validation_result_clone() {
        let result = ValidationResult {
            is_valid: false,
            issues: vec!["error".to_string()],
        };
        let cloned = result.clone();
        assert_eq!(cloned.is_valid, result.is_valid);
        assert_eq!(cloned.issues, result.issues);
    }

    #[test]
    fn test_validation_result_many_issues() {
        let issues: Vec<String> = (0..100).map(|i| format!("Issue {}", i)).collect();
        let result = ValidationResult {
            is_valid: false,
            issues: issues.clone(),
        };
        assert_eq!(result.issues.len(), 100);
        assert_eq!(result.issues[0], "Issue 0");
        assert_eq!(result.issues[99], "Issue 99");
    }

    #[test]
    fn test_validation_result_empty_issues_string() {
        let result = ValidationResult {
            is_valid: false,
            issues: vec![String::new()],
        };
        assert!(!result.is_valid);
        assert_eq!(result.issues.len(), 1);
        assert!(result.issues[0].is_empty());
    }

    // ─────────────────────────────────────────────────────────────────────
    // Tests d'intégration neutralize + validate
    // ─────────────────────────────────────────────────────────────────────

    #[test]
    fn test_neutralizer_integration_flow() {
        let neutralizer = ApiNeutralizer::new();

        // Simuler une réponse neutralisée avec contenu valide
        let response = NeutralizedResponse {
            content: "Une réponse complète et détaillée".to_string(),
            provider: "TestProvider".to_string(),
            tokens_used: 50,
            raw_data: Some(serde_json::json!({"status": "ok"})),
        };

        let validation = neutralizer.validate(&response);
        assert!(validation.is_valid);
    }

    #[test]
    fn test_neutralizer_multiple_validations() {
        let neutralizer = ApiNeutralizer::new();

        let responses = [
            NeutralizedResponse {
                content: "".to_string(),
                provider: "A".to_string(),
                tokens_used: 0,
                raw_data: None,
            },
            NeutralizedResponse {
                content: "court".to_string(),
                provider: "B".to_string(),
                tokens_used: 0,
                raw_data: None,
            },
            NeutralizedResponse {
                content: "exactement dix".to_string(),
                provider: "C".to_string(),
                tokens_used: 0,
                raw_data: None,
            },
        ];

        let results: Vec<_> = responses.iter().map(|r| neutralizer.validate(r)).collect();

        assert!(!results[0].is_valid); // vide
        assert!(!results[1].is_valid); // trop court
        assert!(results[2].is_valid); // assez long
    }

    #[test]
    fn test_neutralizer_validate_special_characters() {
        let neutralizer = ApiNeutralizer::new();
        let response = NeutralizedResponse {
            content: "Test\n\t\r avec caractères spéciaux".to_string(),
            provider: "test".to_string(),
            tokens_used: 0,
            raw_data: None,
        };
        let result = neutralizer.validate(&response);
        assert!(result.is_valid);
    }

    #[test]
    fn test_neutralizer_validate_multiline() {
        let neutralizer = ApiNeutralizer::new();
        let response = NeutralizedResponse {
            content: "Ligne 1\nLigne 2\nLigne 3".to_string(),
            provider: "test".to_string(),
            tokens_used: 0,
            raw_data: None,
        };
        let result = neutralizer.validate(&response);
        assert!(result.is_valid);
    }
}
