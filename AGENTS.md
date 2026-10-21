This repo is Pete's configuration for Claude Code and Codex: skills, hook scripts, and the setup that links them into `~/.claude` and `~/.codex`. It is shell scripts and Markdown, plus the TypeScript of the Claude Code mods in `mods/`. README.md describes the layout.

- The repo is public. Do not commit employer or client names, customer data, private file paths, or session state. Private configuration belongs in `~/.agents`, which is a private repo.
- Scripts with a `#!/bin/sh` shebang must be POSIX sh. macOS runs them with bash 3.2 in POSIX mode. shellcheck misses two of its failures:
  - A case pattern inside `$(...)` needs a leading paren, as in `("$x"/*)`. Without it, the script fails with a syntax error.
  - `[a-z]` also matches uppercase letters under a UTF-8 locale. Use `[[:lower:]]` and `[[:digit:]]`.
- After changing skills, scripts or mods, run `./scripts/validate.sh` and `./scripts/skill-doctor.sh`.
- `mods/DEVELOPING.md` explains how to test a mod's UI live without touching your own sessions' state.
- `skills/` holds only skills written here. Never commit a symlink into it. A skill from anywhere else goes in `~/.agents/skills`, where `link-skills.sh` finds it.
- `~/.claude/settings.json` is a regular file that Claude Code owns. Do not link it to the repo. Record it with `./scripts/settings-snapshot.sh`.
- Hook scripts run in every session and fail silently. Before committing a change to one, pipe sample hook JSON into it and check the output. SessionStart output goes into the model's context, so a SessionStart script prints nothing when healthy.
- To remove a skill installed with `npx skills`, run `npx skills remove -g -y <name>`. It removes the files, the key in `~/.agents/.skill-lock.json`, and the agent links. If the files are already gone, delete the key with `jq`; otherwise `npx skills update -g` reinstalls the skill.
