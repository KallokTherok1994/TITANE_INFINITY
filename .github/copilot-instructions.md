# COPILOT-XS (Repo-local) Coding Protocol

**IP / Attribution**

- Creator: Kevin Thibault (TITANE∞)
- Generated/maintained with GitHub Copilot (GPT-5.2)
- Licensing: governed by repository LICENSE.md

This repository contains an optional COPILOT-XS scaffolding pack:

- **Layer 1 (Rules):** lightweight, repo-aligned guardrails
- **Layer 2 (Agents):** documented specialist personas (markdown)
- **Layer 3 (Routing):** documented routing + workflow artifacts

Notes:

- This pack does **not** "hardwire" VS Code internals; it provides files, tasks, and scripts that you can run.
- TITANE∞ constraints in this repo remain authoritative (see `.copilot-rules-permanent.md`).

## Layer 1 — Non-negotiables for this repo

- No secrets committed.
- Keep changes minimal and testable.

### ⚠️ RÈGLE CRITIQUE — REGISTRE UI OBLIGATOIRE (Ajouté: 2026-02-02)

**OBLIGATION PERMANENTE :**

- **TOUTE modification UI** (pages, layout, navigation, styles) **DOIT** être enregistrée dans `registry/ui-events.jsonl`.
- **UN changement UI = UNE entry append-only** (JSONL) avec champs obligatoires complets.
- **CHAQUE phase UI** (fix, tests, governance, polish) **doit** ajouter une entry si elle modifie l’UI.
- **Le gate `GATE_UI_INDEX` doit passer** avant toute validation QUALIFIED/STABLE.

**Champs obligatoires:** `id`, `ts`, `category`, `scope`, `change_type`, `summary`, `reason`, `files_changed`, `tests_run`, `proofs`, `risk_level`, `rollback`, `status`.

**Interdictions:**

- ❌ Modifier un fichier UI sans entry registre.
- ❌ Écraser/supprimer une entry (append-only strict).
- ❌ Valider un changement UI sans `tests_run` + `rollback`.

### ⚠️ RÈGLE CRITIQUE — FERMETURE DES PORTS ET TERMINAUX DÉPRÉCIÉS (Ajouté: 2026-01-05)

**OBLIGATION PERMANENTE :**

- **FERMER IMMÉDIATEMENT** tout port ou terminal marqué comme déprécié ou non autorisé dès qu'il n'est plus explicitement requis ou autorisé par la politique du projet ou par Kevin Thibault.
- **NE PAS LAISSER OUVERT** de port réseau, tunnel, ou terminal de développement qui a été signalé comme obsolète, non sécurisé ou interdit.
- **VÉRIFIER** régulièrement l'état des terminaux et ports ouverts, et documenter toute fermeture dans les logs de développement si applicable.

Tout manquement à cette règle est une **violation critique** de la politique de sécurité et de gouvernance TITANE∞.

### ⚠️ RÈGLE CRITIQUE — DÉPLOIEMENT (Ajouté: 2026-01-02)

**INTERDICTION ABSOLUE:**

- **NE JAMAIS** déployer via AppImage ou DEB sans autorisation explicite de Kevin Thibault
- **NE JAMAIS** lancer `pnpm run build` ou tâche "🔵 Build Titan-Stable" sans demande explicite
- Mode développement OBLIGATOIRE jusqu'à validation 100% des tests

**Mode de travail autorisé:**

- Console / Scripts uniquement (Titan-Dev)
- Tâche "🟢 Launch Titan-Dev" pour développement
- Paramètres de restriction MINIMAUX pour faciliter le dev
- Aucun package/bundle avant approbation formelle

**Déploiement production nécessite:**

1. Tests CLI: 100/100 passés
2. Approbation explicite écrite de Kevin Thibault
3. Confirmation "GO FOR PRODUCTION DEPLOY"

Tout déploiement non autorisé est une **violation critique** de cette règle.

## Optional validation policy

The validation script checks for:

- Prohibited markers in source folders (default: `TODO`, `FIXME`).
- Basic hygiene (no obvious secrets patterns).

By default, `pnpm run copilot-xs:validate` scans **git staged files** (pre-commit scope) to avoid forcing a full legacy cleanup.
For a full scan, run: `COPILOT_XS_SCOPE=all pnpm run copilot-xs:validate`.

Configure via environment variables:

- `COPILOT_XS_ROOTS` (comma-separated roots, default: `src,src-tauri/src,tests`)
- `COPILOT_XS_PROHIBITED` (comma-separated terms, default: `TODO,FIXME`)
- `COPILOT_XS_SCOPE` (`staged` | `all`, default: `staged`)

Secret scanning knobs:

- `COPILOT_XS_SECRET_SCAN` (`1` | `0`, default: `1`)
- `COPILOT_XS_SECRET_SCAN_IN_TESTS` (`1` | `0`, default: `0`)
- `COPILOT_XS_SECRET_MIN_CHARS` (default: `48`)
- `COPILOT_XS_SECRET_ALLOW_REGEX` (regex string; matching lines are ignored)

Optional marker policy knobs:

- `COPILOT_XS_ALLOW_PROHIBITED_IN_TESTS` (`1` | `0`, default: `0`)

Additional allowlist knobs (disabled by default):

- `COPILOT_XS_PROHIBITED_ALLOW_REGEX` (regex string; matching lines are ignored for prohibited terms)
- `COPILOT_XS_PROHIBITED_ALLOW_PATH_REGEX` (regex string; matching file paths skip prohibited-term scanning)

Recommended strict-all (legacy-tolerant) run:

- `COPILOT_XS_SCOPE=all COPILOT_XS_ALLOW_PROHIBITED_IN_TESTS=1 COPILOT_XS_PROHIBITED_ALLOW_REGEX='((//|/\\*|\\*|\{/\\*).*(TODO|FIXME)|\"[^\"]*(TODO|FIXME)[^\"]*\")' pnpm run copilot-xs:validate`

---

# Foundation: Custom Instructions (Rulebook)

The following section is a **repository-local rulebook** to improve coherence and dependency safety. It is applied in a **non-destructive** way: TITANE∞ constraints above remain authoritative.

## Repository Coding Guidelines

### Architecture & Coherence

- **Always analyze existing code patterns** before generating new code
- Match the existing code style, naming conventions, and patterns found in the current file
- For new features, check 3-5 similar existing implementations before proposing solutions
- Never duplicate functionality; always reuse existing utilities and components

### Dependency Management

- Before adding ANY dependency, verify: (1) it doesn't already exist in package.json, (2) it doesn't conflict with existing versions, (3) it's from a trusted source
- For dependency updates: check semantic versioning impact, review changelog, ensure compatibility with Node/Python/etc. version specified in project
- Always update lock files (pnpm-lock.yaml) when modifying dependencies
- Prefer existing dependencies over new ones; use `pnpm list <package>` to check availability

### Code Quality & Safety

- Generate TypeScript with strict typing; avoid `any` types
- Include proper error handling for all network calls and user inputs
- Follow existing linting rules (ESLint/Prettier) - check `.eslintrc.js` before coding
- Add unit tests for new functions using the existing test framework (Jest/Mocha/etc.)
- Include JSDoc comments for public APIs

### Security

- Never hardcode secrets, API keys, or credentials
- Use environment variables following the `.env.example` pattern
- Sanitize all user inputs to prevent injection attacks
- Check against OWASP Top 10 vulnerabilities

## User Preferences (Reference)

- Prefer functional programming patterns when possible
- Use async/await over callbacks
- Always destructure props in React components
- Sort imports: React → libraries → local modules → styles

## Workspace Indexing (Reference)

- Index your workspace: In VS Code, run "Index workspace" command via Copilot Chat to allow it to analyze all files, dependencies, and relationships
- Keep index updated: Re-index after major refactors or dependency changes
- Use relative file paths when prompting (e.g., "Check auth.ts for current authentication patterns")

## Workflow: Safety First (Reference)

Recommended sequence for non-trivial changes:

1. Context Gathering (patterns, deps, tests, known markers)
2. Plan Generation (outline approach + risks)
3. Implementation with verification (build/test/lint)
4. Automated checks (dependency audit + security scan)
