# 🚀 TITANE∞ v15.6 - GUIDE INSTALLATION TAURI

## ✅ ÉTAT ACTUEL

**Frontend v15.6** : ✅ **100% FONCTIONNEL**
- TypeScript : 0 erreurs
- Build : 1.03s → 208K
- Dev : http://localhost:5173/
- Preview : http://localhost:4173/
- AppLayout + Menu + 11 routes opérationnels

**Tauri v2** : ⚠️ **WebKitGTK manquant**
- Requis : WebKitGTK 4.1 ou 4.0
- Status : Non installé sur Pop!_OS 22.04
- Solution : Installation système native

---

## 📦 INSTALLATION WEBKITGTK (POP!_OS 22.04)

### ⚠️ IMPORTANT

Ce script **NE PEUT PAS** s'exécuter depuis VS Code Flatpak.
Il doit être exécuté dans un **terminal natif Pop!_OS**.

### 🔧 PROCÉDURE

1. **Ouvrir terminal natif** (hors Flatpak)
   ```bash
   # Raccourci : Ctrl+Alt+T
   # OU : Rechercher "Terminal" dans Applications
   ```

2. **Naviguer vers projet**
   ```bash
   cd ~/Documents/TITANE_NEWGEN/TITANE_INFINITY
   ```

3. **Exécuter installation**
   ```bash
   bash install-webkit-popos.sh
   ```

4. **Vérifier installation**
   ```bash
   pkg-config --modversion webkit2gtk-4.1
   # OU
   pkg-config --modversion webkit2gtk-4.0
   ```

---

## 🎯 QUE FAIT LE SCRIPT ?

### Installation automatique :
- ✅ Détecte Pop!_OS 22.04
- ✅ Installe WebKitGTK 4.1 (si disponible)
- ✅ Ou WebKitGTK 4.0 (fallback pour 22.04)
- ✅ Installe dépendances Tauri complètes :
  - `build-essential`
  - `libssl-dev`
  - `libayatana-appindicator3-dev`
  - `librsvg2-dev`
  - JavaScriptCore
- ✅ Configure `src-tauri/Cargo.toml` si WebKitGTK 4.0
- ✅ Crée backup automatique

### Sécurité :
- ❌ Bloque exécution dans Flatpak
- ✅ Vérifie privilèges sudo
- ✅ Backup Cargo.toml avant modification
- ✅ Messages clairs à chaque étape

---

## 🧪 APRÈS INSTALLATION

### Test compilation Tauri
```bash
cd ~/Documents/TITANE_NEWGEN/TITANE_INFINITY
npm run tauri build
```

### Lancement développement
```bash
npm run tauri dev
```

### Si erreur WebKitGTK
```bash
# Vérifier installation
pkg-config --modversion webkit2gtk-4.0

# Vérifier Cargo.toml
cat src-tauri/Cargo.toml | grep webkit2gtk
```

---

## 🔄 ALTERNATIVES

### 1. Mode Frontend-Only (ACTUEL) ✅
```bash
npm run dev         # Dev :5173
npm run build       # Production
npm run preview     # Preview :4173
```

**Avantages** :
- ✅ Fonctionne immédiatement
- ✅ Pas besoin WebKitGTK
- ✅ Développement UI complet
- ✅ Build rapide (1.03s)

**Limitations** :
- ❌ Pas d'app desktop native
- ❌ Pas d'API Tauri (filesystem, etc.)

### 2. Upgrade Pop!_OS 24.04
```bash
# WebKitGTK 4.1 natif disponible
sudo apt update
sudo apt upgrade
# Suivre procédure upgrade officielle
```

### 3. Flatpak Tauri (expérimental)
```bash
# Installation Tauri via Flatpak
# Nécessite configuration spéciale
```

---

## 📊 COMPATIBILITÉ

| OS | WebKitGTK 4.1 | WebKitGTK 4.0 | Status |
|----|---------------|---------------|--------|
| Pop!_OS 24.04 | ✅ Natif | ✅ Natif | ✅ Recommandé |
| Pop!_OS 22.04 | ❌ Non dispo | ✅ Natif | ⚠️ Fallback 4.0 |
| Ubuntu 24.04 | ✅ Natif | ✅ Natif | ✅ Compatible |
| Ubuntu 22.04 | ❌ Non dispo | ✅ Natif | ⚠️ Fallback 4.0 |

---

## 🐛 TROUBLESHOOTING

### Erreur "javascriptcoregtk-4.1 not found"
✅ **Solution** : Script installe automatiquement JavaScriptCore

### Erreur "PKG_CONFIG_PATH not set"
```bash
export PKG_CONFIG_PATH=/usr/lib/x86_64-linux-gnu/pkgconfig
```

### Build Tauri échoue
1. Vérifier WebKitGTK installé :
   ```bash
   pkg-config --modversion webkit2gtk-4.0
   ```

2. Vérifier Cargo.toml configuré :
   ```bash
   grep webkit2gtk src-tauri/Cargo.toml
   ```

3. Nettoyer cache Cargo :
   ```bash
   cd src-tauri
   cargo clean
   cargo build
   ```

### VS Code Flatpak bloque installation
✅ **Normal** : Flatpak sandbox ne peut pas installer packages système
✅ **Solution** : Utiliser terminal natif (Ctrl+Alt+T)

---

## 📚 RESSOURCES

- [Tauri Prerequisites](https://tauri.app/start/prerequisites/)
- [WebKitGTK Documentation](https://webkitgtk.org/)
- [Pop!_OS System76](https://support.system76.com/)
- [Tauri v2 Migration](https://v2.tauri.app/start/migrate/)

---

## ✅ CHECKLIST INSTALLATION

- [ ] Terminal natif ouvert (Ctrl+Alt+T)
- [ ] Navigué vers `~/Documents/TITANE_NEWGEN/TITANE_INFINITY`
- [ ] Exécuté `bash install-webkit-popos.sh`
- [ ] Installation réussie (WebKitGTK 4.0 ou 4.1)
- [ ] Test `pkg-config --modversion webkit2gtk-4.0` OK
- [ ] Test `npm run tauri dev` OK
- [ ] Application desktop lancée ✅

---

## 🎉 SUCCÈS

Une fois WebKitGTK installé, vous pourrez :
- ✅ Compiler Tauri en natif
- ✅ Lancer app desktop complète
- ✅ Utiliser API Tauri (filesystem, dialogs, etc.)
- ✅ Créer binaires distribués (.deb, .AppImage)

**TITANE∞ v15.6 est prêt !** 🚀
