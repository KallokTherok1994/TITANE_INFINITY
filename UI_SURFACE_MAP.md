# [2026-04-17] Conversation zoom-width containment truth: la surface chat canonique `/titane?tab=conversation` ne sort plus de la fenêtre sur la lane navigateur quand le zoom TopNav passe à `1.1`. `AppShell` compense désormais largeur et hauteur via `--titane-ui-scale`, `TitanePage` supprime les restes de `100vw`, et l’onglet `tab-conversation`, le flux, l’input et le bouton d’envoi restent tous bornés horizontalement et verticalement dans le viewport actif.

# [2026-04-17] Security audit governed bridge truth: `security-dashboard` conserve les selectors `security-dashboard-severity-filters`, `security-dashboard-filter-all|critical|warning|info`, `security-dashboard-multi-session-federation`, `security-dashboard-export-correlations` et `security-dashboard-containment-correlation-export`, mais la surface canonique publie désormais un export gouverné signé quand le runtime Tauri est disponible. Le journal fédéré reste rendu sur la même surface UI, sans second écran ni chemin réseau direct.

# [2026-04-16] Security audit federation/filter/export truth: `security-dashboard` publie maintenant `security-dashboard-severity-filters`, `security-dashboard-filter-all|critical|warning|info`, `security-dashboard-severity-filter-summary`, `security-dashboard-multi-session-federation`, `security-dashboard-export-correlations` et `security-dashboard-containment-correlation-export`. La surface canonique permet ainsi de fédérer localement plusieurs sessions issues du journal UI, de filtrer les événements par sévérité et d’exporter un JSON borné des corrélations de confinement sans quitter le panneau fixe.

# [2026-04-16] Advanced-agent timeline and security audit surfaces: `orchestrator-dashboard` publie maintenant `orchestrator-dashboard-refresh` et `orchestrator-dashboard-live-timeline` pour suivre une série temporelle locale bornée de la charge providers avec refresh à 15s sur la surface canonique. `security-dashboard` publie `security-dashboard-refresh`, des boutons `security-dashboard-ack-*`, `security-dashboard-event-history` et `security-dashboard-correlation-summary`, afin d exposer l acquittement persistant, l historique borné et la corrélation croisée des événements de détection/confinement sans quitter le panneau fixe canonique.

# [2026-04-16] Advanced-agent live runtime surfaces: `orchestrator-dashboard`, `explainability-dashboard` et `security-dashboard` publient maintenant des sections live stables au lieu de se limiter à un statut synthétique. L orchestrateur expose `orchestrator-dashboard-live-metrics` et `orchestrator-dashboard-provider-snapshots` depuis la télémétrie locale et la gouvernance providers, l explainability expose `explainability-dashboard-inference-chain` et `explainability-dashboard-inference-report` depuis la conversation persistée active, et la sécurité active expose `security-dashboard-detection-events` et `security-dashboard-containment-events` à partir des alertes, logs UI et politiques de confinement déjà disponibles.

# [2026-04-16] Advanced agents runtime detail truth: `explainability-dashboard`, `orchestrator-dashboard` et `security-dashboard` publient maintenant des sections runtime détaillées issues de la vérité déjà disponible dans le repo, au lieu de s arrêter à un statut `partial` générique. Explainability expose la chaîne `requested -> used -> shown` et un mini rapport d'inférence, orchestrator publie des métriques live et snapshots providers, et security active affiche des événements de détection/confinement dérivés du runtime canonique.

# [2026-04-16] Conversation E2E knowledge-memory proof truth: la lane critique Playwright du chat peut maintenant injecter une connaissance runtime seedee dans le mock conversationnel actif et vérifier deux marqueurs visibles, `[MOCK_KNOWLEDGE]` et `[MOCK_MEMORY]`, tout en traçant les échanges persistés dans `window.__TITANE_E2E_CHAT_MEMORY_LOG__`. Cette preuve reste explicitement une lane mock du chemin frontend canonique, pas une simulation de backend HTTP séparé.

# [2026-04-16] Monitoring lazy-loader runtime fix: le dashboard canonique `monitoring-dashboard` continue de passer par `src/services/monitoring/index.ts`, mais la façade monitoring importe désormais explicitement les bindings du lazy-loader avant de les réexporter. La vérité runtime corrigée est que `getMonitoringAgentStatus()` peut être appelée depuis `MonitoringDashboard.tsx` sans `ReferenceError`, même avant l'initialisation paresseuse complète du monitoring.

# [2026-04-17] Canonical zoom authority truth: le zoom global TITANE passe maintenant par une seule autorité canonique (`src/hooks/zoomScale.ts`) partagée entre TopNav, raccourcis clavier et panneau UIReading. Le shell applicatif, les panneaux modaux et la surface chat legacy ont été réalignés sur des dimensions parent-bound (`100%`) au lieu de `vh/dvh` rigides, afin que textes et éléments grandissent/rétrécissent de façon cohérente sans réintroduire de débordement sous zoom navigateur et Tauri.

# [2026-04-17] Advanced agents runtime truth: les dashboards `monitoring-dashboard`, `diagnostic-panel`, `explainability-dashboard`, `orchestrator-dashboard` et `security-dashboard` ne lisent plus seulement le catalogue de qualification; ils passent par leurs services dédiés pour afficher des signaux runtime/configuration réels déjà présents dans le repo (métriques/alertes monitoring, providers actifs, timeouts, registre champion/challenger, transport IPC, statut Ollama).

# [2026-04-17] Native zoom-step truth: la surface conversation TITANE conserve maintenant un cycle de zoom symétrique dans TopNav et au clavier. Un aller-retour `zoom in` puis `zoom out` revient exactement à 100% au lieu de dériver vers `0.99`, et la page fullscreen force désormais un bornage parent-bound (`width/max-width/min-height` overrides) pour rester visible dans la fenêtre Tauri dev à `0.8`, `1.0` et `1.1`.

# [2026-04-16] Canonical route-context truth: les alias query-driven ne sont plus résumés à leurs seuls chemins racine dans `moduleRouteContext`; `/chat`, `/devtools`, `/monitoring`, `/stats`, `/evolution-center` et les alias Admin/Dev conservent désormais leur destination canonique complète (`tab=...`, `systemTab=...`) afin que la mémoire contextuelle, les raccourcis et les diagnostics reflètent la surface réellement visible au lieu d'une racine générique pouvant donner une impression de rollback UI.

# [2026-04-16] Canonical desktop/browser zoom truth: la surface conversation TITANE n'est plus rétrécie par un `html { zoom: 75%; }` global en desktop. La baseline revient à 100%, les raccourcis zoom/fullscreen restent l'autorité canonique, et la page conversation conserve désormais un étirement `width: 100%` parent-bound pour rester entièrement visible en HTTP, en Tauri, en plein écran et sous zoom +/-.

# [2026-04-16] Conversation fullscreen bounded-height truth: la surface conversation fullscreen est maintenant contrainte par une chaîne `titane-content--conversation -> titane-section-conversation--fullscreen -> conversation-container` entièrement flex et bornée en hauteur, ce qui garde l’onglet Chat, le flux et le compositeur dans la fenêtre sans débordement bas en HTTP desktop.

# [2026-04-17] TopNav zoom viewport truth: les contrôles de zoom du TopNav ne laissent plus la surface TITANE sortir de la fenêtre visible. Le shell applicatif compense désormais le zoom global via une hauteur et un offset top normalisés par `--titane-ui-scale`, ce qui garde le chat, les tabs et le compositeur entièrement visibles sous zoom avant/arrière, resize et viewport compact.

# [2026-04-16] Conversation long-message visibility: la surface chat canonique ne jette plus les messages assistant tres longs dans le chemin de virtualisation; elle repasse sur le rendu naturel et ne declenche l'alerte `titane-message-truncated` que si une limite explicite a ete configuree via `window.TITANE_MAX_MESSAGE_LENGTH`.

# [2026-04-16] Conversation runtime transparency reply: quand l'utilisateur demande explicitement, sans creer de fichier, le provider reel utilise, l'usage reseau et ce que l'UI peut exporter, la surface conversation repond maintenant localement en 3 points a partir de la derniere verite runtime instrumentee; elle cite JSON, Markdown et copie presse-papiers, et rappelle que les demandes de fichier passent par la voie artefact canonique.

# [2026-04-16] Conversation transparency prompt guard: la surface conversation ne bascule plus vers la voie artefact sur une question descriptive mentionnant simplement ce que l'UI peut exporter; seuls les prompts demandant réellement un export/génération de fichier déclenchent désormais le manifeste artefact.

# [2026-04-16] Conversation fullscreen internal scroll budget: en viewport compact, le shell fullscreen supprime son gap vertical hérité et réserve un budget bas safe-area-aware afin que `chat-messages-scroll-region` garde le scroll interne pendant que l’onglet chat et le compositeur restent visibles simultanément.

# [2026-04-16] Conversation fullscreen persistent header: la surface conversation conserve maintenant son header d’onglet visible sous zoom et en viewport compact, car `TitanePage` ne force plus le scroll vers le textarea et `titane-page-header--conversation` reste collé en haut du shell fullscreen.

# [2026-04-16] Conversation visible native scrollbar: `chat-messages-scroll-region` conserve une scrollbar native droite explicitement visible, avec piste/thumb renforcées et un gutter stable, afin de garder un repère de défilement cliquable sans créer un rail parallèle.

# [2026-04-16] Canonical chat surface truth: `src/pages/ChatPage.tsx` n'expose plus une UI chat parallèle, le router déprécié et le préchargement critique sont réalignés sur `TitanePage`, et la surface interactive réelle reste `ConversationSection` via `/titane?tab=conversation`.

# [2026-04-16] Legacy chat export truth: `src/ui/pages/Chat.tsx` ne porte plus sa propre implémentation OMEGA; il agit désormais comme alias fin vers `ChatPage` puis `TitanePage`, ce qui garde les anciens imports compatibles sans réintroduire une surface chat divergente.

# [2026-04-15] Conversation IPC recovery truth: la surface chat canonique conserve maintenant une génération valide même quand `conversation_generate` tombe sur un clamp IPC du `tauriProtector`; `ConversationEngine` tente alors explicitement le fallback orchestrateur au lieu d'exposer directement l'erreur technique `tauri_protector_ipc_fallback`.

# [2026-04-15] TWINS canonical route context: les alias legacy `/identity`, `/identity-center`, `/persona` et `/twin` sont normalisés vers la route publique dédiée `/twins` aussi dans le contexte module-route utilisé par le chat, pour garder la navigation et la mémoire contextuelle alignées avec la surface UI réelle.

# [2026-04-16] Conversation rate-limit provider-flow proof: la lane Playwright riche `tests/e2e/provider-flow.test.ts` sait maintenant injecter le scénario gouverné `RATE_LIMIT` via le mock conversationnel et exige la même vérité runtime `chat-runtime-state[data-provider-reason="RATE_LIMIT"][data-provider-mode="OFFLINE"][data-network-used="true"]` sans faux succès `[MOCK_OK]`.

# [2026-04-16] Conversation rate-limit E2E proof: le harness critique Playwright peut désormais injecter un scénario gouverné `RATE_LIMIT` via le mock conversationnel, et la surface chat doit alors exposer `chat-runtime-state[data-provider-reason="RATE_LIMIT"][data-provider-mode="OFFLINE"]` avec un résumé runtime cohérent au lieu d’un faux succès mock.

# [2026-04-16] Conversation rate-limit truth: les dégradations d’exploration et de fallback conversationnel marquées `RATE_LIMIT` sont désormais exposées comme un blocage gouverné temporaire, pas comme une erreur générique, afin que la surface chat affiche honnêtement une indisponibilité de quota GitHub/Copilot.

# [2026-04-15] Conversation fullscreen flex chain: la surface active `ConversationSection` ne repose plus sur une hauteur fullscreen soustractive sur mobile/zoom; le conteneur plein écran remplit maintenant la hauteur disponible via la chaîne `titane-content--conversation -> titane-section-conversation--fullscreen -> conversation-container`, ce qui garde la zone d'écriture visible dans la fenêtre.

# [2026-04-15] Android browser-mobile conversation: la surface chat fullscreen compacte conserve maintenant un compositeur visible sur mobile via un override de hauteur dedie dans `TitanePage-local.css`; la validation E2E Android continue de passer par les selectors stables `chat-input`, `chat-send` et `chat-message-user`, avec un dispatch DOM natif cote harness pour eviter les faux negatifs de clic synthetique sans changer la surface exposee.

# [2026-04-15] Conversation composer containment: en fullscreen, la zone d'écriture du bas reste maintenant collée et bornée au viewport visible via un compositeur sticky/safe-area-aware; la preuve T17 vérifie explicitement que le bas du compositeur (`composerBottom`) ne sort pas de la fenêtre.

# [2026-04-15] Conversation return-to-bottom CTA: `chat-scroll-to-bottom` est maintenant rendu comme une petite flèche ronde discrète ancrée au bas de la surface chat, sans libellé visible, pour revenir rapidement au dernier message sans alourdir le bas de page.

# [2026-04-15] Conversation view polish: la surface chat regroupe maintenant toolbar, filtres et télémétrie dans un chrome haut cohérent; le panneau runtime passe en layout compact lisible et les bulles utilisateur/assistant gagnent une hiérarchie visuelle plus nette.

# [2026-04-15] Conversation fullscreen immersive: `conversation-container` expose maintenant `data-fullscreen=true|false`; le mode fullscreen applique un chrome plus affirmé sur la toolbar, le panneau runtime, le flux et le compositeur pour que le basculement soit immédiatement visible, même avant l'entrée en densité `compact`.

# [2026-04-15] Réponses longues chat: la surface conversation repasse automatiquement sur le rendu non virtualisé dès qu’un message dépasse la hauteur fixe compatible `react-window`, et les budgets par défaut de génération sont alignés sur le plafond backend utile de 32768 pour éviter les coupures de sortie côté runtime.

# [2026-04-15] Conversation fullscreen: la surface chat compacte automatiquement son chrome quand le zoom réduit la hauteur utile; ajout du raccourci flottant `chat-scroll-to-bottom`, du sélecteur stable `chat-messages-scroll-region`, d’un traitement safe-area renforcé et d’un verrouillage `flex/min-height/overflow` plus strict pour garder le dernier message, le CTA et l’input visibles sur desktop et mobile.

# [2026-04-15] AppShell fullscreen chain: le shell racine verrouille désormais `h-dvh/min-height:0/flex-col` jusqu’au conteneur scroll principal pour éviter qu’un wrapper intermédiaire recrée un gap sous la conversation fullscreen après zoom ou rebuild.

# [2026-04-15] Knowledge Fusion: l’alerte de résultat nul n’apparaît plus dès la simple détection du format; elle n’est rendue qu’après une vraie tentative `parseDocument` renvoyant `null`, via le sélecteur stable `knowledge-null-result-warning`, sans injecter de document nul dans le vault.

# [2026-04-14] L’onglet « Twins » a été supprimé de la barre d’onglets de la page Titane. L’accès à la page Twins est désormais possible uniquement via le menu Plus (\*\*\*) de la TopNav vers la route /twins. Aucun testid «tab-twins» ne doit subsister dans l’UI.

# [2026-04-14] Nettoyage UI chat: suppression complète des surfaces TWINS de la page chat (`conversation-twins-card`, `chat-twins-status`, `chat-twins-meta`, `chat-open-twins`) tout en conservant l’entrée dédiée `nav-twins` dans le menu Plus de la TopNav.

# UI_SURFACE_MAP

## TopNav — Navigation & Global Controls (top-right)

- TopNav zoom controls container test id: `topnav-zoom-controls`
- TopNav zoom-out button test id: `topnav-zoom-out`
- TopNav zoom-in button test id: `topnav-zoom-in`
- File: `src/components/layout/TopNav.tsx`
- Zoom range: 50% – 200%, persisted to localStorage key `titane_zoom_level`
- Zoom step truth: TopNav and keyboard shortcuts use the same canonical additive step, so one zoom-in followed by one zoom-out returns exactly to 100%.
- Zoom authority truth: TopNav listens to canonical zoom-change events, so its indicator stays aligned with keyboard, Tauri window controls, and UIReading adjustments instead of keeping a stale local value.
- Keyboard equivalents: Ctrl+- (zoom out), Ctrl++ (zoom in), Ctrl+0 (reset)
- Item menu Plus: `nav-twins` (route `/twins`, accès unique TWINS côté UI)

## Primary Chat Surface (ConversationSection)

- Input textarea test id: `chat-input`
- Send button test id: `chat-send`
- Messages scroll region test id: `chat-messages-scroll-region`
- Scroll-to-bottom button test id: `chat-scroll-to-bottom`
- Scroll-to-bottom visual form: petite flèche ronde discrète, sans texte visible, ancrée en bas à droite de la surface conversation
- Scroll region native scrollbar: la scrollbar droite du flux reste visible en permanence avec piste/thumb contrastées; ne pas la masquer ni la remplacer par un rail séparé.
- Assistant message container test id: `chat-message-assistant`
- Assistant content test id: `chat-message-content`
- Runtime panel test id: `chat-runtime-state`
- Runtime summary test id: `chat-runtime-summary`
- Conversation top chrome: toolbar, filtres et runtime sont visuellement regroupés dans `conversation-top-chrome`
- Runtime panel visual contract: résumé + manifest alignés dans `conversation-runtime-copy`, badges sur une colonne d’appoint plus compacte
- Ready marker test id: `chat-ready`
- Loading marker test id: `chat-loading`
- Error marker test id: `chat-error`
- Fullscreen visual state: `data-fullscreen=true|false` on `conversation-container`
- Density state: `data-density=comfortable|compact` on `conversation-container`
- Fullscreen visual contract: le mode `data-fullscreen=true` renforce visiblement le shell conversationnel avant même l'éventuel resserrement `compact`
- Fullscreen composer contract: `.conversation-input-container` reste contenu dans le viewport visible et ne doit jamais sortir sous la fenêtre active
- Fullscreen containment contract: la hauteur fullscreen active est pilotée par la chaîne flex du shell conversation, pas par une soustraction fixe spécifique mobile
- Native fullscreen parent-bound contract: `.titane-page--conversation` force `width: 100% !important`, `max-width: 100% !important` et `min-height: 0 !important` pour ne pas réhériter des dimensions `100vw/100vh` quand le runtime Tauri applique un zoom inférieur à 100%.
- Long assistant replies: fixed-height virtualization is bypassed automatically when a message requires natural height rendering; selectors above remain unchanged.
- Long response proof: la combinaison `chat-input` → `chat-send` → `chat-message-assistant`/`chat-message-content` est couverte en E2E mock pour vérifier qu’une réponse longue complète reste visible.
- Legacy route truth: `/chat` reste un alias de navigation mais redirige explicitement vers `/titane?tab=conversation`; sa vérité UI reste `page-titane[data-layout="chat-fullscreen"]` et `page-conversation[data-layout="fullscreen"]`.
- Legacy import truth: `src/ui/pages/Chat.tsx` conserve les exports `Chat` et `default`, mais ils rendent désormais la même surface canonique `page-titane` / `page-conversation`.

## Runtime Telemetry Attributes on Assistant Row

- `data-provider-used`
- `data-network-used`
- `data-provider-reason`
- `data-provider-mode`
- `data-memory-state`
- `data-provider-cache-hit`

## Runtime Telemetry Attributes on Runtime Panel

- `data-provider-used`
- `data-network-used`
- `data-provider-reason`
- `data-orchestrator-state`
- `data-memory-state`

## Fallback/Legacy Surfaces Covered by Tests

- Chat bubble selectors (`chat-bubble-*`)
- Legacy selectors (`#chat-window-textarea`, `#chat-input-textarea`, `.send-button`, `.chat-send-btn.chat-send-omega`)

## Observed Active Surface in latest desktop proof

## Agents avancés — UI Dashboards (v30.1.8)

- **Monitoring Agent** : `monitoring-dashboard`
- **Auto-Diagnostic Agent** : `diagnostic-panel`
- **Explainability Agent** : `explainability-dashboard`
- **Orchestrateur Dynamique Agent** : `orchestrator-dashboard`
- **Agent de Sécurité Active** : `security-dashboard`
- **Agent Anti-Régression canonique** : `self-healing-dashboard` + `anti-regression-summary` via `/admin?tab=anti-regression`
- **Panel canonique** : `agent-dashboards-panel` regroupe les 5 dashboards avancés visibles sur la surface active.
- **Montage canonique** : `agent-dashboards-panel` est monté depuis `src/components/layout/AppShell.tsx`, donc la vérité runtime attendue est sa présence sur la surface applicative active et pas seulement dans des exports dormants.
- **Contrat canonique commun** : chaque dashboard expose `data-readiness` sur sa racine et les selectors enfants `-status`, `-summary`, `-proof-list`, `-blockers`, `-next-step`.
- **Runtime detail truth** : `explainability-dashboard` publie `-inference-chain` et `-inference-report`, `orchestrator-dashboard` publie `-live-metrics` et `-provider-snapshots`, `security-dashboard` publie `-detection-events` et `-containment-events`; ces sections doivent rester alimentées par des signaux runtime/configuration réellement présents dans le repo.
- **Readiness truth** : `monitoring-dashboard`, `diagnostic-panel`, `explainability-dashboard`, `orchestrator-dashboard` et `security-dashboard` = `partial` tant que leurs services publient déjà des signaux runtime/configuration vérifiables mais qu aucun moteur complet n est encore branché.
- **Chat single-door truth** : la surface conversation active continue d utiliser `conversation_generate` via IPC Tauri, pas un backend HTTP direct. Depuis le correctif 2026-04-16, ce chemin actif enrichit aussi le system prompt avec la connaissance runtime issue de `memory_get_knowledge` et persiste chaque échange réussi dans le Memory Core via `persistent_memory_write_entry`, ce qui réaligne mémoire, base de connaissance et contexte Twins sur la même porte d entrée.

Chaque dashboard doit disposer de selectors stables (`data-testid`) pour E2E, logs et alerting UI.

## DevPage Surface

- Route canonique: `/dev`
- Root shell test id: `page-dev`
- Shell state contract: `data-dev-state=loading|error|ready`
- Runtime truth: la route `/dev` expose désormais son marqueur de surface immédiatement, y compris pendant le préchargement et en état d'erreur, pour éviter que la lane desktop WRY attende des chargements secondaires avant de qualifier la page.

## Conversation Fullscreen Shell

- Root shell contract: la chaîne fullscreen `AppShell -> titane-page--conversation -> titane-content--conversation -> conversation-container` doit rester parent-bound (`flex/min-height:0/max-height:100%`) et non pilotée par un double offset ou une hauteur viewport forcée.
- Header persistence truth: `titane-page-header--conversation` reste collé en haut du shell fullscreen pour garder l’onglet chat visible quand la hauteur utile se compacte.
- App shell offset truth: la compensation TopNav reste portée uniquement par `paddingTop: calc(4rem + env(safe-area-inset-top, 0px))` dans `AppShell`.
- Parent-bound shell truth: `AppShell` compense désormais le zoom sur `height/min-height: calc(100% / var(--titane-ui-scale))`, ce qui évite les dérives liées à `100dvh` quand le navigateur ou Tauri appliquent un zoom réel.
- Desktop proof helper truth: le helper WDIO `inspectConversationScrollRegion()` borne désormais son overflow artificiel au budget vertical réel entre `.chat-toolbar` et `.conversation-input-container`.
