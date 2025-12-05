// Générateur principal de documents

use super::*;
use uuid::Uuid;

pub struct DocumentGenerator {
    templates: templates::TemplateEngine,
    validator: validator::DocumentValidator,
    formatter: formatter::DocumentFormatter,
}

impl DocumentGenerator {
    pub fn new() -> Self {
        Self {
            templates: templates::TemplateEngine::new(),
            validator: validator::DocumentValidator::new(),
            formatter: formatter::DocumentFormatter::new(),
        }
    }
    
    /// Génère un document complet selon la configuration
    pub async fn generate(&self, config: GenerationConfig, params: HashMap<String, String>) -> Result<Document> {
        // 1. Sélection du template approprié
        let template = self.templates.get_template(&config.doc_type)?;
        
        // 2. Génération du contenu structuré
        let content = self.generate_content(&config, &template, params)?;
        
        // 3. Application du style et formatage
        let formatted_content = self.formatter.format(content, &config)?;
        
        // 4. Validation complète
        let validation_status = self.validator.validate(&formatted_content, &config)?;
        
        // 5. Correction automatique si nécessaire
        let final_content = if !validation_status.is_valid {
            self.auto_correct(formatted_content, &validation_status)?
        } else {
            formatted_content
        };
        
        // 6. Création du document final
        let metadata = DocumentMetadata {
            id: Uuid::new_v4().to_string(),
            title: final_content.title.clone(),
            version: "1.0.0".to_string(),
            created_at: chrono::Utc::now(),
            updated_at: chrono::Utc::now(),
            author: "TITANE∞ v13".to_string(),
            tags: self.extract_tags(&config),
            category: self.get_category(&config.doc_type),
        };
        
        Ok(Document {
            metadata,
            config,
            content: final_content,
            validation_status,
        })
    }
    
    /// Génère le contenu selon le type de document
    fn generate_content(
        &self,
        config: &GenerationConfig,
        template: &templates::Template,
        params: HashMap<String, String>
    ) -> Result<DocumentContent> {
        match config.doc_type {
            DocumentType::Contract | DocumentType::NDA => {
                legal::generate_legal_content(config, template, params)
            }
            DocumentType::Audit | DocumentType::BusinessPlan => {
                admin::generate_admin_content(config, template, params)
            }
            DocumentType::Architecture | DocumentType::APIDoc => {
                technical::generate_technical_content(config, template, params)
            }
            DocumentType::BookChapter | DocumentType::Article => {
                editorial::generate_editorial_content(config, template, params)
            }
            _ => {
                self.generate_generic_content(config, template, params)
            }
        }
    }
    
    /// Génération de contenu générique
    fn generate_generic_content(
        &self,
        config: &GenerationConfig,
        template: &templates::Template,
        params: HashMap<String, String>
    ) -> Result<DocumentContent> {
        let title = params.get("title")
            .cloned()
            .unwrap_or_else(|| "Document sans titre".to_string());
        
        let executive_summary = self.generate_summary(config, &params)?;
        let objectives = self.extract_objectives(&params);
        let sections = self.generate_sections(config, template, &params)?;
        
        Ok(DocumentContent {
            title,
            executive_summary,
            objectives,
            sections,
            mandatory_clauses: None,
            annexes: vec![],
            references: vec![],
        })
    }
    
    fn generate_summary(&self, config: &GenerationConfig, params: &HashMap<String, String>) -> Result<String> {
        // Intelligence contextuelle pour générer un résumé pertinent
        let context = params.get("context").map(|s| s.as_str()).unwrap_or("");
        let purpose = params.get("purpose").map(|s| s.as_str()).unwrap_or("");
        
        Ok(format!(
            "Ce document {} a pour objectif de {}. Il s'inscrit dans le contexte suivant : {}.",
            self.get_doc_type_description(&config.doc_type),
            purpose,
            context
        ))
    }
    
    fn extract_objectives(&self, params: &HashMap<String, String>) -> Vec<String> {
        params.get("objectives")
            .map(|obj| obj.split(';').map(|s| s.trim().to_string()).collect())
            .unwrap_or_else(Vec::new)
    }
    
    fn generate_sections(
        &self,
        config: &GenerationConfig,
        template: &templates::Template,
        params: &HashMap<String, String>
    ) -> Result<Vec<Section>> {
        let mut sections = Vec::new();
        
        for (idx, section_template) in template.sections.iter().enumerate() {
            let section = Section {
                id: format!("section_{}", idx + 1),
                title: section_template.title.clone(),
                content: self.generate_section_content(config, section_template, params)?,
                subsections: vec![],
                level: 1,
            };
            sections.push(section);
        }
        
        Ok(sections)
    }
    
    fn generate_section_content(
        &self,
        _config: &GenerationConfig,
        section: &templates::SectionTemplate,
        params: &HashMap<String, String>
    ) -> Result<String> {
        // Génération intelligente basée sur le contexte
        let content = params.get(&section.id)
            .cloned()
            .unwrap_or_else(|| section.default_content.clone());
        
        Ok(content)
    }
    
    fn auto_correct(&self, mut content: DocumentContent, status: &ValidationStatus) -> Result<DocumentContent> {
        // Application des corrections automatiques
        for suggestion in &status.suggestions {
            if suggestion.priority >= 8 {
                // Application de la suggestion critique
                content = self.apply_suggestion(content, suggestion)?;
            }
        }
        
        Ok(content)
    }
    
    fn apply_suggestion(&self, content: DocumentContent, _suggestion: &Suggestion) -> Result<DocumentContent> {
        // Logique d'application des suggestions
        Ok(content)
    }
    
    fn extract_tags(&self, config: &GenerationConfig) -> Vec<String> {
        vec![
            format!("{:?}", config.doc_type),
            format!("{:?}", config.style),
            config.language.clone(),
        ]
    }
    
    fn get_category(&self, doc_type: &DocumentType) -> String {
        match doc_type {
            DocumentType::Contract | DocumentType::NDA | DocumentType::LegalNotice => "legal".to_string(),
            DocumentType::Audit | DocumentType::BusinessPlan => "professional".to_string(),
            DocumentType::Architecture | DocumentType::APIDoc => "technical".to_string(),
            DocumentType::BookChapter | DocumentType::Article => "editorial".to_string(),
            _ => "general".to_string(),
        }
    }
    
    fn get_doc_type_description(&self, doc_type: &DocumentType) -> &str {
        match doc_type {
            DocumentType::Contract => "contrat",
            DocumentType::NDA => "accord de confidentialité",
            DocumentType::Audit => "audit",
            DocumentType::BusinessPlan => "plan d'affaires",
            DocumentType::Architecture => "document d'architecture",
            DocumentType::BookChapter => "chapitre de livre",
            _ => "document professionnel",
        }
    }
}

impl Default for DocumentGenerator {
    fn default() -> Self {
        Self::new()
    }
}
