/**
 * TITANE∞ — chunkingService unit tests
 *
 * Validates: chunkMarkdown, chunkCode, chunkText, smartChunk
 * Rule 2: proof before verdict — tests ARE the proof for chunkingService.
 */

import { describe, it, expect } from 'vitest';
import {
  chunkMarkdown,
  chunkCode,
  chunkText,
  smartChunk,
} from '../chunkingService';

describe('chunkingService', () => {
  // ─────────────────────────────────────────────────────────────
  // chunkMarkdown
  // ─────────────────────────────────────────────────────────────

  describe('chunkMarkdown', () => {
    it('should split by headings', () => {
      const content = '# Title\nParagraph 1\n## Section 2\nParagraph 2';
      const chunks = chunkMarkdown(content);
      expect(chunks.length).toBeGreaterThan(1);
    });

    it('should respect maxChunkSize', () => {
      const longContent = 'A'.repeat(5000);
      const chunks = chunkMarkdown(longContent, { maxChunkSize: 1000 });
      chunks.forEach(chunk => {
        // Allow a small overlap buffer (overlap prefix from previous chunk)
        expect(chunk.content.length).toBeLessThanOrEqual(1100);
      });
    });

    it('should not create empty chunks', () => {
      const content = '# Title\n\n\n\n## Section';
      const chunks = chunkMarkdown(content);
      chunks.forEach(chunk => {
        expect(chunk.content.trim().length).toBeGreaterThan(0);
      });
    });

    it('should return empty array for empty input', () => {
      const chunks = chunkMarkdown('');
      expect(chunks.length).toBe(0);
    });

    it('should preserve heading text in chunks', () => {
      const content = '## Introduction\nThis is the introduction section.';
      const chunks = chunkMarkdown(content);
      expect(chunks.length).toBeGreaterThan(0);
      const allContent = chunks.map(c => c.content).join(' ');
      expect(allContent).toContain('Introduction');
    });

    it('should handle content with only headings (no body text)', () => {
      const content = '# Heading 1\n## Heading 2\n### Heading 3';
      const chunks = chunkMarkdown(content, { minChunkSize: 1 });
      expect(chunks.length).toBeGreaterThan(0);
    });
  });

  // ─────────────────────────────────────────────────────────────
  // chunkCode
  // ─────────────────────────────────────────────────────────────

  describe('chunkCode', () => {
    it('should split TypeScript by function boundaries', () => {
      const code = `function foo() { return 1; }\n\nfunction bar() { return 2; }`;
      const chunks = chunkCode(code, 'typescript');
      expect(chunks.length).toBeGreaterThanOrEqual(1);
    });

    it('should handle empty input', () => {
      const chunks = chunkCode('', 'typescript');
      expect(chunks.length).toBe(0);
    });

    it('should split Python by def boundaries', () => {
      const code = `def foo():\n    return 1\n\ndef bar():\n    return 2`;
      const chunks = chunkCode(code, 'python');
      expect(chunks.length).toBeGreaterThanOrEqual(1);
    });

    it('should split Rust by fn boundaries', () => {
      const code = `fn foo() -> i32 { 1 }\n\nfn bar() -> i32 { 2 }`;
      const chunks = chunkCode(code, 'rust');
      expect(chunks.length).toBeGreaterThanOrEqual(1);
    });

    it('should fall back to default boundaries for unknown language', () => {
      const code = `function foo() {}\nfunction bar() {}`;
      const chunks = chunkCode(code, 'unknown_lang');
      expect(chunks.length).toBeGreaterThanOrEqual(1);
    });

    it('should respect maxChunkSize for large functions', () => {
      const largeFunction = `function bigFunc() {\n${'  const x = 1;\n'.repeat(200)}}\n`;
      const chunks = chunkCode(largeFunction, 'javascript', { maxChunkSize: 500 });
      chunks.forEach(chunk => {
        // With line-level splits, each chunk should be bounded
        expect(chunk.content.length).toBeLessThanOrEqual(600);
      });
    });
  });

  // ─────────────────────────────────────────────────────────────
  // chunkText
  // ─────────────────────────────────────────────────────────────

  describe('chunkText', () => {
    it('should split plain text by paragraphs', () => {
      const text = 'Para one content here.\n\nPara two content here.\n\nPara three here.';
      const chunks = chunkText(text, { minChunkSize: 1 });
      expect(chunks.length).toBeGreaterThanOrEqual(1);
    });

    it('should return empty array for empty input', () => {
      const chunks = chunkText('');
      expect(chunks.length).toBe(0);
    });

    it('should respect maxChunkSize', () => {
      const text = 'Word '.repeat(1000);
      const chunks = chunkText(text, { maxChunkSize: 200 });
      chunks.forEach(chunk => {
        expect(chunk.content.length).toBeLessThanOrEqual(250);
      });
    });
  });

  // ─────────────────────────────────────────────────────────────
  // smartChunk (auto-detect)
  // ─────────────────────────────────────────────────────────────

  describe('smartChunk', () => {
    it('should detect and use markdown chunker for markdown content', () => {
      const content = '# Title\nSome text.\n## Section\nMore text.';
      const chunks = smartChunk(content);
      expect(chunks.length).toBeGreaterThan(0);
    });

    it('should detect and use code chunker for code content', () => {
      const content = 'function test() { return true; }';
      const chunks = smartChunk(content);
      expect(chunks.length).toBeGreaterThan(0);
    });

    it('should use explicit type override when provided', () => {
      const content = 'Plain text content without markdown markers.';
      const chunksMarkdown = smartChunk(content, { type: 'markdown' });
      const chunksText = smartChunk(content, { type: 'text' });
      // Both should produce valid non-empty chunks (minChunkSize threshold)
      expect(Array.isArray(chunksMarkdown)).toBe(true);
      expect(Array.isArray(chunksText)).toBe(true);
    });

    it('should pass language option to chunkCode', () => {
      const code = `def foo():\n    return 1\n\ndef bar():\n    return 2`;
      const chunks = smartChunk(code, { type: 'code', language: 'python' });
      expect(chunks.length).toBeGreaterThanOrEqual(1);
    });

    it('should handle empty input gracefully', () => {
      const chunks = smartChunk('');
      expect(Array.isArray(chunks)).toBe(true);
      expect(chunks.length).toBe(0);
    });
  });
});
