# 15 ROLLBACK

## Checksum file
git restore -- RELEASE_ARTIFACTS_CHECKSUMS_28.5.0.txt

## Proof pack
git restore -- proof_packs/BUILD_UNBLOCK_TO_RELEASE_2026-03-20_2345_a30fe56ef/

## Artifacts (untracked — no git rollback needed; target/ not in .gitignore action needed)
# Artifacts are in src-tauri/target/ which is .gitignored. No git action needed.

## Full session rollback
git restore -- RELEASE_ARTIFACTS_CHECKSUMS_28.5.0.txt scripts/autoheal/autoheal_rules.jsonl
