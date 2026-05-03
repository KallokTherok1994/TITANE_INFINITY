# SCOPE D'AUDIT — TITANE∞ VISION & CHAT

## Périmètre audité

### Chemins frontend (src/)
- src/pages/CameraPage.tsx
- src/pages/ChatPage.tsx
- src/stores/useVisionStore.ts
- src/components/vision/CameraPreview.tsx
- src/features/vision/
- src/features/chat/
- src/services/tauriCommands.ts
- src/services/orchestration/UnifiedOrchestrator.ts
- src/types/visionAffect.ts

### Chemins backend (src-tauri/src/)
- src-tauri/src/main.rs (invoke_handler — enregistrement des commandes)
- src-tauri/src/lib.rs (modules déclarés)
- src-tauri/src/commands/chat.rs
- src-tauri/src/commands/chat_generate_commands.rs
- src-tauri/src/conversation_engine/commands.rs
- src-tauri/src/overdrive/chat_orchestrator.rs
- src-tauri/src/multimodal/vision.rs
- src-tauri/src/multimodal/commands.rs
- src-tauri/src/security/
- src-tauri/capabilities/
- src-tauri/Cargo.toml (feature flags)

## Mutations autorisées
AUCUNE — audit en lecture seule. Aucun patch appliqué.

## Mutations interdites
Tous les fichiers source, configuration, tests, build.

## Hypothèses matérielles
- Caméra : INCONNUE — aucun runtime actif, classification BLOCKED_HARDWARE
- Feature `full` : INACTIVE → modules complets non compilés
- Feature `mock` : ACTIVE → stubs compilés dans legacy_ai_bridge
- Feature `onnx` : INACTIVE → ONNX Runtime non activé → VisionEngine ONNX absent
- Clés API (Gemini/OpenAI/Anthropic) : NON VÉRIFIÉES (SecureSecretsEngine chiffré)
- Ollama : NON VÉRIFIÉ (service non actif pendant l'audit)

## Contexte d'exécution
- Mode : Desktop Tauri (Linux — Ubuntu/Debian selon uname)
- Build actif : NON (dev mode — cargo check PASS, pas de build tauri)
- Packaged : NON
- Node.js : v18.19.1 (INCOMPATIBLE — requis >=20.0.0 → pnpm bloqué)

## Disponibilité caméra réelle
**NON VÉRIFIÉE** — runtime non actif. Classified BLOCKED_HARDWARE.

## Contexte permission
**NON VÉRIFIÉ** — aucun runtime WebView actif pour déclencher getUserMedia().

## Clés API disponibles
**NON VÉRIFIÉES** — SecureSecretsEngine utilise AES-256-GCM avec clés chiffrées.

## Chaînes critiques auditées
- CHAIN A : Caméra (permission → flux → preview)
- CHAIN B : Périphériques vidéo (énumération → sélection → label)
- CHAIN C : Pipeline Vision (frames → analyse → résultat)
- CHAIN D : Corps/Énergie (body language → affect estimation)
- CHAIN E : Chat IA (message → provider → réponse → mémoire)
- CHAIN F : Cohérence (affiché = calculé)
