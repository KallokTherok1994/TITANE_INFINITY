# TITANE_DOCUMENTATION_INDEX.md

## TITANE∞ OS — Documentation Index v20.1

**Date:** 2025-12-07
**Version:** TITANE∞ v20.1
**Classification:** Master Index

---

## Documentation Overview

This index provides navigation to all official TITANE∞ OS documentation. The documentation set covers the complete system architecture, from high-level overview to detailed implementation guides.

---

## Core Documentation

### 1. System Architecture

| Document                                       | Description                    | Key Topics                                                                            |
| ---------------------------------------------- | ------------------------------ | ------------------------------------------------------------------------------------- |
| [TITANE_OS_OVERVIEW.md](TITANE_OS_OVERVIEW.md) | System vision and architecture | 9-engine architecture, SingularityState, module distribution, initialization sequence |

**Quick Links:**

- [Vision & Philosophy](TITANE_OS_OVERVIEW.md#1-vision--philosophy)
- [9-Engine Architecture](TITANE_OS_OVERVIEW.md#3-the-9-engine-architecture)
- [SingularityState](TITANE_OS_OVERVIEW.md#4-singularitystate)
- [Performance Metrics](TITANE_OS_OVERVIEW.md#7-performance-metrics)

---

### 2. Conversation Pipeline

| Document                                             | Description                      | Key Topics                                                   |
| ---------------------------------------------------- | -------------------------------- | ------------------------------------------------------------ |
| [TITANE_OMEGA_PIPELINE.md](TITANE_OMEGA_PIPELINE.md) | 11-stage conversation processing | Parallel execution, French Mastery, self-healing, AI routing |

**Quick Links:**

- [Pipeline Architecture](TITANE_OMEGA_PIPELINE.md#2-pipeline-architecture)
- [Parallel Stages 2-4](TITANE_OMEGA_PIPELINE.md#stages-2-4-parallel-execution)
- [French Mastery](TITANE_OMEGA_PIPELINE.md#stage-65-french-mastery-post-processing)
- [Request/Response Types](TITANE_OMEGA_PIPELINE.md#4-requestresponse-types)

---

### 3. Memory System

| Document                                                   | Description                    | Key Topics                                                    |
| ---------------------------------------------------------- | ------------------------------ | ------------------------------------------------------------- |
| [TITANE_UNIFIED_MEMORY_OS.md](TITANE_UNIFIED_MEMORY_OS.md) | Three-tier memory architecture | STM/MTM/LTM, VecDeque optimization, SmallVec, HashMap indexes |

**Quick Links:**

- [Three-Tier Model](TITANE_UNIFIED_MEMORY_OS.md#21-three-tier-memory-model)
- [Data Structures](TITANE_UNIFIED_MEMORY_OS.md#3-data-structures)
- [Operations](TITANE_UNIFIED_MEMORY_OS.md#4-operations)
- [Memory Lifecycle](TITANE_UNIFIED_MEMORY_OS.md#7-memory-lifecycle)

---

### 4. Cognitive Engines

| Document                                                         | Description                     | Key Topics                                                                       |
| ---------------------------------------------------------------- | ------------------------------- | -------------------------------------------------------------------------------- |
| [TITANE_OS_COGNITIVE_ENGINES.md](TITANE_OS_COGNITIVE_ENGINES.md) | Advanced reasoning architecture | Three Centers, Analysis/Consistency/Evolution/Integration engines, Context Graph |

**Quick Links:**

- [Three Centers (v15)](TITANE_OS_COGNITIVE_ENGINES.md#3-three-centers-v15-legacy)
- [Cognitive Engines (v16+)](TITANE_OS_COGNITIVE_ENGINES.md#4-cognitive-engines-v16)
- [Context Graph](TITANE_OS_COGNITIVE_ENGINES.md#5-context-graph-sp-cogn-002)
- [Pipeline Integration](TITANE_OS_COGNITIVE_ENGINES.md#10-integration-with-pipeline)

---

### 5. Security Model

| Document                                                   | Description               | Key Topics                                                                 |
| ---------------------------------------------------------- | ------------------------- | -------------------------------------------------------------------------- |
| [TITANE_OS_SECURITY_MODEL.md](TITANE_OS_SECURITY_MODEL.md) | Defense-in-depth security | Validation, encryption (AES-256-GCM), vault, sandbox, rate limiting, audit |

**Quick Links:**

- [Security Domains](TITANE_OS_SECURITY_MODEL.md#2-security-domains)
- [Input Validation](TITANE_OS_SECURITY_MODEL.md#4-input-validation)
- [Encryption](TITANE_OS_SECURITY_MODEL.md#5-encryption)
- [Vault Engine](TITANE_OS_SECURITY_MODEL.md#6-vault-engine)
- [Rate Limiting](TITANE_OS_SECURITY_MODEL.md#8-rate-limiting-v193)

---

### 6. DevOps & Testing

| Document                                                     | Description                      | Key Topics                                                     |
| ------------------------------------------------------------ | -------------------------------- | -------------------------------------------------------------- |
| [TITANE_DEVOPS_AND_TESTING.md](TITANE_DEVOPS_AND_TESTING.md) | Testing infrastructure and CI/CD | 458 tests, benchmarks, CI/CD pipeline, test patterns, coverage |

**Quick Links:**

- [Test Infrastructure](TITANE_DEVOPS_AND_TESTING.md#2-test-infrastructure)
- [Running Tests](TITANE_DEVOPS_AND_TESTING.md#3-running-tests)
- [CI/CD Pipeline](TITANE_DEVOPS_AND_TESTING.md#7-cicd-pipeline)
- [Test Patterns](TITANE_DEVOPS_AND_TESTING.md#8-test-patterns)

---

## Quick Reference

### System Commands

```bash
# Build
cargo build --release

# Test
cargo test
cargo test --lib
cargo test --test ipc_cache_test

# Quality
cargo clippy -- -D warnings
cargo fmt --check

# Benchmarks
cargo bench
```

### Key Metrics (v20.1)

| Metric           | Value      |
| ---------------- | ---------- |
| Pipeline Latency | ~150-200ms |
| Cache Hit TTFT   | <50ms      |
| Total Tests      | 458        |
| Modules          | 85+        |
| Memory Lookup    | O(1)       |
| Boot Time        | ~100ms     |

### Architecture Highlights

```
┌─────────────────────────────────────────────────────────────┐
│                    TITANE∞ v20.1                            │
├─────────────────────────────────────────────────────────────┤
│  Frontend: React 18 + TypeScript + Tauri IPC               │
├─────────────────────────────────────────────────────────────┤
│  Backend: Rust + Tokio + 85+ Modules                       │
├─────────────────────────────────────────────────────────────┤
│  9 Core Engines:                                            │
│  ├─ SingularityEngine (Master)                             │
│  ├─ CoherenceEngine                                         │
│  ├─ UnifiedMemory (STM/MTM/LTM)                            │
│  ├─ HarmoniaModule                                          │
│  ├─ SystemHealth                                            │
│  ├─ CognitiveEngine                                         │
│  ├─ NarrativeEngine                                         │
│  ├─ AdaptiveEngine                                          │
│  └─ AIRouter                                                │
├─────────────────────────────────────────────────────────────┤
│  OMEGA Pipeline: 11 stages, parallel execution              │
├─────────────────────────────────────────────────────────────┤
│  Security: AES-256-GCM, Vault, Sandbox, Rate Limiting      │
└─────────────────────────────────────────────────────────────┘
```

---

## Version History

| Version | Date       | Changes                                                                   |
| ------- | ---------- | ------------------------------------------------------------------------- |
| v20.1   | 2025-12-07 | Performance optimizations (SP#3), test fixes (SP#4), documentation (SP#5) |
| v20.0   | 2025-12-06 | Architecture consolidation (SP#2), 9 fusions completed                    |
| v19.5.2 | 2025-12-05 | IPC cache, DashMap migration                                              |
| v19.3   | 2025-12-04 | Security hardening, rate limiting, audit logging                          |

---

## File Structure

```
docs/TITANE_OS/
├── TITANE_DOCUMENTATION_INDEX.md    # This file (master index)
├── TITANE_OS_OVERVIEW.md            # System architecture
├── TITANE_OMEGA_PIPELINE.md         # Pipeline documentation
├── TITANE_UNIFIED_MEMORY_OS.md      # Memory system
├── TITANE_OS_COGNITIVE_ENGINES.md   # Cognitive layer
├── TITANE_OS_SECURITY_MODEL.md      # Security architecture
└── TITANE_DEVOPS_AND_TESTING.md     # Testing & DevOps
```

---

## Related Resources

### Reports

| Report                            | Description                            |
| --------------------------------- | -------------------------------------- |
| `TITANE_PERFORMANCE_V1_REPORT.md` | Performance optimization report (SP#3) |
| `TITANE_TESTS_AND_QA_REPORT.md`   | Test infrastructure report (SP#4)      |

### Source Directories

| Directory                            | Description                 |
| ------------------------------------ | --------------------------- |
| `src-tauri/src/core/`                | Core engine implementations |
| `src-tauri/src/ai/`                  | AI routing and caching      |
| `src-tauri/src/security/`            | Security modules            |
| `src-tauri/src/cognitive/`           | Cognitive engines           |
| `src-tauri/src/conversation_engine/` | OMEGA pipeline              |
| `src-tauri/tests/`                   | Integration tests           |
| `src-tauri/benches/`                 | Benchmarks                  |

---

## Contact & Support

- **Repository:** TITANE_INFINITY
- **Branch:** MAIN
- **Documentation Generated:** Super Prompt #5 (2025-12-07)

---

_Documentation officielle TITANE∞ OS v20.1 — Index Master_
