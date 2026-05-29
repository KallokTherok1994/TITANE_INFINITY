# GATE 8 — DAILY / SYSTEM / DEV LAB MODE RULES

**Project:** TITANE_INFINITY  
**Date:** 2026-05-28  
**Phase:** P1 SPEC

---

## Rule Set by Mode

### DAILY MODE RULES

1. **D-01 — Core surfaces only:** Only KEEP_DAILY routes (11) visible in TopNav.
2. **D-02 — No SIMULATED in Daily:** `/orchestration-intelligence` and `/quantum-center` must never appear in Daily nav.
3. **D-03 — Root preserved:** `/` always resolves to `/titane`. No NEXUS component may intercept this.
4. **D-04 — Sensitive actions guarded:** Routes with `isSensitive=true` actions must honor `safeActionPolicy` — no auto-trigger of EXTERNAL_NETWORK_SKIP actions in automated test runs.
5. **D-05 — Tab order preserved:** Tab order within tabbed routes (titane 6-tab, time 5-tab, admin 6-tab, dev 5-tab) must be preserved from manifest.
6. **D-06 — No product model change:** `/titane` chat uses gemma2:2b. Daily mode must not surface any model-switch that defaults to qwen.

### SYSTEM MODE RULES

7. **S-01 — System gated:** System mode must be explicitly unlocked (Settings → System or shortcut). Not accessible by default.
8. **S-02 — All KEEP_SYSTEM preserved:** 14 system routes must remain accessible in System mode; none may be removed.
9. **S-03 — Admin as gateway:** `/admin` (with its 17 aliases) is the primary gateway to system config. Aliases must all resolve.
10. **S-04 — Cloud requires init:** `/cloud` shows explicit blocked state if not initialized. NEXUS shell must not auto-init cloud.

### DEV MODE RULES

11. **DV-01 — Dev mode gated:** Dev mode requires explicit developer unlock. Not accessible to regular users.
12. **DV-02 — /total-dev isolation:** `/total-dev` uses qwen3.5:9b IPC. Must remain on ALLOWED_DEV_SURFACE list. Must not appear in Daily or System nav.
13. **DV-03 — /dev restricted:** `/dev` and its 13 aliases are dev-mode-only. autofix_fix_all is a safe action (non-sensitive) but dev-only.
14. **DV-04 — /performance display-only:** `/performance` in Dev mode shows diagnostic metrics. No write actions permitted. TEMPLATE_ONLY wiring only.

### SIMULATED MODE RULES

15. **SIM-01 — Badge mandatory:** `/orchestration-intelligence` and `/quantum-center` must show SIMULATED_UI badge at all times. Not dismissible.
16. **SIM-02 — No live data:** SIMULATED routes must not display data from live IPC calls. Any data shown is explicitly labeled as simulated.
17. **SIM-03 — No nav registration:** SIMULATED routes must not be registered in Daily, System, or Dev primary nav.

### LAB MODE RULES (reserved for future)

18. **L-01 — Lab mode undefined in v36:** No Lab mode implemented in v36. Spec only — requires separate proposal.

---

## Rule Enforcement Matrix

| Rule | Guard | Phase |
|------|-------|-------|
| D-02, SIM-01, SIM-03 | guard-surface-matrix.mjs | Gate 7+ |
| D-06 | guard-model-boundary.mjs | All |
| DV-02 | guard-model-boundary.mjs | All |
| D-03 | guard-surface-matrix.mjs | Gate 10+ (P2) |
| S-01, DV-01 | 09_security_guard agent | Gate 10+ (P2) |

---

## Verdict

```
MODE_RULES_DEFINED=PASS
DAILY_RULES=6
SYSTEM_RULES=4
DEV_RULES=4
SIMULATED_RULES=3
LAB_RULES=RESERVED
DAILY_SYSTEM_DEV_RULES=COMPLETE
```
