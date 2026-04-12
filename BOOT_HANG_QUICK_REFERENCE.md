# TITANE Boot Hang: Quick Reference - 3 Constructors

## 1️⃣ ConversationEngineState::new()

**File**: [src-tauri/src/conversation_engine/mod.rs](src-tauri/src/conversation_engine/mod.rs#L113)

**Main blocking call**:
```rust
MemoryStorage::new(storage_dir.join("conversations"), password)
  └─> fs::create_dir_all(&storage_dir)  // BLOCKS if filesystem hangs
```

**Risk**: Filesystem I/O - if storage device hangs, entire app hangs
**Time**: 50-500ms (or infinite if filesystem timeout)

---

## 2️⃣ PersistentMemoryState::new(app_handle)

**File**: [src-tauri/src/commands/persistent_memory.rs](src-tauri/src/commands/persistent_memory.rs#L248)

**Main blocking calls**:
```rust
let base_path = resolve_persistent_memory_base_path(app_handle);  // Can hang on XDG
fs::create_dir_all(&base_path).ok();
fs::create_dir_all(base_path.join("session")).ok();
fs::create_dir_all(base_path.join("intermediate")).ok();
fs::create_dir_all(base_path.join("long_term")).ok();
fs::create_dir_all(base_path.join("summaries")).ok();
fs::create_dir_all(base_path.join("bundles")).ok();
```

**Risk**: 6 sequential directory creation calls, XDG lookup can hang
**Time**: 100-200ms (or infinite if XDG/filesystem timeout)

---

## 3️⃣ DefaultKnowledgeBase::initialize()

**File**: [src-tauri/src/knowledge_base_default.rs](src-tauri/src/knowledge_base_default.rs#L637)

**Main blocking call**:
```rust
pub fn initialize() -> KnowledgeBaseInitResult {
    let (entries, errors) = Self::load_all();  // Parses 158 JSON entries
    // ...
}
```

**load_all() implementation**:
```rust
pub fn load_all() -> (HashMap<String, KnowledgeBaseEntry>, Vec<String>) {
    let cached = KB_CACHE.get_or_init(|| {
        for (id, json_str) in Self::SOURCES {  // 158 embedded JSON strings
            match serde_json::from_str::<serde_json::Value>(json_str) {  // BLOCKS
                Ok(value) => { /* build entry */ }
                Err(e) => { errors.push(...); }
            }
        }
        (entries, errors)
    });
    cached.clone()  // Additional clone cost
}
```

**Risk**: JSON parsing can be slow, hashmap clone overhead
**Time**: 50-200ms (first call) or <1ms (cache hit but still clones)

---

## ✅ Critical Finding: Window Show Timing

**Window is shown at**: [src-tauri/src/main.rs:1591](src-tauri/src/main.rs#L1591)

**But all 3 constructors run BEFORE this**:
- ConversationEngineState::new() at [line 1314](src-tauri/src/main.rs#L1314)
- PersistentMemoryState::new() at [line 1344](src-tauri/src/main.rs#L1344)
- DefaultKnowledgeBase::initialize() at [line 1351](src-tauri/src/main.rs#L1351)

**Result**: If ANY of these hang, window never appears → user sees black/frozen screen

---

## 🔧 Quick Diagnostics

### To find which one is hanging:

1. **Add timing logs** before/after each constructor in main.rs:
```rust
log::info!("[BOOT-TIMER] Starting ConversationEngineState::new...");
let start = std::time::Instant::now();
let conversation_engine = Arc::new(
    titane_infinity::conversation_engine::ConversationEngineState::new(...)
);
log::info!("[BOOT-TIMER] ConversationEngineState::new took {}ms", start.elapsed().as_millis());
```

2. **Run with strace** to see system calls:
```bash
strace -e trace=open,openat,mkdir,stat -f titane-infinity 2>&1 | tail -100
# Last syscall will show which constructor is stuck
```

3. **Check disk/filesystem health**:
```bash
df -h
lsblk
# If mounted on network FS or is full, that's the culprit
```

---

## 📝 Evidence Collection Template

When boot hangs:

1. **Check logs** at `/home/titane-os/.local/share/titane/logs/` 
   - Last log line shows which constructor completed
   - If ConversationEngineState log missing → constructor 1 hung
   - If PersistentMemoryState log missing → constructor 2 hung
   - If DefaultKnowledgeBase log missing → constructor 3 hung

2. **Run strace during hang**:
```bash
# Terminal 1: Start app with strace
strace -o /tmp/titane_strace.log titane-infinity

# Terminal 2: After 5s, check last syscall
tail -50 /tmp/titane_strace.log
```

3. **Check system resources**:
```bash
ps aux | grep titane
# CPU should be ~0% if blocked on I/O (D state)
# High CPU = JSON parsing or memory copying
```

---

## 🎯 Most Likely Culprit

**ConversationEngineState::new()** (Constructor 1)

Reason:
- Only constructor that calls `fs::create_dir_all()` **unconditionally without a timeout**
- If filesystem or storage device is slow/hung, no timeout guard
- PersistentMemoryState uses `.ok()` to swallow errors (less blocking)
- DefaultKnowledgeBase is pure in-memory (no I/O)

**Next most likely**: PersistentMemoryState (XDG path lookup can hang on some systems)

---

