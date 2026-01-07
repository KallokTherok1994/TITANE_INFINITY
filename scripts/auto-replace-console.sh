#!/bin/bash
# TITANE∞ - Automated Console.log Replacement
# Usage: ./auto-replace-console.sh <file>

set -e

FILE="$1"

if [ -z "$FILE" ]; then
  echo "Usage: $0 <file>"
  exit 1
fi

if [ ! -f "$FILE" ]; then
  echo "Error: File not found: $FILE"
  exit 1
fi

echo "Processing: $FILE"

# Backup
cp "$FILE" "$FILE.bak"

# Replace console.log with logger.debug
sed -i "s/console\.log(/logger.debug(/g" "$FILE"

# Replace console.warn with logger.warn
sed -i "s/console\.warn(/logger.warn(/g" "$FILE"

# Replace console.error with logger.error
sed -i "s/console\.error(/logger.error(/g" "$FILE"

# Replace console.info with logger.info
sed -i "s/console\.info(/logger.info(/g" "$FILE"

# Remove [ServiceName] prefixes from messages (logger adds them automatically)
sed -i "s/'\[\([^]]*\)\] /'/g" "$FILE"
sed -i 's/"\[\([^]]*\)\] /"/g' "$FILE"

echo "✅ Replacements done"
echo "   Backup: $FILE.bak"

# Count replacements
LOGGER_COUNT=$(grep -c "logger\." "$FILE" || true)
CONSOLE_COUNT=$(grep -c "console\." "$FILE" || true)

echo "   Logger calls: $LOGGER_COUNT"
echo "   Console calls remaining: $CONSOLE_COUNT"
