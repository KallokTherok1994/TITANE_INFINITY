# 🎨 TITANE∞ v∞ — Design System DS_MONOCHROME — Audit Guide

## 📋 Objectif
Valider et harmoniser le Design System monochrome-métallique sur l'ensemble du projet.

---

## 🎨 Palette Officielle

### Couleurs Primaires:
```css
--metal-dark: #727b81;      /* Métal sombre */
--metal-light: #c4c4c4;     /* Argent (Behr Silver Bullet) */
--metal-green: #93b399;     /* Vert-gris métallique */
```

### Backgrounds:
```css
--bg-primary: #111416;      /* Fond profond métallisé */
--bg-secondary: #1a1d20;    /* Variation chaude */
--bg-panel: rgba(255,255,255,0.03);  /* Panels glassmorphism */
```

### Textes:
```css
--text-primary: #e5e5e5;    /* Texte principal */
--text-secondary: #b5b5b5;  /* Texte secondaire */
--text-accent: #c4c4c4;     /* Texte accentué */
```

### Borders:
```css
--border-soft: rgba(255,255,255,0.08);    /* Bordures subtiles */
--border-strong: rgba(255,255,255,0.15);  /* Bordures fortes */
```

### Shadows & Glows:
```css
--shadow-glow: 0 0 8px rgba(147,179,153,0.20);       /* Glow vert-gris */
--shadow-strong: 0 0 20px rgba(196,196,196,0.25);    /* Glow argent */
--accent-glow: 0 0 8px rgba(147,179,153,0.55);       /* Glow accent */
```

---

## ✅ Checklist d'Audit

### 1. Variables CSS
- [ ] Toutes les variables définies dans `:root`
- [ ] Aucune couleur hors palette (rubis, saphir, émeraude, diamant)
- [ ] Variations RGBA correctement définies
- [ ] Nomenclature cohérente

### 2. Composants Globaux

#### Buttons:
```css
✅ Primary: bg-[#727b81] hover:bg-[#93b399]
✅ Secondary: bg-[rgba(255,255,255,0.05)] border hover:border-[#93b399]
✅ Danger: bg-red-600 (uniquement pour actions critiques)
```

#### Cards:
```css
✅ Background: bg-[rgba(255,255,255,0.03)]
✅ Backdrop: backdrop-blur-xl
✅ Border: border-[rgba(255,255,255,0.08)]
✅ Radius: rounded-xl (12px)
✅ Padding: p-6 (24px standard)
```

#### Inputs:
```css
✅ Background: bg-[rgba(255,255,255,0.05)]
✅ Border: border-[rgba(255,255,255,0.08)]
✅ Focus: border-[#93b399] with glow
✅ Text: text-[#e5e5e5]
```

#### Scrollbars:
```css
✅ Width: 8px
✅ Thumb: bg metal-dark-60
✅ Hover: bg metal-green-60
✅ Border-radius: 50px
```

### 3. Typography

#### Headers:
```css
H1: text-3xl (30px), font-bold, text-[#c4c4c4], tracking-wide
H2: text-2xl (24px), font-semibold, text-[#c4c4c4]
H3: text-xl (20px), font-semibold, text-[#c4c4c4]
```

#### Body:
```css
Primary: text-base (16px), text-[#e5e5e5]
Secondary: text-sm (14px), text-[#b5b5b5]
Small: text-xs (12px), text-[#b5b5b5]
```

### 4. Layout

#### Spacing:
```css
Section padding: p-6 (24px)
Gap: gap-4 (16px) ou gap-6 (24px)
Margin bottom: mb-8 (32px) entre sections
```

#### Grid:
```css
Stats: grid-cols-1 md:grid-cols-3 gap-4
Cards: grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6
```

### 5. Animations

#### Pulse (badges, notifications):
```css
@keyframes titane-pulse {
  0%   { box-shadow: 0 0 4px var(--metal-green-40); }
  50%  { box-shadow: 0 0 10px var(--metal-green-60); }
  100% { box-shadow: 0 0 4px var(--metal-green-40); }
}
animation: titane-pulse 2.6s infinite ease-in-out;
```

#### Spin (loading):
```css
.animate-spin { animation: spin 1s linear infinite; }
```

### 6. Contrastes WCAG

#### Ratios Minimum:
- Text primary / bg: >4.5:1 (AA normal)
- Text secondary / bg: >3:1 (AA large)
- Interactive elements: >3:1 (AA)

#### Vérifications:
```bash
# Avec Chrome DevTools > Lighthouse > Accessibility
```

---

## 🔧 Corrections Communes

### Problème 1: Texte noir sur fond sombre
```css
❌ color: #000000; background: #111416;
✅ color: #e5e5e5; background: #111416;
```

### Problème 2: Couleurs obsolètes
```css
❌ bg-purple-600, text-blue-500, border-red-400
✅ Uniquement palette metal (#727b81, #c4c4c4, #93b399)
```

### Problème 3: Animations non animables
```css
❌ transition: color 0.3s;  /* Sur propriété non animable */
✅ transition: background-color 0.3s, border-color 0.3s;
```

### Problème 4: Glassmorphism incomplet
```css
❌ background: rgba(255,255,255,0.03);
✅ background: rgba(255,255,255,0.03); backdrop-filter: blur(12px);
```

---

## 📊 Audit Fichier par Fichier

### global.css
```bash
1. Vérifier :root variables
2. Supprimer classes obsolètes (thèmes v12/v20)
3. Harmoniser scrollbars
4. Valider animations
5. Optimiser cascade CSS
```

### App.tsx
```bash
1. Sidebar: couleurs, hover states
2. Header: XP bar, logo glow
3. Navigation: active state highlight
4. Background: gradient cohérent
```

### Dashboards (tous)
```bash
1. Header consistency
2. Stat cards uniformes
3. Buttons standardisés
4. Loading states
5. Error states
6. Responsive breakpoints
```

---

## 🚀 Validation Finale

### Tests Manuels:
1. [ ] Parcourir toutes les pages
2. [ ] Tester tous les buttons (hover, active, disabled)
3. [ ] Vérifier inputs (focus, disabled, error)
4. [ ] Valider scrollbars
5. [ ] Tester responsive (mobile, tablet, desktop)
6. [ ] Vérifier animations (smooth, pas de jank)

### Tests Automatiques:
```bash
# Lighthouse Accessibility
pnpm tauri dev
# → Open DevTools → Lighthouse → Accessibility > 95

# Contraste
# → Chrome DevTools → Accessibility → Contrast Ratio Check
```

### Performance:
```bash
# Bundle size
pnpm build
# → Vérifier dist/assets/*.js < 1MB

# Frame rate
# → DevTools → Performance → Record → Vérifier 60fps
```

---

## 📝 Rapport d'Audit (Template)

```markdown
# Design System Audit Report

Date: [DATE]
Version: TITANE∞ v∞

## Palette
- ✅ Variables définies
- ✅ Couleurs obsolètes supprimées
- ⚠️ [Issues trouvés]

## Composants
- ✅ Buttons harmonisés
- ✅ Cards standardisées
- ✅ Inputs cohérents
- ⚠️ [Issues trouvés]

## Contrastes
- ✅ AA compliance: 100%
- ⚠️ [Issues trouvés]

## Performance
- ✅ Bundle: [SIZE]
- ✅ Frame rate: 60fps
- ⚠️ [Issues trouvés]

## Recommandations
1. [Recommandation 1]
2. [Recommandation 2]
...
```

---

## 🎯 Objectif Final

**Le Design System doit être:**
- ✅ 100% monochrome métallique
- ✅ Cohérent sur toutes les pages
- ✅ Accessible (WCAG AA)
- ✅ Performant (60fps, bundle optimisé)
- ✅ Responsive (mobile-first)
- ✅ Élégant, technologique, futuriste

---

**Fin du guide d'audit — TITANE∞ v∞ DS_MONOCHROME**

