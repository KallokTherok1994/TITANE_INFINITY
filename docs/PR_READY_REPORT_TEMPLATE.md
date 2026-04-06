# PR Ready Report — Template
<!-- APPEND-ONLY — one entry per PR -->

## Usage

Copy this template for each PR targeting TITANE_INFINITY and fill in all fields.

---

## PR: `{{PR_TITLE}}`

**Date:** `{{DATE_UTC}}`  
**Author:** `{{AUTHOR}}`  
**Branch:** `{{BRANCH}}`  
**PR URL:** `{{PR_URL}}`  
**Session ID:** `{{SESSION_ID}}`

### Scope

**Ring(s) impacted:** `{{RINGS}}`  
**Files changed:** `{{N}}` files  
**Status:** `EXPERIMENTAL | QUALIFIED | STABLE`

### Gate Results

Run `bash scripts/run_all.sh` and paste the summary:

```
PASS  G0_PROOF_PACK_COMPLETE
PASS  G1_BUILD_TAURI_X3        (or BLOCKED_RUNNER)
PASS  G2_TESTS_X3               (or BLOCKED_RUNNER)
PASS  G3_UI_NO_NETWORK_DIRECT
PASS  G4_ONE_DOOR_NETWORK_BACKEND
PASS  G5_ALLOWLIST_DENY_BY_DEFAULT
PASS  G6_TRUTH_CONSISTENCY
PASS  G7_ROUTER_BOUNDED
PASS  G8_MEMORY_ISOLATION       (or BLOCKED_RUNNER)
PASS  G9_TOOLS_POLICY_ENFORCED
BLOCKED_INSTRUMENTATION  G10_REDTEAM_X3
BLOCKED_INSTRUMENTATION  G11_EVALS_REGRESSION_NONE
BLOCKED_INSTRUMENTATION  G12_SUPPLY_CHAIN_SIGNED
PASS  G13_SUPPORT_BUNDLE_EXPORTABLE
```

### Invariants verified

- [ ] I1 Tauri-only — no new web server
- [ ] I2 Online-first governed — zero direct UI network
- [ ] I3 4-Ring strict — no ring violations
- [ ] I4 Allowlist deny-by-default — no capability creep
- [ ] I5 Build x3 (or BLOCKED_RUNNER with next action)
- [ ] I6 Tests x3 no skips (or BLOCKED_RUNNER with next action)
- [ ] I7 Zero silence — UI always responds
- [ ] I8 Proof pack append-only
- [ ] I9 Rollback documented in `proof_packs/{{SESSION_ID}}/ROLLBACKS.md`

### Proof Pack

Location: `proof_packs/{{SESSION_ID}}/`

### Verdict

```
STATUS: PASS | FAIL | BLOCKED_RUNNER | BLOCKED_INSTRUMENTATION
```

**Ready to merge:** YES / NO  
**Conditions:** `{{CONDITIONS}}`

---
