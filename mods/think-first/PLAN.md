# think-first: plan

A Claude Code mod that helps Pete keep doing his own thinking about his
business and its users while agents do the work. It builds two habits:

- **Your take first.** Before Claude answers a question about the business
  or its users, you write your own answer. Claude then critiques your take
  before giving its own.
- **Predict, then find out where you were off.** On any prompt, you can add a
  line starting `expect:`. Claude doesn't see it. After the turn, a second
  model call checks your prediction against what happened and says where your
  thinking was off.

`/think` shows how often you gave your take first, and lists where your
predictions were off.

The background is Bret Victor's 2017 email "Is this the civilization we
really want": a tool that augments your thinking should leave you with a
better understanding of the domain.

## Why version 2 replaced version 1

Version 1 offered a prediction whenever a turn ran past 20 seconds, and you
rated it yourself. A review found five problems:

- **Wrong work.** Long turns are mostly coding, which is fine to delegate.
  Questions about the business are usually short turns, so they never
  triggered it.
- **Unreadable skip rate.** Pete runs many sessions in parallel, so most
  offers would expire unseen. An unseen offer was recorded the same way as a
  skipped one.
- **Self-rating.** Vague predictions got rated as hits, so the hit rate could
  rise with no change in understanding.
- **Misses went to waste.** A miss was one keypress, with nothing recorded
  about why.
- **Too frequent.** An identical prompt on most turns would stop being
  noticed within days.

## Behavior

### Your take first

1. **Which prompts.** An idle-session prompt you typed, at least 20
   characters long. A Haiku call sorts it as a thinking question or not.
   - A thinking question asks for judgment about the business or its users:
     what users need and why, how the business works or grows, strategy,
     priorities, product direction, or whether a product decision is right.
   - Everything else passes through: code, configuration, tooling, chores,
     and short replies.
   - The definition is the `CLASSIFY` text in `hooks/register.tsx`. Pete
     should edit it to match what he means.
2. **What happens.** The mod holds the prompt back and puts it back in the
   prompt box, with a `My take:` line at the end. A notice explains why.
   - Write your take and press Enter. Claude gets the question and your take,
     plus an instruction to say what holds up, what's wrong or missing, and
     what evidence would settle it, before giving its own answer.
   - Or press Enter with the line empty. The prompt goes as it was, and the
     mod records a skip.
3. **Backing off.** After a skip, the session asks for no take for 30
   minutes. When you're busy, it backs off.
4. **Failure.** If the Haiku call fails or takes over 3 seconds, the prompt
   goes through as it was.

**Why the prompt box instead of the band:** the band needs ctrl+x tab before
you can type. The prompt box is where you already are. Skipping costs one
Enter.

**Why Claude sees the take:** this habit is about having your own model
before you see Claude's, then having it attacked. Claude can only attack a
take it can see.

### Predictions

1. **Opt-in.** A line starting with `expect:` in any idle-session prompt. The
   mod removes the line before the prompt reaches Claude, so Claude can't
   steer toward it. While the turn runs, the band shows your prediction in
   one dim line.
2. **Checking.** When the turn ends, one Sonnet call reads your prompt, your
   prediction, and Claude's reply. It rates the prediction:
   - **hit:** the result matches its specific claim
   - **partly:** some of it matched
   - **miss:** the result contradicts it
   - **vague:** it is too general to check
   It also writes one sentence on where your thinking was off. For a hit,
   the sentence says what made it right. For a vague prediction, it says what
   a checkable one would have named.
3. **Result.** The band shows the rating and the sentence, with `d: Discuss`
   and `x: Dismiss`. Discuss fills the prompt box with your prediction and
   the check's verdict, asking Claude where your thinking was off.

**Why opt-in:** predictions you choose to make are deliberate. An automatic
offer on every long turn became noise and measured the wrong work.

**Why a model rates it:** your own rating rewarded vague predictions. The
`vague` rating makes vagueness visible instead of counting it as a hit.

### The `/think` pane

Last 6 weeks, all projects:

- **Your take first.** Thinking questions asked, and how many got your take
  first.
- **Predictions.** Counts of hit, partly, miss, and vague.
- **By week.** One row per week, showing takes given of thinking questions
  and predictions made.
- **Where your thinking was off.** The 10 latest predictions rated miss,
  partly, or vague. Each shows what you expected and the check's sentence.
  This list is the part worth rereading each week.

## Storage

- **Location.** One JSON file per record in `~/.claude/think-first/records/`.
  A record is a take or a prediction.
- **Why one file per record:** only one session ever writes each file, so
  sessions running at once can't overwrite each other's records.

## Known limits

- **Claude Code only.** Codex never runs the mod. The think-mode rule in
  `~/.agents/private-rules.md` covers Codex. If Pete writes that rule, the
  mod and the rule could both ask for his take in Claude Code. The rule
  should then defer to the mod.
- **A delay on each prompt.** The Haiku call runs before any eligible prompt
  is sent, about a second. Needs measuring in real use.
- **The classifier will make mistakes.** A missed thinking question just goes
  through. A wrong catch costs one Enter.
- **Prompts typed during a turn.** A prompt sent while a turn runs reaches
  that turn directly. The mod leaves it alone, `expect:` line included.
- **One plugin owns the band.** If the inbox mod also loads, the plugin order
  decides which band shows while a prediction is open.

## Status

- 2026-10-03: version 1 built and checked live.
- 2026-10-03: version 2 replaces it, per the review above. Checked live:
  - A business question was held back and refilled with `My take:` about a
    second after Enter.
  - Claude critiqued the take, then said which data would settle it.
  - An `expect:` line was hidden from Claude, checked when the turn ended,
    and opened with Discuss.
  - Haiku sorted 7 of 8 sample prompts correctly. On the eighth it answered
    the prompt instead of sorting it. Wrapping the message in tags fixed
    that case.
- Next decision: after 3 days of use, read the records. Check that the
  caught questions really were about the business, and that the takes and
  predictions are specific.
