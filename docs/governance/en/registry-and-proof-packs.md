# TITANE∞ — Registry and Proof Packs (EN)

**Version:** 28.0.0  
**Status:** QUALIFIED  
**Date:** 2026-03-17

---

## Event registry

**Directory:** `registry/`

The event registry records important application events.

```bash
# Log an event
pnpm run registry:log

# Create snapshot
pnpm run registry:snapshot

# View dashboard
pnpm run registry:dashboard
```

**Append-only status:** PARTIAL — append-only policy is declared but not fully enforced by tooling.

---

## AutoHeal registry

**File:** `scripts/autoheal/autoheal_rules.jsonl`

JSON lines registry of all applied fixes. Append-only by convention.

**Entry format:**
```json
{
  "id": "AH-YYYY-MM-DD-[DESCRIPTION]",
  "date": "YYYY-MM-DD",
  "scope": "impacted files",
  "symptom": "symptom description",
  "root_cause": "identified root cause",
  "fix": "fix description",
  "prevention_test": "command containing detect_recurrence",
  "commands": ["list of verification commands"],
  "files_changed": ["list of modified files"],
  "rollback": "exact git restore command"
}
```

**Critical requirement:** `prevention_test` must contain the substring `detect_recurrence`.

---

## Proof Packs

**Directory:** `proof_packs/`

A proof pack is a directory of evidence for a governed session.

### Minimum structure

```
proof_packs/[SESSION_NAME]_[DATE]/
├── VERDICT.md      # Final session verdict
└── ROLLBACK.md     # Exact rollback commands
```

### Full structure (P0)

```
proof_packs/[SESSION_NAME]_[DATE]/
├── VERDICT.md
├── ROLLBACK.md
├── GATE_REPORT.md      # Gate results
├── [artifacts...]      # Logs, exports, metrics
```

### When to create a proof pack

| Situation | Proof pack required |
|---|---|
| P0 fix (critical bug) | YES |
| IPC surface modification | YES |
| Tauri capabilities modification | YES |
| Release or pre-release | YES |
| Major governance session | YES |
| Minor P2 fix | NO (AutoHeal entry sufficient) |
| Docs-only modification | NO (except DOCS canon session) |

---

## Proof pack verification

```bash
# List latest proof packs
ls -lt proof_packs/ | head -10

# Read verdict
cat proof_packs/[SESSION]/VERDICT.md

# Verify registry integrity
pnpm run verify:registry:integrity
```

---

*French documentation: [docs/governance/fr/registry-et-proof-packs.md](../fr/registry-et-proof-packs.md)*
