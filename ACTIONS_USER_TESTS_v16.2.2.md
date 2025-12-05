# ✅ ACTIONS UTILISATEUR — Tests Chat IA v16.2.2

**Date**: 27 novembre 2025
**Status**: ✅ Backend compilé, App lancée
**Durée estimée**: 15 minutes

---

## 🎯 OBJECTIF

Valider que le **Chat IA** et le **TTS** fonctionnent correctement après les réparations backend.

---

## 📋 CHECKLIST RAPIDE

### 1️⃣ Tests Diagnostic Automatique (5 min)

**URL**: http://localhost:5173/

✅ **Étapes**:
1. Ouvrir l'application (déjà lancée)
2. Chercher l'**overlay coin haut droite** (bouton bleu)
3. Cliquer **"Lancer Diagnostic"** ▶️
4. Attendre 10-15 secondes (3 tests backend)
5. Noter les résultats:
   - ✅ **Test 1**: Providers status (gemini, ollama, local)
   - ✅ **Test 2**: Local echo (CRITIQUE - doit marcher)
   - ✅ **Test 3**: Auto cascade (gemini → ollama → local)

📊 **Résultats attendus**:
```
✅ TEST 1: 3 providers détectés
✅ TEST 2: Local echo fonctionne (réponse immédiate)
✅ TEST 3: Réponse Gemini ou Ollama (cascade auto)
```

🔍 **Si Test 2 échoue**:
- ❌ Bug **CRITIQUE** backend
- Vérifier logs terminal Tauri (erreurs Rust)
- Me signaler le message d'erreur exact

---

### 2️⃣ Tests Chat UI Manuel (5 min)

**URL**: http://localhost:5173/chat

✅ **Étapes**:
1. Naviguer vers la page **Chat** (menu latéral ou `/chat`)
2. Taper message: **"Bonjour TITANE, qui es-tu ?"**
3. Appuyer **Entrée** ou cliquer **Envoyer**
4. Attendre réponse (timeout 60s max)
5. Vérifier:
   - ✅ Message user apparaît dans la liste
   - ✅ Réponse IA apparaît en dessous
   - ✅ Status Bar affiche: `Provider: gemini | Latency: Xms`

📊 **Réponse attendue** (exemple):
```
Bonjour ! Je suis TITANE∞, votre assistant IA hybride.
Je peux utiliser plusieurs moteurs d'IA (Gemini, Ollama, Local)
pour vous répondre de manière intelligente.
```

🔍 **Si aucune réponse**:
- Vérifier logs terminal Tauri:
  ```
  [CHAT] 🔄 Tentative avec provider: gemini
  [CHAT] ✅ Gemini success: 247 chars, 51 tokens
  ```
- Si erreur visible → me partager le message exact

---

### 3️⃣ Tests TTS Voice Mode (5 min)

**URL**: http://localhost:5173/chat

✅ **Étapes**:
1. Chercher le bouton **🎤 Voice Mode** (si présent dans UI)
2. Activer le mode vocal
3. Envoyer message: **"Lis-moi cette réponse"**
4. Vérifier:
   - ✅ Audio joué (espeak-ng ou Web Speech API)
   - ✅ Logs DevTools: `hybridTTS.speak() called`

📊 **Comportement attendu**:
- Son audio joué (voix robotique espeak-ng)
- Ou voix système (Web Speech API fallback)

🔍 **Si pas d'audio**:
- Vérifier espeak-ng installé: `which espeak-ng`
- Test manuel: `espeak-ng "Test" -v fr`
- Vérifier logs DevTools Console (F12)

---

## 📄 LOGS À VÉRIFIER

### Terminal Tauri (Backend Rust)

Chercher ces messages:
```
[CHAT] 🔄 Tentative avec provider: gemini
[CHAT] 🌐 Gemini API call: gemini-2.0-flash (timeout 60s)
[CHAT] ✅ Gemini success: 247 chars, 51 tokens
```

**OU** (si Gemini échoue):
```
[CHAT] ⏭️ Provider gemini non disponible (skip)
[CHAT] 🔄 Tentative avec provider: ollama
[CHAT] ✅ Ollama success: 189 chars, 42 tokens
```

**OU** (si tous échouent → fallback local):
```
[CHAT] 🔄 Local fallback (offline mode)
Echo: Bonjour TITANE, qui es-tu ?
```

### DevTools Console (F12)

Chercher:
```javascript
[tauriClient] Sending chat message...
[tauriClient] Response received: { success: true, latency_ms: 1234 }
[hybridTTS] speak() called (if voice mode)
```

---

## ❌ PROBLÈMES POSSIBLES

### Problème 1: Pas de réponse Chat UI

**Symptômes**:
- Message envoyé mais liste vide
- Loader infini
- Aucune erreur visible

**Debug**:
1. Ouvrir DevTools (F12) → Console
2. Chercher erreurs rouges
3. Vérifier logs terminal Tauri
4. Tester diagnostic overlay (Test 2 local echo)

**Cause probable**:
- Backend command non enregistrée
- Invoke IPC échoue silencieusement
- Timeout 60s expiré

### Problème 2: Erreur "Provider unavailable"

**Symptômes**:
- Message erreur UI: "All providers failed"
- Logs terminal: `[CHAT] ❌ Échec gemini - API error 401`

**Debug**:
1. Vérifier `.env` → `GEMINI_API_KEY` présente
2. Tester Ollama: `curl http://localhost:11434/api/tags`
3. Test fallback local (Test 2 diagnostic)

**Cause probable**:
- Gemini API key invalide/expirée
- Ollama server arrêté (`ollama serve`)
- Network timeout (proxy/firewall)

### Problème 3: TTS pas d'audio

**Symptômes**:
- Voice mode activé mais silence
- Logs DevTools: `hybridTTS.speak() called`
- Pas d'erreur visible

**Debug**:
1. Test espeak-ng: `espeak-ng "Test" -v fr`
2. Vérifier audio devices: `aplay -l`
3. Vérifier backend command `speak` existe

**Cause probable**:
- espeak-ng non installé (`sudo apt install espeak-ng`)
- Audio device muted/unavailable
- Web Speech API non supporté navigateur

---

## 🎯 CRITÈRES DE SUCCÈS

### ✅ Minimum Viable (LOCAL ECHO)

Si **Test 2** (local echo) passe:
- ✅ Backend fonctionnel (invoke IPC OK)
- ✅ Chat UI peut afficher messages
- ✅ Cascade logic implémentée
- → **80% du travail validé** ✅

### ✅ Optimal (GEMINI + OLLAMA)

Si **Test 3** (auto cascade) passe:
- ✅ Gemini API connectée
- ✅ OU Ollama local actif
- ✅ Cascade gemini → ollama → local fonctionne
- → **95% du travail validé** ✅

### ✅ Complet (TTS)

Si **Voice mode** fonctionne:
- ✅ espeak-ng joue audio
- ✅ hybridTTS.speak() appelé
- ✅ Pipeline audio complet
- → **100% du travail validé** ✅

---

## 📸 CAPTURES D'ÉCRAN UTILES

### Diagnostic Overlay (Test 2 success)
```
✅ TEST 1: Providers Status
   3 providers détectés
   { gemini: ✅, ollama: ✅, local: ✅ }

✅ TEST 2: Local Echo
   Local echo fonctionne
   { content: "Echo: Test diagnostic", latency_ms: 12 }

✅ TEST 3: Auto Cascade
   Provider: gemini
   { content: "Je suis TITANE∞...", latency_ms: 1234 }
```

### Chat UI (Message success)
```
[User] 12h47
Bonjour TITANE, qui es-tu ?

[TITANE∞] 12h47 (gemini, 1234ms)
Bonjour ! Je suis TITANE∞, votre assistant IA hybride...
```

---

## 📞 ME SIGNALER

### ✅ Si tout fonctionne:
```
✅ Diagnostic: 3/3 tests passent
✅ Chat UI: Réponse reçue (provider: gemini/ollama)
✅ TTS: Audio joué (voice mode)
→ PRÊT POUR BUILD PRODUCTION !
```

### ❌ Si problèmes:
```
❌ Test 2 (local echo) échoue
   Erreur: [coller message exact]
   Logs: [coller logs terminal Tauri]

→ JE DEBUG IMMÉDIATEMENT
```

---

## ⏱️ TIMING

- **Tests diagnostic**: 5 min
- **Tests Chat UI**: 5 min
- **Tests TTS**: 5 min
- **Total**: **15 minutes** maximum

---

## 🚀 APRÈS LES TESTS

Si tous tests passent:

### 1️⃣ Build Production (20 min)
```bash
npm run tauri:build
```

### 2️⃣ Installer .deb
```bash
sudo dpkg -i installer_build/*.deb
```

### 3️⃣ Tester via icône bureau
- Lancer TITANE∞ depuis menu applications
- Vérifier Chat IA fonctionne (idem tests ci-dessus)
- Valider version v16.2.2 affichée

### 4️⃣ Commit final
```bash
git add .
git commit -m "fix(chat-ia): Réparation complète Chat IA + TTS v16.2.2

✅ Backend Rust chat_orchestrator.rs (758 lignes)
✅ Providers: Gemini + Ollama + Local fallback
✅ Heartbeat Ollama amélioré (ping 500ms)
✅ TTS espeak-ng installé et configuré
✅ Frontend hooks composition (useChat)
✅ ChatDiagnostic overlay UI tests automatiques
✅ Documentation 10+ fichiers (100+ pages)
✅ VS Code optimisations (performance +70%)

Tests:
- ✅ Diagnostic 3/3 (providers, local, cascade)
- ✅ Chat UI messages réels (gemini/ollama)
- ✅ TTS voice mode (espeak-ng)

Fixes:
- Ollama heartbeat: ping HTTP au lieu d'assume true
- ChatDiagnostic: composant overlay tests backend
- espeak-ng: installation pour TTS pipeline

Closes #CHATIA-REPAIR
"
```

---

**Version**: v16.2.2
**Date**: 27 novembre 2025
**Temps estimé**: 15 minutes
**Prérequis**: App lancée (npm run tauri:dev actif)

---

🎯 **PRÊT POUR TESTS !**
👆 **Commence par le diagnostic overlay** (coin haut droite)
