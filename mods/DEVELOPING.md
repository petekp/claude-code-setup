# Developing mods

## Checks

`./scripts/validate.sh` checks every mod in `mods/` four ways:

- Prettier checks the formatting of its code and JSON. To format, run
  `npx -y prettier@3.9.9 --write mods skills`. The settings are in
  `.prettierrc.json` at the repo root.
- `claude plugin validate` checks the mod's structure.
- `tsc` checks its types against `.claude-plugin/types`.
- `claude plugin test` runs its tests.

Claude Code writes `.claude-plugin/types` when it loads the mod from a
folder you own. Until a mod has loaded once, the type check is skipped. Git
ignores that folder.

## Edits and running sessions

A session that already loaded a mod does not always pick up edits to it.
Run `/reload-plugins` in that session. Only the person at the session can
run it, so an agent should ask for it instead of assuming the session shows
the new version.

## Testing a mod's UI live

`mods/scripts/live.sh` runs a Claude Code session with one mod inside tmux.
You can type into it, click it and read its screen:

```sh
mods/scripts/live.sh start mods/think-first
mods/scripts/live.sh send think-first '/think'
mods/scripts/live.sh snap think-first --bg
mods/scripts/live.sh click think-first 80 37
mods/scripts/live.sh stop think-first
```

The usage comment at the top of the script lists every command.

The session gets its own config folder and a placeholder API key. Slash
commands, panes and the mod's state work. A prompt to the model fails.

The session needs its own config folder because a mod's plugin store is
keyed by the mod's name, not its folder. A session on your own config writes
to the store that your other sessions use, even when it loads a copy of the
mod from another path. The store files are in `~/.claude/plugins/store/`.

The script handles three terminal details:

- Inside tmux, Claude Code draws in 256 colors unless both
  `COLORTERM=truecolor` and `CLAUDE_CODE_TMUX_TRUECOLOR=1` are set.
- `snap` captures with `tmux capture-pane -N`. Without `-N`, a row that has
  only a background color comes back blank.
- `click` and `scroll` send SGR mouse sequences, as a terminal does.

## The mod UI

These behaviors are easy to get wrong:

- Only a `Button` takes presses. A `Box` cannot be pressed.
- A plain `Button` draws its label as plain text. The label cannot be bold or
  colored, but the button takes `dimColor`.
- A `Box` with `position="absolute"` drawn over a `Button` takes the
  button's clicks. An overlay cannot add styling to a clickable label.
- An absolute `Box` with `top={0}` and `bottom={0}` spans its parent's
  height and does not change the parent's size. The inbox mod draws its tree
  lines this way.
- A pane's body width is `props.bodyColumns`.
- Pass `$` only to top-level function declarations. Otherwise
  `claude plugin validate` fails.

## Theme colors

A mod names theme colors by key, such as `color="subtle"`. These are the dark
theme's values in Claude Code 2.1.289:

| Key | RGB |
| --- | --- |
| `composerSidebarBackground` | 38, 38, 38. The pane background. |
| `userMessageBackground` | 55, 55, 55 |
| `subtle` | 80, 80, 80 |
| `selectionBg` | 38, 79, 120 |
| `ide` | 71, 130, 200 |
| `professionalBlue` | 106, 155, 204 |

To read the colors a mod draws, run `live.sh snap <name> --bg`. It prints each
background as RGB.
