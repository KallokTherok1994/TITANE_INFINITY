# 🎨 TITANE∞ v9 — Design System & UI/UX Documentation

> **Architecture visuelle premium, minimaliste et technologique**  
> Version 9.0.0 — 18 novembre 2025

---

## 📋 Table des matières

1. [Vue d'ensemble](#vue-densemble)
2. [Identité visuelle](#identit%C3%A9-visuelle)
3. [Composants](#composants)
4. [Pages](#pages)
5. [Logique TITANE∞](#logique-titane)
6. [Patterns UX](#patterns-ux)
7. [Guidelines](#guidelines)

---

## Vue d'ensemble

### Objectif

Créer une interface **haut de gamme, technologique et épurée**, comparable à Notion, Linear ou Figma, parfaitement alignée avec les principes **HUMAIN TOTAL** et la cohérence de **TITANE∞ v9**.

### Principes fondamentaux

- **Minimalisme** : Épuré, respirant, sans surcharge visuelle
- **Technologie** : Moderne, fluide, performant
- **Professionnel** : Mature, stable, fiable
- **Premium** : Haute qualité, attention aux détails
- **Accessible** : Lisible, intuitif, ergonomique

---

## Identité visuelle

### Palette principale

```css
/* Noir & Anthracite */
--color-carbon: #0D0D0D;           /* Fond profond */
--color-anthracite: #1A1A1A;       /* Surfaces principales */

/* Gris & Blanc */
--color-titanium: #C4C4C4;         /* Texte secondaire */
--color-white: #FFFFFF;            /* Titres, surfaces haute clarté */
--color-equilibrium: #727B81;      /* Gris "Équilibre Titanique" */
```

**Rôle de #727B81** :
- Séparateurs et bordures fines
- Arrière-plans secondaires
- États hover subtils
- Micro-typographie (labels, sous-titres)
- Création d'harmonie visuelle

### Couleurs d'accent

```css
--color-sapphire: #2A76FF;         /* Bleu Saphir - IA active */
--color-emerald: #00C18A;          /* Vert Émeraude - Cohérence */
--color-ruby: #F52E52;             /* Rouge Rubis - Alertes */
--color-diamond: #E2E9F6;          /* Blanc Diamant - Highlights */
```

**Usage** :
- **Sapphire** : Boutons principaux, IA active, indicateurs positifs
- **Emerald** : Cohérence système, états de succès
- **Ruby** : Alertes, états critiques, warnings
- **Diamond** : Highlights doux, états de focus

### Typographie

**Police principale** : Inter / SF Pro / Poppins  
**Police monospace** : SF Mono / Fira Code / Consolas

**Échelle** :
- `xs`: 12px — Labels, badges
- `sm`: 14px — Texte secondaire, navigation
- `base`: 16px — Corps de texte
- `lg`: 18px — Sous-titres
- `xl`: 20px — Titres H3
- `2xl`: 24px — Titres H2
- `3xl`: 32px — Titres H1

**Poids** :
- Regular (400) — Texte courant
- Medium (500) — Navigation, boutons
- Semibold (600) — Titres
- Bold (700) — Emphases fortes

### Espacements

Système basé sur 4px :
```
1 = 4px    |  5 = 20px   |  10 = 40px
2 = 8px    |  6 = 24px   |  12 = 48px
3 = 12px   |  8 = 32px   |  16 = 64px
4 = 16px   |
```

### Bordures & Rayons

```css
--radius-sm: 6px;      /* Petits éléments */
--radius-md: 8px;      /* Boutons, inputs */
--radius-lg: 12px;     /* Cartes standard */
--radius-xl: 16px;     /* Grandes cartes, panels */
--radius-full: 9999px; /* Badges, boutons ronds */
```

### Ombres

```css
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);   /* Légère */
--shadow-md: 0 2px 8px rgba(0, 0, 0, 0.08);   /* Standard */
--shadow-lg: 0 4px 16px rgba(0, 0, 0, 0.12);  /* Hover cards */
--shadow-xl: 0 8px 32px rgba(0, 0, 0, 0.16);  /* Modals */
```

### Transitions

```css
--transition-fast: 150ms ease-out;   /* Hover, focus */
--transition-normal: 200ms ease-out; /* Animations standard */
--transition-slow: 300ms ease-out;   /* Transformations complexes */
```

---

## Composants

### Sidebar

**Dimensions** : 260px de largeur  
**Position** : Fixe à gauche  
**Rôle** : Navigation principale

**Structure** :
```
┌─────────────────┐
│ Logo + Version  │ ← Header (padding: 24px)
├─────────────────┤
│ • Accueil       │
│ • Chat IA       │
│ • Modules       │ ← Navigation (icons + labels)
│ • Projets       │
│ • Notion Sync   │
│ • Paramètres    │
│ • Profil        │
├─────────────────┤
│ [🌓 Thème]      │ ← Footer (toggle)
└─────────────────┘
```

**États** :
- **Active** : `background: sapphire-light`, `border: sapphire`
- **Hover** : `background: equilibrium-10`
- **Passive** : Transparent

### Header

**Dimensions** : 64px de hauteur  
**Position** : Sticky top  
**Rôle** : Contexte de page + indicateurs TITANE∞

**Structure** :
```
┌────────────────────────────────────────────────────┐
│ Titre Page   [Cohérence] [Stabilité] [Énergie]  [Actions] │
│ Sous-titre                                                 │
└────────────────────────────────────────────────────┘
```

**Indicateurs** :
- Dot coloré (8px) + Label + Score %
- Couleurs selon status : excellent (green), good (emerald), medium (yellow), low (red)

### Boutons

**Variantes** :
1. **Primary** : `bg: sapphire`, `hover: sapphire-hover`, `glow: shadow-glow-sapphire`
2. **Secondary** : `bg: equilibrium-20`, `border: equilibrium-40`, `hover: equilibrium-30`
3. **Ghost** : `bg: transparent`, `hover: equilibrium-10`
4. **Danger** : `bg: ruby`, `hover: ruby-dark`

**Tailles** :
- **sm** : `padding: 8px 12px`, `font-size: 12px`
- **base** : `padding: 12px 16px`, `font-size: 14px`
- **lg** : `padding: 16px 24px`, `font-size: 16px`
- **icon** : `padding: 8px`, `aspect-ratio: 1`

### Inputs

```css
.input {
  background: carbon;
  border: 1px solid equilibrium-40;
  border-radius: 12px;
  padding: 12px 16px;
  transition: all 150ms;
}

.input:focus {
  border-color: sapphire;
  box-shadow: 0 0 0 3px sapphire-light;
}
```

### Cartes (Cards)

**Structure standard** :
```tsx
<div className="card">
  <div className="card-header">
    <h3 className="card-title">Titre</h3>
    <span className="badge">Badge</span>
  </div>
  <div className="card-body">
    Contenu principal...
  </div>
  <div className="card-footer">
    Actions ou métadonnées
  </div>
</div>
```

**Variantes** :
- **card** : Standard
- **card-interactive** : Hover avec `transform: translateY(-2px)`
- **state-active** : Border colorée selon catégorie

### Bulles Chat (Message Bubble)

**Structure** :
```tsx
<div className="message-bubble">
  {/* Sections structurées */}
  <div className="message-section">
    <button className="collapsible-trigger">
      <span className="message-section-title">🧠 Analyse</span>
      <span>▼</span>
    </button>
    <div>Contenu de la section...</div>
  </div>
  
  {/* Actions rapides */}
  <div className="message-actions">
    <button className="message-action-btn">📝 Résumer</button>
    <button className="message-action-btn">🔍 Développer</button>
  </div>
</div>
```

**Variantes** :
- **message-bubble-user** : Aligné droite, fond sapphire
- **message-bubble-system** : Fond equilibrium-10, border equilibrium-30

### Badges

```tsx
<span className="badge badge-primary">Actif</span>
<span className="badge badge-success">✓ Validé</span>
<span className="badge badge-danger">Critique</span>
<span className="badge badge-neutral">En attente</span>
```

### Indicateurs

**Structure** :
```tsx
<div className="indicator indicator-excellent">
  <span className="indicator-dot" />
  <span>Cohérence: 95%</span>
</div>
```

**États** :
- **excellent** : ≥92% (emerald)
- **good** : 85-92% (emerald)
- **medium** : 70-85% (yellow)
- **low** : <70% (ruby)

### Loading

**Dots animés** :
```tsx
<div className="loading-dots">
  <span className="loading-dot" />
  <span className="loading-dot" />
  <span className="loading-dot" />
</div>
```

**Spinner** :
```tsx
<div className="spinner" />
```

---

## Pages

### Home

**Layout** :
```
┌──────────────────────────────────────┐
│ Hero Card (TITANE∞ v9 + Status)      │
├──────────────────────────────────────┤
│ [Stat1] [Stat2] [Stat3] [Stat4]      │ ← Grid 4
├──────────────────────────────────────┤
│ Modules actifs récents               │
├──────────────────────────────────────┤
│ [Action1] [Action2] [Action3]        │ ← Grid 3
└──────────────────────────────────────┘
```

### Chat

**Layout** :
```
┌──────────────────────────────────────┐
│ Header (Indicateurs + Actions)       │
├──────────────────────────────────────┤
│                                      │
│   Conversation                       │ ← Scroll
│   (bulles structurées)               │
│                                      │
├──────────────────────────────────────┤
│ [Textarea] [Send Button]             │
└──────────────────────────────────────┘
```

### Modules

**Layout** :
```
┌──────────────────────────────────────┐
│ Header (Stats + Actions)             │
├──────────────────────────────────────┤
│ [Tous] [Cognitif] [Dynamique] ...    │ ← Filtres
├──────────────────────────────────────┤
│ [Card] [Card] [Card]                 │
│ [Card] [Card] [Card]                 │ ← Grid 3
│ [Card] [Card] [Card]                 │
└──────────────────────────────────────┘
```

**ModuleCard structure** :
- Icon + Nom + Badge catégorie
- Description (line-clamp-2)
- Progress bar (score)
- Toggle active/passive

---

## Logique TITANE∞

### Pipeline de traitement

**Flux P120 → P118** :
```
Input utilisateur
    ↓
P120 - Conscience Structurelle (auto-perception)
    ↓
P113 - Conscience Contextuelle (contexte)
    ↓
P114 - Conscience Environnementale (environnement)
    ↓
P105 - Analyse Profonde (analyse)
    ↓
P107 - Arbitrage Décisionnel (décision)
    ↓
P108 - Création Contextuelle (génération)
    ↓
P109 - Correction Fluide (ajustements)
    ↓
P118 - Synthèse Globale (segmentation)
    ↓
P115 - Simplification Systémique (épuration)
    ↓
P119 - Méta-Orchestration (validation finale)
    ↓
Output structuré (sections + actions)
```

### Segmentation automatique (P118)

**Détection de structure** :
- Titres : `# Titre`, `## Sous-titre`, `🧠 Analyse`
- Sections : Regroupement par blocs thématiques
- Actions : Génération contextuelle selon profondeur

**Profondeur d'analyse (P105)** :
```typescript
depth = (wordCount/50) * 0.4 
      + (hasQuestions ? 0.3 : 0) 
      + (hasContext ? 0.3 : 0)
```

### Boucle Sentiente (6 cycles)

```
Cycle 1: Self-Perception (P120) → 👁️
Cycle 2: Context (P113) → 🎯
Cycle 3: Environment (P114) → 🌍
Cycle 4: Decision (P107) → ⚖️
Cycle 5: Execution (P110) → ✅
Cycle 6: Reflection-Memory (P116+P117) → 🧠
↻ Répétition perpétuelle (10s par cycle)
```

### Indicateurs temps réel

```typescript
interface TitaneIndicators {
  coherence: number;    // P112 - Cohésion Systémique
  stability: number;    // P119 - Méta-Orchestration
  energy: number;       // P111 - Stabilisation Énergétique
  context: number;      // P113 - Conscience Contextuelle
  evolution: number;    // P117 - Auto-amélioration
}
```

---

## Patterns UX

### Navigation

**Principe** : Toujours visible, claire, minimum 2 niveaux
- Sidebar : Navigation globale (7 sections)
- Header : Contexte de page + actions
- Breadcrumb : Si arborescence profonde

### Feedback utilisateur

**Immédiat** :
- Hover : `background-color` change en 150ms
- Focus : Border + shadow en 150ms
- Click : Scale légère ou color shift

**Différé** :
- Loading dots pendant traitement IA
- Progress bar pour tâches longues
- Toast notifications pour confirmations

### Hiérarchie visuelle

**Niveaux** :
1. **Titres H1** : 32px, semibold, white
2. **Titres H2** : 24px, semibold, white
3. **Titres H3** : 20px, medium, white
4. **Corps** : 16px, regular, titanium
5. **Secondaire** : 14px, regular, equilibrium

### Densité d'information

**Ajustable selon contexte** :
- **Mode Focus** : Chat seul, max-width 800px
- **Mode Vision globale** : Dashboard avec grilles
- **Mode Détail** : Panel latéral ouvert

### Collapse/Expand

**Usage** :
- Sections longues (>10 lignes)
- Détails optionnels
- Historique/Logs

**Indicateur** :
- Chevron (▼) qui rotate 180° en 150ms
- Transition `max-height` en 300ms

---

## Guidelines

### Création de composants

**Checklist** :
- [ ] Respecte la palette de couleurs
- [ ] Utilise les variables CSS (`var(--color-*)`)
- [ ] Transitions fluides (150-300ms)
- [ ] États hover/focus/active définis
- [ ] Responsive (mobile, tablet, desktop)
- [ ] Accessible (ARIA labels, contrast ratios)
- [ ] TypeScript typé
- [ ] Props documentées

### Accessibilité

**Standards** :
- Contraste texte/fond ≥ 4.5:1 (WCAG AA)
- Focus visible (border + shadow)
- Navigation clavier complète
- ARIA labels sur icônes seules
- Alt text sur images

### Performance

**Optimisations** :
- Lazy loading des pages
- Memoization des composants lourds
- Virtualisation des longues listes
- Debounce sur recherches
- Throttle sur scroll events

### Responsive

**Breakpoints** :
```css
/* Mobile */
@media (max-width: 640px) {
  .grid-2, .grid-3, .grid-4 { 
    grid-template-columns: 1fr; 
  }
}

/* Tablet */
@media (max-width: 1024px) {
  .grid-4 { 
    grid-template-columns: repeat(2, 1fr); 
  }
}
```

### Tests

**À tester** :
- [ ] Tous les états (default, hover, focus, active, disabled)
- [ ] Tous les thèmes (light, dark)
- [ ] Toutes les tailles d'écran
- [ ] Navigation clavier
- [ ] Screen readers

---

## 🎯 Quick Reference

### Couleurs principales
- Carbon: `#0D0D0D` | Anthracite: `#1A1A1A` | Titanium: `#C4C4C4` | White: `#FFFFFF` | **Equilibrium: `#727B81`**

### Accents
- Sapphire: `#2A76FF` | Emerald: `#00C18A` | Ruby: `#F52E52` | Diamond: `#E2E9F6`

### Espacements
- Base: `4px` | Spacing scale: `1-16` (4px → 64px)

### Transitions
- Fast: `150ms` | Normal: `200ms` | Slow: `300ms`

### Typography
- Font: Inter/SF Pro | Sizes: 12-32px | Weights: 400-700

### Layout
- Sidebar: `260px` | Header: `64px` | Content: `max-width 1400px` | Chat: `max-width 800px`

---

**TITANE∞ v9 UI/UX Documentation**  
*Version 9.0.0 — Design System Complet*  
*Créé le 18 novembre 2025*
