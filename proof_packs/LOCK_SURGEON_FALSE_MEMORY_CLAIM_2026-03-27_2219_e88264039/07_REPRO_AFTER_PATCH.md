# 07 — Repro After Patch

## Validation Results

### 1. Cargo Check
```
cd src-tauri && cargo check --lib
```
**Result**: ✅ PASS
**Output**: `Finished dev profile [unoptimized + debuginfo] target(s) in 38.98s`

### 2. Rust Unit Tests (Relevant)
```
cd src-tauri && cargo test --lib -- conversation_engine::commands::tests::canonical_memory_fact_block_extracts_structured_facts_from_history
```
**Result**: ✅ PASS

```
cd src-tauri && cargo test --lib -- conversation_engine::commands::tests::canonical_memory_fact_block_is_skipped_for_non_recall_queries
```
**Result**: ✅ PASS

```
cd src-tauri && cargo test --lib -- conversation_engine::commands::tests::canonical_memory_fact_block_supports_personal_fact_recall_without_memory_keyword
```
**Result**: ✅ PASS

### 3. All Commands Tests
```
cd src-tauri && cargo test --lib -- conversation_engine::commands::tests
```
**Result**: ⚠️ 14/15 PASS, 1 FAIL (pre-existing)
**Failed Test**: `conversation_os_schema_is_initialized_once_per_db_path`
**Failure Cause**: Pre-existing test isolation issue (static cache shared between tests)
**Relation to Patch**: NONE — This test does not use `build_canonical_memory_fact_block()`

### 4. Code Compilation
The patch compiles successfully and all relevant tests pass.

## Pre-Existing Test Failure Analysis
The failing test `conversation_os_schema_is_initialized_once_per_db_path` checks that the SQLite schema cache is initialized once per database path. It fails because:
- The cache is a static `OnceLock<Mutex<HashSet<PathBuf>>>` shared across all tests
- Other tests running in parallel add paths to the cache
- The test expects `cache_len == 1` after first persistence, but gets `cache_len == 4`

This is a test isolation bug, NOT a regression from the patch.

## Validation Summary
- ✅ Code compiles
- ✅ All relevant tests pass
- ✅ No regressions introduced
- ⚠️ Pre-existing test failure (unrelated to patch)