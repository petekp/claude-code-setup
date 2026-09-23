---
name: clean-copy
description: Cut interface copy that should not exist. Captions that restate a label, hints that pre-empt a worry the user never had, warnings that are scar tissue from a fixed bug. Use when writing or reviewing any user-facing string (labels, hints, empty states, toasts, confirmations, button text), or when asked to clean up or tighten copy.
---

# Clean copy

Most bad copy is not badly written. It is copy that should not be on the screen. Editing it for tone only makes the wrong thing read better. So the first question is never "how should this be phrased". It is: should this exist?

## The ladder

Walk each string down these rungs in order. Stop at the first one that fires and delete.

**1. Does this need to surface at all?**
Would the user ever have wondered about this, unprompted? If not, you are not answering a question. You are planting one. Nobody opens an avatar cropper wondering whether the circle is a true circle. A caption reading "the preview is rendered at the exact size used on your profile" makes them wonder whether it might not be.

**2. Does the label need to exist?**
A caption earns its place only when the value is meaningless without it. If the label, the field, or the value beside it already says the thing, the caption is noise. A field labelled "Retry limit" does not need "how many times we retry" beneath it. A bare "30" does need "seconds" beside it. That one stays.

**3. Is it pre-empting something the user never had to consider?**
The tell: copy that rules out a failure rather than describing a behaviour.

> Cancel upload
> *Always keeps the files already transferred. Never wipes the folder like the old cancel did.*

That second sentence exists because of a bug. The user does not know about the bug, does not share your memory of fixing it, and now has a worry they arrived without. The fix for a fixed bug is the fix. Not a caption about the fix. The same goes for copy defending a design decision, or hedging about something that simply works: "this may look slow but it is not", "don't worry if the count seems off for a moment".

**4. Rewrite to remove the offending part. If nothing is left, delete the element.**
Do not preserve a hint because there was a hint there. An empty `hint` prop comes off the component. An explanatory `<p>` gets deleted, not shortened to a stub.

## What survives

Copy stays when the user genuinely cannot act without it:

- A real consequence at the moment of choosing. Under a destructive button: *"Anything not yet synced is lost."* They need it before they click, and they cannot infer it.
- A compatibility or scope fact they cannot see. *"Works with keys issued after March; older keys need rotating first."* The checkbox alone does not tell them whether it applies to them.
- What a blank state means and what to do next. *"No projects yet. Create one and it will appear here."*
- Units, scale, or format on a bare value.

The first example is one sentence. Had it continued *"only use this when a sync is stuck"*, that half would go. It instructs the user on when they are allowed to press a button they can already see. Keep the consequence, cut the permission slip.

## Working style

- Run this pass before any phrasing or voice pass, such as refine-prose or write-as-pete. Polishing a string that should be cut only makes the wrong thing read better.
- Read the string next to what is actually on screen around it: the label, the value, the button. Redundancy is invisible when you read the string alone.
- Cut whole clauses, not words. Tightening "Leave this blank to use the default setting for your account" into "Leave blank for the default" is a smaller win than noticing which half of a two-sentence hint is doing no work.
- When reviewing a batch, report as `file:line` with the current string and either the rewrite or `cut`, and say in a few words which rung it failed. Do not rewrite copy that passes.
- If a string is load-bearing but only in a rare state, consider whether it belongs in that state rather than permanently on the page.
