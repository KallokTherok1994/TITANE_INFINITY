# TITANE∞ — Glossary FR/EN Lock

**Version:** 28.0.0  
**Status:** DOC_ONLY  
**Date:** 2026-03-17

> This file locks the canonical bilingual mapping of critical TITANE∞ terms.
> All documentation (FR and EN) must use these exact terms consistently.

---

## Canonical term mapping

| English term              | French term                  | Notes                                                   |
| ------------------------- | ---------------------------- | ------------------------------------------------------- |
| online-first governed     | online-first gouverné        | Core doctrine term — never translate differently        |
| Tauri-only                | Tauri-only                   | Proper noun — not translated                            |
| 4-Ring                    | 4-Ring                       | Architecture model — not translated                     |
| proof-driven              | piloté par la preuve         | OR: proof-driven (acceptable in FR tech docs)           |
| governance gates          | gates de gouvernance         | "gates" kept in FR as technical term                    |
| proof pack                | pack de preuves              | OR: proof pack (acceptable in FR)                       |
| append-only registry      | registre append-only         | "append-only" kept in FR as technical term              |
| degraded mode             | mode dégradé                 | —                                                       |
| honest fallback           | fallback honnête             | —                                                       |
| canonical source of truth | source canonique de vérité   | —                                                       |
| legacy doc                | doc legacy                   | OR: document legacy                                     |
| controlled boundary       | frontière contrôlée          | —                                                       |
| user-facing               | orienté utilisateur          | OR: user-facing (acceptable in FR tech docs)            |
| runtime-proven            | runtime-proven               | Technical status — kept in EN in FR docs                |
| doc-only                  | DOC_ONLY                     | Status label — always uppercase in both languages       |
| stop-the-line             | stop-the-line                | Governance term — not translated                        |
| mandatory local fallback  | fallback local obligatoire   | —                                                       |
| IPC contract              | contrat IPC                  | —                                                       |
| allowlist                 | allowlist                    | Technical term — not translated                         |
| AutoHeal                  | AutoHeal                     | Proper noun — not translated                            |
| detect_recurrence         | detect_recurrence            | Script name — not translated                            |
| rollback                  | rollback                     | Technical term — not translated                         |
| proof pack                | proof pack / pack de preuves | Both acceptable                                         |
| PROVEN                    | PROVEN                       | Status label — always in uppercase EN in both languages |
| QUALIFIED                 | QUALIFIED                    | Status label — always in uppercase EN in both languages |
| PARTIAL                   | PARTIAL                      | Status label — always in uppercase EN in both languages |
| BLOCKED                   | BLOCKED                      | Status label — always in uppercase EN in both languages |
| LEGACY                    | LEGACY                       | Status label — always in uppercase EN in both languages |
| DOC_ONLY                  | DOC_ONLY                     | Status label — always in uppercase EN in both languages |
| PLANNED                   | PLANNED                      | Status label — always in uppercase EN in both languages |
| Ring 1                    | Ring 1                       | Architecture layer — not translated                     |
| Ring 2                    | Ring 2                       | Architecture layer — not translated                     |
| Ring 3                    | Ring 3                       | Architecture layer — not translated                     |
| Ring 4                    | Ring 4                       | Architecture layer — not translated                     |
| compatibility marker      | marqueur de compatibilité    | Used for "local-first" label classification             |
| verify_instructions       | verify_instructions          | Script name — not translated                            |
| PASS                      | PASS                         | Gate result — not translated                            |
| FAIL                      | FAIL                         | Gate result — not translated                            |

---

## Rules for status labels

Status labels are ALWAYS written in uppercase English in both FR and EN documentation:

```
✅ PROVEN    ✅ QUALIFIED    ✅ PARTIAL    ✅ BLOCKED
✅ LEGACY    ✅ DOC_ONLY     ✅ PLANNED
```

Do NOT translate status labels to French.

---

## Rules for "local-first"

The term "local-first" in TITANE∞ documentation has a specific meaning:

- **In newer docs (≥ 28.0.0):** "local-first" = compatibility marker only. The doctrine is "online-first governed with mandatory local fallback".
- **In older docs (legacy):** "local-first" or "100% local" = outdated description. These docs must have LEGACY banners.

---

_Generated: 2026-03-17 | Authority: docs canon session_
