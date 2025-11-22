# ⚡ TITANE∞ Design System v17.1 - Quick Start

**5 minutes pour démarrer avec les nouveaux composants**

---

## 🚀 Installation

```bash
# Déjà fait si projet à jour
./pnpm-host.sh install
```

---

## 📦 Import

```tsx
// Composants
import {
  Switch,
  Checkbox,
  Radio,
  RadioGroup,
  Textarea,
  Slider,
  Select,
  Toggle
} from '@/ui/components';

// Types (optionnel)
import type {
  SelectOption,
  ToggleOption,
  SliderMark
} from '@/ui/components';
```

---

## 🎯 Examples Ultra-Rapides

### Switch (Toggle on/off)

```tsx
const [enabled, setEnabled] = useState(false);

<Switch
  checked={enabled}
  onChange={setEnabled}
  label="Enable feature"
/>
```

### Checkbox

```tsx
const [accepted, setAccepted] = useState(false);

<Checkbox
  checked={accepted}
  onChange={setAccepted}
  label="I accept terms"
  error={!accepted ? "Required" : undefined}
/>
```

### Radio + RadioGroup

```tsx
const [theme, setTheme] = useState('light');

<RadioGroup value={theme} onChange={setTheme} name="theme">
  <Radio value="light" label="Light" />
  <Radio value="dark" label="Dark" />
  <Radio value="auto" label="Auto" />
</RadioGroup>
```

### Textarea

```tsx
const [text, setText] = useState('');

<Textarea
  value={text}
  onChange={setText}
  placeholder="Enter text..."
  maxLength={500}
  showCount
  autoResize
/>
```

### Slider

```tsx
const [volume, setVolume] = useState(70);

<Slider
  value={volume}
  onChange={setVolume}
  min={0}
  max={100}
  label="Volume"
  showValue
/>
```

### Select

```tsx
const [country, setCountry] = useState('fr');

<Select
  value={country}
  onChange={setCountry}
  options={[
    { value: 'fr', label: 'France' },
    { value: 'us', label: 'USA' },
  ]}
  searchable
/>
```

### Toggle

```tsx
const [view, setView] = useState('grid');

<Toggle
  value={view}
  onChange={setView}
  options={[
    { value: 'grid', label: 'Grid' },
    { value: 'list', label: 'List' },
  ]}
  variant="pills"
/>
```

---

## 🎨 Sizes

Tous les composants supportent 3 sizes:

```tsx
<Component size="sm" />  // Small
<Component size="md" />  // Medium (défaut)
<Component size="lg" />  // Large
```

---

## 🎯 Controlled vs Uncontrolled

### Controlled (recommandé)

```tsx
const [value, setValue] = useState('initial');
<Component value={value} onChange={setValue} />
```

### Uncontrolled

```tsx
<Component defaultValue="initial" />
```

---

## 🎨 Design Tokens (CSS)

```css
/* Colors */
var(--neutral-0)   /* Blanc */
var(--neutral-50)  /* Gris moyen */
var(--neutral-90)  /* Presque noir */
var(--primary-main)

/* Spacing */
var(--space-2)  /* 8px */
var(--space-3)  /* 12px */
var(--space-4)  /* 16px */

/* Radius */
var(--radius-sm)  /* 6px */
var(--radius-md)  /* 10px */
var(--radius-lg)  /* 16px */
```

---

## ⌨️ Keyboard Navigation

| Composant | Keys |
|-----------|------|
| Switch | Space, Enter |
| Checkbox | Space |
| Radio | Arrow keys |
| Slider | Arrow keys, Home, End |
| Select | Arrow Up/Down, Enter, Escape |
| Toggle | Space, Enter |

---

## 🎯 Demo Interactive

```bash
# Lancer l'app
./pnpm-host.sh run dev

# Naviguer vers
http://localhost:5173/design-system
```

**9 sections** avec tous les composants testables en live!

---

## 📚 Documentation Complète

| File | Usage |
|------|-------|
| `src/ui/components/README.md` | Props détaillées + exemples |
| `DESIGN_SYSTEM_GUIDE.md` | Concepts + tokens |
| `MIGRATION_GUIDE_v17.1.md` | Avant/Après exemples |

---

## ✅ Validation

```bash
# TypeScript
./pnpm-host.sh run type-check

# ESLint
./pnpm-host.sh exec eslint src/ui/components --quiet
```

---

## 🚀 C'est Tout!

**3 étapes:**
1. Import components
2. Use with `value` + `onChange`
3. Enjoy! 🎉

**Full guide**: `src/ui/components/README.md` (11KB, tous les détails)

---

**TITANE∞ v17.1.1** - Design System Ready in 5 Minutes ⚡
