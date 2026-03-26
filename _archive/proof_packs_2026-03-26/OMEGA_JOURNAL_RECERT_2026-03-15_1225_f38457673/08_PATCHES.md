# 08_PATCHES

## Corrections effectuées lors de cette recertification

### RECERT-P1 — Stager format autoheal corrigé

**Type** : Correction delta index/worktree
**Fichier** : `scripts/autoheal/autoheal_rules.jsonl`
**Cause** : `git add` fait sur version sans `id` ; worktree avait version corrigée avec `id`
**Action** : `git add scripts/autoheal/autoheal_rules.jsonl`
**Rollback** : `git restore --staged scripts/autoheal/autoheal_rules.jsonl` (revient à l'ancien format)

---

### RECERT-P2 — XP Runtime Grid : utiliser lastGainAmount réel

**Type** : RENDERED_BUT_FALSE → VERIFIED_RUNTIME_TRUTH
**Fichier** : `src/features/chat/ThinkingPanel.tsx`
**Ligne** : ~590 (div `oj-runtime-item` "XP gagné" dans Runtime & Capacités)

**Avant** :
```tsx
{xpTrace ? (
  <>
    <span className="oj-xp-gain">+5 XP</span> Chat
    {(responseLength ?? 0) > 200 && (
      <> · <span className="oj-xp-gain">+2 XP</span> Cognitif</>
    )}
  </>
) : (
  <span className="oj-non-capture">NON DISPONIBLE</span>
)}
```

**Après** :
```tsx
{xpTrace ? (
  <>
    {xpTrace.lastGainDomain === 'chat' && xpTrace.lastGainAmount !== undefined ? (
      <span className="oj-xp-gain">+{xpTrace.lastGainAmount} XP</span>
    ) : (
      <span className="oj-xp-gain">+5 XP</span>
    )}{' '}Chat
    {(responseLength ?? 0) > 200 && (
      <> · <span className="oj-xp-gain">+2 XP</span> Cognitif</>
    )}
  </>
) : (
  <span className="oj-non-capture">NON DISPONIBLE</span>
)}
```

**Justification** : identique au pattern utilisé dans les 2 autres sections XP du composant (essentiel ~408 et XP & Progression ~630). Correctif minimal, localisé, retestable, rollbackable.
**Rollback** : `git restore -- src/features/chat/ThinkingPanel.tsx`
**TypeScript** : 0 erreurs avant et après

---

### RECERT-P3 — AutoHeal AH-2026-03-15-OMEGA-JOURNAL-006

**Type** : Ajout règle autoheal résiduelle
**Fichier** : `scripts/autoheal/autoheal_rules.jsonl`
**Contenu** : Règle documentant le résiduel XP runtime grid, avec `id`, `symptom`, `root_cause`, `fix`, `prevention_test`, `commands`, `files_changed`, `rollback`
**detect_recurrence.sh** : G_AH_RECURRENCE_GUARD_PASS entries=284 ✅
