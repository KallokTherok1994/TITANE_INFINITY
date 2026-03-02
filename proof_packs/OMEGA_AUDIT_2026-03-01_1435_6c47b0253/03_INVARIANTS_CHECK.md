# INVARIANTS CHECK

## Tokens
GO_FOR_PROD_BUILD__TITANE_INFINITY=<missing>
GO_FOR_PROD_DEPLOY__TITANE_INFINITY=<missing>

## Skip-pattern residual scan (e2e)

## UI direct network primitives (src)
src/__tests__/architecture/engine-isolation.test.ts:109:      /axios\./,

## URL literals in src (context needed: docs/svg/ui links included)
src/__tests__/apps/devtools/__snapshots__/DevToolsApp.test.tsx.snap:1:// Vitest Snapshot v1, https://vitest.dev/guide/snapshot.html
src/__tests__/apps/devtools/sections/__snapshots__/Dashboard.test.tsx.snap:1:// Vitest Snapshot v1, https://vitest.dev/guide/snapshot.html
src/__tests__/apps/devtools/sections/__snapshots__/Engines.test.tsx.snap:1:// Vitest Snapshot v1, https://vitest.dev/guide/snapshot.html
src/__tests__/apps/devtools/sections/__snapshots__/Logs.test.tsx.snap:1:// Vitest Snapshot v1, https://vitest.dev/guide/snapshot.html
src/__tests__/apps/devtools/sections/__snapshots__/Errors.test.tsx.snap:1:// Vitest Snapshot v1, https://vitest.dev/guide/snapshot.html
src/__tests__/apps/devtools/sections/__snapshots__/Metrics.test.tsx.snap:1:// Vitest Snapshot v1, https://vitest.dev/guide/snapshot.html
src/__tests__/apps/devtools/sections/__snapshots__/Memory.test.tsx.snap:1:// Vitest Snapshot v1, https://vitest.dev/guide/snapshot.html
src/__tests__/apps/devtools/sections/__snapshots__/OmegaPipeline.test.tsx.snap:1:// Vitest Snapshot v1, https://vitest.dev/guide/snapshot.html
src/__tests__/apps/Settings/__snapshots__/Settings.test.tsx.snap:1:// Vitest Snapshot v1, https://vitest.dev/guide/snapshot.html
src/CARTE_POINTS_CRITIQUES.ts:137: *     "devUrl": "http://localhost:5173",
src/CARTE_POINTS_CRITIQUES.ts:142: *   "devUrl": "http://localhost:1420"  ❌ (mode HTTP obsolète)
src/CARTE_POINTS_CRITIQUES.ts:240: *      → "devUrl": "http://localhost:5173" ✅ (dev server encapsulé par Tauri)
src/__tests__/features/memory/__snapshots__/MemoryCard.test.tsx.snap:1:// Vitest Snapshot v1, https://vitest.dev/guide/snapshot.html
src/__tests__/features/memory/__snapshots__/MemoryVisualization.test.tsx.snap:1:// Vitest Snapshot v1, https://vitest.dev/guide/snapshot.html
src/__tests__/features/memory/__snapshots__/MemoryVisualization.test.tsx.snap:24:        xmlns="http://www.w3.org/2000/svg"
src/__tests__/features/memory/__snapshots__/MemoryVisualization.test.tsx.snap:83:          xmlns="http://www.w3.org/2000/svg"
src/__tests__/features/memory/__snapshots__/MemoryVisualization.test.tsx.snap:118:          xmlns="http://www.w3.org/2000/svg"
src/__tests__/features/memory/__snapshots__/MemoryVisualization.test.tsx.snap:159:          xmlns="http://www.w3.org/2000/svg"
src/__tests__/features/memory/__snapshots__/MemorySearch.test.tsx.snap:1:// Vitest Snapshot v1, https://vitest.dev/guide/snapshot.html
src/__tests__/features/memory/__snapshots__/MemorySearch.test.tsx.snap:21:      xmlns="http://www.w3.org/2000/svg"
src/__tests__/features/memory/__snapshots__/MemorySearch.test.tsx.snap:104:        xmlns="http://www.w3.org/2000/svg"
src/__tests__/features/memory/__snapshots__/MemorySearch.test.tsx.snap:133:        xmlns="http://www.w3.org/2000/svg"
src/__tests__/features/memory/__snapshots__/MemorySearch.test.tsx.snap:161:        xmlns="http://www.w3.org/2000/svg"
src/__tests__/features/memory/__snapshots__/MemorySearch.test.tsx.snap:204:            xmlns="http://www.w3.org/2000/svg"
src/__tests__/features/memory/__snapshots__/MemorySearch.test.tsx.snap:266:            xmlns="http://www.w3.org/2000/svg"
src/utils/__tests__/webVitals.test.ts:131:        url: 'http://localhost',
src/utils/__tests__/webVitals.test.ts:149:        url: 'http://localhost',
src/utils/__tests__/webVitals.test.ts:169:        url: 'http://localhost',
src/utils/__tests__/webVitals.test.ts:189:        url: 'http://localhost',
src/utils/__tests__/webVitals.test.ts:209:        url: 'http://localhost',
src/utils/__tests__/webVitals.test.ts:231:        url: 'http://localhost',
src/utils/__tests__/webVitals.test.ts:248:        url: 'http://localhost',
src/utils/__tests__/webVitals.test.ts:278:        url: 'http://localhost',
src/utils/__tests__/webVitals.test.ts:305:        url: 'http://localhost',
src/utils/__tests__/webVitals.test.ts:316:        url: 'http://localhost',
src/utils/__tests__/webVitals.test.ts:433:      url: 'http://localhost',
src/__tests__/features/chat/__snapshots__/TypingIndicator.test.tsx.snap:1:// Vitest Snapshot v1, https://vitest.dev/guide/snapshot.html
src/__tests__/features/chat/__snapshots__/VirtualMessageList.test.tsx.snap:1:// Vitest Snapshot v1, https://vitest.dev/guide/snapshot.html
src/__tests__/features/chat/__snapshots__/ChatToolbar.test.tsx.snap:1:// Vitest Snapshot v1, https://vitest.dev/guide/snapshot.html
src/__tests__/features/chat/__snapshots__/ChatToolbar.test.tsx.snap:58:              xmlns="http://www.w3.org/2000/svg"
src/__tests__/features/chat/__snapshots__/ChatToolbar.test.tsx.snap:87:              xmlns="http://www.w3.org/2000/svg"
src/__tests__/features/chat/__snapshots__/ChatToolbar.test.tsx.snap:145:              xmlns="http://www.w3.org/2000/svg"
src/__tests__/features/chat/__snapshots__/ChatToolbar.test.tsx.snap:187:              xmlns="http://www.w3.org/2000/svg"
src/__tests__/features/chat/__snapshots__/ChatToolbar.test.tsx.snap:221:              xmlns="http://www.w3.org/2000/svg"
src/__tests__/features/chat/__snapshots__/ChatToolbar.test.tsx.snap:269:              xmlns="http://www.w3.org/2000/svg"
src/__tests__/features/chat/__snapshots__/ChatToolbar.test.tsx.snap:308:              xmlns="http://www.w3.org/2000/svg"
src/__tests__/features/chat/__snapshots__/ChatToolbar.test.tsx.snap:344:              xmlns="http://www.w3.org/2000/svg"
src/__tests__/features/chat/__snapshots__/ChatToolbar.test.tsx.snap:392:              xmlns="http://www.w3.org/2000/svg"
src/__tests__/features/chat/__snapshots__/ChatToolbar.test.tsx.snap:421:              xmlns="http://www.w3.org/2000/svg"
src/__tests__/features/chat/__snapshots__/ChatMessage.test.tsx.snap:1:// Vitest Snapshot v1, https://vitest.dev/guide/snapshot.html
src/assets/titane-arc-emerald.svg:5:  xmlns="http://www.w3.org/2000/svg"
src/assets/titane-reactor-awen.svg:5:  xmlns="http://www.w3.org/2000/svg"
src/__tests__/panels/__snapshots__/ChatPanel.test.tsx.snap:1:// Vitest Snapshot v1, https://vitest.dev/guide/snapshot.html
src/__tests__/panels/__snapshots__/CommandPalette.test.tsx.snap:1:// Vitest Snapshot v1, https://vitest.dev/guide/snapshot.html
src/__tests__/features/monitoring/__snapshots__/SystemHealthMonitor.test.tsx.snap:1:// Vitest Snapshot v1, https://vitest.dev/guide/snapshot.html
src/__tests__/features/voice/__snapshots__/VoiceControl.test.tsx.snap:1:// Vitest Snapshot v1, https://vitest.dev/guide/snapshot.html
src/__tests__/components/ui/__snapshots__/Toast.test.tsx.snap:1:// Vitest Snapshot v1, https://vitest.dev/guide/snapshot.html
src/__tests__/components/ui/__snapshots__/Alert.test.tsx.snap:1:// Vitest Snapshot v1, https://vitest.dev/guide/snapshot.html
src/__tests__/components/ui/__snapshots__/Switch.test.tsx.snap:1:// Vitest Snapshot v1, https://vitest.dev/guide/snapshot.html
src/__tests__/components/ui/__snapshots__/Input.test.tsx.snap:1:// Vitest Snapshot v1, https://vitest.dev/guide/snapshot.html
src/__tests__/components/ui/__snapshots__/Button.test.tsx.snap:1:// Vitest Snapshot v1, https://vitest.dev/guide/snapshot.html
src/__tests__/components/ui/__snapshots__/Dialog.test.tsx.snap:1:// Vitest Snapshot v1, https://vitest.dev/guide/snapshot.html
src/components/ui/LazyImage.tsx:47:  placeholder = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'%3E%3Crect width='1' height='1' fill='%231a1a1a'/%3E%3C/svg%3E",
src/__tests__/components/ui/__snapshots__/Tabs.test.tsx.snap:1:// Vitest Snapshot v1, https://vitest.dev/guide/snapshot.html
src/__tests__/components/ui/__snapshots__/Badge.test.tsx.snap:1:// Vitest Snapshot v1, https://vitest.dev/guide/snapshot.html
src/components/ui/button.tsx:77:          xmlns="http://www.w3.org/2000/svg"
src/__tests__/components/ui/__snapshots__/Card.test.tsx.snap:1:// Vitest Snapshot v1, https://vitest.dev/guide/snapshot.html
src/__tests__/components/devtools/__snapshots__/EventStream.test.tsx.snap:1:// Vitest Snapshot v1, https://vitest.dev/guide/snapshot.html
src/__tests__/components/devtools/__snapshots__/EngineCard.test.tsx.snap:1:// Vitest Snapshot v1, https://vitest.dev/guide/snapshot.html
src/__tests__/components/devtools/__snapshots__/MetricCard.test.tsx.snap:1:// Vitest Snapshot v1, https://vitest.dev/guide/snapshot.html
src/__tests__/components/devtools/__snapshots__/LogLine.test.tsx.snap:1:// Vitest Snapshot v1, https://vitest.dev/guide/snapshot.html
src/__tests__/components/devtools/__snapshots__/LogFilters.test.tsx.snap:1:// Vitest Snapshot v1, https://vitest.dev/guide/snapshot.html
src/__tests__/components/devtools/__snapshots__/MetricsDisplay.test.tsx.snap:1:// Vitest Snapshot v1, https://vitest.dev/guide/snapshot.html
src/__tests__/components/devtools/__snapshots__/StatusPill.test.tsx.snap:1:// Vitest Snapshot v1, https://vitest.dev/guide/snapshot.html
src/__tests__/components/devtools/__snapshots__/SectionHeader.test.tsx.snap:1:// Vitest Snapshot v1, https://vitest.dev/guide/snapshot.html
src/core/holography/HOLOMESH_ENGINE.ts:215:    let svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg" class="holomesh">`;
src/pages/ResearchPage.tsx:83:    `https://fr.wikipedia.org/wiki/${slug}`,
src/pages/ResearchPage.tsx:84:    `https://fr.wikipedia.org/w/index.php?search=${query}`,
src/pages/ResearchPage.tsx:85:    `https://fr.wiktionary.org/wiki/${slug}`,
src/pages/ResearchPage.tsx:86:    `https://www.wikidata.org/wiki/Special:Search?search=${query}`,
src/types/aiModel.ts:67:    endpoint: 'https://generativelanguage.googleapis.com/v1beta/models',
src/types/aiModel.ts:81:    endpoint: 'https://api.openai.com/v1/chat/completions',
src/types/aiModel.ts:110:    endpoint: 'https://api.anthropic.com/v1/messages',
src/modules/fusion/DatasetBuilder.ts:340:    echo "   curl -fsSL https://ollama.com/install.sh | sh"
src/services/ai/providers/glm46v.ts:30:  baseUrl: 'http://127.0.0.1:8000/v1',
src/modules/devSudo/devSudoHandler.ts:2609:curl http://localhost:11434/api/tags
src/modules/devSudo/devSudoHandler.ts:2662:3. Le proxy répond-il ? → \`curl http://localhost:11434/api/tags\`
src/modules/devSudo/devSudoHandler.ts:2847:2. Le proxy répond-il ? → \`curl http://localhost:11434/api/tags\`
src/modules/devSudo/devSudoHandler.ts:2886:curl http://localhost:11434/api/tags
src/modules/devSudo/devSudoHandler.ts:2947:3. Tester proxy: \`curl http://localhost:11434/api/tags\`
src/components/sections/ConversationSection.tsx:227:    `https://fr.wikipedia.org/wiki/${topicSlug}`,
src/components/sections/ConversationSection.tsx:228:    `https://fr.wikipedia.org/w/index.php?search=${topicQuery}`,
src/components/sections/ConversationSection.tsx:229:    `https://fr.wiktionary.org/wiki/${topicSlug}`,
src/components/sections/ConversationSection.tsx:230:    `https://www.wikidata.org/wiki/Special:Search?search=${topicQuery}`,
src/components/sections/ConversationSection.tsx:236:    target_url: seeds[0] ?? `https://fr.wikipedia.org/wiki/${topicSlug}`,
src/features/governance-center/components/APIProviderCard.tsx:28:    helpUrl: 'https://makersuite.google.com/app/apikey',
src/features/governance-center/components/APIProviderCard.tsx:36:    helpUrl: 'https://platform.openai.com/api-keys',
src/features/governance-center/components/APIProviderCard.tsx:44:    helpUrl: 'https://console.anthropic.com/settings/keys',
src/features/governance-center/components/APIProviderCard.tsx:52:    helpUrl: 'https://ollama.com/download',
src/features/governance-center/components/APIProviderCard.tsx:167:                  curl -fsSL https://ollama.com/install.sh | sh
src/features/governance-center/types.ts:135:      'GitHub Copilot / GitHub Models API (https://github.com/marketplace/models)',
src/lib/security/__tests__/policyFirewallV2.test.ts:11:    const result = evaluateAttackModelV2('send all data to https://evil.example/exfil');
src/lib/security/__tests__/policyFirewallV2.test.ts:18:    const decision = evaluatePolicyFirewallV2('please post to https://evil.example', {
src/modules/devSudo/devSudoBuiltins.ts:525:curl http://localhost:11434/api/tags
src/modules/devSudo/devSudoBuiltins.ts:579:3. Le proxy répond-il ? → \`curl http://localhost:11434/api/tags\`
src/modules/devSudo/devSudoBuiltins.ts:648:curl http://localhost:11434/api/tags
src/modules/devSudo/devSudoBuiltins.ts:765:2. Le proxy répond-il ? → \`curl http://localhost:11434/api/tags\`
src/modules/devSudo/devSudoBuiltins.ts:804:curl http://localhost:11434/api/tags
src/modules/devSudo/devSudoBuiltins.ts:865:3. Tester proxy: \`curl http://localhost:11434/api/tags\`
src/features/governance-center/tabs/SecretsTab.tsx:588:              href="https://github.com/settings/tokens"
src/lib/accessibility.ts:119: * https://www.w3.org/WAI/GL/wiki/Relative_luminance
src/lib/accessibility.ts:132: * https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html
src/services/tts/hybridTTS.ts:236:      console.log(`📡 Mode: Local API (http://localhost:8765)`);
src/components/chat/ChatModeSelector.css:267:  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2394a3b8' d='M6 8L2 4h8z'/%3E%3C/svg%3E");
src/config/index.ts:26:      if (env.isBrowser && env.isDev) return 'http://localhost:1420';
src/config/offline-first.ts:34:  localLLM: 'http://localhost:8000',
src/config/offline-first.ts:37:  gemini: 'https://generativelanguage.googleapis.com/v1beta',
src/config/offline-first.ts:38:  openai: 'https://api.openai.com/v1',
src/config/offline-first.ts:77:    await httpClient.head('https://www.google.com/favicon.ico', {
src/modules/dataCollector/DataCollectorEngine.ts:553:    echo "❌ Ollama not installed. Install: https://ollama.ai"
src/components/chat/ConversationsButton.tsx:39:        xmlns="http://www.w3.org/2000/svg"
src/stories/Page.stories.ts:9:    // More on how to position stories at: https://storybook.js.org/docs/configure/story-layout
src/services/monitoring/sentry.ts:44:    // Obtenir à : https://sentry.io/settings/projects/
src/stories/Page.tsx:26:          <a href="https://componentdriven.org" target="_blank" rel="noopener noreferrer">
src/stories/Page.tsx:49:            href="https://storybook.js.org/tutorials/"
src/stories/Page.tsx:57:            href="https://storybook.js.org/docs"
src/stories/Page.tsx:71:            xmlns="http://www.w3.org/2000/svg"
src/stories/assets/github.svg:1:<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 32 32"><path fill="#161614" d="M16.0001 0C7.16466 0 0 7.17472 0 16.0256C0 23.1061 4.58452 29.1131 10.9419 31.2322C11.7415 31.3805 12.0351 30.8845 12.0351 30.4613C12.0351 30.0791 12.0202 28.8167 12.0133 27.4776C7.56209 28.447 6.62283 25.5868 6.62283 25.5868C5.89499 23.7345 4.8463 23.2419 4.8463 23.2419C3.39461 22.2473 4.95573 22.2678 4.95573 22.2678C6.56242 22.3808 7.40842 23.9192 7.40842 23.9192C8.83547 26.3691 11.1514 25.6609 12.0645 25.2514C12.2081 24.2156 12.6227 23.5087 13.0803 23.1085C9.52648 22.7032 5.7906 21.3291 5.7906 15.1886C5.7906 13.4389 6.41563 12.0094 7.43916 10.8871C7.27303 10.4834 6.72537 8.85349 7.59415 6.64609C7.59415 6.64609 8.93774 6.21539 11.9953 8.28877C13.2716 7.9337 14.6404 7.75563 16.0001 7.74953C17.3599 7.75563 18.7297 7.9337 20.0084 8.28877C23.0623 6.21539 24.404 6.64609 24.404 6.64609C25.2749 8.85349 24.727 10.4834 24.5608 10.8871C25.5868 12.0094 26.2075 13.4389 26.2075 15.1886C26.2075 21.3437 22.4645 22.699 18.9017 23.0957C19.4756 23.593 19.9869 24.5683 19.9869 26.0634C19.9869 28.2077 19.9684 29.9334 19.9684 30.4613C19.9684 30.8877 20.2564 31.3874 21.0674 31.2301C27.4213 29.1086 32 23.1037 32 16.0256C32 7.17472 24.8364 0 16.0001 0ZM5.99257 22.8288C5.95733 22.9084 5.83227 22.9322 5.71834 22.8776C5.60229 22.8253 5.53711 22.7168 5.57474 22.6369C5.60918 22.5549 5.7345 22.5321 5.85029 22.587C5.9666 22.6393 6.03284 22.7489 5.99257 22.8288ZM6.7796 23.5321C6.70329 23.603 6.55412 23.5701 6.45291 23.4581C6.34825 23.3464 6.32864 23.197 6.40601 23.125C6.4847 23.0542 6.62937 23.0874 6.73429 23.1991C6.83895 23.3121 6.85935 23.4605 6.7796 23.5321ZM7.31953 24.4321C7.2215 24.5003 7.0612 24.4363 6.96211 24.2938C6.86407 24.1513 6.86407 23.9804 6.96422 23.9119C7.06358 23.8435 7.2215 23.905 7.32191 24.0465C7.41968 24.1914 7.41968 24.3623 7.31953 24.4321ZM8.23267 25.4743C8.14497 25.5712 7.95818 25.5452 7.82146 25.413C7.68156 25.2838 7.64261 25.1004 7.73058 25.0035C7.81934 24.9064 8.00719 24.9337 8.14497 25.0648C8.28381 25.1938 8.3262 25.3785 8.23267 25.4743ZM9.41281 25.8262C9.37413 25.9517 9.19423 26.0088 9.013 25.9554C8.83203 25.9005 8.7136 25.7535 8.75016 25.6266C8.78778 25.5003 8.96848 25.4408 9.15104 25.4979C9.33174 25.5526 9.45044 25.6985 9.41281 25.8262ZM10.7559 25.9754C10.7604 26.1076 10.6067 26.2172 10.4165 26.2196C10.2252 26.2238 10.0704 26.1169 10.0683 25.9868C10.0683 25.8534 10.2185 25.7448 10.4098 25.7416C10.6001 25.7379 10.7559 25.8441 10.7559 25.9754ZM12.0753 25.9248C12.0981 26.0537 11.9658 26.1862 11.7769 26.2215C11.5912 26.2554 11.4192 26.1758 11.3957 26.0479C11.3726 25.9157 11.5072 25.7833 11.6927 25.7491C11.8819 25.7162 12.0512 25.7937 12.0753 25.9248Z"/></svg>
src/stories/Header.tsx:25:          xmlns="http://www.w3.org/2000/svg"
src/stories/LazyImage.stories.tsx:144:      'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 180"%3E%3Crect width="320" height="180" fill="%230A0A0A"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" fill="%23666" font-family="Arial" font-size="14"%3ELoading...%3C/text%3E%3C/svg%3E',
src/stories/assets/youtube.svg:1:<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 32 32"><path fill="#ED1D24" d="M31.3313 8.44657C30.9633 7.08998 29.8791 6.02172 28.5022 5.65916C26.0067 5.00026 16 5.00026 16 5.00026C16 5.00026 5.99333 5.00026 3.4978 5.65916C2.12102 6.02172 1.03665 7.08998 0.668678 8.44657C0 10.9053 0 16.0353 0 16.0353C0 16.0353 0 21.1652 0.668678 23.6242C1.03665 24.9806 2.12102 26.0489 3.4978 26.4116C5.99333 27.0703 16 27.0703 16 27.0703C16 27.0703 26.0067 27.0703 28.5022 26.4116C29.8791 26.0489 30.9633 24.9806 31.3313 23.6242C32 21.1652 32 16.0353 32 16.0353C32 16.0353 32 10.9053 31.3313 8.44657Z"/><path fill="#fff" d="M12.7266 20.6934L21.0902 16.036L12.7266 11.3781V20.6934Z"/></svg>
src/stories/Header.stories.ts:12:  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
src/stories/Header.stories.ts:15:    // More on how to position stories at: https://storybook.js.org/docs/configure/story-layout
src/stories/assets/discord.svg:1:<svg xmlns="http://www.w3.org/2000/svg" width="33" height="32" fill="none" viewBox="0 0 33 32"><g clip-path="url(#clip0_10031_177575)"><mask id="mask0_10031_177575" style="mask-type:luminance" width="33" height="25" x="0" y="4" maskUnits="userSpaceOnUse"><path fill="#fff" d="M32.5034 4.00195H0.503906V28.7758H32.5034V4.00195Z"/></mask><g mask="url(#mask0_10031_177575)"><path fill="#5865F2" d="M27.5928 6.20817C25.5533 5.27289 23.3662 4.58382 21.0794 4.18916C21.0378 4.18154 20.9962 4.20057 20.9747 4.23864C20.6935 4.73863 20.3819 5.3909 20.1637 5.90358C17.7042 5.53558 15.2573 5.53558 12.8481 5.90358C12.6299 5.37951 12.307 4.73863 12.0245 4.23864C12.003 4.20184 11.9614 4.18281 11.9198 4.18916C9.63431 4.58255 7.44721 5.27163 5.40641 6.20817C5.38874 6.21578 5.3736 6.22848 5.36355 6.24497C1.21508 12.439 0.078646 18.4809 0.636144 24.4478C0.638667 24.477 0.655064 24.5049 0.677768 24.5227C3.41481 26.5315 6.06609 27.7511 8.66815 28.5594C8.70979 28.5721 8.75392 28.5569 8.78042 28.5226C9.39594 27.6826 9.94461 26.7968 10.4151 25.8653C10.4428 25.8107 10.4163 25.746 10.3596 25.7244C9.48927 25.3945 8.66058 24.9922 7.86343 24.5354C7.80038 24.4986 7.79533 24.4084 7.85333 24.3653C8.02108 24.2397 8.18888 24.109 8.34906 23.977C8.37804 23.9529 8.41842 23.9478 8.45249 23.963C13.6894 26.3526 19.359 26.3526 24.5341 23.963C24.5682 23.9465 24.6086 23.9516 24.6388 23.9757C24.799 24.1077 24.9668 24.2397 25.1358 24.3653C25.1938 24.4084 25.19 24.4986 25.127 24.5354C24.3298 25.0011 23.5011 25.3945 22.6296 25.7232C22.5728 25.7447 22.5476 25.8107 22.5754 25.8653C23.0559 26.7955 23.6046 27.6812 24.2087 28.5213C24.234 28.5569 24.2794 28.5721 24.321 28.5594C26.9357 27.7511 29.5869 26.5315 32.324 24.5227C32.348 24.5049 32.3631 24.4783 32.3656 24.4491C33.0328 17.5506 31.2481 11.5584 27.6344 6.24623C27.6256 6.22848 27.6105 6.21578 27.5928 6.20817ZM11.1971 20.8146C9.62043 20.8146 8.32129 19.3679 8.32129 17.5913C8.32129 15.8146 9.59523 14.368 11.1971 14.368C12.8115 14.368 14.0981 15.8273 14.0729 17.5913C14.0729 19.3679 12.7989 20.8146 11.1971 20.8146ZM21.8299 20.8146C20.2533 20.8146 18.9541 19.3679 18.9541 17.5913C18.9541 15.8146 20.228 14.368 21.8299 14.368C23.4444 14.368 24.7309 15.8273 24.7057 17.5913C24.7057 19.3679 23.4444 20.8146 21.8299 20.8146Z"/></g></g><defs><clipPath id="clip0_10031_177575"><rect width="32" height="32" fill="#fff" transform="translate(0.5)"/></clipPath></defs></svg>
src/stories/Configure.mdx:54:        href="https://storybook.js.org/docs/configure/styling-and-css/?renderer=react&ref=configure"
src/stories/Configure.mdx:66:        href="https://storybook.js.org/docs/writing-stories/decorators/?renderer=react&ref=configure#context-for-mocking"
src/stories/Configure.mdx:78:          href="https://storybook.js.org/docs/configure/images-and-assets/?renderer=react&ref=configure"
src/stories/Configure.mdx:101:          href="https://storybook.js.org/docs/writing-docs/autodocs/?renderer=react&ref=configure"
src/stories/Configure.mdx:110:          href="https://storybook.js.org/docs/sharing/publish-storybook/?renderer=react&ref=configure#publish-storybook-with-chromatic"
src/stories/Configure.mdx:120:          href="https://storybook.js.org/docs/sharing/design-integrations/?renderer=react&ref=configure#embed-storybook-in-figma-with-the-plugin"
src/stories/Configure.mdx:130:          href="https://storybook.js.org/docs/writing-tests/?renderer=react&ref=configure"
src/stories/Configure.mdx:139:          href="https://storybook.js.org/docs/writing-tests/accessibility-testing/?renderer=react&ref=configure"
src/stories/Configure.mdx:148:          href="https://storybook.js.org/docs/configure/theming/?renderer=react&ref=configure"
src/stories/Configure.mdx:160:        href="https://storybook.js.org/addons/?ref=configure"
src/stories/Configure.mdx:175:        href="https://github.com/storybookjs/storybook"
src/stories/Configure.mdx:185:          href="https://discord.gg/storybook"
src/stories/Configure.mdx:196:          href="https://www.youtube.com/@chromaticui"
src/stories/Configure.mdx:206:          href="https://storybook.js.org/tutorials/?ref=configure"
src/stories/Button.stories.ts:9:// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
src/stories/Button.stories.ts:14:    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
src/stories/Button.stories.ts:17:  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
src/stories/Button.stories.ts:19:  // More on argTypes: https://storybook.js.org/docs/api/argtypes
src/stories/Button.stories.ts:23:  // Use `fn` to spy on the onClick arg, which will appear in the actions panel once invoked: https://storybook.js.org/docs/essentials/actions#story-args
src/stories/Button.stories.ts:30:// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
src/stories/assets/tutorials.svg:1:<svg xmlns="http://www.w3.org/2000/svg" width="33" height="32" fill="none" viewBox="0 0 33 32"><g clip-path="url(#clip0_10031_177597)"><path fill="#B7F0EF" fill-rule="evenodd" d="M17 7.87059C17 6.48214 17.9812 5.28722 19.3431 5.01709L29.5249 2.99755C31.3238 2.64076 33 4.01717 33 5.85105V22.1344C33 23.5229 32.0188 24.7178 30.6569 24.9879L20.4751 27.0074C18.6762 27.3642 17 25.9878 17 24.1539L17 7.87059Z" clip-rule="evenodd" opacity=".7"/><path fill="#87E6E5" fill-rule="evenodd" d="M1 5.85245C1 4.01857 2.67623 2.64215 4.47507 2.99895L14.6569 5.01848C16.0188 5.28861 17 6.48354 17 7.87198V24.1553C17 25.9892 15.3238 27.3656 13.5249 27.0088L3.34311 24.9893C1.98119 24.7192 1 23.5242 1 22.1358V5.85245Z" clip-rule="evenodd"/><path fill="#61C1FD" fill-rule="evenodd" d="M15.543 5.71289C15.543 5.71289 16.8157 5.96289 17.4002 6.57653C17.9847 7.19016 18.4521 9.03107 18.4521 9.03107C18.4521 9.03107 18.4521 25.1106 18.4521 26.9629C18.4521 28.8152 19.3775 31.4174 19.3775 31.4174L17.4002 28.8947L16.2575 31.4174C16.2575 31.4174 15.543 29.0765 15.543 27.122C15.543 25.1674 15.543 5.71289 15.543 5.71289Z" clip-rule="evenodd"/></g><defs><clipPath id="clip0_10031_177597"><rect width="32" height="32" fill="#fff" transform="translate(0.5)"/></clipPath></defs></svg>
src/stories/assets/accessibility.svg:1:<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="none" viewBox="0 0 48 48"><title>Accessibility</title><circle cx="24.334" cy="24" r="24" fill="#A849FF" fill-opacity=".3"/><path fill="#A470D5" fill-rule="evenodd" d="M27.8609 11.585C27.8609 9.59506 26.2497 7.99023 24.2519 7.99023C22.254 7.99023 20.6429 9.65925 20.6429 11.585C20.6429 13.575 22.254 15.1799 24.2519 15.1799C26.2497 15.1799 27.8609 13.575 27.8609 11.585ZM21.8922 22.6473C21.8467 23.9096 21.7901 25.4788 21.5897 26.2771C20.9853 29.0462 17.7348 36.3314 17.3325 37.2275C17.1891 37.4923 17.1077 37.7955 17.1077 38.1178C17.1077 39.1519 17.946 39.9902 18.9802 39.9902C19.6587 39.9902 20.253 39.6293 20.5814 39.0889L20.6429 38.9874L24.2841 31.22C24.2841 31.22 27.5529 37.9214 27.9238 38.6591C28.2948 39.3967 28.8709 39.9902 29.7168 39.9902C30.751 39.9902 31.5893 39.1519 31.5893 38.1178C31.5893 37.7951 31.3639 37.2265 31.3639 37.2265C30.9581 36.3258 27.698 29.0452 27.0938 26.2771C26.8975 25.4948 26.847 23.9722 26.8056 22.7236C26.7927 22.333 26.7806 21.9693 26.7653 21.6634C26.7008 21.214 27.0231 20.8289 27.4097 20.7005L35.3366 18.3253C36.3033 18.0685 36.8834 16.9773 36.6256 16.0144C36.3678 15.0515 35.2722 14.4737 34.3055 14.7305C34.3055 14.7305 26.8619 17.1057 24.2841 17.1057C21.7062 17.1057 14.456 14.7947 14.456 14.7947C13.4893 14.5379 12.3937 14.9873 12.0715 15.9502C11.7493 16.9131 12.3293 18.0044 13.3604 18.3253L21.2873 20.7005C21.674 20.8289 21.9318 21.214 21.9318 21.6634C21.9174 21.9493 21.9053 22.2857 21.8922 22.6473Z" clip-rule="evenodd"/></svg>
src/tests/security.test.ts:29:      expect(Sanitizer.validateUrl('https://example.com')).toBe(true);
src/tests/security.test.ts:30:      expect(Sanitizer.validateUrl('http://example.com')).toBe(true);
src/tests/activeListeningIntegration.test.ts:125:    origin: 'http://localhost',
src/tests/e2e/titane_e2e.test.ts:359:        { title: 'Cognitive Architecture Overview', url: 'https://example.com/1' },
src/tests/e2e/titane_e2e.test.ts:360:        { title: 'TITANE Systems Design', url: 'https://example.com/2' },
src/hooks/useChat.ts:1806:   curl -fsSL https://ollama.com/install.sh | sh

## Invoke outside canonical wrapper (excluding tests)
src/modules/devSudo/devSudoBackendHandlers.ts:125:   invoke('memory_scan') → #[tauri::command] memory_scan()
src/modules/devSudo/devSudoBackendHandlers.ts:126:   invoke('secure_store_key') → #[tauri::command] secure_store_key()
src/modules/devSudo/devSudoBackendHandlers.ts:127:   invoke('camera_start') → #[tauri::command] camera_start()
src/modules/devSudo/devSudoBackendHandlers.ts:298:   invoke('${handlerName}').then(console.log).catch(console.error)
src/modules/devSudo/devSudoSingularityHandlers.ts:948:  await invoke('command');
src/services/api/index.ts:15: * Remplace les `invoke()` dispersés par une API cohérente + cache + validation.
src/services/api/index.ts:126: * Phase 2 (Semaine 2): Refactor tous les invoke() existants
src/services/api/index.ts:130: * grep -r "invoke(" src/ --include="*.ts" --include="*.tsx"
src/services/api/index.ts:136: *    `invoke('memory_get_active_projects')`
src/services/api/index.ts:140: *    `invoke('conversation_generate', { args: { message, conversationId, mode } })`
src/services/api/index.ts:144: *    `invoke('speak', { text })`
src/services/api/index.ts:148: *    `invoke('persona_get_multipliers')`
src/services/api/index.ts:152: *    `invoke('system_get_status')`
src/services/evolutionEngine/index.ts:254:      // await invoke('sync_evolution_state', { snapshot });
src/services/cognitive/index.ts:211:    await invoke('check_sqlite_available');
src/services/ai/providers/tauriChat.ts:9: *   PHASE 4Ω: Protection invoke() • Timeout handling • Error isolation
src/hooks/useMultimodalPresence.ts:285:    // 1. Engine call: multimodalPresenceEngine.activateMirroring() or invoke('presence:activate_mirroring')
src/hooks/useMultimodalPresence.ts:296:    // 1. Engine call: multimodalPresenceEngine.deactivateMirroring() or invoke('presence:deactivate_mirroring')
src/services/tauriClient.ts:4: * Client centralisé pour tous les appels Tauri invoke()
src/components/ChatErrorBoundary.tsx:358:      // await invoke('report_chat_error', {
src/config/offline-first.ts:29:  // Use invoke('ollama_generate') instead of direct HTTP
src/os/bridge/TauriBridge.ts:32:      await this.invoke('ping');
src/os/bridge/TauriBridge.ts:162:    return Promise.all(commands.map(cmd => this.invoke(cmd.name, cmd.args))) as Promise<
src/os/bridge/TauriBridge.ts:172:      await this.invoke('ping');
src/os/bridge/StateBridge.ts:84:      await this.bridge.invoke('set_state', { key, value });
src/os/bridge/StateBridge.ts:116:      await this.bridge.invoke('delete_state', { key });
src/os/bridge/StateBridge.ts:225:        await this.bridge.invoke('set_state', { key, value });
src/hooks/useDevicePermissions.ts:266:  // - API: await invoke('plugin:screenshots|capture', {monitor: 0})
src/test/integration.test.ts:20:import * as tauriCore from '@tauri-apps/api/core';
src/utils/invoke.ts:11: * Wrapper universel pour invoke() avec gestion d'erreur automatique
src/utils/invoke.ts:36: * Wrapper pour invoke() avec retry automatique
src/utils/invoke.ts:78: * Wrapper pour invoke() avec timeout
src/lib/logger.ts:285:      // await invoke('log_to_file', { entry: this.formatEntry(_entry) });
src/core/commands/TAURI_COMMANDS.ts:221: * Helper pour invoke() avec validation et protection robuste
src/core/devops/LocalAgentEngine.ts:960:      // 1. Tauri: invoke('fs_exists', {path}) - requires Tauri command registration
src/core/devops/LocalAgentEngine.ts:972:      // 1. Tauri: invoke('read_json_file', {path}) - type-safe, sandboxed
src/core/devops/VisualDevOpsEngine.ts:816:    // 2. Tauri filesystem: Use invoke('fs:write_file', { path, content }) to save
src/lib/tauriClient.ts:5: * - `invoke()` autorisé uniquement dans ce fichier
src/lib/tauriClient.ts:53: * **RÈGLE CRITIQUE:** Aucun appel `invoke()` direct autorisé hors de ce fichier
src/lib/tauriClient.ts:108:    return await this.invoke(
src/lib/tauriClient.ts:115:    return await this.invoke(
src/lib/tauriClient.ts:122:    return await this.invoke(
src/lib/tauriClient.ts:129:    return await this.invoke(
src/lib/tauriClient.ts:136:    return await this.invoke(
src/lib/tauriClient.ts:143:    return await this.invoke(
src/lib/tauriClient.ts:150:    return await this.invoke(
src/lib/tauriClient.ts:157:    return await this.invoke(
src/lib/tauriClient.ts:164:    return await this.invoke(
src/lib/tauriClient.ts:171:    return await this.invoke(
src/lib/tauriClient.ts:178:    return await this.invoke(
src/lib/tauriClient.ts:185:    return await this.invoke(
src/lib/tauriClient.ts:192:    return await this.invoke(
src/lib/tauriClient.ts:199:    return await this.invoke(
src/lib/tauriClient.ts:206:    return await this.invoke(
src/lib/tauriClient.ts:213:    return await this.invoke(
src/lib/tauriClient.ts:220:    return await this.invoke(
src/lib/tauriClient.ts:227:    return await this.invoke(
src/lib/tauriClient.ts:234:    return await this.invoke(
src/lib/tauriClient.ts:241:    return await this.invoke(
src/lib/tauriClient.ts:248:    return await this.invoke(
src/lib/tauriClient.ts:255:    return await this.invoke(
src/lib/tauriClient.ts:262:    return await this.invoke(
src/lib/tauriClient.ts:269:    return await this.invoke(
src/lib/tauriClient.ts:276:    return await this.invoke(
src/lib/tauriClient.ts:283:    return await this.invoke(
src/lib/tauriClient.ts:290:    return await this.invoke(
src/lib/tauriClient.ts:297:    return await this.invoke(
src/lib/tauriClient.ts:304:    return await this.invoke(
src/lib/tauriClient.ts:311:    return await this.invoke(
src/lib/tauriClient.ts:318:    return await this.invoke(
src/lib/tauriClient.ts:325:    return await this.invoke(
src/lib/tauriClient.ts:332:    return await this.invoke(
src/lib/tauriClient.ts:339:    return await this.invoke(
src/lib/tauriClient.ts:346:    return await this.invoke(
src/lib/tauriClient.ts:353:    return await this.invoke(
src/lib/tauriClient.ts:360:    return await this.invoke(
src/lib/tauriClient.ts:367:    return await this.invoke(
src/lib/tauriClient.ts:374:    return await this.invoke(
src/lib/tauriClient.ts:381:    return await this.invoke(
src/lib/tauriClient.ts:388:    return await this.invoke(
src/lib/tauriClient.ts:395:    return await this.invoke(
src/lib/tauriClient.ts:402:    return await this.invoke(
src/lib/tauriClient.ts:409:    return await this.invoke(
src/lib/tauriClient.ts:416:    return await this.invoke(
src/lib/tauriClient.ts:423:    return await this.invoke(
src/lib/tauriClient.ts:430:    return await this.invoke(
src/lib/tauriClient.ts:439:    return await this.invoke(
src/lib/tauriClient.ts:446:    return await this.invoke(
src/lib/tauriClient.ts:453:    return await this.invoke(
src/lib/tauriClient.ts:460:    return await this.invoke(
src/lib/tauriClient.ts:467:    return await this.invoke(
src/lib/tauriClient.ts:474:    return await this.invoke(
src/lib/tauriClient.ts:481:    return await this.invoke(
src/lib/tauriClient.ts:488:    return await this.invoke(
src/lib/tauriClient.ts:495:    return await this.invoke(
src/lib/tauriClient.ts:502:    return await this.invoke(
src/lib/tauriClient.ts:509:    return await this.invoke(
src/lib/tauriClient.ts:516:    return await this.invoke(
src/lib/tauriClient.ts:523:    return await this.invoke(
src/lib/tauriClient.ts:530:    return await this.invoke(
src/lib/tauriClient.ts:537:    return await this.invoke(
src/lib/tauriClient.ts:544:    return await this.invoke(
src/lib/tauriClient.ts:551:    return await this.invoke(
src/lib/tauriClient.ts:558:    return await this.invoke(
src/lib/tauriClient.ts:565:    return await this.invoke(
src/lib/tauriClient.ts:572:    return await this.invoke(
src/lib/tauriClient.ts:579:    return await this.invoke(
src/lib/tauriClient.ts:586:    return await this.invoke(
src/lib/tauriClient.ts:593:    return await this.invoke(
src/lib/tauriClient.ts:600:    return await this.invoke(
src/lib/tauriClient.ts:607:    return await this.invoke(
src/lib/tauriClient.ts:614:    return await this.invoke(
src/lib/tauriClient.ts:621:    return await this.invoke(
src/lib/tauriClient.ts:628:    return await this.invoke(
src/lib/tauriClient.ts:635:    return await this.invoke(
src/lib/tauriClient.ts:642:    return await this.invoke(
src/lib/tauriClient.ts:649:    return await this.invoke(
src/lib/tauriClient.ts:656:    return await this.invoke(
src/lib/tauriClient.ts:663:    return await this.invoke(
src/lib/tauriClient.ts:670:    return await this.invoke(
src/lib/tauriClient.ts:677:    return await this.invoke(
src/lib/tauriClient.ts:684:    return await this.invoke(
src/lib/tauriClient.ts:691:    return await this.invoke(
src/lib/tauriClient.ts:698:    return await this.invoke(
src/lib/tauriClient.ts:705:    return await this.invoke(
src/lib/tauriClient.ts:712:    return await this.invoke(
src/lib/tauriClient.ts:719:    return await this.invoke(
src/lib/tauriClient.ts:726:    return await this.invoke(
src/lib/tauriClient.ts:733:    return await this.invoke(
src/lib/tauriClient.ts:740:    return await this.invoke(
src/lib/tauriClient.ts:747:    return await this.invoke(
src/lib/tauriClient.ts:754:    return await this.invoke(
src/lib/tauriClient.ts:761:    return await this.invoke(
src/lib/tauriClient.ts:768:    return await this.invoke(
src/lib/tauriClient.ts:775:    return await this.invoke(
src/lib/tauriClient.ts:782:    return await this.invoke(
src/lib/tauriClient.ts:789:    return await this.invoke(
src/lib/tauriClient.ts:796:    return await this.invoke(
src/lib/tauriClient.ts:803:    return await this.invoke(
src/lib/tauriClient.ts:810:    return await this.invoke(
src/lib/tauriClient.ts:817:    return await this.invoke(
src/lib/tauriClient.ts:824:    return await this.invoke(
src/lib/tauriClient.ts:831:    return await this.invoke(
src/lib/tauriClient.ts:838:    return await this.invoke(
src/lib/tauriClient.ts:845:    return await this.invoke(
src/lib/tauriClient.ts:852:    return await this.invoke(
src/lib/tauriClient.ts:859:    return await this.invoke(
src/lib/tauriClient.ts:866:    return await this.invoke(
src/lib/tauriClient.ts:873:    return await this.invoke(
src/lib/tauriClient.ts:880:    return await this.invoke(
src/lib/tauriClient.ts:887:    return await this.invoke(
src/lib/tauriClient.ts:894:    return await this.invoke(
src/lib/tauriClient.ts:901:    return await this.invoke(
src/lib/tauriClient.ts:908:    return await this.invoke(
src/lib/tauriClient.ts:915:    return await this.invoke(
src/lib/tauriClient.ts:922:    return await this.invoke(
src/lib/tauriClient.ts:929:    return await this.invoke(
src/lib/tauriClient.ts:936:    return await this.invoke(
src/lib/tauriClient.ts:943:    return await this.invoke(
src/lib/tauriClient.ts:950:    return await this.invoke(
src/lib/tauriClient.ts:957:    return await this.invoke(
src/lib/tauriClient.ts:964:    return await this.invoke(
src/lib/tauriClient.ts:971:    return await this.invoke(
src/lib/tauriClient.ts:978:    return await this.invoke(
src/lib/tauriClient.ts:985:    return await this.invoke(
src/lib/tauriClient.ts:992:    return await this.invoke(
src/lib/tauriClient.ts:999:    return await this.invoke(
src/lib/tauriClient.ts:1006:    return await this.invoke(
src/lib/tauriClient.ts:1013:    return await this.invoke(
src/lib/tauriClient.ts:1020:    return await this.invoke(
src/lib/tauriClient.ts:1027:    return await this.invoke(
src/lib/tauriClient.ts:1034:    return await this.invoke(
src/lib/tauriClient.ts:1041:    return await this.invoke(
src/lib/tauriClient.ts:1048:    return await this.invoke(
src/lib/tauriClient.ts:1055:    return await this.invoke(
src/lib/tauriClient.ts:1062:    return await this.invoke(
src/lib/tauriClient.ts:1069:    return await this.invoke(
src/lib/tauriClient.ts:1076:    return await this.invoke(
src/lib/tauriClient.ts:1083:    return await this.invoke(
src/lib/tauriClient.ts:1090:    return await this.invoke(
src/lib/tauriClient.ts:1097:    return await this.invoke(
src/lib/tauriClient.ts:1104:    return await this.invoke(
src/lib/tauriClient.ts:1111:    return await this.invoke(
src/lib/tauriClient.ts:1118:    return await this.invoke(
src/lib/tauriClient.ts:1125:    return await this.invoke(
src/lib/tauriClient.ts:1132:    return await this.invoke(
src/lib/tauriClient.ts:1139:    return await this.invoke(
src/lib/tauriClient.ts:1146:    return await this.invoke(
src/lib/tauriClient.ts:1153:    return await this.invoke(
src/lib/tauriClient.ts:1160:    return await this.invoke(
src/lib/tauriClient.ts:1167:    return await this.invoke(
src/lib/tauriClient.ts:1174:    return await this.invoke(
src/lib/tauriClient.ts:1181:    return await this.invoke(
src/lib/tauriClient.ts:1188:    return await this.invoke(
src/lib/tauriClient.ts:1195:    return await this.invoke(
src/lib/tauriClient.ts:1202:    return await this.invoke(
src/lib/tauriClient.ts:1209:    return await this.invoke(
src/lib/tauriClient.ts:1216:    return await this.invoke(
src/lib/tauriClient.ts:1223:    return await this.invoke(
src/lib/tauriClient.ts:1230:    return await this.invoke(

## Unbounded loop patterns
src/components/ConsciousnessDashboard.tsx:54:      const interval = setInterval(updateData, 3000); // Rafraîchir toutes les 3 secondes
src/components/BootHealthDashboard.tsx:108:    const interval = setInterval(fetchMetrics, 30000);
src/components/PerformanceDashboard.tsx:71:    const interval = setInterval(refreshMetrics, 2000);
src/components/RealityCenter/RealityCenter.tsx:241:    const interval = setInterval(async () => {
src/apps/devtools/components/CoreHealthMonitor.tsx:49:      const interval = setInterval(fetchCoreHealth, 3000);
src/components/devtools/CoreHealthMonitor.tsx:106:    const interval = setInterval(fetchCoresHealth, refreshInterval);
src/components/performance/PerformanceDashboard.tsx:370:    const interval = setInterval(refresh, refreshInterval);
src/apps/devtools/components/EventStream.tsx:60:    const interval = setInterval(() => {
src/components/devtools/MetricsDisplay.tsx:98:    const interval = setInterval(fetchMetrics, refreshInterval);
src/apps/devtools/components/MetricsDisplay.tsx:78:      const interval = setInterval(fetchMetrics, 2000);
src/components/devtools/LogViewer.tsx:67:    const interval = setInterval(fetchLogs, 1000);
src/components/diagnostics/SplashWatchdog.tsx:193:    checkInterval = setInterval(checkBootProgress, 500);
src/apps/devtools/components/LogViewer.tsx:109:      const interval = setInterval(fetchLogs, 2000);
src/components/QuantumCenter/QuantumCenter.tsx:86:    const interval = setInterval(() => {
src/visual-engine/OSIntegrationBridge.ts:509:    this.pollTimer = setInterval(() => {
src/components/admin/AdminDashboard.tsx:270:    const intervalId = setInterval(fetchSnapshot, refreshInterval);
src/components/admin/AdminTimeline.tsx:311:    const intervalId = setInterval(loadData, refreshInterval);
src/components/experience/GlobalExpBar.tsx:37:    const interval = setInterval(fetchExpState, REFRESH_INTERVALS.NORMAL); // Refresh toutes les 5s
src/pages/TimeNavigator.tsx:54:    const interval = setInterval(loadStats, REFRESH_INTERVALS.SLOW); // Refresh every 30s
src/components/experience/XPBar.tsx:42:    const interval = setInterval(updateBar, 1000);
src/visual-engine/UIIntegrityChecker.ts:190:      this.checkTimer = setInterval(() => {
src/components/evolution/EvolutionDashboard.tsx:304:    const interval = setInterval(
src/visual-engine/modes/UIModeManager.ts:440:    this.performanceCheckInterval = window.setInterval(() => {
src/visual-engine/INTEGRATION_GUIDE_V21.ts:142: *     const interval = setInterval(() => {
src/visual-engine/EffectsOrchestrator.ts:534:    setInterval(() => {
src/pages/DevTools.tsx:174:    const interval = setInterval(() => {
src/components/MetaCenter/MetaCenter.tsx:216:    const interval = setInterval(loadState, REFRESH_INTERVALS.NORMAL);
src/components/SystemIntegrationHub.tsx:240:    const interval = setInterval(integrationLoop, 3000); // Toutes les 3 secondes
src/components/layout/TopNav.tsx:126:    const interval = window.setInterval(() => {
src/pages/PerformanceTest.tsx:99:    const interval = setInterval(() => {
src/quantum/gpu_acceleration.ts:209:    this.cleanupInterval = setInterval(() => this.cleanup(), 2000);
src/quantum/component_cache.ts:196:    this.cleanupInterval = setInterval(() => this.cleanup(), 1000);
src/components/fusion/PerfectFusionDashboard.tsx:97:    const interval = setInterval(loadOptimizationMetrics, 5000);
src/components/dev/PredictiveDashboard.tsx:25:    const interval = setInterval(() => {
src/pages/TimePage.tsx:144:    const interval = setInterval(loadStats, REFRESH_INTERVALS.SLOW);
src/components/dev/ConsoleMonitorDashboard.tsx:22:    const interval = setInterval(() => {
src/core/experience/XP_ENGINE.ts:173:  autoSaveIntervalId = setInterval(() => {
src/features/developer-mode/useDeveloperMode.ts:381:    const interval = setInterval(fetchDashboard, 10000);
src/components/HyperCenter/HyperCenter.tsx:234:    const interval = setInterval(loadState, REFRESH_INTERVALS.NORMAL);
src/components/MemoryEvolution/MemoryEvolutionCenter.tsx:511:    const interval = setInterval(() => {
src/pages/OrchestrationMetaCenter.tsx:715:    const interval = setInterval(loadAllState, REFRESH_INTERVALS.NORMAL);
src/monitoring/index.ts:249:    setInterval(() => {
src/components/monitoring/ServiceMetricsPanel.tsx:58:      const interval = setInterval(loadStats, refreshInterval);
src/pages/Experience.tsx:27:    const interval = setInterval(() => {
src/components/monitoring/SingularityDashboard.tsx:928:    const interval = setInterval(fetchSystemMetrics, refreshInterval);
src/components/optimization/UltimateOptimizationDashboard.tsx:115:    const interval = setInterval(refreshMetrics, 2000);
src/pages/Stats.tsx:104:    const intervalId = setInterval(fetchCognitive, 5000);
src/core/services/unifiedMemory.ts:762:    this.cleanupTimer = setInterval(() => {
src/components/monitoring/AnomalyDashboard.tsx:56:      const interval = setInterval(loadData, refreshInterval);
src/core/singularity/SingularityFusionCore.ts:174:    this.syncInterval = setInterval(() => {
src/core/singularity/SingularityFusionCore.ts:179:    this.autoHealInterval = setInterval(() => {
src/components/monitoring/CommandStatsTable.tsx:73:      const interval = setInterval(loadStats, refreshInterval);
src/core/engines/SINGULARITY_ENGINE.ts:464:    this.syncTimer = window.setInterval(() => {
src/components/monitoring/SystemHealthMonitor.tsx:84:    const interval = setInterval(() => {
src/components/monitoring/PredictiveAlertsDashboard.tsx:42:    const interval = setInterval(updateAlerts, refreshInterval);
src/components/panels/GovernancePanel.tsx:149:    const interval = setInterval(loadReport, 60000);
src/components/monitoring/GlobalMetricsSummary.tsx:56:      const interval = setInterval(loadStats, refreshInterval);
src/ui/Menu.tsx:209:    const interval = window.setInterval(() => {
src/features/system-center/hooks/useDebuggerLiveOS.ts:796:          refreshIntervalRef.current = setInterval(() => {
src/services/automation/automationXPService.ts:497:    this.automationExecutor = setInterval(() => {
src/features/system-center/hooks/useNodeCluster.ts:119:      const interval = setInterval(refreshStatus, refreshInterval);
src/features/system-center/hooks/useSystemLogs.ts:95:      const interval = setInterval(refreshLogs, refreshInterval);
src/features/system-center/hooks/useHyperVision.ts:110:        intervalRef.current = setInterval(async () => {
src/components/SingularityMonitor.tsx:31:        interval = setInterval(async () => {
src/main.tsx:321:  window.setInterval(render, 1000);
src/components/diagnostic/OnlineDiagnostic.tsx:70:    const interval = setInterval(() => {
src/features/kernel/NexusMesh.tsx:20:    const interval = setInterval(() => {
src/features/kernel/MemoryGraph.tsx:29:    const interval = setInterval(() => {
src/features/kernel/MemoryGraph.tsx:32:    const telemetryInterval = setInterval(() => {
src/features/system-center/tabs/DevToolsTab.tsx:224:      const interval = setInterval(fetchDebugger, 2000);
src/features/kernel/HeliosView.tsx:27:    const interval = setInterval(() => {
src/features/kernel/EvolutionPipeline.tsx:30:    const interval = setInterval(() => {
src/components/ui/Toast.tsx:78:    const progressInterval = setInterval(() => {
src/features/kernel/HarmoniaFlow.tsx:23:    const interval = setInterval(() => {
src/core/cognitive/USER_RHYTHM_ANALYZER.ts:65:    setInterval(() => {
src/ui/pages/ControlPanel/ControlPanel.tsx:110:    const interval = setInterval(loadSystemInfo, REFRESH_INTERVALS.NORMAL);
src/features/kernel/SentinelAlerts.tsx:25:    const interval = setInterval(() => {
src/core/cognitive/INTERFACE_MIRROR.ts:59:    setInterval(() => {
src/core/cognitive/COGNITIVE_ENGINE.ts:71:    this.syncInterval = setInterval(() => {
src/features/qa-monitoring/QAMonitoringPage.tsx:886:    const interval = window.setInterval(() => {
src/services/ai/performanceAlerts.ts:142:    this.checkInterval = setInterval(() => {
src/engines/holopresence/holoPresenceEngine.ts:159:    this.updateInterval = setInterval(() => this.tick(), 1000 / this.UPDATE_RATE);
src/core/optimization/PerformanceOptimizer.ts:153:    this.metricsInterval = window.setInterval(async () => {
src/services/ai/performanceMonitor.ts:196:    this.cleanupTimer = setInterval(() => {
src/engines/autopoiesis/autopoiesisEngine.ts:276:    this.intervalId = setInterval(() => this.tick(), 1000); // 1 Hz
src/ui/pages/ControlPanel/sections/LogsSection.tsx:40:      const interval = setInterval(loadLogs, 2000);
src/services/ai/apiCache.ts:108:      this.cleanupInterval = setInterval(() => this.cleanup(), REFRESH_INTERVALS.SLOW);
src/ui/pages/SelfHealingDashboard.tsx:304:      const interval = setInterval(fetchData, REFRESH_INTERVALS.NORMAL);
src/engines/phasespace/phaseSpaceEngine.ts:265:    this.intervalId = setInterval(() => this.tick(), 500); // 2 Hz
src/features/conversation/ChatMessage.tsx:127:    const interval = setInterval(() => {
src/ui/pages/NodeClusterDashboard.tsx:72:      const interval = setInterval(fetchData, 2000);
src/features/conversation/ProviderStatusPanel.tsx:104:    const interval = setInterval(updateStats, 2000);
src/features/one-core/useOneCore.ts:329:    const interval = setInterval(() => {
src/core/safety/CrashGuardEngine.ts:156:    this.detectionInterval = window.setInterval(async () => {
src/features/chat/ProviderStatusPanel.tsx:104:    const interval = setInterval(updateStats, 2000);
src/features/audio-center/services/audioService.ts:437:        const interval = setInterval(() => {
src/engines/psyche/archetypeResonanceEngine.ts:387:    this.updateInterval = window.setInterval(() => {
src/ui/pages/Chat.tsx:635:      interval = setInterval(() => {
src/ui/pages/HyperVisionDashboard.tsx:72:      const interval = setInterval(fetchMetrics, 2000);
src/core/autonomy/SingularityAutonomyEngine.ts:239:    this.scanIntervalId = setInterval(() => {
src/engines/uiux/UIUXEngine.ts:195:      this.adaptIntervalId = setInterval(() => {
src/hooks/useSingularitySync.ts:202:    syncIntervalRef.current = window.setInterval(sync, syncInterval);
src/hooks/useSingularitySync.ts:223:      syncIntervalRef.current = window.setInterval(sync, syncInterval);
src/services/mcp/MCPOrchestrator.ts:1244:    this.evolutionInterval = setInterval(async () => {
src/hooks/useCognitive.ts:343:    const interval = setInterval(() => {
src/features/chat/ChatMessage.tsx:127:    const interval = setInterval(() => {
src/hooks/useAudioStreaming.ts:119:      statsIntervalRef.current = window.setInterval(async () => {
src/services/ai/orchestrator.ts:242:    this.quickFailCleanupInterval = setInterval(() => {
src/hooks/useConversationEngine.ts:188:      healthCheckIntervalRef.current = window.setInterval(async () => {
src/hooks/useExpression.ts:65:    const interval = setInterval(() => {
src/hooks/useExpression.ts:122:    const interval = setInterval(() => {
src/services/ai/singularityKernel.ts:794:    this.cognitiveInterval = setInterval(() => {
src/hooks/useBackendHealth.ts:165:    const interval = setInterval(() => {
src/services/audio/audioSelfHeal.ts:62:    this.checkTimer = setInterval(() => this.performHealthCheck(), this.CHECK_INTERVAL);
src/engines/uiux/detectors/OverloadDetector.ts:72:    this.idleCheckInterval = setInterval(() => this.checkIdleTime(), 5000);
src/services/memory/memorySelfHealEngine.ts:817:    this.healthCheckTimer = window.setInterval(async () => {
src/services/memory/memorySelfHealEngine.ts:838:      this.autoRepairTimer = window.setInterval(async () => {
src/hooks/useMemoryEngine.ts:507:    const interval = setInterval(refreshStats, 30000);
src/engines/conscious/consciousDynamicsModel.ts:177:    this.updateInterval = setInterval(() => this.tick(), 33); // 30 Hz
src/services/audio/audioStreaming.ts:245:    this.stateMonitoringInterval = window.setInterval(async () => {
src/services/ai/metaKernel.ts:717:    this.observationInterval = setInterval(() => {
src/hooks/useVitals.ts:200:      const interval = setInterval(fetchVitals, pollInterval);
src/engines/embodiment/embodiedPresenceEngine.ts:263:    this.updateInterval = window.setInterval(() => {
src/hooks/useChatCore.ts:209:            while (true) {
src/services/adminEngine/logEngine.ts:526:    this.purgeIntervalId = setInterval(() => {
src/services/ai/chatEngine.ts:1267:      while (true) {
src/services/adminEngine/stateAggregator.ts:504:    this.pollingIntervalId = setInterval(async () => {
src/engines/narrative/internalNarrativeEngine.ts:123:    this.updateInterval = setInterval(() => this.tick(), 100); // 10 Hz
src/services/telemetry/useProductionHealthTelemetry.ts:85:    intervalRef.current = setInterval(loadData, refreshIntervalMs);
src/hooks/usePersistentMemory.ts:620:    const interval = setInterval(refresh, refreshInterval);
src/services/ai/cognitiveCacheConnector.ts:54:  updateInterval = setInterval(() => {
src/engines/interoception/interoceptionEngine.ts:154:    this.updateInterval = setInterval(() => {
src/hooks/useUnifiedMemory.ts:119:      statsIntervalRef.current = setInterval(refreshStats, safeRefreshInterval);
src/hooks/useUnifiedMemory.ts:394:      intervalRef.current = setInterval(refresh, refreshInterval);
src/services/ai/healthMonitor.ts:72:    this.monitoringInterval = window.setInterval(() => {
src/engines/cognitive/cognitiveLayoutIntegrations.ts:27:    this.updateInterval = setInterval(() => {
src/engines/cognitive/cognitiveLayoutIntegrations.ts:134:    this.updateInterval = setInterval(() => {
src/engines/cognitive/cognitiveLayoutIntegrations.ts:396:    this.monitorInterval = setInterval(() => {
src/tauri-init-fix.ts:42:  const waitForTauri = setInterval(() => {
src/services/devices/deviceHealthService.ts:505:    this.monitoringInterval = setInterval(async () => {
src/services/cache/responseCache.ts:443:    this.cleanupInterval = setInterval(
src/services/monitoring/alerting.ts:221:    this.checkTimer = setInterval(() => {
src/engines/cognitive/cognitiveLayoutEngine.ts:426:    this.observationInterval = setInterval(() => {
src/services/monitoring/predictiveEngine.ts:409:  setInterval(() => predictiveEngine.cleanup(), 3600000);
src/services/singularityConnections.ts:138:      this.updateInterval = window.setInterval(async () => {
src/services/unified/UnifiedMemory.ts:1023:    this.cleanupScheduler = setInterval(
src/services/unified/UnifiedMemory.ts:1036:    this.consolidationScheduler = setInterval(
src/services/unified/UnifiedMemory.ts:1049:    this.decayScheduler = setInterval(() => this.decay(), this.config.decay.intervalMs);
src/services/monitoring/consoleMonitor.ts:236:    setInterval(() => this.analyzeAndCleanup(), 60000); // Every minute
src/hooks/useSystemHealth.ts:399:      const interval = setInterval(refreshHealth, intervalMs);
src/services/selfHealing/selfHealingObserver.ts:250:    this.cleanupInterval = setInterval(() => {
src/hooks/useTitaneCore.ts:111:    const interval = setInterval(() => {
src/services/selfHealing/selfHealingSyncLayer.ts:452:    this.syncInterval = setInterval(async () => {
src/engines/continuum/metaContinuumEngine.ts:267:    this.nowPulseInterval = window.setInterval(() => {
src/hooks/useAutoTimeout.ts:119:    const interval = setInterval(() => {
src/engines/time/TimeEngine.ts:235:    this.tickInterval = setInterval(() => {
src/services/backup/AutoBackupService.ts:115:    this.backupTimer = setInterval(() => this.checkAndRunBackup(), 60000);
src/engines/identity/unifiedIdentityKernel.ts:251:    this.updateInterval = setInterval(() => this.tick(), 100); // 10 Hz
src/engines/time/EnergyEngine.ts:200:    this.tickInterval = setInterval(() => {
src/services/cognitive/CognitiveObservabilityEngine.ts:746:    this.cleanupInterval = setInterval(
src/services/cognitive/SemanticMemoryEngine.ts:513:    this.cleanupInterval = setInterval(() => {
src/engines/metasingularity/metaSingularityKernel.ts:298:    this.intervalId = setInterval(() => this.tick(), 200); // 5 Hz
src/services/autoAuditEngine.ts:83:    this.intervalId = setInterval(() => {
src/engines/expression/expressionEngine.ts:173:    this.updateInterval = setInterval(() => this.tick(), 1000 / this.UPDATE_RATE);
src/hooks/useChat.ts:731:    const interval = setInterval(checkProvidersAvailability, REFRESH_INTERVALS.SLOW);
src/hooks/useSingularityState.ts:227:    const interval = setInterval(() => {
src/hooks/useProviderStatus.ts:128:      const interval = setInterval(refresh, refreshInterval);
src/context/TitanStateContext.tsx:524:    autoSaveTimerRef.current = setInterval(async () => {
src/hooks/useFusionEngine.ts:196:    const interval = setInterval(refresh, 5000);
src/services/evolutionEngine/collector.ts:123:    this.collectIntervalId = setInterval(() => {
src/services/evolutionEngine/index.ts:237:    this.singularitySyncIntervalId = setInterval(() => {
src/services/evolutionEngine/analyzer.ts:115:    this.analyzeIntervalId = setInterval(() => {
src/hooks/useUnifiedPresence.ts:139:    const interval = setInterval(() => {
src/services/evolutionEngine/planner.ts:100:    this.planIntervalId = setInterval(() => {
src/hooks/useAdvancedPerformance.ts:296:    updateIntervalRef.current = window.setInterval(() => {
src/lib/predictiveAlerts.ts:299:    this.trackingInterval = setInterval(() => {
src/lib/anomalyDetector.ts:62:    this.trackingInterval = setInterval(() => {
src/utils/performanceGuards.ts:76:    this.monitoringInterval = setInterval(() => {
src/utils/aiPredictiveEngine.ts:192:    setInterval(collectMetrics, 30000);
src/utils/advancedBootMonitor.ts:260:    setInterval(checkMemory, 30000);
src/utils/advancedBootMonitor.ts:268:    this.healthCheckInterval = setInterval(() => {
src/hooks/useEngineVitals.ts:235:    const interval = setInterval(refresh, pollInterval);
src/utils/advancedTelemetry.ts:254:    this.flushInterval = setInterval(() => {
src/hooks/useEngineSubscription.ts:104:    const intervalId = window.setInterval(fetchData, config.interval);
src/hooks/useEffects.ts:101:    const interval = setInterval(updateState, 100);
src/services/performanceEngine/index.ts:500:    this.collectionTimer = setInterval(() => {
src/utils/quantumOrchestrator.ts:720:    this.orchestrationInterval = setInterval(() => {
src/utils/telemetryEngine.ts:393:    setInterval(collect, 30000);
src/utils/telemetryEngine.ts:441:    setInterval(analyze, 120000);
src/utils/telemetryEngine.ts:1100:    setInterval(
src/utils/quantumIntelligence.ts:397:    setInterval(consciousnessProcess, 2000);
src/utils/quantumIntelligence.ts:976:    setInterval(() => {
src/utils/performanceOptimizer.ts:89:    this.cacheCleanupInterval = setInterval(() => {
src/utils/webVitals.ts:262:    this.reportingInterval = window.setInterval(() => {
src/utils/webVitals.ts:321:    const interval = setInterval(() => {
src/utils/autoHealClient.ts:179:    this.intervalId = window.setInterval(async () => {
src/hooks/usePerformanceProfiler.ts:149:    const interval = setInterval(() => {
src/hooks/usePerformanceProfiler.ts:163:    const interval = setInterval(() => {
src/services/performanceEngine/metricsCollector.ts:556:    this.intervalId = setInterval(async () => {
src/utils/selfHealingSystem.ts:320:    setInterval(monitor, 45000);
src/lib/metricsCache.ts:276:  autoCleanupIntervalId = setInterval(() => {
src/os/TitaneOS.ts:339:    this.metricsIntervalId = setInterval(() => {
src/utils/PerformanceProfiler.tsx:252:    const interval = setInterval(() => {
src/utils/PerformanceProfiler.tsx:272:    const interval = setInterval(() => {
src/services/performanceEngine/reporter.ts:251:      this.reportTimer = setInterval(() => {
src/modules/optimization/ServiceWorkerManager.ts:208:    this.updateCheckInterval = window.setInterval(() => {
src/lib/security.ts:1544:  callTrackingIntervalId = setInterval(cleanupCallTracking, 5000);
src/hooks/useConnection.ts:136:    const interval = setInterval(checkConnection, REFRESH_INTERVALS.SLOW);
src/hooks/useLivingEngines.ts:225:    const interval = setInterval(() => {
src/os/registry/ServiceRegistry.ts:124:    this.healthCheckInterval = setInterval(() => {
src/services/voice/unifiedVocalEngine.ts:249:    setInterval(checkAudioState, 200); // Check every 200ms
src/services/voice/unifiedVocalEngine.ts:275:    this.loopInterval = window.setInterval(() => {
src/services/voice/adaptiveThresholdEngine.ts:265:    this.adjustmentTimer = setInterval(() => {
src/modules/liveDebugger/LiveDebuggerEngine.ts:265:    this.segmentTimer = setInterval(() => {
src/modules/vocalDev/VocalDevConsoleEngine.ts:348:      this.recordingTimer = setInterval(() => {
src/modules/performance/AdvancedPerformanceMonitor.ts:194:    this.interval = window.setInterval(() => {
src/modules/talkToTitane/ConversationTimelineEngine.ts:130:    this.rebuildTimer = setInterval(() => {
src/modules/talkToTitane/SelfHealingConversationEngine.ts:111:    this.scanTimer = setInterval(() => {
src/modules/talkToTitane/TalkToTitaneEngine.ts:182:    const checkInterval = setInterval(() => {
src/modules/talkToTitane/AutoSaveConversationEngine.ts:312:    this.snapshotTimer = setInterval(() => {
src/modules/avatar/floating/useFloatingWindow.ts:103:    syncTimerRef.current = window.setInterval(() => {
src/os/bridge/StateBridge.ts:199:    this.syncInterval = setInterval(() => {
src/hooks/useEngineState.ts:79:    const interval = setInterval(fetchState, pollInterval);
