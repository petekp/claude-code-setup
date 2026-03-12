# User Notes — Uncertainties

- The `source` field in `getCurrentUser`'s return value (`{ source: "legacy" | "token", id }`) may be consumed by callers outside this fixture. If so, removing it could break contracts. In the fixture there are no other consumers, so the audit assumes it's safe to drop.
- The fixture's `verifyAccessToken` is a stub returning hardcoded values. Real implementation may have error paths (expired tokens, invalid signatures) that need test coverage during migration — not visible from the fixture alone.
- No `tsconfig.json` is present in the fixture. The `build` script references one. Path aliases or strict mode settings could affect migration mechanics.
- The `.env.example` var `TOKEN_AUDIENCE=api://legacy-auth-service` contains "legacy" in its value. This is the audience URI, not a legacy auth artifact, but it could trigger false positives in residue sweep greps. The ship checklist grep should exclude control plane files and evaluate this var contextually.
