/**
 * TITANE∞ — Smart Markdown-Aware KB Chunking Service
 *
 * Provides semantic chunking that respects document structure:
 * - Markdown: splits by headings first, then paragraphs within sections
 * - Code: splits by function/class boundaries using regex patterns
 * - Fallback: paragraph-based chunking with size limits
 */

import type { DocumentChunk } from './ragService';

export interface ChunkOptions {
  maxChunkSize?: number;
  minChunkSize?: number;
  overlap?: number;
}

const DEFAULT_OPTIONS: Required<ChunkOptions> = {
  maxChunkSize: 1000,
  minChunkSize: 100,
  overlap: 50,
};

// ─────────────────────────────────────────────────────────────────
// Markdown chunker
// ─────────────────────────────────────────────────────────────────

/**
 * Chunk markdown content by headings (## / ###) first,
 * then by paragraphs within each section.
 */
export function chunkMarkdown(
  content: string,
  options?: ChunkOptions
): Pick<DocumentChunk, 'content'>[] {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  // Split by heading lines (## or ###)
  const headingRe = /^(#{1,3})\s+.+/m;
  const sections = splitBySections(content, headingRe);

  const result: string[] = [];

  for (const section of sections) {
    const startsWithHeading = /^#{1,3}\s+/.test(section.trimStart());
    if (section.trim().length < opts.minChunkSize) {
      // Too small — merge with next (handled below by flushing logic)
      if (!startsWithHeading && result.length > 0) {
        const last = result[result.length - 1];
        if (last !== undefined && (last + '\n\n' + section).length <= opts.maxChunkSize) {
          result[result.length - 1] = last + '\n\n' + section;
          continue;
        }
      }
    }

    if (section.length <= opts.maxChunkSize) {
      if (section.trim()) result.push(section.trim());
    } else {
      // Split large sections by paragraphs
      const subChunks = splitByParagraphs(section, opts);
      result.push(...subChunks);
    }
  }

  return addOverlap(result, opts).map(c => ({ content: c }));
}

// ─────────────────────────────────────────────────────────────────
// Code chunker
// ─────────────────────────────────────────────────────────────────

const CODE_BOUNDARIES: Record<string, RegExp> = {
  typescript:
    /^(?:export\s+)?(?:async\s+)?(?:function|class|const\s+\w+\s*=\s*(?:async\s+)?\(|interface\s|type\s+\w+\s*=)/m,
  javascript:
    /^(?:export\s+)?(?:async\s+)?(?:function|class|const\s+\w+\s*=\s*(?:async\s+)?\()/m,
  python: /^(?:def |class |async def )/m,
  rust: /^(?:pub\s+)?(?:async\s+)?(?:fn |struct |impl |enum |trait )/m,
  go: /^(?:func |type |var |const )/m,
  java: /^(?:public|private|protected|static|final|abstract|class|interface|enum)\s/m,
  default: /^(?:function|class|def |fn |func )/m,
};

/**
 * Chunk code content by function/class boundaries.
 */
export function chunkCode(
  content: string,
  language: string,
  options?: ChunkOptions
): Pick<DocumentChunk, 'content'>[] {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const boundaryRe =
    CODE_BOUNDARIES[language.toLowerCase()] ?? CODE_BOUNDARIES['default']!;

  const sections = splitBySections(content, boundaryRe);
  const result: string[] = [];

  for (const section of sections) {
    if (!section.trim()) continue;

    if (section.length <= opts.maxChunkSize) {
      result.push(section.trim());
    } else {
      // Large function/class — split by line blocks
      const subChunks = splitByLines(section, opts);
      result.push(...subChunks);
    }
  }

  return addOverlap(result, opts).map(c => ({ content: c }));
}

// ─────────────────────────────────────────────────────────────────
// Generic paragraph chunker (fallback)
// ─────────────────────────────────────────────────────────────────

export function chunkText(
  content: string,
  options?: ChunkOptions
): Pick<DocumentChunk, 'content'>[] {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const chunks = splitByParagraphs(content, opts);
  return addOverlap(chunks, opts).map(c => ({ content: c }));
}

// ─────────────────────────────────────────────────────────────────
// Internal helpers
// ─────────────────────────────────────────────────────────────────

function splitBySections(content: string, headingRe: RegExp): string[] {
  const lines = content.split('\n');
  const sections: string[] = [];
  let current: string[] = [];

  for (const line of lines) {
    if (headingRe.test(line) && current.length > 0) {
      sections.push(current.join('\n'));
      current = [line];
    } else {
      current.push(line);
    }
  }
  if (current.length > 0) {
    sections.push(current.join('\n'));
  }
  return sections.filter(s => s.trim());
}

function splitByParagraphs(text: string, opts: Required<ChunkOptions>): string[] {
  const paragraphs = text.split(/\n\n+/);
  const merged: string[] = [];
  let current = '';

  for (const para of paragraphs) {
    const candidate = current ? current + '\n\n' + para : para;
    if (candidate.length > opts.maxChunkSize && current) {
      if (current.trim()) merged.push(current.trim());
      current = para;
    } else {
      current = candidate;
    }
  }
  if (current.trim()) merged.push(current.trim());

  // Hard-split any chunks that still exceed maxChunkSize (e.g. single long paragraphs)
  const chunks: string[] = [];
  for (const chunk of merged) {
    if (chunk.length <= opts.maxChunkSize) {
      chunks.push(chunk);
    } else {
      let remaining = chunk;
      while (remaining.length > opts.maxChunkSize) {
        const spaceIdx = remaining.lastIndexOf(' ', opts.maxChunkSize);
        const splitPos =
          spaceIdx > opts.maxChunkSize * 0.5 ? spaceIdx : opts.maxChunkSize;
        chunks.push(remaining.slice(0, splitPos).trimEnd());
        remaining = remaining.slice(splitPos).trimStart();
      }
      if (remaining.trim()) chunks.push(remaining.trim());
    }
  }

  return chunks.filter(c => c.length >= opts.minChunkSize);
}

function splitLongText(text: string, maxChunkSize: number): string[] {
  const parts: string[] = [];
  let rest = text.trim();

  while (rest.length > maxChunkSize) {
    let splitAt = rest.lastIndexOf(' ', maxChunkSize);
    if (splitAt <= 0) {
      splitAt = maxChunkSize;
    }

    const part = rest.slice(0, splitAt).trim();
    if (part.length > 0) {
      parts.push(part);
    }
    rest = rest.slice(splitAt).trimStart();
  }

  if (rest.length > 0) {
    parts.push(rest);
  }

  return parts;
}

function splitByLines(text: string, opts: Required<ChunkOptions>): string[] {
  const lines = text.split('\n');
  const chunks: string[] = [];
  let current = '';

  for (const line of lines) {
    const candidate = current ? current + '\n' + line : line;
    if (candidate.length > opts.maxChunkSize && current) {
      if (current.trim()) chunks.push(current.trim());
      current = line;
    } else {
      current = candidate;
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks.filter(c => c.length >= opts.minChunkSize);
}

/**
 * Add character-level overlap between adjacent chunks.
 * Each chunk (except the first) starts with the last `overlap` chars of the previous chunk.
 */
function addOverlap(chunks: string[], opts: Required<ChunkOptions>): string[] {
  if (opts.overlap <= 0 || chunks.length <= 1) return chunks;
  const result: string[] = [];
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    if (chunk === undefined) continue;
    if (i === 0) {
      result.push(chunk);
    } else {
      const prev = chunks[i - 1];
      if (prev && prev.length > opts.overlap) {
        const suffix = prev.slice(-opts.overlap);
        result.push(suffix + '\n' + chunk);
      } else {
        result.push(chunk);
      }
    }
  }
  return result;
}

// ─────────────────────────────────────────────────────────────────
// Unified entry point (auto-detect)
// ─────────────────────────────────────────────────────────────────

export type ContentType = 'markdown' | 'code' | 'text';

export interface SmartChunkOptions extends ChunkOptions {
  type?: ContentType;
  language?: string;
}

export function smartChunk(
  content: string,
  options?: SmartChunkOptions
): Pick<DocumentChunk, 'content'>[] {
  const type = options?.type ?? detectContentType(content);
  switch (type) {
    case 'markdown':
      return chunkMarkdown(content, options);
    case 'code':
      return chunkCode(content, options?.language ?? 'default', options);
    default:
      return chunkText(content, options);
  }
}

function detectContentType(content: string): ContentType {
  const trimmed = content.trimStart();
  if (/^#{1,3}\s/.test(trimmed) || /\n#{1,3}\s/.test(trimmed)) return 'markdown';
  if (/^(?:function|class|const |import |export |def |fn |pub fn )/.test(trimmed))
    return 'code';
  return 'text';
}

// Singleton instance for convenience
export const chunkingService = {
  chunkMarkdown,
  chunkCode,
  chunkText,
  smartChunk,
};

export default chunkingService;
