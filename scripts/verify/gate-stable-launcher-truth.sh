#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)
cd "$ROOT_DIR"

PASS=0
FAIL=0
BLOCKED=0
pass() { echo "PASS: $1"; PASS=$((PASS+1)); }
fail() { echo "FAIL: $1"; FAIL=$((FAIL+1)); }
blocked() { echo "BLOCKED: $1"; BLOCKED=$((BLOCKED+1)); }

PACKAGE_VERSION=$(node -e "process.stdout.write(require('./package.json').version)" 2>/dev/null || echo "")
if [[ -z "$PACKAGE_VERSION" ]]; then
  fail "PACKAGE_VERSION_UNREADABLE"
  echo "SUMMARY: FAIL=$FAIL"; exit 1
fi

DESKTOP_FILE="$HOME/.local/share/applications/titane-infinity.desktop"

if [[ ! -f "$DESKTOP_FILE" ]]; then
  blocked "USER_DESKTOP_FILE_MISSING"
  echo "SUMMARY: BLOCKED=$BLOCKED"; exit 1
fi
pass "USER_DESKTOP_FILE_PRESENT"

EXEC_LINE=$(grep -m1 '^Exec=' "$DESKTOP_FILE" | sed 's/^Exec=//' | awk '{print $1}')
if [[ -z "$EXEC_LINE" ]]; then
  fail "DESKTOP_EXEC_LINE_MISSING"
  echo "SUMMARY: FAIL=$FAIL"; exit 1
fi

if [[ ! -e "$EXEC_LINE" ]]; then
  fail "DESKTOP_EXEC_TARGET_MISSING ($EXEC_LINE)"
else
  pass "DESKTOP_EXEC_TARGET_EXISTS ($EXEC_LINE)"
fi

# Classify Exec target type
if [[ "$EXEC_LINE" == *.AppImage ]]; then
  # Exec points to AppImage: verify it is the fresh stable artifact
  LATEST_APPIMAGE=$(find runtime/stable -maxdepth 1 -name "*.AppImage" -type f -executable 2>/dev/null | sort -t_ -k2 -Vr | head -1)
  if [[ -z "$LATEST_APPIMAGE" ]]; then
    blocked "STABLE_APPIMAGE_NOT_FOUND_FOR_COMPARISON"
  elif [[ "$(realpath "$EXEC_LINE" 2>/dev/null)" == "$(realpath "$LATEST_APPIMAGE" 2>/dev/null)" ]]; then
    pass "DESKTOP_EXEC_POINTS_TO_FRESH_APPIMAGE"
    pass "USER_LOCAL_LAUNCHER_FRESH"
    # System install remains stale — /usr/bin not updated without sudo
    blocked "SYSTEM_INSTALL_STALE (user-local launcher updated; /usr/bin/titane-infinity still requires sudo to update)"
    blocked "BLOCKED_SUDO_REQUIRED (sudo dpkg -i required to update /usr/bin)"
  else
    fail "DESKTOP_EXEC_POINTS_TO_DIFFERENT_APPIMAGE (exec=$EXEC_LINE latest=$LATEST_APPIMAGE)"
  fi
elif [[ "$EXEC_LINE" == /usr/bin/* ]]; then
  # Exec points to /usr/bin system binary
  pass "DESKTOP_EXEC_POINTS_TO_SYSTEM_BINARY ($EXEC_LINE)"

  if [[ ! -x "$EXEC_LINE" ]]; then
    fail "SYSTEM_BINARY_NOT_EXECUTABLE ($EXEC_LINE)"
  else
    pass "SYSTEM_BINARY_EXECUTABLE"
  fi

  # Check desktop file Name= for version string
  DESKTOP_NAME=$(grep -m1 '^Name=' "$DESKTOP_FILE" | sed 's/^Name=//')
  if echo "$DESKTOP_NAME" | grep -q "$PACKAGE_VERSION"; then
    pass "DESKTOP_NAME_MATCHES_PACKAGE_VERSION ($PACKAGE_VERSION)"
    pass "INSTALLED_LAUNCHER_FRESH"
  else
    fail "DESKTOP_NAME_VERSION_MISMATCH (desktop='$DESKTOP_NAME' package=$PACKAGE_VERSION)"
    blocked "INSTALLED_LAUNCHER_STALE"
  fi

  # Cannot verify installed binary version without running it — classify as blocked
  blocked "INSTALLED_BINARY_VERSION_UNKNOWN (version probe requires interactive launch)"
  blocked "SYSTEM_SYNC_REQUIRES_SUDO (update /usr/bin requires sudo)"
else
  fail "DESKTOP_EXEC_UNKNOWN_TARGET_TYPE ($EXEC_LINE)"
fi

echo ""
if [[ $FAIL -gt 0 ]]; then
  echo "SUMMARY: PASS=$PASS FAIL=$FAIL BLOCKED=$BLOCKED"
  exit 1
fi
echo "SUMMARY: PASS=$PASS BLOCKED=$BLOCKED"
