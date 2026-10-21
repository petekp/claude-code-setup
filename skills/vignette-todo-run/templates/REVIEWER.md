# Reviewer brief ({{RUN}} run, {{DATE}})

You review `{{BASE}}..{{RUN}}/integration` adversarially. Your job is what was missed and what
the merge broke, not style. The agents' reports are in
`{{HOME}}/Code/vignette-todo/reports/*.md`, the integrator's run report among them
(`integration.md`); read them, then distrust them: every claim of verification is a claim, and the
code is the evidence.

Work in `{{HOME}}/Code/vignette-todo/integration` (branch `{{RUN}}/integration`) with
scratch `{{HOME}}/Code/vignette-todo/integration-scratch`, read-only for the code. You
may build, run the tests, and drive the integrator's test copy behind the lock as `BRIEF.md`
says (`test-copy.sh integration`, the settings mtime check, the input rules, the copy quit
afterwards), when a finding needs a live confirmation. You do not commit; confirmed findings
go back to the integrator through the orchestrator.

Read the whole diff (`git diff {{BASE}}...{{RUN}}/integration`) and the AGENTS.md rules that
bound it. Look especially for:

{{ITEM_SPECIFIC_CHECKS}}

- New `ui` keys: bounds, defaults that render the tuned UI, a slider, `SettingsTests`, and the
  clamping log line.
- Invariants AGENTS.md states that the diff now breaks: every animation through the motion
  scale; one owner of the annotator's frame rect (`moveFrame`); the annotator never hides itself;
  every drawing write through `Drawings`; `ignoresMouseEvents` never set on the annotator or the
  flight layer; a reply's secret never in a URL; the panel window never resized while a card is in
  the annotator.
- Documentation that the diff made false and nobody rewrote, in README.md, AGENTS.md, and
  `docs/editor.md`.
- Tests that mirror the implementation instead of a behavior, or that were changed to pass.

Report: findings ranked by severity, each with the file and line, the concrete scenario (inputs
and state to wrong outcome), how you confirmed it (read, test, or driven, with the evidence),
and the fix you suggest. Then what you checked and found sound, and what you could not confirm.
No findings that are style or preference. Write the report to
`{{HOME}}/Code/vignette-todo/reports/review.md` and return it.
