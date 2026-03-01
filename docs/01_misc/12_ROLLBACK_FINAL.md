# 12_ROLLBACK_FINAL

## Rollback non destructif (global RC)

### A. Revenir uniquement sur les corrections code RC
```bash
git restore -- \
	src/core/http/httpClient.ts \
	src/services/ai/providers/glm46v.ts \
	src/services/ai/transports/ollamaTransport.ts \
	src/services/tts/parlerTTSBridge.ts
```

### B. Revenir uniquement sur le pack RC
```bash
git restore -- proof_packs/RC_SEAL_2026-02-28_1938_21359b1eb
```

### C. Revenir sur preuves docs associées
```bash
git restore -- docs/_evidence/g8-provider-api-only-report.md
```

## Vérification post-rollback
```bash
git status --porcelain=v1
```
