---
name: cognitive-foundations
description: Apply cognitive science and HCI research to design decisions. Use when you need the scientific 'why' behind usability, explaining user behavior, understanding perception/memory/attention limits, evaluating designs against established principles, or grounding interface decisions in research.
---

# Cognitive Foundations

The science of how minds work, and what that means for design.

## When to Use This Skill

- Explaining _why_ a design works or fails (beyond opinion)
- Grounding recommendations in research
- Understanding user behavior patterns
- Evaluating cognitive load in an interface
- Applying predictive laws (Fitts, Hick-Hyman)
- Bridging the gulfs of execution and evaluation

## Core Frameworks (Quick Reference)

### Working Memory Limits

- Capacity: ~4 chunks (not 7)
- Duration: ~20 seconds without rehearsal
- **Implication**: Don't require remembering across screens. Externalize state.

### Dual Process Theory (Kahneman)

- System 1: Fast, intuitive, parallel, always on
- System 2: Slow, deliberate, serial, lazy
- **Implication**: Design for System 1. Most interface use is intuitive, not analytical.

### Predictive Laws

| Law                       | Formula                 | Design Implication                   |
| ------------------------- | ----------------------- | ------------------------------------ |
| **Fitts's Law**           | MT = a + b × log₂(2D/W) | Larger, closer targets are faster    |
| **Hick-Hyman**            | RT = a + b × log₂(n+1)  | More choices = slower decisions      |
| **Power Law of Practice** | T = a × N^(-b)          | Performance improves with repetition |

### Norman's Gulfs

- **Gulf of Execution**: Gap between intention and available actions
- **Gulf of Evaluation**: Gap between system state and perception
- **Solution**: Clear affordances, immediate feedback

### Attention & Perception

- Preattentive features (detected <200ms): Color, size, motion, orientation
- Change blindness: Users miss changes without attention
- **Implication**: Use preattentive features for critical info. Animate changes.

## Output Contract

When applying cognitive science to a design, structure your analysis as:

```markdown
## Cognitive Analysis

### Principle Applied

[Name of principle + 1-sentence explanation]

### Evidence in Design

[Where/how this applies to the specific design being analyzed]

### Design Implication

[Specific, actionable recommendation]

### Confidence

[High/Medium/Low + rationale]
```

For comprehensive analysis, use multiple principle blocks.

## Process

1. **Identify the cognitive demands** - What is the interface asking the user to perceive, remember, or decide?
2. **Match to principles** - Which cognitive constraints or laws apply?
3. **Evaluate alignment** - Does the design respect or violate these constraints?
4. **Recommend changes** - Specific modifications grounded in the principle

## Common Design Implications

### For Layout

- Use Gestalt principles (proximity, similarity) to communicate grouping
- Leverage preattentive features for critical information
- Respect working memory: ~4 related items max

### For Interaction

- Recognition over recall (menus > commands for novices)
- Immediate feedback for all actions
- Match system image to user's mental model

### For Decisions

- Reduce choice when possible (Hick-Hyman)
- Smart defaults (most people stick with defaults)
- Frame options intentionally—framing changes decisions

### For Learning

- Support both novice (recognition, guidance) and expert (shortcuts, power)
- Leverage Power Law: design for learnability, not just first use
- Expect transfer failure: expertise is often domain-specific

## When to Go Deeper

For detailed principles and research:

- [PSYCHOLOGY.md](PSYCHOLOGY.md) - Perception, memory, attention, biases, emotion
- [HCI-THEORY.md](HCI-THEORY.md) - Norman's model, Fitts's Law, heuristics, research methods

## Key Researchers

- **Don Norman**: Affordances, gulfs, emotional design
- **Daniel Kahneman**: Dual process theory, heuristics and biases
- **Stuart Card**: GOMS, information foraging
- **Anne Treisman**: Feature integration, preattentive processing
- **George Miller / Nelson Cowan**: Working memory capacity

## Remember

- Cognitive science explains _why_ design principles work
- Individual differences exist—design for variability
- Lab findings may not generalize (ecological validity)
- Theory informs but doesn't replace user research
