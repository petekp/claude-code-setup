# Literate Programming For Interactive Explainability

Borrow the discipline of literate programming without trying to recreate Knuth's tooling. The goal is not to "document everything." The goal is to arrange explanation, code, and interaction so the reader builds a correct mental model.

## Table of Contents

1. What to borrow
2. Rules for explanatory artifacts
3. Chunk writing pattern
4. Code excerpt rules
5. Anti-patterns

## 1. What To Borrow

Take these ideas seriously:

- **Human-first order**: Explain concepts in the order a reader can absorb them, not the order the implementation was written.
- **Prose has a job**: The text should explain why, intention, and consequence. Do not waste prose on line-by-line paraphrase.
- **Code is evidence**: Show code to support the explanation, not to flood the reader with implementation detail.
- **Named chunks**: Break the system into conceptual chunks with explicit relationships between them.
- **Cross-reference aggressively**: Move the reader through the system by linking concepts, files, and runtime behavior.

For this skill, "literate" means the explanation owns the flow and the live artifact lets the reader verify it.

## 2. Rules For Explanatory Artifacts

For each major claim:
- name the concept in plain language
- point to the exact source, test, or trace behind it
- show the smallest useful code excerpt
- place a probe, control, or visual nearby so the reader can verify the claim

For each section:
- start with the question the section answers
- establish the stable nouns before introducing motion
- reveal edge cases only after the happy path is clear
- keep the amount of code proportional to the concept

Prefer short, high-signal prose blocks. Most sections should read like guided notes from a careful staff engineer, not a generated tutorial.

## 3. Chunk Writing Pattern

Use this pattern for the narrative layer:

```md
### <Concept name>

Claim:
- What is true in this part of the system?

Because:
- What mechanism, invariant, or decision makes it true?

Evidence:
- Which file, symbol, test, or runtime step proves it?

Try it:
- What should the reader click, toggle, or replay to see it?

Takeaway:
- What mental model should stick after this chunk?
```

This keeps the prose from drifting into vague explanation.

## 4. Code Excerpt Rules

Use code excerpts like carefully chosen quotations:

- Prefer the smallest coherent chunk that carries the idea
- Introduce the chunk before showing it
- Annotate what to notice, not every token
- Link or point to the full file for deeper reading
- If understanding requires two or three files, show only the lines that demonstrate the relationship
- Avoid giant dumps that force the reader to reconstruct the point alone

Good excerpt prompts:
- "This is the handoff point where orchestration becomes persistence."
- "This guard is the invariant that prevents invalid transition X."
- "This reducer branch is where the UI's visible state actually changes."

Weak excerpt prompts:
- "Here is the whole file."
- "Read this and it should make sense."
- "This code probably does X."

## 5. Anti-Patterns

Avoid these common failures:

- **Repository-order tours**: walking file-by-file with no conceptual grouping
- **Diagram theater**: polished visuals with no source anchors or experiments
- **Explanation drift**: prose claims that outpace what the code or traces support
- **Snippet dumps**: large excerpts with little framing
- **No reader agency**: no toggles, replay, or side-by-side comparison to test understanding

A literate explanatory artifact should leave the reader with both a story and a way to prove the story.
