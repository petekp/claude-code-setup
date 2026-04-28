---
name: skill-dead-code-sweep
description: Reviews ~/.claude/skills/ against the last N days of actual session transcripts to identify skills that never triggered and are paying context-noise cost for no value. Produces a disable/archive recommendation per skill. Use when the user has 30+ skills installed and wants to reduce trigger-time noise, or when the user asks to "clean up my skills", "find unused skills", or "which skills never fire".
---

# Skill dead-code sweep

## Why

The audited user has 40+ skills installed under `~/.claude/skills/`. In a 25-session sample covering 30 days, the Skill tool was invoked 41 times total, dominated by:

- `circuit:handoff` — 91 invocations
- `circuit:run` — 34 invocations
- `codex` — 11 invocations
- `circuit:explore` — 4 invocations

The rest — `api-design-patterns`, `clean-architecture`, `ubiquitous-language`, `typography`, `improve-codebase-architecture`, `literate-guide`, `formal-verify`, `grill-me`, `dogfood`, `swift-apps`, `swiftui-expert-skill`, `deep-research`, `deepwiki`, `seam-ripper`, `ai-sdk`, `agentation`, `browser-use`, `agent-browser` (duplicate of browser-use), `process-hunter`, and others — did not fire in the sample.

Each installed skill contributes to the skill-list system reminder, which is re-sent every turn. With 40+ skills that list is large, costs tokens, and dilutes trigger accuracy: a skill with a vague description can swallow triggers that belong to a better-matched one.

## Method

1. Enumerate `~/.claude/skills/*/SKILL.md`.
2. Run `python ~/.claude/skills/claude-code-audit/scripts/inventory.py` to list sessions from the last 30 days.
3. For each session, scrape `Skill` tool invocations (the `skill` field of the `tool_use`) and `skill_invocations` from the extracted JSON if present.
4. For each installed skill, compute: `invocations_in_window`, `projects_invoked_in`, `days_since_last_invocation`.
5. Classify:
   - **Active** — invoked at least twice across at least two sessions.
   - **Rare** — invoked once, or only invoked in one session.
   - **Dead** — zero invocations in the 30-day window.
6. Cross-reference Dead skills against their descriptions. If the description is overbroad (e.g. trigger terms that overlap with Active skills), the skill is a candidate for both disable and for future rewrite.

## Output

A report with four sections:

1. **Archive now** — Dead skills with specific, narrow descriptions that simply haven't applied. Low risk; move to `~/.claude/skills-archived/`.
2. **Disable trigger, keep content** — Dead skills whose content might still be useful as a manually-invoked reference, but whose triggers are stealing matches. Suggest renaming the SKILL.md frontmatter to remove autoload description or add a narrow prefix like "(manual)".
3. **Rewrite description** — Dead skills that *should* be firing on user phrasing but aren't; they need their description fixed.
4. **Keep** — Active and Rare skills, unchanged.

## Do not

- Do not delete anything. Archiving is reversible; deletion is not.
- Do not assume a skill is dead just because it hasn't fired in 30 days if it's tied to an uncommon-but-critical workflow (e.g. `security-review`, `schedule`). Confirm with the user first.
