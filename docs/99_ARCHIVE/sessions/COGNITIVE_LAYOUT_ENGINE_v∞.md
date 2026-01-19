# 🧠 TITANE∞ Cognitive Layout & Adaptive Experience Engine v∞

**Date**: 2025-12-05
**Version**: TITANE∞ v19.3
**Auteur**: Claude (Architecture Cognitive)

---

## 🎯 VISION

Le **Cognitive Layout Engine** est la couche d'intelligence qui transforme TITANE∞ d'une interface "belle et cohérente" en un **organisme adaptatif** qui module dynamiquement l'expérience selon le contexte cognitif.

### Philosophie

**Phase 1** (Design System) : Structure ✅
**Phase 2** (Cognitive Engine) : Intelligence **← VOUS ÊTES ICI**

L'interface ne doit plus être statique. Elle doit **respirer** avec l'utilisateur, **adapter** sa densité, **guider** l'attention, **réduire** la charge mentale.

---

## 🏗️ ARCHITECTURE

### Boucle Cognitive

```
Observer → Interpréter → Décider → Agir → Apprendre
   ↑                                           ↓
   └───────────── Feedback Loop ──────────────┘
```

### Composants

1. **`cognitiveLayoutEngine.ts`** (870 lignes)
   - Moteur principal
   - État cognitif
   - Règles d'adaptation
   - Persistence préférences

2. **`useCognitiveLayout.ts`** (Hook React)
   - Interface React
   - State management
   - Actions utilisateur

3. **`CognitiveLayoutControl.tsx`** (Composant UI)
   - Panneau de contrôle
   - Suggestions visuelles
   - Signaux cognitifs

4. **`CognitiveLayoutControl.css`** (Styles)
   - Animations adaptatives
   - Modes visuels
   - Responsive

---

## 🎨 5 MODES D'INTERFACE

### 1. 🎯 FOCUS DEEP (Focus Profond)

**Quand** : Écriture, réflexion stratégique, concentration profonde

**Adaptations** :
- ✅ Densité: Minimale (80% whitespace)
- ✅ Sidebar: Compacte + auto-hide
- ✅ Panneaux secondaires: Masqués
- ✅ Police: +10% plus grande
- ✅ Contrastes: Adoucis (70%)
- ✅ Couleurs vives: Réduites (30%)
- ✅ Animations: Désactivées
- ✅ Notifications: Minimales

**Actions prioritaires** : Save, Undo, Redo

**Éléments masqués** : Notifications, Suggestions, Stats widgets

---

### 2. 🔍 EXPLORATION (Découverte)

**Quand** : Navigation, découverte de modules, curiosité

**Adaptations** :
- ✅ Densité: Moyenne (50% whitespace)
- ✅ Sidebar: Visible complète
- ✅ Panneaux secondaires: Visibles
- ✅ Panneaux stats: Visibles
- ✅ Suggestions: Activées
- ✅ Animations: Activées
- ✅ Notifications: Normales

**Actions prioritaires** : Navigate, Search, Discover, Bookmarks

**Éléments masqués** : Aucun

---

### 3. 📊 MONITORING (Cockpit)

**Quand** : Surveillance TITANE, logs, progression, métriques

**Adaptations** :
- ✅ Densité: Haute (30% whitespace)
- ✅ Sidebar: Visible complète
- ✅ Panneau alertes: Visible
- ✅ Panneau stats: Visible
- ✅ Contrastes: Élevés (90%)
- ✅ Couleurs vives: Présentes (90%)
- ✅ Notifications: Verbose

**Actions prioritaires** : Refresh, Logs, Metrics, Alerts

**Éléments masqués** : Aucun

---

### 4. 🔧 MAINTENANCE (Debug)

**Quand** : Debugging, refactor, configuration profonde

**Adaptations** :
- ✅ Densité: Haute (30% whitespace)
- ✅ Informations techniques: Toutes visibles
- ✅ Logs: Accessibles
- ✅ Options avancées: Visibles
- ✅ Contrastes: Maximaux (100%)
- ✅ Animations: Désactivées
- ✅ Notifications: Verbose

**Actions prioritaires** : Debug, Config, Logs, Terminal, Restart

**Éléments masqués** : Suggestions, Tips

---

### 5. 🎓 COACHING (Accompagnement)

**Quand** : Préparation séances, conduite protocoles clients

**Adaptations** :
- ✅ Densité: Faible (70% whitespace)
- ✅ Interface narrative: Activée
- ✅ Informations techniques: Simplifiées
- ✅ Police: +5% plus grande
- ✅ Contrastes: Doux (75%)
- ✅ Couleurs vives: Modérées (50%)
- ✅ Animations: Activées (fluides)

**Actions prioritaires** : Protocols, Plans, Notes, Client-view

**Éléments masqués** : Technical-info, Dev-tools, Metrics

---

### 6. ⚖️ NEUTRAL (Défaut)

**Quand** : Mode par défaut, équilibré

**Adaptations** :
- ✅ Densité: Moyenne (50% whitespace)
- ✅ Tout visible
- ✅ Pas de restrictions
- ✅ Configuration standard

---

## 🧠 SIGNAUX COGNITIFS

Le moteur observe et mesure en continu :

### 1. Énergie (0-1)
- **Source** : Heure de la journée + historique
- **Haute énergie** : 9h-12h, 14h-17h (par défaut)
- **Basse énergie** : 13h, 18h-20h
- **Ajusté** : Selon fatigue détectée

### 2. Focus (0-1)
- **Source** : Stabilité attention (inversement proportionnel aux switches)
- **Haut** : Peu de changements de contexte
- **Bas** : Beaucoup de switches (errance)

### 3. Charge Cognitive (0-1)
- **Source** : Context switches / minute
- **Formule** : `min(switchRate / 5, 1.0)`
- **Haute** : > 5 switches/min
- **Basse** : < 1 switch/min

### 4. Fatigue (booléen)
- **Source** : Durée session
- **Détectée** : Si > 90 minutes sans pause
- **Impact** : Réduit énergie de 40%

### 5. Blocage (booléen)
- **Source** : Actions répétées
- **Détecté** : Mêmes actions en boucle
- **Impact** : Suggestion mode Exploration

---

## 🔄 RÈGLES D'ADAPTATION

Le moteur applique des règles pour suggérer ou changer de mode :

### Règle 1 : Fatigue + Charge élevée
```
IF fatigue_detected AND cognitive_load > 0.6
THEN suggest focus_deep (confidence: 0.85, auto: true)
REASONING: "Fatigue + charge → réduction distractions"
```

### Règle 2 : Écriture / Réflexion
```
IF task_type IN [writing, reflection] AND focus_score > 0.7
THEN suggest focus_deep (confidence: 0.9, auto: if_favorite)
REASONING: "Tâche concentration détectée"
```

### Règle 3 : Navigation active
```
IF task_type = navigation AND energy_level > 0.7
THEN suggest exploration (confidence: 0.75, auto: false)
REASONING: "Exploration active avec bonne énergie"
```

### Règle 4 : Debug / Technique
```
IF task_type IN [debugging, execution]
THEN suggest maintenance (confidence: 0.8, auto: if_favorite)
REASONING: "Tâche technique détectée"
```

### Règle 5 : Surveillance
```
IF current_module IN [dashboard, system-center]
THEN suggest monitoring (confidence: 0.7, auto: false)
REASONING: "Module de surveillance actif"
```

### Règle 6 : Rôle Coach
```
IF role = coach
THEN suggest coaching (confidence: 0.85, auto: if_favorite)
REASONING: "Interface narrative pour accompagnement"
```

### Règle 7 : Blocage
```
IF blockage_detected
THEN suggest exploration (confidence: 0.7, auto: true)
REASONING: "Blocage → encourager navigation"
```

---

## 🎛️ UTILISATION

### 1. Initialisation Automatique

Le moteur s'initialise automatiquement au chargement :

```typescript
// Aucune action requise
// cognitiveLayoutEngine.initialize() appelé automatiquement
```

### 2. Hook React

Dans n'importe quel composant :

```tsx
import { useCognitiveLayout } from '@/hooks/useCognitiveLayout';

function MyComponent() {
  const {
    currentMode,
    layoutConfig,
    signals,
    setMode,
    setRole,
    setTaskType,
  } = useCognitiveLayout();

  // Changer de mode manuellement
  const handleFocusMode = () => {
    setMode('focus_deep');
  };

  // Mettre à jour le contexte
  useEffect(() => {
    setTaskType('writing');
    setRole('author');
  }, []);

  return (
    <div>
      Mode actuel: {currentMode}
      Énergie: {signals?.energyLevel}
    </div>
  );
}
```

### 3. Composant de Contrôle

Ajouter dans votre layout :

```tsx
import { CognitiveLayoutControl } from '@/components/cognitive/CognitiveLayoutControl';

function Layout() {
  return (
    <div>
      <YourApp />
      <CognitiveLayoutControl /> {/* Panneau de contrôle */}
    </div>
  );
}
```

### 4. Badge Compact (Toolbar)

```tsx
import { CognitiveLayoutBadge } from '@/components/cognitive/CognitiveLayoutControl';

function Toolbar() {
  return (
    <div className="toolbar">
      <CognitiveLayoutBadge /> {/* 🎯 Focus Profond ● */}
    </div>
  );
}
```

### 5. Mettre à Jour le Contexte

```typescript
// Changement de module
cognitiveLayoutEngine.updateContext({
  currentModule: 'chat-omega',
  currentProject: 'humain-total',
});

// Changement de rôle
cognitiveLayoutEngine.updateRole('author');

// Changement de tâche
cognitiveLayoutEngine.updateTaskType('writing');
```

### 6. Contrôle Manuel

```typescript
// Changer de mode
cognitiveLayoutEngine.applyMode('focus_deep', 'manual');

// Revenir au mode précédent
cognitiveLayoutEngine.revertToPreviousMode();

// Reset neutre
cognitiveLayoutEngine.resetToNeutral();

// Activer/Désactiver adaptation auto
cognitiveLayoutEngine.setAdaptationEnabled(false);

// Refuser suggestion
cognitiveLayoutEngine.refuseSuggestion();
```

---

## 🎨 INTÉGRATION CSS

### Variables CSS Dynamiques

Le moteur injecte automatiquement des variables CSS :

```css
:root {
  --ui-whitespace: 0.5; /* 0-1 selon mode */
  --ui-font-scale: 1.0; /* 0.9-1.2 */
  --ui-contrast: 0.8; /* 0-1 */
  --ui-accent-opacity: 0.6; /* 0-1 */
}
```

### Data Attribute Mode

```css
/* Le body reçoit data-ui-mode */
body[data-ui-mode="focus_deep"] .sidebar {
  width: 60px;
}

body[data-ui-mode="monitoring"] .stats-panel {
  display: block;
}

body[data-ui-mode="coaching"] .technical-info {
  display: none;
}
```

### Classes Dynamiques

```css
body.sidebar-compact .sidebar {
  width: var(--sidebar-width, 60px);
}

body.sidebar-autohide .sidebar:not(:hover) {
  opacity: var(--sidebar-opacity, 0.3);
}

body.animations-enabled * {
  transition: all 0.2s ease;
}
```

---

## 🧪 HOOKS UTILITAIRES

### useLayoutConfig()
```typescript
const config = useLayoutConfig();
// Récupère config complète du layout actuel
```

### useUIMode()
```typescript
const mode = useUIMode();
// Récupère juste le mode actuel
```

### useModuleContext(moduleName)
```typescript
useModuleContext('chat-omega');
// Met à jour contexte automatiquement
```

### useConditionalVisibility(elementId)
```typescript
const visible = useConditionalVisibility('stats-widget');
if (!visible) return null;
```

### useDensityLevel()
```typescript
const density = useDensityLevel(); // 'minimal' | 'low' | 'medium' | 'high' | 'maximal'
```

---

## 📊 ANALYTICS & LEARNING

### Métriques Tracées

```typescript
const analytics = cognitiveLayoutEngine.getAnalytics();
// {
//   totalModeChanges: 42,
//   acceptanceRate: "73.5%",
//   favoriteModes: { focus_deep: 15, exploration: 10, ... },
//   modeHistory: [...],
//   currentSignals: {...}
// }
```

### Préférences Apprises

Le moteur mémorise :
- **Modes favoris** : Fréquence d'utilisation manuelle
- **Modules** : Quels modules utilisés le plus
- **Heures** : Patterns temporels (énergie haute/basse)
- **Refus** : Suggestions refusées (réduire fréquence)
- **Acceptations** : Suggestions acceptées (augmenter confiance)

### Persistence

```typescript
// Sauvegarde auto dans localStorage
localStorage.getItem('titane_cognitive_preferences');

// Format JSON:
{
  favoriteModes: {...},
  moduleUsage: {...},
  timePreferences: {...},
  manualOverrides: 5,
  acceptedSuggestions: 12
}
```

---

## 🛡️ GARDE-FOUS

### 1. Contrôle Humain
- ✅ Désactivation adaptation auto possible
- ✅ Suggestions demandent validation (selon confiance)
- ✅ Revert toujours disponible

### 2. Stabilité Visuelle
- ✅ Min 2 minutes entre adaptations
- ✅ Pas de changements brusques
- ✅ Animations fluides

### 3. Prévisibilité
- ✅ Mode actuel toujours visible
- ✅ Raisons expliquées
- ✅ Historique accessible

### 4. Réversibilité
- ✅ Mode précédent mémorisé
- ✅ Reset neutre disponible
- ✅ Préférences exportables

---

## 🚀 PROCHAINES ÉTAPES

### Court Terme
1. ✅ Tester modes manuellement
2. ⚠️ Intégrer dans modules principaux
3. ⚠️ Connecter avec Helios/Nexus
4. ⚠️ Affiner règles d'adaptation

### Moyen Terme
5. ⚠️ ML pour prédictions personnalisées
6. ⚠️ Patterns temporels avancés
7. ⚠️ Synchronisation multi-devices
8. ⚠️ Export/Import profils

### Long Terme
9. ⚠️ API pour extensions tierces
10. ⚠️ Modes custom utilisateur
11. ⚠️ Intelligence collective (anonyme)
12. ⚠️ Intégration biométrique (HR, EEG)

---

## 📝 EXEMPLES D'USAGE

### Exemple 1 : Séance d'Écriture

```typescript
// Kevin ouvre son espace d'écriture
useEffect(() => {
  cognitiveLayoutEngine.updateContext({
    currentModule: 'writer',
    currentProject: 'livre-humain-total',
  });
  cognitiveLayoutEngine.updateRole('author');
  cognitiveLayoutEngine.updateTaskType('writing');
}, []);

// Après 2 minutes, détection focus élevé
// → Suggestion automatique: Focus Deep
// → UI se simplifie, sidebar se compacte
// → Notifications minimales
```

### Exemple 2 : Debug Technique

```typescript
// Kevin ouvre les logs
useEffect(() => {
  cognitiveLayoutEngine.updateContext({
    currentModule: 'system-center',
  });
  cognitiveLayoutEngine.updateRole('developer');
  cognitiveLayoutEngine.updateTaskType('debugging');
}, []);

// → Suggestion: Maintenance Mode
// → Panels techniques s'affichent
// → Logs accessibles
// → Métriques visibles
```

### Exemple 3 : Fatigue Détectée

```typescript
// Après 95 minutes de session
// Signals: {
//   sessionDuration: 95,
//   fatigueEstimated: true,
//   cognitiveLoad: 0.7,
//   energyLevel: 0.4
// }

// → Suggestion AUTO: Focus Deep (confiance 85%)
// → "Fatigue + charge cognitive → réduction distractions"
// → Appliqué automatiquement
```

### Exemple 4 : Exploration Guidée

```typescript
// Kevin navigue entre modules sans but précis
// contextSwitches: 8 en 3 minutes
// blockageDetected: true

// → Suggestion AUTO: Exploration Mode
// → "Blocage détecté → encourager navigation"
// → Sidebar complète visible
// → Suggestions activées
```

---

## 🎯 RÉSUMÉ

### ✅ Implémenté
- 🧠 Moteur cognitif complet (870 lignes)
- 🎨 5 modes adaptatifs + neutre
- 📊 7 règles d'adaptation intelligentes
- 🔄 Boucle observe-décide-agit-apprend
- 🎛️ Hooks React + Composant UI
- 💾 Persistence préférences
- 🛡️ Garde-fous et contrôle humain

### 🎯 Résultat
TITANE∞ passe d'une interface "belle" à une interface **intelligente** qui s'adapte à Kevin en temps réel, réduit sa charge mentale et optimise son attention selon son contexte cognitif.

---

**L'interface devient vivante, adaptative et cognitive !** 🧠✨

---

**Dernière mise à jour**: 2025-12-05 09:45 UTC
**Version**: TITANE∞ v19.3 + Cognitive Engine v∞
**Statut**: ✅ **IMPLÉMENTÉ & PRÊT**
