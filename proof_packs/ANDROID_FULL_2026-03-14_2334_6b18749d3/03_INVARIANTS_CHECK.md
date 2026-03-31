# 03_INVARIANTS_CHECK.md

## I1. Tauri-only
STATUS: PASS (desktop) | N/A (Android — not yet built)
- `npm run preview` returns error: TAURI-ONLY MODE ✓
- `npm run start` returns error: TAURI-ONLY MODE ✓
- httpClient.ts: guards isTauriRuntime() before any real HTTP call ✓

## I2. Online-first gouverné (UI no direct network)
STATUS: PASS (desktop) | N/A (Android)
- httpClient.ts: réseau direct bloqué hors Tauri runtime ✓
- Ollama: appels via Rust backend (ollama.rs) ✓
- Gemini: appels via Rust backend ✓
- Violations connues: aucune trouvée en audit grep ✓

## I3. Fallback réel
STATUS: UNKNOWN — non testé en contexte Android
- Provider fallback: présent dans chat_engine/providers.rs (non vérifié en profondeur)
- Ollama indisponible sur Android localhost: endpoint configurable via OLLAMA_BASE_URL ✓
- État provider retourné via chat_get_providers_status IPC command ✓

## I4. 4-Ring strict
STATUS: PASS (audit superficiel)
- R1 = Types (src/types/) ✓
- R2 = Engines (src/core/, src/engines/) ✓
- R3 = Services backend (src-tauri/src/) ✓
- R4 = UI (src/components/, src/modules/) ✓
- Inversions: non détectées à l'audit grep

## I5. IPC canonique {ok, content, error}
STATUS: QUALIFIED (partiel)
- Contrat utilisé dans les types IPC ✓
- Uniformité runtime: non vérifiée exhaustivement
- Timeouts: présents dans certains handlers, non uniformes — UNKNOWN global

## I6. One Door Network
STATUS: PASS (desktop)
- Toutes requêtes HTTP via reqwest (Rust backend) ✓
- Ollama: http://127.0.0.1:11434 via ollama.rs ✓
- Gemini: https://generativelanguage.googleapis.com via Rust ✓

## I7. Patch minimal
STATUS: PASS (cette session)
- devops.rs: cfg guard + env-based path (2 lignes + 4 lignes) ✓
- main.rs: 1 ligne ajoutée (#[cfg(not(target_os = "android"))]) ✓

## I8. No-skips
STATUS: BLOCKED (Android build impossible, vérifications Android non exécutables)

## I9. No-unbounded
STATUS: UNKNOWN — audit non effectué exhaustivement

## I10. Android ne justifie aucune trahison architecturale
STATUS: PASS (aucune trahison effectuée)

## STOPLINES ACTIVES
- STOPLINE #4: CORRIGÉE (devops.rs) ✓
- STOPLINE #5: DOCUMENTÉE (audio/cpal — action différée à init Android)
- STOPLINE #8: ACTIVE (build Android non produit — environnement bloquant)
