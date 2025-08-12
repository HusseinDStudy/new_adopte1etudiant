import { render } from '@testing-library/react';
import { axe } from 'jest-axe';
import React from 'react';
import { Button } from '../ui/button';


describe('a11y smoke tests', () => {
  it('Button has no a11y violations', async () => {
    const { container } = render(<Button>Click me</Button>);
    const results = await axe(container);
    // Avoid matcher interop issue in Vitest: assert array directly
    expect(results.violations).toEqual([]);
  });
});


