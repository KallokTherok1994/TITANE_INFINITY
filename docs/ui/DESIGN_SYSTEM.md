# TITANE∞ Design System — Référence Contributeur

**Version:** v35.1.6 | **Dernière mise à jour:** 2026-05-16 | **Statut:** Production | **Conformité:** WCAG 2.2 AA

---

## 1. Vue d'ensemble du système de tokens

TITANE∞ utilise un design system basé sur des **CSS custom properties** (`var(--color-*)`) exposées via des classes Tailwind CSS personnalisées préfixées `titanium-*`.

La configuration vit dans `tailwind.config.ts`. Chaque classe `titanium-*` pointe vers une variable CSS définie dans `src/styles/css-vars.css`. Ne jamais écrire de valeur de couleur directement dans un composant — toujours passer par les tokens.

```css
/* src/styles/css-vars.css — extrait */
:root {
  --color-bg-primary: #0a0a0f;
  --color-bg-secondary: #111118;
  --color-bg-tertiary: #1a1a24;
  --color-text-primary: #e8e8f0;
  --color-text-secondary: #9898b0;
  --color-text-muted: #5a5a78;
  --color-accent: #a855f7;
  --color-border-default: rgba(255, 255, 255, 0.08);
  --color-error-500: #ef4444;
  --color-success-500: #22c55e;
}
```

```ts
// tailwind.config.ts — extrait
colors: {
  titanium: {
    'bg-primary':    'var(--color-bg-primary)',
    'bg-secondary':  'var(--color-bg-secondary)',
    'text-primary':  'var(--color-text-primary)',
    'text-secondary':'var(--color-text-secondary)',
    'accent':        'var(--color-accent)',
    // ...
  }
}
```

---

## 2. Tokens de couleur

| Token Tailwind | Variable CSS | Valeur dark (défaut) | Usage |
|---|---|---|---|
| `bg-titanium-bg-primary` | `--color-bg-primary` | `#0a0a0f` | Surface principale |
| `bg-titanium-bg-secondary` | `--color-bg-secondary` | `#111118` | Surface secondaire, cards |
| `bg-titanium-bg-tertiary` | `--color-bg-tertiary` | `#1a1a24` | Inputs, panneaux |
| `text-titanium-text-primary` | `--color-text-primary` | `#e8e8f0` | Corps de texte principal |
| `text-titanium-text-secondary` | `--color-text-secondary` | `#9898b0` | Labels, métadonnées |
| `text-titanium-text-muted` | `--color-text-muted` | `#5a5a78` | Texte désactivé |
| `border-titanium-border-default` | `--color-border-default` | `rgba(255,255,255,0.08)` | Bordures standard |
| `text-titanium-accent` | `--color-accent` | `#a855f7` | Accent violet, focus ring |
| `bg-titanium-error` | `--color-error-500` | `#ef4444` | Erreurs, actions danger |
| `bg-titanium-success` | `--color-success-500` | `#22c55e` | Succès, confirmations |

---

## 3. Light/dark mode

Le thème est contrôlé par la présence de la classe `html.light` sur l'élément `<html>`.

**Provider :** `UIThemeProvider` (`src/providers/UIThemeProvider.tsx`)
**Hook :** `useColorMode()` — retourne `{ colorMode, toggleColorMode }`
**Toggle :** composant Sun/Moon dans `TopNav`

En mode light, les CSS vars sont surchargées dans `src/styles/css-vars.css` :

```css
html.light {
  --color-bg-primary: #ffffff;
  --color-bg-secondary: #f4f4f8;
  --color-bg-tertiary: #eaeaf0;
  --color-text-primary: #0a0a0f;
  --color-text-secondary: #4a4a6a;
  --color-text-muted: #8888a8;
  --color-border-default: rgba(0, 0, 0, 0.08);
  /* 40+ overrides... */
}
```

Lire le mode couleur dans un composant :

```tsx
// Correct
const { colorMode } = useColorMode()
const isDark = colorMode === 'dark'

// Interdit — ne pas lire le DOM directement
document.documentElement.classList.contains('light')
```

---

## 4. Typographie

**Police principale :** Inter (variable font, chargée via `@fontsource/inter`)

| Usage | Poids | Classe Tailwind |
|---|---|---|
| Corps de texte | 400 Regular | `font-normal` |
| Labels, boutons, sous-titres | 500 Medium | `font-medium` |
| Titres de section, headings | 600 SemiBold | `font-semibold` |

Règle : **3 poids maximum** (400/500/600). Ne pas utiliser 700 Bold ou 300 Light sur les surfaces de l'application.

Echelle de tailles recommandée :

| Tailwind | Taille | Usage typique |
|---|---|---|
| `text-xs` | 0.75rem | Métadonnées, badges, timestamps |
| `text-sm` | 0.875rem | Labels, descriptions, texte secondaire |
| `text-base` | 1rem | Corps de texte principal |
| `text-lg` | 1.125rem | Sous-titres de section |
| `text-xl` | 1.25rem | Headings de page |

Eviter `text-2xl` et au-dessus sauf cas exceptionnel justifié.

---

## 5. Espacement

L'échelle d'espacement suit le système Tailwind standard (multiples de 4px). Les valeurs sémantiques sont exposées via :

```css
:root {
  --space-xs:  0.25rem;  /*  4px */
  --space-sm:  0.5rem;   /*  8px */
  --space-md:  1rem;     /* 16px */
  --space-lg:  1.5rem;   /* 24px */
  --space-xl:  2rem;     /* 32px */
  --space-2xl: 3rem;     /* 48px */
}
```

Utiliser les classes Tailwind (`p-4`, `gap-6`, `mt-8`, etc.) en priorité. Pour du CSS custom, référencer `var(--space-*)`.

---

## 6. Règles d'animation

**Durée standard : `200ms`** pour toutes les transitions d'interface (hover, focus, ouverture).

```css
/* Correct */
transition: background-color 200ms ease, color 200ms ease;

/* Interdit sur les surfaces principales */
transition: all 500ms ease;
```

**`prefers-reduced-motion` est obligatoire** pour toute animation non-essentielle à la compréhension du contenu :

```css
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to   { opacity: 1; transform: translateY(0); }
}

@media (prefers-reduced-motion: no-preference) {
  .animated-element {
    animation: fadeIn 200ms ease-out;
  }
}
```

**Animations décoratives** (particules, glows, shines, rotations) : exclusivement dans le scope `.dev-only-animations`. Ne s'appliquent pas en production si la classe n'est pas présente sur l'ancêtre.

**Entrée de Modal :** `modalEnter 200ms ease-out` — défini dans `src/styles/animations.css`, géré par le composant `Modal`.

---

## 7. Conventions de composants

### Button

Variants disponibles (`src/ui/components/Button.css`) :

| Variant | Usage |
|---|---|
| `primary` | Action principale — un seul par zone d'action |
| `secondary` | Action secondaire, annulation |
| `ghost` | Navigation, actions tertiaires, inline |
| `danger` | Suppression ou action irréversible — utilise `--color-error-500` |

L'effet shine (`::after`) est gated sur `prefers-reduced-motion: no-preference`.

```tsx
<Button variant="primary" onClick={handleSave}>Enregistrer</Button>
<Button variant="danger" onClick={handleDelete}>Supprimer</Button>
```

### Modal

```tsx
<Modal isOpen={open} onClose={handleClose} title="Confirmation">
  <p>Contenu du modal</p>
</Modal>
```

- Animation d'entrée : `modalEnter 200ms`
- Toujours fournir un `title` — il est rendu dans un `<h2>` et référencé par `aria-labelledby`
- Fermeture au clic sur l'overlay et sur `Escape` : géré par le composant, ne pas réimplémenter

### Badge

```tsx
<Badge variant="success">Actif</Badge>
<Badge variant="error">Erreur</Badge>
<Badge variant="default">Brouillon</Badge>
```

Ne pas créer de badges avec des couleurs hardcodées. Utiliser les variants `success`, `warning`, `error`, `default`.

---

## 8. Checklist accessibilité (a11y)

Avant tout PR modifiant l'UI :

- [ ] **Skip link** : `<a href="#app-main-content" className="skip-link">` présent dans `AppShell`, `id="app-main-content"` sur le `<main>`
- [ ] **Navigation clavier tabs** : `ArrowLeft`/`ArrowRight`/`Home`/`End` gérés sur les groupes `role="tablist"`
- [ ] **aria-selected** : présent et mis à jour dynamiquement sur chaque `role="tab"` actif (`true`/`false`)
- [ ] **tabIndex** : onglets non-actifs ont `tabIndex={-1}`, onglet actif a `tabIndex={0}`
- [ ] **aria-label** : sur tous les boutons icône sans texte visible adjacent
- [ ] **Focus ring** : visible, violet `#a855f7`, outline 2px, offset 2px — défini dans `src/styles/a11y.css`
- [ ] **Contraste** : minimum 4.5:1 pour le texte courant, 3:1 pour les grands textes (WCAG AA)
- [ ] **Touch targets** : minimum 44x44px sur appareils `pointer:coarse`
- [ ] **prefers-reduced-motion** : toute animation non-essentielle est gated

---

## 9. Ce qu'il ne faut PAS faire

```css
/* INTERDIT — valeurs hex hardcodées */
color: #6b7280;
background-color: #1f2937;
border-color: #374151;

/* INTERDIT — classes Tailwind gray / slate / zinc / stone */
/* Ces classes bypassent le design system et cassent le thème light/dark */
```

```tsx
// INTERDIT — classes hardcodées dans les composants
<div className="text-gray-400 bg-slate-800 border-zinc-700">

// CORRECT
<div className="text-titanium-text-secondary bg-titanium-bg-secondary border-titanium-border-default">
```

```css
/* INTERDIT — neon glow non-gated (hors .dev-only-animations) */
box-shadow: 0 0 20px #a855f7, 0 0 40px #a855f7;

/* INTERDIT — animations longues sur surfaces principales */
transition: all 500ms ease;
animation: pulse 2s infinite;
```

```tsx
// INTERDIT — tokens de themes déprécés
import { rubisTokens } from '@themes/tokens/rubis'
import { saphirColors } from '@themes/tokens/saphir'

// INTERDIT — lecture directe du DOM pour le mode couleur
const isLight = document.documentElement.classList.contains('light')

// CORRECT
const { colorMode } = useColorMode()
```

Toute violation de couleur hardcodée est détectée par ESLint et bloque le CI.
