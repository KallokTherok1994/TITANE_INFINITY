# 🚀 QUICKSTART — Autonomic Voice Agent v∞.7

**TITANE_INFINITY** — Voice Persona Kernel
Guide démarrage rapide (15 minutes)

---

## 🎯 Objectif

Intégrer le système Voice Persona dans votre pipeline vocal en 3 étapes.

---

## 📦 Step 1: Import Components

```typescript
// src/hooks/useVoiceEngine.ts

import {
  emotionalStateEstimator,
  type EmotionalState,
} from '@/services/voice/emotionalStateEstimator';

import {
  vocalMicroFXEngine,
  type MicroExpression,
} from '@/services/voice/vocalMicroFXEngine';

import {
  autonomicReactionEngine,
  type AutonomicReaction,
} from '@/services/voice/autonomicReactionEngine';
```

---

## 🔧 Step 2: Extend Voice Engine Status

```typescript
// Ajouter au VoiceEngineStatus existant
export interface VoiceEngineStatus {
  // ...existing fields (state, transcript, etc.)

  // Nouveaux champs v∞.7
  emotionalState?: EmotionalState;
  lastReaction?: AutonomicReaction;
  microExpressionsEnabled: boolean;
}
```

---

## ⚡ Step 3: Integrate in Voice Pipeline

### Option A: Simple Integration (Recommended)

```typescript
// Dans startTurn() ou completeTurn()

// 1. Analyze emotion from transcript
const emotionState = emotionalStateEstimator.analyzeText(transcript);

// Update status
setStatus(prev => ({ ...prev, emotionalState: emotionState }));

// 2. Generate autonomic reaction (optional, instant feedback)
const reaction = autonomicReactionEngine.generateAutonomicReaction(
  emotionState,
  transcript
);

if (reaction && reaction.shouldSpeak) {
  // Speak reaction immediately (< 500ms)
  await hybridTTS.speak(reaction.text, { rate: 1.1, volume: 1.0 });

  // Update status
  setStatus(prev => ({ ...prev, lastReaction: reaction }));
}

// 3. Continue with AI processing
const aiResponse = await chatEngine.processMessage(transcript, {
  // Pass emotional context to AI (optional)
  emotionalContext: {
    mood: emotionState.mood,
    energy: emotionState.energy,
    valence: emotionState.valence,
  },
});

// 4. Enhance AI response with micro-expressions
const enhancedResponse = vocalMicroFXEngine.injectMicroExpressions(
  aiResponse,
  emotionState,
  {
    isQuestionResponse: emotionState.intention === 'question',
    isLongResponse: aiResponse.length > 200,
  }
);

// 5. Speak final response
await hybridTTS.speak(enhancedResponse);
```

### Option B: Advanced Integration (with Prosody)

```typescript
// 1. Analyze emotion
const emotionState = emotionalStateEstimator.analyzeText(transcript);

// 2. Autonomic reaction
const reaction = autonomicReactionEngine.generateAutonomicReaction(
  emotionState,
  transcript
);

if (reaction && reaction.shouldSpeak) {
  await hybridTTS.speak(reaction.text, { rate: 1.1 });
}

// 3. AI processing
const aiResponse = await chatEngine.processMessage(transcript, {
  emotionalContext: emotionState,
});

// 4. Generate prosody profile (v∞.7 to be enhanced)
const prosody = prosodyEngine.generateProsodyStyle(emotionState, {
  text: aiResponse,
});

// 5. Inject micro-expressions
const enhancedResponse = vocalMicroFXEngine.injectMicroExpressions(
  aiResponse,
  emotionState,
  {
    isQuestionResponse: emotionState.intention === 'question',
    isLongResponse: aiResponse.length > 200,
  }
);

// 6. Speak with prosody
await hybridTTS.speak(enhancedResponse, {
  rate: prosody.speed,
  pitch: prosody.pitch,
  volume: prosody.volume,
  // Note: breathiness, warmth, etc. require Parler-TTS
});
```

---

## 🧪 Step 4: Test It!

### Test 1: Emotion Detection

```typescript
// Manual test in console
import { emotionalStateEstimator } from '@/services/voice/emotionalStateEstimator';

const state1 = emotionalStateEstimator.analyzeText("Je suis super content !");
console.log(state1);
// Expected: { mood: 'happy', energy: 0.75, valence: 0.8, ... }

const state2 = emotionalStateEstimator.analyzeText("Je me sens pas bien...");
console.log(state2);
// Expected: { mood: 'sad', energy: 0.3, valence: -0.7, ... }

const state3 = emotionalStateEstimator.analyzeText("Comment ça marche ?");
console.log(state3);
// Expected: { mood: 'curious', intention: 'question', ... }
```

### Test 2: Autonomic Reactions

```typescript
import { autonomicReactionEngine } from '@/services/voice/autonomicReactionEngine';

const emotion = emotionalStateEstimator.analyzeText("J'ai trouvé !!!");
const reaction = autonomicReactionEngine.generateAutonomicReaction(
  emotion,
  "J'ai trouvé !!!"
);

console.log(reaction);
// Expected: { type: 'excitement', text: 'Oh ! Génial !', shouldSpeak: true, ... }
```

### Test 3: Micro-Expressions

```typescript
import { vocalMicroFXEngine } from '@/services/voice/vocalMicroFXEngine';

const emotion = emotionalStateEstimator.analyzeText("Explique-moi ça");
const original = "Voici comment ça fonctionne. C'est très simple en fait.";
const enhanced = vocalMicroFXEngine.injectMicroExpressions(original, emotion);

console.log(enhanced);
// Expected: "Hmm... Voici comment ça fonctionne. Donc c'est très simple en fait."
```

---

## ⚙️ Step 5: Configuration (Optional)

### Customize Micro-Expression Frequency

```typescript
import { vocalMicroFXEngine } from '@/services/voice/vocalMicroFXEngine';

// More frequent micro-expressions
vocalMicroFXEngine.updateConfig({
  frequency: 0.6, // Default: 0.4 (40%)
});

// Less frequent (formal mode)
vocalMicroFXEngine.updateConfig({
  frequency: 0.2, // 20%
  relationshipProximity: 0.2, // Formal
});

// Very close relationship (casual, lots of micro-expressions)
vocalMicroFXEngine.updateConfig({
  frequency: 0.7,
  relationshipProximity: 0.9,
});
```

### Customize Autonomic Reactions

```typescript
import { autonomicReactionEngine } from '@/services/voice/autonomicReactionEngine';

// Proactive mode (more reactions)
autonomicReactionEngine.updateConfig({
  proactiveMode: true, // React 50% of the time
});

// Conservative mode (fewer reactions)
autonomicReactionEngine.updateConfig({
  minConfidence: 0.7, // Higher threshold
  reactionCooldownMs: 5000, // 5s cooldown
});

// High reactivity (immediate feedback)
autonomicReactionEngine.updateConfig({
  minConfidence: 0.4,
  reactionCooldownMs: 1000, // 1s cooldown
  proactiveMode: true,
});
```

### Customize Emotional Analysis

```typescript
import { emotionalStateEstimator } from '@/services/voice/emotionalStateEstimator';

// Create custom instance (instead of singleton)
const customEstimator = new EmotionalStateEstimator({
  textWeight: 0.6,      // Prioritize text over audio
  audioWeight: 0.3,     // Lower audio weight
  historyWeight: 0.1,
  historySize: 20,      // Larger history
  minConfidence: 0.4,
});
```

---

## 🎨 Step 6: UI Integration (Optional)

### Display Emotional State

```typescript
// src/components/VoiceStatus.tsx

import { useVoiceEngine } from '@/hooks/useVoiceEngine';

function VoiceStatus() {
  const { status } = useVoiceEngine();
  const emotion = status.emotionalState;

  if (!emotion) return null;

  return (
    <div className="voice-status">
      <div className="mood-indicator">
        <span className="mood-emoji">{getMoodEmoji(emotion.mood)}</span>
        <span className="mood-label">{emotion.mood}</span>
      </div>

      <div className="emotion-metrics">
        <div className="metric">
          Energy: <strong>{(emotion.energy * 100).toFixed(0)}%</strong>
        </div>
        <div className="metric">
          Valence: <strong>{emotion.valence > 0 ? '+' : ''}{(emotion.valence * 100).toFixed(0)}%</strong>
        </div>
        <div className="metric">
          Intention: <strong>{emotion.intention}</strong>
        </div>
      </div>

      {status.lastReaction && (
        <div className="last-reaction">
          Last reaction: "{status.lastReaction.text}"
        </div>
      )}
    </div>
  );
}

function getMoodEmoji(mood: string): string {
  const emojis: Record<string, string> = {
    happy: '😊',
    excited: '🤩',
    calm: '😌',
    curious: '🤔',
    focused: '🎯',
    tired: '😴',
    stressed: '😰',
    frustrated: '😤',
    sad: '😔',
    neutral: '😐',
  };
  return emojis[mood] || '🙂';
}
```

---

## 🔥 Common Patterns

### Pattern 1: Simple Conversation

```typescript
async function handleUserSpeech(transcript: string) {
  // 1. Emotion
  const emotion = emotionalStateEstimator.analyzeText(transcript);

  // 2. AI
  const response = await chatEngine.processMessage(transcript);

  // 3. Enhance
  const enhanced = vocalMicroFXEngine.injectMicroExpressions(response, emotion);

  // 4. Speak
  await hybridTTS.speak(enhanced);
}
```

### Pattern 2: Reactive Conversation

```typescript
async function handleUserSpeechReactive(transcript: string) {
  // 1. Emotion
  const emotion = emotionalStateEstimator.analyzeText(transcript);

  // 2. React immediately
  const reaction = autonomicReactionEngine.generateAutonomicReaction(emotion, transcript);
  if (reaction && reaction.shouldSpeak) {
    await hybridTTS.speak(reaction.text, { rate: 1.1 });
  }

  // 3. AI (in parallel with reaction)
  const response = await chatEngine.processMessage(transcript);

  // 4. Enhance + Speak
  const enhanced = vocalMicroFXEngine.injectMicroExpressions(response, emotion);
  await hybridTTS.speak(enhanced);
}
```

### Pattern 3: Full Duplex + Emotion

```typescript
async function handleFullDuplexWithEmotion(transcript: string) {
  // 1. Emotion
  const emotion = emotionalStateEstimator.analyzeText(transcript);

  // 2. Check if interrupt
  if (fullDuplexOrchestrator.state === 'speaking') {
    // User interrupted TTS
    if (emotion.intention === 'urgency' || emotion.energy > 0.8) {
      // Hard interrupt
      await fullDuplexOrchestrator.interrupt();

      // Autonomic reaction
      const reaction = autonomicReactionEngine.generateQuickReaction(emotion);
      if (reaction) {
        await hybridTTS.speak(reaction.text);
      }
    }
  }

  // 3. Continue normal flow
  const response = await chatEngine.processMessage(transcript, { emotionalContext: emotion });
  const enhanced = vocalMicroFXEngine.injectMicroExpressions(response, emotion);
  await hybridTTS.speak(enhanced);
}
```

---

## 🐛 Troubleshooting

### Issue 1: No reactions triggered

**Cause:** Confidence too low or cooldown active

**Solution:**
```typescript
autonomicReactionEngine.updateConfig({
  minConfidence: 0.4, // Lower threshold
  reactionCooldownMs: 1000, // Shorter cooldown
});
```

---

### Issue 2: Too many micro-expressions

**Cause:** Frequency too high

**Solution:**
```typescript
vocalMicroFXEngine.updateConfig({
  frequency: 0.2, // Reduce to 20%
});
```

---

### Issue 3: Emotion detection inaccurate

**Cause:** Text-only analysis less accurate

**Solution:**
- Wait for audio analysis integration (v∞.8)
- Or manually provide audio indicators:
```typescript
const emotion = emotionalStateEstimator.analyze(transcript, {
  avgPitch: 180,
  speechRate: 160,
  intensity: 0.7,
  // ...
});
```

---

### Issue 4: Reactions not natural

**Cause:** Relationship proximity too formal

**Solution:**
```typescript
autonomicReactionEngine.updateConfig({
  relationshipProximity: 0.8, // More casual
});

vocalMicroFXEngine.updateConfig({
  relationshipProximity: 0.8,
});
```

---

## ✅ Success Criteria

After integration, you should observe:

1. ✅ Emotional state detected correctly (> 75% accuracy)
2. ✅ Autonomic reactions triggered appropriately (not too often, not too rare)
3. ✅ Micro-expressions feel natural (not forced)
4. ✅ Voice tone adapts to user emotion (via prosody)
5. ✅ Conversation feels more "alive" and reactive
6. ✅ No performance impact (< 50ms overhead)

---

## 📚 Next Steps

1. **Test manually** avec conversations réelles
2. **Tune configuration** basée sur feedback
3. **Integrate prosody** dans hybridTTS (v∞.7+)
4. **Add audio analysis** (pitch, rate extraction) (v∞.8)
5. **Parler-TTS integration** pour breathiness, warmth (v∞.9)
6. **Long-term emotional memory** (v∞.10)

---

## 🔗 References

- **Architecture**: `SUPER_PROMPT_IX_AUTONOMIC_VOICE_v∞.7_COMPLETE.md`
- **Components**:
  - `src/services/voice/emotionalStateEstimator.ts`
  - `src/services/voice/vocalMicroFXEngine.ts`
  - `src/services/voice/autonomicReactionEngine.ts`
- **Integration**: `src/hooks/useVoiceEngine.ts` (to modify)

---

**🔥 TITANE_INFINITY v∞.7 — Autonomic Voice Agent**
*Quick Start: 15 minutes to living voice*
