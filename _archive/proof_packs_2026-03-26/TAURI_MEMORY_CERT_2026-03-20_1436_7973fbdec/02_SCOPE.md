# 02_SCOPE

- Inclus:
  - câblage d'un mode mémoire multi-tour dans e2e/desktop/online-chat-proof-ui.wdio.test.js
  - wrapper dédié scripts/e2e/run-memory-chat-proof-ui.sh
  - script package e2e:desktop:proof:memory-chat
  - durcissement du harness WDIO pour timeout mémoire et réponses compactes
- Exclus:
  - lane browser Playwright
  - refactor des services mémoire backend
  - correction des warnings runtime historiques non bloquants hors certification mémoire
