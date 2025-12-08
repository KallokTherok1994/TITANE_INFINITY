# 🔧 GUIDE D'INTÉGRATION TITANE∞ v15.7

## 📦 Architecture Créée

### ✅ Phase 1 : Data Mapping & Sanitization
- **`src/utils/dataMapper.ts`** : Système de conversion Backend → Frontend
  - `safeValue()` : Convertit any → string|number React-safe
  - `mapModuleData()` : Mapping générique pour tous modules
  - `mapHeliosData()` : Mapping spécifique Helios
  - `mapNexusData()` : Mapping spécifique Nexus
  - `mapSelfHealData()` : Mapping spécifique SelfHeal
  - `mapAdaptiveData()` : Mapping spécifique AdaptiveEngine
  - `mapWatchdogData()` : Mapping spécifique Watchdog
  - `mapHarmoniaData()` : Mapping spécifique Harmonia
  - `mapSentinelData()` : Mapping spécifique Sentinel
  - `mapSystemData()` : Mapping données système globales

### ✅ Phase 2 : Universal Module Card
- **`src/components/ModuleCard.v2.tsx`** : Composant React universel
- **`src/components/ModuleCard.v2.css`** : Styles glass morphism

### ✅ Phase 3 : App Layout
- **`src/layouts/AppLayout.tsx`** : Structure layout moderne
- **`src/layouts/AppLayout.css`** : Styles layout responsive

---

## 🚀 INTÉGRATION DANS VOS PAGES

### Exemple 1 : Page Helios (Utilisation du Mapper)

#### ❌ AVANT (v15.6 - Risque d'erreur)
```tsx
import { useTitaneCore } from '../hooks';

export const Helios = () => {
  const { getHeliosMetrics } = useTitaneCore();
  const [metrics, setMetrics] = useState<any>(null);

  // ...fetch logic...

  return (
    <div>
      <p>BPM: {metrics.bpm}</p> {/* ❌ Risque si metrics.bpm est un objet */}
      <p>Status: {metrics.status}</p>
    </div>
  );
};
```

#### ✅ APRÈS (v15.7 - Sécurisé avec ModuleCardV2)
```tsx
import { useTitaneCore } from '../hooks';
import { mapHeliosData } from '../utils/dataMapper';
import { ModuleCardV2 } from '../components/ModuleCard.v2';
import { ModuleCard } from '../components/ModuleCard'; // Ancien composant

export const Helios = () => {
  const { getHeliosMetrics } = useTitaneCore();
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getHeliosMetrics();
        setMetrics(data);
      } catch (err) {
        console.error('Helios fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, [getHeliosMetrics]);

  if (loading) {
    return (
      <div className="module-page">
        <div className="module-page__loading">
          <span className="module-page__loading-icon">❤️</span>
          <p>Chargement Helios...</p>
        </div>
      </div>
    );
  }

  // ✅ Mapping sécurisé des données
  const heliosData = mapHeliosData(metrics);

  return (
    <div className="module-page">
      <div className="module-page__header">
        <h1 className="module-page__title">
          <span className="module-page__icon">❤️</span>
          Helios — Métriques Vitales
        </h1>
      </div>

      <div className="module-page__grid">
        {/* Option 1 : Ancien ModuleCard (v15.6) */}
        <ModuleCard
          title="BPM"
          icon="💓"
          value={heliosData.bpm}
          unit="bpm"
          status={heliosData.status}
          variant={heliosData.bpm > 60 ? 'success' : 'warning'}
        />

        {/* Option 2 : Nouveau ModuleCardV2 avec données mappées */}
        <ModuleCardV2
          title="Helios Status"
          icon="❤️"
          data={{
            status: heliosData.status,
            message: `BPM: ${heliosData.bpm}, Vitality: ${heliosData.vitality}%`,
            uptime: heliosData.uptime,
            last_tick: heliosData.last_tick
          }}
          variant={heliosData.bpm > 60 ? 'success' : 'warning'}
        />
      </div>
    </div>
  );
};
```

---

### Exemple 2 : Page Dashboard (Vue d'ensemble)

```tsx
import { useTitaneCore } from '../hooks';
import { mapSystemData } from '../utils/dataMapper';
import { ModuleCardV2 } from '../components/ModuleCard.v2';

export const Dashboard = () => {
  const { getSystemStatus } = useTitaneCore();
  const [system, setSystem] = useState<any>(null);

  // ...fetch logic...

  // ✅ Mapping complet du système
  const systemData = mapSystemData(system);

  return (
    <div className="module-page">
      <h1>Dashboard TITANE∞</h1>

      <div className="module-page__grid">
        {/* Helios */}
        {systemData.helios && (
          <ModuleCardV2
            title="Helios"
            icon="❤️"
            data={{
              status: systemData.helios.status,
              message: `BPM: ${systemData.helios.bpm}`,
              uptime: systemData.helios.uptime
            }}
            variant="primary"
          />
        )}

        {/* Nexus */}
        {systemData.nexus && (
          <ModuleCardV2
            title="Nexus"
            icon="🧠"
            data={{
              status: systemData.nexus.status,
              message: `${systemData.nexus.nodes} nodes, ${systemData.nexus.connections} connections`
            }}
            variant="success"
          />
        )}

        {/* Watchdog */}
        {systemData.watchdog && (
          <ModuleCardV2
            title="Watchdog"
            icon="👁️"
            data={{
              status: systemData.watchdog.status,
              message: `Tick misses: ${systemData.watchdog.tick_misses}`
            }}
            variant={systemData.watchdog.tick_misses === 0 ? 'success' : 'warning'}
          />
        )}
      </div>
    </div>
  );
};
```

---

## 🎯 MIGRATION PROGRESSIVE

### Étape 1 : Importer le mapper
```tsx
import { mapHeliosData, mapNexusData } from '../utils/dataMapper';
```

### Étape 2 : Mapper les données après fetch
```tsx
const fetchData = async () => {
  const rawData = await getModuleData();
  const mappedData = mapHeliosData(rawData); // ✅ Safe
  setMetrics(mappedData);
};
```

### Étape 3 : Utiliser les données mappées
```tsx
<p>BPM: {mappedData.bpm}</p> {/* ✅ Toujours string | number */}
```

---

## 🔥 AVANTAGES

### ✅ Sécurité
- Plus jamais d'erreur "Objects are not valid as React child"
- Fallbacks automatiques (N/A, 0, "Unknown")
- Type-safe avec TypeScript

### ✅ Flexibilité
- Backend peut renvoyer des objets complexes
- Frontend reçoit toujours des primitives
- Ajout de nouveaux champs sans casse

### ✅ Maintenance
- Logique de mapping centralisée dans `dataMapper.ts`
- Facile de déboguer (accès à `raw` dans le retour)
- Réutilisable pour tous les modules

---

## 📋 CHECKLIST MIGRATION

### Pages à Migrer
- [ ] Dashboard.tsx
- [x] Helios.tsx (déjà v15.7)
- [x] Nexus.tsx (déjà v15.7)
- [x] SelfHeal.tsx (déjà v15.7)
- [x] AdaptiveEngine.tsx (déjà v15.7)
- [x] Watchdog.tsx (déjà v15.7)
- [x] Harmonia.tsx (déjà v15.7)
- [x] Sentinel.tsx (déjà v15.7)
- [x] Memory.tsx (déjà v15.7)
- [x] Settings.tsx (déjà v15.7)
- [x] DevTools.tsx (déjà v15.7)

### Actions à Faire
1. **Ajouter l'import** du mapper approprié
2. **Appeler la fonction de mapping** après le fetch
3. **Utiliser les données mappées** dans JSX
4. **Tester** que plus aucune erreur React n'apparaît
5. **Valider** que les fallbacks fonctionnent (données manquantes)

---

## 🛠️ OUTILS DE DEBUG

### Accéder aux données brutes
```tsx
const mappedData = mapHeliosData(rawData);
console.log('Raw:', mappedData.raw); // Objet original complet
console.log('Mapped BPM:', mappedData.bpm); // Valeur sécurisée
```

### Tester les fallbacks
```tsx
const emptyData = mapHeliosData(null);
console.log(emptyData);
// { bpm: 0, vitality: 0, load: 0, status: "Unknown", raw: null }
```

---

## 🎨 PROCHAINES ÉTAPES

1. **Intégrer AppLayout** dans App.tsx
2. **Migrer Dashboard.tsx** avec `mapSystemData()`
3. **Tester toutes les pages** en mode dev
4. **Vérifier le build** (`npm run build`)
5. **Valider l'interface** (`npm run tauri dev`)

---

**Créé par TITANE∞ Auto-Fix System v15.7**  
📅 21 novembre 2025
