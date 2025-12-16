import type { Meta, StoryObj } from '@storybook/react-vite';

import { Page } from './Page';

const meta = {
  title: 'Example/Page',
  component: Page,
  parameters: {
    // More on how to position stories at: https://storybook.js.org/docs/configure/story-layout
    layout: 'fullscreen',
  },
} satisfies Meta<typeof Page>;

export default meta;
type Story = StoryObj<typeof meta>;

export const LoggedOut: Story = {};

// NOTE: Interaction testing requires @storybook/test package
// Install with: npm install -D @storybook/test
// Then uncomment the LoggedIn story below
export const LoggedIn: Story = {
  // Placeholder - interaction tests disabled until @storybook/test is installed
};
