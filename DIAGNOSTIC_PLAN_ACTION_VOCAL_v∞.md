# TITANE∞ v∞ — DIAGNOSTIC SYNTHÉTIQUE + PLAN D'ACTION

**Date**: 8 décembre 2025  
**Auteur**: GitHub Copilot (Claude Sonnet 4.5)  
**Context**: SUPER PROMPT #1 — Correction & Pauffinage Ultra Complet  
**Status**: ✅ PHASE 1 COMPLETE, PRÊT POUR PHASE 2

---

## 📋 1. DIAGNOSTIC SYNTHÉTIQUE

### ✅ **Forces Identifiées**

1. **Architecture Anti-Feedback Solide (3 couches)** ✅
   - Couche 1 : Echo Cancellation hardware (`echoCancellation: true`)
   - Couche 2 : Auto-Mute microphone (`useTTSWithMicControl`)
   - Couche 3 : Voice Fingerprinting (identifié, pas implémenté)

2. **Pipeline OMEGA Bien Structurée** ✅
   - 9 stages clairs : Validation → Memory → Coherence → AI → Save
   - Intégration vocale via flag `useVoiceMode`
   - Memory retrieval optimisée (top 3 semantic memories)

3. **State Machine Robuste** ✅
   - États clairs : `idle → user_speaking → processing → ai_speaking`
   - Transitions validées (table `VALID_TRANSITIONS`)
   - Support barge-in (interruption user)

4. **Modules Core Consolidés (v20.0)** ✅
   - Fusion #1 : Nexus + Consistency → Coherence
   - Fusion #2 : Memory + MemoryModule → UnifiedMemory
   - Fusion #3 : Helios + Sentinel + SelfHeal → SystemHealth

5. **Sécurité ShellGuard** ✅
   - Whisper CLI exécuté via `ShellGuard::execute_asr_whisper()`
   - TTS CLI exécuté via `ShellGuard::execute_tts_espeak()`
   - Protection injection commandes

---

### ⚠️ **Points Critiques Identifiés (31 total)**

#### 🔴 **P0 — CRITIQUE (7 points)**

| ID | Problème | Localisation | Impact | Solution |
|----|----------|--------------|--------|----------|
| P0-1 | Feedback loop TTS → Micro **non testé en prod** | Acoustique Speaker → Mic | ⚠️ Risque boucle infinie | Tester conditions réelles (sans casque) |
| P0-2 | Voice Fingerprinting **non implémenté** | `voice_fingerprint.rs` | ⚠️ Couche 3 anti-feedback manquante | Implémenter calibration TITANE vs User |
| P0-3 | STUB TTS dans `voice_engine.rs` | Ligne 338 | ⚠️ Commande `voice_synthesize_speech` inutilisable | Migrer vers `ai_chat.rs::speak()` |
| P0-4 | Parler-TTS backend **non testé** | `scripts/parler_tts_server.py` | ⚠️ Backend Python peut échouer silencieusement | Tester + ajouter health check |
| P0-5 | State machine **0% coverage** | `audioStateMachine.ts` | ⚠️ Transitions non validées | Tests unitaires + intégration |
| P0-6 | `useTTSWithMicControl` **0% coverage** | Hook principal anti-feedback | ⚠️ Auto-mute non testé | Tests unitaires suspend/resume |
| P0-7 | `useVAD` **0% coverage** | Hook VAD principal | ⚠️ Détection VAD non testée | Tests unitaires + mocks audio |

---

#### 🟠 **P1 — IMPORTANT (12 points)**

| ID | Problème | Localisation | Impact | Solution |
|----|----------|--------------|--------|----------|
| P1-1 | Pas de retry ASR | `voice.ts::startRecording()` | ⚠️ Échec Whisper → erreur directe | Fallback Web Speech API |
| P1-2 | Pas de retry TTS | `useTTSWithMicControl::speak()` | ⚠️ Échec TTS → erreur directe | Fallback WebSpeech |
| P1-3 | Logs non structurés | Tous fichiers TS/TSX | ⚠️ Debug difficile | Logger winston + contexte |
| P1-4 | Pas de corrélation logs | Frontend ↔ Backend | ⚠️ Traçabilité impossible | Trace ID (UUID) |
| P1-5 | Pas de monitoring performance | Pipeline OMEGA | ⚠️ Latence inconnue | Métriques ASR/TTS/OMEGA |
| P1-6 | Harmonia redondante | `harmonia.rs` | ⚠️ Fusion #4 pending | Fusionner avec SystemHealth |
| P1-7 | `HaloEngine` 0% coverage | `haloEngine.ts` | ⚠️ Animations non testées | Tests unitaires états |
| P1-8 | Erreurs audio sans modal user | `useVAD.ts` | ⚠️ User ne sait pas quoi faire | Modal "Micro indisponible" |
| P1-9 | Pas de streaming TTS | OMEGA → TTS | ⚠️ +2s latence perçue | Streaming génération + playback |
| P1-10 | Pas de cancel signal | OMEGA pendant barge-in | ⚠️ Waste compute | AbortController propagation |
| P1-11 | Voice context non enrichi | OMEGA prompts | ⚠️ Réponses trop longues | Prompt engineering voice mode |
| P1-12 | `whisper_streaming.rs` non testé | Backend streaming | ⚠️ Feature inconnue | Tester ou supprimer |

---

#### 🟡 **P2 — AMÉLIORATION (12 points)**

| ID | Problème | Impact | Solution |
|----|----------|--------|----------|
| P2-1 | Documentation VOCAL_README manquante | ⚠️ Onboarding difficile | Créer guide architecture |
| P2-2 | Tests E2E feedback loop manquants | ⚠️ Validation incomplète | Tests Playwright |
| P2-3 | Profiling latence manquant | ⚠️ Goulots inconnus | Chrome DevTools Performance |
| P2-4 | Auto-recovery audio manquant | ⚠️ Erreur device → crash | Retry getUserMedia |
| P2-5 | Performance budget non défini | ⚠️ Pas de cible latence | Définir SLA (5.5s total) |
| P2-6 | Multimodal pas préparé | ⚠️ Extension future difficile | Architecture pluggable |
| P2-7 | Adaptive voice manquant | ⚠️ User preferences ignorées | Config vitesse/ton/volume |
| P2-8 | VAD ML pas implémenté | ⚠️ VAD basique (threshold) | Modèle Silero VAD |
| P2-9 | Émotions pas détectées | ⚠️ Prosodie neutre | Analyse spectre audio |
| P2-10 | Wake word pas robuste | ⚠️ Faux positifs | Modèle Porcupine |
| P2-11 | Accessibilité non testée | ⚠️ ARIA/SR manquants | Audit Lighthouse |
| P2-12 | Logs backend non centralisés | ⚠️ Monitoring distribué | Loki ou Elasticsearch |

---

### 📂 **Modules Impactés (20 fichiers)**

#### Frontend (14 fichiers)

| Fichier | Type | Lignes | Priorité | Actions |
|---------|------|--------|----------|---------|
| `src/hooks/useVAD.ts` | Hook | 300+ | P0 | Tests + logs structurés |
| `src/hooks/useTTSWithMicControl.ts` | Hook | 170 | P0 | Tests + fallback |
| `src/hooks/useVoice.ts` | Hook | 368 | P1 | Deprecate (→ useVoiceEngine) |
| `src/hooks/useVoiceInput.ts` | Hook | 200+ | P1 | Tests echo cancellation |
| `src/hooks/useWhisperStream.ts` | Hook | 100+ | P2 | Valider usage ou supprimer |
| `src/services/api/voice.ts` | Service | 360 | P0 | Retry logic + logs |
| `src/services/audio/audioStateMachine.ts` | State Machine | 320 | P0 | Tests complets |
| `src/services/tts/hybridTTS.ts` | Service | 400+ | P1 | Fallback WebSpeech |
| `src/services/voice/haloEngine.ts` | Engine | 280 | P1 | Tests unitaires |
| `src/components/voice/HaloVisualizer.tsx` | Component | 150 | P2 | Tests Storybook |
| `src/components/voice/VoiceControlPanelWithWakeWord.tsx` | Component | 200+ | P2 | Audit UX |
| `src/features/audio-center/services/audioService.ts` | Service | 650+ | P1 | Audit complet |
| `src/services/ai/orchestrator_OMNIS_v1.ts` | Orchestrator | 1000+ | P1 | Métriques latence |
| `src/services/unified/UnifiedMemory.ts` | Memory | 12000+ | P1 | Profiling queries |

#### Backend (6 fichiers)

| Fichier | Type | Lignes | Priorité | Actions |
|---------|------|--------|----------|---------|
| `src-tauri/src/overdrive/voice_engine.rs` | Voice Engine | 500+ | P0 | Supprimer STUB TTS |
| `src-tauri/src/audio/asr.rs` | ASR | 150+ | P1 | Retry logic |
| `src-tauri/src/audio/whisper_streaming.rs` | Streaming | 200+ | P2 | Tester ou supprimer |
| `src-tauri/src/audio/voice_fingerprint.rs` | Fingerprint | ? | P0 | Implémenter calibration |
| `src-tauri/src/commands/ai_chat.rs` | Commands | 300+ | P1 | Logs structurés |
| `src-tauri/src/chat_engine/speech.rs` | Speech | 400+ | P2 | Audit complet |

---

## 🎯 2. PLAN D'ACTION DÉTAILLÉ

### **ÉTAPE 2 : CORRECTIONS P0** (Durée estimée : 2-3 jours)

#### 🔥 **P0-1 : Tester Feedback Loop Conditions Réelles**

**Objectif** : Valider que les 3 couches anti-feedback empêchent la boucle

**Actions** :
1. Test manuel : Lancer TITANE sans casque, speaker volume 80%
2. Commande vocale : "Bonjour TITANE"
3. Vérifier : TTS ne déclenche pas re-capture ASR
4. Logger : Timestamps suspend/resume VAD

**Fichiers modifiés** :
- `src/hooks/useTTSWithMicControl.ts` : Ajouter logs détaillés
- `src/hooks/useVAD.ts` : Ajouter métriques suspension

**Tests** :
```bash
# E2E test feedback loop
npm run test:e2e -- feedback-loop.test.ts
```

**Critères succès** :
- ✅ 10 cycles vocaux sans feedback loop
- ✅ VAD suspendue pendant 100% du TTS playback
- ✅ Resume delay 500ms respecté

---

#### 🔥 **P0-2 : Implémenter Voice Fingerprinting (Couche 3)**

**Objectif** : Ajouter détection acoustique TITANE vs User

**Actions** :
1. Implémenter calibration : `calibrate_titane(samples)`
2. Implémenter détection : `is_titane_speaking(samples) -> (bool, similarity)`
3. Intégrer dans VAD : Si similarity > 0.8 → ignorer audio

**Fichiers modifiés** :
- `src-tauri/src/audio/voice_fingerprint.rs` : Implémenter fonctions
- `src-tauri/src/audio/asr.rs` : Intégrer check avant ASR
- `src/hooks/useVAD.ts` : Déclencher calibration au boot

**Pseudocode** :
```rust
// voice_fingerprint.rs
pub struct VoiceProfile {
    mfcc: Vec<f32>,       // Mel-frequency cepstral coefficients
    pitch_mean: f32,
    pitch_stddev: f32,
    energy_profile: Vec<f32>,
}

pub fn calibrate_titane(samples: &[f32]) -> VoiceProfile {
    // Extract MFCC features from TTS audio
    let mfcc = extract_mfcc(samples);
    let pitch = extract_pitch(samples);
    VoiceProfile { mfcc, pitch_mean, pitch_stddev, energy_profile }
}

pub fn is_titane_speaking(samples: &[f32], profile: &VoiceProfile) -> (bool, f32) {
    let sample_mfcc = extract_mfcc(samples);
    let similarity = cosine_similarity(&sample_mfcc, &profile.mfcc);
    (similarity > 0.8, similarity) // Threshold 0.8
}
```

**Tests** :
```typescript
describe('Voice Fingerprinting', () => {
  it('should detect TITANE voice with >80% similarity', async () => {
    const titaneAudio = await loadTTSAudio('bonjour.wav');
    const profile = await calibrateTITANE(titaneAudio);
    
    const testAudio = await loadTTSAudio('test.wav');
    const [isTitane, similarity] = isTitaneSpeaking(testAudio, profile);
    
    expect(isTitane).toBe(true);
    expect(similarity).toBeGreaterThan(0.8);
  });
});
```

**Critères succès** :
- ✅ Calibration TITANE voice au boot
- ✅ Détection >80% similarity sur TTS propre
- ✅ Détection <50% similarity sur user voice
- ✅ 0% faux négatifs sur 100 samples TTS

---

#### 🔥 **P0-3 : Supprimer STUB TTS voice_engine.rs**

**Objectif** : Migrer vers `ai_chat.rs::speak()` (production ready)

**Actions** :
1. Marquer `voice_synthesize_speech()` comme deprecated
2. Ajouter lien documentation vers `speak()`
3. Créer guide migration

**Fichiers modifiés** :
- `src-tauri/src/overdrive/voice_engine.rs` : Ajouter deprecation warning
- `docs/VOCAL_MIGRATION_GUIDE.md` : Créer guide

**Code** :
```rust
/// ⚠️ DEPRECATED: Use `speak()` in `commands/ai_chat.rs` instead
/// 
/// Cette commande est un STUB retournant audio vide.
/// Migration guide: docs/VOCAL_MIGRATION_GUIDE.md
#[deprecated(since = "v20.0", note = "Use ai_chat::speak() instead")]
#[tauri::command]
pub fn voice_synthesize_speech(
    request: SynthesisRequest,
    state: State<VoiceEngineState>,
) -> Result<Vec<u8>, TAPIError> {
    log::warn!("[DEPRECATED] voice_synthesize_speech called - use speak() instead");
    Err(TAPIError::deprecated(
        "Use speak() in commands/ai_chat.rs for production TTS"
    ))
}
```

**Documentation** :
```markdown
# Migration Guide: voice_synthesize_speech → speak()

## ❌ Before (DEPRECATED)
```typescript
await invoke('voice_synthesize_speech', { 
  request: { text, voice, speed, pitch } 
});
```

## ✅ After (PRODUCTION)
```typescript
await invoke('speak', { 
  text: 'Hello world',
  useOnline: false // Local TTS (espeak/piper)
});
```

## Benefits
- ✅ Production-ready (ShellGuard secured)
- ✅ Multi-provider (Google TTS / espeak / piper)
- ✅ Error handling robust
- ✅ Streaming support planned
```

**Critères succès** :
- ✅ Warning logged si `voice_synthesize_speech` appelée
- ✅ Migration guide complet
- ✅ Frontend utilise 100% `speak()` (audit grep)

---

#### 🔥 **P0-4 : Tester Parler-TTS Backend Python**

**Objectif** : Valider backend Python fonctionne

**Actions** :
1. Créer `requirements.txt`
2. Ajouter health check endpoint `/health`
3. Tester génération audio
4. Documenter installation

**Fichiers modifiés** :
- `scripts/parler_tts_server.py` : Ajouter `/health` endpoint
- `scripts/requirements.txt` : Créer (torch, parler-tts)
- `docs/PARLER_TTS_SETUP.md` : Guide installation

**Health Check** :
```python
# parler_tts_server.py
@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'healthy',
        'model_loaded': model is not None,
        'uptime': time.time() - start_time,
    })
```

**Frontend Check** :
```typescript
// Check Parler-TTS availability at boot
const checkParlerTTS = async () => {
  try {
    const response = await fetch('http://localhost:8765/health');
    const data = await response.json();
    if (data.status === 'healthy') {
      console.log('[TTS] Parler-TTS available');
      setTTSProvider('parler-tts');
    } else {
      console.warn('[TTS] Parler-TTS unhealthy, falling back to espeak');
      setTTSProvider('tauri');
    }
  } catch (error) {
    console.warn('[TTS] Parler-TTS unreachable, falling back to espeak');
    setTTSProvider('tauri');
  }
};
```

**Tests** :
```bash
# Start Parler-TTS server
python scripts/parler_tts_server.py

# Test health endpoint
curl http://localhost:8765/health

# Test TTS generation
curl -X POST http://localhost:8765/synthesize \
  -H "Content-Type: application/json" \
  -d '{"text":"Bonjour TITANE","voice":"default"}' \
  --output test.wav
```

**Critères succès** :
- ✅ Server démarre sans erreur
- ✅ `/health` retourne `{status: 'healthy'}`
- ✅ Génération audio réussit (<3s latence)
- ✅ Frontend détecte Parler-TTS au boot

---

#### 🔥 **P0-5 : Tests State Machine**

**Objectif** : Coverage 70%+ sur `audioStateMachine.ts`

**Actions** :
1. Tests unitaires transitions valides
2. Tests unitaires transitions invalides rejetées
3. Tests intégration cycle complet

**Fichiers créés** :
- `src/services/audio/__tests__/audioStateMachine.test.ts`

**Tests** :
```typescript
describe('AudioStateMachine', () => {
  describe('Transitions Valid', () => {
    it('idle → user_speaking (VAD_SPEECH_START)', () => {
      const machine = new AudioStateMachine();
      machine.transition('VAD_SPEECH_START');
      expect(machine.getState()).toBe('user_speaking');
    });
    
    it('user_speaking → processing (VAD_SPEECH_END)', () => {
      const machine = new AudioStateMachine({ initialState: 'user_speaking' });
      machine.transition('VAD_SPEECH_END');
      expect(machine.getState()).toBe('processing');
    });
    
    it('ai_speaking → idle (TTS_END)', () => {
      const machine = new AudioStateMachine({ initialState: 'ai_speaking' });
      machine.transition('TTS_END');
      expect(machine.getState()).toBe('idle');
    });
  });
  
  describe('Transitions Invalid', () => {
    it('should reject idle → TTS_START', () => {
      const machine = new AudioStateMachine();
      expect(() => machine.transition('TTS_START')).toThrow();
    });
  });
  
  describe('Barge-In', () => {
    it('ai_speaking → user_speaking (BARGE_IN)', () => {
      const machine = new AudioStateMachine({ initialState: 'ai_speaking' });
      machine.transition('BARGE_IN');
      expect(machine.getState()).toBe('user_speaking');
    });
  });
  
  describe('Full Cycle', () => {
    it('should complete idle → ai_speaking → idle cycle', () => {
      const machine = new AudioStateMachine();
      const states: string[] = [];
      
      machine.onStateChange((newState) => states.push(newState));
      
      machine.transition('VAD_SPEECH_START');
      machine.transition('VAD_SPEECH_END');
      machine.transition('TTS_START');
      machine.transition('TTS_END');
      
      expect(states).toEqual([
        'user_speaking',
        'processing',
        'ai_speaking',
        'idle'
      ]);
    });
  });
});
```

**Critères succès** :
- ✅ Coverage >70%
- ✅ Toutes transitions valides testées
- ✅ Toutes transitions invalides rejetées
- ✅ Cycle complet testé

---

#### 🔥 **P0-6 : Tests useTTSWithMicControl**

**Objectif** : Valider auto-mute micro pendant TTS

**Actions** :
1. Tests suspend/resume VAD
2. Tests cleanup on error
3. Tests delay paramétrable

**Fichiers créés** :
- `src/hooks/__tests__/useTTSWithMicControl.test.ts`

**Tests** :
```typescript
describe('useTTSWithMicControl', () => {
  it('should suspend VAD before TTS', async () => {
    const vadMock = { suspendForTTS: jest.fn(), resumeAfterTTS: jest.fn() };
    const { speak } = useTTSWithMicControl({ vadHook: vadMock });
    
    await speak('Hello');
    
    expect(vadMock.suspendForTTS).toHaveBeenCalled();
  });
  
  it('should resume VAD after delay', async () => {
    jest.useFakeTimers();
    const vadMock = { suspendForTTS: jest.fn(), resumeAfterTTS: jest.fn() };
    const { speak } = useTTSWithMicControl({ 
      vadHook: vadMock, 
      resumeDelay: 500 
    });
    
    await speak('Hello');
    jest.advanceTimersByTime(500);
    
    expect(vadMock.resumeAfterTTS).toHaveBeenCalledWith(500);
  });
  
  it('should resume VAD on TTS error', async () => {
    const vadMock = { suspendForTTS: jest.fn(), resumeAfterTTS: jest.fn() };
    const voiceMock = { speak: jest.fn().mockRejectedValue(new Error('TTS failed')) };
    const { speak } = useTTSWithMicControl({ vadHook: vadMock });
    
    await speak('Hello').catch(() => {});
    
    expect(vadMock.resumeAfterTTS).toHaveBeenCalledWith(0); // No delay on error
  });
});
```

**Critères succès** :
- ✅ Coverage >80%
- ✅ Suspend VAD appelé avant TTS
- ✅ Resume VAD appelé après delay
- ✅ Resume VAD appelé sur erreur (delay 0ms)

---

#### 🔥 **P0-7 : Tests useVAD**

**Objectif** : Valider détection VAD + suspension TTS

**Actions** :
1. Tests détection parole
2. Tests suspension pendant TTS
3. Tests barge-in

**Fichiers créés** :
- `src/hooks/__tests__/useVAD.test.ts`

**Tests** :
```typescript
describe('useVAD', () => {
  it('should detect voice activity', async () => {
    const { startListening, state } = useVAD();
    
    // Mock getUserMedia
    global.navigator.mediaDevices.getUserMedia = jest.fn().mockResolvedValue({
      getAudioTracks: () => [{ enabled: true }]
    });
    
    await startListening();
    
    expect(state.isListening).toBe(true);
  });
  
  it('should suspend during TTS', () => {
    const { suspendForTTS, state } = useVAD();
    
    suspendForTTS();
    
    expect(state.isSuspended).toBe(true);
  });
  
  it('should resume after TTS with delay', async () => {
    jest.useFakeTimers();
    const { suspendForTTS, resumeAfterTTS, state } = useVAD();
    
    suspendForTTS();
    resumeAfterTTS(500);
    
    expect(state.isSuspended).toBe(true);
    jest.advanceTimersByTime(500);
    expect(state.isSuspended).toBe(false);
  });
});
```

**Critères succès** :
- ✅ Coverage >70%
- ✅ Détection VAD testée (mock audio)
- ✅ Suspension TTS testée
- ✅ Resume avec delay testé

---

### **ÉTAPE 3 : PAUFFINAGE UX/ÉTAT** (Durée estimée : 2 jours)

#### 📝 **P1-3 : Logger Structuré**

**Objectif** : Remplacer `console.log` par logger structuré

**Actions** :
1. Installer winston
2. Créer logger avec niveaux (info/warn/error)
3. Ajouter contexte (userId, sessionId, component)
4. Migrer tous `console.log`

**Fichiers créés** :
- `src/lib/logger.ts`

**Implementation** :
```typescript
// lib/logger.ts
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/titane.log' })
  ]
});

export const log = {
  info: (message: string, context?: Record<string, unknown>) => {
    logger.info(message, { ...context, component: getCurrentComponent() });
  },
  warn: (message: string, context?: Record<string, unknown>) => {
    logger.warn(message, { ...context, component: getCurrentComponent() });
  },
  error: (message: string, error?: Error, context?: Record<string, unknown>) => {
    logger.error(message, { 
      ...context, 
      component: getCurrentComponent(),
      error: error?.message,
      stack: error?.stack 
    });
  }
};

// Migration example
// ❌ Before
console.log('[VoiceService] Recording started:', recordingId);

// ✅ After
log.info('Recording started', { 
  recordingId, 
  userId: currentUser.id,
  sessionId: currentSession.id,
  component: 'VoiceService'
});
```

**Critères succès** :
- ✅ 0 `console.log` restants (audit grep)
- ✅ Logs avec contexte (userId, sessionId, component)
- ✅ Logs dans fichier `logs/titane.log`

---

#### 📝 **P1-4 : Corrélation Logs Frontend ↔ Backend**

**Objectif** : Trace ID pour corréler logs cross-layer

**Actions** :
1. Générer UUID trace ID par requête
2. Passer trace ID via headers Tauri
3. Logger trace ID backend

**Implementation** :
```typescript
// Frontend
import { v4 as uuidv4 } from 'uuid';

const traceId = uuidv4();
const response = await invoke('speak', { 
  text: 'Hello',
  __traceId: traceId // ✅ Pass trace ID
});

log.info('TTS started', { traceId, text: 'Hello' });
```

```rust
// Backend (ai_chat.rs)
#[tauri::command]
pub async fn speak(text: String, __trace_id: Option<String>) -> Result<(), TAPIError> {
    let trace_id = __trace_id.unwrap_or_else(|| uuid::Uuid::new_v4().to_string());
    log::info!("[TTS] Started - traceId={}", trace_id);
    
    // TTS logic...
    
    log::info!("[TTS] Completed - traceId={}", trace_id);
    Ok(())
}
```

**Critères succès** :
- ✅ Trace ID généré par requête
- ✅ Logs frontend avec traceId
- ✅ Logs backend avec traceId
- ✅ Corrélation possible (grep traceId)

---

#### 📝 **P1-5 : Monitoring Performance**

**Objectif** : Métriques latence ASR/TTS/OMEGA

**Actions** :
1. Ajouter timestamps start/end
2. Calculer durées
3. Logger métriques

**Implementation** :
```typescript
// Voice cycle performance tracking
interface VoiceCycleMetrics {
  traceId: string;
  startTime: number;
  asrStart: number;
  asrEnd: number;
  omegaStart: number;
  omegaEnd: number;
  ttsStart: number;
  ttsEnd: number;
  endTime: number;
  totalLatency: number;
  breakdown: {
    asr: number;
    omega: number;
    tts: number;
    playback: number;
  };
}

const metrics: VoiceCycleMetrics = {
  traceId: uuidv4(),
  startTime: Date.now(),
};

// ASR
metrics.asrStart = Date.now();
const transcript = await voiceService.stopRecording();
metrics.asrEnd = Date.now();

// OMEGA
metrics.omegaStart = Date.now();
const response = await aiOrchestrator.generateResponse({ message: transcript.text });
metrics.omegaEnd = Date.now();

// TTS
metrics.ttsStart = Date.now();
await tts.speak(response.content);
metrics.ttsEnd = Date.now();

metrics.endTime = Date.now();
metrics.totalLatency = metrics.endTime - metrics.startTime;
metrics.breakdown = {
  asr: metrics.asrEnd - metrics.asrStart,
  omega: metrics.omegaEnd - metrics.omegaStart,
  tts: metrics.ttsEnd - metrics.ttsStart,
  playback: metrics.endTime - metrics.ttsEnd,
};

log.info('Voice cycle complete', metrics);
```

**Critères succès** :
- ✅ Logs avec breakdown (ASR, OMEGA, TTS, playback)
- ✅ Latence totale trackée
- ✅ Détection goulots (>2s → warning)

---

#### 📝 **P1-8 : Modal Erreur Audio User-Friendly**

**Objectif** : Afficher modal si erreur micro/TTS

**Actions** :
1. Créer composant `AudioErrorModal`
2. Afficher si `getUserMedia` échoue
3. Proposer actions (retry, texte mode)

**Fichiers créés** :
- `src/components/modals/AudioErrorModal.tsx`

**Implementation** :
```tsx
// AudioErrorModal.tsx
export const AudioErrorModal: React.FC<{ error: AudioError }> = ({ error }) => {
  return (
    <Modal open={true} onClose={() => {}}>
      <ModalTitle>🎤 Microphone Indisponible</ModalTitle>
      <ModalContent>
        <p>
          {error.type === 'PERMISSION_DENIED' 
            ? "TITANE a besoin d'accéder au microphone pour la commande vocale."
            : "Une erreur s'est produite lors de l'accès au microphone."
          }
        </p>
        <p>Détails: {error.message}</p>
      </ModalContent>
      <ModalActions>
        <Button onClick={() => retryGetUserMedia()}>
          🔄 Réessayer
        </Button>
        <Button onClick={() => switchToTextMode()}>
          ⌨️ Passer en mode texte
        </Button>
        <Button onClick={() => openSettings()}>
          ⚙️ Paramètres Audio
        </Button>
      </ModalActions>
    </Modal>
  );
};
```

**Usage** :
```typescript
// useVAD.ts
const startListening = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  } catch (error) {
    // ✅ Show modal instead of silent error
    showAudioErrorModal({
      type: 'PERMISSION_DENIED',
      message: error.message,
    });
  }
};
```

**Critères succès** :
- ✅ Modal affichée si `getUserMedia` échoue
- ✅ 3 actions proposées (retry, texte, settings)
- ✅ Message clair (pas de jargon technique)

---

### **ÉTAPE 4 : QUALITÉ TECHNIQUE** (Durée estimée : 1 jour)

#### 🧪 **Coverage >70% Modules Vocaux**

**Actions** :
1. Run coverage actuel : `npm run test:coverage`
2. Identifier modules <70%
3. Ajouter tests manquants

**Commande** :
```bash
npm run test:coverage -- --testPathPattern="(useVAD|useTTSWithMicControl|audioStateMachine|voice\.ts)"
```

**Critères succès** :
- ✅ `audioStateMachine.ts` : >70%
- ✅ `useTTSWithMicControl.ts` : >80%
- ✅ `useVAD.ts` : >70%
- ✅ `voice.ts` : >60%

---

### **ÉTAPE 5 : DOCUMENTATION** (Durée estimée : 1 jour)

#### 📚 **Créer VOCAL_README.md**

**Contenu** :
1. Architecture vocale (diagramme)
2. Pipeline : Micro → ASR → OMEGA → TTS → Speaker
3. États possibles + transitions
4. Troubleshooting (erreurs communes)

**Structure** :
```markdown
# TITANE∞ — Architecture Vocale

## 🎯 Vue d'ensemble

## 📊 Diagramme

## 🔄 Pipeline Complet

## 🎭 États & Transitions

## ⚠️ Troubleshooting

## 🧪 Tests

## 📝 API Reference
```

---

## ✅ 3. DIFFS / PSEUDOCODE / IMPLÉMENTATION

**Note** : Voir sections détaillées ci-dessus (Étape 2-5) pour implémentations complètes.

---

## ✅ 4. CHECKLIST DE VALIDATION

### Tests à Lancer

- [ ] `npm run test:unit -- audioStateMachine` (Coverage >70%)
- [ ] `npm run test:unit -- useTTSWithMicControl` (Coverage >80%)
- [ ] `npm run test:unit -- useVAD` (Coverage >70%)
- [ ] `npm run test:e2e -- feedback-loop.test.ts` (10 cycles sans feedback)
- [ ] `npm run build` (0 errors TypeScript)
- [ ] `cargo test` (0 errors Rust)

### Scénarios Manuels

- [ ] Commande vocale sans casque (volume 80%) → Pas de feedback loop
- [ ] Interruption user pendant TTS (barge-in) → TTS s'arrête, VAD écoute
- [ ] Erreur micro (permission denied) → Modal affiché, actions proposées
- [ ] Latence totale <5.5s (user parle → TITANE répond)

### Métriques à Vérifier

- [ ] Latence ASR : <1s (Whisper tiny)
- [ ] Latence OMEGA : <2s (Ollama local)
- [ ] Latence TTS : <800ms (espeak)
- [ ] Latence totale : <5.5s
- [ ] Coverage vocale : >70%

---

## 🚀 5. CE QUI RESTE (PERFECTIONNEMENT ML)

### Court Terme (Post-Étape 5)

- [ ] Streaming TTS (génération + playback simultanés) → -2s latence
- [ ] Cancel signal (AbortController) → Barge-in intelligent
- [ ] Voice context enrichment → Prompt engineering voice mode

### Moyen Terme

- [ ] VAD ML (Silero VAD) → Détection robuste
- [ ] Émotions prosodie → Analyse spectre audio
- [ ] Adaptive voice → User preferences (vitesse/ton)

### Long Terme

- [ ] Multimodal (voice + gestures + facial) → Architecture pluggable
- [ ] Accessibilité (ARIA/SR) → Audit Lighthouse
- [ ] Wake word robuste (Porcupine) → Faux positifs <1%

---

**FIN DIAGNOSTIC + PLAN D'ACTION ✅**

**Status** : Phase 1 COMPLÈTE, prêt pour exécution Phase 2

Date: 8 décembre 2025  
Signature: GitHub Copilot (Claude Sonnet 4.5)
