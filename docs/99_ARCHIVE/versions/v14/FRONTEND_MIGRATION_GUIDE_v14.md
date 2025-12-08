# 🚀 TITANE v14 — GUIDE DE MIGRATION FRONTEND

## ✅ NOUVELLES COMMANDES TAURI DISPONIBLES

### Core v14 - SingularityEngine

```typescript
import { invoke } from '@tauri-apps/api/tauri';

// Types TypeScript
interface EngineHealth {
  Healthy: void;
  Degraded: void;
  Failing: void;
  Offline: void;
}

interface EngineMetrics {
  ticks: number;
  stability: number;  // 0.0 - 1.0
  latency_ms: number;
  last_update_ms: number;
  error_count: number;
  success_rate: number;  // 0.0 - 1.0
}

interface ModuleInfo {
  name: string;
  version: string;
  initialized: boolean;
  health: EngineHealth;
}

interface SingularityState {
  nexus: any;
  memory: any;
  harmonia: any;
  sentinel: any;
  cognition: CognitionState;
  timeline: TimelineState;
  metrics: EngineMetrics;
  init_timestamp_ms: number;
  last_sync_ms: number;
}

// Initialiser le moteur
async function initEngine() {
  try {
    const result = await invoke<string>('engine_init');
    console.log(result); // "SingularityEngine v14 initialized successfully"
  } catch (error) {
    console.error('Init failed:', error);
  }
}

// Exécuter un cycle
async function tickEngine() {
  try {
    const health = await invoke<EngineHealth>('engine_tick');
    console.log('Engine health:', health);
  } catch (error) {
    console.error('Tick failed:', error);
  }
}

// Synchroniser l'état
async function syncEngine() {
  try {
    const result = await invoke<string>('engine_sync');
    console.log(result);
  } catch (error) {
    console.error('Sync failed:', error);
  }
}

// Obtenir la santé
async function getHealth() {
  const health = await invoke<EngineHealth>('engine_health');
  return health;
}

// Obtenir les métriques
async function getMetrics() {
  const metrics = await invoke<EngineMetrics>('engine_metrics');
  console.log(`Ticks: ${metrics.ticks}, Stability: ${metrics.stability}`);
  return metrics;
}

// Obtenir info sur tous les modules
async function getModules() {
  const modules = await invoke<ModuleInfo[]>('engine_modules');
  modules.forEach(m => {
    console.log(`${m.name} v${m.version}: ${m.initialized ? 'Ready' : 'Not ready'}`);
  });
  return modules;
}

// Obtenir snapshot complet
async function getSnapshot() {
  const state = await invoke<SingularityState>('engine_snapshot');
  console.log('Full state:', state);
  return state;
}

// Arrêter le moteur
async function stopEngine() {
  const result = await invoke<string>('engine_stop');
  console.log(result);
}

// Vérifier si running
async function isEngineRunning() {
  const running = await invoke<boolean>('engine_status');
  return running;
}
```

## 🎨 COMPOSANT REACT EXEMPLE

```tsx
import React, { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/tauri';

interface EngineMetrics {
  ticks: number;
  stability: number;
  latency_ms: number;
  last_update_ms: number;
  error_count: number;
  success_rate: number;
}

export const SingularityMonitor: React.FC = () => {
  const [metrics, setMetrics] = useState<EngineMetrics | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    // Init engine on mount
    invoke('engine_init')
      .then(() => {
        console.log('Engine initialized');
        setIsRunning(true);
      })
      .catch(console.error);

    // Poll metrics every second
    const interval = setInterval(async () => {
      try {
        // Tick the engine
        await invoke('engine_tick');

        // Get metrics
        const m = await invoke<EngineMetrics>('engine_metrics');
        setMetrics(m);
      } catch (error) {
        console.error('Polling error:', error);
      }
    }, 1000);

    return () => {
      clearInterval(interval);
      invoke('engine_stop').catch(console.error);
    };
  }, []);

  if (!metrics) {
    return <div>Loading engine...</div>;
  }

  return (
    <div className="singularity-monitor">
      <h2>🌟 TITANE∞ v14 - Singularity Engine</h2>

      <div className="metrics">
        <div className="metric">
          <label>Status:</label>
          <span className={isRunning ? 'running' : 'stopped'}>
            {isRunning ? '🟢 Running' : '🔴 Stopped'}
          </span>
        </div>

        <div className="metric">
          <label>Ticks:</label>
          <span>{metrics.ticks}</span>
        </div>

        <div className="metric">
          <label>Stability:</label>
          <progress value={metrics.stability} max={1} />
          <span>{(metrics.stability * 100).toFixed(1)}%</span>
        </div>

        <div className="metric">
          <label>Latency:</label>
          <span>{metrics.latency_ms}ms</span>
        </div>

        <div className="metric">
          <label>Success Rate:</label>
          <span>{(metrics.success_rate * 100).toFixed(1)}%</span>
        </div>

        <div className="metric">
          <label>Errors:</label>
          <span className={metrics.error_count > 0 ? 'warning' : ''}>
            {metrics.error_count}
          </span>
        </div>
      </div>
    </div>
  );
};
```

## 🔄 HOOKS PERSONNALISÉS

### useSingularityEngine

```typescript
import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/tauri';

export function useSingularityEngine() {
  const [metrics, setMetrics] = useState<EngineMetrics | null>(null);
  const [health, setHealth] = useState<string>('Unknown');
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let mounted = true;
    let interval: number;

    const init = async () => {
      try {
        await invoke('engine_init');
        if (mounted) setIsRunning(true);

        interval = setInterval(async () => {
          if (!mounted) return;

          try {
            await invoke('engine_tick');
            const m = await invoke<EngineMetrics>('engine_metrics');
            const h = await invoke<any>('engine_health');

            setMetrics(m);
            setHealth(Object.keys(h)[0]);
          } catch (error) {
            console.error('Engine error:', error);
          }
        }, 1000);
      } catch (error) {
        console.error('Init error:', error);
      }
    };

    init();

    return () => {
      mounted = false;
      clearInterval(interval);
      invoke('engine_stop').catch(console.error);
    };
  }, []);

  return { metrics, health, isRunning };
}
```

### useEngineModules

```typescript
export function useEngineModules() {
  const [modules, setModules] = useState<ModuleInfo[]>([]);

  useEffect(() => {
    const fetchModules = async () => {
      try {
        const mods = await invoke<ModuleInfo[]>('engine_modules');
        setModules(mods);
      } catch (error) {
        console.error('Failed to fetch modules:', error);
      }
    };

    fetchModules();
    const interval = setInterval(fetchModules, 5000);

    return () => clearInterval(interval);
  }, []);

  return modules;
}
```

## 📊 EXEMPLE D'UTILISATION COMPLÈTE

```tsx
// App.tsx
import React from 'react';
import { useSingularityEngine, useEngineModules } from './hooks';

export const App: React.FC = () => {
  const { metrics, health, isRunning } = useSingularityEngine();
  const modules = useEngineModules();

  return (
    <div className="app">
      <header>
        <h1>TITANE∞ v14</h1>
        <div className="status">
          Status: {isRunning ? '🟢' : '🔴'} | Health: {health}
        </div>
      </header>

      <main>
        <section className="metrics-panel">
          <h2>Engine Metrics</h2>
          {metrics && (
            <div>
              <p>Ticks: {metrics.ticks}</p>
              <p>Stability: {(metrics.stability * 100).toFixed(1)}%</p>
              <p>Latency: {metrics.latency_ms}ms</p>
              <p>Success Rate: {(metrics.success_rate * 100).toFixed(1)}%</p>
            </div>
          )}
        </section>

        <section className="modules-panel">
          <h2>Active Modules</h2>
          <ul>
            {modules.map(m => (
              <li key={m.name}>
                <strong>{m.name}</strong> v{m.version}
                <span className={m.initialized ? 'ready' : 'loading'}>
                  {m.initialized ? ' ✅' : ' ⏳'}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
};
```

## 🎯 MIGRATION DES ANCIENS APPELS

### Avant (v13)
```typescript
// Ancien système
await invoke('get_helios_state');
await invoke('get_system_health');
await invoke('get_nexus_state');
```

### Après (v14)
```typescript
// Nouveau système unifié
await invoke('engine_health');    // État global
await invoke('engine_metrics');   // Métriques globales
await invoke('engine_modules');   // Info tous modules
await invoke('engine_snapshot');  // État complet
```

## ✨ AVANTAGES v14

1. **API Simplifiée** : 9 commandes au lieu de 50+
2. **État Unifié** : Tout accessible via `engine_snapshot`
3. **Métriques Temps Réel** : `engine_metrics` pour monitoring
4. **Santé Globale** : `engine_health` agrège tous les modules
5. **Déterministe** : Timestamps en milliseconds (u64)
6. **Type-safe** : Types TypeScript bien définis

## 📝 PROCHAINES ÉTAPES

1. ✅ Remplacer les anciens `invoke()` par les nouveaux
2. ✅ Créer composants de monitoring
3. ✅ Implémenter hooks personnalisés
4. ✅ Tester le cycle complet init → tick → sync
5. ✅ Ajouter error handling robuste

---

**Version** : TITANE_INFINITY v14.0.0
**Date** : 23 novembre 2025
