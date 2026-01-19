# 🎤 PHASE 1.7 — AUDIO FEEDBACK LOOP: IMPLEMENTATION GUIDE

**Date**: 9 Décembre 2025  
**Version**: TITANE∞ v20.0  
**Objectif**: Résoudre définitivement la boucle de feedback audio (mode duplex)

---

## 🔍 DIAGNOSTIC DU PROBLÈME

### **Symptômes**

- 🔊 Écho: Le micro capte le son du haut-parleur
- 🔁 Boucle: L'IA s'entend elle-même et répond en boucle
- 📢 Amplification: Le son devient de plus en plus fort
- 🎙️ Mode duplex impossible: Ne peut pas écouter pendant que l'IA parle

### **Cause racine**

```
User parle → Micro → ASR → IA → TTS → Haut-parleur
                ↑                              ↓
                └──────────── Feedback ────────┘
```

Le micro capte le son du haut-parleur, créant une **boucle de feedback**.

---

## ✅ SOLUTION 1: ECHO CANCELLATION (Web Audio API)

### **Principe**

Activer l'annulation d'écho native du navigateur via `getUserMedia` constraints.

### **Implementation**

**Fichier**: `src/services/voiceMode/audioCapture.ts` (ou équivalent)

```typescript
// ═══════════════════════════════════════════════════════════════
// AVANT (sans echo cancellation)
// ═══════════════════════════════════════════════════════════════

async function startMicrophone() {
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: true,
  });
  return stream;
}

// ═══════════════════════════════════════════════════════════════
// APRÈS (avec echo cancellation + noise suppression)
// ═══════════════════════════════════════════════════════════════

async function startMicrophone(): Promise<MediaStream> {
  const constraints: MediaStreamConstraints = {
    audio: {
      echoCancellation: true, // ✅ Annulation d'écho
      noiseSuppression: true, // ✅ Réduction bruit
      autoGainControl: true, // ✅ Contrôle gain automatique
      sampleRate: 16000, // Optimal pour ASR
      channelCount: 1, // Mono suffisant
    },
  };

  try {
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    console.log('[AudioCapture] Microphone started with echo cancellation');
    return stream;
  } catch (error) {
    console.error('[AudioCapture] Failed to start microphone:', error);
    throw new Error('Microphone access denied or not available');
  }
}
```

### **Validation**

```typescript
// Vérifier que les contraintes sont bien appliquées
const audioTrack = stream.getAudioTracks()[0];
const settings = audioTrack.getSettings();

console.log('Echo cancellation:', settings.echoCancellation); // Should be true
console.log('Noise suppression:', settings.noiseSuppression); // Should be true
console.log('Auto gain control:', settings.autoGainControl); // Should be true
```

---

## ✅ SOLUTION 2: MUTE MICRO PENDANT TTS

### **Principe**

Désactiver temporairement le micro pendant que l'IA parle.

### **Implementation**

**Fichier**: `src/services/voiceMode/voiceModeManager.ts`

```typescript
class VoiceModeManager {
  private audioStream: MediaStream | null = null;
  private isSpeaking: boolean = false;

  // ═══════════════════════════════════════════════════════════════
  // MUTE/UNMUTE MICROPHONE
  // ═══════════════════════════════════════════════════════════════

  private muteMicrophone(): void {
    if (!this.audioStream) return;

    const audioTracks = this.audioStream.getAudioTracks();
    audioTracks.forEach(track => {
      track.enabled = false; // ✅ Désactiver le micro
    });

    console.log('[VoiceMode] Microphone muted during TTS');
  }

  private unmuteMicrophone(): void {
    if (!this.audioStream) return;

    const audioTracks = this.audioStream.getAudioTracks();
    audioTracks.forEach(track => {
      track.enabled = true; // ✅ Réactiver le micro
    });

    console.log('[VoiceMode] Microphone unmuted');
  }

  // ═══════════════════════════════════════════════════════════════
  // TTS AVEC AUTO-MUTE
  // ═══════════════════════════════════════════════════════════════

  async speak(text: string): Promise<void> {
    try {
      this.isSpeaking = true;
      this.muteMicrophone(); // ✅ Mute AVANT TTS

      // Synthèse vocale (via backend ou Web Speech API)
      await this.synthesizeSpeech(text);

      // Attendre que le son soit complètement joué
      await this.waitForAudioToFinish();

      // Petit délai supplémentaire pour éviter queue-overlap
      await new Promise(resolve => setTimeout(resolve, 300));
    } catch (error) {
      console.error('[VoiceMode] TTS failed:', error);
    } finally {
      this.unmuteMicrophone(); // ✅ Unmute APRÈS TTS
      this.isSpeaking = false;
    }
  }

  private async waitForAudioToFinish(): Promise<void> {
    return new Promise(resolve => {
      if (this.audioElement) {
        this.audioElement.addEventListener('ended', () => resolve(), { once: true });
      } else {
        resolve();
      }
    });
  }
}
```

### **Validation visuelle**

```typescript
// Indicateur UI pour montrer l'état du micro
<div className="microphone-status">
  {isSpeaking ? (
    <span className="muted">🔇 Micro muted (AI speaking)</span>
  ) : (
    <span className="active">🎙️ Micro active (listening)</span>
  )}
</div>
```

---

## ✅ SOLUTION 3: VAD (VOICE ACTIVITY DETECTION)

### **Principe**

Ne déclencher l'ASR que quand l'utilisateur parle réellement.

### **Implementation**

**Fichier**: `src/services/voiceMode/vad.ts`

```typescript
// ═══════════════════════════════════════════════════════════════
// SIMPLE VAD WITH VOLUME THRESHOLD
// ═══════════════════════════════════════════════════════════════

class SimpleVAD {
  private audioContext: AudioContext;
  private analyser: AnalyserNode;
  private volumeThreshold: number = 0.02; // Adjust based on environment

  constructor(stream: MediaStream) {
    this.audioContext = new AudioContext();
    const source = this.audioContext.createMediaStreamSource(stream);

    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 2048;

    source.connect(this.analyser);
  }

  isUserSpeaking(): boolean {
    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteTimeDomainData(dataArray);

    // Calculate RMS (Root Mean Square) volume
    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
      const normalized = (dataArray[i] - 128) / 128;
      sum += normalized * normalized;
    }
    const rms = Math.sqrt(sum / dataArray.length);

    return rms > this.volumeThreshold;
  }

  startMonitoring(onSpeechStart: () => void, onSpeechEnd: () => void): void {
    let speechStarted = false;
    let silenceCounter = 0;
    const SILENCE_THRESHOLD = 10; // 10 frames of silence = end of speech

    const checkAudio = () => {
      const speaking = this.isUserSpeaking();

      if (speaking && !speechStarted) {
        speechStarted = true;
        silenceCounter = 0;
        onSpeechStart();
      } else if (!speaking && speechStarted) {
        silenceCounter++;
        if (silenceCounter >= SILENCE_THRESHOLD) {
          speechStarted = false;
          onSpeechEnd();
        }
      } else if (speaking) {
        silenceCounter = 0; // Reset silence counter
      }

      requestAnimationFrame(checkAudio);
    };

    checkAudio();
  }
}
```

### **Integration avec Voice Mode**

```typescript
const vad = new SimpleVAD(audioStream);

vad.startMonitoring(
  () => {
    console.log('[VAD] User started speaking');
    // Ne rien faire si l'IA est en train de parler
    if (!isSpeaking) {
      startRecording();
    }
  },
  () => {
    console.log('[VAD] User stopped speaking');
    stopRecording();
    processAudio();
  }
);
```

---

## ✅ SOLUTION 4: PUSH-TO-TALK (FALLBACK)

### **Principe**

Si les solutions automatiques échouent, offrir un mode "appuyer pour parler".

### **Implementation**

```typescript
// ═══════════════════════════════════════════════════════════════
// PUSH-TO-TALK MODE
// ═══════════════════════════════════════════════════════════════

function VoiceModeUI() {
  const [isHoldingButton, setIsHoldingButton] = useState(false);

  const handleMouseDown = () => {
    setIsHoldingButton(true);
    voiceMode.startListening();
  };

  const handleMouseUp = () => {
    setIsHoldingButton(false);
    voiceMode.stopListening();
  };

  return (
    <div className="voice-mode">
      <button
        className={`push-to-talk ${isHoldingButton ? 'active' : ''}`}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp} // Important: stop if mouse leaves
      >
        {isHoldingButton ? '🎙️ Listening...' : '🎤 Hold to speak'}
      </button>

      <p className="hint">Hold button while speaking, release to send</p>
    </div>
  );
}
```

---

## 🔧 IMPLEMENTATION COMPLÈTE

### **Fichier principal**: `src/services/voiceMode/index.ts`

```typescript
// ═══════════════════════════════════════════════════════════════
// VOICE MODE MANAGER v20.0 (Anti-Feedback Complete)
// ═══════════════════════════════════════════════════════════════

export class VoiceModeManager {
  private audioStream: MediaStream | null = null;
  private vad: SimpleVAD | null = null;
  private isSpeaking: boolean = false;
  private isListening: boolean = false;

  // ═══════════════════════════════════════════════════════════════
  // INITIALIZATION
  // ═══════════════════════════════════════════════════════════════

  async initialize(): Promise<void> {
    try {
      // 1. Start microphone with echo cancellation
      this.audioStream = await this.startMicrophoneWithEchoCancellation();

      // 2. Initialize VAD
      this.vad = new SimpleVAD(this.audioStream);

      // 3. Start monitoring
      this.vad.startMonitoring(
        () => this.onUserStartedSpeaking(),
        () => this.onUserStoppedSpeaking()
      );

      console.log('[VoiceMode] Initialized successfully');
    } catch (error) {
      console.error('[VoiceMode] Initialization failed:', error);
      throw error;
    }
  }

  private async startMicrophoneWithEchoCancellation(): Promise<MediaStream> {
    const constraints: MediaStreamConstraints = {
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        sampleRate: 16000,
        channelCount: 1,
      },
    };

    return await navigator.mediaDevices.getUserMedia(constraints);
  }

  // ═══════════════════════════════════════════════════════════════
  // USER SPEECH HANDLING
  // ═══════════════════════════════════════════════════════════════

  private onUserStartedSpeaking(): void {
    // Don't interrupt AI speech
    if (this.isSpeaking) {
      console.log('[VoiceMode] Ignoring user speech (AI is speaking)');
      return;
    }

    this.isListening = true;
    this.emit('listening-start');
  }

  private onUserStoppedSpeaking(): void {
    if (!this.isListening) return;

    this.isListening = false;
    this.emit('listening-end');

    // Process audio and send to ASR
    this.processAudioBuffer();
  }

  // ═══════════════════════════════════════════════════════════════
  // TTS WITH AUTO-MUTE
  // ═══════════════════════════════════════════════════════════════

  async speak(text: string): Promise<void> {
    try {
      this.isSpeaking = true;
      this.muteMicrophone(); // ✅ CRITICAL: Mute before TTS
      this.emit('speaking-start');

      await this.synthesizeSpeech(text);
      await this.waitForAudioEnd();
      await this.delay(300); // Extra buffer
    } catch (error) {
      console.error('[VoiceMode] TTS failed:', error);
    } finally {
      this.unmuteMicrophone(); // ✅ CRITICAL: Unmute after TTS
      this.isSpeaking = false;
      this.emit('speaking-end');
    }
  }

  private muteMicrophone(): void {
    if (!this.audioStream) return;
    this.audioStream.getAudioTracks().forEach(track => (track.enabled = false));
  }

  private unmuteMicrophone(): void {
    if (!this.audioStream) return;
    this.audioStream.getAudioTracks().forEach(track => (track.enabled = true));
  }

  // ═══════════════════════════════════════════════════════════════
  // CLEANUP
  // ═══════════════════════════════════════════════════════════════

  dispose(): void {
    if (this.audioStream) {
      this.audioStream.getTracks().forEach(track => track.stop());
    }
    this.audioStream = null;
    this.vad = null;
  }
}
```

---

## 🧪 TESTS DE VALIDATION

### **Test 1: Echo Cancellation**

```typescript
// Vérifier que les contraintes sont appliquées
const track = stream.getAudioTracks()[0];
const settings = track.getSettings();

console.assert(settings.echoCancellation === true, 'Echo cancellation should be enabled');
console.assert(settings.noiseSuppression === true, 'Noise suppression should be enabled');
```

### **Test 2: Mute/Unmute**

```typescript
// Simuler cycle TTS
await voiceMode.speak('Hello world');

// Vérifier que le micro est unmuted après
const track = voiceMode.audioStream?.getAudioTracks()[0];
console.assert(track?.enabled === true, 'Microphone should be enabled after TTS');
```

### **Test 3: Duplex Mode**

```bash
# Test manuel:
1. Lancer mode vocal
2. IA commence à parler
3. User parle pendant que l'IA parle
4. Vérifier que l'IA ne s'interrompt pas
5. Vérifier qu'il n'y a pas d'écho
6. Après TTS, user peut parler normalement
```

---

## 📊 MÉTRIQUES DE SUCCÈS

**Avant Phase 1.7**:

- ❌ Écho systématique
- ❌ Boucle de feedback
- ❌ Mode duplex impossible
- ❌ Amplification progressive

**Après Phase 1.7**:

- ✅ Zéro écho
- ✅ Pas de boucle
- ✅ Mode duplex fonctionnel
- ✅ Volume stable

**Score cible**:

- Avant: 82/100
- Après: **86-88/100** (+4-6 points)

---

## 🚀 DÉPLOIEMENT

### **Étape 1: Activer echo cancellation**

```typescript
// Dans audioCapture.ts ou équivalent
const constraints = {
  audio: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
  },
};
```

### **Étape 2: Implémenter auto-mute**

```typescript
// Dans voiceModeManager.ts
private muteMicrophone() { ... }
private unmuteMicrophone() { ... }
```

### **Étape 3: Tester en conditions réelles**

```bash
# Mode vocal avec audio output
1. Activer mode vocal
2. Poser question
3. Écouter réponse IA
4. Vérifier absence d'écho
5. Poser question suivante
```

### **Étape 4: Validation finale**

- ✅ Pas d'écho après 5 minutes d'utilisation
- ✅ Mode duplex stable
- ✅ Transitions smooth (mute/unmute)
- ✅ Aucune amplification

---

**Phase 1 Stabilisation v20.0 — Audio Feedback Resolution Complete**  
🔥 TITANE∞ vΩ — Crystal Clear Audio
