# User Notes

- The desired token representation for legacy `admin=true` behavior is not defined in the fixture. The control plane assumes this must become an explicit claim or scope before legacy auth is removed.
- `docs/auth.md` says mobile clients do not send bearer tokens yet. Ship readiness depends on whether that statement is still true outside the fixture.
- Tooling versions and configuration style are unspecified because `package.json` has scripts but no devDependencies, `tsconfig.json`, ESLint config, or lockfile. The first implementation slice should choose the minimal repo-local setup needed to make the release gate executable.
