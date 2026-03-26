# RUNTIME LOGS AND MEASUREMENTS
## Date: 2026-03-21

## Pre-patch runs (session 3, before this session)
| Run | Dir | Result | Duration | Key marker |
|---|---|---|---|---|
| 1 | `IPC_CHAT_PROOF_20260321T130046Z` | PASS | 52.4s | ASSISTANT_SNAPSHOT afterCount=1 |
| 2 | `IPC_CHAT_PROOF_RUN2_20260321T130239Z` | FAIL | 131s | kind=timeout, ipcReadyState=READY, assistantText='' |
| 3 | `IPC_CHAT_PROOF_RUN3_20260321T130453Z` | PASS | 35.1s | ASSISTANT_SNAPSHOT afterCount=1 |

## Run 2 failure log excerpt (key markers)
```
[G_RESPONSE_KIND] expected assistant, got timeout: {"assistantText":"","ipcReadyState":"READY","browserMode":true,"url":"tauri://localhost/titane"}
+ 'timeout'
```

## Post-patch runs (this session, with pre-warm)
| Run | Dir | Pre-warm elapsed | WDIO duration | Result | Key marker |
|---|---|---|---|---|---|
| 1 | `PREWARM_RUN1_20260321T132018Z` | 3s | 23.4s | PASS | ASSISTANT_SNAPSHOT afterCount=1 |
| 2 | `PREWARM_RUN2_20260321T132050Z` | 1s | 1m 22.8s | PASS | ASSISTANT_SNAPSHOT afterCount=1 |
| 3 | `PREWARM_RUN3_20260321T132219Z` | 2s | 42.3s | PASS | ASSISTANT_SNAPSHOT afterCount=1 |

## Pre-warm log excerpt (confirming model state)
```
[E2E_PREWARM] Starting model pre-warm | model=gemma2:2b | timeout=120s | url=http://127.0.0.1:11434
[E2E_PREWARM] PASS: model loaded and warm | elapsed=3s
[E2E_PREWARM] INFRA_READY: cold-start window cleared before WDIO launch
[E2E_PREWARM] END
```

## App source mode confirmation (all 6 runs)
```
[APP_SOURCE] sourceMode=embedded href=tauri://localhost/titane scriptCount=1
```
= Tauri embedded runtime confirmed, NOT dev-server

## X3 summary
- Pre-patch X3: 2/3 PASS
- Post-patch X3: 3/3 PASS ✅
- Delta: prewarm resolves cold-start timeout completely
