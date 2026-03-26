# Gates Report

**Session**: ORCHESTRATOR_FIXES_2026-03-23_1007_641001554
**Date**: 2026-03-23 10:07:34 UTC
**Constitutional Authority**: .clinerules/00-kernel.md

---

## Gate Validation Summary

All constitutional gates passed successfully. No STOP_THE_LINE conditions triggered.

| Gate | Status | Details |
|------|--------|---------|
| G_DOC_COPILOT_INSTRUCTIONS_PRESENT | ✅ PASS | Canonical kernel present |
| G_DOC_WORKFLOW_PRESENT | ✅ PASS | Workflow documentation present |
| G_DOC_CHECKLIST_PRESENT | ✅ PASS | Checklist documentation present |
| G_DEVSAFE_CANONICAL_LAUNCHER_EXISTS | ✅ PASS | DevSafe launcher exists |
| G_DEVSAFE_CHECKLIST_REFERENCES_LAUNCHER | ✅ PASS | Checklist references launcher |
| G_DEVSAFE_CHECKLIST_NODE_REQUIREMENT_VISIBLE | ✅ PASS | Node requirement visible |
| G_FRONTMATTER_docs-registry.instructions.md | ✅ PASS | Frontmatter valid |
| G_FRONTMATTER_frontend.instructions.md | ✅ PASS | Frontmatter valid |
| G_FRONTMATTER_tauri.instructions.md | ✅ PASS | Frontmatter valid |
| G_FRONTMATTER_tests-e2e.instructions.md | ✅ PASS | Frontmatter valid |
| G_FRONTMATTER_titane.instructions.md | ✅ PASS | Frontmatter valid |
| G_MERMAID_SYNTAX_MIN | ✅ PASS | Mermaid syntax valid |
| G_AUTOHEAL_FILE_README.md | ✅ PASS | AutoHeal README present |
| G_AUTOHEAL_FILE_autoheal_rules.jsonl | ✅ PASS | AutoHeal rules file valid |
| G_AUTOHEAL_FILE_apply_autoheal.sh | ✅ PASS | AutoHeal script present |
| G_AUTOHEAL_FILE_detect_recurrence.sh | ✅ PASS | Recurrence detection script present |
| G_AUTOHEAL_JSONL_VALID | ✅ PASS | JSONL schema valid |
| G_MARKER_VERDICT_UNIQUE | ✅ PASS | Unique verdict marker present |
| G_MARKER_STOPLINE | ✅ PASS | Stop-the-line marker present |
| G_MARKER_NO_SKIPS | ✅ PASS | No-skips marker present |
| G_MARKER_PROOF_PACK | ✅ PASS | Proof pack marker present |
| G_MARKER_AUTOHEAL_CANONICAL_PATH | ✅ PASS | AutoHeal canonical path marker |
| G_AH_RECURRENCE_GUARD_PASS | ✅ PASS | Recurrence guard passed |

---

## Validator Output

### verify_instructions.sh
```
PASS: G_DOC_COPILOT_INSTRUCTIONS_PRESENT
PASS: G_DOC_WORKFLOW_PRESENT
PASS: G_DOC_CHECKLIST_PRESENT
PASS: G_DEVSAFE_CANONICAL_LAUNCHER_EXISTS
PASS: G_DEVSAFE_CHECKLIST_REFERENCES_LAUNCHER
PASS: G_DEVSAFE_CHECKLIST_NODE_REQUIREMENT_VISIBLE
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
SUMMARY: PASS=23 FAIL=0
```

**Exit Code**: 0
**Result**: ✅ PASS (23/23)

### detect_recurrence.sh
```
PASS: G_AH_RULE_CAPTURED_FOR_EACH_FIX
PASS: G_AH_RECURRENCE_GUARD_PASS
INFO: entries=1
```

**Exit Code**: 0
**Result**: ✅ PASS (2/2)

---

## Gate Compliance Matrix

| Constitutional Rule | Gate | Required | Actual | Status |
|---------------------|------|----------|--------|--------|
| Rule 2 (PROOF_BEFORE_VERDICT) | All gates | PASS | 23/23 PASS | ✅ |
| Rule 10 (AUTOHEAL_CAPTURE) | G_AUTOHEAL_JSONL_VALID | PASS | Valid | ✅ |
| Rule 10 (AUTOHEAL_CAPTURE) | G_AH_RECURRENCE_GUARD_PASS | PASS | No recurrence | ✅ |
| Rule 9 (NO_SKIPS) | G_MARKER_NO_SKIPS | PASS | Present | ✅ |
| Rule 8 (STOP_THE_LINE) | G_MARKER_STOPLINE | PASS | Present | ✅ |

---

## Recurrence Detection

**AutoHeal entries analyzed**: 1
**Recurrence patterns**: None detected
**Risk level**: LOW
**Next review**: 24h

---

## Gate Failures

**None.** All gates passed successfully.

---

## Stop-the-Line Conditions

**None triggered.** All operations within constitutional boundaries.

---

**Gate Status**: ALL_PASS
**Total Gates**: 23
**Passed**: 23
**Failed**: 0
**Exit Code**: 0