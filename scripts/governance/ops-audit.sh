#!/bin/bash
# TITANE∞ P5 Ops Process Validation
# Audit des processus opérationnels critiques pour certification production

set -euo pipefail

PROJECT_ROOT="/home/titane-os/Documents/GitHub/TITANE_INFINITY"
EVIDENCE_DIR="$PROJECT_ROOT/docs/_evidence"
PHASE="P5"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)

VIOLATIONS=0
WARNINGS=0

echo "🔧 [OPS-AUDIT] TITANE∞ Operational Processes Validation"
echo "======================================================"
echo "📋 Audit des processus opérationnels critiques..."
echo ""

cd "$PROJECT_ROOT"

# OP1: Build Process - Validation pipeline intègre
echo "📋 OP1: BUILD PROCESS - Pipeline de build validé..."

BUILD_SCRIPTS=$(find scripts/build -name "*.sh" 2>/dev/null | wc -l)
if [ "$BUILD_SCRIPTS" -ge 3 ]; then
    echo "✅ OP1 PASS: Scripts build présents ($BUILD_SCRIPTS scripts)"
else
    echo "❌ OP1 VIOLATION: Scripts build insuffisants ($BUILD_SCRIPTS < 3)"
    VIOLATIONS=$((VIOLATIONS + 1))
fi

# Vérifier pipeline tauri
if [ -f "runtime/stable/build.sh" ]; then
    echo "✅ OP1 PASS: Pipeline stable présent"
else
    echo "❌ OP1 VIOLATION: Pipeline stable manquant"
    VIOLATIONS=$((VIOLATIONS + 1))
fi

# OP2: Testing Framework - Coverage et validation
echo ""
echo "📋 OP2: TESTING FRAMEWORK - Tests et couverture..."

TEST_DIRS=$(find . -name "__tests__" -o -name "tests" | grep -v node_modules | wc -l)
if [ "$TEST_DIRS" -ge 2 ]; then
    echo "✅ OP2 PASS: Répertoires tests présents ($TEST_DIRS dirs)"
else
    echo "⚠️ OP2 WARNING: Répertoires tests limités ($TEST_DIRS dirs)"
    WARNINGS=$((WARNINGS + 1))
fi

# Vérifier config tests
if [ -f "jest.config.json" ] && [ -f "playwright.config.ts" ]; then
    echo "✅ OP2 PASS: Configuration tests complète (Jest + Playwright)"
else
    echo "⚠️ OP2 WARNING: Configuration tests partielle"
    WARNINGS=$((WARNINGS + 1))
fi

# OP3: Git Workflow - Branches, hooks, validation
echo ""
echo "📋 OP3: GIT WORKFLOW - Branches et validation..."

BRANCH_SCRIPTS=$(find scripts/git -name "*.sh" 2>/dev/null | wc -l)
if [ "$BRANCH_SCRIPTS" -ge 3 ]; then
    echo "✅ OP3 PASS: Scripts git workflow présents ($BRANCH_SCRIPTS scripts)"
else
    echo "⚠️ OP3 WARNING: Scripts git workflow limités ($BRANCH_SCRIPTS scripts)"
    WARNINGS=$((WARNINGS + 1))
fi

# Vérifier dual-runtime
if git branch -a | grep -q "stable-runtime"; then
    echo "✅ OP3 PASS: Dual-runtime branches détectées"
else
    echo "⚠️ OP3 WARNING: Branches dual-runtime non détectées"
    WARNINGS=$((WARNINGS + 1))
fi

# OP4: CI/CD Gates - Automation validation
echo ""
echo "📋 OP4: CI/CD GATES - Automation et validation..."

CI_WORKFLOWS=$(find .github/workflows -name "*.yml" 2>/dev/null | wc -l)
if [ "$CI_WORKFLOWS" -ge 4 ]; then
    echo "✅ OP4 PASS: Workflows CI présents ($CI_WORKFLOWS workflows)"
else
    echo "❌ OP4 VIOLATION: Workflows CI insuffisants ($CI_WORKFLOWS < 4)"
    VIOLATIONS=$((VIOLATIONS + 1))
fi

# Vérifier gates critiques
CRITICAL_GATES=$(find .github/workflows -name "*-guard.yml" 2>/dev/null | wc -l)
if [ "$CRITICAL_GATES" -ge 3 ]; then
    echo "✅ OP4 PASS: Gates critiques présents ($CRITICAL_GATES gates)"
else
    echo "❌ OP4 VIOLATION: Gates critiques insuffisants ($CRITICAL_GATES < 3)"
    VIOLATIONS=$((VIOLATIONS + 1))
fi

# OP5: Safe-Run Framework - Gouvernance processus
echo ""
echo "📋 OP5: SAFE-RUN FRAMEWORK - Gouvernance processus..."

if [ -f "scripts/maintenance/safe-run.sh" ]; then
    echo "✅ OP5 PASS: Safe-run wrapper présent"
else
    echo "❌ OP5 VIOLATION: Safe-run wrapper manquant"
    VIOLATIONS=$((VIOLATIONS + 1))
fi

SAFE_TASKS=$(grep -E "Safe-Run:" .vscode/tasks.json 2>/dev/null | wc -l)
if [ "$SAFE_TASKS" -ge 3 ]; then
    echo "✅ OP5 PASS: Tâches safe-run présentes ($SAFE_TASKS tâches)"
else
    echo "⚠️ OP5 WARNING: Tâches safe-run limitées ($SAFE_TASKS tâches)"
    WARNINGS=$((WARNINGS + 1))
fi

# OP6: Documentation Ops - Guides opérationnels
echo ""
echo "📋 OP6: DOCUMENTATION OPS - Guides opérationnels..."

OPS_DOCS=$(find docs -name "*STATUS*" -o -name "*GUIDE*" -o -name "*PROCESS*" 2>/dev/null | wc -l)
if [ "$OPS_DOCS" -ge 5 ]; then
    echo "✅ OP6 PASS: Documentation ops présente ($OPS_DOCS docs)"
else
    echo "⚠️ OP6 WARNING: Documentation ops limitée ($OPS_DOCS docs)"
    WARNINGS=$((WARNINGS + 1))
fi

# OP7: Security Ops - Processus sécurité
echo ""
echo "📋 OP7: SECURITY OPS - Processus sécurité..."

SEC_SCRIPTS=$(find scripts/security -name "*.sh" 2>/dev/null | wc -l)
if [ "$SEC_SCRIPTS" -ge 3 ]; then
    echo "✅ OP7 PASS: Scripts sécurité présents ($SEC_SCRIPTS scripts)"
else
    echo "❌ OP7 VIOLATION: Scripts sécurité insuffisants ($SEC_SCRIPTS < 3)"
    VIOLATIONS=$((VIOLATIONS + 1))
fi

# Evidence collection
echo ""
echo "📋 Génération evidence P5..."
mkdir -p "$EVIDENCE_DIR/p5"

cat > "$EVIDENCE_DIR/p5/${PHASE}_ops_audit_${TIMESTAMP}.txt" << EOF
TITANE∞ P5 Ops Process Validation Report
========================================
Timestamp: $(date -Iseconds)
Repository: $(pwd)
Branch: $(git rev-parse --abbrev-ref HEAD)
Commit: $(git rev-parse HEAD)

RESULTS SUMMARY:
- Violations: $VIOLATIONS
- Warnings: $WARNINGS
- Status: $([ $VIOLATIONS -eq 0 ] && echo "PASS" || echo "FAIL")

OPERATIONAL PROCESSES AUDIT:
OP1 BUILD PROCESS: $([ -f "runtime/stable/build.sh" ] && echo "PASS" || echo "FAIL")
OP2 TESTING FRAMEWORK: $([ -f "jest.config.json" ] && [ -f "playwright.config.ts" ] && echo "PASS" || echo "WARNING")
OP3 GIT WORKFLOW: $(git branch -a | grep -q "stable-runtime" && echo "PASS" || echo "WARNING")
OP4 CI/CD GATES: $([[ $CI_WORKFLOWS -ge 4 && $CRITICAL_GATES -ge 3 ]] && echo "PASS" || echo "FAIL")
OP5 SAFE-RUN FRAMEWORK: $([ -f "scripts/maintenance/safe-run.sh" ] && echo "PASS" || echo "FAIL")
OP6 DOCUMENTATION OPS: $([[ $OPS_DOCS -ge 5 ]] && echo "PASS" || echo "WARNING")
OP7 SECURITY OPS: $([[ $SEC_SCRIPTS -ge 3 ]] && echo "PASS" || echo "FAIL")

DETAILED METRICS:
- Build scripts: $BUILD_SCRIPTS
- Test directories: $TEST_DIRS
- Git workflow scripts: $BRANCH_SCRIPTS
- CI workflows: $CI_WORKFLOWS
- Critical gates: $CRITICAL_GATES
- Safe-run tasks: $SAFE_TASKS
- Ops documentation: $OPS_DOCS
- Security scripts: $SEC_SCRIPTS

RECOMMENDATIONS:
$([ $VIOLATIONS -gt 0 ] && echo "- Corriger $VIOLATIONS violation(s) critique(s)" || echo "- Processus opérationnels validés")
$([ $WARNINGS -gt 0 ] && echo "- Améliorer $WARNINGS warning(s) processus" || echo "- Qualité opérationnelle optimale")
EOF

# Result
echo ""
if [ $VIOLATIONS -eq 0 ]; then
    echo "✅ OPS-AUDIT: PASS - Processus opérationnels validés"
    echo "📊 Violations: $VIOLATIONS, Warnings: $WARNINGS"
    echo "📄 Evidence: ${PHASE}_ops_audit_${TIMESTAMP}.txt"
    exit 0
else
    echo "❌ OPS-AUDIT: FAIL - $VIOLATIONS violations critiques"
    echo "📊 Warnings: $WARNINGS"
    echo "🔧 SOLUTION: Corriger processus avant certification"
    echo "📄 Audit: ${PHASE}_ops_audit_${TIMESTAMP}.txt"
    exit 1
fi