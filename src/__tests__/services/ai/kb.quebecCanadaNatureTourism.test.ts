import qcRaw from '../../../../data/knowledge_base/default/quebec_paysages_randonnee_tourisme_nature.json';
import caRaw from '../../../../data/knowledge_base/default/canada_paysages_parcs_routes_panoramiques.json';

describe('KB Quebec and Canada nature tourism', () => {
  it('adds a Quebec nature tourism domain with trail and landscape framing', () => {
    expect(qcRaw.category).toBe('quebec_paysages_randonnee_tourisme_nature');
    expect(qcRaw.retrieval_triggers.length).toBeGreaterThanOrEqual(20);
    expect(qcRaw.source_curation.sources.length).toBeGreaterThanOrEqual(8);
  });

  it('captures Quebec regions through distinct visual atmospheres', () => {
    const kb = qcRaw.quebec_paysages_randonnee_tourisme_nature;

    expect(kb.grands_tableaux.gaspesie_et_forillon.atouts_visuels).toContain(
      'mer et relief au meme cadre'
    );
    expect(kb.grands_tableaux.mauricie_et_foret_laurentienne.atouts_visuels).toContain(
      'plus de 110 km de sentiers a La Mauricie'
    );
    expect(kb.grands_tableaux.archipel_de_mingan_et_cote_nord.garde_fous).toContain(
      'milieux fragiles, respecter strictement les sentiers ou le rivage selon les consignes'
    );
  });

  it('adds a Canada-wide scenic landscapes domain without collapsing everything into Banff', () => {
    expect(caRaw.category).toBe('canada_paysages_parcs_routes_panoramiques');
    expect(
      caRaw.canada_paysages_parcs_routes_panoramiques.doctrine_canonique.regles
    ).toContain(
      'Ne pas reduire le Canada naturel a Banff seulement; garder une lecture multiregionale.'
    );
    expect(
      caRaw.canada_paysages_parcs_routes_panoramiques.ensembles_majeurs
        .rocheuses_et_glaciers.exemple_canonique
    ).toContain('Icefields Parkway');
  });
});
