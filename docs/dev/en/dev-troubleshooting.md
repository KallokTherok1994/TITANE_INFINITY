# TITANE∞ — Dev Troubleshooting (EN)

**Version:** 28.0.0  
**Status:** PARTIAL  
**Date:** 2026-03-17

---

## Installation issues

### pnpm blocked by preinstall check

```bash
# Error: "This project requires pnpm"
# Solution: use pnpm exclusively
npm install -g pnpm
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
# Create a dist/ placeholder (required for Tauri build)
mkdir -p dist && echo "placeholder" > dist/index.html
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

## Stale docs detected

If you encounter a doc with a very old version (e.g., 19.4.3, 24.2.0):
- That doc is LEGACY
- Consult `docs/user/en/` or `docs/dev/en/` for canonical versions
- Consult `docs/reference/en/docs-truth-matrix.md` for truth status

---

*French documentation: [docs/dev/fr/depannage-dev.md](../fr/depannage-dev.md)*
