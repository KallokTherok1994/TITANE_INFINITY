#!/bin/bash
# Script de vérification de la couche Executive/Strategic (Modules #40-43)

echo "🔍 TITANE∞ v8 - Vérification Executive/Strategic Layer"
echo "========================================================"
echo ""

GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

total_files=0
found_files=0

# Fonction de vérification
check_file() {
    local file=$1
    local desc=$2
    total_files=$((total_files + 1))
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓${NC} $desc"
        found_files=$((found_files + 1))
    else
        echo -e "${RED}✗${NC} $desc (MANQUANT)"
    fi
}

# Module #40 - Central Governor (Gouverneur central)
echo "📦 Module #40 - Central Governor"
check_file "core/backend/system/central_governor/mod.rs" "  - mod.rs (structure + tick)"
check_file "core/backend/system/central_governor/profile.rs" "  - profile.rs (RegulationProfileMemory)"
check_file "core/backend/system/central_governor/collect.rs" "  - collect.rs (collecte des inputs)"
check_file "core/backend/system/central_governor/compute.rs" "  - compute.rs (calculs)"
echo ""

# Module #41 - Executive Flow (Flux exécutif)
echo "📦 Module #41 - Executive Flow"
check_file "core/backend/system/executive_flow/mod.rs" "  - mod.rs (structure + tick)"
check_file "core/backend/system/executive_flow/alerts.rs" "  - alerts.rs (AlertMemory)"
check_file "core/backend/system/executive_flow/collect.rs" "  - collect.rs (collecte des inputs)"
check_file "core/backend/system/executive_flow/compute.rs" "  - compute.rs (calculs)"
echo ""

# Module #42 - Strategic Intelligence (Intelligence stratégique)
echo "📦 Module #42 - Strategic Intelligence"
check_file "core/backend/system/strategic_intelligence/mod.rs" "  - mod.rs (structure + tick)"
check_file "core/backend/system/strategic_intelligence/trend.rs" "  - trend.rs (TrendMemory)"
check_file "core/backend/system/strategic_intelligence/collect.rs" "  - collect.rs (collecte des inputs)"
check_file "core/backend/system/strategic_intelligence/compute.rs" "  - compute.rs (calculs)"
echo ""

# Module #43 - Intention Engine (Moteur intentionnel)
echo "📦 Module #43 - Intention Engine"
check_file "core/backend/system/intention/mod.rs" "  - mod.rs (structure + tick)"
check_file "core/backend/system/intention/drive.rs" "  - drive.rs (DriveMemory)"
check_file "core/backend/system/intention/collect.rs" "  - collect.rs (collecte des inputs)"
check_file "core/backend/system/intention/compute.rs" "  - compute.rs (calculs)"
echo ""

# Intégration système
echo "🔧 Intégration système"
check_file "core/backend/system/mod.rs" "  - Exports des 4 modules dans system/mod.rs"
check_file "core/backend/main.rs" "  - Intégration dans main.rs"
echo ""

# Résumé
echo "========================================================"
echo "📊 Résumé de la vérification"
echo "   Fichiers trouvés: $found_files / $total_files"
if [ $found_files -eq $total_files ]; then
    echo -e "${GREEN}✅ Tous les fichiers de la couche Executive/Strategic sont présents !${NC}"
    exit 0
else
    missing=$((total_files - found_files))
    echo -e "${RED}❌ $missing fichier(s) manquant(s)${NC}"
    exit 1
fi
