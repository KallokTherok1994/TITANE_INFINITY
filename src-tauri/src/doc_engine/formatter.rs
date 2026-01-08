// Module de formatage de documents

use super::*;

pub struct DocumentFormatter;

impl DocumentFormatter {
    pub fn new() -> Self {
        Self
    }
    
    /// Applique le formatage selon le style et configuration
    pub fn format(&self, content: DocumentContent, config: &GenerationConfig) -> Result<DocumentContent> {
        let mut formatted = content;
        
        // Application du style
        formatted = self.apply_style(formatted, &config.style)?;
        
        // Application du niveau de détail
        formatted = self.apply_detail_level(formatted, &config.detail_level)?;
        
        // Application de la tonalité
        formatted = self.apply_tone(formatted, &config.tone)?;
        
        // Nettoyage et cohérence
        formatted = self.clean_and_normalize(formatted)?;
        
        Ok(formatted)
    }
    
    fn apply_style(&self, mut content: DocumentContent, style: &DocumentStyle) -> Result<DocumentContent> {
        match style {
            DocumentStyle::Legal => {
                // Style formel, juridique, précis
                content = self.apply_legal_formatting(content)?;
            }
            DocumentStyle::Technical => {
                // Style technique, structuré, avec code
                content = self.apply_technical_formatting(content)?;
            }
            DocumentStyle::Editorial => {
                // Style fluide, narratif, pédagogique
                content = self.apply_editorial_formatting(content)?;
            }
            DocumentStyle::Professional => {
                // Style professionnel standard
                content = self.apply_professional_formatting(content)?;
            }
            _ => {}
        }
        
        Ok(content)
    }
    
    fn apply_legal_formatting(&self, mut content: DocumentContent) -> Result<DocumentContent> {
        // Numérotation des sections
        for (idx, section) in content.sections.iter_mut().enumerate() {
            if !section.title.starts_with(char::is_numeric) {
                section.title = format!("{}. {}", idx + 1, section.title);
            }
        }
        
        // Formatage formel
        content.executive_summary = self.formalize_text(&content.executive_summary);
        
        Ok(content)
    }
    
    fn apply_technical_formatting(&self, mut content: DocumentContent) -> Result<DocumentContent> {
        // S'assurer que les blocs de code sont bien formatés
        for section in &mut content.sections {
            section.content = self.format_code_blocks(&section.content);
        }
        
        Ok(content)
    }
    
    fn apply_editorial_formatting(&self, mut content: DocumentContent) -> Result<DocumentContent> {
        // Améliorer la fluidité et le rythme
        for section in &mut content.sections {
            section.content = self.improve_readability(&section.content);
        }
        
        Ok(content)
    }
    
    fn apply_professional_formatting(&self, content: DocumentContent) -> Result<DocumentContent> {
        // Formatage professionnel standard
        Ok(content)
    }
    
    fn apply_detail_level(&self, mut content: DocumentContent, level: &DetailLevel) -> Result<DocumentContent> {
        match level {
            DetailLevel::Summary => {
                // Condenser le contenu
                for section in &mut content.sections {
                    section.content = self.condense_text(&section.content, 500);
                }
            }
            DetailLevel::Standard => {
                // Niveau par défaut
            }
            DetailLevel::Advanced => {
                // Ajouter plus de détails si nécessaire
            }
            DetailLevel::Exhaustive => {
                // Niveau maximal de détail
            }
        }
        
        Ok(content)
    }
    
    fn apply_tone(&self, content: DocumentContent, tone: &str) -> Result<DocumentContent> {
        // Ajustement de la tonalité selon Harmonia v13
        match tone {
            "strict" => Ok(self.apply_strict_tone(content)?),
            "neutral" => Ok(content),
            "accessible" => Ok(self.apply_accessible_tone(content)?),
            _ => Ok(content),
        }
    }
    
    fn apply_strict_tone(&self, mut content: DocumentContent) -> Result<DocumentContent> {
        // Rendre le ton plus strict et formel
        content.executive_summary = self.formalize_text(&content.executive_summary);
        Ok(content)
    }
    
    fn apply_accessible_tone(&self, mut content: DocumentContent) -> Result<DocumentContent> {
        // Rendre le ton plus accessible
        for section in &mut content.sections {
            section.content = self.simplify_language(&section.content);
        }
        Ok(content)
    }
    
    fn clean_and_normalize(&self, mut content: DocumentContent) -> Result<DocumentContent> {
        // Nettoyage des espaces multiples
        content.title = self.clean_whitespace(&content.title);
        content.executive_summary = self.clean_whitespace(&content.executive_summary);
        
        for section in &mut content.sections {
            section.title = self.clean_whitespace(&section.title);
            section.content = self.clean_whitespace(&section.content);
        }
        
        // Normalisation de la ponctuation
        content = self.normalize_punctuation(content);
        
        Ok(content)
    }
    
    fn formalize_text(&self, text: &str) -> String {
        // Rendre le texte plus formel
        text.to_string()
    }
    
    fn format_code_blocks(&self, text: &str) -> String {
        // S'assurer que les blocs de code sont correctement formatés
        text.to_string()
    }
    
    fn improve_readability(&self, text: &str) -> String {
        // Améliorer la lisibilité
        text.to_string()
    }
    
    fn condense_text(&self, text: &str, max_length: usize) -> String {
        if text.len() <= max_length {
            text.to_string()
        } else {
            format!("{}...", &text[..max_length.min(text.len())])
        }
    }
    
    fn simplify_language(&self, text: &str) -> String {
        // Simplifier le langage
        text.to_string()
    }
    
    fn clean_whitespace(&self, text: &str) -> String {
        text.split_whitespace().collect::<Vec<_>>().join(" ")
    }
    
    fn normalize_punctuation(&self, content: DocumentContent) -> DocumentContent {
        // Normaliser la ponctuation
        content
    }
}

impl Default for DocumentFormatter {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn create_test_content() -> DocumentContent {
        DocumentContent {
            title: "Test Document".to_string(),
            executive_summary: "This is a test summary".to_string(),
            objectives: vec!["Objective 1".to_string()],
            sections: vec![
                Section {
                    title: "Introduction".to_string(),
                    content: "This is the introduction section content.".to_string(),
                    level: 1,
                    subsections: vec![],
                    metadata: None,
                },
                Section {
                    title: "Main Content".to_string(),
                    content: "This is the main content section.".to_string(),
                    level: 1,
                    subsections: vec![],
                    metadata: None,
                },
            ],
            mandatory_clauses: None,
            annexes: vec![],
            references: vec![],
        }
    }

    fn create_test_config(style: DocumentStyle, detail_level: DetailLevel, tone: &str) -> GenerationConfig {
        GenerationConfig {
            style,
            detail_level,
            tone: tone.to_string(),
            include_toc: false,
            include_summary: true,
        }
    }

    #[test]
    fn test_formatter_new() {
        let formatter = DocumentFormatter::new();
        assert!(std::mem::size_of_val(&formatter) >= 0);
    }

    #[test]
    fn test_formatter_default() {
        let formatter = DocumentFormatter::default();
        assert!(std::mem::size_of_val(&formatter) >= 0);
    }

    #[test]
    fn test_format_legal_style() {
        let formatter = DocumentFormatter::new();
        let content = create_test_content();
        let config = create_test_config(DocumentStyle::Legal, DetailLevel::Standard, "neutral");

        let result = formatter.format(content, &config);
        assert!(result.is_ok());

        let formatted = result.unwrap();
        // Legal style should add numbering to sections
        assert!(formatted.sections[0].title.starts_with("1."));
        assert!(formatted.sections[1].title.starts_with("2."));
    }

    #[test]
    fn test_format_technical_style() {
        let formatter = DocumentFormatter::new();
        let content = create_test_content();
        let config = create_test_config(DocumentStyle::Technical, DetailLevel::Standard, "neutral");

        let result = formatter.format(content, &config);
        assert!(result.is_ok());

        let formatted = result.unwrap();
        assert_eq!(formatted.title, "Test Document");
    }

    #[test]
    fn test_format_editorial_style() {
        let formatter = DocumentFormatter::new();
        let content = create_test_content();
        let config = create_test_config(DocumentStyle::Editorial, DetailLevel::Standard, "neutral");

        let result = formatter.format(content, &config);
        assert!(result.is_ok());

        let formatted = result.unwrap();
        assert_eq!(formatted.sections.len(), 2);
    }

    #[test]
    fn test_format_professional_style() {
        let formatter = DocumentFormatter::new();
        let content = create_test_content();
        let config = create_test_config(DocumentStyle::Professional, DetailLevel::Standard, "neutral");

        let result = formatter.format(content, &config);
        assert!(result.is_ok());
    }

    #[test]
    fn test_apply_detail_level_summary() {
        let formatter = DocumentFormatter::new();
        let mut content = create_test_content();
        content.sections[0].content = "a".repeat(1000); // Long content

        let config = create_test_config(DocumentStyle::Professional, DetailLevel::Summary, "neutral");

        let result = formatter.format(content, &config);
        assert!(result.is_ok());

        let formatted = result.unwrap();
        // Summary should condense content to max 500 chars
        assert!(formatted.sections[0].content.len() <= 503); // 500 + "..."
    }

    #[test]
    fn test_apply_detail_level_standard() {
        let formatter = DocumentFormatter::new();
        let content = create_test_content();
        let config = create_test_config(DocumentStyle::Professional, DetailLevel::Standard, "neutral");

        let result = formatter.format(content, &config);
        assert!(result.is_ok());

        let formatted = result.unwrap();
        assert_eq!(formatted.sections[0].content, "This is the introduction section content.");
    }

    #[test]
    fn test_apply_detail_level_advanced() {
        let formatter = DocumentFormatter::new();
        let content = create_test_content();
        let config = create_test_config(DocumentStyle::Professional, DetailLevel::Advanced, "neutral");

        let result = formatter.format(content, &config);
        assert!(result.is_ok());
    }

    #[test]
    fn test_apply_detail_level_exhaustive() {
        let formatter = DocumentFormatter::new();
        let content = create_test_content();
        let config = create_test_config(DocumentStyle::Professional, DetailLevel::Exhaustive, "neutral");

        let result = formatter.format(content, &config);
        assert!(result.is_ok());
    }

    #[test]
    fn test_apply_tone_strict() {
        let formatter = DocumentFormatter::new();
        let content = create_test_content();
        let config = create_test_config(DocumentStyle::Professional, DetailLevel::Standard, "strict");

        let result = formatter.format(content, &config);
        assert!(result.is_ok());
    }

    #[test]
    fn test_apply_tone_neutral() {
        let formatter = DocumentFormatter::new();
        let content = create_test_content();
        let config = create_test_config(DocumentStyle::Professional, DetailLevel::Standard, "neutral");

        let result = formatter.format(content, &config);
        assert!(result.is_ok());

        let formatted = result.unwrap();
        assert_eq!(formatted.executive_summary, "This is a test summary");
    }

    #[test]
    fn test_apply_tone_accessible() {
        let formatter = DocumentFormatter::new();
        let content = create_test_content();
        let config = create_test_config(DocumentStyle::Professional, DetailLevel::Standard, "accessible");

        let result = formatter.format(content, &config);
        assert!(result.is_ok());
    }

    #[test]
    fn test_apply_tone_unknown() {
        let formatter = DocumentFormatter::new();
        let content = create_test_content();
        let config = create_test_config(DocumentStyle::Professional, DetailLevel::Standard, "unknown_tone");

        let result = formatter.format(content, &config);
        assert!(result.is_ok());
    }

    #[test]
    fn test_clean_whitespace() {
        let formatter = DocumentFormatter::new();

        let text = "This   has   multiple    spaces";
        let cleaned = formatter.clean_whitespace(text);
        assert_eq!(cleaned, "This has multiple spaces");

        let text_with_newlines = "This\nhas\nnewlines";
        let cleaned = formatter.clean_whitespace(text_with_newlines);
        assert_eq!(cleaned, "This has newlines");

        let text_with_tabs = "This\thas\ttabs";
        let cleaned = formatter.clean_whitespace(text_with_tabs);
        assert_eq!(cleaned, "This has tabs");
    }

    #[test]
    fn test_clean_whitespace_empty() {
        let formatter = DocumentFormatter::new();
        let cleaned = formatter.clean_whitespace("");
        assert_eq!(cleaned, "");
    }

    #[test]
    fn test_clean_whitespace_single_word() {
        let formatter = DocumentFormatter::new();
        let cleaned = formatter.clean_whitespace("SingleWord");
        assert_eq!(cleaned, "SingleWord");
    }

    #[test]
    fn test_condense_text_short() {
        let formatter = DocumentFormatter::new();
        let text = "Short text";
        let condensed = formatter.condense_text(text, 500);
        assert_eq!(condensed, "Short text");
    }

    #[test]
    fn test_condense_text_long() {
        let formatter = DocumentFormatter::new();
        let text = "a".repeat(1000);
        let condensed = formatter.condense_text(&text, 500);
        assert_eq!(condensed.len(), 503); // 500 chars + "..."
        assert!(condensed.ends_with("..."));
    }

    #[test]
    fn test_condense_text_exact_length() {
        let formatter = DocumentFormatter::new();
        let text = "a".repeat(500);
        let condensed = formatter.condense_text(&text, 500);
        assert_eq!(condensed.len(), 500);
        assert!(!condensed.ends_with("..."));
    }

    #[test]
    fn test_clean_and_normalize() {
        let formatter = DocumentFormatter::new();
        let mut content = create_test_content();
        content.title = "Title   with   spaces".to_string();
        content.executive_summary = "Summary   with   spaces".to_string();
        content.sections[0].title = "Section   title".to_string();
        content.sections[0].content = "Content   with   spaces".to_string();

        let result = formatter.clean_and_normalize(content);
        assert!(result.is_ok());

        let cleaned = result.unwrap();
        assert_eq!(cleaned.title, "Title with spaces");
        assert_eq!(cleaned.executive_summary, "Summary with spaces");
        assert_eq!(cleaned.sections[0].title, "Section title");
        assert_eq!(cleaned.sections[0].content, "Content with spaces");
    }

    #[test]
    fn test_legal_formatting_adds_numbering() {
        let formatter = DocumentFormatter::new();
        let content = create_test_content();

        let result = formatter.apply_legal_formatting(content);
        assert!(result.is_ok());

        let formatted = result.unwrap();
        assert_eq!(formatted.sections[0].title, "1. Introduction");
        assert_eq!(formatted.sections[1].title, "2. Main Content");
    }

    #[test]
    fn test_legal_formatting_preserves_existing_numbering() {
        let formatter = DocumentFormatter::new();
        let mut content = create_test_content();
        content.sections[0].title = "1. Already Numbered".to_string();

        let result = formatter.apply_legal_formatting(content);
        assert!(result.is_ok());

        let formatted = result.unwrap();
        // Should not add numbering if already starts with a number
        assert_eq!(formatted.sections[0].title, "1. Already Numbered");
    }

    #[test]
    fn test_format_full_pipeline() {
        let formatter = DocumentFormatter::new();
        let mut content = create_test_content();
        content.title = "Test   Title   With   Spaces".to_string();
        content.sections[0].content = "a".repeat(1000);

        let config = create_test_config(DocumentStyle::Legal, DetailLevel::Summary, "strict");

        let result = formatter.format(content, &config);
        assert!(result.is_ok());

        let formatted = result.unwrap();
        // Legal style adds numbering
        assert!(formatted.sections[0].title.starts_with("1."));
        // Summary condenses content
        assert!(formatted.sections[0].content.len() <= 503);
        // Clean normalizes whitespace
        assert_eq!(formatted.title, "Test Title With Spaces");
    }

    #[test]
    fn test_format_with_empty_sections() {
        let formatter = DocumentFormatter::new();
        let mut content = create_test_content();
        content.sections = vec![];

        let config = create_test_config(DocumentStyle::Legal, DetailLevel::Standard, "neutral");

        let result = formatter.format(content, &config);
        assert!(result.is_ok());

        let formatted = result.unwrap();
        assert_eq!(formatted.sections.len(), 0);
    }

    #[test]
    fn test_all_style_combinations() {
        let formatter = DocumentFormatter::new();
        let content = create_test_content();

        let styles = vec![
            DocumentStyle::Legal,
            DocumentStyle::Technical,
            DocumentStyle::Editorial,
            DocumentStyle::Professional,
        ];

        for style in styles {
            let config = create_test_config(style, DetailLevel::Standard, "neutral");
            let result = formatter.format(content.clone(), &config);
            assert!(result.is_ok(), "Failed for style: {:?}", style);
        }
    }
}
