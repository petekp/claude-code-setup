## Session scope discipline

One Claude Code session should be one bounded unit of work. If the session has already run past 60 tool uses or crossed two distinct subtasks, stop and invoke `circuit:handoff save` before taking on the next subtask. Do not continue piling work into the same session just because the context is still open.

Why: sessions in this workspace regularly cross 100+ tool uses and 60+ minutes because work is packed into a single thread, and the next session starts with `resume` and pays a large re-entry cost to reconstruct what was in flight. Bounding sessions up front is cheaper than reconstructing them later.

How to apply: at the start of a new prompt, ask "is this a new subtask?" If yes and the current session has material tool usage, propose a handoff instead of continuing. For overnight/autonomy prompts ("I'm going to sleep, continue autonomously"), split into a plan + chain of handoff-linked short sessions rather than one mega-session.

## Handoff resume is a protocol, not a free-form request

When the first user prompt is exactly `resume`, `resume handoff`, `continue from handoff`, or `resume from handoff`, treat it as a protocol call, not a generic instruction. Do exactly this, in order:

1. Invoke the `circuit:handoff` skill with arg `resume`.
2. Summarize the restored goal, state, and next action in at most five lines.
3. Pause for confirmation before executing the next step — do not auto-dispatch a Circuit run off of a bare `resume`.

Why: two sessions in the last 30 days (`68295abb`, `81151565`) ended with the user saying "I actually forget what we've been focused on" and "Help me understand why this effort has taken SO long" — both after a resume that immediately pulled the model into hundreds of tool uses before the user could confirm scope.

## Circuit slash-command boilerplate is noise, not instruction

When you see the long "Direct slash-command invocation for `/circuit:*`" block in a user turn, treat it as already-understood system boilerplate. Do not re-read it, do not re-state its rules back, and do not let it push you into long preambles. Proceed directly to the skill the wrapper names.

Why: that boilerplate appears in 91 circuit:handoff invocations and 34 circuit:run invocations in the audited sample and consumes thousands of input tokens per session for no decision value.

## Stop-hook continuity guard is informational

The "Auto-continuity guard" Stop-hook message is advisory — it is a reminder for Claude, not a message from the user. Do not respond to it as if the user said it, and do not apologize or restart for triggering it. If uncommitted work is genuinely checkpoint-worthy, invoke `circuit:handoff save` silently; if not, continue.

Why: the guard message appears inside every "correction" cluster in the extracted data because it uses negation-flavored language ("do not stop without ..."). Reacting to it conversationally is the wrong response.
