/**
 * TITANE∞ v21 — Error Message Utilities
 *
 * Transforme les erreurs techniques en messages utilisateur clairs
 *
 * © 2025 TITANE Team. All rights reserved.
 */

export interface FormattedError {
  userMessage: string;
  technicalDetails: string;
  suggestions: string[];
  severity: 'info' | 'warning' | 'error';
}

/**
 * Transforme les erreurs techniques en messages utilisateur
 */
export function formatUserError(error: unknown): FormattedError {
  const message = error instanceof Error ? error.message : String(error);

  // ═══════════════════════════════════════════════════════════════
  // Erreur de whitelist (commande non autorisée)
  // ═══════════════════════════════════════════════════════════════
  if (message.includes('is not in whitelist')) {
    const commandMatch = message.match(/Command "([^"]+)"/);
    const command = commandMatch ? commandMatch[1] : 'inconnue';

    return {
      userMessage:
        "Cette fonctionnalité nécessite une configuration spéciale et n'est pas disponible actuellement.",
      technicalDetails: `Commande refusée par le système de sécurité: ${command}`,
      suggestions: [
        'Utiliser les fonctionnalités standards disponibles',
        'Consulter le tableau de bord monitoring',
        'Vérifier la configuration système',
      ],
      severity: 'warning',
    };
  }

  // ═══════════════════════════════════════════════════════════════
  // Commande non trouvée (non implémentée backend)
  // ═══════════════════════════════════════════════════════════════
  if (message.includes('Command') && message.includes('not found')) {
    const commandMatch = message.match(/Command (\w+)/);
    const command = commandMatch ? commandMatch[1] : 'inconnue';

    return {
      userMessage: "Cette fonctionnalité n'est pas encore disponible dans cette version.",
      technicalDetails: `Commande non implémentée côté serveur: ${command}`,
      suggestions: [
        'Utiliser une fonctionnalité alternative',
        'Vérifier les mises à jour système',
        'Contacter le support technique',
      ],
      severity: 'info',
    };
  }

  // ═══════════════════════════════════════════════════════════════
  // Variable manquante (erreur React)
  // ═══════════════════════════════════════════════════════════════
  if (message.includes("Can't find variable") || message.includes('is not defined')) {
    const varMatch = message.match(/variable: (\w+)|(\w+) is not defined/);
    const variable = varMatch ? varMatch[1] || varMatch[2] : 'inconnue';

    return {
      userMessage:
        "Le module a rencontré une erreur interne et a été isolé pour protéger l'application.",
      technicalDetails: `Variable manquante dans le composant: ${variable}`,
      suggestions: [
        'Rafraîchir la page',
        'Vider le cache du navigateur',
        'Signaler le problème si cela persiste',
      ],
      severity: 'error',
    };
  }

  // ═══════════════════════════════════════════════════════════════
  // Erreur réseau / timeout
  // ═══════════════════════════════════════════════════════════════
  if (
    message.includes('timeout') ||
    message.includes('network') ||
    message.includes('fetch')
  ) {
    return {
      userMessage: 'La connexion au système a échoué. Vérifiez votre connexion réseau.',
      technicalDetails: message,
      suggestions: [
        'Vérifier la connexion internet',
        'Réessayer dans quelques instants',
        "Redémarrer l'application si le problème persiste",
      ],
      severity: 'warning',
    };
  }

  // ═══════════════════════════════════════════════════════════════
  // Erreur de permission
  // ═══════════════════════════════════════════════════════════════
  if (
    message.includes('permission') ||
    message.includes('unauthorized') ||
    message.includes('forbidden')
  ) {
    return {
      userMessage: "Vous n'avez pas les permissions nécessaires pour cette action.",
      technicalDetails: message,
      suggestions: [
        "Vérifier vos droits d'accès",
        'Contacter un administrateur',
        'Se reconnecter si nécessaire',
      ],
      severity: 'warning',
    };
  }

  // ═══════════════════════════════════════════════════════════════
  // Erreur générique
  // ═══════════════════════════════════════════════════════════════
  return {
    userMessage:
      "Une erreur inattendue s'est produite. L'opération n'a pas pu être complétée.",
    technicalDetails: message,
    suggestions: [
      "Réessayer l'opération",
      'Vérifier les paramètres système',
      'Consulter les logs pour plus de détails',
      'Contacter le support si le problème persiste',
    ],
    severity: 'error',
  };
}

/**
 * Masque les détails sensibles (whitelist complète, stack traces)
 */
export function sanitizeErrorForUser(error: string): string {
  // Supprimer la liste complète de commandes autorisées
  if (error.includes('Allowed:')) {
    const parts = error.split('Allowed:');
    const baseMessage = parts[0];
    if (!baseMessage) return error;

    const trimmedMessage = baseMessage.trim();

    // Extraire juste le nom de la commande
    const commandMatch = trimmedMessage.match(/Command "([^"]+)"/);
    const commandName = commandMatch?.[1];
    if (commandName) {
      return `La commande "${commandName}" n'est pas disponible. Consultez les détails techniques pour plus d'informations.`;
    }

    return trimmedMessage + ' (voir détails techniques)';
  }

  // Masquer les stack traces
  if (error.includes('@') && error.includes(':')) {
    const lines = error.split('\n');
    const firstLine = lines[0];
    if (!firstLine) return error;
    return firstLine; // Garder juste la première ligne
  }

  // Limiter la longueur
  if (error.length > 200) {
    return error.substring(0, 197) + '...';
  }

  return error;
}

/**
 * Détermine si l'erreur est critique (nécessite un redémarrage)
 */
export function isErrorCritical(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);

  const criticalKeywords = [
    'crash',
    'fatal',
    'panic',
    'segfault',
    'out of memory',
    'stack overflow',
  ];

  return criticalKeywords.some(keyword => message.toLowerCase().includes(keyword));
}

/**
 * Génère un ID unique pour l'erreur (pour tracking)
 */
export function generateErrorId(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  const timestamp = Date.now();
  const hash = message.split('').reduce((acc, char) => {
    return ((acc << 5) - acc + char.charCodeAt(0)) | 0;
  }, 0);

  return `err_${timestamp}_${Math.abs(hash).toString(36)}`;
}

/**
 * Formate une erreur pour les logs (avec contexte complet)
 */
export function formatErrorForLog(
  error: unknown,
  context?: Record<string, unknown>
): string {
  const message = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack : undefined;
  const errorId = generateErrorId(error);

  let log = `[${errorId}] ${message}`;

  if (stack) {
    log += `\n\nStack trace:\n${stack}`;
  }

  if (context) {
    log += `\n\nContext:\n${JSON.stringify(context, null, 2)}`;
  }

  return log;
}
