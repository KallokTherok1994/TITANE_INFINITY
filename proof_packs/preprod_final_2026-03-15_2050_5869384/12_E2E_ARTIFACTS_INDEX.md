# 12 E2E Artifacts Index

- Primary passing artifact:
  - `proof_packs/preprod_final_2026-03-15_2050_5869384/e2e_online_chat_retry4.log`
- Prior artifacts retained (append-only):
  - `proof_packs/preprod_final_2026-03-15_2050_5869384/e2e_online_chat.log`
  - `proof_packs/preprod_final_2026-03-15_2050_5869384/e2e_online_chat_retry.log`
  - `proof_packs/preprod_final_2026-03-15_2050_5869384/e2e_online_chat_retry3.log`

## Pass Markers (retry4)

- WDIO status: `[E2E_CHAT_PROOF] STATUS=0`
- Assistant count: `[ASSISTANT_SNAPSHOT] beforeCount=0 afterCount=1`
- Provider DOM: `data-provider-used=Ollama`
- Provider mode: `data-provider-mode=LOCAL`
- Network marker: `data-network-used=false`
- Reason marker: `data-provider-reason=OK`
- Panel alignment marker: `[UI_PANEL_ALIGNMENT]` with provider/network/reason equal between panel and assistant row.

## Source Artifacts (retry4 run)

- Driver log: `reports/preprod_final_2026-03-15_2050_5869384_e2e_retry4/tauri-driver.log`
- WDIO log: `reports/preprod_final_2026-03-15_2050_5869384_e2e_retry4/wdio-online-chat-proof-ui.log`
