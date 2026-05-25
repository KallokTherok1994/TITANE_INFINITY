# 06 - Gates And Tests

## Mandatory Gates
| Gate | Raw Evidence | Exit | Verdict |
|---|---:|---:|---|
| Git status baseline | `raw/00_git_status_short.out.txt` | 0 | PASS |
| JSON memory/profile parse | `raw/01_json_memory_profiles_parse.out.txt` | 0 | PASS |
| JSONL registry parse | `raw/02_jsonl_autoheal_registry_parse.out.txt` | 1 | FAIL |
| Dedicated memory integrity | `raw/03_verify_memory_integrity_dedicated.out.txt` | 0 | PASS |
| Legacy memory integrity | `raw/04_verify_memory_integrity_legacy.out.txt` | 0 | PASS_WITH_WARNINGS |
| Chat/memory validators | `raw/05_chat_memory_validators.out.txt` | 0 | PASS |
| Memory isolation gate | `raw/06_gate_memory_isolation.out.txt` | 127 | BLOCKED |
| AutoHeal recurrence | `raw/07_autoheal_detect_recurrence.out.txt` | 0 | PASS |
| Instructions verification | `raw/08_verify_instructions.out.txt` | 0 | PASS |

## Targeted Tests
| Test | Raw Evidence | Exit | Verdict |
|---|---:|---:|---|
| chatEngine memory integration | `raw/09_vitest_chatEngine_memory_integration.out.txt` | 0 | PASS |
| AI memoryIntegration | `raw/10_vitest_ai_memoryIntegration.out.txt` | 0 | PASS |
| memory consumption truth | `raw/11_vitest_memory_consumption_truth.out.txt` | 0 | PASS |
| UnifiedMemory namespace | `raw/12_vitest_unified_memory_namespace.out.txt` | 0 | PASS |
| IPC contract | `raw/13_guard_ipc_contract.out.txt` | 0 | PASS |

## Gate Notes
- `gate_memory_isolation.sh` is not a memory runtime failure; it is a broken gate wrapper pointing to a missing script.
- JSONL parse failure is isolated to `registry/repo-events.jsonl` shape, not memory JSON data.
