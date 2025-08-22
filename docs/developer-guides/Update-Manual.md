# Update Manual

## Purpose
Procedure to update dependencies, DB schema, and the application safely.

## Steps

This section provides a detailed procedure for safely updating dependencies, database schema, and the application.

### 1. Create an Update Branch

Before making any changes, create a new Git branch dedicated to the update. This isolates changes and facilitates code review and potential rollbacks.

```bash
git checkout main
git pull origin main
git checkout -b feature/update-yyyy-mm-dd
```

### 2. Update Dependencies

Regularly update project dependencies to incorporate the latest features, security patches, and performance improvements. Utilize `npm` commands and monitor Dependabot PRs.

*   **Check for outdated packages**:
    ```bash
npm outdated
    ```
*   **Update minor and patch versions**:
    ```bash
npm update
    ```
*   **Review Dependabot Pull Requests**: GitHub's Dependabot automatically creates PRs for dependency updates. Review these for compatibility and merge them as appropriate.
*   **Major Version Updates**: For major version updates, carefully review the changelog of the respective library for breaking changes and necessary migration steps.

### Breaking Changes Summary

When performing updates, pay special attention to the following breaking changes introduced in recent major versions or refactors:

*   **Theme System (`packages/ui-theme`)**: The `high-contrast` theme preset and associated tokens have been removed. Consumers must update their styling to use `light` or `dark` themes only.
*   **Settings Routes**: The `/settings` and `/admin/settings` routes have been removed. Update all internal and external links to `/profile` or `/admin/profil`.
*   **Database Schema & Admin Roles**: Major updates to the database schema, including the introduction of a new admin role system, require careful migration. Ensure `npm run db:migrate:deploy` is run.
*   **Service Layer Architecture**: A significant refactoring introduced a service layer. This impacts how business logic is structured and errors are handled. (Relevant to developers updating custom logic).
*   **Docker Compose for Local Development**: The primary `docker-compose.yml` and `Dockerfile.dev` files have been removed. Local development now strictly uses `docker-compose.db.yml` for the database and `npm run dev` for applications.
*   **CI/CD Deployment**: The `-v` flag (volume removal) from `docker compose down` during deployment has been removed to prevent critical data loss. Ensure deployment scripts reflect this.

### 3. Run Tests & Build

After updating dependencies, it's crucial to run the entire test suite and perform a full production build to ensure that no regressions have been introduced and that the application compiles correctly.

*   **Install dependencies**:
    ```bash
npm install
    ```
*   **Run all tests**:
    ```bash
npm test
    ```
*   **Perform a production build**:
    ```bash
npm run build
    ```

Address any failing tests or build errors before proceeding.

### 4. Update Prisma/Migrations if Needed

If the update involves changes to the database schema, new Prisma migrations will need to be generated and applied.

*   **Generate new Prisma migration (if schema changed)**:
    ```bash
npm run prisma:migrate:dev # Or equivalent command for your setup
    ```
*   **Review generated migration file**: Carefully inspect the generated migration file (`prisma/migrations/.../migration.sql`) to ensure it reflects the intended schema changes.
*   **Apply migrations to development database**: Test the migration locally before deployment.

### 5. Bump Version (SemVer) + Update Changelog

Follow Semantic Versioning (SemVer) principles to increment the application's version number. Document all changes in the `CHANGELOG.md` and create corresponding GitHub tags and releases.

*   **Understand Semantic Versioning**: Familiarize yourself with [SemVer](https://semver.org/spec/v2.0.0.html) rules:
    - **MAJOR** version when you make incompatible API changes,
    - **MINOR** version when you add functionality in a backward compatible manner, and
    - **PATCH** version when you make backward compatible bug fixes.
*   **Bump version**: Use `npm version` (recommended) or manually update `package.json` for the root project and any relevant workspaces (`apps/api`, `apps/web`, etc.).
    ```bash
    # Example: Bumping a minor version
    npm version minor # Creates a new tag (e.g., v1.1.0)
    
    # For a specific workspace (e.g., API)
    # npm version patch --workspace=apps/api
    ```
*   **Update `CHANGELOG.md`**: Add a new entry detailing all `Added`, `Changed`, `Fixed`, and `Breaking Changes` items since the last release. Refer to [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) for formatting guidelines.
*   **Create GitHub Release and Tag**: After merging your version bump PR to `main`, create a new GitHub Release from the newly created tag (e.g., `v1.2.0`). This provides a stable point in history and can be linked to compiled assets or release notes.

### 6. Deploy via CI/CD

Push the update branch, and let the automated CI/CD pipeline handle the deployment to staging and production environments.

*   **Push the update branch**:
    ```bash
git push origin feature/update-yyyy-mm-dd
    ```
*   **Create a Pull Request**: Create a PR to `main` and ensure all CI checks pass.
*   **Merge to `main`**: Once approved, merge the PR. This will trigger the automated deployment to production via GitHub Actions as defined in `.github/workflows/ci-cd.yml`.

### 7. Post-Deployment Validations (Health, Monitoring)

After deployment, perform immediate checks to verify the application's health and monitor its performance in the live environment.

*   **Health Checks**: Verify that the API and web application health endpoints return `ok`.
    *   API Health: `http://your-domain.com/health`
    *   Web Health: `http://your-domain.com`
*   **Monitoring Dashboards**: Check monitoring tools (e.g., Prometheus, Grafana, CloudWatch) for any unusual spikes in error rates, CPU/memory usage, or response times.
*   **Smoke Tests**: Perform a quick round of essential user flows to ensure core functionalities are working as expected.

### 8. Rollback if Required

If critical issues are detected post-deployment, initiate the rollback procedure to revert to the previous stable version.

*   **Automated Rollback Triggers**: The CI/CD pipeline includes automated rollback mechanisms for specific failure scenarios (e.g., health check failures, migration failures).
*   **Manual Rollback**: In cases where automated rollback is insufficient or a manual intervention is preferred, follow the steps outlined in the [CI/CD Guide - Rollback Strategy](docs/project-management/CI-CD.md#82-manual-rollback-process).

---

**Last Updated**: July 2024
**Version**: 1.0
**Author**: Your Name/Team Name