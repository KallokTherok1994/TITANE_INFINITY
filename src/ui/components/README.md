# 🎨 TITANE∞ UI Components Library v17.1

**Design System moderne avec primitives UI complètes**

## 📦 Composants Disponibles

### Inputs & Controls

#### **Switch**
Interrupteur on/off avec animations fluides.

```tsx
import { Switch } from '@/ui/components';

<Switch
  checked={isDarkMode}
  onChange={setIsDarkMode}
  label="Mode sombre"
  size="md"
  disabled={false}
/>
```

**Props:**
- `checked?: boolean` - État contrôlé
- `defaultChecked?: boolean` - État par défaut (mode non contrôlé)
- `onChange?: (checked: boolean) => void` - Callback de changement
- `disabled?: boolean` - Désactiver l'interrupteur
- `size?: 'sm' | 'md' | 'lg'` - Taille (sm: 32x18, md: 44x24, lg: 56x30)
- `label?: string` - Label affiché à côté
- `className?: string` - Classes CSS additionnelles

**Features:**
- ✅ Controlled/uncontrolled modes
- ⌨️ Keyboard: Space, Enter
- ♿ ARIA: role="switch", aria-checked
- 🎨 3 sizes avec animations fluides

---

#### **Checkbox**
Case à cocher avec état indéterminé.

```tsx
import { Checkbox } from '@/ui/components';

<Checkbox
  checked={isAccepted}
  onChange={setIsAccepted}
  label="J'accepte les conditions"
  indeterminate={someChecked && !allChecked}
  error="Ce champ est requis"
  size="md"
/>
```

**Props:**
- `checked?: boolean` - État contrôlé
- `defaultChecked?: boolean` - État par défaut
- `onChange?: (checked: boolean) => void` - Callback
- `disabled?: boolean` - Désactiver
- `indeterminate?: boolean` - État indéterminé (-)
- `size?: 'sm' | 'md' | 'lg'` - Taille (sm: 16px, md: 20px, lg: 24px)
- `label?: string` - Label
- `error?: string` - Message d'erreur
- `className?: string` - Classes CSS

**Features:**
- ✅ État indéterminé avec icône ligne
- ✅ Messages d'erreur
- ⌨️ Keyboard: Space
- ♿ ARIA: aria-checked, aria-invalid
- 🎨 SVG icons animés

---

#### **Radio + RadioGroup**
Boutons radio avec gestion de groupe.

```tsx
import { Radio, RadioGroup } from '@/ui/components';

<RadioGroup
  value={theme}
  onChange={setTheme}
  name="theme"
  size="md"
>
  <Radio value="rubis" label="Rubis" />
  <Radio value="saphir" label="Saphir" />
  <Radio value="emeraude" label="Émeraude" />
</RadioGroup>
```

**RadioGroup Props:**
- `value?: string` - Valeur contrôlée
- `defaultValue?: string` - Valeur par défaut
- `onChange?: (value: string) => void` - Callback
- `name: string` - Nom du groupe (requis)
- `disabled?: boolean` - Désactiver tout le groupe
- `size?: 'sm' | 'md' | 'lg'` - Taille appliquée aux enfants
- `children: React.ReactNode` - Composants Radio
- `className?: string` - Classes CSS

**Radio Props:**
- `value: string` - Valeur unique (requis)
- `label?: string` - Label
- `disabled?: boolean` - Désactiver ce radio
- `size?: 'sm' | 'md' | 'lg'` - Taille (sm: 16px, md: 20px, lg: 24px)

**Features:**
- ✅ RadioGroup gère l'état partagé
- ✅ Animation du point (scale 0 → 1)
- ⌨️ Keyboard: Arrow keys dans RadioGroup
- ♿ ARIA: role="radiogroup", role="radio"

---

#### **Textarea**
Zone de texte avec auto-resize et compteur.

```tsx
import { Textarea } from '@/ui/components';

<Textarea
  value={description}
  onChange={setDescription}
  label="Description"
  placeholder="Entrez votre texte..."
  autoResize
  maxLength={500}
  showCount
  helperText="Maximum 500 caractères"
  error={error}
  size="md"
/>
```

**Props:**
- `value?: string` - Texte contrôlé
- `defaultValue?: string` - Texte par défaut
- `onChange?: (value: string) => void` - Callback
- `placeholder?: string` - Placeholder
- `disabled?: boolean` - Désactiver
- `error?: string` - Message d'erreur
- `label?: string` - Label
- `helperText?: string` - Texte d'aide
- `rows?: number` - Nombre de lignes (défaut: 4)
- `autoResize?: boolean` - Auto-resize avec scrollHeight
- `maxLength?: number` - Limite de caractères
- `showCount?: boolean` - Afficher compteur
- `size?: 'sm' | 'md' | 'lg'` - Taille
- `className?: string` - Classes CSS

**Features:**
- ✅ Auto-resize dynamique
- ✅ Compteur de caractères (123/500)
- ✅ Validation avec maxLength
- ♿ ARIA: aria-invalid, aria-describedby

---

#### **Slider**
Curseur de valeur avec marks.

```tsx
import { Slider } from '@/ui/components';
import type { SliderMark } from '@/ui/components';

const marks: SliderMark[] = [
  { value: 0, label: '0%' },
  { value: 50, label: '50%' },
  { value: 100, label: '100%' },
];

<Slider
  value={volume}
  onChange={setVolume}
  min={0}
  max={100}
  step={1}
  label="Volume"
  showValue
  showMarks
  marks={marks}
  onChangeCommitted={(value) => console.log('Final:', value)}
  size="md"
/>
```

**Props:**
- `value?: number` - Valeur contrôlée
- `defaultValue?: number` - Valeur par défaut
- `min?: number` - Minimum (défaut: 0)
- `max?: number` - Maximum (défaut: 100)
- `step?: number` - Incrément (défaut: 1)
- `onChange?: (value: number) => void` - Callback pendant drag
- `onChangeCommitted?: (value: number) => void` - Callback fin drag
- `disabled?: boolean` - Désactiver
- `label?: string` - Label
- `showValue?: boolean` - Afficher valeur (défaut: true)
- `showMarks?: boolean` - Afficher marks
- `marks?: SliderMark[]` - Marks personnalisés ou auto-générés
- `size?: 'sm' | 'md' | 'lg'` - Taille (sm: 4px, md: 6px, lg: 8px track)
- `className?: string` - Classes CSS

**SliderMark Type:**
```typescript
type SliderMark = {
  value: number;
  label?: string;
};
```

**Features:**
- ✅ Mouse drag + keyboard navigation
- ⌨️ Keyboard: Arrow keys, Home, End
- ✅ Marks custom ou auto (every 10 steps)
- ✅ Thumb hover scale (1.1x)
- ♿ ARIA: role="slider", aria-valuemin/max/now
- 🎨 Cursors: grab/grabbing

---

#### **Select**
Dropdown avec recherche et keyboard.

```tsx
import { Select } from '@/ui/components';
import type { SelectOption } from '@/ui/components';

const options: SelectOption[] = [
  { value: 'fr', label: 'France' },
  { value: 'us', label: 'États-Unis' },
  { value: 'uk', label: 'Royaume-Uni', disabled: true },
];

<Select
  value={country}
  onChange={setCountry}
  options={options}
  label="Pays"
  searchable
  placeholder="Sélectionner..."
  helperText="Recherchez ou sélectionnez"
  error={error}
  size="md"
/>
```

**Props:**
- `value?: string` - Valeur contrôlée
- `defaultValue?: string` - Valeur par défaut
- `onChange?: (value: string) => void` - Callback
- `options: SelectOption[]` - Liste des options (requis)
- `placeholder?: string` - Placeholder (défaut: "Sélectionner...")
- `disabled?: boolean` - Désactiver
- `error?: string` - Message d'erreur
- `label?: string` - Label
- `helperText?: string` - Texte d'aide
- `size?: 'sm' | 'md' | 'lg'` - Taille (sm: 32px, md: 40px, lg: 48px)
- `searchable?: boolean` - Activer recherche
- `className?: string` - Classes CSS

**SelectOption Type:**
```typescript
type SelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
};
```

**Features:**
- ✅ Recherche avec filtre live
- ⌨️ Keyboard: Arrow Up/Down, Enter, Escape
- ✅ Outside click detection
- ✅ Focus tracking avec scrollIntoView
- ✅ Empty state UI
- ✅ Checkmark sur sélection
- ♿ ARIA: role="button", aria-haspopup="listbox"
- 🎨 Animation dropdown (fadeIn 120ms)

---

#### **Toggle**
Groupe de boutons (alternative à Radio).

```tsx
import { Toggle } from '@/ui/components';
import type { ToggleOption } from '@/ui/components';

const viewOptions: ToggleOption[] = [
  { value: 'grid', label: 'Grille', icon: <GridIcon /> },
  { value: 'list', label: 'Liste', icon: <ListIcon /> },
  { value: 'compact', label: 'Compact', disabled: true },
];

<Toggle
  value={view}
  onChange={setView}
  options={viewOptions}
  variant="pills"
  fullWidth
  size="md"
/>
```

**Props:**
- `value?: string` - Valeur contrôlée
- `defaultValue?: string` - Valeur par défaut
- `onChange?: (value: string) => void` - Callback
- `options: ToggleOption[]` - Liste des options (requis)
- `disabled?: boolean` - Désactiver tout
- `size?: 'sm' | 'md' | 'lg'` - Taille (sm: 28px, md: 36px, lg: 44px)
- `variant?: 'default' | 'pills'` - Style (default: contained, pills: separated)
- `fullWidth?: boolean` - Prendre toute la largeur
- `className?: string` - Classes CSS

**ToggleOption Type:**
```typescript
type ToggleOption = {
  value: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
};
```

**Features:**
- ✅ 2 variants: default (contained) + pills (séparés)
- ✅ Icons support par option
- ✅ Full-width mode (flex: 1)
- ✅ Disabled par option
- ⌨️ Keyboard: Tab, Space, Enter
- ♿ ARIA: role="tab", role="tablist"
- 🎨 Selected state avec shadow

---

### Buttons

#### **Button**
Bouton avec 6 variants.

```tsx
import { Button } from '@/ui/components';

<Button
  variant="primary"
  size="md"
  leftIcon="🚀"
  rightIcon="→"
  onClick={handleClick}
  loading={isLoading}
  disabled={false}
>
  Action
</Button>
```

**Variants:** `primary`, `secondary`, `ghost`, `danger`, `glass`, `subtle`  
**Sizes:** `sm` (32px), `md` (40px), `lg` (48px)

---

## 🎨 Design Tokens

Tous les composants utilisent les design tokens centralisés:

```css
/* Colors */
--neutral-0 à --neutral-100 (palette neutre)
--primary-main, --primary-light, --primary-dark

/* Spacing */
--space-1 (4px) à --space-9 (72px)

/* Radius */
--radius-sm (6px), --radius-md (10px), --radius-lg (16px), --radius-full

/* Typography */
--font-size-tiny, --font-size-small, --font-size-body, --font-size-h5
```

---

## ♿ Accessibilité

- ✅ **WCAG AA** compliant
- ⌨️ **Keyboard navigation** complète
- 🔊 **Screen reader** support (ARIA)
- 🎯 **Focus visible** (2px outline)
- 🎬 **Reduced motion** support

---

## 🚀 Usage Global

```tsx
// Import simple
import { Switch, Checkbox, Radio, RadioGroup } from '@/ui/components';

// Import avec types
import type { SelectOption, ToggleOption, SliderMark } from '@/ui/components';

// Controlled mode
const [value, setValue] = useState('initial');
<Component value={value} onChange={setValue} />

// Uncontrolled mode
<Component defaultValue="initial" />
```

---

## 📊 Stats

- **7 composants** (2,177 lignes)
- **14 fichiers** (TSX + CSS)
- **TypeScript strict**: 0 errors ✅
- **ESLint**: 0 warnings ✅
- **Design tokens**: 100% cohérence

---

## 🎯 Demo

Visitez `/design-system` dans l'application pour voir tous les composants en action avec exemples interactifs.

---

**TITANE∞ v17.1** - Design System Professionnel  
*Clarté • Fluidité • Élégance*
