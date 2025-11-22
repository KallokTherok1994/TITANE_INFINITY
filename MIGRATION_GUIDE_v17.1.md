# 🔄 Migration Guide: Design System v17.1

**Guide complet pour migrer vers les nouveaux composants UI**

## 📋 Table des Matières

1. [Vue d'ensemble](#vue-densemble)
2. [Breaking Changes](#breaking-changes)
3. [Nouveaux Composants](#nouveaux-composants)
4. [Migration par Composant](#migration-par-composant)
5. [Design Tokens](#design-tokens)
6. [Exemples de Migration](#exemples-de-migration)
7. [Checklist](#checklist)

---

## Vue d'ensemble

**v17.1** introduit 7 nouveaux composants primitifs avec:
- ✅ Design tokens centralisés
- ✅ Accessibilité WCAG AA
- ✅ Animations organiques (180ms cubic-bezier)
- ✅ Keyboard navigation complète
- ✅ TypeScript strict

**Compatibilité:**
- ✅ Les anciens composants restent fonctionnels
- ✅ Migration progressive possible
- ✅ Pas de breaking changes sur les composants existants

---

## Breaking Changes

### ❌ Aucun Breaking Change

Tous les nouveaux composants sont **additifs**. Les composants existants (Button, Card, Input, Panel, etc.) continuent de fonctionner normalement.

**Migration recommandée** mais **non obligatoire**.

---

## Nouveaux Composants

| Composant | Remplace | Status |
|-----------|----------|--------|
| **Switch** | Custom toggle | ✅ Nouveau |
| **Checkbox** | Input checkbox | ✅ Nouveau |
| **Radio** | Input radio | ✅ Nouveau |
| **RadioGroup** | - | ✅ Nouveau |
| **Textarea** | - | ✅ Nouveau |
| **Slider** | - | ✅ Nouveau |
| **Select** | - | ✅ Nouveau |
| **Toggle** | - | ✅ Nouveau |

---

## Migration par Composant

### 1. Switch (Toggle on/off)

#### ❌ Avant (custom implementation)
```tsx
<div className="toggle-wrapper">
  <input
    type="checkbox"
    checked={enabled}
    onChange={(e) => setEnabled(e.target.checked)}
  />
  <label>Enable feature</label>
</div>
```

#### ✅ Après (v17.1)
```tsx
import { Switch } from '@/ui/components';

<Switch
  checked={enabled}
  onChange={setEnabled}
  label="Enable feature"
  size="md"
/>
```

**Avantages:**
- ✅ Design cohérent avec tokens
- ✅ Animations fluides (180ms)
- ✅ Keyboard: Space, Enter
- ✅ ARIA: role="switch"

---

### 2. Checkbox

#### ❌ Avant (HTML natif)
```tsx
<div className="checkbox-wrapper">
  <input
    type="checkbox"
    checked={accepted}
    onChange={(e) => setAccepted(e.target.checked)}
  />
  <label>I accept terms</label>
  {error && <span className="error">{error}</span>}
</div>
```

#### ✅ Après (v17.1)
```tsx
import { Checkbox } from '@/ui/components';

<Checkbox
  checked={accepted}
  onChange={setAccepted}
  label="I accept terms"
  error={error}
  size="md"
/>
```

**Nouvelles features:**
- ✅ État `indeterminate` (ligne)
- ✅ Messages d'erreur intégrés
- ✅ 3 sizes (sm, md, lg)
- ✅ SVG icons animés

---

### 3. Radio + RadioGroup

#### ❌ Avant (HTML natif)
```tsx
<div>
  <input type="radio" name="theme" value="light" 
    checked={theme === 'light'}
    onChange={() => setTheme('light')} />
  <label>Light</label>
  
  <input type="radio" name="theme" value="dark"
    checked={theme === 'dark'}
    onChange={() => setTheme('dark')} />
  <label>Dark</label>
</div>
```

#### ✅ Après (v17.1)
```tsx
import { Radio, RadioGroup } from '@/ui/components';

<RadioGroup value={theme} onChange={setTheme} name="theme">
  <Radio value="light" label="Light" />
  <Radio value="dark" label="Dark" />
</RadioGroup>
```

**Avantages:**
- ✅ RadioGroup gère l'état partagé
- ✅ Props propagées automatiquement
- ✅ Animation du point (scale)
- ✅ Keyboard: Arrow keys

---

### 4. Textarea (nouveau)

#### ❌ Avant (textarea basique)
```tsx
<div>
  <label>Description</label>
  <textarea
    value={text}
    onChange={(e) => setText(e.target.value)}
    placeholder="Enter text..."
    maxLength={500}
  />
  <span>{text.length}/500</span>
</div>
```

#### ✅ Après (v17.1)
```tsx
import { Textarea } from '@/ui/components';

<Textarea
  value={text}
  onChange={setText}
  label="Description"
  placeholder="Enter text..."
  maxLength={500}
  showCount
  autoResize
  helperText="Maximum 500 characters"
/>
```

**Nouvelles features:**
- ✅ `autoResize` automatique
- ✅ `showCount` intégré
- ✅ Helper text + error
- ✅ Design tokens appliqués

---

### 5. Slider (nouveau)

Pas d'équivalent précédent. Component complètement nouveau.

```tsx
import { Slider } from '@/ui/components';

<Slider
  value={volume}
  onChange={setVolume}
  min={0}
  max={100}
  label="Volume"
  showValue
  showMarks
  marks={[
    { value: 0, label: '0%' },
    { value: 50, label: '50%' },
    { value: 100, label: '100%' },
  ]}
/>
```

**Features:**
- ✅ Mouse drag + keyboard
- ✅ Custom marks ou auto-generated
- ✅ `onChangeCommitted` pour fin de drag
- ✅ 3 sizes (sm: 4px, md: 6px, lg: 8px track)

---

### 6. Select (nouveau)

Pas d'équivalent précédent. Remplace `<select>` HTML natif.

#### ❌ Avant (select natif)
```tsx
<select value={country} onChange={(e) => setCountry(e.target.value)}>
  <option value="fr">France</option>
  <option value="us">USA</option>
  <option value="uk">UK</option>
</select>
```

#### ✅ Après (v17.1)
```tsx
import { Select } from '@/ui/components';

<Select
  value={country}
  onChange={setCountry}
  options={[
    { value: 'fr', label: 'France' },
    { value: 'us', label: 'USA' },
    { value: 'uk', label: 'UK' },
  ]}
  searchable
  label="Country"
/>
```

**Avantages:**
- ✅ Recherche intégrée
- ✅ Dropdown animé (120ms fadeIn)
- ✅ Keyboard: Arrow keys, Enter, Escape
- ✅ Outside click detection
- ✅ Custom styling avec design tokens

---

### 7. Toggle (nouveau)

Alternative visuelle aux Radio buttons.

```tsx
import { Toggle } from '@/ui/components';

<Toggle
  value={view}
  onChange={setView}
  options={[
    { value: 'grid', label: 'Grid', icon: <GridIcon /> },
    { value: 'list', label: 'List', icon: <ListIcon /> },
  ]}
  variant="pills"
  fullWidth
/>
```

**Features:**
- ✅ 2 variants: default (contained), pills (separated)
- ✅ Icons support
- ✅ Full-width mode
- ✅ Individual disabled states

---

## Design Tokens

### Migration des Couleurs

#### ❌ Avant (hardcoded)
```css
.component {
  background: #f5f5f5;
  border: 1px solid #ddd;
  color: #333;
}
```

#### ✅ Après (tokens)
```css
.component {
  background: var(--neutral-5);
  border: 2px solid var(--neutral-30);
  color: var(--neutral-90);
}
```

### Migration du Spacing

#### ❌ Avant (px hardcoded)
```css
.component {
  padding: 12px 16px;
  margin-bottom: 24px;
  gap: 8px;
}
```

#### ✅ Après (tokens)
```css
.component {
  padding: var(--space-3) var(--space-4);
  margin-bottom: var(--space-5);
  gap: var(--space-2);
}
```

### Migration du Radius

#### ❌ Avant
```css
.component {
  border-radius: 8px;
}
```

#### ✅ Après (tokens)
```css
.component {
  border-radius: var(--radius-md);
}
```

---

## Exemples de Migration

### Exemple 1: Form Settings

#### ❌ Avant
```tsx
function SettingsForm() {
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  
  return (
    <div className="settings">
      <div className="setting-item">
        <input
          type="checkbox"
          checked={darkMode}
          onChange={(e) => setDarkMode(e.target.checked)}
        />
        <label>Dark Mode</label>
      </div>
      
      <div className="setting-item">
        <input
          type="checkbox"
          checked={notifications}
          onChange={(e) => setNotifications(e.target.checked)}
        />
        <label>Notifications</label>
      </div>
    </div>
  );
}
```

#### ✅ Après (v17.1)
```tsx
import { Switch } from '@/ui/components';

function SettingsForm() {
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  
  return (
    <div className="settings">
      <Switch
        checked={darkMode}
        onChange={setDarkMode}
        label="Dark Mode"
        size="md"
      />
      
      <Switch
        checked={notifications}
        onChange={setNotifications}
        label="Notifications"
        size="md"
      />
    </div>
  );
}
```

### Exemple 2: Theme Selection

#### ❌ Avant
```tsx
function ThemeSelector() {
  const [theme, setTheme] = useState('light');
  
  return (
    <div>
      {['light', 'dark', 'auto'].map(t => (
        <div key={t}>
          <input
            type="radio"
            name="theme"
            value={t}
            checked={theme === t}
            onChange={() => setTheme(t)}
          />
          <label>{t}</label>
        </div>
      ))}
    </div>
  );
}
```

#### ✅ Après (v17.1)
```tsx
import { Radio, RadioGroup } from '@/ui/components';

function ThemeSelector() {
  const [theme, setTheme] = useState('light');
  
  return (
    <RadioGroup value={theme} onChange={setTheme} name="theme">
      <Radio value="light" label="Light" />
      <Radio value="dark" label="Dark" />
      <Radio value="auto" label="Auto" />
    </RadioGroup>
  );
}
```

---

## Checklist

### Migration Complète

- [ ] Identifier tous les `<input type="checkbox">` → Migrer vers `<Checkbox>`
- [ ] Identifier tous les `<input type="radio">` → Migrer vers `<Radio>` + `<RadioGroup>`
- [ ] Identifier tous les toggles custom → Migrer vers `<Switch>`
- [ ] Identifier tous les `<textarea>` → Migrer vers `<Textarea>`
- [ ] Identifier tous les `<select>` → Migrer vers `<Select>`
- [ ] Identifier tous les range inputs → Migrer vers `<Slider>`
- [ ] Identifier tous les button groups → Considérer `<Toggle>`

### Design Tokens

- [ ] Remplacer couleurs hardcoded par `--neutral-*` et `--primary-*`
- [ ] Remplacer spacing px par `--space-*`
- [ ] Remplacer border-radius par `--radius-*`
- [ ] Remplacer font-size par `--font-size-*`

### Testing

- [ ] Tester keyboard navigation (Tab, Space, Enter, Arrow keys)
- [ ] Tester focus visible (2px outline)
- [ ] Tester screen readers
- [ ] Tester responsive (mobile, tablet, desktop)
- [ ] Tester reduced motion mode

### Documentation

- [ ] Lire `src/ui/components/README.md`
- [ ] Visiter `/design-system` pour voir les exemples
- [ ] Vérifier props TypeScript avec IntelliSense
- [ ] Consulter `DESIGN_SYSTEM_GUIDE.md` pour concepts avancés

---

## 🚀 Démarrage Rapide

1. **Installer les dépendances** (déjà fait si projet à jour)
   ```bash
   ./pnpm-host.sh install
   ```

2. **Importer les composants**
   ```tsx
   import { Switch, Checkbox, Radio, RadioGroup, Textarea, Slider, Select, Toggle } from '@/ui/components';
   ```

3. **Consulter la démo**
   - Lancer l'app: `./pnpm-host.sh run dev`
   - Naviguer vers `/design-system`
   - Tester tous les composants en live

4. **Lire la documentation**
   - `src/ui/components/README.md` - Guide complet
   - `DESIGN_SYSTEM_GUIDE.md` - Principes & tokens
   - `PRIMITIVES_COMPLETION_REPORT_v17.1.md` - Rapport technique

---

## 📞 Support

- **Documentation**: `src/ui/components/README.md`
- **Demo Interactive**: `/design-system` route
- **Changelog**: `CHANGELOG_v17.1.0_DESIGN_SYSTEM.md`
- **Examples**: `src/pages/DesignSystemPage.tsx`

---

**TITANE∞ v17.1** - Migration Progressive Sans Breaking Changes  
*Design System Ready for Production* 🚀
