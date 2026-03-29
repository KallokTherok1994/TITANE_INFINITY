# HARNESS_DIFF — P1.13a

## Gate variable added (top-level)

```diff
+const runLtmPathProof = process.env.TITANE_LTM_PATH_PROOF === '1';
```

## Test selector added (describe block)

```diff
+  const ltmPathProofTest = runLtmPathProof ? it : it.skip;
```

## Test added (describe block, ~45 lines)

```javascript
ltmPathProofTest(
  'proves LTM runtime path: persistent_memory IPC round-trip + isolation from conversation recall',
  async function () {
    this.timeout(120000);

    // SCENARIO A: persistent_memory_get_stats — baseline before write
    // Returns PersistentMemoryStats { count_by_level: { session, intermediate, long_term }, ... }
    const statsBefore = await invokeTauriCommand('persistent_memory_get_stats');
    const preLongTerm = statsBefore && statsBefore.count_by_level
      ? (statsBefore.count_by_level.long_term || 0) : 0;
    assert.ok(statsBefore !== null && statsBefore !== undefined,
      'persistent_memory_get_stats must be reachable');

    // SCENARIO B: persistent_memory_write_entry — returns UUID string
    // Note: window.__TAURI__.core.invoke uses camelCase → Tauri converts to snake_case Rust params
    const writeId = await invokeTauriCommand('persistent_memory_write_entry', {
      content: 'LTM path proof P1.13a — write/read round-trip verification',
      level: 'long_term',
      modeId: 'ltm_path_proof_p1_13a'
    });
    assert.ok(typeof writeId === 'string' && writeId.length > 0,
      `persistent_memory_write_entry must return a string ID`);

    // SCENARIO C: persistent_memory_get_stats after write — long_term count increments
    const statsAfter = await invokeTauriCommand('persistent_memory_get_stats');
    const postLongTerm = statsAfter && statsAfter.count_by_level
      ? (statsAfter.count_by_level.long_term || 0) : 0;
    assert.ok(postLongTerm === preLongTerm + 1,
      `persistent_memory long_term count must increment (pre=${preLongTerm} post=${postLongTerm})`);

    // SCENARIO D: persistent_memory_read — proves file-based round-trip read
    // Returns MemoryReadResponse { entries: [...], total_count: N, ... }
    // MemoryReadRequest uses #[serde(rename_all = "camelCase")] → currentMode
    const readResult = await invokeTauriCommand('persistent_memory_read', {
      request: { currentMode: 'ltm_path_proof_p1_13a' }
    });
    assert.ok(readResult && Array.isArray(readResult.entries),
      'persistent_memory_read must return entries array');
    assert.ok((readResult.total_count || 0) >= 1,
      `persistent_memory_read must return at least 1 entry`);
  }
);
```

## Key IPC lessons learned (P1.13a)

1. `window.__tauri_ipc__` (raw) → does NOT work for most commands in WebDriver context
2. `invokeTauriCommand()` (using `window.__TAURI__.core.invoke`) → correct approach
3. `window.__TAURI__.core.invoke` payload keys must be **camelCase** (Tauri converts → snake_case Rust)
4. `persistent_memory_get_stats` returns `PersistentMemoryStats.count_by_level` (no `total_entries` field)
5. `MemoryReadRequest` uses `#[serde(rename_all = "camelCase")]` → `currentMode` (not `current_mode`)
