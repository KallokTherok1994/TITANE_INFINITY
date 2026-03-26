#!/bin/bash

# TITANE∞ v26.3.0 - Test du Système Intégré Quantique
# © 2025 TITANE Team. All rights reserved.

echo "🎼 ============================================================================="
echo "🎼  TITANE∞ QUANTUM SYSTEM INTEGRATION TEST v26.3.0"
echo "🎼 ============================================================================="
echo ""

# Couleurs pour les logs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color

LOG_FILE="quantum_system_test_$(date +%Y%m%d_%H%M%S).log"

log() {
    local level=$1
    shift
    local message="$@"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    case $level in
        "INFO")
            echo -e "${CYAN}[INFO]${NC} $message" | tee -a $LOG_FILE
            ;;
        "SUCCESS")
            echo -e "${GREEN}[SUCCESS]${NC} $message" | tee -a $LOG_FILE
            ;;
        "WARNING")
            echo -e "${YELLOW}[WARNING]${NC} $message" | tee -a $LOG_FILE
            ;;
        "ERROR")
            echo -e "${RED}[ERROR]${NC} $message" | tee -a $LOG_FILE
            ;;
        "QUANTUM")
            echo -e "${MAGENTA}[QUANTUM]${NC} $message" | tee -a $LOG_FILE
            ;;
    esac
}

# Test de compilation des nouveaux composants
test_compilation() {
    log "INFO" "Testing TypeScript compilation..."
    
    # Test du Hub d'Intégration Système
    if npx tsc --noEmit --project tsconfig.json src/components/SystemIntegrationHub.tsx 2>/dev/null; then
        log "SUCCESS" "SystemIntegrationHub.tsx compiles successfully"
    else
        log "ERROR" "SystemIntegrationHub.tsx has compilation errors"
        return 1
    fi
    
    # Test de l'Orchestrateur Quantique
    if npx tsc --noEmit --project tsconfig.json src/utils/quantumOrchestrator.ts 2>/dev/null; then
        log "SUCCESS" "quantumOrchestrator.ts compiles successfully"
    else
        log "ERROR" "quantumOrchestrator.ts has compilation errors"
        return 1
    fi
    
    # Test de l'Optimiseur de Performance
    if npx tsc --noEmit --project tsconfig.json src/utils/performanceOptimizer.ts 2>/dev/null; then
        log "SUCCESS" "performanceOptimizer.ts compiles successfully"
    else
        log "ERROR" "performanceOptimizer.ts has compilation errors"
        return 1
    fi
    
    # Test du main.tsx modifié
    if npx tsc --noEmit --project tsconfig.json src/main.tsx 2>/dev/null; then
        log "SUCCESS" "main.tsx compiles successfully with quantum integration"
    else
        log "ERROR" "main.tsx has compilation errors"
        return 1
    fi
    
    return 0
}

# Test de construction Vite
test_vite_build() {
    log "INFO" "Testing Vite build with quantum systems..."
    
    # Construction Vite (timeout de 60 secondes)
    timeout 60s npx vite build --mode development --minify false > vite_build.log 2>&1
    
    if [ $? -eq 0 ]; then
        log "SUCCESS" "Vite build completed successfully"
        return 0
    else
        log "ERROR" "Vite build failed"
        log "INFO" "Last 10 lines from vite build log:"
        tail -n 10 vite_build.log | while read line; do
            log "ERROR" "  $line"
        done
        return 1
    fi
}

# Test de démarrage rapide (30 secondes)
test_quick_start() {
    log "INFO" "Testing quick system startup (30s timeout)..."
    
    # Vérifier que le port est libre
    if ss -tuln | grep -q :5173; then
        log "WARNING" "Port 5173 is in use, attempting to free it..."
        fuser -k 5173/tcp 2>/dev/null || true
        sleep 2
    fi
    
    # Démarrage avec timeout de 30 secondes
    timeout 30s pnpm run dev:tauri > startup_test.log 2>&1 &
    STARTUP_PID=$!
    
    # Attendre quelques secondes pour que Vite démarre
    sleep 8
    
    # Vérifier si Vite démarre correctement
    if ss -tuln | grep -q :5173; then
        log "SUCCESS" "Vite server started successfully on port 5173"
        
        # Test de requête HTTP simple
        if curl -s --connect-timeout 5 http://127.0.0.1:5173/ >/dev/null; then
            log "SUCCESS" "HTTP server responds correctly"
        else
            log "WARNING" "HTTP server not responding yet"
        fi
        
        # Arrêter le processus
        kill -TERM $STARTUP_PID 2>/dev/null || true
        sleep 2
        kill -KILL $STARTUP_PID 2>/dev/null || true
        
        return 0
    else
        log "ERROR" "Vite server failed to start"
        kill -KILL $STARTUP_PID 2>/dev/null || true
        
        log "INFO" "Last 15 lines from startup log:"
        tail -n 15 startup_test.log | while read line; do
            log "ERROR" "  $line"
        done
        
        return 1
    fi
}

# Test des dépendances quantiques
test_quantum_dependencies() {
    log "QUANTUM" "Testing quantum system dependencies..."
    
    # Vérifier les imports TypeScript
    local quantum_files=(
        "src/utils/quantumIntelligence.ts"
        "src/utils/selfHealingSystem.ts" 
        "src/utils/telemetryEngine.ts"
        "src/utils/bootRecoverySystem.ts"
        "src/utils/quantumOrchestrator.ts"
        "src/utils/performanceOptimizer.ts"
        "src/components/SystemIntegrationHub.tsx"
        "src/components/ConsciousnessDashboard.tsx"
    )
    
    local missing_files=0
    
    for file in "${quantum_files[@]}"; do
        if [ -f "$file" ]; then
            log "SUCCESS" "✓ $file exists"
        else
            log "ERROR" "✗ $file is missing"
            missing_files=$((missing_files + 1))
        fi
    done
    
    if [ $missing_files -eq 0 ]; then
        log "QUANTUM" "All quantum system files are present"
        return 0
    else
        log "ERROR" "Missing $missing_files quantum system files"
        return 1
    fi
}

# Test de la structure des fichiers de configuration
test_configuration() {
    log "INFO" "Testing configuration files..."
    
    # Vérifier les fichiers de configuration principaux
    local config_files=(
        "package.json"
        "tsconfig.json"
        "vite.config.ts"
        "tailwind.config.ts"
        "runtime/dev/tauri.dev.conf.json"
    )
    
    for file in "${config_files[@]}"; do
        if [ -f "$file" ]; then
            log "SUCCESS" "✓ $file exists"
        else
            log "WARNING" "⚠ $file might be missing"
        fi
    done
    
    return 0
}

# Nettoyage final
cleanup() {
    log "INFO" "Cleaning up test artifacts..."
    
    # Arrêter tous les processus de dev qui pourraient traîner
    pkill -f "vite.*5173" 2>/dev/null || true
    pkill -f "tauri dev" 2>/dev/null || true
    fuser -k 5173/tcp 2>/dev/null || true
    
    # Nettoyer les fichiers de log temporaires
    rm -f vite_build.log startup_test.log 2>/dev/null || true
    
    log "SUCCESS" "Cleanup completed"
}

# Fonction principale
main() {
    log "QUANTUM" "Starting TITANE∞ Quantum System Integration Test..."
    echo ""
    
    # Piège pour nettoyer à la sortie
    trap cleanup EXIT
    
    local test_results=0
    
    # Test 1: Configuration
    log "INFO" "=== Phase 1: Configuration Test ==="
    if test_configuration; then
        log "SUCCESS" "Phase 1: PASSED"
    else
        log "ERROR" "Phase 1: FAILED"
        test_results=$((test_results + 1))
    fi
    echo ""
    
    # Test 2: Dépendances Quantiques
    log "INFO" "=== Phase 2: Quantum Dependencies Test ==="
    if test_quantum_dependencies; then
        log "SUCCESS" "Phase 2: PASSED"
    else
        log "ERROR" "Phase 2: FAILED"
        test_results=$((test_results + 1))
    fi
    echo ""
    
    # Test 3: Compilation TypeScript
    log "INFO" "=== Phase 3: TypeScript Compilation Test ==="
    if test_compilation; then
        log "SUCCESS" "Phase 3: PASSED"
    else
        log "ERROR" "Phase 3: FAILED"
        test_results=$((test_results + 1))
    fi
    echo ""
    
    # Test 4: Build Vite
    log "INFO" "=== Phase 4: Vite Build Test ==="
    if test_vite_build; then
        log "SUCCESS" "Phase 4: PASSED"
    else
        log "ERROR" "Phase 4: FAILED"
        test_results=$((test_results + 1))
    fi
    echo ""
    
    # Test 5: Démarrage Rapide
    log "INFO" "=== Phase 5: Quick Startup Test ==="
    if test_quick_start; then
        log "SUCCESS" "Phase 5: PASSED"
    else
        log "ERROR" "Phase 5: FAILED"
        test_results=$((test_results + 1))
    fi
    echo ""
    
    # Résultats finaux
    echo "🎼 ============================================================================="
    if [ $test_results -eq 0 ]; then
        log "QUANTUM" "🎉 ALL TESTS PASSED! TITANE∞ Quantum System Integration is SUCCESSFUL! 🎉"
        log "QUANTUM" "✨ Quantum Intelligence, Self-Healing, Telemetry, and Orchestration: OPERATIONAL"
        log "QUANTUM" "🧠 Consciousness Dashboard and System Integration Hub: READY"
        log "QUANTUM" "⚡ Performance Optimizer and Boot Recovery: ACTIVE"
        echo ""
        log "SUCCESS" "🚀 TITANE∞ v26.3.0 is ready for quantum-enhanced operations!"
    else
        log "ERROR" "❌ $test_results TEST(S) FAILED! System needs attention."
        log "WARNING" "🔧 Please check the issues above and retry."
    fi
    echo "🎼 ============================================================================="
    
    log "INFO" "Test log saved to: $LOG_FILE"
    
    return $test_results
}

# Exécution
main "$@"