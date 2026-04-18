import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const rootDir = path.resolve(import.meta.dirname, '../../..');
const truthCaptureScript = fs.readFileSync(
  path.join(rootDir, 'scripts/diagnostic/capture-ui-version-truth.sh'),
  'utf8'
);

describe('ui version truth capture script', () => {
  it('accepts explicit version labels, artifact paths, and output paths', () => {
    expect(truthCaptureScript).toContain('--version-label VERSION');
    expect(truthCaptureScript).toContain('--artifact-path PATH');
    expect(truthCaptureScript).toContain('--output PATH');
    expect(truthCaptureScript).toContain('UI_VERSION_TRUTH_SNAPSHOT_');
  });

  it('captures the four governed truth lanes for installed artifacts and launchers', () => {
    expect(truthCaptureScript).toContain('## Artifact Truth');
    expect(truthCaptureScript).toContain('## Host Install Truth');
    expect(truthCaptureScript).toContain('## Launcher Truth');
    expect(truthCaptureScript).toContain('## Repo Runtime Truth');
    expect(truthCaptureScript).toContain('which -a titane-infinity');
    expect(truthCaptureScript).toContain('dpkg-query -W');
    expect(truthCaptureScript).toContain("grep -E '^(Name|Exec|Icon|StartupWMClass)='");
  });

  it('produces a bisect-friendly markdown snapshot rather than raw shell-only output', () => {
    expect(truthCaptureScript).toContain('# UI VERSION TRUTH SNAPSHOT');
    expect(truthCaptureScript).toContain(
      'printf \'Version label: %s\\n\\n\' "$VERSION_LABEL"'
    );
    expect(truthCaptureScript).toContain('```text');
    expect(truthCaptureScript).toContain("printf '```text\\n%s\\n```\\n\\n'");
    expect(truthCaptureScript).not.toContain('cat > "$OUTPUT_PATH" <<EOF');
    expect(truthCaptureScript).toContain(
      'Copy the artifact, host, launcher, and repo/runtime findings into the bisect matrix row'
    );
  });
});
