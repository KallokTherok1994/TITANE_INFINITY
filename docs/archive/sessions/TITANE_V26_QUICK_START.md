# 🚀 TITANE∞ v26.0 — Guide de Démarrage Rapide

**Nouvelles Fonctionnalités Phase 1**

---

## 📋 Table des Matières

1. [Achievements System](#achievements-system)
2. [Export/Import Conversations](#exportimport-conversations)
3. [Real-Time Charts](#real-time-charts)
4. [ThinkingPanel](#thinkingpanel)

---

## 🏆 Achievements System

### Vue d'Ensemble

Le système d'achievements suit votre progression dans TITANE∞ avec 4 catégories:

- 💬 **Conversation** — Communication et messages
- ⚡ **Progression** — Niveaux et XP
- 🧭 **Exploration** — Découverte du système
- 👑 **Maîtrise** — Excellence totale

### Raretés

- **Common** (Gris) — Faciles à débloquer
- **Rare** (Bleu) — Nécessitent effort
- **Epic** (Violet) — Challenges avancés
- **Legendary** (Or) — Maîtrise absolue

### Accès

1. Ouvrir **TITANE** page
2. Cliquer sur onglet **⚡ Progression**
3. Scroller vers section **🏆 Achievements**

### Progression

- **Débloqués** — Affichés en couleur avec date
- **Verrouillés** — Grisés avec barre de progression
- **XP Rewards** — Affichés en bas de chaque achievement

---

## 📥 Export/Import Conversations

### Exporter une Conversation

#### Format JSON

```typescript
// Bouton toolbar: Download icon
// Télécharge: titane_conversation_[id]_[timestamp].json
{
  "version": "26.0",
  "exportedAt": 1734470000000,
  "conversation": {
    "id": "current",
    "title": "Conversation TITANE",
    "messages": [...],
    "metadata": {
      "totalMessages": 42,
      "modes": ["default", "brainstorming"]
    }
  }
}
```

#### Format Markdown

```markdown
// Bouton toolbar: FileText icon
// Télécharge: titane*conversation*[timestamp].md

# Conversation TITANE

_Exporté le 17/12/2025 21:30:00_

---

## 👤 Utilisateur

_17/12/2025 20:15:00_

Explique-moi ton fonctionnement

---

## 🤖 TITANE

_17/12/2025 20:15:05_

Je suis TITANE∞, un système d'IA...
```

#### Copier dans Presse-Papier

```typescript
// Bouton toolbar: Copy icon
// Format: Markdown
// Utilisation: Ctrl+V dans n'importe quelle app
```

### Importer une Conversation

**Prochainement:** Drag & Drop de fichiers JSON exportés

---

## 📊 Real-Time Charts

### 4 Graphiques Disponibles

#### 1. Performance Temps Réel (Area Chart)

- **Type:** Area avec gradient vert
- **Données:** Score de performance 0-100
- **Update:** Temps réel (1min intervals)
- **Badge:** "Optimal" / "Modérée" / "Faible"

#### 2. Activité Messages (Line Chart)

- **Type:** Ligne bleue avec points
- **Données:** Messages envoyés/reçus
- **Métrique:** Messages par heure
- **Badge:** Affiche taux actuel (ex: "128 msg/h")

#### 3. Utilisation CPU (Area Chart)

- **Type:** Area avec gradient orange
- **Données:** CPU usage en %
- **Update:** Temps réel
- **Badge:** "Faible" / "Modérée" / "Élevée"

#### 4. Distribution Activité (Bar Chart)

- **Type:** Barres violettes
- **Données:** Activité sur 24h
- **Période:** Dernières 24 heures
- **Badge:** "24h"

### QuickStatCards

**4 cartes compactes au-dessus des graphiques:**

1. **Niveau**
   - Icon: ⚡
   - Valeur: Niveau actuel
   - Trend: +X cette semaine
   - Color: Bleu

2. **XP Total**
   - Icon: ✨
   - Valeur: XP total formaté
   - Trend: +Xk aujourd'hui
   - Color: Vert

3. **Messages**
   - Icon: 💬
   - Valeur: Total messages
   - Trend: X msg/h
   - Color: Orange

4. **Score Évolution**
   - Icon: 🎯
   - Valeur: Pourcentage
   - Trend: +X%
   - Color: Violet

### Interactivité

**Tooltips:**

- Hover sur graphique → Affiche valeur exacte + timestamp
- Background sombre translucide
- Bordure bleue

**Responsive:**

- Desktop: 2 colonnes
- Tablet: Auto-fit
- Mobile: 1 colonne

---

## 🧠 ThinkingPanel

### Description

Panneau de réflexion OMEGA qui affiche les étapes de raisonnement de l'IA pendant la génération de réponses.

### États des Étapes

#### Pending (Non démarrée)

- Icon: Brain (gris)
- État: En attente

#### Active (En cours)

- Icon: Loader2 (bleu, spinning)
- État: Traitement actuel

#### Complete (Terminée)

- Icon: Check (vert)
- État: Validée

### Types de Réflexion

1. **Analyse** 🧠
   - Analyse du contexte et de la demande
   - Extraction des intentions

2. **Raisonnement** ✨
   - Construction logique de la réponse
   - Exploration des solutions

3. **Synthèse** ✨
   - Agrégation des informations
   - Structuration de la réponse

4. **Validation** ✓
   - Vérification de cohérence
   - Quality check

### Utilisation

1. **Envoyer un message**

   ```
   ThinkingPanel apparaît automatiquement
   ```

2. **Cliquer sur une étape**

   ```
   Expand/Collapse pour voir détails
   ```

3. **Footer stats**
   ```
   "3 / 5 étapes"
   "Durée: 2s"
   ```

### Exemple de Flux

```
[🧠 Analyse] ▶ (Click to expand)
  └─ "Analyse de la demande utilisateur..."

[✨ Raisonnement] ● (Active)
  └─ "Construction du plan de réponse..."

[✨ Synthèse] ⏸ (Pending)
  └─ En attente...

[✓ Validation] ⏸ (Pending)
  └─ En attente...
```

---

## 🎨 Design System

### Couleurs Principales

```css
/* Primary */
--blue: #3b82f6;
--green: #10b981;
--orange: #f59e0b;
--purple: #8b5cf6;

/* Backgrounds */
--bg-dark: rgba(15, 23, 42, 0.9);
--bg-card: rgba(30, 41, 59, 0.8);
--border: rgba(100, 116, 139, 0.2);

/* Text */
--text-primary: #e2e8f0;
--text-secondary: #cbd5e1;
--text-tertiary: #94a3b8;
```

### Animations

#### Framer Motion

```typescript
// Achievement Card
whileHover={{ scale: 1.05 }}
whileTap={{ scale: 0.95 }}
transition={{ duration: 0.3 }}

// ThinkingPanel Steps
initial={{ opacity: 0, x: -20 }}
animate={{ opacity: 1, x: 0 }}
transition={{ delay: index * 0.1 }}
```

#### CSS Keyframes

```css
/* Pulse Glow (Achievements débloqués) */
@keyframes pulse-glow {
  0%,
  100% {
    box-shadow: 0 0 10px currentColor;
  }
  50% {
    box-shadow: 0 0 25px currentColor;
  }
}

/* Spin (Loader) */
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
```

---

## 🔧 Configuration

### Local Storage

```typescript
// Custom Modes
localStorage.setItem('titane_custom_modes', JSON.stringify([...]));

// Achievements Progress (Future)
localStorage.setItem('titane_achievements', JSON.stringify({
  unlocked: ['first_message', 'omega'],
  progress: { apprentice: 75 }
}));
```

### Performance Options

```typescript
// Lazy Load Charts (Future optimization)
const RealTimeCharts = lazy(() => import('@/features/dashboard/RealTimeCharts'));

// React.memo pour éviter re-renders
const AchievementCard = memo(({ achievement, currentStats }) => {
  // ...
});
```

---

## 🐛 Troubleshooting

### Charts ne s'affichent pas

```bash
# Vérifier installation recharts
npm list recharts
# Output attendu: recharts@3.6.0

# Réinstaller si nécessaire
npm install recharts@3.6.0
```

### Achievements manquants

```typescript
// Vérifier import
import { ACHIEVEMENTS } from '@/features/progression/achievements';

// Vérifier data
console.log(ACHIEVEMENTS.length); // Should be 10
```

### Export ne fonctionne pas

```typescript
// Vérifier que messages.length > 0
if (messages.length === 0) {
  // Boutons disabled
}

// Vérifier permissions téléchargement
// Browsers modernes requièrent interaction utilisateur
```

### ThinkingPanel ne s'affiche pas

```typescript
// Vérifier hook
const thinking = useThinkingSteps();

// Vérifier invocation
thinking.startThinking(); // Avant sendMessage
thinking.stopThinking(); // Après réponse
```

---

## 📚 Ressources Supplémentaires

### Documentation Complète

- [TITANE_PAGE_COMPLETION_PLAN.md](./TITANE_PAGE_COMPLETION_PLAN.md) — Plan complet
- [TITANE_PAGE_V26_PHASE1_COMPLETE.md](./TITANE_PAGE_V26_PHASE1_COMPLETE.md) — Rapport Phase 1

### Code Examples

- `src/features/progression/achievements.ts` — Achievements logic
- `src/features/chat/exportImport.ts` — Export/Import utilities
- `src/features/dashboard/RealTimeCharts.tsx` — Charts implementation

### API Reference

```typescript
// Achievement Interface
interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: number;
  category: 'conversation' | 'progression' | 'system' | 'exploration' | 'mastery';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  xpReward: number;
}

// Export Functions
downloadConversation(id: string, title: string, messages: ChatMessage[]): void
downloadMarkdown(title: string, messages: ChatMessage[]): void
copyToClipboard(title: string, messages: ChatMessage[], format?: 'json' | 'markdown'): Promise<boolean>

// Thinking Hooks
useThinkingSteps() => {
  steps: ThinkingStep[];
  isThinking: boolean;
  startThinking: () => void;
  stopThinking: () => void;
  addStep: (type, content) => void;
  reset: () => void;
}
```

---

## 🎯 Prochaines Fonctionnalités (Phases 2-3)

### Phase 2: Vision & Mémoire

- 📷 Vision metrics charts
- 🌳 Memory tree visualization
- 🔍 Semantic search
- 📊 Detection overlay

### Phase 3: Identité, Évolution, Transformation

- 🎭 Mode matrix grid
- 🖊️ Persona editor
- ⏱️ Evolution timeline
- 🗺️ Transformation roadmap

---

**Status:** ✅ Phase 1 Complete — v26.0.0-alpha  
**Build:** Réussi ✓  
**TypeScript:** 0 errors ✓

🚀 **Ready to use!**
