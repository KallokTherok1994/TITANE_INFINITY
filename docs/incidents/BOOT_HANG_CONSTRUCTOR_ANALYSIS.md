# TITANE Boot Hang: Constructor Analysis Report

## Executive Summary

All three constructors execute **synchronously in the setup() function BEFORE the window is shown**. This means any hang in these constructors blocks the entire app startup and user sees nothing on screen.

**Critical Finding**: The window is shown at [main.rs:1591](src-tauri/src/main.rs#L1591), but all three heavy initializations happen in [main.rs:1280-1365](src-tauri/src/main.rs#L1280-L1365), which is **BEFORE the window display**.

---

## Constructor 1: ConversationEngineState::new()

### Location

- **File**: [src-tauri/src/conversation_engine/mod.rs](src-tauri/src/conversation_engine/mod.rs#L113)
- **Line**: 113
- **Called from**: [src-tauri/src/main.rs:1314](src-tauri/src/main.rs#L1314)

### Implementation

```rust
pub fn new(
    storage_dir: std::path::PathBuf,
    password: String,
    ai_router: Arc<RwLock<AIRouter>>,
    singularity: Arc<RwLock<SingularityState>>,
) -> Result<Self, ConversationEngineError>
```

### Operations Performed

#### 1. **File I/O: MemoryStorage::new()** ⚠️ BLOCKING

- **File**: [src-tauri/src/memory/storage.rs:34](src-tauri/src/memory/storage.rs#L34)
- **Operation**: `fs::create_dir_all(&storage_dir)`
- **Path**: `{app_data_dir}/conversations/`
- **Blocking**: YES - synchronous filesystem call
- **When hangs**: If storage device is slow, permissions denied, or mounted on network filesystem

```rust
if !storage_dir.exists() {
    fs::create_dir_all(&storage_dir)
        .map_err(|e| MemoryError::StorageError(e.to_string()))?;
}
```

#### 2. **Memory Initialization** (fast)

- Creates ~8 Arc-wrapped processors and engines:
  - `FrenchMasteryProcessor`
  - `ConversationalRealismProcessor`
  - `EmotionalSubtletyProcessor`
  - `BehavioralConsistencyProcessor`
  - `LiteraryEngine`
  - `AnthologyEngine`
  - `SelfHealingConversation`
  - `OmegaConversationBridge`
- All in-memory, no I/O

### Estimated Execution Time

- **Normal**: ~5-50ms
- **Slow filesystem**: 100ms - 5000ms+
- **Hung**: Network mount timeout (30-60 seconds)

### Hang Evidence

✅ If filesystem is hanging, this call `MemoryStorage::new()` will block here:

```rust
fs::create_dir_all(&storage_dir) // BLOCKS FOREVER or times out
```

---

## Constructor 2: PersistentMemoryState::new(app_handle)

### Location

- **File**: [src-tauri/src/commands/persistent_memory.rs](src-tauri/src/commands/persistent_memory.rs#L248)
- **Line**: 248
- **Called from**: [src-tauri/src/main.rs:1344](src-tauri/src/main.rs#L1344)

### Implementation

```rust
pub fn new(app_handle: &AppHandle) -> Self {
    let base_path = resolve_persistent_memory_base_path(app_handle);

    // Créer les répertoires
    fs::create_dir_all(&base_path).ok();
    fs::create_dir_all(base_path.join("session")).ok();
    fs::create_dir_all(base_path.join("intermediate")).ok();
    fs::create_dir_all(base_path.join("long_term")).ok();
    fs::create_dir_all(base_path.join("summaries")).ok();
    fs::create_dir_all(base_path.join("bundles")).ok();

    Self { ... }
}
```

### Operations Performed

#### **Multiple File I/O: Directory Creation** ⚠️ BLOCKING

- **Base path**: resolves to `{app_data_dir}/persistent_memory/`
- **Creates 6 directories total**:
  1. `persistent_memory/` (base)
  2. `persistent_memory/session/`
  3. `persistent_memory/intermediate/`
  4. `persistent_memory/long_term/`
  5. `persistent_memory/summaries/`
  6. `persistent_memory/bundles/`
- **Blocking**: YES - six synchronous filesystem calls
- **When hangs**: If `app_data_dir()` call hangs or filesystem is slow

### Estimated Execution Time

- **Normal**: ~10-100ms (6 create_dir_all calls)
- **Slow filesystem**: 100ms - 2000ms+
- **Hung**: If `app_handle.path().app_data_dir()` hangs due to XDG permission issue

### Critical Code

```rust
let base_path = resolve_persistent_memory_base_path(app_handle);

pub(crate) fn resolve_persistent_memory_base_path(app_handle: &AppHandle) -> PathBuf {
    let app_data_dir = app_handle.path().app_data_dir().unwrap_or_else(|e| {
        eprintln!(
            "Warning: Failed to get app data dir ({}), using current directory",
            e
        );
        PathBuf::from(".").join("titane-data")
    });

    app_data_dir.join("persistent_memory")
}
```

### Hang Evidence

✅ If XDG directory lookup hangs:

```rust
let app_data_dir = app_handle.path().app_data_dir() // CAN HANG on XDG issues
```

Then one of these blocking calls fails to timeout:

```rust
fs::create_dir_all(&base_path).ok();  // BLOCKS if filesystem hangs
```

---

## Constructor 3: DefaultKnowledgeBase::initialize()

### Location

- **File**: [src-tauri/src/knowledge_base_default.rs](src-tauri/src/knowledge_base_default.rs#L637)
- **Line**: 637 (initialize() method)
- **Called from**: [src-tauri/src/main.rs:1351](src-tauri/src/main.rs#L1351)

### Implementation

```rust
pub fn initialize() -> KnowledgeBaseInitResult {
    let (entries, errors) = Self::load_all();
    let entries_loaded = entries.len();
    let mut categories_loaded: Vec<String> = entries.keys().cloned().collect();
    categories_loaded.sort();
    let success = errors.is_empty();
    // ... logging ...
}
```

### Operations Performed

#### 1. **Call to `load_all()` for JSON Parsing** ⚠️ CPU-INTENSIVE

- **File**: [src-tauri/src/knowledge_base_default.rs:589](src-tauri/src/knowledge_base_default.rs#L589)
- **Operation**: Parse 158 embedded JSON knowledge entries
- **Cache**: Uses `OnceLock` static cache at [line 367](src-tauri/src/knowledge_base_default.rs#L367)
- **Blocking**: YES - synchronous JSON parsing

```rust
pub fn load_all() -> (HashMap<String, KnowledgeBaseEntry>, Vec<String>) {
    let cached = KB_CACHE.get_or_init(|| {
        let mut entries: HashMap<String, KnowledgeBaseEntry> = HashMap::new();
        let mut errors: Vec<String> = Vec::new();

        for (id, json_str) in Self::SOURCES {  // 158 entries
            match serde_json::from_str::<serde_json::Value>(json_str) {  // BLOCKS
                Ok(value) => {
                    // Extract fields and build KnowledgeBaseEntry
                    let category = value.get("category").and_then(|v| v.as_str()).unwrap_or(id).to_string();
                    let version = value.get("version").and_then(|v| v.as_str()).unwrap_or("v30.0.0").to_string();
                    let description = value.get("description").and_then(|v| v.as_str()).unwrap_or("").to_string();

                    entries.insert(category, KnowledgeBaseEntry { ... });
                }
                Err(e) => {
                    errors.push(format!("Failed to parse '{}': {}", id, e));
                }
            }
        }

        (entries, errors)
    });
    cached.clone()  // Clone hashmap (additional CPU cost)
}
```

#### 2. **SOURCES Array: 158 Knowledge Categories**

Examples include:

- `engines_catalog`
- `ipc_commands_catalog`
- `system_architecture`
- `identity_profile`
- `capabilities_matrix`
- ... (154 more)

Each is a large embedded JSON string constant.

#### 3. **HashMap Cloning** ⚠️ ADDITIONAL COST

```rust
cached.clone()  // Clones entire HashMap<String, KnowledgeBaseEntry>
```

This clones 158 entries + all their JSON content from the cache.

### Estimated Execution Time

- **First call**: 50-200ms (parse 158 JSON entries + build hashmap)
- **Subsequent calls**: <1ms (OnceLock cache hit, but still clones)
- **If JSON parsing fails**: Additional time for error handling

### Hang Evidence

✅ If JSON parsing hangs (unlikely but possible with malformed embedded strings):

```rust
for (id, json_str) in Self::SOURCES {
    match serde_json::from_str::<serde_json::Value>(json_str) {  // COULD HANG
```

✅ More likely: hashmap clone at end:

```rust
cached.clone()  // SLOW if 158 entries are large
```

---

## Critical Timing Issue: Window Show Order

### Current Flow (BLOCKING):

```
setup() called
  ↓
1. ConversationEngineState::new()        [~50ms+ | fs::create_dir_all blocks]
  ↓
2. PersistentMemoryState::new()          [~100ms+ | 6 fs::create_dir_all blocks]
  ↓
3. DefaultKnowledgeBase::initialize()    [~150ms+ | parse 158 JSON entries]
  ↓
4. Ollama auto-start async spawn         [non-blocking, async]
  ↓
5. OTHER async tasks (providers, bootstrap)
  ↓
app.get_webview_window("main").show()    [WINDOW FINALLY VISIBLE] ❌ Takes ~300ms+
```

### The Problem

If **any of the three synchronous constructors hang**, the window is never shown and the user sees:

- Frozen window (appears to hang)
- Or complete black screen
- CPU usage normal (not a busy loop)
- Process is alive but blocked in filesystem/JSON parsing

### Evidence of Blocking

From [main.rs:1300-1365](src-tauri/src/main.rs#L1300-L1365):

```rust
// Line 1314: ConversationEngineState::new() - BLOCKS HERE
let conversation_engine = Arc::new(
    titane_infinity::conversation_engine::ConversationEngineState::new(
        storage_dir,
        password,
        ai_router,
        singularity_state,
    ).unwrap_or_else(|e| { std::process::exit(1); })  // ❌ Can exit if MemoryStorage::new fails
);

// Line 1344: PersistentMemoryState::new() - BLOCKS HERE
app.manage(persistent_memory_v30::PersistentMemoryState::new(app.handle()));

// Line 1351: DefaultKnowledgeBase::initialize() - BLOCKS HERE
let kb_result = titane_infinity::knowledge_base_default::DefaultKnowledgeBase::initialize();

// Line 1591: Window finally shown - AFTER ALL BLOCKING OPS
if let Err(err) = main_window.show() {
    eprintln!("❌ Failed to show main window: {err}");
}
```

---

## Hang Scenarios and Root Causes

### Scenario 1: Filesystem Hung/Slow

**Constructor affected**: `ConversationEngineState::new()` → `MemoryStorage::new()`

**Trigger**:

- Storage device is unmounted or timed out
- Network filesystem (NFS) is unreachable
- Disk is full (error handling may block)
- SELinux/AppArmor blocking filesystem write

**Evidence**:

```
strace shows: open(), mkdir(), or create_dir_all() blocked in D state (uninterruptible sleep)
```

---

### Scenario 2: XDG/App Data Dir Lookup Hangs

**Constructor affected**: `PersistentMemoryState::new()` → `resolve_persistent_memory_base_path()`

**Trigger**:

- `app_handle.path().app_data_dir()` hangs (internal Tauri call)
- Possible XDG environment variables missing or corrupted
- Permission denied on home directory traversal

**Evidence**:

```
strace shows: getxattr(), stat(), or XDG lookup calls hanging
```

---

### Scenario 3: JSON Parsing Hangs or Is Extremely Slow

**Constructor affected**: `DefaultKnowledgeBase::initialize()` → `load_all()`

**Trigger**:

- Embedded JSON constants are malformed (embedded strings issue)
- serde_json parser enters infinite loop with certain UTF-8 sequences
- HashMap cloning is slow due to large entries

**Evidence**:

- High CPU usage during initialization
- Slow JSON parsing logic observed in profiler

---

## Proof-Grade Evidence Needed

To confirm which constructor is hanging:

### Test 1: Early Logging

Add logging immediately before each constructor:

```rust
// main.rs ~line 1280
log::info!("[BOOT] Starting ConversationEngineState::new()...");
let conversation_engine = Arc::new(
    titane_infinity::conversation_engine::ConversationEngineState::new(...)
);
log::info!("[BOOT] ✅ ConversationEngineState::new() completed");

log::info!("[BOOT] Starting PersistentMemoryState::new()...");
app.manage(persistent_memory_v30::PersistentMemoryState::new(app.handle()));
log::info!("[BOOT] ✅ PersistentMemoryState::new() completed");

log::info!("[BOOT] Starting DefaultKnowledgeBase::initialize()...");
let kb_result = titane_infinity::knowledge_base_default::DefaultKnowledgeBase::initialize();
log::info!("[BOOT] ✅ DefaultKnowledgeBase::initialize() completed");

log::info!("[BOOT] All constructors done, showing window...");
if let Err(err) = main_window.show() { ... }
```

### Test 2: Timing Instrumentation

```rust
let start = std::time::Instant::now();
let result = ConversationEngineState::new(...);
log::info!("[BOOT-TIMING] ConversationEngineState::new took {}ms", start.elapsed().as_millis());
```

### Test 3: strace on Boot

```bash
strace -e trace=open,openat,mkdir,create_dir_all -o /tmp/titane_boot.strace titane-infinity
# If hung on filesystem, will show last call is open/mkdir/stat
```

### Test 4: Environment Variable Overrides

Disable constructors sequentially to isolate:

```bash
TITANE_SKIP_CONVERSATION_ENGINE=1 titane-infinity   # Skip constructor 1
TITANE_SKIP_MEMORY_STATE=1 titane-infinity          # Skip constructor 2
TITANE_SKIP_KNOWLEDGE_BASE=1 titane-infinity        # Skip constructor 3
```

---

## Summary Table

| Constructor                          | File                                          | Line | Type | Blocking              | Risk Factor | Typical Time |
| ------------------------------------ | --------------------------------------------- | ---- | ---- | --------------------- | ----------- | ------------ |
| `ConversationEngineState::new()`     | `src-tauri/src/conversation_engine/mod.rs`    | 113  | Sync | fs::create_dir_all    | **HIGH**    | 50-500ms     |
| `PersistentMemoryState::new()`       | `src-tauri/src/commands/persistent_memory.rs` | 248  | Sync | 6× fs::create_dir_all | **MEDIUM**  | 100-200ms    |
| `DefaultKnowledgeBase::initialize()` | `src-tauri/src/knowledge_base_default.rs`     | 637  | Sync | JSON parse + clone    | **MEDIUM**  | 50-200ms     |

**All three execute before window.show() at [main.rs:1591](src-tauri/src/main.rs#L1591)**

---

## Recommendation

**Move window display to happen BEFORE or DURING these initializations**:

Option A: Show window early with loading indicator, run heavy ops async

```rust
main_window.show()?;  // Show window FIRST
main_window.emit("loading::start", "Initializing...")?;

tauri::async_runtime::spawn(async {
    ConversationEngineState::new(...); // Run async
    PersistentMemoryState::new(...);    // Run async
    DefaultKnowledgeBase::initialize(); // Run async
    main_window.emit("loading::complete", None)?;
});
```

Option B: Add timeout guards around each constructor

```rust
match tokio::time::timeout(
    Duration::from_secs(5),
    tokio::spawn_blocking(|| ConversationEngineState::new(...))
).await {
    Ok(_) => log::info!("✅ ConversationEngineState initialized"),
    Err(_) => {
        log::error!("❌ ConversationEngineState initialization TIMEOUT");
        // Show error to user, fallback mode
    }
}
```
