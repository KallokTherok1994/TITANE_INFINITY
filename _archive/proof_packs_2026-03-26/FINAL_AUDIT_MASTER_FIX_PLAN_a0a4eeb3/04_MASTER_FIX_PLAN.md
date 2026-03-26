# Master Fix Plan — Backlog + TOP 7 Priorités + 5 Patchsets
**Date:** 2026-03-03T20:12:50Z | **Commit:** a0a4eeb3 | **Version:** 27.2.0

---

## Backlog Complet (Classifié)

### 🔴 CRITIQUE

| ID | Finding | Domaine | Ring | Impact | Effort |
|----|---------|---------|------|--------|--------|
| UI-01 | data-testid absent ~98% éléments | UI/UX | 4 | Maintenabilité/Tests | S |
| CI-01 | 43 workflows = surface excessive | CI | — | Maintenance/Sécurité | M |

### 🟠 MAJEUR

| ID | Finding | Domaine | Ring | Impact | Effort |
|----|---------|---------|------|--------|--------|
| UI-02 | 20 routes moteurs non accessibles | Navigation | 4 | UX | M |
| CHAT-01 | Textarea non désactivée pendant loading | Chat | 4 | UX/Stabilité | S |
| IPC-02 | safeInvokeWithRetry retour null silencieux | IPC | 2 | Observabilité | S |
| PERF-01 | LogViewer polling 1000ms sans guard PROD | Perf | 4 | Performance | S |
| SEC-01 | Workflows non-standards (cosmiques) | CI/Sec | — | Sécurité surface | M |
| DOCS-01 | MANIFEST.json sans version field | Docs | — | Tracking | XS |
| MEM-01 | MemoryEvolutionCenter setInterval cleanup | Mémoire | 4 | Stabilité | S |

### 🟡 MINEUR

| ID | Finding | Domaine | Ring | Impact | Effort |
|----|---------|---------|------|--------|--------|
| UI-03 | Stats.tsx polling sans useCallback | UI | 4 | Stabilité | S |
| G2 | PhysiologicalPanel Ring4→Ring2 direct | Architecture | 2/4 | Maintenabilité | S |
| PROV-02 | Dégradation silencieuse sans Ollama+keys | Provider | 3 | UX | M |
| CI-02 | E2E non exécutable en CI standard | CI | — | Tests | M |
| DOCS-02 | ui-events.jsonl sync non vérifiée | Registry | — | Traçabilité | S |

### 🟢 OPTIM

| ID | Finding | Domaine | Impact |
|----|---------|---------|--------|
| PERF-02 | GlobalExpBar polling 5s | Perf | Background noise |
| IPC-01 | entry.ts boot_marker_log via internals | IPC | Cosmétique |

---

## TOP 7 Priorités Critiques

### P1 — Ajouter data-testid sur éléments interactifs clés
**Objectif:** Permettre tests E2E stables (gate G_DATA_TESTID_PRESENT → PASS).
**Preuve de done:** `grep -rn "data-testid" src/components/sections/ConversationSection.tsx` retourne chat-input, chat-send, provider-selector.
**Tests requis:** Vérifier que les nouveaux attributs sont présents dans le DOM rendu (snapshot test ou test DOM simple).
**Rollback:** `git restore -- src/components/sections/ConversationSection.tsx src/components/layout/TopNav.tsx src/pages/TitanePage.tsx`
**Fichiers:** ConversationSection.tsx, TopNav.tsx, TitanePage.tsx
**Effort:** S | **Ring:** 4

### P2 — Réduire les workflows CI de 43 à ~10 essentiels
**Objectif:** Réduire surface d'attaque CI, économiser ressources GH Actions, faciliter maintenance.
**Preuve de done:** `ls .github/workflows/ | wc -l` ≤ 12.
**Tests requis:** Vérifier que ci-unified.yml, stable-build.yml, codeql.yml s'exécutent correctement après nettoyage.
**Rollback:** `git restore -- .github/workflows/`
**Workflows à garder:** ci-unified.yml, stable-build.yml, p3-stable-build.yml, codeql.yml, deploy-v27-production.yml, mermaid-verify.yml, changelog.yml, gitguardian.yml, dependabot-auto-review.yml, release-deployment.yml
**Effort:** M | **Domain:** CI/Sécurité

### P3 — Désactiver textarea pendant loading chat
**Objectif:** Empêcher double-submit via Enter rapide.
**Preuve de done:** `grep -rn "disabled.*isLoading\|disabled.*sendingRef" src/components/sections/ConversationSection.tsx` retourne les lignes textarea et bouton désactivés pendant loading.
**Tests requis:** Test unitaire ConversationSection: vérifier disabled state pendant sendingRef.current=true.
**Rollback:** `git restore -- src/components/sections/ConversationSection.tsx`
**Fichiers:** src/components/sections/ConversationSection.tsx
**Effort:** S | **Ring:** 4

### P4 — Corriger Stats.tsx polling (useCallback + AbortController)
**Objectif:** Éliminer risque setState sur composant démonté.
**Preuve de done:** `fetchCognitive` wrapped avec `useCallback`, `AbortController` dans cleanup.
**Tests requis:** Test de démontage du composant Stats (verify no setState after unmount warning).
**Rollback:** `git restore -- src/pages/Stats.tsx`
**Fichiers:** src/pages/Stats.tsx
**Effort:** S | **Ring:** 4

### P5 — Corriger safeInvokeWithRetry (log échec final + warning visible)
**Objectif:** Éliminer silence sur échec après maxRetries.
**Preuve de done:** `safeInvokeWithRetry` log un warning avec `[RETRY_EXHAUSTED] cmd: X, attempts: N` avant de retourner null.
**Tests requis:** Test unitaire: mock secureInvoke toujours failing → vérifier warning loggé.
**Rollback:** `git restore -- src/utils/invoke.ts`
**Fichiers:** src/utils/invoke.ts
**Effort:** S | **Ring:** 3

### P6 — Corriger MANIFEST.json racine (ajouter version field)
**Objectif:** Synchronisation versions complète (5/5 sources).
**Preuve de done:** `cat deployment/latest/MANIFEST.json | python3 -c "import json,sys; d=json.load(sys.stdin); print(d['version'])"` → "27.2.0".
**Tests requis:** pnpm verify:final100 ou équivalent gate version.
**Rollback:** `git restore -- deployment/latest/MANIFEST.json`
**Fichiers:** deployment/latest/MANIFEST.json
**Effort:** XS | **Domain:** Docs/Deploy

### P7 — Guard PROD sur LogViewer polling 1000ms
**Objectif:** Empêcher 1 IPC/sec en production (DEV-only).
**Preuve de done:** LogViewer.tsx utilise `import.meta.env.DEV` pour conditionner le polling rapide; en PROD intervalle ≥ 5000ms.
**Tests requis:** Vérifier comportement différent DEV vs PROD (via env mock dans tests).
**Rollback:** `git restore -- src/components/devtools/LogViewer.tsx`
**Fichiers:** src/components/devtools/LogViewer.tsx
**Effort:** S | **Ring:** 4

---

## 5 Patchsets (Plan Minimal)

### Patchset 1 — data-testid sur éléments critiques

**Scope:** Ajout de `data-testid` attrs sur les éléments interactifs les plus critiques.
**Fichiers:**
- `src/components/sections/ConversationSection.tsx` — textarea: `data-testid="chat-input"`, button: `data-testid="chat-send"`, provider selector: `data-testid="provider-selector"`
- `src/components/layout/TopNav.tsx` — nav items: `data-testid="nav-{id}"`
- `src/pages/TitanePage.tsx` — tabs: `data-testid="tab-{id}"`

**Diff plan (exemple):**
```tsx
// ConversationSection.tsx — textarea
<textarea
  data-testid="chat-input"
  value={inputValue}
  ...
/>

// ConversationSection.tsx — send button
<button
  data-testid="chat-send"
  onClick={handleSendMessage}
  ...
/>

// TopNav.tsx — nav item
<button
  data-testid={`nav-${item.id}`}
  onClick={() => onNavigate(item.route)}
  ...
/>
```

**Tests:** Snapshot ou DOM test vérifiant la présence des attrs.
**Risques:** Aucun (ajout HTML attribut, zero logic change).
**Rollback:** `git restore -- src/components/sections/ConversationSection.tsx src/components/layout/TopNav.tsx src/pages/TitanePage.tsx`

---

### Patchset 2 — Stats.tsx polling fix

**Scope:** Correction du polling dans Stats.tsx avec useCallback + AbortController.
**Fichiers:** `src/pages/Stats.tsx`

**Diff plan:**
```tsx
// AVANT (Stats.tsx)
const fetchCognitive = async () => { ... };
useEffect(() => {
  fetchCognitive();
  const intervalId = setInterval(fetchCognitive, 5000);
  return () => clearInterval(intervalId);
}, []);

// APRÈS
const fetchCognitive = useCallback(async () => {
  // ... existing logic ...
}, [/* stable deps */]);

useEffect(() => {
  const controller = new AbortController();
  fetchCognitive();
  const intervalId = setInterval(() => {
    if (!controller.signal.aborted) fetchCognitive();
  }, 5000);
  return () => { clearInterval(intervalId); controller.abort(); };
}, [fetchCognitive]);
```

**Tests:** Test render + unmount vérifie pas de setState after unmount.
**Risques:** Minimal (refactor mécanique du polling pattern).
**Rollback:** `git restore -- src/pages/Stats.tsx`

---

### Patchset 3 — Chat textarea disabled during send

**Scope:** Désactiver textarea pendant envoi en cours.
**Fichiers:** `src/components/sections/ConversationSection.tsx`

**Diff plan:**
```tsx
// Trouver le textarea dans ConversationSection
<textarea
  data-testid="chat-input"
  value={inputValue}
  disabled={sendingRef.current}  // AJOUT
  aria-busy={sendingRef.current}  // AJOUT
  onChange={handleInputChange}
  ...
/>

// Bouton envoyer
<button
  data-testid="chat-send"
  onClick={handleSendMessage}
  disabled={sendingRef.current || !inputValue.trim()}  // AJOUT guard
  ...
/>
```

**Tests:** Test click rapide double → vérifier 1 seul message envoyé.
**Risques:** Minimal (UX improvement).
**Rollback:** `git restore -- src/components/sections/ConversationSection.tsx`

---

### Patchset 4 — safeInvokeWithRetry logging

**Scope:** Ajouter log d'avertissement sur échec total des retries.
**Fichiers:** `src/utils/invoke.ts`

**Diff plan:**
```typescript
// APRÈS la boucle for dans safeInvokeWithRetry
if (maxRetries > 1) {
  console.warn(
    `[RETRY_EXHAUSTED] Command "${cmd}" failed after ${maxRetries} attempts.`,
    { lastError, cmd, maxRetries }
  );
}
return null;
```

**Tests:** Mock secureInvoke always failing → verify console.warn called.
**Risques:** Aucun (log ajouté uniquement).
**Rollback:** `git restore -- src/utils/invoke.ts`

---

### Patchset 5 — MANIFEST.json version field + LogViewer PROD guard

**Scope:** 2 micro-fixes groupés (XS chacun).

**5a — MANIFEST.json:**
```json
// deployment/latest/MANIFEST.json
{
  "version": "27.2.0",
  ... existing fields ...
}
```

**5b — LogViewer PROD guard:**
```typescript
// src/components/devtools/LogViewer.tsx
const POLL_INTERVAL = import.meta.env.DEV ? 1000 : 5000;
const interval = setInterval(fetchLogs, POLL_INTERVAL);
```

**Tests:** 5a: vérifier cat MANIFEST.json | jq .version = "27.2.0". 5b: env mock test.
**Risques:** Aucun.
**Rollback:** `git restore -- deployment/latest/MANIFEST.json src/components/devtools/LogViewer.tsx`

---

## Ordre d'Exécution Recommandé

```
PS1 (data-testid) → PS3 (chat disabled) → PS2 (stats polling) → PS4 (retry log) → PS5 (manifest + logviewer)
```

Puis pour P2 (CI cleanup) et P7 (routes navigation) — effort M, décision produit requise.
