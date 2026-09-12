# Writing author notes

A useful note saves the reviewer a lookup or clarifies an effect outside the changed lines. Investigate these questions when they apply:

| Change | Useful context |
| --- | --- |
| Condition, default, or fallback | What input exposes the old/new difference? |
| Shared helper, component, or type | Which callers or modes change, and which retain their behavior? |
| Moved or deleted code | Where does the responsibility now live? |
| State, cache, or asynchronous work | Who owns the value, and what happens after reload or a late result? |
| Stored data or API | How do producers, consumers, and older inputs fit together? |
| Domain terminology | What product distinction might a teammate misunderstand? |
| Validation or limitation | What case was checked, or what uncertainty affects the review? |

Keep distinct useful explanations even when they concern the same feature. Explain a shared mechanism once, then describe separate effects on callers where needed. Skip formatting, obvious renames, duplicate answers, and comments that only repeat the diff. A PR-body overview does not replace useful inline context.

Use one or two short sentences, allowing another when a condition matters. Start with the fact, then its consequence. Prefer neutral, pronoun-light wording. Use `we` only for a documented shared decision and `I` only for a personal choice Pete explicitly stated. Do not announce that an agent wrote the note.

Use concrete product words and exact identifiers only when they help. Avoid defensive wording, hype, metaphors, decorative punctuation, and promises about future effort. Lowercase starts are acceptable when they match existing same-repo comments; preserve names and code casing.

Examples of useful detail, not text to copy:

- “Clearing the preset now stores `null`. Leaving it absent would select the default again after reload.”
- “The table and board now save through this hook. Each view still validates its own fields.”

Read the proposed notes together to remove repeated openings and duplicate points. If no useful context is missing, say so and post nothing. Replies to teammate questions stay private unless separately authorized.
