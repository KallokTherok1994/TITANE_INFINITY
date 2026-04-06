#!/bin/bash
# Fix PROD v27.0.2: Ollama Auto-Launch + Configuration Defaults

set -euo pipefail

echo "🔧 TITANE v27.0.2 PRODUCTION FIX"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "Corrige les problèmes:"
echo "  ✓ Ollama non auto-lancé"
echo "  ✓ Configurations undefined"
echo "  ✓ DevTools désactivé"
echo "  ✓ Persistance des configurations"
echo ""

WORK_DIR=$(mktemp -d)
echo "📂 Working directory: $WORK_DIR"
echo ""

# ════════════════════════════════════════════════════════════════
# 1. OLLAMA SERVICE (SYSTEMD UNIT) FOR DEB
# ════════════════════════════════════════════════════════════════

echo "1️⃣  Créer service systemd pour Ollama..."
cat > "$WORK_DIR/ollama.service" << 'OLLAMA_UNIT'
[Unit]
Description=TITANE∞ Ollama AI Service (Auto-Launch)
Documentation=https://github.com/KallokTherok1994/TITANE_INFINITY
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=titane-os
Group=titane-os
WorkingDirectory=%h/.local/share/TITANE_INFINITY
Environment="OLLAMA_HOST=127.0.0.1:11434"
Environment="OLLAMA_MODELS=%h/.local/share/ollama/models"
ExecStart=/usr/bin/ollama serve
ExecStop=/bin/kill -SIGTERM $MAINPID
Restart=on-failure
RestartSec=5s
StandardOutput=journal
StandardError=journal
SyslogIdentifier=titane-ollama

[Install]
WantedBy=multi-user.target
OLLAMA_UNIT

echo "   ✓ service créé"
echo ""

# ════════════════════════════════════════════════════════════════
# 2. TITANE SERVICE (AFTER OLLAMA)
# ════════════════════════════════════════════════════════════════

echo "2️⃣  Créer service systemd pour TITANE (after Ollama)..."
cat > "$WORK_DIR/titane-infinity.service" << 'TITANE_UNIT'
[Unit]
Description=TITANE∞ Application (Requires Ollama)
Documentation=https://github.com/KallokTherok1994/TITANE_INFINITY
After=ollama.service
Wants=ollama.service

[Service]
Type=simple
User=titane-os
Group=titane-os
WorkingDirectory=%h/.local/share/TITANE_INFINITY
Environment="OLLAMA_HOST=127.0.0.1:11434"
Environment="TITANE_DEVTOOLS=1"
Environment="RUST_BACKTRACE=1"
ExecStart=/usr/bin/titane-infinity
Restart=on-failure
RestartSec=10s
StandardOutput=journal
StandardError=journal
SyslogIdentifier=titane-infinity

[Install]
WantedBy=graphical.target
TITANE_UNIT

echo "   ✓ service créé"
echo ""

# ════════════════════════════════════════════════════════════════
# 3. APPIMAGE LAUNCHER SCRIPT (WITH OLLAMA AUTO-START)
# ════════════════════════════════════════════════════════════════

echo "3️⃣  Créer script launcher pour AppImage..."
cat > "$WORK_DIR/titane-appimage-launcher.sh" << 'APPIMAGE_LAUNCHER'
#!/bin/bash
# TITANE∞ AppImage Launcher with Auto-Ollama
# Features:
#   - Auto-launch Ollama if not running
#   - DevTools enabled
#   - Configurations pre-set

set -euo pipefail

APPIMAGE_PATH="${0%/*}"
TITANE_DATA_DIR="${HOME}/.local/share/TITANE_INFINITY"
OLLAMA_HOST="127.0.0.1:11434"
OLLAMA_TIMEOUT=30

# Create data directories
mkdir -p "$TITANE_DATA_DIR/persistence"
mkdir -p "$TITANE_DATA_DIR/cache"
mkdir -p "${HOME}/.local/share/ollama/models"

# ─────────────────────────────────────────────────────────────
# FUNCTION: Check if Ollama is running
# ─────────────────────────────────────────────────────────────
check_ollama() {
  timeout 2 curl -s "http://$OLLAMA_HOST/api/tags" >/dev/null 2>&1
  return $?
}

# ─────────────────────────────────────────────────────────────
# FUNCTION: Start Ollama if not running
# ─────────────────────────────────────────────────────────────
ensure_ollama() {
  echo "[TITANE] Checking Ollama service..."
  
  if check_ollama; then
    echo "[TITANE] ✅ Ollama already running on $OLLAMA_HOST"
    return 0
  fi
  
  echo "[TITANE] ⚠ Ollama not running. Attempting to start..."
  
  # Try to find Ollama binary
  local ollama_bin=""
  for path in "$APPIMAGE_PATH/resources/ollama/ollama" \
              "${APPIMAGE_PATH}/../lib/ollama" \
              "/usr/local/bin/ollama" \
              "/usr/bin/ollama" \
              "${HOME}/.local/bin/ollama"; do
    if [[ -x "$path" ]]; then
      ollama_bin="$path"
      break
    fi
  done
  
  if [[ -z "$ollama_bin" ]]; then
    echo "[TITANE] ⚠️  Ollama not found. Continuing without auto-start..."
    echo "[TITANE] Install with: brew install ollama  (macOS) or sudo apt-get install ollama (Linux)"
    return 1
  fi
  
  echo "[TITANE] 🚀 Launching Ollama from: $ollama_bin"
  export OLLAMA_HOST="$OLLAMA_HOST"
  "$ollama_bin" serve &
  OLLAMA_PID=$!
  
  # Wait for Ollama to be ready
  local wait_count=0
  while [[ $wait_count -lt $OLLAMA_TIMEOUT ]]; do
    if check_ollama; then
      echo "[TITANE] ✅ Ollama ready after ${wait_count}s"
      return 0
    fi
    sleep 1
    ((wait_count++))
  done
  
  echo "[TITANE] ⚠️  Ollama startup timeout. Continuing anyway..."
  return 1
}

# ─────────────────────────────────────────────────────────────
# MAIN: Launch TITANE with Ollama
# ─────────────────────────────────────────────────────────────
echo "[TITANE] ═══════════════════════════════════════════════════════════"
echo "[TITANE] TITANE∞ v27.0.2 AppImage Launcher"
echo "[TITANE] ═══════════════════════════════════════════════════════════"
echo ""

# Set environment variables
export OLLAMA_HOST="$OLLAMA_HOST"
export TITANE_DEVTOOLS=1
export RUST_BACKTRACE=1
export TITANE_DATA_DIR="$TITANE_DATA_DIR"

# Ensure Ollama is running
ensure_ollama || true

# Launch TITANE
echo "[TITANE] 🚀 Launching TITANE∞..."
echo ""

# Execute AppImage
"${APPIMAGE_PATH}/AppRun" "$@"
APPIMAGE_LAUNCHER

echo "   ✓ launcher créé"
echo ""

# ════════════════════════════════════════════════════════════════
# 4. CONFIGURATION DEFAULTS (JSON)
# ════════════════════════════════════════════════════════════════

echo "4️⃣  Créer fichier configurations par défaut..."
mkdir -p "$WORK_DIR/config"
cat > "$WORK_DIR/config/ollama-defaults.json" << 'DEFAULTS_CONFIG'
{
  "ollama": {
    "endpoint": "http://127.0.0.1:11434",
    "host": "127.0.0.1",
    "port": 11434,
    "model": "gemma2:2b",
    "temperature": 0.7,
    "top_p": 0.9,
    "top_k": 40,
    "num_predict": 128,
    "repeat_penalty": 1.1,
    "timeout_ms": 60000,
    "retry_count": 3,
    "retry_delay_ms": 1000,
    "auto_start": true,
    "check_on_startup": true,
    "fallback_provider": "titane-local"
  },
  "devtools": {
    "enabled": true,
    "hotkey": "F12",
    "console_log_level": "debug"
  },
  "governance": {
    "ollama_policy": {
      "enabled": true,
      "max_concurrent_requests": 5,
      "max_context_tokens": 4096,
      "require_auth": false,
      "log_all_requests": true
    },
    "security_level": "standard",
    "audit_log": true
  },
  "persistence": {
    "auto_save_interval_ms": 5000,
    "cache_enabled": true,
    "cache_ttl_ms": 3600000,
    "db_path": "~/.local/share/TITANE_INFINITY/persistence/titan_events.db"
  }
}
DEFAULTS_CONFIG

echo "   ✓ defaults créés"
echo ""

# ════════════════════════════════════════════════════════════════
# 5. DISPLAY INSTALLATION INFO
# ════════════════════════════════════════════════════════════════

echo "════════════════════════════════════════════════════════════════"
echo "FILES GENERATED:"
echo "════════════════════════════════════════════════════════════════"
echo ""
ls -lh "$WORK_DIR"
echo ""

echo "════════════════════════════════════════════════════════════════"
echo "INSTALLATION INSTRUCTIONS:"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "🔧 FOR DEB INSTALLATION:"
echo "───────────────────────"
echo "1. Copy systemd units:"
echo "   sudo cp $WORK_DIR/ollama.service /etc/systemd/system/"
echo "   sudo cp $WORK_DIR/titane-infinity.service /etc/systemd/system/"
echo ""
echo "2. Enable and start services:"
echo "   sudo systemctl daemon-reload"
echo "   sudo systemctl enable ollama.service titane-infinity.service"
echo "   sudo systemctl start ollama.service"
echo "   sudo systemctl start titane-infinity.service"
echo ""
echo "3. Verify:"
echo "   sudo systemctl status ollama.service"
echo "   sudo systemctl status titane-infinity.service"
echo "   journalctl -u titane-ollama -f"
echo ""
echo ""
echo "🎨 FOR APPIMAGE INSTALLATION:"
echo "──────────────────────────────"
echo "1. Make launcher executable:"
echo "   chmod +x $WORK_DIR/titane-appimage-launcher.sh"
echo ""
echo "2. Create wrapper script in /usr/local/bin:"
echo "   sudo tee /usr/local/bin/titane-infinity-appimage > /dev/null << 'EOF'"
echo "   #!/bin/bash"
echo "   exec \"$WORK_DIR/titane-appimage-launcher.sh\" \"\$@\""
echo "   EOF"
echo "   sudo chmod +x /usr/local/bin/titane-infinity-appimage"
echo ""
echo "3. Or direct execution:"
echo "   $WORK_DIR/titane-appimage-launcher.sh"
echo ""
echo ""
echo "⚙️  CONFIGURATION:"
echo "──────────────────"
echo "Default Ollama config:" 
echo "   $WORK_DIR/config/ollama-defaults.json"
echo ""
echo "Copy to config:"
echo "   mkdir -p ~/.config/TITANE_INFINITY"
echo "   cp $WORK_DIR/config/ollama-defaults.json ~/.config/TITANE_INFINITY/"
echo ""
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "✅ FIX PACKAGE READY AT: $WORK_DIR"
echo ""
