/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v15 — DATA MAPPER & SANITIZER
 *   Conversion Backend Rust → Frontend React (Safe Rendering)
 * ═══════════════════════════════════════════════════════════════════
 */

/**
 * Convertit n'importe quelle valeur en type React-safe
 */
export function safeValue(value: unknown): string | number {
  if (value === null || value === undefined) return "N/A";

  if (typeof value === "string" || typeof value === "number") {
    return value;
  }

  // Si c'est un objet avec une propriété 'value', l'extraire
  if (typeof value === "object" && 'value' in value) {
    return safeValue((value as Record<string, unknown>).value);
  }

  // Si c'est un tableau, compter les éléments
  if (Array.isArray(value)) {
    return `${value.length} items`;
  }

  // Dernier recours : JSON stringification
  try {
    const str = JSON.stringify(value);
    // Si c'est un objet simple avec peu de propriétés, l'afficher
    if (str.length < 100) return str;
    return "Complex object";
  } catch {
    return "Invalid data format";
  }
}

/**
 * Mappe les données brutes d'un module vers une structure UI sûre
 */
export function mapModuleData(raw: unknown) {
  if (!raw || typeof raw !== 'object') return {
    name: "Unknown Module",
    status: "Unknown",
    info: "No data available",
    uptime: 0,
    last_tick: 0,
    message: "Module non disponible",
    raw: null
  };

  const data = raw as Record<string, unknown>;
  return {
    name: safeValue(data.name || data.module_name || "Unknown"),
    status: safeValue(data.status || data.state || "Unknown"),
    uptime: safeValue(data.uptime || data.runtime || 0),
    last_tick: safeValue(data.last_tick || data.tick || 0),
    message: safeValue(data.message || data.info || "No message"),
    raw // Garder l'objet original pour debug
  };
}

/**
 * Mappe spécifiquement les données Helios (métriques système)
 */
export function mapHeliosData(raw: unknown) {
  if (!raw || typeof raw !== 'object') return {
    bpm: 0,
    vitality: 0,
    load: 0,
    status: "Unknown",
    raw: null
  };

  const data = raw as Record<string, unknown>;
  return {
    bpm: typeof data.bpm === 'number' ? data.bpm : parseInt(safeValue(data.bpm) as string) || 0,
    vitality: typeof data.vitality === 'number' ? data.vitality : parseInt(safeValue(data.vitality) as string) || 0,
    load: typeof data.load === 'number' ? data.load : parseFloat(safeValue(data.load) as string) || 0,
    status: safeValue(data.status || "Stable"),
    raw
  };
}

/**
 * Mappe les données Nexus (réseau neuronal)
 */
export function mapNexusData(raw: unknown) {
  if (!raw || typeof raw !== 'object') return {
    nodes: 0,
    connections: 0,
    density: 0,
    status: "Unknown",
    raw: null
  };

  const data = raw as Record<string, unknown>;
  return {
    nodes: typeof data.nodes === 'number' ? data.nodes : (Array.isArray(data.nodes) ? data.nodes.length : 0),
    connections: typeof data.connections === 'number' ? data.connections : (Array.isArray(data.connections) ? data.connections.length : 0),
    density: typeof data.density === 'number' ? data.density : parseFloat(safeValue(data.network_density || data.density) as string) || 0,
    status: safeValue(data.status || "Active"),
    raw
  };
}

/**
 * Mappe les données SelfHeal (auto-réparation)
 */
export function mapSelfHealData(raw: unknown) {
  if (!raw || typeof raw !== 'object') return {
    repairs: 0,
    success_rate: 0,
    status: "Unknown",
    raw: null
  };

  const data = raw as Record<string, unknown>;
  return {
    repairs: typeof data.repairs === 'number' ? data.repairs : parseInt(safeValue(data.repairs || data.total_repairs) as string) || 0,
    success_rate: typeof data.success_rate === 'number' ? data.success_rate : parseFloat(safeValue(data.success_rate) as string) || 0,
    status: safeValue(data.status || "Idle"),
    raw
  };
}

/**
 * Mappe les données AdaptiveEngine (optimisation)
 */
export function mapAdaptiveData(raw: unknown) {
  if (!raw || typeof raw !== 'object') return {
    adjustments: 0,
    efficiency: 0,
    status: "Unknown",
    raw: null
  };

  const data = raw as Record<string, unknown>;
  return {
    adjustments: typeof data.adjustments === 'number' ? data.adjustments : parseInt(safeValue(data.adjustments || data.total_adjustments) as string) || 0,
    efficiency: typeof data.efficiency === 'number' ? data.efficiency : parseFloat(safeValue(data.efficiency) as string) || 0,
    status: safeValue(data.status || "Running"),
    raw
  };
}

/**
 * Mappe les données Watchdog (surveillance)
 */
export function mapWatchdogData(raw: unknown) {
  if (!raw || typeof raw !== 'object') return {
    tick_misses: 0,
    anomalies: 0,
    status: "Unknown",
    raw: null
  };

  const data = raw as Record<string, unknown>;
  return {
    tick_misses: typeof data.tick_misses === 'number' ? data.tick_misses : parseInt(safeValue(data.tick_misses) as string) || 0,
    anomalies: typeof data.anomalies === 'number' ? data.anomalies : (Array.isArray(data.anomalies) ? data.anomalies.length : 0),
    status: safeValue(data.status || "Monitoring"),
    raw
  };
}

/**
 * Mappe les données Harmonia (équilibre)
 */
export function mapHarmoniaData(raw: unknown) {
  if (!raw || typeof raw !== 'object') return {
    active_flows: 0,
    balance_score: 0,
    status: "Unknown",
    raw: null
  };

  const data = raw as Record<string, unknown>;
  return {
    active_flows: typeof data.active_flows === 'number' ? data.active_flows : parseInt(safeValue(data.active_flows || data.flows) as string) || 0,
    balance_score: typeof data.balance_score === 'number' ? data.balance_score : parseFloat(safeValue(data.balance_score || data.balance) as string) || 0,
    status: safeValue(data.status || "Balanced"),
    raw
  };
}

/**
 * Mappe les données Sentinel (sécurité)
 */
export function mapSentinelData(raw: unknown) {
  if (!raw || typeof raw !== 'object') return {
    integrity_score: 0,
    alerts: 0,
    status: "Unknown",
    raw: null
  };

  const data = raw as Record<string, unknown>;
  return {
    integrity_score: typeof data.integrity_score === 'number' ? data.integrity_score : parseFloat(safeValue(data.integrity_score || data.integrity) as string) || 0,
    alerts: typeof data.alerts === 'number' ? data.alerts : (Array.isArray(data.alerts) ? data.alerts.length : 0),
    status: safeValue(data.status || "Guarding"),
    raw
  };
}

/**
 * Mappe les données système globales
 */
export function mapSystemData(raw: unknown) {
  if (!raw || typeof raw !== 'object') return {
    helios: null,
    nexus: null,
    selfheal: null,
    adaptive_engine: null,
    watchdog: null,
    harmonia: null,
    sentinel: null,
    status: "Unknown"
  };

  const data = raw as Record<string, unknown>;
  return {
    helios: data.helios ? mapHeliosData(data.helios) : null,
    nexus: data.nexus ? mapNexusData(data.nexus) : null,
    selfheal: data.selfheal || data.self_heal ? mapSelfHealData(data.selfheal || data.self_heal) : null,
    adaptive_engine: data.adaptive_engine || data.adaptiveEngine ? mapAdaptiveData(data.adaptive_engine || data.adaptiveEngine) : null,
    watchdog: data.watchdog ? mapWatchdogData(data.watchdog) : null,
    harmonia: data.harmonia ? mapHarmoniaData(data.harmonia) : null,
    sentinel: data.sentinel ? mapSentinelData(data.sentinel) : null,
    status: safeValue(data.status || data.global_status || "Running")
  };
}
