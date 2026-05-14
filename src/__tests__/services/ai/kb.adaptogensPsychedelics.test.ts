import adaptogensRaw from '../../../../data/knowledge_base/default/adaptogenes_champignons_psychedeliques_gouvernee.json';

describe('KB adaptogens and psychedelic mushrooms', () => {
  it('adds a governed adaptogen and psychedelic domain', () => {
    expect(adaptogensRaw.category).toBe('adaptogenes_champignons_psychedeliques_gouvernee');
    expect(adaptogensRaw.retrieval_triggers.length).toBeGreaterThanOrEqual(20);
    expect(adaptogensRaw.source_curation.medical_safety_gate).toBe(true);
    expect(adaptogensRaw.source_curation.sources.length).toBeGreaterThanOrEqual(8);
  });

  it('keeps adaptogens bounded and interaction-aware', () => {
    const dossiers = adaptogensRaw.adaptogenes_champignons_psychedeliques_gouvernee.dossiers;

    expect(dossiers.ashwagandha.niveau_preuve).toBe('limited_targeted_signal');
    expect(dossiers.ashwagandha.garde_fous).toContain(
      'cas rapportes de lesion hepatique associee a des supplements'
    );
    expect(dossiers.rhodiola.niveau_preuve).toBe('insufficient_or_mixed');
    expect(dossiers.kava.niveau_preuve).toBe('high_risk_or_controlled');
  });

  it('does not overclaim medicinal mushrooms without strong official evidence', () => {
    const dossiers = adaptogensRaw.adaptogenes_champignons_psychedeliques_gouvernee.dossiers;

    expect(dossiers.champignons_medicinaux_commerciaux.niveau_preuve).toBe(
      'insufficient_or_mixed'
    );
    expect(dossiers.champignons_medicinaux_commerciaux.garde_fous).toContain(
      'ne pas extrapoler d etudes precliniques a des effets cliniques etablis'
    );
  });

  it('treats psilocybin as controlled and not an approved self-treatment', () => {
    const dossiers = adaptogensRaw.adaptogenes_champignons_psychedeliques_gouvernee.dossiers;

    expect(dossiers.psilocybine_et_champignons_magiques.niveau_preuve).toBe(
      'high_risk_or_controlled'
    );
    expect(dossiers.psilocybine_et_champignons_magiques.garde_fous).toContain(
      'aucun produit therapeutique approuve contenant psilocybine au Canada'
    );
    expect(dossiers.psilocybine_et_champignons_magiques.garde_fous).toContain(
      'ne jamais recommander l auto-traitement psychiatrique avec psilocybine'
    );
  });
});
