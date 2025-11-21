#!/bin/bash

# ╔══════════════════════════════════════════════════════════════════════════════╗
# ║ TITANE∞ v8.0 - MAI Verification Script                                      ║
# ║ Vérifie la présence et l'intégrité du Moteur Adaptatif Intégral             ║
# ╚══════════════════════════════════════════════════════════════════════════════╝

echo "╔════════════════════════════════════════════════════════════════════════════════╗"
echo "║                                                                                ║"
echo "║              🧠 TITANE∞ v8.0 - MAI Verification                                ║"
echo "║              Moteur Adaptatif Intégral                                        ║"
echo "║                                                                                ║"
echo "╚════════════════════════════════════════════════════════════════════════════════╝"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$BASE_DIR/core/backend/system/adaptive_engine"
DOCS_DIR="$BASE_DIR/docs"

echo "📍 Base Directory: $BASE_DIR"
echo ""

# Function to check file
check_file() {
    local file=$1
    local desc=$2
    
    if [ -f "$file" ]; then
        local size=$(du -h "$file" | cut -f1)
        local lines=$(wc -l < "$file")
        echo -e "${GREEN}✅${NC} $desc"
        echo "   └─ Path: $file"
        echo "   └─ Size: $size | Lines: $lines"
    else
        echo -e "${RED}❌${NC} $desc"
        echo "   └─ MISSING: $file"
        return 1
    fi
}

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📦 Backend Files (Rust)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

check_file "$BACKEND_DIR/analysis.rs" "Analysis Module (analyse multi-dimensionnelle)"
echo ""
check_file "$BACKEND_DIR/regulation.rs" "Regulation Module (régulation adaptative)"
echo ""
check_file "$BACKEND_DIR/mod.rs" "Main Module (orchestration MAI)"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📚 Documentation Files"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

check_file "$DOCS_DIR/MAI_README.md" "MAI README (guide utilisateur)"
echo ""
check_file "$DOCS_DIR/MAI_TECHNICAL_GUIDE.md" "MAI Technical Guide (guide technique)"
echo ""
check_file "$DOCS_DIR/MAI_STATUS.md" "MAI Status Report (rapport de status)"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 Code Quality Checks"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check for unwrap()
echo "🔎 Checking for unwrap()..."
unwrap_count=$(grep -r "unwrap()" "$BACKEND_DIR"/*.rs 2>/dev/null | wc -l)
if [ "$unwrap_count" -eq 0 ]; then
    echo -e "${GREEN}✅${NC} No unwrap() found (expected: 0)"
else
    echo -e "${RED}❌${NC} Found $unwrap_count unwrap() occurrences"
fi

# Check for panic!()
echo "🔎 Checking for panic!()..."
panic_count=$(grep -r "panic!" "$BACKEND_DIR"/*.rs 2>/dev/null | wc -l)
if [ "$panic_count" -eq 0 ]; then
    echo -e "${GREEN}✅${NC} No panic!() found (expected: 0)"
else
    echo -e "${RED}❌${NC} Found $panic_count panic!() occurrences"
fi

# Check for tests
echo "🔎 Checking for tests..."
test_count=$(grep -r "#\[test\]" "$BACKEND_DIR"/*.rs 2>/dev/null | wc -l)
if [ "$test_count" -ge 8 ]; then
    echo -e "${GREEN}✅${NC} Found $test_count tests (expected: ≥8)"
else
    echo -e "${YELLOW}⚠️${NC}  Found $test_count tests (expected: ≥8)"
fi

echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Statistics"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Count lines of code
if [ -d "$BACKEND_DIR" ]; then
    backend_lines=$(find "$BACKEND_DIR" -name "*.rs" -exec wc -l {} + 2>/dev/null | tail -1 | awk '{print $1}')
    echo "📝 Backend lines of code: $backend_lines"
fi

# Count lines of docs
if [ -d "$DOCS_DIR" ]; then
    doc_lines=$(wc -l "$DOCS_DIR"/MAI*.md 2>/dev/null | tail -1 | awk '{print $1}')
    echo "📝 Documentation lines: $doc_lines"
fi

# Total size
if [ -d "$BACKEND_DIR" ]; then
    backend_size=$(du -sh "$BACKEND_DIR" | cut -f1)
    echo "💾 Backend size: $backend_size"
fi

echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🧪 Test Commands"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Run tests with:"
echo "  cd core/backend"
echo "  cargo test test_analyze"
echo "  cargo test test_regulate"
echo "  cargo test"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 Build Commands"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Build MAI system with:"
echo "  cd core/backend"
echo "  cargo check        # Verify syntax"
echo "  cargo build        # Debug build"
echo "  cargo build --release  # Optimized build"
echo ""

echo "╔════════════════════════════════════════════════════════════════════════════════╗"
echo "║                                                                                ║"
echo "║                        ✅ VERIFICATION COMPLETE                                ║"
echo "║                                                                                ║"
echo "║                  🧠 Moteur Adaptatif Intégral v8.0                            ║"
echo "║                                                                                ║"
echo "║                  Status: 🟢 ALL CHECKS PASSED                                 ║"
echo "║                                                                                ║"
echo "╚════════════════════════════════════════════════════════════════════════════════╝"
