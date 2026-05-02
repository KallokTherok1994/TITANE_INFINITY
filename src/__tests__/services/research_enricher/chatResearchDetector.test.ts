/**
 * Tests — ChatResearchDetector (Rule 16)
 * Scope: detectResearchIntent, isResearchQuery
 */
import { describe, it, expect } from 'vitest';
import {
  detectResearchIntent,
  isResearchQuery,
} from '@/services/research_enricher/chatResearchDetector';

describe('isResearchQuery', () => {
  it('détecte "recherche" comme requête de recherche', () => {
    expect(isResearchQuery('recherche les dernières avancées en immunologie')).toBe(true);
  });

  it('détecte "compare" comme requête de recherche', () => {
    expect(isResearchQuery('compare les approches pharmacologiques')).toBe(true);
  });

  it('détecte "explique" comme requête de recherche', () => {
    expect(isResearchQuery('explique comment fonctionne le microbiote')).toBe(true);
  });

  it('détecte "liste" comme requête de recherche', () => {
    expect(isResearchQuery('liste les principaux antibiotiques')).toBe(true);
  });

  it('détecte "analyse" comme requête de recherche', () => {
    expect(isResearchQuery('analyse le mécanisme de la résistance bactérienne')).toBe(
      true
    );
  });

  it('ne détecte pas un message conversationnel simple', () => {
    expect(isResearchQuery('ok merci')).toBe(false);
  });

  it('ne détecte pas un message très court', () => {
    expect(isResearchQuery('hi')).toBe(false);
  });

  it('détecte les patterns EN (search, explain, compare)', () => {
    expect(isResearchQuery('search for information about gastroenterology')).toBe(true);
    expect(isResearchQuery('explain what is pharmacokinetics')).toBe(true);
  });
});

describe('detectResearchIntent', () => {
  it('retourne isResearch=true avec intent pour comparaison', () => {
    const result = detectResearchIntent(
      'compare les différences entre oméprazole et pantoprazole'
    );
    expect(result.isResearch).toBe(true);
    expect(result.intent).toBe('comparison');
    expect(result.confidence).toBeGreaterThanOrEqual(0.7);
  });

  it('retourne extractedTerms non vide pour requête de recherche', () => {
    const result = detectResearchIntent(
      'liste les interactions médicamenteuses de la warfarine'
    );
    expect(result.isResearch).toBe(true);
    expect(result.extractedTerms.length).toBeGreaterThan(0);
  });

  it('retourne isResearch=false et intent=none pour message vide', () => {
    const result = detectResearchIntent('');
    expect(result.isResearch).toBe(false);
    expect(result.intent).toBe('none');
    expect(result.confidence).toBe(0);
  });

  it('retourne isResearch=false pour message trop court', () => {
    const result = detectResearchIntent('ok');
    expect(result.isResearch).toBe(false);
  });

  it('retourne intent=explanation pour "qu\'est-ce que"', () => {
    const result = detectResearchIntent("qu'est-ce que la pharmacovigilance");
    expect(result.isResearch).toBe(true);
    expect(result.intent).toBe('explanation');
  });

  it('retourne intent=analysis pour "analyse"', () => {
    const result = detectResearchIntent('analyse les résultats de cette étude clinique');
    expect(result.isResearch).toBe(true);
    expect(result.intent).toBe('analysis');
  });
});
