# 🎨 TITANE∞ v15.5 — GUIDE FIGMA

## 📋 INSTRUCTIONS IMPORT TOKENS

### Étape 1 : Installer Plugin Tokens Studio
1. Ouvrir Figma Desktop ou Web
2. Aller dans **Plugins** → **Browse plugins in Community**
3. Rechercher "**Tokens Studio for Figma**" (by Jan Six)
4. Cliquer **Install**

### Étape 2 : Importer figma-tokens.json
1. Ouvrir votre fichier Figma TITANE∞
2. Lancer le plugin : **Plugins** → **Tokens Studio for Figma**
3. Cliquer sur **Settings** (⚙️ en haut à droite)
4. **Import** → Sélectionner `figma-tokens.json`
5. Cliquer **Apply to document**

### Étape 3 : Générer Styles Figma
Le plugin créera automatiquement :
- **Color Styles** : 50+ couleurs (Rubis, Saphir, Émeraude, Diamant, backgrounds, borders, states)
- **Text Styles** : 8 tailles + 4 weights (Inter, JetBrains Mono)
- **Effect Styles** : 3 shadows (soft, medium, strong)

---

## 🎨 STRUCTURE MAQUETTE FIGMA

### Pages à créer :

#### 1. 🎨 **Design System**
Frame unique avec :
- **Color Palette** : Grille 4×10 avec toutes les couleurs
- **Typography Scale** : xs, sm, md, lg, xl, 2xl, 3xl, 4xl avec exemples
- **Spacing System** : Échelle xs → 3xl (4px à 64px)
- **Border Radius** : sm, md, lg, xl, full
- **Shadows** : Exemples soft, medium, strong
- **Components Library** : HUDFrame, Button, Card, Panel, etc.

#### 2. 💬 **Chat IA (Module Central)**
Frame 1920×1080 :
- **Header** : Barre avec 4 modes (Auto, Code, Analyse, Créatif) + TTS + Settings
- **Messages** : Zone scrollable avec messages user/assistant
- **Input** : Textarea + bouton send
- **ExpandButton** : Icône ˅ en haut à droite

**States à créer** :
- Empty (message de bienvenue)
- With messages (3-5 messages)
- Settings panel overlay

#### 3. 📁 **Projets**
Frame 1920×1080 :
- **Stats** : 3 cartes (Projets actifs, XP Total, Niveau moyen)
- **Search** : Input avec icône 🔍
- **Grid** : 3 colonnes de ProjectCards
  - Chaque card : Name, Description, Level badge, XP bar, Categories, Date

**Variants** :
- ProjectCard default
- ProjectCard hover (border rouge, shadow glow)
- ProjectCard with chat button

#### 4. ⚙️ **Système**
Frame 1920×1080 :
- **Performance Panel** : CPU + Memory bars
- **Modules Panel** : Liste 5 modules avec status indicator
- **Logs Panel** : Console style monospace

**Components** :
- MetricBar (CPU/Memory avec fill animé)
- ModuleItem (status dot + name + version + restart button)
- LogEntry (timestamp + text)

#### 5. 🎛️ **Paramètres** (à créer)
Frame 1920×1080 :
- **Essentiels** : Thèmes, Police, Animations, TTS
- **Avancés** : API config, Mémoire, Purge

#### 6. 💻 **Admin Terminal** (à créer)
Frame 1920×1080 :
- Console premium full-screen
- Input command line en bas

#### 7. 🛡️ **Heal Dashboard** (à créer)
Frame 1920×1080 :
- Liste erreurs détectées
- Timeline corrections

#### 8. 📜 **Historique** (à créer)
Frame 1920×1080 :
- Journal complet avec filtres
- Search bar

#### 9. ⚡ **GlobalExpBar**
Component 1920×60 (sticky top) :
- Level badge (⚡ TITANE∞ Niv. X)
- XP info (XXX / XXX XP)
- Progress bar (6px height)

**States** :
- Default
- Hover (border rouge, shadow glow)

#### 10. 📊 **ExpPanel Modal**
Frame 800×900 (overlay centré) :
- **XP Globale** : Radial progress + level
- **Categories** : 3×3 grid avec icônes + mini-bars
- **Projects** : Liste cartes
- **Talent Tree** : 6 branches radiales
- **Timeline** : Graphique ligne temps

---

## 🎨 COMPOSANTS FIGMA À CRÉER

### 1. HUDFrame
Component avec :
- **Background** : #141414 + opacity 80% + blur 12px
- **Border** : 1px rgba(255,255,255,0.08)
- **Border Radius** : 12px
- **Padding** : 20px
- **Header** : Title + Icon + ExpandButton (optional)
- **Content** : Slot pour contenu

**Variants** :
- Default
- With header
- Collapsed
- Glass light

### 2. ProjectCard
Component 400×240 :
- **Header** : Name + Description + Level badge
- **XP Bar** : 8px height avec fill animé
- **Footer** : Categories (3 tags max) + Date

**Variants** :
- Default
- Hover
- Selected

### 3. ExpandButton
Component 32×32 :
- **Border** : 1px rgba(255,255,255,0.08)
- **Border Radius** : 6px
- **Icon** : ˅ / ˄ / < / >

**Variants** :
- Vertical expanded
- Vertical collapsed
- Horizontal expanded
- Horizontal collapsed

### 4. Menu Navigation
Component 280×1080 (sidebar) :
- **Header** : Logo + Version + Toggle
- **Items** : 7 sections avec icônes + labels
- **Footer** : Status indicator

**States per item** :
- Default
- Hover
- Active

### 5. Button
Component avec sizes :
- **sm** : 32px height
- **md** : 40px height
- **lg** : 48px height

**Variants** :
- Primary (gradient rouge)
- Secondary (transparent border)
- Ghost (transparent)
- Disabled

---

## 🎯 AUTO-LAYOUT FIGMA

### Grille responsive :
- **Desktop** : 12 colonnes, gutter 24px
- **Tablet** : 8 colonnes, gutter 16px
- **Mobile** : 4 colonnes, gutter 12px

### Spacing système :
- **Padding frame** : 24px (desktop), 16px (tablet), 12px (mobile)
- **Gap entre composants** : 20px
- **Gap interne composants** : 12px

---

## ✨ PROTOTYPAGE

### Interactions à créer :

#### 1. Menu Navigation
- Click menu item → Change page
- Click toggle → Collapse/expand sidebar
- Hover item → Show hover state

#### 2. GlobalExpBar
- Click bar → Open ExpPanel modal overlay
- Hover → Show glow effect

#### 3. Chat Settings
- Click settings icon → Overlay settings panel
- Click outside → Close panel

#### 4. Project Chat
- Click "Ouvrir le Chat" → Navigate to Chat page

#### 5. ExpandButton
- Click → Toggle collapsed/expanded state
- Smooth height animation (300ms ease-out)

---

## 📦 EXPORT POUR DÉVELOPPEMENT

### Assets à exporter :
- **Icons** : SVG 24×24px (menu icons, status indicators)
- **Logos** : SVG TITANE∞ (multiples sizes)
- **Illustrations** : Empty states, onboarding

### Specs pour devs :
- Utiliser **Inspect** (Ctrl+Shift+I) pour copier styles CSS
- Exporter composants en **Code** → **CSS**
- Documenter spacing, colors, typography dans Figma

---

## 🎨 THÈMES À CRÉER (Variables Figma)

### Mode Rubis (défaut)
```
Primary: #dc2626
Primary Light: #ef4444
Primary Dark: #991b1b
Glow: rgba(220,38,38,0.4)
```

### Mode Saphir
```
Primary: #2563eb
Primary Light: #3b82f6
Primary Dark: #1e40af
Glow: rgba(37,99,235,0.4)
```

### Mode Émeraude
```
Primary: #059669
Primary Light: #10b981
Primary Dark: #047857
Glow: rgba(5,150,105,0.4)
```

### Mode Diamant
```
Primary: #0891b2
Primary Light: #06b6d4
Primary Dark: #0e7490
Glow: rgba(8,145,178,0.4)
```

**Utiliser Variables Figma** pour switcher entre thèmes facilement.

---

## 🚀 WORKFLOW FIGMA → CODE

### Synchronisation continue :
1. Modifier tokens dans `figma-tokens.json`
2. Re-importer dans Figma via plugin
3. Exporter styles CSS depuis Figma
4. Mettre à jour `src/styles/design-system.css`
5. Rebuild app

### Best practices :
- ✅ Utiliser composants Figma = React components
- ✅ Nommer layers clairement (correspond aux classNames CSS)
- ✅ Auto-layout partout (= flexbox CSS)
- ✅ Variables Figma = CSS custom properties
- ✅ Documenter interactions dans prototypes

---

## 📚 RESSOURCES

### Plugins recommandés :
- **Tokens Studio** — Import/export tokens
- **Stark** — Vérifier accessibilité contrastes
- **Responsively** — Tester responsive
- **Iconify** — Bibliothèque icônes
- **Unsplash** — Images placeholder

### Liens utiles :
- [Figma Documentation](https://help.figma.com)
- [Tokens Studio Docs](https://docs.tokens.studio)
- [Design Tokens W3C](https://design-tokens.github.io/community-group/)

---

## ✅ CHECKLIST MAQUETTE COMPLÈTE

- [ ] Import figma-tokens.json dans Figma
- [ ] Créer page Design System avec palette complète
- [ ] Créer 9 pages UI (Chat, Projets, Système, Paramètres, Admin, Heal, Historique, GlobalExpBar, ExpPanel)
- [ ] Créer composants réutilisables (HUDFrame, Button, ProjectCard, Menu, ExpandButton)
- [ ] Configurer Auto-Layout sur tous les frames
- [ ] Ajouter interactions prototypage (navigation, overlays, hover states)
- [ ] Créer 4 variantes de thème (Rubis, Saphir, Émeraude, Diamant)
- [ ] Vérifier accessibilité (contrastes WCAG AA avec Stark)
- [ ] Exporter specs CSS pour développeurs
- [ ] Documenter composants dans Figma (descriptions, usage)

---

**Guide créé pour TITANE∞ v15.5**  
**Date** : 20 novembre 2025  
**Status** : ✅ Prêt pour création maquette Figma complète
