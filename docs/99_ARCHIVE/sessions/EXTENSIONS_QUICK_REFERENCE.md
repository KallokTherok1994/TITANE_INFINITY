# ═══════════════════════════════════════════════════════════════════════════
# TITANE∞ v19.2.0 — Guide Rapide Extensions & Configuration
# Référence rapide pour développement optimal
# © 2025 Humain Total / Kevin Thibault
# ═══════════════════════════════════════════════════════════════════════════

## 🚀 Démarrage Rapide

### Vérifier l'environnement
```bash
./validate_post_migration.sh      # Validation complète environnement
./validate_extensions.sh          # Validation extensions VS Code
```

### Lancer le projet
```bash
pnpm run tauri:dev                 # Mode développement (recommandé)
pnpm run tauri:build               # Build production
```

### Raccourcis clavier VS Code
- `Ctrl+Shift+B` → Tauri Dev (défaut)
- `F5` → Debug (choisir configuration)
- `Ctrl+Shift+P` → Command Palette
- `Ctrl+P` → Quick Open fichiers

---

## 🔧 Extensions par Catégorie

### 🦀 Rust/Tauri (7)
```
✅ rust-lang.rust-analyzer          # LSP Rust principal
✅ tauri-apps.tauri-vscode          # Intégration Tauri
✅ vadimcn.vscode-lldb              # Debugger
✅ tamasfe.even-better-toml         # Support Cargo.toml
✅ 1yib.rust-bundle                 # Bundle utilities
✅ dustypomerleau.rust-syntax       # Syntax highlighting
✅ swellaby.vscode-rust-test-adapter # Tests
```

**Commandes utiles:**
- `Ctrl+Shift+P` → "Rust Analyzer: Restart Server"
- `Ctrl+Shift+P` → "Rust Analyzer: Show Syntax Tree"
- `Ctrl+Shift+P` → "Rust Analyzer: Expand Macro"

### ⚛️ React/TypeScript (8)
```
✅ dbaeumer.vscode-eslint           # Linter
✅ esbenp.prettier-vscode           # Formatter (désactivé)
✅ dsznajder.es7-react-js-snippets  # Snippets React
✅ burkeholland.simple-react-snippets
✅ planbcoding.vscode-react-refactor
✅ steoates.autoimport              # Auto-import
✅ lyngai.vscode-eslint-ts-fix
```

**Snippets React utiles:**
- `rafce` → React Arrow Function Component Export
- `rce` → React Class Export
- `useState` → useState snippet
- `useEffect` → useEffect snippet

### 🎨 Tailwind CSS (5)
```
✅ bradlc.vscode-tailwindcss        # IntelliSense
✅ bourhaouta.tailwindshades        # Color shades
✅ heybourn.headwind                # Class sorting
✅ pranaygp.vscode-css-peek         # Navigation CSS
✅ naumovs.color-highlight          # Preview couleurs
```

**Configuration clsx:**
```typescript
import clsx from 'clsx';

<div className={clsx(
  'base-class',
  condition && 'conditional-class'
)} />
```

### 🧪 Testing (4)
```
✅ hbenl.vscode-test-explorer       # UI tests
✅ ms-playwright.playwright         # E2E tests
✅ ryanluker.vscode-coverage-gutters # Coverage
✅ ms-vscode.test-adapter-converter
```

**Commandes tests:**
```bash
pnpm run test              # Tous tests
pnpm run test:watch        # Watch mode
pnpm run test:coverage     # Coverage
pnpm run test:e2e          # Playwright
```

### 🔍 Code Quality (4)
```
✅ usernamehw.errorlens              # Diagnostics inline
✅ streetsidesoftware.code-spell-checker # EN
✅ streetsidesoftware.code-spell-checker-french # FR
✅ gruntfuggly.todo-tree             # TODOs
```

**Tags TODO supportés:**
- `TODO:` → À faire
- `FIXME:` → À corriger
- `NOTE:` → Note
- `HACK:` → Solution temporaire
- `BUG:` → Bug connu

---

## 🐛 Debug Configurations

### Rust Backend
```json
F5 → "🦀 Debug Tauri Backend (Dev)"
F5 → "🦀 Debug Tauri App (Full)"
F5 → "🦀 Debug Rust Tests"
```

### React Frontend
```json
F5 → "🌐 Debug Frontend (Chrome)"
F5 → "🌐 Debug Frontend (Edge)"
```

### Full Stack
```json
F5 → "🚀 Debug Full Stack (Tauri + React)"
```

**Breakpoints:**
- Rust: Cliquer sur marge gauche fichier `.rs`
- TypeScript: Cliquer sur marge gauche fichier `.ts/.tsx`
- Inspect variables: Hover sur variable pendant debug

---

## ⚙️ Settings.json Clés

### TypeScript
```jsonc
{
  "typescript.tsserver.maxTsServerMemory": 4096,
  "typescript.updateImportsOnFileMove.enabled": "always",
  "typescript.suggest.autoImports": true
}
```

### Rust Analyzer
```jsonc
{
  "rust-analyzer.server.path": "/home/titane/.cargo/bin/rust-analyzer",
  "rust-analyzer.checkOnSave": true,
  "rust-analyzer.check.command": "clippy"
}
```

### Tailwind
```jsonc
{
  "tailwindCSS.experimental.classRegex": [
    ["clsx\\(([^)]*)\\)", "(?:'|\"|`)([^\"'`]*)(?:'|\"|`)"]
  ]
}
```

### Path Aliases
```jsonc
{
  "path-intellisense.mappings": {
    "@": "${workspaceRoot}/src",
    "@ui": "${workspaceRoot}/src/ui",
    "@hooks": "${workspaceRoot}/src/hooks"
  }
}
```

---

## 🎯 Tâches VS Code

### Accéder aux tâches
- `Ctrl+Shift+P` → "Tasks: Run Task"
- Ou `Ctrl+Shift+B` (build par défaut)

### Tâches disponibles
```
🚀 Tauri Dev           # pnpm run tauri:dev
🔨 Tauri Build         # pnpm run tauri:build
⚡ Vite Build          # pnpm run build
🧹 Clean All          # pnpm run clean
🔍 Type Check         # pnpm run type-check
🧪 Run Tests          # pnpm run test
🦀 Cargo Check        # cargo check
🦀 Cargo Clippy       # cargo clippy
```

---

## 📝 Spell Checker

### Dictionnaire personnalisé TITANE
```json
"cSpell.words": [
  "TITANE", "tauri", "vite", "clsx", "lucide",
  "zustand", "framer", "recharts", "webkit",
  "rustc", "clippy", "webview"
]
```

### Ajouter mot au dictionnaire
- Clic droit sur mot souligné
- "Spell: Add to Workspace Dictionary"

### Langues actives
- `en` → Anglais
- `fr` → Français

---

## 🌳 Git Integration (GitLens)

### Fonctionnalités actives
- ✅ Current line blame (inline)
- ✅ Status bar info
- ❌ CodeLens (désactivé pour performance)

### Commandes GitLens
- `Ctrl+Shift+P` → "GitLens: Show Line History"
- `Ctrl+Shift+P` → "GitLens: Show File History"
- `Ctrl+Shift+P` → "GitLens: Toggle Line Blame"

---

## 🎨 Thème & Icons

### Thème actuel
```json
"workbench.colorTheme": "One Dark Pro"
```

### Icons
```json
"workbench.iconTheme": "material-icon-theme"
```

**Associations dossiers:**
- `features/` → Components icon
- `stores/` → State icon
- `services/` → API icon
- `hooks/` → Hook icon

---

## 🔥 Résolution Problèmes Courants

### Rust Analyzer ne démarre pas
```bash
# Terminal
rustup component add rust-analyzer

# VS Code
Ctrl+Shift+P → "Rust Analyzer: Restart Server"
```

### TypeScript lent
```bash
# Vérifier cache
rm -rf node_modules/.cache
pnpm run type-check
```

### Hot-reload ne fonctionne pas
```bash
# Augmenter watchers
echo 'fs.inotify.max_user_watches=524288' | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

### ESLint erreurs persistantes
```bash
# Nettoyer cache
rm -f .eslintcache
pnpm run lint:fix
```

### Tailwind IntelliSense inactif
```bash
# Vérifier extension active
code --list-extensions | grep tailwindcss

# Redémarrer extension
Ctrl+Shift+P → "Developer: Reload Window"
```

### Debugger LLDB erreur
```bash
# Vérifier bibliothèque
ls -la /usr/lib/x86_64-linux-gnu/liblldb.so

# Si manquante
sudo apt install lldb
```

---

## 📊 Monitoring Performance

### Extensions qui consomment le plus
- `Ctrl+Shift+P` → "Developer: Show Running Extensions"

### Diagnostics
- `Ctrl+Shift+P` → "Developer: Toggle Developer Tools"
- Onglet "Console" pour logs
- Onglet "Performance" pour profiling

### Optimisations actives
```json
{
  "extensions.autoUpdate": false,
  "telemetry.telemetryLevel": "off",
  "typescript.tsserver.maxTsServerMemory": 4096,
  "rust-analyzer.numThreads": 4
}
```

---

## 🚀 Workflow Recommandé

### 1. Démarrer session
```bash
# Terminal 1
pnpm run tauri:dev

# VS Code
# Ouvrir fichiers nécessaires
# Rust Analyzer charge automatiquement
```

### 2. Développer
- TypeScript: Auto-complétion + imports automatiques
- Rust: Clippy inline + auto-complétion
- Tailwind: Classes suggérées avec preview couleurs
- Git: Blame inline pour voir historique

### 3. Tester
```bash
# Tests unitaires
pnpm run test:watch

# E2E
pnpm run test:e2e

# Coverage
pnpm run test:coverage
```

### 4. Déboguer
- Placer breakpoints
- `F5` → Configuration adaptée
- Inspecter variables
- Step through code

### 5. Commit
- GitLens montre fichiers modifiés
- ESLint auto-fix à la sauvegarde
- Spell check actif
- Source Control panel (Ctrl+Shift+G)

---

## 📚 Documentation

### Fichiers de référence
- `POST_MIGRATION_NATIVE_SETUP.md` → Migration Flatpak → Natif
- `EXTENSIONS_CONFIGURATION_REPORT.md` → Rapport complet extensions
- `TAURI_SETUP_INSTRUCTIONS.md` → Setup Tauri
- `QUICK_START_v17.3.0.md` → Démarrage projet

### Documentation extensions
- Rust Analyzer: https://rust-analyzer.github.io/
- Tauri: https://tauri.app/v1/guides/
- Tailwind: https://tailwindcss.com/docs

---

## ✅ Checklist Quotidienne

Avant de commencer à coder:
- [ ] `git pull` (dernières modifications)
- [ ] Vérifier Rust Analyzer actif (🦀 dans status bar)
- [ ] Lancer `pnpm run tauri:dev`
- [ ] Vérifier aucune erreur TypeScript/Rust
- [ ] Tests passent: `pnpm run test`

Pendant le développement:
- [ ] ESLint auto-fix actif
- [ ] Spell checker actif
- [ ] Hot-reload fonctionne
- [ ] Breakpoints fonctionnels si debug

Avant commit:
- [ ] `pnpm run type-check` (0 erreurs)
- [ ] `cargo clippy` (warnings acceptables)
- [ ] Tests passent
- [ ] Build production OK: `pnpm run tauri:build`

---

**© 2025 TITANE∞ Team — Humain Total / Kevin Thibault**
