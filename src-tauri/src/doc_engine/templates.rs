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

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_template_engine_new() {
        let engine = TemplateEngine::new();
        assert_eq!(engine.templates.len(), 5); // Should load 5 default templates
    }

    #[test]
    fn test_template_engine_default() {
        let engine = TemplateEngine::default();
        assert_eq!(engine.templates.len(), 5);
    }

    #[test]
    fn test_get_template_contract() {
        let engine = TemplateEngine::new();
        let template = engine.get_template(&DocumentType::Contract);

        assert!(template.is_ok());
        let tmpl = template.unwrap();
        assert_eq!(tmpl.id, "contract");
        assert_eq!(tmpl.name, "Contrat Standard");
        assert_eq!(tmpl.sections.len(), 2); // Preamble + Definitions
        assert!(matches!(tmpl.default_style, DocumentStyle::Legal));
    }

    #[test]
    fn test_get_template_nda() {
        let engine = TemplateEngine::new();
        let template = engine.get_template(&DocumentType::NDA);

        assert!(template.is_ok());
        let tmpl = template.unwrap();
        assert_eq!(tmpl.id, "nda");
        assert_eq!(tmpl.doc_type, DocumentType::NDA);
        assert!(matches!(tmpl.default_style, DocumentStyle::Legal));
    }

    #[test]
    fn test_get_template_book_chapter() {
        let engine = TemplateEngine::new();
        let template = engine.get_template(&DocumentType::BookChapter);

        assert!(template.is_ok());
        let tmpl = template.unwrap();
        assert_eq!(tmpl.id, "bookchapter");
        assert!(matches!(tmpl.default_style, DocumentStyle::Editorial));
    }

    #[test]
    fn test_get_template_audit() {
        let engine = TemplateEngine::new();
        let template = engine.get_template(&DocumentType::Audit);

        assert!(template.is_ok());
        let tmpl = template.unwrap();
        assert_eq!(tmpl.id, "audit");
        assert!(matches!(tmpl.default_style, DocumentStyle::Professional));
    }

    #[test]
    fn test_get_template_architecture() {
        let engine = TemplateEngine::new();
        let template = engine.get_template(&DocumentType::Architecture);

        assert!(template.is_ok());
        let tmpl = template.unwrap();
        assert_eq!(tmpl.id, "architecture");
        assert!(matches!(tmpl.default_style, DocumentStyle::Technical));
    }

    #[test]
    fn test_get_template_not_found() {
        let engine = TemplateEngine::new();
        // Report type doesn't have a template loaded
        let template = engine.get_template(&DocumentType::Report);

        assert!(template.is_err());
        let error_msg = template.unwrap_err().to_string();
        assert!(error_msg.contains("Template not found"));
    }

    #[test]
    fn test_contract_template_sections() {
        let engine = TemplateEngine::new();
        let template = engine.get_template(&DocumentType::Contract).unwrap();

        // Check preamble section
        let preamble = &template.sections[0];
        assert_eq!(preamble.id, "preamble");
        assert_eq!(preamble.title, "Préambule");
        assert!(preamble.required);
        assert_eq!(preamble.order, 1);

        // Check definitions section
        let definitions = &template.sections[1];
        assert_eq!(definitions.id, "definitions");
        assert_eq!(definitions.title, "Définitions");
        assert!(definitions.required);
        assert_eq!(definitions.order, 2);
    }

    #[test]
    fn test_add_custom_template() {
        let mut engine = TemplateEngine::new();
        let initial_count = engine.templates.len();

        let custom_template = Template {
            id: "custom_test".to_string(),
            name: "Custom Test Template".to_string(),
            doc_type: DocumentType::Report,
            sections: vec![
                SectionTemplate {
                    id: "intro".to_string(),
                    title: "Introduction".to_string(),
                    required: true,
                    default_content: "Default intro".to_string(),
                    order: 1,
                },
            ],
            default_style: DocumentStyle::Technical,
        };

        engine.add_custom_template(custom_template);
        assert_eq!(engine.templates.len(), initial_count + 1);

        let retrieved = engine.templates.get("custom_test");
        assert!(retrieved.is_some());
        assert_eq!(retrieved.unwrap().name, "Custom Test Template");
    }

    #[test]
    fn test_template_serialization() {
        let template = Template {
            id: "test".to_string(),
            name: "Test Template".to_string(),
            doc_type: DocumentType::Contract,
            sections: vec![],
            default_style: DocumentStyle::Legal,
        };

        let json = serde_json::to_string(&template).unwrap();
        assert!(json.contains("test"));
        assert!(json.contains("Test Template"));

        let deserialized: Template = serde_json::from_str(&json).unwrap();
        assert_eq!(deserialized.id, "test");
        assert_eq!(deserialized.name, "Test Template");
    }

    #[test]
    fn test_section_template_serialization() {
        let section = SectionTemplate {
            id: "section1".to_string(),
            title: "Section Title".to_string(),
            required: true,
            default_content: "Default content".to_string(),
            order: 1,
        };

        let json = serde_json::to_string(&section).unwrap();
        assert!(json.contains("section1"));
        assert!(json.contains("Section Title"));

        let deserialized: SectionTemplate = serde_json::from_str(&json).unwrap();
        assert_eq!(deserialized.id, "section1");
        assert!(deserialized.required);
        assert_eq!(deserialized.order, 1);
    }

    #[test]
    fn test_add_custom_template_overwrites_existing() {
        let mut engine = TemplateEngine::new();

        let custom_contract = Template {
            id: "contract".to_string(),
            name: "Custom Contract".to_string(),
            doc_type: DocumentType::Contract,
            sections: vec![],
            default_style: DocumentStyle::Professional,
        };

        let initial_count = engine.templates.len();
        engine.add_custom_template(custom_contract);

        // Count should stay the same (overwrite, not add)
        assert_eq!(engine.templates.len(), initial_count);

        // But name should be updated
        let contract = engine.templates.get("contract").unwrap();
        assert_eq!(contract.name, "Custom Contract");
    }

    #[test]
    fn test_section_template_ordering() {
        let engine = TemplateEngine::new();
        let template = engine.get_template(&DocumentType::Contract).unwrap();

        // Sections should be ordered
        for i in 0..template.sections.len() - 1 {
            assert!(template.sections[i].order < template.sections[i + 1].order);
        }
    }

    #[test]
    fn test_all_default_templates_have_unique_ids() {
        let engine = TemplateEngine::new();
        let ids: Vec<String> = engine.templates.keys().cloned().collect();
        let unique_ids: std::collections::HashSet<String> = ids.iter().cloned().collect();

        assert_eq!(ids.len(), unique_ids.len(), "All template IDs should be unique");
    }
}
