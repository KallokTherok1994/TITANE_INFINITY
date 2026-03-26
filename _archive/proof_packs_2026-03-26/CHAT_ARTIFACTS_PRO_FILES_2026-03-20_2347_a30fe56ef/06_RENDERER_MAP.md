# 06_RENDERER_MAP
- Markdown renderer: src-tauri/src/doc_engine/export.rs generate_markdown() -> PROVEN_RUNTIME
- HTML renderer: src-tauri/src/doc_engine/export.rs generate_html() -> PROVEN_RUNTIME
- JSON renderer: src-tauri/src/doc_engine/export.rs export_json() -> PROVEN_RUNTIME
- Text renderer: src-tauri/src/doc_engine/export.rs generate_text() -> PROVEN_RUNTIME
- PDF renderer: export_pdf() returns not implemented -> FORMAT_UNPROVEN
- DOCX renderer: absent in doc_engine export path -> FORMAT_UNPROVEN
- Frontend conversation markdown/json export: src/features/chat/exportImport.ts -> PROVEN_RUNTIME
