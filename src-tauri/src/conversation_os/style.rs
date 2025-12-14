//! ═══════════════════════════════════════════════════════════════════════════════
//! TITANE∞ v20Ω — STYLE ENGINE
//! Super Prompt #9 — Application du style, ton et formatting
//! ═══════════════════════════════════════════════════════════════════════════════

use super::persona::{PersonaProfile, ResponseLength, StructureLevel};
use serde::{Deserialize, Serialize};

/// Configuration de style
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct StyleConfig {
    /// Niveau de détail (1-5)
    pub detail_level: u8,
    /// Utiliser le markdown
    pub use_markdown: bool,
    /// Utiliser la numérotation
    pub use_numbering: bool,
    /// Longueur maximale suggérée
    pub max_length: Option<usize>,
}

impl Default for StyleConfig {
    fn default() -> Self {
        Self {
            detail_level: 3,
            use_markdown: true,
            use_numbering: true,
            max_length: None,
        }
    }
}

/// Niveau de style
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub enum StyleLevel {
    Minimal,
    Standard,
    Enhanced,
    Full,
}

/// Texte stylisé
#[derive(Clone, Debug)]
pub struct StyledText {
    pub content: String,
    pub style_applied: StyleLevel,
    pub transformations: Vec<String>,
}

/// Moteur de style
pub struct StyleEngine {
    depth: u8,
    config: StyleConfig,
}

impl StyleEngine {
    pub fn new(depth: u8) -> Self {
        Self {
            depth,
            config: StyleConfig::default(),
        }
    }

    /// Applique le style basé sur le persona
    pub async fn apply(&self, text: &str, persona: &PersonaProfile) -> StyledText {
        let mut content = text.to_string();
        let mut transformations = Vec::new();

        // 1. Ajuster la formalité
        if persona.config.traits.formality > 0.7 {
            content = self.make_formal(&content);
            transformations.push("formal".to_string());
        } else if persona.config.traits.formality < 0.3 {
            content = self.make_casual(&content);
            transformations.push("casual".to_string());
        }

        // 2. Structurer selon préférences
        content = self.apply_structure(&content, &persona.config.style_preferences.structure_level);
        transformations.push(format!(
            "structure:{:?}",
            persona.config.style_preferences.structure_level
        ));

        // 3. Ajuster la longueur
        content = self.adjust_length(&content, &persona.config.style_preferences.response_length);

        // 4. Ajouter des listes si préféré
        if persona.config.style_preferences.use_lists {
            content = self.enhance_with_lists(&content);
        }

        // 5. Ajouter des exemples si persona le préfère et si approprié
        if persona.config.style_preferences.use_examples && persona.config.traits.precision > 0.7 {
            transformations.push("examples_enabled".to_string());
        }

        // 6. Gérer les emojis
        if !persona.config.style_preferences.use_emojis {
            content = self.remove_emojis(&content);
        }

        // 7. Ajuster le ton selon warmth
        if persona.config.traits.warmth > 0.7 {
            content = self.add_warmth(&content);
            transformations.push("warm".to_string());
        }

        StyledText {
            content,
            style_applied: self.determine_style_level(&transformations),
            transformations,
        }
    }

    /// Rend le texte plus formel
    fn make_formal(&self, text: &str) -> String {
        let mut result = text.to_string();

        // Remplacements informel -> formel
        let replacements = [
            ("ok", "d'accord"),
            ("yeah", "oui"),
            ("nope", "non"),
            ("gonna", "going to"),
            ("wanna", "want to"),
            ("gotta", "have to"),
            ("kinda", "kind of"),
            ("ya", "you"),
        ];

        for (informal, formal) in replacements {
            result = result.replace(informal, formal);
        }

        result
    }

    /// Rend le texte plus casual
    fn make_casual(&self, text: &str) -> String {
        let mut result = text.to_string();

        // Remplacements formel -> informel
        let replacements = [
            ("cependant", "mais"),
            ("néanmoins", "quand même"),
            ("toutefois", "mais"),
            ("however", "but"),
            ("nevertheless", "still"),
            ("furthermore", "also"),
        ];

        for (formal, casual) in replacements {
            result = result.replace(formal, casual);
        }

        result
    }

    /// Applique la structure
    fn apply_structure(&self, text: &str, level: &StructureLevel) -> String {
        match level {
            StructureLevel::Minimal => text.to_string(),
            StructureLevel::Moderate => self.add_moderate_structure(text),
            StructureLevel::High => self.add_high_structure(text),
            StructureLevel::Maximum => self.add_maximum_structure(text),
        }
    }

    fn add_moderate_structure(&self, text: &str) -> String {
        // Ajouter des paragraphes si le texte est long
        if text.len() > 500 {
            let sentences: Vec<&str> = text.split(". ").collect();
            let mut result = String::new();
            let mut current_paragraph = String::new();

            for (i, sentence) in sentences.iter().enumerate() {
                current_paragraph.push_str(sentence);
                current_paragraph.push_str(". ");

                if (i + 1) % 3 == 0 {
                    result.push_str(&current_paragraph);
                    result.push_str("\n\n");
                    current_paragraph.clear();
                }
            }
            result.push_str(&current_paragraph);
            result.trim().to_string()
        } else {
            text.to_string()
        }
    }

    fn add_high_structure(&self, text: &str) -> String {
        let structured = self.add_moderate_structure(text);
        // Ajouter des en-têtes pour les sections longues
        if structured.len() > 1000 {
            format!("## Réponse\n\n{}", structured)
        } else {
            structured
        }
    }

    fn add_maximum_structure(&self, text: &str) -> String {
        let structured = self.add_high_structure(text);
        // Ajouter des séparateurs et numérotation
        if structured.contains("\n\n") {
            let parts: Vec<&str> = structured.split("\n\n").collect();
            parts
                .iter()
                .enumerate()
                .map(|(i, p)| format!("**{}.**\n{}", i + 1, p))
                .collect::<Vec<_>>()
                .join("\n\n---\n\n")
        } else {
            structured
        }
    }

    /// Ajuste la longueur selon les préférences
    fn adjust_length(&self, text: &str, length: &ResponseLength) -> String {
        let max_chars = match length {
            ResponseLength::Concise => 300,
            ResponseLength::Balanced => 800,
            ResponseLength::Detailed => 2000,
            ResponseLength::Comprehensive => 5000,
        };

        if text.len() > max_chars {
            let truncated = &text[..max_chars];
            if let Some(last_period) = truncated.rfind(". ") {
                format!("{}.", &truncated[..last_period])
            } else {
                format!("{}...", truncated.trim())
            }
        } else {
            text.to_string()
        }
    }

    /// Améliore avec des listes quand approprié
    fn enhance_with_lists(&self, text: &str) -> String {
        // Détecter les énumérations potentielles
        if text.contains(", ") && text.matches(", ").count() >= 3 {
            // Potentielle liste
            let parts: Vec<&str> = text.split(". ").collect();
            let mut result = Vec::new();

            for part in parts {
                if part.matches(", ").count() >= 3 {
                    let items: Vec<&str> = part.split(", ").collect();
                    let list = items
                        .iter()
                        .map(|item| format!("- {}", item.trim()))
                        .collect::<Vec<_>>()
                        .join("\n");
                    result.push(list);
                } else {
                    result.push(part.to_string());
                }
            }

            result.join(". ")
        } else {
            text.to_string()
        }
    }

    /// Retire les emojis du texte
    fn remove_emojis(&self, text: &str) -> String {
        text.chars()
            .filter(|c| {
                !c.is_ascii()
                    || c.is_alphanumeric()
                    || c.is_whitespace()
                    || c.is_ascii_punctuation()
            })
            .filter(|c| {
                let code = *c as u32;
                // Filtrer les plages d'emoji Unicode
                !(0x1F600..=0x1F64F).contains(&code) && // Emoticons
                !(0x1F300..=0x1F5FF).contains(&code) && // Symboles
                !(0x1F680..=0x1F6FF).contains(&code) && // Transport
                !(0x2600..=0x26FF).contains(&code) &&   // Misc symboles
                !(0x2700..=0x27BF).contains(&code) // Dingbats
            })
            .collect()
    }

    /// Ajoute de la chaleur au texte
    fn add_warmth(&self, text: &str) -> String {
        // Ajouter des mots de liaison chaleureux
        let mut result = text.to_string();

        // Ne pas modifier si déjà chaleureux
        if !result.starts_with("Bien sûr")
            && !result.starts_with("Absolument")
            && !result.starts_with("Avec plaisir")
        {
            // Probabilité d'ajout (simple)
            if result.len() > 50 {
                result = format!(
                    "Bien sûr, {}",
                    result
                        .chars()
                        .next()
                        .unwrap()
                        .to_lowercase()
                        .collect::<String>()
                        + &result[1..]
                );
            }
        }

        result
    }

    /// Détermine le niveau de style appliqué
    fn determine_style_level(&self, transformations: &[String]) -> StyleLevel {
        match transformations.len() {
            0 => StyleLevel::Minimal,
            1..=2 => StyleLevel::Standard,
            3..=4 => StyleLevel::Enhanced,
            _ => StyleLevel::Full,
        }
    }

    /// Met à jour la configuration
    pub fn set_config(&mut self, config: StyleConfig) {
        self.config = config;
    }
}

impl Default for StyleEngine {
    fn default() -> Self {
        Self::new(3)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_style_engine_basic() {
        let engine = StyleEngine::new(3);
        let profile = PersonaProfile::default();

        let styled = engine.apply("Hello, this is a test.", &profile).await;
        assert!(!styled.content.is_empty());
    }

    #[tokio::test]
    async fn test_formal_style() {
        let engine = StyleEngine::new(3);
        let mut profile = PersonaProfile::default();
        profile.config.traits.formality = 0.9;

        let styled = engine.apply("ok gonna do that", &profile).await;
        assert!(styled.content.contains("d'accord") || styled.content.contains("going to"));
    }

    #[tokio::test]
    async fn test_emoji_removal() {
        let engine = StyleEngine::new(3);
        let result = engine.remove_emojis("Hello 😀 World");

        assert!(!result.contains('😀'));
        assert!(result.contains("Hello"));
        assert!(result.contains("World"));
    }
}
