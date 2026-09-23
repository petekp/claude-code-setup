# Patterns that mark machine writing

Current as of September 2026. Built from vendor prompting guides, measured
corpus studies, and editors' field guides from 2025 and 2026. The evidence
behind each status is in [SOURCES.md](SOURCES.md).

How to use this list:

- A pattern is a signal, not a violation. One instance proves nothing. A
  cluster of them in one passage is what reads as machine-made, and the
  cluster is what a reader notices.
- When a pattern fires, do not swap in a synonym. Ask what the sentence is
  trying to say and say that. Most fixes below reduce to one move: describe
  what is present, in literal words, with the person who did it named.
- Status tells you where to spend attention. **Current** means documented
  in 2025 or 2026 output from frontier models. **Fading** means measured as
  declining; scan for it, do not hunt. **Prompt-induced** means it appears
  when a model has been told to be punchy or plain, so check for it after
  your own edits as well as in the source.

## Document level

| Pattern | Looks like | Why it reads as machine-made | Fix | Status |
|---|---|---|---|---|
| Scaffolding | "In this section", "Let me walk through", "Here's the thing", "It's worth noting", "Importantly", "Let's unpack this" | Announces content instead of delivering it. Every word should add something the reader did not have. | Delete the announcement. Start with the content. | Current. OpenAI blocklists "it's worth noting" and "importantly" for GPT-6. |
| Summary closers and padding sections | "In short", "Bottom line", "In conclusion", a recap paragraph, a "Challenges and future prospects" section, boilerplate sections in a document | Repeats what the reader just read. Documents from current models run long because of these, not because of the substance. | End where the thought ends. Match document length to what the task needs. | Current. Anthropic's Opus 5 guide names "filler sections, redundant summaries, or boilerplate". |
| Chat residue | "Great question", "You're absolutely right", "Hope this helps", "Happy to adjust", "Want me to…", "If you like, I could…", "Done." as a whole reply | Belongs to a conversation, not to the text. Offers and validation stand in for content. | Delete. State what was done and what the reader should do next, if anything. | Mixed. Flattery openers are fading. "You're absolutely right" and trailing offers are current, and the offers change wording each release. |
| Narrated self-correction | "I made two errors above, and I owe you an explanation" for a slip that changes nothing | Puts the writer's process in front of the reader's need. | Correct silently unless the error changes the reader's decision. Then state it in one sentence. | Current in Opus 5, per Anthropic. |
| Formatting by rule | Bold on phrases nobody needs to find, headers over three paragraphs, bullets that are fragments, inline-header lists ("**Speed:** we…"), emoji headings, horizontal rules, a table with one row | Structure applied because structure looks organized, not because the reader will scan or compare. | Structure follows the reader's task. Lists for parallel items or steps. Headers when the reader will jump. Bold for one thing that must not be missed. | Current in GPT-6 and in long documents from any model. Claude chat now under-formats, which is the opposite failure: a multi-part answer crammed into one paragraph. |
| Length by compression | Fragments, abbreviations, arrow chains ("A -> B -> fails"), hyphen-stacked labels, dropped connectives, all to hit a word count | Short is not the same as readable. Compression moves the work to the reader. | Keep output short by leaving out details that do not change what the reader will do. Write the rest in full sentences. | Prompt-induced. Anthropic's Fable 5 guide and OpenAI's GPT-5.4 system prompt both counter-steer it. |
| Unmarked quotation | A summary that reproduces the source's sentences as if they were the writer's | The reader cannot tell what is the source and what is the summary. | Reword in your own indirect speech. Mark the few exact phrases you keep. | Current in Fable 5.1, per Anthropic. |

## Paragraph level

| Pattern | Looks like | Why it reads as machine-made | Fix | Status |
|---|---|---|---|---|
| Negated contrast | "It's not X, it's Y", "not just X but Y", "not because X but because Y", "X, not Y", "less like X and more like Y", "rather than merely X", "not simply X", "The question isn't X. It's Y.", "Not a X. Not a Y. A Z.", "X while preserving Y", "X without sacrificing Y", a list of what the change will not do | Asserts by ruling out a claim the reader never made. The reversal supplies drama the content does not have. The form mutates faster than any phrase list. | Describe what is present. State Y. Keep the contrast only when the reader actually holds X. | Current and rising in every model family. The most cited 2026 tell. OpenAI blocklists "This isn't about X. It's about Y." |
| Rule of three | Three examples where one would do, three adjectives, a three-beat closer ("Fast. Simple. Effective."), or the newer four- and five-item lists that replaced it | The count comes from rhythm, not from the material. | Use the real number of items. | Current, measured at about twice the expert rate. Opus 5 defaults to three examples; GPT-5.1 and later shifted toward lists of four or five. |
| Question answered at once | "The result? A faster build.", "Why? Cost.", "And the honest part?", "So what changed?" | A staged setup for a reveal the reader did not ask for. | State it. | Current. OpenAI blocklists "Question? Answer." |
| Punchline ending | A paragraph that ends on a quotable line, a one-line closer ("That is the real win."), a sentence built so the verb lands last, "Full stop." | The line exists to be quoted, not to inform. | End on the last fact. | Current in Opus 5. |
| Announced reveal | "Here's the kicker", "the part nobody talks about", "what most people miss", "Plot twist:" | Claims exclusivity for an ordinary point. | Cut. | Current in marketing-style output. |
| Hedge and reassure | "To be fair", "the truth lies somewhere in between", "I want to be careful here", "arguably", "to some extent", a caveat that does not change the claim | Balance performed as a manner, not as a finding. Models use fewer real hedges than people and about twice as many performed ones. | Hedge the uncertain claim, once, where it sits. Commit where the evidence supports it. A confident right answer beats a hedged right answer. | Current. Claude Opus 4.8 and 5 are caveat-heavy; GPT-6 still uses "may" three times as often as GPT-4.1. |
| One metaphor as connective tissue | An apt figure ("seam", "engine", "map") repeated through a section to link its parts | The figure stops explaining and starts standing in for the explanation. | Use the literal terms. A figure appears at most once, where it explains something the literal phrase cannot. | Current in Opus 5. |
| Uniform rhythm | Sentences of the same length, paragraphs of the same shape, every ending the same weight, no asides | Human sentence length varies far more. Humans interrupt themselves and use exclamation marks; models almost never do. | Let length follow the thought. Keep a real aside. Do not manufacture variety either. | Current across all families, by measurement. |

## Sentence level

**Mannered metaphor.** The defining 2026 tell in Claude output, documented
by Anthropic and measured as rising since Opus 4.7. Mannered prose
substitutes metaphor and flourish for direct statement. The phrase displays
the writer and costs the reader, and the metaphor carries connotations
nobody chose. When a literal phrase is available, use it.

| Mannered | Literal |
|---|---|
| load-bearing | necessary; what the design depends on |
| earns its keep | is worth keeping; still matters |
| a dial worth turning | a parameter worth varying |
| quietly (does X) | (does X) |
| the tell | the sign; the evidence |
| surface (verb) | show; report; raise |
| signal (noun) | evidence; indication |
| seam | boundary; join; the place where two parts meet |
| the shape of the problem | what the problem is |
| does a lot of work; carries the argument | matters; supports the argument |
| worth stating plainly | (state it) |
| the trap | the mistake; the risk |
| latent | present but not yet visible |
| scar tissue | a fix left over from a past bug |
| the real X is Y | (say Y) |
| X lives in; holds; lands; moves; rides along | X is in; contains; arrives; changes; comes with |
| matters because | because |

**Invented labels.** Hyphenated compounds ("exact-head checks"), coined
nouns ("evidence boundary", "tripwire", "supervision paradox"), and a label
made up earlier in the text and reused as if the reader knew it. Name the
thing in the domain's own words. If a new term is needed, define it once.
Current: Anthropic, OpenAI, and readers on Hacker News all name it.

**Abstract subject, hidden person.** "The data tells us", "the decision
emerged", "the culture shifted", "the bottleneck moved", a sentence whose
subject is an abstraction and whose verb arrives last. Someone read, decided,
changed, or found. Name them, or use "you" or "we". Current; readers describe
it as the sentence shape that makes Claude prose tiring.

**Sincerity and emphasis modifiers.** "Genuinely", "honestly", "frankly",
"truly", "really", "actually", "honest take", "to be direct", "let me be
clear", "Full stop", "Let that sink in". They assert sincerity or weight
instead of showing it, and Anthropic's own system prompt says they "come off
as disingenuous". Delete them. The sentence should carry its own weight.
Current in Claude; on OpenAI's GPT-6 blocklist too.

**Vague qualifier, categorical claim.** "Significant", "robust", "nuanced",
"the reasons are structural", "the implications are considerable", and the
absolutes "every", "always", "never", "nobody". Name the specific thing and
the real scope. Current.

**Copula avoidance, participial tails, nominalization.** "Serves as",
"boasts", "stands as a testament", "-ing" tails ("highlighting the
importance of", "showcasing", "emphasizing", "fostering"), "the
implementation of" for "implementing", Latinate words where short ones
exist. Use "is", "has", and plain verbs. The 2024 nouns are fading; the
participial tail is the residual GPT-5 habit, measured at five times the
human rate of present-participle clauses.

**Canned attribution.** "Experts argue", "widely regarded as", "is
associated with", "in connection with", "plays a pivotal role". Vague
authority in place of a source, and significance asserted instead of shown.
Name the source or drop the claim. Current in 2025 and later models, per
Wikipedia's sign list.

**Dense syntax.** Multi-clause sentences, colons and semicolons doing the
work of conjunctions ("X exists in theory; in practice, Y"), "and" chaining
clauses, few paragraph breaks. Split at the clause. One idea per sentence. A
paragraph break at each move. Current in Opus 4.8, Opus 5, Fable 5 and 5.1,
per Anthropic and per measurement.

**Em dashes.** Still frequent in Claude Opus 4.8, Opus 5, and Fable 5, at
roughly double a high human rate. Fading in GPT-5.6 and later and in Gemini
3.1. The problem is the dash as a universal connector. Pete's register uses
none: replace each with the period, comma, or colon it stood in for.

## Word level

Scan, do not hunt. These words defined 2023 and 2024 detection lists and
have fallen by 41 to 86 percent across model generations. "Delve" appeared
in about one chat in a thousand by mid-2025. They still appear, and
"leverage", "foster", and "delve" remain on OpenAI's GPT-6 blocklist.

delve, tapestry, landscape, navigate, unpack, leverage, foster, robust,
seamless, vibrant, testament, meticulous, underscore, pivotal, crucial,
nuanced, elevate, resonate, realm, "in today's fast-paced world",
"Additionally" as a sentence opener.

Gemini 3.1 adds intensifier stacking ("absolutely essential", "incredibly")
and dropped contractions. Fix both by using the ordinary word and the
contraction a person would use.

These words are also now common in human writing, since people picked
them up from the models. Their presence proves nothing in either direction.
Word-list hunting is a poor use of attention. Wikipedia's own sign list
warns against treating the signs as the problem. Replace a word only when
the ordinary word says the same thing better.
