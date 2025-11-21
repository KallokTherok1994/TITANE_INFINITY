#!/bin/bash
# TITANE∞ v15.5 - Script de Backup Complet Pré-Migration
# Sauvegarde tous les éléments critiques avant upgrade Pop!_OS 24.04

set -e  # Arrêt si erreur

echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║                                                               ║"
echo "║  🔒 BACKUP COMPLET PRÉ-MIGRATION POP!_OS 24.04              ║"
echo "║                                                               ║"
echo "║  TITANE∞ v15.5 + Configs Système + SSH + Git                ║"
echo "║                                                               ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""

# Destination backup
BACKUP_DIR="$HOME/Migration_TITANE_Backup_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

echo "📂 Dossier de backup : $BACKUP_DIR"
echo ""

# 1. TITANE∞ Project
echo "🚀 1/8 Sauvegarde TITANE∞..."
if [ -d "$HOME/Documents/TITANE_NEWGEN" ]; then
    cp -r "$HOME/Documents/TITANE_NEWGEN" "$BACKUP_DIR/TITANE_NEWGEN"
    echo "  ✅ TITANE_NEWGEN sauvegardé ($(du -sh "$HOME/Documents/TITANE_NEWGEN" | cut -f1))"
else
    echo "  ⚠️  TITANE_NEWGEN non trouvé"
fi
echo ""

# 2. SSH Keys
echo "🔑 2/8 Sauvegarde clés SSH..."
if [ -d "$HOME/.ssh" ]; then
    cp -r "$HOME/.ssh" "$BACKUP_DIR/.ssh"
    chmod 700 "$BACKUP_DIR/.ssh"
    chmod 600 "$BACKUP_DIR/.ssh/"* 2>/dev/null || true
    echo "  ✅ Clés SSH sauvegardées ($(ls -1 "$HOME/.ssh" | wc -l) fichiers)"
else
    echo "  ⚠️  Pas de dossier .ssh"
fi
echo ""

# 3. Git Config
echo "🔧 3/8 Sauvegarde config Git..."
if [ -f "$HOME/.gitconfig" ]; then
    cp "$HOME/.gitconfig" "$BACKUP_DIR/.gitconfig"
    echo "  ✅ .gitconfig sauvegardé"
    git config --global user.name && git config --global user.email
fi
echo ""

# 4. VSCode Settings
echo "💻 4/8 Sauvegarde VSCode configs..."
if [ -d "$HOME/.config/Code" ]; then
    mkdir -p "$BACKUP_DIR/.config/Code"
    cp -r "$HOME/.config/Code/User" "$BACKUP_DIR/.config/Code/" 2>/dev/null || true
    echo "  ✅ VSCode User settings sauvegardés"
fi
echo ""

# 5. Bash/Zsh configs
echo "🐚 5/8 Sauvegarde shells configs..."
for file in .bashrc .bash_profile .profile .zshrc; do
    if [ -f "$HOME/$file" ]; then
        cp "$HOME/$file" "$BACKUP_DIR/$file"
        echo "  ✅ $file sauvegardé"
    fi
done
echo ""

# 6. Cargo/Rust config
echo "🦀 6/8 Sauvegarde Rust/Cargo..."
if [ -d "$HOME/.cargo" ]; then
    mkdir -p "$BACKUP_DIR/.cargo"
    cp "$HOME/.cargo/config.toml" "$BACKUP_DIR/.cargo/" 2>/dev/null || true
    echo "  ✅ Cargo config sauvegardé"
fi
echo ""

# 7. NPM global packages list
echo "📦 7/8 Liste packages npm globaux..."
if command -v npm &> /dev/null; then
    npm list -g --depth=0 > "$BACKUP_DIR/npm_global_packages.txt" 2>/dev/null || true
    echo "  ✅ Liste npm globaux sauvegardée"
fi
echo ""

# 8. System info
echo "📊 8/8 Sauvegarde infos système..."
cat > "$BACKUP_DIR/system_info.txt" << EOF
BACKUP DATE: $(date)
HOSTNAME: $(hostname)
OS: $(cat /etc/os-release | grep PRETTY_NAME)
KERNEL: $(uname -r)
GLIBC: $(ldd --version | head -1)
NODE: $(node --version 2>/dev/null || echo "N/A")
NPM: $(npm --version 2>/dev/null || echo "N/A")
CARGO: $(cargo --version 2>/dev/null || echo "N/A")
RUSTC: $(rustc --version 2>/dev/null || echo "N/A")
EOF
cat "$BACKUP_DIR/system_info.txt"
echo ""

# Créer archive compressée
echo "📦 Compression du backup..."
cd "$(dirname "$BACKUP_DIR")"
tar -czf "${BACKUP_DIR}.tar.gz" "$(basename "$BACKUP_DIR")" 2>/dev/null || true
BACKUP_SIZE=$(du -sh "${BACKUP_DIR}.tar.gz" 2>/dev/null | cut -f1 || echo "N/A")
echo "  ✅ Archive créée : ${BACKUP_DIR}.tar.gz ($BACKUP_SIZE)"
echo ""

# Checksum
echo "🔐 Génération checksum..."
sha256sum "${BACKUP_DIR}.tar.gz" > "${BACKUP_DIR}.tar.gz.sha256"
echo "  ✅ Checksum SHA256 généré"
echo ""

# Instructions finales
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║                                                               ║"
echo "║  ✅ BACKUP TERMINÉ !                                         ║"
echo "║                                                               ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""
echo "📂 Localisation :"
echo "  Dossier : $BACKUP_DIR"
echo "  Archive : ${BACKUP_DIR}.tar.gz ($BACKUP_SIZE)"
echo ""
echo "📋 Contenu sauvegardé :"
echo "  ✅ TITANE∞ complet"
echo "  ✅ Clés SSH"
echo "  ✅ Config Git"
echo "  ✅ VSCode settings"
echo "  ✅ Shell configs (.bashrc, .profile)"
echo "  ✅ Cargo/Rust config"
echo "  ✅ Liste npm global"
echo "  ✅ Infos système"
echo ""
echo "💾 COPIEZ L'ARCHIVE SUR DISQUE EXTERNE :"
echo "  cp ${BACKUP_DIR}.tar.gz /media/VOTRE_DISQUE/"
echo ""
echo "🔴 IMPORTANT : Avant d'installer Pop!_OS 24.04 :"
echo "  1. Vérifiez que l'archive existe"
echo "  2. Vérifiez le checksum :"
echo "     sha256sum -c ${BACKUP_DIR}.tar.gz.sha256"
echo "  3. Copiez sur disque externe/USB"
echo ""
echo "📖 Après installation Pop!_OS 24.04 :"
echo "  Exécutez : ./restore-after-migration.sh"
