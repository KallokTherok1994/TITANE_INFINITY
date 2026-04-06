# 05_REQUESTED_USED_SHOWN_TRUTH

## Requested -> Used -> Shown chain

## Requested
- Provider request model: `OLLAMA_CONFIG.model` dans `src/services/ai/providers/ollama.ts`.

## Used
- Modele effectivement retourne par backend: `data.model` (fallback vers config seulement si absent).
- Capture fallback: `fallbackUsed = actualModel !== OLLAMA_CONFIG.model`.

## Shown
- Metadata exposee vers UI: `modelUsed`, `modelRequested`, `fallbackUsed`.
- UI lit et expose ces champs via `src/ui/pages/Chat.tsx`.

## Runtime probe
- Probe modele absent (fallback honesty contract): `raw/fallback_probe_missing_model.txt`
  - `HTTP_CODE=404`
  - message explicite `model ... not found`

## Verdict lock A
- `REQUESTED_USED_SHOWN_TRUTH`: `PASS`
- Evidence: code path + fallback signal explicite (pas de silence, pas de fake success).
