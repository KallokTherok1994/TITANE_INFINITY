# 11_BLOCKERS_AND_ROOT_CAUSE.md — Blockers et Cause Racine
**Generated:** 2026-02-28T18:41:19Z  
**Pack:** PREP_BG_2026-02-28_1613_a8b70c2

## Blockers Identifiés

### 1. **CRITICAL:** Vitest Execution Failure

**Symptôme:** Impossible d'exécuter les tests unitaires complets
**Cause racine:** Incompatibilité pnpm symlinks + node.js execution context
**Impact:** Tests suite non validable automatiquement

**Détails:**
```bash
node node_modules/.bin/vitest  # → SyntaxError (shell script via node)
bash node_modules/.bin/vitest  # → Same syntax error
npx vitest                     # → Infinite hang (>150s)
```

### 2. **CRITICAL:** Vite Build Failure

**Symptôme:** Build frontend échoue systématiquement  
**Cause racine:** `crypto.hash is not a function` — Node.js v18.19.1 vs Vite 7.3.1 incompatibility
**Impact:** Application non buildable

**Détails:**
```
Node.js: v18.19.1
Vite: 7.3.1
Error: crypto.hash undefined (API introuite dans Node.js 19+)
```

### 3. **MINOR:** pnpm Absent du PATH

**Symptôme:** `pnpm : commande introuvable`
**Cause racine:** Installation via npm, pnpm non ajouté au PATH système
**Impact:** Scripts package.json non exécutables directement

**Workaround:** `npx pnpm` ou execution directe via `node_modules/.bin/`

## Priorisation

| Blocker | Severity | Impact | Effort Fix |
|---------|----------|--------|------------|
| Vite build | P0 | App non deployable | Medium (upgrade Node.js) |
| Vitest exec | P1 | Tests non validables | Low (use npm instead) |
| pnpm PATH | P2 | DX minor | Low (export PATH) |

## Prochaines Actions

Voir `12_NEXT_ACTIONS_30MIN.md`