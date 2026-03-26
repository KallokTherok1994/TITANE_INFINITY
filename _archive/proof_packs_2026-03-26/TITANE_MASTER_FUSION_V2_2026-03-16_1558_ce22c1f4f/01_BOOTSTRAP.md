# 01 - Bootstrap

## Preuves capturees
- Source brute: raw/bootstrap_capture.txt
- Source identification: raw/identification_capture.txt
- Extraits: raw/bootstrap_headlines.txt, raw/identification_headlines.txt

## Faits constates
- Branche active: MAIN
- HEAD: ce22c1f4f
- Runtime outillage: Node v24.0.0, pnpm 10.30.2, cargo 1.94.0, rustc 1.94.0
- Cible desktop: src-tauri/tauri.conf.json (productName TITANE-Infinity, identifier com.titane.infinity)
- Autorite E2E desktop detectee: scripts/e2e/run-online-chat-proof-ui.sh + wdio.desktop.conf.cjs + scripts/e2e/tauri-wrapper.sh

## Classification bootstrap
| Axe | Statut |
|---|---|
| target truth | PASS |
| stale artifact risk | PASS |
| harness authority risk | BLOCKED |
| product authority risk | BLOCKED |
| settings baseline | PASS |
| memory baseline | PASS |
| provider baseline | PASS |
| OMEGA baseline | PASS |
| latency baseline | BLOCKED |
