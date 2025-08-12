import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Field, Label, useField } from './Field';

const meta: Meta = {
  title: 'Form/Field',
};
export default meta;

const TextInput = () => {
  const ctx = useField();
  return (
    <input id={ctx.id} aria-describedby={[ctx.helpId, ctx.errorId].filter(Boolean).join(' ')} className="rounded border px-3 py-2" />
  );
};

export const WithHelp: StoryObj = {
  render: () => (
    <Field helpText="Helpful description for this field">
      <Label>Label</Label>
      <TextInput />
    </Field>
  ),
};

export const WithError: StoryObj = {
  render: () => (
    <Field error="This field has an error">
      <Label>Label</Label>
      <TextInput />
    </Field>
  ),
};


