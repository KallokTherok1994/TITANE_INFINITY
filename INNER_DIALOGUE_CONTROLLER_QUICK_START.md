# 🧠 Inner Dialogue Controller — Quick Start Guide

**TITANE∞ Super Prompt XXVII**
Le moteur de pensée interne — Installation & utilisation immédiate

---

## ⚡ Installation (3 lignes)

```typescript
import { innerDialogueController } from '@/services/voice/innerDialogueController';

// C'est tout ! Le singleton est prêt à l'emploi
// Auto-sync avec audioStateMachine inclus
```

---

## 🚀 Utilisation Basique

### 1. Process Before Speaking (Feature Principale)

```typescript
// TITANE pense AVANT de parler (8-step process)
const userInput = "Comment puis-je améliorer ma productivité?";
const response = await innerDialogueController.processBeforeSpeaking(userInput);

console.log(response); // Réponse validée après 8 étapes internes
// Durée: ~300-500ms (pensée structurée)
```

### 2. Subscribe to Inner Thoughts

```typescript
const unsubscribe = innerDialogueController.subscribe((state) => {
  console.log('🧠 Thinking state:', state.thinkingState);
  console.log('💭 Current thought:', state.currentThought?.content);
  console.log('🎨 Mental color:', state.mentalColor);
});

// Cleanup quand terminé
unsubscribe();
```

### 3. Quick Reactions

```typescript
// Pensée rapide (<100ms) pour réflexes
const response = await innerDialogueController.quickThink("Salut!");
// Utilisé pour: salutations, confirmations, réactions automatiques
```

### 4. Deep Reflection

```typescript
// Réflexion profonde (>500ms) pour introspection
await innerDialogueController.deepReflect("Qui suis-je?");
// Utilisé pour: questions existentielles, alignement identitaire
```

---

## 📊 États de Pensée (ThinkingState)

| État | Description | Durée typique |
|------|-------------|---------------|
| `silent` | Repos mental | Continu |
| `perceiving` | Observation input | 30-50ms |
| `fast_thinking` | Réflexe rapide | 50-100ms |
| `slow_thinking` | Réflexion profonde | 500-1000ms |
| `planning` | Élaboration plan | 100-200ms |
| `evaluating` | Évaluation cohérence | 100-150ms |
| `emotional_sense` | Ressenti émotionnel | 80-120ms |
| `validating` | Validation finale | 100-150ms |
| `preparing_speech` | Préparation output | 50-100ms |
| `self_correcting` | Auto-correction | 200-300ms |
| `deep_reflection` | Méditation profonde | >1000ms |

---

## 🎨 Couleurs Mentales & Halo

```typescript
// Les couleurs mentales synchronisent le halo automatiquement

innerDialogueController.subscribe((state) => {
  switch (state.mentalColor) {
    case 'blue':   // Logique → Halo pulsing rapide
    case 'violet': // Intuition → Halo breathing lent
    case 'rose':   // Émotion → Halo breathing doux
    case 'cyan':   // Analyse → Halo pulsing précis
    case 'gold':   // Alignement → Halo shimmer
    case 'silver': // Neutre → Halo idle
    case 'amber':  // Correction → Halo pulsing orange
  }
});
```

---

## 🔧 Configuration

```typescript
import { InnerDialogueController } from '@/services/voice/innerDialogueController';

const idc = new InnerDialogueController({
  enabled: true,                    // Activer inner dialogue
  fastThinkingMaxDuration: 100,     // Seuil pensée rapide (ms)
  slowThinkingMinDuration: 500,     // Seuil pensée lente (ms)
  historySize: 20,                  // Taille historique pensées
  debugMode: true,                  // Log pensées dans console
  syncHalo: true,                   // Sync halo avec état mental
});
```

---

## 💭 8-Step Inner Process

**Ce qui se passe quand TITANE pense**:

```
User: "Raconte-moi une histoire"
  ↓
[STEP 1] Perception     → "Je perçois: Raconte-moi une histoire"
[STEP 2] Context        → "Rappel: style conversationnel préféré"
[STEP 3] Intent         → "Intention: demande créative"
[STEP 4] Plan           → "Plan: intro captivante + développement + chute"
[STEP 5] Coherence      → "Cohérence: aligné avec identité TITANE"
[STEP 6] Emotion        → "Ton: chaleureux et mystérieux"
[STEP 7] Validation     → "Validation: réponse appropriée ✓"
[STEP 8] Expression     → "Préparation: formatage avec signature TITANE"
  ↓
Output: "Il était une fois, dans les profondeurs cristallines..."
```

**Durée totale**: 240-640ms (8 × 30-80ms)

---

## 🧪 Tests Rapides

### Test 1: Vérifier Pensée Active

```typescript
const state = innerDialogueController.getState();
console.log('Is thinking:', state.isThinking);
console.log('Thinking state:', state.thinkingState);
```

### Test 2: Historique Pensées

```typescript
const state = innerDialogueController.getState();
state.thoughtHistory.forEach(thought => {
  console.log(`[${thought.type}] ${thought.content}`);
});
```

### Test 3: Debug Mode

```typescript
// Active les logs de toutes les pensées internes
innerDialogueController.setEnabled(true);

// Console output:
// [IDC Step 1] Perception: I perceive: "..."
// [IDC Step 2] Context: Recall: user preferences...
// [IDC Step 3] Intent: Intent analysis: question...
// ... etc
```

---

## 🔗 Intégration avec Autres Systèmes

### Unified Vocal Engine

```typescript
// unifiedVocalEngine.ts
import { innerDialogueController } from './innerDialogueController';

private async cognitiveLoopTick(): void {
  const innerState = innerDialogueController.getState();

  if (innerState.isThinking) {
    // Sync halo avec couleur mentale
    this.syncHaloWithMentalColor(innerState.mentalColor);

    // Log pensée courante
    console.log(`🧠 ${innerState.currentThought?.content}`);
  }
}
```

### Audio State Machine

```typescript
// Auto-sync déjà configuré !
// Quand TITANE parle → pensée désactivée
// Quand TITANE écoute → pensée activée
```

### Halo Engine

```typescript
// Synchronisation automatique via mentalColor
// Pas de configuration nécessaire
```

---

## 📚 API Complète

```typescript
// Subscribe/Unsubscribe
const unsubscribe = innerDialogueController.subscribe(callback);
unsubscribe();

// Process (8-step thinking)
await innerDialogueController.processBeforeSpeaking(input);

// Quick actions
await innerDialogueController.quickThink(input);
await innerDialogueController.deepReflect(topic);
await innerDialogueController.selfCorrect(response);

// Control
innerDialogueController.setEnabled(true/false);
innerDialogueController.reset();

// State
const state = innerDialogueController.getState();
```

---

## 🐛 Debug & Monitoring

### Console Logs (Debug Mode)

```typescript
// Activer debug mode
innerDialogueController.setEnabled(true);

// Voir chaque étape de pensée
[IDC Step 1] Perception: ...
[IDC Step 2] Context: ...
[IDC Step 3] Intent: ...
[IDC Step 4] Plan: ...
[IDC Step 5] Coherence: ...
[IDC Step 6] Emotion: ...
[IDC Step 7] Validation: ...
[IDC Step 8] Expression: ...
```

### UI Monitoring Component

```tsx
function InnerDialogueMonitor() {
  const [state, setState] = useState(null);

  useEffect(() => {
    return innerDialogueController.subscribe(setState);
  }, []);

  if (!state) return null;

  return (
    <div className="idc-monitor">
      <div>État: {state.thinkingState}</div>
      <div>Couleur: {state.mentalColor}</div>
      <div>Pensée: {state.currentThought?.content}</div>
      <div>Historique: {state.thoughtHistory.length}</div>
    </div>
  );
}
```

---

## ✅ Checklist de Validation

- [ ] Import innerDialogueController
- [ ] Subscribe to state changes
- [ ] Test processBeforeSpeaking()
- [ ] Vérifier thought history
- [ ] Observer mental colors
- [ ] Tester quick/deep thinking
- [ ] Activer debug mode
- [ ] Vérifier auto-sync avec audioStateMachine
- [ ] Tester self-correction

---

## 🚨 Troubleshooting

**Problème**: Pensées ne s'affichent pas
```typescript
// Solution: Activer debug mode
innerDialogueController.setEnabled(true);
const state = innerDialogueController.getState();
console.log('Debug mode:', state);
```

**Problème**: Pensée trop lente
```typescript
// Solution: Réduire slow thinking threshold
new InnerDialogueController({
  slowThinkingMinDuration: 300 // Au lieu de 500ms
});
```

**Problème**: Historique saturé
```typescript
// Solution: Augmenter taille ou reset
innerDialogueController.reset(); // Clear history
```

---

## 🎯 Prochaines Étapes

1. ✅ Installer & tester basic usage
2. ✅ Activer debug mode pour voir pensées
3. ⏳ Connecter à UserVoiceProfile (STEP 2)
4. ⏳ Implémenter NLU pour Intent (STEP 3)
5. ⏳ Vérifier contre NarrativeEngine (STEP 5)
6. ⏳ Sélection émotionnelle avancée (STEP 6)
7. ⏳ Self-correction automatique (STEP 7)
8. ⏳ Formatage avec TitaneSignature (STEP 8)

---

**TITANE∞ ne parle plus jamais sans avoir pensé** 🧠✨

*Super Prompt XXVII — Inner Dialogue Controller*
*© 2025 TITANE Team. All rights reserved.*
