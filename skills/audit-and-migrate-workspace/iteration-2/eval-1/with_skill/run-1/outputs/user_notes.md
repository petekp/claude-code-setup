# User Notes — Uncertainties

1. **Dashboard parity**: The fixture mentions "dashboards still reference the legacy event names." If the new analytics client changes event names (e.g., `"legacy signup"` → `"signup"`), downstream dashboards may break. This is flagged as out-of-scope in the charter but needs a human decision before shipping.

2. **Call sites outside the fixture**: The fixture only contains the library files, not actual call sites (e.g., page components that call `trackLegacySignup`). Slice-002 implementation will need to search for and migrate all consumers. If there are call sites in packages not shown in the fixture, the scope may need to expand.

3. **No test files in fixture**: The docs mention "Web app tests only cover the new page-view path." Without test files in the fixture, verification_commands are limited to grep-based checks. A real run would add test execution commands.

4. **ANALYTICS_WRITE_KEY usage**: Only the legacy env vars are targeted for removal. `ANALYTICS_WRITE_KEY` is assumed to be the new/correct var and is retained. If this assumption is wrong, slice-003 scope needs adjustment.
