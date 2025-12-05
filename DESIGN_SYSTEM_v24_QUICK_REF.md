# 🔩 TITANE∞ v24 — DESIGN SYSTEM MÉTALLIQUE

**Version** : 24.0.0
**Date** : 24 novembre 2025
**Status** : 🚀 Production Ready

---

## 🎯 PHILOSOPHIE

Un **seul thème visuel** : monochrome métallique, HUD technologique premium.

### 3 Couleurs de Base

```css
--metal-primary: #727b81    /* Métal chaud (cœur du thème) */
--metal-light: #c4c4c4      /* Silver Bullet (surfaces claires) */
--metal-accent: #93b399     /* Accent organique doux */
```

---

## 📐 TOKENS PRINCIPAUX

### Backgrounds (Dark HUD)

```css
--bg-base: #050607          /* Fond ultra-sombre */
--bg-elevated: #0b0d0f      /* Surfaces surélevées */
--bg-panel: #101216         /* Panneaux */
--bg-card: #14181d          /* Cartes */
--bg-hover: rgba(255,255,255,0.04)
--bg-active: rgba(255,255,255,0.08)
```

### Text (Hiérarchie Claire)

```css
--text-primary: rgba(255,255,255,0.96)     /* Texte principal */
--text-secondary: rgba(255,255,255,0.72)   /* Texte secondaire */
--text-tertiary: rgba(255,255,255,0.48)    /* Texte tertiaire */
--text-disabled: rgba(255,255,255,0.30)    /* Texte désactivé */
```

### Borders (Subtiles)

```css
--border-subtle: rgba(255,255,255,0.04)
--border-default: rgba(255,255,255,0.10)
--border-strong: rgba(255,255,255,0.18)
--border-accent: var(--metal-primary-500)
--border-focus: var(--metal-accent-500)
```

### Effets Premium

```css
--glass-bg: rgba(20,24,29,0.85)
--glass-blur: blur(18px)
--glow-metal-primary: 0 0 20px rgba(114,123,129,0.3)
--glow-metal-accent: 0 0 16px rgba(147,179,153,0.25)
```

---

## 🎨 PALETTES COMPLÈTES

### Metal Primary (10 nuances)

```css
--metal-primary-50  → --metal-primary-900
```

Utilise `--metal-primary-500` (#727b81) comme pivot.

### Metal Light / Silver (10 nuances)

```css
--metal-light-50  → --metal-light-900
```

Utilise `--metal-light-400` (#c4c4c4) comme pivot.

### Metal Accent / Organique (10 nuances)

```css
--metal-accent-50  → --metal-accent-900
```

Utilise `--metal-accent-500` (#93b399) comme pivot.

---

## 🎯 ÉTATS SÉMANTIQUES (SUBTILS)

```css
--color-success-500: var(--metal-accent-500)   /* Vert organique */
--color-warning-500: var(--metal-light-400)    /* Silver neutre */
--color-danger-500: #8b5f5f                    /* Métal rouillé */
--color-info-500: var(--metal-primary-500)     /* Métal bleuté */
```

---

## 🔄 COMPATIBILITÉ (REMAPPING)

### Tokens v12

```css
--color-primary-*   → --metal-primary-*
--color-secondary-* → --metal-light-*
--color-accent-*    → --metal-accent-*
```

### Tokens v20 (Gemmes)

```css
--titane-rubis-*     → Métal rouillé (#8b5f5f)
--titane-emeraude-*  → Metal Accent (#93b399)
--titane-saphir-*    → Metal Primary (#727b81)
--titane-diamant-*   → Metal Light (#c4c4c4)
```

### Modules Cognitifs

```css
--helios-*   → Metal Primary chaud
--nexus-*    → Metal Primary neutre
--harmonia-* → Metal Accent organique
--memory-*   → Metal Light
```

**Résultat** : Tous les composants existants continuent de fonctionner, mais convergent visuellement vers le thème métallique.

---

## 🎨 CLASSES UTILITAIRES

### Surfaces Premium

```css
.glass-surface   /* Effet vitré avec blur */
.panel-metal     /* Panel métallique avec gradient */
.metal-surface   /* Surface brossée linéaire */
```

### Effets

```css
.glow-metal      /* Glow métal doux */
.glow-accent     /* Glow accent organique */
.accent-line     /* Liseré lumineux */
```

### Animations

```css
.pulse-organic   /* Pulse organique 2s */
.glow-pulse      /* Glow pulsant 2s */
.shimmer         /* Shimmer horizontal */
```

---

## 📋 PATTERNS RECOMMANDÉS

### Carte Standard

```css
.card {
  background: var(--bg-card);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-xl);
  padding: var(--space-6);
}
```

### Input

```css
.input {
  background: var(--bg-elevated);
  border: 1px solid var(--border-default);
  color: var(--text-primary);
}

.input:focus {
  border-color: var(--border-focus);
  box-shadow: 0 0 0 3px var(--glow-metal-accent);
}

.input::placeholder {
  color: var(--text-tertiary);
}
```

### Bouton Primaire

```css
.btn-primary {
  background: linear-gradient(135deg,
    var(--metal-primary-500),
    var(--metal-accent-500)
  );
  color: var(--text-primary);
  border: none;
  border-radius: var(--radius-lg);
  padding: var(--space-3) var(--space-6);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: var(--glow-metal-accent);
}
```

### Navigation Item

```css
.nav-item {
  padding: var(--space-3) var(--space-4);
  color: var(--text-secondary);
  border-radius: var(--radius-lg);
  transition: all var(--duration-base) var(--ease-out);
}

.nav-item:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.nav-item--active {
  background: var(--bg-active);
  color: var(--text-primary);
  border-left: 3px solid var(--metal-accent-500);
}
```

---

## 🚫 ANTI-PATTERNS

### ❌ À ÉVITER

```css
/* Couleurs hardcodées */
color: #000000;
background: #ffffff;
border: 1px solid #ff0000;

/* Opacités arbitraires */
color: rgba(255,255,255,0.65);
```

### ✅ À LA PLACE

```css
/* Tokens sémantiques */
color: var(--text-primary);
background: var(--bg-card);
border: 1px solid var(--color-danger-500);

/* Tokens d'opacité standardisés */
color: var(--text-secondary);  /* 0.72 opacity */
```

---

## 📐 TYPOGRAPHIE

### Tailles

```css
--text-xs: 0.75rem      /* 12px */
--text-sm: 0.875rem     /* 14px */
--text-base: 1rem       /* 16px - par défaut */
--text-lg: 1.125rem     /* 18px */
--text-xl: 1.25rem      /* 20px */
--text-2xl: 1.5rem      /* 24px */
--text-3xl: 1.875rem    /* 30px */
--text-4xl: 2.25rem     /* 36px */
--text-5xl: 3rem        /* 48px */
```

### Weights

```css
--font-regular: 400
--font-medium: 500
--font-semibold: 600
--font-bold: 700
```

---

## 📏 SPACING (8px base)

```css
--space-1: 0.25rem   /* 4px */
--space-2: 0.5rem    /* 8px */
--space-3: 0.75rem   /* 12px */
--space-4: 1rem      /* 16px */
--space-6: 1.5rem    /* 24px */
--space-8: 2rem      /* 32px */
--space-12: 3rem     /* 48px */
```

---

## 🔄 TRANSITIONS

```css
--duration-fast: 120ms
--duration-base: 180ms
--duration-slow: 260ms

--ease-out: cubic-bezier(0.16, 1, 0.3, 1)
--transition-base: var(--duration-base) var(--ease-out)
```

---

## ✅ CHECKLIST MIGRATION

### Pour chaque composant

- [ ] Remplacer `#000`, `#fff`, `black`, `white` par tokens
- [ ] Remplacer `rgba()` arbitraires par `--text-*` / `--bg-*`
- [ ] Utiliser `--metal-accent-500` pour highlights/focus
- [ ] Vérifier contraste texte/fond (AA minimum)
- [ ] Tester hover/active/focus states

### Recherches globales

```bash
# Trouver les couleurs hardcodées
grep -r "color: #" src/
grep -r "background: #" src/
grep -r "rgba(" src/ | grep -v "var(--"

# Trouver les classes problématiques
grep -r "text-black" src/
grep -r "bg-black" src/
```

---

## 📚 RESSOURCES

- **Fichier principal** : `src/styles/titane-design-system-v24.css`
- **Point d'entrée** : `src/main.tsx`
- **Documentation complète** : `DESIGN_SYSTEM_v24_MIGRATION_GUIDE.md`

---

## 🎉 RÉSULTAT

**Design System v24** offre :

- 🔩 **Thème unique** : monochrome métallique, HUD premium
- 👁️ **Lisibilité parfaite** : contraste AA+, texte clair
- ⚡ **Performance** : CSS optimisé, cascade efficace
- 🎨 **Cohérence visuelle** : 3 couleurs, échelle de gris
- ✅ **Compatibilité** : v12 + v20 remappés, zero breaking changes

🔩 **TITANE∞ v24 — MADE WITH PRECISION** 🔩
