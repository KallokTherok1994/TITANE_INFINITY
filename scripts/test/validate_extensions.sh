#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════
# TITANE∞ v19.2.0 — Validation Extensions VS Code
# Vérifie l'état de toutes les extensions nécessaires au projet
# © 2025 Humain Total / Kevin Thibault
# ═══════════════════════════════════════════════════════════════════════════

set -e

echo "════════════════════════════════════════════════════════════════════"
echo "🔍 TITANE∞ — Validation Extensions VS Code Natif"
echo "════════════════════════════════════════════════════════════════════"
echo ""

# ───────────────────────────────────────────────────────────────────────────
# Extensions critiques (obligatoires)
# ───────────────────────────────────────────────────────────────────────────
echo "📦 [1/7] Extensions CRITIQUES (Rust/Tauri)..."
echo ""

CRITICAL_EXTENSIONS=(
    "rust-lang.rust-analyzer"
    "tauri-apps.tauri-vscode"
    "vadimcn.vscode-lldb"
    "tamasfe.even-better-toml"
)

CRITICAL_OK=0
CRITICAL_MISSING=0

for ext in "${CRITICAL_EXTENSIONS[@]}"; do
    if code --list-extensions 2>/dev/null | grep -q "^$ext$"; then
        VERSION=$(code --list-extensions --show-versions 2>/dev/null | grep "^$ext@" | cut -d@ -f2)
        echo "✅ $ext ($VERSION)"
        ((CRITICAL_OK++))
    else
        echo "❌ $ext MANQUANT"
        ((CRITICAL_MISSING++))
    fi
done

echo ""

# ───────────────────────────────────────────────────────────────────────────
# Extensions React/TypeScript
# ───────────────────────────────────────────────────────────────────────────
echo "📦 [2/7] Extensions React/TypeScript..."
echo ""

REACT_EXTENSIONS=(
    "dbaeumer.vscode-eslint"
    "esbenp.prettier-vscode"
    "dsznajder.es7-react-js-snippets"
    "planbcoding.vscode-react-refactor"
)

REACT_OK=0
for ext in "${REACT_EXTENSIONS[@]}"; do
    if code --list-extensions 2>/dev/null | grep -q "$(echo $ext | cut -d. -f2)"; then
        echo "✅ $ext"
        ((REACT_OK++))
    else
        echo "⚠️  $ext manquant"
    fi
done

echo ""

# ───────────────────────────────────────────────────────────────────────────
# Extensions Tailwind/CSS
# ───────────────────────────────────────────────────────────────────────────
echo "📦 [3/7] Extensions Tailwind/CSS..."
echo ""

TAILWIND_EXTENSIONS=(
    "bradlc.vscode-tailwindcss"
    "heybourn.headwind"
    "pranaygp.vscode-css-peek"
    "naumovs.color-highlight"
)

TAILWIND_OK=0
for ext in "${TAILWIND_EXTENSIONS[@]}"; do
    if code --list-extensions 2>/dev/null | grep -q "$(echo $ext | cut -d. -f2)"; then
        echo "✅ $ext"
        ((TAILWIND_OK++))
    else
        echo "⚠️  $ext manquant"
    fi
done

echo ""

# ───────────────────────────────────────────────────────────────────────────
# Extensions Testing
# ───────────────────────────────────────────────────────────────────────────
echo "📦 [4/7] Extensions Testing/QA..."
echo ""

TESTING_EXTENSIONS=(
    "hbenl.vscode-test-explorer"
    "ryanluker.vscode-coverage-gutters"
    "ms-playwright.playwright"
)

TESTING_OK=0
for ext in "${TESTING_EXTENSIONS[@]}"; do
    if code --list-extensions 2>/dev/null | grep -q "$(echo $ext | cut -d. -f2)"; then
        echo "✅ $ext"
        ((TESTING_OK++))
    else
        echo "⚠️  $ext manquant"
    fi
done

echo ""

# ───────────────────────────────────────────────────────────────────────────
# Extensions Code Quality
# ───────────────────────────────────────────────────────────────────────────
echo "📦 [5/7] Extensions Code Quality..."
echo ""

QUALITY_EXTENSIONS=(
    "usernamehw.errorlens"
    "streetsidesoftware.code-spell-checker"
    "streetsidesoftware.code-spell-checker-french"
    "gruntfuggly.todo-tree"
)

QUALITY_OK=0
for ext in "${QUALITY_EXTENSIONS[@]}"; do
    if code --list-extensions 2>/dev/null | grep -q "$(echo $ext | cut -d. -f2)"; then
        echo "✅ $ext"
        ((QUALITY_OK++))
    else
        echo "⚠️  $ext manquant"
    fi
done

echo ""

# ───────────────────────────────────────────────────────────────────────────
# Extensions Git
# ───────────────────────────────────────────────────────────────────────────
echo "📦 [6/7] Extensions Git/Version Control..."
echo ""

GIT_EXTENSIONS=(
    "eamodio.gitlens"
    "github.vscode-github-actions"
)

GIT_OK=0
for ext in "${GIT_EXTENSIONS[@]}"; do
    if code --list-extensions 2>/dev/null | grep -q "$(echo $ext | cut -d. -f2)"; then
        echo "✅ $ext"
        ((GIT_OK++))
    else
        echo "⚠️  $ext manquant"
    fi
done

echo ""

# ───────────────────────────────────────────────────────────────────────────
# Extensions Productivité
# ───────────────────────────────────────────────────────────────────────────
echo "📦 [7/7] Extensions Productivité..."
echo ""

PRODUCTIVITY_EXTENSIONS=(
    "christian-kohler.path-intellisense"
    "alefragnani.bookmarks"
    "pkief.material-icon-theme"
    "antfu.vite"
)

PRODUCTIVITY_OK=0
for ext in "${PRODUCTIVITY_EXTENSIONS[@]}"; do
    if code --list-extensions 2>/dev/null | grep -q "$(echo $ext | cut -d. -f2)"; then
        echo "✅ $ext"
        ((PRODUCTIVITY_OK++))
    else
        echo "⚠️  $ext manquant"
    fi
done

echo ""

# ───────────────────────────────────────────────────────────────────────────
# Vérification configuration VS Code
# ───────────────────────────────────────────────────────────────────────────
echo "════════════════════════════════════════════════════════════════════"
echo "📝 Vérification Configuration VS Code"
echo "════════════════════════════════════════════════════════════════════"
echo ""

if [ -f ".vscode/settings.json" ]; then
    echo "✅ settings.json présent"

    # Vérifier configurations critiques
    if grep -q "rust-analyzer.server.path" .vscode/settings.json; then
        echo "✅ Rust Analyzer path configuré"
    else
        echo "⚠️  Rust Analyzer path non configuré"
    fi

    if grep -q "tailwindCSS" .vscode/settings.json; then
        echo "✅ Tailwind CSS configuré"
    else
        echo "⚠️  Tailwind CSS non configuré"
    fi

    if grep -q "lldb.library" .vscode/settings.json; then
        echo "✅ LLDB debugger configuré"
    else
        echo "⚠️  LLDB debugger non configuré"
    fi
else
    echo "❌ settings.json MANQUANT"
fi

echo ""

if [ -f ".vscode/extensions.json" ]; then
    echo "✅ extensions.json présent"
    RECOMMENDED_COUNT=$(grep -o '"[a-z-]*\.[a-z-]*"' .vscode/extensions.json | wc -l)
    echo "   → $RECOMMENDED_COUNT extensions recommandées"
else
    echo "❌ extensions.json MANQUANT"
fi

echo ""

if [ -f ".vscode/launch.json" ]; then
    echo "✅ launch.json présent"
    DEBUG_CONFIGS=$(grep -c '"name":' .vscode/launch.json || echo "0")
    echo "   → $DEBUG_CONFIGS configurations de debug"
else
    echo "❌ launch.json MANQUANT"
fi

echo ""

if [ -f ".vscode/tasks.json" ]; then
    echo "✅ tasks.json présent"
    TASKS_COUNT=$(grep -c '"label":' .vscode/tasks.json || echo "0")
    echo "   → $TASKS_COUNT tâches configurées"
else
    echo "❌ tasks.json MANQUANT"
fi

echo ""

# ───────────────────────────────────────────────────────────────────────────
# Résumé final
# ───────────────────────────────────────────────────────────────────────────
echo "════════════════════════════════════════════════════════════════════"
echo "📊 RÉSUMÉ FINAL"
echo "════════════════════════════════════════════════════════════════════"
echo ""

TOTAL_INSTALLED=$(code --list-extensions 2>/dev/null | wc -l)
echo "📦 Extensions installées: $TOTAL_INSTALLED"
echo ""

echo "Détail par catégorie:"
echo "  🦀 Rust/Tauri (critiques): $CRITICAL_OK/${#CRITICAL_EXTENSIONS[@]}"
echo "  ⚛️  React/TypeScript: $REACT_OK/${#REACT_EXTENSIONS[@]}"
echo "  🎨 Tailwind/CSS: $TAILWIND_OK/${#TAILWIND_EXTENSIONS[@]}"
echo "  🧪 Testing/QA: $TESTING_OK/${#TESTING_EXTENSIONS[@]}"
echo "  🔍 Code Quality: $QUALITY_OK/${#QUALITY_EXTENSIONS[@]}"
echo "  🌳 Git: $GIT_OK/${#GIT_EXTENSIONS[@]}"
echo "  🛠️  Productivité: $PRODUCTIVITY_OK/${#PRODUCTIVITY_EXTENSIONS[@]}"
echo ""

if [ $CRITICAL_MISSING -gt 0 ]; then
    echo "⚠️  ATTENTION: $CRITICAL_MISSING extension(s) critique(s) manquante(s)"
    echo ""
    echo "Installez-les avec:"
    for ext in "${CRITICAL_EXTENSIONS[@]}"; do
        if ! code --list-extensions 2>/dev/null | grep -q "^$ext$"; then
            echo "  code --install-extension $ext"
        fi
    done
    echo ""
    exit 1
else
    echo "✅ Toutes les extensions critiques sont installées"
fi

echo ""
echo "════════════════════════════════════════════════════════════════════"
echo "✅ VALIDATION EXTENSIONS TERMINÉE"
echo "════════════════════════════════════════════════════════════════════"
echo ""
echo "Prochaines étapes:"
echo "1. Redémarrer VS Code si extensions récemment installées"
echo "2. Vérifier que Rust Analyzer est actif (icône dans la barre d'état)"
echo "3. Ouvrir un fichier .rs pour activer Rust Analyzer"
echo "4. Ouvrir un fichier .tsx pour activer TypeScript + Tailwind"
echo "5. Tester debug: F5 → 🚀 Debug Full Stack"
echo ""
