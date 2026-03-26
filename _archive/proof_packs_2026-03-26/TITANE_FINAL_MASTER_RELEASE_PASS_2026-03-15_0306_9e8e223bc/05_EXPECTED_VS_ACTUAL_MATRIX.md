# 05 EXPECTED VS ACTUAL MATRIX

| ID | ISSUE | ZONE | EXPECTED | CODE? | RUNTIME? | REGRESSION? | ETAT |
|----|-------|------|----------|-------|----------|-------------|------|
| E1 | Floating CognitiveLayout supprimé | ADMIN | Plus de panneau flottant | OUI (App.tsx:127 commentaire) | PARTIEL (statique) | NON | CERTIFIED |
| E2 | Controls cognitifs dans ADMIN | ADMIN | useCognitiveLayout dans ConfigurationHub | OUI (ligne 366) | PARTIEL | NON | CERTIFIED |
| E3 | Tab grammar unification | SHELL | tokens --tab-active-* partout | OUI (3 fichiers CSS) | OUI (statique) | NON | CERTIFIED |
| E4 | Admin dénéonisation | ADMIN | h1 titanium blanc, header 1px | OUI (AdminPage.css) | OUI | NON | CERTIFIED |
| E5 | ChatWindow ambient glow supprimé | SHELL | ::before gradient absent | OUI (ChatWindow.css) | OUI | NON | CERTIFIED |
| E6 | OMEGA v4 XP réel | OMEGA | useExperience domains + xpTrace useMemo | OUI (Chat.tsx ~628, ~887) | OUI | NON | CERTIFIED |
| E7 | OMEGA v4 mémoire réelle | OMEGA | memoryTrace lastEntry.status | OUI (Chat.tsx ~870) | OUI | NON | CERTIFIED |
| E8 | OMEGA v4 sources systemPrompt | OMEGA | 6 sources listées mode Expert | OUI (ThinkingPanel ~350) | OUI | NON | CERTIFIED |
| E9 | Admin IPC envelope unwrap | ADMIN | normalizeSnapshotResponse + unwrapDiagnostics | OUI (ConfigHub + useSystemDiagnostics) | OUI (E2E pass) | NON | CERTIFIED |
| E10 | Admin import guard SystemCenter | ADMIN | throw si export manquant | OUI (AdminPage.tsx ligne 44) | OUI (E2E pass) | NON | CERTIFIED |
| E11 | Memory counters vérité | MEMORY | fallback → 0 | OUI (TitanePage.tsx) | OUI | NON | CERTIFIED |
| E12 | MemorySearch mock notice | MEMORY | bannière jaune visible | OUI (MemorySearchPanel.tsx) | OUI | NON | CERTIFIED |
| E13 | Projects mock notice | UI | bannière inline | OUI (Projects.tsx) | OUI | NON | CERTIFIED |
| E14 | E2E admin guard | ADMIN | assertNoAdminBoundaryError | OUI (spec.ts) | OUI (PASS) | NON | CERTIFIED |
| E15 | usePersistentMemory loop fix | MEMORY | DEFAULT_LEVELS + isRefreshingRef | OUI (déjà présent) | OUI | NON | CERTIFIED |
| E16 | VectorStoreClient mismatch | MEMORY | MAJOR non bloquant (ConvMgr hors UI) | N/A | N/A | NON | PARTIAL (DISPLAY_ONLY) |
