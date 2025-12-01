import { secureInvoke } from '@/lib/security';

export async function queryOllama(prompt: string): Promise<string> {
  return secureInvoke<string>('ollama_query', { prompt });
}
