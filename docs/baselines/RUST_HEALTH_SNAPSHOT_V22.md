# Rust Health Snapshot — V22 Baseline

**Generated:** 2026-02-22 (V22 measurement phase)  
**Status:** RAW DATA ONLY (no optimizations applied)  
**Environment:** Linux, Rust 1.91.0, cargo stable

---

## 1. Clippy Analysis

### Command
```bash
cargo clippy --all-targets --all-features
```

### Result: COMPILATION ERROR

**Error:**
```
error: useless lint attribute
 --> src/commands/copilot_commands.rs:8:1
  |
8 | #[cfg_attr(test, allow(clippy::unwrap_used))]
  | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ help: if you just forgot a `!`, use: `#![cfg_attr(test, allow(clippy::unwrap_used)`
  |
  = note: `#[deny(clippy::useless_attribute)]` on by default
```

**Warnings Before Error:** 14 warnings detected (partial run)

### Warning Categories (First 100 lines observed)

| Category | Count | Examples |
|----------|-------|----------|
| `expect_used` | ~3 | `expect("...")` on Option/Result |
| `manual_range_contains` | ~6 | Manual `if a && b` instead of `(a..=b).contains()` |
| `redundant_pattern_matching` | 1 | Pattern match instead of `.is_ok()` |
| `unnecessary_cast` | 1 | `as u32` on u32 |
| `derivable_impls` | 1 | Manual Default impl instead of derive |
| `explicit_counter_loop` | 1 | Manual index variable in loop |
| `empty_line_after_doc_comments` | ~1 | Doc comment formatting |

### Total Warnings Estimated
**~14 warnings** (likely fixable with `cargo clippy --fix`)

**Status:** ⚠️ Blocking issue (error prevents full clippy check)

---

## 2. Test Results

### Command
```bash
cargo test --all
```

### Result: MOSTLY PASSING

**Summary:**
```
test result: FAILED. 4381 passed; 2 failed; 7 ignored; 0 measured
```

**Test Statistics:**
- Total tests: **4390** (4381 passed + 2 failed + 7 ignored)
- Pass rate: **99.8%**
- Failed: **2**

### Failed Tests

1. **Audio Ring Buffer Wraparound**
   ```
   thread 'audio::streaming_engine::tests::test_ring_buffer_wraparound' panicked
   assertion `left == right` failed
     left: 2
    right: 5
   Location: src/audio/streaming_engine.rs:446:9
   ```
   **Impact:** Audio streaming may have buffer underrun/overflow logic error

2. **Control Panel Version Mismatch**
   ```
   thread 'control_panel_commands::tests::control_panel_tests::test_cp_get_system_info' panicked
   assertion `left == right` failed
     left: "27.0.5"
    right: "27.0.2"
   Location: src/control_panel_commands/tests.rs:27:9
   ```
   **Impact:** Hardcoded version expectation in test (likely stale baseline)

### Status: 🟡 High (2 test failures, likely fixable)

---

## 3. Release Build

### Command
```bash
cargo build --release
```

### Result: TIMEOUT

**Status:** ⏱️ Build exceeds 3 minutes (timeout at 180s, exit code 143)

**Reason:** Unknown (likely heavy linking/optimization phase)

**Impact:** Cannot confirm release binary builds cleanly

---

## 4. Unsafe Usage Inventory

### Command
```bash
git grep -n "unsafe" -- "src-tauri/src/" | wc -l
```

### Result
```
12 unsafe blocks
```

**Files with unsafe:**
- (Data collection only; specific locations not inventoried yet)

**Status:** 🟢 Low (12 unsafe blocks is minimal for Tauri backend)

---

## 5. Unwrap/Expect Inventory

### Command
```bash
git grep -n ".unwrap()" -- "src-tauri/src/" | wc -l
git grep -n ".expect(" -- "src-tauri/src/" | wc -l
```

### Results

| Pattern | Count | Category |
|---------|-------|----------|
| `.unwrap()` | **73** | Panic-prone operations |
| `.expect(...)` | **1,432** | Panic-prone with messages |
| **Total** | **1,505** | Risk: High density |

**Status:** 🔴 High (1,505 panic risk points)

**Context:** These are scattered throughout the codebase. No centralized panic handling strategy observed.

---

## 6. TODO/FIXME Markers

### Command
```bash
git grep -i "TODO" -- "src-tauri/src/" | wc -l
```

### Result
```
4 TODO markers
```

**Status:** 🟢 Low (minimal technical debt markers)

---

## 7. Cargo Audit (Vulnerability Audit)

### Command
```bash
cargo audit
```

### Results

**Summary:**
```
Scanning Cargo.lock for vulnerabilities (743 crate dependencies)
warning: 23 allowed warnings found
```

### Warnings Detailed

**Category 1: Unmaintained GTK3 Bindings** (22 advisories)
- Crates: `atk`, `atk-sys`, `gdk-pixbuf`, `gdk-pixbuf-sys`, `gdk`, `gdk-sys`, `gdkx11`, `cairo-rs`, etc.
- ID: `RUSTSEC-2024-0413`, `RUSTSEC-2024-0416` (and similar)
- Title: "gtk-rs GTK3 bindings - no longer maintained"
- Date: 2024-03-04
- **Impact:** LOW (GTK3 bindings are for UI, not core runtime)
- **Severity:** ⚠️ Informational (not security vulnerability, just unmaintained)

**Category 2: Unsound in LRU Cache**
- Crate: `lru 0.12.5`
- ID: `RUSTSEC-2026-0002`
- Title: "`IterMut` violates Stacked Borrows by invalidating internal pointer"
- Date: 2026-01-07
- **Impact:** HIGH (potential memory safety issue)
- **Severity:** 🔴 Unsound (Undefined Behavior possible)
- **Status:** In direct dependency (titane-infinity 27.0.5 uses lru)

### Status: 🔴 Critical (1 unsound crate; 23 unmaintained warnings)

---

## 8. Feature Flags (Active)

### Command
```bash
Cargo.toml: [features]
```

### Observed Features (from earlier compilation)
- `tauri` framework features (all enabled)
- `serde` serialization
- `tokio` async runtime
- (Full list not inventoried; see Cargo.toml for details)

**Status:** 🟢 Standard (typical for Tauri + Rust backend)

---

## 9. Summary Table

| Pillar | Metric | Value | Status | Notes |
|--------|--------|-------|--------|-------|
| **Clippy** | Warnings | 14+ | 🔴 | Compilation error blocks check |
| **Tests** | Pass Rate | 99.8% (4381/4390) | 🟡 | 2 failures (audio, version) |
| **Build** | Release Time | >180s | ⏱️ | Timeout; unknown cause |
| **Unsafe** | Count | 12 | 🟢 | Low usage |
| **Unwrap/Expect** | Count | 1,505 | 🔴 | High panic risk |
| **TODOs** | Count | 4 | 🟢 | Minimal technical debt |
| **Audit** | Vulnerabilities | 1 unsound + 23 warnings | 🔴 | LRU crate issue critical |
| **Dependencies** | Total | 743 crates | ⚠️ | GTK3 bindings unmaintained |

---

## 10. Factual Conclusions (No Interpretation)

1. **Build Success:** Clippy error blocks compilation check; test run shows 99.8% pass; release build times out
2. **Safety Risk:** 1,505 panic-prone operations (unwrap/expect) scattered across codebase
3. **Security Risk:** 1 unsound vulnerability in LRU cache (memory safety); 23 unmaintained GTK warnings
4. **Code Health:** 14 clippy warnings (fixable); 4 TODOs (minimal); 12 unsafe blocks (acceptable)
5. **Test Coverage:** 4,390 total tests; 2 known failures (audio buffer, version mismatch)

---

## 11. Raw Data (Artifacts)

**Timestamp:** 2026-02-22T18:15:00Z (approximate)  
**Git HEAD:** (from V21 final commit)  
**Cargo Version:** See `cargo --version`  
**Rust Toolchain:** rustc 1.91.0

**Files Analyzed:**
- `src-tauri/Cargo.toml`
- `src-tauri/Cargo.lock`
- `src-tauri/src/**/*.rs` (full tree)

---

## Next Phase

**V22 Measurement Only:** This snapshot is baseline raw data. No optimizations or fixes applied.

**V23+ Planning:** Based on these measurements, prioritize:
1. Fix LRU unsound issue (CRITICAL: memory safety)
2. Investigate audio buffer test failure
3. Update control panel version test
4. Reduce unwrap/expect density (optional, not urgent)
5. Resolve clippy error to enable full checks

---

**Document Purpose:** Quantitative baseline for Core Engine Track (Pillar 4: Rust Backend Audit)  
**Status:** REFERENCE DATA (measurement phase complete)
