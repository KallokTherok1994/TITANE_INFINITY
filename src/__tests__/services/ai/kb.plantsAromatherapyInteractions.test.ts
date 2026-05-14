import plantsRaw from '../../../../data/knowledge_base/default/plantes_aromatherapie_interactions_gouvernee.json';

describe('KB plants and aromatherapy interactions', () => {
  it('adds a governed medicinal plants and essential oils domain', () => {
    expect(plantsRaw.category).toBe('plantes_aromatherapie_interactions_gouvernee');
    expect(plantsRaw.retrieval_triggers.length).toBeGreaterThanOrEqual(25);
    expect(plantsRaw.source_curation.medical_safety_gate).toBe(true);
    expect(plantsRaw.source_curation.sources.length).toBeGreaterThanOrEqual(10);
  });

  it('separates route of use and risk levels instead of flattening all plant uses', () => {
    const kb = plantsRaw.plantes_aromatherapie_interactions_gouvernee;

    expect(kb.doctrine_usage.regles).toContain(
      'Toujours distinguer usage oral, topique, inhalation et ingestion d huile essentielle concentree.'
    );
    expect(kb.dossiers.menthe_poivree_huile_essentielle.formes).toContain(
      'capsule gastroresistante'
    );
    expect(kb.dossiers.tea_tree_melaleuca.formes).toContain('usage topique');
  });

  it('captures bounded evidence and hard safety gates for essential oils and herbs', () => {
    const dossiers = plantsRaw.plantes_aromatherapie_interactions_gouvernee.dossiers;

    expect(dossiers.menthe_poivree_huile_essentielle.niveau_preuve).toBe(
      'topical_or_targeted_supported_adjunct'
    );
    expect(dossiers.camomille.niveau_preuve).toBe('limited_or_preliminary');
    expect(dossiers.echinacee.niveau_preuve).toBe('insufficient_or_conflicting');
    expect(dossiers.tea_tree_melaleuca.niveau_preuve).toBe(
      'high_toxicity_or_interaction_risk'
    );
    expect(dossiers.extrait_de_the_vert.niveau_preuve).toBe(
      'high_toxicity_or_interaction_risk'
    );
  });

  it('keeps interaction and toxicity warnings explicit', () => {
    const dossiers = plantsRaw.plantes_aromatherapie_interactions_gouvernee.dossiers;

    expect(dossiers.tea_tree_melaleuca.garde_fous).toContain(
      'ne jamais avaler l huile essentielle de tea tree'
    );
    expect(dossiers.extrait_de_the_vert.garde_fous).toContain(
      'Health Canada conclut a un lien possible avec des atteintes hepatiques rares et imprevisibles'
    );
    expect(dossiers.interactions_transversales.drapeaux_rouges).toContain('warfarine');
  });
});
