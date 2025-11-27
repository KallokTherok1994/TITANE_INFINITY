#!/bin/bash
# TITANE∞ OS - Installateur Graphique (Zenity Edition)
# © 2025 Humain Total / Kevin Thibault

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
INSTALL_DIR="/opt/TITANE_Infinity"

# Vérifier Zenity
if ! command -v zenity &> /dev/null; then
    echo "❌ Zenity n'est pas installé. Installation..."
    sudo apt-get update && sudo apt-get install -y zenity
fi

# Fonction pour afficher les erreurs
show_error() {
    zenity --error \
        --title="TITANE∞ OS - Erreur" \
        --text="$1" \
        --width=400
}

# Fonction pour afficher les informations
show_info() {
    zenity --info \
        --title="TITANE∞ OS" \
        --text="$1" \
        --width=400
}

# Fonction pour afficher une progression
show_progress() {
    zenity --progress \
        --title="TITANE∞ OS - Installation" \
        --text="$1" \
        --percentage=0 \
        --auto-close \
        --width=500
}

# ═══════════════════════════════════════════════════════════════
# BIENVENUE
# ═══════════════════════════════════════════════════════════════

zenity --info \
    --title="TITANE∞ OS Installer" \
    --text="<big><b>Bienvenue dans TITANE∞ OS Installer</b></big>\n\n\
Version: v16.2.2 (Latest - 27 Nov 2025)\n\
Installation native, locale et sécurisée\n\
✅ Chat IA corrigé - Cognitive Layer v16 - 20 Engines\n\n\
<i>Ce programme va installer TITANE∞ OS sur votre système.</i>" \
    --width=550 \
    --height=250

# ═══════════════════════════════════════════════════════════════
# SÉLECTION DU MODE D'INSTALLATION
# ═══════════════════════════════════════════════════════════════

CHOICE=$(zenity --list \
    --title="TITANE∞ OS - Mode d'installation" \
    --text="Sélectionnez le mode d'installation :" \
    --radiolist \
    --column="Sélection" \
    --column="Mode" \
    --column="Description" \
    TRUE "Installation complète" "Installation complète avec toutes les dépendances" \
    FALSE "Réinstallation" "Réinstaller TITANE∞ OS (conserve les données)" \
    FALSE "Réparation (Self-Heal)" "Réparer l'installation existante" \
    FALSE "Mise à jour" "Mettre à jour vers la dernière version" \
    --width=600 \
    --height=300)

if [ $? -ne 0 ]; then
    show_info "Installation annulée par l'utilisateur."
    exit 0
fi

# ═══════════════════════════════════════════════════════════════
# EXÉCUTION SELON LE MODE SÉLECTIONNÉ
# ═══════════════════════════════════════════════════════════════

case "$CHOICE" in
    "Installation complète")
        echo "Mode: Installation complète"

        # Pipeline d'installation avec barre de progression
        (
        echo "0" ; echo "# Vérification des prérequis système..."
        bash "$SCRIPT_DIR/modules/pre_checks.sh" 2>&1 | tee /tmp/titane_install.log || {
            show_error "Échec de la vérification des prérequis.\nConsultez /tmp/titane_install.log"
            exit 1
        }

        echo "10" ; echo "# Installation des dépendances..."
        bash "$SCRIPT_DIR/modules/install_dependencies.sh" 2>&1 | tee -a /tmp/titane_install.log

        echo "25" ; echo "# Compilation du Frontend (React + Vite)..."
        bash "$SCRIPT_DIR/modules/build_frontend.sh" 2>&1 | tee -a /tmp/titane_install.log

        echo "50" ; echo "# Compilation du Backend (Rust + Tauri)..."
        bash "$SCRIPT_DIR/modules/build_backend.sh" 2>&1 | tee -a /tmp/titane_install.log

        echo "70" ; echo "# Build de l'application Tauri..."
        bash "$SCRIPT_DIR/modules/build_tauri.sh" 2>&1 | tee -a /tmp/titane_install.log

        echo "85" ; echo "# Déploiement sur le système..."
        bash "$SCRIPT_DIR/modules/deploy_os.sh" 2>&1 | tee -a /tmp/titane_install.log

        echo "95" ; echo "# Création du raccourci OS..."
        bash "$SCRIPT_DIR/modules/create_desktop_entry.sh" 2>&1 | tee -a /tmp/titane_install.log

        echo "100" ; echo "# Installation terminée !"
        sleep 1
        ) | zenity --progress \
            --title="TITANE∞ OS - Installation en cours" \
            --text="Préparation..." \
            --percentage=0 \
            --auto-close \
            --width=500

        if [ $? -eq 0 ]; then
            # Post-installation
            bash "$SCRIPT_DIR/modules/post_install.sh" 2>&1 | tee -a /tmp/titane_install.log

            # Succès
            zenity --question \
                --title="TITANE∞ OS - Installation terminée" \
                --text="<big><b>✅ TITANE∞ OS installé avec succès !</b></big>\n\n\
Installation: $INSTALL_DIR\n\
Logs: /tmp/titane_install.log\n\n\
Voulez-vous lancer TITANE∞ OS maintenant ?" \
                --width=500 \
                --ok-label="Lancer" \
                --cancel-label="Fermer"

            if [ $? -eq 0 ]; then
                "$INSTALL_DIR/titane-infinity" &
            fi
        else
            show_error "Installation échouée.\nConsultez les logs: /tmp/titane_install.log"
        fi
        ;;

    "Réinstallation")
        zenity --question \
            --title="TITANE∞ OS - Réinstallation" \
            --text="⚠️  Confirmer la réinstallation ?\n\nCela va écraser l'installation actuelle." \
            --width=400

        if [ $? -eq 0 ]; then
            (
            echo "20" ; echo "# Nettoyage de l'installation précédente..."
            sudo rm -rf "$INSTALL_DIR"

            echo "40" ; echo "# Rebuild complet..."
            bash "$PROJECT_DIR/auto_build.sh" 2>&1 | tee /tmp/titane_reinstall.log

            echo "80" ; echo "# Redéploiement..."
            bash "$SCRIPT_DIR/modules/deploy_os.sh" 2>&1 | tee -a /tmp/titane_reinstall.log

            echo "100" ; echo "# Réinstallation terminée !"
            ) | show_progress "Réinstallation en cours..."

            show_info "✅ TITANE∞ OS réinstallé avec succès !"
        fi
        ;;

    "Réparation (Self-Heal)")
        (
        echo "25" ; echo "# Analyse du système..."
        echo "50" ; echo "# Réparation en cours..."
        bash "$PROJECT_DIR/installer/self_heal.sh" 2>&1 | tee /tmp/titane_repair.log
        echo "100" ; echo "# Réparation terminée !"
        ) | show_progress "Réparation TITANE∞ OS..."

        show_info "✅ Réparation TITANE∞ OS terminée !\n\nConsultez /tmp/titane_repair.log pour les détails."
        ;;

    "Mise à jour")
        (
        echo "33" ; echo "# Vérification des mises à jour..."
        echo "66" ; echo "# Téléchargement et rebuild..."
        bash "$PROJECT_DIR/installer/update.sh" 2>&1 | tee /tmp/titane_update.log
        echo "100" ; echo "# Mise à jour terminée !"
        ) | show_progress "Mise à jour TITANE∞ OS..."

        show_info "✅ TITANE∞ OS mis à jour avec succès !"
        ;;
esac

exit 0
