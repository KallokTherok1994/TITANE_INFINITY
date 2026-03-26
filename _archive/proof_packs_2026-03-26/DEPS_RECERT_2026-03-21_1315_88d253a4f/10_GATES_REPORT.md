# Gates Report

**Date:** 2026-03-21

---

## verify_instructions.sh — Full Output

```
PASS: G_DOC_COPILOT_INSTRUCTIONS_PRESENT
PASS: G_DOC_WORKFLOW_PRESENT
PASS: G_DOC_CHECKLIST_PRESENT
PASS: G_FRONTMATTER_docs-registry.instructions.md
PASS: G_FRONTMATTER_frontend.instructions.md
PASS: G_FRONTMATTER_tauri.instructions.md
PASS: G_FRONTMATTER_tests-e2e.instructions.md
PASS: G_FRONTMATTER_titane.instructions.md
PASS: G_MERMAID_SYNTAX_MIN
PASS: G_AUTOHEAL_FILE_README.md
PASS: G_AUTOHEAL_FILE_autoheal_rules.jsonl
PASS: G_AUTOHEAL_FILE_apply_autoheal.sh
PASS: G_AUTOHEAL_FILE_detect_recurrence.sh
INFO: autoheal-jsonl-valid
PASS: G_AUTOHEAL_JSONL_VALID
PASS: G_MARKER_VERDICT_UNIQUE
PASS: G_MARKER_STOPLINE
PASS: G_MARKER_NO_SKIPS
PASS: G_MARKER_PROOF_PACK
PASS: G_MARKER_AUTOHEAL_CANONICAL_PATH
PASS: G_AH_RECURRENCE_GUARD_PASS
SUMMARY: PASS=20 FAIL=0
```

**Exit code:** 0

---

## detect_recurrence.sh — Output

```
PASS: G_AH_RULE_CAPTURED_FOR_EACH_FIX
PASS: G_AH_RECURRENCE_GUARD_PASS
INFO: entries=507
```

**Exit code:** 0

---

## Gate Summary

| Gate | Marker | Result |
|------|--------|--------|
| G_DOC_COPILOT_INSTRUCTIONS_PRESENT | present | PASS |
| G_AUTOHEAL_JSONL_VALID | entries=507 | PASS |
| G_MARKER_VERDICT_UNIQUE | validated | PASS |
| G_MARKER_STOPLINE | validated | PASS |
| G_MARKER_NO_SKIPS | validated | PASS |
| G_MARKER_PROOF_PACK | validated | PASS |
| G_AH_RECURRENCE_GUARD_PASS | present | PASS |
| SUMMARY | PASS=20 FAIL=0 | PASS |
