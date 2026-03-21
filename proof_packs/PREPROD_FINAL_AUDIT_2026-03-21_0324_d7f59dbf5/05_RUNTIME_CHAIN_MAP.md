# 05_RUNTIME_CHAIN_MAP

## Critical Chains Status

### Chat Send Chain
```
TITANE > Chat tab → ConversationSection → useChatCore → chatMemorySingleDoor
  → conversation_generate IPC → Rust chat_orchestrator → provider (Ollama/external)
  → streaming response → UI update
```
**Status:** PROVEN_RUNTIME (certified in prior sessions; unchanged by this audit)

### Memory Chain
```
useTwinEvolution → numericTwinService → localStorage titane_twin_fusion_v1
chatMemorySingleDoor → readFreshTwinsFusion() → envelope.twinsContext
→ Rust extract_context_binding → TWINS_CONTEXT in system_prompt
```
**Status:** PROMPT_EFFECT_PROVEN / RESPONSE_EFFECT_UNPROVEN (27 tests x3 pass)

### TWINS / Symbiose Chain (new)
```
TopNav TITANE → /titane → TitanePage (activeTab='symbiose')
  → TwinEvolutionPanel(isAdmin=true, compact=false)
  → useTwinEvolution() → numericTwinService
  → secureInvoke('twin_get_evolution_profile') + secureInvoke('twin_get_fusion_index')
  → src-tauri/src/numeric_twin/twin_commands.rs
  → NumericTwinState (managed) → OperationalTwin
```
**Status:** PARTIAL_CHAIN (code path correct; no live runtime proof this session; IPC previously certified)

### Legacy /twins redirect
```
/twins → <Navigate to="/titane" replace /> (React Router)
/twin  → <Navigate to="/titane" replace />
```
**Status:** NAV_ONLY (no runtime execution needed; static route config)

### Provider Failure Reset Chain
```
Ollama probe success → chat_orchestrator.rs reset_provider_failures()
→ circuitBreaker.ts failures=0 → CLOSED state
```
**Status:** PROVEN_RUNTIME (certified in session 34b2097d7)

### LTM Disk Persistence Chain
```
promote_mtm_to_ltm() → std::fs::write(<ltm_path>/<id>.mem)
startup → restore_ltm_from_disk() → LTM index rebuilt
recall() → std::fs::read() + serde_json → MEMORY_CONTEXT in system_prompt
```
**Status:** PROVEN_RUNTIME (cargo check EXIT 0; certified in sessions 69c1c948f/61df44d0b)

### Memory Backup/Restore Chain
```
chat_memory_backup IPC → copies *.mem files to dest_dir
chat_memory_restore IPC → validates + copies + reload_ltm_from_disk()
```
**Status:** PROVEN_RUNTIME (cargo check EXIT 0; capabilities registered)
