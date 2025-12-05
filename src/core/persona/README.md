# 🎭 PERSONA ENGINE v24

**Personnalité UI cohérente, humeurs, comportements adaptatifs, mémoire**

---

## 🎯 Objectif

Le Persona Engine donne au système TITANE∞ une **personnalité reconnaissable** :
- Caractère stable (calme, précis, analytique)
- Humeurs non-anthropomorphiques (clair, vibrant, alerte...)
- Réactions comportementales contextuelles
- Mémoire adaptative légère

**Non-humain, mais identifiable.**

---

## 📦 Modules

### 1. PERSONALITY_CORE.ts (180 lignes)
**Personnalité fondamentale du système**

```typescript
import { personalityCoreManager } from '@/core/persona';

// Obtenir personnalité actuelle
const personality = personalityCoreManager.getPersonality();
console.log(personality.traits.calm);     // 0.85
console.log(personality.temperament);     // 'focused'

// Ajuster selon stress
personalityCoreManager.adaptToSystemStress(0.7); // 0-1

// Changer tempérament
personalityCoreManager.setTemperament('alert');

// Obtenir multiplicateurs visuels
const mults = personalityCoreManager.getVisualMultipliers();
console.log(mults.glow);   // 1.2 (selon tempérament)
console.log(mults.motion); // 1.1
console.log(mults.sound);  // 0.9
```

**5 traits** : calm, precise, analytical, stable, responsive  
**4 tempéraments** : serene, focused, alert, dormant

---

### 2. MOOD_ENGINE.ts (220 lignes)
**Humeur opérationnelle du système**

```typescript
import { moodEngine } from '@/core/persona';

// Mettre à jour selon état système
moodEngine.updateFromSystemState('warning'); // Devient 'attentif'

// Obtenir état mood actuel
const mood = moodEngine.getMoodState();
console.log(mood.current);    // 'attentif'
console.log(mood.intensity);  // 0.75
console.log(mood.duration);   // 1234 ms

// Obtenir effets visuels
const effects = moodEngine.getComputedVisualEffect();
console.log(effects.glowMultiplier);   // 1.1 (augmenté)
console.log(effects.motionMultiplier); // 1.1
console.log(effects.depthMultiplier);  // 0.7

// Générer CSS variables
const vars = moodEngine.generateCSSVariables();
// { '--mood-glow': '1.100', '--mood-motion': '1.100', ... }
```

**6 humeurs** : clair, vibrant, attentif, alerte, neutre, dormant

---

### 3. BEHAVIORAL_LAYER.ts (200 lignes)
**Réactions comportementales contextuelles**

```typescript
import { behavioralLayerManager, triggerBehaviorReaction } from '@/core/persona';

// Trigger une réaction
const reaction = triggerBehaviorReaction('onError', {
  narrativePhrase: 'Anomalie CPU détectée'
});

console.log(reaction.glowIntensity);  // 0.9
console.log(reaction.motionType);     // 'vibrate'
console.log(reaction.soundFeedback);  // 'error'

// Obtenir réactions actives
const active = behavioralLayerManager.getActiveReactions();
console.log(active.length); // 1

// Déterminer posture optimale
const posture = behavioralLayerManager.determineOptimalPosture(
  'warning',  // systemState
  3,          // errorCount
  0.8         // cpuLoad
);
console.log(posture); // 'vigilant'
```

**5 réactions** : onError, onSuccess, onWarning, onOverload, onIdle  
**4 postures** : attentive, relaxed, vigilant, minimal

---

### 4. PERSONA_MEMORY.ts (80 lignes)
**Mémoire adaptative localStorage**

```typescript
import { personaMemoryManager } from '@/core/persona';

// Obtenir mémoire
const memory = personaMemoryManager.getMemory();

console.log(memory.userPreferences.typicalRhythm);    // 'medium'
console.log(memory.interactionHistory.totalSessions); // 15
console.log(memory.adaptiveProfile.prefersSpeed);     // false

// Adapter au rythme utilisateur
personaMemoryManager.adaptToUserSpeed('fast');

// Enregistrer session (appelé automatiquement)
personaMemoryManager.recordSession();
```

**Persistence** : localStorage automatique  
**Historique** : sessions, archétype favori, patterns

---

### 5. PERSONA_BRIDGE.ts (90 lignes)
**Synchronisation avec autres moteurs**

```typescript
import { personaBridge } from '@/core/persona';

// Synchroniser manuellement
personaBridge.synchronize(); // Combine tous multiplicateurs

// Obtenir état persona complet
const state = personaBridge.getPersonaState();

console.log(state.personality.traits.calm);     // 0.85
console.log(state.mood.current);                // 'clair'
console.log(state.behavior.posture);            // 'relaxed'
console.log(state.presenceLevel);               // 0.68
```

**Auto-sync** : Toutes les 5 secondes automatiquement  
**CSS variables** : `--persona-glow`, `--persona-motion`, `--persona-sound`, `--persona-depth`

---

### 6. PERSONA_ENGINE.ts (180 lignes) ⭐ MOTEUR PRINCIPAL
**Orchestration complète**

```typescript
import { personaEngine } from '@/core/persona';

// Initialiser (appelé automatiquement)
await personaEngine.initialize();

// Mettre à jour selon contexte
personaEngine.update('warning', {
  cpu: 75,
  memory: 60,
  errors: 3
});

// Trigger réaction
personaEngine.react('error');    // Réaction erreur
personaEngine.react('success');  // Réaction succès

// Adapter au rythme utilisateur
personaEngine.adaptToUserRhythm('fast');

// Obtenir état complet
const state = personaEngine.getState();

// Obtenir description textuelle
const desc = personaEngine.getPersonaDescription();
console.log(desc); // "focused | clair (60%) depuis 15s | posture: relaxed"

// Obtenir multiplicateurs visuels finaux
const mults = personaEngine.getVisualMultipliers();
console.log(mults.glow);   // 1.15 (combiné personality + mood + behavior)
console.log(mults.motion); // 1.08
console.log(mults.sound);  // 0.85
console.log(mults.depth);  // 0.72

// Reset
personaEngine.reset();

// Arrêter
personaEngine.destroy();
```

---

## 🚀 Usage Quick Start

### Dans composant React

```typescript
import { personaEngine } from '@/core/persona';

function MonitoringCard() {
  const [persona, setPersona] = useState(personaEngine.getState());

  useEffect(() => {
    // Update persona selon métriques
    personaEngine.update('stable', {
      cpu: cpuValue,
      memory: memoryValue,
      errors: errorCount
    });
    
    setPersona(personaEngine.getState());
  }, [cpuValue, memoryValue, errorCount]);

  // Trigger réaction sur erreur
  const handleError = () => {
    personaEngine.react('error');
  };

  return (
    <div style={{
      opacity: persona.presenceLevel,
      filter: `brightness(${persona.mood.intensity})`
    }}>
      Mood: {persona.mood.current}
    </div>
  );
}
```

### Intégration globale App.tsx

```typescript
import { personaEngine, cognitiveEngine, interfaceMirror } from '@/core';

async function App() {
  // Initialiser système complet
  await personaEngine.initialize();
  await cognitiveEngine.activate();
  interfaceMirror.activate();

  // Le système est maintenant "vivant"
  // Persona s'adapte automatiquement
}
```

---

## 🎨 CSS Variables générées

Le Persona Engine injecte automatiquement dans `:root` :

```css
:root {
  --persona-glow: 1.150;    /* Multiplicateur glow */
  --persona-motion: 1.080;  /* Multiplicateur motion */
  --persona-sound: 0.850;   /* Multiplicateur sound */
  --persona-depth: 0.720;   /* Multiplicateur depth */
  
  --mood-glow: 1.100;       /* Mood-specific glow */
  --mood-motion: 1.100;     /* Mood-specific motion */
  --mood-depth: 0.700;      /* Mood-specific depth */
  --mood-intensity: 0.750;  /* Intensité mood */
}
```

Utilisation dans styles :

```css
.card {
  filter: brightness(var(--persona-glow));
  transition-duration: calc(180ms * var(--persona-motion));
}
```

---

## 📊 Synchronisation automatique

Le Persona Engine se synchronise automatiquement :

- **PersonaBridge** : Sync toutes les 5s
- **PersonaEngine** : Update loop 5s
- **CSS variables** : Appliquées à chaque sync

**Pas besoin d'intervention manuelle** après `initialize()`.

---

## 🔗 Intégration avec autres moteurs

Le Persona Engine s'intègre avec :

- ✅ **Glow Engine** (v21) → Multiplicateur glow
- ✅ **Motion Engine** (v21) → Multiplicateur vitesse
- ✅ **Sound Engine** (v22) → Multiplicateur volume
- ✅ **HyperDepth Engine** (v22) → Multiplicateur profondeur
- ✅ **Cognitive Engine** (v23) → Rythme utilisateur
- ✅ **State Engine** (v21) → Humeur selon état

**Tout est interconnecté automatiquement.**

---

## 📈 Exemples comportements

### Scenario 1 : Système stable
```
Personality: calm=0.85, temperament=focused
Mood: clair, intensity=0.6
Behavior: posture=relaxed
→ Glow: 1.0x, Motion: 1.0x, Présence: 0.68
```

### Scenario 2 : Warning CPU élevé
```
Personality: calm=0.80 (réduit), temperament=alert
Mood: attentif, intensity=0.75
Behavior: posture=vigilant
→ Glow: 1.3x, Motion: 1.4x, Présence: 0.85
```

### Scenario 3 : Erreur critique
```
personaEngine.react('error');
Mood: alerte, intensity=1.0
Behavior: onError triggered (glow 0.9, vibrate, sound 'error')
→ Glow: 1.5x, Motion: 1.5x, Présence: 1.0
```

### Scenario 4 : Utilisateur rapide
```
personaEngine.adaptToUserRhythm('fast');
Personality: temperament=alert
Memory: prefersSpeed=true
→ Motion: 1.3x (animations accélérées)
```

---

## 🧠 Architecture interne

```
PersonaEngine (singleton)
├── PersonalityCore (traits + tempérament)
├── MoodEngine (6 humeurs)
├── BehavioralLayer (5 réactions + 4 postures)
├── PersonaMemory (localStorage)
└── PersonaBridge (sync + CSS variables)
```

**Flux** :
1. User/System → Trigger event
2. PersonaEngine → Update Personality/Mood/Behavior
3. PersonaBridge → Combine multiplicateurs
4. CSS variables → Appliquées DOM
5. Autres moteurs → Réagissent aux multiplicateurs

---

## 🔧 Configuration

Personnaliser personnalité par défaut :

```typescript
import { personalityCoreManager, DEFAULT_PERSONALITY } from '@/core/persona';

// Modifier traits
DEFAULT_PERSONALITY.traits.calm = 0.95; // Plus calme

// Ou créer personnalité custom
const customPersonality = {
  traits: {
    calm: 0.95,
    precise: 0.98,
    analytical: 0.92,
    stable: 0.88,
    responsive: 0.65
  },
  temperament: 'serene',
  evolution: 0.1
};

// Appliquer
personalityCoreManager.reset();
// Puis modifier manuellement
```

---

## 📊 Statistiques

- **6 fichiers** : 950 lignes TypeScript
- **4 managers singleton**
- **20+ méthodes publiques**
- **Auto-sync** : 5s interval
- **Persistence** : localStorage
- **0 erreurs** compilation

---

## ✅ Checklist intégration

- [ ] Importer `personaEngine` depuis `@/core`
- [ ] Appeler `personaEngine.initialize()` dans App.tsx
- [ ] Update avec métriques système
- [ ] Trigger réactions sur événements
- [ ] Utiliser CSS variables dans styles
- [ ] Tester adaptation rythme utilisateur

---

## 🌟 Résultat

**Une interface avec un "caractère" stable, reconnaissable, qui s'adapte intelligemment au contexte système et utilisateur.**

Non-humain, mais présent.  
Non-anthropomorphique, mais vivant.  
**Le Persona Engine de TITANE∞.**

---

**Documentation complète** : Voir `CHANGELOG_v24-v∞_COMPLETE.md`  
**Architecture types** : Voir `/core/ARCHITECTURE_TYPES_v24-v∞.ts`  
**Export centralisé** : `import { personaEngine } from '@/core'`
