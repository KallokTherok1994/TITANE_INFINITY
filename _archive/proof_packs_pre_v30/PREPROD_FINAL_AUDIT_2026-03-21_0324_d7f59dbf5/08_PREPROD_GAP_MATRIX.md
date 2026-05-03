# 08_PREPROD_GAP_MATRIX

## Code / Runtime
| Item | Classification |
|------|---------------|
| tsc --noEmit | PROVEN_RUNTIME (EXIT 0) |
| cargo check | PROVEN_RUNTIME (EXIT 0) |
| TWINS IPC commands | PROVEN_RUNTIME (registered; prior certification) |
| Memory LTM disk write | PROVEN_RUNTIME (cargo check; prior certification) |
| Memory backup/restore | PROVEN_RUNTIME (cargo check; capabilities registered) |
| Provider reset circuit-breaker | PROVEN_RUNTIME (prior certification) |
| Chat memory injection | PROVEN_RUNTIME (27 tests x3) |

## UI / Navigation
| Item | Classification |
|------|---------------|
| TITANE slot 1 TopNav | PROVEN_VISIBLE_ONLY (no live runtime this session) |
| Symbiose tab under TITANE | PROVEN_VISIBLE_ONLY (tsc clean; TwinEvolutionPanel mounts) |
| /twins → /titane redirect | NAV_ONLY (static route config, correct by inspection) |
| Desktop Symbiose tab visible | DESKTOP_UNPROVEN |

## Registry / Docs
| Item | Classification |
|------|---------------|
| ui-events.jsonl (TWINS) | REGISTRY_DRIFT → FIXED ✅ |
| proofpack-index.jsonl (TWINS) | REGISTRY_DRIFT → FIXED ✅ |
| CHANGELOG.md nav entry | DOC_RUNTIME_DRIFT → FIXED ✅ |

## Environment Blockers (persistent, unchanged)
| Blocker | Classification |
|---------|---------------|
| node v18 < v20 | BLOCKED_BY_ENV (pnpm build blocked) |
| No display server | BLOCKED_BY_ENV (Tauri GUI build blocked) |
| Prod tokens not provided | BLOCKED_BY_POLICY |
| Supply chain (SBOM, signing) | BLOCKED_BY_ENV |
