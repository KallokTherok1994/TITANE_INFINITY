# 03 CRITICAL CHAIN MATRIX

| ID | Chain | Zone | Start Point | End Point | Must Certify Build | Must Certify Deploy | Status |
|---|---|---|---|---|---|---|---|
| A | Navigation -> route -> page load -> visible truth | GLOBAL | TopNav | page root visible | Oui | Oui | CERTIFIED sur routes vérifiées |
| B | Composer -> payload -> runtime -> transcript -> status | CHAT | ConversationSection | message visible + réponse + badges | Oui | Oui | PARTIAL, mock only dans cette session |
| C | Error/fallback/retry -> safe builder -> runtime -> truthful feedback | CHAT | ChatFallback / sendMessage | retry réel visible | Oui | Oui | UNVERIFIED live |
| D | Capture/store -> persistence -> retrieval/search -> injection -> UI | MEMORY | MemorySection / hooks | résultats mémoire visibles | Oui | Oui | PARTIAL |
| E | Runtime events -> trace capture -> explanation -> UI modes | OMEGA | ThinkingPanel / debugEntries | trace fidèle | Oui | Oui | PARTIAL |
| F | View/filter -> grouped source -> AI linkage -> truthful UI | TIME | TimePage | cartes et vues cohérentes | Oui | Oui | PARTIAL, non retesté en profondeur |
| G | Surface -> loader/service -> action/diagnostic -> result | DEV | DevPage | diagnostics utiles | Oui | Oui | PARTIAL, non retesté en profondeur |
| H | Control -> canonical config -> propagation target -> effect -> feedback | ADMIN | ConfigurationHub / AdminPage | effet runtime réel | Oui | Oui | UNVERIFIED |
