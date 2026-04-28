# Installing session-size-warning

1. Copy `session-size-warning.sh` to `~/.claude/hooks/session-size-warning.sh`.
2. `chmod +x ~/.claude/hooks/session-size-warning.sh`.
3. Add to `~/.claude/settings.json` under the `hooks` key:

```jsonc
{
  "hooks": {
    "PostToolUse": [
      {
        "name": "session-size-warning",
        "command": "~/.claude/hooks/session-size-warning.sh"
      }
    ]
  }
}
```

4. Tune thresholds via env in your shell profile if needed:
   ```bash
   export CC_SESSION_WARN_TOOLS=80   # default 80
   export CC_SESSION_WARN_MIN=60     # default 60 (minutes)
   ```

The hook fires at most once per session.
