# Solution Map: CLI Plugin System for Third-Party Extensibility

## Paradigm 1: Convention-Based Discovery (The "oclif Model")
**Core bet:** Plugins are npm packages that follow a naming convention and directory structure. The CLI discovers them automatically — plugin authors trade flexibility for zero-configuration setup.

This paradigm treats plugins as structurally conventional npm packages. The CLI scans `node_modules` for packages matching a naming pattern (e.g., `mycli-plugin-*` or `@mycli/plugin-*`), reads a well-known entry point, and loads commands automatically. Think oclif, ESLint (legacy), or Gatsby. The plugin "API" is mostly convention — file names, export shapes, package.json fields — rather than explicit registration code.

### Approach 1a: Full oclif Adoption
- **How it works:** Build the CLI on top of oclif, inheriting its entire plugin infrastructure. Plugins are npm packages with an `oclif` field in package.json declaring commands and hooks. The CLI resolves plugins via `node_modules` scanning and loads them at startup. Commands extend oclif's `Command` base class and use decorators/static properties for argument definitions.
- **Gains:** Battle-tested plugin system (used by Heroku CLI, Salesforce CLI). Plugin installation/removal at runtime via `plugins:install`. Auto-generated help. Testing utilities. TypeScript support baked in.
- **Gives up:** Full control over the CLI's architecture. Locked into oclif's opinionated structure (class-based commands, specific directory layouts). Startup overhead: benchmarks show 85-135ms baseline for oclif vs 18-25ms for Commander.js. Tight coupling to oclif's release cycle and design decisions.
- **Shines when:** The team wants to ship fast and doesn't need novel CLI behavior. The plugin ecosystem is expected to be large and needs standardization.
- **Risks:** oclif's maintenance tempo has slowed; relying on it as a core dependency ties the project's future to Salesforce's OSS priorities. Escape hatch is expensive if oclif's opinions don't align with future needs.
- **Complexity:** simple (oclif handles everything, but you inherit its complexity budget)

### Approach 1b: Custom Convention-Based Discovery
- **How it works:** Build a bespoke convention system without oclif. Plugins are npm packages named `mycli-plugin-*`. Each plugin's package.json includes a `"mycli"` field pointing to a manifest of commands. At startup, the CLI scans `node_modules` for matching packages, reads their manifests, and lazily imports command modules only when invoked. Commands implement a `PluginCommand` TypeScript type (not class — just a plain object with `name`, `description`, `args`, `run`).
- **Gains:** Full control over the discovery mechanism and command shape. Can optimize for lazy loading (only pay the cost of plugins you actually invoke). Lightweight — no framework dependency. Can use plain objects instead of classes for commands, which is more idiomatic modern TypeScript.
- **Gives up:** Must build discovery, validation, error isolation, and help integration from scratch. No ecosystem of existing tools/patterns. The convention itself becomes a specification to maintain.
- **Shines when:** The team has strong opinions about CLI architecture that differ from oclif's, and wants full ownership. The plugin surface is narrow (just commands, not hooks/middleware).
- **Risks:** Underestimating the number of edge cases in plugin discovery (symlinks, monorepos, pnpm's flat vs hoisted modes, workspaces). The convention may need to evolve, and evolution is hard when third parties depend on it.
- **Complexity:** moderate

---

## Paradigm 2: Hook-Based Event System (The "webpack/tapable Model")
**Core bet:** The CLI emits lifecycle events, and plugins tap into those hooks. The plugin surface is defined by the set of hooks, not by conventions. This inverts control — the CLI tells plugins what's happening, and plugins decide what to do about it.

This paradigm treats the CLI as a pipeline of lifecycle events (init, parse, validate, execute, cleanup, error). Plugins register handlers ("taps") on these hooks. This is fundamentally different from Paradigm 1 because plugins don't just add commands — they can modify, intercept, or augment every phase of the CLI's execution. The canonical example is webpack's tapable system.

### Approach 2a: Tapable-Based Hook System
- **How it works:** Use the `tapable` npm package (or its TypeScript-native variant `tapable-ts`) to define a set of typed hooks on the CLI's core objects. For example: `compiler.hooks.beforeCommand.tapAsync('my-plugin', async (ctx) => { ... })`. Plugins register themselves by exporting an `apply(cli)` function that taps into whichever hooks they need. Commands themselves are registered via a dedicated `registerCommand` hook.
- **Gains:** Extremely flexible — plugins can modify any part of the CLI's behavior, not just add commands. Well-understood pattern (webpack's ecosystem proves it scales). Different hook types (sync, async, bail, waterfall, loop) enable different interaction patterns. TypeScript types can constrain what data flows through each hook.
- **Gives up:** Steep learning curve for plugin authors — they need to understand the hook taxonomy and lifecycle. Debug difficulty increases (execution flow is non-linear). Risk of "hook spaghetti" where plugins interfere with each other in unexpected ways. Tapable itself is a webpack-ecosystem library with limited documentation outside that context.
- **Shines when:** The CLI is complex enough that plugins need to modify behavior at many points, not just add commands. Think build tools, linters, bundlers — tools where the pipeline matters as much as the commands.
- **Risks:** Over-engineering for a CLI that primarily needs custom commands. The hook surface becomes an implicit API — adding, removing, or changing hook semantics is a breaking change. Debugging production issues with many tapped hooks is notoriously difficult.
- **Complexity:** complex

### Approach 2b: Lightweight Custom Hooks (No Tapable)
- **How it works:** Define a simple `EventEmitter`-like hook system with typed event names. The CLI defines hooks as an object: `{ beforeRun: Hook<Context>, afterRun: Hook<Context & Result>, onError: Hook<Error> }`. Plugins receive this hooks object and subscribe. Commands are registered via `hooks.registerCommand.tap(commandDef)`. No external dependency — the hook system is ~50 lines of typed code.
- **Gains:** All the conceptual benefits of hooks without the complexity of tapable's many hook types. Easy to understand for plugin authors — it's just typed events. Minimal dependency. Full control over semantics.
- **Gives up:** No waterfall/bail/loop semantics unless you build them. Fewer guardrails — plugin ordering and conflict resolution is manual. Less battle-tested than tapable.
- **Shines when:** The CLI needs modest extensibility beyond just commands (e.g., pre-run auth checks, post-run telemetry) but doesn't need webpack-level pipeline control.
- **Risks:** May need to grow into tapable-like complexity over time, resulting in a half-baked reimplementation. TypeScript typing of generic event systems can get hairy.
- **Complexity:** moderate

---

## Paradigm 3: Protocol/Interface Contract (The "Abstract Class Model")
**Core bet:** Plugins implement a well-defined TypeScript interface or extend a base class. The contract is explicit and compiler-enforced. Type safety is the primary feature.

This paradigm defines the plugin API as a TypeScript type that plugins must conform to. Instead of conventions or events, the contract is structural — a plugin is valid if and only if it satisfies the type. This is the most TypeScript-native approach: leverage the type system as the primary enforcement mechanism.

### Approach 3a: Interface-Driven Plugin Contract
- **How it works:** Define a `Plugin` type:
  ```typescript
  type Plugin = {
    name: string;
    version: string;
    commands: CommandDefinition[];
    hooks?: Partial<PluginHooks>;
    activate?: (context: PluginContext) => Promise<void>;
    deactivate?: () => Promise<void>;
  };
  ```
  Plugins are npm packages that default-export an object satisfying this type. The CLI loads plugins listed in a config file (e.g., `.myclirc.json`), imports each, validates the export shape at runtime (since TypeScript types are erased), and registers commands/hooks.
- **Gains:** The plugin contract is self-documenting — the type IS the spec. Plugin authors get full IDE autocomplete and compile-time error checking. Easy to version (change the type, bump the major version). Runtime validation can use a schema derived from the type (via zod, io-ts, or similar). Clean separation between "what a plugin provides" and "how the CLI discovers it."
- **Gives up:** Requires a configuration file listing plugins (no auto-discovery). TypeScript types don't survive compilation, so you need runtime validation too. Less magical — plugin authors must explicitly list their plugin in the CLI's config.
- **Shines when:** Type safety and API clarity are paramount. The team wants the plugin API to be a first-class, documented, versioned contract. The number of plugins per installation is small to medium (manual config is fine).
- **Risks:** Configuration file management becomes the user's problem. Without auto-discovery, the "install a plugin" UX requires two steps (npm install + add to config).
- **Complexity:** simple to moderate

### Approach 3b: Abstract Base Class with Registration
- **How it works:** Define an abstract `PluginBase` class that plugins extend:
  ```typescript
  abstract class PluginBase {
    abstract name: string;
    abstract commands: CommandDefinition[];
    onActivate?(ctx: PluginContext): Promise<void>;
    onDeactivate?(): Promise<void>;
  }
  ```
  Plugins export a class extending `PluginBase`. The CLI instantiates each plugin class, calls lifecycle methods, and registers commands. The base class can include shared utilities (logging, config access) that plugins inherit.
- **Gains:** Enforces structure via `abstract` members — forgetting a required method is a compile error. Base class can provide shared behavior (logging, config access, error formatting). Familiar OOP pattern for developers coming from Java/C#/.NET ecosystems. `instanceof` checks work at runtime for validation.
- **Gives up:** Classes are more opinionated than interfaces — some developers dislike the OOP style. Inheritance hierarchies can become rigid. Harder to compose plugins from smaller pieces. Testing requires instantiating the class with mock dependencies.
- **Shines when:** The plugin needs access to shared infrastructure (logging, config, HTTP clients) that the base class provides. Plugin authors benefit from the guard rails of abstract members.
- **Risks:** "Fragile base class" problem — changes to `PluginBase` can break all plugins. Encourages deep inheritance when composition would be more appropriate.
- **Complexity:** moderate

---

## Paradigm 4: Functional/Middleware Composition (The "Express/Fastify Model")
**Core bet:** Plugins are functions, not objects or classes. Extensibility comes from function composition, not inheritance or events. The plugin surface is minimal by design.

This paradigm treats the CLI as a pipeline and plugins as middleware functions that can transform, extend, or short-circuit the pipeline. This is the pattern used by Express, Koa, Fastify, and many modern HTTP frameworks. Applied to a CLI, each "plugin" is a function that receives a context and a `next` function, and can add commands, modify behavior, or wrap execution.

### Approach 4a: Middleware Pipeline
- **How it works:** The CLI execution is a pipeline: `parse -> resolve -> validate -> execute -> output`. Plugins are middleware functions inserted into this pipeline:
  ```typescript
  type Middleware = (ctx: CLIContext, next: () => Promise<void>) => Promise<void>;
  type Plugin = {
    name: string;
    middleware: Middleware[];
    commands?: CommandDefinition[];
  };
  ```
  Plugins can add commands (which get merged into the resolution phase) and/or add middleware that wraps command execution.
- **Gains:** Extremely composable — middleware can be stacked, reordered, conditionally applied. Familiar pattern for Node.js developers. Easy to implement cross-cutting concerns (logging, timing, error handling). Testable — each middleware is a pure-ish function.
- **Gives up:** "Adding a command" doesn't map naturally to middleware — you need a side-channel for command registration. Plugin ordering matters and is implicit. Can be harder to reason about than explicit hooks.
- **Shines when:** The primary plugin use case is wrapping or augmenting command execution (auth, logging, telemetry, rate limiting) rather than just adding new commands.
- **Risks:** If the primary need is "add custom commands," the middleware abstraction is over-engineered. Middleware ordering bugs are subtle and hard to debug.
- **Complexity:** moderate

### Approach 4b: Functional Plugin Builders (Fastify-Inspired Encapsulation)
- **How it works:** Inspired by Fastify's plugin encapsulation, plugins are functions that receive a CLI "app" instance and decorate it:
  ```typescript
  type PluginFn = (app: CLIApp, options: unknown) => Promise<void>;
  ```
  Each plugin runs in an encapsulated scope — decorations (added commands, config) are visible to child plugins but not siblings. The CLI builds a DAG of plugins with controlled visibility.
- **Gains:** Encapsulation prevents plugin conflicts — plugins can't accidentally overwrite each other's state. Declarative dependency management (plugin A depends on plugin B). Elegant composition of plugin trees.
- **Gives up:** The encapsulation model is powerful but unfamiliar to most CLI developers. Building the DAG resolution and scope management is non-trivial. May be over-engineered for a CLI where plugins just add commands.
- **Shines when:** Plugin-to-plugin interaction and shared services are important. The CLI needs to support complex plugin ecosystems where plugins depend on each other.
- **Risks:** Complexity of the encapsulation system may not justify itself for a command-centric CLI. Debugging scope issues is confusing.
- **Complexity:** complex

---

## Paradigm 5: Sandboxed Execution (The "WASM/Process Isolation Model")
**Core bet:** Safety and isolation matter more than performance or DX. Plugins run in a sandbox (WebAssembly, child process, or VM) and can't corrupt the host CLI.

This paradigm prioritizes security by running plugins in an isolated execution environment. This is the model used by VS Code extensions (separate process), Shopify Functions (WASM), and Figma plugins (V8 isolate). It trades performance and DX for strong isolation guarantees.

### Approach 5a: WebAssembly via Extism
- **How it works:** Plugins are compiled to WASM and loaded via the Extism framework. Plugin authors write TypeScript, compile to WASM using Extism's PDK, and the CLI loads the WASM module in a sandboxed runtime. Communication happens via Extism's host-guest protocol (JSON messages over shared memory).
- **Gains:** True sandboxing — plugins can't access the filesystem, network, or host memory unless explicitly allowed. Language-agnostic — plugins could be written in Rust, Go, etc. Deterministic execution. Memory isolation.
- **Gives up:** Massive DX friction — TypeScript authors must use a WASM compilation pipeline. Limited access to Node.js APIs (no `fs`, `path`, `child_process`). Communication overhead for every host-guest interaction. WASM ecosystem for TypeScript is immature. Plugin debugging is significantly harder.
- **Shines when:** Security is a hard requirement (multi-tenant environments, untrusted plugin authors). The CLI handles sensitive data.
- **Risks:** The DX cost will suppress plugin ecosystem growth — few third-party developers will tolerate the WASM compilation workflow for a CLI plugin. TypeScript-to-WASM tooling is still rough.
- **Complexity:** complex

### Approach 5b: Child Process Isolation
- **How it works:** Each plugin runs as a separate Node.js child process. The CLI and plugin communicate via IPC (JSON-RPC over stdin/stdout or a Unix socket). The CLI spawns the plugin process, sends it the command context, and receives the result. Plugins are regular npm packages with a process entry point.
- **Gains:** Strong isolation (process crash doesn't kill the CLI). Plugins can't access the CLI's memory. Plugins can use any Node.js APIs within their process. Timeout/resource limits are enforceable via OS mechanisms.
- **Gives up:** Significant startup latency per plugin invocation (spawning a Node.js process: 50-150ms). Serialization overhead for all communication. Can't share in-memory state. IPC protocol becomes part of the API surface. Much harder to provide rich TypeScript types across the process boundary.
- **Shines when:** Plugin stability/isolation is critical and the performance budget is generous. The CLI is a long-running daemon where plugin processes can be pre-warmed.
- **Risks:** The 50-150ms child process startup penalty is unacceptable for a responsive CLI. IPC serialization limits what data plugins can access. The DX of debugging across process boundaries is painful.
- **Complexity:** complex

---

## Non-obvious Options

### Hybrid: Interface Contract + Lazy Discovery
Combine Paradigm 3's type-safe interface with Paradigm 1's auto-discovery. Plugins are npm packages following a naming convention AND conforming to a TypeScript interface. Discovery is automatic (scan `node_modules`), but the loaded plugin is validated against a runtime schema (derived from the TypeScript type via zod). This gets the best of both: zero-config installation UX plus strong type safety. The naming convention handles discovery; the interface handles correctness.

### Reframing: Don't Build a Plugin System — Use Package Scripts
What if "extending the CLI" just means the CLI can be configured to run arbitrary npm scripts as commands? Define a `"mycli"` field in the user's `package.json` that maps command names to npm scripts or executables. No plugin API, no discovery, no hooks — just configuration-driven delegation. This is what npm scripts, Makefile targets, and package.json `"bin"` fields already do. It's the laziest possible solution that still meets the MUST criteria (technically). Plugin authors just publish an npm package with a `bin` entry, and users add it to their config.

**Why this matters:** The "plugin system" might be over-engineering what's actually needed. If the goal is "third parties add commands," the simplest approach is "third parties publish executables, and the CLI knows where to find them." This is how git works — `git foo` falls back to `git-foo` on PATH.

### Hybrid: Git-Style PATH Lookup + Type-Safe SDK
Inspired by git's extension model: the CLI looks for executables named `mycli-*` on PATH. But unlike git, it also provides a TypeScript SDK (`@mycli/sdk`) that plugins import to get typed argument parsing, help generation, and output formatting. The SDK is optional — plugins can be shell scripts — but the SDK makes TypeScript plugins first-class. Discovery is filesystem-based (PATH scan), not npm-based.

### Configuration-as-Code Plugins (ESLint Flat Config Style)
Plugins aren't separate packages at all — they're functions defined in the CLI's config file:
```typescript
// mycli.config.ts
import { defineConfig, defineCommand } from '@mycli/core';
export default defineConfig({
  plugins: [
    {
      name: 'my-custom-stuff',
      commands: [
        defineCommand({
          name: 'deploy',
          args: { env: { type: 'string', required: true } },
          run: async ({ args }) => { /* inline implementation */ }
        })
      ]
    }
  ]
});
```
This eliminates the entire discovery/loading/distribution problem — plugins are just objects in a config file. For sharing, extract them to npm packages that export plugin objects.

## Eliminated Early

- **Lua/scripting language embedding:** Using an embedded scripting language (Lua, Deno) for plugins. Eliminated because it introduces a language boundary that contradicts the TypeScript-first requirement. Plugin authors would need to learn a different language. The DX cost is too high for the isolation benefit.

- **GraphQL-based plugin API:** Exposing the CLI's capabilities as a GraphQL schema that plugins query/mutate. Eliminated because GraphQL is designed for client-server communication, not in-process extensibility. The abstraction mismatch would create unnecessary complexity.

- **Dynamic code evaluation (eval/vm):** Loading plugins as strings and evaluating them in a Node.js VM context. Eliminated because of severe security risks, poor debugging experience, and lack of TypeScript type safety. The `vm` module provides limited isolation and is not recommended for security-critical use cases.
