/**
 * SingularityMonitor Component Story (v19.0 Task 8)
 *
 * Storybook story for SingularityMonitor
 */

import type { Meta, StoryObj } from '@storybook/react-vite';
import { SingularityMonitor } from '../components/SingularityMonitor';

const meta: Meta<typeof SingularityMonitor> = {
  title: 'Components/SingularityMonitor',
  component: SingularityMonitor,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof SingularityMonitor>;

export const Default: Story = {};

export const WithEngineData: Story = {
  // Mock Zustand store with engine data would go here
  // For now, using default story structure
};
