import { describe, it, expect } from 'vitest';
import cnvRaw from '../../../../data/knowledge_base/default/communication_non_violente_relations.json';
import deuilRaw from '../../../../data/knowledge_base/default/deuil_rupture_transitions.json';

// Phase 28 — KB tests: communication_non_violente_relations + deuil_rupture_transitions
// Rule 16 compliance — Vitest unit tests for the 2 KB modules

const cnv = cnvRaw as Record<string, unknown>;
const deuil = deuilRaw as Record<string, unknown>;

// ─────────────────────────────────────────────────────────────────────────────
// communication_non_violente_relations (v31.3.7)
// ─────────────────────────────────────────────────────────────────────────────
describe('KB: communication_non_violente_relations', () => {
  it('has correct version v31.3.7', () => {
    expect(cnv.version).toBe('v31.3.7');
  });

  it('has correct category', () => {
    expect(cnv.category).toBe('communication_non_violente_relations');
  });

  it('has at least 30 retrieval triggers', () => {
    const triggers = cnv.retrieval_triggers as string[];
    expect(triggers.length).toBeGreaterThanOrEqual(30);
  });

  it('triggers include CNV/NVC/Marshall Rosenberg', () => {
    const triggers = cnv.retrieval_triggers as string[];
    expect(triggers.some(t => t.includes('CNV') || t.includes('Communication Non Violente'))).toBe(true);
    expect(triggers.some(t => t.includes('Marshall Rosenberg'))).toBe(true);
  });

  it('triggers include NVC keywords', () => {
    const triggers = cnv.retrieval_triggers as string[];
    expect(triggers.some(t => t.includes('NVC') || t.includes('bienveillant'))).toBe(true);
  });

  it('triggers include assertivité / OSBD', () => {
    const triggers = cnv.retrieval_triggers as string[];
    expect(triggers.some(t => t.includes('assertiv') || t.includes('OSBD'))).toBe(true);
  });

  it('triggers include Gottman', () => {
    const triggers = cnv.retrieval_triggers as string[];
    expect(triggers.some(t => t.includes('Gottman'))).toBe(true);
  });

  it('has 7 sections', () => {
    const sections = cnv.sections as Record<string, unknown>;
    expect(Object.keys(sections).length).toBe(7);
  });

  it('has fondements_cnv section', () => {
    const sections = cnv.sections as Record<string, unknown>;
    expect(sections).toHaveProperty('fondements_cnv');
  });

  it('has modele_4_composantes_OSBD section', () => {
    const sections = cnv.sections as Record<string, unknown>;
    expect(sections).toHaveProperty('modele_4_composantes_OSBD');
  });

  it('has ecoute_empathique section', () => {
    const sections = cnv.sections as Record<string, unknown>;
    expect(sections).toHaveProperty('ecoute_empathique');
  });

  it('has conflits_et_resolution section', () => {
    const sections = cnv.sections as Record<string, unknown>;
    expect(sections).toHaveProperty('conflits_et_resolution');
  });

  it('has assertivite_et_limites section', () => {
    const sections = cnv.sections as Record<string, unknown>;
    expect(sections).toHaveProperty('assertivite_et_limites');
  });

  it('OSBD section has 4 composantes', () => {
    const sections = cnv.sections as Record<string, unknown>;
    const osbd = sections['modele_4_composantes_OSBD'] as Record<string, unknown>;
    expect(osbd).toHaveProperty('O_observation');
    expect(osbd).toHaveProperty('S_sentiments');
    expect(osbd).toHaveProperty('B_besoins');
    expect(osbd).toHaveProperty('D_demande');
  });

  it('pseudo-sentiments vs vrais sentiments définis', () => {
    const sections = cnv.sections as Record<string, unknown>;
    const osbd = sections['modele_4_composantes_OSBD'] as Record<string, unknown>;
    const sentiments = osbd['S_sentiments'] as Record<string, unknown>;
    expect(sentiments).toHaveProperty('pseudo_sentiments_chacal');
    const ps = sentiments['pseudo_sentiments_chacal'] as string[];
    expect(ps.length).toBeGreaterThanOrEqual(3);
  });

  it('4 cavaliers Gottman présents', () => {
    const sections = cnv.sections as Record<string, unknown>;
    const conflits = sections['conflits_et_resolution'] as Record<string, unknown>;
    const gottman = conflits['les_4_cavaliers_gottman'] as Record<string, unknown>;
    expect(gottman).toHaveProperty('cavalier_1_critique');
    expect(gottman).toHaveProperty('cavalier_2_mepris');
    expect(gottman).toHaveProperty('cavalier_3_defensivite');
    expect(gottman).toHaveProperty('cavalier_4_mur_de_pierre');
  });

  it('besoins universels avec catégories', () => {
    const sections = cnv.sections as Record<string, unknown>;
    const osbd = sections['modele_4_composantes_OSBD'] as Record<string, unknown>;
    const besoins = osbd['B_besoins'] as Record<string, unknown>;
    const classif = besoins['besoins_universels_classification'] as Record<string, unknown>;
    expect(Object.keys(classif).length).toBeGreaterThanOrEqual(5);
  });

  it('message-je structure présente', () => {
    const sections = cnv.sections as Record<string, unknown>;
    const assertivite = sections['assertivite_et_limites'] as Record<string, unknown>;
    const mj = assertivite['message_je'] as Record<string, unknown>;
    expect(mj).toHaveProperty('structure');
    const structure = mj['structure'] as string;
    expect(structure.length).toBeGreaterThan(20);
  });

  it('droits assertifs au moins 5', () => {
    const sections = cnv.sections as Record<string, unknown>;
    const assertivite = sections['assertivite_et_limites'] as Record<string, unknown>;
    const droits = assertivite['droits_assertifs_fondamentaux'] as string[];
    expect(droits.length).toBeGreaterThanOrEqual(5);
  });

  it('ressources CNVC et ACNfrance présentes', () => {
    const sections = cnv.sections as Record<string, unknown>;
    const ressources = sections['ressources_cnv'] as Record<string, unknown>;
    const formations = ressources['formations_certifications'] as Record<string, unknown>;
    expect(formations).toHaveProperty('CNVC');
    expect(formations).toHaveProperty('ACNfrance');
  });

  it('langage girafe et chacal distincts', () => {
    const sections = cnv.sections as Record<string, unknown>;
    const fondements = sections['fondements_cnv'] as Record<string, unknown>;
    const distinction = fondements['distinction_communication'] as Record<string, unknown>;
    expect(distinction).toHaveProperty('langage_chacal');
    expect(distinction).toHaveProperty('langage_girafe');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// deuil_rupture_transitions (v31.3.8)
// ─────────────────────────────────────────────────────────────────────────────
describe('KB: deuil_rupture_transitions', () => {
  it('has correct version v31.3.8', () => {
    expect(deuil.version).toBe('v31.3.8');
  });

  it('has correct category', () => {
    expect(deuil.category).toBe('deuil_rupture_transitions');
  });

  it('has at least 30 retrieval triggers', () => {
    const triggers = deuil.retrieval_triggers as string[];
    expect(triggers.length).toBeGreaterThanOrEqual(30);
  });

  it('triggers include deuil/rupture/Kübler-Ross', () => {
    const triggers = deuil.retrieval_triggers as string[];
    expect(triggers.some(t => t.includes('deuil'))).toBe(true);
    expect(triggers.some(t => t.includes('rupture'))).toBe(true);
    expect(triggers.some(t => t.includes('Kübler-Ross'))).toBe(true);
  });

  it('triggers include transitions', () => {
    const triggers = deuil.retrieval_triggers as string[];
    expect(triggers.some(t => t.includes('transition') || t.includes('Bridges'))).toBe(true);
  });

  it('has required sections', () => {
    const sections = deuil.sections as Record<string, unknown>;
    expect(sections).toHaveProperty('comprendre_le_deuil');
    expect(sections).toHaveProperty('modeles_processus_deuil');
    expect(sections).toHaveProperty('deuil_complique_pathologique');
    expect(sections).toHaveProperty('deuil_rupture_amoureuse');
    expect(sections).toHaveProperty('transitions_majeures_William_Bridges');
    expect(sections).toHaveProperty('ressources_deuil_rupture');
  });

  it('5 stades Kübler-Ross définis', () => {
    const sections = deuil.sections as Record<string, unknown>;
    const modeles = sections['modeles_processus_deuil'] as Record<string, unknown>;
    const kr = modeles['modele_kubler_ross_5_stades'] as Record<string, unknown>;
    expect(kr).toHaveProperty('stades');
    const stades = kr['stades'] as Record<string, unknown>;
    expect(stades).toHaveProperty('1_deni');
    expect(stades).toHaveProperty('2_colere');
    expect(stades).toHaveProperty('3_marchandage');
    expect(stades).toHaveProperty('4_depression');
    expect(stades).toHaveProperty('5_acceptation');
  });

  it('modèle Worden 4 tâches présent', () => {
    const sections = deuil.sections as Record<string, unknown>;
    const modeles = sections['modeles_processus_deuil'] as Record<string, unknown>;
    const worden = modeles['modele_worden_4_taches'] as Record<string, unknown>;
    expect(worden).toHaveProperty('taches');
    const taches = worden['taches'] as Record<string, unknown>;
    expect(taches).toHaveProperty('tache_1');
    expect(taches).toHaveProperty('tache_4');
  });

  it('neurobiologie rupture amoureuse présente', () => {
    const sections = deuil.sections as Record<string, unknown>;
    const rupture = sections['deuil_rupture_amoureuse'] as Record<string, unknown>;
    expect(rupture).toHaveProperty('neurobiologie_douleur_rupture');
    const neuro = rupture['neurobiologie_douleur_rupture'] as Record<string, unknown>;
    expect(neuro).toHaveProperty('systeme_recompense');
  });

  it('modèle Bridges 3 phases présent', () => {
    const sections = deuil.sections as Record<string, unknown>;
    const bridges = sections['transitions_majeures_William_Bridges'] as Record<string, unknown>;
    expect(bridges).toHaveProperty('modele_3_phases_Bridges');
    const phases = bridges['modele_3_phases_Bridges'] as Record<string, unknown>;
    expect(phases).toHaveProperty('phase_1_fin');
    expect(phases).toHaveProperty('phase_2_zone_neutre');
    expect(phases).toHaveProperty('phase_3_nouveau_depart');
  });

  it('ressources QC et France présentes', () => {
    const sections = deuil.sections as Record<string, unknown>;
    const ressources = sections['ressources_deuil_rupture'] as Record<string, unknown>;
    const soutien = ressources['soutien_professionnel'] as Record<string, unknown>;
    const lignes = soutien['lignes_urgence'] as Record<string, unknown>;
    expect(lignes).toHaveProperty('france');
    expect(lignes).toHaveProperty('quebec');
  });

  it('piège no contact rupture documenté', () => {
    const sections = deuil.sections as Record<string, unknown>;
    const rupture = sections['deuil_rupture_amoureuse'] as Record<string, unknown>;
    expect(rupture).toHaveProperty('regles_no_contact');
  });

  it('deuil compliqué facteurs de risque présents', () => {
    const sections = deuil.sections as Record<string, unknown>;
    const complique = sections['deuil_complique_pathologique'] as Record<string, unknown>;
    const facteurs = complique['facteurs_risque_deuil_complique'] as string[];
    expect(facteurs.length).toBeGreaterThanOrEqual(5);
  });

  it('soutien deuil: que ne pas dire défini', () => {
    const sections = deuil.sections as Record<string, unknown>;
    const accompagnement = sections['accompagnement_soutien_deuil'] as Record<string, unknown>;
    const npd = accompagnement['que_ne_pas_dire'] as string[];
    expect(npd.length).toBeGreaterThanOrEqual(3);
  });
});
