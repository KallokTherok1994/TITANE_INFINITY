/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TITANE∞ PERMISSION MANAGER — Gouvernance des Accès par Mode IA
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Gestionnaire centralisé des permissions pour Search + Tools Engine.
 * Implémente une gouvernance stricte basée sur le mode IA actif.
 *
 * Modes IA:
 * - standard: Lecture seule, recherche basique
 * - dev: Écriture fichiers, exécution code sandboxé
 * - architect: Commandes système, modifications architecture
 * - autonomous: Accès complet avec logging
 *
 * @module permissionManager
 * @version Ω∞+
 */

import {
  type IAMode,
  type PermissionLevel,
  type ToolCategory,
  type ToolDefinition,
  type PermissionMatrix,
  type PermissionRule,
  type PermissionRequest,
  type PermissionDecision,
  type PermissionManagerConfig,
  DEFAULT_PERMISSION_MANAGER_CONFIG,
  DEFAULT_PERMISSION_MATRIX,
  PERMISSION_LEVEL_PRIORITY,
  hasPermission,
  hasModeAccess as _hasModeAccess,
  getEffectivePermission,
  generatePermissionRequestId,
} from './searchTools.config';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES INTERNES
// ═══════════════════════════════════════════════════════════════════════════

interface CachedDecision {
  decision: PermissionDecision;
  createdAt: number;
  expiresAt: number;
  hits: number;
}

interface PermissionAuditEntry {
  timestamp: number;
  request: PermissionRequest;
  decision: PermissionDecision;
  iaMode: IAMode;
  context?: Record<string, unknown>;
}

type PermissionCallback = (
  request: PermissionRequest,
  decision: PermissionDecision
) => void;

// ═══════════════════════════════════════════════════════════════════════════
// PERMISSION MANAGER
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Permission Manager — Singleton
 *
 * Gère les permissions d'accès aux outils basées sur le mode IA.
 */
export class PermissionManager {
  private static instance: PermissionManager | null = null;

  private config: PermissionManagerConfig;
  private currentMode: IAMode = 'standard';
  private customRules: PermissionRule[] = [];
  private decisionCache: Map<string, CachedDecision> = new Map();
  private auditLog: PermissionAuditEntry[] = [];
  private callbacks: Set<PermissionCallback> = new Set();

  // Stats
  private stats = {
    totalRequests: 0,
    granted: 0,
    denied: 0,
    cacheHits: 0,
    cacheMisses: 0,
  };

  private constructor() {
    this.config = { ...DEFAULT_PERMISSION_MANAGER_CONFIG };
    this.customRules = [...this.config.customRules];

    console.log('[PermissionManager] 🔐 Initialized with mode:', this.currentMode);
  }

  /**
   * Obtient l'instance singleton
   */
  static getInstance(): PermissionManager {
    if (!PermissionManager.instance) {
      PermissionManager.instance = new PermissionManager();
    }
    return PermissionManager.instance;
  }

  /**
   * Réinitialise l'instance (pour tests)
   */
  static resetInstance(): void {
    PermissionManager.instance = null;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // CONFIGURATION
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Configure le permission manager
   */
  configure(config: Partial<PermissionManagerConfig>): void {
    this.config = { ...this.config, ...config };

    if (config.customRules) {
      this.customRules = [...config.customRules];
    }

    // Vider le cache si la config change
    this.decisionCache.clear();

    console.log('[PermissionManager] ⚙️ Configuration updated');
  }

  /**
   * Retourne la configuration actuelle
   */
  getConfig(): PermissionManagerConfig {
    return { ...this.config };
  }

  /**
   * Définit le mode IA actif
   */
  setMode(mode: IAMode): void {
    const previousMode = this.currentMode;
    this.currentMode = mode;

    // Vider le cache lors du changement de mode
    this.decisionCache.clear();

    console.log(`[PermissionManager] 🔄 Mode changed: ${previousMode} → ${mode}`);
  }

  /**
   * Retourne le mode IA actif
   */
  getMode(): IAMode {
    return this.currentMode;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // VÉRIFICATION DE PERMISSIONS
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Vérifie si un outil est accessible dans le mode actuel
   */
  canAccessTool(tool: ToolDefinition): PermissionDecision {
    const request: PermissionRequest = {
      id: generatePermissionRequestId(),
      toolId: tool.id,
      category: tool.category,
      iaMode: this.currentMode,
      requestedLevel: this.getHighestRequiredPermission(tool.requiredPermissions),
      reason: `Access tool: ${tool.name}`,
      context: { toolName: tool.name, toolCategory: tool.category },
      timestamp: Date.now(),
    };

    return this.checkPermission(request);
  }

  /**
   * Vérifie une demande de permission
   */
  checkPermission(request: PermissionRequest): PermissionDecision {
    this.stats.totalRequests++;

    // Vérifier le cache
    if (this.config.cacheDecisions) {
      const cached = this.getCachedDecision(request);
      if (cached) {
        this.stats.cacheHits++;
        return cached;
      }
      this.stats.cacheMisses++;
    }

    // Évaluer la permission
    const decision = this.evaluatePermission(request);

    // Mettre en cache
    if (this.config.cacheDecisions) {
      this.cacheDecision(request, decision);
    }

    // Audit log
    this.logPermissionDecision(request, decision);

    // Notifier les callbacks
    this.notifyCallbacks(request, decision);

    // Mettre à jour les stats
    if (decision.granted) {
      this.stats.granted++;
    } else {
      this.stats.denied++;
    }

    return decision;
  }

  /**
   * Vérifie rapidement si une catégorie est accessible
   */
  canAccessCategory(category: ToolCategory): boolean {
    const permission = getEffectivePermission(
      this.config.matrix,
      this.currentMode,
      category
    );
    return permission !== 'none';
  }

  /**
   * Vérifie si le mode actuel a le niveau de permission requis
   */
  hasPermissionLevel(category: ToolCategory, requiredLevel: PermissionLevel): boolean {
    const currentPermission = getEffectivePermission(
      this.config.matrix,
      this.currentMode,
      category
    );
    return hasPermission(requiredLevel, currentPermission);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // ÉVALUATION DES RÈGLES
  // ─────────────────────────────────────────────────────────────────────────

  private evaluatePermission(request: PermissionRequest): PermissionDecision {
    const appliedRules: string[] = [];
    let granted = false;
    let effectiveLevel: PermissionLevel = 'none';
    let reason = '';
    let requiresConfirmation = false;

    // 1. Vérifier si le système est enabled
    if (!this.config.enabled) {
      return {
        requestId: request.id,
        granted: true,
        effectiveLevel: 'admin',
        reason: 'Permission system disabled',
        appliedRules: [],
        requiresConfirmation: false,
      };
    }

    // 2. Évaluer les règles personnalisées (priorité haute → basse)
    const sortedRules = [...this.customRules]
      .filter(r => r.enabled)
      .sort((a, b) => b.priority - a.priority);

    for (const rule of sortedRules) {
      if (this.evaluateRuleCondition(rule, request)) {
        appliedRules.push(rule.id);

        if (rule.effect === 'deny') {
          return {
            requestId: request.id,
            granted: false,
            effectiveLevel: 'none',
            reason: `Denied by rule: ${rule.name}`,
            appliedRules,
            requiresConfirmation: false,
          };
        } else if (rule.effect === 'allow') {
          granted = true;
          reason = `Allowed by rule: ${rule.name}`;
          break;
        }
      }
    }

    // 3. Si pas de règle custom, utiliser la matrice
    if (!granted) {
      effectiveLevel = getEffectivePermission(
        this.config.matrix,
        request.iaMode,
        request.category
      );

      granted = hasPermission(request.requestedLevel, effectiveLevel);

      if (granted) {
        reason = `Allowed by matrix: ${request.iaMode} → ${request.category} = ${effectiveLevel}`;
        appliedRules.push('matrix_default');
      } else {
        reason = `Denied by matrix: ${request.iaMode} has ${effectiveLevel}, needs ${request.requestedLevel}`;
        appliedRules.push('matrix_default');
      }
    }

    // 4. Mode strict: refuser si non explicitement autorisé
    if (this.config.strictMode && !granted) {
      reason = `Strict mode: ${reason}`;
    }

    // 5. Déterminer si confirmation requise
    if (granted) {
      requiresConfirmation = this.isConfirmationRequired(request, effectiveLevel);
    }

    return {
      requestId: request.id,
      granted,
      effectiveLevel,
      reason,
      appliedRules,
      requiresConfirmation,
      expiresAt: this.config.cacheDecisions
        ? Date.now() + this.config.decisionCacheTTL * 1000
        : undefined,
    };
  }

  private evaluateRuleCondition(
    rule: PermissionRule,
    request: PermissionRequest
  ): boolean {
    const { condition } = rule;

    switch (condition.type) {
      case 'mode':
        return this.evaluateOperator(condition.operator, request.iaMode, condition.value);

      case 'category':
        return this.evaluateOperator(
          condition.operator,
          request.category,
          condition.value
        );

      case 'tool':
        return this.evaluateOperator(condition.operator, request.toolId, condition.value);

      case 'time': {
        const now = new Date();
        const timeValue = condition.value as { start?: string; end?: string };
        const currentHour = now.getHours();

        if (timeValue.start && timeValue.end) {
          const startHour = parseInt(timeValue.start.split(':')[0], 10);
          const endHour = parseInt(timeValue.end.split(':')[0], 10);
          return currentHour >= startHour && currentHour <= endHour;
        }
        return true;
      }

      case 'context':
        return this.evaluateOperator(
          condition.operator,
          request.context,
          condition.value
        );

      case 'custom':
        // Les évaluateurs custom doivent être implémentés par extension
        console.warn(
          `[PermissionManager] Custom evaluator not implemented: ${condition.customEvaluator}`
        );
        return false;

      default:
        return false;
    }
  }

  private evaluateOperator(
    operator: string,
    actual: unknown,
    expected: unknown
  ): boolean {
    switch (operator) {
      case 'equals':
        return actual === expected;

      case 'not_equals':
        return actual !== expected;

      case 'in':
        return Array.isArray(expected) && expected.includes(actual);

      case 'not_in':
        return Array.isArray(expected) && !expected.includes(actual);

      case 'matches':
        return (
          typeof actual === 'string' &&
          typeof expected === 'string' &&
          new RegExp(expected).test(actual)
        );

      default:
        return false;
    }
  }

  private isConfirmationRequired(
    request: PermissionRequest,
    effectiveLevel: PermissionLevel
  ): boolean {
    // Confirmation pour les niveaux élevés
    if (effectiveLevel === 'execute' || effectiveLevel === 'admin') {
      return true;
    }

    // Confirmation pour les catégories sensibles
    const sensitiveCategories: ToolCategory[] = ['system', 'security', 'database'];
    if (sensitiveCategories.includes(request.category)) {
      return true;
    }

    return false;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // GESTION DES RÈGLES CUSTOM
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Ajoute une règle de permission personnalisée
   */
  addRule(rule: PermissionRule): void {
    const existingIndex = this.customRules.findIndex(r => r.id === rule.id);

    if (existingIndex >= 0) {
      this.customRules[existingIndex] = rule;
    } else {
      this.customRules.push(rule);
    }

    // Vider le cache
    this.decisionCache.clear();

    console.log(`[PermissionManager] ➕ Rule added/updated: ${rule.name}`);
  }

  /**
   * Supprime une règle de permission
   */
  removeRule(ruleId: string): boolean {
    const index = this.customRules.findIndex(r => r.id === ruleId);

    if (index >= 0) {
      const removed = this.customRules.splice(index, 1)[0];
      this.decisionCache.clear();
      console.log(`[PermissionManager] ➖ Rule removed: ${removed.name}`);
      return true;
    }

    return false;
  }

  /**
   * Retourne toutes les règles custom
   */
  getRules(): PermissionRule[] {
    return [...this.customRules];
  }

  /**
   * Active/désactive une règle
   */
  toggleRule(ruleId: string, enabled: boolean): boolean {
    const rule = this.customRules.find(r => r.id === ruleId);

    if (rule) {
      rule.enabled = enabled;
      this.decisionCache.clear();
      return true;
    }

    return false;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // GESTION DE LA MATRICE
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Met à jour la matrice de permissions
   */
  updateMatrix(matrix: Partial<PermissionMatrix>): void {
    // Créer une nouvelle matrice avec les valeurs par défaut et les mises à jour
    const updatedMatrix: PermissionMatrix = { ...this.config.matrix };

    for (const [mode, categories] of Object.entries(matrix)) {
      if (categories) {
        updatedMatrix[mode] = {
          ...updatedMatrix[mode],
          ...categories,
        };
      }
    }

    this.config.matrix = updatedMatrix;
    this.decisionCache.clear();
    console.log('[PermissionManager] 📊 Matrix updated');
  }

  /**
   * Définit une permission dans la matrice
   */
  setPermission(mode: IAMode, category: ToolCategory, level: PermissionLevel): void {
    if (!this.config.matrix[mode]) {
      this.config.matrix[mode] = {};
    }

    this.config.matrix[mode][category] = level;
    this.decisionCache.clear();

    console.log(`[PermissionManager] 🔧 Set ${mode}.${category} = ${level}`);
  }

  /**
   * Retourne la matrice de permissions
   */
  getMatrix(): PermissionMatrix {
    return { ...this.config.matrix };
  }

  /**
   * Réinitialise la matrice aux valeurs par défaut
   */
  resetMatrix(): void {
    // Deep copy de la matrice par défaut
    this.config.matrix = JSON.parse(JSON.stringify(DEFAULT_PERMISSION_MATRIX));
    this.decisionCache.clear();
    console.log('[PermissionManager] 🔄 Matrix reset to defaults');
  }

  // ─────────────────────────────────────────────────────────────────────────
  // CACHE
  // ─────────────────────────────────────────────────────────────────────────

  private getCacheKey(request: PermissionRequest): string {
    return `${request.iaMode}_${request.category}_${request.toolId}_${request.requestedLevel}`;
  }

  private getCachedDecision(request: PermissionRequest): PermissionDecision | null {
    const key = this.getCacheKey(request);
    const cached = this.decisionCache.get(key);

    if (cached && cached.expiresAt > Date.now()) {
      cached.hits++;
      return { ...cached.decision, requestId: request.id };
    }

    // Expirer les entrées
    if (cached) {
      this.decisionCache.delete(key);
    }

    return null;
  }

  private cacheDecision(request: PermissionRequest, decision: PermissionDecision): void {
    const key = this.getCacheKey(request);
    const ttl = this.config.decisionCacheTTL * 1000;

    this.decisionCache.set(key, {
      decision,
      createdAt: Date.now(),
      expiresAt: Date.now() + ttl,
      hits: 0,
    });
  }

  /**
   * Vide le cache de décisions
   */
  clearCache(): void {
    this.decisionCache.clear();
    console.log('[PermissionManager] 🗑️ Cache cleared');
  }

  // ─────────────────────────────────────────────────────────────────────────
  // AUDIT LOG
  // ─────────────────────────────────────────────────────────────────────────

  private logPermissionDecision(
    request: PermissionRequest,
    decision: PermissionDecision
  ): void {
    const entry: PermissionAuditEntry = {
      timestamp: Date.now(),
      request,
      decision,
      iaMode: this.currentMode,
      context: request.context,
    };

    this.auditLog.push(entry);

    // Limiter la taille du log
    const maxLogSize = 1000;
    if (this.auditLog.length > maxLogSize) {
      this.auditLog = this.auditLog.slice(-maxLogSize);
    }
  }

  /**
   * Retourne le log d'audit
   */
  getAuditLog(limit?: number): PermissionAuditEntry[] {
    const entries = [...this.auditLog].reverse();
    return limit ? entries.slice(0, limit) : entries;
  }

  /**
   * Vide le log d'audit
   */
  clearAuditLog(): void {
    this.auditLog = [];
    console.log('[PermissionManager] 🗑️ Audit log cleared');
  }

  // ─────────────────────────────────────────────────────────────────────────
  // CALLBACKS
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * S'abonne aux décisions de permission
   */
  onPermissionDecision(callback: PermissionCallback): () => void {
    this.callbacks.add(callback);
    return () => this.callbacks.delete(callback);
  }

  private notifyCallbacks(
    request: PermissionRequest,
    decision: PermissionDecision
  ): void {
    for (const callback of this.callbacks) {
      try {
        callback(request, decision);
      } catch (error) {
        console.error('[PermissionManager] Callback error:', error);
      }
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // UTILITAIRES
  // ─────────────────────────────────────────────────────────────────────────

  private getHighestRequiredPermission(permissions: PermissionLevel[]): PermissionLevel {
    if (permissions.length === 0) return 'none';

    return permissions.reduce((highest, current) => {
      return PERMISSION_LEVEL_PRIORITY[current] > PERMISSION_LEVEL_PRIORITY[highest]
        ? current
        : highest;
    });
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
      totalRequests: 0,
      granted: 0,
      denied: 0,
      cacheHits: 0,
      cacheMisses: 0,
    };
  }

  /**
   * Retourne un résumé des permissions pour le mode actuel
   */
  getPermissionSummary(): Record<ToolCategory, PermissionLevel> {
    const categories: ToolCategory[] = [
      'search',
      'file',
      'code',
      'system',
      'network',
      'database',
      'ai',
      'automation',
      'security',
      'utility',
    ];

    const summary: Record<string, PermissionLevel> = {};

    for (const category of categories) {
      summary[category] = getEffectivePermission(
        this.config.matrix,
        this.currentMode,
        category
      );
    }

    return summary as Record<ToolCategory, PermissionLevel>;
  }

  /**
   * Exporte la configuration complète
   */
  exportConfig(): {
    config: PermissionManagerConfig;
    currentMode: IAMode;
    customRules: PermissionRule[];
  } {
    return {
      config: this.getConfig(),
      currentMode: this.currentMode,
      customRules: this.getRules(),
    };
  }

  /**
   * Importe une configuration
   */
  importConfig(data: {
    config?: Partial<PermissionManagerConfig>;
    currentMode?: IAMode;
    customRules?: PermissionRule[];
  }): void {
    if (data.config) {
      this.configure(data.config);
    }
    if (data.currentMode) {
      this.setMode(data.currentMode);
    }
    if (data.customRules) {
      this.customRules = [...data.customRules];
    }

    this.decisionCache.clear();
    console.log('[PermissionManager] 📥 Configuration imported');
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════════════════════

export const permissionManager = PermissionManager.getInstance();

export default PermissionManager;
