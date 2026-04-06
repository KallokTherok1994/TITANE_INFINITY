# P3-5 UI META TAGS — PROOF PACK INDEX

## Files

- 00_SCOPE.md
- 01_FILES_CHANGED.txt
- 02_COMMANDS_RUN.txt
- 03_META_UI_BEHAVIOR.md
- 04_OFFLINE_SIM_SMOKE.md
- 05_GUARD_RECHECK.json
- FINAL_VERDICT.md
- ROLLBACK.md

## Stop-the-line resolution

- Generator: git diff --name-status BASE..HEAD | awk '{print  "\t" }' | sort -k2,2
- BASE_COMMIT: 2848224b0e2f339525d9ccd4b0476acab8d40dde
- Determinism: regenerated twice -> DETERMINISTIC_OK
