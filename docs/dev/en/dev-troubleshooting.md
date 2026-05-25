# TITANE∞ — Dev Troubleshooting (EN)

**Version:** 35.2.0  
**Status:** CURRENT  
**Date:** 2026-05-25

---

## Installation issues

### pnpm blocked by preinstall check

```bash
# Error: "This project requires pnpm"
# Solution: use pnpm exclusively
# Use corepack instead: corepack enable && corepack prepare pnpm@10.30.2 --activate
pnpm install
```

### TypeScript dependency errors

```bash
pnpm run clean:all
pnpm install
pnpm run check
```

---

## Environment issues

### Wrong Node.js version

```bash
# Use recommended version via nvm
nvm install $(cat .nvmrc)
nvm use $(cat .nvmrc)
```

### Rust missing or wrong version

```bash
# Install/update Rust
rustup update stable
rustup default stable
```

### Tauri CLI missing

```bash
cargo install tauri-cli
```

---

## Tauri issues

### Tauri compilation error (Linux system dependencies)

```bash
sudo apt-get install -y \
  libwebkit2gtk-4.1-dev \
  libgtk-3-dev \
  libayatana-appindicator3-dev \
  librsvg2-dev \
  libssl-dev \
  libasound2-dev
```

### "dist/ not found" error during cargo build

```bash
# Linux/CI (bash)
mkdir -p dist && echo "placeholder" > dist/index.html
```
```powershell
# Windows (PowerShell)
New-Item -ItemType Directory -Force dist | Out-Null
"placeholder" | Out-File dist/index.html -Encoding ascii
```

### tauri.conf.json not found

Verify `src-tauri/tauri.conf.json` exists and is valid:
```bash
pnpm run verify:tauri-configs
```

---

## Test issues

### Tests fail in CI but not locally

```bash
# Check CI environment variables
# Check code format (Prettier may fail in CI)
pnpm run format:check

# Check TypeScript strict
pnpm run check
```

### Flaky E2E tests

- Desktop E2E tests (WDIO) may fail if the Tauri environment crashes
- See autoheal entries for known patterns: `scripts/autoheal/autoheal_rules.jsonl`

---

## Gate issues

### verify_instructions.sh fails

```bash
bash scripts/verify_instructions.sh
# Read FAIL lines to identify which rule is failing
# Consult scripts/verify_instructions.sh to understand the rule
```

### detect_recurrence.sh fails

```bash
bash scripts/autoheal/detect_recurrence.sh
# If a recurrence pattern is detected, create a corrective autoheal entry
```

---

## HTTP network server issues

### launch-titane.ps1 -Mode server — secret too short

```powershell
# Error: [WARN] TITANE_REMOTE_SECRET non defini ou trop court
# Solution: define a persistent secret in .env or pass inline
$env:TITANE_REMOTE_SECRET = "minimum_32_character_secret_here"
.\scripts\launch\launch-titane.ps1 -Mode server
```

### Firewall rule creation fails (admin required)

```powershell
# Run PowerShell as administrator, then:
New-NetFirewallRule -DisplayName "TITANE Remote Gateway port 7420" `
  -Direction Inbound -Protocol TCP -LocalPort 7420 `
  -Action Allow -Profile Private,Domain
```

### Remote Gateway not responding on LAN

```powershell
# 1. Verify TITANE launched with TITANE_REMOTE_ENABLED=1
# 2. Check Tauri logs for: "🌐 [RemoteGateway] Starting on http://0.0.0.0:7420"
# 3. Test locally first:
curl http://localhost:7420/health
# 4. Verify firewall rule exists:
Get-NetFirewallRule -DisplayName "TITANE Remote Gateway port 7420"
# 5. Check Windows Defender / antivirus is not blocking port 7420
```

### launch-titane.ps1 modes reference

```powershell
.\scripts\launch\launch-titane.ps1 -Mode dev            # Tauri + Vite HMR
.\scripts\launch\launch-titane.ps1 -Mode server         # dev + HTTP gateway port 7420
.\scripts\launch\launch-titane.ps1 -Mode verify-windows # prebuild checks
.\scripts\launch\launch-titane.ps1 -Mode build-msi      # MSI + NSIS build
.\scripts\launch\launch-titane.ps1 -Mode release-msi    # bump + build + verify
.\scripts\launch\launch-titane.ps1 -Mode check          # TS + lint + tests
.\scripts\launch\launch-titane.ps1 -Mode clean          # remove artifacts
```

---

## Stale docs detected

If you encounter a doc with a very old version (e.g., 19.4.3, 24.2.0):
- That doc is LEGACY
- Consult `docs/user/en/` or `docs/dev/en/` for canonical versions
- Consult `docs/reference/en/docs-truth-matrix.md` for truth status

---

*French documentation: [docs/dev/fr/depannage-dev.md](../fr/depannage-dev.md)*
