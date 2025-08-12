import type { Meta, StoryObj } from '@storybook/react';
import { Input } from './input';

const meta: Meta<typeof Input> = {
  title: 'UI/Input',
  component: Input,
};
export default meta;

export const Default: StoryObj<typeof Input> = {
  args: {
    placeholder: 'Type here...',
  },
};

export const Large: StoryObj<typeof Input> = {
  args: {
    placeholder: 'Large input',
    uiSize: 'lg',
  },
};


