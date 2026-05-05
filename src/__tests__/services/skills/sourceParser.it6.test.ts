/**
 * IT6 — Type-safety: sourceParser JSON manifest parsing (ParsedJsonTool/Action/KnowledgeFile)
 * Proves typed interfaces replace `as any[]` without breaking parsed field access.
 */
import { describe, it, expect } from 'vitest';
import { ingestManifest } from '@/services/skills/ingestion/sourceParser';

describe('sourceParser — manifest JSON parsing (IT6 type-safety)', () => {
  it('parses tools array with name + description + parameters', () => {
    const manifest = JSON.stringify({
      name: 'Test Skill',
      description: 'A test skill',
      instructions: 'Do stuff',
      tools: [
        {
          name: 'search_web',
          description: 'Search the web',
          parameters: { type: 'object' },
        },
      ],
    });
    const { envelope } = ingestManifest(manifest);
    expect(envelope.rawTools).toHaveLength(1);
    expect(envelope.rawTools[0].name).toBe('search_web');
    expect(envelope.rawTools[0].description).toBe('Search the web');
    expect(envelope.rawTools[0].schema).toEqual({ type: 'object' });
  });

  it('parses tools with nested function object (GPT-style tool)', () => {
    const manifest = JSON.stringify({
      name: 'Test Skill',
      instructions: 'Do stuff',
      tools: [
        {
          function: {
            name: 'get_weather',
            description: 'Get weather data',
            parameters: { type: 'object', properties: {} },
          },
        },
      ],
    });
    const { envelope } = ingestManifest(manifest);
    expect(envelope.rawTools).toHaveLength(1);
    expect(envelope.rawTools[0].name).toBe('get_weather');
    expect(envelope.rawTools[0].description).toBe('Get weather data');
  });

  it('parses actions array with name + description + endpoint', () => {
    const manifest = JSON.stringify({
      name: 'Test Skill',
      instructions: 'Do stuff',
      actions: [
        {
          name: 'send_email',
          description: 'Send an email',
          url: 'https://api.example.com/send',
        },
      ],
    });
    const { envelope } = ingestManifest(manifest);
    expect(envelope.rawTools.some(t => t.name === 'send_email')).toBe(true);
  });

  it('parses knowledge_files array with name + content', () => {
    const manifest = JSON.stringify({
      name: 'Test Skill',
      instructions: 'Do stuff',
      knowledge_files: [{ name: 'readme.md', content: '# Hello', type: 'text/markdown' }],
    });
    const { envelope } = ingestManifest(manifest);
    expect(envelope.rawKnowledgeFiles).toHaveLength(1);
    expect(envelope.rawKnowledgeFiles[0].name).toBe('readme.md');
    expect(envelope.rawKnowledgeFiles[0].content).toBe('# Hello');
  });

  it('handles missing optional fields gracefully (defaults to "unknown")', () => {
    const manifest = JSON.stringify({
      name: 'Sparse Skill',
      instructions: 'Minimal',
      tools: [{}],
    });
    const { envelope } = ingestManifest(manifest);
    expect(envelope.rawTools[0].name).toBe('unknown');
    expect(envelope.rawTools[0].description).toBe('');
  });
});
