# The Lens Roster

Seven lenses, each a member of the expert team. Run them all; breadth is the point of the sweep. Each lens entry gives the mission, the questions that lens characteristically asks, the lateral moves it favors (defined in the toolkit at the bottom), and the failure mode that makes that lens produce slop instead of signal.

Every lens obeys the same two ground rules: hypotheses name the asset they channel (with a location in the repo), and claims stay checkable. A lens that produces vibes has failed at its job.

---

## The Strategist

**Mission:** locate the game the project is actually playing, and decide whether a bigger, adjacent game is one reframe away.

**Characteristic questions:**
- If this project succeeds wildly at its stated goal, what does the world look like? Is that prize worth the effort being spent?
- What would this project be if it took itself completely seriously?
- Which existing asset *compounds*, getting more valuable with use or time (a dataset, a format, a corpus of examples, a network of users)? Is the current strategy built on the compounding asset or on a depreciating one?
- Is this playing a feature game against someone else's platform game? Or sitting on a platform game while playing features?
- What is the 10x version of the stated goal that the current mechanisms could genuinely serve?
- What would a well-funded competitor copy first? Whatever that is, it is the crown jewel; is it being treated as one?

**Favored moves:** zoom out, standardization, data gravity.

**Failure mode:** grandiosity untethered from assets. A strategist hypothesis that does not name the existing asset it channels is a daydream, not a strategy.

---

## The Positioning Specialist

**Mission:** make the project legible and desirable in ten seconds, without saying anything false.

**Characteristic questions:**
- Explain the project in one sentence to five different people: a busy peer, a complete newcomer, a potential buyer, a skeptic, a journalist. Which framing lands? Which asset does the landing frame foreground?
- What category does the project currently claim? Is that category crowded, dead, or misunderstood? Is there a truer category where it is first-in-class instead of tenth?
- What is the sharpest true sentence about this project, something only this project can honestly say?
- Does the README, name, or site lead with the plumbing or with the outcome? What does the first screen make a stranger feel?
- What proof already exists (demos, numbers, screenshots, testimonials, benchmarks) that is currently buried three levels deep?
- Is the project's language borrowed from a neighbor's category, making it sound like a worse version of something it is not?

**Favored moves:** wedge narrowing, format flip, inversion.

**Failure mode:** taglines detached from truth. Every candidate frame must be checkable against the repo; a frame the product cannot cash is worse than the current one.

---

## The Product Thinker

**Mission:** identify the real user, the job they hire the project for, and the missing capability with disproportionate value.

**Characteristic questions:**
- Who uses this today, or would use it first? What were they doing before, and what does switching cost them?
- Where is the moment of first value, and how many steps stand before it? Which step loses people?
- Which single missing capability would double the value for the core user? (One, not ten.)
- What do the TODOs, issues, and half-built branches reveal about demand the maintainer has already heard but not weighted?
- Is there a dark feature: something the project already does internally but never exposed? (Internal capabilities with external demand are the purest form of latent potential.)
- Which users would pull this out of the maintainer's hands if they knew it existed?

**Favored moves:** artifact promotion, zoom in, user substitution.

**Failure mode:** the feature laundry list. Rank by leverage, tie every candidate to an asset and a user, and prefer the one capability that changes the product's meaning over five that improve it.

---

## The Architect

**Mission:** read the mechanisms for what they enable beyond their current use.

**Characteristic questions:**
- What is the deepest abstraction in the codebase, and what else could it host? What is it secretly a general solution to?
- What is over-built relative to the current story: a subsystem more general, more robust, or more polished than its use requires? Over-building is either waste or a buried thesis. Decide which, and if it is a thesis, say what believing it would imply.
- What could be extracted as a standalone library, protocol, or format that others would adopt? Who is the plausible first adopter?
- What does this architecture make cheap that competitors find expensive?
- Is there an accidental moat: a data model, plugin surface, test corpus, or eval harness that took real accumulated effort and would be genuinely hard to reproduce?
- What constraint is the design silently assuming (single user, local only, one platform, one model, one language)? What becomes possible if it is dropped, and what does dropping it cost?

**Favored moves:** standardization, recombination, constraint removal.

**Failure mode:** elegance worship. Extraction and generalization are only opportunities when a plausible adopter exists; name the adopter or drop the hypothesis.

---

## The Distribution Specialist

**Mission:** find where users would actually come from, and what kills momentum before first value.

**Characteristic questions:**
- What is the wedge: the smallest self-contained unit of value that spreads on its own? (A shareable artifact, a before-and-after, a single command that produces something worth showing someone.)
- Where does the target user already congregate, and what would make this project's *output* appear there without the maintainer doing daily promotion?
- What is the install-to-aha path, step by step? Which step is the cliff?
- Is there a built-in loop: output that advertises the tool, templates people fork, public artifacts that link back?
- Which distribution surfaces does the owner already have (published packages, domains, followings, repos with stars, past launches) that this project is not using? Owned-but-idle distribution is a latent asset like any other.
- Could the build itself be the marketing: the changelog, the devlog, the postmortem, the benchmark results?

**Favored moves:** audience flip, format flip, wedge narrowing.

**Failure mode:** growth vocabulary with no mechanism. "Launch on Product Hunt" is not a hypothesis; the concrete loop, who sees what artifact where and what they do next, is.

---

## The Ecosystem Watcher

**Mission:** read the environment around the project and find the honest "why now".

**Characteristic questions:**
- What changed in the last 6 to 18 months (platform capabilities, model capabilities, pricing collapse, a rising standard, a competitor's pivot or death) that makes one of this project's existing assets newly valuable?
- Which rising wave could this project attach to without lying about itself?
- What adjacent projects exist, where exactly do they stop, and does this project start where they stop? Complementarity is cheaper than competition.
- Is the project fighting the direction its own platform is moving? Platform tailwinds and headwinds usually dominate execution quality.
- What becomes true in 12 months that this project should already be positioned for?
- Is there a standard, format, or protocol emerging where this project could be the reference implementation instead of a bystander?

**Favored moves:** analogy transfer, standardization, data gravity.

**Failure mode:** trend-chasing. A wave only matters if it connects to an asset that already exists in this repo. When working offline, timing claims carry an explicit staleness caveat rather than false precision.

---

## The Skeptic

**Mission:** protect the maintainer from wasted years. Argue against, specifically.

**Characteristic questions:**
- What is the strongest case that this project does not matter: nobody has the problem, the platform will absorb it, the maintenance cost exceeds any plausible payoff?
- Which current effort sink has the weakest payoff case? Argue from the git history: where did the last three months actually go, and what did that buy?
- For each opportunity the other lenses propose: what would have to be true for it to work, and what is the earliest, cheapest disconfirming signal?
- Is the honest overall read "modest potential"? If so, what is the smallest honorable version: extract the one valuable piece, archive the rest, write the postmortem that teaches others?
- What is the maintainer sunk-cost-attached to? Say it plainly.
- If this project disappeared tomorrow, who would notice, and how long would it take?

**Favored moves:** inversion, wedge narrowing (as scope discipline).

**Failure mode:** cynicism as a pose. Objections must be as specific and falsifiable as the hypotheses they attack; "this probably won't work" is not skepticism, it is noise.

---

# The Lateral Moves Toolkit

Shared vocabulary for all lenses. Each move is a way of generating a hypothesis from an existing asset.

1. **Artifact promotion.** A side artifact becomes the product. The test harness, the level editor, the internal dashboard, the eval suite: things built to serve the project sometimes out-value it.
2. **Inversion.** Flip the assumed direction. Tool that helps humans read machine output becomes tool that helps machines read human intent. Consumer of a format becomes producer of it.
3. **User substitution.** Keep the mechanism, swap the user. Built for yourself, works for the team; built for the team, works for the auditor, the teacher, the agency.
4. **Zoom out / zoom in.** Feature to product to platform to movement, or the reverse: the single most-loved 10% extracted and made standalone.
5. **Analogy transfer.** "What is the X of Y": port a pattern proven in an adjacent domain onto this project's assets.
6. **Constraint removal.** Name the constraint the design silently assumes (local-only, single-user, one platform, one model), price its removal, see what market appears.
7. **Recombination.** Two existing assets composed into something neither is alone. The docs generator plus the test corpus is a tutorial engine; the parser plus the diff view is a review tool.
8. **Audience flip.** Build for the people you learned from while building. The devlog is the content; the tooling you made for yourself is the product; the mistakes are the course.
9. **Format flip.** Same knowledge, different container: code to content, content to course, course to service, internal convention to published spec.
10. **Wedge narrowing.** Shrink scope to the single sharpest use case until the value is undeniable, then widen from strength.
11. **Standardization.** The internal format, protocol, or convention becomes the public interface others build against; the project graduates from tool to infrastructure.
12. **Data gravity.** The exhaust (logs, runs, evals, benchmarks, traces) becomes the dataset or benchmark others need; the byproduct becomes the moat.
