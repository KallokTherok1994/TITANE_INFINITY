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

    it('.message-bubble max-width is 99% on desktop', () => {
      const desktopBlocks = css.match(/@media \(min-width: 1024px\)\s*\{[\s\S]*?\n\}/g) ?? [];
      const combined = desktopBlocks.join('\n');
      expect(combined).toContain('max-width: 99%');
    });

    it('.message-bubble-assistant max-width is 99% on desktop', () => {
      const desktopBlocks = css.match(/@media \(min-width: 1024px\)\s*\{[\s\S]*?\n\}/g) ?? [];
      const combined = desktopBlocks.join('\n');
      expect(combined).toContain('.message-bubble-assistant');
      expect(combined).toContain('max-width: 99%');
    });

    it('.message-bubble-user max-width is 96% on desktop', () => {
      const desktopBlocks = css.match(/@media \(min-width: 1024px\)\s*\{[\s\S]*?\n\}/g) ?? [];
      const combined = desktopBlocks.join('\n');
      expect(combined).toContain('.message-bubble-user');
      expect(combined).toContain('max-width: 96%');
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

    it('.message-bubble-assistant margin-right is 0 on desktop (zoom-safe)', () => {
      const desktopBlocks = css.match(/@media \(min-width: 1024px\)\s*\{[\s\S]*?\n\}/g) ?? [];
      const combined = desktopBlocks.join('\n');
      // Must use rem or 0, not px — zoom-safe per zoomScale.ts
      expect(combined).toContain('.message-bubble-assistant');
      expect(combined).toMatch(/margin-right:\s*0rem/);
    });

    it('.message-bubble-user margin-left is 0 on desktop (zoom-safe)', () => {
      const desktopBlocks = css.match(/@media \(min-width: 1024px\)\s*\{[\s\S]*?\n\}/g) ?? [];
      const combined = desktopBlocks.join('\n');
      expect(combined).toContain('.message-bubble-user');
      expect(combined).toMatch(/margin-left:\s*0rem/);
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

    it('overrides legacy max-width:76%/90% to 99% on desktop', () => {
      const desktopBlock = css.match(/@media \(min-width: 1024px\)\s*\{[\s\S]*?\n\}/)?.[0] ?? '';
      expect(desktopBlock).toContain('max-width: 99%');
    });

    it('mobile breakpoint (max-width: 768px) still present with 90%', () => {
      expect(css).toContain('@media (max-width: 768px)');
      expect(css).toContain('max-width: 90%');
    });
  });

  describe('zoom compatibility invariants', () => {
    it('desktop margins are 0 — no rigid spacing on desktop', () => {
      const css = readCss('src/components/chat/MessageBubble.css');
      const desktopBlocks = css.match(/@media \(min-width: 1024px\)\s*\{[\s\S]*?\n\}/g) ?? [];
      const combined = desktopBlocks.join('\n');
      expect(combined).not.toMatch(/margin-right:\s*8px/);
      expect(combined).not.toMatch(/margin-left:\s*8px/);
    });

    it('max-width values are percentages — scale with container, zoom-safe', () => {
      const css = readCss('src/components/chat/MessageList.css');
      const desktopBlocks = css.match(/@media \(min-width: 1024px\)\s*\{[\s\S]*?\n\}/g) ?? [];
      const combined = desktopBlocks.join('\n');
      expect(combined).toMatch(/max-width:\s*99%/);
      expect(combined).toMatch(/max-width:\s*96%/);
      expect(combined).not.toMatch(/max-width:\s*\d+px/);
    });

    it('TitanePage.css — base rules remove ch cap on conversation-message-content', () => {
      const css = readCss('src/pages/TitanePage.css');
      // Base rules must use plain % — no ch caps that limit to ~700px regardless of viewport
      expect(css).toContain('.conversation-message-content');
      // Assistant messages must be at least 99%
      expect(css).toMatch(/\.conversation-message\.assistant \.conversation-message-content\s*\{[^}]*max-width:\s*99%/);
      // User messages must be at most 94–99%
      expect(css).toMatch(/\.conversation-message\.user \.conversation-message-content\s*\{[^}]*max-width:\s*9[0-9]%/);
      // No ch-unit cap in base conversation-message-content rules
      const contentBlocks = css.match(/\.conversation-message-content\s*\{[^}]+\}/g) ?? [];
      const combined = contentBlocks.join('\n');
      expect(combined).not.toMatch(/max-width:\s*min\([^)]*ch/);
    });
  });
});
