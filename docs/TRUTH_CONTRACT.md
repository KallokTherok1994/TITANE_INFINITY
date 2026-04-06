# Truth Contract
<!-- Status: STABLE | Ring: 4 -->

## Version Truth

The single source of truth for application version is `package.json`.

All canonical files must have identical versions before any PROD operation:

| File | Field | Example |
|------|-------|---------|
| `package.json` | `.version` | `"27.2.0"` |
| `src-tauri/Cargo.toml` | `version = "..."` | `"27.2.0"` |
| `src-tauri/tauri.conf.json` | `.version` or `.package.version` | `"27.2.0"` |
| `deployment/latest/MANIFEST.json` | `.version` | `"27.2.0"` |

Gate **G6_TRUTH_CONSISTENCY** enforces this automatically.

## Architecture Truth

The 4-Ring model is enforced by `pnpm test:architecture`.

Ring import violations = FAIL = stop-the-line.

## IPC Truth

Every Tauri command response must match:
```
{ ok: boolean, content?: T, error?: { code: string, message: string } }
```

`IPC_*` errors are distinct from `ProviderDown` errors. These must never be conflated.

## Proof Truth

Proof packs are append-only. Any claim of "PASS" must be backed by a JSONL entry in `proof_packs/`.

No claim can be made without evidence. If evidence cannot be gathered:
- Emit `BLOCKED_RUNNER` with cause + next action
- Emit `BLOCKED_INSTRUMENTATION` with cause + next action

## Anti-Hallucination Rules

1. Never claim "it should work" without a test proof.
2. Never claim a gate PASSed without a `run.jsonl` entry.
3. Never claim a version is correct without running G6.
4. A `BLOCKED_*` status with documented cause + action is acceptable.
5. An uncited "PASS" is not acceptable.
