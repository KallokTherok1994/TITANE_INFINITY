# P1.16 — ROLLBACK

## 1. DELETED FILES
All deleted files were 0-byte or partial-write artifacts. **No recovery is possible or needed** — they contained no usable data.

## 2. .GITIGNORE
```bash
git restore .gitignore
```
This removes the `.claude/` and `PLANS/` entries.

## 3. DOCUMENTATION/ UNSTAGE
```bash
git rm -r --cached documentation/
```
This untracks the Docusaurus scaffold. The files remain on disk.

## 4. GOVERNANCE SPEC
```bash
rm docs/governance/POST_COMMIT_HYGIENE_BOUNDARY_SPEC.md
```

## 5. PROOF PACK + REGISTRY
```bash
rm -rf proof_packs/POST_COMMIT_HYGIENE_CLEAN_2026-03-29_1524_1396cb1b3/
head -n -1 registry/proofpack-index.jsonl > /tmp/r.jsonl && mv /tmp/r.jsonl registry/proofpack-index.jsonl
```

## 6. RUNTIME IMPACT
None — P1.16 is governance-only. No product code was changed.
