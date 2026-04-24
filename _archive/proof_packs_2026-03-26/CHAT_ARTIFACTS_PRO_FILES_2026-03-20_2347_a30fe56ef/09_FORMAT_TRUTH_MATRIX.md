# 09_FORMAT_TRUTH_MATRIX

| Format   | Byte Truth | Renderer Truth             | Save Truth           | Verdict |
| -------- | ---------- | -------------------------- | -------------------- | ------- |
| Markdown | YES        | YES                        | YES (Tauri+fallback) | PASS    |
| JSON     | YES        | YES                        | YES (Tauri+fallback) | PASS    |
| DOCX     | NO         | NO canonical renderer      | NO                   | BLOCKED |
| PDF      | NO (stub)  | export_pdf not implemented | NO                   | BLOCKED |
