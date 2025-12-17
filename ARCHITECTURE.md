# 🏗️ ARCHITECTURE FRONTEND TITANE∞

**Version:** 25.2.2  
**Date:** 16 décembre 2025  
**Auteurs:** Équipe TITANE∞

---

## 🎯 Évolutions Majeures v25

### ✨ Fusion EVO (v25.0)

**5 modules → 1 module unifié**

- Dashboard (/) → `/evo` Section 1
- Identity Center (/identity-center) → `/evo` Section 2
- Memory Evolution (/memory-evolution) → `/evo` Section 3-4
- Evolution Center (/evolution-center) → `/evo` Section 5-6
- Progression (/progression) → `/evo` Section 5

### � Fusion TIME (v25.1)

**3 modules → 1 module unifié**

- Temporal Flow Center (/temporal-center) → `/time` Section 6
- Agenda (/agenda) → `/time` Section 2
- Time Navigator (/time-navigator) → `/time` Section 3
- 6 sections internes: NOW, Agenda, Timeline, Snapshots, Intelligence, Flow

### �📊 Fusion Stats (v25.2)

**4 modules → 1 page unifiée**

- Helios (/helios) → `/stats` Section 2
- Nexus (/nexus) → `/stats` Section 1
- Harmonia (/harmonia) → `/stats` Section 3
- État Cognitif (nouveau) → `/stats` Section 4

### 👑 Fusion ADMIN (v25.2.2)

**7 modules → 1 module ADMIN unifié**

- Centre Système (/system-center) → `/admin` Onglet 1
- Configuration HUB (/configuration) → `/admin` Onglet 2
- Audio & Voix (/audio-center) → `/admin` Onglet 3
- Design / Gesign (/design-center) → `/admin` Onglet 4
- Gouvernance (/governance-center) → `/admin` Onglet 5
- QA & Monitoring (/qa-monitoring) → `/admin` Onglet 6
- Mode Développeur (/developer-mode) → `/admin` Onglet 7

### 🧹 Menu Navigation (v25.2.2)

**18 sections → 10 sections** (-44%)

- localStorage nettoyage forcé
- MenuEditor sauvegarde désactivée
- Source unique : MENU_SECTIONS
- Synchronisation Menu.tsx ↔ Sidebar App.tsx

---

## 🗺️ Routes Principales v25.2.2

### Routes Actives

```
/chat                Chat IA (Multi-Provider)
/evo                 EVO — Centre d'Évolution Totale (fusion 5 modules)
/time                TIME — Centre Temporel (fusion 3 modules) ⏱️ v25.1
/camera              Vision & Reconnaissance
/one-core            ONE CORE — Commande Unifiée
/stats               Statistiques Moteurs (fusion 4 modules)
/admin               ADMIN — Centre Administration (fusion 7 modules) 👑 v25.2.2
/orchestration-intelligence  Intelligence IA Multi-Agents
```

### Routes Obsolètes (Redirigées v25.2.2)

```
❌ /                     → /evo (redirect)
❌ /dashboard            → /evo (redirect)
❌ /helios               → /stats (redirect)
❌ /nexus                → /stats (redirect)
❌ /harmonia             → /stats (redirect)
❌ /identity-center      → /evo (redirect)
❌ /memory-evolution     → /evo (redirect)
❌ /evolution-center     → /evo (redirect)
❌ /cognitive-evolution  → /evo (redirect)
❌ /progression          → /evo (redirect)
❌ /xp                   → /evo (redirect)

🆕 Module TIME - Redirections v25.1:
❌ /temporal-center      → /time (redirect)
❌ /agenda               → /time (redirect)
❌ /time-navigator       → /time (redirect)

🆕 Module ADMIN - Redirections v25.2.2:
❌ /system-center        → /admin (redirect)
❌ /configuration        → /admin (redirect)
❌ /audio-center         → /admin (redirect)
❌ /design-center        → /admin (redirect)
❌ /governance-center    → /admin (redirect)
❌ /diagnostics          → /admin (redirect)
❌ /devtools             → /admin (redirect)
❌ /cluster              → /admin (redirect)
❌ /introspection        → /admin (redirect)
❌ /hypervision          → /admin (redirect)
❌ /design-system        → /admin (redirect)
❌ /settings             → /admin (redirect)
❌ /governance           → /admin (redirect)
❌ /secure               → /admin (redirect)
❌ /audio                → /admin (redirect)
❌ /voice                → /admin (redirect)
❌ /tts                  → /admin (redirect)
```

---

## �📐 Structure Canonique

```
src/
├── app/              # Configuration globale, providers, router
│   ├── providers/    # React Context, stores providers
│   ├── router/       # Configuration routes
│   └── App.tsx       # Point d'entrée applicatif
│
├── pages/            # Composants pages (routes)
│   ├── Dashboard/
│   ├── Chat/
│   └── ...
│
├── features/         # Modules métier (Business Logic)
│   ├── chat/         # Feature Chat IA
│   ├── memory/       # Feature Memory Core
│   ├── dashboard/    # Feature Dashboard
│   ├── timeline-xp/  # Feature Timeline XP & Talents
│   └── cognitive/    # Features modules cognitifs
│
├── components/       # Composants réutilisables (composition)
│   ├── layouts/
│   ├── navigation/
│   └── shared/
│
├── ui/               # Primitives UI (Design System)
│   ├── Button/
│   ├── Card/
│   ├── Input/
│   ├── Modal/
│   └── index.ts      # Exports centralisés
│
├── hooks/            # Custom hooks réutilisables
│   ├── useTheme.ts
│   ├── useTauri.ts
│   └── ...
│
├── services/         # Logique métier externe
│   ├── tauri/        # Encapsulation Tauri commands
│   ├── api/          # Appels API externes (si besoin)
│   └── storage/      # LocalStorage/IndexedDB
│
├── stores/           # State management (Zustand/Recoil)
│   ├── theme.store.ts
│   ├── user.store.ts
│   └── ...
│
├── themes/           # System de thèmes
│   ├── tokens/       # Design tokens
│   ├── palettes/     # Palettes de couleurs
│   └── index.ts
│
├── styles/           # Styles globaux
│   ├── global.css
│   ├── reset.css
│   └── animations.css
│
├── utils/            # Fonctions utilitaires
│   ├── format.ts
│   ├── validation.ts
│   └── ...
│
├── types/            # Types TypeScript globaux
│   ├── tauri.types.ts
│   └── global.d.ts
│
└── assets/           # Assets statiques
    ├── icons/
    ├── images/
    └── fonts/
```

---

## 🎯 Principes d'Architecture

### 1. **Feature Modules Pattern**

Chaque feature est un module autonome :

```
features/chat/
├── components/      # Composants spécifiques à Chat
├── hooks/          # Hooks spécifiques à Chat
├── services/       # Logique métier Chat
├── types/          # Types spécifiques à Chat
└── index.ts        # Export public de la feature
```

### 2. **Atomic Design (Simplifié)**

- **Atoms** : Primitives UI (`ui/`)
- **Molecules** : Compositions simples (`components/`)
- **Organisms** : Sections complexes (`features/`)
- **Templates** : Layouts (`components/layouts/`)
- **Pages** : Vues complètes (`pages/`)

### 3. **Separation of Concerns**

- UI ne contient AUCUNE logique métier
- Services ne contiennent AUCUN JSX
- Features encapsulent leur logique interne
- Types séparés de l'implémentation

### 4. **Dependency Flow**

```
pages → features → components → ui
   ↓        ↓          ↓        ↓
stores ← services ← hooks ← utils
```

**Règle d'or :** Les dépendances vont du haut vers le bas, jamais l'inverse.

---

## 🔒 Règles Strictes

### TypeScript

- ✅ Mode `strict` activé
- ❌ JAMAIS de `any`
- ❌ JAMAIS de `@ts-ignore` (utiliser `@ts-expect-error` avec justification)
- ✅ Types explicites sur exports publics
- ✅ Interfaces pour objets, Types pour unions

### Imports

- ✅ Imports absolus via alias (`@ui`, `@services`, `@features`)
- ❌ Imports relatifs > 2 niveaux
- ✅ Index.ts pour exports groupés
- ✅ Ordre : React → Libraries → Features → Components → UI → Utils

### Composants

- ✅ Décomposition si > 250 lignes
- ✅ Props typées en interface
- ✅ Exports nommés préférés
- ✅ Un composant = un fichier
- ✅ Fichier.tsx pour composants, .ts pour logique

### État

- ✅ Zustand pour état global
- ✅ useState pour état local simple
- ✅ useReducer pour logique complexe locale
- ❌ Props drilling > 2 niveaux
- ✅ Context pour état thématique seulement

### Performance

- ✅ React.memo pour composants purs
- ✅ useCallback pour fonctions passées en props
- ✅ useMemo pour calculs coûteux
- ✅ Lazy loading pour routes
- ✅ Code splitting intelligent

---

## 🎨 Design System

### Tokens

Tous les tokens sont centralisés dans `themes/tokens/`:

- `colors.ts` : Palettes complètes
- `spacing.ts` : 8px base (4, 8, 16, 24, 32, 48, 64...)
- `typography.ts` : Échelle typographique
- `radius.ts` : Border radius (2, 4, 8, 12, 16, 24)
- `shadows.ts` : Ombres et élévations
- `transitions.ts` : Durées et easings

### Thèmes

4 thèmes principaux :

- **Rubis** : Rouge profond, énergie
- **Saphir** : Bleu nuit, précision
- **Émeraude** : Vert clair, croissance
- **Diamant** : Blanc/argent, pureté

Chaque thème définit :

- Palette primaire/secondaire/accent
- Surfaces (glass, translucides, profondes)
- États (hover, active, disabled)

---

## 🚀 Performance

### Code Splitting

```tsx
// Lazy loading des pages
const Dashboard = lazy(() => import('@pages/Dashboard'));
const Chat = lazy(() => import('@pages/Chat'));
```

### Bundle Optimization

- Vite chunks automatiques
- Dynamic imports pour features lourdes
- Tree-shaking activé
- Assets optimisés (SVG inline, images lazy)

### React Optimization

```tsx
// Mémoïsation intelligente
const MemoizedComponent = React.memo(Component, (prev, next) => {
  return prev.id === next.id;
});

// Callbacks stables
const handleClick = useCallback(() => {
  action(id);
}, [id]);

// Calculs coûteux
const computed = useMemo(() => {
  return heavyComputation(data);
}, [data]);
```

---

## 🔌 Intégration Tauri

### Service Layer

Toute communication Tauri passe par `services/tauri/`:

```ts
// services/tauri/commands.ts
export const tauriCommands = {
  chat: {
    sendMessage: (msg: string) => invoke<ChatResponse>('chat_send_message', { msg }),
    getHistory: () => invoke<Message[]>('chat_get_history'),
  },
  memory: {
    store: (data: Memory) => invoke('memory_store', { data }),
    search: (query: string) => invoke<Memory[]>('memory_search', { query }),
  },
};
```

### Validation

Utilisation de Zod pour valider les réponses :

```ts
import { z } from 'zod';

const ChatResponseSchema = z.object({
  content: z.string(),
  timestamp: z.number(),
  provider: z.enum(['gemini', 'ollama', 'local']),
});

export type ChatResponse = z.infer<typeof ChatResponseSchema>;
```

---

## 📚 Documentation

### Fichiers requis

- `ARCHITECTURE.md` : Ce document
- `CONVENTIONS.md` : Conventions de code
- `CHANGELOG.md` : Historique des versions
- `CONTRIBUTING.md` : Guide de contribution

### Storybook

Tous les composants UI doivent avoir :

- Story de base
- Variants (sizes, states)
- Props table
- Documentation inline

---

## 🧪 Tests

### Stratégie

- **Unit tests** : Hooks, utils, services
- **Component tests** : UI primitives
- **Integration tests** : Features
- **E2E tests** : Flows critiques

### Coverage attendu

- UI primitives : 90%+
- Services : 80%+
- Features : 70%+

---

## 🔄 Workflow

### Développement

1. Créer branch feature : `feat/nom-feature`
2. Développer avec tests
3. Valider avec `pnpm lint` + `pnpm type-check`
4. PR avec description claire
5. Review + merge

### Commits

Format conventionnel :

```
feat(chat): add streaming support
fix(ui): correct button hover state
refactor(services): simplify tauri commands
docs(readme): update installation steps
```

---

## 🎯 Roadmap Architecture

### v17.1 (Phase 1 - Actuelle)

- ✅ Structure modulaire
- ✅ TypeScript strict
- ✅ Service Tauri encapsulé

### v17.2 (Phase 2)

- [ ] Design System complet
- [ ] Theme Engine
- [ ] Storybook

### v17.3 (Phase 3)

- [ ] Modules cognitifs
- [ ] Chat IA avancé
- [ ] Timeline XP

---

**Maintenu par :** Équipe TITANE∞  
**Dernière mise à jour :** 22 novembre 2025
