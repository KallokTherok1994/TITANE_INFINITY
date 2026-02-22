---
# TITANE_INFINITY — Constitution Copilot (Performance-First)
# Applies to: src/, src-tauri/, tests/, scripts/
---

**Version:** 26.3.0  
**NOW UTC:** 2026-02-13T23:18:12Z  
**Scope:** src/, src-tauri/, tests/, scripts/  
**Mode:** Doc-only unless explicitly authorized  
**Gouvernance:** Policy labels only (no human identity attribution)

---

## FAST PATH — 90 secondes

- `git status --porcelain=v1`
- `pnpm test:architecture`
- `pnpm test`
- `pnpm test:e2e` (si changement UI/IPC)

**Triage rapide:**

- P0: crash, data loss, UI silence, OMEGA v2 broken → STOP.
- P1: degradation, missing proofs, gate fail → fix before any extra work.
- P2: improvements → plan + backlog.

**Si FAIL:** 1 corrective iteration max, puis rollback et STOP.

---

## Stop-the-line (zero-derive)

- Build/packaging PROD sans gate explicite.
- Changement UI sans entry append-only dans `registry/ui-events.jsonl`.
- Break du contrat OMEGA v2 ou IPC canonique.
- E2E sans wrapper tauri-driver ou sans isolation memoire.
- Boucle de debug non bornee.

---

## Doc-only session policy

- Changer UNIQUEMENT les documents si la demande est doc-only.
- Aucun refactor gratuit, aucun deplacement massif.
- Aucune modification runtime/feature sauf si requise pour corriger ce fichier.

---

## Non-negotiables (securite + prod)

- ❌ Aucun build PROD, packaging, AppImage/DEB sans gate explicite.
- ❌ Ne jamais executer `pnpm run build`, `tauri build`, ou tache "🔵 Build Titan-Stable".
- ✅ Travail en mode dev seulement (Titan-Dev / scripts).
- ✅ Zero secrets, zero credentials en clair.
- ✅ Rollback documente pour chaque changement.

## Version gate avant PROD (obligatoire)

- ✅ Avant toute operation PROD autorisee, aligner strictement la version cible dans:
  - `package.json`
  - `src-tauri/Cargo.toml`
  - `src-tauri/tauri.conf.json`
  - `deployment/latest/MANIFEST.json`
  - `deployment/latest/SHA256SUMS_v<version>.txt`
  - `deployment/latest/SIZES_v<version>.txt`
- ❌ Interdit de lancer un cycle PROD si ces versions ne sont pas identiques.

---

## Architecture & invariants (4-Ring + OMEGA v2 + IPC)

**4-Ring model (import rules):**

- Ring 1 (Core): `src/types/`, `src/constants/` — no imports.
- Ring 2 (Engines): `src/engines/*/` — imports Ring 1 only, no I/O.
- Ring 3 (Services): `src/services/*/` — I/O orchestration, imports Ring 1-2.
- Ring 4 (OS/UI): `src-tauri/src/`, React components — can import all rings.

**OMEGA v2 (mandatory):**

- Use `conversation_generate` with `conversationId` required.
- `chat_send_message` is deprecated.

**IPC canonical contract:**

- Always return `{ ok, content, error }`.
- UI must never be silent: bounded response time + fallback path.

**Anti-silence (UI/IPC/Chat)**

**NO_LYING_FALLBACK (bloquant)**

- Un fallback ne peut jamais **changer la cause**.
- Erreur IPC / allowlist / schema / invalid payload ⇒ doit produire une erreur visible **IPC\_\*** (pas “provider down”).
- “Ollama indisponible” ne peut être affiché que si un **healthcheck Ollama** échoue (preuve ≤ 3s) ou si l’erreur réseau est clairement Ollama.

**Always Respond:**

- If provider fails, fall back to local/offline generator.
- Max wait time is bounded; no infinite waits.
- Always Respond = toujours une réponse UI **ou erreur visible**, avec code stable:
  `{ ok:false, error:{ code, message, details }, traceId }`
- Interdiction des messages trompeurs.

---

## IA locale TITANE (obligation constitutionnelle)

- Chat must work without external providers.
- External providers are optional and never hard deps.
- Circuit breaker + timeouts for every provider.
- Offline generator is required fallback.

**ONLINE-FIRST GOVERNED (doctrine nouvelle)**

- Online-first = réseau ON par défaut, via **surfaces contrôlées uniquement**.
- Surfaces permises : `NetworkService`, `ApiClient`, Tauri IPC network commands (annotés).
- Fallback local **obligatoire** : Ollama local doit toujours être fonctionnel.
- Providers externes : disponibles par défaut si configurés (clés API, endpoints).
- Mode 100% local possible : désactiver providers externes dans gouvernance UI.
- Gouvernance : `pnpm run verify:online-first` obligatoire avant push (remplace `verify:local-first`).

---

## E2E Constitution (Playwright + tauri-driver)

- `scripts/e2e/tauri-wrapper.sh` is mandatory; no direct tauri-driver call.
- `TITANE_E2E=1` + isolated `TITANE_MEMORY_DIR` + isolated `TITANE_LOG_DIR`.
- Proof: no real writes to user data paths.
- Phase 0.5: start Vite automatically if debug binary requires `devUrl`.
- Default dev port: 1420.
- Onboarding skip must be deterministic (no random navigation).
- UI Chat 360 expected exports: `page_classification`, `chat_dom_map`, `AR20`, `OFFLINE5`, `navigation`, `stability`.
- Stop-the-line if wrapper or memory guard is missing.

---

## Qualite + performance (speed with proofs)

- Minimal patch, idempotent commands.
- No unbounded retries; use capped backoff.
- Run smoke tests before long suites.
- Structured logs + markers for diagnostics.
- One change = one proof = UI registry entry if UI changes.

---

## Repo hygiene

- All scripts live in `scripts/` (no root scripts).
- `/legacy/`: @deprecated → replacement → move → remove after 6 months.
- `reports/` is gitignored by default; commit only when explicitly required.
- Use conventional commits: `<type>(<scope>): <desc>`.

---

## Tests (canonical commands)

- `pnpm test` (Vitest)
- `pnpm test:architecture` (4-Ring enforcement)
- `pnpm test:e2e` (Playwright)
- `pnpm test:rust` (cargo test)
- `pnpm verify` (all gates)

Coverage minimums:

- Engines: 80% unit
- Services: 60% integration
- E2E: 3 scenarios OMEGA v2
- Architecture: 100%

---

## Gates & certification (binary)

| Gate           | PASS criteria                                  | Evidence             |
| -------------- | ---------------------------------------------- | -------------------- |
| DEV readiness  | tests smoke + zero P0/P1                       | logs + proof pack    |
| E2E readiness  | wrapper + memory guard + UI exports            | E2E logs + artifacts |
| PROD readiness | all suites + phrase `GO FOR PRODUCTION DEPLOY` | full reports         |

- If "skipped by design", gate is FAIL until replaced by an equivalent test.

---

## Proof Pack (instructions updates)

Required files (append-only):

- `00_SNAPSHOT.md`
- `01_CURRENT_INSTRUCTIONS.md`
- `02_VERSIONS_REALITY.md`
- `03_ACCELERATION_SIGNALS.md`
- `04_SCOPE_GATE.md`
- `05_REFERENCE_GATE.md`
- `06_PERFORMANCE_RULES_PRESENT.md`
- `VERDICT.md`
- `INDEX.md`

Rollback:

- `git restore -- <instructions-file>`

---

## Code conventions (tight)

**TypeScript:** strict mode, zero `any`, explicit types, try/catch for async.

**Rust:** async/await for I/O, zero `unwrap()`, use `expect("message")` or `Result`.

---

## Reference policy

- Source of truth for versions is `package.json`.
- Paths in docs must exist or be explicitly called out as exceptions.
