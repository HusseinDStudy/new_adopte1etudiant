# API Maintenance Guide

Scope: keeping the API healthy, secure, and up to date across environments.

## Routine Operations

- Daily
  - Check CI status and coverage on main
  - Review monitoring results (`monitoring.yml` workflow and local runs)
  - Scan logs for errors and unusual latency
- Weekly
  - Review dependency alerts (Dependabot, `npm audit`)
  - Run performance baselines (Artillery)
  - Review open issues/bug trends
- Monthly
  - Rotate secrets as needed
  - Update base images and re-run security scans (Trivy)
  - Review and update documentation and changelog

## Dependency & Schema Updates

Follow the detailed procedure in `docs/developer-guides/Update-Manual.md` (branching, tests, migrations, deployment, rollback). Ensure:
- Frequency is respected (weekly checks, monthly consolidation when needed)
- Perimeter is clear (API app, shared packages, Docker images)
- Type is documented (automated PRs vs manual upgrades)

## Monitoring & Alerting

- Functional monitoring: `monitoring/postman-collection.json` (Newman)
- Performance monitoring: `monitoring/artillery-config.yml` (Artillery)
- CI integration: `.github/workflows/monitoring.yml`
- Optional Slack alerts: `scripts/notify-slack.js` (set `SLACK_WEBHOOK_URL`)

Commands:
```bash
npm run monitor:api
npm run monitor:performance
npm run monitor:all
```

## Incident Response

- Troubleshooting playbook: `docs/project-management/Troubleshooting.md`
- Bug report template and process:
  - `docs/project-management/Bug-Report-Template.md`
  - `docs/project-management/Bug-Tracking-Process.md`
  - `docs/project-management/Issue-Management-Guide.md`
  - `docs/developer-guides/Quality-Assurance-Guide.md#bug-identification-tracking-and-correction`
- Fix and rollout: `docs/developer-guides/Quality-Assurance-Guide.md#bug-fixing-process-development-team`

## References

- Update process: `docs/developer-guides/Update-Manual.md`
- CI/CD overview: `docs/project-management/CI-CD.md`
- Deployment protocol: `docs/project-management/CI-CD.md`
- Quality & performance: `docs/developer-guides/Quality-Assurance-Guide.md#quality-and-performance-criteria`


