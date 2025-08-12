# Monitoring and Alerting (C4.1.2)

Scope: API availability, DB connectivity, public endpoints, search and filtering.

## Indicators
- Availability: `/health` returns `status=ok`
- Performance: P95 < 500ms, P99 < 1000ms
- Error rate: < 5%

## Probes & Tools
- Newman (Postman CLI): `monitoring/postman-collection.json`
- Artillery load testing: `monitoring/artillery-config.yml`

## Thresholds
- Defined in `monitoring/artillery-config.yml` and `monitoring/README.md`

## Alerting (Slack)
- Script: `scripts/notify-slack.js`
- Secret: `SLACK_WEBHOOK_URL`

### Local Execution
```bash
npm run monitor:api
npm run monitor:performance
npm run monitor:ci # runs both; sends Slack alert on failure if configured
```

### Scheduled CI (optional)
- Workflow: `.github/workflows/monitoring.yml`
- Vars: `MONITORING_BASE_URL`, `SLACK_WEBHOOK_URL`

## Logging
- Centralized API error handler: `apps/api/src/middleware/errorHandler.ts`
- Troubleshooting: `docs/developer-guides/API-Troubleshooting.md`
- End-to-end request tracing: the web app adds an `X-Request-Id` header to every API call via `apps/web/src/services/apiClient.ts`. The API uses that value as the request id and echoes it back in the `x-request-id` response header. Logs in CloudWatch include this id for correlation.

