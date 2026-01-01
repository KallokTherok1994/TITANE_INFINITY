//! ═══════════════════════════════════════════════════════════════════════════════
//! TITANE∞ v20Ω — RESPONSE HARMONIZER
//! Super Prompt #17 — Harmonisation des réponses multi-providers
//! ═══════════════════════════════════════════════════════════════════════════════

use super::{APIRequest, Provider, ResponseContent, UsageStats};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// Réponse harmonisée
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct HarmonizedResponse {
    pub id: String,
    pub provider: Provider,
    pub content: ResponseContent,
    pub usage: UsageStats,
    pub metadata: HashMap<String, String>,
}

/// Configuration d'harmonisation
#[derive(Clone, Debug)]
pub struct HarmonizationConfig {
    /// Normaliser le style de réponse
    pub normalize_style: bool,
    /// Enlever les préfixes de politesse
    pub strip_pleasantries: bool,
    /// Format de sortie préféré
    pub preferred_format: OutputFormat,
    /// Longueur maximale
    pub max_length: Option<usize>,
}

impl Default for HarmonizationConfig {
    fn default() -> Self {
        Self {
            normalize_style: true,
            strip_pleasantries: false,
            preferred_format: OutputFormat::Natural,
            max_length: None,
        }
    }
}

/// Format de sortie
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum OutputFormat {
    /// Texte naturel
    Natural,
    /// Format structuré (markdown)
    Structured,
    /// Format concis
    Concise,
    /// Format technique
    Technical,
}

/// Harmonisateur de réponses
pub struct ResponseHarmonizer {
    config: HarmonizationConfig,
}

impl ResponseHarmonizer {
    pub fn new() -> Self {
        Self {
            config: HarmonizationConfig::default(),
        }
    }

    pub fn with_config(config: HarmonizationConfig) -> Self {
        Self { config }
    }

    /// Harmonise une réponse brute
    pub async fn harmonize(
        &self,
        response: HarmonizedResponse,
        _request: &APIRequest,
    ) -> HarmonizedResponse {
        let mut harmonized = response;

        // Harmoniser le contenu textuel
        if let ResponseContent::Text(ref mut text) = harmonized.content {
            *text = self.harmonize_text(text, harmonized.provider);
        }

        harmonized
    }

    /// Harmonise le texte selon le provider source
    fn harmonize_text(&self, text: &str, provider: Provider) -> String {
        let mut result = text.to_string();

        // Enlever les préfixes spécifiques aux providers
        result = self.strip_provider_prefixes(&result, provider);

        // Normaliser le style si configuré
        if self.config.normalize_style {
            result = self.normalize_style(&result);
        }

        // Enlever les politesses si configuré
        if self.config.strip_pleasantries {
            result = self.strip_pleasantries(&result);
        }

        // Appliquer le format préféré
        result = self.apply_format(&result);

        // Tronquer si nécessaire
        if let Some(max_len) = self.config.max_length {
            if result.len() > max_len {
                result = self.truncate_gracefully(&result, max_len);
            }
        }

        result
    }

    /// Enlève les préfixes typiques de chaque provider
    fn strip_provider_prefixes(&self, text: &str, provider: Provider) -> String {
        let mut result = text.to_string();

        match provider {
            Provider::OpenAI => {
                // OpenAI commence parfois par "As an AI language model..."
                let prefixes = [
                    "As an AI language model, ",
                    "As an AI, ",
                    "I'm an AI assistant, ",
                ];
                for prefix in &prefixes {
                    if result.starts_with(prefix) {
                        result = result[prefix.len()..].to_string();
                        result = capitalize_first(&result);
                    }
                }
            }
            Provider::Anthropic => {
                // Claude peut commencer par des réflexions internes
                let prefixes = ["I'd be happy to ", "I'll ", "Let me "];
                // On ne les enlève pas car ils font partie du style naturel
            }
            Provider::Gemini => {
                // Gemini est généralement direct
            }
            Provider::Local => {}
        }

        result
    }

    /// Normalise le style de réponse
    fn normalize_style(&self, text: &str) -> String {
        let mut result = text.to_string();

        // Normaliser les espaces multiples
        while result.contains("  ") {
            result = result.replace("  ", " ");
        }

        // Normaliser les retours à la ligne multiples
        while result.contains("\n\n\n") {
            result = result.replace("\n\n\n", "\n\n");
        }

        // Trim
        result = result.trim().to_string();

        result
    }

    /// Enlève les formules de politesse
    fn strip_pleasantries(&self, text: &str) -> String {
        let mut result = text.to_string();

        let pleasantries = [
            "Sure! ",
            "Sure, ",
            "Of course! ",
            "Of course, ",
            "Certainly! ",
            "Certainly, ",
            "Absolutely! ",
            "Absolutely, ",
            "Great question! ",
            "That's a great question! ",
            "I'd be happy to help! ",
            "I'd be happy to help. ",
        ];

        for phrase in &pleasantries {
            if result.starts_with(phrase) {
                result = result[phrase.len()..].to_string();
                result = capitalize_first(&result);
            }
        }

        // Enlever les conclusions de politesse
        let endings = [
            "\n\nI hope this helps!",
            "\n\nHope this helps!",
            "\n\nLet me know if you have any questions!",
            "\n\nFeel free to ask if you have more questions!",
        ];

        for ending in &endings {
            if result.ends_with(ending) {
                result = result[..result.len() - ending.len()].to_string();
            }
        }

        result
    }

    /// Applique le format préféré
    fn apply_format(&self, text: &str) -> String {
        match self.config.preferred_format {
            OutputFormat::Natural => text.to_string(),
            OutputFormat::Structured => self.structure_text(text),
            OutputFormat::Concise => self.make_concise(text),
            OutputFormat::Technical => text.to_string(),
        }
    }

    /// Structure le texte en sections
    fn structure_text(&self, text: &str) -> String {
        // Déjà structuré? Ne pas modifier
        if text.contains("##") || text.contains("**") {
            return text.to_string();
        }

        // Sinon, ajouter une structure basique si long
        if text.len() > 500 {
            let paragraphs: Vec<&str> = text.split("\n\n").collect();
            if paragraphs.len() > 2 {
                return paragraphs
                    .iter()
                    .enumerate()
                    .map(|(i, p)| {
                        if i == 0 {
                            format!("**Overview:**\n{}", p)
                        } else if i == paragraphs.len() - 1 {
                            format!("**Conclusion:**\n{}", p)
                        } else {
                            format!("**Point {}:**\n{}", i, p)
                        }
                    })
                    .collect::<Vec<_>>()
                    .join("\n\n");
            }
        }

        text.to_string()
    }

    /// Rend le texte plus concis
    fn make_concise(&self, text: &str) -> String {
        // Garder uniquement les phrases clés
        let sentences: Vec<&str> = text
            .split(['.', '!', '?'])
            .filter(|s| !s.trim().is_empty())
            .collect();

        if sentences.len() <= 3 {
            return text.to_string();
        }

        // Garder la première, la dernière, et quelques unes au milieu
        let mut result = Vec::new();
        result.push(sentences[0]);

        // Garder les phrases importantes (avec des mots-clés)
        let keywords = [
            "important",
            "key",
            "main",
            "essential",
            "must",
            "should",
            "critical",
        ];
        for sentence in &sentences[1..sentences.len() - 1] {
            let lower = sentence.to_lowercase();
            if keywords.iter().any(|k| lower.contains(k)) {
                result.push(sentence);
            }
        }

        result.push(sentences[sentences.len() - 1]);

        result
            .iter()
            .map(|s| format!("{}.", s.trim()))
            .collect::<Vec<_>>()
            .join(" ")
    }

    /// Tronque gracieusement à une limite
    fn truncate_gracefully(&self, text: &str, max_len: usize) -> String {
        if text.len() <= max_len {
            return text.to_string();
        }

        // Trouver le dernier espace ou ponctuation avant la limite
        let search_start = max_len.saturating_sub(50);
        let slice = &text[search_start..max_len];

        if let Some(pos) = slice.rfind(['.', '!', '?', '\n']) {
            let end_pos = search_start + pos + 1;
            return text[..end_pos].to_string();
        }

        if let Some(pos) = slice.rfind(' ') {
            let end_pos = search_start + pos;
            return format!("{}...", &text[..end_pos]);
        }

        format!("{}...", &text[..max_len - 3])
    }

    /// Fusionne plusieurs réponses en une seule
    pub fn merge_responses(&self, responses: Vec<HarmonizedResponse>) -> HarmonizedResponse {
        if responses.is_empty() {
            return HarmonizedResponse {
                id: "merged".to_string(),
                provider: Provider::Local,
                content: ResponseContent::Text(String::new()),
                usage: UsageStats::default(),
                metadata: HashMap::new(),
            };
        }

        if responses.len() == 1 {
            return responses
                .into_iter()
                .next()
                .expect("responses len() == 1 ensures one element");
        }

        // Fusionner les contenus textuels
        let texts: Vec<String> = responses
            .iter()
            .filter_map(|r| {
                if let ResponseContent::Text(t) = &r.content {
                    Some(t.clone())
                } else {
                    None
                }
            })
            .collect();

        let merged_text = if texts.len() > 1 {
            self.synthesize_texts(&texts)
        } else {
            texts.first().cloned().unwrap_or_default()
        };

        // Agréger l'usage
        let total_usage = responses.iter().fold(UsageStats::default(), |mut acc, r| {
            acc.prompt_tokens += r.usage.prompt_tokens;
            acc.completion_tokens += r.usage.completion_tokens;
            acc.total_tokens += r.usage.total_tokens;
            acc.estimated_cost_usd += r.usage.estimated_cost_usd;
            acc
        });

        HarmonizedResponse {
            id: responses.first().map(|r| r.id.clone()).unwrap_or_default(),
            provider: Provider::Local, // Merged = local
            content: ResponseContent::Text(merged_text),
            usage: total_usage,
            metadata: HashMap::new(),
        }
    }

    /// Synthétise plusieurs textes
    fn synthesize_texts(&self, texts: &[String]) -> String {
        // Simple: concaténer avec séparateurs
        // En production, on utiliserait Claude pour synthétiser
        texts
            .iter()
            .enumerate()
            .map(|(i, t)| format!("**Perspective {}:**\n{}", i + 1, t))
            .collect::<Vec<_>>()
            .join("\n\n---\n\n")
    }
}

impl Default for ResponseHarmonizer {
    fn default() -> Self {
        Self::new()
    }
}

/// Capitalise la première lettre
fn capitalize_first(s: &str) -> String {
    let mut chars = s.chars();
    match chars.next() {
        None => String::new(),
        Some(c) => c.to_uppercase().chain(chars).collect(),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_harmonizer_creation() {
        let harmonizer = ResponseHarmonizer::new();
        assert!(harmonizer.config.normalize_style);
    }

    #[test]
    fn test_strip_pleasantries() {
        let harmonizer = ResponseHarmonizer::with_config(HarmonizationConfig {
            strip_pleasantries: true,
            ..Default::default()
        });

        let text = "Sure! Here is the answer to your question.";
        let result = harmonizer.strip_pleasantries(text);
        assert_eq!(result, "Here is the answer to your question.");
    }

    #[test]
    fn test_normalize_style() {
        let harmonizer = ResponseHarmonizer::new();
        let text = "Hello  world\n\n\n\nTest";
        let result = harmonizer.normalize_style(text);
        assert_eq!(result, "Hello world\n\nTest");
    }

    #[test]
    fn test_truncate_gracefully() {
        let harmonizer = ResponseHarmonizer::new();
        let text = "This is a long sentence. Here is another one. And a third.";
        let result = harmonizer.truncate_gracefully(text, 30);
        assert!(result.len() <= 30 || result.ends_with('.'));
    }

    #[test]
    fn test_capitalize_first() {
        assert_eq!(capitalize_first("hello"), "Hello");
        assert_eq!(capitalize_first(""), "");
    }

    #[test]
    fn test_harmonization_config_default() {
        let config = HarmonizationConfig::default();

        assert!(config.normalize_style);
        assert!(!config.strip_pleasantries);
        assert_eq!(config.preferred_format, OutputFormat::Natural);
        assert!(config.max_length.is_none());
    }

    #[test]
    fn test_output_format_variants() {
        let formats = [OutputFormat::Natural,
            OutputFormat::Structured,
            OutputFormat::Concise,
            OutputFormat::Technical];

        assert_eq!(formats.len(), 4);
        assert_ne!(OutputFormat::Natural, OutputFormat::Structured);
    }

    #[test]
    fn test_harmonizer_default() {
        let harmonizer = ResponseHarmonizer::default();
        assert!(harmonizer.config.normalize_style);
    }

    #[test]
    fn test_harmonizer_with_config() {
        let config = HarmonizationConfig {
            normalize_style: false,
            strip_pleasantries: true,
            preferred_format: OutputFormat::Concise,
            max_length: Some(100),
        };

        let harmonizer = ResponseHarmonizer::with_config(config);
        assert!(!harmonizer.config.normalize_style);
        assert!(harmonizer.config.strip_pleasantries);
    }

    #[test]
    fn test_strip_provider_prefixes_openai() {
        let harmonizer = ResponseHarmonizer::new();
        let text = "As an AI language model, I can help you.";
        let result = harmonizer.strip_provider_prefixes(text, Provider::OpenAI);

        assert!(!result.starts_with("As an AI"));
        assert!(result.starts_with("I")); // Capitalized
    }

    #[test]
    fn test_strip_provider_prefixes_anthropic() {
        let harmonizer = ResponseHarmonizer::new();
        let text = "I'd be happy to help with that.";
        let result = harmonizer.strip_provider_prefixes(text, Provider::Anthropic);

        // Anthropic prefixes are kept
        assert_eq!(result, text);
    }

    #[test]
    fn test_strip_provider_prefixes_gemini() {
        let harmonizer = ResponseHarmonizer::new();
        let text = "Here is the answer.";
        let result = harmonizer.strip_provider_prefixes(text, Provider::Gemini);

        assert_eq!(result, text);
    }

    #[test]
    fn test_strip_pleasantries_multiple() {
        let harmonizer = ResponseHarmonizer::new();

        let tests = vec![
            ("Of course! Here is the answer.", "Here is the answer."),
            ("Certainly! The answer is 42.", "The answer is 42."),
            ("Absolutely! I can help.", "I can help."),
        ];

        for (input, expected) in tests {
            let result = harmonizer.strip_pleasantries(input);
            assert_eq!(result, expected);
        }
    }

    #[test]
    fn test_strip_pleasantries_endings() {
        let harmonizer = ResponseHarmonizer::new();
        let text = "Here is the answer.\n\nI hope this helps!";
        let result = harmonizer.strip_pleasantries(text);

        assert_eq!(result, "Here is the answer.");
    }

    #[test]
    fn test_apply_format_natural() {
        let harmonizer = ResponseHarmonizer::new();
        let text = "This is natural text.";
        let result = harmonizer.apply_format(text);

        assert_eq!(result, text);
    }

    #[test]
    fn test_make_concise_short_text() {
        let harmonizer = ResponseHarmonizer::new();
        let text = "Short text. Only two sentences.";
        let result = harmonizer.make_concise(text);

        assert_eq!(result, text);
    }

    #[test]
    fn test_truncate_gracefully_short_text() {
        let harmonizer = ResponseHarmonizer::new();
        let text = "Short";
        let result = harmonizer.truncate_gracefully(text, 100);

        assert_eq!(result, text);
    }

    #[test]
    fn test_merge_responses_empty() {
        let harmonizer = ResponseHarmonizer::new();
        let responses: Vec<HarmonizedResponse> = vec![];
        let merged = harmonizer.merge_responses(responses);

        assert_eq!(merged.id, "merged");
        assert_eq!(merged.provider, Provider::Local);
    }

    #[test]
    fn test_merge_responses_single() {
        let harmonizer = ResponseHarmonizer::new();
        let response = HarmonizedResponse {
            id: "single".to_string(),
            provider: Provider::OpenAI,
            content: ResponseContent::Text("Hello".to_string()),
            usage: UsageStats::default(),
            metadata: HashMap::new(),
        };

        let merged = harmonizer.merge_responses(vec![response]);
        assert_eq!(merged.id, "single");
        assert_eq!(merged.provider, Provider::OpenAI);
    }

    #[test]
    fn test_merge_responses_multiple() {
        let harmonizer = ResponseHarmonizer::new();

        let r1 = HarmonizedResponse {
            id: "r1".to_string(),
            provider: Provider::OpenAI,
            content: ResponseContent::Text("First response".to_string()),
            usage: UsageStats {
                prompt_tokens: 10,
                completion_tokens: 20,
                total_tokens: 30,
                estimated_cost_usd: 0.01,
            },
            metadata: HashMap::new(),
        };

        let r2 = HarmonizedResponse {
            id: "r2".to_string(),
            provider: Provider::Gemini,
            content: ResponseContent::Text("Second response".to_string()),
            usage: UsageStats {
                prompt_tokens: 15,
                completion_tokens: 25,
                total_tokens: 40,
                estimated_cost_usd: 0.02,
            },
            metadata: HashMap::new(),
        };

        let merged = harmonizer.merge_responses(vec![r1, r2]);
        assert_eq!(merged.provider, Provider::Local);
        assert_eq!(merged.usage.total_tokens, 70);
    }

    #[test]
    fn test_synthesize_texts() {
        let harmonizer = ResponseHarmonizer::new();
        let texts = vec!["First".to_string(), "Second".to_string()];
        let result = harmonizer.synthesize_texts(&texts);

        assert!(result.contains("Perspective 1"));
        assert!(result.contains("Perspective 2"));
    }

    #[test]
    fn test_structure_text_already_structured() {
        let harmonizer = ResponseHarmonizer::new();
        let text = "## Header\n**Bold text**";
        let result = harmonizer.structure_text(text);

        assert_eq!(result, text);
    }

    #[test]
    fn test_harmonized_response_structure() {
        let response = HarmonizedResponse {
            id: "test-id".to_string(),
            provider: Provider::Anthropic,
            content: ResponseContent::Text("Test content".to_string()),
            usage: UsageStats::default(),
            metadata: HashMap::new(),
        };

        assert_eq!(response.id, "test-id");
        assert_eq!(response.provider, Provider::Anthropic);
    }

    #[test]
    fn test_harmonized_response_clone() {
        let response = HarmonizedResponse {
            id: "clone-test".to_string(),
            provider: Provider::Gemini,
            content: ResponseContent::Text("Clone content".to_string()),
            usage: UsageStats::default(),
            metadata: HashMap::new(),
        };

        let cloned = response.clone();
        assert_eq!(cloned.id, "clone-test");
        assert_eq!(cloned.provider, Provider::Gemini);
    }

    #[test]
    fn test_capitalize_first_unicode() {
        assert_eq!(capitalize_first("éléphant"), "Éléphant");
        assert_eq!(capitalize_first("über"), "Über");
    }

    #[test]
    fn test_normalize_style_only_whitespace() {
        let harmonizer = ResponseHarmonizer::new();
        let text = "    \n\n    ";
        let result = harmonizer.normalize_style(text);

        assert!(result.is_empty());
    }

    #[test]
    fn test_harmonize_text_with_max_length() {
        let harmonizer = ResponseHarmonizer::with_config(HarmonizationConfig {
            max_length: Some(20),
            ..Default::default()
        });

        let text = "This is a very long text that should be truncated.";
        let result = harmonizer.harmonize_text(text, Provider::OpenAI);

        assert!(result.len() <= 25); // Allow for "..." suffix
    }

    #[test]
    fn test_output_format_equality() {
        assert_eq!(OutputFormat::Natural, OutputFormat::Natural);
        assert_ne!(OutputFormat::Natural, OutputFormat::Concise);
    }
}
