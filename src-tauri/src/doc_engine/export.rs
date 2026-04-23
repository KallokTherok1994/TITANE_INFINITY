// Module d'export multi-format

use super::*;
use docx_rs::{Docx, Paragraph, Run};
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
            ExportFormat::Docx => self.export_docx(document).await,
        }
    }

    async fn export_markdown(&self, document: &Document) -> Result<ExportResult> {
        let content = self.generate_markdown(document)?;
        let filename = format!("{}.md", self.sanitize_filename(&document.metadata.title));
        let path = Path::new(&self.output_dir).join(&filename);

        fs::write(&path, content).map_err(|e| {
            DocEngineError::ExportError(format!("Erreur d'écriture Markdown: {}", e))
        })?;

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
        md.push_str(&format!(
            "**Version:** {} | **Date:** {}\n\n",
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
        html.push_str(&format!(
            "    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n"
        ));
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
        html.push_str(&format!(
            "        <strong>Version:</strong> {} | <strong>Date:</strong> {}\n",
            document.metadata.version,
            document.metadata.created_at.format("%Y-%m-%d")
        ));
        html.push_str("    </div>\n");

        html.push_str(&format!(
            "    <h2>Résumé Exécutif</h2>\n    <p>{}</p>\n",
            document.content.executive_summary
        ));

        // Sections
        for section in &document.content.sections {
            html.push_str(&self.format_section_html(section));
        }

        html.push_str("</body>\n</html>");

        Ok(html)
    }

    fn format_section_html(&self, section: &Section) -> String {
        let heading_level = (section.level + 1).min(6);
        format!(
            "    <div class=\"section\">\n        <h{}>{}</h{}>\n        <p>{}</p>\n    </div>\n",
            heading_level, section.title, heading_level, section.content
        )
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
        text.push_str(&format!(
            "Version: {} | Date: {}\n\n",
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
        format!(
            "{}\n{}\n\n{}\n\n",
            section.title,
            "-".repeat(section.title.len()),
            section.content
        )
    }

    async fn export_json(&self, document: &Document) -> Result<ExportResult> {
        let content = serde_json::to_string_pretty(document).map_err(|e| {
            DocEngineError::ExportError(format!("Erreur sérialisation JSON: {}", e))
        })?;

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
        Err(DocEngineError::ExportError(
            "PDF export not yet implemented".to_string(),
        ))
    }

    async fn export_docx(&self, document: &Document) -> Result<ExportResult> {
        let filename = format!("{}.docx", self.sanitize_filename(&document.metadata.title));
        let path = Path::new(&self.output_dir).join(&filename);

        let mut docx = Docx::new();
        docx = docx.add_paragraph(
            Paragraph::new().add_run(Run::new().add_text(&document.content.title).bold()),
        );
        docx = docx.add_paragraph(Paragraph::new().add_run(Run::new().add_text(format!(
            "Version: {} | Date: {}",
            document.metadata.version,
            document.metadata.created_at.format("%Y-%m-%d")
        ))));
        docx = docx.add_paragraph(Paragraph::new().add_run(Run::new().add_text("Résumé Exécutif")));
        docx = docx.add_paragraph(
            Paragraph::new().add_run(Run::new().add_text(&document.content.executive_summary)),
        );

        if !document.content.objectives.is_empty() {
            docx = docx.add_paragraph(Paragraph::new().add_run(Run::new().add_text("Objectifs")));
            for objective in &document.content.objectives {
                docx = docx.add_paragraph(
                    Paragraph::new().add_run(Run::new().add_text(format!("- {}", objective))),
                );
            }
        }

        for section in &document.content.sections {
            docx = docx
                .add_paragraph(Paragraph::new().add_run(Run::new().add_text(&section.title).bold()))
                .add_paragraph(Paragraph::new().add_run(Run::new().add_text(&section.content)));
        }

        let file = fs::File::create(&path)
            .map_err(|e| DocEngineError::ExportError(format!("Erreur création DOCX: {}", e)))?;

        docx.build()
            .pack(file)
            .map_err(|e| DocEngineError::ExportError(format!("Erreur écriture DOCX: {}", e)))?;

        Ok(ExportResult {
            format: ExportFormat::Docx,
            path: path.to_string_lossy().to_string(),
            size: path.metadata().map(|m| m.len()).unwrap_or(0),
            success: true,
        })
    }

    fn sanitize_filename(&self, title: &str) -> String {
        title
            .chars()
            .map(|c| {
                if c.is_alphanumeric() || c == ' ' {
                    c
                } else {
                    '_'
                }
            })
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
    use chrono::Utc;
    use std::collections::HashMap;
    use tempfile::tempdir;

    #[tokio::test]
    async fn export_docx_writes_file() {
        let temp = tempdir().expect("tempdir");
        let engine = ExportEngine::new(temp.path().to_string_lossy().to_string());

        let document = Document {
            metadata: DocumentMetadata {
                id: "doc-1".to_string(),
                title: "Contrat Test".to_string(),
                version: "1.0.0".to_string(),
                created_at: Utc::now(),
                updated_at: Utc::now(),
                author: "TITANE".to_string(),
                tags: vec!["test".to_string()],
                category: "legal".to_string(),
            },
            config: GenerationConfig {
                doc_type: DocumentType::Contract,
                style: DocumentStyle::Legal,
                detail_level: DetailLevel::Standard,
                tone: "formal".to_string(),
                language: "fr".to_string(),
                custom_params: HashMap::new(),
            },
            content: DocumentContent {
                title: "Contrat Test".to_string(),
                executive_summary: "Résumé de validation DOCX".to_string(),
                objectives: vec!["Objectif 1".to_string()],
                sections: vec![Section {
                    id: "section_1".to_string(),
                    title: "Section Principale".to_string(),
                    content: "Contenu de section".to_string(),
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
        };

        let result = engine
            .export(&document, ExportFormat::Docx)
            .await
            .expect("docx export should succeed");

        assert!(result.success);
        assert!(result.path.ends_with(".docx"));
        assert!(Path::new(&result.path).exists());
        assert!(result.size > 0);
    }
}
