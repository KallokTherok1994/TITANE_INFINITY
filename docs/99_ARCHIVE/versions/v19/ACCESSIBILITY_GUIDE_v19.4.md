# Guide d'Accessibilité TITANE∞ v19.4

## 📋 Vue d'ensemble

Ce guide documente l'infrastructure d'accessibilité de TITANE∞, conformément aux **WCAG 2.1 AA** (Web Content Accessibility Guidelines).

**Objectif de couverture:** 85% (actuellement ~60%)

---

## 🛠️ Infrastructure créée

### 1. A11yChecker Component (`src/components/a11y/A11yChecker.tsx`)

**Description:** Composant de test d'accessibilité automatisé basé sur axe-core.

**Fonctionnalités:**
- Détection automatique des violations WCAG
- 4 niveaux d'impact: `critical`, `serious`, `moderate`, `minor`
- Filtrage par niveau WCAG: A, AA, AAA
- Statistiques en temps réel (5 cartes: critical, serious, moderate, minor, passed)
- Liens vers la documentation axe-core
- Snippets HTML des éléments problématiques
- Auto-exécution configurable (1s après montage)

**Utilisation:**

```tsx
import { A11yChecker, useA11yCheck } from '@/components/a11y/A11yChecker'

// Composant visuel
function MonComposant() {
  return (
    <div>
      <A11yChecker 
        autoRun={true} 
        wcagLevel="AA" 
        showPasses={false} 
      />
      {/* Votre contenu */}
    </div>
  )
}

// Hook programmatique
function MonAutreComposant() {
  const { runCheck, violations, passes, isRunning } = useA11yCheck()
  
  useEffect(() => {
    runCheck()
  }, [])
  
  return (
    <div>
      {violations.critical.length > 0 && (
        <Alert variant="destructive">
          {violations.critical.length} violations critiques détectées !
        </Alert>
      )}
    </div>
  )
}
```

**Configuration axe-core:**
- `wcagLevel: 'A' | 'AA' | 'AAA'` — Niveau de conformité WCAG
- `autoRun: boolean` — Lancer automatiquement au montage
- `showPasses: boolean` — Afficher les règles validées
- `target?: HTMLElement | string` — Élément cible (défaut: `document.body`)

---

### 2. KeyboardShortcuts Component (`src/components/a11y/KeyboardShortcuts.tsx`)

**Description:** Gestionnaire centralisé de raccourcis clavier et navigation au clavier.

**Raccourcis globaux (6):**

| Raccourci | Action | Catégorie |
|-----------|--------|-----------|
| `Ctrl+K` | Ouvrir palette de commandes | Navigation |
| `Ctrl+/` | Afficher aide raccourcis | Aide |
| `Ctrl+H` | Retour à l'accueil | Navigation |
| `Ctrl+B` | Basculer sidebar | Interface |
| `Escape` | Fermer modal/dialog | Interface |
| `F1` | Aide contextuelle | Aide |

**Hooks disponibles:**

#### `useKeyboardShortcuts`
Enregistre des raccourcis clavier personnalisés.

```tsx
import { useKeyboardShortcuts } from '@/components/a11y/KeyboardShortcuts'

function MonComposant() {
  useKeyboardShortcuts({
    shortcuts: [
      {
        key: 's',
        ctrlKey: true,
        description: 'Sauvegarder',
        action: () => handleSave(),
        category: 'Édition'
      }
    ],
    enabled: true,
    preventDefault: true
  })
  
  return <div>Mon contenu</div>
}
```

#### `useFocusTrap`
Piège le focus dans un modal/dialog (Tab/Shift+Tab cycling).

```tsx
import { useFocusTrap } from '@/components/a11y/KeyboardShortcuts'

function MonModal({ isOpen }: { isOpen: boolean }) {
  const modalRef = useFocusTrap(isOpen)
  
  return (
    <div ref={modalRef} role="dialog" aria-modal="true">
      <h2>Mon Modal</h2>
      <button>Action 1</button>
      <button>Action 2</button>
      <button>Fermer</button>
    </div>
  )
}
```

#### `useSkipNavigation`
Ajoute un lien "Skip to main content" pour les lecteurs d'écran.

```tsx
import { SkipNavigation } from '@/components/a11y/KeyboardShortcuts'

function Layout() {
  return (
    <>
      <SkipNavigation />
      <nav>...</nav>
      <main id="main-content">...</main>
    </>
  )
}
```

**Composants disponibles:**

```tsx
import { 
  KeyboardShortcutsProvider,
  ShortcutsHelp 
} from '@/components/a11y/KeyboardShortcuts'

// Wrapper global (place dans App.tsx)
<KeyboardShortcutsProvider>
  <VotreApplication />
</KeyboardShortcutsProvider>
```

---

### 3. ARIA Utilities Library (`src/lib/ariaUtils.tsx`)

**Description:** Bibliothèque complète d'utilitaires ARIA pour la gestion du focus, des annonces aux lecteurs d'écran, et des rôles ARIA.

#### **Fonctions utilitaires**

##### `generateAriaId(prefix?: string)`
Génère un ID unique pour les attributs ARIA.

```tsx
import { generateAriaId } from '@/lib/ariaUtils'

const labelId = generateAriaId('label') // 'label-1234567890'
const descId = generateAriaId('desc')   // 'desc-0987654321'

<input aria-labelledby={labelId} aria-describedby={descId} />
```

##### `announceToScreenReader(message, politeness?, timeout?)`
Annonce un message aux lecteurs d'écran via une région live.

```tsx
import { announceToScreenReader } from '@/lib/ariaUtils'

function handleSave() {
  saveData()
  announceToScreenReader('Données sauvegardées avec succès', 'polite', 3000)
}

function handleError() {
  announceToScreenReader('Erreur: données invalides', 'assertive')
}
```

**Paramètres:**
- `message: string` — Message à annoncer
- `politeness: 'polite' | 'assertive' | 'off'` — Niveau d'urgence (défaut: 'polite')
- `timeout: number` — Durée d'affichage en ms (défaut: 5000)

##### `getFocusableElements(container)`
Récupère tous les éléments focusables d'un conteneur.

```tsx
import { getFocusableElements } from '@/lib/ariaUtils'

const modal = document.querySelector('[role="dialog"]')
const focusables = getFocusableElements(modal)
console.log(`${focusables.length} éléments focusables trouvés`)
```

##### `isElementVisible(element)`
Vérifie si un élément est visible (pour la gestion du focus).

```tsx
import { isElementVisible } from '@/lib/ariaUtils'

const button = document.querySelector('button')
if (isElementVisible(button)) {
  button.focus()
}
```

#### **Classes utilitaires**

##### `FocusManager`
Sauvegarde et restaure le focus (utile pour les modals).

```tsx
import { FocusManager } from '@/lib/ariaUtils'

const focusManager = new FocusManager()

function openModal() {
  const modal = document.querySelector('[role="dialog"]')
  focusManager.saveFocusAndMoveTo(modal) // Sauvegarde focus actuel + focus modal
}

function closeModal() {
  focusManager.restoreFocus() // Retour au focus précédent
}
```

#### **Hooks React**

##### `useScreenReaderAnnouncement(message, politeness)`
Hook pour annoncer automatiquement un message lors d'un changement.

```tsx
import { useScreenReaderAnnouncement } from '@/lib/ariaUtils'

function SearchResults({ results }) {
  useScreenReaderAnnouncement(
    `${results.length} résultats trouvés`,
    'polite'
  )
  
  return <div>{/* Résultats */}</div>
}
```

##### `useFocusTrap(active)`
Hook pour piéger le focus dans un conteneur (modal, dialog).

```tsx
import { useFocusTrap } from '@/lib/ariaUtils'

function Modal({ isOpen }) {
  const trapRef = useFocusTrap(isOpen)
  
  return (
    <div ref={trapRef} role="dialog" aria-modal="true">
      <h2>Mon Modal</h2>
      <button>OK</button>
      <button>Annuler</button>
    </div>
  )
}
```

##### `useAutoFocus(shouldFocus)`
Hook pour auto-focus sur un élément au montage.

```tsx
import { useAutoFocus } from '@/lib/ariaUtils'

function SearchInput() {
  const inputRef = useAutoFocus<HTMLInputElement>(true)
  
  return <input ref={inputRef} type="search" placeholder="Rechercher..." />
}
```

##### `useArrowNavigation(containerRef)`
Hook pour naviguer au clavier (↑↓ + Home + End) dans une liste.

```tsx
import { useArrowNavigation } from '@/lib/ariaUtils'

function MenuList() {
  const listRef = useRef<HTMLUListElement>(null)
  useArrowNavigation(listRef)
  
  return (
    <ul ref={listRef} role="menu">
      <li role="menuitem" tabIndex={0}>Option 1</li>
      <li role="menuitem" tabIndex={-1}>Option 2</li>
      <li role="menuitem" tabIndex={-1}>Option 3</li>
    </ul>
  )
}
```

#### **Composants React**

##### `<VisuallyHidden>`
Cache visuellement un élément mais le garde accessible aux lecteurs d'écran.

```tsx
import { VisuallyHidden } from '@/lib/ariaUtils'

<button>
  <VisuallyHidden>Fermer le modal</VisuallyHidden>
  <span aria-hidden="true">×</span>
</button>
```

##### `<LiveRegion>`
Région live pour annoncer dynamiquement du contenu.

```tsx
import { LiveRegion } from '@/lib/ariaUtils'

function StatusMessage({ status }) {
  return (
    <LiveRegion 
      message={status} 
      politeness="polite" 
      atomic={true}
      relevant="additions"
    />
  )
}
```

**Props:**
- `message: string` — Message à annoncer
- `politeness?: 'polite' | 'assertive' | 'off'` — Niveau d'urgence
- `atomic?: boolean` — Annoncer toute la région ou seulement les changements
- `relevant?: 'additions' | 'removals' | 'text' | 'all'` — Types de changements à annoncer

#### **HOC (Higher-Order Component)**

##### `withAriaSupport(Component, ariaProps)`
Ajoute automatiquement des attributs ARIA à un composant.

```tsx
import { withAriaSupport } from '@/lib/ariaUtils'

const MyButton = ({ children, ...props }) => (
  <button {...props}>{children}</button>
)

const AccessibleButton = withAriaSupport(MyButton, {
  'aria-label': 'Bouton accessible',
  'aria-describedby': 'desc-123'
})

<AccessibleButton>Cliquez-moi</AccessibleButton>
```

#### **Validateurs ARIA**

##### `ariaValidator.isValidRole(role)`
Vérifie si un rôle ARIA est valide (43 rôles supportés).

```tsx
import { ariaValidator } from '@/lib/ariaUtils'

console.log(ariaValidator.isValidRole('button'))      // true
console.log(ariaValidator.isValidRole('invalidrole')) // false
```

**Rôles valides:** alert, alertdialog, application, article, banner, button, checkbox, columnheader, combobox, complementary, contentinfo, definition, dialog, directory, document, feed, figure, form, grid, gridcell, group, heading, img, link, list, listbox, listitem, log, main, marquee, math, menu, menubar, menuitem, menuitemcheckbox, menuitemradio, navigation, note, option, presentation, progressbar, radio, radiogroup, region, row, rowgroup, rowheader, scrollbar, search, searchbox, separator, slider, spinbutton, status, switch, tab, table, tablist, tabpanel, term, textbox, timer, toolbar, tooltip, tree, treegrid, treeitem

##### `ariaValidator.hasAccessibleLabel(element)`
Vérifie si un élément a un label accessible.

```tsx
import { ariaValidator } from '@/lib/ariaUtils'

const button = document.querySelector('button')
if (!ariaValidator.hasAccessibleLabel(button)) {
  console.warn('Bouton sans label accessible!')
}
```

Vérifie dans l'ordre:
1. `aria-label`
2. `aria-labelledby`
3. `<label>` associé (via `for` ou contenu)
4. `textContent` visible

##### `ariaValidator.validateElement(element)`
Validation complète d'un élément (rôle + label + tabindex).

```tsx
import { ariaValidator } from '@/lib/ariaUtils'

const result = ariaValidator.validateElement(myElement)

if (!result.isValid) {
  console.error('Problèmes d\'accessibilité:', result.issues)
}

// Structure de retour:
// {
//   isValid: boolean
//   issues: string[]
// }
```

---

## 🧪 Tests d'accessibilité

### 1. Tests automatisés (axe-core)

**Lancer les tests:**

```tsx
import { A11yChecker } from '@/components/a11y/A11yChecker'

// En développement
<A11yChecker autoRun={true} wcagLevel="AA" />

// En tests unitaires
import { useA11yCheck } from '@/components/a11y/A11yChecker'

test('Pas de violations d\'accessibilité', async () => {
  render(<MonComposant />)
  const { runCheck, violations } = useA11yCheck()
  await runCheck()
  
  expect(violations.critical.length).toBe(0)
  expect(violations.serious.length).toBe(0)
})
```

### 2. Tests manuels (lecteurs d'écran)

#### **Windows: NVDA**
1. Télécharger NVDA: https://www.nvaccess.org/download/
2. Installer et lancer NVDA
3. Naviguer avec:
   - `Tab` / `Shift+Tab` — Navigation focus
   - `↑` / `↓` — Navigation ligne par ligne
   - `H` — Navigation headings
   - `B` — Navigation boutons
   - `K` — Navigation liens
   - `F` — Navigation formulaires
   - `Ctrl` — Arrêter la lecture

#### **macOS: VoiceOver**
1. Activer: `Cmd+F5`
2. Naviguer avec:
   - `Ctrl+Option+→` / `←` — Navigation éléments
   - `Ctrl+Option+Cmd+H` — Navigation headings
   - `Tab` / `Shift+Tab` — Navigation focus
   - `Ctrl+Option+Space` — Activer élément

#### **Linux: Orca**
1. Installer: `sudo apt install orca`
2. Lancer: `orca --setup`
3. Naviguer avec:
   - `Tab` / `Shift+Tab` — Navigation focus
   - `H` — Navigation headings
   - `B` — Navigation boutons
   - `Insert+Space` — Mode focus/navigation

### 3. Tests au clavier

**Checklist:**
- ✅ Tous les éléments interactifs accessibles au `Tab`
- ✅ Ordre de focus logique (haut → bas, gauche → droite)
- ✅ Indicateur de focus visible (outline, ring)
- ✅ `Escape` ferme les modals/dialogs
- ✅ `Enter` / `Space` activent les boutons
- ✅ `↑` / `↓` naviguent dans les listes/menus
- ✅ `Home` / `End` vont au début/fin
- ✅ Pas de pièges de focus (focus trap volontaire dans modals OK)

### 4. Tests de contraste

**Outils:**
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Colour Contrast Analyser](https://www.tpgi.com/color-contrast-checker/)
- Extension Chrome: [WCAG Color Contrast Checker](https://chrome.google.com/webstore/detail/wcag-color-contrast-check/plnahcmalebffmaghcpcmpaciebdhgdf)

**Ratios minimum (WCAG AA):**
- **Texte normal:** 4.5:1
- **Texte large (18pt+ ou 14pt+ gras):** 3:1
- **Composants UI (boutons, icônes):** 3:1

---

## 📊 Audit des composants existants

### Composants à auditer (priorité haute)

1. **Forms**
   - `ChatInput.tsx` — Champ de saisie principal
   - `SettingsModal.tsx` — Formulaire de configuration
   - **Actions:** Ajouter labels, aria-describedby, messages d'erreur

2. **Buttons**
   - `AudioButton.tsx` — Bouton micro
   - `VoiceButton.tsx` — Contrôle vocal
   - **Actions:** Ajouter aria-label, states (pressed, disabled)

3. **Navigation**
   - Layout principal — Navigation entre sections
   - **Actions:** Landmarks (nav, main, aside), skip link

4. **Modals/Dialogs**
   - Tous les modals existants
   - **Actions:** Focus trap, aria-modal, Escape handler

5. **Dynamic Content**
   - `ChatWindow.tsx` — Messages dynamiques
   - `VitalsPanel.tsx` — Indicateurs en temps réel
   - **Actions:** Live regions (polite), annonces aux SR

### Checklist par composant

```typescript
// Template d'audit
interface A11yAudit {
  component: string
  issues: {
    noAriaLabel: boolean          // Manque aria-label
    noKeyboardAccess: boolean     // Pas accessible au clavier
    noFocusIndicator: boolean     // Pas d'indicateur de focus
    lowContrast: boolean          // Contraste insuffisant
    missingLandmarks: boolean     // Pas de landmarks ARIA
    noScreenReaderSupport: boolean // Pas d'annonces SR
  }
  priority: 'critical' | 'high' | 'medium' | 'low'
  estimatedEffort: string        // Ex: "2h"
}
```

---

## 🎯 Prochaines étapes

### Phase actuelle (Semaine 3-4)
- [x] Infrastructure axe-core installée
- [x] A11yChecker component créé
- [x] KeyboardShortcuts component créé
- [x] ARIA utilities library créée
- [ ] **EN COURS:** Documentation complète
- [ ] **À FAIRE:** Audit des composants existants (60 composants)
- [ ] **À FAIRE:** Tests SR avec NVDA/VoiceOver
- [ ] **À FAIRE:** Color contrast audit (palette Tailwind)

### Phase suivante (Semaine 5-6)
- Internationalisation (i18next)
- Traductions fr/en
- Détection locale automatique

### Objectif final
**Couverture accessibilité: 85%** (actuellement ~60%)

---

## 📚 Ressources

### Documentation
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [axe-core Documentation](https://github.com/dequelabs/axe-core)
- [MDN ARIA Guide](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA)
- [WebAIM Resources](https://webaim.org/resources/)

### Outils
- [axe DevTools Extension](https://www.deque.com/axe/devtools/) (Chrome/Firefox)
- [WAVE Evaluation Tool](https://wave.webaim.org/extension/)
- [Lighthouse Accessibility Audit](https://developers.google.com/web/tools/lighthouse)
- [NVDA Screen Reader](https://www.nvaccess.org/)

### Standards
- **WCAG 2.1 Level AA** (requis)
- **Section 508** (US federal standard)
- **EN 301 549** (EU standard)

---

**Document créé:** $(date +%Y-%m-%d)  
**Version:** TITANE∞ v19.4  
**Auteur:** GitHub Copilot (Claude Sonnet 4.5)
