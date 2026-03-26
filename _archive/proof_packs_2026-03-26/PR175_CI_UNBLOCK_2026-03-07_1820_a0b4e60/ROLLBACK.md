# PLAN DE ROLLBACK — PR175 CI UNBLOCK

**Session:** PR175_CI_UNBLOCK_2026-03-07_1820_a0b4e60

## Rollback complet

```bash
git restore -- e2e/desktop/ui-driver.wdio.js
git restore -- .github/workflows/rust.yml
git restore -- scripts/autoheal/duplicate_id_allowlist.txt
head -n -2 scripts/autoheal/autoheal_rules.jsonl > /tmp/ah_back.jsonl
mv /tmp/ah_back.jsonl scripts/autoheal/autoheal_rules.jsonl
git restore -- runtime/registry/
```

## Impact rollback

- Retour aux 2 échecs CI (Prettier + Rust)
- AutoHeal revient à 128 entries (sans AH-0089 et AH-0090)
- Allowlist revient à 4 doublons (sans les 25 ajoutés)
