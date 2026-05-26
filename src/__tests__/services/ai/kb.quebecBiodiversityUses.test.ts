import usageRaw from '../../../../data/knowledge_base/default/quebec_biodiversite_usages_nutritifs_therapeutiques.json';

describe('KB Quebec biodiversity uses', () => {
  it('adds a governed biodiversity-uses domain with medical safety gating', () => {
    expect(usageRaw.category).toBe('quebec_biodiversite_usages_nutritifs_therapeutiques');
    expect(usageRaw.retrieval_triggers.length).toBeGreaterThanOrEqual(30);
    expect(usageRaw.source_curation.medical_safety_gate).toBe(true);
    expect(usageRaw.source_curation.sources.length).toBeGreaterThanOrEqual(10);
  });

  it('captures evidence tiers and conservation-first rules for protected Quebec species', () => {
    const kb = usageRaw.quebec_biodiversite_usages_nutritifs_therapeutiques;

    expect(kb.doctrine_usage.niveaux_de_preuve.food_use).toContain('alimentaire');
    expect(kb.dossiers_plantes.ail_des_bois.statut_quebec).toContain('vulnerable');
    expect(kb.dossiers_plantes.ginseng_a_cinq_folioles.statut_quebec).toContain(
      'menacee'
    );
    expect(kb.dossiers_plantes.ginseng_a_cinq_folioles.interactions_et_risques).toContain(
      'interaction possible avec la warfarine'
    );
  });

  it('records nuanced therapeutic evidence instead of promoting unsupported medical certainty', () => {
    const plants =
      usageRaw.quebec_biodiversite_usages_nutritifs_therapeutiques.dossiers_plantes;

    expect(plants.canneberge.usage_therapeutique.niveau_preuve).toBe(
      'limited_human_evidence'
    );
    expect(plants.pissenlit.usage_therapeutique.niveau_preuve).toBe(
      'conflicting_or_insufficient'
    );
    expect(
      plants.aubepine_du_canada_et_groupe_aubepines.usage_therapeutique.niveau_preuve
    ).toBe('conflicting_or_insufficient');
    expect(plants.podophylle_pelte.usage_therapeutique.niveau_preuve).toBe(
      'toxic_or_protected'
    );
  });

  it('extends fungi and game guidance with salubrity-first constraints', () => {
    const kb = usageRaw.quebec_biodiversite_usages_nutritifs_therapeutiques;

    expect(kb.dossiers_fonge.champignons_comestibles_quebec.garde_fous).toContain(
      'ne jamais consommer cru'
    );
    expect(kb.dossiers_faune.gibier_sauvage_quebec.cas_particuliers).toContain(
      'ours : cuisson a 74 C a cause du risque de trichinellose'
    );
    expect(kb.dossiers_faune.gibier_sauvage_quebec.cas_particuliers).toContain(
      'cervides : ne pas consommer foie ni reins a cause du cadmium eleve'
    );
  });
});
