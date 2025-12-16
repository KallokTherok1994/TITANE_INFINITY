#!/bin/bash
# ═══════════════════════════════════════════════════════════════════
# TITANE∞ v15 — Script de migration automatique headers
# Remplace tous les headers v12/v13/v14/v17 → v15
# ═══════════════════════════════════════════════════════════════════

set -e

echo "🚀 Démarrage migration headers v15..."
echo "═══════════════════════════════════════════════════════════════════"

# Compteurs
TOTAL=0
UPDATED=0

# Fonction de migration header
migrate_header() {
    local file="$1"
    local updated=false

    # Backend Rust: v14 → v15
    if grep -q "TITANE.*v14" "$file" 2>/dev/null; then
        sed -i 's/TITANE∞ v14/TITANE∞ v15/g' "$file"
        sed -i 's/TITANE_INFINITY v14/TITANE∞ v15/g' "$file"
        updated=true
    fi

    # Backend Rust: v13 → v15
    if grep -q "TITANE.*v13" "$file" 2>/dev/null; then
        sed -i 's/TITANE∞ v13/TITANE∞ v15/g' "$file"
        sed -i 's/TITANE_INFINITY v13/TITANE∞ v15/g' "$file"
        updated=true
    fi

    # Backend Rust: v12 → v15
    if grep -q "TITANE.*v12" "$file" 2>/dev/null; then
        sed -i 's/TITANE∞ v12/TITANE∞ v15/g' "$file"
        sed -i 's/TITANE_INFINITY v12/TITANE∞ v15/g' "$file"
        updated=true
    fi

    # Backend Rust: v17 → v15
    if grep -q "TITANE.*v17" "$file" 2>/dev/null; then
        sed -i 's/TITANE∞ v17[^ ]*/TITANE∞ v15/g' "$file"
        sed -i 's/TITANE_INFINITY v17[^ ]*/TITANE∞ v15/g' "$file"
        updated=true
    fi

    # Frontend TypeScript: v13 → v15
    if grep -q "TITANE_INFINITY v13" "$file" 2>/dev/null; then
        sed -i 's/TITANE_INFINITY v13/TITANE∞ v15/g' "$file"
        updated=true
    fi

    # Frontend TypeScript: v17 → v15
    if grep -q "TITANE∞ v17" "$file" 2>/dev/null; then
        sed -i 's/TITANE∞ v17[^ ]*/TITANE∞ v15/g' "$file"
        updated=true
    fi

    if [ "$updated" = true ]; then
        echo "  ✅ $file"
        ((UPDATED++))
    fi
}

# Migration Backend (.rs files)
echo "📦 Backend Rust files..."
while IFS= read -r file; do
    ((TOTAL++))
    migrate_header "$file"
done < <(find src-tauri/src -name "*.rs" -type f)

# Migration Frontend (.ts/.tsx files)
echo "🎨 Frontend TypeScript files..."
while IFS= read -r file; do
    ((TOTAL++))
    migrate_header "$file"
done < <(find src -name "*.ts" -o -name "*.tsx" -type f)

echo "═══════════════════════════════════════════════════════════════════"
echo "✅ Migration terminée"
echo "   📊 Fichiers scannés: $TOTAL"
echo "   ✏️  Fichiers migrés: $UPDATED"
echo "═══════════════════════════════════════════════════════════════════"
