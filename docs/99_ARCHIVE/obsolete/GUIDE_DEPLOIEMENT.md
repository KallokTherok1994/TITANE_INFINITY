# 🔮 TITANE∞ v10.0.0 — GUIDE DE DÉPLOIEMENT

## Vue d'ensemble

Ce guide décrit le processus de déploiement automatique complet de TITANE∞ v10.0.0.

## Prérequis

### Environnement

- **Système hôte** : Pop!_OS 22.04 LTS (ou Ubuntu/Debian)
- **Runtime actuel** : Flatpak (VS Code Flatpak)
- **Accès** : `flatpak-spawn` disponible pour accéder à l'hôte

### Dépendances système hôte

```bash
# Vérification
flatpak-spawn --host pkg-config --modversion webkit2gtk-4.1
# Attendu : 2.48.7 (ou supérieur)

# Si manquant, installer :
flatpak-spawn --host sudo apt update
flatpak-spawn --host sudo apt install -y \
    libwebkit2gtk-4.1-dev \
    libjavascriptcoregtk-4.1-dev \
    build-essential \
    pkg-config
```

### Rust/Cargo système hôte

```bash
# Vérification
flatpak-spawn --host bash -c 'source $HOME/.cargo/env && cargo --version'
# Attendu : cargo 1.91.1 (ou supérieur)

# Si manquant, installer :
flatpak-spawn --host bash -c 'curl --proto "=https" --tlsv1.2 -sSf https://sh.rustup.rs | sh'
```

### Tauri CLI

```bash
# Vérification
flatpak-spawn --host bash -c 'source $HOME/.cargo/env && cargo-tauri --version'

# Installation automatique par le script, ou manuel :
flatpak-spawn --host bash -c 'source $HOME/.cargo/env && cargo install tauri-cli --version ^2.0.0'
```

## Scripts disponibles

### 1. `DEPLOY_AUTO_COMPLET.sh` ⭐ (Recommandé)

**Script complet de déploiement automatique 100% stable**

```bash
cd /home/titane_os/Documents/TITANE_NEWGEN/TITANE_INFINITY
bash ./DEPLOY_AUTO_COMPLET.sh
```

**Fonctionnalités** :
- ✅ Vérification complète environnement (7 étapes)
- ✅ Validation code Rust (fmt, check, clippy)
- ✅ Tests unitaires (47 tests)
- ✅ Build frontend (pnpm run build)
- ✅ Build backend release (cargo build --release)
- ✅ Packaging complet (binaire + assets + scripts)
- ✅ Archive tar.gz avec checksums SHA256
- ✅ Logs détaillés horodatés
- ✅ Gestion erreurs robuste (set -e)

**Durée estimée** : 15-25 minutes (selon CPU)

**Sortie** :
```
deploy/
├── titane-infinity-v10.0.0-YYYYMMDD-HHMMSS/
│   ├── titane-infinity (binaire)
│   ├── dist/ (frontend)
│   ├── launch.sh
│   ├── VERSION.txt
│   └── README.md
├── titane-infinity-v10.0.0-YYYYMMDD-HHMMSS.tar.gz
└── titane-infinity-v10.0.0-YYYYMMDD-HHMMSS.tar.gz.sha256
```

### 2. `SOLUTION_WEBKIT.sh`

**Build backend uniquement (sans tests ni packaging)**

```bash
cd /home/titane_os/Documents/TITANE_NEWGEN/TITANE_INFINITY
bash ./SOLUTION_WEBKIT.sh
```

**Fonctionnalités** :
- ✅ Vérification environnement (4 checks)
- ✅ Build backend release uniquement
- ⚠️  Pas de tests
- ⚠️  Pas de packaging

**Durée estimée** : 10-15 minutes

**Sortie** :
```
src-tauri/target/release/titane-infinity
```

## Étapes détaillées (DEPLOY_AUTO_COMPLET.sh)

### ÉTAPE 1/7 : Vérification environnement

Vérifie :
- ✅ Environnement Flatpak (`$FLATPAK_ID`)
- ✅ `flatpak-spawn` disponible
- ✅ Système hôte (Pop!_OS 22.04)
- ✅ webkit2gtk-4.1 v2.48.7
- ✅ Rust/Cargo v1.91.1
- ✅ Tauri CLI (installation auto si manquant)

**Sortie exemple** :
```
✅ Environnement: com.visualstudio.code
✅ flatpak-spawn disponible
✅ Système hôte: Pop!_OS 22.04 LTS
✅ webkit2gtk-4.1: v2.48.7
✅ Rust/Cargo: v1.91.1
✅ Tauri CLI: installé
```

### ÉTAPE 2/7 : Vérification projet

Vérifie :
- ✅ Répertoire projet existe
- ✅ Répertoire Tauri existe
- ✅ `Cargo.toml` présent
- ✅ `src/main.rs` présent
- ✅ Compte fichiers Rust (365 fichiers)

**Sortie exemple** :
```
✅ Projet: /home/titane_os/Documents/TITANE_NEWGEN/TITANE_INFINITY
✅ Tauri: .../src-tauri
✅ Cargo.toml: OK
✅ main.rs: OK
✅ Fichiers Rust: 365
```

### ÉTAPE 3/7 : Vérification code Rust

Exécute :
1. `cargo fmt --all` : Formatage canonique
2. `cargo check` : Vérification syntaxe (0 erreur attendue)
3. `cargo clippy` : Linting qualité code

**Sortie exemple** :
```
✅ Code formaté
✅ Cargo check: OK (0 erreur code Rust)
✅ Clippy: OK
```

**Arrêt si** : Erreurs de compilation détectées (`error[E0...]`)

### ÉTAPE 4/7 : Tests unitaires

Exécute :
- `cargo test` : Tous les tests (47 tests)

**Sortie exemple** :
```
✅ Tests: 47/47 réussis
```

**Arrêt si** : Tests échoués (`test result: FAILED`)

### ÉTAPE 5/7 : Build frontend

Vérifie ou build :
1. Si `dist/` existe → vérification `index.html`
2. Sinon → `pnpm run build` (sandbox ou hôte)

**Sortie exemple** :
```
✅ Frontend: dist/index.html OK
```

**Arrêt si** : npm non disponible et dist/ manquant

### ÉTAPE 6/7 : Build production backend

Exécute :
1. `cargo clean` : Nettoyage cache
2. `cargo build --release` : Build optimisé

**Durée** : 10-20 minutes (compilation 365 fichiers Rust)

**Sortie exemple** :
```
✅ Build réussi en 847s
✅ Binaire: .../target/release/titane-infinity (125M)
```

**Arrêt si** : Build échoué (exit code ≠ 0)

### ÉTAPE 7/7 : Packaging & déploiement

Crée :
1. Répertoire `deploy/titane-infinity-v10.0.0-TIMESTAMP/`
2. Copie binaire + frontend
3. Génère `VERSION.txt`, `launch.sh`, `README.md`
4. Archive `tar.gz` + checksum SHA256

**Sortie exemple** :
```
✅ Répertoire: deploy/titane-infinity-v10.0.0-20251119-093045
✅ Binaire copié et exécutable
✅ Frontend copié
✅ VERSION.txt généré
✅ launch.sh créé
✅ README.md généré
✅ Archive: titane-infinity-v10.0.0-20251119-093045.tar.gz (96M)
✅ SHA256: titane-infinity-v10.0.0-20251119-093045.tar.gz.sha256
```

## Rapport final

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ DÉPLOIEMENT RÉUSSI
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📦 Livrables :
   • Répertoire : deploy/titane-infinity-v10.0.0-20251119-093045
   • Archive    : deploy/titane-infinity-v10.0.0-20251119-093045.tar.gz (96M)
   • Binaire    : titane-infinity (125M)
   • Frontend   : dist/ (React + TypeScript)

📊 Statistiques :
   • Système    : Pop!_OS 22.04 LTS
   • Rust       : v1.91.1
   • Webkit     : v2.48.7
   • Fichiers   : 365 fichiers Rust
   • Tests      : 47/47 réussis (100%)
   • Build      : 847s

🚀 Lancement :
   cd deploy/titane-infinity-v10.0.0-20251119-093045
   ./launch.sh

📋 Logs complets : deploy_auto_20251119_093045.log

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎉 TITANE∞ v10.0.0 prêt pour production !
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Lancement de l'application

### Méthode 1 : Script launch.sh (recommandé)

```bash
cd deploy/titane-infinity-v10.0.0-TIMESTAMP
./launch.sh
```

### Méthode 2 : Binaire direct

```bash
cd deploy/titane-infinity-v10.0.0-TIMESTAMP
export RUST_BACKTRACE=1
./titane-infinity
```

### Méthode 3 : Depuis archive

```bash
tar -xzf titane-infinity-v10.0.0-TIMESTAMP.tar.gz
cd titane-infinity-v10.0.0-TIMESTAMP
./launch.sh
```

## Vérification intégrité

```bash
# Vérifier checksum SHA256
sha256sum -c titane-infinity-v10.0.0-TIMESTAMP.tar.gz.sha256

# Sortie attendue :
# titane-infinity-v10.0.0-TIMESTAMP.tar.gz: OK
```

## Dépannage

### Erreur : "webkit2gtk-4.1 not found"

**Cause** : webkit2gtk-4.1 non installé sur système hôte

**Solution** :
```bash
flatpak-spawn --host sudo apt update
flatpak-spawn --host sudo apt install -y libwebkit2gtk-4.1-dev libjavascriptcoregtk-4.1-dev
```

### Erreur : "Rust/Cargo non installé"

**Cause** : Rust non disponible sur système hôte

**Solution** :
```bash
flatpak-spawn --host bash -c 'curl --proto "=https" --tlsv1.2 -sSf https://sh.rustup.rs | sh'
# Puis redémarrer le script
```

### Erreur : "npm: command not found"

**Cause** : Frontend non buildé et npm indisponible

**Solution** :
```bash
# Depuis sandbox Flatpak (si npm disponible)
cd /home/titane_os/Documents/TITANE_NEWGEN/TITANE_INFINITY
pnpm run build

# Ou installer npm sur hôte
flatpak-spawn --host sudo apt install -y nodejs npm
```

### Erreur : "Tests échoués"

**Cause** : Tests unitaires en échec

**Solution** :
```bash
# Vérifier logs détaillés
cat deploy_auto_TIMESTAMP.log | grep "test result"

# Corriger puis relancer
bash ./DEPLOY_AUTO_COMPLET.sh
```

### Erreur : "Build échoué"

**Cause** : Erreurs de compilation Rust

**Solution** :
```bash
# Vérifier erreurs spécifiques
cat deploy_auto_TIMESTAMP.log | grep "error\[E"

# Correction manuelle puis relancer
bash ./DEPLOY_AUTO_COMPLET.sh
```

## Logs

### Fichier log automatique

Chaque exécution génère un log horodaté :
```
deploy_auto_YYYYMMDD_HHMMSS.log
```

### Contenu

- Toutes les commandes exécutées
- Sorties complètes (stdout + stderr)
- Timestamps pour chaque étape
- Messages de succès/erreur/warning

### Consultation

```bash
# Voir log complet
cat deploy_auto_20251119_093045.log

# Filtrer erreurs
grep "ERROR" deploy_auto_20251119_093045.log

# Filtrer warnings
grep "⚠️" deploy_auto_20251119_093045.log
```

## Comparaison des scripts

| Fonctionnalité | DEPLOY_AUTO_COMPLET.sh | SOLUTION_WEBKIT.sh |
|----------------|------------------------|---------------------|
| Vérifications environnement | ✅ Complètes (7 checks) | ✅ Basiques (4 checks) |
| Validation code (fmt/check/clippy) | ✅ Oui | ❌ Non |
| Tests unitaires | ✅ Oui (47 tests) | ❌ Non |
| Build frontend | ✅ Automatique | ⚠️ Suppose existant |
| Build backend | ✅ Release optimisé | ✅ Release optimisé |
| Packaging | ✅ Complet (tar.gz + checksums) | ❌ Non |
| Scripts lancement | ✅ Oui (launch.sh) | ❌ Non |
| Documentation | ✅ Oui (VERSION.txt, README.md) | ❌ Non |
| Logs détaillés | ✅ Fichier horodaté | ⚠️ Sortie console |
| Gestion erreurs | ✅ Robuste (set -e) | ✅ Basique |
| Durée | 15-25 min | 10-15 min |
| **Recommandation** | ⭐ **PRODUCTION** | 🔧 **DEV/DEBUG** |

## Architecture finale

```
TITANE_INFINITY/
├── DEPLOY_AUTO_COMPLET.sh       ⭐ Script complet
├── SOLUTION_WEBKIT.sh           🔧 Script build rapide
├── GUIDE_DEPLOIEMENT.md         📖 Ce guide
├── DEPLOY_SUMMARY.txt           📊 Résumé v10
├── MANIFEST_FINAL_v10.txt       📋 Bilan complet
├── deploy/                      📦 Livrables
│   ├── titane-infinity-v10.0.0-TIMESTAMP/
│   │   ├── titane-infinity
│   │   ├── dist/
│   │   ├── launch.sh
│   │   ├── VERSION.txt
│   │   └── README.md
│   ├── titane-infinity-v10.0.0-TIMESTAMP.tar.gz
│   └── titane-infinity-v10.0.0-TIMESTAMP.tar.gz.sha256
├── deploy_auto_TIMESTAMP.log    📝 Logs détaillés
└── src-tauri/                   🦀 Code Rust
    ├── src/
    │   ├── main.rs (1980+ lignes)
    │   ├── shared/
    │   │   ├── utils.rs (117 lignes)
    │   │   └── macros.rs (73 lignes)
    │   └── [365 fichiers .rs]
    ├── Cargo.toml
    └── target/release/
        └── titane-infinity
```

## Support

### Documentation complète

- `DEPLOY_SUMMARY.txt` : Vue d'ensemble déploiement
- `MANIFEST_FINAL_v10.txt` : Statistiques complètes
- `RAPPORT_FINAL_COMPLET_v10.md` : Analyse exhaustive
- `STATUT_FINAL_v10.md` : État actuel projet

### Logs de build

- `deploy_auto_TIMESTAMP.log` : Logs déploiement complet
- `src-tauri/target/` : Artefacts Cargo

### Contact

Pour assistance, consulter les fichiers de documentation ou logs détaillés.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔮 TITANE∞ v10.0.0 — Guide de déploiement
Généré le 19 Novembre 2025
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
