# 16 Expected Vs Observed Final

| Marqueur UI | Attendu | Observe canonique | Criticite | Statut | Preuve |
|-------------|---------|-------------------|-----------|--------|--------|
| chat-input | visible and usable | true | critical | PASS | artifacts/run_visual1/v11-ui-runtime-run_visual1.json |
| chat-send | visible and usable | true | critical | PASS | artifacts/run_visual1/v11-ui-runtime-run_visual1.json |
| chat-message-content | visible after send | true | critical | PASS | artifacts/run_visual1/v11-ui-runtime-run_visual1.json |
| absence onboarding | no onboarding parasite | true | critical | PASS | artifacts/run_visual1/v11-ui-runtime-run_visual1.json |
| absence IPC_FALLBACK | no fallback path | true | critical | PASS | artifacts/run_visual1/wdio.log, artifacts/run_visual2/wdio.log |
| input interactif | message can be entered | true | critical | PASS | artifacts/run_visual1/v11-ui-runtime-run_visual1.json |
| envoi effectif | send trigger works | true | critical | PASS | artifacts/run_visual1/v11-ui-runtime-run_visual1.json |
| reponse visible | response appears | true | critical | PASS | artifacts/run_visual1/v11-ui-runtime-run_visual1.json |
| layout principal correct | usable surface | true | degraded | PASS | artifacts/run_visual1/screens/run_visual1-before-input.png |
| absence overlay bloquant | no critical block | true | critical | PASS | artifacts/run_visual1/v11-ui-runtime-run_visual1.json |
