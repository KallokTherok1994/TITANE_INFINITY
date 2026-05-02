/**
 * Tests KB Phase 41:
 * - spiritualite_sens_existentiel (v31.6.1)
 * - neurosciences_cliniques_avancees (v31.6.2)
 *
 * Rule 16 — generated in same commit as KB modules.
 */
import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

// ── helpers ──────────────────────────────────────────────────────────────────

const KB_DIR = path.resolve(__dirname, '../../../../data/knowledge_base/default');

function loadJson(name: string): Record<string, unknown> {
  const p = path.join(KB_DIR, `${name}.json`);
  return JSON.parse(fs.readFileSync(p, 'utf-8'));
}

function text(obj: unknown): string {
  return JSON.stringify(obj);
}

type KBModule = {
  version: string;
  category: string;
  description: string;
  retrieval_triggers: string[];
  sections: Record<string, unknown>;
};

function kb(name: string): KBModule {
  return loadJson(name) as KBModule;
}

// ═══════════════════════════════════════════════════════════════════════════
// spiritualite_sens_existentiel — v31.6.1
// ═══════════════════════════════════════════════════════════════════════════
describe('KB Phase 41 — spiritualite_sens_existentiel (v31.6.1)', () => {
  const ID = 'spiritualite_sens_existentiel';

  it('loads and parses without error', () => {
    expect(() => kb(ID)).not.toThrow();
  });

  it('has correct version v31.6.1', () => {
    expect(kb(ID).version).toBe('v31.6.1');
  });

  it('has category spiritualite_sens_existentiel', () => {
    expect(kb(ID).category).toBe('spiritualite_sens_existentiel');
  });

  it('has at least 40 retrieval_triggers', () => {
    expect(kb(ID).retrieval_triggers.length).toBeGreaterThanOrEqual(40);
  });

  it('has 7 sections', () => {
    expect(Object.keys(kb(ID).sections).length).toBe(7);
  });

  // Triggers
  it('trigger: spiritualité', () => {
    expect(kb(ID).retrieval_triggers).toContain('spiritualité');
  });
  it('trigger: sens de la vie', () => {
    expect(kb(ID).retrieval_triggers).toContain('sens de la vie');
  });
  it('trigger: logothérapie', () => {
    expect(kb(ID).retrieval_triggers).toContain('logothérapie');
  });
  it('trigger: Frankl', () => {
    expect(kb(ID).retrieval_triggers).toContain('Frankl');
  });
  it('trigger: Jung', () => {
    expect(kb(ID).retrieval_triggers).toContain('Jung');
  });
  it('trigger: archétypes', () => {
    expect(kb(ID).retrieval_triggers).toContain('archétypes');
  });
  it('trigger: inconscient collectif', () => {
    expect(kb(ID).retrieval_triggers).toContain('inconscient collectif');
  });
  it('trigger: individuation', () => {
    expect(kb(ID).retrieval_triggers).toContain('individuation');
  });
  it('trigger: transcendance', () => {
    expect(kb(ID).retrieval_triggers).toContain('transcendance');
  });
  it('trigger: psychologie transpersonnelle', () => {
    expect(kb(ID).retrieval_triggers).toContain('psychologie transpersonnelle');
  });
  it('trigger: stoïcisme ou méditation contemplative', () => {
    expect(text(kb(ID).retrieval_triggers)).toMatch(
      /sto.cisme|m.ditation contemplative/i
    );
  });
  it('trigger: mort ou finitude', () => {
    expect(text(kb(ID).retrieval_triggers)).toMatch(/mort|finitude/i);
  });
  it('trigger: bouddhisme', () => {
    expect(kb(ID).retrieval_triggers).toContain('bouddhisme');
  });

  // Sections
  it('section: logotherapie_frankl', () => {
    expect(kb(ID).sections).toHaveProperty('logotherapie_frankl');
  });
  it('section: psychologie_profonde_jung', () => {
    expect(kb(ID).sections).toHaveProperty('psychologie_profonde_jung');
  });
  it('section: maslow_transcendance', () => {
    expect(kb(ID).sections).toHaveProperty('maslow_transcendance');
  });
  it('section: philosophie_pratique_stoicisme', () => {
    expect(kb(ID).sections).toHaveProperty('philosophie_pratique_stoicisme');
  });
  it('section: psychologie_transpersonnelle', () => {
    expect(kb(ID).sections).toHaveProperty('psychologie_transpersonnelle');
  });
  it('section: integrations_existentielles', () => {
    expect(kb(ID).sections).toHaveProperty('integrations_existentielles');
  });
  it('section: mort_rituel_deuil_spirituel', () => {
    expect(kb(ID).sections).toHaveProperty('mort_rituel_deuil_spirituel');
  });

  // Content probes
  it('contient Frankl dans sections', () => {
    expect(text(kb(ID).sections)).toMatch(/Frankl/);
  });
  it('contient Jung ou archétype', () => {
    expect(text(kb(ID).sections)).toMatch(/Jung|arch.type/i);
  });
  it('contient Maslow ou actualisation', () => {
    expect(text(kb(ID).sections)).toMatch(/Maslow|actualisation/i);
  });
  it('contient stoïcisme ou Épictète', () => {
    expect(text(kb(ID).sections)).toMatch(/sto.cisme|.pict.te|Marc Aur.le/i);
  });
  it('contient Grof ou Wilber ou transpersonnel', () => {
    expect(text(kb(ID).sections)).toMatch(/Grof|Wilber|transpersonnel/i);
  });
  it('contient mort ou finitude ou Yalom', () => {
    expect(text(kb(ID).sections)).toMatch(/mort|finitude|Yalom/i);
  });
  it('contient bouddhisme ou Kahneman ou pratiques', () => {
    expect(text(kb(ID).sections)).toMatch(/bouddhisme|Vipassana|Mett./i);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// neurosciences_cliniques_avancees — v31.6.2
// ═══════════════════════════════════════════════════════════════════════════
describe('KB Phase 41 — neurosciences_cliniques_avancees (v31.6.2)', () => {
  const ID = 'neurosciences_cliniques_avancees';

  it('loads and parses without error', () => {
    expect(() => kb(ID)).not.toThrow();
  });

  it('has correct version v31.6.2', () => {
    expect(kb(ID).version).toBe('v31.6.2');
  });

  it('has category neurosciences_cliniques_avancees', () => {
    expect(kb(ID).category).toBe('neurosciences_cliniques_avancees');
  });

  it('has at least 35 retrieval_triggers', () => {
    expect(kb(ID).retrieval_triggers.length).toBeGreaterThanOrEqual(35);
  });

  it('has 7 sections', () => {
    expect(Object.keys(kb(ID).sections).length).toBe(7);
  });

  // Triggers
  it('trigger: troubles du sommeil', () => {
    expect(kb(ID).retrieval_triggers).toContain('troubles du sommeil');
  });
  it('trigger: insomnie', () => {
    expect(kb(ID).retrieval_triggers).toContain('insomnie');
  });
  it('trigger: chronobiologie', () => {
    expect(kb(ID).retrieval_triggers).toContain('chronobiologie');
  });
  it('trigger: rythme circadien', () => {
    expect(kb(ID).retrieval_triggers).toContain('rythme circadien');
  });
  it('trigger: mélatonine', () => {
    expect(kb(ID).retrieval_triggers).toContain('mélatonine');
  });
  it('trigger: céphalée', () => {
    expect(kb(ID).retrieval_triggers).toContain('céphalée');
  });
  it('trigger: migraine', () => {
    expect(kb(ID).retrieval_triggers).toContain('migraine');
  });
  it('trigger: vertige', () => {
    expect(kb(ID).retrieval_triggers).toContain('vertige');
  });
  it('trigger: VPPB', () => {
    expect(kb(ID).retrieval_triggers).toContain('VPPB');
  });
  it('trigger: douleur neuropathique ou nociceptive', () => {
    expect(text(kb(ID).retrieval_triggers)).toMatch(/douleur neuropathique|nociceptive/i);
  });
  it('trigger: neuromodulation ou stimulation', () => {
    expect(text(kb(ID).retrieval_triggers)).toMatch(/neuromodulation|stimulation/i);
  });

  // Sections
  it('section: troubles_sommeil_insomnies', () => {
    expect(kb(ID).sections).toHaveProperty('troubles_sommeil_insomnies');
  });
  it('section: chronobiologie_melatonine', () => {
    expect(kb(ID).sections).toHaveProperty('chronobiologie_melatonine');
  });
  it('section: cephalees_migraines', () => {
    expect(kb(ID).sections).toHaveProperty('cephalees_migraines');
  });
  it('section: vertiges_troubles_vestibulaires', () => {
    expect(kb(ID).sections).toHaveProperty('vertiges_troubles_vestibulaires');
  });
  it('section: douleur_neuropathique', () => {
    expect(kb(ID).sections).toHaveProperty('douleur_neuropathique');
  });
  it('section: neuromodulation', () => {
    expect(kb(ID).sections).toHaveProperty('neuromodulation');
  });
  it('section: neurologie_fonctionnelle', () => {
    expect(kb(ID).sections).toHaveProperty('neurologie_fonctionnelle');
  });

  // Content probes
  it('contient insomnie ou sommeil dans sections', () => {
    expect(text(kb(ID).sections)).toMatch(/insomnie|sommeil/i);
  });
  it('contient mélatonine ou SCN', () => {
    expect(text(kb(ID).sections)).toMatch(/m.latonine|SCN|circadien/i);
  });
  it('contient migraine ou CGRP ou triptan', () => {
    expect(text(kb(ID).sections)).toMatch(/migraine|CGRP|triptan/i);
  });
  it('contient vertige ou vestibulaire ou VPPB', () => {
    expect(text(kb(ID).sections)).toMatch(/vertige|vestibulaire|VPPB/i);
  });
  it('contient douleur neuropathique ou nociceptif', () => {
    expect(text(kb(ID).sections)).toMatch(/neuropathique|nociceptif/i);
  });
  it('contient neuromodulation ou TMS ou DBS', () => {
    expect(text(kb(ID).sections)).toMatch(/neuromodulation|TMS|DBS/i);
  });
});
