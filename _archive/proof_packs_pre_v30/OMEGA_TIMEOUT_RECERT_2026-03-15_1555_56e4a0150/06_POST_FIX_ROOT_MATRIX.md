# POST-FIX ROOT MATRIX — OMEGA TIMEOUT RECERT

| hypothesis | status | proof | layer | next_action |
|---|---|---|---|---|
| H1. Gel venait majoritairement du 8s timeout | **PASS** | min(8000,8000,60000)=8000ms; llama3:latest takes 40s → ALWAYS timed out; post-fix: completes | TS aiTimeouts.config.ts + direct API measurement | None — root cause eliminated |
| H2. Gel persiste mais plus tard dans la chaîne | **FAIL** | All test scenarios complete without timeout | Backend layer | None |
| H3. Premier token OK, completion lente | **PASS-PARTIAL** | TTFT ~1s; total=40-52s for CPU-bound models — expected for local inference | Ollama inference layer | Document as expected behavior, not a bug |
| H4. Stream vivant mais UI masque progression | **UNKNOWN** | Stream delivers tokens continuously (513 chunks); UI rendering not tested | R4 chat UI | Run actual Tauri desktop interaction to verify |
| H5. Fallback trop profond | **FAIL** | maxAttempts=2; no fallback triggered in any test | TS orchestrator | None |
| H6. Cible runtime testée non sûre | **PARTIAL** | TS fix confirmed in Vite source; Ollama backend tested directly; Tauri window not verified | R4 desktop | Accept as PARTIAL — backend proof is strong |
| H7. Autre bottleneck domine désormais | **UNKNOWN** | CPU-bound inference (40-52s/query) is now the primary latency factor — but this is hardware reality | Ollama/hardware | Consider model selection guidance (llama3.2:1b vs llama3:latest) |
| H8. Correctif suffisant pour promotion | **FAIL** (G_DESKTOP_X3 missing) | Backend PASS; UI x3 not executed | R4 | Run desktop x3 to unlock STABLE |
| H9. Correctif utile mais insuffisant | **PASS** | Fix eliminates timeout chain; CPU latency remains; QUALIFIED is honest | All layers | Proceed to QUALIFIED → pending desktop x3 |
| H10. Autre cause prouvée | **NONE** | No additional root cause found in this session | — | None |

## Summary

- **Primary root cause H1**: CONFIRMED ELIMINATED by fix 4ede39ac8
- **Secondary concern H3/H7**: CPU-bound inference latency (40-52s) is hardware reality, not a code bug
- **Remaining gap**: H4 (UI streaming render) and H8 (desktop x3) remain UNKNOWN/BLOCKED
- **Verdict implication**: Cannot promote to STABLE without desktop x3; QUALIFIED is the honest verdict
