import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from './dropdown-menu';

const meta: Meta = {
  title: 'UI/DropdownMenu',
};
export default meta;

export const Basic: StoryObj = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="rounded bg-neutral-200 px-4 py-2">Open</button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-48">
        <DropdownMenuItem>First</DropdownMenuItem>
        <DropdownMenuItem inset>Second</DropdownMenuItem>
        <DropdownMenuItem>Third</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

export const LongList: StoryObj = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="rounded bg-neutral-200 px-4 py-2">Open</button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 max-h-60 overflow-auto">
        {Array.from({ length: 30 }).map((_, i) => (
          <DropdownMenuItem key={i}>Item {i + 1}</DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

