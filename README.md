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

**📖 Guide complet:** [docs/04_guides/quickstart/QUICKSTART.md](docs/04_guides/quickstart/QUICKSTART.md)

### Installation Rapide (5 min)

#### Ubuntu 24.04 (Automated)

```bash
# Installation complète automatisée
cd /home/titane-os/Documents/GitHub/TITANE_INFINITY
./scripts/TITANE_POST_INSTALL_UBUNTU.sh
```

#### Autres OS (Manuel)

```bash
# 1. Cloner le repo
git clone https://github.com/KallokTherok1994/TITANE_INFINITY.git
cd TITANE_INFINITY

# 2. Installer dépendances
npm install

# 3. Lancer Titan-Dev (développement)
npm run dev:tauri
```

**Détails complets:** [Installation Guide](docs/04_guides/quickstart/QUICKSTART.md#installation-rapide)

### Premier Lancement

```bash
# Titan-Dev (développement avec hot-reload)
npm run dev:tauri

# Titan-Stable (production optimisé)
./runtime/stable/build.sh
```

**Configuration Chat IA:** [Chat IA Setup](docs/04_guides/quickstart/QUICKSTART.md#chat-ia---premiers-pas)  
**Dépannage:** [Troubleshooting](docs/04_guides/quickstart/QUICKSTART.md#dépannage)

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

**🛠️ Setup Guide:** [docs/04_guides/development/SETUP.md](docs/04_guides/development/SETUP.md)  
**🧪 Testing Guide:** [docs/04_guides/development/TESTING.md](docs/04_guides/development/TESTING.md)

### Dual Runtime

- **Titan-Dev** (`runtime/dev/`) : Développement avec DevTools, hot-reload, logs détaillés
- **Titan-Stable** (`runtime/stable/`) : Production optimisée, DevTools désactivés

**Configuration IDE:** [SETUP.md § VSCode](docs/04_guides/development/SETUP.md#configuration-ide)

### Scripts Principaux

```bash
npm run dev              # Vite dev server
npm run dev:tauri        # Launch Titan-Dev
npm run build            # Build frontend
npm run tauri:build      # Build Titan-Stable
npm run lint             # ESLint + Prettier
npm run test             # Run tests frontend
npm run test:rust        # Cargo tests backend
```

**Workflows Git:** [SETUP.md § Git](docs/04_guides/development/SETUP.md#workflows-git)

---

## 📚 Documentation

**🗺️ Master Index:** [docs/04_guides/INDEX.md](docs/04_guides/INDEX.md)

### Guides Essentiels

- 📖 **[QUICKSTART.md](docs/04_guides/quickstart/QUICKSTART.md)** — Onboarding utilisateur complet (Installation, Chat IA, Features, Dépannage)
- 🛠️ **[SETUP.md](docs/04_guides/development/SETUP.md)** — Setup environnement développement (IDE, Dual Runtime, Git workflows)
- 🧪 **[TESTING.md](docs/04_guides/development/TESTING.md)** — Stratégie tests complète (Frontend, Backend, E2E, CI/CD)

### Features Spécialisées

- 🎤 **[VOICE.md](docs/04_guides/features/VOICE.md)** — Mode Vocal (Voice-to-Text, TTS, duplex)
- 🎨 **[MULTIMODAL.md](docs/04_guides/features/MULTIMODAL.md)** — Multimodal Engine (Vision, Audio 3D, Fusion)
- 🧠 **[MEMORY_OS.md](docs/04_guides/features/MEMORY_OS.md)** — UnifiedMemory OS (STM/MTM/LTM)
- ⏱️ **[TEMPORAL.md](docs/04_guides/features/TEMPORAL.md)** — Temporal Integrations (Tick health, scheduler)

### Architecture Technique

- **[ARCHITECTURE_CURRENT_v24.md](docs/00_meta/ARCHITECTURE_CURRENT_v24.md)** — Architecture système complète
- **[DATA_FLOW_CHAT.md](docs/02_architecture_reality/DATA_FLOW_CHAT.md)** — Flow messaging chat
- **[OMEGA_PIPELINE_DETAILED.md](docs/02_architecture_reality/OMEGA_PIPELINE_DETAILED.md)** — Pipeline OMEGA 10 stages
- **[TAURI_COMMANDS_REFERENCE.md](docs/02_architecture_reality/TAURI_COMMANDS_REFERENCE.md)** — API commands Tauri

### Evolution & Reports

- **[DOCUMENTATION_EVOLUTION_REPORT.md](DOCUMENTATION_EVOLUTION_REPORT.md)** — Évolution documentation Phase 0-5
- **[CHANGELOG.md](CHANGELOG.md)** — Historique changements versions

---

## 🧪 Tests

**🧪 Testing Strategy:** [docs/04_guides/development/TESTING.md](docs/04_guides/development/TESTING.md)

```bash
# Tests frontend (Vitest)
npm run test
npm run test:coverage
npm run test:ui

# Tests backend (Cargo)
cargo test
cargo test omega::
cargo tarpaulin

# Tests E2E (Playwright)
npm run test:e2e
npm run test:e2e:ui

# Tous les tests
npm run test:all
```

**Test pyramid:** 80% unit, 15% integration, 5% E2E  
**Coverage target:** 70%+ overall  
**Détails:** [TESTING.md](docs/04_guides/development/TESTING.md)

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
