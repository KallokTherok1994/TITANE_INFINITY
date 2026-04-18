import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const rootDir = path.resolve(import.meta.dirname, '../../..');
const bisectScript = fs.readFileSync(
  path.join(rootDir, 'scripts/diagnostic/init-ui-version-bisect.sh'),
  'utf8'
);

describe('ui version bisect script', () => {
  it('ships the expected 30.1.x default version set and smoke-friendly output option', () => {
    expect(bisectScript).toContain('DEFAULT_VERSIONS=(');
    expect(bisectScript).toContain('"30.1.23"');
    expect(bisectScript).toContain('"30.1.26"');
    expect(bisectScript).toContain('"30.1.27"');
    expect(bisectScript).toContain('--output PATH');
    expect(bisectScript).toContain('UI_VERSION_BISECT_MATRIX_');
  });

  it('documents the four truth capture lanes and the critical UI symptom checklist', () => {
    expect(bisectScript).toContain('Artifact under test');
    expect(bisectScript).toContain('Installed host package truth');
    expect(bisectScript).toContain('Launcher truth');
    expect(bisectScript).toContain('Repo/runtime truth');
    expect(bisectScript).toContain(
      '| Version | Artifact Truth | Host Truth | Launcher Truth | Repo Runtime Truth |'
    );
    expect(bisectScript).toContain('TopNav zoom');
    expect(bisectScript).toContain('Long-message visibility');
    expect(bisectScript).toContain('Return-to-bottom CTA');
  });

  it('anchors the bisect flow on the governed 30.1.23/30.1.26/30.1.27 decision path', () => {
    expect(bisectScript).toContain('30.1.23 as the stable reference');
    expect(bisectScript).toContain('30.1.26 as the pivot');
    expect(bisectScript).toContain('30.1.27 as the first high-suspicion version');
    expect(bisectScript).toContain('Treat 30.1.29 as non-authoritative');
  });
});
