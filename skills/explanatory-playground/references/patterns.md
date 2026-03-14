# Explanatory Patterns

Choose only the patterns that directly answer the reader's questions. Every pattern should connect three things:
- a narrative claim
- supporting code or runtime evidence
- a small interaction that helps the reader verify the claim

## Table of Contents

1. Shared affordances
2. Request lifecycles and async workflows
3. State machines
4. Data flow and pipelines
5. Event systems
6. Render and update behavior
7. Algorithms and stepwise transforms

## 1. Shared Affordances

Use these across most artifacts:

- **Narrative rail**: prose next to the active visualization, not hidden below it
- **Source anchors**: links or badges for the owning file, symbol, or test
- **Scenario selector**: happy path, edge case, retry path, failure path
- **Timeline/history panel**: ordered events with timestamps or causal order
- **Before/after inspector**: state or payload diffs
- **Evidence badges**: label whether a fact comes from source, test, runtime, or inference
- **Read next**: a ranked list of the next files worth opening in the real codebase

If you need a common event shape for traces, use something like:

```ts
type TraceEvent = {
  at: number;
  kind: string;
  label: string;
  source?: { file: string; symbol?: string };
  before?: unknown;
  after?: unknown;
  detail?: unknown;
};
```

The exact fields can change. The important part is preserving causality, time, and source anchors.

When a hybrid scaffold exists, use `src/devtools/<topic>/trace.ts` as the normalization layer instead of creating ad hoc event shapes in each panel.

## 2. Request Lifecycles And Async Workflows

Use for API requests, loaders, jobs, queues, webhooks, or any multi-step orchestration.

**Reader questions**
- Where does the flow start?
- Which module owns each step?
- Where do retries, cancellation, or persistence happen?

**What to capture**
- start/end triggers
- ordered stages
- boundaries between orchestration and side effects
- retry, timeout, and error branches
- input and output payload snapshots

**Good layout**
- left: stepper or sequence diagram
- center: current payload/state snapshot
- right: code excerpt and file anchors for the active step

**Best interactions**
- step forward/backward
- replay a full request
- compare happy path vs failure path
- toggle a timeout or malformed payload

**Evidence to surface**
- route handlers
- service or orchestration layer
- persistence boundary
- test covering the main flow

## 3. State Machines

Use for auth flows, wizards, editors, multi-step forms, media players, or any stateful flow with discrete modes.

**Reader questions**
- What states exist?
- What causes transitions?
- Which transitions are blocked by guards?

**What to capture**
- all states
- transitions and triggering events
- current state
- transition history
- guard conditions and invariant failures

**Good layout**
- graph view for states and edges
- history panel for recent transitions
- inspector for the current context and allowed next moves

**Best interactions**
- trigger events manually
- scrub transition history
- force a blocked transition to show the guard

**Evidence to surface**
- reducer or machine definition
- guard logic
- state persistence or hydration logic

## 4. Data Flow And Pipelines

Use for normalization, parsing, enrichment, filtering, caching, indexing, or other transform-heavy systems.

**Reader questions**
- How does the data change shape?
- Which transform owns which responsibility?
- Where is information dropped, merged, or derived?

**What to capture**
- sources, transforms, and sinks
- payload shape at each stage
- derived values and lossy transformations
- timing between stages when relevant

**Good layout**
- directed pipeline diagram across the top
- inspector showing the active payload for the selected node
- diff panel comparing input vs output for a transform

**Best interactions**
- select a node to inspect payload and schema
- inject sample data at an intermediate stage
- compare two inputs through the same pipeline

**Evidence to surface**
- transform functions
- schema or type definitions
- fixtures proving normal and edge cases

## 5. Event Systems

Use for pub/sub architectures, DOM events, command buses, analytics fan-out, or internal event emitters.

**Reader questions**
- Who emits this event?
- Who handles it?
- In what order do side effects happen?

**What to capture**
- event types and payloads
- publishers and subscribers
- propagation order
- execution timing
- fan-out to multiple consumers

**Good layout**
- event timeline or swimlane view
- payload inspector
- subscriber list with execution order and duration

**Best interactions**
- fire a custom event
- filter by publisher, consumer, or event type
- compare two events that look similar but behave differently

**Evidence to surface**
- emitter sites
- subscriber registration
- side-effecting handlers
- analytics or logging assertions if they exist

## 6. Render And Update Behavior

Use for React render churn, state propagation, memoization questions, derived UI state, or animation frame issues.

**Reader questions**
- What re-rendered?
- Why did it re-render?
- Which state or prop change actually mattered?

**What to capture**
- component tree or ownership chain
- render/update causes
- prop or state diffs
- durations when performance matters

**Good layout**
- tree or flame view
- selected component inspector
- diff panel showing changed props/state

**Best interactions**
- filter to only changed nodes
- compare consecutive renders
- trigger the same user action with and without a flag or prop

**Evidence to surface**
- component files
- hook or store owners
- profiler data or local timing measurements

## 7. Algorithms And Stepwise Transforms

Use for sort/search logic, parsing, rule engines, layout calculations, scheduling, and any code where intermediate steps matter.

**Reader questions**
- What decision is the algorithm making at each step?
- What data is it looking at?
- Why did it choose this branch?

**What to capture**
- current step
- active data elements
- decision rationale
- counters or stats that explain progress
- final output and alternate outcomes

**Good layout**
- central structure view
- step controls and speed controls
- narrative log describing the active decision

**Best interactions**
- step forward/backward
- pause on branch decisions
- compare two input sets side by side

**Evidence to surface**
- the algorithm implementation
- fixtures covering interesting inputs
- assertions that encode invariants or expected output
