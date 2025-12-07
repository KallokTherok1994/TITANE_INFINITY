/**
 * TITANE_INFINITY v∞.19.5.2 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════
 *   SENTRY MONITORING - Error tracking & performance monitoring
 *   Remote error tracking pour production debugging
 * ═══════════════════════════════════════════════════════════════
 */

import * as Sentry from '@sentry/react';
import type { ErrorContext, ClassifiedError, ErrorSeverity } from '@/lib/errorHandler';

/**
 * Configuration Sentry par environnement
 */
interface SentryConfig {
  dsn: string;
  environment: 'development' | 'staging' | 'production';
  release: string;
  tracesSampleRate: number;
  replaysSessionSampleRate: number;
  replaysOnErrorSampleRate: number;
  enabled: boolean;
}

/**
 * Obtient la configuration Sentry selon l'environnement
 */
function getSentryConfig(): SentryConfig {
  const isDev = import.meta.env.DEV;
  const environment = import.meta.env.VITE_SENTRY_ENVIRONMENT || (isDev ? 'development' : 'production');
  const version = import.meta.env.VITE_APP_VERSION || 'v19.5.2';

  return {
    // ⚠️ IMPORTANT : Remplacer par votre vrai DSN Sentry
    // Obtenir à : https://sentry.io/settings/projects/
    dsn: import.meta.env.VITE_SENTRY_DSN || '',
    environment: environment as 'development' | 'staging' | 'production',
    release: `titane-infinity@${version}`,

    // Performance Monitoring
    tracesSampleRate: isDev ? 0.1 : 1.0, // 10% en dev, 100% en prod

    // Session Replay (pour voir les replays des sessions utilisateurs)
    replaysSessionSampleRate: 0.1, // 10% des sessions normales
    replaysOnErrorSampleRate: 1.0, // 100% des sessions avec erreurs

    // Désactiver Sentry en dev si pas de DSN
    enabled: Boolean(import.meta.env.VITE_SENTRY_DSN) && !isDev,
  };
}

/**
 * Initialise Sentry
 */
export function initSentry(): void {
  const config = getSentryConfig();

  if (!config.enabled) {
    console.log('🔍 [SENTRY] Monitoring désactivé (pas de DSN ou mode dev)');
    return;
  }

  console.log(`🔍 [SENTRY] Initialisation - Environment: ${config.environment}, Release: ${config.release}`);

  Sentry.init({
    dsn: config.dsn,
    environment: config.environment,
    release: config.release,

    // Performance Monitoring
    integrations: [
      // Tracing automatique des performances
      Sentry.browserTracingIntegration({
        // Tracer les navigations automatiquement via l'API Navigation
        enableInp: true, // Activer Interaction to Next Paint
      }),

      // Session Replay pour voir les replays vidéo
      Sentry.replayIntegration({
        maskAllText: true, // Masquer le texte pour la confidentialité
        blockAllMedia: true, // Bloquer images/vidéos pour la confidentialité
      }),

      // Breadcrumbs pour le contexte
      Sentry.breadcrumbsIntegration({
        console: true, // Capturer les console.log
        dom: true, // Capturer les clicks DOM
        fetch: true, // Capturer les requêtes fetch
        history: true, // Capturer l'historique de navigation
        xhr: true, // Capturer les requêtes XHR
      }),
    ],

    // Taux d'échantillonnage
    tracesSampleRate: config.tracesSampleRate,
    replaysSessionSampleRate: config.replaysSessionSampleRate,
    replaysOnErrorSampleRate: config.replaysOnErrorSampleRate,

    // Filtrer les erreurs avant envoi
    beforeSend(event, hint) {
      // Filtrer les erreurs de développement
      if (config.environment === 'development') {
        console.log('🔍 [SENTRY] Event filtré (dev mode):', event);
        return null;
      }

      // Filtrer certaines erreurs non critiques
      const error = hint.originalException as Error;
      if (error?.message?.includes('ResizeObserver')) {
        // Erreur bénigne du navigateur
        return null;
      }

      // Ajouter des tags personnalisés
      event.tags = {
        ...event.tags,
        titane_version: config.release,
        user_agent: navigator.userAgent,
        platform: navigator.platform,
      };

      // Ajouter le contexte système
      event.contexts = {
        ...event.contexts,
        titane: {
          memory_usage: (performance as any).memory?.usedJSHeapSize || 0,
          connection: (navigator as any).connection?.effectiveType || 'unknown',
          online: navigator.onLine,
        },
      };

      return event;
    },

    // Ignorer certaines erreurs automatiquement
    ignoreErrors: [
      // Erreurs du navigateur
      'ResizeObserver loop limit exceeded',
      'Non-Error promise rejection captured',
      // Erreurs réseau transitoires
      'NetworkError',
      'Failed to fetch',
      // Erreurs extensions navigateur
      'chrome-extension://',
      'moz-extension://',
    ],

    // Ajouter des breadcrumbs personnalisés
    beforeBreadcrumb(breadcrumb) {
      // Filtrer les breadcrumbs trop verbeux
      if (breadcrumb.category === 'console' && breadcrumb.level === 'log') {
        return null;
      }

      return breadcrumb;
    },
  });

  // Définir des tags globaux
  Sentry.setTag('app', 'titane-infinity');
  Sentry.setTag('version', config.release);

  console.log('✅ [SENTRY] Monitoring initialisé avec succès');
}

/**
 * Convertit ErrorSeverity vers Sentry Severity
 */
function toSentrySeverity(severity: ErrorSeverity): Sentry.SeverityLevel {
  switch (severity) {
    case 'info':
      return 'info';
    case 'warning':
      return 'warning';
    case 'error':
      return 'error';
    case 'critical':
      return 'fatal';
    default:
      return 'error';
  }
}

/**
 * Capture une erreur classifiée vers Sentry
 */
export function captureClassifiedError(
  classifiedError: ClassifiedError,
  originalError?: Error
): string | undefined {
  if (!getSentryConfig().enabled) {
    return undefined;
  }

  const errorToCapture = originalError || new Error(classifiedError.message);

  return Sentry.captureException(errorToCapture, {
    level: toSentrySeverity(classifiedError.severity),
    tags: {
      error_type: classifiedError.type,
      severity: classifiedError.severity,
      command: classifiedError.context?.command,
    },
    contexts: {
      error_details: {
        type: classifiedError.type,
        severity: classifiedError.severity,
        message: classifiedError.message,
        details: classifiedError.details,
        recovery: classifiedError.recovery,
      },
      error_context: classifiedError.context as any,
    },
    fingerprint: [
      // Grouper les erreurs similaires
      classifiedError.type,
      classifiedError.context?.command || 'unknown',
    ],
  });
}

/**
 * Capture un message informatif vers Sentry
 */
export function captureMessage(
  message: string,
  level: Sentry.SeverityLevel = 'info',
  context?: Record<string, unknown>
): string {
  if (!getSentryConfig().enabled) {
    return '';
  }

  return Sentry.captureMessage(message, {
    level,
    contexts: context ? { message_context: context } : undefined,
  });
}

/**
 * Ajoute un breadcrumb personnalisé
 */
export function addBreadcrumb(
  message: string,
  category: string,
  data?: Record<string, unknown>,
  level: Sentry.SeverityLevel = 'info'
): void {
  if (!getSentryConfig().enabled) {
    return;
  }

  Sentry.addBreadcrumb({
    message,
    category,
    data,
    level,
    timestamp: Date.now() / 1000,
  });
}

/**
 * Définit l'utilisateur pour le contexte Sentry
 */
export function setUser(userId: string, email?: string, username?: string): void {
  if (!getSentryConfig().enabled) {
    return;
  }

  Sentry.setUser({
    id: userId,
    email,
    username,
  });
}

/**
 * Supprime l'utilisateur (logout)
 */
export function clearUser(): void {
  if (!getSentryConfig().enabled) {
    return;
  }

  Sentry.setUser(null);
}

/**
 * Définit un tag personnalisé
 */
export function setTag(key: string, value: string): void {
  if (!getSentryConfig().enabled) {
    return;
  }

  Sentry.setTag(key, value);
}

/**
 * Définit un contexte personnalisé
 */
export function setContext(name: string, context: Record<string, unknown>): void {
  if (!getSentryConfig().enabled) {
    return;
  }

  Sentry.setContext(name, context);
}

/**
 * Démarre une transaction de performance
 */
export function startTransaction(
  name: string,
  op: string
): Sentry.Span | undefined {
  if (!getSentryConfig().enabled) {
    return undefined;
  }

  // Utiliser startSpan au lieu de startTransaction (API moderne)
  return Sentry.startInactiveSpan({
    name,
    op,
  });
}

/**
 * Wrapper pour profiler une fonction asynchrone
 */
export async function profileAsync<T>(
  name: string,
  fn: () => Promise<T>
): Promise<T> {
  const startTime = performance.now();
  
  try {
    const result = await fn();
    Sentry.captureMessage(`✅ Function ${name} completed`, 'info');
    return result;
  } catch (error) {
    Sentry.captureException(error, {
      tags: {
        function: name,
        type: 'async',
      },
    });
    throw error;
  } finally {
    const duration = performance.now() - startTime;
    Sentry.setMeasurement(`function_${name}`, duration, 'millisecond');
  }
}

/**
 * Wrapper pour profiler une fonction synchrone
 */
export function profileSync<T>(
  name: string,
  fn: () => T
): T {
  const startTime = performance.now();
  
  try {
    const result = fn();
    Sentry.captureMessage(`✅ Function ${name} completed`, 'info');
    return result;
  } catch (error) {
    Sentry.captureException(error, {
      tags: {
        function: name,
        type: 'sync',
      },
    });
    throw error;
  } finally {
    const duration = performance.now() - startTime;
    Sentry.setMeasurement(`function_${name}`, duration, 'millisecond');
  }
}

/**
 * Capture les métriques de performance Web Vitals
 */
export function captureWebVitals(): void {
  if (!getSentryConfig().enabled) {
    return;
  }

  // Importer dynamiquement web-vitals
  import('web-vitals').then(({ onCLS, onCLS: onFID, onFCP, onLCP, onTTFB }) => {
    onCLS((metric: any) => {
      Sentry.setMeasurement('CLS', metric.value, 'none');
    });

    onFID((metric: any) => {
      Sentry.setMeasurement('FID', metric.value, 'millisecond');
    });

    onFCP((metric: any) => {
      Sentry.setMeasurement('FCP', metric.value, 'millisecond');
    });

    onLCP((metric: any) => {
      Sentry.setMeasurement('LCP', metric.value, 'millisecond');
    });

    onTTFB((metric: any) => {
      Sentry.setMeasurement('TTFB', metric.value, 'millisecond');
    });
  }).catch(() => {
    // web-vitals non disponible, ignorer
  });
}

/**
 * Test de l'envoi d'erreur à Sentry (pour debug)
 */
export function testSentry(): void {
  console.log('🧪 [SENTRY] Test d\'envoi d\'erreur...');

  try {
    throw new Error('Test Sentry - Cette erreur est volontaire pour tester le monitoring');
  } catch (error) {
    captureClassifiedError(
      {
        type: 'TestError',
        severity: 'warning' as any,
        message: 'Test Sentry monitoring',
        details: 'Ceci est un test volontaire',
        recovery: 'Aucune action requise',
        context: {
          command: 'test_sentry',
          context: 'sentry_test',
          timestamp: Date.now(),
        },
      },
      error as Error
    );

    console.log('✅ [SENTRY] Erreur de test envoyée avec succès');
    console.log('   Vérifiez votre dashboard Sentry dans quelques secondes');
  }
}

/**
 * Export du module Sentry complet pour usage avancé
 */
export { Sentry };

/**
 * Export de React.useEffect, useLocation, etc. pour l'instrumentation React Router
 */
import React from 'react';
import {
  useLocation,
  useNavigationType,
  createRoutesFromChildren,
  matchRoutes,
} from 'react-router-dom';

export {
  React,
  useLocation,
  useNavigationType,
  createRoutesFromChildren,
  matchRoutes,
};
