---
name: circuit-resource-analysis
description: Analyze a provided resource through a Circuit lens. Use when the user provides or points to an article, pasted conversation, X thread, workflow example, GitHub repo, local codebase, product page, paper, or other outside reference and asks what Circuit can learn from it, whether it suggests a possible Circuit flow, whether Circuit can support the workflow today, what product or block changes would be needed, or whether the analysis should be added to Circuit's ideas or flow backlog.
---

# Circuit Resource Analysis

## Overview

Analyze the resource for useful Circuit product learning. Focus on relation,
contrast, feasibility, product impact, and whether the idea is worth saving.

## Start With Source Truth

Use the strongest available source before giving conclusions.

- If the resource is pasted, analyze the pasted content.
- If the resource is a link, open or search for the source. Cite links used.
- If the resource is a local repo or codebase, inspect files directly.
- If the resource is a GitHub repo, inspect its README, examples, docs, and
  code paths that prove the relevant behavior.
- If the resource describes current Circuit behavior, verify against the local
  Circuit repo before claiming it is possible or impossible.

For Circuit repo work, read `docs/release/v1-launch-plan.md` first. Use
`UBIQUITOUS_LANGUAGE.md` for product vocabulary. For flow feasibility, prefer
current code and contracts over memory.

Useful Circuit anchors:

- `docs/release/v1-launch-plan.md`
- `UBIQUITOUS_LANGUAGE.md`
- `docs/flows/authoring-model.md`
- `docs/flows/block-catalog.json`
- `src/flows/catalog.ts`
- `src/flows/types.ts`
- `docs/architecture/run-process.md`
- `docs/ideas/README.md`
- `docs/ideas/catalog.json`

## Classify The Resource

Name what kind of input it is before analyzing it:

- Codebase, repo, library, or tool
- Article, essay, paper, announcement, post, or conversation
- Workflow example
- Product pattern or competitor pattern
- Other

Then choose the matching analysis path below. If more than one applies, combine
them.

## Analyze Codebases And Articles

Answer these questions:

1. What is the core idea?
2. How does it relate to Circuit?
3. How does it contrast with Circuit?
4. What could Circuit learn from it?
5. What could Circuit adapt or adopt?
6. What would be a bad fit for Circuit, and why?

Prefer concrete product implications over a generic summary of the source.
Separate facts from interpretation.

## Analyze Workflow Examples

For workflows, be blunt about feasibility:

1. Is the workflow interesting as a Circuit flow?
2. Can Circuit support it today?
3. If yes, sketch the flow shape.
4. If yes, say how Circuit could go beyond the described workflow.
5. If no, name the missing parts.
6. Say whether those missing parts are worth considering.
7. Explain how they would change the flow, block, route, check, trace, or
   report ecosystem.

For workflows that post to Slack, Linear, GitHub, email, or other tools, do not
stop at "MCP exists." Identify the real boundary:

- Is the tool available to the host agent?
- Can a Circuit step intentionally receive that tool?
- How is auth handled?
- Is a human approval needed?
- What evidence proves the action happened?
- Does the action belong in a flow body, a route, a check, a report, or a
  gateway around the run?

Distinguish:

- **Works today**: the current repo supports it with existing contracts.
- **Works with configuration**: no engine change, but setup is required.
- **Needs a new block or route**: flow authoring changes are needed.
- **Needs engine work**: runtime or contract changes are needed.
- **Not a good fit**: it fights Circuit's product shape.

## Decide Whether To Save It

End with a clear recommendation:

- **Save it** when it suggests a strong post-v1 flow, block, product surface,
  evidence pattern, or positioning insight.
- **Do not save it** when the idea is too generic, already covered, weakly tied
  to Circuit, or mostly implementation detail.
- **Maybe save it** when the idea is promising but needs one more proof point.

If saving is recommended, give:

- A short idea title
- The likely home: `docs/ideas/`, flow backlog, block ecosystem note, release
  positioning note, or "needs more research"
- A priority: high, medium, or low
- The reason in one or two sentences

Do not create or edit idea docs unless the user asks to record it.

## Response Shape

Keep the answer plain and short unless the user asks for depth.

Use this shape by default:

1. **Bottom line**: one direct answer.
2. **What the resource is saying**: short summary.
3. **Circuit fit**: relation and contrast.
4. **Can Circuit do it today?**: yes, no, or partly, with the main blocker.
5. **What Circuit could learn**: specific lessons.
6. **Worth saving?**: yes, no, or maybe.

Avoid abstract product language when a concrete example would be clearer.
