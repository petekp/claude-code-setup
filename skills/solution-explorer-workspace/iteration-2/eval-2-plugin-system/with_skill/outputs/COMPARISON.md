# Prototype Comparison: CLI Plugin System for Third-Party Extensibility

## Comparison Criteria (defined before prototyping)

1. **Plugin author DX for the "add a command" use case**: How many lines does a plugin author write to add a simple command? How intuitive is the pattern? Does IDE autocomplete guide them?

2. **Cross-cutting concern ergonomics**: How naturally does each prototype handle the "add telemetry/timing/auth" use case — a plugin that modifies behavior without adding commands?

3. **Type safety depth**: How much of the plugin contract is compiler-enforceable? Where do runtime errors sneak in despite TypeScript types?

4. **Hidden complexity / footguns**: What subtle bugs can a plugin author introduce? How easy are they to debug?

5. **Extensibility ceiling**: If requirements grow (plugin-to-plugin deps, conditional loading, async init), how naturally does each prototype accommodate that?

## Results

### Prototype A: Interface Contract + Lazy Discovery Hybrid
- **Location:** `prototypes/a/`
- **Lines of code:** ~150 (core), ~25 (example plugin)
- **Criterion 1 (Command DX):** Excellent. A plugin is a plain object with a `commands` array. Writing a command is the most natural possible shape — an object with `name`, `description`, `args`, and `run`. No classes, no decorators, no registration ceremony. IDE autocomplete on the `Plugin` type guides every field. **This is the winner on command authoring DX.** A minimal plugin is ~15 lines:
  ```typescript
  const plugin: Plugin = {
    name: "my-plugin", version: "1.0.0", apiVersion: 1,
    commands: [{
      name: "greet",
      description: "Say hello",
      run: async (ctx) => ctx.logger.info("Hello!")
    }]
  };
  export default plugin;
  ```

- **Criterion 2 (Cross-cutting):** Adequate but secondary. Hooks exist (`beforeRun`, `afterRun`, `onError`) but they feel bolted-on — they're optional fields on the plugin object. A plugin that ONLY provides hooks (no commands) is an odd shape — you'd have an empty `commands: []` array. The hooks have no ordering guarantees beyond plugin load order.

- **Criterion 3 (Type safety):** Strong. The `Plugin` type drives everything. Runtime validation (`validatePlugin`) catches malformed plugins at load time. The `apiVersion` field enables compatibility checking. However, the `args` field on `CommandContext` is `Record<string, unknown>` — argument types aren't narrowed based on the command's `ArgDef`. This is a known limitation of TypeScript's type system (you'd need conditional types or code generation to narrow further).

- **Criterion 4 (Footguns):** Low. The biggest footgun is the auto-discovery mechanism: if two plugins register a command with the same name, the first one wins (with a warning). This is deterministic but may surprise plugin authors who don't realize their command name is taken. The `validatePlugin` function is a runtime check that could miss edge cases if not exhaustive.

- **Criterion 5 (Extensibility ceiling):** Moderate. Adding plugin-to-plugin dependencies would require extending the `Plugin` type with a `dependencies` field and building a resolution order. Conditional loading is natural (just filter discovered packages before importing). Async init is already supported (`activate`). The main limitation is that the hooks are a fixed set — adding new hook points requires changing the type.

- **Surprises:** The auto-discovery code for `node_modules` is deceptively simple in the prototype but would be complex in production. It needs to handle: pnpm symlinks, Yarn PnP (no `node_modules`), monorepo workspace hoisting, and scoped packages with nested directories. This is ~200 lines of production code vs the ~20 lines in the prototype. This is an implementation detail, not an architecture issue, but it's a real cost.

### Prototype B: Lightweight Custom Hooks
- **Location:** `prototypes/b/`
- **Lines of code:** ~160 (core + hook system), ~30 (example plugin)
- **Criterion 1 (Command DX):** Adequate but indirect. Commands are registered inside an `init` hook callback, not declared as data. A plugin author must understand hooks before they can add a command:
  ```typescript
  const plugin: PluginDefinition = {
    name: "my-plugin", version: "1.0.0",
    apply(hooks) {
      hooks.init.tap("my-plugin", async ({ registerCommand }) => {
        registerCommand({
          name: "greet",
          description: "Say hello",
          run: async (ctx) => ctx.logger.info("Hello!")
        });
      });
    }
  };
  ```
  This is ~20 lines — 33% more than Prototype A for the same result. More importantly, the indirection (apply -> hooks.init.tap -> registerCommand) is a conceptual barrier for new plugin authors. The `tap("my-plugin", ...)` call requires a name parameter that feels redundant.

- **Criterion 2 (Cross-cutting):** Excellent. This is the clear winner for cross-cutting concerns. Hooks are the native abstraction — adding timing, auth, telemetry, or error handling is natural and first-class. The hook taxonomy (`beforeResolve`, `beforeRun`, `afterRun`, `onError`, `shutdown`) maps precisely to CLI lifecycle stages. A telemetry plugin is clean:
  ```typescript
  hooks.afterRun.tap("telemetry", async (ctx) => {
    track(ctx.command, ctx.duration);
  });
  ```
  The `BailHook` for error handling is particularly elegant — it allows error handlers to claim an error without preventing others from observing it.

- **Criterion 3 (Type safety):** Good. Each hook is typed with a specific payload type, so `hooks.beforeRun.tap` knows its callback receives a `RunContext`. The `CLIHooks` type makes the full hook surface discoverable via autocomplete. However, the `PluginDefinition.apply` function signature is `(hooks: CLIHooks) => void`, which means the compiler can't verify that a plugin actually taps into meaningful hooks — a plugin with an empty `apply` body is valid.

- **Criterion 4 (Footguns):** Moderate. The main footgun is hook handler ordering — hooks fire in registration order, which depends on which plugin was `.use()`'d first. If Plugin A's `beforeRun` hook modifies context that Plugin B depends on, swapping their order breaks things silently. The prototype has a bug: the `telemetryPlugin` example references `ctx` outside its scope (line references `ctx.logger.error` but `ctx` is shadowed). This is a prototype error, but it illustrates that hook closures are prone to variable shadowing bugs.

- **Criterion 5 (Extensibility ceiling):** High. Adding new hook points is trivial — add a new `Hook<T>` to `CLIHooks`. The hook system naturally supports async operations. Adding priority ordering, conditional hook execution, or waterfall semantics (return value of one handler feeds into the next) is straightforward. The BailHook pattern already demonstrates how different hook semantics can coexist. This is the most extensible prototype.

- **Surprises:** The hook system itself is surprisingly small (~40 lines), which is a positive surprise. But the indirection it introduces for the common case (command registration) is a real DX cost. Every plugin author must learn the hook lifecycle before they can write "Hello World." For an ecosystem that's starting from zero plugins, this learning curve could suppress adoption.

### Prototype C: Middleware Pipeline
- **Location:** `prototypes/c/`
- **Lines of code:** ~140 (core + compose), ~25 (example plugin)
- **Criterion 1 (Command DX):** Good. The `app.command()` pattern is clean and familiar:
  ```typescript
  const plugin: PluginDefinition = {
    name: "my-plugin", version: "1.0.0",
    setup(app) {
      app.command({
        name: "greet",
        description: "Say hello",
        run: async (ctx) => ctx.logger.info("Hello!")
      });
    }
  };
  ```
  This is ~15 lines — tied with Prototype A. The `app.command()` method feels natural (similar to Express's `app.get()`). The `setup` function gives plugins access to a controlled `CLIApp` surface rather than the full CLI. **Close second to Prototype A on command DX.**

- **Criterion 2 (Cross-cutting):** Good, with caveats. Middleware is a natural fit for wrapping behavior:
  ```typescript
  app.use(async (ctx, next) => {
    const start = Date.now();
    await next();
    console.log(`${ctx.command} took ${Date.now() - start}ms`);
  });
  ```
  The `next()` pattern is familiar to Express/Koa developers. Short-circuiting (not calling `next()`) enables auth gates and rate limiting. However, the middleware pattern doesn't clearly distinguish between "before command" and "after command" hooks — it's all wrapped in one function, and the distinction depends on whether code is before or after `await next()`.

- **Criterion 3 (Type safety):** Good. The `CLIApp` type constrains what plugins can do. The `CLIContext` type provides strong typing for middleware and commands. The `state` Map is typed as `Map<string, unknown>`, which means inter-middleware communication is untyped — any middleware can put anything into state, and consumers must cast.

- **Criterion 4 (Footguns):** High. The middleware pattern has three significant footguns:
  1. **Ordering**: Middleware runs in registration order. The error handler MUST be first; auth MUST come before commands; timing wraps from outside. Getting this wrong produces subtle bugs. The prototype's comments (`// First: catches all errors`, `// Third: auth gate`) are needed because the system doesn't enforce ordering.
  2. **Forgetting `next()`**: If a middleware forgets to call `next()`, the pipeline silently stops. There's no error — the command just doesn't run. This is the most common Express middleware bug and it's extremely confusing to debug.
  3. **Shared mutable state**: The `state` Map enables middleware-to-middleware communication, but it's untyped and mutable. If the auth middleware writes `state.set("authToken", token)` and a later middleware reads `state.get("authToken")`, the contract is entirely implicit.

- **Criterion 5 (Extensibility ceiling):** Moderate. Middleware composition handles most use cases (timing, auth, error handling, logging). But adding plugin-to-plugin dependencies doesn't map naturally — middleware is a linear chain, not a graph. Conditional middleware (skip auth for certain commands) requires the middleware itself to check the command name, which is boilerplate. The `compose` function doesn't support removing or reordering middleware after registration, which limits dynamic configuration.

- **Surprises:** The `compose` function (Koa-style middleware composition) is elegant at ~15 lines. But the prototype revealed that command registration and middleware are two separate concerns awkwardly sharing the same `setup` function. A plugin that only adds commands doesn't use `app.use()` at all — the middleware pipeline is irrelevant to it. This means the middleware abstraction adds conceptual overhead for the most common use case without benefit. Conversely, a pure middleware plugin (timing, auth) doesn't use `app.command()`. The two concerns don't compose — they coexist.

## Verdict

The key differentiating question was: **Is the primary use case "add commands" or "modify behavior"?**

Prototyping reveals that the answer matters less than expected, because:

- **Prototype A** (Interface + Discovery) handles both use cases, but commands are first-class and hooks are second-class.
- **Prototype B** (Lightweight Hooks) handles both, but everything is mediated through hooks — even commands. This makes hooks first-class but commands second-class.
- **Prototype C** (Middleware Pipeline) handles both, but they're separate mechanisms (commands vs middleware) that don't compose cleanly.

**Prototype A wins** because:
1. The most common use case (add a command) has the best DX.
2. The secondary use case (lifecycle hooks) is adequately supported.
3. The plugin contract is the simplest to explain: "export an object that matches this type."
4. Auto-discovery eliminates a configuration step from the user experience.
5. The architecture naturally supports lazy loading (only import the plugin that provides the invoked command).

**Prototype B is the runner-up** because its hook system provides the most powerful extensibility model. If the CLI evolves to need complex lifecycle management (like a build tool), Prototype B's architecture is more future-proof.

**Prototype C is eliminated** because the middleware pattern's ordering sensitivity and the awkward split between commands and middleware don't justify its advantages. The "familiar to Express developers" benefit is real but narrow, and the footguns are significant.

## Updated Understanding

Insights that weren't visible during analysis:

1. **The "add a command" DX is the most important metric.** The first 20 plugins in the ecosystem will be command-adding plugins. If that experience isn't dead simple, the ecosystem won't grow. Hooks, middleware, and lifecycle management can come later — they're a v2 concern.

2. **Auto-discovery complexity is real but solvable.** The `node_modules` scanning code is non-trivial in production, but the problem is well-understood (oclif, ESLint, and others have solved it) and the code is write-once infrastructure. It's not an ongoing maintenance burden.

3. **The hybrid approach (N1) is not just a compromise — it's genuinely superior** to either pure convention-based (1b) or pure interface-based (3a) approaches. Convention handles discovery; interface handles correctness. Each mechanism does what it's best at.

4. **Middleware is a poor fit for CLI plugins.** The middleware pattern shines when every request flows through the same pipeline (HTTP servers). In a CLI, most commands are independent — they don't share a pipeline. The middleware abstraction adds complexity without matching the domain.

5. **Hook systems scale well but hurt adoption.** Prototype B's hook system is the most extensible, but requiring plugin authors to learn a hook lifecycle before writing "Hello World" is a real barrier. This can be mitigated with a convenience wrapper, but the underlying complexity doesn't disappear.
