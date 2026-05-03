# Claim Recertification Matrix

**Date:** 2026-03-21  
**Evaluator:** Governed recertification agent

---

## Claim A: "3399/3399 tests PASS"

**Command:**
```bash
pnpm vitest run --reporter=dot
```

**Output (tail):**
```
 Test Files  231 passed (231)
      Tests  3399 passed (3399)
   Start at  09:11:39
   Duration  129.41s (transform 5.47s, setup 30.80s, import 14.12s, tests 24.19s, environment 39.57s)
```

**Exit code:** 0  
**Verdict:** PROVEN ✅

---

## Claim B: "verify_instructions PASS=20 FAIL=0"

**Command:**
```bash
bash scripts/verify_instructions.sh
```

**Output (full):**
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
**Verdict:** PROVEN ✅

---

## Claim C: "G_AH_RECURRENCE_GUARD_PASS"

**Command:**
```bash
bash scripts/autoheal/detect_recurrence.sh
```

**Output (tail):**
```
PASS: G_AH_RULE_CAPTURED_FOR_EACH_FIX
PASS: G_AH_RECURRENCE_GUARD_PASS
INFO: entries=507
```

**Exit code:** 0  
**Verdict:** PROVEN ✅

---

## Claim D: "eslint 9.x pinned"

**Command:**
```bash
grep '"eslint"' package.json
pnpm list --depth=0 | grep eslint
```

**Output:**
```
package.json: "eslint": "^9.39.4",
pnpm list:    eslint@9.39.4
```

**Note:** `^9.39.4` is a range (not exact pin), but installed version is 9.39.4. Held intentionally at 9.x because eslint-plugin-react peer deps cap at `^9.7`.  
**Verdict:** PROVEN ✅ (9.x confirmed, not 10.x)

---

## Claim E: "jsdom 29 stable"

**Command:**
```bash
pnpm list --depth=0 | grep jsdom
```

**Output:**
```
jsdom@29.0.1
```

**Exit code:** 0  
**Verdict:** PROVEN ✅

---

## Claim F: "push to MAIN completed"

**Command:**
```bash
git log --oneline origin/MAIN -5
git rev-parse HEAD
git rev-parse origin/MAIN
```

**Output:**
```
origin/MAIN top: 60c11fdf1 chore(deps): update round 3 - jsdom 29.0.1, eslint 9.39.4
HEAD:        88d253a4ff61b8f3c11bf1dfba598b99f7725c83
ORIGIN/MAIN: 60c11fdf1a220a96bbcf1d52e6cc0c832178a678
```

**Analysis:** HEAD ≠ origin/MAIN — there is 1 unpushed commit (RUNTIME_AUTHORITY_GAP proof pack). The dep update commits (rounds 1-3) ARE on origin/MAIN at 60c11fdf1. The push claim for dep updates is PROVEN; the RUNTIME_AUTHORITY_GAP proof pack commit requires a push in this session.  
**Verdict:** PARTIAL ⚠️ (dep updates pushed; 1 subsequent proof pack commit unpushed — will be pushed in this session)
