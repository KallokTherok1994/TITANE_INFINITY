# 05 MASTER TRUTH MATRIX

| ID | Zone | Item | File UI | Handler or Loader | Store Target | Service or Source | Propagates To | Expected Effect | Effect Proven | Status | Autofix Needed |
|---|---|---|---|---|---|---|---|---|---|---|---|
| MT-01 | GLOBAL | Main nav | src/components/layout/TopNav.tsx | navigate handler in App.tsx | route state | react-router | NONE | route visible correcte | Oui | PASS | Non |
| MT-02 | CHAT | Conversation send | src/components/sections/ConversationSection.tsx | sendMessage | useChat state | src/hooks/useChat.ts | CHAT_RUNTIME | message + réponse + statut | Partiel, mock | PARTIAL | Oui |
| MT-03 | CHAT | Fallback/retry | src/components/chat/ChatFallback.tsx | onRetry / handleRetryMessage | useChat state | MessageBubble + useChat | CHAT_RUNTIME | récupération après erreur réelle | Non | FAIL | Oui |
| MT-04 | CHAT | Reasoning trace | src/features/chat/ThinkingPanel.tsx | derived runtimeThinking | debugEntries | omega metadata / debugEntries | OMEGA_TRACE | trace fidèle visible | Partiel | PARTIAL | Oui |
| MT-05 | MEMORY | Persistent memory read/search | src/components/sections/MemorySection.tsx | usePersistentMemory | persistent memory hook state | tauriClient persistentMemoryRead | MEMORY_STORE | cartes et recherche cohérentes | Partiel | PARTIAL | Oui |
| MT-06 | MEMORY | Memory tree expert controls | src/features/memory/MemoryTreeViewer.tsx | local handlers | local state | D3 tree rendering | NONE | zoom/filter/node inspect | Partiel | PARTIAL | Oui |
| MT-07 | TIME | Time views | src/pages/TimePage.tsx | internal tab/view handlers | local state | tauriClient + local data | SAVE_OR_SNAPSHOT | vues temps cohérentes | Non en profondeur | UNVERIFIED | Oui |
| MT-08 | DEV | Diagnostics and actions | src/pages/DevPage.tsx | page loaders/actions | local state | tauriClient + feature hooks | DIAGNOSTIC_SERVICE | résultats diagnostics véridiques | Non en profondeur | UNVERIFIED | Oui |
| MT-09 | ADMIN | Admin load/import | src/features/admin/AdminPage.tsx | lazy loaders | activeTab | lazy imports + child pages | NONE | chaque tab charge | Oui | PASS | Non |
| MT-10 | ADMIN | Config write path | src/pages/ConfigurationHub.tsx | setChatRequestDefaults etc. | local config state | tauriClient config commands | CHAT_RUNTIME,SYSTEM_RUNTIME | write canonique suivi d’effet visible | Non | FAIL | Oui |
| MT-11 | ADMIN | Audio device/TTS | src/features/audio-center/AudioCenterPage.tsx | audio actions | audio UI state | audioService / tauriClient | AUDIO_RUNTIME,TTS_ENGINE | test audio/device | Non dans cette session | UNVERIFIED | Oui |
| MT-12 | ADMIN | Governance load | src/features/governance-center/GovernanceCenterPage.tsx | page render | governance view state | governance service | NONE | onglets secrets/politiques/permissions/journal visibles | Oui | PASS | Non |
