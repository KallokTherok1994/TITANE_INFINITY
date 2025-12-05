# 🚀 QUICKSTART — Full Duplex Overlap Mode v∞.5

**Get TITANE∞ speaking and listening simultaneously in 5 minutes**

---

## ⚡ QUICK START (30 seconds)

### 1. Activate Full Duplex in Your Component

```typescript
import { useVoiceEngine } from '@/hooks/useVoiceEngine';

function MyVoiceComponent() {
  const voice = useVoiceEngine({
    fullDuplexMode: true,  // ⭐ Enable full duplex
    language: 'fr-FR'
  });

  // Enable on mount
  useEffect(() => {
    voice.enableFullDuplex();
    return () => voice.disableFullDuplex();
  }, []);

  return (
    <div>
      <p>Full Duplex: {voice.status.fullDuplexMode ? '✅' : '❌'}</p>
      <p>State: {voice.status.fullDuplexState}</p>
      <button onClick={() => voice.speak("Bonjour !")}>
        Speak
      </button>
      <button onClick={() => voice.interrupt()}>
        Interrupt
      </button>
    </div>
  );
}
```

**That's it!** TITANE∞ will now:
- ✅ Listen while speaking
- ✅ Detect interruptions
- ✅ Stop TTS automatically
- ✅ Adapt AI responses

---

## 🎯 USAGE PATTERNS

### Pattern 1: Conversation with Interruptions

```typescript
const voice = useVoiceEngine({ fullDuplexMode: true });

// Start conversation
await voice.startTurn();

// User speaks: "Titane, quelle heure est-il ?"
// AI responds (TTS starts)
// User interrupts: "Stop !"

// ✅ TTS stops automatically
// ✅ AI receives interruption context
// ✅ New response generated
```

---

### Pattern 2: Barge-In During Long Monologue

```typescript
// AI speaking long response...
await voice.speak(`
  La capitale de la France est Paris.
  Elle compte environ 2,2 millions d'habitants...
  (long text continues)
`);

// User interrupts mid-sentence: "Attends, et Lyon ?"

// ✅ Volume ducks to 30%
// ✅ If user continues → TTS stops
// ✅ AI pivots to Lyon topic
```

---

### Pattern 3: Manual Interruption

```typescript
// Programmatic interrupt
await voice.interrupt();

// Inject interruption with text
await voice.injectInterruption("Je veux parler d'autre chose");
```

---

## 🔧 ADVANCED CONFIGURATION

### Custom Barge-In Sensitivity

```typescript
import { bargeInDetector } from '@/services/voice/bargeInDetector';

// Configure detector
const detector = new BargeInDetector({
  hardInterruptThreshold: 0.12,  // Lower = more sensitive
  softInterruptThreshold: 0.06,
  echoThreshold: 0.7,
  windowSizeMs: 200
});
```

---

### Custom Ducking Behavior

```typescript
import { ttsDuckingEngine } from '@/services/voice/ttsDuckingEngine';

const ducking = new TTSDuckingEngine({
  duckLevel: 0.2,           // 20% volume (lower = more aggressive)
  transitionSpeed: 100,     // Faster transition
  autoReleaseDelay: 1500    // Wait longer before releasing
});
```

---

### Custom Interruption Handling

```typescript
import { chatInterruptionHandler } from '@/services/chat/chatInterruptionHandler';

// Enable interruption-aware chat
chatInterruptionHandler.enable();

// Handle interruption
const context = chatInterruptionHandler.handleInterruption(
  "Non attends, je veux savoir...",  // User text
  "La capitale est Paris...",         // Interrupted AI message
  0.5                                 // 50% through message
);

// Get system message for AI
const systemMsg = chatInterruptionHandler.generateSystemMessage(context);
// → "[INTERRUPTION - REDIRECTION] L'utilisateur a interrompu..."
```

---

## 📊 MONITORING

### Check Full Duplex State

```typescript
const voice = useVoiceEngine({ fullDuplexMode: true });

console.log('Full Duplex Enabled:', voice.status.fullDuplexMode);
console.log('Current State:', voice.status.fullDuplexState);
// → 'idle' | 'listening' | 'speaking' | 'full_duplex' | 'interruption'

console.log('Is Speaking:', voice.status.isSpeaking);
console.log('Is Listening:', voice.status.isListening);
```

---

### Subscribe to Events

```typescript
import { fullDuplexOrchestrator } from '@/services/voice/fullDuplexOrchestrator';

const unsubscribe = fullDuplexOrchestrator.onEvent((event) => {
  console.log('Full Duplex Event:', event.type);
  console.log('State:', event.state);

  if (event.type === 'interrupt') {
    console.log('Barge-in detected:', event.bargeInEvent);
  }
});

// Cleanup
return unsubscribe;
```

---

## 🧪 TESTING

### Test 1: Hard Interrupt

```typescript
// Start speaking
await voice.speak("Texte très long qui prend du temps...");

// Wait 1 second
await sleep(1000);

// Interrupt
await voice.interrupt();

// Expected: TTS stops in < 200ms
```

---

### Test 2: Soft Barge

```typescript
// Start speaking
await voice.speak("Longue explication...");

// Simulate soft speech (low volume)
// Expected: Volume ducks to 30%

// Check ducking state
expect(ttsDuckingEngine.isDucked()).toBe(true);
expect(ttsDuckingEngine.getCurrentVolume()).toBe(0.3);
```

---

### Test 3: Full Duplex Flow

```typescript
const voice = useVoiceEngine({ fullDuplexMode: true });

// Enable
await voice.enableFullDuplex();
expect(voice.status.fullDuplexMode).toBe(true);

// Start speaking
await voice.startSpeaking("Test...");
expect(voice.status.fullDuplexState).toBe('full_duplex');

// Start listening (parallel)
await voice.startListening();
expect(voice.status.isSpeaking).toBe(true);
expect(voice.status.isListening).toBe(true);

// Interrupt
await voice.interrupt();
expect(voice.status.fullDuplexState).toBe('interruption');
```

---

## 🐛 TROUBLESHOOTING

### Issue: Full Duplex Not Working

**Check**:
```typescript
// 1. Verify enabled
console.log('Enabled:', voice.status.fullDuplexMode);

// 2. Check orchestrator
import { fullDuplexOrchestrator } from '@/services/voice/fullDuplexOrchestrator';
console.log('Orchestrator enabled:', fullDuplexOrchestrator.isEnabled());

// 3. Enable manually if needed
await voice.enableFullDuplex();
```

---

### Issue: Interruptions Not Detected

**Check**:
```typescript
// 1. Verify barge-in detector initialized
import { bargeInDetector } from '@/services/voice/bargeInDetector';

// 2. Check microphone stream
const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
await bargeInDetector.initialize(stream);

// 3. Test sensitivity
const detector = new BargeInDetector({
  hardInterruptThreshold: 0.08,  // Lower threshold (more sensitive)
});
```

---

### Issue: Echo Problems

**Check**:
```typescript
// 1. Verify anti-echo shield active
import { antiEchoShield } from '@/services/voice/antiEchoShield';
console.log('Should block:', antiEchoShield.shouldBlockListening());

// 2. Check echo threshold
const detector = new BargeInDetector({
  echoThreshold: 0.8,  // Higher = stricter echo filtering
});
```

---

### Issue: TTS Not Stopping

**Check**:
```typescript
// 1. Verify auto-stop enabled
import { fullDuplexOrchestrator } from '@/services/voice/fullDuplexOrchestrator';
console.log('Config:', fullDuplexOrchestrator.config);

// 2. Force stop
await voice.stopSpeaking();

// 3. Check TTS state
import { hybridTTS } from '@/services/tts/hybridTTS';
const status = await hybridTTS.getStatus();
console.log('TTS speaking:', status.speaking);
```

---

## 📈 PERFORMANCE TIPS

### Optimize Audio Processing

```typescript
// 1. Reduce FFT size for faster analysis
const detector = new BargeInDetector({
  // Smaller window = faster but less accurate
  windowSizeMs: 150,  // Default: 200
});

// 2. Disable VAD if not needed
const detector = new BargeInDetector({
  useVAD: false,  // Skip VAD processing
});
```

---

### Reduce False Positives

```typescript
// Increase confidence threshold
const detector = new BargeInDetector({
  confidenceThreshold: 0.75,  // Default: 0.6
});

// Stricter echo filtering
const detector = new BargeInDetector({
  echoThreshold: 0.8,  // Default: 0.7
});
```

---

## 🎓 BEST PRACTICES

### ✅ DO

- ✅ Enable full duplex mode explicitly
- ✅ Handle interruption context in AI prompts
- ✅ Subscribe to events for UI updates
- ✅ Test with different microphone setups
- ✅ Tune thresholds for your environment

### ❌ DON'T

- ❌ Forget to disable full duplex on unmount
- ❌ Ignore barge-in events
- ❌ Set thresholds too low (false positives)
- ❌ Skip anti-echo shield integration
- ❌ Use full duplex without microphone permissions

---

## 📚 NEXT STEPS

1. **Read Full Documentation**: `SUPER_PROMPT_VIII_FULL_DUPLEX_v∞.5_COMPLETE.md`
2. **Explore Examples**: Check `src/services/voice/` for implementation details
3. **Customize**: Adjust thresholds and behaviors for your use case
4. **Test**: Run manual tests with real microphone input

---

**Full Duplex Overlap Mode — Ready to Use!** 🚀

