# 11 BUILD GO MATRIX

| Zone | Item | Criticality | Must Pass Build | Actual State | Result |
|---|---|---|---|---|---|
| GLOBAL | Navigation load | CRITICAL | Oui | CERTIFIED | PASS |
| CHAT | Send path réel | CRITICAL | Oui | PARTIAL | FAIL |
| CHAT | Fallback/retry réel | CRITICAL | Oui | UNVERIFIED | FAIL |
| MEMORY | Persistence/retrieval core | CRITICAL | Oui | PARTIAL | FAIL |
| ADMIN | Import/load stability | CRITICAL | Oui | CERTIFIED | PASS |
| ADMIN | Config propagation | CRITICAL | Oui | UNVERIFIED | FAIL |
| GLOBAL | No import/render crash on verified routes | CRITICAL | Oui | CERTIFIED sur périmètre testé | PASS |
| GLOBAL | Format gate | MAJOR release gate | Oui | FAILED | FAIL |
| GLOBAL | Safe frontend build | CRITICAL | Oui | CERTIFIED | PASS |
