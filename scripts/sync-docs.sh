#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════
# TITANE∞ v∞ — Documentation Sync Script
# Synchronise docs/ vers documentation/docs/ pour Docusaurus
# Super-Prompt K — Pipeline automation documentation
# ═══════════════════════════════════════════════════════════════

set -euo pipefail

DOCS_SOURCE="docs"
DOCS_TARGET="documentation/docs"
PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"

echo "🔄 TITANE∞ — Synchronisation documentation"
echo "   Source: ${DOCS_SOURCE}/"
echo "   Cible:  ${DOCS_TARGET}/"
echo ""

# Créer les répertoires cibles
mkdir -p "${PROJECT_ROOT}/${DOCS_TARGET}/architecture"
mkdir -p "${PROJECT_ROOT}/${DOCS_TARGET}/modules"
mkdir -p "${PROJECT_ROOT}/${DOCS_TARGET}/api"
mkdir -p "${PROJECT_ROOT}/${DOCS_TARGET}/guides"
mkdir -p "${PROJECT_ROOT}/${DOCS_TARGET}/system"

# Copier les docs d'architecture
if [ -d "${PROJECT_ROOT}/${DOCS_SOURCE}/01_architecture" ]; then
    cp -r "${PROJECT_ROOT}/${DOCS_SOURCE}/01_architecture/"* "${PROJECT_ROOT}/${DOCS_TARGET}/architecture/" 2>/dev/null || true
fi

if [ -f "${PROJECT_ROOT}/${DOCS_SOURCE}/ARCHITECTURE.md" ]; then
    cp "${PROJECT_ROOT}/${DOCS_SOURCE}/ARCHITECTURE.md" "${PROJECT_ROOT}/${DOCS_TARGET}/architecture/"
fi

if [ -f "${PROJECT_ROOT}/${DOCS_SOURCE}/ARCHITECTURE_RINGS.md" ]; then
    cp "${PROJECT_ROOT}/${DOCS_SOURCE}/ARCHITECTURE_RINGS.md" "${PROJECT_ROOT}/${DOCS_TARGET}/architecture/"
fi

if [ -f "${PROJECT_ROOT}/${DOCS_SOURCE}/ARCHITECTURE_SIMPLIFIED.md" ]; then
    cp "${PROJECT_ROOT}/${DOCS_SOURCE}/ARCHITECTURE_SIMPLIFIED.md" "${PROJECT_ROOT}/${DOCS_TARGET}/architecture/"
fi

# Copier les docs système
if [ -d "${PROJECT_ROOT}/${DOCS_SOURCE}/00_SYSTEME" ]; then
    cp -r "${PROJECT_ROOT}/${DOCS_SOURCE}/00_SYSTEME/"* "${PROJECT_ROOT}/${DOCS_TARGET}/system/" 2>/dev/null || true
fi

# Copier les docs de modules
if [ -d "${PROJECT_ROOT}/${DOCS_SOURCE}/05_modules" ]; then
    cp -r "${PROJECT_ROOT}/${DOCS_SOURCE}/05_modules/"* "${PROJECT_ROOT}/${DOCS_TARGET}/modules/" 2>/dev/null || true
fi

# Copier les docs API
if [ -d "${PROJECT_ROOT}/${DOCS_SOURCE}/06_api" ]; then
    cp -r "${PROJECT_ROOT}/${DOCS_SOURCE}/06_api/"* "${PROJECT_ROOT}/${DOCS_TARGET}/api/" 2>/dev/null || true
fi

if [ -f "${PROJECT_ROOT}/${DOCS_SOURCE}/API_SURFACE.md" ]; then
    cp "${PROJECT_ROOT}/${DOCS_SOURCE}/API_SURFACE.md" "${PROJECT_ROOT}/${DOCS_TARGET}/api/"
fi

# Copier les guides
if [ -d "${PROJECT_ROOT}/${DOCS_SOURCE}/04_guides" ]; then
    cp -r "${PROJECT_ROOT}/${DOCS_SOURCE}/04_guides/"* "${PROJECT_ROOT}/${DOCS_TARGET}/guides/" 2>/dev/null || true
fi

# Copier les fichiers racine importants
for file in CHANGELOG.md LICENSE.md README.md; do
    if [ -f "${PROJECT_ROOT}/${file}" ]; then
        cp "${PROJECT_ROOT}/${file}" "${PROJECT_ROOT}/${DOCS_TARGET}/"
    fi
done

# Compter les fichiers synchronisés
SYNCED=$(find "${PROJECT_ROOT}/${DOCS_TARGET}" -name "*.md" | wc -l)

echo "✅ Synchronisation terminée: ${SYNCED} fichiers Markdown"
echo ""
echo "📋 Prochaines étapes:"
echo "   cd documentation && pnpm install && pnpm run build"