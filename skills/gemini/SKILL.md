---
name: gemini
description: Route `/gemini ...` requests to the Cursor headless CLI for one-shot autonomous execution. Use when the user explicitly invokes `/gemini` or asks to hand a task off to Cursor agent. Preserves the prompt verbatim, runs in headless print mode, and returns Cursor's output.
---

# Gemini

Use the Cursor headless CLI (`cursor agent --print`) for one-shot autonomous execution.

## Workflow

1. Strip the leading `/gemini` token and preserve everything after it verbatim.
2. If the remaining prompt is empty, ask the user what Cursor should do.
3. Resolve `scripts/run-cursor.sh` relative to this skill directory and pipe the prompt to it on stdin.
4. Share Cursor's output with the user.
5. If Cursor changed files or made a concrete recommendation, summarize the important result in plain language.

## Invocation

Default invocation from the current working directory:

```bash
PROMPT="<everything after /gemini>"
printf '%s' "$PROMPT" | "<skill-dir>/scripts/run-cursor.sh"
```

Useful options:
- `--cd /path/to/project` to run Cursor against a different working directory
- `--mode plan` for read-only planning/analysis (no file edits)
- `--mode ask` for Q&A explanations (read-only)
- `--model <model>` to override the default model (e.g., `gpt-5`, `sonnet-4`, `sonnet-4-thinking`)

## Behavior

The helper script:
- checks that `cursor` is available on `PATH`
- uses `--print --force --trust --output-format text` for clean headless execution
- uses `--workspace` to set the working directory
- captures stdout and stderr separately to a temp directory
- returns only Cursor's text output on success
- fails clearly if Cursor exits non-zero or produces no output

## Notes

- Do not describe this as a background dispatch unless you are actually using a background-capable shell tool.
- If Cursor fails, show the relevant error output instead of silently retrying.
- If `cursor` is missing, tell the user that Cursor CLI is not installed or not on `PATH`.
- Authentication uses the `CURSOR_API_KEY` env var or prior `cursor agent login`.
