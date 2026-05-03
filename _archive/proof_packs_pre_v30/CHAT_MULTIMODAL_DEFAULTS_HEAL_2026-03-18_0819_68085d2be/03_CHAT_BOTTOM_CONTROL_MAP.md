# 03 — CHAT BOTTOM CONTROL MAP

Source: `src/components/chat/ChatToolbar.tsx` + `src/components/chat/ChatInput.tsx`

| Control | Icon | Tooltip | Handler | Backend Required | OS Device | Truth Status | Notes |
|---------|------|---------|---------|-----------------|-----------|--------------|-------|
| File Import | 📁 | Import fichier | handleFileImportClick → input[file] | No | No | PROVEN_RUNTIME | Works via file input |
| Screen Capture | 📷screen | Capture écran | handleScreenCapture → getDisplayMedia | No (WebView) | No | PARTIAL_CHAIN | CSP allows media-src blob: — WebKitGTK may limit |
| Image Upload | 🖼️ | Import image | handleImageUploadClick → input[file] | No | No | PROVEN_RUNTIME | Works via file input |
| Camera Capture | 📸 | Prendre photo | handleCameraCapture → getUserMedia | No (WebView) | Camera | BLOCKED_BY_OS | No /dev/video* devices |
| Camera Live | 🎥/🎥off | Caméra live | handleCameraLiveToggle → VisionStore | Yes (stub) | Camera | BLOCKED_BY_OS | camera_start = stub; no hardware |
| Dictation | 🎤 | Dictée vocale | handleDictationToggle → voiceEngine | Yes (audio chain) | Mic | DEGRADED_HONEST* | Bug fixed: hasMicrophone() false-neg |
| Audio Record | 🔴 | Enregistrement | handleAudioRecordToggle → getUserMedia | No (WebView) | Mic | DEGRADED_HONEST* | Same hasMicrophone() fix |
| Audio Transcription | 📝 | Transcription | handleAudioTranscriptionClick → input[audio] | No | No | PROVEN_RUNTIME | File-based, no device needed |
| Audio Conversation | 🔊 | Mode conversation | handleAudioConversationToggle | Yes (audio chain) | Mic | DEGRADED_HONEST* | Same hasMicrophone() fix |
| Send | ➤/🎤 | Envoyer | handleSend | Yes (chat engine) | No | PROVEN_RUNTIME | Core chat works |
| Voice Mode (ChatInput) | 🎤 | Mode vocal | handleVoiceToggle | Yes (voice engine) | Mic | DEGRADED_HONEST* | Same hasMicrophone() fix |

*DEGRADED_HONEST → was showing false "no microphone" due to label-check bug. After Patch 1, shows real availability.

## LANE A STATUS
- Dead controls: NONE (all have real handlers)
- Controls with false-negative blocking: 4 (dictation, audio record, audio conv, camera)
- Camera: legitimately BLOCKED_BY_OS (no hardware) — honest
- Screen capture: PARTIAL_CHAIN (WebKitGTK desktop may restrict getDisplayMedia)
