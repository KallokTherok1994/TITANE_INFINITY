import { invoke } from '@tauri-apps/api/core';

export async function queryOllama(prompt: string): Promise<string> {
  return invoke<string>('ollama_query', { prompt });
}
