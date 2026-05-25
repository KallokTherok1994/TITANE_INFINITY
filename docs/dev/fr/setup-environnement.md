# TITANE∞ — Setup de l'Environnement (FR)

**Version :** 35.2.0  
**Statut :** CURRENT  
**Date :** 2026-05-25

> **DEV_HOST primaire : Windows 11.** Pour le guide complet : [`docs/windows/WINDOWS_PRIMARY_DEV_PROD_GUIDE.md`](../../windows/WINDOWS_PRIMARY_DEV_PROD_GUIDE.md)

---

## Prérequis système

| Outil | Version requise | Installation | Source |
|---|---|---|---|
| Node.js | ≥ 20.x | https://nodejs.org/ ou fnm/nvm | `.nvmrc` présent |
| pnpm | 10.30.2 | `corepack enable && corepack prepare pnpm@10.30.2 --activate` | `package.json` packageManager |
| Rust | Édition 2021 (stable) | https://rustup.rs/ | `src-tauri/Cargo.toml` |
| Cargo | Stable récent | Inclus avec Rust | — |
| Tauri CLI v2 | v2.x | `cargo install tauri-cli` | `src-tauri/` |

> **Ne jamais utiliser `npm install -g pnpm`.** Toujours passer par `corepack`.

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

### Prérequis système Windows 11 (DEV_HOST primaire)

| Composant | Requis | Notes |
|---|---|---|
| Microsoft C++ Build Tools 2022 | Obligatoire | Charge de travail C++ + Windows SDK + chaîne MSVC |
| Microsoft Edge WebView2 Runtime | Obligatoire | Inclus Windows 11 |
| Rust MSVC toolchain | Obligatoire | `x86_64-pc-windows-msvc` via `rustup` |
| WiX Toolset v3 | Pour MSI | `pnpm exec tauri build --bundles msi` |
| `icon.ico` multi-résolution | Obligatoire | Autorité icône Windows |

---

## Installation

```bash
# 1. Cloner le dépôt
git clone https://github.com/KallokTherok1994/TITANE_INFINITY.git
cd TITANE_INFINITY

# 2. Installer les dépendances frontend
# NOTE : corepack pnpm est obligatoire — npm et yarn sont bloqués
corepack pnpm install

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
| `TITANE_REMOTE_ENABLED` | Active le gateway HTTP réseau | Env runtime | NON (`1` pour activer) |
| `TITANE_REMOTE_PORT` | Port du gateway HTTP | Env runtime | NON (défaut : `7420`) |
| `TITANE_REMOTE_SECRET` | Secret partagé pour auth JWT | `.env` ou env | NON (auto-généré si absent) |
| `TITANE_REMOTE_ORIGIN` | Origine CORS autorisée | Env runtime | NON (défaut : `*`) |

```powershell
# Windows : copier le fichier d'exemple
Copy-Item .env.example .env
# Éditer .env avec vos clés (ne jamais commiter .env !)
```
```bash
# Linux/macOS
cp .env.example .env
```

---

## Lancer le mode développement

### Via le launcher PowerShell (recommandé sous Windows)

```powershell
# Mode dev standard (Tauri + Vite HMR)
.\scripts\launch\launch-titane.ps1
.\scripts\launch\launch-titane.ps1 -Mode dev

# Avec serveur HTTP réseau (Remote Gateway sur port 7420)
.\scripts\launch\launch-titane.ps1 -Mode server
# → génère un secret fort, affiche les URLs LAN, propose règle firewall, démarre TITANE_REMOTE_ENABLED=1

# Avec un secret persistant :
$env:TITANE_REMOTE_SECRET = "votre_secret_min_32_chars"; .\scripts\launch\launch-titane.ps1 -Mode server
```

### Via pnpm (multiplateforme)

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
