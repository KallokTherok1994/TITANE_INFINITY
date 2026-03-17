# TITANE∞ — Governance (EN)

**Version:** 28.0.0  
**Status:** QUALIFIED  
**Date:** 2026-03-17

> Defines the rules, gates, proof disciplines, and documentation standards governing TITANE∞.

---

## Navigation

| Document | Description |
|---|---|
| [Gates](./gates.md) | Verification gates and stop-the-line |
| [Policies](./policies.md) | Development and operational policies |
| [Versioning, Release and Canons](./versioning-release-and-canons.md) | Version authority and release process |
| [Registry and Proof Packs](./registry-and-proof-packs.md) | Evidence and registry management |
| [Rollback](./rollback.md) | Rollback procedures |

---

## Core principles

### Online-first governed (PROVEN — defined in kernel instructions)

TITANE∞ is an **online-first governed** application:
- Network connectivity is assumed and required for primary operations
- A mandatory local fallback must be available (PARTIAL)
- The "local-first" label in some files is a **compatibility marker only**

### Tauri-only runtime (PROVEN)

- The application runs exclusively as a Tauri desktop application
- No exposed web server
- All I/O goes through Tauri IPC with strict allowlist

### IPC contract (PROVEN)

- Payload: `{ ok, content, error }`
- Zero silent failure
- All errors reported to the user

### Stop-the-line (PROVEN — by gate)

- Any gate FAIL triggers a mandatory stop
- Any invariant violation triggers a stop
- Any unresolved contradiction triggers BLOCKED

---

## Document authority hierarchy

```
1. Kernel file (.github/copilot-instructions.md)
2. Path-specific instructions (.github/instructions/)
3. Selected agents (.github/agents/)
4. Prompt files (.github/prompts/)
5. Task context
6. Runtime truth / validators
```

---

*French documentation: [docs/governance/fr/README.md](../fr/README.md)*
