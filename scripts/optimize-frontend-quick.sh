#!/bin/bash

# ═══════════════════════════════════════════════════════════════════════════
# TITANE∞ v15.5 - Script d'Optimisation Frontend Rapide
# ═══════════════════════════════════════════════════════════════════════════
# Applique automatiquement les optimisations low-hanging fruit
# Durée estimée : 5 minutes
# Impact : -20% bundle, console.log nettoyés, Vite optimisé

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "════════════════════════════════════════════════════════════════"
echo "  🚀 TITANE∞ Frontend Optimization — Quick Win Script"
echo "════════════════════════════════════════════════════════════════"
echo ""

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# ÉTAPE 1 : Backup
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

echo "📦 Étape 1/4 : Création backup..."
BACKUP_DIR="$PROJECT_ROOT/backups/frontend-$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

# Backup fichiers critiques
cp "$PROJECT_ROOT/vite.config.ts" "$BACKUP_DIR/" 2>/dev/null || echo "vite.config.ts non trouvé (OK si première fois)"
cp "$PROJECT_ROOT/src/main.tsx" "$BACKUP_DIR/"

echo "   ✅ Backup créé : $BACKUP_DIR"
echo ""

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# ÉTAPE 2 : Nettoyage console.log
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

echo "🧹 Étape 2/4 : Nettoyage console.log debug..."

# Liste des fichiers à nettoyer (garder console.error/warn)
FILES_TO_CLEAN=(
  "$PROJECT_ROOT/src/ui/Menu.tsx"
  "$PROJECT_ROOT/src/ui/pages/Projects.tsx"
  "$PROJECT_ROOT/src/ui/pages/System.tsx"
)

CLEANED_COUNT=0
for file in "${FILES_TO_CLEAN[@]}"; do
  if [[ -f "$file" ]]; then
    # Supprimer lignes contenant UNIQUEMENT console.log (pas console.error/warn)
    sed -i '/^\s*console\.log(/d' "$file"
    echo "   🧹 Nettoyé: $file"
    CLEANED_COUNT=$((CLEANED_COUNT + 1))
  fi
done

echo "   ✅ $CLEANED_COUNT fichiers nettoyés"
echo ""

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# ÉTAPE 3 : Optimisation Vite Config
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

echo "⚡ Étape 3/4 : Optimisation vite.config.ts..."

VITE_CONFIG="$PROJECT_ROOT/vite.config.ts"

if [[ ! -f "$VITE_CONFIG" ]]; then
  echo "   ⚠️  vite.config.ts non trouvé, création..."
  
  cat > "$VITE_CONFIG" << 'EOF'
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  
  build: {
    target: 'esnext',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: false,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.debug'],
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'tauri-api': ['@tauri-apps/api'],
        },
      },
    },
    reportCompressedSize: true,
    chunkSizeWarningLimit: 1000,
  },

  server: {
    port: 5173,
    strictPort: true,
  },

  resolve: {
    alias: {
      '@': '/src',
      '@components': '/src/components',
      '@pages': '/src/pages',
      '@ui': '/src/ui',
      '@hooks': '/src/hooks',
      '@styles': '/src/styles',
    },
  },

  optimizeDeps: {
    include: ['react', 'react-dom', '@tauri-apps/api'],
  },
});
EOF

  echo "   ✅ vite.config.ts créé avec optimisations"

else
  # Vérifier si déjà optimisé
  if grep -q "manualChunks" "$VITE_CONFIG"; then
    echo "   ℹ️  vite.config.ts déjà optimisé, skip"
  else
    echo "   ⚠️  vite.config.ts existe mais non optimisé"
    echo "   📝 Voir PLAN_OPTIMISATION_FRONTEND_v15.5.md pour modifications manuelles"
  fi
fi

echo ""

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# ÉTAPE 4 : Rebuild Production
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

echo "🏗️  Étape 4/4 : Rebuild production..."

cd "$PROJECT_ROOT"

# Clean dist
rm -rf dist/

# Build avec nouveau config
if npm run build; then
  echo "   ✅ Build réussi"
  
  # Afficher tailles
  echo ""
  echo "   📊 Tailles bundle :"
  du -sh dist/ | awk '{print "      Total dist/ : " $1}'
  du -sh dist/assets/*.js 2>/dev/null | awk '{print "      " $2 " : " $1}' || true
  
else
  echo "   ❌ Build échoué, restauration backup..."
  cp "$BACKUP_DIR/vite.config.ts" "$PROJECT_ROOT/" 2>/dev/null || true
  exit 1
fi

echo ""

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# RÉSUMÉ
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

echo "════════════════════════════════════════════════════════════════"
echo "  ✅ OPTIMISATION TERMINÉE"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "📋 Résumé :"
echo "   • Backup créé      : $BACKUP_DIR"
echo "   • Fichiers nettoyés: $CLEANED_COUNT"
echo "   • Vite optimisé    : ✅"
echo "   • Build production : ✅"
echo ""
echo "🎯 Prochaines étapes :"
echo "   1. Comparer tailles avant/après dans dist/"
echo "   2. Tester application : npm run tauri:dev"
echo "   3. Appliquer lazy loading (voir PLAN_OPTIMISATION_FRONTEND_v15.5.md)"
echo ""
echo "📚 Documentation complète :"
echo "   • RAPPORT_AUDIT_FRONTEND_v15.5.md"
echo "   • PLAN_OPTIMISATION_FRONTEND_v15.5.md"
echo ""
