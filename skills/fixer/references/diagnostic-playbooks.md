# Diagnostic Playbooks

Detailed intervention strategies organized by failure category. Read the relevant section based on diagnosis from the triage phase.

## Table of Contents

1. [Agent Loop Failures](#agent-loop-failures)
2. [Architectural Rot](#architectural-rot)
3. [State and Environment Corruption](#state-and-environment-corruption)
4. [Specification and Requirements Drift](#specification-and-requirements-drift)
5. [Dependency and Integration Hell](#dependency-and-integration-hell)
6. [Context Window Exhaustion Patterns](#context-window-exhaustion-patterns)

---

## Agent Loop Failures

When the user has been going back and forth with an agent and the codebase is getting worse, not better.

### Symptoms
- Same error appearing repeatedly with slight variations
- Agent "fixes" that introduce new bugs equal to or worse than the original
- Circular changes: A→B→A→B
- Growing file sizes from accumulated band-aid patches
- Agent apologizing and trying again with the same approach

### Diagnosis Steps
1. Identify the **original** error or goal before the loop started
2. `git log --oneline -20` to see the churn pattern
3. Diff the current state against the last known-good commit
4. Identify which files have been modified most (these are the battleground)

### Interventions

**Hard Reset + Targeted Fix**
When the loop has caused more damage than progress:
1. Identify the last known-good state: `git log --oneline` and find the commit before the spiral
2. Create a safety branch: `git branch safety-backup`
3. Reset to the good state: `git checkout <good-commit> -- <affected-files>`
4. Restate the original problem clearly and narrowly
5. Apply a single, targeted fix with clear constraints

**Decompose the Problem**
When the agent is trying to solve too many things at once:
1. List every distinct issue in the current state
2. Order them by dependency (what must be fixed first?)
3. Fix each one in isolation with its own commit
4. Verify after each fix before moving to the next

**Constraint Injection**
When the agent keeps choosing wrong approaches:
1. Explicitly state what NOT to do (e.g., "Do not modify file X", "Do not add new dependencies")
2. Specify the exact files and functions to change
3. Provide the expected behavior as a concrete test case
4. Limit scope to the minimal change needed

---

## Architectural Rot

When the project structure has degraded through accumulated agent changes and no human would have designed it this way.

### Symptoms
- Duplicate or near-duplicate code across files
- Circular imports or tangled dependency chains
- God files that do everything (500+ line components, utility files that are half the app)
- Inconsistent patterns (some parts use one approach, others use another)
- Layers that bypass the intended architecture (UI code calling DB directly)

### Diagnosis Steps
1. Map the current module/file structure
2. Trace data flow for 2-3 key operations
3. Identify the intended architecture vs actual architecture
4. Find the specific points of divergence

### Interventions

**Architecture Snapshot**
Before fixing anything, document what exists:
1. List all modules/files with their responsibilities (actual, not intended)
2. Draw the dependency graph (which files import which)
3. Identify the 2-3 most critical data flows
4. Mark where the architecture violates its own patterns

**Incremental Realignment**
Fix architecture without a rewrite:
1. Pick the single worst violation
2. Create the correct structure alongside the incorrect one
3. Migrate callers one at a time
4. Delete the old structure
5. Commit and verify before moving to the next violation

**Fresh Module Extraction**
When a file has become a god object:
1. Identify the distinct responsibilities (usually 2-4)
2. Create new files for each responsibility
3. Move code with its tests
4. Update imports
5. Verify each step independently

---

## State and Environment Corruption

When the problem isn't the code but the environment, build system, or runtime state.

### Symptoms
- "Works on my machine" or "worked yesterday"
- Build errors that don't match the code
- Tests passing locally but failing in CI (or vice versa)
- Phantom errors that disappear and reappear
- Stale caches, lock files, or build artifacts causing issues

### Diagnosis Steps
1. Check for uncommitted changes: `git status`, `git diff`
2. Check environment: node version, python version, env vars
3. Check for stale artifacts: `node_modules`, `__pycache__`, `.next`, `dist`, `build`
4. Check lock file consistency: is the lock file committed? Does it match the manifest?
5. Check for port conflicts, running processes, or zombie servers

### Interventions

**Clean Slate Build**
1. Kill all related processes (dev servers, watchers, etc.)
2. Remove all build artifacts and caches
3. Remove and reinstall dependencies from lock file
4. Rebuild from scratch
5. If this fixes it, the problem was stale state — commit the fix and document

**Environment Isolation**
When the environment itself is the problem:
1. Document the exact versions of all tools (runtime, package manager, OS)
2. Compare against what the project expects (check CI config, `.tool-versions`, `engines` field)
3. Align or document the discrepancy
4. Consider adding a `.tool-versions`, `Dockerfile`, or `flake.nix` if none exists

---

## Specification and Requirements Drift

When what's being built no longer matches what should be built. Common after many agent sessions where each one slightly reinterprets the goal.

### Symptoms
- Features that nobody asked for
- The original goal is buried under accumulated scope
- Different parts of the app seem to be building toward different products
- User can't clearly articulate what the app should do anymore

### Diagnosis Steps
1. Ask: "In one sentence, what should this app do?"
2. List every feature/capability currently implemented
3. Mark each as: essential / nice-to-have / shouldn't-be-here
4. Identify what's missing that should exist

### Interventions

**Requirements Reset**
1. Write a clear, minimal spec (what does v1 actually need?)
2. Audit every file against the spec: does it serve the spec?
3. Create a cut list: features/code to remove or defer
4. Simplify to the essential path first, then layer back selectively

**Working Backwards from the User**
1. Describe the primary user flow in concrete steps
2. Trace that flow through the current code
3. Identify where the flow breaks, detours, or dead-ends
4. Fix the flow first, features second

---

## Dependency and Integration Hell

When packages, APIs, or integrations are the source of pain.

### Symptoms
- Version conflicts in dependencies
- API calls failing with unclear errors
- Type mismatches between what the code expects and what the API returns
- Authentication or configuration issues
- Breaking changes from dependency updates

### Diagnosis Steps
1. Identify the specific integration boundary that's failing
2. Test the integration in isolation (curl the API, import the package in a REPL)
3. Check version compatibility (dependency version vs docs version vs API version)
4. Read the actual error message carefully — LLMs often misinterpret API errors

### Interventions

**Isolation Testing**
1. Create a minimal reproduction: smallest possible code that hits the integration
2. Test outside the app context
3. Compare the working minimal version against the app's usage
4. The difference reveals the bug

**Version Pinning and Documentation**
1. Pin the exact version that works
2. Document the working configuration
3. Add integration tests that verify the connection
4. Treat external dependencies as untrusted — validate their outputs

---

## Context Window Exhaustion Patterns

When the agent has lost track of the project because conversations are too long or context has been compressed away.

### Symptoms
- Agent re-introduces bugs that were already fixed
- Agent forgets constraints stated earlier in conversation
- Suggestions conflict with decisions made earlier
- Agent doesn't remember what files exist or what they contain

### Interventions

**Start Fresh with a Brief**
1. Write a concise project brief covering: what the app does, current state, the specific problem
2. Start a new conversation with just this brief
3. Provide only the files directly relevant to the problem
4. Keep the conversation focused on one issue

**Create a CLAUDE.md or Project Context File**
1. Document key architectural decisions
2. Document known constraints and gotchas
3. Document the current state and what's in progress
4. This survives across conversations and prevents repeated mistakes

**Breadcrumb Strategy**
For multi-session work:
1. End each session by writing a handoff note: what was done, what's next, what to watch out for
2. Start next session by reading the handoff note
3. Keep a running log of decisions and their rationale
