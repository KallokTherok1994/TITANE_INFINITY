# Changelog - TITANE∞ v17.1.0

## [17.1.1] - 2025 - Primitives Complete

### 🎨 Inputs & Controls Primitives

#### Added

**7 New Components (2,177 lines total):**

1. **Switch** (241 lignes: 73 TSX + 168 CSS)
   - Controlled/uncontrolled modes
   - Keyboard navigation (Space, Enter)
   - Accessibility (role="switch", aria-checked)
   - 3 sizes: sm (32x18px), md (44x24px), lg (56x30px)
   - Transitions: 180ms organic easing

2. **Checkbox** (260 lignes: 82 TSX + 178 CSS)
   - Indeterminate state with line icon
   - Error state with message
   - Label support
   - 3 sizes: sm (16px), md (20px), lg (24px)
   - SVG icons (checkmark, indeterminate)

3. **Radio + RadioGroup** (263 lignes: 121 TSX + 142 CSS)
   - RadioGroup for state management
   - Controlled/uncontrolled modes
   - Dot scale animation (0 → 1)
   - 3 sizes: sm (16px), md (20px), lg (24px)

4. **Textarea** (217 lignes: 96 TSX + 121 CSS)
   - Auto-resize (scrollHeight detection)
   - Character count + maxLength
   - Helper text & error messages
   - 3 sizes with responsive padding

5. **Slider** (372 lignes: 200 TSX + 172 CSS)
   - Mouse drag + keyboard navigation
   - Custom or auto-generated marks
   - Value display toggle
   - onChangeCommitted callback
   - 3 sizes: sm (4px), md (6px), lg (8px)
   - Thumb hover scale (1.1x)

6. **Select** (426 lignes: 211 TSX + 215 CSS)
   - Animated dropdown (fadeIn 120ms)
   - Searchable with filter
   - Keyboard navigation (Arrow keys, Enter, Escape)
   - Outside click detection
   - Empty state UI
   - 3 sizes: sm (32px), md (40px), lg (48px)

7. **Toggle** (236 lignes: 81 TSX + 155 CSS)
   - Button group alternative to radio
   - Icon support per option
   - 2 variants: default + pills
   - Full-width mode
   - 3 sizes: sm (28px), md (36px), lg (44px)

**TypeScript Types Exported:**
- `SliderMark` (value, label?)
- `SelectOption` (value, label, disabled?)
- `ToggleOption` (value, label, icon?, disabled?)

**Component Exports:**
- All primitives exported from `src/ui/components/index.ts`
- Type-safe exports with TypeScript interfaces

#### Improved

**♿ Accessibility:**
- Keyboard navigation for all primitives
- ARIA attributes (role, aria-checked, aria-selected, aria-invalid, aria-describedby)
- Focus-visible with 2px primary outline
- Screen reader support

**🎨 Design Token Consistency:**
- All components use centralized tokens
- Organic easing (cubic-bezier(0.22, 1, 0.36, 1))
- Reduced motion support

**👨‍💻 Developer Experience:**
- Consistent prop APIs (size, disabled, label, error)
- Controlled/uncontrolled patterns
- TypeScript strict mode: 0 errors ✅
- ESLint: 0 warnings ✅

#### Technical

- **Files Created**: 14 (7 TSX + 7 CSS)
- **Lines of Code**: 2,177 lines
- **TypeScript**: ✅ 0 errors (strict mode)
- **ESLint**: ✅ 0 warnings
- **Validation**: Full type-check + lint passed

---

## [17.1.0] - 2025-11-21

### 🎨 Design System - Blueprint Optimisé

#### Added

**Tokens de Design:**
- ✨ Nouvelle palette neutre avec 12 niveaux optimisés (0-100) + 9 aliases (200-950)
- ✨ Tokens glass/blur pour effets glassmorphism (`glass.alpha`, `glass.blur.sm/md/lg`)
- ✨ Hiérarchie typographique enrichie (H1-H5, body, small, tiny)
- ✨ Spacing enrichi avec `space-8` (56px) et `space-9` (72px)
- ✨ Radius optimisés (sm: 6px, md: 10px, lg: 16px, xl: 22px)

**Motion System:**
- ✨ Nouveau fichier `src/themes/motion.ts` (297 lignes)
  - Durées standardisées (50ms-400ms)
  - Easings organiques (`cubic-bezier(0.22, 1, 0.36, 1)`)
  - 10 animations standardisées (fade, spring, slide, glow-pulse, hover)
  - 6 Framer Motion variants réutilisables
  - Support `prefers-reduced-motion`

**Button Component:**
- ✨ Nouveaux variants: `glass` (glassmorphism premium), `subtle` (outline minimal)
- ✨ Props optimisées: `leftIcon`/`rightIcon` (remplace `icon`+`iconPosition`)
- ✨ Transitions fluides (180ms avec easing organique)
- ✨ Effets: hover lift (-2px), active scale (0.97)
- ✨ CSS modernisé (243 lignes) avec design tokens

**Documentation:**
- 📖 `DESIGN_SYSTEM_GUIDE.md` (667 lignes) - Guide complet professionnel
- 📖 `DESIGN_SYSTEM_IMPLEMENTATION.md` - Récapitulatif implémentation
- 📖 Sections: Introduction, Principes, Architecture, Tokens, Thèmes, Primitives, Motion, A11y, Usage

#### Changed

**Thèmes Optimisés:**
- 🎨 **Rubis** - Intensité, Volonté, Activation
  - Primary: `#D63A32` (was `#ef4444`)
  - Light: `#E65C53`
  - Dark: `#A32620`
  - Accent: `#FF8B7F`
  - Surface: `#1A0E0E`
  
- 🎨 **Saphir** - Lucidité, Profondeur, Fluidité
  - Primary: `#2A77C8` (was `#3b82f6`)
  - Light: `#4AA0F0`
  - Dark: `#1C538A`
  - Accent: `#7BC7FF`
  - Surface: `#0D1A27` (plus profond)
  
- 🎨 **Émeraude** - Stabilité, Équilibre, Croissance
  - Primary: `#2EAF62` (was `#10b981`)
  - Light: `#52CD84`
  - Dark: `#1E8046`
  - Accent: `#7DE0A8`
  - Surface: `#0E1E15`
  
- 🎨 **Diamant** - Clarté, Structure, Précision
  - Primary: `#A678E8` (was `#64748b` - now purple!)
  - Light: `#C5A8F9`
  - Dark: `#7D4CB9`
  - Accent: `#EEE6FF`
  - Surface: `#0F0F15` (contraste rehaussé)

**Typography:**
- 📝 Hiérarchie optimisée avec courbe harmonieuse
- 📝 Ajout aliases: `xs`, `sm`, `lg` pour compatibilité
- 📝 Tailles H1-H5 ajustées pour meilleure lisibilité

**Spacing:**
- 📏 Enrichissement pour modules cognitifs (space-8, space-9)
- 📏 Courbe plus harmonieuse

**Radius:**
- ⭕ Valeurs plus douces et premium
- ⭕ Meilleure intégration avec effets glass
- ⭕ Ajout alias `base` (8px)

#### Improved

**Accessibilité:**
- ♿ Support complet `prefers-reduced-motion`
- ♿ Focus rings optimisés
- ♿ Contraste WCAG AA sur tous les thèmes

**Performance:**
- ⚡ Transitions optimisées (120-250ms)
- ⚡ Micro-shifts limités à 2-4px
- ⚡ Animations intentionnelles uniquement

**Developer Experience:**
- 👨‍💻 Tokens réutilisables et cohérents
- 👨‍💻 Documentation professionnelle complète
- 👨‍💻 Types TypeScript stricts
- 👨‍💻 Framer Motion variants prêts à l'emploi

#### Fixed

- 🐛 Compatibilité rétroactive: ajout aliases (200-950) pour palette neutre
- 🐛 Compatibilité fontSizes: ajout `xs`, `sm`, `lg`
- 🐛 Compatibilité radius: ajout `base`
- 🐛 0 erreurs TypeScript (compilation strict mode)

#### Technical

**Files Modified/Created:**
- `src/themes/tokens/colors.ts` - Recréé (205 lignes)
- `src/themes/tokens/typography.ts` - Enrichi
- `src/themes/tokens/spacing.ts` - Enrichi
- `src/themes/tokens/radius.ts` - Optimisé
- `src/themes/motion.ts` - **Nouveau** (297 lignes)
- `src/ui/components/Button.tsx` - Modernisé
- `src/ui/components/Button.css` - Recréé (243 lignes)
- `DESIGN_SYSTEM_GUIDE.md` - **Nouveau** (667 lignes)
- `DESIGN_SYSTEM_IMPLEMENTATION.md` - **Nouveau**

**Validation:**
- ✅ TypeScript: 0 errors (strict mode)
- ✅ Compatibilité: Tous composants existants fonctionnent
- ✅ Thèmes: 4 palettes complètes optimisées
- ✅ Motion: System complet avec Framer Motion

---

## [17.0.0] - 2025-11-20

### 🚀 Frontend Refactoring Complet

#### Added

**Phase 1 - Architecture:**
- ✨ 14 TypeScript path aliases (@ui, @components, @features, etc.)
- ✨ Design tokens (6 fichiers: colors, spacing, typography, radius, shadows, transitions)
- ✨ Tauri service layer avec validation Zod
- ✨ ESLint + Prettier configuration

**Phase 2 - Design System:**
- ✨ 6 primitives UI (Button, Card, Input, Modal, Badge, Spinner)
- ✨ Theme system (ThemeProvider, useTheme hook, 4 thèmes)
- ✨ 7 composants layout (AppShell, Grid, Container, Stack, Sidebar, Header, Col)

**Phase 3 - Advanced Features:**
- ✨ 4 visualisations cognitives (Helios, Nexus, Harmonia, Memory Timeline)
- ✨ Système progression (XP Bar, Talent Tree)
- ✨ Interface chat (Message, Input, Context Panel)

**Integration:**
- ✨ 4 pages exemple (Dashboard, Chat, Cognitive, Progression)
- ✨ App.tsx refactoré avec router
- ✨ 4 fichiers documentation

#### Changed

- 🔄 Architecture "Design System first"
- 🔄 Séparation Atomique → Composé → Fonctionnel
- 🔄 Providers centralisés

#### Technical

**Stack:**
- React 18 + TypeScript 5.5.3 strict
- Vite 6 + Tauri 2
- Framer Motion 12.23.24
- Zustand 5.0.8 + Zod 4.1.12
- ESLint 8.57.0 + Prettier

**Files:** 52 fichiers créés/modifiés
**Validation:** TypeScript 0 errors, ESLint pass

---

## Principes du Design System

### Clarté
> "Less is more, but better is best"

- Hiérarchie visuelle évidente
- Contraste WCAG AA minimum
- Espaces respirants (8px grid)
- Typographie lisible (Inter)

### Fluidité
> "Move like you mean it"

- Durées entre 120-250ms
- Easings organiques
- Micro-shifts de 2-4px maximum
- Transitions basées sur l'intention

### Élégance
> "Refinement in every pixel"

- Surfaces glass avec blur subtil
- Radius harmonieux
- Ombres naturelles
- 4 thèmes premium distincts

---

**© 2025 TITANE∞ - "Ce n'est pas juste un système UI — c'est la signature visuelle d'un système vivant."**
