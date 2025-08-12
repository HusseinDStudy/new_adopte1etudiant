import type { Meta, StoryObj } from '@storybook/react';
import { Select } from './select';
import React from 'react';

const meta: Meta<typeof Select> = {
  title: 'UI/Select',
  component: Select,
};
export default meta;

export const Default: StoryObj<typeof Select> = {
  render: () => (
    <Select defaultValue="1">
      <option value="1">One</option>
      <option value="2">Two</option>
      <option value="3">Three</option>
    </Select>
  ),
};

export const Keyboard: StoryObj<typeof Select> = {
  render: () => (
    <div>
      <p className="mb-2 text-sm text-gray-600">Tab to the select, press Space to open, use Arrow keys, press Enter to choose.</p>
      <Select defaultValue="2" uiSize="lg">
        {Array.from({ length: 10 }).map((_, i) => (
          <option key={i} value={String(i + 1)}>Option {i + 1}</option>
        ))}
      </Select>
    </div>
  ),
};

