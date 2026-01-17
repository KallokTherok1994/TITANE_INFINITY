import { secureInvoke } from '@/lib/security';

export async function queryOllama(any: any): Promise<string> {
  return secureInvoke<string>('ollama_query', { prompt });
}
