# 📋 REGISTRY ULTIME — TITANE∞

> **Documentation du système de registre local-first pour tests & gates**
> Créé: 2026-01-23 | Version: 1.0.0

---

## 🎯 Objectif

Le **Registry Ultime** est un système de traçabilité local-first qui garantit que toute modification aux tests, configurations ou workflows est documentée. Il empêche les changements "silencieux" qui pourraient casser la CI.

---

## 📂 Architecture

```
runtime/registry/
├── events.jsonl       # Log append-only (immutable, audit trail)
└── snapshot.json      # État courant (suites, gates, scripts)

scripts/registry/
├── log-event.js       # Append un événement au log
└── rebuild-snapshot.js # Reconstruit snapshot depuis events

scripts/verify/
└── registry-sync.js   # Gate CI: vérifie synchronisation
```

---

## 🛠️ Scripts NPM

| Commande                                        | Description                                  |
| ----------------------------------------------- | -------------------------------------------- |
| `pnpm registry:log -- --type=TYPE --desc="..."` | Ajoute un événement au log                   |
| `pnpm registry:snapshot`                        | Reconstruit le snapshot depuis les events    |
| `pnpm verify:registry`                          | Vérifie que le registry est à jour (CI gate) |

---

## 📊 Types d'événements

| Type               | Quand l'utiliser                              |
| ------------------ | --------------------------------------------- |
| `REGISTRY_INIT`    | Initialisation du système                     |
| `TEST_ADDED`       | Nouveau fichier de test ajouté                |
| `TEST_REMOVED`     | Fichier de test supprimé                      |
| `TEST_MODIFIED`    | Modification majeure d'un test                |
| `CONFIG_CHANGED`   | Changement dans vitest/playwright/wdio config |
| `WORKFLOW_CHANGED` | Modification d'un workflow GitHub Actions     |
| `SUITE_ADDED`      | Nouvelle suite de tests                       |
| `SUITE_REMOVED`    | Suite supprimée                               |
| `GATE_ADDED`       | Nouveau gate CI                               |
| `GATE_MODIFIED`    | Modification d'un gate                        |
| `SCRIPT_ADDED`     | Nouveau script npm                            |
| `MANUAL_AUDIT`     | Audit manuel du registry                      |

---

## 📋 Workflow CI

Le workflow **registry-guard.yml** déclenche automatiquement sur:

- Push vers `MAIN`, `main`, `dev`
- Pull requests vers `MAIN`, `main`

**Fichiers surveillés:**

- `src/**/*.test.ts`, `src/**/*.spec.ts`
- `tests/**/*.test.ts`, `tests/**/*.spec.ts`
- `e2e/**/*.spec.ts`, `e2e/**/*.test.ts`, `e2e/**/*.test.js`
- `vitest*.config.ts`, `playwright.config.ts`, `wdio.conf.js`
- `.github/workflows/*.yml`
- `package.json`

**Comportement:**

1. Vérifie que les fichiers registry existent
2. Exécute `pnpm verify:registry`
3. Fail si code modifié sans mise à jour registry récente

---

## 🚀 Utilisation

### Ajouter un nouveau test

```bash
# 1. Créer le fichier de test
touch src/features/newFeature.test.ts

# 2. Logger l'événement
pnpm registry:log -- --type=TEST_ADDED --desc="Added newFeature.test.ts for feature X"

# 3. Commit les deux ensemble
git add src/features/newFeature.test.ts runtime/registry/events.jsonl
git commit -m "feat(tests): add newFeature test"
```

### Modifier une config

```bash
# 1. Modifier la config
vim vitest.config.ts

# 2. Logger l'événement
pnpm registry:log -- --type=CONFIG_CHANGED --desc="Updated vitest config: added browser mode"

# 3. Commit ensemble
git add vitest.config.ts runtime/registry/events.jsonl
git commit -m "config(vitest): enable browser mode"
```

### Audit manuel

```bash
# Faire un snapshot de l'état actuel
pnpm registry:log -- --type=MANUAL_AUDIT --desc="Weekly audit: all tests passing"
```

---

## ⚠️ Règles

1. **Toujours** logger un événement quand vous modifiez un fichier surveillé
2. Le registry doit être committé **avec** les changements, pas après
3. Le gate CI bloquera si le registry est outdated
4. Ne jamais modifier `events.jsonl` manuellement (append-only)
5. Le snapshot peut être reconstruit à tout moment

---

## 📊 Snapshot Structure

```json
{
  "version": "1.0.0",
  "lastUpdated": "2026-01-23T...",
  "suites": {
    "vitest-core": { "runner": "vitest", "config": "vitest.config.ts" },
    "playwright-e2e": { "runner": "playwright", "config": "playwright.config.ts" },
    "wdio-e2e": { "runner": "webdriverio", "config": "wdio.conf.js" }
  },
  "gates": {
    "P0_1_SECRETS": { "workflow": "secret-audit.yml" },
    "GATE_REGISTRY": { "workflow": "registry-guard.yml" }
  }
}
```

---

## 🔗 Références

- [AUDIT_INDEX_ULTIME_2026-01-23.md](AUDIT_INDEX_ULTIME_2026-01-23.md) — Audit complet
- [.github/workflows/registry-guard.yml](.github/workflows/registry-guard.yml) — Workflow CI
- [scripts/registry/](scripts/registry/) — Scripts de gestion

---

**TITANE∞ — Intégrité par Design**
