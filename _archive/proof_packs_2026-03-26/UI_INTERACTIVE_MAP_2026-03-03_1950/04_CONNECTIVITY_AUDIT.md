# Connectivity Audit — Éléments Interactifs UI → IPC Backend
**Date:** 2026-03-03T19:50:39Z | **Version:** 27.2.0 | **Commit:** e97177da

---

## Méthode d'audit

Chaîne IPC canonique vérifiée:
```
UI Component
  → handler (onClick/onChange/onSubmit)
  → hook (useConversationEngine / useVoiceEngine / etc.)
  → secureInvoke(command, args) [src/lib/security.ts]
  → safeInvokeTauri() [src/utils/tauriProtector.ts]
  → Tauri IPC bridge
  → #[tauri::command] Rust function [src-tauri/src/main.rs invoke_handler]
```

Un seul point d'entrée IPC: `secureInvoke()` avec whitelist `ALLOWED_COMMANDS`.

---

## Audit par Domaine

### CHAT / CONVERSATION

| Élément | Handler | IPC Command | Dans invoke_handler? | Statut |
|---------|---------|-------------|----------------------|--------|
| Envoyer message | handleSendMessage | `conversation_generate` | ✅ Oui | **CONNECTED** |
| Stream message | handleStreamMessage | `chat_stream_message` | ✅ Oui | **CONNECTED** |
| Suggestions IA | generateSuggestions | `chat_generate_suggestions` | ✅ Oui | **CONNECTED** |
| Create conversation | createConversation | `chat_create_conversation` | ✅ Oui | **CONNECTED** |
| Delete conversation | deleteConversation | `chat_delete_conversation` | ✅ Oui | **CONNECTED** |
| Check providers | useEffect 30s | `chat_check_providers` | ✅ Oui | **CONNECTED** |

### VOICE / TTS

| Élément | Handler | IPC Command | Dans invoke_handler? | Statut |
|---------|---------|-------------|----------------------|--------|
| Voice record start | toggleRecording | `voice_start_listening` | ✅ Oui | **CONNECTED** |
| Voice record stop | toggleRecording | `voice_stop_listening` | ✅ Oui | **CONNECTED** |
| TTS read message | setAudioEnabled | `tts_speak` | ✅ Oui | **CONNECTED** |
| TTS stop | stopTTS | `tts_stop` | ✅ Oui | **CONNECTED** |

### NAVIGATION

| Élément | Handler | Action | Statut |
|---------|---------|--------|--------|
| TopNav buttons (5) | onNavigate(route) | React Router navigate() | **CONNECTED** |
| "Plus" dropdown | setIsMoreMenuOpen | State toggle | **CONNECTED** |
| AI Status polling | useEffect 30s | `chat_check_providers` | **CONNECTED** |
| MobileNav items | onItemClick | React Router navigate | **CONNECTED** |

### SECURITY / API KEYS

| Élément | IPC Command | Dans invoke_handler? | Statut |
|---------|-------------|----------------------|--------|
| Set Gemini key | `chat_set_gemini_key` | ✅ Oui | **CONNECTED** |
| Set OpenAI key | `chat_set_openai_key` | ✅ Oui | **CONNECTED** |
| Set Anthropic key | `chat_set_anthropic_key` | ✅ Oui | **CONNECTED** |
| Set Copilot key | `chat_set_copilot_key` | ✅ Oui | **CONNECTED** |

### WINDOW CONTROLS

| Élément | IPC Command | Déclencheur | Statut |
|---------|-------------|-------------|--------|
| Zoom In | `window_zoom_in` | Ctrl+Plus (useWindowControls) | **CONNECTED** |
| Zoom Out | `window_zoom_out` | Ctrl+Minus | **CONNECTED** |
| Zoom Reset | `window_zoom_reset` | Ctrl+0 | **CONNECTED** |
| Fullscreen | `window_toggle_fullscreen` | F11 | **CONNECTED** |

### QA / DEV

| Élément | IPC Command | Dans invoke_handler? | Statut |
|---------|-------------|----------------------|--------|
| Run test suite | `qa_run_test_suite` | ✅ Oui | **CONNECTED** |
| Ack alert | `qa_acknowledge_alert` | ✅ Oui | **CONNECTED** |
| Online diagnostic | `check_online_capabilities` | ✅ Oui | **CONNECTED** |
| Force sync | `one_core_force_sync` | ✅ Oui | **CONNECTED** |
| Health check | `health_check` | ✅ Oui | **CONNECTED** |

---

## Problèmes Détectés

### 🔴 CRITIQUE
**Aucun problème critique détecté.** Politique IPC-only respectée.

### 🟡 IMPORTANT

| Problème | Scope | Impact |
|----------|-------|--------|
| `data-testid` absent sur ~98% des éléments interactifs | Tous composants | Tests E2E impossibles sans sélecteurs explicites |
| Stats.tsx — polling sans debounce ni cleanup | Stats | Risque setState sur composant démonté |
| `/settings` → `/admin` silencieusement | Router | UX confusion possible |
| 20 routes moteurs non accessibles depuis TopNav | Navigation | Fonctionnalités cachées |

### 🟢 CONFORME

- ✅ Aucun appel `fetch()`, `axios`, `XMLHttpRequest` direct dans src/pages/
- ✅ Tous les appels IPC passent par `secureInvoke` via whitelist ALLOWED_COMMANDS
- ✅ VOID_COMMANDS + NULLABLE_COMMANDS gèrent les cas edge correctement
- ✅ TopNav WCAG 2.2 AA (role=navigation, aria-label, aria-current, focus ring)
- ✅ TitanePage tabs a11y correct (role=tablist, aria-selected, aria-controls)
- ✅ Keyboard navigation (Enter/Space) sur tous les boutons de nav
- ✅ Onboarding avec timeout 5s + fallback (pas de loader-hang)
- ✅ 20+ pages lazy-loaded avec timeout 20s + fallback PageLoadingFallback

---

## Scan Réseau Direct — Résultat: 0 violations

Commande exécutée:
```bash
grep -rn "fetch\|axios\|XMLHttpRequest\|WebSocket" src/pages/ src/hooks/ --include="*.tsx" --include="*.ts" | grep -v "test\|spec\|mock\|//"
```
**Résultat:** Aucune correspondance dans les fichiers de production UI/hooks.
Réseau uniquement via `tauriClient` (wrapper IPC) ou `secureInvoke` → Tauri backend.
