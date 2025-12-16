# 🏗️ TITANE∞ Architecture Consolidation Plan

**Target**: Reduce from 14-20 components to 9 unified modules

---

## 🎯 Target Architecture (9 Modules)

### Ring 0: Core (3 modules)

1. **Singularity Kernel** - src/core/kernel/
   - State management, invariants
   - Consolidate: core/, kernel/, state/

2. **Cognitive Engine** - src/core/engines/
   - All cognitive engines unified
   - Consolidate: engines/, cognitive/

3. **Memory OS** - src/core/memory/
   - Unified memory persistence
   - Consolidate: memory/, storage/, persistence/

### Ring 1: Services (3 modules)

4. **AI Services** - src/services/ai/
   - Multi-provider AI (OpenAI, Gemini, Ollama)
   - Consolidate: openai/, gemini/, ollama/, ai-config/

5. **Voice Services** - src/services/voice/
   - TTS, STT, prosody
   - Consolidate: tts/, voice/, audio/, parler-tts/

6. **Visual Engine** - src/services/visual/
   - Avatar, halo, visual semantics
   - Consolidate: avatar/, visual/, halo/, three-js/

### Ring 2: Interface (3 modules)

7. **Chat UI** - src/modules/chat/
   - Unified chat interface
   - Consolidate: components/chat/, features/chat/, hooks/chat-related/

8. **DevTools** - src/modules/devtools/
   - Single DevTools module (case-sensitive fix)
   - Consolidate: devtools/, DevTools/, apps/devtools/

9. **Presence OS** - src/modules/presence/
   - HoloPresence, embodiment
   - Consolidate: presence/, holopresence/, embodiment/

---

## 🔧 Consolidation Steps

### Phase 1: DevTools (P0 - Critical)

**Problem**: Duplicate directories `devtools/` and `DevTools/`
**Solution**:

1. Compare implementations
2. Keep best code in `src/modules/devtools/`
3. Update all imports
4. Delete duplicate

**Estimated Time**: 2 hours
**Impact**: High (build errors, confusion)

### Phase 2: Chat (P0 - Critical)

**Problem**: Chat scattered across `components/chat/`, `features/chat/`, multiple hooks
**Solution**:

1. Create `src/modules/chat/` structure:
   ```
   chat/
   ├── ui/           # React components
   ├── services/     # Business logic
   ├── hooks/        # Custom hooks
   └── store/        # State management
   ```
2. Move all chat-related code
3. Update imports globally

**Estimated Time**: 3 hours
**Impact**: High (central feature)

### Phase 3: Audio/Voice (P1 - High)

**Problem**: Multiple audio/voice/tts directories
**Solution**:

1. Consolidate to `src/services/voice/`
2. Clear API: `VoiceService.speak()`, `VoiceService.listen()`

**Estimated Time**: 2 hours
**Impact**: Medium

### Phase 4: AI Services (P1 - High)

**Problem**: OpenAI, Gemini, Ollama in separate directories
**Solution**:

1. Create `src/services/ai/providers/`
2. Unified interface: `AIService.chat()`, `AIService.stream()`

**Estimated Time**: 2 hours
**Impact**: Medium

### Phase 5: Engines Consolidation (P2 - Medium)

**Problem**: Engines scattered
**Solution**:

1. Move all to `src/core/engines/`
2. Clear namespace

**Estimated Time**: 3 hours
**Impact**: Low (well isolated)

---

## 📊 Metrics

| Metric        | Before     | After      | Delta |
| ------------- | ---------- | ---------- | ----- |
| Components    | 14-20      | 9          | -40%  |
| Duplications  | 5+         | 0          | -100% |
| Import depth  | 4-5 levels | 2-3 levels | -40%  |
| Circular deps | TBD        | 0          | -100% |

---

## ✅ Success Criteria

- [ ] All duplications eliminated
- [ ] 9 clear modules (3 per ring)
- [ ] No circular dependencies
- [ ] Import depth ≤ 3 levels
- [ ] 100% tests passing after consolidation
- [ ] Build time < 60s
- [ ] Documentation updated

---

**Start with DevTools and Chat (P0) - These are causing immediate issues.**
