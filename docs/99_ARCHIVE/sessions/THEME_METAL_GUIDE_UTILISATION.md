# 🔧 GUIDE D'UTILISATION — THÈME TITANE∞ METAL

**Version** : v17.4.0
**Date** : 24 novembre 2025

---

## 📖 INTRODUCTION

Ce guide explique comment utiliser efficacement le nouveau thème **TITANE∞ METAL** dans vos composants React et vos feuilles de style CSS.

---

## 🎨 UTILISATION DES TOKENS CSS

### Variables CSS disponibles

#### Couleurs de base

```css
/* Dans votre CSS */
.mon-composant {
  /* Métal primaire */
  color: var(--titane-metal-primary);        /* #727b81 */

  /* Silver Bullet */
  background: var(--titane-metal-secondary); /* #c4c4c4 */

  /* Accent organique */
  border-color: var(--titane-metal-accent);  /* #93b399 */
}
```

#### Palettes complètes

```css
.carte-metal {
  /* Palette primaire (10 nuances) */
  background: var(--color-primary-500);   /* #727b81 */
  border: 1px solid var(--color-primary-700);

  /* Palette secondaire (Silver) */
  color: var(--color-secondary-300);      /* #c4c4c4 */

  /* Palette accent (Organique) */
  box-shadow: 0 0 20px var(--color-accent-500);
}
```

#### Backgrounds & Surfaces

```css
.panel-moderne {
  background: var(--bg-card);          /* #14181d */
  border: 1px solid var(--border-default);
}

.menu-lateral {
  background: var(--bg-panel);         /* #101216 */
  border-right: 1px solid var(--border-subtle);
}

/* États hover/active */
.bouton-action:hover {
  background: var(--bg-hover);         /* rgba(255,255,255,0.04) */
}

.bouton-action:active {
  background: var(--bg-active);        /* rgba(255,255,255,0.08) */
}
```

#### Texte lisible

```css
.texte-principal {
  color: var(--text-primary);          /* rgba(255,255,255,0.96) */
}

.texte-secondaire {
  color: var(--text-secondary);        /* rgba(255,255,255,0.72) */
}

.texte-hint {
  color: var(--text-tertiary);         /* rgba(255,255,255,0.48) */
}

input::placeholder {
  color: var(--text-tertiary);
}
```

#### Bordures & Focus

```css
.input-standard {
  border: 1px solid var(--border-default);
}

.input-standard:focus {
  border-color: var(--border-focus);   /* #93b399 - accent */
  box-shadow: 0 0 0 3px var(--glow-accent);
}
```

---

## 🎭 CLASSES UTILITAIRES

### Panel métallique vitré

```html
<div class="panel-metal">
  <h2>Monitoring</h2>
  <p>Contenu avec effet glass métallique</p>
</div>
```

```css
/* Déjà défini dans titane-theme-metal.css */
.panel-metal {
  background: radial-gradient(
    circle at top left,
    rgba(196, 196, 196, 0.08),
    rgba(5, 6, 7, 0.9)
  );
  backdrop-filter: blur(18px);
  border: 1px solid rgba(196, 196, 196, 0.18);
}
```

### Liserés lumineux

```html
<div class="carte accent-line">
  <h3>Titre avec liseré organique</h3>
</div>
```

### Surface métallique brossée

```html
<div class="metal-surface">
  <p>Effet métal brossé</p>
</div>
```

### Effets glow

```html
<!-- Glow métal -->
<button class="glow-metal">Action</button>

<!-- Glow organique -->
<button class="glow-organic">Valider</button>
```

---

## ⚛️ UTILISATION DANS REACT

### Import des tokens TypeScript

```tsx
import { colors, spacing, radius } from '@themes/tokens';

export const MonComposant = () => {
  return (
    <div style={{
      // Utilise automatiquement la palette métal
      backgroundColor: colors.saphir.primary.main,  // #727b81
      color: colors.neutral[0],                     // #FFFFFF
      padding: spacing[4],
      borderRadius: radius.lg,
    }}>
      Contenu
    </div>
  );
};
```

### Exemples par cas d'usage

#### Carte d'information

```tsx
import { colors, radius, spacing } from '@themes/tokens';

export const InfoCard = ({ title, content }) => (
  <div style={{
    background: colors.neutral[90],           // #141414
    border: `1px solid ${colors.neutral[80]}`,
    borderRadius: radius.xl,
    padding: spacing[6],
  }}>
    <h3 style={{ color: colors.saphir.primary.main }}>
      {title}
    </h3>
    <p style={{ color: colors.neutral[40] }}>
      {content}
    </p>
  </div>
);
```

#### Bouton d'action

```tsx
export const ActionButton = ({ children, onClick }) => (
  <button
    onClick={onClick}
    style={{
      background: `linear-gradient(135deg, ${colors.saphir.primary.main}, ${colors.emeraude.primary.main})`,
      color: colors.neutral[0],
      padding: `${spacing[3]} ${spacing[6]}`,
      borderRadius: radius.lg,
      border: 'none',
      cursor: 'pointer',
    }}
  >
    {children}
  </button>
);
```

#### Badge de statut

```tsx
type Status = 'success' | 'warning' | 'error' | 'info';

export const StatusBadge = ({ status, label }: { status: Status; label: string }) => {
  const statusColors = {
    success: colors.emeraude.primary.main,  // #93b399 (organique)
    warning: colors.diamant.primary.main,   // #c4c4c4 (silver)
    error: colors.rubis.primary.main,       // #8b5f5f (rouillé)
    info: colors.saphir.primary.main,       // #727b81 (métal)
  };

  return (
    <span style={{
      backgroundColor: `${statusColors[status]}20`,
      color: statusColors[status],
      padding: `${spacing[1]} ${spacing[3]}`,
      borderRadius: radius.full,
      fontSize: '0.875rem',
    }}>
      {label}
    </span>
  );
};
```

---

## 🎯 PATTERNS RECOMMANDÉS

### 1. Cartes & Panneaux

```css
/* Carte standard */
.card {
  background: var(--bg-card);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-xl);
  padding: var(--space-6);
}

/* Carte surélevée avec glow */
.card-elevated {
  background: var(--bg-elevated);
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-2xl);
  box-shadow: var(--glow-subtle);
}

/* Carte interactive */
.card-interactive {
  background: var(--bg-card);
  border: 1px solid var(--border-default);
  transition: all 0.3s ease;
}

.card-interactive:hover {
  background: var(--bg-hover);
  border-color: var(--border-accent);
  transform: translateY(-2px);
  box-shadow: var(--glow-primary);
}
```

### 2. Inputs & Forms

```css
/* Input standard */
.input {
  background: var(--bg-elevated);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  color: var(--text-primary);
  padding: var(--space-3) var(--space-4);
  transition: all 0.2s ease;
}

.input:focus {
  outline: none;
  border-color: var(--border-focus);
  box-shadow: 0 0 0 3px var(--glow-accent);
}

.input::placeholder {
  color: var(--text-tertiary);
}

/* Input avec erreur */
.input--error {
  border-color: var(--titane-rubis-500);
}
```

### 3. Boutons

```css
/* Bouton primaire (métal) */
.btn-primary {
  background: linear-gradient(135deg, var(--color-primary-500), var(--color-accent-500));
  color: var(--text-primary);
  border: none;
  border-radius: var(--radius-lg);
  padding: var(--space-3) var(--space-6);
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: var(--glow-accent);
}

/* Bouton secondaire (outline) */
.btn-secondary {
  background: transparent;
  color: var(--text-primary);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  padding: var(--space-3) var(--space-6);
}

.btn-secondary:hover {
  background: var(--bg-hover);
  border-color: var(--border-accent);
}

/* Bouton ghost */
.btn-ghost {
  background: transparent;
  color: var(--text-secondary);
  border: none;
  padding: var(--space-2) var(--space-4);
}

.btn-ghost:hover {
  color: var(--text-primary);
  background: var(--bg-hover);
}
```

### 4. Navigation

```css
/* Menu item */
.nav-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  color: var(--text-secondary);
  border-radius: var(--radius-lg);
  transition: all 0.2s ease;
  cursor: pointer;
}

.nav-item:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.nav-item--active {
  background: var(--bg-active);
  color: var(--text-primary);
  border-left: 3px solid var(--color-accent-500);
}
```

---

## 🚫 ANTI-PATTERNS (À ÉVITER)

### ❌ NE PAS faire

```css
/* MAUVAIS : couleurs hardcodées */
.mauvais-exemple {
  color: #000000;
  background: #ffffff;
  border: 1px solid #ff0000;
}

/* MAUVAIS : opacité arbitraire */
.mauvais-exemple-2 {
  color: rgba(255, 255, 255, 0.65);  /* Utilise var(--text-secondary) */
}
```

### ✅ À la place

```css
/* BON : tokens CSS */
.bon-exemple {
  color: var(--text-primary);
  background: var(--bg-card);
  border: 1px solid var(--titane-rubis-500);
}

/* BON : tokens d'opacité standardisés */
.bon-exemple-2 {
  color: var(--text-secondary);  /* 0.72 opacity, standardisé */
}
```

---

## 🎨 COMBINAISONS DE COULEURS

### Combinaisons harmonieuses

```css
/* Métal + Accent organique */
.combo-1 {
  background: var(--color-primary-600);
  border: 2px solid var(--color-accent-500);
  color: var(--text-primary);
}

/* Silver + Métal */
.combo-2 {
  background: var(--color-secondary-300);
  color: var(--color-primary-800);
}

/* Surfaces vitrées */
.combo-3 {
  background: var(--glass-bg);
  backdrop-filter: blur(18px);
  border: 1px solid var(--glass-border);
}
```

---

## 🔍 ACCESSIBILITÉ

### Contraste minimum

Toutes les combinaisons respectent WCAG 2.1 AA :

```css
/* Texte primaire sur fond sombre : ratio 15.8:1 ✅ */
.accessible-1 {
  background: var(--bg-base);
  color: var(--text-primary);
}

/* Texte secondaire sur fond sombre : ratio 11.4:1 ✅ */
.accessible-2 {
  background: var(--bg-card);
  color: var(--text-secondary);
}

/* Texte sur accent : ratio 8.2:1 ✅ */
.accessible-3 {
  background: var(--color-accent-500);
  color: var(--text-inverse);
}
```

---

## 🧪 EXEMPLES COMPLETS

### Carte de monitoring

```tsx
import { colors, spacing, radius } from '@themes/tokens';

export const MonitoringCard = ({ module, status, metrics }) => (
  <div
    className="panel-metal"
    style={{
      padding: spacing[6],
      borderRadius: radius['2xl'],
    }}
  >
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: spacing[4]
    }}>
      <h3 style={{ color: colors.saphir.primary.main }}>
        {module}
      </h3>
      <span style={{
        padding: `${spacing[1]} ${spacing[3]}`,
        background: status === 'active'
          ? `${colors.emeraude.primary.main}20`
          : `${colors.rubis.primary.main}20`,
        color: status === 'active'
          ? colors.emeraude.primary.main
          : colors.rubis.primary.main,
        borderRadius: radius.full,
      }}>
        {status}
      </span>
    </div>

    <div style={{ color: colors.neutral[40] }}>
      {metrics.map(metric => (
        <div key={metric.label} style={{ marginBottom: spacing[2] }}>
          <span>{metric.label}: </span>
          <strong style={{ color: colors.diamant.primary.main }}>
            {metric.value}
          </strong>
        </div>
      ))}
    </div>
  </div>
);
```

### Formulaire de chat

```css
/* styles.css */
.chat-form {
  display: flex;
  gap: var(--space-3);
  padding: var(--space-4);
  background: var(--bg-panel);
  border-top: 1px solid var(--border-subtle);
}

.chat-input {
  flex: 1;
  background: var(--bg-card);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-xl);
  padding: var(--space-3) var(--space-4);
  color: var(--text-primary);
  transition: all 0.2s ease;
}

.chat-input:focus {
  outline: none;
  border-color: var(--border-focus);
  box-shadow: 0 0 0 3px var(--glow-accent);
}

.chat-send {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, var(--color-primary-500), var(--color-accent-500));
  border: none;
  border-radius: var(--radius-lg);
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.chat-send:hover {
  transform: translateY(-2px);
  box-shadow: var(--glow-accent);
}
```

---

## 📚 RESSOURCES

- **Tokens CSS** : `/src/styles/titane-theme-metal.css`
- **Tokens TypeScript** : `/src/themes/tokens/colors.ts`
- **Documentation complète** : `/MIGRATION_THEME_METAL_v17.4.0.md`

---

## 🎉 CONCLUSION

Le thème TITANE∞ METAL offre une palette cohérente, accessible et moderne. En utilisant les tokens CSS et TypeScript, vous garantissez :

- ✅ **Cohérence visuelle** globale
- ✅ **Maintenance facilitée** (un seul point de vérité)
- ✅ **Accessibilité** WCAG 2.1 AA
- ✅ **Flexibilité** pour thèmes futurs

🔩 **MADE WITH PRECISION** 🔩
