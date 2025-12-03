# 🎨 TITANE∞ Design System v∞

> **Monochrome Metal Design** — Architecture visuelle unifiée pour TITANE_INFINITY

---

## 📋 Table des Matières

1. [Philosophie](#philosophie)
2. [Palette de Couleurs](#palette-de-couleurs)
3. [Typographie](#typographie)
4. [Espacement & Layout](#espacement--layout)
5. [Composants](#composants)
6. [États & Feedback](#états--feedback)
7. [Accessibilité](#accessibilité)
8. [Migration Guide](#migration-guide)

---

## 🌌 Philosophie

TITANE∞ adopte un **design monochrome métallique** qui exprime :

- **Clarté** : Hiérarchie visuelle par luminosité, pas par couleur
- **Précision** : Interface technique sans distraction
- **Élégance** : Surfaces métalliques, glows subtils, ombres directionnelles
- **Cohérence** : Un seul langage visuel pour 20 moteurs / 6 couches

### Principes Fondamentaux

1. **Monochrome First** : Nuances de gris métallique (#727B81, #C4C4C4)
2. **Accent Unique** : Vert-gris subtil (#93B399) pour actions/succès
3. **Noir Profond** : Backgrounds jamais noir pur (#0A0A0A → #1A1A1A)
4. **Contrastes AA+** : Texte toujours lisible (ratio ≥ 4.5:1)

---

## 🎨 Palette de Couleurs

### Couleurs Primaires

| Token | Valeur | Usage |
|-------|--------|-------|
| `--primary` | `#727B81` | Éléments principaux, texte actif |
| `--secondary` | `#C4C4C4` | Texte secondaire, bordures hover |
| `--accent` | `#93B399` | Actions, succès, liens, focus |

### Backgrounds (Hiérarchie d'élévation)

| Token | Valeur | Usage |
|-------|--------|-------|
| `--bg-base` | `#0A0A0A` | Fond de page |
| `--bg-elevated` | `#0F0F0F` | Élévation niveau 1 |
| `--bg-panel` | `#141414` | Panneaux latéraux |
| `--bg-card` | `#161616` | Cartes, conteneurs |
| `--bg-surface` | `#1A1A1A` | Surfaces interactives |

### États Sémantiques

| Token | Valeur | Usage |
|-------|--------|-------|
| `--state-success` | `#93B399` | Succès, validation |
| `--state-warning` | `#A89F91` | Avertissement |
| `--state-danger` | `#8F7A7A` | Erreur, danger |
| `--state-info` | `#8899AA` | Information |

### Texte

| Token | Valeur | Usage |
|-------|--------|-------|
| `--text` | `#E8E8E8` | Texte principal |
| `--text-muted` | `#9CA3AF` | Texte secondaire |
| `--text-primary` | `rgba(255,255,255,0.96)` | Titres |
| `--text-secondary` | `rgba(255,255,255,0.72)` | Corps |
| `--text-tertiary` | `rgba(255,255,255,0.48)` | Métadonnées |

---

## 📝 Typographie

### Familles de Polices

```css
--font-sans: "Inter", -apple-system, BlinkMacSystemFont, sans-serif;
--font-mono: "Fira Code", "JetBrains Mono", monospace;
```

### Échelle Typographique

| Token | Valeur | Usage |
|-------|--------|-------|
| `--font-size-xs` | `0.75rem` (12px) | Métadonnées, badges |
| `--font-size-sm` | `0.875rem` (14px) | Corps secondaire |
| `--font-size-base` | `1rem` (16px) | Corps principal |
| `--font-size-lg` | `1.125rem` (18px) | Sous-titres |
| `--font-size-xl` | `1.25rem` (20px) | Titres de section |
| `--font-size-2xl` | `1.5rem` (24px) | Titres de page |
| `--font-size-3xl` | `1.875rem` (30px) | Titres majeurs |

### Poids

| Token | Valeur | Usage |
|-------|--------|-------|
| `--font-weight-normal` | `400` | Corps de texte |
| `--font-weight-medium` | `500` | Labels, boutons |
| `--font-weight-semibold` | `600` | Titres de cartes |
| `--font-weight-bold` | `700` | Titres importants |

---

## 📐 Espacement & Layout

### Système de Spacing (base 4px)

| Token | Valeur | Usage |
|-------|--------|-------|
| `--space-xs` | `4px` | Gaps internes |
| `--space-sm` | `8px` | Padding petit |
| `--space-md` | `16px` | Padding standard |
| `--space-lg` | `24px` | Sections |
| `--space-xl` | `32px` | Grandes sections |
| `--space-2xl` | `48px` | Séparations majeures |

### Border Radius

| Token | Valeur | Usage |
|-------|--------|-------|
| `--radius` | `4px` | Standard (boutons, inputs) |
| `--radius-sm` | `2px` | Éléments compacts |
| `--radius-lg` | `6px` | Cartes |
| `--radius-xl` | `8px` | Panneaux |
| `--radius-2xl` | `12px` | Modals, grandes cartes |
| `--radius-full` | `9999px` | Pills, avatars |

---

## 🧩 Composants

### Boutons

```html
<!-- Bouton par défaut -->
<button class="titane-btn">Action</button>

<!-- Bouton primaire -->
<button class="titane-btn titane-btn-primary">Confirmer</button>

<!-- Avec focus ring accessible -->
<button class="titane-btn focus-ring">Accessible</button>
```

### Cartes

```html
<div class="titane-card">
  <div class="titane-card-header">Titre</div>
  <div class="titane-card-body">Contenu</div>
</div>
```

### Inputs

```html
<input type="text" class="titane-input" placeholder="Entrez...">
```

### Badges

```html
<span class="badge badge-success">OK</span>
<span class="badge badge-warning">Attention</span>
<span class="badge badge-danger">Erreur</span>
<span class="badge badge-info">Info</span>
```

### Status Dots

```html
<span class="status-dot status-dot-success"></span> En ligne
<span class="status-dot status-dot-danger"></span> Hors ligne
```

---

## 📊 États & Feedback

### Chat IA (tokens dédiés)

```css
/* User messages */
--chat-user-bg: linear-gradient(135deg, #5A636B 0%, #4A5258 100%);
--chat-user-border: rgba(196, 196, 196, 0.25);
--chat-user-glow: 0 0 16px rgba(196, 196, 196, 0.15);

/* AI messages */
--chat-ai-bg: linear-gradient(135deg, #1F2328 0%, #181C21 100%);
--chat-ai-border: rgba(147, 179, 153, 0.2);
--chat-ai-glow: 0 0 16px rgba(147, 179, 153, 0.12);

/* Avatars */
--avatar-user-bg: linear-gradient(135deg, #727B81 0%, #5A636B 100%);
--avatar-ai-bg: linear-gradient(135deg, #93B399 0%, #7A9682 100%);
```

### Shadows & Glows

```css
--shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.6);
--shadow-md: 0 4px 8px rgba(0, 0, 0, 0.7);
--shadow-lg: 0 8px 16px rgba(0, 0, 0, 0.75);
--glow-primary: rgba(114, 123, 129, 0.15);
--glow-accent: rgba(147, 179, 153, 0.12);
```

### Transitions

```css
--transition-fast: 120ms cubic-bezier(0.4, 0, 0.2, 1);
--transition-base: 200ms cubic-bezier(0.4, 0, 0.2, 1);
--transition-slow: 300ms cubic-bezier(0.4, 0, 0.2, 1);
```

---

## ♿ Accessibilité

### Focus Ring (WCAG 2.2)

```css
/* Minimum 3px, contraste suffisant */
--focus-ring: 0 0 0 3px rgba(147, 179, 153, 0.5);

/* Utilisation */
.focus-ring:focus-visible {
  box-shadow: var(--focus-ring);
}
```

### Cibles Tactiles

```css
/* Minimum 44x44px recommandé */
.touch-target {
  min-width: 44px;
  min-height: 44px;
}
```

### Modes de Lecture (UIReadingEngine)

```css
.reading-normal   /* Texte standard, 70ch max */
.reading-focus    /* Texte agrandi, contraste renforcé */
.reading-immersion /* Plein écran, centré */
```

### Préférences Utilisateur

```css
/* Respect des préférences système */
@media (prefers-reduced-motion: reduce) { ... }
@media (prefers-contrast: high) { ... }
```

---

## 🔄 Migration Guide

### De OMEGA (violet/bleu) vers Monochrome

| Ancien | Nouveau |
|--------|---------|
| `#a855f7` (violet) | `var(--primary)` |
| `#00d4ff` (cyan) | `var(--accent)` |
| `#6366f1` (indigo) | `var(--secondary)` |
| `--chat-violet` | `var(--chat-user-bg)` |
| `--chat-blue` | `var(--chat-ai-bg)` |

### De Legacy (rubis/saphir/émeraude)

| Ancien | Nouveau |
|--------|---------|
| `--titane-rubis-*` | `var(--state-danger)` |
| `--titane-saphir-*` | `var(--primary)` |
| `--titane-emeraude-*` | `var(--accent)` |
| `--titane-diamant-*` | `var(--secondary)` |

### Valeurs Hard-codées

| Éviter | Utiliser |
|--------|----------|
| `color: #fff` | `color: var(--text)` |
| `color: #ffffff` | `color: var(--text-primary)` |
| `background: #000` | `background: var(--bg-base)` |

---

## 📁 Fichiers Clés

```
src/design-system/
├── titane-fusion.css    # CSS principal (source de vérité)
├── titane-v∞.css        # Variables CSS legacy
├── tokens.ts            # Tokens TypeScript
└── motion.ts            # Variants Framer Motion

src/themes/
├── tokens.ts            # Remapping legacy → monochrome
└── ThemeProvider.tsx    # Provider React
```

---

## 📊 Checklist Validation Visuelle

- [ ] Dashboard : couleurs cohérentes, pas de #fff hard-codé
- [ ] Chat IA : bulles user/AI monochrome, avatars gradients
- [ ] Audio & Voix : sliders, états status alignés sur DS
- [ ] Centre Système : cartes uniformes, badges sémantiques
- [ ] Quantum Layer : surfaces métalliques, glows subtils
- [ ] Identity/Memory/Multi-IA : même patterns que Centre Système
- [ ] Focus visible sur tous les éléments interactifs
- [ ] Contrastes texte/fond ≥ 4.5:1

---

**TITANE∞ v∞ — Design System Monochrome Metal**
© 2025 Humain Total / Kevin Thibault / TITANE Team
