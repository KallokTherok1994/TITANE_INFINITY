# COMMANDS USED

## Phase 0 — Bootstrap

```bash
git --no-pager status
# Output: 2 modified (e2e test + autoheal_rules.jsonl) + 1 untracked (proof pack dir)

git rev-parse --short HEAD
# Output: ce22c1f4f

git --no-pager log -20 --oneline
# Output: 20 commits, top = ce22c1f4f fix(deploy): resync deployment/latest v28

ls src | head -40
ls src-tauri | head -40
ls docs | head -40
```

## Phase 1 — Topology

```bash
ls src-tauri/src/
# Output: 100+ subdirs (neural_memory, unified_memory_v2, memory, conversation_engine, overdrive, commands/, etc.)

ls src-tauri/src/commands/
# Output: 40+ command files (chat_generate_commands, chat, engine_commands, memory_commands, etc.)
```

## Phase 2 — Scans Ciblés

```bash
rg -n "provider|router|fallback|decision|reason|meta|ollama|openai|anthropic|gemini|claude|grok" \
   -S src src-tauri/src docs/AI_PROVIDERS.md 2>/dev/null | head -80
# Trouvé: ollama.rs (HTTP direct), chat_generate_commands.rs, overdrive/chat_orchestrator.rs,
#         AIOrchestrator.ts (NeuralSelection), AIRouter init main.rs

rg -n "memory|conversation|ConversationStorageService|ConversationLifecycleEngine|STM|MTM|LTM|snapshot" \
   -S src/services src-tauri/src 2>/dev/null | head -80
# Trouvé: neural_memory/{stm,mtm,ltm}.rs, unified_memory_v2/, conversation_engine/memory.rs,
#         PersistentMemoryState init, load_conversation_history IPC

rg -n "tauri::command|generate_handler!|invoke\(|chat_stream_message|conversation_generate|send_message" \
   -S src-tauri/src 2>/dev/null | head -60
# Trouvé: generate_handler! à main.rs:1293, 200+ commandes estimées

rg -n "fetch\(|axios\(|WebSocket|XMLHttpRequest|https?://" -S src 2>/dev/null \
   | grep -v "node_modules\|\.test\.\|spec\." | head -40
# Trouvé: URLs statiques dans aiModel.ts (type only), ResearchPage.tsx (Tauri open),
#         hybridTTS localhost:8765, aucun fetch direct frontend détecté

rg -n "mock_|stub|placeholder|TODO|FIXME|experimental|legacy" \
   -S src/services src-tauri/src 2>/dev/null | grep -v "node_modules\|test\|spec" | head -50
# Trouvé: S-001..S-008 stubs catalogués

cat src-tauri/src/main.rs | head -80
# Trouvé: v26.4.0 header, feature flags, modules inline, generate_handler! L1293
```

## Phase 12 — Gates

```bash
bash scripts/verify_instructions.sh  # NOT EXECUTED — no runtime proof
bash scripts/autoheal/detect_recurrence.sh  # NOT EXECUTED — no runtime proof
```

**Note**: Aucune exécution de build ou test dans cet audit (audit statique uniquement). Les preuves runtime sont marquées UNKNOWN.

## Commandes Recommandées (Non Exécutées)

```bash
# Vérifier feature default build
grep -A5 '\[features\]' src-tauri/Cargo.toml

# Smoke test avec feature full
TITANE_SECRETS_PASSPHRASE="$(openssl rand -hex 32)" \
cargo test --manifest-path src-tauri/Cargo.toml --features full 2>&1 | tail -30

# Vérifier passphrase en prod
grep -r "TITANE_SECRETS_PASSPHRASE\|default-dev-passphrase" src-tauri/src/ | head -10

# Vérifier CONVOS_MEMORY_LTM default
grep -n "CONVOS_MEMORY_LTM" src-tauri/src/ -r | head -5

# Vérifier Ring 2 embeddings/summarizer
grep -n "https\?://" src-tauri/src/semantic/ src-tauri/src/neural_memory/ 2>/dev/null | head -20
```
