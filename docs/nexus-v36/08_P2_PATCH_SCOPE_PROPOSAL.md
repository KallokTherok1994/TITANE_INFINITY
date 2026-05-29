# GATE 8 — P2 PATCH SCOPE PROPOSAL

**Project:** TITANE_INFINITY  
**Date:** 2026-05-28  
**Phase:** P1 SPEC — awaiting APPROVE_P2_GATE_10

---

## Proposal Summary

This document defines the exact scope of P2 work that will be unlocked when Kevin provides `APPROVE_P2_GATE_10`.

**P2 = First code changes to `src/` in this NEXUS sequence.**

---

## P2 Scope Boundary

### What IS in P2 Scope

| Category | Items |
|----------|-------|
| New components | NexusShell, CommandPalette, TruthBadge, EmptyStateTruth (see 08_NEXUS_PATCH_PLAN.md) |
| New lib files | routeIndex.ts |
| Modified files | src/App.tsx (NexusShell wrapper), src/index.css (CSS vars only) |
| Docs | AutoHeal entries, verify_instructions run |

### What is NOT in P2 Scope

| Category | Why Excluded |
|----------|-------------|
| Existing page components (TitanePage, TimePage, etc.) | Not touched in v36 |
| Route definitions / router config | No route changes in v36 |
| src-tauri/ | Rust changes are v37+ territory |
| package.json / pnpm-lock | No new dependencies unless approved separately |
| .github/workflows | CI pipeline unchanged |
| Product chat model (gemma2:2b) | Immutable |
| IPC command registry | No new Tauri commands in v36 |

---

## P2 Risk Register

| Risk | Likelihood | Mitigation |
|------|-----------|-----------|
| App.tsx wrap breaks router | LOW | Additive wrapper; preserve existing Outlet |
| CSS var conflict | LOW | All vars namespaced `--badge-*` |
| CommandPalette Ctrl+K conflict | LOW | Check for existing Ctrl+K listeners first |
| NexusShell re-render on mode switch | LOW | Memo + context; no page remount |
| TruthBadge z-index conflict | LOW | Use portal + z-index 8000 (below modal z-9999) |

---

## P2 Required Proofs

For each patch, required proof before claiming PASS:

| Patch | Required Proof |
|-------|---------------|
| P36-01 NexusShell | Unit test: mode context available in child; no route remount |
| P36-02 CommandPalette | E2E: Ctrl+K opens palette, Enter navigates, Escape closes |
| P36-05 TruthBadge | Visual: badge visible on /titane (LIVE*), /quantum-center (SIMULATED) |
| P36-07 App.tsx | Certifier PASS before and after; no DOM SurfaceTruth regression |
| P36-08 index.css | CSS var test: `--badge-live` resolves correctly |

---

## P2 Approval Request

Kevin must provide the exact string:

```
APPROVE_P2_GATE_10
```

Without this approval, no P2 patches will be applied. Gate 9 creates the final checkpoint before asking for this approval.

---

## P2 AutoHeal Obligation

For every file modified in P2:
1. Append entry to `scripts/autoheal/autoheal_rules.jsonl`
2. Run `bash scripts/autoheal/detect_recurrence.sh`
3. Run `bash scripts/verify_instructions.sh`

---

## Verdict

```
P2_SCOPE_DEFINED=PASS
P2_FILES_IN_SCOPE=9
P2_FILES_OUT_OF_SCOPE=EXISTING_PAGES+ROUTER+TAURI+PIPELINE
P2_RISK_REGISTER=5_RISKS_MITIGATED
P2_APPROVAL_REQUIRED=APPROVE_P2_GATE_10
P2_PATCH_SCOPE_PROPOSAL=COMPLETE
```
