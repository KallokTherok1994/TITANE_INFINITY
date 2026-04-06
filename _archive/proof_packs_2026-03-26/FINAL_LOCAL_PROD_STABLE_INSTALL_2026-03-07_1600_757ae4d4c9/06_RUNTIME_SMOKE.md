# 06_RUNTIME_SMOKE

A) EXEC_MODE
- `LOCAL`

B) SCOPE_RING
- Smoke runtime local minimal sur artefact actif.

C) RISK
- `P0`

D) PLAN (<=7 étapes)
1. Lancer l’artefact actif localement avec timeout.
2. Capturer le log brut.
3. Vérifier la présence du marker canonique.

E) PROOFS
- Log smoke: `proof_packs/FINAL_LOCAL_PROD_STABLE_INSTALL_2026-03-07_1600_757ae4d4c9/raw/06_runtime_smoke.log`
- Résumé smoke: `proof_packs/FINAL_LOCAL_PROD_STABLE_INSTALL_2026-03-07_1600_757ae4d4c9/raw/06_runtime_smoke_summary.txt`
- Marker `BOOT:READY` détecté dans le log.

F) ROLLBACK
- Si régression runtime, appliquer rollback local défini en section 08.

Résultat:
- `LOCAL_SMOKE = PASS`
- `BOOT_READY_MARKER = YES`
