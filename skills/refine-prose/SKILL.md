---
name: refine-prose
description: >-
  Refine prose so it says what the writer means to a specific reader: cut the
  text that should not exist, put the point first, state things literally,
  remove the patterns that mark machine writing, and match the voice. Use
  when drafting, revising, tightening, editing, proofreading, or reviewing
  prose: essays, posts, emails, PR descriptions, docs, plans, reports,
  comments, commit messages, UI strings. Also use for requests like "clean
  this up", "make it read better", "tighten this", "does this sound like
  AI", "de-slop", or "humanize". Not for code.
---

# Refine prose

Work from the reader's side. Ask what this reader needs in order to
understand or decide, then remove everything that does not serve that.

Most weak prose fails above the word level. It says things the reader did not
need, in an order that hides the point, in phrasing chosen to sound like
writing rather than to say something. Fix those in that order. Word-level
tells come last and matter least.

One move covers most fixes: describe what is present, in literal words, with
the person who did it named.

## Before editing

Settle three things from the request or the text itself:

- **The reader and what they will do with the text.** A busy engineer
  deciding whether to merge reads differently from a friend receiving a
  reply.
- **Whose voice it is in.** Pete's own message or post: read
  `~/.claude/skills/write-as-pete/VOICE.md` and apply it after the passes
  below. Interface strings: read `~/.claude/skills/clean-copy/SKILL.md` for
  what survives on a screen and how to report a batch. Anything else: the
  default register under Voice.
- **The mode.** Rewrite returns revised text. Review reports findings and
  changes nothing. Draft writes new text, then applies the passes to it.

Ask only when the answer would change the edit materially. Otherwise choose
the reading a careful editor would choose and say so in one line.

## Pass 1: Cut what should not exist

Walk each section, paragraph, and sentence down these questions. Delete at
the first one that fires. Do not polish text that should be gone.

1. **Would the reader have wondered this?** Text that answers a question
   nobody had plants the question. A caption saying the preview is rendered
   at the exact profile size makes the reader wonder whether it might not be.
2. **Does something nearby already say it?** A caption under a clear label. A
   summary after a short argument. A recap paragraph. A topic sentence that
   restates the heading. A closing line that repeats the opening.
3. **Does it rule out a failure instead of describing a behavior?** "This may
   look slow but it is not." "Unlike the old cancel, this keeps your files."
   A list of what the change will not do. That is the writer's memory of a
   bug or a debate. The reader was not there and now has a worry they
   arrived without.
4. **Does it announce the text instead of being it?** "In this section we
   will", "Here's the thing", "Let me walk through", "The rest of this post",
   "It's worth noting that", "In short". Delete the announcement and let the
   content stand.
5. **Does it exist to sound like writing?** A quotable line. A punchline
   closing a paragraph. A question answered in the next sentence. A metaphor
   where a literal phrase was available. Replace it with the literal
   statement, or delete it if the statement is already there.

When a cut leaves a stub, remove the container too: the empty hint prop, the
one-line section, the transition into nothing.

Text stays when the reader cannot act without it: a consequence they need
before choosing, a scope or compatibility fact they cannot see, what a blank
state means and what to do next, a unit on a bare number, a condition on a
claim, the connective that shows why one sentence follows another.

A concrete example, a specific observation, and the writer's own judgment
also stay. They are what make prose read as a person's. Keep the judgment as
a claim about this case ("we chose Postgres because we already run it"), not
as a lesson or a moral ("boring wins"). When a draft has none of these, do
not invent one, and do not hand back the summary as if it were the piece.
Say the draft needs an example or a judgment from the writer and mark where
it belongs.

## Pass 2: Put it in the reader's order

- Lead with the conclusion, the decision, the verdict, or the thing that
  happened. Reasons follow. The reader can stop when they have enough.
- One move per paragraph. A paragraph that does two things gets split. A
  paragraph that does nothing the previous one did not gets merged or cut.
- Keep the connectives the reasoning needs: because, so, but, unless, which
  means. Cutting them to sound crisp leaves the reader to rebuild the
  argument.
- Structure follows the content. Lists for parallel items or steps. Headers
  only when a reader will jump between sections. Bold for the one thing a
  scanning reader must not miss. A table for a comparison. Prose for
  reasoning.
- Length follows the thought. Keep text short by leaving out what would not
  change what the reader does next, not by compressing what remains into
  fragments, abbreviations, or arrow chains. A reply can be one line. An
  argument needs its paragraphs. Do not pad a short answer to look
  considered.
- When summarizing a source, reword it in your own indirect speech and mark
  the few exact phrases you keep as quotations.

## Pass 3: Make each sentence state something

- **One idea per sentence.** About twenty words is a working ceiling for
  dense material. A reader holding a lot should not also hold a subordinate
  clause. Split at the clause instead of joining clauses with a semicolon or
  a colon.
- **A named subject doing a concrete verb.** Passive voice is fine when the
  actor is unknown or beside the point. It is a problem when it hides who
  decided. An abstraction doing a human thing hides the person the same way:
  the data does not tell, the decision does not emerge, the bottleneck does
  not move. Someone read, decided, or changed something. Name them, or use
  "you" or "we".
- **Literal over figurative.** Mannered prose substitutes metaphor and
  flourish for direct statement: "a dial worth turning" for "a parameter
  worth varying", "earns its keep" for "still matters", "load-bearing" for
  "necessary". The phrase displays the writer and costs the reader, and the
  metaphor drags in connotations nobody chose. When a literal phrase is
  available, use it. Keep a figure only when it explains something the
  literal phrase cannot, and use it once. A figure repeated through a
  section as its connective tissue has stopped explaining.
- **The domain's own names.** No hyphen-stacked compounds, no coined nouns,
  no label invented earlier in the text and reused as if the reader knew it.
  If a new term is needed, define it once.
- **Describe what is present.** "It's not X, it's Y", "not just X but Y",
  "less like X and more like Y", "rather than merely X", and a list of what
  something is not all assert by ruling out a claim the reader never made.
  State Y. Keep the contrast only when the reader actually holds X.
- **Specific over categorical.** "The reasons are structural" names nothing.
  Say the reason. "Every", "always", "never", and "nobody" claim more than
  the writer knows. Use the real scope.
- **Preserve distinctions and certainty.** Current state versus history. Raw
  input versus validated data. What was tried versus what is inferred. Keep
  a hedge attached to the claim that is uncertain and remove hedges from
  claims that are not. Do not flatten a strong judgment into a balanced one,
  and do not promote a guess to a fact.
- **No sincerity or emphasis modifiers.** "Genuinely", "honestly", "frankly",
  "truly", "actually", "honest take", "to be clear", "full stop". They assert
  weight instead of carrying it. Delete them and let the sentence stand.
- **Keep the technical term** when it names the thing precisely. Explain it
  once if the reader may not know it. Do not swap it for a vaguer word to
  sound plain.

## Pass 4: Remove the patterns that mark machine writing

Read [references/patterns.md](references/patterns.md). It lists the
constructions current models overproduce, grouped by level, each with why
it reads as machine-made, the fix, and how current the evidence is. Apply it
with judgment. A pattern is a signal, not a violation: a list of three that
really has three items stays, and an adverb that changes the meaning stays.

Before finishing, read
[references/overcorrection.md](references/overcorrection.md). Editing
against these patterns produces its own tells: clipped fragments, missing
connectives, uniform paragraph length, and a flat register that sounds like
nobody.

## Pass 5: Voice

Plain is not the same as generic. A specific noun, a real number, and a
stated opinion keep plain prose from sounding like nobody.

**Default register** for agent deliverables: docs, plans, reports, reviews,
PR descriptions, comments, commit messages, replies to Pete.

- Short sentences, one idea each, conclusion first. Pete reads this way.
- Simple, precise words. Name what a thing is or does in its domain, and
  use one name per concept throughout.
- No em dashes, parentheticals, or arrows. Each em dash becomes the
  punctuation it stood in for: a period, a comma, or a colon.
- Numbers, paths, and identifiers go in a table, a code span, or a line of
  their own, not inside a sentence.
- Headers only above about five hundred words, and at most three.

**Pete's own voice.** Run the passes above first, then apply the voice guide.
Preserve the strength of his reaction, his qualifications where they sit,
and the length the thought needs. Do not add slang, a coined term, a joke, or
a punchy ending to sound like him.

**A piece the user will publish under their name.** Their voice, not the
default register. Keep their stance, their examples, and their asides, and
change only what fails a pass above. Where the draft has none of these, mark
where one belongs: a bracketed placeholder is better than an invented scene
or a generic summary.

**Someone else's draft.** Keep the choices that carry their meaning or
personality, including an aside or an exclamation. Change only what fails a
pass above, and say what you changed.

**Interface strings.** The survival rules in `clean-copy` govern what stays
on screen. Read each string next to the label, value, and button around it.

## Delivering

- **Rewrite.** Lead with the revised text in copyable form. After it, and
  not before, list the substantive cuts (content removed, not phrasing) and
  any ambiguity you resolved by assumption. Do not narrate phrasing changes.
- **Review.** Report each finding as location, current text, the rewrite or
  `cut`, and the reason in a few words. Do not report or rewrite text that
  passes.

Never add facts, claims, examples, or feelings the source did not contain.
A missing fact gets a visible placeholder. Refining a draft does not
authorize sending or posting it.

[references/examples.md](references/examples.md) has before-and-after
passages with the pass that fired on each change.
[references/SOURCES.md](references/SOURCES.md) records the research behind
the pattern list and why items from earlier lists were dropped. Read it when
maintaining the skill, not when using it.
