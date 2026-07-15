---
name: literate-guide
description: "Create a narrative guide to a codebase or feature in the style of Knuth's Literate Programming — code and prose interwoven as a single essay, ordered for human understanding rather than compiler needs. Use when the user asks to 'explain this codebase as a story', 'write a literate guide', 'create a narrative walkthrough', 'tell the story of this code', 'Knuth-style documentation', 'weave a guide for this feature', or when they want deep, readable documentation that treats the program as literature. Also trigger when someone wants a document that a thoughtful reader could follow from start to finish and come away understanding both WHAT the code does and WHY every design choice was made."
---

# Literate Guide

Create a guide that tells the story of a codebase or feature the way Knuth intended programs to be read: as literature. The output is a single narrative essay where code excerpts and prose are interwoven, ordered by the logic of human understanding rather than file layout or execution order.

## The Idea Behind This

Knuth's core observation was simple: programs are read far more often than they are written, yet we organize them for the compiler's convenience, not the reader's. A literate program reverses this — the author decides the order of presentation based on what a human needs to understand first, and the code appears *within* that narrative exactly where it becomes relevant.

For an existing codebase, this means:

- **Don't follow the file tree.** Follow the conceptual thread. Start where understanding starts, not where `main()` lives.
- **Each section introduces one idea**, shows the code that embodies it, and explains the reasoning behind the design. Sections are numbered with the section sign: `§1`, `§2`, `§3`... (that's the `§` character, U+00A7 — not the letter "S"). Sections cross-reference each other using this same notation.
- **The prose does the heavy lifting.** Code excerpts are windows into the implementation, not the primary content. A reader should be able to follow the narrative even if they skip over the code blocks.
- **Design decisions are first-class content.** "We use X instead of Y because..." is the heartbeat of a literate guide. Alternatives considered, tradeoffs accepted, constraints that shaped the design — these are what make the document valuable long after the code has changed.

## Workflow

### Step 1: Understand the Scope

Ask the user what they want the guide to cover:

```
question: "What should this literate guide cover?"
header: "Scope"
options:
  - label: "Entire codebase"
    description: "The full story of this project, end to end"
  - label: "A specific feature or subsystem"
    description: "Deep narrative on one part of the codebase"
  - label: "A recent change or PR"
    description: "The story of a specific set of changes and why they were made"
```

If they choose a feature or subsystem, clarify which one. If the codebase is large (50+ files), strongly recommend scoping to a subsystem — a good literate guide goes deep, and breadth dilutes that.

Also ask about audience:

```
question: "Who will read this?"
header: "Audience"
options:
  - label: "A developer joining the team"
    description: "Assumes general programming knowledge, no project-specific context"
  - label: "A senior engineer reviewing the architecture"
    description: "Assumes deep technical knowledge, wants to understand design rationale"
  - label: "Future me"
    description: "Personal documentation for a system I'll forget the details of"
  - label: "Open source contributors"
    description: "External developers who want to understand the project well enough to contribute"
```

### Step 2: Deep Reading

Read the codebase thoroughly. This isn't a skim — you're looking for the *story*. Investigate in this order:

1. **The problem** — What does this software exist to solve? Check README, docs, comments, commit messages, issue trackers.
2. **The domain model** — What are the core abstractions? What do they represent in the real world?
3. **The architecture** — How do the pieces fit together? What are the boundaries?
4. **The flows** — Trace 2-3 primary operations end to end. These become narrative throughlines.
5. **The design decisions** — Where are the interesting tradeoffs? Look for:
   - Comments that explain "why" (not "what")
   - Places where simpler approaches were avoided — there's usually a reason
   - Abstractions that seem overbuilt — they often encode hard-won lessons
   - Configuration and feature flags — they reveal the axes of variation the authors anticipated
6. **The history** — `git log` for major refactors, pivots, or rewrites. These are plot points in the story.

### Step 3: Find the Narrative Thread

Before writing, identify:

- **The opening** — What idea or problem should the reader encounter first? This is rarely the entry point of the code. It's the *motivation*: the problem that makes the rest of the code necessary.
- **The arc** — What's the natural progression of understanding? Usually: problem → domain → core abstraction → how it works → how edge cases are handled → how it connects to the rest of the system.
- **The key decisions** — 3-5 design choices that define the system's character. These are the moments in the narrative where you pause the code walkthrough and say "here's why."
- **The sections** — Break the narrative into numbered sections using the `§` symbol: `§1`, `§2`, etc. (not "S1" or "Section 1" — the section sign `§` is a deliberate stylistic choice from Knuth's TeX tradition). Each section should have a name that describes the *idea*, not the file. "§4. Why events, not callbacks" is better than "§4. The EventEmitter class."

### Step 4: Write the Guide

Follow the template in [references/guide-template.md](references/guide-template.md). Key principles:

**Voice and tone:**
- Write in a warm, direct, first-person-plural voice ("we," "our"). The guide is a conversation between the author and the reader, not a specification.
- Be specific and concrete. "This handles edge cases" is empty. "This catches the case where a user submits a form twice before the first request completes" is useful.
- Embrace the author's perspective. Knuth didn't pretend to be objective — he explained what *he* was thinking and why. Do the same. "I chose X over Y because..." or "The team decided to..." with real reasons.

**Code excerpts:**
- Show only the code relevant to the point being made. Trim aggressively. If a function is 40 lines but the interesting part is 8 lines, show the 8 lines with a note about what the rest does.
- Always include the file path and line range above the code block so the reader can find it.
- Annotate the code. Don't just show it and move on — point out the significant details. "Notice that `retries` is passed as a parameter, not read from config. This makes testing deterministic (§12)."
- Use cross-references (`§N`) when code in one section relates to concepts explained in another.

**Section structure:**
- Open with prose that explains the idea and its motivation
- Show the relevant code
- Explain the design reasoning — alternatives considered, constraints, tradeoffs
- Close with a transition that connects to the next section. Every section ending should bridge to what comes next — this is what makes the guide read as a continuous narrative rather than a series of isolated entries. Examples: "With this normalization in place, we can now trust that the reducer (§7) receives clean input." or "This raises a question: how does the system handle the case where...? That's the subject of §9."

**Cross-references:**
- Use the `§` symbol for all cross-references: "as we saw in §3", "this connects to the retry logic in §12", "the transport layer (§8) hides this complexity". The `§` symbol is load-bearing — it's the visual cue that tells the reader "this refers to another section in this document."
- Cross-references are what make the document a *web* rather than a linear sequence. Use them generously — a good literate guide has at least 2-3 cross-references per section, weaving backward to reinforce earlier ideas and forward to foreshadow upcoming ones.

**Diagrams:**
- Include Mermaid diagrams where they aid understanding — typically one system-level overview near the beginning, and sequence diagrams for complex flows
- Diagrams supplement the prose; they don't replace it

### Step 5: Review the Draft

Before delivering, read the guide as if you've never seen the codebase:

1. **Does it tell a story?** Can you follow the narrative from §1 to the end without getting lost? If any section feels like a non sequitur, it needs a better transition or should be reordered.
2. **Is every code excerpt earning its place?** If a code block could be removed without losing understanding, remove it. Each excerpt should illustrate a specific point made in the surrounding prose.
3. **Are the design decisions explicit?** The guide should answer "why" at least as often as "how." If you find yourself describing mechanics without motivation, pause and add the reasoning.
4. **Are the cross-references correct?** Every `§N` reference should point to the right section. A broken cross-reference in a literate guide is like a broken hyperlink — it undermines the web of understanding.
5. **Would Knuth approve?** This is tongue-in-cheek, but useful: Knuth's literate programs read like essays by a thoughtful author explaining their craft. If the guide reads like generated documentation, revise until it sounds like a person talking to another person about something they care about.

### Step 6: Deliver

Write the guide as a single Markdown file. Suggested locations:
- `.claude/docs/literate-guide.md` for the full codebase
- `.claude/docs/literate-guide-{feature}.md` for a feature-specific guide

Tell the user what you've written and where it is. Mention the section count and the major themes covered so they know what to expect.
