# User Notes

## Uncertainties
- Whether `tests/helpers/` contains an `__init__.py` that would also need deletion (not present in fixture file listing, but worth verifying)
- Whether `pytest-repeat` is available for the `--count=10` flakiness verification suggested in SHIP_CHECKLIST.md (optional, not required)
- Whether any files outside the fixture reference `scenario_factory` (grep scoped to repo root should catch this, but the fixture is isolated)
