# Sources and decisions

Written 2026-09-21. Read this when maintaining the skill. Drafting does not
need it.

## Why the skill exists

It replaces the habit of running `clean-copy`, then `stop-slop`, then
`write-as-pete` on the same text, and it rebuilds the AI-pattern list from
2025 and 2026 evidence. The lists most skills copy were written against
GPT-4-era output. The tells have since moved from vocabulary to structure,
and the newest Claude models have a failure of their own, mannered prose,
that those lists do not name.

## What changed between 2024 and 2026

- **Vocabulary faded.** "Delve" fell to about one chat in a thousand by
  mid-2025 (Washington Post, 328,744 GPT-4o messages, Nov 2025). The
  combined frequency of nine hallmark features fell 41 to 86 percent from
  the earliest to the latest model in each family (Graphite, Sept 2026). The
  same words rose in human writing through adoption (Pew, Aug 2026, 490,000
  pages: AI-vocabulary use doubled 2023 to 2026), so they no longer separate
  machine text from human text.
- **Structure persisted and intensified.** Negated contrast rose from 0.87 to
  2.36 per 10,000 words in web text (Pew) and runs at three times the human
  rate in model output (Pangram). Graphite measured "not simply" at 157
  times the human rate in GPT-6 and "less like a X and more like" at 105
  times in Claude Opus 5. OpenAI blocklisted the form for GPT-6 in Sept
  2026. The rule of three runs at about twice the expert rate (Bakhshi
  2026) and mutated into four- and five-item lists in GPT-5.1 and later.
- **Density replaced filler as the main complaint.** Opus 5 averages 510
  words per response against 158 for Opus 4.5, with sentences 58 percent
  longer (Arena, Aug 2026). Anthropic's Fable 5.1 guide says "sentences run
  longer and there are fewer paragraph breaks". Sentence-length dispersion
  in model text is 4.8 to 5.8 against 16.4 for humans (Kendro 2026). The
  Economist's July 2026 study of 55,940 sentences found verbosity and light
  punctuation the clearest markers: fewer commas and semicolons, hardly any
  parentheses, "and" the most overused word.
- **Mannered prose is the new Claude tell.** Anthropic defined it in the
  Fable 5.1 guide with "a dial worth turning" and "earns its keep" as its
  own examples. Graphite scored Opus 5's mannered prose at about 2.5 times
  human and rising 19 percent since Opus 4. A clustering of 461,121 GitHub
  PR descriptions (Abraham, Aug 2026) found "load-bearing" 39 times more
  common inside the arriving cluster than outside; that cluster grew from
  0.7 to 39 percent of PRs between early 2025 and mid-2026. The register
  starts with Opus 4.7 (Claude Code issue 53454, April 2026).
- **Formatting flipped.** 2024 and 2025 prompts fought bullets and bold.
  Fable 5.1 formats less, and Anthropic now says anti-formatting rules
  "suppress structure the content needs". GPT-6 still over-formats.
- **Flattery openers were trained out; sincerity adverbs replaced them.**
  Anthropic's May 2025 system prompt banned "great question" openers; by
  Sept 2025 the rule was gone. The Feb 2026 prompt added a ban on
  "genuinely", "honestly", and "straightforward", and the Sept 2026 prompt
  explains they "come off as disingenuous". Arena measured "honestly" and
  "frankly" up 50 percent from Opus 4.5 to Opus 5.
- **Em dashes split by vendor.** GPT-5.4 at 1.43 per thousand words, Claude
  Opus 4.6 at 9.09, humans at 3.23 (Freeburg 2026, twelve models). Opus 4.8,
  Opus 5, and Fable 5 measured at 17 to 19 per thousand; Fable 5.1 showed
  no excess (agent-ways, Sept 2026). Wikipedia proposed retiring the sign
  in Sept 2026. The skill keeps "no em dashes" as Pete's register rule, not
  as a detector.
- **Hedging is two-sided.** Model text has fewer real hedges and stance
  markers than human text (Jiang and Hyland 2025; Liu 2025: humans hedge
  about 40 percent more) and about twice the performed hesitancy markers
  (Bakhshi 2026). So the skill removes performed hedges and keeps the ones
  attached to uncertain claims.
- **Overcorrection is documented but unmeasured.** The staccato register
  appears in vendor counter-steering (Anthropic's Fable 5 guide: keep output
  short by selection, "not to compress the writing into fragments"; the
  GPT-5.4 system prompt: "Do not use incomplete sentences") and in
  practitioner posts, with no corpus study yet.
- **Vendors now name their own slop.** OpenAI's GPT-6 guidance lists banned
  phrases and constructions. Anthropic's docs carry the mannered-prose
  paragraph. Both prefer defined anti-patterns and positive examples over
  prohibition lists, and both report that strong negative rules written for
  older models make newer models over-react.

## What was taken from each source skill, and what was dropped

**clean-copy.** The existence ladder and the survival rules, generalized
from interface strings to any sentence or paragraph. The reporting format
for batches stays in `clean-copy`, which the skill points to. Not copied:
its own figurative phrases ("scar tissue", "the tell", "planting one",
"permission slip"), which are the kind of mannered phrasing the skill
removes.

**stop-slop** (Hardik Pandya, Jan 2025, restructured Jan 2026; the local
copy carries a "no mannered prose" rule Pete added on 2026-09-02). Kept:
throat-clearing, vague declaratives, false agency, negative listing, binary
contrasts, rhetorical setups, the mannered-prose rule, and the quick checks,
merged into the passes and the final check. Dropped, with reasons:

| Rule | Why dropped |
|---|---|
| Kill all adverbs | Model text already has fewer stance markers than human text. Meaning-bearing adverbs (only, still, already) stay. |
| No passive voice, no Wh- openers, no "So" openers | No vendor guide or corpus study names them as machine markers. Passive is right when the actor is unknown or beside the point. |
| Two items beat three | Sometimes there are three. The rule of three is a tell when the count comes from rhythm. |
| No em dashes at all | Now a weak signal outside Claude. Kept only as Pete's register rule. |
| Scoring out of 50 | A self-assigned score changes no sentence. |
| Compression examples ("Move faster. Your competition is.") | They produce the fragments Anthropic tells Fable 5 not to produce. A maintained fork of stop-slop added an anti-slogan rule for this reason. |
| Narrator-from-a-distance, "put the reader in the room" | Useful for essays, wrong for documentation and reports. Folded into "a named subject doing a concrete verb". |

**write-as-pete.** Not duplicated. The skill routes to `VOICE.md` when the
text is Pete's, and carries the general principles that guide's evidence
supports: preserve the strength of the supplied reaction, keep a hedge where
it sits, end where the thought ends, and do not add slang, coined terms, or
punchlines to sound like him.

**Pete's global rules.** The default register (short sentences, one idea
each, conclusion first, no em dashes, parentheticals, or arrows, numbers out
of prose) comes from his shared agent rules and reply guidance.

## Primary sources

Read directly for this revision: the Anthropic prompting guides for Fable
5.1, Opus 5, and Opus 4.8 (platform.claude.com, Sept 2026); Graphite, "AI
Tells" (graphite.io/five-percent/research/ai-tells, Sept 2026; spot-checked
for the mannered-prose, negated-contrast, em-dash, variance, and hedging
figures); Louis Abraham, "load-bearing" (github.com/louisabraham/load-bearing,
Aug 2026; spot-checked, and note the clustering is unsupervised and does not
attribute authorship).

Read by the three research passes, whose reports are summarized above:
Anthropic's Fable 5 guide, prompting best practices, and the published
claude.ai system prompts from May 2025 to Sept 2026; OpenAI's GPT-5 through
GPT-6 prompting guides and the Model Spec of 2026-08-18; Google's Gemini 3
guide; Wikipedia, "Signs of AI writing" (WikiProject AI Cleanup, current to
Sept 2026, with its talk archives); the Economist, "How to spot AI writing"
(30 July 2026, via Daring Fireball and Dataconomy); Washington Post (Nov
2025, via mirror); Pew Research (Aug 2026); Holzwarth and Kobak (Aug 2026);
Reinhart et al. (PNAS 2025) and Reinhart's literature notebook; Jiang and
Hyland (2025); Liu (2025); Freeburg (2026); Kendro (2026); Bakhshi (2026);
Zhang et al. (Nature Human Behaviour 2026); Juzek and Ward (2024, 2025);
Arena via AlphaSignal and paddo.dev (Aug and Sept 2026); Claude Code issue
53454; Zvi Mowshowitz on Opus 4.8 and Opus 5 (LessWrong, 2026); Every.to on
GPT-5.6 Sol (July 2026); Scott Alexander, "Nostalgebraist's Hydrogen
Jukeboxes" (May 2026); Gwern, "My 2025 LLM System Prompts"; Ethan Mollick
(May 2026); Simon Willison (Feb and Mar 2026); Matthew Vollmer's field guide
(Apr 2026); blader/humanizer; hardikpandya/stop-slop and its forks.

Not accessible during research: the Economist's per-model figures, the
Atlantic and NYT Magazine essays, Forbes's May 2026 list, OpenAI's release
notes, and several paywalled or rate-limited papers. Claims from those are
carried through secondary reports and marked as such above.

## Limits

- Much 2026 evidence about the newest models is vendor documentation or
  practitioner observation. Corpus studies lag model releases by months.
- Statuses drift. Each vendor's tells churn per release; only 45 percent of
  GPT-5.6's tells carried into GPT-6 (Graphite). Recheck the vendor guides
  and the Wikipedia sign list at each model generation.
- The blind comparison used to check this skill had four passages and one
  judge per pair. The skill won three against `stop-slop`; the loss was a
  terse update whose rewrite kept a moral closer, which the skill now
  addresses. It shows the skill works on those passages, not that it
  generalizes.

## Maintenance

When a new model's prompting guide names a writing behavior, add it to
`patterns.md` with the guide as the source and a status. When a pattern's
evidence is only pre-2025, move it to the word-level scan or drop it. Keep
the examples free of the passages used for testing, so tests stay blind.
