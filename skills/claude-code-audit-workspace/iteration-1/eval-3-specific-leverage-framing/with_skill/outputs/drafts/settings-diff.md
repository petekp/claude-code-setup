# Settings diff — wiring the cooldown + overnight-guard hooks

These edits go into `~/.claude/settings.json`. They assume the scripts from this draft are installed at:

- `~/.claude/hooks/circuit-handoff-cooldown.sh`
- `~/.claude/hooks/overnight-guard.sh`

## 1. Wire the continuity-nag cooldown into your Stop hook

Your existing Stop hook (likely in `.circuit/bin/circuit-engine` or a user-level script) currently emits the `Auto-continuity guard` nag unconditionally when HEAD has advanced past the continuity record's base_commit. Wrap it so the cooldown decides whether the nag is worth emitting.

The concrete change: in whatever Stop-hook command runs `circuit-engine continuity-guard` (or equivalent), short-circuit on the cooldown's exit code.

### Before
```json
{
  "hooks": {
    "Stop": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": ".circuit/bin/circuit-engine continuity-guard"
          }
        ]
      }
    ]
  }
}
```

### After
```json
{
  "hooks": {
    "Stop": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "$HOME/.claude/hooks/circuit-handoff-cooldown.sh && .circuit/bin/circuit-engine continuity-guard || true"
          }
        ]
      }
    ]
  }
}
```

The wrapper exits `0` when the nag should fire (real change threshold met). Any non-zero exit (specifically `78`) skips the nag. `|| true` keeps the Stop hook's own exit code clean.

### Tunables

Override via environment variables in the command string or in your shell profile:

- `CIRCUIT_HANDOFF_COMMIT_THRESHOLD` (default `3`): minimum commits advanced to allow nag.
- `CIRCUIT_HANDOFF_MINUTE_THRESHOLD` (default `20`): minimum minutes since last continuity record to allow nag.

Start with defaults for two weeks, then tighten/loosen based on whether you feel the nag is firing at the right cadence.

## 2. Wire the overnight-guard into SessionStart:resume

### Before (assumed similar to)
```json
{
  "hooks": {
    "SessionStart": [
      { "matcher": "resume", "hooks": [ { "type": "command", "command": "..." } ] }
    ]
  }
}
```

### After
Add a second hook entry under the same matcher:
```json
{
  "hooks": {
    "SessionStart": [
      {
        "matcher": "resume",
        "hooks": [
          { "type": "command", "command": "..." },
          { "type": "command", "command": "$HOME/.claude/hooks/overnight-guard.sh" }
        ]
      }
    ]
  }
}
```

The overnight-guard is a no-op when no active overnight log is present, so it's safe to leave wired in all SessionStart:resume calls.

## 3. Verify

```bash
# Cooldown: current project with sub-threshold changes -> should exit 78
~/.claude/hooks/circuit-handoff-cooldown.sh; echo "exit: $?"

# Cooldown: force "lots of commits" by lowering threshold
CIRCUIT_HANDOFF_COMMIT_THRESHOLD=0 ~/.claude/hooks/circuit-handoff-cooldown.sh; echo "exit: $?"

# Overnight guard: run from a project with no log -> exits 0, no output
~/.claude/hooks/overnight-guard.sh; echo "exit: $?"

# Overnight guard: create a stub log and re-run -> should emit contract text
mkdir -p /tmp/fake-proj/.claude/overnight-logs
printf "# Overnight session\n" > /tmp/fake-proj/.claude/overnight-logs/$(date +%Y-%m-%d)-session.md
( cd /tmp/fake-proj && ~/.claude/hooks/overnight-guard.sh )
```

If any step fails, the hook script has a bug, not your settings.

## 4. Rollback

Both changes are additive — revert by removing the wrapper call and the second hook entry. Nothing persistent changes on disk.
