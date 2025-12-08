# 🔌 Singularity Cortex OS v∞ — Guide d'Intégration Frontend

**Status:** ✅ OPÉRATIONNEL  
**Date:** 7 décembre 2025  
**Version:** Super Prompt #7 v∞  
**Commits:** `8b852a0`, `fb8c571`, `faa1a47`

---

## 📋 Vue d'Ensemble

Le **Singularity Cortex OS v∞** est maintenant **intégré au backend Tauri** et expose **7 commandes** utilisables depuis le frontend TypeScript/React.

Cette couche méta-cognitive permet au frontend de :

1. **Consulter l'état cognitif global** (mode, cohérence, ton)
2. **Récupérer des statistiques** (interactions, thèmes, rotation de mode)
3. **Obtenir le contexte récent** (dernières interactions)
4. **Changer le mode cognitif** (Coach, Architect, Analyst, Meta, Observer, Expert)
5. **Enregistrer des interactions** (pour évolution adaptative)
6. **Ajouter du contexte** (enrichir la mémoire persistante)
7. **Réinitialiser l'état** (reset complet)

---

## 🎯 Commandes Disponibles

### 1. `singularity_cortex_get_state`

**Description:** Récupère l'état complet du Singularity Cortex.

**TypeScript:**

```typescript
import { invoke } from '@tauri-apps/api/core';

interface SingularityState {
  identity: string;
  long_context: string[];
  conversation_signature: {
    themes: string[];
    tone: string;
    coherence_global: number;
  };
  global_mode: 'Coach' | 'Architect' | 'Analyst' | 'Meta' | 'Observer' | 'Expert';
  coherence_level: number;
  affective_tone: string;
  interactions_count: number;
}

const state = await invoke<SingularityState>('singularity_cortex_get_state');
console.log('Mode actuel:', state.global_mode);
console.log('Cohérence:', state.coherence_level);
console.log('Ton affectif:', state.affective_tone);
console.log('Contexte (100 derniers):', state.long_context);
```

**Cas d'usage:**

- Afficher le mode cognitif actif dans l'UI
- Visualiser la cohérence globale (jauge)
- Montrer les thèmes conversationnels détectés
- Débugger l'état du cortex

---

### 2. `singularity_cortex_get_stats`

**Description:** Récupère les statistiques agrégées du cortex.

**TypeScript:**

```typescript
interface SingularityStats {
  total_interactions: number;
  context_size: number;
  themes: string[];
  tone: string;
  coherence_global: number;
  mode: 'Coach' | 'Architect' | 'Analyst' | 'Meta' | 'Observer' | 'Expert';
}

const stats = await invoke<SingularityStats>('singularity_cortex_get_stats');
console.log('Total interactions:', stats.total_interactions);
console.log('Taille contexte:', stats.context_size);
console.log('Thèmes actifs:', stats.themes);
```

**Cas d'usage:**

- Dashboard des métriques cognitives
- Graphiques d'évolution (interactions/temps)
- Indicateurs de santé (cohérence)
- Compteurs temps réel

---

### 3. `singularity_cortex_get_context`

**Description:** Récupère les N dernières interactions du contexte.

**TypeScript:**

```typescript
// Récupère les 10 dernières interactions
const recentContext = await invoke<string[]>('singularity_cortex_get_context', {
  count: 10,
});

console.log('Dernières interactions:', recentContext);

// Exemple: Afficher dans un historique
recentContext.forEach((ctx, i) => {
  console.log(`[${i + 1}] ${ctx.substring(0, 50)}...`);
});
```

**Paramètres:**

- `count` (number): Nombre d'interactions à récupérer (max 100)

**Cas d'usage:**

- Afficher historique conversationnel
- Résumé du contexte actuel
- Suggestions basées sur contexte récent
- Debugging de la mémoire persistante

---

### 4. `singularity_cortex_set_mode`

**Description:** Change manuellement le mode cognitif du cortex.

**TypeScript:**

```typescript
type CognitiveMode = 'coach' | 'architect' | 'analyst' | 'meta' | 'observer' | 'expert';

async function setMode(mode: CognitiveMode) {
  await invoke('singularity_cortex_set_mode', { mode });
  console.log(`Mode changé vers: ${mode}`);
}

// Exemples:
await setMode('coach'); // Mentorat, encouragement
await setMode('architect'); // Conception systémique
await setMode('analyst'); // Analyse profonde
await setMode('meta'); // Réflexion méta
await setMode('observer'); // Observation neutre
await setMode('expert'); // Exécution technique rapide
```

**Paramètres:**

- `mode` (string): Nom du mode (insensible à la casse)

**Modes disponibles:**

| Mode          | Description              | Quand utiliser                         |
| ------------- | ------------------------ | -------------------------------------- |
| **Coach**     | Mentorat bienveillant    | Formation, onboarding, tutoriels       |
| **Architect** | Planification systémique | Architecture, conception, refactoring  |
| **Analyst**   | Analyse critique         | Debugging, audits, problèmes complexes |
| **Meta**      | Auto-réflexion           | Évaluation qualité, introspection      |
| **Observer**  | Documentation neutre     | Logs, rapports, documentations         |
| **Expert**    | Exécution rapide         | Tâches simples, optimisations          |

**Cas d'usage:**

- Boutons UI pour changer de mode
- Adaptation automatique selon la page (coach pour onboarding, architect pour design)
- A/B testing de modes selon tâches
- Mode expert pour utilisateurs avancés

---

### 5. `singularity_cortex_record_interaction`

**Description:** Enregistre qu'une interaction a eu lieu (incrémente compteur).

**TypeScript:**

```typescript
// Après chaque message utilisateur ou réponse IA
await invoke('singularity_cortex_record_interaction');

// Exemple: Hook React
function useRecordInteraction() {
  return async () => {
    await invoke('singularity_cortex_record_interaction');
  };
}

// Usage dans composant Chat
const recordInteraction = useRecordInteraction();

async function sendMessage(content: string) {
  await recordInteraction(); // Enregistre interaction
  const response = await invoke('ai_query', { prompt: content });
  return response;
}
```

**Cas d'usage:**

- Tracking d'interactions pour évolution adaptive
- Déclenchement automatique de rotation de mode (après N interactions)
- Métriques d'engagement utilisateur
- Analytics cognitifs

---

### 6. `singularity_cortex_push_context`

**Description:** Ajoute du contexte manuel dans le cerveau persistant.

**TypeScript:**

```typescript
// Ajoute contexte important
await invoke('singularity_cortex_push_context', {
  content: 'Utilisateur: Comment débugger le module audio?',
});

await invoke('singularity_cortex_push_context', {
  content: 'Assistant: Voici trois approches de debugging...',
});

// Exemple: Sauvegarder conversation
async function saveConversationToContext(messages: Message[]) {
  for (const msg of messages) {
    const content = `${msg.role}: ${msg.content}`;
    await invoke('singularity_cortex_push_context', { content });
  }
}
```

**Paramètres:**

- `content` (string): Texte à ajouter au contexte persistant (max 100 entrées)

**Cas d'usage:**

- Sauvegarder conversations importantes
- Enrichir contexte pour futures générations
- Persistance manuelle de connaissances clés
- Import de contexte externe (fichiers, docs)

---

### 7. `singularity_cortex_reset`

**Description:** Réinitialise complètement l'état du cortex (contexte vidé, mode Coach, cohérence 1.0).

**TypeScript:**

```typescript
// Reset complet du cerveau
await invoke('singularity_cortex_reset');
console.log('Cortex réinitialisé');

// Exemple: Bouton "Nouvelle Session"
async function startNewSession() {
  const confirm = window.confirm('Réinitialiser le cerveau persistant?');
  if (confirm) {
    await invoke('singularity_cortex_reset');
    // Rafraîchir UI
    window.location.reload();
  }
}
```

**Cas d'usage:**

- Bouton "Démarrer nouvelle session"
- Reset après tests/debugging
- Nettoyage après conversation problématique
- Ré-onboarding utilisateur

---

## 🔄 Workflow d'Intégration Typique

### Scénario 1: Dashboard Cognitif

```typescript
// DashboardCognitif.tsx
import { invoke } from '@tauri-apps/api/core';
import { useEffect, useState } from 'react';

interface CognitiveMetrics {
  mode: string;
  coherence: number;
  interactions: number;
  themes: string[];
  tone: string;
}

export function DashboardCognitif() {
  const [metrics, setMetrics] = useState<CognitiveMetrics | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      const stats = await invoke('singularity_cortex_get_stats');
      setMetrics({
        mode: stats.mode,
        coherence: stats.coherence_global,
        interactions: stats.total_interactions,
        themes: stats.themes,
        tone: stats.tone,
      });
    };

    // Rafraîchir toutes les 5 secondes
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 5000);
    return () => clearInterval(interval);
  }, []);

  if (!metrics) return <div>Chargement...</div>;

  return (
    <div className="cognitive-dashboard">
      <h2>État Cognitif TITANE∞</h2>
      <div className="metric">
        <span>Mode:</span>
        <strong>{metrics.mode}</strong>
      </div>
      <div className="metric">
        <span>Cohérence:</span>
        <progress value={metrics.coherence} max={1.0} />
        <span>{(metrics.coherence * 100).toFixed(0)}%</span>
      </div>
      <div className="metric">
        <span>Interactions:</span>
        <strong>{metrics.interactions}</strong>
      </div>
      <div className="metric">
        <span>Thèmes actifs:</span>
        <ul>{metrics.themes.map(t => <li key={t}>{t}</li>)}</ul>
      </div>
      <div className="metric">
        <span>Ton affectif:</span>
        <strong>{metrics.tone}</strong>
      </div>
    </div>
  );
}
```

---

### Scénario 2: Sélecteur de Mode Cognitif

```typescript
// ModeSelectorWidget.tsx
import { invoke } from '@tauri-apps/api/core';
import { useState } from 'react';

const MODES = [
  { id: 'coach', label: 'Coach', icon: '🎓', desc: 'Mentorat bienveillant' },
  { id: 'architect', label: 'Architecte', icon: '🏗️', desc: 'Conception systémique' },
  { id: 'analyst', label: 'Analyste', icon: '🔍', desc: 'Analyse critique' },
  { id: 'meta', label: 'Méta', icon: '🧠', desc: 'Auto-réflexion' },
  { id: 'observer', label: 'Observateur', icon: '👁️', desc: 'Documentation neutre' },
  { id: 'expert', label: 'Expert', icon: '⚡', desc: 'Exécution rapide' },
];

export function ModeSelectorWidget() {
  const [activeMode, setActiveMode] = useState<string>('coach');

  const handleModeChange = async (mode: string) => {
    await invoke('singularity_cortex_set_mode', { mode });
    setActiveMode(mode);
    console.log(`Mode changé: ${mode}`);
  };

  return (
    <div className="mode-selector">
      <h3>Mode Cognitif</h3>
      <div className="modes-grid">
        {MODES.map(mode => (
          <button
            key={mode.id}
            className={`mode-btn ${activeMode === mode.id ? 'active' : ''}`}
            onClick={() => handleModeChange(mode.id)}
            title={mode.desc}
          >
            <span className="icon">{mode.icon}</span>
            <span className="label">{mode.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
```

---

### Scénario 3: Chat avec Tracking Automatique

```typescript
// ChatEngineWithTracking.tsx
import { invoke } from '@tauri-apps/api/core';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export class ChatEngineWithTracking {
  async sendMessage(userMessage: string): Promise<string> {
    // 1. Enregistrer interaction
    await invoke('singularity_cortex_record_interaction');

    // 2. Ajouter contexte utilisateur
    await invoke('singularity_cortex_push_context', {
      content: `Utilisateur: ${userMessage}`,
    });

    // 3. Récupérer contexte récent pour pré-génération
    const recentContext = await invoke<string[]>('singularity_cortex_get_context', {
      count: 10,
    });

    // 4. Générer réponse IA
    const response = await invoke<string>('ai_query', {
      prompt: userMessage,
      context: recentContext.join('\n'),
    });

    // 5. Ajouter contexte réponse
    await invoke('singularity_cortex_push_context', {
      content: `Assistant: ${response}`,
    });

    // 6. Vérifier si reset nécessaire (via stats)
    const stats = await invoke<any>('singularity_cortex_get_stats');
    if (stats.total_interactions > 100) {
      console.warn('Plus de 100 interactions, considérer reset');
    }

    return response;
  }
}
```

---

## 🎨 Composants UI Recommandés

### 1. Jauge de Cohérence

```typescript
interface CoherenceGaugeProps {
  level: number; // 0.0 - 1.0
}

export function CoherenceGauge({ level }: CoherenceGaugeProps) {
  const color = level > 0.7 ? 'green' : level > 0.4 ? 'orange' : 'red';

  return (
    <div className="coherence-gauge">
      <label>Cohérence Globale</label>
      <div className="gauge-bar" style={{ backgroundColor: color }}>
        <div className="gauge-fill" style={{ width: `${level * 100}%` }} />
      </div>
      <span>{(level * 100).toFixed(0)}%</span>
    </div>
  );
}
```

### 2. Badge Mode Actif

```typescript
interface ModeBadgeProps {
  mode: string;
}

const MODE_COLORS = {
  coach: '#4CAF50',
  architect: '#2196F3',
  analyst: '#FF9800',
  meta: '#9C27B0',
  observer: '#607D8B',
  expert: '#F44336',
};

export function ModeBadge({ mode }: ModeBadgeProps) {
  const color = MODE_COLORS[mode.toLowerCase()] || '#999';

  return (
    <span className="mode-badge" style={{ backgroundColor: color }}>
      {mode.toUpperCase()}
    </span>
  );
}
```

### 3. Historique Contextuel

```typescript
export function ContextHistory() {
  const [context, setContext] = useState<string[]>([]);

  useEffect(() => {
    const loadContext = async () => {
      const ctx = await invoke<string[]>('singularity_cortex_get_context', {
        count: 20
      });
      setContext(ctx);
    };
    loadContext();
  }, []);

  return (
    <div className="context-history">
      <h4>Contexte Récent ({context.length})</h4>
      <ul>
        {context.map((entry, i) => (
          <li key={i} className="context-entry">
            <span className="index">[{i+1}]</span>
            <span className="content">{entry.substring(0, 100)}...</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

---

## 🔌 Hooks React Personnalisés

```typescript
// hooks/useSingularityCortex.ts
import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';

export function useSingularityState() {
  const [state, setState] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    setLoading(true);
    const s = await invoke('singularity_cortex_get_state');
    setState(s);
    setLoading(false);
  };

  useEffect(() => {
    refresh();
  }, []);

  return { state, loading, refresh };
}

export function useSingularityStats() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const fetchStats = async () => {
      const s = await invoke('singularity_cortex_get_stats');
      setStats(s);
    };

    fetchStats();
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, []);

  return stats;
}

export function useModeManager() {
  const [currentMode, setCurrentMode] = useState<string>('coach');

  const changeMode = async (mode: string) => {
    await invoke('singularity_cortex_set_mode', { mode });
    setCurrentMode(mode);
  };

  const reset = async () => {
    await invoke('singularity_cortex_reset');
    setCurrentMode('coach');
  };

  return { currentMode, changeMode, reset };
}
```

**Usage:**

```typescript
function MyComponent() {
  const { state, loading } = useSingularityState();
  const stats = useSingularityStats();
  const { currentMode, changeMode, reset } = useModeManager();

  if (loading) return <div>Chargement...</div>;

  return (
    <div>
      <p>Mode: {currentMode}</p>
      <button onClick={() => changeMode('architect')}>Mode Architecte</button>
      <button onClick={reset}>Reset</button>
    </div>
  );
}
```

---

## 🧪 Tests Frontend

```typescript
// __tests__/singularity-cortex.test.ts
import { invoke } from '@tauri-apps/api/core';

describe('Singularity Cortex Integration', () => {
  test('should get state', async () => {
    const state = await invoke('singularity_cortex_get_state');
    expect(state).toHaveProperty('global_mode');
    expect(state).toHaveProperty('coherence_level');
  });

  test('should get stats', async () => {
    const stats = await invoke('singularity_cortex_get_stats');
    expect(stats).toHaveProperty('total_interactions');
    expect(stats.total_interactions).toBeGreaterThanOrEqual(0);
  });

  test('should change mode', async () => {
    await invoke('singularity_cortex_set_mode', { mode: 'architect' });
    const state = await invoke('singularity_cortex_get_state');
    expect(state.global_mode).toBe('Architect');
  });

  test('should record interaction', async () => {
    const statsBefore = await invoke('singularity_cortex_get_stats');
    await invoke('singularity_cortex_record_interaction');
    const statsAfter = await invoke('singularity_cortex_get_stats');
    expect(statsAfter.total_interactions).toBe(statsBefore.total_interactions + 1);
  });

  test('should push context', async () => {
    await invoke('singularity_cortex_push_context', {
      content: 'Test context entry',
    });
    const context = await invoke('singularity_cortex_get_context', { count: 1 });
    expect(context[0]).toBe('Test context entry');
  });

  test('should reset', async () => {
    await invoke('singularity_cortex_reset');
    const state = await invoke('singularity_cortex_get_state');
    expect(state.global_mode).toBe('Coach');
    expect(state.coherence_level).toBe(1.0);
    expect(state.long_context).toHaveLength(0);
  });
});
```

---

## 📚 Documentation Complète

**Fichiers de référence:**

- Backend: `src-tauri/src/singularity_cortex/`
- API Handlers: `src-tauri/src/api/handlers_v14.rs` (lignes 32-45)
- Main Entry: `src-tauri/src/main.rs` (lignes 91-203)

**Commits clés:**

- `8b852a0`: Core implementation (6 modules)
- `fb8c571`: Documentation report
- `faa1a47`: Intégration Tauri complète

**Architecture globale:**

```
Frontend (TypeScript/React)
     ↓ invoke()
Tauri IPC Layer (handlers_v14.rs)
     ↓
Singularity Cortex API (api.rs)
     ↓
SingularityCortex Orchestrator (mod.rs)
     ↓
6 Core Modules (state, context, coherence, memory, evolution, api)
     ↓
Unified Memory OS v2 (SUPER PROMPT #6)
```

---

## ✅ Checklist d'Intégration

- [x] **Backend**: Modules Rust créés et compilés
- [x] **API**: 7 commandes Tauri exposées
- [x] **Handlers**: Intégration dans handlers_v14.rs
- [x] **Main**: State management dans main.rs
- [x] **Documentation**: Guide frontend complet
- [ ] **Frontend**: Créer hooks React personnalisés
- [ ] **UI**: Implémenter composants dashboard
- [ ] **Tests**: Tests d'intégration frontend
- [ ] **Analytics**: Tracking métriques cognitives

---

## 🚀 Prochaines Étapes

1. **Créer composants UI** (Dashboard, ModeSelector, CoherenceGauge)
2. **Intégrer dans ChatEngine** (tracking automatique)
3. **Tests E2E** (Playwright avec Tauri)
4. **Analytics** (Grafana dashboard pour métriques)
5. **Documentation utilisateur** (guide interactif)

---

**Status:** ✅ PRÊT POUR DÉVELOPPEMENT FRONTEND  
**Auteur:** GitHub Copilot (Claude Sonnet 4.5)  
**Date:** 7 décembre 2025
