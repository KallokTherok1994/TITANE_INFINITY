# 🚀 TITANE∞ v24 — GUIDE COMPLET DE TEST PERFORMANCE

**Date**: 22 novembre 2025
**Version**: v24.2.0
**Status**: ✅ **READY FOR TESTING**

---

## 📋 TABLE DES MATIÈRES

1. [Quick Start](#quick-start)
2. [Page Performance Test](#page-performance-test)
3. [Manuel Chrome DevTools](#manuel-chrome-devtools)
4. [Script Automatisé](#script-automatisé)
5. [Interprétation des Résultats](#interprétation-des-résultats)
6. [Troubleshooting](#troubleshooting)

---

## ⚡ QUICK START

### Lancer le serveur
```bash
cd /home/titane/Documents/TITANE_INFINITY
pnpm vite
```

### Accéder aux pages de test
- **Performance Test**: http://localhost:5173/performance
- **DevTools (Living Engines)**: http://localhost:5173/devtools
- **Dashboard**: http://localhost:5173/

---

## 🎯 PAGE PERFORMANCE TEST

### URL
```
http://localhost:5173/performance
```

### Fonctionnalités

#### 1. **Métriques en Temps Réel**
La page affiche automatiquement :
- **FPS Current** : FPS instantané
- **Average FPS** : Moyenne sur 10 secondes
- **Frame Time** : Temps de rendu par frame (ms)
- **Update Time** : Temps d'update Living Engines (ms)
- **Memory** : Utilisation mémoire JS Heap (MB)
- **Render Count** : Nombre total de frames

#### 2. **Living Engines State**
Affichage en temps réel des multipliers :
- Glow (0-100%)
- Motion (0-100%)
- Depth (0-100%)
- Sound (0-100%)
- Cognitive Load (0-100%)
- Rhythm Score (0.0-1.0)

#### 3. **Performance Summary**
Checklist automatique :
- ✅ Target FPS (≥55)
- ✅ Frame Time (<16.67ms)
- ✅ Update Time (<50ms)
- ✅ Memory Stable

### Codes Couleur
- 🟢 **Green (Good)** : FPS ≥55, Frame Time <16.67ms
- 🟡 **Yellow (Warning)** : FPS 45-54, Frame Time 16.67-22ms
- 🔴 **Red (Critical)** : FPS <45, Frame Time >22ms

---

## 🔧 MANUEL CHROME DEVTOOLS

### Étape 1: Ouvrir DevTools
1. Ouvrir http://localhost:5173/performance
2. Appuyer sur **F12** (ou Cmd+Option+I sur Mac)
3. Aller dans l'onglet **Performance**

### Étape 2: Enregistrer une Session
1. Cliquer sur **Record** (icône rond rouge) ou **Ctrl+E**
2. Laisser tourner **10 secondes**
3. Cliquer sur **Stop** ou **Ctrl+E** à nouveau

### Étape 3: Analyser les Résultats

#### FPS (Frames Per Second)
- **Localisation** : Graphique en haut avec barres vertes
- **Target** : ≥55 FPS constant
- **Bon** : Toutes les barres atteignent le haut (60 FPS)
- **Mauvais** : Barres courtes ou manquantes (frame drops)

#### Frame Time
- **Localisation** : Timeline principale
- **Target** : <16.67ms par frame
- **Bon** : Timeline régulière sans pics
- **Mauvais** : Pics rouges (long tasks)

#### Memory
- **Localisation** : En bas, onglet "Memory"
- **Target** : Stable (pas de fuite)
- **Bon** : Courbe plate ou légère augmentation constante
- **Mauvais** : Augmentation continue en escalier

#### Long Tasks
- **Localisation** : Timeline principale (barres rouges)
- **Target** : 0 ou minimal
- **Bon** : Pas de barres rouges
- **Mauvais** : Plusieurs barres rouges >50ms

### Étape 4: Export des Résultats
1. Cliquer sur **⬇️ Download** en haut à droite
2. Sauvegarder le profil : `titane_performance_YYYYMMDD.json`

---

## 🤖 SCRIPT AUTOMATISÉ

### Lancement
```bash
chmod +x performance_benchmark.sh
./performance_benchmark.sh
```

### Fonctionnement
1. **Vérification** : Contrôle que Vite tourne
2. **Génération rapport** : Crée un fichier markdown
3. **Attente** : 30 secondes pour test manuel
4. **Métriques système** : Collecte CPU, Memory, Vite stats
5. **Rapport final** : `PERFORMANCE_REPORT_v24_YYYYMMDD_HHMMSS.md`

### Compléter le Rapport
Le script génère un template avec sections `[TODO]` :
1. Ouvrir le rapport généré
2. Remplir les métriques browser (FPS, Frame Time, etc.)
3. Compléter la checklist
4. Ajouter notes/observations

---

## 📊 INTERPRÉTATION DES RÉSULTATS

### Scénario 1: Performance Excellente ✅
```
Current FPS: 58-60
Average FPS: 57-60
Frame Time: 15-16ms
Update Time: 5-15ms
Memory: Stable (~50MB)
Long Tasks: 0
```
**Conclusion** : Optimisations réussies, pas d'action requise

### Scénario 2: Performance Bonne ⚠️
```
Current FPS: 50-57
Average FPS: 52-56
Frame Time: 16-18ms
Update Time: 15-30ms
Memory: Stable (~60MB)
Long Tasks: 1-2 (<100ms)
```
**Conclusion** : Performance acceptable, optimisations mineures possibles

### Scénario 3: Performance À Améliorer 🔴
```
Current FPS: 40-50
Average FPS: 42-48
Frame Time: 18-25ms
Update Time: 30-60ms
Memory: Croissante
Long Tasks: 3+ (>100ms)
```
**Conclusion** : Optimisations nécessaires

#### Actions Recommandées
1. Augmenter `updateInterval` : 100ms → 200ms
2. Désactiver temporairement animations
3. Réduire nombre de composants actifs
4. Vérifier memory leaks (useEffect cleanup)

### Scénario 4: Performance Critique ❌
```
Current FPS: <40
Average FPS: <40
Frame Time: >25ms
Update Time: >60ms
Memory: Fuite visible
Long Tasks: Nombreux (>200ms)
```
**Conclusion** : Problèmes majeurs

#### Actions Urgentes
1. **Désactiver Living Engines** : Commenter `useLivingEngines`
2. **Profiler CPU** : Chrome DevTools → Performance → Bottom-Up
3. **Identifier bottleneck** : Main thread, Rendering, Scripting
4. **Vérifier loops infinis** : useEffect sans dependencies

---

## 🐛 TROUBLESHOOTING

### Problème: FPS < 55

#### Cause Possible 1: Update Interval trop court
**Solution**:
```typescript
// Dans DevTools.tsx ou PerformanceTest.tsx
const livingEngines = useLivingEngines(200); // 100ms → 200ms
```

#### Cause Possible 2: Trop de re-renders
**Solution**:
```typescript
// Utiliser useMemo pour computations lourdes
const computedValue = useMemo(() => {
  // calcul lourd
}, [dependencies]);
```

#### Cause Possible 3: Browser DevTools ouvert
**Solution**: Fermer DevTools pendant test (F12)

### Problème: Memory Leak

#### Détection
```javascript
// Dans console browser
performance.memory.usedJSHeapSize / 1024 / 1024 // MB
```

#### Solution
```typescript
useEffect(() => {
  const interval = setInterval(() => {
    // ...
  }, 100);

  // ⚠️ CRITIQUE : Cleanup
  return () => clearInterval(interval);
}, []);
```

### Problème: Long Tasks

#### Identifier
Chrome DevTools → Performance → Bottom-Up → Trier par "Self Time"

#### Solutions
1. **Defer heavy computations**:
```typescript
setTimeout(() => {
  // Heavy computation
}, 0);
```

2. **Use Web Workers** (pour calculs très lourds)

3. **Debounce/Throttle** updates:
```typescript
import { debounce } from 'lodash';
const debouncedUpdate = debounce(updateFunction, 200);
```

### Problème: Vite HMR Slow

#### Solution
Vérifier `vite.config.ts` :
```typescript
server: {
  watch: {
    ignored: ['**/node_modules/**', '**/dist/**'],
    usePolling: false, // IMPORTANT
  },
}
```

---

## 📈 OPTIMISATIONS APPLIQUÉES

### Niveau 1: Configuration (Fait ✅)
- ✅ VS Code settings (TypeScript, Rust, Watchers)
- ✅ Vite config (watchers, HMR, polling)
- ✅ ESLint performance mode
- ✅ TypeScript exclusions

### Niveau 2: Code (Si Nécessaire)
- [ ] Augmenter `updateInterval` Living Engines
- [ ] Utiliser `useMemo` pour calculs lourds
- [ ] Utiliser `useCallback` pour fonctions
- [ ] Lazy loading composants

### Niveau 3: Architecture (Si Critique)
- [ ] Web Workers pour calculs
- [ ] Virtual scrolling pour listes
- [ ] Code splitting agressif
- [ ] Service Worker caching

---

## ✅ CHECKLIST VALIDATION

### Avant Test
- [ ] Vite server running (port 5173)
- [ ] Browser ouvert sur /performance
- [ ] DevTools fermé (pour test précis)
- [ ] Pas d'autres onglets lourds

### Pendant Test
- [ ] Observer FPS pendant 30s
- [ ] Noter FPS min/max/avg
- [ ] Vérifier frame time
- [ ] Observer memory growth

### Après Test
- [ ] Remplir rapport performance
- [ ] Capturer screenshot si besoin
- [ ] Exporter profil Chrome (.json)
- [ ] Comparer avec targets

### Targets de Performance
- [ ] **FPS**: ≥55 (target 60)
- [ ] **Frame Time**: <16.67ms
- [ ] **Update Time**: <50ms
- [ ] **Memory**: Stable (pas de fuite)
- [ ] **Long Tasks**: 0 ou <50ms
- [ ] **CPU** (VS Code): <50%

---

## 📚 RESSOURCES

### Documentation
- Vite Performance: https://vitejs.dev/guide/performance.html
- React Performance: https://react.dev/learn/render-and-commit
- Chrome DevTools: https://developer.chrome.com/docs/devtools/performance/

### Outils
- **Lighthouse**: Audit automatisé (Cmd+Shift+P → "Lighthouse")
- **React DevTools Profiler**: Profiling React components
- **Chrome Task Manager**: Shift+Esc (voir memory par onglet)

### Fichiers Clés
- `src/pages/PerformanceTest.tsx` — Page de test
- `src/hooks/useLivingEngines.ts` — Hook principal
- `vite.config.ts` — Configuration Vite
- `.vscode/settings.json` — VS Code optimizations

---

## 🎯 PROCHAINES ÉTAPES

### Étape 1: Test Initial ✅
```bash
# Lancer Vite
pnpm vite

# Ouvrir browser
open http://localhost:5173/performance

# Observer 30s
# Noter FPS, Frame Time, Memory
```

### Étape 2: Profiling Chrome
```
F12 → Performance → Record (10s) → Analyze
```

### Étape 3: Générer Rapport
```bash
./performance_benchmark.sh
# Compléter PERFORMANCE_REPORT_v24_*.md
```

### Étape 4: Optimiser si Nécessaire
Si FPS < 55 ou Frame Time > 16.67ms :
1. Augmenter updateInterval (100→200ms)
2. Profiler avec Chrome DevTools
3. Identifier bottleneck
4. Appliquer optimisations niveau 2/3

### Étape 5: Demo Video
```
Enregistrer screencast 60s :
- Launch Vite
- Navigate to /performance
- Show metrics (FPS, Frame Time)
- Navigate to /devtools
- Show Living Engines Card
- Outro
```

---

## 📞 SUPPORT

### Issues GitHub
Si performance < targets après optimisations :
1. Créer issue avec rapport complet
2. Attacher profil Chrome (.json)
3. Indiquer specs machine (CPU, RAM, GPU)

### Quick Fixes
```bash
# Reset cache Vite
rm -rf node_modules/.vite
pnpm vite --force

# Reset dependencies
rm -rf node_modules
pnpm install

# Check process CPU
top -p $(pgrep -f vite)
```

---

**Version**: v24.2.0
**Date**: 22 novembre 2025
**Status**: ✅ READY FOR PERFORMANCE TESTING

🚀 **TITANE∞ Performance Testing Guide Complete!**
