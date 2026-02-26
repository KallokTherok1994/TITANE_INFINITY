# 10_SCAN_CONTRACT_REQUALIFICATION.md

Date (UTC): 2026-02-26

## Objet
- Documenter la nécessité de requalifier le contrat de scan précheck pour éviter les faux positifs structurels.

## Constat (preuves)
- Scan brut imposé:
  - `frontend open-web` = `159`
  - `backend http clients` = `256`
  - `secret markers` = `157`
- Diagnostic de ventilation:
  - Fichier: `reports/program_p6_13_raw_scan_diagnostics_20260226T145900Z.log`
  - Frontend: `66` occurrences en tests/snapshots/stories/docs, `93` hors ces buckets.
  - Backend: `51` occurrences dans `Cargo.lock/tauri.conf.json/gen/schemas` (non runtime), `197` dans `src-tauri/src` dont un volume important de collisions lexicales (`hyper_*` symbol names).
  - Secret markers: collisions lexicales (`MAX_TOKENS`, noms de clés connus, commentaires/tests).

## Remédiation déjà prouvée x3
- Fichier: `reports/program_p6_13_invariant_clean_executable_x3_20260226T145443Z.log`
- Résultats x3:
  - `FRONT_EXEC_WEB_CALLS=0`
  - `BACKEND_HTTP_CLIENT_CALLS_GOV_SCOPE=0`
  - `HARDCODED_SECRET_ASSIGNMENTS=0`

## Contrat canonique proposé (gouverné)
1. Frontend réseau exécutable (Ring 4 runtime):
   - `rg -n "fetch\(|axios\(|XMLHttpRequest|new\s+WebSocket\(" -S src --glob '!**/__tests__/**' --glob '!**/__snapshots__/**' --glob '!**/*.stories.*' --glob '!**/*.mdx' --glob '!**/stories/**'`
2. Backend HTTP runtime gouverné (Ring 3/4 runtime):
   - `rg -n "reqwest::|ureq::|hyper::" -S src-tauri/src/conversation_engine src-tauri/src/services src-tauri/src/engines`
3. Secrets hardcodés (assignations effectives):
   - `rg -n "(API_KEY|SECRET|TOKEN|BRAVE)\s*[:=]\s*['\"]?[A-Za-z0-9_\-]{16,}" -S src src-tauri/src --glob '!**/__tests__/**' --glob '!**/__snapshots__/**'`

## Décision requise
- Tant que ce contrat n’est pas approuvé comme gate canonique, le programme P6→P13 reste **BLOCKED** par constitution (scan brut non clean).

## Métadonnées de changement
- Ring impacté: **Governance/Repo hygiene**
- Statut: **QUALIFIED**
