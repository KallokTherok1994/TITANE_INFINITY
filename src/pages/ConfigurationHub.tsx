/**
 * TITANE_INFINITY v∞.19.5.2 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════
 *   CONFIGURATION HUB v2 - Unified Configuration Dashboard with EDIT MODE
 *   Phase 2: Configuration Management UI (Day 3-4: Edit Mode)
 * ═══════════════════════════════════════════════════════════════
 */

import React, { useEffect, useState } from 'react';
import { tauriClient } from '@/lib/tauriClient';
import { invalidateRequestDefaultsCache } from '@/services/tauri/chatEngine.commands';
import { useToast } from '@/hooks/useToast';
import { ConfigSection, ConfigFieldEditable } from '../components/config';
import { useCognitiveLayout, type UIMode } from '@/hooks/useCognitiveLayout';
import './ModulePages.css';

import { createLogger } from '@/utils/logger';

const logger = createLogger('ConfigHub');

interface RuntimeConfig {
  ollama_url: string;
  ollama_model: string;
  ollama_endpoint_kind:
    | 'local_loopback'
    | 'remote_cloudflare'
    | 'custom_remote'
    | 'not_checked';
  ollama_endpoint_source: 'runtime_persisted' | 'env' | 'default' | 'not_checked';
  ollama_model_source: 'runtime_persisted' | 'env' | 'default' | 'not_checked';
  ollama_network_used: boolean;
  ollama_health: 'healthy' | 'degraded' | 'offline' | 'not_checked';
  secrets_mode: string;
  gemini_configured: boolean;
  timestamp: number;
}

interface OllamaRuntimeStatus {
  available: boolean;
  url: string;
  model: string;
  endpoint_kind: RuntimeConfig['ollama_endpoint_kind'];
  endpoint_source: RuntimeConfig['ollama_endpoint_source'];
  model_source: RuntimeConfig['ollama_model_source'];
  network_used: boolean;
  health: RuntimeConfig['ollama_health'];
}

interface ChatEngineConfig {
  response_timeout_ms: number;
  stream_chunk_size: number;
  memory_context_tokens: number;
  memory_retention_tokens: number;
  memory_flush_interval_ms: number;
  auto_tts_enabled: boolean;
  stream_channel_buffer: number;
}

interface ChatRequestDefaults {
  temperature: number;
  max_output_tokens: number;
  provider: 'auto' | 'gemini' | 'ollama' | 'local';
  enable_streaming: boolean;
}

interface IpcEnvelope<T> {
  ok: boolean;
  content: T | null;
  error: { code: string; message: string } | null;
}

interface ConfigSnapshot {
  runtime: RuntimeConfig;
  chat_engine: {
    timeout_ms: number;
    chunk_size: number;
    max_tokens: number;
    temperature: number;
  };
  timestamp: number;
  version: string;
}

interface ChatEngineConfigPayload {
  responseTimeoutMs: number;
  streamChunkSize: number;
  memoryContextTokens: number;
  memoryRetentionTokens: number;
  memoryFlushIntervalMs: number;
  autoTtsEnabled: boolean;
  streamChannelBuffer: number;
}

interface ChatRequestDefaultsPayload {
  temperature: number;
  maxOutputTokens: number;
  provider: 'auto' | 'gemini' | 'ollama' | 'local';
  enableStreaming: boolean;
}

const toRecord = (value: unknown): Record<string, unknown> | null => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }
  return value as Record<string, unknown>;
};

const pickDefined = <T,>(...values: Array<T | null | undefined>): T | undefined => {
  for (const value of values) {
    if (value !== undefined && value !== null) {
      return value;
    }
  }
  return undefined;
};

const asString = (value: unknown): string | undefined =>
  typeof value === 'string' ? value : undefined;

const asNumber = (value: unknown): number | undefined => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return undefined;
};

const asBoolean = (value: unknown): boolean | undefined =>
  typeof value === 'boolean' ? value : undefined;

import { DEFAULT_OLLAMA_MODEL, DEFAULT_OLLAMA_URL } from '@/config/ollamaDefaults';

const normalizeProvider = (value: unknown): ChatRequestDefaults['provider'] => {
  const raw = asString(value)?.toLowerCase();
  if (raw === 'gemini' || raw === 'ollama' || raw === 'local') {
    return raw;
  }
  return 'auto';
};

export const normalizeRuntimeConfig = (value: unknown): RuntimeConfig => {
  const raw = toRecord(value);
  if (!raw) {
    throw new Error('Runtime config invalide');
  }

  // Keep the page operational even when a partial runtime payload is returned.
  const ollama_url =
    pickDefined(asString(raw.ollama_url), asString(raw.ollamaUrl)) ?? DEFAULT_OLLAMA_URL;
  const ollama_model =
    pickDefined(asString(raw.ollama_model), asString(raw.ollamaModel)) ??
    DEFAULT_OLLAMA_MODEL;

  return {
    ollama_url,
    ollama_model,
    ollama_endpoint_kind:
      (pickDefined(
        asString(raw.ollama_endpoint_kind),
        asString(raw.ollamaEndpointKind)
      ) as RuntimeConfig['ollama_endpoint_kind'] | undefined) ?? 'not_checked',
    ollama_endpoint_source:
      (pickDefined(
        asString(raw.ollama_endpoint_source),
        asString(raw.ollamaEndpointSource)
      ) as RuntimeConfig['ollama_endpoint_source'] | undefined) ?? 'not_checked',
    ollama_model_source:
      (pickDefined(asString(raw.ollama_model_source), asString(raw.ollamaModelSource)) as
        | RuntimeConfig['ollama_model_source']
        | undefined) ?? 'not_checked',
    ollama_network_used:
      pickDefined(asBoolean(raw.ollama_network_used), asBoolean(raw.ollamaNetworkUsed)) ??
      false,
    ollama_health:
      (pickDefined(asString(raw.ollama_health), asString(raw.ollamaHealth)) as
        | RuntimeConfig['ollama_health']
        | undefined) ?? 'not_checked',
    secrets_mode:
      pickDefined(asString(raw.secrets_mode), asString(raw.secretsMode)) ?? 'encrypted',
    gemini_configured:
      pickDefined(asBoolean(raw.gemini_configured), asBoolean(raw.geminiConfigured)) ??
      false,
    timestamp:
      pickDefined(asNumber(raw.timestamp), asNumber(raw.updatedAt)) ??
      Math.floor(Date.now() / 1000),
  };
};

export const normalizeOllamaRuntimeStatus = (
  value: unknown
): OllamaRuntimeStatus | null => {
  const raw = toRecord(value);
  if (!raw) {
    return null;
  }

  const payload =
    typeof raw.ok === 'boolean' && toRecord(raw.content) ? toRecord(raw.content) : raw;

  if (!payload) {
    return null;
  }

  return {
    available: asBoolean(payload.available) ?? false,
    url: asString(payload.url) ?? 'not_checked',
    model: asString(payload.model) ?? 'not_checked',
    endpoint_kind:
      (asString(payload.endpoint_kind) as
        | OllamaRuntimeStatus['endpoint_kind']
        | undefined) ?? 'not_checked',
    endpoint_source:
      (asString(payload.endpoint_source) as
        | OllamaRuntimeStatus['endpoint_source']
        | undefined) ?? 'not_checked',
    model_source:
      (asString(payload.model_source) as
        | OllamaRuntimeStatus['model_source']
        | undefined) ?? 'not_checked',
    network_used: asBoolean(payload.network_used) ?? false,
    health:
      (asString(payload.health) as OllamaRuntimeStatus['health'] | undefined) ??
      'not_checked',
  };
};

export const mergeRuntimeConfigWithOllamaStatus = (
  runtime: RuntimeConfig,
  ollamaStatus: OllamaRuntimeStatus | null
): RuntimeConfig => {
  if (!ollamaStatus) {
    return runtime;
  }

  return {
    ...runtime,
    ollama_url:
      ollamaStatus.url !== 'not_checked' ? ollamaStatus.url : runtime.ollama_url,
    ollama_model:
      ollamaStatus.model !== 'not_checked' ? ollamaStatus.model : runtime.ollama_model,
    ollama_endpoint_kind: ollamaStatus.endpoint_kind,
    ollama_endpoint_source: ollamaStatus.endpoint_source,
    ollama_model_source: ollamaStatus.model_source,
    ollama_network_used: ollamaStatus.network_used,
    ollama_health: ollamaStatus.health,
  };
};

const normalizeChatEngineConfig = (value: unknown): ChatEngineConfig => {
  const raw = toRecord(value);
  if (!raw) {
    throw new Error('Chat engine config invalide');
  }

  const response_timeout_ms = pickDefined(
    asNumber(raw.response_timeout_ms),
    asNumber(raw.responseTimeoutMs)
  );
  const stream_chunk_size = pickDefined(
    asNumber(raw.stream_chunk_size),
    asNumber(raw.streamChunkSize)
  );
  const memory_context_tokens = pickDefined(
    asNumber(raw.memory_context_tokens),
    asNumber(raw.memoryContextTokens)
  );
  const memory_retention_tokens = pickDefined(
    asNumber(raw.memory_retention_tokens),
    asNumber(raw.memoryRetentionTokens)
  );
  const memory_flush_interval_ms = pickDefined(
    asNumber(raw.memory_flush_interval_ms),
    asNumber(raw.memoryFlushIntervalMs)
  );
  const auto_tts_enabled = pickDefined(
    asBoolean(raw.auto_tts_enabled),
    asBoolean(raw.autoTtsEnabled)
  );
  const stream_channel_buffer = pickDefined(
    asNumber(raw.stream_channel_buffer),
    asNumber(raw.streamChannelBuffer)
  );

  if (
    response_timeout_ms === undefined ||
    stream_chunk_size === undefined ||
    memory_context_tokens === undefined ||
    memory_retention_tokens === undefined ||
    memory_flush_interval_ms === undefined ||
    auto_tts_enabled === undefined ||
    stream_channel_buffer === undefined
  ) {
    throw new Error('Chat engine config incomplete');
  }

  return {
    response_timeout_ms,
    stream_chunk_size,
    memory_context_tokens,
    memory_retention_tokens,
    memory_flush_interval_ms,
    auto_tts_enabled,
    stream_channel_buffer,
  };
};

const normalizeChatRequestDefaults = (value: unknown): ChatRequestDefaults => {
  const raw = toRecord(value);
  if (!raw) {
    throw new Error('Chat request defaults invalides');
  }

  const temperature = asNumber(raw.temperature);
  const max_output_tokens = pickDefined(
    asNumber(raw.max_output_tokens),
    asNumber(raw.maxOutputTokens)
  );
  const enable_streaming = pickDefined(
    asBoolean(raw.enable_streaming),
    asBoolean(raw.enableStreaming)
  );

  if (
    temperature === undefined ||
    max_output_tokens === undefined ||
    enable_streaming === undefined
  ) {
    throw new Error('Chat request defaults incomplets');
  }

  return {
    temperature,
    max_output_tokens,
    provider: normalizeProvider(raw.provider),
    enable_streaming,
  };
};

const normalizeConfigSnapshot = (value: unknown): ConfigSnapshot => {
  const raw = toRecord(value);
  if (!raw) {
    throw new Error('Snapshot de configuration invalide');
  }

  const runtime = normalizeRuntimeConfig(raw.runtime);
  const rawChatEngine = pickDefined(toRecord(raw.chat_engine), toRecord(raw.chatEngine));
  if (!rawChatEngine) {
    throw new Error('Snapshot chat_engine manquant');
  }

  const timeout_ms = pickDefined(
    asNumber(rawChatEngine.timeout_ms),
    asNumber(rawChatEngine.timeoutMs)
  );
  const chunk_size = pickDefined(
    asNumber(rawChatEngine.chunk_size),
    asNumber(rawChatEngine.chunkSize)
  );
  const max_tokens = pickDefined(
    asNumber(rawChatEngine.max_tokens),
    asNumber(rawChatEngine.maxTokens)
  );
  const temperature = asNumber(rawChatEngine.temperature);

  if (
    timeout_ms === undefined ||
    chunk_size === undefined ||
    max_tokens === undefined ||
    temperature === undefined
  ) {
    throw new Error('Snapshot chat_engine incomplet');
  }

  return {
    runtime,
    chat_engine: {
      timeout_ms,
      chunk_size,
      max_tokens,
      temperature,
    },
    timestamp: asNumber(raw.timestamp) ?? Math.floor(Date.now() / 1000),
    version: asString(raw.version) ?? 'unknown',
  };
};

const normalizeEnvelope = <T,>(
  value: unknown,
  contentParser: (content: unknown) => T
): IpcEnvelope<T> => {
  const raw = toRecord(value);
  if (!raw) {
    throw new Error('Invalid IPC response');
  }

  const ok = asBoolean(raw.ok);
  if (ok === undefined) {
    throw new Error('IPC response missing ok field');
  }

  const errorRaw = toRecord(raw.error);
  const error = errorRaw
    ? {
        code: asString(errorRaw.code) ?? 'IPC_ERROR',
        message: asString(errorRaw.message) ?? 'Erreur IPC inconnue',
      }
    : null;

  if (!ok) {
    return {
      ok: false,
      content: null,
      error: error ?? { code: 'IPC_ERROR', message: 'IPC response failed' },
    };
  }

  return {
    ok: true,
    content: contentParser(raw.content),
    error: null,
  };
};

const normalizeSnapshotResponse = (value: unknown): ConfigSnapshot => {
  const raw = toRecord(value);
  if (!raw) {
    throw new Error('Snapshot de configuration invalide');
  }

  const hasEnvelopeShape = typeof raw.ok === 'boolean';
  if (!hasEnvelopeShape) {
    return normalizeConfigSnapshot(raw);
  }

  const envelope = normalizeEnvelope(raw, normalizeConfigSnapshot);
  if (!envelope.ok || !envelope.content) {
    throw new Error(envelope.error?.message || 'Snapshot de configuration indisponible');
  }

  return envelope.content;
};

type ConfigTab = 'system' | 'ai' | 'performance' | 'audio';

export const ConfigurationHub: React.FC = () => {
  const [config, setConfig] = useState<ConfigSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ConfigTab>('system');
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const { success, error: errorToast } = useToast();

  // Cognitive Layout Engine (déplacé depuis panneau flottant)
  const {
    currentMode: cognitiveMode,
    setMode: setCognitiveMode,
    toggleAdaptation,
    isAdaptationEnabled,
  } = useCognitiveLayout();

  const COGNITIVE_MODE_LABELS: Record<UIMode, string> = {
    focus_deep: '🎯 Focus Profond',
    exploration: '🔍 Exploration',
    monitoring: '📊 Monitoring',
    maintenance: '🔧 Maintenance',
    coaching: '🎓 Coaching',
    neutral: '⚖️ Neutre',
  };

  // Edit mode state
  const [editMode, setEditMode] = useState(false);
  const [editedRuntime, setEditedRuntime] = useState<Partial<RuntimeConfig>>({});
  const [editedChatEngine, setEditedChatEngine] = useState<Partial<ChatEngineConfig>>({});
  const [engineConfig, setEngineConfig] = useState<ChatEngineConfig | null>(null);
  const [editedRequestDefaults, setEditedRequestDefaults] = useState<
    Partial<ChatRequestDefaults>
  >({});
  const [requestDefaults, setRequestDefaults] = useState<ChatRequestDefaults | null>(
    null
  );
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  // Audio device config state (canonical — single source of truth)
  // Display System state (future integration)
  const [displayEnv, setDisplayEnv] = useState<any>(null);
  const [displayMonitors, setDisplayMonitors] = useState<any[]>([]);
  const [displayStatus, setDisplayStatus] = useState<string>('');
  const [displayLoading, setDisplayLoading] = useState(false);
  const [displayError, setDisplayError] = useState<string | null>(null);

  // Placeholder: simulate loading display environment (to be replaced by real service)
  useEffect(() => {
    setDisplayLoading(true);
    setTimeout(() => {
      setDisplayEnv({
        session: 'x11',
        permissions: 'ok',
        tools: ['xrandr', 'brightnessctl'],
        blocked: false,
      });
      setDisplayMonitors([
        {
          id: 'HDMI-1',
          name: 'HDMI-1',
          modes: ['1920x1080@60', '1280x720@60'],
          current: '1920x1080@60',
          brightness: 0.8,
        },
        {
          id: 'eDP-1',
          name: 'eDP-1',
          modes: ['1920x1080@60'],
          current: '1920x1080@60',
          brightness: 0.6,
        },
      ]);
      setDisplayStatus('Disponible');
      setDisplayLoading(false);
    }, 800);
  }, []);
  const [audioConfig, setAudioConfig] = useState<{
    inputDeviceId: string;
    inputDeviceLabel: string;
    outputDeviceId: string;
    outputDeviceLabel: string;
    volume: number;
    noiseReduction: boolean;
    echoCancellation: boolean;
    autoGainControl: boolean;
  }>({
    inputDeviceId: '',
    inputDeviceLabel: '',
    outputDeviceId: '',
    outputDeviceLabel: '',
    volume: 1.0,
    noiseReduction: false,
    echoCancellation: false,
    autoGainControl: false,
  });
  const [audioSaving, setAudioSaving] = useState(false);

  // Presets state
  const [presets, setPresets] = useState<Array<{ name: string; description: string }>>(
    []
  );
  const [_showPresetDialog, _setShowPresetDialog] = useState(false);

  const loadConfig = async () => {
    setLoading(true);
    setError(null);

    try {
      logger.info('🎯 [ConfigHub] Loading configuration snapshot...');
      const [snapshotRaw, ollamaStatusRaw] = await Promise.all([
        tauriClient.getAllConfigs(),
        tauriClient.aiCheckOllamaStatus().catch(() => null),
      ]);
      const snapshot = normalizeSnapshotResponse(snapshotRaw);
      const runtime = mergeRuntimeConfigWithOllamaStatus(
        snapshot.runtime,
        normalizeOllamaRuntimeStatus(ollamaStatusRaw)
      );
      const engineEnvelope = normalizeEnvelope(
        await tauriClient.getChatEngineConfig(),
        normalizeChatEngineConfig
      );
      const defaultsEnvelope = normalizeEnvelope(
        await tauriClient.getChatRequestDefaults(),
        normalizeChatRequestDefaults
      );

      if (!engineEnvelope.ok || !engineEnvelope.content) {
        throw new Error(
          engineEnvelope.error?.message ||
            'Impossible de charger Chat Engine Configuration'
        );
      }

      if (!defaultsEnvelope.ok || !defaultsEnvelope.content) {
        throw new Error(
          defaultsEnvelope.error?.message || 'Impossible de charger Chat Request Defaults'
        );
      }

      logger.info('✅ [ConfigHub] Configuration loaded:', snapshot);
      setConfig({
        ...snapshot,
        runtime,
        chat_engine: {
          timeout_ms: engineEnvelope.content.response_timeout_ms,
          chunk_size: engineEnvelope.content.stream_chunk_size,
          max_tokens: defaultsEnvelope.content.max_output_tokens,
          temperature: defaultsEnvelope.content.temperature,
        },
      });
      setEngineConfig(engineEnvelope.content);
      setRequestDefaults(defaultsEnvelope.content);
      setLastRefresh(new Date());
      // Reset edit state when reloading
      setEditedRuntime({});
      setEditedChatEngine({});
      setEditedRequestDefaults({});
      setValidationErrors({});
    } catch (err) {
      logger.error('❌ [ConfigHub] Failed to load configuration:', err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }

    // Load canonical audio device config (independent — no throw on failure)
    try {
      const raw = await tauriClient.getAudioDeviceConfig();
      if (raw && typeof raw === 'object') {
        const r = raw as Record<string, unknown>;
        setAudioConfig({
          inputDeviceId: (r.inputDeviceId as string) || '',
          inputDeviceLabel: (r.inputDeviceLabel as string) || '',
          outputDeviceId: (r.outputDeviceId as string) || '',
          outputDeviceLabel: (r.outputDeviceLabel as string) || '',
          volume: typeof r.volume === 'number' ? r.volume : 1.0,
          noiseReduction: Boolean(r.noiseReduction),
          echoCancellation: Boolean(r.echoCancellation),
          autoGainControl: Boolean(r.autoGainControl),
        });
      }
    } catch (audioErr) {
      logger.warn('[ConfigHub] Audio config load failed (non-fatal):', audioErr);
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  const handleEditToggle = () => {
    if (editMode) {
      // Cancel edit - reset changes
      setEditedRuntime({});
      setEditedChatEngine({});
      setEditedRequestDefaults({});
      setValidationErrors({});
    }
    setEditMode(!editMode);
  };

  const handleRuntimeFieldChange = (
    field: keyof RuntimeConfig,
    value: string | number | boolean
  ) => {
    setEditedRuntime(prev => ({
      ...prev,
      [field]: value,
    }));
    // Clear validation error for this field
    setValidationErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[`runtime.${field}`];
      return newErrors;
    });
  };

  const handleChatEngineFieldChange = (
    field: keyof ChatEngineConfig,
    value: string | number | boolean
  ) => {
    setEditedChatEngine(prev => ({
      ...prev,
      [field]: value,
    }));
    // Clear validation error for this field
    setValidationErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[`chat_engine.${field}`];
      return newErrors;
    });
  };

  const handleRequestDefaultsFieldChange = (
    field: keyof ChatRequestDefaults,
    value: string | number | boolean
  ) => {
    setEditedRequestDefaults(prev => ({
      ...prev,
      [field]: value,
    }));
    setValidationErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[`request_defaults.${field}`];
      return newErrors;
    });
  };

  const handleSave = async () => {
    if (!config || !requestDefaults || !engineConfig) return;

    setSaving(true);
    setValidationErrors({});

    try {
      logger.info('💾 [ConfigHub] Saving configuration...');

      // Save runtime config if changed
      if (Object.keys(editedRuntime).length > 0) {
        logger.info('📤 [ConfigHub] Updating runtime config:', editedRuntime);
        await tauriClient.updateRuntimeConfig({
          update: {
            ollama_url: editedRuntime.ollama_url,
            ollama_model: editedRuntime.ollama_model,
          },
        });
        logger.info('✅ [ConfigHub] Runtime config updated');
      }

      // Save chat engine config if changed
      if (Object.keys(editedChatEngine).length > 0) {
        logger.info('📤 [ConfigHub] Updating chat engine config:', editedChatEngine);
        const payload: ChatEngineConfigPayload = {
          responseTimeoutMs:
            editedChatEngine.response_timeout_ms ?? engineConfig.response_timeout_ms,
          streamChunkSize:
            editedChatEngine.stream_chunk_size ?? engineConfig.stream_chunk_size,
          memoryContextTokens:
            editedChatEngine.memory_context_tokens ?? engineConfig.memory_context_tokens,
          memoryRetentionTokens:
            editedChatEngine.memory_retention_tokens ??
            engineConfig.memory_retention_tokens,
          memoryFlushIntervalMs:
            editedChatEngine.memory_flush_interval_ms ??
            engineConfig.memory_flush_interval_ms,
          autoTtsEnabled:
            editedChatEngine.auto_tts_enabled ?? engineConfig.auto_tts_enabled,
          streamChannelBuffer:
            editedChatEngine.stream_channel_buffer ?? engineConfig.stream_channel_buffer,
        };

        const envelope = normalizeEnvelope(
          await tauriClient.setChatEngineConfig({
            config: payload,
          }),
          normalizeChatEngineConfig
        );
        if (!envelope.ok) {
          throw new Error(
            envelope.error?.message || 'Échec mise à jour Chat Engine Configuration'
          );
        }
        logger.info('✅ [ConfigHub] Chat engine config updated');
      }

      if (Object.keys(editedRequestDefaults).length > 0) {
        const payload: ChatRequestDefaultsPayload = {
          temperature: editedRequestDefaults.temperature ?? requestDefaults.temperature,
          maxOutputTokens:
            editedRequestDefaults.max_output_tokens ?? requestDefaults.max_output_tokens,
          provider: (editedRequestDefaults.provider ??
            requestDefaults.provider) as ChatRequestDefaults['provider'],
          enableStreaming:
            editedRequestDefaults.enable_streaming ?? requestDefaults.enable_streaming,
        };
        const envelope = normalizeEnvelope(
          await tauriClient.setChatRequestDefaults({
            defaults: payload,
          }),
          normalizeChatRequestDefaults
        );
        if (!envelope.ok) {
          throw new Error(
            envelope.error?.message || 'Échec mise à jour Chat Request Defaults'
          );
        }
        invalidateRequestDefaultsCache();
      }

      // Reload config after successful save
      await loadConfig();
      setEditMode(false);
      logger.info('✅ [ConfigHub] Configuration saved successfully');
    } catch (err) {
      logger.error('❌ [ConfigHub] Failed to save configuration:', err);
      const errorMsg = err instanceof Error ? err.message : String(err);

      // Try to parse validation errors from backend
      // Format: "field: error message"
      if (errorMsg.includes('URL Ollama')) {
        setValidationErrors({ 'runtime.ollama_url': errorMsg });
      } else if (errorMsg.includes('modèle')) {
        setValidationErrors({ 'runtime.ollama_model': errorMsg });
      } else if (errorMsg.includes('Timeout')) {
        setValidationErrors({ 'chat_engine.timeout_ms': errorMsg });
      } else if (errorMsg.includes('Chunk size')) {
        setValidationErrors({ 'chat_engine.chunk_size': errorMsg });
      } else if (errorMsg.includes('memory_context_tokens')) {
        setValidationErrors({ 'chat_engine.memory_context_tokens': errorMsg });
      } else if (errorMsg.includes('memory_retention_tokens')) {
        setValidationErrors({ 'chat_engine.memory_retention_tokens': errorMsg });
      } else if (errorMsg.includes('memory_flush_interval_ms')) {
        setValidationErrors({ 'chat_engine.memory_flush_interval_ms': errorMsg });
      } else if (errorMsg.includes('stream_channel_buffer')) {
        setValidationErrors({ 'chat_engine.stream_channel_buffer': errorMsg });
      } else if (errorMsg.includes('Max tokens')) {
        setValidationErrors({ 'chat_engine.max_tokens': errorMsg });
      } else if (errorMsg.includes('Temperature')) {
        setValidationErrors({ 'request_defaults.temperature': errorMsg });
      } else if (errorMsg.includes('max_output_tokens')) {
        setValidationErrors({ 'request_defaults.max_output_tokens': errorMsg });
      } else {
        setError(errorMsg);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleExport = async () => {
    try {
      const filename = `config-${new Date().toISOString().replace(/[:.]/g, '-')}`;
      logger.info('📤 [ConfigHub] Exporting configuration to:', filename);

      const filePath = (await tauriClient.exportConfig({ filename })) as string;
      logger.info('✅ [ConfigHub] Configuration exported to:', filePath);

      success(`Configuration exportée vers:\n${filePath}`);
    } catch (err) {
      logger.error('❌ [ConfigHub] Failed to export configuration:', err);
      errorToast(`Échec de l'export: ${err}`);
    }
  };

  const handleImport = async () => {
    // For now, we&apos;ll use a prompt to get the file path
    // In a real app, you&apos;d use a file picker dialog
    const filePath = prompt('Entrez le chemin du fichier JSON à importer:');

    if (!filePath) {
      return;
    }

    try {
      logger.info('📥 [ConfigHub] Importing configuration from:', filePath);

      const importedConfig = (await tauriClient.importConfig({
        filePath,
      })) as ConfigSnapshot;
      logger.info('✅ [ConfigHub] Configuration imported:', importedConfig);

      // Reload config to show imported values
      await loadConfig();

      success('Configuration importée avec succès.');
    } catch (err) {
      logger.error('❌ [ConfigHub] Failed to import configuration:', err);
      errorToast(`Échec de l'import: ${err}`);
    }
  };

  // Load presets on mount
  useEffect(() => {
    loadPresets();
  }, []);

  const loadPresets = async () => {
    try {
      const presetsList = (await tauriClient.listConfigPresets()) as Array<{
        name: string;
        description: string;
      }>;
      setPresets(presetsList);
    } catch (err) {
      logger.error('❌ [ConfigHub] Failed to load presets:', err);
    }
  };

  const handleSavePreset = async () => {
    const name = prompt('Nom du preset:');
    if (!name) return;

    const description = prompt('Description (optionnel):') || '';

    try {
      await tauriClient.saveConfigPreset({ name, description });
      success(`Preset "${name}" sauvegardé.`);
      await loadPresets();
    } catch (err) {
      logger.error('❌ [ConfigHub] Failed to save preset:', err);
      errorToast(`Échec de sauvegarde: ${err}`);
    }
  };

  const handleLoadPreset = async (name: string) => {
    if (
      !confirm(`Charger le preset "${name}"?\nCela remplacera la configuration actuelle.`)
    ) {
      return;
    }

    try {
      await tauriClient.loadConfigPreset({ name });
      await loadConfig();
      success(`Preset "${name}" chargé.`);
    } catch (err) {
      logger.error('❌ [ConfigHub] Failed to load preset:', err);
      errorToast(`Échec de chargement: ${err}`);
    }
  };

  const _handleDeletePreset = async (name: string) => {
    if (!confirm(`Supprimer le preset "${name}"?\nCette action est irréversible.`)) {
      return;
    }

    try {
      await tauriClient.deleteConfigPreset({ name });
      success(`Preset "${name}" supprimé.`);
      await loadPresets();
    } catch (err) {
      logger.error('❌ [ConfigHub] Failed to delete preset:', err);
      errorToast(`Échec de suppression: ${err}`);
    }
  };

  const tabStyle = (isActive: boolean) => ({
    padding: '0.75rem 1.5rem',
    background: isActive
      ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      : 'rgba(255,255,255,0.05)',
    border: isActive ? 'none' : '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    color: 'white',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: isActive ? 600 : 400,
    transition: 'all 0.2s ease',
  });

  if (loading && !config) {
    return (
      <div className="module-page">
        <div className="module-page__header">
          <h1 className="module-page__title">
            <span className="module-page__icon">🎯</span>
            Configuration Hub
          </h1>
        </div>
        <div
          style={{
            textAlign: 'center',
            padding: '3rem',
            color: 'var(--color-text-secondary)',
          }}
        >
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
          <div>Chargement de la configuration...</div>
        </div>
      </div>
    );
  }

  if (error && !config) {
    return (
      <div className="module-page">
        <div className="module-page__header">
          <h1 className="module-page__title">
            <span className="module-page__icon">🎯</span>
            Configuration Hub
          </h1>
        </div>
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <div
            style={{
              fontSize: '2rem',
              marginBottom: '1rem',
              color: 'var(--color-error)',
            }}
          >
            ❌
          </div>
          <div style={{ color: 'var(--color-error)', marginBottom: '1rem' }}>
            Erreur de chargement de la configuration
          </div>
          <div
            style={{
              fontSize: '0.85rem',
              color: 'var(--color-text-secondary)',
              marginBottom: '2rem',
            }}
          >
            {error}
          </div>
          <button
            onClick={loadConfig}
            style={{
              padding: '0.75rem 1.5rem',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            🔄 Réessayer
          </button>
        </div>
      </div>
    );
  }

  if (!config || !engineConfig || !requestDefaults) {
    const missingParts = [
      !config ? 'snapshot' : null,
      !engineConfig ? 'chat_engine' : null,
      !requestDefaults ? 'request_defaults' : null,
    ]
      .filter(Boolean)
      .join(', ');

    return (
      <div className="module-page">
        <div className="module-page__header">
          <h1 className="module-page__title">
            <span className="module-page__icon">🎯</span>
            Configuration Hub
          </h1>
        </div>
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <div
            style={{
              fontSize: '2rem',
              marginBottom: '1rem',
              color: 'var(--color-error)',
            }}
          >
            ⚠️
          </div>
          <div style={{ color: 'var(--color-error)', marginBottom: '1rem' }}>
            Configuration incomplete
          </div>
          <div
            style={{
              fontSize: '0.85rem',
              color: 'var(--color-text-secondary)',
              marginBottom: '1.5rem',
            }}
          >
            Missing data: {missingParts}
          </div>
          {error && (
            <div
              style={{
                fontSize: '0.85rem',
                color: 'var(--color-text-secondary)',
                marginBottom: '1.5rem',
              }}
            >
              Last error: {error}
            </div>
          )}
          <button
            onClick={loadConfig}
            style={{
              padding: '0.75rem 1.5rem',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            🔄 Reload Configuration
          </button>
        </div>
      </div>
    );
  }

  // Get current values (edited or original)
  const currentRuntime = {
    ollama_url: editedRuntime.ollama_url ?? config.runtime.ollama_url,
    ollama_model: editedRuntime.ollama_model ?? config.runtime.ollama_model,
    ollama_endpoint_kind: config.runtime.ollama_endpoint_kind ?? 'not_checked',
    ollama_endpoint_source: config.runtime.ollama_endpoint_source ?? 'not_checked',
    ollama_model_source: config.runtime.ollama_model_source ?? 'not_checked',
    ollama_network_used: config.runtime.ollama_network_used ?? false,
    ollama_health: config.runtime.ollama_health ?? 'not_checked',
    secrets_mode: config.runtime.secrets_mode,
    gemini_configured: config.runtime.gemini_configured,
    timestamp: config.runtime.timestamp ?? Math.floor(Date.now() / 1000),
  };

  const currentChatEngine = {
    response_timeout_ms:
      editedChatEngine.response_timeout_ms ?? engineConfig.response_timeout_ms,
    stream_chunk_size:
      editedChatEngine.stream_chunk_size ?? engineConfig.stream_chunk_size,
    memory_context_tokens:
      editedChatEngine.memory_context_tokens ?? engineConfig.memory_context_tokens,
    memory_retention_tokens:
      editedChatEngine.memory_retention_tokens ?? engineConfig.memory_retention_tokens,
    memory_flush_interval_ms:
      editedChatEngine.memory_flush_interval_ms ?? engineConfig.memory_flush_interval_ms,
    auto_tts_enabled: editedChatEngine.auto_tts_enabled ?? engineConfig.auto_tts_enabled,
    stream_channel_buffer:
      editedChatEngine.stream_channel_buffer ?? engineConfig.stream_channel_buffer,
  };

  const currentRequestDefaults = {
    temperature: editedRequestDefaults.temperature ?? requestDefaults.temperature,
    max_output_tokens:
      editedRequestDefaults.max_output_tokens ?? requestDefaults.max_output_tokens,
    provider: editedRequestDefaults.provider ?? requestDefaults.provider,
    enable_streaming:
      editedRequestDefaults.enable_streaming ?? requestDefaults.enable_streaming,
  };

  const hasChanges =
    Object.keys(editedRuntime).length > 0 ||
    Object.keys(editedChatEngine).length > 0 ||
    Object.keys(editedRequestDefaults).length > 0;

  return (
    <div className="module-page" data-testid="page-configuration-hub">
      {/* Header */}
      <div className="module-page__header">
        <div>
          <h1 className="module-page__title">
            {/* Display System (Experimental) Section */}
            <section
              className="config-section display-system-panel"
              data-testid="display-system-panel"
              style={{
                margin: '2rem 0',
                padding: '1.5rem',
                background: 'rgba(0,0,0,0.08)',
                borderRadius: 12,
              }}
            >
              <h2 style={{ marginBottom: 8 }}>
                🖥️ Display System{' '}
                <span style={{ fontSize: '0.8em', color: '#888' }}>(Experimental)</span>
              </h2>
              {displayLoading ? (
                <div style={{ color: '#888', padding: '1rem' }}>
                  Chargement de l’environnement d’affichage…
                </div>
              ) : displayError ? (
                <div
                  data-testid="display-system-status"
                  style={{ color: 'var(--color-error)' }}
                >
                  {displayError}
                </div>
              ) : (
                <>
                  <div data-testid="display-system-status" style={{ marginBottom: 12 }}>
                    <b>Statut&nbsp;:</b> {displayStatus}
                  </div>
                  <div data-testid="display-system-env" style={{ marginBottom: 12 }}>
                    <b>Session&nbsp;:</b> {displayEnv?.session} &nbsp;|
                    <b> Permissions&nbsp;:</b> {displayEnv?.permissions} &nbsp;|
                    <b> Outils&nbsp;:</b> {(displayEnv?.tools || []).join(', ')}
                  </div>
                  <div>
                    <label htmlFor="monitor-select">
                      <b>Moniteur&nbsp;:</b>
                    </label>
                    <select
                      id="monitor-select"
                      data-testid="display-monitor-select"
                      style={{ marginLeft: 8 }}
                    >
                      {displayMonitors.map(m => (
                        <option key={m.id} value={m.id}>
                          {m.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div style={{ marginTop: 12 }}>
                    <label htmlFor="mode-select">
                      <b>Mode vidéo&nbsp;:</b>
                    </label>
                    <select
                      id="mode-select"
                      data-testid="display-mode-select"
                      style={{ marginLeft: 8 }}
                    >
                      {displayMonitors[0]?.modes.map((mode: string) => (
                        <option key={mode} value={mode}>
                          {mode}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div style={{ marginTop: 12 }}>
                    <label htmlFor="brightness-slider">
                      <b>Luminosité&nbsp;:</b>
                    </label>
                    <input
                      id="brightness-slider"
                      data-testid="display-brightness-slider"
                      type="range"
                      min={0}
                      max={1}
                      step={0.01}
                      value={displayMonitors[0]?.brightness ?? 0.5}
                      style={{ marginLeft: 8, width: 180 }}
                      readOnly
                    />
                    <span style={{ marginLeft: 8 }}>
                      {Math.round((displayMonitors[0]?.brightness ?? 0.5) * 100)}%
                    </span>
                  </div>
                  <div style={{ marginTop: 16 }}>
                    <button
                      data-testid="display-apply"
                      style={{
                        marginRight: 12,
                        padding: '0.5rem 1.2rem',
                        borderRadius: 6,
                        background: '#667eea',
                        color: 'white',
                        border: 'none',
                      }}
                      disabled
                    >
                      Appliquer
                    </button>
                    <button
                      data-testid="display-rollback"
                      style={{
                        padding: '0.5rem 1.2rem',
                        borderRadius: 6,
                        background: '#aaa',
                        color: 'white',
                        border: 'none',
                      }}
                      disabled
                    >
                      Rollback
                    </button>
                  </div>
                </>
              )}
            </section>
            <span className="module-page__icon">🎯</span>
            Configuration Hub
            {editMode && (
              <span
                style={{
                  marginLeft: '1rem',
                  fontSize: '0.8rem',
                  padding: '0.25rem 0.75rem',
                  background: 'rgba(102, 126, 234, 0.2)',
                  borderRadius: '6px',
                  color: '#667eea',
                }}
              >
                MODE ÉDITION
              </span>
            )}
          </h1>
          <p className="module-page__subtitle">
            Visualisation et modification de toutes les configurations système
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {!editMode && (
            <>
              <button
                data-testid="btn-config-refresh"
                onClick={loadConfig}
                disabled={loading}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: loading
                    ? 'rgba(255, 255, 255, 0.1)'
                    : 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px',
                  color: 'white',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontWeight: 600,
                  transition: 'all 0.2s ease',
                  opacity: loading ? 0.6 : 1,
                }}
              >
                {loading ? '⏳ Actualisation...' : '🔄 Actualiser'}
              </button>
              <button
                data-testid="btn-config-export"
                onClick={handleExport}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  borderRadius: '8px',
                  color: '#10b981',
                  cursor: 'pointer',
                  fontWeight: 600,
                  transition: 'all 0.2s ease',
                }}
              >
                📤 Exporter
              </button>
              <button
                data-testid="btn-config-import"
                onClick={handleImport}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: 'rgba(59, 130, 246, 0.15)',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  borderRadius: '8px',
                  color: '#3b82f6',
                  cursor: 'pointer',
                  fontWeight: 600,
                  transition: 'all 0.2s ease',
                }}
              >
                📥 Importer
              </button>
              <button
                data-testid="btn-config-save-preset"
                onClick={handleSavePreset}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: 'rgba(168, 85, 247, 0.15)',
                  border: '1px solid rgba(168, 85, 247, 0.3)',
                  borderRadius: '8px',
                  color: '#a855f7',
                  cursor: 'pointer',
                  fontWeight: 600,
                  transition: 'all 0.2s ease',
                }}
              >
                💾 Sauver Preset
              </button>
              {presets.length > 0 && (
                <select
                  data-testid="select-config-preset"
                  onChange={e => {
                    if (e.target.value) {
                      handleLoadPreset(e.target.value);
                      e.target.value = '';
                    }
                  }}
                  style={{
                    padding: '0.75rem 1rem',
                    background: 'rgba(168, 85, 247, 0.15)',
                    border: '1px solid rgba(168, 85, 247, 0.3)',
                    borderRadius: '8px',
                    color: '#a855f7',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                  }}
                >
                  <option value="">📋 Charger Preset...</option>
                  {presets.map(preset => (
                    <option key={preset.name} value={preset.name}>
                      {preset.name}
                    </option>
                  ))}
                </select>
              )}
              <button
                data-testid="btn-config-edit"
                onClick={handleEditToggle}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white',
                  cursor: 'pointer',
                  fontWeight: 600,
                  transition: 'all 0.2s ease',
                }}
              >
                ✏️ Modifier
              </button>
            </>
          )}
          {editMode && (
            <>
              <button
                data-testid="btn-config-cancel"
                onClick={handleEditToggle}
                disabled={saving}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: 'rgba(255, 68, 68, 0.2)',
                  border: '1px solid rgba(255, 68, 68, 0.4)',
                  borderRadius: '8px',
                  color: '#ff4444',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  fontWeight: 600,
                  transition: 'all 0.2s ease',
                  opacity: saving ? 0.6 : 1,
                }}
              >
                ❌ Annuler
              </button>
              <button
                data-testid="btn-config-save"
                onClick={handleSave}
                disabled={saving || !hasChanges}
                style={{
                  padding: '0.75rem 1.5rem',
                  background:
                    saving || !hasChanges
                      ? 'rgba(255, 255, 255, 0.1)'
                      : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white',
                  cursor: saving || !hasChanges ? 'not-allowed' : 'pointer',
                  fontWeight: 600,
                  transition: 'all 0.2s ease',
                  opacity: saving || !hasChanges ? 0.6 : 1,
                }}
              >
                {saving ? '💾 Enregistrement...' : '✅ Enregistrer'}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Version & Timestamp Info */}
      <div
        style={{
          display: 'flex',
          gap: '1rem',
          padding: '1rem 1.5rem',
          background: editMode ? 'rgba(102, 126, 234, 0.15)' : 'rgba(102, 126, 234, 0.1)',
          borderRadius: '8px',
          border: editMode
            ? '1px solid rgba(102, 126, 234, 0.5)'
            : '1px solid rgba(102, 126, 234, 0.3)',
          marginBottom: '1.5rem',
        }}
      >
        <div>
          <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
            Version:{' '}
          </span>
          <span style={{ fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
            {config.version}
          </span>
        </div>
        <div
          style={{
            borderLeft: '1px solid rgba(255, 255, 255, 0.2)',
            paddingLeft: '1rem',
          }}
        >
          <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
            Dernière actualisation:{' '}
          </span>
          <span style={{ fontWeight: 600 }}>
            {lastRefresh.toLocaleTimeString('fr-FR')}
          </span>
        </div>
        {hasChanges && (
          <div
            style={{
              borderLeft: '1px solid rgba(255, 255, 255, 0.2)',
              paddingLeft: '1rem',
            }}
          >
            <span style={{ fontSize: '0.85rem', color: '#667eea' }}>
              ✏️{' '}
              {Object.keys(editedRuntime).length +
                Object.keys(editedChatEngine).length +
                Object.keys(editedRequestDefaults).length}{' '}
              modification(s)
            </span>
          </div>
        )}
      </div>

      {/* Tabs Navigation */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <button
          data-testid="tab-config-system"
          style={tabStyle(activeTab === 'system')}
          onClick={() => setActiveTab('system')}
        >
          💻 Système
        </button>
        <button
          data-testid="tab-config-ai"
          style={tabStyle(activeTab === 'ai')}
          onClick={() => setActiveTab('ai')}
        >
          🤖 Intelligence Artificielle
        </button>
        <button
          data-testid="tab-config-performance"
          style={tabStyle(activeTab === 'performance')}
          onClick={() => setActiveTab('performance')}
        >
          ⚡ Performance
        </button>
        <button
          data-testid="tab-config-audio"
          style={tabStyle(activeTab === 'audio')}
          onClick={() => setActiveTab('audio')}
        >
          🎤 Audio
        </button>
      </div>

      {/* Tab Content */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {activeTab === 'system' && (
          <>
            <ConfigSection
              title="Runtime Configuration"
              icon="⚙️"
              description="Configuration d'exécution du système"
              defaultOpen={true}
            >
              <ConfigFieldEditable
                label="Ollama URL"
                value={currentRuntime.ollama_url}
                description="Endpoint Ollama effectivement résolu par le backend"
                icon="🌐"
                valueType="url"
                editable={editMode}
                testId="input-ollama-url"
                onChange={value => handleRuntimeFieldChange('ollama_url', value)}
                validationError={validationErrors['runtime.ollama_url']}
              />
              <ConfigFieldEditable
                label="Ollama Model"
                value={currentRuntime.ollama_model}
                description="Modèle Ollama effectivement résolu par le backend"
                icon="🧠"
                editable={editMode}
                testId="input-ollama-model"
                onChange={value => handleRuntimeFieldChange('ollama_model', value)}
                validationError={validationErrors['runtime.ollama_model']}
              />
              <ConfigFieldEditable
                label="Ollama Endpoint Type"
                value={currentRuntime.ollama_endpoint_kind}
                description="Classification locale ou distante de l'endpoint Ollama"
                icon="🧭"
                editable={false}
                testId="runtime-ollama-endpoint-kind"
              />
              <ConfigFieldEditable
                label="Ollama Config Source"
                value={currentRuntime.ollama_endpoint_source}
                description="Origine de l'endpoint Ollama utilisé au runtime"
                icon="📦"
                editable={false}
                testId="runtime-ollama-endpoint-source"
              />
              <ConfigFieldEditable
                label="Ollama Model Source"
                value={currentRuntime.ollama_model_source}
                description="Origine de la valeur de modèle Ollama"
                icon="🗂️"
                editable={false}
                testId="runtime-ollama-model-source"
              />
              <ConfigFieldEditable
                label="Ollama Network Used"
                value={currentRuntime.ollama_network_used}
                description="Indique si l'endpoint Ollama actif sort du loopback local"
                icon="📡"
                valueType="boolean"
                editable={false}
                testId="runtime-ollama-network-used"
              />
              <ConfigFieldEditable
                label="Ollama Health"
                value={currentRuntime.ollama_health}
                description="Santé du dernier probe backend Ollama"
                icon="💓"
                editable={false}
                testId="runtime-ollama-health"
              />
              <ConfigFieldEditable
                label="Secrets Mode"
                value={currentRuntime.secrets_mode}
                description="Mode de gestion des secrets (lecture seule)"
                icon="🔐"
                editable={false}
              />
              <ConfigFieldEditable
                label="Gemini Configuré"
                value={currentRuntime.gemini_configured}
                description="API Gemini active ou non (lecture seule)"
                icon="✨"
                valueType="boolean"
                editable={false}
              />
            </ConfigSection>

            <ConfigSection
              title="Cognitive Layout"
              icon="🧠"
              description="Paramètres du moteur d'adaptation cognitive de l'interface"
              defaultOpen={false}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isAdaptationEnabled}
                      onChange={e => toggleAdaptation(e.target.checked)}
                    />
                    <span>Adaptation auto</span>
                  </label>
                  {cognitiveMode && (
                    <span
                      style={{
                        background: 'var(--accent-primary, #0ea5e9)',
                        color: '#fff',
                        padding: '2px 10px',
                        borderRadius: '6px',
                        fontSize: '13px',
                        fontWeight: 600,
                      }}
                    >
                      {COGNITIVE_MODE_LABELS[cognitiveMode]}
                    </span>
                  )}
                </div>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '0.5rem',
                  }}
                >
                  {(Object.keys(COGNITIVE_MODE_LABELS) as UIMode[]).map(mode => (
                    <button
                      key={mode}
                      onClick={() => setCognitiveMode(mode)}
                      style={{
                        padding: '8px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: cognitiveMode === mode ? 700 : 400,
                        border: `1px solid ${cognitiveMode === mode ? 'var(--accent-primary, #0ea5e9)' : 'rgba(255,255,255,0.1)'}`,
                        background:
                          cognitiveMode === mode
                            ? 'var(--accent-primary, #0ea5e9)'
                            : 'rgba(255,255,255,0.05)',
                        color: '#fff',
                        cursor: 'pointer',
                      }}
                    >
                      {COGNITIVE_MODE_LABELS[mode]}
                    </button>
                  ))}
                </div>
              </div>
            </ConfigSection>
          </>
        )}

        {activeTab === 'ai' && (
          <>
            <ConfigSection
              title="Chat Engine Configuration"
              icon="💬"
              description="Paramètres du moteur de chat IA"
              defaultOpen={true}
            >
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <button
                  disabled={!editMode}
                  onClick={async () => {
                    try {
                      const result = (await tauriClient.setChatProfile({
                        name: 'StableProduction',
                      })) as IpcEnvelope<unknown>;
                      if (!result.ok) {
                        throw new Error(result.error?.message || 'Profil invalide');
                      }
                      invalidateRequestDefaultsCache();
                      await loadConfig();
                    } catch (err) {
                      errorToast(`Échec application profil: ${err}`);
                    }
                  }}
                  style={{ padding: '0.45rem 0.7rem', borderRadius: '6px' }}
                >
                  StableProduction
                </button>
                <button
                  disabled={!editMode}
                  onClick={async () => {
                    try {
                      const result = (await tauriClient.setChatProfile({
                        name: 'DeepMemoryCoaching',
                      })) as IpcEnvelope<unknown>;
                      if (!result.ok) {
                        throw new Error(result.error?.message || 'Profil invalide');
                      }
                      invalidateRequestDefaultsCache();
                      await loadConfig();
                    } catch (err) {
                      errorToast(`Échec application profil: ${err}`);
                    }
                  }}
                  style={{ padding: '0.45rem 0.7rem', borderRadius: '6px' }}
                >
                  DeepMemoryCoaching
                </button>
                <button
                  disabled={!editMode}
                  onClick={async () => {
                    try {
                      const result = (await tauriClient.setChatProfile({
                        name: 'UltraReactiveLowIO',
                      })) as IpcEnvelope<unknown>;
                      if (!result.ok) {
                        throw new Error(result.error?.message || 'Profil invalide');
                      }
                      invalidateRequestDefaultsCache();
                      await loadConfig();
                    } catch (err) {
                      errorToast(`Échec application profil: ${err}`);
                    }
                  }}
                  style={{ padding: '0.45rem 0.7rem', borderRadius: '6px' }}
                >
                  UltraReactiveLowIO
                </button>
              </div>
              <ConfigFieldEditable
                label="Timeout"
                value={currentChatEngine.response_timeout_ms}
                description="Délai maximum d'attente pour une réponse (1000-300000ms)"
                icon="⏱️"
                valueType="duration"
                editable={editMode}
                onChange={value =>
                  handleChatEngineFieldChange('response_timeout_ms', value)
                }
                validationError={validationErrors['chat_engine.timeout_ms']}
              />
              <ConfigFieldEditable
                label="Chunk Size"
                value={currentChatEngine.stream_chunk_size}
                description="Taille des chunks de streaming (100-10000)"
                icon="📦"
                valueType="number"
                editable={editMode}
                onChange={value =>
                  handleChatEngineFieldChange('stream_chunk_size', value)
                }
                validationError={validationErrors['chat_engine.chunk_size']}
              />
              <ConfigFieldEditable
                label="Memory Context Tokens"
                value={currentChatEngine.memory_context_tokens}
                description="Fenêtre de contexte mémoire injectée dans le prompt"
                icon="🎯"
                valueType="number"
                editable={editMode}
                onChange={value =>
                  handleChatEngineFieldChange('memory_context_tokens', value)
                }
                validationError={validationErrors['chat_engine.memory_context_tokens']}
              />
              <ConfigFieldEditable
                label="Memory Retention Tokens"
                value={currentChatEngine.memory_retention_tokens}
                description="Limite de rétention totale (conserve les messages les plus récents)"
                icon="🧠"
                valueType="number"
                editable={editMode}
                onChange={value =>
                  handleChatEngineFieldChange('memory_retention_tokens', value)
                }
                validationError={validationErrors['chat_engine.memory_retention_tokens']}
              />
              <ConfigFieldEditable
                label="Memory Flush Interval"
                value={currentChatEngine.memory_flush_interval_ms}
                description="Intervalle debounce des écritures mémoire sur disque (ms)"
                icon="💾"
                valueType="number"
                editable={editMode}
                onChange={value =>
                  handleChatEngineFieldChange('memory_flush_interval_ms', value)
                }
                validationError={validationErrors['chat_engine.memory_flush_interval_ms']}
              />
              <ConfigFieldEditable
                label="Stream Channel Buffer"
                value={currentChatEngine.stream_channel_buffer}
                description="Taille du buffer de canal streaming"
                icon="📡"
                valueType="number"
                editable={editMode}
                onChange={value =>
                  handleChatEngineFieldChange('stream_channel_buffer', value)
                }
                validationError={validationErrors['chat_engine.stream_channel_buffer']}
              />
              <ConfigFieldEditable
                label="Auto TTS"
                value={currentChatEngine.auto_tts_enabled}
                description="Active la synthèse vocale automatique"
                icon="🔊"
                valueType="boolean"
                editable={editMode}
                testId="toggle-auto-tts"
                onChange={value => handleChatEngineFieldChange('auto_tts_enabled', value)}
                validationError={validationErrors['chat_engine.auto_tts_enabled']}
              />
              <ConfigFieldEditable
                label="Request Temperature"
                value={currentRequestDefaults.temperature}
                description="Valeur par défaut pour les requêtes ChatRequestPayload"
                icon="🌡️"
                valueType="number"
                editable={editMode}
                onChange={value => handleRequestDefaultsFieldChange('temperature', value)}
                validationError={validationErrors['request_defaults.temperature']}
              />
              <ConfigFieldEditable
                label="Request Max Tokens"
                value={currentRequestDefaults.max_output_tokens}
                description="Nombre maximum de tokens par défaut"
                icon="🧮"
                valueType="number"
                editable={editMode}
                testId="input-request-max-tokens"
                onChange={value =>
                  handleRequestDefaultsFieldChange('max_output_tokens', value)
                }
                validationError={validationErrors['request_defaults.max_output_tokens']}
              />
              <ConfigFieldEditable
                label="Request Provider"
                value={currentRequestDefaults.provider}
                description="Provider par défaut (auto/gemini/ollama/local)"
                icon="🛰️"
                editable={editMode}
                testId="select-request-provider"
                onChange={value => handleRequestDefaultsFieldChange('provider', value)}
                validationError={validationErrors['request_defaults.provider']}
              />
              <ConfigFieldEditable
                label="Request Streaming"
                value={currentRequestDefaults.enable_streaming}
                description="Streaming activé par défaut"
                icon="🌊"
                valueType="boolean"
                editable={editMode}
                onChange={value =>
                  handleRequestDefaultsFieldChange('enable_streaming', value)
                }
                validationError={validationErrors['request_defaults.enable_streaming']}
              />
            </ConfigSection>
          </>
        )}

        {activeTab === 'performance' && (
          <>
            <ConfigSection
              title="Performance Metrics"
              icon="⚡"
              description="Indicateurs de performance système"
              defaultOpen={true}
            >
              <ConfigFieldEditable
                label="Config Load Time"
                value={`${Date.now() - config.timestamp}ms`}
                description="Temps écoulé depuis le chargement de la config"
                icon="⏱️"
                editable={false}
              />
              <ConfigFieldEditable
                label="Streaming Enabled"
                value={currentRequestDefaults.enable_streaming}
                description="Mode streaming activé pour les réponses"
                icon="📡"
                valueType="boolean"
                editable={false}
              />
              <ConfigFieldEditable
                label="Timeout Configuré"
                value={currentChatEngine.response_timeout_ms > 0}
                description="Timeout défini pour éviter les blocages"
                icon="⏰"
                valueType="boolean"
                editable={false}
              />
            </ConfigSection>
          </>
        )}
        {activeTab === 'audio' && (
          <>
            <ConfigSection
              title="Périphériques Audio"
              icon="🎤"
              description="Configuration canonique des entrées/sorties audio. Source unique de vérité — partagée avec la page Audio Center."
              defaultOpen={true}
            >
              <ConfigFieldEditable
                label="Périphérique d'entrée (ID)"
                value={audioConfig.inputDeviceId || '—'}
                description="ID wpctl du microphone actif (ex: 42)"
                icon="🎙️"
                editable={false}
                data-testid="audio-input-device-id"
              />
              <ConfigFieldEditable
                label="Périphérique d'entrée (Nom)"
                value={audioConfig.inputDeviceLabel || '—'}
                description="Nom du microphone sélectionné"
                icon="🎙️"
                editable={false}
                data-testid="audio-input-device-label"
              />
              <ConfigFieldEditable
                label="Périphérique de sortie (ID)"
                value={audioConfig.outputDeviceId || '—'}
                description="ID wpctl du haut-parleur actif (ex: 48)"
                icon="🔊"
                editable={false}
                data-testid="audio-output-device-id"
              />
              <ConfigFieldEditable
                label="Périphérique de sortie (Nom)"
                value={audioConfig.outputDeviceLabel || '—'}
                description="Nom du haut-parleur sélectionné"
                icon="🔊"
                editable={false}
                data-testid="audio-output-device-label"
              />
              <ConfigFieldEditable
                label="Volume"
                value={audioConfig.volume}
                description="Volume de sortie (0.0–1.0)"
                icon="🔉"
                editable={false}
                data-testid="audio-volume"
              />
            </ConfigSection>
            <ConfigSection
              title="Paramètres de Traitement"
              icon="⚙️"
              description="Paramètres de traitement audio (lecture seule — géré par Audio Center)"
              defaultOpen={false}
            >
              <ConfigFieldEditable
                label="Réduction de bruit"
                value={audioConfig.noiseReduction}
                description="Réduction active du bruit de fond"
                icon="🔇"
                valueType="boolean"
                editable={false}
                data-testid="audio-noise-reduction"
              />
              <ConfigFieldEditable
                label="Annulation d'écho"
                value={audioConfig.echoCancellation}
                description="Annulation active de l'écho"
                icon="📣"
                valueType="boolean"
                editable={false}
                data-testid="audio-echo-cancellation"
              />
              <ConfigFieldEditable
                label="Gain automatique"
                value={audioConfig.autoGainControl}
                description="Contrôle automatique du gain"
                icon="📶"
                valueType="boolean"
                editable={false}
                data-testid="audio-auto-gain"
              />
            </ConfigSection>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button
                data-testid="audio-config-reload"
                onClick={async () => {
                  try {
                    const raw = await tauriClient.getAudioDeviceConfig();
                    if (raw && typeof raw === 'object') {
                      const r = raw as Record<string, unknown>;
                      setAudioConfig({
                        inputDeviceId: (r.inputDeviceId as string) || '',
                        inputDeviceLabel: (r.inputDeviceLabel as string) || '',
                        outputDeviceId: (r.outputDeviceId as string) || '',
                        outputDeviceLabel: (r.outputDeviceLabel as string) || '',
                        volume: typeof r.volume === 'number' ? r.volume : 1.0,
                        noiseReduction: Boolean(r.noiseReduction),
                        echoCancellation: Boolean(r.echoCancellation),
                        autoGainControl: Boolean(r.autoGainControl),
                      });
                      success('Config audio rechargée');
                    }
                  } catch (e) {
                    errorToast('Erreur rechargement audio: ' + String(e));
                  }
                }}
                style={{
                  padding: '0.5rem 1rem',
                  background: '#1e40af',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                }}
              >
                🔄 Recharger
              </button>
              {(audioConfig.inputDeviceId || audioConfig.outputDeviceId) && (
                <button
                  data-testid="audio-config-save"
                  disabled={audioSaving}
                  onClick={async () => {
                    setAudioSaving(true);
                    try {
                      await tauriClient.saveAudioDeviceConfig(audioConfig);
                      success('Config audio sauvegardée');
                    } catch (e) {
                      errorToast('Erreur sauvegarde audio: ' + String(e));
                    } finally {
                      setAudioSaving(false);
                    }
                  }}
                  style={{
                    padding: '0.5rem 1rem',
                    background: '#065f46',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: audioSaving ? 'not-allowed' : 'pointer',
                    opacity: audioSaving ? 0.7 : 1,
                  }}
                >
                  {audioSaving ? '⏳ Sauvegarde...' : '💾 Sauvegarder'}
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
