# ROLLBACK — REPO OFFICIALIZATION v28.5.0

Session: REPO_OFFICIALIZATION_28_5_0
Date: 2026-03-21

---

## Full Session Rollback

```bash
git revert HEAD
```

Or targeted file restore:

```bash
git restore -- \
  deployment/latest/MANIFEST.json \
  deployment/latest/SHA256SUMS.txt \
  deployment/latest/CHECKSUMS.sha256 \
  VERSION_AUTHORITY_MAP.md \
  RELEASE_SURFACE_INVENTORY.md \
  ARCHIVE_DECISIONS.md
```

And remove proof pack:

```bash
rm -rf proof_packs/REPO_OFFICIALIZATION_28_5_0_2026-03-21/
```

And remove autoheal entry (last line of autoheal_rules.jsonl):

```bash
# Remove the last line of the autoheal registry
head -n -1 scripts/autoheal/autoheal_rules.jsonl > /tmp/ah_tmp.jsonl && mv /tmp/ah_tmp.jsonl scripts/autoheal/autoheal_rules.jsonl
```

---

## Effect of Rollback

- `deployment/latest/MANIFEST.json` returns to version `28.0.0`
- `deployment/latest/SHA256SUMS.txt` returns to v28.0.0 artifact listing
- `deployment/latest/CHECKSUMS.sha256` returns to v28.0.0 artifact listing
- Governance docs removed
- Proof pack removed
- AutoHeal entry removed
- Repository returns to pre-officialization state (still functional, CONTRADICTION_D re-emerges)
