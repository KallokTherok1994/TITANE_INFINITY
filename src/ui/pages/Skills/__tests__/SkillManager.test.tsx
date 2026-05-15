import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import SkillManager from '../SkillManager';

vi.mock('@/services/skills', () => ({
  getSkillRegistry: vi.fn(() => []),
  activateSkill: vi.fn(() => true),
  deactivateSkill: vi.fn(),
  fullInstallPipeline: vi.fn(() => ({ success: true, message: 'ok' })),
  disableSkill: vi.fn(() => ({ success: true })),
  archiveSkill: vi.fn(() => ({ success: true })),
  fullUninstall: vi.fn(() => ({ success: true })),
  getActiveSkillId: vi.fn(() => null),
}));

vi.mock('../SkillImporter', () => ({
  default: () => <div data-testid="skills-importer-mock" />,
}));

vi.mock('../SkillCard', () => ({
  default: () => <div data-testid="skill-card-mock" />,
}));

describe('SkillManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders skills page root and heading', () => {
    render(<SkillManager />);

    expect(screen.getByTestId('page-skills')).toBeInTheDocument();
    expect(screen.getByText('🧩 Skill OS')).toBeInTheDocument();
  });

  it('keeps import button at compliant contrast color token', () => {
    render(<SkillManager />);

    const button = screen.getByRole('button', { name: '+ Importer une Skill' });
    expect(button).toBeInTheDocument();
    expect(button).toHaveStyle({ background: '#4f46e5', color: 'white' });
  });
});
