# 21_DOCUMENT_AUTHORITY_DELTA
## Active authorities (this cycle)
1. `ProfessionalDocumentManifest` in src/features/chat/artifactIntent.ts
- canonical for chat-file-intent branch: YES
- duplicate risk: LOW inside chat route
- export-safe: PARTIAL
- editor-safe: PARTIAL
- chat-attachable: YES

2. Legacy export builders in src/features/chat/exportImport.ts and src/features/conversation/exportImport.ts
- canonical for chat intent routing: NO
- role: save/export helpers only
- conflict risk: MEDIUM (duplication retained)

3. Backend doc engine src-tauri/src/doc_engine/export.rs
- canonical for backend render/export, not for live chat intent routing

## Delta verdict
- Minimal canonical authority established for chat file-intent flow.
- Global project authority still fragmented across legacy and backend paths.
