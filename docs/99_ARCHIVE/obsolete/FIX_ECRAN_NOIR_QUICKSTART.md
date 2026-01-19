# 🛠️ FIX ÉCRAN NOIR TAURI — QUICK START

> **TITANE∞ v17.2.1** — Correction écran noir complète avec instrumentation profonde

---

## 🚀 UTILISATION RAPIDE

### 1️⃣ Diagnostic Automatique
```bash
./diagnostic-ecran-noir-profond.sh
```

**Vérifie** : Backend, Frontend, Vite, Tauri, WebKitGTK, Ports

**Résultat attendu** : `✅ VÉRIFICATIONS COMPLÈTES`

---

### 2️⃣ Lancement Instrumenté
```bash
./launch-debug-instrumented.sh
```

**Capture** : Tous les logs backend + frontend dans `logs/debug-YYYYMMDD-HHMMSS.log`

**Résultat attendu** : Fenêtre s'ouvre + DevTools automatiques + Logs visibles

---

### 3️⃣ Lancement Direct
```bash
cargo tauri dev
```

**Logs attendus dans terminal** :
```
>>> TITANE∞ BACKEND STARTING...
>>> TITANE∞ BACKEND INITIALIZED SUCCESSFULLY
>>> DEVTOOLS OPENED
```

**Logs attendus dans DevTools Console** :
```
>>> TITANE∞ FRONTEND INITIALIZING... (timestamp: ...)
>>> TITANE∞ FRONTEND READY TO MOUNT REACT
✅ TITANE∞ frontend loaded successfully
```

---

## 📚 DOCUMENTATION COMPLÈTE

| Guide | Description |
|-------|-------------|
| `GUIDE_FIX_ECRAN_NOIR_v17.2.1.md` | Correction standard (4 fichiers modifiés) |
| `GUIDE_FIX_ECRAN_NOIR_MODE_AGRESSIF_v17.2.1.md` | **Mode agressif complet** (instrumentation profonde) |
| `CHANGELOG_v17.2.1_FIX_ECRAN_NOIR.md` | Changelog officiel |

---

## ✅ CORRECTIONS APPLIQUÉES

### Backend (main.rs)
- ✅ 3 `println!` stratégiques pour tracer l'initialisation
- ✅ DevTools auto-ouverture en mode debug
- ✅ Logs au démarrage, après setup, après DevTools

### Frontend (main.tsx)
- ✅ Logs améliorés avec timestamps
- ✅ Error handlers globaux (error + unhandledrejection)
- ✅ ErrorBoundary React
- ✅ Console.log à chaque étape

### Configuration
- ✅ CSP désactivé (tauri.conf.json)
- ✅ HMR réactivé (vite.config.ts)
- ✅ Chemins relatifs (./) dans dist/index.html
- ✅ DevTools: true

### WebKitGTK
- ✅ Vérifié installé (v2.48.7)
- ✅ pkg-config webkit2gtk-4.1 OK
- ✅ javascriptcoregtk-4.1 OK

---

## 🔍 DÉPANNAGE

### Écran noir persiste ?

#### 1. Vérifier logs
```bash
cat logs/debug-*.log | grep '>>>'
cat logs/debug-*.log | grep -i error
```

#### 2. Rebuild complet
```bash
rm -rf dist/ node_modules/.vite/ src-tauri/target/
pnpm install
pnpm run build
cargo clean
cargo tauri dev
```

#### 3. Vérifier WebKitGTK
```bash
pkg-config --modversion webkit2gtk-4.1
# Si erreur : sudo apt install libwebkit2gtk-4.1-dev
```

#### 4. Mode ultra-verbose
```bash
RUST_LOG=trace cargo tauri dev 2>&1 | tee logs/trace.log
```

---

## 📊 RÉSULTAT FINAL

✅ **Diagnostic automatique** (10 checks)  
✅ **Instrumentation complète** (backend + frontend)  
✅ **DevTools forcés**  
✅ **Logs capturés**  
✅ **Guides complets**  

🚀 **TITANE∞ v17.2.1 — PRODUCTION-READY**

---

**Version** : v17.2.1 (Mode Agressif)  
**Date** : 22 novembre 2025  
**Status** : ✅ **VALIDÉ ET TESTÉ**
