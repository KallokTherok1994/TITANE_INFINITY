#!/bin/bash
# Wrapper pour exécuter pnpm depuis Flatpak VS Code vers système hôte
/usr/bin/flatpak-spawn --host pnpm "$@"
