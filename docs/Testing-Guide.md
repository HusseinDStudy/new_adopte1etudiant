# Testing Guide

This guide outlines the testing strategy, tools, and procedures for the "AdopteUnEtudiant" project. A robust testing suite is essential for ensuring code quality, preventing regressions, and enabling confident refactoring.

## 1. Testing Philosophy

Our testing approach is pragmatic. We aim to write tests that provide the most value by covering critical paths and complex business logic. We focus on:

*   **Integration Tests** for the backend to verify that API endpoints work as expected from request to response.
*   **Component Tests** for the frontend to ensure UI components render and behave correctly from a user's perspective.
*   **Unit Tests** for isolated, complex business logic (e.g., services, utility functions).

## 2. Tooling

*   **Test Runner**: **[Vitest](https://vitest.dev/)** is used across the monorepo for its speed, modern features, and Jest-compatible API.
*   **Frontend Component Testing**: **[React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)** is used to test React components in a way that resembles how users interact with them.
*   **Mocking**: We use Vitest's built-in mocking features (`vi.mock`, `vi.fn`) to isolate components and services during testing.
*   **End-to-End (E2E) Testing**: *[This section can be added later when an E2E testing framework like Cypress or Playwright is introduced.]*

## 3. Backend Testing (`apps/api`)

Backend tests focus on verifying the correctness of the API endpoints, middleware, and core business logic.

*   **Location**: Test files are located in `apps/api/src/__tests__/` and end with a `.test.ts` extension.
*   **Test Database**: Integration tests run against a **separate, isolated test database**. This is critical to prevent tests from interfering with development data. The test database setup is typically handled in a test helper file.
*   **Test Helpers**: The `apps/api/src/__tests__/test-helpers.ts` file contains utilities to bootstrap the Fastify server instance for testing and to manage the test database state (e.g., clearing tables between tests).

### How to Write an Integration Test

An API integration test typically follows these steps:
1.  Import the test server builder.
2.  Before each test, clean the database to ensure a fresh state.
3.  Build the server instance.
4.  (Optional) Seed the database with any specific data required for the test case.
5.  Send a request to the endpoint using the server's `inject()` method.
6.  Assert the HTTP status code and the payload of the response.
7.  (Optional) Assert that the database was changed in the expected way.

**Example: `apps/api/src/__tests__/offer.test.ts`**
```typescript
import { buildTestServer } from './test-helpers';

describe('POST /offers', () => {
  it('should create a new offer for a logged-in company', async () => {
    const server = buildTestServer();
    // 1. Setup: Create a company user and get a token
    const companyToken = await loginAsCompany(server);

    const response = await server.inject({
      method: 'POST',
      url: '/offers',
      headers: {
        authorization: `Bearer ${companyToken}`,
      },
      payload: {
        title: 'Software Engineer Intern',
        description: '...',
        // ...other offer data
      },
    });

    expect(response.statusCode).toBe(201);
    expect(response.json().title).toBe('Software Engineer Intern');
  });
});
```

### How to Run Backend Tests

Navigate to the root of the monorepo and run:
```bash
pnpm --filter api test
```

## 4. Frontend Testing (`apps/web`)

Frontend tests focus on ensuring that components render correctly and are usable from a user's point of view.

*   **Location**: Test files are typically co-located with the code they are testing (e.g., `LoginPage.tsx` and `LoginPage.test.tsx`).
*   **Philosophy**: We test behavior, not implementation details. Tests should find elements on the "screen" (the virtual DOM) the way a user would and interact with them.

### How to Write a Component Test

1.  Import `render`, `screen`, and `userEvent` from Testing Library.
2.  Render the component, wrapping it in any necessary providers (like `BrowserRouter` or `AuthContext.Provider`).
3.  Use `screen` queries (e.g., `screen.getByRole`, `screen.getByLabelText`) to find elements.
4.  Use `userEvent` to simulate user actions (e.g., `userEvent.click`, `userEvent.type`).
5.  Use `expect` with matchers to assert the outcome.

**Example: `apps/web/src/pages/LoginPage.test.tsx`**
```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginPage } from './LoginPage';
import { BrowserRouter } from 'react-router-dom';

describe('LoginPage', () => {
  it('should allow a user to type into email and password fields', async () => {
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);

    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.type(passwordInput, 'password123');

    expect(emailInput).toHaveValue('test@example.com');
    expect(passwordInput).toHaveValue('password123');
  });
});
```

### How to Run Frontend Tests

Navigate to the root of the monorepo and run:
```bash
pnpm --filter web test
```

## 5. Running All Tests

To run all tests for all applications and packages in the monorepo, use the top-level `test` script from the root directory:
```bash
pnpm test
```
This command is powered by Turborepo and will run the tests in parallel, caching the results for maximum efficiency. 