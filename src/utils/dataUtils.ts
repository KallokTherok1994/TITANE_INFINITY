/**
 * ═══════════════════════════════════════════════════════════════
 *   TITANE∞ v15.7 — DATA UTILS
 *   Sérialisation sécurisée des données backend → UI
 * ═══════════════════════════════════════════════════════════════
 */

/**
 * Convertit de manière sécurisée n'importe quelle valeur pour l'affichage React
 */
export function safeDisplay(value: unknown): string | number {
  if (value === null || value === undefined) {
    return 'N/A';
  }

  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return value.toString();
  }

  if (typeof value === 'object') {
    // Si c'est un objet avec une propriété 'value' ou 'data'
    if ('value' in value && value.value !== undefined) {
      return safeDisplay(value.value);
    }
    if ('data' in value && value.data !== undefined) {
      return safeDisplay(value.data);
    }
    
    // Sinon, retourner une représentation lisible
    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return String(value);
    }
  }

  return String(value);
}

/**
 * Extrait une valeur numérique depuis un objet complexe
 */
export function extractNumber(value: unknown, fallback: number = 0): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? fallback : parsed;
  }
  if (typeof value === 'object' && value !== null) {
    if ('value' in value) return extractNumber(value.value, fallback);
    if ('data' in value) return extractNumber(value.data, fallback);
    if ('weight' in value) return extractNumber(value.weight, fallback);
  }
  return fallback;
}

/**
 * Extrait une chaîne de caractères depuis un objet complexe
 */
export function extractString(value: unknown, fallback: string = 'Unknown'): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return value.toString();
  if (typeof value === 'boolean') return value ? 'Actif' : 'Inactif';
  if (typeof value === 'object' && value !== null) {
    if ('status' in value) return extractString(value.status, fallback);
    if ('state' in value) return extractString(value.state, fallback);
    if ('name' in value) return extractString(value.name, fallback);
    if ('id' in value) return extractString(value.id, fallback);
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

export function mapBackendData(data: unknown): ModuleData {
  if (typeof data === 'object' && data !== null) {
    return {
      id: extractString((data as any).id || (data as any).node_type, 'unknown'),
      name: extractString((data as any).name || (data as any).node_type, 'Module'),
      status: extractString((data as any).status || (data as any).state, 'Unknown'),
      value: (data as any).value ?? (data as any).weight ?? (data as any).data ?? 0,
      unit: (data as any).unit,
      metadata: (data as any).connections || (data as any).metrics || {},
    };
  }

  return {
    id: 'unknown',
    name: 'Module',
    status: 'Unknown',
    value: safeDisplay(data),
  };
}

/**
 * Formate un nombre avec unité
 */
export function formatValue(value: number, unit?: string): string {
  if (unit === '%' || unit === 'percent') {
    return `${Math.round(value)}%`;
  }
  if (unit === 'ms' || unit === 'milliseconds') {
    return `${Math.round(value)}ms`;
  }
  if (unit === 'bpm') {
    return `${Math.round(value)} BPM`;
  }
  return unit ? `${value} ${unit}` : String(value);
}

/**
 * Détermine la variante de couleur selon une valeur
 */
export function getStatusVariant(value: number, thresholds = { high: 80, low: 50 }): 'success' | 'warning' | 'error' {
  if (value >= thresholds.high) return 'success';
  if (value >= thresholds.low) return 'warning';
  return 'error';
}

/**
 * Formate un timestamp en durée relative
 */
export function formatUptime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 24) {
    const days = Math.floor(hours / 24);
    return `${days}j ${hours % 24}h`;
  }
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}
