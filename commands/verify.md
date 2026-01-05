---
description: Run lint and typecheck to verify code quality before committing
allowed-tools: Bash
---

Run verification checks in sequence. Stop and report on first failure.

## Steps

1. **Lint check**
   ```bash
   pnpm lint
   ```
   If this fails, summarize the errors and stop.

2. **Type check**
   ```bash
   pnpm typecheck || pnpm tsc --noEmit
   ```
   If this fails, summarize the type errors and stop.

## Output

Report results clearly:

**All passed:**
```
✅ Lint: passed
✅ Types: passed

Ready to commit.
```

**On failure:**
```
❌ [Check] failed

[Brief summary of errors - not full output unless requested]

Fix these issues before committing.
```

## Notes

- Don't fix issues automatically. Just report them.
- If neither `pnpm lint` nor `pnpm typecheck` exist, try common alternatives (`npm run lint`, `npx tsc --noEmit`).
- If no lint/typecheck scripts found, inform the user.
