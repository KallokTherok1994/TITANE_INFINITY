import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => {
  return {
    sanitize: vi.fn(),
    validateChatResponse: vi.fn(),
    validateMetaModeResponse: vi.fn(),
    rateLimiter: {
      checkLimit: vi.fn(),
      getStatus: vi.fn(),
      recordRequest: vi.fn(),
      getMetrics: vi.fn(),
      reset: vi.fn(),
    },
  };
});

vi.mock('../../../lib/security/AIInputSanitizer', () => {
  return {
    AIInputSanitizer: {
      sanitize: mocks.sanitize,
    },
  };
});

vi.mock('../../../lib/security/AIResponseValidator', () => {
  return {
    AIResponseValidator: {
      validateChatResponse: mocks.validateChatResponse,
      validateMetaModeResponse: mocks.validateMetaModeResponse,
    },
  };
});

vi.mock('../../../lib/security/AIRateLimiter', () => {
  return {
    globalAIRateLimiter: mocks.rateLimiter,
  };
});

describe('lib/security/SecureAIService', () => {
  beforeEach(() => {
    mocks.sanitize.mockReset();
    mocks.validateChatResponse.mockReset();
    mocks.validateMetaModeResponse.mockReset();

    mocks.rateLimiter.checkLimit.mockReset();
    mocks.rateLimiter.getStatus.mockReset();
    mocks.rateLimiter.recordRequest.mockReset();
    mocks.rateLimiter.getMetrics.mockReset();
    mocks.rateLimiter.reset.mockReset();

    mocks.sanitize.mockReturnValue({
      sanitized: 'sanitized',
      original: 'original',
      isBlocked: false,
      detectedPatterns: [],
      modifications: [],
      riskLevel: 0,
    });

    mocks.rateLimiter.checkLimit.mockReturnValue({
      remainingRequests: 1,
      remainingTokens: 1,
      remainingCost: 1,
      resetAt: 123,
      isBlocked: false,
    });

    mocks.rateLimiter.getStatus.mockReturnValue({
      remainingRequests: 1,
      remainingTokens: 1,
      remainingCost: 1,
      resetAt: 123,
      isBlocked: false,
    });
  });

  it('executeSecureChat: bloque si sanitizer bloque', async () => {
    mocks.sanitize.mockReturnValue({
      sanitized: 'x',
      original: 'x',
      isBlocked: true,
      detectedPatterns: ['[system]'],
      modifications: [],
      riskLevel: 5,
    });

    const { SecureAIService } = await import('../../../lib/security/SecureAIService');

    const apiCall = vi.fn();
    const result = await SecureAIService.executeSecureChat(
      { input: 'x', provider: 'local', model: 'local' },
      apiCall
    );

    expect(result.success).toBe(false);
    expect(result.rateLimitExceeded).toBe(false);
    expect(result.error).toContain('Input blocked');
    expect(mocks.rateLimiter.checkLimit).not.toHaveBeenCalled();
    expect(apiCall).not.toHaveBeenCalled();
  });

  it('executeSecureChat: bloque si rate limit atteint', async () => {
    mocks.rateLimiter.checkLimit.mockReturnValue({
      remainingRequests: 0,
      remainingTokens: 0,
      remainingCost: 0,
      resetAt: 123,
      isBlocked: true,
      blockReason: 'Max requests exceeded',
    });

    const { SecureAIService } = await import('../../../lib/security/SecureAIService');

    const apiCall = vi.fn();
    const result = await SecureAIService.executeSecureChat(
      { input: 'hello', provider: 'openai', model: 'gpt-4', estimatedTokens: 10 },
      apiCall
    );

    expect(result.success).toBe(false);
    expect(result.rateLimitExceeded).toBe(true);
    expect(result.error).toBe('Max requests exceeded');
    expect(apiCall).not.toHaveBeenCalled();
  });

  it('executeSecureChat: failure si apiCall throw', async () => {
    const { SecureAIService } = await import('../../../lib/security/SecureAIService');

    const apiCall = vi.fn().mockRejectedValue(new Error('boom'));
    const result = await SecureAIService.executeSecureChat(
      { input: 'hello', provider: 'local', model: 'local' },
      apiCall
    );

    expect(result.success).toBe(false);
    expect(result.error).toContain('API call failed');
    expect(result.outputValidation?.isValid).toBe(false);
    expect(mocks.validateChatResponse).not.toHaveBeenCalled();
  });

  it('executeSecureChat: failure si validation output invalide', async () => {
    mocks.validateChatResponse.mockReturnValue({
      isValid: false,
      errors: ['content: Required'],
      warnings: [],
    });

    const { SecureAIService } = await import('../../../lib/security/SecureAIService');

    const apiCall = vi.fn().mockResolvedValue({
      content: 'x',
      role: 'assistant',
      metadata: { tokens: 5 },
    });

    const result = await SecureAIService.executeSecureChat(
      { input: 'hello', provider: 'local', model: 'local' },
      apiCall
    );

    expect(result.success).toBe(false);
    expect(result.error).toContain('Output validation failed');
    expect(mocks.rateLimiter.recordRequest).not.toHaveBeenCalled();
  });

  it('executeSecureChat: success + recordRequest avec tokens réels (metadata)', async () => {
    mocks.validateChatResponse.mockReturnValue({
      isValid: true,
      data: { content: 'ok', role: 'assistant', metadata: { tokens: 777 } },
      errors: [],
      warnings: [],
    });

    const { SecureAIService } = await import('../../../lib/security/SecureAIService');

    const apiCall = vi.fn().mockResolvedValue({
      content: 'ok',
      role: 'assistant',
      metadata: { tokens: 777 },
    });

    const result = await SecureAIService.executeSecureChat(
      { input: '12345678', provider: 'openai', model: 'gpt-4' },
      apiCall
    );

    expect(result.success).toBe(true);
    expect(result.response.content).toBe('ok');
    expect(mocks.rateLimiter.recordRequest).toHaveBeenCalledWith(777, 'openai', 'gpt-4');
  });

  it('executeSecureChat: retourne sanitizedData quand warnings', async () => {
    mocks.validateChatResponse.mockReturnValue({
      isValid: true,
      data: { content: '<script>x</script>', role: 'assistant' },
      sanitizedData: { content: 'x', role: 'assistant' },
      errors: [],
      warnings: ['XSS detected'],
    });

    const { SecureAIService } = await import('../../../lib/security/SecureAIService');

    const apiCall = vi.fn().mockResolvedValue({
      content: '<script>x</script>',
      role: 'assistant',
    });

    const result = await SecureAIService.executeSecureChat(
      { input: 'hello', provider: 'local', model: 'local', estimatedTokens: 3 },
      apiCall
    );

    expect(result.success).toBe(true);
    expect(result.response.content).toBe('x');
    expect(result.originalResponse?.content).toBe('<script>x</script>');
  });

  it('executeSecureMetaMode: success + recordRequest avec estimatedTokens', async () => {
    mocks.validateMetaModeResponse.mockReturnValue({
      isValid: true,
      data: {
        active_mode: 'x',
        mode_justification: 'y',
        content: 'ok',
        adapted_tone: 't',
        adapted_depth: 'd',
        adapted_speed: 's',
        next_suggested_modes: [],
        timestamp: 'now',
      },
      errors: [],
      warnings: [],
    });

    const { SecureAIService } = await import('../../../lib/security/SecureAIService');

    const apiCall = vi.fn().mockResolvedValue({
      active_mode: 'x',
      mode_justification: 'y',
      content: 'ok',
      adapted_tone: 't',
      adapted_depth: 'd',
      adapted_speed: 's',
      next_suggested_modes: [],
      timestamp: 'now',
    });

    const result = await SecureAIService.executeSecureMetaMode(
      { input: 'hello', provider: 'local', model: 'local', estimatedTokens: 42 },
      apiCall
    );

    expect(result.success).toBe(true);
    expect(result.response.content).toBe('ok');
    expect(mocks.rateLimiter.recordRequest).toHaveBeenCalledWith(42, 'local', 'local');
  });

  it('helpers: getRateLimitStatus + resetRateLimiter', async () => {
    const { SecureAIService } = await import('../../../lib/security/SecureAIService');

    SecureAIService.getRateLimitStatus();
    SecureAIService.resetRateLimiter();

    expect(mocks.rateLimiter.getStatus).toHaveBeenCalledTimes(1);
    expect(mocks.rateLimiter.reset).toHaveBeenCalledTimes(1);
  });
});
