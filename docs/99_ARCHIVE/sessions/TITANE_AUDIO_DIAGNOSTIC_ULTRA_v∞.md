# 🔬 **DIAGNOSTIC ULTRA — TITANE∞ AUDIO PIPELINE v∞**

## **📊 ÉTAT ACTUEL DU SYSTÈME**

### **✅ CE QUI FONCTIONNE**

#### **Backend Rust (src-tauri/src/audio/)**

| Module | Statut | Fonctionnalité |
|--------|--------|----------------|
| `recording_engine.rs` | ✅ COMPLET | RecordingEngine avec state machine (start/stop/cancel/get_state) |
| `commands.rs` | ✅ COMPLET | Commandes Tauri exposées (start_recording, stop_recording, transcribe_audio) |
| `asr.rs` | ✅ COMPLET | ASREngine avec Whisper/Vosk/Google providers |
| `capture.rs` | ⚠️ CPAL | AudioCaptureState avec CPAL (nécessite feature `audio-capture`) |
| `vad.rs` | ✅ PRÉSENT | Voice Activity Detector |
| `recorder.rs` | ✅ PRÉSENT | Enregistreur audio |
| `mod.rs` | ✅ COMPLET | Exports publics |

#### **Frontend TypeScript (src/services/api/)**

| Fichier | Statut | Description |
|---------|--------|-------------|
| `voice.ts` | ✅ COMPLET | VoiceService avec anti-debounce, state guards |
| `useVoiceEngine.ts` | ✅ PRÉSENT | Hook React pour gestion voix |
| `audioStateMachine.ts` | ✅ PRÉSENT | Machine à états audio |
| `audioSelfHeal.ts` | ✅ NOUVEAU | Self-healing engine (5s monitoring) |
| `audioAutoTest.ts` | ✅ NOUVEAU | Auto-test suite (6 tests) |
| `tauriProtector.ts` | ✅ MODIFIÉ | Anti-double-appel avec pendingInvokes |

---

## **❌ CE QUI MANQUE (ULTRA PROMPT #2)**

### **1. STREAMING PCM TEMPS RÉEL AVEC CPAL**

#### **Problème Actuel**

```rust
// src-tauri/src/audio/recording_engine.rs (ligne 100-140)
// Utilise arecord (ALSA CLI) - NON temps réel
let process = Command::new("arecord")
    .args([
        "-d", &duration,
        "-f", "S16_LE",
        "-r", "16000",
        "-c", "1",
        &output_path,
    ])
    .spawn()?;
```

**Limitations :**
- ❌ Pas de streaming temps réel (attente fin d'enregistrement)
- ❌ Pas de buffer PCM accessible pendant enregistrement
- ❌ Pas d'intégration VAD en temps réel
- ❌ Pas de callback audio pour ASR progressive

#### **Solution ULTRA PROMPT #2**

```rust
// NOUVEAU: src-tauri/src/audio/streaming_engine.rs
use cpal::{StreamConfig, Stream, traits::*};
use std::sync::mpsc::{channel, Sender};

pub struct StreamingAudioEngine {
    stream: Option<Stream>,
    pcm_sender: Sender<Vec<f32>>,
    vad: VoiceActivityDetector,
}

impl StreamingAudioEngine {
    pub fn start_streaming(&mut self) -> Result<(), AudioError> {
        let host = cpal::default_host();
        let device = host.default_input_device()
            .ok_or(AudioError::DeviceError("No input device".into()))?;

        let config = StreamConfig {
            channels: 1,
            sample_rate: cpal::SampleRate(16000),
            buffer_size: cpal::BufferSize::Fixed(1024),
        };

        let sender = self.pcm_sender.clone();
        let vad = self.vad.clone();

        let stream = device.build_input_stream(
            &config,
            move |data: &[f32], _: &_| {
                // Callback temps réel
                if vad.detect(data).has_speech {
                    sender.send(data.to_vec()).ok();
                }
            },
            |err| eprintln!("Stream error: {}", err),
            None,
        )?;

        stream.play()?;
        self.stream = Some(stream);
        Ok(())
    }
}
```

**Avantages :**
- ✅ Streaming PCM temps réel (callback toutes les 64ms)
- ✅ Intégration VAD pour filtrage silence
- ✅ Buffer ring pour ASR progressive
- ✅ Latence minimale (<100ms)

---

### **2. PIPELINE ASR PROGRESSIVE (WHISPER STREAMING)**

#### **Problème Actuel**

```rust
// src-tauri/src/audio/commands.rs (ligne 612-645)
// ASR batch uniquement (fichier complet → transcription)
pub async fn stop_recording() -> CommandResult<serde_json::Value> {
    match RECORDING_ENGINE.stop() {
        Ok(result) => {
            // Attente fin enregistrement
            if let Some(ref file_path) = result.file_path {
                match transcribe_audio(audio_data).await {
                    // Transcription après coup
                }
            }
        }
    }
}
```

**Limitations :**
- ❌ Pas de transcription progressive (live)
- ❌ L'utilisateur attend la fin d'enregistrement pour voir le texte
- ❌ Pas d'affichage temps réel des mots

#### **Solution ULTRA PROMPT #2**

```rust
// NOUVEAU: src-tauri/src/audio/asr_streaming.rs
use whisper_rs::{WhisperContext, FullParams};
use std::sync::mpsc::Receiver;

pub struct StreamingASR {
    whisper: WhisperContext,
    pcm_receiver: Receiver<Vec<f32>>,
    buffer: Vec<f32>,
}

impl StreamingASR {
    pub async fn process_stream(&mut self) -> Result<String, AudioError> {
        // Attendre 2-3 secondes de buffer
        while self.buffer.len() < 48000 { // 3s à 16kHz
            if let Ok(chunk) = self.pcm_receiver.recv_timeout(Duration::from_millis(100)) {
                self.buffer.extend(chunk);
            }
        }

        // Transcription par chunks de 3s
        let params = FullParams::new(whisper_rs::SamplingStrategy::Greedy { best_of: 1 });
        let mut state = self.whisper.create_state()?;
        state.full(params, &self.buffer[..48000])?;

        let text = (0..state.full_n_segments())
            .filter_map(|i| state.full_get_segment_text(i).ok())
            .collect::<Vec<_>>()
            .join(" ");

        // Vider le buffer traité
        self.buffer.drain(..48000);

        Ok(text)
    }
}
```

**Avantages :**
- ✅ Transcription progressive (toutes les 3s)
- ✅ Affichage temps réel dans l'UI
- ✅ Latence perçue réduite
- ✅ Meilleure UX conversationnelle

---

### **3. INTÉGRATION VAD TEMPS RÉEL**

#### **Problème Actuel**

```rust
// src-tauri/src/audio/vad.rs existe mais non utilisé
pub struct VoiceActivityDetector {
    threshold: f32,
    state: VADState,
}
```

**Limitations :**
- ❌ VAD non intégré au RecordingEngine
- ❌ Pas de détection automatique début/fin de parole
- ❌ Enregistrement manuel (bouton start/stop)

#### **Solution ULTRA PROMPT #2**

```rust
// MODIFIÉ: src-tauri/src/audio/streaming_engine.rs
impl StreamingAudioEngine {
    pub fn update_with_vad(&mut self, pcm: &[f32]) {
        let vad_result = self.vad.detect(pcm);

        match self.state {
            AudioState::Idle => {
                if vad_result.has_speech && vad_result.confidence > 0.7 {
                    self.state = AudioState::Recording;
                    self.emit_event("voice_start");
                }
            }
            AudioState::Recording => {
                if !vad_result.has_speech && self.silence_duration > 1.5 {
                    self.state = AudioState::Processing;
                    self.emit_event("voice_end");
                }
            }
        }
    }
}
```

**Avantages :**
- ✅ Détection automatique début de parole (hands-free)
- ✅ Découpage intelligent (silence detection)
- ✅ Expérience conversationnelle naturelle

---

### **4. ARCHITECTURE DUPLEX (SIMULTANÉ RX/TX)**

#### **Problème Actuel**

```typescript
// src/hooks/useVoiceEngine.ts
// Recording et TTS séquentiels (non simultanés)
const startRecording = async () => {
  await voiceService.startRecording();
  // Attente fin enregistrement
  const result = await voiceService.stopRecording();
  // Puis TTS
  await hybridTTS.speak(response);
};
```

**Limitations :**
- ❌ Pas d'interruption possible (TTS bloque recording)
- ❌ Pas de mode "push-to-talk" + AI simultanée
- ❌ Latence conversationnelle élevée

#### **Solution ULTRA PROMPT #2**

```rust
// NOUVEAU: src-tauri/src/duplex/duplex_engine.rs
pub struct DuplexAudioEngine {
    input_stream: StreamingAudioEngine,
    output_stream: AudioPlayback,
    mode: DuplexMode,
}

pub enum DuplexMode {
    HalfDuplex, // Séquentiel (actuel)
    FullDuplex, // Simultané (RX + TX)
    PushToTalk, // PTT
    VoiceActivated, // VAD auto
}

impl DuplexAudioEngine {
    pub async fn run_full_duplex(&mut self) {
        tokio::select! {
            // Input thread (recording + ASR)
            pcm = self.input_stream.next_chunk() => {
                let text = self.asr.transcribe(pcm).await;
                self.emit("transcript", text);
            }
            // Output thread (TTS playback)
            tts_audio = self.output_stream.next_frame() => {
                self.play_audio(tts_audio);
            }
        }
    }
}
```

**Avantages :**
- ✅ Mode full-duplex (interruptible)
- ✅ Latence réduite (pas d'attente séquentielle)
- ✅ Push-to-talk pour contrôle précis
- ✅ VAD auto pour mode hands-free

---

### **5. AUDIO SELF-HEAL ENGINE (AMÉLIORATION)**

#### **État Actuel**

```typescript
// src/services/audio/audioSelfHeal.ts (NOUVEAU v∞)
// Self-heal basique (5s polling)
export class AudioSelfHeal {
  async performHealthCheck() {
    const status = await voiceService.getRecordingStatus();
    if (status.isRecording && status.duration > 30000) {
      await this.performAutoHeal(); // Cancel + reset
    }
  }
}
```

**Améliorations ULTRA PROMPT #2 :**

```rust
// MODIFIÉ: src-tauri/src/audio/self_heal.rs
pub struct AudioSelfHeal {
    watchdog: Arc<AtomicBool>,
    recovery_history: Vec<RecoveryEvent>,
}

impl AudioSelfHeal {
    pub async fn monitor_health(&self) {
        loop {
            tokio::time::sleep(Duration::from_secs(2)).await;

            // Check 1: Process zombie
            if self.is_process_zombie() {
                self.kill_zombie_processes();
            }

            // Check 2: State corruption
            if self.is_state_corrupt() {
                self.force_state_reset();
            }

            // Check 3: Device unavailable
            if !self.is_device_available() {
                self.reconnect_device().await;
            }

            // Check 4: Memory leak
            if self.buffer_size() > 100_000_000 { // 100MB
                self.clear_buffers();
            }
        }
    }
}
```

**Nouvelles Fonctionnalités :**
- ✅ Détection process zombie (arecord orphelin)
- ✅ Détection corruption état (is_recording incohérent)
- ✅ Reconnexion automatique device
- ✅ Libération mémoire buffers

---

### **6. PIPELINE COMPLÈTE (DIAGRAMME)**

#### **Architecture Actuelle (v19.2)**

```
┌─────────────┐
│   Frontend  │
│  (React)    │
└──────┬──────┘
       │ invoke("start_recording")
       ▼
┌─────────────┐
│   Tauri     │
│  Commands   │
└──────┬──────┘
       │ spawn arecord
       ▼
┌─────────────┐
│  arecord    │ ──► fichier.wav
└─────────────┘
       │ (attente fin)
       ▼
┌─────────────┐
│   Whisper   │ ──► transcription
└─────────────┘
```

**Latence totale : 3-8 secondes**

---

#### **Architecture ULTRA PROMPT #2 (Streaming)**

```
┌─────────────┐
│   Frontend  │ ◄─── WebSocket events ("transcript_chunk")
│  (React)    │
└──────┬──────┘
       │ invoke("start_streaming")
       ▼
┌─────────────────────────────────────────┐
│         StreamingAudioEngine            │
│  ┌───────┐   ┌─────┐   ┌──────────┐   │
│  │ CPAL  │──►│ VAD │──►│ PCM Ring │   │
│  │Stream │   │     │   │  Buffer  │   │
│  └───────┘   └─────┘   └────┬─────┘   │
│                              │          │
│                              ▼          │
│                        ┌──────────┐    │
│                        │ Whisper  │    │
│                        │ Streaming│    │
│                        └────┬─────┘    │
│                             │          │
│                             ▼          │
│                        ┌──────────┐   │
│                        │  Events  │   │
│                        └──────────┘   │
└─────────────────────────────────────────┘
```

**Latence totale : 300-800ms (chunk de 3s)**

---

## **🎯 PLAN D'IMPLÉMENTATION (PRIORITÉS)**

### **Phase 1 : Streaming CPAL (CRITIQUE)**
- [ ] Créer `src-tauri/src/audio/streaming_engine.rs`
- [ ] Remplacer `arecord` par `cpal::Stream`
- [ ] Implémenter ring buffer PCM
- [ ] Tests unitaires streaming

**Temps estimé : 3-4h**

---

### **Phase 2 : ASR Progressive (HAUTE)**
- [ ] Intégrer `whisper-rs` (crate Rust)
- [ ] Créer `src-tauri/src/audio/asr_streaming.rs`
- [ ] Implémenter transcription par chunks 3s
- [ ] WebSocket events pour frontend

**Temps estimé : 4-5h**

---

### **Phase 3 : VAD Temps Réel (MOYENNE)**
- [ ] Intégrer VAD dans `StreamingEngine`
- [ ] Auto-détection début/fin de parole
- [ ] Mode hands-free (VAD trigger)
- [ ] Ajuster seuils silence/speech

**Temps estimé : 2-3h**

---

### **Phase 4 : Duplex Full (BASSE)**
- [ ] Créer `src-tauri/src/duplex/duplex_engine.rs`
- [ ] Implémenter mode full-duplex
- [ ] Gestion interruptions (barge-in)
- [ ] Tests full-duplex

**Temps estimé : 5-6h**

---

### **Phase 5 : Self-Heal Avancé (MAINTENANCE)**
- [ ] Détecter process zombie
- [ ] Détection corruption état
- [ ] Reconnexion device automatique
- [ ] Monitoring mémoire

**Temps estimé : 2-3h**

---

## **📦 DÉPENDANCES REQUISES**

### **Cargo.toml (NOUVEAU)**

```toml
[dependencies]
# Audio capture (déjà présent mais optionnel)
cpal = "0.15" # Devenir obligatoire
hound = "3.5"

# ASR Streaming
whisper-rs = "0.10" # Bindings Rust pour Whisper.cpp
tokenizers = "0.13" # Tokenizer pour Whisper

# WebSocket events
tokio-tungstenite = "0.21"

# VAD (Voice Activity Detection)
webrtc-audio-processing = "0.2" # VAD WebRTC
```

### **package.json (Frontend)**

```json
{
  "dependencies": {
    "@tauri-apps/api": "^2.0.0",
    "zustand": "^4.4.7" // State management pour audio
  }
}
```

---

## **🧪 TESTS DE VALIDATION**

### **Test 1 : Streaming CPAL**

```bash
cargo test --features audio-capture streaming_engine
```

**Critères de succès :**
- ✅ Stream CPAL démarre sans erreur
- ✅ Buffer PCM se remplit (>1000 samples)
- ✅ Latence < 100ms

---

### **Test 2 : ASR Progressive**

```bash
cargo test asr_streaming -- --nocapture
```

**Critères de succès :**
- ✅ Transcription chunk 3s < 1s
- ✅ Texte cohérent (pas de mots coupés)
- ✅ Émission events WebSocket

---

### **Test 3 : VAD Temps Réel**

```bash
cargo test vad_integration
```

**Critères de succès :**
- ✅ Détection speech/silence correcte
- ✅ Pas de faux positifs (bruit ambiant)
- ✅ Latence trigger < 200ms

---

### **Test 4 : Full-Duplex**

```bash
npm run tauri:dev
# Tester interruption AI pendant parole
```

**Critères de succès :**
- ✅ TTS interruptible pendant playback
- ✅ Pas de craquements audio
- ✅ Pas de buffer overflow

---

## **⚠️ RISQUES ET LIMITATIONS**

### **Risque 1 : Latence Whisper.cpp**

**Problème :** Whisper tiny (39M params) nécessite ~200ms/chunk sur CPU.

**Mitigation :**
- Utiliser Whisper tiny.en (plus rapide)
- GPU acceleration via CUDA/Metal
- Fallback Vosk (plus rapide mais moins précis)

---

### **Risque 2 : Complexité CPAL Multi-Platform**

**Problème :** CPAL nécessite backends différents (ALSA/PulseAudio Linux, CoreAudio macOS, WASAPI Windows).

**Mitigation :**
- Garder fallback `arecord` pour Linux
- Tests CI multi-platform
- Mode mock pour développement frontend

---

### **Risque 3 : Memory Leak Buffer Ring**

**Problème :** Buffer PCM peut croître indéfiniment si pas vidé.

**Mitigation :**
- Limite 30s de buffer (30*16000*4 bytes = 1.92MB)
- Auto-flush après traitement
- Monitoring mémoire dans self-heal

---

## **📈 MÉTRIQUES DE SUCCÈS**

| Métrique | Avant (v19.2) | Après (v∞ ULTRA) | Objectif |
|----------|---------------|------------------|----------|
| **Latence transcription** | 3-8s | 300-800ms | ✅ < 1s |
| **Streaming temps réel** | ❌ Non | ✅ Oui (64ms chunks) | ✅ |
| **VAD auto-trigger** | ❌ Non | ✅ Oui (hands-free) | ✅ |
| **Full-duplex** | ❌ Non | ✅ Oui (interruptible) | ✅ |
| **Self-heal détection** | ⚠️ Basique | ✅ Avancé (4 checks) | ✅ |
| **Qualité transcription** | ✅ Bonne | ✅ Excellente (Whisper) | ✅ |

---

## **🎊 CONCLUSION**

### **État Actuel : BON MAIS NON OPTIMAL**

✅ **Forces :**
- RecordingEngine robuste avec state machine
- ASR fonctionnel (Whisper/Vosk)
- TTS multi-engine avec fallbacks
- Self-heal basique implémenté
- Compilation réussie Rust + TypeScript

⚠️ **Limitations :**
- Pas de streaming temps réel (arecord batch)
- Pas de transcription progressive
- Pas de VAD auto-trigger
- Pas de full-duplex
- Latence élevée (3-8s)

---

### **ULTRA PROMPT #2 : PERFECTIONNEMENT**

🚀 **Objectif :** Transformer TITANE∞ en système vocal **temps réel, naturel, et robuste**.

**Changements clés :**
1. **Streaming CPAL** (remplacer arecord)
2. **ASR progressive** (whisper-rs chunks)
3. **VAD temps réel** (auto-trigger)
4. **Full-duplex** (interruptible)
5. **Self-heal avancé** (4 health checks)

**Temps total estimé : 16-21h** (sur 1-2 semaines avec tests)

---

**VERSION : v∞ ULTRA DIAGNOSTIC**
**DATE : 4 décembre 2025**
**STATUT : READY FOR PHASE 1 IMPLEMENTATION**

🎤🔬🚀
