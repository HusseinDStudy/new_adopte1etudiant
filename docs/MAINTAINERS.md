# Maintainers & Documentation Rules

This file describes who maintains documentation and how to make changes to canonical docs.

Who maintains what
- **Docs owner**: Repository maintainers (owners of the main repo). For doc-specific sections, see the file headers.
- **API docs**: `apps/api` maintainers (see `package.json` scripts for `docs:validate`).

Editing rules
- Edit canonical docs under `docs/` directly. Small editorial changes (typos, formatting) may be made via PR.
- For structural changes (new canonical pages, moving docs), open an issue describing the proposed change and why.
- When updating API or endpoint docs, run `npm run docs:validate` locally before opening a PR.

Validation
- Use `npm run docs:validate` to run the documentation validator. The root workspace script forwards this to `apps/api`.
- CI will run `docs:validate` on pushes/PRs via `.github/workflows/docs-validate.yml` (added to the repo).

Link policy
- Prefer relative links within `docs/` (e.g., `docs/technical-guides/Architecture.md`).
- If you move or remove a document, update `docs/INVENTORY.md` and add a redirect note in the old file pointing to the new canonical location.

Contact
- For doc ownership conflicts or questions, open an issue with the `documentation` label.


