# ⚙️ Configuration Avancée — Full Duplex v∞.5

**TITANE_INFINITY** — Full Duplex Overlap Engine
Guide complet de tuning et optimisation

---

## 🎛️ Table des Matières

1. [BargeInDetector Configuration](#bargeindetector-configuration)
2. [TTSDuckingEngine Configuration](#ttsduckingengine-configuration)
3. [FullDuplexOrchestrator Configuration](#fullduplexorchestrator-configuration)
4. [ChatInterruptionHandler Configuration](#chatinterruptionhandler-configuration)
5. [Environment-Specific Tuning](#environment-specific-tuning)
6. [Performance Optimization](#performance-optimization)
7. [Advanced Patterns](#advanced-patterns)

---

## 🎯 BargeInDetector Configuration

### Configuration complète

```typescript
import { BargeInDetector } from '@/services/voice/bargeInDetector';

const detector = new BargeInDetector({
  // 🔊 Amplitude Thresholds
  hardInterruptThreshold: 0.15,    // Hard stop: forte voix (default: 0.15)
  softInterruptThreshold: 0.08,    // Soft barge: voix douce (default: 0.08)
  overlapThreshold: 0.12,          // Overlap: voix moyenne (default: 0.12)

  // 🎼 Spectral Analysis
  fftSize: 2048,                   // FFT window size (512/1024/2048/4096)
  smoothingTimeConstant: 0.8,      // Analyzer smoothing (0-1, default: 0.8)

  // 🔇 Echo Filtering
  echoThreshold: 0.7,              // Spectral similarity threshold (default: 0.7)
  enableEchoFiltering: true,       // Enable/disable echo filter (default: true)

  // ⏱️ Timing
  slidingWindowMs: 200,            // Analysis window size (default: 200ms)
  minInterruptDuration: 300,       // Minimum interrupt duration (default: 300ms)

  // 🎙️ VAD (Voice Activity Detection)
  vadThreshold: 0.02,              // VAD RMS threshold (default: 0.02)
  zeroCrossingThreshold: 0.1,      // Zero-crossing rate threshold (default: 0.1)
});

// Initialize with media stream
const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
detector.initialize(stream);
```

### Tuning Guide

#### 🔊 Environnement Bruyant (Bureau, Café)
Augmenter thresholds pour réduire false positives:

```typescript
const detector = new BargeInDetector({
  hardInterruptThreshold: 0.20,    // ⬆️ +33%
  softInterruptThreshold: 0.12,    // ⬆️ +50%
  overlapThreshold: 0.15,          // ⬆️ +25%
  echoThreshold: 0.65,             // ⬇️ Plus strict
  slidingWindowMs: 300,            // ⬆️ Plus de stabilité
});
```

#### 🤫 Environnement Calme (Studio, Maison)
Réduire thresholds pour meilleure sensibilité:

```typescript
const detector = new BargeInDetector({
  hardInterruptThreshold: 0.12,    // ⬇️ -20%
  softInterruptThreshold: 0.05,    // ⬇️ -37%
  overlapThreshold: 0.08,          // ⬇️ -33%
  echoThreshold: 0.75,             // ⬆️ Plus permissif
  slidingWindowMs: 150,            // ⬇️ Plus réactif
});
```

#### 🎤 Microphone Faible Qualité
Ajuster FFT et smoothing:

```typescript
const detector = new BargeInDetector({
  fftSize: 1024,                   // ⬇️ Moins de détail
  smoothingTimeConstant: 0.9,      // ⬆️ Plus de lissage
  vadThreshold: 0.03,              // ⬆️ VAD moins sensible
  enableEchoFiltering: false,      // ⚠️ Peut causer issues
});
```

#### 🔊 Haut-parleurs Puissants (Echo Risk)
Renforcer echo filtering:

```typescript
const detector = new BargeInDetector({
  echoThreshold: 0.60,             // ⬇️ Très strict
  enableEchoFiltering: true,       // ✅ Obligatoire
  fftSize: 4096,                   // ⬆️ Plus de précision spectrale
  smoothingTimeConstant: 0.7,      // ⬇️ Moins de lissage
});
```

---

## 🔊 TTSDuckingEngine Configuration

### Configuration complète

```typescript
import { TTSDuckingEngine } from '@/services/voice/ttsDuckingEngine';

const engine = new TTSDuckingEngine({
  // 🎚️ Volume Levels
  defaultDuckLevel: 0.3,           // Duck target volume (0-1, default: 0.3)
  normalLevel: 1.0,                // Normal volume (default: 1.0)

  // ⏱️ Timing
  duckTransitionMs: 150,           // Duck transition time (default: 150ms)
  releaseTransitionMs: 500,        // Release transition time (default: 500ms)
  autoReleaseDelayMs: 1000,        // Auto-release delay (default: 1000ms)

  // 🎵 Audio Processing
  rampCurve: 'linear',             // 'linear' | 'exponential' (default: 'linear')
  enableAutoRelease: true,         // Auto-release after delay (default: true)
});

// Register TTS audio element
const audio = new Audio();
engine.registerAudioElement(audio);

// Manual ducking
await engine.applyDucking(0.2);  // 20% volume
await engine.releaseDucking();   // Back to 100%
```

### Tuning Guide

#### 🎧 Conversation Naturelle (Recommended)
Balance entre audibilité TTS et clarté utilisateur:

```typescript
const engine = new TTSDuckingEngine({
  defaultDuckLevel: 0.3,           // 30% volume
  duckTransitionMs: 150,           // Rapide mais smooth
  releaseTransitionMs: 500,        // Remontée progressive
  autoReleaseDelayMs: 1000,        // 1s après silence
  rampCurve: 'linear',
});
```

#### 🔇 Maximum Clarity (User Priority)
TTS très réduit pour maximiser clarté voix utilisateur:

```typescript
const engine = new TTSDuckingEngine({
  defaultDuckLevel: 0.1,           // ⬇️ 10% volume (très bas)
  duckTransitionMs: 80,            // ⬇️ Transition rapide
  releaseTransitionMs: 800,        // ⬆️ Remontée lente
  autoReleaseDelayMs: 1500,        // ⬆️ Attente plus longue
  rampCurve: 'exponential',        // Courbe naturelle
});
```

#### 🎙️ Podcast/Interview Mode
TTS reste audible même pendant overlap:

```typescript
const engine = new TTSDuckingEngine({
  defaultDuckLevel: 0.5,           // ⬆️ 50% volume (plus audible)
  duckTransitionMs: 300,           // ⬆️ Transition douce
  releaseTransitionMs: 300,        // Balance
  autoReleaseDelayMs: 500,         // ⬇️ Release rapide
  rampCurve: 'linear',
});
```

#### ⚡ Performance Mode (Low CPU)
Désactiver auto-release pour réduire timers:

```typescript
const engine = new TTSDuckingEngine({
  defaultDuckLevel: 0.3,
  duckTransitionMs: 100,           // ⬇️ Transitions rapides
  releaseTransitionMs: 100,
  enableAutoRelease: false,        // ⚠️ Manual release required
  rampCurve: 'linear',             // Linear moins CPU
});
```

---

## 🎛️ FullDuplexOrchestrator Configuration

### Configuration complète

```typescript
import { FullDuplexOrchestrator } from '@/services/voice/fullDuplexOrchestrator';

const orchestrator = new FullDuplexOrchestrator({
  // 🔄 Behavior
  autoStopOnHardInterrupt: true,   // Auto-stop TTS on hard interrupt (default: true)
  autoDuckOnSoftInterrupt: true,   // Auto-duck TTS on soft interrupt (default: true)
  continueOnOverlap: true,         // Continue TTS on overlap (default: true)

  // 🎙️ Audio Settings
  audioConstraints: {
    echoCancellation: true,         // Browser echo cancellation (default: true)
    noiseSuppression: true,         // Browser noise suppression (default: true)
    autoGainControl: false,         // Auto gain control (default: false)
    sampleRate: 48000,              // Sample rate (default: 48000)
  },

  // ⏱️ Timing
  interruptDebounceMs: 100,        // Debounce rapid interrupts (default: 100ms)
  stateTransitionDelayMs: 50,      // State transition delay (default: 50ms)

  // 📊 Monitoring
  enableEventLogging: true,        // Console event logs (default: true)
  enableMetrics: true,             // Collect performance metrics (default: true)
});

// Enable full duplex
await orchestrator.enable();

// Event subscription
const unsubscribe = orchestrator.onEvent((event) => {
  console.log('Full Duplex Event:', event);
});
```

### Tuning Guide

#### 🚀 Aggressive Interruption (Fast Response)
Réaction immédiate aux interruptions:

```typescript
const orchestrator = new FullDuplexOrchestrator({
  autoStopOnHardInterrupt: true,
  autoDuckOnSoftInterrupt: true,
  interruptDebounceMs: 50,         // ⬇️ Debounce minimal
  stateTransitionDelayMs: 20,      // ⬇️ Transitions rapides

  audioConstraints: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: false,
    sampleRate: 48000,
  },
});
```

#### 🛡️ Conservative Mode (Prevent False Stops)
Moins sensible, évite arrêts accidentels:

```typescript
const orchestrator = new FullDuplexOrchestrator({
  autoStopOnHardInterrupt: false,  // ⚠️ Manual stop only
  autoDuckOnSoftInterrupt: true,   // Duck ok
  continueOnOverlap: true,
  interruptDebounceMs: 300,        // ⬆️ Long debounce
  stateTransitionDelayMs: 100,     // ⬆️ Transitions lentes
});
```

#### 🎯 Podcast Mode (Minimal Interruption)
TTS prioritaire, interruptions rares:

```typescript
const orchestrator = new FullDuplexOrchestrator({
  autoStopOnHardInterrupt: true,   // Hard stop ok
  autoDuckOnSoftInterrupt: false,  // ⚠️ No ducking
  continueOnOverlap: true,         // ✅ Always continue
  interruptDebounceMs: 500,        // ⬆️ Very long debounce
});
```

---

## 💬 ChatInterruptionHandler Configuration

### Configuration complète

```typescript
import { ChatInterruptionHandler } from '@/services/chat/chatInterruptionHandler';

const handler = new ChatInterruptionHandler({
  // 🧠 Pattern Matching
  enableHardStopDetection: true,        // Detect "Stop!" patterns (default: true)
  enableRedirectDetection: true,        // Detect "Non, attends..." (default: true)
  enableClarificationDetection: true,   // Detect "Qu'est-ce que..." (default: true)
  enableCorrectionDetection: true,      // Detect "Non c'est faux" (default: true)
  enableAgreementDetection: true,       // Detect "Oui exactement" (default: true)
  enableDisagreementDetection: true,    // Detect "Non pas du tout" (default: true)

  // 🎯 Confidence Thresholds
  minConfidenceThreshold: 0.5,          // Minimum confidence (default: 0.5)
  hardStopConfidence: 0.9,              // Hard stop confidence (default: 0.9)
  redirectConfidence: 0.8,              // Redirect confidence (default: 0.8)

  // 📝 Context
  maxHistorySize: 10,                   // Max interruption history (default: 10)
  includeTimestamp: true,               // Include timestamp in context (default: true)
  includePosition: true,                // Include interrupt position (default: true)
});

// Handle interruption
const context = handler.handleInterruption(
  "Non attends je veux parler d'autre chose",  // User text
  "La capitale de la France est Paris...",      // Interrupted TTS
  0.6                                           // Position (60%)
);

console.log(context.type);            // 'redirect'
console.log(context.confidence);      // 0.85
```

### Tuning Guide

#### 🎯 Strict Detection (High Confidence)
Détection conservatrice, évite faux positifs:

```typescript
const handler = new ChatInterruptionHandler({
  minConfidenceThreshold: 0.7,     // ⬆️ Confidence élevée requise
  hardStopConfidence: 0.95,        // ⬆️ Hard stop très strict
  redirectConfidence: 0.85,        // ⬆️ Redirect strict
  maxHistorySize: 5,               // ⬇️ Moins d'historique
});
```

#### 🌊 Permissive Detection (High Sensitivity)
Détection large, capture plus de patterns:

```typescript
const handler = new ChatInterruptionHandler({
  minConfidenceThreshold: 0.3,     // ⬇️ Confidence basse ok
  hardStopConfidence: 0.7,         // ⬇️ Hard stop permissif
  redirectConfidence: 0.6,         // ⬇️ Redirect permissif
  maxHistorySize: 20,              // ⬆️ Plus d'historique
});
```

#### 💬 Conversational Mode (Balanced)
Balance naturelle pour dialogue fluide:

```typescript
const handler = new ChatInterruptionHandler({
  enableHardStopDetection: true,
  enableRedirectDetection: true,
  enableClarificationDetection: true,
  enableCorrectionDetection: true,
  enableAgreementDetection: false,     // ⚠️ Agreement optionnel
  enableDisagreementDetection: false,  // ⚠️ Disagreement optionnel
  minConfidenceThreshold: 0.5,
  maxHistorySize: 10,
});
```

---

## 🌍 Environment-Specific Tuning

### 🏢 Production Environment

```typescript
// BargeInDetector: Conservative
const detector = new BargeInDetector({
  hardInterruptThreshold: 0.18,
  softInterruptThreshold: 0.10,
  echoThreshold: 0.65,
  fftSize: 2048,
  enableEchoFiltering: true,
});

// TTSDuckingEngine: Smooth
const ducking = new TTSDuckingEngine({
  defaultDuckLevel: 0.3,
  duckTransitionMs: 200,
  releaseTransitionMs: 600,
  autoReleaseDelayMs: 1200,
  rampCurve: 'exponential',
});

// FullDuplexOrchestrator: Stable
const orchestrator = new FullDuplexOrchestrator({
  autoStopOnHardInterrupt: true,
  autoDuckOnSoftInterrupt: true,
  interruptDebounceMs: 150,
  enableEventLogging: false,        // ⚠️ Disable logs in prod
  enableMetrics: true,
  audioConstraints: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: false,
  },
});

// ChatInterruptionHandler: Balanced
const handler = new ChatInterruptionHandler({
  minConfidenceThreshold: 0.6,
  maxHistorySize: 10,
});
```

### 🧪 Development/Testing Environment

```typescript
// BargeInDetector: Aggressive
const detector = new BargeInDetector({
  hardInterruptThreshold: 0.12,    // ⬇️ Plus sensible
  softInterruptThreshold: 0.06,
  echoThreshold: 0.75,
  fftSize: 2048,
  enableEchoFiltering: true,
});

// TTSDuckingEngine: Fast
const ducking = new TTSDuckingEngine({
  defaultDuckLevel: 0.2,
  duckTransitionMs: 100,           // ⬇️ Transitions rapides
  releaseTransitionMs: 300,
  autoReleaseDelayMs: 800,
  rampCurve: 'linear',
});

// FullDuplexOrchestrator: Verbose
const orchestrator = new FullDuplexOrchestrator({
  autoStopOnHardInterrupt: true,
  autoDuckOnSoftInterrupt: true,
  interruptDebounceMs: 80,
  enableEventLogging: true,        // ✅ Logs enabled
  enableMetrics: true,
  audioConstraints: {
    echoCancellation: true,
    noiseSuppression: false,       // ⚠️ Test raw audio
    autoGainControl: false,
  },
});

// ChatInterruptionHandler: Permissive
const handler = new ChatInterruptionHandler({
  minConfidenceThreshold: 0.4,     // ⬇️ Low threshold
  maxHistorySize: 20,              // ⬆️ Large history
});
```

### 📱 Mobile Environment

```typescript
// BargeInDetector: Optimized
const detector = new BargeInDetector({
  fftSize: 1024,                   // ⬇️ Smaller FFT (less CPU)
  smoothingTimeConstant: 0.85,
  hardInterruptThreshold: 0.16,
  softInterruptThreshold: 0.09,
  slidingWindowMs: 250,            // ⬆️ Longer window (stability)
});

// TTSDuckingEngine: Simple
const ducking = new TTSDuckingEngine({
  defaultDuckLevel: 0.3,
  duckTransitionMs: 150,
  releaseTransitionMs: 400,
  enableAutoRelease: true,
  rampCurve: 'linear',             // Linear moins CPU
});

// FullDuplexOrchestrator: Efficient
const orchestrator = new FullDuplexOrchestrator({
  interruptDebounceMs: 200,        // ⬆️ Debounce plus long
  enableMetrics: false,            // ⚠️ Disable metrics (save CPU)
  audioConstraints: {
    sampleRate: 44100,             // ⬇️ Lower sample rate
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,         // ✅ Enable AGC on mobile
  },
});
```

---

## ⚡ Performance Optimization

### 🔋 Battery Optimization (Mobile)

```typescript
// Reduce FFT computations
const detector = new BargeInDetector({
  fftSize: 512,                    // ⬇️ Minimum viable
  slidingWindowMs: 400,            // ⬆️ Less frequent analysis
});

// Disable auto-release timers
const ducking = new TTSDuckingEngine({
  enableAutoRelease: false,        // ⚠️ Manual control
});

// Minimal event processing
const orchestrator = new FullDuplexOrchestrator({
  enableEventLogging: false,
  enableMetrics: false,
  audioConstraints: {
    sampleRate: 44100,
  },
});
```

### 🚀 Low-Latency Mode

```typescript
// Fast detection
const detector = new BargeInDetector({
  fftSize: 1024,                   // ⬇️ Fast FFT
  slidingWindowMs: 100,            // ⬇️ Short window
  minInterruptDuration: 200,       // ⬇️ Quick trigger
});

// Instant ducking
const ducking = new TTSDuckingEngine({
  duckTransitionMs: 50,            // ⬇️ Instant
  releaseTransitionMs: 200,
  autoReleaseDelayMs: 500,
});

// Minimal debounce
const orchestrator = new FullDuplexOrchestrator({
  interruptDebounceMs: 30,         // ⬇️ Near-instant
  stateTransitionDelayMs: 10,
});
```

### 🧠 Memory Optimization

```typescript
// Small history
const handler = new ChatInterruptionHandler({
  maxHistorySize: 5,               // ⬇️ Minimal history
});

// No metrics collection
const orchestrator = new FullDuplexOrchestrator({
  enableMetrics: false,            // Save memory
});

// Reduced FFT precision
const detector = new BargeInDetector({
  fftSize: 1024,                   // ⬇️ Less memory
});
```

---

## 🔥 Advanced Patterns

### Custom Barge-In Logic

```typescript
import { bargeInDetector, type BargeInEvent } from '@/services/voice/bargeInDetector';

// Custom interrupt handler
bargeInDetector.onInterrupt = (event: BargeInEvent) => {
  if (event.type === 'USER_INTERRUPT') {
    // Custom hard stop logic
    console.log('🚨 User wants to stop!');
    fullDuplexOrchestrator.interrupt();

  } else if (event.type === 'USER_SOFT_BARGE') {
    // Custom ducking logic
    console.log('🔇 User wants to speak softly');
    ttsDuckingEngine.applyDucking(0.15); // 15% volume

  } else if (event.type === 'USER_OVERLAP') {
    // Custom overlap logic
    console.log('🗣️ User speaking simultaneously');
    // Do nothing, let TTS continue
  }
};
```

### Dynamic Threshold Adjustment

```typescript
// Adjust thresholds based on environment noise
function adaptToEnvironment(noiseLevel: number) {
  const detector = bargeInDetector;

  if (noiseLevel > 0.15) {
    // Noisy environment
    detector.hardInterruptThreshold = 0.25;
    detector.softInterruptThreshold = 0.15;
    detector.echoThreshold = 0.60;

  } else if (noiseLevel < 0.05) {
    // Quiet environment
    detector.hardInterruptThreshold = 0.10;
    detector.softInterruptThreshold = 0.05;
    detector.echoThreshold = 0.80;

  } else {
    // Normal environment
    detector.hardInterruptThreshold = 0.15;
    detector.softInterruptThreshold = 0.08;
    detector.echoThreshold = 0.70;
  }
}

// Measure noise and adapt
async function calibrate() {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const audioContext = new AudioContext();
  const source = audioContext.createMediaStreamSource(stream);
  const analyser = audioContext.createAnalyser();
  source.connect(analyser);

  const data = new Float32Array(analyser.fftSize);
  analyser.getFloatTimeDomainData(data);

  const rms = Math.sqrt(data.reduce((sum, val) => sum + val * val, 0) / data.length);
  adaptToEnvironment(rms);

  console.log(`📊 Calibrated for noise level: ${rms.toFixed(4)}`);
}
```

### Custom Ducking Curves

```typescript
// Exponential ramp (more natural)
async function exponentialDuck(target: number, durationMs: number) {
  const gainNode = ttsDuckingEngine.gainNode;
  const currentTime = gainNode.context.currentTime;

  gainNode.gain.exponentialRampToValueAtTime(
    Math.max(target, 0.001), // Avoid zero
    currentTime + durationMs / 1000
  );
}

// Custom S-curve ramp
async function sCurveDuck(target: number, durationMs: number) {
  const steps = 20;
  const stepDuration = durationMs / steps;
  const gainNode = ttsDuckingEngine.gainNode;
  const currentGain = gainNode.gain.value;

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    // S-curve: smoothstep function
    const smooth = t * t * (3 - 2 * t);
    const value = currentGain + (target - currentGain) * smooth;

    gainNode.gain.setValueAtTime(
      value,
      gainNode.context.currentTime + (stepDuration * i) / 1000
    );
  }
}
```

### Multi-Language Support

```typescript
// Add custom patterns for English
const englishPatterns = {
  hardStop: [
    /^(stop|wait|hold on)/i,
    /(please stop|shut up)/i,
  ],
  redirect: [
    /(no wait|hold on|actually)/i,
    /(let me|i want to)/i,
  ],
  clarification: [
    /(what do you mean|can you explain)/i,
    /(i don't understand)/i,
  ],
};

// Extend chatInterruptionHandler
chatInterruptionHandler.addPatterns('en', englishPatterns);
```

### Telemetry & Analytics

```typescript
// Collect metrics
const metrics = {
  interruptCount: 0,
  falsePositiveCount: 0,
  averageLatency: 0,
  interruptions: [] as any[],
};

fullDuplexOrchestrator.onEvent((event) => {
  if (event.type === 'interrupt') {
    const latency = Date.now() - event.timestamp;
    metrics.interruptCount++;
    metrics.averageLatency =
      (metrics.averageLatency * (metrics.interruptCount - 1) + latency) /
      metrics.interruptCount;

    metrics.interruptions.push({
      timestamp: event.timestamp,
      type: event.bargeInEvent?.type,
      confidence: event.bargeInEvent?.confidence,
      latency,
    });

    // Send to analytics
    analytics.track('full_duplex_interrupt', {
      type: event.bargeInEvent?.type,
      confidence: event.bargeInEvent?.confidence,
      latency,
    });
  } else if (event.type === 'false_positive') {
    metrics.falsePositiveCount++;
  }
});

// Report every minute
setInterval(() => {
  console.log('📊 Full Duplex Metrics:', {
    interrupts: metrics.interruptCount,
    falsePositives: metrics.falsePositiveCount,
    avgLatency: `${metrics.averageLatency.toFixed(0)}ms`,
    falsePositiveRate: (
      (metrics.falsePositiveCount / (metrics.interruptCount + metrics.falsePositiveCount)) * 100
    ).toFixed(1) + '%',
  });
}, 60000);
```

---

## 📚 Best Practices

### 1. Start Conservative
Commencer avec thresholds élevés, ajuster progressivement:

```typescript
// Production initial config
const detector = new BargeInDetector({
  hardInterruptThreshold: 0.18,    // Conservative
  softInterruptThreshold: 0.10,
  echoThreshold: 0.65,
});
```

### 2. Monitor False Positives
Tracker taux false positive et ajuster:

```typescript
if (falsePositiveRate > 0.05) {
  // Augmenter thresholds
  detector.hardInterruptThreshold += 0.02;
  detector.echoThreshold -= 0.05;
}
```

### 3. A/B Test Configurations
Tester multiples configs avec users:

```typescript
const configA = { hardInterruptThreshold: 0.15 };
const configB = { hardInterruptThreshold: 0.18 };

// Random assignment
const config = Math.random() > 0.5 ? configA : configB;
```

### 4. User Preference Override
Permettre users de customizer:

```typescript
const userSettings = getUserSettings();

const detector = new BargeInDetector({
  hardInterruptThreshold: userSettings.interruptSensitivity ?? 0.15,
  enableEchoFiltering: userSettings.echoFilterEnabled ?? true,
});
```

### 5. Graceful Degradation
Fallback si feature unsupported:

```typescript
if (!navigator.mediaDevices || !AudioContext) {
  console.warn('⚠️ Full duplex not supported, falling back to turn-based');
  voice.disableFullDuplex();
  voice.enableTurnBasedMode();
}
```

---

## 🐛 Debugging Configuration

### Enable Verbose Logging

```typescript
// BargeInDetector debug
bargeInDetector.enableDebugMode = true;

// TTSDuckingEngine debug
ttsDuckingEngine.onDuckingChange = (state, level) => {
  console.log(`[Ducking] State: ${state}, Level: ${level}`);
};

// FullDuplexOrchestrator debug
fullDuplexOrchestrator.enableEventLogging = true;

// ChatInterruptionHandler debug
chatInterruptionHandler.onInterruptionDetected = (context) => {
  console.log('[Interruption]', context);
};
```

### Real-Time Threshold Visualization

```typescript
// Visualize RMS levels
function visualizeAudio() {
  const canvas = document.getElementById('audio-viz') as HTMLCanvasElement;
  const ctx = canvas.getContext('2d')!;

  const analyser = bargeInDetector.analyser;
  const data = new Float32Array(analyser.fftSize);

  function draw() {
    analyser.getFloatTimeDomainData(data);
    const rms = Math.sqrt(data.reduce((sum, val) => sum + val * val, 0) / data.length);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw RMS level
    ctx.fillStyle = '#3b82f6';
    ctx.fillRect(0, 0, rms * canvas.width * 10, 50);

    // Draw thresholds
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(bargeInDetector.hardInterruptThreshold * canvas.width * 10, 0, 2, 50);

    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(bargeInDetector.softInterruptThreshold * canvas.width * 10, 0, 2, 50);

    requestAnimationFrame(draw);
  }

  draw();
}
```

---

## 📝 Configuration Templates

Copier-coller templates prêts à l'emploi:

### Template 1: Conservative Production

```typescript
export const conservativeConfig = {
  bargeIn: {
    hardInterruptThreshold: 0.18,
    softInterruptThreshold: 0.10,
    echoThreshold: 0.65,
    fftSize: 2048,
  },
  ducking: {
    defaultDuckLevel: 0.3,
    duckTransitionMs: 200,
    releaseTransitionMs: 600,
    rampCurve: 'exponential' as const,
  },
  orchestrator: {
    interruptDebounceMs: 150,
    enableEventLogging: false,
  },
  chat: {
    minConfidenceThreshold: 0.6,
  },
};
```

### Template 2: Aggressive Development

```typescript
export const aggressiveConfig = {
  bargeIn: {
    hardInterruptThreshold: 0.12,
    softInterruptThreshold: 0.06,
    echoThreshold: 0.75,
    fftSize: 2048,
  },
  ducking: {
    defaultDuckLevel: 0.2,
    duckTransitionMs: 100,
    releaseTransitionMs: 300,
    rampCurve: 'linear' as const,
  },
  orchestrator: {
    interruptDebounceMs: 80,
    enableEventLogging: true,
  },
  chat: {
    minConfidenceThreshold: 0.4,
  },
};
```

### Template 3: Mobile Optimized

```typescript
export const mobileConfig = {
  bargeIn: {
    hardInterruptThreshold: 0.16,
    softInterruptThreshold: 0.09,
    echoThreshold: 0.70,
    fftSize: 1024,
    slidingWindowMs: 250,
  },
  ducking: {
    defaultDuckLevel: 0.3,
    duckTransitionMs: 150,
    releaseTransitionMs: 400,
    rampCurve: 'linear' as const,
  },
  orchestrator: {
    interruptDebounceMs: 200,
    enableMetrics: false,
    audioConstraints: {
      sampleRate: 44100,
      autoGainControl: true,
    },
  },
  chat: {
    minConfidenceThreshold: 0.5,
    maxHistorySize: 5,
  },
};
```

---

**🔥 Full Duplex v∞.5 — TITANE_INFINITY**
*Configuration avancée pour conversations naturelles*
