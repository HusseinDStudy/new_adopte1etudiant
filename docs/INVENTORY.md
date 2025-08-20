# Documentation Inventory — Adopte1Etudiant

This file is the canonical inventory of the project's documentation. It lists the canonical sources, notes duplicates that were fused, and short TODOs for missing/uncertain items.

Canonical entrypoint
- **`docs/Home.md`** — Project wiki / navigation (canonical entry point).

Primary canonical docs (by area)
- **User guides**: `docs/user-guides/User-Manual.md` (canonical user manual)
- **Developer guides**: `docs/developer-guides/Development-Guide.md`, `docs/developer-guides/API-Guide.md`, `docs/developer-guides/Internationalization.md`, `docs/developer-guides/Blog-Admin-Guide.md`
- **Technical guides**: `docs/technical-guides/Architecture.md`, `docs/technical-guides/Database-Guide.md`, `docs/technical-guides/Security.md`, `docs/technical-guides/Design-Patterns.md`
- **Project management**: `docs/project-management/CI-CD.md`

Duplicates merged (old files now point to canonical source)
- `docs/project-management/Continuous-Integration-Protocol.md` → **DELETED** (consolidated into `docs/project-management/CI-CD.md`)
- `docs/project-management/Continuous-Deployment-Protocol.md` → **DELETED** (redundant with `CI-CD.md`)
- `docs/technical-guides/Frameworks-And-Patterns.md` → consolidated into `docs/technical-guides/Design-Patterns.md` (all frameworks and patterns now in one canonical file).
- `docs/developer-guides/API-Documentation.md` → consolidated into `docs/developer-guides/API-Guide.md`.
- `docs/developer-guides/API-Troubleshooting.md` → consolidated into `docs/developer-guides/API-Guide.md`.
- `docs/developer-guides/API-Integration-Guide.md` → consolidated into `docs/developer-guides/API-Guide.md`.
- `docs/developer-guides/API-Testing-Guide.md` → consolidated into `docs/developer-guides/Quality-Assurance-Guide.md`.
- `docs/developer-guides/Release-Readiness.md` → consolidated into `docs/developer-guides/Update-Manual.md`.
- `docs/project-management/Acceptance-Test-Plan.md` → **DELETED** (consolidated into `docs/developer-guides/Quality-Assurance-Guide.md`)
- `docs/project-management/Bug-Correction-Plan.md` → **DELETED** (consolidated into `docs/developer-guides/Quality-Assurance-Guide.md`)
- `docs/project-management/Test-Plan.md` → **DELETED** (consolidated into `docs/developer-guides/Quality-Assurance-Guide.md`)
- `docs/project-management/Version-Journal.md` → **DELETED** (consolidated into `CHANGELOG.md`)

Quick review notes
- The `docs/` tree is comprehensive and already contains most essentials: architecture, CI/CD, security, accessibility reports, testing guides, and an API changelog.
- `docs/Home.md` already maps most documents; this inventory makes the canonical locations explicit.

Open TODOs
- TODO: Run a link-check in CI to detect any remaining stale internal links and add the job to `.github/workflows`.

- **Maintainers**: `docs/MAINTAINERS.md` (new) — rules for editing canonical docs and running validation tooling.
- **Repository changelog**: `CHANGELOG.md` (new) — root-level pointer to API and release journals.

If something here looks incorrect, update `docs/INVENTORY.md` and edit the referenced canonical document.

**Testing Documentation Consolidation**
- `docs/developer-guides/Unit-Test-Harness.md` → consolidated into `docs/developer-guides/Quality-Assurance-Guide.md`.
- `docs/project-management/Test-Strategy.md` → consolidated into `docs/developer-guides/Quality-Assurance-Guide.md`.