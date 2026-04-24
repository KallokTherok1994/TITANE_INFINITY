# KEVIN V5 BASELINE IMPORT SPECIFICATION
**Version:** v1.0  
**Authority:** TITANE∞ Governance Protocol  
**Purpose:** Define acceptance criteria for Kevin V5 baseline import  
**Last Updated:** 2026-02-08

---

## OVERVIEW

This specification defines EXACTLY what constitutes a valid Kevin V5 baseline import for delta comparison with TITANE∞ UI Cartography V6.1.

**Critical Rule:** Kevin V5 is treated as an **EXTERNAL BASELINE** for comparison purposes only. It does NOT override TITANE∞ governance, architecture decisions, or constitutional rules.

---

## A) ACCEPTED FORMATS

The following file formats are accepted for Kevin V5 baseline:

| Format | Extension | Requirements |
|--------|-----------|--------------|
| **Markdown** | `.md` | UTF-8 encoded, standard Markdown syntax |
| **PDF** | `.pdf` | Readable (no password protection), text-extractable |
| **ZIP Archive** | `.zip` | Must extract without errors, may contain multiple files |
| **Word Document** | `.docx` | Modern format (Office 2007+), readable |

**Multiple Files:** Multiple files of different formats are allowed. They will be processed together as a combined baseline.

**Not Accepted:**
- ❌ Binary formats without text extraction (e.g., encrypted PDFs)
- ❌ Proprietary formats requiring special software
- ❌ Files requiring authentication to access
- ❌ Corrupted or partially downloaded files

---

## B) REQUIRED MINIMUM CONTENT

Kevin V5 baseline must contain **AT LEAST ONE** of the following content categories:

### Category 1: UI Cartography / Screens / Navigation
- Screen inventories
- Navigation flows
- Route mappings
- Menu structures
- Tab organizations

### Category 2: Components or Architecture
- Component inventories
- Component responsibilities
- Design system documentation
- Architectural patterns
- Widget catalogs

### Category 3: Issues / Findings
- Known issues register
- Bug reports
- Non-conformities
- Technical debt
- Risk assessments

**Quality Threshold:**
- Content must be substantive (not just headers/outlines)
- At least 5 distinct UI elements, components, or issues documented
- Clear structure (headers, tables, or organized lists)

**Insufficient Content Examples:**
- ❌ Only a title and placeholder text
- ❌ "Coming soon" or "To be completed"
- ❌ Less than 1 page of actual content
- ❌ Purely theoretical without concrete examples

---

## C) FORBIDDEN STATES

The following states are **NOT ACCEPTABLE** and will cause import to fail:

### 1. Empty Folder
- `docs/reference/kevin-v5/` contains 0 files
- All files are hidden (starting with `.`)

### 2. Placeholder Files
- Files containing only Lorem Ipsum text
- Template-only files with no filled content
- Files with generic "Example" or "Sample" headers without real data
- Files marked as "Draft" or "Work in Progress" with no substantive content

### 3. Links Without Content
- Files containing only URLs or hyperlinks
- "See: [external link]" with no embedded content
- Reference-only documents pointing elsewhere
- Shortcuts or symbolic links (must be actual files)

**Validation:**
```bash
# Example check for empty folder
file_count=$(find docs/reference/kevin-v5/ -type f -not -name ".*" | wc -l)
if [ "$file_count" -eq 0 ]; then
  echo "❌ FAIL: Empty folder"
  exit 1
fi
```

---

## D) NAMING CONVENTIONS

### Recommended Naming Pattern

**Primary Pattern:**
```
kevin-v5-{category}-{optional-date}.{ext}
```

**Examples:**
- `kevin-v5-ui-cartography.md`
- `kevin-v5-screens-2025-12.pdf`
- `kevin-v5-components.docx`
- `kevin-v5-findings-dec2025.md`

### Alternative Accepted Patterns

**Legacy Pattern:**
```
TITANE_UI_CARTOGRAPHY_v5.{ext}
TITANE_V5_{CATEGORY}.{ext}
```

**Examples:**
- `TITANE_UI_CARTOGRAPHY_v5.zip`
- `TITANE_V5_COMPONENTS.pdf`

### Metadata Header (Optional but Recommended)

If using Markdown, include a metadata header:

```markdown
# Kevin V5 UI Cartography
**Version:** v5.0
**Author:** External Baseline
**Date:** 2025-12-15
**Scope:** Frontend UI
```

**Required Fields (if header present):**
- Version or identifier indicating "V5"
- Scope indication (UI, Frontend, Cartography)

**Optional Fields:**
- Date
- Author/Source (generic, not personal names per GOV-NO-HUMAN-IDENTITY-ATTRIBUTION)
- Language

---

## E) INTEGRITY RULES

### Rule 1: Files Must Be Readable

**For PDF:**
```bash
# Check if PDF is readable
pdftotext kevin-v5-file.pdf - | head -10
# Must produce text output, not error
```

**For ZIP:**
```bash
# Check if ZIP is valid
unzip -t kevin-v5-file.zip
# Must complete without errors
```

**For DOCX:**
```bash
# Check if DOCX is valid (requires libreoffice or similar)
file kevin-v5-file.docx
# Must show "Microsoft Word 2007+"
```

### Rule 2: ZIP Must Extract Without Errors

**Extraction Process:**
```bash
# Extract to subdirectory
mkdir -p docs/reference/kevin-v5/extracted/
unzip kevin-v5-file.zip -d docs/reference/kevin-v5/extracted/

# Verify extraction
if [ $? -ne 0 ]; then
  echo "❌ FAIL: ZIP extraction failed"
  exit 1
fi
```

### Rule 3: Language May Differ, Structure Must Be Inferable

**Acceptable:**
- French, English, or mixed language content
- Technical terms in English within French prose
- Bilingual headers

**Required:**
- Clear section headers (recognizable structure)
- Tables, lists, or organized data (not just paragraphs)
- Key terms identifiable (e.g., "Navigation", "Composants", "Issues")

**Inference Rules:**
- Headers in French → map to English equivalents during normalization
- Technical terms (e.g., "React", "IPC", "Tauri") → universal
- Structured data (tables, JSON, YAML) → language-agnostic

---

## F) AUTHORITY RULE (CRITICAL)

### Kevin V5 as External Baseline

**Status:** Kevin V5 is an **EXTERNAL BASELINE** for comparison purposes.

**Authority Hierarchy:**
1. **TITANE∞ Governance** (highest)
2. **TITANE∞ V6 Cartography** (current state)
3. **Kevin V5** (historical baseline, input only)

**What Kevin V5 Can Do:**
- ✅ Provide historical context for delta comparison
- ✅ Identify differences (MISSING, EXTRA, DIVERGENT)
- ✅ Inform decisions via UI_ARBITRATION_LOG.md updates
- ✅ Serve as reference for UX insights

**What Kevin V5 CANNOT Do:**
- ❌ Override TITANE∞ constitutional rules
- ❌ Override architectural freeze decisions
- ❌ Modify TITANE∞ V6 cartography directly
- ❌ Change governance authority labels
- ❌ Bypass freeze gates or arbitration process

**Decision Protocol:**
- If Kevin V5 conflicts with TITANE∞ V6 → **V6 wins unless explicitly re-arbitrated**
- If Kevin V5 identifies new issues → **Add to UI_ARBITRATION_LOG.md for decision**
- If Kevin V5 suggests changes → **Requires CHANGE_CONTROL_TEMPLATE.md**

### Non-Override Examples

**Example 1: Router Difference**
- Kevin V5 shows: "Uses React Router v6"
- TITANE∞ V6 shows: "Uses AppRoutes.tsx (custom)"
- **Result:** DIVERGENT (documented), V6 wins (no change unless arbitrated)

**Example 2: Component Count**
- Kevin V5 shows: "150 components"
- TITANE∞ V6 shows: "296 components"
- **Result:** EXTRA components in V6 (documented), normal evolution

**Example 3: Issue Identification**
- Kevin V5 shows: "Known issue: Silent IPC failures"
- TITANE∞ V6 shows: NC-UI-SILENCE-EXEMPT-001 (governed exception)
- **Result:** Issue acknowledged and governed (no action needed)

---

## VALIDATION SEQUENCE

**Before Delta Execution:**

1. **Check folder exists:**
   ```bash
   [ -d "docs/reference/kevin-v5/" ] || exit 1
   ```

2. **Check not empty:**
   ```bash
   file_count=$(find docs/reference/kevin-v5/ -type f | wc -l)
   [ "$file_count" -gt 0 ] || exit 1
   ```

3. **Check format accepted:**
   ```bash
   # At least one accepted format
   ls docs/reference/kevin-v5/*.{md,pdf,zip,docx} 2>/dev/null | wc -l
   ```

4. **Check content not placeholder:**
   ```bash
   # Manual review or grep for "Lorem ipsum", "TODO", "PLACEHOLDER"
   ```

5. **Check readability:**
   ```bash
   # Test extraction/reading of each file
   ```

6. **Run KEVIN_V5_IMPORT_CHECKLIST.md:**
   - Verify all 8 items PASS

**If ALL Pass:**
- Proceed to DELTA_RUNNER_PROTOCOL.md execution

**If ANY Fail:**
- STOP
- Document failure in VERIFICATION/DELTA_BLOCKED_LOG.md
- Do NOT modify Gate F status
- Do NOT execute delta comparison

---

## REFERENCES

- **Import Checklist:** `docs/reference/kevin-v5/KEVIN_V5_IMPORT_CHECKLIST.md`
- **Import Examples:** `docs/reference/kevin-v5/KEVIN_V5_IMPORT_EXAMPLE.md`
- **Delta Protocol:** `docs/ui-carto-copilot/70-compare/DELTA_RUNNER_PROTOCOL.md`
- **Governance Rules:** `docs/ui-carto-copilot/GOVERNANCE_RULES.md`

---

**END OF SPECIFICATION**
