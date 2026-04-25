/**
 * TITANE∞ — Remote Streaming Client (WebSocket)
 *
 * Connects to ws[s]://host/api/stream?token=<JWT>
 * Provides an async iterator of stream chunks.
 *
 * @module remoteStream
 */

// ── Types ────────────────────────────────────────────────────

export interface StreamChunk {
  ok: boolean;
  stream_id: string;
  chunk?: string;
  done: boolean;
  error?: string;
}

export interface StreamRequest {
  command: string;
  payload?: Record<string, unknown>;
  stream_id?: string;
}

// ── RemoteStreamClient ─────────────────────────────────────────

export class RemoteStreamClient {
  private wsUrl: string;

  constructor(baseUrl: string) {
    // Convert https://host → wss://host, http://host → ws://host
    this.wsUrl = baseUrl.replace(/^https?:\/\//, (m) =>
      m.startsWith('https') ? 'wss://' : 'ws://',
    );
  }

  /**
   * Open a WebSocket stream and return an async generator of chunks.
   * The connection is closed automatically when done or on error.
   *
   * @param token - JWT access token
   * @param request - stream command + payload
   */
  async *stream(
    token: string,
    request: StreamRequest,
  ): AsyncGenerator<StreamChunk, void, unknown> {
    const url = `${this.wsUrl}/api/stream?token=${encodeURIComponent(token)}`;
    const ws = new WebSocket(url);

    // Queue for incoming messages
    const queue: Array<StreamChunk> = [];
    let resolve: ((value: StreamChunk | undefined) => void) | null = null;
    let done = false;
    let openError: Error | null = null;

    ws.onopen = () => {
      ws.send(JSON.stringify(request));
    };

    ws.onerror = (e) => {
      openError = new Error('WebSocket error');
      if (resolve) {
        resolve(undefined);
        resolve = null;
      }
    };

    ws.onclose = () => {
      done = true;
      if (resolve) {
        resolve(undefined);
        resolve = null;
      }
    };

    ws.onmessage = (evt) => {
      try {
        const chunk: StreamChunk = JSON.parse(evt.data);
        if (resolve) {
          resolve(chunk);
          resolve = null;
        } else {
          queue.push(chunk);
        }
        if (chunk.done) {
          ws.close();
        }
      } catch {
        // Malformed message — ignore
      }
    };

    const next = (): Promise<StreamChunk | undefined> => {
      if (queue.length > 0) return Promise.resolve(queue.shift());
      if (done) return Promise.resolve(undefined);
      return new Promise((r) => {
        resolve = r;
      });
    };

    while (true) {
      if (openError) throw openError;
      const chunk = await next();
      if (chunk === undefined) break;
      yield chunk;
      if (chunk.done) break;
    }
  }

  /**
   * Convenience: collect all chunks into a single string.
   */
  async collect(token: string, request: StreamRequest): Promise<string> {
    const parts: string[] = [];
    for await (const chunk of this.stream(token, request)) {
      if (!chunk.ok) throw new Error(chunk.error ?? 'Stream error');
      if (chunk.chunk) parts.push(chunk.chunk);
    }
    return parts.join('');
  }
}

// ── Singleton ─────────────────────────────────────────────────

let _client: RemoteStreamClient | null = null;

export function getRemoteStreamClient(baseUrl?: string): RemoteStreamClient {
  if (!_client) {
    const base =
      baseUrl ??
      (typeof window !== 'undefined'
        ? ((window as Window & { __TITANE_REMOTE_BASE__?: string }).__TITANE_REMOTE_BASE__ ||
           window.location.origin)
        : 'http://localhost:7420');
    _client = new RemoteStreamClient(base as string);
  }
  return _client;
}
