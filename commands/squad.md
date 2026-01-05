---
description: Orchestrate multiple skills to comprehensively address a request. Use when you want Claude to apply all relevant expertise.
argument-hint: [your request]
---

# Squad Deployment Protocol

You are activating **Squad Mode**—a comprehensive approach that brings multiple specialized perspectives to bear on a single request. Instead of responding from a single angle, you will systematically apply every relevant skill and synthesize their insights.

## Available Skills Catalog

Scan this catalog and activate every skill that could contribute meaningful insight to the request.

### Personal Skills

| Skill | Activate When |
|-------|---------------|
| `cognitive-foundations` | UX decisions, user behavior, perception/memory/attention limits, cognitive load |
| `design-critique` | UI/UX reviews, visual design feedback, component evaluation, polish assessment |
| `dreaming` | Brainstorming, ambitious ideas, breaking constraints, envisioning ideal futures |
| `interaction-design` | Component behaviors, micro-interactions, user flows, accessibility, animations |
| `model-first-reasoning` | Complex logic, state machines, constraint systems, formal correctness |
| `oss-product-manager` | Open source strategy, community dynamics, releases, sustainable maintenance |
| `startup-wisdom` | Product strategy, prioritization, build-vs-buy, go-to-market, PMF assessment |
| `stress-testing` | Pre-mortems, risk analysis, assumption audits, failure mode identification |
| `tutorial-writing` | Educational content, implementation guides, step-by-step walkthroughs |
| `typography` | Type scales, font selection, readability, text hierarchy, spacing |
| `unix-macos-engineer` | Shell scripts, CLI tools, system administration, process management |
| `ux-writing` | Microcopy, error messages, empty states, button labels, voice/tone |
| `wise-novice` | Fresh perspectives, naive questions, challenging expert assumptions |

### Plugin Agents

| Agent | Activate When |
|-------|---------------|
| `feature-dev:feature-dev` | Building new features requiring architecture focus |
| `code-review:code-review` | Reviewing pull requests or code quality |
| `frontend-design:frontend-design` | Production-grade UI implementation with high design bar |
| `pr-review-toolkit:code-reviewer` | Checking code adherence to guidelines and best practices |
| `pr-review-toolkit:code-simplifier` | Simplifying code for clarity and maintainability |
| `pr-review-toolkit:silent-failure-hunter` | Finding silent failures and error handling gaps |
| `pr-review-toolkit:type-design-analyzer` | Analyzing type design quality and invariants |
| `pr-review-toolkit:pr-test-analyzer` | Assessing test coverage quality |
| `pr-review-toolkit:comment-analyzer` | Reviewing comment accuracy and maintainability |

## Phase 1: Request Analysis

Before selecting skills, deeply understand the request:

1. **Core intent**: What is the user fundamentally trying to accomplish?
2. **Domain**: What domains does this touch (design, code, strategy, systems, etc.)?
3. **Scope**: Is this ideation, implementation, review, or something else?
4. **Constraints**: What limitations or requirements are stated or implied?

## Phase 2: Skill Selection

Review the catalog above. For each skill, ask:
- Does this perspective offer unique value for this request?
- Would omitting this skill leave a blind spot?

**Selection rules:**
- Activate at minimum 3 skills (squad implies breadth)
- Include at least one "challenger" skill (wise-novice, stress-testing) to prevent groupthink
- If the request involves UI/UX, activate the full design stack (cognitive-foundations → interaction-design → typography → ux-writing → design-critique)
- If the request involves code, consider the code quality stack (code-reviewer → code-simplifier → silent-failure-hunter)

## Phase 3: Orchestrated Execution

Apply skills in this sequence:

### Understanding Phase
1. `wise-novice` — Question assumptions, ask naive questions
2. `cognitive-foundations` — Consider user psychology and constraints

### Ideation Phase (if applicable)
3. `dreaming` — Think expansively without constraints
4. `startup-wisdom` — Apply strategic framing

### Design Phase (if applicable)
5. `interaction-design` — Design behaviors and flows
6. `typography` — Consider text and visual hierarchy
7. `ux-writing` — Craft interface language

### Implementation Phase (if applicable)
8. `model-first-reasoning` — Formal modeling for complex logic
9. `unix-macos-engineer` — Systems and tooling
10. `feature-dev:feature-dev` — Architecture-focused development
11. `frontend-design:frontend-design` — High-quality UI implementation

### Validation Phase
12. `design-critique` — Evaluate against quality bar
13. `stress-testing` — Identify risks and failure modes
14. `code-reviewer` / `silent-failure-hunter` — Code quality checks

### Strategic Phase (if applicable)
15. `oss-product-manager` — Open source considerations
16. `startup-wisdom` — Business and product strategy

## Phase 4: Synthesis

After applying each skill's lens, synthesize insights:
- Identify consensus across skills (strong signals)
- Note creative tensions between perspectives
- Prioritize recommendations by impact
- Weave into a cohesive, actionable response

## Output Format

Structure your response as follows:

```
## Squad Deployment

### Activated Skills
- **[Skill 1]**: [Why this skill is relevant]
- **[Skill 2]**: [Why this skill is relevant]
- ...

---

### [Skill 1] Lens
[Key insights from this skill's perspective. Be specific and actionable.]

### [Skill 2] Lens
[Key insights from this skill's perspective. Be specific and actionable.]

...

---

## Synthesis

[Unified response that weaves together all perspectives. This is not a summary—it's an integrated answer that couldn't come from any single skill alone.]

## Recommendations

**High Priority**
- [ ] [Action item with clear next step]

**Medium Priority**
- [ ] [Action item]

**Consider Later**
- [ ] [Action item]
```

## Mantras

- More perspectives reveal more of the truth
- The blind spots of one skill are visible to another
- Synthesis is greater than the sum of analyses
- Every request deserves the full weight of expertise

---

## User Request

$ARGUMENTS
