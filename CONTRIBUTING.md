# Contributing to TITANE∞

## Prérequis

- Node.js ≥ 20 (via `.nvmrc` ou `fnm`)
- pnpm ≥ 8 (`corepack enable pnpm`)
- Rust stable ≥ 1.77 (`rustup update stable`)
- Tauri CLI v2 (`cargo install tauri-cli --version '^2'`)
- Ollama ≥ 0.4 avec `gemma2:2b` chargé

## Cloner et installer

```bash
git clone https://github.com/KallokTherok1994/TITANE_INFINITY.git
cd TITANE_INFINITY
pnpm install
```

## Lancer en développement

```bash
pnpm run tauri dev        # dev Tauri + Vite hot-reload
pnpm run dev              # Vite seul (port 1420)
pnpm storybook            # Storybook (port 6006)
```

## Session start checklist (Rule 20)

Chaque session doit commencer par:

1. Restaurer le contexte (plan de session si disponible).
2. Snapshot worktree avec `git status --short`.
3. Declarer explicitement le mode (`MODE=DURABLE` ou `MODE=EXPLORATION`).
4. Identifier les phases deja prouvees mais non committees (Rule 18).

## Modes d execution (Rule 19)

- DURABLE: mode par defaut sur MAIN/feature/\*, discipline complete Rule 1-18.
- EXPLORATION: mode temporaire (explore/\*), discipline allegee, code jetable par defaut.
- Promotion EXPLORATION vers MAIN: tests complets + AutoHeal full-schema + preuves scopees.

## Tests

```bash
pnpm vitest run                                      # tous les tests Vitest
pnpm vitest run src/__tests__/omega-provider-tests   # tests ciblés
cargo test --manifest-path src-tauri/Cargo.toml      # tests Rust
pnpm run test:e2e                                    # E2E Playwright (dev server requis)
```

## Conventions de code

### Règle One Door (Rule 5)

**Toujours** passer par `safeInvokeCanonical` de `@/utils/invoke` pour appeler Tauri.  
**Jamais** d'import direct `@tauri-apps/api/core` dans les composants ou services.

```ts
// ✅ Correct
import { safeInvokeCanonical } from '@/utils/invoke';
const result = await safeInvokeCanonical('my_command', { arg: value });

// ❌ Interdit
import { invoke } from '@tauri-apps/api/core';
```

### Contrat IPC

Chaque réponse IPC **doit** respecter le contrat `{ ok: boolean, content?: T, error?: string }`.  
Zéro silent failure, zéro fallback mensonger.

### Imports d'alias

| Alias          | Cible                     |
| -------------- | ------------------------- |
| `@/`           | `src/`                    |
| `@components/` | `src/components/`         |
| `@data/`       | `data/` (racine projet)   |
| `@config/`     | `config/` (racine projet) |
| `@themes/`     | `src/styles/themes/`      |

### Nommage

- Composants React : `PascalCase.tsx`
- Services : `camelCase.ts`
- Commandes Tauri (Rust) : `snake_case`
- Tests Vitest : `*.test.tsx` dans `src/__tests__/`
- Stories Storybook : `*.stories.tsx` dans `src/stories/`

## Governance obligatoire (Rule 10/15/16)

Chaque modification sous `src/`, `src-tauri/`, `tests/`, `e2e/`, `scripts/` **doit** :

1. Inclure un test unitaire Vitest/Rust dans le même commit
2. Inclure une story Storybook si surface UI
3. Appender une entrée full-schema dans `scripts/autoheal/autoheal_rules.jsonl`
4. Passer `bash scripts/autoheal/detect_recurrence.sh` (PASS requis)
5. Passer `bash scripts/verify_instructions.sh` (SUMMARY avec FAIL=0)
6. Mettre à jour les docs cartographiques si nécessaire

### Trigger table mapping (Rule 15)

| Fichiers modifies                    | Docs obligatoires                                                          |
| ------------------------------------ | -------------------------------------------------------------------------- |
| `src/components/**`, `src/pages/**`  | `UI_SURFACE_MAP.md` + `docs/CARTOGRAPHY_COMPLETE.md`                       |
| `src/services/**`, `src/engines/**`  | `ARCHITECTURE.md` + `docs/CARTOGRAPHY_COMPLETE.md`                         |
| Nouvelle IPC dans `src-tauri/src/**` | `docs/IPC_CATALOG.md` + `ARCHITECTURE.md` + `docs/CARTOGRAPHY_COMPLETE.md` |
| Integration Ollama                   | `OLLAMA_RUNTIME_MAP.md`                                                    |
| Build/version/release                | `RELEASE_SURFACE_INVENTORY.md`                                             |

### Verification minimale attendue

```bash
# Adapter au scope reel
pnpm vitest run
cargo test --manifest-path src-tauri/Cargo.toml
bash scripts/autoheal/detect_recurrence.sh
bash scripts/verify_instructions.sh
```

## Commit message

Format : `type(scope): résumé court`

Types : `feat` | `fix` | `refactor` | `test` | `docs` | `chore`

```
feat(kb): phase 34 - nouveau domaine knowledge base

- Description des changements
- Gates: vitest PASS, detect_recurrence PASS, verify_instructions FAIL=0
- AutoHeal: AH-KB-NOUVEAU-DOMAINE-YYYY-MM-DD
- Rule 10/15/16/18 compliance: PASS
```

## Rapport de bug

Ouvrir une issue GitHub avec :

- Version TITANE∞ (`cat package.json | grep version`)
- OS + version
- Logs Tauri (`~/.local/share/titane-infinity/logs/`)
- Étapes de reproduction minimales

## Pull Request

1. Branche depuis `MAIN` : `feature/<nom>` ou `fix/<nom>`
2. Tous les gates verts (CI + local)
3. Description incluant le lien vers les preuves (proof_pack ou test output)
4. Un reviewer minimum

## Proof pack (Rule 12)

Le proof pack est requis pour les changements sensibles (ex: IPC, build/release, correctif critique, changement cross-ring majeur).

Structure minimale recommandee:

```text
proof_packs/<SESSION>/VERDICT.md
proof_packs/<SESSION>/ROLLBACK.md
reports/<SESSION>/
```

Le verdict final doit utiliser le vocabulaire kernel:

- PASS
- FAIL
- BLOCKED
- BLOCKED_APPROVAL
- DONE
- SEALED

## Direct-to-main phase commits (Rule 18)

En mode direct MAIN autorise, chaque phase corrigee avec preuves vertes doit etre committee immediatement en lot scope-limite.

## Licence

Voir [LICENSE.md](LICENSE.md). Propriétaire — pas de contribution externe sans accord écrit.

## Design system (UI contributions)

Pour les contributions frontend, consulter :

- [docs/ui/DESIGN_SYSTEM.md](docs/ui/DESIGN_SYSTEM.md) — tokens, light/dark, a11y, animations
- [.claude/frontend-ui-ux-guidelines.md](.claude/frontend-ui-ux-guidelines.md) — règles de codage

Règles essentielles :

- Utiliser les classes `titanium-*` (jamais `text-gray-*`, `bg-slate-*` hardcodées)
- Gater toute animation sur `prefers-reduced-motion`
- Tester les assertions de classe dans les tests après migration token
- Mettre à jour les snapshots uniquement pour des diffs token intentionnels et vérifiés
