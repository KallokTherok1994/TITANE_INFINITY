import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

// ─── mocks (hoisted) ─────────────────────────────────────────────────────────

const isTauriAvailableMock = vi.fn<[], boolean>();
vi.mock('@/api/tauriClient', () => ({
  isTauriAvailable: () => isTauriAvailableMock(),
}));

const tauriSaveMock = vi.fn<[unknown], Promise<string | null>>();
vi.mock('@tauri-apps/plugin-dialog', () => ({
  save: (...args: unknown[]) => tauriSaveMock(...args),
}));

const writeTextFileMock = vi.fn<[string, string], Promise<void>>();
vi.mock('@tauri-apps/plugin-fs', () => ({
  writeTextFile: (...args: unknown[]) => writeTextFileMock(...args),
}));

// ─── subject under test ───────────────────────────────────────────────────────

import {
  copyToClipboard,
  downloadConversation,
  downloadMarkdown,
  exportConversation,
  exportToMarkdown,
  generateAndSaveFile,
  importConversation,
  type ExportSaveResult,
} from '../exportImport';

// ─── helpers ─────────────────────────────────────────────────────────────────

function makeMessages(count = 3) {
  return Array.from({ length: count }, (_, i) => ({
    id: `msg-${i}`,
    role: (i % 2 === 0 ? 'user' : 'assistant') as 'user' | 'assistant',
    content: `Message content ${i}`,
    timestamp: 1_700_000_000_000 + i * 1000,
    mode: i % 2 === 0 ? 'STANDARD' : undefined,
  }));
}

// ─── browser download path setup ─────────────────────────────────────────────

const clickMock = vi.fn();

beforeAll(() => {
  URL.createObjectURL = vi.fn(() => 'blob:test-url');
  URL.revokeObjectURL = vi.fn();

  const origCreateElement = document.createElement.bind(document);
  vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
    const el = origCreateElement(tag);
    if (tag === 'a') {
      Object.defineProperty(el, 'click', { value: clickMock, writable: true });
    }
    return el;
  });
  vi.spyOn(document.body, 'appendChild').mockImplementation(node => node as never);
  vi.spyOn(document.body, 'removeChild').mockImplementation(node => node as never);
});

afterAll(() => {
  vi.restoreAllMocks();
});

beforeEach(() => {
  vi.clearAllMocks();
  isTauriAvailableMock.mockReturnValue(false);
});

// ─── exportConversation ───────────────────────────────────────────────────────

describe('exportConversation', () => {
  it('returns valid JSON string', () => {
    const messages = makeMessages(2);
    const json = exportConversation('conv-1', 'Ma conversation', messages);
    expect(() => JSON.parse(json)).not.toThrow();
  });

  it('includes version field', () => {
    const json = exportConversation('conv-1', 'Test', makeMessages(1));
    const parsed = JSON.parse(json);
    expect(parsed.version).toBeDefined();
  });

  it('includes exportedAt timestamp', () => {
    const before = Date.now();
    const json = exportConversation('conv-1', 'Test', makeMessages(1));
    const after = Date.now();
    const parsed = JSON.parse(json);
    expect(parsed.exportedAt).toBeGreaterThanOrEqual(before);
    expect(parsed.exportedAt).toBeLessThanOrEqual(after);
  });

  it('includes conversation with correct id', () => {
    const json = exportConversation('my-id', 'Title', makeMessages(2));
    const parsed = JSON.parse(json);
    expect(parsed.conversation.id).toBe('my-id');
  });

  it('includes conversation with correct title', () => {
    const json = exportConversation('id', 'Mon Titre', makeMessages(2));
    const parsed = JSON.parse(json);
    expect(parsed.conversation.title).toBe('Mon Titre');
  });

  it('includes all messages', () => {
    const messages = makeMessages(5);
    const json = exportConversation('id', 'Title', messages);
    const parsed = JSON.parse(json);
    expect(parsed.conversation.messages).toHaveLength(5);
  });

  it('includes metadata.totalMessages', () => {
    const messages = makeMessages(3);
    const json = exportConversation('id', 'Title', messages);
    const parsed = JSON.parse(json);
    expect(parsed.conversation.metadata.totalMessages).toBe(3);
  });

  it('includes metadata.modes without duplicates', () => {
    const json = exportConversation('id', 'Title', makeMessages(4));
    const parsed = JSON.parse(json);
    const modes: string[] = parsed.conversation.metadata.modes;
    expect(modes).toContain('STANDARD');
    expect(new Set(modes).size).toBe(modes.length);
  });

  it('uses first message timestamp as createdAt', () => {
    const messages = makeMessages(3);
    const json = exportConversation('id', 'Title', messages);
    const parsed = JSON.parse(json);
    expect(parsed.conversation.createdAt).toBe(messages[0]!.timestamp);
  });

  it('uses last message timestamp as updatedAt', () => {
    const messages = makeMessages(3);
    const json = exportConversation('id', 'Title', messages);
    const parsed = JSON.parse(json);
    expect(parsed.conversation.updatedAt).toBe(messages[messages.length - 1]!.timestamp);
  });

  it('handles empty messages array', () => {
    const json = exportConversation('id', 'Title', []);
    const parsed = JSON.parse(json);
    expect(parsed.conversation.messages).toHaveLength(0);
    expect(parsed.conversation.metadata.totalMessages).toBe(0);
  });

  it('produces pretty-printed JSON (2-space indent)', () => {
    const json = exportConversation('id', 'T', makeMessages(1));
    expect(json).toContain('\n  ');
  });
});

// ─── exportToMarkdown ─────────────────────────────────────────────────────────

describe('exportToMarkdown', () => {
  it('starts with H1 title', () => {
    const md = exportToMarkdown('Mon Rapport', makeMessages(2));
    expect(md.trim()).toMatch(/^# Mon Rapport/);
  });

  it('contains exportedAt date line', () => {
    const md = exportToMarkdown('Test', makeMessages(1));
    expect(md).toMatch(/Exporté le/);
  });

  it('contains separator lines', () => {
    const md = exportToMarkdown('Test', makeMessages(2));
    expect(md).toContain('---');
  });

  it('includes user role label', () => {
    const md = exportToMarkdown('Test', makeMessages(2));
    expect(md).toContain('Utilisateur');
  });

  it('includes TITANE assistant label', () => {
    const md = exportToMarkdown('Test', makeMessages(2));
    expect(md).toContain('TITANE');
  });

  it('includes message content', () => {
    const messages = makeMessages(2);
    const md = exportToMarkdown('Test', messages);
    expect(md).toContain('Message content 0');
    expect(md).toContain('Message content 1');
  });

  it('includes mode in output when defined', () => {
    const md = exportToMarkdown('Test', makeMessages(2));
    expect(md).toContain('STANDARD');
  });

  it('handles empty messages array', () => {
    const md = exportToMarkdown('Vide', []);
    expect(md).toContain('# Vide');
  });
});

// ─── importConversation ───────────────────────────────────────────────────────

describe('importConversation', () => {
  function makeValidExport(version = '26.0') {
    return JSON.stringify({
      version,
      exportedAt: Date.now(),
      conversation: {
        id: 'conv-test',
        title: 'Test',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        messages: makeMessages(2),
        metadata: { totalMessages: 2, modes: ['STANDARD'] },
      },
    });
  }

  it('returns parsed object for valid JSON', () => {
    const result = importConversation(makeValidExport());
    expect(result).not.toBeNull();
    expect(result?.conversation.id).toBe('conv-test');
  });

  it('returns null for invalid JSON', () => {
    expect(importConversation('not json at all')).toBeNull();
  });

  it('returns null when "version" field is missing', () => {
    const json = JSON.stringify({ conversation: { messages: [] } });
    expect(importConversation(json)).toBeNull();
  });

  it('returns null when "conversation" field is missing', () => {
    const json = JSON.stringify({ version: '26.0' });
    expect(importConversation(json)).toBeNull();
  });

  it('returns null when "messages" is missing inside conversation', () => {
    const json = JSON.stringify({ version: '26.0', conversation: { id: 'x' } });
    expect(importConversation(json)).toBeNull();
  });

  it('returns object (with warning) for different version', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const result = importConversation(makeValidExport('25.0'));
    expect(result).not.toBeNull();
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it('returns null for empty string', () => {
    expect(importConversation('')).toBeNull();
  });

  it('preserves all message fields', () => {
    const result = importConversation(makeValidExport());
    const first = result?.conversation.messages[0];
    expect(first?.id).toBe('msg-0');
    expect(first?.role).toBe('user');
    expect(first?.content).toBe('Message content 0');
  });
});

// ─── generateAndSaveFile — browser path ──────────────────────────────────────

describe('generateAndSaveFile (browser path)', () => {
  beforeEach(() => {
    isTauriAvailableMock.mockReturnValue(false);
  });

  it('returns ok:true with SAVED_BROWSER_DOWNLOAD status', async () => {
    const result = await generateAndSaveFile('content', 'py', 'script');
    expect(result.ok).toBe(true);
    expect(result.status).toBe('SAVED_BROWSER_DOWNLOAD');
  });

  it('creates a blob URL', async () => {
    await generateAndSaveFile('print("hello")', 'py', 'script');
    expect(URL.createObjectURL).toHaveBeenCalled();
  });

  it('revokes the blob URL after download', async () => {
    await generateAndSaveFile('content', 'ts', 'module');
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:test-url');
  });

  it('triggers a click on the anchor element', async () => {
    await generateAndSaveFile('content', 'json', 'data');
    expect(clickMock).toHaveBeenCalled();
  });

  it('appends .ext when defaultName lacks it', async () => {
    await generateAndSaveFile('content', 'py', 'myscript');
    const anchor = (document.createElement as ReturnType<typeof vi.fn>).mock.results.find(
      r => (r.value as HTMLElement)?.tagName === 'A'
    )?.value as HTMLAnchorElement | undefined;
    if (anchor) {
      expect(anchor.download).toMatch(/\.py$/);
    }
  });

  it('does not double-append extension when already present', async () => {
    await generateAndSaveFile('content', 'rs', 'main.rs');
    const anchor = (document.createElement as ReturnType<typeof vi.fn>).mock.results.find(
      r => (r.value as HTMLElement)?.tagName === 'A'
    )?.value as HTMLAnchorElement | undefined;
    if (anchor) {
      expect(anchor.download).toBe('main.rs');
    }
  });

  it.each([
    ['py', 'text/x-python'],
    ['rs', 'text/plain'],
    ['ts', 'text/plain'],
    ['json', 'application/json'],
    ['csv', 'text/csv'],
    ['html', 'text/html'],
    ['md', 'text/markdown'],
    ['yaml', 'text/yaml'],
    ['sh', 'text/x-sh'],
    ['sql', 'application/sql'],
    ['css', 'text/css'],
    ['js', 'text/javascript'],
  ])('uses correct MIME type for .%s → %s', async (ext, expectedMime) => {
    await generateAndSaveFile('content', ext, `file.${ext}`);
    const blobCall = (URL.createObjectURL as ReturnType<typeof vi.fn>).mock.calls[0]?.[0];
    expect(blobCall?.type).toBe(expectedMime);
  });

  it('falls back to text/plain for unknown extension', async () => {
    await generateAndSaveFile('content', 'xyz', 'file');
    const blobCall = (URL.createObjectURL as ReturnType<typeof vi.fn>).mock.calls[0]?.[0];
    expect(blobCall?.type).toBe('text/plain');
  });

  it('returns SAVE_DIALOG_BLOCKED when Blob/URL throws', async () => {
    (URL.createObjectURL as ReturnType<typeof vi.fn>).mockImplementationOnce(() => {
      throw new Error('Blocked');
    });
    const result = await generateAndSaveFile('content', 'py', 'script');
    expect(result.ok).toBe(false);
    expect(result.status).toBe('SAVE_DIALOG_BLOCKED');
    expect(result.error).toBe('Blocked');
  });
});

// ─── generateAndSaveFile — Tauri path ────────────────────────────────────────

describe('generateAndSaveFile (Tauri path)', () => {
  beforeEach(() => {
    isTauriAvailableMock.mockReturnValue(true);
    tauriSaveMock.mockResolvedValue('/home/user/script.py');
    writeTextFileMock.mockResolvedValue(undefined);
  });

  it('returns ok:true with SAVED_TAURI status', async () => {
    const result = await generateAndSaveFile('print("hello")', 'py', 'script');
    expect(result.ok).toBe(true);
    expect(result.status).toBe('SAVED_TAURI');
  });

  it('includes the saved path in the result', async () => {
    const result = await generateAndSaveFile('content', 'py', 'script');
    expect(result.path).toBe('/home/user/script.py');
  });

  it('calls writeTextFile with the selected path and content', async () => {
    await generateAndSaveFile('my content', 'ts', 'module');
    expect(writeTextFileMock).toHaveBeenCalledWith('/home/user/script.py', 'my content');
  });

  it('calls save with correct defaultPath', async () => {
    await generateAndSaveFile('content', 'py', 'myscript');
    const callArg = tauriSaveMock.mock.calls[0]?.[0] as { defaultPath?: string } | undefined;
    expect(callArg?.defaultPath).toBe('myscript.py');
  });

  it('does not double-append extension when defaultName already has it', async () => {
    await generateAndSaveFile('content', 'rs', 'main.rs');
    const callArg = tauriSaveMock.mock.calls[0]?.[0] as { defaultPath?: string } | undefined;
    expect(callArg?.defaultPath).toBe('main.rs');
  });

  it('includes "Tous les fichiers" wildcard filter', async () => {
    await generateAndSaveFile('content', 'py', 'script');
    const callArg = tauriSaveMock.mock.calls[0]?.[0] as {
      filters?: Array<{ name: string; extensions: string[] }>;
    } | undefined;
    const wildcard = callArg?.filters?.find(f => f.extensions.includes('*'));
    expect(wildcard).toBeDefined();
  });

  it('returns SAVE_CANCELLED_HONEST when dialog returns null', async () => {
    tauriSaveMock.mockResolvedValueOnce(null);
    const result = await generateAndSaveFile('content', 'py', 'script');
    expect(result.ok).toBe(false);
    expect(result.status).toBe('SAVE_CANCELLED_HONEST');
  });

  it('returns WRITE_FAILED when writeTextFile throws', async () => {
    writeTextFileMock.mockRejectedValueOnce(new Error('Disk full'));
    const result = await generateAndSaveFile('content', 'py', 'script');
    expect(result.ok).toBe(false);
    expect(result.status).toBe('WRITE_FAILED');
    expect(result.error).toBe('Disk full');
  });

  it('handles non-Error thrown from writeTextFile', async () => {
    writeTextFileMock.mockRejectedValueOnce('string error');
    const result = await generateAndSaveFile('content', 'py', 'script');
    expect(result.ok).toBe(false);
    expect(result.status).toBe('WRITE_FAILED');
    expect(result.error).toBe('string error');
  });
});

// ─── downloadConversation ─────────────────────────────────────────────────────

describe('downloadConversation', () => {
  it('returns ExportSaveResult', async () => {
    const result = await downloadConversation('conv-1', 'Ma conv', makeMessages(2));
    expect(result).toHaveProperty('ok');
    expect(result).toHaveProperty('status');
  });

  it('triggers a download (browser path)', async () => {
    await downloadConversation('conv-1', 'Test', makeMessages(2));
    expect(URL.createObjectURL).toHaveBeenCalled();
  });

  it('uses application/json MIME type', async () => {
    await downloadConversation('conv-1', 'Test', makeMessages(1));
    const blobCall = (URL.createObjectURL as ReturnType<typeof vi.fn>).mock.calls[0]?.[0];
    expect(blobCall?.type).toBe('application/json');
  });

  it('filename contains .json extension', async () => {
    await downloadConversation('conv-1', 'Test', makeMessages(1));
    const anchor = (document.createElement as ReturnType<typeof vi.fn>).mock.results.find(
      r => (r.value as HTMLElement)?.tagName === 'A'
    )?.value as HTMLAnchorElement | undefined;
    if (anchor) {
      expect(anchor.download).toMatch(/\.json$/);
    }
  });
});

// ─── downloadMarkdown ─────────────────────────────────────────────────────────

describe('downloadMarkdown', () => {
  it('returns ExportSaveResult', async () => {
    const result = await downloadMarkdown('Test', makeMessages(2));
    expect(result).toHaveProperty('ok');
    expect(result).toHaveProperty('status');
  });

  it('uses text/markdown MIME type', async () => {
    await downloadMarkdown('Test', makeMessages(1));
    const blobCall = (URL.createObjectURL as ReturnType<typeof vi.fn>).mock.calls[0]?.[0];
    expect(blobCall?.type).toBe('text/markdown');
  });

  it('filename contains .md extension', async () => {
    await downloadMarkdown('Test', makeMessages(1));
    const anchor = (document.createElement as ReturnType<typeof vi.fn>).mock.results.find(
      r => (r.value as HTMLElement)?.tagName === 'A'
    )?.value as HTMLAnchorElement | undefined;
    if (anchor) {
      expect(anchor.download).toMatch(/\.md$/);
    }
  });
});

// ─── copyToClipboard ──────────────────────────────────────────────────────────

describe('copyToClipboard', () => {
  const writeTextMock = vi.fn<[string], Promise<void>>();

  beforeEach(() => {
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: writeTextMock },
      configurable: true,
      writable: true,
    });
    writeTextMock.mockResolvedValue(undefined);
  });

  it('returns true on success', async () => {
    const result = await copyToClipboard('Title', makeMessages(2));
    expect(result).toBe(true);
  });

  it('calls clipboard.writeText with markdown by default', async () => {
    const messages = makeMessages(2);
    await copyToClipboard('Mon Titre', messages, 'markdown');
    expect(writeTextMock).toHaveBeenCalledOnce();
    const arg = writeTextMock.mock.calls[0]?.[0] as string;
    expect(arg).toContain('# Mon Titre');
  });

  it('calls clipboard.writeText with JSON when format is "json"', async () => {
    const messages = makeMessages(2);
    await copyToClipboard('Test', messages, 'json');
    const arg = writeTextMock.mock.calls[0]?.[0] as string;
    const parsed = JSON.parse(arg);
    expect(parsed.conversation.title).toBe('Test');
  });

  it('returns false when clipboard throws', async () => {
    writeTextMock.mockRejectedValueOnce(new Error('Permission denied'));
    const result = await copyToClipboard('Test', makeMessages(1));
    expect(result).toBe(false);
  });

  it('copies markdown format by default (no format arg)', async () => {
    const messages = makeMessages(1);
    await copyToClipboard('Title', messages);
    const arg = writeTextMock.mock.calls[0]?.[0] as string;
    expect(arg).toContain('# Title');
  });
});
