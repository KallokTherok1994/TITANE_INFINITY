# 04_COMMANDS_USED

- `git status --porcelain && git rev-parse --short HEAD`
- `rg -n "[AUTOFIX_RETRY2_TESTS_X3][DONE]|[BUILD_REAL_X3][DONE]" proof_packs/SCELLEMENT_05_2026-03-03_1530_7eb4096fa/08_TESTS_X3.log proof_packs/SCELLEMENT_05_2026-03-03_1530_7eb4096fa/09_BUILD_X3.log`
- `rg -n "[BUILD_REAL 3/3][PASS]|[BUILD_REAL_X3][DONE]" proof_packs/SCELLEMENT_05_2026-03-03_1530_7eb4096fa/09_BUILD_X3.log`

## Politique

- Aucune réécriture destructive des packs précédents.
- Preuves append-only dans un nouveau pack.
