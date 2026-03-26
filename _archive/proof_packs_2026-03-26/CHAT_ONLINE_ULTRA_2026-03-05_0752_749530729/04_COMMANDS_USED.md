# COMMANDS USED

- generated_at_utc: 2026-03-05T13:03:00Z

## UNIT_CMD

`NODE_OPTIONS='--max-old-space-size=12288 --require ./tests/polyfills/resizable-arraybuffer.cjs' pnpm exec vitest run src/__tests__/features/chat/ChatMessage.test.tsx src/__tests__/features/chat/TypingIndicator.test.tsx src/__tests__/features/chat/VirtualMessageList.test.tsx`

## VERIFY_ONLINE_CMD (healthcheck)

`bash scripts/verify/verify_chat_online.sh`

## E2E_ONLINE_SMOKE_CMD (authority: WDIO desktop)

`TITANE_E2E=1 TITANE_MEMORY_DIR=/tmp/titane-chat-online/memory TITANE_LOG_DIR=/tmp/titane-chat-online/logs TITANE_E2E_ARTIFACTS_DIR=<pack>/runs/online_smoke_<run> WDIO_SPEC=./e2e/desktop/online-chat-proof-ui.wdio.test.js pnpm -s e2e:desktop:run`

## E2E_ONLINE_FULL_CMD (authority: WDIO desktop)

`TITANE_E2E=1 TITANE_MEMORY_DIR=/tmp/titane-chat-online/memory TITANE_LOG_DIR=/tmp/titane-chat-online/logs TITANE_E2E_ARTIFACTS_DIR=<pack>/runs/online_full_<run> WDIO_SPEC=./e2e/desktop/ui-ultra-full.e2e.js pnpm -s e2e:desktop:run`

## Authority Decision

- Desktop required runner: `WDIO`
- Desktop extended runner: `Playwright`

## Update 2026-03-05T13:39:36Z

## UNBLOCK_PATCH_SCOPE

- Edited: `scripts/verify/verify_chat_online.sh`
- Change: require at least one configured external provider key instead of all three keys.

## AUTOFIX_CAPTURE_AND_GUARDS

- `node scripts/qa/check_autofix_autoheal_registry.mjs`
- `bash scripts/autoheal/detect_recurrence.sh`
- `bash scripts/verify_instructions.sh`

## HEALTH_X3_RETRY_CMD

- `bash scripts/qa/run_x3.sh proof_packs/CHAT_ONLINE_ULTRA_2026-03-05_0752_749530729 10_PROVIDER_HEALTH_X3.log provider_health "bash scripts/verify/verify_chat_online.sh"`

## PROFILE_RELOAD_RETRY_CMD

- `for f in ~/.profile ~/.bash_profile ~/.bashrc ~/.zshrc; do if [[ -f "$f" ]]; then source "$f" >/dev/null 2>&1 || true; fi; done && bash scripts/verify/verify_chat_online.sh`

## GOVERNANCE_DECRYPTION_PROBES (2026-03-05)

- `set -a && source .env >/dev/null 2>&1 && set +a && timeout 360s pnpm run dev:tauri > /tmp/titane_governance_probe2.log 2>&1`
- `export TITANE_SECRETS_PASSPHRASE='TitaneSecure2025' && timeout 180s pnpm run dev:tauri > /tmp/titane_governance_probe_defaultpass.log 2>&1`
- `rg -n "Failed to decrypt secrets file|bootstrap_api_keys|No Gemini API key|No OpenAI API key|No Anthropic API key" /tmp/titane_governance_probe*.log`

## PASSPHRASE_CANDIDATE_PROBE

- `while read candidate; do TITANE_SECRETS_PASSPHRASE="$candidate" timeout 120s pnpm run dev:tauri; done` (summary persisted in `logs/passphrase_probe_summary.log`)

## E2E_FULL_RETRY_CMD

- `bash scripts/qa/run_x3.sh proof_packs/CHAT_ONLINE_ULTRA_2026-03-05_0752_749530729 09_E2E_ONLINE_FULL_X3.log e2e_online_full_retry "TITANE_E2E=1 ... WDIO_SPEC=./e2e/desktop/ui-ultra-full.e2e.js pnpm -s e2e:desktop:run"`
