# 🎤 TITANE∞ v17.3.0 — RAPPORT DIAGNOSTIC TTS
**Date**: 22 novembre 2025
**Objectif**: Analyser, auditer et optimiser le système de synthèse vocale (Text-to-Speech)

---

## 📊 ÉTAT ACTUEL DU SYSTÈME TTS

### Architecture Rust Backend (`voice_engine.rs`)

**✅ POINTS FORTS**:
- Architecture bien structurée avec séparation ASR/TTS
- Configuration flexible (VoiceConfig)
- Support duplex (écoute + parole simultanée)
- Détection wake word ("TITANE")
- Calibration micro automatique
- Détection interruption utilisateur
- Multi-pipeline audio (PipeWire/PulseAudio/ALSA)

**❌ PROBLÈMES IDENTIFIÉS**:

#### P0 - CRITIQUE (Bloquants)
1. **TTS non implémenté** (`voice_synthesize_speech`)
   - Code: `vec![0u8; 16000]` (audio vide simulé)
   - Manque: Intégration Piper ou Kokoro TTS
   - Impact: Aucune synthèse vocale réelle

2. **Audio playback non implémenté** (`voice_play_audio`)
   - Code: Juste `println!` sans lecture audio
   - Manque: rodio, cpal, ou paplay/aplay
   - Impact: Audio non joué même si synthétisé

3. **ASR Whisper non intégré** (`voice_transcribe_audio`)
   - Code: Retourne "Texte transcrit simulé"
   - Manque: whisper.cpp ou faster-whisper
   - Impact: Pas de vraie transcription

4. **Wake word non fonctionnel** (`voice_detect_wake_word`)
   - Code: Retourne toujours `false`
   - Manque: Porcupine, Snowboy, ou Whisper
   - Impact: Impossible détecter "TITANE"

#### P1 - HAUTE PRIORITÉ
5. **Tests audio non implémentés**
   - `test_microphone()` et `test_speakers()` retournent `true` sans test réel
   - Risque: Pas de détection problèmes hardware

6. **Gestion erreurs basique**
   - Lock poisoning récupéré mais pas logged correctement
   - Pas de retry logic
   - Pas de fallback si modèle manquant

7. **Performance non optimisée**
   - Pas de buffering audio
   - Pas de streaming pour longues synthèses
   - Pas de cache pour phrases courantes

#### P2 - AMÉLIORATIONS
8. **Qualité vocale limitée**
   - Pas de présets voix (calme/énergique/professionnelle)
   - Pas d'adaptation selon Emotion Engine
   - Pas de contrôle fin (timbre, respiration)

9. **UX basique**
   - Pas de feedback progression
   - Pas d'annulation en douceur
   - Pas de visualisation waveform

---

## 🔗 INTÉGRATION FRONTEND

### Hook React (`useVoiceMode.ts`)

**✅ BON**:
- Gestion états (recording, transcribing, speaking)
- Offline-first par défaut
- Confirmation API cloud

**❌ PROBLÈMES**:
- Utilise ancien `useAI` hook (à migrer vers `useChat`)
- Pas d'intégration Emotion Engine
- Pas de mode adaptatif (calme vs énergique)

### Commandes Tauri (`commands.ts`)

**✅ BON**:
- Wrappers propres autour `invoke()`
- TypeScript typed

**❌ MANQUE**:
- Pas de retry automatique
- Pas de timeout
- Pas de validation schéma

---

## 🎯 PLAN D'OPTIMISATION TTS

### Phase 1: Implémentation Core (P0)

#### 1.1 Intégrer Piper TTS
```rust
// Ajouter dépendance
[dependencies]
piper-tts = "0.1"  // ou utiliser piper binary via FFI

// Implémenter
pub fn voice_synthesize_speech(...) -> Result<Vec<u8>, String> {
    let piper = Piper::new(&config.tts_model)?;
    let audio = piper.synthesize(&request.text,
        request.speed,
        request.pitch
    )?;
    Ok(audio)
}
```

#### 1.2 Intégrer rodio pour playback
```rust
use rodio::{Decoder, OutputStream, Sink};

pub fn voice_play_audio(audio_data: Vec<u8>, ...) -> Result<String, String> {
    let (_stream, stream_handle) = OutputStream::try_default()?;
    let sink = Sink::try_new(&stream_handle)?;

    let cursor = std::io::Cursor::new(audio_data);
    let source = Decoder::new(cursor)?;
    sink.append(source);
    sink.sleep_until_end();

    Ok("Audio joué".to_string())
}
```

#### 1.3 Intégrer Whisper ASR
```rust
use whisper_rs::{WhisperContext, WhisperParams};

pub fn voice_transcribe_audio(audio_data: Vec<u8>, ...) -> Result<TranscriptionResult, String> {
    let ctx = WhisperContext::new(&config.asr_model)?;
    let params = WhisperParams::default();

    let transcript = ctx.full(params, &audio_data)?;

    Ok(TranscriptionResult {
        text: transcript.text,
        confidence: transcript.confidence,
        language: config.language.clone(),
        duration_ms: transcript.duration,
    })
}
```

### Phase 2: Qualité & Robustesse (P1)

#### 2.1 Streaming audio (longues synthèses)
```rust
pub async fn voice_synthesize_stream(
    text: String,
    callback: impl Fn(Vec<u8>)
) -> Result<(), String> {
    let chunks = split_by_sentences(&text);

    for chunk in chunks {
        let audio = synthesize_chunk(chunk).await?;
        callback(audio);  // Envoyer au frontend progressivement
    }

    Ok(())
}
```

#### 2.2 Tests audio réels
```rust
fn test_microphone() -> bool {
    // Enregistrer 1s
    let recording = record_audio(Duration::from_secs(1)).unwrap();

    // Vérifier niveau RMS
    let rms = calculate_rms(&recording);
    rms > 0.01 && rms < 0.9  // Ni trop faible ni saturé
}

fn test_speakers() -> bool {
    // Générer bip 440Hz
    let beep = generate_sine_wave(440.0, 0.5);

    // Jouer et vérifier pas d'erreur
    play_audio(beep).is_ok()
}
```

#### 2.3 Gestion erreurs avancée
```rust
pub fn voice_synthesize_speech(...) -> Result<Vec<u8>, VoiceError> {
    retry_with_backoff(3, Duration::from_millis(500), || {
        match piper.synthesize(&text) {
            Ok(audio) => Ok(audio),
            Err(e) if e.is_recoverable() => Err(e),
            Err(e) => {
                // Fallback: TTS cloud ou message d'erreur audio
                fallback_tts(&text)
            }
        }
    })
}
```

### Phase 3: Qualité Vocale (P2)

#### 3.1 Présets voix selon contexte
```rust
pub enum VoicePreset {
    Calm,        // Vitesse 0.9, ton grave, pauses longues
    Energetic,   // Vitesse 1.2, ton aigu, dynamique
    Professional, // Vitesse 1.0, ton neutre, articulé
    Intimate,    // Vitesse 0.8, ton doux, respirations
}

pub fn apply_voice_preset(
    text: &str,
    preset: VoicePreset
) -> SynthesisRequest {
    match preset {
        VoicePreset::Calm => SynthesisRequest {
            speed: 0.9,
            pitch: 0.95,
            add_pauses: true,
            breathing: true,
        },
        // ...
    }
}
```

#### 3.2 Adaptation Emotion Engine
```rust
pub fn adapt_tts_to_emotion(
    emotion: EmotionState
) -> VoicePreset {
    match (emotion.valence, emotion.energy) {
        (v, e) if v < -0.5 && e < 0.3 => VoicePreset::Calm,
        (v, e) if v > 0.5 && e > 0.7 => VoicePreset::Energetic,
        _ => VoicePreset::Professional,
    }
}
```

#### 3.3 SSML pour contrôle fin
```xml
<speak>
  <prosody rate="0.9" pitch="-2st">
    Bonjour Kevin,
    <break time="500ms"/>
    comment vas-tu aujourd'hui ?
  </prosody>
</speak>
```

### Phase 4: UX & Accessibilité

#### 4.1 Feedback progression
```rust
#[tauri::command]
pub fn voice_synthesize_with_progress(
    text: String,
    window: tauri::Window
) -> Result<(), String> {
    let total_chars = text.len();

    for (i, chunk) in text.chunks(100).enumerate() {
        synthesize_chunk(chunk)?;

        let progress = (i as f32 / total_chars as f32) * 100.0;
        window.emit("tts_progress", progress).ok();
    }

    Ok(())
}
```

#### 4.2 Annulation douce
```rust
pub fn voice_stop_speaking_smooth(state: State<VoiceEngineState>) -> Result<String, String> {
    let mut is_speaking = state.is_speaking.lock().unwrap();

    // Fade out sur 200ms
    fade_out_audio(Duration::from_millis(200));

    *is_speaking = false;
    Ok("TTS arrêté en douceur".to_string())
}
```

#### 4.3 Visualisation waveform
```typescript
// Frontend
const waveformData = await tauriCommands.voice_get_waveform();
<WaveformVisualizer data={waveformData} />
```

---

## 📈 MÉTRIQUES CIBLES

| Métrique | Actuel | Cible | Méthode |
|----------|--------|-------|---------|
| Latence TTS | N/A (non impl.) | <300ms | Piper optimisé |
| Qualité vocale (MOS) | 0 | 4.0+ | Piper haute qualité |
| Précision ASR (WER) | N/A | <10% | Whisper-base |
| Interruption détection | Simulé | <50ms | VAD temps réel |
| Stabilité (MTBF) | ? | >24h | Tests stress |
| Accessibilité (WCAG) | ? | AAA | Sous-titres + feedback visuel |

---

## 🚀 ORDRE D'IMPLÉMENTATION

1. **Semaine 1**: P0 - Piper TTS + rodio playback
2. **Semaine 2**: P0 - Whisper ASR + Wake word
3. **Semaine 3**: P1 - Streaming + Tests audio
4. **Semaine 4**: P2 - Présets voix + Emotion Engine

---

## 🔗 RESSOURCES

- **Piper TTS**: https://github.com/rhasspy/piper
- **Whisper Rust**: https://github.com/tazz4843/whisper-rs
- **rodio**: https://github.com/RustAudio/rodio
- **Porcupine Wake Word**: https://picovoice.ai/platform/porcupine/

---

**Status**: ⏳ Diagnostic complet, prêt pour implémentation Phase 1
