/**
 * ═══════════════════════════════════════════════════════════════════════════
 *   TITANE∞ v26.0.0 — DEV-SUDO PATTERNS
 *   Pattern detection for 138 dev-sudo commands
 *   Extracted from monolithic devSudoHandler.ts (Phase 2 refactoring)
 * ═══════════════════════════════════════════════════════════════════════════
 */

import type { DevSudoAction } from './types';

/**
 * Pattern registry - Maps DevSudoAction to array of RegExp patterns
 * Total: 138 actions with 300+ regex patterns
 */
export const DEV_SUDO_PATTERNS: Record<DevSudoAction, RegExp[]> = {
  'fix-deps': [
    /^fix\s+deps?$/i,
    /^install\s+(dependencies|deps)$/i,
    /^n\s*p\s*m\s+install$/i,
  ],
  'restart-tauri': [
    /^restart\s+tauri$/i,
    /^relance\s+(l')?app(lication)?$/i,
    /^redémarre\s+titane$/i,
  ],
  'test-bubble': [
    /^test\s+bubble$/i,
    /^vérifie?\s+(le\s+)?chat\s+bubble$/i,
    /^test\s+chat\s+bubble$/i,
  ],
  'fix-opus': [
    /^fix\s+opus$/i,
    /^répare\s+(les\s+)?modules?\s+opus$/i,
    /^corrige\s+opus\s*#?\d*$/i,
  ],
  'status-full': [
    /^status\s+full$/i,
    /^diagnostic\s+(complet|full)$/i,
    /^analyse\s+complète$/i,
  ],
  'analyze-module': [
    /^analys[ez]\s+(le\s+)?module\s+(.+)$/i,
    /^inspect[ez]?\s+(le\s+)?module\s+(.+)$/i,
    /^show\s+module\s+(.+)$/i,
  ],
  'repair-component': [
    /^répare\s+(le\s+)?composant\s+(.+)$/i,
    /^fix\s+(the\s+)?component\s+(.+)$/i,
    /^corrige\s+(.+)$/i,
  ],
  'show-code': [
    /^(montre|affiche|show)\s+(le\s+)?code\s+(de|du|of)\s+(.+)$/i,
    /^inspect\s+(.+)$/i,
    /^read\s+(.+)$/i,
  ],
  'whitelist-tauri': [
    /^whitelist\s+(.+)$/i,
    /^ajoute\s+(.+)\s+(à|a)\s+(la\s+)?whitelist$/i,
    /^autorise\s+(la\s+)?commande\s+(.+)$/i,
  ],
  'fix-error': [
    /^(corrige|fix)\s+(l')?erreur\s+(de\s+)?(.+)$/i,
    /^répare\s+(l')?erreur\s+(.+)$/i,
  ],
  'merge-opus': [
    /^fusionne\s+opus\s*#?(\d+)\s+(et|and)\s+opus\s*#?(\d+)$/i,
    /^merge\s+opus\s*#?(\d+)\s+\+\s+opus\s*#?(\d+)$/i,
  ],
  'create-component': [
    /^cr[ée]e?\s+(un\s+)?composant\s+(.+)$/i,
    /^create\s+component\s+(.+)$/i,
    /^add\s+component\s+(.+)$/i,
  ],
  'add-feature': [
    /^ajoute\s+(la\s+)?feature\s+(.+)$/i,
    /^impl[ée]mente\s+(.+)$/i,
    /^add\s+feature\s+(.+)$/i,
  ],
  diagnostic: [/^diagnostic$/i, /^analyse\s+système$/i, /^check\s+system$/i],
  introspect: [
    /^introspect(ion)?$/i,
    /^inspect\s+state$/i,
    /^show\s+singularity(state)?$/i,
  ],
  'self-heal': [/^self[-s]heal$/i, /^auto[-s]répare?$/i, /^healing\s+engine$/i],
  'deep-heal': [/^deep[-s]heal$/i, /^deep\s+healing$/i, /^réparation\s+profonde$/i],
  'auto-fix': [/^auto[-s]fix$/i, /^correction\s+auto(matique)?$/i],
  'scan-modules': [/^scan\s+modules$/i, /^analyse\s+(les\s+)?modules$/i],
  'scan-opus': [/^scan\s+opus$/i, /^vérifie\s+opus$/i],
  'scan-errors': [/^scan\s+errors?$/i, /^liste\s+(les\s+)?erreurs$/i],
  'health-check': [/^health[-s]check$/i, /^vérification\s+santé$/i],
  'test-module': [/^test\s+module\s+(.+)$/i, /^teste\s+(le\s+)?module\s+(.+)$/i],
  'console-ls': [/^(sudo\s+)?titane\s+ls(\s+(.+))?$/i, /^ls(\s+(.+))?$/i],
  'console-open': [/^(sudo\s+)?titane\s+open\s+(.+)$/i, /^open\s+(.+)$/i],
  'console-patch': [/^(sudo\s+)?titane\s+patch\s+(.+)$/i, /^patch\s+(.+)$/i],
  'console-rebuild': [/^(sudo\s+)?titane\s+rebuild\s+store$/i, /^rebuild\s+store$/i],
  'optimize-build': [/^optimize\s+build$/i, /^optimise\s+(le\s+)?build$/i],
  'optimize-ui': [/^optimize\s+ui$/i, /^optimise\s+(l')?ui$/i],
  'optimize-rust': [/^optimize\s+rust$/i, /^optimise\s+rust$/i],
  'optimize-react': [/^optimize\s+react$/i, /^optimise\s+react$/i],
  'connect-api': [/^connect\s+(.+)$/i, /^connecte\s+(.+)$/i],
  'test-api': [/^test\s+api\s+(.+)$/i, /^teste\s+(l')?api\s+(.+)$/i],
  'verify-keys': [/^verify\s+keys$/i, /^vérifie\s+(les\s+)?clés?$/i],
  'full-sync': [/^full[-s]sync$/i, /^sync\s+complet$/i],
  'verify-architecture': [/^verify\s+architecture$/i, /^vérifie\s+(l')?architecture$/i],
  'generate-report': [/^generate\s+report$/i, /^génère\s+(un\s+)?rapport$/i],

  // IDE Mode patterns (Super Prompt #7)
  'open-file': [/^open\s+(.+)$/i, /^ouvre\s+(.+)$/i, /^show\s+file\s+(.+)$/i],
  'view-file': [/^view\s+(.+)$/i, /^voir\s+(.+)$/i],
  'create-file': [/^create\s+file\s+(.+)$/i, /^crée\s+(le\s+)?fichier\s+(.+)$/i],
  'patch-file': [/^patch\s+file\s+(.+)$/i, /^patch\s+(.+)$/i],
  'goto-function': [
    /^go\s+to\s+function\s+(.+)$/i,
    /^goto\s+function\s+(.+)$/i,
    /^va\s+à\s+(la\s+)?fonction\s+(.+)$/i,
  ],
  'goto-component': [
    /^go\s+to\s+component\s+(.+)$/i,
    /^goto\s+component\s+(.+)$/i,
    /^va\s+au\s+composant\s+(.+)$/i,
  ],
  'goto-handler': [
    /^go\s+to\s+rust\s+handler\s+(.+)$/i,
    /^goto\s+handler\s+(.+)$/i,
    /^va\s+au\s+handler\s+(.+)$/i,
  ],
  'copilot-suggest': [
    /^copilot\s+suggest$/i,
    /^suggest\s+code$/i,
    /^propose\s+(du\s+)?code$/i,
    /^complète\s+(le\s+)?code$/i,
  ],
  'auto-complete': [/^auto[-s]complete$/i, /^complete$/i, /^complétion$/i],
  'refactor-component': [
    /^refactor\s+component\s+(.+)$/i,
    /^refactorise\s+(le\s+)?composant\s+(.+)$/i,
  ],
  'refactor-hook': [/^refactor\s+hook\s+(.+)$/i, /^refactorise\s+(le\s+)?hook\s+(.+)$/i],
  'refactor-handler': [
    /^refactor\s+handler\s+(.+)$/i,
    /^refactor\s+rust\s+handler\s+(.+)$/i,
    /^refactorise\s+(le\s+)?handler\s+(.+)$/i,
  ],
  'explain-code': [/^explain\s+(.+)$/i, /^explique\s+(.+)$/i, /^pourquoi\s+(.+)$/i],
  'auto-import': [/^auto[-s]import$/i, /^fix\s+imports$/i, /^imports$/i],
  'generate-module': [
    /^generate\s+module\s+(.+)$/i,
    /^create\s+module\s+(.+)$/i,
    /^génère\s+(le\s+)?module\s+(.+)$/i,
  ],
  'run-tests': [/^run\s+tests?$/i, /^test$/i, /^lance\s+(les\s+)?tests?$/i],
  'master-analysis': [
    /^master\s+analysis$/i,
    /^analyse\s+master$/i,
    /^analyse\s+complète$/i,
    /^full\s+analysis$/i,
  ],
  'architect-refactor': [
    /^architect\s+refactor$/i,
    /^refactor\s+architecture$/i,
    /^refactorisation\s+architecturale$/i,
  ],
  'code-review': [
    /^code\s+review\s+(.+)$/i,
    /^review\s+code\s+(.+)$/i,
    /^revue\s+(de\s+)?code\s+(.+)$/i,
  ],
  'analyze-rust': [/^analyze\s+rust$/i, /^analyse\s+rust$/i],
  'analyze-tauri': [/^analyze\s+tauri$/i, /^analyse\s+tauri$/i],

  // Singularity Mind Engine patterns (Super Prompt #8)
  'singularity-scan': [
    /^singularity\s+scan$/i,
    /^scan\s+singularity$/i,
    /^analyse\s+singularit\u00e9$/i,
    /^scan\s+cerveau$/i,
  ],
  'brain-analysis': [
    /^brain\s+analysis$/i,
    /^analyse\s+(du\s+)?cerveau$/i,
    /^comprendre\s+(le\s+)?cerveau$/i,
  ],
  'cognitive-check': [
    /^cognitive\s+check$/i,
    /^v\u00e9rification\s+cognitive$/i,
    /^check\s+cognition$/i,
  ],
  'meta-repair': [
    /^meta[-s]repair$/i,
    /^r\u00e9paration\s+m\u00e9ta$/i,
    /^repair\s+engines?$/i,
  ],
  'evolution-report': [
    /^evolution\s+report$/i,
    /^rapport\s+\u00e9volution$/i,
    /^apprentissage$/i,
  ],
  'coherence-check': [
    /^coherence\s+check$/i,
    /^v\u00e9rification\s+coh\u00e9rence$/i,
    /^check\s+coh\u00e9rence$/i,
  ],

  // Vision Engine patterns (Super Prompt #9)
  'vision-analyze': [
    /^vision\s+analys[ei]s?$/i,
    /^analyse\s+vision$/i,
    /^voir\s+(l')?interface$/i,
    /^regarde\s+(l')?ui$/i,
  ],
  'ui-diagnostic': [
    /^ui\s+diagnostic$/i,
    /^diagnostic\s+ui$/i,
    /^analyse\s+(l')?interface$/i,
  ],
  'design-review': [
    /^design\s+review$/i,
    /^revue\s+(de\s+)?design$/i,
    /^analyse\s+(le\s+)?design$/i,
  ],
  'frontend-optimize': [
    /^frontend\s+optimiz[ae]$/i,
    /^optimise\s+(le\s+)?frontend$/i,
    /^am\u00e9liore\s+(l')?ui$/i,
  ],
  'visual-repair': [
    /^visual\s+repair$/i,
    /^r\u00e9paration\s+visuelle$/i,
    /^r\u00e9pare\s+(l')?ui$/i,
  ],

  // Backend & API Master Engine (Super Prompt #10)
  'backend-analysis': [
    /^backend\s+analysis$/i,
    /^analyse\s+backend$/i,
    /^analyse\s+(le\s+)?rust$/i,
    /^backend\s+status$/i,
  ],
  'fix-handler': [
    /^fix\s+handler\s+(.+)$/i,
    /^répare\s+handler\s+(.+)$/i,
    /^corriger\s+handler\s+(.+)$/i,
  ],
  'create-api': [
    /^create\s+api\s+(.+)$/i,
    /^créer\s+api\s+(.+)$/i,
    /^nouvelle\s+api\s+(.+)$/i,
    /^generate\s+api\s+(.+)$/i,
  ],
  'whitelist-command': [
    /^whitelist\s+(.+)$/i,
    /^ajouter\s+whitelist\s+(.+)$/i,
    /^autoriser\s+(.+)$/i,
  ],
  'optimize-cargo': [
    /^optimize\s+cargo$/i,
    /^optimise\s+cargo$/i,
    /^cargo\s+optimization$/i,
  ],
  'build-backend': [
    /^build\s+backend$/i,
    /^compiler\s+backend$/i,
    /^cargo\s+build$/i,
    /^rebuild\s+rust$/i,
  ],
  'analyze-security': [
    /^security\s+analysis$/i,
    /^analyse\s+sécurité$/i,
    /^audit\s+sécurité$/i,
    /^security\s+audit$/i,
  ],

  // Memory Eternal Engine (Super Prompt #11)
  'memory-scan': [
    /^memory\s+scan$/i,
    /^scan\s+mémoire$/i,
    /^analyse\s+mémoire$/i,
    /^memory\s+status$/i,
  ],
  'memory-heal': [
    /^memory\s+heal$/i,
    /^répare\s+mémoire$/i,
    /^heal\s+memory$/i,
    /^fix\s+memory$/i,
  ],
  'memory-deepheal': [
    /^memory\s+deep\s*heal$/i,
    /^deep\s+heal\s+memory$/i,
    /^réparation\s+profonde\s+mémoire$/i,
  ],
  'memory-snapshot': [
    /^memory\s+snapshot$/i,
    /^snapshot\s+mémoire$/i,
    /^créer\s+snapshot$/i,
    /^save\s+memory$/i,
  ],
  'memory-export': [/^memory\s+export$/i, /^export\s+mémoire$/i, /^exporter\s+memory$/i],
  'memory-import': [
    /^memory\s+import\s+(.+)$/i,
    /^import\s+mémoire\s+(.+)$/i,
    /^importer\s+(.+)$/i,
  ],
  'memory-rebuild': [
    /^memory\s+rebuild$/i,
    /^rebuild\s+memory$/i,
    /^reconstruire\s+mémoire$/i,
  ],
  'memory-optimize': [
    /^memory\s+optimize$/i,
    /^optimize\s+memory$/i,
    /^optimise\s+mémoire$/i,
    /^compress\s+memory$/i,
  ],

  // TITANE∞ ONE Unified Brain
  'titane-one-introspect': [
    /^titane\s+one\s+introspect$/i,
    /^sudo\s+titane\s+introspect$/i,
    /^singularity\s+introspect$/i,
    /^one\s+introspect$/i,
    /^introspection\s+totale$/i,
    /^titane\s+introspect$/i,
  ],
  'titane-one-evolve': [
    /^titane\s+one\s+evolve$/i,
    /^sudo\s+titane\s+evolve$/i,
    /^singularity\s+evolve$/i,
    /^one\s+evolve$/i,
    /^évolution\s+totale$/i,
    /^titane\s+evolve$/i,
  ],
  'titane-one-heal': [
    /^titane\s+one\s+heal$/i,
    /^sudo\s+titane\s+heal$/i,
    /^singularity\s+heal$/i,
    /^one\s+heal$/i,
    /^self[-\s]heal\s+total$/i,
    /^titane\s+heal$/i,
  ],
  'titane-one-fullheal': [
    /^titane\s+one\s+fullheal$/i,
    /^titane\s+one\s+full[-\s]heal$/i,
    /^sudo\s+titane\s+fullheal$/i,
    /^singularity\s+deepheal$/i,
    /^one\s+fullheal$/i,
    /^deep\s+heal\s+total$/i,
    /^titane\s+fullheal$/i,
  ],
  'titane-one-unify': [
    /^titane\s+one\s+unify$/i,
    /^sudo\s+titane\s+unify$/i,
    /^singularity\s+unify$/i,
    /^one\s+unify$/i,
    /^unification\s+totale$/i,
    /^titane\s+unify$/i,
  ],
  'titane-one-optimize': [
    /^titane\s+one\s+optimize$/i,
    /^sudo\s+titane\s+optimize$/i,
    /^singularity\s+optimize$/i,
    /^one\s+optimize$/i,
    /^optimisation\s+globale$/i,
    /^titane\s+optimize$/i,
  ],
  'titane-one-vision-all': [
    /^titane\s+one\s+vision[-\s]all$/i,
    /^sudo\s+titane\s+vision[-\s]all$/i,
    /^singularity\s+vision$/i,
    /^one\s+vision$/i,
    /^vision\s+triple$/i,
    /^vision\s+totale$/i,
  ],
  'titane-one-analyze-dev': [
    /^titane\s+one\s+analyze\s+dev$/i,
    /^sudo\s+titane\s+analyze[-\s]dev$/i,
    /^one\s+analyze\s+dev$/i,
    /^analyser\s+dev$/i,
  ],
  'titane-one-analyze-ui': [
    /^titane\s+one\s+analyze\s+ui$/i,
    /^sudo\s+titane\s+analyze[-\s]ui$/i,
    /^one\s+analyze\s+ui$/i,
    /^analyser\s+ui$/i,
  ],
  'titane-one-analyze-backend': [
    /^titane\s+one\s+analyze\s+backend$/i,
    /^sudo\s+titane\s+analyze[-\s]backend$/i,
    /^one\s+analyze\s+backend$/i,
    /^analyser\s+backend$/i,
  ],
  'titane-one-analyze-memory': [
    /^titane\s+one\s+analyze\s+memory$/i,
    /^sudo\s+titane\s+analyze[-\s]memory$/i,
    /^one\s+analyze\s+memory$/i,
    /^analyser\s+mémoire$/i,
  ],
  'titane-one-singularity-scan': [
    /^titane\s+one\s+singularity[-\s]scan$/i,
    /^sudo\s+singularity\s+scan$/i,
    /^singularity\s+quantum$/i,
    /^one\s+singularity[-\s]scan$/i,
    /^scan\s+quantique$/i,
    /^quantum\s+scan$/i,
  ],

  // AI Local Model (Super Prompt #12)
  'ia-add': [
    /^ia\s+add$/i,
    /^sudo\s+ia\s+add$/i,
    /^ajouter?\s+modèle\s+ia$/i,
    /^add\s+ai\s+model$/i,
    /^install\s+titane\s+local$/i,
  ],
  'ia-test': [
    /^ia\s+test$/i,
    /^sudo\s+ia\s+test$/i,
    /^tester?\s+ia\s+local(e)?$/i,
    /^test\s+ai\s+model$/i,
    /^test\s+ollama$/i,
  ],
  'ia-set-default': [
    /^ia\s+set[-\s]default\s+(.+)$/i,
    /^sudo\s+ia\s+default\s+(.+)$/i,
    /^définir\s+modèle\s+(.+)$/i,
    /^set\s+ai\s+model\s+(.+)$/i,
    /^use\s+model\s+(.+)$/i,
  ],
  'ia-enable-devmode': [
    /^ia\s+enable[-\s]devmode$/i,
    /^ia\s+dev[-\s]mode\s+on$/i,
    /^sudo\s+ia\s+devmode$/i,
    /^activer?\s+mode\s+dev\s+ia$/i,
    /^enable\s+ai\s+dev\s+mode$/i,
  ],
  'ia-scan': [
    /^ia\s+scan$/i,
    /^sudo\s+ia\s+scan$/i,
    /^scanner?\s+modèles?\s+ia$/i,
    /^list\s+ai\s+models$/i,
    /^ollama\s+list$/i,
  ],
  'ia-status': [
    /^ia\s+status$/i,
    /^sudo\s+ia\s+status$/i,
    /^statut\s+ia$/i,
    /^ai\s+status$/i,
    /^ollama\s+status$/i,
    /^check\s+ollama$/i,
  ],

  // AI Training Commands (Super Prompt #13)
  'ia-train': [
    /^ia\s+train$/i,
    /^sudo\s+ia\s+train$/i,
    /^train\s+titane[-\s]local$/i,
    /^entraîner?\s+modèle\s+local$/i,
    /^fine[-\s]tune\s+local$/i,
  ],
  'ia-dataset': [
    /^ia\s+dataset$/i,
    /^sudo\s+ia\s+dataset$/i,
    /^générer?\s+dataset$/i,
    /^build\s+dataset$/i,
    /^create\s+training\s+data$/i,
  ],
  'ia-test-model': [
    /^ia\s+test[-\s]model$/i,
    /^sudo\s+ia\s+test[-\s]model$/i,
    /^tester?\s+modèle\s+entraîné$/i,
    /^validate\s+trained\s+model$/i,
    /^test\s+titane[-\s]local$/i,
  ],
  'ia-benchmark': [
    /^ia\s+benchmark$/i,
    /^sudo\s+ia\s+benchmark$/i,
    /^benchmark\s+a[-/]b$/i,
    /^comparer?\s+modèles$/i,
    /^performance\s+test$/i,
  ],

  // AI Bubble Engine Commands (Super Prompt #14)
  'chat-open': [
    /^chat\.open$/i,
    /^sudo\s+chat\.open$/i,
    /^ouvrir?\s+chat$/i,
    /^open\s+chat$/i,
  ],
  'chat-close': [
    /^chat\.close$/i,
    /^sudo\s+chat\.close$/i,
    /^fermer?\s+chat$/i,
    /^close\s+chat$/i,
  ],
  'chat-minimize': [
    /^chat\.minimize$/i,
    /^sudo\s+chat\.minimize$/i,
    /^minimiser?\s+chat$/i,
    /^minimize\s+chat$/i,
  ],
  'chat-maximize': [
    /^chat\.maximize$/i,
    /^sudo\s+chat\.maximize$/i,
    /^maximiser?\s+chat$/i,
    /^maximize\s+chat$/i,
  ],
  'chat-clear': [
    /^chat\.clear$/i,
    /^sudo\s+chat\.clear$/i,
    /^effacer?\s+chat$/i,
    /^clear\s+chat$/i,
  ],
  'chat-set-model': [
    /^chat\.setModel\s+(.+)$/i,
    /^sudo\s+chat\.setModel\s+(.+)$/i,
    /^chat\s+model\s+(.+)$/i,
  ],
  'chat-dev': [/^chat\.dev$/i, /^sudo\s+chat\.dev$/i, /^chat\s+dev\s+mode$/i],
  'chat-inspect': [
    /^chat\.inspect$/i,
    /^sudo\s+chat\.inspect$/i,
    /^inspecter?\s+chat$/i,
    /^inspect\s+chat$/i,
  ],
  'chat-autoheal': [
    /^chat\.autoheal$/i,
    /^sudo\s+chat\.autoheal$/i,
    /^chat\s+auto[-\s]heal$/i,
  ],
  'chat-fullscreen': [
    /^chat\.fullscreen$/i,
    /^sudo\s+chat\.fullscreen$/i,
    /^chat\s+plein[-\s]écran$/i,
    /^chat\s+fullscreen$/i,
  ],
  'chat-follow': [
    /^chat\.follow$/i,
    /^sudo\s+chat\.follow$/i,
    /^chat\s+suivre$/i,
    /^chat\s+follow$/i,
  ],

  // Data Collector Engine Commands (Super Prompt #15)
  'dataset-collect': [
    /^dataset\.collect$/i,
    /^sudo\s+dataset\.collect$/i,
    /^collecter?\s+dataset$/i,
    /^collect\s+data$/i,
    /^run\s+collection$/i,
  ],
  'dataset-clean': [
    /^dataset\.clean$/i,
    /^sudo\s+dataset\.clean$/i,
    /^nettoyer?\s+dataset$/i,
    /^clean\s+dataset$/i,
  ],
  'dataset-generate': [
    /^dataset\.generate$/i,
    /^sudo\s+dataset\.generate$/i,
    /^générer?\s+dataset$/i,
    /^generate\s+dataset$/i,
  ],
  'dataset-training-pack': [
    /^dataset\.training[-\s]pack$/i,
    /^sudo\s+dataset\.training[-\s]pack$/i,
    /^pack\s+entraînement$/i,
    /^training\s+pack$/i,
  ],
  'dataset-compress': [
    /^dataset\.compress$/i,
    /^sudo\s+dataset\.compress$/i,
    /^compresser?\s+dataset$/i,
    /^compress\s+dataset$/i,
  ],
  'dataset-add': [
    /^dataset\.add\s+(.+)$/i,
    /^sudo\s+dataset\.add\s+(.+)$/i,
    /^ajouter?\s+à\s+dataset\s+(.+)$/i,
  ],
  'dataset-sync-memory': [
    /^dataset\.sync[-\s]memory$/i,
    /^sudo\s+dataset\.sync[-\s]memory$/i,
    /^sync\s+memory$/i,
    /^synchroniser?\s+mémoire$/i,
  ],
  'dataset-export': [
    /^dataset\.export$/i,
    /^sudo\s+dataset\.export$/i,
    /^exporter?\s+dataset$/i,
    /^export\s+dataset$/i,
  ],

  // Hybrid Engine Commands (Super Prompt #16) v∞.26.0
  'hybrid-open': [
    /^hybrid\.open$/i,
    /^sudo\s+hybrid\.open$/i,
    /^open\s+hybrid$/i,
    /^ouvre\s+hybrid$/i,
  ],
  'hybrid-close': [
    /^hybrid\.close$/i,
    /^sudo\s+hybrid\.close$/i,
    /^close\s+hybrid$/i,
    /^ferme\s+hybrid$/i,
  ],
  'hybrid-console': [
    /^hybrid\.console$/i,
    /^sudo\s+hybrid\.console$/i,
    /^console\s+mode$/i,
    /^mode\s+console$/i,
  ],
  'hybrid-bubble': [
    /^hybrid\.bubble$/i,
    /^sudo\s+hybrid\.bubble$/i,
    /^bubble\s+mode$/i,
    /^mode\s+bubble$/i,
  ],
  'hybrid-heal': [
    /^hybrid\.heal(\s+target=.+)?$/i,
    /^sudo\s+hybrid\.heal(\s+target=.+)?$/i,
    /^auto[-\s]heal(\s+.+)?$/i,
    /^repair(\s+.+)?$/i,
  ],
  'hybrid-inspect': [
    /^hybrid\.inspect\s+path=.+$/i,
    /^sudo\s+hybrid\.inspect\s+path=.+$/i,
    /^inspect\s+file\s+.+$/i,
    /^inspecte?\s+.+$/i,
  ],
  'hybrid-fix': [
    /^hybrid\.fix\s+target=.+$/i,
    /^sudo\s+hybrid\.fix\s+target=.+$/i,
    /^fix\s+module\s+.+$/i,
    /^réparer?\s+.+$/i,
  ],
  'hybrid-apply': [
    /^hybrid\.apply\s+file=.+\s+lineStart=\d+\s+lineEnd=\d+\s+newCode=.+$/i,
    /^sudo\s+hybrid\.apply\s+file=.+\s+lineStart=\d+\s+lineEnd=\d+\s+newCode=.+$/i,
    /^apply\s+patch\s+.+$/i,
  ],
  'hybrid-run': [
    /^hybrid\.run\s+command="?(.+)"?$/i,
    /^sudo\s+hybrid\.run\s+command="?(.+)"?$/i,
    /^run\s+command\s+.+$/i,
    /^exécuter?\s+.+$/i,
  ],
  'hybrid-logs': [
    /^hybrid\.logs(\s+filter=.+)?$/i,
    /^sudo\s+hybrid\.logs(\s+filter=.+)?$/i,
    /^show\s+logs?(\s+.+)?$/i,
    /^logs?(\s+.+)?$/i,
  ],

  // Fusion Engine Commands (Super Prompt #17) v∞.27.0
  'fusion-collect': [
    /^fusion\.collect$/i,
    /^sudo\s+fusion\.collect$/i,
    /^collecte\s+fusion$/i,
    /^fusion\s+collect$/i,
  ],
  'fusion-sync': [
    /^fusion\.sync$/i,
    /^sudo\s+fusion\.sync$/i,
    /^synchronise\s+fusion$/i,
    /^fusion\s+sync$/i,
  ],
  'fusion-build-dataset': [
    /^fusion\.build-?dataset$/i,
    /^sudo\s+fusion\.build-?dataset$/i,
    /^build\s+fusion\s+dataset$/i,
    /^génère\s+dataset\s+fusionné$/i,
  ],
  'fusion-clean-dataset': [
    /^fusion\.clean-?dataset$/i,
    /^sudo\s+fusion\.clean-?dataset$/i,
    /^clean\s+fusion\s+dataset$/i,
    /^nettoie\s+dataset\s+fusion$/i,
  ],
  'fusion-compress': [
    /^fusion\.compress$/i,
    /^sudo\s+fusion\.compress$/i,
    /^compress\s+fusion$/i,
    /^compresse\s+fusion$/i,
  ],
  'fusion-export': [
    /^fusion\.export(\s+file=.+)?$/i,
    /^sudo\s+fusion\.export(\s+file=.+)?$/i,
    /^export\s+fusion(\s+.+)?$/i,
    /^exporte\s+fusion(\s+.+)?$/i,
  ],
  'fusion-merge': [
    /^fusion\.merge\s+(file|dataset)=.+$/i,
    /^sudo\s+fusion\.merge\s+(file|dataset)=.+$/i,
    /^merge\s+fusion\s+.+$/i,
    /^fusionne\s+dataset\s+.+$/i,
  ],
  'fusion-package-training': [
    /^fusion\.package-?training$/i,
    /^sudo\s+fusion\.package-?training$/i,
    /^package\s+fusion\s+training$/i,
    /^crée\s+training\s+pack\s+fusion$/i,
  ],
  'fusion-stats': [
    /^fusion\.stats$/i,
    /^sudo\s+fusion\.stats$/i,
    /^stats\s+fusion$/i,
    /^statistiques\s+fusion$/i,
  ],

  // ─────────────────────────────────────────────────────────────────────────
  // VOCAL DEV CONSOLE (Super Prompt #18) v∞.28.0
  // ─────────────────────────────────────────────────────────────────────────
  'vocal-start': [
    /^vocal\.start$/i,
    /^sudo\s+vocal\.start$/i,
    /^active\s+(le\s+)?vocal$/i,
    /^start\s+vocal$/i,
    /^démarre\s+(la\s+)?console\s+vocale$/i,
    /^enable\s+voice$/i,
  ],
  'vocal-stop': [
    /^vocal\.stop$/i,
    /^sudo\s+vocal\.stop$/i,
    /^désactive\s+(le\s+)?vocal$/i,
    /^stop\s+vocal$/i,
    /^arrête\s+(la\s+)?console\s+vocale$/i,
    /^disable\s+voice$/i,
  ],
  'vocal-console': [
    /^vocal\.console$/i,
    /^sudo\s+vocal\.console$/i,
    /^(ouvre|ferme|toggle)\s+(la\s+)?console\s+vocale$/i,
    /^(show|hide)\s+vocal\s+console$/i,
    /^vocal\s+ui$/i,
  ],
  'vocal-heal': [
    /^vocal\.heal$/i,
    /^sudo\s+vocal\.heal$/i,
    /^vocal\s+auto-?heal$/i,
    /^self-?heal\s+vocal$/i,
    /^répare\s+via\s+voix$/i,
    /^correction\s+vocale$/i,
  ],
  'vocal-run': [
    /^vocal\.run\s+(.+)$/i,
    /^sudo\s+vocal\.run\s+(.+)$/i,
    /^exécute\s+vocalement\s+(.+)$/i,
    /^run\s+voice\s+command\s+(.+)$/i,
    /^commande\s+vocale\s+(.+)$/i,
  ],
  'vocal-logs': [
    /^vocal\.logs$/i,
    /^sudo\s+vocal\.logs$/i,
    /^(affiche|show)\s+vocal\s+logs$/i,
    /^logs\s+console\s+vocale$/i,
    /^historique\s+vocal$/i,
  ],
  'vocal-patch': [
    /^vocal\.patch$/i,
    /^sudo\s+vocal\.patch$/i,
    /^applique\s+patch\s+vocal$/i,
    /^apply\s+voice\s+patch$/i,
    /^patch\s+via\s+voix$/i,
  ],
  'vocal-compile': [
    /^vocal\.compile$/i,
    /^sudo\s+vocal\.compile$/i,
    /^compile\s+vocalement$/i,
    /^build\s+via\s+voix$/i,
    /^vocal\s+build$/i,
  ],
  'vocal-inspect': [
    /^vocal\.inspect\s+(.+)$/i,
    /^sudo\s+vocal\.inspect\s+(.+)$/i,
    /^inspecte\s+vocalement\s+(.+)$/i,
    /^inspect\s+via\s+voice\s+(.+)$/i,
    /^analyse\s+vocal\s+(.+)$/i,
  ],
  'vocal-set-model': [
    /^vocal\.setModel\s+(titane-?local|claude|gemini|auto)$/i,
    /^sudo\s+vocal\.setModel\s+(.+)$/i,
    /^change\s+vocal\s+ai\s+(.+)$/i,
    /^set\s+voice\s+model\s+(.+)$/i,
    /^modèle\s+vocal\s+(.+)$/i,
  ],
  'vocal-fullscreen': [
    /^vocal\.fullscreen$/i,
    /^sudo\s+vocal\.fullscreen$/i,
    /^console\s+vocale\s+plein[\s-]?écran$/i,
    /^fullscreen\s+vocal$/i,
    /^vocal\s+fs$/i,
  ],
  'vocal-silence': [
    /^vocal\.silence$/i,
    /^sudo\s+vocal\.silence$/i,
    /^désactive\s+tts$/i,
    /^silence\s+vocal$/i,
    /^mute\s+voice$/i,
    /^vocal\s+mute$/i,
  ],

  // ─────────────────────────────────────────────────────────────────────────
  // LIVE DEBUGGER VOCAL (Super Prompt #19) v∞.29.0
  // ─────────────────────────────────────────────────────────────────────────
  'live-on': [
    /^live\.on$/i,
    /^sudo\s+live\.on$/i,
    /^active\s+(le\s+)?live\s+debugger$/i,
    /^start\s+live\s+debugger$/i,
    /^démarre\s+debugger\s+temps\s+r[eé]el$/i,
    /^debug\s+vocal\s+on$/i,
  ],
  'live-off': [
    /^live\.off$/i,
    /^sudo\s+live\.off$/i,
    /^désactive\s+(le\s+)?live\s+debugger$/i,
    /^stop\s+live\s+debugger$/i,
    /^arrête\s+debugger$/i,
    /^debug\s+vocal\s+off$/i,
  ],
  'live-heal': [
    /^live\.heal$/i,
    /^sudo\s+live\.heal$/i,
    /^live\s+auto-?heal$/i,
    /^debug\s+heal$/i,
    /^répare\s+en\s+temps\s+r[eé]el$/i,
  ],
  'live-inspect': [
    /^live\.inspect\s+(.+)$/i,
    /^sudo\s+live\.inspect\s+(.+)$/i,
    /^inspecte\s+live\s+(.+)$/i,
    /^debug\s+inspect\s+(.+)$/i,
  ],
  'live-patch': [
    /^live\.patch$/i,
    /^sudo\s+live\.patch$/i,
    /^applique\s+patch\s+live$/i,
    /^apply\s+live\s+patch$/i,
    /^patch\s+temps\s+r[eé]el$/i,
  ],
  'live-logs': [
    /^live\.logs$/i,
    /^sudo\s+live\.logs$/i,
    /^(affiche|show)\s+live\s+logs$/i,
    /^diagnostics\s+live$/i,
    /^historique\s+debug$/i,
  ],
  'live-restart': [
    /^live\.restart$/i,
    /^sudo\s+live\.restart$/i,
    /^restart\s+live\s+debugger$/i,
    /^red[eé]marre\s+debugger$/i,
    /^reset\s+live\s+ia$/i,
  ],
  'live-reset': [
    /^live\.reset$/i,
    /^sudo\s+live\.reset$/i,
    /^reset\s+live\s+debugger$/i,
    /^efface\s+diagnostics$/i,
    /^clear\s+live$/i,
  ],
  'live-console': [
    /^live\.console$/i,
    /^sudo\s+live\.console$/i,
    /^(ouvre|ferme|toggle)\s+live\s+console$/i,
    /^show\s+live\s+debugger$/i,
  ],
  'live-set-mode': [
    /^live\.setMode\s+(shadow|active|auto-?heal|explain|draft)$/i,
    /^sudo\s+live\.setMode\s+(.+)$/i,
    /^change\s+live\s+mode\s+(.+)$/i,
    /^mode\s+live\s+(.+)$/i,
  ],

  // Talk-To-TITANE Suite (Super Prompts #20-24) v∞.30.0
  'talk-on': [
    /^talk\.on(\s+(.+))?$/i,
    /^sudo\s+talk\.on$/i,
    /^activate\s+talk-?to-?titane$/i,
    /^start\s+vocal\s+assistant$/i,
  ],
  'talk-off': [
    /^talk\.off$/i,
    /^sudo\s+talk\.off$/i,
    /^deactivate\s+talk-?to-?titane$/i,
    /^stop\s+vocal\s+assistant$/i,
  ],
  'talk-mode': [
    /^talk\.mode\s+(continuous|whispered|direct|calibrated|focus)$/i,
    /^sudo\s+talk\.mode\s+(.+)$/i,
    /^set\s+talk\s+mode\s+(.+)$/i,
    /^mode\s+vocal\s+(.+)$/i,
  ],
  'talk-calibrate': [
    /^talk\.calibrate\s+(analytical|calm|energizing|motivating|neutral)$/i,
    /^sudo\s+talk\.calibrate\s+(.+)$/i,
    /^set\s+emotional\s+tone\s+(.+)$/i,
    /^calibrate\s+(.+)$/i,
  ],
  'talk-history': [
    /^talk\.history(\s+(\d+))?$/i,
    /^sudo\s+talk\.history$/i,
    /^show\s+talk\s+history$/i,
    /^conversation\s+history$/i,
  ],
  'talk-console': [
    /^talk\.console$/i,
    /^sudo\s+talk\.console$/i,
    /^open\s+talk\s+console$/i,
    /^talk\s+panel$/i,
  ],
  'conversation-save': [
    /^conversation\.save$/i,
    /^sudo\s+conversation\.save$/i,
    /^save\s+conversation$/i,
    /^autosave\s+now$/i,
  ],
  'conversation-heal': [
    /^conversation\.heal$/i,
    /^sudo\s+conversation\.heal$/i,
    /^heal\s+conversations?$/i,
    /^repair\s+conversations?$/i,
  ],
  'conversation-timeline': [
    /^conversation\.timeline$/i,
    /^sudo\s+conversation\.timeline$/i,
    /^show\s+timeline$/i,
    /^timeline$/i,
  ],
  'conversation-export': [
    /^conversation\.export\s+(json|jsonl|html)$/i,
    /^sudo\s+conversation\.export\s+(.+)$/i,
    /^export\s+conversations?\s+(.+)$/i,
    /^export\s+(.+)$/i,
  ],
  'timeline-build': [
    /^timeline\.build$/i,
    /^sudo\s+timeline\.build$/i,
    /^build\s+timeline$/i,
    /^rebuild\s+timeline$/i,
  ],
  'timeline-show': [
    /^timeline\.show(\s+(\d+))?$/i,
    /^sudo\s+timeline\.show$/i,
    /^show\s+timeline(\s+(\d+))?$/i,
    /^affiche\s+timeline$/i,
  ],
  'timeline-export': [
    /^timeline\.export\s+(json|jsonl|html)$/i,
    /^sudo\s+timeline\.export\s+(.+)$/i,
    /^export\s+timeline\s+(.+)$/i,
  ],
  'timeline-sessions': [
    /^timeline\.sessions$/i,
    /^sudo\s+timeline\.sessions$/i,
    /^show\s+sessions$/i,
    /^sessions$/i,
  ],
  'timeline-stats': [
    /^timeline\.stats$/i,
    /^sudo\s+timeline\.stats$/i,
    /^show\s+timeline\s+stats$/i,
    /^stats\s+timeline$/i,
  ],
  'autosave-on': [
    /^autosave\.on$/i,
    /^sudo\s+autosave\.on$/i,
    /^enable\s+autosave$/i,
    /^activate\s+autosave$/i,
  ],
  'autosave-off': [
    /^autosave\.off$/i,
    /^sudo\s+autosave\.off$/i,
    /^disable\s+autosave$/i,
    /^deactivate\s+autosave$/i,
  ],
  'autosave-flush': [
    /^autosave\.flush$/i,
    /^sudo\s+autosave\.flush$/i,
    /^flush\s+autosave$/i,
    /^save\s+now$/i,
  ],
  'selfheal-scan': [
    /^selfheal\.scan$/i,
    /^sudo\s+selfheal\.scan$/i,
    /^scan\s+conversations?$/i,
    /^integrity\s+scan$/i,
  ],
  'selfheal-heal': [
    /^selfheal\.heal$/i,
    /^sudo\s+selfheal\.heal$/i,
    /^heal\s+all$/i,
    /^repair\s+all\s+conversations?$/i,
  ],
  'selfheal-rebuild': [
    /^selfheal\.rebuild\s+(.+)$/i,
    /^sudo\s+selfheal\.rebuild\s+(.+)$/i,
    /^rebuild\s+file\s+(.+)$/i,
    /^reconstruct\s+(.+)$/i,
  ],
};

/**
 * Match a command string against all patterns
 * Returns the matching action and captured parameters
 */
export function matchPattern(
  input: string
): { action: DevSudoAction; params: Record<string, string> } | null {
  const trimmed = input.trim();

  for (const [action, patterns] of Object.entries(DEV_SUDO_PATTERNS)) {
    for (const pattern of patterns) {
      const match = pattern.exec(trimmed);
      if (match) {
        // Extract named groups or positional groups as params
        const params: Record<string, string> = {};
        if (match.groups) {
          Object.assign(params, match.groups);
        }
        // Add positional captures
        for (let i = 1; i < match.length; i++) {
          if (match[i] !== undefined) {
            params[`capture${i}`] = match[i]!;
          }
        }
        return { action: action as DevSudoAction, params };
      }
    }
  }

  return null;
}

/**
 * Check if input contains a dev-sudo command
 */
export function containsDevSudoCommand(input: string): boolean {
  return matchPattern(input) !== null;
}

/**
 * Get all actions that match a pattern
 */
export function getAllMatches(
  input: string
): Array<{ action: DevSudoAction; params: Record<string, string> }> {
  const trimmed = input.trim();
  const matches: Array<{ action: DevSudoAction; params: Record<string, string> }> = [];

  for (const [action, patterns] of Object.entries(DEV_SUDO_PATTERNS)) {
    for (const pattern of patterns) {
      const match = pattern.exec(trimmed);
      if (match) {
        const params: Record<string, string> = {};
        if (match.groups) {
          Object.assign(params, match.groups);
        }
        for (let i = 1; i < match.length; i++) {
          if (match[i] !== undefined) {
            params[`capture${i}`] = match[i]!;
          }
        }
        matches.push({ action: action as DevSudoAction, params });
      }
    }
  }

  return matches;
}

/**
 * Validate a pattern (for testing)
 */
export function validatePattern(pattern: RegExp, testString: string): boolean {
  return pattern.test(testString);
}

/**
 * Get all patterns for an action
 */
export function getPatternsForAction(action: DevSudoAction): RegExp[] {
  return DEV_SUDO_PATTERNS[action] || [];
}

/**
 * Get pattern statistics
 */
export function getPatternStats() {
  const actionCount = Object.keys(DEV_SUDO_PATTERNS).length;
  const patternCount = Object.values(DEV_SUDO_PATTERNS).reduce(
    (sum, patterns) => sum + patterns.length,
    0
  );

  return {
    actions: actionCount,
    patterns: patternCount,
    averagePatternsPerAction: (patternCount / actionCount).toFixed(2),
  };
}
