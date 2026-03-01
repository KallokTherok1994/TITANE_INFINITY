# 05_NON_COMPLIANCE_REPORT

## Méthode
Classification C (Non conforme) et D (Risque) avec preuves grep + fichiers.

## C — Non conformités invariants

### C1. Réseau direct côté UI détecté (invariant violé)
Preuves:
- `src/services/tts/parlerTTSBridge.ts` → `globalThis['fetch'](...)` (plusieurs occurrences).
- `src/services/ai/transports/ollamaTransport.ts` → `globalThis['fetch'](...)`.
- `src/services/ai/providers/glm46v.ts` → `globalThis['fetch'](...)`.
- `src/core/http/httpClient.ts` → import `@tauri-apps/plugin-http` (porte réseau front).
- `src/config/offline-first.ts` → `httpClient.head('https://www.google.com/favicon.ico')`.

Conclusion: `G_UI_NO_NETWORK_DIRECT=FAIL`.

### C2. Porte réseau backend unique non prouvée
Preuves:
- Surface commandes Tauri très large (`tauri::command` count élevé).
- Plusieurs handlers/points `generate_handler!` distribués.
- Usage réseau backend (`reqwest`) présent.

Conclusion: unicité “one-door network backend” non démontrée strictement => `G_ONE_DOOR_NETWORK_BACKEND=FAIL`.

## D — Risques actifs
1. Build Tauri non reproductible x3 sur ce cycle.
2. Forte volumétrie scripts/docs legacy augmentant risque d’erreur opérateur.
3. Mélange d’outillage E2E (Playwright/WebdriverIO) à gouverner explicitement.

## E — UNKNOWN (bloquant potentiel)
- Intégrité ring exhaustive (sans graphe d’import complet automatisé) partiellement prouvée seulement par scans indicateurs.

## Preuves
- `proof_logs/phase3_network_evidence.log`
- `proof_logs/phase3_metrics.log`
- `proof_logs/phase1_gates_scans.log`
- `12_BUILD_RUNS_X3.log`
