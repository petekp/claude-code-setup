# Analysis Checklists

Open only the sections that match the subsystem you are auditing.

## Cross-Cutting Checks

Apply these to almost every subsystem:

| Check | Question |
|---|---|
| Contract alignment | Does the implementation match tests, docs, types, and public promises? |
| Failure-path symmetry | Do error, retry, timeout, and cancellation paths preserve the same invariants as the happy path? |
| State transitions | Can the subsystem get stuck between states or expose partially updated state? |
| Privilege boundaries | Are permissions, auth, tenancy, and trust boundaries enforced consistently? |
| Observability | If this fails in production, would logs, metrics, or errors make the cause visible? |
| Drift | Are comments, docs, examples, and config names still true? |

## Stateful Systems

Use for files, databases, queues, caches, locks, and persistent state.

| Check | Question |
|---|---|
| Atomicity | Can partial writes corrupt or desynchronize state? |
| Concurrency | Can overlapping operations cause duplicate work or stale reads? |
| Cleanup | Are resources released on success, failure, timeout, and panic? |
| Recovery | After a crash or restart, can the system recover to a valid state? |
| Idempotence | Are retries safe, or do they duplicate side effects? |
| Migration safety | Do format or schema changes leave old data unreadable or misinterpreted? |

## APIs And Network

Use for HTTP, RPC, WebSocket, webhook, or IPC boundaries.

| Check | Question |
|---|---|
| Input validation | Are malformed or out-of-range inputs rejected before side effects happen? |
| Authentication and authorization | Are caller checks applied consistently on all entrypoints? |
| Error handling | Do responses leak internals or hide important failure detail? |
| Timeouts and retries | Are remote calls bounded, and are retries safe? |
| Idempotence | Can duplicate requests create duplicate effects? |
| Serialization | Can malformed payloads, version drift, or encoding issues break parsing? |

## Concurrency

Use for async workflows, threads, background jobs, channels, and locks.

| Check | Question |
|---|---|
| Deadlock potential | Can lock ordering or await patterns block forever? |
| Shared state | Is shared mutable state synchronized correctly? |
| Shutdown | Are cancellation and shutdown paths clean and bounded? |
| Backpressure | Can unbounded queues, retries, or fan-out exhaust resources? |
| Task lifecycle | Are spawned tasks joined, cleaned up, or intentionally detached? |
| Panic isolation | Does one task failure crash unrelated work? |

## UI And Presentation

Use for views, components, templates, and client interaction layers.

| Check | Question |
|---|---|
| State consistency | Can the UI display stale, contradictory, or impossible state? |
| Error states | Are loading, empty, offline, and error states represented clearly? |
| Interaction correctness | Do user actions fire exactly once and on the right conditions? |
| Accessibility | Are keyboard, screen-reader, focus, and announcement paths preserved? |
| Subscription cleanup | Are listeners, observers, timers, or sockets cleaned up? |
| Contract drift | Does the UI still reflect what the backend or docs claim is possible? |

## Data Processing

Use for parsers, transformers, validators, and business rules.

| Check | Question |
|---|---|
| Boundary values | Are empty, null, max-size, duplicate, and malformed inputs handled? |
| Invariants | Are business rules enforced at the right boundary? |
| Encoding | Are text, locale, timezone, and Unicode assumptions consistent? |
| Numeric safety | Are overflow, rounding, precision, and unit conversions correct? |
| Injection | Can untrusted data escape into SQL, HTML, shell, regex, or templates? |
| Lossiness | Can transformations silently drop, reorder, or misclassify data? |

## Configuration And Setup

Use for environment loading, bootstrapping, flags, and initialization.

| Check | Question |
|---|---|
| Safe defaults | Are default values safe in production, not just locally? |
| Validation | Are invalid combinations rejected early with clear errors? |
| Secret handling | Are secrets protected from logs, commits, and client exposure? |
| Upgrade path | Do config or flag changes break existing deployments unexpectedly? |
| Initialization order | Can startup race with dependent services or incomplete state? |
| Feature flags | Can flag combinations enable unsupported states or stale code paths? |
