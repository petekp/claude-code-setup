# Decision: CLI Plugin System

## Selected approach

**Custom Lightweight Framework with register(host) pattern** -- a purpose-built plugin system where plugins receive a scoped `PluginHost` object and imperatively register commands, hooks, and service dependencies. Discovery uses a hybrid of npm naming convention auto-discovery and explicit config file listings. Loading is lazy: plugin manifests are read at startup, but command implementations are only imported when invoked.

## Evidence for this choice

- **From prototyping:** The custom framework (Prototype B) required only ~226 lines of infrastructure code (96 types + 130 host logic) while providing typed hooks, typed service injection, and scoped plugin isolation. This is ~45 lines more than the minimal approach (Prototype A) but delivers meaningfully better type safety and extensibility (COMPARISON.md, Prototype B results).

- **From research:** The `register(host)` pattern is the same architectural pattern used by webpack (tapable), VS Code (extension API), and ESLint (flat config rule objects). All three ecosystems have scaled to hundreds or thousands of plugins. The pattern's longevity across diverse codebases is strong evidence of its fitness. (Sources: webpack tapable documentation, VS Code Extension Host documentation, ESLint flat config migration guide.)

- **From analysis:** The custom framework scored highest across SHOULD criteria in the tradeoff matrix (ANALYSIS.md): fully custom lifecycle hooks, flexible discovery, explicit dependency injection for shared services, and good local development support via config file paths. It was the only approach that scored "excellent" on extensibility headroom.

- **From the key differentiating question:** The gap between the minimal approach (A) and the framework (B) is justified by three concrete advantages: (1) compile-time hook name validation via the `HookMap` type, (2) zero-breaking-change service additions via `ServiceToken`, and (3) conditional registration and private state via the `register()` closure. These are not theoretical -- they were demonstrated in the prototype code.

## Why not the alternatives

- **Approach 1a (Convention + Default Export):** The auto-discovery-only model requires scanning `node_modules` at startup, which is slow in monorepos (50-200ms one-time cost). The static plugin object (`{ manifest, commands, hooks }`) cannot support conditional registration or private state. These limitations are avoidable by adopting the hybrid discovery model and the `register(host)` pattern -- which is exactly what the selected approach does, making 1a a strict subset.

- **Approach 1b (Explicit Config + Dynamic Import):** The simplest viable approach (181 lines), but its flat `PluginContext` conflates all services into one bag, making structural changes risky. Adding a new service requires modifying the `PluginContext` type, which is a potentially breaking change for all plugins. The `ServiceToken` pattern in the selected approach solves this cleanly. Additionally, 1b's `Partial<LifecycleHooks>` type provides weaker hook typing than B's `HookMap` approach. Prototype comparison confirmed these as practical (not just theoretical) differences.

- **Approach 2a (Full oclif Adoption):** oclif provides the most features for the least custom code (~5 lines + config), but at the cost of framework lock-in, a 50+ package dependency tree, class-based command patterns, and directory structure conventions. Per-command flag typing via `this.parse()` is a genuine advantage, but this is solvable in the custom framework with generics. The team would be coupling their entire CLI architecture to Salesforce's maintenance decisions. For a greenfield tool where the team wants full control, this tradeoff is unfavorable.

- **Approach 3a (Subprocess JSON-RPC):** Eliminated in analysis phase. Fails the MUST criterion of <50ms startup per plugin (process spawn costs 40-80ms). The security benefits of process isolation are unnecessary given our assumption that plugins are trusted code.

- **Approach 3b (WASM Sandbox):** Eliminated in analysis phase. Fails the MUST criterion of TypeScript-native plugin authoring. The WASM toolchain for TypeScript is immature and imposes an unacceptable DX burden on plugin authors.

- **Approach 4a (Tapable-Style Hooks):** The pure hook model is more powerful than needed. Making command registration a hook (rather than a direct `registerCommand()` call) adds indirection without benefit for the primary use case. The selected approach incorporates hooks for lifecycle events but keeps command registration as a direct API call -- the best of both worlds.

- **Approach 5a (Declarative YAML):** Eliminated in analysis phase. Fails the MUST criterion of TypeScript-native plugin authoring.

## Implementation plan

### Phase 1: Core SDK package (`@mycli/plugin-sdk`)

1. Define the core types: `PluginHost`, `PluginRegistration`, `CommandDefinition`, `HookMap`, `ServiceToken`
2. Implement `definePlugin()` helper for type inference
3. Implement `createServiceToken()` for typed DI
4. Export built-in service tokens: `LoggerService`, `ConfigService`
5. Add generic flag typing to `CommandDefinition` so `run()` receives correctly-typed flags (learning from oclif's `this.parse()` advantage)

### Phase 2: Host plugin loader

1. Implement `PluginLoader` class:
   - `loadFromConfig(configPath)`: reads config file, imports listed plugins
   - `discoverByConvention(prefix)`: scans `node_modules` for `<prefix>-plugin-*` packages
   - Hybrid mode: merge config-listed plugins with auto-discovered ones (config takes precedence)
2. Implement lazy loading: read `PluginRegistration.name`/`version` eagerly, defer `register()` call until a command from that plugin is invoked (or invoke all `register()` calls but make command `run()` lazy)
3. Implement scoped `PluginHost` creation per plugin

### Phase 3: Command registry and execution

1. Implement `CommandRegistry`:
   - `register(cmd, pluginName)`: stores command with conflict detection
   - `resolve(name)`: finds command by name (supports `topic:command` namespacing)
   - `list()`: returns all registered commands with metadata (for help generation)
2. Implement command execution with lifecycle hooks:
   - `init` -> `preRun` -> command.run() -> `postRun` (or `onError`)
3. Implement error boundaries: try/catch per hook invocation and per command execution

### Phase 4: Service registry

1. Implement `ServiceRegistry`:
   - `register<T>(token, implementation)`: stores service by token symbol
   - `resolve<T>(token)`: retrieves service with type safety
2. Register built-in services: logger, config, and a basic HTTP client
3. Allow plugins to register services for other plugins (with ordering: plugins listed first can provide services to plugins listed later)

### Phase 5: Developer experience

1. Build `mycli create-plugin <name>` scaffolding command that generates a starter plugin project with:
   - `package.json` with correct naming convention
   - `src/index.ts` with `definePlugin()` boilerplate
   - `tsconfig.json` configured for the SDK
   - Basic test setup
2. Build `mycli plugins:list` command showing all discovered and loaded plugins
3. Build `mycli plugins:install <name>` command (npm install + add to config)
4. Ensure auto-generated help includes plugin commands

### Phase 6: Testing and documentation

1. Write integration tests for the full plugin lifecycle (discover -> load -> register -> execute)
2. Write a "Plugin Author Guide" documenting the SDK types, hook system, and service tokens
3. Build a sample plugin as a reference implementation
4. Test edge cases: malformed plugins, conflicting command names, missing services, circular plugin dependencies

## Known risks and mitigations

- **Risk:** The plugin API design may need changes after real-world usage reveals edge cases.
  **Mitigation:** Ship the SDK as v0.x initially, explicitly communicating that the API may change. Gather feedback from 3-5 early plugin authors before committing to v1.0. Use the `compatibleWith` semver range in plugin manifests to manage transitions.

- **Risk:** Lazy loading implementation may be more complex than expected (especially with TypeScript compilation and ESM/CJS interop).
  **Mitigation:** Start with eager loading (call all `register()` functions at startup) and add lazy loading as a performance optimization in a later release. Measure actual startup times before optimizing.

- **Risk:** Plugin-to-plugin service sharing creates implicit ordering dependencies.
  **Mitigation:** Phase 4 step 3 defines explicit ordering (config order). Document this clearly. Consider a "service not found" error message that suggests checking plugin load order.

- **Risk:** The hybrid discovery model (convention + config) may confuse users about which plugins are active.
  **Mitigation:** The `mycli plugins:list` command (Phase 5) should clearly show each plugin's source (auto-discovered vs. config-listed) and load status.

- **Risk:** Per-command flag typing (the generic `CommandDefinition<T>`) may be complex to implement correctly in TypeScript.
  **Mitigation:** Start with the loose `ParsedFlags` type (which works, just without per-command inference) and add generic flag typing as a follow-up. This is a DX improvement, not a functional requirement.
