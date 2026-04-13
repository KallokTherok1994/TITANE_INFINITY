#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════
#   TITANE∞ — Install / Enable / Disable systemd user units
#   Usage:
#     ./install-services.sh install    # installe et active toutes les unités
#     ./install-services.sh enable     # active sans réinstaller
#     ./install-services.sh disable    # désactive et retire les unités
#     ./install-services.sh status     # affiche l'état de toutes les unités
# ═══════════════════════════════════════════════════════════════════════════

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SYSTEMD_USER_DIR="${XDG_CONFIG_HOME:-$HOME/.config}/systemd/user"
ACTION="${1:-status}"

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log()     { echo -e "${BLUE}[install-services]${NC} $*"; }
success() { echo -e "${GREEN}✅${NC} $*"; }
warn()    { echo -e "${YELLOW}⚠️${NC}  $*"; }
fail()    { echo -e "${RED}❌${NC} $*" >&2; }

# Units managed by this script (user-scoped)
USER_UNITS=(
    "titane-infinity.service"
    "titane-watchdog.timer"
    "titane-watchdog.service"
    "titane-alert@.service"
    "titane-auto-heal.timer"
    "titane-auto-heal.service"
)

check_systemd() {
    if ! command -v systemctl &>/dev/null; then
        fail "systemd non disponible"
        exit 1
    fi
    if ! systemctl --user show-environment &>/dev/null; then
        fail "Session systemd --user inaccessible (vérifiez que loginctl enable-linger est actif)"
        exit 1
    fi
}

do_install() {
    log "Installation des unités systemd user…"
    mkdir -p "$SYSTEMD_USER_DIR"

    for unit in "${USER_UNITS[@]}"; do
        local src="$SCRIPT_DIR/$unit"
        local dst="$SYSTEMD_USER_DIR/$unit"

        if [[ ! -f "$src" ]]; then
            warn "Source manquante (skip): $src"
            continue
        fi

        cp -f "$src" "$dst"
        chmod 644 "$dst"
        success "Installé: $dst"
    done

    systemctl --user daemon-reload
    success "daemon-reload OK"

    # Enable timers + service
    systemctl --user enable --now titane-watchdog.timer   || warn "titane-watchdog.timer: enable partiel"
    systemctl --user enable --now titane-auto-heal.timer  || warn "titane-auto-heal.timer: enable partiel"
    systemctl --user enable titane-infinity.service       || warn "titane-infinity.service: enable partiel"

    success "Unités activées."
    echo ""
    do_status
}

do_enable() {
    systemctl --user daemon-reload
    systemctl --user enable --now titane-watchdog.timer
    systemctl --user enable --now titane-auto-heal.timer
    systemctl --user enable titane-infinity.service
    success "Activé."
    do_status
}

do_disable() {
    log "Désactivation des unités…"
    systemctl --user disable --now titane-watchdog.timer   2>/dev/null || true
    systemctl --user disable --now titane-auto-heal.timer  2>/dev/null || true
    systemctl --user disable titane-infinity.service       2>/dev/null || true
    systemctl --user stop titane-infinity.service          2>/dev/null || true

    for unit in "${USER_UNITS[@]}"; do
        rm -f "$SYSTEMD_USER_DIR/$unit" && log "Retiré: $unit"
    done

    systemctl --user daemon-reload
    success "Unités désactivées et retirées."
}

do_status() {
    log "État des unités TITANE∞:"
    echo ""
    for unit in "${USER_UNITS[@]}"; do
        # Skip template units for status
        [[ "$unit" == *"@."* ]] && continue
        local state
        state=$(systemctl --user is-active "$unit" 2>/dev/null || true)
        [[ -n "$state" ]] || state="unknown"
        local enabled
        enabled=$(systemctl --user is-enabled "$unit" 2>/dev/null || true)
        [[ -n "$enabled" ]] || enabled="unknown"
        printf "  %-40s active=%-10s enabled=%s\n" "$unit" "$state" "$enabled"
    done
    echo ""
}

# ─── main ─────────────────────────────────────────────────────────────────
check_systemd

case "$ACTION" in
    install)  do_install ;;
    enable)   do_enable ;;
    disable)  do_disable ;;
    status)   do_status ;;
    *)
        echo "Usage: $0 {install|enable|disable|status}"
        exit 1
        ;;
esac
