# Version Journal (C4.3.2)

Source of truth:
- API: `docs/developer-guides/API-Changelog.md` (Keep a Changelog + SemVer)

## Entry Template
```
## [x.y.z] - YYYY-MM-DD
### Added
- ...
### Changed
- ...
### Fixed
- ...
```

## Example
See `docs/developer-guides/API-Changelog.md` section `[1.0.0] - 2024-01-20`.

## Best Practices
- Link PRs/Issues
- Note migrations/actions required
- Document rollback notes

## Recent notable changes
- CloudWatch Logs integration via `docker-compose.prod.yml`
- Scheduled monitoring workflow (Newman + Artillery)
- End-to-end request tracing added: web sends `X-Request-Id`; API correlates and exposes the id in `x-request-id` header and logs

