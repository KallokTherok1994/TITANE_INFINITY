# 16 — REPRIORITIZATION REPORT

**Date:** 2026-03-14

---

## REPRIORITIZATION

### INITIAL PRIORITIZATION (First Audit)

| Rank | Item                                      | Priority | Rationale given        |
| ---- | ----------------------------------------- | -------- | ---------------------- |
| 1    | G4 FAIL — provider decision not certified | HIGH     | Missing evidence files |
| 2    | CSP FAIL — unsafe-inline                  | HIGH     | XSS risk               |
| 3    | guardian.agent.md contradiction           | MEDIUM   | Doctrine mismatch      |
| 4    | G6 BLOCKED                                | MEDIUM   | Build env              |
| 5    | G3 WARNING — no runtime WARN              | LOW      | Missing log            |
| 6    | Autoheal empty entries                    | LOW      | Quality                |
| 7    | 63 TODO/FIXME                             | LOW      | Debt                   |
| 8    | rg not installed                          | LOW      | Tool                   |

---

### CORRECTED PRIORITIZATION (Second Audit)

| Rank | Item                                              | Priority | Proof                   | Why Reprioritized                                                                               |
| ---- | ------------------------------------------------- | -------- | ----------------------- | ----------------------------------------------------------------------------------------------- |
| 1    | G1/G3/rc-network: hollow gates (rg-dependent)     | P1       | gate re-run evidence    | These gates provide false safety on governance invariants. Fix is simple: replace rg with grep. |
| 2    | P3 cert is simulated, not real                    | P1       | structural spec source  | Provider decision certification is synthetic. Full E2E disabled by default.                     |
| 3    | [MOCK_OK] in production + E2E tests may test mock | P1       | grep proof              | If cert tests use mock flag, they certify nothing.                                              |
| 4    | answer_is_useful never verified                   | P1       | scan: 0 test assertions | Product truth depth is LOW. Quality is unverified.                                              |
| 5    | ring-integrity-gate absent                        | P2       | ls scripts/gates/       | Ring boundary automation missing. Low immediate risk.                                           |
| 6    | G9 incomplete execution                           | P2       | execution evidence      | Release seal not actually complete.                                                             |
| 7    | Port mismatch (1420 vs 5173)                      | P2       | grep both files         | Dev config drift risk.                                                                          |
| 8    | G4 FAIL (local-only)                              | P2       | ci-unified.yml          | Not in CI. Evidence files would be from simulated tests anyway.                                 |
| 9    | CSP unsafe-inline                                 | P2       | ci-unified.yml:127      | Already waived in CI. P2 risk.                                                                  |
| 10   | guardian.agent.md (FIXED)                         | ✅ DONE  | first audit commit      | Already resolved.                                                                               |
| 11   | 63 TODO/FIXME                                     | P2       | grep count              | No regression risk. Planned improvements.                                                       |
| 12   | rg not installed (tooling)                        | P2       | which rg                | Install or replace in scripts.                                                                  |
| 13   | G3 WARNING (no runtime WARN)                      | P2       | G3 script               | Low risk. Add logger.warn() when/if tauriChat forces local.                                     |
| 14   | Autoheal entries "empty" (RETRACTED)              | N/A      | python3 parse           | First audit claim was false. Entries are populated.                                             |

---

## REPRIORITIZATION RATIONALE

### Why hollow gates > missing evidence files

G4's missing BASELINE.md, STRUCTURAL_TEST.log, and STRUCTURAL_RUNS_SUMMARY.md are documentation gaps in a local-only gate. The certification evidence that would fill these files comes from `chat-provider-decision-certification-structural.spec.ts` — which is itself synthetic. Fixing G4 evidence by running structural tests would produce **certified simulation**, not **certified product truth**.

G1/G3/rc-network hollow gates are higher priority because:

1. They give false confidence to developers and reviewers
2. The fix is **simple and immediate** (replace rg with grep)
3. They affect governance invariants (offline-without-reason, legacy isolation, network surface)
4. Their failure mode is invisible (silent rg failure → unconditional PASS)

### Why harness truth > CSP priority

CSP unsafe-inline is a security debt that is explicitly waived in CI with `CSP_ALLOW_UNSAFE=1`. The risk exists but is documented and controlled. Removing unsafe-inline requires build environment testing and is not a quick fix.

The harness truth issues (simulated P3 cert, disabled E2E, mock in prod) are more dangerous because they provide false confidence that the product works correctly when the testing infrastructure itself is not exercising the real product. This is a form of governance failure more serious than a documented security waiver.

### Why answer_is_useful matters

The system is an AI assistant. If no test ever verifies that AI responses are useful or relevant, then all the governance infrastructure (IPC contract, provider routing, fallback chain) is protecting a pipeline whose output quality is unverified. The test for "is the response non-empty?" is insufficient for a product whose value proposition is AI response quality.
