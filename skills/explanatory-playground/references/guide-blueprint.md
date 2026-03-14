# Guide Blueprint

Use this blueprint when turning a subsystem or request path into an explanatory artifact. Keep the artifact paired: a narrative spine for human understanding and an interactive surface for verification.

## Table of Contents

1. Delivery model
2. Recommended section sequence
3. Chunk template
4. Shared panel primitives
5. Exit criteria

## 1. Delivery Model

Unless the repo already has a better convention, a solid default is:

```text
docs/explanatory/<topic>/
  guide.md
  source-index.md
  chunk-manifest.md
  reader-lab.md
app/__dev/<topic>/page.tsx
src/devtools/<topic>/
  artifact.ts
  trace.ts
```

Use only the pieces that earn their keep:
- `guide.md` or an in-app narrative rail for the literate explanation
- `source-index.md` for exact file anchors, tests, and entrypoints
- `chunk-manifest.md` as the control plane for named teaching units
- `reader-lab.md` for the experiments that prove the explanation
- `page.tsx` or a standalone route for the explorable UI
- `src/devtools/<topic>/artifact.ts` for the shared explainer model in hybrid builds
- `src/devtools/<topic>/trace.ts` for normalized runtime evidence in hybrid builds

## 2. Recommended Section Sequence

| Section | Question it answers | Useful artifact elements | Evidence to include |
|---------|---------------------|--------------------------|---------------------|
| Orientation | Why does this subsystem exist? | One-paragraph overview, key actors, glossary chips | Owning files, entrypoints, top-level tests |
| System map | What are the major parts and boundaries? | Node-link diagram, boundary table, ownership notes | Module links, contracts, external dependencies |
| Happy path | What normally happens, in order? | Timeline/stepper, state snapshot, curated code excerpts | Trace steps, source anchors, relevant tests |
| State and invariants | What changes, and what must stay true? | State table, diff viewer, invariant callouts | Store/reducer/schema files, assertions, type contracts |
| Branches and failure modes | What happens on retries, errors, or alternate paths? | Scenario selector, replay controls, side-by-side comparisons | Error paths, retry logic, fallback code, logs |
| Reader lab | How can the reader verify their understanding? | Preset scenarios, toggles, editable inputs | Repro inputs, fixtures, expected outputs |
| Source index | What should the reader open next in the real code? | Ranked file list, “read next” notes | Exact files, symbols, tests, docs |

For a smaller subsystem, compress the sequence to four sections:
- Orientation
- Happy path
- State and invariants
- Source index

## 3. Chunk Template

Use this template for each major concept, panel, or walkthrough step:

```md
## <Chunk title>

Question:
- What is the reader trying to understand here?

Why it matters:
- Why this concept is necessary for the system to work

Authority:
- File(s), symbol(s), tests, or traces that justify the explanation

Show:
- The visualization, code excerpt, or state snapshot to place beside the prose

Try this:
- A tiny experiment the reader can run to confirm the behavior

Misread to prevent:
- The easy wrong conclusion a newcomer might draw
```

If the chunk has no clear question, authority, or experiment, it usually does not belong in the artifact.

## 4. Shared Panel Primitives

These UI pieces work across most explanatory artifacts:

- **Narrative rail**: Short prose alongside the visualization, not below it
- **Source anchors**: Buttons or links to the exact owning files and tests
- **Scenario selector**: Happy path, edge case, failure path, or alternate branch
- **Timeline/history panel**: Ordered steps with timestamps or causal order
- **Before/after inspector**: Diffs for state, props, payloads, or outputs
- **Glossary**: Stable nouns and their meanings in this codebase
- **Evidence badges**: Mark whether a claim comes from source, runtime trace, test, or inference

Avoid dashboards with many undifferentiated charts. Every panel should answer a sentence-length question.

## 5. Exit Criteria

The artifact is ready when a fresh reader can:
- summarize the subsystem's purpose in one or two sentences
- name the key actors and source-of-truth files
- describe the normal execution path
- point to the main state transitions or transformations
- identify at least one important invariant
- reproduce or explain one interesting edge case
- choose the next file to read when making a change
