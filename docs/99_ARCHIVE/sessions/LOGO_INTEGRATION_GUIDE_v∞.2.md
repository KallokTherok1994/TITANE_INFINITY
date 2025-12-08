# 🔥 TITANE∞ Logo Integration Guide v∞.2

## ✅ Fichiers Créés

### 1. Logo SVG Principal
- **Fichier**: `src/assets/titane-reactor-awen.svg`
- **Résolution**: 1024×1024
- **Format**: SVG avec animations intégrées
- **Contenu**: Logo TITANE∞ Reactor avec symbole Awen

### 2. Composant React
- **Fichier**: `src/components/branding/TitaneLogo.tsx`
- **Export**: `TitaneLogo` component + `TitaneLogoProps` type
- **Props**:
  - `size?: number` (default: 32)
  - `withText?: boolean` (default: false)
  - `direction?: 'row' | 'column'` (default: 'row')
  - `className?: string`
  - `onClick?: () => void`

### 3. Index d'export
- **Fichier**: `src/components/branding/index.ts`
- **Usage**: `import { TitaneLogo } from '@components/branding/TitaneLogo'`

---

## ✅ Intégrations Complétées

### ✅ 1. Sidebar (`src/App.tsx`)
**Ligne 25**: Import ajouté
```tsx
import { TitaneLogo } from './components/branding/TitaneLogo';
```

**Lignes 291-300**: Logo intégré dans le header de la sidebar
```tsx
<TitaneLogo
  size={sidebarCollapsed ? 32 : 36}
  withText={!sidebarCollapsed}
  direction="column"
/>
```

### ✅ 2. Dashboard Header (`src/pages/DashboardPage.tsx`)
**Ligne 23**: Import ajouté
```tsx
import { TitaneLogo } from '@components/branding/TitaneLogo';
```

**Ligne 33**: Logo affiché à côté du titre
```tsx
<TitaneLogo size={48} />
```

---

## 📋 Prochaines Étapes (à exécuter manuellement)

### Étape 1: Générer l'icône PNG 1024×1024

Vous devez **exporter manuellement** le SVG en PNG haute résolution.

**Option A - Avec Inkscape** (recommandé):
```bash
# Installer Inkscape si nécessaire
sudo apt install inkscape   # Debian/Ubuntu
brew install inkscape       # macOS

# Exporter SVG → PNG 1024x1024
inkscape \
  --export-filename=titane-app-icon.png \
  --export-width=1024 \
  --export-height=1024 \
  src/assets/titane-reactor-awen.svg
```

**Option B - Avec ImageMagick**:
```bash
# Installer ImageMagick
sudo apt install imagemagick    # Debian/Ubuntu
brew install imagemagick        # macOS

# Convertir SVG → PNG
convert -background none -resize 1024x1024 \
  src/assets/titane-reactor-awen.svg \
  titane-app-icon.png
```

**Option C - En ligne** (si pas d'outils):
1. Ouvrir `src/assets/titane-reactor-awen.svg` dans un navigateur
2. Faire clic droit → "Enregistrer l'image sous..."
3. Utiliser un outil en ligne comme https://svgtopng.com
4. Exporter en 1024×1024 pixels

---

### Étape 2: Générer les icônes multi-tailles avec Tauri

Une fois `titane-app-icon.png` créé à la racine du projet :

```bash
cd /home/titane/Documents/TITANE_INFINITY

# Générer toutes les résolutions nécessaires
cargo tauri icon ./titane-app-icon.png
```

Cette commande génère automatiquement dans `src-tauri/icons/` :
- `32x32.png`
- `128x128.png`
- `128x128@2x.png`
- `icon.icns` (macOS)
- `icon.ico` (Windows)
- Fichiers PNG supplémentaires pour Linux

---

### Étape 3: Vérifier la configuration Tauri

✅ **Déjà configuré** dans `src-tauri/tauri.conf.json` (lignes 11-18):
```json
{
  "bundle": {
    "icon": [
      "icons/32x32.png",
      "icons/128x128.png",
      "icons/128x128@2x.png",
      "icons/icon.icns",
      "icons/icon.ico"
    ]
  }
}
```

Aucune modification nécessaire si les fichiers sont bien générés.

---

### Étape 4: Tester en mode dev

```bash
npm run tauri:dev
```

Vérifications:
- ✅ Logo apparaît dans la sidebar (en haut)
- ✅ Logo apparaît dans le Dashboard à côté du titre
- ✅ Logo est animé (pulses énergétiques visibles)
- ✅ Texte "TITANE∞" s'affiche si sidebar étendue

---

### Étape 5: Build final avec la nouvelle icône

```bash
# Build production (génère .app / .exe / AppImage / .deb)
npm run tauri:build

# Vérifier l'icône de l'application finale
# macOS: src-tauri/target/release/bundle/macos/TITANE∞*.app
# Windows: src-tauri/target/release/bundle/msi/TITANE∞*.exe
# Linux: src-tauri/target/release/bundle/appimage/TITANE∞*.AppImage
```

---

## 🎨 Usage du Composant TitaneLogo

### Exemples d'utilisation

**Logo seul (petit)**:
```tsx
<TitaneLogo size={24} />
```

**Logo avec texte (horizontal)**:
```tsx
<TitaneLogo size={32} withText direction="row" />
```

**Logo avec texte (vertical, pour sidebar)**:
```tsx
<TitaneLogo size={40} withText direction="column" />
```

**Logo cliquable**:
```tsx
<TitaneLogo
  size={48}
  withText
  onClick={() => navigate('/dashboard')}
/>
```

---

## 📊 Checklist de Validation

- [x] `src/assets/titane-reactor-awen.svg` créé
- [x] `src/components/branding/TitaneLogo.tsx` créé
- [x] Logo intégré dans `App.tsx` (sidebar)
- [x] Logo intégré dans `DashboardPage.tsx` (header)
- [x] Imports TypeScript vérifiés
- [ ] **À FAIRE**: Générer `titane-app-icon.png` 1024×1024
- [ ] **À FAIRE**: Exécuter `cargo tauri icon ./titane-app-icon.png`
- [ ] **À FAIRE**: Tester en mode dev (`npm run tauri:dev`)
- [ ] **À FAIRE**: Build final (`npm run tauri:build`)
- [ ] **À FAIRE**: Vérifier l'icône sur l'application compilée

---

## 🔧 Commandes Récapitulatives

```bash
# 1. Exporter SVG → PNG (choisir une méthode ci-dessus)
inkscape --export-filename=titane-app-icon.png --export-width=1024 --export-height=1024 src/assets/titane-reactor-awen.svg

# 2. Générer icônes Tauri
cargo tauri icon ./titane-app-icon.png

# 3. Tester
npm run tauri:dev

# 4. Build production
npm run tauri:build
```

---

## 🎯 Résultat Final Attendu

1. **Interface**:
   - Logo Reactor visible dans la sidebar (haut)
   - Logo Reactor visible dans le Dashboard (à côté du titre)
   - Animations énergétiques actives (pulses cyan)

2. **Application**:
   - Icône Reactor sur l'exécutable (.app / .exe)
   - Icône Reactor dans la barre des tâches
   - Icône Reactor dans le dock (macOS) / taskbar (Windows)

3. **Identité Visuelle**:
   - Cohérence dark theme / métal / énergie
   - Symbole Awen central reconnaissable
   - Anneaux métalliques professionnels

---

## 🐛 Dépannage

### Import SVG échoue
**Erreur**: `Cannot find module '@/assets/titane-reactor-awen.svg'`

**Solution**: Le fichier SVG existe, mais TypeScript peut ne pas reconnaître le type. Ajouter dans `src/vite-env.d.ts`:
```typescript
declare module '*.svg' {
  const content: string;
  export default content;
}
```

### Icône Tauri ne change pas après build
**Cause**: Cache de build Tauri

**Solution**:
```bash
cd src-tauri
cargo clean
cd ..
npm run tauri:build
```

### Logo ne s'affiche pas (404)
**Cause**: Chemin d'import incorrect

**Solution**: Vérifier que `@/assets` est bien configuré dans `vite.config.ts` (déjà fait).

---

**Fin du guide d'intégration**
