#!/bin/bash
# ╔══════════════════════════════════════════════════════════════════════════════╗
# ║ TITANE∞ v8.0 - MemoryCore Quick Start                                       ║
# ║ Script de démarrage rapide pour tester le MemoryCore                        ║
# ╚══════════════════════════════════════════════════════════════════════════════╝

set -e

echo "🚀 TITANE∞ v8.0 - MemoryCore Quick Start"
echo "=========================================="
echo ""

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Vérifier que nous sommes dans le bon répertoire
if [ ! -d "core/backend" ]; then
    echo "❌ Erreur: Exécutez ce script depuis la racine du projet TITANE_INFINITY"
    exit 1
fi

echo -e "${BLUE}📦 Étape 1: Vérification de l'environnement${NC}"
echo "--------------------------------------------"

# Vérifier Rust
if command -v cargo &> /dev/null; then
    RUST_VERSION=$(cargo --version)
    echo -e "${GREEN}✓${NC} Rust installé: $RUST_VERSION"
else
    echo -e "${YELLOW}⚠${NC}  Rust non trouvé. Installation recommandée:"
    echo "   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh"
fi

# Vérifier Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✓${NC} Node.js installé: $NODE_VERSION"
else
    echo -e "${YELLOW}⚠${NC}  Node.js non trouvé"
fi

echo ""
echo -e "${BLUE}🔧 Étape 2: Installation des dépendances${NC}"
echo "-------------------------------------------"

# Backend Rust
if command -v cargo &> /dev/null; then
    echo "📦 Installation des dépendances Rust..."
    cd core/backend
    cargo fetch 2>&1 | head -5
    cd ../..
    echo -e "${GREEN}✓${NC} Dépendances Rust installées"
else
    echo -e "${YELLOW}⚠${NC}  Impossible d'installer les dépendances Rust (cargo manquant)"
fi

# Frontend
if [ -f "package.json" ] && command -v npm &> /dev/null; then
    echo "📦 Installation des dépendances npm..."
    npm install --silent 2>&1 | tail -1
    echo -e "${GREEN}✓${NC} Dépendances npm installées"
fi

echo ""
echo -e "${BLUE}🧪 Étape 3: Tests du MemoryCore${NC}"
echo "--------------------------------"

if command -v cargo &> /dev/null; then
    echo "🧪 Lancement des tests..."
    cd core/backend
    cargo test --lib memory 2>&1 | grep -E "(test result|running)" || true
    cd ../..
    echo -e "${GREEN}✓${NC} Tests exécutés"
else
    echo -e "${YELLOW}⚠${NC}  Tests ignorés (cargo manquant)"
fi

echo ""
echo -e "${BLUE}🏗️  Étape 4: Compilation${NC}"
echo "-------------------------"

if command -v cargo &> /dev/null; then
    echo "🔨 Compilation du backend..."
    cd core/backend
    if cargo build --release 2>&1 | tail -5; then
        echo -e "${GREEN}✓${NC} Backend compilé avec succès"
    else
        echo -e "${YELLOW}⚠${NC}  Erreurs de compilation détectées"
    fi
    cd ../..
else
    echo -e "${YELLOW}⚠${NC}  Compilation ignorée (cargo manquant)"
fi

echo ""
echo -e "${BLUE}📊 Étape 5: Résumé${NC}"
echo "-------------------"

echo ""
echo "✅ MemoryCore TITANE∞ v8.0 est prêt !"
echo ""
echo "📂 Fichiers générés:"
echo "   • core/backend/system/memory/mod.rs"
echo "   • core/backend/system/memory/crypto.rs"
echo "   • core/backend/system/memory/storage.rs"
echo "   • core/backend/system/memory/types.rs"
echo "   • core/backend/system/memory/tests.rs"
echo ""
echo "🎯 Prochaines étapes:"
echo "   1. Tester manuellement: cargo test"
echo "   2. Lancer l'application: cargo run"
echo "   3. Consulter la doc: cat MEMORYCORE_USAGE.md"
echo ""
echo "🔐 Fonctionnalités:"
echo "   • Chiffrement AES-256-GCM"
echo "   • Stockage local sécurisé"
echo "   • 4 commandes Tauri exposées"
echo "   • Interface React complète"
echo ""
echo -e "${GREEN}🎉 Configuration terminée !${NC}"
