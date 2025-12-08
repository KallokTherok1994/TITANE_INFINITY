# 🎯 MIGRATION GUIDE: useState → useSingularityStore

**Date**: 23 novembre 2025
**Phase**: Phase 4 v14.0.0 - Week 2
**Objectif**: Migrer 243 useState → 50 useState (80% réduction)

---

## 📚 TABLE DES MATIÈRES

1. [Concept](#concept)
2. [API Reference](#api-reference)
3. [Patterns de Migration](#patterns-de-migration)
4. [Exemples Avant/Après](#exemples-avantaprès)
5. [Performance](#performance)
6. [Troubleshooting](#troubleshooting)

---

## 💡 CONCEPT

### Problème Actuel (v17.3.0)

```tsx
// ❌ État local dupliqué dans chaque composant
function Dashboard() {
  const [cpuUsage, setCpuUsage] = useState(0);
  const [memoryUsage, setMemoryUsage] = useState(0);

  useEffect(() => {
    // Poll manuel
    const interval = setInterval(async () => {
      const metrics = await invoke('get_helios_state');
      setCpuUsage(metrics.cpu_usage);
      setMemoryUsage(metrics.memory_usage);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return <div>CPU: {cpuUsage}%</div>;
}
```

**Problèmes**:
- 🔴 État dupliqué (chaque composant fait son invoke)
- 🔴 Polling manuel (setInterval dans chaque composant)
- 🔴 Pas de synchronisation entre composants
- 🔴 243 useState dispersés (maintenance difficile)

### Solution v14.0.0

```tsx
// ✅ État centralisé, auto-sync via SingularityBridge
function Dashboard() {
  const cpuUsage = useSingularityStore(s => s.physical.helios.cpu_usage);
  const memoryUsage = useSingularityStore(s => s.physical.helios.memory_usage);

  return <div>CPU: {cpuUsage}%</div>;
}
```

**Avantages**:
- ✅ État centralisé (1 source de vérité: SingularityState)
- ✅ Auto-sync temps réel (événements Tauri)
- ✅ Synchronisation automatique entre composants
- ✅ 50 useState cibles (maintenance simplifiée)
- ✅ Performance optimisée (selector-based, évite re-renders)

---

## 📖 API REFERENCE

### useSingularityStore<T>(selector, options?)

Hook principal avec sélecteur.

**Signature**:
```typescript
function useSingularityStore<T>(
  selector: (state: SingularityState) => T,
  options?: { equalityFn?: (a: unknown, b: unknown) => boolean }
): T
```

**Paramètres**:
- `selector`: Fonction extrayant donnée du state
- `options.equalityFn`: Comparaison custom (défaut: `strictEqual`)

**Equality Functions**:
- `strictEqual`: `===` (défaut, pour primitives)
- `shallowEqual`: Objets premier niveau
- `deepEqual`: Récursif (coûteux, éviter)

**Exemples**:
```tsx
// Primitive (nombre, string, boolean)
const cpuUsage = useSingularityStore(s => s.physical.helios.cpu_usage);

// Objet (besoin shallowEqual)
const helios = useSingularityStore(
  s => s.physical.helios,
  { equalityFn: shallowEqual }
);

// Computed value
const isHealthy = useSingularityStore(
  s => s.physical.helios.cpu_usage < 80
);
```

### Hooks Spécialisés

```typescript
// Layers entiers
usePhysicalLayer()   // Physical layer complet
useCognitiveLayer()  // Cognitive layer complet
useSymbolicLayer()   // Symbolic layer complet
useAdaptiveLayer()   // Adaptive layer complet
useMetaLayer()       // Meta layer complet

// Shortcuts
useHeliosMetrics()   // Physical.helios (CPU, RAM, etc.)
useGlobalCoherence() // Santé système globale
useIsCritical()      // État critique (CPU>90% ou RAM>95%)
```

### useSingularityActions()

Hook pour mutations (pas de subscription, performance).

```typescript
const {
  updatePhysical,
  updateCognitive,
  save,
  load,
  getFullState
} = useSingularityActions();

// Update + save
await updatePhysical({ ...physical, helios: newHelios });
await save();
```

---

## 🔄 PATTERNS DE MIGRATION

### Pattern 1: useState → useSingularityStore (Primitive)

**AVANT**:
```tsx
const [cpuUsage, setCpuUsage] = useState(0);

useEffect(() => {
  const interval = setInterval(async () => {
    const metrics = await invoke('get_helios_state');
    setCpuUsage(metrics.cpu_usage);
  }, 1000);
  return () => clearInterval(interval);
}, []);
```

**APRÈS**:
```tsx
const cpuUsage = useSingularityStore(s => s.physical.helios.cpu_usage);
// Auto-updates, no useEffect, no interval
```

**Réduction**: ~10 lignes → 1 ligne

---

### Pattern 2: Multiple useState → Selector

**AVANT**:
```tsx
const [cpu, setCpu] = useState(0);
const [memory, setMemory] = useState(0);
const [disk, setDisk] = useState(0);

useEffect(() => {
  const fetchMetrics = async () => {
    const data = await invoke('get_helios_state');
    setCpu(data.cpu_usage);
    setMemory(data.memory_usage);
    setDisk(data.disk_usage);
  };
  fetchMetrics();
  const interval = setInterval(fetchMetrics, 1000);
  return () => clearInterval(interval);
}, []);
```

**APRÈS** (Option A - Séparés):
```tsx
const cpu = useSingularityStore(s => s.physical.helios.cpu_usage);
const memory = useSingularityStore(s => s.physical.helios.memory_usage);
const disk = useSingularityStore(s => s.physical.helios.disk_usage);
```

**APRÈS** (Option B - Objet, plus efficient):
```tsx
const helios = useSingularityStore(
  s => s.physical.helios,
  { equalityFn: shallowEqual }
);

// Usage: helios.cpu_usage, helios.memory_usage, helios.disk_usage
```

**Réduction**: ~15 lignes → 1-3 lignes

---

### Pattern 3: Computed useState → Selector Computed

**AVANT**:
```tsx
const [isSystemHealthy, setIsSystemHealthy] = useState(true);

useEffect(() => {
  const check = async () => {
    const metrics = await invoke('get_helios_state');
    setIsSystemHealthy(metrics.cpu_usage < 80 && metrics.memory_usage < 90);
  };
  check();
  const interval = setInterval(check, 1000);
  return () => clearInterval(interval);
}, []);
```

**APRÈS**:
```tsx
const isSystemHealthy = useSingularityStore(s =>
  s.physical.helios.cpu_usage < 80 && s.physical.helios.memory_usage < 90
);
```

**Réduction**: ~10 lignes → 1 ligne

---

### Pattern 4: useState + Handler → useSingularityActions

**AVANT**:
```tsx
const [metrics, setMetrics] = useState(initialMetrics);

const updateMetrics = async (newMetrics) => {
  await invoke('singularity_update_physical', { physical: { ...physical, helios: newMetrics } });
  setMetrics(newMetrics);
};
```

**APRÈS**:
```tsx
const { updatePhysical } = useSingularityActions();
const helios = useSingularityStore(s => s.physical.helios);

const updateMetrics = async (newMetrics) => {
  await updatePhysical({ ...physical, helios: newMetrics });
  // State auto-update via événement Tauri
};
```

**Réduction**: 2 actions → 1 action (sync automatique)

---

### Pattern 5: Custom Hook Migration

**AVANT**:
```tsx
function useSystemMetrics() {
  const [cpu, setCpu] = useState(0);
  const [memory, setMemory] = useState(0);

  useEffect(() => {
    const fetchMetrics = async () => {
      const data = await invoke('get_helios_state');
      setCpu(data.cpu_usage);
      setMemory(data.memory_usage);
    };
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 1000);
    return () => clearInterval(interval);
  }, []);

  return { cpu, memory };
}
```

**APRÈS**:
```tsx
function useSystemMetrics() {
  return useSingularityStore(
    s => ({
      cpu: s.physical.helios.cpu_usage,
      memory: s.physical.helios.memory_usage
    }),
    { equalityFn: shallowEqual }
  );
}
```

**Réduction**: ~15 lignes → 6 lignes

---

## 📝 EXEMPLES AVANT/APRÈS

### Exemple 1: Dashboard Component

**AVANT** (24 useState):
```tsx
function Dashboard() {
  // System metrics (6 useState)
  const [cpuUsage, setCpuUsage] = useState(0);
  const [memoryUsage, setMemoryUsage] = useState(0);
  const [diskUsage, setDiskUsage] = useState(0);
  const [temperature, setTemperature] = useState(0);
  const [battery, setBattery] = useState<number | null>(null);
  const [uptime, setUptime] = useState(0);

  // Health status (4 useState)
  const [globalHealth, setGlobalHealth] = useState(1);
  const [servicesRunning, setServicesRunning] = useState(0);
  const [errorsCount, setErrorsCount] = useState(0);
  const [warningsCount, setWarningsCount] = useState(0);

  // Performance (4 useState)
  const [fps, setFps] = useState(60);
  const [latency, setLatency] = useState(0);
  const [networkSpeed, setNetworkSpeed] = useState(0);
  const [responseTime, setResponseTime] = useState(0);

  // UI State (10 useState)
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshRate, setRefreshRate] = useState(1000);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [chartType, setChartType] = useState('line');
  const [timeRange, setTimeRange] = useState('1h');
  const [notifications, setNotifications] = useState(true);
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [heliosData, healthData, perfData] = await Promise.all([
          invoke('get_helios_state'),
          invoke('get_system_health'),
          invoke('get_helios_state')
        ]);

        setCpuUsage(heliosData.cpu_usage);
        setMemoryUsage(heliosData.memory_usage);
        setDiskUsage(heliosData.disk_usage);
        setTemperature(heliosData.temperature);
        setBattery(heliosData.battery_level);

        setGlobalHealth(healthData.global_health);
        setServicesRunning(healthData.services_running);
        setErrorsCount(healthData.errors_count);
        setWarningsCount(healthData.warnings_count);
        setUptime(healthData.uptime);

        setFps(perfData.fps);
        setLatency(perfData.latency);

        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, refreshRate);
    return () => clearInterval(interval);
  }, [refreshRate]);

  return (
    <div>
      <p>CPU: {cpuUsage}%</p>
      <p>Memory: {memoryUsage}%</p>
      {/* ... 20+ autres <p> */}
    </div>
  );
}
```

**APRÈS** (5 useState):
```tsx
function Dashboard() {
  // SingularityStore (remplace 14 useState metrics)
  const helios = useSingularityStore(s => s.physical.helios, { equalityFn: shallowEqual });
  const health = useSingularityStore(s => s.physical.system_health, { equalityFn: shallowEqual });
  const metrics = useSingularityStore(s => s.physical.metrics, { equalityFn: shallowEqual });

  // UI State local (5 useState - vraiment local au composant)
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [chartType, setChartType] = useState('line');
  const [timeRange, setTimeRange] = useState('1h');
  const [theme, setTheme] = useState('dark');

  // Plus de useEffect! Auto-sync via SingularityBridge

  return (
    <div>
      <p>CPU: {helios.cpu_usage}%</p>
      <p>Memory: {helios.memory_usage}%</p>
      <p>Disk: {helios.disk_usage}%</p>
      <p>Temperature: {helios.temperature}°C</p>
      <p>Battery: {helios.battery_level ?? 'N/A'}</p>
      <p>Health: {health.global_health}</p>
      <p>Services: {health.services_running}</p>
      <p>Errors: {health.errors_count}</p>
      <p>Warnings: {health.warnings_count}</p>
      <p>FPS: {metrics.fps}</p>
      <p>Latency: {metrics.latency}ms</p>
    </div>
  );
}
```

**Résultats**:
- **useState**: 24 → 5 (80% réduction)
- **Lignes code**: ~80 → ~30 (62% réduction)
- **useEffect**: 1 complexe → 0
- **invoke calls**: 3 → 0 (géré par SingularityBridge)

---

### Exemple 2: PerformanceMonitor

**AVANT** (15 useState):
```tsx
function PerformanceMonitor() {
  const [cpu, setCpu] = useState(0);
  const [memory, setMemory] = useState(0);
  const [disk, setDisk] = useState(0);
  const [fps, setFps] = useState(60);
  const [latency, setLatency] = useState(0);
  const [temperature, setTemperature] = useState(0);

  const [cpuHistory, setCpuHistory] = useState<number[]>([]);
  const [memoryHistory, setMemoryHistory] = useState<number[]>([]);
  const [alerts, setAlerts] = useState<string[]>([]);

  const [showDetails, setShowDetails] = useState(false);
  const [chartType, setChartType] = useState('line');
  const [refreshRate, setRefreshRate] = useState(1000);
  const [autoScale, setAutoScale] = useState(true);
  const [colorScheme, setColorScheme] = useState('default');
  const [maxDataPoints, setMaxDataPoints] = useState(60);

  useEffect(() => {
    const fetch = async () => {
      const data = await invoke('get_helios_state');
      setCpu(data.cpu_usage);
      setMemory(data.memory_usage);
      setDisk(data.disk_usage);
      setFps(data.fps || 60);
      setLatency(data.latency || 0);
      setTemperature(data.temperature);

      // Update histories
      setCpuHistory(prev => [...prev, data.cpu_usage].slice(-maxDataPoints));
      setMemoryHistory(prev => [...prev, data.memory_usage].slice(-maxDataPoints));

      // Check alerts
      if (data.cpu_usage > 90) {
        setAlerts(prev => [...prev, 'CPU > 90%']);
      }
    };

    fetch();
    const interval = setInterval(fetch, refreshRate);
    return () => clearInterval(interval);
  }, [refreshRate, maxDataPoints]);

  return <div>...</div>;
}
```

**APRÈS** (9 useState):
```tsx
function PerformanceMonitor() {
  // Metrics from SingularityStore (remplace 6 useState)
  const helios = useSingularityStore(s => s.physical.helios, { equalityFn: shallowEqual });
  const isCritical = useIsCritical();

  // History tracking (2 useState - vraiment nécessaire)
  const [cpuHistory, setCpuHistory] = useState<number[]>([]);
  const [memoryHistory, setMemoryHistory] = useState<number[]>([]);

  // UI State (7 useState - configuration locale)
  const [showDetails, setShowDetails] = useState(false);
  const [chartType, setChartType] = useState('line');
  const [refreshRate, setRefreshRate] = useState(1000);
  const [autoScale, setAutoScale] = useState(true);
  const [colorScheme, setColorScheme] = useState('default');
  const [maxDataPoints, setMaxDataPoints] = useState(60);
  const [alerts, setAlerts] = useState<string[]>([]);

  // Track history when helios updates
  useEffect(() => {
    setCpuHistory(prev => [...prev, helios.cpu_usage].slice(-maxDataPoints));
    setMemoryHistory(prev => [...prev, helios.memory_usage].slice(-maxDataPoints));

    if (isCritical) {
      setAlerts(prev => [...prev, 'System critical!']);
    }
  }, [helios.cpu_usage, helios.memory_usage, isCritical, maxDataPoints]);

  return (
    <div>
      <p>CPU: {helios.cpu_usage}%</p>
      <p>Memory: {helios.memory_usage}%</p>
      <Chart data={cpuHistory} />
      {isCritical && <Alert>System Critical!</Alert>}
    </div>
  );
}
```

**Résultats**:
- **useState**: 15 → 9 (40% réduction)
- **Lignes code**: ~60 → ~35 (42% réduction)
- **Performance**: Meilleure (selector-based, évite re-renders inutiles)

---

## ⚡ PERFORMANCE

### Re-render Optimization

**Problème**: Objet oblige re-render même si valeurs inchangées

```tsx
// ❌ MAUVAIS: Re-render à chaque update state (même si helios identique)
const helios = useSingularityStore(s => s.physical.helios);
// Default strictEqual: {} !== {} (objet différent)
```

**Solution**: `shallowEqual` pour objets

```tsx
// ✅ BON: Re-render uniquement si propriétés changent
const helios = useSingularityStore(
  s => s.physical.helios,
  { equalityFn: shallowEqual }
);
```

### Selector Granularity

**Fine-grained** (optimal):
```tsx
// Re-render uniquement si cpu_usage change
const cpu = useSingularityStore(s => s.physical.helios.cpu_usage);
```

**Coarse-grained** (moins optimal):
```tsx
// Re-render si N'IMPORTE QUELLE propriété helios change
const helios = useSingularityStore(s => s.physical.helios, { equalityFn: shallowEqual });
```

**Règle**: Sélectionner le plus granulaire possible

---

## 🐛 TROUBLESHOOTING

### Problème: `undefined` initial

```tsx
// ❌ ERREUR: state pas encore sync
const cpu = useSingularityStore(s => s.physical.helios.cpu_usage);
console.log(cpu); // undefined (premier render)
```

**Solution 1**: Valeur défaut

```tsx
const cpu = useSingularityStore(s => s.physical.helios.cpu_usage) || 0;
```

**Solution 2**: Conditional render

```tsx
const helios = useSingularityStore(s => s.physical.helios);

if (!helios) return <Loading />;
return <div>CPU: {helios.cpu_usage}%</div>;
```

### Problème: Re-render trop fréquents

```tsx
// ❌ MAUVAIS: Re-render à chaque event (objet différent)
const helios = useSingularityStore(s => s.physical.helios);
```

**Solution**: `shallowEqual`

```tsx
// ✅ BON
const helios = useSingularityStore(
  s => s.physical.helios,
  { equalityFn: shallowEqual }
);
```

### Problème: Selector complexe ralentit

```tsx
// ❌ MAUVAIS: Calcul lourd à chaque appel
const complexMetric = useSingularityStore(s => {
  // Calcul lourd...
  return heavyComputation(s.physical, s.cognitive, s.symbolic);
});
```

**Solution**: Memoization externe

```tsx
const state = useSingularityStore(s => s, { equalityFn: shallowEqual });
const complexMetric = useMemo(() =>
  heavyComputation(state.physical, state.cognitive, state.symbolic),
  [state]
);
```

---

## 🎯 CHECKLIST MIGRATION

- [ ] Identifier useState liés à SingularityState
- [ ] Remplacer par `useSingularityStore(selector)`
- [ ] Supprimer `useEffect` + `invoke` + `setInterval`
- [ ] Ajouter `shallowEqual` si objet
- [ ] Vérifier valeurs initiales (`|| defaultValue`)
- [ ] Tester re-renders (React DevTools Profiler)
- [ ] Supprimer useState inutiles
- [ ] Commit

**Target**: 243 useState → 50 useState (garder uniquement UI state local)

---

**Auteur**: TITANE∞ v14.0.0
**Phase**: 4 Week 2 (useState Migration)
