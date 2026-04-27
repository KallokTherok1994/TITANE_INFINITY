// HTF Module — L'Humain à tout faire
// Service de chargement du contexte de connaissance HTF depuis la KB Tauri

import { getCategory } from '../api/defaultKnowledgeBase';
import type { HTFKnowledgeContext } from './types';

let _cachedContext: HTFKnowledgeContext | null = null;

export async function getHTFKnowledgeContext(): Promise<HTFKnowledgeContext> {
  if (_cachedContext) return _cachedContext;

  const [identity, formation, estimation, catalogue, template] = await Promise.all([
    getCategory('htf_module_identity').catch(() => null),
    getCategory('htf_formation_manuel').catch(() => null),
    getCategory('htf_estimation_rules').catch(() => null),
    getCategory('htf_services_catalogue').catch(() => null),
    getCategory('htf_soumission_template').catch(() => null),
  ]);

  _cachedContext = {
    identity: (identity?.content ?? {}) as Record<string, unknown>,
    formationManuel: (formation?.content ?? {}) as Record<string, unknown>,
    estimationRules: (estimation?.content ?? {}) as Record<string, unknown>,
    servicesCatalogue: (catalogue?.content ?? {}) as Record<string, unknown>,
    soumissionTemplate: (template?.content ?? {}) as Record<string, unknown>,
  };

  return _cachedContext;
}

/** Retourne la POS (Procédure Opératoire Standard) d'un code de service */
export async function getRelevantPOS(
  codeService: string
): Promise<Record<string, unknown> | null> {
  const ctx = await getHTFKnowledgeContext();
  const catalogue = ctx.servicesCatalogue as Record<string, Record<string, unknown>>;
  for (const section of Object.values(catalogue)) {
    if (typeof section === 'object' && section !== null && codeService in section) {
      return section[codeService] as Record<string, unknown>;
    }
  }
  return null;
}

/** Retourne les règles d'estimation */
export async function getEstimationRules(): Promise<Record<string, unknown>> {
  const ctx = await getHTFKnowledgeContext();
  return ctx.estimationRules;
}

/** Retourne un service par son code HTF */
export async function getServiceByCode(
  code: string
): Promise<Record<string, unknown> | null> {
  return getRelevantPOS(code);
}

/** Vide le cache (utile pour les tests) */
export function resetHTFKnowledgeCache(): void {
  _cachedContext = null;
}
