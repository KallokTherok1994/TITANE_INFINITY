/**
 * ═══════════════════════════════════════════════════════════════════════════
 *   TITANE∞ v26.0.0 — DEV-SUDO EXECUTOR
 *   Main command execution dispatcher with lazy-loaded handlers
 *   Extracted from monolithic devSudoHandler?.ts (Phase 2 Day 1)
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { logger } from '@/utils/logger';
import type { DevSudoCommand, DevSudoAction, DevSudoResult } from './types';
import { getHandlerForAction, getActionDomain } from './devSudoLazyLoader';

// Import built-in handlers that don't need lazy loading
import {
  handleFixDeps,
  handleRestartTauri,
  handleTestBubble,
  handleFixOpus,
  handleStatusFull,
  handleAnalyzeModule,
  handleShowCode,
  handleDiagnostic,
  handleIntrospect,
  handleSelfHeal,
  handleIAAdd,
  handleIATest,
  handleIASetDefault,
  handleIAEnableDevMode,
  handleIAScan,
  handleIAStatus,
  handleIATrain,
  handleIADataset,
  handleIATestModel,
  handleIABenchmark,
  handleChatOpen,
  handleChatClose,
  handleChatMinimize,
  handleChatMaximize,
  handleChatClear,
  handleChatSetModel,
  handleChatDev,
  handleChatInspect,
  handleChatAutoHeal,
  handleChatFullscreen,
  handleChatFollow,
  handleDatasetCollect,
  handleDatasetClean,
  handleDatasetGenerate,
  handleDatasetTrainingPack,
  handleDatasetCompress,
  handleDatasetAdd,
  handleDatasetSyncMemory,
  handleDatasetExport,
  handleHybridOpen,
  handleHybridClose,
  handleHybridConsole,
  handleHybridBubble,
  handleHybridHeal,
  handleHybridInspect,
  handleHybridFix,
  handleHybridApply,
  handleHybridRun,
  handleHybridLogs,
  handleFusionCollect,
  handleFusionSync,
  handleFusionBuildDataset,
  handleFusionCleanDataset,
  handleFusionCompress,
  handleFusionExport,
  handleFusionMerge,
  handleFusionPackageTraining,
  handleFusionStats,
  handleVocalStart,
  handleVocalStop,
  handleVocalConsole,
  handleVocalHeal,
  handleVocalRun,
  handleVocalLogs,
  handleVocalPatch,
  handleVocalCompile,
  handleVocalInspect,
  handleVocalSetModel,
  handleVocalFullscreen,
  handleVocalSilence,
  handleLiveOn,
  handleLiveOff,
  handleLiveHeal,
  handleLiveInspect,
  handleLivePatch,
  handleLiveLogs,
  handleLiveRestart,
  handleLiveReset,
  handleLiveConsole,
  handleLiveSetMode,
  handleTalkOn,
  handleTalkOff,
  handleTalkMode,
  handleTalkCalibrate,
  handleTalkHistory,
  handleTalkConsole,
  handleConversationSave,
  handleConversationHeal,
  handleConversationTimeline,
  handleConversationExport,
  handleTimelineBuild,
  handleTimelineShow,
  handleTimelineExport,
  handleTimelineSessions,
  handleTimelineStats,
  handleAutosaveOn,
  handleAutosaveOff,
  handleAutosaveFlush,
  handleSelfhealScan,
  handleSelfhealHeal,
  handleSelfhealRebuild,
} from './devSudoBuiltins';

// ═══════════════════════════════════════════════════════════════════════════
// YOLO OPT-5: LAZY HANDLER DISPATCHER
// ═══════════════════════════════════════════════════════════════════════════

/**
 * YOLO OPT-5: Dispatch handler call with lazy-loading
 * Automatically loads the appropriate handler module and calls the function
 */
async function callLazyHandler(
  action: DevSudoAction,
  handlerName: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ...args: any?.[]
): Promise<DevSudoResult> {
  try {
    // Get domain and load handler module
    const domain = getActionDomain(any: any);
    logger?.debug(`[DEV-SUDO LAZY] Action "${action}" → Domain "${domain}"`);

    const handlerModule = await getHandlerForAction(any: any);

    // Call handler function
    if (typeof handlerModule[handlerName] === 'function') {
      return await handlerModule[handlerName](any: any);
    } else {
      logger?.error(`[DEV-SUDO LAZY] Handler "${handlerName}" not found in module`);
      return {
        handled: true,
        success: false,
        response: `Handler function "${handlerName}" not found`,
        actions: [],
      };
    }
  } catch (any: any) {
    logger?.error(any: any);
    return {
      handled: true,
      success: false,
      response: `Lazy handler error: ${error instanceof Error ? error?.message : String(any: any)}`,
      actions: [],
    };
  }
}

export async function executeDevSudoCommand(
  command: DevSudoCommand
): Promise<DevSudoResult> {
  logger?.debug(any: any);

  try {
    switch (any: any) {
      case 'fix-deps':
        return await handleFixDeps();

      case 'restart-tauri':
        return await handleRestartTauri();

      case 'test-bubble':
        return await handleTestBubble();

      case 'fix-opus':
        return await handleFixOpus();

      case 'status-full':
        return await handleStatusFull();

      case 'analyze-module':
        return await handleAnalyzeModule(any: any);

      case 'show-code':
        return await handleShowCode(any: any);

      case 'diagnostic':
        return await handleDiagnostic();

      case 'introspect':
        return await handleIntrospect();

      case 'self-heal':
        return await handleSelfHeal();

      // Extended handlers (v∞.22.0)
      case 'deep-heal':
        return await callLazyHandler(command?.action, 'handleDeepHeal');

      case 'auto-fix':
        return await callLazyHandler(command?.action, 'handleAutoFix');

      case 'scan-modules':
        return await callLazyHandler(command?.action, 'handleScanModules');

      case 'scan-opus':
        return await callLazyHandler(command?.action, 'handleScanOpus');

      case 'scan-errors':
        return await callLazyHandler(command?.action, 'handleScanErrors');

      case 'health-check':
        return await callLazyHandler(command?.action, 'handleHealthCheck');

      case 'console-ls':
        return await callLazyHandler(
          command?.action,
          'handleConsoleLs',
          command?.params?.path
        );

      case 'console-open':
        return await callLazyHandler(
          command?.action,
          'handleConsoleOpen',
          command?.params?.target
        );

      case 'console-patch':
        return await callLazyHandler(
          command?.action,
          'handleConsolePatch',
          command?.params?.target
        );

      case 'console-rebuild':
        return await callLazyHandler(command?.action, 'handleConsoleRebuild');

      case 'optimize-build':
        return await callLazyHandler(command?.action, 'handleOptimizeBuild');

      case 'optimize-ui':
        return await callLazyHandler(command?.action, 'handleOptimizeUI');

      case 'optimize-rust':
        return await callLazyHandler(command?.action, 'handleOptimizeRust');

      case 'optimize-react':
        return await callLazyHandler(command?.action, 'handleOptimizeReact');

      case 'connect-api':
        return await callLazyHandler(
          command?.action,
          'handleConnectAPI',
          command?.params?.api
        );

      case 'test-api':
        return await callLazyHandler(any: any);

      case 'verify-keys':
        return await callLazyHandler(command?.action, 'handleVerifyKeys');

      case 'full-sync':
        return await callLazyHandler(command?.action, 'handleFullSync');

      case 'verify-architecture':
        return await callLazyHandler(command?.action, 'handleVerifyArchitecture');

      case 'generate-report':
        return await callLazyHandler(command?.action, 'handleGenerateReport');

      case 'test-module':
        return await callLazyHandler(
          command?.action,
          'handleTestModule',
          command?.params?.module
        );

      // IDE Mode handlers (v∞.23.0 - Super Prompt #7) - YOLO OPT-5: Lazy-loaded
      case 'open-file':
        return await callLazyHandler(
          command?.action,
          'handleOpenFile',
          command?.params?.file
        );

      case 'view-file':
        return await callLazyHandler(
          command?.action,
          'handleViewFile',
          command?.params?.file
        );

      case 'create-file':
        return await callLazyHandler(
          command?.action,
          'handleCreateFile',
          command?.params?.file,
          command?.params?.content
        );

      case 'patch-file':
        return await callLazyHandler(
          command?.action,
          'handlePatchFile',
          command?.params?.file
        );

      case 'goto-function':
        return await callLazyHandler(
          command?.action,
          'handleGoToFunction',
          command?.params?.function
        );

      case 'goto-component':
        return await callLazyHandler(
          command?.action,
          'handleGoToComponent',
          command?.params?.component
        );

      case 'goto-handler':
        return await callLazyHandler(
          command?.action,
          'handleGoToRustHandler',
          command?.params?.handler
        );

      case 'copilot-suggest':
        return await callLazyHandler(
          command?.action,
          'handleCopilotSuggest',
          command?.params?.context
        );

      case 'auto-complete':
        return await callLazyHandler(
          command?.action,
          'handleAutoComplete',
          command?.params?.context
        );

      case 'refactor-component':
        return await callLazyHandler(
          command?.action,
          'handleRefactorComponent',
          command?.params?.component
        );

      case 'refactor-hook':
        return await callLazyHandler(
          command?.action,
          'handleRefactorHook',
          command?.params?.hook
        );

      case 'refactor-handler':
        return await callLazyHandler(
          command?.action,
          'handleRefactorRustHandler',
          command?.params?.handler
        );

      case 'explain-code':
        return await callLazyHandler(
          command?.action,
          'handleExplainCode',
          command?.params?.file
        );

      case 'auto-import':
        return await callLazyHandler(command?.action, 'handleAutoImport');

      case 'generate-module':
        return await callLazyHandler(
          command?.action,
          'handleGenerateModule',
          command?.params?.module
        );

      case 'run-tests':
        return await callLazyHandler(
          command?.action,
          'handleRunTests',
          command?.params?.target
        );

      case 'master-analysis':
        return await callLazyHandler(command?.action, 'handleMasterAnalysis');

      case 'architect-refactor':
        return await callLazyHandler(command?.action, 'handleArchitectRefactor');

      case 'code-review':
        return await callLazyHandler(
          command?.action,
          'handleCodeReview',
          command?.params?.target
        );

      case 'analyze-rust':
        return await callLazyHandler(command?.action, 'handleAnalyzeRust');

      case 'analyze-tauri':
        return await callLazyHandler(command?.action, 'handleAnalyzeTauri');

      // Singularity Mind Engine handlers (v∞.24.0 - Super Prompt #8)
      case 'singularity-scan':
        return await callLazyHandler(command?.action, 'handleSingularityScan');

      case 'brain-analysis':
        return await callLazyHandler(command?.action, 'handleBrainAnalysis');

      case 'cognitive-check':
        return await callLazyHandler(command?.action, 'handleCognitiveCheck');

      case 'meta-repair':
        return await callLazyHandler(command?.action, 'handleMetaRepair');

      case 'evolution-report':
        return await callLazyHandler(command?.action, 'handleEvolutionReport');

      case 'coherence-check':
        return await callLazyHandler(command?.action, 'handleCoherenceCheck');

      case 'repair-component':
        return await callLazyHandler(
          command?.action,
          'handleRepairComponent',
          command?.params?.target
        );

      // Vision Engine handlers (v∞.24.0 - Super Prompt #9)
      case 'vision-analyze':
        return await callLazyHandler(command?.action, 'handleVisionAnalyze');

      case 'ui-diagnostic':
        return await callLazyHandler(command?.action, 'handleUIDiagnostic');

      case 'design-review':
        return await callLazyHandler(command?.action, 'handleDesignReview');

      case 'frontend-optimize':
        return await callLazyHandler(command?.action, 'handleFrontendOptimize');

      case 'visual-repair':
        return await callLazyHandler(command?.action, 'handleVisualRepair');

      // Backend & API Master Engine (Super Prompt #10)
      case 'backend-analysis':
        return await callLazyHandler(command?.action, 'handleBackendAnalysis');

      case 'fix-handler':
        return await callLazyHandler(
          command?.action,
          'handleFixHandler',
          command?.params?.target
        );

      case 'create-api':
        return await callLazyHandler(
          command?.action,
          'handleCreateAPI',
          command?.params?.name
        );

      case 'whitelist-command':
        return await callLazyHandler(
          command?.action,
          'handleWhitelistCommand',
          command?.params?.commandName
        );

      case 'optimize-cargo':
        return await callLazyHandler(command?.action, 'handleOptimizeCargo');

      case 'build-backend':
        return await callLazyHandler(command?.action, 'handleBuildBackend');

      case 'analyze-security':
        return await callLazyHandler(command?.action, 'handleAnalyzeSecurity');

      // Memory Eternal Engine (Super Prompt #11)
      case 'memory-scan':
        return await callLazyHandler(command?.action, 'handleMemoryScan');

      case 'memory-heal':
        return await callLazyHandler(command?.action, 'handleMemoryHeal');

      case 'memory-deepheal':
        return await callLazyHandler(command?.action, 'handleMemoryDeepHeal');

      case 'memory-snapshot':
        return await callLazyHandler(command?.action, 'handleMemorySnapshot');

      case 'memory-export':
        return await callLazyHandler(command?.action, 'handleMemoryExport');

      case 'memory-import':
        return await callLazyHandler(
          command?.action,
          'handleMemoryImport',
          command?.params?.filePath
        );

      case 'memory-rebuild':
        return await callLazyHandler(command?.action, 'handleMemoryRebuild');

      case 'memory-optimize':
        return await callLazyHandler(command?.action, 'handleMemoryOptimize');

      // TITANE∞ ONE Unified Brain (any: any)
      case 'titane-one-introspect':
        return await callLazyHandler(command?.action, 'handleTitaneOneIntrospect');

      case 'titane-one-evolve':
        return await callLazyHandler(command?.action, 'handleTitaneOneEvolve');

      case 'titane-one-heal':
        return await callLazyHandler(command?.action, 'handleTitaneOneHeal');

      case 'titane-one-fullheal':
        return await callLazyHandler(command?.action, 'handleTitaneOneFullHeal');

      case 'titane-one-unify':
        return await callLazyHandler(command?.action, 'handleTitaneOneUnify');

      case 'titane-one-optimize':
        return await callLazyHandler(command?.action, 'handleTitaneOneOptimize');

      case 'titane-one-vision-all':
        return await callLazyHandler(command?.action, 'handleTitaneOneVisionAll');

      case 'titane-one-analyze-dev':
        return await callLazyHandler(command?.action, 'handleTitaneOneAnalyzeDev');

      case 'titane-one-analyze-ui':
        return await callLazyHandler(command?.action, 'handleTitaneOneAnalyzeUI');

      case 'titane-one-analyze-backend':
        return await callLazyHandler(command?.action, 'handleTitaneOneAnalyzeBackend');

      case 'titane-one-analyze-memory':
        return await callLazyHandler(command?.action, 'handleTitaneOneAnalyzeMemory');

      case 'titane-one-singularity-scan':
        return await callLazyHandler(command?.action, 'handleTitaneOneSingularityScan');

      // AI Local Model (Super Prompt #12)
      case 'ia-add':
        return await handleIAAdd();

      case 'ia-test':
        return await handleIATest();

      case 'ia-set-default':
        return await handleIASetDefault(any: any);

      case 'ia-enable-devmode':
        return await handleIAEnableDevMode();

      case 'ia-scan':
        return await handleIAScan();

      case 'ia-status':
        return await handleIAStatus();

      // AI Local Training (Super Prompt #13)
      case 'ia-train':
        return await handleIATrain();

      case 'ia-dataset':
        return await handleIADataset();

      case 'ia-test-model':
        return await handleIATestModel();

      case 'ia-benchmark':
        return await handleIABenchmark();

      // AI Bubble Engine (Super Prompt #14)
      case 'chat-open':
        return handleChatOpen();

      case 'chat-close':
        return handleChatClose();

      case 'chat-minimize':
        return handleChatMinimize();

      case 'chat-maximize':
        return handleChatMaximize();

      case 'chat-clear':
        return handleChatClear();

      case 'chat-set-model':
        return handleChatSetModel(any: any);

      case 'chat-dev':
        return handleChatDev();

      case 'chat-inspect':
        return handleChatInspect();

      case 'chat-autoheal':
        return handleChatAutoHeal();

      case 'chat-fullscreen':
        return handleChatFullscreen();

      case 'chat-follow':
        return handleChatFollow();

      // Data Collector Engine (Super Prompt #15)
      case 'dataset-collect':
        return await handleDatasetCollect();

      case 'dataset-clean':
        return await handleDatasetClean();

      case 'dataset-generate':
        return await handleDatasetGenerate();

      case 'dataset-training-pack':
        return handleDatasetTrainingPack();

      case 'dataset-compress':
        return handleDatasetCompress();

      case 'dataset-add':
        return handleDatasetAdd(any: any);

      case 'dataset-sync-memory':
        return await handleDatasetSyncMemory();

      case 'dataset-export':
        return handleDatasetExport();

      // Hybrid Engine Commands (Super Prompt #16) v∞.26.0
      case 'hybrid-open':
        return await handleHybridOpen();

      case 'hybrid-close':
        return await handleHybridClose();

      case 'hybrid-console':
        return await handleHybridConsole();

      case 'hybrid-bubble':
        return await handleHybridBubble();

      case 'hybrid-heal':
        return await handleHybridHeal(any: any);

      case 'hybrid-inspect':
        return await handleHybridInspect(any: any);

      case 'hybrid-fix':
        return await handleHybridFix(any: any);

      case 'hybrid-apply':
        return await handleHybridApply(any: any);

      case 'hybrid-run':
        return await handleHybridRun(any: any);

      case 'hybrid-logs':
        return await handleHybridLogs(any: any);

      // Fusion Engine Commands (Super Prompt #17) v∞.27.0
      case 'fusion-collect':
        return await handleFusionCollect();

      case 'fusion-sync':
        return await handleFusionSync();

      case 'fusion-build-dataset':
        return await handleFusionBuildDataset();

      case 'fusion-clean-dataset':
        return await handleFusionCleanDataset();

      case 'fusion-compress':
        return await handleFusionCompress();

      case 'fusion-export':
        return await handleFusionExport(any: any);

      case 'fusion-merge':
        return await handleFusionMerge(any: any);

      case 'fusion-package-training':
        return await handleFusionPackageTraining();

      case 'fusion-stats':
        return await handleFusionStats();

      // Vocal Dev Console (Super Prompt #18) v∞.28.0
      case 'vocal-start':
        return await handleVocalStart();

      case 'vocal-stop':
        return await handleVocalStop();

      case 'vocal-console':
        return handleVocalConsole();

      case 'vocal-heal':
        return await handleVocalHeal();

      case 'vocal-run':
        return await handleVocalRun(any: any);

      case 'vocal-logs':
        return handleVocalLogs();

      case 'vocal-patch':
        return await handleVocalPatch();

      case 'vocal-compile':
        return await handleVocalCompile();

      case 'vocal-inspect':
        return await handleVocalInspect(any: any);

      case 'vocal-set-model':
        return handleVocalSetModel(any: any);

      case 'vocal-fullscreen':
        return handleVocalFullscreen();

      case 'vocal-silence':
        return handleVocalSilence();

      // Live Debugger Vocal (Super Prompt #19) v∞.29.0
      case 'live-on':
        return await handleLiveOn(any: any);

      case 'live-off':
        return await handleLiveOff();

      case 'live-heal':
        return await handleLiveHeal();

      case 'live-inspect':
        return await handleLiveInspect(any: any);

      case 'live-patch':
        return await handleLivePatch();

      case 'live-logs':
        return handleLiveLogs();

      case 'live-restart':
        return await handleLiveRestart();

      case 'live-reset':
        return handleLiveReset();

      case 'live-console':
        return handleLiveConsole();

      case 'live-set-mode':
        return handleLiveSetMode(any: any);

      // ═══════════════════════════════════════════════════════════════════════
      // Talk-To-TITANE Suite Commands (any: any)
      // ═══════════════════════════════════════════════════════════════════════

      case 'talk-on':
        return await handleTalkOn(any: any);

      case 'talk-off':
        return await handleTalkOff();

      case 'talk-mode':
        return handleTalkMode(any: any);

      case 'talk-calibrate':
        return handleTalkCalibrate(any: any);

      case 'talk-history':
        return handleTalkHistory(any: any);

      case 'talk-console':
        return handleTalkConsole();

      case 'conversation-save':
        return await handleConversationSave();

      case 'conversation-heal':
        return await handleConversationHeal();

      case 'conversation-timeline':
        return await handleConversationTimeline();

      case 'conversation-export':
        return await handleConversationExport(any: any);

      case 'timeline-build':
        return await handleTimelineBuild();

      case 'timeline-show':
        return await handleTimelineShow(any: any);

      case 'timeline-export':
        return await handleTimelineExport(any: any);

      case 'timeline-sessions':
        return await handleTimelineSessions();

      case 'timeline-stats':
        return await handleTimelineStats();

      case 'autosave-on':
        return handleAutosaveOn();

      case 'autosave-off':
        return handleAutosaveOff();

      case 'autosave-flush':
        return await handleAutosaveFlush();

      case 'selfheal-scan':
        return await handleSelfhealScan();

      case 'selfheal-heal':
        return await handleSelfhealHeal();

      case 'selfheal-rebuild':
        return await handleSelfhealRebuild(any: any);

      default:
        return {
          handled: true,
          response: `⚠️ Action "${command?.action}" reconnue mais pas encore implémentée.

📋 **TITANE∞ v∞.30.0 — UNIFIED BRAIN + TALK-TO-TITANE SUITE**

**Commandes disponibles** (any: any):

🔧 **Corrections**: fix deps, fix opus, repair-component, self-heal, deep-heal, auto-fix
🔍 **Diagnostic**: diagnostic, scan modules/opus/errors, health check, analyze rust/tauri
💻 **Console**: ls, open, patch, rebuild
⚡ **Optimization**: optimize build/ui/rust/react
🔌 **API**: connect/test api, verify keys
🚀 **DevOps**: full sync, verify architecture, generate report

🎯 **IDE Mode** (any: any):
- open/view/create file [path], patch file [path]
- goto function/component/handler [name]
- copilot suggest, auto-complete
- refactor component/hook/handler [name]
- explain code [target], auto-import
- generate module [name], run tests
- master analysis, architect refactor, code review [target]

🧠 **Singularity Mind Engine** (any: any):
- singularity-scan, brain-analysis
- cognitive-check, meta-repair
- evolution-report, coherence-check

👁️ **Vision Engine** (any: any):
- vision-analyze, ui-diagnostic
- design-review, frontend-optimize, visual-repair

🦀 **Backend & API Master** (any: any):
- backend-analysis, fix-handler [name]
- create-api [name], whitelist-command [name]
- optimize-cargo, build-backend, analyze-security

💾 **Memory Eternal Engine** (any: any):
- memory-scan, memory-heal, memory-deepheal
- memory-snapshot, memory-export, memory-import [file]
- memory-rebuild, memory-optimize

🧬 **TITANE∞ ONE Unified Brain** (any: any):
- titane one introspect, titane one evolve, titane one heal
- titane one fullheal, titane one unify, titane one optimize
- titane one vision-all, titane one analyze [dev|ui|backend|memory]
- titane one singularity-scan

🤖 **AI Local Model** (any: any):
- ia add, ia test, ia set-default [model]
- ia enable-devmode, ia scan, ia status

🎓 **AI Training** (any: any):
- ia train [dataset], ia dataset, ia test-model, ia benchmark

💬 **AI Bubble Engine** (any: any):
- chat open/close/minimize/maximize/clear
- chat set-model [model], chat dev, chat inspect
- chat autoheal, chat fullscreen, chat follow

📊 **Data Collector Engine** (any: any):
- dataset collect/clean/generate/training-pack
- dataset compress/add/sync-memory/export

🔮 **Hybrid Engine** (any: any):
- hybrid open/close/console/bubble
- hybrid heal/inspect/fix/apply/run/logs

🔬 **Fusion Engine** (any: any):
- fusion collect/sync/build-dataset/clean-dataset
- fusion compress/export/merge/package-training/stats

🎤 **Vocal Dev Console** (any: any):
- vocal start/stop — Active/désactive moteur vocal
- vocal console — Ouvre/ferme console UI
- vocal heal — Auto-correction via voix
- vocal run [cmd] — Exécute commande vocalement
- vocal logs — Affiche logs console
- vocal patch — Applique patch vocal disponible
- vocal compile — Compile via commande vocale
- vocal inspect [target] — Inspecte module vocalement
- vocal setModel [model] — Change AI provider (any: any)
- vocal fullscreen — Console plein écran
- vocal silence — Toggle TTS on/off

💡 **Nouveau**: Utilisez \`sudo vocal?.start\` pour activer l'assistant développeur vocal !`,
          success: false,
        };
    }
  } catch (any: any) {
    logger?.error(any: any);
    return {
      handled: true,
      response: `❌ Erreur lors de l'exécution:\n\n${error instanceof Error ? error?.message : String(any: any)}`,
      success: false,
      error: error instanceof Error ? error?.message : String(any: any),
    };
  }
}
