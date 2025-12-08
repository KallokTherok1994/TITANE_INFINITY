# TITANE_DEVOPS_AND_TESTING.md

## DevOps & Testing Guide — Infrastructure & Quality Assurance v20.1

**Date:** 2025-12-07
**Version:** TITANE∞ v20.1
**Classification:** Official Documentation

---

## 1. Overview

This document covers the testing infrastructure, CI/CD pipelines, and DevOps practices for TITANE∞. The system maintains **458 tests** across unit and integration test suites.

### 1.1 Test Metrics (v20.1)

| Metric                     | Value      |
| -------------------------- | ---------- |
| Unit Tests (src/)          | **390**    |
| Integration Tests (tests/) | **68**     |
| Total Tests                | **458**    |
| Build Status               | ✅ Passing |
| Target Coverage (Backend)  | 80%+       |
| Target Coverage (Frontend) | 60%+       |

---

## 2. Test Infrastructure

### 2.1 Test Organization

```
src-tauri/
├── src/
│   ├── **/*.rs           # Unit tests (inline #[cfg(test)])
│   └── ...
├── tests/                 # Integration tests
│   ├── ipc_cache_test.rs
│   ├── dashmap_performance_test.rs
│   ├── intelligent_cache_test.rs
│   ├── secure_engine_tests.rs
│   ├── security_tests.rs
│   ├── agent_ia_workflow_test.rs
│   ├── fallback_chain_test.rs
│   ├── singularity_integration_test.rs
│   ├── metrics_stress_test.rs
│   └── concurrent_access_test.rs
└── benches/              # Benchmarks
    └── ipc_benchmarks.rs
```

### 2.2 Test Distribution by Module

| Module                 | Tests | Description                          |
| ---------------------- | ----- | ------------------------------------ |
| `security/`            | ~50   | Validation, encryption, vault        |
| `ai/`                  | ~30   | Router, cache, Gemini, Ollama        |
| `core/`                | ~60   | State, types, modules                |
| `conversation_engine/` | ~40   | Pipeline, memory, intent, emotion    |
| `cognitive/`           | ~25   | Engine, awareness                    |
| `memory/`              | ~30   | Storage, model, vector               |
| `healing/`             | ~35   | Self-healing, validators             |
| `identity/`            | ~20   | System identity                      |
| `time/`                | ~20   | Travel, backup, snapshot             |
| `ipc/`                 | ~15   | Cache layer                          |
| Others                 | ~65   | Narrative, adaptive, overdrive, etc. |

### 2.3 Integration Test Details

| Test File                         | Tests | Description                         |
| --------------------------------- | ----- | ----------------------------------- |
| `ipc_cache_test.rs`               | 15    | Cache operations, expiration, stats |
| `dashmap_performance_test.rs`     | 6     | Concurrent read/write performance   |
| `intelligent_cache_test.rs`       | 10    | Intelligent caching strategies      |
| `secure_engine_tests.rs`          | 12    | Security engine validation          |
| `security_tests.rs`               | 8     | Security layer tests                |
| `agent_ia_workflow_test.rs`       | 5     | AI workflow integration             |
| `fallback_chain_test.rs`          | 4     | Provider fallback chains            |
| `singularity_integration_test.rs` | 4     | Singularity state integration       |
| `metrics_stress_test.rs`          | 2     | Metrics under load                  |
| `concurrent_access_test.rs`       | 2     | Concurrent access patterns          |

---

## 3. Running Tests

### 3.1 Basic Commands

```bash
# All tests
cargo test

# Unit tests only
cargo test --lib

# Specific integration test
cargo test --test ipc_cache_test
cargo test --test dashmap_performance_test

# Tests with output
cargo test -- --nocapture

# Run specific test function
cargo test test_cache_basic_operations

# Compile tests without running
cargo test --no-run
```

### 3.2 Test Options

```bash
# Run tests in parallel (default)
cargo test

# Run tests sequentially
cargo test -- --test-threads=1

# Show ignored tests
cargo test -- --ignored

# Run only ignored tests
cargo test -- --ignored --test-threads=1
```

### 3.3 Async Tests

Most tests use `tokio::test` for async operations:

```rust
#[tokio::test]
async fn test_async_operation() {
    let result = async_function().await;
    assert!(result.is_ok());
}
```

---

## 4. Benchmarks

### 4.1 Cargo.toml Configuration

```toml
[dev-dependencies]
criterion = { version = "0.5", features = ["html_reports"] }

[[bench]]
name = "ipc_benchmarks"
harness = false
```

### 4.2 Running Benchmarks

```bash
# Run all benchmarks
cargo bench

# Run specific benchmark
cargo bench --bench ipc_benchmarks

# Generate HTML report
cargo bench -- --save-baseline main
```

### 4.3 Benchmark Structure

```rust
// benches/ipc_benchmarks.rs
use criterion::{black_box, criterion_group, criterion_main, Criterion};

fn cache_benchmark(c: &mut Criterion) {
    let cache = IPCCache::new(10);

    c.bench_function("cache_get_or_compute", |b| {
        b.iter(|| {
            cache.get_or_compute("key", || black_box("value".to_string()))
        })
    });
}

criterion_group!(benches, cache_benchmark);
criterion_main!(benches);
```

---

## 5. Code Quality

### 5.1 Clippy

```bash
# Run Clippy with warnings as errors
cargo clippy -- -D warnings

# Run Clippy with all lints
cargo clippy -- -W clippy::all

# Fix auto-fixable issues
cargo clippy --fix
```

### 5.2 Formatting

```bash
# Check formatting
cargo fmt --check

# Apply formatting
cargo fmt
```

### 5.3 Documentation

```bash
# Build docs
cargo doc

# Build and open docs
cargo doc --open

# Include private items
cargo doc --document-private-items
```

---

## 6. Build Commands

### 6.1 Development Build

```bash
# Debug build
cargo build

# Check without building
cargo check

# Watch mode (requires cargo-watch)
cargo watch -x check
```

### 6.2 Release Build

```bash
# Optimized build
cargo build --release

# Build with specific target
cargo build --release --target x86_64-unknown-linux-gnu
```

### 6.3 Build Metrics

| Build Type              | Time (approx) |
| ----------------------- | ------------- |
| `cargo check`           | ~3s           |
| `cargo build`           | ~45s          |
| `cargo build --release` | ~3min         |
| `cargo test --no-run`   | ~60s          |

---

## 7. CI/CD Pipeline

### 7.1 GitHub Actions Configuration

```yaml
# .github/workflows/ci.yml
name: TITANE CI

on: [push, pull_request]

env:
  CARGO_TERM_COLOR: always

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Install Rust
        uses: dtolnay/rust-toolchain@stable

      - name: Cache cargo
        uses: actions/cache@v3
        with:
          path: |
            ~/.cargo/registry
            ~/.cargo/git
            target
          key: ${{ runner.os }}-cargo-${{ hashFiles('**/Cargo.lock') }}

      - name: Build
        run: cargo build --release
        working-directory: src-tauri

      - name: Test
        run: cargo test --lib
        working-directory: src-tauri

      - name: Clippy
        run: cargo clippy -- -D warnings
        working-directory: src-tauri

      - name: Format Check
        run: cargo fmt --check
        working-directory: src-tauri

  integration-tests:
    runs-on: ubuntu-latest
    needs: test
    steps:
      - uses: actions/checkout@v4

      - name: Install Rust
        uses: dtolnay/rust-toolchain@stable

      - name: Run Integration Tests
        run: cargo test --test '*'
        working-directory: src-tauri

  benchmark:
    runs-on: ubuntu-latest
    needs: test
    if: github.event_name == 'push' && github.ref == 'refs/heads/MAIN'
    steps:
      - uses: actions/checkout@v4

      - name: Install Rust
        uses: dtolnay/rust-toolchain@stable

      - name: Run Benchmarks
        run: cargo bench
        working-directory: src-tauri
```

### 7.2 Branch Protection Rules

| Rule                        | Setting      |
| --------------------------- | ------------ |
| Require PR reviews          | 1 approval   |
| Require status checks       | test, clippy |
| Require branches up to date | Yes          |
| Enforce on admins           | Yes          |

---

## 8. Test Patterns

### 8.1 Unit Test Pattern

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_function_name() {
        // Arrange
        let input = "test";

        // Act
        let result = function_under_test(input);

        // Assert
        assert!(result.is_ok());
        assert_eq!(result.unwrap(), expected_value);
    }
}
```

### 8.2 Async Test Pattern

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_async_function() {
        // Arrange
        let service = Service::new();

        // Act
        let result = service.async_operation().await;

        // Assert
        assert!(result.is_ok());
    }
}
```

### 8.3 Integration Test Pattern

```rust
// tests/integration_test.rs
use titane_infinity::module::{Component, Config};

#[tokio::test]
async fn test_full_workflow() {
    // Setup
    let config = Config::default();
    let component = Component::new(config);

    // Execute workflow
    component.init().await.unwrap();
    let result = component.process("input").await;

    // Verify
    assert!(result.is_ok());
    assert_eq!(component.state(), ExpectedState::Complete);
}
```

### 8.4 Performance Test Pattern

```rust
#[tokio::test]
async fn test_performance_target() {
    let start = std::time::Instant::now();

    // Operation under test
    for _ in 0..1000 {
        operation().await;
    }

    let elapsed = start.elapsed();

    // P95 target: < 100ms
    assert!(
        elapsed.as_millis() < 100,
        "Performance target missed: {}ms",
        elapsed.as_millis()
    );
}
```

---

## 9. Test Fixtures

### 9.1 Common Test Fixtures

```rust
// tests/common/mod.rs
pub fn create_test_config() -> Config {
    Config {
        debug: true,
        timeout_ms: 1000,
        max_retries: 3,
    }
}

pub async fn setup_test_environment() -> TestEnv {
    let config = create_test_config();
    let db = create_test_db().await;
    TestEnv { config, db }
}

pub struct TestEnv {
    pub config: Config,
    pub db: TestDb,
}

impl Drop for TestEnv {
    fn drop(&mut self) {
        // Cleanup
    }
}
```

### 9.2 Mock Structures

```rust
#[derive(Clone, Debug)]
#[allow(dead_code)]  // Fields used for Debug output
struct MockConversation {
    id: String,
    messages: Vec<String>,
}

impl MockConversation {
    fn new(id: &str) -> Self {
        Self {
            id: id.to_string(),
            messages: vec![],
        }
    }
}
```

---

## 10. Coverage

### 10.1 Tarpaulin (Recommended)

```bash
# Install tarpaulin
cargo install cargo-tarpaulin

# Run coverage
cargo tarpaulin --out Html

# With specific configuration
cargo tarpaulin --out Html --exclude-files "tests/*" --timeout 300
```

### 10.2 Coverage Configuration

```toml
# .tarpaulin.toml
[tarpaulin]
timeout = "300s"
out = ["Html", "Lcov"]
exclude-files = ["tests/*", "benches/*"]
ignore-tests = true
```

### 10.3 Coverage Targets

| Component         | Target | Current (est.) |
| ----------------- | ------ | -------------- |
| Backend Rust      | 80%+   | ~70%           |
| Frontend React/TS | 60%+   | ~50%           |

---

## 11. Common Test Issues Fixed (v20.1)

### 11.1 Duplicate Test Functions

**Problem:** Two tests with same name
**Solution:** Rename to unique names

```rust
// BEFORE (Error E0428)
#[test]
fn test_sanitize_filename() { ... }
#[test]
fn test_sanitize_filename() { ... }

// AFTER
#[test]
fn test_sanitize_filename() { ... }
#[test]
fn test_sanitize_filename_advanced() { ... }
```

### 11.2 Instance vs Static Methods

**Problem:** Calling instance method as static
**Solution:** Create instance first

```rust
// BEFORE (Error E0061)
assert!(InputValidator::validate_message("Hello").is_ok());

// AFTER
let validator = InputValidator::default();
assert!(validator.validate_message("Hello").is_ok());
```

### 11.3 Missing Trait Implementation

**Problem:** Type alias lacks method
**Solution:** Add trait with implementation

```rust
// BEFORE (Error: no method generate)
let key = MasterKey::generate();

// AFTER
pub trait MasterKeyGenerator {
    fn generate() -> Self;
}

impl MasterKeyGenerator for MasterKey {
    fn generate() -> Self {
        let mut key = [0u8; 32];
        rand::thread_rng().fill_bytes(&mut key);
        key
    }
}
```

### 11.4 Unused Imports in Tests

**Problem:** Import only used in tests
**Solution:** `#[cfg(test)]` guard or `#[allow(unused_imports)]`

```rust
// Option 1: Conditional import
#[cfg(test)]
use super::encryption::MasterKeyGenerator;

// Option 2: Allow unused
#[allow(unused_imports)]
use titane_infinity::ipc::{IPCCache, CacheStats};
```

### 11.5 Dead Code in Test Structures

**Problem:** Struct fields never read
**Solution:** `#[allow(dead_code)]`

```rust
#[derive(Clone, Debug)]
#[allow(dead_code)]
struct MockConversation {
    id: String,
    messages: Vec<String>,
}
```

---

## 12. Environment Variables

### 12.1 Test Environment

```bash
# Run tests with specific log level
RUST_LOG=debug cargo test

# Run with backtrace
RUST_BACKTRACE=1 cargo test

# Disable parallel tests
RUST_TEST_THREADS=1 cargo test
```

### 12.2 CI Environment

```yaml
env:
  CARGO_TERM_COLOR: always
  RUST_BACKTRACE: 1
  RUST_LOG: warn
```

---

## 13. Recommended Workflow

### 13.1 Before Commit

```bash
# 1. Format code
cargo fmt

# 2. Check for issues
cargo clippy -- -D warnings

# 3. Run tests
cargo test

# 4. Build release
cargo build --release
```

### 13.2 PR Checklist

- [ ] All tests pass (`cargo test`)
- [ ] No Clippy warnings (`cargo clippy -- -D warnings`)
- [ ] Code formatted (`cargo fmt --check`)
- [ ] Build succeeds (`cargo build --release`)
- [ ] Documentation updated if needed

---

## 14. Related Documentation

| Document                                                   | Description         |
| ---------------------------------------------------------- | ------------------- |
| [TITANE_OS_OVERVIEW.md](TITANE_OS_OVERVIEW.md)             | System architecture |
| [TITANE_OS_SECURITY_MODEL.md](TITANE_OS_SECURITY_MODEL.md) | Security testing    |

---

_Documentation officielle TITANE∞ DevOps & Testing v20.1 — Super Prompt #5_
