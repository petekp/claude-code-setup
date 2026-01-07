---
description: Deep codebase analysis to build authoritative understanding for confident collaboration
argument-hint: [optional focus area or specific questions]
---

# Deep Codebase Analysis

You are about to perform a systematic, thorough analysis of this codebase. Your goal is to build such deep understanding that you can confidently collaborate on modifications, anticipate ripple effects, and make architectural decisions aligned with existing patterns.

## Analysis Protocol

Execute these phases methodically. Do not rush. Read actual code, not just descriptions.

### Phase 1: Structural Reconnaissance

**1.1 Project Identity**
- Identify the project type (web app, CLI, library, desktop app, etc.)
- Read all README files, CLAUDE.md, and documentation at root level
- Identify the primary language(s) and framework(s)
- Locate and parse all configuration files (package.json, Cargo.toml, pyproject.toml, etc.)

**1.2 Directory Architecture**
- Map the top-level directory structure and purpose of each directory
- Identify separation of concerns (frontend/backend, src/tests, core/plugins, etc.)
- Note any monorepo structure or workspace organization
- Locate build outputs and generated directories (dist/, target/, node_modules/, etc.)

**1.3 Entry Points**
- Find all entry points (main.ts, main.rs, index.js, app.py, etc.)
- Trace the application bootstrap sequence
- Identify configuration loading order
- Map how dependencies are initialized

### Phase 2: Architectural Deep Dive

**2.1 Core Abstractions**
- Identify the fundamental data structures/types/interfaces
- Map the domain model (what entities exist and how they relate)
- Find core abstractions and their implementations
- Note any type system patterns (generics, traits, interfaces)

**2.2 Module Boundaries**
- Map how code is organized into modules/packages/crates
- Identify public APIs vs internal implementation
- Trace import/dependency graphs between modules
- Note circular dependencies or tight coupling

**2.3 Data Flow**
- Trace how data enters the system (user input, API calls, file reads)
- Map transformations data undergoes
- Identify where state is stored and managed
- Trace how data exits (renders, API responses, file writes)

**2.4 Control Flow**
- Map the main execution paths
- Identify event handlers, hooks, and callbacks
- Trace async/concurrent patterns
- Note error handling strategies

### Phase 3: Pattern Recognition

**3.1 Architectural Patterns**
- Identify architectural style (MVC, MVVM, Clean Architecture, etc.)
- Note component patterns (composition, HOCs, mixins, etc.)
- Map state management approach
- Identify IPC/communication patterns

**3.2 Code Conventions**
- Note naming conventions (casing, prefixes, suffixes)
- Identify file organization patterns
- Map error handling conventions
- Note logging and debugging patterns

**3.3 Testing Patterns**
- Identify test organization and naming
- Note mocking/stubbing strategies
- Map integration vs unit test boundaries
- Find test utilities and helpers

### Phase 4: Dependency Mapping

**4.1 External Dependencies**
- Catalog key dependencies and their purposes
- Identify version constraints and why they matter
- Note any vendored or patched dependencies
- Map dependency injection patterns

**4.2 Internal Dependencies**
- Build a mental graph of which modules depend on which
- Identify highly depended-upon modules (core, utils, types)
- Note feature flags or conditional compilation
- Map plugin/extension points

### Phase 5: Critical Paths

**5.1 Hot Paths**
- Identify performance-critical code paths
- Note caching strategies
- Map database/API call patterns
- Find rate limiting or throttling

**5.2 Security Boundaries**
- Identify authentication/authorization checkpoints
- Note input validation patterns
- Map sensitive data handling
- Find security-critical code sections

**5.3 Failure Modes**
- Identify error recovery strategies
- Note graceful degradation patterns
- Map retry/fallback logic
- Find potential failure points

### Phase 6: Synthesis

After completing analysis, produce:

**Mental Model Summary**
- A clear, concise description of what this codebase does and how
- The key architectural decisions and why they were likely made
- The most important files/modules to understand
- Common modification patterns (where to add X, how to change Y)

**Confidence Assessment**
- Areas where understanding is solid
- Areas that need more investigation
- Questions that remain unanswered
- Recommendations for further exploration

**Modification Guidelines**
- How to add new features (typical patterns)
- How to modify existing behavior (what to update)
- What tests need to run after changes
- Common pitfalls to avoid

## Focus Area

$ARGUMENTS

---

## Execution

Begin Phase 1 now. Use file exploration tools extensively. Read actual source files—don't rely on assumptions. Take notes as you go. Ask clarifying questions if the codebase structure is unusual.

When complete, you should be able to:
- Explain the codebase to someone unfamiliar with it
- Predict where to make changes for any given feature request
- Anticipate side effects of modifications
- Suggest improvements aligned with existing patterns

Start your analysis.
