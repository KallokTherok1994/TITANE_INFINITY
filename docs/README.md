# TITANE∞ v28.12.0

![Version](https://img.shields.io/badge/version-28.12.0-blue)
![Rust](https://img.shields.io/badge/rust-2021-orange)
![React](https://img.shields.io/badge/react-18-61dafb)
![TypeScript](https://img.shields.io/badge/typescript-5.5-3178c6)
![Tauri](https://img.shields.io/badge/tauri-2.0-ffc131)
![Modules](https://img.shields.io/badge/modules-60+-green)
![Status](https://img.shields.io/badge/status-production%20ready-success)

**Plateforme Cognitive Avancée - Intelligence Émergente Complète**

TITANE∞ (Transformative Intelligence Through Adaptive Neural Engines - Infinity) est une plateforme cognitive de nouvelle génération avec **60+ modules intelligents** organisés en **10+ stacks hiérarchiques**, construite pour l'auto-régulation, l'adaptation intelligente et l'évolution continue.

## Statut canonique de version (mode B2)

- Verite version repo: `28.12.0` via `package.json` et `CHANGELOG.md` (`PROVEN_BY_REPO`)
- `README.md` et ce fichier sont les surfaces canoniques de navigation (`PROVEN_BY_CANON_DOC`)
- La ligne binaire `v27.0.5` est conservee comme historique documente (hors autorite version repo)
- `RELEASE_v28.12.0_SEALED.txt` est la reference de release canonique courante

## Navigation canonique

- Entrée racine: [`../README.md`](../README.md)
- Index documentaire global: [`INDEX.md`](INDEX.md)
- Diagrammes Mermaid: [`diagrams/README.md`](diagrams/README.md)

## 🌟 Caracteristiques v28.12.0

- **60+ Modules Intelligents** : Architecture modulaire complète avec stacks hiérarchiques
- **Auto-Régulation** : Governor et Autonomic Evolution pour homéostasie cognitive
- **Auto-Conscience** : Conscience Engine avec clarity, coherence et insight
- **Direction Stratégique** : Mission, Taskflow et Self-Alignment pour planification long terme
- **Synthèse Cognitive** : Resonance v2, Meaning et Identity pour cognition profonde
- **Plasticité** : Adaptive Intelligence pour absorption tensions et adaptation
- **Architecture Consultatif** : Observation pure sans actions directes
- **Sécurité Maximale** : Online-first gouverné, fallback local obligatoire, chiffrement multi-niveaux
- **Performance Native** : Backend Rust 2021 optimisé (~75,000 lignes)
- **Interface Moderne** : React 18 + TypeScript strict
- **DevTools Intégrés** : Monitoring et dashboard en temps réel

## 🏗️ Architecture v28.12.0

```
TITANE∞ - 10+ Stacks Hiérarchiques
═══════════════════════════════════════════════════════════

┌─────────────────────────────────────────────────────────┐
│  Strategic Direction Layer (#52-54)                     │
│  → Mission, Taskflow, Self-Alignment                    │
└─────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────┐
│  Cognitive Synthesis Layer (#49-51)                     │
│  → Resonance v2, Meaning, Identity                      │
└─────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────┐
│  Advanced Cognitive Layer (#55-57,59)                   │
│  → Governor, Conscience, Adaptive, Autonomic Evolution  │
└─────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────┐
│  Executive + Sentient Layers                            │
│  → 6 modules exécutifs + 5 modules sentients            │
└─────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────┐
│  Monitoring + Neural Mesh                               │
│  → Stability, Integrity, Balance + NeuroMesh, CoreMesh  │
└─────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────┐
│  Perception + Advanced Stacks                           │
│  → 4 modules perception + 3 modules advanced            │
└─────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────┐
│  Security + Core (24+)                                  │
│  → Kernel, SecureFlow, LowFlow + modules fondamentaux   │
└─────────────────────────────────────────────────────────┘
```

## 📋 Prérequis

### Système
- **OS** : Linux (Ubuntu 20.04+), macOS 11+, Windows 10+
- **RAM** : 4 GB minimum, 8 GB recommandé
- **Disque** : 2 GB disponible

### Développement
- **Node.js** : 20.0.0+
- **npm** : 10.0.0+
- **Rust** : 1.70+ (edition 2021)
- **Cargo** : 1.70+

### Linux uniquement
```bash
sudo apt-get update
sudo apt-get install -y \
    libwebkit2gtk-4.1-dev \
    build-essential \
    curl \
    wget \
    file \
    libssl-dev \
    libgtk-3-dev \
    libayatana-appindicator3-dev \
    librsvg2-dev
```

## 🚀 Installation

### 1. Cloner le projet
```bash
git clone https://github.com/titane/infinity.git
cd TITANE_INFINITY
```

### 2. Installer Rust (si nécessaire)
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env
```

### 3. Installer les dépendances
```bash
corepack enable
pnpm install
```

## ▶️ Utilisation

### Mode Développement
```bash
pnpm run dev:tauri
```

### Build Production
```bash
GO_FOR_PROD_BUILD__TITANE_INFINITY=GO_FOR_PROD_BUILD__TITANE_INFINITY corepack pnpm exec tauri build --config src-tauri/tauri.conf.json
```

### Native Desktop Freshness Gate (preprod/prod)
```bash
bash scripts/verify/verify-native-binary-freshness.sh
```

This gate must pass before native desktop certification and before any production build/deploy authorization.

### Nettoyage
```bash
pnpm run clean:all
```

## 🧩 Modules

### ☀️ Helios
Monitoring système en temps réel (CPU, mémoire, disque).

### 🔗 Nexus
Gestionnaire du graphe cognitif et des connexions neuronales.

### 🎼 Harmonia
Orchestrateur de processus et synchronisation.

### 🛡️ Sentinel
Système de sécurité et contrôle d'accès.

### 🐕 Watchdog
Surveillance système et logging.

### 🔧 SelfHeal
Auto-réparation et récupération d'erreurs.

### 🧠 AdaptiveEngine
Moteur d'apprentissage et d'adaptation.

### 💾 Memory
Stockage persistant et gestion mémoire.

## 🔐 Sécurité

- ✅ Online-first gouverné (surfaces réseau contrôlées)
- ✅ Fallback local obligatoire (Tauri/Ollama)
- ✅ Sandbox activé
- ✅ CSP stricte
- ✅ Pas d'eval()
- ✅ Chiffrement des données sensibles

## 📚 Documentation

### Documentation Principale

- [Architecture Complète](MAP_ARCHITECTURE_4RING.md)
- [Guide des Modules](MODULES.md)
- [Sécurité](SECURITY.md)
- [Guide Développeur](DEVELOPER_GUIDE.md)
- [Changelog App](../CHANGELOG.md)

### 🧬 Super Prompts (Chirurgie Frontend/Backend)

**NOUVEAU** : Collection de Super Prompts pour GitHub Copilot Chat, optimisés pour finaliser rapidement TITANE∞.

- **[📚 Index Super Prompts](super-prompts/README.md)** - Vue d'ensemble + Roadmap
- **[⚡ Quick Start](super-prompts/QUICK_START.md)** - Démarrage en 5 étapes
- **[🎨 Guide Visuel](super-prompts/VISUAL_GUIDE.md)** - Diagrammes + Workflows
- **[⚡ Cheat Sheet](super-prompts/CHEAT_SHEET.md)** - Aide-mémoire rapide

**Prompts disponibles** (7/7 - Collection complète ✅) :
- ✅ [#1 - Frontend Final Form](super-prompts/frontend/SUPER_PROMPT_01_FRONTEND_FINAL_FORM.md) — UI/UX + Design System
- ✅ [#2 - Rust Backend Cleanup](super-prompts/backend/SUPER_PROMPT_02_RUST_BACKEND_CLEANUP.md) — Code quality + Error handling
- ✅ [#3 - API Consolidation](super-prompts/backend/SUPER_PROMPT_03_API_CONSOLIDATION.md) — API standardization
- ✅ [#4 - Cognitive Optimization](super-prompts/cognitive/SUPER_PROMPT_04_COGNITIVE_OPTIMIZATION.md) — Engine performance
- ✅ [#5 - Memory Refinement](super-prompts/cognitive/SUPER_PROMPT_05_MEMORY_REFINEMENT.md) — Memory system
- ✅ [#6 - Security Hardening](super-prompts/security/SUPER_PROMPT_06_SECURITY_HARDENING.md) — OWASP + Encryption
- ✅ [#7 - Performance Audit](super-prompts/performance/SUPER_PROMPT_07_PERFORMANCE_AUDIT.md) — Profiling + Optimization

**ROI estimé global** : ~90% de réduction du temps (135-270h gagnées sur 150-300h)

## 🛠️ Développement

### Structure du Projet
```
TITANE_INFINITY/
├── core/
│   ├── backend/     # Rust backend
│   └── frontend/    # React frontend
├── system/
│   ├── config/      # Configurations
│   └── scripts/     # Scripts utilitaires
└── docs/            # Documentation
```

### Commandes Utiles
```bash
# Type check TypeScript
pnpm run check

# Lint
pnpm run lint

# Build frontend uniquement
pnpm run build

# Dev Tauri
pnpm run dev:tauri

# Build Tauri
GO_FOR_PROD_BUILD__TITANE_INFINITY=YES corepack pnpm exec tauri build --config src-tauri/tauri.conf.json
```

## 🤝 Contribution

Les contributions sont les bienvenues ! Voir [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md).

## 📄 License

MIT © 2025 TITANE Team

## 🔮 Roadmap

- [x] v8.0 - Architecture de base
- [ ] v8.1 - Jumeau cognitif
- [ ] v8.2 - API externe sécurisée
- [ ] v8.3 - Plugins système
- [ ] v9.0 - Multi-agents

## 📧 Contact

- **Issues** : [GitHub Issues](https://github.com/titane/infinity/issues)
- **Documentation** : [Wiki](https://github.com/titane/infinity/wiki)

---

**TITANE∞ v8.0** - *Cognitive Platform of the Future*
