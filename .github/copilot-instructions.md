## Exigences agents avancés (Monitoring, Diagnostic, Explainability, Orchestrateur, Sécurité)

- Dashboard UI avec `data-testid` stable + E2E Playwright
- Service dédié dans `src/services/<agent>`
- Mapping à jour dans `UI_SURFACE_MAP.md`, `CARTOGRAPHY_COMPLETE.md`, `ARCHITECTURE.md`
- Preuve visible: capture, alerte, log ou rapport
- Rollback documenté
  Tout agent non mappé, non testé ou sans preuve = BLOCKED (Rule 15/16).

# TITANE_INFINITY - Copilot Kernel (Governed)

Mode: AUTO | Objective: execute with proof-first discipline and zero drift.
Compatibility marker: Local-first (compatibility marker; doctrine active = Online-first governed with mandatory local fallback). Workflow: diagnose -> plan -> apply -> verify -> report.

## Priority

- Canonical priority: this file is the constitutional kernel.
- Layer order: kernel -> path-specific instructions -> nearest AGENTS.md -> selected custom agent -> selected prompt file -> task context -> runtime proof/validator truth. Formal IDs: L1=kernel, L2=path-specific, L3=local-AGENTS, L4=custom-agents, L5=prompts, L6=mechanical-truth; see `governance/layer_priority.yaml`.
- Lower layers must never redefine higher-layer invariants.

## Status Vocabulary

- PASS / FAIL / BLOCKED / BLOCKED_APPROVAL / DONE / SEALED
- Verdict unique is mandatory.

## Rule 1 - Minimal patch only

Apply the smallest safe change set that solves the task. No gratuitous refactor.

## Rule 2 - Proof before verdict

No PASS without executable proof. No DONE/SEALED without relevant checks.
Proof definition: verbatim real command output with exit code, or real validator stdout. Paraphrasing, inference, or summarizing command output does not constitute proof. A narrative PASS with no real output = NO_PROOF → triggers Rule 8.

## Rule 3 - 4-Ring architecture

Preserve strict 4-Ring boundaries. No inverse imports. No Ring1/Ring2 I/O.

## Rule 4 - Tauri-only production runtime

Production runtime is Tauri-only. Any capability/allowlist change requires explicit tests and rollback.

## Rule 5 - One Door network governance

Allowed path: UI -> canonical IPC -> Services -> Network Gateway -> External. No uncontrolled UI direct network access.

## Rule 6 - IPC canonical contract

IPC payload contract is mandatory: `{ ok, content, error }`. Zero silent failure and no lying fallback.

## Rule 7 - Online-first governed with mandatory local fallback

Online-first governed policy is active. Local fallback is mandatory and operational.

## Rule 8 - Stop-the-line

Stop-the-line on invariant violation, mandatory gate FAIL, unresolved contradiction, or missing proof. Classify explicitly as FAIL or BLOCKED.
Narrative PASS (claiming success with no real executable proof) is an invariant violation. Classify as FAIL, rerun the relevant gate, and produce real verbatim output before continuing.

## Rule 9 - NO_SKIPS policy

NO_SKIPS: required checks cannot be skipped by narrative. If a check cannot run, classify BLOCKED with a next action <= 30 minutes.

## Rule 10 - AutoHeal capture is mandatory and automatic

For every code modification under `src/`, `src-tauri/`, `tests/`, `e2e/`, `scripts/`, or `.github/`: append one full-schema entry to `scripts/autoheal/autoheal_rules.jsonl`, run anti-regression checks relevant to touched scope, run `bash scripts/autoheal/detect_recurrence.sh` and `bash scripts/verify_instructions.sh`, and classify FAIL with immediate rollback if either gate fails. AutoHeal `id` must be unique and `prevention_test` must include `detect_recurrence`.

## Rule 11 - Production builds on demand

Production builds and deploys run on user request or when needed, with no token gate. Use `BUILD ALL` (Rule 14) for the full sequence. Pre-build checks are version bump (Rule 13), relevant test gates, and anti-regression scan (Rule 10).

## Rule 12 - Proof pack and rollback required

Each governed session must produce evidence in `proof_packs/` and `reports/`: mandatory gate report, rollback plan, and final unique verdict.

## Doctrine conflict handling

If contradiction remains unresolved after minimal patch: classify `BLOCKED_DOCTRINE`.

## Rule 13 - Version bump at each advanced BUILD

At each advanced BUILD, increment patch by 0.0.1 in `package.json`, run `node scripts/bump-version.mjs` or `pnpm run bump:version`, then `node scripts/sync-versions.mjs` or `pnpm run sync:versions`, and keep the current version visible in the TITANE footer.
Desktop launcher freshness after every build: run `bash scripts/post-build/update-desktop-icons.sh`, refresh icon/desktop caches, and verify both launcher files expose `Exec=/usr/bin/titane-infinity` and `Icon=titane-infinity` or the latest explicit icon path.
If old icons persist, purge obsolete launchers, replace the hicolor icon if needed, and refresh caches again.
Android freshness: treat `dist/`, backend, packaged artifact, and installed device runtime as four truths. Rebuild frontend first, keep `scripts/android/vite-network-server.sh` as the sole stable Vite authority, prove `http://127.0.0.1:1420` stays reachable before browser proof, run `corepack pnpm run android:artifact:check`, and only claim device truth with `adb shell dumpsys package com.titane.infinity` evidence. Any frontend/backend IPC mismatch such as `CONTRACT_VIOLATION_CLAMPED` or `tauri_protector_ipc_fallback` is FAIL until rebuilt and reverified.
Operational authority: only one active execution authority and one active E2E authority at a time.

## Rule 14 - BUILD ALL command

When the user issues `BUILD ALL`, execute the full automated sequence without token gate: bump version; production build + deploy; build AppImage/DEB/RPM; build Android APK; build Windows installer if applicable; uninstall existing installations and dock icons; clean caches; reinstall; update release notes, checksums, and `RELEASE_SURFACE_INVENTORY`; verify and fix regressions, errors, warnings, and blockers; run AutoHeal; update all relevant mapping docs.

## Rule 15 - Auto-update mapping and cartography

Every code modification must update the relevant mapping docs: `UI_SURFACE_MAP.md` for UI surfaces, `ARCHITECTURE.md` for architecture, `OLLAMA_RUNTIME_MAP.md` for Ollama, `RELEASE_SURFACE_INVENTORY.md` for release/version surfaces, `docs/CARTOGRAPHY_COMPLETE.md` for structural change, and `docs/IPC_CATALOG.md` for IPC changes. Trigger table: `src/**`, `src/components/**`, `src/pages/**` -> `UI_SURFACE_MAP.md` + `docs/CARTOGRAPHY_COMPLETE.md`; `src-tauri/src/**` new command -> `docs/IPC_CATALOG.md` + `ARCHITECTURE.md` + `docs/CARTOGRAPHY_COMPLETE.md`; `src/engines/**` and Ring 2 `src-tauri/src/` -> `ARCHITECTURE.md` + `docs/CARTOGRAPHY_COMPLETE.md`; Ollama integration -> `OLLAMA_RUNTIME_MAP.md`; version/build artifacts -> `RELEASE_SURFACE_INVENTORY.md`; `docs/diagrams/**` -> `docs/diagrams/README.md` + `docs/diagrams/CANON_INDEX.md`. Missing required mapping update is FAIL.

## Rule 16 - Mandatory test creation

Every new integration, capability, or function must ship with unit tests, integration tests when cross-module, E2E tests when user-facing, and advanced Q&A scenario tests when applicable. Enforcement matrix: new IPC command -> Rust unit + `tests/contract/tauri-ipc-contract.test.ts`; new UI component/page -> Vitest + E2E with stable `data-testid`; new engine/service -> Vitest + integration; new Ollama/AI integration -> provider + offline fallback + Q&A scenario; new user-visible capability -> E2E scenario + advanced Q&A scenario; new build/deploy step -> artifact smoke + checksum. New source files without corresponding tests are BLOCKED.

## Rule 17 - Canonical surface anti-drift

For every UI/runtime correction involving route alias, legacy surface, fullscreen shell, or compatibility export: identify the real active runtime surface first; align active router, deprecated router, preloading, compatibility exports, targeted tests, and touched tooling references in the same phase; search for stale live references before PASS; reduce compatibility-only paths to thin aliases; and treat any mismatch between visible truth and touched surface as FAIL until realigned.
Advanced agent runtime truth: monitoring, diagnostic, explainability, orchestrator, and security dashboards must consume real runtime/configuration signals when available; derive `serviceState`, `evidence`, `blockers`, and `nextStep` from verifiable truth; classify partial implementations honestly; and keep dashboards and compatibility aliases aligned to one runtime truth source.
Ollama Dev / Ollama Chat boundary truth: keep the governed local development stack aligned on `http://127.0.0.1:11434` + `qwen3.5:9b` for GitHub Copilot VS Code conversation, while the TITANE product chat runtime stays aligned on `gemma2:2b`, canonical IPC, and no token gate. Ollama Dev and Ollama Chat must remain independent with zero contamination through shared defaults, champion registries, prompts, or backend fallbacks. Controlled communication between them is allowed only through explicit, traced, bounded interfaces such as repo-owned validators, documentation, proofs, or neutral config exchange. Any Ollama Dev / Ollama Chat boundary change must rerun the dedicated boundary validator and update `OLLAMA_RUNTIME_MAP.md` plus the relevant instructions/docs.

## Discipline anti-dérive TITANE (Synthèse 2026-04-16)

- Synchronisation artefacts/launchers avec preuve sur launchers système et utilisateur
- Toute évolution UI/backend impose des tests E2E sur flows critiques et secondaires avec `data-testid` stables
- Toute modification de surface impose mapping à jour, bump de version, rollback documenté, scripts post-build idempotents ou fallback documenté, et logs de preuve pour chaque étape `sudo`
- Le backend doit être qualifié par des tests d’isolation d’environnement et des checks automatiques sur les variables critiques
- Chaque correction/rollback doit être tracé dans `autoheal_rules.jsonl` et `registry/ui-events.jsonl`- Session start checklist: (1) consulter plan.md ou summary de la session précédente; (2) `git status --short` pour connaître l'état du worktree; (3) déclarer MODE (DURABLE ou EXPLORATION) explicitement; (4) identifier les commits en attente (Rule 18 phases not yet committed).
## Rule 18 - Direct-to-main phase commits

When direct work on `MAIN` is authorized, every completed correction phase or coherent fix batch must end with a targeted commit on `MAIN` after proofs pass. Do not accumulate unrelated finished fixes in an uncommitted worktree. Each direct-to-main commit must stay scope-limited, mention the corrected surface or subsystem, and wait for AutoHeal plus mandatory validators. If proof is incomplete, do not commit the phase yet.

## Rule 20 - Session continuity

At the start of every session working on this repo: (1) read available session plan or conversation summary to restore context; (2) run `git status --short` to identify pending uncommitted work; (3) declare operating MODE explicitly (DURABLE or EXPLORATION); (4) identify any Rule 18 phase that completed proofs but was not yet committed and commit it before starting new work. Never carry credentials, tokens, or private keys in session notes, plans, or proof files.

## Rule 19 - Exploration Mode vs Durable Mode

Every coding session operates in one of two modes. Declare the mode explicitly before starting work.

**Exploration Mode** — activated by naming a branch `explore/*`, a file `*.spike.*`, or by explicit declaration `MODE=EXPLORATION` in the session. Governance is lightweight: AutoHeal entry with reduced schema (id, date, scope, symptom, fix only), no version bump, no proof_pack required, no mapping update obligation. Exploration code is disposable by default — it must be explicitly promoted to Durable before merge to `MAIN`.

**Durable Mode** — the default for all work on `MAIN` and `feature/*` branches. Full Rule 1–18 discipline applies: AutoHeal full schema, version bump at BUILD, proof_pack, mapping updates, tests (Rule 16), rollback plan.

**Promotion gate**: before merging Exploration code to MAIN, classify the code as `durable` explicitly, run full test gates, append AutoHeal full schema entry, and bump version. Undeclared Exploration code merged to MAIN = FAIL.
