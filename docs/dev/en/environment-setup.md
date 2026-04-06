# TITANE∞ — Environment Setup (EN)

**Version:** 28.0.0  
**Status:** PROVEN  
**Date:** 2026-03-17

---

## System prerequisites

| Tool | Required version | Install | Source |
|---|---|---|---|
| Node.js | ≥ 20.x | https://nodejs.org/ or nvm | `.nvmrc` present |
| pnpm | ≥ 9.x | `npm install -g pnpm` | `.npmrc` enforces pnpm |
| Rust | 2021 edition (stable) | https://rustup.rs/ | `src-tauri/Cargo.toml` |
| Cargo | latest stable | Included with Rust | — |
| Tauri CLI v2 | v2.x | `cargo install tauri-cli` | `src-tauri/` |

**Optional tools:**
- Ollama (local AI models): https://ollama.com/
- Git

### Linux system dependencies (Ubuntu/Debian)

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

> Source: `.github/workflows/rust.yml` (CI workflow — PROVEN)

---

## Installation

```bash
# 1. Clone the repository
git clone https://github.com/KallokTherok1994/TITANE_INFINITY.git
cd TITANE_INFINITY

# 2. Install frontend dependencies
# NOTE: pnpm is mandatory — npm and yarn are blocked
pnpm install

# 3. Verify installation
pnpm run check
```

---

## Environment variables

| Variable | Usage | File | Required |
|---|---|---|---|
| `OPENAI_API_KEY` | OpenAI API key | `.env` | NO (only if using OpenAI) |
| `ANTHROPIC_API_KEY` | Claude API key | `.env` | NO |
| `GOOGLE_API_KEY` | Gemini API key | `.env` | NO |
| `TITANE_E2E` | Enable E2E mode | Runtime env | NO (CI only) |
| `FULL_E2E_ENABLED` | Enable full E2E | Runtime env | NO (disabled by default) |

```bash
# Copy example file
cp .env.example .env
# Edit .env with your keys (never commit .env!)
```

---

## Launch dev mode

```bash
# Full Tauri mode (frontend + Rust backend)
pnpm run dev

# Dev mode with monitor script
pnpm run dev:tauri

# Dev mode without Ollama
pnpm run dev:tauri:no-ollama
```

---

## Initial verification

```bash
pnpm run check                              # TypeScript
pnpm run lint                               # ESLint
pnpm run format:check                       # Prettier
pnpm run test                               # Vitest unit tests
bash scripts/verify_instructions.sh         # Instruction gate (PASS=20 expected)
bash scripts/autoheal/detect_recurrence.sh  # AutoHeal gate
```

---

*French documentation: [docs/dev/fr/setup-environnement.md](../fr/setup-environnement.md)*
