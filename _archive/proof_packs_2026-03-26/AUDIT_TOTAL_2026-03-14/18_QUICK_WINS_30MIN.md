# 18 — QUICK WINS ≤30 MIN — TITANE_INFINITY

**Date:** 2026-03-14 | **HEAD:** e8b2c27b

These are actions achievable in ≤30 minutes with high confidence and low risk.

---

## QW-01 — Fix guardian.agent.md doctrine [5 min] ✅ EXECUTABLE NOW

**Problem:** CONTRADICTION-03: guardian.agent.md says "local-first" (non-negotiable) vs kernel saying it's a compatibility marker  
**Fix:**
```bash
cd /home/runner/work/TITANE_INFINITY/TITANE_INFINITY

# Before:
grep -n "local-first" .github/copilot-agents/guardian.agent.md

# Edit line 7 to replace "local-first" with correct doctrine
# sed -i 's/local-first\./online-first governed with mandatory local fallback (local-first is a compatibility marker only)./' .github/copilot-agents/guardian.agent.md

# Verify fix applied (old phrase gone, new phrase present):
grep "Tauri-only.*local-first\.$" .github/copilot-agents/guardian.agent.md  # should return 0 results
grep "online-first governed" .github/copilot-agents/guardian.agent.md  # should return 1 result
bash scripts/verify_instructions.sh  # should remain PASS=20 FAIL=0
```
**Risk:** Zero — documentation only  
**Verification:** PASS after fix  

---

## QW-02 — Document CSP unsafe-inline approval or plan [10 min] ✅ EXECUTABLE NOW

**Problem:** CSP-baseline gate FAIL; G7 PASS creates false confidence  
**Option A — Document explicit exception (immediate):**
Create `docs/_evidence/csp-unsafe-inline-rationale.md` explaining why unsafe-inline is needed in Tauri WebView for React, pending removal in future sprint.

**Option B — Remove unsafe-inline (requires testing):**
```bash
# Edit tauri.conf.json script-src, remove 'unsafe-inline'
# Then test: npm run tauri dev (if build env available)
# Verify: node scripts/gates/csp-baseline-gate.js → PASS
```
**Recommendation:** Do Option A (document) now; Option B in a dedicated test session  
**Risk:** Low for Option A; Medium for Option B without build env  

---

## QW-03 — Fill in empty autoheal entries [5 min] ✅ EXECUTABLE NOW

**Problem:** AH-0158→0162 have empty description/status  
**Fix:** Review and backfill the 5 entries with their actual content  
```bash
# View entries:
tail -5 scripts/autoheal/autoheal_rules.jsonl | python3 -m json.tool 2>/dev/null || tail -5 scripts/autoheal/autoheal_rules.jsonl

# Edit to add description/status to empty entries
# Verify:
python3 -c "import json; [json.loads(l) for l in open('scripts/autoheal/autoheal_rules.jsonl') if l.strip()]"
bash scripts/autoheal/detect_recurrence.sh
```
**Risk:** Zero  

---

## QW-04 — Investigate target_url Wikipedia flows [10 min] ✅ EXECUTABLE NOW

**Problem:** RISK-11: Wikipedia/Wikidata URLs in UI — need to verify they go through IPC  
**Investigation:**
```bash
# Find how target_url is used
grep -rn "target_url" src/ --include="*.ts" --include="*.tsx" | grep -v "//\|test" | head -20

# Find where seeds/target_url are invoked
grep -rn "seeds\[0\]\|target_url" src/components/sections/ConversationSection.tsx | head -10
grep -rn "seeds\[0\]\|target_url" src/pages/ResearchPage.tsx | head -10
```
**Expected outcome:** `target_url` passed to `invoke('web_navigate', ...)` or similar IPC command — PASS  
**If fetch() found:** Escalate to FAIL and create fix  

---

## QW-05 — Add AutoHeal entry for this audit [2 min] ✅ ALREADY DONE VIA MISSION REQUIREMENT

See: scripts/autoheal/autoheal_rules.jsonl — AH-2026-03-14-AUDIT entry  

---

## QW-06 — Run final gates after fixes [5 min] ✅ EXECUTABLE AFTER QW-01/02/03

```bash
cd /home/runner/work/TITANE_INFINITY/TITANE_INFINITY
bash scripts/verify_instructions.sh
bash scripts/autoheal/detect_recurrence.sh
node scripts/gates/csp-baseline-gate.js  # Should PASS after QW-02
```

---

## QUICK WIN SUMMARY TABLE

| QW | Action | Time | Risk | Executable Now? |
|----|--------|------|------|-----------------|
| QW-01 | Fix guardian.agent.md local-first | 5 min | Zero | ✅ YES |
| QW-02 | Document CSP rationale | 10 min | Low | ✅ YES (Option A) |
| QW-03 | Fill empty autoheal entries | 5 min | Zero | ✅ YES |
| QW-04 | Verify target_url Wikipedia flow | 10 min | Zero (investigation) | ✅ YES |
| QW-05 | AutoHeal entry appended | Done | Zero | ✅ DONE |
| QW-06 | Final gate verification | 5 min | Zero | ✅ AFTER QW-01/02 |
| **TOTAL** | | **35 min** | Low | |
