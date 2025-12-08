#!/bin/bash
# ═══════════════════════════════════════════════════════════════════
# TITANE∞ Document Reset Engine vΩ
# Exécuter depuis la racine du projet : ./docs/00_SYSTEME/reset_docs.sh
# ═══════════════════════════════════════════════════════════════════

set -e
cd "$(dirname "$0")/../.."  # Retour à la racine du projet

echo "🔥 TITANE∞ Document Reset Engine vΩ"
echo "═══════════════════════════════════════════════════════════════"
echo "📍 Répertoire de travail: $(pwd)"
echo ""

# Vérification de sécurité
read -p "⚠️  Ce script va réorganiser tous les fichiers .md. Continuer? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Annulé."
    exit 1
fi

# ═══ PHASE 0 : Création de l'arborescence cible ═══
echo ""
echo "📁 Phase 0: Création de l'arborescence..."

mkdir -p docs/00_SYSTEME
mkdir -p docs/01_VISION
mkdir -p docs/02_ARCHITECTURE
mkdir -p docs/03_PROMPTS
mkdir -p docs/04_GUIDES
mkdir -p docs/05_AUDIT
mkdir -p docs/06_API
mkdir -p docs/99_ARCHIVE/obsolete
mkdir -p docs/99_ARCHIVE/merged
mkdir -p docs/99_ARCHIVE/sessions
mkdir -p docs/99_ARCHIVE/versions/v14
mkdir -p docs/99_ARCHIVE/versions/v15
mkdir -p docs/99_ARCHIVE/versions/v16
mkdir -p docs/99_ARCHIVE/versions/v17
mkdir -p docs/99_ARCHIVE/versions/v18
mkdir -p docs/99_ARCHIVE/versions/v19
mkdir -p docs/99_ARCHIVE/versions/v20
mkdir -p docs/99_ARCHIVE/versions/v21
mkdir -p docs/99_ARCHIVE/versions/v22
mkdir -p docs/99_ARCHIVE/versions/v23
mkdir -p docs/99_ARCHIVE/versions/v24
mkdir -p docs/99_ARCHIVE/drafts

echo "   ✅ Arborescence créée"

# ═══ PHASE 1 : Archivage des rapports de session (racine) ═══
echo ""
echo "📦 Phase 1: Archivage des rapports de session..."
count=0

# Session reports
for f in SESSION_*.md RAPPORT_*.md; do
  if [ -f "$f" ]; then
    mv "$f" docs/99_ARCHIVE/sessions/ 2>/dev/null && ((count++)) || true
  fi
done

# Completed/Final reports
for f in *_COMPLETE*.md *_FINAL*.md *_ULTIME*.md; do
  if [ -f "$f" ]; then
    mv "$f" docs/99_ARCHIVE/merged/ 2>/dev/null && ((count++)) || true
  fi
done

# TITANE prefixed reports (sauf README)
for f in TITANE_*.md; do
  if [ -f "$f" ] && [ "$f" != "README.md" ]; then
    mv "$f" docs/99_ARCHIVE/sessions/ 2>/dev/null && ((count++)) || true
  fi
done

echo "   ✅ $count fichiers archivés"

# ═══ PHASE 2 : Archivage par version ═══
echo ""
echo "📦 Phase 2: Archivage par version..."
count=0

for version in 14 15 16 17 18 19 20 21 22 23 24; do
  for f in *_v${version}*.md *v${version}*.md *_v${version}[._]*.md; do
    if [ -f "$f" ]; then
      mv "$f" docs/99_ARCHIVE/versions/v${version}/ 2>/dev/null && ((count++)) || true
    fi
  done
done

# Version infinie (v∞)
for f in *_v∞*.md *v∞*.md; do
  if [ -f "$f" ]; then
    mv "$f" docs/99_ARCHIVE/sessions/ 2>/dev/null && ((count++)) || true
  fi
done

echo "   ✅ $count fichiers versionnés archivés"

# ═══ PHASE 3 : Archivage par catégorie ═══
echo ""
echo "📦 Phase 3: Archivage par catégorie..."
count=0

# Audits
for f in AUDIT_*.md; do
  if [ -f "$f" ]; then
    mv "$f" docs/99_ARCHIVE/sessions/ 2>/dev/null && ((count++)) || true
  fi
done

# Changelogs (sauf principal)
for f in CHANGELOG_*.md; do
  if [ -f "$f" ]; then
    mv "$f" docs/99_ARCHIVE/versions/ 2>/dev/null && ((count++)) || true
  fi
done

# Voice/Audio reports
for f in VOICE_*.md AUDIO_*.md TTS_*.md; do
  if [ -f "$f" ]; then
    mv "$f" docs/99_ARCHIVE/sessions/ 2>/dev/null && ((count++)) || true
  fi
done

# Backend reports
for f in BACKEND_*.md; do
  if [ -f "$f" ]; then
    mv "$f" docs/99_ARCHIVE/sessions/ 2>/dev/null && ((count++)) || true
  fi
done

# Validation reports
for f in VALIDATION_*.md VERIFICATION_*.md; do
  if [ -f "$f" ]; then
    mv "$f" docs/99_ARCHIVE/sessions/ 2>/dev/null && ((count++)) || true
  fi
done

# Implementation reports
for f in IMPLEMENTATION_*.md *_IMPLEMENTATION*.md; do
  if [ -f "$f" ]; then
    mv "$f" docs/99_ARCHIVE/sessions/ 2>/dev/null && ((count++)) || true
  fi
done

# Fix reports
for f in FIX_*.md *_FIX_*.md; do
  if [ -f "$f" ]; then
    mv "$f" docs/99_ARCHIVE/sessions/ 2>/dev/null && ((count++)) || true
  fi
done

# Guides
for f in GUIDE_*.md *_GUIDE*.md; do
  if [ -f "$f" ]; then
    mv "$f" docs/99_ARCHIVE/sessions/ 2>/dev/null && ((count++)) || true
  fi
done

# TODO reports
for f in TODO_*.md; do
  if [ -f "$f" ]; then
    mv "$f" docs/99_ARCHIVE/drafts/ 2>/dev/null && ((count++)) || true
  fi
done

# Commit messages
for f in COMMIT_*.md; do
  if [ -f "$f" ]; then
    mv "$f" docs/99_ARCHIVE/sessions/ 2>/dev/null && ((count++)) || true
  fi
done

# Phase reports
for f in PHASE_*.md; do
  if [ -f "$f" ]; then
    mv "$f" docs/99_ARCHIVE/sessions/ 2>/dev/null && ((count++)) || true
  fi
done

# Week reports
for f in WEEK_*.md; do
  if [ -f "$f" ]; then
    mv "$f" docs/99_ARCHIVE/sessions/ 2>/dev/null && ((count++)) || true
  fi
done

# Analysis reports
for f in ANALYSE_*.md ANALYSIS_*.md; do
  if [ -f "$f" ]; then
    mv "$f" docs/99_ARCHIVE/sessions/ 2>/dev/null && ((count++)) || true
  fi
done

# Progress reports
for f in PROGRESS_*.md; do
  if [ -f "$f" ]; then
    mv "$f" docs/99_ARCHIVE/sessions/ 2>/dev/null && ((count++)) || true
  fi
done

# Quick start guides
for f in QUICK_START*.md; do
  if [ -f "$f" ]; then
    mv "$f" docs/99_ARCHIVE/sessions/ 2>/dev/null && ((count++)) || true
  fi
done

# Diagnostic reports
for f in DIAGNOSTIC_*.md; do
  if [ -f "$f" ]; then
    mv "$f" docs/99_ARCHIVE/sessions/ 2>/dev/null && ((count++)) || true
  fi
done

# Super prompt reports
for f in SUPER_PROMPT*.md; do
  if [ -f "$f" ]; then
    mv "$f" docs/99_ARCHIVE/sessions/ 2>/dev/null && ((count++)) || true
  fi
done

# Release notes
for f in RELEASE_*.md; do
  if [ -f "$f" ]; then
    mv "$f" docs/99_ARCHIVE/versions/ 2>/dev/null && ((count++)) || true
  fi
done

# Build reports
for f in BUILD_*.md; do
  if [ -f "$f" ]; then
    mv "$f" docs/99_ARCHIVE/sessions/ 2>/dev/null && ((count++)) || true
  fi
done

# Deployment reports
for f in DEPLOYMENT_*.md; do
  if [ -f "$f" ]; then
    mv "$f" docs/99_ARCHIVE/sessions/ 2>/dev/null && ((count++)) || true
  fi
done

# Status reports
for f in STATUS_*.md; do
  if [ -f "$f" ]; then
    mv "$f" docs/99_ARCHIVE/sessions/ 2>/dev/null && ((count++)) || true
  fi
done

echo "   ✅ $count fichiers catégorisés archivés"

# ═══ PHASE 4 : Archivage du reste (racine) ═══
echo ""
echo "📦 Phase 4: Archivage des fichiers restants à la racine..."
count=0

# Tous les autres .md à la racine (sauf README, CHANGELOG, LICENSE, ARCHITECTURE)
for f in *.md; do
  if [ -f "$f" ]; then
    case "$f" in
      README.md|CHANGELOG.md|LICENSE.md|ARCHITECTURE.md)
        # Conserver ces fichiers
        ;;
      *)
        mv "$f" docs/99_ARCHIVE/sessions/ 2>/dev/null && ((count++)) || true
        ;;
    esac
  fi
done

echo "   ✅ $count fichiers restants archivés"

# ═══ PHASE 5 : Consolidation /docs/legacy ═══
echo ""
echo "📦 Phase 5: Consolidation docs/legacy..."

if [ -d "docs/legacy" ]; then
  file_count=$(find docs/legacy -type f | wc -l)
  if [ "$file_count" -gt 0 ]; then
    mv docs/legacy/* docs/99_ARCHIVE/obsolete/ 2>/dev/null || true
  fi
  rmdir docs/legacy 2>/dev/null || true
  echo "   ✅ $file_count fichiers legacy consolidés"
else
  echo "   ℹ️  Pas de dossier legacy"
fi

# ═══ PHASE 6 : Réorganisation /docs/archive existant ═══
echo ""
echo "📦 Phase 6: Réorganisation docs/archive..."

if [ -d "docs/archive" ] && [ "$(ls -A docs/archive 2>/dev/null)" ]; then
  file_count=$(find docs/archive -type f | wc -l)
  mv docs/archive/* docs/99_ARCHIVE/obsolete/ 2>/dev/null || true
  rmdir docs/archive 2>/dev/null || true
  echo "   ✅ $file_count fichiers archive réorganisés"
else
  echo "   ℹ️  Pas de dossier archive ou vide"
fi

# ═══ PHASE 7 : Création des fichiers SoT ═══
echo ""
echo "📝 Phase 7: Création des fichiers SoT..."

# Index Master
if [ ! -f "docs/00_SYSTEME/TITANE_INDEX_MASTER.md" ]; then
cat > docs/00_SYSTEME/TITANE_INDEX_MASTER.md << 'INDEXEOF'
# TITANE∞ Index Master

## Single Source of Truth - Documentation

Ce fichier est l'INDEX MASTER de toute la documentation TITANE∞.

### Structure Documentaire

| Dossier | Contenu |
|---------|---------|
| [00_SYSTEME](.) | Constitution, Index, Architecture globale |
| [01_VISION](../01_VISION/) | Vision produit, Résumé exécutif |
| [02_ARCHITECTURE](../02_ARCHITECTURE/) | Architectures techniques |
| [03_PROMPTS](../03_PROMPTS/) | Super Prompts opérationnels |
| [04_GUIDES](../04_GUIDES/) | Guides utilisateur et développeur |
| [05_AUDIT](../05_AUDIT/) | Audits et QA |
| [06_API](../06_API/) | Documentation API |
| [99_ARCHIVE](../99_ARCHIVE/) | Archives (obsolète, merged, sessions) |

### Règle d'Or

> **1 SoT par sujet. Mise à jour, pas duplication.**

### Fichiers SoT Principaux

- `00_SYSTEME/TITANE_INDEX_MASTER.md` ← Ce fichier
- `01_VISION/RESUME_EXECUTIF.md` ← Résumé exécutif
- `02_ARCHITECTURE/ARCHITECTURE_GLOBALE.md` ← Architecture système
- `03_PROMPTS/SUPER_PROMPTS_INDEX.md` ← Index des prompts
- `04_GUIDES/QUICK_START.md` ← Guide de démarrage
- `05_AUDIT/AUDIT_FRAMEWORK.md` ← Framework d'audit

---
*TITANE∞ Documentation System vΩ*
INDEXEOF
  echo "   ✅ Index Master créé"
else
  echo "   ℹ️  Index Master existe déjà"
fi

# ═══ RAPPORT FINAL ═══
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "🎯 TITANE∞ Document Reset Engine vΩ — TERMINÉ"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "📊 Statistiques finales :"
echo "   Fichiers .md à la racine : $(find . -maxdepth 1 -name '*.md' -type f | wc -l)"
echo "   Fichiers .md dans docs/  : $(find docs -name '*.md' -type f | wc -l)"
echo ""
echo "📁 Nouvelle structure :"
ls -la docs/ 2>/dev/null | grep "^d"
echo ""
echo "⚠️  ACTIONS MANUELLES REQUISES :"
echo "   1. Vérifier docs/99_ARCHIVE/ pour tout fichier important"
echo "   2. Créer/mettre à jour les SoT dans chaque dossier"
echo "   3. Mettre à jour README.md comme point d'entrée"
echo "   4. Commiter les changements : git add -A && git commit -m 'docs: Reset documentaire vΩ'"
echo ""
echo "✅ Reset documentaire terminé avec succès."
