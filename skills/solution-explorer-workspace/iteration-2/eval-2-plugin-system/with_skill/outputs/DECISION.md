# Decision: CLI Plugin System for Third-Party Extensibility

## Selected Approach

**Interface Contract + Lazy Discovery Hybrid** — Plugins are npm packages following a naming convention (`mycli-plugin-*`) that default-export a typed `Plugin` object. Discovery is automatic via `node_modules` scanning; correctness is enforced by runtime schema validation. Commands are declared as data (plain objects in an array), not registered imperatively.

## Evidence for This Choice

**From prototyping (COMPARISON.md):**
- Best DX for the primary use case: a minimal command plugin is ~15 lines of declarative TypeScript. No classes, decorators, or registration ceremony.
- The `Plugin` type drives IDE autocomplete for the entire plugin surface. Plugin authors get compile-time feedback on every field.
- Auto-discovery eliminates a configuration step from the installation UX: `npm install mycli-plugin-deploy` is all the user needs to do.
- Lazy loading is architecturally natural: the CLI only imports the plugin that provides the invoked command, keeping startup latency low.

**From research (SOLUTION_MAP.md):**
- Convention-based discovery is a proven pattern: oclif, ESLint (legacy config), Gatsby, and Nx all use it successfully. The edge cases (pnpm, Yarn PnP, monorepos) are well-documented and solvable.
- Interface-driven contracts are the most TypeScript-native approach. The type IS the spec — no separate documentation needed.
- npm is the dominant distribution mechanism for TypeScript packages; designing around it reduces friction for plugin authors.

**From analysis (ANALYSIS.md):**
- Passed all 6 MUST criteria. Estimated startup overhead of 15-30ms is well within the 100ms budget.
- Scored highest or tied for highest on 4 of 6 SHOULD criteria (scaffold, help integration, API versioning, local dev workflow).
- The hybrid approach eliminates the weaknesses of both pure convention-based (no type safety) and pure interface-based (no auto-discovery) approaches.

## Why Not the Alternatives

- **Lightweight Custom Hooks (Prototype B):** The hook system is the most extensible architecture, but it penalizes the most common use case. Prototyping showed that command registration via hooks requires 33% more code and introduces a conceptual indirection (apply -> hooks.init.tap -> registerCommand) that new plugin authors must understand before writing "Hello World." For a nascent ecosystem where the first 20 plugins will be command-adders, this learning curve is a real adoption barrier. **The hooks model should be adopted as a v2 enhancement if the ecosystem grows to need cross-cutting concerns, but it shouldn't be the foundational abstraction.**

- **Middleware Pipeline (Prototype C):** Prototyping revealed a fundamental mismatch between middleware and CLI plugins. Middleware assumes a shared pipeline (every request flows through every middleware), but CLI commands are independent — the "deploy" command doesn't need to flow through the "test" command's middleware. The ordering sensitivity (error handler MUST be first, auth MUST precede commands) is a significant footgun that produces silent failures. The `state` Map for inter-middleware communication is untyped, undermining TypeScript's value.

- **oclif Adoption (Approach 1a):** Eliminated on performance — 85-135ms baseline before user code runs, measured on modern hardware. Also introduces a heavy framework dependency whose maintenance trajectory is uncertain (tied to Salesforce's OSS priorities).

- **WASM/Extism (Approach 5a):** Eliminated on performance (100-300ms WASM init) and DX (TypeScript-to-WASM compilation pipeline is prohibitively complex for a CLI plugin ecosystem).

- **Child Process Isolation (Approach 5b):** Eliminated on performance (50-150ms per process spawn). Could be viable for daemon-mode CLIs with pre-warmed processes, but our architecture assumes a command-based CLI.

- **Package Scripts / PATH Lookup (Approaches N2, N3):** Eliminated because they can't provide typed plugin contracts — the primary value of a TypeScript-first plugin system.

## Implementation Plan

### Phase 1: Core Plugin Infrastructure (Week 1-2)

1. **Define the `Plugin` type and `@mycli/sdk` package.**
   - `Plugin`, `CommandDefinition`, `PluginContext`, `PluginHooks` types
   - `definePlugin()` helper function (identity function for type inference)
   - `defineCommand()` helper function
   - Runtime validation using zod schema derived from the types
   - Export everything from `@mycli/sdk` as the public API

2. **Build the discovery engine.**
   - Scan `node_modules` for packages matching `mycli-plugin-*` and `@*/mycli-plugin-*`
   - Handle scoped packages, symlinks, pnpm flat mode, and Yarn PnP
   - Cache discovery results to avoid re-scanning on every invocation
   - Support an explicit plugin list in `.myclirc.json` as an override (for when auto-discovery isn't sufficient)

3. **Build the lazy loader.**
   - Only `import()` the plugin that provides the invoked command
   - For `--help` and command listing: load plugin manifests (name, version, command names) without importing command implementations
   - Validate loaded plugins against the zod schema
   - Isolate plugin loading errors (a broken plugin doesn't prevent the CLI from running)

4. **Integrate with the CLI's command router.**
   - Merge plugin commands into the existing command registry
   - Built-in commands take precedence over plugin commands
   - First-registered plugin wins on command name conflicts (with a warning)
   - Plugin commands appear in `--help` output with their source

### Phase 2: Plugin Author Tooling (Week 3)

5. **Build `mycli create-plugin` scaffolding command.**
   - Generates a new npm package with the correct structure
   - Includes `tsconfig.json`, a sample command, and basic tests
   - Configurable plugin name and description

6. **Build local development workflow.**
   - `mycli plugins:link <path>` to link a local plugin for development
   - Support `npm link`/`yarn link` as an alternative
   - Document the edit-build-test cycle

7. **Build plugin management commands.**
   - `mycli plugins:list` — show installed plugins and their commands
   - `mycli plugins:install <name>` — npm install + validate
   - `mycli plugins:remove <name>` — npm uninstall

### Phase 3: Lifecycle Hooks (Week 4)

8. **Add optional lifecycle hooks to the Plugin type.**
   - `hooks.beforeRun`, `hooks.afterRun`, `hooks.onError`
   - Hooks are optional — command-only plugins don't need them
   - Hook execution order follows plugin discovery order
   - Error isolation: a hook failure logs a warning but doesn't prevent command execution

9. **Add plugin versioning and compatibility checking.**
   - `apiVersion` field on the `Plugin` type (start at `1`)
   - CLI validates `apiVersion` at load time
   - Incompatible plugins produce a clear error message with upgrade instructions

### Phase 4: Ecosystem Readiness (Week 5)

10. **Documentation.**
    - Plugin authoring guide
    - Plugin API reference (auto-generated from types)
    - Migration guide for when `apiVersion` bumps
    - Example plugins repository

11. **Testing infrastructure.**
    - Test harness for plugin authors (`@mycli/plugin-test-utils`)
    - Integration tests for plugin discovery, loading, and execution
    - Performance benchmarks for startup with N plugins installed

## Known Risks and Mitigations

- **Risk:** `node_modules` scanning breaks under Yarn PnP or pnpm with `node-linker=pnp`.
  **Mitigation:** Fall back to an explicit plugin list in `.myclirc.json` when `node_modules` doesn't exist. Also investigate using Node's `require.resolve()` / `import.meta.resolve()` instead of filesystem scanning, which works across package managers.

- **Risk:** Two plugins register a command with the same name, causing confusion.
  **Mitigation:** First-discovered plugin wins, with a clear warning message. Add a `mycli plugins:conflicts` command that shows all conflicts. In `.myclirc.json`, allow users to explicitly resolve conflicts by disabling specific plugin commands.

- **Risk:** Plugin authors publish breaking changes without bumping `apiVersion`.
  **Mitigation:** Runtime schema validation catches structural breaks. The `apiVersion` field should be checked automatically in CI via the scaffolded test suite. Document that `apiVersion` is a contract, not just a version number.

- **Risk:** The hook system (Phase 3) becomes inadequate for complex cross-cutting concerns, requiring a rewrite to the hooks-based architecture.
  **Mitigation:** Design the optional hooks as a simple, fixed set that can evolve. If the ecosystem grows to need webpack-style hook taxonomies, that's a v2 redesign informed by real usage data, not speculation. The interface-based architecture doesn't preclude adding richer hooks later.

- **Risk:** Startup latency grows as the number of installed plugins increases (scanning + manifest reading).
  **Mitigation:** Cache the plugin manifest index to disk (JSON file listing discovered plugins and their commands). Only re-scan when `node_modules` mtime changes. For the invoked command, only import that one plugin's code.

## Assumptions Made During This Exploration

Since this was a test run without a human to interact with, the following assumptions were made and documented:

1. The CLI uses a standard command-based architecture (`mycli <command> [args]`), not a REPL or daemon.
2. Plugins are distributed as npm packages — no custom registry.
3. The runtime is Node.js (not Deno or Bun).
4. No sandboxing requirement — plugins run with full trust.
5. Backward compatibility matters — the plugin API is a public contract.
6. The primary use case is "add custom commands" with lifecycle hooks as a secondary concern.
7. Near-term ecosystem size is 5-20 plugins, with potential growth to hundreds.
8. The 100ms startup overhead budget is a firm constraint (typical for CLI tools).
