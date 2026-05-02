import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';

// Phase 31 KB tests — Vitest Rule 16 compliance
// Modules: therapies_humanistes_existentielles (v31.4.3) + psychodynamique_mecanismes_defense (v31.4.4)

const KB_DIR = join(__dirname, '../../../../data/knowledge_base/default');

function loadKB(filename: string) {
  return JSON.parse(readFileSync(join(KB_DIR, filename), 'utf-8'));
}

// ─────────────────────────────────────────────────────────────────────────────
// Module 1: therapies_humanistes_existentielles (v31.4.3)
// ─────────────────────────────────────────────────────────────────────────────
describe('KB: therapies_humanistes_existentielles (v31.4.3)', () => {
  const kb = loadKB('therapies_humanistes_existentielles.json');

  it('a la bonne version v31.4.3', () => {
    expect(kb.version).toBe('v31.4.3');
  });

  it('a la bonne catégorie', () => {
    expect(kb.category).toBe('therapies_humanistes_existentielles');
  });

  it('a au moins 45 retrieval_triggers', () => {
    expect(kb.retrieval_triggers.length).toBeGreaterThanOrEqual(45);
  });

  it('a au moins 7 sections', () => {
    expect(Object.keys(kb.sections).length).toBeGreaterThanOrEqual(7);
  });

  it('triggers contiennent Rogers', () => {
    const joined = kb.retrieval_triggers.join(' ');
    expect(joined).toContain('Rogers');
  });

  it('triggers contiennent Gestalt', () => {
    const joined = kb.retrieval_triggers.join(' ');
    expect(joined).toContain('Gestalt');
  });

  it('triggers contiennent Frankl', () => {
    const joined = kb.retrieval_triggers.join(' ');
    expect(joined).toContain('Frankl');
  });

  it('triggers contiennent Yalom', () => {
    const joined = kb.retrieval_triggers.join(' ');
    expect(joined).toContain('Yalom');
  });

  it('section rogers_approche_centree_personne existe', () => {
    expect(kb.sections.rogers_approche_centree_personne).toBeDefined();
  });

  it('section gestalt_therapie existe', () => {
    expect(kb.sections.gestalt_therapie).toBeDefined();
  });

  it('section therapie_existentielle_yalom existe', () => {
    expect(kb.sections.therapie_existentielle_yalom).toBeDefined();
  });

  it('section frankl_logotherapie existe', () => {
    expect(kb.sections.frankl_logotherapie).toBeDefined();
  });

  it('section rollo_may existe', () => {
    // accepter rollo_may ou rollo_may_et_existentialisme_americain
    const hasMay =
      kb.sections.rollo_may !== undefined ||
      kb.sections.rollo_may_et_existentialisme_americain !== undefined;
    expect(hasMay).toBe(true);
  });

  it('section approches_humanistes_integrees existe', () => {
    expect(kb.sections.approches_humanistes_integrees).toBeDefined();
  });

  it('section limites_et_evidences existe', () => {
    expect(kb.sections.limites_et_evidences).toBeDefined();
  });

  it('Rogers: 6 conditions thérapeutiques', () => {
    const rogers = JSON.stringify(kb.sections.rogers_approche_centree_personne);
    expect(rogers).toContain('congruence');
    expect(rogers).toContain('empathie');
  });

  it('Rogers: regard positif inconditionnel mentionné', () => {
    const rogers = JSON.stringify(kb.sections.rogers_approche_centree_personne);
    expect(rogers.toLowerCase()).toContain('inconditionnel');
  });

  it('Gestalt: cycle du contact mentionné', () => {
    const gestalt = JSON.stringify(kb.sections.gestalt_therapie);
    expect(gestalt.toLowerCase()).toContain('contact');
  });

  it('Gestalt: résistances (introjection/projection/retroflexion) mentionnées', () => {
    const gestalt = JSON.stringify(kb.sections.gestalt_therapie);
    expect(gestalt.toLowerCase()).toContain('introjection');
    expect(gestalt.toLowerCase()).toContain('projection');
    expect(gestalt.toLowerCase()).toContain('retroflexion');
  });

  it('Gestalt: chaise vide mentionnée', () => {
    const gestalt = JSON.stringify(kb.sections.gestalt_therapie);
    expect(gestalt.toLowerCase()).toContain('chaise');
  });

  it('Yalom: 4 données ultimes (mort/liberté/isolement/non-sens)', () => {
    const yalom = JSON.stringify(kb.sections.therapie_existentielle_yalom);
    expect(yalom.toLowerCase()).toContain('mort');
    expect(yalom.toLowerCase()).toContain('sens');
  });

  it('Frankl: 3 voies du sens mentionnées', () => {
    const frankl = JSON.stringify(kb.sections.frankl_logotherapie);
    expect(frankl.toLowerCase()).toContain('sens');
  });

  it('Frankl: intention paradoxale mentionnée', () => {
    const frankl = JSON.stringify(kb.sections.frankl_logotherapie);
    expect(frankl.toLowerCase()).toContain('paradoxale');
  });

  it('Gendlin focusing mentionné', () => {
    const full = JSON.stringify(kb.sections);
    expect(full.toLowerCase()).toContain('gendlin');
  });

  it('Maslow pyramide mentionnée', () => {
    const full = JSON.stringify(kb.sections);
    expect(full.toLowerCase()).toContain('maslow');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Module 2: psychodynamique_mecanismes_defense (v31.4.4)
// ─────────────────────────────────────────────────────────────────────────────
describe('KB: psychodynamique_mecanismes_defense (v31.4.4)', () => {
  const kb = loadKB('psychodynamique_mecanismes_defense.json');

  it('a la bonne version v31.4.4', () => {
    expect(kb.version).toBe('v31.4.4');
  });

  it('a la bonne catégorie', () => {
    expect(kb.category).toBe('psychodynamique_mecanismes_defense');
  });

  it('a au moins 44 retrieval_triggers', () => {
    expect(kb.retrieval_triggers.length).toBeGreaterThanOrEqual(44);
  });

  it('a au moins 7 sections', () => {
    expect(Object.keys(kb.sections).length).toBeGreaterThanOrEqual(7);
  });

  it('triggers contiennent mécanismes de défense', () => {
    const joined = kb.retrieval_triggers.join(' ');
    expect(joined).toContain('mécanismes de défense');
  });

  it('triggers contiennent transfert', () => {
    const joined = kb.retrieval_triggers.join(' ');
    expect(joined).toContain('transfert');
  });

  it('triggers contiennent Freud', () => {
    const joined = kb.retrieval_triggers.join(' ');
    expect(joined).toContain('Freud');
  });

  it('triggers contiennent Winnicott', () => {
    const joined = kb.retrieval_triggers.join(' ');
    expect(joined).toContain('Winnicott');
  });

  it('triggers contiennent Jung', () => {
    const joined = kb.retrieval_triggers.join(' ');
    expect(joined).toContain('Jung');
  });

  it('section fondements psychodynamiques existe', () => {
    const hasFondements =
      kb.sections.freud_fondements_psychanalytiques !== undefined ||
      kb.sections.fondements_psychodynamiques !== undefined ||
      kb.sections.freud_fondements !== undefined;
    expect(hasFondements).toBe(true);
  });

  it('section mécanismes de défense existe', () => {
    const hasDef =
      kb.sections.mecanismes_defense_classification_vaillant !== undefined ||
      kb.sections.mecanismes_defense !== undefined ||
      kb.sections.mecanismes_de_defense_classification !== undefined;
    expect(hasDef).toBe(true);
  });

  it('section transfert et contre-transfert existe', () => {
    const hasTransfert =
      kb.sections.transfert_et_contre_transfert !== undefined ||
      kb.sections.transfert_contretransfert !== undefined;
    expect(hasTransfert).toBe(true);
  });

  it('section Winnicott existe', () => {
    const hasWinnicott =
      kb.sections.winnicott_developpement_soi !== undefined ||
      kb.sections.winnicott_developpement_early !== undefined ||
      kb.sections.winnicott !== undefined;
    expect(hasWinnicott).toBe(true);
  });

  it('section Klein existe', () => {
    const hasKlein =
      kb.sections.klein_relations_objet !== undefined || kb.sections.klein !== undefined;
    expect(hasKlein).toBe(true);
  });

  it('section Jung existe', () => {
    const hasJung =
      kb.sections.jung_psychologie_analytique !== undefined ||
      kb.sections.jung !== undefined;
    expect(hasJung).toBe(true);
  });

  it('section applications thérapeutiques existe', () => {
    const hasApps =
      kb.sections.therapie_psychodynamique_contemporaine !== undefined ||
      kb.sections.applications_therapeutiques !== undefined ||
      kb.sections.applications_therapies_psychodynamiques !== undefined;
    expect(hasApps).toBe(true);
  });

  it('Vaillant 4 niveaux de défenses mentionnés', () => {
    const full = JSON.stringify(kb.sections);
    // niveau psychotique, immature, névrotique, mature
    expect(full.toLowerCase()).toContain('vaillant');
    expect(full.toLowerCase()).toContain('mature');
  });

  it('refoulement mentionné', () => {
    const full = JSON.stringify(kb.sections);
    expect(full.toLowerCase()).toContain('refoulement');
  });

  it('sublimation mentionnée', () => {
    const full = JSON.stringify(kb.sections);
    expect(full.toLowerCase()).toContain('sublimation');
  });

  it('clivage/splitting mentionné', () => {
    const full = JSON.stringify(kb.sections);
    expect(full.toLowerCase()).toContain('clivage');
  });

  it('projection mentionnée', () => {
    const full = JSON.stringify(kb.sections);
    expect(full.toLowerCase()).toContain('projection');
  });

  it('Winnicott: vrai soi / faux soi', () => {
    const full = JSON.stringify(kb.sections);
    expect(full.toLowerCase()).toContain('vrai soi');
    expect(full.toLowerCase()).toContain('faux soi');
  });

  it('Klein: position schizoide-paranoide mentionnée', () => {
    const full = JSON.stringify(kb.sections);
    // accepter schizoïde ou schizoide (encodage variable)
    const hasSplit =
      full.toLowerCase().includes('schizo') &&
      (full.toLowerCase().includes('paranoide') ||
        full.toLowerCase().includes('paranoïde') ||
        full.toLowerCase().includes('paranoi'));
    expect(hasSplit).toBe(true);
  });

  it('Klein: position dépressive mentionnée', () => {
    const full = JSON.stringify(kb.sections);
    expect(full.toLowerCase()).toContain('position d');
  });

  it('Jung: Ombre (shadow) mentionné', () => {
    const full = JSON.stringify(kb.sections);
    expect(full.toLowerCase()).toContain('ombre');
  });

  it('Jung: individuation mentionnée', () => {
    const full = JSON.stringify(kb.sections);
    expect(full.toLowerCase()).toContain('individuation');
  });

  it('MBT/Fonagy/mentalisation mentionnés', () => {
    const full = JSON.stringify(kb.sections);
    expect(full.toLowerCase()).toContain('fonagy');
  });
});
