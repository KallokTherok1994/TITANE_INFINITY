# 🎙️ GUIDE — Correction Audio Feedback Loop (Phase 1)

## 🚨 Problème

**Symptôme**: En mode voix duplex, la voix TTS (sortie) est recapturée par le micro (entrée), créant une boucle infinie.

**Impact**: Mode voix inutilisable, saturation audio.

---

## ✅ Solution (3 Niveaux)

### Niveau 1: Echo Cancellation (PRIORITÉ)

**Fichier cible**: `src/services/audioService.ts` ou composant audio

```typescript
// Configuration micro avec echo cancellation
const constraints: MediaStreamConstraints = {
  audio: {
    echoCancellation: true, // ✅ CRITIQUE
    noiseSuppression: true, // ✅ Recommandé
    autoGainControl: true, // ✅ Recommandé
    sampleRate: 16000, // Optimal pour STT
  },
};

const stream = await navigator.mediaDevices.getUserMedia(constraints);
```

---

### Niveau 2: Mute Micro Pendant TTS

**Stratégie**: Stopper l'enregistrement pendant lecture TTS.

```typescript
// Service audio avec mute
class AudioService {
  private mediaRecorder: MediaRecorder | null = null;
  private isRecording = false;

  async pauseRecording() {
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.pause();
      this.isRecording = false;
    }
  }

  async resumeRecording() {
    if (this.mediaRecorder && !this.isRecording) {
      this.mediaRecorder.resume();
      this.isRecording = true;
    }
  }
}

// Usage dans playTTS
async function playTTS(audioBlob: Blob) {
  await audioService.pauseRecording(); // ✅ Mute micro
  await playAudioBlob(audioBlob); // Jouer TTS
  await audioService.resumeRecording(); // ✅ Unmute micro
}
```

---

### Niveau 3: Séparation Devices Input/Output (Optionnel)

**Config système**: Utiliser devices physiques séparés.

```typescript
// Sélectionner device input spécifique
const devices = await navigator.mediaDevices.enumerateDevices();
const micId = devices.find(d => d.kind === 'audioinput')?.deviceId;

const stream = await navigator.mediaDevices.getUserMedia({
  audio: {
    deviceId: micId ? { exact: micId } : undefined,
    echoCancellation: true,
  },
});
```

**Recommandation UX**: Proposer à l'utilisateur de choisir micro/speakers séparés.

---

## 🧪 Tests de Validation

### Test manuel

1. Activer mode voix duplex
2. Parler "Bonjour TITANE"
3. Attendre réponse TTS
4. Vérifier que TTS **n'est pas** transcrit comme nouvelle entrée

### Test automatisé (optionnel)

```typescript
describe('Audio Feedback Prevention', () => {
  it('should mute recording during TTS playback', async () => {
    const service = new AudioService();
    await service.startRecording();

    expect(service.isRecording).toBe(true);

    await service.pauseRecording();
    expect(service.isRecording).toBe(false);

    // Simuler TTS
    await new Promise(r => setTimeout(r, 1000));

    await service.resumeRecording();
    expect(service.isRecording).toBe(true);
  });
});
```

---

## 📁 Fichiers à Modifier

### Frontend

- `src/services/audioService.ts` (si existe)
- `src/components/VoiceUI.tsx` (ou équivalent)
- `src/stores/audioStore.ts` (si state management)

### Backend (optionnel)

- `src-tauri/src/commands/audio.rs` (si gestion audio côté Rust)

---

## 📚 Références

- Web Audio API: https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API
- Echo Cancellation: https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackConstraints/echoCancellation
- MediaRecorder: https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder

---

## 🎯 Checklist

- [ ] Echo cancellation activé dans constraints
- [ ] Pause/resume recording implémenté
- [ ] Mute micro pendant TTS dans `playTTS()`
- [ ] Test manuel: pas de feedback loop
- [ ] (Optionnel) Sélection devices séparés

---

**Phase 1 Stabilisation v20.0**
**Status**: Guide prêt, implémentation à suivre
