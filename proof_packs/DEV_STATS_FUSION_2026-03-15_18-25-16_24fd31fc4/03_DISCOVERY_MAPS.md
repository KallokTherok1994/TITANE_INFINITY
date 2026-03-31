# DISCOVERY MAPS

## 3.1 ROUTE MAP
| route | component | status |
|---|---|---|
| /stats | Stats (page) | REDIRECTED to /dev |
| /dev | DevPage (5 tabs) | CANONICAL authority |
| /cognitive | redirect | was /stats, now /dev |

## 3.2 COMPONENT MAP
| component | file | role |
|---|---|---|
| Stats | src/pages/Stats.tsx | page wrapper (kept, route dead) |
| StatsSystemPanels | src/pages/Stats.tsx | NEW — 4 engine sections, self-contained hooks |
| DevPage | src/pages/DevPage.tsx | canonical monitoring authority |
| MetricsSection | DevPage.tsx internal | CPU/RAM/Disk/Uptime from QA monitoring |
| OrchestrationSection | DevPage.tsx internal | Nexus coherence/nodes, Harmonia score, Multi-AI |

## 3.3 DATA MAP
| metric family | hook/service | real/mock |
|---|---|---|
| NEXUS (nodes/connections/density) | useEngineSubscription('nexus') | real IPC |
| HELIOS (bpm/vitality/load/temp/uptime) | useEngineSubscription('helios') | real IPC |
| HARMONIA (flows/balance/coherence) | useEngineSubscription('harmonia') | real IPC |
| Cognitive state | tauriClient.orchestrationGetCognitiveState() | real IPC |
| CPU/RAM/Disk | useQAMonitoring.getSystemMetrics() | real IPC |
| Uptime (DEV) | useOneCore.state.uptime_seconds | real IPC |
| Orchestration meta | tauriClient.orchestrationGetUnifiedState() | real IPC + mock fallback (labelled) |

## 3.5 DUPLICATION MAP
| metric | stats | dev_before | dev_after | duplicate_removed |
|---|---|---|---|---|
| Uptime | HELIOS source | oneCore source | both present (different sources, labelled) | NO — different sources |
| Active Nodes | nexusGraph.nodeCount | nexus.activeNodes (Orch section) | both | Partial — different display context |
| Coherence (Nexus) | nexusGraph coherence | nexus.coherenceScore | both | Partial — different display context |
| CPU/RAM/Disk | absent | MetricsSection | MetricsSection | N/A |
| BPM/Vitality/Load | Stats only | absent before | added via StatsSystemPanels | N/A |
