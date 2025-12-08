# 🚨 BLOCAGE ENVIRONNEMENT FLATPAK — SOLUTION

**Date**: 24 novembre 2025
**Problème**: Compilation Rust bloquée malgré dépendances installées

---

## 🔍 Diagnostic

### ✅ Ce qui fonctionne

1. **Dépendances installées** :
   ```
   libwebkit2gtk-4.1-dev (2.48.7) ✅
   libjavascriptcoregtk-4.1-dev (2.48.7) ✅
   libgtk-3-dev (3.24.41) ✅
   ```

2. **Frontend Vite** :
   ```
   ✓ 2536 modules transformed
   ✓ Built in 4.68s
   dist/assets/main-nKP9dh-X.js   599.66 kB
   ```

### ❌ Ce qui bloque

**Erreur Rust linker** :
```
rust-lld: error: unable to find library -lwebkit2gtk-4.1
rust-lld: error: unable to find library -ljavascriptcoregtk-4.1
```

**Cause racine** :
```bash
$ cat /etc/os-release
NAME="Freedesktop SDK"
VERSION_ID=25.08
```

```bash
$ pkg-config --libs webkit2gtk-4.1
Package webkit2gtk-4.1 was not found in the pkg-config search path
```

**Explication** :
Le terminal actuel s'exécute dans un environnement Flatpak isolé (Freedesktop SDK 25.08). Même si les packages sont installés via `apt`, pkg-config ne les voit pas car il cherche dans le runtime Flatpak, pas sur le système hôte.

---

## ✅ SOLUTION

### Étape 1 : Sortir de l'environnement Flatpak

**Ouvrir un vrai terminal système** :

1. **Via Menu Applications** :
   - Appuyer sur `Super` (touche Windows)
   - Taper "Terminal" ou "Konsole"
   - Sélectionner l'application Terminal native (pas Flatpak)

2. **Ou via Raccourci** :
   - `Ctrl + Alt + T` (sur Ubuntu/Pop!_OS)

3. **Vérifier l'environnement** :
   ```bash
   cat /etc/os-release
   # Doit afficher:
   # NAME="Pop!_OS" ou NAME="Ubuntu"
   # Pas "Freedesktop SDK"
   ```

### Étape 2 : Vérifier WebKit sur l'hôte

```bash
# Test pkg-config
pkg-config --modversion webkit2gtk-4.1

# Devrait afficher: 2.48.7 ou similaire
# Si erreur, réinstaller:
sudo apt install -y libwebkit2gtk-4.1-dev libjavascriptcoregtk-4.1-dev
```

### Étape 3 : Build depuis le terminal hôte

```bash
cd /home/titane/Documents/TITANE_INFINITY

# Option 1: Script automatisé
./build_with_deps.sh

# Option 2: Build direct
npm run tauri build

# Option 3: Rust uniquement
cd src-tauri && cargo build --release
```

---

## 📋 Checklist de Vérification

Avant de lancer le build, vérifier :

- [ ] ✅ Terminal **hors Flatpak** (`cat /etc/os-release` ≠ Freedesktop SDK)
- [ ] ✅ pkg-config trouve WebKit (`pkg-config --exists webkit2gtk-4.1`)
- [ ] ✅ Rust + Cargo fonctionnels (`cargo --version`)
- [ ] ✅ Node.js accessible (`node --version`)

Si toutes les cases sont cochées → `npm run tauri build` devrait réussir.

---

## 🔧 Alternative : Build en Conteneur

Si impossible d'accéder à un terminal hôte natif :

```bash
# Docker avec accès système complet
docker run --rm -v $(pwd):/workspace \
  -w /workspace \
  rust:1.91.1-slim \
  bash -c "
    apt update && \
    apt install -y \
      libwebkit2gtk-4.1-dev \
      libjavascriptcoregtk-4.1-dev \
      libgtk-3-dev \
      pkg-config \
      nodejs npm && \
    npm install && \
    cargo build --release
  "
```

---

## 📊 État Actuel

| Composant | Statut | Note |
|-----------|--------|------|
| Frontend Vite | ✅ Build OK | 599KB bundle optimisé |
| Backend Rust | ❌ Linker bloqué | WebKit non trouvé dans Flatpak |
| Dépendances | ✅ Installées | Mais inaccessibles depuis Flatpak |
| Solution | ⏳ Attente | Ouvrir terminal hôte |

---

## 🎯 Résumé

**Problème** : Environnement Flatpak isole les bibliothèques système
**Solution** : Compiler depuis un terminal natif (non-Flatpak)
**Action** : Ouvrir Terminal système → `cd ~/Documents/TITANE_INFINITY` → `./build_with_deps.sh`

---

**Document créé** : 24 novembre 2025
**Version** : TITANE∞ v19.1.0
**Status** : ⏳ En attente terminal hôte
