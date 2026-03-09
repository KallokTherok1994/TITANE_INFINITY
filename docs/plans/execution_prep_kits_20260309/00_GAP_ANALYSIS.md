# Execution Prep Kits — Gap Analysis

**Date:** 2026-03-09  
**Session:** execution_prep_kits_20260309  
**Type:** PREP_ONLY — Docs only. No builds, tests, gates, installs, sudo.  
**Input source:** `docs/plans/phase_preparation_20260309/` (8 artifacts absorbed)

---

## 1. What Is Already Covered

The previous prep session (`phase_preparation_20260309`) delivered the following **at the phase/overview level**:

| Artifact | Coverage | Quality |
|----------|----------|---------|
| `00_BOOTSTRAP_TRUTH.md` | Repo state, SHA, autoheal count, active verdict | ✅ Complete |
| `01_PR176_ANALYSIS.md` | PR176 intent, diff summary, integration chain status | ✅ Complete |
| `02_PHASE_PREP_PACK.md` | H1→H4 phase overview, H1 high-level steps, success criteria | ✅ Adequate for planning |
| `03_VSCODE_PROMPTS.md` | One prompt per phase (H1/H2/H3/H4) | ⚠️ Functional but not granular |
| `04_GATES_PROOF_MATRIX.md` | Gate registry, proof requirements, rollback plans, autoheal template | ✅ Good coverage |
| `05_DEPENDENCY_RISK_MAP.md` | Phase dependency graph, risk matrix, next safe actions | ✅ Good coverage |
| `ROADMAP_CANONICAL.md` | End-to-end roadmap H1→H4, governance state | ✅ Authoritative |
| `SELF_AUDIT.md` | Prep-only self-audit, rollback | ✅ Minimal but sufficient |

### Key State Facts (from absorption)

- **HASH_1 (raw):** `b79b3cddcb6a7c0f8f1d8859b4da68464ae7a164f809fc492654bbbc08dcb830`
- **HASH_1 (normalized/G6):** `11e30ec1666c9636906c81f6a3564e053188758f8cf47647e6d6b6b5df303d9a`
- **P8:** PASS (cargo build + vite build done in PR176 session)
- **P9:** BLOCKED — builds #2 and #3 not yet run
- **G6 hardening:** Confirmed — `strip-unneeded` + `objcopy .note.gnu.build-id` removal in place
- **AutoHeal:** 145 entries, last ID = `AH-2026-03-09-0109`
- **Next AutoHeal ID:** `AH-2026-03-09-0110`

---

## 2. What Is Missing for Fast Execution

The existing pack provides **what to do** but not **how to execute it without stopping to think**. The gaps are:

### Gap 1 — No Entry Checklist (pre-flight, command-level)

The existing prompts start at "Step 1: git checkout MAIN" without verifying that the environment is ready. A missing `libwebkit2gtk-4.1-dev` will only surface at minute 16 into a build. Entry checklists with exact `dpkg -l / cargo --version / pnpm --version` checks are missing.

### Gap 2 — No Per-Step Go/No-Go Criteria

Each step in the H1 runbook needs an explicit:
- **Expected output** (exact string or exit code)
- **PASS condition** (what proves this step succeeded)
- **FAIL condition** (what to do if unexpected output appears)

Without this, an executor must interpret results, risking silent failures.

### Gap 3 — No Proof-Pack Skeletons (pre-created)

The gate matrix lists required proof files but does not provide them pre-created with the expected structure. An executor must create them from scratch during a time-pressured session. Pre-filled skeletons with `[FILL_ME_IN]` markers save 10–15 min.

### Gap 4 — No Verdict Matrix with Binary Pass/Fail per Step

A table mapping each step → expected exit code → PASS/FAIL verdict → what to do next is missing.

### Gap 5 — No Command Packs (copy-paste blocks, shell-ready)

The existing prompts mix narrative and commands. Command packs should be pure shell — no prose, no explanations — so they can be pasted directly into a terminal or a script file.

### Gap 6 — VSCode Prompts v1 are Phase-Level, Not Step-Level

The existing prompts are one large block per phase. VSCode Copilot works better with smaller, focused prompts one step at a time — especially for P9 which requires capturing hash output mid-run. v2 prompts should be structured as **one prompt per substep**.

### Gap 7 — H2 "Excellence" Not Separated from H2 "Env Provision"

H2 currently means "provision build environment." The "excellence" layer adds comprehensive quality verification beyond P8 minimum: Vitest 3288 tests, TypeScript noEmit, ESLint 0 warnings, full gate matrix. This is not captured as a distinct executable phase.

### Gap 8 — No Time Budget per Step

No estimates for individual steps. An executor cannot know if a step is taking too long or is stuck. Rough time budgets prevent wasted waiting on hung processes.

---

## 3. Transformation Plan

| Gap | Addressed By | Output File |
|-----|-------------|-------------|
| G1 — Entry checklist | H1 entry checklist block | `H1_EXEC_KIT.md` |
| G2 — Per-step go/no-go | Step verdict table in H1 runbook | `H1_EXEC_KIT.md` |
| G3 — Proof pack skeletons | Pre-filled templates | `PROOF_PACK_SKELETONS.md` |
| G4 — Verdict matrix | Binary pass/fail per step | `VERDICT_MATRIX.md` |
| G5 — Command packs | Shell-ready blocks, no prose | `COMMAND_PACKS.md` |
| G6 — Tighter VSCode prompts | v2 per-substep prompts | `VSCODE_PROMPTS_V2.md` |
| G7 — H2 excellence tier | Quality suite beyond P8 min | `H2_EXEC_KIT.md` |
| G8 — Time budgets | Per-step estimates | `H1_EXEC_KIT.md`, `H2_EXEC_KIT.md` |

---

## Rollback

```bash
git restore -- docs/plans/execution_prep_kits_20260309/
```
