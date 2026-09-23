# Architecture sweep brief ({{DATE}})

Pete's words: "do a thorough review, particularly an architectural sweep, to ensure everything
we've been adding over the past couple days is not accreting a bunch of cruft and drift that
could jeopardize the quality of the codebase."

The codebase is `{{HOME}}/Code/vignette-todo/integration` on branch
`{{RUN}}/integration`, read-only for you. The baseline is {{SWEEP_BASELINE}}; the commits since are the runs' work
({{RUN_DOCS}}). Read `docs/foundation-review-2026-09-15.md` first: it says what the
architecture was meant to be, and the previous sweep, if there is one, says where it was drifting. Then read `AGENTS.md` as the current
statement of the design, then the code. You may build and run the tests; do not drive the app
and do not commit.

The question is not "is each change correct" (a separate reviewer did that per run) but "is the
whole still one design". Look for:

- **Ownership drift.** Each concern is meant to have one owner: the transition reducer for what
  is in the annotator and in flight; `Zoom.split` for the level's two halves; `moveFrame` for
  the annotator's frame rect; `model.focused` for which card a key acts on; `StackLayout` for
  every stack geometry; `UITweaks` for tuned numbers; `Settings.motionUI` for every duration.
  Find a second place that now decides one of these, or a number that bypasses the tweaks or
  the motion scale, or a controller doing what the reducer should.
- **Accretion in the two large controllers.** `ThumbnailController.swift` and
  `AnnotationController.swift` take most of every run's code. Say what in each is a
  separable concern with a clear seam (the queue, the strip, the width scale, the stand-in, the
  hand-over, the overlay throttle, zoom input), which of those is worth extracting, and which
  is fine where it is. Do not recommend extraction for its own sake; name the failure a seam
  prevents.
- **Duplication and near-duplicates.** Two helpers that compute the same rect or fraction, two
  springs with the same purpose, two logging idioms for the same event, the same guard written
  in three commands. `grep` for the shapes.
- **Dead code and stale scaffolding.** Symbols nothing references (the compiler will not tell
  you for internal Swift; grep does), settings keys nothing reads, state-report keys nothing
  documents, feature flags that only ever take one value, comments describing behaviour that
  has moved, docs under `docs/` that contradict the code or each other (the dated docs
  accumulate: are the zoom docs, the stack docs, and AGENTS.md telling one story?).
- **The bridge.** Every `PageAPI` case and `WebMessage` case: still used on both sides? Is the
  page's canvas queue the same rule AGENTS.md states? Is `App.tsx` still one component with a
  readable shape, or a bag of handlers?
- **Tests.** Which tests pin the implementation rather than a behaviour; which parts of the
  design have no test at all (the reducer is well covered; the layout and zoom geometry are
  covered; what is not?); a test file that grew into a second copy of the code.
- **AGENTS.md itself.** It is the onboarding. Has it grown into a changelog? Which bullets
  restate the code rather than the reason, which are stale, which belong in a dated doc, and
  what would a shorter version keep?

Report, written to `{{HOME}}/Code/vignette-todo/reports/architecture.md` and
returned as your final message:

1. A verdict in three sentences: is the design intact, where is it drifting, what is the one
   thing to do first.
2. Findings ranked by how much they threaten the codebase's quality, each with the file and
   line, the evidence (the two places, the unreferenced symbol, the contradicting lines), and
   the fix, sized (a one-line delete, an hour's extraction, a design decision for Pete).
   Separate them into three lists: safe cleanups an integrator can do tonight without changing
   behaviour (dead code, stale comments and doc lines, duplicate helpers with one caller each);
   refactors that change structure and need Pete's yes; and design questions.
3. What you checked and found sound, so Pete knows what was covered.

No style findings. Every claim has a file and a line.
