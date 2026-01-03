# 📚 GUIDE DE RÉFÉRENCE — TITANE∞ v15.5

## 🚀 Démarrage Rapide

### Option 1 : Script interactif (recommandé)
```bash
./START.sh
```

### Option 2 : Commandes directes

#### Frontend uniquement (développement web)
```bash
pnpm run dev
# → http://localhost:5173
```

#### Application complète (Tauri + Frontend)
```bash
pnpm run tauri:dev
# Nécessite WebKitGTK (voir section Installation)
```

---

## 📦 Scripts NPM Disponibles

### Développement
| Commande | Description |
|----------|-------------|
| `pnpm run dev` | Lance Vite dev server (port 5173) |
| `pnpm run tauri:dev` | Lance l'application Tauri complète |
| `pnpm run preview` | Preview du build production (port 4173) |

### Build
| Commande | Description |
|----------|-------------|
| `pnpm run build` | Build production (TypeScript + Vite) |
| `pnpm run tauri:build` | Build application native (.deb, .AppImage, etc.) |
| `pnpm run tauri:build:debug` | Build debug avec symboles |
| `pnpm run test:build` | Type-check + build (CI/CD) |

### Qualité Code
| Commande | Description |
|----------|-------------|
| `pnpm run type-check` | Vérification TypeScript (sans émission) |
| `pnpm run lint` | ESLint avec rapport |
| `pnpm run lint:fix` | Correction automatique ESLint |

### Maintenance
| Commande | Description |
|----------|-------------|
| `pnpm run clean` | Supprime node_modules, dist, target |
| `pnpm run clean:dist` | Supprime uniquement dist/ |
| `pnpm run clean:cache` | Supprime .vite cache |
| `pnpm run reinstall` | Clean + réinstallation complète |

### Vérification Système
| Commande | Description |
|----------|-------------|
| `pnpm run verify` | Vérification système globale |
| `pnpm run verify:tauri` | Vérification API Tauri v2 |
| `pnpm run verify:cognitive` | Tests modules cognitifs |
| `pnpm run verify:stacks` | Tests stacks (neural, perception) |

---

## 🔧 Installation des Dépendances Système

### WebKitGTK (requis pour Tauri sur Linux)

#### Automatique
```bash
sudo ./install_system_deps.sh
```

#### Manuel (Pop!_OS / Ubuntu)
```bash
sudo apt update
sudo apt install -y \
  libwebkit2gtk-4.1-dev \
  build-essential \
  curl \
  wget \
  file \
  libssl-dev \
  libayatana-appindicator3-dev \
  librsvg2-dev
```

#### Vérification
```bash
pkg-config --modversion webkit2gtk-4.1
# Doit retourner : 2.42.x ou supérieur
```

---

## 🏗️ Structure du Projet

```
TITANE_INFINITY/
├── src/                    # Code source frontend
│   ├── main.tsx           # Point d'entrée React
│   ├── App.tsx            # Composant racine
│   ├── ui/                # Composants UI/UX
│   │   ├── pages/         # Pages (Chat, System, Projects)
│   │   └── components/    # Composants réutilisables
│   ├── layout/            # Layout (Sidebar, Header)
│   ├── hooks/             # Custom React hooks
│   ├── api/               # Client Tauri API
│   └── design-system/     # TITANE v12 Design System
│
├── src-tauri/             # Code source backend Rust
│   ├── src/               # Modules Rust
│   ├── Cargo.toml         # Dépendances Rust
│   └── tauri.conf.json    # Configuration Tauri
│
├── dist/                  # Build frontend (généré)
├── public/                # Assets statiques
├── index.html             # Template HTML
├── vite.config.ts         # Configuration Vite
├── tsconfig.json          # Configuration TypeScript
├── package.json           # Dépendances NPM + scripts
└── START.sh               # Script de démarrage rapide
```

---

## 🎨 Design System

### TITANE v12
- **Localisation** : `src/design-system/titane-v12.css`
- **Variables CSS** : Couleurs, espacements, typographie
- **Thèmes** : Dark (défaut), Light
- **Composants** : 15 fichiers CSS modernisés avec glass morphism

### Couleurs Principales
| Variant | Variable | Hex |
|---------|----------|-----|
| Primary (Rubis) | `--color-primary` | #dc2626 |
| Success (Émeraude) | `--color-success-500` | #10b981 |
| Warning | `--color-warning-500` | #f59e0b |
| Danger | `--color-danger-500` | #ef4444 |
| Info (Saphir) | `--color-info-500` | #3b82f6 |

---

## 🐛 Débogage

### DevTools Tauri

#### Méthode 1 : Raccourcis clavier
- **F12** ou **Ctrl+Shift+I** (dans l'application)

#### Méthode 2 : Bouton d'urgence
- Cliquez sur le bouton rouge "🔧 DEBUG" en haut à droite

#### Méthode 3 : Configuration
- `src-tauri/tauri.conf.json` → `"devtools": true`

### Logs

#### Frontend (browser console)
```javascript
console.log('[TITANE] Message');
console.error('[TITANE] Erreur:', error);
```

#### Backend (terminal)
```bash
# Les logs Rust s'affichent dans le terminal où vous avez lancé tauri:dev
```

---

## 🔥 Problèmes Courants

### ❌ `pnpm run tauri:dev` échoue avec "webkit2gtk not found"
**Solution** : Installez WebKitGTK
```bash
sudo ./install_system_deps.sh
```

### ❌ Écran noir au lancement
**Causes possibles** :
1. Frontend non compilé → `pnpm run build`
2. Port 5173 déjà utilisé → Fermez l'autre processus
3. DevTools : Appuyez sur F12 pour voir les erreurs

### ❌ `pnpm run build` erreurs TypeScript
**Solution** : Vérifiez d'abord
```bash
pnpm run type-check
```

### ❌ `error TS6133: variable declared but never read`
**Solution** : Préfixez avec `_`
```typescript
const handleClick = (_param: string) => {
  // _param sera utilisé plus tard
};
```

---

## 📊 Métriques de Build

### Actuelles (v15.5)
| Metric | Valeur |
|--------|--------|
| Build time | ~1s |
| CSS bundle | 34.09 KB (6.82 KB gzipped) |
| JS bundle | 39.45 KB (9.43 KB gzipped) |
| Vendor | 139.46 KB (45.09 KB gzipped) |
| TypeScript errors | 0 |
| ESLint warnings | 0 |

---

## 🚀 Workflow de Développement

### 1. Développement Frontend
```bash
# Terminal 1 : Frontend dev server
pnpm run dev

# Terminal 2 : Type checking en continu (optionnel)
pnpm run type-check -- --watch
```

### 2. Développement Full-Stack
```bash
# Lance Tauri + Frontend avec hot-reload
pnpm run tauri:dev
```

### 3. Avant Commit
```bash
# Vérifications
pnpm run type-check
pnpm run lint
pnpm run build

# Ou tout en un
pnpm run test:build
```

### 4. Build Production
```bash
# Frontend
pnpm run build

# Application native (.deb, .AppImage, etc.)
pnpm run tauri:build
```

---

## 🎯 Prochaines Étapes

### Phase 2 — Accessibilité
- ARIA labels sur tous les composants interactifs
- Keyboard navigation avec focus-visible
- Screen reader support
- Color contrast WCAG AA

### Phase 3 — Performance
- Lazy loading avec React.lazy()
- Code splitting par route
- Bundle analysis
- Image optimization (WebP)

### Phase 4 — Icônes
- Remplacement des emojis par Lucide Icons
- Wrapper Icons.tsx unifié
- Tailles consistantes

---

## 📞 Support

### Documentation
- **Design System** : `UI_UX_RAPPORT_OPTIMISATION_v15.5.md`
- **Changelog** : `UI_UX_CHANGELOG_v15.5.md`
- **Architecture** : `ARCHITECTURE_COMPLETE_V13_V14.md`

### Scripts de Vérification
```bash
pnpm run verify              # Système global
pnpm run verify:tauri        # API Tauri v2
pnpm run verify:cognitive    # Modules cognitifs
```

---

**Version** : 15.5.0  
**Status** : Production Ready  
**Build** : 963ms | 0 errors | 60fps animations  

🎨 **TITANE∞ — Système Intelligent Auto-Évolutif**
