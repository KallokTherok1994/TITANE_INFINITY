# CERTIFICATION RUNTIME L2/L3 — JOIGNABILITÉ & VÉRITÉ VISIBLE

⚠️ ÉTAT : Runtime Tauri non actif pendant l'audit — certifications L2/L3 inférées ou BLOCKED.
cargo check PASS — code compile. Tests bloqués (Node.js incompatible).

## L2 — Joignabilité (invoke path → backend handler)

### conversation_generate
- invoke path : frontend → invoke('conversation_generate') → Tauri IPC
- Handler enregistré : ✅ main.rs:~1272
- State disponible : ✅ Arc<ConversationEngineState> dans setup()
- AIRouter initialisé : ✅ default_ollama_model="gemma2:2b"
- **L2 Verdict : REACHABLE** (sous réserve Ollama disponible)

### send_message
- invoke path : frontend → invoke('send_message') → Tauri IPC
- Handler enregistré : ✅ main.rs:~1268
- Implémentation : **STUB** → retourne hardcoded `{ ok: true, content: "response" }`
- **L2 Verdict : REACHABLE mais STUB** — chemin joignable, résultat fictif

### chat_stream_message
- invoke path : frontend → invoke('chat_stream_message') → ChatOrchestratorState
- Handler enregistré : ✅
- **L2 Verdict : REACHABLE** (sous réserve runtime actif)

### analyze_image (webcam → vision Rust)
- invoke path : N/A — command NON enregistrée dans invoke_handler
- Module multimodal : commenté dans lib.rs:~319
- **L2 Verdict : NOT REACHABLE** — chemin IPC inexistant

### Caméra (startCamera → getUserMedia)
- Path : useVisionStore.startCamera() → navigator.mediaDevices.getUserMedia()
- Aucun invoke() Tauri utilisé
- **L2 Verdict : BLOCKED_HARDWARE** — nécessite webcam physique + runtime WebView

## L3 — Vérité visible (résultat affiché = résultat calculé)

### conversation_generate
- Backend : ConversationEngineState.process_message() → AIRouter → Ollama/Gemini
- ConversationResponse contient : assistant_message, network_used, reason_code, provider_used
- Méta visible dans la réponse : OUI — champs définis dans les types
- **L3 Verdict : TRUTH_IF_PROVIDER_AVAILABLE** — structure correcte, valeurs dépendent du runtime

### Énergie/Corps (CameraPage jauges)
- Affiché : jauges "Énergie", "Tension", "Engagement" + scores posture/mouvement/stabilité
- Calculé : RIEN — `getDefaultAffectEstimationState()` retourne valeurs constantes
- visualEnergyLevel : toujours 'medium' (50%)
- postureScore : toujours 0.5 (50%)
- estimationCount : toujours 0 (jamais incrémenté)
- confidence : toujours 0
- **L3 Verdict : FAIL — MENSONGE VISIBLE PROUVÉ**

### send_message
- Affiché : `{ "ok": true, "content": "response" }`
- Calculé : hardcoded, aucune logique IA
- **L3 Verdict : FAIL — STUB AFFICHÉ COMME RÉSULTAT RÉEL**

### ChatPage rendu messages
- Affiché : titre + sélecteur provider + zone vide
- Code source : `{/* Chat interface will be rendered here */}`
- **L3 Verdict : FAIL — UI INCOMPLÈTE**

## L4 — Stabilité (reproductible x3)

Toutes les certifications L4 sont **BLOCKED** — nécessitent runtime actif.
Classification : BLOCKED_RUNTIME pour tous les scenarios L4.
