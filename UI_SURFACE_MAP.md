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
- Assistant message container test id: `chat-message-assistant`
- Assistant content test id: `chat-message-content`
- Runtime panel test id: `chat-runtime-state`
- Runtime summary test id: `chat-runtime-summary`
- Ready marker test id: `chat-ready`
- Loading marker test id: `chat-loading`
- Error marker test id: `chat-error`
- Density state: `data-density=comfortable|compact` on `conversation-container`
- Long assistant replies: fixed-height virtualization is bypassed automatically when a message requires natural height rendering; selectors above remain unchanged.
- Long response proof: la combinaison `chat-input` → `chat-send` → `chat-message-assistant`/`chat-message-content` est couverte en E2E mock pour vérifier qu’une réponse longue complète reste visible.

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

- **Monitoring Agent** : `monitoring-dashboard` (test id à définir)
- **Auto-Diagnostic Agent** : `diagnostic-panel` (test id à définir)
- **Explainability Agent** : `explainability-dashboard` (test id à définir)
- **Orchestrateur Dynamique Agent** : `orchestrator-dashboard` (test id à définir)
- **Agent de Sécurité Active** : `security-dashboard` (test id à définir)

Chaque dashboard doit disposer de selectors stables (`data-testid`) pour E2E, logs et alerting UI.
