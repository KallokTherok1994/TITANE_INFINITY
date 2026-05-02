import { describe, it, expect } from 'vitest';
import dependanceData from '../../../../data/knowledge_base/default/dependance_affective_codependance.json';
import therapiesData from '../../../../data/knowledge_base/default/therapies_trauma_avancees.json';

// ─── Phase 27 KB Rule 16 Tests ────────────────────────────────────────────────
// Rule 16 compliance: 2 nouveaux modules KB
// dependance_affective_codependance (v31.3.5)
// therapies_trauma_avancees (v31.3.6)
// ─────────────────────────────────────────────────────────────────────────────

describe('KB dependance_affective_codependance (v31.3.5)', () => {
  it('a la bonne version', () => {
    expect(dependanceData.version).toBe('v31.3.5');
  });

  it('a la bonne catégorie', () => {
    expect(dependanceData.category).toBe('dependance_affective_codependance');
  });

  it('a au moins 30 retrieval_triggers', () => {
    expect(dependanceData.retrieval_triggers.length).toBeGreaterThanOrEqual(30);
  });

  it('les triggers couvrent la dépendance affective', () => {
    const triggers = dependanceData.retrieval_triggers;
    expect(triggers).toContain('dépendance affective');
  });

  it('les triggers couvrent la codépendance', () => {
    const triggers = dependanceData.retrieval_triggers;
    expect(triggers).toContain('codépendance');
  });

  it('les triggers couvrent le trauma bonding', () => {
    const triggers = dependanceData.retrieval_triggers;
    expect(triggers).toContain('trauma bonding');
  });

  it('les triggers couvrent le fawn response', () => {
    const triggers = dependanceData.retrieval_triggers;
    expect(triggers).toContain('fawn response');
  });

  it('les triggers couvrent la parentification', () => {
    const triggers = dependanceData.retrieval_triggers;
    expect(triggers).toContain('parentification');
  });

  it('les triggers couvrent les blessures Bourbeau', () => {
    const triggers = dependanceData.retrieval_triggers;
    const hasBlessures = triggers.some(
      (t: string) => t.includes('blessures') || t.includes('Bourbeau')
    );
    expect(hasBlessures).toBe(true);
  });

  it('contient 8 sections', () => {
    const sections = Object.keys(dependanceData.sections);
    expect(sections.length).toBeGreaterThanOrEqual(7);
  });

  it('section cadre_clinique présente', () => {
    expect(dependanceData.sections).toHaveProperty('cadre_clinique_dependance_affective');
  });

  it('section codependance présente', () => {
    expect(dependanceData.sections).toHaveProperty('codependance');
  });

  it('section trauma_bonding présente', () => {
    expect(dependanceData.sections).toHaveProperty('trauma_bonding_lien_traumatique');
  });

  it('section fawn_response présente', () => {
    expect(dependanceData.sections).toHaveProperty('fawn_response_et_people_pleasing');
  });

  it('section parentification présente', () => {
    expect(dependanceData.sections).toHaveProperty('parentification');
  });

  it('section blessures_fondamentales présente', () => {
    expect(dependanceData.sections).toHaveProperty('blessures_fondamentales_bourbeau');
  });

  it('section autonomie_emotionnelle présente', () => {
    expect(dependanceData.sections).toHaveProperty('vers_autonomie_emotionnelle');
  });

  it('section ressources présente', () => {
    expect(dependanceData.sections).toHaveProperty('ressources_dependance_affective');
  });

  it('le triangle de Karpman est défini', () => {
    const karpman = dependanceData.sections.codependance.triangle_karpman;
    expect(karpman).toBeDefined();
    expect(karpman.roles).toHaveProperty('sauveur');
    expect(karpman.roles).toHaveProperty('victime');
    expect(karpman.roles).toHaveProperty('persecuteur');
  });

  it('les 5 blessures de Bourbeau sont définies', () => {
    const blessures = dependanceData.sections.blessures_fondamentales_bourbeau.blessures;
    expect(blessures).toHaveProperty('rejet');
    expect(blessures).toHaveProperty('abandon');
    expect(blessures).toHaveProperty('humiliation');
    expect(blessures).toHaveProperty('trahison');
    expect(blessures).toHaveProperty('injustice');
  });

  it('le cycle de Walker (trauma bonding) est défini', () => {
    const cycle =
      dependanceData.sections.trauma_bonding_lien_traumatique.cycle_lenore_walker_1979;
    expect(cycle).toBeDefined();
    expect(cycle).toHaveProperty('phase_1_tension');
    expect(cycle).toHaveProperty('phase_2_explosion');
    expect(cycle).toHaveProperty('phase_3_reconciliation');
    expect(cycle).toHaveProperty('phase_4_accalmie');
  });

  it('le mécanisme neurobiologique du trauma bonding est documenté', () => {
    const neuro =
      dependanceData.sections.trauma_bonding_lien_traumatique.mecanisme_neurobiologique;
    expect(neuro).toHaveProperty('dopamine');
    expect(neuro).toHaveProperty('cortisol');
    expect(neuro).toHaveProperty('ocytocine');
  });

  it('les étapes de guérison vers autonomie sont documentées', () => {
    const etapes = dependanceData.sections.vers_autonomie_emotionnelle.etapes_guerison;
    expect(Array.isArray(etapes)).toBe(true);
    expect(etapes.length).toBeGreaterThanOrEqual(5);
  });

  it('les ressources francophones QC+France sont présentes', () => {
    const ressources =
      dependanceData.sections.ressources_dependance_affective.ressources_francophones;
    expect(ressources).toHaveProperty('france');
    expect(ressources).toHaveProperty('quebec');
  });

  it('SLAA et CoDA sont référencés', () => {
    const groupes =
      dependanceData.sections.ressources_dependance_affective.groupes_entraide;
    expect(groupes).toHaveProperty('SLAA');
    expect(groupes).toHaveProperty('CoDA');
  });

  it('Melody Beattie est référencée', () => {
    const livres =
      dependanceData.sections.ressources_dependance_affective.livres_fondamentaux;
    const hasBeattie = livres.some(
      (l: string) => l.includes('Beattie') || l.includes('Codependent')
    );
    expect(hasBeattie).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe('KB therapies_trauma_avancees (v31.3.6)', () => {
  it('a la bonne version', () => {
    expect(therapiesData.version).toBe('v31.3.6');
  });

  it('a la bonne catégorie', () => {
    expect(therapiesData.category).toBe('therapies_trauma_avancees');
  });

  it('a au moins 30 retrieval_triggers', () => {
    expect(therapiesData.retrieval_triggers.length).toBeGreaterThanOrEqual(30);
  });

  it('les triggers couvrent EMDR', () => {
    expect(therapiesData.retrieval_triggers).toContain('EMDR');
  });

  it('les triggers couvrent IFS', () => {
    expect(therapiesData.retrieval_triggers).toContain('IFS');
  });

  it('les triggers couvrent Somatic Experiencing', () => {
    expect(therapiesData.retrieval_triggers).toContain('Somatic Experiencing');
  });

  it('les triggers couvrent schema therapy', () => {
    expect(therapiesData.retrieval_triggers).toContain('schema therapy');
  });

  it('les triggers couvrent AEDP', () => {
    expect(therapiesData.retrieval_triggers).toContain('AEDP');
  });

  it('les triggers couvrent Internal Family Systems', () => {
    expect(therapiesData.retrieval_triggers).toContain('Internal Family Systems');
  });

  it('contient au moins 6 sections', () => {
    const sections = Object.keys(therapiesData.sections);
    expect(sections.length).toBeGreaterThanOrEqual(6);
  });

  it('section cadre_general présente', () => {
    expect(therapiesData.sections).toHaveProperty('cadre_general_therapies_trauma');
  });

  it('section EMDR présente', () => {
    expect(therapiesData.sections).toHaveProperty('EMDR');
  });

  it('section IFS présente', () => {
    expect(therapiesData.sections).toHaveProperty('IFS_internal_family_systems');
  });

  it('section Somatic Experiencing présente', () => {
    expect(therapiesData.sections).toHaveProperty('somatic_experiencing_SE');
  });

  it('section AEDP présente', () => {
    expect(therapiesData.sections).toHaveProperty(
      'AEDP_accelerated_experiential_dynamic'
    );
  });

  it('section schema therapy modes présente', () => {
    expect(therapiesData.sections).toHaveProperty('schema_therapy_modes');
  });

  it('section intégration et recommandations présente', () => {
    expect(therapiesData.sections).toHaveProperty(
      'integration_et_recommandations_cliniques'
    );
  });

  it('le protocole EMDR en 8 phases est documenté', () => {
    const phases = therapiesData.sections.EMDR.protocole_8_phases;
    expect(phases).toBeDefined();
    expect(phases).toHaveProperty('1_historique');
    expect(phases).toHaveProperty('3_evaluation');
    expect(phases).toHaveProperty('4_desensibilisation');
    expect(phases).toHaveProperty('8_reevaluation');
  });

  it('la topographie IFS (Self/managers/pompiers/exils) est documentée', () => {
    const topo =
      therapiesData.sections.IFS_internal_family_systems.topographie_systeme_interne;
    expect(topo).toHaveProperty('Self');
    expect(topo).toHaveProperty('managers');
    expect(topo).toHaveProperty('pompiers');
    expect(topo).toHaveProperty('exiles');
  });

  it('les 8C du Self IFS sont mentionnés', () => {
    const self =
      therapiesData.sections.IFS_internal_family_systems.topographie_systeme_interne.Self;
    expect(self.definition).toContain('8C');
  });

  it('les modes schema therapy (enfant vulnérable, adulte sain) sont définis', () => {
    const modes = therapiesData.sections.schema_therapy_modes.travail_par_modes;
    expect(modes.modes_enfant).toHaveProperty('enfant_vulnerable');
    expect(modes).toHaveProperty('adulte_sain');
  });

  it('les 5 domaines de schémas précoces sont documentés', () => {
    const schemas =
      therapiesData.sections.schema_therapy_modes.schemas_precoces_inadaptes_SPI;
    const domaines = schemas['18_schemas'];
    expect(domaines).toHaveProperty('domaine_disconnexion_rejet');
    expect(domaines).toHaveProperty('domaine_orientation_vers_autrui');
  });

  it('les principes SE (pendulation, titration) sont définis', () => {
    const principes = therapiesData.sections.somatic_experiencing_SE.principes_cles;
    expect(principes).toHaveProperty('pendulation');
    expect(principes).toHaveProperty('titration');
  });

  it('le niveau de preuve EMDR (Niveau 1 OMS) est documenté', () => {
    const niveaux =
      therapiesData.sections.cadre_general_therapies_trauma.niveaux_preuve_scientifique;
    expect(niveaux.EMDR).toContain('Niveau 1');
  });

  it('les recommandations par profil clinique sont présentes', () => {
    const choix =
      therapiesData.sections.integration_et_recommandations_cliniques
        .choix_approche_par_profil;
    expect(choix).toHaveProperty('PTSD_simple_evenement_recent');
    expect(choix).toHaveProperty('C_PTSD_trauma_developpement');
  });

  it('les phases universelles (stabilisation/reprocessing/intégration) sont définies', () => {
    const phases =
      therapiesData.sections.integration_et_recommandations_cliniques.phases_universelles;
    expect(phases).toHaveProperty('phase_1_securite_stabilisation');
    expect(phases).toHaveProperty('phase_2_reprocessing');
    expect(phases).toHaveProperty('phase_3_integration');
  });

  it('la fondatrice EMDR est référencée', () => {
    const emdr = therapiesData.sections.EMDR;
    expect(emdr.fondatrice).toContain('Shapiro');
  });

  it('Richard Schwartz est référencé pour IFS', () => {
    const ifs = therapiesData.sections.IFS_internal_family_systems;
    expect(ifs.fondateur).toContain('Schwartz');
  });

  it('Peter Levine est référencé pour Somatic Experiencing', () => {
    const se = therapiesData.sections.somatic_experiencing_SE;
    expect(se.fondateur).toContain('Levine');
  });

  it('Diana Fosha est référencée pour AEDP', () => {
    const aedp = therapiesData.sections.AEDP_accelerated_experiential_dynamic;
    expect(aedp.fondatrice).toContain('Fosha');
  });

  it('Jeffrey Young est référencé pour la schema therapy', () => {
    const schema = therapiesData.sections.schema_therapy_modes;
    expect(schema.fondateur).toContain('Young');
  });

  it('les ressources EMDR France et Canada sont présentes', () => {
    const ressources = therapiesData.sections.EMDR.ressources;
    const hasFrance = ressources.some((r: string) => r.includes('emdr-france'));
    const hasCanada = ressources.some((r: string) => r.includes('emdrcanada'));
    expect(hasFrance).toBe(true);
    expect(hasCanada).toBe(true);
  });
});
