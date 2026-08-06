This repo is my version-controlled configuration for Claude Code and Codex: skills, hook scripts, settings, and the symlink setup that wires them into `~/.claude` and `~/.codex`. It is bash and markdown only — no application code, build step, or test suite.

- Shell scripts live in `scripts/` and `setup.sh`. Keep scripts with a `#!/bin/sh` shebang POSIX-compatible (no bashisms).
- After changing skills or scripts, run `./scripts/validate.sh` (frontmatter checks) and `./setup.sh --verify` (symlink health).
- `~/.claude/settings.json` must remain a symlink to this repo's `settings.json`. Editing it in place can silently replace the symlink with a regular file — after any settings change, confirm the symlink is intact and restore it if not.
- Entries in `skills/` are a mix of real directories and symlinks out to `~/.agents/skills` and other repos. Edit symlinked skills at their source; never dereference a symlink into a copy.
- Symlinked skills are **not committed** — their targets are absolute paths on one machine, so committing them hands anyone else a dangling link. They are recorded in `SKILLS.md` and ignored via `skills/.gitignore`, both generated. After adding or removing a skill, run `./scripts/gen-skills-manifest.sh`; `--check` verifies they are current without rewriting.
- Hook scripts referenced by `settings.json` run on every session. Test changes to them before committing (they fail silently in the harness).
