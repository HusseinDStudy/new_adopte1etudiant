# Issue Management Guide

This guide consolidates the processes for reporting, tracking, resolving, and learning from issues and anomalies within the "Adopte1Etudiant" project.

---

## 1. Bug Tracking and Management Process

This section outlines the standardized process for reporting, tracking, and resolving bugs.

### Tooling

*   **Primary Tool**: **[GitHub Issues](https://github.com/HusseinDStudy/new_adopte1etudiant/issues)**. This is the official platform for tracking all bugs, feature requests, and project tasks.
*   **Integration**: GitHub Issues is directly integrated with our source code, pull requests, and project boards, enabling seamless traceability.

### How to Report a Bug

Anyone involved in the project (developers, testers, stakeholders) can and should report bugs.

1.  **Check for Duplicates**: Before submitting a new bug, quickly search the existing issues to see if the bug has already been reported.
2.  **Create a New Issue**: If the bug is new, go to the "Issues" tab in the GitHub repository and click "New Issue".
3.  **Use the Bug Report Template**: Fill out the bug report template with as much detail as possible.

### Bug Report Template

A good bug report is reproducible. Please include the following sections:

*   **Title**: A clear and concise summary of the issue.
    *   *Good*: "Clicking Logout button does not redirect to homepage"
    *   *Bad*: "Bug in app"
*   **Description**: A detailed description of the problem and its impact.
*   **Steps to Reproduce**:
    1.  Go to '...'
    2.  Click on '....'
    3.  Scroll down to '....'
    4.  See error
*   **Expected Behavior**: A clear description of what you expected to happen.
*   **Actual Behavior**: A clear description of what actually happened. Include screenshots, console logs, or error messages if applicable.
*   **Environment (Optional but helpful)**:
    *   Browser: [e.g., Chrome 108, Firefox 107]
    *   Operating System: [e.g., Windows 11, macOS Sonoma]
*   **Labels**: Apply the `bug` label to the issue.

### Bug Lifecycle

Bugs follow a clear lifecycle from submission to resolution.

#### a. Triage (`Status: To Do`)

*   When a new issue with the `bug` label is created, it enters the triage stage.
*   The project lead or a designated team member will:
    1.  **Validate the Bug**: Confirm that the report is clear and reproducible. If not, they may ask the reporter for more information.
    2.  **Prioritize**: Assign a priority label (`priority:low`, `priority:medium`, `priority:high`, `priority:critical`) based on the bug's impact.
    3.  **Categorize**: Add other relevant labels (e.g., `area:frontend`, `area:backend`, `good first issue`).
    4.  **Assign (Optional)**: Assign the issue to a specific developer or leave it unassigned for any developer to pick up.

#### b. In Progress (`Status: In Progress`)

*   A developer assigns the issue to themselves to signal they are working on it.
*   The developer creates a new branch from `main` with a descriptive name, including the issue number.
    *   **Branch Naming Convention**: `fix/issue-<number>-<short-description>` (e.g., `fix/issue-123-logout-redirect`).

#### c. In Review (`Status: In Review`)

*   Once the developer has fixed the bug and verified it locally, they open a **Pull Request (PR)** to merge their branch into `main`.
*   The PR description **must** link to the issue it resolves using a keyword like `Fixes #123`, `Closes #123`, or `Resolves #123`. This creates a direct link between the PR and the issue and will automatically close the issue when the PR is merged.
    *   **Multiple Issues**: If a PR addresses multiple issues, list all of them (e.g., `Fixes #123, Closes #456`).
    *   **Related Issues (No Close)**: If a PR is related to an issue but doesn't fully resolve it, use `Related to #123` or `See #123`.
*   Another team member must review the PR to ensure the fix is correct, well-implemented, and does not introduce new bugs.

#### d. Done (`Status: Done`)

*   Once the PR is approved and passes all CI checks, it is merged into the `main` branch.
*   The linked issue is automatically closed and moved to the "Done" column on the project board.
*   The fix will be deployed to production in the next release cycle.

---

## 2. Bug Fix Process

This section details the process for correcting bugs.

### Process
1. Logging (Bug Report Template)
2. Reproduction and logs
3. Root cause analysis
4. Fix (code + tests)
5. Code review
6. Deploy via CI/CD
7. Post-deploy validation (tests, monitoring)
8. Documentation (Changelog, updated bug report)

### References
- `developer-guides/API-Guide.md#troubleshooting`
- `docs/project-management/Issue-Management-Guide.md#bug-tracking-and-management-process`

---

## 3. Anomaly Treatment Example

This section provides an example of how anomalies are detected, logged, fixed, and deployed.

### Detection
- Frequent 409 conflict on application creation (duplicate)

### Logging
- See `Bug-Report-Template.md` (Prisma P2002 conflict)

### Fix
- Code: return 409 with clear message on `P2002`
- Tests: add failing and passing cases
- Docs: update Troubleshooting

### Deployment
- CI/CD pipeline
- Verify `/health` and Newman scenarios

### Result
- Duplicate submission prevented, clear user message

---

## 4. Support Collaboration Example

This section illustrates an example of collaboration with support to resolve an issue.

### Context
- Customer reports password reset link expires too quickly

### Problem
- TTL too short

### Resolution
- Support: collect info, reproduce
- Dev: adjust TTL, add integration test, update docs
- Deployment: via CI/CD, validate after deploy

### Stakeholders
- Customer Support, Backend Developer, QA

### Result
- Functionality restored, similar incidents prevented
