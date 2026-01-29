/**
 * TITANE∞ Fusion Backend - Tauri Command Wrappers - Week 2
 * Type-safe async bindings for IA and TTS commands
 *
 * © 2026 Kevin Thibault / TITANE Team
 */

import { invoke } from '@tauri-apps/api/core';
import type {
  IAGenerationRequest,
  IAGenerationResponse,
  TTSPrepareRequest,
  TTSPrepareResponse,
} from './types-week2';
import {
  isIAGenerationSuccess,
  isTTSPrepareSuccess,
} from './types-week2';

/**
 * Generate IA response from prompt
 *
 * @param request - Generation request with prompt and options
 * @returns Promise resolving to IAGenerationResponse
 * @throws Error if command fails
 *
 * @example
 * ```typescript
 * const response = await generateIAResponse({
 *   prompt: 'What is machine learning?',
 *   model: 'claude-haiku',
 *   temperature: 0.7,
 * });
 * ```
 */
export async function generateIAResponse(
  request: IAGenerationRequest
): Promise<IAGenerationResponse> {
  try {
    const response = await invoke<IAGenerationResponse>(
      'fusion_generate_ia_response',
      { request }
    );

    if (!isIAGenerationSuccess(response)) {
      throw new Error(
        typeof response === 'string' ? response : 'Unknown error'
      );
    }

    return response;
  } catch (error) {
    throw new Error(
      `IA generation failed: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Generate IA response with caching
 *
 * @param prompt - User input prompt
 * @param options - Optional generation parameters
 * @returns Promise resolving to IAGenerationResponse
 *
 * @example
 * ```typescript
 * const response = await generateWithCache(
 *   'What is the meaning of life?'
 * );
 * console.log(`Response was ${response.cached ? 'cached' : 'generated'}`);
 * ```
 */
export async function generateWithCache(
  prompt: string,
  options?: {
    model?: string;
    temperature?: number;
    max_tokens?: number;
    cache_key?: string;
  }
): Promise<IAGenerationResponse> {
  return generateIAResponse({
    prompt,
    enable_cache: true,
    ...options,
  });
}

/**
 * Generate IA response without caching
 *
 * @param prompt - User input prompt
 * @param options - Optional generation parameters
 * @returns Promise resolving to IAGenerationResponse
 */
export async function generateNoCach(
  prompt: string,
  options?: {
    model?: string;
    temperature?: number;
    max_tokens?: number;
  }
): Promise<IAGenerationResponse> {
  return generateIAResponse({
    prompt,
    enable_cache: false,
    ...options,
  });
}

/**
 * Generate with system prompt
 *
 * @param userPrompt - User input
 * @param systemPrompt - System instruction
 * @param options - Optional parameters
 * @returns Promise resolving to IAGenerationResponse
 */
export async function generateWithSystem(
  userPrompt: string,
  systemPrompt: string,
  options?: {
    model?: string;
    temperature?: number;
  }
): Promise<IAGenerationResponse> {
  return generateIAResponse({
    prompt: userPrompt,
    system_prompt: systemPrompt,
    ...options,
  });
}

/**
 * Prepare TTS audio buffer
 *
 * @param request - TTS preparation request
 * @returns Promise resolving to TTSPrepareResponse
 * @throws Error if command fails
 *
 * @example
 * ```typescript
 * const response = await prepareTTS({
 *   text: 'Hello, world!',
 *   voice: 'nova',
 *   format: 'mp3',
 * });
 * ```
 */
export async function prepareTTS(
  request: TTSPrepareRequest
): Promise<TTSPrepareResponse> {
  try {
    const response = await invoke<TTSPrepareResponse>(
      'fusion_prepare_tts',
      { request }
    );

    if (!isTTSPrepareSuccess(response)) {
      throw new Error(
        typeof response === 'string' ? response : 'Unknown error'
      );
    }

    return response;
  } catch (error) {
    throw new Error(
      `TTS preparation failed: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Prepare TTS with specific voice
 *
 * @param text - Text to synthesize
 * @param voice - Voice ID (nova, echo, fable)
 * @param options - Optional parameters
 * @returns Promise resolving to TTSPrepareResponse
 *
 * @example
 * ```typescript
 * const response = await prepareVoiceAudio(
 *   'This is a test',
 *   'nova'
 * );
 * ```
 */
export async function prepareVoiceAudio(
  text: string,
  voice: string,
  options?: {
    speed?: number;
    pitch?: number;
    format?: string;
    enable_streaming?: boolean;
  }
): Promise<TTSPrepareResponse> {
  return prepareTTS({
    text,
    voice,
    ...options,
  });
}

/**
 * Prepare TTS with streaming
 *
 * @param text - Text to synthesize
 * @param options - Optional parameters
 * @returns Promise resolving to TTSPrepareResponse
 *
 * @example
 * ```typescript
 * const response = await prepareTTSStream('Hello!');
 * console.log(`Prepared ${response.chunks_prepared} chunks`);
 * ```
 */
export async function prepareTTSStream(
  text: string,
  options?: {
    voice?: string;
    speed?: number;
    pitch?: number;
    format?: string;
  }
): Promise<TTSPrepareResponse> {
  return prepareTTS({
    text,
    enable_streaming: true,
    ...options,
  });
}

/**
 * Quick TTS preparation with defaults
 *
 * @param text - Text to synthesize
 * @returns Promise resolving to TTSPrepareResponse
 */
export async function quickTTS(text: string): Promise<TTSPrepareResponse> {
  return prepareTTS({
    text,
    voice: 'nova',
    format: 'mp3',
  });
}

/**
 * Convert TTS duration (ms) to readable format
 *
 * @param duration_ms - Duration in milliseconds
 * @returns Formatted string like "1m 30s"
 */
export function formatDuration(duration_ms: number): string {
  const seconds = Math.floor(duration_ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  }
  return `${remainingSeconds}s`;
}

/**
 * Format audio buffer size to human readable
 *
 * @param bytes - Size in bytes
 * @returns Formatted string like "2.5 MB"
 */
export function formatBufferSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

/**
 * Estimate audio duration based on text length and speed
 *
 * @param textLength - Length of text in characters
 * @param speed - Speech speed (0.5-2.0)
 * @returns Estimated duration in milliseconds
 */
export function estimateAudioDuration(
  textLength: number,
  speed: number = 1.0
): number {
  // Rough estimate: 150 words per minute = 2.5 words per second
  const estimatedWords = textLength / 5; // Average 5 chars per word
  const secondsAt1x = estimatedWords / 2.5;
  const adjustedSeconds = secondsAt1x / speed;
  return Math.round(adjustedSeconds * 1000);
}

/**
 * React hook for IA response generation
 *
 * @example
 * ```typescript
 * import { useIAGeneration } from '@/lib/fusion/hooks';
 *
 * export function MyComponent() {
 *   const { response, loading, error, generate } = useIAGeneration();
 *
 *   return (
 *     <div>
 *       <button onClick={() => generate('Hello')}>Generate</button>
 *       {loading && <p>Loading...</p>}
 *       {error && <p>Error: {error}</p>}
 *       {response && <p>{response.response}</p>}
 *     </div>
 *   );
 * }
 * ```
 */
export function useIAGeneration() {
  const [response, setResponse] = React.useState<IAGenerationResponse | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const generate = React.useCallback(
    async (prompt: string, options?: Parameters<typeof generateIAResponse>[0]) => {
      setLoading(true);
      setError(null);
      try {
        const result = await generateIAResponse({
          prompt,
          ...options,
        });
        setResponse(result);
        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { response, loading, error, generate };
}

// Note: React import needed for hook
import React from 'react';
