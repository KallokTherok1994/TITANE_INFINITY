# 17 — PRIORITY ACTION PLAN — TITANE_INFINITY

**Date:** 2026-03-14 | **HEAD:** e8b2c27b  
**Derived from:** 15_RISK_MATRIX.md, 16_ROOT_CAUSES.md, 14_CONTRADICTIONS.md

---

## PRIORITY 1 — IMMEDIATE (Blocks certification)

### P1-A — Fix guardian.agent.md doctrine contradiction [RC-03] [≤5 min]

**What:** Replace `"local-first"` with kernel-aligned wording in guardian.agent.md  
**File:** `.github/copilot-agents/guardian.agent.md` line 7  
**Before:** `"Tauri-only (no HTTP servers); local-first."`  
**After:** `"Tauri-only (no HTTP servers); online-first governed with mandatory local fallback (local-first is a compatibility marker only)."`  
**Verification:** `grep "Tauri-only.*local-first\.$" .github/copilot-agents/guardian.agent.md` → must return 0 results; `grep "online-first governed" .github/copilot-agents/guardian.agent.md` → must return 1 result
**Risk:** Low — documentation only

### P1-B — Document CSP unsafe-inline explicitly [RC-02] [≤15 min]

**What:** Either remove `unsafe-inline` from script-src in tauri.conf.json, OR create a documented exception with approval.  
**Option A (Preferred):** Remove `unsafe-inline` from script-src — requires testing that React app still boots  
**Option B:** Add `/* CSP_ALLOW_UNSAFE=1 approved by: [name] date: [date] reason: Tauri webview requires inline for [X] */` and set env var  
**File:** `src-tauri/tauri.conf.json`  
**Verification:** `node scripts/gates/csp-baseline-gate.js` → must return ✅ PASS  
**Risk:** MEDIUM if removing — may break React rendering. Test in dev first.

---

## PRIORITY 2 — SHORT TERM (Architectural gaps)

### P2-A — Generate G4 evidence files [RC-01] [≤30 min with proper CI]

**What:** Run P3 certification process to produce BASELINE.md, STRUCTURAL_TEST.log, STRUCTURAL_RUNS_SUMMARY.md  
**Where:** Expected location per G4 gate script (inspect the gate to find exact path)  
**Command:** `bash scripts/gates/g4-provider-decision-certified.sh` to find expected paths, then run P3 certification  
**Verification:** `bash scripts/gates/g4-provider-decision-certified.sh` → must return ✅ PASS  
**Risk:** BLOCKED without proper test environment (requires running provider chain tests)

### P2-B — Verify Wikipedia/Wikidata URLs flow [RISK-11] [≤15 min]

**What:** Confirm that URLs in ConversationSection.tsx and ResearchPage.tsx are passed to Tauri IPC for web navigation (acceptable) and NOT fetched directly from UI (violates One Door)  
**File:** `src/components/sections/ConversationSection.tsx:289` — `target_url: seeds[0]`  
**Check:** Find where `target_url` is consumed — if via invoke() then OK; if via fetch() then FAIL  
**Verification:** Grep for usage of `target_url` and `seeds` in IPC calls

### P2-C — Add E2E answer quality assertions [RC-04] [≤2 hours]

**What:** Add E2E tests that assert AI responses are not empty, not error messages, and contextually relevant  
**Where:** `e2e/critical/chat-interaction.spec.ts` or new `e2e/critical/answer-quality.spec.ts`  
**Pattern:** Assert response.length > 50, response doesn't contain "error", response contains keywords from prompt  
**Verification:** E2E run → specific test PASS

### P2-D — Install ripgrep in CI [RC-05] [≤10 min]

**What:** Add `rg` to CI environment or update gate scripts to use `grep` equivalently  
**Where:** CI workflow files (.github/workflows/) or Dockerfile  
**Verification:** Re-run G1/G2/G3 gates without "rg: command not found" warnings

---

## PRIORITY 3 — MEDIUM TERM (Quality improvements)

### P3-A — Fill in empty autoheal entries [RC-06] [≤10 min]

**What:** Edit lines 185-189 in autoheal_rules.jsonl to add meaningful description and status for AH-0158→0162  
**Verification:** `python3 -c "import json; [print(json.loads(l)) for l in open('scripts/autoheal/autoheal_rules.jsonl')]"` — no empty fields

### P3-B — Add runtime WARN for tauriChat local forcing [G3 observation] [≤15 min]

**What:** Add `logger.warn("[tauriChat] Forcing local provider — reason: [reason]")` in tauriChat.generate() before any local-only path  
**Verification:** G3 gate observation resolved

### P3-C — Update G7 to check script-src unsafe-inline [CONTRADICTION-02] [≤15 min]

**What:** G7 currently only checks `default-src 'self'` — should also check `script-src` for unsafe-inline  
**File:** `scripts/gates/g7-tauri-allowlist-lock.sh`  
**Verification:** G7 and CSP-baseline produce consistent results

---

## PRIORITY 4 — LONG TERM (Debt)

### P4-A — Triage 63 TODO/FIXME/HACK [ongoing]

**What:** Review and either resolve or create tracking issues for each TODO/FIXME  
**Tooling:** `grep -rn "TODO\|FIXME\|HACK" src/ --include="*.ts" --include="*.tsx" > /tmp/todos.txt`

### P4-B — Review 407 placeholder/skeleton non-test refs [ongoing]

**What:** Determine which are legitimate UI loading states vs permanent stubs  
**Approach:** Focus on any `stub` or `placeholder` that's not in a UI loading state context

### P4-C — Autoheal JSONL archival strategy [ongoing]

**What:** At 189 entries, consider archiving old entries to keep active set manageable  
**Note:** detect_recurrence.sh currently PASS — not urgent
