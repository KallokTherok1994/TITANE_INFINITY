# Commandes utilisées

```text
git status --short
git rev-parse --short HEAD
git log -20 --oneline
node -v || true
pnpm -v || true
cargo -V || true
rustc -V || true
pnpm tauri -v || true
pnpm -s run || true
pwd
uname -a
echo $DISPLAY || true
printenv | grep -E 'OLLAMA|OPENAI|ANTHROPIC|GEMINI|TITANE|RUST_LOG' || true
rg -n "recovery|No active AI provider|active AI provider|degraded|fallback|ollama|send_message|conversation_generate|invoke\(" src src-tauri tests e2e
rg --files src src-tauri | rg "chat|Chat|provider|Provider|ollama|conversation|omega|orchestrator|router|fallback|recovery|status|hook|store"
sed -n '...' sur les fichiers cartographiés
ollama --version || true
ollama ps || true
ollama list || true
curl -sS http://127.0.0.1:11434/api/tags || true
curl -sS http://127.0.0.1:11434/api/version || true
pnpm exec vitest run src/services/conversationEngine.test.ts
pnpm exec vitest run src/hooks/__tests__/useBackendHealth.test.ts
pnpm exec wdio run wdio.desktop.conf.cjs --spec e2e/desktop/online-chat-proof.wdio.test.js
pnpm run e2e:desktop:proof:online-chat
TITANE_MEMORY_PROOF=1 pnpm run e2e:desktop:proof:online-chat
pnpm run build:tauri:e2e
pnpm exec tsc --noEmit --pretty false
pnpm exec vitest run src/__tests__/hooks/usePersistentMemory.test.tsx src/__tests__/components/sections/MemorySection.test.tsx src/__tests__/features/memory/MemorySearch.test.tsx src/__tests__/features/memory/MemoryVisualization.test.tsx src/__tests__/pages/Memory.test.tsx
TAURI_DEV_SERVER_URL=http://127.0.0.1:4173 TITANE_MEMORY_PROOF=1 pnpm run e2e:desktop:proof:online-chat
rg -n "UnifiedMemory|CANONICAL_MEMORY_FACTS|code fantôme|INCONNU|LISBON|Lisboa" src src-tauri tests e2e
rg -n "MEMORY_PROOF_VERDICT|FALSE_RECALL_VERDICT|FALSE_RECALL_RESPONSE|Lisboa|INCONNU" reports/ui_research_e2e/*/wdio-online-chat-proof-ui.log
rg -n "memorySurfaceState|dashboardEntryCount|searchEntryCount|bodyHasCode|bodyHasName|bodyHasColor|FALSE_RECALL_RESPONSE|STATUS=0|PASS_MEMORY_REAL" reports/ui_research_e2e/20260325T165333Z/wdio-online-chat-proof-ui.log
tail -n 120 reports/ui_research_e2e/20260325T022243Z/wdio-online-chat-proof-ui.log
tail -n 120 reports/ui_research_e2e/20260325T023914Z/wdio-online-chat-proof-ui.log
pnpm run check
git diff -- ...
git diff --stat -- ...
```
