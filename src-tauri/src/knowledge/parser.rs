/**
 * TITANE∞ v∞ Phase 6 - Knowledge Fusion (Super-Prompt Q)
 * Universal Parser - Ingestion PDF/DOCX/JSON/OCR/Audio
 */
use serde::{Deserialize, Serialize};
use std::path::Path;

// ══════════════════════════════════════════════════════════════════
// TYPES
// ══════════════════════════════════════════════════════════════════

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum FileFormat {
    PDF,
    DOCX,
    Markdown,
    PlainText,
    JSON,
    CSV,
    XML,
    Image,
    Audio,
    Video,
    ZIP,
    Unknown,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct KnowledgeDocument {
    pub id: String,
    pub title: String,
    pub content: String,
    pub format: FileFormat,
    pub metadata: DocumentMetadata,
    pub categories: Vec<String>,
    pub confidence: f32,
    pub timestamp: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DocumentMetadata {
    pub author: Option<String>,
    pub created: Option<u64>,
    pub modified: Option<u64>,
    pub size_bytes: u64,
    pub language: Option<String>,
    pub keywords: Vec<String>,
}

// ══════════════════════════════════════════════════════════════════
// UNIVERSAL PARSER
// ══════════════════════════════════════════════════════════════════

pub struct UniversalParser {
    supported_formats: Vec<FileFormat>,
}

impl UniversalParser {
    pub fn new() -> Self {
        Self {
            supported_formats: vec![
                FileFormat::PDF,
                FileFormat::DOCX,
                FileFormat::Markdown,
                FileFormat::PlainText,
                FileFormat::JSON,
                FileFormat::CSV,
            ],
        }
    }

    /// Detect file format from extension
    pub fn detect_format(&self, file_path: &str) -> FileFormat {
        let path = Path::new(file_path);
        match path.extension().and_then(|s| s.to_str()) {
            Some("pdf") => FileFormat::PDF,
            Some("docx") => FileFormat::DOCX,
            Some("md") | Some("markdown") => FileFormat::Markdown,
            Some("txt") => FileFormat::PlainText,
            Some("json") => FileFormat::JSON,
            Some("csv") => FileFormat::CSV,
            Some("xml") => FileFormat::XML,
            Some("png") | Some("jpg") | Some("jpeg") => FileFormat::Image,
            Some("mp3") | Some("wav") | Some("m4a") => FileFormat::Audio,
            Some("zip") => FileFormat::ZIP,
            _ => FileFormat::Unknown,
        }
    }

    /// Parse file and extract content
    pub async fn parse_file(&self, file_path: &str) -> Result<KnowledgeDocument, String> {
        let format = self.detect_format(file_path);

        match format {
            FileFormat::PlainText | FileFormat::Markdown => self.parse_text(file_path).await,
            FileFormat::JSON => self.parse_json(file_path).await,
            FileFormat::PDF => self.parse_pdf(file_path).await,
            FileFormat::DOCX => self.parse_docx(file_path).await,
            _ => Err(format!("Unsupported format: {:?}", format)),
        }
    }

    async fn parse_text(&self, file_path: &str) -> Result<KnowledgeDocument, String> {
        let content = tokio::fs::read_to_string(file_path)
            .await
            .map_err(|e| format!("Failed to read file: {}", e))?;

        let metadata = self.extract_metadata(file_path).await?;
        let categories = self.classify_content(&content);

        Ok(KnowledgeDocument {
            id: format!("doc_{}", uuid::Uuid::new_v4()),
            title: self.extract_title(&content),
            content,
            format: FileFormat::PlainText,
            metadata,
            categories,
            confidence: 0.9,
            timestamp: std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap()
                .as_secs(),
        })
    }

    async fn parse_json(&self, file_path: &str) -> Result<KnowledgeDocument, String> {
        let content = tokio::fs::read_to_string(file_path)
            .await
            .map_err(|e| format!("Failed to read file: {}", e))?;

        // Validate JSON
        let _: serde_json::Value = serde_json::from_str(&content)
            .map_err(|e| format!("Invalid JSON: {}", e))?;

        let metadata = self.extract_metadata(file_path).await?;

        Ok(KnowledgeDocument {
            id: format!("doc_{}", uuid::Uuid::new_v4()),
            title: Path::new(file_path)
                .file_stem()
                .unwrap()
                .to_string_lossy()
                .to_string(),
            content,
            format: FileFormat::JSON,
            metadata,
            categories: vec!["data".to_string()],
            confidence: 0.95,
            timestamp: std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap()
                .as_secs(),
        })
    }

    async fn parse_pdf(&self, _file_path: &str) -> Result<KnowledgeDocument, String> {
        // Placeholder - would use pdf-extract or similar
        Err("PDF parsing not yet implemented".to_string())
    }

    async fn parse_docx(&self, _file_path: &str) -> Result<KnowledgeDocument, String> {
        // Placeholder - would use docx-rs or similar
        Err("DOCX parsing not yet implemented".to_string())
    }

    async fn extract_metadata(&self, file_path: &str) -> Result<DocumentMetadata, String> {
        let metadata = tokio::fs::metadata(file_path)
            .await
            .map_err(|e| format!("Failed to get metadata: {}", e))?;

        Ok(DocumentMetadata {
            author: None,
            created: None,
            modified: metadata
                .modified()
                .ok()
                .and_then(|t| t.duration_since(std::time::UNIX_EPOCH).ok())
                .map(|d| d.as_secs()),
            size_bytes: metadata.len(),
            language: Some("en".to_string()),
            keywords: vec![],
        })
    }

    fn extract_title(&self, content: &str) -> String {
        // Extract first line or first heading
        content
            .lines()
            .next()
            .unwrap_or("Untitled")
            .trim_start_matches('#')
            .trim()
            .to_string()
    }

    fn classify_content(&self, content: &str) -> Vec<String> {
        let mut categories = Vec::new();
        let lower = content.to_lowercase();

        if lower.contains("function") || lower.contains("class") || lower.contains("impl") {
            categories.push("code".to_string());
        }
        if lower.contains("config") || lower.contains("settings") {
            categories.push("configuration".to_string());
        }
        if lower.contains("todo") || lower.contains("bug") || lower.contains("fix") {
            categories.push("development".to_string());
        }
        if lower.contains("doc") || lower.contains("guide") || lower.contains("readme") {
            categories.push("documentation".to_string());
        }

        if categories.is_empty() {
            categories.push("general".to_string());
        }

        categories
    }
}

impl Default for UniversalParser {
    fn default() -> Self {
        Self::new()
    }
}

// ══════════════════════════════════════════════════════════════════
// TAURI COMMANDS
// ══════════════════════════════════════════════════════════════════

#[tauri::command]
pub async fn parse_document(file_path: String) -> Result<KnowledgeDocument, String> {
    let parser = UniversalParser::new();
    parser.parse_file(&file_path).await
}

#[tauri::command]
pub async fn detect_file_format(file_path: String) -> Result<String, String> {
    let parser = UniversalParser::new();
    let format = parser.detect_format(&file_path);
    Ok(format!("{:?}", format))
}
