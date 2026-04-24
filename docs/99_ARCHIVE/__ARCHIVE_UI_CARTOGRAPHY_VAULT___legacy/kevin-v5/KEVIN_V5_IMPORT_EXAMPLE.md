# KEVIN V5 BASELINE IMPORT EXAMPLES
**Version:** v1.0  
**Authority:** TITANE∞ Governance Protocol  
**Purpose:** Provide clear examples of valid and invalid Kevin V5 imports  
**Last Updated:** 2026-02-08

---

## OVERVIEW

This document provides concrete examples to remove ambiguity for future operators or agents importing Kevin V5 baseline.

---

## EXAMPLE 1: VALID DIRECTORY TREE (Markdown)

### Directory Structure
```
docs/reference/kevin-v5/
├── KEVIN_V5_IMPORT_SPEC.md           (spec - ignore)
├── KEVIN_V5_IMPORT_CHECKLIST.md     (checklist - ignore)
├── KEVIN_V5_IMPORT_EXAMPLE.md       (this file - ignore)
└── kevin-v5-ui-cartography.md       ✅ BASELINE FILE (valid)
```

### File: kevin-v5-ui-cartography.md
```markdown
# Kevin V5 UI Cartography
**Version:** v5.0
**Date:** 2025-12-15
**Scope:** Frontend UI - TITANE∞

## Navigation

### TopNav Sections
- TITANE (8 tabs)
- DEV (9 tabs)
- ADMIN (5 tabs)
- STATS (4 panels)

## Components

### Major Components
1. Chat Interface (MessageBubble, InputBox)
2. Cognitive Layout (Helios/Nexus modes)
3. Console Monitor (diagnostic widget)

## Known Issues

### P1 Issues
- UI-001: Silent IPC failures in error handlers
- UI-002: Unknown/NaN display in metrics

### P2 Issues
- UI-003: Tab overflow (>8 tabs breaks navigation)
```

**Result:** ✅ **VALID** - Contains substantive UI cartography content

---

## EXAMPLE 2: VALID DIRECTORY TREE (PDF)

### Directory Structure
```
docs/reference/kevin-v5/
├── KEVIN_V5_IMPORT_SPEC.md
├── KEVIN_V5_IMPORT_CHECKLIST.md
├── KEVIN_V5_IMPORT_EXAMPLE.md
└── kevin-v5-screens-2025-12.pdf     ✅ BASELINE FILE (valid)
```

### File: kevin-v5-screens-2025-12.pdf
**Content Preview:**
- 12 pages
- Screenshots of 8 major screens
- Navigation flow diagram
- Component hierarchy chart
- Readable text (not scanned image)

**Result:** ✅ **VALID** - Contains visual UI documentation with extractable text

---

## EXAMPLE 3: VALID DIRECTORY TREE (ZIP)

### Directory Structure
```
docs/reference/kevin-v5/
├── KEVIN_V5_IMPORT_SPEC.md
├── KEVIN_V5_IMPORT_CHECKLIST.md
├── KEVIN_V5_IMPORT_EXAMPLE.md
├── TITANE_UI_CARTOGRAPHY_v5.zip     ✅ BASELINE FILE (valid)
└── extracted/                        (created after extraction)
    ├── navigation.md
    ├── components.md
    ├── issues.md
    └── screenshots/
        ├── screen-01.png
        └── screen-02.png
```

### ZIP Contents
- Multiple markdown files with UI documentation
- Screenshots folder with actual images
- Extracts without errors

**Result:** ✅ **VALID** - Contains multiple files with comprehensive content

---

## EXAMPLE 4: VALID DIRECTORY TREE (Multiple Files)

### Directory Structure
```
docs/reference/kevin-v5/
├── KEVIN_V5_IMPORT_SPEC.md
├── KEVIN_V5_IMPORT_CHECKLIST.md
├── KEVIN_V5_IMPORT_EXAMPLE.md
├── kevin-v5-navigation.md           ✅ BASELINE FILE
├── kevin-v5-components.pdf          ✅ BASELINE FILE
└── kevin-v5-issues.docx             ✅ BASELINE FILE
```

**Result:** ✅ **VALID** - Multiple files of different formats are allowed and will be processed together

---

## EXAMPLE 5: INVALID - Empty Folder

### Directory Structure
```
docs/reference/kevin-v5/
├── KEVIN_V5_IMPORT_SPEC.md
├── KEVIN_V5_IMPORT_CHECKLIST.md
└── KEVIN_V5_IMPORT_EXAMPLE.md
```

**Problem:** No baseline files present (only spec docs)

**Checklist Result:**
- ❌ Item 1 FAIL: Folder empty (no baseline files)
- ❌ Item 2 FAIL: No valid files

**Remediation:** Add at least one baseline file

---

## EXAMPLE 6: INVALID - Placeholder Content

### Directory Structure
```
docs/reference/kevin-v5/
├── KEVIN_V5_IMPORT_SPEC.md
├── KEVIN_V5_IMPORT_CHECKLIST.md
├── KEVIN_V5_IMPORT_EXAMPLE.md
└── kevin-v5-template.md             ❌ INVALID
```

### File: kevin-v5-template.md
```markdown
# Kevin V5 UI Cartography Template

## Section 1
Lorem ipsum dolor sit amet, consectetur adipiscing elit.

## Section 2
TODO: Add navigation information

## Section 3
PLACEHOLDER: Component list goes here
```

**Problem:** Placeholder/template content only, no actual data

**Checklist Result:**
- ❌ Item 5 FAIL: Is a placeholder (Lorem ipsum, TODO, PLACEHOLDER)

**Remediation:** Replace with substantive content

---

## EXAMPLE 7: INVALID - Link-Only Document

### Directory Structure
```
docs/reference/kevin-v5/
├── KEVIN_V5_IMPORT_SPEC.md
├── KEVIN_V5_IMPORT_CHECKLIST.md
├── KEVIN_V5_IMPORT_EXAMPLE.md
└── kevin-v5-reference.md            ❌ INVALID
```

### File: kevin-v5-reference.md
```markdown
# Kevin V5 UI Cartography

The complete documentation is available at:
https://example.com/kevin-v5-docs

See also:
- https://example.com/navigation
- https://example.com/components
```

**Problem:** Only contains external links, no embedded content

**Checklist Result:**
- ❌ Item 6 FAIL: Link-only document (no embedded content)

**Remediation:** Embed actual content in the file

---

## EXAMPLE 8: INVALID - Password-Protected PDF

### Directory Structure
```
docs/reference/kevin-v5/
├── KEVIN_V5_IMPORT_SPEC.md
├── KEVIN_V5_IMPORT_CHECKLIST.md
├── KEVIN_V5_IMPORT_EXAMPLE.md
└── kevin-v5-secure.pdf              ❌ INVALID
```

**Test:**
```bash
pdftotext kevin-v5-secure.pdf -
# Error: Password required
```

**Problem:** PDF is password-protected, cannot extract text

**Checklist Result:**
- ❌ Item 4 FAIL: Content not readable (password-protected)

**Remediation:** Remove password protection or provide password-free version

---

## EXAMPLE 9: INVALID - Corrupted ZIP

### Directory Structure
```
docs/reference/kevin-v5/
├── KEVIN_V5_IMPORT_SPEC.md
├── KEVIN_V5_IMPORT_CHECKLIST.md
├── KEVIN_V5_IMPORT_EXAMPLE.md
└── kevin-v5-cartography.zip         ❌ INVALID
```

**Test:**
```bash
unzip -t kevin-v5-cartography.zip
# Error: invalid or corrupted zip file
```

**Problem:** ZIP file is corrupted, cannot extract

**Checklist Result:**
- ❌ Item 4 FAIL: Content not readable (corrupted file)

**Remediation:** Re-download or re-create ZIP file

---

## EXAMPLE 10: INVALID - Wrong Directory

### Directory Structure
```
docs/reference/
├── kevin-v5-ui-cartography.md       ❌ WRONG LOCATION
└── kevin-v5/
    ├── KEVIN_V5_IMPORT_SPEC.md
    ├── KEVIN_V5_IMPORT_CHECKLIST.md
    └── KEVIN_V5_IMPORT_EXAMPLE.md
```

**Problem:** Baseline file is in parent directory, not in `kevin-v5/`

**Checklist Result:**
- ❌ Item 8 FAIL: Directory structure invalid

**Remediation:** Move file to `docs/reference/kevin-v5/`

---

## METADATA HEADER EXAMPLES

### Example: Good Metadata (Markdown)
```markdown
# Kevin V5 UI Cartography
**Version:** v5.0
**External Baseline:** True
**Date:** 2025-12-15
**Scope:** Frontend UI
**Language:** French + English technical terms

## Content begins here...
```

### Example: Minimal Metadata (Markdown)
```markdown
# TITANE UI Cartography V5

Navigation structure and component inventory.

## TopNav...
```

**Note:** Metadata header is optional but recommended for clarity.

---

## FILE NAMING EXAMPLES

### Valid Names
✅ `kevin-v5-ui-cartography.md`  
✅ `kevin-v5-screens-2025-12.pdf`  
✅ `kevin-v5-components.docx`  
✅ `TITANE_UI_CARTOGRAPHY_v5.zip`  
✅ `TITANE_V5_NAVIGATION.md`  
✅ `ui-cartography-v5-kevin.md` (less clear but acceptable)

### Invalid Names
❌ `cartography.md` (no version indicator)  
❌ `kevin-v6-ui.md` (wrong version)  
❌ `titane-ui.txt` (wrong format)  
❌ `documentation.pdf` (too generic)

**Rule:** Name should indicate "Kevin" or "V5" or both, and have accepted extension.

---

## COMMON PITFALLS

### Pitfall 1: Only Spec Docs Present
**Mistake:** Only `KEVIN_V5_IMPORT_*.md` files are in directory (spec docs)  
**Fix:** Add actual baseline files (not just spec docs)

### Pitfall 2: Content in Wrong Folder
**Mistake:** Files are in `docs/reference/` or `docs/kevin-v5/` instead of `docs/reference/kevin-v5/`  
**Fix:** Move to correct location

### Pitfall 3: Partially Downloaded File
**Mistake:** ZIP or PDF file is incomplete (interrupted download)  
**Fix:** Re-download complete file

### Pitfall 4: Old Word Format
**Mistake:** File is `.doc` (Word 97-2003) instead of `.docx` (Word 2007+)  
**Fix:** Convert to modern `.docx` format

### Pitfall 5: Scanned PDF (Image-Only)
**Mistake:** PDF contains scanned images with no extractable text  
**Fix:** Run OCR or provide text-based PDF

---

## DECISION TABLE

| Scenario | Folder Empty? | Valid Format? | Readable? | Placeholder? | Link-Only? | Result |
|----------|---------------|---------------|-----------|--------------|------------|--------|
| Example 1 | No | Yes (.md) | Yes | No | No | ✅ VALID |
| Example 2 | No | Yes (.pdf) | Yes | No | No | ✅ VALID |
| Example 3 | No | Yes (.zip) | Yes | No | No | ✅ VALID |
| Example 4 | No | Yes (multi) | Yes | No | No | ✅ VALID |
| Example 5 | Yes | N/A | N/A | N/A | N/A | ❌ INVALID |
| Example 6 | No | Yes (.md) | Yes | Yes | No | ❌ INVALID |
| Example 7 | No | Yes (.md) | Yes | No | Yes | ❌ INVALID |
| Example 8 | No | Yes (.pdf) | No | N/A | N/A | ❌ INVALID |
| Example 9 | No | Yes (.zip) | No | N/A | N/A | ❌ INVALID |
| Example 10 | No | Yes (.md) | Yes | No | No | ❌ INVALID (wrong location) |

---

## REFERENCES

- **Import Spec:** `KEVIN_V5_IMPORT_SPEC.md`
- **Import Checklist:** `KEVIN_V5_IMPORT_CHECKLIST.md`
- **Delta Protocol:** `docs/ui-carto-copilot/70-compare/DELTA_RUNNER_PROTOCOL.md`

---

**END OF EXAMPLES**
