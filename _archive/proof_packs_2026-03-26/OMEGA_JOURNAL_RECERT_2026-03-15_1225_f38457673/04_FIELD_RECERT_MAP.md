# 04_FIELD_RECERT_MAP

## Recertification détaillée par champ

---

### A. DURÉE

**Définition canonique** : temps réel entre envoi de la requête et réception de la réponse, exprimé en secondes avec une décimale.

**Source runtime** :
- `providerStatus.latency` (ms) → `Chat.tsx` → prop `elapsedTime` (= latency/1000 quand `!isLoading`)
- Pendant loading : `elapsedTime` = timer croissant `elapsedTime`
- Calcul `durationDisplay` dans ThinkingPanel.tsx : `elapsedTime?.toFixed(1) + 's'`

**Vérification** :
```tsx
// Chat.tsx ~1413 (staged)
elapsedTime={
  isLoading
    ? elapsedTime
    : providerStatus.latency !== undefined
      ? providerStatus.latency / 1000
      : undefined
}
```
Conforme. Non `undefined` post-load quand latency disponible.

**Statut** : VERIFIED_RUNTIME_TRUTH (source réelle : latencyMs de lastEntry)

---

### B. FICHIER SYSTÈME

**Définition canonique** : présence ou absence de sources de prompt système injectées dans la conversation.

**Source runtime** : `memoryTrace.systemPromptSources` (tableau). Vient de `lastEntry.contexts` via `useChat`.

**Vérification** :
- Caption (essentiel) : conditionnel `memoryTrace?.systemPromptSources?.length > 0` → `"${n} sources injectées"` vs `"NON INSTRUMENTÉ"` ✅
- Runtime Grid : `oj-non-capture` conditionnel ✅
- Libellé : `"NON INSTRUMENTÉ"` (pas `"NON CAPTURÉ"` — libellé honnête) ✅

**Statut** : CAPTURED_AND_RENDERED (donnée réelle quand sources présentes; libellé honnête quand absentes)

---

### C. SCORE QUALITÉ

**Définition canonique** : mesure de la qualité d'exécution du pipeline de traitement.

**Source runtime** :
- Priorité 1 : `omegaMetadata.validationScore` (Rust — non implémenté, struct `ConversationMetadata` sans ce champ)
- Priorité 2 : completion-based IIFE : `doneCount/total × errorPenalty × providerBonus`

**Honnêteté** : le score est calculé côté front-end sur des données réelles de pipeline. Quand `steps.length === 0` ou `isLoading`, retourne `null` → affiché `NON INSTRUMENTÉ` (pas de faux score). Formule documentée dans autoheal.

**Statut** : CAPTURED_AND_RENDERED — honnêtement ancré sur données réelles (pas un score cosmétique)

---

### D. XP / PROGRESSION

**Définition canonique** : gain XP réel par échange Chat, issu de `useExperience.ts` → `awardExperience`.

**Chaîne** :
```
useChat.ts (awardExperience +5 chat, +2 cognitive si responseLength>200)
  → useExperience.ts (state.history[0].amount)
    → Chat.tsx (xpTrace.lastGainAmount)
      → ThinkingPanel.tsx (3 sections : essentiel, XP section, runtime grid)
```

**Sections vérifiées** :
| Section | Utilise lastGainAmount ? | Post-recert |
|---------|--------------------------|-------------|
| Essentiel "XP attendu" | ✅ conditionnel | PASS |
| Détaillé/Expert "Gain par message" | ✅ conditionnel | PASS |
| Runtime Grid "XP gagné" | ❌ hardcodé +5 → **résiduel** | CORRIGÉ |

**Statut** : VERIFIED_RUNTIME_TRUTH (toutes sections post-patch résiduel)

---

### E. SCROLL MOLETTE

**Définition canonique** : conteneur `.oj-journal-body` scrollable avec molette dans le Journal OMEGA étendu.

**Source** : ThinkingPanel.css + div avec `className="oj-journal-body"` dans le journal étendu.

**Vérification CSS** :
```css
.oj-journal-body {
  max-height: 480px;
  overflow-y: auto;
  overscroll-behavior: contain;
}
```
La div `.oj-journal-body` englobe toute la section scrollable (essentiel + timeline + runtime + XP + Fichier Système).

**Statut** : VERIFIED_RUNTIME_TRUTH (conteneur correct, overflow défini, pas de double-scroll visible au niveau CSS)

---

### F. AUTO-FIX / AUTO-HEAL

**Définition canonique** : règles append-only déclenchables par `detect_recurrence.sh`.

**Vérification** :
- Session #1 : 5 règles AH-2026-03-15-OMEGA-JOURNAL-001 à 005 (format correct avec `id`)
- Session recertification : 1 règle AH-2026-03-15-OMEGA-JOURNAL-006 (résiduel XP runtime grid)
- Toutes les règles ont le champ `id`, `date`, `scope`, `symptom`, `root_cause`, `fix`, `prevention_test`, `commands`, `files_changed`, `rollback`
- `detect_recurrence.sh` → G_AH_RECURRENCE_GUARD_PASS (entries=284)

**Statut** : CAPTURED_AND_RENDERED (règles réelles, déclenchables, non masquantes)
