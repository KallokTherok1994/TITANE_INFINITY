# 📦 TITANE∞ — GUIDE INSTALLATION WebKitGTK

**Date** : 2025-11-22
**Version** : v24.2.0
**OS** : Pop!_OS / Ubuntu 22.04+

---

## 🎯 OBJECTIF

Installer **WebKitGTK 4.1** (recommandé) ou **WebKitGTK 4.0** (fallback) pour permettre les builds Tauri natifs.

---

## 📋 PRÉ-REQUIS

```bash
# Vérifier système
./scripts/check_system.sh
```

Si vous voyez :
```
Checking WebKitGTK... ✗ NOT FOUND
```

Suivez ce guide.

---

## 🚀 INSTALLATION RAPIDE

### Option A : WebKitGTK 4.1 (Recommandé)

```bash
sudo apt update
sudo apt install -y \
  libwebkit2gtk-4.1-dev \
  libjavascriptcoregtk-4.1-dev \
  libgtk-3-dev \
  libsoup-3.0-dev \
  libayatana-appindicator3-dev \
  librsvg2-dev
```

### Option B : WebKitGTK 4.0 (Fallback)

Si 4.1 n'est pas disponible :

```bash
sudo apt update
sudo apt install -y \
  libwebkit2gtk-4.0-dev \
  libjavascriptcoregtk-4.0-dev \
  libgtk-3-dev \
  libsoup2.4-dev \
  libayatana-appindicator3-dev \
  librsvg2-dev
```

---

## ✅ VALIDATION

```bash
# Vérifier installation
./scripts/check_system.sh
```

**Output attendu** :
```
Checking WebKitGTK... ✓ 4.1 (2.46.4)
Checking JavaScriptCore... ✓ 4.1 (2.46.4)
Checking GTK+... ✓ 3.24.43
Checking libsoup... ✓ 3.0 (3.6.0)
```

---

## 🛠️ DÉPENDANCES COMPLÈTES TAURI

Pour un système complet Tauri :

```bash
sudo apt update && sudo apt install -y \
  build-essential \
  curl \
  wget \
  file \
  libssl-dev \
  libwebkit2gtk-4.1-dev \
  libgtk-3-dev \
  libayatana-appindicator3-dev \
  librsvg2-dev \
  libsoup-3.0-dev \
  libjavascriptcoregtk-4.1-dev \
  pkg-config
```

---

## 🔧 TROUBLESHOOTING

### Problème 1 : Package non trouvé (4.1)

**Erreur** :
```
E: Unable to locate package libwebkit2gtk-4.1-dev
```

**Solution** : Utiliser WebKitGTK 4.0 (Option B ci-dessus)

### Problème 2 : Conflits de dépendances

**Solution** :
```bash
sudo apt autoremove
sudo apt autoclean
sudo apt update
sudo apt upgrade
# Puis réessayer installation
```

### Problème 3 : Pop!_OS version ancienne

**Solution** : Mettre à jour le système
```bash
sudo apt update && sudo apt full-upgrade
```

---

## 📊 VERSIONS SUPPORTÉES

| OS | WebKitGTK 4.1 | WebKitGTK 4.0 |
|----|---------------|---------------|
| Pop!_OS 22.04+ | ✅ | ✅ |
| Ubuntu 22.04+ | ✅ | ✅ |
| Ubuntu 20.04 | ❌ | ✅ |
| Debian 12+ | ✅ | ✅ |
| Debian 11 | ❌ | ✅ |

---

## 🚀 APRÈS INSTALLATION

### 1. Vérifier système

```bash
./scripts/check_system.sh
```

### 2. Réparer si nécessaire

```bash
./scripts/auto_fix.sh
```

### 3. Build Tauri

```bash
pnpm dev:tauri        # Mode développement
pnpm tauri:build      # Build production
```

---

## 📝 NOTES

- **WebKitGTK 4.1** est plus récent et recommandé
- **WebKitGTK 4.0** fonctionne aussi (legacy)
- Le script `check_system.sh` détecte automatiquement la version installée
- Tauri s'adapte automatiquement à la version disponible

---

## ✅ VALIDATION FINALE

Après installation, vous devriez voir :

```bash
$ ./scripts/check_system.sh

🔍 TITANE∞ System Checker v24
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Checking Rust... ✓ 1.91.1
Checking Cargo... ✓ 1.91.1
Checking Node.js... ✓ v24.11.1
Checking pnpm... ✓ 10.23.0
Checking WebKitGTK... ✓ 4.1 (2.46.4)
Checking JavaScriptCore... ✓ 4.1 (2.46.4)
Checking GTK+... ✓ 3.24.43
Checking libsoup... ✓ 3.0 (3.6.0)
Checking build tools... ✓
Checking pkg-config... ✓
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ All system dependencies are satisfied

Detected WebKitGTK version: 4.1
```

---

**Auteur** : GitHub Copilot (Claude Sonnet 4.5)
**Date** : 2025-11-22
**Version** : TITANE∞ v24.2.0
**Status** : READY ✅
