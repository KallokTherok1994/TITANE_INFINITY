# TITANE∞ — Cognitive Operating System

**Version:** v24.2.0  
**Status:** Beta Avancée (Production Ready)  
**License:** Proprietary — © 2025 Humain Total / Kevin Thibault

---

## 🌟 Vision

TITANE∞ est un **OS cognitif local-first** : votre double numérique évolutif, privé et auto-réparateur.

- 🧠 **9 Moteurs Unifiés** : Architecture cognitive modulaire
- 🔄 **Pipeline OMEGA v2** : 10 étapes de traitement intelligent
- 💾 **UnifiedMemory OS** : STM → MTM → LTM Neural
- 🎭 **Dual Runtime** : Titan-Dev (expérimentation) + Titan-Stable (production)
- 🔒 **Privacy-First** : 100% local, zéro cloud obligatoire
- 🛡️ **Self-Healing** : Auto-diagnostic et auto-réparation

---

## 🚀 Quick Start

### Prérequis

- **OS:** Ubuntu 24.04 LTS (recommandé) ou compatible Linux
- **Node.js:** v20+ (LTS)
- **Rust:** 1.75+
- **Tauri CLI:** v2.0+

### Installation

```bash
# 1. Cloner le repo
git clone https://github.com/KallokTherok1994/TITANE_INFINITY.git
cd TITANE_INFINITY

# 2. Installer dépendances
npm install

# 3. Configurer Python environment (optionnel pour TTS/Voice)
./scripts/setup_environment.sh

# 4. Lancer Titan-Dev (développement)
npm run dev:tauri
# Ou via task VSCode: "🟢 Launch Titan-Dev"
```

### Build Production (Titan-Stable)

```bash
# Build optimisé pour production
./runtime/stable/build.sh

# Ou via task VSCode: "🔵 Build Titan-Stable"
```

---

## 📐 Architecture v24

### Frontend (React + TypeScript)

```
src/
├── engines/          # 14 moteurs cognitifs (selfHealing, flow, time...)
├── core/             # Cœur système (pipelines, healing, safety)
├── services/         # Services métier (ai, api, memory, voice, tts)
├── stores/           # State management (Zustand)
├── hooks/            # Custom React hooks
├── features/         # Modules métier (chat, memory, dashboard)
└── ui/               # Composants UI + Pages
```

### Backend (Tauri v2 + Rust)

```
src-tauri/src/
├── omega/            # Pipeline OMEGA Rust (10 étapes)
├── conversation_engine/  # Conversation Engine
├── memory_os/        # Memory OS Neural (STM/MTM/LTM)
├── singularity/      # Singularity State
├── cognitive/        # Cognitive Layer
├── security/         # Security & Sandbox
└── commands/         # 20+ modules de commandes Tauri
```

### Pipeline OMEGA v2 (10 Étapes)

```
1. Input Validation
2. Context Retrieval (UnifiedMemory)
3. Intent + Emotion Analysis (parallel)
4. Prompt Construction
5. AI Generation (multi-providers)
6. Post-Processing (French mastery, sanitize)
7. Validation Output
8. Memory Save (UnifiedMemory)
9. Singularity Sync
10. Self-Healing Check
```

---

## 🛠️ Développement

### Dual Runtime

- **Titan-Dev** (`runtime/dev/`) : Développement avec DevTools activés
- **Titan-Stable** (`runtime/stable/`) : Production optimisée, DevTools désactivés

### Scripts Principaux

```bash
npm run dev              # Vite dev server
npm run dev:tauri        # Launch Titan-Dev
npm run build            # Build frontend
npm run tauri:build      # Build Titan-Stable
npm run lint             # ESLint + Prettier
npm run test             # Run tests
npm run test:rust        # Cargo tests
```

### Git Workflow

```
feature/* → dev → stable-runtime
```

- **feature/\*** : Nouvelles fonctionnalités
- **dev** : Développement actif
- **stable-runtime** : Branch de production

---

## 📚 Documentation

### Docs Canoniques

- **ARCHITECTURE.md** : Architecture détaillée (frontend/backend/pipeline)
- **DEVELOPER_GUIDE.md** : Guide développeur (conventions, setup, troubleshooting)
- **AUDIT_COMPLET_v21_ENGINE_2025-12-10.md** : Audit complet système
- **CHANGELOG_v24.md** : Historique des changements v24

### Docs Techniques

- `docs/OMEGA_PIPELINE_v2.md` : Pipeline OMEGA détaillé
- `docs/TITANE_OS/` : Documentation OS cognitif
- `docs/architecture/` : Diagrammes et schémas
- `.github/instructions/titane.instructions.md` : Instructions globales

---

## 🧪 Tests

```bash
# Tests frontend
npm run test:unit
npm run test:integration
npm run test:e2e

# Tests backend
npm run test:rust

# Tous les tests
npm run test:all
```

---

## 🔐 Sécurité

- **Secrets Engine** : Chiffrement AES-256-GCM
- **Sandbox Tauri** : Isolation filesystem + permissions
- **CSP** : Content Security Policy configurée
- **Local-First** : Données 100% locales par défaut

---

## 🤝 Contribution

TITANE∞ est un projet propriétaire. Pour contribuer :

1. Fork le repo (si accès autorisé)
2. Créer une branche feature : `git checkout -b feature/ma-feature`
3. Commit : `git commit -m "feat(scope): description"`
4. Push : `git push origin feature/ma-feature`
5. Ouvrir une Pull Request vers `dev`

### Conventions Commit

```
<type>(<scope>): <description>

- Point 1
- Point 2

Task: <id>
```

**Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`

---

## 📊 Roadmap v24-v25

### Phase 1 : Stabilisation (Semaine 1-2) ✅

- [x] Éliminer unwrap() production Rust
- [x] Sécuriser main.rs (graceful errors)
- [x] Archiver 60+ docs obsolètes
- [x] Fixer version unique v24.2.0
- [x] Supprimer double sauvegarde mémoire

### Phase 2 : Simplification (Semaines 3-4)

- [ ] Fusionner modules mémoire (memory/ + memory_os/)
- [ ] Fusionner modules Singularity (1 seul module)
- [ ] Découper useChat.ts (3 hooks)
- [ ] Réduire stores Zustand (20 → 8)

### Phase 3 : Alignement OMEGA (Semaine 5)

- [ ] Aligner Pipeline Rust ↔ TypeScript (10 étapes chacun)
- [ ] Documenter OMEGA_PIPELINE_v2.md
- [ ] Tests E2E pipeline complets

### Phase 4 : Performance & UX (Semaine 6)

- [ ] Lazy-load engines lourds
- [ ] Standardiser loading states
- [ ] Niveaux de log DevTools (LOG_LEVEL)
- [ ] Error boundaries ChatIA

### Phase 5 : Documentation & Release (Semaine 7)

- [ ] Actualiser ARCHITECTURE.md
- [ ] Créer DEVELOPER_GUIDE.md
- [ ] Release v24.2.0 stable

---

## 📞 Support

- **Issues GitHub** : [Issues](https://github.com/KallokTherok1994/TITANE_INFINITY/issues)
- **Documentation** : Voir `docs/`
- **Email** : contact@titane-infinity.com (si configuré)

---

## 📜 License

**Proprietary License** — © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.

Voir `LICENSE.md` pour détails.

---

**TITANE∞ v24.2.0** — _Your Cognitive Operating System_
