# TITANE∞ — Environment Setup (EN)

**Version:** 35.2.0  
**Status:** CURRENT  
**Date:** 2026-05-25

> **Primary DEV_HOST: Windows 11.** For the full guide: [`docs/windows/WINDOWS_PRIMARY_DEV_PROD_GUIDE.md`](../../windows/WINDOWS_PRIMARY_DEV_PROD_GUIDE.md)

---

## System prerequisites

| Tool | Required version | Install | Source |
|---|---|---|---|
| Node.js | ≥ 20.x | https://nodejs.org/ or fnm/nvm | `.nvmrc` present |
| pnpm | 10.30.2 | `corepack enable && corepack prepare pnpm@10.30.2 --activate` | `package.json` packageManager |
| Rust | 2021 edition (stable) | https://rustup.rs/ | `src-tauri/Cargo.toml` |
| Cargo | latest stable | Included with Rust | — |
| Tauri CLI v2 | v2.x | `cargo install tauri-cli` | `src-tauri/` |

> **Never use `npm install -g pnpm`.** Always use `corepack`.

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

### Windows 11 system prerequisites (primary DEV_HOST)

| Component | Required | Notes |
|---|---|---|
| Microsoft C++ Build Tools 2022 | Mandatory | C++ workload + Windows SDK + MSVC toolchain |
| Microsoft Edge WebView2 Runtime | Mandatory | Included on Windows 11 |
| Rust MSVC toolchain | Mandatory | `x86_64-pc-windows-msvc` via `rustup` |
| WiX Toolset v3 | For MSI | `pnpm exec tauri build --bundles msi` |
| `icon.ico` multi-resolution | Mandatory | Windows icon authority |

---

## Installation

```bash
# 1. Clone the repository
git clone https://github.com/KallokTherok1994/TITANE_INFINITY.git
cd TITANE_INFINITY

# 2. Install frontend dependencies
# NOTE: corepack pnpm is mandatory — npm and yarn are blocked
corepack pnpm install

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
| `TITANE_REMOTE_ENABLED` | Activate HTTP network gateway | Runtime env | NO (`1` to enable) |
| `TITANE_REMOTE_PORT` | HTTP gateway port | Runtime env | NO (default: `7420`) |
| `TITANE_REMOTE_SECRET` | Shared secret for JWT auth | `.env` or env | NO (auto-generated if absent) |
| `TITANE_REMOTE_ORIGIN` | Allowed CORS origin | Runtime env | NO (default: `*`) |

```powershell
# Windows: copy example file
Copy-Item .env.example .env
# Edit .env with your keys (never commit .env!)
```
```bash
# Linux/macOS
cp .env.example .env
```

---

## Launch dev mode

### Via PowerShell launcher (recommended on Windows)

```powershell
# Standard dev mode (Tauri + Vite HMR)
.\scripts\launch\launch-titane.ps1
.\scripts\launch\launch-titane.ps1 -Mode dev

# With HTTP network server (Remote Gateway on port 7420)
.\scripts\launch\launch-titane.ps1 -Mode server
# → generates strong secret, displays LAN URLs, offers firewall rule, starts TITANE_REMOTE_ENABLED=1

# With a persistent secret:
$env:TITANE_REMOTE_SECRET = "your_secret_min_32_chars"; .\scripts\launch\launch-titane.ps1 -Mode server
```

### Via pnpm (cross-platform)

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
