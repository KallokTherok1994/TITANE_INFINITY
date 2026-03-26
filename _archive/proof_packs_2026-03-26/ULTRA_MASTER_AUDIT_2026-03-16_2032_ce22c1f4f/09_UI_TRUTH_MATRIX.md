# UI TRUTH MATRIX

| Surface UI | Données affichées | Source réelle | Fallback éventuel | Risque mensonge | Statut |
|---|---|---|---|---|---|
| Chat principal (messages IA) | Réponse IA | conversation_generate IPC → Ollama/Local | TitaneLocal garantit réponse | ⚠️ PARTIAL (faux état si stub invoqué) | **PARTIAL** |
| Liste conversations | Historique SQLite | load_conversation_history IPC | [] si vide | ✅ bas | **RÉEL** |
| Provider selector | Liste providers disponibles | chat_get_providers_status IPC | providers par défaut | ⚠️ peut montrer provider non opérationnel | **PARTIAL** |
| Memory stats | Données mémoire | persistent_memory_get_stats IPC | ??? | ⚠️ si stats vides = zéro affiché | **PARTIAL** |
| Admin/AutoHeal panel | Règles AH, état système | IPC admin + autoheal cmds | ??? | ⚠️ | **PARTIAL** |
| Evolution Engine state | État moteur évolution | engine_get_evolution_state IPC | ❌ STUB retourne faux état | ❌ **MENSONGE ACTIF** | **FAIL_TRUTH** |
| Web Research panel | Résultats recherche | web_research IPC (STUB) | ❌ STUB retourne rien | ❌ si UI affiche "succès" | **STUB** |
| Tool calling results | Météo/Finance | toolCaller.ts | ❌ console.log stubs | ❌ si UI affiche résultat fictif | **STUB** |
| TTS status | Synthèse vocale | hybridTTS (localhost:8765) | ⚠️ si TTS non démarré | ⚠️ | **PARTIAL** |
| Version affichée | Version app | tauri.conf.json / package.json | — | ⚠️ v26.4.0 header ≠ v28.0.0 tag | **PARTIAL** |
| Ollama health | Statut Ollama | ollama health check IPC | ❌ si Ollama absent | ⚠️ peut cacher absence | **PARTIAL** |
| Singularity fusion panel | AutoFix/CrashGuard status | ~45 IPC cmds | ??? | ⚠️ | **PARTIAL** |

## Anomalies UI Critiques

### UI-001 — Evolution Engine: FAIL_TRUTH
- **Surface**: Panel état moteur d'évolution
- **Source**: `engine_get_evolution_state` → **STUB** (commands/engine_commands.rs:221)
- **Risque**: L'UI affiche un état rassurant mais les données sont inventées par le stub
- **Patch minimal**: Désactiver l'affichage ou labelliser "NON DISPONIBLE (Phase 5.2)"

### UI-002 — Version Header Décalage
- **Surface**: Tout affichage de version
- **Source**: main.rs dit "v26.4.0", git tag est "v28.0.0"
- **Risque**: P2 confusion interne + users

### UI-003 — Provider Montré = Provider Non Disponible
- **Surface**: Provider selector UI
- **Risque**: Afficher Gemini/OpenAI/Claude dans l'UI sans API key configurée → erreur silencieuse possible
- **Mitigation**: chat_get_providers_status devrait filtrer les providers non disponibles

## G_NO_LYING_FALLBACK

- **FAIL sur**: engine_get_evolution_state (stub retourne état fictif)
- **PASS sur**: conversation_generate (TitaneLocal fallback garanti et explicite)
- **PARTIAL sur**: cloud providers (peuvent retourner erreur si pas de clé)
