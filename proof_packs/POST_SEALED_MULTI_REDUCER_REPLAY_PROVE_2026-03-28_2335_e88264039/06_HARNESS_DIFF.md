# HARNESS_DIFF — P1.12

## Changes to `e2e/desktop/online-chat-proof-ui.wdio.test.js`

### Addition 1 — top-level gate variable

```diff
+const runMultiReducerProof = process.env.TITANE_MULTI_REDUCER_PROOF === '1';
```

### Addition 2 — conditional test runner (inside `describe` block)

```diff
+  const multiReducerProofTest = runMultiReducerProof ? it : it.skip;
```

### Addition 3 — full test (inside `describe` block, before `memoryProofTest`)

```javascript
multiReducerProofTest(
  'proves multi-reducer event replay coverage: xp / progress / knowledge / settings',
  async function () {
    this.timeout(120000);

    await driver.executeScript('window.__tauri_ipc__', [{
      cmd: 'titan_persistence_init'
    }]);

    // Load pre-state
    const preStateRaw = await driver.executeScript('window.__tauri_ipc__', [{
      cmd: 'titan_load_state'
    }]);
    const preState = JSON.parse(preStateRaw);
    const preTicks = preState.metrics.ticks;
    const preDepth = preState.cognition.depth;
    const preMemories = preState.memory.total_memories;
    const preActiveThoughts = preState.cognition.active_thoughts;
    const preMetricsLastUpdate = preState.metrics.last_update_ms;

    const preStatus = await driver.executeScript('window.__tauri_ipc__', [{
      cmd: 'titan_get_persistence_status'
    }]);
    const preEventCount = preStatus.events_persisted;

    // Emit 4 events: xp, progress, knowledge, settings
    await driver.executeScript('window.__tauri_ipc__', [{
      cmd: 'titan_persist_event',
      event: { module: 'xp', event_type: 'gain', payload: { amount: 100 } }
    }]);
    await driver.executeScript('window.__tauri_ipc__', [{
      cmd: 'titan_persist_event',
      event: { module: 'progress', event_type: 'set', payload: { level: 7 } }
    }]);
    await driver.executeScript('window.__tauri_ipc__', [{
      cmd: 'titan_persist_event',
      event: { module: 'knowledge', event_type: 'learn', payload: {} }
    }]);
    await driver.executeScript('window.__tauri_ipc__', [{
      cmd: 'titan_persist_event',
      event: { module: 'settings', event_type: 'update', payload: {} }
    }]);

    // Load post-state
    const postStateRaw = await driver.executeScript('window.__tauri_ipc__', [{
      cmd: 'titan_load_state'
    }]);
    const postState = JSON.parse(postStateRaw);
    const postTicks = postState.metrics.ticks;
    const postDepth = postState.cognition.depth;
    const postMemories = postState.memory.total_memories;
    const postActiveThoughts = postState.cognition.active_thoughts;
    const postMetricsLastUpdate = postState.metrics.last_update_ms;
    const postLastSyncMs = postState.last_sync_ms;

    const postStatus = await driver.executeScript('window.__tauri_ipc__', [{
      cmd: 'titan_get_persistence_status'
    }]);
    const postEventCount = postStatus.events_persisted;

    // Assertions
    assert.strictEqual(postTicks, preTicks + 100, 'xp reducer: ticks += 100');
    assert.strictEqual(postDepth, 7, 'progress reducer: depth = 7');
    assert.strictEqual(postMemories, preMemories + 1, 'knowledge reducer: total_memories += 1');
    assert.strictEqual(postActiveThoughts, preActiveThoughts + 1, 'knowledge reducer: active_thoughts += 1');
    assert.ok(postMetricsLastUpdate > preMetricsLastUpdate, 'settings reducer: last_update_ms increased');
    assert.strictEqual(postMetricsLastUpdate, postLastSyncMs, 'settings identity: last_update_ms === last_sync_ms');
    assert.ok(postEventCount >= preEventCount + 4, 'events_persisted incremented by >= 4');
  }
);
```

## Files NOT changed this cycle

- `src-tauri/src/persistence/mod.rs` — NO CHANGE
- `src-tauri/src/persistence/commands.rs` — NO CHANGE
- `src-tauri/src/persistence/database.rs` — NO CHANGE
- `src-tauri/src/main.rs` — NO CHANGE
- `src-tauri/capabilities/persistence.json` — NO CHANGE
- Any other Rust source file — NO CHANGE
