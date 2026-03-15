# 05_PATCHES

## PATCH 1 — Durée (Chat.tsx)
**Fichier**: `src/ui/pages/Chat.tsx`  
**Ligne originale**: `elapsedTime={isLoading ? elapsedTime : undefined}`  
**Ligne corrigée**:
```tsx
elapsedTime={
  isLoading
    ? elapsedTime
    : providerStatus.latency !== undefined
      ? providerStatus.latency / 1000
      : undefined
}
```
**Ancrage runtime**: `providerStatus.latency` = `lastEntry.latencyMs` = latence réelle IPC retournée par le backend.

---

## PATCH 2 — Score qualité (Chat.tsx)
**Fichier**: `src/ui/pages/Chat.tsx`  
**Avant**: `qualityScore: typeof omegaMetadata?.validationScore === 'number' ? ... : null`  
**Après**: Priorité 1 = validationScore backend (inchangé). Priorité 2 = score completion steps réels:
```ts
qualityScore: (() => {
  if (typeof omegaMetadata?.validationScore === 'number') {
    return omegaMetadata.validationScore as number;
  }
  if (!isLoading && steps.length > 0 && state !== 'active') {
    const doneCount = steps.filter(s => s.status === 'done' || s.status === 'complete').length;
    const errorCount = steps.filter(s => s.status === 'error').length;
    const completionRate = doneCount / steps.length;
    const errorPenalty = errorCount > 0 ? 0.7 : 1.0;
    const providerBonus = resolvedProvider ? 1.0 : 0.9;
    return parseFloat((Math.min(1.0, completionRate * errorPenalty * providerBonus)).toFixed(2));
  }
  return null;
})(),
```
**Ancrage**: `steps` = traces pipeline runtime réelles (non simulées) — `doneCount`/`errorCount` varient selon l'exécution réelle.

---

## PATCH 3 — Fichier Système (ThinkingPanel.tsx × 2 locations)
**Fichier**: `src/features/chat/ThinkingPanel.tsx`  

**Location 1** (runtime grid):
```tsx
// AVANT
<span className="oj-runtime-value oj-non-capture">...

// APRÈS
<span className={`oj-runtime-value${sources.length > 0 ? '' : ' oj-non-capture'}`}>...
```

**Location 2** (caption row) : span interne conditionnel.

---

## PATCH 4 — XP gain (ThinkingPanel.tsx × 2 locations)
**Avant**: `<span className="oj-xp-gain">+5 XP</span> domaine Chat`  
**Après**:
```tsx
{xpTrace.lastGainDomain === 'chat' && xpTrace.lastGainAmount !== undefined ? (
  <span className="oj-xp-gain">+{xpTrace.lastGainAmount} XP</span>
) : (
  <span className="oj-xp-gain">+5 XP</span>
)}{' '}domaine Chat
```
**Ancrage**: `xpTrace.lastGainAmount` = `experience.state.history[0].amount` — valeur réelle après `awardExperience('chat', 5, ...)` dans useChat.ts.

---

## PATCH 5 — Scroll molette (ThinkingPanel.css)
**Ajouté** avant `.oj-summary`:
```css
.oj-journal-body {
  max-height: 480px;
  overflow-y: auto;
  overscroll-behavior: contain;
}
```
**Ancrage**: `.oj-journal-body` est le seul conteneur du corps du journal OMEGA (lignes 364/828 ThinkingPanel.tsx).
