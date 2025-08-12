import type { Meta, StoryObj } from '@storybook/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './dialog';
import React from 'react';

const meta: Meta = {
  title: 'UI/Dialog',
};
export default meta;

export const Basic: StoryObj = {
  render: () => (
    <Dialog open>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Dialog title</DialogTitle>
          <DialogDescription>Dialog description</DialogDescription>
        </DialogHeader>
        <div className="text-sm">Body</div>
      </DialogContent>
    </Dialog>
  ),
};


