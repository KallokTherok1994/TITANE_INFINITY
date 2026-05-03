# 🚀 TITANE — Script de Déploiement Unifié

## 📋 Vue d'ensemble

Le script **Titane** est une commande unifiée pour gérer l'ensemble du cycle de déploiement de TITANE∞, de la maintenance au déploiement production.

## ⚡ Installation Rapide

```bash
chmod +x titane.sh
ln -sf titane.sh titane  # Créer un raccourci
```

## 🎯 Commandes Disponibles

### 🧹 Clean

Nettoie tous les artefacts de build et caches

```bash
./titane clean
```

**Supprime:**

- `dist/`, `build/`, `target/`
- Caches Vite, node_modules, coverage
- Anciens fichiers de logs (>7 jours)
- AppImages/executables de `runtime/stable/`

### 🔧 Repair

Répare et réinstalle toutes les dépendances

```bash
./titane repair
```

**Actions:**

- Supprime `node_modules/` et `package-lock.json`
- Réinstalle les dépendances npm/pnpm
- Vérifie et récupère les dépendances Rust/Cargo

### 🩹 Fix

Corrige automatiquement les erreurs TypeScript et ESLint

```bash
./titane fix
```

**Exécute:**

- `pnpm run lint:fix` - Auto-fix ESLint
- `pnpm run format` - Prettier formatting
- `pnpm run check` - TypeScript type checking

### 🏗️ Build

Compile l'application (dev ou stable)

```bash
./titane build         # Build dev runtime (par défaut)
./titane build dev     # Build dev runtime explicite
./titane build stable  # Build stable runtime (production)
```

**Process:**

1. Vérification des dépendances
2. Type checking TypeScript
3. Build frontend (Vite) → `dist/`
4. Build Tauri app → `.AppImage` / `.app` / `.msi`
5. Copie vers `runtime/stable/` (si stable)

### 🚀 Deploy

Déploiement production complet

```bash
./titane deploy
```

**Inclut:**

- Pre-deployment checks (types, lint, tests)
- Build stable production
- Vérification des artefacts
- Copie vers `runtime/stable/`

### 🎯 Full

Cycle complet de déploiement (avec confirmation)

```bash
./titane full
```

**Exécute séquentiellement:**

1. **Health Check** - Vérification système
2. **Clean** - Nettoyage complet
3. **Repair** - Réparation dépendances
4. **Fix** - Correction erreurs
5. **Build stable** - Compilation production
6. **Deploy** - Déploiement

> ⚠️ **Attention:** Cette commande demande confirmation avant exécution.

### 🏥 Health

Vérification de santé du système

```bash
./titane health
```

**Vérifie:**

- ✅ Node.js version
- ✅ npm version
- ✅ Rust/Cargo installation
- 💾 Espace disque disponible
- 📊 Statut Git (branche, fichiers modifiés)

## 📂 Logs

Tous les logs sont sauvegardés dans `logs/titane_TIMESTAMP.log`

```bash
# Voir le dernier log
tail -f logs/titane_*.log | tail -1
```

## 🔍 Exemples d'utilisation

### Développement quotidien

```bash
# Nettoyage rapide + build dev
./titane clean
./titane build dev
```

### Après git pull

```bash
# Réparer les dépendances + fix
./titane repair
./titane fix
```

### Déploiement production

```bash
# Cycle complet avec vérifications
./titane full
```

### Debug système

```bash
# Vérifier l'environnement
./titane health
```

## 🛠️ Résolution de problèmes

### Erreur: "TypeScript errors found"

```bash
./titane fix          # Auto-fix
pnpm run check         # Voir détails
```

### Erreur: "Dependencies not installed"

```bash
./titane repair       # Réinstaller
```

### Build Tauri échoue

```bash
./titane health       # Vérifier Rust/Cargo
cd src-tauri && cargo check  # Diagnostic Rust
```

### Manque d'espace disque

```bash
./titane clean        # Nettoyer caches
du -sh dist/ target/ node_modules/  # Analyser usage
```

## 🎨 Structure des artefacts

### Dev Runtime

```
src-tauri/target/release/bundle/
├── appimage/*.AppImage    (Linux)
├── macos/*.app            (macOS)
└── msi/*.msi              (Windows)
```

### Stable Runtime

```
runtime/stable/
├── *.AppImage             (Linux production)
├── *.app                  (macOS production)
└── *.msi                  (Windows production)
```

## 📊 Workflow recommandé

### 1. Démarrage journalier

```bash
./titane health       # Vérifier système
git pull              # Récupérer updates
./titane repair       # Si package.json modifié
```

### 2. Avant commit

```bash
./titane fix          # Auto-fix erreurs
pnpm run check         # Vérifier types
pnpm test              # Lancer tests
```

### 3. Release production

```bash
git checkout MAIN
./titane full         # Cycle complet
# → Artefacts prêts dans runtime/stable/
```

## 🔐 Sécurité

- ✅ Type checking obligatoire avant build
- ✅ Lint checking dans deploy
- ✅ Tests non-bloquants (warnings uniquement)
- ✅ Logs détaillés de toutes les opérations

## 📈 Performance

| Commande | Durée (approx.) |
| -------- | --------------- |
| `clean`  | ~5s             |
| `repair` | ~2-5min         |
| `fix`    | ~30s-2min       |
| `build`  | ~5-15min        |
| `deploy` | ~10-20min       |
| `full`   | ~15-30min       |

> Les durées varient selon votre machine et l'état du cache

## 🆘 Support

En cas de problème:

1. **Vérifier les logs**: `cat logs/titane_*.log | tail -100`
2. **Health check**: `./titane health`
3. **Clean + Repair**: `./titane clean && ./titane repair`
4. **Consulter la doc Tauri**: https://tauri.app/

---

**TITANE∞ v24.2.0** — Cognitive Operating System  
© 2025 Humain Total / Kevin Thibault / TITANE Team
