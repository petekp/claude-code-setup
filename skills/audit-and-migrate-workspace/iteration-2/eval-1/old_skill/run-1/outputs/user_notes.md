# User Notes — Uncertainties

1. **Dashboard parity for signup events** — The existing SLICES.yaml flags "dashboard parity not verified" as a risk for slice-002. It's unclear whether downstream analytics dashboards expect a specific event name/shape from the signup event. This should be confirmed with the analytics team before completing slice-002.

2. **Ratchet budget calibration** — Anti-pattern counts in AUDIT.md are based on inspecting the fixture files directly. In a real codebase, a full `grep -r` sweep would be needed to calibrate budgets against actual counts (there may be call sites not visible in the fixture's limited file set).

3. **Call site inventory for signup** — The fixture does not include the actual call sites that invoke `trackLegacySignup`. The number of call sites and their locations will need to be discovered via grep when executing slice-002.

4. **README location** — The docs mention "README still tells people to set LEGACY_ANALYTICS_WRITE_KEY" but no README file exists in the fixture. The README cleanup task in slice-004 assumes a README exists somewhere in the real repo.

5. **Test coverage for signup path** — The docs note "web app tests only cover the new page-view path." Tests for the signup path should be written as part of slice-002's TDD step, but the test file locations and framework are not visible in the fixture.
