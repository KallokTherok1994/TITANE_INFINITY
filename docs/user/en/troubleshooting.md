# TITANE∞ — Troubleshooting (EN)

**Version:** 28.0.0  
**Status:** PARTIAL  
**Date:** 2026-03-17

---

## Installation issues

### `dpkg -i` fails with missing dependencies

```bash
# Resolve missing dependencies
sudo apt-get install -f
```

### AppImage won't launch

```bash
# Check permissions
chmod +x Titan-Stable_27.0.5_amd64.AppImage

# Check FUSE dependencies
sudo apt-get install libfuse2

# Launch with verbose output
./Titan-Stable_27.0.5_amd64.AppImage --verbose 2>&1 | head -50
```

---

## Launch issues

### App won't start (from source)

```bash
# Check Node.js
node --version  # Must be ≥ 20.x

# Check pnpm
pnpm --version

# Check Rust
rustc --version

# Check Tauri CLI
tauri --version

# Clean and reinstall
pnpm run clean:all
pnpm install
pnpm run dev
```

### "pnpm not found" error

```bash
# Install pnpm
npm install -g pnpm
# or
curl -fsSL https://get.pnpm.io/install.sh | sh
```

### Rust compilation error

```bash
# Update Rust
rustup update stable

# Install system dependencies (Linux)
sudo apt-get install libwebkit2gtk-4.1-dev libgtk-3-dev \
  libayatana-appindicator3-dev librsvg2-dev libssl-dev libasound2-dev
```

---

## AI provider issues

### "No response" or timeout

1. Check your Internet connection
2. Verify the API key is correct in Settings
3. Test the provider directly (e.g., curl to OpenAI API)
4. Try a different provider

### Ollama not responding

```bash
# Check if Ollama is running
curl http://127.0.0.1:11434/api/tags

# If not running, start Ollama
ollama serve
# or
pnpm run ollama:start

# Check available models
ollama list
```

---

## Audio issues

### Microphone not working

1. Check microphone permissions in system settings
2. Verify the Tauri app has microphone access (Tauri permissions)
3. Restart the application after granting permissions

### TTS produces no sound

1. Check system volume
2. Verify the voice profile is configured in Settings
3. Check DevTools logs for TTS errors

---

## UI issues

### White screen / interface not loading

```bash
# Check console errors (built-in Tauri browser DevTools)
# In dev mode: F12 or Ctrl+Shift+I to open DevTools
```

### Messages not appearing

1. Check Internet connection
2. Verify the provider is reachable
3. Check logs in the DevTools center

---

## Gathering info for a bug report

Before submitting an issue, collect:

```bash
# System info
node --version
pnpm --version
rustc --version 2>/dev/null || echo "N/A"
uname -a

# Application logs
# DevTools → Logs (in TITANE∞ interface)
```

**Report an issue:** https://github.com/KallokTherok1994/TITANE_INFINITY/issues

---

*French documentation: [docs/user/fr/depannage.md](../fr/depannage.md)*
