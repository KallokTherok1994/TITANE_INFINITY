import { useSyncExternalStore } from 'react';
import {
  audioService,
  type AudioPlaybackProvider,
} from '@/features/audio-center/services/audioService';

export type MessageSpeechStatus =
  | 'idle'
  | 'loading'
  | 'speaking'
  | 'paused'
  | 'completed'
  | 'stopped'
  | 'error';

export interface MessageSpeechState {
  messageId: string;
  status: MessageSpeechStatus;
  provider: AudioPlaybackProvider;
  error: string | null;
  supportsPause: boolean;
  canPlay: boolean;
}

interface MessageSpeechRecord {
  status: MessageSpeechStatus;
  provider: AudioPlaybackProvider;
  error: string | null;
  supportsPause: boolean;
  speakableText: string;
}

interface ControllerState {
  activeMessageId: string | null;
  records: Record<string, MessageSpeechRecord>;
}

const URL_PATTERN = /https?:\/\/[^\s)]+/gi;
const END_PUNCTUATION_PATTERN = /[.!?…]$/;
const MAX_WORDS_PER_SEGMENT = 18;
const MIN_WORDS_PER_SEGMENT = 3;

const listeners = new Set<() => void>();

let controllerState: ControllerState = {
  activeMessageId: null,
  records: {},
};

const emitChange = () => {
  listeners.forEach(listener => listener());
};

const updateState = (updater: (current: ControllerState) => ControllerState) => {
  controllerState = updater(controllerState);
  emitChange();
};

const buildDefaultRecord = (speakableText: string): MessageSpeechRecord => ({
  status: 'idle',
  provider: null,
  error: null,
  supportsPause: true,
  speakableText,
});

export const extractSpeakableText = (content: string): string => {
  const normalized = content
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/^>\s?/gm, '')
    .replace(/^#{1,6}\s*/gm, '')
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/^\s*\d+\.\s+/gm, '')
    .replace(/[*_~]+/g, '')
    .replace(/\|/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return normalized || content.trim();
};

export const prepareSpeechProsody = (text: string): string => {
  const normalized = text
    .replace(URL_PATTERN, 'lien web')
    .replace(/\n{2,}/g, '. ')
    .replace(/\n+/g, ', ')
    .replace(/\s*[-–—]\s*/g, ', ')
    .replace(/\s+([,;:.!?])/g, '$1')
    .replace(/([,;:.!?])(?!\s|$)/g, '$1 ')
    .replace(/\s{2,}/g, ' ')
    .trim();

  if (!normalized) {
    return '';
  }

  const sentenceLikeSegments = normalized
    .split(/(?<=[.!?;:])\s+/)
    .map(segment => segment.trim())
    .filter(segment => segment.length > 0);

  const splitLongSegments = sentenceLikeSegments.flatMap(segment => {
    const words = segment.split(/\s+/).filter(Boolean);
    if (words.length <= MAX_WORDS_PER_SEGMENT) {
      return [segment];
    }

    const chunks: string[] = [];
    for (let index = 0; index < words.length; index += MAX_WORDS_PER_SEGMENT) {
      chunks.push(words.slice(index, index + MAX_WORDS_PER_SEGMENT).join(' '));
    }
    return chunks;
  });

  const mergedSegments = splitLongSegments.reduce<string[]>((acc, segment) => {
    const current = segment.trim();
    if (!current) {
      return acc;
    }

    const wordCount = current.split(/\s+/).filter(Boolean).length;
    const previous = acc[acc.length - 1] ?? '';
    const previousHasStrongPause = /[.!?…:]$/.test(previous.trim());

    if (acc.length > 0 && wordCount < MIN_WORDS_PER_SEGMENT && !previousHasStrongPause) {
      const previous = acc[acc.length - 1] ?? '';
      acc[acc.length - 1] =
        `${previous.replace(/[.!?…;:]+$/g, '')}, ${current.replace(/^[,;:.!?\s]+/g, '')}`;
      return acc;
    }

    acc.push(current);
    return acc;
  }, []);

  const rebuilt = mergedSegments
    .join(' ')
    .replace(/\s+([,;:.!?])/g, '$1')
    .replace(/\s{2,}/g, ' ')
    .trim();

  if (END_PUNCTUATION_PATTERN.test(rebuilt)) {
    return rebuilt;
  }

  return `${rebuilt}.`;
};

class MessageSpeechController {
  private runtimePoll: ReturnType<typeof setInterval> | null = null;

  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }

  getState(): ControllerState {
    return controllerState;
  }

  getMessageState(messageId: string, content: string): MessageSpeechState {
    const speakableText = prepareSpeechProsody(extractSpeakableText(content));
    const record =
      controllerState.records[messageId] ?? buildDefaultRecord(speakableText);

    return {
      messageId,
      status: record.status,
      provider: record.provider,
      error: record.error,
      supportsPause: record.supportsPause,
      canPlay: speakableText.length > 0,
    };
  }

  private updateMessage(messageId: string, patch: Partial<MessageSpeechRecord>) {
    updateState(current => {
      const existing = current.records[messageId] ?? buildDefaultRecord('');
      return {
        ...current,
        records: {
          ...current.records,
          [messageId]: {
            ...existing,
            ...patch,
          },
        },
      };
    });
  }

  private setActiveMessage(messageId: string | null) {
    updateState(current => ({
      ...current,
      activeMessageId: messageId,
    }));
  }

  private startRuntimePoll(messageId: string) {
    this.stopRuntimePoll();
    this.runtimePoll = setInterval(() => {
      void this.refreshRuntime(messageId);
    }, 250);
  }

  private stopRuntimePoll() {
    if (this.runtimePoll !== null) {
      clearInterval(this.runtimePoll);
      this.runtimePoll = null;
    }
  }

  private async refreshRuntime(messageId: string): Promise<void> {
    if (controllerState.activeMessageId !== messageId) {
      return;
    }

    const runtime = await audioService.getPlaybackRuntimeState();
    const current = controllerState.records[messageId];
    if (!current) {
      return;
    }

    if (runtime.paused) {
      this.updateMessage(messageId, {
        status: 'paused',
        provider: runtime.provider,
        supportsPause: runtime.supportsPause,
      });
      return;
    }

    if (runtime.speaking) {
      this.updateMessage(messageId, {
        status: 'speaking',
        provider: runtime.provider,
        supportsPause: runtime.supportsPause,
      });
    }
  }

  async playMessage(messageId: string, content: string): Promise<void> {
    const speakableText = prepareSpeechProsody(extractSpeakableText(content));
    if (!speakableText) {
      this.updateMessage(messageId, {
        status: 'error',
        error: 'Aucun texte lisible à vocaliser.',
        provider: null,
        supportsPause: false,
        speakableText,
      });
      return;
    }

    if (
      controllerState.activeMessageId &&
      controllerState.activeMessageId !== messageId
    ) {
      await this.stop();
    }

    this.setActiveMessage(messageId);
    this.updateMessage(messageId, {
      status: 'loading',
      error: null,
      provider: null,
      supportsPause: true,
      speakableText,
    });
    this.startRuntimePoll(messageId);

    try {
      await audioService.speak(speakableText, {
        onStart: provider => {
          this.updateMessage(messageId, {
            status: 'speaking',
            provider,
            error: null,
            supportsPause: true,
          });
        },
        onFallback: provider => {
          this.updateMessage(messageId, {
            status: 'loading',
            provider,
            error: null,
            supportsPause: true,
          });
        },
      });
      this.updateMessage(messageId, {
        status: 'completed',
        provider: null,
        error: null,
        supportsPause: true,
      });
    } catch (error) {
      this.updateMessage(messageId, {
        status: 'error',
        error: error instanceof Error ? error.message : 'Lecture audio indisponible.',
        provider: null,
        supportsPause: true,
      });
    } finally {
      this.stopRuntimePoll();
      if (controllerState.activeMessageId === messageId) {
        this.setActiveMessage(null);
      }
    }
  }

  async pause(): Promise<void> {
    const activeMessageId = controllerState.activeMessageId;
    if (!activeMessageId) {
      return;
    }

    await audioService.pause();
    this.updateMessage(activeMessageId, {
      status: 'paused',
      provider: controllerState.records[activeMessageId]?.provider ?? null,
      supportsPause: true,
    });
  }

  async resume(): Promise<void> {
    const activeMessageId = controllerState.activeMessageId;
    if (!activeMessageId) {
      return;
    }

    await audioService.resume();
    this.updateMessage(activeMessageId, {
      status: 'speaking',
      provider: controllerState.records[activeMessageId]?.provider ?? null,
      supportsPause: true,
    });
  }

  async stop(): Promise<void> {
    const activeMessageId = controllerState.activeMessageId;
    this.stopRuntimePoll();
    await audioService.stop();

    if (activeMessageId) {
      this.updateMessage(activeMessageId, {
        status: 'stopped',
        provider: null,
        error: null,
        supportsPause: true,
      });
    }

    this.setActiveMessage(null);
  }
}

export const messageSpeechController = new MessageSpeechController();

export const useMessageSpeechState = (
  messageId: string,
  content: string
): MessageSpeechState => {
  useSyncExternalStore(
    listener => messageSpeechController.subscribe(listener),
    () => messageSpeechController.getState(),
    () => messageSpeechController.getState()
  );

  return messageSpeechController.getMessageState(messageId, content);
};
