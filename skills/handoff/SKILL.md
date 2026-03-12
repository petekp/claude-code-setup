---
name: handoff
description: >
  Generate a resume-ready handoff prompt that lets another session or agent continue work without
  rediscovering context. Use when the user asks for a handoff, bootstrap prompt, session summary,
  save-state prompt, or wants to continue later in a fresh session, another model, or a different
  environment. Also use when context is getting full and the current goal, repo state, decisions,
  verification status, blockers, and exact next actions must be preserved in a compact prompt.
---

# Handoff

Create a handoff that lets a fresh agent act immediately instead of re-deriving context.

## Workflow

### 1. Gather Hard-to-Rediscover Facts

Collect the details that are expensive to recover:

- Original goal and current scope
- Exact resume point: what was happening at the moment the handoff was requested
- Files, commands, URLs, logs, and error signatures that matter
- Decisions already made, plus the reason they were made
- User preferences, repo rules, or operating constraints established during the session
- Verification state: what passed, what failed, what was not run
- Blockers, risks, and open questions

If the work lives in a git repo, run `scripts/gather-git-state.sh` and include the useful parts.

### 2. Separate Facts From Guesses

Keep these distinct:

- **Observed facts**: commands run, files changed, errors seen, tests run
- **Current hypothesis**: what the agent currently believes is likely true
- **Open questions**: what still needs proof

Never imply certainty that the session did not earn. If tests were not run, say so explicitly.

### 3. Optimize for Resume Fidelity

Prioritize the information that makes the next session fast and safe:

- Absolute paths over vague file references
- Exact commands, failing checks, and specific error strings
- The next concrete action, not a broad workstream
- Constraints that would cause rework if forgotten
- Dead ends only when they prevent repeated wasted effort

Omit routine chatter, standard explanations, and long file contents.

### 4. Use an Action-Oriented Prompt Shape

Start the handoff with the mission and the immediate next move. Make it obvious where to resume.

```markdown
# Resume: [task]

## Mission
[1-2 sentences describing the goal and current scope]

## Resume Point
- Last meaningful action: [most recent command, edit, or observation]
- Next command or file to open: `[exact command]` or `/absolute/path/to/file:line`
- Success criterion for the next step: [what result should happen next]

## Current State
- [What is already done and working]
- [What is in progress]
- [What is blocked or uncertain]

## Repo State
- Working directory: `/absolute/path`
- Branch: `branch-name`
- Working tree: [clean/dirty + notable changes]
- Recent commits: `abc123 message`

## Key Artifacts
- `/absolute/path/to/file` - [why it matters]
- `command` - [what it proved or failed to prove]
- `error string / URL / log path` - [why it matters]

## Project Rules
- [Repo instruction, user preference, or workflow rule that must persist]

## Established Decisions
- [Decision + reason]

## Assumptions
- [Tentative belief that still needs verification]

## Verification State
- Passed: `command or check`
- Failed: `command or check`
- Not run: `command or check`

## Rejected Paths
- [Approach ruled out and why]

## Open Questions / Risks
- [Unknown, blocker, or edge case]

## Notes for the Next Agent
- [Shortcut, warning, or important context]
```

Omit empty sections. For non-repo work, skip `Repo State`.

### 5. Adapt to the Task Type

For coding or debugging work, emphasize:

- Reproduction steps
- Expected vs actual behavior
- Exact failing command or test
- Local changes that must not be overwritten

For planning, research, or review work, emphasize:

- Decision rationale
- Alternatives already ruled out
- Evidence gathered
- What still needs proof before implementation

## Compression Rules

Scale depth to the task:

- Simple task: 100-200 tokens
- Medium task: 200-450 tokens
- Complex task: 450-900 tokens

Compress aggressively:

- Use bullets instead of prose
- Include only the commands and files that matter
- Summarize long traces to the decisive lines
- Prefer `established:` or `not yet verified:` over long explanation

## Output

Always do both:

1. Display the full handoff prompt in a fenced code block
2. Copy it to the clipboard

Prefer `scripts/copy-to-clipboard.sh <file>` after writing the prompt to a temporary file or an
existing handoff artifact. If the repo already uses a handoff file such as `HANDOFF.md` or
`.claude/handoffs/...`, update that artifact too. Do not invent a new persistent file unless the
user asked for one or the project already has a convention.

Confirm clearly that the prompt was copied and, if relevant, where it was saved.

## Example Output

```markdown
# Resume: Add Google OAuth login

## Mission
Add Google OAuth login to the Express app. The strategy and routes exist; the next session should finish session serialization and verify the end-to-end flow.

## Resume Point
- Last meaningful action: hit the OAuth callback and reproduced `Failed to serialize user into session`
- Next command or file to open: `/Users/dev/acme/src/auth/google.ts`
- Success criterion for the next step: callback completes and the session stores the user successfully

## Current State
- Installed passport, passport-google-oauth20
- Created `/Users/dev/acme/src/auth/google.ts` with the strategy config
- Added `/auth/google` and `/auth/google/callback` routes
- Current blocker: callback returns `Failed to serialize user into session`

## Repo State
- Working directory: `/Users/dev/acme`
- Branch: `oauth/google-login`
- Working tree: dirty; local edits in auth setup and auth routes
- Recent commits: `91ab23f add google oauth routes`

## Key Artifacts
- `/Users/dev/acme/src/auth/google.ts` - strategy setup; missing serialization wiring
- `/Users/dev/acme/src/routes/auth.ts:45` - callback handler where the error surfaces
- `/Users/dev/acme/src/app.ts` - passport middleware initialized; session serialization still incomplete
- `npm test -- auth` - has not been run since the latest auth edits
- `Failed to serialize user into session` - decisive error signature

## Project Rules
- Do not add a persistent session store yet

## Established Decisions
- Keep `express-session` on the default memory store for now
- Use `.env` for `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`

## Assumptions
- Passport can serialize only the user ID without changing the current route contract

## Verification State
- Passed: strategy registration and auth route wiring
- Failed: OAuth callback request with session serialization error
- Not run: end-to-end OAuth success path after adding serialize/deserialize

## Rejected Paths
- Do not switch to a database-backed session store yet; it expands scope before the auth flow works

## Open Questions / Risks
- Decide whether to serialize the whole user record or just the user ID
```
