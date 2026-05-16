import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EmptyStateTruth, CuratedDataBanner } from '../EmptyStateTruth';

describe('EmptyStateTruth', () => {
  it('renders with default text for a given reason', () => {
    render(<EmptyStateTruth reason="no_data_yet" />);
    const el = screen.getByTestId('empty-state-truth');
    expect(el).toBeInTheDocument();
    expect(el).toHaveAttribute('data-empty-reason', 'no_data_yet');
    expect(screen.getAllByText(/Aucune donnée/).length).toBeGreaterThan(0);
  });

  it('renders custom title and description', () => {
    render(
      <EmptyStateTruth
        reason="backend_unavailable"
        title="Test title"
        description="Test description"
      />
    );
    expect(screen.getByText('Test title')).toBeInTheDocument();
    expect(screen.getByText('Test description')).toBeInTheDocument();
  });

  it('renders action button and calls onClick', () => {
    const onClick = vi.fn();
    render(
      <EmptyStateTruth
        reason="provider_missing"
        action={{ label: 'Configurer', onClick }}
      />
    );
    const btn = screen.getByTestId('empty-state-action');
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('renders curated_data reason with correct defaults', () => {
    render(<EmptyStateTruth reason="curated_data" />);
    expect(screen.getByText(/Données exemples/)).toBeInTheDocument();
  });
});

describe('CuratedDataBanner', () => {
  it('renders with default text', () => {
    render(<CuratedDataBanner />);
    const el = screen.getByTestId('curated-data-banner');
    expect(el).toBeInTheDocument();
    expect(el).toHaveAttribute('role', 'note');
    expect(screen.getByText(/Données exemples/)).toBeInTheDocument();
  });

  it('renders with custom source', () => {
    render(<CuratedDataBanner source="habitudes cognitives types" />);
    expect(screen.getByText(/habitudes cognitives types/)).toBeInTheDocument();
  });
});
