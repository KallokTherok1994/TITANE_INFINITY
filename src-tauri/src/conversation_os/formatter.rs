//! ═══════════════════════════════════════════════════════════════════════════════
//! TITANE∞ v20Ω — RESPONSE FORMATTER
//! Super Prompt #9 — Formatage et mise en forme des réponses
//! ═══════════════════════════════════════════════════════════════════════════════

use super::OutputContext;
use serde::{Deserialize, Serialize};

/// Sortie formatée
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct FormattedOutput {
    pub content: String,
    pub format: OutputFormat,
    pub sections: Vec<FormattedSection>,
    pub metadata: FormatMetadata,
}

/// Format de sortie
#[derive(Clone, Debug, Default, PartialEq, Eq, Serialize, Deserialize)]
pub enum OutputFormat {
    #[default]
    PlainText,
    Markdown,
    Html,
    Json,
    Structured,
}

/// Section formatée
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct FormattedSection {
    pub section_type: SectionType,
    pub title: Option<String>,
    pub content: String,
    pub order: u32,
}

/// Type de section
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub enum SectionType {
    Introduction,
    MainContent,
    List,
    CodeBlock,
    Quote,
    Note,
    Warning,
    Conclusion,
    CallToAction,
}

/// Métadonnées de formatage
#[derive(Clone, Debug, Default, Serialize, Deserialize)]
pub struct FormatMetadata {
    pub word_count: usize,
    pub char_count: usize,
    pub reading_time_secs: u32,
    pub has_code: bool,
    pub has_lists: bool,
    pub complexity_score: f32,
}

/// Moteur de formatage
pub struct ResponseFormatter {
    default_format: OutputFormat,
    max_section_length: usize,
}

impl ResponseFormatter {
    pub fn new() -> Self {
        Self {
            default_format: OutputFormat::Markdown,
            max_section_length: 2000,
        }
    }

    /// Formate le contexte de sortie
    pub async fn format(&self, context: &OutputContext) -> FormattedOutput {
        let sections = self.create_sections(context);
        let content = self.assemble_content(&sections, &self.default_format);
        let metadata = self.calculate_metadata(&content);

        FormattedOutput {
            content,
            format: self.default_format.clone(),
            sections,
            metadata,
        }
    }

    /// Crée les sections de la réponse
    fn create_sections(&self, context: &OutputContext) -> Vec<FormattedSection> {
        let mut sections = Vec::new();
        let mut order = 0;

        // Introduction si conversation profonde
        if context.narrative.depth > 3 {
            sections.push(FormattedSection {
                section_type: SectionType::Introduction,
                title: None,
                content: self.generate_introduction(context),
                order,
            });
            order += 1;
        }

        // Contenu principal (placeholder - sera rempli par OMEGA)
        sections.push(FormattedSection {
            section_type: SectionType::MainContent,
            title: None,
            content: "[MAIN_CONTENT]".to_string(),
            order,
        });
        order += 1;

        // Ajouter les éléments clés de cohérence si disponibles
        if let Some(ref coherence) = context.coherence {
            if !coherence.recommendations.is_empty() && coherence.overall_score < 0.8 {
                sections.push(FormattedSection {
                    section_type: SectionType::Note,
                    title: Some("Note".to_string()),
                    content: coherence
                        .recommendations
                        .first()
                        .cloned()
                        .unwrap_or_default(),
                    order,
                });
                order += 1;
            }
        }

        // Conclusion si besoin
        if context.narrative.depth > 5 {
            sections.push(FormattedSection {
                section_type: SectionType::Conclusion,
                title: None,
                content: self.generate_conclusion(context),
                order,
            });
        }

        sections
    }

    /// Génère une introduction contextuelle
    fn generate_introduction(&self, context: &OutputContext) -> String {
        match context.emotional_state.suggested_response_tone {
            super::emotion::ResponseTone::Empathetic => "Je comprends votre situation.".to_string(),
            super::emotion::ResponseTone::Calming => "Prenons cela étape par étape.".to_string(),
            super::emotion::ResponseTone::Enthusiastic => "Excellente question!".to_string(),
            _ => String::new(),
        }
    }

    /// Génère une conclusion
    fn generate_conclusion(&self, context: &OutputContext) -> String {
        if context.narrative.key_points.len() > 3 {
            "N'hésitez pas si vous avez d'autres questions.".to_string()
        } else {
            String::new()
        }
    }

    /// Assemble le contenu final
    fn assemble_content(&self, sections: &[FormattedSection], format: &OutputFormat) -> String {
        let mut content = String::new();

        for section in sections {
            match format {
                OutputFormat::Markdown => {
                    if let Some(ref title) = section.title {
                        content.push_str(&format!("## {}\n\n", title));
                    }
                    content.push_str(&section.content);
                    content.push_str("\n\n");
                }
                OutputFormat::Html => {
                    if let Some(ref title) = section.title {
                        content.push_str(&format!("<h2>{}</h2>", title));
                    }
                    content.push_str(&format!("<p>{}</p>", section.content));
                }
                OutputFormat::Structured => {
                    content.push_str(&format!(
                        "[{}] {}\n",
                        format!("{:?}", section.section_type),
                        section.content
                    ));
                }
                _ => {
                    if let Some(ref title) = section.title {
                        content.push_str(&format!("{}:\n", title));
                    }
                    content.push_str(&section.content);
                    content.push_str("\n\n");
                }
            }
        }

        content.trim().to_string()
    }

    /// Calcule les métadonnées
    fn calculate_metadata(&self, content: &str) -> FormatMetadata {
        let word_count = content.split_whitespace().count();
        let char_count = content.chars().count();
        let reading_time = (word_count as f32 / 200.0 * 60.0) as u32; // ~200 mots/min
        let has_code = content.contains("```") || content.contains("<code>");
        let has_lists = content.contains("- ") || content.contains("* ") || content.contains("1. ");

        let complexity_score = if word_count > 500 {
            0.8
        } else if word_count > 200 {
            0.5
        } else {
            0.3
        };

        FormatMetadata {
            word_count,
            char_count,
            reading_time_secs: reading_time,
            has_code,
            has_lists,
            complexity_score,
        }
    }

    /// Formate une liste
    pub fn format_list(&self, items: &[String], numbered: bool) -> String {
        items
            .iter()
            .enumerate()
            .map(|(i, item)| {
                if numbered {
                    format!("{}. {}", i + 1, item)
                } else {
                    format!("- {}", item)
                }
            })
            .collect::<Vec<_>>()
            .join("\n")
    }

    /// Formate un bloc de code
    pub fn format_code(&self, code: &str, language: &str) -> String {
        format!("```{}\n{}\n```", language, code)
    }

    /// Formate une citation
    pub fn format_quote(&self, text: &str) -> String {
        text.lines()
            .map(|line| format!("> {}", line))
            .collect::<Vec<_>>()
            .join("\n")
    }

    /// Formate un avertissement
    pub fn format_warning(&self, text: &str) -> String {
        format!("**Attention:** {}", text)
    }

    /// Formate une note
    pub fn format_note(&self, text: &str) -> String {
        format!("*Note: {}*", text)
    }

    /// Change le format par défaut
    pub fn set_default_format(&mut self, format: OutputFormat) {
        self.default_format = format;
    }
}

impl Default for ResponseFormatter {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_format_list_bulleted() {
        let formatter = ResponseFormatter::new();
        let items = vec!["Item 1".to_string(), "Item 2".to_string()];
        let result = formatter.format_list(&items, false);
        assert!(result.contains("- Item 1"));
        assert!(result.contains("- Item 2"));
    }

    #[test]
    fn test_format_list_numbered() {
        let formatter = ResponseFormatter::new();
        let items = vec!["First".to_string(), "Second".to_string()];
        let result = formatter.format_list(&items, true);
        assert!(result.contains("1. First"));
        assert!(result.contains("2. Second"));
    }

    #[test]
    fn test_format_code() {
        let formatter = ResponseFormatter::new();
        let result = formatter.format_code("println!(\"Hello\");", "rust");
        assert!(result.contains("```rust"));
        assert!(result.contains("println!"));
    }

    #[test]
    fn test_metadata_calculation() {
        let formatter = ResponseFormatter::new();
        let metadata = formatter.calculate_metadata("Hello world. This is a test.");
        assert_eq!(metadata.word_count, 6);
        assert!(metadata.char_count > 0);
    }
}
