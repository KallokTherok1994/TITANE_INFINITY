# 🐛 TROUBLESHOOTING - Build Tauri échoue (Flatpak)

## Problème rencontré

```
Error: failed to run custom build command for `javascriptcore-rs-sys v1.1.1`
The system library `javascriptcoregtk-4.1` required by crate `javascriptcore-rs-sys` was not found.
```

## Cause

VS Code fonctionne dans un environnement **Flatpak** qui ne peut pas accéder aux bibliothèques système de l'hôte (`libwebkit2gtk-4.1-dev`, `libjavascriptcoregtk-4.1-dev`), même si elles sont installées.

## Solution 1: Build dans Docker (RECOMMANDÉ)

### Installation Docker

```bash
# Si Docker n'est pas installé
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
newgrp docker
```

### Build avec Docker

```bash
# Méthode automatique (script fourni)
./scripts/build-in-docker.sh

# Ou manuellement:
docker build -f Dockerfile.tauri-builder -t titane-builder .
docker run --rm -v $(pwd):/app -w /app titane-builder
```

**Avantages:**
- ✅ Environnement isolé et reproductible
- ✅ Toutes dépendances incluses dans l'image
- ✅ Fonctionne depuis n'importe quel environnement (Flatpak, snap, etc.)
- ✅ Identique au CI/CD GitHub Actions

**Durée:** ~10-15 minutes (première fois), 5-8 minutes (rebuilds)

## Solution 2: Build hors Flatpak

### Option A: VS Code natif

```bash
# Désinstaller VS Code Flatpak
flatpak uninstall com.visualstudio.code

# Installer VS Code natif via snap ou .deb
sudo snap install code --classic
# OU
wget -O /tmp/code.deb https://code.visualstudio.com/sha/download?build=stable&os=linux-deb-x64
sudo dpkg -i /tmp/code.deb
```

### Option B: Build depuis terminal système

```bash
# Sortir de Flatpak, utiliser terminal hôte
flatpak-spawn --host bash

# Naviguer vers le projet
cd ~/Documents/TITANE_INFINITY

# Build Tauri
pnpm tauri build --verbose
```

## Solution 3: GitHub Actions CI/CD (AUTOMATIQUE)

**Pour production, utilisez le CI/CD déjà configuré:**

```bash
# Créer tag et pusher (déclenche build automatique multi-plateformes)
git tag v17.3.0
git push origin v17.3.0
```

GitHub Actions va automatiquement:
- Build Linux (ubuntu-22.04 natif)
- Build Windows (windows-2022)
- Build macOS (macos-latest)
- Créer release avec tous les artefacts

**Avantages:**
- ✅ Zéro configuration locale requise
- ✅ Build sur environnements natifs (pas de Flatpak)
- ✅ Génération multi-plateformes (Linux, Windows, macOS)
- ✅ Release automatique sur GitHub

## Vérification des dépendances système

```bash
# Vérifier si les libs sont installées sur l'hôte
flatpak-spawn --host dpkg -l | grep -E "webkit2gtk|javascriptcore"

# Si manquantes, installer:
flatpak-spawn --host sudo apt-get install -y \
  libwebkit2gtk-4.1-dev \
  libjavascriptcoregtk-4.1-dev \
  build-essential \
  libssl-dev
```

## Comparaison des solutions

| Solution | Durée | Complexité | Production Ready | Multi-plateforme |
|----------|-------|------------|------------------|------------------|
| **Docker** | 10-15 min | Faible | ✅ Oui | Linux uniquement |
| **VS Code natif** | 5-10 min | Moyenne | ✅ Oui | Linux uniquement |
| **Terminal hôte** | 5-10 min | Faible | ✅ Oui | Linux uniquement |
| **CI/CD GitHub** | 15-25 min | Très faible | ✅✅ Oui | ✅ Linux + Windows + macOS |

## Recommandation

**Pour développement local:** Utilisez **Docker** (`./scripts/build-in-docker.sh`)

**Pour production:** Utilisez **CI/CD GitHub Actions** (automatique sur `git tag v17.3.0`)

## Fichiers créés pour Docker

- `Dockerfile.tauri-builder` - Image Docker avec toutes dépendances
- `scripts/build-in-docker.sh` - Script automatisé de build Docker

## Support

Si problèmes persistent:
1. Vérifier logs: `/tmp/tauri-build.log`
2. Tester Docker: `docker run --rm ubuntu:22.04 apt-get update`
3. Voir documentation: `DEPLOYMENT_PRODUCTION_TAURI_v17.3.0.md`
