# Intent Brief: Product-Design Skill Improvement

## Ranked Outcomes
1. **Smarter retrieval** — When the skill fires, it surfaces the 3-5 most relevant practices for the situation, not a category dump. This is the unlock that makes everything else viable.
2. **Better trigger precision** — The skill activates in the right contexts with the right subset of practices. Fewer false negatives (missed opportunities) and fewer false positives (irrelevant noise).
3. **Fill critical coverage gaps** — Add missing domains that matter for real work: mobile/responsive, i18n/RTL, motion/animation, dark mode/theming, real-time collaboration, advanced data visualization.
4. **Sharper practice format** — Each practice file becomes more actionable with concrete examples, code patterns, and decision trees rather than abstract guidance.
5. **Structural improvements** — The 486-file structure may need reorganization, deduplication, or a different retrieval strategy to support the above goals.

## Non-Goals
- Nothing is explicitly off the table — willing to consider any improvement that meaningfully helps.
- However, improvements must NOT:
  - Increase context bloat (the skill already has 486 files)
  - Strip research depth that makes practices credible
  - Become so opinionated it fights legitimate design choices
  - Break existing flows that already work well

## Kill Criteria
- If improvements dump MORE text into context → worse than today
- If sharpening strips cognitive science foundations → lost credibility
- If the skill becomes over-prescriptive → fights the user instead of informing
- If existing well-handled design situations regress → broken trust

## Unresolved Questions
1. How does Claude Code currently select which practices to surface when the skill triggers? Is it the full SKILL.md + all referenced files, or is there selective loading?
2. What's the actual token cost of the current skill when it fires?
3. Which coverage gaps matter most for the user's actual work (React/Next.js, SwiftUI, desktop apps)?
4. Is the 25-category taxonomy the right granularity, or should categories be consolidated/split?
5. Are there duplicate or near-duplicate practices across categories that could be merged?

## Domain and File Scope
- Primary: `/Users/petepetrash/.claude/skills/product-design/`
  - `SKILL.md` — trigger definition and routing
  - `practices/` — 25 subdirectories, ~486 markdown files
- Secondary: Other skills that interact with product-design (e.g., `frontend-design`, `interaction-design`, `typography`)
- Context: Claude Code skill loading mechanism and how skills are surfaced to the model
