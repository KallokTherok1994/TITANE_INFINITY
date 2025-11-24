# 🧪 GUIDE DE VALIDATION VISUELLE - TITANE∞ v19.1.0

**Date:** 23 novembre 2025
**Objectif:** Valider corrections affichage UI/UX frontend
**Durée estimée:** 10-15 minutes

---

## 📋 CHECKLIST RAPIDE

### ✅ Ce qui DOIT fonctionner maintenant

- [ ] **Mode dev navigateur**: UI complète visible (pas d'écran rouge)
- [ ] **Mode Tauri dev**: Fenêtre affiche interface React complète
- [ ] **Page Chat**: Scroll propre, header fixe, input accessible
- [ ] **Navigation**: Sidebar fonctionnelle, routes OK
- [ ] **Console**: Logs appropriés selon contexte

### ❌ Ce qui NE DOIT PLUS apparaître

- [ ] Écran rouge "🔒 MODE TAURI EXCLUSIF"
- [ ] Message "HTML CHARGÉ ! Tauri: NON"
- [ ] Double scrollbar (AppShell + Chat)
- [ ] Input chat coupé/invisible
- [ ] Erreurs console React

---

## 🔬 TEST 1: Mode Dev Navigateur

### Commande
```bash
pnpm dev
```

### Validation Visuelle

**1. Démarrage**
```
Console attendue:
  VITE v6.4.1  ready in XXX ms
  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

✅ **Serveur démarre sans erreur**

**2. Ouvrir Browser**
- URL: `http://localhost:5173`
- DevTools: Console + Elements

**3. Console Browser**
```javascript
// ✅ Log attendu:
"📱 TITANE∞ - Mode développement browser
   Contexte: http://localhost:5173
   Note: Pour tester Tauri, utilisez: pnpm tauri dev"
```

✅ **Pas d'erreur console**
✅ **Log informatif (console.info, pas error)**

**4. Visuel Interface**

**Sidebar (gauche):**
```
┌─────────────────┐
│ 🏠 Dashboard    │
│ 💬 Chat         │
│ 🧠 Cognitive    │
│ 📊 Progression  │
│ 🎨 Design       │
│ ⚙️  Système     │
└─────────────────┘
```
✅ **Sidebar visible et cliquable**

**Zone Principale:**
```
┌─────────────────────────────────────┐
│ Header (titre page + actions)      │
├─────────────────────────────────────┤
│                                     │
│ Contenu page (Dashboard/Chat/etc.) │
│                                     │
│ [Scroll si nécessaire]              │
│                                     │
└─────────────────────────────────────┘
```
✅ **Layout complet visible**
✅ **Pas d'écran rouge "MODE TAURI EXCLUSIF"**
✅ **Pas de message "HTML CHARGÉ"**

**5. Navigation**
- Cliquer: Chat → Dashboard → Cognitive
- ✅ **Routes changent correctement**
- ✅ **Pas de reload page**
- ✅ **URL update dans barre adresse**

**6. DevTools Elements**
```html
<body>
  <div id="root">
    <div class="theme-provider">
      <div style="display:flex; height:100vh; ...">  <!-- AppShell -->
        <aside>...</aside>  <!-- Sidebar -->
        <main>...</main>    <!-- Content -->
      </div>
    </div>
  </div>
</body>
```
✅ **Structure React complète dans #root**
✅ **Pas de HTML statique écrasant le DOM**

---

## 🔬 TEST 2: Mode Tauri Dev

### Commande
```bash
pnpm tauri dev
```

### Validation Visuelle

**1. Démarrage**
```
Console attendue (Rust):
  Compiling titane-infinity v17.x...
  Finished dev [unoptimized + debuginfo] target(s) in XX.XXs

Console attendue (Vite):
  VITE v6.4.1  ready in XXX ms
  ➜  Local:   http://127.0.0.1:1430/
```

✅ **Compilation Rust OK**
✅ **Serveur Vite OK (port 1430)**

**2. Fenêtre Tauri**

**Apparence:**
```
┌─────────────────────────────────────────┐
│ TITANE∞ v17.x             [_ □ ✕]      │  ← Barre titre OS
├─────────────────────────────────────────┤
│ ← Sidebar │ Header                      │
├───────────┼─────────────────────────────┤
│           │                             │
│  🏠       │  Contenu Page               │
│  💬       │  (Dashboard/Chat/etc.)      │
│  🧠       │                             │
│  📊       │                             │
│  🎨       │                             │
│  ⚙️        │                             │
│           │                             │
└───────────┴─────────────────────────────┘
```

✅ **Interface React complète visible**
❌ **PAS d'écran rouge "MODE TAURI EXCLUSIF"**
❌ **PAS de message "HTML CHARGÉ"**

**3. Console Tauri (DevTools)**

Ouvrir DevTools: **F12** ou clic droit > Inspecter

**Console:**
```javascript
// ✅ Log attendu:
"✅ TITANE∞ - Contexte Tauri confirmé
   Protocol: http
   Version: v2.x
   Mode: Development"
```

✅ **Log confirmation Tauri**
✅ **Pas d'erreur console React**
✅ **Pas de warning "Browser context blocked"**

**4. Elements DevTools**
```html
<body>
  <div id="root">
    <div class="theme-provider">
      <div style="...">  <!-- AppShell -->
        <!-- Structure complète React -->
      </div>
    </div>
  </div>
</body>
```

✅ **Structure React intacte**
✅ **Pas de `<body>` écrasé par HTML statique**

---

## 🔬 TEST 3: Page Chat Spécifique

### Accès
- Mode dev: `http://localhost:5173` → Cliquer "💬 Chat"
- Mode Tauri: Fenêtre → Cliquer "💬 Chat" dans sidebar

### Layout Attendu

```
┌──────────────────────────────────────────────┐
│ 💬 Chat IA TITANE∞              [🗑️] [⚙️]   │  ← Header fixe
│ Intelligence artificielle cognitive...       │
├──────────────────────────────────────────────┤
│ ● Provider: Gemini  Latence: 245ms         │  ← Status bar
├──────────────────────────────────────────────┤
│                                              │
│ 🤖 Message assistant                         │  ← Messages
│                                              │     (zone scroll)
│ 👤 Message utilisateur                       │
│                                              │
│ 🤖 Autre message...                          │
│                                              │
│ [Scroll ↓]                                   │  ← UNE SEULE
│                                              │     scrollbar
├──────────────────────────────────────────────┤
│ ✨ Posez votre question...         [🎤] [▶] │  ← Input fixe
└──────────────────────────────────────────────┘
```

### Validations

**1. Structure Verticale**
- ✅ **Header fixe en haut** (ne scroll pas)
- ✅ **Messages zone scroll centrale** (scrollbar unique)
- ✅ **Input fixe en bas** (toujours visible)

**2. Scrolling**
- Scroller vers bas messages
- ✅ **Une seule scrollbar** (zone messages)
- ❌ **Pas de double scroll** (AppShell + Chat)
- ✅ **Header reste visible**
- ✅ **Input reste accessible**

**3. Responsive**
- Réduire largeur fenêtre (< 1024px)
- ✅ **Layout s'adapte**
- ✅ **Pas de débordement horizontal**
- ✅ **Input reste fonctionnel**

**4. Interaction**
- Taper texte dans input
- Cliquer bouton envoi
- ✅ **Message ajouté à la liste**
- ✅ **Auto-scroll vers bas**
- ✅ **Input cleared après envoi**

**5. Status Bar**
- Observer barre status (sous header)
- ✅ **Indicateur provider visible** (●)
- ✅ **Latence affichée**
- ✅ **Compteur messages OK**

---

## 🔬 TEST 4: Navigation & Modules

### Pages à Tester

**1. Dashboard (🏠)**
- ✅ Grille modules visible
- ✅ Cartes cliquables
- ✅ Pas de débordement

**2. Cognitive (🧠)**
- ✅ Graphiques/visualisations
- ✅ Layout propre

**3. System (⚙️)**
- ✅ Paramètres affichés
- ✅ Formulaires fonctionnels

**4. Design System (🎨)**
- ✅ Composants démo visibles
- ✅ Styles appliqués

### Validation Générale

**Pour chaque page:**
- [ ] Layout complet visible
- [ ] Pas d'écran blanc/erreur
- [ ] Scroll fonctionne si nécessaire
- [ ] Navigation sidebar reste accessible

---

## 🚨 PROBLÈMES POTENTIELS & SOLUTIONS

### Problème 1: Écran Rouge Persiste

**Symptôme:** "🔒 MODE TAURI EXCLUSIF" toujours visible

**Diagnostic:**
```bash
# Vérifier version fichiers
git status
git diff src/App.tsx
git diff src/core/tauri/environment.ts
```

**Solution:**
```bash
# Rebuild clean
pnpm install
rm -rf node_modules/.vite dist
pnpm run build
pnpm tauri dev
```

---

### Problème 2: Console Errors React

**Symptôme:** Erreurs "Cannot read property..." dans console

**Diagnostic:**
- Ouvrir DevTools Console
- Noter erreur exacte + stack trace

**Solution:**
```bash
# Type-check
pnpm run type-check

# Si erreurs TypeScript, corriger puis rebuild
```

---

### Problème 3: Double Scrollbar

**Symptôme:** Deux scrollbars visibles (AppShell + Chat)

**Diagnostic:**
```css
/* Inspecter DevTools Elements */
.chat-page { overflow: ? }
.chat-content { overflow: ? }
main { overflow: ? }
```

**Solution:**
- Vérifier `Chat.css` ligne 10-17
- Confirmer: `.chat-page` sans `overflow: hidden`
- Confirmer: `.chat-content` avec scroll

---

### Problème 4: UI Vide/Blanche

**Symptôme:** Fenêtre Tauri affiche page blanche

**Diagnostic:**
```javascript
// Console DevTools
// Chercher erreurs type:
"Failed to load module"
"Uncaught SyntaxError"
"Module not found"
```

**Solution:**
```bash
# Nettoyer cache complet
rm -rf node_modules dist src-tauri/target
pnpm install
pnpm run build
pnpm tauri dev
```

---

## ✅ CRITÈRES DE SUCCÈS

### Minimum Vital (Must Have)

- [x] Mode dev navigateur: UI visible
- [x] Mode Tauri dev: UI visible
- [x] Pas d'écran rouge blocage
- [x] Console: logs appropriés (pas d'erreurs)
- [x] Chat: layout fonctionnel

### Optimal (Should Have)

- [ ] Navigation fluide toutes pages
- [ ] Scroll propre (une seule scrollbar)
- [ ] Input chat toujours accessible
- [ ] Responsive OK (petites fenêtres)
- [ ] Pas d'erreurs console

### Bonus (Nice to Have)

- [ ] Animations transitions smooth
- [ ] Loading states propres
- [ ] HMR Vite fonctionnel
- [ ] Performance 60fps

---

## 📊 RAPPORT DE TEST

### Template Rapport

```markdown
# Test Validation UI - TITANE∞ v19.1.0

**Date:** 23 novembre 2025
**Testeur:** [Nom]
**Environnement:** Linux (Ubuntu/Pop!_OS)

## Résultats

### Mode Dev Navigateur
- [ ] ✅ UI visible
- [ ] ✅ Console logs OK
- [ ] ✅ Navigation fonctionnelle
- [ ] ❌ Problème: [décrire si échec]

### Mode Tauri Dev
- [ ] ✅ UI visible
- [ ] ✅ Pas d'écran rouge
- [ ] ✅ Chat fonctionnel
- [ ] ❌ Problème: [décrire si échec]

### Page Chat
- [ ] ✅ Layout correct
- [ ] ✅ Scroll propre
- [ ] ✅ Input accessible
- [ ] ❌ Problème: [décrire si échec]

## Conclusion
- **Status:** ✅ Validé / ⚠️ Partiel / ❌ Échec
- **Recommandations:** [si nécessaire]
```

---

## 🆘 SUPPORT

### En cas de blocage

**1. Logs Rust (Tauri)**
```bash
RUST_LOG=debug pnpm tauri dev 2>&1 | tee tauri-debug.log
```

**2. Logs Vite**
```bash
pnpm dev --debug 2>&1 | tee vite-debug.log
```

**3. Vérifier Fichiers Modifiés**
```bash
git status
git diff src/App.tsx
git diff src/core/tauri/environment.ts
git diff src/ui/pages/styles/Chat.css
```

**4. Nettoyer Tout**
```bash
rm -rf node_modules .vite dist src-tauri/target
pnpm install
pnpm run build
```

---

**Guide créé par TITANE∞ Test Agent v19.1.0**
*Corrections frontend appliquées - Validation requise*
*Durée test: 10-15 minutes*
