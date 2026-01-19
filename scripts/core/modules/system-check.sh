#!/bin/bash
# ╔══════════════════════════════════════════════════════════════════════════════╗
# ║         TITANE∞ CORE MODULE — SYSTEM CHECK v1.0                             ║
# ║         Vérification intelligente des prérequis système                    ║
# ╚══════════════════════════════════════════════════════════════════════════════╝

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../../.." && pwd)"
REPO_ROOT="$(dirname "$(dirname "$SCRIPT_DIR")")"
CACHE_KEY_PREFIX="system_check"

# Charger les bibliothèques core
source "scripts/core/lib/cache.sh"
source "scripts/core/lib/telemetry.sh"

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

################################################################################
# VÉRIFICATIONS DE BASE SYSTÈME
################################################################################

check_os() {
    local os_info
    os_info=$(cache_system_info "os")

    case "$os_info" in
        Linux)
            echo "✅ Linux detected"
            return 0
            ;;
        Darwin)
            echo "✅ macOS detected (experimental support)"
            return 0
            ;;
        *)
            echo "❌ Unsupported OS: $os_info"
            return 1
            ;;
    esac
}

check_architecture() {
    local arch_info
    arch_info=$(cache_system_info "arch")

    case "$arch_info" in
        x86_64|amd64)
            echo "✅ x86_64 architecture detected"
            return 0
            ;;
        arm64|aarch64)
            echo "✅ ARM64 architecture detected"
            return 0
            ;;
        *)
            echo "❌ Unsupported architecture: $arch_info"
            return 1
            ;;
    esac
}

check_memory() {
    local mem_gb
    mem_gb=$(cache_system_info "memory_gb")

    if (( $(echo "$mem_gb > 4" | bc -l 2>/dev/null || echo 0) )); then
        echo "✅ Memory: ${mem_gb}GB (sufficient)"
        return 0
    else
        echo "⚠️  Memory: ${mem_gb}GB (minimum 4GB recommended)"
        return 0  # Warning but not blocking
    fi
}

check_disk_space() {
    local disk_free
    disk_free=$(cache_system_info "disk_free_gb")

    if (( disk_free > 10 )); then
        echo "✅ Disk space: ${disk_free}GB free (sufficient)"
        return 0
    else
        echo "❌ Disk space: ${disk_free}GB free (minimum 10GB required)"
        return 1
    fi
}

################################################################################
# VÉRIFICATIONS OUTILS SYSTÈME
################################################################################

check_command() {
    local cmd="$1"
    local description="${2:-}"

    if command -v "$cmd" &> /dev/null; then
        local version=""
        case "$cmd" in
            node)
                version=$(node --version 2>/dev/null || echo "")
                ;;
            npm)
                version=$(npm --version 2>/dev/null || echo "")
                ;;
            pnpm)
                version=$(pnpm --version 2>/dev/null || echo "")
                ;;
            cargo)
                version=$(cargo --version 2>/dev/null | cut -d' ' -f2 || echo "")
                ;;
            rustc)
                version=$(rustc --version 2>/dev/null | cut -d' ' -f2 || echo "")
                ;;
            git)
                version=$(git --version 2>/dev/null | cut -d' ' -f3 || echo "")
                ;;
            curl)
                version=$(curl --version 2>/dev/null | head -1 | cut -d' ' -f2 || echo "")
                ;;
            jq)
                version=$(jq --version 2>/dev/null | cut -d'-' -f2 || echo "")
                ;;
            *)
                version="present"
                ;;
        esac

        echo "✅ $cmd found${version:+ ($version)}"
        return 0
    else
        echo "❌ $cmd not found${description:+ ($description)}"
        return 1
    fi
}

check_node_version() {
    local node_version
    node_version=$(node --version 2>/dev/null | sed 's/v//' | cut -d. -f1)

    if [[ -z "$node_version" ]]; then
        echo "❌ Node.js not found"
        return 1
    fi

    if (( node_version >= 18 )); then
        echo "✅ Node.js version: $(node --version) (compatible)"
        return 0
    else
        echo "❌ Node.js version: $(node --version) (minimum v18 required)"
        return 1
    fi
}

check_rust_version() {
    if ! command -v rustc &> /dev/null; then
        echo "❌ Rust not found"
        return 1
    fi

    local rust_version
    rust_version=$(rustc --version 2>/dev/null | cut -d' ' -f2 | cut -d. -f1)

    if (( rust_version >= 1 )); then
        echo "✅ Rust version: $(rustc --version | cut -d' ' -f2) (compatible)"
        return 0
    else
        echo "⚠️  Rust version: $(rustc --version | cut -d' ' -f2) (might work)"
        return 0
    fi
}

################################################################################
# VÉRIFICATIONS PROJET
################################################################################

check_project_structure() {
    local missing_files=()

    # Fichiers essentiels
    local required_files=(
        "package.json"
        "src-tauri/Cargo.toml"
        "src-tauri/tauri.conf.json"
        "src/App.tsx"
        "src/main.tsx"
    )

    for file in "${required_files[@]}"; do
        if [[ ! -f "$REPO_ROOT/$file" ]]; then
            missing_files+=("$file")
        fi
    done

    if [[ ${#missing_files[@]} -eq 0 ]]; then
        echo "✅ Project structure complete"
        return 0
    else
        echo "❌ Missing files: ${missing_files[*]}"
        return 1
    fi
}

check_dependencies_installed() {
    if [[ -d "$REPO_ROOT/node_modules" ]]; then
        local package_count=$(find "$REPO_ROOT/node_modules" -maxdepth 1 -type d | wc -l)
        echo "✅ Node dependencies installed ($((package_count - 1)) packages)"
        return 0
    else
        echo "❌ Node dependencies not installed (run: pnpm install)"
        return 1
    fi
}

check_rust_dependencies() {
    if [[ -f "$REPO_ROOT/src-tauri/Cargo.lock" ]]; then
        echo "✅ Rust dependencies resolved"
        return 0
    else
        echo "❌ Rust dependencies not resolved (run: cargo build)"
        return 1
    fi
}

################################################################################
# VÉRIFICATIONS AVANCÉES
################################################################################

check_build_artifacts() {
    local artifacts_exist=false

    # Vérifier frontend build
    if [[ -d "$REPO_ROOT/dist" ]] && [[ -f "$REPO_ROOT/dist/index.html" ]]; then
        echo "✅ Frontend build artifacts present"
        artifacts_exist=true
    else
        echo "ℹ️  Frontend not built (run: pnpm run build)"
    fi

    # Vérifier backend build
    if [[ -f "$REPO_ROOT/src-tauri/target/release/titane-infinity" ]]; then
        echo "✅ Backend build artifacts present"
        artifacts_exist=true
    else
        echo "ℹ️  Backend not built (run: cargo build --release)"
    fi

    # Vérifier bundles Tauri
    if [[ -d "$REPO_ROOT/src-tauri/target/release/bundle" ]]; then
        local bundle_count=$(find "$REPO_ROOT/src-tauri/target/release/bundle" -name "*.AppImage" -o -name "*.deb" 2>/dev/null | wc -l)
        if (( bundle_count > 0 )); then
            echo "✅ Tauri bundles present ($bundle_count found)"
            artifacts_exist=true
        fi
    fi

    return 0  # Non-blocking
}

check_network_connectivity() {
    # Test connexion internet
    if curl -s --max-time 5 https://registry.npmjs.org/ &> /dev/null; then
        echo "✅ Internet connectivity (npm registry)"
        return 0
    elif curl -s --max-time 5 https://crates.io/ &> /dev/null; then
        echo "✅ Internet connectivity (crates.io)"
        return 0
    else
        echo "⚠️  Limited internet connectivity"
        return 0  # Warning but not blocking
    fi
}

################################################################################
# RAPPORT ET RECOMMANDATIONS
################################################################################

generate_recommendations() {
    echo ""
    echo "🔧 RECOMMENDATIONS:"
    echo ""

    # Vérifier les outils manquants critiques
    local critical_missing=()
    for cmd in node pnpm cargo rustc git; do
        if ! command -v "$cmd" &> /dev/null; then
            critical_missing+=("$cmd")
        fi
    done

    if [[ ${#critical_missing[@]} -gt 0 ]]; then
        echo "🚨 Critical tools missing: ${critical_missing[*]}"
        echo "   Install with: sudo apt install nodejs npm cargo rustc git (or equivalent)"
        echo ""
    fi

    # Recommandations de performance
    local mem_gb
    mem_gb=$(cache_system_info "memory_gb")
    if (( $(echo "$mem_gb < 8" | bc -l 2>/dev/null || echo 1) )); then
        echo "💡 Performance: Consider upgrading to 8GB+ RAM for better build times"
    fi

    local cpu_cores
    cpu_cores=$(cache_system_info "cpu_cores")
    if (( cpu_cores < 4 )); then
        echo "💡 Performance: More CPU cores would improve build parallelism"
    fi

    # Recommandations spécifiques au projet
    if [[ ! -d "$REPO_ROOT/node_modules" ]]; then
        echo "📦 Run 'pnpm install' to install dependencies"
    fi

    if [[ ! -f "$REPO_ROOT/src-tauri/target/release/titane-infinity" ]]; then
        echo "🔨 Run 'cargo build --release' to build the backend"
    fi

    if [[ ! -d "$REPO_ROOT/dist" ]]; then
        echo "⚙️  Run 'pnpm run build' to build the frontend"
    fi
}

################################################################################
# FONCTIONS PRINCIPALES
################################################################################

run_full_check() {
    echo "🔍 TITANE∞ System Requirements Check"
    echo "===================================="
    echo ""

    local all_passed=true
    local warnings=0

    echo "🌐 SYSTEM INFORMATION:"
    echo "----------------------"
    check_os || all_passed=false
    check_architecture || all_passed=false
    check_memory || ((warnings++))
    check_disk_space || all_passed=false
    echo ""

    echo "🛠️  DEVELOPMENT TOOLS:"
    echo "----------------------"
    check_command git "version control" || all_passed=false
    check_command curl "HTTP client" || ((warnings++))
    check_command jq "JSON processor" || ((warnings++))
    check_node_version || all_passed=false
    check_command pnpm "package manager" || all_passed=false
    check_rust_version || all_passed=false
    check_command cargo "Rust build tool" || all_passed=false
    echo ""

    echo "📁 PROJECT STRUCTURE:"
    echo "---------------------"
    check_project_structure || all_passed=false
    check_dependencies_installed || ((warnings++))
    check_rust_dependencies || ((warnings++))
    check_build_artifacts
    echo ""

    echo "🌐 NETWORK CONNECTIVITY:"
    echo "------------------------"
    check_network_connectivity
    echo ""

    generate_recommendations

    echo ""
    echo "📊 SUMMARY:"
    echo "==========="
    if [[ "$all_passed" == true ]]; then
        echo "✅ All critical requirements met!"
        if (( warnings > 0 )); then
            echo "⚠️  $warnings warnings (non-blocking)"
        fi
        return 0
    else
        echo "❌ Some requirements not met - fix before proceeding"
        return 1
    fi
}

run_dev_check() {
    echo "👨‍💻 TITANE∞ Development Environment Check"
    echo "========================================"
    echo ""

    # Vérifications minimales pour le développement
    check_os >/dev/null || { echo "❌ OS not supported"; return 1; }
    check_node_version || return 1
    check_command pnpm || return 1
    check_project_structure || return 1

    echo "✅ Development environment ready"
    return 0
}

################################################################################
# EXÉCUTION
################################################################################

main() {
    local mode="${1:-full}"

    case "$mode" in
        --dev)
            run_dev_check
            ;;
        full|*)
            run_full_check
            ;;
    esac
}

# Démarrer télémétrie
telemetry_start_timer "system_check"

# Exécuter
main "$@"

# Finaliser télémétrie
telemetry_stop_timer "system_check"
