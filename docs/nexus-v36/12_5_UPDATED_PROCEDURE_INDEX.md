# GATE 12.5 — UPDATED PROCEDURE INDEX

**Date:** 2026-05-29

---

## Active Procedure Documents

### Kernel / Always-On

| File | Purpose | Authority |
|------|---------|-----------|
| `.github/copilot-instructions.md` | Constitutional kernel (Rules 1–20 + NEXUS v36 section) | L1 (highest) |
| `.github/instructions/titane.instructions.md` | Path-scoped surface instructions | L2 |
| `AGENTS.md` | Agent OS index | L3 |
| `.claude/rules/frontend-runtime.md` | Frontend/runtime path rules | L2 |

### NEXUS v36 Governance

| File | Purpose |
|------|---------|
| `docs/nexus-v36/MASTER_GATE_LEDGER.md` | Gate 0–14 verdict table |
| `.titane-dev/state/nexus_gate_state.json` | Live gate state |
| `.titane-dev/state/nexus_gate_ledger.jsonl` | Audit trail |
| `.titane-dev/memory/nexus_phase_lock.md` | Phase lock + model boundary (updated 2026-05-29) |
| `docs/nexus-v36/07_SURFACE_DECISION_MATRIX.json` | 30-route classification authority |
| `proof_packs/nexus-v36-final-seal/` | Final seal proof pack |

### Guards

| Script | Enforces |
|--------|---------|
| `scripts/titane-dev/guard-scope.mjs` | Forbidden path mutations |
| `scripts/titane-dev/guard-secrets.mjs` | No secrets in tracked files |
| `scripts/titane-dev/guard-model-boundary.mjs` | gemma2:2b product / qwen dev isolation |
| `scripts/titane-dev/guard-surface-matrix.mjs` | 30 routes, 0 deletions, 0 renames |
| `scripts/titane-dev/guard-mcp-config.mjs` | MCP config validity |
| `scripts/titane-dev/guard-phase-lock.mjs` | P2 gate-by-gate approval |
| `scripts/titane-dev/guard-gate-ledger.mjs` | Ledger integrity |
| `scripts/titane-dev/guard-runtime-adapter-scan.mjs` | No raw invoke() in src/ |

### Visual Proof

| Artifact | Status |
|----------|--------|
| `artifacts/ui-visual/screenshots/v79/production/` | 58 real PNGs (2026-05-19) |
| `artifacts/nexus-v36/final-visual-captures/index.json` | 58 entries, valid JSON |
| `docs/nexus-v36/13_SCREENSHOT_INDEX.md` | Screenshot index document |
