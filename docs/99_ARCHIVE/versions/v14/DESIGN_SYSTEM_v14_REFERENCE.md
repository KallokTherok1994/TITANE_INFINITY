# 🎨 TITANE∞ v14 — Design System Reference

**Version**: v14.0.0
**Date**: 25 novembre 2025
**Architecture**: Tokens centralisés + Styles modulaires
**Philosophie**: Monochrome métallique premium, cohérence absolue, accessibilité AA+

---

## 📂 Architecture Fichiers

```
src/design-system/
├── tokens.css         → Toutes les CSS variables (couleurs, spacing, shadows, etc.)
└── titane-v14.css     → Styles des composants (buttons, cards, inputs, chat)
```

**Import unique dans `main.tsx`**:
```typescript
import './design-system/titane-v14.css';
```

Le fichier `titane-v14.css` importe automatiquement `tokens.css` via `@import`.

---

## 🎨 Palette Couleurs

### Couleurs Principales

| Token | Valeur | Usage |
|-------|--------|-------|
| `--color-primary-500` | `#727b81` | Gris métal principal (boutons, accents) |
| `--color-silver-400` | `#c4c4c4` | Argent brossé (surfaces claires) |
| `--color-accent-500` | `#93b399` | Vert-gris organique (accents subtils) |

### Échelle Complète

Chaque couleur dispose de 10 nuances (50 à 900):

- **Primary** (`--color-primary-50` → `--color-primary-900`): Gris métal chaud
- **Silver** (`--color-silver-50` → `--color-silver-900`): Argent brossé
- **Accent** (`--color-accent-50` → `--color-accent-900`): Vert-gris métallique

### Couleurs Sémantiques

| Token | Valeur | Usage |
|-------|--------|-------|
| `--color-success-500` | `#93b399` | Succès (vert métal) |
| `--color-warning-500` | `#a89f91` | Avertissement (beige métal) |
| `--color-danger-500` | `#8b5f5f` | Erreur (rouge-gris désaturé) |
| `--color-info-500` | `#727b81` | Information (metal primary) |

---

## 🌑 Backgrounds & Surfaces

| Token | Valeur | Usage |
|-------|--------|-------|
| `--bg-base` | `#050607` | Fond de base ultra-sombre |
| `--bg-elevated` | `#0b0d0f` | Surfaces surélevées |
| `--bg-panel` | `#101216` | Panneaux |
| `--bg-card` | `#14181d` | Cartes |
| `--bg-surface` | `#181c21` | Surfaces génériques |
| `--bg-hover` | `rgba(255,255,255,0.04)` | Hover |
| `--bg-active` | `rgba(255,255,255,0.08)` | Active |

### Glass Morphism

```css
background: var(--glass-bg);           /* rgba(20, 24, 29, 0.85) */
border: 1px solid var(--glass-border); /* rgba(196, 196, 196, 0.12) */
backdrop-filter: blur(18px);
```

---

## 🔲 Borders

| Token | Valeur | Usage |
|-------|--------|-------|
| `--border-subtle` | `rgba(255,255,255,0.04)` | Bordures très subtiles |
| `--border-default` | `rgba(255,255,255,0.10)` | Bordures standard |
| `--border-medium` | `rgba(255,255,255,0.14)` | Bordures moyennes |
| `--border-strong` | `rgba(255,255,255,0.18)` | Bordures fortes |
| `--border-accent` | `var(--color-primary-500)` | Bordures accentuées |
| `--border-focus` | `var(--color-accent-500)` | Focus rings |

---

## 📝 Texte

| Token | Valeur | Usage |
|-------|--------|-------|
| `--text-primary` | `rgba(255,255,255,0.96)` | Texte principal |
| `--text-secondary` | `rgba(255,255,255,0.72)` | Texte secondaire |
| `--text-tertiary` | `rgba(255,255,255,0.48)` | Texte tertiaire |
| `--text-disabled` | `rgba(255,255,255,0.30)` | Texte désactivé |
| `--text-inverse` | `#050607` | Texte sur fond clair |
| `--text-on-accent` | `#050607` | Texte sur accent |

---

## ✨ Shadows & Glows

### Shadows

```css
--shadow-xs:  0 1px 2px rgba(0,0,0,0.5)
--shadow-sm:  0 2px 4px rgba(0,0,0,0.6)
--shadow-md:  0 4px 8px rgba(0,0,0,0.7)
--shadow-lg:  0 8px 16px rgba(0,0,0,0.75)
--shadow-xl:  0 12px 24px rgba(0,0,0,0.8)
--shadow-2xl: 0 20px 40px rgba(0,0,0,0.85)
```

### Glows

```css
--glow-primary:  0 0 16px rgba(114,123,129,0.25)
--glow-accent:   0 0 16px rgba(147,179,153,0.20)
--glow-success:  0 0 16px rgba(147,179,153,0.25)
--glow-danger:   0 0 16px rgba(139,95,95,0.30)
```

### Focus Rings

```css
--focus-ring-primary: 0 0 0 3px rgba(114,123,129,0.5)
--focus-ring-accent:  0 0 0 3px rgba(147,179,153,0.5)
```

---

## 📏 Spacing (8px base)

| Token | Valeur | Pixels |
|-------|--------|--------|
| `--spacing-0` | `0` | 0px |
| `--spacing-1` | `0.25rem` | 4px |
| `--spacing-2` | `0.5rem` | 8px |
| `--spacing-3` | `0.75rem` | 12px |
| `--spacing-4` | `1rem` | 16px |
| `--spacing-5` | `1.25rem` | 20px |
| `--spacing-6` | `1.5rem` | 24px |
| `--spacing-8` | `2rem` | 32px |
| `--spacing-10` | `2.5rem` | 40px |
| `--spacing-12` | `3rem` | 48px |
| `--spacing-16` | `4rem` | 64px |
| `--spacing-20` | `5rem` | 80px |
| `--spacing-24` | `6rem` | 96px |

### Shortcuts

```css
--space-xs:  var(--spacing-1)   /* 4px */
--space-sm:  var(--spacing-2)   /* 8px */
--space-md:  var(--spacing-4)   /* 16px */
--space-lg:  var(--spacing-6)   /* 24px */
--space-xl:  var(--spacing-8)   /* 32px */
--space-2xl: var(--spacing-12)  /* 48px */
--space-3xl: var(--spacing-16)  /* 64px */
```

---

## 🔘 Border Radius

| Token | Valeur | Pixels |
|-------|--------|--------|
| `--radius-none` | `0` | 0px |
| `--radius-sm` | `0.25rem` | 4px |
| `--radius-md` | `0.5rem` | 8px |
| `--radius-lg` | `0.75rem` | 12px |
| `--radius-xl` | `1rem` | 16px |
| `--radius-2xl` | `1.5rem` | 24px |
| `--radius-3xl` | `2rem` | 32px |
| `--radius-full` | `9999px` | Cercle |
| `--radius` | `var(--radius-md)` | Défaut (8px) |

---

## 📰 Typography

### Font Families

```css
--font-sans: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif
--font-mono: "Fira Code", "JetBrains Mono", "Consolas", "Monaco", monospace
```

### Font Sizes

| Token | Valeur | Pixels |
|-------|--------|--------|
| `--font-size-xs` | `0.75rem` | 12px |
| `--font-size-sm` | `0.875rem` | 14px |
| `--font-size-base` | `1rem` | 16px |
| `--font-size-lg` | `1.125rem` | 18px |
| `--font-size-xl` | `1.25rem` | 20px |
| `--font-size-2xl` | `1.5rem` | 24px |
| `--font-size-3xl` | `1.875rem` | 30px |
| `--font-size-4xl` | `2.25rem` | 36px |
| `--font-size-5xl` | `3rem` | 48px |

### Font Weights

```css
--font-weight-normal:    400
--font-weight-medium:    500
--font-weight-semibold:  600
--font-weight-bold:      700
```

### Line Heights

```css
--line-height-none:     1
--line-height-tight:    1.25
--line-height-snug:     1.375
--line-height-normal:   1.5
--line-height-relaxed:  1.625
--line-height-loose:    2
```

---

## ⏱️ Transitions & Animations

### Durations

```css
--duration-instant:  50ms
--duration-fast:     120ms
--duration-base:     200ms
--duration-slow:     300ms
--duration-slower:   500ms
```

### Timing Functions

```css
--ease-in-out:  cubic-bezier(0.4, 0, 0.2, 1)
--ease-in:      cubic-bezier(0.4, 0, 1, 1)
--ease-out:     cubic-bezier(0, 0, 0.2, 1)
--ease-spring:  cubic-bezier(0.68, -0.55, 0.265, 1.55)
```

### Presets

```css
--transition-fast:      var(--duration-fast) var(--ease-in-out)
--transition-base:      var(--duration-base) var(--ease-in-out)
--transition-slow:      var(--duration-slow) var(--ease-in-out)
--transition-all:       all var(--duration-fast) var(--ease-in-out)
--transition-colors:    background-color, color, border-color (120ms each)
--transition-transform: transform var(--duration-fast) var(--ease-in-out)
--transition-opacity:   opacity var(--duration-base) var(--ease-in-out)
```

---

## 📚 Z-Index Scale

```css
--z-base:           0
--z-dropdown:       100
--z-sticky:         200
--z-fixed:          300
--z-modal-backdrop: 400
--z-modal:          500
--z-popover:        600
--z-tooltip:        700
--z-notification:   800
--z-max:            999
```

---

## 🧩 Composants Prédéfinis

### Buttons

```html
<button class="titane-btn">Défaut</button>
<button class="titane-btn titane-btn-primary">Primary</button>
<button class="titane-btn titane-btn-accent">Accent</button>
<button class="titane-btn titane-btn-ghost">Ghost</button>

<!-- Sizes -->
<button class="titane-btn titane-btn-sm">Small</button>
<button class="titane-btn titane-btn-lg">Large</button>
```

### Cards

```html
<div class="titane-card">
  <div class="titane-card-header">
    <h3 class="titane-card-title">Titre</h3>
  </div>
  <div class="titane-card-body">
    <p>Contenu de la carte</p>
  </div>
</div>
```

### Surfaces

```html
<div class="titane-surface">Surface basique</div>
<div class="titane-panel">Panneau élevé</div>
<div class="titane-glass">Glass morphism</div>
```

### Inputs

```html
<label class="titane-label">Nom</label>
<input type="text" class="titane-input" placeholder="Entrez votre nom">

<textarea class="titane-input titane-textarea" placeholder="Message"></textarea>
```

### Chat UI

```html
<div class="titane-chat-bubble titane-chat-bubble-user">
  Message utilisateur
</div>

<div class="titane-chat-bubble titane-chat-bubble-ai">
  Réponse IA
</div>

<div class="titane-chat-thinking">
  L'IA réfléchit...
</div>
```

---

## 🎨 Classes Utilitaires

### Texte

```html
<p class="text-primary">Texte principal</p>
<p class="text-secondary">Texte secondaire</p>
<p class="text-tertiary">Texte tertiaire</p>
<p class="text-success">Succès</p>
<p class="text-danger">Erreur</p>

<p class="text-xs">Extra small</p>
<p class="text-sm">Small</p>
<p class="text-base">Base</p>
<p class="text-lg">Large</p>

<p class="font-normal">Normal</p>
<p class="font-medium">Medium</p>
<p class="font-semibold">Semibold</p>
<p class="font-bold">Bold</p>
```

### Backgrounds

```html
<div class="bg-base">Base</div>
<div class="bg-elevated">Elevated</div>
<div class="bg-panel">Panel</div>
<div class="bg-card">Card</div>
```

### Shadows & Glows

```html
<div class="shadow-sm">Shadow small</div>
<div class="shadow-md">Shadow medium</div>
<div class="shadow-lg">Shadow large</div>

<div class="glow-primary">Glow primary</div>
<div class="glow-accent">Glow accent</div>
```

### Spacing

```html
<div class="mt-4">Margin-top 16px</div>
<div class="mb-6">Margin-bottom 24px</div>
<div class="p-4">Padding 16px</div>
```

### Animations

```html
<div class="animate-fade-in">Fade in</div>
<div class="animate-pulse">Pulse</div>
<div class="animate-slide-in">Slide in</div>
<div class="animate-glow">Glow animation</div>
```

---

## 📱 Responsive Design

Le Design System v14 inclut des media queries pour tablettes et mobiles :

```css
/* Tablettes */
@media (max-width: 768px) {
  .titane-container { padding: 0 var(--space-md); }
  .titane-chat-bubble { max-width: 85%; }
}

/* Mobiles */
@media (max-width: 480px) {
  .titane-container { padding: 0 var(--space-sm); }
  .titane-row { flex-direction: column; }
}
```

---

## ✅ Checklist Migration Composants

Pour migrer un composant existant vers le DS v14 :

1. ✅ Remplacer couleurs hardcodées par tokens CSS :
   ```css
   /* Avant */
   color: #727b81;

   /* Après */
   color: var(--color-primary-500);
   ```

2. ✅ Utiliser spacing tokens :
   ```css
   /* Avant */
   padding: 16px 24px;

   /* Après */
   padding: var(--space-md) var(--space-lg);
   ```

3. ✅ Utiliser shadows/glows tokens :
   ```css
   /* Avant */
   box-shadow: 0 4px 8px rgba(0,0,0,0.7);

   /* Après */
   box-shadow: var(--shadow-md);
   ```

4. ✅ Utiliser transitions presets :
   ```css
   /* Avant */
   transition: all 0.2s ease-in-out;

   /* Après */
   transition: var(--transition-all);
   ```

5. ✅ Appliquer classes utilitaires quand possible :
   ```html
   <!-- Avant -->
   <p style="color: rgba(255,255,255,0.72); font-size: 0.875rem;">Text</p>

   <!-- Après -->
   <p class="text-secondary text-sm">Text</p>
   ```

---

## 🎯 Philosophie Design v14

1. **Monochrome Métallique** : 3 couleurs principales uniquement (primary, silver, accent)
2. **Cohérence Absolue** : Tous les tokens centralisés, 0 valeurs hardcodées
3. **Performance** : Transitions 120ms (ultra-réactives), animations organiques
4. **Accessibilité** : Contraste AA+ minimum, focus rings visibles
5. **Responsive** : Mobile-first, media queries intégrées
6. **Modularité** : Composants réutilisables, classes utilitaires

---

## 📦 Export TypeScript (à venir Phase 6)

```typescript
import { spacing, radius, shadows, colors } from '@/design-system/tokens';

// Usage programmatique des tokens
const buttonStyle = {
  padding: spacing[4],
  borderRadius: radius.md,
  boxShadow: shadows.md,
  background: colors.primary[500],
};
```

---

**TITANE∞ v14 Design System** — Centralisé, cohérent, performant.
© 2025 TITANE Team
