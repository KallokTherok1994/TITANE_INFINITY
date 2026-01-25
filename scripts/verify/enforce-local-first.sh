#!/bin/bash

# 🏠 TITANE∞ Local-First Enforcement
# Vérifie que toutes les ressources sont locales (pas de CDN, pas d'appels réseau automatiques)

echo "🔍 Vérification Local-First..."

ERRORS=0
WARNINGS=0

# 1. Vérifier fonts embarquées (pas de Google Fonts CDN)
echo "🔤 Check: Fonts locales..."
if grep -r "fonts.googleapis.com\|fonts.gstatic.com" src/ --include="*.html" --include="*.css" --include="*.tsx" 2>/dev/null; then
    echo "❌ Google Fonts CDN détecté (violation Local-first)"
    ((ERRORS++))
fi

# 2. Vérifier CDN JavaScript
echo "📦 Check: Pas de CDN JavaScript..."
if grep -r "cdn.jsdelivr.net\|unpkg.com\|cdnjs.cloudflare.com" src/ --include="*.html" --include="*.tsx" 2>/dev/null; then
    echo "❌ CDN JavaScript détecté (violation Local-first)"
    ((ERRORS++))
fi

# 3. Vérifier requêtes réseau annotées
echo "🌐 Check: Appels réseau annotés..."
# NOTE: l'ancien grep matchait des faux positifs (ex: "prefetch", commentaires, identifiants contenant "fetch").
# On détecte maintenant des patterns d'appel réseau plus stricts.

# Prettier peut déplacer `// @network-allowed` sur la ligne suivante.
# On compte donc un appel comme "annoté" si @network-allowed apparaît sur la ligne du match OU dans les 3 lignes suivantes.
NETWORK_CALLS=0
while IFS=: read -r FILE LINE _REST; do
    # Skip si le marqueur est proche (ligne du match -> +3)
    if sed -n "${LINE},$((LINE + 3))p" "$FILE" 2>/dev/null | grep -q "@network-allowed"; then
        continue
    fi
    ((NETWORK_CALLS++))
done < <(
    grep -RInE "(^|[^A-Za-z0-9_])(fetch[[:space:]]*\(|axios[[:space:]]*(\.|\()|new[[:space:]]+XMLHttpRequest\\b)" src/ --include="*.ts" --include="*.tsx" 2>/dev/null | \
        grep -vE ":[0-9]+:[[:space:]]*(//|\\*|/\\*)"
)

if [ "$NETWORK_CALLS" -gt 0 ]; then
    echo "⚠️ $NETWORK_CALLS appels réseau non annotés trouvés"
    echo "Ajouter // @network-allowed pour appels intentionnels (API OpenAI, Gemini)"
    ((WARNINGS++))
fi

# 4. Vérifier imports CDN dans index.html
echo "📄 Check: index.html sans CDN..."
if [ -f "index.html" ]; then
    if grep -q "https://\|http://" index.html 2>/dev/null; then
        echo "⚠️ URLs externes détectées dans index.html"
        ((WARNINGS++))
    fi
fi

# 5. Vérifier dépendances embarquées
echo "📚 Check: Dépendances locales..."
# Toutes les deps doivent être dans package.json (pas de <script src="https://...")
if grep -r "<script.*src=\"http" src/ --include="*.html" 2>/dev/null; then
    echo "❌ Script externe non embarqué détecté (violation Local-first)"
    ((ERRORS++))
fi

# Résultat
echo ""
if [ $ERRORS -eq 0 ]; then
    if [ $WARNINGS -eq 0 ]; then
        echo "✅ Local-first enforced: 0 erreurs, 0 warnings"
    else
        echo "✅ Local-first enforced: 0 erreurs, $WARNINGS warnings (non-bloquants)"
    fi
    exit 0
else
    echo "❌ Local-first violations: $ERRORS erreurs, $WARNINGS warnings"
    exit 1
fi
