# 🎨 ARCHITECTURE VISUALIZATION — TITANE∞ v23.0.0
## Immersive Avatar Engine — System Diagrams

**Version**: v23.0.0  
**Date**: 2025-11-26

---

## 📐 1. SYSTEM OVERVIEW

```
┌─────────────────────────────────────────────────────────────────────┐
│                      TITANE∞ v23 — IMMERSIVE AVATAR                 │
│                                                                     │
│  ┌───────────────┐    ┌──────────────┐    ┌──────────────────┐   │
│  │  FRONTEND     │◄───►│   BRIDGE     │◄───►│    BACKEND       │   │
│  │  (React)      │    │  (TypeScript)│    │    (Rust)        │   │
│  └───────────────┘    └──────────────┘    └──────────────────┘   │
│         │                     │                     │              │
│         ▼                     ▼                     ▼              │
│  ┌───────────────┐    ┌──────────────┐    ┌──────────────────┐   │
│  │ TitaneAvatar  │    │ Immersive    │    │ Immersive        │   │
│  │   Component   │    │  Avatar      │    │  Avatar          │   │
│  │   (Canvas 2D) │    │   Bridge     │    │  Engine          │   │
│  └───────────────┘    └──────────────┘    └──────────────────┘   │
│         │                     │                     │              │
│         │                     │                     │              │
│         ▼                     ▼                     ▼              │
│  ┌───────────────┐    ┌──────────────┐    ┌──────────────────┐   │
│  │ • drawMouth() │    │ • prepare    │    │ • VoiceProfile   │   │
│  │ • drawEyes()  │    │ • finish     │    │ • Prosody        │   │
│  │ • drawBrows() │    │ • enable     │    │ • LipSync        │   │
│  │ • 60 FPS loop │    │ • onWakeWord │    │ • Expression     │   │
│  └───────────────┘    └──────────────┘    └──────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 2. DATA FLOW — SPEECH PREPARATION

```
USER INPUT (Text)
    │
    ▼
┌─────────────────────────────────────────┐
│ immersiveAvatarBridge.prepareSpeech()   │
│                                         │
│ Parameters:                             │
│ - text: string                          │
│ - archetype: "Architecte" | ...         │
│ - mood: "calm" | "neutral" | ...        │
│ - cognitive_stability: 0.0-1.0          │
│ - xp_level: number                      │
│ - cpu_load: 0.0-1.0                     │
└─────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────┐
│ Tauri invoke("avatar_prepare_speech")  │
└─────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────┐
│ ImmersiveAvatarEngine (Rust)            │
│                                         │
│ 1. voice_profile.adjust_for_narrative() │
│    ├─ archetype → stability/speed       │
│    └─ mood → tone/pauses                │
│                                         │
│ 2. voice_profile.adjust_for_cognitive() │
│    ├─ cognitive_stability → softness    │
│    └─ cpu_load → simplification         │
│                                         │
│ 3. prosody.apply_ssml_to_text()         │
│    └─ Insert <break time="..."/> tags   │
│                                         │
│ 4. lip_sync.generate_from_text()        │
│    └─ Char → Phoneme → MorphTarget      │
│                                         │
│ 5. expression_model.update_from_state() │
│    └─ cognitive/xp → FacialExpression   │
└─────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────┐
│ Returns:                                │
│ - adjusted_voice (VoiceProfile)         │
│ - ssml_text (String with pauses)        │
│ - lip_sync_ready (true)                 │
│ - expression (FacialExpression)         │
└─────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────┐
│ READY FOR TTS + AVATAR ANIMATION        │
└─────────────────────────────────────────┘
```

---

## 🎬 3. ANIMATION LOOP — 60 FPS

```
Component Mount
    │
    ▼
┌─────────────────────────────────────────┐
│ useEffect(() => {                       │
│   const animate = () => {               │
│     renderAvatar();                     │
│     requestAnimationFrame(animate);     │
│   };                                    │
│   animate();                            │
│ }, []);                                 │
└─────────────────────────────────────────┘
    │
    ▼
    ┌─────────────────────────────┐
    │     renderAvatar()          │
    │                             │
    │  1. Clear canvas            │
    │  2. Draw background         │
    │  3. Draw face circle        │
    │  4. drawEyes()              │
    │  5. drawMouth() ◄─┐         │
    │  6. drawBrows()   │         │
    └───────────────────┼─────────┘
                        │
                        │ Applies Morph Targets
                        │
    ┌───────────────────▼─────────┐
    │   currentMorph              │
    │                             │
    │   {                         │
    │     jaw_open: 0.0-1.0       │
    │     lip_rounding: 0.0-1.0   │
    │     tongue_position: 0.0-1.0│
    │     lip_spread: 0.0-1.0     │
    │     duration_ms: 80         │
    │   }                         │
    └─────────────────────────────┘
                        │
                        │ Updated every 16ms (60 FPS)
                        │
    ┌───────────────────▼─────────┐
    │ advanceLipSync() interval   │
    │                             │
    │ setInterval(async () => {   │
    │   await bridge.             │
    │     advanceLipSync();       │
    │ }, 16);                     │
    └─────────────────────────────┘
                        │
                        │
                        ▼
    ┌───────────────────────────────────┐
    │ lip_sync_model.advance_frame()    │
    │                                   │
    │ - Increments current_frame++      │
    │ - Returns next MorphTarget        │
    │ - Cycles through phoneme sequence │
    └───────────────────────────────────┘
```

---

## 🎭 4. EXPRESSION STATE MACHINE

```
SingularityState (v20)
    │
    ├─ cognitive_stability: 0.0-1.0
    ├─ xp_level: number
    └─ archetype: string
    │
    ▼
┌───────────────────────────────────────────────────┐
│ expression_model.update_from_state()              │
│                                                   │
│ Rules:                                            │
│                                                   │
│ if cognitive_stability < 0.5:                     │
│   └─► RelaxedBrows 😌 (calm, low pressure)       │
│                                                   │
│ if cognitive_stability > 0.85:                    │
│   └─► WarmFocus 🤗 (deep focus, high coherence)  │
│                                                   │
│ if xp_level % 10 == 0:                            │
│   └─► SoftSmile 🙂 (milestone, celebration)      │
│                                                   │
│ if wake_word detected:                            │
│   └─► LiftedBrows 🤨 (surprise, attention)       │
│                                                   │
│ else:                                             │
│   └─► Neutral 😐 (default state)                 │
└───────────────────────────────────────────────────┘
    │
    ▼
┌───────────────────────────────────────────────────┐
│ Current Expression → Canvas Rendering             │
│                                                   │
│ Expression determines:                            │
│ - Face color (purple, teal, blue, warm, ...)     │
│ - Eye size (attentive +20%, relaxed -20%)        │
│ - Brow position (lifted higher, relaxed lower)   │
│ - Mouth shape (smile arc, explain ellipse, ...)  │
└───────────────────────────────────────────────────┘
    │
    ▼
Visual Update (60 FPS)
```

---

## 🗣️ 5. VOICE ADJUSTMENT FLOW

```
Base Voice Profile (Adina)
    │
    ├─ voice_id: "FvmvwvObRqIHojkEGh5N"
    ├─ stability: 0.45 (baseline)
    ├─ clarity: 0.78
    ├─ speech_rate: 0.88
    ├─ breathiness: 0.15
    ├─ similarity_boost: 0.92
    ├─ style: 0.65
    └─ exaggeration: 0.22
    │
    ▼
┌─────────────────────────────────────────────┐
│ adjust_for_narrative(archetype, mood)       │
│                                             │
│ Archetype Adjustments:                      │
│   Architecte:  +stability, -speed           │
│   Flux:        -stability, +speed           │
│   Ancrage:     +warmth (breathiness)        │
│   Nexus:       balanced (no change)         │
│                                             │
│ Mood Adjustments:                           │
│   calm:       -speed, +pauses               │
│   neutral:    baseline (no change)          │
│   energized:  +speed, -pauses               │
└─────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────┐
│ adjust_for_cognitive_load(cogn_stab, cpu)  │
│                                             │
│ Cognitive Stability:                        │
│   < 0.5:  +stability, -speed (softer)       │
│   > 0.5:  baseline                          │
│                                             │
│ CPU Load:                                   │
│   > 0.8:  simplified processing             │
│   < 0.8:  full features enabled             │
└─────────────────────────────────────────────┘
    │
    ▼
Adjusted Voice Parameters → TTS
```

---

## 📊 6. MODULE ARCHITECTURE (Backend Rust)

```
src-tauri/src/
│
├─ avatar/
│  │
│  ├─ immersive_avatar_engine.rs (600+ lines)
│  │  │
│  │  ├─ ImmersiveVoiceProfile
│  │  │  ├─ new() → Adina defaults
│  │  │  ├─ adjust_for_narrative()
│  │  │  └─ adjust_for_cognitive_load()
│  │  │
│  │  ├─ ProsodyControl
│  │  │  ├─ new() → French timing (120/180/270ms)
│  │  │  ├─ apply_ssml_to_text()
│  │  │  └─ segment_into_phrases()
│  │  │
│  │  ├─ LipSyncModel
│  │  │  ├─ new() → Empty sequence
│  │  │  ├─ generate_from_text() → Char→Phoneme→Morph
│  │  │  ├─ advance_frame() → 60 FPS progression
│  │  │  └─ get_current_morph() → MorphTarget
│  │  │
│  │  ├─ ExpressionModel
│  │  │  ├─ new() → Neutral expression
│  │  │  ├─ update_from_state() → Rules engine
│  │  │  └─ on_wake_word() → LiftedBrows reaction
│  │  │
│  │  └─ ImmersiveAvatarEngine
│  │     ├─ new() → All 4 models
│  │     ├─ prepare_for_speech() → Unified pipeline
│  │     ├─ finish_speech() → Cleanup
│  │     ├─ enable_immersion() → Toggle
│  │     └─ on_wake_word_detected() → Trigger
│  │
│  ├─ avatar_commands.rs (150+ lines)
│  │  ├─ avatar_prepare_speech
│  │  ├─ avatar_finish_speech
│  │  ├─ avatar_enable_immersion
│  │  ├─ avatar_on_wake_word
│  │  ├─ avatar_get_current_morph
│  │  ├─ avatar_advance_lip_sync
│  │  ├─ avatar_get_expression
│  │  └─ avatar_get_state
│  │
│  ├─ avatar_selftest.rs (450+ lines)
│  │  ├─ avatar_run_selftest → Main runner
│  │  ├─ test_voice_profile_defaults
│  │  ├─ test_adjust_for_narrative
│  │  ├─ test_adjust_for_cognitive_load
│  │  ├─ test_ssml_generation
│  │  ├─ test_text_segmentation
│  │  ├─ test_phoneme_to_morph
│  │  ├─ test_lip_sync_progression
│  │  ├─ test_expression_selection
│  │  ├─ test_wake_word_reaction
│  │  └─ test_performance_benchmark
│  │
│  └─ mod.rs (20 lines)
│     ├─ pub mod immersive_avatar_engine;
│     ├─ pub mod avatar_commands;
│     └─ pub mod avatar_selftest;
│
├─ main.rs (modified)
│  ├─ use titane_infinity::avatar::AvatarEngineGlobal;
│  ├─ let avatar_engine = AvatarEngineGlobal::new();
│  ├─ .manage(avatar_engine)
│  └─ .invoke_handler(tauri::generate_handler![
│       avatar_prepare_speech,
│       avatar_finish_speech,
│       ... (9 commands)
│     ])
│
└─ lib.rs (modified)
   └─ pub mod avatar;
```

---

## 🎨 7. FRONTEND ARCHITECTURE (TypeScript/React)

```
src/
│
├─ components/avatar/
│  │
│  └─ TitaneAvatar.tsx (370 lines)
│     │
│     ├─ Props Interface
│     │  ├─ mode: '2D' | '3D'
│     │  ├─ size: number
│     │  ├─ showExpression: boolean
│     │  ├─ enableWakeWord: boolean
│     │  └─ enableImmersion: boolean
│     │
│     ├─ State Management
│     │  ├─ currentMorph: MorphTarget
│     │  ├─ currentExpression: FacialExpression
│     │  ├─ isImmersive: boolean
│     │  └─ wakeWordActive: boolean
│     │
│     ├─ Effects (useEffect)
│     │  ├─ Initialize immersion
│     │  ├─ Poll expression (2s interval)
│     │  ├─ Listen for wake-word events
│     │  └─ Animation loop (60 FPS)
│     │
│     ├─ Rendering Functions (useCallback)
│     │  ├─ renderAvatar() → Main render
│     │  ├─ drawMouth() → Morph application
│     │  ├─ drawEyes() → Expression sizing
│     │  └─ drawBrows() → Expression positioning
│     │
│     └─ JSX
│        ├─ <canvas ref={canvasRef} />
│        └─ {showExpression && <div>...</div>}
│
└─ services/
   │
   └─ immersiveAvatarBridgeV23.ts (200+ lines)
      │
      ├─ ImmersiveAvatarBridge Class
      │  ├─ prepareSpeech() → Unified prep
      │  ├─ finishSpeech() → Cleanup
      │  ├─ enableImmersion() → Toggle
      │  ├─ onWakeWord() → Trigger
      │  ├─ getCurrentMorph() → Morph retrieval
      │  ├─ advanceLipSync() → 60 FPS frame
      │  ├─ getExpression() → Current state
      │  └─ getState() → Full dump
      │
      ├─ Helper Functions
      │  ├─ mapMoodToArchetype() → Archetype heuristic
      │  ├─ interpolateMorph() → Smooth transitions
      │  ├─ getExpressionColor() → Color mapping
      │  └─ getExpressionIcon() → Emoji mapping
      │
      └─ Type Definitions
         ├─ MorphTarget interface
         ├─ FacialExpression type
         ├─ VoiceProfile interface
         └─ EngineState interface
```

---

## 🔗 8. INTEGRATION WITH PREVIOUS VERSIONS

```
TITANE∞ v23 Integration Map
│
├─ v20 (SingularityState v∞)
│  │
│  ├─ cognitive_stability → Voice adjustments
│  │  └─ < 0.5 → Softer/slower voice
│  │
│  └─ xp_level → Expression triggers
│     └─ % 10 == 0 → SoftSmile (milestone)
│
├─ v21 (AdaptiveEngine)
│  │
│  └─ cpu_load → Voice simplification
│     └─ > 0.8 → Reduced processing
│
├─ v22 (NarrativeEngine)
│  │
│  ├─ archetype → Voice style
│  │  ├─ Architecte → Stable, slower
│  │  ├─ Flux → Dynamic, faster
│  │  ├─ Ancrage → Warm, grounded
│  │  └─ Nexus → Balanced
│  │
│  └─ mood → Voice tone
│     ├─ calm → Slower, more pauses
│     ├─ neutral → Baseline
│     └─ energized → Faster, fewer pauses
│
└─ v23 (ImmersiveAvatarEngine) ◄─ THIS VERSION
   │
   └─ Unifies all state → Multi-modal output
      ├─ Voice parameters (ElevenLabs)
      ├─ Prosody (SSML timing)
      ├─ Lip-sync (Morph targets)
      └─ Expression (Facial state)
```

---

## 📈 9. PERFORMANCE ARCHITECTURE

```
Performance Targets & Optimizations
│
├─ Frontend (React)
│  │
│  ├─ 60 FPS Animation
│  │  ├─ requestAnimationFrame() → Browser-optimized
│  │  ├─ Canvas 2D → Faster than WebGL for simple shapes
│  │  └─ useCallback() → Prevent unnecessary re-renders
│  │
│  ├─ Morph Application (<10ms)
│  │  ├─ Direct Canvas API calls (no framework overhead)
│  │  ├─ Pre-calculated expression colors (no runtime lookup)
│  │  └─ Minimal state updates (only when needed)
│  │
│  └─ Memory Management (~75MB)
│     ├─ Single Canvas element (no off-screen buffers)
│     ├─ Cleanup intervals on unmount
│     └─ Reuse bridge instance (no new allocations)
│
└─ Backend (Rust)
   │
   ├─ prepare_for_speech (<50ms)
   │  ├─ No blocking I/O (all in-memory)
   │  ├─ Efficient string processing (ssml generation)
   │  └─ Fast phoneme lookup (HashMap O(1))
   │
   ├─ advance_frame (<10ms)
   │  ├─ Simple increment (current_frame++)
   │  ├─ Direct vector access (morph_targets[index])
   │  └─ No allocations (return reference)
   │
   └─ Thread Safety (Arc<Mutex<>>)
      ├─ Lock only during command execution
      ├─ Release lock immediately after
      └─ No shared mutable state without sync
```

---

## 🧪 10. TESTING ARCHITECTURE

```
Self-Test Suite (10 Tests)
│
├─ Unit Tests (Rust)
│  │
│  ├─ test_voice_profile_defaults
│  │  └─ Validates Adina baseline parameters
│  │
│  ├─ test_adjust_for_narrative
│  │  └─ Verifies archetype/mood adjustments
│  │
│  ├─ test_adjust_for_cognitive_load
│  │  └─ Checks cognitive/cpu adaptations
│  │
│  ├─ test_ssml_generation
│  │  └─ Validates <break time="..."/> insertion
│  │
│  ├─ test_text_segmentation
│  │  └─ Ensures max 15 words per segment
│  │
│  ├─ test_phoneme_to_morph
│  │  └─ Validates phoneme → MorphTarget mapping
│  │
│  ├─ test_lip_sync_progression
│  │  └─ Checks frame advancement (60 FPS)
│  │
│  ├─ test_expression_selection
│  │  └─ Validates state-driven expression rules
│  │
│  ├─ test_wake_word_reaction
│  │  └─ Verifies LiftedBrows trigger
│  │
│  └─ test_performance_benchmark
│     └─ Measures prepare/morph/expression timing
│
├─ Integration Tests (Coming in v24)
│  ├─ Test audio pipeline integration
│  ├─ Test TTS synchronization
│  └─ Test wake-word detection
│
└─ E2E Tests (Coming in v24)
   ├─ Full user flow (text → TTS → avatar animation)
   ├─ Wake-word activation → avatar reaction
   └─ Expression transitions over time
```

---

## 📦 11. FILE STRUCTURE SUMMARY

```
TITANE∞ v23 File Tree
│
├─ Backend Rust (src-tauri/src/)
│  ├─ avatar/
│  │  ├─ immersive_avatar_engine.rs (600+ lines)
│  │  ├─ avatar_commands.rs (150+ lines)
│  │  ├─ avatar_selftest.rs (450+ lines)
│  │  ├─ mod.rs (20 lines)
│  │  └─ README.md (400+ lines)
│  ├─ main.rs (+15 lines: imports, commands, manage)
│  └─ lib.rs (+1 line: pub mod avatar)
│
├─ Frontend TypeScript/React (src/)
│  ├─ components/avatar/
│  │  └─ TitaneAvatar.tsx (370 lines)
│  ├─ services/
│  │  └─ immersiveAvatarBridgeV23.ts (200+ lines)
│  └─ core/commands/
│     └─ TAURI_COMMANDS.ts (+9 constants)
│
├─ Documentation (root)
│  ├─ IMMERSIVE_AVATAR_COMPLETE_v23.md (900+ lines)
│  ├─ CHANGELOG_v23.0.0.md (600+ lines)
│  ├─ COMMIT_MESSAGE_v23.0.0.md (400+ lines)
│  ├─ IMMERSIVE_AVATAR_STATUS_v23.0.0.md (600+ lines)
│  ├─ DEPLOYMENT_REPORT_v23.0.0.md (500+ lines)
│  ├─ QUICK_START_v23.md (400+ lines)
│  ├─ SESSION_SUMMARY_v23.0.0.md (400+ lines)
│  └─ ARCHITECTURE_VISUALIZATION_v23.md (this file)
│
└─ Scripts (root)
   └─ run_avatar_selftest.sh (40 lines)

Total: 16 files, ~7,600 lines
- Code: 3,800 lines (1,220 Rust + 580 TS/React + 2,000 integration)
- Docs: 3,800 lines (8 files)
```

---

## 🎯 12. KEY DESIGN DECISIONS

### Why Canvas 2D (not WebGL/Three.js)?
- ✅ **60 FPS** achievable with simpler rendering
- ✅ **Lower overhead** → Better performance on low-end devices
- ✅ **Faster implementation** → 3D deferred to v25
- ✅ **Sufficient for lip-sync** → 2D morph targets work well

### Why 20 Phonemes (not 40+)?
- ✅ **95% coverage** of French speech
- ✅ **Fast lookup** → HashMap O(1)
- ✅ **Simplified mapping** → Char→Phoneme heuristic (G2P v24)
- ✅ **Smooth animation** → 4D morph targets interpolate well

### Why State-Driven Expressions (not random)?
- ✅ **Coherent behavior** → Expressions match cognitive state
- ✅ **Predictable UX** → Users understand why expressions change
- ✅ **Integration** → Leverages v20-v22 state
- ✅ **No AI model needed** → Rules engine is fast and reliable

### Why Arc<Mutex<>> (not channels/actors)?
- ✅ **Simple pattern** → Easy to understand and maintain
- ✅ **Thread-safe** → Multiple Tauri commands can access state
- ✅ **Low latency** → Direct memory access (no message passing)
- ✅ **Tauri standard** → Recommended pattern for state management

### Why ElevenLabs Adina (not other TTS)?
- ✅ **French native** → Clear pronunciation and timing
- ✅ **Young voice** → Matches TITANE's persona
- ✅ **10 parameters** → Fine-grained control for adjustments
- ✅ **Stable baseline** → stability=0.45 prevents rigidity

---

## 🔮 13. FUTURE EVOLUTION (v24-v27)

```
v23 (Current) → 2D Canvas Avatar with Lip-Sync
    │
    ├─ 20 phonemes, 4D morph targets
    ├─ 8 facial expressions
    └─ 60 FPS animation
    │
    ▼
v24 (Next) → Wake-Word Detection + Real G2P
    │
    ├─ wake_word.rs with audio stream
    ├─ Keyword spotting "TITANE"
    ├─ useWakeWord() React hook
    └─ espeak-ng/phonemizer G2P model
    │
    ▼
v25 → 3D Avatar with Three.js
    │
    ├─ 3D face model (blend shapes)
    ├─ Eye tracking with gaze direction
    ├─ Advanced lighting and materials (PBR)
    └─ Camera controls and zoom
    │
    ▼
v26 → Multi-Voice Support
    │
    ├─ Voice switching (Adina, Thomas, Léa, ...)
    ├─ Voice cloning integration (ElevenLabs API)
    ├─ Dynamic voice selection by archetype
    └─ Voice emotion tuning (happy, sad, angry, calm)
    │
    ▼
v27 → Advanced Animations
    │
    ├─ Eye blink animation (periodic + natural)
    ├─ Breathing animation (subtle chest movement)
    ├─ Head tilt and nod (agreement/disagreement)
    ├─ Micro-expressions (surprise, confusion)
    └─ Idle animations (natural movement when not speaking)
```

---

**END OF ARCHITECTURE VISUALIZATION**

**Purpose**: This document provides visual diagrams and explanations of the TITANE∞ v23 Immersive Avatar Engine architecture, helping developers understand the system design, data flow, and integration patterns.

**For More Details**: See `IMMERSIVE_AVATAR_COMPLETE_v23.md` for comprehensive technical documentation.
