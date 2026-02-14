#!/usr/bin/env bash
# Script helper: Création GitHub Release v27.0.2
# Usage: ./scripts/create-release-v27.0.2.sh
#
# Pré-requis: gh auth login (authentification GitHub CLI)

set -euo pipefail

REPO="KallokTherok1994/TITANE_INFINITY"
TAG="v27.0.2"
TITLE="TITANE∞ v27.0.2 - Conversation Storage Hotfix"

NOTES="## 🔥 Hotfix - Conversation Storage + IPC Classification

### Changements
- 🐛 **fix(chat):** Correction de la persistance des conversations (ID mismatch fixed)
- 🔧 **fix(IPC):** Classification correcte des erreurs IPC vs Provider
- 🧪 **tests:** Stabilisation des tests (voiceE2E legacy API warnings)
- 📝 **types:** Correction des erreurs TypeScript chatEngine + tsconfig
- 🎨 **format:** Auto-format Prettier (9 fichiers)

### Artifacts
- **AppImage (96 MB):** \`TITANE-Infinity_27.0.2_amd64.AppImage\`
- **DEB (26 MB):** \`TITANE-Infinity_27.0.2_amd64.deb\`

### SHA256 Checksums
\`\`\`
969d05489cb7c11c40dba7b3bea30bdaaf7d0d7eac2a83c9fbe5b43627efd265  TITANE-Infinity_27.0.2_amd64.deb
460f1ff9b22456f6719c95dadd01656463fff579baab0abd7bc3b782e0327ed1  TITANE-Infinity_27.0.2_amd64.AppImage
\`\`\`

### Build Info
- **Commit:** 96730fe1
- **Build Date:** $(date -u '+%Y-%m-%d %H:%M:%S UTC')
- **Rust Compile:** 6m47s (release optimized)
- **Vite Build:** 3439 modules (gzip + brotli)

### Documentation
Voir [ARTIFACTS_SHA256_v27.0.2.md](../ARTIFACTS_SHA256_v27.0.2.md) pour détails complets.

---

**Commits inclus:**
- 96730fe1: docs: Publish v27.0.2 artifacts + SHA256 checksums
- f769be23: chore: Auto-format files with Prettier (pre-build)
- 12ae05d0: fix(types): Correct TypeScript errors in chatEngine + tsconfig
- 71c724fd: chore(release): Bump version to 27.0.2 + CHANGELOG update
- 9baa0d94: fix(chat): Conversation storage ID mismatch + IPC truth classification
"

ARTIFACTS=(
  "deployment/latest/TITANE-Infinity_27.0.2_amd64.AppImage"
  "deployment/latest/TITANE-Infinity_27.0.2_amd64.deb"
)

echo "🚀 Création GitHub Release $TAG"
echo "Repository: $REPO"
echo ""

# Vérifier authentification
if ! gh auth status &>/dev/null; then
  echo "❌ GitHub CLI non authentifié"
  echo ""
  echo "Étapes requises:"
  echo "1. gh auth login"
  echo "2. Ré-exécuter ce script"
  exit 1
fi

# Vérifier artifacts
echo "✅ Vérification des artifacts..."
for artifact in "${ARTIFACTS[@]}"; do
  if [[ ! -f "$artifact" ]]; then
    echo "❌ Artifact manquant: $artifact"
    exit 1
  fi
  echo "  ✓ $(basename "$artifact")"
done

echo ""
echo "📦 Création de la release..."
gh release create "$TAG" \
  --repo "$REPO" \
  --title "$TITLE" \
  --notes "$NOTES" \
  "${ARTIFACTS[@]}"

echo ""
echo "✅ Release créée avec succès!"
echo "🔗 https://github.com/$REPO/releases/tag/$TAG"
