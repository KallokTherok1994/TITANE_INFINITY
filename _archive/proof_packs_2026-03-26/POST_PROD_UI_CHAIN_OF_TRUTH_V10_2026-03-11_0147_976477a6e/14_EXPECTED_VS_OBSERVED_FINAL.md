# 14 Expected Vs Observed Final

| Marqueur UI | Attendu | Observe canonique | Criticite | Statut | Preuve |
|-------------|---------|-------------------|-----------|--------|--------|
| chat-input | present + interactive | true | critical | PASS | V11 run_visual1 JSON |
| chat-send | present + interactive | true | critical | PASS | V11 run_visual1 JSON |
| chat-message-content | visible after send | true | critical | PASS | V11 run_visual1 JSON |
| absence onboarding | no onboarding parasite | true | critical | PASS | V11 run_visual1/2 JSON |
| absence IPC_FALLBACK | no fallback mode | true | critical | PASS | V11 run_visual1/2 logs |
| input interactif | message can be entered | true | critical | PASS | V11 run_visual1 JSON |
| envoi effectif | send action triggers | true | critical | PASS | V11 run_visual1 JSON |
| reponse visible | visible response update | true | critical | PASS | V11 run_visual1 JSON |
| layout principal correct | usable main layout | true | degraded | PASS | V11 screenshots |
