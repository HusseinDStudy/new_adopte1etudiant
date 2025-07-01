# CI/CD (Continuous Integration & Continuous Deployment)

This document outlines the CI/CD strategy and workflow for the "AdopteUnEtudiant" project, using GitHub Actions as the automation platform.

---

## 1. CI/CD Philosophy

Our CI/CD pipeline is designed to automate the process of building, testing, and deploying the application. The primary goals are:

*   **Improve Code Quality**: Automatically run tests and linters to catch issues early.
*   **Increase Development Velocity**: Automate repetitive tasks, allowing developers to focus on building features.
*   **Ensure Stability**: Automate deployments to ensure a consistent and reliable release process.

---

## 2. The CI/CD Platform: GitHub Actions

We use **[GitHub Actions](https://github.com/features/actions)** to orchestrate our workflows. The main workflow file is located at:
`.github/workflows/ci-cd.yml`

This workflow is triggered on every `push` and `pull_request` to the `main` branch.

---

## 3. Continuous Integration (CI) Workflow

The CI process runs on every pull request and push to `main`. It validates the code without deploying it.

**Trigger**: `on: [pull_request]`

**Key Steps**:
1.  **Checkout Code**: The workflow checks out the repository's code.
2.  **Setup Environment**: It sets up the correct Node.js version and installs pnpm.
3.  **Install Dependencies**: It installs all project dependencies using pnpm, leveraging pnpm's content-addressable store for efficiency. `pnpm install --frozen-lockfile` is used to ensure exact dependency versions are installed.
4.  **Linting**: It runs the linter across the entire monorepo to check for code style and quality issues.
    ```yaml
    - name: Lint
      run: pnpm lint
    ```
5.  **Testing**: It runs all unit and integration tests for all applications and packages.
    ```yaml
    - name: Test
      run: pnpm test
    ```
6.  **Build**: It performs a production build of all applications and packages to ensure that the code is syntactically correct and can be compiled. Turborepo caches build outputs to speed up this process.
    ```yaml
    - name: Build
      run: pnpm build
    ```

If any of these steps fail, the workflow fails, and the pull request is blocked from merging (if branch protection rules are enabled).

---

## 4. Continuous Deployment (CD) Workflow

The CD process automatically deploys the `api` and `web` applications to their respective hosting environments.

**Trigger**: `on: push: branches: [ "main" ]` (This means deployment only happens when code is merged into the `main` branch).

**Hosting Platforms**:
*   **Backend (`api`)**: Deployed to **[Render](https://render.com/)** as a "Web Service".
*   **Frontend (`web`)**: Deployed to **[Render](https://render.com/)** as a "Static Site".

### Deployment Mechanism: Render Deploy Hooks

Render provides a simple yet effective deployment mechanism via **Deploy Hooks**. A Deploy Hook is a unique URL that, when a `POST` request is sent to it, triggers a new deployment on Render.

**Workflow Steps**:
1.  **Run CI Steps**: The deployment job depends on the successful completion of all CI steps (lint, test, build).
2.  **Trigger Backend Deployment**: If the CI steps pass, a `curl` command sends a `POST` request to the Render Deploy Hook for the backend service.
    ```yaml
    - name: Deploy API to Render
      run: curl -X POST ${{ secrets.RENDER_DEPLOY_HOOK_API }}
    ```
3.  **Trigger Frontend Deployment**: A similar `curl` command triggers the deployment for the frontend static site.
    ```yaml
    - name: Deploy Web to Render
      run: curl -X POST ${{ secrets.RENDER_DEPLOY_HOOK_WEB }}
    ```

### Render Service Configuration

*   **Build Command**: Render is configured to use `pnpm --filter <app-name> build` to build the specific application.
*   **Start Command** (for API): Render uses `pnpm --filter api start` to run the backend server.
*   **Environment Variables**: All secrets (like `DATABASE_URL`, `JWT_SECRET`, etc.) are securely stored in Render's environment variable manager, not in the repository. The Deploy Hook URLs are stored as **GitHub Secrets** (`secrets.RENDER_DEPLOY_HOOK_API`).

---

## 5. Future Improvements

*   **Code Coverage Analysis**: Integrate a tool like **SonarCloud** or **Codecov** to track test coverage over time and enforce coverage minimums.
*   **E2E Testing**: Add an End-to-End testing step using a framework like Cypress or Playwright to simulate real user flows in a browser.
*   **Preview Environments**: Configure the pipeline to automatically deploy pull requests to temporary "preview environments" for easier review and testing.
