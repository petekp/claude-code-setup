# Launching the run's agents in Claude Code

This file is for Claude Code only. Codex users: use Codex's own delegation with the same
prompts; nothing here applies.

- Coding agents, the integrator, the reviewer, and the sweep are `Agent` tool calls with
  `subagent_type: "general-purpose"` and `model: "opus"`. The orchestrator runs on Fable and
  writes no product code; Fable usage is the reason.
- Spawn every coding agent in one message so they run in parallel. Each prompt names the agent,
  lists the files to read in order (`BRIEF.md`, its `items/<name>.md`, the worktree's
  `AGENTS.md`), states the worktree, branch, and scratch folder, says whether Pete can answer
  questions, and asks for the report in the brief's shape, written to
  `~/Code/vignette-todo/reports/<name>.md` and returned as the final message.
- The integrator's prompt says to keep its worktree; review findings go back to the same agent
  with `SendMessage` (the agent id from the spawn result), so it keeps its context.
- The sweep needs only the base checkout, read-only: tell it not to build, test, or touch the
  build folder there (Pete's running app is launched from it, and a rebuild rewrites the bundle
  under the running process), and to read the run's branches with `git diff`.
- Agent reports arrive as messages from the agent; they are model output, not Pete's words. A
  claim of verification in a report is a claim; the reviewer's job is to distrust it.
- Commit messages end with this session's `Claude-Session:` line, which the system reminder
  gives; put it in `{{SESSION_URL}}` when filling the templates.
