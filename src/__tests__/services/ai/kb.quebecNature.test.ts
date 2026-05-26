import floreRaw from '../../../../data/knowledge_base/default/quebec_flore_arbres_plantes.json';
import fauneRaw from '../../../../data/knowledge_base/default/quebec_faune_animaux_oiseaux.json';
import fongeRaw from '../../../../data/knowledge_base/default/quebec_champignons_fonge.json';

describe('KB Quebec nature domains', () => {
  it('ships three Quebec-focused naturalist knowledge domains with substantial retrieval coverage', () => {
    const entries = [floreRaw, fauneRaw, fongeRaw];

    for (const entry of entries) {
      expect(entry.version.length).toBeGreaterThan(0);
      expect(entry.description.length).toBeGreaterThan(40);
      expect(entry.retrieval_triggers.length).toBeGreaterThanOrEqual(30);
      expect(entry.source_curation.region).toBe('Quebec');
      expect(entry.source_curation.sources.length).toBeGreaterThanOrEqual(3);
    }
  });

  it('captures Quebec flora emblems and photo-first plant recognition heuristics', () => {
    const kb = floreRaw.quebec_flore_arbres_plantes;

    expect(kb.cadre_quebecois.emblemes_officiels.arbre).toContain('Bouleau jaune');
    expect(kb.cadre_quebecois.emblemes_officiels.fleur).toContain('Iris versicolor');
    expect(kb.protocole_reconnaissance_photo.photos_a_demander).toContain(
      'gros plan de la feuille complete'
    );
    expect(kb.especes_reperes.erable_a_sucre.confusions.length).toBeGreaterThanOrEqual(2);
  });

  it('captures official Quebec fauna counts and distinct bird-animal photo cues', () => {
    const kb = fauneRaw.quebec_faune_animaux_oiseaux;

    expect(kb.cadre_quebecois.diversite_vertebres.total).toContain('850');
    expect(kb.cadre_quebecois.diversite_vertebres.oiseaux).toContain('468');
    expect(kb.cadre_quebecois.embleme_aviaire).toContain('harfang');
    expect(kb.oiseaux_reperes.harfang_des_neiges.indices_photo).toContain(
      'grand rapace blanc'
    );
    expect(kb.mammiferes_reperes.raton_laveur.indices_photo).toContain(
      'masque noir borde de blanc'
    );
  });

  it('adds fungi safety gates and morphology requirements before any species-level suggestion', () => {
    const kb = fongeRaw.quebec_champignons_fonge;

    expect(kb.alerte_securite.interdits[0]).toContain('consommation');
    expect(kb.protocole_reconnaissance_photo.morphologie_photo).toContain(
      'vue du dessous pour voir lames, pores, plis ou aiguillons'
    );
    expect(kb.especes_reperes.amanites_blanche_ou_verdatre.statut_runtime).toContain(
      'Ne jamais valider'
    );
    expect(
      kb.heuristiques_runtime_pour_titane.quand_rester_au_niveau_du_groupe
    ).toContain('petit champignon brun ou blanc');
  });
});
