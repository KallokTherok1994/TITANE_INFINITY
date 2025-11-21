/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v15.7 — DATA MAPPER & SANITIZER
 *   Conversion Backend Rust → Frontend React (Safe Rendering)
 * ═══════════════════════════════════════════════════════════════════
 */

/**
 * Convertit n'importe quelle valeur en type React-safe
 */
export function safeValue(value: any): string | number {
  if (value === null || value === undefined) return "N/A";

  if (typeof value === "string" || typeof value === "number") {
    return value;
  }

  // Si c'est un objet avec une propriété 'value', l'extraire
  if (typeof value === "object" && value.value !== undefined) {
    return safeValue(value.value);
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
export function mapModuleData(raw: any) {
  if (!raw) return { 
    name: "Unknown Module",
    status: "Unknown", 
    info: "No data available",
    uptime: 0,
    last_tick: 0,
    message: "Module non disponible",
    raw: null
  };

  return {
    name: safeValue(raw.name || raw.module_name || "Unknown"),
    status: safeValue(raw.status || raw.state || "Unknown"),
    uptime: safeValue(raw.uptime || raw.runtime || 0),
    last_tick: safeValue(raw.last_tick || raw.tick || 0),
    message: safeValue(raw.message || raw.info || "No message"),
    raw // Garder l'objet original pour debug
  };
}

/**
 * Mappe spécifiquement les données Helios (métriques système)
 */
export function mapHeliosData(raw: any) {
  if (!raw) return {
    bpm: 0,
    vitality: 0,
    load: 0,
    status: "Unknown",
    raw: null
  };

  return {
    bpm: typeof raw.bpm === 'number' ? raw.bpm : parseInt(safeValue(raw.bpm) as string) || 0,
    vitality: typeof raw.vitality === 'number' ? raw.vitality : parseInt(safeValue(raw.vitality) as string) || 0,
    load: typeof raw.load === 'number' ? raw.load : parseFloat(safeValue(raw.load) as string) || 0,
    status: safeValue(raw.status || "Stable"),
    raw
  };
}

/**
 * Mappe les données Nexus (réseau neuronal)
 */
export function mapNexusData(raw: any) {
  if (!raw) return {
    nodes: 0,
    connections: 0,
    density: 0,
    status: "Unknown",
    raw: null
  };

  return {
    nodes: typeof raw.nodes === 'number' ? raw.nodes : (Array.isArray(raw.nodes) ? raw.nodes.length : 0),
    connections: typeof raw.connections === 'number' ? raw.connections : (Array.isArray(raw.connections) ? raw.connections.length : 0),
    density: typeof raw.density === 'number' ? raw.density : parseFloat(safeValue(raw.network_density || raw.density) as string) || 0,
    status: safeValue(raw.status || "Active"),
    raw
  };
}

/**
 * Mappe les données SelfHeal (auto-réparation)
 */
export function mapSelfHealData(raw: any) {
  if (!raw) return {
    repairs: 0,
    success_rate: 0,
    status: "Unknown",
    raw: null
  };

  return {
    repairs: typeof raw.repairs === 'number' ? raw.repairs : parseInt(safeValue(raw.repairs || raw.total_repairs) as string) || 0,
    success_rate: typeof raw.success_rate === 'number' ? raw.success_rate : parseFloat(safeValue(raw.success_rate) as string) || 0,
    status: safeValue(raw.status || "Idle"),
    raw
  };
}

/**
 * Mappe les données AdaptiveEngine (optimisation)
 */
export function mapAdaptiveData(raw: any) {
  if (!raw) return {
    adjustments: 0,
    efficiency: 0,
    status: "Unknown",
    raw: null
  };

  return {
    adjustments: typeof raw.adjustments === 'number' ? raw.adjustments : parseInt(safeValue(raw.adjustments || raw.total_adjustments) as string) || 0,
    efficiency: typeof raw.efficiency === 'number' ? raw.efficiency : parseFloat(safeValue(raw.efficiency) as string) || 0,
    status: safeValue(raw.status || "Running"),
    raw
  };
}

/**
 * Mappe les données Watchdog (surveillance)
 */
export function mapWatchdogData(raw: any) {
  if (!raw) return {
    tick_misses: 0,
    anomalies: 0,
    status: "Unknown",
    raw: null
  };

  return {
    tick_misses: typeof raw.tick_misses === 'number' ? raw.tick_misses : parseInt(safeValue(raw.tick_misses) as string) || 0,
    anomalies: typeof raw.anomalies === 'number' ? raw.anomalies : (Array.isArray(raw.anomalies) ? raw.anomalies.length : 0),
    status: safeValue(raw.status || "Monitoring"),
    raw
  };
}

/**
 * Mappe les données Harmonia (équilibre)
 */
export function mapHarmoniaData(raw: any) {
  if (!raw) return {
    active_flows: 0,
    balance_score: 0,
    status: "Unknown",
    raw: null
  };

  return {
    active_flows: typeof raw.active_flows === 'number' ? raw.active_flows : parseInt(safeValue(raw.active_flows || raw.flows) as string) || 0,
    balance_score: typeof raw.balance_score === 'number' ? raw.balance_score : parseFloat(safeValue(raw.balance_score || raw.balance) as string) || 0,
    status: safeValue(raw.status || "Balanced"),
    raw
  };
}

/**
 * Mappe les données Sentinel (sécurité)
 */
export function mapSentinelData(raw: any) {
  if (!raw) return {
    integrity_score: 0,
    alerts: 0,
    status: "Unknown",
    raw: null
  };

  return {
    integrity_score: typeof raw.integrity_score === 'number' ? raw.integrity_score : parseFloat(safeValue(raw.integrity_score || raw.integrity) as string) || 0,
    alerts: typeof raw.alerts === 'number' ? raw.alerts : (Array.isArray(raw.alerts) ? raw.alerts.length : 0),
    status: safeValue(raw.status || "Guarding"),
    raw
  };
}

/**
 * Mappe les données système globales
 */
export function mapSystemData(raw: any) {
  if (!raw) return {
    helios: null,
    nexus: null,
    selfheal: null,
    adaptive_engine: null,
    watchdog: null,
    harmonia: null,
    sentinel: null,
    status: "Unknown"
  };

  return {
    helios: raw.helios ? mapHeliosData(raw.helios) : null,
    nexus: raw.nexus ? mapNexusData(raw.nexus) : null,
    selfheal: raw.selfheal || raw.self_heal ? mapSelfHealData(raw.selfheal || raw.self_heal) : null,
    adaptive_engine: raw.adaptive_engine || raw.adaptiveEngine ? mapAdaptiveData(raw.adaptive_engine || raw.adaptiveEngine) : null,
    watchdog: raw.watchdog ? mapWatchdogData(raw.watchdog) : null,
    harmonia: raw.harmonia ? mapHarmoniaData(raw.harmonia) : null,
    sentinel: raw.sentinel ? mapSentinelData(raw.sentinel) : null,
    status: safeValue(raw.status || raw.global_status || "Running")
  };
}
