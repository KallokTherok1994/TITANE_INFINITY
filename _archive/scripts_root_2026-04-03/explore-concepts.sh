#!/bin/bash
# TITANE∞ — Interactive Concept Explorer
# Learn development concepts with real TITANE∞ examples

set -e

# Colors
BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Clear screen
clear

echo -e "${CYAN}"
cat << 'EOF'
╔════════════════════════════════════════════════════════════════════════════╗
║                                                                            ║
║   📖 TITANE∞ CONCEPT EXPLORER                                             ║
║                                                                            ║
║   Interactive guide to 22 fundamental development concepts                ║
║                                                                            ║
╚════════════════════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

# Function to show concept
show_concept() {
    local concept=$1
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    
    case $concept in
        1)
            echo -e "${MAGENTA}1. Immutable / Mutability${NC}"
            echo ""
            echo "Définition:"
            echo "  • Immutable: donnée qui ne change jamais"
            echo "  • Mutable: donnée modifiable"
            echo ""
            echo -e "${YELLOW}Dans TITANE∞:${NC}"
            echo "  • React state: toujours immutable"
            echo "  • Rust: immutable par défaut (let vs let mut)"
            echo "  • Zustand stores: updates immutables"
            echo ""
            echo -e "${CYAN}Exemple:${NC}"
            echo "  ❌ let state = { cognitive: 'idle' };"
            echo "     state.cognitive = 'thinking'; // Mutation"
            echo ""
            echo "  ✅ const newState = { ...state, cognitive: 'thinking' };"
            echo ""
            echo -e "${BLUE}Pourquoi important:${NC}"
            echo "  • Évite race conditions"
            echo "  • Facilite debugging"
            echo "  • Permet time-travel debugging"
            ;;
        2)
            echo -e "${MAGENTA}2. State (État)${NC}"
            echo ""
            echo "Définition:"
            echo "  L'ensemble des valeurs qui définissent la situation actuelle"
            echo ""
            echo -e "${YELLOW}Dans TITANE∞:${NC}"
            echo "  • Frontend: Zustand stores (visualStateStore, cognitiveStore)"
            echo "  • Backend: Rust state machines (MemoryOS, QuantumEngine)"
            echo "  • Sync: Tauri IPC bridge"
            echo ""
            echo -e "${CYAN}Structure SystemState:${NC}"
            echo "  interface SystemState {"
            echo "    cognitive: CognitiveState;    // 'idle' | 'thinking'"
            echo "    memory: MemoryState;          // Tier, utilisation"
            echo "    visual: VisualState;          // Mode, effets"
            echo "    performance: PerformanceState; // Métriques"
            echo "  }"
            echo ""
            echo -e "${BLUE}Principe clé:${NC}"
            echo "  Maîtriser l'état = maîtriser le comportement"
            ;;
        3)
            echo -e "${MAGENTA}3. Side Effects (Effets de bord)${NC}"
            echo ""
            echo "Définition:"
            echo "  Action qui modifie quelque chose en dehors de la fonction"
            echo ""
            echo -e "${YELLOW}Exemples:${NC}"
            echo "  • Écrire dans un fichier"
            echo "  • Modifier une variable globale"
            echo "  • Envoyer une requête réseau"
            echo "  • Logger dans la console"
            echo ""
            echo -e "${CYAN}Dans TITANE∞:${NC}"
            echo "  • React useEffect: Hook dédié aux side effects"
            echo "  • Rust Result<T,E>: Gestion explicite des I/O"
            echo "  • Service Layer: Isolation des side effects"
            echo ""
            echo -e "${BLUE}Best Practice:${NC}"
            echo "  Rendre les side effects explicites et contrôlés"
            ;;
        4)
            echo -e "${MAGENTA}4. Pure Function${NC}"
            echo ""
            echo "Définition:"
            echo "  Fonction qui:"
            echo "    1. Même input → même output"
            echo "    2. Aucun side effect"
            echo ""
            echo -e "${CYAN}Exemple TITANE∞:${NC}"
            echo "  ✅ Pure:"
            echo "  function calculateResonance(freq: number, amp: number): number {"
            echo "    return Math.sin(freq) * amp;"
            echo "  }"
            echo ""
            echo "  ❌ Impure:"
            echo "  function calculate(freq: number): number {"
            echo "    console.log('Calculating...'); // Side effect"
            echo "    return Math.sin(freq) * Math.random(); // Non-déterministe"
            echo "  }"
            echo ""
            echo -e "${BLUE}Avantages:${NC}"
            echo "  • Testable facilement"
            echo "  • Cacheable (memoization)"
            echo "  • Parallélisable"
            ;;
        5)
            echo -e "${MAGENTA}5. Async / Await${NC}"
            echo ""
            echo "Définition:"
            echo "  Gestion de tâches asynchrones sans bloquer"
            echo ""
            echo -e "${CYAN}Dans TITANE∞:${NC}"
            echo "  async function processRequest(input: string) {"
            echo "    const normalized = await normalize(input);     // 50ms"
            echo "    const intent = await detectIntent(normalized); // 200ms"
            echo "    const response = await callAI(context);        // 2000ms"
            echo "    return formatResponse(response);               // 10ms"
            echo "  }"
            echo "  // Total: ~2260ms, CPU libre pendant attentes"
            echo ""
            echo -e "${YELLOW}Backend Rust (avec Tokio):${NC}"
            echo "  async fn fetch_data() -> Result<Data, Error> {"
            echo "    let response = reqwest::get(url).await?;"
            echo "    let data = response.json().await?;"
            echo "    Ok(data)"
            echo "  }"
            ;;
        6)
            echo -e "${MAGENTA}6. Serialization / Deserialization${NC}"
            echo ""
            echo "Définition:"
            echo "  • Serialization: Objet → texte (JSON)"
            echo "  • Deserialization: Texte → objet"
            echo ""
            echo -e "${CYAN}Utilisation TITANE∞:${NC}"
            echo "  • IPC Tauri: Frontend ↔ Backend"
            echo "  • API Calls: HTTP JSON"
            echo "  • Storage: State → SQLite"
            echo "  • Logs: Events → analyse"
            echo ""
            echo -e "${YELLOW}TypeScript:${NC}"
            echo "  const json = JSON.stringify(user);"
            echo "  const obj = JSON.parse(json);"
            echo ""
            echo -e "${YELLOW}Rust (serde):${NC}"
            echo "  let json = serde_json::to_string(&user)?;"
            echo "  let user: User = serde_json::from_str(&json)?;"
            ;;
        7)
            echo -e "${MAGENTA}7. Pipeline${NC}"
            echo ""
            echo "Définition:"
            echo "  Chaîne d'étapes où sortie = entrée suivante"
            echo ""
            echo -e "${CYAN}OMEGA Pipeline TITANE∞:${NC}"
            echo "  Input → Normalize → Intent Detection"
            echo "    → Context Building → AI Processing"
            echo "    → Response Formatting → Output"
            echo ""
            echo -e "${YELLOW}Build Pipeline:${NC}"
            echo "  Clean → Lint → TypeScript → Vite Build"
            echo "    → Cargo Build → Test → Package → Deploy"
            echo ""
            echo -e "${BLUE}Code:${NC}"
            echo "  const result = await pipe("
            echo "    normalize,"
            echo "    detectIntent,"
            echo "    buildContext,"
            echo "    processWithAI,"
            echo "    formatResponse"
            echo "  )(userInput);"
            ;;
        8)
            echo -e "${MAGENTA}8. Race Condition${NC}"
            echo ""
            echo "Définition:"
            echo "  Deux opérations parallèles modifient la même donnée"
            echo "  → Résultat imprévisible"
            echo ""
            echo -e "${RED}Problème:${NC}"
            echo "  let counter = 0;"
            echo "  async function increment() {"
            echo "    const current = counter;  // Thread A lit 0"
            echo "    await delay(10);          // Thread B lit aussi 0"
            echo "    counter = current + 1;    // Les deux écrivent 1"
            echo "  }                          // → Perdu un increment!"
            echo ""
            echo -e "${GREEN}Solutions TITANE∞:${NC}"
            echo "  • Frontend: Stores immutables (Zustand)"
            echo "  • Backend: Mutex (Rust)"
            echo "  • IPC: Queue serialized"
            ;;
        *)
            echo -e "${RED}Concept not found${NC}"
            ;;
    esac
    
    echo ""
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

# Main menu
while true; do
    echo ""
    echo -e "${CYAN}🎯 SELECT A CATEGORY:${NC}"
    echo ""
    echo "  [1] Concepts de Base (4 concepts)"
    echo "  [2] Gestion des Erreurs (4 concepts)"
    echo "  [3] Structure & Architecture (5 concepts)"
    echo "  [4] Concurrence & Async (3 concepts)"
    echo "  [5] Qualité du Code (3 concepts)"
    echo "  [6] Concepts Modernes (3 concepts)"
    echo ""
    echo "  [Q] Quick concepts (interactive)"
    echo "  [D] Open full documentation"
    echo "  [X] Exit"
    echo ""
    read -p "Choice: " category
    
    case $category in
        1)
            echo ""
            echo -e "${YELLOW}📚 Concepts de Base${NC}"
            echo "  [1] Immutable / Mutability"
            echo "  [2] State (État)"
            echo "  [3] Side Effects"
            echo "  [4] Pure Function"
            read -p "Select concept (1-4): " concept
            show_concept "$concept"
            ;;
        2)
            echo ""
            echo -e "${YELLOW}📚 Gestion des Erreurs${NC}"
            echo "  [1] Try/Catch"
            echo "  [2] Throw"
            echo "  [3] Null/Undefined/None"
            echo "  [4] Optional/Option"
            read -p "Select concept: " concept
            # Add 4 to map to concept numbers
            show_concept $((concept + 4))
            ;;
        [Qq])
            echo ""
            show_concept 1
            read -p "Press Enter for next concept..."
            show_concept 2
            read -p "Press Enter for next concept..."
            show_concept 5
            read -p "Press Enter for next concept..."
            show_concept 7
            ;;
        [Dd])
            echo ""
            echo -e "${GREEN}Opening full documentation...${NC}"
            if command -v code &> /dev/null; then
                code docs/FUNDAMENTAL_CONCEPTS.md
            elif command -v nano &> /dev/null; then
                nano docs/FUNDAMENTAL_CONCEPTS.md
            else
                cat docs/FUNDAMENTAL_CONCEPTS.md | less
            fi
            ;;
        [Xx])
            echo ""
            echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
            echo ""
            echo -e "${GREEN}📖 Thank you for using TITANE∞ Concept Explorer!${NC}"
            echo ""
            echo "Resources:"
            echo "  • Full guide: docs/FUNDAMENTAL_CONCEPTS.md"
            echo "  • Architecture: docs/ARCHITECTURE.md"
            echo "  • Roadmap: OPTIMIZATION_ROADMAP_v22.md"
            echo ""
            echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
            echo ""
            exit 0
            ;;
        *)
            echo -e "${RED}Invalid choice. Try again.${NC}"
            ;;
    esac
    
    read -p "Press Enter to continue..."
    clear
    echo -e "${CYAN}"
    cat << 'EOF'
╔════════════════════════════════════════════════════════════════════════════╗
║                                                                            ║
║   📖 TITANE∞ CONCEPT EXPLORER                                             ║
║                                                                            ║
╚════════════════════════════════════════════════════════════════════════════╝
EOF
    echo -e "${NC}"
done
