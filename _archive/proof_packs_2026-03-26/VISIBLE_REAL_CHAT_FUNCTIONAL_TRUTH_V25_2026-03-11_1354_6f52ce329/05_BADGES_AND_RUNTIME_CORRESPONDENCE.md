# V25 Badges And Runtime Correspondence

Visible badges text (exact values captured):
- `offline`
- `OFFLINE`
- `local`
- `FALLBACK_OFFLINE`
- `offline`
- `simulated`

Health badge:
- `Sante: Healthy`

Correspondence map:
- Problem: degraded/offline status
- Visible symptom: offline/fallback/simulated badges + deterministic offline response sentence
- Runtime proof: same markers in metrics/log (`FALLBACK_OFFLINE`, `Mode OFFLINE_SIM actif...`)
- Verdict: `MAPPED`, but indicates degraded path, not healthy fullstack remote chain

Gap:
- `runtimeAttrs` on latest assistant message were null in this run, so backend-level structured fields are not fully exposed on that message container.

## Postbuild correspondence closure

On `run_chat_postbuild`, `runtimeAttrs` are populated and align with visible badges:

- `providerMode=OFFLINE`
- `providerReason=FALLBACK_OFFLINE`
- `providerUsed=offline`
- `providerClass=local`
- `providerNetworkUsed=false`

This confirms UI badge text and runtime metadata are coherent for the degraded path.
