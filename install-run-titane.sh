#!/bin/bash
# 🚀 TITANE∞ - Install Global "run titane" Command

echo "╔══════════════════════════════════════════════════════════════════════════╗"
echo "║  🚀 TITANE∞ - Installing Global 'run titane' Command                    ║"
echo "╚══════════════════════════════════════════════════════════════════════════╝"
echo ""

PROJECT_ROOT="/home/titane-os/Documents/GitHub/TITANE_INFINITY"

# Vérifier que les scripts existent
if [ ! -f "$PROJECT_ROOT/run" ] || [ ! -f "$PROJECT_ROOT/run-titane.sh" ]; then
    echo "❌ ERROR: Scripts not found in $PROJECT_ROOT"
    exit 1
fi

# Méthode 1: Lien symbolique global (nécessite sudo)
echo "📝 Method 1: Global symbolic link (requires sudo)"
if sudo ln -sf "$PROJECT_ROOT/run" /usr/local/bin/titane 2>/dev/null; then
    echo "✅ Global command installed: 'titane'"
    echo "   You can now use: titane [dev|prod|quick|rebuild]"
    echo ""
    GLOBAL_INSTALLED=true
else
    echo "⚠️  Could not install global command (no sudo access)"
    GLOBAL_INSTALLED=false
fi

# Méthode 2: Alias dans .bashrc (fallback)
echo "📝 Method 2: Bash alias in ~/.bashrc"

BASHRC="$HOME/.bashrc"
ALIAS_LINE="alias titane='$PROJECT_ROOT/run'"

if grep -q "alias titane=" "$BASHRC" 2>/dev/null; then
    echo "✅ Alias already exists in ~/.bashrc"
else
    echo "" >> "$BASHRC"
    echo "# TITANE∞ Launcher Alias (added $(date '+%Y-%m-%d'))" >> "$BASHRC"
    echo "$ALIAS_LINE" >> "$BASHRC"
    echo "✅ Alias added to ~/.bashrc"
fi

# Méthode 3: Alias dans .zshrc (si zsh utilisé)
if [ -f "$HOME/.zshrc" ]; then
    echo "📝 Method 3: Zsh alias in ~/.zshrc"
    ZSHRC="$HOME/.zshrc"
    
    if grep -q "alias titane=" "$ZSHRC" 2>/dev/null; then
        echo "✅ Alias already exists in ~/.zshrc"
    else
        echo "" >> "$ZSHRC"
        echo "# TITANE∞ Launcher Alias (added $(date '+%Y-%m-%d'))" >> "$ZSHRC"
        echo "$ALIAS_LINE" >> "$ZSHRC"
        echo "✅ Alias added to ~/.zshrc"
    fi
fi

echo ""
echo "╔══════════════════════════════════════════════════════════════════════════╗"
echo "║  ✅ Installation Complete!                                               ║"
echo "╚══════════════════════════════════════════════════════════════════════════╝"
echo ""
echo "Usage:"
echo "  titane             # Dev mode with full checks"
echo "  titane dev         # Development mode (explicit)"
echo "  titane prod        # Production mode"
echo "  titane quick       # Quick launch (skip checks)"
echo "  titane rebuild     # Force full rebuild"
echo "  titane help        # Show help"
echo ""

if [ "$GLOBAL_INSTALLED" = false ]; then
    echo "⚠️  Global command not installed (no sudo)"
    echo "   Reload your shell: source ~/.bashrc"
    echo "   Then use: titane [options]"
else
    echo "✅ You can now use 'titane' command from anywhere!"
fi
echo ""
