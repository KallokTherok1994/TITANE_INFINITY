# 23 - Plan de Shards

| Shard | Criticite | Dependances | Risque dominant | Cible preuve | Cible maturite | Blocage |
|---|---|---|---|---|---|---|
| A Desktop Boot + Target + Shell | P0 | tauri.conf + wrapper | target mismatch | L2 | M2 | none |
| B Navigation + Routes | P1 | router + e2e selectors | route reachability | L3 | M2 | E2E chat bloque |
| C Pages + Modules | P1 | UI mounts | visual-only pass | L3 | M2 | partiel |
| D Tabs/Subtabs | P1 | selectors stables | tab chain broken | L3 | M2 | present |
| E Controls/Actions | P0 | IPC/chat handlers | no visible effect | L3 | M2 | present |
| F Settings persistence | P1 | store + reload | not persisted | L4 | M3 | non prouve |
| G Badge honesty | P1 | source mapping | badge lie | L3 | M2 | partiel |
| H Error/Empty/Loading | P1 | UI states | silent wait | L3 | M2 | present |
| I Chat core + quality | P0 | provider + memory | assistant absent | L3 | M2 | present |
| J Memory save/restore | P0 | sqlite/events | restore broken | L4 | M3 | none |
| K OMEGA routing | P1 | omega tests | mode lie | L3 | M2 | partiel |
| L Online/providers/tools | P0 | ollama + routing | provider lie | L3 | M2 | partiel |
| M Reload/Relaunch | P0 | launch scripts | relaunch drift | L5 | M4 | blocked env |
| N Hidden/rare surfaces | P2 | conditional selectors | orphan states | L2 | M1 | non couvert |
| O Admin/dev/diag | P2 | devtools | state lie | L2 | M1 | non couvert |
| P Performance/TTFT | P1 | chat runtime | no first token proof | L3 | M2 | blocked |
| Q Validators/E2E hardening | P0 | scripts verify + wrapper | harness-only green | L6 | M3 | partiel |
