# TITANE∞ v25.3.2 — GUIDE D'INTÉGRATION FUSION HOOKS

> **Démarrage rapide:** Intégration des 3 hooks de fusion backend/frontend

---

## 🚀 INTÉGRATION RAPIDE

### 1. Ajouter le Dashboard au Router (Recommandé)

#### Option A: Route dédiée `/fusion-dashboard`

```tsx
// Dans src/App.tsx
import { Route } from 'react-router-dom';
import PerfectFusionDashboard from '@/components/PerfectFusionDashboard';

// Dans la fonction App(), ajouter la route:
<Route path="/fusion-dashboard" element={<PerfectFusionDashboard />} />;
```

**Accès:** `http://localhost:5173/fusion-dashboard`

---

#### Option B: Intégration dans DevPage (recommandé)

```tsx
// Dans src/pages/DevPage.tsx
import PerfectFusionDashboard from '@/components/PerfectFusionDashboard';

// Dans DevPageContent, créer un nouvel onglet "Fusion":
const tabs = [
  { id: 'overview', label: "Vue d'ensemble", icon: Activity },
  { id: 'metrics', label: 'Métriques', icon: Activity },
  { id: 'fusion', label: 'Fusion Backend/Frontend', icon: Activity }, // NOUVEAU
  // ... autres tabs
];

// Dans le render, ajouter le cas 'fusion':
{
  activeTab === 'fusion' && (
    <div className="dev-section">
      <PerfectFusionDashboard />
    </div>
  );
}
```

**Accès:** `http://localhost:5173/dev` puis cliquer sur l'onglet "Fusion Backend/Frontend"

---

### 2. Utilisation des Hooks Individuellement

#### useSingularitySync

```tsx
import { useSingularitySync } from '@/hooks/useSingularitySync';

function MyComponent() {
  const { state, isSyncing, lastError, metrics } = useSingularitySync({
    autoSync: true, // Auto-sync activé
    syncInterval: 1000, // Sync toutes les 1s
    conflictResolution: 'merge', // Stratégie de fusion
  });

  if (isSyncing) return <div>Syncing...</div>;
  if (lastError) return <div>Error: {lastError.message}</div>;

  return (
    <div>
      <h3>Singularity State</h3>
      <p>Consciousness: {state?.consciousness}</p>
      <p>Coherence: {(state?.autoCoherence * 100).toFixed(1)}%</p>
      <p>Avg Sync Time: {metrics.avgSyncTime}ms</p>
    </div>
  );
}
```

**Options:**

- `autoSync`: Auto-sync activé (défaut: `true`)
- `syncInterval`: Intervalle en ms (défaut: `1000`)
- `bidirectional`: Sync bidirectionnelle (défaut: `true`)
- `conflictResolution`: `'frontend'` | `'backend'` | `'merge'` (défaut: `'merge'`)

---

#### useMemoryEngine

```tsx
import { useMemoryEngine } from '@/hooks/useMemoryEngine';

function ChatComponent() {
  const { stats, isLoading, saveToMemory, getMemoryContext, compressMemory } =
    useMemoryEngine();

  const handleSend = async (message: string) => {
    // Auto-save avec extraction tags/intentions/émotions
    const id = await saveToMemory(message, 'short', {
      source: 'chat',
      userId: 'user123',
    });
    console.log('Saved:', id);
  };

  const handleSearch = async (query: string) => {
    // Recherche contextuelle
    const results = await getMemoryContext(query, 5);
    console.log('Found:', results);
  };

  return (
    <div>
      <h3>Memory Stats</h3>
      <p>Total: {stats?.total_entries}</p>
      <p>Short: {stats?.short_term}</p>
      <p>Medium: {stats?.medium_term}</p>
      <p>Long: {stats?.long_term}</p>
      <p>Health: {(stats?.health_score * 100).toFixed(0)}%</p>

      <button onClick={() => compressMemory()}>Compress Memory</button>
    </div>
  );
}
```

**Types de mémoire:**

- `'short'`: Court terme (conversations récentes)
- `'medium'`: Moyen terme (contexte session)
- `'long'`: Long terme (connaissances persistantes)

---

#### useSystemHealth

```tsx
import { useSystemHealth } from '@/hooks/useSystemHealth';
import { useEffect } from 'react';

function HealthMonitor() {
  const {
    health,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    resolveAlert,
    triggerRecovery,
  } = useSystemHealth();

  useEffect(() => {
    startMonitoring(5000); // Refresh every 5s
    return () => stopMonitoring();
  }, []);

  if (!health) return <div>Loading health...</div>;

  return (
    <div>
      <h2>System Health: {health.global_status}</h2>

      {/* Conversation Health */}
      <div>
        <h3>Conversation</h3>
        <p>Status: {health.conversation.status}</p>
        <p>Messages: {health.conversation.total_messages}</p>
        <p>Response Time: {health.conversation.avg_response_time_ms}ms</p>
        <p>Error Rate: {(health.conversation.error_rate * 100).toFixed(2)}%</p>
      </div>

      {/* Alerts */}
      {health.alerts.map(alert => (
        <div key={alert.id} className={`alert alert-${alert.severity}`}>
          <p>{alert.message}</p>
          <button onClick={() => resolveAlert(alert.id)}>Resolve</button>
          {alert.auto_recoverable && (
            <button onClick={() => triggerRecovery(alert.component)}>Auto-Recover</button>
          )}
        </div>
      ))}
    </div>
  );
}
```

**Composants surveillés:**

1. **Conversation:** messages, response time, error rate
2. **Memory:** entries, size, fragmentation
3. **Singularity:** engines, sync status, conflicts
4. **System:** uptime, CPU, memory, network

---

## 📦 EXPORTS DISPONIBLES

```tsx
// Imports individuels
import { useSingularitySync } from '@/hooks/useSingularitySync';
import { useMemoryEngine } from '@/hooks/useMemoryEngine';
import { useSystemHealth } from '@/hooks/useSystemHealth';

// Import depuis index (recommandé)
import { useSingularitySync, useMemoryEngine, useSystemHealth } from '@/hooks';

// Types
import type {
  SingularitySyncOptions,
  SingularitySyncReturn,
  SingularitySyncMetrics,
  MemoryType,
  MemoryEntry,
  MemoryStats,
  HealthStatus,
  UnifiedHealth,
  HealthAlert,
} from '@/hooks';
```

---

## 🧪 TESTS

### Tests manuels rapides

1. **Démarrer dev server:**

   ```bash
   npm run dev
   ```

2. **Accéder au dashboard:**
   - Option A: `http://localhost:5173/fusion-dashboard`
   - Option B: `http://localhost:5173/dev` → Onglet "Fusion"

3. **Vérifier:**
   - ✅ Global Health badge (healthy/degraded/critical)
   - ✅ Singularity Sync métriques (sync time, error count)
   - ✅ Memory Stats (total entries, health score)
   - ✅ Health Details (4 composants)
   - ✅ Alerts (si erreurs détectées)
   - ✅ Monitoring status (🟢 Active)

---

## ⚡ PERFORMANCE

### Métriques cibles

| Métrique         | Cible  | Optimisations                   |
| ---------------- | ------ | ------------------------------- |
| Singularity Sync | <100ms | Polling optimisé, batch updates |
| Memory Save      | <50ms  | Cache local, compression        |
| Health Refresh   | <200ms | Parallel fetch, cache alerts    |
| CPU Usage        | <80%   | Throttle, debounce              |
| Memory Usage     | <500MB | Cleanup, lazy loading           |

### Optimisations recommandées

```tsx
// 1. Sync interval ajustable selon performance
const { state } = useSingularitySync({
  syncInterval: cpuUsage > 70 ? 2000 : 1000, // 2s si CPU élevé
});

// 2. Pause monitoring quand page non visible
useEffect(() => {
  const handleVisibilityChange = () => {
    if (document.hidden) {
      stopMonitoring();
    } else {
      startMonitoring(5000);
    }
  };

  document.addEventListener('visibilitychange', handleVisibilityChange);
  return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
}, []);

// 3. Compression mémoire périodique
useEffect(() => {
  const interval = setInterval(() => {
    if (stats && stats.total_entries > 1000) {
      compressMemory();
    }
  }, 60000); // Toutes les minutes

  return () => clearInterval(interval);
}, [stats]);
```

---

## 🐛 DEBUGGING

### Activer les logs

```tsx
// Dans votre composant
const { state } = useSingularitySync({
  autoSync: true,
  onSyncSuccess: state => {
    console.log('[Fusion] Sync success:', state);
  },
  onSyncError: error => {
    console.error('[Fusion] Sync error:', error);
  },
});
```

### Console browser

```javascript
// Inspecter état Singularity
window.__SINGULARITY_STATE__ = singularityEngine.getState();

// Inspecter métriques
window.__FUSION_METRICS__ = {
  singularity: metrics,
  memory: memoryStats,
  health: health,
};
```

---

## 📚 RESSOURCES

- **Documentation complète:** [FUSION_PARFAITE_v25.3.2_COMPLETE.md](./FUSION_PARFAITE_v25.3.2_COMPLETE.md)
- **Rapport final:** [FUSION_RAPPORT_FINAL_v25.3.2.md](./FUSION_RAPPORT_FINAL_v25.3.2.md)
- **Architecture:** [FUSION_BACKEND_FRONTEND_v25.3.2.md](./FUSION_BACKEND_FRONTEND_v25.3.2.md)

---

## 🎯 CHECKLIST INTÉGRATION

- [ ] Dashboard ajouté au router (route `/fusion-dashboard` ou onglet DevPage)
- [ ] Tests manuels effectués (toutes sections visibles)
- [ ] Métriques validées (<100ms sync, <5% errors)
- [ ] Aucune erreur TypeScript (0 erreurs)
- [ ] Performance acceptable (60 FPS, <500MB memory)
- [ ] Monitoring actif (🟢 status)
- [ ] Alertes fonctionnelles (si erreurs injectées)
- [ ] Auto-recovery testé (boutons actifs)

---

**État:** ✅ **PRÊT POUR INTÉGRATION**

_TITANE∞ v25.3.2 — Fusion Backend/Frontend Parfaite_
