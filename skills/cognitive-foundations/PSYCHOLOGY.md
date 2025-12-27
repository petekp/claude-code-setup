# Cognitive Psychology Reference

Deep dive into how minds work—perception, memory, attention, decision-making, and emotion.

## Perception

### Visual Perception

**Preattentive Features** (Treisman)
Detected in <200ms, parallel processing:
- Color
- Orientation
- Size
- Motion
- Curvature
- Enclosure

Design implication: Use these for critical, must-see information.

**Gestalt Principles**
How we group visual elements:
- **Proximity**: Close things belong together
- **Similarity**: Similar things belong together
- **Continuity**: We follow smooth paths
- **Closure**: We complete incomplete shapes
- **Common fate**: Things moving together belong together
- **Figure/ground**: We separate foreground from background

Design implication: Layout communicates relationship. Use grouping intentionally.

**Change Blindness**
We fail to notice changes during visual disruption (saccades, blinks, scene cuts).

Design implication: Don't rely on users noticing changes. Animate or highlight transitions.

**Inattentional Blindness**
We miss unexpected stimuli when focused elsewhere. (Gorilla experiment, Simons & Chabris)

Design implication: Important new elements need to demand attention, not just appear.

### Attention

**Selective Attention** (Broadbent, Treisman)
- We can only deeply process one stream at a time
- Selection happens early (filtering) and late (weighting)
- Attention is a limited resource that depletes

**Attentional Capture**
Some stimuli grab attention involuntarily:
- Sudden onset
- Motion
- High contrast
- Personal relevance (your name, faces)

Design implication: Use attention capture sparingly; it's powerful but disruptive.

**Divided Attention**
- Possible for low-demand tasks
- Impossible for high-demand tasks
- Talking while driving degrades both
- "Multitasking" is rapid task-switching with costs

Design implication: Don't require attention in multiple places simultaneously.

## Memory Systems

### Sensory Memory
- **Iconic** (visual): ~250ms, high capacity
- **Echoic** (auditory): ~3-4 seconds

Design implication: Brief exposures can be processed if attention follows quickly.

### Working Memory (Baddeley)

**Components:**
- **Phonological loop**: Verbal/acoustic information (~2 seconds without rehearsal)
- **Visuospatial sketchpad**: Visual and spatial information
- **Central executive**: Attentional control
- **Episodic buffer**: Integration across modalities

**Capacity**: 4±1 chunks (Cowan), not 7±2 (that's short-term memory slots)

**Chunking**: Meaningful groups expand effective capacity. "FBI-CIA-IBM" = 3 chunks, not 9 letters.

Design implication:
- Don't exceed 4 items for active manipulation
- Support chunking through meaningful grouping
- Externalize memory when possible (show, don't require recall)

### Long-Term Memory

**Types:**
- **Episodic**: Personal events (what you had for breakfast)
- **Semantic**: Facts and knowledge (Paris is in France)
- **Procedural**: Skills and how-to (riding a bike)

**Encoding:**
- Depth of processing matters (Craik & Lockhart)
- Elaboration strengthens encoding
- Emotional events are remembered better
- Spacing effect: Distributed practice > massed practice

**Retrieval:**
- Cue-dependent: Context aids recall
- Reconstruction: Memory is not playback, it's reconstruction
- False memories are possible and common

Design implication:
- Recognition is easier than recall
- Consistent contexts aid retrieval
- Don't assume users remember accurately

### Prospective Memory
Remembering to do something in the future.

- Event-based: "When I see the store, buy milk"
- Time-based: "At 3pm, call the doctor"

Both are unreliable without external cues.

Design implication: Don't rely on users remembering future actions. Remind them.

## Decision Making

### Dual Process Theory (Kahneman)

**System 1:**
- Fast, automatic, effortless
- Associative, intuitive
- Parallel processing
- Emotional, stereotyping
- Always running

**System 2:**
- Slow, deliberate, effortful
- Rule-based, analytical
- Serial processing
- Logical, calculating
- Lazy, avoids engagement

Design implication: Most interface use is System 1. Design for intuition, not analysis.

### Heuristics and Biases

**Availability Heuristic**
Judging probability by ease of recall.
- Recent events seem more likely
- Vivid events seem more likely
- If I can think of examples, it must be common

**Representativeness Heuristic**
Judging probability by similarity to prototype.
- Base rate neglect
- Conjunction fallacy
- Hot hand fallacy

**Anchoring**
Initial values bias subsequent estimates.
- Even arbitrary anchors influence judgment
- Adjustment is insufficient
- First numbers seen matter

**Loss Aversion**
Losses loom larger than gains (~2x).
- We prefer avoiding losses to acquiring gains
- Endowment effect: We overvalue what we have
- Status quo bias: Change feels like loss

**Framing Effects**
How options are presented changes choices.
- "90% survival" vs "10% mortality"
- Gain frame vs loss frame
- Default options strongly influence choice

Design implication: You're always framing. Do it intentionally and ethically.

### Choice Architecture (Thaler & Sunstein)

- **Defaults matter**: Most people stick with defaults
- **Expect error**: Design for mistakes
- **Give feedback**: Show consequences of choices
- **Map complex choices**: Make comparison easier
- **Structure complex choices**: Break down, sequence, categorize
- **Incentives**: Make costs and benefits salient

## Learning and Expertise

### Skill Acquisition (Fitts & Posner)

**Stages:**
1. **Cognitive**: Deliberate, error-prone, attention-demanding
2. **Associative**: Patterns forming, errors decreasing
3. **Autonomous**: Automatic, parallel, attention-free

Design implication: Interface should support all stages, not optimize for just one.

### Deliberate Practice (Ericsson)
- Not just repetition—focused improvement
- Immediate feedback essential
- Pushing beyond comfort zone
- 10,000 hours is oversimplified but directionally correct

### Transfer of Learning
- Near transfer: Similar contexts (easier)
- Far transfer: Different contexts (harder, rarer)
- Expertise is often surprisingly domain-specific
- Abstract principles transfer better than specific procedures

### Expert Blindness (Curse of Knowledge)
Experts forget what it's like not to know.
- Hard to predict novice confusion
- Obvious to expert ≠ obvious to novice
- Jargon becomes invisible

Design implication: Always test with actual novices.

## Language and Communication

### Language Processing

**Reading:**
- Skilled readers process word shapes, not letters
- Eye movements: Fixations (~250ms) and saccades
- Predictable words processed faster
- Context enables prediction

**Comprehension:**
- Proposition-based, not word-based
- Inference-dependent
- Schema-driven (we fill in gaps)
- Limited by working memory

Design implication: Write for scanning, not reading. Use predictable structures.

### Pragmatics (Grice)

**Cooperative Principle—speakers assume:**
- **Quality**: Truth
- **Quantity**: Right amount of information
- **Relation**: Relevance
- **Manner**: Clarity

Violating these creates confusion or implies hidden meaning.

Design implication: Error messages and instructions should follow these maxims.

### Ambiguity
- Lexical: "Bank" (river or financial)
- Syntactic: "Flying planes can be dangerous"
- Referential: "Put it there" (what? where?)

Design implication: Be explicit. Context doesn't always disambiguate.

## Reasoning and Problem Solving

### Mental Models (Johnson-Laird)
- We simulate scenarios mentally
- Models are incomplete and biased
- We consider few alternatives
- Counterexamples are hard to generate

Design implication: Support exploration of alternatives. Don't rely on users imagining them.

### Confirmation Bias
We seek evidence that confirms our beliefs.
- Selective search
- Selective interpretation
- Selective recall

Design implication: Present disconfirming information actively; users won't seek it.

### Problem Solving

**Means-Ends Analysis:**
- Identify difference between current and goal state
- Find operator to reduce difference
- Apply and repeat

**Functional Fixedness:**
We see objects in their typical functions only.

**Set Effects:**
Past solutions bias current approaches (Einstellung effect).

Design implication: Prior experience both helps and constrains. Consider fresh perspectives.

## Emotion and Motivation

### Affect and Cognition

**Emotional processing:**
- Faster than cognitive evaluation
- Influences attention, memory, decision-making
- "How do I feel about it?" is a valid heuristic

**Mood congruence:**
- We remember mood-congruent information
- We make mood-congruent judgments
- Positive mood → broader thinking
- Negative mood → narrower, analytical thinking

Design implication: Emotional responses to interfaces are legitimate data.

### Motivation

**Intrinsic vs. Extrinsic:**
- Intrinsic: Activity is its own reward
- Extrinsic: Activity serves external goal
- Overjustification: External rewards can undermine intrinsic motivation

**Self-Determination Theory** (Deci & Ryan):
- **Autonomy**: Control over one's actions
- **Competence**: Feeling effective
- **Relatedness**: Connection to others

Design implication: Support autonomy and competence; don't just add rewards.

### Flow (Csikszentmihalyi)
Optimal experience when:
- Challenge matches skill
- Clear goals
- Immediate feedback
- Deep concentration
- Loss of self-consciousness
- Altered sense of time

Design implication: Match difficulty to user skill level. Enable focus.

## Embodied Cognition

### Mind-Body Connection
Cognition is not just in the head:
- Bodily states influence judgment (warm cup → warm feelings)
- Gestures aid thinking (not just expression)
- Physical manipulation aids understanding
- Spatial metaphors are grounded in physical experience

### Extended Mind (Clark & Chalmers)
Cognition extends into the environment:
- Notebook as memory
- Calculator as arithmetic
- Interfaces as cognitive tools

Design implication: Interfaces are cognitive extensions. Design them as such.

### Situated Cognition
Thinking happens in context:
- Environment provides cues and scaffolding
- Knowledge is often tied to situations
- Transfer requires abstraction

Design implication: Consider the context of use, not just the interface in isolation.

## Individual Differences

### Cognitive Abilities
- Working memory capacity varies
- Processing speed varies
- Spatial ability varies
- These affect learning and performance

### Cognitive Styles
- Field dependent/independent
- Verbal/visual preference
- Holistic/analytic processing
- Styles are preferences, not fixed traits

### Age-Related Changes
- Processing speed decreases
- Working memory capacity decreases
- Crystallized knowledge increases
- Expertise can compensate for decline

### Accessibility Considerations
- Cognitive load affects everyone, some more than others
- Attention disorders, learning differences, cognitive impairments
- Design for the margins; everyone benefits

Design implication: Don't assume a single cognitive profile. Design for variability.
