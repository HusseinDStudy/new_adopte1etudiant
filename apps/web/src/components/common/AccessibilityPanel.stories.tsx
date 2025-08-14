import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { AccessibilityPanel } from './AccessibilityPanel';
import { A11yProvider } from '../../theme/A11yProvider';

const meta: Meta<typeof AccessibilityPanel> = {
  title: 'A11y/AccessibilityPanel',
  component: AccessibilityPanel,
};

export default meta;
type Story = StoryObj<typeof AccessibilityPanel>;

export const Default: Story = {
  render: () => (
    <A11yProvider>
      <div className="p-4">
        <AccessibilityPanel />
      </div>
    </A11yProvider>
  ),
};


