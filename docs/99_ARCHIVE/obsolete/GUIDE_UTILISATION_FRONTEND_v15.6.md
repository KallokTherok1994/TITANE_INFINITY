# 🚀 GUIDE UTILISATION — TITANE∞ FRONTEND v15.6

## ═══════════════════════════════════════════════════════════════
## 🎯 COMMANDES PRINCIPALES
## ═══════════════════════════════════════════════════════════════

### 📦 Installation
```bash
cd /home/titane_os/Documents/TITANE_NEWGEN/TITANE_INFINITY
pnpm install
```

### 🔧 Développement
```bash
# Vite dev server seul (frontend uniquement)
pnpm run dev

# Tauri dev (frontend + backend Rust)
pnpm run tauri:dev
```

### 🏗️ Build Production
```bash
# Build Vite (frontend)
pnpm run build

# Build Tauri complet (binaire natif)
pnpm run tauri:build
```

### 🧪 Tests & Validation
```bash
# TypeScript type checking
pnpm run type-check

# Lint
pnpm run lint

# Auto-fix frontend complet
./scripts/titane_autofix_frontend.sh
```

### 🧹 Nettoyage
```bash
# Nettoyer dist + cache Vite
pnpm run clean:dist

# Nettoyer tout (node_modules, dist, cache, target)
pnpm run clean

# Réinstaller proprement
pnpm run reinstall
```

---

## ═══════════════════════════════════════════════════════════════
## 🎨 STRUCTURE FRONTEND v15.6
## ═══════════════════════════════════════════════════════════════

```
src/
├── App.tsx                  ← Point d'entrée (React Router v7)
├── router.tsx               ← Router moderne (lazy loading)
├── main.tsx                 ← Montage React
├── ui/
│   ├── AppLayout.tsx        ← Layout principal
│   ├── Menu.tsx             ← Navigation 7 sections
│   └── styles/
│       ├── AppLayout.css
│       └── Menu.css
├── pages/                   ← 11 pages
│   ├── Dashboard.tsx        → /
│   ├── Helios.tsx           → /helios
│   ├── Nexus.tsx            → /nexus
│   ├── Harmonia.tsx         → /harmonia
│   ├── Sentinel.tsx         → /sentinel
│   ├── Watchdog.tsx         → /watchdog
│   ├── SelfHeal.tsx         → /selfheal
│   ├── AdaptiveEngine.tsx   → /adaptive
│   ├── Memory.tsx           → /memory
│   ├── Settings.tsx         → /settings
│   └── DevTools.tsx         → /devtools
├── components/
│   └── experience/
│       ├── GlobalExpBar.tsx ← Barre XP permanente
│       └── ExpPanel.tsx     ← Modal XP
└── design-system/
    └── titane-v12.css       ← Design system
```

---

## ═══════════════════════════════════════════════════════════════
## 🧭 NAVIGATION (11 ROUTES)
## ═══════════════════════════════════════════════════════════════

| Route        | Page            | Description                    |
|--------------|-----------------|--------------------------------|
| `/`          | Dashboard       | Vue d'ensemble système         |
| `/helios`    | Helios          | Système vital et métriques     |
| `/nexus`     | Nexus           | Réseau cognitif                |
| `/harmonia`  | Harmonia        | Équilibre des flux             |
| `/sentinel`  | Sentinel        | Gardien de l'intégrité         |
| `/watchdog`  | Watchdog        | Surveillance temps réel        |
| `/selfheal`  | SelfHeal        | Auto-réparation                |
| `/adaptive`  | AdaptiveEngine  | Optimisation dynamique         |
| `/memory`    | Memory          | Mémoire AES-256-GCM            |
| `/settings`  | Settings        | Configuration système          |
| `/devtools`  | DevTools        | Outils de développement        |

---

## ═══════════════════════════════════════════════════════════════
## 🎮 MENU NAVIGATION (7 SECTIONS)
## ═══════════════════════════════════════════════════════════════

1. **💬 Chat IA** → `/` (Dashboard)
   - Module central - Intelligence conversationnelle

2. **⚙️ Système** → `/helios`
   - Performances, modules, moteurs, diagnostics

3. **📁 Projets** → `/nexus`
   - Gestion projets, XP, catégories, progression

4. **🎛️ Paramètres** → `/settings`
   - Thèmes, configuration, API, préférences

5. **💻 Admin** → `/devtools`
   - Terminal interne, commandes système

6. **🛡️ Heal** → `/selfheal`
   - Auto-Heal, erreurs, corrections, watchdog

7. **📜 Historique** → `/memory`
   - Journal complet des actions et modifications

---

## ═══════════════════════════════════════════════════════════════
## 🔧 RACCOURCIS CLAVIER
## ═══════════════════════════════════════════════════════════════

| Raccourci          | Action                |
|--------------------|-----------------------|
| `F12`              | Ouvrir DevTools       |
| `Ctrl+Shift+I`     | Ouvrir DevTools       |
| Clic GlobalExpBar  | Ouvrir ExpPanel       |

---

## ═══════════════════════════════════════════════════════════════
## 📊 PERFORMANCES
## ═══════════════════════════════════════════════════════════════

### Build Production
- ⏱️ **Temps :** 1.34s
- 📦 **Taille :** 256 KB
- 🎯 **Modules :** 86 transformés
- ✅ **TypeCheck :** OK
- ✅ **Optimisations :** Code splitting, lazy loading, tree shaking

### Assets
```
dist/index.html                   1.56 kB │ gzip:  0.86 kB
dist/assets/index-DGHEMR1X.css   33.25 kB │ gzip:  6.89 kB
dist/assets/index-CsDzy3CZ.js    67.66 kB │ gzip: 20.27 kB
dist/assets/vendor-QYCSsVv3.js  139.46 kB │ gzip: 45.09 kB
```

---

## ═══════════════════════════════════════════════════════════════
## 🛠️ SCRIPT AUTO-FIX
## ═══════════════════════════════════════════════════════════════

### Utilisation
```bash
cd /home/titane_os/Documents/TITANE_NEWGEN/TITANE_INFINITY
./scripts/titane_autofix_frontend.sh
```

### Fonctionnalités
1. ✅ Vérification structure (6 fichiers critiques)
2. ✅ Analyse frontend (AppLayout, Router, Pages)
3. ✅ Nettoyage (cache Vite, dist)
4. ✅ Réinstallation (pnpm install si besoin)
5. ✅ Build Vite (production test)
6. ✅ Test Tauri dev (timeout 6s)
7. ✅ Validation UI (14 composants)
8. ✅ Rapport horodaté (logs/frontend_autofix/)

### Rapport
```bash
cat logs/frontend_autofix/autofix_*.log
```

---

## ═══════════════════════════════════════════════════════════════
## 🚨 DÉPANNAGE
## ═══════════════════════════════════════════════════════════════

### Problème : Écran noir
```bash
# 1. Vérifier la console DevTools (F12)
# 2. Relancer auto-fix
./scripts/titane_autofix_frontend.sh

# 3. Clean build
pnpm run clean:dist
pnpm run build
```

### Problème : Erreur de build
```bash
# 1. Type check
pnpm run type-check

# 2. Nettoyer cache
pnpm run clean:cache

# 3. Réinstaller
pnpm run reinstall
```

### Problème : Port 5173 occupé
```bash
# Tuer processus sur port 5173
lsof -ti:5173 | xargs kill -9

# Ou
pkill -9 -f "vite|node.*5173"

# Puis relancer
pnpm run dev
```

### Problème : Navigation ne fonctionne pas
```bash
# Vérifier que React Router est installé
npm list react-router-dom

# Réinstaller si nécessaire
pnpm install react-router-dom
```

---

## ═══════════════════════════════════════════════════════════════
## 📝 FICHIERS IMPORTANTS
## ═══════════════════════════════════════════════════════════════

### Configuration
- `vite.config.ts` — Configuration Vite
- `package.json` — Dépendances et scripts
- `tsconfig.json` — Configuration TypeScript
- `src-tauri/tauri.conf.json` — Configuration Tauri

### Rapports
- `RAPPORT_AUTO_REPAIR_FRONTEND_v15.6.md` — Rapport complet
- `logs/frontend_autofix/` — Logs auto-fix
- `CHANGELOG_v15.6.0.md` — Changelog

### Backup
- `src/App.backup.v15.5.tsx` — Backup ancien App.tsx

---

## ═══════════════════════════════════════════════════════════════
## ✅ CHECKLIST VALIDATION
## ═══════════════════════════════════════════════════════════════

### Avant déploiement
- [ ] `pnpm run type-check` — OK
- [ ] `pnpm run build` — OK (< 2s)
- [ ] `pnpm run tauri:build` — OK
- [ ] Navigation entre pages — OK
- [ ] Menu collapse/expand — OK
- [ ] GlobalExpBar visible — OK
- [ ] ExpPanel s'ouvre — OK
- [ ] DevTools F12 — OK
- [ ] Responsive mobile — OK
- [ ] Dark/Light themes — OK

---

## ═══════════════════════════════════════════════════════════════
## 🎯 VERSIONS
## ═══════════════════════════════════════════════════════════════

- **TITANE∞ :** v15.6.0
- **React :** 18.3.1
- **React Router :** 7.9.6
- **Vite :** 6.4.1
- **Tauri :** 2.9.0
- **TypeScript :** 5.x
- **Node :** 20.x

---

## 🏆 STATUT FINAL

```
═══════════════════════════════════════════════════════
  ✅ FRONTEND TITANE∞ v15.6 — 100% OPÉRATIONNEL
═══════════════════════════════════════════════════════
  ✅ App.tsx reconstruit (React Router v7)
  ✅ router.tsx créé (lazy loading)
  ✅ AppLayout stable
  ✅ 11 routes fonctionnelles
  ✅ 14/14 composants validés
  ✅ Build 1.34s | 256KB
  ✅ UI/UX moderne
═══════════════════════════════════════════════════════
```

---

**Date :** 2025-11-21
**Version :** TITANE∞ v15.6.0
**Mission :** ACCOMPLIE ✅
