# Rollback Instructions — FINAL_AUDIT_MASTER_FIX_PLAN_a0a4eeb3
**Date:** 2026-03-03T20:12:50Z | **Commit base:** a0a4eeb3

---

## Auto-Fixes Appliqués dans cette Session

### Fix 1 — data-testid ConversationSection
**Fichier:** `src/components/sections/ConversationSection.tsx`
**Changement:** Ajout `data-testid="chat-input"` sur textarea + `data-testid="chat-send"` sur bouton envoyer
**Rollback:** `git restore -- src/components/sections/ConversationSection.tsx`

### Fix 2 — data-testid TopNav
**Fichier:** `src/components/layout/TopNav.tsx`
**Changement:** Ajout `data-testid={nav-${item.id}}` sur boutons de navigation
**Rollback:** `git restore -- src/components/layout/TopNav.tsx`

### Fix 3 — data-testid TitanePage tabs
**Fichier:** `src/pages/TitanePage.tsx`
**Changement:** Ajout `data-testid="tab-{id}"` sur les 8 tabs (conversation, overview, vision, identity, memory, memory-evolution, progression, transformation)
**Rollback:** `git restore -- src/pages/TitanePage.tsx`

### Fix 4 — LogViewer PROD guard
**Fichier:** `src/components/devtools/LogViewer.tsx`
**Changement:** `setInterval(fetchLogs, 1000)` → `setInterval(fetchLogs, import.meta.env.DEV ? 1000 : 5000)`
**Rollback:** `git restore -- src/components/devtools/LogViewer.tsx`

### Fix 5 — MANIFEST.json version field
**Fichier:** `deployment/latest/MANIFEST.json`
**Changement:** Ajout `"version": "27.2.0"` comme premier champ top-level
**Rollback:** `git restore -- deployment/latest/MANIFEST.json`

---

## Rollback Global

```bash
# Annuler TOUS les auto-fixes
git restore -- \
  src/components/sections/ConversationSection.tsx \
  src/components/layout/TopNav.tsx \
  src/pages/TitanePage.tsx \
  src/components/devtools/LogViewer.tsx \
  deployment/latest/MANIFEST.json

# Vérifier état propre
git status --short
git diff --stat
```

---

## Proof-Pack (lecture seule — pas de rollback)

```bash
# Supprimer le proof-pack si désiré
rm -rf proof_packs/FINAL_AUDIT_MASTER_FIX_PLAN_a0a4eeb3/
```
