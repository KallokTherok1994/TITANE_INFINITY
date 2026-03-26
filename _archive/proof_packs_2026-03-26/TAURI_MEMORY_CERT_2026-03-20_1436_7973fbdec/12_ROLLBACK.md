# 12_ROLLBACK

Commande de rollback minimale:

git restore -- e2e/desktop/online-chat-proof-ui.wdio.test.js scripts/e2e/run-online-chat-proof-ui.sh scripts/e2e/run-memory-chat-proof-ui.sh package.json scripts/autoheal/autoheal_rules.jsonl

Suppression du pack si nécessaire:

rm -rf proof_packs/TAURI_MEMORY_CERT_2026-03-20_1436_7973fbdec
