# 02 INSTABILITY DIFF

## R-OK (from TIMEOUT_USEFUL_WINDOW_TUNING S2)
| Field | Value |
|---|---|
| Binary | src-tauri/target/release/titane-infinity (TAURI_BINARY_PATH set) |
| DEFAULT_TIMEOUT_SECS | 60 |
| provider | Ollama |
| mode | LOCAL |
| reason | OK |
| fallback_triggered | false |
| duration | 45.2s, 38.3s, 24.6s |

## R-TIMEOUT (from FINAL_CLOSURE_CAMPAIGNS Campaign-B)
| Field | Value |
|---|---|
| Binary | AppImage v27.0.2 (TAURI_BINARY_PATH NOT set) |
| DEFAULT_TIMEOUT_SECS | 20 (old binary) |
| provider | timeout-degraded |
| mode | REMOTE |
| reason | TIMEOUT |
| fallback_triggered | true |
| duration | 22.1s, 22.2s, 22.5s |

## INSTABILITY MATRIX
| FIELD | R-OK | R-TIMEOUT | DELTA | PROVED? |
|---|---|---|---|---|
| Binary used | release (patched) | AppImage (pre-patch) | DIFFERENT | YES |
| TIMEOUT_SECS | 60 | 20 | -40s | YES |
| Guard fires at | never (6s gen) | 20.x s | yes when timer=20 | YES |
| Network available | true (Degraded) | true (Degraded) | same | YES |
| Provider reached | Ollama | NOT reached | guard fires first | YES |
| TRACE_TIMEOUT_GUARD | absent | would be present | inverse logic | YES |
