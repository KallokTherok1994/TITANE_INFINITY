# IPC_PARAM_TRUTH — P1.13a

## Canonical rule: Tauri v2 IPC param naming

### `window.__TAURI__.core.invoke` (via invokeTauriCommand)

- Payload keys must be **camelCase**
- Tauri v2 automatically converts camelCase → snake_case for Rust deserialization
- Example: `{ modeId: 'x' }` → Rust receives `mode_id: String`
- Structs with `#[serde(rename_all = "camelCase")]`: keys in JSON must match camelCase
- Structs with `#[serde(rename_all = "snake_case")]`: keys in JSON must match snake_case (but top-level command params use camelCase)

### Raw `window.__tauri_ipc__` (direct IPC, NOT recommended in E2E)

- Lower-level, does not apply the same camelCase conversion
- Not reliably accessible in WebDriver context for all commands
- Should NOT be used in proof harness unless absolutely necessary

## Command-specific truth table

| Command | Param in Rust | Correct JS key (invoke) |
|---------|--------------|------------------------|
| `persistent_memory_write_entry` | `mode_id: String` | `modeId` |
| `persistent_memory_write_entry` | `content: String` | `content` |
| `persistent_memory_write_entry` | `level: MemoryLevel` | `level` |
| `persistent_memory_read` | `request: MemoryReadRequest` | `request` |
| `MemoryReadRequest` | `current_mode: String` | `currentMode` (camelCase in struct) |
| `titan_persist_event` | `event: TitanEvent` | `event` |
| `titan_load_state` | (no params) | `{}` |
| `persistent_memory_get_stats` | (no params) | `{}` |

## MemoryLevel serialization

`MemoryLevel` uses `#[serde(rename_all = "snake_case")]`:
- `MemoryLevel::LongTerm` → `"long_term"`
- `MemoryLevel::Intermediate` → `"intermediate"`
- `MemoryLevel::Session` → `"session"`

So `level: 'long_term'` is correct (snake_case string value, not snake_case key).
