# TITANE_INFINITY Instruction Authority Map

This document is the canonical map of where instruction authority lives in the repository.
It is intentionally short and reference-style.

## Layers

- **L1 — Kernel authority**
  - `.github/copilot-instructions.md`
  - Governs global invariants, status vocabulary, proof-first discipline, and no-token-gate production policy.
- **L2 — Path-specific instructions**
  - `.github/instructions/*.instructions.md`
  - Contains domain-specific guidance for frontend, Tauri, E2E, docs, and other scoped changes.
- **L3 — Local AGENTS**
  - `AGENTS.md`, `src/AGENTS.md`, `src-tauri/AGENTS.md`, `e2e/AGENTS.md`, `docs/AGENTS.md`, `scripts/AGENTS.md`
  - Holds surface-local conventions for the repository areas they cover.
- **L4 — Specialized agents**
  - `.github/agents/*.agent.md`
  - Defines agent missions, allowed tools, and escalation patterns.
- **L5 — Prompt files**
  - `.github/prompts/*.prompt.md`
  - Provides reusable prompt scaffolding and reasoning templates.
- **L6 — Mechanical truth**
  - `scripts/verify/*.sh`
  - `scripts/autoheal/*`
  - `governance/*`
  - Contains executable validators and authoritative mechanical checks.

## Conflict policy

- Lower layers must not override higher-layer invariants.
- If a rule appears in more than one layer, the canonical enforcement belongs to the lowest sufficient authority.
- Validator output overrides repeated prose when there is a real conflict.
- Unresolved layer conflict defaults to `BLOCKED_DOCTRINE`.

## Where to look

- verdict vocabulary: `.github/copilot-instructions.md`
- frontend/UI rules: `.github/instructions/frontend.instructions.md`
- Tauri/IPC rules: `.github/instructions/tauri.instructions.md`
- E2E rules: `.github/instructions/tests-e2e.instructions.md`
- docs/proof pack rules: `.github/instructions/docs-registry.instructions.md`
- scripts/gate rules: `scripts/verify/*.sh`
- agent index: `.github/agents/*.agent.md`
- prompt index: `.github/prompts/*.prompt.md`
- layer priority reference: `governance/layer_priority.yaml`
- build/release truth: `package.json` + `vite.config.ts` + `scripts/verify/*.sh`
- UI runtime truth: `src/hooks/useSurfaceTruth.ts` + `SurfaceTruthBadge` + `data-surface-truth` attributes

## Canonical rule

A rule must live at the lowest sufficient authority layer. Repeated rules should become references or validators, not duplicate kernel doctrine.
