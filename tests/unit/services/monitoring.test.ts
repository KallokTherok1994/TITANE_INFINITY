/**
 * TITANE∞ v26.4.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TITANE∞ — Tests: Monitoring System (Sprint 2)
 * Tests unitaires pour métriques, logging, alerting
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { chatMetrics } from '../../../src/services/monitoring/chatMetrics';
import {
  logger,
  LogLevel,
  generateCorrelationId,
} from '../../../src/services/monitoring/logger';
import {
  alerting,
  AlertType,
  AlertSeverity,
} from '../../../src/services/monitoring/alerting';

describe('Sprint 2: Monitoring System', () => {
  describe('ChatMetrics Service', () => {
    beforeEach(() => {
      chatMetrics.reset();
    });

    it('démarre une conversation', () => {
      const conversationId = 'test-conv-1';
      chatMetrics.startConversation(conversationId);

      const metrics = chatMetrics.getConversationMetrics(conversationId);
      expect(metrics).toBeDefined();
      expect(metrics?.conversationId).toBe(conversationId);
      expect(metrics?.totalMessages).toBe(0);
      expect(metrics?.endedAt).toBeNull();
    });

    it('enregistre un message envoyé', () => {
      const conversationId = 'test-conv-2';
      chatMetrics.startConversation(conversationId);
      chatMetrics.recordMessageSent(conversationId, 50);

      const metrics = chatMetrics.getConversationMetrics(conversationId);
      expect(metrics?.totalMessages).toBe(1);
      expect(metrics?.userMessages).toBe(1);
    });

    it('enregistre un message reçu avec temps de réponse', () => {
      const conversationId = 'test-conv-3';
      chatMetrics.startConversation(conversationId);
      chatMetrics.recordMessageSent(conversationId, 50);
      chatMetrics.recordMessageReceived(conversationId, 2500, 200);

      const metrics = chatMetrics.getConversationMetrics(conversationId);
      expect(metrics?.totalMessages).toBe(2);
      expect(metrics?.assistantMessages).toBe(1);
      expect(metrics?.avgResponseTime).toBe(2500);
      expect(metrics?.minResponseTime).toBe(2500);
      expect(metrics?.maxResponseTime).toBe(2500);
    });

    it('calcule correctement le taux de validation', () => {
      const conversationId = 'test-conv-4';
      chatMetrics.startConversation(conversationId);

      // 3 messages valides
      chatMetrics.recordMessageSent(conversationId, 50);
      chatMetrics.recordMessageReceived(conversationId, 1000, 100);
      chatMetrics.recordMessageSent(conversationId, 60);

      // 1 message rejeté
      chatMetrics.recordMessageRejected(conversationId, 'Message vide');

      const metrics = chatMetrics.getConversationMetrics(conversationId);
      expect(metrics?.totalMessages).toBe(4);
      expect(metrics?.rejectedMessages).toBe(1);
      expect(metrics?.validationRate).toBeCloseTo(0.75, 2); // 75%
    });

    it("calcule correctement le taux d'erreur", () => {
      const conversationId = 'test-conv-5';
      chatMetrics.startConversation(conversationId);

      // 2 messages normaux
      chatMetrics.recordMessageSent(conversationId, 50);
      chatMetrics.recordMessageReceived(conversationId, 1000, 100);

      // 1 erreur
      chatMetrics.recordError(conversationId, 'NetworkError', 'Failed to fetch');

      const metrics = chatMetrics.getConversationMetrics(conversationId);
      expect(metrics?.errorCount).toBe(1);
      expect(metrics?.errorRate).toBeCloseTo(0.333, 2); // ~33%
    });

    it('fournit des métriques globales correctes', () => {
      // Conversation 1
      chatMetrics.startConversation('conv-1');
      chatMetrics.recordMessageSent('conv-1', 50);
      chatMetrics.recordMessageReceived('conv-1', 1000, 100);

      // Conversation 2
      chatMetrics.startConversation('conv-2');
      chatMetrics.recordMessageSent('conv-2', 60);
      chatMetrics.recordMessageReceived('conv-2', 2000, 120);

      const global = chatMetrics.getGlobalMetrics();
      expect(global.totalConversations).toBe(2);
      expect(global.activeConversations).toBe(2); // Pas terminées
      expect(global.totalMessages).toBe(4);
      expect(global.avgResponseTime).toBeCloseTo(1500, 0); // Moyenne 1000+2000
    });

    it('nettoie les anciennes conversations', () => {
      // Créer 60 conversations terminées
      for (let i = 0; i < 60; i++) {
        const id = `conv-${i}`;
        chatMetrics.startConversation(id);
        chatMetrics.endConversation(id);
      }

      const beforeCleanup = chatMetrics.getGlobalMetrics();
      expect(beforeCleanup.totalConversations).toBe(60);

      chatMetrics.cleanupOldConversations(50);

      const afterCleanup = chatMetrics.getGlobalMetrics();
      expect(afterCleanup.totalConversations).toBe(50);
    });
  });

  describe('Structured Logger', () => {
    beforeEach(() => {
      logger.clearBuffer();
      logger.configure({ minLevel: LogLevel.DEBUG, enableConsole: false });
    });

    it('enregistre un log INFO', () => {
      logger.info('Test message', 'TestModule', { key: 'value' });

      const logs = logger.getRecentLogs(1);
      expect(logs).toHaveLength(1);
      expect(logs[0].level).toBe(LogLevel.INFO);
      expect(logs[0].message).toBe('Test message');
      expect(logs[0].module).toBe('TestModule');
      expect(logs[0].context?.key).toBe('value');
    });

    it('filtre les logs par niveau minimum', () => {
      logger.configure({ minLevel: LogLevel.WARN });

      logger.debug('Debug message', 'TestModule');
      logger.info('Info message', 'TestModule');
      logger.warn('Warn message', 'TestModule');

      const logs = logger.getRecentLogs(10);
      expect(logs).toHaveLength(1); // Seulement WARN
      expect(logs[0].level).toBe(LogLevel.WARN);
    });

    it('enregistre un log ERROR avec stack trace', () => {
      const error = new Error('Test error');
      logger.error('Operation failed', 'TestModule', error);

      const logs = logger.getRecentLogs(1);
      expect(logs[0].level).toBe(LogLevel.ERROR);
      expect(logs[0].stack).toBeDefined();
      expect(logs[0].context?.errorName).toBe('Error');
    });

    it('associe un correlation ID', () => {
      const correlationId = generateCorrelationId();
      logger.info('Request started', 'TestModule', {}, correlationId);

      const logs = logger.getRecentLogs(1);
      expect(logs[0].correlationId).toBe(correlationId);
    });

    it('exporte les logs en JSON', () => {
      logger.info('Message 1', 'TestModule');
      logger.warn('Message 2', 'TestModule');

      const jsonLogs = logger.exportLogs();
      const parsed = JSON.parse(jsonLogs);

      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed).toHaveLength(2);
    });

    it('crée un module logger avec contexte', () => {
      const moduleLogger = logger.createModuleLogger('ChatEngine', { version: '1.0' });

      moduleLogger.info('Test message', { extra: 'data' });

      const logs = logger.getRecentLogs(1);
      expect(logs[0].module).toBe('ChatEngine');
      expect(logs[0].context?.version).toBe('1.0');
      expect(logs[0].context?.extra).toBe('data');
    });
  });

  describe('Alerting System', () => {
    beforeEach(() => {
      alerting.reset();
      chatMetrics.reset();
      alerting.configure({
        enabled: true,
        rejectionRateThreshold: 0.1, // 10%
        errorRateThreshold: 0.1, // 10%
        responseTimeThreshold: 5000, // 5s
        checkInterval: 1000, // 1s (pour tests)
      });
    });

    afterEach(() => {
      alerting.stop();
    });

    it('déclenche une alerte manuelle', () => {
      const alertId = alerting.triggerManualAlert(
        AlertType.ERROR_BOUNDARY_TRIGGERED,
        AlertSeverity.WARNING,
        'Test alert',
        { test: true }
      );

      expect(alertId).toBeDefined();

      const activeAlerts = alerting.getActiveAlerts();
      expect(activeAlerts).toHaveLength(1);
      expect(activeAlerts[0].message).toBe('Test alert');
    });

    it('résout une alerte active', () => {
      const alertId = alerting.triggerManualAlert(
        AlertType.ERROR_BOUNDARY_TRIGGERED,
        AlertSeverity.WARNING,
        'Test alert'
      );

      alerting.resolveAlert(alertId);

      const activeAlerts = alerting.getActiveAlerts();
      expect(activeAlerts).toHaveLength(0);

      const history = alerting.getAlertHistory();
      expect(history[0].resolved).toBe(true);
      expect(history[0].resolvedAt).toBeDefined();
    });

    it("détecte un taux d'erreur élevé", () => {
      // Créer une conversation avec 20% d'erreurs
      chatMetrics.startConversation('conv-1');
      chatMetrics.recordMessageSent('conv-1', 50);
      chatMetrics.recordMessageReceived('conv-1', 1000, 100); // OK
      chatMetrics.recordMessageSent('conv-1', 50);
      chatMetrics.recordError('conv-1', 'NetworkError', 'Timeout'); // Erreur
      chatMetrics.recordMessageSent('conv-1', 50);
      chatMetrics.recordError('conv-1', 'NetworkError', 'Timeout'); // Erreur

      // Vérifier manuellement (sans timer)
      alerting.checkAlerts();

      const activeAlerts = alerting.getActiveAlerts();
      const errorAlert = activeAlerts.find(a => a.type === AlertType.HIGH_ERROR_RATE);

      expect(errorAlert).toBeDefined();
      expect(errorAlert?.severity).toBe(AlertSeverity.CRITICAL);
    });

    it("ne déclenche pas d'alerte si seuils non dépassés", () => {
      // Conversation normale (pas d'erreurs)
      chatMetrics.startConversation('conv-1');
      chatMetrics.recordMessageSent('conv-1', 50);
      chatMetrics.recordMessageReceived('conv-1', 1000, 100);

      alerting.checkAlerts();

      const activeAlerts = alerting.getActiveAlerts();
      expect(activeAlerts).toHaveLength(0);
    });

    it('auto-résout une alerte quand le seuil redevient normal', () => {
      // Créer une situation d'erreur
      chatMetrics.startConversation('conv-1');
      chatMetrics.recordMessageSent('conv-1', 50);
      chatMetrics.recordError('conv-1', 'NetworkError', 'Timeout');

      alerting.checkAlerts();
      expect(alerting.getActiveAlerts()).toHaveLength(2);

      // Nettoyer et recréer conversation saine
      chatMetrics.reset();
      chatMetrics.startConversation('conv-2');
      chatMetrics.recordMessageSent('conv-2', 50);
      chatMetrics.recordMessageReceived('conv-2', 1000, 100); // OK

      alerting.checkAlerts();

      // L'alerte devrait être auto-résolue
      expect(alerting.getActiveAlerts()).toHaveLength(0);
    });

    it('filtre les alertes par sévérité', () => {
      alerting.triggerManualAlert(
        AlertType.LONG_CONVERSATION,
        AlertSeverity.INFO,
        'Info alert'
      );
      alerting.triggerManualAlert(
        AlertType.HIGH_ERROR_RATE,
        AlertSeverity.CRITICAL,
        'Critical alert'
      );

      const criticalAlerts = alerting.getAlertsBySeverity(AlertSeverity.CRITICAL);
      expect(criticalAlerts).toHaveLength(1);
      expect(criticalAlerts[0].severity).toBe(AlertSeverity.CRITICAL);
    });
  });
});
