# REPRODUCTION STRICTE

- commande_prod_canonique_build: pnpm run build:production
- commande_run_prod: runtime/stable/TITANE-Infinity_27.2.0_amd64.AppImage
- commande_executee: RUST_LOG=info RUST_BACKTRACE=1 TAURI_LOG_LEVEL=info timeout 25s runtime/stable/TITANE-Infinity_27.2.0_amd64.AppImage
- exit_code: 124
- etat_ui_observe: main window shown + page_load main
- duree_avant_arret_probe: 25s (timeout)
- dernier_log_visible: [2026-03-01T20:58:06.683Z INFO  ui] page_load label=avatar-floating url=tauri://localhost
- log_complet: proof_packs/PROD_ISOLATION_2026-03-01_1557_6c47b0253/repro_run.log
