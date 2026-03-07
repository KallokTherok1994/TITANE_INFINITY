# 17_ROLLBACK

A) EXEC_MODE: LOCAL
B) SCOPE_RING: rollback of campaign edits
C) RISK: P1
D) PLAN: provide minimal reversible commands per touched area
E) PROOFS: file-level rollback commands below
F) ROLLBACK: this file is the rollback source of truth

## Minimal Rollback Commands

### Revert E2E readiness fix only
```bash
git restore -- e2e/desktop/ui-driver.wdio.js
```

### Revert retry/critical-control authority assertions only
```bash
git restore -- e2e/desktop/ui-ultra-full.e2e.js e2e/desktop/ui-driver.wdio.js
```

### Revert AutoHeal additions only
```bash
git restore -- scripts/autoheal/autoheal_rules.jsonl
```

### Revert proof-pack narrative updates only
```bash
git restore -- \
	proof_packs/UI360_CHAT_TRUTH_2026-03-07_1150_757ae4d4c/00_EXEC_SUMMARY.md \
	proof_packs/UI360_CHAT_TRUTH_2026-03-07_1150_757ae4d4c/07_REQUIRED_SCOPE_MATRIX.md \
	proof_packs/UI360_CHAT_TRUTH_2026-03-07_1150_757ae4d4c/08_EXTENDED_SCOPE_MATRIX.md \
	proof_packs/UI360_CHAT_TRUTH_2026-03-07_1150_757ae4d4c/10_FINDINGS_CLASSIFIED.md \
	proof_packs/UI360_CHAT_TRUTH_2026-03-07_1150_757ae4d4c/11_FIX_LOOP.md \
	proof_packs/UI360_CHAT_TRUTH_2026-03-07_1150_757ae4d4c/12F_RETRY_CRITICAL_RUNTIME_VALIDATION.log \
	proof_packs/UI360_CHAT_TRUTH_2026-03-07_1150_757ae4d4c/13_COUNTER_AUDIT.md \
	proof_packs/UI360_CHAT_TRUTH_2026-03-07_1150_757ae4d4c/14_AUTOHEAL_UPDATES.md \
	proof_packs/UI360_CHAT_TRUTH_2026-03-07_1150_757ae4d4c/15_GATES_REPORT.md \
	proof_packs/UI360_CHAT_TRUTH_2026-03-07_1150_757ae4d4c/16_ARTIFACTS_INDEX.md \
	proof_packs/UI360_CHAT_TRUTH_2026-03-07_1150_757ae4d4c/17_ROLLBACK.md \
	proof_packs/UI360_CHAT_TRUTH_2026-03-07_1150_757ae4d4c/18_FINAL_VERDICT.md \
	proof_packs/UI360_CHAT_TRUTH_2026-03-07_1150_757ae4d4c/VERDICT.md \
	proof_packs/UI360_CHAT_TRUTH_2026-03-07_1150_757ae4d4c/ROLLBACK.md
```

### Full campaign rollback (pack + code touchpoints)
```bash
git restore -- \
	e2e/desktop/ui-driver.wdio.js \
	e2e/desktop/ui-ultra-full.e2e.js \
	scripts/autoheal/autoheal_rules.jsonl \
	proof_packs/UI360_CHAT_TRUTH_2026-03-07_1150_757ae4d4c
```
