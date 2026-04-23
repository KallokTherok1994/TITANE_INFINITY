// TITANE∞ — Doc Engine IPC Commands
// Commandes Tauri pour l'export de documents (Phase 2)

use super::{Document, ExportFormat};
use super::export::ExportEngine;
use serde::{Deserialize, Serialize};

/// Payload d'entrée pour export_docx_file
#[derive(Debug, Deserialize)]
pub struct ExportDocxRequest {
    pub document: Document,
    pub output_dir: String,
}

/// Réponse IPC canonique
#[derive(Debug, Serialize)]
pub struct ExportDocxResponse {
    pub ok: bool,
    pub content: Option<ExportDocxContent>,
    pub error: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct ExportDocxContent {
    pub path: String,
    pub size: u64,
}

/// Commande Tauri — Export d'un document en DOCX natif
/// IPC contract: { ok, content, error }
#[tauri::command]
pub async fn export_docx_file(req: ExportDocxRequest) -> ExportDocxResponse {
    let engine = ExportEngine::new(req.output_dir.clone());
    match engine.export(&req.document, ExportFormat::Docx).await {
        Ok(result) => ExportDocxResponse {
            ok: true,
            content: Some(ExportDocxContent {
                path: result.path,
                size: result.size,
            }),
            error: None,
        },
        Err(e) => ExportDocxResponse {
            ok: false,
            content: None,
            error: Some(format!("{:?}", e)),
        },
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::doc_engine::{
        Annex, Clause, ClauseCategory, DetailLevel, DocumentStyle, DocumentType,
        ErrorSeverity, GenerationConfig, Reference, Section, Suggestion, ValidationError,
        ValidationStatus, ValidationWarning,
    };
    use std::collections::HashMap;
    use tempfile::tempdir;

    fn make_test_doc(output_dir: &str) -> ExportDocxRequest {
        use chrono::Utc;
        ExportDocxRequest {
            output_dir: output_dir.to_string(),
            document: Document {
                metadata: DocumentMetadata {
                    id: "test-ipc-001".to_string(),
                    title: "IPC DOCX Test".to_string(),
                    version: "1.0.0".to_string(),
                    created_at: Utc::now(),
                    updated_at: Utc::now(),
                    author: "TITANE".to_string(),
                    tags: vec![],
                    category: "test".to_string(),
                },
                config: GenerationConfig {
                    doc_type: DocumentType::Analysis,
                    style: DocumentStyle::Technical,
                    detail_level: DetailLevel::Standard,
                    tone: "neutre".to_string(),
                    language: "fr".to_string(),
                    custom_params: HashMap::new(),
                },
                content: crate::doc_engine::DocumentContent {
                    title: "IPC DOCX Test".to_string(),
                    executive_summary: "Test IPC export.".to_string(),
                    objectives: vec!["Valider le contrat IPC".to_string()],
                    sections: vec![Section {
                        id: "s1".to_string(),
                        title: "Section test".to_string(),
                        content: "Contenu de test.".to_string(),
                        subsections: vec![],
                        level: 1,
                    }],
                    mandatory_clauses: None,
                    annexes: vec![],
                    references: vec![],
                },
                validation_status: ValidationStatus {
                    is_valid: true,
                    errors: vec![],
                    warnings: vec![],
                    suggestions: vec![],
                },
            },
        }
    }

    #[tokio::test]
    async fn export_docx_file_returns_ok() {
        let dir = tempdir().expect("tempdir");
        let req = make_test_doc(dir.path().to_str().expect("path"));
        let resp = export_docx_file(req).await;
        assert!(resp.ok, "expected ok=true, got error={:?}", resp.error);
        let content = resp.content.expect("content present");
        assert!(content.size > 0, "expected size > 0");
        assert!(content.path.ends_with(".docx"), "expected .docx path");
    }

    #[tokio::test]
    async fn export_docx_file_bad_dir_returns_error() {
        let req = make_test_doc("/nonexistent_titane_dir_xyz_42");
        let resp = export_docx_file(req).await;
        assert!(!resp.ok, "expected ok=false for bad dir");
        assert!(resp.error.is_some(), "expected error message");
    }
}
