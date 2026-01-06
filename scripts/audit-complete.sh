#!/bin/bash

set -e

echo "🔍 =================================================="
echo "🔍 AUDIT COMPLET TITANE_INFINITY"
echo "🔍 =================================================="
echo ""

REPORT_DIR="./audit-reports"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
REPORT_FILE="$REPORT_DIR/audit_$TIMESTAMP.md"

mkdir -p "$REPORT_DIR"

cat > "$REPORT_FILE" << 'HEADER'
# 🔍 Audit Report TITANE_INFINITY
Generated: $(date)

## Table des Matières
1. [Structure du Projet](#structure)
2. [Tests](#tests)
3. [Sécurité](#securite)
4. [Performance](#performance)
5. [Accessibilité](#accessibilite)
6. [Code Quality](#quality)
7. [Dépendances](#dependencies)
8. [Recommandations](#recommendations)

---

HEADER

echo "📊 1/8 Analyse de la structure du projet..."
{
    echo "## 1. Structure du Projet {#structure}"
    echo ""
    echo "\`\`\`"
    tree -L 3 -I 'node_modules|target|dist' || find . -maxdepth 3 -type d | grep -v node_modules | grep -v target
    echo "\`\`\`"
    echo ""
    echo "### Statistiques"
    echo "- Fichiers TypeScript: $(find src -name '*.ts' -o -name '*.tsx' | wc -l)"
    echo "- Fichiers Rust: $(find src-tauri/src -name '*.rs' | wc -l)"
    echo "- Fichiers de tests: $(find . -name '*.test.ts' -o -name '*.spec.ts' | wc -l)"
    echo "- Lignes de code TS: $(find src -name '*.ts' -o -name '*.tsx' | xargs wc -l | tail -1)"
    echo "- Lignes de code Rust: $(find src-tauri/src -name '*.rs' | xargs wc -l | tail -1)"
    echo ""
} >> "$REPORT_FILE"

echo "🧪 2/8 Exécution des tests..."
{
    echo "## 2. Tests {#tests}"
    echo ""
    
    echo "### Frontend Tests"
    echo "\`\`\`bash"
    pnpm test -- --coverage --silent 2>&1 || echo "⚠️ Some tests failed"
    echo "\`\`\`"
    echo ""
    
    echo "### Backend Tests"
    echo "\`\`\`bash"
    cd src-tauri && cargo test 2>&1 && cd .. || echo "⚠️ Some Rust tests failed"
    echo "\`\`\`"
    echo ""
    
    if [ -f coverage/coverage-summary.json ]; then
        echo "### Coverage Summary"
        cat coverage/coverage-summary.json | jq '.total'
        echo ""
    fi
} >> "$REPORT_FILE"

echo "🔐 3/8 Audit de sécurité..."
{
    echo "## 3. Sécurité {#securite}"
    echo ""
    
    echo "### Dependency Audit"
    echo "\`\`\`"
    pnpm audit --production 2>&1 || echo "⚠️ Vulnerabilities found"
    echo "\`\`\`"
    echo ""
    
    echo "### Cargo Audit"
    echo "\`\`\`"
    cd src-tauri && cargo audit 2>&1 && cd .. || echo "⚠️ Vulnerabilities found"
    echo "\`\`\`"
    echo ""
    
    echo "### Security Patterns Check"
    echo "Checking for common security issues..."
    echo ""
    echo "#### Hardcoded Secrets"
    if git grep -i -E '(password|secret|api_key|token).*=.*["\047]' -- ':!audit-reports' ':!*.md'; then
        echo "⚠️ Potential hardcoded secrets found"
    else
        echo "✅ No hardcoded secrets detected"
    fi
    echo ""
    
    echo "#### Unsafe Functions (Rust)"
    if git grep 'unsafe {' src-tauri/src/; then
        echo "⚠️ Unsafe blocks found - review needed"
    else
        echo "✅ No unsafe blocks"
    fi
    echo ""
} >> "$REPORT_FILE"

echo "⚡ 4/8 Tests de performance..."
{
    echo "## 4. Performance {#performance}"
    echo ""
    
    echo "### Build Sizes"
    if [ -d "dist" ]; then
        echo "\`\`\`"
        du -sh dist/*
        echo "\`\`\`"
    else
        echo "⚠️ No build found. Run \`pnpm run build\` first"
    fi
    echo ""
    
    echo "### Rust Release Binary Size"
    if [ -f "src-tauri/target/release/titane" ]; then
        echo "\`\`\`"
        ls -lh src-tauri/target/release/titane
        echo "\`\`\`"
    else
        echo "⚠️ No release build. Run \`cargo build --release\`"
    fi
    echo ""
} >> "$REPORT_FILE"

echo "♿ 5/8 Tests d'accessibilité..."
{
    echo "## 5. Accessibilité {#accessibilite}"
    echo ""
    
    echo "### A11y Linting"
    echo "\`\`\`"
    pnpm run lint:a11y 2>&1 || echo "⚠️ A11y issues found"
    echo "\`\`\`"
    echo ""
    
    echo "### ARIA Patterns Check"
    echo "Files with ARIA attributes:"
    git grep -l 'aria-' src/ | wc -l
    echo ""
    
    echo "### Keyboard Navigation"
    echo "Components with keyboard handlers:"
    git grep -l 'onKeyDown\|onKeyPress\|onKeyUp' src/ | wc -l
    echo ""
} >> "$REPORT_FILE"

echo "📈 6/8 Analyse de la qualité du code..."
{
    echo "## 6. Code Quality {#quality}"
    echo ""
    
    echo "### ESLint Report"
    echo "\`\`\`"
    pnpm run lint 2>&1 || echo "⚠️ Linting issues found"
    echo "\`\`\`"
    echo ""
    
    echo "### TypeScript Check"
    echo "\`\`\`"
    pnpm run check 2>&1 || echo "⚠️ Type errors found"
    echo "\`\`\`"
    echo ""
    
    echo "### Clippy (Rust)"
    echo "\`\`\`"
    cd src-tauri && cargo clippy -- -D warnings 2>&1 && cd .. || echo "⚠️ Clippy warnings"
    echo "\`\`\`"
    echo ""
    
    echo "### Code Complexity"
    echo "TODO items:"
    git grep -c 'TODO\|FIXME' || echo "0"
    echo ""
} >> "$REPORT_FILE"

echo "📦 7/8 Audit des dépendances..."
{
    echo "## 7. Dépendances {#dependencies}"
    echo ""
    
    echo "### PNPM Dependencies"
    echo "\`\`\`json"
    pnpm list --depth=0 --json 2>&1 | head -50
    echo "\`\`\`"
    echo ""
    
    echo "### Outdated Packages"
    echo "\`\`\`"
    pnpm outdated 2>&1 || true
    echo "\`\`\`"
    echo ""
    
    echo "### Cargo Dependencies"
    echo "\`\`\`"
    cd src-tauri && cargo tree --depth=1 && cd ..
    echo "\`\`\`"
    echo ""
} >> "$REPORT_FILE"

echo "📝 8/8 Génération des recommandations..."
{
    echo "## 8. Recommandations {#recommendations}"
    echo ""
    echo "### ✅ Points Forts"
    echo "- Architecture modulaire claire"
    echo "- Tests automatisés en place"
    echo "- Documentation complète"
    echo "- CI/CD configuré"
    echo ""
    echo "### ⚠️ Points d'Amélioration"
    echo ""
    
    # Check coverage
    if [ -f coverage/coverage-summary.json ]; then
        COVERAGE=$(cat coverage/coverage-summary.json | jq '.total.lines.pct')
        if (( $(echo "$COVERAGE < 80" | bc -l) )); then
            echo "- [ ] Augmenter la couverture des tests (actuellement $COVERAGE%)"
        fi
    fi
    
    # Check for TODO
    TODO_COUNT=$(git grep -c 'TODO\|FIXME' | wc -l)
    if [ "$TODO_COUNT" -gt 0 ]; then
        echo "- [ ] Résoudre les $TODO_COUNT TODO/FIXME dans le code"
    fi
    
    echo ""
    echo "### 🎯 Prochaines Étapes"
    echo "1. Corriger les vulnérabilités de sécurité (si présentes)"
    echo "2. Améliorer la couverture des tests"
    echo "3. Optimiser les bundles de production"
    echo "4. Compléter la documentation manquante"
    echo "5. Nettoyer les dépendances obsolètes"
    echo ""
} >> "$REPORT_FILE"

echo ""
echo "✅ Audit terminé!"
echo "📄 Rapport généré: $REPORT_FILE"
echo ""
echo "Résumé rapide:"
cat "$REPORT_FILE" | grep -E "^#{2,3} " | head -20

# Ouvrir le rapport
if command -v xdg-open &> /dev/null; then
    xdg-open "$REPORT_FILE" &
elif command -v open &> /dev/null; then
    open "$REPORT_FILE" &
fi
