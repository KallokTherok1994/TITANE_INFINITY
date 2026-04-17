import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('Conversation fullscreen shell truth', () => {
  it('keeps Titane fullscreen sizing parent-bound instead of viewport-forced', () => {
    const css = readFileSync(
      resolve(process.cwd(), 'src/pages/TitanePage-local.css'),
      'utf8'
    );
    const pageCss = readFileSync(resolve(process.cwd(), 'src/pages/TitanePage.css'), 'utf8');
    const indexCss = readFileSync(resolve(process.cwd(), 'src/index.css'), 'utf8');

    expect(css).toContain('.titane-page--conversation');
    expect(css).toContain('flex: 1 1 auto;');
    expect(css).toContain('width: 100% !important;');
    expect(css).toContain('max-width: 100% !important;');
    expect(css).toContain('min-width: 0 !important;');
    expect(css).toContain('min-height: 0 !important;');
    expect(css).toContain('padding: 0 !important;');
    expect(css).toContain('max-height: 100%;');
    expect(css).toContain('display: flex;');
    expect(css).toContain('flex-direction: column;');
    expect(css).toContain('height: 100%;');
    expect(css).toContain('box-sizing: border-box;');
    expect(css).toContain('animation: none;');
    expect(css).toContain('transform: none;');
    expect(css).not.toContain('min-height: 100%;');
    expect(css).not.toContain('100dvh');
    expect(pageCss).toContain('width: 100% !important;');
    expect(pageCss).toContain('max-width: 100% !important;');
    expect(pageCss).not.toContain('width: 100vw !important;');
    expect(pageCss).toContain('animation: fade-in 0.4s ease-out;');
    expect(indexCss).not.toContain('zoom: 75%;');
  });

  it('avoids duplicating the TopNav offset in AppShell', () => {
    const shell = readFileSync(
      resolve(process.cwd(), 'src/components/layout/AppShell.tsx'),
      'utf8'
    );

    expect(shell).toContain('paddingTop: `calc((4rem + env(safe-area-inset-top, 0px)) / ${APP_SHELL_ZOOM_VAR})`');
    expect(shell).toContain('height: `calc(100% / ${APP_SHELL_ZOOM_VAR})`');
    expect(shell).not.toContain("topNav && 'pt-16'");
  });

  it('keeps the fullscreen conversation header persistent without forcing a scroll to the composer', () => {
    const css = readFileSync(
      resolve(process.cwd(), 'src/pages/TitanePage-local.css'),
      'utf8'
    );
    const pageCss = readFileSync(
      resolve(process.cwd(), 'src/pages/TitanePage.css'),
      'utf8'
    );
    const page = readFileSync(resolve(process.cwd(), 'src/pages/TitanePage.tsx'), 'utf8');

    expect(css).toContain('.titane-page--conversation');
    expect(css).toContain('.titane-page-shell--conversation');
    expect(css).toContain('.titane-page-header--conversation');
    expect(css).toContain('.titane-content--conversation');
    expect(css).toContain('.titane-inline-tabs--conversation');
    expect(pageCss).toContain(".conversation-container[data-fullscreen='true'] {");
    expect(pageCss).toContain('gap: 0;');
    expect(css).toContain('overflow: hidden;');
    expect(css).toContain('overflow-x: auto;');
    expect(css).toContain('position: sticky;');
    expect(css).toContain('top: 0;');
    expect(css).toContain(
      'padding-bottom: calc(4.75rem + env(safe-area-inset-bottom, 0px));'
    );
    expect(page).not.toContain('chatInput?.scrollIntoView');
  });

  it('keeps the canonical chat scrollbar visible on the right edge of the scroll region', () => {
    const css = readFileSync(resolve(process.cwd(), 'src/pages/TitanePage.css'), 'utf8');

    expect(css).toContain('.conversation-messages {');
    expect(css).toContain('width: 100%;');
    expect(css).toContain('max-width: 100%;');
    expect(css).toContain('min-width: 0;');
    expect(css).toContain('overflow-x: hidden;');
    expect(css).toContain('overflow-y: scroll;');
    expect(css).toContain('scrollbar-width: auto;');
    expect(css).toContain(
      'scrollbar-color: rgba(96, 165, 250, 0.9) rgba(15, 23, 42, 0.72);'
    );
    expect(css).toContain('.conversation-messages::-webkit-scrollbar {');
    expect(css).toContain('width: 12px;');
  });
});
