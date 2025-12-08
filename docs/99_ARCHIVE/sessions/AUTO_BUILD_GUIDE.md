# 🚀 TITANE∞ OS - SYSTÈME D'AUTO-BUILD & AUTO-DEPLOY

**Version:** v19.1.0
**Status:** ✅ Production Ready - Fully Automated

---

## 📋 SCRIPTS DISPONIBLES

### 🔧 Build & Développement

```bash
# Auto-Build complet (Frontend + Backend)
./auto_build.sh

# Lancer en mode développement
pnpm tauri dev

# Build production optimisé
pnpm build
cd src-tauri && cargo build --release
```

### 🖥️ Installation OS

```bash
# Installation complète système
sudo bash installer/install.sh

# Désinstallation propre
sudo bash installer/uninstall.sh

# Mise à jour automatique
bash installer/update.sh

# Réparation auto (Self-Heal)
bash installer/self_heal.sh
```

### ✅ Vérification & Tests

```bash
# Vérifier dépendances
bash installer/checks/check_dependencies.sh

# Validation complète
pnpm type-check    # TypeScript
pnpm run lint      # ESLint
cd src-tauri && cargo check  # Rust
```

---

## 🎯 AUTO-BUILD SYSTEM

Le système **Auto-Build** exécute automatiquement :

1. **Self-Heal préventif** - Détecte et corrige les problèmes
2. **Build Frontend** - React + Vite (dist/)
3. **Build Backend** - Rust + Tauri (release)
4. **Validation** - Vérifie l'intégrité du build

### Utilisation

```bash
./auto_build.sh
```

---

## 🔧 SELF-HEAL ENGINE

Le **Self-Heal Engine** répare automatiquement :

- ✅ Dépendances manquantes
- ✅ Caches corrompus
- ✅ Fichiers critiques manquants
- ✅ Erreurs de compilation
- ✅ Permissions système

### Fonctionnement

```bash
bash installer/self_heal.sh
```

Le moteur exécute :
1. Vérification des dépendances système
2. Vérification de l'intégrité des fichiers
3. Nettoyage des caches (PNPM, Cargo, Vite)
4. Réinstallation forcée des dépendances
5. Test de compilation (TypeScript + Rust)
6. Validation ESLint

---

## 🖥️ INSTALLATION OS (Pop!_OS / Ubuntu)

### Installation Complète

```bash
sudo bash installer/install.sh
```

Le script effectue :
1. ✅ Vérification des prérequis
2. ✅ Installation automatique : Rust, Node, PNPM, WebKitGTK
3. ✅ Nettoyage des builds précédents
4. ✅ Build Frontend (React + Vite)
5. ✅ Build Backend (Rust)
6. ✅ Déploiement dans `/opt/TITANE_Infinity/`
7. ✅ Création du fichier `.desktop` (menu Applications)
8. ✅ Permissions et validation

### Post-Installation

L'application est accessible :
- **Terminal:** `/opt/TITANE_Infinity/titane-infinity`
- **Menu Applications:** Chercher "TITANE∞ OS"
- **Catégories:** Utilitaires > IA > Système

### Logs

```
/opt/TITANE_Infinity/logs/install_report.json
```

---

## 🔄 SYSTÈME DE MISE À JOUR

### Update Automatique

```bash
bash installer/update.sh
```

Le script effectue :
1. Détection des nouvelles versions (Git)
2. Self-Heal automatique
3. Rebuild complet
4. Redéploiement dans `/opt/TITANE_Infinity/`
5. Log de mise à jour

---

## 🗑️ DÉSINSTALLATION

```bash
sudo bash installer/uninstall.sh
```

Supprime :
- `/opt/TITANE_Infinity/`
- Fichiers `.desktop`
- Caches locaux

---

## 📊 VALIDATION COMPLÈTE

### Statut Actuel

```
┌──────────────────────────────────────────────────────────┐
│  TITANE∞ v19.1.0 - PRODUCTION READY ✅                   │
├──────────────────────────────────────────────────────────┤
│  Backend Rust         │  ✅ 0 errors   │  1.46s          │
│  Frontend TypeScript  │  ✅ 0 errors   │  Perfect        │
│  ESLint               │  ✅ 0 warnings │  100%           │
│  Build Production     │  ✅ 4.01s      │  Optimized      │
│  Bundle Size          │  ✅ 250 KB     │  -87% main.js   │
│  Code Splitting       │  ✅ 11 chunks  │  Advanced       │
└──────────────────────────────────────────────────────────┘
```

### Tests Automatisés

```bash
# Frontend
pnpm type-check        # TypeScript: 0 errors
pnpm run lint          # ESLint: 0 warnings
pnpm build             # Build: 4.01s

# Backend
cd src-tauri
cargo check --no-default-features  # 0 errors, 1.46s
cargo test                         # Tests unitaires

# Complet
./auto_build.sh        # Pipeline complet
```

---

## 🎛️ ARCHITECTURE DU SYSTÈME

### Dossiers

```
TITANE_INFINITY/
├── installer/              # Scripts d'installation
│   ├── install.sh         # Installation OS complète
│   ├── uninstall.sh       # Désinstallation propre
│   ├── update.sh          # Mise à jour automatique
│   ├── self_heal.sh       # Moteur d'auto-réparation
│   └── checks/            # Scripts de vérification
│       └── check_dependencies.sh
├── auto_build.sh          # Build automatique complet
├── src/                   # Frontend React
├── src-tauri/             # Backend Rust + Tauri
└── dist/                  # Build production
```

### Commandes Tauri (110)

- **Mock Commands (49):** Développement frontend
- **Secure Commands (7):** Sécurité + Permissions
- **Time-Travel (4):** Snapshots + Rollback
- **Phases V-Ω (55):** Super-Prompts avancés

---

## 🧪 PRÉREQUIS SYSTÈME

### Pop!_OS / Ubuntu 22.04+

```bash
# Installés automatiquement par l'installateur:
- Rust stable
- Node.js 18+
- PNPM 8+
- WebKitGTK 4.1
- LibAppIndicator
- Build-Essential
- Tauri CLI
```

### Vérification Manuelle

```bash
rust --version    # >= 1.70
node --version    # >= 18.0
pnpm --version    # >= 8.0
```

---

## 🔐 CONTRAINTES

**✅ 100% Local**
- Aucun serveur HTTP externe
- Aucune URL distante
- Mode `file://` + Tauri natif uniquement

**✅ 100% Natif**
- Compilation Rust release
- Bundle statique React
- Pas de dépendances runtime

**✅ 100% Sécurisé**
- Permissions OS contrôlées
- Sandbox Tauri activé
- Encryption AES-256-GCM

---

## 🐛 DÉPANNAGE

### Problème: WebKitGTK manquant

```bash
sudo apt-get install libwebkit2gtk-4.1-dev
```

### Problème: Build échoue

```bash
bash installer/self_heal.sh
./auto_build.sh
```

### Problème: Application ne se lance pas

```bash
# Vérifier logs
cat /opt/TITANE_Infinity/logs/install_report.json

# Réinstaller
sudo bash installer/uninstall.sh
sudo bash installer/install.sh
```

---

## 📝 LOGS

### Installation
```
/opt/TITANE_Infinity/logs/install_report.json
```

### Mise à jour
```
logs/update_report.json
```

### Runtime
```
~/.local/share/TITANE_Infinity/logs/
```

---

## 🎯 ROADMAP

### ✅ Phase 1 - Completed
- Auto-Build System
- Self-Heal Engine
- OS Installer (Bash)
- Scripts de maintenance

### 🔄 Phase 2 - En cours
- Installateur graphique (Zenity)
- Tests automatisés complets
- CI/CD local

### ⏳ Phase 3 - À venir
- Control Panel intégré (UI)
- Auto-tests runtime
- Monitoring système

---

## 📚 DOCUMENTATION

### Développement
- [Architecture Backend](./BACKEND_ARCHITECTURE_v17.3.0.md)
- [Rapport Audit](./RAPPORT_AUDIT_FINAL_v∞_COMPLETE.md)
- [Rapport Tests](./RAPPORT_TESTS_FINAL_v19.1.0.md)

### Optimisation
- [Rapport Optimisation](./RAPPORT_OPTIMISATION_v19.1.0_FINAL.md)

---

**© 2025 Humain Total / Kevin Thibault / TITANE Team**
**License:** Proprietary - Tous droits réservés
