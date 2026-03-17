# TITANE∞ — Setup de l'Environnement (FR)

**Version :** 28.0.0  
**Statut :** PROVEN  
**Date :** 2026-03-17

---

## Prérequis système

| Outil | Version requise | Installation | Source |
|---|---|---|---|
| Node.js | ≥ 20.x | https://nodejs.org/ ou nvm | `.nvmrc` présent |
| pnpm | ≥ 9.x | `npm install -g pnpm` | `.npmrc` impose pnpm |
| Rust | Édition 2021 (stable) | https://rustup.rs/ | `src-tauri/Cargo.toml` |
| Cargo | Stable récent | Inclus avec Rust | — |
| Tauri CLI v2 | v2.x | `cargo install tauri-cli` | `src-tauri/` |

**Outils optionnels :**
- Ollama (modèles IA locaux) : https://ollama.com/
- Git (évidemment)

### Dépendances système Linux (Ubuntu/Debian)

```bash
sudo apt-get install -y \
  libwebkit2gtk-4.1-dev \
  libgtk-3-dev \
  libayatana-appindicator3-dev \
  librsvg2-dev \
  libssl-dev \
  libasound2-dev \
  build-essential
```

> Source : `.github/workflows/rust.yml` (CI workflow — PROVEN)

---

## Installation

```bash
# 1. Cloner le dépôt
git clone https://github.com/KallokTherok1994/TITANE_INFINITY.git
cd TITANE_INFINITY

# 2. Installer les dépendances frontend
# NOTE : pnpm est obligatoire — npm et yarn sont bloqués
pnpm install

# 3. Vérifier l'installation
pnpm run check
```

---

## Variables d'environnement

| Variable | Usage | Fichier | Obligatoire |
|---|---|---|---|
| `OPENAI_API_KEY` | Clé API OpenAI | `.env` | NON (sauf si utilisation OpenAI) |
| `ANTHROPIC_API_KEY` | Clé API Claude | `.env` | NON |
| `GOOGLE_API_KEY` | Clé API Gemini | `.env` | NON |
| `TITANE_E2E` | Active le mode E2E | Env runtime | NON (CI uniquement) |
| `FULL_E2E_ENABLED` | Active le full E2E | Env runtime | NON (désactivé par défaut) |

```bash
# Copier le fichier d'exemple
cp .env.example .env
# Éditer .env avec vos clés (ne jamais commiter .env !)
```

---

## Lancer le mode développement

```bash
# Mode Tauri complet (frontend + backend Rust)
pnpm run dev

# Mode dev avec monitoring
pnpm run dev:tauri

# Mode dev sans Ollama
pnpm run dev:tauri:no-ollama
```

---

## Vérifications initiales

```bash
# Vérification TypeScript
pnpm run check

# Linting
pnpm run lint

# Formatage
pnpm run format:check

# Tests unitaires
pnpm run test

# Gates d'instruction
bash scripts/verify_instructions.sh
bash scripts/autoheal/detect_recurrence.sh
```

---

## Notes sur les chemins et shells

- Le gestionnaire de paquets est strictement **pnpm** — `scripts/install/enforce-package-manager.cjs` bloque npm et yarn
- La version Node est définie dans `.nvmrc` — utiliser `nvm use` pour aligner
- Les scripts shell utilisent `#!/usr/bin/env bash` — bash requis (pas sh)

---

*Documentation en anglais : [docs/dev/en/environment-setup.md](../en/environment-setup.md)*
