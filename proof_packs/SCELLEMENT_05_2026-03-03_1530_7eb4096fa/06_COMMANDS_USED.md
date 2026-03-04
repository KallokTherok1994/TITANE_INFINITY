]633;E;{   echo "# 06_COMMANDS_USED"\x3b   echo "- Timestamp: $(date -Iseconds)"\x3b   echo\x0acat <<'EOF'\x0agit status\x0agit rev-parse --short HEAD\x0agit log -20 --oneline\x0als -la proof_packs || true\x0afind proof_packs -maxdepth 3 -type f -name "07_GATES_REPORT.md" -o -name "10_VERDICT*.md" -o -name "05_TESTS_X3.log" -o -name "06_BUILD_X3.log" | sort || true\x0arg -n --hidden --glob '!.git' "fetch\\(|axios|WebSocket|ws://|http://|https://" src\x0arg -n --hidden --glob '!.git' "invoke\\(|tauri\\.invoke|@tauri-apps/api" src\x0arg -n --hidden --glob '!.git' "ChatEngineConfig|ChatRequestPayload|temperature|max_output_tokens|memory_flush_interval|stream_chunk_size|enforce_retention" src-tauri/src\x0arg -n --hidden --glob '!.git' "from_utf8_lossy|as_bytes\\(\\)\\.chunks\\(" src-tauri/src\x0arg -n --hidden --glob '!.git' "router|pipeline|orchestr|dispatch|provider|stream" src-tauri/src\x0aEOF\x0a} > "$PACK/06_COMMANDS_USED.md";b4ca41d3-eac1-42a1-8619-9a62c4439bff]633;C# 06_COMMANDS_USED
- Timestamp: 2026-03-03T15:31:09-05:00

git status
git rev-parse --short HEAD
git log -20 --oneline
ls -la proof_packs || true
find proof_packs -maxdepth 3 -type f -name "07_GATES_REPORT.md" -o -name "10_VERDICT*.md" -o -name "05_TESTS_X3.log" -o -name "06_BUILD_X3.log" | sort || true
rg -n --hidden --glob '!.git' "fetch\(|axios|WebSocket|ws://|http://|https://" src
rg -n --hidden --glob '!.git' "invoke\(|tauri\.invoke|@tauri-apps/api" src
rg -n --hidden --glob '!.git' "ChatEngineConfig|ChatRequestPayload|temperature|max_output_tokens|memory_flush_interval|stream_chunk_size|enforce_retention" src-tauri/src
rg -n --hidden --glob '!.git' "from_utf8_lossy|as_bytes\(\)\.chunks\(" src-tauri/src
rg -n --hidden --glob '!.git' "router|pipeline|orchestr|dispatch|provider|stream" src-tauri/src

## Commandes d'exécution/auto-fix supplémentaires
cargo test (x3, retries)
pnpm run check (x3, retries)
pnpm run test:architecture (x3, retries)
pnpm run build (x3 réel)
rg doctest failures in 08_TESTS_X3.log
