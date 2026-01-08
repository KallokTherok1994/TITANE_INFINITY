// Module de validation de documents (Sentinel Integration)

use super::*;

pub struct DocumentValidator {
    rules: Vec<ValidationRule>,
}

#[derive(Debug, Clone)]
struct ValidationRule {
    id: String,
    name: String,
    severity: ErrorSeverity,
    applies_to: Vec<DocumentType>,
}

impl DocumentValidator {
    pub fn new() -> Self {
        Self {
            rules: Self::initialize_rules(),
        }
    }
    
    /// Valide un document complet
    pub fn validate(&self, content: &DocumentContent, config: &GenerationConfig) -> Result<ValidationStatus> {
        let mut errors = Vec::new();
        let mut warnings = Vec::new();
        let mut suggestions = Vec::new();
        
        // Validation structurelle
        self.validate_structure(content, &mut errors, &mut warnings)?;
        
        // Validation selon le type de document
        match config.doc_type {
            DocumentType::Contract | DocumentType::NDA => {
                self.validate_legal_document(content, &mut errors, &mut warnings, &mut suggestions)?;
            }
            DocumentType::BookChapter | DocumentType::Article => {
                self.validate_editorial_document(content, &mut errors, &mut warnings, &mut suggestions)?;
            }
            DocumentType::Architecture | DocumentType::APIDoc => {
                self.validate_technical_document(content, &mut errors, &mut warnings, &mut suggestions)?;
            }
            _ => {}
        }
        
        // Validation du contenu
        self.validate_content_quality(content, &mut warnings, &mut suggestions)?;
        
        Ok(ValidationStatus {
            is_valid: errors.is_empty(),
            errors,
            warnings,
            suggestions,
        })
    }
    
    fn validate_structure(&self, content: &DocumentContent, errors: &mut Vec<ValidationError>, warnings: &mut Vec<ValidationWarning>) -> Result<()> {
        // Titre présent et non vide
        if content.title.trim().is_empty() {
            errors.push(ValidationError {
                code: "MISSING_TITLE".to_string(),
                message: "Le document doit avoir un titre".to_string(),
                severity: ErrorSeverity::Critical,
            });
        }
        
        // Au moins une section
        if content.sections.is_empty() {
            errors.push(ValidationError {
                code: "NO_SECTIONS".to_string(),
                message: "Le document doit contenir au moins une section".to_string(),
                severity: ErrorSeverity::High,
            });
        }
        
        // Résumé présent
        if content.executive_summary.trim().is_empty() {
            warnings.push(ValidationWarning {
                message: "Le résumé exécutif est vide".to_string(),
                suggestion: Some("Ajouter un résumé pour faciliter la compréhension".to_string()),
            });
        }
        
        Ok(())
    }
    
    fn validate_legal_document(
        &self,
        content: &DocumentContent,
        errors: &mut Vec<ValidationError>,
        warnings: &mut Vec<ValidationWarning>,
        suggestions: &mut Vec<Suggestion>
    ) -> Result<()> {
        // Vérifier les clauses obligatoires
        if let Some(clauses) = &content.mandatory_clauses {
            if clauses.is_empty() {
                warnings.push(ValidationWarning {
                    message: "Aucune clause obligatoire définie".to_string(),
                    suggestion: Some("Ajouter les clauses essentielles (confidentialité, responsabilité, etc.)".to_string()),
                });
            }
            
            // Vérifier la présence des clauses critiques
            let has_confidentiality = clauses.iter().any(|c| matches!(c.category, ClauseCategory::Confidentiality));
            let has_liability = clauses.iter().any(|c| matches!(c.category, ClauseCategory::Liability));
            
            if !has_confidentiality {
                suggestions.push(Suggestion {
                    category: "legal".to_string(),
                    message: "Ajouter une clause de confidentialité".to_string(),
                    priority: 8,
                });
            }
            
            if !has_liability {
                suggestions.push(Suggestion {
                    category: "legal".to_string(),
                    message: "Ajouter une clause de limitation de responsabilité".to_string(),
                    priority: 9,
                });
            }
        } else {
            errors.push(ValidationError {
                code: "MISSING_CLAUSES".to_string(),
                message: "Document légal sans clauses définies".to_string(),
                severity: ErrorSeverity::High,
            });
        }
        
        // Vérifier la présence de sections critiques
        let section_titles: Vec<String> = content.sections.iter().map(|s| s.title.to_lowercase()).collect();
        
        if !section_titles.iter().any(|t| t.contains("responsabilit") || t.contains("liability")) {
            suggestions.push(Suggestion {
                category: "legal".to_string(),
                message: "Ajouter une section sur les responsabilités".to_string(),
                priority: 9,
            });
        }
        
        if !section_titles.iter().any(|t| t.contains("résiliation") || t.contains("termination") || t.contains("durée")) {
            suggestions.push(Suggestion {
                category: "legal".to_string(),
                message: "Ajouter une section sur la durée et résiliation".to_string(),
                priority: 8,
            });
        }
        
        Ok(())
    }
    
    fn validate_editorial_document(
        &self,
        content: &DocumentContent,
        _errors: &mut Vec<ValidationError>,
        warnings: &mut Vec<ValidationWarning>,
        suggestions: &mut Vec<Suggestion>
    ) -> Result<()> {
        // Vérifier la présence d'objectifs
        if content.objectives.is_empty() {
            warnings.push(ValidationWarning {
                message: "Aucun objectif défini".to_string(),
                suggestion: Some("Ajouter des objectifs d'apprentissage clairs".to_string()),
            });
        }
        
        // Vérifier l'équilibre des sections
        if content.sections.len() < 3 {
            suggestions.push(Suggestion {
                category: "editorial".to_string(),
                message: "Développer davantage le contenu avec des sections supplémentaires".to_string(),
                priority: 6,
            });
        }
        
        // Vérifier la présence d'exemples
        let has_examples = content.sections.iter().any(|s| 
            s.title.to_lowercase().contains("exemple") || 
            s.title.to_lowercase().contains("application") ||
            s.title.to_lowercase().contains("cas pratique")
        );
        
        if !has_examples {
            suggestions.push(Suggestion {
                category: "editorial".to_string(),
                message: "Ajouter des exemples ou cas pratiques pour illustrer les concepts".to_string(),
                priority: 7,
            });
        }
        
        // Vérifier la conclusion
        let has_conclusion = content.sections.iter().any(|s| 
            s.title.to_lowercase().contains("conclusion") || 
            s.title.to_lowercase().contains("synthèse")
        );
        
        if !has_conclusion {
            suggestions.push(Suggestion {
                category: "editorial".to_string(),
                message: "Ajouter une conclusion ou synthèse".to_string(),
                priority: 8,
            });
        }
        
        Ok(())
    }
    
    fn validate_technical_document(
        &self,
        content: &DocumentContent,
        _errors: &mut Vec<ValidationError>,
        warnings: &mut Vec<ValidationWarning>,
        suggestions: &mut Vec<Suggestion>
    ) -> Result<()> {
        // Vérifier la présence de schémas/diagrammes
        let has_diagrams = content.sections.iter().any(|s| 
            s.content.contains("```") || 
            s.content.to_lowercase().contains("diagramme") ||
            s.content.to_lowercase().contains("schéma")
        );
        
        if !has_diagrams {
            suggestions.push(Suggestion {
                category: "technical".to_string(),
                message: "Ajouter des diagrammes ou schémas pour illustrer l'architecture".to_string(),
                priority: 8,
            });
        }
        
        // Vérifier la présence d'exemples de code
        let has_code = content.sections.iter().any(|s| s.content.contains("```"));
        
        if !has_code {
            warnings.push(ValidationWarning {
                message: "Aucun exemple de code détecté".to_string(),
                suggestion: Some("Ajouter des exemples de code pour faciliter la compréhension".to_string()),
            });
        }
        
        Ok(())
    }
    
    fn validate_content_quality(
        &self,
        content: &DocumentContent,
        warnings: &mut Vec<ValidationWarning>,
        suggestions: &mut Vec<Suggestion>
    ) -> Result<()> {
        // Vérifier la longueur des sections
        for section in &content.sections {
            if section.content.trim().len() < 50 {
                warnings.push(ValidationWarning {
                    message: format!("Section '{}' très courte", section.title),
                    suggestion: Some("Développer davantage cette section".to_string()),
                });
            }
        }
        
        // Vérifier la présence de références
        if content.references.is_empty() {
            suggestions.push(Suggestion {
                category: "quality".to_string(),
                message: "Ajouter des références pour renforcer la crédibilité".to_string(),
                priority: 5,
            });
        }
        
        Ok(())
    }
    
    fn initialize_rules() -> Vec<ValidationRule> {
        vec![
            ValidationRule {
                id: "title_required".to_string(),
                name: "Titre requis".to_string(),
                severity: ErrorSeverity::Critical,
                applies_to: vec![],
            },
            ValidationRule {
                id: "sections_required".to_string(),
                name: "Sections requises".to_string(),
                severity: ErrorSeverity::High,
                applies_to: vec![],
            },
        ]
    }
}

impl Default for DocumentValidator {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn create_test_content(title: &str, sections_count: usize) -> DocumentContent {
        DocumentContent {
            title: title.to_string(),
            executive_summary: "Test summary".to_string(),
            objectives: vec!["Objective 1".to_string()],
            sections: (0..sections_count)
                .map(|i| Section {
                    title: format!("Section {}", i + 1),
                    content: "Section content with enough text to pass validation.".to_string(),
                    level: 1,
                    subsections: vec![],
                    metadata: None,
                })
                .collect(),
            mandatory_clauses: None,
            annexes: vec![],
            references: vec![],
        }
    }

    fn create_test_config(doc_type: DocumentType) -> GenerationConfig {
        GenerationConfig {
            doc_type,
            style: DocumentStyle::Technical,
            detail_level: DetailLevel::Detailed,
            tone: "Formal".to_string(),
            language: "fr".to_string(),
            custom_params: std::collections::HashMap::new(),
        }
    }

    #[test]
    fn test_document_validator_new() {
        let validator = DocumentValidator::new();
        assert_eq!(validator.rules.len(), 2);
    }

    #[test]
    fn test_document_validator_default() {
        let validator = DocumentValidator::default();
        assert_eq!(validator.rules.len(), 2);
    }

    #[test]
    fn test_validate_valid_document() {
        let validator = DocumentValidator::new();
        let content = create_test_content("Valid Document", 3);
        let config = create_test_config(DocumentType::Report);

        let result = validator.validate(&content, &config).unwrap();
        assert!(result.is_valid);
        assert!(result.errors.is_empty());
    }

    #[test]
    fn test_validate_structure_missing_title() {
        let validator = DocumentValidator::new();
        let mut content = create_test_content("", 2);
        content.title = "   ".to_string(); // Empty title
        let config = create_test_config(DocumentType::Report);

        let result = validator.validate(&content, &config).unwrap();
        assert!(!result.is_valid);
        assert!(result.errors.iter().any(|e| e.code == "MISSING_TITLE"));
    }

    #[test]
    fn test_validate_structure_no_sections() {
        let validator = DocumentValidator::new();
        let content = create_test_content("Title", 0);
        let config = create_test_config(DocumentType::Report);

        let result = validator.validate(&content, &config).unwrap();
        assert!(!result.is_valid);
        assert!(result.errors.iter().any(|e| e.code == "NO_SECTIONS"));
    }

    #[test]
    fn test_validate_structure_empty_summary_warning() {
        let validator = DocumentValidator::new();
        let mut content = create_test_content("Title", 2);
        content.executive_summary = "  ".to_string();
        let config = create_test_config(DocumentType::Report);

        let result = validator.validate(&content, &config).unwrap();
        assert!(result.is_valid); // Warnings don't invalidate
        assert!(!result.warnings.is_empty());
    }

    #[test]
    fn test_validate_legal_document_missing_clauses() {
        let validator = DocumentValidator::new();
        let content = create_test_content("Contract", 3);
        let config = create_test_config(DocumentType::Contract);

        let result = validator.validate(&content, &config).unwrap();
        assert!(!result.is_valid);
        assert!(result.errors.iter().any(|e| e.code == "MISSING_CLAUSES"));
    }

    #[test]
    fn test_validate_legal_document_empty_clauses() {
        let validator = DocumentValidator::new();
        let mut content = create_test_content("Contract", 3);
        content.mandatory_clauses = Some(vec![]);
        let config = create_test_config(DocumentType::Contract);

        let result = validator.validate(&content, &config).unwrap();
        assert!(result.is_valid); // Empty clauses = warning, not error
        assert!(!result.warnings.is_empty());
    }

    #[test]
    fn test_validate_legal_document_with_confidentiality() {
        let validator = DocumentValidator::new();
        let mut content = create_test_content("NDA", 3);
        content.mandatory_clauses = Some(vec![
            MandatoryClause {
                title: "Confidentiality".to_string(),
                content: "Confidential information must be protected.".to_string(),
                category: ClauseCategory::Confidentiality,
                required: true,
            },
        ]);
        let config = create_test_config(DocumentType::NDA);

        let result = validator.validate(&content, &config).unwrap();
        assert!(result.is_valid);
        // Should suggest liability clause
        assert!(result.suggestions.iter().any(|s| s.message.contains("responsabilité")));
    }

    #[test]
    fn test_validate_legal_document_section_suggestions() {
        let validator = DocumentValidator::new();
        let mut content = create_test_content("Contract", 3);
        content.mandatory_clauses = Some(vec![
            MandatoryClause {
                title: "General".to_string(),
                content: "General terms".to_string(),
                category: ClauseCategory::General,
                required: false,
            },
        ]);
        let config = create_test_config(DocumentType::Contract);

        let result = validator.validate(&content, &config).unwrap();
        // Should suggest responsibility and termination sections
        let has_responsibility_suggestion = result.suggestions.iter()
            .any(|s| s.message.contains("responsabilit"));
        let has_termination_suggestion = result.suggestions.iter()
            .any(|s| s.message.contains("durée") || s.message.contains("résiliation"));

        assert!(has_responsibility_suggestion || has_termination_suggestion);
    }

    #[test]
    fn test_validate_editorial_document_no_objectives() {
        let validator = DocumentValidator::new();
        let mut content = create_test_content("Article", 3);
        content.objectives = vec![];
        let config = create_test_config(DocumentType::Article);

        let result = validator.validate(&content, &config).unwrap();
        assert!(result.is_valid);
        assert!(result.warnings.iter().any(|w| w.message.contains("objectif")));
    }

    #[test]
    fn test_validate_editorial_document_few_sections() {
        let validator = DocumentValidator::new();
        let content = create_test_content("Book Chapter", 2);
        let config = create_test_config(DocumentType::BookChapter);

        let result = validator.validate(&content, &config).unwrap();
        assert!(result.suggestions.iter().any(|s| s.message.contains("sections supplémentaires")));
    }

    #[test]
    fn test_validate_editorial_document_missing_examples() {
        let validator = DocumentValidator::new();
        let content = create_test_content("Article", 3);
        let config = create_test_config(DocumentType::Article);

        let result = validator.validate(&content, &config).unwrap();
        assert!(result.suggestions.iter().any(|s| s.message.contains("exemple")));
    }

    #[test]
    fn test_validate_editorial_document_missing_conclusion() {
        let validator = DocumentValidator::new();
        let content = create_test_content("Article", 3);
        let config = create_test_config(DocumentType::Article);

        let result = validator.validate(&content, &config).unwrap();
        assert!(result.suggestions.iter().any(|s| s.message.contains("conclusion")));
    }

    #[test]
    fn test_validate_editorial_document_with_examples_and_conclusion() {
        let validator = DocumentValidator::new();
        let mut content = create_test_content("Article", 3);
        content.sections.push(Section {
            title: "Exemples pratiques".to_string(),
            content: "Examples content".to_string(),
            level: 1,
            subsections: vec![],
            metadata: None,
        });
        content.sections.push(Section {
            title: "Conclusion".to_string(),
            content: "Conclusion content".to_string(),
            level: 1,
            subsections: vec![],
            metadata: None,
        });
        let config = create_test_config(DocumentType::Article);

        let result = validator.validate(&content, &config).unwrap();
        // Should not suggest examples or conclusion
        assert!(!result.suggestions.iter().any(|s| s.message.contains("exemple")));
        assert!(!result.suggestions.iter().any(|s| s.message.contains("conclusion")));
    }

    #[test]
    fn test_validate_technical_document_no_diagrams() {
        let validator = DocumentValidator::new();
        let content = create_test_content("Architecture Doc", 3);
        let config = create_test_config(DocumentType::Architecture);

        let result = validator.validate(&content, &config).unwrap();
        assert!(result.suggestions.iter().any(|s| s.message.contains("diagramme")));
    }

    #[test]
    fn test_validate_technical_document_no_code() {
        let validator = DocumentValidator::new();
        let content = create_test_content("API Doc", 3);
        let config = create_test_config(DocumentType::APIDoc);

        let result = validator.validate(&content, &config).unwrap();
        assert!(result.warnings.iter().any(|w| w.message.contains("code")));
    }

    #[test]
    fn test_validate_technical_document_with_code() {
        let validator = DocumentValidator::new();
        let mut content = create_test_content("API Doc", 3);
        content.sections[0].content = "Here is some code:\n```rust\nfn main() {}\n```".to_string();
        let config = create_test_config(DocumentType::APIDoc);

        let result = validator.validate(&content, &config).unwrap();
        // Should not warn about missing code
        assert!(!result.warnings.iter().any(|w| w.message.contains("code détecté")));
    }

    #[test]
    fn test_validate_content_quality_short_sections() {
        let validator = DocumentValidator::new();
        let mut content = create_test_content("Document", 3);
        content.sections[0].content = "Short".to_string();
        let config = create_test_config(DocumentType::Report);

        let result = validator.validate(&content, &config).unwrap();
        assert!(result.warnings.iter().any(|w| w.message.contains("très courte")));
    }

    #[test]
    fn test_validate_content_quality_no_references() {
        let validator = DocumentValidator::new();
        let content = create_test_content("Document", 3);
        let config = create_test_config(DocumentType::Report);

        let result = validator.validate(&content, &config).unwrap();
        assert!(result.suggestions.iter().any(|s| s.message.contains("référence")));
    }

    #[test]
    fn test_validate_content_quality_with_references() {
        let validator = DocumentValidator::new();
        let mut content = create_test_content("Document", 3);
        content.references = vec![
            Reference {
                title: "Reference 1".to_string(),
                source: "Source".to_string(),
                url: None,
            },
        ];
        let config = create_test_config(DocumentType::Report);

        let result = validator.validate(&content, &config).unwrap();
        // Should not suggest adding references
        assert!(!result.suggestions.iter().any(|s| s.message.contains("référence")));
    }

    #[test]
    fn test_validation_rule_initialization() {
        let rules = DocumentValidator::initialize_rules();
        assert_eq!(rules.len(), 2);
        assert_eq!(rules[0].id, "title_required");
        assert!(matches!(rules[0].severity, ErrorSeverity::Critical));
        assert_eq!(rules[1].id, "sections_required");
        assert!(matches!(rules[1].severity, ErrorSeverity::High));
    }
}
