---
name: architecture-scaffold
description: >
  Build a compilable type-level skeleton from a high-level architecture spec before writing any
  implementation logic. Use when you have an architectural assessment, design doc, or restructuring
  plan and need to prove the new architecture is sound before migrating code. Also use when asked to
  "scaffold the new architecture", "create type stubs", "build the shell", "flesh out this spec",
  "skeleton the modules", or any request to turn architectural intent into verified structure. This
  skill follows the "Human Builds the Shell" paradigm: types are hard constraints that the compiler
  enforces, so if the skeleton compiles, the architecture is structurally sound. Especially valuable
  for large refactors where you don't trust agents to maintain coherence.
license: MIT
metadata:
  author: petekp
  version: "0.1.0"
---

# Architecture Scaffold

Turn a high-level architecture spec into a compilable type skeleton, then prove it's sound with the compiler before anyone writes a line of logic.

## Why This Exists

Large refactors fail when agents jump straight to implementation. They lose the thread, make local decisions that contradict the global design, and you end up with a different mess than the one you started with. The "Human Builds the Shell" paradigm (Mengdi Chen, 2026) solves this by separating structure from logic:

1. **Types** are hard constraints — the compiler rejects violations at build time
2. **Tests** are behavioral verification — they confirm what the code does at runtime
3. **Specs** are soft guidance — they inform but can't enforce

This skill operates at layer 1. By the time you're done, every module, every function signature, every protocol/trait, and every type relationship exists as real code that the compiler has verified. No logic yet — just the architectural skeleton. An agent literally cannot hallucinate past a compiler error.

## The Three Phases

### Phase 1: Extract the Target Architecture
Read the spec. Produce a structured outline of every module, type, and signature.

### Phase 2: Build the Skeleton
Write real source files with real types and stub bodies. Compile layer by layer until it all passes.

### Phase 3: Map the Old Codebase
For each stub, determine whether existing logic can be ported or needs rewriting.

---

## Phase 1: Extract the Target Architecture

Read the assessment or design document the user provides. You're looking for:

- **Modules/components** — what are the new architectural units?
- **Responsibilities** — what does each unit own?
- **Types** — what data structures cross boundaries?
- **Dependencies** — which modules depend on which? What's the dependency direction?
- **Boundaries** — where are the hard seams? (FFI, network, persistence, framework edge)

Produce a **module map** — a structured outline that captures this. Don't write code yet. The module map is your intermediate representation between the prose spec and the code skeleton.

```markdown
# Module Map

## Layer 1: Domain Types (innermost — no dependencies on other project modules)

### module: domain
Location: core/capacitor-core/src/domain/
Responsibility: Shared value types, identities, and enums used across all modules
Types:
  - Project { id, name, path, ... }
  - RuntimeSnapshot { active_project, hooks, timestamp, ... }
  - HookEvent (enum: session_start, session_end, tool_use, ...)
Dependency rule: This module imports nothing from the project. Everything else may import this.

## Layer 2: Service Contracts (depend only on domain types)

### module: RuntimeEngine
Location: core/capacitor-core/src/runtime/
Responsibility: Core runtime lifecycle — start, stop, snapshot reads
Dependencies: domain (inward only)
Exposes:
  - RuntimeEngine (protocol/trait)
    - start(config: RuntimeConfig) -> Result<(), RuntimeError>
    - stop() -> Result<(), RuntimeError>
    - current_snapshot() -> RuntimeSnapshot
Types:
  - RuntimeConfig { storage_path, poll_interval, ... }
  - RuntimeError (enum: already_running, storage_unavailable, ...)

### module: SetupService
Location: core/capacitor-core/src/setup/
Responsibility: First-run and configuration workflows
Dependencies: domain (inward only)
Exposes:
  - SetupService (protocol/trait)
    - validate_setup() -> SetupStatus
    - perform_setup(config: SetupConfig) -> Result<(), SetupError>
...

## Layer 3: FFI Boundary (translates between layers)

### module: ffi
Location: core/capacitor-core/src/ffi/
Responsibility: Expose Rust services to Swift via C-compatible interface
Dependencies: Layer 2 services, domain types
Boundary types (must be repr(C) or serializable):
  - FFIRuntimeConfig, FFIRuntimeSnapshot, ...
Binding mechanism: [cbindgen / uniffi / manual C headers — match what the project uses]

## Layer 4: Swift Application Layer (outermost — depends on FFI)

### module: RuntimeSupervisor
Location: apps/swift/Sources/Capacitor/Services/RuntimeSupervisor.swift
...
```

### Dependency rules

The module map must declare explicit dependency rules per layer. These become enforceable constraints during verification:

```
Layer 1 (domain)     → imports nothing from the project
Layer 2 (services)   → imports only Layer 1
Layer 3 (FFI)        → imports Layers 1 and 2
Layer 4 (Swift app)  → imports only Layer 3's public interface
```

These rules are what prevent the architecture from drifting back to spaghetti. Write them down. They'll be verified mechanically in Phase 2.

### The level of detail matters

Each function signature should include parameter names, parameter types, and return types. If the assessment doesn't specify them, infer them from the described responsibilities and the existing codebase. Flag anything you're uncertain about — the user should confirm before you proceed to code.

### Handling ambiguity

The assessment will inevitably leave gaps. Common ones:

- **Error types** — the spec says "extract SetupService" but doesn't say what errors it can produce. Look at the existing code to see what errors the current implementation handles, and design the error enum from that.
- **Shared types** — two modules both need access to `Project`. Where does the type live? In the domain layer that both depend on (dependency points inward).
- **Boundary data** — what crosses the FFI or persistence boundary? These types need to be serializable. Flag them explicitly.

When in doubt, ask the user. A five-second clarification now prevents an hour of rework later.

### Leverage the assessment's existing references

If the assessment names specific files, functions, and line numbers (and a good one will), use those as anchors when inferring signatures. Don't search the codebase from scratch when the assessment already points you to `CoreRuntime.initialize()` in `lib.rs:276`. Read what's there and design the new signature from it.

### Present the module map for sign-off

Show the module map to the user before writing any code. They should confirm:
- The modules cover all the assessment's recommendations
- The dependency directions are correct
- The file/directory placement makes sense for the project
- Nothing critical is missing
- The granularity feels right (not too many tiny modules, not too few bloated ones)

---

## Phase 2: Build the Skeleton

Now you write real code. Every module, every type, every function signature — but no implementation logic. Bodies are stubs.

### Create a working branch

```
git checkout -b architecture-scaffold
```

### File placement

Where new files go matters — it determines the module graph. Follow these principles:

- **New modules get new files/directories**, not insertions into existing files. If you're splitting `CoreRuntime` into `RuntimeEngine` + `SetupService`, create `src/runtime/mod.rs` and `src/setup/mod.rs` — don't try to carve them out of `lib.rs` yet.
- **The module map's "Location" field is the source of truth.** You decided on placement in Phase 1; now execute it.
- **Old files stay untouched for now.** The skeleton lives alongside the existing code. Don't delete or modify old code — that's the migration phase's job.
- **Update module declarations** (Rust `mod` statements, Swift package targets) so the compiler sees the new files.

### Scaffold layer by layer

Don't write all the skeleton files at once and then compile. Build from the inside out, compiling at each layer. This keeps errors localized and prevents cascading failures.

**Step 1: Domain types (Layer 1)**
Write the shared types — structs, enums, type aliases. Compile.
These have no dependencies, so if they don't compile, it's a self-contained problem.

**Step 2: Service contracts (Layer 2)**
Write the protocols/traits and their associated types. Write stub implementations. Compile.
If this fails, it's either a bad import (trivial) or a type mismatch with the domain layer (architectural — see below).

**Step 3: FFI boundary (Layer 3)**
Write the FFI types and the translation layer between Rust services and Swift. This layer must use whatever binding mechanism the project already uses (cbindgen, uniffi, manual C headers, etc.). Compile both sides — Rust and Swift — and verify the generated bindings match.

**Step 4: Swift application layer (Layer 4)**
Write the Swift protocols, stub implementations, and any SwiftUI-facing types. Compile.

### Language-specific patterns

See `references/language-patterns.md` for full examples in Swift, Rust, and TypeScript. The key pattern is the same everywhere: define the contract (protocol/trait/interface), define all types with all fields, and provide a stub implementation that compiles but panics if called (`fatalError` in Swift, `todo!()` in Rust, `throw new Error` in TypeScript).

### What goes in the skeleton

**Include:**
- All protocols/traits with full method signatures
- All structs, enums, and type aliases with all fields/variants
- Stub implementations of every protocol/trait (so the compiler can verify conformance)
- Module declarations and import/export structure
- Public API surface for each module
- FFI boundary types AND the binding layer (headers, uniffi definitions, etc.)

**Exclude:**
- Any actual business logic
- Test files (those come later, during the migration phase)
- Configuration files, build scripts, CI — unless the new architecture requires structural changes to these

### Responding to compiler errors

Not all compiler errors are equal. Distinguish between two kinds:

**Incidental errors** — typos, missing imports, forgotten visibility modifiers, a type name that doesn't match between declaration and use. Fix these immediately and recompile. They're noise.

**Architectural signals** — these mean the module map is wrong:
- **Circular dependency between modules** → the module boundaries are drawn wrong. Stop. Go back to the module map. Restructure until the dependency graph is a DAG.
- **Type mismatch at a boundary** → the two sides of a seam disagree on what data crosses it. This is a design flaw, not a code flaw. Resolve which side is right, update the module map, then fix the code.
- **A protocol/trait that can't be implemented without reaching into another module's internals** → the abstraction boundary is in the wrong place. The responsibility probably needs to move.

When you hit an architectural signal: stop compiling, update the module map, get user sign-off if the change is significant, then resume. Don't patch around the problem to make the compiler happy — that's how the mess started.

### Verifying dependency direction

After the skeleton compiles, verify that the declared dependency rules hold. For each layer:

**Rust:** Grep `use` statements in each module directory. Every `use crate::...` path should only reference modules in the same or lower layers.
```bash
# Example: verify Layer 2 modules only import from Layer 1
grep -rn "use crate::" core/capacitor-core/src/runtime/ | grep -v "domain"
# Should return nothing — any hit is a dependency violation
```

**Swift:** Check import statements. Swift modules should only reference their declared dependencies.

If violations are found, they're architectural flaws. Fix the module map, not the imports.

### Soundness criteria

The skeleton is "sound" when:
- The build passes with zero errors at every layer
- Every module's public API is fully typed
- Every protocol/trait has at least one stub implementation
- Dependency direction has been mechanically verified (grep check above)
- FFI boundary types are defined on both sides and the binding layer compiles

Record the verification result:

```markdown
## Skeleton Verification
- Rust (cargo check): PASS
- Swift (swift build): PASS
- FFI bindings: PASS (generated headers match Swift imports)
- Dependency direction: PASS (no violations found)
- Module count: 8 (4 Rust, 4 Swift)
- Protocol/trait count: 6
- Stub implementation count: 6
- FFI boundary types: 12 shared types verified
```

---

## Phase 3: Map the Old Codebase

With a proven skeleton in hand, you now go back to the existing code and create a precise mapping: for each stub in the new architecture, where does the logic come from?

### Start from the assessment's references

If the assessment names specific files, functions, and line numbers — use them. Don't re-search the codebase for things the assessment already located. For example, if the assessment says `CoreRuntime.initialize()` in `lib.rs:276-340` handles startup, that's your anchor for mapping `RuntimeEngine.start()`.

For stubs where the assessment doesn't point to specific code, then search the existing codebase by responsibility.

### The migration manifest

Create `migration-manifest.md` in the project root:

```markdown
# Migration Manifest

Source assessment: [path to assessment]
Skeleton branch: architecture-scaffold
Generated: [date]

## RuntimeEngineImpl

### start(config:)
- **Source:** `CoreRuntime.initialize()` in `core/capacitor-core/src/lib.rs:276-340`
- **Action:** PORT
- **Confidence:** HIGH
- **Notes:** Currently also does setup validation; that moves to SetupService.
  Signature change: takes RuntimeConfig instead of raw path + options.

### stop()
- **Source:** `CoreRuntime.shutdown()` in `core/capacitor-core/src/lib.rs:342-380`
- **Action:** PORT
- **Confidence:** HIGH
- **Notes:** Straightforward extraction, no entangled dependencies.

### currentSnapshot()
- **Source:** `CoreRuntime.get_snapshot()` in `core/capacitor-core/src/lib.rs:382-395`
- **Action:** ADAPT
- **Confidence:** HIGH
- **Notes:** Remove the global state bypass that check_hook_health uses.
  The function is simple, but it currently reads from a global rather than
  the instance's storage — that's the adaptation.

## SetupServiceImpl

### performSetup(config:)
- **Source:** `CoreRuntime.run_setup()` + `CoreRuntime.validate_config()`
- **Action:** REWRITE
- **Confidence:** MEDIUM
- **Notes:** Logic is scattered across the god object and interleaved with
  runtime concerns. Gather requirements from both sources but write fresh.
  Pay attention to the error handling in validate_config — it has edge cases
  the rewrite needs to preserve.
```

### Action categories

For each stub, assign exactly one action:

- **PORT** — The existing logic does what the new signature needs. Extract it, adapt the signature, move it. The logic itself is sound.
- **ADAPT** — The existing logic is mostly right but needs non-trivial changes to fit the new architecture (e.g., removing a dependency on global state, splitting a function that does two things).
- **REWRITE** — The existing logic is too entangled, too different in shape, or simply wrong. Write fresh logic guided by the old code as reference, not as source material.
- **NEW** — No existing logic covers this. It's a new capability the old architecture didn't have.
- **DELETE** — This existed in the old code but has no place in the new architecture. Confirm with the user that it's truly dead.

### Confidence levels

Rate your confidence in each mapping: HIGH, MEDIUM, or LOW.

- **HIGH** — The source location is clear, the logic is self-contained, the action is straightforward.
- **MEDIUM** — The source is identifiable but the logic has dependencies or side effects that need careful handling.
- **LOW** — You're not sure this is the right source, or the logic is so entangled that the action classification might be wrong.

LOW-confidence mappings should be flagged for the user to review. They're the ones most likely to cause problems during migration.

### Present the manifest for review

Show the migration manifest to the user. Key things they should check:
- Are the PORT vs REWRITE judgments correct? (Users often know which parts of their codebase are trustworthy)
- Do the LOW-confidence mappings need investigation?
- Is anything missing from the mapping?
- Are the "DELETE" items truly dead?

---

## Output

When complete, the user has:

1. **A compilable type skeleton** on a branch — the target architecture as verified code
2. **A module map** — human-readable description of the architecture with dependency rules
3. **A migration manifest** — precise mapping from old code to new stubs with actions and confidence levels
4. **Compiler + dependency verification** — mechanical proof that the types fit together and dependencies flow correctly

These artifacts are the input to the next phase: actual implementation, either via the `architectural-refactor` skill or manual development. The skeleton branch becomes the target that all implementation work builds toward, and the migration manifest tells the agents exactly where to find the logic they need.

### Bridging to the `architectural-refactor` skill

If the user plans to use the `architectural-refactor` skill for execution, the migration manifest needs to be converted into that skill's format. Each stub mapping becomes a **chunk** in the refactor plan:

- **PORT** stubs become "extract and move" chunks (low risk, do these first)
- **ADAPT** stubs become "extract, modify, and move" chunks (medium risk)
- **REWRITE** stubs become "write new implementation" chunks (highest risk, do these last)
- **DELETE** items become cleanup chunks at the end
- **NEW** items become implementation chunks after the ports are done

Group related stubs into single chunks (e.g., all PORT stubs for one module = one chunk). Order by risk: PORT first, ADAPT second, REWRITE third. Each chunk's exit criteria should include the same compilation check used in Phase 2 — if the skeleton still compiles after filling in real logic, the architecture hasn't drifted.

## Guiding Principles

- **The compiler is the authority, not the agent.** If the agent says the architecture is sound but the compiler disagrees, the compiler wins. Always.
- **Types before logic.** Resist the urge to "just implement this one function real quick." The entire point is to validate structure independently of behavior.
- **Architectural errors are not compiler errors.** When the compiler reveals a structural problem (circular dep, boundary mismatch), go back to the module map. Don't patch the code to silence the compiler.
- **Precision over speed.** A vague migration manifest ("logic is somewhere in lib.rs") is worse than useless — it gives agents permission to guess. Be specific.
- **Ask early, ask often.** Every ambiguity resolved before code is written saves an order of magnitude of rework later. When the spec is unclear, stop and ask.
- **One direction through the pipeline.** Don't jump back to skeleton-writing while you're mapping. If the mapping reveals a skeleton flaw, go back to Phase 2 explicitly, fix the skeleton, recompile, then resume mapping.
