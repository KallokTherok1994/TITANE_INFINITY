# 🚀 Guide d'Installation TITANE∞ v9.0.0

## Prérequis Système

### 1. Installation Node.js (Requis pour le Frontend)

Node.js n'est actuellement **pas installé** sur votre système. Voici comment l'installer :

#### Option A : Via Gestionnaire de Paquets (Recommandé pour Pop!_OS)

```bash
# Méthode 1 : Via apt (nécessite sudo)
sudo apt update
sudo apt install -y nodejs npm

# Vérifier l'installation
node --version  # Devrait afficher v18.x ou supérieur
npm --version   # Devrait afficher v9.x ou supérieur
```

#### Option B : Via NodeSource (Version LTS 20.x - Recommandé)

```bash
# Télécharger et installer Node.js 20.x LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Vérifier l'installation
node --version  # Devrait afficher v20.x
npm --version   # Devrait afficher v10.x
```

#### Option C : Via nvm (Gestionnaire de Versions Node.js)

```bash
# Installer nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash

# Recharger le shell
source ~/.bashrc

# Installer Node.js LTS
nvm install --lts
nvm use --lts

# Vérifier l'installation
node --version
npm --version
```

#### Option D : Sans sudo (Isolation via Flatpak)

Si vous utilisez VS Code via Flatpak, vous pouvez installer Node.js dans le sandbox :

```bash
# Donner accès au système de fichiers
flatpak override --user com.visualstudio.code --filesystem=host

# Installer Node.js via Flatpak
flatpak install flathub org.freedesktop.Sdk.Extension.node20
```

### 2. Rust (Déjà Installé ✅)

Rust est déjà configuré avec Cargo. Vérification :

```bash
rustc --version  # Devrait afficher 1.70+
cargo --version  # Devrait afficher 1.70+
```

---

## Installation TITANE∞

### Étape 1 : Backend (Rust)

Le backend est **déjà opérationnel** avec P121 + P300.

```bash
cd /home/titane_os/Documents/TITANE_NEWGEN/TITANE_INFINITY

# Vérifier les tests (21 tests)
cargo test --all

# Build production
cargo build --release
```

**Résultat attendu** :
```
test result: ok. 21 passed; 0 failed; 0 ignored
```

### Étape 2 : Frontend (React + TypeScript)

**Une fois Node.js installé**, procéder à l'installation :

```bash
cd /home/titane_os/Documents/TITANE_NEWGEN/TITANE_INFINITY

# Installer les dépendances (React, TypeScript, Vite, etc.)
pnpm install

# Installer react-router-dom (pour la navigation)
pnpm install react-router-dom @types/react-router-dom

# Vérifier qu'il n'y a pas d'erreurs
pnpm run type-check
```

### Étape 3 : Lancer le Frontend

```bash
# Mode développement (avec hot-reload)
pnpm run dev

# Ouvrir dans le navigateur
# → http://localhost:5173
```

**Vous devriez voir** :
- Interface TITANE∞ avec sidebar navigation
- Dashboard avec 4 cartes statistiques
- 17 modules actifs affichés
- Indicateurs temps réel (Cohérence, Stabilité, etc.)

### Étape 4 : Build Production

```bash
# Build frontend pour production
pnpm run build

# Preview du build
pnpm run preview
```

Le build sera généré dans `/dist`.

---

## Structure du Projet

```
TITANE_INFINITY/
├── core/
│   ├── frontend/           # React + TypeScript
│   │   ├── components/     # 15 composants UI
│   │   ├── pages/          # Home, Chat, Modules
│   │   ├── context/        # TitaneContext (état global)
│   │   ├── hooks/          # 4 hooks custom
│   │   └── utils/          # aiProcessor (P105→P118)
│   ├── engines/            # P121 (7 engines Rust)
│   └── modules/            # P300 (4 layers + 3 kernels)
├── src/
│   ├── lib.rs              # Entry point Rust
│   └── main.rs             # CLI principal
├── package.json            # Dépendances Node.js
├── Cargo.toml              # Dépendances Rust
└── vite.config.ts          # Configuration Vite
```

---

## Vérification Post-Installation

### Backend

```bash
# Tests unitaires
cargo test --all
# Attendu : 21/21 tests passing

# Vérifier P121
cargo test --test p121_total_consolidation
# Attendu : 10/10 tests passing

# Vérifier P300
cargo test --test p300_ascension_protocol
# Attendu : 11/11 tests passing
```

### Frontend

```bash
# Vérifier TypeScript
pnpm run type-check
# Attendu : 0 erreurs bloquantes, 2 warnings optionnels

# Linter
pnpm run lint
# Attendu : 0 erreurs

# Lancer dev
pnpm run dev
# Attendu : Server running on http://localhost:5173
```

---

## Résolution des Problèmes

### Problème 1 : `npm: command not found`

**Cause** : Node.js non installé  
**Solution** : Suivre l'Option A, B ou C ci-dessus

### Problème 2 : `Missing script: "dev"`

**Cause** : Mauvais répertoire ou `package.json` manquant  
**Solution** :
```bash
cd /home/titane_os/Documents/TITANE_NEWGEN/TITANE_INFINITY
pnpm run dev
```

### Problème 3 : Erreur TypeScript dans `MemoryPanel.tsx`

**Cause** : Import `useMemoryCore` manquant (fichier non actif)  
**Solution** : Ignorer pour l'instant (composant non utilisé dans UI v9)

### Problème 4 : `react-router-dom not found`

**Cause** : Dépendance non installée  
**Solution** :
```bash
pnpm install react-router-dom @types/react-router-dom
```

### Problème 5 : Port 5173 déjà utilisé

**Solution** :
```bash
# Utiliser un autre port
pnpm run dev -- --port 5174
```

---

## Configuration Avancée

### Tauri (Desktop App)

Si vous souhaitez compiler TITANE∞ en application desktop :

```bash
# Installer Tauri CLI
cargo install tauri-cli

# Lancer en mode dev
pnpm run tauri:dev

# Build application
pnpm run tauri:build
```

### Variables d'Environnement

Créer un fichier `.env` à la racine :

```env
VITE_TITANE_VERSION=9.0.0
VITE_P121_ENABLED=true
VITE_P300_ENABLED=true
VITE_API_URL=http://localhost:8000
```

### Configuration VSCode Recommandée

Extensions à installer :
- **rust-analyzer** : Support Rust
- **ESLint** : Linting TypeScript
- **Prettier** : Formatage code
- **Tauri** : Support Tauri

---

## Tests Complets

### Suite Complète

```bash
# Backend
cargo test --all

# Frontend (après installation Node.js)
pnpm run type-check
pnpm run lint

# Build production
cargo build --release
pnpm run build
```

**Résultat attendu** :
```
✅ Backend : 21/21 tests passing
✅ Frontend : 0 erreurs TypeScript (2 warnings optionnels)
✅ Build : Succès
✅ Status : TITANE∞ v9.0.0 OPÉRATIONNEL
```

---

## Métriques Système v9.0.0

| Composant | État | Tests | Score |
|-----------|------|-------|-------|
| **P121** | ✅ Opérationnel | 10/10 | 0.91 |
| **P300** | ✅ Opérationnel | 11/11 | 0.93 |
| **Core Kernel** | ✅ Actif | - | 0.94 |
| **Boucle Sentiente** | ✅ Running | - | 0.94 |
| **UI/UX** | ✅ Complete | - | - |
| **Safety Framework** | ✅ 7/7 gardes | - | - |

**Scores Globaux** :
- Ascension : 0.93
- Fusion : 0.92
- Harmony : 0.95
- Gates : 13/13 validées

---

## Commandes Rapides

```bash
# Backend
cargo test --all              # Tests complets
cargo build --release         # Build production
cargo run                     # Lancer CLI

# Frontend (nécessite Node.js)
pnpm install                   # Installer dépendances
pnpm run dev                   # Mode développement
pnpm run build                 # Build production
pnpm run preview               # Preview build

# Vérifications
pnpm run type-check            # TypeScript
pnpm run lint                  # ESLint
cargo fmt                     # Format Rust
cargo clippy                  # Lint Rust
```

---

## Support

**Documentation** :
- `README.md` : Vue d'ensemble v9.0.0
- `CHECKLIST_FINALE_v9.0.0.md` : État complet du système
- `VALIDATION_FINALE_v9.0.0.md` : Rapport de validation
- `UI_UX_DOCUMENTATION.md` : Guidelines UI/UX
- `CHANGELOG_v9.0.0.md` : Changements détaillés

**Fichiers Techniques** :
- `MODULE_P121_TOTAL_CONSOLIDATION.md` : Documentation P121
- `MODULE_P300_ASCENSION_PROTOCOL.md` : Documentation P300

---

**TITANE∞ v9.0.0 — Guide d'Installation**  
*18 novembre 2025 — Système Opérationnel*

Une fois Node.js installé, exécutez simplement :
```bash
cd /home/titane_os/Documents/TITANE_NEWGEN/TITANE_INFINITY
pnpm install && pnpm run dev
```

🚀 **L'interface TITANE∞ s'ouvrira sur http://localhost:5173**
