# 🚀 QUICK START — Cognitive Wake Word v19.5.0

Guide pratique pour intégrer le système **Wake Word cognitif** dans TITANE_INFINITY.

---

## 📋 Prérequis

- ✅ Node.js 18+
- ✅ TypeScript 5+
- ✅ Audio pipeline opérationnel (`useAudioStreaming`)
- ✅ TTS engine accessible

---

## ⚡ Installation

Les modules cognitifs sont déjà intégrés ! Pas de dépendances externes.

```bash
# Vérifier compilation TypeScript
npm run type-check
```

---

## 🎯 3 Options d'Usage

### Option 1️⃣ : v1 Compatibility (Basique)

**Quand l'utiliser:** Tests rapides, pas besoin cognitive features.

```typescript
import { wakeWordEngine } from '@/services/voice/wakeWordEngine';

const event = wakeWordEngine.detect(transcript);

if (event.detected) {
  console.log('Wake word detected!', event.confidence);
}
```

**Avantages:** Simple, pas de latence
**Limites:** Pas de learning, echo possible, seuils statiques

---

### Option 2️⃣ : v2.0 Basic (Cognitive partiel)

**Quand l'utiliser:** Besoin cognitive mais pas configuration avancée.

```typescript
import { wakeWordEngineV2 } from '@/services/voice/cognitiveWakeWord';

// Activer features (par défaut toutes actives)
wakeWordEngineV2.setConfig({
  useVoiceFingerprint: true,
  useAntiEcho: true,
  useContextualAdaptation: true,
});

// Détection avec audio
const event = await wakeWordEngineV2.detectWithAudio(
  transcript,
  audioBuffer,
  sampleRate
);

if (event.detected) {
  console.log('Cognitive detection:', {
    confidence: event.confidence,
    voiceSimilarity: event.voiceSimilarity,
    spectralMatch: event.spectralMatch,
    adaptiveThreshold: event.adaptiveThreshold,
  });
}
```

**Avantages:** Cognitive features actives, API simple
**Limites:** Pas de tuning fin

---

### Option 3️⃣ : v2.0 Full Cognitive (Recommandé)

**Quand l'utiliser:** Production, tuning avancé, monitoring.

```typescript
import {
  wakeWordEngineV2,
  voiceFingerprintEngine,
  antiEchoShield,
  contextualAttentionV2,
  getCognitiveStatus,
} from '@/services/voice/cognitiveWakeWord';

// ========================================
// 1. CONFIGURATION INITIALE
// ========================================

// Wake Word Engine v2.0
wakeWordEngineV2.setConfig({
  useVoiceFingerprint: true,
  useAntiEcho: true,
  useContextualAdaptation: true,
});

// Voice Fingerprint tuning
voiceFingerprintEngine.setConfig({
  minSamples: 5,                  // Min 5 samples
  maxSamples: 50,                 // Max 50 samples
  similarityThreshold: 0.75,      // Voice match threshold
  learningThreshold: 0.8,         // Training confidence min
});

// Anti-Echo tuning
antiEchoShield.setThreshold(0.85);        // Spectral match
antiEchoShield.setPostTTSMargin(500);     // Post-TTS margin

// Contextual Attention tuning
contextualAttentionV2.setBaseConfig({
  wakeThreshold: 0.5,
  minConfidence: 0.3,
  maxConfidence: 0.9,
});

// ========================================
// 2. HOOKS TTS (Important!)
// ========================================

const handleTTSStart = (audioBuffer: Float32Array, sampleRate: number) => {
  // CRITIQUE: Block listening pendant TTS
  antiEchoShield.startTTS(audioBuffer, sampleRate);
};

const handleTTSEnd = () => {
  // CRITIQUE: Restore listening après TTS + margin
  antiEchoShield.endTTS();
};

// Intégrer dans votre TTS engine
ttsEngine.on('start', handleTTSStart);
ttsEngine.on('end', handleTTSEnd);

// ========================================
// 3. CONTEXT UPDATES (Optionnel)
// ========================================

// Update selon mode application
contextualAttentionV2.updateApplicationContext({
  mode: 'focus',              // 'normal' | 'focus' | 'background'
  criticalTask: false,        // true = threshold très haut
  highFalsePositives: false,  // true = auto-adaptation
});

// ========================================
// 4. DÉTECTION COGNITIVE
// ========================================

const handleTranscript = async (
  transcript: string,
  audioBuffer: Float32Array,
  sampleRate: number
) => {
  // Détection complète
  const event = await wakeWordEngineV2.detectWithAudio(
    transcript,
    audioBuffer,
    sampleRate
  );

  if (event.detected) {
    console.log('🎯 Wake word detected!', {
      confidence: event.confidence.toFixed(2),
      voiceSimilarity: event.voiceSimilarity?.toFixed(2),
      adaptiveThreshold: event.adaptiveThreshold?.toFixed(2),
      spectralMatch: event.spectralMatch,
      echoBlocked: event.echoAnalysis?.isEcho,
    });

    // Success feedback
    wakeWordEngineV2.reportSuccess();

    // Trigger action
    onWakeWordDetected(event);
  }
};

// ========================================
// 5. TRAINING VOCAL (First Use)
// ========================================

const trainVoiceIfNeeded = async (
  audioBuffer: Float32Array,
  sampleRate: number,
  confidence: number
) => {
  if (!voiceFingerprintEngine.isReady()) {
    const accuracy = voiceFingerprintEngine.getLearningAccuracy();
    const samples = voiceFingerprintEngine.getSampleCount();

    console.log(`📚 Training voice model... (${samples}/5, accuracy: ${(accuracy * 100).toFixed(1)}%)`);

    await wakeWordEngineV2.trainVoiceModel(audioBuffer, sampleRate, confidence);

    if (voiceFingerprintEngine.isReady()) {
      console.log('✅ Voice model ready!');
    }
  }
};

// Appeler après chaque détection validée
if (event.detected && userConfirmedDetection) {
  await trainVoiceIfNeeded(audioBuffer, sampleRate, event.confidence);
}

// ========================================
// 6. FEEDBACK ADAPTATIF
// ========================================

// False positive (utilisateur dit que c'était faux)
if (userReportFalsePositive) {
  wakeWordEngineV2.reportFalsePositive();
  console.log('❌ False positive reported, threshold adjusted');
}

// Success (détection correcte)
if (event.detected && userConfirmedDetection) {
  wakeWordEngineV2.reportSuccess();
  console.log('✅ Success reported');
}

// ========================================
// 7. MONITORING DASHBOARD
// ========================================

const displayCognitiveStatus = () => {
  const status = getCognitiveStatus();

  console.log('🧠 COGNITIVE STATUS:', {
    voiceFingerprint: {
      ready: status.voiceFingerprint.ready,
      accuracy: `${(status.voiceFingerprint.accuracy * 100).toFixed(1)}%`,
      samples: status.voiceFingerprint.samples,
    },
    antiEcho: {
      muted: status.antiEcho.muted,
    },
    contextualAttention: {
      threshold: status.contextualAttention.threshold.toFixed(2),
      activeRules: status.contextualAttention.activeRules,
    },
    system: {
      version: status.system.version,
      ready: status.system.ready,
    },
  });
};

// Afficher status toutes les 10s
setInterval(displayCognitiveStatus, 10000);
```

**Avantages:** Contrôle total, tuning optimal, monitoring complet
**Complexité:** Plus de code, mais documentation claire

---

## 📊 Monitoring UI Component (React)

```typescript
import React, { useEffect, useState } from 'react';
import { getCognitiveStatus } from '@/services/voice/cognitiveWakeWord';

export const CognitiveWakeWordMonitor: React.FC = () => {
  const [status, setStatus] = useState(getCognitiveStatus());

  useEffect(() => {
    const interval = setInterval(() => {
      setStatus(getCognitiveStatus());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="cognitive-monitor">
      <h3>🧠 Cognitive Wake Word</h3>

      <div className="status-grid">
        {/* Voice Fingerprint */}
        <div className="status-card">
          <h4>Voice Fingerprint</h4>
          <div className={status.voiceFingerprint.ready ? 'ready' : 'learning'}>
            {status.voiceFingerprint.ready ? '✅ Ready' : '📚 Learning'}
          </div>
          <p>Accuracy: {(status.voiceFingerprint.accuracy * 100).toFixed(1)}%</p>
          <p>Samples: {status.voiceFingerprint.samples}</p>
        </div>

        {/* Anti-Echo */}
        <div className="status-card">
          <h4>Anti-Echo Shield</h4>
          <div className={status.antiEcho.muted ? 'muted' : 'active'}>
            {status.antiEcho.muted ? '🔇 Muted (TTS)' : '🎤 Active'}
          </div>
        </div>

        {/* Contextual Attention */}
        <div className="status-card">
          <h4>Contextual Attention</h4>
          <p>Threshold: {status.contextualAttention.threshold.toFixed(2)}</p>
          <p>Active Rules:</p>
          <ul>
            {status.contextualAttention.activeRules.map((rule) => (
              <li key={rule}>{rule}</li>
            ))}
          </ul>
        </div>

        {/* System */}
        <div className="status-card">
          <h4>System</h4>
          <p>Version: {status.system.version}</p>
          <p>Status: {status.system.ready ? '✅ Ready' : '⏳ Initializing'}</p>
        </div>
      </div>
    </div>
  );
};
```

---

## 🔧 Scénarios Avancés

### Scénario 1: First Use (Learning)

```typescript
// User dit "Titane" × 5
for (let i = 0; i < 5; i++) {
  const event = await wakeWordEngineV2.detectWithAudio(
    transcript,
    audioBuffer,
    sampleRate
  );

  if (event.detected) {
    await wakeWordEngineV2.trainVoiceModel(audioBuffer, sampleRate, event.confidence);

    const samples = voiceFingerprintEngine.getSampleCount();
    console.log(`Sample ${samples}/5 collected`);
  }
}

// After 5 samples
if (voiceFingerprintEngine.isReady()) {
  console.log('✅ Voice model ready! Personal detection active.');
}
```

### Scénario 2: Noisy Environment

```typescript
// Contexte: Bruit ambiant élevé
contextualAttentionV2.updateEnvironmentContext({
  noiseLevel: 0.6,    // High noise
  voiceDistance: 'medium',
  signalQuality: 'poor',
  multipleVoices: false,
});

// Résultat: Threshold auto-adjusted 0.5 → 0.7
const adaptedConfig = contextualAttentionV2.getAdaptedConfig();
console.log('Adapted threshold:', adaptedConfig.wakeThreshold);  // 0.7
```

### Scénario 3: TTS Protection

```typescript
// TITANE commence à parler
ttsEngine.on('start', (audioBuffer, sampleRate) => {
  antiEchoShield.startTTS(audioBuffer, sampleRate);
  console.log('🔇 Listening muted during TTS');
});

// User dit "Titane" pendant TTS
const event = await wakeWordEngineV2.detectWithAudio(
  transcript,
  audioBuffer,
  sampleRate
);

if (event.echoAnalysis?.isEcho) {
  console.log('🛑 Echo detected, blocked!');
  // detected = false
}

// TITANE termine de parler
ttsEngine.on('end', () => {
  antiEchoShield.endTTS();
  console.log('🎤 Listening restored after 500ms margin');
});
```

### Scénario 4: Multiple Voices

```typescript
// User #1 (trained voice)
const event1 = await wakeWordEngineV2.detectWithAudio(
  'Titane',
  userAudioBuffer,
  16000
);

if (event1.detected) {
  console.log('✅ Personal voice match:', event1.voiceSimilarity);  // 0.90
}

// User #2 (different voice)
const event2 = await wakeWordEngineV2.detectWithAudio(
  'Titan',  // Similar pronunciation
  otherUserBuffer,
  16000
);

if (!event2.detected) {
  console.log('❌ Voice mismatch rejected:', event2.voiceSimilarity);  // 0.40
}
```

---

## 🧪 Tests

### Test Unitaire: Voice Fingerprint

```typescript
import { voiceFingerprintEngine } from '@/services/voice/cognitiveWakeWord';

test('Voice fingerprint learning', async () => {
  // Clear model
  voiceFingerprintEngine.clearModel();
  expect(voiceFingerprintEngine.isReady()).toBe(false);

  // Add 5 samples
  for (let i = 0; i < 5; i++) {
    await voiceFingerprintEngine.addWakeWordSample(audioBuffer, 16000);
  }

  // Check ready
  expect(voiceFingerprintEngine.isReady()).toBe(true);
  expect(voiceFingerprintEngine.getSampleCount()).toBe(5);
});
```

### Test E2E: Complete Pipeline

```typescript
test('Cognitive wake word detection', async () => {
  // Configure
  wakeWordEngineV2.setConfig({
    useVoiceFingerprint: true,
    useAntiEcho: true,
    useContextualAdaptation: true,
  });

  // Detect
  const event = await wakeWordEngineV2.detectWithAudio(
    'Titane',
    audioBuffer,
    16000
  );

  // Assertions
  expect(event.detected).toBe(true);
  expect(event.voiceSimilarity).toBeGreaterThan(0.75);
  expect(event.echoAnalysis?.isEcho).toBe(false);
  expect(event.adaptiveThreshold).toBeGreaterThan(0);
});
```

---

## ⚠️ Troubleshooting

### Problème: Voice model ne devient jamais ready

**Cause:** Confidence trop faible lors training

**Solution:**
```typescript
voiceFingerprintEngine.setConfig({
  learningThreshold: 0.6,  // Lower threshold
});
```

### Problème: False positives élevés

**Cause:** Threshold trop bas ou bruit ambiant

**Solution:**
```typescript
contextualAttentionV2.setBaseConfig({
  wakeThreshold: 0.6,  // Increase base threshold
});

// Ou activer adaptation
contextualAttentionV2.updateApplicationContext({
  highFalsePositives: true,  // Auto-adjust
});
```

### Problème: Anti-echo ne bloque pas TTS

**Cause:** TTS hooks non connectés

**Solution:**
```typescript
// CRITIQUE: Hook TTS start/end
ttsEngine.on('start', (buffer, rate) => antiEchoShield.startTTS(buffer, rate));
ttsEngine.on('end', () => antiEchoShield.endTTS());
```

### Problème: Latence trop élevée (>100ms)

**Cause:** MFCC extraction simplifiée

**Solution:**
```typescript
// Désactiver voice fingerprint temporairement
wakeWordEngineV2.setConfig({
  useVoiceFingerprint: false,  // Reduce latency
});

// Ou optimiser avec FFT natif (production)
// TODO: Implémenter MFCC optimisé avec WebAssembly
```

---

## 📚 Documentation Complète

| Document | Contenu |
|----------|---------|
| `SUPER_PROMPT_VII_COGNITIVE_WAKE_WORD_v19.5.0_COMPLETE.md` | Architecture, API, Flow diagrams |
| `CHANGELOG_v19.5.0_SUPER_PROMPT_VII.md` | Features, Metrics, Migration |
| `QUICKSTART_COGNITIVE_WAKE_WORD.md` | Ce fichier |

---

## 🎯 Checklist Integration

- [ ] Configuration initiale (Option 1, 2 ou 3)
- [ ] Hooks TTS connectés (start/end)
- [ ] Context updates (mode application)
- [ ] Détection cognitive active
- [ ] Training vocal (first use)
- [ ] Feedback adaptatif (false positives)
- [ ] Monitoring dashboard (UI)
- [ ] Tests unitaires écrits
- [ ] Tests E2E validés
- [ ] Documentation lue

---

## 🚀 Prochaines Étapes

1. **Integration dans useActiveListening:**
   - Replace `wakeWordEngine` → `wakeWordEngineV2`
   - Add training flow
   - Add monitoring UI

2. **Optimisations Production:**
   - MFCC optimisé (FFT natif ou WebAssembly)
   - Caching spectral profiles
   - Worker thread pour extraction features

3. **Features Avancées:**
   - Multi-user voice models
   - Cloud sync voice fingerprints
   - Adaptive rules learning (ML)

---

**🧠 Le wake word est maintenant une entité cognitive vivante.**

*TITANE_INFINITY v19.5.0 — Humain Total © 2025*
