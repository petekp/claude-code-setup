# Analytics migration

The web package is moving from `legacy-analytics.ts` to `analytics-client.ts`, but several dashboards
still reference the legacy event names and the env bridge is still enabled for rollback safety.

Known rough edges:
- README still tells people to set `LEGACY_ANALYTICS_WRITE_KEY`
- Web app tests only cover the new page-view path
- The old signup event is still emitted in some flows
