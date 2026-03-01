# 01_CURRENT_GATES_STATE

## Source figée (pack précédent)
- Source gates: `proof_packs/CLEANUP_AUDIT_2026-02-28_1703_21359b1eb/13_GATES_REPORT.md`
- Source verdict: `proof_packs/CLEANUP_AUDIT_2026-02-28_1703_21359b1eb/16_VERDICT_GLOBAL.md`
- Source cause racine: `proof_packs/CLEANUP_AUDIT_2026-02-28_1703_21359b1eb/ROOT_CAUSE.md`

## État actuel extrait
- PASS: `G_PROOF_PACK_COMPLETE`, `G_NO_SKIPS`, `G_TESTS_X3`, `G_BUILD_TAURI_X3`
- FAIL: `G_UI_NO_NETWORK_DIRECT`, `G_ONE_DOOR_NETWORK_BACKEND`, `G_SELF_AUDIT_CLEAN`
- BLOCKED: `G_RING_INTEGRITY`

## Raisons exactes extraites
1. `G_UI_NO_NETWORK_DIRECT` = FAIL
   - Motif: non-conformités réseau UI détectées.
2. `G_ONE_DOOR_NETWORK_BACKEND` = FAIL
   - Motif: porte réseau backend unique non prouvée.
3. `G_SELF_AUDIT_CLEAN` = FAIL
   - Motif: re-scan final signale encore des non-conformités réseau UI.
4. `G_RING_INTEGRITY` = BLOCKED
   - Motif: preuve partielle uniquement (pas de graphe exhaustif ring-to-ring).

## Cause racine consolidée
- Surface réseau frontend non univoquement gouvernée (coexistence d’appels réseau directs et d’une porte HTTP frontend), empêchant la fermeture propre des gates de conformité.
