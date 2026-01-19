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
