# TITANE∞ — Observability and Debug (EN)

**Version:** 28.0.0  
**Status:** QUALIFIED  
**Date:** 2026-03-17

> See also: `docs/RUNTIME_OBSERVABILITY.md`, `docs/DEVTOOLS_OVERVIEW.md`

---

## Application logs

### In development mode

```bash
# Tauri logs appear in the terminal where pnpm run dev is launched
pnpm run dev 2>&1 | tee /tmp/titane-dev.log
```

### In the interface (DevTools)

The built-in DevTools panel gives access to:
- Real-time logs (Watchdog)
- System metrics (Helios)
- Dependency graph (Nexus)
- Performance dashboard (Monitoring)

---

## AutoHeal registry

The AutoHeal registry is the memory of applied fixes:

```bash
# Read the latest entries
tail -5 scripts/autoheal/autoheal_rules.jsonl | python3 -c "
import sys, json
for line in sys.stdin:
    e = json.loads(line)
    print(e['id'], '-', e.get('symptom', 'N/A')[:60])
"

# Check for recurrences
bash scripts/autoheal/detect_recurrence.sh
```

---

## Proof packs

Proof packs are stored in `proof_packs/`:

```bash
# See latest proof packs
ls -lt proof_packs/ | head -10

# Read a proof pack verdict
cat proof_packs/[SESSION_NAME]/VERDICT.md
```

---

## Event registry

```bash
# See recent events
cat registry/ui-events.jsonl | tail -20 | python3 -m json.tool
```

---

## Quick diagnostics

```bash
# Check gates
bash scripts/verify_instructions.sh
bash scripts/autoheal/detect_recurrence.sh

# Check IPC surface
pnpm run guard:ipc-contract

# Check Tauri compliance
pnpm run verify:tauri-only
pnpm run verify:tauri-configs

# Stop-the-line status
pnpm run stopline:latest
```

---

## Investigating a CI failure

```bash
# 1. Read CI logs via GitHub Actions (repo Actions page)
# 2. Identify the failing step
# 3. Reproduce locally:

pnpm run lint
pnpm run format:check
pnpm run check
pnpm run test
```

---

## Automated reports

Run reports are in `reports/`:

```bash
ls reports/ | head -20
```

---

*French documentation: [docs/dev/fr/observabilite-et-debug.md](../fr/observabilite-et-debug.md)*
