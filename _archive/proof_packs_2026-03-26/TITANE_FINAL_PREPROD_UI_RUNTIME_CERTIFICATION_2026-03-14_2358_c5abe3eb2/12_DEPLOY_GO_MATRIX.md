# 12 DEPLOY GO MATRIX

| Zone | Item | Criticality | Must Pass Deploy | Actual State | Result |
|---|---|---|---|---|---|
| BUILD prereqs | All build-critical items | CRITICAL | Oui | FAILED | FAIL |
| CHAT Runtime | Provider réel + fallback + retry | CRITICAL | Oui | UNVERIFIED/PARTIAL | FAIL |
| ADMIN Runtime | Canonical propagation proven | CRITICAL | Oui | UNVERIFIED | FAIL |
| AUDIO Runtime | Device/TTS effect proven | CRITICAL | Oui | UNVERIFIED | FAIL |
| MEMORY Runtime | End-to-end persistence/injection | CRITICAL | Oui | PARTIAL | FAIL |
| Production artifact/runtime | Tauri prod runtime/deploy smoke | CRITICAL | Oui | UNVERIFIED | FAIL |
