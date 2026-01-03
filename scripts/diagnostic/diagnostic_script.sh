#!/bin/bash
# ╔══════════════════════════════════════════════════════════════╗
# ║  TITANE∞ - DIAGNOSTIC AUTOMATIQUE COMPLET                   ║
# ║  Script d'analyse 360° du Chat IA                           ║
# ╚══════════════════════════════════════════════════════════════╝

set -e

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Compteurs
ERRORS=0
WARNINGS=0
OK=0

# Fonction d'affichage
print_header() {
    echo ""
    echo -e "${BLUE}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║  $1${NC}"
    echo -e "${BLUE}╚══════════════════════════════════════════════════════════════╝${NC}"
    echo ""
}

print_ok() {
    echo -e "${GREEN}✅ $1${NC}"
    ((OK++))
}

print_error() {
    echo -e "${RED}❌ ERREUR: $1${NC}"
    ((ERRORS++))
}

print_warning() {
    echo -e "${YELLOW}⚠️  WARNING: $1${NC}"
    ((WARNINGS++))
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# ============================================
# SECTION 1: ENVIRONNEMENT
# ============================================

print_header "SECTION 1/8: VÉRIFICATION ENVIRONNEMENT"

# Répertoire racine
if [ -d "src" ] && [ -d "src-tauri" ]; then
    print_ok "Répertoire TITANE_INFINITY détecté"
else
    print_error "Pas dans le répertoire racine de TITANE_INFINITY"
    print_info "Répertoire actuel: $(pwd)"
    print_info "Lancez depuis: cd /path/to/TITANE_INFINITY"
    exit 1
fi

# Rust
if command -v rustc &> /dev/null; then
    RUST_VERSION=$(rustc --version | awk '{print $2}')
    print_ok "Rust installé: $RUST_VERSION"
else
    print_error "Rust non installé"
    print_info "Installation: curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh"
fi

# Cargo
if command -v cargo &> /dev/null; then
    CARGO_VERSION=$(cargo --version | awk '{print $2}')
    print_ok "Cargo installé: $CARGO_VERSION"
else
    print_error "Cargo non installé"
fi

# Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    print_ok "Node.js installé: $NODE_VERSION"
    
    if [[ "${NODE_VERSION:1:2}" -lt 18 ]]; then
        print_warning "Node.js < 18 détecté. Recommandé: >= 18"
    fi
else
    print_error "Node.js non installé"
fi

# pnpm
if command -v pnpm &> /dev/null; then
    PNPM_VERSION=$(pnpm --version)
    print_ok "pnpm installé: $PNPM_VERSION"
else
    print_error "pnpm non installé"
    print_info "Installation: pnpm install -g pnpm"
fi

# ============================================
# SECTION 2: CONFIGURATION API
# ============================================

print_header "SECTION 2/8: CONFIGURATION API GEMINI"

# Fichier .env
if [ -f ".env" ]; then
    print_ok "Fichier .env existe"
    
    # Vérifier VITE_GEMINI_API_KEY
    if grep -q "VITE_GEMINI_API_KEY" .env; then
        API_KEY=$(grep VITE_GEMINI_API_KEY .env | cut -d '=' -f2)
        
        if [ -z "$API_KEY" ]; then
            print_error "VITE_GEMINI_API_KEY vide"
        elif [ "$API_KEY" = "YOUR_API_KEY_HERE" ]; then
            print_error "VITE_GEMINI_API_KEY non configuré (template par défaut)"
            print_info "Éditez .env et ajoutez votre clé API Gemini"
            print_info "Obtenir une clé: https://makersuite.google.com/app/apikey"
        else
            # Masquer la clé (afficher seulement les 10 premiers caractères)
            MASKED_KEY="${API_KEY:0:10}..."
            print_ok "VITE_GEMINI_API_KEY configuré: $MASKED_KEY"
            
            # Vérifier format
            if [[ ! "$API_KEY" =~ ^AIza ]]; then
                print_warning "Format clé API suspect (devrait commencer par 'AIza')"
            fi
        fi
    else
        print_error "VITE_GEMINI_API_KEY manquant dans .env"
    fi
else
    print_error "Fichier .env non trouvé"
    print_info "Créez .env avec: VITE_GEMINI_API_KEY=votre_clé"
fi

# Test API direct (si curl disponible et clé configurée)
if command -v curl &> /dev/null && [ -n "$API_KEY" ] && [ "$API_KEY" != "YOUR_API_KEY_HERE" ]; then
    print_info "Test connexion API Gemini..."
    
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" \
        -X POST \
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=$API_KEY" \
        -H "Content-Type: application/json" \
        -d '{"contents":[{"parts":[{"text":"test"}]}]}' \
        --max-time 10)
    
    if [ "$HTTP_CODE" = "200" ]; then
        print_ok "API Gemini accessible (code 200)"
    elif [ "$HTTP_CODE" = "403" ]; then
        print_error "API Gemini refuse la clé (code 403 - clé invalide)"
    elif [ "$HTTP_CODE" = "429" ]; then
        print_warning "API Gemini quota dépassé (code 429)"
    else
        print_warning "API Gemini code HTTP: $HTTP_CODE"
    fi
fi

# ============================================
# SECTION 3: STRUCTURE FICHIERS
# ============================================

print_header "SECTION 3/8: STRUCTURE FICHIERS"

# Backend
if [ -f "src-tauri/src/api/chat_commands.rs" ]; then
    print_ok "Backend: chat_commands.rs existe"
    
    # Vérifier contenu critique
    if grep -q "chat_send_message" src-tauri/src/api/chat_commands.rs; then
        print_ok "Fonction chat_send_message trouvée"
    else
        print_error "Fonction chat_send_message manquante"
    fi
    
    if grep -q "call_gemini_api" src-tauri/src/api/chat_commands.rs; then
        print_ok "Fonction call_gemini_api trouvée"
    else
        print_error "Fonction call_gemini_api manquante"
    fi
else
    print_error "Backend: chat_commands.rs manquant"
    print_info "Créez: src-tauri/src/api/chat_commands.rs"
fi

if [ -f "src-tauri/src/api/mod.rs" ]; then
    print_ok "Backend: api/mod.rs existe"
    
    if grep -q "pub mod chat_commands" src-tauri/src/api/mod.rs; then
        print_ok "Module chat_commands exporté"
    else
        print_error "Module chat_commands non exporté dans mod.rs"
    fi
else
    print_error "Backend: api/mod.rs manquant"
fi

# Frontend
if [ -f "src/ui/pages/ChatIA/ChatIA.tsx" ]; then
    print_ok "Frontend: ChatIA.tsx existe"
    
    if grep -q "chat_send_message" src/ui/pages/ChatIA/ChatIA.tsx; then
        print_ok "Appel chat_send_message trouvé"
    else
        print_error "Appel chat_send_message manquant"
    fi
else
    print_error "Frontend: ChatIA.tsx manquant"
    print_info "Créez: src/ui/pages/ChatIA/ChatIA.tsx"
fi

if [ -f "src/ui/pages/ChatIA/ChatIA.css" ]; then
    print_ok "Frontend: ChatIA.css existe"
else
    print_warning "Frontend: ChatIA.css manquant (styling cassé)"
fi

# ============================================
# SECTION 4: BACKEND TAURI
# ============================================

print_header "SECTION 4/8: BACKEND TAURI"

# main.rs
if [ -f "src-tauri/src/main.rs" ]; then
    print_ok "main.rs existe"
    
    # Vérifier imports
    if grep -q "mod api" src-tauri/src/main.rs; then
        print_ok "Module api importé"
    else
        print_error "Module api non importé dans main.rs"
        print_info "Ajoutez en haut: mod api;"
    fi
    
    if grep -q "use api::chat_commands" src-tauri/src/main.rs; then
        print_ok "chat_commands importé"
    else
        print_error "chat_commands non importé"
        print_info "Ajoutez: use api::chat_commands::*;"
    fi
    
    # Vérifier enregistrement commandes
    if grep -q "chat_send_message" src-tauri/src/main.rs; then
        print_ok "Commande chat_send_message enregistrée"
    else
        print_error "Commande chat_send_message NON enregistrée"
        print_info "Ajoutez dans .invoke_handler(tauri::generate_handler![...])"
    fi
    
    if grep -q ".manage(ChatState::new())" src-tauri/src/main.rs; then
        print_ok "ChatState managé"
    else
        print_error "ChatState non managé"
        print_info "Ajoutez avant .invoke_handler: .manage(ChatState::new())"
    fi
    
    # Compter commandes enregistrées
    CMD_COUNT=$(grep -o "invoke_handler" src-tauri/src/main.rs | wc -l)
    print_info "Nombre de handlers enregistrés: $CMD_COUNT"
else
    print_error "main.rs manquant"
fi

# Cargo.toml
if [ -f "src-tauri/Cargo.toml" ]; then
    print_ok "Cargo.toml existe"
    
    # Vérifier dépendances
    if grep -q "reqwest" src-tauri/Cargo.toml; then
        print_ok "Dépendance reqwest présente"
    else
        print_error "Dépendance reqwest manquante"
        print_info "Ajoutez: reqwest = { version = \"0.11\", features = [\"json\", \"rustls-tls\"] }"
    fi
    
    if grep -q "tokio" src-tauri/Cargo.toml; then
        print_ok "Dépendance tokio présente"
    else
        print_error "Dépendance tokio manquante"
        print_info "Ajoutez: tokio = { version = \"1\", features = [\"full\"] }"
    fi
    
    if grep -q "chrono" src-tauri/Cargo.toml; then
        print_ok "Dépendance chrono présente"
    else
        print_warning "Dépendance chrono manquante (timestamps)"
        print_info "Ajoutez: chrono = { version = \"0.4\", features = [\"serde\"] }"
    fi
else
    print_error "Cargo.toml manquant"
fi

# ============================================
# SECTION 5: COMPILATION
# ============================================

print_header "SECTION 5/8: COMPILATION BACKEND"

print_info "Test compilation Rust (cargo check)..."
cd src-tauri

if cargo check --quiet 2>&1 | grep -q "error"; then
    print_error "Erreurs de compilation détectées"
    print_info "Lancez: cargo build pour voir détails"
    
    # Afficher les erreurs
    echo ""
    echo "===== ERREURS DE COMPILATION ====="
    cargo check 2>&1 | grep "error" | head -10
    echo "=================================="
else
    print_ok "Compilation backend réussie (cargo check)"
fi

cd ..

# Warnings
WARNING_COUNT=$(cd src-tauri && cargo check 2>&1 | grep -c "warning" || true)
if [ "$WARNING_COUNT" -gt 0 ]; then
    print_warning "$WARNING_COUNT warnings Rust détectés"
else
    print_ok "Aucun warning Rust"
fi

# ============================================
# SECTION 6: FRONTEND
# ============================================

print_header "SECTION 6/8: FRONTEND"

# package.json
if [ -f "package.json" ]; then
    print_ok "package.json existe"
    
    # Vérifier scripts
    if grep -q "\"dev\"" package.json; then
        print_ok "Script dev configuré"
    else
        print_warning "Script dev manquant"
    fi
else
    print_error "package.json manquant"
fi

# node_modules
if [ -d "node_modules" ]; then
    print_ok "node_modules présent"
    
    # Vérifier taille (approximative)
    SIZE=$(du -sh node_modules 2>/dev/null | awk '{print $1}')
    print_info "Taille node_modules: $SIZE"
else
    print_error "node_modules manquant"
    print_info "Lancez: pnpm install"
fi

# TypeScript config
if [ -f "tsconfig.json" ]; then
    print_ok "tsconfig.json existe"
else
    print_warning "tsconfig.json manquant"
fi

# ============================================
# SECTION 7: INTÉGRATION ROUTER
# ============================================

print_header "SECTION 7/8: INTÉGRATION ROUTER"

# Rechercher import ChatIA dans App.tsx ou router
if grep -rq "ChatIA" src/ --include="*.tsx" --include="*.ts"; then
    print_ok "Import ChatIA trouvé dans le code"
    
    # Trouver où
    CHATIA_FILES=$(grep -rl "ChatIA" src/ --include="*.tsx" --include="*.ts")
    print_info "Fichiers utilisant ChatIA:"
    echo "$CHATIA_FILES" | while read file; do
        echo "   - $file"
    done
else
    print_warning "Import ChatIA non trouvé"
    print_info "Ajoutez dans App.tsx ou router: import { ChatIA } from './ui/pages/ChatIA/ChatIA';"
fi

# Rechercher route
if grep -rq "/chat-ia\|/chat" src/ --include="*.tsx"; then
    print_ok "Route Chat IA trouvée"
else
    print_warning "Route Chat IA non trouvée"
    print_info "Ajoutez: <Route path=\"/chat-ia\" element={<ChatIA />} />"
fi

# ============================================
# SECTION 8: PROCESSUS EN COURS
# ============================================

print_header "SECTION 8/8: PROCESSUS & PORTS"

# Vérifier si Tauri dev tourne
if pgrep -f "tauri dev" > /dev/null; then
    print_ok "Processus 'tauri dev' actif"
else
    print_info "Aucun processus 'tauri dev' détecté"
fi

# Vérifier port 5173 (Vite dev)
if lsof -Pi :5173 -sTCP:LISTEN -t >/dev/null 2>&1; then
    print_warning "Port 5173 (Vite) déjà utilisé"
    print_info "Process: $(lsof -Pi :5173 -sTCP:LISTEN | tail -1)"
else
    print_ok "Port 5173 disponible"
fi

# ============================================
# RAPPORT FINAL
# ============================================

print_header "RAPPORT FINAL"

echo ""
echo -e "${GREEN}✅ OK: $OK${NC}"
echo -e "${YELLOW}⚠️  WARNINGS: $WARNINGS${NC}"
echo -e "${RED}❌ ERREURS: $ERRORS${NC}"
echo ""

if [ "$ERRORS" -eq 0 ] && [ "$WARNINGS" -eq 0 ]; then
    echo -e "${GREEN}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║  🎉 SYSTÈME 100% OPÉRATIONNEL - PRÊT À LANCER             ║${NC}"
    echo -e "${GREEN}╚══════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${GREEN}Prochaine étape: pnpm dev${NC}"
    exit 0
elif [ "$ERRORS" -eq 0 ]; then
    echo -e "${YELLOW}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${YELLOW}║  ⚠️  SYSTÈME FONCTIONNEL AVEC WARNINGS                     ║${NC}"
    echo -e "${YELLOW}╚══════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo "Le Chat IA devrait fonctionner malgré les warnings."
    echo "Consultez les warnings ci-dessus pour optimisations."
    exit 0
else
    echo -e "${RED}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║  ❌ CORRECTIONS NÉCESSAIRES                                 ║${NC}"
    echo -e "${RED}╚══════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo "Corrigez les erreurs ci-dessus avant de lancer le Chat IA."
    echo ""
    echo "📚 Guide complet: docs/CHAT_IA_FIX_GUIDE.md"
    echo "🆘 Support: Ouvrez une issue GitHub"
    exit 1
fi
