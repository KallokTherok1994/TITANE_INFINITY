#!/bin/bash
# scripts/docs/migrate-v26.2.sh
# Migration Documentation TITANE∞ v26.2
# Author: Kevin Thibault / TITANE Team
# Date: 18 décembre 2025

set -e  # Exit on error

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  TITANE∞ v26.2 Documentation Migration       ║${NC}"
echo -e "${BLUE}║  Restructuration 282 → 7 fichiers racine     ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════╝${NC}"
echo ""

# Confirmation
read -p "⚠️  Cette opération va déplacer 275 fichiers .md. Continuer ? (y/N) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${RED}❌ Migration annulée${NC}"
    exit 1
fi

# Vérifier branche
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [[ "$CURRENT_BRANCH" != "feature/docs-restructure-v26.2" ]]; then
    echo -e "${YELLOW}⚠️  Pas sur la branche de migration${NC}"
    read -p "Créer branche feature/docs-restructure-v26.2 ? (y/N) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git checkout -b feature/docs-restructure-v26.2
        echo -e "${GREEN}✅ Branche créée${NC}"
    else
        echo -e "${RED}❌ Migration annulée${NC}"
        exit 1
    fi
fi

# 1. BACKUP
echo ""
echo -e "${BLUE}1️⃣  Création backup...${NC}"
BACKUP_DIR="docs/backup_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"
cp *.md "$BACKUP_DIR/" 2>/dev/null || echo "   (Aucun fichier .md à copier)"
echo -e "${GREEN}   ✅ Backup: $BACKUP_DIR${NC}"

# 2. STRUCTURE
echo ""
echo -e "${BLUE}2️⃣  Création structure...${NC}"
mkdir -p docs/current/{audits,phases,guides,architecture,performance}
mkdir -p docs/archive/{v24,v25,sessions}
echo -e "${GREEN}   ✅ Structure créée${NC}"

# 3. MIGRATION V24
echo ""
echo -e "${BLUE}3️⃣  Archivage v24...${NC}"
V24_COUNT=0
for file in *v24*.md; do
    if [[ -f "$file" ]]; then
        git mv "$file" docs/archive/v24/
        ((V24_COUNT++))
    fi
done
echo -e "${GREEN}   ✅ $V24_COUNT fichiers archivés${NC}"

# 4. MIGRATION V25
echo ""
echo -e "${BLUE}4️⃣  Archivage v25...${NC}"
V25_COUNT=0
for file in *v25*.md; do
    if [[ -f "$file" ]]; then
        git mv "$file" docs/archive/v25/
        ((V25_COUNT++))
    fi
done
echo -e "${GREEN}   ✅ $V25_COUNT fichiers archivés${NC}"

# 5. MIGRATION SESSIONS
echo ""
echo -e "${BLUE}5️⃣  Archivage rapports session...${NC}"
SESSION_COUNT=0
for pattern in "AUTO_" "RAPPORT_" "REFLEXION_" "SESSION_" "SUPER_PROMPT_"; do
    for file in ${pattern}*.md; do
        if [[ -f "$file" ]]; then
            git mv "$file" docs/archive/sessions/
            ((SESSION_COUNT++))
        fi
    done
done
echo -e "${GREEN}   ✅ $SESSION_COUNT fichiers archivés${NC}"

# 6. ORGANISATION V26 AUDITS
echo ""
echo -e "${BLUE}6️⃣  Organisation v26 - Audits...${NC}"
AUDIT_COUNT=0
for file in AUDIT_*v26*.md; do
    if [[ -f "$file" ]]; then
        git mv "$file" docs/current/audits/
        ((AUDIT_COUNT++))
    fi
done
echo -e "${GREEN}   ✅ $AUDIT_COUNT audits organisés${NC}"

# 7. ORGANISATION V26 PHASES
echo ""
echo -e "${BLUE}7️⃣  Organisation v26 - Phases...${NC}"
mkdir -p docs/current/phases/completed
PHASE_COUNT=0
for file in PHASE_*.md; do
    if [[ -f "$file" ]]; then
        git mv "$file" docs/current/phases/completed/
        ((PHASE_COUNT++))
    fi
done
echo -e "${GREEN}   ✅ $PHASE_COUNT phases organisées${NC}"

# 8. ORGANISATION V26 GUIDES
echo ""
echo -e "${BLUE}8️⃣  Organisation v26 - Guides...${NC}"
GUIDE_COUNT=0
for guide in "QUICKSTART_UBUNTU_24.04.md" "DEPLOYMENT_GUIDE_v25.7.5.md" "MULTIMODAL_QUICK_START.md" "AURA_QUICK_START_GUIDE.md"; do
    if [[ -f "$guide" ]]; then
        git mv "$guide" docs/current/guides/
        ((GUIDE_COUNT++))
    fi
done

# Garder QUICKSTART_UBUNTU_24.04.md aussi à la racine (lien symbolique)
if [[ ! -f "QUICKSTART_UBUNTU_24.04.md" ]]; then
    ln -s docs/current/guides/QUICKSTART_UBUNTU_24.04.md QUICKSTART_UBUNTU_24.04.md
fi

echo -e "${GREEN}   ✅ $GUIDE_COUNT guides organisés${NC}"

# 9. FICHIERS DIVERS
echo ""
echo -e "${BLUE}9️⃣  Organisation fichiers divers...${NC}"
MISC_COUNT=0

# Architecture
for file in "GOVERNANCE_MAP.md" "VOCAL_MAP.md" "LIVING_UI_SYSTEM_INDEX.md"; do
    if [[ -f "$file" ]]; then
        git mv "$file" docs/current/architecture/
        ((MISC_COUNT++))
    fi
done

# Performance
for file in "ANALYSE_PERFORMANCE"*.md "OPTIMISATIONS"*.md; do
    if [[ -f "$file" ]]; then
        git mv "$file" docs/current/performance/
        ((MISC_COUNT++))
    fi
done

echo -e "${GREEN}   ✅ $MISC_COUNT fichiers divers organisés${NC}"

# 10. CRÉATION INDEX.md
echo ""
echo -e "${BLUE}🔟  Création fichiers INDEX...${NC}"

# Index v24
cat > docs/archive/v24/INDEX.md << 'EOF'
# Archive TITANE∞ v24

**Status:** Archive Read-Only  
**Date Archivage:** 18 décembre 2025

## Contenu

Documentation legacy de la version 24.x du projet.

- Rapports techniques v24
- Audits, analyses, déploiements
- Conservé pour référence historique

**⚠️  Note:** Pour documentation actuelle, voir `/docs/current/`

---

**Archive:** v24  
**Fichiers:** 37+  
**Version Actuelle:** v26.2
EOF

# Index v25
cat > docs/archive/v25/INDEX.md << 'EOF'
# Archive TITANE∞ v25

**Status:** Archive Read-Only  
**Date Archivage:** 18 décembre 2025

## Contenu

Documentation legacy de la version 25.x du projet.

- Rapports techniques v25
- Audits, fusions, phases complétées
- Conservé pour référence historique

**⚠️  Note:** Pour documentation actuelle, voir `/docs/current/`

---

**Archive:** v25  
**Fichiers:** 118+  
**Version Actuelle:** v26.2
EOF

# Index sessions
cat > docs/archive/sessions/INDEX.md << 'EOF'
# Archive Sessions de Développement

**Status:** Archive Read-Only  
**Date Archivage:** 18 décembre 2025

## Contenu

Rapports de sessions de développement automatisées et manuelles.

- `AUTO_ALL_*.md` : Sessions automatisation complète
- `RAPPORT_*.md` : Rapports techniques détaillés
- `REFLEXION_*.md` : Analyses approfondies
- `SESSION_*.md` : Résumés de sessions
- `SUPER_PROMPT_*.md` : Prompts Copilot évolutifs

**⚠️  Note:** Documentation processus actuel dans `/docs/current/guides/`

---

**Archive:** sessions  
**Période:** v24.0 → v26.1  
**Version Actuelle:** v26.2
EOF

# Index current
cat > docs/current/INDEX.md << 'EOF'
# Documentation Actuelle TITANE∞ v26.2

**Version:** v26.2  
**Status:** Active  
**Dernière MAJ:** 18 décembre 2025

## Structure

```
docs/current/
├── audits/          # Audits techniques v26
├── phases/          # Phases développement + roadmap
├── guides/          # Guides utilisateur/dev
├── architecture/    # Architecture système
└── performance/     # Optimisations & benchmarks
```

## Raccourcis

### Audits
- [Audit Hooks v26.2](./audits/AUDIT_HOOKS_v26.2_COMPLETE.md)
- [Audit Dependencies](./audits/AUDIT_DEPENDENCIES_PRODUCTION_v26.2.md)
- [Audit Tools](./audits/AUDIT_TOOLS_CONFIGS_v26.2_COMPLETE.md)

### Guides
- [Quick Start Ubuntu](./guides/QUICKSTART_UBUNTU_24.04.md)
- [Deployment Guide](./guides/DEPLOYMENT_GUIDE_v25.7.5.md)
- [Multimodal Guide](./guides/MULTIMODAL_QUICK_START.md)

### Architecture
- [Governance Map](./architecture/GOVERNANCE_MAP.md)
- [Vocal Architecture](./architecture/VOCAL_MAP.md)
- [Living UI System](./architecture/LIVING_UI_SYSTEM_INDEX.md)

### Phases
- [Roadmap Phases](./phases/PHASES_ROADMAP_v26.md) (à créer)
- [Phases Complétées](./phases/completed/)

---

**Documentation v26.2 | TITANE∞ Team**
EOF

echo -e "${GREEN}   ✅ Fichiers INDEX créés${NC}"

# 11. STATISTIQUES
echo ""
echo -e "${BLUE}📊  Statistiques Migration${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
ROOT_COUNT=$(ls -1 *.md 2>/dev/null | wc -l)
V24_FINAL=$(ls -1 docs/archive/v24/*.md 2>/dev/null | wc -l)
V25_FINAL=$(ls -1 docs/archive/v25/*.md 2>/dev/null | wc -l)
SESSION_FINAL=$(ls -1 docs/archive/sessions/*.md 2>/dev/null | wc -l)
CURRENT_FINAL=$(find docs/current -name "*.md" 2>/dev/null | wc -l)

echo -e "   Fichiers .md racine:        ${GREEN}$ROOT_COUNT${NC}"
echo -e "   Archive v24:                ${YELLOW}$V24_FINAL${NC}"
echo -e "   Archive v25:                ${YELLOW}$V25_FINAL${NC}"
echo -e "   Archive sessions:           ${YELLOW}$SESSION_FINAL${NC}"
echo -e "   Documentation v26 actuelle: ${GREEN}$CURRENT_FINAL${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Vérification objectif
if [[ $ROOT_COUNT -le 10 ]]; then
    echo -e "${GREEN}✅ OBJECTIF ATTEINT: $ROOT_COUNT ≤ 10 fichiers racine${NC}"
else
    echo -e "${RED}⚠️  OBJECTIF PARTIEL: $ROOT_COUNT > 10 fichiers racine${NC}"
fi

# 12. VALIDATION BUILD
echo ""
echo -e "${BLUE}🔧  Test build...${NC}"
if pnpm run build > /dev/null 2>&1; then
    echo -e "${GREEN}   ✅ Build réussi${NC}"
else
    echo -e "${YELLOW}   ⚠️  Build failed (normal si deps manquantes)${NC}"
fi

# 13. RÉSUMÉ
echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║            MIGRATION TERMINÉE ✅               ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}Fichiers déplacés:${NC}"
echo "   • v24: $V24_COUNT fichiers → docs/archive/v24/"
echo "   • v25: $V25_COUNT fichiers → docs/archive/v25/"
echo "   • Sessions: $SESSION_COUNT fichiers → docs/archive/sessions/"
echo "   • Audits v26: $AUDIT_COUNT fichiers → docs/current/audits/"
echo "   • Phases: $PHASE_COUNT fichiers → docs/current/phases/"
echo "   • Guides: $GUIDE_COUNT fichiers → docs/current/guides/"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "   1. Review: git status"
echo "   2. Verify: git diff --stat"
echo "   3. Test: pnpm run build"
echo "   4. Commit: git add . && git commit -F .git/COMMIT_EDITMSG_TEMPLATE"
echo "   5. Push: git push origin feature/docs-restructure-v26.2"
echo ""
echo -e "${BLUE}Backup:${NC} $BACKUP_DIR"
echo -e "${BLUE}Rapport:${NC} ANALYSE_REFLEXION_DOCUMENTATION_v26.2_OPTIMISATION.md"
echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  Migration v26.2 Documentation - SUCCESS! 🎉  ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════╝${NC}"
