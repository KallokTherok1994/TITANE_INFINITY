import survivalRaw from '../../../../data/knowledge_base/default/survie_camping_foret_autosuffisance_gouvernee.json';

describe('KB forest survival and camping', () => {
  it('adds a governed forest survival and camping domain', () => {
    expect(survivalRaw.category).toBe('survie_camping_foret_autosuffisance_gouvernee');
    expect(survivalRaw.retrieval_triggers.length).toBeGreaterThanOrEqual(25);
    expect(survivalRaw.source_curation.sources.length).toBeGreaterThanOrEqual(10);
  });

  it('frames wilderness use around planning, legality, and temporary self-sufficiency', () => {
    const kb = survivalRaw.survie_camping_foret_autosuffisance_gouvernee;

    expect(kb.doctrine_canonique.regles).toContain(
      'Ne pas presenter la vie en foret comme libre de contraintes legales sur terres publiques, territoires fauniques ou aires protegees.'
    );
    expect(kb.cadre_legal_quebec.points_cles).toContain(
      'une installation permanente ou l appropriation du territoire public n est pas la meme chose qu un campement temporaire'
    );
  });

  it('keeps water, fire, wildlife and hypothermia as primary risk domains', () => {
    const pillars = survivalRaw.survie_camping_foret_autosuffisance_gouvernee
      .piliers_de_survie_et_camping;

    expect(pillars.eau.niveau_risque).toBe('high_survival_or_illegal_occupation_risk');
    expect(pillars.feu_de_camp.regles_pratiques).toContain(
      'eviter d allumer si danger eleve a extreme ou vent > 20 km h'
    );
    expect(pillars.animaux_et_ours.points_cles).toContain(
      'porter du bear spray dans les contextes d ours et savoir s en servir'
    );
    expect(pillars.froid_et_hypothermie.prevention).toContain(
      'privilegier laine, polaire, synthetiques; eviter le coton'
    );
  });

  it('treats living in the forest as a high-risk legal and logistical issue, not a fantasy', () => {
    const autonomy = survivalRaw.survie_camping_foret_autosuffisance_gouvernee
      .autosuffisance_et_vivre_en_foret;

    expect(autonomy.niveau_risque).toBe('high_survival_or_illegal_occupation_risk');
    expect(autonomy.principes).toContain(
      'encadrer l autosuffisance comme autonomie temporaire ou projet legal structure, pas comme disparition sans contraintes'
    );
  });
});
