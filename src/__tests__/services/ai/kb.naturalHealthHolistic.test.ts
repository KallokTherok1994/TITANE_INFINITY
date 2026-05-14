import holisticRaw from '../../../../data/knowledge_base/default/medecines_naturelles_nutrition_holistique_gouvernee.json';

describe('KB natural health and holistic guidance', () => {
  it('adds a governed natural therapies domain with medical safety gating', () => {
    expect(holisticRaw.category).toBe('medecines_naturelles_nutrition_holistique_gouvernee');
    expect(holisticRaw.retrieval_triggers.length).toBeGreaterThanOrEqual(30);
    expect(holisticRaw.source_curation.medical_safety_gate).toBe(true);
    expect(holisticRaw.source_curation.sources.length).toBeGreaterThanOrEqual(15);
  });

  it('prioritizes lifestyle foundations before supplements or pseudo-certainty', () => {
    const kb = holisticRaw.medecines_naturelles_nutrition_holistique_gouvernee;

    expect(kb.doctrine_canonique.regles).toContain(
      'Prioriser d abord les habitudes de vie a faible risque et a large benefice: alimentation, activite physique, sommeil, gestion du stress, adherence aux soins etablis.'
    );
    expect(kb.piliers_holistiques_prioritaires.alimentation_saine.niveau_preuve).toBe(
      'lifestyle_foundation'
    );
    expect(kb.piliers_holistiques_prioritaires.activite_physique.recommandations_cles).toContain(
      '150 minutes ou plus par semaine chez l adulte'
    );
  });

  it('captures nuanced evidence for complementary practices', () => {
    const practices = holisticRaw.medecines_naturelles_nutrition_holistique_gouvernee
      .pratiques_complementaires;

    expect(practices.meditation_pleine_conscience.niveau_preuve).toBe('supported_adjunct');
    expect(practices.yoga.niveau_preuve).toBe('supported_adjunct');
    expect(practices.acupuncture.niveau_preuve).toBe('supported_adjunct');
    expect(practices.homeopathie.niveau_preuve).toBe(
      'not_supported_or_high_interaction_risk'
    );
  });

  it('guards supplement advice with context, interactions, and deficiency-first logic', () => {
    const supplements = holisticRaw.medecines_naturelles_nutrition_holistique_gouvernee
      .supplements_et_therapies_naturelles;

    expect(supplements.probiotiques.niveau_preuve).toBe('context_specific_or_deficiency');
    expect(supplements.melatonine.garde_fous).toContain(
      'sous supervision si epilepsie ou prise d anticoagulants'
    );
    expect(supplements.omega_3.garde_fous).toContain(
      'les fortes doses peuvent majorer le risque de saignement avec warfarine ou autres anticoagulants'
    );
    expect(supplements.saint_johns_wort_et_ginkgo.niveau_preuve).toBe(
      'not_supported_or_high_interaction_risk'
    );
    expect(supplements.vitamine_b12.garde_fous).toContain(
      'la B12 n augmente pas l energie chez quelqu un qui n est pas deficient'
    );
  });
});
