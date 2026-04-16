import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('Conversation fullscreen shell truth', () => {
  it('keeps Titane fullscreen sizing parent-bound instead of viewport-forced', () => {
    const css = readFileSync(resolve(process.cwd(), 'src/pages/TitanePage-local.css'), 'utf8');

    expect(css).toContain('.titane-page--conversation');
    expect(css).toContain('flex: 1 1 auto;');
    expect(css).toContain('min-height: 0;');
    expect(css).toContain('max-height: 100%;');
    expect(css).not.toContain('min-height: 100%;');
    expect(css).not.toContain('100dvh');
  });

  it('avoids duplicating the TopNav offset in AppShell', () => {
    const shell = readFileSync(resolve(process.cwd(), 'src/components/layout/AppShell.tsx'), 'utf8');

    expect(shell).toContain("paddingTop: 'calc(4rem + env(safe-area-inset-top, 0px))'");
    expect(shell).not.toContain("topNav && 'pt-16'");
  });
});
