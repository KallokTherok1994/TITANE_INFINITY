# Scan BEFORE (P0/P1)

## P0 Ring2 HTTP bypass

Command:

`rg -n "HttpClient::new\(|reqwest::Client|ureq::|hyper::|tauri-plugin-http|http_client" src-tauri/src/engines -S`

Hits:

- `src-tauri/src/engines/unified_memory/summarizer.rs:298`
- `src-tauri/src/engines/unified_memory/summarizer.rs:315`
- `src-tauri/src/engines/unified_memory/embeddings.rs:213`
- `src-tauri/src/engines/unified_memory/embeddings.rs:216`

## P0 OneDoor candidates

Command:

`rg -n "(reqwest::|ureq::|hyper::|HttpClient::new\()" src-tauri/src -S`

Key hits:

- `src-tauri/src/engines/unified_memory/summarizer.rs:315`
- `src-tauri/src/engines/unified_memory/embeddings.rs:216`
- `src-tauri/src/core/http_types.rs:2`

## P1 UI no-web

Command:

`rg -n "window\.fetch\s*=" src -S`

Hit:

- `src/services/selfHealing/selfHealingObserver.ts:431`

## P1 IPC canonical + timeouts

Commands:

- `rg -n "\bCommandResult\b|\{\s*ok\s*,\s*content\s*,\s*error\s*\}" src src-tauri/src -S`
- `rg -n "timeout|tokio::time::timeout|Duration::from" src-tauri -S`

Resultat:

- IPC canon explicite non centralise detecte avant fix.
- Couverture timeout presente mais non exposee via un adapter IPC unifie dans `src/utils/invoke.ts`.
