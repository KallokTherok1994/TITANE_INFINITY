import { describe, expect, it } from 'vitest';

import { extractTwinChatObservationCandidates } from '../extractTwinChatObservationCandidates';

describe('extractTwinChatObservationCandidates', () => {
  const baseInput = {
    route: '/titane?tab=conversation',
    moduleId: 'conversation',
  };

  it('extracts value candidates from explicit value language', () => {
    const candidates = extractTwinChatObservationCandidates({
      ...baseInput,
      message: "L'authenticité et la clarté sont importantes pour moi.",
    });

    expect(candidates).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ kind: 'value', contentCompact: 'authenticite' }),
        expect.objectContaining({ kind: 'value', contentCompact: 'clarte' }),
      ])
    );
  });

  it('extracts cognitive candidates from structure requests', () => {
    const candidates = extractTwinChatObservationCandidates({
      ...baseInput,
      message: "J'ai besoin d'un plan pas à pas avec un cadre structuré.",
    });

    expect(candidates).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ kind: 'cognitive', contentCompact: 'reasoning_stepwise' }),
        expect.objectContaining({ kind: 'cognitive', contentCompact: 'reasoning_structured' }),
      ])
    );
  });

  it('extracts style candidates from response preferences', () => {
    const candidates = extractTwinChatObservationCandidates({
      ...baseInput,
      message: 'Reponds de maniere directe, concise et structuree.',
    });

    expect(candidates).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ kind: 'style', contentCompact: 'style_direct' }),
        expect.objectContaining({ kind: 'style', contentCompact: 'style_concis' }),
        expect.objectContaining({ kind: 'style', contentCompact: 'style_structure' }),
      ])
    );
  });

  it('extracts emotional candidates from self-reported emotional states', () => {
    const candidates = extractTwinChatObservationCandidates({
      ...baseInput,
      message: 'Je me sens fatigue et un peu anxieux aujourd hui.',
    });

    expect(candidates).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ kind: 'emotional', contentCompact: 'emotion_fatigue' }),
        expect.objectContaining({ kind: 'emotional', contentCompact: 'emotion_anxiete' }),
      ])
    );
    expect(candidates.every(candidate => candidate.consentRisk !== 'low')).toBe(true);
  });

  it('avoids raw message persistence and duplicates', () => {
    const message = 'Sois direct, direct et sans fluff.';
    const candidates = extractTwinChatObservationCandidates({
      ...baseInput,
      message,
    });

    expect(candidates).toHaveLength(1);
    expect(candidates[0]).toMatchObject({
      kind: 'style',
      contentCompact: 'style_direct',
      evidenceSource: 'chat_turn',
      status: 'shadow',
      canWriteTwin: false,
    });
    expect('rawMessage' in candidates[0]).toBe(false);
    expect(candidates[0].contentCompact).not.toContain(message);
  });

  it('returns no candidates for neutral operational requests', () => {
    const candidates = extractTwinChatObservationCandidates({
      ...baseInput,
      message: 'Peux-tu ouvrir le journal des logs et verifier la derniere erreur ?',
    });

    expect(candidates).toEqual([]);
  });
});