# KEVIN V5 BASELINE IMPORT CHECKLIST
**Version:** v1.0  
**Authority:** TITANE∞ Governance Protocol  
**Purpose:** Verification checklist for Kevin V5 baseline import  
**Last Updated:** 2026-02-08

---

## CHECKLIST ITEMS

Use this checklist to verify Kevin V5 baseline before executing delta comparison.

**Criteria:** ALL items must PASS before proceeding to DELTA_RUNNER_PROTOCOL.md execution.

---

### ☐ Item 1: Folder Not Empty

**Check:**
```bash
file_count=$(find docs/reference/kevin-v5/ -type f -not -name ".*" -not -name "KEVIN_V5_*.md" | wc -l)
echo "Files found: $file_count"
```

**Pass Criteria:** `file_count > 0` (at least 1 baseline file, excluding spec docs)

**Status:** [ ] PASS / [ ] FAIL

**Note:** _______________________________________________

---

### ☐ Item 2: At Least 1 Valid File

**Check:**
```bash
ls -lh docs/reference/kevin-v5/*.{md,pdf,zip,docx} 2>/dev/null
```

**Pass Criteria:** At least one file with accepted extension (.md, .pdf, .zip, .docx)

**Status:** [ ] PASS / [ ] FAIL

**Note:** _______________________________________________

---

### ☐ Item 3: File Format Accepted

**Check:** Verify each file has an accepted extension

**Accepted Formats:**
- ✅ `.md` (Markdown)
- ✅ `.pdf` (PDF)
- ✅ `.zip` (ZIP)
- ✅ `.docx` (Word)

**Not Accepted:**
- ❌ `.txt`, `.rtf`, `.doc` (old format), `.pages`, etc.

**Status:** [ ] PASS / [ ] FAIL

**Note:** _______________________________________________

---

### ☐ Item 4: Content Readable

**Check:**

**For PDF:**
```bash
pdftotext docs/reference/kevin-v5/kevin-v5-*.pdf - | head -20
# Should produce readable text
```

**For ZIP:**
```bash
unzip -t docs/reference/kevin-v5/*.zip
# Should complete without errors
```

**For DOCX:**
```bash
file docs/reference/kevin-v5/*.docx
# Should show "Microsoft Word 2007+"
```

**For MD:**
```bash
head -20 docs/reference/kevin-v5/*.md
# Should show readable markdown
```

**Pass Criteria:** Files open/extract without errors, text is extractable

**Status:** [ ] PASS / [ ] FAIL

**Note:** _______________________________________________

---

### ☐ Item 5: Not a Placeholder

**Check:** Open file and verify it contains substantive content

**Red Flags:**
- ❌ Lorem ipsum dolor sit amet...
- ❌ "This is a template"
- ❌ "TODO: Add content"
- ❌ "PLACEHOLDER"
- ❌ "Coming soon"
- ❌ Less than 1 page of actual content

**Green Flags:**
- ✅ Structured headers (Navigation, Components, etc.)
- ✅ Tables with data
- ✅ Lists of UI elements
- ✅ Screenshots or diagrams (for PDF)
- ✅ Issue descriptions

**Pass Criteria:** File contains real UI cartography content (at least 5 distinct items)

**Status:** [ ] PASS / [ ] FAIL

**Note:** _______________________________________________

---

### ☐ Item 6: Not a Link-Only Doc

**Check:** Verify file contains embedded content, not just URLs

**Red Flags:**
- ❌ File contains only: "See: https://..."
- ❌ File is just a list of external links
- ❌ File says "Content available at [external location]"
- ❌ File is a symbolic link to external resource

**Green Flags:**
- ✅ Content is embedded in the file itself
- ✅ Links are supplementary (not the only content)
- ✅ File can be read offline

**Pass Criteria:** File contains embedded content that can be processed locally

**Status:** [ ] PASS / [ ] FAIL

**Note:** _______________________________________________

---

### ☐ Item 7: Matches Import Spec

**Check:** Verify against KEVIN_V5_IMPORT_SPEC.md

**Review:**
- [ ] Format is accepted (A)
- [ ] Contains at least one required content category (B)
- [ ] Not in forbidden state (C)
- [ ] Follows naming convention or reasonable alternative (D)
- [ ] Passes integrity rules (E)
- [ ] Understood as external baseline (F)

**Pass Criteria:** All sub-items checked

**Status:** [ ] PASS / [ ] FAIL

**Note:** _______________________________________________

---

### ☐ Item 8: Directory Structure Valid

**Check:** Verify files are in correct location

**Expected:**
```
docs/reference/kevin-v5/
├── KEVIN_V5_IMPORT_SPEC.md           (spec doc, ignore for count)
├── KEVIN_V5_IMPORT_CHECKLIST.md     (this file, ignore for count)
├── KEVIN_V5_IMPORT_EXAMPLE.md       (example doc, ignore for count)
├── kevin-v5-*.{md,pdf,zip,docx}     (BASELINE FILES - must exist)
└── extracted/                        (if ZIP was extracted)
    └── ...                           (extracted contents)
```

**Pass Criteria:**
- Baseline files are directly in `kevin-v5/` directory (not in subdirectories except `extracted/`)
- Spec/checklist/example docs are present but don't count toward baseline

**Status:** [ ] PASS / [ ] FAIL

**Note:** _______________________________________________

---

## SUMMARY

**Total Items:** 8

**Passed:** _____ / 8

**Failed:** _____ / 8

**Overall Result:** [ ] ALL PASS (proceed to delta) / [ ] ANY FAIL (STOP)

---

## DECISION

**IF ALL PASS:**
- ✅ Proceed to DELTA_RUNNER_PROTOCOL.md execution
- ✅ Update status: `baseline_import.status = "IMPORTED"`
- ✅ Create: `VERIFICATION/KEVIN_V5_BASELINE_IMPORTED.md` with timestamp

**IF ANY FAIL:**
- ❌ STOP immediately
- ❌ Create: `VERIFICATION/DELTA_BLOCKED_LOG.md` with:
  - Which item(s) failed
  - Reason for failure
  - Remediation instructions
- ❌ Do NOT proceed to delta
- ❌ Do NOT modify Gate F status
- ❌ Do NOT modify VERDICT.md

---

## REMEDIATION INSTRUCTIONS

**If Item 1-2 FAIL (Empty/No Files):**
1. Place Kevin V5 baseline files in `docs/reference/kevin-v5/`
2. Verify files are present
3. Re-run checklist

**If Item 3 FAIL (Wrong Format):**
1. Convert files to accepted format (.md, .pdf, .zip, .docx)
2. Replace files
3. Re-run checklist

**If Item 4 FAIL (Not Readable):**
1. Check if PDF is password-protected (remove password)
2. Check if ZIP is corrupted (re-download/re-create)
3. Check if DOCX is old format (convert to modern .docx)
4. Re-run checklist

**If Item 5-6 FAIL (Placeholder/Link-Only):**
1. Replace with substantive content
2. Ensure content is embedded (not external)
3. Re-run checklist

**If Item 7 FAIL (Doesn't Match Spec):**
1. Review KEVIN_V5_IMPORT_SPEC.md
2. Adjust files to meet requirements
3. Re-run checklist

**If Item 8 FAIL (Wrong Directory):**
1. Move files to correct location: `docs/reference/kevin-v5/`
2. Re-run checklist

---

## REFERENCES

- **Import Spec:** `KEVIN_V5_IMPORT_SPEC.md`
- **Import Examples:** `KEVIN_V5_IMPORT_EXAMPLE.md`
- **Delta Protocol:** `docs/ui-carto-copilot/70-compare/DELTA_RUNNER_PROTOCOL.md`

---

**Checklist Date:** __________  
**Verified By:** TITANE∞ Governance Protocol  
**Signature:** _______________ (optional)

---

**END OF CHECKLIST**
