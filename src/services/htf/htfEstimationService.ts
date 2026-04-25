// HTF Module — L'Humain à tout faire
// Service d'estimation intelligent : calculs, recherche prix, plan de mise en œuvre

import { getHTFKnowledgeContext } from './htfKnowledgeService';
import { webSearch } from '../webResearchService';
import type { HTFEstimation, HTFEstimationItem, HTFImplementationStep, HTFMajoration } from './types';

const TPS = 0.05;
const TVQ = 0.09975;

function generateSoumissionNumber(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const seq = String(Math.floor(Math.random() * 900) + 100);
  return `S${y}${m}-${seq}`;
}

function dateValidite(): string {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return d.toISOString().slice(0, 10);
}

/** Recherche le prix d'un matériau en ligne (Saguenay 2025) */
export async function searchMaterialPrices(materiau: string): Promise<string> {
  try {
    const result = await webSearch(`${materiau} prix Saguenay 2025`);
    if (result.content && result.content.length > 0) {
      return result.content.slice(0, 2).map((r) => `${r.title}: ${r.snippet}`).join(' | ');
    }
  } catch {
    // Silencieux — prix catalogue utilisés par défaut
  }
  return '';
}

/** Génère un plan de mise en œuvre à partir du contexte KB */
export async function generateImplementationPlan(
  descriptionProjet: string,
  items: HTFEstimationItem[]
): Promise<HTFImplementationStep[]> {
  const ctx = await getHTFKnowledgeContext();
  const formation = ctx.formationManuel as Record<string, unknown>;
  const pos = (formation['pos_format'] as Record<string, unknown>) ?? {};
  const etapesPos = (pos['etapes'] as string[]) ?? [
    'Préparation et sécurisation du chantier',
    'Approvisionnement et livraison des matériaux',
    'Exécution des travaux',
    'Contrôle qualité et nettoyage',
    'Validation client et remise du chantier',
  ];

  const heuresTotal = items
    .filter(i => i.type === 'main_oeuvre')
    .reduce((acc, i) => acc + (i.heures ?? 0), 0);

  return etapesPos.map((etape, idx) => {
    const step: HTFImplementationStep = {
      ordre: idx + 1,
      titre: typeof etape === 'string' ? etape : `Étape ${idx + 1}`,
      description: typeof etape === 'string' ? etape : descriptionProjet,
      dureeEstimeeH: idx === 2 ? Math.max(heuresTotal * 0.6, 1) : 0.5,
      niveau: idx < 2 ? 'T2' : idx === 2 ? 'T3' : 'T2',
    };
    return step;
  });
}

export interface GenerateEstimationParams {
  descriptionProjet: string;
  clientId?: string;
  clientNom?: string;
  surfaceM2?: number;
  typeService?: string;
  majorations?: HTFMajoration[];
  items?: HTFEstimationItem[];
}

/** Génère une estimation HTF complète */
export async function generateEstimation(
  params: GenerateEstimationParams
): Promise<HTFEstimation> {
  const ctx = await getHTFKnowledgeContext();
  const rules = ctx.estimationRules as Record<string, unknown>;
  const tauxHoraires = (rules['taux_horaires'] as Record<string, { taux_h: number }>) ?? {};
  const tauxT2 = tauxHoraires['T2']?.taux_h ?? 55;

  const items: HTFEstimationItem[] = params.items ?? [];

  // Main-d'œuvre de base si aucun item fourni
  if (items.length === 0 && params.surfaceM2 && params.surfaceM2 > 0) {
    const heuresEstimees = Math.ceil(params.surfaceM2 * 0.15);
    items.push({
      code: 'MO-T2',
      description: 'Main-d\'œuvre technicien T2',
      quantite: heuresEstimees,
      unite: 'h',
      prixUnitaire: tauxT2,
      total: heuresEstimees * tauxT2,
      type: 'main_oeuvre',
      niveau: 'T2',
      heures: heuresEstimees,
    });
  }

  const majorations = params.majorations ?? [];
  const multiplicateur = majorations.reduce((acc, m) => acc * m.multiplicateur, 1);

  const sousTotal = items.reduce((acc, i) => acc + i.total, 0) * multiplicateur;
  const tps = sousTotal * TPS;
  const tvq = sousTotal * TVQ;
  const totalAvecTaxes = sousTotal + tps + tvq;

  const planMiseEnOeuvre = await generateImplementationPlan(params.descriptionProjet, items);

  const now = new Date().toISOString();
  return {
    id: `htf-${Date.now()}`,
    numero: generateSoumissionNumber(),
    clientId: params.clientId,
    clientNom: params.clientNom,
    dateCreation: now,
    dateValidite: dateValidite(),
    descriptionProjet: params.descriptionProjet,
    surfaceM2: params.surfaceM2,
    items,
    majorations,
    planMiseEnOeuvre,
    sousTotal,
    tps,
    tvq,
    totalAvecTaxes,
    statut: 'brouillon',
  };
}
