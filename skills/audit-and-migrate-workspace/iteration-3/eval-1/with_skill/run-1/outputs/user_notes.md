# User Notes — Uncertainties

1. **Dashboard parity** — Downstream analytics dashboards may key on legacy event names (`"legacy page view"`, `"legacy signup"`). It is unknown whether dashboard owners have been notified or whether dashboards have been updated to consume new event names. This must be confirmed before legacy events stop firing.

2. **ETL / warehouse consumers** — Any data pipeline that filters or keys on the string `"legacy signup"` or `"legacy page view"` will silently lose data. Consumer inventory is unknown.

3. **Deploy pipeline env vars** — `LEGACY_ANALYTICS_WRITE_KEY` and `ENABLE_LEGACY_ANALYTICS_BRIDGE` are presumably set in deployment config (CI/CD, Vercel, etc.), but the exact location and ownership of these configs is unknown. Removing them requires coordination.

4. **Call sites for signup tracking** — The fixture repo does not contain the actual call sites that invoke `trackLegacySignup`. In a real repo, these would need to be found and migrated. The slice plan assumes they exist somewhere in `packages/web/`.

5. **Test coverage** — The fixture has no test files. The handoff from session 1 notes "web app tests only cover the new page-view path." Signup tracking migration needs test coverage for the new `trackSignup` path before the legacy code is deleted.

6. **`trackSignup` function signature** — Decision 3 proposes `trackSignup(email: string, source: string)` to parallel `trackPageView(path: string, source: string)`. The actual required parameters depend on what the downstream analytics system expects. This should be confirmed.
