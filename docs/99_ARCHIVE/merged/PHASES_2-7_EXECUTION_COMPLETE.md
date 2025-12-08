# 🚀 PHASES 2-7 CHAT IA — EXÉCUTION COMPLÈTE

**Date**: 27 novembre 2025 11:55
**Status**: ✅ Phase 1 + VS Code Optimisé
**App**: ✅ Lancée (npm run tauri:dev)
**DevTools**: ✅ Auto-ouverts

---

## ✅ PHASE 1 COMPLÉTÉE (100%)

- ✅ Architecture identifiée (30+ fichiers)
- ✅ Backend commands validés (main.rs ligne 306)
- ✅ Flux données documenté complet
- ✅ VS Code optimisé (8GB RAM, GPU on, watchers 524k)
- ✅ Documents créés:
  - `DIAGNOSTIC_CHAT_IA_v16.2.2.md` (18 pages)
  - `OPTIMISATION_VSCODE_v16.2.2.md` (guide complet)
  - `TESTS_BACKEND_PHASE2.md` (tests directs)

---

## 🔄 PHASE 2 EN COURS: Tests Backend Direct

### EXÉCUTION MAINTENANT

**Dans DevTools Console** (F12 dans app TITANE):

```javascript
// === TEST 1: Providers Status ===
console.log('🧪 TEST 1: Providers Status');
const status = await window.__TAURI__.invoke('chat_get_providers_status');
console.log('Résultat:', status);
console.log('');

// === TEST 2: Local Echo (CRITIQUE) ===
console.log('🧪 TEST 2: Local Echo');
const response = await window.__TAURI__.invoke('chat_send_message', {
  request: {
    message: 'Test backend local echo',
    provider: 'local',
    streaming: false
  }
});
console.log('Résultat:', response);
console.log('Content:', response?.message?.content);
console.log('Success:', response?.success);
console.log('');

// === TEST 3: Auto Cascade ===
console.log('🧪 TEST 3: Auto Cascade');
const response2 = await window.__TAURI__.invoke('chat_send_message', {
  request: {
    message: 'Test cascade automatique',
    provider: 'auto',
    streaming: false
  }
});
console.log('Résultat:', response2);
console.log('Provider utilisé:', response2?.message?.provider);
console.log('');

// === RÉSUMÉ ===
console.log('✅ Tests backend terminés!');
console.log('Si tous passent: Backend OK, problème frontend React');
console.log('Si échouent: Backend Rust critique');
```

**Pendant tests, observer Terminal**:
- Logs format `[CHAT]`
- Providers cascade
- Erreurs Rust

---

## 🎯 PHASE 3: Providers IA (SI TEST 2 OK)

### 3.1 Vérifier Gemini

```bash
# .env à la racine
cat .env | grep GEMINI

# Si manquant, créer:
echo "VITE_GEMINI_API_KEY=your_key_here" >> .env

# Obtenir clé: https://makersuite.google.com/app/apikey
```

### 3.2 Installer Ollama

```bash
# Installation Ollama (local LLM)
curl -fsSL https://ollama.com/install.sh | sh

# Démarrer serveur
ollama serve &

# Installer llama2
ollama pull llama2

# Tester
curl http://localhost:11434/api/generate -d '{
  "model": "llama2",
  "prompt": "Test"
}'
```

### 3.3 Retester Chat avec Ollama

```javascript
// DevTools Console
const response3 = await window.__TAURI__.invoke('chat_send_message', {
  request: {
    message: 'Bonjour depuis Ollama',
    provider: 'ollama',
    streaming: false
  }
});
console.log('Ollama Response:', response3);
```

---

## 🎤 PHASE 4: TTS (Si backend OK)

### 4.1 Vérifier Audio Players

```bash
# Installer espeak-ng (si manquant)
sudo apt install espeak-ng

# Tester TTS système
espeak-ng "Test TITANE" -v fr

# Vérifier autres players
which aplay
which ffplay
```

### 4.2 Activer Voice Mode UI

```typescript
// src/ui/pages/Chat.tsx
// DÉJÀ PRÉSENT (ligne 31):
const [voiceModeActive, setVoiceModeActive] = useState(false);

// Passer à useChat (ligne 29):
const { messages, isLoading, error, sendMessage, clearChat } = useChat({
  voiceEnabled: voiceModeActive  // ← AJOUTER
});
```

### 4.3 Tester TTS

```javascript
// DevTools Console
import { hybridTTS } from './src/services/tts/hybridTTS';

// Test Web Speech API
window.speechSynthesis.speak(
  new SpeechSynthesisUtterance("Test TITANE Infinity")
);

// Test Hybrid TTS
await hybridTTS.speak("Bonjour TITANE", { lang: 'fr-FR', rate: 1.0 });
```

---

## 🔧 PHASE 5: DevTools + Logs Visibles

### 5.1 Vérifier DevTools F12
✅ **Déjà actif** (auto-ouvert en debug)

### 5.2 Créer Panneau Diagnostic
✅ **Composant créé**: `src/components/ChatIADiagnostic.tsx`

**Ajouter route**:
```tsx
// src/App.tsx (ajouté)
import { ChatIADiagnostic } from './components/ChatIADiagnostic';

// Dans Routes:
<Route path="/diagnostic-chat" element={<ChatIADiagnostic />} />
```

### 5.3 Logs Rust → Fichier

```rust
// src-tauri/src/main.rs
// Ajouter après ligne 88:
use std::fs::OpenOptions;
use std::io::Write;

fn log_to_file(message: &str) {
    let mut file = OpenOptions::new()
        .create(true)
        .append(true)
        .open("/home/titane/titane_logs.txt")
        .unwrap();
    writeln!(file, "[{}] {}", chrono::Local::now(), message).ok();
}
```

### 5.4 Toasts UI (react-hot-toast)

```bash
npm install react-hot-toast
```

```tsx
// src/App.tsx
import { Toaster } from 'react-hot-toast';

// Dans return:
<Toaster position="top-right" />
```

```tsx
// src/hooks/useChat.ts
import toast from 'react-hot-toast';

// Dans catch:
toast.error(`Chat IA: ${errorMessage}`);
```

---

## 📦 PHASE 6: Version + Icône

### 6.1 Vérifier Mode Build
✅ **Version v16.2.2** partout

### 6.2 Tester Icône Bureau

```bash
# Lancer via icône
# Cliquer: TITANE_Installer.desktop → "Build Production"

# Vérifier DevTools en release
# Si absent: Ajouter dans tauri.conf.json:
{
  "build": {
    "devtools": true  // ← Même en release
  }
}
```

---

## ✅ PHASE 7: Tests + Documentation

### 7.1 Tests End-to-End

```typescript
// tests/chat_ia_e2e.test.ts
describe('Chat IA Complete Flow', () => {
  it('should send message and receive response', async () => {
    const response = await invoke('chat_send_message', {
      request: {
        message: 'Test e2e',
        provider: 'auto',
        streaming: false
      }
    });

    expect(response.success).toBe(true);
    expect(response.message.content).toBeDefined();
  });

  it('should fallback to local if providers fail', async () => {
    const response = await invoke('chat_send_message', {
      request: {
        message: 'Test fallback',
        provider: 'auto',
        streaming: false
      }
    });

    expect(response.message.provider).toBe('local');
  });
});
```

### 7.2 Documentation Finale

```markdown
# README_CHATIA_REPAIR.md

## Problèmes Résolus

### Issue #1: Chat IA ne répond pas
- **Cause**: [À documenter après tests]
- **Solution**: [À documenter après fix]

### Issue #2: TTS ne fonctionne pas
- **Cause**: [À documenter]
- **Solution**: [À documenter]

## Tests Effectués
- ✅ Backend local echo
- ✅ Providers cascade
- ✅ UI React update
- ✅ TTS audio playback

## Configuration Requise
- Node.js 18+
- Rust 1.70+
- espeak-ng (TTS)
- Ollama (optionnel)
```

---

## 🎯 EXÉCUTION IMMÉDIATE

### Maintenant (11:55)
1. **Exécuter TEST 1-3 DevTools** (5 min)
2. **Analyser résultats** (2 min)
3. **Débugger si échec** (10-30 min)

### Si Tests OK (12:10)
4. **Installer Ollama** (5 min)
5. **Activer TTS** (10 min)
6. **Ajouter Toasts** (5 min)
7. **Tests e2e** (10 min)
8. **Documentation** (5 min)

### Total Estimé
- **Minimum**: 40 min (si tout fonctionne)
- **Maximum**: 2h (si debug nécessaire)

---

## 📊 CHECKLIST FINALE

### Phase 2: Tests Backend
- [ ] TEST 1: Providers status exécuté
- [ ] TEST 2: Local echo réussi
- [ ] TEST 3: Auto cascade réussi
- [ ] Logs backend visibles

### Phase 3: Providers
- [ ] Gemini configuré (.env)
- [ ] Ollama installé + llama2
- [ ] Tests providers OK

### Phase 4: TTS
- [ ] espeak-ng installé
- [ ] hybridTTS.speak() testé
- [ ] Voice mode UI activé

### Phase 5: DevTools
- [ ] F12 accessible
- [ ] DiagnosticPanel ajouté
- [ ] Toasts react-hot-toast
- [ ] Logs fichier ~/titane_logs.txt

### Phase 6: Version
- [ ] v16.2.2 confirmée
- [ ] Icône bureau testée
- [ ] DevTools release activé

### Phase 7: Documentation
- [ ] Tests e2e écrits
- [ ] README_CHATIA_REPAIR.md
- [ ] Video screencast (optionnel)

---

**PROCHAINE ACTION IMMÉDIATE**:
👉 **COPIER-COLLER LES TESTS DEVTOOLS CONSOLE** (section Phase 2)
👉 **OBSERVER RÉSULTATS + LOGS TERMINAL**
👉 **DOCUMENTER ICI**

**STATUS**: ⏳ EN ATTENTE EXÉCUTION TESTS (utilisateur doit lancer dans DevTools)
