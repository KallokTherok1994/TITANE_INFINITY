import type { Meta, StoryObj } from '@storybook/react';
import { BootErrorFallback } from '@/components/BootErrorFallback';
import { fn } from '@storybook/test';

const meta = {
  title: 'System/BootErrorFallback',
  component: BootErrorFallback,
  parameters: { layout: 'fullscreen', backgrounds: { default: 'dark' } },
  tags: ['autodocs'],
  args: { onRetry: fn() },
} satisfies Meta<typeof BootErrorFallback>;

export default meta;
type Story = StoryObj<typeof meta>;

export const NoError: Story = {
  args: {},
};

export const WithError: Story = {
  args: {
    error: new Error('Failed to initialize AI engine'),
  },
};

export const ModuleScriptError: Story = {
  args: {
    error: new Error(
      'Importing a module script failed: The server responded with a non-JavaScript MIME type'
    ),
  },
};
