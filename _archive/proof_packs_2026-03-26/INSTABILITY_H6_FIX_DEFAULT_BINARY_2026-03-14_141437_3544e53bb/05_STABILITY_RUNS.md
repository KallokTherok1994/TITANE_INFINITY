# 05 STABILITY RUNS

## STABILITY MATRIX

| RUN | BINARY | MODE | REASON | PROVIDER_USED | FALLBACK_USED | LATENCY | USEFUL? |
|---|---|---|---|---|---|---|---|
| S1-BEFORE | AppImage (20s) | REMOTE | TIMEOUT | timeout-degraded | true | 22.7s | NO |
| S2-R1 | release (60s) | LOCAL | OK | Ollama | false | 45.2s | YES |
| S2-R2 | release (60s) | LOCAL | OK | Ollama | false | 38.3s | YES |
| S2-R3 | release (60s) | LOCAL | OK | Ollama | false | 24.6s | YES |
| Campaign-B-R1 | AppImage (20s) | REMOTE | TIMEOUT | timeout-degraded | true | 22.1s | NO |
| Campaign-B-R2 | AppImage (20s) | REMOTE | TIMEOUT | timeout-degraded | true | 22.2s | NO |
| Campaign-B-R3 | AppImage (20s) | REMOTE | TIMEOUT | timeout-degraded | true | 22.5s | NO |
| **S4-R1 (POST H6-FIX)** | release (60s) DEFAULT | LOCAL | OK | Ollama | false | 30.3s | **YES** |
| **S4-R2 (POST H6-FIX)** | release (60s) DEFAULT | LOCAL | OK | Ollama | false | 42.8s | **YES** |
| **S4-R3 (POST H6-FIX)** | release (60s) DEFAULT | LOCAL | OK | Ollama | false | 30.7s | **YES** |
| S5-FORCED-DEGRADED | release (5s) | REMOTE | TIMEOUT | timeout-degraded | true | 7.2s | honest |

## Key Observation

Pattern clarity:
- AppImage (20s) → ALL fail with TIMEOUT at ~22s (100% failure rate)
- Release binary (60s) → ALL pass with Ollama/OK (100% pass rate, both sessions)
- Forced 5s → honest degraded (100% honest, both before and after)

The instability was DETERMINISTIC (not random) and binary-dependent.
