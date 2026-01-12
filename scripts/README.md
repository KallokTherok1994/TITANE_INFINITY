# 🚀 TITANE∞ v12 - Scripts Unifiés

Architecture complète des scripts de build, déploiement et maintenance.

## 📁 Structure

```
scripts/
├── build/              # Scripts de compilation
│   ├── build_production.sh
│   └── build_standalone.sh
├── deploy/             # Scripts de déploiement
│   └── deploy_complete.sh
├── fix/               # Scripts de correction
│   └── fix_webkit_dependencies.sh
├── test/              # Scripts de test
│   └── test_scripts.sh
├── utils/             # Bibliothèques partagées
│   └── common.sh
└── pipeline/          # Pipeline complet
    └── TITANE_PIPELINE_v12.sh
```

## ⚡ Quick Start

### Pipeline Complet (Recommandé)

```bash
# Lancer le pipeline complet
./quickstart_v12.sh

# Ou directement
./scripts/pipeline/TITANE_PIPELINE_v12.sh
```

**Options disponibles**:

```bash
--skip-tests      # Ignorer les tests
--skip-package    # Ignorer le packaging
--build-only      # Build seulement
--help            # Afficher l'aide
```

## 📦 Scripts Individuels

### Build Production

```bash
./scripts/build/build_production.sh
```

**Ce qu'il fait**:

- ✅ Vérifie l'environnement (cargo, node, webkit)
- ✅ Nettoie dist/ et target/
- ✅ Installe dépendances npm
- ✅ Build frontend (React + Vite)
- ✅ Build backend (Rust + Tauri)
- ✅ Valide le build

**Résultat**:

- Frontend: `dist/` (~2-3 MB)
- Backend: `src-tauri/target/release/titane-infinity` (~50-60 MB)

---

### Build Standalone

```bash
./scripts/build/build_standalone.sh
```

**Optimisations**:

- CPU natif: `-C target-cpu=native`
- Niveau d'optimisation maximum: `-C opt-level=3`
- Cache npm offline

**Idéal pour**: Déploiement sur machine de production

---

### Déploiement Complet

```bash
./scripts/deploy/deploy_complete.sh
```

**Pipeline**:

1. Build production
2. Packaging Tauri (AppImage, deb, rpm)
3. Copie bundles vers `deploy/`
4. Génération checksums SHA256
5. Rapport de déploiement

**Résultat**: Structure `deploy/`

```
deploy/
├── appimage/
│   └── *.AppImage
├── deb/
│   └── *.deb
├── rpm/
│   └── *.rpm
├── logs/
│   └── deploy_YYYYMMDD_HHMMSS.log
└── checksums_YYYYMMDD_HHMMSS.sha256
```

---

### Fix WebKit Dependencies

```bash
./scripts/fix/fix_webkit_dependencies.sh
```

**Installe automatiquement**:

- libwebkit2gtk-4.1-dev
- libjavascriptcoregtk-4.1-dev
- libgtk-3-dev
- libsoup-3.0-dev

**Distributions supportées**:

- ✅ Ubuntu / Pop!\_OS
- ✅ Debian
- ✅ Fedora
- ✅ Arch / Manjaro

---

### Test Scripts

```bash
./scripts/test/test_scripts.sh
```

**Validation**:

- ✅ Shebang correct
- ✅ Permissions exécution
- ✅ Shellcheck (si installé)
- ✅ Syntaxe bash

---

### Branch Synchronization Scripts (New!)

#### Verify Branch Sync

```bash
./scripts/verify-branch-sync.sh
```

**Purpose**: Analyzes dev ↔ MAIN branch relationship and recommends merge direction.

**Features**:

- ✅ Compares commits between branches
- ✅ Shows unique commits in each branch
- ✅ Provides data-driven recommendation
- ✅ Displays detailed commit info (date, author, message)
- ✅ Handles all scenarios (ahead/behind/diverged/synchronized)

**Use when**: Need to determine if dev should merge to MAIN or vice versa.

#### Merge dev to MAIN

```bash
./scripts/merge-dev-to-main.sh
```

**Purpose**: Automated merge of dev branch into MAIN with validation.

**Pipeline**:

1. ✅ Verifies working directory is clean
2. ✅ Fetches latest changes from remote
3. ✅ Checks out and updates MAIN
4. ✅ Shows commits to be merged
5. ✅ Asks for confirmation
6. ✅ Performs merge
7. ✅ Runs tests (if available)
8. ✅ Pushes to remote

**Use when**: verify-branch-sync.sh recommends merging dev → MAIN.

**Documentation**:

- Quick guide: `docs/MERGE_DEV_TO_MAIN_GUIDE.md`
- Deep analysis: `docs/DEV_TO_MAIN_MERGE_ANALYSIS.md`
- Decision framework: `docs/BRANCH_SYNC_RECONCILIATION.md`
- Executive summary: `EXECUTIVE_SUMMARY_BRANCH_SYNC.md`

---

## 🔧 Pipeline v12 - Détails

Le **TITANE_PIPELINE_v12.sh** est le script maître qui orchestre:

### Étape 1/7 - Vérification Environnement

- Cargo installé + version
- Node.js + npm installés
- WebKit2GTK-4.1 disponible
- Structure projet valide (src-tauri/, package.json)

### Étape 2/7 - Correction Automatique

- `cargo fmt --all` (formatage)
- `cargo clippy --fix` (linting)

### Étape 3/7 - Tests

- Test des scripts (shebang, permissions)
- `cargo check` (vérification compilation)

### Étape 4/7 - Build Frontend

- Nettoyage dist/
- Installation dépendances npm
- Build Vite (production)
- Validation dist/index.html

### Étape 5/7 - Build Backend

- Nettoyage target/
- Compilation release
- Optimisations Cargo

### Étape 6/7 - Packaging

- `cargo tauri build --release`
- Génération AppImage, deb, rpm

### Étape 7/7 - Vérification Finale

- Validation binaire
- Validation frontend
- Validation bundles
- Rapport complet

---

## 🛠️ Bibliothèque Commune (common.sh)

Toutes les fonctions partagées entre scripts.

### Fonctions de Logging

```bash
source scripts/utils/common.sh

log_info "Message informatif"
log_success "Opération réussie"
log_warn "Avertissement"
log_error "Erreur critique"
log_step "Étape en cours"
log_header "TITRE DE SECTION"
```

### Validations

```bash
check_command cargo    # Vérifie qu'une commande existe
check_cargo            # Vérifie Cargo + version
check_node             # Vérifie Node.js + npm
check_webkit           # Vérifie WebKit2GTK
check_environment      # Vérifie tout l'environnement
validate_src_tauri     # Vérifie src-tauri/Cargo.toml
validate_frontend      # Vérifie package.json
```

### Fonctions Build

```bash
clean_frontend         # Supprime dist/
clean_backend          # Cargo clean
install_npm_deps       # npm ci --prefer-offline
build_frontend         # npm run build
build_backend          # cargo build --release
validate_build         # Vérifie dist/ et binaire
```

---

## 🔒 Standards de Sécurité

Tous les scripts respectent:

### 1. Shebang Standard

```bash
#!/usr/bin/env bash
```

### 2. Strict Mode

```bash
set -euo pipefail
```

- `-e`: Stop sur erreur
- `-u`: Erreur sur variable non définie
- `-o pipefail`: Erreur si un élément du pipe échoue

### 3. Error Handler

```bash
trap 'error_handler ${LINENO}' ERR
```

### 4. Paths Absolus

```bash
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$SCRIPT_DIR/../.."
```

### 5. Validations Systématiques

```bash
check_environment || exit 1
validate_src_tauri || exit 1
[ -f "$FILE" ] || { log_error "Fichier manquant"; exit 1; }
```

---

## 📊 Comparaison avec v11

| Aspect         | v11          | v12           | Amélioration |
| -------------- | ------------ | ------------- | ------------ |
| Scripts total  | 77 dispersés | 7 centralisés | -91%         |
| Lignes de code | ~3000+       | ~900          | -70%         |
| Standards      | Mixte        | 100% bash     | Uniformisé   |
| Error handling | Partiel      | Complet       | +100%        |
| Paths          | Relatifs     | Absolus       | Robuste      |
| Validations    | Rares        | Systématiques | Sécurisé     |
| Logging        | Incohérent   | Standardisé   | Uniforme     |

---

## 🔀 Branch Consolidation (v26.2.2)

### Merge All Branches Script

```bash
./scripts/merge-all-branches.sh [--phase PHASE] [--dry-run] [--help]
```

**Ce qu'il fait**:

- ✅ Phase 1: Fast-forward des branches dev et stable-runtime
- ✅ Phase 2: Guide pour l'intégration des branches features
- ✅ Phase 3: Archivage des branches complétées

**Options**:

- `--phase 1|2|3`: Exécute une phase spécifique
- `--dry-run`: Mode simulation (aucune modification)
- `--help`: Affiche l'aide détaillée

**Exemple d'utilisation**:

```bash
# Tester ce qui va se passer
./scripts/merge-all-branches.sh --dry-run

# Exécuter Phase 1 uniquement (safe)
./scripts/merge-all-branches.sh --phase 1

# Exécuter toutes les phases
./scripts/merge-all-branches.sh
```

**Documentation complète**:

- `docs/BRANCH_CONSOLIDATION_REPORT_v26.2.2.md` - Analyse détaillée
- `docs/BRANCH_CONSOLIDATION_IMPLEMENTATION.md` - Guide d'implémentation

---

## 🐛 Dépannage

### Erreur: "Cargo non installé"

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env
```

### Erreur: "WebKit2GTK manquant"

```bash
./scripts/fix/fix_webkit_dependencies.sh
```

### Erreur: "src-tauri introuvable"

Vérifier que vous êtes à la racine du projet:

```bash
cd /home/titane_os/Documents/TITANE_NEWGEN/TITANE_INFINITY
```

### Erreur: "node_modules manquant"

```bash
npm install
# ou
npm ci
```

---

## 📝 Logs

Les logs sont stockés dans:

- Scripts: `logs/`
- Déploiement: `deploy/logs/`

---

## 🎯 Prochaines Étapes

1. **Tester le pipeline complet**:

   ```bash
   ./quickstart_v12.sh
   ```

2. **Migrer les scripts anciens**:
   - Remplacer `build_production.sh` → `scripts/build/build_production.sh`
   - Remplacer `deploy_auto.sh` → `scripts/deploy/deploy_complete.sh`

3. **Désactiver les scripts obsolètes**:
   ```bash
   mv build_production.sh build_production.sh.old
   mv deploy_auto.sh deploy_auto.sh.old
   ```

---

## 📚 Documentation

- **Rapport complet**: `RAPPORT_SCRIPTS_v12.md`
- **Rapport Rust**: `RAPPORT_FULL_FIX_v11.1.md`
- **Rapport Structure**: `RAPPORT_STRUCTURE_REPAIR_v12.md`

---

## ✨ Version

**TITANE∞ v12.0.0**  
**Scripts**: 7 créés + 1 bibliothèque  
**Lignes**: ~900 lignes de code propre  
**Standards**: 100% respectés  
**Statut**: ✅ Tech-Ready (Dev) | Production: ⛔ EN ATTENTE (autorisation requise)

---

🎉 **SCRIPTS 100% CORRIGÉS ET UNIFIÉS** 🎉
