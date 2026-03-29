# SYNC_CONTRACT_RUNTIME

| Domain | Canonical owner | Runtime proof | Status | Notes |
| --- | --- | --- | --- | --- |
| Chat turns | ConversationEngine | events table append | PROVEN | events appended on canary runs |
| Orchestrator decisions | ConversationEngine | provider_decisions table append | PROVEN | decision entries present |
| Modules/engines | Module emitters | no runtime evidence | PARTIAL | requires explicit event emission proof |
| External sync (Option1SyncService) | Sync layer | env config missing | BLOCKED | no TURSO config detected |
| Derived views | UI/Memory panels | memory UI evidence | PARTIAL | derived view ok, not canonical |
