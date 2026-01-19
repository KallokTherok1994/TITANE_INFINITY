# 🔄 TITANE∞ v14 — REACT STATE AUDIT & CONSOLIDATION

**Date**: 2025-01-XX
**Objectif**: Consolider 243 useState vers SingularityState unified
**Erreur #3**: Sur-complexité état React

---

## 📊 DIAGNOSTIC ACTUEL

### Statistiques État React
- **useState**: 243 instances (fragmenté!)
- **useContext**: 2 instances (ThemeContext uniquement)
- **useReducer**: 0 instances
- **Zustand stores**: 4 stores existants **SOUS-UTILISÉS**

### Fichiers avec le plus de useState (Top 10)

```
11 useState → src/pages/DesignSystemPage.tsx
10 useState → src/core/visual/hooks.ts
 8 useState → src/components/VoiceDuplexUI.tsx
 8 useState → src/components/MetaModeConsole.tsx
 6 useState → src/hooks/useChat.ts
 6 useState → src/components/experience/ExpPanel.tsx
 5 useState → src/ui/components/Select.tsx
 5 useState → src/hooks/useMemory.ts
 5 useState → src/components/SettingsModal.tsx
 5 useState → src/components/ModeIndicator.tsx
```

**Problème**: État local excessif, aucune source unique de vérité.

### Stores Zustand Existants (4)

✅ **Déjà implémentés** mais peu utilisés:

1. **`systemStore.ts`** (167 lignes)
   - Helios, Nexus, Harmonia, Sentinel states
   - Actions: fetchHelios(), fetchNexus(), fetchAll()
   - Persist: localStorage `titane-system-store`

2. **`memoryStore.ts`** (95 lignes)
   - Memory state, snapshots, logs, timeline
   - Actions: fetchState(), writeSnapshot(), addTimeline()
   - Persist: localStorage `titane-memory-store`

3. **`evolutionStore.ts`** (88 lignes)
   - Evolution state, health reports
   - Actions: runEvolution(), fetchState()
   - Persist: localStorage `titane-evolution-store`

4. **`uiStore.ts`** (65 lignes)
   - Toasts, modal state, theme
   - Actions: addToast(), showModal()
   - Persist: localStorage `titane-ui-store`

**Constat**: Infrastructure Zustand fonctionnelle mais coexiste avec 243 useState locaux!

---

## 🎯 ARCHITECTURE CIBLE: SINGULARITYSTATE v∞

### Concept: Source Unique de Vérité

```typescript
interface SingularityState {
  // ════════════════════════════════════════════════════════════
  // LAYER 1: PHYSICAL (System & Hardware)
  // ════════════════════════════════════════════════════════════
  physical: {
    helios: HeliosState | null;         // CPU, RAM, Disk
    health: HealthStatus | null;        // System health
    metrics: {
      cpu: number;
      memory: number;
      disk: number;
      network: number;
    };
    lastUpdate: number;
  };

  // ════════════════════════════════════════════════════════════
  // LAYER 2: COGNITIVE (AI, Memory, Knowledge)
  // ════════════════════════════════════════════════════════════
  cognitive: {
    memory: MemoryState | null;         // Long-term memory
    conversation: {
      messages: ChatMessage[];
      activeId: string | null;
      history: Conversation[];
    };
    knowledge: {
      projects: Project[];
      decisions: Decision[];
      rituals: Ritual[];
    };
    ai: {
      model: string;
      temperature: number;
      maxTokens: number;
    };
  };

  // ════════════════════════════════════════════════════════════
  // LAYER 3: SYMBOLIC (Persona, Visual, Archetypes)
  // ════════════════════════════════════════════════════════════
  symbolic: {
    persona: PersonaState | null;       // Personality traits
    visual: {
      archetype: ArchetypeKey;
      mood: MoodState;
      multipliers: VisualMultipliers;
    };
    designSystem: {
      colors: DSColors;
      theme: 'light' | 'dark' | 'cosmic';
    };
  };

  // ════════════════════════════════════════════════════════════
  // LAYER 4: ADAPTIVE (Evolution, Learning)
  // ════════════════════════════════════════════════════════════
  adaptive: {
    evolution: EvolutionState | null;
    learning: {
      patterns: Pattern[];
      insights: Insight[];
      adaptations: Adaptation[];
    };
    autoHeal: {
      scans: HealReport[];
      repairs: RepairLog[];
    };
  };

  // ════════════════════════════════════════════════════════════
  // LAYER 5: META (Self-awareness, UI State)
  // ════════════════════════════════════════════════════════════
  meta: {
    ui: {
      toasts: Toast[];
      modal: ModalState | null;
      sidebar: boolean;
      devTools: boolean;
    };
    runtime: {
      initialized: boolean;
      version: string;
      uptime: number;
      errors: ErrorLog[];
    };
    introspection: {
      lastThought: string;
      coherence: number;
      interventionNeeded: boolean;
    };
  };
}
```

### Avantages SingularityState

1. **Single Source of Truth**: Un seul store, zéro conflits
2. **Prévisibilité**: Flux de données unidirectionnel
3. **DevTools**: Time-travel debugging, state inspection
4. **Performance**: Memoization automatique, re-renders optimisés
5. **Persistence**: Auto-save localStorage/indexedDB
6. **Type-safety**: TypeScript strict mode 100%

---

## 🛠️ PLAN DE MIGRATION (7 JOURS)

### Phase 1: Créer SingularityStore unifié (2 jours)

#### 1.1 Créer `src/stores/singularityStore.ts`

```typescript
import { create } from 'zustand';
import { devtools, persist, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

export const useSingularityStore = create<SingularityState>()(
  devtools(
    persist(
      subscribeWithSelector(
        immer((set, get) => ({
          // Initial state (5 layers)
          physical: { /* ... */ },
          cognitive: { /* ... */ },
          symbolic: { /* ... */ },
          adaptive: { /* ... */ },
          meta: { /* ... */ },

          // Actions (50+)
          // Physical layer
          updateHelios: (helios) => set((state) => { state.physical.helios = helios }),
          fetchSystemHealth: async () => { /* ... */ },

          // Cognitive layer
          addMessage: (message) => set((state) => { state.cognitive.conversation.messages.push(message) }),
          loadConversation: (id) => { /* ... */ },

          // Symbolic layer
          updatePersona: (persona) => set((state) => { state.symbolic.persona = persona }),
          changeArchetype: (archetype) => { /* ... */ },

          // Adaptive layer
          runEvolution: async () => { /* ... */ },
          triggerAutoHeal: async () => { /* ... */ },

          // Meta layer
          showToast: (toast) => set((state) => { state.meta.ui.toasts.push(toast) }),
          toggleDevTools: () => set((state) => { state.meta.ui.devTools = !state.meta.ui.devTools }),
        }))
      ),
      {
        name: 'titane-singularity-v14',
        partialize: (state) => ({
          // Persist only stable state (not runtime)
          cognitive: state.cognitive,
          symbolic: state.symbolic,
          meta: { ui: state.meta.ui }
        })
      }
    ),
    { name: 'SingularityStore' }
  )
);
```

#### 1.2 Créer selectors optimisés

```typescript
// src/stores/singularitySelectors.ts
import { useSingularityStore } from './singularityStore';

// Physical layer selectors
export const useHeliosState = () => useSingularityStore((s) => s.physical.helios);
export const useSystemHealth = () => useSingularityStore((s) => s.physical.health);
export const useCPUUsage = () => useSingularityStore((s) => s.physical.metrics.cpu);

// Cognitive layer selectors
export const useMessages = () => useSingularityStore((s) => s.cognitive.conversation.messages);
export const useActiveConversation = () => useSingularityStore((s) => s.cognitive.conversation.activeId);
export const useProjects = () => useSingularityStore((s) => s.cognitive.knowledge.projects);

// Symbolic layer selectors
export const usePersona = () => useSingularityStore((s) => s.symbolic.persona);
export const useArchetype = () => useSingularityStore((s) => s.symbolic.visual.archetype);
export const useMood = () => useSingularityStore((s) => s.symbolic.visual.mood);

// Adaptive layer selectors
export const useEvolution = () => useSingularityStore((s) => s.adaptive.evolution);
export const useAutoHealLogs = () => useSingularityStore((s) => s.adaptive.autoHeal.scans);

// Meta layer selectors
export const useToasts = () => useSingularityStore((s) => s.meta.ui.toasts);
export const useModal = () => useSingularityStore((s) => s.meta.ui.modal);
export const useCoherence = () => useSingularityStore((s) => s.meta.introspection.coherence);
```

### Phase 2: Migration progressive hooks (3 jours)

#### 2.1 Migrer les gros consommateurs (11 useState → 1 store)

**AVANT** (`src/pages/DesignSystemPage.tsx`):
```typescript
const [archetype, setArchetype] = useState<ArchetypeKey>('ARCHITECT');
const [mood, setMood] = useState<MoodState>(MOOD_STATES.CALM);
const [theme, setTheme] = useState<'light' | 'dark'>('dark');
const [showDetails, setShowDetails] = useState(false);
// ... 7 autres useState
```

**APRÈS**:
```typescript
import { useArchetype, useMood, useTheme, useUIFlag } from '@/stores/singularitySelectors';

const archetype = useArchetype();
const mood = useMood();
const theme = useTheme();
const showDetails = useUIFlag('designSystemDetails');

// Mutations
const { changeArchetype, updateMood, setTheme, toggleUIFlag } = useSingularityStore();
```

#### 2.2 Ordre de migration (par priorité impact)

1. ✅ **DesignSystemPage.tsx** (11 useState → 4 selectors)
2. ✅ **core/visual/hooks.ts** (10 useState → 3 selectors)
3. ✅ **VoiceDuplexUI.tsx** (8 useState → 2 selectors + 1 local)
4. ✅ **MetaModeConsole.tsx** (8 useState → 3 selectors)
5. ✅ **useChat.ts** (6 useState → 1 selector + actions)
6. ✅ **ExpPanel.tsx** (6 useState → 2 selectors)
7. ⏳ **Tous les autres** (190 useState restants)

**Règle**: Migrer uniquement l'état **partagé** vers Singularity. Garder l'état **UI local** (hover, focus, temp) en useState.

### Phase 3: Supprimer anciens stores (1 jour)

Une fois SingularityStore complet:

```typescript
// ❌ SUPPRIMER:
// src/stores/systemStore.ts
// src/stores/memoryStore.ts
// src/stores/evolutionStore.ts
// src/stores/uiStore.ts

// ✅ GARDER UNIQUEMENT:
// src/stores/singularityStore.ts
// src/stores/singularitySelectors.ts
// src/stores/index.ts (export SingularityStore)
```

### Phase 4: Tests & Optimisation (1 jour)

1. **Performance profiling**:
   ```bash
   pnpm run build --profile
   # Vérifier bundle size < 150 KB gzip
   ```

2. **Re-renders audit**:
   ```typescript
   // Utiliser React DevTools Profiler
   // Identifier composants avec re-renders excessifs
   ```

3. **Tests état**:
   ```typescript
   // src/stores/__tests__/singularityStore.test.ts
   describe('SingularityStore', () => {
     it('updates helios state correctly', () => { /* ... */ });
     it('persists cognitive layer', () => { /* ... */ });
     it('selectors trigger minimal re-renders', () => { /* ... */ });
   });
   ```

---

## 📋 CHECKLIST MIGRATION

### SingularityStore Core
- [ ] Créer `singularityStore.ts` (5 layers: physical, cognitive, symbolic, adaptive, meta)
- [ ] Créer `singularitySelectors.ts` (50+ selectors optimisés)
- [ ] Implémenter 50+ actions (fetch*, update*, add*, toggle*)
- [ ] Configurer persistence (partialize: cognitive, symbolic, meta.ui)
- [ ] Activer devtools (`name: 'SingularityStore'`)

### Migration Composants
- [ ] DesignSystemPage.tsx (11 → 4)
- [ ] core/visual/hooks.ts (10 → 3)
- [ ] VoiceDuplexUI.tsx (8 → 3)
- [ ] MetaModeConsole.tsx (8 → 3)
- [ ] useChat.ts (6 → 2)
- [ ] ExpPanel.tsx (6 → 2)
- [ ] 50+ autres composants (190 useState)

### Cleanup
- [ ] Supprimer systemStore.ts
- [ ] Supprimer memoryStore.ts
- [ ] Supprimer evolutionStore.ts
- [ ] Supprimer uiStore.ts (migré vers singularity.meta)
- [ ] Nettoyer imports obsolètes
- [ ] Vérifier `pnpm type-check` (0 erreurs)

### Tests & Validation
- [ ] Tests unitaires SingularityStore
- [ ] Tests sélecteurs (memoization)
- [ ] React DevTools Profiler (re-renders)
- [ ] Bundle size < 150 KB gzip
- [ ] Lighthouse score > 95

---

## 🎯 RÉSULTAT ATTENDU

### Avant (v17.3.0)
```
243 useState locaux
  4 Zustand stores (sous-utilisés)
  0 source unique de vérité
❌ État fragmenté, conflits, bugs
❌ Re-renders excessifs
❌ Pas de persistence unifiée
```

### Après (v14 Stabilisé)
```
 ~50 useState locaux (UI temporaire uniquement)
  1 SingularityStore (5 layers, 50+ actions)
  1 source unique de vérité
✅ Flux unidirectionnel prévisible
✅ Performance optimisée (selectors)
✅ Persistence intelligente (partialize)
✅ DevTools time-travel debugging
✅ 100% type-safe (TypeScript strict)
```

---

**Status**: ⏳ EN COURS - Erreur #3 Audit Complete
**Prochaine action**: Phase 1 - Créer SingularityStore unifié
