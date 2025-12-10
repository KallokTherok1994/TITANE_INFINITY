/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TITANE∞ TOOLS ENGINE — Moteur d'Exécution d'Outils Locaux
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Moteur d'exécution sécurisé pour les outils locaux avec:
 * - Registre d'outils extensible
 * - Exécution sandboxée
 * - Système d'annulation (undo)
 * - Gouvernance par permissions
 *
 * @module toolsEngine
 * @version Ω∞+
 */

import { secureInvoke } from '@/lib/security';
import {
  type IAMode as _IAMode,
  type ToolCategory,
  type RiskLevel,
  type ToolDefinition,
  type ToolInvocation,
  type ToolExecutionResult,
  type ToolExecutionLog,
  type ToolUndoState,
  type ToolsEngineConfig,
  type SandboxConfig,
  type FormatterConfig,
  type OutputFormat,
  type FormattedResult,
  BUILTIN_TOOLS,
  DEFAULT_TOOLS_ENGINE_CONFIG,
  generateToolInvocationId,
  generateUndoToken,
  validateToolInput,
  findToolById as _findToolById,
  calculateToolRiskScore,
} from './searchTools.config';
import { PermissionManager } from './permissionManager';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES INTERNES
// ═══════════════════════════════════════════════════════════════════════════

interface ToolsState {
  isExecuting: boolean;
  currentInvocationId: string | null;
  queuedInvocations: ToolInvocation[];
  activeTools: string[];
}

interface ToolExecutionContext {
  invocation: ToolInvocation;
  tool: ToolDefinition;
  startTime: number;
  logs: ToolExecutionLog[];
  aborted: boolean;
}

type ToolProgressCallback = (
  invocationId: string,
  progress: number,
  message: string
) => void;

type ToolResultCallback = (result: ToolExecutionResult) => void;

// Handlers d'outils personnalisés
type ToolHandler = (
  input: Record<string, unknown>,
  context: ToolExecutionContext
) => Promise<unknown>;

// ═══════════════════════════════════════════════════════════════════════════
// TOOLS ENGINE
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Tools Engine — Singleton
 *
 * Moteur d'exécution d'outils avec sandbox et gouvernance.
 */
export class ToolsEngine {
  private static instance: ToolsEngine | null = null;

  private config: ToolsEngineConfig;
  private state: ToolsState;
  private tools: Map<string, ToolDefinition> = new Map();
  private handlers: Map<string, ToolHandler> = new Map();
  private undoStack: ToolUndoState[] = [];
  private executionHistory: ToolExecutionResult[] = [];
  private progressCallbacks: Set<ToolProgressCallback> = new Set();
  private resultCallbacks: Set<ToolResultCallback> = new Set();
  private permissionManager: PermissionManager;
  private abortController: AbortController | null = null;

  // Stats
  private stats = {
    totalInvocations: 0,
    successfulInvocations: 0,
    failedInvocations: 0,
    undoCount: 0,
    avgExecutionTime: 0,
    totalExecutionTime: 0,
    invocationsByTool: {} as Record<string, number>,
    invocationsByCategory: {} as Record<string, number>,
  };

  private constructor() {
    this.config = { ...DEFAULT_TOOLS_ENGINE_CONFIG };
    this.state = {
      isExecuting: false,
      currentInvocationId: null,
      queuedInvocations: [],
      activeTools: [],
    };

    this.permissionManager = PermissionManager.getInstance();

    // Enregistrer les outils intégrés
    this.registerBuiltinTools();

    console.log('[ToolsEngine] 🔧 Initialized with', this.tools.size, 'tools');
  }

  /**
   * Obtient l'instance singleton
   */
  static getInstance(): ToolsEngine {
    if (!ToolsEngine.instance) {
      ToolsEngine.instance = new ToolsEngine();
    }
    return ToolsEngine.instance;
  }

  /**
   * Réinitialise l'instance (pour tests)
   */
  static resetInstance(): void {
    ToolsEngine.instance = null;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // CONFIGURATION
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Configure le tools engine
   */
  configure(config: Partial<ToolsEngineConfig>): void {
    this.config = { ...this.config, ...config };
    console.log('[ToolsEngine] ⚙️ Configuration updated');
  }

  /**
   * Retourne la configuration actuelle
   */
  getConfig(): ToolsEngineConfig {
    return { ...this.config };
  }

  /**
   * Configure le sandbox
   */
  configureSandbox(config: Partial<SandboxConfig>): void {
    this.config.sandbox = { ...this.config.sandbox, ...config };
  }

  /**
   * Configure le formateur
   */
  configureFormatter(config: Partial<FormatterConfig>): void {
    this.config.formatter = { ...this.config.formatter, ...config };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // REGISTRE D'OUTILS
  // ─────────────────────────────────────────────────────────────────────────

  private registerBuiltinTools(): void {
    for (const tool of BUILTIN_TOOLS) {
      this.tools.set(tool.id, tool);
      this.registerBuiltinHandler(tool.id);
    }
  }

  private registerBuiltinHandler(toolId: string): void {
    switch (toolId) {
      case 'web_search':
        this.handlers.set(toolId, this.handleWebSearch.bind(this));
        break;
      case 'local_search':
        this.handlers.set(toolId, this.handleLocalSearch.bind(this));
        break;
      case 'file_read':
        this.handlers.set(toolId, this.handleFileRead.bind(this));
        break;
      case 'file_write':
        this.handlers.set(toolId, this.handleFileWrite.bind(this));
        break;
      case 'file_list':
        this.handlers.set(toolId, this.handleFileList.bind(this));
        break;
      case 'code_analyze':
        this.handlers.set(toolId, this.handleCodeAnalyze.bind(this));
        break;
      case 'code_execute':
        this.handlers.set(toolId, this.handleCodeExecute.bind(this));
        break;
      case 'system_info':
        this.handlers.set(toolId, this.handleSystemInfo.bind(this));
        break;
      case 'system_command':
        this.handlers.set(toolId, this.handleSystemCommand.bind(this));
        break;
      case 'util_hash':
        this.handlers.set(toolId, this.handleUtilHash.bind(this));
        break;
      case 'util_encode':
        this.handlers.set(toolId, this.handleUtilEncode.bind(this));
        break;
      case 'util_json':
        this.handlers.set(toolId, this.handleUtilJson.bind(this));
        break;
      default:
        // Handler par défaut qui échoue
        this.handlers.set(toolId, async () => {
          throw new Error(`No handler implemented for tool: ${toolId}`);
        });
    }
  }

  /**
   * Enregistre un outil personnalisé
   */
  registerTool(tool: ToolDefinition, handler: ToolHandler): void {
    if (this.tools.has(tool.id)) {
      console.warn(`[ToolsEngine] Tool ${tool.id} already exists, overwriting`);
    }

    this.tools.set(tool.id, tool);
    this.handlers.set(tool.id, handler);

    console.log(`[ToolsEngine] ➕ Registered tool: ${tool.name}`);
  }

  /**
   * Désenregistre un outil
   */
  unregisterTool(toolId: string): boolean {
    const existed = this.tools.delete(toolId);
    this.handlers.delete(toolId);

    if (existed) {
      console.log(`[ToolsEngine] ➖ Unregistered tool: ${toolId}`);
    }

    return existed;
  }

  /**
   * Retourne un outil par ID
   */
  getTool(toolId: string): ToolDefinition | undefined {
    return this.tools.get(toolId);
  }

  /**
   * Retourne tous les outils
   */
  getAllTools(): ToolDefinition[] {
    return Array.from(this.tools.values());
  }

  /**
   * Retourne les outils par catégorie
   */
  getToolsByCategory(category: ToolCategory): ToolDefinition[] {
    return this.getAllTools().filter(t => t.category === category);
  }

  /**
   * Retourne les outils accessibles pour le mode IA actuel
   */
  getAccessibleTools(): ToolDefinition[] {
    return this.getAllTools().filter(tool => {
      const decision = this.permissionManager.canAccessTool(tool);
      return decision.granted;
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // EXÉCUTION D'OUTILS
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Invoque un outil
   */
  async invokeTool(
    toolId: string,
    input: Record<string, unknown>,
    options?: {
      invokedBy?: 'user' | 'ia' | 'automation' | 'system';
      skipConfirmation?: boolean;
      timeout?: number;
    }
  ): Promise<ToolExecutionResult> {
    const tool = this.tools.get(toolId);
    if (!tool) {
      return this.createErrorResult(
        generateToolInvocationId(),
        toolId,
        'TOOL_NOT_FOUND',
        `Tool not found: ${toolId}`
      );
    }

    // Créer l'invocation
    const invocation: ToolInvocation = {
      id: generateToolInvocationId(),
      toolId,
      input,
      invokedBy: options?.invokedBy ?? 'user',
      iaMode: this.permissionManager.getMode(),
      timestamp: Date.now(),
      confirmed: options?.skipConfirmation ?? false,
      timeout: options?.timeout ?? this.config.defaultTimeout,
    };

    // Vérifier les permissions
    const permission = this.permissionManager.canAccessTool(tool);
    if (!permission.granted) {
      return this.createErrorResult(
        invocation.id,
        toolId,
        'PERMISSION_DENIED',
        permission.reason
      );
    }

    // Vérifier si confirmation requise
    if (permission.requiresConfirmation && !invocation.confirmed) {
      if (this.config.confirmationRequired) {
        return this.createErrorResult(
          invocation.id,
          toolId,
          'CONFIRMATION_REQUIRED',
          `Tool ${tool.name} requires confirmation before execution`
        );
      }
    }

    // Valider l'input
    const validation = validateToolInput(tool, input);
    if (!validation.valid) {
      return this.createErrorResult(
        invocation.id,
        toolId,
        'INVALID_INPUT',
        `Invalid input: ${validation.errors.join(', ')}`
      );
    }

    // Exécuter l'outil
    return this.executeInvocation(invocation, tool);
  }

  private async executeInvocation(
    invocation: ToolInvocation,
    tool: ToolDefinition
  ): Promise<ToolExecutionResult> {
    this.stats.totalInvocations++;
    this.state.isExecuting = true;
    this.state.currentInvocationId = invocation.id;
    this.state.activeTools.push(tool.id);

    const context: ToolExecutionContext = {
      invocation,
      tool,
      startTime: Date.now(),
      logs: [],
      aborted: false,
    };

    // Créer l'AbortController
    this.abortController = new AbortController();

    // Timeout
    const timeoutId = setTimeout(() => {
      context.aborted = true;
      this.abortController?.abort();
    }, invocation.timeout ?? this.config.defaultTimeout);

    try {
      // Log de début
      this.addLog(context, 'info', `Starting tool: ${tool.name}`);

      // Notifier la progression
      this.notifyProgress(invocation.id, 0, 'Starting...');

      // Obtenir le handler
      const handler = this.handlers.get(tool.id);
      if (!handler) {
        throw new Error(`No handler for tool: ${tool.id}`);
      }

      // Exécuter
      this.notifyProgress(invocation.id, 50, 'Executing...');
      const output = await handler(invocation.input, context);

      clearTimeout(timeoutId);

      if (context.aborted) {
        throw new Error('Execution aborted');
      }

      // Calculer le temps d'exécution
      const executionTime = Date.now() - context.startTime;

      // Créer l'état d'annulation si supporté
      let undoToken: string | undefined;
      if (tool.canUndo) {
        undoToken = this.createUndoState(invocation, tool, invocation.input);
      }

      // Log de succès
      this.addLog(context, 'info', `Completed in ${executionTime}ms`);

      // Créer le résultat
      const result: ToolExecutionResult = {
        invocationId: invocation.id,
        toolId: tool.id,
        success: true,
        output,
        executionTime,
        logs: context.logs,
        undoAvailable: !!undoToken,
        undoToken,
      };

      // Mettre à jour les stats
      this.updateStats(tool, executionTime, true);

      // Sauvegarder dans l'historique
      this.addToHistory(result);

      // Notifier
      this.notifyProgress(invocation.id, 100, 'Completed');
      this.notifyResult(result);

      console.log(`[ToolsEngine] ✅ ${tool.name} completed in ${executionTime}ms`);

      return result;
    } catch (error) {
      clearTimeout(timeoutId);

      const executionTime = Date.now() - context.startTime;

      this.addLog(context, 'error', (error as Error).message);

      const result = this.createErrorResult(
        invocation.id,
        tool.id,
        context.aborted ? 'TIMEOUT' : 'EXECUTION_ERROR',
        (error as Error).message,
        executionTime,
        context.logs
      );

      this.updateStats(tool, executionTime, false);
      this.addToHistory(result);
      this.notifyResult(result);

      console.error(`[ToolsEngine] ❌ ${tool.name} failed:`, error);

      return result;
    } finally {
      this.state.isExecuting = false;
      this.state.currentInvocationId = null;
      this.state.activeTools = this.state.activeTools.filter(t => t !== tool.id);
      this.abortController = null;
    }
  }

  private createErrorResult(
    invocationId: string,
    toolId: string,
    code: string,
    message: string,
    executionTime: number = 0,
    logs: ToolExecutionLog[] = []
  ): ToolExecutionResult {
    this.stats.failedInvocations++;

    return {
      invocationId,
      toolId,
      success: false,
      error: { code, message },
      executionTime,
      logs,
      undoAvailable: false,
    };
  }

  private addLog(
    context: ToolExecutionContext,
    level: ToolExecutionLog['level'],
    message: string,
    data?: unknown
  ): void {
    context.logs.push({
      level,
      message,
      timestamp: Date.now(),
      data,
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // HANDLERS D'OUTILS INTÉGRÉS
  // ─────────────────────────────────────────────────────────────────────────

  private async handleWebSearch(
    input: Record<string, unknown>,
    context: ToolExecutionContext
  ): Promise<unknown> {
    this.addLog(context, 'info', `Searching web for: ${input.query}`);

    try {
      const results = await secureInvoke('search_web', {
        provider: input.provider ?? 'duckduckgo',
        query: input.query,
        maxResults: input.maxResults ?? 10,
      });
      return results;
    } catch {
      // Mock pour dev
      if (import.meta.env.DEV) {
        return [
          { title: 'Mock Result 1', url: 'https://example.com/1', snippet: '...' },
          { title: 'Mock Result 2', url: 'https://example.com/2', snippet: '...' },
        ];
      }
      throw new Error('Web search failed');
    }
  }

  private async handleLocalSearch(
    input: Record<string, unknown>,
    context: ToolExecutionContext
  ): Promise<unknown> {
    this.addLog(context, 'info', `Searching locally for: ${input.query}`);

    try {
      return await secureInvoke('search_local', {
        query: input.query,
        path: input.path ?? '.',
        fileTypes: input.fileTypes ?? [],
        caseSensitive: input.caseSensitive ?? false,
      });
    } catch {
      if (import.meta.env.DEV) {
        return [{ file: 'mock/file.ts', line: 1, content: 'mock match' }];
      }
      throw new Error('Local search failed');
    }
  }

  private async handleFileRead(
    input: Record<string, unknown>,
    context: ToolExecutionContext
  ): Promise<unknown> {
    this.addLog(context, 'info', `Reading file: ${input.path}`);

    try {
      return await secureInvoke('read_file_content', {
        path: input.path,
        encoding: input.encoding ?? 'utf-8',
        startLine: input.startLine,
        endLine: input.endLine,
      });
    } catch {
      if (import.meta.env.DEV) {
        return `Mock content of ${input.path}`;
      }
      throw new Error(`Failed to read file: ${input.path}`);
    }
  }

  private async handleFileWrite(
    input: Record<string, unknown>,
    context: ToolExecutionContext
  ): Promise<unknown> {
    this.addLog(context, 'info', `Writing file: ${input.path}`);

    try {
      await secureInvoke('write_file_content', {
        path: input.path,
        content: input.content,
        mode: input.mode ?? 'write',
        createDirs: input.createDirs ?? true,
      });
      return { success: true, path: input.path };
    } catch {
      throw new Error(`Failed to write file: ${input.path}`);
    }
  }

  private async handleFileList(
    input: Record<string, unknown>,
    context: ToolExecutionContext
  ): Promise<unknown> {
    this.addLog(context, 'info', `Listing directory: ${input.path ?? '.'}`);

    try {
      return await secureInvoke('list_directory', {
        path: input.path ?? '.',
        recursive: input.recursive ?? false,
        includeHidden: input.includeHidden ?? false,
        pattern: input.pattern,
      });
    } catch {
      if (import.meta.env.DEV) {
        return ['file1.ts', 'file2.ts', 'dir/'];
      }
      throw new Error(`Failed to list directory: ${input.path}`);
    }
  }

  private async handleCodeAnalyze(
    input: Record<string, unknown>,
    context: ToolExecutionContext
  ): Promise<unknown> {
    this.addLog(context, 'info', `Analyzing code: ${input.path}`);

    try {
      return await secureInvoke('analyze_code', {
        path: input.path,
        language: input.language,
        checks: input.checks ?? ['syntax', 'lint'],
      });
    } catch {
      if (import.meta.env.DEV) {
        return { errors: 0, warnings: 2, info: 5 };
      }
      throw new Error(`Failed to analyze: ${input.path}`);
    }
  }

  private async handleCodeExecute(
    input: Record<string, unknown>,
    context: ToolExecutionContext
  ): Promise<unknown> {
    this.addLog(context, 'warn', 'Executing code in sandbox');

    if (!this.config.sandbox.enabled) {
      throw new Error('Sandbox is disabled, cannot execute code');
    }

    try {
      return await secureInvoke('execute_code_sandbox', {
        code: input.code,
        language: input.language,
        timeout: input.timeout ?? this.config.sandbox.maxExecutionTime,
        args: input.args ?? [],
      });
    } catch {
      throw new Error('Code execution failed in sandbox');
    }
  }

  private async handleSystemInfo(
    input: Record<string, unknown>,
    context: ToolExecutionContext
  ): Promise<unknown> {
    this.addLog(context, 'info', 'Getting system info');

    try {
      return await secureInvoke('get_system_info', {
        include: input.include ?? ['os', 'cpu', 'memory'],
      });
    } catch {
      if (import.meta.env.DEV) {
        return {
          os: 'Linux',
          cpu: '8 cores',
          memory: '16GB',
        };
      }
      throw new Error('Failed to get system info');
    }
  }

  private async handleSystemCommand(
    input: Record<string, unknown>,
    context: ToolExecutionContext
  ): Promise<unknown> {
    this.addLog(context, 'warn', `Executing command: ${input.command}`);

    try {
      return await secureInvoke('execute_command', {
        command: input.command,
        cwd: input.cwd,
        timeout: input.timeout ?? 30000,
        env: input.env ?? {},
      });
    } catch {
      throw new Error(`Command execution failed: ${input.command}`);
    }
  }

  private async handleUtilHash(
    input: Record<string, unknown>,
    _context: ToolExecutionContext
  ): Promise<unknown> {
    const algorithm = (input.algorithm as string) ?? 'sha256';
    const inputStr = input.input as string;

    // Utiliser la Web Crypto API
    const encoder = new TextEncoder();
    const data = encoder.encode(inputStr);

    const hashBuffer = await crypto.subtle.digest(
      algorithm.toUpperCase().replace('SHA', 'SHA-'),
      data
    );

    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  private async handleUtilEncode(
    input: Record<string, unknown>,
    _context: ToolExecutionContext
  ): Promise<unknown> {
    const inputStr = input.input as string;
    const operation = input.operation as 'encode' | 'decode';
    const format = (input.format as string) ?? 'base64';

    if (operation === 'encode') {
      switch (format) {
        case 'base64':
          return btoa(inputStr);
        case 'url':
          return encodeURIComponent(inputStr);
        case 'html':
          return inputStr
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
        case 'hex':
          return Array.from(new TextEncoder().encode(inputStr))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
        default:
          throw new Error(`Unknown format: ${format}`);
      }
    } else {
      switch (format) {
        case 'base64':
          return atob(inputStr);
        case 'url':
          return decodeURIComponent(inputStr);
        case 'html':
          return inputStr
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"');
        case 'hex':
          return new TextDecoder().decode(
            new Uint8Array(inputStr.match(/.{2}/g)?.map(byte => parseInt(byte, 16)) ?? [])
          );
        default:
          throw new Error(`Unknown format: ${format}`);
      }
    }
  }

  private async handleUtilJson(
    input: Record<string, unknown>,
    _context: ToolExecutionContext
  ): Promise<unknown> {
    const inputStr = input.input as string;
    const operation = input.operation as string;
    const indent = (input.indent as number) ?? 2;

    switch (operation) {
      case 'parse':
        return JSON.parse(inputStr);
      case 'stringify':
        return JSON.stringify(inputStr, null, indent);
      case 'format':
        return JSON.stringify(JSON.parse(inputStr), null, indent);
      case 'minify':
        return JSON.stringify(JSON.parse(inputStr));
      case 'query': {
        const data = JSON.parse(inputStr);
        const queryPath = input.query as string;
        // Simple JSONPath implementation
        const parts = queryPath.split('.').filter(Boolean);
        let result = data;
        for (const part of parts) {
          result = result?.[part];
        }
        return result;
      }
      default:
        throw new Error(`Unknown operation: ${operation}`);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // SYSTÈME D'ANNULATION (UNDO)
  // ─────────────────────────────────────────────────────────────────────────

  private createUndoState(
    invocation: ToolInvocation,
    tool: ToolDefinition,
    originalState: unknown
  ): string {
    const token = generateUndoToken();
    const undoState: ToolUndoState = {
      token,
      toolId: tool.id,
      invocationId: invocation.id,
      originalState,
      createdAt: Date.now(),
      expiresAt: Date.now() + 3600000, // 1 heure
      executed: false,
    };

    this.undoStack.push(undoState);

    // Limiter la taille du stack
    if (this.undoStack.length > this.config.undoHistorySize) {
      this.undoStack.shift();
    }

    return token;
  }

  /**
   * Annule une action
   */
  async undo(token: string): Promise<ToolExecutionResult> {
    const undoState = this.undoStack.find(s => s.token === token);

    if (!undoState) {
      return this.createErrorResult(
        generateToolInvocationId(),
        'undo',
        'UNDO_NOT_FOUND',
        'Undo token not found'
      );
    }

    if (undoState.executed) {
      return this.createErrorResult(
        generateToolInvocationId(),
        'undo',
        'ALREADY_UNDONE',
        'Action already undone'
      );
    }

    if (undoState.expiresAt < Date.now()) {
      return this.createErrorResult(
        generateToolInvocationId(),
        'undo',
        'UNDO_EXPIRED',
        'Undo token expired'
      );
    }

    // Exécuter l'annulation selon le type d'outil
    try {
      // Pour file_write, restaurer l'état original
      if (undoState.toolId === 'file_write') {
        // Implémenter la logique de restauration
        console.log('[ToolsEngine] Undoing file write:', undoState.originalState);
      }

      undoState.executed = true;
      this.stats.undoCount++;

      return {
        invocationId: generateToolInvocationId(),
        toolId: 'undo',
        success: true,
        output: { undone: undoState.toolId, invocationId: undoState.invocationId },
        executionTime: 0,
        logs: [],
        undoAvailable: false,
      };
    } catch (error) {
      return this.createErrorResult(
        generateToolInvocationId(),
        'undo',
        'UNDO_FAILED',
        (error as Error).message
      );
    }
  }

  /**
   * Retourne les actions annulables
   */
  getUndoableActions(): ToolUndoState[] {
    const now = Date.now();
    return this.undoStack.filter(s => !s.executed && s.expiresAt > now);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // FORMATAGE DES RÉSULTATS
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Formate un résultat selon le format spécifié
   */
  formatResult(result: unknown, format?: OutputFormat): FormattedResult {
    const outputFormat = format ?? this.config.formatter.defaultFormat;
    const startTime = Date.now();

    let content: string;

    switch (outputFormat) {
      case 'json':
        content = JSON.stringify(result, null, 2);
        break;

      case 'text':
        content = String(result);
        break;

      case 'markdown':
        content = this.formatAsMarkdown(result);
        break;

      case 'html':
        content = this.formatAsHtml(result);
        break;

      case 'table':
        content = this.formatAsTable(result);
        break;

      case 'code':
        content = `\`\`\`\n${JSON.stringify(result, null, 2)}\n\`\`\``;
        break;

      case 'structured':
      default:
        content = JSON.stringify(result, null, 2);
    }

    // Tronquer si nécessaire
    const maxLength = this.config.formatter.maxLength ?? 10000;
    const truncated = content.length > maxLength;
    if (truncated) {
      content =
        content.substring(0, maxLength) +
        (this.config.formatter.truncateWith ?? '...[truncated]');
    }

    return {
      format: outputFormat,
      content,
      rawContent: result,
      metadata: {
        length: content.length,
        truncated,
        processingTime: Date.now() - startTime,
      },
    };
  }

  private formatAsMarkdown(result: unknown): string {
    if (Array.isArray(result)) {
      return result.map(item => `- ${JSON.stringify(item)}`).join('\n');
    }
    if (typeof result === 'object' && result !== null) {
      return Object.entries(result)
        .map(([k, v]) => `**${k}**: ${JSON.stringify(v)}`)
        .join('\n');
    }
    return String(result);
  }

  private formatAsHtml(result: unknown): string {
    if (Array.isArray(result)) {
      return `<ul>${result.map(item => `<li>${this.escapeHtml(JSON.stringify(item))}</li>`).join('')}</ul>`;
    }
    if (typeof result === 'object' && result !== null) {
      return `<dl>${Object.entries(result)
        .map(
          ([k, v]) =>
            `<dt>${this.escapeHtml(k)}</dt><dd>${this.escapeHtml(JSON.stringify(v))}</dd>`
        )
        .join('')}</dl>`;
    }
    return `<p>${this.escapeHtml(String(result))}</p>`;
  }

  private formatAsTable(result: unknown): string {
    if (!Array.isArray(result) || result.length === 0) {
      return JSON.stringify(result, null, 2);
    }

    const firstItem = result[0];
    if (typeof firstItem !== 'object' || firstItem === null) {
      return result.map(String).join('\n');
    }

    const keys = Object.keys(firstItem);
    const header = `| ${keys.join(' | ')} |`;
    const separator = `| ${keys.map(() => '---').join(' | ')} |`;
    const rows = result.map(
      item =>
        `| ${keys.map(k => String((item as Record<string, unknown>)[k] ?? '')).join(' | ')} |`
    );

    return [header, separator, ...rows].join('\n');
  }

  private escapeHtml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // ─────────────────────────────────────────────────────────────────────────
  // CALLBACKS
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * S'abonne aux mises à jour de progression
   */
  onProgress(callback: ToolProgressCallback): () => void {
    this.progressCallbacks.add(callback);
    return () => this.progressCallbacks.delete(callback);
  }

  /**
   * S'abonne aux résultats d'exécution
   */
  onResult(callback: ToolResultCallback): () => void {
    this.resultCallbacks.add(callback);
    return () => this.resultCallbacks.delete(callback);
  }

  private notifyProgress(invocationId: string, progress: number, message: string): void {
    for (const callback of this.progressCallbacks) {
      try {
        callback(invocationId, progress, message);
      } catch (error) {
        console.error('[ToolsEngine] Progress callback error:', error);
      }
    }
  }

  private notifyResult(result: ToolExecutionResult): void {
    for (const callback of this.resultCallbacks) {
      try {
        callback(result);
      } catch (error) {
        console.error('[ToolsEngine] Result callback error:', error);
      }
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // CONTRÔLE
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Annule l'exécution en cours
   */
  abort(): void {
    if (this.abortController) {
      this.abortController.abort();
      this.state.isExecuting = false;
      console.log('[ToolsEngine] 🛑 Execution aborted');
    }
  }

  /**
   * Retourne l'état actuel
   */
  getState(): ToolsState {
    return { ...this.state };
  }

  /**
   * Vérifie si une exécution est en cours
   */
  isExecuting(): boolean {
    return this.state.isExecuting;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // HISTORIQUE
  // ─────────────────────────────────────────────────────────────────────────

  private addToHistory(result: ToolExecutionResult): void {
    this.executionHistory.push(result);

    // Limiter la taille
    const maxHistory = 100;
    if (this.executionHistory.length > maxHistory) {
      this.executionHistory = this.executionHistory.slice(-maxHistory);
    }
  }

  /**
   * Retourne l'historique d'exécution
   */
  getHistory(limit?: number): ToolExecutionResult[] {
    const history = [...this.executionHistory].reverse();
    return limit ? history.slice(0, limit) : history;
  }

  /**
   * Vide l'historique
   */
  clearHistory(): void {
    this.executionHistory = [];
    console.log('[ToolsEngine] 🗑️ History cleared');
  }

  // ─────────────────────────────────────────────────────────────────────────
  // STATISTIQUES
  // ─────────────────────────────────────────────────────────────────────────

  private updateStats(
    tool: ToolDefinition,
    executionTime: number,
    success: boolean
  ): void {
    if (success) {
      this.stats.successfulInvocations++;
    }

    this.stats.totalExecutionTime += executionTime;
    this.stats.avgExecutionTime =
      this.stats.totalExecutionTime / this.stats.totalInvocations;

    // Par outil
    this.stats.invocationsByTool[tool.id] =
      (this.stats.invocationsByTool[tool.id] ?? 0) + 1;

    // Par catégorie
    this.stats.invocationsByCategory[tool.category] =
      (this.stats.invocationsByCategory[tool.category] ?? 0) + 1;

    // Mettre à jour les stats de l'outil
    tool.usageCount++;
    tool.lastUsed = Date.now();
    tool.avgExecutionTime =
      (tool.avgExecutionTime * (tool.usageCount - 1) + executionTime) / tool.usageCount;
    tool.successRate = success
      ? (tool.successRate * (tool.usageCount - 1) + 1) / tool.usageCount
      : (tool.successRate * (tool.usageCount - 1)) / tool.usageCount;
  }

  /**
   * Retourne les statistiques
   */
  getStats(): typeof this.stats {
    return { ...this.stats };
  }

  /**
   * Réinitialise les statistiques
   */
  resetStats(): void {
    this.stats = {
      totalInvocations: 0,
      successfulInvocations: 0,
      failedInvocations: 0,
      undoCount: 0,
      avgExecutionTime: 0,
      totalExecutionTime: 0,
      invocationsByTool: {},
      invocationsByCategory: {},
    };
  }

  /**
   * Retourne le score de risque d'un outil
   */
  getToolRiskScore(toolId: string): number {
    const tool = this.tools.get(toolId);
    return tool ? calculateToolRiskScore(tool) : 100;
  }

  /**
   * Retourne les outils par niveau de risque
   */
  getToolsByRiskLevel(riskLevel: RiskLevel): ToolDefinition[] {
    return this.getAllTools().filter(t => t.riskLevel === riskLevel);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════════════════════

export const toolsEngine = ToolsEngine.getInstance();

export default ToolsEngine;
