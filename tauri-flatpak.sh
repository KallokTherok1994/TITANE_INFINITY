#!/bin/bash
# Wrapper pour exécuter les commandes Tauri depuis Flatpak VS Code

# Fonction helper
run_on_host() {
    /usr/bin/flatpak-spawn --host "$@"
}

case "$1" in
    "dev")
        echo "🚀 Lancement de Tauri en mode dev..."
        run_on_host bash -c "cd '$PWD' && source ~/.cargo/env && pnpm tauri dev"
        ;;
    "build")
        echo "🔨 Build de production..."
        run_on_host bash -c "cd '$PWD' && source ~/.cargo/env && pnpm tauri build"
        ;;
    "check")
        echo "🔍 Vérification Rust..."
        run_on_host bash -c "cd '$PWD' && source ~/.cargo/env && cargo check --manifest-path src-tauri/Cargo.toml"
        ;;
    "test")
        echo "🧪 Tests Rust..."
        run_on_host bash -c "cd '$PWD' && source ~/.cargo/env && cargo test --manifest-path src-tauri/Cargo.toml"
        ;;
    "validate")
        echo "✅ Validation complète..."
        run_on_host bash -c "cd '$PWD' && source ~/.cargo/env && ./validate_v17.sh"
        ;;
    *)
        echo "Usage: $0 {dev|build|check|test|validate}"
        echo ""
        echo "Commandes disponibles:"
        echo "  dev       - Lancer en mode développement"
        echo "  build     - Build de production"
        echo "  check     - Vérifier la compilation Rust"
        echo "  test      - Lancer les tests"
        echo "  validate  - Valider le projet complet"
        exit 1
        ;;
esac
