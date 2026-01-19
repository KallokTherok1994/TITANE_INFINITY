# ✅ **TITANE∞ AUDIO PIPELINE — CHECKLIST POST-INTÉGRATION**

## **🚀 ÉTAPES DE VÉRIFICATION**

### **1. COMPILATION RUST**

```bash
cd src-tauri
cargo check
```

**✅ ATTENDU :** Compilation réussie sans erreurs

**⚠️ SI ERREURS :**
- Vérifier `chrono` dans `Cargo.toml`
- `cargo clean && cargo check`

---

### **2. COMPILATION FRONTEND**

```bash
pnpm run type-check
```

**✅ ATTENDU :** Pas d'erreurs TypeScript

---

### **3. TEST DÉMARRAGE APPLICATION**

```bash
pnpm run tauri:dev
```

**✅ ATTENDU :** Application démarre sans crash

---

### **4. TEST ENREGISTREMENT BASIQUE**

1. Ouvrir **Vocal Dev Console** ou **Voice Conversation**
2. Cliquer sur **"Start Recording"** (ou équivalent)
3. Parler 2-3 secondes
4. Cliquer sur **"Stop"** ou attendre détection silence (VAD)

**✅ ATTENDU :**
- Pas d'erreur "Recording already in progress"
- Transcription s'affiche (même vide si ASR non configuré)
- État retourne à "idle"

**📊 LOGS À VÉRIFIER (Console DevTools) :**
```
[RecordingEngine] Starting recording: rec_xxx
[RecordingEngine] arecord started with PID: xxxx
[useVoiceEngine] ✅ Recording started
[useVoiceEngine] ✅ Recording stopped
```

---

### **5. TEST ANTI-DEBOUNCE**

Ouvrir Console DevTools :

```typescript
// Tester double-appel
const { voiceService } = await import('@/services/api/voice');
await voiceService.startRecording();
await voiceService.startRecording(); // Devrait throw error
```

**✅ ATTENDU :** Second appel → Erreur "Recording already in progress"

---

### **6. TEST AUTO-TEST ENGINE**

Dans Console DevTools :

```typescript
const { audioAutoTest } = await import('@/services/audio/audioAutoTest');
const suite = await audioAutoTest.runFullSuite();
console.log(audioAutoTest.generateReport(suite));
```

**✅ ATTENDU :**
- 6 tests exécutés
- Minimum 4/6 passed (backend + recording cycle + state machine + TTS)
- Rapport affiché

---

### **7. TEST SELF-HEAL (OPTIONNEL)**

```typescript
const { audioSelfHeal } = await import('@/services/audio/audioSelfHeal');

// Vérifier qu'il tourne
audioSelfHeal.start();

// Consulter status
console.log(audioSelfHeal.getStatus());
// { isHealthy: true, issues: [], ... }
```

---

### **8. TEST CANCEL/RESET**

1. Start recording
2. Immédiatement cliquer **Cancel**
3. Vérifier retour à idle

**✅ ATTENDU :**
- Pas de processus arecord orphelin
- État = idle
- Peut relancer enregistrement

---

## **🐛 TROUBLESHOOTING**

### **Problème : "arecord: command not found"**

**Solution :**
```bash
# Linux (Debian/Ubuntu)
sudo apt install alsa-utils

# Arch Linux
sudo pacman -S alsa-utils

# Test
arecord -l
```

---

### **Problème : "Microphone unavailable"**

**Solutions :**

1. **Permissions Tauri**
   ```json
   // src-tauri/capabilities/default.json
   {
     "permissions": [
       "core:default",
       "audio:default"
     ]
   }
   ```

2. **Test système**
   ```bash
   arecord -d 2 test.wav
   aplay test.wav
   ```

3. **PulseAudio/PipeWire**
   ```bash
   pactl list short sources
   ```

---

### **Problème : "Recording stuck in progress"**

**Solution Manuelle :**

```typescript
// Console DevTools
const { audioSelfHeal } = await import('@/services/audio/audioSelfHeal');
await audioSelfHeal.forceReset();
```

**Solution Automatique :**
Le Self-Heal Engine devrait détecter et corriger automatiquement en < 30s.

---

### **Problème : "State machine stuck"**

**Solution :**

```typescript
import { audioStateMachine } from '@/services/audio/audioStateMachine';
audioStateMachine.forceReset();
```

---

## **📦 FICHIERS À VÉRIFIER AVANT COMMIT**

### **Backend**
- [x] `src-tauri/src/audio/recording_engine.rs`
- [x] `src-tauri/src/audio/mod.rs`
- [x] `src-tauri/src/audio/commands.rs`
- [x] `src-tauri/src/main.rs`

### **Frontend**
- [x] `src/services/api/voice.ts`
- [x] `src/hooks/useVoiceEngine.ts`
- [x] `src/utils/tauriProtector.ts`
- [x] `src/lib/security.ts`
- [x] `src/services/audio/audioStateMachine.ts`
- [x] `src/services/audio/audioSelfHeal.ts` [NOUVEAU]
- [x] `src/services/audio/audioAutoTest.ts` [NOUVEAU]

### **Documentation**
- [x] `TITANE_AUDIO_PIPELINE_FINAL_v∞.md`

---

## **🎯 TESTS FINAUX AVANT PRODUCTION**

### **Test 1 : Conversation Complète**

1. Activer Voice Conversation
2. Dire "Bonjour TITANE"
3. Attendre réponse TTS
4. Enchaîner 2-3 tours de conversation

**✅ OBJECTIF :** Aucun blocage, transitions fluides

---

### **Test 2 : Stress Test**

```typescript
// Console DevTools
for (let i = 0; i < 10; i++) {
  await voiceService.startRecording();
  await new Promise(r => setTimeout(r, 500));
  await voiceService.stopRecording();
  await new Promise(r => setTimeout(r, 500));
}
```

**✅ OBJECTIF :** 10 cycles sans erreur

---

### **Test 3 : Recovery après Crash**

1. Tuer processus arecord manuellement : `pkill -9 arecord`
2. Attendre 5-10 secondes
3. Relancer enregistrement

**✅ OBJECTIF :** Self-Heal détecte + reset + nouveau recording OK

---

## **📊 MÉTRIQUES DE SUCCÈS**

- ✅ **0 erreurs** "Recording already in progress"
- ✅ **100% recovery** après états bloqués (< 30s)
- ✅ **Latence < 500ms** pour start/stop recording
- ✅ **Auto-Test Suite : ≥ 4/6 tests** passed
- ✅ **Self-Heal : 0 interventions manuelles** nécessaires en 1h utilisation

---

## **🎉 VALIDATION FINALE**

Lorsque tous les tests ci-dessus passent :

```bash
# Build production
pnpm run tauri:build

# Test binaire
./src-tauri/target/release/titane-infinity
```

**✅ SI SUCCÈS :**
Le pipeline audio TITANE∞ est **100% opérationnel et production-ready** ! 🎤🚀

---

**DATE : 4 décembre 2025**
**VERSION : v∞ Production**
