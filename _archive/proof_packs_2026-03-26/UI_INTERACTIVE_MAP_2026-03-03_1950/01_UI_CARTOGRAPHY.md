# UI Interactive Map — Cartographie Complète
**Version:** 27.2.0 | **Date:** 2026-03-03T19:50:39Z | **Commit:** e97177da

> Données extraites par lecture statique du code source. Aucun placeholder.

---

## NAVIGATION GLOBALE — TopNav

**Composant:** `src/components/layout/TopNav.tsx`
**Montage:** permanent (AppShell), height=64px

| Element | Type | Handler | Action | Expected Result |
|---------|------|---------|--------|-----------------|
| Logo TitaneLogo | Image (non-clickable) | — | — | Branding only |
| Nav button: TITANE | Button | onClick → onNavigate('/titane') | navigate('/titane') | Route vers TitanePage |
| Nav button: TIME | Button | onClick → onNavigate('/time') | navigate('/time') | Route vers TimePage |
| Nav button: STATS | Button | onClick → onNavigate('/stats') | navigate('/stats') | Route vers Stats |
| Nav button: ADMIN | Button | onClick → onNavigate('/admin') | navigate('/admin') | Route vers AdminPage |
| Nav button: DEV | Button | onClick → onNavigate('/dev') | navigate('/dev') | Route vers DevPage |
| "Plus" toggle | Button | onClick → setIsMoreMenuOpen(!open) | Toggle dropdown | Affiche FUSION + OPTIMIZE |
| "Plus" / FUSION | MenuItem | onClick → onNavigate('/fusion') | navigate('/fusion') | Route vers PerfectFusionDashboard |
| "Plus" / OPTIMIZE | MenuItem | onClick → onNavigate('/optimization') | navigate('/optimization') | Route vers UltimateOptimizationDashboard |
| AI Status Indicator | Badge (non-cliquable) | useEffect polling 30s | safeInvoke('chat_check_providers') | Affiche % providers IA disponibles |
| Keyboard: Enter/Space | KeyboardEvent | handleKeyDown | onNavigate(route) | Navigation accessible WCAG 2.2 |

---

## NAVIGATION MOBILE — MobileNav

**Composant:** `src/components/layout/MobileNav.tsx`
**Montage:** conditionnel (responsive)

| Element | Type | Handler | Action | Expected Result |
|---------|------|---------|--------|-----------------|
| Hamburger button | Button | onClick → setIsOpen(!isOpen) | Toggle menu | Affiche/masque le panneau mobile |
| Menu items (dynamiques) | Button[] | onClick → onItemClick(item) | Navigate to route | Route vers page sélectionnée |
| Close on ESC | KeyboardEvent | handleKeyDown 'Escape' | setIsOpen(false) | Ferme le menu |
| Close on route change | Effect | popstate event | setIsOpen(false) | Ferme auto à la navigation |

---

## Route: `/` → redirect `/titane`
Redirect automatique, non accessible directement.

---

## Route: `/titane` → TitanePage ⭐ PAGE PRINCIPALE

**Composant:** `src/pages/TitanePage.tsx`
**Accessible depuis nav:** Oui (TopNav "TITANE")

### Tabs de section (role=tablist)
| Element | Type | Handler | Action | Expected Result |
|---------|------|---------|--------|-----------------|
| Tab 💬 Chat | Button (role=tab) | onClick → tabHandlers.conversation | setActiveTab('conversation') | Affiche ConversationSection |
| Tab 📊 Vue | Button (role=tab) | onClick → tabHandlers.overview | setActiveTab('overview') | Affiche OverviewSection |
| Tab 📷 Vision | Button (role=tab) | onClick → tabHandlers.vision | setActiveTab('vision') | Affiche VisionSection |
| Tab 🧬 Identité | Button (role=tab) | onClick → tabHandlers.identity | setActiveTab('identity') | Affiche IdentitySection |
| Tab 💾 Mémoire | Button (role=tab) | onClick → tabHandlers.memoryMap | setActiveTab('memory-map') | Affiche MemorySection |
| Tab 🔄 Évolution | Button (role=tab) | onClick → tabHandlers.memoryEvolution | setActiveTab('memory-evolution') | Affiche MemoryEvolutionSection |
| Tab ⚡ XP | Button (role=tab) | onClick → tabHandlers.progression | setActiveTab('progression') | Affiche ProgressionSection |
| Tab 🌱 Transform | Button (role=tab) | onClick → tabHandlers.transformation | setActiveTab('transformation') | Affiche TransformationSection |

**A11Y:** role="tablist", aria-label, aria-selected, aria-controls, id sur chaque tab

### Sub-section: ConversationSection (tab "Chat")
**Composant:** `src/components/sections/ConversationSection.tsx`

| Element | Type | Handler | Action | Expected Result |
|---------|------|---------|--------|-----------------|
| Chat textarea | Textarea | onChange → setInputValue | Input text | Met à jour inputValue local |
| Bouton Envoyer | Button | onClick → handleSendMessage | useConversationEngine.sendMessage() | IPC: `conversation_generate` → message ajouté |
| Suggestions rapides | Button[] | onClick → setInputValue(value) | Pré-remplit textarea | Suggestion activée |
| Provider selector | ChatProviderSelector | onChange → setSelectedProvider | Met provider actif | Change IA: gemini/ollama/openai/claude |
| Mode selector buttons (6 modes) | Button[] | onClick → setMode(mode) | useConversationEngine.setMode() | Change mode conversation |
| Mode Builder button | Button | onClick → setShowModeBuilder(true) | Ouvre modal ModeBuilder | Création/édition mode custom |
| Voice Record button | Button (toggle) | onClick → toggleRecording | useVoiceEngine.startListening/stop | Démarre/stoppe enregistrement mic |
| Audio TTS toggle | Checkbox/Button | onClick → setAudioEnabled(!prev) | hybridTTS activation | Active lecture vocale réponses |
| Search input | Input | onChange → setSearchQuery | deferredValue → filter messages | Filtrage messages en temps réel |
| Role filter: All/User/Assistant | Button[] | onClick → setFilterRole(role) | Filtre messages par rôle | Affichage filtré |
| Copy button (par message) | Button | onClick → onCopy(content) | copyToClipboard() | Message copié presse-papier |
| Retry button (messages user) | Button | onClick → onRetry(content) | Re-sendMessage(content) | Renvoi du message |
| Delete button (par message) | Button | onClick → onDelete(id) | deleteMessage(id) | Message supprimé de la liste |
| Toolbar: Download JSON | Button (ChatToolbar) | onClick → downloadConversation() | Export JSON de la conv | Fichier .json téléchargé |
| Toolbar: Download Markdown | Button (ChatToolbar) | onClick → downloadMarkdown() | Export .md | Fichier .md téléchargé |
| Toolbar: Copy All | Button (ChatToolbar) | onClick → copyToClipboard() | Copie toute la conv | Presse-papier mis à jour |
| Toolbar: Clear | Button (ChatToolbar) | onClick → clearMessages() | clearMessages() | Conversation réinitialisée |
| Toolbar: Search toggle | Button (ChatToolbar) | onClick → toggleSearch | Affiche/masque barre recherche | Barre recherche visible |
| FileUpload button | Button (FileUploadButton) | onChange → setAttachedImages | Attach image/file | Image ajoutée au prochain message |

---

## Route: `/stats` → Stats

**Composant:** `src/pages/Stats.tsx`
**Accessible depuis nav:** Oui (TopNav "STATS")

Page de monitoring temps réel sans interactivité utilisateur directe.
Auto-polling via `useEngineSubscription('nexus')`, `useEngineSubscription('helios')`, `useEngineSubscription('harmonia')` + `tauriClient.orchestrationGetCognitiveState()` every 5s.

| Element | Type | Action | Note |
|---------|------|--------|------|
| (aucun bouton visible) | — | Auto-polling display only | Voir recommandation debounce |

---

## Route: `/time` → TimePage

**Composant:** `src/pages/TimePage.tsx`
**Accessible depuis nav:** Oui (TopNav "TIME")
**Tabs:** `now | agenda | timeline | snapshots | intelligence | flow`

| Element | Type | Handler | Action | Expected Result |
|---------|------|---------|--------|-----------------|
| Tab 🕐 Now | Button | onClick → setActiveTab('now') | Switch tab | Affiche état temps présent |
| Tab 📅 Agenda | Button | onClick → setActiveTab('agenda') | Switch tab | Affiche planification |
| Tab 📜 Timeline | Button | onClick → setActiveTab('timeline') | Switch tab | Affiche historique |
| Tab 💾 Snapshots | Button | onClick → setActiveTab('snapshots') | Switch tab | Affiche snapshots système |
| Tab 🧠 Intelligence | Button | onClick → setActiveTab('intelligence') | Switch tab | Affiche analyses IA |
| Tab 🌊 Flow | Button | onClick → setActiveTab('flow') | Switch tab | Affiche état Flow |
| Add TimeBlock | Button (agenda tab) | onClick → createTimeBlock | local state + tauriClient | Nouveau bloc temps |
| Add Event (timeline) | Button | onClick → addTimelineEvent | tauriClient action | Évènement ajouté |
| Create Snapshot | Button (snapshots tab) | onClick → createSnapshot | IPC: persistence commands | Snapshot système créé |
| Restore Snapshot | Button (per snapshot) | onClick → restoreSnapshot(id) | IPC: titan_recover_state | État restauré |
| Flow toggle | Button (flow tab) | onClick → toggleFlow | local state | Démarre/stoppe session Flow |

---

## Route: `/admin` → AdminPage

**Composant:** `src/features/admin/AdminPage.tsx`
**Accessible depuis nav:** Oui (TopNav "ADMIN")
**Redirections entrantes:** /system-center, /diagnostics, /devtools, /cluster, /introspection, /hypervision, /configuration, /design-center, /design-system, /settings, /governance-center, /governance, /secure, /audio-center, /audio, /voice, /tts

| Element | Type | Handler | Action | Expected Result |
|---------|------|---------|--------|-----------------|
| Section tabs | Button[] | onClick → setActiveSection | Switch between admin sections | Affiche section sélectionnée |
| API Key Gemini | Input + Button | onSubmit → chat_set_gemini_key | IPC: `chat_set_gemini_key` | Clé sauvegardée |
| API Key OpenAI | Input + Button | onSubmit → chat_set_openai_key | IPC: `chat_set_openai_key` | Clé sauvegardée |
| API Key Claude | Input + Button | onSubmit → chat_set_anthropic_key | IPC: `chat_set_anthropic_key` | Clé sauvegardée |
| API Key Copilot | Input + Button | onSubmit → chat_set_copilot_key | IPC: `chat_set_copilot_key` | Clé sauvegardée |
| Theme toggle | Button | onClick → toggleTheme | DOM attribute + state | Thème dark/light |
| Audio device select | Select | onChange → setAudioDevice | IPC: `set_audio_output_device` | Sortie audio changée |
| Audio test | Button | onClick → testMicrophone | IPC: `test_microphone` | Test microphone |
| TTS test | Button | onClick → testTTS | IPC: `test_tts` | TTS testé |
| Governance policies | Toggle[] | onChange → toggle_ia_policy | IPC: `toggle_ia_policy` | Politique activée/désactivée |
| Export config | Button | onClick → exportConfig | IPC: `export_config` | Config exportée |
| Import config | Button + FileInput | onChange → importConfig | IPC: `import_config` | Config importée |
| Save preset | Button + Input | onSubmit → savePreset | IPC: `save_config_preset` | Preset sauvegardé |
| Load preset | Button | onClick → loadPreset(id) | IPC: `load_config_preset` | Preset chargé |
| Delete preset | Button | onClick → deletePreset(id) | IPC: `delete_config_preset` | Preset supprimé |
| Self-healing toggle | Button | onClick → toggleSelfHeal | IPC: `self_healing_enable/disable` | Auto-heal on/off |
| Diagnostics run | Button | onClick → runDiagnostics | IPC: `sc_run_quick_diagnostics` | Résultats diagnostics |
| Security audit | Button | onClick → getPermissionAudit | IPC: `get_permission_audit` | Log audit affiché |
| Window zoom +/- | Button | onClick → zoomIn/zoomOut | IPC: `window_zoom_in/out` | Zoom appliqué |
| Fullscreen toggle | Button | onClick → toggleFullscreen | IPC: `window_toggle_fullscreen` | Plein écran |

---

## Route: `/dev` → DevPage

**Composant:** `src/pages/DevPage.tsx`
**Accessible depuis nav:** Oui (TopNav "DEV")
**Sections:** `overview | devtools | command-center | system-commands | qa-tests | orchestration | security | metrics | optimization | diagnostic`

| Element | Type | Handler | Action | Expected Result |
|---------|------|---------|--------|-----------------|
| Section tabs (10) | Button[] | onClick → setActiveSection | Switch section | Section active change |
| DevTools op buttons (6) | Button[] | onClick → setSelectedOperation(id) | Sélection opération | Op sélectionnée (patch/refactor/rewrite/audit/test/rollback) |
| Exec Operation | Button | onClick → executeOperation | useDeveloperMode().execute | Opération exécutée |
| Cmd: sync_all | Button | onClick → onExecute('sync_all') | tauriClient.one_core_force_sync | Sync forcée |
| Cmd: health_check | Button | onClick → onExecute('health_check') | tauriClient.health_check | Rapport santé |
| Cmd: optimize | Button | onClick → onExecute('optimize') | IPC: system_optimize | Optimisation système |
| Cmd: repair | Button | onClick → onExecute('repair') | IPC: memory_repair | Réparation mémoire |
| Cmd: gc | Button | onClick → onExecute('gc') | IPC: crashguard_clear_memory | GC déclenchée |
| Cmd: backup | Button | onClick → onExecute('backup') | IPC: titan_force_snapshot | Snapshot créé |
| QA: Run suite (per suite) | Button | onClick → onRunSuite(suiteId) | IPC: `qa_run_test_suite` | Suite tests lancée |
| QA: Acknowledge alert | Button | onClick → onAcknowledgeAlert(alertId) | IPC: `qa_acknowledge_alert` | Alerte acquittée |
| Optimization Dashboard | UltimateOptimizationDashboard | (sous-composant complet) | Multiple IPC calls | Métriques GPU/WASM/Cache |
| OnlineDiagnostic | OnlineDiagnostic | onClick → checkOnline | IPC: `check_online_capabilities` | Diagnostic réseau |

---

## Route: `/fusion` → PerfectFusionDashboard

**Composant:** `src/components/fusion/PerfectFusionDashboard.tsx`
**Accessible depuis nav:** Oui (TopNav "Plus" → FUSION)

---

## Route: `/optimization` → UltimateOptimizationDashboard

**Composant:** `src/components/optimization/UltimateOptimizationDashboard.tsx`
**Accessible depuis nav:** Oui (TopNav "Plus" → OPTIMIZE)

---

## Routes Moteurs (non accessibles depuis TopNav)

| Route | Composant | Accessible |
|-------|-----------|------------|
| /orchestration-intelligence | OrchestrationIntelligenceCenter | Non (URL directe uniquement) |
| /orchestration-center | OrchestrationMetaCenter | Non |
| /reality-center | RealityCenter | Non |
| /hyper-center | HyperCenter | Non |
| /quantum-center | QuantumCenter | Non |
| /identity-center | IdentityCenter | Non |
| /memory-evolution | MemoryEvolutionCenter | Non |
| /cloud | CloudCenter | Non |
| /knowledge | KnowledgeFusionPage | Non |
| /creation | CreationStudio | Non |
| /evolution | EvolutionMonitor | Non |
| /singularity | SingularityMonitor | Non |
| /experience | Experience | Non |
| /sentinel | Sentinel | Non |
| /watchdog | Watchdog | Non |
| /selfheal | SelfHeal | Non |
| /adaptive | AdaptiveEngine | Non |
| /memory | Memory | Non |
| /research | ResearchPage | Non |
| /performance | PerformanceTest | Non |
