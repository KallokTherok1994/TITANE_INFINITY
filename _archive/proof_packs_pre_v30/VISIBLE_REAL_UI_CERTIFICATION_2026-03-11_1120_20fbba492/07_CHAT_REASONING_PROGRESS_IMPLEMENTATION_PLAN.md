# 07 — CHAT REASONING PROGRESS IMPLEMENTATION PLAN

Pack: VISIBLE_REAL_UI_CERTIFICATION_2026-03-11_1120_20fbba492
Date: 2026-03-11
Session: V22

---

## Frictions à corriger (priorité décroissante)

### P1 — SEND_DISABLED_AFTER_TYPING

**Cause probable**: React controlled textarea — `el.value = text` ne déclenche pas le state React.

**Fix minimal suggéré** (dans le composant chat input):
```typescript
// S'assurer que l'input React accepte les events natifs pour les tests E2E
// Option 1: utiliser un uncontrolled input avec ref
// Option 2: exposer un data-testid et un handler natif
// Option 3: dans le spec, utiliser l'approche React override:
Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value')
  .set.call(el, text);
el.dispatchEvent(new Event('input', { bubbles: true }));
```

**Scope fix**: composant `ChatInput` ou `ChatTextarea` — 1 ligne max via ReactDOM test utils override.
**Ticket suggéré**: `fix(chat): expose data-testid="chat-input" + ensure onChange fires on native input`

### P2 — REASONING_PROGRESS_ABSENT

**Cause**: le composant n'est pas rendu ou n'a pas les attributs `data-testid="reasoning-progress"` attendus.

**Fix minimal**:
1. Vérifier si le composant existe dans `src/components/` sous un autre nom
2. Ajouter `data-testid="reasoning-progress"` sur le wrapper du composant progress existant
3. S'assurer que le composant est rendu pendant le chargement d'une réponse

**Ticket suggéré**: `fix(chat): add data-testid="reasoning-progress" to ReasoningProgress component`

### P3 — CHAT_INPUT_NOT_VISIBLE / SEND_BUTTON_NOT_VISIBLE à la route initiale

**Cause**: la route `/titane` ne rend pas le chat par défaut (navigation nécessaire).

**Note**: Ce comportement peut être intentionnel (le chat est sur une route dédiée).
**Vérification**: tester avec la route `#/chat` ou `#/titane/chat`.

**Fix si nécessaire**: rediriger `/titane` vers la vue principale avec chat actif.

### P4 — POTENTIAL_DOUBLE_SCROLL

**Cause**: 3 conteneurs avec `overflow: auto/scroll` + `body.overflow`

**Fix minimal**: revoir le CSS des conteneurs de scroll pour en éliminer un (le plus imbriqué).

## Plan d'implémentation

| Ticket | Priorité | Effort | Impact |
|--------|----------|--------|--------|
| data-testid="chat-input" | P1 | < 1h | Test E2E complet |
| onChange natif textarea | P1 | < 2h | SEND_DISABLED résolu |
| data-testid="reasoning-progress" | P2 | < 30min | ABSENT résolu |
| Double scroll audit CSS | P3 | 2-4h | FAIL_LAYOUT résolu |

## Décision auto-fix session V22

**NON-AUTOFIX** pour cette session (Rule 1 — minimal patch only).
Les frictions documentées ne sont pas des bloqueurs de boot.
Le prochain PR doit cibler ces 4 tickets en ordre de priorité.

**Note**: les frictions P1-P2 peuvent être résolues en < 4h et permettront un run V23 PASS_FULL.
