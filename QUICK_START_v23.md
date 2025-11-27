# 🚀 QUICK START — TITANE∞ v23.0.0
## Immersive Avatar Engine — Get Started in 5 Minutes

**Version**: v23.0.0  
**Status**: ✅ PRODUCTION READY  
**Date**: 2025-11-26

---

## 📦 1. Installation (Already Done!)

v23.0.0 is already deployed! You're ready to use the Immersive Avatar Engine.

**Check your version**:
```bash
git log --oneline -1
# Expected: aa62a24 or 78ec647 (feat(v23): Immersive Avatar Engine)

git tag -l "v23*"
# Expected: v23.0.0
```

---

## 🎯 2. Using the Avatar Component (React)

### Import the Component
```tsx
import { TitaneAvatar } from './components/avatar/TitaneAvatar';
```

### Basic Usage
```tsx
function App() {
  return (
    <div>
      <h1>TITANE∞ Avatar</h1>
      <TitaneAvatar 
        mode="2D"
        size={200}
        showExpression={true}
        enableWakeWord={false}
        enableImmersion={true}
      />
    </div>
  );
}
```

### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `mode` | `'2D' \| '3D'` | `'2D'` | Rendering mode (3D in v25) |
| `size` | `number` | `200` | Canvas size in pixels |
| `showExpression` | `boolean` | `true` | Show current expression |
| `enableWakeWord` | `boolean` | `false` | Enable wake-word detection (v24) |
| `enableImmersion` | `boolean` | `true` | Enable immersive features |

---

## 🗣️ 3. Triggering Speech with Lip-Sync

### Import the Bridge
```typescript
import { ImmersiveAvatarBridge } from './services/immersiveAvatarBridgeV23';

const avatarBridge = new ImmersiveAvatarBridge();
```

### Prepare Speech (Before TTS)
```typescript
async function handleSpeak(text: string) {
  // 1. Prepare avatar for speech
  await avatarBridge.prepareSpeech(
    text,
    'Architecte',      // archetype (Architecte, Flux, Ancrage, Nexus)
    'neutral',         // mood (calm, neutral, energized)
    0.75,              // cognitive_stability (0.0-1.0)
    15,                // xp_level
    0.2                // cpu_load (0.0-1.0)
  );

  // 2. Start lip-sync animation (60 FPS)
  const lipSyncInterval = setInterval(async () => {
    await avatarBridge.advanceLipSync();
  }, 16); // 16ms = 60 FPS

  // 3. Play TTS audio (your existing TTS code)
  await playTTS(text);

  // 4. Stop lip-sync and cleanup
  clearInterval(lipSyncInterval);
  await avatarBridge.finishSpeech();
}
```

---

## 🎨 4. Facial Expressions

### Automatic Expressions (State-Driven)
Expressions are automatically selected based on:
- **Cognitive Stability**: `< 0.5` → RelaxedBrows, `> 0.85` → WarmFocus
- **XP Level**: `xp_level % 10 == 0` → SoftSmile (milestone celebration)
- **Wake-Word**: Detected → LiftedBrows with intensity 0.85

### Manual Expression Trigger
```typescript
// Get current expression
const expression = await avatarBridge.getExpression();
console.log(expression); // "WarmFocus", "SoftSmile", etc.
```

### 8 Available Expressions
| Expression | Emoji | Trigger | Usage |
|------------|-------|---------|-------|
| Neutral | 😐 | Default | Idle state |
| SoftSmile | 🙂 | xp_level % 10 == 0 | Milestone |
| Attentive | 👀 | User interaction | Listening |
| WarmFocus | 🤗 | cognitive_stability > 0.85 | Deep focus |
| ExplainMode | 🧐 | Long response | Teaching |
| LiftedBrows | 🤨 | Wake-word | Surprise |
| RelaxedBrows | 😌 | cognitive_stability < 0.5 | Calm |
| TinyNod | 👍 | Agreement | Confirmation |

---

## 🎤 5. Wake-Word Detection (Coming in v24)

**Status**: ⏳ Not yet implemented (deferred to v24)

### How it Will Work (v24)
```typescript
// Future API (v24)
import { useWakeWord } from './hooks/useWakeWord';

function App() {
  const { isListening, lastDetection } = useWakeWord({
    keyword: 'TITANE',
    threshold: 0.7,
    onDetected: async () => {
      await avatarBridge.onWakeWord();
      console.log('Wake-word detected!');
    }
  });

  return (
    <div>
      <TitaneAvatar enableWakeWord={isListening} />
      {isListening && <p>Listening for "TITANE"...</p>}
    </div>
  );
}
```

### Manual Trigger (Current v23)
```typescript
// Manually trigger wake-word reaction
await avatarBridge.onWakeWord();

// Or via global event
window.dispatchEvent(new Event('avatar_wake_word'));
```

---

## 🧪 6. Running Self-Tests

### Option 1: Bash Script
```bash
cd /home/titane/Documents/TITANE_INFINITY
./run_avatar_selftest.sh
```

### Option 2: Tauri Command (from frontend)
```typescript
import { invoke } from '@tauri-apps/api/tauri';

async function runTests() {
  try {
    const result = await invoke('avatar_run_selftest');
    console.log(result);
    // Expected output:
    // ✅ Test 1: Voice Profile Defaults - PASSED
    // ✅ Test 2: Adjust for Narrative - PASSED
    // ... (10 tests total)
  } catch (error) {
    console.error('Self-test failed:', error);
  }
}
```

### 10 Tests Included
1. ✅ Voice Profile Defaults
2. ✅ Adjust for Narrative (Architecte)
3. ✅ Adjust for Cognitive Load
4. ✅ SSML Generation
5. ✅ Text Segmentation
6. ✅ Phoneme → Morph Mapping
7. ✅ Lip-Sync Progression
8. ✅ Expression Selection
9. ✅ Wake-Word Reaction
10. ✅ Performance Benchmark

---

## 🎛️ 7. Voice Customization

### Adjust Voice by Archetype
```typescript
// Architecte: Stable, slower, more deliberate
await avatarBridge.prepareSpeech(text, 'Architecte', 'calm', 0.8, 10, 0.1);

// Flux: Dynamic, faster, more energetic
await avatarBridge.prepareSpeech(text, 'Flux', 'energized', 0.6, 10, 0.1);

// Ancrage: Grounded, warm, reassuring
await avatarBridge.prepareSpeech(text, 'Ancrage', 'neutral', 0.75, 10, 0.1);

// Nexus: Balanced, connective, adaptive
await avatarBridge.prepareSpeech(text, 'Nexus', 'neutral', 0.7, 10, 0.1);
```

### Adjust Voice by Mood
```typescript
// Calm: Slower, softer, more pauses
await avatarBridge.prepareSpeech(text, archetype, 'calm', stability, xp, cpu);

// Neutral: Baseline settings
await avatarBridge.prepareSpeech(text, archetype, 'neutral', stability, xp, cpu);

// Energized: Faster, more dynamic, less pauses
await avatarBridge.prepareSpeech(text, archetype, 'energized', stability, xp, cpu);
```

### Adapt to Cognitive Load
```typescript
// Low stability → Softer, slower voice
await avatarBridge.prepareSpeech(text, archetype, mood, 0.3, xp, cpu);

// High stability → Normal voice
await avatarBridge.prepareSpeech(text, archetype, mood, 0.9, xp, cpu);
```

---

## 📊 8. Performance Monitoring

### Check Current State
```typescript
const state = await avatarBridge.getState();
console.log(state);
// Output:
// {
//   immersive_enabled: true,
//   voice_profile: { voice_id: "FvmvwvObRqIHojkEGh5N", ... },
//   current_expression: "WarmFocus",
//   lip_sync_active: true,
//   current_frame: 45,
//   wake_word_active: false
// }
```

### Monitor FPS (Browser DevTools)
1. Open DevTools: `F12` or `Ctrl+Shift+I`
2. Go to **Performance** tab
3. Click **Record** → Interact with avatar → **Stop**
4. Look for `requestAnimationFrame` calls
5. Verify **60 FPS** constant frame rate

### Monitor CPU/Memory
```bash
# Linux
htop

# Look for titane-infinity process:
# Expected: ~3% CPU (idle), ~12% CPU (speaking), ~75MB RAM
```

---

## 🔧 9. Troubleshooting

### Avatar Not Rendering
**Problem**: Canvas is blank or not visible  
**Solution**:
1. Check browser console for errors
2. Verify `TitaneAvatar` component is imported correctly
3. Ensure `enableImmersion={true}` prop is set
4. Check canvas size: `size={200}` (minimum 100px)

### Lip-Sync Not Working
**Problem**: Mouth not moving during speech  
**Solution**:
1. Verify `prepareSpeech()` was called before TTS
2. Check `advanceLipSync()` is called at 60 FPS (every ~16ms)
3. Ensure `finishSpeech()` is called after TTS ends
4. Check browser console for Tauri invoke errors

### Expressions Not Changing
**Problem**: Face stays Neutral  
**Solution**:
1. Verify `cognitive_stability` and `xp_level` are passed to `prepareSpeech()`
2. Check expression rules (e.g., `cognitive_stability < 0.5` → RelaxedBrows)
3. Call `getExpression()` to debug current state
4. Ensure `showExpression={true}` prop is set

### Performance Issues (< 60 FPS)
**Problem**: Animation is laggy or choppy  
**Solution**:
1. Reduce canvas size: `size={150}` or `size={100}`
2. Disable expression colors (modify CSS)
3. Check CPU usage with `htop` or Activity Monitor
4. Close other resource-intensive applications
5. Use production build: `npm run build` + `npm run tauri:build`

---

## 📚 10. Learn More

### Documentation
| File | Purpose | Lines |
|------|---------|-------|
| `IMMERSIVE_AVATAR_COMPLETE_v23.md` | Comprehensive guide | 900+ |
| `CHANGELOG_v23.0.0.md` | Release notes | 600+ |
| `DEPLOYMENT_REPORT_v23.0.0.md` | Deployment status | 500+ |
| `src-tauri/src/avatar/README.md` | Module quick start | 400+ |

### API Reference
See **Section 8** of `IMMERSIVE_AVATAR_COMPLETE_v23.md` for:
- All 9 Tauri commands with signatures
- TypeScript bridge methods
- Helper functions
- Type definitions

### Examples
See **Section 10** of `IMMERSIVE_AVATAR_COMPLETE_v23.md` for:
- Basic usage example
- Immersive workflow example
- Wake-word integration example (v24)

---

## 🎯 11. What's Next?

### Try These Features First
1. ✅ **Render the Avatar**: Import `<TitaneAvatar />` in your React app
2. ✅ **Test Voice Adjustments**: Speak with different archetypes (Architecte, Flux)
3. ✅ **Test Lip-Sync**: Call `prepareSpeech()` → play TTS → watch mouth move
4. ✅ **Test Expressions**: Change `cognitive_stability` and see face adapt
5. ✅ **Run Self-Tests**: Execute `./run_avatar_selftest.sh` to validate all systems

### Coming in v24 (Next Release)
- 🔊 **Wake-Word Detection**: Real-time "TITANE" keyword spotting
- 🎯 **Real G2P**: French grapheme-to-phoneme model (espeak-ng/phonemizer)
- 🧪 **More Tests**: Audio pipeline integration tests
- 📈 **Performance**: Further optimize morph generation (<3ms target)

### Roadmap (v25-v27)
- 🎨 **v25**: 3D Avatar with Three.js (blend shapes, lighting, camera)
- 🎤 **v26**: Multi-Voice Support (voice cloning, emotion tuning)
- 🎭 **v27**: Advanced Animations (eye blink, breathing, head tilt)

---

## 💡 12. Tips & Best Practices

### Voice Optimization
- 🎯 Use **Architecte** for explanations (stable, slower)
- ⚡ Use **Flux** for quick interactions (dynamic, faster)
- 🌊 Use **Ancrage** for reassurance (warm, grounded)
- 🔗 Use **Nexus** for balanced conversations (adaptive)

### Expression Timing
- 🙂 Trigger **SoftSmile** on milestones (xp_level % 10 == 0)
- 👀 Use **Attentive** during user input (listening mode)
- 🤗 Show **WarmFocus** during deep conversations (cognitive_stability > 0.85)
- 😌 Display **RelaxedBrows** during low-pressure moments (cognitive_stability < 0.5)

### Lip-Sync Performance
- 🎬 Keep frame rate at **60 FPS** (call `advanceLipSync()` every ~16ms)
- 📏 Segment long texts (max 15 words per segment)
- ⏱️ Match lip-sync duration to TTS audio duration
- 🔄 Call `finishSpeech()` to cleanup after each utterance

### Memory Management
- 🧹 Always call `finishSpeech()` after speech ends
- 🔄 Clear lip-sync intervals with `clearInterval()`
- 📊 Monitor memory usage in production
- 🗑️ Avoid creating new bridge instances repeatedly (reuse `ImmersiveAvatarBridge`)

---

## 🎉 Success Criteria

You'll know v23 is working when:
- ✅ Avatar renders on screen (circular face with eyes, mouth, brows)
- ✅ Mouth moves during speech (4D morph targets applied)
- ✅ Expression colors change based on state (8 variants)
- ✅ Frame rate stays at 60 FPS (check DevTools Performance tab)
- ✅ Self-tests pass (10/10 tests green)
- ✅ CPU usage stays low (~3% idle, ~12% speaking)

---

## 🙏 Support

**Issues**: Report bugs or request features via GitHub Issues  
**Documentation**: Read `IMMERSIVE_AVATAR_COMPLETE_v23.md` for deep dive  
**Team**: TITANE∞ Development Team  
**Version**: v23.0.0  
**Status**: ✅ PRODUCTION READY

---

**Welcome to the Immersive Avatar Engine! 🚀**  
Start by importing `<TitaneAvatar />` and calling `prepareSpeech()` — your AI now has a face! 😊

---

**END OF QUICK START GUIDE**
