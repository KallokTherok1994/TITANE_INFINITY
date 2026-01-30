# 🔧 PLAN D'ACTION - CORRECTIONS BUTTONS CHAT IA

**Priorité**: IMMÉDIATE  
**Statut**: En cours de correction  
**Date**: 29 janvier 2026

---

## 📌 CRITIQUE - À CORRIGER EN PREMIER

### C1: Transcription Audio (Placeholder Only)

**Fichier**: `src/components/chat/ChatToolbar.tsx:468-485`

**Problème**:

```typescript
// ACTUEL - Seulement placeholder
onTranscriptionResult(`[Transcription de ${file.name} en cours...]`);
```

**Solution à Implémenter**:

```typescript
// ✅ NOUVEAU - Vraie transcription via backend Tauri
const handleAudioFileChange = useCallback(
  async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0] || !onTranscriptionResult) return;

    const file = e.target.files[0];

    // Validation fichier
    if (!file.type.startsWith('audio/')) {
      alert('Veuillez sélectionner un fichier audio');
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      // 25MB limit pour Whisper
      alert('Fichier trop volumineux (max 25MB)');
      return;
    }

    try {
      // Afficher état "en transcription"
      onTranscriptionResult(`[Transcription de "${file.name}" en cours...]`);

      // Utiliser Tauri backend pour transcription Whisper
      const result = await secureInvoke<{ text: string }>('transcribe_audio_file', {
        file_name: file.name,
        file_size: file.size,
        mime_type: file.type,
        // Envoyer le fichier en base64
        file_data: await file.arrayBuffer().then(b => Buffer.from(b).toString('base64')),
      });

      if (result?.text) {
        onTranscriptionResult(result.text);
      } else {
        throw new Error('Transcription échouée - pas de résultat');
      }
    } catch (err) {
      console.error('[ChatToolbar] Transcription error:', err);
      const errorMsg = (err as Error).message || 'Erreur inconnue';
      alert(`Erreur transcription: ${errorMsg}`);
      onTranscriptionResult(''); // Reset
    }

    e.target.value = ''; // Reset input
  },
  [onTranscriptionResult]
);
```

**Backend Tauri (à ajouter dans `src-tauri/src/conversation_engine/commands.rs`)**:

```rust
/// Transcrire un fichier audio via Whisper
#[tauri::command]
pub async fn transcribe_audio_file(
    file_name: String,
    file_data: String,
) -> CommandResult<TranscriptionResult> {
    // Décoder base64
    let file_bytes = base64_decode(&file_data)?;

    // Sauvegarder temporairement
    let temp_file = format!("/tmp/titane_{}", file_name);
    fs::write(&temp_file, file_bytes)?;

    // Appeler Whisper (local ou API)
    let result = match whisper_local_transcribe(&temp_file).await {
        Ok(text) => text,
        Err(_) => {
            // Fallback vers API cloud si local échoue
            whisper_api_transcribe(&temp_file).await?
        }
    };

    // Nettoyer fichier temporaire
    fs::remove_file(&temp_file)?;

    Ok(TranscriptionResult { text: result })
}
```

---

### C2: Ajouter Timeouts Auto-Stop (Dictation, Recording, Audio Conversation)

**Fichiers à corriger**:

- `src/components/chat/ChatToolbar.tsx:385` (Dictation)
- `src/components/chat/ChatToolbar.tsx:420` (Recording)
- `src/components/chat/ChatToolbar.tsx:500` (Audio Conversation)

**Pattern à Implémenter**:

```typescript
// ✅ NEW HOOK - Auto timeout management
function useAutoTimeout(
  active: boolean,
  timeoutMs: number,
  onTimeout: () => void,
  id: string
) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (active) {
      timeoutRef.current = setTimeout(() => {
        console.warn(`[ChatToolbar] Auto-stop ${id} après ${timeoutMs}ms`);
        onTimeout();
      }, timeoutMs);

      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    }
  }, [active, timeoutMs, onTimeout, id]);
}

// ✅ Usage dans handleDictationToggle:
const handleDictationToggle = useCallback(async () => {
  try {
    if (isDictating) {
      setIsDictating(false);
      const result = await voiceEngine.stopDictation();
      if (result?.trim() && onDictationResult) {
        onDictationResult(result);
      }
    } else {
      // Check micro disponible
      const devices = await navigator.mediaDevices.enumerateDevices();
      if (!devices.some(d => d.kind === 'audioinput')) {
        alert('Aucun microphone détecté');
        return;
      }

      setIsDictating(true);
      await voiceEngine.startDictation();
    }
  } catch (err) {
    setIsDictating(false);
    console.error('[ChatToolbar] Dictation error:', err);
    alert('Erreur dictée vocale');
  }
}, [isDictating, voiceEngine, onDictationResult]);

// ✅ Use timeout hook
useAutoTimeout(
  isDictating,
  60 * 1000,
  () => {
    setIsDictating(false);
    onDictationResult?.('[Dictation arrêtée automatiquement après 60s]');
  },
  'dictation'
);
```

---

### C3: Ajouter Check Support APIs (Screen Capture, Camera, Microphone)

**Fichiers à corriger**:

- `src/components/chat/ChatToolbar.tsx:223` (Screen Capture)
- `src/components/chat/ChatToolbar.tsx:420` (Audio Recording)
- `src/components/chat/ChatToolbar.tsx:545` (Camera)

**Utility Functions à Ajouter**:

```typescript
// ✅ NEW - API support checkers
export const APISupport = {
  async getDisplayMedia(): Promise<boolean> {
    try {
      return !!navigator.mediaDevices?.getDisplayMedia;
    } catch {
      return false;
    }
  },

  async getUserMedia(): Promise<boolean> {
    try {
      return !!navigator.mediaDevices?.getUserMedia;
    } catch {
      return false;
    }
  },

  hasMicrophone(): Promise<boolean> {
    return navigator.mediaDevices
      .enumerateDevices()
      .then(devices => devices.some(d => d.kind === 'audioinput'))
      .catch(() => false);
  },

  hasCamera(): Promise<boolean> {
    return navigator.mediaDevices
      .enumerateDevices()
      .then(devices => devices.some(d => d.kind === 'videoinput'))
      .catch(() => false);
  },

  supportsMediaRecorder(): boolean {
    return !!(window.MediaRecorder && navigator.mediaDevices?.getUserMedia);
  },

  supportsWebSpeech(): boolean {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    return !!SpeechRecognition;
  },

  supportsSpeechSynthesis(): boolean {
    return !!window.speechSynthesis;
  },
};
```

**Usage dans Toolbar**:

```typescript
// Before screen capture
const handleScreenCapture = useCallback(async () => {
  if (!onScreenCapture) return;

  const supported = await APISupport.getDisplayMedia();
  if (!supported) {
    alert("Capture d'écran non supportée dans ce navigateur");
    return;
  }

  try {
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: { displaySurface: 'monitor' } as MediaTrackConstraints,
    });
    // ... rest of code
  } catch (err) {
    if ((err as any).name === 'NotAllowedError') {
      alert("Permission de capture d'écran refusée");
    } else if ((err as any).name === 'NotFoundError') {
      alert('Aucun écran à capturer trouvé');
    } else {
      alert('Erreur capture écran: ' + (err as Error).message);
    }
  }
}, [onScreenCapture]);

// Before audio recording
const handleAudioRecordToggle = useCallback(async () => {
  if (isRecordingAudio) {
    mediaRecorderRef.current?.stop();
    setIsRecordingAudio(false);
    return;
  }

  if (!APISupport.supportsMediaRecorder()) {
    alert('Enregistrement audio non supporté');
    return;
  }

  const hasMic = await APISupport.hasMicrophone();
  if (!hasMic) {
    alert('Aucun microphone détecté');
    return;
  }

  try {
    // ... rest of code
  } catch (err) {
    alert('Erreur: ' + (err as Error).message);
  }
}, [isRecordingAudio]);
```

---

## 🟠 ÉLEVÉ - À Corriger Ensuite

### H1: Ajouter Indicateurs Visuels Temps Écoulé

**Fichiers**: `src/components/chat/ChatToolbar.tsx`

```typescript
// ✅ NEW - Recording timer component
interface RecordingTimerProps {
  isRecording: boolean;
  maxDuration?: number; // en secondes
}

const RecordingTimer: React.FC<RecordingTimerProps> = memo(
  ({ isRecording, maxDuration = 300 }) => {
    const [elapsed, setElapsed] = useState(0);

    useEffect(() => {
      if (!isRecording) {
        setElapsed(0);
        return;
      }

      const interval = setInterval(() => {
        setElapsed(prev => {
          const next = prev + 1;
          if (next >= maxDuration) {
            // Stop recording
            return maxDuration;
          }
          return next;
        });
      }, 1000);

      return () => clearInterval(interval);
    }, [isRecording, maxDuration]);

    if (!isRecording || elapsed === 0) return null;

    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    const percentage = (elapsed / maxDuration) * 100;

    return (
      <div className="recording-timer">
        <span className="timer-display">
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </span>
        <div className="timer-bar">
          <div
            className={`timer-fill ${percentage > 80 ? 'warning' : ''}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  }
);
```

---

### H2: Persister État Préférences (TTS, Audio Conversation)

```typescript
// ✅ NEW - Preference persistence hook
function usePersistentToggle(key: string, defaultValue: boolean) {
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(`titane_pref_${key}`);
      return stored ? JSON.parse(stored) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  const setValueWithPersist = useCallback(
    (newValue: boolean | ((prev: boolean) => boolean)) => {
      setValue(prev => {
        const next = typeof newValue === 'function' ? newValue(prev) : newValue;
        try {
          localStorage.setItem(`titane_pref_${key}`, JSON.stringify(next));
        } catch (err) {
          console.error(`[usePersistentToggle] Failed to save ${key}:`, err);
        }
        return next;
      });
    },
    [key]
  );

  return [value, setValueWithPersist] as const;
}

// Usage:
const [isTTSEnabled, setIsTTSEnabled] = usePersistentToggle('tts_enabled', true);
const [isAudioConvActive, setIsAudioConvActive] = usePersistentToggle(
  'audio_conversation_active',
  false
);
```

---

## 🟡 MODÉRÉ - À Améliorer

### M1: Standardiser Error Feedback

```typescript
// ✅ NEW - Unified error handler
const showErrorNotification = (
  error: Error | string,
  context: string,
  onRetry?: () => void
) => {
  const message = typeof error === 'string' ? error : error.message;

  // Could integrate with toast/notification system
  const notification = {
    id: `${context}-${Date.now()}`,
    type: 'error' as const,
    title: `Erreur ${context}`,
    message,
    action: onRetry ? { label: 'Réessayer', callback: onRetry } : undefined,
    duration: 6000,
  };

  // Dispatch to notification store/context
  console.error(`[${context}] ${message}`);
};
```

---

## ✅ RÉSUMÉ DES CORRECTIONS

| #   | Problème                    | Sévérité | Fichier         | Ligne       | Statut  |
| --- | --------------------------- | -------- | --------------- | ----------- | ------- |
| C1  | Transcription placeholder   | 🔴       | ChatToolbar.tsx | 468         | À faire |
| C2  | Pas de timeouts             | 🔴       | ChatToolbar.tsx | 385,420,500 | À faire |
| C3  | Pas de check support API    | 🔴       | ChatToolbar.tsx | 223,420,545 | À faire |
| H1  | Pas d'indicateur durée      | 🟠       | ChatToolbar.tsx | 420,500     | À faire |
| H2  | Pas de persistence état     | 🟠       | ChatToolbar.tsx | 130,570     | À faire |
| M1  | Error feedback inconsistant | 🟡       | ChatToolbar.tsx | Partout     | À faire |

---

## 🚀 Ordre Recommandé

1. ✅ **FAIT**: C2 - Ajouter aria-labels (1.2 Reset Error)
2. ⏳ **NEXT**: C1 - Implémenter vraie transcription
3. ⏳ **NEXT**: C3 - Ajouter checks support API
4. ⏳ **NEXT**: C2 - Implémenter timeouts auto-stop
5. ⏳ **NEXT**: H2 - Persister préférences
6. ⏳ **NEXT**: H1 - Ajouter indicateurs visuels durée
7. ⏳ **NEXT**: M1 - Standardiser error feedback

---

## 📊 Estimation Impact

| Correction       | Effort | Impact          | Score  |
| ---------------- | ------ | --------------- | ------ |
| C1 Transcription | 3h     | 🔴 Critique     | +15pts |
| C3 API Checks    | 2h     | 🔴 Critique     | +12pts |
| C2 Timeouts      | 1h     | 🔴 Critique     | +8pts  |
| H2 Persistence   | 1h     | 🟠 Important    | +5pts  |
| H1 Timer UI      | 1.5h   | 🟠 Important    | +4pts  |
| M1 Error UX      | 2h     | 🟡 Nice-to-have | +3pts  |

**Total Effort**: ~10.5h  
**Total Gain**: +47 pts → Score 119/100 (capped at 100)

---

**Généré**: 29 janvier 2026  
**Version**: TITANE∞ v26.2.0  
**Conformité Cible**: 100/100 ✅
