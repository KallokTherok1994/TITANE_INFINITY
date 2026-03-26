# Extraits de logs

## UI / code-path
```text
src/services/conversationEngine.ts
const provider = options?.providerPreference ?? 'auto';
```

```text
src/hooks/useConversationEngine.ts
Provider demandé: ${requestedProvider}
Cause runtime: ${response.meta?.reason_code ?? 'UNKNOWN'}
Je n'ai pas pu joindre le provider demandé pour cette requête. La sélection UI est conservée telle quelle pour éviter un fallback silencieux.
```

## Runtime local
```text
curl -sS http://127.0.0.1:11434/api/version || true
{"version":"0.18.0"}
```

## Tests
```text
Test Files  1 passed (1)
Tests  5 passed (5)
```

## Preuve desktop UI réelle
```text
[PROOF] scenario=S1 run=run1
[PROVIDER_USED_DOM] Ollama (OMEGA+Singularity)
[UI_PANEL_ALIGNMENT] {"panelNetwork":"false","panelProvider":"Ollama (OMEGA+Singularity)","domProvider":"Ollama (OMEGA+Singularity)","domNetwork":"false","domReason":"OK","panelReason":"OK"}
[ASSISTANT_SNAPSHOT] beforeCount=0 afterCount=1
[E2E_CHAT_PROOF] STATUS=0
```

## Stabilité x3
```text
reports/ui_research_e2e/20260324T232403Z/wdio-online-chat-proof-ui.log -> STATUS=0
reports/ui_research_e2e/20260324T233120Z/wdio-online-chat-proof-ui.log -> STATUS=0
reports/ui_research_e2e/20260324T233223Z/wdio-online-chat-proof-ui.log -> STATUS=0
sendTraceState=RESPONDED
providerUsed=Ollama (OMEGA+Singularity)
providerMode=LOCAL
providerReason=OK
networkUsed=false
```

## Preuve mémoire desktop réelle
```text
reports/ui_research_e2e/20260325T001457Z/wdio-online-chat-proof-ui.log
[MEMORY_TURN_1] {"providerUsed":"OLLAMA (OMEGA+SINGULARITY)","providerMode":"LOCAL","providerReason":"OK","assistantText":"OK. \n."}
[MEMORY_TURN_2] {"providerUsed":"OLLAMA (OMEGA+SINGULARITY)","providerMode":"LOCAL","providerReason":"OK","assistantText":"OK. \n."}
[MEMORY_TURN_3] {"providerUsed":"OLLAMA (OMEGA+SINGULARITY)","providerMode":"LOCAL","providerReason":"OK","assistantText":"Lisboa \n."}
[MEMORY_TURN_4] {"providerUsed":"OLLAMA (OMEGA+SINGULARITY)","providerMode":"LOCAL","providerReason":"OK","assistantText":"OK,  code=ORION-482-LICHEN, nom=Alice, couleur=bleu azur. \n."}
[MEMORY_PROOF_VERDICT] PASS_MEMORY_REAL
[MEMORY_PROOF_RESPONSE] OK,  code=ORION-482-LICHEN, nom=Alice, couleur=bleu azur.
[FALSE_RECALL_VERDICT] NO_FALSE_MEMORY_BUT_UNPROVEN
```

## Stabilité mémoire
```text
reports/ui_research_e2e/20260325T001457Z/wdio-online-chat-proof-ui.log -> PASS_MEMORY_REAL
reports/ui_research_e2e/20260325T001637Z/wdio-online-chat-proof-ui.log -> PASS_MEMORY_REAL
reports/ui_research_e2e/20260325T001907Z/wdio-online-chat-proof-ui.log -> PASS_MEMORY_REAL
sendTraceMeta=provider=Ollama (OMEGA+Singularity);reason=OK
sendTraceState=RESPONDED
providerUsed=OLLAMA (OMEGA+SINGULARITY)
providerMode=LOCAL
providerReason=OK
networkUsed=false
assistantText=INCONNU
```

## Revalidation mémoire finale
```text
reports/ui_research_e2e/20260325T022243Z/wdio-online-chat-proof-ui.log
[MEMORY_PROOF_VERDICT] PASS_MEMORY_REAL
[FALSE_RECALL_VERDICT] NO_FALSE_MEMORY_BUT_UNPROVEN
[FALSE_RECALL_RESPONSE] INCONNU
[FALSE_RECALL_RUNTIME] {"providerUsed":"OLLAMA (OMEGA+SINGULARITY)","providerMode":"LOCAL","providerReason":"OK","networkUsed":"false","memoryState":"PRESENT","sendTraceState":"RESPONDED"}

reports/ui_research_e2e/20260325T023914Z/wdio-online-chat-proof-ui.log
[MEMORY_PROOF_VERDICT] PASS_MEMORY_REAL
[FALSE_RECALL_VERDICT] NO_FALSE_MEMORY_BUT_UNPROVEN
[FALSE_RECALL_RESPONSE] INCONNU
[FALSE_RECALL_RUNTIME] {"providerUsed":"OLLAMA (OMEGA+SINGULARITY)","providerMode":"LOCAL","providerReason":"OK","networkUsed":"false","memoryState":"PRESENT","sendTraceState":"RESPONDED"}
```

## Revalidation page mémoire persistante
```text
reports/ui_research_e2e/20260325T165333Z/wdio-online-chat-proof-ui.log
[MEMORY_PROOF_VERDICT] PASS_MEMORY_REAL
[MEMORY_PAGE_EVIDENCE bootstrap] {"memorySurfaceState":"loading","dashboardEntryCount":0,"searchEntryCount":0,"bodyHasCode":false,"bodyHasName":false,"bodyHasColor":false}
[MEMORY_PAGE_EVIDENCE final] {"memorySurfaceState":"ready","dashboardEntryCount":18,"searchEntryCount":18,"bodyHasCode":true,"bodyHasName":true,"bodyHasColor":true}
[FALSE_RECALL_RESPONSE] INCONNU
[E2E_CHAT_PROOF] STATUS=0
```

## Bruit de harnais non-produit
```text
run parallèle rejeté par WDIO:
WebDriverError: Maximum number of active sessions when running "http://127.0.0.1:4444/session" with method "POST"
classification: bruit harnais / non régression produit
```
