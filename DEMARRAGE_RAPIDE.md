<<<<<<< HEAD
# 🚀 Guide de démarrage rapide — TITANE_INFINITY

**Version :** 26.2.0  
**Date :** 2025-12-21

---

## ✅ Prérequis

- **Linux** (repo actuel : Ubuntu)  
- **Rust** (pour Tauri) : `rustc --version` doit fonctionner
- **Node.js** : le repo fournit une toolchain locale (recommandée)
- **pnpm** : obligatoire (le repo bloque `npm install`)

---

## ⚡ Démarrage express (recommandé)

### 1) Utiliser la toolchain Node du repo

```bash
export PATH="$PWD/.tools/node/current/bin:$PATH"
node -v
corepack -v
```

### 2) Installer les dépendances (pnpm)

```bash
corepack enable
pnpm -v
pnpm install
```

### 3) Lancer en mode dev (Tauri + Vite)

```bash
pnpm run dev
```

---

## 🧪 Commandes utiles

```bash
pnpm run check          # TypeScript
pnpm run lint           # ESLint
pnpm run lint:fix       # ESLint fix
pnpm test -- --run      # Tests frontend
pnpm run test:tauri     # Tests Tauri/Rust
pnpm run build          # Build Vite
```

---

## 🩺 Diagnostic rapide

### Erreur : "Ce repo utilise pnpm" / install bloqué

Cause : utilisation de `npm install`.  
Solution :

```bash
corepack enable
pnpm install
```

### Erreur : modules manquants (react, vite, eslint…)

Cause : dépendances non installées.  
Solution :

```bash
pnpm install
=======
# 🚀 Guide de Démarrage Rapide TITANE_INFINITY

**Version:** 26.2.0  
**Date:** 2025-12-21

---

## ⚡ Démarrage Express

### 1. Installer les dépendances (OBLIGATOIRE)

Le projet utilise **pnpm** (pas npm):

```bash
# Installer pnpm si nécessaire
npm install -g pnpm

# Installer les dépendances
pnpm install
```

**⚠️ IMPORTANT:** Sans `pnpm install`, TITANE ne peut PAS démarrer!

### 2. Démarrer TITANE

**Option A - Mode Développement (Tauri + Vite):**
```bash
pnpm run dev
# OU
npm run dev
```

**Option B - Script Unifié:**
```bash
./titane.sh build dev
```

**Option C - Build Production:**
```bash
./titane.sh build stable
```

---

## 🔍 Diagnostic si TITANE ne démarre pas

### Problème 1: "Cannot find module 'react'"

**Cause:** Dependencies non installées  
**Solution:**
```bash
pnpm install
```

### Problème 2: "eslint: not found"

**Cause:** node_modules manquant  
**Solution:**
```bash
pnpm install
```

### Problème 3: "Ce repo utilise pnpm"

**Cause:** Tentative d'utiliser npm au lieu de pnpm  
**Solution:**
```bash
npm install -g pnpm
pnpm install
```

### Problème 4: Erreurs TypeScript

**Solution:**
```bash
# Vérifier la compilation
pnpm run check

# Corriger automatiquement les erreurs de formatage
pnpm run lint:fix
```

---

## 📋 Commandes Utiles

### Développement
```bash
pnpm run dev              # Démarre Tauri dev
pnpm run build            # Build Vite uniquement
pnpm run preview          # DÉSACTIVÉ (Tauri-only mode)
```

### Qualité Code
```bash
pnpm run lint             # Linter ESLint
pnpm run lint:fix         # Fix automatique
pnpm run format           # Prettier format
pnpm run check            # TypeScript check
```

### Tests
```bash
pnpm run test             # Tests Vitest
pnpm run test:e2e         # Tests Playwright
pnpm run test:rust        # Tests Rust
pnpm run test:all         # Tous les tests
```

### Vérifications
```bash
pnpm run verify                    # Vérification complète
pnpm run verify:tauri-only         # Vérifie mode Tauri-only
pnpm run verify:local-first        # Vérifie local-first
```

---

## 🛠️ Scripts titane.sh

Le script `./titane.sh` propose plusieurs commandes:

```bash
./titane.sh clean         # Nettoyage complet
./titane.sh repair        # Réparation dépendances
./titane.sh fix           # Correction erreurs TS
./titane.sh build [dev|stable]  # Build complet
./titane.sh deploy        # Build + Deploy production
./titane.sh full          # Clean + Repair + Fix + Build + Deploy
./titane.sh health        # Vérification santé système
```

---

## 🎯 Workflow Recommandé

### Après un git clone:
```bash
# 1. Installer pnpm
npm install -g pnpm

# 2. Installer dépendances
pnpm install

# 3. Vérifier que tout compile
pnpm run check

# 4. Démarrer en dev
pnpm run dev
```

### En cas de problème:
```bash
# 1. Nettoyage complet
./titane.sh clean

# 2. Réinstaller
pnpm install

# 3. Build
pnpm run build

# 4. Tests
pnpm run test:all
>>>>>>> d98d6feb7752d2ea20acbe7a28a3b808dfa86847
```

---

<<<<<<< HEAD
## 🛠️ Script utilitaire

Le repo fournit aussi :

```bash
./titane.sh repair
```

(utile si l’environnement Node/Rust ou les dépendances sont dans un état incohérent)
=======
## 🔧 Prérequis Système

### Node.js
- **Version requise:** >=20.0.0
- **Vérification:** `node --version`

### pnpm
- **Installation:** `npm install -g pnpm`
- **Vérification:** `pnpm --version`

### Rust (pour Tauri)
- **Installation:** https://rustup.rs/
- **Vérification:** `rustc --version`

### Tauri CLI
- Installé automatiquement via pnpm devDependencies
- **Vérification:** `pnpm tauri --version`

---

## 📊 Checklist Démarrage

- [ ] Node.js >=20.0.0 installé
- [ ] pnpm installé globalement
- [ ] Rust installé (pour build Tauri)
- [ ] `pnpm install` exécuté avec succès
- [ ] `pnpm run check` passe sans erreur
- [ ] `pnpm run dev` démarre l'application

---

## 🆘 Support

**En cas de blocage:**

1. Vérifier que `pnpm install` s'est bien exécuté
2. Vérifier `pnpm run check` (pas d'erreurs TypeScript)
3. Consulter les logs dans `logs/titane_*.log`
4. Lancer `./titane.sh health` pour diagnostic

**Logs utiles:**
```bash
# Logs récents
tail -f logs/titane_*.log

# Voir les erreurs npm
cat ~/.npm/_logs/*-debug*.log
```

---

## ✅ Validation Installation

Pour vérifier que tout est OK:

```bash
# 1. Dependencies installées
ls node_modules | wc -l
# Doit afficher ~1000+

# 2. TypeScript OK
pnpm run check
# Doit terminer sans erreur

# 3. Build OK
pnpm run build
# Doit créer dist/

# 4. Tests passent
pnpm run test
# Tous les tests doivent passer
```

---

**Créé par:** GitHub Copilot Coding Agent  
**Date:** 2025-12-21  
**Version TITANE:** 26.2.0
>>>>>>> d98d6feb7752d2ea20acbe7a28a3b808dfa86847
