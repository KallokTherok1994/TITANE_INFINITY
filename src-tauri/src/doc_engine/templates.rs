// Moteur de templates pour documents

use super::*;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Template {
    pub id: String,
    pub name: String,
    pub doc_type: DocumentType,
    pub sections: Vec<SectionTemplate>,
    pub default_style: DocumentStyle,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SectionTemplate {
    pub id: String,
    pub title: String,
    pub required: bool,
    pub default_content: String,
    pub order: u8,
}

pub struct TemplateEngine {
    templates: std::collections::HashMap<String, Template>,
}

impl TemplateEngine {
    pub fn new() -> Self {
        let mut engine = Self {
            templates: std::collections::HashMap::new(),
        };
        engine.load_default_templates();
        engine
    }
    
    pub fn get_template(&self, doc_type: &DocumentType) -> Result<&Template> {
        let template_id = format!("{:?}", doc_type).to_lowercase();
        self.templates
            .get(&template_id)
            .ok_or_else(|| DocEngineError::TemplateError(format!("Template not found for {:?}", doc_type)))
    }
    
    fn load_default_templates(&mut self) {
        // Template contrat
        self.templates.insert("contract".to_string(), Template {
            id: "contract".to_string(),
            name: "Contrat Standard".to_string(),
            doc_type: DocumentType::Contract,
            sections: vec![
                SectionTemplate {
                    id: "preamble".to_string(),
                    title: "Préambule".to_string(),
                    required: true,
                    default_content: String::new(),
                    order: 1,
                },
                SectionTemplate {
                    id: "definitions".to_string(),
                    title: "Définitions".to_string(),
                    required: true,
                    default_content: String::new(),
                    order: 2,
                },
            ],
            default_style: DocumentStyle::Legal,
        });
        
        // Template NDA
        self.templates.insert("nda".to_string(), Template {
            id: "nda".to_string(),
            name: "Accord de Confidentialité".to_string(),
            doc_type: DocumentType::NDA,
            sections: vec![],
            default_style: DocumentStyle::Legal,
        });
        
        // Template chapitre
        self.templates.insert("bookchapter".to_string(), Template {
            id: "bookchapter".to_string(),
            name: "Chapitre de Livre".to_string(),
            doc_type: DocumentType::BookChapter,
            sections: vec![],
            default_style: DocumentStyle::Editorial,
        });
        
        // Template audit
        self.templates.insert("audit".to_string(), Template {
            id: "audit".to_string(),
            name: "Rapport d'Audit".to_string(),
            doc_type: DocumentType::Audit,
            sections: vec![],
            default_style: DocumentStyle::Professional,
        });
        
        // Template architecture
        self.templates.insert("architecture".to_string(), Template {
            id: "architecture".to_string(),
            name: "Document d'Architecture".to_string(),
            doc_type: DocumentType::Architecture,
            sections: vec![],
            default_style: DocumentStyle::Technical,
        });
    }
    
    pub fn add_custom_template(&mut self, template: Template) {
        self.templates.insert(template.id.clone(), template);
    }
}

impl Default for TemplateEngine {
    fn default() -> Self {
        Self::new()
    }
}
