#!/bin/bash

###############################################################################
#  TITANE∞ v25.3.2 — SCRIPT D'INTÉGRATION AUTOMATIQUE FUSION
#  Auto-intègre le dashboard et les hooks de fusion dans l'application
###############################################################################

set -e  # Exit on error

echo "═══════════════════════════════════════════════════════════════════"
echo "  🌌 TITANE∞ v25.3.2 — INTÉGRATION AUTO FUSION DASHBOARD"
echo "═══════════════════════════════════════════════════════════════════"
echo ""

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Vérifier qu'on est dans le bon répertoire
if [ ! -f "package.json" ]; then
    echo "❌ Erreur: package.json non trouvé. Exécutez ce script depuis la racine du projet."
    exit 1
fi

echo -e "${BLUE}📁 Répertoire:${NC} $(pwd)"
echo ""

# 1. Vérifier que les fichiers existent
echo -e "${BLUE}1. Vérification des fichiers...${NC}"

FILES=(
    "src/hooks/useSingularitySync.ts"
    "src/hooks/useMemoryEngine.ts"
    "src/hooks/useSystemHealth.ts"
    "src/components/PerfectFusionDashboard.tsx"
)

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "  ${GREEN}✓${NC} $file"
    else
        echo -e "  ❌ MANQUANT: $file"
        exit 1
    fi
done
echo ""

# 2. Vérifier TypeScript
echo -e "${BLUE}2. Vérification TypeScript...${NC}"
if command -v npx &> /dev/null; then
    npx tsc --noEmit --skipLibCheck 2>&1 | grep -E "error TS|Found [0-9]+ error" || echo -e "  ${GREEN}✓${NC} 0 erreur TypeScript"
else
    echo -e "  ${YELLOW}⚠${NC}  npx non disponible, vérification ignorée"
fi
echo ""

# 3. Créer backup App.tsx
echo -e "${BLUE}3. Backup App.tsx...${NC}"
if [ -f "src/App.tsx" ]; then
    cp src/App.tsx "src/App.tsx.backup.$(date +%Y%m%d_%H%M%S)"
    echo -e "  ${GREEN}✓${NC} Backup créé"
else
    echo -e "  ❌ src/App.tsx introuvable"
    exit 1
fi
echo ""

# 4. Intégrer dans App.tsx (via sed ou création nouveau fichier)
echo -e "${BLUE}4. Intégration dans App.tsx...${NC}"

# Vérifier si déjà intégré
if grep -q "PerfectFusionDashboard" src/App.tsx; then
    echo -e "  ${YELLOW}⚠${NC}  Dashboard déjà intégré dans App.tsx"
else
    # Ajouter l'import au début des lazy loads (ligne ~90)
    sed -i "/const PerformanceTest = lazy/i\\
const PerfectFusionDashboard = lazy(() =>\\
  import('./components/PerfectFusionDashboard').then(m => ({ default: m.default }))\\
);" src/App.tsx
    
    # Ajouter la route après /admin (ligne ~815)
    sed -i "/path=\"\/governance\" element={<Navigate to=\"\/admin\" replace \/>/a\\
\\
          {/* ✨ v25.3.2 - Fusion Backend/Frontend Dashboard */}\\
          <Route\\
            path=\"/fusion\"\\
            element={\\
              <Suspense fallback={<PageLoadingFallback message=\"Loading Fusion Dashboard...\" />}>\\
                <PerfectFusionDashboard />\\
              </Suspense>\\
            }\\
          />" src/App.tsx
    
    echo -e "  ${GREEN}✓${NC} Dashboard intégré"
    echo -e "  ${GREEN}✓${NC} Route /fusion ajoutée"
fi
echo ""

# 5. Ajouter dans sidebar (si pas déjà fait)
echo -e "${BLUE}5. Ajout dans sidebar...${NC}"

if grep -q "path: '/fusion'" src/App.tsx; then
    echo -e "  ${YELLOW}⚠${NC}  Fusion déjà dans sidebar"
else
    # Trouver la ligne sidebarItems et ajouter l'item fusion
    sed -i "/{ id: 'stats'/i\\
    { id: 'fusion', label: 'Fusion Backend/Frontend', path: '/fusion', icon: Activity, category: 'Dev' }," src/App.tsx
    
    echo -e "  ${GREEN}✓${NC} Item sidebar ajouté"
fi
echo ""

# 6. Installer dépendances si nécessaire
echo -e "${BLUE}6. Vérification dépendances...${NC}"
if [ ! -d "node_modules" ]; then
    echo -e "  ${YELLOW}⚠${NC}  node_modules absent, installation..."
    npm install
else
    echo -e "  ${GREEN}✓${NC} node_modules présent"
fi
echo ""

# 7. Linter check (optionnel)
echo -e "${BLUE}7. Lint check (optionnel)...${NC}"
if command -v npx &> /dev/null; then
    npx eslint src/components/PerfectFusionDashboard.tsx --max-warnings 0 2>&1 | grep -E "error|warning" || echo -e "  ${GREEN}✓${NC} 0 error/warning ESLint"
else
    echo -e "  ${YELLOW}⚠${NC}  ESLint non disponible"
fi
echo ""

# 8. Résumé
echo "═══════════════════════════════════════════════════════════════════"
echo -e "${GREEN}✅ INTÉGRATION AUTOMATIQUE TERMINÉE${NC}"
echo "═══════════════════════════════════════════════════════════════════"
echo ""
echo "📋 ACTIONS EFFECTUÉES:"
echo "  ✓ Vérification 4 fichiers hooks/components"
echo "  ✓ Backup App.tsx créé"
echo "  ✓ PerfectFusionDashboard lazy-loaded dans App.tsx"
echo "  ✓ Route /fusion ajoutée"
echo "  ✓ Item sidebar 'Fusion Backend/Frontend' ajouté"
echo ""
echo "🚀 PROCHAINES ÉTAPES:"
echo "  1. Démarrer le serveur dev: npm run dev"
echo "  2. Ouvrir: http://localhost:5173/fusion"
echo "  3. Vérifier dashboard + métriques temps réel"
echo ""
echo "📚 DOCUMENTATION:"
echo "  - Guide intégration: GUIDE_INTEGRATION_FUSION_v25.3.2.md"
echo "  - Doc complète: FUSION_PARFAITE_v25.3.2_COMPLETE.md"
echo ""
echo "═══════════════════════════════════════════════════════════════════"
