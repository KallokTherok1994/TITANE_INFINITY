Findings

Root cause
1) The offline text is emitted by the backend conversation engine on timeout.
   - src-tauri/src/conversation_engine/mod.rs: create_offline_response() (now timeout fallback) returns
     "Reponse en mode hors ligne..." with provider_used=offline and ReasonCode::Timeout.
2) The timeout guard is in process_message with a hard timeout.
   - src-tauri/src/conversation_engine/mod.rs: process_message wraps process_message_internal in timeout(...).
3) The frontend consumes conversation_generate content directly.
   - src/services/conversationEngine.ts: uses tauriClient.conversationGenerate(), then returns assistant_message.
   - src/hooks/useChat.ts: displays content from backend without overriding offline text.

Evidence (providers ready at boot)
- /tmp/titane-v27-runtime.log
  - "Chat orchestrator initialized (API keys will be loaded in setup)"
  - "ChatOrchestrator ... Gemini/OpenAI/Anthropic API key loaded from SecureSecretsEngine"
  - "Chat orchestrator: API keys bootstrapped from SecureSecretsEngine"

Call chain (UI -> backend)
UI useChat -> conversationEngine.processMessage -> tauriClient.conversationGenerate
-> conversation_engine::process_message -> timeout -> offline response

Implication
- When the timeout triggers while providers are ready, the offline text is shown even though online is available.
- This is a false offline message triggered by the timeout path, not by provider readiness.
 
Source de verite
 - ProviderDecisionMeta (meta) porte mode + reason_code, mais le texte offline etait fixe dans le backend.
 - Un contrat decisionnel explicite est necessaire pour eviter toute re-ecriture UI.

---

Harvest Discovery (append-only)
- Timestamp campagne: 2026-02-20T12:34:36Z
- Fichier discovery: runs/DISCOVERY/PHASE_A.txt
- Localisation des marqueurs (A2):
   - src-tauri/src/conversation_engine/mod.rs:244 -> [NO_FALSE_OFFLINE] CRITICAL_CONTRADICTION
   - src-tauri/src/conversation_engine/mod.rs:250 -> [CHAT_DECISION] ... TIMEOUT
   - src-tauri/src/conversation_engine/mod.rs:359 -> "Réponse en mode hors ligne..."
   - src-tauri/src/conversation_engine/commands.rs:137 -> [CHAT_DECISION] ... reason_code

WDIO campaign blocker (append-only)
- Driver IPC direct: WRY/WebDriver retourne `execute/sync` et échoue sur résultat async (`Could not parse script result`).
- Driver UI: aucun sélecteur chat trouvé dans la session desktop testée (`Chat selectors not found`).
- Impact: impossibilité actuelle de produire une preuve S1/S2/S3 x3 avec `CHAT_DECISION` runtime dans cet environnement.

WDIO campaign blocker v3 (append-only)
- Diagnostic DOM collecté pendant le run:
   - `href=tauri://localhost/#/chat`

---

Unexpected Rust changes audit (append-only)
- src-tauri/src/audio/asr.rs
   - Type: import cleanup (Path removed)
   - Taille: +1 -1
   - Hypothese: nettoyage auto-format/unused import
   - Risque: runtime (faible)
- src-tauri/src/audio/capture.rs
   - Type: trait impl unsafe (Send) + import removal
   - Taille: +5 -1
   - Hypothese: satisfaire contraintes Send en handlers
   - Risque: runtime/safety (eleve si invariants faux)
- src-tauri/src/audio/mod.rs
   - Type: feature gating pour module commands + re-export
   - Taille: +2 -0
   - Hypothese: ajustement build mock
   - Risque: runtime/build (moyen)
- src-tauri/src/audio/streaming_engine.rs
   - Type: refactor borrow/lock + imports
   - Taille: +6 -6
   - Hypothese: correction compilation/borrow
   - Risque: runtime audio (moyen)
- src-tauri/src/audio/vad.rs
   - Type: ajout API VADResult + detect()
   - Taille: +26 -1
   - Hypothese: besoin pour streaming_engine
   - Risque: runtime audio (moyen)
- src-tauri/src/audio/whisper_streaming.rs
   - Type: emission events (emit_all -> emit), visibilite enum, clones pour spawn_blocking
   - Taille: +10 -8
   - Hypothese: correction ownership + event scope
   - Risque: runtime/UI events (moyen)
- src-tauri/src/config/presets.rs
   - Type: logique config (gemini_configured depuis env)
   - Taille: +4 -1
   - Hypothese: reflet etat API key
   - Risque: runtime/network gating (moyen)
- src-tauri/src/lib.rs
   - Type: re-export API compat
   - Taille: +2 -0
   - Hypothese: exposition API utilitaires
   - Risque: runtime (faible)
- src-tauri/src/main.rs
   - Type: wiring module audio/capture + re-export types
   - Taille: +6 -0
   - Hypothese: integration audio capture
   - Risque: runtime/build (moyen)
- src-tauri/src/security/shell_guard.rs
   - Type: derive Clone
   - Taille: +1 -0
   - Hypothese: besoin clonage pour spawn_blocking
   - Risque: security/runtime (faible)
   - `title=TITANE∞ v26.3.0 - Cognitive Operating System`
   - `bodyTextHead` contient uniquement fallback statique: `⚡ TITANE∞ Chargement...`
   - `testIds=[]`, `textareas=[]`
- Lecture root cause probable:
   - le shell WRY reste sur le fallback de `index.html` (React non monté), donc aucun composant `ChatBubble`/`ChatInput` n'existe au runtime E2E.
   - le patch des sélecteurs est effectif mais non observable tant que le bootstrap frontend n'aboutit pas.

WDIO campaign blocker v4 (append-only)
- Diagnostic DOM enrichi:
  - `titaneBoot.errors` contient `ReferenceError: Cannot access uninitialized variable.`
  - Source JS: `tauri://localhost/assets/services-ai-OxGOyH_O.js` (line 2)
- Conclusion: le bundle `services-ai` échoue au chargement (erreur JS bloquante), ce qui empêche le montage React.

---

Unexpected Rust changes repeat (append-only)
- Fichiers detectes:
   - src-tauri/src/config/mod.rs
   - src-tauri/src/conversation_engine/commands.rs
   - src-tauri/src/conversation_engine/meta_accumulator.rs
   - src-tauri/src/conversation_engine/mod.rs
- Evidence:
   - runs/_unexpected_changes_rust_repeat.diff
   - runs/_unexpected_changes_rust_repeat_files.txt
   - runs/_unexpected_changes_rust_repeat_post_status.txt
- Action: revert vers HEAD sur ces fichiers (post-status sans ces fichiers).

Unexpected Rust reappearance source scan (append-only)
- git config: filtres LFS uniquement (clean/smudge/process)
- .gitattributes: LFS + eol rules
- hooks/lifecycle: aucune trace directe dans package.json/.husky (voir runs/_unexpected_changes_rust_repeat_sources.txt)
- Conclusion factuelle: cause automatique non identifiee (UNKNOWN)
