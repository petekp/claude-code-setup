Since PR #31 merged — TL;DR
One batch of work landed: a research-then-cleanup pass on making the codebase easier for AI coding agents to work in. The surprising headline is that *more* agent docs often make agents worse, so the changes mostly tighten and guard what's already there rather than add. It sits on its own branch (not yet merged to main), and one thing needs your call before it ships.

What changed
- A cited research report was added on what actually helps AI agents read and modify a codebase. The big finding: for a docs-heavy project like this one, piling on more guidance files for agents tends to lower their success rate and raise cost by 20%+. The culprit isn't documentation itself — it's redundancy (re-stating what the code, linters, and tests already enforce) and agents dutifully over-chasing every stated rule. The fix lever is cutting redundancy, not cutting docs.
- The audit then made four concrete changes off that finding:
  1. Fixed a quiet gap where the project's agent rules weren't actually loading in Claude Code sessions. There are two AI tools in play (Claude Code and Codex) that each look for a differently-named rules file. The project keeps one real rules file (AGENTS.md); the other file is now just a one-line pointer to it, so both tools read the same rules with no second copy to drift out of sync.
  2. Added hard guardrails so agents can't hand-edit the auto-generated files (the ones the build regenerates from source). Previously this was only enforced by a "regenerate and check for differences" test after the fact; now the editing is blocked up front. Regenerating them the proper way still works.
  3. Trimmed a stale internal map document. It had an outdated snapshot of the file tree and a long migration table; both are now short summaries, with the full version still recoverable from git history.
  4. Deliberately chose *not* to add "DO NOT EDIT" banners inside the generated files, because the safety nets that exist (strict schemas, mirror checks, plus the new edit-block in #2) make those banners unsafe rather than helpful.
- All checks pass (full test suite green).

Why
- This came out of an audit aimed at making the project more legible to the agents that work on it. Rather than guess, the work started from real research, which pushed back on the obvious "add more docs" instinct and redirected effort toward removing redundancy and adding enforcement that actually binds.

Your call
- Ship it: This is one commit sitting on a branch called `agent-legibility-improvements`, one ahead of main, with no open PR yet. It's pushed but not merged. Decide whether to open a PR / merge it, or sit on it. Default state: parked on the branch, nothing forcing it forward.
- Nothing else needs you. The four changes are self-contained and the research report is reference material, not a commitment.
