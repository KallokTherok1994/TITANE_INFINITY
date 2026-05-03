# 04 MASTER CLASSIFICATION MATRIX

| ID | Item | Zone | File UI or Source | Category | Real User Intent | Canonical Source | Criticality | Expected Release State | Actual State Now |
|---|---|---|---|---|---|---|---|---|---|
| MC-01 | App shell + top nav | GLOBAL | src/App.tsx | ROUTE, PRIMARY_UI, CHAIN | naviguer | App.tsx | CRITICAL | CERTIFIED | CERTIFIED |
| MC-02 | TITANE conversation tab | CHAT | src/pages/TitanePage.tsx | TAB, PRIMARY_UI, ACTION_SURFACE, CHAIN | converser | ConversationSection | CRITICAL | CERTIFIED | PARTIAL |
| MC-03 | Chat fallback/retry surface | CHAT | src/components/chat/ChatFallback.tsx | ACTION_SURFACE, STATUS_SURFACE, CHAIN | récupérer après erreur | useChat + MessageBubble | CRITICAL | CERTIFIED | UNVERIFIED |
| MC-04 | Thinking / OMEGA trace | OMEGA | src/features/chat/ThinkingPanel.tsx | EXPERT_UI, TRACE_SURFACE | comprendre la décision | debugEntries / omega metadata | MAJOR | CERTIFIED | PARTIAL |
| MC-05 | TITANE memory tab | MEMORY | src/components/sections/MemorySection.tsx | TAB, PRIMARY_UI, PERSISTENCE_SURFACE, RETRIEVAL_SURFACE | explorer mémoire | usePersistentMemory | CRITICAL | CERTIFIED | PARTIAL |
| MC-06 | Memory tree viewer | MEMORY | src/features/memory/MemoryTreeViewer.tsx | EXPERT_UI, TRACE_SURFACE | explorer hiérarchie | MemoryTreeViewer | MAJOR | CERTIFIED | PARTIAL |
| MC-07 | Time center | TIME | src/pages/TimePage.tsx | ROUTE, PRIMARY_UI | gérer temps | TimePage | MAJOR | CERTIFIED | UNVERIFIED depth |
| MC-08 | Dev center | DEV | src/pages/DevPage.tsx | ROUTE, PRIMARY_UI, DIAGNOSTIC_SURFACE | diagnostiquer | DevPage | MAJOR | CERTIFIED | UNVERIFIED depth |
| MC-09 | Admin shell | ADMIN | src/features/admin/AdminPage.tsx | ROUTE, PRIMARY_UI, SUBTAB | administrer | AdminPage | CRITICAL | CERTIFIED | CERTIFIED load |
| MC-10 | Admin configuration hub | ADMIN | src/pages/ConfigurationHub.tsx | SUBTAB, ACTION_SURFACE, PROPAGATION_SURFACE | configurer runtime | ConfigurationHub | CRITICAL | CERTIFIED | PARTIAL |
| MC-11 | Admin audio | ADMIN | src/features/audio-center/AudioCenterPage.tsx | SUBTAB, ACTION_SURFACE, PROPAGATION_SURFACE | piloter audio | AudioCenterPage | CRITICAL | CERTIFIED | PARTIAL |
| MC-12 | Admin governance | ADMIN | src/features/governance-center/GovernanceCenterPage.tsx | SUBTAB, PRIMARY_UI | gouverner | GovernanceCenterPage | CRITICAL | CERTIFIED | CERTIFIED load |
