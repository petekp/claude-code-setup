---
name: herdr-names
description: "Rename Herdr tabs, panes, and agents so each sidebar entry says in a few words what that session is doing. Use whenever the user mentions Herdr and wants tab, pane, or agent names renamed, relabeled, cleaned up, tidied, or made clearer; says a tab or agent name is confusing, meaningless, stale, or just a number; asks what a tab is; or wants the sidebar readable at a glance, even if they only say 'fix the names' or 'label these'. Reads each pane's recent output and names the task, not the project and never the auto-generated terminal title. Needs to run inside Herdr (HERDR_ENV=1). Not for naming things in code, git branches, tmux or terminal windows, or Claude Code sessions outside Herdr."
---

# Herdr names

## Why names go stale

Herdr's sidebar is only useful when each entry says what that session is for. Three things break that:

- A new tab is labeled with a number ("1") unless someone names it.
- Claude Code rewrites the terminal title on every prompt from the latest user message. A real session showed "Address findings" after the user typed "address the findings". Out of context it says nothing.
- Workspace names already carry the project, so a tab that repeats it ("zui" under zui) adds nothing.

This skill reads what each agent is actually doing and gives the tab, its pane, and the agent one short task name each. Run it end to end without asking for confirmation. Every rename is reversible, and the user invoked it to avoid doing this by hand.

## Steps

`SKILL_DIR` below is the base directory printed when this skill loaded.

1. Confirm you are inside Herdr with `test "${HERDR_ENV:-}" = 1`. If that fails, say you are not running inside Herdr and stop. The CLI can only see the session it runs in.
2. Take the snapshot:

   ```bash
   python3 "$SKILL_DIR/scripts/herdr_names.py" snapshot
   ```

   It prints every workspace, tab, and pane with current labels, the agent's name and state, cwd, git branch, terminal title, and the tail of each agent's recent output. For Claude Code panes the recap line comes first; it is the best one-line statement of what the session is for. The first lines also say whether the Agents panel is configured to show tab or pane names at all.
3. Choose names with the rules below. For your own pane, marked "[this session]", use the conversation, not the output tail.
4. Write the plan as JSON in the scratchpad and apply it:

   ```bash
   python3 "$SKILL_DIR/scripts/herdr_names.py" apply plan.json
   ```

   Add `--dry-run` first when a choice feels uncertain. The script validates the whole plan before touching anything, skips names that are already in place, and prints before and after for each rename.
5. Report a before → after table, one line for each tab left alone and why, and the sidebar warning if the snapshot raised one.

## Naming rules

**Tab label: the task, not the project.** Two to four words, 24 characters or fewer, so it fits the sidebar without truncation. Build it from the recap line, the last assistant summary, and the branch name. Never copy the terminal title. Lowercase except proper nouns, which matches how tabs get named by hand. From a real session:

| Evidence | Tab label |
|---|---|
| recap: "Touch-pinch v1 for the zoomable grid is built and verified" | touch pinch-to-zoom |
| recap: "Pixel Pete audit remediation is complete: 18 of 20 findings fixed" | Pixel Pete audit fixes |
| branch `pkp/site-fit-and-finish`, output about a postcard shadow fix | site fit & finish |
| recap: "building the reimagined three.js Timewave Zero view" | three.js view rebuild |

**Pane label: same as the tab when the tab has one agent.** When a tab holds two or more agents, give each pane its role instead ("reviewer", "tests"), because the tab name cannot tell them apart.

**Agent name: a kebab-case slug of the tab label.** It must match `[a-z][a-z0-9_-]{0,31}` and be unique across live agents; the script rejects anything else. Keep it around 16 characters because it gets typed on the command line, as in `herdr agent prompt pinch-zoom "..."`. An agent name lives only as long as that agent process. When the session restarts the name is gone, and the next run of this skill sets it again.

**Keep names that are already clear.** Renaming a good label costs the user the recognition they have built up. Change a name only when it is a default number, repeats the workspace, is the auto-generated title, or no longer matches what the session is doing. Running the skill twice in a row should change nothing the second time.

## What to leave alone

- Workspace labels. They are the project layer and the user sets them on purpose. Change one only when asked.
- Tabs with no agent, such as a shell prompt or a dev server. Rename one only if its label is a bare number; then name what the shell is doing ("evercars backend shell"). List them in the report either way.
- The panes themselves. Never send text or keys, never focus, never close. Reading is the only contact, and CLI reads do not disturb an agent or mark its work as seen.

## If the names will not show

The Agents panel renders whatever the `rows` under `[ui.sidebar.agents]` in `~/.config/herdr/config.toml` list. When the snapshot says those rows have no `tab` or `pane` token, the new names exist but the panel keeps showing something else, usually the terminal title. Do not edit the config on your own; the user may have chosen that layout deliberately. Report it and offer this layout, which puts the tab name first with the workspace under it:

```toml
[ui.sidebar.agents]
rows = [
  ["state_icon", { token = "tab", bold = true }],
  [{ token = "workspace", dim = true }],
]
```

If they say yes, back the file up, make the edit, and run `herdr server reload-config`.

## Plan format

```json
[
  {"pane_id": "wA:p1", "tab": "touch pinch-to-zoom", "pane": "touch pinch-to-zoom", "agent": "pinch-zoom"},
  {"tab_id": "w5:tP", "tab": "evercars backend shell"}
]
```

Every name field is optional; omit one to leave it unchanged. A `pane_id` entry renames that pane's own tab. Use `tab_id` for a tab that has no agent pane. An empty string for `pane` or `agent` clears that label.
