# AI Agent Orchestration Checklist - 2026-03-22

Status: BLOCKED
Scope: Planning and document alignment only
Execution mode: PATH_HEAVY

## 1. Requested document mapping

- [x] Main AI prompt equivalent located:
  [docs/plans/execution_prep_kits_20260309/VSCODE_PROMPTS_V2.md](docs/plans/execution_prep_kits_20260309/VSCODE_PROMPTS_V2.md)
- [x] Structured execution task kit located:
  [docs/plans/execution_prep_kits_20260309/H1_EXEC_KIT.md](docs/plans/execution_prep_kits_20260309/H1_EXEC_KIT.md)
- [x] Source-of-truth roadmap and audit state located:
  [docs/plans/phase_preparation_20260309/ROADMAP_CANONICAL.md](docs/plans/phase_preparation_20260309/ROADMAP_CANONICAL.md)
- [x] Bootstrap truth located:
  [docs/plans/phase_preparation_20260309/00_BOOTSTRAP_TRUTH.md](docs/plans/phase_preparation_20260309/00_BOOTSTRAP_TRUTH.md)
- [x] Binary go/no-go matrix located:
  [docs/plans/execution_prep_kits_20260309/VERDICT_MATRIX.md](docs/plans/execution_prep_kits_20260309/VERDICT_MATRIX.md)
- [x] Legacy prompt pack also located:
  [docs/plans/phase_preparation_20260309/03_VSCODE_PROMPTS.md](docs/plans/phase_preparation_20260309/03_VSCODE_PROMPTS.md)

## 2. Important discrepancy

- [x] The exact files named by the user were not found in the workspace.
- [x] Planning below is based on the closest canonical equivalents listed above.
- [ ] If the user intended different files, execution must pause until those exact paths are provided.

## 3. Reality capture

- [x] Kernel and scoped instructions read
- [x] PATH_HEAVY prompt read
- [x] Proof-pack prompt read
- [x] Repo memory for task pack preconditions read
- [x] Git worktree is not clean

Current drift detected before any governed execution:
- Version bump edits already present in README, docs/README, package.json, src-tauri/Cargo.toml, src-tauri/Cargo.lock, src-tauri/tauri.conf.json, CHANGELOG.md.

## 4. Stop conditions

- [ ] STOP if exact source documents must be used and alternates are not acceptable.
- [ ] STOP if governed execution is requested while worktree remains dirty and changes are not classified.
- [ ] STOP if verify_instructions is not PASS.
- [ ] STOP if H1 pre-flight fails.
- [ ] STOP if P9 build hash mismatches.
- [ ] STOP with BLOCKED_APPROVAL for H3/H4 without PROD tokens.

## 5. Canonical execution order

- [ ] Phase A - Confirm source documents
  - Accept mapped canonical docs or replace with exact user-specified paths.
- [ ] Phase B - Bootstrap reality capture
  - Git status
  - Branch and HEAD
  - Dirty-tree classification
  - Validator baseline
- [ ] Phase C - H2 environment readiness
  - Tauri deps
  - Rust
  - pnpm
  - environment proof
- [ ] Phase D - H1 terminal execution
  - pre-flight
  - dist placeholder
  - P9 build #2
  - normalized hash #2 comparison
  - P9 build #3
  - normalized hash #3 comparison
  - P9 artifact
  - P8 verification
  - autoheal append
  - validators
  - proof pack
- [ ] Phase E - H2 tier 2 excellence
  - vitest
  - tsc
  - eslint
  - prettier
  - validators
- [ ] Phase F - H3 certification freeze
  - requires GO_FOR_PROD_BUILD__TITANE_INFINITY
- [ ] Phase G - H4 release and production deploy
  - requires GO_FOR_PROD_BUILD__TITANE_INFINITY
  - requires GO_FOR_PROD_DEPLOY__TITANE_INFINITY

## 6. Immediate next actions

- [ ] Classify current dirty worktree against planned governed run
- [ ] Decide whether this session is planning-only or full execution
- [ ] If full execution: run Phase B first, then H2/H1 exactly in matrix order

## 7. Planning verdict

Verdict: BLOCKED
Reason: The exact three user-named files are absent, and the repository is already dirty. Planning is possible, but governed execution should not start until those two ambiguities are resolved.