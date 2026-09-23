# Agent `zoom`: items 22 and 19

Worktree `{{HOME}}/Code/vignette-todo/zoom`, branch `{{RUN}}/zoom`, scratch
`{{HOME}}/Code/vignette-todo/zoom-scratch`. Read `BRIEF.md` first, then in your
worktree: the zoom bullets of `AGENTS.md`, `docs/zoom-2026-09-17.md` (the design and how it was
measured, including the 60 fps method), and the zoom parts of `docs/run-{{PREVIOUS_RUN}}.md`
(what was verified last time and what stayed open).

Your files: `Sources/Zoom.swift`, `Sources/AnnotationController.swift`, `Sources/StandIn.swift`
if the stand-in is involved, `Sources/Settings.swift` and `Sources/DebugPanel.swift` for the new
tweaks, `Tests/ZoomTests.swift`, `docs/zoom-2026-09-17.md` (a dated section), and the zoom
bullets in AGENTS.md and README.md. Another agent (`strip`) is editing the stack's strip and
the user-facing strings at the same time; do not touch `StackLayout.swift`, `StackView.swift`,
`ThumbnailController.swift`, `Config.swift`, `SettingsWindow.swift`, or `AppDelegate.swift`.

Do item 22 first, then 19: 22 says measure before changing anything, and 19 changes the anchor,
which is one of 22's suspects, so 19 first would confound the measurement.

## Item 22 (Pete's words)

> Zooming the annotator image looks like it arcs near the start. Pete, 2026-09-17 evening, on
> the merged build: "when zooming the annotator image, it seems to be doing the arc motion near
> the beginning of the transition. In this specific interaction we do not want any arc. If this
> isn't the arc, then there's some kind of unexpected jerkiness near the beginning we need to
> address." The flight arc (`FlightCurve`, `ui.flightArc`) is applied only to card flights in
> `TransitionLayer`; the zoom's frame comes from `Zoom.frame` under one spring, so the cause is
> somewhere else. Candidates: the anchor blend from the previous aim to the cursor on the first
> step (`ZoomAim`), the stand-in going up on the first input (a mismatch between the page and the
> stand-in for a frame), or the spring's start. Measure with the 60 fps method from
> docs/zoom-2026-09-17.md (per-frame position of the frame's edge and of a stroke inside the
> picture) before changing anything, then remove whatever moves sideways or steps.

Notes:

- Measure first, on the unchanged build: a cmd+wheel stream and a keyboard step (Cmd+plus) from
  rest, cursor away from the centre, recorded at 60 fps; per frame, the frame's left and top
  edges and the position of a mark inside the picture (a fixture with a thin dark line at a known
  place makes that easy). A sideways component near the start, a step between consecutive
  frames, or a frame where the picture's edge and the frame's edge disagree is what you are
  looking for. Put the numbers in the doc section.
- One candidate to check, not an answer: at scale 1 every anchor reproduces the fitted frame,
  so the "was" anchor `ZoomAim` reads off the frame at rest may be degenerate (whatever the
  code does when the growth is zero), and a blend from that anchor to the cursor's during the
  spring would move the frame sideways at the start. If that is it, the first step from rest
  should start at the cursor's anchor with no blend.
- Another: the stand-in goes up on the first input. If the stand-in's first frame differs from
  the page's last (rounding of the web view's size, the overlay's cap, the picture's rect), that
  is a one-frame step. The measurement will say.
- Pete's own trackpad is the acceptance; say in the report exactly what he should try (pinch,
  cmd+wheel, Cmd+plus, smart zoom, from the corner and from the middle) and what he should see.

## Item 19 (Pete's words)

> Zoom should keep the edge or corner under the cursor in view. Pete, 2026-09-17 evening, on
> the todo4 build: "even when putting my cursor near a corner and zooming, the corner of the
> image I'm hovering still gets pushed out of frame; I'd probably need my mouse to be within a
> few pixels of the corner to keep the corner from getting cropped. Can we somehow bias towards
> keeping the edges/corners anchored so it's harder for them to get cropped?" Today the anchor
> is the cursor's fraction of the window (`ZoomAim`, `ZoomPan` in `Sources/Zoom.swift`), so a
> cursor near a corner but not on it lets the corner slide out once the picture magnifies past
> the window. Bias the anchor toward the nearest edge or corner when the cursor is within a band
> of it, so the edge stays in view; the band and the pull are numbers a user would tune.

Notes:

- The band and the pull are `ui` tweaks with bounds and sliders, defaults tuned so a cursor in
  the outer part of the picture keeps that edge in view without the middle feeling sticky. Say
  in the doc how the pull shapes the anchor (a curve from the cursor's fraction to the edge's
  0 or 1 across the band) and why that shape.
- The bias belongs to the magnification phase (`ZoomPan`, when the picture magnifies past the
  window) and to the window phase only if the window can push the corner out (it cannot while
  the whole image is in the window; check). Keep `Zoom.split` the single mapping.
- A test in `ZoomTests` that says the behaviour: a cursor inside the band keeps that edge of the
  image visible after a step past the window, a cursor in the middle zooms about itself.
- Zoom's springs and the bow rule are unchanged: this is about where the anchor is, not how the
  frame moves.
