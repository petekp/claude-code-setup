---
event: PreToolUse
tool: Bash
matchContent: "git commit"
---

Before committing, have you verified the changes?

- [ ] `pnpm lint` passes (or `/verify`)
- [ ] `pnpm typecheck` passes
- [ ] Changes tested locally if they affect UI

If not verified, consider running `/verify` first.
