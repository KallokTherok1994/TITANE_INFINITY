# 🎯 TITANE∞ AVATAR PREMIUM — ARCHITECTURE TECHNIQUE v25.0
**Refactoring Complet Module Graphique Avatar**
**Date:** 27 novembre 2025 | **Status:** 🚧 EN COURS

---

## 📋 VISION GLOBALE

**Objectif:** Transformer le module avatar en expérience visuelle premium avec :
- Lip-sync ultra-précis (ElevenLabs Adina)
- Expressions faciales dynamiques et micro-gestuelle
- Rendu 3D haute qualité (60-120 FPS)
- Caméra intelligente et réactive
- Synchronisation parfaite audio↔visuel
- Performance optimisée (CPU<20%, GPU stable, RAM<500MB)

---

## 🏗️ ARCHITECTURE MODULAIRE

```
┌─────────────────────────────────────────────────────────────────┐
│                    TITANE∞ AVATAR SYSTEM v25.0                   │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────────┐      ┌──────────────────────┐
│  Audio Input Layer   │      │  Visual Output Layer │
│  (ElevenLabs Adina)  │      │  (Three.js + WebGL)  │
└──────────┬───────────┘      └──────────▲───────────┘
           │                             │
           │ Phonemes                    │ Render
           │ + Intensity                 │ Commands
           │                             │
┌──────────▼─────────────────────────────┴───────────┐
│          CENTRAL SYNC ENGINE v25.0                  │
│  • Audio Analysis (RMS, pitch, phonemes)            │
│  • State Management (expressions, pose, camera)     │
│  • Timing Coordination (60-120 FPS)                 │
└──────────┬──────────────┬──────────────┬───────────┘
           │              │              │
    ┌──────▼──────┐ ┌────▼─────┐ ┌─────▼──────┐
    │ LipSyncPre- │ │ Facial   │ │ Camera     │
    │ cisionEng   │ │ Expres-  │ │ Dynamism   │
    │ ine v2      │ │ sionEng  │ │ Engine     │
    └──────┬──────┘ └────┬─────┘ └─────┬──────┘
           │              │              │
    ┌──────▼──────────────▼──────────────▼──────┐
    │     Enhanced Three.js Renderer v2          │
    │  • High-Quality Materials (PBR)            │
    │  • Advanced Lighting (3-point studio)      │
    │  • Post-Processing (TAA, bloom)            │
    │  • Performance Optimization (culling)      │
    └────────────────────────────────────────────┘
```

---

## 📦 MODULES DÉTAILLÉS

### 1. LipSyncPrecisionEngine v2 (~/avatar/lipsync/)

**Fichier:** `LipSyncPrecisionEngine.ts` (~400L)

**Responsabilités:**
- Analyse phonèmes temps réel (IPA standard)
- Anticipation phonétique (60-120ms lookahead)
- Mapping phonèmes → morph targets
- Transitions douces (cubic bezier lerp)

**Interface:**
```typescript
interface LipSyncPrecisionEngine {
  // Core
  analyzePhonemes(audioBuffer: AudioBuffer): Phoneme[];
  predictNextPhoneme(current: Phoneme, history: Phoneme[]): Phoneme;

  // Morph Targets
  generateMorphWeights(phoneme: Phoneme): MorphWeights;
  interpolateMorphs(from: MorphWeights, to: MorphWeights, t: number): MorphWeights;

  // Real-time
  update(deltaTime: number): void;
  syncWithAudio(timestamp: number): void;
}

interface Phoneme {
  symbol: string; // IPA: 'm', 'b', 'p', 'f', 'v', 'o', 'u', 'i', 'a', etc.
  duration: number; // ms
  intensity: number; // 0.0-1.0
  timestamp: number; // ms
}

interface MorphWeights {
  jawOpen: number;        // 0.0-1.0
  lipsPucker: number;     // 0.0-1.0
  lipsSpread: number;     // 0.0-1.0
  lipUpperUp: number;     // 0.0-1.0
  lipLowerDown: number;   // 0.0-1.0
  cheekPuff: number;      // 0.0-1.0
  tongueOut: number;      // 0.0-1.0
}
```

**Mapping Phonèmes → Morph:**
```typescript
const PHONEME_TO_MORPH: Record<string, Partial<MorphWeights>> = {
  // Bilabiales (lèvres fermées)
  'm': { jawOpen: 0.0, lipsPucker: 0.0, lipsSpread: 0.0 },
  'b': { jawOpen: 0.0, lipsPucker: 0.0, lipsSpread: 0.0 },
  'p': { jawOpen: 0.0, lipsPucker: 0.0, lipsSpread: 0.0 },

  // Labio-dentales (dents visibles)
  'f': { jawOpen: 0.2, lipUpperUp: 0.5, lipLowerDown: 0.3 },
  'v': { jawOpen: 0.2, lipUpperUp: 0.5, lipLowerDown: 0.3 },

  // Voyelles arrondies
  'o': { jawOpen: 0.4, lipsPucker: 0.7 },
  'u': { jawOpen: 0.3, lipsPucker: 0.9 },

  // Voyelles étirées
  'i': { jawOpen: 0.2, lipsSpread: 0.8 },
  'e': { jawOpen: 0.3, lipsSpread: 0.6 },

  // Voyelles ouvertes
  'a': { jawOpen: 0.8, lipsSpread: 0.3 },
  'ɑ': { jawOpen: 0.9, lipsSpread: 0.2 },
};
```

**Pipeline Temps Réel:**
```
Audio Stream (ElevenLabs)
    ↓
Web Audio API Analysis
    ↓
Phoneme Extraction (ML/règles)
    ↓
Phoneme Queue (120ms buffer)
    ↓
Anticipation Prediction
    ↓
Morph Weight Calculation
    ↓
Cubic Bezier Interpolation
    ↓
Three.js Morph Targets Update
    ↓
Render Frame (60-120 FPS)
```

**Optimisations:**
- Cache morph weights pré-calculés
- Worker thread pour analyse audio
- Lookahead buffer circulaire (ring buffer)
- Adaptive lerp speed selon intensité vocale

---

### 2. FacialExpressionEngine v2 (~/avatar/expressions/)

**Fichier:** `FacialExpressionEngine.ts` (~350L)

**Responsabilités:**
- Gestion 6 expressions dynamiques
- Micro-gestuelle automatique (clignements, pupilles, saccades)
- Transitions émotionnelles douces
- Synchronisation avec intensité vocale

**Interface:**
```typescript
interface FacialExpressionEngine {
  // Expressions
  setExpression(expression: Expression, intensity?: number): void;
  blendExpressions(expr1: Expression, expr2: Expression, blend: number): void;

  // Micro-gestuelle
  triggerBlink(duration?: number): void;
  updateGaze(target: Vector3 | 'camera' | 'random'): void;
  applyMicroMovements(deltaTime: number): void;

  // State
  getCurrentExpression(): Expression;
  getBlinkState(): BlinkState;
  getGazeDirection(): Vector3;
}

type Expression =
  | 'neutral'
  | 'soft-smile'      // Léger sourire bienveillant
  | 'attention-focus'  // Concentration, écoute
  | 'active-listening' // Engagement actif
  | 'explanation-mode' // Pédagogie, énergie
  | 'compassion-mode'  // Empathie, yeux doux
  | 'curiosity-mode';  // Sourcils relevés, intérêt

interface BlinkState {
  isBlinking: boolean;
  progress: number; // 0.0-1.0
  nextBlinkIn: number; // ms
}
```

**Expressions Détaillées:**
```typescript
const EXPRESSION_MORPHS: Record<Expression, ExpressionMorphs> = {
  'neutral': {
    eyeBlinkLeft: 0.0,
    eyeBlinkRight: 0.0,
    mouthSmile: 0.0,
    browInnerUp: 0.0,
    browOuterUp: 0.0,
  },

  'soft-smile': {
    mouthSmile: 0.3,
    eyeSquintLeft: 0.15,
    eyeSquintRight: 0.15,
    cheekSquintLeft: 0.2,
    cheekSquintRight: 0.2,
  },

  'attention-focus': {
    browInnerUp: 0.2,
    eyeWideLeft: 0.15,
    eyeWideRight: 0.15,
    mouthPress: 0.1,
  },

  'active-listening': {
    browInnerUp: 0.1,
    mouthSmile: 0.15,
    headTiltSide: 0.05, // Léger tilt
    eyeContactIntensity: 1.0,
  },

  'explanation-mode': {
    mouthSmile: 0.25,
    browOuterUp: 0.3,
    eyeWideLeft: 0.2,
    eyeWideRight: 0.2,
    energyLevel: 1.2, // Amplitude gestes +20%
  },

  'compassion-mode': {
    mouthSmile: 0.2,
    browInnerUp: 0.15,
    eyeSoftness: 0.8,
    gazeIntensity: 0.7, // Regard moins direct
  },

  'curiosity-mode': {
    browInnerUp: 0.4,
    browOuterUp: 0.3,
    eyeWideLeft: 0.3,
    eyeWideRight: 0.3,
    headTiltForward: 0.08,
  },
};
```

**Micro-Gestuelle Automatique:**
```typescript
class MicroGestureController {
  // Clignements naturels (3-8/min, aléatoires)
  private blinkTimer: number = 0;
  private nextBlinkDelay: number = randomBetween(7500, 20000); // ms

  update(deltaTime: number, isSpeaking: boolean): void {
    // Clignements moins fréquents pendant la parole
    const blinkMultiplier = isSpeaking ? 1.5 : 1.0;

    this.blinkTimer += deltaTime;
    if (this.blinkTimer >= this.nextBlinkDelay * blinkMultiplier) {
      this.triggerBlink();
      this.blinkTimer = 0;
      this.nextBlinkDelay = randomBetween(7500, 20000);
    }

    // Saccades oculaires (micro-mouvements yeux)
    if (Math.random() < 0.01 * deltaTime / 16.6) { // ~1% par frame @60FPS
      this.triggerEyeSaccade();
    }

    // Dilatation pupilles selon luminosité scene
    this.updatePupilDilation();
  }

  private triggerBlink(): void {
    // Animation clignement: 150ms total (70ms close + 80ms open)
    // Courbe: ease-in-out quadratic
  }

  private triggerEyeSaccade(): void {
    // Micro-mouvement 1-3° dans direction aléatoire
    // Durée: 50-100ms
  }
}
```

---

### 3. Enhanced ThreeJSRenderer v2 (~/avatar/floating/)

**Fichiers:**
- `ThreeJSAvatarRenderer.ts` (refactor, +200L)
- `PBRMaterialSystem.ts` (nouveau, ~150L)
- `StudioLightingRig.ts` (nouveau, ~100L)
- `PostProcessingPipeline.ts` (nouveau, ~150L)

**Améliorations Rendering:**

#### A. Anti-Aliasing & Qualité
```typescript
// TAA (Temporal Anti-Aliasing) pour qualité premium
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { TAARenderPass } from 'three/examples/jsm/postprocessing/TAARenderPass';

class EnhancedRenderer {
  private composer: EffectComposer;
  private taaPass: TAARenderPass;

  setupPostProcessing(): void {
    this.composer = new EffectComposer(this.renderer);

    // Pass 1: Rendu de base
    const renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(renderPass);

    // Pass 2: TAA (meilleur que MSAA pour performance)
    this.taaPass = new TAARenderPass(this.scene, this.camera);
    this.taaPass.sampleLevel = 3; // 0-5, 3 = bon compromis
    this.taaPass.unbiased = true;
    this.composer.addPass(this.taaPass);

    // Pass 3: Bloom subtil (pour lueurs douces)
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(width, height),
      0.3,  // strength (subtil)
      0.4,  // radius
      0.85  // threshold
    );
    this.composer.addPass(bloomPass);
  }

  render(): void {
    this.composer.render();
  }
}
```

#### B. PBR Materials (Physically Based Rendering)
```typescript
class PBRMaterialSystem {
  createSkinMaterial(): THREE.MeshStandardMaterial {
    return new THREE.MeshStandardMaterial({
      color: 0xffdbac,         // Teinte peau naturelle
      roughness: 0.6,          // Peau légèrement rugueuse
      metalness: 0.0,          // Peau non-métallique

      // Subsurface Scattering approximation
      emissive: 0xffebe6,
      emissiveIntensity: 0.05, // Légère translucidité

      // Maps (si disponibles)
      map: skinAlbedoTexture,
      normalMap: skinNormalTexture,
      roughnessMap: skinRoughnessTexture,
      aoMap: skinAOTexture,

      // Rendering
      side: THREE.FrontSide,
      transparent: false,
      depthWrite: true,
    });
  }

  createClothMaterial(style: AppearanceStyle): THREE.MeshStandardMaterial {
    const palette = COLOR_PALETTES[style.color_palette];

    return new THREE.MeshStandardMaterial({
      color: new THREE.Color(palette.primary),
      roughness: 0.8,          // Textile mat
      metalness: 0.1,          // Légère brillance fibres

      // Normal map pour texture tissu
      normalMap: fabricNormalTexture,
      normalScale: new THREE.Vector2(0.5, 0.5),

      // Ambient occlusion pour plis
      aoMap: fabricAOTexture,
      aoMapIntensity: 0.7,
    });
  }
}
```

#### C. Studio Lighting Rig (3-Point Enhanced)
```typescript
class StudioLightingRig {
  private keyLight: THREE.DirectionalLight;
  private fillLight: THREE.DirectionalLight;
  private rimLight: THREE.DirectionalLight;
  private ambientLight: THREE.AmbientLight;

  setup(style: AppearanceStyle): void {
    // KEY LIGHT: Principale, 45° front-right, warm
    this.keyLight = new THREE.DirectionalLight(0xfff5e6, 3.0);
    this.keyLight.position.set(3, 4, 3);
    this.keyLight.castShadow = true;
    this.keyLight.shadow.mapSize.width = 2048;  // Haute qualité
    this.keyLight.shadow.mapSize.height = 2048;
    this.keyLight.shadow.camera.near = 0.5;
    this.keyLight.shadow.camera.far = 20;
    this.keyLight.shadow.bias = -0.0005;
    this.keyLight.shadow.radius = 3; // Soft shadows

    // FILL LIGHT: Adoucit ombres, front-left, cool
    this.fillLight = new THREE.DirectionalLight(0xe6f2ff, 1.2);
    this.fillLight.position.set(-2, 2, 2);
    // Pas d'ombres pour fill light

    // RIM LIGHT: Contour, back-top, pour séparation fond
    this.rimLight = new THREE.DirectionalLight(0xffffff, 2.0);
    this.rimLight.position.set(-1, 5, -5);

    // AMBIENT: Base lumière, très faible
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.3);

    // Adapter selon style appearance
    this.applyStyleModifications(style);
  }

  applyStyleModifications(style: AppearanceStyle): void {
    switch (style.color_palette) {
      case 'nocturne':
        this.keyLight.color.setHex(0xaac5dd); // Bleuté
        this.keyLight.intensity = 2.0;
        this.ambientLight.intensity = 0.15;
        break;

      case 'montagne':
        this.keyLight.color.setHex(0xe6f2ff); // Froid
        this.rimLight.intensity = 2.5;
        break;

      case 'futuriste':
        // Ajouter néon cyan subtil
        const neonLight = new THREE.PointLight(0x00ffff, 0.5);
        neonLight.position.set(0, 2, -2);
        this.scene.add(neonLight);
        break;
    }
  }
}
```

#### D. Dynamic Resolution Scaling (DRS)
```typescript
class DynamicResolutionScaling {
  private targetFPS: number = 60;
  private currentScale: number = 1.0;
  private minScale: number = 0.5;
  private maxScale: number = 2.0; // Pour écrans haute densité

  update(actualFPS: number, deltaTime: number): void {
    // Ajuster résolution dynamiquement pour maintenir FPS
    if (actualFPS < this.targetFPS - 5) {
      this.currentScale = Math.max(this.minScale, this.currentScale - 0.05);
    } else if (actualFPS > this.targetFPS + 5) {
      this.currentScale = Math.min(this.maxScale, this.currentScale + 0.02);
    }

    // Appliquer nouveau scale
    const width = window.innerWidth * this.currentScale;
    const height = window.innerHeight * this.currentScale;
    this.renderer.setSize(width, height, false);
    this.composer.setSize(width, height);
  }
}
```

---

### 4. CameraDynamismEngine (~/avatar/camera/)

**Fichier:** `CameraDynamismEngine.ts` (~300L)

**Responsabilités:**
- Zoom intelligent selon intensité vocale
- Breathing parallax (oscillation légère)
- Auto-focus visage
- Auto-centering si déplacement
- 3 modes: Portrait / Torse / Full-Body

**Interface:**
```typescript
interface CameraDynamismEngine {
  // Modes
  setMode(mode: CameraMode): void;
  getCurrentMode(): CameraMode;

  // Dynamic behavior
  updateVocalIntensity(rms: number): void;
  enableBreathingParallax(enable: boolean): void;
  setAutoCenter(enable: boolean): void;

  // Manual control
  zoom(factor: number, duration?: number): void;
  pan(x: number, y: number, duration?: number): void;
  lookAt(target: Vector3, duration?: number): void;

  // Update loop
  update(deltaTime: number): void;
}

type CameraMode = 'portrait' | 'torso' | 'fullbody';

interface CameraConfig {
  portrait: {
    distance: 0.8;  // Très proche, cadre visage
    fov: 50;
    height: 1.6;    // Hauteur yeux
    target: [0, 1.55, 0]; // Centre visage
  };
  torso: {
    distance: 1.5;  // Moyen, épaules visibles
    fov: 45;
    height: 1.5;
    target: [0, 1.3, 0]; // Haut du torse
  };
  fullbody: {
    distance: 3.0;  // Large, corps entier
    fov: 40;
    height: 1.2;
    target: [0, 0.9, 0]; // Centre de masse
  };
}
```

**Comportements Dynamiques:**
```typescript
class CameraDynamismEngine {
  private breathingPhase: number = 0;
  private vocalIntensity: number = 0;
  private autoCenter: boolean = true;

  update(deltaTime: number): void {
    // 1. Breathing parallax (oscillation subtile)
    if (this.breathingParallaxEnabled) {
      this.breathingPhase += deltaTime * 0.001; // ~1 cycle/6s
      const offsetY = Math.sin(this.breathingPhase) * 0.02; // ±2cm
      const offsetX = Math.cos(this.breathingPhase * 0.7) * 0.01; // ±1cm

      this.camera.position.x += offsetX;
      this.camera.position.y += offsetY;
    }

    // 2. Zoom selon intensité vocale
    const targetFOV = this.baseFOV - (this.vocalIntensity * 5); // Max -5°
    this.camera.fov = THREE.MathUtils.lerp(
      this.camera.fov,
      targetFOV,
      deltaTime * 0.002 // Transition douce
    );
    this.camera.updateProjectionMatrix();

    // 3. Auto-focus visage (si avatar bouge)
    if (this.autoCenter && this.avatarMoved) {
      const targetPos = this.getAvatarHeadPosition();
      this.camera.lookAt(targetPos);
    }

    // 4. Smooth transitions lors changement mode
    if (this.transitionActive) {
      this.updateModeTransition(deltaTime);
    }
  }

  updateVocalIntensity(rms: number): void {
    // RMS audio (0.0-1.0) → intensité camera
    this.vocalIntensity = THREE.MathUtils.clamp(rms, 0, 1);
  }

  setMode(mode: CameraMode): void {
    const config = this.cameraConfigs[mode];

    // Transition animée (1s)
    this.animateCameraTransition({
      position: new THREE.Vector3(0, config.height, config.distance),
      target: new THREE.Vector3(...config.target),
      fov: config.fov,
      duration: 1000, // ms
    });
  }
}
```

---

### 5. Real-Time Voice Reactions (~/avatar/voice/)

**Fichier:** `VoiceReactionSystem.ts` (~200L)

**Responsabilités:**
- Micro-mouvements tête synchronisés voix
- Vibration torse selon intensité
- Soulèvement épaules phrases longues
- Respiration synchronisée

**Interface:**
```typescript
interface VoiceReactionSystem {
  analyzeAudio(audioBuffer: AudioBuffer): AudioAnalysis;
  updateReactions(analysis: AudioAnalysis, deltaTime: number): void;
  setIntensityMultiplier(multiplier: number): void;
}

interface AudioAnalysis {
  rms: number;           // Volume RMS (0.0-1.0)
  pitch: number;         // Fréquence Hz
  intensity: number;     // Intensité vocale (0.0-1.0)
  isVoiced: boolean;     // Parole active
  breathingPhase: number; // Phase respiration (0.0-1.0)
}
```

**Réactions Physiques:**
```typescript
class VoiceReactionSystem {
  updateReactions(analysis: AudioAnalysis, deltaTime: number): void {
    if (!this.avatarMeshes) return;

    const { rms, intensity, isVoiced, breathingPhase } = analysis;

    // 1. Micro-mouvements tête
    if (isVoiced && intensity > 0.3) {
      // Légère rotation tête selon intensité
      const headBone = this.avatarMeshes.bones.get('head');
      if (headBone) {
        const rotationAmount = intensity * 0.05; // Max 2.86°
        headBone.rotation.y += Math.sin(Date.now() * 0.005) * rotationAmount;
        headBone.rotation.x += Math.cos(Date.now() * 0.003) * rotationAmount * 0.5;
      }
    }

    // 2. Vibration torse (très subtile)
    if (rms > 0.2) {
      const torsoBone = this.avatarMeshes.bones.get('spine');
      if (torsoBone) {
        const vibrationY = Math.sin(Date.now() * 0.02) * rms * 0.002;
        torsoBone.position.y += vibrationY;
      }
    }

    // 3. Soulèvement épaules (phrases longues)
    if (intensity > 0.5 && this.phraseDuration > 2000) { // >2s
      const leftShoulder = this.avatarMeshes.bones.get('leftShoulder');
      const rightShoulder = this.avatarMeshes.bones.get('rightShoulder');

      if (leftShoulder && rightShoulder) {
        const lift = Math.sin(breathingPhase * Math.PI) * 0.01;
        leftShoulder.position.y += lift;
        rightShoulder.position.y += lift;
      }
    }

    // 4. Respiration synchronisée
    this.updateBreathingAnimation(breathingPhase);
  }

  private updateBreathingAnimation(phase: number): void {
    // Expansion cage thoracique
    const chestBone = this.avatarMeshes.bones.get('chest');
    if (chestBone) {
      const expansion = Math.sin(phase * Math.PI) * 0.015; // ±1.5cm
      chestBone.scale.x = 1.0 + expansion;
      chestBone.scale.z = 1.0 + expansion;
    }
  }
}
```

---

## 🔄 PIPELINE AUDIO→VISUEL CENTRAL

```typescript
class AudioVisualSyncEngine {
  private lipSyncEngine: LipSyncPrecisionEngine;
  private expressionEngine: FacialExpressionEngine;
  private cameraEngine: CameraDynamismEngine;
  private voiceReactions: VoiceReactionSystem;
  private renderer: EnhancedThreeJSRenderer;

  private audioContext: AudioContext;
  private analyser: AnalyserNode;
  private audioBuffer: Float32Array;

  constructor() {
    this.setupAudioPipeline();
  }

  private setupAudioPipeline(): void {
    this.audioContext = new AudioContext();
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 2048;
    this.audioBuffer = new Float32Array(this.analyser.fftSize);
  }

  // Pipeline principal temps réel
  update(deltaTime: number): void {
    // 1. Analyser audio
    this.analyser.getFloatTimeDomainData(this.audioBuffer);
    const audioAnalysis = this.analyzeAudioFrame(this.audioBuffer);

    // 2. Extraire phonèmes
    const currentPhoneme = this.lipSyncEngine.analyzePhonemes(this.audioBuffer)[0];
    const predictedPhoneme = this.lipSyncEngine.predictNextPhoneme(
      currentPhoneme,
      this.phonemeHistory
    );

    // 3. Calculer morph weights
    const morphWeights = this.lipSyncEngine.generateMorphWeights(predictedPhoneme);

    // 4. Appliquer lip-sync
    this.renderer.applyMorphTargets(morphWeights);

    // 5. Mettre à jour expressions
    this.expressionEngine.applyMicroMovements(deltaTime);

    // 6. Réactions corporelles
    this.voiceReactions.updateReactions(audioAnalysis, deltaTime);

    // 7. Caméra dynamique
    this.cameraEngine.updateVocalIntensity(audioAnalysis.rms);
    this.cameraEngine.update(deltaTime);

    // 8. Rendu final
    this.renderer.render();
  }

  private analyzeAudioFrame(buffer: Float32Array): AudioAnalysis {
    // Calculer RMS
    let sum = 0;
    for (let i = 0; i < buffer.length; i++) {
      sum += buffer[i] * buffer[i];
    }
    const rms = Math.sqrt(sum / buffer.length);

    // Détection pitch (autocorrélation)
    const pitch = this.detectPitch(buffer);

    // Intensité vocale (RMS normalisé)
    const intensity = Math.min(rms * 10, 1.0);

    // Voiced/unvoiced
    const isVoiced = intensity > 0.1 && pitch > 80;

    return { rms, pitch, intensity, isVoiced, breathingPhase: 0 };
  }
}
```

---

## 📊 PERFORMANCE TARGETS

| Métrique | Target | Méthode Mesure |
|----------|--------|----------------|
| **FPS** | 60-120 constant | performance.now() |
| **CPU Usage** | <20% | Chrome DevTools |
| **GPU Usage** | <60% | WebGL stats |
| **RAM** | <500MB | performance.memory |
| **Latency Audio→Visuel** | <50ms | Timestamp sync |
| **Lip-Sync Accuracy** | >90% | Visual inspection |
| **Frame Drops** | <1% | FrameDropDetector |

---

## 🧪 STRATÉGIE DE TEST

### Tests Unitaires (Vitest)
```typescript
describe('LipSyncPrecisionEngine', () => {
  it('should map phoneme "m" to closed lips');
  it('should predict next phoneme with 80% accuracy');
  it('should interpolate morph weights smoothly');
  it('should handle rapid phoneme changes');
});

describe('FacialExpressionEngine', () => {
  it('should trigger blink every 7-20 seconds');
  it('should blend expressions smoothly');
  it('should maintain eye contact during active listening');
});

describe('CameraDynamismEngine', () => {
  it('should zoom in when vocal intensity increases');
  it('should auto-center after avatar movement');
  it('should transition between modes in 1s');
});
```

### Tests Intégration
```typescript
describe('Audio-Visual Sync', () => {
  it('should sync lip movement with audio within 50ms');
  it('should handle rapid dialogue without lag');
  it('should maintain 60 FPS during intense expressions');
  it('should adapt to style changes without stutter');
});
```

### Tests Visuels (Manual + Screenshots)
- Capture frames clés
- Comparaison avant/après
- Validation qualité visuelle
- Test sur différents GPU

---

## 📁 STRUCTURE FICHIERS

```
src/modules/avatar/
├── lipsync/
│   ├── LipSyncPrecisionEngine.ts       (~400L)
│   ├── PhonemeAnalyzer.ts              (~150L)
│   ├── MorphTargetMapper.ts            (~100L)
│   └── phoneme-mappings.ts             (data)
│
├── expressions/
│   ├── FacialExpressionEngine.ts       (~350L)
│   ├── MicroGestureController.ts       (~150L)
│   ├── BlinkController.ts              (~80L)
│   ├── GazeController.ts               (~120L)
│   └── expression-presets.ts           (data)
│
├── camera/
│   ├── CameraDynamismEngine.ts         (~300L)
│   ├── camera-configs.ts               (data)
│   └── camera-transitions.ts           (~100L)
│
├── voice/
│   ├── VoiceReactionSystem.ts          (~200L)
│   └── AudioAnalyzer.ts                (~150L)
│
├── rendering/
│   ├── EnhancedThreeJSRenderer.ts      (refactor, +200L)
│   ├── PBRMaterialSystem.ts            (~150L)
│   ├── StudioLightingRig.ts            (~100L)
│   ├── PostProcessingPipeline.ts       (~150L)
│   └── DynamicResolutionScaling.ts     (~80L)
│
├── core/
│   ├── AudioVisualSyncEngine.ts        (~300L)
│   └── PerformanceMonitor.ts           (~100L)
│
└── tests/
    ├── lipsync.test.ts
    ├── expressions.test.ts
    ├── camera.test.ts
    ├── audio-visual-sync.test.ts
    └── performance.test.ts
```

**Total Estimé:** ~3,300 lignes nouveau code + refactoring

---

## 🎯 ROADMAP IMPLÉMENTATION

### Phase 1: Fondations (Semaine 1)
- [x] Architecture document
- [ ] LipSyncPrecisionEngine v2
- [ ] FacialExpressionEngine v2
- [ ] Tests unitaires base

### Phase 2: Rendu Premium (Semaine 2)
- [ ] Enhanced ThreeJSRenderer
- [ ] PBR Materials System
- [ ] Studio Lighting Rig
- [ ] Post-Processing Pipeline

### Phase 3: Dynamisme (Semaine 3)
- [ ] CameraDynamismEngine
- [ ] VoiceReactionSystem
- [ ] AudioVisualSyncEngine
- [ ] Tests intégration

### Phase 4: Optimisation (Semaine 4)
- [ ] Performance profiling
- [ ] GPU/CPU optimization
- [ ] Memory leak fixes
- [ ] DRS implementation

### Phase 5: Polish (Semaine 5)
- [ ] UI Popup enhancement
- [ ] Appearance style integration
- [ ] Final testing
- [ ] Documentation

---

## ✅ SUCCESS CRITERIA

- [ ] Lip-sync précision visuelle >90%
- [ ] FPS stable 60-120 constant
- [ ] Latency audio→visuel <50ms
- [ ] CPU usage <20%
- [ ] RAM <500MB
- [ ] Expressions naturelles et fluides
- [ ] Caméra réactive sans saccades
- [ ] Intégration appearance v24.9 complète
- [ ] Tests 100% pass
- [ ] Documentation complète

---

**Document Vivant — Mise à jour continue pendant implémentation**
**Prochaine étape:** Implémentation LipSyncPrecisionEngine v2
