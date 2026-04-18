#!/bin/sh

set -eu

PACKAGE_NAME="titan-stable"
CANONICAL_DESKTOP_NAME="titane-infinity.desktop"
LEGACY_DESKTOP_NAME="Titan-Stable.desktop"
SYSTEM_APPLICATIONS_DIR="/usr/share/applications"
SYSTEM_DESKTOP_PATH="$SYSTEM_APPLICATIONS_DIR/$CANONICAL_DESKTOP_NAME"
SYSTEM_LEGACY_DESKTOP_PATH="$SYSTEM_APPLICATIONS_DIR/$LEGACY_DESKTOP_NAME"

resolve_home_dir() {
  getent passwd "$1" | cut -d: -f6
}

package_version="$(dpkg-query -W -f='${Version}\n' "$PACKAGE_NAME" 2>/dev/null | head -n 1)"
if [ -z "$package_version" ]; then
  package_version="unknown"
fi

target_user="${SUDO_USER:-}"
target_home=""

if [ -n "$target_user" ]; then
  target_home="$(resolve_home_dir "$target_user")"
fi

write_desktop_entry() {
  desktop_path="$1"
  config_home="$2"

  mkdir -p "$(dirname "$desktop_path")"

  cat > "$desktop_path" <<EOF
[Desktop Entry]
Version=1.0
Type=Application
Name=TITANE∞ v$package_version
Comment=Cognitive OS - Multi-Provider AI - Production Perfect
Exec=/usr/bin/titane-infinity
Icon=titane-infinity
Terminal=false
Categories=Development;Utility;AI;
Keywords=AI;Chat;Cognitive;System;Memory;Singularity;
StartupWMClass=titane-infinity
StartupNotify=true
Actions=DevMode;Logs;Config;

[Desktop Action DevMode]
Name=Developer Mode
Exec=env TITANE_DEVTOOLS=1 /usr/bin/titane-infinity

[Desktop Action Logs]
Name=View Logs
Exec=sh -lc 'mkdir -p "$config_home/.titane/logs" && x-terminal-emulator -e tail -f "$config_home/.titane/logs/titane.log"'

[Desktop Action Config]
Name=Configuration
Exec=xdg-open $config_home/.titane/
EOF

  chmod 644 "$desktop_path"
}

rm -f "$SYSTEM_LEGACY_DESKTOP_PATH"
write_desktop_entry "$SYSTEM_DESKTOP_PATH" "${target_home:-$HOME}"

if [ -n "$target_home" ] && [ -d "$target_home" ]; then
  user_applications_dir="$target_home/.local/share/applications"
  user_desktop_path="$user_applications_dir/$CANONICAL_DESKTOP_NAME"
  user_legacy_desktop_path="$user_applications_dir/$LEGACY_DESKTOP_NAME"

  rm -f "$user_legacy_desktop_path"
  write_desktop_entry "$user_desktop_path" "$target_home"
  chown "$target_user":"$target_user" "$user_desktop_path"
fi

if command -v update-desktop-database >/dev/null 2>&1; then
  update-desktop-database "$SYSTEM_APPLICATIONS_DIR" >/dev/null 2>&1 || true
fi

if command -v xdg-desktop-menu >/dev/null 2>&1; then
  xdg-desktop-menu forceupdate >/dev/null 2>&1 || true
fi