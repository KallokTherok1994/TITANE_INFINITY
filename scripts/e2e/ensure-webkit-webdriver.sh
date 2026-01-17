#!/bin/bash
# filepath: scripts/e2e/ensure-webkit-webdriver.sh

set -e

echo "🔍 Vérification de WebKitWebDriver..."

# Vérifier si WebKitWebDriver est dans le PATH
if command -v WebKitWebDriver >/dev/null 2>&1; then
  echo "✅ WebKitWebDriver trouvé dans le PATH : $(command -v WebKitWebDriver)"
  export WEBKIT_WEBDRIVER_PATH=$(command -v WebKitWebDriver)
  echo "DEBUG: WEBKIT_WEBDRIVER_PATH=$WEBKIT_WEBDRIVER_PATH"
  exit 0
fi

# Chemins probables
POSSIBLE_PATHS=(
  "/usr/libexec/webkit2gtk-4.1/WebKitWebDriver"
  "/usr/libexec/webkit2gtk-4.0/WebKitWebDriver"
  "/usr/lib/webkit2gtk-4.1/WebKitWebDriver"
  "/usr/lib/webkit2gtk-4.0/WebKitWebDriver"
)

for path in "${POSSIBLE_PATHS[@]}"; do
  if [ -x "$path" ]; then
    echo "✅ WebKitWebDriver trouvé : $path"
    export WEBKIT_WEBDRIVER_PATH="$path"
    echo "DEBUG: WEBKIT_WEBDRIVER_PATH=$WEBKIT_WEBDRIVER_PATH"
    exit 0
  fi
done

# Si non trouvé, afficher un message d'erreur clair
echo "❌ WebKitWebDriver introuvable."
echo "Pour l'installer sur Ubuntu/Pop!_OS, exécutez les commandes suivantes :"
echo ""
echo "sudo apt update"
echo "sudo apt install -y webkit2gtk-driver"
echo ""
echo "Après installation, vérifiez avec : which WebKitWebDriver"
exit 1