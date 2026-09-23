# Before and after

Each example names the pass that fired. The rewrites keep every fact,
condition, and judgment in the original; only the words that performed
instead of stated are gone.

## 1. Mannered metaphor in an engineering note

Before:

> The cache invalidation path is the load-bearing piece here, and it quietly
> does a lot of work: every write has to surface through it before readers
> see fresh state, which is the real reason the latency budget earns its
> keep.

After:

> Every write goes through cache invalidation before readers see fresh
> state. That is why the latency budget matters.

Pass 3, literal over figurative. "Load-bearing", "quietly", "does a lot of
work", "surface", "the real reason", and "earns its keep" were each replaced
by the thing they stood for, and most of them stood for nothing.

## 2. Negated contrast and a triplet in a product post

Before:

> This isn't about speed. It's about trust. Fast, reliable, and predictable,
> the new sync engine changes what teams can expect from a shared workspace.

After:

> The new sync engine finishes a save within a second and has not lost an
> edit in three months of internal use. Teams can rely on it.

Pass 3, describe what is present. The original ruled out a claim nobody
made, then listed three adjectives in place of the two facts that support
them. Where the facts are not supplied, use a placeholder rather than an
adjective.

## 3. Over-compressed update

Before:

> Auth migration done. Two days. Zero downtime. Users happy. Boring wins.

After:

> We finished the auth migration in two days with no downtime, and no user
> has reported a problem since.

Overcorrection: the fragments dropped the connectives and turned an outcome
into a slogan. "Users happy" was a claim beyond the evidence, so the rewrite
states what was observed. "Boring wins" was a punchline, so it is gone.

## 4. Scaffolding and chat residue in a PR description

Before:

> ## Summary
>
> Let me walk through the changes. First, I've extracted the retry logic
> into a shared helper. This is important because it was duplicated in three
> places. Second, I updated the tests accordingly. Happy to make any changes!

After:

> Extracts the retry logic that was duplicated in three call sites into one
> helper. Tests for each call site now cover the shared helper.

Pass 1, announcement and residue. "Let me walk through", "First", "Second",
"This is important because", and the closing offer were removed. "Updated
the tests accordingly" said nothing, so it now says what the tests cover.

## 5. A caption that pre-empts a worry

Before, under a Cancel upload button:

> Always keeps the files already transferred. Never wipes the folder like
> the old cancel did.

After:

> (cut)

Pass 1, rules out a failure. The caption records a fixed bug. The reader did
not know about the bug and now has a worry they arrived without. The button
label already says what the button does.

## 6. Hedge and reassure around a recommendation

Before:

> It's worth noting that, to be fair, both approaches have merit, and the
> truth probably lies somewhere in between. That said, I'd genuinely lean
> toward the queue-based design here.

After:

> Use the queue-based design. The cron approach drops events that arrive
> during a deploy; the queue holds them.

Pass 3, preserve certainty. The writer had a reason and a recommendation.
The hedges were manner, not uncertainty, so the rewrite commits. If the
writer were actually unsure, the rewrite would say what is unknown and keep
the recommendation conditional.

## 7. Dense syntax in a design summary

Before:

> Because the scheduler owns both admission and eviction, and because those
> two decisions share a budget that neither can see the other consuming,
> starvation under load is not a bug in either half but an emergent property
> of the split; the fix, accordingly, is a single accounting point.

After:

> The scheduler makes two decisions, admission and eviction. They share one
> budget, but neither can see what the other has spent. Under load that
> causes starvation. The fix is one accounting point that both consult.

Pass 3, one idea per sentence, and Pass 2, paragraph breaks. The content is
unchanged. "Not a bug in either half but an emergent property" was a negated
contrast, and "accordingly" was a connective the sentence order already
supplied.
