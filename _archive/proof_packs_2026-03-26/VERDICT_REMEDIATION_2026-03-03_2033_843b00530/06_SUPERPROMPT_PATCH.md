# SUPERPROMPT PATCH

## Fichier modifié

- `.github/copilot-instructions.md`

## Renforcements ajoutés

- `Verdict compatibility (obligatoire)` dans les définitions:
	- `PASS` / `FAIL` / `BLOCKED` / `BLOCKED_APPROVAL` clarifiés.
- Gates globales:
	- vérification explicite CI sur `MAIN` et branche de travail.
	- `action_required` classé `BLOCKED_APPROVAL` sans contournement.
- Tests/E2E:
	- `PASS` E2E seulement avec runtime Tauri réel prouvé.
	- `BLOCKED_E2E_RUNTIME` si runtime indisponible avec script prêt.
- Auto-fix Prettier:
	- `--write` ciblé puis recheck ciblé + recheck global.

## But

- Rendre le superprompt auto-suffisant, auto-fix et proof-driven pour les cas CI/approval/E2E.
