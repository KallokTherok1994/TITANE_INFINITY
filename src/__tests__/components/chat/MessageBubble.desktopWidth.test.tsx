/**
 * TITANE∞ — MessageBubble desktop width CSS regression test
 * Verifies that @media (min-width: 1024px) rules are present and correct
 * in all 3 CSS files patched for AH-2026-04-28-CHAT-BUBBLE-WIDTH-0012
 */

import { describe, expect, it } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';

const ROOT = join(process.cwd(), 'src');

function readCss(relativePath: string): string {
  return readFileSync(join(process.cwd(), relativePath), 'utf8');
}

describe('Chat bubble desktop width — CSS rules (AH-2026-04-28-CHAT-BUBBLE-WIDTH-0012)', () => {
  describe('src/components/chat/MessageList.css', () => {
    const css = readCss('src/components/chat/MessageList.css');

    it('contains desktop media query @media (min-width: 1024px)', () => {
      expect(css).toContain('@media (min-width: 1024px)');
    });

    it('.message-bubble max-width is 97% on desktop', () => {
      // Extract the desktop block
      const desktopBlock = css.match(/@media \(min-width: 1024px\)\s*\{[^}]+\}/s)?.[0] ?? '';
      expect(desktopBlock).toContain('max-width: 97%');
    });

    it('.message-assistant max-width is 97% on desktop', () => {
      const desktopBlocks = css.match(/@media \(min-width: 1024px\)\s*\{[\s\S]*?\n\}/g) ?? [];
      const combined = desktopBlocks.join('\n');
      expect(combined).toContain('.message-assistant');
      expect(combined).toContain('max-width: 97%');
    });

    it('.message-user max-width is 88% on desktop', () => {
      const desktopBlocks = css.match(/@media \(min-width: 1024px\)\s*\{[\s\S]*?\n\}/g) ?? [];
      const combined = desktopBlocks.join('\n');
      expect(combined).toContain('.message-user');
      expect(combined).toContain('max-width: 88%');
    });

    it('mobile breakpoints (max-width: 479px) still present — no regression', () => {
      expect(css).toContain('@media (max-width: 479px)');
      expect(css).toContain('max-width: 95%');
    });

    it('tablet breakpoint (max-width: 768px) still present — no regression', () => {
      expect(css).toContain('@media (max-width: 768px)');
    });
  });

  describe('src/components/chat/MessageBubble.css', () => {
    const css = readCss('src/components/chat/MessageBubble.css');

    it('contains desktop media query @media (min-width: 1024px)', () => {
      expect(css).toContain('@media (min-width: 1024px)');
    });

    it('.message-bubble-assistant margin-right uses rem on desktop (zoom-safe)', () => {
      const desktopBlocks = css.match(/@media \(min-width: 1024px\)\s*\{[\s\S]*?\n\}/g) ?? [];
      const combined = desktopBlocks.join('\n');
      // Should use rem, not px — zoom-safe per zoomScale.ts
      expect(combined).toContain('.message-bubble-assistant');
      expect(combined).toMatch(/margin-right:\s*0\.5rem/);
    });

    it('.message-bubble-user margin-left uses rem on desktop (zoom-safe)', () => {
      const desktopBlocks = css.match(/@media \(min-width: 1024px\)\s*\{[\s\S]*?\n\}/g) ?? [];
      const combined = desktopBlocks.join('\n');
      expect(combined).toContain('.message-bubble-user');
      expect(combined).toMatch(/margin-left:\s*0\.5rem/);
    });

    it('mobile breakpoint (max-width: 479px) still present — no regression', () => {
      expect(css).toContain('@media (max-width: 479px)');
    });

    it('tablet breakpoint (max-width: 768px) still present — no regression', () => {
      expect(css).toContain('@media (max-width: 768px)');
    });
  });

  describe('src/components/MessageBubble.css (legacy override)', () => {
    const css = readCss('src/components/MessageBubble.css');

    it('contains desktop media query @media (min-width: 1024px)', () => {
      expect(css).toContain('@media (min-width: 1024px)');
    });

    it('overrides legacy max-width:76%/90% to 97% on desktop', () => {
      const desktopBlock = css.match(/@media \(min-width: 1024px\)\s*\{[\s\S]*?\n\}/)?.[0] ?? '';
      expect(desktopBlock).toContain('max-width: 97%');
    });

    it('mobile breakpoint (max-width: 768px) still present with 90%', () => {
      expect(css).toContain('@media (max-width: 768px)');
      expect(css).toContain('max-width: 90%');
    });
  });

  describe('zoom compatibility invariants', () => {
    it('desktop margins are in rem (not px) — scales with --titane-ui-scale font-size zoom', () => {
      const css = readCss('src/components/chat/MessageBubble.css');
      const desktopBlocks = css.match(/@media \(min-width: 1024px\)\s*\{[\s\S]*?\n\}/g) ?? [];
      const combined = desktopBlocks.join('\n');
      // Must NOT contain plain px margins in the desktop override
      expect(combined).not.toMatch(/margin-right:\s*8px/);
      expect(combined).not.toMatch(/margin-left:\s*8px/);
    });

    it('max-width values are percentages — scale with container, zoom-safe', () => {
      const css = readCss('src/components/chat/MessageList.css');
      const desktopBlocks = css.match(/@media \(min-width: 1024px\)\s*\{[\s\S]*?\n\}/g) ?? [];
      const combined = desktopBlocks.join('\n');
      // Must be % not px
      expect(combined).toMatch(/max-width:\s*97%/);
      expect(combined).toMatch(/max-width:\s*88%/);
      expect(combined).not.toMatch(/max-width:\s*\d+px/);
    });
  });
});
