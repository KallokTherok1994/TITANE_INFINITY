# METRIC TRUTH MATRIX

| metric name | displayed in | source hook/store/service | IPC/backend source | static/mock/default? | proven? | anti-lie risk | action needed |
|------------|-------------|--------------------------|-------------------|---------------------|---------|---------------|---------------|
| Nœuds Actifs (nexus.nodeCount) | DevPage > Diagnostics > StatsSystemPanels | `useEngineSubscription('nexus')` | Tauri IPC engine event | Default: 0 | WIRED_BUT_UNPROVEN | Medium (0 if backend absent) | Runtime-dependent — honest |
| Connexions (nexus.edgeCount) | DevPage > Diagnostics > StatsSystemPanels | `useEngineSubscription('nexus')` | Tauri IPC engine event | Default: 0 | WIRED_BUT_UNPROVEN | Medium | Runtime-dependent — honest |
| BPM Système (helios.bpm) | DevPage > Diagnostics > StatsSystemPanels | `useEngineSubscription('helios')` | Tauri IPC engine event | Default: 0 | WIRED_BUT_UNPROVEN | Medium | Runtime-dependent — honest |
| Score Vitalité (helios.vitality_score) | DevPage > Diagnostics > StatsSystemPanels | `useEngineSubscription('helios')` | Tauri IPC | Default: 0 | WIRED_BUT_UNPROVEN | Medium | Runtime-dependent — honest |
| Score Cognitif (cognitiveMetrics.cognitiveScore) | DevPage > Diagnostics > StatsSystemPanels | `tauriClient.orchestrationGetCognitiveState()` 5s poll | Tauri IPC | null fallback | WIRED_BUT_UNPROVEN | Medium | null shown honestly |
| Santé Globale % | DevPage > Overview | `useOneCore` + `useQAMonitoring` | IPC qa/one-core | 0 if null | WIRED_BUT_UNPROVEN | HIGH — 0% if IPC fails | Degraded-state shown |
| QA Score | DevPage > Overview | `useQAMonitoring` | IPC | N/A if null | WIRED_BUT_UNPROVEN | Medium | N/A displayed honestly |
| Orchestration state (live) | DevPage > Diagnostics | `tauriClient.orchestrationGetUnifiedState()` | Tauri IPC | fallback string constant | WIRED_BUT_UNPROVEN | HIGH | `orchestrationDegraded` banner shown ✓ |
| Orchestration state (fallback) | DevPage > Diagnostics | static fallback `claude,87%,true` | NONE | STATIC_ONLY | STATIC_ONLY | HIGH | Banner shown when static ✓ |
| Web Vitals | DevPage > Diagnostics | NONE | NONE | DISPLAY_ONLY | STATIC_ONLY | HIGH | Comment: "monitoring IPC non câblé" ✓ |
| CPU/RAM/Disk Usage | DevPage > Diagnostics | `useQAMonitoring.getSystemMetrics()` | IPC | null → hidden | WIRED_BUT_UNPROVEN | Low | Hidden if null ✓ |

## Summary
- PROVEN_RUNTIME: 0 (no live runtime proof available in static analysis)
- WIRED_BUT_UNPROVEN: 9
- STATIC_ONLY: 2 (orchestration fallback + Web Vitals — both honestly labeled)
- MOCKED: 0
- UNKNOWN: 0

No silent fake data found. All fallback states are explicitly labeled in UI.
