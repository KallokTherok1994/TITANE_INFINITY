// Tests unitaires — HTF Estimation Service
// L'Humain à tout faire — Kevin Thibault

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateEstimation } from '../../../src/services/htf/htfEstimationService';

// Mock knowledge service pour tests déterministes
vi.mock('../../../src/services/htf/htfKnowledgeService', () => ({
  getHTFKnowledgeContext: async () => ({
    identity: {},
    formationManuel: {
      pos_format: {
        etapes: [
          'Préparation et sécurisation',
          'Approvisionnement matériaux',
          'Exécution',
          'Contrôle qualité',
          'Validation client',
        ],
      },
    },
    estimationRules: {
      taux_horaires: {
        T1: { taux_h: 35 },
        T2: { taux_h: 55 },
        T3: { taux_h: 75 },
      },
    },
    servicesCatalogue: {},
    soumissionTemplate: {},
  }),
}));

vi.mock('../../../src/services/webResearchService', () => ({
  webSearch: async () => ({ results: [] }),
}));

describe('HTFEstimationService', () => {
  describe('generateEstimation', () => {
    it('génère une estimation avec numéro de soumission', async () => {
      const est = await generateEstimation({
        descriptionProjet: 'Pose terrasse dalles béton 24m²',
        surfaceM2: 24,
      });

      expect(est.numero).toMatch(/^S\d{6}-\d{3}$/);
      expect(est.id).toBeTruthy();
      expect(est.statut).toBe('brouillon');
    });

    it('calcule correctement les taxes TPS + TVQ', async () => {
      const est = await generateEstimation({
        descriptionProjet: 'Test calcul taxes',
        surfaceM2: 10,
      });

      const expectedTps = est.sousTotal * 0.05;
      const expectedTvq = est.sousTotal * 0.09975;
      expect(est.tps).toBeCloseTo(expectedTps, 2);
      expect(est.tvq).toBeCloseTo(expectedTvq, 2);
      expect(est.totalAvecTaxes).toBeCloseTo(
        est.sousTotal + expectedTps + expectedTvq,
        2
      );
    });

    it('applique la majoration urgence 24h correctement', async () => {
      const normal = await generateEstimation({
        descriptionProjet: 'Nettoyage standard',
        surfaceM2: 20,
      });
      const urgent = await generateEstimation({
        descriptionProjet: 'Nettoyage urgent',
        surfaceM2: 20,
        majorations: [
          { type: 'urgence_24h', multiplicateur: 1.35, description: 'Urgence' },
        ],
      });

      expect(urgent.sousTotal).toBeCloseTo(normal.sousTotal * 1.35, 1);
    });

    it('inclut un plan de mise en oeuvre', async () => {
      const est = await generateEstimation({
        descriptionProjet: 'Pose dalles',
        surfaceM2: 15,
      });

      expect(est.planMiseEnOeuvre.length).toBeGreaterThan(0);
      expect(est.planMiseEnOeuvre[0]).toHaveProperty('ordre', 1);
      expect(est.planMiseEnOeuvre[0]).toHaveProperty('titre');
    });

    it('génère une dateValidite à 30 jours', async () => {
      const est = await generateEstimation({
        descriptionProjet: 'Test date',
        surfaceM2: 5,
      });
      const created = new Date(est.dateCreation);
      const valid = new Date(est.dateValidite);
      const diffJours = Math.round(
        (valid.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)
      );
      // Tolérance ±1 jour pour les variations de fuseau horaire UTC
      expect(diffJours).toBeGreaterThanOrEqual(29);
      expect(diffJours).toBeLessThanOrEqual(31);
    });

    it('accepte les items personnalisés', async () => {
      const items = [
        {
          code: 'HTF-DAL-001',
          description: 'Dalle béton 60x60',
          quantite: 67,
          unite: 'unité',
          prixUnitaire: 11.75,
          total: 67 * 11.75,
          type: 'materiau' as const,
        },
      ];
      const est = await generateEstimation({
        descriptionProjet: 'Terrasse dalles personnalisé',
        items,
      });

      expect(est.items).toHaveLength(1);
      expect(est.items[0].code).toBe('HTF-DAL-001');
    });
  });
});
