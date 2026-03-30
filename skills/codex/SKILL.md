---
name: codex
description: Route `/codex ...` requests to the local Codex CLI for one-shot autonomous execution. Use when the user explicitly invokes `/codex` or asks to hand a task off to Codex. Preserves the prompt verbatim, handles non-git directories, captures failures cleanly, and returns Codex's final message.
---

# Codex

Use the local `codex exec` CLI for one-shot autonomous execution.

## Workflow

1. Strip the leading `/codex` token and preserve everything after it verbatim.
2. If the remaining prompt is empty, ask the user what Codex should do.
3. Resolve `scripts/run-codex.sh` relative to this skill directory and pipe the prompt to it on stdin.
4. Share Codex's final message with the user.
5. If Codex changed files or made a concrete recommendation, summarize the important result in plain language.

## Invocation

Default invocation from the current working directory:

```bash
PROMPT="<everything after /codex>"
printf '%s' "$PROMPT" | "<skill-dir>/scripts/run-codex.sh"
```

Useful options:
- `--cd /path/to/project` to run Codex against a different working tree
- `--sandbox read-only` for review or analysis tasks that should not edit files
- `--search` only when the task genuinely needs live web research

## Behavior

The helper script:
- checks that `codex` is available on `PATH`
- uses `printf` instead of `echo` so multi-line prompts stay intact
- adds `--skip-git-repo-check` automatically outside Git repositories
- defaults to `--full-auto --ephemeral --color never` for a clean one-shot run
- captures Codex stdout and stderr to a temp directory
- returns only Codex's final message on success
- fails clearly if Codex exits non-zero or never writes a final message

## Notes

- Do not describe this as a background dispatch unless you are actually using a background-capable shell tool.
- If Codex fails, show the relevant error output instead of silently retrying.
- If `codex` is missing, tell the user that Codex CLI is not installed or not on `PATH`.
