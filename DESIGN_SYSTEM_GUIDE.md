# 🎨 TITANE∞ Design System Guide

**Version:** 17.1.0  
**Date:** Novembre 2025  
**Statut:** Production Ready

---

## Table des Matières

1. [Introduction](#introduction)
2. [Principes Directeurs](#principes-directeurs)
3. [Architecture](#architecture)
4. [Tokens de Design](#tokens-de-design)
5. [Thèmes](#thèmes)
6. [Primitives UI](#primitives-ui)
7. [Motion System](#motion-system)
8. [Accessibilité](#accessibilité)
9. [Usage & Best Practices](#usage--best-practices)

---

## Introduction

Le Design System TITANE∞ est un système visuel professionnel qui incarne l'identité d'un système cognitif vivant. Il combine:

- **Clarté** - Lisibilité, silence visuel, hiérarchie maîtrisée
- **Fluidité** - Transitions organiques, micro-mouvements cohérents
- **Élégance** - Minimalisme premium, surfaces raffinées, profondeur subtile

Ce n'est pas juste un système UI — **c'est la signature visuelle de TITANE∞**.

---

## Principes Directeurs

### 1. Clarté

> "Less is more, but better is best"

- Hiérarchie visuelle évidente
- Contraste WCAG AA minimum
- Espaces respirants (8px grid)
- Typographie lisible (Inter)

### 2. Fluidité

> "Move like you mean it"

- Durées entre 120-250ms
- Easings organiques (`cubic-bezier(0.22, 1, 0.36, 1)`)
- Micro-shifts de 2-4px maximum
- Transitions basées sur l'intention

### 3. Élégance

> "Refinement in every pixel"

- Surfaces glass avec blur subtil
- Radius harmonieux (6-22px)
- Ombres naturelles
- Palettes premium (4 thèmes)

---

## Architecture

```
src/
  themes/
    tokens/          → Design tokens
      colors.ts      → Palettes (neutral + 4 thèmes)
      typography.ts  → Fonts, tailles, poids
      spacing.ts     → Système 8px
      radius.ts      → Border radius
      shadows.ts     → Élévations
      transitions.ts → Durées et easings
      index.ts       → Export unifié
    motion.ts        → Motion System complet
    ThemeProvider.tsx → Provider React
    useTheme.ts      → Hook de thème
    
  ui/                → Primitives atomiques
    components/      → Composants de base
      Button.tsx
      Card.tsx
      Input.tsx
      Modal.tsx
      Badge.tsx
      Spinner.tsx
      
  components/        → Composants composés
    layout/          → Layouts
      AppShell.tsx
      Sidebar.tsx
      Header.tsx
      Grid.tsx
      
  features/          → Modules fonctionnels
    cognitive/       → Visualisations
    progression/     → Systèmes XP
    chat/            → Interface conversationnelle
```

---

## Tokens de Design

### Palette Neutre

12 niveaux optimisés pour dark/light mode et effets glass:

```typescript
neutral: {
  0: '#FFFFFF',    // Pure white
  5: '#F9F9F9',    // Off-white
  10: '#F0F0F0',   // Light gray
  20: '#DCDCDC',   // Light-medium
  30: '#C2C2C2',   // Medium-light
  40: '#A5A5A5',   // Medium
  50: '#7F7F7F',   // True middle
  60: '#5A5A5A',   // Medium-dark
  70: '#3A3A3A',   // Dark-medium
  80: '#232323',   // Dark
  90: '#141414',   // Near black
  100: '#000000',  // Pure black
}
```

### Typographie

**Police principale:** Inter (clarté, neutralité, efficacité)

```typescript
fontSizes: {
  tiny: '0.75rem',   // 12px
  small: '0.875rem', // 14px
  body: '1rem',      // 16px
  h5: '1.1rem',      // 17.6px / 500
  h4: '1.3rem',      // 20.8px / 500
  h3: '1.5rem',      // 24px / 600
  h2: '1.85rem',     // 29.6px / 600
  h1: '2.25rem',     // 36px / 700
}
```

### Spacing System

Basé sur 8px grid, enrichi pour sections majeures:

```typescript
spacing: {
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '24px',
  6: '32px',
  7: '40px',
  8: '56px',  // Sections majeures
  9: '72px',  // Séparations majeures
}
```

### Radius

Rendu doux et premium:

```typescript
radius: {
  sm: '6px',   // Subtil
  md: '10px',  // Standard
  lg: '16px',  // Cards
  xl: '22px',  // Surfaces majeures
  full: '999px' // Pills/Avatars
}
```

### Ombres

Naturelles et subtiles:

```typescript
shadows: {
  sm: '0 2px 4px rgba(0,0,0,0.06)',
  md: '0 4px 8px rgba(0,0,0,0.08)',
  lg: '0 10px 20px rgba(0,0,0,0.12)',
}
```

### Glass / Blur

```typescript
glass: {
  alpha: 'rgba(255, 255, 255, 0.12)',
  blur: {
    sm: '8px',
    md: '14px',
    lg: '20px',
  }
}
```

---

## Thèmes

### 🔴 Rubis - Intensité, Volonté, Activation

**Usage:** Modules d'action, analyse active, états critiques

```typescript
rubis: {
  primary: '#D63A32',      // Main
  primaryLight: '#E65C53',
  primaryDark: '#A32620',
  accent: '#FF8B7F',
  surface: '#1A0E0E',
}
```

**Style:** Chaleur maîtrisée, énergie, dynamisme

---

### 🔵 Saphir - Lucidité, Profondeur, Fluidité

**Usage:** Chat IA, Memory Core, modules analytiques

```typescript
saphir: {
  primary: '#2A77C8',
  primaryLight: '#4AA0F0',
  primaryDark: '#1C538A',
  accent: '#7BC7FF',
  surface: '#0D1A27',
}
```

**Style:** Calme, fluidité, profondeur - optimisé contre fatigue visuelle

---

### 🟢 Émeraude - Stabilité, Équilibre, Croissance

**Usage:** Dashboard, Harmonia Core, systèmes d'équilibre

```typescript
emeraude: {
  primary: '#2EAF62',
  primaryLight: '#52CD84',
  primaryDark: '#1E8046',
  accent: '#7DE0A8',
  surface: '#0E1E15',
}
```

**Style:** Apaisant mais solide, hues moins clinquantes, plus premium

---

### ⚪ Diamant - Clarté, Structure, Précision

**Usage:** Helios, Nexus, cockpit global, systèmes de précision

```typescript
diamant: {
  primary: '#A678E8',
  primaryLight: '#C5A8F9',
  primaryDark: '#7D4CB9',
  accent: '#EEE6FF',
  surface: '#0F0F15',
}
```

**Style:** Ultra minimaliste, net, contraste rehaussé, profondeur maîtrisée

---

## Primitives UI

### A. Inputs & Controls

#### Button
```tsx
<Button variant="primary" size="md">
  Action
</Button>
```

**Variants:** `primary`, `secondary`, `ghost`, `subtle`, `glass`  
**Sizes:** `sm`, `md`, `lg`  
**States:** `hover`, `active`, `disabled`, `loading`

#### Input
```tsx
<Input 
  placeholder="Entrez du texte..."
  error="Message d'erreur"
/>
```

**Types:** `text`, `password`, `email`, `number`, `search`  
**Features:** Error states, icons, clearable

#### Card
```tsx
<Card variant="glass" padding="lg">
  <CardHeader>Titre</CardHeader>
  <CardBody>Contenu</CardBody>
</Card>
```

**Variants:** `solid`, `glass`, `outline`, `subtle`  
**Features:** Header, body, footer, actions

---

### B. Containers & Surfaces

#### Modal
```tsx
<Modal isOpen={open} onClose={handleClose} size="md">
  <ModalHeader>Titre</ModalHeader>
  <ModalBody>Contenu</ModalBody>
  <ModalFooter>Actions</ModalFooter>
</Modal>
```

**Sizes:** `sm`, `md`, `lg`, `xl`, `full`  
**Features:** Overlay, animations, accessibility

---

### C. Navigation

#### Sidebar
```tsx
<Sidebar 
  items={navItems}
  onItemClick={handleNav}
  collapsed={isCollapsed}
/>
```

**Features:** Collapsible, active states, icons, badges

#### Tabs
```tsx
<Tabs value={activeTab} onChange={setTab}>
  <Tab value="1">Tab 1</Tab>
  <Tab value="2">Tab 2</Tab>
</Tabs>
```

---

### D. Feedback

#### Badge
```tsx
<Badge variant="success" size="sm">
  Actif
</Badge>
```

**Variants:** `default`, `success`, `warning`, `error`, `info`

#### Spinner
```tsx
<Spinner size="md" />
```

**Sizes:** `sm`, `md`, `lg`

---

## Motion System

### Durées
```typescript
durations: {
  instant: '50ms',
  fast: '120ms',
  normal: '180ms',
  slow: '250ms',
  slower: '400ms',
}
```

### Easings
```typescript
easings: {
  default: 'cubic-bezier(0.22, 1, 0.36, 1)', // Organique
  smooth: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
  spring: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
}
```

### Animations Standardisées

**Fade:**
```tsx
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.18 }}
/>
```

**Spring doux:**
```tsx
<motion.div
  initial={{ scale: 0.95, opacity: 0 }}
  animate={{ scale: 1, opacity: 1 }}
  transition={{ duration: 0.25, ease: [0.68, -0.55, 0.265, 1.55] }}
/>
```

**Slide:**
```tsx
<motion.div
  initial={{ y: 4, opacity: 0 }}
  animate={{ y: 0, opacity: 1 }}
  transition={{ duration: 0.18 }}
/>
```

### Framer Motion Variants

```tsx
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 }
};
```

---

## Accessibilité

### WCAG AA Compliance

✅ Contraste minimum 4.5:1 pour texte normal  
✅ Contraste minimum 3:1 pour texte large  
✅ Focus visible sur tous les éléments interactifs  
✅ ARIA labels complets  
✅ Navigation clavier complète  

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Focus States

```tsx
<Button className="focus:ring-2 focus:ring-primary focus:ring-offset-2">
  Action
</Button>
```

---

## Usage & Best Practices

### Import des Tokens

```tsx
import { colors, spacing, fontSizes, radius } from '@themes/tokens';
import { durations, easings, framerVariants } from '@themes/motion';
```

### Utiliser le ThemeProvider

```tsx
import { ThemeProvider } from '@themes';

function App() {
  return (
    <ThemeProvider defaultTheme="saphir">
      <YourApp />
    </ThemeProvider>
  );
}
```

### Hook useTheme

```tsx
import { useTheme } from '@themes';

function Component() {
  const { theme, setTheme, colors, nextTheme } = useTheme();
  
  return (
    <button onClick={() => setTheme('rubis')}>
      Switch to Rubis
    </button>
  );
}
```

### Styles CSS Variables

Le ThemeProvider injecte automatiquement les variables CSS:

```css
.my-component {
  background: var(--surface-solid);
  color: var(--primary-main);
  border-radius: var(--radius-md);
  transition: var(--transition-colors);
}
```

### Composants avec Variants

```tsx
<Button variant="glass" size="lg" leftIcon="✨">
  Action Premium
</Button>

<Card variant="glass" hover>
  <CardBody>Contenu avec effet glass</CardBody>
</Card>
```

### Animations Fluides

```tsx
import { motion } from 'framer-motion';
import { framerVariants } from '@themes/motion';

<motion.div
  variants={framerVariants.modal}
  initial="hidden"
  animate="visible"
  exit="exit"
>
  Modal Content
</motion.div>
```

---

## Patterns UX Natifs TITANE∞

### Graphes Organiques
- Nexus (knowledge graph)
- Memory Timeline
- Utilisent Canvas 2D avec 60 FPS

### Rings Énergétiques
- Helios Visualization
- Affichage circulaire des métriques

### Flux Équilibrés
- Harmonia Patterns
- Visualisation des flux comportementaux

### Timeline XP Fluide
- Progression visuelle
- Animations de niveau

### Talent Tree Animé
- Arbre de compétences interactif
- Déverrouillages progressifs

---

## Roadmap

### Phase 1 ✅ (Complété)
- [x] Tokens de design optimisés
- [x] 4 thèmes raffinés
- [x] Primitives UI de base
- [x] Motion System complet

### Phase 2 🔄 (En cours)
- [ ] Primitives manquantes (Select, Switch, Checkbox, Slider, Radio, Toggle, Textarea)
- [ ] Optimisation composants existants (variants glass/subtle)
- [ ] Storybook complet

### Phase 3 📅 (Planifié)
- [ ] Tests accessibilité A11y
- [ ] Documentation interactive
- [ ] Templates & Patterns library
- [ ] Design tokens exports (Figma)

---

## Support & Contribution

**Maintainers:** TITANE∞ Core Team  
**License:** Propriétaire  
**Version:** 17.1.0

Pour toute question ou contribution, consulter la documentation interne.

---

**© 2025 TITANE∞ - Design System optimisé pour l'intelligence cognitive**
