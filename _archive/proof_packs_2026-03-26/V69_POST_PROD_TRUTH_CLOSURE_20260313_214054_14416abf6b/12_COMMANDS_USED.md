# Commands Used

Core commands executed in V69:
- git rev-parse HEAD
- git rev-parse origin/MAIN
- git status --porcelain=v1
- git cat-file -t <sha>
- sha256sum <artifact>
- timeout 35 <AppImage>
- env -u OFFLINE_SIM TAURI_BINARY_PATH=<AppImage> pnpm exec wdio run wdio.desktop.conf.cjs --spec e2e/desktop/v22_visible_real_ui_cert.wdio.test.js
- env -u OFFLINE_SIM TAURI_BINARY_PATH=<AppImage> pnpm exec wdio run wdio.desktop.conf.cjs --spec e2e/desktop/v25_visible_real_chat_functional_truth.wdio.test.js
- bash scripts/autoheal/detect_recurrence.sh
- bash scripts/verify_instructions.sh
- pnpm -s verify:registry

See raw files for exact outputs and exit codes.
