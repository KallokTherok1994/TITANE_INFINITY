## Exigences agents avancés (Monitoring, Diagnostic, Explainability, Orchestrateur, Sécurité, Log Analysis)

- Dashboard `data-testid` E2E + service `src/services/<agent>` + mapping (UI_SURFACE_MAP, CARTOGRAPHY_COMPLETE, ARCHITECTURE) + preuve visible + rollback documenté.
- `log_analysis`: rapport intelligent (anomalies, erreurs, incohérences, améliorations) vérifié via gate dédié. Tout agent non mappé/non testé/sans preuve = BLOCKED (Rule 15/16).

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

At each advanced BUILD, increment patch by 0.0.1 in `package.json`, run `node scripts/bump-version.mjs` or `pnpm run bump:version`, then `node scripts/sync-versions.mjs` or `pnpm run sync:versions`, and keep the current version visible in the TITANE footer. `sync:versions` also syncs `runtime/dev/tauri.conf.json` to `{version}-dev` — **never leave dev config on a stale version**. After any version bump, immediately run `pnpm run sync:versions` to propagate the new version to dev, stable, and all tauri configs in one step.
Desktop/launcher freshness: run `bash scripts/post-build/update-desktop-icons.sh`, verify launcher icon paths; purge and refresh caches if stale.
Android freshness: treat `dist/`, backend, packaged artifact, and installed device runtime as four truths. Rebuild frontend first, keep `scripts/android/vite-network-server.sh` as the sole stable Vite authority, prove `http://127.0.0.1:1420` stays reachable before browser proof, run `corepack pnpm run android:artifact:check`, and only claim device truth with `adb shell dumpsys package com.titane.infinity` evidence. Any frontend/backend IPC mismatch such as `CONTRACT_VIOLATION_CLAMPED` or `tauri_protector_ipc_fallback` is FAIL until rebuilt and reverified.
Operational authority: only one active execution authority and one active E2E authority at a time.

## Rule 14 - BUILD ALL command

When the user issues `BUILD ALL`, execute the full automated sequence without token gate: bump version; run `pnpm run sync:versions` (propagates version to `runtime/dev/tauri.conf.json` as `{version}-dev`, `runtime/stable/tauri.conf.json`, `src-tauri/tauri.conf.json`, and all tauri base configs); production build + deploy; build AppImage/DEB/RPM; build Android APK; build Windows installer if applicable; **update and rebuild the DEV Tauri build** (`pnpm run dev:tauri` or `tauri build --config runtime/dev/tauri.conf.json`) to confirm the dev runtime is at the correct version before any stable build; verify the HTTP network server surface is refreshed and reachable, and confirm that visible UI/frontend interface changes are present before sealing the build; uninstall existing installations and dock icons; clean caches; reinstall; update release notes, checksums, and `RELEASE_SURFACE_INVENTORY`; verify and fix regressions, errors, warnings, and blockers; run AutoHeal; update all relevant mapping docs.

## Rule 14.2 — Frontend Runtime Pre-BUILD Gate

`bash scripts/verify/prebuild-frontend-runtime-certifier.sh` must return `FRONTEND_RUNTIME_PREBUILD=PASS / BUILD_ALLOWED=YES` before any build touching `src/**`, `index.html`, `public/**`, `tailwind.config.*`, `vite.config.*`, `src-tauri/tauri.conf.json`, `runtime/stable/**`, or `.github/**`. Block on FAIL, BLOCKED, UNKNOWN, PARTIAL, STALE, or NARRATIVE_ONLY. Proof chain: source → active route → Vite build → dist → CSS → Tauri → AppImage → launcher → DOM SurfaceTruth.

## Rule 14.3 — IPC Security Whitelist Synchronisation

Every new `#[tauri::command]` added to Rust MUST be registered in BOTH `src/lib/tauriCommands.ts` (string value) AND `ALLOWED_COMMANDS` in `src/lib/security.ts`. Omission = silent runtime block. Lane 8.6 (`gate-ipc-whitelist-completeness.sh`) enforces this pre-build.

## Rule 14.1 - PRE-BUILD CERTIFIER AND ZERO-DEFECT BUILD PERMISSION

`BUILD ALL`, advanced build, production build, native packaging, release packaging, deploy, artifact certification, or `deployment/latest` sync is forbidden until the canonical pre-build certifier returns `BUILD_ALLOWED=YES`.

The Pre-BUILD Certifier does not build. It certifies whether build is allowed. Route through `.github/agents/pre-build-certifier.agent.md` or an equivalent full pre-build workflow.

Lifecycle: `DISCOVER → CERTIFY → FIX → RE-CERTIFY → BUILD_PERMISSION → BUILD_HANDOFF → POST_BUILD_SEAL`

### Mandatory BUILD_PERMISSION_MATRIX lanes (all must be PASS or NOT_APPLICABLE_WITH_PROOF)

**Lane 0 — WORKTREE**: `git status --short`, `git branch --show-current`, `git rev-parse --short HEAD`, `node -p "require('./package.json').version"`. Dirty worktree requires explicit continuation approval.

**Lane 1 — AUTHORITY_MAP / PIPELINE_AUTHORITY**: single canonical build authority, no pipeline conflict. Classify `BLOCKED_AUTHORITY_CONFLICT` if plural.

**Lane 2 — INSTRUCTIONS / AGENT_CONFIG**: run all validators:

```bash
bash scripts/verify/verify-pre-build-certifier-agent.sh
bash scripts/verify/verify_instruction_layers.sh
bash scripts/verify/verify_no_doctrine_duplication.sh
bash scripts/verify/verify_status_vocabulary.sh
bash scripts/verify/verify_agents_index.sh
bash scripts/verify/verify_prompt_files_index.sh
bash scripts/verify/verify_local_markers_consistency.sh
bash scripts/verify/verify-vscode-agent-workflow.sh
bash scripts/verify/gate-build-truth.sh
bash scripts/verify/gate-version-truth.sh
bash scripts/autoheal/detect_recurrence.sh
bash scripts/verify_instructions.sh
pnpm run verify:instructions
```

**Lane 3 — TOOLCHAIN**: `pnpm -v`, `node -v`, `rustc --version`, `cargo --version`, `pnpm exec tauri --version`.

**Lane 4 — FRONTEND_STATIC**: `pnpm run check` (0 TypeScript errors) + `pnpm run lint` (0 ESLint errors). Both must be zero-error.

**Lane 5 — FRONTEND_TESTS**: `pnpm run test --run` → all tests PASS (baseline 9514/9514). Any regression is FAIL.

**Lane 6 — BACKEND_RUST_TAURI**: `pnpm run test:rust`, `pnpm run verify:tauri-configs`, `pnpm run verify:tauri-only`.

**Lane 7 — IPC_CONTRACT**: `pnpm run guard:ipc-contract` → PASS. IPC contract `{ ok, content, error }` must be preserved.

**Lane 8 — NETWORK_GOVERNANCE**: `pnpm run verify:online-first`, `pnpm run verify:network-guard`. One Door network: UI → IPC → services → gateway → external must be intact.

**Lane 9 — CLEAN_STALE_CACHE**: `pnpm run dev:cleanup || true`, `pnpm run clean:vite || true`. No stale dist/ artifacts from a previous session.

**Lane 10 — DEV_TAURI_RUNTIME** _(mandatory — added 2026-05-17)_:

1. Run `pnpm run sync:versions` — must propagate `{version}-dev` to `runtime/dev/tauri.conf.json` and window title.
2. Verify `runtime/dev/tauri.conf.json` version == `{package.json version}-dev` (e.g. `35.1.8-dev`). Mismatch = FAIL.
3. Run `pnpm run dev:tauri` and wait for `BOOT:READY` in logs.
4. Confirm window title shows correct version (`Titan-Dev vX.Y.Z [DEV]`).
5. Confirm `warn=0 error=0` in TAURI_MONITOR summary. Required proof fields:
   ```
   DEV_TAURI_VERSION={version}-dev  BOOT:READY=YES  ERRORS=0  WARNS=0
   ```

**Lane 11 — DEVTOOLS_CONSOLE**: 0 `console.error`, 0 unresolved `console.warn` in DevTools. Block on unresolved errors.

**Lane 12 — PAGE_ERRORS**: 0 `pageerror`, 0 `unhandledrejection`. Block on any uncaught rejection.

**Lane 13 — HTTP_NETWORK**: 0 `requestfailed`, 0 HTTP 400+, 0 CORS, 0 mixed content, 0 asset 404, 0 chunk load error. Block on any failed request.

**Lane 14 — WEBUI_ROUTE**: canonical routes verified (`pnpm run verify:ui-desktop-main-menu-reconciliation:current`), no stale assets, no wrong server/port.

**Lane 15 — VISIBLE_UI**: visible UI confirms correct version in footer, no blank screens, no wrong route. `pnpm run verify:ui-visual-capture` or equivalent screenshot proof.

**Lane 16 — RUNTIME_PROMOTION**: no `ACTIVE_PARTIAL`, `MIXED_LIVE_AND_STATIC`, simulated, or mock-gated surfaces promoted without live proof.

**Lane 17 — E2E_DESKTOP_WEBUI**: `pnpm run test:e2e` or `pnpm run e2e:desktop` → PASS.

**Lane 18 — AUTOHEAL**: `bash scripts/autoheal/detect_recurrence.sh` → PASS. No unaddressed recurrence.

**Lane 19 — VALIDATORS**: `pnpm run verify` → all verify:\* scripts PASS.

**Lane 20 — RELEASE_SURFACE_PRECHECK**: `bash scripts/verify/gate-stable-artifact-freshness.sh` → PASS. `package.json`, `runtime/stable/manifest.json`, `runtime/stable/tauri.conf.json`, `deployment/latest/MANIFEST.json` all at same version. Stable AppImage/DEB present in `runtime/stable/`.

**Lane 21 — ROLLBACK**: rollback path documented, previous stable artifact reachable, rollback steps verified.

**Lane 22 — PROOF_PACK**: `BUILD_PERMISSION_MATRIX.md` complete inside proof pack with all 26 lanes classified. `BUILD_ALLOWED=YES` only if every required lane is `PASS` or `NOT_APPLICABLE_WITH_PROOF`.

### Blocking rules

- No BUILD ALL while any required lane is `FAIL`, `BLOCKED`, `BLOCKED_ENV`, `BLOCKED_APPROVAL`, `BLOCKED_SUDO_REQUIRED`, `UNKNOWN`, `PARTIAL`, `NOT_RUN`, stale, missing, warning-unclassified, or narrative-only.
- No narrative PASS. No screenshot-only PASS. No source-only PASS. No build before proof.
- Auto-correct bounded failures, add recurrence tests, append AutoHeal, emit `BUILD_PERMISSION_MATRIX.md`, and complete the proof pack before declaring `BUILD_ALLOWED=YES`.

## Rule 15 - Auto-update mapping and cartography

Every code modification must update the relevant mapping docs: `UI_SURFACE_MAP.md` for UI surfaces, `ARCHITECTURE.md` for architecture, `OLLAMA_RUNTIME_MAP.md` for Ollama, `RELEASE_SURFACE_INVENTORY.md` for release/version surfaces, `docs/CARTOGRAPHY_COMPLETE.md` for structural change, and `docs/IPC_CATALOG.md` for IPC changes. Trigger table: `src/**`, `src/components/**`, `src/pages/**` -> `UI_SURFACE_MAP.md` + `docs/CARTOGRAPHY_COMPLETE.md`; `src-tauri/src/**` new command -> `docs/IPC_CATALOG.md` + `ARCHITECTURE.md` + `docs/CARTOGRAPHY_COMPLETE.md`; `src/engines/**` and Ring 2 `src-tauri/src/` -> `ARCHITECTURE.md` + `docs/CARTOGRAPHY_COMPLETE.md`; Ollama integration -> `OLLAMA_RUNTIME_MAP.md`; version/build artifacts -> `RELEASE_SURFACE_INVENTORY.md`; `docs/diagrams/**` -> `docs/diagrams/README.md` + `docs/diagrams/CANON_INDEX.md`. Missing required mapping update is FAIL.

## Rule 16 - Mandatory test creation

Every new integration, capability, or function must ship with unit tests, integration tests when cross-module, E2E tests when user-facing, and advanced Q&A scenario tests when applicable. Enforcement matrix: new IPC command -> Rust unit + `tests/contract/tauri-ipc-contract.test.ts`; new UI component/page -> Vitest + E2E with stable `data-testid`; new engine/service -> Vitest + integration; new Ollama/AI integration -> provider + offline fallback + Q&A scenario; new user-visible capability -> E2E scenario + advanced Q&A scenario; new build/deploy step -> artifact smoke + checksum. New source files without corresponding tests are BLOCKED.

## Rule 17 - Canonical surface anti-drift

For every UI/runtime correction involving route alias, legacy surface, fullscreen shell, or compatibility export: identify the real active runtime surface first; align active router, deprecated router, preloading, compatibility exports, targeted tests, and touched tooling references in the same phase; search for stale live references before PASS; reduce compatibility-only paths to thin aliases; and treat any mismatch between visible truth and touched surface as FAIL until realigned.
Advanced agent runtime truth: monitoring, diagnostic, explainability, orchestrator, and security dashboards must consume real runtime/configuration signals when available; derive `serviceState`, `evidence`, `blockers`, and `nextStep` from verifiable truth; classify partial implementations honestly; and keep dashboards and compatibility aliases aligned to one runtime truth source.
Ollama Dev / Ollama Chat boundary truth: keep the governed local development stack aligned on `http://127.0.0.1:11434` + `qwen3.5:9b` for GitHub Copilot VS Code conversation, while the TITANE product chat runtime stays aligned on `gemma2:2b`, canonical IPC, and no token gate. Ollama Dev and Ollama Chat must remain independent with zero contamination through shared defaults, champion registries, prompts, or backend fallbacks. Controlled communication between them is allowed only through explicit, traced, bounded interfaces such as repo-owned validators, documentation, proofs, or neutral config exchange. Any Ollama Dev / Ollama Chat boundary change must rerun the dedicated boundary validator and update `OLLAMA_RUNTIME_MAP.md` plus the relevant instructions/docs.

## Discipline anti-dérive TITANE (Synthèse 2026-04-16)

- Artefacts/launchers: preuve sur launchers système et utilisateur. UI/backend: tests E2E `data-testid`. Surfaces: mapping + bump + rollback documenté. Backend: isolation + checks variables critiques.
- Rollback/corrections tracés dans `autoheal_rules.jsonl`. Session: (1) plan précédent; (2) `git status`; (3) déclarer MODE; (4) commits Rule 18 en attente.

## Rule 18 - Direct-to-main phase commits

When direct work on `MAIN` is authorized, every completed correction phase or coherent fix batch must end with a targeted commit on `MAIN` after proofs pass. Do not accumulate unrelated finished fixes in an uncommitted worktree. Each direct-to-main commit must stay scope-limited, mention the corrected surface or subsystem, and wait for AutoHeal plus mandatory validators. If proof is incomplete, do not commit the phase yet.

## Rule 20 - Session continuity

At the start of every session: (1) read session plan or summary to restore context; (2) run `git status --short`; (3) declare MODE (DURABLE or EXPLORATION); (4) commit any Rule 18 phases whose proofs passed but were not yet committed. Never carry credentials, tokens, or private keys in session notes, plans, or proof files.

## Rule 19 - Exploration Mode vs Durable Mode

Every coding session operates in one of two modes. Declare the mode explicitly before starting work.

**Exploration Mode** — activated by naming a branch `explore/*`, a file `*.spike.*`, or by explicit declaration `MODE=EXPLORATION` in the session. Governance is lightweight: AutoHeal entry with reduced schema (id, date, scope, symptom, fix only), no version bump, no proof_pack required, no mapping update obligation. Exploration code is disposable by default — it must be explicitly promoted to Durable before merge to `MAIN`.

**Durable Mode** — the default for all work on `MAIN` and `feature/*` branches. Full Rule 1–18 discipline applies: AutoHeal full schema, version bump at BUILD, proof_pack, mapping updates, tests (Rule 16), rollback plan.

**Promotion gate**: before merging Exploration code to MAIN, classify the code as `durable` explicitly, run full test gates, append AutoHeal full schema entry, and bump version. Undeclared Exploration code merged to MAIN = FAIL.

## Runtime Visibility Protocol (Rule 20; mandatory after every visible UI/frontend change)

Any visible UI/frontend change must pass the **Runtime Visibility Protocol** before commit to MAIN.

Required chain:
source change → static tests → web UI capture → Vite dist → build-truth → no stale visible version → Tauri stable build → stable artifact freshness → launcher truth after stable build → runtime identity proof → stable window proof → SurfaceTruth DOM proof → console-noise gate → screenshot proof → AutoHeal / governance → commit only after proof.

Gates that must pass: `gate-build-truth.sh`, `gate-version-truth.sh`, `gate-surface-root.sh`, `gate-no-stale-visible-version.sh`, `gate-runtime-identity-truth.sh`, `gate-stable-artifact-freshness.sh`, `gate-stable-launcher-truth.sh`, `gate-console-runtime-noise.sh`, `verify_frontend_ui_visible_change_protocol.sh`.

Browser preview proof is NOT Tauri proof. dist proof is NOT artifact proof. Artifact proof is NOT launcher proof. Launcher proof is NOT DOM SurfaceTruth.

## Rule 14.4 — OS-Aware Build Proof and Windows 11 Primary DEV_HOST

Windows 11 is the primary local development host. Every build proof claim must identify the OS on which it was produced. Linux CI proof does not substitute for local Windows proof and vice versa.

**Windows 11 mandatory prerequisites for Tauri development:**

- Microsoft C++ Build Tools 2022 (C++ workload + Windows SDK + MSVC toolchain)
- Microsoft Edge WebView2 Runtime (included on Windows 11; install manually on Windows 10)
- Rust stable MSVC toolchain: `x86_64-pc-windows-msvc` (install via `rustup`)
- WiX Toolset v3 for MSI builds
- Windows VBSCRIPT optional feature may be required for WiX installer compilation
- `icon.ico` must contain multi-resolution ICO layers (Windows icon authority)

**OS-Aware proof rules:** Linux artifacts prove Linux only; Windows MSI proven only when built on Windows/`windows-latest` CI with artifact + SHA256 + smoke-install. CI runner proof ≠ local install proof. Each version requires own proof. `BUILD ALL` Windows = MSI path + SHA256 + smoke exit code (else `UNKNOWN`). PowerShell-first; `corepack pnpm`; never `npm install`.

**Maximum verdict tiers (cannot be upgraded without proof):**

- `WINDOWS_11_INSTRUCTION_ALIGNMENT_PATCHED` — docs and instructions updated, no MSI artifact required.
- `WINDOWS_11_MSI_RELEASE_PROVEN` — requires MSI v35.x artifact + SHA256 + smoke-test proof.
- `WINDOWS_11_MIGRATION_SEALED` — requires full Windows runtime + MSI + local install proof.

## Windows Primary Rail Doctrine
For documentation, setup, and agent instructions work assume the following bounded doctrine:
- **Primary rail**: Windows native is the default primary DEV and PROD packaging rail (MSI/EXE) for day-to-day developer workflows and Windows installer certification.
- **Source of truth**: The GitHub clone is the working source of truth. External-drive copies are strictly recovery-only.
- **Fallback rails**: WSL2 Ubuntu is a fallback compatibility rail. Linux native remains the packaging and cross-platform compatibility rail (AppImage/DEB).
- **Command style**: Default commands and quickstarts should be PowerShell-first for Windows; use `corepack pnpm` rather than `npm`.
- **Do not** remove Linux/WSL support or convert Bash-only docs into PowerShell without a scoped mission.
- **Do not** claim Windows PROD is SEALED without explicit Windows build/artifact proofs and logs (classify as `UNKNOWN` until proven).
- **Stoplines**: Do not suggest `npm install`, do not change `pnpm-lock.yaml` in docs-only patches, and do not touch runtime/source files during documentation updates. When editing Windows docs, link to `docs/windows/WINDOWS_PRIMARY_DEV_PROD_GUIDE.md`.
