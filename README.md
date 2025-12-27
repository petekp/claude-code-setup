# Claude Code Skills

A curated collection of high-quality skills for [Claude Code](https://docs.anthropic.com/en/docs/claude-code).

## What are Skills?

Skills are model-invoked capabilities that Claude autonomously uses based on task context. Unlike commands (user-invoked with `/slash`), skills provide contextual guidance that Claude incorporates into its reasoning when relevant.

## Installation

Copy the skill folder(s) you want into your Claude Code skills directory:

```bash
# Clone this repo
git clone https://github.com/petekp/claude-skills.git

# Copy all skills
cp -r claude-skills/skills/* ~/.claude/skills/

# Or copy individual skills
cp -r claude-skills/skills/tutorial-writing ~/.claude/skills/
```

## Available Skills

### Thinking Toolkit

#### Stress Testing

Stress-test plans, proposals, and strategies before committing resources.

**Location:** `skills/stress-testing/`

**Triggers on:** pre-mortems, assumption audits, risk registers, evaluating business ideas, identifying failure modes, devil's advocate analysis

**Key features:**
- Pre-mortem technique framework
- Common failure patterns (planning fallacies, assumption traps, complexity blindness)
- Stress tests (10x test, adversary test, scalability test, time test)
- Red flags checklist for communication, planning, reasoning, and teams
- Kill criteria and experiment design

---

#### Dreaming

Think expansively and imaginatively without practical constraints.

**Location:** `skills/dreaming/`

**Triggers on:** brainstorming ambitious ideas, exploring possibilities, challenging assumptions, envisioning ideal futures, breaking out of incremental thinking

**Key features:**
- Expansion techniques (10x question, time travel, inversion, combination)
- Vision articulation methods (ideal day, newspaper test, the demo)
- Constraint-breaking frameworks
- Balances with Stress Testing for "dream/evaluate" oscillation
- Good vs. bad output examples

---

#### Wise Novice

Approach problems with beginner's mind while asking penetrating questions.

**Location:** `skills/wise-novice/`

**Triggers on:** seeking fresh perspectives, cutting through complexity, challenging expert assumptions, simplifying explanations, when deep domain knowledge may be creating blind spots

**Key features:**
- Foundation questions ("What problem does this actually solve?")
- Simplification techniques ("What's the simplest version that would work?")
- The "Shoshin" (beginner's mind) framework
- Strategic naivety—knowing when to stay naive and when to learn
- Common novice insights across technology, business, and design

---

#### Model-First Reasoning (MFR)

A rigorous code-generation methodology that requires constructing an explicit problem model before any implementation.

**Location:** `skills/model-first-reasoning/`

**Triggers on:** "model-first", "MFR", "formal modeling", complex logic, state machines, constraint systems

**What it does:**
1. **Phase 1 (Model):** Creates a formal JSON model with entities, constraints, actions, and test oracles
2. **Phase 1.5 (Audit):** Verifies coverage, operability, consistency, and testability
3. **Phase 2 (Implement):** Codes strictly within the frozen model contract

**Example:**
```
Using model-first reasoning, build a shopping cart that enforces:
max 10 items, no duplicate SKUs, total can't exceed $1000
```

---

### Learning & Teaching

#### Tutorial-Writing

Generate comprehensive implementation tutorial documents with deep background, context, rationale, and step-by-step milestones.

**Location:** `skills/tutorial-writing/`

**Triggers on:** "create a tutorial for", "implementation guide", "teach me how to implement"

**Philosophy:** Addresses the pain point of reviewing AI-generated PRs—feeling disconnected from the work. Instead:
1. AI researches deeply and produces a comprehensive tutorial document
2. Human implements following the guide, staying connected to decisions
3. Result: Faster than pure manual work, but you understand what you built

**Output:** A markdown document with milestones, verification steps, and codebase-grounded references—NOT direct code changes.

---

### Design & UX

#### UX Writing

Write clear, helpful, human interface copy.

**Location:** `skills/ux-writing/`

**Triggers on:** microcopy, error messages, button labels, empty states, onboarding flows, tooltips, voice and tone guidance

**Key features:**
- Button and action patterns (with pairing table)
- Error message structure (what happened → why → how to fix)
- Empty state templates
- Quality tests: readback, screenshot, stress, translation, truncation
- Capitalization and punctuation rules
- Accessibility writing guidelines

---

#### Typography

Apply professional typography principles to create readable, hierarchical, and aesthetically refined interfaces.

**Location:** `skills/typography/`

**Triggers on:** type scales, font selection, spacing, text-heavy layouts, readability, font pairing, line height, measure

**Key features:**
- Modular scale ratios with practical examples
- Optimal line length (measure) guidelines
- Line height by context (body, headings, UI labels, buttons)
- Letter spacing rules including all-caps handling
- Font selection with system font stacks and safe web font recommendations
- Dark mode typography adjustments
- Accessibility minimums and considerations

---

#### Interaction Design

Apply interaction design principles to create intuitive, responsive interfaces.

**Location:** `skills/interaction-design/`

**Triggers on:** component behaviors, micro-interactions, loading states, transitions, user flows, accessibility patterns, animation timing

**Key features:**
- State transition timing (hover, focus, active, disabled, loading)
- Animation timing by scale (micro → large)
- Easing function recommendations
- User flow patterns (navigation, onboarding, error recovery, empty states)
- Component behaviors (forms, modals, dropdowns, drag & drop)
- Accessibility patterns (keyboard navigation, screen readers, motion preferences)
- Loading and progress state guidelines

---

#### Design Critique

Critique UI/UX designs for clarity, hierarchy, interaction, accessibility, and craft.

**Location:** `skills/design-critique/`

**Triggers on:** design reviews, PR feedback on UI changes, evaluating mockups, checking if a component is ship-ready, honest feedback on quality

**Key features:**
- Structured output contract (verdict → issues → accessibility → what's working)
- Severity levels (P0 blocking through P3 polish)
- Quick-pass checklist for fast reviews
- Deep principles reference for thorough critiques
- Platform-specific guidance (iOS HIG, etc.)

---

#### Cognitive Foundations

Apply cognitive science and HCI research to design decisions.

**Location:** `skills/cognitive-foundations/`

**Triggers on:** explaining _why_ a design works, understanding perception/memory/attention limits, evaluating cognitive load, predicting performance with Fitts's/Hick's Law, grounding decisions in research

**Key features:**
- Quick reference for predictive laws (Fitts's, Hick-Hyman, Steering, Power Law)
- Nielsen's 10 heuristics with quick tests
- Working memory guidelines (~4 chunks, not 7)
- Preattentive features for critical information
- Cognitive load checklist
- Deep reference files for psychology and HCI theory

---

### Strategy & Product

#### Startup Wisdom

Apply startup execution wisdom to product, strategy, and business decisions.

**Location:** `skills/startup-wisdom/`

**Triggers on:** feature prioritization, build-vs-buy decisions, go-to-market planning, pricing, hiring, scope/timeline reality checks, product-market fit evaluation

**Key features:**
- First principles (speed over perfection, focus, cash is oxygen)
- Product thinking (finding PMF, what to build first, feature prioritization)
- Decision frameworks ("Should we build this?", "Should we pursue this market?")
- Common founder mistakes by stage
- Hard truths about ideas, yourself, and the market

---

#### OSS Product Manager

Navigate open source product strategy, community dynamics, and sustainable maintenance.

**Location:** `skills/oss-product-manager/`

**Triggers on:** planning OSS releases, managing contributors, handling community expectations, balancing commercial and community interests, building in the open

**Key features:**
- Project lifecycle guidance (early → growth → mature)
- Community management (contributor pipeline, communication channels)
- Governance models (BDFL, core team, foundation)
- Sustainability (funding models, avoiding burnout, bus factor)
- Legal and licensing considerations

---

### Development

#### Unix/macOS Engineer

Expert Unix and macOS systems engineering.

**Location:** `skills/unix-macos-engineer/`

**Triggers on:** Unix commands, shell scripts, macOS system configuration, launchd, Homebrew, process management, networking, troubleshooting system issues

**Key features:**
- Shell script template with best practices
- launchd plist templates and launchctl commands
- Networking patterns (curl, SSH, diagnostics)
- File system operations (permissions, ACLs, extended attributes, find patterns)
- macOS-specific commands (defaults, mdfind, security, Homebrew)
- Debugging and diagnostics tools

---

#### Next.js Boilerplate

Bootstrap a production-ready Next.js project with modern tooling.

**Location:** `skills/nextjs-boilerplate/`

**Triggers on:** "create a new Next.js project", "bootstrap Next.js with shadcn", "set up a Next.js app", "create an AI chat app", "start a new React project with Tailwind"

**Key features:**
- Step-by-step setup process (Next.js + Tailwind + shadcn/ui)
- assistant-ui integration for AI chat interfaces
- Project structure recommendations
- Common patterns (theme provider, cn() utility, forms with react-hook-form + zod)
- Verification checklist and troubleshooting

---

## Skill Structure

Each skill follows this structure:

```
skills/
└── skill-name/
    └── SKILL.md          # Main skill definition (required)
```

The `SKILL.md` file contains:
- **Frontmatter:** `name`, `description` (trigger conditions), optional `version`
- **Content:** Instructions, examples, and guidance for Claude

## Creating Your Own Skills

1. Create a folder in `~/.claude/skills/your-skill-name/`
2. Add a `SKILL.md` file with frontmatter:

```yaml
---
name: your-skill-name
description: Use when the user asks about X, mentions Y, or needs Z. [Describe trigger conditions clearly.]
---

# Your Skill Title

[Instructions for Claude when this skill is active...]
```

3. The `description` field is crucial—it tells Claude when to invoke the skill

## Contributing

1. Fork this repository
2. Add your skill in `skills/your-skill-name/SKILL.md`
3. Update this README with your skill's documentation
4. Submit a pull request

**Quality bar:** We aim for skills that provide deep, actionable guidance—not surface-level principles. Each skill should offer something Claude doesn't do well by default.

## License

MIT
