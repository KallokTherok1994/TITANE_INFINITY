# AppShellWithDevTools — Guide d'Intégration

## 🚀 Installation Rapide

### Remplacer AppShell par AppShellWithDevTools

**Avant:**
```tsx
import { AppShell } from '@/components/layout';

function App() {
  return (
    <AppShell
      header={<Header />}
      sidebar={<Sidebar />}
    >
      <MainContent />
    </AppShell>
  );
}
```

**Après:**
```tsx
import { AppShellWithDevTools } from '@/components/layout';

function App() {
  return (
    <AppShellWithDevTools
      header={<Header />}
      sidebar={<Sidebar />}
      devToolsEnabled={import.meta.env.DEV}  // Actif en dev uniquement
      devToolsDefaultOpen={false}            // Fermé par défaut
      devToolsDefaultSection="dashboard"     // Section par défaut
    >
      <MainContent />
    </AppShellWithDevTools>
  );
}
```

## 📱 Layouts Responsive

### Desktop (≥1024px)
```
┌─────────────────────────────────────────────────────────────┐
│  [Header]                                       [🛠️ Toggle]  │
├────────┬──────────────────────────────────┬─────────────────┤
│        │                                  │   DevTools      │
│ Side   │        Main Content              │   Panel         │
│ bar    │                                  │   (480px)       │
│        │                                  │                 │
│        │                                  │   7 Sections    │
│        │                                  │   Dashboard     │
│        │                                  │   Metrics       │
└────────┴──────────────────────────────────┴─────────────────┘
```

### Tablet (768px-1023px)
```
┌─────────────────────────────────────────────────┐
│  [Header]                         [🛠️ Toggle]   │
├────────┬────────────────────────────────────────┤
│        │                                        │
│ Side   │        Main Content                    │
│ bar    │                                        │
│        │                                        │
└────────┴────────────────────────────────────────┘
                                    ┌──────────────┐
                                    │  DevTools    │
                                    │  Drawer      │
                                    │  (400px)     │
                                    │              │
                                    │  + Overlay   │
                                    └──────────────┘
```

### Mobile (<768px)
```
┌───────────────────────────────┐
│  [Header]       [🛠️ Toggle]   │
├───────────────────────────────┤
│                               │
│        Main Content           │
│                               │
│                               │
└───────────────────────────────┘

DevTools Modal (fullscreen when open)
┌───────────────────────────────┐
│  [✕]                          │
│                               │
│      DevTools Fullscreen      │
│                               │
│      7 Sections               │
│                               │
└───────────────────────────────┘
```

## 🎛️ Props API

```typescript
interface AppShellWithDevToolsProps extends AppShellProps {
  /**
   * Active les DevTools
   * @default import.meta.env.DEV
   */
  devToolsEnabled?: boolean;

  /**
   * DevTools ouverts par défaut
   * @default false
   */
  devToolsDefaultOpen?: boolean;

  /**
   * Section DevTools par défaut
   * @default 'dashboard'
   */
  devToolsDefaultSection?: 
    | 'dashboard' 
    | 'metrics' 
    | 'logs' 
    | 'engines' 
    | 'memory' 
    | 'pipeline' 
    | 'errors';
}
```

## 🎨 Personnalisation

### Changer la Section par Défaut

```tsx
<AppShellWithDevTools
  devToolsDefaultSection="logs"  // Ouvrir sur Logs
>
  {children}
</AppShellWithDevTools>
```

### Toujours Ouvert en Dev

```tsx
<AppShellWithDevTools
  devToolsEnabled={import.meta.env.DEV}
  devToolsDefaultOpen={import.meta.env.DEV}  // Auto-open en dev
>
  {children}
</AppShellWithDevTools>
```

### Forcer Activation en Production

```tsx
<AppShellWithDevTools
  devToolsEnabled={true}  // ⚠️ Actif même en prod
  devToolsDefaultSection="errors"
>
  {children}
</AppShellWithDevTools>
```

## 🔧 Styling & Thème

Les DevTools utilisent les CSS variables du design system:
- `--bg-base`: Background principal
- `--bg-elevated`: Background élevé
- `--text-primary`: Texte primaire
- `--text-muted`: Texte atténué
- `--border`: Bordures

### Ajuster les Largeurs

Modifier les constantes dans `AppShellWithDevTools.tsx`:
```tsx
const DEVTOOLS_WIDTH_DESKTOP = 480;  // Desktop: 480px
const DEVTOOLS_WIDTH_TABLET = 400;   // Tablet: 400px
```

## 📊 Intégration Mock Events

### Activer Simulation Auto en Dev

```tsx
import { AppShellWithDevTools } from '@/components/layout';
import { useMockActivity } from '@/apps/devtools';

function App() {
  // Simulation auto en dev (événements toutes les 2s)
  useMockActivity(import.meta.env.DEV, 2000);
  
  return (
    <AppShellWithDevTools
      devToolsEnabled={import.meta.env.DEV}
      devToolsDefaultOpen={true}
    >
      <MainContent />
    </AppShellWithDevTools>
  );
}
```

## 🚦 État Toggle Button

| État | Apparence | Action |
|------|-----------|--------|
| **Fermé** | 🛠️ Gris | Ouvrir DevTools |
| **Ouvert** | ✕ Bleu | Fermer DevTools |

Position: **Fixed top-right (z-index: 9999)**

## 🎯 Use Cases

### Dev Local (Debugging)
```tsx
<AppShellWithDevTools
  devToolsEnabled={true}
  devToolsDefaultOpen={true}
  devToolsDefaultSection="logs"  // Focus logs
/>
```

### Staging (Tests)
```tsx
<AppShellWithDevTools
  devToolsEnabled={true}
  devToolsDefaultOpen={false}
  devToolsDefaultSection="metrics"  // Focus perf
/>
```

### Production (Disabled)
```tsx
<AppShellWithDevTools
  devToolsEnabled={false}  // Complètement désactivé
/>
```

## ⚡ Performance

- **Zero impact** quand `devToolsEnabled={false}`
- **Lazy loading**: DevTools chargés seulement si ouverts
- **Animations optimisées**: Framer Motion avec GPU
- **Auto-cleanup**: Listeners Tauri cleanup au unmount

## 🔍 Troubleshooting

### Toggle button invisible
- Vérifier `z-index` conflicts (doit être 9999)
- Vérifier `devToolsEnabled={true}`

### Panel ne s'affiche pas
- Console browser pour erreurs React
- Vérifier imports DevTools: `@/apps/devtools`

### Responsive ne fonctionne pas
- Vérifier Tailwind breakpoints: `lg:`, `md:`
- Tester avec DevTools browser (Ctrl+Shift+M)

---

**TITANE∞ v20.0** — AppShell Integration Complete  
Session: Super Prompt #3 — Phase 5 🎯
