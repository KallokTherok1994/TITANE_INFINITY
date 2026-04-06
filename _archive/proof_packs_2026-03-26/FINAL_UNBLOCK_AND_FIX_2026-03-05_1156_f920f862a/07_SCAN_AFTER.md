# Scan AFTER (P0/P1)

## Ring2 HTTP

Command:

`rg -n "HttpClient::new\(|reqwest::Client|ureq::|hyper::|tauri-plugin-http|http_client" src-tauri/src/engines -S`

Resultat:

- `0 hit`

## OneDoor candidates

Command:

`rg -n "(reqwest::|ureq::|hyper::|HttpClient::new\()" src-tauri/src -S`

Resultat:

- hit restant attendu et autorise: `src-tauri/src/core/http_types.rs:2`
- guard script: `bash scripts/verify/network-one-door.sh` -> `PASS`

## UI no-web monkey patch

Command:

`rg -n "window\.fetch\s*=" src -S`

Resultat:

- `0 hit`

## IPC canonical + timeout

Commandes:

- `rg -n "safeInvokeCanonical|CanonicalIpcResult|IPC_MALFORMED_RESPONSE" src/utils/invoke.ts -S`
- `rg -n "timeout|safeInvokeWithTimeout|secureInvoke" src/utils/invoke.ts -S`

Resultat:

- Adapter canon present (`safeInvokeCanonical`, `CanonicalIpcResult`)
- Guard malformed response present (`IPC_MALFORMED_RESPONSE`)
- Timeout borne present (`secureInvoke(..., { timeout })`, `safeInvokeWithTimeout`)
