# ROLLBACK — DOCS CANON FR/EN 2026-03-17

**Session:** DOCS_CANON_FR_EN_2026-03-17  
**Date:** 2026-03-17

---

## Rollback commands

### Full docs rollback (new canonical structure)

```bash
git restore -- docs/user/fr/ docs/user/en/
git restore -- docs/dev/fr/ docs/dev/en/
git restore -- docs/governance/fr/ docs/governance/en/
git restore -- docs/reference/fr/ docs/reference/en/
git restore -- docs/INDEX_FR.md docs/INDEX_EN.md
```

### Rollback audit artifacts

```bash
git restore -- GLOSSARY_FR_EN_LOCK.md COMMANDS_INVENTORY.md DOC_AUDIT.md LINKS_VALIDATION.md
```

### Rollback legacy banners

```bash
git restore -- docs/user/README.md docs/user/installation.md docs/user/quickstart.md
git restore -- docs/GETTING_STARTED.md
```

### Rollback proof pack (this session)

```bash
git rm -r proof_packs/DOCS_CANON_FR_EN_2026-03-17/
```

---

## What is NOT rolled back by the above

- `README.md` (root) — was not modified in this session
- `CHANGELOG.md` — was not modified in this session
- `docs/README.md` — was not modified in this session
- All pre-existing docs — were not modified (except legacy banners)

---

## Verification after rollback

```bash
bash scripts/verify_instructions.sh
bash scripts/autoheal/detect_recurrence.sh
```

Expected: PASS=20 FAIL=0 and G_AH_RECURRENCE_GUARD_PASS (docs-only changes do not affect these gates)
