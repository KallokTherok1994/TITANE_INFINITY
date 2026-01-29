# 🔧 FIX CHAT IA PHASE 2 — Debug Approfondi v26.4.1

**Date**: 27 janvier 2026  
**Phase**: Debug Profond + Logs Détaillés  
**Status**: ⚠️ Problème persiste après corrections initiales

---

## 🔍 PHASE 1 RECAP (Déjà Effectué)

### Corrections Appliquées

✅ AIRouter: Ollama llama3.1 configuré par défaut  
✅ Logs debug backend: conversation_process_message  
✅ Logs debug backend: AIRouter status providers  
✅ Modèle Ollama: llama3.1 installé (4.9 GB)

### Résultat Phase 1

❌ **Problème persiste** : Les réponses ne s'affichent toujours pas

---

## 🎯 PHASE 2 — ANALYSE APPROFONDIE

### Hypothèses Nouvelles

1. **Frontend ne reçoit pas la réponse**
   - Backend renvoie bien la réponse
   - Mais frontend ne la traite pas correctement

2. **State React non mis à jour**
   - `setMessages` ne déclenche pas de re-render
   - Problème de référence/immutabilité

3. **CSS masque les messages**
   - Problème de `visibility`, `display: none`, ou `opacity: 0`
   - z-index négatif

4. **Filtrage des messages**
   - `filteredMessages` exclut les réponses assistant
   - Problème de logique de filtre

---

## ✅ CORRECTIONS PHASE 2

### 1. Logs Frontend Détaillés

**Fichier**: `src/hooks/useConversationEngine.ts`

```typescript
// Ajout logs création message assistant
console.log('[useConversationEngine] 📝 Assistant message créé:', {
  id: assistantMessage.id,
  role: assistantMessage.role,
  content_length: assistantMessage.content?.length || 0,
  content_preview: assistantMessage.content?.substring(0, 100),
});

// Ajout logs state après setMessages
setMessages(prev => {
  const updated = [...prev, assistantMessage];
  console.log('[useConversationEngine] 📊 Messages après ajout:', {
    total: updated.length,
    last_role: updated[updated.length - 1]?.role,
    last_content_length: updated[updated.length - 1]?.content?.length || 0,
  });
  return updated;
});
```

### 2. Logs Service Layer

**Fichier**: `src/services/conversationEngine.ts`

```typescript
console.log('[conversationEngine] 📤 Sending to backend:', {
  message_length: userMessage.length,
  mode: options?.mode || 'default',
  conversationId: options?.conversationId,
});

// ... invoke ...

console.log('[conversationEngine] 📥 Backend response:', {
  message_id: raw.message_id,
  assistant_message_length: raw.assistant_message?.length || 0,
  assistant_message_preview: raw.assistant_message?.substring(0, 100),
  provider: raw.metadata?.provider_used,
});
```

---

## 🧪 PLAN DE TEST DÉTAILLÉ

### Test 1: Vérifier Backend Seul

```bash
# 1. Lancer app en mode dev
pnpm run dev:tauri

# 2. Ouvrir DevTools Console
# 3. Chercher logs backend:
#    [AI Router] Initialized with default Ollama model: llama3.1
#    [conversation_process_message] 📨 Request received
```

**✅ Attendu**: Logs backend présents
**❌ Si absent**: Problème initialisation backend

### Test 2: Vérifier Réponse Backend

```bash
# Après envoi message "Bonjour":

# Chercher logs:
[conversation_process_message] ✅ Success | msg_id=... | tokens=XXX
```

**✅ Attendu**: `Success` + tokens > 0
**❌ Si erreur**: Problème génération IA (vérifier Ollama)

### Test 3: Vérifier Réception Frontend

```bash
# Après envoi message, chercher logs:
[conversationEngine] 📥 Backend response: {
  assistant_message_length: XXX,  # Doit être > 0
  assistant_message_preview: "..."
}
```

**✅ Attendu**: `assistant_message_length > 0`
**❌ Si `0` ou `undefined`**: Backend ne retourne pas de contenu

### Test 4: Vérifier Création Message

```bash
# Chercher logs:
[useConversationEngine] 📝 Assistant message créé: {
  role: "assistant",
  content_length: XXX,  # Doit être > 0
  content_preview: "..."
}
```

**✅ Attendu**: Message créé avec contenu
**❌ Si `content_length: 0`**: Problème mapping réponse

### Test 5: Vérifier State Update

```bash
# Chercher logs:
[useConversationEngine] 📊 Messages après ajout: {
  total: X,  # Doit augmenter
  last_role: "assistant",
  last_content_length: XXX
}
```

**✅ Attendu**: `total` augmente, `last_role: "assistant"`
**❌ Si pas d'augmentation**: `setMessages` ne fonctionne pas

### Test 6: Vérifier Affichage DOM

```javascript
// Dans DevTools Console:
document.querySelectorAll('.conversation-message.assistant').length;
// Doit retourner le nombre de messages assistant
```

**✅ Attendu**: Nombre > 0
**❌ Si `0`**: Messages pas dans le DOM

### Test 7: Vérifier CSS Visibility

```javascript
// Dans DevTools Console:
const msg = document.querySelector('.conversation-message.assistant');
if (msg) {
  console.log({
    display: getComputedStyle(msg).display,
    visibility: getComputedStyle(msg).visibility,
    opacity: getComputedStyle(msg).opacity,
    height: msg.offsetHeight,
  });
}
```

**✅ Attendu**: `display: flex`, `visibility: visible`, `opacity: 1`, `height > 0`
**❌ Si `display: none` ou `visibility: hidden`**: Problème CSS

---

## 🔬 DIAGNOSTICS POSSIBLES

### Cas A: Backend ne répond pas

**Symptômes**:

- Pas de log `[conversation_process_message] ✅ Success`
- Erreur `No AI provider available` persiste

**Solutions**:

1. Vérifier Ollama actif: `curl http://127.0.0.1:11434/api/tags`
2. Vérifier modèle llama3.1 installé
3. Redémarrer Ollama: `ollama serve`

### Cas B: Backend répond mais contenu vide

**Symptômes**:

- Log `Success` présent
- `assistant_message_length: 0`

**Solutions**:

1. Vérifier logs Ollama: `journalctl -u ollama -f`
2. Tester génération directe: `ollama run llama3.1 "Bonjour"`
3. Vérifier mapping response dans pipeline Rust

### Cas C: Frontend reçoit mais ne crée pas message

**Symptômes**:

- Log `Backend response` avec contenu
- Pas de log `Assistant message créé`

**Solutions**:

1. Vérifier structure `ConversationResponse`
2. Vérifier champ `assistant_message` existe
3. Ajouter breakpoint dans hook

### Cas D: Message créé mais pas affiché

**Symptômes**:

- Log `Assistant message créé` présent
- Log `Messages après ajout` augmente
- Pas de message dans UI

**Solutions**:

1. Vérifier composant render: `filteredMessages.map`
2. Vérifier filtre ne supprime pas assistant
3. Inspecter DOM pour messages masqués par CSS

### Cas E: Message affiché mais invisible

**Symptômes**:

- Message dans DOM
- `offsetHeight: 0` ou `display: none`

**Solutions**:

1. Inspecter `.conversation-message-text` CSS
2. Vérifier `white-space`, `color`, `background`
3. Vérifier z-index et positioning

---

## 📋 CHECKLIST DE VALIDATION

### Backend

- [ ] Ollama actif sur port 11434
- [ ] Modèle llama3.1 présent
- [ ] Log `[AI Router] Initialized`
- [ ] Log `conversation_process_message Success`
- [ ] `tokens > 0` dans logs

### Frontend - Service Layer

- [ ] Log `📤 Sending to backend`
- [ ] Log `📥 Backend response`
- [ ] `assistant_message_length > 0`

### Frontend - Hook

- [ ] Log `📝 Assistant message créé`
- [ ] `content_length > 0`
- [ ] Log `📊 Messages après ajout`
- [ ] `total` augmente correctement

### Frontend - Render

- [ ] Messages visibles dans DevTools Elements
- [ ] `.conversation-message.assistant` présent
- [ ] CSS `display: flex` (pas `none`)
- [ ] `offsetHeight > 0`

---

## 🚀 COMMANDES UTILES

### Backend

```bash
# Vérifier Ollama
curl http://127.0.0.1:11434/api/tags

# Tester génération
ollama run llama3.1 "Bonjour"

# Logs Ollama
journalctl -u ollama -f  # Si service systemd
# ou
ollama serve  # Mode direct
```

### Frontend

```bash
# Lancer dev
pnpm run dev:tauri

# Build TypeScript
pnpm exec tsc --noEmit

# Logs console
# Ouvrir DevTools (F12) -> Console
```

### Git

```bash
# Status modifications
git status

# Diff avant commit
git diff

# Commit avec logs
git add -A
git commit -m "debug(chat-ia): Ajout logs détaillés frontend/backend phase 2"
```

---

## 📝 PROCHAINES ÉTAPES

1. **Lancer app en mode dev**

   ```bash
   pnpm run dev:tauri
   ```

2. **Ouvrir DevTools Console** (F12)

3. **Envoyer message test**: "Bonjour"

4. **Analyser logs** selon checklist ci-dessus

5. **Identifier le point de rupture**:
   - Backend ne génère pas?
   - Frontend ne reçoit pas?
   - State React ne s'update pas?
   - DOM ne render pas?
   - CSS masque?

6. **Appliquer correction ciblée** selon diagnostic

---

## 🔗 FICHIERS MODIFIÉS (Phase 2)

1. `src/hooks/useConversationEngine.ts`
   - Ajout logs création message + state update

2. `src/services/conversationEngine.ts`
   - Ajout logs envoi + réception backend

---

**Status**: 🟡 En attente tests manuels avec logs détaillés  
**Commit**: À venir après validation tests  
**Documentation**: Phase 2 debug approfondi

---

**Auteur**: TITANE∞ Copilot  
**Date**: 2026-01-27  
**Version**: v26.4.1 Phase 2
