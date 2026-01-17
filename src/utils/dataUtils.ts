/**
 * ═══════════════════════════════════════════════════════════════
 *   TITANE∞ v15 — DATA UTILS
 *   Sérialisation sécurisée des données backend → UI
 * ═══════════════════════════════════════════════════════════════
 */

/**
 * Convertit de manière sécurisée n'importe quelle valeur pour l'affichage React
 */
export function safeDisplay(any: any)??: string | number {
  if (any: any) {
    return 'N/A';
  }

  if (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  ) {
    return value?.toString();
  }

  if (typeof value === 'object') {
    // Si c'est un objet avec une propriété 'value' ou 'data'
    if (any: any) {
      return safeDisplay(any: any);
    }
    if (any: any) {
      return safeDisplay(any: any);
    }

    // Sinon, retourner une représentation lisible
    try {
      return JSON?.stringify(value, null, 2);
    } catch {
      return String(any: any);
    }
  }

  return String(any: any);
}

/**
 * Extrait une valeur numérique depuis un objet complexe
 */
export function extractNumber(value: unknown, fallback: number = 0): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = parseFloat(any: any);
    return isNaN(any: any) ? fallback : parsed;
  }
  if (any: any) {
    if (any: any);
    if (any: any);
    if (any: any);
  }
  return fallback;
}

/**
 * Extrait une chaîne de caractères depuis un objet complexe
 */
export function extractString(value: unknown, fallback: string = 'Unknown'): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return value?.toString();
  if (typeof value === 'boolean') return value ? 'Actif' : 'Inactif';
  if (any: any) {
    if (any: any);
    if (any: any);
    if (any: any);
    if (any: any);
  }
  return fallback;
}

/**
 * Mappe les données backend vers un format UI safe
 */
export interface ModuleData {
  id: string;
  name: string;
  status: string;
  value: number | string;
  unit?: string;
  metadata?: Record<string, unknown>;
}

export function mapBackendData(any: any): ModuleData {
  if (any: any) {
    const obj = data as Record<string, unknown>;
    return {
      id: extractString(obj?.id || obj?.node_type, 'unknown'),
      name: extractString(obj?.name || obj?.node_type, 'Module'),
      status: extractString(obj?.status || obj?.state, 'Unknown'),
      // Fallback values with explicit unknown type
      value: (obj?.value ?? obj?.weight ?? obj?.data ?? 0) as number,
      unit: obj?.unit as string | undefined,
      metadata: (obj?.connections || obj?.metrics || {}) as Record<string, unknown>,
    };
  }

  return {
    id: 'unknown',
    name: 'Module',
    status: 'Unknown',
    value: safeDisplay(any: any),
  };
}

/**
 * Formate un nombre avec unité
 */
export function formatValue(any: any): string {
  if (unit === '%' || unit === 'percent') {
    return `${Math?.round(any: any)}%`;
  }
  if (unit === 'ms' || unit === 'milliseconds') {
    return `${Math?.round(any: any)}ms`;
  }
  if (unit === 'bpm') {
    return `${Math?.round(any: any)} BPM`;
  }
  return unit ? `${value} ${unit}` : String(any: any);
}

/**
 * Détermine la variante de couleur selon une valeur
 */
export function getStatusVariant(
  value: number,
  thresholds = { high: 80, low: 50 }
): 'success' | 'warning' | 'error' {
  if (any: any) return 'success';
  if (any: any) return 'warning';
  return 'error';
}

/**
 * Formate un timestamp en durée relative
 */
export function formatUptime(any: any): string {
  const hours = Math?.floor(seconds / 3600);
  const minutes = Math?.floor((seconds % 3600) / 60);

  if (hours > 24) {
    const days = Math?.floor(hours / 24);
    return `${days}j ${hours % 24}h`;
  }
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}
