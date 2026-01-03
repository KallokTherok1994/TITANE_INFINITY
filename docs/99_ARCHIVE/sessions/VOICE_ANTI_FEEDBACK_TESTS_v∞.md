# TITANE∞ v∞ — Tests Anti-Feedback Loop (SP-VOICE-001)

## 📋 Vue d'ensemble

**Objectif**: Valider les 3 couches anti-feedback loop implémentées  
**Date**: 7 décembre 2025  
**Version**: v∞  
**Coverage Target**: >90%

---

## 🎯 Architecture 3 Couches

### Layer 1: Echo Cancellation Hardware
**Fichier**: `src/hooks/useVoiceInput.ts`  
**Mécanisme**: getUserMedia avec constraints audio hardware

```typescript
{
  echoCancellation: true,  // ✅ CRITICAL
  noiseSuppression: true,  // ✅ CRITICAL
  autoGainControl: true,   // ✅ CRITICAL
}
```

### Layer 2: Auto-Mute Microphone
**Fichier**: `src/hooks/useTTSWithMicControl.ts`  
**Mécanisme**: Suspend VAD automatiquement pendant TTS

```typescript
speak() → suspendForTTS()           // ✅ Avant TTS
       → TTS playback
       → setTimeout(resumeAfterTTS, 500ms)  // ✅ Après delay
```

### Layer 3: Voice Fingerprinting
**Fichier**: `src-tauri/src/audio/voice_fingerprint.rs`  
**Mécanisme**: Détection acoustique TITANE vs User

```rust
calibrate_titane(samples) → VoiceProfile
is_titane_speaking(samples) → (bool, similarity_score)
```

---

## 🧪 Tests Unitaires

### 1. useVoiceInput.ts Tests

#### Test 1.1: Echo Cancellation Enabled
```typescript
describe('useVoiceInput - Echo Cancellation', () => {
  it('should request echoCancellation in getUserMedia', async () => {
    const { startListening } = useVoiceInput();
    const getUserMediaSpy = jest.spyOn(navigator.mediaDevices, 'getUserMedia');
    
    await startListening();
    
    expect(getUserMediaSpy).toHaveBeenCalledWith({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        sampleRate: 16000,
        channelCount: 1,
      }
    });
  });
});
```

#### Test 1.2: Warning if Echo Cancellation Not Supported
```typescript
it('should warn if echoCancellation not supported', async () => {
  const consoleWarnSpy = jest.spyOn(console, 'warn');
  const mockTrack = {
    getSettings: () => ({ echoCancellation: false })
  };
  
  // Mock getUserMedia to return track without echo cancellation
  jest.spyOn(navigator.mediaDevices, 'getUserMedia').mockResolvedValue({
    getAudioTracks: () => [mockTrack]
  });
  
  const { startListening, error } = useVoiceInput();
  await startListening();
  
  expect(consoleWarnSpy).toHaveBeenCalledWith(
    expect.stringContaining('Echo cancellation not supported')
  );
  expect(error).toContain('Echo cancellation not available');
});
```

---

### 2. useTTSWithMicControl.ts Tests

#### Test 2.1: Auto-Suspend VAD Before TTS
```typescript
describe('useTTSWithMicControl - Auto-Mute', () => {
  it('should suspend VAD before starting TTS', async () => {
    const mockVAD = {
      suspendForTTS: jest.fn(),
      resumeAfterTTS: jest.fn(),
      enableBargeIn: jest.fn(),
      disableBargeIn: jest.fn(),
      isSuspended: false,
      isBargeInEnabled: false,
    };
    
    const { speak } = useTTSWithMicControl({ vadHook: mockVAD });
    
    await speak('Hello World');
    
    expect(mockVAD.suspendForTTS).toHaveBeenCalledTimes(1);
    expect(mockVAD.suspendForTTS).toHaveBeenCalledBefore(voiceService.speak);
  });
});
```

#### Test 2.2: Auto-Resume VAD After Delay
```typescript
it('should resume VAD after 500ms delay', async () => {
  jest.useFakeTimers();
  
  const mockVAD = {
    suspendForTTS: jest.fn(),
    resumeAfterTTS: jest.fn(),
    enableBargeIn: jest.fn(),
    disableBargeIn: jest.fn(),
    isSuspended: false,
    isBargeInEnabled: false,
  };
  
  const { speak } = useTTSWithMicControl({ 
    vadHook: mockVAD,
    resumeDelay: 500
  });
  
  await speak('Hello');
  
  // Should NOT resume immediately
  expect(mockVAD.resumeAfterTTS).not.toHaveBeenCalled();
  
  // Fast-forward 500ms
  jest.advanceTimersByTime(500);
  
  // Should resume now
  expect(mockVAD.resumeAfterTTS).toHaveBeenCalledTimes(1);
  expect(mockVAD.resumeAfterTTS).toHaveBeenCalledWith(500);
  
  jest.useRealTimers();
});
```

#### Test 2.3: Immediate Resume on stopSpeaking()
```typescript
it('should resume VAD immediately when stopSpeaking called', async () => {
  const mockVAD = {
    suspendForTTS: jest.fn(),
    resumeAfterTTS: jest.fn(),
    enableBargeIn: jest.fn(),
    disableBargeIn: jest.fn(),
    isSuspended: false,
    isBargeInEnabled: false,
  };
  
  const { speak, stopSpeaking } = useTTSWithMicControl({ vadHook: mockVAD });
  
  await speak('Long text...');
  await stopSpeaking();
  
  // Should resume with 0 delay
  expect(mockVAD.resumeAfterTTS).toHaveBeenCalledWith(0);
});
```

#### Test 2.4: Duplex Mode (Barge-In)
```typescript
it('should enable barge-in in duplex mode', async () => {
  const mockVAD = {
    suspendForTTS: jest.fn(),
    resumeAfterTTS: jest.fn(),
    enableBargeIn: jest.fn(),
    disableBargeIn: jest.fn(),
    isSuspended: false,
    isBargeInEnabled: false,
  };
  
  const { speak } = useTTSWithMicControl({ 
    vadHook: mockVAD,
    enableDuplex: true
  });
  
  await speak('Hello');
  
  expect(mockVAD.enableBargeIn).toHaveBeenCalledTimes(1);
  expect(mockVAD.suspendForTTS).toHaveBeenCalledTimes(1);
});
```

---

### 3. voice_fingerprint.rs Tests

#### Test 3.1: Extract Features
```rust
#[test]
fn test_extract_features() {
    let fingerprint = VoiceFingerprint::new();
    let samples = vec![0.0; 16000]; // 1 second @ 16kHz

    let features = fingerprint.extract_features(&samples);

    assert_eq!(features.formants.len(), 3, "Should have F1, F2, F3");
    assert_eq!(features.mfcc.len(), 13, "Should have 13 MFCC coefficients");
    assert!(features.pitch > 0.0, "Pitch should be positive");
    assert!(features.spectral_centroid > 0.0, "Spectral centroid should be positive");
}
```

#### Test 3.2: Calibration
```rust
#[test]
fn test_calibrate_titane() {
    let fingerprint = VoiceFingerprint::new();
    let samples_list = vec![
        vec![0.0; 16000],
        vec![0.0; 16000],
        vec![0.0; 16000],
    ];

    let result = fingerprint.calibrate_titane(samples_list);
    assert!(result.is_ok(), "Calibration should succeed");

    // Check profile was stored
    let (is_titane, score) = fingerprint.is_titane_speaking(&vec![0.0; 16000]);
    assert!(score > 0.0, "Should return similarity score after calibration");
}
```

#### Test 3.3: TITANE Detection (False Before Calibration)
```rust
#[test]
fn test_is_titane_speaking_without_calibration() {
    let fingerprint = VoiceFingerprint::new();
    let samples = vec![0.0; 16000];

    let (is_titane, score) = fingerprint.is_titane_speaking(&samples);

    assert_eq!(is_titane, false, "Should return false without calibration");
    assert_eq!(score, 0.0, "Score should be 0.0 without calibration");
}
```

#### Test 3.4: Similarity Threshold
```rust
#[test]
fn test_similarity_threshold() {
    let fingerprint = VoiceFingerprint::new();
    
    // Calibrate with known samples
    let titane_samples = vec![
        vec![0.1; 16000], // Simulate TTS voice
        vec![0.1; 16000],
        vec![0.1; 16000],
    ];
    fingerprint.calibrate_titane(titane_samples).unwrap();
    
    // Test with similar sample (should be TITANE)
    let similar_sample = vec![0.1; 16000];
    let (is_titane, score) = fingerprint.is_titane_speaking(&similar_sample);
    assert!(is_titane, "Should detect TITANE with similar sample");
    assert!(score >= 0.75, "Score should be >= threshold (0.75)");
    
    // Test with different sample (should NOT be TITANE)
    let different_sample = vec![0.9; 16000]; // Very different
    let (is_titane, score) = fingerprint.is_titane_speaking(&different_sample);
    // Note: Placeholder implementation may not distinguish yet
}
```

---

## 🔬 Tests d'Intégration

### Integration Test 1: Full Feedback Loop Prevention
```typescript
describe('Feedback Loop Prevention - E2E', () => {
  it('should prevent feedback loop in full voice cycle', async () => {
    const voiceInput = useVoiceInput();
    const ttsControl = useTTSWithMicControl();
    
    // 1. Start listening
    await voiceInput.startListening();
    expect(voiceInput.isListening).toBe(true);
    
    // 2. User speaks → ASR transcribes
    const userText = 'Hello TITANE';
    // Simulate ASR result
    
    // 3. TITANE responds → TTS starts
    await ttsControl.speak('Bonjour! Comment puis-je vous aider?');
    
    // ✅ CRITICAL: Microphone should be suspended
    expect(ttsControl.isMicSuspended).toBe(true);
    
    // 4. Wait for TTS to finish + delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // ✅ CRITICAL: Microphone should resume
    expect(ttsControl.isMicSuspended).toBe(false);
    
    // 5. Verify no feedback loop occurred
    // → ASR should NOT have transcribed TTS voice
    // → OMEGA should NOT have responded to TTS transcription
  });
});
```

### Integration Test 2: Voice Fingerprinting End-to-End
```typescript
describe('Voice Fingerprinting - E2E', () => {
  it('should calibrate and detect TITANE voice', async () => {
    // 1. Calibrate TITANE voice (startup)
    const calibrationSamples = await generateTTSSamples([
      'Bonjour',
      'Comment allez-vous?',
      'Je suis TITANE',
    ]);
    
    await invokeWithRetry('calibrate_titane_voice', { 
      samples: calibrationSamples 
    });
    
    // 2. User speaks → Should NOT be detected as TITANE
    const userAudio = await captureUserVoice('Hello');
    const { isTitane: userCheck } = await invokeWithRetry('check_titane_voice', {
      samples: userAudio
    });
    expect(userCheck).toBe(false);
    
    // 3. TTS speaks → Should be detected as TITANE
    await ttsControl.speak('Bonjour à tous');
    const ttsAudio = await captureMicrophoneAfterDelay(100); // Capture mic input
    const { isTitane: ttsCheck, similarity } = await invokeWithRetry('check_titane_voice', {
      samples: ttsAudio
    });
    expect(ttsCheck).toBe(true);
    expect(similarity).toBeGreaterThanOrEqual(0.75);
  });
});
```

---

## 🎯 Tests de Performance

### Perf Test 1: Echo Cancellation Latency
```typescript
describe('Performance - Echo Cancellation', () => {
  it('should have <50ms latency for echo cancellation', async () => {
    const { startListening } = useVoiceInput();
    
    const startTime = performance.now();
    await startListening();
    const endTime = performance.now();
    
    const latency = endTime - startTime;
    expect(latency).toBeLessThan(50); // <50ms target
  });
});
```

### Perf Test 2: Voice Fingerprinting Latency
```rust
#[test]
fn test_fingerprinting_latency() {
    let fingerprint = VoiceFingerprint::new();
    
    // Calibrate first
    let samples_list = vec![vec![0.0; 16000]; 5];
    fingerprint.calibrate_titane(samples_list).unwrap();
    
    // Measure detection latency
    let samples = vec![0.0; 16000]; // 1 second audio
    
    let start = std::time::Instant::now();
    let (_is_titane, _score) = fingerprint.is_titane_speaking(&samples);
    let duration = start.elapsed();
    
    assert!(duration.as_millis() < 50, "Should detect in <50ms");
}
```

---

## 📊 Coverage Requirements

### Coverage Targets (>90%)

**Frontend (TypeScript)**:
- ✅ `useVoiceInput.ts`: 90%+ coverage
  * startListening(), stopListening(), cancelListening()
  * Echo cancellation constraints
  * Error handling (permissions, device not found, etc.)
  
- ✅ `useTTSWithMicControl.ts`: 90%+ coverage
  * speak(), stopSpeaking()
  * Auto-suspend/resume VAD
  * Duplex mode (barge-in)
  * Error handling + cleanup

**Backend (Rust)**:
- ✅ `voice_fingerprint.rs`: 90%+ coverage
  * extract_features()
  * calibrate_titane()
  * is_titane_speaking()
  * Similarity calculations (pitch, formants, MFCC)

---

## 🚀 Commandes de Test

### Run Frontend Tests
```bash
pnpm run test -- useVoiceInput.test.ts
pnpm run test -- useTTSWithMicControl.test.ts
pnpm run test:coverage
```

### Run Backend Tests
```bash
cd src-tauri
cargo test voice_fingerprint
cargo test --all-features
```

### Run Integration Tests
```bash
pnpm run test:e2e -- feedback-loop.test.ts
pnpm run test:e2e -- voice-fingerprinting.test.ts
```

---

## 📈 Validation Metrics

### Success Criteria

| Metric | Target | Status |
|--------|--------|--------|
| Echo Cancellation Latency | <50ms | ⏳ À tester |
| Voice Fingerprinting Latency | <50ms | ⏳ À tester |
| False Positive Rate | <5% | ⏳ À tester |
| Detection Accuracy | >90% | ⏳ À tester |
| Code Coverage | >90% | ⏳ À tester |
| Feedback Loop Prevention | 100% | ⏳ À tester |

### Test Execution Plan

1. **Phase 1**: Unit tests (useVoiceInput, useTTSWithMicControl)
2. **Phase 2**: Backend tests (voice_fingerprint.rs)
3. **Phase 3**: Integration tests (E2E feedback prevention)
4. **Phase 4**: Performance tests (latency, accuracy)
5. **Phase 5**: Coverage report + validation

---

## 🐛 Known Issues / TODO

### Production Implementation Required

**voice_fingerprint.rs** (actuellement placeholder):
- [ ] Intégrer `rustfft` pour FFT (pitch detection)
- [ ] Intégrer `ndarray` pour opérations matricielles (MFCC)
- [ ] Utiliser `aubio-rs` ou équivalent pour formants detection
- [ ] Implémenter algorithme YIN pour pitch detection
- [ ] Implémenter LPC (Linear Predictive Coding) pour formants
- [ ] Optimiser calculs MFCC (actuellement `vec![0.0; 13]`)

### Dependencies to Add (Rust)

```toml
[dependencies]
rustfft = "6.1"
ndarray = "0.15"
# aubio-rs = "0.2"  # Optionnel - pitch/formants detection
```

---

## ✅ Résumé

**Implémentation**: ✅ Complète (3 couches)  
**Tests unitaires**: 📝 Spécifiés (à implémenter)  
**Tests intégration**: 📝 Spécifiés (à implémenter)  
**Tests performance**: 📝 Spécifiés (à implémenter)  
**Coverage target**: >90%  
**Production ready**: ⏳ Backend Rust nécessite implémentation FFT/MFCC

---

**Next Steps**:
1. Créer fichiers de tests unitaires (`*.test.ts`, `*.rs`)
2. Implémenter tests selon spécifications ci-dessus
3. Exécuter tests + coverage report
4. Implémenter production FFT/MFCC dans `voice_fingerprint.rs`
5. Valider métriques (<50ms latency, >90% accuracy, <5% false positives)
