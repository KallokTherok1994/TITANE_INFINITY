# 02_SCOPE.md — Périmètre des corrections

## Findings traités

| ID | Priorité | Fichier | Description | Statut |
|----|----------|---------|-------------|--------|
| RV-001 | P1 | src/engines/selfHealing/selfHealingEngine.ts | I/O (safeInvoke/queryOllama) dans Ring2 → extrait vers Ring3 | CORRIGÉ |
| RV-002 | P1 | src/engines/cognitive/cognitiveLayoutIntegrations.ts | tauriClient dans Ring2 → déplacé vers Ring3 | CORRIGÉ |
| IPC-CANON-001 | P2 | src-tauri/src/conversation_engine/commands.rs | champ `ok` absent dans conversation_generate | CORRIGÉ |
| SEC-001 | P2 | src-tauri/tauri.conf.json | CSP img-src inclut `https:` | CORRIGÉ |
| SEC-002 | P2 | src-tauri/src/services/db_service.rs | Mutex lock().unwrap() → expect() | CORRIGÉ |
| CHAT-01 | P2 | src/components/sections/ConversationSection.tsx | textarea non désactivé pendant envoi | DÉJÀ CORRIGÉ (disabled={isLoading} présent) |
