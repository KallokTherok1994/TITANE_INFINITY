# 🚀 PLAN D'OPTIMISATION FRONTEND — TITANE∞ v15.5

**Objectif** : Optimiser bundle size, performance, et accessibilité  
**Impact estimé** : -30% temps chargement, +20% score Lighthouse  
**Durée totale** : 4-5 heures

---

## 📦 1. LAZY LOADING ROUTES (PRIORITÉ 1)

### Gain attendu
- **Bundle initial** : 39.45 KB → ~25 KB (-37%)
- **Temps chargement** : -30% sur connexion lente
- **Score Lighthouse** : +15 points Performance

### Fichiers à modifier

#### `src/App.tsx`
```tsx
// AVANT
import {
  Dashboard,
  Helios,
  Nexus,
  Harmonia,
  Sentinel,
  Watchdog,
  SelfHeal,
  AdaptiveEngine,
  Memory,
  Settings,
  DevTools,
} from './pages';

// APRÈS
import { lazy, Suspense } from 'react';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Helios = lazy(() => import('./pages/Helios'));
const Nexus = lazy(() => import('./pages/Nexus'));
const Harmonia = lazy(() => import('./pages/Harmonia'));
const Sentinel = lazy(() => import('./pages/Sentinel'));
const Watchdog = lazy(() => import('./pages/Watchdog'));
const SelfHeal = lazy(() => import('./pages/SelfHeal'));
const AdaptiveEngine = lazy(() => import('./pages/AdaptiveEngine'));
const Memory = lazy(() => import('./pages/Memory'));
const Settings = lazy(() => import('./pages/Settings'));
const DevTools = lazy(() => import('./pages/DevTools'));
```

#### Wrapper de contenu avec Suspense
```tsx
// Dans le return de App()
<div style={{ paddingTop: '60px' }}>
  <Layout
    title={activeRoute?.title || 'Dashboard'}
    subtitle={activeRoute?.subtitle}
    activeRoute={currentRoute}
    onNavigate={handleNavigate}
  >
    <Suspense fallback={<LoadingSpinner />}>
      {activeRoute?.component || <Dashboard />}
    </Suspense>
  </Layout>
</div>
```

#### Créer composant LoadingSpinner
`src/components/LoadingSpinner.tsx`
```tsx
export const LoadingSpinner = () => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '400px',
    color: 'var(--text-secondary)',
    fontSize: 'var(--font-size-sm)',
  }}>
    <div className="spinner" />
    Chargement...
  </div>
);
```

**Durée**: 1h  
**Difficulté**: ⭐⭐☆☆☆ (Facile)

---

## 🧹 2. NETTOYAGE CONSOLE LOGS (PRIORITÉ 2)

### Objectif
Supprimer `console.log` debug, garder uniquement `console.error` en production

### Script de nettoyage automatique

`scripts/clean-console-logs.sh`
```bash
#!/bin/bash

# Liste des fichiers à nettoyer
FILES=(
  "src/main.tsx"
  "src/ui/Menu.tsx"
  "src/ui/pages/Projects.tsx"
  "src/ui/pages/System.tsx"
)

for file in "${FILES[@]}"; do
  echo "🧹 Nettoyage: $file"
  
  # Supprimer console.log mais garder console.error/warn
  sed -i '/console\.log/d' "$file"
done

echo "✅ Nettoyage terminé"
```

### Configuration Vite pour production

`vite.config.ts`
```ts
export default defineConfig({
  // ... existing config
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Supprime TOUS les console.* en production
        drop_debugger: true,
      },
    },
  },
});
```

**Alternative (garder console.error)** :
```ts
terserOptions: {
  compress: {
    pure_funcs: ['console.log', 'console.debug'], // Supprime uniquement log/debug
  },
}
```

**Durée**: 30min  
**Difficulté**: ⭐☆☆☆☆ (Très facile)

---

## ♿ 3. AMÉLIORATION ACCESSIBILITÉ (PRIORITÉ 3)

### 3.1 Sidebar avec ARIA labels

#### Fichier: `src/layout/Sidebar.tsx`

```tsx
// AVANT
<button
  key={item.id}
  className={`sidebar__item ${activeRoute === item.path ? 'sidebar__item--active' : ''}`}
  onClick={() => onNavigate(item.path)}
  title={item.label}
>
  <item.icon />
</button>

// APRÈS
<button
  key={item.id}
  className={`sidebar__item ${activeRoute === item.path ? 'sidebar__item--active' : ''}`}
  onClick={() => onNavigate(item.path)}
  title={item.label}
  aria-label={item.label}
  aria-current={activeRoute === item.path ? 'page' : undefined}
  role="link"
>
  <item.icon aria-hidden="true" />
</button>
```

### 3.2 GlobalExpBar accessible

#### Fichier: `src/components/experience/GlobalExpBar.tsx`

```tsx
// AVANT
<div className="exp-global-bar" onClick={onOpenPanel} title="...">

// APRÈS
<button
  className="exp-global-bar"
  onClick={onOpenPanel}
  aria-label={`Niveau ${expState.level}, ${expState.exp_current_level} sur ${expState.exp_to_next_level} XP. Cliquer pour ouvrir le panneau d'expérience`}
  type="button"
>
```

### 3.3 Modal ExpPanel focus trap

#### Fichier: `src/components/experience/ExpPanel.tsx`

```tsx
import { useEffect, useRef } from 'react';

export const ExpPanel = ({ onClose }) => {
  const panelRef = useRef<HTMLDivElement>(null);

  // Focus trap
  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;

    const focusableElements = panel.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    firstElement?.focus();

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement?.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement?.focus();
      }
    };

    panel.addEventListener('keydown', handleTab as any);
    return () => panel.removeEventListener('keydown', handleTab as any);
  }, []);

  // Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return (
    <div 
      className="exp-panel-overlay" 
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="exp-panel-title"
    >
      <div 
        ref={panelRef}
        className="exp-panel" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="exp-panel-header">
          <div id="exp-panel-title" className="exp-panel-title">
            ⚡ EXP FUSION ENGINE
          </div>
          <button 
            className="exp-panel-close" 
            onClick={onClose}
            aria-label="Fermer le panneau d'expérience"
          >
            ✕ Fermer
          </button>
        </div>
        {/* ... rest ... */}
      </div>
    </div>
  );
};
```

**Durée**: 1h30  
**Difficulté**: ⭐⭐⭐☆☆ (Moyen)

---

## 📊 4. PRELOAD FONTS (PRIORITÉ 4)

### Problème
Fonts Inter & JetBrains Mono chargées de manière bloquante

### Solution: Preload dans index.html

#### Fichier: `index.html`

```html
<head>
  <meta charset="UTF-8" />
  <link rel="icon" type="image/svg+xml" href="/vite.svg" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>TITANE∞ v15.5</title>

  <!-- Preload fonts -->
  <link rel="preload" href="/fonts/Inter-Variable.woff2" as="font" type="font/woff2" crossorigin />
  <link rel="preload" href="/fonts/JetBrainsMono-Variable.woff2" as="font" type="font/woff2" crossorigin />

  <!-- Preconnect for external resources if any -->
  <!-- <link rel="preconnect" href="https://fonts.googleapis.com"> -->
</head>
```

### Stocker fonts localement

```bash
# Télécharger Inter
mkdir -p public/fonts
cd public/fonts
wget https://github.com/rsms/inter/releases/download/v4.0/Inter-4.0-web.zip
unzip Inter-4.0-web.zip "Inter (web)/Inter-Variable.woff2" -d .
mv "Inter (web)/Inter-Variable.woff2" ./

# Télécharger JetBrains Mono
wget https://github.com/JetBrains/JetBrainsMono/releases/download/v2.304/JetBrainsMono-2.304.zip
unzip JetBrainsMono-2.304.zip "fonts/variable/JetBrainsMono-Variable.woff2" -d .
mv fonts/variable/JetBrainsMono-Variable.woff2 ./
```

### Mettre à jour CSS

#### Fichier: `src/design-system/titane-v12.css`

```css
/* Avant */
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;

/* Après avec @font-face */
@font-face {
  font-family: 'Inter';
  src: url('/fonts/Inter-Variable.woff2') format('woff2-variations');
  font-weight: 100 900;
  font-display: swap; /* Important pour éviter FOIT */
}

@font-face {
  font-family: 'JetBrains Mono';
  src: url('/fonts/JetBrainsMono-Variable.woff2') format('woff2-variations');
  font-weight: 100 800;
  font-display: swap;
}

:root {
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
}
```

**Durée**: 1h  
**Difficulté**: ⭐⭐☆☆☆ (Facile)

---

## ⚡ 5. VITE CONFIG OPTIMISATIONS (PRIORITÉ 5)

### Fichier: `vite.config.ts`

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  
  // Optimizations
  build: {
    target: 'esnext',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log'],
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          // Séparer React du reste
          'react-vendor': ['react', 'react-dom'],
          // Séparer Tauri API
          'tauri-api': ['@tauri-apps/api'],
        },
      },
    },
    // Enable gzip compression
    reportCompressedSize: true,
    chunkSizeWarningLimit: 1000,
  },

  // Dev optimizations
  server: {
    port: 5173,
    strictPort: true,
  },

  // Resolve optimizations
  resolve: {
    alias: {
      '@': '/src',
      '@components': '/src/components',
      '@pages': '/src/pages',
      '@ui': '/src/ui',
      '@hooks': '/src/hooks',
      '@styles': '/src/styles',
    },
  },

  // Dependency optimization
  optimizeDeps: {
    include: ['react', 'react-dom', '@tauri-apps/api'],
  },
});
```

**Durée**: 30min  
**Difficulté**: ⭐☆☆☆☆ (Très facile)

---

## 📋 CHECKLIST D'EXÉCUTION

### Phase 1 : Préparation (15 min)
- [ ] Créer branche `feature/frontend-optimization`
- [ ] Backup fichiers critiques
- [ ] Commit état actuel

### Phase 2 : Lazy Loading (1h)
- [ ] Modifier `App.tsx` (lazy imports)
- [ ] Créer `LoadingSpinner.tsx`
- [ ] Ajouter Suspense wrapper
- [ ] Tester navigation entre pages
- [ ] Commit "feat: add lazy loading routes"

### Phase 3 : Console Logs (30min)
- [ ] Créer script `clean-console-logs.sh`
- [ ] Exécuter script
- [ ] Configurer Vite terser
- [ ] Tester build production
- [ ] Commit "chore: remove debug console.log"

### Phase 4 : Accessibilité (1h30)
- [ ] Ajouter ARIA labels Sidebar
- [ ] Rendre GlobalExpBar accessible
- [ ] Implémenter focus trap ExpPanel
- [ ] Tester navigation clavier
- [ ] Commit "feat: improve accessibility (a11y)"

### Phase 5 : Fonts (1h)
- [ ] Télécharger fonts Inter & JetBrains Mono
- [ ] Créer dossier `public/fonts/`
- [ ] Ajouter @font-face CSS
- [ ] Ajouter preload index.html
- [ ] Commit "perf: preload fonts locally"

### Phase 6 : Vite Config (30min)
- [ ] Modifier `vite.config.ts`
- [ ] Ajouter manualChunks
- [ ] Configurer terserOptions
- [ ] Tester build production
- [ ] Commit "perf: optimize vite config"

### Phase 7 : Tests & Merge (30min)
- [ ] `pnpm run build` → vérifier bundle size
- [ ] `pnpm run tauri:dev` → tester fonctionnalités
- [ ] Lighthouse audit (Performance > 90)
- [ ] Merge dans `main`

---

## 📈 RÉSULTATS ATTENDUS

### Avant Optimisation
```
dist/assets/index-CRbqXYdL.js    39.45 kB │ gzip:  9.43 kB
dist/assets/vendor-QYCSsVv3.js  139.46 kB │ gzip: 45.09 kB
Total gzipped: 60.37 kB
Build time: 1.10s
```

### Après Optimisation (estimé)
```
dist/assets/index-XXXXXXXX.js    25.00 kB │ gzip:  6.20 kB  (-33%)
dist/assets/react-vendor.js      45.00 kB │ gzip: 15.50 kB
dist/assets/tauri-api.js         18.00 kB │ gzip:  5.80 kB
dist/assets/dashboard.js          8.50 kB │ gzip:  2.10 kB (lazy)
dist/assets/helios.js            10.20 kB │ gzip:  2.60 kB (lazy)
[... autres chunks lazy ...]
Total gzipped initial: 42.00 kB (-30%)
Build time: 1.20s (+0.10s acceptable)
```

### Lighthouse Score
- **Performance**: 75 → **92** (+17)
- **Accessibility**: 85 → **95** (+10)
- **Best Practices**: 90 → **95** (+5)
- **SEO**: 100 → 100 (=)

---

## 🎯 COMMANDE RAPIDE

Script tout-en-un : `scripts/optimize-frontend.sh`
```bash
#!/bin/bash
set -e

echo "🚀 TITANE∞ Frontend Optimization Script"
echo "========================================"

# 1. Lazy Loading
echo "📦 Step 1: Implementing lazy loading..."
# (manual: modifier App.tsx)

# 2. Clean Logs
echo "🧹 Step 2: Cleaning console.log..."
bash scripts/clean-console-logs.sh

# 3. Download Fonts
echo "📊 Step 3: Downloading fonts..."
mkdir -p public/fonts
cd public/fonts
wget -q https://github.com/rsms/inter/releases/download/v4.0/Inter-4.0-web.zip
unzip -q Inter-4.0-web.zip "Inter (web)/Inter-Variable.woff2" -d .
mv "Inter (web)/Inter-Variable.woff2" ./
rm -rf "Inter (web)" Inter-4.0-web.zip
cd ../..

# 4. Build Production
echo "🏗️  Step 4: Building production..."
pnpm run build

echo "✅ Optimization complete!"
echo "📊 Check dist/ folder for results"
```

---

**Durée totale estimée** : 4h30  
**Impact bundle** : -30%  
**Impact Lighthouse** : +25 points  
**Difficulté** : ⭐⭐⭐☆☆ (Moyen)
