# 09_DIFF_FILES.md — Fichiers modifiés

| Fichier | Modification |
|---------|-------------|
| src-tauri/tauri.conf.json | SEC-001: retire `https:` de img-src CSP |
| src-tauri/src/services/db_service.rs | SEC-002: 9× lock().unwrap() → lock().expect("db_service: Mutex poisonné") |
| src-tauri/src/conversation_engine/commands.rs | IPC-CANON-001: ajoute "ok": true dans 4 retours JSON |
| src/engines/selfHealing/selfHealingEngine.ts | RV-001: engine rendu pur (suppression imports safeInvoke/queryOllama + fonctions I/O) |
| src/services/selfHealing/selfHealingIOAdapter.ts | RV-001: NOUVEAU - adapter Ring3 avec toutes les fonctions I/O + runSelfHealing |
| src/engines/cognitive/cognitiveLayoutIntegrations.ts | RV-002: SUPPRIMÉ de Ring2 |
| src/services/cognitive/cognitiveLayoutIntegrations.ts | RV-002: AJOUTÉ dans Ring3 |
| src/services/selfHealing/selfHealingService.ts | RV-001: import runSelfHealing depuis IOAdapter (Ring3) |
| src/modules/devSudo/devSudoBuiltins.ts | RV-001: import runSelfHealing depuis IOAdapter (Ring3) |
| src/core/healing/AutoHealEngine.ts | RV-001: import runSelfHealing depuis IOAdapter (Ring3) |
| src/__tests__/architecture/engine-isolation.test.ts | RV-002: retire exceptions cognitiveLayoutIntegrations (fichier supprimé du Ring2) |
