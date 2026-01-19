# 🚀 TITANE∞ - Guide d'Utilisation "run titane"

**Version:** 24.7.6  
**Date:** 15 décembre 2025  
**Commande:** `titane [options]`

---

## 🎯 Quick Start (3 secondes)

```bash
# Lancer TITANE en mode développement
titane

# C'est tout! 🎉
```

---

## 📋 Toutes les Commandes

### Modes Principaux

```bash
# Mode développement (par défaut)
titane              # Complet avec vérifications
titane dev          # Identique (explicite)

# Mode production
titane prod         # Build optimisé + performance maximale

# Lancement rapide
titane quick        # Skip vérifications (instant)

# Reconstruction complète
titane rebuild      # Clean + rebuild from scratch
```

### Combinaisons Avancées

```bash
# Production avec rebuild
titane prod rebuild

# Dev sans type checking
titane dev no-check

# Quick launch en production
titane prod quick
```

### Aide

```bash
titane help         # Affiche l'aide complète
```

---

## 🔧 Ce que fait "titane" automatiquement

### Phase 1: 🧹 Nettoyage

- Kill processus Tauri/Vite orphelins
- Clean build cache (si --rebuild)
- Prepare logs directory

### Phase 2: 🌐 Réseau & Internet

- Test connexion internet
- Vérifie APIs disponibles:
  - ✅ api.openai.com
  - ✅ api.anthropic.com
  - ✅ generativelanguage.googleapis.com
  - ✅ Ollama local (127.0.0.1:11434)
- Mode offline automatique si pas de réseau

### Phase 3: 🔍 Vérifications

- Check Node.js version
- Install dépendances (si nécessaire)
- TypeScript type checking
- ESLint linting

### Phase 4: 🔧 Corrections Automatiques

- Auto-fix erreurs TypeScript/ESLint
- Continue même si erreurs

### Phase 5: 🏗️ Build

- **Frontend:** Vite + React (si dist/ manquant)
- **Backend:** Rust/Tauri (si binaire manquant)
- Skip si déjà built (gain de temps)

### Phase 6: 🚀 Lancement

- Détecte display server (Wayland/X11)
- Configure environnement
- Lance TITANE avec logs en temps réel

---

## ⏱️ Temps d'Exécution

| Mode        | Temps    | Quand utiliser                                         |
| ----------- | -------- | ------------------------------------------------------ |
| **Quick**   | ~7s      | Déjà lancé aujourd'hui, pas de modifications majeures  |
| **Normal**  | ~20-30s  | Premier lancement du jour, après modifications         |
| **Rebuild** | ~3-5 min | Après git pull, changement dépendances, problème build |

---

## 📁 Fichiers & Logs

### Logs créés automatiquement

```bash
runtime/dev/logs/tauri.log       # Console Tauri complète
/tmp/titane-tsc.log              # Erreurs TypeScript
/tmp/titane-vite-build.log       # Build frontend
```

### Voir logs en temps réel

```bash
# Pendant que TITANE tourne
tail -f runtime/dev/logs/tauri.log
```

---

## 🎮 Contrôles Pendant l'Exécution

| Touche     | Action                          |
| ---------- | ------------------------------- |
| **Ctrl+R** | Reload React (soft reload)      |
| **F5**     | Full window reload              |
| **F12**    | Toggle DevTools (mode dev only) |
| **Ctrl+C** | Stop TITANE                     |

---

## 🌐 Accès Internet & APIs

### Automatique ✅

Le système détecte automatiquement:

- Connexion internet disponible → Mode online
- Pas de connexion → Mode offline (APIs désactivées)

### APIs Supportées

Quand internet disponible:

- ✅ **OpenAI** (ChatGPT, GPT-4)
- ✅ **Anthropic** (Claude)
- ✅ **Google Gemini**
- ✅ **Ollama** (local, toujours disponible)

### Configuration

Les clés API doivent être dans:

```bash
~/.env                    # Clés globales
.env.development          # Dev mode
.env.production           # Prod mode
```

Format:

```env
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_API_KEY=AIza...
```

---

## 🔧 Dépannage

### "No display server detected"

**Cause:** Lancé depuis terminal non-graphique (SSH, tty, etc.)

**Solution:**

```bash
# Lancer depuis terminal graphique
gnome-terminal
titane

# Ou export manuel
export DISPLAY=:0
titane
```

---

### "Frontend build failed"

**Cause:** Erreur Vite/React

**Solution:**

```bash
# Voir logs
cat /tmp/titane-vite-build.log

# Rebuild complet
titane rebuild
```

---

### "Backend build failed"

**Cause:** Erreur Rust/Tauri

**Solution:**

```bash
# Vérifier Rust installé
rustc --version

# Clean et rebuild
cd src-tauri && cargo clean && cd ..
titane rebuild
```

---

### "APIs unreachable"

**Cause:** Pas d'internet ou firewall

**Solution:**

```bash
# Vérifier connexion
ping 8.8.8.8

# Vérifier firewall
sudo ufw status

# Mode offline
titane  # Fonctionne sans APIs
```

---

### TITANE ne démarre pas (page blanche)

**Cause:** Build frontend incomplet

**Solution:**

```bash
# Force rebuild frontend
rm -rf dist/
titane rebuild
```

---

## 🎓 Cas d'Usage Pratiques

### Développement quotidien

```bash
# Matin
titane              # Premier lancement (20-30s)

# Après modifications code
Ctrl+R              # Reload dans TITANE

# Si modifications majeures
Ctrl+C              # Stop
titane quick        # Relance rapide (7s)
```

---

### Après git pull

```bash
git pull
titane rebuild      # Force rebuild (3-5 min)
```

---

### Test avant commit

```bash
# Vérifier que tout compile
titane rebuild

# Si OK, commit
git add .
git commit -m "..."
```

---

### Test production

```bash
# Build optimisé
titane prod

# Tester performance
# (bundles minifiés, pas de DevTools)
```

---

## 🔍 Mode Verbose (Debug)

Si problèmes, voir toutes les étapes:

```bash
# Lancer avec sortie complète
titane 2>&1 | tee titane-debug.log

# Analyser après
cat titane-debug.log
```

---

## 📦 Installation (Nouveaux Utilisateurs)

### Installation automatique

```bash
cd /home/VOTRE_USER/Documents/GitHub/TITANE_INFINITY
./install-run-titane.sh
```

### Installation manuelle

```bash
# 1. Rendre exécutable
chmod +x run-titane.sh run

# 2. Alias bash
echo "alias titane='$PWD/run'" >> ~/.bashrc
source ~/.bashrc

# 3. (Optionnel) Lien global
sudo ln -sf $PWD/run /usr/local/bin/titane
```

---

## 🏆 Avantages vs pnpm run dev:tauri

| Critère           | `pnpm run dev:tauri` | `titane`                     |
| ----------------- | ------------------- | ---------------------------- |
| **Commande**      | Longue et technique | Simple et mémorable          |
| **Vérifications** | ❌ Aucune           | ✅ Auto (réseau, type, lint) |
| **Corrections**   | ❌ Manuel           | ✅ Automatique               |
| **Build**         | ❌ Séparé           | ✅ Intégré si nécessaire     |
| **Logs**          | ❌ Console only     | ✅ Fichiers persistants      |
| **Internet/APIs** | ❌ Non vérifié      | ✅ Auto-détecté              |
| **Display**       | ❌ Manuel           | ✅ Auto-détecté              |
| **Temps**         | Variable            | ✅ Prévisible (7-30s)        |

---

## 💡 Trucs & Astuces

### Accélération maximum

```bash
# Si aucune modification depuis dernière session
titane quick

# Encore plus rapide: skip tout sauf launch
titane quick no-check
```

### Build cache intelligent

```bash
# Le système skip build si dist/ existe déjà
# Force rebuild seulement si nécessaire:
titane rebuild
```

### Multi-écrans

```bash
# Terminal 1: TITANE
titane

# Terminal 2: Logs temps réel
tail -f runtime/dev/logs/tauri.log

# Terminal 3: Dev
code .
```

---

## 🎯 Résumé 1 ligne

**Une commande, tout automatique:**

```bash
titane  # Nettoyage → Vérif réseau/APIs → Check code → Auto-fix → Build si besoin → Launch ✅
```

---

**Pour plus de détails techniques:** Voir [ANALYSE_RUN_TITANE_v24.7.6.md](ANALYSE_RUN_TITANE_v24.7.6.md)

**Support:** GitHub Issues ou documentation complète dans `/docs`

**Version:** 24.7.6 - Full Deploy System  
**Status:** ✅ Production Ready  
**License:** Voir LICENSE.md
