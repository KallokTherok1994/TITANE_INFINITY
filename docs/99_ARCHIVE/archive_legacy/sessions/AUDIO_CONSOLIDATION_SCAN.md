# 🎵 AUDIO CONSOLIDATION - SCAN REPORT

**Date**: 2025-12-15  
**Mode**: YOLO AUTO  
**Status**: IN PROGRESS

---

## 📊 INITIAL SCAN

### Audio/Voice/TTS Files Found: 30

```
Types (3):
- src/types/ttsEngine.ts
- src/types/voice.ts
- src/types/audio.d.ts

Hooks (4+):
- src/hooks/useTTS.tsx
- src/hooks/useTTS.ts  ⚠️ DUPLICATE
- src/hooks/useTTSWithMicControl.ts
- src/hooks/useAudioChat.tsx

Components (4):
- src/components/tts/TTSControls.tsx
- src/components/tts/TTSButton.tsx
- src/components/test/ParlerTTSTestPanel.tsx

Stores (1):
- src/stores/useTTSEngineStore.ts

Services (15+):
Audio services:
- src/services/audio/audioHealthCheck.ts
- src/services/audio/audioStreaming.ts
- src/services/audio/audioAutoTest.ts
- src/services/audio/audioStateMachine.ts
- src/services/audio/audioSelfHeal.ts

TTS services:
- src/services/tts/ttsEngineService.ts
- src/services/tts/ttsEngine.config.ts
- src/services/tts/parlerTTSBridge.ts
- src/services/tts/hybridTTS.ts

Voice services:
- src/services/voice/voicePipelineTest.ts
- src/services/voice/ttsDuckingEngine.ts
- src/services/voice/emotionalTTS.ts

Engines (1):
- src/engines/voice/voiceProsodyEngine.ts

Tests (6):
- src/tests/voice/voiceArchitectureTests.ts
- src/tests/voice/voiceE2ETests.ts
- src/services/selftest/ttsSelfTest.ts
- src/services/selftest/ttsFunctionalTests.ts
```

---

## 🎯 IDENTIFIED DUPLICATIONS

### Critical Duplicates:

1. **useTTS hook**: .tsx vs .ts versions (NEEDS MERGE)
2. **TTS services**: Multiple TTS implementations (hybridTTS, parlerTTS, ttsEngine)
3. **Audio services**: 5 separate audio files (could modularize)

---

## 📈 CONSOLIDATION STRATEGY

### Phase 1: Hooks (HIGH PRIORITY)

- [ ] Merge useTTS.tsx + useTTS.ts → single canonical
- [ ] Keep: useTTSWithMicControl, useAudioChat (unique features)
- **Target**: 4 → 3 hooks (-25%)

### Phase 2: Services (MEDIUM PRIORITY)

- [ ] Consolidate audio/\* into modular audioService.ts
- [ ] Consolidate tts/\* into unified ttsService.ts
- [ ] Keep voice/\* separate (different concerns)
- **Target**: 15 → 8 services (-47%)

### Phase 3: Tests (LOW PRIORITY - KEEP)

- [ ] Tests are NOT duplicates, keep all
- [ ] 6 test files = good coverage

---

## 📊 EXPECTED IMPACT

| Category  | Before | After  | Reduction |
| --------- | ------ | ------ | --------- |
| Hooks     | 4      | 3      | -25%      |
| Services  | 15     | 8      | -47%      |
| Tests     | 6      | 6      | 0% (keep) |
| **Total** | **30** | **22** | **-27%**  |

---

**NEXT**: Analyze useTTS duplication, merge into canonical version
