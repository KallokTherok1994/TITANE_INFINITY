/**
 * KB Phase 37 — Tests Vitest
 * communication_leadership_management (v31.5.5) + psychologie_sante_comportements (v31.5.6)
 * Rule 16: mandatory tests for all new KB modules
 */

import { describe, it, expect } from 'vitest';
import communicationLeadershipRaw from '../../../../data/knowledge_base/default/communication_leadership_management.json';
import psychologieSanteRaw from '../../../../data/knowledge_base/default/psychologie_sante_comportements.json';

type KbJson = {
  version: string;
  category: string;
  description: string;
  retrieval_triggers: string[];
  sections: Record<string, unknown>;
};

const clm = communicationLeadershipRaw as KbJson;
const psc = psychologieSanteRaw as KbJson;

// ─────────────────────────────────────────────────────────────────────────────
// COMMUNICATION_LEADERSHIP_MANAGEMENT — structure & métadonnées
// ─────────────────────────────────────────────────────────────────────────────
describe('communication_leadership_management — structure', () => {
  it('version v31.5.5', () => {
    expect(clm.version).toBe('v31.5.5');
  });
  it('category correct', () => {
    expect(clm.category).toBe('communication_leadership_management');
  });
  it('description non vide', () => {
    expect(clm.description.length).toBeGreaterThan(10);
  });
  it('au moins 40 retrieval_triggers', () => {
    expect(clm.retrieval_triggers.length).toBeGreaterThanOrEqual(40);
  });
  it('au moins 6 sections', () => {
    expect(Object.keys(clm.sections).length).toBeGreaterThanOrEqual(6);
  });
  it('section leadership_modeles_classiques présente', () => {
    expect(clm.sections).toHaveProperty('leadership_modeles_classiques');
  });
  it('section communication_organisationnelle présente', () => {
    expect(clm.sections).toHaveProperty('communication_organisationnelle');
  });
  it('section gestion_conflits_negociation présente', () => {
    expect(clm.sections).toHaveProperty('gestion_conflits_negociation');
  });
  it('section management_performance présente', () => {
    expect(clm.sections).toHaveProperty('management_performance');
  });
  it('section intelligence_collective présente', () => {
    expect(clm.sections).toHaveProperty('intelligence_collective');
  });
  it('section agilite_management_moderne présente', () => {
    expect(clm.sections).toHaveProperty('agilite_management_moderne');
  });
  it('section coaching_developpement présente', () => {
    expect(clm.sections).toHaveProperty('coaching_developpement');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// COMMUNICATION_LEADERSHIP_MANAGEMENT — contenu sections
// ─────────────────────────────────────────────────────────────────────────────
describe('communication_leadership_management — contenu core', () => {
  it('leadership transformationnel Burns/Bass dans leadership_modeles_classiques', () => {
    const sections = clm.sections as Record<string, unknown>;
    const s = JSON.stringify(sections.leadership_modeles_classiques);
    expect(s).toMatch(/[Tt]ransformationnel/);
    expect(s).toMatch(/Burns|Bass/);
  });
  it('leadership situationnel Hersey Blanchard dans leadership_modeles_classiques', () => {
    const sections = clm.sections as Record<string, unknown>;
    const s = JSON.stringify(sections.leadership_modeles_classiques);
    expect(s).toMatch(/[Ss]ituationnel/);
    expect(s).toMatch(/Hersey|Blanchard/);
  });
  it('servant leadership Greenleaf dans leadership_modeles_classiques', () => {
    const sections = clm.sections as Record<string, unknown>;
    const s = JSON.stringify(sections.leadership_modeles_classiques);
    expect(s).toMatch(/[Ss]ervant/);
    expect(s).toMatch(/Greenleaf/);
  });
  it('feedback SBI dans communication_organisationnelle', () => {
    const sections = clm.sections as Record<string, unknown>;
    const s = JSON.stringify(sections.communication_organisationnelle);
    expect(s).toMatch(/[Ff]eedback/);
    expect(s).toMatch(/SBI/);
  });
  it('écoute active Rogers dans communication_organisationnelle', () => {
    const sections = clm.sections as Record<string, unknown>;
    const s = JSON.stringify(sections.communication_organisationnelle);
    expect(s).toMatch(/[Éé]coute active/);
    expect(s).toMatch(/Rogers/);
  });
  it('BATNA Harvard négociation dans gestion_conflits_negociation', () => {
    const sections = clm.sections as Record<string, unknown>;
    const s = JSON.stringify(sections.gestion_conflits_negociation);
    expect(s).toMatch(/BATNA/);
    expect(s).toMatch(/Harvard/);
  });
  it('Thomas-Kilmann 5 styles conflit dans gestion_conflits_negociation', () => {
    const sections = clm.sections as Record<string, unknown>;
    const s = JSON.stringify(sections.gestion_conflits_negociation);
    expect(s).toMatch(/Thomas.Kilmann/);
    expect(s).toMatch(/[Cc]ollaboration|[Cc]ompromis/);
  });
  it('OKR Doerr/Google dans management_performance', () => {
    const sections = clm.sections as Record<string, unknown>;
    const s = JSON.stringify(sections.management_performance);
    expect(s).toMatch(/OKR/);
    expect(s).toMatch(/[Oo]bjectives.*[Kk]ey|[Kk]ey.*[Rr]esults/);
  });
  it('sécurité psychologique Edmondson dans management_performance', () => {
    const sections = clm.sections as Record<string, unknown>;
    const s = JSON.stringify(sections.management_performance);
    expect(s).toMatch(/[Ss][eé]curit[eé] psychologique/);
    expect(s).toMatch(/Edmondson/);
  });
  it('organisation apprenante Senge dans intelligence_collective', () => {
    const sections = clm.sections as Record<string, unknown>;
    const s = JSON.stringify(sections.intelligence_collective);
    expect(s).toMatch(/[Ss]enge/);
    expect(s).toMatch(/[Aa]pprenant/);
  });
  it('culture Schein dans intelligence_collective', () => {
    const sections = clm.sections as Record<string, unknown>;
    const s = JSON.stringify(sections.intelligence_collective);
    expect(s).toMatch(/Schein/);
    expect(s).toMatch(/[Cc]ulture/);
  });
  it('Scrum sprints dans agilite_management_moderne', () => {
    const sections = clm.sections as Record<string, unknown>;
    const s = JSON.stringify(sections.agilite_management_moderne);
    expect(s).toMatch(/[Ss]crum/);
    expect(s).toMatch(/[Ss]print/);
  });
  it('Lencioni dysfonctions équipe dans agilite_management_moderne', () => {
    const sections = clm.sections as Record<string, unknown>;
    const s = JSON.stringify(sections.agilite_management_moderne);
    expect(s).toMatch(/Lencioni/);
    expect(s).toMatch(/[Dd]ysfonction/);
  });
  it('GROW coaching Whitmore dans coaching_developpement', () => {
    const sections = clm.sections as Record<string, unknown>;
    const s = JSON.stringify(sections.coaching_developpement);
    expect(s).toMatch(/GROW/);
    expect(s).toMatch(/Whitmore/);
  });
  it('mentoring reverse mentoring dans coaching_developpement', () => {
    const sections = clm.sections as Record<string, unknown>;
    const s = JSON.stringify(sections.coaching_developpement);
    expect(s).toMatch(/[Mm]entoring/);
    expect(s).toMatch(/[Rr]everse/);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// PSYCHOLOGIE_SANTE_COMPORTEMENTS — structure & métadonnées
// ─────────────────────────────────────────────────────────────────────────────
describe('psychologie_sante_comportements — structure', () => {
  it('version v31.5.6', () => {
    expect(psc.version).toBe('v31.5.6');
  });
  it('category correct', () => {
    expect(psc.category).toBe('psychologie_sante_comportements');
  });
  it('description non vide', () => {
    expect(psc.description.length).toBeGreaterThan(10);
  });
  it('au moins 40 retrieval_triggers', () => {
    expect(psc.retrieval_triggers.length).toBeGreaterThanOrEqual(40);
  });
  it('au moins 6 sections', () => {
    expect(Object.keys(psc.sections).length).toBeGreaterThanOrEqual(6);
  });
  it('section modele_biopsychosocial présente', () => {
    expect(psc.sections).toHaveProperty('modele_biopsychosocial');
  });
  it('section changement_comportemental_modeles présente', () => {
    expect(psc.sections).toHaveProperty('changement_comportemental_modeles');
  });
  it('section observance_therapeutique présente', () => {
    expect(psc.sections).toHaveProperty('observance_therapeutique');
  });
  it('section douleur_chronique_psychologie présente', () => {
    expect(psc.sections).toHaveProperty('douleur_chronique_psychologie');
  });
  it('section placebo_nocebo présente', () => {
    expect(psc.sections).toHaveProperty('placebo_nocebo');
  });
  it('section prevention_education_therapeutique présente', () => {
    expect(psc.sections).toHaveProperty('prevention_education_therapeutique');
  });
  it('section psycho_oncologie_maladies_graves présente', () => {
    expect(psc.sections).toHaveProperty('psycho_oncologie_maladies_graves');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// PSYCHOLOGIE_SANTE_COMPORTEMENTS — contenu sections
// ─────────────────────────────────────────────────────────────────────────────
describe('psychologie_sante_comportements — contenu core', () => {
  it('biopsychosocial Engel dans modele_biopsychosocial', () => {
    const sections = psc.sections as Record<string, unknown>;
    const s = JSON.stringify(sections.modele_biopsychosocial);
    expect(s).toMatch(/[Bb]iopsychosocial/);
    expect(s).toMatch(/Engel/);
  });
  it('psycho-neuro-immunologie stress maladie dans modele_biopsychosocial', () => {
    const sections = psc.sections as Record<string, unknown>;
    const s = JSON.stringify(sections.modele_biopsychosocial);
    expect(s).toMatch(/[Ii]mmunit|[Ss]tress/);
    expect(s).toMatch(/cortisol|[Ss]outien social/);
  });
  it('représentations maladie Leventhal dans modele_biopsychosocial', () => {
    const sections = psc.sections as Record<string, unknown>;
    const s = JSON.stringify(sections.modele_biopsychosocial);
    expect(s).toMatch(/Leventhal/);
    expect(s).toMatch(/repr[eé]sentation/);
  });
  it('TTM Prochaska stades dans changement_comportemental_modeles', () => {
    const sections = psc.sections as Record<string, unknown>;
    const s = JSON.stringify(sections.changement_comportemental_modeles);
    expect(s).toMatch(/Prochaska/);
    expect(s).toMatch(/[Pp]r[eé]contemplation|[Cc]ontemplation/);
  });
  it('auto-efficacité Bandura dans changement_comportemental_modeles', () => {
    const sections = psc.sections as Record<string, unknown>;
    const s = JSON.stringify(sections.changement_comportemental_modeles);
    expect(s).toMatch(/Bandura/);
    expect(s).toMatch(/auto.efficacit|self.efficacy/i);
  });
  it('Health Belief Model Rosenstock dans changement_comportemental_modeles', () => {
    const sections = psc.sections as Record<string, unknown>;
    const s = JSON.stringify(sections.changement_comportemental_modeles);
    expect(s).toMatch(/Rosenstock|Health Belief/);
    expect(s).toMatch(/barri[eè]re|b[eé]n[eé]fice/);
  });
  it('observance 50% OMS dans observance_therapeutique', () => {
    const sections = psc.sections as Record<string, unknown>;
    const s = JSON.stringify(sections.observance_therapeutique);
    expect(s).toMatch(/observance|adh[eé]sion/);
    expect(s).toMatch(/OMS|50/);
  });
  it('shared decision making ICE dans observance_therapeutique', () => {
    const sections = psc.sections as Record<string, unknown>;
    const s = JSON.stringify(sections.observance_therapeutique);
    expect(s).toMatch(/decision making|d[eé]cision partag/i);
    expect(s).toMatch(/ICE|SPIKES/);
  });
  it('catastrophisation fear-avoidance Vlaeyen dans douleur_chronique_psychologie', () => {
    const sections = psc.sections as Record<string, unknown>;
    const s = JSON.stringify(sections.douleur_chronique_psychologie);
    expect(s).toMatch(/catastrophis/);
    expect(s).toMatch(/Vlaeyen|kin[eé]siophobie/);
  });
  it('ACT TCC douleur chronique dans douleur_chronique_psychologie', () => {
    const sections = psc.sections as Record<string, unknown>;
    const s = JSON.stringify(sections.douleur_chronique_psychologie);
    expect(s).toMatch(/ACT|TCC/);
    expect(s).toMatch(/Kabat.Zinn|MBSR|acceptation/i);
  });
  it('placebo endorphines attentes dans placebo_nocebo', () => {
    const sections = psc.sections as Record<string, unknown>;
    const s = JSON.stringify(sections.placebo_nocebo);
    expect(s).toMatch(/placebo/);
    expect(s).toMatch(/endorphine|attente/);
  });
  it('nocebo CCK dans placebo_nocebo', () => {
    const sections = psc.sections as Record<string, unknown>;
    const s = JSON.stringify(sections.placebo_nocebo);
    expect(s).toMatch(/nocebo/);
    expect(s).toMatch(/CCK|anxiété|attente/i);
  });
  it('salutogenèse Antonovsky dans placebo_nocebo', () => {
    const sections = psc.sections as Record<string, unknown>;
    const s = JSON.stringify(sections.placebo_nocebo);
    expect(s).toMatch(/Antonovsky|salutogen/);
  });
  it('prévention primaire secondaire tertiaire dans prevention_education_therapeutique', () => {
    const sections = psc.sections as Record<string, unknown>;
    const s = JSON.stringify(sections.prevention_education_therapeutique);
    expect(s).toMatch(/primaire/);
    expect(s).toMatch(/secondaire/);
    expect(s).toMatch(/tertiaire/);
  });
  it('éducation thérapeutique ETP OMS dans prevention_education_therapeutique', () => {
    const sections = psc.sections as Record<string, unknown>;
    const s = JSON.stringify(sections.prevention_education_therapeutique);
    expect(s).toMatch(/[Éé]ducation th[eé]rapeutique|ETP/);
    expect(s).toMatch(/OMS/);
  });
  it('SPIKES annonce mauvaise nouvelle dans psycho_oncologie_maladies_graves', () => {
    const sections = psc.sections as Record<string, unknown>;
    const s = JSON.stringify(sections.psycho_oncologie_maladies_graves);
    expect(s).toMatch(/SPIKES/);
    expect(s).toMatch(/NURSE|empathie/i);
  });
  it('Kübler-Ross stades deuil santé dans psycho_oncologie_maladies_graves', () => {
    const sections = psc.sections as Record<string, unknown>;
    const s = JSON.stringify(sections.psycho_oncologie_maladies_graves);
    expect(s).toMatch(/K[uü]bler.Ross/);
    expect(s).toMatch(/d[eé]ni|colère|acceptation/);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// CROSS-MODULE — triggers et cohérence globale
// ─────────────────────────────────────────────────────────────────────────────
describe('phase 37 — cohérence cross-module', () => {
  it('CLM triggers incluent leadership et négociation', () => {
    expect(clm.retrieval_triggers).toContain('leadership');
    expect(clm.retrieval_triggers).toContain('négociation');
  });
  it('CLM triggers incluent feedback et OKR', () => {
    expect(clm.retrieval_triggers).toContain('feedback');
    expect(clm.retrieval_triggers).toContain('OKR');
  });
  it('PSC triggers incluent observance et douleur', () => {
    expect(psc.retrieval_triggers).toContain('observance');
    expect(psc.retrieval_triggers).toContain('douleur');
  });
  it('PSC triggers incluent placebo et prévention', () => {
    expect(psc.retrieval_triggers).toContain('placebo');
    expect(psc.retrieval_triggers).toContain('prévention');
  });
  it('PSC triggers incluent Prochaska TTM', () => {
    expect(psc.retrieval_triggers).toContain('Prochaska');
    expect(psc.retrieval_triggers).toContain('TTM');
  });
  it('CLM triggers incluent BATNA et servant leader', () => {
    expect(clm.retrieval_triggers).toContain('BATNA');
    expect(clm.retrieval_triggers).toContain('servant leader');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// UNIT-CORE — vérifications unitaires sans import entier
// ─────────────────────────────────────────────────────────────────────────────
describe('unit-core CLM', () => {
  it('CLM a au moins 7 sections', () => {
    expect(Object.keys(clm.sections).length).toBeGreaterThanOrEqual(7);
  });
  it('leadership_modeles_classiques contient transformationnel_transactionnel', () => {
    const s = clm.sections as Record<string, Record<string, unknown>>;
    expect(s.leadership_modeles_classiques).toHaveProperty(
      'transformationnel_transactionnel'
    );
  });
  it('leadership_modeles_classiques contient servant_leadership', () => {
    const s = clm.sections as Record<string, Record<string, unknown>>;
    expect(s.leadership_modeles_classiques).toHaveProperty('servant_leadership');
  });
  it('gestion_conflits_negociation contient modele_harvard', () => {
    const s = clm.sections as Record<string, Record<string, unknown>>;
    expect(s.gestion_conflits_negociation).toHaveProperty('modele_harvard');
  });
  it('intelligence_collective contient organisation_apprenante', () => {
    const s = clm.sections as Record<string, Record<string, unknown>>;
    expect(s.intelligence_collective).toHaveProperty('organisation_apprenante');
  });
  it('management_performance contient okr_management_objectifs', () => {
    const s = clm.sections as Record<string, Record<string, unknown>>;
    expect(s.management_performance).toHaveProperty('okr_management_objectifs');
  });
});

describe('unit-core PSC', () => {
  it('PSC a au moins 7 sections', () => {
    expect(Object.keys(psc.sections).length).toBeGreaterThanOrEqual(7);
  });
  it('modele_biopsychosocial contient engel_biopsychosocial', () => {
    const s = psc.sections as Record<string, Record<string, unknown>>;
    expect(s.modele_biopsychosocial).toHaveProperty('engel_biopsychosocial');
  });
  it('changement_comportemental_modeles contient modele_transtheorique', () => {
    const s = psc.sections as Record<string, Record<string, unknown>>;
    expect(s.changement_comportemental_modeles).toHaveProperty('modele_transtheorique');
  });
  it('changement_comportemental_modeles contient auto_efficacite_bandura', () => {
    const s = psc.sections as Record<string, Record<string, unknown>>;
    expect(s.changement_comportemental_modeles).toHaveProperty('auto_efficacite_bandura');
  });
  it('douleur_chronique_psychologie contient catastrophisation_kinesiophobie', () => {
    const s = psc.sections as Record<string, Record<string, unknown>>;
    expect(s.douleur_chronique_psychologie).toHaveProperty(
      'catastrophisation_kinesiophobie'
    );
  });
  it('placebo_nocebo contient effet_placebo_mecanismes', () => {
    const s = psc.sections as Record<string, Record<string, unknown>>;
    expect(s.placebo_nocebo).toHaveProperty('effet_placebo_mecanismes');
  });
  it('psycho_oncologie_maladies_graves contient annonce_mauvaise_nouvelle', () => {
    const s = psc.sections as Record<string, Record<string, unknown>>;
    expect(s.psycho_oncologie_maladies_graves).toHaveProperty(
      'annonce_mauvaise_nouvelle'
    );
  });
  it('prevention_education_therapeutique contient education_therapeutique', () => {
    const s = psc.sections as Record<string, Record<string, unknown>>;
    expect(s.prevention_education_therapeutique).toHaveProperty(
      'education_therapeutique'
    );
  });
});
