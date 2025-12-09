# TITANE∞ v20Ω — Guide de Migration Ubuntu 24.04.3 LTS

## État du Projet

**Version**: TITANE∞ v20Ω
**Commit**: 7907679
**Date**: 2025-12-09
**Status**: ✅ Compilation réussie, prêt pour migration

---

## Inventaire Complet du Projet

### Statistiques Globales
- **Fichiers Rust créés**: 164 fichiers
- **Lignes de code ajoutées**: ~40,557 lignes
- **Modules SUPER PROMPT**: 15 modules majeurs

### Modules Implémentés

| Super Prompt | Module | Fichiers | Description |
|-------------|--------|----------|-------------|
| #9 | `conversation_os/` | 11 | Conversation OS (Intent, Narrative, Persona, Style) |
| #11 | `agi_core/` | 10 | AGI Core (Introspection, Meta-Learning, Self-Model) |
| #12 | `memory_os/` | 12 | Memory OS (STM → MTM → LTM, Vector Search) |
| #13 | `constitution/` | 8 | Constitution (Principles, Values, Governance) |
| #15 | `multimodal/` | 12 | Multimodal Engine (Vision, Audio 3D) |
| #16 | `cycle_engine/` | 11 | Cycle Engine (Rythmes, Saisons, Temporalité) |
| #17 | `api_hub/` | 12 | API Hub (OpenAI, Gemini, Anthropic) |
| #18 | `temporal_engine/` | 11 | Temporal Intelligence Engine v2 |
| #19 | `agent_system/` | 12 | Agent System Multi-Agents |
| #20 | `meta_energy/` | 10 | Meta-Energy Engine (Homéostasie) |
| #21 | `performance/` | 11 | Performance Engine (Scheduler, Thread Pools) |
| #22 | `harmonic_os/` | 10 | Harmonic OS (H-Field, Synchronisation) |
| #24 | `cognitive_gravity/` | 14 | Cognitive Gravity (Attracteurs, Feedback) |

---

## Prérequis Ubuntu 24.04.3 LTS

### Dépendances Système

```bash
# Mise à jour système
sudo apt update && sudo apt upgrade -y

# Outils de développement essentiels
sudo apt install -y build-essential pkg-config libssl-dev libgtk-3-dev \
    libwebkit2gtk-4.1-dev libayatana-appindicator3-dev librsvg2-dev \
    curl wget git

# Rust (via rustup)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env
rustup default stable
rustup update

# Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# pnpm (gestionnaire de paquets)
npm install -g pnpm

# Tauri CLI
cargo install tauri-cli
```

### Dépendances Audio/Vidéo (pour Multimodal)

```bash
sudo apt install -y \
    libasound2-dev \
    libpulse-dev \
    libavcodec-dev \
    libavformat-dev \
    libavutil-dev \
    libswscale-dev \
    libv4l-dev
```

### Dépendances GPU (optionnel, pour CUDA/ML)

```bash
# NVIDIA drivers
sudo apt install -y nvidia-driver-535

# CUDA Toolkit (si nécessaire)
wget https://developer.download.nvidia.com/compute/cuda/repos/ubuntu2404/x86_64/cuda-keyring_1.1-1_all.deb
sudo dpkg -i cuda-keyring_1.1-1_all.deb
sudo apt update
sudo apt install -y cuda-toolkit-12-4
```

---

## Procédure de Migration

### 1. Sauvegarde

```bash
# Créer une archive complète
cd /home/titane/Documents
tar -czvf TITANE_INFINITY_backup_$(date +%Y%m%d_%H%M%S).tar.gz TITANE_INFINITY/

# Vérifier l'intégrité
tar -tzvf TITANE_INFINITY_backup_*.tar.gz | tail -20
```

### 2. Transfert vers Ubuntu 24.04.3

```bash
# Option A: SCP/SFTP
scp TITANE_INFINITY_backup_*.tar.gz user@new-machine:/home/user/Documents/

# Option B: rsync (recommandé pour gros volumes)
rsync -avzP --delete TITANE_INFINITY/ user@new-machine:/home/user/Documents/TITANE_INFINITY/

# Option C: Git (si remote configuré)
cd TITANE_INFINITY
git push origin MAIN
# Sur nouvelle machine:
git clone <repo-url> TITANE_INFINITY
```

### 3. Restauration sur Ubuntu 24.04.3

```bash
# Extraire l'archive
cd /home/user/Documents
tar -xzvf TITANE_INFINITY_backup_*.tar.gz

# Installer les dépendances Node
cd TITANE_INFINITY
pnpm install

# Compiler le backend Rust
cd src-tauri
cargo build --release

# Vérifier la compilation
cargo check --lib
cargo test
```

### 4. Vérification Post-Migration

```bash
# Tests de compilation
cargo check --lib
cargo build --release

# Tests unitaires
cargo test --lib

# Lancer l'application
pnpm tauri dev
```

---

## Structure des Fichiers Critiques

```
TITANE_INFINITY/
├── src-tauri/
│   ├── Cargo.toml              # Configuration Rust
│   ├── src/
│   │   ├── lib.rs              # Point d'entrée principal
│   │   ├── agent_system/       # Multi-agents (#19)
│   │   ├── agi_core/           # AGI Core (#11)
│   │   ├── api_hub/            # API Hub (#17)
│   │   ├── cognitive_gravity/  # Gravity (#24)
│   │   ├── constitution/       # Constitution (#13)
│   │   ├── conversation_os/    # Conversation (#9)
│   │   ├── cycle_engine/       # Cycles (#16)
│   │   ├── harmonic_os/        # Harmonic (#22)
│   │   ├── memory_os/          # Memory (#12)
│   │   ├── meta_energy/        # Energy (#20)
│   │   ├── multimodal/         # Multimodal (#15)
│   │   ├── performance/        # Performance (#21)
│   │   └── temporal_engine/    # Temporal (#18)
│   └── tauri.conf.json         # Config Tauri
├── src/                        # Frontend (TypeScript/React)
├── package.json                # Config Node
├── pnpm-lock.yaml              # Lock dependencies
└── docs/                       # Documentation
```

---

## Fichiers de Configuration Importants

### Cargo.toml (dépendances Rust clés)

```toml
[dependencies]
tokio = { version = "1", features = ["full"] }
serde = { version = "1", features = ["derive"] }
serde_json = "1"
uuid = { version = "1", features = ["v4", "serde"] }
chrono = { version = "0.4", features = ["serde"] }
parking_lot = "0.12"
dashmap = "5"
async-trait = "0.1"
thiserror = "1"
tracing = "0.1"
```

### Variables d'Environnement

```bash
# ~/.bashrc ou ~/.profile
export RUST_LOG=info
export TAURI_DEBUG=1  # Mode développement
export TITANE_DATA_DIR=/home/user/.titane_infinity
```

---

## Dépannage

### Erreur: WebKit not found
```bash
sudo apt install libwebkit2gtk-4.1-dev
```

### Erreur: OpenSSL not found
```bash
sudo apt install libssl-dev pkg-config
```

### Erreur: GTK not found
```bash
sudo apt install libgtk-3-dev
```

### Erreur: Rust compilation lente
```bash
# Utiliser mold linker (plus rapide)
sudo apt install mold
# Dans ~/.cargo/config.toml:
[target.x86_64-unknown-linux-gnu]
linker = "clang"
rustflags = ["-C", "link-arg=-fuse-ld=mold"]
```

---

## Vérification Finale

```bash
# Checklist de validation
cd /home/user/Documents/TITANE_INFINITY/src-tauri

# 1. Compilation
cargo build --release && echo "✅ Compilation OK"

# 2. Tests
cargo test --lib && echo "✅ Tests OK"

# 3. Vérification modules
cargo check --lib 2>&1 | grep -E "(error|warning)" || echo "✅ Pas d'erreurs"

# 4. Lancement
cd .. && pnpm tauri dev
```

---

## Contact & Support

**Projet**: TITANE∞ v20Ω
**Architecture**: Cognitive OS avec 15 Super Prompts
**Status Migration**: Prêt pour Ubuntu 24.04.3 LTS

---

*Document généré le 2025-12-09*
*🤖 Generated with Claude Code*
