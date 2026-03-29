# EXTERNAL SYNC RUNTIME PROOF SPEC

**Version**: P1.14d
**Date**: 2026-03-29
**Status**: BLOCKED_ENV — TERMINAL STATE — P1.14x chain closed. Reopen as P1.15 when env configured.
**Scope**: Bounded external sync runtime qualification only — not a broad architecture redesign

---

## 1. Purpose and Scope

This spec defines the conditions, steps, and evidence required to prove that TITANE∞'s external sync path (Option1SyncService → Turso/LibSQL) operates correctly at runtime.

This is NOT:
- A broad sync architecture redesign
- A local persistence redesign
- A provider/control-plane change
- A release document

This IS:
- A bounded runtime proof spec for one sync path
- A reusable reference for future proof cycles (P1.15+)

---

## 2. Local Sealed Baseline Rule

The local persistence chain (SQLite → Rust LTM → Recall bridge) is proven by P1.13d and SEALED.

**Rule**: Do not reopen local proof in any external sync cycle. Local baseline is the starting point, not the target.

External sync proof builds ON TOP of local baseline — it does not replace or reopen it.

---

## 3. External Sync Env/Auth Boundary

External sync requires ALL of the following in the runtime environment:

| Variable | Purpose | Required |
|----------|---------|----------|
| `TURSO_DATABASE_URL` | Remote Turso/LibSQL URL | YES |
| `TURSO_AUTH_TOKEN` | Turso authentication token | YES |
| `OPTION1_SYNC_ENABLED` | Enable sync scheduler | YES |

If any of these is absent or empty:
- `sync_service.rs` returns `SYNC_MISSING_CONFIG` (for URL/TOKEN)
- `sync_scheduler.rs` sets `enabled = false` (for OPTION1_SYNC_ENABLED)
- External sync is honestly classified as **BLOCKED_ENV**
- No code defect exists — this is correct behavior

**P1.14d finding**: OPTION1_SYNC_ENABLED is an independent third blocker. Even if URL+TOKEN are present, scheduler defaults to `enabled=false` without this toggle. All three must be set.

**Rule**: Missing env vars are not a code bug. Do not add fake config shims or autoheal rules that hide this condition.

---

## 4. Live Write/Readback Proof Rule

External sync is only proven if:

1. TURSO_DATABASE_URL is non-empty in env
2. TURSO_AUTH_TOKEN is non-empty in env
3. OPTION1_SYNC_ENABLED=true is set in env
4. `sync_now(session_id)` is called and returns `SyncStatus.phase == Idle`
5. `SyncStatus.last_error_code == None`
6. A bounded test entry written locally is visible in the remote Turso/LibSQL database
7. Steps 1-6 are repeated x3 with consistent results

**Rule**: Code existence ≠ proof. Local success ≠ external proof. Env present ≠ proof. Only live runtime behavior counts.

---

## 5. Coherence Rule

Coherence is classified as:
- **COHERENT**: local write visible in remote within OPTION1_SYNC_INTERVAL_MS
- **LAG**: local write not yet visible but no error
- **MISMATCH**: local write not visible after sync completes
- **BREAK**: sync returns error code

Coherence is only assessable after a successful live write.

---

## 6. BLOCKED_ENV Rule

When any required env/auth/toggle is absent, produce an explicit blocker contract:
- List exact missing variables (URL, TOKEN, TOGGLE)
- State exact rerun condition
- Do not fabricate proof from local behavior
- Do not add fake autoheal rules

Classify as `EXTERNAL_SYNC_BLOCKED_ENV`. Stop honestly.

**Terminal state rule** (P1.14d): After four consecutive BLOCKED_ENV cycles with no env change, the P1.14x chain is closed. Do not open P1.14e or further sub-cycles with the same absent env. The next entry point is a new lock (P1.15) opened only when all three vars are actually set.

---

## 7. Autoheal Update Rule

Add an autoheal rule only if:
- A real bounded runtime issue is identified (not missing env)
- The fix is small and bounded
- The rule cannot hide missing env, auth mismatch, write failure, or coherence uncertainty

For missing env: NO_AUTOHEAL_UPDATE_NEEDED.

---

## 8. Mermaid Summary

See [proof_packs/POST_SEALED_EXTERNAL_SYNC_ENV_ONLY_2026-03-29_1426_1c961c88a/11_MERMAID.md](../../proof_packs/POST_SEALED_EXTERNAL_SYNC_ENV_ONLY_2026-03-29_1426_1c961c88a/11_MERMAID.md)

Key flows documented:
- P1.14 chain state (4 cycles → terminal)
- Three-gate env block (URL + TOKEN + TOGGLE)
- Local sealed vs external blocked boundary

---

## 9. Mapping Summary

| Map | File | Status |
|-----|------|--------|
| External sync readiness | 03_EXTERNAL_SYNC_READINESS_MAP.md | CURRENT |
| External sync path | 04_EXTERNAL_SYNC_PATH_MAP.md | CURRENT |
| Coherence map | 05_COHERENCE_MAP.md | CURRENT |
| Local baseline | 02_LOCAL_BASELINE_MAP.md | SEALED |

---

## 10. Registry Append Rule

Append to `registry/proofpack-index.jsonl` only new facts backed by proof.

Fields required:
- `pack`: proof pack directory name
- `lock`: lock identifier
- `verdict`: exact verdict
- `date`, `time`, `shortSHA`, `branch`, `version`
- `lane`: lane selected
- `evidence`: list of key evidence items
- `files_changed`: integer
- `sealed`: true

Never rewrite history. Append only.

---

## 11. Reopen / Escalation Rule

Reopen external sync proof only when:
- TURSO_DATABASE_URL is present and non-empty
- TURSO_AUTH_TOKEN is present and non-empty
- OPTION1_SYNC_ENABLED=true is set

Open as a **new lock P1.15** (not P1.14e or further sub-cycle). The P1.14x chain is closed after P1.14d.

Do not escalate to architecture redesign unless live runtime proof reveals a structural break that cannot be resolved with a bounded fix.

---

## 12. Rollback Rule

For LANE A (ENV_CLASSIFICATION_ONLY): NO_PATCH_NEEDED — rollback is `rm -rf` of proof pack directory.

For LANE B/C (when env present): document exact `git restore` commands for any modified product files before beginning proof.

For LANE D (blocked target): same as LANE A.
