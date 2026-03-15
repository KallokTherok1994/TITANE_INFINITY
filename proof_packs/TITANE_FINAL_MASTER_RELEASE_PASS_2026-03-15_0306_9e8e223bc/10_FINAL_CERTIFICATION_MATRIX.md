# 10 FINAL CERTIFICATION MATRIX

| ZONE | SURFACE | CRITICALITY | EXPECTED | RUNTIME EFFECT | ACTUAL | REGRESSION? | ETAT |
|------|---------|-------------|----------|----------------|--------|-------------|------|
| CHAT | Send path (useChat→chatService→conversationEngine) | CRITICAL | Message envoyé, réponse IA | Multi-provider, retry, fallback Ollama | FUNCTIONAL | NON | CERTIFIED |
| CHAT | Fallback/retry (providerCandidates loop) | CRITICAL | Essai séquentiel, dernier fallback | chatAttempts loggés, error propagé | FUNCTIONAL | NON | CERTIFIED |
| OMEGA | XP trace réel (useExperience) | MAJOR | Niveau + totalXP affiché | xpTrace useMemo depuis domains | FUNCTIONAL | NON | CERTIFIED |
| OMEGA | Mémoire trace réelle | MAJOR | injected=true, savedAfter vrais | lastEntry.status==='success' | FUNCTIONAL | NON | CERTIFIED |
| OMEGA | Sources systemPrompt (6) | MAJOR | Listées mode Expert | ThinkingPanel mode expert section | FUNCTIONAL | NON | CERTIFIED |
| MEMORY | usePersistentMemory stability | CRITICAL | Pas de loop update | DEFAULT_LEVELS + isRefreshingRef | STABLE | NON | CERTIFIED |
| MEMORY | Chat injection (persistentMemoryGetContext) | CRITICAL | Contexte mémoire injecté dans prompt | conversationEngine.ts ligne 398 | CONNECTED | NON | CERTIFIED |
| MEMORY | Counters vérité | MAJOR | 0 si Tauri inactif (pas 247/1832/4521) | TitanePage.tsx ?? 0 | TRUTHFUL | NON | CERTIFIED |
| MEMORY | Search mock notice | MAJOR | Bannière jaune si entries=undefined | isMockData visible | TRUTHFUL | NON | CERTIFIED |
| TIME | TimePage load (now/agenda/timeline/snapshots) | MAJOR | 4 tabs, load sans crash | Route lazy + ErrorBoundary | LOAD_OK | NON | CERTIFIED |
| DEV | DevPage load (overview/diagnostics) | MAJOR | 8 sections, ErrorBoundary | DevPageContent avec ErrorBoundary | LOAD_OK | NON | CERTIFIED |
| ADMIN | Import SystemCenter guard | CRITICAL | throw si export manquant | AdminPage.tsx guard ligne 44 | FUNCTIONAL | NON | CERTIFIED |
| ADMIN | IPC envelope ConfigHub | CRITICAL | normalizeSnapshotResponse | E2E PASS 2/2 commit 8702edd39 | CERTIFIED | NON | CERTIFIED |
| ADMIN | IPC diagnostics unwrap | CRITICAL | unwrapDiagnostics/unwrapStatus | useSystemDiagnostics.ts | FUNCTIONAL | NON | CERTIFIED |
| SHELL | Tab grammar (3 zones unifiées) | MAJOR | --tab-active-* tokens partout | 3 CSS vérifiés | CERTIFIED | NON | CERTIFIED |
| SHELL | CognitiveLayout floating supprimé | CRITICAL | Aucun montage dans App.tsx | App.tsx:127 commenté, jamais importé | VERIFIED | NON | CERTIFIED |
| SHELL | ChatWindow ambient glow supprimé | MINOR | ::before absent | ChatWindow.css vérifié | CERTIFIED | NON | CERTIFIED |
