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
- Desktop proof helper truth: le helper WDIO `inspectConversationScrollRegion()` borne désormais son overflow artificiel au budget vertical réel entre `.chat-toolbar` et `.conversation-input-container`.
