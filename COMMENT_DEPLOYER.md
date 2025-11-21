# 🚀 TITANE∞ v15.5 — Comment Déployer

## ⚡ Guide Rapide (3 étapes)

### ⚠️ Important : Ne PAS exécuter depuis VS Code Flatpak

Le build Tauri nécessite un accès direct au système (webkit2gtk, javascriptcore).

### ✅ Solution : Terminal Natif

```bash
# 1. Ouvrir terminal système (Ctrl+Alt+T)

# 2. Naviguer vers le projet
cd /home/titane_os/Documents/TITANE_NEWGEN/TITANE_INFINITY

# 3. Lancer le déploiement
bash deploy_titane_prod.sh
```

### 🎯 Résultat Attendu

Le script va automatiquement :
- ✅ Vérifier l'environnement (natif vs Flatpak)
- ✅ Nettoyer le projet
- ✅ Builder le frontend (TypeScript + Vite)
- ✅ Builder le backend (Rust + Tauri)
- ✅ Générer les bundles (.deb, .rpm, .AppImage)
- ✅ Installer le système
- ✅ Tester l'installation

### 🔍 Si Problème

Si le script détecte Flatpak, il affichera :

```
╔═══════════════════════════════════════════════════╗
║  ⚠️  ERREUR : ENVIRONNEMENT FLATPAK DÉTECTÉ      ║
╚═══════════════════════════════════════════════════╝

SOLUTION : Exécuter depuis un terminal natif
```

**Solutions alternatives :**

```bash
# Option 1 : Via flatpak-spawn
flatpak-spawn --host bash /home/titane_os/Documents/TITANE_NEWGEN/TITANE_INFINITY/deploy_titane_prod.sh

# Option 2 : Build direct sans bundles
cd src-tauri
flatpak-spawn --host cargo build --release
# Binaire : target/release/titane-infinity
```

### 📚 Documentation Complète

- **Guide détaillé :** `README_DEPLOIEMENT.md`
- **Fix Flatpak :** `FLATPAK_ENVIRONMENT_FIX.md`
- **Logs :** `deploy_logs/deploy_prod_*.log`

---

**Version :** 15.5.0  
**Date :** 20 Novembre 2025  
**Status :** ✅ Production-Ready (0 warnings Clippy)
