# 🚀 TITANE∞ v15.5 - Guide Rapide de Lancement

## ⚡ Lancement Immédiat (Mode Dev)

```bash
cd /home/titane_os/Documents/TITANE_NEWGEN/TITANE_INFINITY

# Option 1: Script automatique
./launch_dev.sh

# Option 2: Commande directe
npm run tauri dev
```

**Résultat attendu:**
- Vite démarre en ~2s
- Cargo compile en ~60-120s (première fois seulement)
- Fenêtre TITANE∞ s'ouvre automatiquement
- Dashboard avec 8 modules visible
- ✅ Aucun crash (corrections appliquées)

---

## 📋 Toutes les Commandes Disponibles

### Mode Développement (Recommandé)
```bash
# Lancement avec hot-reload
npm run tauri dev

# Arrêt: Ctrl+C dans le terminal
```

### Build Frontend Seul
```bash
# Compiler le frontend (Vite + React)
npm run build

# Output: dist/ (207 kB optimisé)
```

### Build Backend Seul
```bash
cd src-tauri

# Mode debug (rapide)
cargo build

# Mode release (optimisé)
cargo build --release
```

### Tests CLI
```bash
# Version
flatpak-spawn --host ./src-tauri/target/release/titane-infinity --version

# Aide
flatpak-spawn --host ./src-tauri/target/release/titane-infinity --help
```

### Déploiement Production
```bash
# Depuis terminal NATIF (Ctrl+Alt+T), pas VS Code !
./deploy_titane_prod.sh
```

---

## 🔧 Résolution de Problèmes

### Problème: "libwebkit2gtk not found"
```bash
# Installer dépendances (terminal natif uniquement)
sudo apt install libwebkit2gtk-4.1-dev \
                 libjavascriptcoregtk-4.1-dev \
                 libgtk-3-dev
```

### Problème: Binaire release ne lance pas GUI
**Cause:** Environnement Flatpak (VS Code)  
**Solution:** Utiliser `npm run tauri dev` au lieu du binaire release

### Problème: Port 5173 déjà utilisé
```bash
# Tuer processus Vite
pkill -9 vite

# Relancer
npm run tauri dev
```

### Problème: Compilation Rust longue
**Normal:** Première compilation = 60-120s  
**Ensuite:** Compilations incrémentales = 5-10s

---

## 📊 Status du Projet

| Composant | Status | Notes |
|-----------|--------|-------|
| Code Quality | ✅ 100% | 0 Clippy warnings |
| Backend Init | ✅ OK | 8 modules + Meta + EXP |
| Frontend Build | ✅ OK | 207 kB optimisé |
| Crash Fixes | ✅ Appliqués | setTimeout + ErrorBoundary |
| CLI Support | ✅ OK | --version, --help |
| Dev Mode | ✅ Fonctionnel | npm run tauri dev |
| Release Binary | ⚠️ Bloqué | Problème Flatpak |

---

## ✅ Corrections Appliquées

1. **Race Condition (src/hooks/useTitaneCore.ts)**
   - setTimeout(100ms) avant premiers appels Tauri
   - Évite appel backend avant qu'il soit prêt

2. **ErrorBoundary (src/main.tsx)**
   - Capture toutes erreurs React non gérées
   - Affiche UI recovery au lieu d'écran noir

3. **Logs Détaillés (src-tauri/src/main.rs)**
   - Diagnostic précis du point de blocage
   - Visible avec RUST_LOG=info

4. **Gestion d'Erreur (4 niveaux)**
   - try-catch → promise.catch() → ErrorBoundary → UI

---

## 📁 Fichiers Importants

```
TITANE_INFINITY/
├── launch_dev.sh                      # Script lancement rapide ✨
├── deploy_titane_prod.sh              # Déploiement production
├── GUI_LAUNCH_DIAGNOSTIC_FINAL.md     # Diagnostic complet 200+ lignes
├── CRASH_FIX.md                       # Doc corrections crash
├── COMMENT_DEPLOYER_TITANE_PROD.md    # Guide déploiement
└── QUICK_START.md                     # Ce fichier ✨
```

---

## 🎯 Recommandation

**Pour développement/test:**  
→ `npm run tauri dev` (fonctionne dans Flatpak)

**Pour production:**  
→ Rebuild depuis terminal natif + `./deploy_titane_prod.sh`

---

## 📞 Aide Supplémentaire

Consulter les documentations complètes:
- `GUI_LAUNCH_DIAGNOSTIC_FINAL.md` - Diagnostic technique
- `CRASH_FIX.md` - Corrections de crash détaillées
- `COMMENT_DEPLOYER_TITANE_PROD.md` - Guide déploiement

---

**Dernière mise à jour:** 20 Novembre 2025  
**Version:** TITANE∞ v15.5.0
