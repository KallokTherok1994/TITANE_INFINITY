# ROLLBACK — SECOND AUDIT TITANE_INFINITY

**Date:** 2026-03-14

---

## Changes Applied in Second Audit

### 1. Gate fixes (QW-01): rg → grep in G1, G2, G3, rc-network-surface
```bash
git restore -- scripts/gates/g1-no-offline-without-reason.sh
git restore -- scripts/gates/g2-no-force-local-in-prod.sh
git restore -- scripts/gates/g3-legacy-divergence.sh
git restore -- scripts/gates/rc-network-surface-gate.sh
```

### 2. Port mismatch fix (QW-02): tauri.base.json
```bash
git restore -- src-tauri/tauri.base.json
```

### 3. AutoHeal entries
```bash
git restore -- scripts/autoheal/autoheal_rules.jsonl
```

### 4. Proof pack (docs only, safe to keep)
```bash
git restore -- proof_packs/AUDIT_SECOND_2026-03-14/
```

---

## Full rollback (all changes)
```bash
git restore -- scripts/gates/g1-no-offline-without-reason.sh \
               scripts/gates/g2-no-force-local-in-prod.sh \
               scripts/gates/g3-legacy-divergence.sh \
               scripts/gates/rc-network-surface-gate.sh \
               src-tauri/tauri.base.json \
               scripts/autoheal/autoheal_rules.jsonl \
               proof_packs/AUDIT_SECOND_2026-03-14/
```
