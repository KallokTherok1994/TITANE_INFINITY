# 🧪 TITANE∞ v26.4.1 — INSTRUCTIONS DE TEST CHAT IA

## ⚠️ SITUATION ACTUELLE

**Problème reporté:** Réponses du Chat IA ne s'affichent pas (cases vides/masquées)

**Fixes Phase 1 appliqués:**

- ✅ Configuration Ollama llama3.1 par défaut dans `main.rs`
- ✅ Modèle llama3.1 installé (4.9 GB)
- ✅ Logs backend ajoutés (Rust)

**Fixes Phase 2 appliqués:**

- ✅ Logs frontend ajoutés (TypeScript)
- ✅ Tous les fichiers compilent sans erreurs
- ✅ Commits pushed sur origin/MAIN

**Phase actuelle:** VALIDATION MANUELLE avec logs complets

---

## 📋 PROTOCOLE DE TEST MANUEL

### Étape 1: Lancer l'application en mode dev

```bash
cd /home/titane-os/Documents/GitHub/TITANE_INFINITY
pnpm run dev:tauri
```

### Étape 2: Ouvrir DevTools Console

- Clic droit dans l'interface → "Inspecter l'élément"
- Ou: Appuyer sur **F12**
- Onglet: **Console**

### Étape 3: Naviguer vers Chat IA

- Dans TITANE∞, cliquer sur l'onglet **"CONVERSATION"** ou **"Chat IA"**

### Étape 4: Envoyer message de test

**Message recommandé:**

```
Bonjour, test debug phase 2
```

### Étape 5: ANALYSER LES LOGS (CRITIQUE)

#### 🟢 Séquence ATTENDUE (si tout fonctionne):

```javascript
// 1. Frontend - Envoi au backend
[conversationEngine] 📤 Sending to backend: {
  message_length: 27,
  mode: 'default',
  conversationId: ...
}

// 2. Backend - Réception requête (RUST, dans terminal)
[conversation_process_message] 📨 Request received | msg_len=27 | conv_id=... | mode=...

// 3. Backend - Routing vers Ollama (RUST)
[AI Router v15] 🔍 Debug: unified_ia=false, gemini=false, ollama_available=true

// 4. Backend - Succès génération (RUST)
[conversation_process_message] ✅ Success | msg_id=... | tokens=150

// 5. Frontend - Réception réponse
[conversationEngine] 📥 Backend response: {
  message_id: '...',
  assistant_message_length: 250,
  assistant_message_preview: 'Bonjour ! Je suis...',
  provider: 'ollama'
}

// 6. Frontend - Création message assistant
[useConversationEngine] 📝 Assistant message créé: {
  id: '...',
  role: 'assistant',
  content_length: 250,
  content_preview: 'Bonjour ! Je suis...'
}

// 7. Frontend - Mise à jour state React
[useConversationEngine] 📊 Messages après ajout: {
  total: 2,
  last_role: 'assistant',
  last_content_length: 250
}
```

---

## 🔍 DIAGNOSTIC: IDENTIFIER LE POINT DE RUPTURE

### Cas 1: ❌ Aucun log backend (Rust)

**Symptôme:** Seulement log `[conversationEngine] 📤 Sending...`, puis rien

**Cause probable:**

- Tauri invoke échoue silencieusement
- Commande `conversation_process_message` non enregistrée

**Action:**

1. Vérifier dans terminal: erreurs de compilation Rust ?
2. Redémarrer app: `Ctrl+C` puis `pnpm run dev:tauri`

---

### Cas 2: ❌ Backend erreur avant Success

**Symptôme:** Log `[conversation_process_message] 📨 Request` puis `[conversation_process_message] ❌ Error | error=...`

**Causes possibles:**

- **"No AI provider available"** → Ollama non configuré (vérifié Phase 1)
- **"Connection refused"** → Service Ollama pas démarré
- **"Model not found"** → llama3.1 absent

**Actions:**

```bash
# Vérifier service Ollama
curl http://127.0.0.1:11434/api/tags

# Si non actif:
ollama serve

# Vérifier modèle installé:
ollama list
```

---

### Cas 3: ❌ Backend Success mais content_length=0

**Symptôme:**

```
[conversation_process_message] ✅ Success | tokens=0
[conversationEngine] 📥 Backend response: {
  assistant_message_length: 0,  ← PROBLÈME ICI
  assistant_message_preview: '',
}
```

**Cause:** Ollama génère réponse vide ou mapping défaillant

**Actions:**

```bash
# Test Ollama direct
ollama run llama3.1 "Bonjour"

# Si Ollama fonctionne direct mais pas dans app:
# → Problème mapping Rust (AI Router → Response)
```

---

### Cas 4: ❌ Frontend reçoit mais message non créé

**Symptôme:**

```
[conversationEngine] 📥 Backend response: { assistant_message_length: 250 }
# Mais AUCUN log "[useConversationEngine] 📝 Assistant message créé"
```

**Cause:** Structure `ConversationResponse` incorrecte ou hook non déclenché

**Action dans Console DevTools:**

```javascript
// Vérifier structure raw response
console.log('Check response structure');
```

---

### Cas 5: ❌ Message créé mais state non mis à jour

**Symptôme:**

```
[useConversationEngine] 📝 Assistant message créé: { content_length: 250 }
# Mais AUCUN log "[useConversationEngine] 📊 Messages après ajout"
```

**Cause:** `setMessages` non appelé ou React state gelé

**Action dans Console DevTools:**

```javascript
// Forcer re-render
document.querySelector('.conversation-container')?.dispatchEvent(new Event('click'));
```

---

### Cas 6: ✅ State mis à jour MAIS pas visible dans UI

**Symptôme:**

```
[useConversationEngine] 📊 Messages après ajout: { total: 2, last_content_length: 250 }
# Mais case vide dans interface
```

**Cause:** Problème CSS/DOM (opacity, display:none, height:0)

**Actions dans Console DevTools:**

```javascript
// Compter messages dans DOM
document.querySelectorAll('.conversation-message').length;
// Attendu: 2 (user + assistant)

// Inspecter assistant message
const assistantMsg = document.querySelector('.conversation-message.assistant');
if (assistantMsg) {
  console.log({
    display: getComputedStyle(assistantMsg).display,
    visibility: getComputedStyle(assistantMsg).visibility,
    opacity: getComputedStyle(assistantMsg).opacity,
    height: assistantMsg.offsetHeight,
    width: assistantMsg.offsetWidth,
    innerHTML_length: assistantMsg.innerHTML.length,
  });
}

// Vérifier contenu texte
assistantMsg?.textContent;
```

---

## 📸 CAPTURES REQUISES SI PROBLÈME PERSISTE

### 1. Console Logs Complets

**Copier TOUS les logs:**

- Clic droit dans Console → "Save as..."
- Ou: Sélectionner tout (Ctrl+A) → Copier

**Identifier:**

- ✅ Dernier log SUCCESS avant rupture
- ❌ Premier log ABSENT attendu

### 2. Terminal Backend (Rust)

**Copier output terminal** où tourne `pnpm run dev:tauri`:

```
[AI Router] ...
[conversation_process_message] ...
```

### 3. DOM Inspection

**Dans DevTools → Elements:**

- Chercher: `.conversation-message` (Ctrl+F)
- Screenshot de l'élément `.assistant` si présent

### 4. React DevTools (optionnel mais utile)

Si extension installée:

- Onglet "Components"
- Chercher `ConversationContainer` ou `useConversationEngine`
- Screenshot du state `messages`

---

## 🎯 CRITÈRES DE SUCCÈS

### ✅ Test RÉUSSI si:

1. **Tous les 7 logs** apparaissent dans l'ordre
2. `assistant_message_length > 0` dans log #5
3. `content_length > 0` dans log #6
4. `total` augmente de 2 dans log #7
5. **Réponse VISIBLE** dans l'interface UI

**Confirmation à fournir:**

```
✅ Chat IA fonctionne !
Provider utilisé: Ollama
Tokens générés: ~150
Réponse affichée: "Bonjour ! Je suis..."
```

### ❌ Test ÉCHOUÉ si:

- **Un des 7 logs manque** → Noter le numéro du dernier log visible
- **content_length = 0** → Problème génération Ollama
- **Logs complets MAIS UI vide** → Problème CSS/rendering

---

## 🚀 COMMANDES DE RÉFÉRENCE

```bash
# Lancer test
pnpm run dev:tauri

# Vérifier Ollama
curl http://127.0.0.1:11434/api/tags | jq

# Test Ollama direct
ollama run llama3.1 "Bonjour"

# Analyser logs sauvegardés
cat runtime/test-logs/chat-ia-test_*.log | grep -E '(conversation|AI Router|Success|Error)'

# Recompiler si modifications
pnpm exec tsc --noEmit
cargo check --manifest-path=src-tauri/Cargo.toml
```

---

## 📞 RAPPORT À FOURNIR

### Format attendu:

```markdown
## RÉSULTAT TEST CHAT IA v26.4.1

**Date:** 2026-01-27
**Durée test:** X minutes

### 🔍 Logs Observés:

[Copier ici TOUS les logs console + terminal]

### 📊 Diagnostic:

- Dernier log réussi: #X - [nom du log]
- Premier log manquant: #Y - [nom attendu]
- Point de rupture identifié: [Backend/Frontend/Rendering]

### 📸 Captures:

[Joindre screenshots si possible]

### ✅ ou ❌ Résultat:

- [ ] Test réussi - Réponse s'affiche correctement
- [ ] Test échoué - Problème détecté au point: ...

### 🛠️ Actions requises:

[Basé sur diagnostic ci-dessus]
```

---

## 📚 FICHIERS DE RÉFÉRENCE

- **Plan de test détaillé:** `DEBUG_CHAT_IA_PHASE2_v26.4.1.md`
- **Fixes Phase 1:** `FIX_CHAT_IA_NO_RESPONSE_v26.4.1.md`
- **Code modifié:**
  - `src-tauri/src/main.rs` (lignes 554-560)
  - `src-tauri/src/conversation_engine/commands.rs`
  - `src-tauri/src/ai/router.rs`
  - `src/services/conversationEngine.ts`
  - `src/hooks/useConversationEngine.ts`

---

## ⏭️ PROCHAINES ÉTAPES (après test)

**Si ✅ test réussi:**

1. Documenter résolution dans rapport final
2. Retirer logs de debug (optionnel pour production)
3. Créer tests automatisés E2E

**Si ❌ test échoué:**

1. Identifier point de rupture via logs
2. Appliquer Phase 3 (correctifs ciblés)
3. Re-tester

---

**🔥 NOTE IMPORTANTE:** Le script `./scripts/test_chat_ia.sh` automatise ces étapes MAIS nécessite interaction manuelle pour le test UI réel. Préférer lancement manuel `pnpm run dev:tauri` + observation console.
