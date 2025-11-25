#!/bin/bash
# TITANE∞ OS - Vérification des dépendances

echo "🔍 Vérification de l'environnement système..."

MISSING_DEPS=()

# Vérifier Rust
if ! command -v cargo &> /dev/null; then
    echo "⚠️  Rust/Cargo non trouvé"
    MISSING_DEPS+=("rust")
else
    echo "✅ Rust: $(rustc --version)"
fi

# Vérifier Node
if ! command -v node &> /dev/null; then
    echo "⚠️  Node.js non trouvé"
    MISSING_DEPS+=("nodejs")
else
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        echo "⚠️  Node.js version trop ancienne (besoin >= 18)"
        MISSING_DEPS+=("nodejs")
    else
        echo "✅ Node.js: $(node --version)"
    fi
fi

# Vérifier PNPM
if ! command -v pnpm &> /dev/null; then
    echo "⚠️  PNPM non trouvé"
    MISSING_DEPS+=("pnpm")
else
    echo "✅ PNPM: $(pnpm --version)"
fi

# Vérifier WebKitGTK
if ! dpkg -l | grep -q "libwebkit2gtk-4.1"; then
    echo "⚠️  WebKitGTK 4.1 non trouvé"
    MISSING_DEPS+=("webkitgtk")
else
    echo "✅ WebKitGTK 4.1 installé"
fi

# Vérifier build-essential
if ! command -v gcc &> /dev/null; then
    echo "⚠️  build-essential non trouvé"
    MISSING_DEPS+=("build-essential")
else
    echo "✅ GCC: $(gcc --version | head -n1)"
fi

# Vérifier espace disque
AVAILABLE_SPACE=$(df -BG . | tail -1 | awk '{print $4}' | sed 's/G//')
if [ "$AVAILABLE_SPACE" -lt 5 ]; then
    echo "⚠️  Espace disque insuffisant (${AVAILABLE_SPACE}GB disponible, 5GB requis)"
    exit 1
else
    echo "✅ Espace disque: ${AVAILABLE_SPACE}GB disponible"
fi

if [ ${#MISSING_DEPS[@]} -gt 0 ]; then
    echo ""
    echo "⚠️  Dépendances manquantes: ${MISSING_DEPS[*]}"
    echo "   L'installateur va les installer automatiquement..."
    echo ""
else
    echo ""
    echo "✅ Toutes les dépendances sont présentes"
    echo ""
fi
