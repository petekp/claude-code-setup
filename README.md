# Claude Code and Codex setup

My configuration for Claude Code and OpenAI Codex: skills, hook scripts, Claude
Code mods, and a setup script that links them into both tools. It is shell
scripts, Markdown, and the mods' TypeScript, with no build step.

## Setup

```sh
git clone https://github.com/petekp/claude-code-setup.git
cd claude-code-setup
./setup.sh
```

`setup.sh` creates these links:

| Link | Points to |
|---|---|
| `~/.claude/scripts` | `scripts/` |
| `~/.claude/skills/<name>` | each skill in `skills/` and in `~/.agents/skills` |
| `~/.codex/skills/<name>` | each skill in `skills/` |

Codex reads `~/.agents/skills` itself, so those skills are linked only for
Claude Code. `./setup.sh --undo` removes the links.
`./scripts/skill-doctor.sh` checks them.

## Skills

`skills/` holds the skills written in this repo. Skills from elsewhere, such
as ones installed with `npx skills add -g`, live in `~/.agents/skills`.

Both agents' skill folders stay real folders, so other tools can install into
them as well. `link-skills.sh` only touches links that point into this repo or
into `~/.agents/skills`.

After adding or removing a skill, run `./scripts/link-skills.sh`, or start a
Claude Code session, whose SessionStart hook runs it. Check frontmatter with
`./scripts/validate.sh`.

## Mods

`mods/` holds Claude Code mods: plugins whose TypeScript hooks run inside
Claude Code. Each mod's README says what it does.

The inbox mod has its own repo,
[petekp/inbox](https://github.com/petekp/inbox). It collects what is waiting
on you in a session: the agent's questions, issues Claude noted, and your
PRs' checks and reviews.

Nothing links them yet. To try one, start Claude Code with
`claude --plugin-dir mods/<name>`. `./scripts/validate.sh` checks every mod.
`mods/DEVELOPING.md` explains how to test a mod's UI live.

## Settings

`~/.claude/settings.json` belongs to Claude Code. Claude Code rewrites the
file itself, for example after `/model` or a plugin install. A link into this
repo would be replaced by a regular file on the next write, so settings are
not linked.

`./scripts/settings-snapshot.sh` copies the live file to
`~/.agents/claude/settings.json`, or to `$CLAUDE_SETTINGS_SNAPSHOT`, for a
private repo of your own. `--diff` shows what changed since. On a new machine,
`setup.sh` copies the snapshot into place when no settings file exists.

The hooks and status line these scripts are written for:

```json
{
  "hooks": {
    "SessionStart": [
      { "hooks": [{ "type": "command", "command": "~/.claude/scripts/skill-doctor.sh --quiet" }] }
    ],
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "bash \"$HOME/.claude/scripts/gh-skill-nudge.sh\" 2>/dev/null || true",
            "if": "Bash(gh *)",
            "timeout": 5
          }
        ]
      }
    ]
  },
  "statusLine": { "type": "command", "command": "~/.claude/scripts/statusline.sh" }
}
```

## Scripts

| Script | What it does |
|---|---|
| `link-skills.sh` | Links skills into `~/.claude/skills` and `~/.codex/skills`. |
| `skill-doctor.sh` | Runs `link-skills.sh`, then reports anything that needs a decision: broken links, skills with no `SKILL.md`, settings that differ from the snapshot. Prints nothing when healthy. |
| `validate.sh` | Checks each skill's frontmatter and the formatting of `mods/` and `skills/`, then validates, type checks and tests each mod. Needs PyYAML. |
| `skill-usage.sh` | Counts how often each skill was used, from Claude Code and Codex session logs. || `mcp-auth-watch.sh` | A SessionStart and Stop hook that logs when an MCP server starts or stops needing sign-in. |
| `session-end-cleanup.sh` | A SessionEnd hook that removes stale agent-browser files and stops session helper processes. |
| `settings-snapshot.sh` | Copies live settings to the snapshot, or diffs against it. |
| `statusline.sh` | Shows the model, folder, branch, and context use. |
| `gh-skill-nudge.sh` | Points at `better-github-skill` scripts for some `gh` commands. Does nothing unless that skill is installed. |

## Forking

Fork the repo, clone your fork, and run `./setup.sh`. Then:

- Remove the skills you don't want from `skills/` and add your own. A skill
  is a folder with a `SKILL.md` whose frontmatter has `name` and
  `description`.
- Rewrite `AGENTS.md`, which tells agents how to work in this repo.
- Put your personal instructions in `~/.claude/CLAUDE.md` and
  `~/.codex/AGENTS.md`, outside this repo.
- Build your own settings rather than copying mine. Start from the hooks
  above.

## License

MIT
