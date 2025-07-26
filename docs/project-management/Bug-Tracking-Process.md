# Bug Tracking and Management Process

This document outlines the standardized process for reporting, tracking, and resolving bugs in the "AdopteUnEtudiant" project. A clear process is essential for maintaining software quality and ensuring timely fixes.

---

## 1. Tooling

*   **Primary Tool**: **[GitHub Issues](https://github.com/user/repo/issues)** (replace with the actual project repo link).
*   **Integration**: GitHub Issues is directly integrated with our source code, pull requests, and project boards, making it the ideal choice for tracking our work.

---

## 2. Bug Reporting

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

---

## 3. Bug Lifecycle

Bugs follow a clear lifecycle from submission to resolution.

### a. Triage (`Status: To Do`)

*   When a new issue with the `bug` label is created, it enters the triage stage.
*   The project lead or a designated team member will:
    1.  **Validate the Bug**: Confirm that the report is clear and reproducible. If not, they may ask the reporter for more information.
    2.  **Prioritize**: Assign a priority label (`priority:low`, `priority:medium`, `priority:high`, `priority:critical`) based on the bug's impact.
    3.  **Categorize**: Add other relevant labels (e.g., `area:frontend`, `area:backend`, `good first issue`).
    4.  **Assign (Optional)**: Assign the issue to a specific developer or leave it unassigned for any developer to pick up.

### b. In Progress (`Status: In Progress`)

*   A developer assigns the issue to themselves to signal they are working on it.
*   The developer creates a new branch from `main` with a descriptive name, including the issue number.
    *   **Branch Naming Convention**: `fix/issue-<number>-<short-description>` (e.g., `fix/issue-123-logout-redirect`).

### c. In Review (`Status: In Review`)

*   Once the developer has fixed the bug and verified it locally, they open a **Pull Request (PR)** to merge their branch into `main`.
*   The PR description **must** link to the issue it resolves using a keyword like `Fixes #123`. This creates a link between the PR and the issue and will automatically close the issue when the PR is merged.
*   Another team member must review the PR to ensure the fix is correct, well-implemented, and does not introduce new bugs.

### d. Done (`Status: Done`)

*   Once the PR is approved and passes all CI checks, it is merged into the `main` branch.
*   The linked issue is automatically closed and moved to the "Done" column on the project board.
*   The fix will be deployed to production in the next release cycle.

---

## 4. Plan for Correcting Bugs (Plan de Correction)

Our plan for correcting bugs is based on priority:

-   **Critical Bugs**: Must be addressed immediately. A hotfix may be deployed outside of the regular release cycle.
-   **High-Priority Bugs**: Are prioritized for the next development sprint or release.
-   **Low-Priority Bugs**: Are addressed when developer resources are available, after higher-priority work is completed.

This structured process ensures that we can systematically track and eliminate bugs, prevent regressions, and continuously improve the quality of the software. 