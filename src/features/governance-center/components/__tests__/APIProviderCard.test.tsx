import React from 'react';
import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '@/__tests__/test-helpers';
import { APIProviderCard } from '../APIProviderCard';

describe('APIProviderCard', () => {
  it('publishes remote ollama runtime truth on the canonical governance card', () => {
    renderWithProviders(
      <APIProviderCard
        provider="ollama"
        status={{
          provider_enabled: true,
          available: true,
          url: 'https://titane.example.com',
          model: 'gemma2:2b',
          models: ['gemma2:2b', 'llama3.1:latest'],
          endpoint_kind: 'remote_cloudflare',
          endpoint_source: 'runtime_persisted',
          model_source: 'runtime_persisted',
          network_used: true,
          health: 'healthy',
        }}
        onSetKey={async () => {}}
      />
    );

    expect(screen.getByTestId('provider-card-ollama')).toBeInTheDocument();
    expect(screen.getByTestId('ollama-provider-url')).toHaveTextContent(
      'https://titane.example.com'
    );
    expect(screen.getByTestId('ollama-provider-endpoint-kind')).toHaveTextContent(
      'distant HTTPS'
    );
    expect(screen.getByTestId('ollama-provider-endpoint-source')).toHaveTextContent(
      'config runtime persistée'
    );
    expect(screen.getByTestId('ollama-provider-health')).toHaveTextContent('healthy');
    expect(screen.getByTestId('ollama-provider-model-list')).toHaveTextContent(
      'gemma2:2b, llama3.1:latest'
    );
  });
});