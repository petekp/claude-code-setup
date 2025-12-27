# HCI Theory Reference

The theoretical foundations and predictive models behind why interfaces work—or don't.

## Foundational Frameworks

### Norman's Seven Stages of Action

Every interaction follows this cycle:

1. **Goal** — forming the intention
2. **Plan** — deciding on action sequence
3. **Specify** — translating plan to physical actions
4. **Perform** — executing the action
5. **Perceive** — sensing the state of the world
6. **Interpret** — making sense of perception
7. **Compare** — evaluating outcome against goal

**Gulf of Execution**: Gap between user's intentions and available actions
**Gulf of Evaluation**: Gap between system state and user's perception of it

Design implication: Minimize both gulfs through clear affordances and feedback.

### Affordances and Signifiers (Gibson → Norman)

- **Affordance**: What an object allows you to do (exists whether perceived or not)
- **Perceived Affordance**: What the user thinks they can do
- **Signifier**: What communicates the affordance

Common confusion: A button's affordance is "pressability." The signifier is its raised appearance, shadow, or label.

Design implication: Affordances are designed; signifiers must be visible.

### Mental Models

- **User's mental model**: How the user thinks the system works
- **Designer's model**: How the designer thinks the system works
- **System image**: What the system actually presents

When these diverge, errors occur. The system image is the only communication channel.

Design implication: Design the system image to align user and designer models.

## Predictive Laws

### Fitts's Law

Movement time to a target:

```
MT = a + b × log₂(2D/W)
```

Where D = distance, W = target width

**Implications:**

- Larger targets are faster to hit
- Closer targets are faster to reach
- Corners and edges are infinitely wide (screen bounds)
- Why menus at screen edges are fast (Mac menu bar)
- Why pie menus outperform linear menus

### Hick-Hyman Law

Decision time increases with choices:

```
RT = a + b × log₂(n + 1)
```

Where n = number of alternatives

**Implications:**

- More choices = slower decisions
- But only for unpredictable choices
- Expert users bypass through memory
- Organize options to reduce effective choices
- Progressive disclosure limits cognitive load

### Steering Law

Time to navigate through a constrained path:

```
T = a + b × (A/W)
```

Where A = path length, W = path width

**Implications:**

- Cascading menus are slow (narrow paths)
- Wider channels allow faster movement
- Explains difficulty of hover menus
- Why tunnel interfaces feel laborious

### Power Law of Practice

Performance improves with repetition:

```
T = a × N^(-b)
```

Where N = number of trials

**Implications:**

- Novice and expert performance differ dramatically
- Design for learnability, not just initial use
- Shortcuts reward repeated use
- Muscle memory is real and valuable

## Cognitive Foundations in HCI

### Working Memory (Miller, Baddeley)

- Capacity: 7±2 chunks (Miller) or ~4 chunks (Cowan)
- Duration: ~20 seconds without rehearsal
- Easily disrupted by interference

**Implications:**

- Don't require users to remember across screens
- Chunk information meaningfully
- Keep related information visible together
- Minimize interruptions during complex tasks

### Attention (Treisman, Kahneman)

- **Preattentive processing**: Color, size, orientation, motion detected instantly
- **Selective attention**: Limited capacity, can only focus on one complex task
- **Change blindness**: Unattended changes go unnoticed
- **Inattentional blindness**: Unexpected objects missed entirely

**Implications:**

- Use preattentive features for critical information
- Don't rely on users noticing changes
- Animation draws attention (use sparingly)
- Important changes need explicit signaling

### Recognition vs. Recall (Tulving)

- **Recognition**: Identifying something seen before (easier)
- **Recall**: Retrieving from memory without cues (harder)

**Implications:**

- Menus > command lines for novices
- Show options rather than requiring memory
- Consistent locations leverage recognition
- Icons + labels beat icons alone

### Cognitive Load (Sweller)

- **Intrinsic load**: Complexity inherent to the task
- **Extraneous load**: Complexity added by poor design
- **Germane load**: Effort toward learning/schema building

**Implications:**

- Minimize extraneous load (that's design's job)
- Scaffold intrinsic load for complex tasks
- Don't simplify away essential complexity
- Reduce load during critical operations

## Error Theory

### Slips vs. Mistakes (Reason, Norman)

- **Slips**: Right intention, wrong action (execution failure)
  - Capture errors (habit takes over)
  - Description errors (similar objects confused)
  - Mode errors (wrong system state assumed)
- **Mistakes**: Wrong intention (planning failure)
  - Knowledge-based mistakes
  - Rule-based mistakes

**Implications:**

- Slips need physical constraints and undo
- Mistakes need better feedback and mental model alignment
- Different error types need different solutions

### Swiss Cheese Model (Reason)

Accidents happen when holes in multiple defensive layers align.

**Implications:**

- Single safeguards are insufficient
- Confirmation dialogs are one (weak) layer
- Undo is another layer
- Constraints prevent some errors entirely
- Multiple independent safeguards for critical actions

## Interaction Paradigms

### Direct Manipulation (Shneiderman)

1. Continuous representation of objects of interest
2. Physical actions instead of complex syntax
3. Rapid, incremental, reversible actions
4. Immediate, visible feedback

**Why it works:** Reduces gulf of execution, exploits spatial reasoning, enables exploration.

**Limitations:** Not everything has physical metaphor; poor for abstract operations.

### Instrumental Interaction (Beaudouin-Lafon)

- **Domain objects**: What users work with
- **Instruments**: Tools that act on objects
- **Reification**: Making abstract concepts concrete
- **Polymorphism**: Instruments working on multiple object types

**Implications:**

- Clear separation of tools and materials
- Instruments should be visible and persistent
- Reify actions into manipulable objects (e.g., selections, styles)

### Gulf-Bridging Approaches

| Strategy    | Execution Gulf | Evaluation Gulf |
| ----------- | -------------- | --------------- |
| Affordances | ✓              |                 |
| Constraints | ✓              |                 |
| Mappings    | ✓              | ✓               |
| Feedback    |                | ✓               |
| Visibility  | ✓              | ✓               |
| Consistency | ✓              | ✓               |

## User Research Methods

### When to Use What

**Formative (early design):**

- Contextual inquiry: Observe users in their environment
- Card sorting: Understand mental categories
- Participatory design: Co-create with users
- Think-aloud protocols: Expose reasoning

**Summative (evaluation):**

- Usability testing: Task-based observation
- A/B testing: Comparative performance
- Heuristic evaluation: Expert inspection
- Cognitive walkthrough: Step-through analysis

### Quantitative Measures

- **Effectiveness**: Task completion rate
- **Efficiency**: Time on task, errors, learnability
- **Satisfaction**: Subjective ratings (SUS, NASA-TLX)

The ISO 9241 definition of usability: effectiveness, efficiency, satisfaction in context.

### Sample Size Considerations

- Usability testing: 5 users find ~85% of problems (Nielsen)
- Quantitative studies: Power analysis required
- A/B tests: Effect size determines sample needs
- Qualitative saturation: When new themes stop emerging

### Research Validity

- **Internal validity**: Did X cause Y?
- **External validity**: Does it generalize?
- **Ecological validity**: Does it reflect real use?
- **Construct validity**: Are you measuring what you think?

Lab studies sacrifice ecological validity for control. Field studies do the opposite.

## Evaluation Heuristics

### Nielsen's 10 Heuristics

1. Visibility of system status
2. Match between system and real world
3. User control and freedom
4. Consistency and standards
5. Error prevention
6. Recognition rather than recall
7. Flexibility and efficiency of use
8. Aesthetic and minimalist design
9. Help users recognize, diagnose, recover from errors
10. Help and documentation

### Shneiderman's 8 Golden Rules

1. Strive for consistency
2. Cater to universal usability
3. Offer informative feedback
4. Design dialogs to yield closure
5. Prevent errors
6. Permit easy reversal of actions
7. Support internal locus of control
8. Reduce short-term memory load

### Applying Heuristics

- Structured inspection with severity ratings
- Multiple evaluators find more issues
- Explain violations in terms of principles
- Distinguish opinion from evidence-based criticism

## Theoretical Tensions

### Novice vs. Expert

- Novices need recognition, feedback, guidance
- Experts need efficiency, shortcuts, power
- Design challenge: Serve both without compromise
- Solutions: Progressive disclosure, accelerators, adaptive interfaces

### Simplicity vs. Power

- "Make it simple" vs. "make it capable"
- Removing features reduces capability
- Adding features increases complexity
- Resolution: Simplicity in common paths, power available but not required

### Consistency vs. Context

- Consistency enables transfer of learning
- Context may demand different solutions
- Internal consistency > external consistency
- Breaking consistency requires strong justification

### Automation vs. Control

- Automation reduces effort but also agency
- Users must maintain mental models of automated systems
- "Out of the loop" problem in automation
- Appropriate levels of automation depend on consequence and skill

## Seminal Contributions

### Key Researchers and Ideas

- **Don Norman**: Affordances, emotional design, design of everyday things
- **Ben Shneiderman**: Direct manipulation, information visualization
- **Stuart Card**: GOMS, information foraging, Fitts's Law applications
- **Jef Raskin**: Humane interface, modes considered harmful
- **Alan Kay**: Dynabook, object-oriented interfaces
- **Douglas Engelbart**: Mouse, hypertext, augmenting human intellect
- **Ted Nelson**: Hypertext, Xanadu
- **Bill Buxton**: Sketching, input devices, design process

### Foundational Papers

- "The Psychopathology of Everyday Things" (Norman)
- "Direct Manipulation Interfaces" (Shneiderman)
- "The Psychology of Human-Computer Interaction" (Card, Moran, Newell)
- "Instrumental Interaction" (Beaudouin-Lafon)
- "As We May Think" (Bush)
- "Augmenting Human Intellect" (Engelbart)
- "A Feature Integration Theory of Attention" (Treisman)

## Methodological Notes

### Levels of Analysis (Marr)

1. **Computational**: What problem is being solved?
2. **Algorithmic**: What process solves it?
3. **Implementational**: How is it physically realized?

Different questions, different methods.

### Converging Evidence

No single method is definitive:

- Behavioral experiments: What people do
- Neuroimaging: What brains do
- Computational models: How it might work
- Lesion studies: What breaks when damaged

Triangulation strengthens conclusions.

### Ecological Validity

Lab findings may not generalize to real world:

- Simplified stimuli
- Artificial tasks
- Measured awareness
- Motivated participants

Design implication: Supplement lab findings with field observation.

## The Academic Lens

### What Theory Provides

- Explanatory power (why does this work/fail?)
- Predictive power (what will happen if...?)
- Generative power (what should we try?)
- Evaluative criteria (how do we judge success?)

### What Theory Doesn't Replace

- User research with real users
- Iteration and testing
- Domain expertise
- Craft and intuition

### Bridging Research and Practice

- Research reveals principles
- Practice applies and tests them
- Practical problems inspire research
- Research findings inform design
- The cycle should be continuous
