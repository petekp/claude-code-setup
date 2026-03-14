# Chunk Manifest

Use a chunk manifest when the explanatory artifact is large enough that you need a control plane, or when multiple agents may help build the same explainer. It turns the artifact into a set of named teaching units instead of a vague pile of notes and panels.

## Table of Contents

1. What a chunk is
2. Required fields
3. Good chunk sizes
4. Example chunk
5. Review questions

## 1. What A Chunk Is

A chunk is the smallest teaching unit that should survive on its own. It usually maps to one concept, one visual panel, or one walkthrough step.

A good chunk answers:
- one reader question
- with one main claim
- backed by clear authority
- plus one small experiment that proves the claim

If a chunk needs multiple unrelated claims to justify its existence, split it.

## 2. Required Fields

Every chunk should record:
- **Question**: what the reader is trying to understand
- **Claim**: the sentence the reader should come away believing
- **Because**: the mechanism, invariant, or dependency that makes the claim true
- **Authority**: exact source files, tests, traces, or logs
- **Show**: the code excerpt, panel, timeline, or state snapshot to render
- **Try it**: one experiment the reader can run
- **Misread to prevent**: the likely wrong conclusion to head off

These are the same fields the scaffold writes into `chunk-manifest.md`.

## 3. Good Chunk Sizes

Aim for chunks that can be understood in one short sitting:
- 1 concept
- 1 visual
- 1 experiment
- 1 or 2 source anchors

Common chunk types:
- Orientation
- Happy path step
- State owner
- Guard or invariant
- Error branch
- External boundary
- Render cause
- Transform stage

## 4. Example Chunk

```md
## Chunk: Guarded Transition

Question:
- Why does the wizard refuse to advance when the draft is incomplete?

Claim:
- The transition is blocked by validation in the state owner, not by the button component.

Because:
- The reducer rejects the transition unless the draft passes `isCompleteDraft`.

Authority:
- File: src/features/wizard/reducer.ts
- Test: src/features/wizard/reducer.test.ts
- Trace: draft-invalid transition replay

Show:
- Reducer branch, failed transition event, current state inspector

Try it:
- Toggle the final required field off and re-run the transition.

Misread to prevent:
- "The button is disabled, so the UI must be enforcing the rule."
```

## 5. Review Questions

Before shipping an artifact, review the manifest and ask:
- Does each chunk have a real authority, not just a guess?
- Does each chunk teach one idea instead of three?
- Does each chunk have a probe the reader can actually run?
- Do the chunks, in order, build a correct mental model?
- Are there any chunks that exist only because the code layout was convenient?
