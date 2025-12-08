# 🔩 TITANE∞ METAL — QUICK REFERENCE

Référence rapide des tokens CSS et couleurs du thème métallique.

---

## 🎨 COULEURS DE BASE

```css
--titane-metal-primary: #727b81      /* Métal chaud */
--titane-metal-secondary: #c4c4c4    /* Silver Bullet */
--titane-metal-accent: #93b399       /* Accent organique */
```

---

## 📐 PALETTES (10 NUANCES)

### Primaire (métal)
```css
--color-primary-50:  #e3e5e7
--color-primary-500: #727b81  /* PIVOT */
--color-primary-900: #2f3335
```

### Secondaire (silver)
```css
--color-secondary-50:  #f3f3f3
--color-secondary-300: #c4c4c4  /* SILVER BULLET */
--color-secondary-900: #5c5c5c
```

### Accent (organique)
```css
--color-accent-50:  #eef5f0
--color-accent-500: #93b399  /* PIVOT */
--color-accent-900: #435a49
```

---

## 🌑 BACKGROUNDS

```css
--bg-base:     #050607
--bg-elevated: #0b0d0f
--bg-panel:    #101216
--bg-card:     #14181d
--bg-surface:  #181c21
--bg-hover:    rgba(255,255,255,0.04)
--bg-active:   rgba(255,255,255,0.08)
```

---

## 🔲 BORDURES

```css
--border-subtle:  rgba(255,255,255,0.04)
--border-default: rgba(255,255,255,0.10)
--border-strong:  rgba(255,255,255,0.18)
--border-accent:  #727b81
--border-focus:   #93b399
```

---

## 📝 TEXTE

```css
--text-primary:   rgba(255,255,255,0.96)
--text-secondary: rgba(255,255,255,0.72)
--text-tertiary:  rgba(255,255,255,0.48)
--text-disabled:  rgba(255,255,255,0.30)
--text-inverse:   #050607
```

---

## ✨ EFFETS

```css
--glass-bg:     rgba(20,24,29,0.85)
--glass-border: rgba(196,196,196,0.12)
--glow-primary: rgba(114,123,129,0.3)
--glow-accent:  rgba(147,179,153,0.25)
--glow-subtle:  rgba(255,255,255,0.08)
```

---

## 🎯 ÉTATS SÉMANTIQUES

```css
--color-success-500: #93b399  /* Organique */
--color-warning-500: #c4c4c4  /* Silver */
--color-danger-500:  #8b5f5f  /* Rouillé */
--color-info-500:    #727b81  /* Métal */
```

---

## 🔤 THÈMES REMAPPÉS

```css
/* Rubis (erreurs) → rouillé */
--titane-rubis-500: #8b5f5f

/* Émeraude (succès) → organique */
--titane-emeraude-500: #93b399

/* Saphir (info) → métal */
--titane-saphir-500: #727b81

/* Diamant (surfaces) → silver */
--titane-diamant-400: #c4c4c4
```

---

## 🎨 CLASSES UTILITAIRES

```css
.panel-metal     /* Panel vitré métallique */
.metal-surface   /* Surface brossée */
.accent-line     /* Liseré lumineux */
.glow-metal      /* Glow métal doux */
.glow-organic    /* Glow accent organique */
```

---

## 📋 PATTERNS COURANTS

### Carte standard
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
  box-shadow: 0 0 0 3px var(--glow-accent);
}
```

### Bouton primaire
```css
.btn-primary {
  background: linear-gradient(135deg,
    var(--color-primary-500),
    var(--color-accent-500));
  color: var(--text-primary);
}
```

---

## 🚫 À ÉVITER

```css
/* ❌ MAUVAIS */
color: #000000;
background: rgba(255,255,255,0.65);

/* ✅ BON */
color: var(--text-primary);
background: var(--text-secondary);
```

---

## 📚 DOCUMENTATION COMPLÈTE

- `MIGRATION_THEME_METAL_v17.4.0.md`
- `THEME_METAL_GUIDE_UTILISATION.md`

🔩 **TITANE∞ METAL v17.4.0**
