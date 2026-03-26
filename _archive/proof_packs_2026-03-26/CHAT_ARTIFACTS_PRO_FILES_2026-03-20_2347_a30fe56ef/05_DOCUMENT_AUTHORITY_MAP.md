# 05_DOCUMENT_AUTHORITY_MAP
Candidates identified:
- chat export builders in src/features/chat/exportImport.ts
- duplicate builders in src/features/conversation/exportImport.ts
- backend document model in src-tauri/src/doc_engine/export.rs

Assessment:
- unique source-of-truth: NO (fragmented)
- duplicated builders: YES (chat vs conversation modules)
- editor-backed authority: NO
- export-safe authority: PARTIAL
- professional-grade capable: UNPROVEN

Gate impact: DOCUMENT_AUTHORITY_FRAGMENTED
