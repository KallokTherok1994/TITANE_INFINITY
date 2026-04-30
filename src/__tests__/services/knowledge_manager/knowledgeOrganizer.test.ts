/**
 * Tests — KnowledgeOrganizer (Rule 16)
 * Scope: clusterByTheme, detectKnowledgeGaps, getKBStats
 */
import { describe, it, expect } from 'vitest';
import {
  clusterByTheme,
  detectKnowledgeGaps,
  getKBStats,
  type KBEntry,
} from '@/services/knowledge_manager/knowledgeOrganizer';

const makeEntry = (category: string, description = '', triggers: string[] = []): KBEntry => ({
  category,
  description,
  retrieval_triggers: triggers,
});

describe('clusterByTheme', () => {
  it('classifie pharmacologie en medicine_clinique', () => {
    const entries = [makeEntry('pharmacologie_clinique_avancee', 'pharmacocinétique ADME')];
    const clusters = clusterByTheme(entries);
    expect(clusters.medicine_clinique.length).toBe(1);
    expect(clusters.medicine_clinique[0].category).toBe('pharmacologie_clinique_avancee');
  });

  it('classifie gastroenterologie en medicine_clinique', () => {
    const entries = [makeEntry('gastroenterologie_hepatologie', 'tube digestif et motricité')];
    const clusters = clusterByTheme(entries);
    expect(clusters.medicine_clinique.length).toBe(1);
  });

  it('classifie psychologie_cognitive en psychologie_bien_etre', () => {
    const entries = [makeEntry('psychologie_cognitive', 'biais cognitifs et comportement')];
    const clusters = clusterByTheme(entries);
    expect(clusters.psychologie_bien_etre.length).toBe(1);
  });

  it('route les entrées non reconnues vers autre', () => {
    const entries = [makeEntry('unknown_category_xyz')];
    const clusters = clusterByTheme(entries);
    expect(clusters.autre.length).toBe(1);
  });

  it('retourne tous les thèmes même vides', () => {
    const clusters = clusterByTheme([]);
    expect(Object.keys(clusters).length).toBeGreaterThan(5);
    Object.values(clusters).forEach(arr => expect(Array.isArray(arr)).toBe(true));
  });

  it('gère plusieurs entrées avec clusters distincts', () => {
    const entries = [
      makeEntry('nutrition_avancee', 'métabolisme et vitamines'),
      makeEntry('neurosciences_cliniques', 'plasticité synaptique'),
      makeEntry('cardio_avance', 'cardio système cardiovasculaire'),
    ];
    const clusters = clusterByTheme(entries);
    const total = Object.values(clusters).reduce((s, arr) => s + arr.length, 0);
    expect(total).toBe(3);
  });
});

describe('detectKnowledgeGaps', () => {
  it('retourne un tableau', () => {
    const entries = [makeEntry('pharmacologie_clinique_avancee')];
    const gaps = detectKnowledgeGaps(entries);
    expect(Array.isArray(gaps)).toBe(true);
  });

  it('retourne zéro gaps pour une liste couvrant tous les domaines idéaux', () => {
    // Les catégories doivent contenir exactement les clés de IDEAL_DOMAINS (via includes)
    const entries = [
      makeEntry('medicine_clinique_avancee'),
      makeEntry('pharmacologie_clinique_avancee'),
      makeEntry('gastroenterologie_hepatologie'),
      makeEntry('systeme_cardiovasculaire_avance'),
      makeEntry('immunologie_auto_immunite'),
      makeEntry('neurosciences_cliniques_avancees'),
      makeEntry('psychologie_bien_etre_pratique'),
      makeEntry('nutrition_sante_naturelle'),
      makeEntry('technologie_innovation_ia'),
      makeEntry('spiritualite_philosophie_pratique'),
      makeEntry('competences_professionnelles_avancees'),
      makeEntry('relations_sociales_humaines'),
      makeEntry('urgences_securite_medicales'),
    ];
    const gaps = detectKnowledgeGaps(entries);
    expect(gaps.length).toBe(0);
  });

  it('signale les thèmes absents', () => {
    const entries = [makeEntry('pharmacologie_clinique_avancee', 'pharmacologie clinique')];
    const gaps = detectKnowledgeGaps(entries);
    expect(gaps.length).toBeGreaterThan(0);
  });
});

describe('getKBStats', () => {
  it('retourne le bon nombre de catégories et entrées', () => {
    const entries = [
      makeEntry('pharmacologie_clinique_avancee'),
      makeEntry('gastroenterologie_hepatologie'),
    ];
    const stats = getKBStats(entries);
    expect(stats.totalEntries).toBe(2);
    expect(stats.categoriesCount).toBe(2);
  });

  it('retourne 0 pour un tableau vide', () => {
    const stats = getKBStats([]);
    expect(stats.totalEntries).toBe(0);
    expect(stats.categoriesCount).toBe(0);
    expect(stats.avgTriggersPerEntry).toBe(0);
    expect(stats.topTriggers).toEqual([]);
  });

  it('calcule avgTriggersPerEntry correctement', () => {
    const entries = [
      makeEntry('pharma', '', ['médicament', 'posologie', 'ADME']),
      makeEntry('gastro', '', ['digestion']),
    ];
    const stats = getKBStats(entries);
    expect(stats.avgTriggersPerEntry).toBe(2); // 4 triggers / 2 entries
  });

  it('expose themeCoverage avec les bons thèmes', () => {
    const entries = [makeEntry('pharmacologie_clinique_avancee', 'pharmacologie clinique')];
    const stats = getKBStats(entries);
    expect(stats.themeCoverage).toBeDefined();
    expect(typeof stats.themeCoverage.medicine_clinique).toBe('number');
  });
});
