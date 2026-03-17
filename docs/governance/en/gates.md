# TITANE∞ — Gates (EN)

**Version:** 28.0.0  
**Status:** PROVEN  
**Date:** 2026-03-17

> See also: `docs/MAP_GATES.md`, `docs/MAP_TESTS_GATES.md`, `scripts/gates/`

---

## Mandatory gates

These gates must pass after any code modification:

```bash
bash scripts/verify_instructions.sh          # PASS=20 FAIL=0 expected
bash scripts/autoheal/detect_recurrence.sh   # G_AH_RECURRENCE_GUARD_PASS expected
```

---

## Gate catalog

### Gate G1 — No offline without reason

```bash
bash scripts/gates/g1-no-offline-without-reason.sh
```

**Purpose:** Verify no unjustified offline behavior is introduced.  
**Criterion:** Exit 0  
**Note:** Uses `grep -rn` (ripgrep with grep fallback — fixed AH-2026-03-14)

---

### Gate G2 — IPC conformance

```bash
pnpm run guard:ipc-contract
bash scripts/guard/guard-ipc-only-tests.sh
```

**Purpose:** Verify tests do not directly access network resources.  
**Criterion:** Exit 0

---

### Gate G3 — Legacy divergence

```bash
bash scripts/gates/g3-legacy-divergence.sh
```

**Purpose:** Detect divergences between codebase and legacy docs.  
**Criterion:** Exit 0

---

### Gate rc-network-surface

```bash
bash scripts/gates/rc-network-surface-gate.sh
```

**Purpose:** Verify the controlled network surface.  
**Criterion:** Exit 0

---

### Gate verify_instructions (global)

```bash
bash scripts/verify_instructions.sh
```

**Purpose:** Verify 20 Copilot instruction rules.  
**Criterion:** PASS=20, FAIL=0  
**Source:** `scripts/verify_instructions.sh`

---

### Gate detect_recurrence (AutoHeal)

```bash
bash scripts/autoheal/detect_recurrence.sh
```

**Purpose:** Verify no AutoHeal rule has been silently re-violated.  
**Criterion:** `G_AH_RECURRENCE_GUARD_PASS`  
**Requirement:** Last registry entry must have `prevention_test` containing `detect_recurrence`

---

### Gate tauri-only

```bash
pnpm run verify:tauri-only
bash scripts/verify/enforce-tauri-only.sh
```

**Purpose:** Verify no web server or non-Tauri runtime is introduced.  
**Criterion:** Exit 0

---

### Gate online-first

```bash
pnpm run verify:online-first
bash scripts/verify/enforce-online-first.sh
```

**Purpose:** Verify compliance with online-first doctrine.  
**Criterion:** Exit 0

---

### Gate tauri-configs

```bash
pnpm run verify:tauri-configs
bash scripts/verify/validate-tauri-configs.sh
```

**Purpose:** Verify Tauri configuration file consistency.  
**Criterion:** Exit 0

---

### Gate prod-boot

```bash
pnpm run gate:prod-boot
node scripts/gates/vite-base-relative-gate.cjs
```

**Purpose:** Verify the prod build can boot.  
**Criterion:** Exit 0

---

## Stop-the-line policy

When a gate fails:

1. **STOP** — do not continue
2. **NAME** the failure clearly (FAIL + cause)
3. **CLASSIFY**: FAIL, BLOCKED, or BLOCKED_APPROVAL
4. **FIX** — minimal change only
5. **CAPTURE** in AutoHeal
6. **RE-RUN** gates
7. **RECORD** in proof pack if P0

**No exceptions. No narrative can bypass a gate FAIL.**

---

*French documentation: [docs/governance/fr/gates.md](../fr/gates.md)*
