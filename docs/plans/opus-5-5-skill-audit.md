# Opus 5.5 skill audit

Date: 2026-09-22. This audit covers the nine personal skills used most in the
last 60 days. It checks them against three Anthropic guides:

- [Prompting Claude Opus 5.5](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-opus-5-5)
- [Prompting Claude Opus 5](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-opus-5).
  The 5.5 guide says these patterns still apply.
- [Prompting best practices](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices)

Status: applied on 2026-09-22, including the optional rename in item 3.

## Result

Most of the skill text already fits Opus 5.5. None of the nine uses
capital-letter emphasis. None tells Claude to think carefully or to write its
reasoning into the reply. Four skills conflict with the guides in small ways.

- **Closing self-checks.** `refine-prose`, `pr-screenshot-comparison`, and
  `write-as-pete` end with a check that repeats rules stated earlier. The
  Opus 5 guide says the model checks its own work without being told.
  Explicit verification instructions cause over-verification. The guide says
  to remove them rather than rewrite them.
- **Descriptions written to fight undertriggering.** `catch-up` and
  `refine-prose` say "Trigger even if..." or "Use whenever...". The
  best-practices guide says newer models overtrigger on this kind of language.
  It recommends plain "Use when..." wording instead.
- **A rule the skill breaks itself.** `catch-up` bans em dashes but uses five.
  The best-practices guide says a prompt's writing style carries into the
  output. Two of nine `catch-up` outputs found in local transcripts contained
  em dashes, 11 in total.

## Proposed changes

1. `catch-up`
   - Replace the description with the text below. It drops the "Trigger even
     if..." sentence and the audience sentence, which the body already
     covers. The description loads into every session. 32 of 34 uses were
     typed as `/catch-up`, so the extra trigger text is not needed.

     > Give the human a fast, plain-English catch-up on what changed in the
     > project: what the agents did, why, and what decisions need their
     > input. Use when the user asks to "catch me up", "what changed",
     > "where are we", "recap", "brief me", "give me the rundown", "what did
     > you do", "summarize the session", or "fill me in", or otherwise wants
     > to get back up to speed after being away.

   - Replace the five em dashes on lines 72, 83, 101, 123, and 160 with
     periods, colons, or commas.
   - In the Voice section, delete the example list "delve", "robust",
     "leverage", "seamless". `refine-prose/references/patterns.md` records
     that these words have faded from current models. None of the nine
     outputs used them. Keep "It's worth noting that...", which that file
     still lists as current.
   - In the jargon table on line 142, change "quietly fixes itself" to "fixes
     itself". `refine-prose` lists "quietly" as a mannered tell, and the
     examples in a skill steer its output.

2. `refine-prose`
   - Change "Use whenever drafting... any prose" to "Use when drafting...
     prose". Change "Trigger even when the request is only" to "Also use for
     requests like". The scope and trigger phrases stay the same. The gain is
     small because the skill is two days old and shows no overtriggering yet.
   - Delete the "Check before delivering" section. Each of its seven bullets
     repeats Passes 1 to 5 or `overcorrection.md`, which the skill already
     tells Claude to read before finishing. Change "Draft writes new text,
     then runs the check" to "Draft writes new text, then applies the
     passes". Delete the Delivering bullet "Run the check on your own draft
     before showing it."
   - Note: step 6 of `docs/plans/refine-prose-skill.md` designed this check on
     purpose. Removing it reverses that decision.

3. `pr-screenshot-comparison`
   - Delete the "Final check" section. Each of its eight bullets repeats a
     rule already in the body. Move its one concrete command into "Rules": a
     `git diff <base>...HEAD` that shows no image asset or capture code.
   - Optional: rename "Non-negotiable rules" to "Rules". The guide recommends
     dialing back forceful wording. The rules themselves do not change.
   - Note: this file has uncommitted edits. The changes would go on top of
     them without touching them.

4. `write-as-pete`, in `~/Code/personality`
   - In "Check and deliver", delete "Read once for meaning and once for
     voice." Keep the list of things to remove that follows it. That list is
     editing guidance, not a re-check.
   - Delete the closing paragraph of `VOICE.md`, which begins "Before
     delivering, check that the draft says what Pete means".

## No change

- `plain`: short, literal, and says what to do.
- `spike`: its scope limits match the Opus 5 guide's advice to constrain
  scope explicitly.
- `pr-description`: its word target matches the Opus 5 verbosity advice. Its
  re-read of the saved PR body checks what GitHub stored, not Claude's own
  reasoning, so the over-verification advice does not apply.
- `start-paddock-dev`: its "do not" rules protect the shared backend. The 5.5
  guide says to keep confirmation steps for risky actions.
- `adversarial-change-review`: the Opus 5 guide warns that "only report
  high-severity issues" makes a reviewer report less. This skill filters by
  evidence, not severity. It keeps a Low tier and sends unproven risks to a
  follow-up list, so real findings still get reported.

## Out of scope

- `scripts/skill-manager.sh usage` prints a header and exits. Its last-used
  search expects `"skill":"x"`, but 1,941 of 1,945 log lines use
  `"skill": "x"`, and `set -euo pipefail` ends the script on the failed
  search.
- The crop-and-enlarge screenshot rule in `~/.claude/CLAUDE.md`. The 5.5
  guide says the model reads screenshots more accurately and suggests
  re-testing workarounds like this one.
