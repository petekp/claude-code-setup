# Prototype Comparison: CLI Plugin System

## Comparison criteria (defined before prototyping)

1. **Lines of code for host plugin infrastructure** -- how much code does the host CLI need?
2. **Lines of code for a sample plugin** -- how much does a plugin author write?
3. **Type safety quality** -- compile-time hook name validation, flag typing, service typing?
4. **Extensibility headroom** -- how hard to add a new hook or service without breaking existing plugins?
5. **Startup path clarity** -- can the plugin loading flow be understood in under 2 minutes?
6. **Plugin isolation quality** -- graceful recovery from plugin errors?

## Results

### Prototype A: Explicit Config + Dynamic Import

- **Location:** `prototypes/a-config-import/`
- **Host infrastructure:** 66 lines (SDK types) + 115 lines (host logic, excluding comments/blanks) = ~181 total lines
- **Sample plugin:** ~45 lines of actual code (excluding comments)
- **Type safety:**
  - `definePlugin()` provides full inference on the plugin object literal
  - Hook names are string keys of the `LifecycleHooks` type -- TypeScript catches misspelled keys at compile time
  - Flag definitions are typed but flag *values* are `ParsedFlags` (a loose record type) -- no per-command flag inference
  - Verdict: **Good but not great.** The main gap is that `run(flags, ctx)` doesn't know the specific flags defined for that command.
- **Extensibility headroom:**
  - Adding a new hook: add a key to `LifecycleHooks` type. Existing plugins are unaffected (they use `Partial<LifecycleHooks>`)
  - Adding a new service: add a field to `PluginContext`. Existing plugins see the new field. This is fine for additive changes but risky for structural changes (what if a service needs initialization?)
  - Verdict: **Good for simple additions, fragile for structural changes.** The flat `PluginContext` object conflates all services into one bag.
- **Startup path clarity:**
  - Config file -> iterate plugin paths -> `import()` each -> validate shape -> register commands/hooks -> done
  - Verdict: **Excellent.** The simplest mental model. A developer can trace the entire flow in 30 seconds.
- **Plugin isolation:**
  - try/catch around `import()`, command `run()`, and each hook invocation
  - A plugin that throws during load is skipped with a warning
  - A plugin whose hook throws doesn't block other hooks
  - Verdict: **Good.** Straightforward error boundaries.
- **Surprises:**
  - The `PluginContext` is shared across all plugins and all commands. If a plugin mutates the logger or config, it affects everyone. This is a subtle source of bugs. Prototype B avoids this with per-request `CommandContext` objects.
  - The flat plugin object (`{ manifest, commands, hooks }`) makes it awkward to access shared services from within hook handlers -- the hook signature gets `PluginContext` but there's no way to inject custom services.

### Prototype B: Custom Lightweight Framework

- **Location:** `prototypes/b-custom-framework/`
- **Host infrastructure:** 96 lines (SDK types) + 130 lines (host logic, excluding comments/blanks) = ~226 total lines
- **Sample plugin:** ~50 lines of actual code (excluding comments)
- **Type safety:**
  - `definePlugin()` provides full inference on registration object
  - `host.hook('preRun', ...)` is fully typed -- the `HookMap` type maps event names to parameter tuples. Passing `'prerun'` (lowercase) is a compile error. The handler parameters are inferred from the event name.
  - `host.getService(LoggerService)` returns `Logger` -- the `ServiceToken<T>` pattern carries the type through. No casting needed.
  - Flag values have the same limitation as Prototype A (loose `ParsedFlags` record)
  - Verdict: **Very good.** The typed hooks and typed services are a meaningful improvement over Prototype A. Plugin authors get autocomplete on hook names and service types.
- **Extensibility headroom:**
  - Adding a new hook: add a key to `HookMap`. Existing plugins are unaffected (they only hook events they care about).
  - Adding a new service: create a new `ServiceToken` and register it on the host. Existing plugins are unaffected (they only request services they need). No change to any existing types.
  - Verdict: **Excellent.** The `ServiceToken` pattern and `HookMap` type are both open for extension without modifying existing code. This is the Open-Closed Principle working well.
- **Startup path clarity:**
  - Config file -> iterate plugin paths -> `import()` each -> create scoped `PluginHost` -> call `register(host)` -> plugin calls `host.registerCommand()` and `host.hook()` -> done
  - Verdict: **Good.** One more indirection than Prototype A (the `register(host)` call), but still straightforward. The scoped `PluginHost` creation is the key step -- each plugin gets its own host view.
- **Plugin isolation:**
  - try/catch around `import()`, `register()`, command `run()`, and each hook invocation
  - Each plugin gets a scoped `PluginHost` so it can only register its own commands/hooks
  - A plugin that throws during `register()` is skipped with a warning
  - Verdict: **Good.** Same quality as Prototype A, plus the scoped host prevents accidental cross-plugin interference.
- **Surprises:**
  - The `register(host)` pattern is more flexible than it first appears. Because the plugin receives a host *object* rather than exporting a static *data structure*, the plugin can do conditional registration: `if (config.verbose) host.hook('preRun', ...)`. This is hard to do with Prototype A's static plugin object.
  - The ~45 extra lines over Prototype A are mostly the `ServiceToken` system and the `HookMap` type. These are "type-level" code -- they add zero runtime overhead but provide substantial DX benefits.
  - The `register()` function creates a closure scope, so plugins naturally have private state that persists across command invocations. In Prototype A, achieving this requires module-level variables.

### Prototype C: oclif

- **Location:** `prototypes/c-oclif/`
- **Host infrastructure:** ~5 lines of actual code (bin/run.ts) + package.json config. Everything else is provided by the framework.
- **Sample plugin:** ~40 lines for the command class + package.json manifest + directory structure convention (src/commands/, src/hooks/)
- **Type safety:**
  - oclif provides full TypeScript support -- `Command` base class, `Flags` builder, `Hook` type
  - Flag parsing is type-safe: `await this.parse(Deploy)` returns correctly-typed flags
  - Hook handlers are typed per oclif's `Hook` generic
  - Verdict: **Very good.** oclif has invested heavily in TypeScript. The `this.parse()` pattern gives per-command flag inference, which is better than both A and B.
- **Extensibility headroom:**
  - Adding new hooks: requires understanding oclif's hook system and conventions
  - Adding new services: oclif provides `this.config` and `this.log()` but custom services require workarounds (no built-in DI)
  - Verdict: **Mixed.** oclif is extensible within its design boundaries but fights you outside them. Adding a custom service registry on top of oclif is possible but feels like fighting the framework.
- **Startup path clarity:**
  - oclif has sophisticated lazy loading with command manifests, plugin discovery, and module resolution. The startup path involves: `execute()` -> load config -> resolve plugins -> load command manifest -> find matching command -> lazy-load command class -> `parse()` -> `run()`
  - Verdict: **Poor for debugging, excellent for users.** The abstraction works well when everything is happy. When something goes wrong (plugin not found, hook not firing), understanding the internals requires reading oclif source code.
- **Plugin isolation:**
  - oclif catches command errors and displays formatted error output
  - Plugin loading failures are reported but don't crash the CLI
  - Verdict: **Good.** oclif has battle-tested error handling.
- **Surprises:**
  - The class-based command pattern (`extends Command`) feels heavyweight for simple commands. A command that just calls an API endpoint still needs a class with static properties and an async `run()` method.
  - oclif's dependency tree is substantial: `@oclif/core` alone pulls in 50+ transitive dependencies. For a CLI tool that values a small footprint, this is concerning.
  - The `@oclif/plugin-plugins` meta-plugin gives users `mycli plugins:install <name>` for free -- a significant UX win that's hard to replicate.
  - oclif's per-command flag typing (via `this.parse(Deploy)`) is genuinely better than the loose `ParsedFlags` in Prototypes A and B. This is a solvable problem in A/B but would require generics on `CommandDefinition`.

## Verdict

**The key differentiating question was:** How much code does the custom framework (B) actually require, and does the explicit-config approach (A) feel too bare-bones when you try to use lifecycle hooks and shared services?

**Answer:** The gap between A and B is ~45 lines of type-level code (ServiceToken, HookMap), and B's advantages are meaningful:

1. **Typed hooks catch bugs at compile time** that A catches at runtime. When a plugin author writes `host.hook('preRn', ...)` in B, the compiler flags it. In A, the same typo in `hooks: { preRn: ... }` would be caught by `Partial<LifecycleHooks>` type checking -- but only if the key is wrong. If a hook *handler* has the wrong signature, A's `Partial` is more permissive.

2. **The ServiceToken pattern in B is genuinely more extensible** than A's flat PluginContext. Adding a new service in B is a zero-breaking-change operation (publish a new token). In A, it requires adding a field to PluginContext, which may or may not be a breaking change depending on how plugins consume it.

3. **The register(host) pattern enables conditional registration and private state**, which the static plugin object in A cannot do.

4. **oclif (C) provides the most features for the least custom code** but at the cost of framework lock-in and a large dependency tree. Its per-command flag typing is a genuine advantage. However, oclif's opinions about class-based commands and directory structure conventions add friction for a team that wants a lightweight, functional style.

**Bottom line:** Prototype B (Custom Lightweight Framework) provides the best balance of power, simplicity, and control. It's ~45 lines more than A but meaningfully better in type safety and extensibility. It's ~200 lines more than C's custom code but avoids framework lock-in and a 50+ package dependency tree.

## Updated understanding

1. **Per-command flag typing matters more than expected.** oclif's `this.parse(Deploy)` returning correctly-typed flags is a real DX win. Both A and B should invest in solving this (via generics on CommandDefinition) before shipping.

2. **The register(host) pattern is the key architectural insight.** Giving each plugin a scoped host object (rather than having plugins export static objects) enables: conditional registration, private plugin state, scoped capabilities, and future extensibility (the host can add methods without breaking plugins that don't use them).

3. **Service injection via typed tokens is worth the ~20 extra lines.** It cleanly separates "what services exist" from "which services a plugin uses" and makes the system open for extension.

4. **oclif's `plugins:install` meta-plugin is a significant UX feature** that the custom approaches don't have. Consider building this as a first-party command in the custom framework.

5. **Convention-based auto-discovery and explicit config are not mutually exclusive.** The winning approach should support both: auto-discover `mycli-plugin-*` packages AND respect explicit plugin lists in config. The hybrid approach from the Non-obvious section of SOLUTION_MAP.md is the right default.
