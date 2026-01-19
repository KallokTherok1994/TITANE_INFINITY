# 🔧 Guide de Résolution : Problème Flatpak vs WebKit

**Date :** 24 novembre 2025
**Version :** TITANE_INFINITY v19.1.0
**Problème :** Compilation Rust bloquée par isolation Flatpak

---

## 📊 Diagnostic

### Symptômes

```
rust-lld: error: unable to find library -lwebkit2gtk-4.1
rust-lld: error: unable to find library -ljavascriptcoregtk-4.1
```

### Cause Racine

Vous êtes dans un **environnement Flatpak isolé** :
- VS Code installé via Flatpak → terminaux intégrés hérités de l'isolation
- `pkg-config` ne peut pas accéder aux bibliothèques système (`/usr/lib`)
- WebKit installé sur le système mais invisible dans le sandbox

### Vérification

```bash
cat /etc/os-release
```

**Si vous voyez :**
- ❌ `NAME="Freedesktop SDK"` → **FLATPAK** (problème)
- ✅ `NAME="Pop!_OS"` ou `"Ubuntu"` → **Natif** (OK)

---

## 🚀 Solution Automatique (RECOMMANDÉE)

### Étape 1 : Ouvrir Terminal Système

**NE PAS utiliser** le terminal intégré de VS Code (il hérite du Flatpak).

**Actions :**
1. Appuyez sur `Super` (touche Windows) ou `Alt+F2`
2. Tapez `terminal` ou `gnome-terminal`
3. Sélectionnez **Terminal** (icône native, PAS "Code - OSS")
4. Un nouveau terminal s'ouvre → **environnement système natif**

### Étape 2 : Exécuter le Script

Dans le nouveau terminal système :

```bash
cd ~/Documents/TITANE_INFINITY
./detect_and_fix_flatpak.sh
```

**Le script va :**
1. ✅ Détecter l'environnement (Flatpak vs Natif)
2. ✅ Vérifier `pkg-config`
3. ✅ Installer WebKit si manquant
4. ✅ Vérifier Rust + Node.js
5. ✅ Compiler l'application

---

## 🔧 Solutions Alternatives

### Option A : flatpak-spawn (Si terminal système inaccessible)

Sortir temporairement du sandbox Flatpak :

```bash
flatpak-spawn --host bash
cd ~/Documents/TITANE_INFINITY
./build_with_deps.sh
```

### Option B : Installation Native de VS Code

Remplacer VS Code Flatpak par la version `.deb` native :

```bash
# 1. Désinstaller VS Code Flatpak
flatpak uninstall --delete-data com.visualstudio.code

# 2. Télécharger .deb officiel
wget 'https://code.visualstudio.com/sha/download?build=stable&os=linux-deb-x64' -O vscode.deb

# 3. Installer
sudo dpkg -i vscode.deb
sudo apt-get install -f  # Résoudre dépendances

# 4. Vérifier
code --version
```

### Option C : Compilation Docker (Isolation complète)

Si toutes les options échouent, utilisez Docker :

```bash
cd ~/Documents/TITANE_INFINITY
docker build -t titane-builder -f Dockerfile.tauri-builder .
docker run --rm -v "$(pwd)":/app titane-builder
```

---

## 📋 Vérification Post-Installation

### Test 1 : Environnement Natif

```bash
cat /etc/os-release
# Doit afficher "Pop!_OS" ou "Ubuntu", PAS "Freedesktop SDK"
```

### Test 2 : pkg-config

```bash
pkg-config --exists webkit2gtk-4.1 && echo "✅ OK" || echo "❌ ÉCHEC"
```

### Test 3 : Compilation

```bash
cd ~/Documents/TITANE_INFINITY
pnpm run tauri build
```

**Résultat attendu :**
```
    Finished `release` profile [optimized] target(s) in 8m 32s
```

### Test 4 : Lancement

```bash
./src-tauri/target/release/titane-infinity
```

---

## 🐛 Dépannage Avancé

### Problème : "flatpak-spawn: command not found"

VS Code peut ne pas être un Flatpak, mais un Snap ou AppImage.

**Solution :** Ouvrir terminal système natif (Option B ci-dessus).

### Problème : WebKit toujours introuvable

```bash
# Vérifier chemins pkg-config
pkg-config --variable pc_path pkg-config

# Ajouter manuellement si nécessaire
export PKG_CONFIG_PATH="/usr/lib/x86_64-linux-gnu/pkgconfig:$PKG_CONFIG_PATH"
pkg-config --exists webkit2gtk-4.1 && echo "✅ Trouvé"
```

### Problème : Permissions refusées

```bash
# Donner permissions d'exécution
chmod +x detect_and_fix_flatpak.sh
chmod +x build_with_deps.sh

# Réessayer
./detect_and_fix_flatpak.sh
```

---

## 📚 Ressources

- **Script automatique :** `detect_and_fix_flatpak.sh`
- **Build manuel :** `build_with_deps.sh`
- **Documentation Flatpak :** `FLATPAK_ENVIRONMENT_SOLUTION.md`
- **Installation WebKit :** `WEBKIT_INSTALLATION_GUIDE.md`

---

## ✅ Checklist de Résolution

- [ ] Terminal système natif ouvert (pas VS Code intégré)
- [ ] `cat /etc/os-release` affiche "Pop!_OS" ou "Ubuntu"
- [ ] `pkg-config --exists webkit2gtk-4.1` retourne 0
- [ ] `./detect_and_fix_flatpak.sh` exécuté avec succès
- [ ] `pnpm run tauri build` compile sans erreur
- [ ] `./src-tauri/target/release/titane-infinity` lance l'application

---

**🎯 OBJECTIF FINAL :**
Compilez TITANE∞ v19.1.0 en **environnement natif** pour accéder aux bibliothèques WebKit système.

**📞 SUPPORT :**
Si le problème persiste après toutes ces étapes, vérifiez :
1. Logs complets : `pnpm run tauri build 2>&1 | tee build.log`
2. Variables d'environnement : `echo $PKG_CONFIG_PATH`
3. Version Rust : `rustc --version` (doit être ≥ 1.70)

---

**© 2025 TITANE Team — Tous droits réservés**
