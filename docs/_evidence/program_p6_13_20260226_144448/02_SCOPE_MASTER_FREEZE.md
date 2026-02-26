# 02_SCOPE_MASTER_FREEZE.md

Date (UTC): 2026-02-26

## Scope maître
- Dossiers autorisés (programme P6→P13):
	- `docs/_evidence/program_p6_13_20260226_144448/**`
	- `docs/_evidence/p6_20260226_144448/**` à `docs/_evidence/p13_20260226_144448/**`
	- `reports/**` (preuves uniquement)
	- `src/**`, `src-tauri/**`, `scripts/**`, `.github/workflows/**` **uniquement** si une phase est ouverte et non bloquée.

## Surfaces interdites
- Aucun nouveau serveur HTTP interne/localhost.
- Aucun appel web direct frontend (`fetch/axios/URL externe`).
- Aucune fuite de secret dans UI/logs/trace.
- Aucun bypass robots/CAPTCHA/UA trompeur.
- Aucun silent fallback.

## Limites de dérive
- >15 fichiers touchés dans une phase: **BLOCKED** sans justification explicite.
- >2 rings touchés non planifiés: **BLOCKED**.
- Nouvelle dépendance: **BLOCKED** jusqu’à justification + rollback.

## Règles gouvernance
- Toute capability nouvelle: flag + défaut sûr + preuve.
- Toute intégration provider: règles retention/caching/rate-limit explicites.

## Verdict
- **BLOCKED** (précheck invariants non clean avant ouverture de phase)