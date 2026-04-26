import { beforeEach, describe, expect, it, vi } from 'vitest';

// ─── mocks ───────────────────────────────────────────────────────────────────

const getCategoryMock = vi.fn();
vi.mock('@/services/api/defaultKnowledgeBase', () => ({
  getCategory: (...args: unknown[]) => getCategoryMock(...args),
}));

const webSearchMock = vi.fn();
vi.mock('@/services/webResearchService', () => ({
  webSearch: (...args: unknown[]) => webSearchMock(...args),
}));

// ─── subject imports (after mocks) ───────────────────────────────────────────

import {
  createClient,
  deleteClient,
  getAllClients,
  getClient,
  incrementClientSubmissions,
  updateClient,
} from '../htfCrmService';

import {
  generateEstimation,
  searchMaterialPrices,
} from '../htfEstimationService';

import {
  resetHTFKnowledgeCache,
  getHTFKnowledgeContext,
} from '../htfKnowledgeService';

import {
  getAllLearningEntries,
  getLearningInsights,
  recordCompletedJob,
  recordEstimate,
} from '../htfLearningService';

import {
  deleteSubmission,
  exportSubmissionText,
  getAllSubmissions,
  getSubmission,
  saveSubmission,
  updateSubmissionStatus,
} from '../htfSubmissionService';

import type { HTFClient, HTFEstimation, HTFSubmission } from '../types';

// ─── localStorage mock ────────────────────────────────────────────────────────

const store: Record<string, string> = {};

beforeEach(() => {
  vi.clearAllMocks();
  resetHTFKnowledgeCache();
  Object.keys(store).forEach(k => delete store[k]);

  Object.defineProperty(globalThis, 'localStorage', {
    value: {
      getItem: (k: string) => store[k] ?? null,
      setItem: (k: string, v: string) => { store[k] = v; },
      removeItem: (k: string) => { delete store[k]; },
      clear: () => Object.keys(store).forEach(k => delete store[k]),
    },
    writable: true,
    configurable: true,
  });

  getCategoryMock.mockResolvedValue({
    content: {
      taux_horaires: { T2: { taux_h: 55 } },
      pos_format: { etapes: ['Préparation', 'Approvisionnement', 'Exécution', 'Qualité', 'Remise'] },
    },
  });

  webSearchMock.mockResolvedValue({ ok: true, content: [], error: null });
});

// ─── htfCrmService ────────────────────────────────────────────────────────────

describe('htfCrmService', () => {
  it('getAllClients returns empty array when storage is empty', () => {
    expect(getAllClients()).toEqual([]);
  });

  it('createClient persists a new client with generated id', () => {
    const client = createClient({ nom: 'Jean Tremblay' });
    expect(client.id).toMatch(/^htf-client-/);
    expect(client.nom).toBe('Jean Tremblay');
    expect(client.nbSoumissions).toBe(0);
    expect(client.dateCreation).toBeTruthy();
  });

  it('createClient appears in getAllClients', () => {
    createClient({ nom: 'Marie Gagnon' });
    expect(getAllClients()).toHaveLength(1);
  });

  it('getClient returns the client by id', () => {
    const c = createClient({ nom: 'Test' });
    expect(getClient(c.id)?.nom).toBe('Test');
  });

  it('getClient returns undefined for unknown id', () => {
    expect(getClient('unknown-id')).toBeUndefined();
  });

  it('updateClient modifies the client', () => {
    const c = createClient({ nom: 'Ancien' });
    const updated = updateClient(c.id, { nom: 'Nouveau', telephone: '418-555-0001' });
    expect(updated?.nom).toBe('Nouveau');
    expect(updated?.telephone).toBe('418-555-0001');
  });

  it('updateClient returns undefined for unknown id', () => {
    expect(updateClient('nope', { nom: 'X' })).toBeUndefined();
  });

  it('updateClient persists the change', () => {
    const c = createClient({ nom: 'Before' });
    updateClient(c.id, { nom: 'After' });
    expect(getClient(c.id)?.nom).toBe('After');
  });

  it('deleteClient removes the client', () => {
    const c = createClient({ nom: 'À supprimer' });
    expect(deleteClient(c.id)).toBe(true);
    expect(getClient(c.id)).toBeUndefined();
  });

  it('deleteClient returns false for unknown id', () => {
    expect(deleteClient('nope')).toBe(false);
  });

  it('incrementClientSubmissions increments nbSoumissions', () => {
    const c = createClient({ nom: 'Client' });
    incrementClientSubmissions(c.id);
    incrementClientSubmissions(c.id);
    expect(getClient(c.id)?.nbSoumissions).toBe(2);
  });

  it('multiple clients can coexist', () => {
    createClient({ nom: 'A' });
    createClient({ nom: 'B' });
    createClient({ nom: 'C' });
    expect(getAllClients()).toHaveLength(3);
  });
});

// ─── htfSubmissionService ─────────────────────────────────────────────────────

describe('htfSubmissionService', () => {
  function makeSubmission(overrides: Partial<HTFSubmission> = {}): HTFSubmission {
    return {
      id: `htf-${Date.now()}-${Math.random()}`,
      numero: 'S202504-001',
      dateCreation: new Date().toISOString(),
      dateValidite: new Date().toISOString(),
      descriptionProjet: 'Terrasse en dalles béton 20m²',
      items: [],
      majorations: [],
      planMiseEnOeuvre: [],
      sousTotal: 1000,
      tps: 50,
      tvq: 99.75,
      totalAvecTaxes: 1149.75,
      statut: 'brouillon',
      ...overrides,
    };
  }

  it('getAllSubmissions returns empty array initially', () => {
    expect(getAllSubmissions()).toEqual([]);
  });

  it('saveSubmission persists a new submission', () => {
    const s = makeSubmission();
    saveSubmission(s);
    expect(getAllSubmissions()).toHaveLength(1);
  });

  it('getSubmission retrieves by id', () => {
    const s = makeSubmission({ numero: 'S202504-002' });
    saveSubmission(s);
    expect(getSubmission(s.id)?.numero).toBe('S202504-002');
  });

  it('getSubmission returns undefined for unknown id', () => {
    expect(getSubmission('nope')).toBeUndefined();
  });

  it('saveSubmission updates existing submission', () => {
    const s = makeSubmission({ statut: 'brouillon' });
    saveSubmission(s);
    saveSubmission({ ...s, statut: 'envoyee' });
    expect(getAllSubmissions()).toHaveLength(1);
    expect(getSubmission(s.id)?.statut).toBe('envoyee');
  });

  it('updateSubmissionStatus changes statut', () => {
    const s = makeSubmission();
    saveSubmission(s);
    const updated = updateSubmissionStatus(s.id, 'acceptee');
    expect(updated?.statut).toBe('acceptee');
    expect(updated?.dateAcceptation).toBeTruthy();
  });

  it('updateSubmissionStatus returns nullish for unknown id', () => {
    expect(updateSubmissionStatus('nope', 'acceptee')).toBeFalsy();
  });

  it('deleteSubmission removes the submission', () => {
    const s = makeSubmission();
    saveSubmission(s);
    expect(deleteSubmission(s.id)).toBe(true);
    expect(getAllSubmissions()).toHaveLength(0);
  });

  it('deleteSubmission returns false for unknown id', () => {
    expect(deleteSubmission('nope')).toBe(false);
  });

  it('saveSubmission increments client nbSoumissions when clientId present', () => {
    const c = createClient({ nom: 'Client Test' });
    const s = makeSubmission({ clientId: c.id });
    saveSubmission(s);
    expect(getClient(c.id)?.nbSoumissions).toBe(1);
  });
});

// ─── exportSubmissionText ─────────────────────────────────────────────────────

describe('exportSubmissionText', () => {
  function makeFullSubmission(): HTFSubmission {
    return {
      id: 'htf-export-test',
      numero: 'S202504-042',
      clientNom: 'Jean Tremblay',
      dateCreation: '2026-04-26T12:00:00.000Z',
      dateValidite: '2026-05-26',
      descriptionProjet: 'Terrasse en dalles de béton — 20 m²',
      items: [
        {
          code: 'MAT-DAL',
          description: 'Dalles béton 40x40 cm',
          quantite: 125,
          unite: 'un.',
          prixUnitaire: 4.5,
          total: 562.5,
          type: 'materiau',
        },
        {
          code: 'MO-T2',
          description: 'Main-d\'œuvre T2',
          quantite: 6,
          unite: 'h',
          prixUnitaire: 55,
          total: 330,
          type: 'main_oeuvre',
          niveau: 'T2',
          heures: 6,
        },
      ],
      majorations: [],
      planMiseEnOeuvre: [],
      sousTotal: 892.5,
      tps: 44.63,
      tvq: 89.02,
      totalAvecTaxes: 1026.15,
      statut: 'brouillon',
    };
  }

  it('includes the soumission number', () => {
    const text = exportSubmissionText(makeFullSubmission());
    expect(text).toContain('S202504-042');
  });

  it('includes client name', () => {
    const text = exportSubmissionText(makeFullSubmission());
    expect(text).toContain('Jean Tremblay');
  });

  it('includes TPS and TVQ lines', () => {
    const text = exportSubmissionText(makeFullSubmission());
    expect(text).toContain('TPS');
    expect(text).toContain('TVQ');
  });

  it('includes TOTAL line', () => {
    const text = exportSubmissionText(makeFullSubmission());
    expect(text).toContain('TOTAL');
    expect(text).toContain('1026.15');
  });

  it('includes acompte 30%', () => {
    const text = exportSubmissionText(makeFullSubmission());
    expect(text).toContain('Acompte');
    expect(text).toContain((1026.15 * 0.3).toFixed(2));
  });

  it('includes company branding', () => {
    const text = exportSubmissionText(makeFullSubmission());
    expect(text).toContain("L'HUMAIN À TOUT FAIRE");
    expect(text).toContain('Kevin Thibault');
  });

  it('includes signature line', () => {
    const text = exportSubmissionText(makeFullSubmission());
    expect(text).toContain('Signature client');
  });
});

// ─── htfLearningService ───────────────────────────────────────────────────────

describe('htfLearningService', () => {
  it('getAllLearningEntries returns empty array initially', () => {
    expect(getAllLearningEntries()).toEqual([]);
  });

  it('recordEstimate persists an entry with computed facteurCorrection', () => {
    const entry = recordEstimate({
      soumissionId: 'sub-1',
      typeService: 'terrasse',
      coutEstime: 1000,
      coutReel: 1200,
      heuresEstimees: 8,
      heuresReelles: 10,
      date: new Date().toISOString(),
    });
    expect(entry.id).toMatch(/^htf-learn-/);
    expect(entry.facteurCorrection).toBeCloseTo(1.2);
  });

  it('recordEstimate facteurCorrection is 1 when coutReel is 0', () => {
    const entry = recordEstimate({
      soumissionId: 'sub-2',
      typeService: 'gazon',
      coutEstime: 500,
      coutReel: 0,
      heuresEstimees: 4,
      heuresReelles: 0,
      date: new Date().toISOString(),
    });
    expect(entry.facteurCorrection).toBe(1);
  });

  it('recordCompletedJob updates an existing entry', () => {
    recordEstimate({
      soumissionId: 'sub-3',
      typeService: 'haie',
      coutEstime: 800,
      coutReel: 0,
      heuresEstimees: 5,
      heuresReelles: 0,
      date: new Date().toISOString(),
    });
    recordCompletedJob('sub-3', 950, 6);
    const entries = getAllLearningEntries();
    const found = entries.find(e => e.soumissionId === 'sub-3');
    expect(found?.coutReel).toBe(950);
    expect(found?.heuresReelles).toBe(6);
    expect(found?.facteurCorrection).toBeCloseTo(950 / 800);
  });

  it('getLearningInsights returns facteurMoyenGlobal of 1 with no data', () => {
    const insights = getLearningInsights();
    expect(insights.facteurMoyenGlobal).toBe(1);
    expect(insights.nbrEntrees).toBe(0);
  });

  it('getLearningInsights computes correct average facteur', () => {
    recordEstimate({ soumissionId: 's1', typeService: 'terrasse', coutEstime: 1000, coutReel: 1100, heuresEstimees: 8, heuresReelles: 9, date: '' });
    recordEstimate({ soumissionId: 's2', typeService: 'terrasse', coutEstime: 500, coutReel: 600, heuresEstimees: 4, heuresReelles: 5, date: '' });
    const insights = getLearningInsights();
    expect(insights.nbrEntrees).toBe(2);
    expect(insights.facteurMoyenGlobal).toBeCloseTo((1.1 + 1.2) / 2);
  });

  it('getLearningInsights groups by typeService', () => {
    recordEstimate({ soumissionId: 's1', typeService: 'terrasse', coutEstime: 1000, coutReel: 1100, heuresEstimees: 8, heuresReelles: 9, date: '' });
    recordEstimate({ soumissionId: 's2', typeService: 'gazon', coutEstime: 500, coutReel: 400, heuresEstimees: 4, heuresReelles: 3, date: '' });
    const insights = getLearningInsights();
    expect(insights.facteurParType['terrasse']).toBeCloseTo(1.1);
    expect(insights.facteurParType['gazon']).toBeCloseTo(0.8);
  });
});

// ─── htfKnowledgeService ──────────────────────────────────────────────────────

describe('htfKnowledgeService', () => {
  it('getHTFKnowledgeContext loads all 5 sections from KB', async () => {
    const ctx = await getHTFKnowledgeContext();
    expect(ctx).toHaveProperty('identity');
    expect(ctx).toHaveProperty('formationManuel');
    expect(ctx).toHaveProperty('estimationRules');
    expect(ctx).toHaveProperty('servicesCatalogue');
    expect(ctx).toHaveProperty('soumissionTemplate');
  });

  it('getHTFKnowledgeContext caches after first call', async () => {
    await getHTFKnowledgeContext();
    await getHTFKnowledgeContext();
    expect(getCategoryMock).toHaveBeenCalledTimes(5); // 5 calls on first load only
  });

  it('resetHTFKnowledgeCache forces reload on next call', async () => {
    await getHTFKnowledgeContext();
    resetHTFKnowledgeCache();
    await getHTFKnowledgeContext();
    expect(getCategoryMock).toHaveBeenCalledTimes(10); // 5 + 5
  });

  it('handles getCategory returning null gracefully', async () => {
    getCategoryMock.mockResolvedValue(null);
    const ctx = await getHTFKnowledgeContext();
    expect(ctx.identity).toEqual({});
    expect(ctx.estimationRules).toEqual({});
  });
});

// ─── htfEstimationService ─────────────────────────────────────────────────────

describe('htfEstimationService', () => {
  it('searchMaterialPrices returns empty string when webSearch returns no content', async () => {
    webSearchMock.mockResolvedValue({ ok: true, content: null, error: null });
    const result = await searchMaterialPrices('dalle béton');
    expect(result).toBe('');
  });

  it('searchMaterialPrices returns formatted string from search results', async () => {
    webSearchMock.mockResolvedValue({
      ok: true,
      content: [
        { title: 'RONA Saguenay', url: 'https://rona.ca', snippet: 'Dalle 40x40 : 4.99$' },
        { title: 'Home Depot', url: 'https://homedepot.ca', snippet: 'Dalle béton : 5.50$' },
      ],
      error: null,
    });
    const result = await searchMaterialPrices('dalle béton');
    expect(result).toContain('RONA Saguenay');
    expect(result).toContain('4.99$');
  });

  it('searchMaterialPrices returns empty string when webSearch throws', async () => {
    webSearchMock.mockRejectedValue(new Error('Network error'));
    const result = await searchMaterialPrices('gazon');
    expect(result).toBe('');
  });

  it('generateEstimation returns a complete estimation with correct structure', async () => {
    const estimation = await generateEstimation({
      descriptionProjet: 'Terrasse dalles béton 20m²',
      surfaceM2: 20,
      clientNom: 'Jean Tremblay',
    });

    expect(estimation.id).toMatch(/^htf-/);
    expect(estimation.numero).toMatch(/^S\d{6}-\d{3}$/);
    expect(estimation.descriptionProjet).toBe('Terrasse dalles béton 20m²');
    expect(estimation.statut).toBe('brouillon');
    expect(estimation.items.length).toBeGreaterThan(0);
    expect(estimation.sousTotal).toBeGreaterThan(0);
    expect(estimation.tps).toBeGreaterThan(0);
    expect(estimation.tvq).toBeGreaterThan(0);
    expect(estimation.totalAvecTaxes).toBeGreaterThan(0);
  });

  it('generateEstimation applies TPS 5% and TVQ 9.975% correctly', async () => {
    const estimation = await generateEstimation({
      descriptionProjet: 'Test',
      surfaceM2: 10,
    });
    expect(estimation.tps / estimation.sousTotal).toBeCloseTo(0.05, 3);
    expect(estimation.tvq / estimation.sousTotal).toBeCloseTo(0.09975, 3);
    expect(estimation.totalAvecTaxes).toBeCloseTo(estimation.sousTotal + estimation.tps + estimation.tvq, 2);
  });

  it('generateEstimation sets dateValidite to ~30 days ahead', async () => {
    const before = new Date();
    const estimation = await generateEstimation({ descriptionProjet: 'Test', surfaceM2: 5 });
    const validite = new Date(estimation.dateValidite);
    const diffDays = Math.round((validite.getTime() - before.getTime()) / 86400000);
    expect(diffDays).toBeGreaterThanOrEqual(29);
    expect(diffDays).toBeLessThanOrEqual(31);
  });

  it('generateEstimation applies majorations multiplicateur', async () => {
    const base = await generateEstimation({ descriptionProjet: 'Base', surfaceM2: 10 });
    const withMaj = await generateEstimation({
      descriptionProjet: 'Urgent',
      surfaceM2: 10,
      majorations: [{ type: 'urgence_24h', multiplicateur: 1.5, description: 'Urgence 24h' }],
    });
    expect(withMaj.sousTotal).toBeCloseTo(base.sousTotal * 1.5, 0);
  });

  it('generateEstimation accepts pre-built items', async () => {
    const item = {
      code: 'MAT-TEST',
      description: 'Test matériau',
      quantite: 10,
      unite: 'un.',
      prixUnitaire: 20,
      total: 200,
      type: 'materiau' as const,
    };
    const estimation = await generateEstimation({
      descriptionProjet: 'Test avec items',
      items: [item],
    });
    expect(estimation.sousTotal).toBeCloseTo(200, 1);
    expect(estimation.items[0]?.code).toBe('MAT-TEST');
  });

  it('generateEstimation has implementation plan with correct step count', async () => {
    const estimation = await generateEstimation({ descriptionProjet: 'Gazon', surfaceM2: 50 });
    expect(estimation.planMiseEnOeuvre.length).toBe(5);
    estimation.planMiseEnOeuvre.forEach((step, i) => {
      expect(step.ordre).toBe(i + 1);
      expect(step.titre).toBeTruthy();
    });
  });
});
