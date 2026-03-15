diff --git a/scripts/autoheal/autoheal_rules.jsonl b/scripts/autoheal/autoheal_rules.jsonl
index 8b59722aa..180d2af24 100644
--- a/scripts/autoheal/autoheal_rules.jsonl
+++ b/scripts/autoheal/autoheal_rules.jsonl
@@ -264,3 +264,4 @@
 {"id": "AH-2026-03-15-VISION-001", "date": "2026-03-15", "scope": ["src/pages/CameraPage.tsx", "vision", "affect", "body-language"], "symptom": "CameraPage affichait jauges Energie/Tension/Engagement/Posture/Mouvement comme mesures réelles alors que estimationCount===0 et landmarksDetected===false — valeurs statiques 'medium' et 0.5 présentées comme calculées", "root_cause": "Absence de condition sur estimationCount>0 et landmarksDetected avant affichage des jauges. Aucun modèle ML actif (ONNX inactive, MediaPipe absent). Défaut D04/D03 audit VISION_CHAT_SYSTEM_AUDIT_2026-03-15.", "fix": "Conditionné affichage jauges affect sur affectEstimation.estimationCount > 0, affichage body stats sur bodyLanguage.landmarksDetected. Disclaimer 'en développement' affiché quand modèle absent.", "signature": "VISION_AUDIT 2026-03-15 — estimationCount===0 avec jauges affichées", "verification": "grep -n 'estimationCount > 0' src/pages/CameraPage.tsx && grep -n 'landmarksDetected' src/pages/CameraPage.tsx", "prevention": "bash scripts/autoheal/detect_recurrence.sh && bash scripts/verify_instructions.sh", "prevention_test": "grep -c 'estimationCount > 0' src/pages/CameraPage.tsx | grep -q 1", "commands": ["bash scripts/autoheal/detect_recurrence.sh", "bash scripts/verify_instructions.sh"], "files_changed": ["src/pages/CameraPage.tsx", "scripts/autoheal/autoheal_rules.jsonl"], "rollback": "git restore -- src/pages/CameraPage.tsx"}
 {"id": "AH-2026-03-15-CHAT-001", "date": "2026-03-15", "scope": ["src-tauri/src/commands/chat.rs", "send_message", "ipc", "stub"], "symptom": "send_message retournait Ok({ok:true,content:'response'}) hardcodé pour tout input — stub silencieux présentant un succès fictif à l'utilisateur", "root_cause": "Commande jamais implémentée, FIXME laissé en stub. Défaut D01 audit VISION_CHAT_SYSTEM_AUDIT_2026-03-15.", "fix": "Remplacé Ok(stub) par Err('not implemented — use conversation_generate') pour signaler explicitement l'absence d'implémentation sans masquer l'échec.", "signature": "CHAT_AUDIT 2026-03-15 — send_message retourne Ok hardcodé", "verification": "grep -n 'not implemented' src-tauri/src/commands/chat.rs && cargo check --manifest-path=src-tauri/Cargo.toml", "prevention": "bash scripts/autoheal/detect_recurrence.sh && bash scripts/verify_instructions.sh", "prevention_test": "grep -q 'not implemented' src-tauri/src/commands/chat.rs && ! grep -q 'stub response' src-tauri/src/commands/chat.rs", "commands": ["bash scripts/autoheal/detect_recurrence.sh", "bash scripts/verify_instructions.sh"], "files_changed": ["src-tauri/src/commands/chat.rs", "scripts/autoheal/autoheal_rules.jsonl"], "rollback": "git restore -- src-tauri/src/commands/chat.rs"}
 {"id": "AH-2026-03-15-CHAT-002", "date": "2026-03-15", "scope": ["src/pages/ChatPage.tsx", "ChatWindow", "chat-ui"], "symptom": "ChatPage.tsx avait zone messages vide avec commentaire 'Chat interface will be rendered here' — aucun composant de rendu messages monté, UI non fonctionnelle", "root_cause": "Page créée avec sélecteur provider mais ChatWindow jamais monté. Défaut D02 audit VISION_CHAT_SYSTEM_AUDIT_2026-03-15.", "fix": "Import et montage de ChatWindow dans la zone flex-1 overflow-auto. ChatWindow gère messages/input/état via useChat hook autonomement.", "signature": "CHAT_AUDIT 2026-03-15 — ChatPage sans rendu messages", "verification": "grep -n 'ChatWindow' src/pages/ChatPage.tsx", "prevention": "bash scripts/autoheal/detect_recurrence.sh && bash scripts/verify_instructions.sh", "prevention_test": "grep -q \"<ChatWindow\" src/pages/ChatPage.tsx && bash scripts/autoheal/detect_recurrence.sh && bash scripts/verify_instructions.sh", "commands": ["bash scripts/autoheal/detect_recurrence.sh", "bash scripts/verify_instructions.sh"], "files_changed": ["src/pages/ChatPage.tsx", "scripts/autoheal/autoheal_rules.jsonl"], "rollback": "git restore -- src/pages/ChatPage.tsx"}
+{"id": "AH-2026-03-15-IPC-003", "date": "2026-03-15", "scope": "src-tauri/src/main.rs", "symptom": "Tauri IPC command-not-found error on every ChatEngine.generateResponse() call — generate_response defined but absent from generate_handler![]", "defect": "D_NEW_IPC_DEAD_GENERATE", "root_cause": "generate_response registered in mock_commands.rs and chat_engine/commands.rs but never added to generate_handler![] in main.rs — dead IPC primary path for chat engine", "fix": "Added feature-gated registrations: #[cfg(feature=mock)] mock_commands::generate_response + #[cfg(all(not(feature=mock),feature=full))] chat_engine::commands::generate_response in generate_handler![]", "verification": "cargo check EXIT=0 — command now resolvable in handler; runtime proof requires Tauri desktop", "prevention": "Gate/compliance test to verify generate_response presence in generate_handler![] in main.rs", "prevention_test": "grep -q generate_response src-tauri/src/main.rs && bash scripts/autoheal/detect_recurrence.sh && bash scripts/verify_instructions.sh", "commands": ["bash scripts/autoheal/detect_recurrence.sh", "bash scripts/verify_instructions.sh"], "files_changed": ["src-tauri/src/main.rs", "scripts/autoheal/autoheal_rules.jsonl"], "rollback": "git restore -- src-tauri/src/main.rs"}
diff --git a/src-tauri/src/main.rs b/src-tauri/src/main.rs
index 6cf1acb7f..b88a14659 100644
--- a/src-tauri/src/main.rs
+++ b/src-tauri/src/main.rs
@@ -30,6 +30,10 @@ use crate::commands::exp_fusion::ExpFusionState;
 #[cfg(all(not(feature = "mock"), feature = "full"))]
 use titane_infinity::chat_engine;
 
+// mock_commands — generate_response mock stub (feature = "mock")
+#[cfg(feature = "mock")]
+use titane_infinity::mock_commands;
+
 // OMEGA Conversation Engine v19.5.2
 use titane_infinity::conversation_engine;
 
@@ -856,6 +860,8 @@ fn main() {
 
     // EXP FUSION ENGINE (XP/EXP UI)
     let builder = builder.manage(ExpFusionState::new());
+    // NUMERIC TWIN ENGINE — TWINS_AUDIT 2026-03-15 (RC-002 fix)
+    let builder = builder.manage(titane_infinity::numeric_twin::twin_commands::NumericTwinState::default());
 
     builder
         .manage(std::sync::Mutex::new(onboarding::OnboardingState::default()))
@@ -1303,6 +1309,12 @@ fn main() {
             // Core messaging
             send_message,
             ollama_query,
+            // Chat Engine — generate_response primary IPC path
+            // mock build: mock_commands::generate_response; full build: chat_engine::commands::generate_response
+            #[cfg(feature = "mock")]
+            mock_commands::generate_response,
+            #[cfg(all(not(feature = "mock"), feature = "full"))]
+            chat_engine::commands::generate_response,
             // OMEGA Conversation Engine Commands (v19.5.2)
             conversation_engine::commands::create_new_conversation,
             conversation_engine::commands::conversation_generate,
@@ -1935,6 +1947,19 @@ fn main() {
             // Called in audioSelfHeal.ts, handler exists, now allowlisted in audio_tts.json
             audio::commands::get_recording_status,
 
+            // ═══════════════════════════════════════════════════════════════
+            // NUMERIC TWIN COMMANDS — TWINS_AUDIT 2026-03-15 (RC-001 fix)
+            // twin_* IPC suite — requires NumericTwinState managed above
+            // ═══════════════════════════════════════════════════════════════
+            titane_infinity::numeric_twin::twin_commands::twin_get_state,
+            titane_infinity::numeric_twin::twin_commands::twin_get_fusion_index,
+            titane_infinity::numeric_twin::twin_commands::twin_submit_observation,
+            titane_infinity::numeric_twin::twin_commands::twin_apply_evolution,
+            titane_infinity::numeric_twin::twin_commands::twin_validate_sync,
+            titane_infinity::numeric_twin::twin_commands::twin_get_evolution_profile,
+            titane_infinity::numeric_twin::twin_commands::twin_get_identity,
+            titane_infinity::numeric_twin::twin_commands::twin_recalculate_fusion,
+
             // ═══════════════════════════════════════════════════════════════
             // SECURITY — validate_chat_message
             // (AUDIT FIX 2026-03-06 — CONTINUE)
