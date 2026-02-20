# Evidence-Based Pedagogy for Codebase Learning

Research basis for the techniques used in this skill. Consult when deciding how to structure content or when the rationale for a specific technique is needed.

## Highest-Impact Techniques

### Retrieval Practice (Testing Effect)
**Evidence:** High utility, d = 0.5-0.7 (Dunlosky et al., 2013). Actively retrieving information from memory strengthens it more than re-studying.

**In study guides:** Include prediction prompts ("before reading the next section, try to sketch how you think X works") and self-test questions ("without looking, name the 3 systems that handle Y"). These force retrieval, not recognition.

### Spaced Practice
**Evidence:** High utility, d = 0.5-0.8+ (Dunlosky et al., 2013). Most robust finding in experimental psychology.

**In study guides:** Structure guides for multiple sessions. Include "come back tomorrow and try to reconstruct the system map from memory" prompts. Never design a guide intended to be consumed in one sitting for a complex codebase.

### Elaborative Interrogation
**Evidence:** Moderate utility, d = 0.56-0.59 (meta-analysis, 304 studies). Asking "why does this work this way?" produces significantly better learning than passive reading. Effects are strongest when questions are specific and the learner has some prior knowledge to connect to.

**In study guides:** Every non-obvious design decision should have an explicit "why" question. Not "what does this do?" but "why was this designed this way rather than [obvious alternative]?" The specificity of the question is critical.

### Self-Explanation Effect (Chi, 1989)
**Evidence:** Moderate utility, g = 0.55 (Rittle-Johnson & Loehr meta-analysis). In programming specifically, skill improvement correlates strongly with amount of self-explanation generated (Pirolli & Recker).

**In study guides:** Prompt readers to explain code blocks to themselves: "pause and explain (1) what this block accomplishes, (2) why it's needed here, and (3) how it connects to the previous section."

### Concept Mapping (Novak; Ausubel)
**Evidence:** ES = 0.63-0.78 across meta-analyses. Creating maps (g = 0.72) is significantly more effective than studying existing maps (g = 0.43).

**In study guides:** Include a system map diagram, but also prompt readers to create their own before looking at it. The act of creating forces identification of entities, relationships, and hierarchy — exactly the schema construction that produces learning.

### Worked Example Effect
**Evidence:** g = 0.48 (2023 meta-analysis, 43 articles). Originally validated using programming tasks (Sweller). Novices studying worked examples learn more than those doing equivalent problem-solving, because examples free cognitive resources from means-ends analysis for schema acquisition.

**In study guides:** Include annotated code walkthroughs of representative operations — complete chains showing trigger, investigation path, code changes, and reasoning at each step. These are more valuable than architecture descriptions for building executable understanding.

## Structural Frameworks

### Cognitive Load Theory (Sweller, 1988)
Working memory holds ~4 novel chunks simultaneously. Learning fails when intrinsic + extraneous load exceeds capacity. Schema acquisition in long-term memory is the mechanism that bypasses this limit.

**Implications:**
- Never introduce more than one unfamiliar subsystem per section
- Co-locate related information (avoid split-attention: don't make readers cross-reference multiple files)
- Sequence content to build schemas incrementally — each section should add to, not replace, the reader's mental model

### Threshold Concepts (Meyer & Land, 2003)
Ideas that are transformative, irreversible, integrative, and troublesome. In CS: pointers, recursion, state mutation, abstraction, polymorphism. Every codebase has its own threshold concepts — the "aha" moments that make everything cohere.

**Implications:** Identify and front-load the 2-3 codebase-specific threshold concepts. Until readers cross these thresholds, individual code patterns feel disconnected. After crossing, they cohere.

### Zone of Proximal Development / Scaffolding (Vygotsky; Bruner)
Learning is most effective when pitched between "can do independently" and "can do with guidance." Provide support structures, then gradually remove them ("fading").

**Implications:** The guide's progression should scaffold then fade:
1. Guided walkthrough with full annotations (heavy scaffolding)
2. Partially annotated exploration with questions (medium scaffolding)
3. Independent investigation tasks with hints (light scaffolding)
4. Open-ended exploration challenges (no scaffolding)

### Dual Coding Theory (Paivio, 1971)
Two independent channels: verbal (text) and nonverbal (images/spatial). Information encoded in both channels is recalled ~2x better. Code is almost exclusively verbal.

**Implications:** Pair every textual explanation with a diagram. Architecture maps, data flow diagrams, sequence diagrams, entity relationships. The translation from text to visual forces a second encoding pass and exposes comprehension gaps.

### PRIMM Framework (Sentance & Waite, 2017)
Five-stage progression: Predict -> Run -> Investigate -> Modify -> Make. Grounded in Vygotsky. Builds mental models before requiring production.

**Implications:** Exploration tasks should follow PRIMM: "predict what this function returns for input X" -> "run the test to check" -> "change the input and observe" -> "modify the function to handle edge case Y" -> "write a new function using the same pattern."

## Expert Comprehension Models

### Beacons (Brooks, 1983)
Experts recognize code features ("beacons") that trigger hypotheses about purpose. Seeing a retry loop with exponential backoff immediately signals "fault-tolerant external call."

**Implications:** Name patterns explicitly when they appear. Don't assume the reader will recognize them. "This is the Circuit Breaker pattern" with a link is more valuable than a paragraph of description.

### Plans and Discourse Rules (Soloway & Ehrlich, 1984)
Expert programmers use stereotypical code patterns ("plans") and conventions ("discourse rules") for top-down comprehension. Experts build a goal hierarchy and decompose.

**Implications:** The study guide should make the codebase's "plan library" explicit — the recurring patterns, conventions, and idioms. Name them, show examples, explain when each is used.

### Block Model (Schulte, 2008)
Two-dimensional: scope (atom -> block -> relation -> macro) x dimension (text surface -> execution -> function/purpose). Comprehension requires navigating all levels.

**Implications:** Don't stay at one level. For each module: show the code (text surface), trace execution (runtime behavior), and explain purpose (why it exists). Move from macro to blocks to atoms, not the reverse.
