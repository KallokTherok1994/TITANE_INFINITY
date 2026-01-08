// Module d'export multi-format

use super::*;
use std::fs;
use std::path::Path;

pub struct ExportEngine {
    output_dir: String,
}

impl ExportEngine {
    pub fn new(output_dir: String) -> Self {
        Self { output_dir }
    }
    
    /// Exporte un document dans le format spécifié
    pub async fn export(&self, document: &Document, format: ExportFormat) -> Result<ExportResult> {
        match format {
            ExportFormat::Markdown => self.export_markdown(document).await,
            ExportFormat::Html => self.export_html(document).await,
            ExportFormat::Text => self.export_text(document).await,
            ExportFormat::Json => self.export_json(document).await,
            ExportFormat::Pdf => self.export_pdf(document).await,
        }
    }
    
    async fn export_markdown(&self, document: &Document) -> Result<ExportResult> {
        let content = self.generate_markdown(document)?;
        let filename = format!("{}.md", self.sanitize_filename(&document.metadata.title));
        let path = Path::new(&self.output_dir).join(&filename);
        
        fs::write(&path, content)
            .map_err(|e| DocEngineError::ExportError(format!("Erreur d'écriture Markdown: {}", e)))?;
        
        Ok(ExportResult {
            format: ExportFormat::Markdown,
            path: path.to_string_lossy().to_string(),
            size: path.metadata().map(|m| m.len()).unwrap_or(0),
            success: true,
        })
    }
    
    fn generate_markdown(&self, document: &Document) -> Result<String> {
        let mut md = String::new();
        
        // En-tête
        md.push_str(&format!("# {}\n\n", document.content.title));
        md.push_str(&format!("**Version:** {} | **Date:** {}\n\n", 
            document.metadata.version,
            document.metadata.created_at.format("%Y-%m-%d")
        ));
        
        // Résumé exécutif
        md.push_str("## Résumé Exécutif\n\n");
        md.push_str(&document.content.executive_summary);
        md.push_str("\n\n");
        
        // Objectifs
        if !document.content.objectives.is_empty() {
            md.push_str("## Objectifs\n\n");
            for obj in &document.content.objectives {
                md.push_str(&format!("- {}\n", obj));
            }
            md.push_str("\n");
        }
        
        // Sections
        for section in &document.content.sections {
            md.push_str(&self.format_section_markdown(section, 2));
        }
        
        // Clauses obligatoires (si présentes)
        if let Some(clauses) = &document.content.mandatory_clauses {
            if !clauses.is_empty() {
                md.push_str("## Clauses Obligatoires\n\n");
                for clause in clauses {
                    md.push_str(&format!("### {}\n\n", clause.title));
                    md.push_str(&clause.content);
                    md.push_str("\n\n");
                }
            }
        }
        
        // Annexes
        if !document.content.annexes.is_empty() {
            md.push_str("## Annexes\n\n");
            for annex in &document.content.annexes {
                md.push_str(&format!("### {}\n\n", annex.title));
                md.push_str(&annex.content);
                md.push_str("\n\n");
            }
        }
        
        // Références
        if !document.content.references.is_empty() {
            md.push_str("## Références\n\n");
            for reference in &document.content.references {
                md.push_str(&format!("- **{}** - {}", reference.title, reference.source));
                if let Some(url) = &reference.url {
                    md.push_str(&format!(" - [{}]({})", url, url));
                }
                md.push_str("\n");
            }
        }
        
        Ok(md)
    }
    
    fn format_section_markdown(&self, section: &Section, level: usize) -> String {
        let mut md = String::new();
        let heading = "#".repeat(level);
        
        md.push_str(&format!("{} {}\n\n", heading, section.title));
        md.push_str(&section.content);
        md.push_str("\n\n");
        
        // Sous-sections récursives
        for subsection in &section.subsections {
            md.push_str(&self.format_section_markdown(subsection, level + 1));
        }
        
        md
    }
    
    async fn export_html(&self, document: &Document) -> Result<ExportResult> {
        let content = self.generate_html(document)?;
        let filename = format!("{}.html", self.sanitize_filename(&document.metadata.title));
        let path = Path::new(&self.output_dir).join(&filename);
        
        fs::write(&path, content)
            .map_err(|e| DocEngineError::ExportError(format!("Erreur d'écriture HTML: {}", e)))?;
        
        Ok(ExportResult {
            format: ExportFormat::Html,
            path: path.to_string_lossy().to_string(),
            size: path.metadata().map(|m| m.len()).unwrap_or(0),
            success: true,
        })
    }
    
    fn generate_html(&self, document: &Document) -> Result<String> {
        let mut html = String::from("<!DOCTYPE html>\n<html lang=\"fr\">\n<head>\n");
        html.push_str(&format!("    <meta charset=\"UTF-8\">\n"));
        html.push_str(&format!("    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n"));
        html.push_str(&format!("    <title>{}</title>\n", document.content.title));
        html.push_str(r#"    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; max-width: 900px; margin: 0 auto; padding: 20px; }
        h1 { color: #2c3e50; border-bottom: 3px solid #3498db; padding-bottom: 10px; }
        h2 { color: #34495e; margin-top: 30px; }
        h3 { color: #7f8c8d; }
        .metadata { background: #ecf0f1; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
        .section { margin: 20px 0; }
        .clause { background: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 10px 0; }
        ul { list-style-type: none; padding-left: 0; }
        li:before { content: "▸ "; color: #3498db; font-weight: bold; }
    </style>
</head>
<body>
"#);
        
        // Contenu
        html.push_str(&format!("    <h1>{}</h1>\n", document.content.title));
        html.push_str(&format!("    <div class=\"metadata\">\n"));
        html.push_str(&format!("        <strong>Version:</strong> {} | <strong>Date:</strong> {}\n", 
            document.metadata.version,
            document.metadata.created_at.format("%Y-%m-%d")
        ));
        html.push_str("    </div>\n");
        
        html.push_str(&format!("    <h2>Résumé Exécutif</h2>\n    <p>{}</p>\n", document.content.executive_summary));
        
        // Sections
        for section in &document.content.sections {
            html.push_str(&self.format_section_html(section));
        }
        
        html.push_str("</body>\n</html>");
        
        Ok(html)
    }
    
    fn format_section_html(&self, section: &Section) -> String {
        let heading_level = (section.level + 1).min(6);
        format!("    <div class=\"section\">\n        <h{}>{}</h{}>\n        <p>{}</p>\n    </div>\n",
            heading_level, section.title, heading_level, section.content)
    }
    
    async fn export_text(&self, document: &Document) -> Result<ExportResult> {
        let content = self.generate_text(document)?;
        let filename = format!("{}.txt", self.sanitize_filename(&document.metadata.title));
        let path = Path::new(&self.output_dir).join(&filename);
        
        fs::write(&path, content)
            .map_err(|e| DocEngineError::ExportError(format!("Erreur d'écriture Text: {}", e)))?;
        
        Ok(ExportResult {
            format: ExportFormat::Text,
            path: path.to_string_lossy().to_string(),
            size: path.metadata().map(|m| m.len()).unwrap_or(0),
            success: true,
        })
    }
    
    fn generate_text(&self, document: &Document) -> Result<String> {
        let mut text = String::new();
        
        text.push_str(&format!("{}\n", document.content.title));
        text.push_str(&format!("{}\n\n", "=".repeat(document.content.title.len())));
        text.push_str(&format!("Version: {} | Date: {}\n\n", 
            document.metadata.version,
            document.metadata.created_at.format("%Y-%m-%d")
        ));
        
        text.push_str("RÉSUMÉ EXÉCUTIF\n\n");
        text.push_str(&document.content.executive_summary);
        text.push_str("\n\n");
        
        for section in &document.content.sections {
            text.push_str(&self.format_section_text(section));
        }
        
        Ok(text)
    }
    
    fn format_section_text(&self, section: &Section) -> String {
        format!("{}\n{}\n\n{}\n\n", 
            section.title,
            "-".repeat(section.title.len()),
            section.content
        )
    }
    
    async fn export_json(&self, document: &Document) -> Result<ExportResult> {
        let content = serde_json::to_string_pretty(document)
            .map_err(|e| DocEngineError::ExportError(format!("Erreur sérialisation JSON: {}", e)))?;
        
        let filename = format!("{}.json", self.sanitize_filename(&document.metadata.title));
        let path = Path::new(&self.output_dir).join(&filename);
        
        fs::write(&path, content)
            .map_err(|e| DocEngineError::ExportError(format!("Erreur d'écriture JSON: {}", e)))?;
        
        Ok(ExportResult {
            format: ExportFormat::Json,
            path: path.to_string_lossy().to_string(),
            size: path.metadata().map(|m| m.len()).unwrap_or(0),
            success: true,
        })
    }
    
    async fn export_pdf(&self, _document: &Document) -> Result<ExportResult> {
        // Implementation: PDF export with printpdf or headless Chrome
        // - Option 1 (printpdf): Native Rust PDF generation
        //   * Dependency: printpdf = "0.7"
        //   * Create: PdfDocument::empty(), add pages, write text/images
        //   * Layout: Manual positioning (x, y coordinates)
        // - Option 2 (wkhtmltopdf): HTML → PDF via headless WebKit
        //   * Convert markdown → HTML first with pulldown-cmark
        //   * Command: wkhtmltopdf input.html output.pdf
        //   * Requires wkhtmltopdf binary installed on system
        // - Option 3 (headless-chrome): Modern approach with Chrome DevTools Protocol
        //   * Library: headless_chrome crate, render HTML and print to PDF
        //   * Best for complex layouts with CSS styling
        Err(DocEngineError::ExportError("PDF export not yet implemented".to_string()))
    }
    
    fn sanitize_filename(&self, title: &str) -> String {
        title.chars()
            .map(|c| if c.is_alphanumeric() || c == ' ' { c } else { '_' })
            .collect::<String>()
            .replace(' ', "_")
            .to_lowercase()
    }
}

impl Default for ExportEngine {
    fn default() -> Self {
        Self::new("./exports".to_string())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::collections::HashMap;
    use std::fs;
    use tempfile::TempDir;

    fn create_test_document() -> Document {
        let metadata = DocumentMetadata {
            id: "test-123".to_string(),
            title: "Test Document".to_string(),
            version: "1.0.0".to_string(),
            created_at: chrono::Utc::now(),
            updated_at: chrono::Utc::now(),
            author: "TITANE∞".to_string(),
            tags: vec!["test".to_string()],
            category: "test".to_string(),
        };

        let content = DocumentContent {
            title: "Test Document".to_string(),
            executive_summary: "This is a test summary.".to_string(),
            objectives: vec![
                "Objective 1".to_string(),
                "Objective 2".to_string(),
            ],
            sections: vec![
                Section {
                    title: "Section 1".to_string(),
                    content: "Content of section 1".to_string(),
                    level: 1,
                    subsections: vec![],
                    metadata: None,
                },
                Section {
                    title: "Section 2".to_string(),
                    content: "Content of section 2 with ```code```".to_string(),
                    level: 1,
                    subsections: vec![],
                    metadata: None,
                },
            ],
            mandatory_clauses: Some(vec![
                MandatoryClause {
                    title: "Confidentiality".to_string(),
                    content: "Confidential information.".to_string(),
                    category: ClauseCategory::Confidentiality,
                    required: true,
                },
            ]),
            annexes: vec![
                Annex {
                    title: "Annex A".to_string(),
                    content: "Annex content".to_string(),
                },
            ],
            references: vec![
                Reference {
                    title: "Reference 1".to_string(),
                    source: "Source 1".to_string(),
                    url: Some("https://example.com".to_string()),
                },
            ],
        };

        let config = GenerationConfig {
            doc_type: DocumentType::Contract,
            style: DocumentStyle::Technical,
            detail_level: DetailLevel::Detailed,
            tone: "Formal".to_string(),
            language: "fr".to_string(),
            custom_params: HashMap::new(),
        };

        let validation_status = ValidationStatus {
            is_valid: true,
            errors: vec![],
            warnings: vec![],
            suggestions: vec![],
        };

        Document {
            metadata,
            config,
            content,
            validation_status,
        }
    }

    #[test]
    fn test_export_engine_new() {
        let engine = ExportEngine::new("/tmp/exports".to_string());
        assert_eq!(engine.output_dir, "/tmp/exports");
    }

    #[test]
    fn test_export_engine_default() {
        let engine = ExportEngine::default();
        assert_eq!(engine.output_dir, "./exports");
    }

    #[test]
    fn test_sanitize_filename() {
        let engine = ExportEngine::default();
        assert_eq!(engine.sanitize_filename("My Document!"), "my_document_");
        assert_eq!(engine.sanitize_filename("Test 123"), "test_123");
        assert_eq!(engine.sanitize_filename("Contract@2024"), "contract_2024");
        assert_eq!(engine.sanitize_filename("A/B\\C:D"), "a_b_c_d");
    }

    #[tokio::test]
    async fn test_export_markdown() {
        let temp_dir = TempDir::new().unwrap();
        let engine = ExportEngine::new(temp_dir.path().to_string_lossy().to_string());
        let document = create_test_document();

        let result = engine.export(&document, ExportFormat::Markdown).await;
        assert!(result.is_ok());

        let export_result = result.unwrap();
        assert!(matches!(export_result.format, ExportFormat::Markdown));
        assert!(export_result.success);
        assert!(export_result.size > 0);

        // Verify file was created
        let path = std::path::Path::new(&export_result.path);
        assert!(path.exists());
        assert!(path.to_str().unwrap().ends_with(".md"));
    }

    #[tokio::test]
    async fn test_export_html() {
        let temp_dir = TempDir::new().unwrap();
        let engine = ExportEngine::new(temp_dir.path().to_string_lossy().to_string());
        let document = create_test_document();

        let result = engine.export(&document, ExportFormat::Html).await;
        assert!(result.is_ok());

        let export_result = result.unwrap();
        assert!(matches!(export_result.format, ExportFormat::Html));
        assert!(export_result.success);

        // Verify file content
        let path = std::path::Path::new(&export_result.path);
        let content = fs::read_to_string(path).unwrap();
        assert!(content.contains("<!DOCTYPE html>"));
        assert!(content.contains("Test Document"));
    }

    #[tokio::test]
    async fn test_export_text() {
        let temp_dir = TempDir::new().unwrap();
        let engine = ExportEngine::new(temp_dir.path().to_string_lossy().to_string());
        let document = create_test_document();

        let result = engine.export(&document, ExportFormat::Text).await;
        assert!(result.is_ok());

        let export_result = result.unwrap();
        assert!(matches!(export_result.format, ExportFormat::Text));
        assert!(export_result.path.ends_with(".txt"));
    }

    #[tokio::test]
    async fn test_export_json() {
        let temp_dir = TempDir::new().unwrap();
        let engine = ExportEngine::new(temp_dir.path().to_string_lossy().to_string());
        let document = create_test_document();

        let result = engine.export(&document, ExportFormat::Json).await;
        assert!(result.is_ok());

        let export_result = result.unwrap();
        assert!(matches!(export_result.format, ExportFormat::Json));

        // Verify valid JSON
        let path = std::path::Path::new(&export_result.path);
        let content = fs::read_to_string(path).unwrap();
        let parsed: serde_json::Value = serde_json::from_str(&content).unwrap();
        assert!(parsed.is_object());
    }

    #[tokio::test]
    async fn test_export_pdf_not_implemented() {
        let temp_dir = TempDir::new().unwrap();
        let engine = ExportEngine::new(temp_dir.path().to_string_lossy().to_string());
        let document = create_test_document();

        let result = engine.export(&document, ExportFormat::Pdf).await;
        assert!(result.is_err());
        assert!(result.unwrap_err().to_string().contains("not yet implemented"));
    }

    #[test]
    fn test_generate_markdown_content() {
        let engine = ExportEngine::default();
        let document = create_test_document();

        let result = engine.generate_markdown(&document);
        assert!(result.is_ok());

        let md = result.unwrap();
        assert!(md.contains("# Test Document"));
        assert!(md.contains("## Résumé Exécutif"));
        assert!(md.contains("This is a test summary"));
        assert!(md.contains("## Objectifs"));
        assert!(md.contains("- Objective 1"));
        assert!(md.contains("## Section 1"));
        assert!(md.contains("## Clauses Obligatoires"));
        assert!(md.contains("## Annexes"));
        assert!(md.contains("## Références"));
    }

    #[test]
    fn test_generate_html_content() {
        let engine = ExportEngine::default();
        let document = create_test_document();

        let result = engine.generate_html(&document);
        assert!(result.is_ok());

        let html = result.unwrap();
        assert!(html.contains("<!DOCTYPE html>"));
        assert!(html.contains("<html lang=\"fr\">"));
        assert!(html.contains("<h1>Test Document</h1>"));
        assert!(html.contains("Résumé Exécutif"));
        assert!(html.contains("</html>"));
    }

    #[test]
    fn test_generate_text_content() {
        let engine = ExportEngine::default();
        let document = create_test_document();

        let result = engine.generate_text(&document);
        assert!(result.is_ok());

        let text = result.unwrap();
        assert!(text.contains("Test Document"));
        assert!(text.contains("RÉSUMÉ EXÉCUTIF"));
        assert!(text.contains("Section 1"));
        assert!(text.contains("---")); // Section underline
    }

    #[test]
    fn test_format_section_markdown() {
        let engine = ExportEngine::default();
        let section = Section {
            title: "Test Section".to_string(),
            content: "Section content".to_string(),
            level: 1,
            subsections: vec![
                Section {
                    title: "Subsection".to_string(),
                    content: "Subsection content".to_string(),
                    level: 2,
                    subsections: vec![],
                    metadata: None,
                },
            ],
            metadata: None,
        };

        let md = engine.format_section_markdown(&section, 2);
        assert!(md.contains("## Test Section"));
        assert!(md.contains("Section content"));
        assert!(md.contains("### Subsection"));
    }

    #[test]
    fn test_format_section_html() {
        let engine = ExportEngine::default();
        let section = Section {
            title: "Test Section".to_string(),
            content: "Section content".to_string(),
            level: 2,
            subsections: vec![],
            metadata: None,
        };

        let html = engine.format_section_html(&section);
        assert!(html.contains("<h3>Test Section</h3>"));
        assert!(html.contains("<p>Section content</p>"));
    }

    #[test]
    fn test_format_section_text() {
        let engine = ExportEngine::default();
        let section = Section {
            title: "Test Section".to_string(),
            content: "Section content".to_string(),
            level: 1,
            subsections: vec![],
            metadata: None,
        };

        let text = engine.format_section_text(&section);
        assert!(text.contains("Test Section"));
        assert!(text.contains("------------")); // Title underline
        assert!(text.contains("Section content"));
    }

    #[tokio::test]
    async fn test_export_invalid_directory() {
        let engine = ExportEngine::new("/nonexistent/invalid/path".to_string());
        let document = create_test_document();

        let result = engine.export(&document, ExportFormat::Markdown).await;
        assert!(result.is_err());
    }

    #[tokio::test]
    async fn test_markdown_with_empty_optional_fields() {
        let temp_dir = TempDir::new().unwrap();
        let engine = ExportEngine::new(temp_dir.path().to_string_lossy().to_string());

        let mut document = create_test_document();
        document.content.objectives = vec![];
        document.content.mandatory_clauses = None;
        document.content.annexes = vec![];
        document.content.references = vec![];

        let result = engine.export(&document, ExportFormat::Markdown).await;
        assert!(result.is_ok());

        let path = std::path::Path::new(&result.unwrap().path);
        let content = fs::read_to_string(path).unwrap();
        assert!(!content.contains("## Objectifs"));
        assert!(!content.contains("## Clauses Obligatoires"));
        assert!(!content.contains("## Annexes"));
        assert!(!content.contains("## Références"));
    }
}
