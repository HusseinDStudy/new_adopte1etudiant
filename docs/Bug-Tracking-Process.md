# Bug Tracking and Correction Process

This document outlines the official process for reporting, tracking, and resolving bugs within the AdopteUnEtudiant project. A systematic approach to bug management is essential for maintaining software quality and ensuring a stable user experience. We use **GitHub Issues** as our primary tool for this process.

---

## 1. How to Report a Bug

All bugs, whether found by a developer during testing or a user during operation, must be reported by creating a new **Issue** in the project's GitHub repository.

### Bug Report Template

When creating a new issue, please use the "Bug Report" template, which includes the following sections:

-   **Title**: A clear and concise summary of the bug.
    -   *Good*: "Student Profile - Skills field does not save after edit."
    -   *Bad*: "Profile is broken."
-   **Description**: A detailed description of the problem.
-   **Steps to Reproduce**:
    1.  Clear, step-by-step instructions on how to trigger the bug.
    2.  Example: "1. Log in as a student. 2. Go to the Profile page. 3. Change the skills..."
-   **Expected Behavior**: What you expected to happen.
-   **Actual Behavior**: What actually happened, including any error messages.
-   **Environment (if applicable)**: Browser, OS, etc.
-   **Screenshots**: Add screenshots if they help to illustrate the problem.

---

## 2. Bug Triage and Lifecycle

Once an issue is created, it follows a defined lifecycle managed with GitHub labels.

### Labels

-   `bug`: This label is applied to all confirmed bugs.
-   `critical`: For bugs that block core functionality (e.g., user cannot log in) or cause data loss. These have the highest priority.
-   `high-priority`: For bugs that significantly impact the user experience but do not block the entire application.
-   `low-priority`: For minor issues or cosmetic bugs that do not affect functionality.
-   `in-progress`: A developer has been assigned the issue and is actively working on a fix.
-   `needs-info`: The report is missing key information, and the developer is waiting for clarification from the reporter.
-   `fixed`: The bug has been fixed, and the code has been merged into the `main` branch.

### The Process

1.  **New Issue**: A bug is reported. A project maintainer reviews the issue.
2.  **Triage**: The maintainer validates that the bug is reproducible. If so, they apply the `bug` label and a priority label (`critical`, `high`, `low`). If not, they may label it `needs-info` or close it if it's invalid.
3.  **Assignment**: A developer assigns the issue to themselves, and the `in-progress` label is applied.
4.  **Development**: The developer creates a new branch (e.g., `fix/login-error-123`) to work on the fix.
5.  **Pull Request**: Once the fix is complete, the developer submits a Pull Request to merge the fix into `main`. The PR description must link to the issue it resolves (e.g., "Fixes #123").
6.  **Review & Merge**: The PR is reviewed by another team member. Once approved, it's merged.
7.  **Closure**: Merging the PR automatically closes the associated GitHub Issue. The bug is now considered resolved.

---

## 3. Plan for Correcting Bugs (Plan de Correction)

Our plan for correcting bugs is based on priority:

-   **Critical Bugs**: Must be addressed immediately. A hotfix may be deployed outside of the regular release cycle.
-   **High-Priority Bugs**: Are prioritized for the next development sprint or release.
-   **Low-Priority Bugs**: Are addressed when developer resources are available, after higher-priority work is completed.

This structured process ensures that we can systematically track and eliminate bugs, prevent regressions, and continuously improve the quality of the software. 