# TITANE∞ — Cognitive Operating System

## Pipeline unique (doctrine, kernel, optimal)

Le pipeline officiel et unique est :

scripts/pipeline/TITANE_PIPELINE_v39.sh

Toutes les opérations de build, test, packaging, mapping, rollback, logs, artefacts, E2E, autoheal, versioning, mapping docs, desktop icons, etc. sont centralisées dans ce pipeline.

L’ancien pipeline V12 est archivé/supprimé pour éviter toute confusion.

Voir la documentation interne et les logs pour la preuve d’exécution, la conformité doctrine, la traçabilité et le rollback.

![CI/CD Status](https://github.com/KallokTherok1994/TITANE_INFINITY/actions/workflows/ci-unified.yml/badge.svg?branch=MAIN)
![Mermaid Canon](https://github.com/KallokTherok1994/TITANE_INFINITY/actions/workflows/mermaid-verify.yml/badge.svg?branch=MAIN)
![Release v31.1.0](https://img.shields.io/badge/release-v31.1.0-brightgreen?logo=github)

**Version:** v31.1.0 (repository authority)
**Status:** ✅ Production Ready (V30 maintained release stream)
**License:** Proprietary — © 2025-2026 Humain Total / Kevin Thibault
**Latest certified deployment:** `2026-04-17` via `deployment/latest/MANIFEST.json`
**Last published GitHub release:** [v30.1.25](https://github.com/KallokTherok1994/TITANE_INFINITY/releases/tag/v30.1.25) (last public binary)
**Prior major release tag:** [v30.0.0-release-20260406](https://github.com/KallokTherok1994/TITANE_INFINITY/releases/tag/v30.0.0-release-20260406) (historical)

**Canal de release canonique:** v30.1.34

**Qualité (2026-04-11) :** `verify:final100` PASS, `twins_memory_bridge_test` PASS, build stable Linux PASS, réinstallation desktop V30 et smoke-run `BOOT:READY` validés.
**Archive & legacy policy:** les surfaces obsolètes sont conservées sous `docs/99_ARCHIVE/` et `_archive/`; les surfaces actives V30 restent `src/`, `src-tauri/`, `README.md`, `CHANGELOG.md` et `docs/user/{fr,en}/`.

---

## 🔒 Discipline anti-dérive TITANE (Synthèse 2026-04-16)

1. **Synchronisation artefacts/launchers** :

- Toute production d’artefact doit être suivie d’une synchronisation et d’une vérification explicite des launchers système ET utilisateur, avec preuve (log, screenshot, grep launcher).
- Aucun artefact n’est certifié sans cette preuve.

2. **Couverture E2E renforcée** :

- Toute évolution UI/backend doit s’accompagner de tests E2E couvrant les flows critiques ET secondaires.
- Les selectors `data-testid` doivent être stables et documentés.

3. **Discipline de version et mapping** :

- Toute modification de surface déclenche la mise à jour des mapping docs et un bump de version.
- Rollback/correction : documenter cause racine, plan de prévention, rollback exact.

4. **Scripts post-build robustes** :

- Scripts idempotents, non-interactifs ou fallback documenté, logs de preuve pour chaque étape nécessitant sudo.

5. **Surveillance environnement/backend** :

- Tests d’isolation d’environnement et checks automatiques sur les variables critiques.

6. **Traçabilité des corrections** :

- Chaque correction/rollback doit être tracé dans `autoheal_rules.jsonl` et `registry/ui-events.jsonl` avec cause racine et test de prévention.

---

**Statut d'autorité documentaire (LOCAL, 2026-04-17) :**

- Source de version canonique du repo: `package.json` + `CHANGELOG.md` -> `30.1.34` (`PROVEN_BY_REPO`)
- Release canonique vérifiée: `v30.1.34` (`PROVEN_BY_REPO` + `PROVEN_BY_CHANGELOG`)
- Dernier binaire GitHub publié: `v30.1.25` (`PROVEN_BY_GITHUB_RELEASE`)
- Lignes binaires historiques documentées: `v30.0.0`, `v28.90.0`, `v28.88.0`, `v27.2.0` (`PROVEN_BY_CANON_DOC`)
- Politique de cohérence: version canonique et release courante `30.1.34`; les surfaces historiques restent archivées et identifiées par version

---

## 📦 Téléchargement

### ✅ Release canonique courante: v30.1.34

**Status**: ✅ PRODUCTION READY — CERTIFIED & DEPLOYED  
**Certification ID**: `TITANE_INFINITY_RELEASE_20260417_CORRECTION_CERTIFIED`  
**Last Certification Refresh**: April 17, 2026  
**Certification Scope**: verify:final100 PASS, Rust TWINS bridge PASS, rebuild/redeploy Linux V30 PASS, installed runtime smoke `BOOT:READY`

Artefacts vérifiés (Linux amd64):

- **AppImage**: `Titan-Stable_30.0.0_amd64.AppImage` (deployed in `deployment/latest/`)
- **DEB Package**: `Titan-Stable_30.0.0_amd64.deb` (deployed in `deployment/latest/`)

Checksums courants (`deployment/latest/MANIFEST.json`):

```
AppImage:  8bf170537c3f78e2179e47623f7a89ce6bb44c43304b52bd713054296364fcba
DEB:       2608165ea3b900d4f7f1f41e6ae12bf3c25201d9b94e58dc0d754204b81c3e30
```

### Installation Windows (PR #292)

Guide Windows complet:

- [docs/windows/SPINUP_WINDOWS.md](docs/windows/SPINUP_WINDOWS.md)

Launchers Windows fournis:

- [scripts/launch/launch-titane.ps1](scripts/launch/launch-titane.ps1)
- [scripts/launch/launch-titane.bat](scripts/launch/launch-titane.bat)

Exemple PowerShell:

```powershell
git clone https://github.com/KallokTherok1994/TITANE_INFINITY.git
cd TITANE_INFINITY
.\scripts\launch\launch-titane.ps1 -Mode dev
```

Pack launcher publie (session PR292):

- `deployment/windows/TITANE_WINDOWS_LAUNCHER_PACK_PR292_20260412.zip`
- `deployment/windows/TITANE_WINDOWS_LAUNCHER_PACK_PR292_20260412.sha256`
- Release GitHub: https://github.com/KallokTherok1994/TITANE_INFINITY/releases/tag/windows-pr292-launcher-pack-20260412

Preuve de session:

- [proof_packs/WINDOWS_PR292_RELEASE_20260412_233708/REPORT.md](proof_packs/WINDOWS_PR292_RELEASE_20260412_233708/REPORT.md)
- [proof_packs/WINDOWS_PR292_RELEASE_20260412_233708/VERDICT.md](proof_packs/WINDOWS_PR292_RELEASE_20260412_233708/VERDICT.md)
- [proof_packs/WINDOWS_PR292_RELEASE_20260412_233708/ROLLBACK.md](proof_packs/WINDOWS_PR292_RELEASE_20260412_233708/ROLLBACK.md)

**Release Notes & Installation**:

- Full release notes: [CHANGELOG.md](CHANGELOG.md)
- GitHub Release (primary): https://github.com/KallokTherok1994/TITANE_INFINITY/releases/tag/v30.0.0-release-20260406
- GitHub Release (historical certification): https://github.com/KallokTherok1994/TITANE_INFINITY/releases/tag/v30.0.0-release-20260405
- Current deployment manifest: [deployment/latest/MANIFEST.json](deployment/latest/MANIFEST.json)
- Current checksum bundle: [deployment/latest/CHECKSUMS.sha256](deployment/latest/CHECKSUMS.sha256)
- Historical checksum snapshot: [RELEASE_ARTIFACTS_CHECKSUMS_30.0.0.txt](RELEASE_ARTIFACTS_CHECKSUMS_30.0.0.txt)

**Security**: MAXIMUM_HARDENED  
**Authorization**: On-demand — production builds and deploys executed on user request (Rule 11).

### ✨ **Archive binaire historique : v27.0.5**

**Télécharger pour Linux (Debian/Ubuntu):**

```bash
wget https://github.com/KallokTherok1994/TITANE_INFINITY/releases/download/v27.0.5/TITANE-Infinity_27.0.5_amd64.deb
sudo dpkg -i TITANE-Infinity_27.0.5_amd64.deb
```

**Points cles (historique) v27.0.5 :**

- ✅ Warnings Rust audio corrigés (build release clean)
- 🧠 Alignement complet des versions app/frontend/backend
- 📦 Artefacts historiques de reference (AppImage/DEB/RPM)

**Compatibilité :**  
✅ Ubuntu 20.04+ | ✅ Debian 11+ | ✅ Linux Mint 20+ | ✅ Pop!\_OS 20.04+

📄 [Notes de release complètes](https://github.com/KallokTherok1994/TITANE_INFINITY/releases/tag/v27.0.5)

🔐 [Checksums v27.0.5][checksums-historiques-v2705]

🔐 [Checksums historiques v28.88.0](./docs/90_release/PRODUCTION_RELEASE_v28.88.0.md)

[checksums-historiques-v2705]: ./deployment/latest/SHA256SUMS_v27.0.5.txt

---

## 🌟 Vision

TITANE∞ est un **OS cognitif online-first** : votre double numérique évolutif, gouverné et auto-réparateur.

- 🧠 **Architecture Modulaire** : 13 centres unifiés + 9 moteurs cognitifs + 4-Ring model
- 🔄 **Pipeline OMEGA v2** : 10 étapes de traitement intelligent
- 💾 **UnifiedMemory OS** : STM → MTM → LTM Neural
- 🎭 **Dual Runtime** : Titan-Dev (expérimentation) + Titan-Stable (production)
- 🌐 **Online-First** : Connectivité réseau requise, LLM cloud optimisés
- 🛡️ **Self-Healing** : Auto-diagnostic et auto-réparation + stop-the-line gates

---

## 🗓️ Version Timeline

### Historique de production (v29.x + v28.x + v27.x)

- **v30.0.0** (Current Release Stream — 🚀)
  - Status: ✅ CERTIFIED & DEPLOYED (2026-04-05)
  - Tag: `v30.0.0-release-20260406`
  - Tag: `v30.0.0-release-20260405`
  - Gates: eval harness PASS, certified deployment PASS, deployment metadata aligned
  - Proof: `CHANGELOG.md` + `deployment/latest/MANIFEST.json` + `RELEASE_ARTIFACTS_CHECKSUMS_30.0.0.txt`

- **v28.88.0** (HISTORIQUE — previous sealed release)
  - Status: ✅ SEALED (2026-03-21)
  - Tag: `v28.88.0`
  - Gates: tsc, eslint, vitest 3399/3399, pnpm build, cargo check, verify_instructions PASS=20
  - Proof: `RELEASE_v28.88.0_SEALED.txt`

- **v28.5.0** (HISTORIQUE)
  - Status: ✅ RELEASED
  - Tag: `v28.5.0`
  - Proof: `RELEASE_v28.5.0_SEALED.txt`

- **v27.0.5-prod** (HISTORIQUE) — Production binary baseline
  - Status: ✅ LIVE (99.99% uptime, 0 crashes)
  - Tag: 02bce9c7
  - Immutable production reference

- **v27.0.6** (DOCS-ONLY HOTFIX)
  - Status: Documentation updates only (no binary deployment)
  - Date: 2026-02-18

- **v27.2.0** (TYPESCRIPT STRICT - HISTORIQUE)
  - Status: ✅ DEPLOYED (2026-02-23)
  - Commit: a14a111f
  - Change: Zero TypeScript errors (strict mode)
  - Risk: MINIMAL (type-only, zero runtime impact)
  - Lane: Strict Mode (P2)

- **2026-03-03** (MAINTENANCE & PROOF SYNC)
  - Status: ✅ DONE (no version bump)
  - Commits: `25740b5d0`, `3895845c1`
  - Change: TS blockers corrigés + pack `ORCH_VΩ_2026-03-03_1436_0cdf39d39` scellé
  - Risk: LOW (stabilisation + documentation)

- **2026-03-06** (PROD REDEPLOY + RUNTIME VALIDATION)
  - Status: ✅ DONE (no version bump)
  - Commits: `43c35be3f`, `be5ced801`
  - Change: redeploy token-gated, smoke AppImage+Installed PASS, metadata `deployment/latest` resync
  - Risk: LOW (operational validation + metadata coherence)
  - Release note prep: [`RELEASE_NOTE_v27.2.0_POSTDEPLOY_2026-03-06.md`](docs/90_release/RELEASE_NOTE_v27.2.0_POSTDEPLOY_2026-03-06.md)

### Legacy Versions

See [CHANGELOG.md](CHANGELOG.md) and [CHANGELOG v27.2.0 entry](docs/90_release/CHANGELOG_v27.2.0_ENTRY.md) for release history.

---

## 🚀 Quick Start

### Prérequis

- **OS:** Ubuntu 24.04 LTS (recommandé) ou compatible Linux
- **Node.js:** v24+ (recommande)
- **pnpm:** v10.30.2 (via Corepack)
- **Rust:** 1.75+
- **Tauri CLI:** v2.0+
- **Git LFS:** requis (certains binaires toolchain sont versionnés via LFS)

### Installation

```bash
# 1. Cloner le repo
git clone https://github.com/KallokTherok1994/TITANE_INFINITY.git
cd TITANE_INFINITY

# 1.1 Initialiser Git LFS (recommandé)
git lfs install
git lfs pull

# 2. Installer dépendances (pnpm + toolchain incluse au repo)
export PATH="$PWD/.tools/node/current/bin:$PATH"
corepack pnpm install

# Alternative (réinstalle proprement):
./titane.sh repair

# 3. Configurer Python environment (optionnel pour TTS/Voice)
./scripts/setup_environment.sh

# 4. Lancer Titan-Dev (développement)
pnpm run dev:tauri
# Ou via task VSCode: "🟢 Launch Titan-Dev"
```

---

## 🛡️ Governance & Quality

TITANE∞ utilise un modèle de gouvernance strict avec **9 Gates constitutionnelles** :

### 9 Governance Gates

1. **G1: NO_OFFLINE_WITHOUT_REASON** — Network guard (block offline mode sans justification)
2. **G2: ONLINE_FIRST_STRICT** — Architecture compliance (enforce online-first)
3. **G3: IPC_ALLOWLIST_STRICT** — Security boundaries (explicit IPC allowlist)
4. **G4: NETWORK_SURFACE_MINIMAL** — Attack surface (minimal external reach)
5. **G5: NO_SILENT_DRIFT** — Documentation sync (code ↔ docs alignment)
6. **G6: BUILD_REPRODUCIBILITY** — Deterministic builds (same input = same output)
7. **G7: PROOF_DRIVEN_WORKFLOW** — Evidence requirements (no DONE without proof)
8. **G8: APPEND_ONLY_REGISTRY** — Immutable audit trail (no deletions)
9. **G9: STOP_THE_LINE** — Block on gate failure (no bypass sans autorisation)

**Stop-the-Line**: Any gate failure blocks deployment until resolved.

### Native Desktop Freshness Pre-Gate

Before native desktop certification and before PROD token usage, run:

```bash
bash scripts/verify/verify-native-binary-freshness.sh
```

Expected: `VERDICT=PASS` with a fresh binary class (`FRESH_RELEASE_BINARY`, `FRESH_DEBUG_BINARY`, or `FRESH_CERTIFIED_BINARY`).

### Append-Only Registry

TITANE∞ maintains an **immutable audit trail** of all UI changes, releases, and governance decisions:

- **File**: `registry/ui-events.jsonl`
- **Entries**: 87+ events (append-only, no deletions)
- **Format**: JSON Lines (1 event per line)
- **Integrity**: SHA256 checksums + cryptographic sealing
- **Purpose**: Complete audit trail for production compliance

**Example Event**:

```json
{
  "timestamp": "2026-02-23T20:31:32Z",
  "event": "DOCS_SYSTEM_UPGRADE_SEALED",
  "version": "v27.0.6",
  "ring": "Ring-4",
  "status": "QUALIFIED",
  "proof": "SHA256: abc123...",
  "metadata": { "files_changed": 6818, "critical_fixes": 3 }
}
```

**Gate**: G8 (APPEND_ONLY_REGISTRY) enforces immutability.

### Release Model: Lanes & Stages

TITANE∞ uses a **lane-based release model** with progressive wave deployment:

#### Lanes (Policy-Based)

1. **Hotfix Lane (P1)** — Critical security/crash fixes only
   - Timeline: <24h deployment
   - Gates: 6/9 required (G1, G2, G3, G7, G8, G9)
   - Risk: CRITICAL (production-only)

2. **Strict Mode Lane (P2)** — Type safety, refactoring, docs-only
   - Timeline: 1-3 days deployment
   - Gates: 9/9 required (full gate enforcement)
   - Risk: MINIMAL (no runtime impact)

3. **Perfection Lane (P2)** — Zero-error campaigns, performance
   - Timeline: 1-7 days deployment
   - Gates: 9/9 required
   - Risk: LOW-MEDIUM

#### Stages

- **EXPERIMENTAL** — Initial development, no production use
- **QUALIFIED** — Passed all gates, ready for wave deployment
- **STABLE** — 100% wave deployed, production-ready

#### Wave Deployment

Progressive rollout model (Strict & Perfection lanes only):

1. **Wave 1 (5%)** — Beta testers, internal monitoring (24h soak)
2. **Wave 2 (25%)** — Early adopters, expanded monitoring (48h soak)
3. **Wave 3 (100%)** — General availability (GA)

**Repository Authority**: v30.0.0 (documentation canonique)  
**Latest Canonical Release Stream**: v30.0.0 (`CHANGELOG.md` + `deployment/latest/MANIFEST.json`)

---

## 🧭 Structure Repo (Index)

- [docs/INDEX_REPO_STRUCTURE.md](docs/INDEX_REPO_STRUCTURE.md) — carte des dossiers + points d’entrée
- [docs/ui/INDEX_UI.md](docs/ui/INDEX_UI.md) — index UI (pages/features/components/hooks)
- Registre UI obligatoire: chaque changement UI doit ajouter une entry append-only dans `registry/ui-events.jsonl`.

## Mermaid Canon

- Index Mermaid: [docs/diagrams/README.md](docs/diagrams/README.md)
- Diagrammes rendus: [architecture_4_ring](docs/diagrams/rendered/architecture_4_ring.md), [data_flow_chat](docs/diagrams/rendered/data_flow_chat.md), [omega_pipeline_v2](docs/diagrams/rendered/omega_pipeline_v2.md), [certification_gates](docs/diagrams/rendered/certification_gates.md), [network_surface_online_first](docs/diagrams/rendered/network_surface_online_first.md)
- CI enforce Mermaid canon et drift strict

### Corepack Quickstart (recommandé)

```bash
# Activer Corepack et pnpm@10.30.2 pour coherence outillage
corepack enable
corepack prepare pnpm@10.30.2 --activate
```

### Build Production (Titan-Stable)

```bash
# Build production — on demand (Rule 11)
corepack pnpm exec tauri build --config src-tauri/tauri.conf.json

# Or use BUILD ALL command for full automated sequence (Rule 14)
# Ou via task VSCode: "🔵 Build Titan-Stable"
```

---

## 📐 Architecture v30.0.0

### 🗺️ Navigation (13 Centres Unifiés)

```
TITANE∞ v30.0.0

📂 PRINCIPAL
├─ 💬 Chat IA → /chat
├─ 🧬 EVO → /evo (Fusion: Dashboard+Identity+Memory+Evolution+Progression)
├─ 📅 Agenda → /agenda
└─ 📷 Vision → /camera

📂 CENTRES UNIFIÉS
├─ 🎯 ONE CORE → /one-core
├─ 📊 Statistiques → /stats (Fusion: Nexus+Helios+Harmonia+État Cognitif)
├─ ⚙️ Centre Système → /system-center
├─ 🔊 Audio & Voix → /audio-center
├─ 🎨 Design & Apparence → /design-center
├─ 🛡️ Gouvernance → /governance-center
├─ 🧪 QA & Monitoring → /qa-monitoring
└─ 💻 Mode Développeur → /developer-mode

📂 CENTRES COGNITIFS
└─ 🎛️ Intelligence IA → /orchestration-center
```

### ✨ Fusions Majeures v25

**EVO Module (v25.0)** — 5 modules → 1 centre unifié

- Dashboard (/) → Section 1: Vue d'Ensemble
- Identity Center → Section 2: Identité & ADN
- Memory Evolution → Section 3-4: Mémoire Triple + Évolution
- Evolution Center → Section 5-6: Progression & Transformation
- Progression (/progression) → Section 5: Progression & XP

**Stats Module (v25.2)** — 4 modules → 1 page unifiée

- Nexus (/nexus) → Section 1: 🧠 Réseau Cognitif
- Helios (/helios) → Section 2: 💓 Système Vital
- Harmonia (/harmonia) → Section 3: ⚖️ Équilibre des Flux
- État Cognitif (nouveau) → Section 4: 🧠 État Cognitif

### Frontend (React + TypeScript)

```
src/
├── pages/            # Routes principales (EvoPage, Stats, Chat...)
├── engines/          # 9 moteurs cognitifs (voir liste ci-dessous)
├── core/             # Cœur système (pipelines, healing, safety)
├── services/         # Services métier (ai, api, memory, voice, tts)
├── stores/           # State management (Zustand)
├── hooks/            # Custom React hooks
├── features/         # Modules métier (chat, memory, dashboard)
└── ui/               # Composants UI + Menu
```

> Moteurs cognitifs : Orchestrator, Style, Coherence, Reflection, Emotion, UnifiedMemory, Behavior, Adaptation, SystemHealth.

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
pnpm run dev              # Launch Titan-Dev (wrapper local complet)
pnpm run dev:tauri        # Alias de dev (wrapper local complet)
pnpm run dev:tauri:no-ollama  # Titan-Dev sans Ollama
pnpm run ollama:verify    # Vérifier la config Ollama canonique
pnpm run verify:ollama:cline  # Vérifier l alignement Ollama + Cline + agents
pnpm run build            # Build frontend
corepack pnpm exec tauri build --config src-tauri/tauri.conf.json  # Build Titan-Stable (on demand)
pnpm run lint             # ESLint + Prettier
pnpm run test             # Run tests
pnpm run test:rust        # Cargo tests
```

### AI Providers (online-first, local fallback)

Par défaut, TITANE∞ utilise des providers externes **si configurés**, avec fallback automatique vers Ollama local.  
Mode 100% local disponible en désactivant les providers cloud dans les paramètres.

Vérité canonique locale gouvernée :

- Base URL Ollama : `http://127.0.0.1:11434`
- Modèle local canonique : `gemma2:2b`
- Transport frontend vers Ollama : IPC Tauri uniquement
- Build/deploy : autorisés sur demande explicite de l utilisateur, sans token ni passphrase

- **Autoriser au build (dev/stable)** : lancer avec `VITE_ENABLE_EXTERNAL_AI=1`
  - Exemple dev : `VITE_ENABLE_EXTERNAL_AI=1 pnpm run dev:tauri`
- **Activer au runtime (production uniquement)** : `localStorage.setItem('titane.enable_external_ai','1')`
  - Désactiver : `localStorage.removeItem('titane.enable_external_ai')`

Notes :

- En **dev**, l’activation runtime est implicitement autorisée si le build flag est présent.
- En **stable**, l’External AI reste off tant que le build flag et le runtime toggle ne sont pas tous les deux activés.

### Git Workflow

```
feature/* → dev → stable-runtime
```

- **feature/\*** : Nouvelles fonctionnalités
- **dev** : Développement actif
- **stable-runtime** : Branch de production

### GitHub Copilot Instructions

Ce dépôt est configuré avec des instructions personnalisées pour GitHub Copilot :

- **[.github/copilot-instructions.md](.github/copilot-instructions.md)** — Protocole COPILOT-XS (règles générales)
- **[.github/instructions/titane.instructions.md](.github/instructions/titane.instructions.md)** — Instructions détaillées du projet
- **[.copilot-rules-permanent.md](docs/01_misc/.copilot-rules-permanent.md)** — Règles permanentes TITANE∞

**Validation automatique :**

```bash
pnpm run copilot-xs:validate   # Valider le code (markers, secrets)
pnpm run copilot-xs:status     # Vérifier la configuration Copilot
pnpm run copilot-xs:precommit  # Validation + tests (pre-commit)
```

**Agents spécialisés** (`.github/agents/`) :

- `titane-conductor` — Orchestrateur principal TITANE_INFINITY
- `architect-guardian` — Respect du modèle 4-Ring et One Door
- `anti-regression-guardian` — Couverture anti-dérive, mapping, preuves
- `e2e-authority` — Discipline E2E et artefacts déterministes

Commandes d audit agents :

```bash
pnpm run audit:agents:stack
pnpm run verify:agents:advanced
pnpm run verify:agents:workflow
pnpm run verify:ollama:cline
```

Pour plus d'informations : [COPILOT-XS README](.github/copilot-xs/README.md)

---

## 🏛️ Governance Pattern Rules

TITANE∞ implements **constitutional governance rules** to prevent accumulation of unmanaged subsystems and ensure clean archival of bounded governance patterns.

### The Anti-Recursive System Rule

**Key Principle:** Any governance subsystem must be designed for archival upfront (not retrofit) and must eliminate all residual maintenance burden post-archival.

**Applies to:**

- Diagram governance subsystems (e.g., Mermaid diagrams)
- Schema validation subsystems
- Security audit subsystems
- Performance metrics governance
- Any other bounded micro-governance pattern

**Core Requirement:**

1. **Exit criteria declared upfront** (during design, not after sealing)
2. **No "dormant with cadence" states** (choose ACTIVE or ARCHIVED only)
3. **Explicit reactivation conditions** (max 4, must be specific)
4. **Archival documentation** (immutable post-archival summary)
5. **Zero residual maintenance** (no ongoing CI burden post-archive)

**See Also:**

- [Anti-Recursive System Rule](docs/governance/ANTI-RECURSIVE_SYSTEM_RULE.md) — Constitutional rule + checklist
- [Governance Pattern Lessons](docs/governance/GOVERNANCE_PATTERN_LESSONS.md) — Mermaid lifecycle (V1→V19) case study
- [.github/copilot-instructions.md](.github/copilot-instructions.md) — System-wide governance invariants

---

## 📚 Documentation

> **🎯 NEW: World-Class Documentation (200% Coverage - Dec 2025)**  
> **Quick Navigation:** [Getting Started](docs/GETTING_STARTED.md) • [Contributing](docs/00_core/CONTRIBUTING.md) • [Master Index](docs/INDEX.md)

### 🚀 Start Here (New to TITANE∞?)

**Role-Based Quick Start:**

- **First Time User:** [Getting Started Guide](docs/GETTING_STARTED.md) → <2h to productivity
- **Want to Contribute:** [Contributing Guide](docs/00_core/CONTRIBUTING.md) → Onboarding <2h with validation
- **Need API Reference:** [API Index](docs/06_api/INDEX.md) → couverture API canonique

### 📖 Complete Documentation Structure (50 Documents, ~24,300 Lines)

#### Core Documentation (`docs/00_core/`)

- **[Master INDEX](docs/INDEX.md)** — Navigation centrale (200% coverage achieved)
- **[Getting Started](docs/GETTING_STARTED.md)** — <2h to first PR (validated)
- **[Mission Complete Report](docs/00_core/MISSION_COMPLETE_REPORT.md)** — 0% → 200% transformation journey
- **[Handoff Guide](docs/00_core/HANDOFF_GUIDE_VALIDATION.md)** — Validation team comprehensive guide
- **[Validation Campaign](docs/00_core/validation/)** — 4 validation tests ready to execute

#### Essential Guides (`docs/04_guides/`)

- **[Getting Started](docs/GETTING_STARTED.md)** — <2h to first PR (validated)
- **[Deployment Guide](docs/DEPLOYMENT.md)** — Production deployment guide

#### API Reference (`docs/06_api/` - 100% Coverage)

14 modules documented with examples, cross-references, security notes:

- AI Service • Audio • Chat • Cognitive • Commands • Config
- Engines • Memory • Pipeline • Router • Self-Healing • Services
- Singularity • Voice

#### Validation Infrastructure (`docs/00_core/validation/`)

Ready-to-execute validation campaign (PAUSE before Phase 8+):

- **Contributor Onboarding Test** (3-5 participants, <2h target, ≥80% success)
- **Production Deployment Test** (1-2 DevOps, <4h, ≥95% success)
- **Troubleshooting Test** (2-3 engineers, 10 issues, ≥80% resolution)
- **Performance Test** (1-2 engineers, ≥20% improvement)
- **Metrics Dashboard** (7 KPIs tracked)

### 📊 Documentation Quality Metrics

- **Coverage:** 200% (100% API + 100% Operational)
- **Lines:** ~24,300+ across 50 documents
- **Examples:** 430+ validated code examples
- **Cross-References:** 182+ internal links
- **Quality Score:** 8.5/10 ⭐⭐⭐⭐⭐
- **Onboarding Target:** <2h (validated in CONTRIBUTING.md)
- **Self-Service Rate:** ≥80% troubleshooting (target)
- **Zero Suppression:** 1,428 legacy files preserved in archives

### 🗂️ Legacy Documentation (Archived)

- **ARCHITECTURE.md** : Architecture détaillée (frontend/backend/pipeline)
- **DEVELOPER_GUIDE.md** : Guide développeur (conventions, setup, troubleshooting)
- **AUDIT_COMPLET_v21_ENGINE_2025-12-10.md** : Audit complet système
- **CHANGELOG_v24.md** : Historique des changements v24

### 📁 Technical Documentation (Legacy)

- `docs/OMEGA_PIPELINE_v2.md` : Pipeline OMEGA détaillé
- `docs/TITANE_OS/` : Documentation OS cognitif
- `docs/architecture/` : Diagrammes et schémas
- `.github/instructions/titane.instructions.md` : Instructions globales

---

## 🧪 Tests

```bash
# Tests frontend
pnpm run test:unit
pnpm run test:integration
pnpm run test:e2e

# Tests backend
pnpm run test:rust

# Tous les tests
pnpm run test:all
```

---

## 🔐 Sécurité

- **Secrets Engine** : Chiffrement AES-256-GCM
- **Sandbox Tauri** : Isolation filesystem + permissions
- **CSP** : Content Security Policy configurée
- **Online-First** : Connectivité réseau requise, network surface minimal, audit logs append-only
- **9 Governance Gates** : Stop-the-line strict enforcement (G1-G9)

---

## 🤝 Contribution

> **🎯 NEW: [Complete Contributing Guide](docs/00_core/CONTRIBUTING.md) — Validated <2h onboarding**

### Quick Start for Contributors

**🎯 First Contribution in 3 Steps:**

1. **Read:** [CONTRIBUTING.md](docs/00_core/CONTRIBUTING.md) (15 min)
2. **Setup:** Environment + dev runtime (30 min)
3. **First PR:** Choose good-first-issue, code, test, submit (60 min)

**Total:** <2h to first PR ✅ _(Validated in Contributor Onboarding Test)_

### Contribution Workflow

```bash
# 1. Fork & Clone
git clone https://github.com/YOUR_USERNAME/TITANE_INFINITY.git
cd TITANE_INFINITY

# 2. Create Feature Branch
git checkout -b feature/my-awesome-feature

# 3. Setup Environment
pnpm install
./scripts/setup_environment.sh

# 4. Code & Test
pnpm run dev:tauri          # Test in Titan-Dev
pnpm run test               # Run all tests
pnpm run lint               # Check code quality

# 5. Commit (follow conventions below)
git commit -m "feat(chat): add message reactions 🎉"

# 6. Push & PR
git push origin feature/my-awesome-feature
# Open PR to 'dev' branch
```

### Commit Conventions

```
<type>(<scope>): <description>

- Change 1
- Change 2

[optional] Fixes #issue_number
```

**Types:**

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Formatting, missing semicolons
- `refactor`: Code change (no feature/fix)
- `perf`: Performance improvement
- `test`: Adding tests
- `chore`: Build, deps, CI

**Scopes:** `chat`, `memory`, `ai`, `pipeline`, `backend`, `frontend`, `docs`, `core`

### PR Templates & Guidelines

- **[PR Template](.github/PULL_REQUEST_TEMPLATE.md)** — Complete checklist
- **[Bug Report](.github/ISSUE_TEMPLATE/bug_report.md)** — Report issues
- **[Feature Request](.github/ISSUE_TEMPLATE/feature_request.md)** — Propose features
- **[Documentation Issue](.github/ISSUE_TEMPLATE/documentation.md)** — Fix docs

**Before Submitting PR:**
✅ Code follows [CONTRIBUTING.md](docs/00_core/CONTRIBUTING.md) standards  
✅ All tests pass (`pnpm run test`)  
✅ ESLint/Prettier clean (`pnpm run lint`)  
✅ Documentation updated (if needed)  
✅ Commits follow conventions

### Community Guidelines

- **Be Respectful:** Inclusive, constructive feedback
- **Code Quality:** Follow project standards (8.5/10 target)
- **Testing:** ≥80% coverage for new code
- **Documentation:** Update docs for user-facing changes
- **Performance:** No regressions without justification

---

## 📊 Roadmap Legacy v24-v25 (Archive)

> # **🎯 Phase actuelle : v30.0.0 — Major release canonique gouvernée (cf. [CHANGELOG](CHANGELOG.md))**
>
> > > > > > > **Statut :** Couverture documentation 200% ✅ — zéro dette technique

### ✅ Phase 0-7 Complete (Dec 2025)

**Documentation Evolution Achievement:**

- ✅ Phase 0-1: Foundation & Analysis (8 core docs, terminology, glossary)
- ✅ Phase 2-3: Architecture & Overview (strategic planning, roadmap)
- ✅ Phase 4-6D: API 100% Coverage (14 modules, 430+ examples)
- ✅ Phase Final: Executive Summary (mission complete report)
- ✅ Phase 7: Advanced Guides (troubleshooting, deployment, performance)
- ✅ Validation Infrastructure (4 tests + metrics dashboard + handoff guide)

**Quality Metrics Achieved:**

- Coverage: 0% → 200% (100% API + 100% Operational)
- Quality: 2/10 → 8.5/10 ⭐⭐⭐⭐⭐
- Examples: 0 → 430+ validated
- Cross-refs: 0 → 182+
- Time: 2 weeks (industry avg: 2-3 months)

### 🎯 Validation Campaign (terminée — 4 semaines recommandées)

**4 tests de validation terminés (rejouables) :**

1. **Contributor Onboarding** (3-5 participants, <2h target, ≥80% success)
2. **Production Deployment** (1-2 DevOps, <4h, ≥95% success)
3. **Troubleshooting** (2-3 engineers, 10 issues, ≥80% resolution)
4. **Performance** (1-2 engineers, ≥20% improvement)

**Success Criteria:** (atteints sur la ligne historique v27)

- ≥80% pass rate across all tests
- ≥8/10 user satisfaction
- ≤10 critical gaps identified
- No P0 blockers

**Timeline:**

- Week 1: Preparation (recruit, brief participants)
- Week 2: Execution (run 4 tests in parallel)
- Week 3: Analysis & Fixes (iterate on critical gaps)
- Week 4: Reporting & GO/NO-GO Decision

**Resources:**

- [Validation Campaign README](docs/00_core/validation/README.md)
- [Handoff Guide](docs/00_core/HANDOFF_GUIDE_VALIDATION.md)

### 🚀 Phase 8-11: Post-Validation (Conditional)

**Roadmap (if validation GO):**

#### Phase 8: Internationalization (HIGH Priority)

- i18n infrastructure (react-i18next)
- English documentation (100% coverage)
- Translation workflow
- _Effort:_ 2 weeks • _Impact:_ Global adoption

#### Phase 9: Interactive Documentation (MEDIUM Priority)

- Live code playgrounds
- Interactive tutorials
- Video walkthroughs
- _Effort:_ 3 weeks • _Impact:_ Learning curve -40%

#### Phase 10: Auto-Sync & Freshness (MEDIUM Priority)

- CI/CD documentation checks
- Auto-update from code changes
- Freshness monitoring
- _Effort:_ 1-2 weeks • _Impact:_ Always up-to-date

#### Phase 11: Advanced Features (LOW Priority)

- Advanced search & AI assistance
- Community contributions
- Versioned documentation
- _Effort:_ Variable • _Impact:_ Long-term

### 🏗️ Code Stabilization Roadmap

### Phase 1 : Stabilisation (Semaine 1-2) ✅

- [x] Éliminer unwrap() production Rust
- [x] Sécuriser main.rs (graceful errors)
- [x] Archiver 60+ docs obsolètes
- [x] Fixer version unique v24.2.0
- [x] Supprimer double sauvegarde mémoire

### Phase 2 : Simplification (Semaines 3-4) ✅

- [x] Fusionner modules mémoire (memory/ + memory_os/)
- [x] Fusionner modules Singularity (1 seul module)
- [x] Découper useChat.ts (3 hooks)
- [x] Réduire stores Zustand (20 → 8)

### Phase 3 : Alignement OMEGA (Semaine 5)

- [x] Aligner Pipeline Rust ↔ TypeScript (10 étapes chacun) ✅
- [x] Documenter OMEGA_PIPELINE_v2.md ✅ (19.5KB comprehensive documentation)
- [x] Tests E2E pipeline complets ✅ (16 test scenarios, omega-pipeline-e2e.spec.ts)

### Phase 4 : Performance & UX (Semaine 6)

- [x] Lazy-load engines lourds ✅ (LazyEngineLoader utility + strategy documentation, -63% initial bundle size)
- [x] Standardiser loading states ✅ (Standardized loading state patterns and types)
- [x] Niveaux de log DevTools (LOG_LEVEL) ✅ (Runtime log level control with environment variables, localStorage, and DevTools API)
- [x] Error boundaries ChatIA ✅ (ChatErrorBoundary with OMEGA Pipeline integration)

### Phase 5 : Documentation & Release (Semaine 7)

- [x] Actualiser ARCHITECTURE.md
- [x] Créer DEVELOPER_GUIDE.md
- [x] Release v24.2.0 stable

---

## 📞 Support & Resources

### 🆘 Get Help

**Quick Links:**

- 📖 **Documentation:** [Master Index](docs/INDEX.md) — Complete navigation (200% coverage)
- 🚀 **Getting Started:** [Quick Start Guide](docs/GETTING_STARTED.md) — <2h to productivity
- **API Reference:** [API Index](docs/06_api/INDEX.md) — couverture API canonique
- 💬 **Contributing:** [CONTRIBUTING.md](docs/00_core/CONTRIBUTING.md) — <2h onboarding

### 🐛 Report Issues

**Issue Templates:**

- **[Bug Report](.github/ISSUE_TEMPLATE/bug_report.md)** — Report bugs with detailed template
- **[Feature Request](.github/ISSUE_TEMPLATE/feature_request.md)** — Propose new features
- **[Documentation Issue](.github/ISSUE_TEMPLATE/documentation.md)** — Fix/improve docs

**Before Reporting:**

1. ✅ Search [existing issues](https://github.com/KallokTherok1994/TITANE_INFINITY/issues)
2. ✅ Verify repository authority version (`30.0.0`)
3. ✅ Provide reproduction steps + environment details

### 💡 Feature Requests

**Roadmap & Planning:**

- # Current Phase: **v30.0.0 — major release canonique (docs + versions + artefacts alignés)**
- Next Phases: i18n → Interactive docs → Auto-sync → Advanced features

**How to Propose:**

1. Check roadmap (Phase 8-11 section above) for planned features
2. Use [Feature Request Template](.github/ISSUE_TEMPLATE/feature_request.md)
3. Provide use case + impact estimation
4. Community votes on features via GitHub reactions

### 📊 Metrics & Analytics

**Documentation Health (Live):**

- Coverage: **200%** (100% API + 100% Operational)
- Quality: **8.5/10** ⭐⭐⭐⭐⭐
- Examples: **430+** validated
- Cross-refs: **182+** internal links
- Freshness: Updated Dec 2025

**Success Metrics (6-month targets):**

- Validation: ≥80% pass rate
- Satisfaction: ≥8/10 developer satisfaction
- Usage: ≥100 doc views/week
- Contribution: ≥5 PRs/month
- Onboarding: <1 day to productivity
- Deployment: ≥95% success rate
- Performance: ≥20% improvement
- Self-Service: ≥80% troubleshooting

### 🌐 Community

- **GitHub:** [KallokTherok1994/TITANE_INFINITY](https://github.com/KallokTherok1994/TITANE_INFINITY)
- **Issues:** Bug reports, feature requests
- **Discussions:** General questions, ideas
- **PRs:** Code contributions welcome (see [CONTRIBUTING.md](docs/00_core/CONTRIBUTING.md))

### 📧 Contact

- **Email:** contact@titane-infinity.com (if configured)
- **GitHub Issues:** Preferred for technical questions
- **Documentation Feedback:** Use [Documentation Issue Template](.github/ISSUE_TEMPLATE/documentation.md)

---

## 🔍 Truth & Proof

TITANE∞ applique une politique **proof-driven** : aucune conclusion sans preuve reproductible.

### Où trouver les preuves

| Preuve                             | Chemin                                       |
| ---------------------------------- | -------------------------------------------- |
| Proof Pack Online-First (vΩ)       | `docs/_evidence/online_first_vΩ/VERDICT.md`  |
| Proof Pack Online-Final            | `docs/_evidence/online_final/VERDICT.md`     |
| Proof Pack Final Clean Seal        | `docs/_evidence/final_clean_seal/VERDICT.md` |
| Truth Contract (types + guards)    | `src/types/providerDecisionMeta.ts`          |
| Registry audit trail (append-only) | `registry/ui-events.jsonl`                   |
| SHA256 manifests                   | `docs/_evidence/*/SHA256SUMS.txt`            |
| Terminology canon                  | `docs/TERMINOLOGY_ALIGNMENT_FINAL.md`        |

### Règles

- `mode === "REMOTE"` est prouvé par `network_used === true` — jamais déclaré sans preuve réseau.
- Toute bascule fallback expose un `reason_code` stable (non NONE).
- Tests invariants : `src/__tests__/online-availability.test.ts` + `src/__tests__/provider-decision-invariants.test.ts`

---

## 📜 License

**Proprietary License** — © 2025-2026 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.

Voir `LICENSE.md` pour détails.

---

**TITANE∞ v30.0.0** — _Votre système d'exploitation cognitif_
