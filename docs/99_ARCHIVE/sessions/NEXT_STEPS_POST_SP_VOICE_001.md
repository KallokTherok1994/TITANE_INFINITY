# TITANE∞ v∞ — Next Steps (Post SP-VOICE-001)

## ✅ Complété

**SP-VOICE-001**: Anti-Feedback Loop (3 couches) ✅
- Layer 1: Echo Cancellation Hardware (useVoiceInput.ts)
- Layer 2: Auto-Mute Microphone (useTTSWithMicControl.ts)
- Layer 3: Voice Fingerprinting (voice_fingerprint.rs)
- Build: ✅ Success (10.64s, 0 warnings)
- Commit: `1008da2` (14 files, 1857+ lignes)

---

## 🎯 Prochaines Étapes (Priorité P0)

### 1. Tests Unitaires + Intégration (SP-VOICE-003) ⏳

**Target**: >90% code coverage

**Tests à créer**:
```bash
# Frontend
src/hooks/__tests__/useVoiceInput.test.ts
src/hooks/__tests__/useTTSWithMicControl.test.ts

# Backend
src-tauri/src/audio/voice_fingerprint.rs (tests déjà inclus)

# Integration
tests/e2e/voice-feedback-loop.test.ts
```

**Commandes**:
```bash
npm run test -- useVoiceInput.test.ts
npm run test -- useTTSWithMicControl.test.ts
npm run test:coverage
cargo test voice_fingerprint --all-features
```

**Validation**: Coverage >90%, tous les tests passent

---

### 2. Production FFT/MFCC (voice_fingerprint.rs) ⏳

**Status Actuel**: Placeholders (pitch=150.0, mfcc=vec![0.0; 13])

**À implémenter**:
- ✅ `detect_pitch()`: YIN algorithm ou autocorrelation
- ✅ `detect_formants()`: LPC (Linear Predictive Coding)
- ✅ `calculate_spectral_centroid()`: FFT + weighted average
- ✅ `calculate_mfcc()`: FFT + mel filterbank + DCT

**Dependencies Rust**:
```toml
[dependencies]
rustfft = "6.1"      # Fast Fourier Transform
ndarray = "0.15"     # Matrix operations
```

**Effort estimé**: 2-3 jours

**Validation**: Latency <50ms, Accuracy >90%

---

### 3. Tauri Commands (Backend Integration) ⏳

**Créer**:
```rust
#[tauri::command]
async fn calibrate_titane_voice(samples: Vec<Vec<f32>>) -> Result<(), String>

#[tauri::command]
async fn check_titane_voice(samples: Vec<f32>) -> Result<(bool, f32), String>
```

**Register** dans `main.rs`:
```rust
.invoke_handler(tauri::generate_handler![
    calibrate_titane_voice,
    check_titane_voice,
    // ... autres
])
```

**Frontend Usage**:
```typescript
import { invokeWithRetry } from '@/lib/security';

// Calibration au démarrage
await invokeWithRetry('calibrate_titane_voice', { samples });

// Détection pendant conversation
const { isTitane, similarity } = await invokeWithRetry('check_titane_voice', { samples });
```

---

### 4. UI Integration (React Components) ⏳

**Exemple d'usage**:
```tsx
import { useVoiceInput } from '@/hooks/useVoiceInput';
import { useTTSWithMicControl } from '@/hooks/useTTSWithMicControl';

function VoiceConversation() {
  const { startListening, stopListening, transcript } = useVoiceInput();
  const { speak, stopSpeaking, isSpeaking, isMicSuspended } = useTTSWithMicControl({
    resumeDelay: 500,
    enableDuplex: false,
  });

  return (
    <div>
      <button onClick={startListening}>🎤 Listen</button>
      <button onClick={() => speak('Bonjour!')}>🔊 Speak</button>
      <div>Transcript: {transcript}</div>
      <div>Mic: {isMicSuspended ? '🔇 Muted' : '🎤 Active'}</div>
    </div>
  );
}
```

---

### 5. Calibration Automatique (Startup) ⏳

**Workflow**:
1. Au démarrage TITANE
2. Générer 5-10s de samples TTS (phrases variées)
3. Appeler `calibrate_titane_voice(samples)`
4. Profil TITANE stocké en mémoire

**Phrases calibration** (exemple):
```typescript
const calibrationPhrases = [
  'Bonjour, je suis TITANE',
  'Comment puis-je vous aider?',
  'Analysons cela ensemble',
  'Voici ma réponse',
  'Merci pour votre question',
];

async function calibrateTitaneVoice() {
  const samples = [];
  for (const phrase of calibrationPhrases) {
    const audio = await generateTTSAudio(phrase);
    samples.push(audio);
  }
  await invokeWithRetry('calibrate_titane_voice', { samples });
  console.log('✅ TITANE voice calibrated');
}
```

---

## 🎯 Prochaines Étapes (Priorité P1)

### 6. SP-VOICE-002: Optimisation Latence TTS ⏳

**Objectif**: Réduire latence TTS <200ms

**Mécanismes**:
- ✅ Pré-génération: 100+ réponses françaises communes (cache)
- ✅ Streaming audio: Chunks 0.5-1.0s
- ✅ `useStreamingTTS.ts`: WebAudio API buffering

**Script Python**:
```python
# tts_pregenerate.py
common_phrases = [
    "Bonjour", "Oui", "Non", "Merci", "D'accord",
    "Je comprends", "Continuez", "C'est intéressant",
    # ... 100+ phrases
]

for phrase in common_phrases:
    audio = generate_tts(phrase)
    save_to_cache(phrase, audio)
```

---

### 7. SP-VOICE-004: Feedback Visuel (Waveform + VAD) ⏳

**Composants UI**:
- ✅ Waveform visualization (voix User + TTS)
- ✅ VAD indicators (speech/silence)
- ✅ Echo cancellation status
- ✅ Voice fingerprinting confidence (0-100%)

**Exemple**:
```tsx
<VoiceVisualization>
  <Waveform audioStream={userAudio} color="blue" />
  <VADIndicator state={vadState} /> {/* speech/silence */}
  <EchoCancellationBadge enabled={echoCancellationEnabled} />
  <VoiceConfidence score={voiceSimilarity} /> {/* 0-100% */}
</VoiceVisualization>
```

---

### 8. SP-VOICE-005: Déchargement Modèles (Memory) ⏳

**Objectif**: Libérer RAM si modèles inactifs >5min

**Mécanisme**:
```typescript
const modelManager = {
  lastUsed: new Map(),
  unloadThreshold: 5 * 60 * 1000, // 5 minutes
  
  async checkUnload() {
    for (const [model, timestamp] of this.lastUsed) {
      if (Date.now() - timestamp > this.unloadThreshold) {
        await unloadModel(model);
        console.log(`🗑️ Model ${model} unloaded (inactive 5min)`);
      }
    }
  },
};
```

---

## 🎯 Prochaines Étapes (Priorité P2)

### 9. SP-VOICE-007: VAD ML-Based ⏳

**Remplacer**: Threshold basique (0.02) par ML model

**Modèles**:
- Silero VAD (PyTorch/ONNX)
- WebRTC VAD (C++)
- Custom LSTM VAD

**Integration**:
```typescript
import { SileroVAD } from '@/services/vad/sileroVAD';

const vad = new SileroVAD();
await vad.load();

const isSpeech = await vad.detect(audioChunk); // true/false
```

---

### 10. SP-VOICE-008: Support Multi-Langues ⏳

**Langues cibles**: fr-FR (default), en-US, es-ES, de-DE

**Voice Fingerprinting**: Profil par langue
```rust
pub struct VoiceFingerprint {
    titane_profiles: HashMap<String, VoiceProfile>, // "fr-FR" → profile
}

pub fn calibrate_titane(&mut self, language: &str, samples: Vec<Vec<f32>>);
pub fn is_titane_speaking(&self, language: &str, samples: &[f32]) -> (bool, f32);
```

---

## 📊 Timeline Estimée

| Phase | Priorité | Effort | Date cible |
|-------|----------|--------|------------|
| Tests unitaires/intégration | P0 | 2-3j | Semaine 1 |
| Production FFT/MFCC | P0 | 2-3j | Semaine 1 |
| Tauri commands | P0 | 1j | Semaine 1 |
| UI integration | P0 | 1-2j | Semaine 2 |
| Calibration automatique | P0 | 1j | Semaine 2 |
| Optimisation latence TTS | P1 | 2-3j | Semaine 3 |
| Feedback visuel | P1 | 2j | Semaine 3 |
| Déchargement modèles | P1 | 1j | Semaine 3 |
| VAD ML-based | P2 | 3-4j | Semaine 4+ |
| Multi-langues | P2 | 2-3j | Semaine 4+ |

**Total P0**: ~7-10 jours (2 semaines)  
**Total P0+P1**: ~12-16 jours (3-4 semaines)  
**Total P0+P1+P2**: ~17-23 jours (4-5 semaines)

---

## 🏆 Définition of Done

### P0 (Critical)
- ✅ Tests unitaires: >90% coverage
- ✅ Production FFT/MFCC: <50ms latency
- ✅ Tauri commands: calibrate + check functional
- ✅ UI integration: Hooks utilisables dans React
- ✅ Calibration: Automatique au startup

### P1 (High)
- ✅ Latence TTS: <200ms (streaming + cache)
- ✅ Feedback visuel: Waveform + VAD indicators
- ✅ Memory: Déchargement modèles inactifs

### P2 (Medium)
- ✅ VAD: ML-based (Silero ou équivalent)
- ✅ Multi-langues: fr/en/es/de support

---

## 🔧 Commandes Utiles

### Development
```bash
npm run dev                    # Dev mode
npm run build                  # Production build
npm run test                   # Run tests
npm run test:coverage          # Coverage report
npm run lint                   # ESLint check
```

### Backend
```bash
cd src-tauri
cargo build --release          # Build Rust
cargo test                     # Run tests
cargo clippy                   # Linter
```

### Git
```bash
git status                     # Check changes
git log --oneline -10          # Recent commits
git diff HEAD~1                # Last commit diff
```

---

**Status Actuel**: ✅ SP-VOICE-001 DONE, prêt pour P0 (tests + FFT/MFCC)

*TITANE∞ v∞ — 7 décembre 2025*
