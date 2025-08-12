import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './button';

const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
};
export default meta;

export const Primary: StoryObj<typeof Button> = {
  args: {
    children: 'Primary Button',
  },
};

export const Disabled: StoryObj<typeof Button> = {
  args: {
    children: 'Disabled',
    disabled: true,
  },
};


