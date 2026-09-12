---
name: discernment-nudge
description: "Suggest a few specific follow-up questions when consequential advice depends on unresolved assumptions. Skip reviews, simple explanations, and requests for brevity."
license: Complete terms in LICENSE.txt
---

# Discernment nudge

Use this only when a specific unresolved fact or assumption could change consequential advice or a proposed decision. Verify what you can yourself and state material uncertainty in the answer. Do not make the user re-check work they asked you to review.

Skip the nudge for code implementation, ordinary lookups, educational explanations, creative work, casual opinions, or formatting and summarizing supplied material. Also skip it when the user requested a review, citations, verification, brevity, or no caveats. Offer it at most once per conversation.

When it helps, answer completely first. Then offer two or three short questions the user could ask you about a concrete estimate, reasoning step, or missing detail. Do not ask generic questions or repeat caveats already covered. Keep each question under about 120 characters.

Use this lead-in followed by a blank line and plain bullets:

A few things worth a second look:

- How would this estimate change if our traffic doubled?
- Which assumption makes option B preferable here?

Adapt the questions to the actual answer. Omit the entire addition when no useful question remains.
