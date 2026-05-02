/**
 * Tests KB phase 35 — philosophie_ethique_existentielle (v31.5.1) + relations_humaines_groupes_sociaux (v31.5.2)
 * Rule 16 — chaque module KB doit avoir des tests Vitest
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';

const dataDir = join(process.cwd(), 'data/knowledge_base/default');

function loadKb(filename: string): unknown {
  const raw = readFileSync(join(dataDir, filename), 'utf-8');
  return JSON.parse(raw);
}

// ── Suite 1 — philosophie_ethique_existentielle (v31.5.1) ──────────────────

describe('KB philosophie_ethique_existentielle (v31.5.1)', () => {
  const kb = loadKb('philosophie_ethique_existentielle.json') as Record<string, unknown>;

  it('version correcte v31.5.1', () => {
    expect(kb.version).toBe('v31.5.1');
  });

  it('category correcte', () => {
    expect(kb.category).toBe('philosophie_ethique_existentielle');
  });

  it('au moins 47 retrieval_triggers', () => {
    expect(Array.isArray(kb.retrieval_triggers)).toBe(true);
    expect((kb.retrieval_triggers as unknown[]).length).toBeGreaterThanOrEqual(47);
  });

  it('au moins 7 sections', () => {
    const sections = kb.sections as Record<string, unknown>;
    expect(typeof sections).toBe('object');
    expect(Object.keys(sections).length).toBeGreaterThanOrEqual(7);
  });

  it('section existentialisme_sartre_camus présente avec Sartre et Camus', () => {
    const sections = kb.sections as Record<string, unknown>;
    const s = JSON.stringify(sections.existentialisme_sartre_camus);
    expect(s).toMatch(/[Ss]artre/);
    expect(s).toMatch(/[Cc]amus/);
    expect(s).toMatch(/[Ll]ibert/);
    expect(s).toMatch(/[Aa]bsurde/);
  });

  it('Heidegger et authenticite dans existentialisme', () => {
    const sections = kb.sections as Record<string, unknown>;
    const s = JSON.stringify(sections.existentialisme_sartre_camus);
    expect(s).toMatch(/[Hh]eidegger/);
    expect(s).toMatch(/[Aa]uthenticit/);
  });

  it('section frankl_logotherapie avec volonte de sens', () => {
    const sections = kb.sections as Record<string, unknown>;
    const s = JSON.stringify(sections.frankl_logotherapie);
    expect(s).toMatch(/[Ff]rankl/);
    expect(s).toMatch(/[Ss]ens/);
    expect(s).toMatch(/[Ll]ogoth/);
  });

  it('intention paradoxale et dereflexion dans frankl', () => {
    const sections = kb.sections as Record<string, unknown>;
    const s = JSON.stringify(sections.frankl_logotherapie);
    expect(s).toMatch(/[Pp]aradox/);
    expect(s).toMatch(/[Dd][ée]r[ée]flex/);
  });

  it('Kant et imperatif categorique dans ethique_classique', () => {
    const sections = kb.sections as Record<string, unknown>;
    const s = JSON.stringify(sections.ethique_classique);
    expect(s).toMatch(/[Kk]ant/);
    expect(s).toMatch(/[Cc]at[ée]gorique/);
  });

  it('utilitarisme Bentham et Mill dans ethique_classique', () => {
    const sections = kb.sections as Record<string, unknown>;
    const s = JSON.stringify(sections.ethique_classique);
    expect(s).toMatch(/[Bb]entham/);
    expect(s).toMatch(/[Mm]ill/);
    expect(s).toMatch(/[Uu]tilitar/);
  });

  it('Aristote eudaimonia et phronesis dans ethique_classique', () => {
    const sections = kb.sections as Record<string, unknown>;
    const s = JSON.stringify(sections.ethique_classique);
    expect(s).toMatch(/[Aa]ristote/);
    expect(s).toMatch(/[Ee]udaimonia|eudaimonie/);
  });

  it('ethique du care Gilligan ou Noddings dans ethique_classique', () => {
    const sections = kb.sections as Record<string, unknown>;
    const s = JSON.stringify(sections.ethique_classique);
    expect(s).toMatch(/[Gg]illigan|[Nn]oddings/);
    expect(s).toMatch(/[Cc]are/);
  });

  it('stoicisme avec Epictete et dichotomie controle', () => {
    const sections = kb.sections as Record<string, unknown>;
    const s = JSON.stringify(sections.stoicisme_applique);
    expect(s).toMatch(/[Ss]to[iï]c/);
    expect(s).toMatch(/[EÉeé]pict/);
    expect(s).toMatch(/[Cc]ontr[oô]le/);
  });

  it('Marc Aurele et Seneque dans stoicisme', () => {
    const sections = kb.sections as Record<string, unknown>;
    const s = JSON.stringify(sections.stoicisme_applique);
    expect(s).toMatch(/[Mm]arc [Aa]ur[eè]le/);
    expect(s).toMatch(/[Ss][eé]n[eè]que/);
  });

  it('bouddhisme avec dukkha et impermanence', () => {
    const sections = kb.sections as Record<string, unknown>;
    const s = JSON.stringify(sections.philosophie_bouddhiste);
    expect(s).toMatch(/[Bb]ouddh/);
    expect(s).toMatch(/[Dd]ukkha/);
    expect(s).toMatch(/[Ii]mpermanence/);
  });

  it('compassion et pleine conscience dans bouddhisme', () => {
    const sections = kb.sections as Record<string, unknown>;
    const s = JSON.stringify(sections.philosophie_bouddhiste);
    expect(s).toMatch(/[Cc]ompassion/);
    expect(s).toMatch(/[Cc]onscience|[Mm]indf/);
  });

  it('Nietzsche et mort de Dieu dans nietzsche_volonte', () => {
    const sections = kb.sections as Record<string, unknown>;
    const s = JSON.stringify(sections.nietzsche_volonte);
    expect(s).toMatch(/[Nn]ietzsche/);
    expect(s).toMatch(/[Mm]ort de [Dd]ieu|mort-de-dieu/);
  });

  it('volonte de puissance et eternel retour dans nietzsche', () => {
    const sections = kb.sections as Record<string, unknown>;
    const s = JSON.stringify(sections.nietzsche_volonte);
    expect(s).toMatch(/[Pp]uissance/);
    expect(s).toMatch(/[Ee]ternel retour|[Éé]ternel retour/);
  });

  it('Beauchamp et Childress dans bioethique_clinique', () => {
    const sections = kb.sections as Record<string, unknown>;
    const s = JSON.stringify(sections.bioethique_clinique);
    expect(s).toMatch(/[Bb]eaucha/);
    expect(s).toMatch(/[Cc]hildress/);
  });

  it('quatre principes bioethique dans bioethique_clinique', () => {
    const sections = kb.sections as Record<string, unknown>;
    const s = JSON.stringify(sections.bioethique_clinique);
    expect(s).toMatch(/[Pp]rincipe/);
    expect(s).toMatch(/[Bb]io[eé]thique|biothique/);
  });

  it('description non vide', () => {
    const desc = kb.description as string;
    expect(typeof desc).toBe('string');
    expect(desc.length).toBeGreaterThan(50);
  });

  it('last_updated renseigne', () => {
    expect(typeof kb.last_updated).toBe('string');
    expect((kb.last_updated as string).length).toBeGreaterThan(0);
  });
});

// ── Suite 2 — relations_humaines_groupes_sociaux (v31.5.2) ─────────────────

describe('KB relations_humaines_groupes_sociaux (v31.5.2)', () => {
  const kb = loadKb('relations_humaines_groupes_sociaux.json') as Record<string, unknown>;

  it('version correcte v31.5.2', () => {
    expect(kb.version).toBe('v31.5.2');
  });

  it('category correcte', () => {
    expect(kb.category).toBe('relations_humaines_groupes_sociaux');
  });

  it('au moins 47 retrieval_triggers', () => {
    expect(Array.isArray(kb.retrieval_triggers)).toBe(true);
    expect((kb.retrieval_triggers as unknown[]).length).toBeGreaterThanOrEqual(47);
  });

  it('au moins 7 sections', () => {
    const sections = kb.sections as Record<string, unknown>;
    expect(typeof sections).toBe('object');
    expect(Object.keys(sections).length).toBeGreaterThanOrEqual(7);
  });

  it('Asch et conformite dans influence_sociale_classique', () => {
    const sections = kb.sections as Record<string, unknown>;
    const s = JSON.stringify(sections.influence_sociale_classique);
    expect(s).toMatch(/[Aa]sch/);
    expect(s).toMatch(/[Cc]onfomit|[Cc]onformit/);
  });

  it('influence normative et informationnelle dans influence_sociale', () => {
    const sections = kb.sections as Record<string, unknown>;
    const s = JSON.stringify(sections.influence_sociale_classique);
    expect(s).toMatch(/[Nn]ormati/);
    expect(s).toMatch(/[Ii]nformati/);
  });

  it('Milgram et obeissance dans influence_sociale_classique', () => {
    const sections = kb.sections as Record<string, unknown>;
    const s = JSON.stringify(sections.influence_sociale_classique);
    expect(s).toMatch(/[Mm]ilgram/);
    expect(s).toMatch(/[Oo]b[eé]issance/);
  });

  it('banalite du mal dans influence_sociale_classique', () => {
    const sections = kb.sections as Record<string, unknown>;
    const s = JSON.stringify(sections.influence_sociale_classique);
    expect(s).toMatch(/[Bb]analit/);
  });

  it('bystander effect et Darley Latane dans influence_sociale', () => {
    const sections = kb.sections as Record<string, unknown>;
    const s = JSON.stringify(sections.influence_sociale_classique);
    expect(s).toMatch(/[Bb]ystander/);
    expect(s).toMatch(/[Dd]arley/);
    expect(s).toMatch(/[Ll]atan/);
  });

  it('diffusion responsabilite dans bystander', () => {
    const sections = kb.sections as Record<string, unknown>;
    const s = JSON.stringify(sections.influence_sociale_classique);
    expect(s).toMatch(/[Dd]iffusion/);
    expect(s).toMatch(/[Rr]esponsabilit/);
  });

  it('Festinger et dissonance cognitive dans cognition_sociale_biais', () => {
    const sections = kb.sections as Record<string, unknown>;
    const s = JSON.stringify(sections.cognition_sociale_biais);
    expect(s).toMatch(/[Ff]estinger/);
    expect(s).toMatch(/[Dd]issonance/);
  });

  it('Ross et erreur fondamentale attribution dans cognition_sociale', () => {
    const sections = kb.sections as Record<string, unknown>;
    const s = JSON.stringify(sections.cognition_sociale_biais);
    expect(s).toMatch(/[Rr]oss/);
    expect(s).toMatch(/[Ff]ondamental/);
    expect(s).toMatch(/[Aa]ttribut/);
  });

  it('Weiner et 3 dimensions attribution dans cognition_sociale', () => {
    const sections = kb.sections as Record<string, unknown>;
    const s = JSON.stringify(sections.cognition_sociale_biais);
    expect(s).toMatch(/[Ww]einer/);
  });

  it('Tajfel Turner et identite sociale dans identite_sociale_intergroupe', () => {
    const sections = kb.sections as Record<string, unknown>;
    const s = JSON.stringify(sections.identite_sociale_intergroupe);
    expect(s).toMatch(/[Tt]ajfel/);
    expect(s).toMatch(/[Tt]urner/);
    expect(s).toMatch(/[Ii]dentit/);
  });

  it('favoritisme intragroupe dans identite_sociale', () => {
    const sections = kb.sections as Record<string, unknown>;
    const s = JSON.stringify(sections.identite_sociale_intergroupe);
    expect(s).toMatch(/[Ff]avoritism/);
    expect(s).toMatch(/[Ii]ntragroupe/);
  });

  it('Allport et hypothese contact dans identite_sociale_intergroupe', () => {
    const sections = kb.sections as Record<string, unknown>;
    const s = JSON.stringify(sections.identite_sociale_intergroupe);
    expect(s).toMatch(/[Aa]llport/);
    expect(s).toMatch(/[Cc]ontact/);
  });

  it('menace du stereotype Steele dans identite_sociale', () => {
    const sections = kb.sections as Record<string, unknown>;
    const s = JSON.stringify(sections.identite_sociale_intergroupe);
    expect(s).toMatch(/[Ss]teele/);
    expect(s).toMatch(/[Ss]t[eé]r[eé]otype/);
  });

  it('pensee de groupe Janis dans dynamiques_de_groupe', () => {
    const sections = kb.sections as Record<string, unknown>;
    const s = JSON.stringify(sections.dynamiques_de_groupe);
    expect(s).toMatch(/[Jj]anis/);
    expect(s).toMatch(/[Gg]roupthink|pens[eé]e de groupe/);
  });

  it('Zajonc et facilitation sociale dans dynamiques_de_groupe', () => {
    const sections = kb.sections as Record<string, unknown>;
    const s = JSON.stringify(sections.dynamiques_de_groupe);
    expect(s).toMatch(/[Zz]ajonc/);
    expect(s).toMatch(/[Ff]acilitation/);
  });

  it('Cialdini dans influence_persuasion_manipulation', () => {
    const sections = kb.sections as Record<string, unknown>;
    const s = JSON.stringify(sections.influence_persuasion_manipulation);
    expect(s).toMatch(/[Cc]ialdini/);
  });

  it('6 principes Cialdini dont reciprocite et rarete', () => {
    const sections = kb.sections as Record<string, unknown>;
    const s = JSON.stringify(sections.influence_persuasion_manipulation);
    expect(s).toMatch(/[Rr][eé]ciprocit/);
    expect(s).toMatch(/[Rr]aret/);
    expect(s).toMatch(/[Aa]utorit/);
  });

  it('engagement et preuve sociale dans Cialdini', () => {
    const sections = kb.sections as Record<string, unknown>;
    const s = JSON.stringify(sections.influence_persuasion_manipulation);
    expect(s).toMatch(/[Ee]ngagement/);
    expect(s).toMatch(/[Pp]reuve.sociale/);
  });

  it('Salovey Mayer et IE 4 branches dans intelligence_emotionnelle', () => {
    const sections = kb.sections as Record<string, unknown>;
    const s = JSON.stringify(sections.intelligence_emotionnelle_empathie);
    expect(s).toMatch(/[Ss]alovey/);
    expect(s).toMatch(/[Mm]ayer/);
  });

  it('Goleman et empathie dans intelligence_emotionnelle', () => {
    const sections = kb.sections as Record<string, unknown>;
    const s = JSON.stringify(sections.intelligence_emotionnelle_empathie);
    expect(s).toMatch(/[Gg]oleman/);
    expect(s).toMatch(/[Ee]mpathie/);
  });

  it('CNV ou communication non-violente Rogers dans intelligence_emotionnelle', () => {
    const sections = kb.sections as Record<string, unknown>;
    const s = JSON.stringify(sections.intelligence_emotionnelle_empathie);
    expect(s).toMatch(/[Cc]ommunication/);
    expect(s).toMatch(/[Rr]ogers/);
  });

  it('soutien social et buffer hypothesis dans reseaux_solitude_soutien', () => {
    const sections = kb.sections as Record<string, unknown>;
    const s = JSON.stringify(sections.reseaux_solitude_soutien);
    expect(s).toMatch(/[Ss]outien social/);
    expect(s).toMatch(/[Bb]uffer/);
  });

  it('Cacioppo et solitude douleur sociale dans reseaux_solitude', () => {
    const sections = kb.sections as Record<string, unknown>;
    const s = JSON.stringify(sections.reseaux_solitude_soutien);
    expect(s).toMatch(/[Cc]acioppo/);
    expect(s).toMatch(/[Ss]olitude/);
  });

  it('Hazan Shaver attachement adulte dans reseaux_solitude_soutien', () => {
    const sections = kb.sections as Record<string, unknown>;
    const s = JSON.stringify(sections.reseaux_solitude_soutien);
    expect(s).toMatch(/[Hh]azan/);
    expect(s).toMatch(/[Ss]haver/);
    expect(s).toMatch(/[Aa]ttachement/);
  });

  it('description non vide', () => {
    const desc = kb.description as string;
    expect(typeof desc).toBe('string');
    expect(desc.length).toBeGreaterThan(50);
  });

  it('last_updated renseigne', () => {
    expect(typeof kb.last_updated).toBe('string');
    expect((kb.last_updated as string).length).toBeGreaterThan(0);
  });
});
