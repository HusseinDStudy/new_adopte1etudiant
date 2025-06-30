# Testing Guide

This document outlines the testing strategy for the AdopteUnEtudiant project. Our goal is to ensure the reliability, stability, and quality of the codebase through a combination of automated and manual testing.

## 1. Testing Philosophy

We adhere to the "Testing Trophy" model, which prioritizes a balanced mix of different types of tests. Our strategy focuses on:
- **Static Analysis**: Catching typos, type errors, and style issues before runtime.
- **Unit Tests**: Verifying that individual functions and components work correctly in isolation.
- **Integration Tests**: Ensuring that different parts of the application (e.g., API and database) work together as expected.
- **End-to-End (E2E) Tests**: Simulating real user scenarios in a browser (Future Goal).

## 2. Tools and Frameworks

- **Test Runner**: [**Vitest**](https://vitest.dev/) will be used for both backend and frontend testing. It's fast, compatible with Vite, and provides a modern testing experience.
- **Assertion Library**: We will use the built-in assertion library from Vitest, which is Chai-compatible.
- **Static Analysis**: [**ESLint**](https://eslint.org/) and [**TypeScript**](https://www.typescriptlang.org/) are already integrated to enforce code quality and type safety across the monorepo.

## 3. Testing Strategy

### a. Backend (API) Testing

- **Unit Tests**:
  - **Target**: Individual controller functions and business logic services.
  - **Methodology**: Mocking external dependencies like the Prisma client to test the logic of a single unit in isolation.
  - **Location**: Test files will be located alongside the source files (e.g., `offerController.test.ts` next to `offerController.ts`).

- **Integration Tests**:
  - **Target**: API endpoints.
  - **Methodology**: These tests will make real HTTP requests to the API and interact with a separate, dedicated test database to ensure the entire request lifecycle (route -> middleware -> controller -> database) works correctly.
  - **Location**: Integration tests will be located in a separate `__tests__` or `tests` directory within the `apps/api` package.

### b. Frontend (Web) Testing

- **Unit Tests**:
  - **Target**: Individual React components and custom hooks.
  - **Methodology**: Using `@testing-library/react` to render components and assert their output without relying on implementation details. API services will be mocked to prevent actual network requests.
  - **Location**: Test files will be co-located with the components they are testing (e.g., `OfferCard.test.tsx` next to `OfferCard.tsx`).

### c. Manual Testing

- **Test Plan (Cahier de recettes)**: A formal test plan with detailed scenarios is available in **[Test-Plan.md](Test-Plan.md)**. This is used for acceptance testing before a major release to verify that all features meet the specified requirements.

## 4. How to Run Tests

Once the testing framework is fully integrated, you will be able to run all tests across the project with a single command from the root directory:

```bash
# This command is not yet implemented
npm test
```

To run tests for a specific workspace (e.g., the API):

```bash
# This command is not yet implemented
npm test --workspace=api
```

## 5. Continuous Integration (CI)

Our CI/CD pipeline, defined in `.github/workflows/ci-cd.yml`, will be configured to run all static analysis and automated tests on every push and pull request to the `main` branch. This ensures that no code that breaks existing functionality is merged. 