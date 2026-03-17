# 02 — SCOPE

## Scope réel de cette session

- **Surface touchée:** `scripts/autoheal/autoheal_rules.jsonl` (1 fichier)
- **Champ modifié:** `id` à la ligne 406 (renommé de `AH-2026-03-17-SEAL-MASTER` → `AH-2026-03-17-IPC-INCOMPLETE-REPAIR`)
- **Entrée ajoutée:** `AH-2026-03-17-GOVERNANCE-DUPLICATE-ID-FIX` (autoheal Rule 10)
- **Ring impacté:** R3/R4 governance layer (scripts)
- **Aucune modification:** src/, src-tauri/, tests/, e2e/, docs/, registry/

## Ce qui n'a PAS été touché

- Code Rust src-tauri/ (aucune modification)
- Code TypeScript src/ (aucune modification)
- Tests unitaires JS (aucune modification)
- Tests E2E (aucune modification)
- Documentation docs/ (aucune modification)
- Registry events (aucune modification)
- Proof packs existants (append-only: nouveau pack créé)

## Surfaces auditées (read-only)

| Surface | Verdict |
|---------|---------|
| Governance gates (verify_instructions.sh) | PASS=20 FAIL=0 ✓ |
| Autoheal JSONL integrity | PASS entries=407 ✓ |
| TypeScript (tsc --noEmit) | EXIT=0 ✓ |
| Lint (eslint) | EXIT=0 ✓ |
| Unit tests (vitest) | 221 files, 3242 tests PASS ✓ |
| Rust (cargo check) | 0 errors 0 warnings ✓ |
| Tauri-only enforcement | 0 errors ✓ |
| Network one-door | PASS ✓ |
| Instruction layers | FAIL=0 ✓ |
| Doctrine duplication | FAIL=0 ✓ |
| Status vocabulary | FAIL=0 ✓ |
| Kernel budget | FAIL=0 ✓ |
| Local markers consistency | FAIL=0 ✓ |
| IPC surface completeness | 491 commands, 0 unregistered (from SEAL_MASTER) |
| Version alignment | package.json = tauri.conf = README = CHANGELOG = 28.0.0 ✓ |
