# Trace Adapters

Use a trace adapter when the explanatory artifact needs runtime evidence, replay, or ordered causality. The adapter's job is to normalize whatever the system already emits into a small, explainer-friendly event stream.

## Table of Contents

1. What the adapter owns
2. Preferred event shape
3. Adapter patterns
4. Replay discipline
5. Good defaults

## 1. What The Adapter Owns

A trace adapter should answer:
- what just happened
- when it happened
- which module owned it
- what changed
- which scenario or branch it belongs to

It should not become a second implementation of the system. Keep it observational whenever possible.

## 2. Preferred Event Shape

Start from a normalized event like this:

```ts
type TraceEvent = {
  id: string;
  at: number;
  kind: string;
  label: string;
  scenarioId?: string;
  source?: {
    file: string;
    symbol?: string;
  };
  before?: unknown;
  after?: unknown;
  detail?: unknown;
  invariant?: string;
};
```

The hybrid scaffold writes this shape into `src/devtools/<topic>/trace.ts`.

## 3. Adapter Patterns

Choose the lightest adapter that preserves useful evidence:

- **Wrapper adapter**: wrap an existing function or service call and record inputs, outputs, and thrown errors.
- **Emitter adapter**: subscribe to an event emitter, command bus, or observable and translate payloads into `TraceEvent`s.
- **Reducer/store adapter**: record before/after state and the action that caused the transition.
- **Network adapter**: record request start, response, retries, failures, and payload snapshots.
- **UI interaction adapter**: capture the user action that starts the flow when that action matters for the story.

If the repo already has logs or telemetry, prefer transforming those instead of adding new instrumentation hooks.

## 4. Replay Discipline

Replay only the events that help the reader understand the system:
- happy path
- one or two edge cases
- one failure path when it teaches something important

Do not dump raw noisy logs into the explainer. Curate scenarios into short, intelligible sequences.

## 5. Good Defaults

When in doubt:
- store timestamps as epoch milliseconds
- include source file anchors whenever you can
- capture `before` and `after` only for state that matters to the explanation
- attach `scenarioId` so the reader can switch between traces cleanly
- name one invariant per event when that invariant is the point of the trace
