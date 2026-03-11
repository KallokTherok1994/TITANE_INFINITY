# 06 Expected Vs Observed UI Final

| Marqueur UI | Attendu | Observe runtime | Criticite | Statut | Preuve |
|-------------|---------|-----------------|-----------|--------|--------|
| chat-input | present + visible | true (run1, run2) | critical | PASS | artifacts/run1/v9-ui-runtime-run1.json, artifacts/run2/v9-ui-runtime-run2.json |
| chat-send | present + visible | true (run1, run2) | critical | PASS | artifacts/run1/v9-ui-runtime-run1.json, artifacts/run2/v9-ui-runtime-run2.json |
| chat-message-content | visible after send | true (run1, run2) | critical | PASS | artifacts/run1/v9-ui-runtime-run1.json, artifacts/run2/v9-ui-runtime-run2.json |
| absence onboarding | no onboarding screen in flow | onboardingVisible=false (run1, run2) | critical | PASS | artifacts/run1/v9-ui-runtime-run1.json, artifacts/run2/v9-ui-runtime-run2.json |
| absence IPC_FALLBACK | no fallback proof path | [V9_NO_IPC_FALLBACK] true (run1, run2) | critical | PASS | artifacts/run1/wdio.log, artifacts/run2/wdio.log |
| input interactif | input can be filled | inputFilled=true (run1, run2) | critical | PASS | artifacts/run1/v9-ui-runtime-run1.json, artifacts/run2/v9-ui-runtime-run2.json |
| envoi effectif | send triggers request | sendTriggered=true (run1, run2) | critical | PASS | artifacts/run1/v9-ui-runtime-run1.json, artifacts/run2/v9-ui-runtime-run2.json |
| reponse visible | assistant/user response visible | responseVisible=true (run1, run2) | critical | PASS | artifacts/run1/v9-ui-runtime-run1.json, artifacts/run2/v9-ui-runtime-run2.json |
| layout principal correct | no blocking layout break | rootChildCount=3 + coherent captures | degraded | PASS | artifacts/run1/screens/*.png, artifacts/run2/screens/*.png |
