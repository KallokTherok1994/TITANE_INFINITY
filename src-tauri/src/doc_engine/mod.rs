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
