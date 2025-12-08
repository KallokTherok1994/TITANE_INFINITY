# 🚀 QUICK START — ACTIVE LISTENING INTEGRATION

**Super Prompt v∞.3** — Guide d'intégration rapide

---

## 📦 Installation

Tous les modules sont déjà inclus dans TITANE∞ v19.4.0. Aucune dépendance externe requise.

---

## 🎯 Usage de Base

### Option 1: Composant UI Tout-en-Un

Le plus simple pour démarrer:

```tsx
import { VoiceControlPanelWithWakeWord } from '@/services/voice/activeListening';

function App() {
  return (
    <div>
      <h1>TITANE∞ Voice Assistant</h1>
      <VoiceControlPanelWithWakeWord />
    </div>
  );
}
```

**Résultat:**
- Toggle Push-to-Talk / Wake Word
- Indicateur visuel d'attention avec glows
- Status text dynamique
- Gestion erreurs intégrée

---

### Option 2: Hook Standalone

Pour plus de contrôle:

```tsx
import { useActiveListening, useVoiceEngine, WakeWordIndicator } from '@/services/voice/activeListening';

function CustomVoiceUI() {
  const voiceEngine = useVoiceEngine();

  const listening = useActiveListening(
    {
      enableWakeWord: true,
      sensitivity: 0.5,
      autoArm: false,
    },
    {
      onWakeDetected: (event) => {
        console.log('🎯 Wake detected:', event.mode);
      },

      onCommand: (text) => {
        console.log('📝 Command:', text);
        voiceEngine.completeTurnWithText(text);
      },

      onAttentionChange: (state) => {
        console.log('🧠 Attention:', state);
      },
    }
  );

  return (
    <div>
      <WakeWordIndicator
        attentionState={listening.state.attentionState}
        size="lg"
        showLabel={true}
      />

      <div>
        <button onClick={listening.arm} disabled={listening.isArmed}>
          🔊 Activer Wake Word
        </button>

        <button onClick={listening.disarm} disabled={!listening.isArmed}>
          🔇 Désactiver
        </button>
      </div>

      <p>État: {voiceEngine.status.state}</p>
      <p>Transcription: {voiceEngine.status.transcript}</p>
    </div>
  );
}
```

---

### Option 3: Wake Word Simple

Pour juste la détection wake word sans UI:

```tsx
import { useWakeWord } from '@/services/voice/activeListening';

function MinimalWakeWord() {
  const wake = useWakeWord((event) => {
    alert(`Wake word detected: ${event.mode}`);
  });

  return (
    <button onClick={wake.isListening ? wake.stop : wake.start}>
      {wake.isListening ? '🛑 Stop' : '▶️ Start'}
    </button>
  );
}
```

---

## 🎨 Indicateurs Visuels

### Dans une Navbar

```tsx
import { useActiveListening, WakeWordBadge } from '@/services/voice/activeListening';

function Navbar() {
  const { state } = useActiveListening({ autoArm: true });

  return (
    <nav>
      <Logo />
      <Menu />

      <WakeWordBadge
        attentionState={state.attentionState}
        onClick={() => console.log('Badge clicked')}
      />
    </nav>
  );
}
```

---

## 🔧 Configuration Avancée

### Ajuster la Sensibilité

```tsx
import { adaptiveThresholdEngine } from '@/services/voice/activeListening';

// Moins sensible (moins de false positives)
adaptiveThresholdEngine.setSensitivity(0.7);

// Plus sensible (détection plus facile)
adaptiveThresholdEngine.setSensitivity(0.3);

// Défaut
adaptiveThresholdEngine.setSensitivity(0.5);
```

### Modes d'Écoute

```tsx
import { attentionEngine } from '@/services/voice/activeListening';

// Mode wake word actif
attentionEngine.activate();

// Mode push-to-talk
attentionEngine.setPushToTalk();

// Désactiver
attentionEngine.deactivate();

// État actuel
const state = attentionEngine.getState(); // 'armed', 'awaiting_command', etc.
```

---

## 📊 Monitoring

### Métriques Temps Réel

```tsx
import { useActiveListening } from '@/services/voice/activeListening';

function VoiceMetrics() {
  const { state } = useActiveListening({ autoArm: true });

  return (
    <div>
      <p>Listening: {state.isListening ? '✅' : '❌'}</p>
      <p>Attention: {state.attentionState}</p>
      <p>Processing: {state.isProcessingCommand ? '⏳' : '✅'}</p>
      <p>Streaming: {state.streamingActive ? '🎙️' : '🔇'}</p>
      {state.lastWakeEvent && (
        <p>Last Wake: {state.lastWakeEvent.mode} ({state.lastWakeEvent.confidence.toFixed(2)})</p>
      )}
    </div>
  );
}
```

---

## 🐛 Debug Mode

```tsx
import { useActiveListening } from '@/services/voice/activeListening';

function DebugPanel() {
  const listening = useActiveListening(
    { autoArm: true, sensitivity: 0.5 },
    {
      onWakeDetected: (event) => {
        console.log('🎯 WAKE:', {
          mode: event.mode,
          confidence: event.confidence,
          variant: event.matchedVariant,
          cleaned: event.cleanedText,
        });
      },

      onCommand: (text, event) => {
        console.log('📝 COMMAND:', { text, event });
      },

      onAttentionChange: (state) => {
        console.log('🧠 ATTENTION:', state);
      },

      onPartialTranscript: (text) => {
        console.log('⏳ PARTIAL:', text);
      },

      onFinalTranscript: (text) => {
        console.log('✅ FINAL:', text);
      },
    }
  );

  return (
    <div>
      <pre>{JSON.stringify(listening.state, null, 2)}</pre>
    </div>
  );
}
```

---

## 🎭 Exemples de Scénarios

### Scénario 1: Wake Only

```
User dit: "Titane ?"
→ Wake detected (wake_only)
→ State: awaiting_command
→ UI: Glow jaune pulsant

User dit: "ouvre le terminal"
→ Command detected
→ VoiceEngine.completeTurnWithText("ouvre le terminal")
→ IA traite → TTS répond
→ State: responding → cooldown → armed
```

### Scénario 2: One-Shot

```
User dit: "Titane, ouvre le terminal"
→ Wake detected (one_shot)
→ cleanedText: "ouvre le terminal"
→ Direct: VoiceEngine.completeTurnWithText("ouvre le terminal")
→ IA traite → TTS répond
→ State: responding → cooldown → armed
```

### Scénario 3: Interruption

```
TTS en cours (state: responding)
User dit: "Titane"
→ Interruption detected
→ TTS stop
→ State: awaiting_command
→ User dit: "nouvelle commande"
```

---

## 🔐 Permissions

### Vérifier Microphone

```tsx
import { useVoiceEngine } from '@/services/voice/activeListening';

function MicCheck() {
  const voice = useVoiceEngine();

  if (!voice.status.isMicAvailable) {
    return (
      <div className="alert alert-error">
        ⚠️ Microphone non disponible
      </div>
    );
  }

  return <VoiceControlPanelWithWakeWord />;
}
```

---

## 📈 Performance Tips

1. **Auto-Arm uniquement si nécessaire:**
   ```tsx
   useActiveListening({ autoArm: false })
   ```

2. **Désactiver streaming quand inactif:**
   ```tsx
   listening.disarm(); // Stop streaming
   ```

3. **Reset périodique pour éviter memory leaks:**
   ```tsx
   useEffect(() => {
     return () => listening.reset();
   }, []);
   ```

---

## 🆘 Troubleshooting

### Wake word non détecté
```tsx
// Baisser seuil
adaptiveThresholdEngine.setSensitivity(0.3);
```

### Trop de false positives
```tsx
// Monter seuil
adaptiveThresholdEngine.setSensitivity(0.7);
```

### Streaming bloqué
```tsx
listening.reset();
attentionEngine.reset();
```

---

## 📚 Documentation Complète

Voir: `SUPER_PROMPT_v∞.3_ACTIVE_LISTENING_INTEGRATION_COMPLETE.md`

---

## ✅ Checklist Intégration

- [ ] Import `VoiceControlPanelWithWakeWord`
- [ ] Ajouter composant dans UI
- [ ] Tester "Titane ?" (wake only)
- [ ] Tester "Titane, ouvre X" (one-shot)
- [ ] Ajuster sensibilité si besoin
- [ ] Vérifier microphone permissions
- [ ] Ajouter error handling
- [ ] Tests end-to-end

---

**Ready to use!** 🚀

*TITANE_INFINITY v19.4.0 — Humain Total © 2025*
