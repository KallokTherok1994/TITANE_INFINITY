#!/bin/bash
# TITANE∞ v15.5 - Restauration Post-Migration Pop!_OS 24.04
# Restaure backup complet et réinstalle TITANE∞

set -e  # Arrêt si erreur

echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║                                                               ║"
echo "║  🔄 RESTAURATION BACKUP POST-MIGRATION                       ║"
echo "║                                                               ║"
echo "║  TITANE∞ v15.5 + Configs Système                            ║"
echo "║                                                               ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""

# Rechercher archives backup
echo "🔍 Recherche archives backup..."
BACKUP_ARCHIVES=$(find ~ -maxdepth 2 -name "Migration_TITANE_Backup_*.tar.gz" 2>/dev/null)

if [ -z "$BACKUP_ARCHIVES" ]; then
    echo "❌ Aucune archive backup trouvée"
    echo ""
    echo "Cherchez manuellement :"
    echo "  find ~ -name 'Migration_TITANE_Backup_*.tar.gz'"
    exit 1
fi

# Afficher archives trouvées
echo "📦 Archives trouvées :"
select BACKUP_FILE in $BACKUP_ARCHIVES; do
    if [ -n "$BACKUP_FILE" ]; then
        break
    fi
done

echo ""
echo "✅ Archive sélectionnée : $BACKUP_FILE"
echo ""

# Vérifier checksum si disponible
if [ -f "${BACKUP_FILE}.sha256" ]; then
    echo "🔐 Vérification checksum..."
    if sha256sum -c "${BACKUP_FILE}.sha256"; then
        echo "  ✅ Checksum valide"
    else
        echo "  ❌ Checksum invalide !"
        read -p "Continuer quand même ? (y/N) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
else
    echo "⚠️  Pas de checksum disponible"
fi
echo ""

# Extraction
BACKUP_DIR=$(basename "$BACKUP_FILE" .tar.gz)
EXTRACT_DIR="$HOME/$(dirname "$BACKUP_FILE" | xargs basename)"

echo "📂 Extraction de l'archive..."
cd "$HOME"
tar -xzf "$BACKUP_FILE"
echo "  ✅ Archive extraite : $HOME/$BACKUP_DIR"
echo ""

# 1. Restaurer TITANE∞
echo "🚀 1/6 Restauration TITANE∞..."
if [ -d "$HOME/$BACKUP_DIR/TITANE_NEWGEN" ]; then
    mkdir -p "$HOME/Documents"
    cp -r "$HOME/$BACKUP_DIR/TITANE_NEWGEN" "$HOME/Documents/"
    echo "  ✅ TITANE_NEWGEN restauré"
else
    echo "  ⚠️  TITANE_NEWGEN non trouvé dans backup"
fi
echo ""

# 2. Restaurer SSH
echo "🔑 2/6 Restauration clés SSH..."
if [ -d "$HOME/$BACKUP_DIR/.ssh" ]; then
    cp -r "$HOME/$BACKUP_DIR/.ssh" "$HOME/"
    chmod 700 "$HOME/.ssh"
    chmod 600 "$HOME/.ssh/"* 2>/dev/null || true
    echo "  ✅ Clés SSH restaurées"
else
    echo "  ⚠️  Clés SSH non trouvées dans backup"
fi
echo ""

# 3. Restaurer Git config
echo "🔧 3/6 Restauration config Git..."
if [ -f "$HOME/$BACKUP_DIR/.gitconfig" ]; then
    cp "$HOME/$BACKUP_DIR/.gitconfig" "$HOME/"
    echo "  ✅ .gitconfig restauré"
    git config --global user.name
    git config --global user.email
else
    echo "  ⚠️  .gitconfig non trouvé"
fi
echo ""

# 4. Restaurer VSCode settings
echo "💻 4/6 Restauration VSCode configs..."
if [ -d "$HOME/$BACKUP_DIR/.config/Code" ]; then
    mkdir -p "$HOME/.config/Code"
    cp -r "$HOME/$BACKUP_DIR/.config/Code/User" "$HOME/.config/Code/" 2>/dev/null || true
    echo "  ✅ VSCode settings restaurés"
else
    echo "  ⚠️  VSCode settings non trouvés"
fi
echo ""

# 5. Restaurer shell configs
echo "🐚 5/6 Restauration shells configs..."
for file in .bashrc .bash_profile .profile .zshrc; do
    if [ -f "$HOME/$BACKUP_DIR/$file" ]; then
        cp "$HOME/$BACKUP_DIR/$file" "$HOME/"
        echo "  ✅ $file restauré"
    fi
done
echo ""

# 6. Réinstaller TITANE∞
echo "📦 6/6 Réinstallation TITANE∞..."
if [ -d "$HOME/Documents/TITANE_NEWGEN/TITANE_INFINITY" ]; then
    cd "$HOME/Documents/TITANE_NEWGEN/TITANE_INFINITY"
    
    echo "  🧹 Nettoyage ancien build..."
    rm -rf node_modules dist src-tauri/target
    
    echo "  📦 Installation dépendances npm..."
    npm install
    
    echo "  🔧 Test build frontend..."
    npm run build
    
    echo "  ✅ TITANE∞ réinstallé"
else
    echo "  ❌ TITANE_INFINITY non trouvé"
fi
echo ""

# Résumé
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║                                                               ║"
echo "║  ✅ RESTAURATION TERMINÉE !                                  ║"
echo "║                                                               ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""
echo "📊 Éléments restaurés :"
echo "  ✅ TITANE∞ complet"
echo "  ✅ Clés SSH"
echo "  ✅ Config Git"
echo "  ✅ VSCode settings"
echo "  ✅ Shell configs"
echo ""
echo "🎯 Tests recommandés :"
echo "  cd ~/Documents/TITANE_NEWGEN/TITANE_INFINITY"
echo "  npm run dev              # Test frontend"
echo "  npm run tauri:dev        # Test Tauri complet"
echo "  npm run tauri:build      # Build production"
echo ""
echo "🔥 Si tout fonctionne, TITANE∞ est opérationnel sur Pop!_OS 24.04 !"
