import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import ConfirmDialog from './confirm-dialog';

const meta: Meta<typeof ConfirmDialog> = {
  title: 'UI/ConfirmDialog',
  component: ConfirmDialog,
};
export default meta;

export const Basic: StoryObj<typeof ConfirmDialog> = {
  args: {
    open: true,
    title: 'Delete item',
    description: 'Are you sure you want to delete this item?',
    confirmText: 'Delete',
    cancelText: 'Cancel',
    onConfirm: () => Promise.resolve(),
    onOpenChange: () => {},
  },
};

export const DisabledConfirm: StoryObj<typeof ConfirmDialog> = {
  args: {
    open: true,
    title: 'Destructive action',
    description: 'The confirm button is disabled until a condition is met.',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    confirmDisabled: true,
    onConfirm: () => Promise.resolve(),
    onOpenChange: () => {},
  },
};

export const WithInput: StoryObj<typeof ConfirmDialog> = {
  render: () => (
    <ConfirmDialog
      open
      title="Disable 2FA"
      description="Enter your 6-digit code to disable."
      confirmText="Disable"
      cancelText="Cancel"
      onConfirm={() => Promise.resolve()}
      onOpenChange={() => {}}
    >
      <div className="mt-2">
        <label htmlFor="code" className="mb-1 block text-sm font-medium text-gray-700">
          6-digit code
        </label>
        <input id="code" inputMode="numeric" pattern="[0-9]*" className="w-full rounded border p-2" placeholder="123456" />
      </div>
    </ConfirmDialog>
  ),
};

