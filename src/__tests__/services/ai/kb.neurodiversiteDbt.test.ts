import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';

const ROOT = join(__dirname, '../../../../data/knowledge_base/default');

function loadKB(filename: string): Record<string, unknown> {
  const raw = readFileSync(join(ROOT, filename), 'utf-8');
  return JSON.parse(raw);
}

// ── Phase 30 KB Module 1: Neurodiversité (v31.4.1) ────────────────────────

describe('KB neurodiversite_adhd_autisme_hpi (v31.4.1)', () => {
  const kb = loadKB('neurodiversite_adhd_autisme_hpi.json');

  it('has correct version v31.4.1', () => {
    expect(kb.version).toBe('v31.4.1');
  });

  it('has correct category', () => {
    expect(kb.category).toBe('neurodiversite_adhd_autisme_hpi');
  });

  it('has at least 45 retrieval_triggers', () => {
    expect(Array.isArray(kb.retrieval_triggers)).toBe(true);
    expect((kb.retrieval_triggers as string[]).length).toBeGreaterThanOrEqual(45);
  });

  it('retrieval_triggers contain TDAH / ADHD', () => {
    const triggers = kb.retrieval_triggers as string[];
    const hasAdhd = triggers.some(
      t => t.toLowerCase().includes('tdah') || t.toLowerCase().includes('adhd')
    );
    expect(hasAdhd).toBe(true);
  });

  it('retrieval_triggers contain autisme', () => {
    const triggers = kb.retrieval_triggers as string[];
    expect(triggers.some(t => t.toLowerCase().includes('autisme'))).toBe(true);
  });

  it('retrieval_triggers contain HPI', () => {
    const triggers = kb.retrieval_triggers as string[];
    expect(triggers.some(t => t.toLowerCase().includes('hpi'))).toBe(true);
  });

  it('has at least 7 sections', () => {
    const sections = kb.sections as Record<string, unknown>;
    expect(Object.keys(sections).length).toBeGreaterThanOrEqual(7);
  });

  it('has section adhd_neurobiologie_et_presentation', () => {
    const sections = kb.sections as Record<string, unknown>;
    expect(sections).toHaveProperty('adhd_neurobiologie_et_presentation');
  });

  it('has section strategies_compensatoires_adhd', () => {
    const sections = kb.sections as Record<string, unknown>;
    expect(sections).toHaveProperty('strategies_compensatoires_adhd');
  });

  it('has section autisme_spectre_adulte', () => {
    const sections = kb.sections as Record<string, unknown>;
    expect(sections).toHaveProperty('autisme_spectre_adulte');
  });

  it('has section haut_potentiel_intellectuel_hpi', () => {
    const sections = kb.sections as Record<string, unknown>;
    expect(sections).toHaveProperty('haut_potentiel_intellectuel_hpi');
  });

  it('has section cooccurrences_et_diagnostic_differentiel', () => {
    const sections = kb.sections as Record<string, unknown>;
    expect(sections).toHaveProperty('cooccurrences_et_diagnostic_differentiel');
  });

  it('has section identite_et_communaute_neurodivergente', () => {
    const sections = kb.sections as Record<string, unknown>;
    expect(sections).toHaveProperty('identite_et_communaute_neurodivergente');
  });

  it('has section ressources_et_outils_pratiques', () => {
    const sections = kb.sections as Record<string, unknown>;
    expect(sections).toHaveProperty('ressources_et_outils_pratiques');
  });

  it('ADHD section defines Rejection Sensitive Dysphoria (RSD)', () => {
    const sections = kb.sections as Record<string, unknown>;
    const adhd = JSON.stringify(sections['adhd_neurobiologie_et_presentation']);
    expect(adhd.toLowerCase()).toMatch(/rsd|rejection.*sensitive|dysphorie/i);
  });

  it('ADHD section defines hyperfocus', () => {
    const sections = kb.sections as Record<string, unknown>;
    const adhd = JSON.stringify(sections['adhd_neurobiologie_et_presentation']);
    expect(adhd.toLowerCase()).toMatch(/hyperfocus/i);
  });

  it('Autisme section mentions masking', () => {
    const sections = kb.sections as Record<string, unknown>;
    const autisme = JSON.stringify(sections['autisme_spectre_adulte']);
    expect(autisme.toLowerCase()).toMatch(/masking|camouflage/i);
  });

  it('Autisme section mentions burnout autistique', () => {
    const sections = kb.sections as Record<string, unknown>;
    const autisme = JSON.stringify(sections['autisme_spectre_adulte']);
    expect(autisme.toLowerCase()).toMatch(/burnout autistique|autistic burnout/i);
  });

  it('Autisme section mentions stimming', () => {
    const sections = kb.sections as Record<string, unknown>;
    const autisme = JSON.stringify(sections['autisme_spectre_adulte']);
    expect(autisme.toLowerCase()).toMatch(/stimming|autostimulation/i);
  });

  it('HPI section mentions Dabrowski and 5 surexcitabilites', () => {
    const sections = kb.sections as Record<string, unknown>;
    const hpi = JSON.stringify(sections['haut_potentiel_intellectuel_hpi']);
    expect(hpi.toLowerCase()).toMatch(/dabrowski/i);
    expect(hpi).toMatch(/5/);
  });

  it('HPI section mentions pensee en arborescence', () => {
    const sections = kb.sections as Record<string, unknown>;
    const hpi = JSON.stringify(sections['haut_potentiel_intellectuel_hpi']);
    expect(hpi.toLowerCase()).toMatch(/arborescen/i);
  });

  it('cooccurrences section mentions DIVA-5 for ADHD', () => {
    const sections = kb.sections as Record<string, unknown>;
    const co = JSON.stringify(sections['cooccurrences_et_diagnostic_differentiel']);
    expect(co.toUpperCase()).toMatch(/DIVA/);
  });

  it('cooccurrences section mentions AQ-10 for TSA', () => {
    const sections = kb.sections as Record<string, unknown>;
    const co = JSON.stringify(sections['cooccurrences_et_diagnostic_differentiel']);
    expect(co.toUpperCase()).toMatch(/AQ.?10|AQ10/);
  });

  it('ressources section has France and Quebec resources', () => {
    const sections = kb.sections as Record<string, unknown>;
    const res = JSON.stringify(sections['ressources_et_outils_pratiques']);
    expect(res.toLowerCase()).toMatch(/france|quebec|qu.bec/i);
  });
});

// ── Phase 30 KB Module 2: DBT avancé (v31.4.2) ───────────────────────────

describe('KB emotion_regulation_dbt_advanced (v31.4.2)', () => {
  const kb = loadKB('emotion_regulation_dbt_advanced.json');

  it('has correct version v31.4.2', () => {
    expect(kb.version).toBe('v31.4.2');
  });

  it('has correct category', () => {
    expect(kb.category).toBe('emotion_regulation_dbt_advanced');
  });

  it('has at least 45 retrieval_triggers', () => {
    expect(Array.isArray(kb.retrieval_triggers)).toBe(true);
    expect((kb.retrieval_triggers as string[]).length).toBeGreaterThanOrEqual(45);
  });

  it('retrieval_triggers contain DBT', () => {
    const triggers = kb.retrieval_triggers as string[];
    expect(triggers.some(t => t.toUpperCase().includes('DBT'))).toBe(true);
  });

  it('retrieval_triggers contain distress tolerance', () => {
    const triggers = kb.retrieval_triggers as string[];
    expect(
      triggers.some(
        t => t.toLowerCase().includes('distress') || t.toLowerCase().includes('tolerance')
      )
    ).toBe(true);
  });

  it('retrieval_triggers contain regulation emotionnelle', () => {
    const triggers = kb.retrieval_triggers as string[];
    expect(
      triggers.some(
        t => t.toLowerCase().includes('r') && t.toLowerCase().includes('gulation')
      )
    ).toBe(true);
  });

  it('has at least 7 sections', () => {
    const sections = kb.sections as Record<string, unknown>;
    expect(Object.keys(sections).length).toBeGreaterThanOrEqual(7);
  });

  it('has section fondements_dbt_linehan', () => {
    const sections = kb.sections as Record<string, unknown>;
    expect(sections).toHaveProperty('fondements_dbt_linehan');
  });

  it('has section distress_tolerance_survie_crise', () => {
    const sections = kb.sections as Record<string, unknown>;
    expect(sections).toHaveProperty('distress_tolerance_survie_crise');
  });

  it('has section emotion_regulation_skills', () => {
    const sections = kb.sections as Record<string, unknown>;
    expect(sections).toHaveProperty('emotion_regulation_skills');
  });

  it('has section interpersonal_effectiveness', () => {
    const sections = kb.sections as Record<string, unknown>;
    expect(sections).toHaveProperty('interpersonal_effectiveness');
  });

  it('has section colere_clinique', () => {
    const sections = kb.sections as Record<string, unknown>;
    expect(sections).toHaveProperty('colere_clinique');
  });

  it('has section honte_et_culpabilite', () => {
    const sections = kb.sections as Record<string, unknown>;
    expect(sections).toHaveProperty('honte_et_culpabilite');
  });

  it('distress_tolerance section defines TIPP technique', () => {
    const sections = kb.sections as Record<string, unknown>;
    const dt = JSON.stringify(sections['distress_tolerance_survie_crise']);
    expect(dt.toUpperCase()).toMatch(/TIPP/);
  });

  it('distress_tolerance section defines ACCEPTS technique', () => {
    const sections = kb.sections as Record<string, unknown>;
    const dt = JSON.stringify(sections['distress_tolerance_survie_crise']);
    expect(dt.toUpperCase()).toMatch(/ACCEPTS/);
  });

  it('distress_tolerance section defines IMPROVE technique', () => {
    const sections = kb.sections as Record<string, unknown>;
    const dt = JSON.stringify(sections['distress_tolerance_survie_crise']);
    expect(dt.toUpperCase()).toMatch(/IMPROVE/);
  });

  it('distress_tolerance section defines radical acceptance', () => {
    const sections = kb.sections as Record<string, unknown>;
    const dt = JSON.stringify(sections['distress_tolerance_survie_crise']);
    expect(dt.toLowerCase()).toMatch(/radical.accept|acceptation.radicale/i);
  });

  it('emotion_regulation section defines opposite action', () => {
    const sections = kb.sections as Record<string, unknown>;
    const er = JSON.stringify(sections['emotion_regulation_skills']);
    expect(er.toLowerCase()).toMatch(/opposite.action|action.oppos/i);
  });

  it('emotion_regulation section defines PLEASE skills', () => {
    const sections = kb.sections as Record<string, unknown>;
    const er = JSON.stringify(sections['emotion_regulation_skills']);
    expect(er.toUpperCase()).toMatch(/PLEASE/);
  });

  it('interpersonal section defines DEAR MAN', () => {
    const sections = kb.sections as Record<string, unknown>;
    const inter = JSON.stringify(sections['interpersonal_effectiveness']);
    expect(inter.toUpperCase()).toMatch(/DEAR.?MAN/);
  });

  it('interpersonal section defines validation 6 niveaux Linehan', () => {
    const sections = kb.sections as Record<string, unknown>;
    const inter = JSON.stringify(sections['interpersonal_effectiveness']);
    expect(inter.toLowerCase()).toMatch(/6.*niveau|niveau.*6|validation_6/i);
  });

  it('interpersonal section defines GIVE and FAST', () => {
    const sections = kb.sections as Record<string, unknown>;
    const inter = JSON.stringify(sections['interpersonal_effectiveness']);
    expect(inter.toUpperCase()).toMatch(/GIVE/);
    expect(inter.toUpperCase()).toMatch(/FAST/);
  });

  it('colere section defines STOPP technique', () => {
    const sections = kb.sections as Record<string, unknown>;
    const colere = JSON.stringify(sections['colere_clinique']);
    expect(colere.toUpperCase()).toMatch(/STOPP/);
  });

  it('honte section distinguishes honte vs culpabilite', () => {
    const sections = kb.sections as Record<string, unknown>;
    const honte = JSON.stringify(sections['honte_et_culpabilite']);
    expect(honte.toLowerCase()).toMatch(/honte/i);
    expect(honte.toLowerCase()).toMatch(/culpabilit/i);
  });

  it('honte section mentions Brene Brown or spirale honte', () => {
    const sections = kb.sections as Record<string, unknown>;
    const honte = JSON.stringify(sections['honte_et_culpabilite']);
    expect(honte.toLowerCase()).toMatch(/bren..*brown|spirale.*honte|honte.*spirale/i);
  });

  it('fondements section defines biosocial theory', () => {
    const sections = kb.sections as Record<string, unknown>;
    const fond = JSON.stringify(sections['fondements_dbt_linehan']);
    expect(fond.toLowerCase()).toMatch(/biosocial/i);
  });

  it('fondements section defines 4 DBT modules', () => {
    const sections = kb.sections as Record<string, unknown>;
    const fond = JSON.stringify(sections['fondements_dbt_linehan']);
    expect(fond.toLowerCase()).toMatch(/4.*module|mindfulness|distress/i);
  });
});
