# INVARIANTS_CHECK

## Tokens
GO_FOR_PROD_BUILD__TITANE_INFINITY=<missing>
GO_FOR_PROD_DEPLOY__TITANE_INFINITY=<missing>

## G_FRONTEND_NO_WEB scan (src excluding tests/stories)
src/modules/dataCollector/DataCollectorEngine.ts:553:    echo "❌ Ollama not installed. Install: https://ollama.ai"
src/modules/devSudo/devSudoBuiltins.ts:525:curl http://localhost:11434/api/tags
src/modules/devSudo/devSudoBuiltins.ts:579:3. Le proxy répond-il ? → \`curl http://localhost:11434/api/tags\`
src/modules/devSudo/devSudoBuiltins.ts:648:curl http://localhost:11434/api/tags
src/modules/devSudo/devSudoBuiltins.ts:765:2. Le proxy répond-il ? → \`curl http://localhost:11434/api/tags\`
src/modules/devSudo/devSudoBuiltins.ts:804:curl http://localhost:11434/api/tags
src/modules/devSudo/devSudoBuiltins.ts:865:3. Tester proxy: \`curl http://localhost:11434/api/tags\`
src/modules/devSudo/devSudoHandler.ts:2609:curl http://localhost:11434/api/tags
src/modules/devSudo/devSudoHandler.ts:2662:3. Le proxy répond-il ? → \`curl http://localhost:11434/api/tags\`
src/modules/devSudo/devSudoHandler.ts:2847:2. Le proxy répond-il ? → \`curl http://localhost:11434/api/tags\`
src/modules/devSudo/devSudoHandler.ts:2886:curl http://localhost:11434/api/tags
src/modules/devSudo/devSudoHandler.ts:2947:3. Tester proxy: \`curl http://localhost:11434/api/tags\`
src/modules/fusion/DatasetBuilder.ts:340:    echo "   curl -fsSL https://ollama.com/install.sh | sh"
src/types/aiModel.ts:67:    endpoint: 'https://generativelanguage.googleapis.com/v1beta/models',
src/types/aiModel.ts:81:    endpoint: 'https://api.openai.com/v1/chat/completions',
src/types/aiModel.ts:110:    endpoint: 'https://api.anthropic.com/v1/messages',
src/core/holography/HOLOMESH_ENGINE.ts:215:    let svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg" class="holomesh">`;
src/CARTE_POINTS_CRITIQUES.ts:137: *     "devUrl": "http://localhost:5173",
src/CARTE_POINTS_CRITIQUES.ts:142: *   "devUrl": "http://localhost:1420"  ❌ (mode HTTP obsolète)
src/CARTE_POINTS_CRITIQUES.ts:240: *      → "devUrl": "http://localhost:5173" ✅ (dev server encapsulé par Tauri)
src/lib/accessibility.ts:119: * https://www.w3.org/WAI/GL/wiki/Relative_luminance
src/lib/accessibility.ts:132: * https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html
src/hooks/useChat.ts:1803:   curl -fsSL https://ollama.com/install.sh | sh
src/pages/ResearchPage.tsx:83:    `https://fr.wikipedia.org/wiki/${slug}`,
src/pages/ResearchPage.tsx:84:    `https://fr.wikipedia.org/w/index.php?search=${query}`,
src/pages/ResearchPage.tsx:85:    `https://fr.wiktionary.org/wiki/${slug}`,
src/pages/ResearchPage.tsx:86:    `https://www.wikidata.org/wiki/Special:Search?search=${query}`,
src/components/sections/ConversationSection.tsx:227:    `https://fr.wikipedia.org/wiki/${topicSlug}`,
src/components/sections/ConversationSection.tsx:228:    `https://fr.wikipedia.org/w/index.php?search=${topicQuery}`,
src/components/sections/ConversationSection.tsx:229:    `https://fr.wiktionary.org/wiki/${topicSlug}`,
src/components/sections/ConversationSection.tsx:230:    `https://www.wikidata.org/wiki/Special:Search?search=${topicQuery}`,
src/components/sections/ConversationSection.tsx:236:    target_url: seeds[0] ?? `https://fr.wikipedia.org/wiki/${topicSlug}`,
src/components/chat/ConversationsButton.tsx:39:        xmlns="http://www.w3.org/2000/svg"
src/components/ui/button.tsx:77:          xmlns="http://www.w3.org/2000/svg"
src/components/ui/LazyImage.tsx:47:  placeholder = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'%3E%3Crect width='1' height='1' fill='%231a1a1a'/%3E%3C/svg%3E",
src/services/tts/hybridTTS.ts:236:      console.log(`📡 Mode: Local API (http://localhost:8765)`);
src/services/monitoring/sentry.ts:44:    // Obtenir à : https://sentry.io/settings/projects/
src/services/ai/providers/glm46v.ts:30:  baseUrl: 'http://127.0.0.1:8000/v1',
src/config/offline-first.ts:34:  localLLM: 'http://localhost:8000',
src/config/offline-first.ts:37:  gemini: 'https://generativelanguage.googleapis.com/v1beta',
src/config/offline-first.ts:38:  openai: 'https://api.openai.com/v1',
src/config/offline-first.ts:77:    await httpClient.head('https://www.google.com/favicon.ico', {
src/config/index.ts:26:      if (env.isBrowser && env.isDev) return 'http://localhost:1420';
src/features/governance-center/tabs/SecretsTab.tsx:588:              href="https://github.com/settings/tokens"
src/features/governance-center/types.ts:135:      'GitHub Copilot / GitHub Models API (https://github.com/marketplace/models)',
src/features/governance-center/components/APIProviderCard.tsx:28:    helpUrl: 'https://makersuite.google.com/app/apikey',
src/features/governance-center/components/APIProviderCard.tsx:36:    helpUrl: 'https://platform.openai.com/api-keys',
src/features/governance-center/components/APIProviderCard.tsx:44:    helpUrl: 'https://console.anthropic.com/settings/keys',
src/features/governance-center/components/APIProviderCard.tsx:52:    helpUrl: 'https://ollama.com/download',
src/features/governance-center/components/APIProviderCard.tsx:167:                  curl -fsSL https://ollama.com/install.sh | sh

## G_NETWORK_ONE_DOOR scan (invoke outside canonical wrappers)
src/modules/devSudo/devSudoSingularityHandlers.ts:948:  await invoke('command');
src/modules/devSudo/devSudoBackendHandlers.ts:125:   invoke('memory_scan') → #[tauri::command] memory_scan()
src/modules/devSudo/devSudoBackendHandlers.ts:126:   invoke('secure_store_key') → #[tauri::command] secure_store_key()
src/modules/devSudo/devSudoBackendHandlers.ts:127:   invoke('camera_start') → #[tauri::command] camera_start()
src/modules/devSudo/devSudoBackendHandlers.ts:298:   invoke('${handlerName}').then(console.log).catch(console.error)
src/core/devops/VisualDevOpsEngine.ts:816:    // 2. Tauri filesystem: Use invoke('fs:write_file', { path, content }) to save
src/core/devops/LocalAgentEngine.ts:960:      // 1. Tauri: invoke('fs_exists', {path}) - requires Tauri command registration
src/core/devops/LocalAgentEngine.ts:972:      // 1. Tauri: invoke('read_json_file', {path}) - type-safe, sandboxed
src/core/commands/TAURI_COMMANDS.ts:221: * Helper pour invoke() avec validation et protection robuste
src/utils/invoke.ts:11: * Wrapper universel pour invoke() avec gestion d'erreur automatique
src/utils/invoke.ts:36: * Wrapper pour invoke() avec retry automatique
src/utils/invoke.ts:78: * Wrapper pour invoke() avec timeout
src/lib/logger.ts:285:      // await invoke('log_to_file', { entry: this.formatEntry(_entry) });
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
src/lib/tauriClient.ts:1237:    return await this.invoke(
src/lib/tauriClient.ts:1244:    return await this.invoke(
src/lib/tauriClient.ts:1251:    return await this.invoke(
src/lib/tauriClient.ts:1258:    return await this.invoke(
src/lib/tauriClient.ts:1265:    return await this.invoke(
src/lib/tauriClient.ts:1272:    return await this.invoke(
src/lib/tauriClient.ts:1279:    return await this.invoke(
src/lib/tauriClient.ts:1286:    return await this.invoke(
src/lib/tauriClient.ts:1293:    return await this.invoke(
src/lib/tauriClient.ts:1300:    return await this.invoke(
src/lib/tauriClient.ts:1307:    return await this.invoke(
src/lib/tauriClient.ts:1314:    return await this.invoke(
src/lib/tauriClient.ts:1321:    return await this.invoke(
src/lib/tauriClient.ts:1328:    return await this.invoke(
src/lib/tauriClient.ts:1335:    return await this.invoke(
src/lib/tauriClient.ts:1342:    return await this.invoke(
src/lib/tauriClient.ts:1349:    return await this.invoke(
src/lib/tauriClient.ts:1356:    return await this.invoke(
src/lib/tauriClient.ts:1363:    return await this.invoke(
src/lib/tauriClient.ts:1370:    return await this.invoke(
src/lib/tauriClient.ts:1377:    return await this.invoke(
src/lib/tauriClient.ts:1384:    return await this.invoke(
src/lib/tauriClient.ts:1391:    return await this.invoke(
src/lib/tauriClient.ts:1398:    return await this.invoke(
