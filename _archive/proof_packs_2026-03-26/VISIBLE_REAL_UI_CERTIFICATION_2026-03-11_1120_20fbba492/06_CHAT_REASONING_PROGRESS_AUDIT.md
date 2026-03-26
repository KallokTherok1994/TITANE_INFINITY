# 06 — CHAT REASONING PROGRESS AUDIT

Pack: VISIBLE_REAL_UI_CERTIFICATION_2026-03-11_1120_20fbba492
Date: 2026-03-11
Session: V22

---

## Composant ciblé: Reasoning Progress

### Sélecteurs testés (inspectRuntime)

```javascript
'[data-testid="reasoning-progress"]'  → NON matché
'[class*="reasoning"]'                 → NON matché
'[class*="progress"][class*="chat"]'  → NON matché
'[data-component="progress"]'         → NON matché
```

**Résultat: `progressCompPresent: false` → `reasoningProgressState: ABSENT`**

## Chat Input (état observé)

### À l'état initial (/titane, boot frais)

| Signal | Valeur |
|--------|--------|
| `inputPresent` | false |
| `sendPresent` | false |
| Note | Chat input hors viewport ou non rendu à la route initiale |

### Après hash navigation `/titane`

| Signal | Valeur |
|--------|--------|
| `inputPresent` | true — `textarea[placeholder]` matchée |
| `sendPresent` | true — bouton send trouvé |
| Sélecteur input utilisé | `textarea[placeholder]` |
| Sélecteur send utilisé | `button[type="submit"]` ou `[aria-label*="env"]` |

### Après saisie JS (`el.value = "..." + dispatchEvent`)

| Signal | Valeur |
|--------|--------|
| `inputTyped` | true |
| `sendEnabledAfterTyping` | **false** — bouton toujours disabled |
| `sendClicked` | false (skip car disabled) |
| `visibleUiChangeAfterSend` | false |
| friction | `SEND_DISABLED_AFTER_TYPING` |

## Analyse de la friction SEND_DISABLED

Le bouton send reste disabled après `el.value = text + dispatchEvent('input')`. Causes possibles:
1. Le composant React utilise `useState` contrôlé — la mise à jour `el.value` direct ne déclenche pas le state React
2. L'event `dispatchEvent(new Event('input'))` n'est pas suffisant — React nécessite un `InputEvent` natif ou `Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set.call(el, text)`
3. Le bouton a une logique de validation supplémentaire (longueur minimale, token d'auth, provider actif)

## aiChatState

`aiChatState: ABSENT` — aucun sélecteur `[data-testid="chat"]`, `.chat-container`, `#chat` trouvé.
Indique que la vue chat principale n'est pas à la route `/titane` mais sur une sous-route (ex: `/chat`).

## FAIL documenté

- `CHAT_INPUT_NOT_VISIBLE` — hors vue à la route initiale
- `SEND_BUTTON_NOT_VISIBLE` — hors vue à la route initiale
- `SEND_DISABLED_AFTER_TYPING` — saisie JS ne reactive pas le bouton
- `REASONING_PROGRESS_ABSENT` — composant non présent dans DOM

**FAIL_CHAT_INTERACTION** — interaction chat partielle. Aucun bloqueur critique.**
