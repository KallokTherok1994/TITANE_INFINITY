//! ═══════════════════════════════════════════════════════════════════════════════
//! TITANE∞ v20Ω — RESPONSE ADAPTER
//! Super Prompt #9 — Adaptation des réponses au canal et contexte
//! ═══════════════════════════════════════════════════════════════════════════════

use super::style::StyledText;
use serde::{Deserialize, Serialize};

/// Canal de sortie
#[derive(Clone, Debug, Default, PartialEq, Eq, Serialize, Deserialize)]
pub enum OutputChannel {
    #[default]
    Text,
    Voice,
    Chat,
    Api,
    DevTools,
}

/// Contexte d'adaptation
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct AdaptationContext {
    pub channel: OutputChannel,
    pub max_length: Option<usize>,
    pub supports_markdown: bool,
    pub supports_code: bool,
    pub voice_mode: bool,
    pub device_type: DeviceType,
}

impl Default for AdaptationContext {
    fn default() -> Self {
        Self {
            channel: OutputChannel::Text,
            max_length: None,
            supports_markdown: true,
            supports_code: true,
            voice_mode: false,
            device_type: DeviceType::Desktop,
        }
    }
}

/// Type d'appareil
#[derive(Clone, Debug, Default, PartialEq, Eq, Serialize, Deserialize)]
pub enum DeviceType {
    #[default]
    Desktop,
    Mobile,
    Tablet,
    Terminal,
    Api,
}

/// Texte adapté
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct AdaptedText {
    pub content: String,
    pub channel: OutputChannel,
    pub truncated: bool,
    pub voice_optimized: bool,
    pub adaptations_applied: Vec<String>,
}

/// Adaptateur de réponse
pub struct ResponseAdapter {
    voice_max_length: usize,
    mobile_max_length: usize,
}

impl ResponseAdapter {
    pub fn new() -> Self {
        Self {
            voice_max_length: 500,
            mobile_max_length: 1000,
        }
    }

    /// Adapte le texte au canal
    pub async fn adapt(&self, styled: &StyledText, channel: OutputChannel) -> AdaptedText {
        let mut content = styled.content.clone();
        let mut adaptations = Vec::new();
        let mut truncated = false;
        let mut voice_optimized = false;

        match channel {
            OutputChannel::Voice => {
                content = self.adapt_for_voice(&content);
                voice_optimized = true;
                adaptations.push("voice_optimization".to_string());

                if content.len() > self.voice_max_length {
                    content = self.truncate(&content, self.voice_max_length);
                    truncated = true;
                    adaptations.push("truncated".to_string());
                }
            }
            OutputChannel::Chat => {
                content = self.adapt_for_chat(&content);
                adaptations.push("chat_formatting".to_string());
            }
            OutputChannel::Api => {
                content = self.adapt_for_api(&content);
                adaptations.push("api_cleanup".to_string());
            }
            OutputChannel::DevTools => {
                content = self.adapt_for_devtools(&content);
                adaptations.push("devtools_formatting".to_string());
            }
            OutputChannel::Text => {
                // Pas d'adaptation spécifique
            }
        }

        AdaptedText {
            content,
            channel,
            truncated,
            voice_optimized,
            adaptations_applied: adaptations,
        }
    }

    /// Adapte pour la sortie vocale
    fn adapt_for_voice(&self, text: &str) -> String {
        let mut result = text.to_string();

        // Supprimer le markdown
        result = self.remove_markdown(&result);

        // Convertir les abréviations
        result = self.expand_abbreviations(&result);

        // Simplifier les listes
        result = self.simplify_lists(&result);

        // Ajouter des pauses naturelles
        result = self.add_voice_pauses(&result);

        result
    }

    /// Adapte pour le chat
    fn adapt_for_chat(&self, text: &str) -> String {
        let mut result = text.to_string();

        // Garder le markdown basique
        // Simplifier les blocs de code longs
        if result.contains("```") {
            result = self.simplify_code_blocks(&result);
        }

        result
    }

    /// Adapte pour l'API
    fn adapt_for_api(&self, text: &str) -> String {
        // Nettoyer pour JSON
        text.replace('\n', "\\n")
            .replace('\r', "")
            .replace('\t', "\\t")
    }

    /// Adapte pour DevTools
    fn adapt_for_devtools(&self, text: &str) -> String {
        // Ajouter des métadonnées de debug
        format!("[CONV_OS] {}", text)
    }

    /// Supprime le markdown
    fn remove_markdown(&self, text: &str) -> String {
        let mut result = text.to_string();

        // Headers
        result = result
            .lines()
            .map(|line| {
                if line.starts_with('#') {
                    line.trim_start_matches('#').trim().to_string()
                } else {
                    line.to_string()
                }
            })
            .collect::<Vec<_>>()
            .join("\n");

        // Bold/Italic
        result = result.replace("**", "");
        result = result.replace("__", "");
        result = result.replace('*', "");
        result = result.replace('_', " ");

        // Code blocks
        result = result.replace("```", "");

        // Inline code
        result = result.replace('`', "");

        // Links [text](url) -> text
        // Simplification: juste retirer les crochets
        result = result.replace('[', "");
        result = result.replace(']', "");
        result = result.replace('(', " ");
        result = result.replace(')', " ");

        result
    }

    /// Expande les abréviations pour la voix
    fn expand_abbreviations(&self, text: &str) -> String {
        let mut result = text.to_string();

        let abbreviations = [
            ("etc.", "et cetera"),
            ("e.g.", "par exemple"),
            ("i.e.", "c'est-à-dire"),
            ("vs.", "versus"),
            ("Mr.", "Monsieur"),
            ("Mrs.", "Madame"),
            ("Dr.", "Docteur"),
            ("Prof.", "Professeur"),
            ("approx.", "approximativement"),
            ("min.", "minutes"),
            ("sec.", "secondes"),
            ("hrs.", "heures"),
        ];

        for (abbr, expansion) in abbreviations {
            result = result.replace(abbr, expansion);
        }

        result
    }

    /// Simplifie les listes pour la voix
    fn simplify_lists(&self, text: &str) -> String {
        text.lines()
            .map(|line| {
                let trimmed = line.trim();
                if trimmed.starts_with("- ") || trimmed.starts_with("* ") {
                    format!("{}.", &trimmed[2..])
                } else if trimmed
                    .chars()
                    .next()
                    .map(|c| c.is_numeric())
                    .unwrap_or(false)
                    && trimmed.contains(". ")
                {
                    let parts: Vec<&str> = trimmed.splitn(2, ". ").collect();
                    if parts.len() == 2 {
                        format!("Premièrement, {}.", parts[1].trim_end_matches('.'))
                    } else {
                        line.to_string()
                    }
                } else {
                    line.to_string()
                }
            })
            .collect::<Vec<_>>()
            .join(" ")
    }

    /// Ajoute des pauses pour la synthèse vocale
    fn add_voice_pauses(&self, text: &str) -> String {
        let mut result = text.to_string();

        // Ajouter des pauses après les points
        result = result.replace(". ", ".\n");

        // Pauses après les virgules longues
        // Note: No transformation needed here (already correct)

        result
    }

    /// Simplifie les blocs de code
    fn simplify_code_blocks(&self, text: &str) -> String {
        let mut result = String::new();
        let mut in_code_block = false;
        let mut code_lines = 0;

        for line in text.lines() {
            if line.starts_with("```") {
                if in_code_block {
                    if code_lines > 10 {
                        result.push_str("[Code tronqué...]\n");
                    }
                    result.push_str("```\n");
                    in_code_block = false;
                    code_lines = 0;
                } else {
                    result.push_str(line);
                    result.push('\n');
                    in_code_block = true;
                }
            } else if in_code_block {
                code_lines += 1;
                if code_lines <= 10 {
                    result.push_str(line);
                    result.push('\n');
                }
            } else {
                result.push_str(line);
                result.push('\n');
            }
        }

        result
    }

    /// Tronque le texte
    fn truncate(&self, text: &str, max_len: usize) -> String {
        if text.len() <= max_len {
            return text.to_string();
        }

        // Trouver la dernière phrase complète
        let truncated = &text[..max_len];
        if let Some(last_period) = truncated.rfind(". ") {
            format!("{}.", &truncated[..last_period])
        } else {
            format!("{}...", truncated.trim())
        }
    }

    /// Crée un contexte d'adaptation
    pub fn create_context(channel: OutputChannel) -> AdaptationContext {
        match channel {
            OutputChannel::Voice => AdaptationContext {
                channel,
                max_length: Some(500),
                supports_markdown: false,
                supports_code: false,
                voice_mode: true,
                device_type: DeviceType::Desktop,
            },
            OutputChannel::Chat => AdaptationContext {
                channel,
                max_length: Some(4000),
                supports_markdown: true,
                supports_code: true,
                voice_mode: false,
                device_type: DeviceType::Desktop,
            },
            OutputChannel::Api => AdaptationContext {
                channel,
                max_length: None,
                supports_markdown: true,
                supports_code: true,
                voice_mode: false,
                device_type: DeviceType::Api,
            },
            _ => AdaptationContext::default(),
        }
    }
}

impl Default for ResponseAdapter {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::conversation_os::style::StyleLevel;

    fn create_styled_text(content: &str) -> StyledText {
        StyledText {
            content: content.to_string(),
            style_applied: StyleLevel::Standard,
            transformations: vec![],
        }
    }

    #[tokio::test]
    async fn test_voice_adaptation() {
        let adapter = ResponseAdapter::new();
        let styled = create_styled_text("**Hello** world! This is a *test*.");

        let adapted = adapter.adapt(&styled, OutputChannel::Voice).await;
        assert!(adapted.voice_optimized);
        assert!(!adapted.content.contains("**"));
        assert!(!adapted.content.contains("*"));
    }

    #[tokio::test]
    async fn test_truncation() {
        let adapter = ResponseAdapter::new();
        let long_text = "A".repeat(1000);
        let styled = create_styled_text(&long_text);

        let adapted = adapter.adapt(&styled, OutputChannel::Voice).await;
        assert!(adapted.truncated);
        assert!(adapted.content.len() <= 510); // max + quelques caractères pour "..."
    }

    #[test]
    fn test_markdown_removal() {
        let adapter = ResponseAdapter::new();
        let result = adapter.remove_markdown("## Header\n**bold** and *italic*");
        assert!(!result.contains("##"));
        assert!(!result.contains("**"));
    }

    #[test]
    fn test_abbreviation_expansion() {
        let adapter = ResponseAdapter::new();
        let result = adapter.expand_abbreviations("e.g. this is an example");
        assert!(result.contains("par exemple"));
    }
}
