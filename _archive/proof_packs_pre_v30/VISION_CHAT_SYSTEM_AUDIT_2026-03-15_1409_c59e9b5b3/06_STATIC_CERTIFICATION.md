# CERTIFICATION STATIQUE L1 — EXISTENCE

## Chaîne A — Caméra

| Composant | Fichier | Présent | Note |
|-----------|---------|---------|------|
| Page UI caméra | src/pages/CameraPage.tsx | ✅ | Complète avec jauges |
| Store Zustand vision | src/stores/useVisionStore.ts | ✅ | getUserMedia implémenté |
| Preview Component | src/components/vision/CameraPreview.tsx | ✅ | |
| Types vision affect | src/types/visionAffect.ts | ✅ | |
| requestCameraPermission() | useVisionStore.ts:~381 | ✅ | MediaAPI browser |
| startCamera() | useVisionStore.ts:~433 | ✅ | navigator.mediaDevices |
| stopCamera() | useVisionStore.ts:~491 | ✅ | |
| switchCamera() | useVisionStore.ts:~510 | ✅ | |
| Backend Tauri camera command | ABSENT | ❌ | Aucune commande Tauri caméra |

**L1 Verdict chaîne A : PARTIAL** — Frontend complet, aucun backend Tauri pour caméra.

## Chaîne B — Périphériques vidéo

| Composant | Fichier | Présent |
|-----------|---------|---------|
| enumerateDevices() | useVisionStore.ts (3 occurrences) | ✅ |
| availableDevices state | useVisionStore.ts | ✅ |
| refreshDevices() | useVisionStore.ts:~515 | ✅ |
| Tauri command enumerate | ABSENT | ❌ |

**L1 Verdict chaîne B : PARTIAL** — Énumération via MediaAPI browser uniquement.

## Chaîne C — Vision / Analyse frames

| Composant | Fichier | Présent | Note |
|-----------|---------|---------|------|
| VisionEngine Rust | src-tauri/src/multimodal/vision.rs | ✅ | Module fichier présent |
| analyze_image command | src-tauri/src/multimodal/commands.rs | ✅ | Défini mais non enregistré |
| Module multimodal déclaré | src-tauri/src/lib.rs:~319 | ❌ | COMMENTÉ |
| analyze_image dans invoke_handler | src-tauri/src/main.rs | ❌ | Absent du handler |
| MediaPipe frontend | ABSENT | ❌ | Aucun import npm MediaPipe |
| updateLandmarks() setter | useVisionStore.ts | ✅ | Setter seul, jamais appelé |

**L1 Verdict chaîne C : FAIL** — Fichiers présents mais chaîne morte. Module désactivé.

## Chaîne D — Corps / Énergie

| Composant | Fichier | Présent | Note |
|-----------|---------|---------|------|
| BodyLanguageState type | src/types/visionAffect.ts:~162 | ✅ | |
| AffectEstimationState type | src/types/visionAffect.ts:~214 | ✅ | |
| getDefaultBodyLanguageState() | visionAffect.ts:~182 | ✅ | **Retourne 0.5 constant** |
| getDefaultAffectEstimationState() | visionAffect.ts:~274 | ✅ | **Retourne 'medium' constant** |
| Algorithme calcul corps | ABSENT | ❌ | Aucun code calcul |
| Algorithme calcul énergie | ABSENT | ❌ | Aucun code calcul |
| Modèle ML (MediaPipe/ONNX) | ABSENT | ❌ | Feature onnx inactive |
| UI jauges dans CameraPage | src/pages/CameraPage.tsx:~268-316 | ✅ | **Affiche les défauts statiques** |

**L1 Verdict chaîne D : FAIL** — Types et UI présents, aucun calcul réel, aucun modèle.

## Chaîne E — Chat IA

| Composant | Fichier | Présent | Note |
|-----------|---------|---------|------|
| conversation_generate command | conversation_engine/commands.rs:~177 | ✅ | |
| Enregistrement invoke_handler | src-tauri/src/main.rs:~1272 | ✅ | |
| ConversationEngineState | src-tauri/src/conversation_engine/ | ✅ | |
| AIRouter (Ollama + Gemini) | src-tauri/src/ai/router | ✅ | |
| ChatOrchestratorState | src-tauri/src/overdrive/chat_orchestrator.rs | ✅ | |
| ConversationMemory (SQLite) | src-tauri/src/conversation_engine/ | ✅ | rusqlite bundled |
| send_message | src-tauri/src/commands/chat.rs | ✅ | **STUB hardcodé** |
| ChatPage UI rendu messages | src/pages/ChatPage.tsx:~83-87 | ❌ | Commentaire "will be rendered here" |
| ChatProviderSelector | src/features/chat/ChatProviderSelector.tsx | ✅ | |

**L1 Verdict chaîne E : PARTIAL** — Backend chat substantiel, UI incomplète.

## Chaîne F — Cohérence

| Assertion UI | Réalité backend | Cohérent |
|--------------|----------------|---------|
| Énergie = 'medium' affiché | Défaut statique, estimationCount=0 | ❌ FAIL |
| Posture = 50% affiché | Défaut 0.5, confidence=0 | ❌ FAIL |
| Chat "fonctionnel" | Interface vide, send_message stub | ❌ FAIL |
| Vision "locale" | Pas de traitement frame, module mort | ❌ PARTIAL |
| Providers disponibles | Dépend des clés et d'Ollama | ❌ BLOCKED_RUNTIME |

**L1 Verdict chaîne F : FAIL** — Incohérences critiques affiché/calculé.
