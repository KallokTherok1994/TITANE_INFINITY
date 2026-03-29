# ASSERTION_LOG — P1.13a

## Assertion A: persistent_memory_get_stats reachable

```javascript
assert.ok(statsBefore !== null && statsBefore !== undefined, 'persistent_memory_get_stats must be reachable');
```

- Bound: non-null result
- Evidence (X3): `{count_by_level: {long_term:0}, ...}`, `{count_by_level: {long_term:1}, ...}`, `{count_by_level: {long_term:2}, ...}`
- Status: PASS X3

## Assertion B: write_entry returns UUID string

```javascript
assert.ok(typeof writeId === 'string' && writeId.length > 0, `persistent_memory_write_entry must return a string ID`);
```

- Bound: typeof string, length > 0
- Evidence: 73cc4a20..., 8c74e502..., 3824b693...
- Status: PASS X3

## Assertion C: long_term count increments by exactly 1

```javascript
assert.ok(postLongTerm === preLongTerm + 1, `persistent_memory long_term count must increment`);
```

- Bound: strict `=== pre + 1` (not `>`, but exact +1)
- Evidence: 0→1, 1→2, 2→3
- Status: PASS X3

## Assertion D: read returns entries array

```javascript
assert.ok(readResult && Array.isArray(readResult.entries), 'persistent_memory_read must return entries array');
```

- Bound: Array type
- Evidence: Array(87), Array(88), Array(89)
- Status: PASS X3

## Assertion E: read total_count ≥ 1

```javascript
assert.ok((readResult.total_count || 0) >= 1, `persistent_memory_read must return at least 1 entry`);
```

- Bound: ≥ 1
- Evidence: 87, 88, 89
- Status: PASS X3

## Failed attempts before PASS (diagnostic record)

| Attempt | Failure | Root cause | Fix |
|---------|---------|------------|-----|
| 1 | `persistent_memory_get_stats returned null` | Used `window.__tauri_ipc__` instead of `invokeTauriCommand` | Switch to `invokeTauriCommand()` |
| 2 | `write_entry returned false` | `modeId` param missing (raw IPC has no camelCase conversion) | Use `invokeTauriCommand` |
| 3 | `missing required key modeId` | Passed `mode_id` (snake_case) to `window.__TAURI__.core.invoke` which expects camelCase | Pass `modeId` (camelCase) |
