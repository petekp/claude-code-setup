# Plan: `refine-prose` skill

Date: 2026-09-21. Status: implemented. Blind comparison against `stop-slop` on four passages: `refine-prose` won three; the loss (a terse update that kept a moral closer) led to two skill fixes.

## Goal

One skill for refining any prose an agent or Pete produces: essays, posts,
emails, PR descriptions, docs, comments, UI strings. It replaces the three-step
habit of running `clean-copy`, then `stop-slop`, then `write-as-pete`, and it
updates the AI-pattern catalog from 2025-2026 evidence instead of 2023-2024
lists.

## Why a new skill rather than editing one of the three

- `clean-copy` decides whether copy should exist. Its ladder applies to any
  sentence or paragraph, not only interface strings, but its reporting format
  and examples are UI-specific. Keep it for UI batches; generalize the ladder
  here.
- `stop-slop` is a third-party install (Hardik Pandya, 2026-01). Its catalog
  was built on 2024-era models. Several rules are blanket bans (all adverbs,
  all em dashes, all triplets, all Wh- openers) that produce overcorrected,
  stilted prose. It cannot be edited in place without forking.
- `write-as-pete` is a voice guide with private exemplars in
  `~/Code/personality`. This setup repo is public, so voice material stays
  there and the new skill points at it when the text is Pete's.

## Shape

```
skills/refine-prose/
├── SKILL.md              workflow: cut, structure, sentence, word, voice, check
└── references/
    ├── patterns.md       AI-writing patterns by level, with 2026 status
    ├── overcorrection.md what anti-AI editing gets wrong
    ├── examples.md       before/after passages
    └── SOURCES.md        research basis, dates, and why items were kept or dropped
```

## Order of operations in the skill

1. Existence: does this sentence, paragraph, or section need to exist for
   this reader? (from `clean-copy`)
2. Structure: conclusion first, one move per paragraph, connectives where the
   reasoning needs them, no scaffolding that announces the structure.
3. Sentences: one idea each, a concrete subject doing a concrete verb,
   literal statement over metaphor, distinctions and uncertainty preserved.
4. Words: the current pattern catalog, applied with judgment, not as a
   blocklist.
5. Voice: plain and precise by default (Pete's global rules); Pete's own voice
   via `write-as-pete` when the text is his; UI strings via `clean-copy`.
6. Check: a short verification pass and a reporting format for review mode.

## Research inputs

Three parallel research passes on 2025-2026 sources: academic and measurement
literature, vendor and practitioner guidance, and the tells of the newest
models specifically. Findings, statuses, and the rules dropped from
`stop-slop` are recorded in `skills/refine-prose/references/SOURCES.md`.
The main results: the 2024 vocabulary tells have faded and now appear in
human text too; negated contrast, the rule of three, density, uniform
sentence length, and invented labels persist or rose; mannered metaphor is
the defining 2026 Claude tell and Anthropic documents it; anti-AI editing
has its own tells that vendors now counter-steer.

## Verification

- `./scripts/validate.sh` and `./setup.sh --verify` in this repo.
- `./scripts/gen-skills-manifest.sh` to register the skill.
- A blind comparison on three test passages: with `refine-prose`, with
  `stop-slop` alone, judged by an agent that does not know which is which.

## Open decisions for Pete

- `stop-slop` removed on 2026-09-21 at Pete's request: repo link, Codex
  link, `~/.agents/skills` copy, and lockfile key. `clean-copy` now points
  at `refine-prose` for the phrasing pass.
- Whether `clean-copy` stays as a separate skill for UI batches.
