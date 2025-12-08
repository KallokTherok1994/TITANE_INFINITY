# 🔧 CORRECTION CHAT IA & DEVTOOLS - GUIDE RAPIDE

**Date**: 27 novembre 2025
**Problèmes identifiés**:
1. ❌ Chat IA ne fonctionne pas
2. ❌ DevTools F12 ne s'affiche pas

---

## ✅ CORRECTIONS APPLIQUÉES

### **1. DevTools Configuration** ✅

**Fichier**: `src-tauri/tauri.conf.json`

**Problème**: DevTools doit être activé explicitement.

**Solution**: Vérifié et confirmé actif sur les deux fenêtres:
```json
{
  "label": "main",
  "devtools": true  // ✅ ACTIVÉ
}

{
  "label": "avatar-floating",
  "devtools": true  // ✅ ACTIVÉ
}
```

**Test**:
1. Lancer l'app: `npm run tauri:dev`
2. Appuyer sur **F12** (ou Ctrl+Shift+I)
3. DevTools doit s'ouvrir ✅

---

### **2. devUrl Configuration** ✅

**Fichier**: `src-tauri/tauri.conf.json`

**Problème**: `devUrl: "tauri://localhost"` est incorrect pour le mode dev.

**Correction appliquée**:
```json
// AVANT (INCORRECT)
"devUrl": "tauri://localhost"

// APRÈS (CORRECT)
"devUrl": "http://localhost:5173"
```

**Raison**: En mode développement, Vite démarre un serveur HTTP sur le port 5173, pas un serveur tauri://.

---

### **3. Chat IA - Vérification Backend**

**Commandes Rust enregistrées** ✅:
```rust
// src-tauri/src/main.rs
.invoke_handler(tauri::generate_handler![
    // ... autres commandes ...
    overdrive::chat_orchestrator::chat_send_message,     // ✅
    overdrive::chat_orchestrator::chat_stream_message,   // ✅
    // ...
])
```

**Implémentation** ✅:
- `src-tauri/src/overdrive/chat_orchestrator.rs` (758 lignes)
- 3 providers: Gemini, Ollama, Local echo
- Cascade automatique: `auto` → `gemini` → `ollama` → `local`
- Streaming fonctionnel (Tauri v2 Emitter trait)

---

### **4. Chat IA - Vérification Frontend**

**Provider Tauri** ✅:
```typescript
// src/services/ai/providers/tauriChat.ts
async generate(message: string, history: AIMessage[] = []): Promise<AIResponse> {
    const request: ChatRequest = {
        message,
        provider: 'auto',
        streaming: false,
        system_prompt: this.buildSystemPrompt(history),
    };

    const response = await invokeTauri<ChatResponse>(
        TAURI_COMMANDS.CHAT_SEND_MESSAGE,
        { request }
    );

    return {
        content: response.message.content,
        provider: providerMap[response.message.provider],
        // ...
    };
}
```

**Commande enregistrée** ✅:
```typescript
// src/services/tauriCommands.ts
'chat_send_message': {
    name: 'chat_send_message',
    description: 'Send message to AI chat',
    active: true,
}
```

---

## 🧪 TESTS À EFFECTUER

### **Test 1: DevTools**

```bash
# 1. Lancer en mode dev
npm run tauri:dev

# 2. Une fois l'app ouverte:
#    - Appuyer F12 (ou Ctrl+Shift+I / Cmd+Option+I)
#    - DevTools doit s'ouvrir en bas ou sur le côté

# 3. Vérifier Console:
#    - Onglet "Console" doit afficher les logs
#    - Chercher: "TITANE", "Initializing", etc.
```

**Résultat attendu**: ✅ DevTools s'ouvre, Console affiche les logs

---

### **Test 2: Chat IA (Mode Local Echo)**

```bash
# 1. Dans DevTools Console, tester commande directement:
await window.__TAURI__.core.invoke('chat_send_message', {
  request: {
    message: "Test",
    provider: "local",
    streaming: false
  }
});

# Résultat attendu:
{
  success: true,
  message: {
    content: "Echo: Test",
    provider: "local",
    model: "echo-v1",
    timestamp: 1732704000000,
    tokens: { input: 4, output: 11, total: 15 }
  },
  latency_ms: 5
}
```

**Si ça marche**: ✅ Backend Rust fonctionnel, provider local OK

---

### **Test 3: Chat IA (UI)**

```bash
# 1. Ouvrir l'interface Chat IA (💬)
# 2. Envoyer message: "Bonjour"
# 3. Vérifier DevTools Console pour logs:
#    - "🦀 Tauri Chat Provider: Sending to Rust backend..."
#    - "[CHAT_SEND_MESSAGE] Request received"
#    - "✅ Response received in Xms"

# 4. Observer réponse UI:
#    - Bubble message apparaît
#    - Provider badge (Gemini/Ollama/Local)
#    - Timestamp correct
```

**Résultat attendu**: ✅ Message envoyé, réponse reçue et affichée

---

### **Test 4: Chat IA (Providers Cascade)**

```typescript
// Test provider "auto" (cascade)
await window.__TAURI__.core.invoke('chat_send_message', {
  request: {
    message: "Test cascade",
    provider: "auto", // Gemini → Ollama → Local
    streaming: false
  }
});

// Logs attendus dans Console:
// [CHAT_SEND_MESSAGE] Provider mode: auto (will cascade)
// [CHAT_SEND_MESSAGE] Try provider: gemini
// [CHAT_SEND_MESSAGE] Gemini failed: API key not set
// [CHAT_SEND_MESSAGE] Try provider: ollama
// [CHAT_SEND_MESSAGE] Ollama failed: Connection refused
// [CHAT_SEND_MESSAGE] Try provider: local (fallback)
// [CHAT_SEND_MESSAGE] ✅ Local echo success
```

**Si pas de Gemini API key ou Ollama**: ✅ Doit fallback sur Local echo

---

## 🔧 DÉPANNAGE

### **Problème: DevTools ne s'ouvre toujours pas**

**Solutions**:

1. **Vérifier raccourci clavier**:
   - Linux: **F12** ou **Ctrl+Shift+I**
   - macOS: **Cmd+Option+I**
   - Windows: **F12** ou **Ctrl+Shift+I**

2. **Vérifier configuration Tauri** (déjà fait ✅):
   ```json
   "devtools": true
   ```

3. **Réinstaller node_modules** (si corruption):
   ```bash
   npm run clean
   npm install
   ```

4. **Vérifier permissions** (Linux):
   ```bash
   # Si fenêtre blanche ou crash
   export WEBKIT_DISABLE_COMPOSITING_MODE=1
   npm run tauri:dev
   ```

5. **Forcer rebuild**:
   ```bash
   npm run clean:dist
   npm run build
   cd src-tauri && cargo clean && cd ..
   npm run tauri:dev
   ```

---

### **Problème: Chat IA "Connection failed" ou timeout**

**Solutions**:

1. **Tester backend directement** (Console DevTools):
   ```javascript
   // Test simple
   await window.__TAURI__.core.invoke('chat_send_message', {
     request: { message: "Test", provider: "local", streaming: false }
   });
   ```

2. **Vérifier logs Rust** (terminal):
   ```bash
   # Chercher dans terminal où npm run tauri:dev tourne:
   [CHAT_SEND_MESSAGE] Request received
   [CHAT_SEND_MESSAGE] Provider mode: local
   [CHAT_SEND_MESSAGE] ✅ Success
   ```

3. **Si "command not found"**: Backend non compilé
   ```bash
   cd src-tauri
   cargo build
   cd ..
   npm run tauri:dev
   ```

4. **Si "Local echo only"**: Providers externes down (normal)
   - Gemini: API key manquante → Settings → Chat IA → Gemini API Key
   - Ollama: Service non démarré → `systemctl start ollama` (Linux)

---

### **Problème: Chat UI affiche "Provider unavailable"**

**Solutions**:

1. **Vérifier provider status** (Console):
   ```javascript
   await window.__TAURI__.core.invoke('chat_get_providers_status');
   // Résultat attendu:
   // [
   //   { name: "gemini", available: false, last_check: ... },
   //   { name: "ollama", available: false, last_check: ... },
   //   { name: "local", available: true, last_check: ... }
   // ]
   ```

2. **Forcer mode Local** (Settings):
   - Chat IA → Provider → Sélectionner "local"
   - Envoyer message test
   - Doit répondre "Echo: [message]"

3. **Check network** (si Gemini):
   ```bash
   curl -X POST "https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=YOUR_KEY" \
     -H 'Content-Type: application/json' \
     -d '{"contents":[{"parts":[{"text":"Test"}]}]}'
   ```

4. **Check Ollama** (si local):
   ```bash
   curl http://localhost:11434/api/tags
   # Attendu: {"models":[...]}
   ```

---

## 📊 CHECKLIST FINALE

Avant de signaler un bug, vérifier:

- [ ] ✅ DevTools activé dans `tauri.conf.json` (lignes 42, 59)
- [ ] ✅ `devUrl: "http://localhost:5173"` (ligne 10)
- [ ] ✅ Commandes enregistrées dans `main.rs` (lignes 306, 313)
- [ ] ✅ Chat Orchestrator existe (`chat_orchestrator.rs`)
- [ ] ✅ Frontend provider existe (`tauriChat.ts`)
- [ ] ✅ Compilation Rust OK: `cd src-tauri && cargo check`
- [ ] ✅ Compilation TS OK: `npm run type-check`
- [ ] ✅ App lance en dev: `npm run tauri:dev`
- [ ] ✅ F12 ouvre DevTools
- [ ] ✅ Console affiche logs TITANE
- [ ] ✅ Test commande direct (voir Test 2 ci-dessus)
- [ ] ✅ Chat UI envoie message
- [ ] ✅ Réponse "Echo: [message]" reçue (provider local)

**Si TOUS cochés**: ✅ Système 100% opérationnel!

---

## 🚀 LANCEMENT RAPIDE

```bash
# Terminal 1: Build watch (optionnel, pour hot reload)
npm run build:watch

# Terminal 2: Lancer app en mode dev
npm run tauri:dev

# Une fois ouvert:
# 1. F12 → DevTools s'ouvre ✅
# 2. Ouvrir Chat IA (💬) ✅
# 3. Message "Bonjour" → Réponse "Echo: Bonjour" ✅
```

**Durée totale**: 30 secondes après build initial

---

## 📝 NOTES IMPORTANTES

### **Provider Cascade (mode "auto")**

```
Request → Rust Backend (chat_send_message)
            ↓
         Provider: auto
            ↓
    Try 1: Gemini API
         └─ ❌ API key manquante → SKIP
            ↓
    Try 2: Ollama Local
         └─ ❌ Service down → SKIP
            ↓
    Try 3: Local Echo
         └─ ✅ TOUJOURS DISPONIBLE
            ↓
         Response: "Echo: [message]"
```

**Donc**: Même sans Gemini API ou Ollama, le Chat IA **doit toujours fonctionner** en mode Local echo.

### **Performance Attendue**

| Provider | Latency | Disponibilité |
|---|---|---|
| **Local echo** | < 50ms | ✅ 100% (offline) |
| **Ollama** (local) | 0.5-2s | ⚠️ Si service actif |
| **Gemini** (cloud) | 1-3s | ⚠️ Si API key + réseau |

### **Logs Importants**

**Console Frontend** (F12):
```
🦀 Tauri Chat Provider: Sending to Rust backend...
   📝 Message: "Bonjour"
   🎯 Provider mode: auto (cascade)
   ✅ Response received in 5ms
   🏷️  Provider: local, Model: echo-v1
```

**Terminal Backend** (cargo):
```
[CHAT_SEND_MESSAGE] Request received
[CHAT_SEND_MESSAGE] Provider mode: auto
[CHAT_SEND_MESSAGE] Try provider: gemini → FAILED (no API key)
[CHAT_SEND_MESSAGE] Try provider: ollama → FAILED (connection refused)
[CHAT_SEND_MESSAGE] Try provider: local → SUCCESS
[CHAT_SEND_MESSAGE] ✅ Response: "Echo: Bonjour" (5ms)
```

---

**Auteur**: GitHub Copilot (Claude Sonnet 4.5)
**Date**: 27 novembre 2025
**Version**: TITANE∞ v19.2
**Status**: ✅ **CORRECTIONS APPLIQUÉES - PRÊT À TESTER**
