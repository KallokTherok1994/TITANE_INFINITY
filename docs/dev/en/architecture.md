# TITANE∞ — Architecture (EN)

**Version:** 28.0.0  
**Status:** QUALIFIED  
**Date:** 2026-03-17

> See also: `docs/ARCHITECTURE.md`, `docs/MAP_ARCHITECTURE_4RING.md`, `docs/IPC_CONTRACT.md`

---

## 4-Ring model

TITANE∞ uses a **4-Ring** architectural model to separate responsibilities.

```
Ring 1 — Type contracts      [src/types/]
Ring 2 — Pure logic          [src/engines/]
Ring 3 — Governed I/O        [src/services/]
Ring 4 — UI + OS/IPC         [src/ UI + src-tauri/]
```

### Import rules

- **No inverse imports** — a ring cannot import from an outer ring
- Ring 1 → no external dependencies
- Ring 2 → may import Ring 1 only
- Ring 3 → may import Ring 1 and Ring 2
- Ring 4 → may import all rings

**Status:** QUALIFIED — verified by `test:architecture` and `scripts/verify/`

---

## Frontend (Ring 4 — UI)

| Component | Technology | Version |
|---|---|---|
| UI Framework | React | 18.x |
| Language | TypeScript | 5.5 (strict) |
| Build | Vite | 6.x |
| State | Hooks + Context API | — |
| Backend communication | Tauri IPC | v2 |

**Directory:** `src/`

---

## Backend (Ring 4 — OS/IPC)

| Component | Technology | Notes |
|---|---|---|
| Runtime | Tauri v2 | Desktop application only |
| Backend language | Rust 2021 | `src-tauri/src/` |
| IPC serialization | JSON via serde | — |
| Concurrency model | Arc<Mutex<T>> | — |
| Error handling | Result<T, E> | No uncontrolled panics |

**Directory:** `src-tauri/`

---

## IPC contract

All frontend → backend communication follows this contract:

```typescript
// Standard IPC response
{
  ok: boolean,
  content?: string,
  error?: {
    code: string,
    message: string,
    recoverable: boolean
  },
  meta?: {
    correlationId: string,
    provider: string,
    latencyMs: number
  }
}
```

**Contract rules:**
- `ok: false` on any error — never silent
- UI timeout: 30 seconds → error + "Retry" button
- Tauri allowlist (`src-tauri/allowlist.whitelist.stable.json`) controls which commands are exposed

**Source:** `docs/IPC_CONTRACT.md` (PROVEN)

---

## Network policy

```
UI → Tauri IPC → Services (Ring 3) → Network Gateway → External provider
```

- **No direct network access from UI** — all requests go through IPC
- **Online-first governed** — network connectivity required for cloud providers
- **Mandatory local fallback** — must activate when cloud providers are unavailable (PARTIAL)
- Verification gate: `pnpm run verify:online-first` and `pnpm run verify:network-guard`

---

## Core backend modules

| Module | Responsibility | Status |
|---|---|---|
| Helios | System metrics | PROVEN |
| Nexus | Dependency graph | PROVEN |
| Harmonia | Load balancing/harmonization | QUALIFIED |
| Sentinel | Security monitoring | QUALIFIED |
| Watchdog | Process monitoring | PROVEN |
| SelfHeal | Auto-repair | PARTIAL |
| AdaptiveEngine | Behavioral adaptation | PARTIAL |
| Memory | Hierarchical memory STM/MTM/LTM | PARTIAL |

---

## Diagrams

- Global architecture: `docs/ARCHITECTURE.md`
- 4-Ring mapping: `docs/MAP_ARCHITECTURE_4RING.md`
- Network surfaces: `docs/MAP_SURFACES_NETWORK.md`
- Rendered Mermaid diagrams: `docs/diagrams/rendered/`

---

*French documentation: [docs/dev/fr/architecture.md](../fr/architecture.md)*
