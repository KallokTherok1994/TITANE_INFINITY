/**
 * TITANE∞ Skill OS — Skill Registry (Layer 5)
 * In-memory registry with localStorage persistence.
 */

import type {
  TitaneSkillPackage,
  SkillRegistryEntry,
  SkillLifecycleState,
} from '../types';

const STORAGE_KEY = 'titane_skill_registry';

/** In-memory registry */
let registry: Map<string, TitaneSkillPackage> = new Map();

/** Load registry from localStorage */
function loadFromStorage(): void {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const entries: TitaneSkillPackage[] = JSON.parse(stored);
      registry = new Map(entries.map(pkg => [pkg.manifest.id, pkg]));
    }
  } catch {
    // Corrupted storage — start fresh
    registry = new Map();
  }
}

/** Save registry to localStorage */
function saveToStorage(): void {
  try {
    const entries = Array.from(registry.values());
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // Storage full or unavailable — silent fail
  }
}

/** Initialize on first access */
let initialized = false;
function ensureInitialized(): void {
  if (!initialized) {
    loadFromStorage();
    initialized = true;
  }
}

/** Get all installed skills */
export function getSkillRegistry(): SkillRegistryEntry[] {
  ensureInitialized();
  return Array.from(registry.values()).map(pkgToEntry);
}

/** Get a skill by ID */
export function getSkillById(id: string): TitaneSkillPackage | undefined {
  ensureInitialized();
  return registry.get(id);
}

/** Install a skill into the registry */
export function installSkill(pkg: TitaneSkillPackage): boolean {
  ensureInitialized();
  if (registry.has(pkg.manifest.id)) {
    return false; // Already installed
  }
  registry.set(pkg.manifest.id, pkg);
  saveToStorage();
  return true;
}

/** Uninstall a skill from the registry */
export function uninstallSkill(id: string): boolean {
  ensureInitialized();
  if (!registry.has(id)) return false;
  registry.delete(id);
  saveToStorage();
  return true;
}

/** Update a skill's lifecycle state */
export function updateSkillState(id: string, state: SkillLifecycleState): boolean {
  ensureInitialized();
  const pkg = registry.get(id);
  if (!pkg) return false;
  pkg.manifest.state = state;
  registry.set(id, pkg);
  saveToStorage();
  return true;
}

/** Check if a skill is installed */
export function isSkillInstalled(id: string): boolean {
  ensureInitialized();
  return registry.has(id);
}

/** Get all active skills */
export function getActiveSkills(): TitaneSkillPackage[] {
  ensureInitialized();
  return Array.from(registry.values()).filter(pkg => pkg.manifest.state === 'ACTIVE');
}

/** Convert package to registry entry */
function pkgToEntry(pkg: TitaneSkillPackage): SkillRegistryEntry {
  return {
    id: pkg.manifest.id,
    name: pkg.manifest.name,
    version: pkg.manifest.version,
    state: pkg.manifest.state,
    installSource: pkg.manifest.source.type,
    installTimestamp: pkg.manifest.installTimestamp,
    lastActivation: null,
    lastFailure: pkg.manifest.state === 'FAILED' ? pkg.manifest.installTimestamp : null,
    healthStatus:
      pkg.manifest.state === 'FAILED'
        ? 'failed'
        : pkg.manifest.state === 'DEGRADED'
          ? 'degraded'
          : 'healthy',
    knowledgeIndexStatus: pkg.knowledge.assets.length > 0 ? 'pending' : 'none',
    dependencies: [],
    rollbackAvailable: true,
  };
}
