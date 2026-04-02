# ROOT CAUSES

RC-01 (System crash):
- Symptome: ErrorBoundary `AdminSystemCenter`.
- Cause: payload diagnostics parfois enveloppe IPC; UI lisait `diagnostics.results.length` sur shape non normalisee.
- Preuve: erreur capturee `Cannot read properties of undefined (reading 'length')` dans `DiagnosticsTab`.
- Heal: unwrapping + validation shape dans `useSystemDiagnostics`.

RC-02 (Configuration degraded in web runtime):
- Symptome: `Erreur de chargement de la configuration`.
- Cause: variabilite de shape (brut vs enveloppe) + absence backend Tauri en mode web.
- Heal: `normalizeSnapshotResponse` pour accepter les 2 formes et audit E2E accepte mode degrade truthful.

RC-03 (Import-failure governance/prod-health):
- Non reproduit apres hardening lazy imports + E2E import-failure scan.
