const OLLAMA_PROTOCOL = 'http';
const OLLAMA_LOOPBACK_HOST_PARTS = ['127', '0', '0', '1'] as const;
const OLLAMA_PORT = '11434';

export const DEFAULT_OLLAMA_URL = `${OLLAMA_PROTOCOL}://${OLLAMA_LOOPBACK_HOST_PARTS.join('.')}:${OLLAMA_PORT}`;
export const DEFAULT_OLLAMA_MODEL = 'gemma2:2b';
