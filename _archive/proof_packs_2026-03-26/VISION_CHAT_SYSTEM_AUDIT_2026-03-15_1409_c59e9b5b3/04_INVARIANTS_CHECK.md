# VÉRIFICATION DES INVARIANTS ARCHITECTURAUX

## Invariant 1 : Frontend ne fait PAS de réseau direct (G_FRONTEND_NO_WEB)
**PASS** — Le frontend n'utilise pas fetch/axios/XMLHttpRequest vers des LLM cloud.
Tous les appels IA passent par `invoke()` → Tauri IPC → Rust → reqwest.
Exception documentée : `navigator.mediaDevices` (API browser locale, pas réseau externe).

Preuve : rg search "fetch\(|axios\(" dans src/ — aucun résultat vers API cloud LLM.

## Invariant 2 : Une seule porte Tauri IPC (G_TAURI_ONE_DOOR)
**PARTIAL** — Chat et singularity via IPC correct.
⚠️ DÉVIATION : La caméra utilise directement `navigator.mediaDevices.getUserMedia()`
sans passer par une Tauri command. Ceci est techniquement valide dans Tauri v2
(WebView a accès aux APIs média du système), mais constitue une déviation architecturale
documentée : aucun contrôle Rust sur les frames capturées.

## Invariant 3 : Correspondance command → handler enregistré (G_COMMAND_HANDLER_MATCH)
**FAIL**
- ✅ `conversation_generate` : défini + enregistré (main.rs:1272)
- ✅ `chat_stream_message` : défini + enregistré
- ✅ `send_message` : enregistré MAIS implémentation = STUB (chat.rs:40)
- ❌ `analyze_image` : défini dans multimodal/commands.rs mais NON enregistré
  (module commenté dans lib.rs ligne 319)

## Invariant 4 : Vérité affichée = vérité calculée (G_ENERGY_CLAIM_TRUTH / G_BODY_ANALYSIS_TRUTH)
**FAIL — VIOLATION CRITIQUE**
- ❌ Body language scores : postureScore=0.5, movementScore=0.5 — statiques, jamais calculés
- ❌ AffectEstimation : visualEnergyLevel='medium' — constante, estimationCount=0 toujours
- ❌ ChatPage.tsx : interface de messages absente (commentaire "Chat interface will be rendered here")

## Invariant 5 : Modules déclarés = modules actifs
**PARTIAL**
- ⚠️ multimodal : commenté dans lib.rs ligne 319 ("TEMPORARILY COMMENTED: API incomplete")
- ⚠️ feature "mock" active → legacy_ai_bridge retourne "[mock] {prompt}"
- ⚠️ meta_energy, agi_core commentés avec "API incomplete"

## Invariant 6 : IPC payload contract { ok, content, error }
**PASS** — Les commandes principales respectent le contrat IPC.
- `conversation_generate` : retourne ConversationResponse structuré
- `send_message` : retourne `{ "ok": true, "content": "response", "error": null }` (stub mais conforme format)
- Pas de NaN ou null non signé dans les types inspectés

## Invariant 7 : Fallback local obligatoire (Online-first governed)
**PARTIAL** — AIRouter implémente local(Ollama)→cloud(Gemini/OpenAI) fallback.
Non vérifiable sans runtime actif.
