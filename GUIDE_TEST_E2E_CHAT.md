# 🧪 Guide de Test E2E - Chat IA TITANE∞

## Vue d'ensemble

Ce guide fournit des instructions détaillées pour tester manuellement les 6 corrections critiques appliquées au chat IA.

---

## 🎯 Tests de Validation

### Préparation

```bash
# Lancer l'application en mode dev
cd /home/runner/work/TITANE_INFINITY/TITANE_INFINITY
pnpm run dev

# Ouvrir DevTools dans l'application Tauri
# Raccourci: F12 ou Ctrl+Shift+I
```

---

### Test 1: Message Simple (P0-1, P0-3)

**Objectif:** Vérifier que le format backend est correctement détecté et la réponse s'affiche

**Étapes:**

1. Ouvrir DevTools → Console
2. Dans le chat, envoyer: `Bonjour TITANE`
3. Observer les logs console

**Résultat Attendu:**

Console logs:

```
[ChatService-OMEGA] 📤 Envoi message via OMEGA: { conversationId: "conv-...", message: "Bonjour TITANE" }
[ChatService-OMEGA] 📥 Réponse brute reçue: { hasContent: true, hasError: false, ... }
[ChatService-OMEGA] ✅ Format OMEGA direct détecté: {
  contentLength: 200-300,
  conversationId: "conv-...",
  messageId: "msg-...",
  latencyMs: 1000-5000,
  provider: "ollama" ou "gemini"
}
🔄 updateAssistant called { targetUiId: "chat-ui-...", messagesCount: 2 }
✅ updateAssistant: Target found { currentContent: "", uiId: "chat-ui-..." }
✅ updateAssistant: Complete { found: true, finalCount: 2 }
```

UI:

- ✅ Message utilisateur visible
- ✅ Réponse IA visible (non vide)
- ✅ Pas de reset du chat

**Validation:**

- [ ] Logs console présents
- [ ] Réponse visible dans UI
- [ ] Format OMEGA détecté
- [ ] updateAssistant target found

---

### Test 2: Messages Rapides (P0-2, P0-4)

**Objectif:** Vérifier conversationId persistant et protection anti-reset

**Étapes:**

1. Ouvrir DevTools → Console
2. Envoyer rapidement 3 messages (< 3 secondes entre chaque):
   - `Message 1`
   - `Message 2`
   - `Message 3`
3. Observer les logs console

**Résultat Attendu:**

Console logs:

```
// Message 1
[ChatService-OMEGA] 📤 Envoi message: { conversationId: "conv-1735954582-abc123", ... }
🔒 Operation lock ACTIVATED { timestamp: 1735954582000 }

// Message 2 (même conversationId!)
[ChatService-OMEGA] 📤 Envoi message: { conversationId: "conv-1735954582-abc123", ... }

// Message 3 (même conversationId!)
[ChatService-OMEGA] 📤 Envoi message: { conversationId: "conv-1735954582-abc123", ... }

// Protection anti-reset activée
🛡️ CRITICAL PROTECTED: Skipping sync during/after operation {
  loading: true,
  lock: true,
  timeSinceOp: 1500,
  cooldown: 3000
}
```

UI:

- ✅ 3 messages utilisateur visibles
- ✅ 3 réponses IA visibles
- ✅ Pas de reset entre les messages
- ✅ Historique complet préservé

**Validation:**

- [ ] **conversationId IDENTIQUE pour les 3 messages** ⭐ CRITIQUE
- [ ] Logs "CRITICAL PROTECTED" présents
- [ ] Aucun reset du chat
- [ ] Toutes les réponses visibles

---

### Test 3: Backend Content Vide (P0-5)

**Objectif:** Vérifier validation backend

**Étapes:**

1. Ce test nécessite un scénario spécial
2. Option A: Modifier temporairement backend pour retourner content=""
3. Option B: Observer logs backend Rust pendant utilisation normale

**Résultat Attendu (si content vide):**

Backend Rust logs:

```
[Ω:CMD] ❌ AI generated empty response
```

Frontend logs:

```
[ChatService-OMEGA] ❌ Erreur sendMessage: Backend error: AI response content is empty
```

UI:

- ✅ Message d'erreur clair affiché
- ✅ Pas de réponse vide/fantôme

**Validation:**

- [ ] Erreur backend loggée
- [ ] Erreur frontend gérée gracefully
- [ ] Message utilisateur visible pour l'utilisateur

---

### Test 4: Format Invalide (P0-6)

**Objectif:** Vérifier guards format detection

**Scénarios:**

#### A. Backend retourne null

```javascript
// Simuler (impossible en utilisation normale)
// Vérifier que guards empêchent crash
```

#### B. Backend retourne error explicite

```javascript
// Si provider indisponible
```

**Résultat Attendu:**

Logs:

```
[ChatService-OMEGA] ❌ Format de réponse invalide: ...
// OU
[ChatService-OMEGA] ❌ Backend error: Model unavailable
```

UI:

- ✅ Message d'erreur clair (pas de crash)
- ✅ Application reste fonctionnelle

**Validation:**

- [ ] Pas de crash TypeError
- [ ] Erreur gérée gracefully
- [ ] Message utilisateur compréhensible

---

### Test 5: Cooldown Protection (P0-2)

**Objectif:** Vérifier protection contre resets pendant 3s après opération

**Étapes:**

1. Envoyer un message
2. Observer logs console pendant 3 secondes après la réponse
3. Vérifier protection active

**Résultat Attendu:**

Logs (pendant les 3s):

```
🛡️ CRITICAL PROTECTED: Skipping sync during/after operation {
  loading: false,
  lock: false,
  timeSinceOp: 500,
  cooldown: 3000
}

// ... (répété plusieurs fois)

🛡️ CRITICAL PROTECTED: Skipping sync during/after operation {
  timeSinceOp: 2800,
  cooldown: 3000
}
```

Après 3s:

```
📥 Syncing from memory: 2 messages
```

**Validation:**

- [ ] Protection active pendant 3s
- [ ] Logs "CRITICAL PROTECTED" présents
- [ ] Sync autorisé après 3s
- [ ] Aucun reset pendant protection

---

### Test 6: Fallback updateAssistant (P0-3)

**Objectif:** Vérifier que le fallback fonctionne si placeholder non trouvé

**Note:** Ce scénario est rare (<1% en production normale)

**Résultat Attendu (si fallback déclenché):**

Logs:

```
❌ updateAssistant: Target NOT FOUND {
  targetUiId: "chat-ui-...",
  context: "assistant-stream-complete",
  availableUiIds: [...]
}

⚠️ updateAssistant: FALLBACK TRIGGERED - investigate root cause {
  targetUiId: "chat-ui-...",
  timestamp: ...
}

[monitoring] chat_fallback_triggered event tracked
```

UI:

- ✅ Réponse s'affiche quand même (via fallback)
- ✅ Pas de réponse invisible

**Validation:**

- [ ] Logs d'erreur présents
- [ ] Fallback déclenché
- [ ] Réponse visible malgré problème
- [ ] Monitoring event tracked

---

## 📊 Checklist Complète

### Tests Fonctionnels

- [ ] Test 1: Message simple → Réponse visible
- [ ] Test 2: Messages rapides → Même conversationId ⭐
- [ ] Test 2: Messages rapides → Aucun reset ⭐
- [ ] Test 3: Content vide → Erreur backend
- [ ] Test 4: Format invalide → Pas de crash
- [ ] Test 5: Cooldown → Protection 3s
- [ ] Test 6: Fallback → Réponse visible

### Logs Console

- [ ] Format OMEGA détecté
- [ ] conversationId identique (messages rapides)
- [ ] updateAssistant: Target found
- [ ] updateAssistant: Complete
- [ ] CRITICAL PROTECTED (pendant cooldown)
- [ ] Backend logs Success

### UI/UX

- [ ] Messages utilisateur visibles
- [ ] Réponses IA visibles
- [ ] Pas de reset intempestif
- [ ] Erreurs affichées gracefully
- [ ] Historique préservé

---

## 🎯 Critères de Succès

### ✅ Success Complet

- [x] 7/7 tests fonctionnels passés
- [x] conversationId identique pour tous les messages d'une session
- [x] Aucun reset pendant/après messages
- [x] Toutes les réponses visibles
- [x] Logs exhaustifs présents

### ⚠️ Success Partiel

- [ ] 5-6/7 tests passés
- [ ] 1-2 resets occasionnels (< 10%)
- [ ] Logs incomplets mais réponses OK

### ❌ Échec

- [ ] < 5/7 tests passés
- [ ] Resets fréquents (> 10%)
- [ ] Réponses invisibles
- [ ] Crashes ou erreurs non gérées

---

## 🐛 Debugging

### Si réponse invisible:

1. Vérifier logs console: "Format OMEGA direct détecté"?
2. Vérifier logs: "updateAssistant: Target found"?
3. Vérifier logs backend Rust: "Success | content_len=..."?
4. Si aucun log → Vérifier connexion backend

### Si reset intempestif:

1. Vérifier logs: "CRITICAL PROTECTED" absent?
2. Vérifier cooldown: timeSinceOp < 3000?
3. Vérifier conversationId: identique ou différent?
4. Si différent → Bug P0-4 non résolu

### Si conversationId différent:

1. Vérifier localStorage: `titane_current_conversation_id`
2. Vérifier code: `const [conversationId] = useState<string>(() => ...)`
3. Vérifier logs: conversationId dans chaque envoi
4. Si toujours différent → Bug P0-4 critique

---

## 📝 Rapport de Test

Remplir après tests:

**Date:** ****\_\_\_\_****  
**Testeur:** ****\_\_\_\_****  
**Version:** 26.2.0

**Résultats:**

- Test 1: ☐ Pass ☐ Fail
- Test 2: ☐ Pass ☐ Fail
- Test 3: ☐ Pass ☐ Fail
- Test 4: ☐ Pass ☐ Fail
- Test 5: ☐ Pass ☐ Fail
- Test 6: ☐ Pass ☐ Fail

**conversationId session:** ****\_\_\_\_****  
**Nombre de resets:** ****\_\_\_\_****  
**Réponses visibles:** \_**\_/\_\_**

**Notes:**

---

---

---

**Verdict:** ☐ PRODUCTION-READY ☐ NEEDS FIXES

---

**🎉 Si tous les tests passent → Chat IA certifié 110% fonctionnel!**
