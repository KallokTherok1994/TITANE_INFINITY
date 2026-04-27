---

## Preuves attendues et patterns d'intégration (Agents avancés)

| Agent                         | Preuve attendue                                              | Pattern d'intégration                                                                                                  |
| ----------------------------- | ------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------- |
| Monitoring Agent              | Log d'anomalie, screenshot dashboard, alerte UI              | Dashboard UI (`monitoring-dashboard`), service `src/services/monitoring/`, E2E test, mapping UI_SURFACE_MAP.md         |
| Auto-Diagnostic Agent         | Rapport d'anomalie, log autoheal, preuve de correction       | Dashboard UI (`diagnostic-panel`), service `src/services/diagnostic/`, E2E test, mapping UI_SURFACE_MAP.md             |
| Explainability Agent          | Rapport d'explicabilité, log d'inférence, capture UI         | Dashboard UI (`explainability-dashboard`), service `src/services/explainability/`, E2E test, mapping UI_SURFACE_MAP.md |
| Orchestrateur Dynamique Agent | Log de répartition, métrique de charge, screenshot dashboard | Dashboard UI (`orchestrator-dashboard`), service `src/services/orchestrator/`, E2E test, mapping UI_SURFACE_MAP.md     |
| Agent de Sécurité Active      | Log de détection, alerte sécurité, preuve de confinement     | Dashboard UI (`security-dashboard`), service `src/services/security_active/`, E2E test, mapping UI_SURFACE_MAP.md      |

Pour chaque nouvel agent, la preuve doit inclure : logs, dashboard visible, mapping à jour, test E2E, rollback documenté.

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

### Build Agent (scripts/, .github/workflows/)

- Scope: Build, packaging, deploy workflows, post-build system integration.
- Gate: After every build (dev/prod/tauri), mandatory launcher/icon refresh sequence must run (Rule 13.1).
- Required: run `bash scripts/post-build/update-desktop-icons.sh`, refresh desktop/icon caches, verify `Exec=/usr/bin/titane-infinity` and icon mapping in local/system `.desktop` launchers.
- Mapping: update `RELEASE_SURFACE_INVENTORY.md` when build/release surfaces change.

### Monitoring Agent (monitoring/, src/services/monitoring/)

- Scope: Supervision temps réel de la santé des agents, collecte de métriques, alerting, auto-restart.
- Gate: Détection d'anomalies, logs croisés, preuve de vie agents, alertes sur dérive ou crash.
- Required: Dashboard de monitoring, logs d'événements, tests E2E de résilience, intégration avec autoheal.
- Mapping: update `ARCHITECTURE.md`, `docs/CARTOGRAPHY_COMPLETE.md`, `UI_SURFACE_MAP.md` si dashboard UI.

## Runtime Truth Procedure

- Les dashboards agents avancés doivent publier une vérité runtime ou registry réelle quand elle existe déjà dans le repo: métriques, alertes, transport IPC, registre champion/challenger, feature flags, timeouts, état provider.
- Le catalogue agents avancés reste la base canonique de qualification, mais les services dédiés doivent enrichir ce socle avec les signaux réels au lieu d afficher un stub figé.
- Toute évolution Ollama/Cline doit rester alignée sur `http://127.0.0.1:11434`, `gemma2:2b`, la voie IPC canonique et l absence de token gate de build/deploy.
- La commande canonique de vérification d alignement est `pnpm run verify:ollama:cline`.

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
