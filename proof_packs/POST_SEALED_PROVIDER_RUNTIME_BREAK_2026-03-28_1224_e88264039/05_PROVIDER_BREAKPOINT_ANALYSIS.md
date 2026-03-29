# 05_PROVIDER_BREAKPOINT_ANALYSIS

Primary breakpoint: BREAK_AT_PROVIDER_EXECUTION

Evidence (PROVIDER_UNAVAILABLE / Mode: ERROR):

RUN1
2158:[0-0]   providerReason: 'PROVIDER_UNAVAILABLE',
2166:[0-0]   runtimeSummary: 'Requested: Ollama | Provider: ollama | Mode: ERROR | Reason: PROVIDER_UNAVAILABLE | Network: false',
2206:[0-0]   providerReason: 'PROVIDER_UNAVAILABLE',
2214:[0-0]   runtimeSummary: 'Requested: Ollama | Provider: ollama | Mode: ERROR | Reason: PROVIDER_UNAVAILABLE | Network: false',
2240:[0-0]   providerReason: 'PROVIDER_UNAVAILABLE',
2248:[0-0]   runtimeSummary: 'Requested: Ollama | Provider: ollama | Mode: ERROR | Reason: PROVIDER_UNAVAILABLE | Network: false',
2259:[0-0] [MEMORY_TURN_3] kind=assistant latencyMs=101 runtime={"providerReason":"PROVIDER_UNAVAILABLE","browserMode":true,"networkUsed":"false","memoryState":"UNKNOWN","providerUsed":"OLLAMA","providerMode":"ERROR","sendTraceMeta":"provider=unknown;reason=UNKNOWN","url":"tauri://localhost/titane","runtimeSummary":"Requested: Ollama | Provider: ollama | Mode: ERROR | Reason: PROVIDER_UNAVAILABLE | Network: false","sendTraceState":"RESPONDED","ipcReadyState":"READY","assistantText":"🤖 **TITANE∞ — Réponse indisponible**\n\nUne anomalie a empêché la génération d'une réponse valide.\n\n**Détail** : [OmegaClassifier] Anti-lie: classification confidence 0.55 < 0.7 but resolved to classification.backendMode='default'. User mode should have been preserved.\n\nRéessaie dans quelques instants ou vérifie la disponibilité du backend."}
2356:[0-0]   providerReason: 'PROVIDER_UNAVAILABLE',
2364:[0-0]   runtimeSummary: 'Requested: Ollama | Provider: ollama | Mode: ERROR | Reason: PROVIDER_UNAVAILABLE | Network: false',
2404:[0-0]   providerReason: 'PROVIDER_UNAVAILABLE',
2412:[0-0]   runtimeSummary: 'Requested: Ollama | Provider: ollama | Mode: ERROR | Reason: PROVIDER_UNAVAILABLE | Network: false',
2434:[0-0] [MEMORY_TURN_4] kind=degraded latencyMs=125 runtime={"providerReason":"PROVIDER_UNAVAILABLE","browserMode":true,"networkUsed":"false","memoryState":"UNKNOWN","providerUsed":"OLLAMA","providerMode":"ERROR","sendTraceMeta":"provider=ollama;len=73","url":"tauri://localhost/titane","runtimeSummary":"Requested: Ollama | Provider: ollama | Mode: ERROR | Reason: PROVIDER_UNAVAILABLE | Network: false","sendTraceState":"DISPATCHING","ipcReadyState":"READY","assistantText":"🤖 **TITANE∞ — Réponse indisponible**\n\nUne anomalie a empêché la génération d'une réponse valide.\n\n**Détail** : [OmegaClassifier] Anti-lie: classification confidence 0.55 < 0.7 but resolved to classification.backendMode='default'. User mode should have been preserved.\n\nRéessaie dans quelques instants ou vérifie la disponibilité du backend."}

RUN2
2428:[0-0]   providerReason: 'PROVIDER_UNAVAILABLE',
2436:[0-0]   runtimeSummary: 'Requested: Ollama | Provider: ollama | Mode: ERROR | Reason: PROVIDER_UNAVAILABLE | Network: false',
2476:[0-0]   providerReason: 'PROVIDER_UNAVAILABLE',
2484:[0-0]   runtimeSummary: 'Requested: Ollama | Provider: ollama | Mode: ERROR | Reason: PROVIDER_UNAVAILABLE | Network: false',
2510:[0-0]   providerReason: 'PROVIDER_UNAVAILABLE',
2518:[0-0]   runtimeSummary: 'Requested: Ollama | Provider: ollama | Mode: ERROR | Reason: PROVIDER_UNAVAILABLE | Network: false',
2529:[0-0] [MEMORY_TURN_3] kind=assistant latencyMs=176 runtime={"providerReason":"PROVIDER_UNAVAILABLE","browserMode":true,"networkUsed":"false","memoryState":"UNKNOWN","providerUsed":"OLLAMA","providerMode":"ERROR","sendTraceMeta":"provider=unknown;reason=UNKNOWN","url":"tauri://localhost/titane","runtimeSummary":"Requested: Ollama | Provider: ollama | Mode: ERROR | Reason: PROVIDER_UNAVAILABLE | Network: false","sendTraceState":"RESPONDED","ipcReadyState":"READY","assistantText":"🤖 **TITANE∞ — Réponse indisponible**\n\nUne anomalie a empêché la génération d'une réponse valide.\n\n**Détail** : [OmegaClassifier] Anti-lie: classification confidence 0.55 < 0.7 but resolved to classification.backendMode='default'. User mode should have been preserved.\n\nRéessaie dans quelques instants ou vérifie la disponibilité du backend."}
2626:[0-0]   providerReason: 'PROVIDER_UNAVAILABLE',
2634:[0-0]   runtimeSummary: 'Requested: Ollama | Provider: ollama | Mode: ERROR | Reason: PROVIDER_UNAVAILABLE | Network: false',
2674:[0-0]   providerReason: 'PROVIDER_UNAVAILABLE',
2682:[0-0]   runtimeSummary: 'Requested: Ollama | Provider: ollama | Mode: ERROR | Reason: PROVIDER_UNAVAILABLE | Network: false',
2704:[0-0] [MEMORY_TURN_4] kind=degraded latencyMs=146 runtime={"providerReason":"PROVIDER_UNAVAILABLE","browserMode":true,"networkUsed":"false","memoryState":"UNKNOWN","providerUsed":"OLLAMA","providerMode":"ERROR","sendTraceMeta":"provider=ollama;len=73","url":"tauri://localhost/titane","runtimeSummary":"Requested: Ollama | Provider: ollama | Mode: ERROR | Reason: PROVIDER_UNAVAILABLE | Network: false","sendTraceState":"DISPATCHING","ipcReadyState":"READY","assistantText":"🤖 **TITANE∞ — Réponse indisponible**\n\nUne anomalie a empêché la génération d'une réponse valide.\n\n**Détail** : [OmegaClassifier] Anti-lie: classification confidence 0.55 < 0.7 but resolved to classification.backendMode='default'. User mode should have been preserved.\n\nRéessaie dans quelques instants ou vérifie la disponibilité du backend."}

RUN3
2807:[0-0]   providerReason: 'PROVIDER_UNAVAILABLE',
2815:[0-0]   runtimeSummary: 'Requested: Ollama | Provider: ollama | Mode: ERROR | Reason: PROVIDER_UNAVAILABLE | Network: false',
2855:[0-0]   providerReason: 'PROVIDER_UNAVAILABLE',
2863:[0-0]   runtimeSummary: 'Requested: Ollama | Provider: ollama | Mode: ERROR | Reason: PROVIDER_UNAVAILABLE | Network: false',
2889:[0-0]   providerReason: 'PROVIDER_UNAVAILABLE',
2897:[0-0]   runtimeSummary: 'Requested: Ollama | Provider: ollama | Mode: ERROR | Reason: PROVIDER_UNAVAILABLE | Network: false',
2908:[0-0] [MEMORY_TURN_3] kind=assistant latencyMs=140 runtime={"providerReason":"PROVIDER_UNAVAILABLE","browserMode":true,"networkUsed":"false","memoryState":"UNKNOWN","providerUsed":"OLLAMA","providerMode":"ERROR","sendTraceMeta":"provider=unknown;reason=UNKNOWN","url":"tauri://localhost/titane","runtimeSummary":"Requested: Ollama | Provider: ollama | Mode: ERROR | Reason: PROVIDER_UNAVAILABLE | Network: false","sendTraceState":"RESPONDED","ipcReadyState":"READY","assistantText":"🤖 **TITANE∞ — Réponse indisponible**\n\nUne anomalie a empêché la génération d'une réponse valide.\n\n**Détail** : [OmegaClassifier] Anti-lie: classification confidence 0.55 < 0.7 but resolved to classification.backendMode='default'. User mode should have been preserved.\n\nRéessaie dans quelques instants ou vérifie la disponibilité du backend."}
3005:[0-0]   providerReason: 'PROVIDER_UNAVAILABLE',
3013:[0-0]   runtimeSummary: 'Requested: Ollama | Provider: ollama | Mode: ERROR | Reason: PROVIDER_UNAVAILABLE | Network: false',
3053:[0-0]   providerReason: 'PROVIDER_UNAVAILABLE',
3061:[0-0]   runtimeSummary: 'Requested: Ollama | Provider: ollama | Mode: ERROR | Reason: PROVIDER_UNAVAILABLE | Network: false',
3083:[0-0] [MEMORY_TURN_4] kind=degraded latencyMs=134 runtime={"providerReason":"PROVIDER_UNAVAILABLE","browserMode":true,"networkUsed":"false","memoryState":"UNKNOWN","providerUsed":"OLLAMA","providerMode":"ERROR","sendTraceMeta":"provider=ollama;len=73","url":"tauri://localhost/titane","runtimeSummary":"Requested: Ollama | Provider: ollama | Mode: ERROR | Reason: PROVIDER_UNAVAILABLE | Network: false","sendTraceState":"DISPATCHING","ipcReadyState":"READY","assistantText":"🤖 **TITANE∞ — Réponse indisponible**\n\nUne anomalie a empêché la génération d'une réponse valide.\n\n**Détail** : [OmegaClassifier] Anti-lie: classification confidence 0.55 < 0.7 but resolved to classification.backendMode='default'. User mode should have been preserved.\n\nRéessaie dans quelques instants ou vérifie la disponibilité du backend."}

Consequence: memory consume remains blocked; degraded verdict is honest.
