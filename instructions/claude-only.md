## Artifacts

- Always place new artifacts like planning and knowledge docs in `.claude/` rather than the project root or other locations. We don't want to pollute the repo.

**What to ignore (add to .gitignore):**

- Any `*.local.md` files — personal notes

**When starting a new project or joining an existing one:**

1. Check if `.claude/` is gitignored—if so, consider unignoring it
2. Add the specific local file ignores listed above
3. Use `.claude/plans/` for significant decisions and implementation plans
4. Use `.claude/docs/` for guides that inform how Claude should work in this repo

**Running the dev server**

Use `portless` to run dev servers — it assigns stable `.localhost` URLs and eliminates port conflicts.
- `portless <name> <cmd>` — run a dev server (e.g. `portless myapp next dev` → `http://myapp.localhost:1355`)
- `portless proxy start` — start the proxy daemon (auto-started on first use)
- `portless list` — show active routes
- Run `portless --help` for full usage

## Workflow Patterns

### Coordinator Role Discipline
When operating as a Coordinator, NEVER use Edit, Write, or Read on source files directly. All implementation and verification must be delegated to sub-agents via the Task tool. If unsure whether something needs delegation, it does.
