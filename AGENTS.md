---

## Preuves attendues et patterns d'intégration (Agents avancés)

| Agent                         | Preuve attendue                                               | Pattern d'intégration                                                                                                  |
| ----------------------------- | ------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Monitoring Agent              | Log d'anomalie, screenshot dashboard, alerte UI               | Dashboard UI (`monitoring-dashboard`), service `src/services/monitoring/`, E2E test, mapping UI_SURFACE_MAP.md         |
| Auto-Diagnostic Agent         | Rapport d'anomalie, log autoheal, preuve de correction        | Dashboard UI (`diagnostic-panel`), service `src/services/diagnostic/`, E2E test, mapping UI_SURFACE_MAP.md             |
| Explainability Agent          | Rapport d'explicabilité, log d'inférence, capture UI          | Dashboard UI (`explainability-dashboard`), service `src/services/explainability/`, E2E test, mapping UI_SURFACE_MAP.md |
| Orchestrateur Dynamique Agent | Log de répartition, métrique de charge, screenshot dashboard  | Dashboard UI (`orchestrator-dashboard`), service `src/services/orchestrator/`, E2E test, mapping UI_SURFACE_MAP.md     |
| Agent de Sécurité Active      | Log de détection, alerte sécurité, preuve de confinement      | Dashboard UI (`security-dashboard`), service `src/services/security_active/`, E2E test, mapping UI_SURFACE_MAP.md      |
| Log Analysis Agent            | Rapport intelligent anomalies/incohérences + preuve dashboard | Dashboard UI (`log-analysis-dashboard`), service `src/services/log_analysis/`, E2E test, mapping UI_SURFACE_MAP.md     |

Pour chaque nouvel agent, la preuve doit inclure : logs, dashboard visible, mapping à jour, test E2E, rollback documenté.

### Log Analysis Agent (log_analysis/, src/services/log_analysis/)

- Scope: Analyse avancée des logs TITANE, détection d incohérences et priorisation d axes d amélioration.
- Gate: Rapport attitré intelligent (JSON + Markdown), preuve dashboard, tests Vitest + E2E, intégration autoheal.
- Required: Dashboard log-analysis, collecte optimisée (manuel + 60s), vérification dédiée `verify-log-analysis-report`.
- Mapping: update `ARCHITECTURE.md`, `docs/CARTOGRAPHY_COMPLETE.md`, `UI_SURFACE_MAP.md`, `docs/IPC_CATALOG.md` si IPC ajouté.

### Agent de Sécurité Active (security_active/, src/services/security_active/)

- Scope: Détection d’anomalies réseau, sandboxing, réponse automatisée aux menaces, supervision croisée.
- Gate: Détection d’intrusion, logs de sécurité, tests E2E de résilience, intégration autoheal.
- Required: Dashboard sécurité, alerting, tests unitaires et E2E, preuve de confinement.
- Mapping: update `ARCHITECTURE.md`, `docs/CARTOGRAPHY_COMPLETE.md`, `UI_SURFACE_MAP.md` si dashboard UI.

### Orchestrateur Dynamique Agent (orchestrator/, src/services/orchestrator/)

- Scope: Répartition intelligente des tâches entre agents, adaptation dynamique à la charge, gestion des priorités et des ressources.
- Gate: Preuve de répartition optimale, logs d’orchestration, tests E2E de charge, intégration autoheal.
- Required: Dashboard d’orchestration, métriques de charge, tests unitaires et E2E, preuve d’auto-adaptation.
- Mapping: update `ARCHITECTURE.md`, `docs/CARTOGRAPHY_COMPLETE.md`, `UI_SURFACE_MAP.md` si dashboard UI.

### Explainability Agent (explainability/, src/services/explainability/)

- Scope: Traçabilité des décisions IA, logs d’inférences, justification des choix, audit explicable.
- Gate: Génération automatique de rapports d’explicabilité, logs d’inférences, tests E2E sur la traçabilité.
- Required: Preuve d’explication pour chaque décision IA, intégration avec autoheal, dashboard UI si besoin.
- Mapping: update `ARCHITECTURE.md`, `docs/CARTOGRAPHY_COMPLETE.md`, `UI_SURFACE_MAP.md` si dashboard UI.

### Auto-Diagnostic Agent (diagnostic/, src/services/diagnostic/)

- Scope: Analyse proactive des dérives, auto-vérification de l’intégrité, suggestions de correctifs, génération de rapports d’anomalie.
- Gate: Détection automatique d’erreurs, auto-tests, rapport d’anomalie, intégration avec autoheal.
- Required: Génération de rapports, tests unitaires et E2E, preuve de correction automatique.
- Mapping: update `ARCHITECTURE.md`, `docs/CARTOGRAPHY_COMPLETE.md`.

# TITANE∞ - Root AGENTS

## Authority

Repo-scoped guidance for Codex and adjacent agents.
This file owns durable repo context only.
Local execution posture belongs to `~/.codex/config.toml`.
Heavy doctrine belongs to the local Codex rules file, not to the repo.

## Invariants

- Tauri-only production runtime.
- 4-Ring boundaries must stay intact.
- One Door network: UI -> IPC -> services -> gateway -> external.
- Minimal patch only.
- No fake state, no fake PASS, no silent fallback.
- Proof-first and rollback-ready.
- Production builds and deploys on user request — no token gate (Rule 11).
- `BUILD ALL` triggers full automated build sequence (Rule 14).
- Every modification triggers auto anti-regression and AutoHeal (Rule 10).
- Every modification updates relevant mapping/cartography docs (Rule 15).
- Every new feature/integration requires tests (Rule 16).
- Canonical runtime surface truth must be identified and protected for every UI/runtime fix; legacy aliases must not remain as divergent live surfaces.
- In direct-to-main mode requested by the user, each finished phase must be committed on `MAIN` once its proofs are green.

## Ask-First Workflow

- Prefer Ask/plan mode first for mapping, audits, architecture questions, dependency diagnosis, and broad changes.
- Switch to patch/code mode only after scope is fixed, touched files are known, one dominant lock is identified, and rollback is obvious.
- Keep one real lock at a time.

## Mode Switch Protocol (Rule 19)

- **Plan Mode** → explore architecture, diagnose, map surfaces. No code produced.
- **Exploration Mode** → branch `explore/*` or explicit `MODE=EXPLORATION`. Lightweight AutoHeal, no bump, no proof_pack. Code is disposable.
- **Durable/Production Mode** → default for `MAIN` / `feature/*`. Full Rule 1–18 discipline. All gates mandatory.
- Transition Exploration → Durable requires explicit promotion gate: full tests, full AutoHeal schema, version bump, proof_pack.

## Agent Specialization

### Backend Agent (src-tauri/, Rust)

- Scope: Ring 0 (Kernel Rust) + Ring 1 (Types/Data) — Tauri commands, IPC, capabilities, Rust services.
- Gate: IPC contract `{ ok, content, error }` must be preserved.
- Required: allowlist update + integration tests for new commands + contract test in `tests/contract/tauri-ipc-contract.test.ts`.
- Mapping: update `docs/IPC_CATALOG.md` + `ARCHITECTURE.md` when IPC changes.
- AutoHeal: append entry on every fix.

### Frontend Agent (src/, TypeScript/React)

- Scope: Ring 3 (Orchestration/Stores/Hooks) + Ring 4 (UI components, pages, engines).
- Gate: stable `data-testid` selectors; ErrorBoundary on every new component.
- Required: E2E tests for user-facing changes; `registry/ui-events.jsonl` entry; update `UI_SURFACE_MAP.md`.
- Mapping: update `UI_SURFACE_MAP.md` + `docs/CARTOGRAPHY_COMPLETE.md` when UI surfaces change.
- AutoHeal: append entry on every fix.
- Anti-drift: for route/page regressions, realign active router, deprecated router, compatibility exports, preloading, tests, and active tooling references to the same canonical UI surface before closure.

### QA Agent (tests/, e2e/)

- Scope: Ring 3-4 — unit tests, integration tests, E2E harness.
- Gate: no feature without tests (Rule 16); deterministic selectors only; test coverage matrix enforced.
- Required: E2E logs + screenshots as proof artifacts; Q&A scenario tests for new capabilities.
- Test matrix: see Rule 16 in `.github/copilot-instructions.md`.
- AutoHeal: append entry on every fix.

### Security Agent (governance/, sbom/, scripts/verify/)

- Scope: Cross-ring — SBOM, governance, audit trails.
- Gate: no uncontrolled network; capabilities locked.
- Required: SBOM update on dependency change; audit log entry.

### Build Agent — OS-Aware Build Authority

- Scope: Build, packaging, deploy workflows, post-build system integration.
- Gate: Before any build/deploy/release proof, detect and report `OS_HOST`.
- Accepted `OS_HOST` values: `WINDOWS_11_LOCAL`, `GITHUB_ACTIONS_WINDOWS`, `LINUX_LOCAL`, `GITHUB_ACTIONS_LINUX`, `ANDROID_DEVICE`, `MACOS_LOCAL`, `UNKNOWN`.
- **Windows 11 local proof profile**: PowerShell-first execution; Node 24 or current project policy; `pnpm` must match `packageManager`; Rust stable-msvc / `x86_64-pc-windows-msvc`; MSVC Build Tools; `cl.exe` and `link.exe` when available; WebView2 Runtime checked; VBSCRIPT status checked for MSI readiness; `pnpm run sync:versions`; DEV Tauri `BOOT:READY`; window title/version proof; console clean proof; MSI artifact + SHA256 + install smoke only when Windows release proof is requested.
- **GitHub Actions Windows proof profile**: runner/toolchain summary; MSI artifact; SHA256; `WINDOWS_MANIFEST.json`; `WINDOWS_RUNNER_MANIFEST.json`; no local install claim.
- **Linux local proof profile**: AppImage / DEB / RPM; `.desktop`; hicolor icon cache; `dpkg` / `sudo` where applicable.
- **GitHub Actions Linux proof profile**: Linux artifact/checksum proof only; no Windows claim.
- **Android proof profile**: APK/AAB/device proof separate from desktop release proof.
- **macOS proof profile**: inactive unless explicitly scoped and proved on macOS.
- **Anti-contamination rule**: Linux proof cannot satisfy Windows lanes. Windows CI artifact proof cannot satisfy local install lanes. Historical proof cannot satisfy current version lanes. Generated or legacy docs cannot satisfy current authority lanes.
- **DEV Tauri version sync**: after every version bump, run `pnpm run sync:versions` — this propagates the new version to `runtime/dev/tauri.conf.json` (as `{version}-dev`) and its window title. A stale dev version in `runtime/dev/tauri.conf.json` is FAIL.
- **BUILD and BUILD ALL**: always update and rebuild the DEV Tauri runtime (`pnpm run dev:tauri` or `tauri build --config runtime/dev/tauri.conf.json`) to verify the dev config is at the correct version before proceeding to stable/production builds.
- Mapping: update `RELEASE_SURFACE_INVENTORY.md` when build/release surfaces change.

### Monitoring Agent (monitoring/, src/services/monitoring/)

- Scope: Supervision temps réel de la santé des agents, collecte de métriques, alerting, auto-restart.
- Gate: Détection d'anomalies, logs croisés, preuve de vie agents, alertes sur dérive ou crash.
- Required: Dashboard de monitoring, logs d'événements, tests E2E de résilience, intégration avec autoheal.
- Mapping: update `ARCHITECTURE.md`, `docs/CARTOGRAPHY_COMPLETE.md`, `UI_SURFACE_MAP.md` si dashboard UI.

### Ollama Boundary Guardian (.github/agents/ollama-dev-chat-boundary.agent.md, scripts/verify/)

- Scope: Frontière obligatoire entre Ollama Dev via Copilot VS Code et Ollama Chat dans le runtime TITANE.
- Gate: Zéro contamination croisée des defaults, prompts, registre champion/challenger et fallbacks backend; communication contrôlée seulement via interfaces explicites et traçables.
- Required: Doctrine repo-owned alignée, validateur `verify:ollama:boundary`, preuve de baseline dev `qwen3.5:9b`, preuve de baseline chat `gemma2:2b`, rollback documenté.
- Mapping: update `OLLAMA_RUNTIME_MAP.md`, `ARCHITECTURE.md`, `docs/CARTOGRAPHY_COMPLETE.md`.

## Runtime Truth Procedure

- Les dashboards agents avancés doivent publier une vérité runtime ou registry réelle quand elle existe déjà dans le repo: métriques, alertes, transport IPC, registre champion/challenger, feature flags, timeouts, état provider.
- Le catalogue agents avancés reste la base canonique de qualification, mais les services dédiés doivent enrichir ce socle avec les signaux réels au lieu d afficher un stub figé.
- Toute évolution sur la frontière Ollama Dev / Ollama Chat doit garder le développement GitHub Copilot VS Code aligné sur `http://127.0.0.1:11434` + `qwen3.5:9b`, tout en gardant le runtime chat TITANE aligné sur `gemma2:2b`, la voie IPC canonique et l absence de token gate de build/deploy.
- La communication entre les deux surfaces n est autorisée que via des interfaces explicites, bornées et traçables; aucune mutation partagée de default runtime n est permise.
- La commande canonique de vérification d alignement est `pnpm run verify:ollama:boundary`.

## Chain-of-Thought Validation

1. Identify the scope: which Ring is impacted (Ring 0-4), which files are touched, and whether the change is IPC, UI, or infra.
2. Verify no higher-layer invariant (L1 kernel, L2 path-specific) is violated by this change.
3. Confirm the patch is minimal (Rule 1) — no gratuitous refactor, no scope creep.
4. Confirm tests exist or will be created (Rule 16).
5. Plan AutoHeal entry (Rule 10).
6. Identify which mapping docs need updating (Rule 15).

## Canonical Commands

- `pnpm run check`
- `pnpm run verify:instructions`
- `bash scripts/verify/verify_instruction_layers.sh`
- `bash scripts/verify/verify_no_doctrine_duplication.sh`
- `bash scripts/autoheal/detect_recurrence.sh`

## Pre-BUILD Certifier Agent

Before BUILD ALL, route through `.github/agents/pre-build-certifier.agent.md` or an equivalent full pre-build workflow.

Lifecycle: `DISCOVER → CERTIFY → FIX → RE-CERTIFY → BUILD_PERMISSION → BUILD_HANDOFF → POST_BUILD_SEAL`

If the certifier does not return `BUILD_ALLOWED=YES` with evidence, build is blocked.

### Mandatory BUILD_PERMISSION_MATRIX lanes

The certifier must classify every lane in `BUILD_PERMISSION_MATRIX.md`. `BUILD_ALLOWED=YES` requires all lanes `PASS` or `NOT_APPLICABLE_WITH_PROOF`. `NOT_RUN` is treated as FAIL.

| Lane | ID | Key commands / checks |
|------|----|-----------------------|
| 0 | WORKTREE | `git status --short`, branch, commit, version |
| 1 | AUTHORITY_MAP / PIPELINE_AUTHORITY | single build authority, no conflict |
| 2 | INSTRUCTIONS / AGENT_CONFIG | `bash scripts/verify/verify-pre-build-certifier-agent.sh`, `verify_instruction_layers.sh`, `verify_no_doctrine_duplication.sh`, `verify_status_vocabulary.sh`, `verify_agents_index.sh`, `verify_prompt_files_index.sh`, `verify_local_markers_consistency.sh`, `verify-vscode-agent-workflow.sh`, `gate-build-truth.sh`, `gate-version-truth.sh`, `detect_recurrence.sh`, `verify_instructions.sh` |
| 3 | TOOLCHAIN | `pnpm -v`, `node -v`, `rustc --version`, `cargo --version`, `tauri --version` |
| 4 | FRONTEND_STATIC | `pnpm run check` (0 TS errors) + `pnpm run lint` (0 ESLint errors) |
| 5 | FRONTEND_TESTS | `pnpm run test --run` → all tests PASS (baseline 9514/9514) |
| 6 | BACKEND_RUST_TAURI | `pnpm run test:rust`, `pnpm run verify:tauri-configs`, `pnpm run verify:tauri-only` |
| 7 | IPC_CONTRACT | `pnpm run guard:ipc-contract` → PASS |
| 8 | NETWORK_GOVERNANCE | `pnpm run verify:online-first`, `pnpm run verify:network-guard` |
| 9 | CLEAN_STALE_CACHE | `pnpm run dev:cleanup \|\| true`, `pnpm run clean:vite \|\| true` |
| 10 | DEV_TAURI_RUNTIME | `pnpm run sync:versions` → verify `runtime/dev/tauri.conf.json` == `{version}-dev` → `pnpm run dev:tauri` → BOOT:READY + warn=0 + error=0 |
| 11 | DEVTOOLS_CONSOLE | 0 `console.error`, 0 unresolved `console.warn` |
| 12 | PAGE_ERRORS | 0 `pageerror`, 0 `unhandledrejection` |
| 13 | HTTP_NETWORK | 0 `requestfailed`, 0 HTTP 400+, 0 CORS, 0 asset 404 |
| 14 | WEBUI_ROUTE | canonical routes verified, no stale assets |
| 15 | VISIBLE_UI | correct version in footer, no blank screens |
| 16 | RUNTIME_PROMOTION | no unproven ACTIVE_PARTIAL or simulated surfaces |
| 17 | E2E_DESKTOP_WEBUI | `pnpm run test:e2e` or `pnpm run e2e:desktop` → PASS |
| 18 | AUTOHEAL | `bash scripts/autoheal/detect_recurrence.sh` → PASS |
| 19 | VALIDATORS | `pnpm run verify` → all verify:* PASS |
| 20 | RELEASE_SURFACE_PRECHECK | `gate-stable-artifact-freshness.sh` → PASS, all manifests at same version |
| 21 | ROLLBACK | rollback path documented, previous artifact reachable |
| 22 | PROOF_PACK | `BUILD_PERMISSION_MATRIX.md` complete with all lanes in proof pack |

### DEV_TAURI_RUNTIME detail (Lane 10 — added 2026-05-17)

This lane is mandatory on every BUILD and BUILD ALL:
1. `pnpm run sync:versions` — propagates `{version}-dev` to `runtime/dev/tauri.conf.json` and window title.
2. Assert `runtime/dev/tauri.conf.json` `.version == "{package.json version}-dev"`. Stale dev version = FAIL.
3. `pnpm run dev:tauri` → wait for `BOOT:READY` in logs.
4. Confirm window title `Titan-Dev vX.Y.Z [DEV]` — must match current version exactly.
5. `warn=0 error=0` in TAURI_MONITOR. Any backend error = FAIL.

### Validator commands quick-reference

All must exit 0 before build:
```bash
bash scripts/verify/verify-pre-build-certifier-agent.sh
bash scripts/verify/gate-build-truth.sh
bash scripts/verify/gate-version-truth.sh
bash scripts/verify/gate-stable-artifact-freshness.sh
bash scripts/verify/verify_instruction_layers.sh
bash scripts/verify/verify_no_doctrine_duplication.sh
bash scripts/verify/verify_status_vocabulary.sh
bash scripts/verify/verify_agents_index.sh
bash scripts/verify/verify_prompt_files_index.sh
bash scripts/verify/verify_local_markers_consistency.sh
bash scripts/verify/verify-vscode-agent-workflow.sh
bash scripts/autoheal/detect_recurrence.sh
bash scripts/verify_instructions.sh
```

## Proof Discipline

- Report real commands, real outputs, and explicit limits.
- If a proof cannot run, classify `BLOCKED` or `PARTIAL` with the next action.
- Route repeated binary rules to validators instead of duplicating prose.
- In direct-to-main mode, proof completion for a phase is followed immediately by a targeted commit on `MAIN`; no completed proven phase should remain uncommitted.

## Integration Patterns

- New IPC command: add to `src-tauri/src/`, update allowlist, add to `src/lib/security.ts` ALLOWED_COMMANDS, add tests.
- New UI surface: add `data-testid`, add to `registry/ui-events.jsonl`, update `UI_SURFACE_MAP.md`, add E2E test.
- New Ollama integration: update `OLLAMA_RUNTIME_MAP.md`, add provider tests.

## Not In Scope

- Product behavior details owned by local `src/**/AGENTS.md`.
- Local sandbox, approval, model, and network posture.
- Full constitutional doctrine duplication.

## Frontend/UI seal rules
- Do not restart UI redesign without a new failing proof or explicit product request.
- Prefer semantic `titanium-*` Tailwind tokens over hardcoded `text-gray-*`/`bg-slate-*` classes.
- Run `pnpm run check`, `pnpm run lint`, `pnpm run test --run`, and `pnpm run build` before claiming completion.
- Update snapshots only for reviewed, intentional UI token diffs — never broad repo-wide.
- Keep proof packs under `proof_packs/` for certification cycles (force-add required, gitignored by default).
- Backup branch before any redesign: `git branch backup/frontend-before-<scope>`.
