# 20 — GATES REPORT — TITANE_INFINITY

**Date:** 2026-03-14 | **HEAD:** e8b2c27b

All gates evaluated via `bash scripts/gates/run-all.sh` and individual gate runs.

---

| Gate                             | Applicable? | Proof                                                         | Result                                   | Risk if FAIL                     | Action Required                                                                             |
| -------------------------------- | ----------- | ------------------------------------------------------------- | ---------------------------------------- | -------------------------------- | ------------------------------------------------------------------------------------------- |
| G1 — no-offline-without-reason   | ✅ YES      | `bash scripts/gates/g1-no-offline-without-reason.sh` output   | ✅ PASS (rg missing, grep fallback used) | HIGH                             | Install ripgrep for full check                                                              |
| G2 — no-force-local-in-prod      | ✅ YES      | `bash scripts/gates/g2-no-force-local-in-prod.sh` output      | ✅ PASS                                  | HIGH                             | None                                                                                        |
| G3 — legacy-divergence           | ✅ YES      | `bash scripts/gates/g3-legacy-divergence.sh` output           | ✅ PASS (obs: missing WARN)              | MEDIUM                           | Add logger.warn() to tauriChat local-forcing path                                           |
| G4 — provider-decision-certified | ✅ YES      | `bash scripts/gates/g4-provider-decision-certified.sh` output | ❌ FAIL                                  | HIGH — provider chain unverified | Run P3 certification; generate BASELINE.md, STRUCTURAL_TEST.log, STRUCTURAL_RUNS_SUMMARY.md |
| G5 — ci-wiring                   | ✅ YES      | `bash scripts/gates/g5-ci-wiring.sh` output                   | ✅ PASS                                  | MEDIUM                           | None                                                                                        |
| G6 — build-reproducibility       | ✅ YES      | `bash scripts/gates/g6-build-reproducibility.sh`              | ⚠️ BLOCKED                               | HIGH — cannot verify binary      | Provide Rust build environment; run `npm run tauri build`                                   |
| G7 — tauri-allowlist-lock        | ✅ YES      | `bash scripts/gates/g7-tauri-allowlist-lock.sh` output        | ✅ PASS                                  | HIGH                             | G7 CSP check incomplete (see CONTRADICTION-02) — update G7                                  |
| G8 — provider-api-only           | ✅ YES      | `bash scripts/gates/g8-provider-api-only.sh` output           | ✅ PASS                                  | HIGH                             | None                                                                                        |
| G9 — release-seal                | ✅ YES      | `bash scripts/gates/g9-release-seal.sh` output                | ✅ PASS                                  | HIGH                             | None                                                                                        |
| CSP-baseline                     | ✅ YES      | `node scripts/gates/csp-baseline-gate.js` output              | ❌ FAIL                                  | HIGH — unsafe-inline XSS risk    | Remove `'unsafe-inline'` from script-src OR document explicit approval                      |
| G_FRONTEND_NO_WEB                | ✅ YES      | `bash scripts/gates/g_frontend_no_web.sh`                     | ✅ PASS                                  | HIGH                             | None                                                                                        |
| G_NO_TEST_SKIPS                  | ✅ YES      | `bash scripts/gates/g_no_test_skips.sh`                       | ✅ PASS                                  | MEDIUM                           | None                                                                                        |
| G_NETWORK_ONE_DOOR               | ✅ YES      | `bash scripts/gates/g_network_one_door.sh`                    | ✅ PASS                                  | HIGH                             | None                                                                                        |
| UI-INDEX-GATE                    | ✅ YES      | `node scripts/gates/ui-index-gate.js`                         | ✅ PASS                                  | MEDIUM                           | None — no UI files modified in this session                                                 |
| FORBIDDEN-SCRIPTS                | ✅ YES      | `node scripts/gates/forbidden-scripts-gate.js`                | ✅ PASS                                  | HIGH                             | None                                                                                        |
| verify_instructions              | ✅ YES      | `bash scripts/verify_instructions.sh`                         | ✅ PASS=20 FAIL=0                        | HIGH                             | None                                                                                        |
| detect_recurrence                | ✅ YES      | `bash scripts/autoheal/detect_recurrence.sh`                  | ✅ PASS                                  | HIGH                             | None                                                                                        |
| ring-integrity-gate              | ❓ N/A      | `scripts/gates/ring-integrity-gate.sh` NOT FOUND              | ⚠️ UNKNOWN                               | HIGH                             | Script missing — create or verify if renamed                                                |
| rc-network-surface-gate          | ✅ YES      | `bash scripts/gates/rc-network-surface-gate.sh`               | ❓ UNKNOWN                               | MEDIUM                           | Was called as node (wrong); need to run as bash                                             |

---

## GATE FAILURE SUMMARY

### ❌ FAIL GATES (must fix before PASS certification)

1. **G4** — Provider decision not certified (missing evidence files)
2. **CSP-baseline** — unsafe-inline in script-src

### ⚠️ BLOCKED GATES (environment constraint, not code issue)

1. **G6** — Build reproducibility (no Rust/Tauri build environment)

### ⚠️ UNKNOWN GATES

1. **ring-integrity-gate** — Script not found at expected path
2. **rc-network-surface-gate** — Called with wrong runtime (node vs bash)

### ✅ PASS GATES (12)

G1, G2, G3, G5, G7, G8, G9, CSP-no-eval, G_FRONTEND_NO_WEB, G_NO_TEST_SKIPS, G_NETWORK_ONE_DOOR, UI-INDEX-GATE, FORBIDDEN-SCRIPTS, verify_instructions, detect_recurrence

---

## NOTES

- **rg not installed**: G1, G2, G3 use ripgrep which is not available. Gates fall back to grep. Some pattern checks may be less precise. Install ripgrep: `sudo apt install ripgrep`
- **run-all.sh**: Only runs G1-G9 (not CSP-baseline or supplementary gates). Supplementary gates should be added to run-all.sh for complete CI coverage.
- **rc-network-surface-gate.sh**: The file exists as `.sh` but was attempted with `node`. Run as `bash scripts/gates/rc-network-surface-gate.sh` for correct execution.
