// TITANE∞ v13 - Document Generation Engine
// Moteur de génération documentaire professionnel multi-domaines

pub mod generator;
pub mod legal;
pub mod admin;
pub mod technical;
pub mod editorial;
pub mod html;
pub mod templates;
pub mod validator;
pub mod formatter;
pub mod export;
pub mod storage;
pub mod versioning;

use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// Type de document supporté
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum DocumentType {
    // Documents légaux
    Contract,
    NDA,
    ServiceAgreement,
    Partnership,
    TermsOfService,
    PrivacyPolicy,
    LegalNotice,
    
    // Documents professionnels
    Audit,
    BusinessPlan,
    Analysis,
    SOP,
    InternalManual,
    TechnicalSpec,
    
    // Documents techniques
    Architecture,
    APIDoc,
    SystemDesign,
    Script,
    
    // Documents éditoriaux
    BookChapter,
    TrainingModule,
    Article,
    Guide,
    Publication,
}

/// Style de document
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum DocumentStyle {
    Formal,
    Legal,
    Technical,
    Editorial,
    Pedagogical,
    Professional,
    Academic,
}

/// Niveau de détail
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum DetailLevel {
    Summary,
    Standard,
    Advanced,
    Exhaustive,
}

/// Configuration de génération
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GenerationConfig {
    pub doc_type: DocumentType,
    pub style: DocumentStyle,
    pub detail_level: DetailLevel,
    pub tone: String,
    pub language: String,
    pub custom_params: HashMap<String, String>,
}

/// Métadonnées du document
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DocumentMetadata {
    pub id: String,
    pub title: String,
    pub version: String,
    pub created_at: chrono::DateTime<chrono::Utc>,
    pub updated_at: chrono::DateTime<chrono::Utc>,
    pub author: String,
    pub tags: Vec<String>,
    pub category: String,
}

/// Structure d'un document généré
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Document {
    pub metadata: DocumentMetadata,
    pub config: GenerationConfig,
    pub content: DocumentContent,
    pub validation_status: ValidationStatus,
}

/// Contenu structuré du document
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DocumentContent {
    pub title: String,
    pub executive_summary: String,
    pub objectives: Vec<String>,
    pub sections: Vec<Section>,
    pub mandatory_clauses: Option<Vec<Clause>>,
    pub annexes: Vec<Annex>,
    pub references: Vec<Reference>,
}

/// Section de document
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Section {
    pub id: String,
    pub title: String,
    pub content: String,
    pub subsections: Vec<Section>,
    pub level: u8,
}

/// Clause légale
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Clause {
    pub id: String,
    pub title: String,
    pub content: String,
    pub mandatory: bool,
    pub category: ClauseCategory,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ClauseCategory {
    Confidentiality,
    Liability,
    IntellectualProperty,
    Termination,
    Dispute,
    General,
}

/// Annexe
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Annex {
    pub id: String,
    pub title: String,
    pub content: String,
    pub format: String,
}

/// Référence
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Reference {
    pub title: String,
    pub source: String,
    pub url: Option<String>,
    pub date: Option<String>,
}

/// Statut de validation
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ValidationStatus {
    pub is_valid: bool,
    pub errors: Vec<ValidationError>,
    pub warnings: Vec<ValidationWarning>,
    pub suggestions: Vec<Suggestion>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ValidationError {
    pub code: String,
    pub message: String,
    pub severity: ErrorSeverity,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ErrorSeverity {
    Critical,
    High,
    Medium,
    Low,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ValidationWarning {
    pub message: String,
    pub suggestion: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Suggestion {
    pub category: String,
    pub message: String,
    pub priority: u8,
}

/// Format d'export
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ExportFormat {
    Markdown,
    Html,
    Pdf,
    Json,
    Text,
}

/// Résultat d'export
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExportResult {
    pub format: ExportFormat,
    pub path: String,
    pub size: u64,
    pub success: bool,
}

/// Erreurs du moteur documentaire
#[derive(Debug, thiserror::Error)]
pub enum DocEngineError {
    #[error("Erreur de génération: {0}")]
    GenerationError(String),
    
    #[error("Erreur de validation: {0}")]
    ValidationError(String),
    
    #[error("Erreur d'export: {0}")]
    ExportError(String),
    
    #[error("Erreur de stockage: {0}")]
    StorageError(String),
    
    #[error("Erreur de template: {0}")]
    TemplateError(String),
    
    #[error("Configuration invalide: {0}")]
    InvalidConfig(String),
}

pub type Result<T> = std::result::Result<T, DocEngineError>;

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_document_type_equality() {
        assert_eq!(DocumentType::Contract, DocumentType::Contract);
        assert_ne!(DocumentType::Contract, DocumentType::NDA);
        assert_eq!(DocumentType::Architecture, DocumentType::Architecture);
    }

    #[test]
    fn test_document_type_serialization() {
        let doc_type = DocumentType::Contract;
        let json = serde_json::to_string(&doc_type).unwrap();
        assert!(json.contains("Contract"));

        let deserialized: DocumentType = serde_json::from_str(&json).unwrap();
        assert_eq!(deserialized, doc_type);
    }

    #[test]
    fn test_generation_config_creation() {
        let config = GenerationConfig {
            doc_type: DocumentType::TechnicalSpec,
            style: DocumentStyle::Technical,
            detail_level: DetailLevel::Advanced,
            tone: "Professional".to_string(),
            language: "fr".to_string(),
            custom_params: HashMap::new(),
        };

        assert_eq!(config.tone, "Professional");
        assert_eq!(config.language, "fr");
        assert!(config.custom_params.is_empty());
    }

    #[test]
    fn test_generation_config_with_custom_params() {
        let mut params = HashMap::new();
        params.insert("author".to_string(), "TITANE Team".to_string());
        params.insert("version".to_string(), "1.0".to_string());

        let config = GenerationConfig {
            doc_type: DocumentType::APIDoc,
            style: DocumentStyle::Technical,
            detail_level: DetailLevel::Exhaustive,
            tone: "Formal".to_string(),
            language: "en".to_string(),
            custom_params: params.clone(),
        };

        assert_eq!(config.custom_params.len(), 2);
        assert_eq!(config.custom_params.get("author").unwrap(), "TITANE Team");
    }

    #[test]
    fn test_document_metadata_creation() {
        let metadata = DocumentMetadata {
            id: "doc-001".to_string(),
            title: "Test Document".to_string(),
            version: "1.0.0".to_string(),
            created_at: chrono::Utc::now(),
            updated_at: chrono::Utc::now(),
            author: "Kevin Thibault".to_string(),
            tags: vec!["test".to_string(), "doc".to_string()],
            category: "Technical".to_string(),
        };

        assert_eq!(metadata.id, "doc-001");
        assert_eq!(metadata.tags.len(), 2);
        assert_eq!(metadata.author, "Kevin Thibault");
    }

    #[test]
    fn test_section_hierarchy() {
        let subsection = Section {
            id: "1.1".to_string(),
            title: "Subsection".to_string(),
            content: "Subsection content".to_string(),
            subsections: vec![],
            level: 2,
        };

        let section = Section {
            id: "1".to_string(),
            title: "Main Section".to_string(),
            content: "Main content".to_string(),
            subsections: vec![subsection.clone()],
            level: 1,
        };

        assert_eq!(section.level, 1);
        assert_eq!(section.subsections.len(), 1);
        assert_eq!(section.subsections[0].id, "1.1");
        assert_eq!(section.subsections[0].level, 2);
    }

    #[test]
    fn test_clause_mandatory_flag() {
        let mandatory_clause = Clause {
            id: "clause-1".to_string(),
            title: "Confidentiality".to_string(),
            content: "Must keep confidential".to_string(),
            mandatory: true,
            category: ClauseCategory::Confidentiality,
        };

        let optional_clause = Clause {
            id: "clause-2".to_string(),
            title: "Optional Terms".to_string(),
            content: "Optional content".to_string(),
            mandatory: false,
            category: ClauseCategory::General,
        };

        assert!(mandatory_clause.mandatory);
        assert!(!optional_clause.mandatory);
    }

    #[test]
    fn test_clause_categories() {
        let categories = vec![
            ClauseCategory::Confidentiality,
            ClauseCategory::Liability,
            ClauseCategory::IntellectualProperty,
            ClauseCategory::Termination,
            ClauseCategory::Dispute,
            ClauseCategory::General,
        ];

        // All categories should be distinct
        assert_eq!(categories.len(), 6);
    }

    #[test]
    fn test_validation_status_valid() {
        let status = ValidationStatus {
            is_valid: true,
            errors: vec![],
            warnings: vec![],
            suggestions: vec![],
        };

        assert!(status.is_valid);
        assert!(status.errors.is_empty());
        assert!(status.warnings.is_empty());
    }

    #[test]
    fn test_validation_status_with_errors() {
        let error = ValidationError {
            code: "E001".to_string(),
            message: "Missing required field".to_string(),
            severity: ErrorSeverity::Critical,
        };

        let status = ValidationStatus {
            is_valid: false,
            errors: vec![error.clone()],
            warnings: vec![],
            suggestions: vec![],
        };

        assert!(!status.is_valid);
        assert_eq!(status.errors.len(), 1);
        assert_eq!(status.errors[0].code, "E001");
    }

    #[test]
    fn test_error_severity_levels() {
        let critical = ErrorSeverity::Critical;
        let high = ErrorSeverity::High;
        let medium = ErrorSeverity::Medium;
        let low = ErrorSeverity::Low;

        // All severity levels should be distinct
        let error1 = ValidationError {
            code: "E1".to_string(),
            message: "Critical error".to_string(),
            severity: critical,
        };
        let error2 = ValidationError {
            code: "E2".to_string(),
            message: "Low error".to_string(),
            severity: low,
        };

        assert_eq!(error1.code, "E1");
        assert_eq!(error2.code, "E2");
    }

    #[test]
    fn test_validation_warning_with_suggestion() {
        let warning = ValidationWarning {
            message: "Consider adding more details".to_string(),
            suggestion: Some("Add executive summary".to_string()),
        };

        assert!(warning.suggestion.is_some());
        assert_eq!(warning.suggestion.unwrap(), "Add executive summary");
    }

    #[test]
    fn test_suggestion_priority() {
        let high_priority = Suggestion {
            category: "structure".to_string(),
            message: "Add table of contents".to_string(),
            priority: 1,
        };

        let low_priority = Suggestion {
            category: "formatting".to_string(),
            message: "Adjust margins".to_string(),
            priority: 5,
        };

        assert!(high_priority.priority < low_priority.priority);
    }

    #[test]
    fn test_annex_structure() {
        let annex = Annex {
            id: "annex-a".to_string(),
            title: "Technical Specifications".to_string(),
            content: "Detailed specs...".to_string(),
            format: "markdown".to_string(),
        };

        assert_eq!(annex.id, "annex-a");
        assert_eq!(annex.format, "markdown");
    }

    #[test]
    fn test_reference_with_url() {
        let reference = Reference {
            title: "TITANE Documentation".to_string(),
            source: "Official Docs".to_string(),
            url: Some("https://titane.ai/docs".to_string()),
            date: Some("2026-01-07".to_string()),
        };

        assert!(reference.url.is_some());
        assert!(reference.date.is_some());
    }

    #[test]
    fn test_reference_without_url() {
        let reference = Reference {
            title: "Internal Memo".to_string(),
            source: "Internal".to_string(),
            url: None,
            date: None,
        };

        assert!(reference.url.is_none());
        assert!(reference.date.is_none());
    }

    #[test]
    fn test_export_format_variants() {
        let formats = vec![
            ExportFormat::Markdown,
            ExportFormat::Html,
            ExportFormat::Pdf,
            ExportFormat::Json,
            ExportFormat::Text,
        ];

        assert_eq!(formats.len(), 5);
    }

    #[test]
    fn test_export_result_success() {
        let result = ExportResult {
            format: ExportFormat::Pdf,
            path: "/tmp/doc.pdf".to_string(),
            size: 1024,
            success: true,
        };

        assert!(result.success);
        assert_eq!(result.size, 1024);
        assert!(result.path.ends_with(".pdf"));
    }

    #[test]
    fn test_export_result_failure() {
        let result = ExportResult {
            format: ExportFormat::Html,
            path: "".to_string(),
            size: 0,
            success: false,
        };

        assert!(!result.success);
        assert_eq!(result.size, 0);
    }

    #[test]
    fn test_doc_engine_error_generation() {
        let error = DocEngineError::GenerationError("Failed to generate".to_string());
        assert!(error.to_string().contains("génération"));
    }

    #[test]
    fn test_doc_engine_error_validation() {
        let error = DocEngineError::ValidationError("Invalid format".to_string());
        assert!(error.to_string().contains("validation"));
    }

    #[test]
    fn test_doc_engine_error_export() {
        let error = DocEngineError::ExportError("Export failed".to_string());
        assert!(error.to_string().contains("export"));
    }

    #[test]
    fn test_doc_engine_error_storage() {
        let error = DocEngineError::StorageError("Storage unavailable".to_string());
        assert!(error.to_string().contains("stockage"));
    }

    #[test]
    fn test_doc_engine_error_template() {
        let error = DocEngineError::TemplateError("Template not found".to_string());
        assert!(error.to_string().contains("template"));
    }

    #[test]
    fn test_doc_engine_error_invalid_config() {
        let error = DocEngineError::InvalidConfig("Missing required field".to_string());
        assert!(error.to_string().contains("invalide"));
    }

    #[test]
    fn test_document_content_structure() {
        let content = DocumentContent {
            title: "Test Document".to_string(),
            executive_summary: "Summary...".to_string(),
            objectives: vec!["Objective 1".to_string(), "Objective 2".to_string()],
            sections: vec![],
            mandatory_clauses: None,
            annexes: vec![],
            references: vec![],
        };

        assert_eq!(content.objectives.len(), 2);
        assert!(content.mandatory_clauses.is_none());
    }

    #[test]
    fn test_document_content_with_clauses() {
        let clause = Clause {
            id: "c1".to_string(),
            title: "Test Clause".to_string(),
            content: "Content".to_string(),
            mandatory: true,
            category: ClauseCategory::General,
        };

        let content = DocumentContent {
            title: "Legal Document".to_string(),
            executive_summary: "Summary".to_string(),
            objectives: vec![],
            sections: vec![],
            mandatory_clauses: Some(vec![clause]),
            annexes: vec![],
            references: vec![],
        };

        assert!(content.mandatory_clauses.is_some());
        assert_eq!(content.mandatory_clauses.unwrap().len(), 1);
    }

    #[test]
    fn test_full_document_structure() {
        let metadata = DocumentMetadata {
            id: "doc-001".to_string(),
            title: "Test".to_string(),
            version: "1.0".to_string(),
            created_at: chrono::Utc::now(),
            updated_at: chrono::Utc::now(),
            author: "Test Author".to_string(),
            tags: vec![],
            category: "Test".to_string(),
        };

        let config = GenerationConfig {
            doc_type: DocumentType::Contract,
            style: DocumentStyle::Legal,
            detail_level: DetailLevel::Standard,
            tone: "Formal".to_string(),
            language: "fr".to_string(),
            custom_params: HashMap::new(),
        };

        let content = DocumentContent {
            title: "Test".to_string(),
            executive_summary: "Summary".to_string(),
            objectives: vec![],
            sections: vec![],
            mandatory_clauses: None,
            annexes: vec![],
            references: vec![],
        };

        let validation = ValidationStatus {
            is_valid: true,
            errors: vec![],
            warnings: vec![],
            suggestions: vec![],
        };

        let document = Document {
            metadata: metadata.clone(),
            config,
            content,
            validation_status: validation,
        };

        assert_eq!(document.metadata.id, "doc-001");
        assert!(document.validation_status.is_valid);
    }
}
