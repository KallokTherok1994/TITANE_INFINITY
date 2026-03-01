# 04_FILES_TOUCHED

## Fichiers code modifiés (RC)

1. `src/services/ai/transports/ollamaTransport.ts`
	- Nature: suppression du mode HTTP runtime, IPC-only.
	- Ring impacté: Ring 3 (Services)
	- Statut: `QUALIFIED`

2. `src/services/ai/providers/glm46v.ts`
	- Nature: retrait des fetch directs, bascule health/generate vers IPC.
	- Ring impacté: Ring 3 (Services)
	- Statut: `QUALIFIED`

3. `src/services/tts/parlerTTSBridge.ts`
	- Nature: retrait fetch directs, erreur explicite gouvernée en mode interdit.
	- Ring impacté: Ring 3 (Services)
	- Statut: `QUALIFIED`

4. `src/core/http/httpClient.ts`
	- Nature: blocage explicite HTTP frontend direct hors mock test.
	- Ring impacté: Ring 3 (Services, boundary UI réseau)
	- Statut: `QUALIFIED`

5. `scripts/check-allowlist-alignment.mjs`
	- Nature: correction source allowlist active + fallback auto pour `used_wrappers`.
	- Ring impacté: Gouvernance scripts (preuves/contrôles)
	- Statut: `QUALIFIED`

6. `.github/copilot-xs/scripts/security-scan.js`
	- Nature: scan sécurité scope `prod` par défaut (option `full` via env).
	- Ring impacté: Gouvernance sécurité CI/scripts
	- Statut: `QUALIFIED`

## Fichiers de preuve/rapport mis à jour
- `docs/_evidence/g8-provider-api-only-report.md`
- `proof_packs/RC_SEAL_2026-02-28_1938_21359b1eb/*`
