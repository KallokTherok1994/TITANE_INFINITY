/**
 * TITANE∞ v∞ Phase 6 - Knowledge Fusion (Super-Prompt Q)
 * Universal Parser - Ingestion PDF/DOCX/JSON/OCR/Audio
 */
use serde::{Deserialize, Serialize};
use std::path::Path;
use std::process::Stdio;
use tokio::time::{timeout, Duration};

// ══════════════════════════════════════════════════════════════════
// TYPES
// ══════════════════════════════════════════════════════════════════

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum FileFormat {
    PDF,
    DOC,
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
    #[allow(dead_code)]
    supported_formats: Vec<FileFormat>,
}

impl UniversalParser {
    pub fn new() -> Self {
        Self {
            supported_formats: vec![
                FileFormat::PDF,
                FileFormat::DOC,
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
        let extension = Path::new(file_path)
            .extension()
            .and_then(|s| s.to_str())
            .map(|ext| ext.to_ascii_lowercase());

        match extension.as_deref() {
            Some("pdf") => FileFormat::PDF,
            Some("doc") => FileFormat::DOC,
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
            FileFormat::PlainText | FileFormat::Markdown | FileFormat::CSV | FileFormat::XML => {
                self.parse_text_with_format(file_path, format).await
            }
            FileFormat::JSON => self.parse_json(file_path).await,
            FileFormat::PDF => self.parse_pdf(file_path).await,
            FileFormat::DOC => self.parse_doc(file_path).await,
            FileFormat::DOCX => self.parse_docx(file_path).await,
            _ => Err(format!("Unsupported format: {:?}", format)),
        }
    }

    async fn parse_text(&self, file_path: &str) -> Result<KnowledgeDocument, String> {
        self.parse_text_with_format(file_path, FileFormat::PlainText)
            .await
    }

    async fn parse_text_with_format(
        &self,
        file_path: &str,
        format: FileFormat,
    ) -> Result<KnowledgeDocument, String> {
        let content = tokio::fs::read_to_string(file_path)
            .await
            .map_err(|e| format!("Failed to read file: {}", e))?;

        let normalized_content = Self::normalize_extracted_content(&content);
        let metadata = self.extract_metadata(file_path).await?;
        let categories = self.classify_content(&normalized_content);
        let resolved_format = match format {
            FileFormat::Markdown => FileFormat::Markdown,
            FileFormat::CSV => FileFormat::CSV,
            FileFormat::XML => FileFormat::XML,
            _ => FileFormat::PlainText,
        };

        Ok(self.build_document(
            file_path,
            normalized_content,
            resolved_format,
            metadata,
            categories,
            0.9,
        ))
    }

    async fn parse_json(&self, file_path: &str) -> Result<KnowledgeDocument, String> {
        let content = tokio::fs::read_to_string(file_path)
            .await
            .map_err(|e| format!("Failed to read file: {}", e))?;

        // Validate JSON
        let _: serde_json::Value =
            serde_json::from_str(&content).map_err(|e| format!("Invalid JSON: {}", e))?;

        let metadata = self.extract_metadata(file_path).await?;

        Ok(KnowledgeDocument {
            id: format!("doc_{}", uuid::Uuid::new_v4()),
            title: Path::new(file_path)
                .file_stem()
                .map(|s| s.to_string_lossy().to_string())
                .unwrap_or_else(|| "untitled".to_string()),
            content,
            format: FileFormat::JSON,
            metadata,
            categories: vec!["data".to_string()],
            confidence: 0.95,
            timestamp: std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap_or_default()
                .as_secs(),
        })
    }

    async fn parse_pdf(&self, file_path: &str) -> Result<KnowledgeDocument, String> {
        let metadata = self.extract_metadata(file_path).await?;
        let extracted = self.extract_pdf_text(file_path).await?;
        let (content, confidence) = if extracted.is_empty() {
            (
                self.build_unavailable_content(
                    file_path,
                    "PDF",
                    metadata.size_bytes,
                    "Le texte complet n’a pas pu être extrait automatiquement dans ce runtime. Les métadonnées restent toutefois disponibles pour la mémoire TITANE.",
                ),
                0.4,
            )
        } else {
            (extracted, 0.86)
        };
        let categories = self.classify_content(&content);

        Ok(self.build_document(
            file_path,
            content,
            FileFormat::PDF,
            metadata,
            categories,
            confidence,
        ))
    }

    async fn parse_doc(&self, file_path: &str) -> Result<KnowledgeDocument, String> {
        let metadata = self.extract_metadata(file_path).await?;
        let extracted = self.extract_doc_text(file_path).await?;
        let (content, confidence) = if extracted.is_empty() {
            (
                self.build_unavailable_content(
                    file_path,
                    "DOC",
                    metadata.size_bytes,
                    "Le format Word binaire legacy n’a pas pu être converti complètement dans ce runtime. Le document reste néanmoins indexé avec ses métadonnées pour la mémoire TITANE.",
                ),
                0.35,
            )
        } else {
            (extracted, 0.78)
        };
        let categories = self.classify_content(&content);

        Ok(self.build_document(
            file_path,
            content,
            FileFormat::DOC,
            metadata,
            categories,
            confidence,
        ))
    }

    async fn parse_docx(&self, file_path: &str) -> Result<KnowledgeDocument, String> {
        let metadata = self.extract_metadata(file_path).await?;
        let extracted = self.extract_docx_text(file_path).await?;
        let (content, confidence) = if extracted.is_empty() {
            (
                self.build_unavailable_content(
                    file_path,
                    "DOCX",
                    metadata.size_bytes,
                    "Le contenu texte principal n’a pas pu être extrait. Le document reste toutefois indexé avec ses métadonnées pour rappel futur.",
                ),
                0.45,
            )
        } else {
            (extracted, 0.9)
        };
        let categories = self.classify_content(&content);

        Ok(self.build_document(
            file_path,
            content,
            FileFormat::DOCX,
            metadata,
            categories,
            confidence,
        ))
    }

    fn build_document(
        &self,
        file_path: &str,
        content: String,
        format: FileFormat,
        metadata: DocumentMetadata,
        categories: Vec<String>,
        confidence: f32,
    ) -> KnowledgeDocument {
        let title = match format {
            FileFormat::PlainText | FileFormat::Markdown => {
                let extracted = self.extract_title(&content);
                if extracted.is_empty() {
                    Self::filename_stem(file_path)
                } else {
                    extracted
                }
            }
            _ => Self::filename_stem(file_path),
        };

        KnowledgeDocument {
            id: format!("doc_{}", uuid::Uuid::new_v4()),
            title,
            content,
            format,
            metadata,
            categories,
            confidence,
            timestamp: Self::current_timestamp(),
        }
    }

    fn filename_stem(file_path: &str) -> String {
        Path::new(file_path)
            .file_stem()
            .map(|s| s.to_string_lossy().to_string())
            .filter(|s| !s.trim().is_empty())
            .unwrap_or_else(|| "untitled".to_string())
    }

    fn current_timestamp() -> u64 {
        std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap_or_default()
            .as_secs()
    }

    fn normalize_extracted_content(content: &str) -> String {
        content
            .lines()
            .map(|line| line.split_whitespace().collect::<Vec<_>>().join(" "))
            .filter(|line| !line.is_empty())
            .collect::<Vec<_>>()
            .join("\n")
            .trim()
            .to_string()
    }

    fn build_unavailable_content(
        &self,
        file_path: &str,
        format_label: &str,
        size_bytes: u64,
        note: &str,
    ) -> String {
        format!(
            "Document importé: {}\nType: {}\nTaille: {:.1} KB\nNote: {}",
            Path::new(file_path)
                .file_name()
                .map(|s| s.to_string_lossy().to_string())
                .unwrap_or_else(|| file_path.to_string()),
            format_label,
            size_bytes as f64 / 1024.0,
            note
        )
    }

    async fn run_external_parser(&self, program: &str, args: &[&str]) -> Result<String, String> {
        const EXTERNAL_PARSER_TIMEOUT_SECONDS: u64 = 8;

        let mut command = tokio::process::Command::new(program);
        command.args(args);
        command.stdout(Stdio::piped());
        command.stderr(Stdio::null());

        let output = match timeout(
            Duration::from_secs(EXTERNAL_PARSER_TIMEOUT_SECONDS),
            command.output(),
        )
        .await
        {
            Ok(Ok(output)) => output,
            Ok(Err(err)) if err.kind() == std::io::ErrorKind::NotFound => return Ok(String::new()),
            Ok(Err(err)) => return Err(format!("{} failed: {}", program, err)),
            Err(_) => {
                return Err(format!(
                    "{} timed out after {}s",
                    program, EXTERNAL_PARSER_TIMEOUT_SECONDS
                ))
            }
        };

        if !output.status.success() {
            return Ok(String::new());
        }

        Ok(String::from_utf8_lossy(&output.stdout).to_string())
    }

    async fn extract_pdf_text(&self, file_path: &str) -> Result<String, String> {
        let raw = self
            .run_external_parser("pdftotext", &["-layout", "-nopgbrk", file_path, "-"])
            .await?;

        Ok(Self::normalize_extracted_content(&raw))
    }

    async fn extract_doc_text(&self, file_path: &str) -> Result<String, String> {
        for (program, args) in [("antiword", vec![file_path]), ("catdoc", vec![file_path])] {
            let raw = self.run_external_parser(program, &args).await?;
            let normalized = Self::normalize_extracted_content(&raw);
            if !normalized.is_empty() {
                return Ok(normalized);
            }
        }

        Ok(String::new())
    }

    async fn extract_docx_text(&self, file_path: &str) -> Result<String, String> {
        let raw_xml = self
            .run_external_parser("unzip", &["-p", file_path, "word/document.xml"])
            .await?;

        if raw_xml.trim().is_empty() {
            return Ok(String::new());
        }

        Ok(Self::extract_docx_body(&raw_xml))
    }

    fn extract_docx_body(xml: &str) -> String {
        let with_breaks = xml
            .replace("</w:p>", "\n")
            .replace("</w:tr>", "\n")
            .replace("<w:tab/>", "\t")
            .replace("<w:br/>", "\n")
            .replace("<w:cr/>", "\n");
        let tag_re = regex::Regex::new(r"<[^>]+>").expect("valid docx tag regex");
        let without_tags = tag_re.replace_all(&with_breaks, " ");

        Self::normalize_extracted_content(&Self::decode_xml_entities(&without_tags))
    }

    fn decode_xml_entities(value: &str) -> String {
        value
            .replace("&amp;", "&")
            .replace("&lt;", "<")
            .replace("&gt;", ">")
            .replace("&quot;", "\"")
            .replace("&apos;", "'")
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

/// Validates that a file path is safe (no traversal attacks).
/// Rejects paths containing `..` components, NUL bytes, or protocol schemes.
fn validate_file_path(file_path: &str) -> Result<std::path::PathBuf, String> {
    if file_path.contains('\0') {
        return Err("Invalid file path: contains NUL byte".to_string());
    }
    let path = std::path::PathBuf::from(file_path);
    // Reject any path with .. components (traversal)
    for component in path.components() {
        if matches!(component, std::path::Component::ParentDir) {
            return Err("Invalid file path: path traversal detected".to_string());
        }
    }
    // Reject protocol schemes (e.g. file://, http://)
    if file_path.contains("://") {
        return Err("Invalid file path: protocol schemes not allowed".to_string());
    }
    Ok(path)
}

#[tauri::command]
pub async fn parse_document(file_path: String) -> Result<KnowledgeDocument, String> {
    let validated = validate_file_path(&file_path)?;
    let parser = UniversalParser::new();
    parser.parse_file(&validated.to_string_lossy()).await
}

#[tauri::command]
pub async fn detect_file_format(file_path: String) -> Result<String, String> {
    let validated = validate_file_path(&file_path)?;
    let parser = UniversalParser::new();
    let format = parser.detect_format(&validated.to_string_lossy());
    Ok(format!("{:?}", format))
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs::File;
    use std::io::Write;
    use tempfile::tempdir;
    use zip::write::SimpleFileOptions;

    #[test]
    fn detect_format_is_case_insensitive_for_structured_documents() {
        let parser = UniversalParser::new();

        assert_eq!(parser.detect_format("/tmp/REPORT.PDF"), FileFormat::PDF);
        assert_eq!(parser.detect_format("/tmp/legacy.DOC"), FileFormat::DOC);
        assert_eq!(parser.detect_format("/tmp/notes.DOCX"), FileFormat::DOCX);
    }

    #[tokio::test]
    async fn parse_pdf_returns_a_document_instead_of_not_implemented() {
        let parser = UniversalParser::new();
        let dir = tempdir().expect("tempdir");
        let pdf_path = dir.path().join("sample.pdf");

        std::fs::write(
            &pdf_path,
            b"%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\n",
        )
        .expect("write pdf");

        let document = parser
            .parse_file(pdf_path.to_string_lossy().as_ref())
            .await
            .expect("pdf fallback should succeed");

        assert_eq!(document.format, FileFormat::PDF);
        assert!(
            !document.content.trim().is_empty(),
            "pdf fallback should produce visible content"
        );
    }

    #[tokio::test]
    async fn parse_doc_returns_a_fallback_document_instead_of_unsupported() {
        let parser = UniversalParser::new();
        let dir = tempdir().expect("tempdir");
        let doc_path = dir.path().join("legacy.DOC");

        std::fs::write(&doc_path, b"legacy-doc-binary-placeholder").expect("write doc");

        let document = parser
            .parse_file(doc_path.to_string_lossy().as_ref())
            .await
            .expect("doc fallback should succeed");

        assert_eq!(document.format, FileFormat::DOC);
        assert!(document.content.contains("Document importé: legacy.DOC"));
    }

    #[tokio::test]
    async fn parse_docx_extracts_visible_text() {
        let parser = UniversalParser::new();
        let dir = tempdir().expect("tempdir");
        let docx_path = dir.path().join("sample.docx");
        let file = File::create(&docx_path).expect("create docx");
        let mut zip = zip::ZipWriter::new(file);
        let options = SimpleFileOptions::default();

        zip.start_file("[Content_Types].xml", options)
            .expect("start content types");
        zip.write_all(br#"<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"></Types>"#)
            .expect("write content types");
        zip.start_file("word/document.xml", options)
            .expect("start document xml");
        zip.write_all(
            "<?xml version=\"1.0\" encoding=\"UTF-8\"?><w:document xmlns:w=\"http://schemas.openxmlformats.org/wordprocessingml/2006/main\"><w:body><w:p><w:r><w:t>Bonjour TITANE</w:t></w:r></w:p><w:p><w:r><w:t>Mémoire persistante</w:t></w:r></w:p></w:body></w:document>"
                .as_bytes(),
        )
        .expect("write document xml");
        zip.finish().expect("finish zip");

        let document = parser
            .parse_file(docx_path.to_string_lossy().as_ref())
            .await
            .expect("docx parsing should succeed");

        assert_eq!(document.format, FileFormat::DOCX);
        assert!(document.content.contains("Bonjour TITANE"));
        assert!(document.content.contains("Mémoire persistante"));
    }

    #[test]
    fn validate_file_path_rejects_traversal() {
        assert!(validate_file_path("../../../etc/passwd").is_err());
        assert!(validate_file_path("/home/user/../../../etc/shadow").is_err());
        assert!(validate_file_path("foo/../../bar").is_err());
    }

    #[test]
    fn validate_file_path_rejects_nul_bytes() {
        assert!(validate_file_path("/tmp/safe\0malicious").is_err());
    }

    #[test]
    fn validate_file_path_rejects_protocol_schemes() {
        assert!(validate_file_path("file:///etc/passwd").is_err());
        assert!(validate_file_path("http://evil.com/payload").is_err());
    }

    #[test]
    fn validate_file_path_accepts_safe_paths() {
        assert!(validate_file_path("/home/user/docs/report.pdf").is_ok());
        assert!(validate_file_path("report.pdf").is_ok());
        assert!(validate_file_path("/tmp/REPORT.PDF").is_ok());
    }
}
