# Auto-Fix Report
**Date:** 2026-03-03T19:50:39Z | **Version:** 27.2.0 | **Commit:** e97177da

---

## Résumé

**Modifications apportées:** 0 (audit read-only)

Cet audit est en mode lecture seule. Aucune modification du code source n'a été effectuée.

---

## Problèmes Identifiés (recommandations non appliquées)

### 🔴 AUTO-FIX RECOMMANDÉ — data-testid manquants

**Scope:** ~98% des éléments interactifs n'ont pas de `data-testid`.
**Impact:** Tests E2E Playwright/WebdriverIO fragiles, liés à la structure CSS.

**Éléments critiques sans data-testid:**

| Fichier | Élément | data-testid recommandé |
|---------|---------|------------------------|
| src/components/sections/ConversationSection.tsx | Textarea input | `chat-input` |
| src/components/sections/ConversationSection.tsx | Bouton envoyer | `chat-send` |
| src/components/sections/ConversationSection.tsx | Provider selector | `provider-selector` |
| src/components/layout/TopNav.tsx | Nav button TITANE | `nav-titane` |
| src/components/layout/TopNav.tsx | Nav button TIME | `nav-time` |
| src/components/layout/TopNav.tsx | Nav button STATS | `nav-stats` |
| src/components/layout/TopNav.tsx | Nav button ADMIN | `nav-admin` |
| src/components/layout/TopNav.tsx | Nav button DEV | `nav-dev` |
| src/pages/TitanePage.tsx | Tab Chat | `tab-conversation` |
| src/pages/TitanePage.tsx | Tab Vue | `tab-overview` |
| src/pages/TitanePage.tsx | Tab Vision | `tab-vision` |
| src/pages/TitanePage.tsx | Tab Identité | `tab-identity` |
| src/pages/TitanePage.tsx | Tab Mémoire | `tab-memory` |
| src/pages/TitanePage.tsx | Tab XP | `tab-progression` |

**Action recommandée:** Ajouter `data-testid` attribut sur chaque élément listé ci-dessus.
**Justification:** Minimal, non-fonctionnel, aucun impact sur behaviour.
**Rollback:** `git restore -- src/` (si appliqué).

---

### 🟡 RECOMMANDÉ — Debounce polling Stats

**Scope:** `src/pages/Stats.tsx`
**Problème:** `setInterval(fetchCognitive, 5000)` hardcodé sans AbortController ni cleanup guard.
**Risque:** setState sur composant démonté → memory leak + erreur React en dev.
**Action recommandée:**
```typescript
// fetchCognitive should be wrapped with useCallback to avoid stale closure
const fetchCognitive = useCallback(async () => {
  // ... existing fetch logic ...
}, [/* stable deps */]);

useEffect(() => {
  const controller = new AbortController();
  fetchCognitive(); // initial call
  const id = setInterval(() => {
    if (!controller.signal.aborted) fetchCognitive();
  }, 5000);
  return () => { clearInterval(id); controller.abort(); };
}, [fetchCognitive]);
```

---

## Statut Final

**Modifications effectuées:** 0
**Raison:** Audit lecture seule. Les corrections listées sont des recommandations priorisées.
