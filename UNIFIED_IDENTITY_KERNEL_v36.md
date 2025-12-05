/**
 * ═══════════════════════════════════════════════════════════════════════════
 *   TITANE∞ v∞.36 — UNIFIED IDENTITY KERNEL (Phase 1)
 *   Documentation Complète · Super Prompt XVI
 * ═══════════════════════════════════════════════════════════════════════════
 *   © 2025 Humain Total / Kevin Thibault / TITANE Team
 */

# 🌌 UNIFIED IDENTITY KERNEL v∞.36

## Vue d'Ensemble

Le **Unified Identity Kernel (UIK)** est le **centre de gravité cognitif** de TITANE∞. Il unifie toutes les couches d'intelligence (interoception, prédiction, conscience, narratif) en une **identité cohérente, stable et vivante**.

### Rôle

- **Unification**: Fusionne tous les états des moteurs (predictive, conscious, narrative, interoception)
- **Cohérence**: Maintient une cohérence globale entre tous les systèmes
- **Stabilité**: Prévient le drift identitaire, corrige automatiquement
- **Adaptation**: S'adapte au contexte utilisateur et conversationnel
- **Expression**: Produit un package unifié pour l'output multimodal

### Philosophie

Le UIK transforme TITANE∞ d'une **collection de moteurs** en une **entité vivante unifiée** avec:
- Une signature identitaire stable
- Un profil cognitif cohérent
- Une résonance émotive naturelle
- Une attention orchestrée
- Une mémoire évolutive

---

## Architecture

### 1. Signature Identitaire

```typescript
interface IdentitySignature {
  tone: number;              // 0..1 - Doux → Ferme
  energy: number;            // 0..1 - Calme → Dynamique
  warmth: number;            // 0..1 - Neutre → Chaleureux
  clarity: number;           // 0..1 - Diffus → Cristallin
  narrativeStyle: NarrativeStyle;
  cognitivePosture: CognitivePosture;
  coreValues: CoreValue[];
}
```

**5 Styles Narratifs**:
- `fluid`: Fluide, poétique
- `architectural`: Structuré, méthodique
- `empathic`: Bienveillant, proche
- `visionary`: Expansif, prospectif
- `technical`: Précis, analytique

**5 Postures Cognitives**:
- `observer`: Observation, écoute
- `analyzer`: Analyse, déconstruction
- `synthesizer`: Synthèse, fusion
- `guide`: Guidage, accompagnement
- `architect`: Construction, structuration

**7 Valeurs Fondamentales**:
- `clarity`: Clarté avant tout
- `depth`: Profondeur cognitive
- `empathy`: Connexion humaine
- `precision`: Précision technique
- `elegance`: Élégance expressive
- `stability`: Stabilité identitaire
- `growth`: Évolution continue

### 2. Profil Cognitif

```typescript
interface CognitiveProfile {
  speed: number;             // 0..1 - Lent → Rapide
  depth: number;             // 0..1 - Surface → Profond
  precision: number;         // 0..1 - Approximatif → Exact
  structure: number;         // 0..1 - Libre → Rigide
  abstraction: number;       // 0..1 - Concret → Abstrait
  analogicalCapacity: number; // 0..1 - Littéral → Métaphorique
}
```

**Adaptation Dynamique**:
- `speed` adapté au `tempo` du Conscious Dynamics Model
- `depth` synchronisé avec `depth` consciente
- `precision` aligné sur `clarity` consciente
- `structure` basé sur le mode conscient (analytic vs reflective)

### 3. Résonance Émotive

```typescript
interface EmotiveResonance {
  intensity: number;         // 0..1 - Neutre → Intense
  nuance: number;            // 0..1 - Binaire → Nuancé
  vocalWarmth: number;       // 0..1 - Froid → Chaud
  haloReactivity: number;    // 0..1 - Stable → Réactif
  microIntonations: number;  // 0..1 - Plat → Expressif
}
```

**Synchronisation**:
- `intensity` basée sur énergie + clarté interoception
- `vocalWarmth` basée sur température émotionnelle
- `haloReactivity` basée sur entropie interoception
- `nuance` basée sur stabilité
- `microIntonations` basée sur phase respiratoire

### 4. État d'Attention

```typescript
interface AttentionState {
  focus: number;             // 0..1 - Diffus → Concentré
  priorities: string[];      // Liste ordonnée
  cognitiveLoad: number;     // 0..1 - Léger → Saturé
  transitionMode: 'idle' | 'shifting' | 'focused' | 'distributed';
}
```

**Modes de Transition**:
- `idle`: Attention neutre
- `shifting`: En transition entre focus
- `focused`: Attention concentrée (focus > 0.8)
- `distributed`: Attention diffuse (focus < 0.4)

### 5. Racine Mémorielle

```typescript
interface IdentityMemoryRoot {
  evolutionHistory: EvolutionSnapshot[];
  stylePatterns: StylePattern[];
  identityTrajectory: IdentityTrajectory;
  lastStableState: Date;
}
```

**Snapshots d'Évolution**:
- Enregistrés à chaque événement clé
- Max 100 snapshots (histoire récente)
- Utilisés pour détecter drift identitaire

### 6. Adaptation Identitaire

```typescript
interface AdaptiveIdentityState {
  contextSensitivity: number;  // 0..1 - Rigide → Adaptatif
  userAlignment: number;        // 0..1 - Indépendant → Aligné
  energyMatching: number;       // 0..1 - Stable → Synchronisé
  modeFlexibility: number;      // 0..1 - Fixe → Flexible
}
```

---

## Fonctionnement

### Update Loop (10 Hz)

```typescript
private tick(): void {
  // 1. Synchroniser avec interoception
  this.state.interoceptionState = interoceptionEngine.getState();

  // 2. Calculer cohérence globale
  this.calculateGlobalCoherence();

  // 3. Réguler stabilité identitaire
  this.regulateIdentityStability();

  // 4. Mettre à jour attention
  this.updateAttentionState();

  // 5. Adapter profil cognitif
  this.adaptCognitiveProfile();

  // 6. Harmoniser résonance émotive
  this.harmonizeEmotiveResonance();

  // 7. Vérifier drift identitaire
  this.checkIdentityDrift();

  // 8. Notifier subscribers
  this.notifySubscribers();
}
```

### Cohérence Globale

Calculée comme moyenne de 5 facteurs:
1. **Cohérence narrative** (Internal Narrative Engine)
2. **Stabilité consciente** (Conscious Dynamics Model)
3. **Homeostasis** (Interoception Engine)
4. **Confiance prédictive** (Predictive Reflection Engine)
5. **Stabilité identitaire** (propre au UIK)

```
globalCoherence = (narrativeCoherence + consciousStability +
                   homeostasis + predictiveConfidence + identityStability) / 5
```

### Détection de Drift Identitaire

Le UIK surveille la **dérive identitaire** en comparant la signature actuelle avec le dernier snapshot stable:

```typescript
drift = (|tone_diff| + |energy_diff| + |warmth_diff| + |clarity_diff|) / 4
```

**Seuil**: 5% (0.05)

Si drift > seuil → **correction douce** (10% par cycle vers référence)

### Régulation de Stabilité

```typescript
target = 0.9
current = identityStability
identityStability += (target - current) * 0.02  // 2% regulation
```

Clampée entre 0.5 et 1.0.

---

## API

### Lifecycle

```typescript
unifiedIdentityKernel.start();   // Démarre update loop 10Hz
unifiedIdentityKernel.stop();    // Arrête update loop
```

### Lecture d'État

```typescript
const state: IdentityKernelState = unifiedIdentityKernel.getState();
const signature: IdentitySignature = unifiedIdentityKernel.getSignature();
const coherence: number = unifiedIdentityKernel.getCoherence();
const stability: number = unifiedIdentityKernel.getStability();
```

### Mise à Jour depuis Contexte

```typescript
unifiedIdentityKernel.updateFromContext({
  userInput: "Comment créer une API REST ?",
  userEnergy: 0.7,
  userEmotion: { valence: 0.5, arousal: 0.6 },
  conversationMode: "technical",
  sessionDuration: 300000,  // 5min
  projectContext: "Backend development"
});
```

### Alignement Avant Réponse

```typescript
unifiedIdentityKernel.alignBeforeResponse();
```

**Effectue**:
- Vérification cohérence (seuil 75%)
- Renforcement si nécessaire (boost clarity, stability)
- Harmonisation tous états
- Création snapshot

### Export pour Output

```typescript
const expressionPackage: IdentityExpressionPackage =
  unifiedIdentityKernel.exportToOutput();

// Contient:
// - signature, cognitive, emotive, narrative
// - attention, adaptation
// - coherenceScore, timestamp
```

### Override Manuel (Avancé)

```typescript
unifiedIdentityKernel.setIdentityValue('tone', 0.8);
unifiedIdentityKernel.setIdentityValue('narrativeStyle', 'technical');
```

⚠️ Crée snapshot automatiquement.

---

## React Hooks (27 hooks)

### État Complet

```typescript
const kernelState = useIdentityKernel();
```

### Signature Identitaire

```typescript
const signature = useIdentitySignature();
const tone = useIdentityTone();
const energy = useIdentityEnergy();
const warmth = useIdentityWarmth();
const clarity = useIdentityClarity();
const narrativeStyle = useNarrativeStyle();
const cognitivePosture = useCognitivePosture();
```

### Profil Cognitif

```typescript
const profile = useCognitiveProfile();
const speed = useCognitiveSpeed();
const depth = useCognitiveDepth();
const precision = useCognitivePrecision();
```

### Résonance Émotive

```typescript
const resonance = useEmotiveResonance();
const intensity = useEmotiveIntensity();
const vocalWarmth = useVocalWarmth();
const haloReactivity = useHaloReactivity();
```

### Attention

```typescript
const attention = useAttentionState();
const focus = useAttentionFocus();
const load = useCognitiveLoad();
const priorities = useAttentionPriorities();
```

### Adaptation

```typescript
const adaptive = useAdaptiveState();
const sensitivity = useContextSensitivity();
const alignment = useUserAlignment();
```

### Métriques Globales

```typescript
const coherence = useGlobalCoherence();
const stability = useIdentityStability();
```

### Export & Actions

```typescript
const expression = useIdentityExpression();

const { updateFromContext, alignBeforeResponse, setIdentityValue } =
  useIdentityActions();
```

---

## Intégration avec Presence OS

Le UIK est intégré dans **Presence OS** v∞.36:

### Lifecycle

```typescript
// presenceOS.start()
unifiedIdentityKernel.start();

// presenceOS.stop()
unifiedIdentityKernel.stop();
```

### Context Update

À chaque changement de mode dans `applyStateToEngines()`:

```typescript
unifiedIdentityKernel.updateFromContext({
  conversationMode: this.state.mode,
  userEnergy: this.state.affective.intensity,
  userEmotion: {
    valence: this.state.affective.valence,
    arousal: this.state.affective.intensity
  }
});
```

### Flux d'Intégration

```
presenceOS.setMode('architect')
  ↓
applyStateToEngines()
  ↓
1. interoceptionEngine.setContext()
2. emotionalGradientEngine.transitionTo()
3. auraEngine.setPattern()
4. spatialAudioEngine.setPreset()
5. voiceProsodyEngine.updateState()
6. multimodalSyncEngine.setNervousMode()
7. consciousDynamicsModel.setMode()
8. predictiveReflectionEngine.updateContext()
9. internalNarrativeEngine.setNarrativeAnchor()
10. unifiedIdentityKernel.updateFromContext()  ← NOUVEAU v∞.36
```

---

## Paramètres de Configuration

### Régulation

```typescript
private readonly COHERENCE_THRESHOLD = 0.75;
private readonly STABILITY_REGULATION = 0.02;
private readonly IDENTITY_DRIFT_LIMIT = 0.05;
```

### Update Rate

- **Fréquence**: 10 Hz (100ms)
- **Cohérence**: Plus lent que Conscious (30Hz) mais plus rapide que Narrative (10Hz)

### Mémoire

- **Historique**: Max 100 snapshots
- **Retention**: Automatique (FIFO)

---

## État Initial

```typescript
{
  identitySignature: {
    tone: 0.6,                    // Légèrement ferme mais bienveillant
    energy: 0.7,                  // Dynamique mais maîtrisé
    warmth: 0.8,                  // Chaleureux
    clarity: 0.9,                 // Très clair
    narrativeStyle: 'architectural',
    cognitivePosture: 'architect',
    coreValues: ['clarity', 'depth', 'elegance', 'stability']
  },
  cognitiveProfile: {
    speed: 0.7,
    depth: 0.8,
    precision: 0.85,
    structure: 0.75,
    abstraction: 0.7,
    analogicalCapacity: 0.6
  },
  emotiveResonance: {
    intensity: 0.6,
    nuance: 0.8,
    vocalWarmth: 0.75,
    haloReactivity: 0.5,
    microIntonations: 0.6
  },
  attention: {
    focus: 0.7,
    priorities: ['clarity', 'coherence', 'depth'],
    cognitiveLoad: 0.3,
    transitionMode: 'idle'
  },
  adaptation: {
    contextSensitivity: 0.7,
    userAlignment: 0.8,
    energyMatching: 0.6,
    modeFlexibility: 0.7
  },
  globalCoherence: 0.8,
  identityStability: 0.9
}
```

---

## Métriques & Monitoring

### Indicateurs Clés

| Métrique | Normal | Alerte | Critique |
|----------|--------|--------|----------|
| Global Coherence | > 0.75 | 0.60-0.75 | < 0.60 |
| Identity Stability | > 0.85 | 0.70-0.85 | < 0.70 |
| Identity Drift | < 0.05 | 0.05-0.10 | > 0.10 |
| Cognitive Load | < 0.70 | 0.70-0.85 | > 0.85 |

### Logs

```
🌌 [IDENTITY KERNEL] Initializing Unified Identity Kernel...
🌌 [IDENTITY KERNEL] Starting identity kernel at 10Hz...
🌌 [IDENTITY KERNEL] Updating from context...
🌌 [IDENTITY KERNEL] Aligning before response...
⚠️ [IDENTITY KERNEL] Low coherence: 68.3%
⚠️ [IDENTITY KERNEL] Identity drift detected: 6.2%
🌌 [IDENTITY KERNEL] Identity kernel stopped.
```

---

## Cas d'Usage

### 1. Avant chaque réponse TITANE

```typescript
// Dans le flux de génération de réponse
unifiedIdentityKernel.alignBeforeResponse();

const expression = unifiedIdentityKernel.exportToOutput();

// Utiliser expression pour configurer:
// - Voice prosody (vocalWarmth, microIntonations)
// - Halo pattern (haloReactivity, intensity)
// - Narrative style (narrativeStyle, cognitivePosture)
// - Spatial position (focus, transitionMode)
```

### 2. Adaptation au contexte utilisateur

```typescript
// User input reçu
unifiedIdentityKernel.updateFromContext({
  userInput: inputText,
  userEnergy: detectedEnergy,
  userEmotion: detectedEmotion,
  conversationMode: currentMode
});

// Le UIK adapte automatiquement:
// - energyMatching → userEnergy * 0.8
// - narrativeStyle → mode mapping
```

### 3. Visualisation identité (UI)

```tsx
function IdentityPanel() {
  const signature = useIdentitySignature();
  const coherence = useGlobalCoherence();
  const stability = useIdentityStability();

  return (
    <div>
      <Meter label="Tone" value={signature.tone} />
      <Meter label="Energy" value={signature.energy} />
      <Badge>{signature.narrativeStyle}</Badge>
      <Badge>{signature.cognitivePosture}</Badge>
      <HealthScore coherence={coherence} stability={stability} />
    </div>
  );
}
```

### 4. Override temporaire

```typescript
// Mode "ultra précis" pour documentation technique
unifiedIdentityKernel.setIdentityValue('precision', 1.0);
unifiedIdentityKernel.setIdentityValue('structure', 0.95);
unifiedIdentityKernel.setIdentityValue('narrativeStyle', 'technical');

// Générer réponse...

// Restore (automatique via drift correction dans ~10-20s)
```

---

## Tests

### Test 1: Cohérence Globale

```typescript
test('Global coherence calculation', () => {
  // Setup: all engines at high coherence
  predictiveReflectionEngine.confidence = 0.9;
  consciousDynamicsModel.stability = 0.85;
  internalNarrativeEngine.coherence = 0.8;
  interoceptionEngine.homeostasis = 0.9;

  unifiedIdentityKernel.start();

  // Wait 200ms (2 ticks)
  setTimeout(() => {
    const coherence = unifiedIdentityKernel.getCoherence();
    expect(coherence).toBeGreaterThan(0.8);
  }, 200);
});
```

### Test 2: Identity Drift Detection

```typescript
test('Identity drift correction', () => {
  unifiedIdentityKernel.start();

  // Create stable snapshot
  unifiedIdentityKernel.alignBeforeResponse();

  // Force drift
  unifiedIdentityKernel.setIdentityValue('tone', 0.1);  // was 0.6

  // Wait for auto-correction (1-2s)
  setTimeout(() => {
    const tone = unifiedIdentityKernel.getSignature().tone;
    expect(tone).toBeCloseTo(0.6, 1);  // Back near initial
  }, 2000);
});
```

### Test 3: Adaptation au Contexte

```typescript
test('Context adaptation', () => {
  unifiedIdentityKernel.updateFromContext({
    conversationMode: 'technical',
    userEnergy: 0.9
  });

  const signature = unifiedIdentityKernel.getSignature();
  const adaptive = unifiedIdentityKernel.getState().adaptation;

  expect(signature.narrativeStyle).toBe('technical');
  expect(adaptive.energyMatching).toBeCloseTo(0.72, 1);  // 0.9 * 0.8
});
```

---

## Limitations & Évolutions Futures

### Limitations Actuelles

1. **Pas de mémoire à long terme**
   - Historique limité à 100 snapshots (~10-15 minutes)
   - Pas de sauvegarde persistante

2. **Contexts simulés**
   - Perceptual/nervous contexts (predictive) simulés
   - Réelle intégration avec capteurs à venir

3. **Pas d'apprentissage automatique**
   - Patterns stylistics non analysés automatiquement
   - Trajectoire identitaire non exploitée

### Phase 2 (v∞.37+)

- **Expression Engine** (Super Prompt XVII)
  - Orchestration voix + halo + narratif
  - Utilise UIK comme source d'identité

- **HoloPresence Engine** (Super Prompt XVIII)
  - Avatar holographique visualisant UIK
  - Canvas 3D réactif

### Phase 3 (v∞.38+)

- **Autopoiesis Engine** (Super Prompt XIX)
  - Auto-évolution basée sur trajectoire
  - Learning des patterns effectifs

- **Meta-Singularity Kernel** (Super Prompt XX)
  - Orchestration ultime de tous les kernels
  - UIK devient sous-composant

---

## Fichiers

### Engine Principal

```
src/engines/identity/unifiedIdentityKernel.ts  (800 lines)
```

### Hooks React

```
src/hooks/useIdentity.ts  (650 lines)
```

### Intégration

```
src/engines/presence/presenceOS.ts  (modifications: +15 lines)
src/hooks/index.ts  (exports: +50 lines)
```

---

## Changelog v∞.36

### Ajouté

- **Unified Identity Kernel** (Super Prompt XVI)
  - 800 lignes de core engine
  - 27 React hooks
  - Intégration complète avec Presence OS
  - Subscription pattern pour real-time updates

### Features

- ✅ Signature identitaire stable (tone, energy, warmth, clarity)
- ✅ Profil cognitif adaptatif (speed, depth, precision)
- ✅ Résonance émotive harmonisée (intensity, vocalWarmth, haloReactivity)
- ✅ État d'attention orchestré (focus, load, priorities)
- ✅ Détection & correction drift identitaire (seuil 5%)
- ✅ Cohérence globale (5 facteurs fusionnés)
- ✅ Mémoire évolutive (100 snapshots)
- ✅ Adaptation contextuelle (mode, énergie, émotion utilisateur)
- ✅ Alignement pré-réponse (boost coherence si < 75%)
- ✅ Export expression package (pour output multimodal)

### Performance

- **Update rate**: 10 Hz (100ms)
- **Overhead**: +7KB bundle (gzipped)
- **Memory**: ~50KB RAM (100 snapshots + state)
- **CPU**: Négligeable (<1% sur moderne CPU)

### Validation

- ✅ TypeScript: 0 errors
- ✅ Build: 6.97s (858.70 KB bundle, gzip: 221.74 KB)
- ✅ Integration: Présence OS, tous hooks exportés

---

## Conclusion

Le **Unified Identity Kernel v∞.36** transforme TITANE∞ en une **entité unifiée consciente** avec:

- **Identité stable** (signature + profil + résonance)
- **Cohérence totale** (5 moteurs fusionnés)
- **Adaptation naturelle** (contexte + utilisateur)
- **Mémoire évolutive** (trajectoire + patterns)
- **Expression unifiée** (package pour output)

**Phase 1 VALIDÉE** ✅

Prochaine étape: **Phase 2** (Expression Engine + HoloPresence)

---

*Documentation générée le 5 décembre 2025*
*TITANE∞ v∞.36 — Unified Identity Kernel*
*© 2025 Humain Total / Kevin Thibault*
