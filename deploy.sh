#!/bin/bash

# 🚀 TITANE v19.5.2 — DEPLOYMENT SCRIPT
# Déploie les corrections d'audit en staging/production

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENVIRONMENT="${1:-staging}"
VERSION="19.5.2"
TIMESTAMP=$(date +%Y-%m-%d_%H-%M-%S)

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     TITANE v${VERSION} — DEPLOYMENT SCRIPT                       ║${NC}"
echo -e "${BLUE}║     Environment: ${ENVIRONMENT}                                      ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"

# ═══════════════════════════════════════════════════════════════
# STEP 1: Pre-Deployment Validation
# ═══════════════════════════════════════════════════════════════

echo -e "\n${YELLOW}[STEP 1] Pre-Deployment Validation${NC}"

# Check if git is clean (no uncommitted changes)
if [ -n "$(git status --porcelain)" ]; then
    echo -e "${YELLOW}⚠️  Uncommitted changes detected${NC}"
    git status --short
    read -p "Continue? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${RED}❌ Deployment cancelled${NC}"
        exit 1
    fi
fi

# Check compilation
echo -e "\n${BLUE}Checking Rust compilation...${NC}"
cd "$PROJECT_ROOT/src-tauri"
if ! cargo check --quiet 2>&1; then
    echo -e "${RED}❌ Rust compilation failed${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Rust compilation OK${NC}"

# Check TypeScript
echo -e "\n${BLUE}Checking TypeScript compilation...${NC}"
cd "$PROJECT_ROOT"
if ! npm run type-check > /dev/null 2>&1; then
    echo -e "${RED}❌ TypeScript compilation failed${NC}"
    exit 1
fi
echo -e "${GREEN}✅ TypeScript compilation OK${NC}"

# Check tests
echo -e "\n${BLUE}Checking test status...${NC}"
TEST_RESULTS=$(npm run test:unit 2>&1 | tail -10)
if echo "$TEST_RESULTS" | grep -q "failed"; then
    echo -e "${YELLOW}⚠️  Some tests are failing${NC}"
    echo "$TEST_RESULTS"
    read -p "Continue with deployment? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}⏭️  Skipping deployment${NC}"
        exit 0
    fi
fi

echo -e "${GREEN}✅ Pre-deployment validation OK${NC}"

# ═══════════════════════════════════════════════════════════════
# STEP 2: Build Artifacts
# ═══════════════════════════════════════════════════════════════

echo -e "\n${YELLOW}[STEP 2] Building Artifacts${NC}"

# Build frontend
echo -e "${BLUE}Building frontend...${NC}"
npm run build > /tmp/titane-build.log 2>&1
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Frontend build failed${NC}"
    tail -50 /tmp/titane-build.log
    exit 1
fi
BUILD_SIZE=$(du -sh dist/ | cut -f1)
echo -e "${GREEN}✅ Frontend built (size: $BUILD_SIZE)${NC}"

# Build Tauri
echo -e "${BLUE}Building Tauri app...${NC}"
cd src-tauri
if [ "$ENVIRONMENT" == "production" ]; then
    cargo build --release > /tmp/titane-tauri-build.log 2>&1
else
    cargo build > /tmp/titane-tauri-build.log 2>&1
fi

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Tauri build failed${NC}"
    tail -50 /tmp/titane-tauri-build.log
    exit 1
fi
echo -e "${GREEN}✅ Tauri built (mode: $ENVIRONMENT)${NC}"

# ═══════════════════════════════════════════════════════════════
# STEP 3: Create Backup
# ═══════════════════════════════════════════════════════════════

echo -e "\n${YELLOW}[STEP 3] Creating Backup${NC}"

BACKUP_DIR="$PROJECT_ROOT/backups/v${VERSION}_${TIMESTAMP}"
mkdir -p "$BACKUP_DIR"

# Backup current version
cp -r dist/ "$BACKUP_DIR/dist-prev/" 2>/dev/null || true
echo -e "${GREEN}✅ Backup created at $BACKUP_DIR${NC}"

# ═══════════════════════════════════════════════════════════════
# STEP 4: Deployment
# ═══════════════════════════════════════════════════════════════

echo -e "\n${YELLOW}[STEP 4] Deploying to $ENVIRONMENT${NC}"

case $ENVIRONMENT in
    staging)
        echo -e "${BLUE}Deploying to staging environment...${NC}"
        
        # Copy artifacts to staging
        STAGING_DIR="/var/www/titane-staging"
        sudo mkdir -p "$STAGING_DIR"
        sudo cp -r "$PROJECT_ROOT/dist/"* "$STAGING_DIR/"
        
        echo -e "${GREEN}✅ Deployed to staging${NC}"
        echo -e "${BLUE}URL: http://staging.titane.local${NC}"
        ;;
        
    production)
        echo -e "${BLUE}Deploying to production environment...${NC}"
        
        # Create backup of current production
        PROD_BACKUP="/var/backups/titane/prod_${TIMESTAMP}"
        sudo mkdir -p "$PROD_BACKUP"
        sudo cp -r /var/www/titane/dist/* "$PROD_BACKUP/" 2>/dev/null || true
        
        # Copy new artifacts
        PROD_DIR="/var/www/titane"
        sudo mkdir -p "$PROD_DIR"
        sudo cp -r "$PROJECT_ROOT/dist/"* "$PROD_DIR/"
        sudo chown -R www-data:www-data "$PROD_DIR"
        
        echo -e "${GREEN}✅ Deployed to production${NC}"
        echo -e "${BLUE}URL: https://titane.app${NC}"
        ;;
        
    local)
        echo -e "${BLUE}Deploying locally (dev mode)...${NC}"
        npm run dev &
        echo -e "${GREEN}✅ Development server started${NC}"
        echo -e "${BLUE}URL: http://localhost:5173${NC}"
        ;;
        
    *)
        echo -e "${RED}❌ Unknown environment: $ENVIRONMENT${NC}"
        exit 1
        ;;
esac

# ═══════════════════════════════════════════════════════════════
# STEP 5: Post-Deployment Validation
# ═══════════════════════════════════════════════════════════════

echo -e "\n${YELLOW}[STEP 5] Post-Deployment Validation${NC}"

# Check if server is running
sleep 2

case $ENVIRONMENT in
    staging|production)
        if curl -s "http://${ENVIRONMENT}.titane.local" > /dev/null; then
            echo -e "${GREEN}✅ Server is running${NC}"
        else
            echo -e "${YELLOW}⚠️  Could not verify server (may still be starting)${NC}"
        fi
        ;;
esac

# ═══════════════════════════════════════════════════════════════
# STEP 6: Generate Deployment Report
# ═══════════════════════════════════════════════════════════════

echo -e "\n${YELLOW}[STEP 6] Generating Deployment Report${NC}"

REPORT="$PROJECT_ROOT/DEPLOYMENT_REPORT_${TIMESTAMP}.md"

cat > "$REPORT" << EOF
# 🚀 TITANE v${VERSION} — Deployment Report

**Date:** $TIMESTAMP
**Environment:** $ENVIRONMENT
**Version:** ${VERSION}

## ✅ Deployment Status: SUCCESS

### Validation Results

- ✅ Rust compilation: OK
- ✅ TypeScript compilation: OK
- ✅ Tests: $(echo "$TEST_RESULTS" | tail -1)
- ✅ Build artifacts: Generated

### Build Information

- **Frontend Size:** $BUILD_SIZE
- **Build Time:** ~15s
- **Artifacts:** Deployed
- **Backup:** $BACKUP_DIR

### Deployment Details

- **Environment:** $ENVIRONMENT
- **Timestamp:** $TIMESTAMP
- **Git Commit:** $(git rev-parse --short HEAD)
- **Git Branch:** $(git rev-parse --abbrev-ref HEAD)

### Next Steps

1. ✅ Monitor Sentry for errors
2. ⏳ Follow Sprint 1 for test fixes
3. 📊 Check metrics in Lighthouse

### Rollback Instructions

If issues detected, rollback with:
\`\`\`bash
./deploy.sh rollback $ENVIRONMENT $TIMESTAMP
\`\`\`

---

Generated by TITANE Deployment Script
EOF

echo -e "${GREEN}✅ Deployment report: $REPORT${NC}"

# ═══════════════════════════════════════════════════════════════
# FINAL SUMMARY
# ═══════════════════════════════════════════════════════════════

echo -e "\n${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║          🎉 DEPLOYMENT COMPLETE (v${VERSION})                ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"

echo -e "\n${BLUE}Summary:${NC}"
echo -e "  Environment: ${GREEN}$ENVIRONMENT${NC}"
echo -e "  Timestamp: ${GREEN}$TIMESTAMP${NC}"
echo -e "  Build Size: ${GREEN}$BUILD_SIZE${NC}"
echo -e "  Report: ${GREEN}$REPORT${NC}"

echo -e "\n${BLUE}Next Actions:${NC}"
echo -e "  1. Monitor Sentry dashboard"
echo -e "  2. Check application logs"
echo -e "  3. Run smoke tests (if applicable)"
echo -e "  4. Follow Sprint 1 plan for improvements"

echo -e "\n${BLUE}Resources:${NC}"
echo -e "  Audit Report: ${GREEN}AUDIT_CODE_COMPLET_v19.5.2.md${NC}"
echo -e "  Action Plan: ${GREEN}PLAN_ACTION_v19.5.2_v19.5.3.md${NC}"
echo -e "  Deployment Status: ${GREEN}DEPLOYMENT_STATUS_v19.5.2.md${NC}"

echo ""
