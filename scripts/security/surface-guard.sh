#!/usr/bin/env bash
# TITANE∞ — Surface Guard CI (BLOQUANT P0-2)
# Détecte changements surface Tauri non documentés
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

echo "🛡️ [SURFACE-GUARD] TITANE∞ Tauri Surface Guard"
echo "================================================"

ALLOWLIST_STABLE="src-tauri/allowlist.whitelist.stable.json"
SURFACE_DOC="docs/TAURI_SURFACE.md"

EXIT_CODE=0

# Vérifier que les fichiers critiques existent
if [ ! -f "$ALLOWLIST_STABLE" ]; then
    echo "❌ BLOQUANT: Fichier allowlist stable manquant: $ALLOWLIST_STABLE"
    exit 1
fi

if [ ! -f "$SURFACE_DOC" ]; then
    echo "❌ BLOQUANT: Documentation surface manquante: $SURFACE_DOC"
    exit 1
fi

echo "📋 Phase 1: Extraction commands allowlist stable..."

# Extraire la liste des commands de l'allowlist
if command -v jq >/dev/null 2>&1; then
    # L'allowlist contient des objects {"command": "nom"} - extraire le nom
    ALLOWLIST_COMMANDS=$(jq -r '.app.security.capabilities[0].allow[] | .command' "$ALLOWLIST_STABLE" 2>/dev/null | sort || echo "")
else
    # Fallback sans jq - extraction basique
    ALLOWLIST_COMMANDS=$(grep -o '"command": "[^"]*"' "$ALLOWLIST_STABLE" | sed 's/"command": "//g' | sed 's/"//g' | sort | head -60 || echo "")
fi

if [ -z "$ALLOWLIST_COMMANDS" ]; then
    echo "⚠️ WARNING: Impossible d'extraire commands allowlist (jq manquant?)"
    ALLOWLIST_COMMANDS="extraction_failed"
fi

echo "📋 Phase 2: Extraction commands documentation..."

# Extraire commands documentés dans TAURI_SURFACE.md
# Pattern: "command_name",       // DESCRIPTION
DOC_COMMANDS=$(grep -E '"[a-z0-9_]+",\s*//.*' "$SURFACE_DOC" | sed 's/.*"\([a-z0-9_]*\)".*/\1/' | sort || echo "")

echo "📋 Phase 3: Comparaison allowlist vs documentation..."

# Comparer les deux listes
echo "Commands allowlist:"
echo "$ALLOWLIST_COMMANDS" | sed 's/^/  - /'
echo ""
echo "Commands documentés:"
echo "$DOC_COMMANDS" | sed 's/^/  - /'
echo ""

# Détecter commands non documentés
UNDOCUMENTED=""
if [ "$ALLOWLIST_COMMANDS" != "extraction_failed" ]; then
    while IFS= read -r cmd; do
        if [ -n "$cmd" ] && ! echo "$DOC_COMMANDS" | grep -qx "$cmd"; then
            UNDOCUMENTED="${UNDOCUMENTED}$cmd"$'\n'
            echo "❌ BLOQUANT: Command non documenté: '$cmd'"
            EXIT_CODE=1
        fi
    done <<< "$ALLOWLIST_COMMANDS"
fi

# Détecter documentation obsolète
OBSOLETE_DOC=""
while IFS= read -r cmd; do
    if [ -n "$cmd" ] && [ "$ALLOWLIST_COMMANDS" != "extraction_failed" ] && ! echo "$ALLOWLIST_COMMANDS" | grep -qx "$cmd"; then
        OBSOLETE_DOC="${OBSOLETE_DOC}$cmd"$'\n'
        echo "⚠️ WARNING: Command documenté mais absent allowlist: '$cmd'"
    fi
done <<< "$DOC_COMMANDS"

echo "📋 Phase 4: Vérification métadonnées documentation..."

# Vérifier que la doc contient des sections critiques
REQUIRED_SECTIONS=(
    "## 📊 Surface Stable Actuelle"
    "## 🔐 Classification Risques" 
    "## 🛡️ Guards Implémentés"
    "## 🔄 Évolution Historique"
)

for section in "${REQUIRED_SECTIONS[@]}"; do
    if ! grep -q "$section" "$SURFACE_DOC"; then
        echo "⚠️ WARNING: Section manquante dans documentation: '$section'"
    fi
done

# Vérifier date mise à jour récente (moins de 30 jours)
LAST_UPDATED=$(grep "Last Updated.*2026" "$SURFACE_DOC" || echo "")
if [ -z "$LAST_UPDATED" ]; then
    echo "⚠️ WARNING: Date 'Last Updated' manquante ou obsolète"
fi

echo ""
if [ $EXIT_CODE -eq 0 ]; then
    echo "✅ SURFACE-GUARD: PASS - Surface documentée et cohérente"
    if [ -n "$OBSOLETE_DOC" ]; then
        echo "ℹ️ INFO: Documentation contient des commands obsolètes (non bloquant)"
    fi
else
    echo "❌ SURFACE-GUARD: FAIL - Commands non documentés détectés"
    echo ""
    echo "🔧 SOLUTION: Mettre à jour docs/TAURI_SURFACE.md avec les commands:"
    echo "$UNDOCUMENTED" | sed 's/^/  - /'
fi

exit $EXIT_CODE