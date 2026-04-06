# Policy Spine
<!-- Status: STABLE | Ring: 4 -->

## Invariants (I1–I9)

| ID | Name | Description | Gate |
|----|------|-------------|------|
| I1 | Tauri-only | No web server / preview runtime exposed | G5, CI |
| I2 | Online-first governed | UI ⇒ ZERO direct network; all network via backend/IPC | G3, G4 |
| I3 | 4-Ring strict | Types → Engines → Services → Modules/UI | G9, arch tests |
| I4 | Allowlist deny-by-default | Tauri capabilities/allowlist minimal and justified | G5, G12 |
| I5 | Build x3 proof | Tauri PROD build reproducible x3 | G1, G6 |
| I6 | Tests x3 no skips | All tests pass x3, zero SKIP | G2, G10, G11 |
| I7 | Zero silence | UI and IPC always respond with success or visible error | G13 |
| I8 | Proof pack append-only | Evidence never deleted or overwritten | G0 |
| I9 | Rollback documented | Every change has documented git restore steps | All |

## Ring Model

```
Ring 1 (Types)    src/types/, src/constants/     — no imports, no I/O
Ring 2 (Engines)  src/engines/*/                 — imports Ring 1 only, pure logic
Ring 3 (Services) src/services/*/                — I/O via timeouts + circuit breakers
Ring 4 (OS/UI)    src-tauri/src/, React UI       — can import all rings
```

## IPC Contract (mandatory)

All Tauri commands must return:
```typescript
{ ok: boolean; content?: unknown; error?: { code: string; message: string; details?: unknown; traceId?: string } }
```

## PROD Gate Tokens

PROD operations require explicit tokens from authorized party:
- `GO_FOR_PROD_BUILD__TITANE_INFINITY`
- `GO_FOR_PROD_DEPLOY__TITANE_INFINITY`

Never deduce, approximate, or reformulate these tokens.

## Online-First Governed Policy

- Network ON by default via **controlled surfaces only**: `NetworkService`, `ApiClient`, Tauri IPC network commands.
- Local fallback **mandatory**: Ollama local must always be functional.
- External providers: available if configured; never hard dependencies.
- Governance verification: `pnpm run verify:online-first` before push.

## Stop-the-Line Triggers

1. Build/packaging PROD without explicit gate token
2. UI change without `registry/ui-events.jsonl` entry
3. OMEGA v2 contract broken
4. E2E without tauri-driver wrapper or memory guard
5. Unbounded debug/retry loop
6. Raw `invoke()` outside canonical IPC client
