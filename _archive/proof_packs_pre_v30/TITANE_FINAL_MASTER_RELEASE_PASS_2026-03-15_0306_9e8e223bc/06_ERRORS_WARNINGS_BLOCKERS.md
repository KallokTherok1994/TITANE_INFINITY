# 06 ERRORS WARNINGS BLOCKERS

## ERREURS CRITIQUES RESTANTES
Aucune.

## ERREURS MAJEURES RESTANTES
M1 — VectorStoreClient invoque vector_store_init/insert/search mais Tauri expose memory_v2_store/memory_v2_recall.
  → Mismatch IPC. ConversationManager non branché sur Chat.tsx. DISPLAY_ONLY / hors runtime actif.
  → Chemin actif = conversationEngine.ts → persistentMemoryGetContext (CORRECT).

## ERREURS MINEURES
m1 — Projects.tsx : données hardcodées (MOCK_PROJECTS) sans chargement Tauri → marqué illustratif.
m2 — MemoryTreeViewer : compteurs ~session/~intermédiaire illustratifs → accepté DISPLAY_ONLY.
m3 — memoryStore.ts Zustand (snapshots/logs/timeline via backendV17) : domaine séparé, non connecté à l'UI principale.
m4 — useMemoryCore / Memory.tsx : AES-256 séparé de usePersistentMemory → DISPLAY_ONLY, pas de conflit.
m5 — SelfHealingDashboard : MOCK_HEALTH/STATE/PREDICTION → déjà marqué "Mode Demo" dans UI.

## WARNINGS REACT POTENTIELS (non visibles sans runtime)
W1 — Aucun warning TypeScript détecté (TSC=0).
W2 — Aucun pattern d'update loop détecté dans les surfaces auditées.

## BLOCAGES
Aucun bloqueur CRITICAL.
